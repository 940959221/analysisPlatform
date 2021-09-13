import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Col, Row, Form, Card, Checkbox, Spin, Button, Select, Input, DatePicker, Table, Tooltip, Icon, Popconfirm, message } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/toolbox';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading, umssouserinfo }) => ({
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()
export default class ExpayrateBusiness extends PureComponent {
  state = {
    timer: {},        // 创建时间
    data: [],         // 表格数据
  }

  componentDidMount(){
    this.props.dispatch({
      type: 'analysis/getSystemSugg',
      payload: {
        man: this.props.currentUser.principal.name
      }
    }).then(() => {
      
    }).catch((e) => {

    })
    this.props.dispatch({
      type: 'analysis/getRunStatus',
    }).then(() => {
      this.timeOut();
    })
    this.props.dispatch({
      type: 'analysis/getSystemSugg',
      payload: {
        man: this.props.currentUser.principal.name,
      }
    }).then(() => {
      this.timeOut();
    })
  }

  // 定时器延迟获取数据
  timeOut(){
    setTimeout(() => {        // 此处用定时器，防止数据还没获取到
      const { getSystemSuggData } = this.props.analysis;
      const data = [];
      for(let i of getSystemSuggData){
        data.push({
          key: i.id,
          webParam: i.webParam,
          name: i.suggestName,
          person: i.man,
          state: i.runStatusName,
          updateTime: i.commitTime,
          finishTime: i.finishTime
        })
      }
      this.setState({ data })
    }, 0)
  }

  // 点击查询
  query(){
    const values = this.props.form.getFieldsValue();
    let { timer } = this.state;
    if(JSON.stringify(timer) === '{}') timer = null;
    this.props.dispatch({
      type: 'analysis/getSystemSugg',
      payload: {
        man: this.props.currentUser.principal.name,
        suggestName: values.name !== '' ? values.name : null,
        runStatus: values.state !== '' ? values.state : null,
        createTimeFrame: timer
      }
    }).then(() => {
      this.timeOut();
    })
  }

  // 点击重置
  reset(){
    this.props.form.setFieldsValue({ 'name': '', 'state': '', 'startTime': '', 'endTime': '' });
    this.setState({ timer: {} });
  }

  // 日期监听事件
  pickerChange(e, dateString, name){
    const { timer } = this.state;
    timer[name] = dateString;
    if(e === null) delete timer[name];      // 如果日期被删除了，那就删除属性
    this.setState({ timer })
  }

  //点击删除
  delete(e, record){
    this.props.dispatch({
      type: 'analysis/delSuggest',
      payload: { id: record.key }
    }).then(() => {
      message.success('删除成功！');
      // 删除完后重新获取数据
      this.props.dispatch({
        type: 'analysis/getSystemSugg',
        payload: {
          man: this.props.currentUser.principal.name
        }
      }).then(() => {
        this.timeOut();
      })
    })
  }


  getTable(){
    const { getFieldDecorator } = this.props.form;
    const { getRunStatusData } = this.props.analysis;
    const { data } = this.state;
    const dataLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    }
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        align: 'center',
        width: 80,
        key: 'name',
        render: (text, record, index) => {
          return (
            <Link to={{pathname: `/${record.webParam}`, person: record.person, sugID: record.key, analyName: text}}>{text}</Link>
          );
        },
      },
      {
        title: '创建人',
        dataIndex: 'person',
        align: 'center',
        width: 110,
        key: 'person'
      },
      {
        title: '状态',
        dataIndex: 'state',
        align: 'center',
        width: 60,
        key: 'state'
      },
      {
        title: '计算提交时间',
        dataIndex: 'updateTime',
        align: 'center',
        width: 100,
        key: 'updateTime'
      },
      {
        title: '计算完成时间',
        dataIndex: 'finishTime',
        align: 'center',
        width: 100,
        key: 'finishTime'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        width: 40,
        key: 'operation',
        render: (text, record, index) => {
          return (
            <Popconfirm
              title={`请确定是否要删除[${record.name}]？`}
              onConfirm={e => this.delete(e, record)}
              okText="确定"
              cancelText="取消"
            >
              <a herf='#' style={{ color: '#0088cc' }}>删除</a>
            </Popconfirm>
          )
        }
      }
    ];

    return(
      <Form onSubmit={e => this.submitForm(e)} layout="inline"
        style={{ border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center', padding: '10px 0' }}>
        <Row>
          <Col>
            <FormItem label='名称'>
              { getFieldDecorator('name', { initialValue: '' })(
                <Input style={{width: 120}}></Input>
              ) }
            </FormItem>
            <FormItem label='状态'>
              { getFieldDecorator('state', { initialValue: '' })(
                <Select style={{width: 100}} allowClear={true}>
                  { getRunStatusData.map((item) => {
                    return (
                      <Option value={item.runStatus}>{item.runStatusName}</Option>
                    )
                  }) }
                </Select>
              ) }
            </FormItem>
            <FormItem label='创建时间' style={{margin: 0}}>
              { getFieldDecorator('startTime', { initialValue: '' })(
                <DatePicker allowClear onChange={(e, d) => this.pickerChange(e, d, 'leftValue')}></DatePicker>
              ) }
            </FormItem>
            <span style={{margin: '0 4px', lineHeight: 3}}>~</span>
            <FormItem>
              { getFieldDecorator('endTime', { initialValue: '' })(
                <DatePicker allowClear onChange={(e, d) => this.pickerChange(e, d, 'rightValue')}></DatePicker>
              ) }
            </FormItem>
          </Col>
        </Row>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Button style={{marginRight: 20}} onClick={ this.query.bind(this) }>查询</Button>
          <Button style={{marginRight: 20}} onClick={ this.reset.bind(this) }>重置</Button>
        </div>

        {/* 表格 */}
        <div style={{ position: 'relative' }}>
          <Tooltip placement="top" title={'刷新'}>
            <Icon
              type="reload"
              style={{ position: 'absolute', left: '11%', top: 10, zIndex: 999 }}
              onClick={e => {
                this.props.dispatch({
                  type: 'analysis/getSystemSugg',
                  payload: { man: this.props.currentUser.principal.name }
                }).then(() => {
                  this.timeOut();
                })
              }}
            />
          </Tooltip>
          <Table columns={columns} dataSource={data} bordered/>
        </div>
      </Form>
    )
  }

  render() {
    return (
      <PageHeaderLayout>
        <Card>
          { this.getTable() }
        </Card>
      </PageHeaderLayout>
    );
  }
}
