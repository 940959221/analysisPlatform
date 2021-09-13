import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Col, Row, Divider, Popconfirm, Table, Card, message,
  Select, Button, DatePicker, Input, Cascader, Modal, Spin, Tooltip, Icon
} from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SimulatePlan from './SimulatePlan';
import { Link } from 'dva/router';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class PlanQuery extends PureComponent {
  state = {
    options: [],
    userCompanyCode: '',
    setLookBackTimeModel: false,
    setCopyPlanNameModel: false,
    setCalculateModel: false,
    planName: null,
    companyCode: null,
    planType: null,
    runStatus: null,
    modelName: null,
    commitTimeFrame: {
      leftValue: null, rightValue: null,
    },
    effectTimeFrame: {
      leftValue: null, rightValue: null,
    },
    actionPlanId: null,
    actionCompanyCode: null,
    actionPlanName: null,
    actionModelId: null,
    calStartTime: null,
    calEndTime: null,
    simulateModelVisiable: false,
    record: null,
    loading: false,
    domain: '',
    hasSavePlan: false,
    hasReloadTable: false,
    modelWidth: '100%',
    calStartTime: null,
    calEndTime: null,
    companyCode: null
  }

  componentDidMount() {
    //方案管理获取方案所有状态
    this.props.dispatch({
      type: 'analysis/getAllRunStatus',
    }).then().catch((e) => {
      message.warn(e.message);
    });
    // 查询列表
    this.queryPlan(null, null, null, null, null, this.state.commitTimeFrame, this.state.effectTimeFrame);

    this.props.dispatch({
      type: 'analysis/getUserInfo'
    }).then(() => {
      const { getUserInfoData } = this.props.analysis;
      if (getUserInfoData.domain !== undefined && getUserInfoData.domain !== '') {
        this.setState({ domain: getUserInfoData.domain });
      }
      //新建方案获取机构
      this.props.dispatch({
        type: 'analysis/getCompanyplanManage',
        payload: {
          companyCode: null,
        },
      }).then(() => {
        const { getCompanyplanManageData } = this.props.analysis;
        const temp = [];
        if (getCompanyplanManageData.length > 0) {
          getCompanyplanManageData.map((i) => {
            const list = (
              <Option value={i.companyCode}>{i.companycName}</Option>
            );
            temp.push(list);
          });
          this.setState({ options: temp });
        }
      }).catch((e) => {
        message.warn(e.message);
      });
      if (getUserInfoData.companyCode !== undefined) {
        this.setState({ userCompanyCode: getUserInfoData.companyCode });
      }
    }).catch((e) => {
      message.warn(e.message)
    });
    const bodyWidth = document.querySelector('body').offsetWidth;
    if (1000 < bodyWidth && bodyWidth < 1300) {
      this.setState({ modelWidth: '120%' });
    }
  }

  queryPlan = (companyCode, planType, runStatus, planName, modelName, commitTimeFrame, effectTimeFrame) => {
    this.props.dispatch({
      type: 'analysis/queryPlan',
      payload: {
        companyCode,
        planType,
        runStatus,
        planName,
        modelName,
        commitTimeFrame,
        effectTimeFrame,
      },
    }).then().catch((e) => {
      message.warn(e.message);
    });
  }

  // 计算模型
  calculate = (e, record) => {
    if (record !== '') {
      this.setState({
        setCalculateModel: true,
        actionModelId: record.modelId,
        actionPlanId: record.planId,
        actionCompanyCode: record.companyCode,
        calStartTime: record.calStartTime,
        calEndTime: record.calEndTime,
        companyCode: record.companyCode
      });
    }
  }

  // 模拟
  simulate = (e, record) => {
    if (record !== '') {
      this.setState({ simulateModelVisiable: true, record, });
    }
  }

  // 删除
  delete = (e, record) => {
    if (record !== '') {
      this.props.dispatch({
        type: 'analysis/planDelete',
        payload: {
          planId: record.planId,
        }
      }).then(() => {
        // 查询列表
        this.queryPlan(
          this.state.companyCode,
          this.state.planType,
          this.state.runStatus,
          this.state.planName,
          this.state.modelName,
          this.state.commitTimeFrame,
          this.state.effectTimeFrame
        );
      }).catch((e) => {
        message.warn(e.message);
      });
    }
  }

  // 复制模型
  copyPlan = (e, record) => {
    if (record !== '') {
      let first = record.planName.indexOf("_") + 1;
      let heng = record.planName.indexOf("_", first);
      this.setState({
        actionPlanId: record.planId,
        actionCompanyCode: record.companyCode,
        actionPlanName: record.planName.substring(0, heng),
        setCopyPlanNameModel: true,
      });
    }
  }

  // 回溯
  lookBack = (e, record) => {
    if (record !== '') {
      this.setState({
        setLookBackTimeModel: true,
        actionPlanId: record.planId,
        actionModelId: record.modelId,
        actionCompanyCode: record.companyCode,
        actionPlanName: record.planName
      });
    }
  }

  checklookBack = (e, record) => {
    if (record !== '') {
      this.props.history.push({ pathname: '/businessmap/checklookback', planId: record.planId });
    }
  }

  onSerach = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return
      const companyCode = values.companyCode !== undefined ? values.companyCode : null;
      const planType = values.planType !== undefined ? values.planType : null;
      const runStatus = values.runStatus !== undefined ? values.runStatus : null;
      const planName = values.planName === '' ? null : values.planName;
      const modelName = values.modelName === '' ? null : values.modelName;
      const commitTimeFrame = {
        leftValue: values.commitTimeLeftValue == null ? null : values.commitTimeLeftValue.format("YYYY-MM-DD"),
        rightValue: values.commitTimeRightValue == null ? null : values.commitTimeRightValue.format("YYYY-MM-DD"),
      };
      const effectTimeFrame = {
        leftValue: values.effectTimeLeftValue == null ? null : values.effectTimeLeftValue.format("YYYY-MM-DD"),
        rightValue: values.effectTimeRightValue == null ? null : values.effectTimeRightValue.format("YYYY-MM-DD"),
      };
      this.setState({ companyCode, planType, runStatus, planName, modelName, commitTimeFrame, effectTimeFrame });
      // 查询列表
      this.queryPlan(companyCode, planType, runStatus, planName, modelName, commitTimeFrame, effectTimeFrame);
    });
  }

  reset = () => {
    this.props.form.setFieldsValue({
      ['companyCode']: null,
      ['planType']: undefined,
      ['runStatus']: null,
      ['planName']: null,
      ['modelName']: null,
      ['commitTimeLeftValue']: null,
      ['commitTimeRightValue']: null,
      ['effectTimeLeftValue']: null,
      ['effectTimeRightValue']: null,
    });
  }

  getPlanType = (value) => {
    let text = '';
    switch (value) {
      case '0':
        text = '模拟方案'
        break;
      case '1':
        text = '汇总方案'
        break;
      case null:
        text = '全部'
        break;
    }
    return text;
  }

  // 回溯
  handleOkSetLookBackTime = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return
      const leftValue = new Date(values.lookBackEffectTimeLeftValue.format("YYYY-MM-DD"));
      const rightValue = new Date(values.lookBackEffectTimeRightValue.format("YYYY-MM-DD"));
      if (rightValue.getTime() > leftValue.getTime()) {
        this.props.dispatch({
          type: 'analysis/planLookBackCal',
          payload: {
            planId: this.state.actionPlanId,
            modelId: this.state.actionModelId,
            planName: this.state.actionPlanName,
            companyCode: this.state.actionCompanyCode,
            timeFrame: {
              leftValue: values.lookBackEffectTimeLeftValue.format("YYYY-MM-DD"),
              rightValue: values.lookBackEffectTimeRightValue.format("YYYY-MM-DD"),
            },
          },
        }).then(() => {
          this.setState({
            actionPlanId: null,
            actionModelId: null,
            actionPlanName: null,
            actionCompanyCode: null,
            setLookBackTimeModel: false,
          })
          // 查询列表
          this.queryPlan(
            this.state.companyCode,
            this.state.planType,
            this.state.runStatus,
            this.state.planName,
            this.state.modelName,
            this.state.commitTimeFrame,
            this.state.effectTimeFrame
          );
        }).catch((e) => {
          message.warn(e.message);
        });
      } else {
        message.warn('右值要大于左值');
      }
    });
  }

  // 复制模型
  handleOkSetPalnName = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (values.copyPlanName !== '') {
        this.props.dispatch({
          type: 'analysis/planCopy',
          payload: {
            planId: this.state.actionPlanId,
            planName: this.state.actionPlanName + '_' + values.copyPlanName,
            companyCode: this.state.actionCompanyCode,
          },
        }).then(() => {
          this.setState({ setCopyPlanNameModel: false, actionPlanId: null, actionPlanName: null, actionCompanyCode: null });
          // 查询列表
          this.queryPlan(
            this.state.companyCode,
            this.state.planType,
            this.state.runStatus,
            this.state.planName,
            this.state.modelName,
            this.state.commitTimeFrame,
            this.state.effectTimeFrame
          );
        }).catch((e) => {
          message.warn(e.message);
          if (e.message !== '方案名称已经存在，请重新命名') {
            this.setState({ setCopyPlanNameModel: false });
          }
        });
      } else {
        message.warn('方案名称必填');
      }
    });
  }

  // 计算
  handleOkSetCalculate = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const calculateLeftValue = values.calculateLeftValue._d.getTime();
      const calculateRightValue = values.calculateRightValue._d.getTime();
      if (calculateRightValue < calculateLeftValue) {
        message.warn('右侧值需大于左侧值！');
        return;
      }
      const timeFrame = {
        leftValue: values.calculateLeftValue.format("YYYY-MM-DD"),
        rightValue: values.calculateRightValue.format("YYYY-MM-DD"),
      };
      this.props.dispatch({
        type: 'analysis/planCal',
        payload: {
          planId: this.state.actionPlanId,
          modelId: this.state.actionModelId,
          companyCode: this.state.actionCompanyCode,
          timeFrame,
        }
      }).then(() => {
        // 查询列表
        this.queryPlan(
          this.state.companyCode,
          this.state.planType,
          this.state.runStatus,
          this.state.planName,
          this.state.modelName,
          this.state.commitTimeFrame,
          this.state.effectTimeFrame
        );
        this.setState({
          actionCompanyCode: null,
          actionModelId: null,
          actionPlanId: null,
          setCalculateModel: false
        });
      }).catch((e) => {
        message.warn(e.message);
      });
    });
  }

  // 选择参考方案
  selectReferPlan = (value) => {
    this.setState({ calStartTime: value.calStartTime, calEndTime: value.calEndTime });
  }

  hasSavePlan = () => {
    this.setState({ hasSavePlan: true, simulateModelVisiable: false });
    // 查询列表
    this.queryPlan(
      this.state.companyCode,
      this.state.planType,
      this.state.runStatus,
      this.state.planName,
      this.state.modelName,
      this.state.commitTimeFrame,
      this.state.effectTimeFrame
    );
  }

  hasReloadTable = () => {
    this.setState({ hasReloadTable: true });
  }

  handleCancelSimModel = (e) => {
    this.setState({ simulateModelVisiable: false });
    this.props.dispatch({
      type: 'analysis/quitPlan',
      payload: {
        planId: this.state.record.planId,
      },
    }).then(() => {
      // 查询列表
      this.queryPlan(
        this.state.companyCode,
        this.state.planType,
        this.state.runStatus,
        this.state.planName,
        this.state.modelName,
        this.state.commitTimeFrame,
        this.state.effectTimeFrame
      );
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  renderForm() {
    const { form: { getFieldDecorator, getFieldValue, loading },
      analysis: { queryPlanData, getAllRunStatusData }
    } = this.props;
    const planStatus = [];
    let data = [], status = [];
    if (queryPlanData.length > 0) {
      data = queryPlanData
    }
    if (getAllRunStatusData.length > 0) {
      getAllRunStatusData.map((i) => {
        const list = (
          <Option value={i.runStatus}>{i.runStatusName}</Option>
        );
        status.push(list);
      });
    }

    const columns = [
      {
        title: '方案名称',
        dataIndex: 'planName',
        align: 'center',
        width: 220,
        fixed: 'left',
        render: (text, record, index) => {
          return (
            <Link
              to={{ pathname: '/businessmap/checkplan', record, }}
            >
              {text}
            </Link>
          );
        }
      },
      {
        title: '归属机构',
        dataIndex: 'companyName',
        align: 'center',
        width: 120,
        fixed: 'left',
      },
      {
        title: '状态',
        dataIndex: 'runStatusName',
        align: 'center',
        width: 80,
        fixed: 'left',
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        render: (text, record, index) => {
          return (
            <span>
              <a
                data-index={index}
                style={{ color: record.enableCalculate === undefined || record.enableCalculate === '0' ? '#9d9c9e' : '#0088cc' }}
                onClick={e => this.calculate(e, record)}>计算</a>
              <Divider type="vertical" />
              <a
                style={{ color: record.enableAnalog === undefined || record.enableAnalog === '0' ? '#9d9c9e' : '#0088cc' }}
                onClick={e => this.simulate(e, record.enableAnalog === undefined || record.enableAnalog === '0' ? '' : record)}>模拟</a>
              <Divider type="vertical" />
              {
                record.enableDelete === undefined || record.enableDelete === '0'
                  ?
                  <a herf='#' style={{ color: record.enableDelete === undefined || record.enableDelete === '0' ? '#9d9c9e' : '#0088cc' }}>删除</a>
                  :
                  <Popconfirm
                    title={`请确定是否要删除[${record.planName}]？`}
                    onConfirm={e => this.delete(e, record)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a herf='#' style={{ color: record.enableDelete === undefined || record.enableDelete === '0' ? '#9d9c9e' : '#0088cc' }}>删除</a>
                  </Popconfirm>
              }
              <Divider type="vertical" />
              <a
                style={{ color: record.enableCopy === undefined || record.enableCopy === '0' ? '#9d9c9e' : '#0088cc' }}
                onClick={e => this.copyPlan(e, record.enableCopy === undefined || record.enableCopy === '0' ? '' : record)}>复制</a>
              <Divider type="vertical" />
              <a
                style={{ color: record.enableLookBack === undefined || record.enableLookBack === '0' ? '#9d9c9e' : '#0088cc' }}
                onClick={e => this.lookBack(e, record.enableLookBack === undefined || record.enableLookBack === '0' ? '' : record)}>回溯</a>
              <Divider type="vertical" />
              <a
                style={{ color: record.enableCheckLookBack === undefined || record.enableCheckLookBack === '0' ? '#9d9c9e' : '#0088cc' }}
                onClick={e => this.checklookBack(e, record.enableCheckLookBack === undefined || record.enableCheckLookBack === '0' ? '' : record)}>查看回溯结果</a>
            </span>
          );
        }
      },
      {
        title: '回溯状态',
        dataIndex: 'lookbackStatusName',
        align: 'center',
        width: 90,
      },
      {
        title: '回溯期间',
        dataIndex: 'lookbackPeriod',
        align: 'center',
        width: 170,
      },
      {
        title: '归属模型名称',
        dataIndex: 'modelName',
        align: 'center',
        width: 200,
      },
      {
        title: '方案类型',
        dataIndex: 'planType',
        align: 'center',
        width: 90,
        render: (text, record, index) => {
          return (
            <span>{this.getPlanType(text)}</span>
          );
        }
      },
      {
        title: '创建人',
        dataIndex: 'createUser',
        align: 'center',
        width: 200,
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        align: 'center',
        width: 200,
      },
      {
        title: '模拟人',
        dataIndex: 'analogUser',
        align: 'center',
        width: 200,
      },
      {
        title: '模拟时间',
        dataIndex: 'analogTime',
        align: 'center',
        width: 200,
      },
      {
        title: '提交人',
        dataIndex: 'commitUser',
        align: 'center',
        width: 200,
      },
      {
        title: '提交时间',
        dataIndex: 'commitTime',
        align: 'center',
        width: 200,
      },
      {
        title: '启用人',
        dataIndex: 'useUser',
        align: 'center',
        width: 200,
      },
      {
        title: '启用时间',
        dataIndex: 'useTime',
        align: 'center',
        width: 200,
      },
      {
        title: '生效时间',
        dataIndex: 'startTime',
        align: 'center',
        width: 150,
      },
      {
        title: '失效时间',
        dataIndex: 'endTime',
        align: 'center',
        width: 150,
      },
    ];
    const statusData = [
      { statusName: '全部', value: null },
      { statusName: '模拟方案', value: 0 },
      { statusName: '汇总方案', value: 1 },
    ];

    statusData.map((i) => {
      const list = (
        <Option value={i.value}>{i.statusName}</Option>
      );
      planStatus.push(list);
    });

    return (
      <div>
        <Form onSubmit={e => this.submitForm(e)} layout="inline"
          style={{ border: '1px solid #e8e8e8', borderBottom: 'none' }}
        >
          <div style={{ margin: '8px 15px' }}>
            <Row>
              <Col>
                <FormItem label='归属机构'>
                  {getFieldDecorator('companyCode')(
                    <Select style={{ width: 130, }} allowClear={true}>
                      {this.state.options.map((i) => { return i })}
                    </Select>
                  )}
                </FormItem>
                <FormItem label='状态' style={{ marginLeft: 22 }}>
                  {getFieldDecorator('runStatus')(
                    <Select style={{ width: 130 }} allowClear={true} >
                      {status.map((i) => { return i })}
                    </Select>
                  )}
                </FormItem>
                <FormItem label='模型名称'>
                  {getFieldDecorator('modelName', { initialValue: null })(
                    <Input style={{ width: 130 }} />
                  )}
                </FormItem>
                <FormItem label={''}>
                  <span>
                    生效时间
                <span style={{ margin: '0 8px 0 2px' }}>:</span>
                  </span>
                  {getFieldDecorator(`effectTimeLeftValue`, { initialValue: null })(
                    <DatePicker placeholder="" style={{ width: 120 }} />
                  )}
                  <span style={{ margin: '0 4px' }}>~</span>
                  {getFieldDecorator(`effectTimeRightValue`, { initialValue: null })(
                    <DatePicker placeholder="" style={{ width: 120 }} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormItem label='方案类型'>
                  {getFieldDecorator('planType')(
                    <Select style={{ width: 130 }} allowClear={true}>
                      {planStatus.map((item) => { return item })}
                    </Select>
                  )}
                </FormItem>
                <FormItem label='方案名称'>
                  {getFieldDecorator('planName', { initialValue: null })(
                    <Input style={{ width: 130 }} />
                  )}
                </FormItem>
                <FormItem label={''}>
                  <span>
                    提交时间
                <span style={{ margin: '0 8px 0 2px' }}>:</span>
                  </span>
                  {getFieldDecorator(`commitTimeLeftValue`, { initialValue: null })(
                    <DatePicker placeholder="" style={{ width: 120 }} />
                  )}
                  <span style={{ margin: '0 4px' }}>~</span>
                  {getFieldDecorator(`commitTimeRightValue`, { initialValue: null })(
                    <DatePicker placeholder="" style={{ width: 120 }} />
                  )}
                </FormItem>
              </Col>
            </Row>
          </div>
          <Row style={{ textAlign: 'right', padding: '0 24px 10px 0' }}>
            <Button style={{ marginRight: 16 }} onClick={e => this.onSerach()}>查询</Button>
            <Button onClick={e => this.reset()}>重置</Button>
          </Row>
        </Form>
        <div style={{ position: 'relative' }}>
          <Tooltip placement="top" title={'刷新'}>
            <Icon
              type="reload"
              style={{ position: 'absolute', left: 140, top: 10, zIndex: 999 }}
              onClick={e => {
                // 查询列表
                this.queryPlan(
                  null,
                  null,
                  null,
                  null,
                  null,
                  this.state.commitTimeFrame,
                  this.state.effectTimeFrame
                );
              }}
            />
          </Tooltip>
          <Table
            columns={columns}
            loading={this.props.loading}
            dataSource={data}
            scroll={{ x: 3220, y: 400 }}
            bordered
          />
        </div>
      </div>
    );
  }

  render() {
    const { form: { getFieldDecorator }, analysis: { getReferPlanData, queryPlanData } } = this.props;
    const myDate = new Date();
    const today = myDate.getFullYear() + '-' + myDate.getMonth() + 1 + '-' + myDate.getDate();
    let selectReferPlan = [];
    if (getReferPlanData.length > 0) {
      getReferPlanData.map((i) => {
        const list = (
          <Option value={i}>{i.modelId}</Option>
        );
        selectReferPlan.push(list);
      });
    }

    return (
      <PageHeaderLayout>
        <Card bordered={false} style={{ overflowY: 'scroll' }} id='top'>
          <div>
            {this.renderForm()}
          </div>
        </Card>
        <Modal
          title={`请在该方案生效期间内选择回溯期间：`}
          visible={this.state.setLookBackTimeModel}
          onOk={e => this.handleOkSetLookBackTime()}
          onCancel={e => {
            this.setState({
              setLookBackTimeModel: false,
              actionCompanyCode: null,
              actionModelId: null,
              actionPlanId: null,
              actionPlanName: null,
            });
          }}
          closable={false}
        >
          <FormItem label='方案生效期间' style={{ marginLeft: 24 }} layout="inline">
            {getFieldDecorator('lookBackEffectTimeLeftValue')(
              <DatePicker allowClear={false} />
            )}
            <span>~</span>
            {getFieldDecorator('lookBackEffectTimeRightValue')(
              <DatePicker allowClear={false} />
            )}
          </FormItem>
        </Modal>
        <Modal
          title={`请输入方案名称：`}
          visible={this.state.setCopyPlanNameModel}
          onOk={e => this.handleOkSetPalnName()}
          onCancel={e => { this.setState({ setCopyPlanNameModel: false, actionPlanId: null, actionCompanyCode: null, actionPlanName: null }); }}
          closable={false}
          destroyOnClose
        >
          <Form>
            <FormItem label={this.state.actionPlanName + '_'} style={{ display: 'inline-flex' }}>
              {getFieldDecorator(`copyPlanName`, { initialValue: '', rules: [{ max: 30, message: '必填且允许输入最长为30个字' }] })(
                <Input style={{ width: 240 }} placeholder='注：只允许输入30个字的长度' />
              )}
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title={`请选择参考方案或输入初始数据统计区间：`}
          visible={this.state.setCalculateModel}
          onOk={e => this.handleOkSetCalculate()}
          onCancel={e => { this.setState({ setCalculateModel: false, actionCompanyCode: null, actionModelId: null, actionPlanId: null, actionPlanName: null }); }}
          closable={false}
        >
          <Form layout="inline" >
            <Row style={{ display: 'none' }}>
              <Col>
                <FormItem label='参考方案' style={{ marginLeft: 24 }}>
                  {getFieldDecorator('plan')(
                    <Select style={{ width: 160 }} onSelect={this.selectReferPlan}>
                      {selectReferPlan.map((i) => { return i })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormItem label='保险起期' style={{ marginLeft: 24 }}>
                  {getFieldDecorator('calculateLeftValue', {
                    initialValue: this.state.calStartTime ? moment(this.state.calStartTime, 'YYYY-MM-DD') : null,
                  })(
                    <DatePicker disabled={this.state.companyCode ? (this.state.companyCode.length === 6 ? true : false) : ''} allowClear={false} />
                  )}
                  <span>~</span>
                  {getFieldDecorator('calculateRightValue', {
                    initialValue: this.state.calEndTime ? moment(this.state.calEndTime, 'YYYY-MM-DD') : null,
                  })(
                    <DatePicker disabled={this.state.companyCode ? (this.state.companyCode.length === 6 ? true : false) : ''} allowClear={false} />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
        <Modal
          title={``}
          visible={this.state.simulateModelVisiable}
          footer={null}
          closable={false}
          destroyOnClose={true}
          cancelText={'重置'}
          width={this.state.modelWidth}
          style={{ top: 0, minHeight: 400 }}
        >
          <SimulatePlan
            data={this.state.record}
            root={this}
          />
        </Modal>
      </PageHeaderLayout>
    );
  }
}

