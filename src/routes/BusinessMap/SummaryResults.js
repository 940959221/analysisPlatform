import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, message, Card, Input, Select, Button, Spin, Row, Col, Table, Modal } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import CheckBrachPlan from './CheckBrachPlan';
import tableStyle from './table.css';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';

const FormItem = Form.Item;

const rightTableDiv = {
  height: 400, 
  overflow: 'hidden', 
  overflowY: 'scroll', 
  width: '102%'
}

const rightTableTd = {
  width: 80, 
  border: '1px solid', 
}

const rightTableTdColr1 = {
  background: '#FFEFD0'
}

const rightTableTdColr2 = {
  background: '#EFC0D0'
}

const rightTableTdColr3 = {
  background: '#FFF'
}

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()

export default class SummaryResults extends PureComponent {
  state = {
    modelVisible: false,
    lookbackData: this.props.location.lookbackData !== undefined ? this.props.location.lookbackData : [],
    planId: this.props.location.planId !== undefined ? this.props.location.planId : '',
    planName: this.props.location.planName !== undefined ? this.props.location.planName : '',
    companyName: this.props.location.companyName !== undefined ? this.props.location.companyName : '',
    payloadData: this.props.location.payloadData !== undefined ? this.props.location.payloadData : [],
    hasSave: false,
  }
  componentDidMount() {
    const index = this.state.planName.lastIndexOf("\_");
    const planNames = document.getElementById('planNames');
    if (planNames !== null) {
      planNames.value = this.state.planName.substring(index + 1, this.state.planName.length);
    }
    document.querySelector('.ant-card-body').style.height='100%'; // 修改Card标签主体的高度
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

  submitPlan = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.props.dispatch({
        type: 'analysis/submitPlan',
        payload: {
          planId: this.state.planId,
        }
      }).then(()=>{

      }).catch((e)=>{
        message.warn(e.message);
      });
    });
  }

  savePlan = (e) => {
    const planNames = document.getElementById('planNames').value;
    const first = this.state.planName.indexOf("_") + 1;
    let heng = this.state.planName.indexOf("_", first);
    const anaPlanIds = [];
    const timeFrame = {};
    const payloadData = this.state.payloadData;
    if (payloadData.length > 0) {
      payloadData.map((i) => {
        anaPlanIds.push(i.planId);
        timeFrame['leftValue'] = i.calStartTime;
        timeFrame['rightValue'] = i.calEndTime;
      })
    }
    if (!this.state.hasSave) {
      this.props.dispatch({
        type: 'analysis/saveSummarizedPlan',
        payload: {
          timeFrame,
          anaPlanIds,
          planId: this.state.planId,
          planName: this.state.planName.substring(0, heng) +'_'+ planNames,
        },
      }).then(()=>{
        this.setState({ hasSave: true });
      }).catch((e)=>{
        message.warn(e.message);
      });
    } else {
      message.warn('该方案已经保存了');
    }
  }

  // 查看支公司方案
  checkCrenPlan = (e) => {
    this.props.dispatch({
      type: 'analysis/getCrenPlan',
      payload: {
        planId: this.state.planId,
      },
    }).then(() => {
      const { getCrenPlanData } = this.props.analysis;
      Modal.success({
        title: this.state.planName + '由以下方案汇总而成：',
        width: 550,
        style: {top: 30},
        okText: '确定',
        content: (
          <CheckBrachPlan datalist={getCrenPlanData} />
        ),
        onOk() { },
      });
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  renderForm = () => {
    const { getFieldDecorator } = this.props.form;
    const tableHeader1 = [
      { title: '跟单净保费(万元)', color: '#F2F2F2' },
      { title: '近一年跟单净保费(万元)', color: '#F2F2F2' },
      { title: '保单件数', color: '#F2F2F2' },
      { title: '保费占比(%)', color: '#F2F2F2' },
      { title: '近一年保费占比(%)', color: '#F2F2F2' },
      { title: '满期出险频度', color: '#F2F2F2' },
      { title: '变动成本率(当前新业务水平)', color: '#F2F2F2', name: 'chaCostRate' },
      { title: '基准赔付率(含NCD)(%)', color: '#F2F2F2' },
      { title: '公司整体基准赔付率(含NCD)(%)', color: '#F2F2F2' },
      { title: '整体平均总折扣率', color: '#F2F2F2' },
      { title: '整体平均自主系数', color: '#F2F2F2' },
      { title: '近2个月总折扣(%)', color: '#F2F2F2' },
      { title: '近2个月平均自主系数', color: '#F2F2F2' },
      { title: '近2个月保单获取成本率(%)', color: '#F2F2F2' },
      { title: '满期赔付率(%)', color: '#F2F2F2' },
      { title: '满期赔付率(含未决进展)(%)', color: '#F2F2F2', name: 'expPayRateAdj' }
    ];

    const tableHeader2 = [
      { title: '保费占比(选定)(%)', color: '#FFEFD0' },
      { title: '基准赔付率(含NCD)选定(%)', color: '#FFEFD0' },
      { title: '策略A:总折扣管控(%)', color: '#FFEFD0' },
      { title: '策略B:自主系数管控', color: '#FFEFD0' },
      { title: '预期赔付率(不含间接理赔费用)(%)', color: '#EFC0D0' },
      { title: '保单获取成本配置方案(不含销推、不含税)(%)', color: '#FFEFD0' },
      { title: '预期变动成本率(%)', color: '#EFC0D0' },
      { title: '预期综合成本率(含总部分摊)(%)', color: '#EFC0D0' },
      { title: '预期综合成本率(不含总部分摊)(%)', color: '#EFC0D0' },
    ]

    const right_div1_th = [], right_div2_tr = [], left_div2_tr = [], right_div1_tr = [], right_div2_th = [];
    tableHeader1.map((item) => {
      const th = (
        <th style={{ background: `${item.color}`, }} style={{ borderRight: 'none' }}>
          {item.title}
        </th>
      );
      right_div1_th.push(th);
    });
    tableHeader2.map((item) => {
      const th = (
        <th style={{ background: `${item.color}`, width: item.title === '报价策略方案申报' ? 64 : 88 }} key={item.title}>
          {item.title}
        </th>
      );
      right_div2_th.push(th);
    });
    const { lookbackData } = this.state;
    if (lookbackData.length > 0) {
      lookbackData.map((i,index) => {
        const tr1 = (
          <tr>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.acceptPrm ? i.acceptPrm.toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.acceptPrmYear ? i.acceptPrmYear.toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.plyNum ? i.plyNum : '0'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.acceptPrmRate ? (i.acceptPrmRate*100).toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.acceptPrmRateYear ? (i.acceptPrmRateYear*100).toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.expClmFreq ? i.expClmFreq.toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.chaCostRate ? i.chaCostRate.toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.payRateNcd ? (i.payRateNcd*100).toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.payrateNcdAll ? (i.payrateNcdAll*100).toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.avgDiscount ? (i.avgDiscount*100).toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.avgDouDiscount ? i.avgDouDiscount.toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.avgDiscount2m ? (i.avgDiscount2m*100).toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.avgDouDiscount2m ? i.avgDouDiscount2m.toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.feeRate ? (i.feeRate*100).toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid', borderRight: 0}}>
              {i.expPayRate ? (i.expPayRate*100).toFixed(2) : '0.00'}
            </td>
            <td style={{...rightTableTdColr3, borderTop: index === 0 ? 'none' : '1px solid', borderRight: 0}}>
              {i.expPayRateAdj ? (i.expPayRateAdj * 100).toFixed(2) : '0.00'}
            </td>
          </tr>
        );
        const tr2 = (
          <tr key={index}>
            <td style={{...rightTableTdColr1, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.mockPrmProportion !== undefined ? (i.mockPrmProportion*100).toFixed(2) : ''}
            </td>
            <td style={{...rightTableTdColr1, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.mockBasicPayRate !== undefined ? (i.mockBasicPayRate*100).toFixed(2) : ''}
            </td>
            <td style={{...rightTableTdColr1, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.mockTotalDiscount !== undefined ? (i.mockTotalDiscount*100).toFixed(2) : ''}
            </td>
            <td style={{...rightTableTdColr1, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.mockAutoCoeff !== undefined ? i.mockAutoCoeff.toFixed(2) : ''}
            </td>
            <td style={{...rightTableTdColr2, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.prePayRate !== undefined ? (i.prePayRate*100).toFixed(2) : ''}
            </td>
            <td style={{...rightTableTdColr1, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.mockPolicyCostRate !== undefined ? (i.mockPolicyCostRate*100).toFixed(2) : ''}
            </td>
            <td style={{...rightTableTdColr2, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.preChaCostRate !== undefined ? (i.preChaCostRate*100).toFixed(2) : ''}
            </td>
            <td style={{...rightTableTdColr2, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.preCostRateIn !== undefined ? (i.preCostRateIn*100).toFixed(2) : ''}
            </td>
            <td style={{...rightTableTdColr2, borderTop: index === 0 ? 'none' : '1px solid'}}>
              {i.preCostRateEx !== undefined ? (i.preCostRateEx*100).toFixed(2) : ''}
            </td>
          </tr>
        );
        const leftDiv2Tr = (
          <tr style={{height:45}}>
            <td title={i.business.length > 32 ? i.business : ''} style={{boxSizing:'border-box', height:45}} 
              style={index === 0 ? {height:'27px'} : {}}>
              {i.business.length > 32 ? i.business.slice(0,29) + '...' : i.business}
            </td>
          </tr>
        );
        right_div1_tr.push(tr1);
        right_div2_tr.push(tr2);
        left_div2_tr.push(leftDiv2Tr);
      });
    }
    const first = this.state.planName.indexOf("_") + 1;
    let heng = this.state.planName.indexOf("_", first);

    return (
      <PageHeaderLayout style={{height:'100%'}} data-set='PageHeaderLayout'>
        <Card style={{height:'100%'}} id='Card_card'>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span>方案编码：{this.state.planId}</span>
            <span style={{ margin: '0 20px' }}>
              <FormItem label={this.state.planName.substring(0, heng) + '_'} 
                style={{ display: 'inline-flex', marginTop: -4 }}
              >
                {getFieldDecorator(`planNames`, { rules: [{ max: 30, message: '允许输入最长为30个字' }] })(
                  <Input style={{ width: 240 }} id='planNames' placeholder='注：只允许输入30个字的长度'/>
                )}
              </FormItem>
            </span>
            <Button onClick={e => { this.savePlan(e) }}>保存</Button>
            <Button 
              style={{ margin: '0 20px' }}
              disabled={!this.state.hasSave}
              onClick={e => { this.submitPlan(e) }}>
              提交
            </Button>
            <Button 
              disabled={!this.state.hasSave}
              onClick={e => this.checkCrenPlan(e) }>
              查看支公司方案
            </Button>
          </div>
          <div style={{height:'100%'}}>
            <div className={tableStyle.container} style={{display:'flex', height:'100%'}}>
              <div className={tableStyle.left_div} style={{height:'90%'}}>
                <div className={tableStyle.left_div1}>
                  <table className={`${tableStyle.left_table1}`} style={{height:76}}>
                    <tbody style={{height:76}}>
                      <tr>
                        <th>业务单元名称</th>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={tableStyle.left_div2} ref={(s) => { this.sLeft = s; }} id='left_div2' style={{height:'calc(100% - 93px)'}}>
                  <table className={`${tableStyle.left_table2}`}>
                    <tbody>
                      {left_div2_tr.map((i) => { return i })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={tableStyle.right_div} id='right_div' style={{height:'90%'}}>
                <div className={tableStyle.right_div1} style={{ width: 2220, height:76,  }}>
                  <div className={tableStyle.right_divx}>
                    <table className={`${tableStyle.right_table1}`} style={{ display: this.state.showTable, float: 'left', height: '100%' }}>
                      <tbody>
                        <tr>
                          {right_div1_th.map((i) => { return i })}
                        </tr>
                      </tbody>
                    </table>
                    <table className={`${tableStyle.right_table1}`} style={{height:'100%', width: 794}}>
                      <tbody>
                        <tr>
                          {right_div2_th.map((i) => { return i })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div
                  className={tableStyle.right_div2}
                  id='right_div2'
                  style={{ width: 2220, height:'calc(100% - 76px)' }}
                  ref={(s) => { this.sContent = s; }}
                >
                  <table
                    className={`${tableStyle.right_table2}`}
                    style={{ display: this.state.showTable }}
                    id="right_div1_tr"
                  >
                    <tbody>
                      {right_div1_tr.map((i) => { return i })}
                    </tbody>
                  </table>
                  <table className={`${tableStyle.right_table2}`} id="right_table2">
                    <tbody>
                      {right_div2_tr.map((i) => { return i })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
        </Card>
      </PageHeaderLayout>
    );
  }

  render() {
    return (
      <div style={{height:'100%'}}>
        {this.renderForm()}
      </div>
    );
  }
}
