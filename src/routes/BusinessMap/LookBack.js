import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, message, Card, Input, Select, Button } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import tableStyle from './table.css';

const Option = Select.Option;
const FormItem = Form.Item;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class LookBack extends PureComponent {
  state = {
    planId: '',
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'analysis/lookback',
      payload: {
        planId: 'F_0101_1555645957',
      },
    }).then(() => {
      const { lookbackData } = this.props.analysis;
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  renderForm = () => {
    const { analysis: { lookbackData } } = this.props;
    const tableHeader = [
      { title: '保费占比(方案)(%)', color: '#FFEFD0' },
      { title: '保费占比(实际)(%)', color: '#FFEFD0' },
      { title: '差值(%)', color: '#FFEFD0' },
      { title: '基准赔付率(含NCD)(方案)(%)', color: '#FFEFD0' },
      { title: '基准赔付率(含NCD)(实际)(%)', color: '#FFEFD0' },
      { title: '差值(%)', color: '#FFEFD0' },
      { title: '策略A:总折扣管控(方案)(%)', color: '#FFEFD0' },
      { title: '策略A:总折扣管控(实际)(%)', color: '#FFEFD0' },
      { title: '差值(%)', color: '#FFEFD0' },
      { title: '策略B:自主系数管控(方案)(%)', color: '#FFEFD0' },
      { title: '策略B:自主系数管控(实际)(%)', color: '#FFEFD0' },
      { title: '差值(%)', color: '#FFEFD0' },
      { title: '预期赔付率(不含间接理赔费用)(方案)(%)', color: '#FFC0D0' },
      { title: '预期赔付率(不含间接理赔费用)(实际)(%)', color: '#FFC0D0' },
      { title: '差值(%)', color: '#FFC0D0' },
      { title: '保单获取成本配置方案(不含销推、不含税)(方案)(%)', color: '#FFEFD0' },
      { title: '保单获取成本配置方案(不含销推、不含税)(实际)(%)', color: '#FFEFD0' },
      { title: '差值(%)', color: '#FFEFD0' },
      { title: '预期变动成本率(方案)(%)', color: '#FFC0D0' },
      { title: '预期变动成本率(实际)(%)', color: '#FFC0D0' },
      { title: '差值(%)', color: '#FFC0D0' },
      { title: '预期综合成本率(含总部分摊)(方案)(%)', color: '#FFC0D0' },
      { title: '预期综合成本率(含总部分摊)(实际)(%)', color: '#FFC0D0' },
      { title: '差值(%)', color: '#FFC0D0' },
      { title: '预期综合成本率(不含总部分摊)(方案)(%)', color: '#FFC0D0' },
      { title: '预期综合成本率(不含总部分摊)(实际)(%)', color: '#FFC0D0' },
      { title: '差值(%)', color: '#FFC0D0' },
    ];

    const right_div1_th = [], right_div2_tr = [];
    tableHeader.map((item, index) => {
      const th = (
        <th style={{ background: `${item.color}`, width: 56 }} key={index}>{item.title}</th>
      );
      right_div1_th.push(th);
    });
    if (lookbackData.planList !== undefined && lookbackData.planList.length > 0) {
      const diffList = lookbackData.diffList;
      const resultList = lookbackData.resultList;
      const planList = lookbackData.planList;
      diffList.map((i, index)=> {
        const tr = (
          <tr key={index}>
            <td style={{ background: '#FFEFD0', width: 56 }}>{planList[index].mockPrmProportion}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{resultList[index].mockPrmProportion}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{i.mockPrmProportion}</td>

            <td style={{ background: '#FFEFD0', width: 56 }}>{planList[index].mockBasicPayRate}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{resultList[index].mockBasicPayRate}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{i.mockBasicPayRate}</td>

            <td style={{ background: '#FFEFD0', width: 56 }}>{planList[index].mockTotalDiscount}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{resultList[index].mockTotalDiscount}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{i.mockTotalDiscount}</td>

            <td style={{ background: '#FFEFD0', width: 56 }}>{planList[index].mockAutoCoeff}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{resultList[index].mockAutoCoeff}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{i.mockAutoCoeff}</td>

            <td style={{ background: '#FFC0D0', width: 56 }}>{planList[index].prePayRate}</td>
            <td style={{ background: '#FFC0D0', width: 56 }}>{resultList[index].prePayRate}</td>
            <td style={{ background: `${i.prePayRate.color}`, width: 56 }}>{i.prePayRate.indexValue}</td>

            <td style={{ background: '#FFEFD0', width: 56 }}>{planList[index].mockPolicyCostRate}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{resultList[index].mockPolicyCostRate}</td>
            <td style={{ background: '#FFEFD0', width: 56 }}>{i.mockPolicyCostRate}</td>

            <td style={{ background: '#FFC0D0', width: 56 }}>{planList[index].preChaCostRate}</td>
            <td style={{ background: '#FFC0D0', width: 56 }}>{resultList[index].preChaCostRate}</td>
            <td style={{ background: `${i.prePayRate.color}`, width: 56 }}>{i.preChaCostRate.indexValue}</td>

            <td style={{ background: '#FFC0D0', width: 56 }}>{planList[index].preCostRateIn}</td>
            <td style={{ background: '#FFC0D0', width: 56 }}>{resultList[index].preCostRateIn}</td>
            <td style={{ background: `${i.preCostRateIn.color}`, width: 56 }}>{i.preCostRateIn.indexValue}</td>

            <td style={{ background: '#FFC0D0', width: 56 }}>{planList[index].preCostRateEx}</td>
            <td style={{ background: '#FFC0D0', width: 56 }}>{resultList[index].preCostRateEx}</td>
            <td style={{ background: `${i.preCostRateIn.color}`, width: 56 }}>{i.preCostRateEx.indexValue}</td>
          </tr>
      );
          right_div2_tr.push(tr);
    });
    }

    return (
      <div className={tableStyle.container}>
        <div className={tableStyle.left_div}>
          <div className={tableStyle.left_div1}>
            <table className={`${tableStyle.left_table1}`}>
              <tbody>
                <tr>
                  <th>业务单元名称</th>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={tableStyle.left_div2}>
            <table className={`${tableStyle.left_table2}`}>
              <tbody></tbody>
            </table>
          </div>
        </div>
        <div className={tableStyle.right_div}>
          <div className={tableStyle.right_div1} style={{ width: '156%' }}>
            <table className={`${tableStyle.right_table1}`}>
                <tbody>
                  <tr>
                    {right_div1_th.map((i) => { return i })}
                  </tr>
                </tbody>
              </table>
          </div>
          <div className={tableStyle.right_div2} style={{ width: '157%' }}>
            <table className={`${tableStyle.right_table2}`}>
              <tbody id="right_table2">
                {right_div2_tr.map((i) => { return i })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { lookbackData } = this.props.analysis;
    let lookbackPeriod = '', startTime = '', planId = '', planName = '';
    if (lookbackData.plan !== undefined) {
      lookbackPeriod = lookbackData.plan.lookbackPeriod;
      startTime = lookbackData.plan.startTime;
      planId = lookbackData.plan.planId;
      planName = lookbackData.plan.planName;
    }
    return (
      <PageHeaderLayout>
        <div style={{ overflowY: 'scroll' }}>
          <div style={{ fontSize: 14, textAlign: 'center', padding: '14px 0' }}>
            <span>
              <span>生效时间：</span><span>{startTime}</span>
            </span>
            <span style={{ margin: '0 14px' }}>
              <span>回溯期间：</span><span>{lookbackPeriod}</span>
            </span>
            <span>
              <span>方案编码：</span><span>{planId}</span>
            </span>
            <span style={{ margin: '0 14px' }}>
              <span>方案名称：</span><span>{planName}</span>
            </span>
            <Button>下载回溯结果</Button>
          </div>
          <div>
            {this.renderForm()}
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}
