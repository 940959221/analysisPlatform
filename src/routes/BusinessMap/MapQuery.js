import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Col, Row, Divider, Popconfirm, Table, Card, message, Select, Button, Modal, DatePicker, Input, Cascader
} from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class MapQuery extends PureComponent {
  state = {
    createFmodelVisiable: false,
    modelID: null,
    modelName: null,
    companyCode: null,
    validateFlag: null,
    userCompany: null,
    userCompanyCode: '',
    calStartTime: null,
    calEndTime: null,
    referPlanCompanyCode: null,
    referPlanCompanyName: null,
    hasSelectCompany: false,
    referenceScheme: false,    // 用于判断参考方案是否显示
    planId: '',    // 新增的一个参数，在createPlan接口下使用
    insuranceTime: true,  // 起保日期是否置灰
  }

  componentDidMount() {
    // 获取已有模型列表
    this.getModelList(this.state.modelID, this.state.modelName, this.state.companyCode, this.state.validateFlag);
    // 模型管理查询机构列表
    this.props.dispatch({
      type: 'analysis/getCompanyInManage',
    });

    // //新建方案获取机构
    //   this.props.dispatch({
    //     type: 'analysis/getCompanyInAddPlan',
    //   }).then(()=>{
    //     const {getCompanyInAddPlanData} = this.props.analysis;
    //   });

    // 获取用户
    this.props.dispatch({
      type: 'analysis/getUserInfo'
    }).then(() => {
      const { getUserInfoData } = this.props.analysis;
      this.setState({ userCompanyCode: getUserInfoData.companyCode });
    });
  }

  getModelList = (modelID, modelName, companyCode, validateFlag) => {
    this.props.dispatch({
      type: 'analysis/getModelList',
      payload: {
        modelID,
        modelName,
        companyCode,
        validateFlag,
      },
    });
  }

  // 编辑
  editTreeDom = (e, record, operate) => {
    if (record !== '') {
      if (operate === 'check') {
        this.props.history.push({ pathname: '/businessmap/mapcreate', state: record, operate, });
      } else if (operate === 'copy') {
        this.props.history.push({ pathname: '/businessmap/mapcreate', state: record, operate, });
      } else {
        this.props.dispatch({
          type: 'analysis/enableEditModel',
          payload: {
            modelID: record.modelID,
          }
        }).then(() => {
          this.props.history.push({ pathname: '/businessmap/mapcreate', state: record, operate, });
        }).catch((e) => {
          message.warn(e.message);
        });
      }
    }
  }

  // 删除
  deleteTree = (e, record) => {
    if (record !== '') {
      this.props.dispatch({
        type: 'analysis/deleteModel',
        payload: {
          modelID: record.modelID,
        }
      }).then(() => {
        // 获取已有模型列表
        this.getModelList(this.state.modelID, this.state.modelName, this.state.companyCode, this.state.validateFlag);
      }).catch((e) => {
        message.warn(e.message);
      })
    }
  }

  // 点击创建方案获取所属机构
  creatPlan = (e, record) => {
    if (record !== '') {
      //新建方案获取机构
      this.props.dispatch({
        type: 'analysis/getCompanyInAddPlan',
        payload: {
          companyCode: record.companyCode,
        },
      }).then(() => {
        // referenceScheme、insuranceTime和planId是后面修改时候加的，在打开弹窗的时候先还原state的初始数据    2019.7.23
        this.setState({ createFmodelVisiable: true, modelID: record.modelID, referenceScheme: false, planId: '', insuranceTime: true })
      }).catch((e) => {
        message.warn(e.message);
      });
    }
  }

  //创建方案
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const leftValue = values.leftValue._d.getTime();
      const rightValue = values.rightValue._d.getTime();
      if (rightValue < leftValue) {
        message.warn('右侧值需大于左侧值！');
        return;
      }
      let timeFrame = {};
      if (values.leftValue !== null && values.rightValue !== null) {
        timeFrame = {
          leftValue: values.leftValue.format("YYYY-MM-DD"), rightValue: values.rightValue.format("YYYY-MM-DD")
        };
      } else {
        message.warn('请选择具体的时间');
        return;
      }
      let planName = '';
      if (values.planName !== '') {
        planName = values.planName;
      } else {
        message.warn('请填写方案名称');
        return;
      }
      const companyCode = { companycode: '', };
      const companyName = '';
      this.props.dispatch({
        type: 'analysis/createPlan',
        payload: {
          modelId: this.state.modelID,
          timeFrame,
          companyCode: this.state.referPlanCompanyCode,
          companyName: this.state.referPlanCompanyName,
          planName: 'F_' + this.state.referPlanCompanyName + '_' + planName,
          referPlanId: this.state.planId,
        }
      }).then(() => {
        this.setState({ createFmodelVisiable: false, hasSelectCompany: false });
      }).catch((e) => {
        message.warn(e.message);
      });
    });
  }

  // 获取列表状态
  getValidateFlag = (value) => {
    let v = ''
    switch (value) {
      case '0':
        v = '未生效';
        break;
      case '1':
        v = '生效中';
        break;
      case '2':
        v = '已失效';
        break;
      case null:
        v = '全部';
        break;
    }
    return v;
  }

  search = () => {
    const modelID = this.props.form.getFieldValue('modelID');
    const modelName = this.props.form.getFieldValue('modelName');
    // 获取已有模型列表
    this.getModelList(modelID, modelName, this.state.companyCode, this.state.validateFlag);
  }

  reset = () => {
    this.props.form.setFieldsValue({ companyName: null, status: null, modelID: null, modelName: null });
  }

  selectUserCompany = (value) => {
    if (value.split('-')[0].length === 6) {
      this.setState({ referenceScheme: true });
      this.props.dispatch({
        type: 'analysis/getReferPlan',
        payload: {
          companyCode: value.split('-')[0]
        }
      }).then(() => {
        const { getReferPlanData } = this.props.analysis;
        this.props.form.setFieldsValue({
          plan: '',
          leftValue: null,
          rightValue: null,
        });
      });
    } else this.setState({ referenceScheme: false, insuranceTime: false })
    this.setState({
      referPlanCompanyCode: value.split('-')[0],
      referPlanCompanyName: value.split('-')[1],
      hasSelectCompany: true,
    });
  }

  selectReferPlan = (value) => {
    this.setState({ planId: value.split('+')[3] })
    this.props.form.setFieldsValue({
      leftValue: moment(value.split('+')[1]),
      rightValue: moment(value.split('+')[2]),
    });
  }

  renderForm() {
    const { form: { getFieldDecorator, getFieldValue, loading },
      analysis: { getModelListData, getCompanyInManageData, getCompanyInAddPlanData, getReferPlanData } } = this.props;
    let data = [];
    if (getModelListData && getModelListData.length > 0) {
      data = getModelListData
    }
    const columns = [
      {
        title: '模型编码',
        dataIndex: 'modelID',
        align: 'center',
        fixed: 'left',
        width: 120,
      },
      {
        title: '模型名称',
        dataIndex: 'modelName',
        align: 'center',
        fixed: 'left',
        width: 200,
        render: (text, record, index) => {
          return (
            <span>
              <a onClick={e => this.editTreeDom(e, record, 'check')}>{text}</a>
            </span>
          );
        },
      },
      {
        title: '归属机构',
        dataIndex: 'companycName',
        align: 'center',
        fixed: 'left',
        width: 140,
      },
      {
        title: '状态',
        dataIndex: 'validateFlag',
        align: 'center',
        fixed: 'left',
        width: 140,
        render: (text, record, index) => {
          return (
            <span>{this.getValidateFlag(text)}</span>
          );
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        // width: 200,
        render: (text, record, index) => {
          return (
            <span>
              <a
                style={{ color: record.enableCopy === '0' ? '#9d9c9e' : '#0088cc' }}
                onClick={e => this.editTreeDom(e, record.enableCopy === '0' ? '' : record, 'copy')}>复制</a>
              <Divider type="vertical" />
              <a
                style={{ color: record.enableEdit === '0' ? '#9d9c9e' : '#0088cc' }}
                onClick={e => this.editTreeDom(e, record.enableEdit === '0' ? '' : record, 'edit')}>
                编辑
              </a>
              <Divider type="vertical" />
              {
                record.enableDelete === '0'
                  ?
                  <a herf='#' style={{ color: record.enableDelete === '0' ? '#9d9c9e' : '#0088cc' }}>删除</a>
                  :
                  <Popconfirm
                    title={"请确定是否要删除模型？"}
                    onConfirm={e => this.deleteTree(e, record.enableDelete === '0' ? '' : record)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a herf='#' style={{ color: record.enableDelete === '0' ? '#9d9c9e' : '#0088cc' }}>删除</a>
                  </Popconfirm>
              }
              <Divider type="vertical" />
              <a
                style={{ color: record.enableAddPlan === '0' ? '#9d9c9e' : '#0088cc' }}
                onClick={e => this.creatPlan(e, record.enableAddPlan === '0' ? '' : record)}>创建方案</a>
            </span>
          );
        }
      },
      {
        title: '操作人',
        dataIndex: 'createUser',
        align: 'center',
        width: 200,
      },
      {
        title: '操作时间',
        dataIndex: 'createTime',
        align: 'center',
        width: 180,
      },
      {
        title: '生效时间',
        dataIndex: 'effectiveTime',
        align: 'center',
        width: 180,
      },
      {
        title: '失效时间',
        dataIndex: 'invalidTime',
        align: 'center',
        width: 180,
      },
    ];

    const statusList = [];
    const ststusData = [
      { status: '全部', flag: null },
      { status: '生效中', flag: '1' },
      { status: '已失效', flag: '2' },
      { status: '未生效', flag: '0' },
    ]
    ststusData.map((i) => {
      const list = (
        <Option value={i.flag}>{i.status}</Option>
      );
      statusList.push(list);
    });

    const companyData = [<Option value={null}>{'全部'}</Option>];
    if (getCompanyInManageData && getCompanyInManageData.length > 0) {
      getCompanyInManageData.map((i) => {
        const list = (
          <Option value={i.companyCode}>{i.companycName}</Option>
        );
        companyData.push(list);
      });
    }
    let selectUserCompany = [];
    let selectReferPlan = [];
    if (getCompanyInAddPlanData.length > 0) {
      getCompanyInAddPlanData.map((i) => {
        const list = (
          <Option value={i.companyCode + '-' + i.companycName}>{i.companycName}</Option>
        );
        selectUserCompany.push(list);
      });
    }
    if (getReferPlanData.length > 0) {
      getReferPlanData.map((i) => {
        const list = (
          <Option value={i.planName + '+' + i.calStartTime + '+' + i.calEndTime + '+' + i.planId}>{i.planName}</Option>
        );
        selectReferPlan.push(list);
      });
    }

    return (
      <div>
        <Form onSubmit={e => this.submitForm(e)} layout="inline"
          style={{ border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center', padding: '10px 0' }}
        >
          <Row>
            <Col>
              <FormItem label='归属机构'>
                {getFieldDecorator('companyName', { initialValue: null })(
                  <Select style={{ width: 130 }} onSelect={v => { this.setState({ companyCode: v }); }}>
                    {companyData.map((item) => { return item })}
                  </Select>
                )}
              </FormItem>
              <FormItem label='状态'>
                {getFieldDecorator('status', { initialValue: null })(
                  <Select style={{ width: 100 }} onSelect={v => { this.setState({ validateFlag: v }); }}>
                    {statusList.map((item) => { return item })}
                  </Select>
                )}
              </FormItem>
              <FormItem label='模型编码'>
                {getFieldDecorator('modelID', { initialValue: null })(
                  <Input style={{ width: 140 }} />
                )}
              </FormItem>
              <FormItem label='模型名称'>
                {getFieldDecorator('modelName', { initialValue: null })(
                  <Input style={{ width: 180 }} />
                )}
              </FormItem>
              <Button style={{ marginRight: 16 }} onClick={e => { this.search() }}>查询</Button>
              <Button onClick={e => { this.reset() }}>重置</Button>
            </Col>
          </Row>
        </Form>
        <Modal
          title={`请选择${this.state.userCompanyCode.length !== 6 ? '方案归属机构和初始数据统计区间：' : '方案归属机构和参考方案：'}`}
          visible={this.state.createFmodelVisiable}
          onOk={e => this.handleOk()}
          onCancel={e => { this.setState({ createFmodelVisiable: false, hasSelectCompany: false }); }}
          closable={false}
          destroyOnClose
        >
          <Form layout="inline" >
            <Row>
              <Col>
                <FormItem label='方案归属机构'>
                  {getFieldDecorator('companyCode', { initialValue: '' })(
                    <Select style={{ width: 330 }} onSelect={this.selectUserCompany}>
                      {selectUserCompany.map((i) => { return i })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: this.state.hasSelectCompany ? '' : 'none' }}>
              <Col>
                <FormItem label='方案名称' style={{ marginLeft: 12 }}>
                  <span>F_{this.state.referPlanCompanyName}_</span>
                  {getFieldDecorator('planName', { initialValue: '', rules: [{ max: 30, message: '允许输入最长为30个字' }] })(
                    <Input style={{ width: 276 }} placeholder='注：只允许输入30个字的长度' />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>   {/*  style={{ display: this.state.userCompanyCode.length === 6 ? '' : 'none' }}  原本这行的属性 */}
              <Col>
                <FormItem label='参考方案' style={this.state.referenceScheme ? { marginLeft: 24, display: 'block' } : { display: 'none' }}>
                  {getFieldDecorator('plan')(
                    <Select style={{ width: 300 }} onSelect={this.selectReferPlan}>
                      {selectReferPlan.map((i) => { return i })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col>
                <FormItem label='保险起期' style={{ marginLeft: 24 }}>
                  {getFieldDecorator('leftValue', {
                    initialValue: null,
                  })(
                    <DatePicker allowClear={false} disabled={this.state.insuranceTime} />
                  )}
                  <span>~</span>
                  {getFieldDecorator('rightValue', {
                    initialValue: null,
                  })(
                    <DatePicker allowClear={false} disabled={this.state.insuranceTime} />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
        <Table
          columns={columns}
          dataSource={data}
          bordered
          scroll={{ x: 1540, y: 400 }}
        />
      </div>
    );
  }
  // linhao3@sinosafe.com.cn
  render() {
    return (
      <PageHeaderLayout>
        <Card bordered={false} style={{ overflowY: 'scroll' }} id='top'>
          <div>
            {this.renderForm()}
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
