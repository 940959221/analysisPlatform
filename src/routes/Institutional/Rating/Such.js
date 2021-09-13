import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Spin, Button, message, Modal, Input, Collapse, Select, Checkbox, Transfer } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const { Panel } = Collapse;
const Option = Select.Option;
const { Search } = Input;
const CheckboxGroup = Checkbox.Group;

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

export default class Such extends Component{
  constructor(props){
    super(props);
    this.state = {
      mockData: [],             // 数据列表
      targetKeys: [],           // 选择的值
      plainOptions: [],
      company: [],              // 机构类型
      time: [],                 // 评级时间
      in_taskData: [],          // 文字信息数据
    }
  }

  componentDidMount(){
    this.getText();
    this.getMock();
  }

  componentWillReceiveProps(props){
    if(JSON.stringify(props.root.props.analysis.in_initiateRatData) !== JSON.stringify(this.state.plainOptions)){
      this.getMock();
    }
    if(JSON.stringify(props.root.props.analysis.in_taskData) !== JSON.stringify(this.state.in_taskData)){
      this.getText();
    }
  }

  // 获取文字信息
  getText = () => {
    this.props.dispatch({
      type: 'analysis/in_task',
      payload: {
        ratLevel: this.props.ratLevel
      }
    }).then(() => {
      const { ratTimeSlot, ratType, ratLevel, ratStatus } = this.props.analysis.in_taskData;
      const { in_taskData } = this.props.analysis;
      let time, company;
      if(ratStatus === '1'){
        if(ratType === '1') time = ratTimeSlot + '年';
        else time = ratTimeSlot.split('_')[0] + '年' + ratTimeSlot.split('_')[1] + '季度';
        if(ratLevel === '1') company = '分公司评级';
        else company = '三级机构评级';
      }else{
        time = '无';
        company = '无';
      }
      this.setState({ time, company, in_taskData })
    })
  }

  // 获取列表数据
  getMock = () => {
    const targetKeys = [];
    const plainOptions = this.props.root.props.analysis.in_initiateRatData;
    console.log(plainOptions)
    const mockData = [];
    for (let i of plainOptions) {
      const data = {
        key: i.companyCode,
        title: i.companyName,
        // description: `description of content${i + 1}`,
        // chosen: Math.random() * 2 > 1,
      };
      mockData.push(data);
    }
    this.setState({ mockData, targetKeys, plainOptions });
  };

  // 更新右侧列表
  handleChange = targetKeys => {
    this.setState({ targetKeys });
  };

  // 确认发起评级
  upload = () => {
    const { mockData, targetKeys } = this.state;
    let effComList = [];
    for(let i of mockData){
      effComList.push(i.key)
    }
    this.props.dispatch({
      type: 'analysis/in_rat',
      payload:{
        ...this.props.root.state.payload,
        effComList,
        noEffComList: targetKeys
      }
    }).then(() => {
      this.props.root.setState({ such: false })
      message.success('确认发起评级成功！')
    })
  }

  render(){
    const { form: { getFieldDecorator, getFieldValue }, analysis, loading } = this.props;
    const { targetKeys, mockData, company, time } = this.state;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 20 },
    };
    return (
      // <PageHeaderLayout>
        <Spin spinning={loading}>
          <Card style={{height: '100%'}}>
            <div>
              <h1>发起评级</h1>
              <div style={{height: 40, lineHeight: '40px'}}>
                <span>当前评级类型：</span><span>{company}，</span>
                <span>评级时间段：</span><span>{time}，</span>
                <span>评级机构：</span><span>{company}</span>
              </div>
              <h2 style={{height: 40, lineHeight: '40px'}}>机构列表：</h2>
              <Transfer
                dataSource={mockData}
                titles={['参与列表', '未参与列表']}
                showSearch
                listStyle={{
                  width: '40%',
                  height: 400,
                }}
                operations={['不参与', '参与']}
                targetKeys={targetKeys}
                onChange={this.handleChange}
                render={item => `${item.title}`}
                // footer={this.renderFooter}
              />
              {/* <Button type='primary' style={{marginTop: 20}} onClick={this.upload}>确认发起评级</Button> */}
            </div>
          </Card>
        </Spin>
      // </PageHeaderLayout>
    )
  }
  
}