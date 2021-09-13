import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, message, Card, Input, Select, Button, Spin, Modal, Table, Popconfirm } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import tableStyle from './table.css';
import ExportJsonExcel from 'js-export-excel';   // 导出excel

const Option = Select.Option;
const FormItem = Form.Item;

const tableHeader1 = [
  { title: '跟单净保费(万元)', color: '#F2F2F2', name: 'acceptPrm' },
  { title: '近一年跟单净保费(万元)', color: '#F2F2F2', name: 'acceptPrmYear' },
  { title: '保单件数', color: '#F2F2F2', name: 'plyNum' },
  { title: '保费占比(%)', color: '#F2F2F2', name: 'acceptPrmRate' },
  { title: '近一年保费占比(%)', color: '#F2F2F2', name: 'acceptPrmRateYear' },
  { title: '满期出险频度', color: '#F2F2F2', name: 'expClmFreq' },
  { title: '变动成本率(当前新业务水平)', color: '#F2F2F2', name: 'chaCostRate' },
  { title: '基准赔付率(含NCD)(%)', color: '#F2F2F2', name: 'payRateNcd' },
  { title: '公司整体基准赔付率(含NCD)(%)', color: '#F2F2F2', name: 'payrateNcdAll' },
  { title: '整体平均总折扣率', color: '#F2F2F2', name: 'avgDiscount' },
  { title: '整体平均自主系数', color: '#F2F2F2', name: 'avgDouDiscount' },
  { title: '近2个月总折扣(%)', color: '#F2F2F2', name: 'avgDiscount2m' },
  { title: '近2个月平均自主系数', color: '#F2F2F2', name: 'avgDouDiscount2m' },
  { title: '近2个月保单获取成本率(%)', color: '#F2F2F2', name: 'feeRate' },
  { title: '满期赔付率(%)', color: '#F2F2F2', name: 'expPayRate' },
  { title: '满期赔付率(含未决进展)(%)', color: '#F2F2F2', name: 'expPayRateAdj' }
];

