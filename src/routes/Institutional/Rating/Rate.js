import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Spin, Button, message, Modal, Input, Collapse, Select } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Such from './Such';
import { Link } from 'dva/router';

const FormItem = Form.Item;
const { Panel } = Collapse;
const Option = Select.Option;

const getTimePeriodData = [
  '模拟评级（季度）',
  '正式评级（年度）'
];
let timeArr = []

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class Rating extends Component{
  constructor(props){
    super(props);
    this.state = {
      such: false,        // 是否显示确认发起评级
      ratLevel: '',       // 当前选择的评级机构，用于发起获取文字请求的参数
      company: '无',      // 当前正在进行的评级
      payload: {},        // 发起评级的参数，后续用作确认发起评级的参数
    }
  }

  componentDidMount(){
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    const label = document.getElementsByClassName('ant-form-item-label');
    for(let i of label){
      i.style.textAlign = 'left';        // 把label文字右对齐换成左边
    }
    
    this.props.dispatch({
      type: 'analysis/in_select'
    })
  }

  // 发起评级
  submitForm = (e) => {
    this.props.form.validateFields((err, values) => {
      if(err) return;
      const type = values.type.split('评级')[1];
      const { ratLevel } = this.state; 
      let ratType;
      if(type === '（年度）') ratType = '1';
      else ratType = '2';

      const payload = {
        ratTimeSlot: values.time,
        ratType,
        ratLevel
      }
      this.props.dispatch({
        type: 'analysis/in_initiateRat',
        payload
      }).then(() => {
        this.setState({ such: true, payload })
      }).catch(e => {
        message.error(e.message)
      })
    })
  }

  // 评级类型切换
  changeTime = (e) => {
    this.props.form.setFieldsValue({ time: '' });
    if(e === '正式评级（年度）') timeArr = this.props.analysis.in_selectData[1];
    else if(e === '模拟评级（季度）') timeArr = this.props.analysis.in_selectData[2];
  }

  // 点击查询按钮
  query = () => {
    const { ratLevel } = this.state;
    if(ratLevel === ''){
      message.warn('请选择评级机构');
      return;
    }
    this.props.dispatch({
      type: 'analysis/in_task',
      payload: {
        ratLevel
      }
    }).then(() => {
      const { ratStatus } = this.props.analysis.in_taskData;
      if(ratStatus === '1'){
        let company;
        if(ratLevel === '1') company = '分公司评级';
        else company = '三级机构评级';
        this.setState({ company })
      }else{
        this.setState({ company: '无' })
      };
    })
  }

  // 选择评级机构
  changeType = (e) => {
    let ratLevel;
    if(e === '分公司评级') ratLevel = '1';
    else if(e === '三级机构评级') ratLevel = '2';
    else ratLevel = '';
    this.setState({ ratLevel })
  }

  // asdf = () => {

  // }

  render(){
    const { form: { getFieldDecorator, getFieldValue }, analysis, loading } = this.props;
    const { company, such, ratLevel } = this.state;
    const companyType = ['分公司评级', '三级机构评级'];
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 20 },
    };
    return (
      <PageHeaderLayout>
        <Spin spinning={loading}>
          <Card style={{height: '100%'}}>
            <Form onSubmit={e => this.submitForm(e)}>
              <h1>发起评级</h1>
              <FormItem {...formItemLayout} label="选择评级类型">
                {getFieldDecorator('type', { 
                  initialValue: '',
                  rules: [{ required: true, message: '必选' }]
                })(
                   <Select style={{ width: 120, marginRight: 8 }} onChange={ this.changeTime }>
                     {getTimePeriodData.map((item) => {
                       return (
                        <Option key={item} value={item}>{item}</Option>
                       )
                     })}
                   </Select>
                )}  
              </FormItem>
              <FormItem {...formItemLayout} label="选择评级的时间段">
                {getFieldDecorator('time', {
                  initialValue: '',
                  rules: [{ required: true, message: '必选' }]
                })(
                   <Select style={{ width: 120, marginRight: 8 }}>
                     {timeArr.map((item) => {
                       return (
                        <Option key={item.code} value={item.code}>{item.name}</Option>
                       )
                     })}
                   </Select>
                )}  
              </FormItem>
              <FormItem {...formItemLayout} label="选择评级机构">
                {getFieldDecorator('companyType', {
                  initialValue: '',
                  rules: [{ required: true, message: '必选' }]
                })(
                   <Select style={{ width: 120, marginRight: 8 }} onChange={ this.changeType }>
                     {companyType.map((item) => {
                       return (
                        <Option key={item} value={item}>{item}</Option>
                       )
                     })}
                   </Select>
                )}  
                <Button type='primary' onClick={ this.query }>查询</Button>
                {/* <Link to={{ pathname: '/rating/rate', }}>跳转</Link> */}
              </FormItem>
              <FormItem {...formItemLayout} label="当前正在进行的评级">
                {getFieldDecorator('now', { initialValue: '无' })(
                  <div>{company}</div>
                )}  
              </FormItem>
              <Button type='primary' htmlType="submit">发起评级</Button>
            </Form>
          </Card>

          <Modal
            visible={such}
            onOk={this.such ? this.such.upload : null}
            onCancel={e => { this.setState({ such: false }) }}
            // destroyOnClose
            // closable={false}
            // style={{ top: 10 }}
            width='80%'
            okText="确认发起评级"
            // cancelText="取消"
          >
            <Such wrappedComponentRef={e => this.such = e} ratLevel={ratLevel} root={this}></Such>
          </Modal>
        </Spin>
      </PageHeaderLayout>
    )
  }
}