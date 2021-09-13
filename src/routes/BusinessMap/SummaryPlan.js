import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, message, Card, Input, Select, Button, Spin, Row, Col, Table } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import tableStyle from './table.css';

const FormItem = Form.Item;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()

export default class SummaryPlan extends PureComponent {
  state = {
    selectedRowKeys1: [],
    selectedRowKeys2: [],
    selectedRows1: [],
    selectedRows2: [],
    disable: false
  }
  // 离开界面 清空界面内容
  componentWillMount() {
    Object.keys(this.props.analysis).map((item) => {
      if (item === 'planNeedSummarizedData') {
        delete this.props.analysis[item]
      }
    });
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'analysis/selectEffectModel',
    }).then(() => {
      const { selectEffectModelData } = this.props.analysis;
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  selectModel = (modelId) => {
    this.setState({ 
      disable: false,  
      selectedRowKeys1: [],
      selectedRowKeys2: [],
      selectedRows1: [],
      selectedRows2: [], 
    });
    this.props.dispatch({
      type: 'analysis/planNeedSummarized',
      payload: {
        modelId,
      }
    }).then(() => {
      const { planNeedSummarizedData } = this.props.analysis;
      planNeedSummarizedData.map((i) => {
        if (i.planName === undefined) {
          this.setState({ disable: true });
          return;
        }
      });
    });
  }

  onSelectChange1 = (selectedRowKeys1, selectedRows1) => {
    this.setState({ selectedRowKeys1, selectedRows1 });
  };
  onSelectChange2 = (selectedRowKeys2, selectedRows2) => {
    this.setState({ selectedRowKeys2, selectedRows2 });
  };

  // 汇总
  summary = () => {
    const { selectedRows2, selectedRows1 } = this.state;
    const payloadData = [...selectedRows1, ...selectedRows2];
    if (payloadData.length > 0) {
      this.props.dispatch({
        type: 'analysis/toSummarizedPlan',
        payload: payloadData,
      }).then(() => {
        const { toSummarizedPlanData } = this.props.analysis;
        if (toSummarizedPlanData.lookbackData !== undefined && toSummarizedPlanData.lookbackData.length > 0) {
          const lookbackData = toSummarizedPlanData.lookbackData;
          const planInfo = toSummarizedPlanData.planInfo;
          const planId = planInfo.planId !== undefined ? planInfo.planId : '';
          const planName = planInfo.planName !== undefined ? planInfo.planName : '';
          const companyName = planInfo.companyName !== undefined ? planInfo.companyName : '';
          this.props.history.push({
            pathname: '/businessmap/summaryresults',
            lookbackData,
            planId,
            planName,
            companyName,
            payloadData,
          });
        }
      }).catch((e) => {
        message.warn(e.message);
      });
    } else {
      message.warn('请选择方案');
    }
  }

  renderForm = () => {
    const { getFieldDecorator } = this.props.form;
    const { selectEffectModelData, planNeedSummarizedData } = this.props.analysis;
    const selectEffectModel = [];
    if (selectEffectModelData.length > 0) {
      selectEffectModelData.map((i) => {
        const list = (
          <Select.Option value={i.modelID}>{i.modelName}</Select.Option>
        );
        selectEffectModel.push(list);
      });
    }
    const columns = [
      {
        title: '机构',
        dataIndex: 'companyName',
        align: 'center',
      },
      {
        title: '方案名称',
        dataIndex: 'planName',
        align: 'center',
        render: (text, record, index) => {
          return (
            record.planName !== undefined
              ?
              <span>{text}</span>
              :
              <span style={{ color: 'red' }}>未提交方案</span>
          );
        }
      },
      {
        title: '保险期间',
        dataIndex: 'time',
        align: 'center',
        render: (text, record, index) => {
          return (
            <span>
              {record.calStartTime !== undefined ? record.calStartTime.substring(0, 10) : record.calStartTime}
              <span style={{ display: record.calStartTime !== undefined ? '' : 'none' }}>~</span>
              {record.calEndTime !== undefined ? record.calEndTime.substring(0, 10) : record.calEndTime}
            </span>
          );
        }
      },
    ];
    const effectivePlan = [];
    const alternativePlan = [];
    if (planNeedSummarizedData !== undefined && planNeedSummarizedData.length > 0) {
      planNeedSummarizedData.map((i) => {
        if (i.runStatus === '7') { // 生效中方案
          effectivePlan.push(i);
        } else { // 备选方案
          alternativePlan.push(i);
        }
      })
    }
    const { selectedRowKeys1, selectedRowKeys2 } = this.state;
    const rowSelection1 = {
      selectedRowKeys1,
      onChange: this.onSelectChange1,
    };
    const rowSelection2 = {
      selectedRowKeys2,
      onChange: this.onSelectChange2,
    };

    return (
      <PageHeaderLayout>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <span>请选择进行方案汇总的模型：</span>
            <Select onSelect={e => { this.selectModel(e) }} style={{ width: 200, marginRight: 20 }}>
              {selectEffectModel.map((i) => { return i; })}
            </Select>
            <Button
              disabled={this.state.disable}
              onClick={e => this.summary(e)}
            >汇总</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <div style={{ width: '49%' }}>
              <Table
                rowSelection={rowSelection1}
                columns={columns}
                dataSource={alternativePlan}
                bordered
                pagination={false}
                scroll={{ y: 400 }}
                title={() => {
                  return <span style={{ display: 'inherit', textAlign: 'center' }}>备选方案</span>
                }}
              />
            </div>
            <div style={{ width: '49%' }}>
              <Table
                rowSelection={rowSelection2}
                columns={columns}
                dataSource={effectivePlan}
                bordered
                pagination={false}
                scroll={{ y: 400 }}
                title={() => {
                  return <span style={{ display: 'inherit', textAlign: 'center' }}>生效中的方案</span>
                }}
              />
            </div>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }

  render() {
    return (
      <div>
        {this.renderForm()}
      </div>
    );
  }
}