const tableHeader2 = [
  { title: '保费占比(选定)(%)', color: '#FFEFD0', name: 'mockPrmProportionBean+indexValue' },
  { title: '基准赔付率(含NCD)选定(%)', color: '#FFEFD0', name: 'mockBasicPayRateBean+indexValue' },
  { title: '策略A:总折扣管控(%)', color: '#FFEFD0', name: 'mockTotalDiscountBean+indexValue' },
  { title: '策略B:自主系数管控', color: '#FFEFD0', name: 'mockAutoCoeffBean+indexValue' },
  { title: '预期赔付率(不含间接理赔费用)(%)', color: '#EFC0D0', name: 'prePayRate' },
  { title: '保单获取成本配置方案(不含销推、不含税)(%)', color: '#FFEFD0', name: 'mockPolicyCostRateBean+indexValue' },
  { title: '预期变动成本率(%)', color: '#EFC0D0', name: 'preChaCostRate' },
  { title: '预期综合成本率(含总部分摊)(%)', color: '#EFC0D0', name: 'preCostRateIn' },
  { title: '预期综合成本率(不含总部分摊)(%)', color: '#EFC0D0', name: 'preCostRateEx' },
  { title: '报价策略方案申报', color: '#FFEFD0', name: 'mockPriceStrategyBean+indexValue' },
];

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class SimulatePlan extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      initNodesData: [],
      show: '',
      loading: false,
      tableWidth: '162%',
      selectData: [],
      newMockPrmProportion: [], //保费占比新值
      visible: false,
      totalCount: 0,
      planId: this.props.data !== undefined ? this.props.data.planId : '',
      planName: this.props.data !== undefined ? this.props.data.planName : '',
      companyCode: this.props.data !== undefined ? this.props.data.companyCode : '',
      actionPlanName: '',
      savePlanModel: false,
      rightDivBoxWidth: 1036,
      rightDivBoxOverflow: 'scroll auto',
      dataList: [],
      savePlan: true, // 判断提交按钮是否禁用
    }
  }
  componentWillMount() {
    this.setState({ loading: true });
  }

  componentDidMount() {
    // 获取某个方案权限
    this.props.dispatch({
      type: 'analysis/getPlanAuth',
      payload: {
        planId: this.state.planId,
      }
    }).then(() => {
      const { getPlanAuthData } = this.props.analysis;
    });

    // 获取模拟数据
    this.props.dispatch({
      type: 'analysis/initPlan',
      payload: {
        planId: this.state.planId,
      },
    }).then(() => {
      const { initPlanData } = this.props.analysis;
      this.setState({
        initNodesData: initPlanData.nodes,
      });
      if (initPlanData.nodes !== undefined && initPlanData.nodes.length > 0) {
        setTimeout(() => {
          // 根据第一列的每一行的高度 设置右边表格的高度
          const left_div2 = document.getElementById('left_div2').getElementsByTagName('tr');
          const right_table1 = document.getElementById('right_table1').getElementsByTagName('tr');
          const right_table2 = document.getElementById('right_table2').getElementsByTagName('tr');
          for (var i = 0; i < left_div2.length; i++) {
            const height = left_div2[i].offsetHeight;
            right_table1[i].style.height = left_div2[i].offsetHeight + 'px';
            right_table2[i].style.height = left_div2[i].offsetHeight + 'px';
          }
          const leftDiv2Height = document.getElementById('left_div2').offsetHeight;
          if (leftDiv2Height < 400) {
            document.getElementById('right_div2').style.height = leftDiv2Height + 'px';
            document.getElementById('left_div2').style.height = leftDiv2Height + 'px';
          } else {
            document.getElementById('right_div2').style.height = 401 + 'px';
            document.getElementById('left_div2').style.height = 400 + 'px';
          }
          this.setState({ loading: false });
        }, 2000);
      }
    }).catch((e) => {
      message.warn(e.message);
    });

    const index = this.state.planName.lastIndexOf("\_");
    const planName = document.getElementById('planNames');
    if (planName !== null) {
      planName.value = this.state.planName.substring(index + 1, this.state.planName.length);
    }

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

  reload = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const planNames = document.getElementById('planNames').value;
      const dataLen = this.state.initNodesData.length;
      for (var i = 0; i < dataLen; i++) {
        if (values[`mockPriceStrategy${i}`] === '') {
          message.warn('请确认[报价策略方案申报]都选择了具体策略');
          return;
        }
      }

      const inputDom = document.getElementById('right_table2').getElementsByTagName('input');
      for (const i in inputDom) {
        if (typeof (inputDom[i]) == "object" && inputDom[i]) {
          const attrkey = inputDom[i].getAttribute('attrkey');
          if (Number(inputDom[i].value).toFixed(2) !== inputDom[i].getAttribute('attrdata')) {
            console.log(inputDom[i])
            const list = {
              planId: this.state.planId,
              indexName: attrkey.split('-')[0],
              nodeId: attrkey.split('-')[1],
              indexValue: attrkey.split('-')[2] ? inputDom[i].value / 1 : inputDom[i].value / 100,
            };
            this.state.dataList.push(list);
          }
        }
      }
      
      const payloadData = [...this.state.dataList, ...this.state.selectData, ...this.state.newMockPrmProportion];
      this.props.dispatch({
        type: 'analysis/doPredict',
        payload: payloadData,
      }).then(() => {
        const { initNodesData } = this.props.analysis;
        this.setState({ initNodesData, dataList: [], selectData: [], newMockPrmProportion: [], });
        // 当刷新的时候会根据请求的数据再次进行展示，这时候因为输入框已经编辑过，设置的初始值已经发生变化不能使用，此时重置所有的初始值
        this.props.form.resetFields();  // 
        this.props.root.hasReloadTable();
        document.getElementById('planNames').value = planNames;
      }).catch((e) => {
        message.warn(e.message);
      });
    });
  }

  savePlan = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const dataLen = this.state.initNodesData.length;
      for (var i = 0; i < dataLen; i++) {
        if (values[`mockPriceStrategy${i}`] === '') {
          message.warn('请确认[报价策略方案申报]都选择了具体策略');
          return;
        }
      }
      let planName = document.getElementById('planNames').value;
      const first = this.state.planName.indexOf("_") + 1;
      const heng = this.state.planName.indexOf("_", first);
      const payloadData = [...this.state.dataList, ...this.state.selectData, ...this.state.newMockPrmProportion];
      this.props.dispatch({
        type: 'analysis/saveSimulatedPlan',
        payload: {
          planId: this.state.planId,
          planName: this.state.planName.substring(0, heng) + '_' + planName,
        }
      }).then(() => {
        // this.props.root.hasSavePlan();
        this.setState({ savePlan: false })
      }).catch((e) => {
        message.warn(e.message);
        // this.props.root.hasSavePlan();
      });
    })
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
      }).then(() => {

      }).catch((e) => {
        message.warn(e.message);
      });
    });
  }

  translateTable = () => {
    if (this.state.show === '') {
      this.setState({ show: 'none', tableWidth: '91%', rightDivBoxWidth: 930, rightDivBoxOverflow: 'auto' })
    } else {
      const bodyWidth = document.querySelector('body').offsetWidth;
      this.setState({
        show: '',
        tableWidth: '162%',
        rightDivBoxWidth: 1036,
        rightDivBoxOverflow: 'scroll auto'
      });
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
          this.state.selectData.splice(i, 1);
        }
      }
    }
    newTemp = [...this.state.selectData, ...temp];
    this.setState({ selectData: newTemp });
  }

  clickA = (i) => {
    if (i.mockPrmProportionBean.disable !== undefined && i.mockPrmProportionBean.disable === false) {
      if (i.nodeId !== 'No.00') {
        this.props.dispatch({
          type: 'analysis/prmProCheck',
          payload: {
            planId: this.state.planId,
            nodeId: i.nodeId,
          },
        }).then(() => {
          const { prmProCheckData } = this.props.analysis;
          let totalCount = 0;
          prmProCheckData.map((i) => {
            const itemVlaue = (i.mockPrmProportion * 100).toFixed(2);
            totalCount += Number(itemVlaue);
          });
          if (totalCount.toFixed(2) === '100.00') {
            this.setState({ totalCount: '100.00', visible: true });
          } else {
            this.setState({ totalCount: totalCount.toFixed(2), visible: true });
          }
        });
      }
    }
  }

  handleOkToSavePlan = () => {
    const copyPlanName = document.getElementById('copyPlanName').value;
    if (copyPlanName !== '') {
      this.props.dispatch({
        type: 'analysis/planCopy',
        payload: {
          planId: this.state.planId,
          planName: this.state.planName + '_' + copyPlanName,
          companyCode: this.state.companyCode,
        },
      }).then(() => {
        this.setState({ savePlanModel: false });
      }).catch((e) => {
        message.warn(e.message);
      });
    } else {
      message.warn('请输入方案名称');
    }
  }

  toSavePlan = () => {
    let first = this.state.planName.indexOf("_") + 1;
    let heng = this.state.planName.indexOf("_", first);
    this.setState({
      actionPlanName: this.state.planName.substring(0, heng),
      savePlanModel: true
    });
  }

  reset = () => {
    this.props.dispatch({
      type: 'analysis/resetPlan',
      payload: {
        planId: this.state.planId
      }
    }).then(() => {
      const { initPlanData } = this.props.analysis;
      this.setState({ initNodesData: [] });
      setTimeout(() => {
        setTimeout(() => {
          // 根据第一列的每一行的高度 设置右边表格的高度
          const left_div2 = document.getElementById('left_div2').getElementsByTagName('tr');
          const right_table1 = document.getElementById('right_table1').getElementsByTagName('tr');
          const right_table2 = document.getElementById('right_table2').getElementsByTagName('tr');
          for (var i = 0; i < left_div2.length; i++) {
            const height = left_div2[i].offsetHeight;
            right_table1[i].style.height = left_div2[i].offsetHeight + 'px';
            right_table2[i].style.height = left_div2[i].offsetHeight + 'px';
          }
        }, 50);
        this.setState({ initNodesData: initPlanData.nodes, });
      }, 200);

    }).catch((e) => {
      message.warn(e.message);
    });
  }

  cancelSimModel = (e) => {
    this.props.root.handleCancelSimModel(e);
    // 清除缓存
    Object.keys(this.props.analysis).map((item) => {
      if (item === 'initPlanData') {
        delete this.props.analysis[item]
      }
      if (item === 'getPlanAuthData') {
        delete this.props.analysis[item]
      }
    });
    this.setState({ initNodesData: [] });
  }

  renderForm = () => {
    const { analysis: { initPlanData }, form: { getFieldDecorator } } = this.props;
    let right_div2_th = [], right_div2_tr = [], right_div1_th = [], right_div1_tr = [], left_div2_tr = [], nodesData = [];
    // const tableHeader1 = [
    //   { title: '签单保费(万元)', color: '#F2F2F2' },
    //   { title: '保单件数', color: '#F2F2F2' },
    //   { title: '保费占比(%)', color: '#F2F2F2' },
    //   { title: '满期出险频度', color: '#F2F2F2' },
    //   { title: '基准赔付率(含NCD)(%)', color: '#F2F2F2' },
    //   { title: '整体平均总折扣率', color: '#F2F2F2' },
    //   { title: '整体平均自主系数', color: '#F2F2F2' },
    //   { title: '近2个月总折扣(%)', color: '#F2F2F2' },
    //   { title: '近2个月平均自主系数', color: '#F2F2F2' },
    //   { title: '近2个月保单获取成本率(%)', color: '#F2F2F2' },
    //   { title: '满期赔付率(%)', color: '#F2F2F2' },
    // ];
    // const tableHeader2 = [
    //   { title: '保费占比(选定)(%)', color: '#FFEFD0' },
    //   { title: '基准赔付率(含NCD)选定(%)', color: '#FFEFD0' },
    //   { title: '策略A:总折扣管控(%)', color: '#FFEFD0' },
    //   { title: '策略B:自主系数管控', color: '#FFEFD0' },
    //   { title: '预期赔付率(不含间接理赔费用)(%)', color: '#EFC0D0' },
    //   { title: '保单获取成本配置方案(不含销推、不含税)(%)', color: '#FFEFD0' },
    //   { title: '预期变动成本率(%)', color: '#EFC0D0' },
    //   { title: '预期综合成本率(含总部分摊)(%)', color: '#EFC0D0' },
    //   { title: '预期综合成本率(不含总部分摊)(%)', color: '#EFC0D0' },
    //   { title: '报价策略方案申报', color: '#FFEFD0' },
    // ];
    let leftColunm = [];
    tableHeader1.map((item) => {
      const th = (
        <th key={item.title} style={{ borderRight: 'none', height: 75, width: 84 }}>
          {item.title}
          <div
            style={{ display: item.title === '满期赔付率(%)' ? '' : 'none', }}>
            <a onClick={this.translateTable}>&lt;&lt;</a>
          </div>
        </th>
      );
      right_div1_th.push(th);
    });
    tableHeader2.map((item) => {
      const th = (
        <th style={{background: `${item.color}`, width: item.title === '报价策略方案申报' ? 64 : 84, height: 75 }} key={item.title}>
         {item.title}
          <div
            style={{ display: item.title === '保费占比(选定)(%)' && this.state.show !== '' ? '' : 'none', top: 35 }}>
            <a onClick={this.translateTable}>&gt;&gt;</a>
          </div>
        </th>
      );
      right_div2_th.push(th);
    });

    if (this.state.initNodesData.length > 0) {
      this.state.initNodesData.map((i, index) => {
        const nodeId = i.nodeId;
        const tr1 = (
          <tr>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.acceptPrm ? i.acceptPrm.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.acceptPrmYear ? i.acceptPrmYear.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.plyNum}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {(i.acceptPrmRate * 100).toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.acceptPrmRateYear !== undefined ? (i.acceptPrmRateYear * 100).toFixed(2) : ''}
            </td> 
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.expClmFreq ? i.expClmFreq.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.chaCostRate ? i.chaCostRate.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {(i.payRateNcd * 100).toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.payrateNcdAll ? (i.payrateNcdAll * 100).toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {(i.avgDiscount * 100).toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.avgDouDiscount.toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {(i.avgDiscount2m * 100).toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.avgDouDiscount2m.toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {(i.feeRate * 100).toFixed(2)}
            </td>
            <td style={{ borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {(i.expPayRate * 100).toFixed(2)}
            </td>
            <td style={{ borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {i.expPayRateAdj !== undefined ? (i.expPayRateAdj * 100).toFixed(2) : ''}
            </td>
          </tr>
        );

        const tr2 = (
          <tr>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0', width: 84 }}>
              <a
                id={nodeId}
                style={{ 
                  display: 'inline-block', 
                  width: '100%', 
                  color: i.mockPrmProportionBean.disable !== undefined && i.mockPrmProportionBean.disable ? 'rgb(212, 179, 183)' : '#020202' }}
                onClick={e => { this.clickA(i) }}>
                {i.mockPrmProportionBean.indexValue !== undefined ? (i.mockPrmProportionBean.indexValue * 100).toFixed(2) : ''}
              </a>
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0', width: 84 }}>
              {getFieldDecorator(`mockBasicPayRate${index}`, {
                initialValue: i.mockBasicPayRateBean.indexValue !== undefined ? (i.mockBasicPayRateBean.indexValue * 100).toFixed(2) : ''
              })(
                index === 0
                  ?
                  <span>{i.mockBasicPayRateBean.indexValue !== undefined ? (i.mockBasicPayRateBean.indexValue * 100).toFixed(2) : ''}</span>
                  :
                  <Input
                    disabled={i.mockBasicPayRateBean.disable !== undefined ? i.mockBasicPayRateBean.disable : false}
                    attrkey={'mockBasicPayRate' + '-' + `${nodeId}`}
                    attrdata={i.mockBasicPayRateBean.indexValue !== undefined ? (i.mockBasicPayRateBean.indexValue * 100).toFixed(2) : ''}
                  />
                )}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0', width: 84 }}>
              {getFieldDecorator(`mockTotalDiscount${index}`, {
                initialValue: i.mockTotalDiscountBean.indexValue !== undefined ? (i.mockTotalDiscountBean.indexValue * 100).toFixed(2) : ''
              })(
                index === 0
                  ?
                  <span>{i.mockTotalDiscountBean.indexValue !== undefined ? (i.mockTotalDiscountBean.indexValue * 100).toFixed(2) : ''}</span>
                  :
                  <Input
                  data-set={index}
                    disabled={i.mockTotalDiscountBean.disable !== undefined ? i.mockTotalDiscountBean.disable : false}
                    attrkey={'mockTotalDiscount' + '-' + `${nodeId}`}
                    attrdata={i.mockTotalDiscountBean.indexValue !== undefined ? (i.mockTotalDiscountBean.indexValue * 100).toFixed(2) : ''}
                  />
                )}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0', width: 84 }}>
              {getFieldDecorator(`mockAutoCoeff${index}`, {
                initialValue: i.mockAutoCoeffBean.indexValue !== undefined ? i.mockAutoCoeffBean.indexValue.toFixed(2) : ''
              })(
                index === 0
                  ?
                  <span>{i.mockAutoCoeffBean.indexValue !== undefined ? i.mockAutoCoeffBean.indexValue.toFixed(2) : ''}</span>
                  :
                  <Input
                    disabled={i.mockAutoCoeffBean.disable !== undefined ? i.mockAutoCoeffBean.disable : false}
                    attrkey={'mockAutoCoeff' + '-' + `${nodeId}` + '-' + 'true'}
                    attrdata={i.mockAutoCoeffBean.indexValue !== undefined ? i.mockAutoCoeffBean.indexValue.toFixed(2) : ''}
                  />
                )}
            </td>
            <td style={{ background: '#EFC0D0', borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {(i.prePayRate * 100).toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#ffefd0', width: 84 }}>
              {getFieldDecorator(`mockPolicyCostRate${index}`, {
                initialValue: i.mockPolicyCostRateBean.indexValue !== undefined ? (i.mockPolicyCostRateBean.indexValue * 100).toFixed(2) : ''
              })(
                index === 0
                  ?
                  <span>{i.mockPolicyCostRateBean.indexValue !== undefined ? (i.mockPolicyCostRateBean.indexValue * 100).toFixed(2) : ''}</span>
                  :
                  <Input
                    disabled={i.mockPolicyCostRateBean.disable !== undefined ? i.mockPolicyCostRateBean.disable : false}
                    attrkey={'mockPolicyCostRate' + '-' + `${nodeId}`}
                    attrdata={i.mockPolicyCostRateBean.indexValue !== undefined ? (i.mockPolicyCostRateBean.indexValue * 100).toFixed(2) : ''}
                  />
                )}
            </td>
            <td style={{ background: `${i.color}`, borderTop: index === 0 ? 'none' : '1px solid', width: 84 }}>
              {(i.preChaCostRate * 100).toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#EFC0D0', width: 84 }}>
              {(i.preCostRateIn * 100).toFixed(2)}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid', background: '#EFC0D0', width: 84 }}>
              {(i.preCostRateEx * 100).toFixed(2)}
            </td>
            <td style={{ width: 64, borderTop: index === 0 ? 'none' : '1px solid', background: '#FFEFD0' }}>
              <div attrkey={'mockPriceStrategy' + '-' + `${nodeId}` + '-' + `${i.mockPriceStrategyBean.indexValue}`}>
                {getFieldDecorator(`mockPriceStrategy${index}`, {
                  initialValue: i.mockPriceStrategyBean.indexValue !== undefined ? i.mockPriceStrategyBean.indexValue : ''
                })(
                  <Select
                    onSelect={e => { this.onChange(e, 'mockPriceStrategy' + '-' + `${nodeId}`) }}
                    style={{ width: '70%' }}>
                    <Option value={'A'}>A</Option>
                    <Option value={'B'}>B</Option>
                  </Select>
                  )}
              </div>
            </td>
          </tr>
        );
        right_div1_tr.push(tr1);
        right_div2_tr.push(tr2);
        leftColunm.push(i.business);
      });
    }
    leftColunm.map((item) => {
      const tr = (
        <tr>
          <td style={{height: 45}} title={item.length > 36 ? item : ''}>
            {item.length > 36 ? item.slice(0,33) + '...' : item}
          </td>
        </tr>
      );
      left_div2_tr.push(tr);
    });

    return (
      <div className={tableStyle.container} id='tableContainer'>
        <div className={tableStyle.left_div}>
          <div className={tableStyle.left_div1}>
            <table className={tableStyle.left_table1} id='left_table1'>
              <tbody>
                <tr>
                  <th style={{ height: 75 }}>业务单元名称</th>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={tableStyle.left_div2} ref={(s) => { this.sLeft = s; }} id="left_div2">
            <table className={tableStyle.left_table2}>
              <tbody>
                {left_div2_tr.map((i) => { return i })}
              </tbody>
            </table>
          </div>
        </div>
        <div className={tableStyle.right_div}
          id='right_div'
          style={{ width: this.state.rightDivBoxWidth, overflow: this.state.rightDivBoxOverflow, }}
        >
          <div className={tableStyle.right_div1} style={{ width: 2200 }}>
            <table className={`${tableStyle.right_table1}`} style={{ display: this.state.show }}>
              <tbody id='right_div1_th'>
                <tr>
                  {right_div1_th.map((i) => { return i })}
                </tr>
              </tbody>
            </table>
            <table className={`${tableStyle.right_table1}`}>
              <tbody id='right_div2_th'>
                <tr>
                  {right_div2_th.map((i) => { return i })}
                </tr>
              </tbody>
            </table>
          </div>
          <div
            id='right_div2'
            className={tableStyle.right_div2}
            style={{ width: 2200 }}
            ref={(s) => { this.sContent = s; }}
          >
            <table
              className={`${tableStyle.right_table2}`}
              style={{ display: this.state.show }}
              id="right_table1"
            >
              <tbody id='right_div1_tr'>
                {right_div1_tr.map((i) => { return i })}
              </tbody>
            </table>
            <table className={`${tableStyle.right_table2}`} id="right_table2">
              <tbody id='right_div2_tr'>
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
    setTimeout(() => {
      for (var i = 0; i < inputDom.length; i++) {
        if (inputDom[i].value !== '') {
          sum += Number(inputDom[i].value);
        }
      }
      this.setState({ totalCount: sum.toFixed(2) });
    }, 200);
  }

  modelList = () => {
    const { analysis: { prmProCheckData }, form: { getFieldDecorator } } = this.props;
    const listData = [];
    if (prmProCheckData.length > 0) {
      prmProCheckData.map((i, index) => {
        const list = (
          <tr style={{ padding: 10, fontSize: 15 }}>
            <td style={{ border: '1px solid', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.business}
            </td>
            <td style={{ width: '30%', border: '1px solid', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {(i.mockPrmProportion * 100).toFixed(2)}
            </td>
            <td style={{ width: '30%', border: '1px solid', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {getFieldDecorator(`${i.nodeId}`, { initialValue: (i.mockPrmProportion * 100).toFixed(2) })(
                <Input
                  disabled={i.disable!==undefined ? i.disable : false}
                  onChange={e => this.changeInput(i)}
                  style={{ textAlign: 'center', fontSize: 15, border: 'none' }}
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
        for (var j = 0; j < aDom.length; j++) {
          if (inputDom[i].value !== '') {
            if (inputDom[i].getAttribute('id') === aDom[j].getAttribute('id')) {
              if (aDom[j].innerText !== inputDom[i].value) {
                aDom[j].innerText = inputDom[i].value;
                aDom[j].style.color = 'red';
                // 刷新用到的数据
                const list = {
                  planId: this.state.planId,
                  indexName: 'mockPrmProportion',
                  nodeId: inputDom[i].getAttribute('id'),
                  indexValue: inputDom[i].value / 100,
                };
                listData.push(list);
              }
            }
          } else {
            message.warn('请确认所有的[保费占比]都已经输入具体的值');
            return;
          }
        }
      }
      this.setState({ visible: false, newMockPrmProportion: listData, totalCount: 0 });
      this.props.root.hasReloadTable();
    } else {
      message.warn('请确认“保费占比（新值）”累加是否为100');
    }
  }

  // 导出表格
  exportTable = () => {
    let title = [];
    const exportData = [{ title: '业务单元名称', name: 'business' }, ...tableHeader1, {title: '', name: ''}, ...tableHeader2];
    const exportObj = {};
    const option = {};
    const dataTable = [];
    // 遍历数据同时创建excel头部对象
    for(let i of exportData){
      exportObj[i.title] = i.name;
    }
    for(let i of this.props.analysis.initPlanData.nodes){
      const obj = {}
      for(let j in exportObj){
        // 根据部分条件的不同来处理数据，蛋疼
        if(exportObj[j] === 'plyNum' || exportObj[j] === 'business') obj[j] = i[exportObj[j]];
        else if(exportObj[j] === 'acceptPrm' || exportObj[j] === 'expClmFreq' || exportObj[j] === 'acceptPrmYear' ||
          exportObj[j] === 'avgDouDiscount' || exportObj[j] === 'avgDouDiscount2m'){
            if(i[exportObj[j]] === undefined) obj[j] = '';
            else obj[j] = i[exportObj[j]].toFixed(2);
          } 
        else if(exportObj[j] === 'mockPriceStrategyBean+indexValue') obj[j] = i[exportObj[j].split('+')[0]][exportObj[j].split('+')[1]];
        else if(exportObj[j].indexOf('+') !== -1) obj[j] = (i[exportObj[j].split('+')[0]][exportObj[j].split('+')[1]] * 100).toFixed(2);
        else if(exportObj[j] === '') obj[j] = '';
        else if(i[exportObj[j]] === undefined) obj[j] = '';
        else {
          if(i[exportObj[j]] === undefined) obj[j] = '';
          else obj[j] = (i[exportObj[j]] * 100).toFixed(2);
        }
      }
      // 最后把没处理好，导致NAN的数据转为空字符串
      for(let j in obj){
        if(obj[j] === 'NaN') obj[j] = '';
        title.push(j);
      }
      dataTable.push(obj);
    }
    // 因为属性名在保存过程中被外层循环额外遍历了，所有需要去重
    title = title.filter( (item, index) => title.indexOf(item) === index);
    option.fileName = `${this.state.planName}数据报表`;
    option.datas = [{
      sheetData: dataTable,
      sheetName: 'sheet',
      sheetFilter: title,
      sheetHeader: title,
    }];
    let toExcel = new ExportJsonExcel(option); 
    toExcel.saveExcel(); 
  }


  render() {
    const { analysis: {initPlanData, getPlanAuthData} } = this.props;
    const { getFieldDecorator } = this.props.form;
    let calStartTime = '', calEndTime = '';
    if (initPlanData && initPlanData.plan !== undefined) {
      calStartTime = initPlanData.plan.calStartTime;
      calEndTime = initPlanData.plan.calEndTime;
    }
    let enableCommit = '0';
    if (getPlanAuthData && getPlanAuthData.enableCommit !== undefined) {
      enableCommit = getPlanAuthData.enableCommit;
    }
    this.setState({ enableCommit })
    const first = this.state.planName.indexOf("_") + 1;
    let heng = this.state.planName.indexOf("_", first);

    return (
      <div>
        <div style={{ fontSize: 14, textAlign: 'center', padding: '14px 0' }}>
          <span>
            <span>保险起期：</span><span><span>{calStartTime.slice(0, 11)}</span> ~ <span>{calEndTime.slice(0, 11)}</span></span>
          </span>
          <span style={{ margin: '0 14px' }}>
            <span>方案编码：</span><span>{this.state.planId}</span>
          </span>
          <span>
            <span>方案名称：</span>
            <span>{this.state.planName.substring(0, heng)}_</span>
            <Input style={{ width: 200 }} id='planNames' maxLength='30' placeholder='注：只允许输入30个字的长度'/>  
          </span>
          <span>
            <Button onClick={e => { this.reload(e) }} style={{ margin: '0 10px' }}>刷新</Button>
            <Button
              // disabled={this.props.analysis.initPlanData.length === 0 ? true : false}
              onClick={e => this.exportTable(e)}
              style={{ margin: '0 10px' }}>
              导出
            </Button>
            <Popconfirm
              title={`注意：有修改模拟值的话，要先进行刷新后再保存，否则原先修改的模拟值将无效！`}
              onConfirm={e => this.savePlan(e)}
              okText="确定"
              cancelText="取消"
            >
              <Button >保存</Button>
            </Popconfirm>
            <Button
              disabled={this.state.savePlan ? (enableCommit === '0' ? true : false) : false }
              onClick={e => { this.submitPlan(e) }}
              style={{ margin: '0 10px' }}>
              提交
            </Button>
            <Button onClick={e => this.toSavePlan(e)}>另存为</Button>
          </span>
        </div>
        <div>
          <Spin spinning={this.state.loading}>
            {this.renderForm()}
          </Spin>
        </div>
        <div style={{ textAlign: 'right', margin: '14px 10px' }}>
          <Button
            style={{ marginRight: 10 }}
            onClick={e => this.reset(e, this.state.record)}>
            重置
            </Button>
          {
            this.props.root.state.hasSavePlan
              ?
              <Button
                onClick={e => this.cancelSimModel(e)}
              >
                关闭
              </Button>
              :
              <Popconfirm
                title={`注意：如果有修改过数据但没进行保存的话，原先修改过的数据将会丢失！`}
                onConfirm={e => this.cancelSimModel(e)}
                okText="确定"
                cancelText="取消"
              >
                <Button >关闭</Button>
              </Popconfirm>
          }
        </div>
        <Modal
          title="请输入该业务单元及其关联业务单元的保费占比值，需保证以下业务单元的保费占比合计为100%。"
          visible={this.state.visible}
          onOk={this.hideModal}
          onCancel={e => { this.setState({ visible: false }) }}
          destroyOnClose
          closable={false}
          style={{ top: 10 }}
          width={460}
          okText="确认"
          cancelText="取消"
        >
          {this.modelList()}
        </Modal>
        <Modal
          title={`请输入方案名称：`}
          visible={this.state.savePlanModel}
          onOk={e => this.handleOkToSavePlan()}
          onCancel={e => { this.setState({ savePlanModel: false }); }}
          closable={false}
          destroyOnClose
        > 
          <div>
            <span>{`${this.state.actionPlanName}_`}</span>
            <Input style={{ width: 320 }} id='copyPlanName' maxLength='30' placeholder='注：只允许输入30个字的长度'/>
          </div>  
        </Modal>
      </div>
    );
  }
}
