import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Row, Col, Icon, Button, Card, Select, DatePicker, message, Table, Collapse, Spin, Popconfirm
} from 'snk-web';
import { Link } from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import ShowEcharts from './ShowEcharts';
import moment from 'moment';

const RangePicker = DatePicker.RangePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const Panel = Collapse.Panel;

@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine,
}))
@Form.create()
export default class GetResult extends PureComponent {
  state = {
      loadEcharts: false,
      getCommalyData: [],
      getCommAutoalyData: [],
      man: '',
      getanalyData: [],   // 归因分析数据
      payanalyData: [],   // 赔付预测数据
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'mine/getUserInfo'
    }).then(()=>{
        const {mine: {getUserInfoData}, dispatch} = this.props;
        let man = '', endTime = '', startTime = '';
        if (getUserInfoData && getUserInfoData.domain !== undefined) {
            man = getUserInfoData.domain;
            this.setState({ man, });
        }
        this.setState({loadEcharts: true});
        var date = new Date();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        endTime = date.getFullYear() + "-" + month + "-" + strDate
            + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

        startTime = new Date().getFullYear() + '-' + '01' +'-'+ '01';
        // endTime = new Date().getFullYear() +'-'+ (new Date().getMonth()+1) +'-'+ new Date().getDate();
        this.props.dispatch({
            type: 'mine/getresult',
            payload: {
                man,
                select: 'app',
                startTime,
                endTime,
            }
        }).then(()=>{
            const {getresultData} = this.props.mine;
            this.setState({loadEcharts: false});
        }).catch((e) => {
            this.setState({loadEcharts: false});
            message.warn(e.message || '网络异常')
        });

        // 获取用户常用多维分析
        this.getCommaly(man);

        // 获取用户常用自助分析
        this.getCommAutoaly(man);

        // 获取归因分析常用分析
        this.getanaly(man)

        // 获取赔付预测常用分析
        this.payanaly(man)
    });
  }

  getCommaly = (man) => {
    this.props.dispatch({
        type: 'mine/getCommaly',
        payload: {man,}
    }).then(()=>{
        const {getCommalyData} = this.props.mine;
        this.setState({ getCommalyData, });
    }).catch((e) => {
        message.warn(e.message)
    });    
  }

  getCommAutoaly = (man) => {
    this.props.dispatch({
      type: 'mine/getCommAutoaly',
      payload: {man,}
    }).then(() => {
      const { getCommAutoalyData } = this.props.mine;
      this.setState({ getCommAutoalyData, });
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  // 归因分析数据请求
  getanaly = (man) => {
    this.props.dispatch({
      type: 'mine/getanaly',
      payload: {man}
    }).then(() => {
      const { getanalyData } = this.props.mine;
      this.setState({ getanalyData, });
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  // 赔付预测数据请求
  payanaly = (man) => {
    this.props.dispatch({
      type: 'mine/payanaly',
      payload: {man}
    }).then(() => {
      const { payanalyData } = this.props.mine;
      this.setState({ payanalyData, });
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  submitForm = (e) => {
    e.preventDefault();
    const {mine: {getUserInfoData}} = this.props;
    this.props.form.validateFields((err, values) => {
        if (err) return;
        let man = '', select = '', endTime = '', startTime = '';
        if (getUserInfoData.domain !== undefined) {
            man = getUserInfoData.domain;
        }
        select = values.selects;
        if ((values.startTime === '' || values.startTime === null) || (values.endTime === '' || values.endTime === null)) {
            message.warn('时间必选');
            return
        } else {
            startTime = values.startTime.format("YYYY-MM-DD");
            endTime = values.endTime.format("YYYY-MM-DD");
        }
        const oDate1 = new Date(startTime);
        const oDate2 = new Date(endTime);
        if(oDate1.getTime() > oDate2.getTime()){
           message.warn('起始时间必须小于终止时间');
           return;
        }

        this.setState({loadEcharts: true});
        this.props.dispatch({
            type: 'mine/getresult',
            payload: {
                man,
                select,
                startTime,
                endTime,
            }
        }).then(()=>{
            const {getresultData} = this.props.mine;
            this.setState({loadEcharts: false});
        }).catch((e)=>{
            message.warn(e.message || '网络异常');
            this.setState({loadEcharts: false});
        });
    });
  }

  // 删除多维分析
  onDelete = (e, record) => {
    this.props.dispatch({
      type: 'mine/delCommaly',
      payload: {
        id: record.id,
      }
    }).then(()=>{
        // 获取用户常用分析
        this.getCommaly(this.state.man);
    }).catch((e)=> {
        message.warn(e.message);
    });
  }

  // 删除归因分析
  onDeleteAnalysis = (e, record) => {
    this.props.dispatch({
      type: 'mine/delanaly',
      payload: {
        id: record.id,
      }
    }).then(()=>{
        // 获取用户常用分析
        this.getanaly(this.state.man);
    }).catch((e)=> {
        message.warn(e.message);
    });
  }

  // 删除赔付预测
  onDeletePay = (e, record) => {
    this.props.dispatch({
      type: 'mine/paydelanaly',
      payload: {
        id: record.id,
      }
    }).then(()=>{
        // 获取用户常用分析
        this.getanaly(this.state.man);
    }).catch((e)=> {
        message.warn(e.message);
    });
  }

  // 删除自助分析
  onAutoAnalyData = (e,record) => {
    this.props.dispatch({
      type: 'mine/delCommAutoAnaly',
      payload: {
        id: record.id,
      },
    }).then(() =>{
      this.getCommAutoaly(this.state.man);
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  renderForm = () => {
      const { loading, form: { getFieldDecorator, getFieldValue } } = this.props;
      let startTime = new Date().getFullYear() + '-' + '01' +'-'+ '01';
        var date = new Date();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        let endTime = date.getFullYear() + "-" + month + "-" + strDate
            + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      return (
        <Form onSubmit={e=>this.submitForm(e)} layout="inline">
            <Collapse defaultActiveKey={['1']} style={{marginTop: 10}}>
                <Panel header="查询条件" key="1">
                    <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
                        <Col md={8} sm={24}>
                            <FormItem label="告警统计">
                            {getFieldDecorator('selects', {initialValue: 'app',rules: [{ required: false, message: '必选' }]})(
                                <Select style={{ width: 200 }} onSelect={this.selApplicationItem} allowClear>
                                    <Option value='app'>应用</Option>
                                    <Option value='theme'>主题</Option>
                                    <Option value='alarmLevel'>告警级别</Option>
                                </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col md={12} sm={24}>
                            <FormItem label="选择时间">
                                <div>
                                {getFieldDecorator(`startTime`, {initialValue: moment(`${startTime}`),
                                })(<DatePicker placeholder='[起始时间]必选' style={{width: 120}}/>)}
                                    <span style={{margin: '0 4px'}}>~</span>
                                {getFieldDecorator(`endTime`, {initialValue: moment(`${endTime}`),
                                })(<DatePicker placeholder='[终止时间]必选' style={{width: 120}}/>)}
                                </div>
                            </FormItem>
                        </Col>
                    </Row>
                </Panel>
            </Collapse>
            <Button type="primary" htmlType="submit" style={{marginTop: 10}}>点击查询</Button>
        </Form>
      );
  }

  readerList () {
    const { loading } = this.props;
    const columns = [
         {
            title: '序号',
            dataIndex: 'num',
            align: 'center',
            width: 58,
            render: (text, record, index) => {
                const i = index + 1;
                return (
                    <span style={{ textAlign: 'center' }}>{i}</span>
                );
            }
        },
        {
            title: '名称',
            dataIndex: 'analysisName',
            align: 'center',
            width: 94,
            render: (text, record, index) => {
                return (
                    <Link to={{pathname: `/dimension/${record.webParam}/${record.appId}-${record.themeId}`,id: `${record.id}`, analyName: text}}>{text}</Link>
                );
            }
        }, 
        {
          title: '应用名称',
          dataIndex: 'appName',
          align: 'center',
          width: 84,
        },
         {
          title: '主题名称',
          dataIndex: 'themeName',
          align: 'center',
          width: 94,
        },
        {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            width: 58,
            render: (text, record, index) => {
                return (
                    <Popconfirm 
                    title={"请确定是否要删除？"} 
                    onConfirm={e=>this.onDelete(e,record)}
                    okText="确定" 
                    cancelText="取消"
                  >
                    <a herf='#'>删除</a>
                  </Popconfirm>
                );
            }
        }
    ];

    const columns1 = [
         {
            title: '序号',
            dataIndex: 'num',
            align: 'center',
            width: 58,
            render: (text, record, index) => {
                const i = index + 1;
                return (
                    <span style={{ textAlign: 'center' }}>{i}</span>
                );
            }
        },
        {
            title: '名称',
            dataIndex: 'autoAnalyName',
            align: 'center',
            width: 94,
            render: (text, record, index) => {
                return (
                    <Link to={{pathname: `/${record.webParam}`,id: `${record.id}`, autoAnalyName: text}}>{text}</Link>
                );
            }
        }, 
        {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            width: 58,
            render: (text, record, index) => {
                return (
                    <Popconfirm 
                    title={"请确定是否要删除？"} 
                    onConfirm={e=>this.onAutoAnalyData(e,record)}
                    okText="确定" 
                    cancelText="取消"
                  >
                    <a herf='#'>删除</a>
                  </Popconfirm>
                );
            }
        }
    ];

    const columns2 = [
        {
           title: '序号',
           dataIndex: 'num',
           align: 'center',
           width: 58,
           render: (text, record, index) => {
               const i = index + 1;
               return (
                   <span style={{ textAlign: 'center' }}>{i}</span>
               );
           }
       },
       {
           title: '名称',
           dataIndex: 'analysisName',
           align: 'center',
           width: 94,
           render: (text, record, index) => {
               return (
                   <Link to={{pathname: `/${record.webParam}`, id: record.id, analyName: text}}>{text}</Link>
               );
           }
       }, 
       {
         title: '应用名称',
         dataIndex: 'appName',
         align: 'center',
         width: 84,
       },
        {
         title: '主题名称',
         dataIndex: 'themeName',
         align: 'center',
         width: 94,
       },
       {
           title: '操作',
           dataIndex: 'action',
           align: 'center',
           width: 58,
           render: (text, record, index) => {
               return (
                   <Popconfirm 
                   title={"请确定是否要删除？"} 
                   onConfirm={e=>this.onDeleteAnalysis(e,record)}
                   okText="确定" 
                   cancelText="取消"
                 >
                   <a herf='#'>删除</a>
                 </Popconfirm>
               );
           }
       }
   ];
   
    const columns3 = [
        {
           title: '序号',
           dataIndex: 'num',
           align: 'center',
           width: 58,
           render: (text, record, index) => {
               const i = index + 1;
               return (
                   <span style={{ textAlign: 'center' }}>{i}</span>
               );
           }
       },
       {
           title: '名称',
           dataIndex: 'analysisName',
           align: 'center',
           width: 94,
           render: (text, record, index) => {
               return (
                   <Link to={{pathname: `/${record.webParam}`, id: record.id, analyName: text}}>{text}</Link>
               );
           }
       }, 
       {
         title: '应用名称',
         dataIndex: 'appName',
         align: 'center',
         width: 84,
       },
        {
         title: '主题名称',
         dataIndex: 'themeName',
         align: 'center',
         width: 94,
       },
       {
           title: '操作',
           dataIndex: 'action',
           align: 'center',
           width: 58,
           render: (text, record, index) => {
               return (
                   <Popconfirm 
                   title={"请确定是否要删除？"} 
                   onConfirm={e=>this.onDeletePay(e,record)}
                   okText="确定" 
                   cancelText="取消"
                 >
                   <a herf='#'>删除</a>
                 </Popconfirm>
               );
           }
       }
   ];

    let getCommalyData = [], getCommAutoalyData = [], getanalyData = [], payanalyData = [];
    if (this.state.getCommalyData.length > 0) {
        getCommalyData = this.state.getCommalyData;
    }
    if (this.state.getCommAutoalyData.length > 0) {
      getCommAutoalyData = this.state.getCommAutoalyData;
    }
    if (this.state.getanalyData.length > 0) {
      getanalyData = this.state.getanalyData;
    }
    if (this.state.payanalyData.length > 0) {
      payanalyData = this.state.payanalyData;
    }

    return (
      <div>
        <Table
            loading={loading}
            columns={columns}
            dataSource={getCommalyData}
            bordered
            pagination={{
              pageSize:5,
            }}
            title={() => '常用多维分析列表'}
        />
        <Table
            loading={loading}
            columns={columns1}
            dataSource={getCommAutoalyData}
            bordered
            title={() => '常用自助分析列表'}
        />
        <Table
            loading={loading}
            columns={columns2}
            dataSource={getanalyData}
            bordered
            pagination={{
              pageSize:5,
            }}
            title={() => '常用归因分析列表'}
        />
        <Table
            loading={loading}
            columns={columns3}
            dataSource={payanalyData}
            bordered
            pagination={{
              pageSize:5,
            }}
            title={() => '常用赔付预测列表'}
        />
      </div>
    );
  }

  render() {
    const {getresultData} = this.props.mine;
    return (
        <PageHeaderLayout title="">
            <div style={{display: 'flex', height: '100%'}}>
                <Card bordered={false} style={{ overflowY: 'scroll' }}>
                    <div>
                        {this.renderForm()}
                        <Spin spinning={this.state.loadEcharts}>
                            <ShowEcharts getresultData={getresultData}/>
                        </Spin>
                    </div>
                </Card>
                <Card bordered={false} style={{width: '42%', marginLeft: 14, overflow: 'scroll'}}>
                    <div>
                        {this.readerList()}
                    </div>
                </Card>
            </div>
            
        </PageHeaderLayout>
    );
  }
}
