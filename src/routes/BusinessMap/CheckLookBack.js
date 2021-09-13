import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, message, Card, Input, Select, Button, Spin } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import tableStyle from './table.css';

const Option = Select.Option;
const FormItem = Form.Item;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class CheckLookBack extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      planId: this.props.location.planId !== undefined ? this.props.location.planId : null,
    }
  }

  // 清空界面内容
  componentWillMount() {
    Object.keys(this.props.analysis).map((item) => {
      if (item === 'lookbackData') {
        delete this.props.analysis[item]
      }
    });
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'analysis/lookback',
      payload: {
        planId: this.state.planId,
      },
    }).then(() => {
      const { lookbackData } = this.props.analysis;
    }).catch((e) => {
      message.warn(e.message);
    });

    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-spin-container').style.width = '95%';

    setTimeout(() => {
      // 根据第一列的每一行的高度 设置右边表格的高度
      const left_div2 = document.getElementById('left_div2').getElementsByTagName('tr');
      const right_table2 = document.getElementById('right_table2').getElementsByTagName('tr');
      if (left_div2 !== null) {
        for (var i = 0; i < left_div2.length; i++) {
          const height = left_div2[i].offsetHeight;
          right_table2[i].style.height = left_div2[i].offsetHeight + 'px';
        }
      }
      
      const rightTable1Height = document.getElementById('rightTable1').offsetHeight;
      document.getElementById('leftTable1').style.height = rightTable1Height + 'px';
      const leftDiv2Height = document.getElementById('left_div2').offsetHeight;
      // if (leftDiv2Height < 400) {
      //   document.getElementById('left_div2').style.height = leftDiv2Height + 'px';
      //   document.getElementById('right_div2').style.height = leftDiv2Height + 'px';
      // } else {
      //   document.getElementById('left_div2').style.height = 400 + 'px';
      //   document.getElementById('right_div2').style.height = 400 + 'px';
      // }
    }, 500);
    // 表格第一列滚动
    this.handleElementScroll(this.sContent);
  }
  handleElementScroll(content) {
    if (content) {
      const _content = content;
      _content.onscroll = (e) => {
        const tempTop = e.srcElement.scrollTop;
        this.sLeft.scrollTop = tempTop;
      }
    }
  }

  lookbackDownload = (e) => {
    this.props.dispatch({
      type: 'analysis/lookBackDownLoad',
      payload: {
        planId: this.state.planId
      }
    }).then().catch((e)=>{
      message.warn(e.message);
    })
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
      { title: '策略B:自主系数管控(方案)', color: '#FFEFD0' },
      { title: '策略B:自主系数管控(实际)', color: '#FFEFD0' },
      { title: '差值', color: '#FFEFD0' },
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

    const right_div1_th = [], right_div2_tr = [], left_div2_tr = [];
    tableHeader.map((item, index) => {
      const th = (
        <th style={{ background: `${item.color}`, width: 64, height: 111 }} key={index}>{item.title}</th>
      );
      right_div1_th.push(th);
    });
    if (lookbackData !== undefined && lookbackData.planList !== undefined && lookbackData.planList.length > 0) {
      const diffList = lookbackData.diffList;
      const resultList = lookbackData.resultList;
      const planList = lookbackData.planList;
      diffList.map((i, index) => {
        const tr = (
          <tr key={index}>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].mockPrmProportion !== undefined ? (planList[index].mockPrmProportion * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].mockPrmProportion !== undefined ? (resultList[index].mockPrmProportion * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockPrmProportion !== undefined ? (i.mockPrmProportion * 100).toFixed(2) : ''}
            </td>

            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].mockBasicPayRate !== undefined ? (planList[index].mockBasicPayRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].mockBasicPayRate !== undefined ? (resultList[index].mockBasicPayRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockBasicPayRate !== undefined ? (i.mockBasicPayRate * 100).toFixed(2) : ''}
            </td>

            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].mockTotalDiscount !== undefined ? (planList[index].mockTotalDiscount * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].mockTotalDiscount !== undefined ? (resultList[index].mockTotalDiscount * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockTotalDiscount !== undefined ? (i.mockTotalDiscount * 100).toFixed(2) : ''}
            </td>

            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].mockAutoCoeff !== undefined ? planList[index].mockAutoCoeff.toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].mockAutoCoeff !== undefined ? resultList[index].mockAutoCoeff.toFixed(2) : ''}</td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockAutoCoeff !== undefined ? i.mockAutoCoeff.toFixed(2) : ''}
            </td>

            <td style={{ background: '#FFC0D0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].prePayRate !== undefined ? (planList[index].prePayRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFC0D0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].prePayRate !== undefined ? (resultList[index].prePayRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: `${i.prePayRate.color}`, width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.prePayRate.indexValue !== undefined ? (i.prePayRate.indexValue * 100).toFixed(2) : ''}
            </td>

            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].mockPolicyCostRate !== undefined ? (planList[index].mockPolicyCostRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].mockPolicyCostRate !== undefined ? (resultList[index].mockPolicyCostRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFEFD0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockPolicyCostRate !== undefined ? (i.mockPolicyCostRate * 100).toFixed(2) : ''}
            </td>

            <td style={{ background: '#FFC0D0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].preChaCostRate !== undefined ? (planList[index].preChaCostRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFC0D0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].preChaCostRate !== undefined ? (resultList[index].preChaCostRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: `${i.prePayRate.color}`, width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.preChaCostRate.indexValue !== undefined ? (i.preChaCostRate.indexValue * 100).toFixed(2) : ''}
            </td>

            <td style={{ background: '#FFC0D0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].preCostRateIn !== undefined ? (planList[index].preCostRateIn * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFC0D0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].preCostRateIn !== undefined ? (resultList[index].preCostRateIn * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: `${i.preCostRateIn.color}`, width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.preCostRateIn.indexValue !== undefined ? (i.preCostRateIn.indexValue * 100).toFixed(2) : ''}
            </td>

            <td style={{ background: '#FFC0D0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {planList[index].preCostRateEx !== undefined ? (planList[index].preCostRateEx * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#FFC0D0', width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {resultList[index].preCostRateEx !== undefined ? (resultList[index].preCostRateEx * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: `${i.preCostRateIn.color}`, width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.preCostRateEx.indexValue !== undefined ? (i.preCostRateEx.indexValue * 100).toFixed(2) : ''}
            </td>
          </tr>
        );
        right_div2_tr.push(tr);
        const leftTr = (
          <tr>
            <td style={{height:45}} title={resultList[index].business.length > 36 ? resultList[index].business : ''}>
              {resultList[index].business.length > 36 ? resultList[index].business.slice(0,33) + '...' : resultList[index].business}
            </td>
          </tr>
        );
        left_div2_tr.push(leftTr);
      });
    }

    return (
      <div className={tableStyle.container} style={{ width: '100%', height:'100%', display: 'flex'}}>
        <div className={tableStyle.left_div} style={{height:'100%'}}>
          <div className={tableStyle.left_div1}>
            <table className={`${tableStyle.left_table1}`} id='leftTable1'>
              <tbody>
                <tr>
                  <th>业务单元名称</th>
                </tr>
              </tbody>
            </table>
          </div>
          <div 
            style={{height:'calc(100% - 129px)'}}
            className={tableStyle.left_div2} 
            ref={(s) => { this.sLeft = s; }}
            id='left_div2'
          >
            <table className={`${tableStyle.left_table2}`}>
              <tbody>
                {left_div2_tr.map((i) => { return i })}
              </tbody>
            </table>
          </div>
        </div>
        <div className={tableStyle.right_div} style={{height:'100%'}}>
          <div 
            style={{width: 1750}}
            className={tableStyle.right_div1}
            id= 'right_div1'
          >
            <table className={`${tableStyle.right_table1}`} id='rightTable1'>
              <tbody>
                <tr>
                  {right_div1_th.map((i) => { return i })}
                </tr>
              </tbody>
            </table>
          </div>
          <div 
            style={{height:'calc(100% - 112px)', width: 1750}}
            className={tableStyle.right_div2} 
            id='right_div2'
            ref={(s) => { this.sContent = s; }}
          >
            <table className={`${tableStyle.right_table2}`} id="right_table2">
              <tbody>
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
    if (lookbackData !== undefined && lookbackData.plan !== undefined) {
      lookbackPeriod = lookbackData.plan.lookbackPeriod;
      startTime = lookbackData.plan.startTime;
      planId = lookbackData.plan.planId;
      planName = lookbackData.plan.planName;
    }
    return (
      <PageHeaderLayout>
        <div style={{ height:'100%' }}>
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
            <Button onClick={e=>this.lookbackDownload(e)}>下载回溯结果</Button>
          </div>
          <div style={{height:'80%'}}>
            <Spin spinning={this.props.loading} style={{height:'100%'}}>
              {this.renderForm()}
            </Spin>
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}
