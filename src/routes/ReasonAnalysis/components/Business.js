import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Cascader, Select, DatePicker, Radio, Button } from 'snk-web';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class Business extends PureComponent {
  state = {
    cascaderOption: [],  // 联级选择的数据
    userOnce: true,   // 在点击机构的时候只发送一次请求，后续不发送
    timer: {},      // 分析业务和参考业务的起保日期
    company: [],     // 选择的机构代码
    company1: {},    // 选择的机构名称
  }
  

  // 联级选择
  loadData = selectedOptions => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    
    setTimeout(() => {
      targetOption.loading = false;
      this.props.dispatch({
        type: 'analysis/get_Company',
        payload: targetOption.obj
      }).then(() => {
        const arr = [];
        const { get_CompanyData } = this.props.analysis;
        for(let i of get_CompanyData){
          arr.push({
            label: i.dimName,
            value: i.dimValue,
            isLeaf: false,
            obj: {
              appId: i.appId,
              dimColumn: i.dimColumn,
              dimLevel: i.dimLevel,
              dimName: i.dimName,
              dimTable: i.dimTable,
              dimValue: i.dimValue,
              themeId: i.themeId
            }
          })
        }
        targetOption.children = arr;
        this.setState({
          cascaderOption: [...this.state.cascaderOption],
        });
      }).catch(()=>{
        targetOption.isLeaf = true;
        this.setState({
          cascaderOption: [...this.state.cascaderOption],
        });
      })
    }, 300);
  };

  // 联级选择监听
  onChangeCompany = (value, targetOption, name) => {
    const { company, company1 } = this.state;
    company1[name] = value;
    company1[name + '+col'] = targetOption[0].obj.dimColumn;    // 这步是保存父级机构的dimColumn，以便回显后点击机构重新获取数据时能对应上
    for(let i of targetOption){
      // 把选择的机构存入状态中
      company[name] = {
        code: i.obj.dimValue,
        companyCol: i.obj.dimColumn
      }
    }
    
    let fieldValue;
    if(name === 'analyCompany1') fieldValue = 'analySelect1';
    else fieldValue = 'analySelect2';
    const nowValue = targetOption[targetOption.length - 1].label;
    this.props.form.setFieldsValue({ [fieldValue]: nowValue })
    this.setState({ company, company1 });
  }

  // 调用父组件方法
  onChangeRadio = (value) => {
    if (this.props.changeRadio) {
      this.props.changeRadio(value);
    }
  }

  // 点击机构的时候发送请求获取数据
  cascaderClick = () => {
    if(!this.state.userOnce) return;
    // console.log(111)
    this.props.dispatch({
      type: 'analysis/get_Company',
      payload: {
        dimColumn: "companycode",
        dimName: "",
        dimValue: "",
        themeId: 'mqbusiness',
        appId: 'attri',
        dimTable: "pub_its_company"
      }
    }).then(() => {
      let cascaderOption = [];
      // console.log(this.props.form.getFieldsValue())
      const { get_CompanyData } = this.props.analysis;
      const { company, company1 } = this.state;
      // console.log(company1)
      const analyCompany1 = this.props.form.getFieldValue('analyCompany1');
      const analyCompany2 = this.props.form.getFieldValue('analyCompany2');
      for(let i of get_CompanyData){
        cascaderOption.push({
          label: i.dimName,
          value: i.dimValue,
          isLeaf: false,
          obj: {
            appId: i.appId,
            dimColumn: i.dimColumn,
            dimLevel: i.dimLevel,
            dimName: i.dimName,
            dimTable: i.dimTable,
            dimValue: i.dimValue,
            themeId: i.themeId
          }
        })
      }
      // 这两个if处理回显的一个问题，该问题起因是机构点击后会重新获取数据，这个必然，所以点击后会强制性的修改界面的显示，
      // 为了应对界面变化，同时修改company1以保证界面和数据一致
      // company修改目的和company1一样
      if(analyCompany1.length > 0){
        company1.analyCompany1 = [analyCompany1[0]];
        company['analyCompany1'] = {
          code: analyCompany1[0],
          companyCol: company1['analyCompany1+col']
        }
        this.props.form.setFieldsValue({ analySelect1: cascaderOption[0].label })
      } 
      if(analyCompany2.length > 0){
        company1.analyCompany2 = [analyCompany2[0]];
        company['analyCompany2'] = {
          code: analyCompany2[0],
          companyCol: company1['analyCompany1+col']
        }
        this.props.form.setFieldsValue({ analySelect2: cascaderOption[0].label })
      } 
      this.setState({ cascaderOption, userOnce: false, company1, company })
    })
  }

  // 保险起期监听事件
  pickerChange(e, dateString, name){
    const { timer } = this.state;
    timer[name] = dateString;
    this.setState({ timer })
  }

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { getEndTime_PeriodData, getEndTime_ContentData, get_CompanyData, getpolicyYrData } = this.props.analysis;
    const formItemLayout = {
      labelCol: { span: 4 },
      perCol: { span: 20 },
    };
    const dataLayout = {
      labelCol: { span: 4 },
      perCol: { span: 12 }
    }
    const staticformItemLayout = {
      labelCol: { span: 2 },
      perCol: { span: 8 },
    };
    const comBox = {
      padding: 12,
      border: '1px dashed',
      position: 'relative',
      flex: '30%',
    }
    const comText = {
      position: 'absolute',
      top: '-15px',
      left: '50%',
      marginLeft: '-24px',
      background: '#b9b8b8',
      color: '#fff',
      padding: '4px',
    }
    // const policyYear = [
    //   { time: '2019' },
    //   { time: '2018' },
    // ];
    return (
      <div>
        <div>
          <FormItem {...staticformItemLayout} label='统计频度'>
            {getFieldDecorator('frequency', {
              initialValue: '', rules: [{ required: true, message: '必选' }]
            })(
              <Radio.Group onChange={this.onChangeRadio.bind(this)}>
                {
                  getEndTime_PeriodData.map((i) => {
                    return (
                      <Radio value={i.periodId} key={i.periodId}>{i.periodName}</Radio>
                    );
                  })
                }
              </Radio.Group>
              )}
          </FormItem>
        </div>
        <div style={{ display: 'flex', padding: '10px 0', width: '100%' }}>
          <div style={{...comBox, marginRight: 66 }}>
            <div style={{ ...comText }}>分析业务</div>

            {/* 通过父元素的状态来判定是否展示保单年度 */}
            { this.props.root.state.showPolicy ? 
              <FormItem {...formItemLayout} label='保单年度' ref={policy1 => this.policy1 = policy1} 
              style={{ display: this.props.root.state.showPolicy }}>
              {getFieldDecorator('referTime1', {
                initialValue: '', rules: [{ required: true, message: '必选' }]
              })(
                <Select style={{ width: 160 }}>
                  {
                    getpolicyYrData.map((i) => {
                      return (
                        <Select.Option value={i} key={i}>{i}</Select.Option>
                      );
                    })
                  }
                </Select>
                )}
            </FormItem> : null }

            {/* 通过父元素的状态来判定是否展示保险起期，其中涉及日期，给值需要引入模块，除非必要外不展示，设置display是无效的 */}
            { this.props.root.state.insuranceDate ? 
              <FormItem {...formItemLayout} label='保险起期'>
              {getFieldDecorator(`analyInsuranceDateLeft1`, { 
                initialValue: '', rules: [{ required: true, message: '必选' }] })(
                <DatePicker onChange={(e, d) => this.pickerChange(e, d, 'analyInsuranceDateLeft1')} placeholder="起始时间" />
              )}
              <span style={{ margin: '0 4px' }}>~</span>
              {getFieldDecorator(`analyInsuranceDateRight1`, { initialValue: '', rules: [{ required: true, message: '必选' }] })(
                <DatePicker onChange={(e, d) => this.pickerChange(e, d, 'analyInsuranceDateRight1')} placeholder="终止时间" />
              )}
            </FormItem> : null }

            <FormItem {...formItemLayout} label='统计时点'>
              {getFieldDecorator('statisticalTime1', {
                initialValue: '', rules: [{ required: true, message: '必选' }]
              })(
                <Select style={{ width: 160 }}>
                  {
                    getEndTime_ContentData.length > 0 ? getEndTime_ContentData.map((i) => {
                      return (
                        <Select.Option value={i} key={i}>{i}</Select.Option>
                      );
                    }) : []
                  }
                </Select>
                )}
            </FormItem>

            {/* 通过父元素的状态来判定是否展示机构 */}
            { this.props.root.state.institutions ? 
              <FormItem {...formItemLayout} label='机构'>
                {getFieldDecorator('analyCompany1', {
                  initialValue: [], rules: [{ required: true, message: '必选' }]
                })(
                  <Cascader
                    onClick={this.cascaderClick}
                    options={this.state.cascaderOption}
                    loadData={this.loadData}
                    onChange={(e, obj) => this.onChangeCompany(e, obj, 'analyCompany1')}
                    displayRender={(label)=>{return label[label.length - 1]}}
                    placeholder='请选择机构'
                    changeOnSelect
                    allowClear={false}
                  />
                  )}
                  
                  {getFieldDecorator('analySelect1', { initialValue: [] })(
                    <Select style={{ width: '160px' }}>
                      { [] }
                    </Select>
                  )}
              </FormItem> : null }
            
          </div>
          <div style={{...comBox, marginRight: 66 }}>
            <div style={{ ...comText }}>参考业务</div>

            {/* 通过父元素的状态来判定是否展示保单年度*/}
            { this.props.root.state.showPolicy ? 
              <FormItem {...formItemLayout} label='保单年度' ref={policy2 => this.policy2 = policy2}>
               {getFieldDecorator('referTime2', {
                 initialValue: '', rules: [{ required: true, message: '必选' }]
               })(
                 <Select style={{ width: 160 }}>
                   {
                     getpolicyYrData.map((i) => {
                       return (
                         <Select.Option value={i} key={i}>{i}</Select.Option>
                       );
                     })
                   }
                 </Select>
                 )}
             </FormItem> : null }

            {/* 通过父元素的状态来判定是否展示保险起期，其中涉及日期，给值需要引入模块，除非必要外不展示，设置display是无效的 */}
            { this.props.root.state.insuranceDate ? 
              <FormItem {...formItemLayout} label='保险起期'>
              {getFieldDecorator(`analyInsuranceDateLeft2`, { initialValue: '', rules: [{ required: true, message: '必选' }] })(
                  <DatePicker onChange={(e, d) => this.pickerChange(e, d, 'analyInsuranceDateLeft2')} placeholder="起始时间" />
                )}
                <span style={{ margin: '0 4px' }}>~</span>
                {getFieldDecorator(`analyInsuranceDateRight2`, { initialValue: '', rules: [{ required: true, message: '必选' }] })(
                  <DatePicker onChange={(e, d) => this.pickerChange(e, d, 'analyInsuranceDateRight2')} placeholder="终止时间" />
                )}
              </FormItem> : null }

            <FormItem {...formItemLayout} label='统计时点'>
              {getFieldDecorator('statisticalTime2', {
                initialValue: '', rules: [{ required: true, message: '必选' }]
              })(
                <Select style={{ width: 160 }}>
                  {
                    getEndTime_ContentData.length > 0 ? getEndTime_ContentData.map((i) => {
                      return (
                        <Select.Option value={i} key={i}>{i}</Select.Option>
                      );
                    }) : []
                  }
                </Select>
                )}
            </FormItem>

            {/* 通过父元素的状态来判定是否展示机构 */}
            { this.props.root.state.institutions ? 
              <FormItem {...formItemLayout} label='机构'>
              {getFieldDecorator('analyCompany2', {
                initialValue: [], rules: [{ required: true, message: '必选' }]
              })(
                <Cascader
                  onClick={this.cascaderClick}
                  options={this.state.cascaderOption}
                  loadData={this.loadData}
                  onChange={(e, obj) => this.onChangeCompany(e, obj, 'analyCompany2')}
                  displayRender={(label)=>{return label[label.length - 1]}}
                  changeOnSelect
                  placeholder='请选择机构'
                  allowClear={false}
                />
                )}

                {getFieldDecorator('analySelect2', { initialValue: [] })(
                  <Select style={{ width: '160px' }}>
                    { [] }
                  </Select>
                )}
            </FormItem> : null }
            
          </div>
        </div>
      </div>
    );
  }
}
