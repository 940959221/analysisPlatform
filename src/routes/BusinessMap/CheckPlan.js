import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, message, Card, Input, Select, Button, Modal, Popconfirm, DatePicker, Spin } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import CheckBrachPlan from './CheckBrachPlan';
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
  { title: '报价策略方案申报', color: '#B3E2F4', name: 'mockPriceStrategyBean+indexValue' },
];

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class CheckPlan extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      planId: '',
      domain: '',
      showTable: '',
      planName: this.props.location.record !== undefined ? this.props.location.record.planName : '--',
      modelName: this.props.location.record !== undefined ? this.props.location.record.modelName : '--',
      recordPlanId: this.props.location.record !== undefined ? this.props.location.record.planId : '',
      enableCommit: this.props.location.record !== undefined ? this.props.location.record.enableCommit : '--',
      recordModelId: this.props.location.record !== undefined ? this.props.location.record.modelId : '',
      recordPlanName: this.props.location.record !== undefined ? this.props.location.record.planName : '',
      recordCompanyCode: this.props.location.record !== undefined ? this.props.location.record.companyCode : '',
      tableTotalWidth: '200%',
      isEnbalePlan: false,
      setLookBackTimeModel: false,
      formWidth: '',   // 记录界面的大小，主要用作分辨率的切换
      exportObj: {},
    }
  }

  componentDidMount() {
    // 下面几行是为了新增前端导出表格功能
    const exportData = [{ title: '业务单元名称', name: 'business' }, ...tableHeader1, ...tableHeader2];
    const exportObj = {};
    for (let i of exportData) {
      exportObj[i.title] = i.name;
    }
    console.log(exportObj)
    this.setState({ exportObj });

    // 获取模拟数据
    this.props.dispatch({
      type: 'analysis/getPlanDetailById',
      payload: {
        planId: this.state.recordPlanId,
      },
    }).then(() => {
      const { getPlanDetailByIdData, getUserInfoData } = this.props.analysis;
      this.setState({ planId: this.state.recordPlanId, domain: getUserInfoData.domain });
      setTimeout(() => {
        // 根据第一列的每一行的高度 设置右边表格的高度
        const left_div2 = document.getElementById('left_div2').getElementsByTagName('tr');
        const right_div1_tr = document.getElementById('right_div1_tr').getElementsByTagName('tr');
        const right_table2 = document.getElementById('right_table2').getElementsByTagName('tr');
        for (var i = 0; i < left_div2.length; i++) {
          const height = left_div2[i].offsetHeight;
          right_div1_tr[i].style.height = left_div2[i].offsetHeight + 'px';
          right_table2[i].style.height = left_div2[i].offsetHeight + 'px';
        }
        const leftDiv2Height = document.getElementById('left_div2').offsetHeight;
        if (leftDiv2Height < 400) {
          document.getElementById('right_div2').style.height = leftDiv2Height + 'px';
          document.getElementById('left_div2').style.height = leftDiv2Height + 'px';
        } else {
          document.getElementById('right_div2').style.height = 400 + 'px';
          document.getElementById('left_div2').style.height = 400 + 'px';
        }
      }, 500);
    }).catch((e) => {
      // message.warn(e.message);
    });

    // 获取某个方案权限
    this.props.dispatch({
      type: 'analysis/getPlanAuth',
      payload: {
        planId: this.state.recordPlanId,
      }
    }).then(() => {
      const { getPlanAuthData } = this.props.analysis;
    });

    if (this.state.recordPlanId !== '') {
      const modelType = this.state.recordPlanId.substring(0, 1);
      // 现在不根据类型来显隐白色区域，判断注释
      // if (modelType === 'F') {
      this.setState({ showTable: '', tableTotalWidth: '200%' });
      // } else {
      //   this.setState({ showTable: 'none', tableTotalWidth: '94%' });
      // }
    }


    const tableContainer = document.getElementById('tableContainer');
    const bodyWidth = document.querySelector('body').offsetWidth;
    if (tableContainer !== null) {
      if (1200 < bodyWidth && bodyWidth < 1300) {
        tableContainer.style.width = '200%';
        document.getElementById('right_div').style.cssText = 'width: 970px; overflow: scroll';
      } else if (1100 < bodyWidth && bodyWidth < 1200) {
        tableContainer.style.width = '200%';
        document.getElementById('right_div').style.cssText = 'width: 990px; overflow: scroll';
      } else if (1050 < bodyWidth && bodyWidth < 1100) {
        tableContainer.style.width = '200%';
        document.getElementById('right_div').style.cssText = 'width: 1030px; overflow: scroll';
      }
    }

    // 表格第一列滚动
    this.handleElementScroll(this.sContent);
  }

  // 创建一个方法，该方法用于获取元素的属性值
  getStyle(element, attr) {
    // 如果使用谷歌火狐，返回第一个，ie返回第二个
    if (window.getComputedStyle) {
      return window.getComputedStyle(element, null)[attr];
    }
    return element.currentStyle[attr];
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
          planId: this.state.recordPlanId,
        }
      }).then(() => {

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
    }).then(() => {
    }).catch((e) => {
      message.warn(e.message)
    });
  }

  renderForm = () => {
    const { analysis: { getPlanDetailByIdData }, form: { getFieldDecorator } } = this.props;
    let nodesData = [];
    if (getPlanDetailByIdData.nodes !== undefined && getPlanDetailByIdData.nodes.length > 0) {
      nodesData = getPlanDetailByIdData.nodes;
    }

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

    if (nodesData.length > 0) {
      nodesData.map((i, index) => {
        const nodeId = i.nodeId;
        const tr1 = (
          <tr>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.acceptPrm ? i.acceptPrm.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.acceptPrmYear ? i.acceptPrmYear.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{i.plyNum}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.acceptPrmRate !== undefined ? (i.acceptPrmRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.acceptPrmRateYear !== undefined ? (i.acceptPrmRateYear * 100).toFixed(2) : ''}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.expClmFreq ? i.expClmFreq.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.chaCostRate ? i.chaCostRate.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{i.payRateNcd ? (i.payRateNcd * 100).toFixed(2) : '0.00'}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>{i.payrateNcdAll ? (i.payrateNcdAll * 100).toFixed(2) : '0.00'}</td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.avgDiscount !== undefined ? (i.avgDiscount * 100).toFixed(2) : ''}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.avgDouDiscount ? i.avgDouDiscount.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.avgDiscount2m !== undefined ? (i.avgDiscount2m * 100).toFixed(2) : ''}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.avgDouDiscount2m ? i.avgDouDiscount2m.toFixed(2) : '0.00'}
            </td>
            <td style={{ borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.feeRate !== undefined ? (i.feeRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.expPayRate !== undefined ? (i.expPayRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ borderRight: 'none', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.expPayRateAdj !== undefined ? (i.expPayRateAdj * 100).toFixed(2) : ''}
            </td>
          </tr>
        );
        const tr2 = (
          <tr key={index}>
            <td style={{ background: '#ffefd0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockPrmProportionBean.indexValue !== undefined ? (i.mockPrmProportionBean.indexValue * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#ffefd0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockBasicPayRateBean.indexValue !== undefined ? (i.mockBasicPayRateBean.indexValue * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#ffefd0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockTotalDiscountBean.indexValue !== undefined ? (i.mockTotalDiscountBean.indexValue * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#ffefd0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockAutoCoeffBean.indexValue !== undefined ? i.mockAutoCoeffBean.indexValue.toFixed(2) : ''}
            </td>
            <td style={{ background: '#EFC0D0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.prePayRate !== undefined ? (i.prePayRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#ffefd0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.mockPolicyCostRateBean.indexValue !== undefined ? (i.mockPolicyCostRateBean.indexValue * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#EFC0D0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.preChaCostRate !== undefined ? (i.preChaCostRate * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#efc0d0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.preCostRateIn !== undefined ? (i.preCostRateIn * 100).toFixed(2) : ''}
            </td>
            <td style={{ background: '#efc0d0', borderTop: index === 0 ? 'none' : '1px solid' }}>
              {i.preCostRateEx !== undefined ? (i.preCostRateEx * 100).toFixed(2) : ''}
            </td>
            <td style={{ width: 64, borderTop: index === 0 ? 'none' : '1px solid' }}>
              {getFieldDecorator(`mockPriceStrategyBean${index}`, {
                initialValue: i.mockPriceStrategyBean.indexValue !== undefined ? i.mockPriceStrategyBean.indexValue : ''
              })(
                <Select
                  disabled
                  style={{ width: '70%' }}>
                  <Option value={'A'}>A</Option>
                  <Option value={'B'}>B</Option>
                </Select>
              )}
            </td>
          </tr>
        );
        const leftDiv2Tr = (
          <tr>
            <td title={i.business.length > 36 ? i.business : ''} style={{ height: 45 }}>
              {i.business.length > 36 ? i.business.slice(0, 33) + '...' : i.business}
            </td>
          </tr>
        );
        right_div1_tr.push(tr1);
        right_div2_tr.push(tr2);
        left_div2_tr.push(leftDiv2Tr);
      });
    }

    return (
      <div className={tableStyle.container} style={{ display: 'flex' }}>
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
          <div className={tableStyle.left_div2} ref={(s) => { this.sLeft = s; }} id='left_div2'>
            <table className={`${tableStyle.left_table2}`}>
              <tbody>
                {left_div2_tr.map((i) => { return i })}
              </tbody>
            </table>
          </div>
        </div>
        <div className={tableStyle.right_div} id='right_div'>
          <div className={tableStyle.right_div1} style={{ width: 2300 }}>
            <div className={tableStyle.right_divx} style={{ display: 'flex' }}>
              <table className={`${tableStyle.right_table1}`} style={{ display: this.state.showTable, float: 'left' }}>
                <tbody>
                  <tr>
                    {right_div1_th.map((i) => { return i })}
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
          </div>
          <div
            className={tableStyle.right_div2}
            id='right_div2'
            style={{ width: this.state.tableTotalWidth, width: 2300 }}
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
    );
  }

  // 查看中支公司方案
  checkCrenPlan = (e) => {
    this.props.dispatch({
      type: 'analysis/getCrenPlan',
      payload: {
        planId: this.state.recordPlanId,
      },
    }).then(() => {
      const { getCrenPlanData } = this.props.analysis;
      Modal.success({
        title: this.state.planName + '由以下方案汇总而成：',
        width: 550,
        style: { top: 30 },
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

  // 删除
  deletePlan = () => {
    this.props.dispatch({
      type: 'analysis/planDelete',
      payload: {
        planId: this.state.recordPlanId,
      }
    }).then(() => {
      setTimeout(() => {
        this.props.history.push({
          pathname: '/businessmap/planquery',
        })
      }, 150);
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  // 回溯
  handleOkSetLookBackTime = () => {
    const { getPlanDetailByIdData } = this.props.analysis;
    this.props.form.validateFields((err, values) => {
      const effectTimeLeftValue = values.effectTimeLeftValue._d.getTime();
      const effectTimeRightValue = values.effectTimeRightValue._d.getTime();
      if (effectTimeRightValue < effectTimeLeftValue) {
        message.warn('右侧值需大于左侧值！');
        return;
      }
      if (values.effectTimeLeftValue !== undefined && values.effectTimeRightValue !== undefined) {
        let calStartTime = values.effectTimeLeftValue.format("YYYY-MM-DD");
        let calEndTime = values.effectTimeRightValue.format("YYYY-MM-DD");
        this.props.dispatch({
          type: 'analysis/planLookBackCal',
          payload: {
            planId: this.state.recordPlanId,
            modelId: this.state.recordModelId,
            planName: this.state.recordPlanName,
            companyCode: this.state.recordCompanyCode,
            timeFrame: {
              leftValue: calStartTime,
              rightValue: calEndTime,
            },
          },
        }).then(() => {
          this.setState({ setLookBackTimeModel: false });
        }).catch((e) => {
          message.warn(e.message);
          this.setState({ setLookBackTimeModel: false });
        });
      } else {
        message.warn('请选择生效起止日期');
      }

    });
  }

  // 查看回溯结果
  checkLookBack = () => {
    this.props.history.push({ pathname: '/businessmap/checklookback', planId: this.state.recordPlanId });
  }

  // 启用方案
  enbalePlan = () => {
    if (!this.state.isEnbalePlan) {
      this.props.dispatch({
        type: 'analysis/enbalePlan',
        payload: {
          planId: this.state.recordPlanId,
          planName: this.state.planName,
        }
      }).then(() => {
        this.setState({ isEnbalePlan: true });
      }).catch((e) => {
        message.warn(e.message);
      });
    } else {
      message.warn('方案已经启用了');
    }
  }

  // 导出表格
  exportTable = () => {
    let title = [];
    const exportData = [{ title: '业务单元名称', name: 'business' }, ...tableHeader1, { title: '', name: '' }, ...tableHeader2];
    const exportObj = {};
    const option = {};
    const dataTable = [];
    // 遍历数据同时创建excel头部对象
    for (let i of exportData) {
      exportObj[i.title] = i.name;
    }
    for (let i of this.props.analysis.getPlanDetailByIdData.nodes) {
      const obj = {}
      for (let j in exportObj) {
        // 根据部分条件的不同来处理数据，蛋疼
        if (exportObj[j] === 'plyNum' || exportObj[j] === 'business') obj[j] = i[exportObj[j]];
        else if (exportObj[j] === 'acceptPrm' || exportObj[j] === 'expClmFreq' || exportObj[j] === 'acceptPrmYear' ||
          exportObj[j] === 'avgDouDiscount' || exportObj[j] === 'avgDouDiscount2m') {
          if (i[exportObj[j]] === undefined) obj[j] = '';
          else obj[j] = i[exportObj[j]].toFixed(2);
        }
        else if (exportObj[j] === 'mockPriceStrategyBean+indexValue') obj[j] = i[exportObj[j].split('+')[0]][exportObj[j].split('+')[1]];
        else if (exportObj[j].indexOf('+') !== -1) obj[j] = (i[exportObj[j].split('+')[0]][exportObj[j].split('+')[1]] * 100).toFixed(2);
        else if (exportObj[j] === '') obj[j] = '';
        else {
          if (i[exportObj[j]] === undefined) obj[j] = '';
          else obj[j] = (i[exportObj[j]] * 100).toFixed(2);
        }
      }
      // 最后把没处理好，导致NAN的数据转为空字符串
      for (let j in obj) {
        if (obj[j] === 'NaN') obj[j] = '';
        title.push(j);
      }
      dataTable.push(obj);
    }
    // 因为属性名在保存过程中被外层循环额外遍历了，所有需要去重
    title = title.filter((item, index) => title.indexOf(item) === index);
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
    const { form: { getFieldDecorator }, analysis: { getPlanAuthData, getPlanDetailByIdData } } = this.props;
    let runStatusName = '', planName = '', planId = '', calStartTime = '', calEndTime = '';
    if (getPlanDetailByIdData.plan !== undefined) {
      planName = getPlanDetailByIdData.plan.planName;
      runStatusName = getPlanDetailByIdData.plan.runStatusName;
      planId = getPlanDetailByIdData.plan.planId;
      calStartTime = getPlanDetailByIdData.plan.calStartTime;
      calEndTime = getPlanDetailByIdData.plan.calEndTime;
    }
    let enableCommit = '0', enableDelete = '0', enableLookBack = '0',
      enableCheckLookBack = '0', enableRead = '0', enableUse = '0', enableCheckCren = '0';
    if (getPlanAuthData !== undefined) {
      enableCommit = getPlanAuthData.enableCommit;
      enableDelete = getPlanAuthData.enableDelete;
      enableLookBack = getPlanAuthData.enableLookBack;
      enableCheckLookBack = getPlanAuthData.enableCheckLookBack;
      enableRead = getPlanAuthData.enableRead;
      enableUse = getPlanAuthData.enableUse;
      enableCheckCren = getPlanAuthData.enableCheckCren;
    }
    return (
      <PageHeaderLayout>
        <div style={{ fontSize: 14, padding: '6px 0', display: 'flex', justifyContent: 'space-around' }}>
          <div>
            <div>
              <span>方案编码：{planId}</span>
              <span style={{ marginLeft: 20 }}>方案名称：{planName}</span>
            </div>
            <div>
              <span>保险起期：{calStartTime + '~' + calEndTime}</span>
              <span style={{ marginLeft: 20 }}>状态：{runStatusName}</span>
            </div>
          </div>
          <div>
            <Button
              disabled={enableCommit === '0' ? true : false}
              onClick={e => this.submitPlan(e)}
              style={{ margin: '0 10px' }}>
              提交
            </Button>
            <Button
              disabled={this.props.analysis.getPlanDetailByIdData.length === 0 ? true : false}
              onClick={e => this.exportTable(e)}
              style={{ margin: '0 10px' }}>
              导出
            </Button>
            <Popconfirm
              title={`请确定是否要删除[${this.state.planName}]？`}
              onConfirm={e => this.deletePlan(e)}
              okText="确定"
              cancelText="取消"
            >
              <Button disabled={enableDelete === '0' ? true : false}>删除</Button>
            </Popconfirm>
            <Button
              disabled={enableLookBack === '0' ? true : false}
              onClick={e => { this.setState({ setLookBackTimeModel: true }); }}
              style={{ margin: '0 10px' }}>
              回溯
            </Button>
            <Button
              disabled={enableCheckLookBack === '0' ? true : false}
              onClick={e => this.checkLookBack(e)}>
              查看回溯结果
            </Button>
            <Button
              onClick={e => this.checkCrenPlan(e)}
              disabled={enableCheckCren === '0' ? true : false}
              style={{ margin: '0 10px' }}>
              查看支公司方案
            </Button>
            <Button
              onClick={e => this.enbalePlan(e)}
              disabled={enableUse === '0' ? true : false}>
              启用
              </Button>
            <Modal
              title={`请在该方案生效期间内选择回溯期间：`}
              visible={this.state.setLookBackTimeModel}
              onOk={e => this.handleOkSetLookBackTime()}
              destroyOnClose={true}
              onCancel={e => {
                this.setState({
                  setLookBackTimeModel: false,
                });
              }}
              closable={false}
            >
              <FormItem label='方案生效期间' style={{ marginLeft: 24 }} layout="inline">
                {getFieldDecorator('effectTimeLeftValue')(
                  <DatePicker allowClear={false} />
                )}
                <span>~</span>
                {getFieldDecorator('effectTimeRightValue')(
                  <DatePicker allowClear={false} />
                )}
              </FormItem>
            </Modal>
          </div>
        </div>
        <div style={{ overflow: 'scroll' }} id='tableContainer'>
          <Spin spinning={this.props.loading}>
            {this.renderForm()}
          </Spin>
        </div>
      </PageHeaderLayout>
    );
  }
}
