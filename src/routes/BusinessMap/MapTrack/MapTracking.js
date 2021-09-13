import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, Row, Col, Modal, Tabs, message } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import ChartsHeader from '../../../components/ChartsHeader';
import Charts from './Charts';
import styles from './MapTracking.less';
import { Link } from 'dva/router';
import ExportJsonExcel from 'js-export-excel';   // 导出excel
import green from '../../../assets/cardGreen.png';
const red = require('../../../assets/cardRed.png');
const yellow = require('../../../assets/cardYellow.png');

const FormItem = Form.Item;
const Option = Select.Option;
const { TabPane } = Tabs;

const up = <svg t="1588054594161" className="icon" style={{ width: 15, height: 15 }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11503" width="200" height="200"><path d="M434.666714 187.469324C297.43919 367.276666 160.191798 547.082201 22.964274 726.889542c-48.854624 64.034092-3.20604 156.297589 77.324255 156.297589h823.421135c80.530295 0 126.198748-92.263496 77.324256-156.297589C863.806396 547.082201 726.559004 367.276666 589.333286 187.469324c-38.933061-51.01125-115.733512-51.01125-154.666572 0z" fill="#1afa29" p-id="11504"></path></svg>
const down = <svg t="1588054628176" className="icon" style={{ width: 15, height: 15 }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12283" width="200" height="200"><path d="M589.320643 836.512614c137.245586-179.809148 274.469497-359.614683 411.693408-539.422024 48.874492-64.014224 3.225908-156.297589-77.322449-156.297589H100.306592c-80.548357 0-126.195135 92.283365-77.342318 156.297589 137.24378 179.807341 274.467691 359.612876 411.713277 539.422024 38.933061 51.009444 115.711837 51.009444 154.643092 0z" fill="#d81e06" p-id="12284"></path></svg>


const data = [];
for (let i = 0; i < 20; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class MapTracking extends Component {
  state = {
    dataVisible: false,
    disabled: false,
    comPanyName: '',                // 机构名称
    nodeName: '',                   // 业务单元名称
    planId: null,                    // 切换里选择的机构方案编号
    nodeId: null,                  // 当前的业务单元编号
    fontOther: '数据表',            // 其他业务数据走势按钮名称
    showOther: false,              // 其他业务数据---是否展示数据表
    fontBack1: '数据表',            // 回溯结果走势1---按钮名称
    showBack1: false,              // 回溯结果走势1---是否展示数据表
    fontBack2: '数据表',            // 回溯结果走势2---按钮名称
    showBack2: false,              // 回溯结果走势2---是否展示数据表
    otherHeight: '',               // 其他业务数据---高度
    smallHeight: '',               // 关注的四个小图高度
    follow: [],                    // 关注四个小图的头部信息
    otherBusiness: [],             // 其他业务数据走势下拉数据
    backBusiness: [],              // 回溯结果下拉数据
    backBusiness1: [],             // 回溯结果数据表格的数据
    backBusiness2: [],             // 回溯结果数据表格的数据
    otherChartLine: [],            // 其他业务走势基准线
    otherChartColor: [],           // 其他业务走势颜色值
    back1ChartLine: [],            // 回溯结果图一基准线
    back1ChartColor: [],           // 回溯结果图一颜色值
    back2ChartLine: [],            // 回溯结果图二基准线
    back2ChartColor: [],           // 回溯结果图二颜色值
    cycle: '7周',                   // 初始默认值
    otherColumns: [],              // 其他业务数据走势的表格头部
    otherData: [],                 // 其他业务数据走势的表格数据
    back1Columns: [],              // 回溯结果图一的表格头部
    back1Data: [],                 // 回溯结果图一的表格数据
    back2Columns: [],              // 回溯结果图二的表格头部
    back2Data: [],                 // 回溯结果图二的表格数据
    dataDate: '',                  // 数据截止时间
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.snk-page-wapper-content').style.background = '#f6f6f6';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    // 修改底部两个box样式，less中修改没生效
    const bottomBox = document.getElementsByClassName('bottomBox');
    for (let i of bottomBox) {
      i.style.height = 'calc((100% - 30px) / 2)'
    }

    this.props.dispatch({
      type: 'analysis/getMainAlertResult',
      payload: {}
    }).then(() => {
      const { getMainAlertResultData } = this.props.analysis;
      this.setState({ dataDate: getMainAlertResultData[0].dataDate })
    }, err => {
      message.error(err.message)
    })
    this.props.dispatch({
      type: 'analysis/getDefaultPlanUnit'
    }).then(() => {
      const { planId, comPanyName, nodeName, nodeId } = this.props.analysis.getDefaultPlanUnitData
      this.setState({ planId, comPanyName, nodeName, nodeId })
      this.props.dispatch({
        type: 'analysis/getEffectPlanContent',
        payload: {}
      })

      this.props.dispatch({
        type: 'analysis/getPlanBusUnit',
        payload: {
          planId
        }
      })

      this.props.dispatch({
        type: 'analysis/getmonidata',
        payload: {
          cycle: 'week'
        }
      }).then(async () => {
        const otherBusiness = [
          { title: '保费占比', code: 'acceptPrmRate', unit: '(%)' },
          { title: '签单保费', code: 'acceptPrm', unit: '(万元)' },
          // { title: '变动成本率', code: 'chaCostRate', unit: '(%)' },
          { title: '整体平均总折扣率', code: 'avgDiscount', unit: '(%)' },
          // { title: '满期赔付率', code: 'expPayRate', unit: '(%)' },
          { title: '整体平均自主系数', code: 'avgDouDiscount', unit: '(%)' },
          { title: '保单获取成本率', code: 'feerateAll', unit: '(%)' },
          { title: '立案金额', code: 'registAmt', unit: '(万元)' },
          { title: '报案件数', code: 'reportNum', unit: '(件)' },
        ];
        await this.setState({ otherBusiness });

        this.dataSet();
        // 关注的小图
        this.setHeight(this.smallChart1, 'smallHeight'); // 目前控制大图的box都为统一高度
        // 关注的大图
        this.setHeight(this.otherChart, 'otherHeight'); // 目前控制大图的box都为统一高度

        this.setTableData(otherBusiness, 'other')
      }, err => {
        message.error(err.message)
      })

      this.props.dispatch({
        type: 'analysis/getTrackdata',
        payload: {}
      }).then(async () => {
        const { getTrackdataData } = this.props.analysis;
        const backBusiness = [
          { title: '策略B:自主系数管控', code: 'mockAutoCoeff', unit: '(%)' },
          { title: '基准赔付率(含NCD)', code: 'mockBasicPayRate', unit: '(%)' },
          { title: '保单获取成本配置方案(不含销推、不含税)', code: 'mockPolicyCostRate', unit: '(%)' },
          { title: '保费占比', code: 'mockPrmProportion', unit: '(%)' },
          { title: '策略A:总折扣管控', code: 'mockTotalDiscount', unit: '(%)' },
          { title: '预期变动成本率', code: 'preChaCostRate', unit: '(%)' },
          { title: '预期综合成本率(不含总部)', code: 'preCostRateEx', unit: '(%)' },
          { title: '预期综合成本率(含总部)', code: 'preCostRateIn', unit: '(%)' },
          { title: '预期赔付率(不含间接理赔费用)', code: 'prePayRate', unit: '(%)' },
        ];
        await this.setState({ backBusiness })
        await Charts.setLine(this.back1Chart, getTrackdataData, 'mockAutoCoeff', '(%)', null, null, true, 'acceptdate');
        await Charts.setLine(this.back2Chart, getTrackdataData, 'mockAutoCoeff', '(%)', null, null, true, 'startdate');
        const backBusiness1 = [], backBusiness2 = [];
        for (let i of backBusiness) {
          const obj1 = { ...i }, obj2 = { ...i };
          obj1.title += '(方案)';
          obj2.title += '(生效时间起始)';
          backBusiness1.push(obj1)
          backBusiness2.push(obj2)
        }
        // 这里把所有数据表都切换回图表，不然用户在数据表的情况下重新渲染数据后再切换回图表回导致图表被挤压
        this.setState({ showOther: false, showBack1: false, showBack2: false })
        this.setState({ backBusiness1, backBusiness2 })
        this.setTableData(backBusiness1, 'back1', backBusiness2);
        this.setTableData(backBusiness1, 'back2', backBusiness2);
      }, err => {
        message.error(err.message)
      })
    }, err => {
      message.error(err.message)
    })
  }

  // 设置所有表格的数据
  setTableData = (otherArr, type, elseArr) => {
    const { getmonidataData, getTrackdataData } = this.props.analysis;
    let otherColumnHead = [], otherData = [], otherExtra = [      // 除了基础数据外的新增数据
      {
        title: '平均',
        width: 200,
        dataIndex: 'average',
        key: 'average',
        align: 'center',
      }, {
        title: '首尾新增',
        width: 200,
        dataIndex: 'diff',
        key: 'diff',
        align: 'center',
      }
    ];
    switch (type) {
      case 'other': {
        for (let i of getmonidataData) {
          otherColumnHead.push({
            title: i.dataDate,
            width: 200,
            dataIndex: i.dataDate,
            align: 'center',
            key: i.dataDate,
            dateParse: Date.parse(i.dataDate)
          })
        }
        otherColumnHead = otherColumnHead.sort((a, b) => a.dateParse - b.dateParse);
        // 根据数组参数，循环配置
        for (let i of otherArr) {
          const obj = {
            key: i.title,
            name: i.title + i.unit,
          }
          for (let j of getmonidataData) {
            let val;
            // 数据校验，后端可能不返回这个字段，所以需要对空值进行0的补值，然后根据单位的不同，数据的储存也不同
            if (j[i.code]) val = j[i.code];
            else val = 0;
            if (i.unit === '(%)') obj[[j.dataDate]] = (val * 100).toFixed(2);
            else obj[[j.dataDate]] = val;
          }
          // 把当前获取的值放入数组，再根据计算公式算出平均值和首尾新增
          let count = [];
          for (let i in obj) {
            if (i.indexOf('-') > 0) {
              if (obj[i]) count.push(obj[i]);
              else count.push(0);
            }
          }
          // 如果单位的件的话就不保留小数，否则就保留
          obj.average = i.unit === '(件)' ? eval(count.join('+')) / count.length : (eval(count.join('+')) / count.length).toFixed(2);
          obj.diff = i.unit === '(件)' ? parseFloat(count[count.length - 1]) - parseFloat(count[0]) :
            (parseFloat(count[count.length - 1]) - parseFloat(count[0])).toFixed(2);
          otherData.push(obj)
        }
      }; break;
      case 'back1': {
        if (getTrackdataData.acceptdate) {
          const { effectTime } = getTrackdataData.acceptdate;
          back(effectTime)
        }
      }; break;
      case 'back2': {
        if (getTrackdataData.acceptdate) {
          const { effectTime } = getTrackdataData.acceptdate;
          back(effectTime)
        }
      }; break;
    }
    // 回溯共用配置表格函数
    function back(effectTime) {
      // 根据参数不同，循环对象不同，按照循环的对象个数来进行添加
      for (let i of effectTime) {
        otherColumnHead.push({
          title: i.dataDate,
          width: 200,
          dataIndex: i.dataDate,
          align: 'center',
          key: i.dataDate,
          dateParse: Date.parse(i.dataDate)
        })
      }
      otherColumnHead = otherColumnHead.sort((a, b) => a.dateParse - b.dateParse);
      // 循环主函数传递过来的配置好的数组
      for (let i of otherArr) {
        const obj = {
          key: i.title,
          name: i.title + i.unit,
        }
        for (let j of effectTime) {
          let mockData;
          // 数据校验，后端可能不返回这个字段，所以需要对空值进行0的补值，回溯全都是百分比，不考虑其他因素
          if (getTrackdataData.mockstart.mock[0][i.code]) mockData = getTrackdataData.mockstart.mock[0][i.code];
          else mockData = 0;
          obj[[j.dataDate]] = (mockData * 100).toFixed(2);
        }
        otherData.push(obj)
      }
      // 这里是专门给回溯配置的主函数的第三个数组参数
      for (let i in elseArr) {
        const obj = {
          key: elseArr[i].title,
          name: elseArr[i].title + elseArr[i].unit
        }
        // 根据需求，额外添加差值的数据
        const difObj = {
          key: elseArr[i].title + '+' + '差值',
          name: '差值'
        }
        let diff;   // 差值
        for (let j of effectTime) {
          let effectData, mockData;

          // 数据校验，后端可能不返回这个字段，所以需要对空值进行0的补值，回溯全都是百分比，不考虑其他因素
          if (j[elseArr[i].code]) effectData = j[elseArr[i].code];
          else effectData = 0;

          if (getTrackdataData.mockstart.mock[0][elseArr[i].code]) mockData = getTrackdataData.mockstart.mock[0][elseArr[i].code];
          else mockData = 0;

          obj[[j.dataDate]] = (effectData * 100).toFixed(2);
          diff = effectData - mockData;
          difObj[[j.dataDate]] = (diff * 100).toFixed(2);
        }
        // 见缝插针，在最早的数组中后一个位置插入主函数第三个数组参数的循环值，然后再插入一个差值，依次循环
        otherData.splice(3 * i + 1, 0, obj);
        otherData.splice(3 * i + 2, 0, difObj);
      }
      // 循环整个表格数据，用'-'来检索的是日期，例：2020-01-01，然后进行查漏补缺，最后计算出平均值和首尾新增
      for (let i of otherData) {
        const count = [];
        for (let j in i) {
          if (j.indexOf('-') > 0) {
            if (i[j]) count.push(i[j]);
            else count.push(0);
          }
        }
        i.average = (eval(count.join('+')) / count.length).toFixed(2);
        i.diff = (parseFloat(count[count.length - 1]) - parseFloat(count[0])).toFixed(2);
      }
    }

    // 根据switch中不同方式的计算otherColumnHead，最后再进行把平均和首尾新增插入进去
    otherColumnHead.push(...otherExtra);
    const otherColumns = [        // 汇总形成完整的表格头部
      {
        title: '指标',
        width: 250,
        dataIndex: 'name',
        key: 'name',
        align: 'center',
        fixed: 'left',
        render: (text, record, index) => {
          // 获取单位，把单位的颜色改成红色
          const unit = text.split(record.key)[1];
          const txt = text.split(unit)[0];
          if (unit && unit !== '') return <span>{txt}<span style={{ color: 'red' }}>{unit}</span></span>
          else return <span>{text}</span>
        }
      },
      ...otherColumnHead
    ];
    this.setState({ [`${type}Columns`]: otherColumns, [`${type}Data`]: otherData })
  }

  // 数据配置
  dataSet = () => {
    const { getmonidataData } = this.props.analysis;
    const follow = [
      { id: 1, title: '签单保费趋势图', code: 'acceptPrm' },
      { id: 2, title: '变动成本率走势图', code: 'chaCostRate' },
      { id: 3, title: '整体平均总折扣率走势图', code: 'avgDiscount' },
      { id: 4, title: '满期赔付率走势图', code: 'expPayRate' }
    ];
    for (let i of follow) {
      let next, prev;
      // 如果返回的数据有，则使用，否则配0
      if (getmonidataData[0]) {
        if (getmonidataData[0][i.code]) prev = getmonidataData[0][i.code];
        else prev = 0;
      } else prev = 0;
      if (getmonidataData[1]) {
        if (getmonidataData[1][i.code]) next = getmonidataData[1][i.code];
        else next = 0;
      } else next = 0;
      // 计算图形头部的金额和百分比，以及环比
      if (i.code === 'acceptPrm') {
        i.data = prev.toFixed(2) + '万元';
        if ((prev - next) === 0 || next === 0) i.ratio = '0.00%';
        else i.ratio = ((prev - next) * 100 / next).toFixed(2) + '%';
      } else {
        i.data = (prev * 100).toFixed(2) + '%';
        i.ratio = ((prev - next) * 100).toFixed(2) + '%';
      }
    }
    const that = this;
    // 异步绘制echarts
    (async () => {
      await that.setState({ follow });

      // 关注的小图
      const smallCharts = [];
      for (let i in that) {
        if (i.indexOf('smallChart') !== -1) smallCharts.push(that[i])
      }
      for (let i of smallCharts) {
        const code = i.getAttribute('data-set');
        if (code === 'acceptPrm') Charts.setBar(i, getmonidataData, code);
        else Charts.setLine(i, getmonidataData, code, '(%)');
      }
      // 关注的大图
      // 保留切换数据前的基准线和颜色的操作，如果是初始化绘图，也不受影响
      const { otherChartLine, otherChartColor } = that.state;
      const line = otherChartLine.length > 0 ? otherChartLine : null;
      const colors = otherChartColor.length > 0 ? otherChartColor : null;
      console.log(getmonidataData);
      Charts.setLine(that.otherChart, getmonidataData, 'acceptPrmRate', '(%)', line, colors, true);
    })()
  }

  // 机构方案切换
  companyChange = (planId) => {
    this.setState({ planId });
    this.props.dispatch({
      type: 'analysis/getPlanBusUnit',
      payload: {
        planId
      }
    }).then(() => {
      // 清空业务单元的值
      this.props.form.setFieldsValue({ business: [] })
    }, err => {
      message.error(err.message)
    })
  }

  // 设置高度
  setHeight = (i, type) => {
    console.log(i);
    const parent = i.parentNode;
    let height = parent.offsetHeight - 20;
    for (let i in parent.childNodes) {
      const value = parent.childNodes[i].offsetHeight;
      // if(parent.childNodes[i].offsetHeight === 0 || value === undefined) break;
      if (value === undefined) break;
      height -= value
    }
    this.setState({ [type]: height })
  }

  // 切换数据
  onOkModel = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        message.warn('请检查机构方案和下属业务单元是否有填写！');
        return;
      };
      const { otherBusiness, backBusiness1, backBusiness2 } = this.state;
      const { getPlanBusUnitData } = this.props.analysis;
      let modelId;
      for (let i of getPlanBusUnitData) {
        if (i.planId === values.company) modelId = i.modelId
      }

      this.props.dispatch({
        type: 'analysis/getmonidata',
        payload: {
          planId: values.company,
          nodeId: values.business,
          cycle: values.time,
          modelId
        }
      }).then(() => {
        const { getEffectPlanContentData, getPlanBusUnitData } = this.props.analysis;
        let comPanyName, nodeName;
        // 获取当前机构id的中文名，然后替换state
        for (let i of getEffectPlanContentData) {
          if (i.planId === values.company) comPanyName = i.companyName;
        }
        // 获取当前业务单元id的中文名，然后替换state
        for (let i of getPlanBusUnitData) {
          if (i.nodeId === values.business) nodeName = i.nodeName;
        }
        // 重新设置图形头部和表格
        this.dataSet();
        this.setTableData(otherBusiness, 'other')
        this.setState({ comPanyName, nodeName, dataVisible: false })
      }, err => {
        message.error(err.message)
      })
      // 切换预警的数据
      this.props.dispatch({
        type: 'analysis/getMainAlertResult',
        payload: {
          planId: values.company,
          nodeId: values.business,
        }
      }).then(() => {
        const { getMainAlertResultData } = this.props.analysis;
        this.setState({ dataDate: getMainAlertResultData.length > 0 ? getMainAlertResultData[0].dataDate : '' })
      }, err => {
        message.error(err.message)
      })
      // 切换回溯的数据
      this.props.dispatch({
        type: 'analysis/getTrackdata',
        payload: {
          planId: values.company,
          nodeId: values.business,
        }
      }).then(async () => {
        // 重新设置表格和绘图，保留切换数据前的基准线和颜色的操作
        const { getTrackdataData } = this.props.analysis;
        const { back1ChartLine, back1ChartColor, back2ChartLine, back2ChartColor } = this.state;
        const line1 = back1ChartLine.length > 0 ? back1ChartLine : null;
        const colors1 = back1ChartColor.length > 0 ? back1ChartColor : null;
        const line2 = back2ChartLine.length > 0 ? back2ChartLine : null;
        const colors2 = back2ChartColor.length > 0 ? back2ChartColor : null;
        // 这里把所有数据表都切换回图表，不然用户在数据表的情况下重新渲染数据后再切换回图表回导致图表被挤压
        await Charts.setLine(this.back1Chart, getTrackdataData, 'mockAutoCoeff', '(%)', line1, colors1, true, 'acceptdate');
        await Charts.setLine(this.back2Chart, getTrackdataData, 'mockAutoCoeff', '(%)', line2, colors2, true, 'startdate');
        this.setState({ showOther: false, showBack1: false, showBack2: false })
        this.setTableData(backBusiness1, 'back1', backBusiness2)
        this.setTableData(backBusiness1, 'back2', backBusiness2)
      }, err => {
        message.error(err.message)
      })
    })
  }

  // 切换统计周期
  changeCycle = (val) => {
    const { planId, nodeId, otherBusiness } = this.state;
    const { getPlanBusUnitData } = this.props.analysis;
    const { modelId } = getPlanBusUnitData[0] || {};
    let cycle;
    if (val === 'week') cycle = '7周';
    else cycle = '12月';
    this.setState({ cycle })
    this.props.dispatch({
      type: 'analysis/getmonidata',
      payload: {
        planId,
        nodeId,
        cycle: val,
        modelId
      }
    }).then(() => {
      // 这里把所有数据表都切换回图表，不然用户在数据表的情况下重新渲染数据后再切换回图表回导致图表被挤压
      this.setState({ showOther: false, showBack1: false, showBack2: false })
      this.setTableData(otherBusiness, 'other')
      this.dataSet();
    }, err => {
      message.error(err.message)
    })
  }

  // ChartsHeaders组件中，选中基准线和切换颜色调用该方法
  reloadCharts = (type) => {
    let val;
    switch (type) {
      case 'otherChart': val = this.props.form.getFieldValue('otherSelect'); break;
      case 'back1Chart': val = this.props.form.getFieldValue('backSelect1'); break;
      case 'back2Chart': val = this.props.form.getFieldValue('backSelect2'); break;
    }
    this.setCharts(val, type);
  }

  // 切换回溯和其他业务的下拉，以及切换颜色和基准线时共同调用的函数
  setCharts = (val, name) => {
    const { otherBusiness, backBusiness, otherChartLine, otherChartColor, back1ChartLine,
      back1ChartColor, back2ChartLine, back2ChartColor } = this.state;
    const { getmonidataData, getTrackdataData } = this.props.analysis;
    // 先把需要的参数全部进行配值
    // 颜色和基准线都要判定数组长度
    let unit, objName = null, data, line, colors;
    if (name.indexOf('back') >= 0) {
      for (let i of backBusiness) {
        if (i.code === val) unit = i.unit;
      }
      if (name === 'back1Chart') {
        objName = 'acceptdate';
        line = back1ChartLine.length > 0 ? back1ChartLine : null;
        colors = back1ChartColor.length > 0 ? back1ChartColor : null;
      }
      else {
        objName = 'startdate';
        line = back2ChartLine.length > 0 ? back2ChartLine : null;
        colors = back2ChartColor.length > 0 ? back2ChartColor : null;
      }
      for (let i of backBusiness) {
        if (i.code === val) unit = i.unit;
      }
      data = getTrackdataData;
    } else {
      data = getmonidataData;
      line = otherChartLine.length > 0 ? otherChartLine : null;
      colors = otherChartColor.length > 0 ? otherChartColor : null;
      for (let i of otherBusiness) {
        if (i.code === val) unit = i.unit;
      }
    }
    Charts.setLine(this[name], data, val, unit, line, colors, true, objName)
  }

  // 走势图和数据表切换
  changeOther = (type) => {
    const { showOther, showBack1, showBack2, otherColumns, back1Columns, back2Columns } = this.state;
    let fontOther, fontBack1, fontBack2;
    const setCol = (name, columns, index) => {
      const table = document.getElementsByClassName('ant-table-wrapper');
      setTimeout(() => {
        const width = table[index].clientWidth;
        // const { columns } = this.state;
        const dataWidth = columns.length * 200 + 50;

        if (dataWidth > width) columns[0].fixed = 'left';
        else delete columns[0].fixed;
        this.setState({ [name]: columns })
      });
    }
    switch (type) {
      case 'other': {
        if (showOther) fontOther = '数据表';
        else {
          fontOther = '走势图';
          setCol('otherColumns', otherColumns, 0);
        }
        this.setState({ fontOther, showOther: !showOther })
      }; break;
      case 'back1': {
        if (showBack1) fontBack1 = '数据表';
        else {
          fontBack1 = '走势图';
          setCol('back1Columns', back1Columns, 1);
        }
        this.setState({ fontBack1, showBack1: !showBack1 })
      }; break;
      case 'back2': {
        if (showBack2) fontBack2 = '数据表';
        else {
          fontBack2 = '走势图';
          setCol('back2Columns', back2Columns, 2);
        }
        this.setState({ fontBack2, showBack2: !showBack2 })
      }; break;
    }
  }

  // 导出表格
  export = (type, time) => {
    const { otherColumns, otherData, back1Columns, back1Data, back2Columns, back2Data } = this.state;
    let option = {}, dataTable = [], title = [], fileName;
    switch (type) {
      case 'back1': {
        for (let i of back1Data) {
          const obj = {};
          for (let j of back1Columns) {
            obj[[j.title]] = i[j.dataIndex];
            title.push(j.title)
          }
          dataTable.push(obj);
        }
        fileName = '回溯结果走势1' + '-' + time;
      }; break;
      case 'back2': {
        for (let i of back2Data) {
          const obj = {};
          for (let j of back2Columns) {
            obj[[j.title]] = i[j.dataIndex];
            title.push(j.title)
          }
          dataTable.push(obj);
        }
        fileName = '回溯结果走势2' + '-' + time;
      }; break;
      default: {
        for (let i of otherData) {
          const obj = {};
          for (let j of otherColumns) {
            obj[[j.title]] = i[j.dataIndex];
            title.push(j.title)
          }
          dataTable.push(obj);
        }
        fileName = '其他业务数据走势' + '-' + time;
      }; break;
    }
    // 因为是在循环中进行添加，所以有重复，进行去重
    title = title.filter((item, index) => title.indexOf(item) === index);
    option.fileName = fileName
    option.datas = [
      {
        sheetData: dataTable,
        sheetName: 'sheet',
        sheetFilter: title,
        sheetHeader: title,
      }
    ];
    let toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  }

  render() {
    const { dataVisible, fontOther, showOther, smallHeight, otherHeight, showBack1, showBack2,
      fontBack1, fontBack2, planId, comPanyName, nodeName, follow, otherBusiness, cycle, otherColumns,
      otherData, back1Columns, back1Data, back2Columns, back2Data, backBusiness, dataDate } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { getEffectPlanContentData, getPlanBusUnitData, getMainAlertResultData } = this.props.analysis;

    console.log(getMainAlertResultData);
    let disOther, disBack1, disBack2;
    if (fontOther === '数据表') disOther = false;
    else disOther = true;
    if (fontBack1 === '数据表') disBack1 = false;
    else disBack1 = true;
    if (fontBack2 === '数据表') disBack2 = false;
    else disBack2 = true;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card className={styles.card}>
            <header className={styles.header}>
              <div style={{ fontSize: 18 }}>
                <span className={styles.appName}>展业跟踪</span>
                <Divider type="vertical" />
                <span>所属机构：{comPanyName}</span>
                <Divider type="vertical" />
                <span>业务单元：{nodeName}</span>
                <Divider type="vertical" />
                <span>数据截止：{dataDate}</span>
              </div>
            </header>
            <div>
              <div className={styles.middle}>
                <div className={styles.focusText}>
                  <span>预警</span>
                  <div style={{ display: 'flex' }}>
                    <Button type='primary' onClick={() => this.setState({ dataVisible: !dataVisible })} style={{ marginRight: 15 }}>切换</Button>
                    <Button type='primary'>
                      <Link to={{ pathname: '/businessmap/mapTrack/warnDetails' }}>预警详情</Link>
                    </Button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {getMainAlertResultData.map(item => {
                    let unit, color, value = item.measureValue;
                    switch (item.unitFlag) {
                      case '0': {
                        unit = '万元';
                        value = item.measureValue.toFixed(2);
                        break;
                      }
                      case '1': {
                        unit = '%';
                        value = (item.measureValue * 100).toFixed(2);
                        break;
                      }
                      case '2': unit = '件'; break;
                      default: unit = ''; break;
                    }
                    switch (item.colourType) {
                      case 'green': color = green; break;
                      case 'red': color = red; break;
                      default: color = yellow; break;
                    }
                    return (
                      <div key={item.alertId} className={styles.box}>
                        <div className={styles.warn} style={{ backgroundImage: `url(${color})`, backgroundSize: '200%', backgroundRepeat: 'round' }}>
                          <div>{item.alertText}</div>
                          <div className={styles.bigFont}>{value + unit}</div>
                          <div className={styles.bottom}>
                            <div>
                              <span>{item.alarmCycle === 'week' ? '周' : '月'}环比</span>
                              <span className={styles.span}>
                                {item.ratioValue && item.ratioValue !== 0 ? (item.ratioValue > 0 ? up : down) : '\t'}
                              </span>
                              <span>{item.ratioValue ? ((item.ratioValue * 100).toFixed(2) + '%') : '0.00%'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className={styles.middle}>
                <div className={styles.focusText}>
                  <span>关注</span>
                  <div style={{ fontSize: 16, lineHeight: '44px' }}>（按签单时间口径）</div>
                  <FormItem label='统计周期' className={styles.form}>
                    {getFieldDecorator('time', {
                      initialValue: 'week'
                    })(
                      <Select className={styles.select} onChange={e => this.changeCycle(e)}>
                        <Option value='week'>周</Option>
                        <Option value='month'>月</Option>
                      </Select>
                    )}
                  </FormItem>
                </div>

                <div className={styles.sbigBox}>
                  {follow.map(item => {
                    const ratio = parseFloat(item.ratio);
                    return (
                      <div key={item.id} className={styles.chartbox}>
                        <div className={styles.inBox}>
                          <div className={styles.header}>
                            <div className={styles.title}>{item.title}</div>
                            <div>
                              <span className={styles.bigFont}>{item.data}&nbsp;&nbsp;&nbsp;</span>
                              <span>({ratio > 0 ? up : (ratio < 0 ? down : '')}{item.ratio})</span>
                            </div>
                          </div>
                          <div ref={e => this[`smallChart${item.id}`] = e} data-set={item.code} style={{ height: smallHeight, width: '100%' }} className={styles.chart}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className={styles.middle}>
                <div className={styles.focusText}>
                  <span>其他业务数据走势</span>
                </div>

                {otherBusiness.length > 0 ?
                  <div className={styles.sbigBox}>
                    <div className={styles.chartbox}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormItem label='按签单时间口径' style={{ display: 'flex', fontSize: 16 }}>
                          {getFieldDecorator('otherSelect', {
                            initialValue: 'acceptPrmRate'
                          })(
                            <Select disabled={disOther} style={{ width: 150 }} onChange={e => this.setCharts(e, 'otherChart')}>
                              {otherBusiness.map(item => {
                                return (
                                  <Option key={item.code} title={item.title} value={item.code}>{item.title}</Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>
                        <div style={{ display: 'flex', fontSize: 16, marginBottom: 10 }}>
                          <ChartsHeader disabled={disOther} isDefault={false} root={this} chartName='otherChart' y2={false}></ChartsHeader>
                          <Button type='primary' style={{ display: showOther ? 'block' : 'none', marginRight: 10 }}
                            onClick={() => this.export('other', '签单时间')}>导出</Button>
                          <Button type='primary' onClick={() => this.changeOther('other')}>{fontOther}</Button>
                        </div>
                      </div>
                      <div ref={e => this.otherChart = e} style={{ height: otherHeight, width: '100%', display: showOther ? 'none' : 'block' }}></div>

                      <Table
                        pagination={false}
                        columns={otherColumns}
                        style={{ height: otherHeight, display: showOther ? 'block' : 'none', overflow: 'hidden' }}
                        bordered
                        size='middle'
                        dataSource={otherData}
                        scroll={{ x: otherColumns.length * 200 + 50, y: otherHeight - 60 }} />
                    </div>
                  </div> : null}
              </div>

              <div className={styles.middle}>
                <div className={styles.focusText}>
                  <span>回溯结果走势</span>
                </div>

                {backBusiness.length > 0 ?
                  <div className={styles.sbigBox}>
                    <div className={styles.chartbox}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormItem label='按签单时间口径' style={{ display: 'flex', fontSize: 16 }}>
                          {getFieldDecorator('backSelect1', {
                            initialValue: 'mockAutoCoeff'
                          })(
                            <Select disabled={disBack1} className={styles.select} onChange={e => this.setCharts(e, 'back1Chart')}>
                              {backBusiness.map(item => {
                                return (
                                  <Option key={item.code} title={item.title} value={item.code}>{item.title}</Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>
                        <div style={{ display: 'flex', fontSize: 16, marginBottom: 10 }}>
                          <ChartsHeader disabled={disBack1} isDefault={false} root={this} chartName='back1Chart' y2={false}></ChartsHeader>
                          <Button type='primary' style={{ display: showBack1 ? 'block' : 'none', marginRight: 10 }}
                            onClick={() => this.export('back1', '签单时间')}>导出</Button>
                          <Button type='primary' onClick={() => this.changeOther('back1')}>{fontBack1}</Button>
                        </div>
                      </div>
                      <div ref={e => this.back1Chart = e} style={{ height: otherHeight, width: '100%', display: showBack1 ? 'none' : 'block' }}></div>
                      <Table
                        pagination={false}
                        columns={back1Columns}
                        style={{ height: otherHeight, display: showBack1 ? 'block' : 'none', overflow: 'hidden' }}
                        bordered
                        size='middle'
                        dataSource={back1Data}
                        scroll={{ x: back1Columns.length * 200, y: otherHeight - 60 }} />
                    </div>
                  </div> : null}

                {backBusiness.length > 0 ?
                  <div className={styles.sbigBox}>
                    <div className={styles.chartbox}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <FormItem label='按起保时间口径' style={{ display: 'flex', fontSize: 16 }}>
                          {getFieldDecorator('backSelect2', {
                            initialValue: 'mockAutoCoeff'
                          })(
                            <Select disabled={disBack2} className={styles.select} onChange={e => this.setCharts(e, 'back2Chart')}>
                              {backBusiness.map(item => {
                                return (
                                  <Option key={item.code} title={item.title} value={item.code}>{item.title}</Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>
                        <div style={{ display: 'flex', fontSize: 16, marginBottom: 10 }}>
                          <ChartsHeader disabled={disBack2} isDefault={false} root={this} chartName='back2Chart' y2={false}></ChartsHeader>
                          <Button type='primary' style={{ display: showBack2 ? 'block' : 'none', marginRight: 10 }}
                            onClick={() => this.export('back1', '起保时间')}>导出</Button>
                          <Button type='primary' onClick={() => this.changeOther('back2')}>{fontBack2}</Button>
                        </div>
                      </div>
                      <div ref={e => this.back2Chart = e} style={{ height: otherHeight, width: '100%', display: showBack2 ? 'none' : 'block' }} className={styles.chart}></div>
                      <Table
                        pagination={false}
                        columns={back2Columns}
                        style={{ height: otherHeight, display: showBack2 ? 'block' : 'none', overflow: 'hidden' }}
                        bordered
                        size='middle'
                        dataSource={back2Data}
                        scroll={{ x: back2Columns.length * 200, y: otherHeight - 60 }} />
                    </div>
                  </div> : null}
              </div>
            </div>

            <Modal
              visible={dataVisible}
              onOk={e => this.onOkModel(e)}
              onCancel={e => { this.setState({ dataVisible: false }) }}
              title='切换数据'
              className={styles.modal}
            >
              <Tabs defaultActiveKey="1" >
                <TabPane tab="机构方案" key="1" style={{ padding: '0 10px' }}>
                  <FormItem label="选择机构方案" className={styles.form}>
                    {getFieldDecorator('company', {
                      initialValue: planId, rules: [{ required: true, message: '必选' }]
                    })(
                      <Select className={styles.select}
                        onChange={e => this.companyChange(e)}
                        showSearch
                        optionLabelProp="children"
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                      >
                        {getEffectPlanContentData.map(item => {
                          return (
                            <Option value={item.planId} key={item.planId}>{item.planName}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                </TabPane>
                <TabPane tab="下属业务单元" key="2" style={{ padding: '0 10px' }}>
                  <FormItem label="选择业务单元" className={styles.form}>
                    {getFieldDecorator('business', {
                      initialValue: [], rules: [{ required: true, message: '必选' }]
                    })(
                      <Select className={styles.select}
                        showSearch
                        optionLabelProp="children"
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                      >
                        {getPlanBusUnitData.map(item => {
                          return (
                            <Option value={item.nodeId} key={item.nodeId}>{item.nodeName}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                </TabPane>
              </Tabs>
            </Modal>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
