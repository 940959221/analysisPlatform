import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Button, DatePicker, Icon, Select } from 'snk-web';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class CycleTime extends Component{
  constructor(props){
    super(props);
    this.state = {
      timer: {},      // 统计时间
    }
  }

  // 添加过滤器
  addTime = () => {
    const keys = this.props.form.getFieldValue('keys');
    const now = keys.slice(-1)[0] + 1;
    keys.push(now);
    this.props.form.setFieldsValue({ 'keys': keys });
  }

  // 点击删除
  remove(index){
    const { form } = this.props;
    let keys = form.getFieldValue('keys');
    keys = keys.filter(item => item !== index);
    form.setFieldsValue({ 'keys': keys, [`dateLeft${index}`]: '', [`dateRight${index}`]: '' });
  }

  // 统计时间监听事件
  pickerChange(e, dateString, name){
    const { timer } = this.state;
    timer[name] = dateString;
    this.setState({ timer })
  }

  // 选中统计周期
  selectAround = (e) => {
    // 给父节点状态添加数值，此操作针对于主维度，和当前模块无关
    const { mainArr } = this.props.root.state;    
    for(let i in mainArr){
      if(mainArr[i].label === '统计周期') {
        mainArr[i].code = 'start' + e;
        return
      };
    }
    mainArr.push({ label: '统计周期', code: 'start' + e });
    this.props.root.setState({ mainArr })
  }

  // 下拉监听
  onDeselect = (e) => {
    let { mainArr } = this.props.root.state;
    // 如果点击了下拉框的删除按钮，就过滤父级状态的当前项，此操作针对于主维度，和当前模块无关
    if(e === undefined){
      for(let i in mainArr){
        if(mainArr[i].label === '统计周期') mainArr.splice(i, 1);
      }
      this.props.root.setState({ mainArr })
    }
  }

  render(){
    const { form: { getFieldDecorator, getFieldValue }, analysis, root: { state: { getTimePeriod } } } = this.props;
    const getTimePeriodData = analysis[getTimePeriod + 'Data'];

    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 20 },
    };
    const keyArr = [0];
    getFieldDecorator('keys', { initialValue: keyArr });
    const keys = getFieldValue('keys'); 
    return (
      <Form>
        <Row>
          <Col>
            <FormItem {...formItemLayout} label="统计周期">
              {getFieldDecorator('cycleTime', { initialValue: '' })(
                 <Select style={{ width: 80, marginRight: 8 }} allowClear onSelect={ this.selectAround } 
                  onChange={ (e) => this.onDeselect(e) }>
                   {getTimePeriodData.map((item) => {
                     return (
                      <Option key={item.periodId} value={item.periodId}>{item.periodName}</Option>
                     )
                   })}
                 </Select>
            )}  
            </FormItem>
          </Col>
        </Row>
        <div style={{ marginLeft: 0 }}>
          <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
          { keys.map( (item, index) => {
            return(
              <FormItem {...formItemLayout} style={{width: '100%', display: 'flex'}}
                labelCol={{span: 2}}
                colon={index === 0 ? true : false}
                label={index === 0 ? '统计时间' : ' '} key={item}>
                {getFieldDecorator(`dateLeft${item}`, { 
                  initialValue: '', rules: [{ required: true, message: '必选' }] })(
                  <DatePicker onChange={(e, d) => this.pickerChange(e, d, `dateLeft${item}`)} placeholder="起始时间" />
                )}
                <span style={{ margin: '0 4px' }}>~</span>
                {getFieldDecorator(`dateRight${item}`, { initialValue: '', rules: [{ required: true, message: '必选' }] })(
                  <DatePicker onChange={(e, d) => this.pickerChange(e, d, `dateRight${item}`)} placeholder="终止时间" />
                )}
                {item !== 0 ? (
                  <Icon
                    style={{ marginLeft: 10 }}
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                    onClick={() => this.remove(item)}
                  />
                ) : null}
              </FormItem>
              
            )
          }) }
          </Row>
          <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
            <Button
              type="dashed"
              onClick={this.addTime}
              style={{ width: '60%' }}
              // disabled={
              // !((this.props.form.getFieldValue(
              //   `rightTime${this.props.form.getFieldValue('timekeys')[this.props.form.getFieldValue('timekeys').length - 1]}`
              // ) !== '') &&
              //   (this.props.form.getFieldValue(
              //   `rightTime${this.props.form.getFieldValue('timekeys')[this.props.form.getFieldValue('timekeys').length - 1]}`
              // ) !== null))
              // }
            >
              <Icon type="plus" /> 添加统计时间
            </Button>
          </FormItem>
        </div>
      </Form>
    )
  }
}
