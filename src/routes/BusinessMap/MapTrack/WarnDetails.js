import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Select, Spin, Modal, Row, Col, message, InputNumber } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';
import styles from './MapTracking.less';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class MapTracking extends Component {
  state = {
    columns: [],      // 表头
    datas: [],        // 表格数据
    pageNum: 1,       // 当前页
    total: 0,         // 总数
    pageSize: 10,     // 一页几条数据
    modalShow: false,
    cycle: [{ time: '周', key: 'week' }, { time: '月', key: 'month' }],
    id: null,         // 点击编辑后保存当前的id
    disabled: false,  // 是否禁用弹窗中的上面4个选项
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    const columns = [
      {
        title: '序号',
        width: 50,
        dataIndex: 'number',
        key: 'number',
        align: 'center'
      },
      {
        title: '预警指标',
        width: 200,
        dataIndex: 'measure',
        key: 'measure',
        align: 'center'
      },
      {
        title: '所属方案',
        width: 200,
        dataIndex: 'plan',
        key: 'plan',
        align: 'center'
      },
      {
        title: '所属机构',
        width: 200,
        dataIndex: 'company',
        key: 'company',
        align: 'center'
      },
      {
        title: '所属业务单元',
        width: 200,
        dataIndex: 'business',
        key: 'business',
        align: 'center'
      },
      {
        title: '时间单位',
        width: 150,
        dataIndex: 'time',
        key: 'time',
        align: 'center'
      },
      {
        title: '操作',
        width: 100,
        dataIndex: 'operation',
        align: 'center',
        render: (text, record, index) => {
          return (
            <span>
              <a onClick={() => this.edit(record.key, record.userConfig)}>编辑</a>
              <Divider type="vertical" />
              <span>
                <Popconfirm
                  title={"请确定是否要删除？"}
                  onConfirm={() => this.delete(record.key)}
                  okText="确定"
                  cancelText="取消"
                >
                  <a herf='#'>删除</a>
                </Popconfirm>
              </span>
            </span>
          );
        }
      },
    ];
    this.setState({ columns });

    this.getList();
    this.props.dispatch({
      type: 'analysis/getAlertEffectPlan'
    }).then(() => {
      const { planId } = this.props.analysis.getAlertEffectPlanData;
      this.props.dispatch({
        type: 'analysis/getPlanBusUnit',
        payload: {
          planId
        }
      }, err => {
        message.error(err.message)
      })
    }, err => {
      message.error(err.message)
    })

    this.props.dispatch({
      type: 'analysis/getAlertMeasureContent'
    }, err => {
      message.error(err.message)
    })
  }

  // 初始调用列表接口，同时也给增删改用
  getList = () => {
    this.props.dispatch({
      type: 'analysis/selectAlert'
    }).then(() => {
      const { selectAlertData } = this.props.analysis;
      // 因为后端没有做分页，所以前端进行分页，先获取前十数据
      const firstCount = selectAlertData.slice(0, 10);

      const datas = [];
      for (let i in firstCount) {
        let time;
        if (firstCount[i].alarmCycle === 'month') time = '月';
        else if (firstCount[i].alarmCycle === 'week') time = '周';
        datas.push({
          key: firstCount[i].alertId,
          number: Number(i) + 1,
          measure: firstCount[i].measureName,
          plan: firstCount[i].planName,
          company: firstCount[i].companyName,
          business: firstCount[i].nodeName,
          time,
          userConfig: firstCount[i].userConfig
        })
      }
      this.setState({ datas, total: selectAlertData.length })
    }, err => {
      message.error(err.message)
    })
  }

  // 点击新增按钮
  clickAdd = () => {
    this.setState({ modalShow: true, id: null, disabled: false })
  }

  // 弹窗点击确定
  add = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      // 此处需要额外判断，红色和黄色的预警，环比和实际值有一项填了就行
      const { dangerRingMore, dangerRingLow, dangerActualMore, dangerActualLow,
        warnRingMore, warnRingLow, warnActualMore, warnActualLow } = values;
      const redChoose = [dangerRingMore, dangerRingLow, dangerActualMore, dangerActualLow];
      const yellowChoose = [warnRingMore, warnRingLow, warnActualMore, warnActualLow];
      let danger, warn;
      for (let i of redChoose) {
        if (i) danger = true;
      }
      if (!danger) {
        message.warn('红色预警的环比或实际值至少填一个！');
        return;
      }
      for (let i of yellowChoose) {
        if (i) warn = true;
      }
      if (!warn) {
        message.warn('黄色预警的环比或实际值至少填一个！');
        return;
      }
      // -----------------------------------------------------------------
      const { id } = this.state;
      const { getAlertEffectPlanData: { planName, companyCode, companyName, modelId },
        getPlanBusUnitData, getAlertMeasureContentData } = this.props.analysis;

      const obj = {
        alertMeasureContent: [
          {
            ratio: {
              higher: values.warnRingMore,
              lower: values.warnRingLow
            },
            actualValue: {
              higher: values.warnActualMore,
              lower: values.warnActualLow
            },
            colourType: 'yellow',
            text: values.warnText.replace(/</g, '&lt;')
          }, {
            ratio: {
              higher: values.dangerRingMore,
              lower: values.dangerRingLow
            },
            actualValue: {
              higher: values.dangerActualMore,
              lower: values.dangerActualLow
            },
            colourType: 'red',
            text: values.dangerText.replace(/</g, '&lt;')
          }, {
            colourType: 'green',
            text: values.successText.replace(/</g, '&lt;')
          },
        ],
        userConfig: JSON.stringify(values)
      }
      // 如果id存在，说明是点击编辑进入的弹窗
      if (id) {
        obj.alertId = id;
        this.props.dispatch({
          type: 'analysis/updateAlert',
          payload: obj
        }).then(() => {
          message.success('修改成功！');
          this.closeModal();
          this.getList();
        }).catch(e => {
          message.warn(e.message);
        })
      } else {
        const payload = {
          planId: values.plan,
          planName,
          nodeId: values.busniess,
          companyCode,
          companyName,
          alarmCycle: values.cycle,
          measureCode: values.measure,
          userConfig: JSON.stringify(values),
          modelId,
          ...obj
        }
        for (let i of getPlanBusUnitData) {
          if (i.nodeId === values.busniess) payload.nodeName = i.nodeName;
        }
        for (let i of getAlertMeasureContentData) {
          if (i.measureCode === values.measure) {
            payload.measureName = i.measureName;
            payload.ratioCalFlag = i.ratioCalFlag;
            payload.unitFlag = i.unitFlag
          }
        }
        this.props.dispatch({
          type: 'analysis/addAlert',
          payload
        }).then(() => {
          message.success('保存成功！');
          this.closeModal();
          this.getList();
        }).catch(e => {
          message.warn(e.message);
        })
      }
    })
  }

  // 关闭弹窗
  closeModal = () => {
    this.setState({ modalShow: false });
    this.props.form.resetFields();
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    const { selectAlertData } = this.props.analysis;
    const startNum = (current - 1) * pageSize;
    const nowCount = selectAlertData.slice(startNum, startNum + pageSize);

    const datas = [];
    for (let i in nowCount) {
      let time;
      if (nowCount[i].alarmCycle === 'month') time = '月';
      else if (nowCount[i].alarmCycle === 'week') time = '周';
      datas.push({
        key: nowCount[i].alertId,
        number: startNum + Number(i) + 1,
        measure: nowCount[i].measureName,
        plan: nowCount[i].planName,
        company: nowCount[i].companyName,
        business: nowCount[i].nodeName,
        time,
        userConfig: nowCount[i].userConfig
      })
    }
    this.setState({ datas, pageSize })
  }

  // 表格的分页信息
  paginationProps = () => {
    const { total, pageSize } = this.state;
    const paginationProps = {
      pageSize,
      showSizeChanger: true,
      size: 'large',
      onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
      onChange: (current, pageSize) => this.changePageSize(pageSize, current),
      showTotal: () => `共${total}条数据`,
      total: total,
      pageSizeOptions: ['10', '20', '50', '100'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  // 编辑
  edit = (id, value) => {
    const values = JSON.parse(value);
    this.setState({ modalShow: true }, () => {
      this.props.form.setFieldsValue(values);
      this.setState({ id, disabled: true })
    })
  }

  // 删除
  delete = (id) => {
    this.props.dispatch({
      type: 'analysis/deleteAlert',
      payload: {
        alertId: id
      }
    }).then(() => {
      message.success('删除成功！');
      this.getList();
    }).catch(e => {
      message.warn(e.message)
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { columns, datas, modalShow, cycle, disabled } = this.state;
    const { getAlertEffectPlanData, getPlanBusUnitData, getAlertMeasureContentData } = this.props.analysis;

    const formItemLayout = {
      labelCol: { span: 12 },
      wrapperCol: { span: 12 },
    };
    const formItemLayout1 = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <header className={styles.header}>
              <div style={{ fontSize: 18 }}>
                <span className={styles.appName}>预警列表</span>
                <Button type='primary' onClick={this.clickAdd} style={{ marginLeft: 20 }}>新增</Button>
              </div>
              {/* <div style={{display: 'flex'}}>
                <FormItem label='所属机构' style={{display: 'flex', marginRight: 20}}>
                  { getFieldDecorator('company', {})(
                    <Select style={{width: 100}}>
                      { ['全部'].map(item => {
                        return (
                          <Option key={item} value={item}>{item}</Option>
                        )
                      }) }
                    </Select>
                  ) }
                </FormItem>
                <span style={{lineHeight: '40px'}}>数据截止：{'2020-02-11 18时'}</span>
              </div> */}
            </header>
            <Table
              columns={columns}
              pagination={this.paginationProps()}
              style={{ marginTop: 20 }}
              bordered
              size="middle"
              dataSource={datas} />

            <Modal
              visible={modalShow}
              title='新增/编辑预警'
              onOk={e => this.add(e)}
              onCancel={this.closeModal}
              // style={{width: 650}}
              width={650}
            >
              <Form layout="inline" style={{ textAlign: 'center', }}>
                <Row>
                  <Col span={12}>
                    <FormItem label='选择所属方案' {...formItemLayout}>
                      {getFieldDecorator('plan', {
                        initialValue: getAlertEffectPlanData.planId,
                        rules: [{ required: true, message: '必选' }]
                      })(
                        <Select disabled={disabled} style={{ width: 150 }}>
                          <Option title={getAlertEffectPlanData.planName} key={getAlertEffectPlanData.planId}
                            value={getAlertEffectPlanData.planId}>{getAlertEffectPlanData.planName}</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label='选择业务单元' {...formItemLayout}>
                      {getFieldDecorator('busniess', {
                        rules: [{ required: true, message: '必选' }]
                      })(
                        <Select disabled={disabled} style={{ width: 120 }}>
                          {getPlanBusUnitData.map(item => {
                            return (
                              <Option title={item.nodeName} key={item.nodeId} value={item.nodeId}>{item.nodeName}</Option>
                            )
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label='选择指标' {...formItemLayout}>
                      {getFieldDecorator('measure', {
                        rules: [{ required: true, message: '必选' }]
                      })(
                        <Select disabled={disabled} style={{ width: 150 }}>
                          {getAlertMeasureContentData.map(item => {
                            return (
                              <Option title={item.measureName} key={item.measureCode}
                                value={item.measureCode}>{item.measureName}</Option>
                            )
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label='选择指标周期' {...formItemLayout}>
                      {getFieldDecorator('cycle', {
                        rules: [{ required: true, message: '必选' }]
                      })(
                        <Select disabled={disabled} style={{ width: 120 }}>
                          {cycle.map(item => {
                            return (
                              <Option title={item.time} key={item.key} value={item.key}>{item.time}</Option>
                            )
                          })}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <Row style={{ marginTop: 20 }}>
                  <Col span={6} style={{ lineHeight: '38px' }}>
                    红色预警阈值-
                  </Col>
                  <Col span={18}>
                    <Row>
                      <Col span={10}>
                        <FormItem label='环比超过' {...formItemLayout}>
                          {getFieldDecorator('dangerRingMore', {
                            // rules: [{required: true, message: '必填'}]
                          })(
                            <InputNumber style={{ width: 100 }}></InputNumber>
                          )}
                        </FormItem>
                      </Col>
                      <Col span={4} style={{ lineHeight: '38px' }}>
                        或
                      </Col>
                      <Col span={10}>
                        <FormItem label='实际值超过' {...formItemLayout}>
                          {getFieldDecorator('dangerActualMore', {
                            // rules: [{required: true, message: '必填'}]
                          })(
                            <InputNumber style={{ width: 100 }}></InputNumber>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={6}></Col>
                  <Col span={18}>
                    <Row>
                      <Col span={10}>
                        <FormItem label='环比低于' {...formItemLayout}>
                          {getFieldDecorator('dangerRingLow', {
                            // rules: [{required: true, message: '必填'}]
                          })(
                            <InputNumber style={{ width: 100 }}></InputNumber>
                          )}
                        </FormItem>
                      </Col>
                      <Col span={4} style={{ lineHeight: '38px' }}>
                        或
                      </Col>
                      <Col span={10}>
                        <FormItem label='实际值低于' {...formItemLayout}>
                          {getFieldDecorator('dangerActualLow', {
                            // rules: [{required: true, message: '必填'}]
                          })(
                            <InputNumber style={{ width: 100 }}></InputNumber>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={6}></Col>
                  <Col span={18}>
                    <FormItem label='红色预警文本' {...formItemLayout1} style={{ width: '100%' }}>
                      {getFieldDecorator('dangerText', {
                        rules: [{ required: true, message: '必填' }]
                      })(
                        <Input style={{ width: '100%' }}></Input>
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <hr></hr>

                <Row style={{ marginTop: 20 }}>
                  <Col span={6} style={{ lineHeight: '38px' }}>
                    黄色预警阈值-
                  </Col>
                  <Col span={18}>
                    <Row>
                      <Col span={10}>
                        <FormItem label='环比超过' {...formItemLayout}>
                          {getFieldDecorator('warnRingMore', {
                            // rules: [{required: true, message: '必填'}]
                          })(
                            <InputNumber style={{ width: 100 }}></InputNumber>
                          )}
                        </FormItem>
                      </Col>
                      <Col span={4} style={{ lineHeight: '38px' }}>
                        或
                      </Col>
                      <Col span={10}>
                        <FormItem label='实际值超过' {...formItemLayout}>
                          {getFieldDecorator('warnActualMore', {
                            // rules: [{required: true, message: '必填'}]
                          })(
                            <InputNumber style={{ width: 100 }}></InputNumber>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={6}></Col>
                  <Col span={18}>
                    <Row>
                      <Col span={10}>
                        <FormItem label='环比低于' {...formItemLayout}>
                          {getFieldDecorator('warnRingLow', {
                            // rules: [{required: true, message: '必填'}]
                          })(
                            <InputNumber style={{ width: 100 }}></InputNumber>
                          )}
                        </FormItem>
                      </Col>
                      <Col span={4} style={{ lineHeight: '38px' }}>
                        或
                      </Col>
                      <Col span={10}>
                        <FormItem label='实际值低于' {...formItemLayout}>
                          {getFieldDecorator('warnActualLow', {
                            // rules: [{required: true, message: '必填'}]
                          })(
                            <InputNumber style={{ width: 100 }}></InputNumber>
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={6}></Col>
                  <Col span={18}>
                    <FormItem label='黄色预警文本' {...formItemLayout1} style={{ width: '100%' }}>
                      {getFieldDecorator('warnText', {
                        rules: [{ required: true, message: '必填' }]
                      })(
                        <Input style={{ width: '100%' }}></Input>
                      )}
                    </FormItem>
                  </Col>
                </Row>

                <hr></hr>

                <Row style={{ marginTop: 20 }}>
                  <Col span={6} style={{ lineHeight: '38px' }}>
                    绿色预警-
                  </Col>
                  <Col span={6}></Col>
                  <Col span={18}>
                    <FormItem label='绿色预警文本' {...formItemLayout1} style={{ width: '100%' }}>
                      {getFieldDecorator('successText', {
                        rules: [{ required: true, message: '必填' }]
                      })(
                        <Input style={{ width: '100%' }}></Input>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
