import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, message, Card, Input, Select, Button, Spin, Modal, Table } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import tableStyle from './table.css';

const Option = Select.Option;
const FormItem = Form.Item;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class SimulateProject extends PureComponent {
  state = {
    planId: '',
    domain: '',
    initNodesData: [],
    show: '',
    loading: false,
    tableWidth: '184%',
    selectData: [],
    newMockPrmProportion: [], //保费占比新值
    visible: false,
    totalCount: 0,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'analysis/getUserInfo'
    }).then(() => {
      const { getUserInfoData } = this.props.analysis;
      if (getUserInfoData.domain !== undefined && getUserInfoData.domain !== '') {
        // 获取模拟数据
        this.props.dispatch({
          type: 'analysis/initPlan',
          payload: {
            planId: 'F_0101_1555645957',
            domain: getUserInfoData.domain,
          },
        }).then(() => {
          const { initPlanData } = this.props.analysis;
          this.setState({ 
            initNodesData: initPlanData.nodes, 
            planId: 'F_0101_1555645957', 
            domain: getUserInfoData.domain,
            loading: true 
          });
          setTimeout(()=>{
            this.setState({ loading: false });
          },200);
        }).catch((e) => {
          message.warn(e.message);
        });
      }
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  reload = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const dataLen = this.state.initNodesData.length;
      for (var i = 0; i < dataLen; i++) {
        if (values[`mockPriceStrategy${i}`] === '') {
          message.warn('请确认[报价策略方案申报]都选择了具体策略');
          return;
        }
      }
      const dataList = []
      const inputDom = document.getElementById('right_table2').getElementsByTagName('input');
      for (const i in inputDom) {
        if (inputDom[i]) {
          if (typeof (inputDom[i]) == "object" && inputDom[i].getAttribute('attrid') !== '') {
            const attrdata = inputDom[i].getAttribute('attrdata');
            const list = {
              planId: this.state.planId,
              indexName: attrdata.split('-')[0],
              nodeId: attrdata.split('-')[1],
              indexValue: inputDom[i].value/100,
            };
            dataList.push(list);
          }
        }
      }
      const payloadData = [...dataList, ...this.state.selectData, ...this.state.newMockPrmProportion];
      this.props.dispatch({
        type: 'analysis/doPredict',
        payload: payloadData,
      }).then(() => {
        const {initNodesData} = this.props.analysis;
        this.setState({ initNodesData, loading: true });
        setTimeout(()=>{
          this.setState({ loading: false });
        },200);
      }).catch((e) => {
        message.warn(e.message);
      });
    });
  }

  savePlan = () => {
    this.props.dispatch({
      type: 'analysis/savePlan',
      payload: {
        planId: this.state.planId,
        domain: this.state.domain,
      }
    }).then(()=>{
    }).catch((e)=>{
      message.warn(e.message)
    });
  }

  toSave = (e) => {
    if (this.state.show === '') {
      this.setState({ show: 'none', tableWidth: '92%' })
    } else {
      this.setState({ show: '', tableWidth: '184%' });
    }
  }

  onChange = (value, nodes) => {
    let temp = [], newTemp = [];
    const list = {
      planId: this.state.planId, 
      indexName: nodes.split('-')[0],
      nodeId: nodes.split('-')[1], 
      indexValue: value, 
    };
    temp.push(list);
    if (this.state.selectData.length > 0) {
      for (var i = 0; i < this.state.selectData.length; i++) {
        if (this.state.selectData[i]['nodeId'] === nodes.split('-')[1]) {
          this.state.selectData.splice(i,1);
        }
      }
    }
    newTemp = [...this.state.selectData, ...temp];
    this.setState({ selectData: newTemp });
  }

  clickA = (i) => {
    if (i.nodeId !== 'No.00') {
      this.props.dispatch({
        type: 'analysis/prmProCheck',
        payload: {
          planId: this.state.planId,
          nodeId: i.nodeId,
        },
      }).then(()=>{
        const {prmProCheckData} = this.props.analysis;
        let totalCount = 0;
        prmProCheckData.map((i) => {
          const itemVlaue = (i.mockPrmProportion*100).toFixed(2);
          totalCount += Number(itemVlaue);
        });
        if (totalCount === 100) {
          this.setState({ totalCount: '100.00', visible: true });   
        } else {
          this.setState({ totalCount, visible: true });   
        }
             
      });
    }
  }

  renderForm = () => {
    const { analysis: { initPlanData }, form: { getFieldDecorator } } = this.props;
    let nodesData = [];
    if (this.state.initNodesData !== undefined && this.state.initNodesData.length > 0) {
      nodesData = this.state.initNodesData;
    }
    const tableHeader1 = [
      { title: '签单保费(万元)', color: '#F2F2F2' },
      { title: '保单件数', color: '#F2F2F2' },
      { title: '保费占比(%)', color: '#F2F2F2' },
      { title: '基准赔付率(含NCD)(%)', color: '#F2F2F2' },
      { title: '整体平均总折扣率', color: '#F2F2F2' },
      { title: '整体平均自主系数', color: '#F2F2F2' },
      { title: '近2个月总折扣(%)', color: '#F2F2F2' },
      { title: '近2个月平均自主系数', color: '#F2F2F2' },
      { title: '近2个月保单获取成本率(%)', color: '#F2F2F2' },
      { title: '满期赔付率(%)', color: '#F2F2F2' },
      // { title: '满期赔付率(含未决进展)(%)', color: '#F2F2F2', name: 'expPayRateAdj' }
    ];
    const tableHeader2 = [
      { title: '保费占比(选定)(%)', color: '#FFEFD0' },
      { title: '基准赔付率(含NCD)选定(%)', color: '#FFEFD0' },
      { title: '策略A:总折扣管控(%)', color: '#FFEFD0' },
      { title: '策略B:自主系数管控(%)', color: '#FFEFD0' },
      { title: '预期赔付率(不含间接理赔费用)(%)', color: '#EFC0D0' },
      { title: '保单获取成本配置方案(不含销推、不含税)(%)', color: '#FFEFD0' },
      { title: '预期变动成本率(%)', color: '#EFC0D0' },
      { title: '预期综合成本率(含总部分摊)(%)', color: '#EFC0D0' },
      { title: '预期综合成本率(不含总部分摊)(%)', color: '#EFC0D0' },
      { title: '报价策略方案申报', color: '#FFEFD0' },
    ];

    const right_div2_th = [], right_div2_tr = [], right_div1_th = [], right_div1_tr = [];
    tableHeader1.map((item)=> {
      const th = (
        <th key={item.title} style={{ borderRight: 'none' }}>{item.title}</th>
      );
      right_div1_th.push(th);
    });
    tableHeader2.map((item) => {
      const th = (
        <th style={{ background: `${item.color}`, width: item.title === '报价策略方案申报' ? 64 : 90 }} key={item.title}>{item.title}</th>
      );
      right_div2_th.push(th);
    });

    if (nodesData.length > 0) {
      nodesData.map((i, index) => {
        const nodeId = i.nodeId;
        const tr1 = (
          <tr key={index}>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0' }}>
              <a 
                id={nodeId}
                style={{ display: 'inline-block', width: '100%', color: '#020202' }} 
                onClick={e=>{ this.clickA(i) }}>
                {(i.mockPrmProportion.indexValue*100).toFixed(2)}
              </a>
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0' }}>
              {getFieldDecorator(`mockBasicPayRate${index}`, { initialValue: (i.mockBasicPayRate.indexValue*100).toFixed(2) })(
                index === 0 ? <span>{(i.mockBasicPayRate.indexValue*100).toFixed(2)}</span> : 
                <Input
                  disabled={index === 0 ? true : false}
                  attrdata={'mockBasicPayRate' + '-' + `${nodeId}`}
                  attrid={this.props.form.getFieldValue(`mockBasicPayRate${index}`) === (i.mockBasicPayRate.indexValue*100).toFixed(2) ? '' : `mockBasicPayRate${index}`}
                />
              )}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0' }}>
              {getFieldDecorator(`mockTotalDiscount${index}`, { initialValue: (i.mockTotalDiscount.indexValue*100).toFixed(2) })(
                index === 0 ? <span>{(i.mockTotalDiscount.indexValue*100).toFixed(2)}</span> : 
                <Input
                  disabled={index === 0 ? true : false}
                  attrdata={'mockTotalDiscount' + '-' + `${nodeId}`}
                  attrid={this.props.form.getFieldValue(`mockTotalDiscount${index}`) === (i.mockTotalDiscount.indexValue*100).toFixed(2) ? '' : `mockTotalDiscount${index}`}
                />
              )}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0' }}>
              {getFieldDecorator(`mockAutoCoeff${index}`, { initialValue: (i.mockAutoCoeff.indexValue*100).toFixed(2) })(
                index === 0 ? <span>{(i.mockAutoCoeff.indexValue*100).toFixed(2)}</span> : 
                <Input
                  disabled={index === 0 ? true : false}
                  attrdata={'mockAutoCoeff' + '-' + `${nodeId}`}
                  attrid={this.props.form.getFieldValue(`mockAutoCoeff${index}`) === (i.mockAutoCoeff.indexValue*100).toFixed(2) ? '' : `mockAutoCoeff${index}`}
                />
              )}
            </td>
            <td style={{ background: '#EFC0D0', borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.prePayRate*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0' }}>
              {getFieldDecorator(`mockPolicyCostRate${index}`, { initialValue: (i.mockPolicyCostRate.indexValue*100).toFixed(2) })(
                index === 0 ? <span>{(i.mockPolicyCostRate.indexValue*100).toFixed(2)}</span> : 
                <Input
                  attrdata={'mockPolicyCostRate' + '-' + `${nodeId}`}
                  attrid={this.props.form.getFieldValue(`mockPolicyCostRate${index}`) === (i.mockPolicyCostRate.indexValue*100).toFixed(2) ? '' : `mockPolicyCostRate${index}`}
                />
              )}
            </td>
            <td style={{ background: `${i.color}`, borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.preChaCostRate*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#EFC0D0' }}>{(i.preCostRateIn*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#EFC0D0' }}>{(i.preCostRateEx*100).toFixed(2)}</td>
            <td style={{ width: 64, borderTop: index === 0 ? 'none' : '1px solid', background: '#FFEFD0' }}>
               <div attrdata={'mockPriceStrategy' + '-' + `${nodeId}` +'-'+ `${i.mockPriceStrategy.indexValue}`}>
               {getFieldDecorator(`mockPriceStrategy${index}`, { initialValue: i.mockPriceStrategy.indexValue })(
                <Select
                  onSelect={e=>{this.onChange(e, 'mockPriceStrategy' + '-' + `${nodeId}`)}}
                  style={{ width: '70%' }}>
                  <Option value={'A'}>A</Option>
                  <Option value={'B'}>B</Option>
                </Select>
                )} 
              </div> 
            </td>
          </tr>
        );
        const tr2 = (
          <tr style={{ height: 25 }}>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{(Math.round((i.acceptPrm / 10000) * 10) / 10).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{i.plyNum}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.acceptPrmRate*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.payRateNcd*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.avgDiscount*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.avgDouDiscount*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.avgDiscount2m*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.avgDouDiscount2m*100).toFixed(2)}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.feeRate*100).toFixed(2)}</td>
            <td style={{ borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid' }}>{(i.expPayRate*100).toFixed(2)}</td>
          </tr>
        ); 
        right_div2_tr.push(tr1);
        right_div1_tr.push(tr2);
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
          <div className={tableStyle.right_div1} style={{ display: 'flex', width: this.state.tableWidth }}>
            <table className={`${tableStyle.right_table1}`} style={{ display: this.state.show }}>
              <tbody>
                <tr>
                  {right_div1_th.map((i)=> { return i })}
                </tr>
              </tbody>
            </table>
            <table className={`${tableStyle.right_table1}`}>
              <tbody>
                <tr>
                  {right_div2_th.map((i) => { return i })}
                </tr>
              </tbody>
            </table>
          </div>
          <div className={tableStyle.right_div2} style={{ display: 'flex', width: this.state.tableWidth }}>
            <table className={`${tableStyle.right_table2}`} style={{ display: this.state.show }}>
              <tbody>
                <tr>
                  {right_div1_tr.map((i)=> { return i })}
                </tr>
              </tbody>
            </table>
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

  changeInput = (index) => {
    let sum = 0;
    const inputDom = document.getElementById('modelContent').getElementsByTagName('input');
    setTimeout(()=>{
      for (var i = 0; i < inputDom.length; i++) {
        if (inputDom[i].value !== '') {
          sum += Number(inputDom[i].value);
        }
      }
      this.setState({ totalCount: sum.toFixed(2) });
    },200);
  }

  modelList = () => {
    const { analysis: {prmProCheckData} , form: {getFieldDecorator}} = this.props;
    const listData = [];
    if (prmProCheckData.length > 0) {
      prmProCheckData.map((i, index) => {
        const list = (
          <tr style={{ padding: 10, fontSize: 15 }}>
            <td style={{ border: '1px solid', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.nodeId}
            </td>
            <td style={{ width: '30%', border: '1px solid', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {(i.mockPrmProportion*100).toFixed(2)}
            </td>
            <td style={{ width: '30%', border: '1px solid', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {getFieldDecorator(`${i.nodeId}`, { initialValue: (i.mockPrmProportion*100).toFixed(2) })(
              <Input 
                onChange={e=>this.changeInput(i)}  
                style={{ textAlign: 'center', fontSize: 15 }}
              />
              )}
            </td>
          </tr>
        );
        listData.push(list);
      });
    }

    return (
      <div id="modelContent" style={{ textAlign: 'center' }}>
        <table>
          <tbody>
            <tr>
              <td style={{ border: '1px solid' }}>业务单元</td>
              <td style={{ width: '30%', border: '1px solid' }}>保费占比(选定)(%)（原值）</td>
              <td style={{ width: '30%', border: '1px solid' }}>保费占比(选定)(%)（新值）</td>
            </tr>
          </tbody>
        </table>
        <div style={{ height: 320, overflowY: 'scroll', width: 429 }}>
          <table>
            <tbody>
              {listData.map((i) => { return i })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 8, textAlign: 'right' }}>
          保费占比(选定)合计：
          <span style={{ fontSize: 16, color: this.state.totalCount === '100.00' ? 'green' : 'red', marginRight: 2 }}>
          {this.state.totalCount === '100.00' ? 100 : this.state.totalCount}</span>%
        </div>
      </div>
    );
  }

  hideModal = () => {
    const listData = [];
    if (this.state.totalCount === '100.00') {
      const inputDom = document.getElementById('modelContent').getElementsByTagName('input');
      const aDom = document.getElementById('right_table2').getElementsByTagName('a');
      for (var i = 0; i < inputDom.length; i++) {
        for (var j =0; j < aDom.length; j++) {
          if (inputDom[i].value !== '') {
            if (inputDom[i].getAttribute('id') === aDom[j].getAttribute('id')) {
              aDom[j].innerText = inputDom[i].value;
              aDom[j].style.color = 'red';
            }
          } else {
            message.warn('请确认所有的[保费占比]都已经输入具体的值');
            return;
          }
        }
        const list = {
          planId: this.state.planId,
          indexName: 'mockPrmProportion',
          nodeId: inputDom[i].getAttribute('id'),
          indexValue: inputDom[i].value/100,
        };
        listData.push(list);
      }
      this.setState({ visible: false, newMockPrmProportion: listData, totalCount: 0 });
    } else {
      message.warn('请确认“保费占比（新值）”累加是否为100');
    }
  }

  render() {
    const { initPlanData } = this.props.analysis;
    let calStartTime = '', calEndTime = '', planId = '', planName = '';
    if (initPlanData.plan !== undefined) {
      calStartTime = initPlanData.plan.calStartTime;
      calEndTime = initPlanData.plan.calEndTime;
      planId = initPlanData.plan.planId;
      planName = initPlanData.plan.planName;
    }
    return (
      <PageHeaderLayout>
        <div style={{ fontSize: 14, textAlign: 'center', padding: '14px 0' }}>
          <span>
            <span>保险起期：</span><span><span>{calStartTime.slice(0, 11)}</span> ~ <span>{calEndTime.slice(0, 11)}</span></span>
          </span>
          <span style={{ margin: '0 14px' }}>
            <span>方案编码：</span><span>{planId}</span>
          </span>
          <span>
            <span>方案名称：</span><span>{planName}-</span><Input style={{ width: 60 }} />
          </span>
          <span>
            <Button onClick={e => { this.reload(e) }} style={{ margin: '0 10px' }}>刷新</Button>
            <Button onClick={e=>{ this.savePlan(e) }}>保存</Button>
            <Button style={{ margin: '0 10px' }}>提交</Button>
            <Button onClick={e=>{ this.toSave(e) }}>另存为</Button>
          </span>
        </div>
        <div style={{ overflow: 'scroll' }}>
          <Spin spinning={this.state.loading}>
            {this.renderForm()}
          </Spin>
        </div>
        <Modal
          title="请输入该业务单元及其关联业务单元的保费占比值，需保证以下业务单元的保费占比合计为100%。"
          visible={this.state.visible}
          onOk={this.hideModal}
          onCancel={e=>{ this.setState({ visible: false }) }}
          destroyOnClose
          closable={false}
          style={{ top: 10 }}
          width={460}
          okText="确认"
          cancelText="取消"
        >
          {this.modelList()}
        </Modal>
      </PageHeaderLayout>
    );
  }
}
