import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Spin, Button, message, Modal, Input, Collapse } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import CycleTime from './components/CycleTime';
import TimeNode from './components/TimeNode';
import FilterData from './components/FilterData';
import Measure from './components/Measure';
import Dimensions from './components/Dimensions';
import Mainlysis from './components/Mainlysis';
import Echarts from './components/Echarts';
import TableData from './components/TableData';
import moment from 'moment';
import ExportJsonExcel from 'js-export-excel';   // 导出excel
import Result from '../../components/Result';

const { Panel } = Collapse;

@connect(({ analysis, loading, umssouserinfo, global }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
  global
}))
@Form.create()

export default class PayPredict extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showBusiness: 'none',
      showFlow: 'none',
      getDimensions: 'payDimensions',            // 分析维度的请求models路径
      getFilter: 'payFilter',                    // 初始筛选数据维度的请求models路径
      getFilterAfter: 'payDimensionContent',     // 后续筛选数据维度的请求models路径
      getTimePeriod: 'payTimePeriod',            // 统计周期的请求models路径
      getEndTimeContent: 'payEndTimeContent',    // 获取时间节点内容的请求models路径
      getEndTimePeriod: 'payEndTimePeriod',      // 初始时间节点联级选择值的请求models路径
      getMeasures: 'payMeasures',                // 获取指标的请求models路径
      getMeasure: 'payMeasure',                  // 生成图表的请求models路径
      themeId: 'payrate',                        // 主题ID
      appId: 'prepay',                           // 应用ID   
      mainArr: [],                               // 给主维度使用的下拉列表     
      saveModelVisible: false,                   // 弹窗的显示与否       
      click: 'payclickanaly',                    // 个人工作台点击回显的请求返回数据组，此字符串亦是路径亦是数据组
      upDate: 'payUpdate',                       // 点击保存查询更新数据的请求models路径
      save: 'paySave',                           // 点击保存查询新增数据的请求models路径
      postObj: {},                               // 保存查询的需要传递的所有数据对象
      route: 'paypredict',                       // 当前界面的路由地址  
      appName: '赔付预测',                        // 个人工作台需展示的应用名称
      themeName: '赔付预测分析',                  // 个人工作台需展示的主题名称
      application: 'payApplication',             // 获取这个借口的生成图表请求地址
      userInfo: 'getUserInfo',                   // 获取这个接口的companyCode
      disabled: true,                            // 导出按钮是否可用
      modeDis: true,                             // 保存模板是否可用
      publicMode: true,                          // 用于判定是否为公共模板
      saveMode: 'saveMode',                      // 保存模板的请求models路径
      editMode: 'queryMode',                      // 编辑模板的请求models路径
      queryMode: 'queryMode',                    // 查询模板的请求models路径
      queryConfigParam: 'queryModeData',         // 查询模板的请求返回数据  
      visual: 'queryModeData',                    // 编辑模板的请求返回数据,
      clickMode: true,                           // 是否触发componentwill函数
    }
  }

  componentWillMount() {
    // 如果是从公共模板管理点进来的，那就固定显示个人模板，否则的话就根据当前点击切换的是什么模板，后面的也相应换成什么模板
    let publicMode = true;
    if (this.props.location.manaIscommon) {
      this.props.dispatch({
        type: 'global/changeClick',
        payload: true
      })
    } else {
      const { global: { publicModeName } } = this.props;
      if (publicModeName === '公共') publicMode = false;
      else publicMode = true;
      this.setState({ publicMode })
    }

    const { location, dispatch, currentUser } = this.props;
    const { getDimensions, getFilter, getTimePeriod, getEndTimePeriod, themeId, appId,
      getMeasures, application, userInfo, click, queryMode, queryConfigParam } = this.state;
    dispatch({
      type: `analysis/${getTimePeriod}`,
      payload: { themeId, appId }
    })
    dispatch({
      type: `analysis/${getEndTimePeriod}`,
      payload: { themeId, appId }
    })
    dispatch({
      type: `analysis/${getFilter}`,
      payload: { themeId, appId }
    })
    dispatch({
      type: `analysis/${getDimensions}`,
      payload: { themeId, appId }
    })
    dispatch({
      type: `analysis/${getMeasures}`,
      payload: { themeId, appId }
    })
    dispatch({
      type: `analysis/${application}`,
      payload: []
    })
    dispatch({
      type: `analysis/${userInfo}`
    }).then(() => {
      // 数据回显
      if (location.id) {      // 个人工作台
        dispatch({
          type: `analysis/${click}`,
          payload: { id: location.id }
        }).then(() => {
          const getResult = JSON.parse(this.props.analysis[click].commonAnalysisConfig);
          console.log(getResult)
          this.reloadData(getResult, null, '0');
        })
      } else {               // 先查看是否个人工作台的回显，否则再请求个人默认模板的数据
        const { companyCode, companyName } = this.props.analysis.getUserInfoData;
        const { manaIscommon, company_, companyName_ } = this.props.location;
        dispatch({
          type: `analysis/${queryMode}`,
          payload: {
            man: currentUser.principal.name,
            company: company_ ? company_ : companyCode,
            companyName: companyName_ ? companyName_ : companyName,
            appId,
            themeId,
            manaIscommon: manaIscommon
          }
        }).then(() => {
          const { commonAnalysisConfig, isPar } = this.props.analysis[queryConfigParam];
          if (!commonAnalysisConfig) return;
          const getResult = JSON.parse(commonAnalysisConfig);
          this.reloadData(getResult, null, isPar, !publicMode);
          this.getTableData();
        })
      }
    })
  }

  // 数据回显
  reloadData = (getResult, publicMode, isPar, modeChange) => {
    const { cycleForm, cycleState, dimensionsForm, dimensionsState, filterForm, mainlysisForm, mainlysisState, filterState,
      measureForm, measureState, timeForm, timeState, payState } = getResult;
    let mode;
    if (modeChange) mode = false;
    else mode = true;
    // 先行修改本模块状态
    this.setState({ ...payState, publicMode: mode, disabled: true, clickMode: true });
    if (publicMode) {
      this.setState({ publicMode: false, clickMode: false })
    }
    // ------------------------------- 先行修改状态，这部分是统计周期和时间
    this.Cycle.setState({ ...cycleState });
    const { timer } = cycleState;
    // 此处先行修改两个表单值
    this.Cycle.props.form.setFieldsValue({
      keys: cycleForm.keys,
      cycleTime: cycleForm.cycleTime
    })
    // 此处不和上面同步执行的原因是cycleForm中的值字符串会记录到下午16点，在对其进行设置，时间则会前移一天，所以需要对状态进行表单设置
    for (let i in timer) {
      this.Cycle.props.form.setFieldsValue({
        [i]: moment(timer[i], 'YYYY-MM-DD')
      })
    }
    // ------------------------------- 先行修改状态，这部分是时间节点
    this.TimeNode.setState({ ...timeState });
    this.TimeNode.getEndTimeContent(timeForm.endtime)
    // console.log(timeForm.endtime);
    for (let i in timeForm) {
      this.TimeNode.props.form.setFieldsValue({
        [i]: timeForm[i]
      })
    }
    // ------------------------------- 先行修改状态，这部分是筛选数据维度
    if (isPar === '0') {
      this.Filter.setState({ ...filterState });
      this.Filter.setState({ userOnce: true });
      for (let i in filterForm) {
        this.Filter.props.form.setFieldsValue({
          [i]: i.slice(0, 9) === 'selectDim' ? [filterForm[i][0]] : filterForm[i]
        })
      }
    }
    // ------------------------------- 先行修改状态，这部分是指标
    this.Measure.setState({ ...measureState });
    for (let i in measureForm) {
      this.Measure.props.form.setFieldsValue({
        [i]: measureForm[i]
      })
    }
    // ------------------------------- 先行修改状态，这部分是分析维度
    this.Dimensions.setState({ ...dimensionsState });
    for (let i in dimensionsForm) {
      this.Dimensions.props.form.setFieldsValue({
        [i]: dimensionsForm[i]
      })
    }
    // ------------------------------- 先行修改状态，这部分是主维度
    this.Mainlysis.setState({ ...mainlysisState });
    for (let i in mainlysisForm) {
      this.Mainlysis.props.form.setFieldsValue({
        [i]: mainlysisForm[i]
      })
    }
  }

  componentDidMount() {
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';
  }

  componentWillReceiveProps(props) {
    // 当用户点击菜单栏的编辑公共默认按钮的时候发送请求，如果当前模块为可视化模块则替换当前模块数据
    // 判断条件为控制模块的个人默认和公共默认相互切换，同时没值的时候不执行，设定在SiderMenu.js文件
    const { companyCode, companyName } = this.props.analysis.getUserInfoData;
    if (!companyCode) return;
    if (!this.state.clickMode) return;
    const { appId, themeId, editMode, visual, queryMode, queryConfigParam } = this.state;
    const { currentUser } = this.props;
    let payload, msg, publicMode, route, routeData;
    if (props.global.publicMode === '公共') {
      payload = {
        appId,
        themeId,
        iscommon: '0',
        company: companyCode,
        companyName
      }
      msg = '公共';
      publicMode = true;
      route = editMode;
      routeData = visual;
    } else if (props.global.publicMode === '个人') {
      payload = {
        man: currentUser.principal.name,
        appId,
        themeId,
        company: companyCode,
        companyName
      }
      msg = '个人';
      publicMode = false;
      route = queryMode;
      routeData = queryConfigParam;
    }
    if (props.global.publicMode) {
      this.props.dispatch({
        type: `analysis/${route}`,
        payload
      }).then(() => {
        if (this.props.analysis[routeData].commonAnalysisConfig) {
          const { isPar } = this.props.analysis[routeData];
          const getResult = JSON.parse(this.props.analysis[routeData].commonAnalysisConfig);
          this.reloadData(getResult, publicMode, isPar);
          this.getTableData();
        } else {
          message.warn(`当前${msg}模板没有设置，请重新填写完后点击保存`);
          this.setState({ publicMode: !publicMode })
        }
      })
      this.setState({ clickMode: false })
      setTimeout(() => {
        this.setState({ clickMode: true })
      }, 300)
    }
  }

  // 保存模板
  saveMode = () => {
    const { saveMode, themeId, appId, publicMode, userInfo } = this.state;
    const { dispatch, currentUser } = this.props;
    if (!this.checked()) return;
    const cycleForm = this.Cycle.props.form.getFieldsValue();
    const cycleState = this.Cycle.state;
    const timeForm = this.TimeNode.props.form.getFieldsValue();
    const timeState = this.TimeNode.state;
    const filterForm = this.Filter.props.form.getFieldsValue();
    const filterState = this.Filter.state;
    const measureForm = this.Measure.props.form.getFieldsValue();
    const measureState = this.Measure.state;
    const dimensionsForm = this.Dimensions.props.form.getFieldsValue();
    const dimensionsState = this.Dimensions.state;
    const mainlysisForm = this.Mainlysis.props.form.getFieldsValue();
    const mainlysisState = this.Mainlysis.state;
    const payState = this.state;
    filterState.cascaderOption = [];
    const postObj = {
      cycleForm, cycleState, timeForm, timeState, filterForm, filterState,
      measureForm, measureState, dimensionsForm, dimensionsState, mainlysisForm, mainlysisState, payState
    };
    console.log(postObj)
    const { companyCode, companyName } = this.props.analysis[userInfo + 'Data'];
    dispatch({
      type: `analysis/${saveMode}`,
      payload: {
        man: currentUser.principal.name,
        company: companyCode,
        companyName,
        appId,
        themeId,
        appName: '赔付预测',
        // themeName: '赔付预测',
        iscommon: publicMode ? '1' : '0',
        commonAnalysisConfig: JSON.stringify(postObj)
      }
    }).then(() => {
      message.success('保存成功，下次将引用该模板，详细模板管理请在个人工作台中的公共模板管理进行操作！')
      // 此处修改筛选数据维度的状态，因为在传递JSON数据的时候数据量过大，所以删除了筛选数据维度的联级数据
      // 导致后续无法获取数据，所以此时让他可以重新获取
      this.Filter.setState({ userOnce: true })
    }).catch((e) => {
      message.warn(e.message);
    })
  }

  // 保存查询
  saveData = () => {
    if (!this.checked()) return;
    const cycleForm = this.Cycle.props.form.getFieldsValue();
    const cycleState = this.Cycle.state;
    const timeForm = this.TimeNode.props.form.getFieldsValue();
    const timeState = this.TimeNode.state;
    const filterForm = this.Filter.props.form.getFieldsValue();
    const filterState = this.Filter.state;
    const measureForm = this.Measure.props.form.getFieldsValue();
    const measureState = this.Measure.state;
    const dimensionsForm = this.Dimensions.props.form.getFieldsValue();
    const dimensionsState = this.Dimensions.state;
    const mainlysisForm = this.Mainlysis.props.form.getFieldsValue();
    const mainlysisState = this.Mainlysis.state;
    const payState = this.state;
    const postObj = {
      cycleForm, cycleState, timeForm, timeState, filterForm, filterState,
      measureForm, measureState, dimensionsForm, dimensionsState, mainlysisForm, mainlysisState, payState
    };

    // 如果判定成功说明是回显过来的数据，需要调用更新接口，否则用新增接口
    const { click, upDate } = this.state;
    if (this.props.analysis[click].id !== undefined) {
      this.props.dispatch({
        type: `analysis/${upDate}`,
        payload: {
          id: this.props.analysis[click].id,
          commonAnalysisConfig: JSON.stringify(postObj)
        }
      }).then(() => {
        message.success('保存成功，可在个人工作台查看！');
      }).catch((e) => {
        message.warn(e.message);
        return;
      })
    } else this.setState({ saveModelVisible: true, postObj });
  }

  // 校验
  checked = () => {
    let boolean = false;
    const { mainArr } = this.state;
    this.Cycle.props.form.validateFields((err, values) => {
      if (err) {
        for (let i in err) {
          // 因为antd表单的getFieldDecorator设置的id元素不能在同一个FormItem中设置多个，如果这样做第二个就不会验证到，所以第二个终止时间用其他方式提示
          if (i.slice(0, 9) === 'dateRight') {
            message.warn('请选择[终止时间]！');
            return;
          }
        }
      } else {
        this.TimeNode.props.form.validateFields((err, values) => {
          if (err) {
            if (err.timeContent) message.warn('请选择[时间节点]的具体时间！');
            return;
          } else {
            const { measure } = this.Measure.props.form.getFieldsValue();
            if (measure.length === 0) {
              message.warn('请至少选择一个[指标]！');
              return;
            } else {
              this.Mainlysis.props.form.validateFields((err, values) => {
                if (err) return;
                // 主维度
                if (mainArr.length > 3) {
                  message.warn('主维度最多可选项为3个，请在统计周期和分析维度中调整');
                  return;
                } else boolean = true;     // 必选项全部校验通过后，修改变量
              })
            }
          }
        })
      }
    })
    return boolean;
  }

  // 点击弹窗确定或取消
  onCancelDimModel = (type) => {
    if (type === 'ok') {
      const input = this.input.input.value;      // 输入框的值
      const { save, appId, themeId, route, appName, themeName, postObj } = this.state;
      if (input === '') {
        message.warn('请给保存的结果设置一个名字');
        return
      } else {
        this.props.dispatch({
          type: `analysis/${save}`,
          payload: {
            analysisName: input,
            man: this.props.currentUser.principal.name,
            appId,
            themeId,
            webParam: route,
            appName,
            themeName,
            commonAnalysisConfig: JSON.stringify(postObj)
          }
        }).then(() => {
          message.success('保存成功！');
          this.input.input.value = '';
          this.setState({ saveModelVisible: false })
        }).catch((e) => {
          message.warn(e.message);
          return;
        })
      }
    } else {
      this.setState({ saveModelVisible: false });
      this.input.input.value = '';
    }
  }

  // 生成图表
  getTableData = () => {
    if (!this.checked()) return;
    if (!this.getObjData()) return;
    const objData = this.getObjData();
    const { themeId, getMeasure, appId, mainArr } = this.state;
    // 下面的url是请求地址，在models里面会进行处理，原本参数不包含url
    let url;
    for (let i of this.props.analysis.payApplicationData.apps) {
      if (i.urlContent.split('/').slice(-2, -1)[0] === themeId) {
        url = i.urlContent;
      }
    }
    this.props.dispatch({
      type: `analysis/${getMeasure}`,
      payload: {
        themeId,
        appId,
        url,
        ...objData
      },
    }).then(() => {
      this.setState({ disabled: false })
      this.Echarts.setCharts();         // 调用子组件方法
      // 先修改子组件状态，每次点击的时候下面4张表都是不显示，之后再调用方法
      this.Table.setState({ show1: 'none', show2: 'none', show3: 'none', show4: 'none' });
      this.Table.setTable();            // 调用子组件方法
      this.graph.style.height = 'auto';       // 此处节省dom渲染，改变高度让其展开，不用display
    })
  }

  // 获取系统建议和生成图表需要传递的对象获取
  getObjData() {
    const { userInfo, mainArr } = this.state;
    const { dimensionGroup } = this.Dimensions.state;        // 获取子组件的所有状态数据
    const { filterData } = this.Filter.state;                // 获取子组件的所有状态数据
    const Cycle = this.Cycle.props.form.getFieldsValue();        // 获取子组件的所有状态数据
    const { timer } = this.Cycle.state;
    const D_getFieldsValue = this.Dimensions.props.form.getFieldsValue();   // 获取子组件的所有自定义组件值
    const { cycleTime, keys } = Cycle;
    const statiTimesNodes = this.TimeNode.props.form.getFieldsValue().timeContent;
    const { main } = this.Mainlysis.props.form.getFieldsValue();
    const dimension = [];             // 选择的分析维度
    const customDimension = {};       // 自定义的分析维度
    const filter = {};                // 过滤的分析维度
    const statiTimes = [];            // 选择的统计时间
    const companyCode = this.props.analysis[userInfo + 'Data'].companyCode;       // 当前用户的编码
    let mainDimension;                // 主维度
    let cycle = '';
    if (cycleTime !== '' && cycleTime !== undefined) {
      cycle = 'start' + cycleTime
    }
    for (let i of keys) {
      statiTimes.push({
        leftValue: timer['dateLeft' + i],
        rightValue: timer['dateRight' + i]
      })
    }
    for (let i in D_getFieldsValue) {
      if (i.indexOf('-') !== -1) {
        if (D_getFieldsValue[i].split('-')[1] !== '自定义分组' && D_getFieldsValue[i] !== '') {
          dimension.push(D_getFieldsValue[i].split('-')[0]);
        }
      }
    }

    if (dimensionGroup.length > 0) {
      for (let i of dimensionGroup) {
        if (i.saveAllData.length > 0) {         // 根据传递的名字来储存不同的数据
          customDimension[i.saveAllData[0].dimColumn] = [];
          for (let j of i.saveAllData) {
            customDimension[i.saveAllData[0].dimColumn].push({
              [j.title.split('+')[1]]: j.dimValue
            })
          }
        }
      }
    }

    // // 最后一层判断，至少需要一个维度
    // if(dimension.length === 0 && JSON.stringify(customDimension) === '{}'){
    //   message.warn('至少选择一个分析维度，如果自定义请设置分组！');
    //   return false;
    // } 

    // 过滤维度可以不需要
    for (let i of filterData) {
      if (i.length > 0) {
        const filterArr = [];
        for (let j of i) {
          filterArr.push(j.dimValue);
        }
        if (filter[i[0].dimColumn]) filter[i[0].dimColumn] = [...filter[i[0].dimColumn], ...filterArr];
        else filter[i[0].dimColumn] = filterArr;
      }
    }

    // 主维度
    console.log(mainArr)
    const mainArr_ = mainArr.filter(item => item.label === main);
    if (mainArr_.length > 0) {
      mainDimension = mainArr_[0].code
    } else {
      message.warn('主维度数据发生变化，请重新选择');
      return false
    }

    // 推送对象
    const objData = { cycle, dimension, customDimension, filter, statiTimes, statiTimesNodes, mainDimension, companyCode };
    console.log(objData)
    return objData;
  }

  // 导出数据
  export = () => {
    const measureCode = this.Measure.state.measure;
    const { getMeasure } = this.state;
    const { payRate, rollTwelvePayRate } = this.props.analysis[getMeasure + 'Data'];
    const option = {};                      // 导出表格对象
    const dataTable1 = [], dataTable2 = [], dataTable3 = [], dataTable4 = [], dataTable5 = [];     // 存放表格数据
    let title1 = [], title2 = [], title3 = [], title4 = [], title5 = [];                           // 存放表格头部名称
    for (let i in payRate) {
      const { mainDimeVal, mainDim } = payRate[i];
      for (let j in mainDimeVal) {
        const allObj = {              // 主表格head名称
          '主维度': 'mainDim',
          '分析维度组合': 'xdata',
          '已赚车年（车年）': 'caryear_yz',
          '已赚保费（元）': 'mqnetprm',
          '实际满期赔付率（%）': 'exppayrate',
          '滚动12个月满期赔付率（%）': 'twemonexppayrate',
          '风险成本赔付率（%）': 'riskcostpayrate',
          '含IBNR满期赔付率（%）': 'hasibnexppayrate'
        };
        for (let k in allObj) {
          if (allObj[k] === 'mainDim') allObj[k] = mainDim;    // 先把对象外面的值进行赋值
          // 再把需要在另一个对象中获取数据的进行赋值
          else if (allObj[k] === 'twemonexppayrate') allObj[k] = gettwe(mainDimeVal[j], mainDim);
          else allObj[k] = mainDimeVal[j][allObj[k]];
          title1.push(k);     // 把名字存入title
        }
        dataTable1.push(allObj);
      }
    }

    function gettwe(main, mainD) {
      // 这个地方给总表格的滚动12个月配值，因为处于不同的两个对象，所以需要在滚动12个月对象中判断当前主维度并且包含分析维度，再赋值
      let twemonexppayrate = '';
      for (let o in rollTwelvePayRate) {
        let { mainDimeVal, mainDim } = rollTwelvePayRate[o];
        if (!mainDim) mainDim = mainD;
        for (let k in mainDimeVal) {
          if (main.xdata.indexOf(mainDimeVal[k].xdata) !== -1 && mainD === mainDim) {
            twemonexppayrate = mainDimeVal[k].twemonexppayrate;
            return twemonexppayrate
          }
        }
      }
    }

    for (let item of measureCode) {
      switch (item) {     //  根据父组件传递的excelObj来创建excel的头部
        case 'riskcostpayrate':
          for (let i in payRate) {
            const { mainDimeVal, mainDim } = payRate[i];
            for (let j in mainDimeVal) {
              const obj = {
                '细分类别': 'mainDim',
                '分析维度组合': 'xdata',
                '已赚车年（车年）': 'caryear_yz',
                '实收保费（元）': 'sumnetpremium',
                '折前保费（元）': 'befprm',
                '纯风险成本': 'ap_premium',
                '实际满期赔付率（%）': 'exppayrate',
                '风险成本赔付率（%）': 'riskcostpayrate'
              };
              for (let k in obj) {
                if (obj[k] === 'mainDim') obj[k] = mainDim;    // 先把对象外面的值进行赋值
                else obj[k] = mainDimeVal[j][obj[k]];
                title2.push(k)
              }
              dataTable2.push(obj)
            }
          }
          break;
        case 'hasibnexppayrate':
          for (let i in payRate) {
            const { mainDimeVal, mainDim } = payRate[i];
            for (let j in mainDimeVal) {
              const obj = {
                '细分类别': 'mainDim',
                '分析维度组合': 'xdata',
                '已赚车年（车年）': 'caryear_yz',
                '满期保费（元）': 'mqnetprm',
                '已决赔款': 'settleamt',
                '未决赔款': 'oustdclmamt',
                'IBNR': 'ibnr',
                '含IBNR满期赔付率（%）': 'hasibnexppayrate'
              }
              for (let k in obj) {
                if (obj[k] === 'mainDim') obj[k] = mainDim;    // 先把对象外面的值进行赋值
                else obj[k] = mainDimeVal[j][obj[k]];
                title3.push(k)
              }
              dataTable3.push(obj)
            }
          }
          break;
        case 'twemonexppayrate':
          for (let i in rollTwelvePayRate) {
            const { mainDimeVal, mainDim } = rollTwelvePayRate[i];
            for (let j in mainDimeVal) {
              const obj = {
                '细分类别': 'mainDim',
                '分析维度组合': 'xdata',
                '滚动12个月的已赚车年（车年）': 'caryear_yz',
                '滚动12个月的满期保费（元）': 'mqnetprm',
                '滚动12个月的满期出险频度': 'expclmfreq',
                '滚动12个月的案均赔款': 'avgpay',
                '滚动12个月的单均保费': 'avgprm',
                '滚动12个月的折扣系数': 'disfactor',
                '滚动12个月的满期赔付率': 'twemonexppayrate'
              }
              for (let k in obj) {
                if (obj[k] === 'mainDim') obj[k] = mainDim;    // 先把对象外面的值进行赋值
                else obj[k] = mainDimeVal[j][obj[k]];
                title4.push(k)
              }
              dataTable4.push(obj)
            }
          }
          break;
        case 'exppayrate':
          for (let i in payRate) {
            const { mainDimeVal, mainDim } = payRate[i];
            for (let j in mainDimeVal) {
              const obj = {
                '细分类别': 'mainDim',
                '分析维度组合': 'xdata',
                '已赚车年（车年）': 'caryear_yz',
                '满期保费（元）': 'mqnetprm',
                '满期出险频度': 'expclmfreq',
                '案均赔款': 'avgpay',
                '单均保费': 'avgprm',
                '折扣系数': 'disfactor',
                '满期赔付率': 'exppayrate'
              }
              for (let k in obj) {
                if (obj[k] === 'mainDim') obj[k] = mainDim;    // 先把对象外面的值进行赋值
                else obj[k] = mainDimeVal[j][obj[k]];
                title5.push(k)
              }
              dataTable5.push(obj)
            }
          }
          break;
      }
    }
    // 因为在添加title的时候在多循环中，所以需要去重
    title1 = title1.filter((item, index) => title1.indexOf(item) === index);
    title2 = title2.filter((item, index) => title2.indexOf(item) === index);
    title3 = title3.filter((item, index) => title3.indexOf(item) === index);
    title4 = title4.filter((item, index) => title4.indexOf(item) === index);
    title5 = title5.filter((item, index) => title5.indexOf(item) === index);
    option.fileName = '赔付预测数据报表';
    if (dataTable1.length > 0) {
      option.datas = [{
        sheetData: dataTable1,
        sheetName: '总数据',
        sheetFilter: title1,
        sheetHeader: title1,
      }];
    } else {
      option.datas = [];
    }
    for (let i of measureCode) {
      switch (i) {
        case 'riskcostpayrate':
          if (dataTable2.length > 0) {
            option.datas.push({
              sheetData: dataTable2,
              sheetName: '风险成本赔付率',
              sheetFilter: title2,
              sheetHeader: title2,
            });
          }
          break;
        case 'hasibnexppayrate':
          if (dataTable3.length > 0) {
            option.datas.push({
              sheetData: dataTable3,
              sheetName: '含IBNR满期赔付率',
              sheetFilter: title3,
              sheetHeader: title3,
            });
          }
          break;
        case 'twemonexppayrate':
          if (dataTable4.length > 0) {
            option.datas.push({
              sheetData: dataTable4,
              sheetName: '滚动12个月满期赔付率',
              sheetFilter: title4,
              sheetHeader: title4,
            });
          }
          break;
        case 'exppayrate':
          if (dataTable5.length > 0) {
            option.datas.push({
              sheetData: dataTable5,
              sheetName: '实际满期赔付率',
              sheetFilter: title5,
              sheetHeader: title5,
            });
          }
          break;
      }
    }
    let toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();

    message.success('生成图表后的指标勾选会影响导出时的结果！')
  }

  render() {
    const { disabled, getMeasure, getMeasures, publicMode } = this.state;
    // const { global: { publicMode } } = this.props;
    // const { id } = this.props.location;
    const id = true;
    console.log(id)
    return (
      <PageHeaderLayout>
        <Card bordered={false} style={{ overflowY: 'scroll' }} id='top'>
          <Spin spinning={this.props.loading} id='123456'>
            <Form id='form' style={{ height: '100%', overflowY: 'auto' }}>
              <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6']} style={{ width: 'calc(100% - 24px)' }}>
                <Panel header="统计周期和时间" key="1">
                  <CycleTime wrappedComponentRef={(form) => this.Cycle = form} root={this}></CycleTime>
                </Panel>
                <Panel header="时间节点" key="2">
                  <TimeNode wrappedComponentRef={(form) => this.TimeNode = form} root={this}></TimeNode>
                </Panel>
                <Panel header="筛选数据维度" key="3">
                  <FilterData wrappedComponentRef={(form) => this.Filter = form} id={id} root={this}></FilterData>
                </Panel>
                <Panel header="指标" key="4">
                  <Measure wrappedComponentRef={(form) => this.Measure = form} root={this}></Measure>
                </Panel>
                <Panel header="分析维度" key="5">
                  <Dimensions wrappedComponentRef={(form) => this.Dimensions = form} root={this}></Dimensions>
                </Panel>
                <Panel header="主维度元素" key="6">
                  <Mainlysis wrappedComponentRef={(form) => this.Mainlysis = form} root={this}></Mainlysis>
                </Panel>
              </Collapse>
            </Form>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <Button type="primary" style={{ marginRight: 20 }} onClick={this.getTableData}>生成图表</Button>
              <div>
                <Button type="primary" style={{ marginRight: 20 }} onClick={this.saveMode}>保存为{publicMode ? '个人模板' : '公共模板'}</Button>
                <Button type="primary" disabled={disabled} style={{ marginRight: 20 }} onClick={this.export}>导出数据</Button>
                <Button type="primary" style={{ marginRight: 20 }} onClick={this.saveData}>保存查询</Button>
              </div>
            </div>
            <Modal
              visible={this.state.saveModelVisible}
              onOk={() => this.onCancelDimModel('ok')}
              onCancel={() => this.onCancelDimModel('cancel')}
              title='设置保存结果'
              maskClosable={false}
              width={1000}>
              <Input placeholder='请填写保存名称' ref={input => this.input = input} />
            </Modal>

            <div ref={e => this.graph = e} style={{ height: 0, overflow: 'hidden', marginTop: 30 }}>
              <Echarts wrappedComponentRef={(form) => this.Echarts = form} getMeasure={getMeasure} getMeasures={getMeasures} root={this}></Echarts>
              <TableData wrappedComponentRef={(form) => this.Table = form} root={this}></TableData>
            </div>
          </Spin>

        </Card>
      </PageHeaderLayout>
    )
  }
}