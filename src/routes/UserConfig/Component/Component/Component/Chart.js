import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, Tabs, Collapse, Select, Input, Radio, Button, message, Modal, InputNumber } from 'snk-web';
import FilterData from '../../../../PayPredict/components/FilterData';
import Line from './Line';
// import Process from './Process';
import { SketchPicker } from 'react-color'
import { valueAxis } from 'echarts/lib/theme/dark';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const Option = Select.Option;
const FormItem = Form.Item;


const linePane = [
  { title: '基准线1', content: 'Content of Tab 1', key: 'line+1', closable: false },
]

@connect(({ analysis, loading, umssouserinfo }) => ({
  analysis,
  loading: loading,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()
export default class Chart extends Component {
  state = {
    measure: ['指标1'],
    appId: 'supervise',                   // 应用id，默认使用综改监控_财务类
    themeId: 'finance',                   // 主题id，默认使用综改监控_财务类
    themeName: '综改监控_财务类',          // 指标主题的中文名，默认综改监控_财务类
    getFilter: 'getUserFilter',
    getFilterAfter: 'getUserFilterDim',   // 给筛选数据维度组件使用
    filterState: [],                      // 筛选数据维度的所有状态
    filterDiffState: [],                  // 差异比较的所有状态
    styleArr: [],                         // 主要指标展示样式
    Y_zhou: [{ name: 'y1', code: '1' }, { name: 'y2', code: '2' }],    // y1和y2轴
    timeType: [],                         // 时间类型
    statisticsType: [],                   // 统计类型
    addDisabled: false,                   // 添加其他指标按钮是否禁用
    modal: false,                         // 差异比较弹窗
    diffArr: [],                          // 差异的共同父节点
    frontDiffConfig: {},                  // 差异比较的过滤的state
    filterDiffForm: {},                   // 差异比较的过滤表单数据
    measureList: [],                      // 指标域的数组
    coordinatesY: [
      { name: '件数', code: '件数' },
      { name: '百分比', code: '百分比' },
      { name: '万元', code: '万元' },
      { name: '元', code: '元' },
      { name: '原始值', code: '原始值' },
      { name: '日', code: '日' },
    ],       // y轴的坐标单位
    measureValue: [
      { name: '取指标值', code: '1' },
      { name: '取其同比值', code: '2' },
      { name: '取其环比值', code: '3' }
    ],                                    // 指标后面的取值
    beforeData: [
      { name: '否，当年数据', code: '1' },
      { name: '是，去年同期数据', code: '2' },
      { name: '是，前年同期数据', code: '3' }
    ],                                    // 是否过往同期数据
    processMeasure: false,                // 加工指标弹窗是否显示
    processNow: '',                       // 当前加工的是哪个指标
    processObj: {},                       // 存储加工指标的数组
    chartType: '1',                      // 图表类型
    ProcessState: {},                     // 加工指标的状态
    elem: null,                           // 修改图表类型后所展示的元素
    mapSpace: [{ name: '区间1' }],        // 地图区间
    mapDisabled: false,                   // 地图中添加按钮是否禁用
    pieSpace: [{ name: '区间1' }],        // 饼图区间
    mapDisabled: false,                   // 饼图中添加按钮是否禁用
    pieUseColor: '1',                    // 饼图是否自定义
    linePanes: linePane,                  // 基准线
    lineActiveKey: linePane[0].key,
    getThemeSelectData: [],               // 主题值，保存在当前不会影响其他图表
    getUserMeasuresData: [],              // 指标值，保存在当前不会影响其他图表
    getUserFilterDataX: [],               // X维度值，保存在当前不会影响其他图表
    getUserFilterDataZ: [],               // 占比维度值，保存在当前不会影响其他图表
    getDimLevelDataX: [],                 // 普通维度二级值，保存在当前不会影响其他图表
    getDimLevelDataZ: [],                 // 占比维度二级值，保存在当前不会影响其他图表
    getDimValueDataZ: [],                 // 占比维度三级值，保存在当前不会影响其他图表
    initTheme: 'supervise_finance',       // 其他指标的初始默认值
    once: false,
    valueList: [],                        // 指标值的所有数据集合
    accounted: false,                     // 是否显示占比
    firstAccounted: '',                   // 第一个位置的占比
    accountedObj: [],                     // 占比指标的所有含有的对象
    disableFilterAfter: false,            // 是否禁用x轴坐标维度的二级维度
    Xshow: false,
    Zshow: false,
    baodan_arr: [],                       // 指标数组对应的判定，用于判定保单年度和过往同期数据
    baodan_Data: [
      { name: '当年保单', code: '1' },
      { name: '上年保单', code: '2' },
      { name: '近三年', code: '3' }
    ],
    appThemeList: undefined,              // 请求筛选维度的额外参数，默认没有
    closeDimValue: false,                 // 占比三级维度是否可见
    measureModel: false,                  // 切换指标位置弹窗是否显示
    otherFilterDiff: [],                  // 添加差异比较个数
  };

  componentDidMount() {
    // 如果不是回显的数据，就自己调用，否则就由父组件在回显之后进行调用
    if (!this.props.root.props.id) this.getAllData(true);
    setTimeout(() => {
      const newBaodan = [
        { name: '当年保单', code: '1' },
        { name: '上年保单', code: '2' },
        { name: '近三年', code: '3' }
      ];
      this.setState({ baodan_Data: newBaodan })
    });
  }

  // 初始化和回显的数据获取
  getAllData = (ok) => {
    // 这里使用异步的原因是回显数据的时候，因为使用了async异步，所以此时需要异步后才能获取改变后的状态值
    const { appId, themeId, chartType, getUserMeasuresData } = this.state;
    if (ok) {
      this.props.dispatch({
        type: 'analysis/getThemeSelect'
      }).then(() => {
        const { getThemeSelectData } = this.props.analysis;
        this.setState({ getThemeSelectData })
        this.props.dispatch({
          type: 'analysis/getUserMeasures',
          payload: {
            appId,
            themeId
          }
        }).then(() => {
          const measures = this.props.analysis.getUserMeasuresData;
          getUserMeasuresData.push(measures)
          this.setState({ getUserMeasuresData });
        })
      })
    }

    this.coordinates(appId, themeId, 'X')

    const styleArr = [
      { name: '柱状图', code: '柱状图' },
      { name: '折线图', code: '折线图' },
      { name: '面积图', code: '面积图' },
      { name: '堆积柱状图', code: '堆积柱状图' }
    ];
    const timeType = [
      { name: '日', code: 'day' },
      { name: '周', code: 'week' },
      { name: '月', code: 'month' },
    ];
    this.setState({ filterState: this.Filter.state })
    this.setState({ styleArr, timeType })

    // 把基准线全部走一遍，渲染出所有的基准线，之后再回到本应该打开的位置
    const { linePanes, lineActiveKey } = this.state;
    for (let i in linePanes) {
      this.setState({ lineActiveKey: linePanes[i].key });
    }
    this.setState({ lineActiveKey })
  }

  // 选择x轴的坐标维度
  coordinates = (appId, themeId, type, payload) => {
    let obj;
    if (payload) obj = payload;
    else obj = {}
    this.props.dispatch({
      type: 'analysis/getUserFilter',
      payload: {
        appId,
        themeId,
        timeFilter: '0',
        ...obj
      }
    }).then(() => {
      const { getUserFilterData } = this.props.analysis;
      this.setState({ ['getUserFilterData' + type]: getUserFilterData })
    })
  }

  // 添加其他指标
  addMeasure = () => {
    const { measure } = this.state;
    if (measure.length >= 9) {
      message.warn('最多9个指标！');
      return;
    }

    const newArr = [...measure].map(item => Number(item.split('指标')[1])).sort((a, b) => a - b);
    const lastNum = newArr[newArr.length - 1];

    measure.push(`指标${lastNum + 1}`);
    this.setState({ measure });

    // 这里清空的原因是给useFnc逻辑使用
    // this.Filter.setState({ filterSave: [], filterData: [], userOnce: true });     // 需要单独清空这两项，这两项会影响差异比较
    // this.Filter.props.form.resetFields();

    // // 如果有差异比较
    // if (this.FilterDiff) this.setState({ modal: false })
  }

  // 选择准备填入的指标
  changeTheme = (e, filed, index, item) => {
    // 添加标识，当前子图表的任意主题切换都会影响所有的指标

    const val = filed + '指标';

    // 选择x轴的坐标维度
    const coordinatesX = filed + 'coordinatesX';

    const appId = e.split('_')[0];
    const themeId = e.split('_')[1];
    const { getThemeSelectData } = this.props.analysis;
    const value = this.props.form.getFieldsValue();
    this.props.dispatch({
      type: 'analysis/getUserMeasures',
      payload: {
        appId,
        themeId,
        visibleColumn: 'door'
      }
    }).then(() => {
      const measures = this.props.analysis.getUserMeasuresData;
      const { getUserMeasuresData } = this.state;
      getUserMeasuresData[index] = measures;
      this.setState({ getUserMeasuresData })
    })

    if (index === 0) {
      this.coordinates(appId, themeId, 'X');
      this.setState({ appId, themeId });
      // 遍历数据，找到id和当前选择相同的保存，同时清除指标的表单数据
      for (let i of getThemeSelectData) {
        if (i.ATId === e) this.setState({ themeName: i.ATName })
      }

      // // 遍历数据，找到id和当前选择相同的保存，同时清除指标的表单数据
      // for (let i of getThemeSelectData) {
      //   if (i.ATId === e) this.setState({ themeName: i.ATName })
      // }
    } else {
      this.props.form.setFieldsValue({
        [filed + item + 'right']: undefined,
        [filed + item + 'value']: undefined,
      })
    }

    this.props.form.setFieldsValue({
      [filed + item + 'right']: undefined,
      [filed + item + 'value']: undefined,
      [filed + item + 'pieDimension_left']: undefined,
      [filed + item + 'pieDimension_right']: undefined,
      // [filed + 'coordinatesX_Right']: undefined,
      // [filed + 'coordinatesX_left']: undefined,
    })

    // 第一个对象用于存储除当前改变自身以外的其他主题
    const nowObj = this.setThemeObj(value, true, filed + item + 'left');
    setTimeout(() => {
      const newVal = this.props.form.getFieldsValue();
      const themeObj = this.setThemeObj(newVal);     // 第二个对象存储所有主题

      // 如果两个主题对象不一致则说明修改前后主题发生变化，执行下面操作
      if (JSON.stringify(nowObj) !== JSON.stringify(themeObj)) {
        this.Filter.setState({ filterSave: [], filterData: [], userOnce: true });     // 需要单独清空这两项，这两项会影响差异比较
        this.Filter.props.form.resetFields();
        this.props.form.setFieldsValue({
          [filed + 'coordinatesX_Right']: undefined,
          [filed + 'coordinatesX_left']: undefined,
        })

        // 如果有差异比较
        if (this.FilterDiff) this.setState({ modal: false, otherFilterDiff: [] })
      }
    });
    // 清空所有指标
    // for (let i in value) {
    //   if (i.indexOf(val) >= 0) {
    //     if (i.indexOf('right') >= 0) this.props.form.setFieldsValue({ [i]: undefined })
    //     if (i.indexOf('left') >= 0) {
    //       this.props.form.setFieldsValue({ [i]: e })
    //       this.setState({ initTheme: e });
    //     }
    //   }
    //   if (i.indexOf(coordinatesX) >= 0) {
    //     this.props.form.setFieldsValue({ [i]: [] })
    //   }
    // }
    // this.props.form.setFieldsValue({ measure: [] })
    // this.setState({ appId, themeId });
    // 重置筛选数据维度的状态和表单数据


    // 改变主题的时候把基准线、列表和结论的指标域清空
    const { pane: { key } } = this.props;
    this.props.root.removeLine('both', key);
    this.removeLine();

    // 清除当前主题对应指标的
    let { accountedObj, accounted, chartType } = this.state;
    const beforeArr = accountedObj.filter(item => item !== undefined);
    // const nowData = accountedObj[index];
    accountedObj.splice(index, 1, undefined);
    const nowArr = accountedObj.filter(item => item !== undefined);
    if (nowArr.length === 0) accounted = false;
    else {
      if (beforeArr[0] !== nowArr[0]) {     // 不相等说明第一个被替换了
        const newFirst = nowArr[0];
        const themeId = newFirst.split('+')[0].split('_');
        this.coordinates(themeId[0], themeId[1], 'Z');
        const values = this.props.form.getFieldsValue();
        for (let j in values) {
          if (chartType === '1') {
            if (j.indexOf('coordinatesZ_left') >= 0 || j.indexOf('coordinatesZ_Right') >= 0) {
              this.props.form.setFieldsValue({ [j]: undefined });
            }
          } else if (chartType === '3') {
            if (j.indexOf('pieDimensionZ_left') >= 0 || j.indexOf('pieDimensionZ_right') >= 0) {
              this.props.form.setFieldsValue({ [j]: undefined });
            }
          }
        }
        this.setState({ getUserFilterDataZ: [], getDimLevelDataZ: [], getDimValueDataZ: [] })
      }
    }
    this.setState({ accountedObj, accounted })
    // for(let i in accountedObj){
    //   const accValue = accountedObj[i];
    //   if(accValue){
    //     if(index < j) isFirst = true;
    //     else if(nowArr.length === 1) isFirst = true;
    //     continue;
    //   }
    // }
    // const nowArr = accountedObj.filter(item => item);



    // const measureValue = this.props.form.getFieldValue(filed + item + 'right');
    // const themeValue = this.props.form.getFieldValue(filed + item + 'left');
    // const first = Object.keys(accountedObj)[0];
    // // 如果相等，说明当前切换的主题下面的指标是第一个含有占比的
    // if(first === themeValue + '+' + measureValue) {
    //   delete accountedObj[themeValue + '+' + measureValue];
    //   if (JSON.stringify(accountedObj) !== '{}'){   // 如果删除了第一个后不为空的话，接着获取第一个进行数据查询
    //     const nowFirst = Object.keys(accountedObj)[0];
    //     const themeId = nowFirst.split('+')[0].split('_');
    //     this.coordinates(themeId[0], themeId[1], 'Z');
    //     // if
    //   }
    // }
  }

  // 主题发生变化时需要调用的函数
  setThemeObj = (val, noGet, field) => {
    const obj = {};
    for (let i in val) {
      if (i.indexOf('指标') >= 0 && i.indexOf('left') >= 0) {
        if (noGet && i === field) continue;
        if (val[i] && !obj[val[i]]) obj[val[i]] = true;
      }
    }
    return obj;
  }

  // 修改选择展示样式
  changeStyle = e => {
    const { measure } = this.state;
    if (e === 3 || e === 4) {
      // 删除所有其他指标，并不允许添加
      measure.splice(1)

      this.setState({ addDisabled: true, measure })
    } else {
      this.setState({ addDisabled: false })
    }

    // 改变主题的时候把基准线、列表和结论的指标域清空
    const { pane: { key } } = this.props;
    this.props.root.removeLine('both', key);
    this.removeLine();
  }

  // 删除
  delete = (e, filed) => {
    let { measure, getUserMeasuresData, accountedObj, accounted, chartType } = this.state;
    const nowVal = this.props.form.getFieldsValue();
    const nowObj = this.setThemeObj(nowVal);    // 第一个对象用于存储除当前改变自身以外的其他主题
    setTimeout(() => {
      const newVal = this.props.form.getFieldsValue();
      const newObj = this.setThemeObj(newVal);    // 第二个对象存储所有主题

      // 如果两个主题对象不一致则说明修改前后主题发生变化，执行下面操作
      if (JSON.stringify(nowObj) !== JSON.stringify(newObj)) {
        // 这里清空的原因是给useFnc逻辑使用
        this.Filter.setState({ filterSave: [], filterData: [], userOnce: true });     // 需要单独清空这两项，这两项会影响差异比较
        this.Filter.props.form.resetFields();
        this.props.form.setFieldsValue({
          [filed + 'coordinatesX_Right']: undefined,
          [filed + 'coordinatesX_left']: undefined,
        })

        // 如果有差异比较
        if (this.FilterDiff) this.setState({ modal: false, otherFilterDiff: [] })
      }
    });
    measure.splice(e, 1);
    getUserMeasuresData.splice(e, 1);

    // 删除的时候如果是删掉了唯一一个占比就全部清掉
    const beforeArr = accountedObj.filter(item => !!item);
    accountedObj.splice(e, 1);
    const nowArr = accountedObj.filter(item => !!item);
    if (nowArr.length === 0) accounted = false;
    else {
      if (beforeArr[0] !== nowArr[0]) {     // 不相等说明第一个被替换了
        const newFirst = nowArr[0];
        const themeId = newFirst.split('+')[0].split('_');
        this.coordinates(themeId[0], themeId[1], 'Z');
        const values = this.props.form.getFieldsValue();
        for (let j in values) {
          if (chartType === '1') {
            if (j.indexOf('coordinatesZ_left') >= 0 || j.indexOf('coordinatesZ_Right') >= 0) {
              this.props.form.setFieldsValue({ [j]: undefined });
            }
          } else if (chartType === '3') {
            if (j.indexOf('pieDimensionZ_left') >= 0 || j.indexOf('pieDimensionZ_right') >= 0) {
              this.props.form.setFieldsValue({ [j]: undefined });
            }
          }
        }
        this.setState({ getUserFilterDataZ: [], getDimLevelDataZ: [], getDimValueDataZ: [] })
      }
    }
    this.setState({ measure, getUserMeasuresData, accounted, accountedObj });
  }

  // 点击差异比较
  diff = () => {
    const { filterSave } = this.Filter.state;
    const diffArr = [];

    for (let i of filterSave) {
      if (i.children.length > 0) diffArr.push(...i.parent)
    }
    if (diffArr.length === 0) {
      message.warn('请先选择指标的数据维度');
      return;
    }
    this.setState({ modal: true, diffArr, otherFilterDiff: [] }, () => {
      this.setState({ filterDiffState: this.FilterDiff.state })
    })
  }

  // 删除比较
  deleteDiff = () => {
    this.setState({ modal: false, otherFilterDiff: [] });
    message.success('已删除比较！')
  }

  // 修改-选择x轴的坐标维度
  changeFilter = (e, field, type, field1) => {
    if (e === 'pub_its_statdate') {     // 如果选择的是统计时间，就不能选择后面的数据
      this.setState({ [type + 'show']: true });
      this.props.form.setFieldsValue({ [field]: ' ' });
    } else {
      this.setState({ [type + 'show']: false });
      this.props.form.setFieldsValue({ [field]: undefined });
    }
    field1 && this.props.form.setFieldsValue({ [field1]: undefined });
    this.setState({ getDimValueDataZ: [] })
    this.props.dispatch({
      type: 'analysis/getDimLevel',
      payload: {
        dimTable: e
      }
    }).then(() => {
      const { getDimLevelData, getCompany: { companyCode } } = this.props.analysis;
      // 如果一级维度是机构，那么判定用户是什么机构，不同机构的权限不同
      if (e.indexOf('company') >= 0) {
        switch (companyCode.length) {
          case 6: getDimLevelData.splice(0, 1); break;
          case 8: getDimLevelData.splice(0, 2); break;
          case 10: getDimLevelData.splice(0, 3); break;
          default: break;
        }
      }
      this.setState({ ['getDimLevelData' + type]: getDimLevelData })
    })
  }

  // 子组件过滤器发生变化的时候调用
  getChange = e => {
    if (e[0] !== this.state.diffArr[0]) this.setState({ modal: false, otherFilterDiff: [] });

    // 改变主题的时候把基准线、列表和结论的指标域清空
    const { pane: { key } } = this.props;
    this.props.root.removeLine('both', key);
    this.removeLine();
  }

  // 修改指标    该函数还被选择样式、是否过往同期数据调用
  changeMeasure = (e, field, themeField, index, nowField) => {
    console.log(field);
    if (field) this.props.form.setFieldsValue({ [field]: undefined });
    // 是否是修改指标触发的
    if (themeField) {
      const { getUserMeasuresData, measure, getThemeSelectData, accountedObj, firstAccounted, chartType, baodan_arr } = this.state;
      const theme = this.props.form.getFieldValue(themeField);
      const nowValue = this.props.form.getFieldValue(nowField)
      for (let i of getUserMeasuresData[index]) {
        if (i.attrCode === e) {
          // 如果当前指标是占比，就给对象中配置一个值，同时发请求获取维度，否则的话先删除当前的属性再去判定是否删空了
          if (i.propFlag === '1') {
            accountedObj[index] = theme + '+' + e;
            let themeId, isFirst = false;
            for (let j in accountedObj) {
              const accValue = accountedObj[j];
              if (accValue) {
                const nowArr = accountedObj.filter(item => item);
                themeId = accValue.split('+')[0].split('_');
                if (index < j) isFirst = true;
                else if (nowArr.length === 1) isFirst = true;
                continue;
              }
            }


            // 如果当前的指标顺序在之前的顺序前面，说明是插队到第一个的，此时清空数据使用插队的数据
            if (isFirst) {
              this.coordinates(themeId[0], themeId[1], 'Z');
              const values = this.props.form.getFieldsValue();
              for (let j in values) {
                if (chartType === '1') {
                  if (j.indexOf('coordinatesZ_left') >= 0 || j.indexOf('coordinatesZ_Right') >= 0) {
                    this.props.form.setFieldsValue({ [j]: undefined });
                  }
                } else if (chartType === '3') {
                  if (j.indexOf('pieDimensionZ_left') >= 0 || j.indexOf('pieDimensionZ_right') >= 0) {
                    this.props.form.setFieldsValue({ [j]: undefined });
                  }
                }
              }
              this.setState({ getUserFilterDataZ: [], getDimLevelDataZ: [], getDimValueDataZ: [] })
            }
            // accountedObj[theme + '+' + e] = true;
            // const first = Object.keys(accountedObj)[0];
            // const themeId = first.split('+')[0].split('_');
            // let nowFirst;
            // 如果是第一次或者是第一位置发生变化了，就重新赋值，并且发请求
            // if (firstAccounted === '' || firstAccounted !== first) {
            //   nowFirst = first;
            // this.setState({ firstAccounted: nowFirst })
            // }
            this.setState({ accounted: true, accountedObj })
          } else {
            accountedObj.splice(index, 1, undefined);
            let values = null;
            for (let k of accountedObj) {
              if (k) values = k;
            }
            if (!values) this.setState({ accounted: false });
            this.setState({ accountedObj })
          }

          // 判定是否需要展示保单年度或者隐藏过往同期数据
          if (i.spltimeFlag === '1') baodan_arr[index] = true;
          else baodan_arr[index] = false;
          this.setState({ baodan_arr })
        }
      }
    }
    // 改变主题的时候把基准线、列表和结论的指标域清空
    const { pane: { key } } = this.props;
    this.props.root.removeLine('both', key);
    this.removeLine();
  }

  // 清空基准线数据
  removeLine = () => {
    const { chartType } = this.state;
    for (let i in this) {
      if (i.indexOf('line+') >= 0 && chartType === '1') this[i].props.form.resetFields();
    }
  }

  // 修改图表图形
  changeType = e => {
    const { measure } = this.state;
    const { value } = e.target
    const showLine = value === '1' ? true : false;

    this.props.dispatch({
      type: 'analysis/showLine',
      payload: { showLine }
    })

    const name = 'charts+1指标1right'
    this.props.form.setFieldsValue({ [name]: undefined })
    this.setState({
      chartType: value, measure: measure.slice(0, 1), accounted: false, accountedObj: [],
      baodan_arr: [], closeDimValue: false
    });
  }

  // // 点击加工指标
  // process = e => {
  //   // 如果之前没有对这个地方进行过指标加工，就默认配一个值
  //   const { processObj } = this.state;
  //   if (!processObj[e]) {
  //     processObj[e] = [e]
  //   }
  //   this.setState({ processMeasure: true, processNow: e, processObj });
  // }

  // // 配置指标完成
  // setMeasure = () => {
  //   const { measureData } = this.Process.state;
  //   const { processNow, processObj } = this.state;
  //   const stateObj = { ...this.Process.state };
  //   const fieldObj = { ...this.Process.props.form.getFieldsValue() };
  //   for (let i of measureData) {
  //     if (i.val.value === '请选择') {
  //       message.warn('请配置完整指标，如不需要请删除！');
  //       return;
  //     }
  //   }
  //   processObj[processNow] = { state: stateObj, field: fieldObj, measureData }

  //   this.setState({ processObj, processMeasure: false })
  //   console.log(processObj)
  // }

  // 地图点击添加
  addSpace = (arr, code) => {
    arr.push({ name: '区间' + (Number(arr[arr.length - 1].name.split('区间')[1]) + 1) });
    if (arr.length >= 6) this.setState({ [arr]: arr, [code + 'Disabled']: true });
    else this.setState({ [arr]: arr, [code + 'Disabled']: false })
  }

  // 点击选择颜色
  changeColor = (index, code) => {
    const space = this.state[code + 'Space'];
    space[index].showColor = true;
    this.setState({ [code + 'Space']: space });
  }

  // 点击完成按钮
  colorFinish = (arr, index, code) => {
    const { hex } = this['color' + code].state;
    arr[index].color = hex;
    arr[index].showColor = false;
    this.setState({ [arr]: arr });
  }

  // 删除
  deleteColor = (arr, index, code) => {
    arr.splice(index, 1);
    if (arr.length < 6) this.setState({ [code + 'Disabled']: false })
    this.setState({ [arr]: arr })
  }

  // 基准线变化
  onChange = (key,) => {
    this.setState({ lineActiveKey: key });
  };

  // 基准线事件监听
  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  // 基准线添加
  add = () => {
    const { linePanes } = this.state;
    if (linePanes.length >= 3) {
      message.warn('最多添加3条基准线！');
      return;
    }
    const newPanes = [...linePanes];
    const number = Number(linePanes[linePanes.length - 1].title.split('基准线')[1]) + 1;
    const activeKey = 'line' + '+' + number;
    newPanes.push({ title: '基准线' + number, content: 'Content of new Tab', key: activeKey });
    this.setState({
      linePanes: newPanes,
      lineActiveKey: activeKey,
    });
  };

  // 基准线删除
  remove = targetKey => {
    const { linePanes, lineActiveKey } = this.state;
    let newActiveKey = lineActiveKey;
    let lastIndex;
    linePanes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = linePanes.filter(pane => pane.key !== targetKey);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    this.setState({
      linePanes: newPanes,
      lineActiveKey: newActiveKey,
    });
  };

  // 校验数字输入框的右边是否大于左边
  checkValue = (e, a, other) => {
    const otherVal = this.props.form.getFieldValue(other);
    if ((a || a === 0) && otherVal) {
      if (otherVal === '') return true;

      if (e.field.indexOf('left') >= 0) {
        if (otherVal > a) return true;
        else return false;
      } else {
        if (otherVal < a) return true;
        else return false;
      }
    } else return true;
  }

  // 改变选择更新频度
  changeCycle = () => {
    const values = this.props.form.getFieldsValue();
    for (let i in values) {
      if (i.indexOf('value') >= 0) this.props.form.setFieldsValue({ [i]: undefined })
    }
  }


  // 点击指标值下拉框，获取指标对应的值
  getValue = (pane, item, index) => {
    const values = this.props.form.getFieldsValue();
    const { getUserMeasuresData } = this.state;
    const cycle = values[pane + 'timeType'];
    const measure = values[pane + item + 'right'];

    if (!cycle || !measure) {
      this.setState({ valueList: [] })
      return
    };
    const valueData = [{ name: '取指标值', code: 'value' }];
    for (let i of getUserMeasuresData[index]) {
      if (i.attrCode === measure) {
        switch (cycle) {
          case 'day': {
            if (i.dayLink === '1') valueData.push({ name: '取其环比值', code: 'link' });
            if (i.dayYoy === '1') valueData.push({ name: '取其同比值', code: 'yoy' });
          }; break;
          case 'week': {
            if (i.weekLink === '1') valueData.push({ name: '取其环比值', code: 'link' });
            if (i.weekYoy === '1') valueData.push({ name: '取其同比值', code: 'yoy' });
          }; break;
          case 'month': {
            if (i.monthLink === '1') valueData.push({ name: '取其环比值', code: 'link' });
            if (i.monthYoy === '1') valueData.push({ name: '取其同比值', code: 'yoy' });
          }; break;
        }
      }
    }
    const { valueList } = this.state;
    valueList[index] = valueData;
    this.setState({ valueList })
  }

  // 饼图切换是否自定义
  setColorSpace = (name, code, arr, disabled) => {
    const { getFieldDecorator } = this.props.form;
    const elem =
      <div>
        <span>设置{name}颜色区间</span>
        <Button onClick={() => this.addSpace(arr, code)} disabled={disabled} style={{ margin: '0 10px' }} type='primary'>添加</Button>
        <span>，未输入即是无穷大或无穷小</span>
        {arr.map((item, index) => {
          return (
            <div key={item.name} style={{ display: 'flex' }}>
              <FormItem label={item.name} style={{ display: 'flex' }}>
                {getFieldDecorator(code + item.name + 'left', {
                  rules: [{ required: false, message: '必填' },
                  { validator: (e, v) => this.checkValue(e, v, code + item.name + 'right'), message: '右边必须大于左边' }],
                })(
                  <InputNumber style={{ width: 100 }} />
                )}
              </FormItem>
              <span style={{ lineHeight: '36px', margin: '0 10px' }}>至</span>
              <FormItem style={{ display: 'flex', marginBottom: 15 }}>
                {getFieldDecorator(code + item.name + 'right', {
                  rules: [{ required: false, message: '必填' },
                  { validator: (e, v) => this.checkValue(e, v, code + item.name + 'left'), message: '右边必须大于左边' }]
                })(
                  <InputNumber style={{ width: 100 }} />
                )}
              </FormItem>
              <p style={{ cursor: 'pointer', margin: '6px 0 0 10px' }} onClick={() => this.changeColor(index, code)}>
                {item.color ? item.color : '选择颜色'}
              </p>
              {item.showColor ?
                <div style={{ display: 'flex' }}>
                  <SketchPicker ref={e => this['color' + code] = e} />
                  <Button type='primary' onClick={() => this.colorFinish(arr, index, code)}>完成</Button>
                </div>
                : null}
              {index !== 0 ? <Button type='primary' size='small'
                onClick={() => this.deleteColor(arr, index, code)} style={{ marginLeft: 15 }}>删除</Button> : null}
            </div>
          )
        })}
      </div>
    return elem;
  }

  // 图表类型通用的指标
  getSameMeasure = (item, index, pane) => {
    const { form: { getFieldDecorator } } = this.props;
    const { measureValue, getThemeSelectData, getUserMeasuresData, initTheme, valueList } = this.state;

    const elem =
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <FormItem label={`${index === 0 ? '（2）' : ''}选择准备填入的${item}`}
          style={index === 0 ? { display: 'flex' } : { display: 'flex', marginLeft: 32 }}>
          {getFieldDecorator(pane.key + item + 'left', {
            // initialValue: 'supervise_finance',
            rules: [{ required: true, message: '必填' }]
          })(
            <Select style={{ width: 150 }}
              onChange={e => this.changeTheme(e, pane.key, index, item)}>
              {getThemeSelectData.map(i => {
                return (
                  <Option title={i.ATName} key={i.ATId} value={i.ATId}>{i.ATName}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator(pane.key + item + 'right', {
            rules: [{ required: true, message: '必选' }]
          })(
            <Select style={{ width: 180 }}
              showSearch
              optionLabelProp="children"
              filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
              onChange={(e) => this.changeMeasure(e, pane.key + item + 'value', pane.key + item + 'left', index, pane.key + item + 'right')}>
              {getUserMeasuresData[index] ? getUserMeasuresData[index].map(i => {
                return (
                  <Option title={i.attrName} key={i.attrCode} value={i.attrCode}>{i.attrName}</Option>
                )
              }) : null}
            </Select>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator(pane.key + item + 'value', {
            rules: [{ required: true, message: '必选' }]
          })(
            <Select style={{ width: 100 }} onFocus={() => this.getValue(pane.key, item, index)} onChange={this.changeMeasure}>
              {valueList[index] ? valueList[index].map(i => {
                return (
                  <Option key={i.code} value={i.code}>{i.name}</Option>
                )
              }) : null}
            </Select>
          )}
        </FormItem>
        {/* <FormItem label='选择统计类型' style={{ display: 'flex', marginLeft: 20 }}>
          {getFieldDecorator(pane.key + item + 'statisticsType', {
            rules: [{ required: true, message: '必选' }]
          })(
            <Select style={{ width: 100 }}>
              {statisticsType.map(item => {
                return (
                  <Option title={item.name} key={item.code} value={item.code}>{item.name}</Option>
                )
              })}
            </Select>
          )}
        </FormItem> */}
      </div>
    return elem;
  }

  // 点击筛选维度和坐标维度的时候调用的函数
  useFnc = () => {
    const values = this.props.form.getFieldsValue();
    const appThemeList = { appThemeList: [] };
    let measureArr = [];
    // 查找所有选了的主题
    for (let i in values) {
      if (values[i] && i.indexOf('指标') >= 0 && i.indexOf('left') >= 0 && i.indexOf('_') < 0) {
        measureArr.push(values[i])
      }
    }
    measureArr = measureArr.filter((item, index) => measureArr.indexOf(item) === index);   // 过滤
    // 如果主题数大于1，则需要在请求过滤维度的时候增加参数
    if (measureArr.length > 1) {
      for (let j of measureArr) {
        appThemeList.appThemeList.push({
          appId: j.split('_')[0],
          themeId: j.split('_')[1]
        })
      }
      this.setState({ appThemeList });
    } else this.setState({ appThemeList: undefined });
  }

  // 选择x轴的坐标维度
  getDim = () => {    // 把前面所有指标中的主题都取到，然后在请求中添加参数让后端取交集
    this.useFnc();
    const { appId, themeId, appThemeList } = this.state;
    this.coordinates(appId, themeId, 'X', appThemeList);
  }

  // 选择占比二级维度
  changeDimLevel = (e, type, field) => {
    const { getCompany: { companyCode } } = this.props.analysis;
    const { getDimLevelDataZ } = this.state;

    this.props.form.setFieldsValue({ [field]: undefined })
    for (let i in getDimLevelDataZ) {
      if (getDimLevelDataZ[i].columnCode === e && i === '0' && companyCode.length > 2 && type.props.datas1.indexOf('company') >= 0) {
        this.setState({ closeDimValue: true });
        return;
      } else {
        this.setState({ closeDimValue: false });
      }
    }
    this.props.dispatch({
      type: 'analysis/getDimValue',
      payload: {
        dimTable: type.props.datas1,
        dimColumn: type.props.value,
        dimName: type.props.datas2
      }
    }).then(() => {
      const { getDimValueData } = this.props.analysis;
      let dimValue = [];
      if (type.props.datas1.indexOf('company') >= 0) {
        for (let i of getDimValueData) {
          const code = i.dimValue.slice(0, companyCode.length);
          if (code === companyCode) dimValue.push(i)
        }
      } else dimValue = getDimValueData;
      this.setState({ getDimValueDataZ: dimValue })
    })
  }

  // 点击切换指标位置按钮
  changeIndex = async () => {
    const { measure } = this.state;
    await this.setState({ measureModel: true });
    this.props.form.setFieldsValue({ measureIndex: measure });

    // 把基准线、列表和结论的指标域清空
    const { pane: { key } } = this.props;
    this.props.root.removeLine('both', key);
    this.removeLine();
  }

  // 点击切换指标位置按钮后弹窗点击确定
  setMeasureIndex = () => {
    const values = this.props.form.getFieldsValue();
    const valueObj = {};
    for (let i in values) {
      if (i.indexOf('beforeData') >= 0 || i.indexOf('baodan') >= 0) {
        valueObj[i] = values[i];
      }
    }
    const { measure, baodan_arr } = this.state;
    const value = this.props.form.getFieldsValue().measureIndex;
    // 这里需要计算当前指标是过往同期数据还是保单年度，然后跟着指标位置变化而变化
    const newBaodan_arr = measure.map((item) => {
      for (let i in value) {
        if (item === value[i]) return baodan_arr[i];
      }
    })

    if (!value || value.length !== measure.length) {
      message.warn('请把所有指标都选上！');
      return;
    }
    this.setState({ measure: value, measureModel: false, baodan_arr: newBaodan_arr });
  }

  // 添加比较
  addDiff = () => {
    const { otherFilterDiff } = this.state;
    if (otherFilterDiff.length === 0) otherFilterDiff.push(0);
    else otherFilterDiff.push(otherFilterDiff[otherFilterDiff.length - 1] + 1);
    this.setState({ otherFilterDiff })
  }

  // 添加比较的删除
  deleteOtherDiff = index => {
    const { otherFilterDiff } = this.state;
    otherFilterDiff.splice(index, 1);
    this.setState({ otherFilterDiff })
  }

  render() {
    // const { id, type } = this.props.location;
    const { getFieldDecorator } = this.props.form;
    const { pane } = this.props;
    const { measure, styleArr, Y_zhou, timeType, processMeasure, processNow, processObj, mapSpace, pieSpace, pieUseColor, baodan_arr,
      addDisabled, modal, diffArr, coordinatesY, beforeData, chartType, mapDisabled, pieDisabled, getUserFilterDataX, getDimLevelDataX,
      linePanes, lineActiveKey, getUserFilterDataZ, accounted, getDimLevelDataZ, disableFilterAfter, getDimValueDataZ, closeDimValue,
      Xshow, Zshow, baodan_Data, appThemeList, measureModel, otherFilterDiff } = this.state;
    const { queryUserData } = this.props.analysis;
    const id = true;

    let elem, element, element3 = null;

    // 根据选择的图表图形不同，展示不同的界面
    switch (chartType) {
      case '1': elem =
        measure.map((item, index) => {
          return (
            <div key={item} style={{ display: 'flex', flexWrap: 'wrap' }}>
              {this.getSameMeasure(item, index, pane)}
              <FormItem label='选择样式' style={{ display: 'flex', marginLeft: 20 }}>
                {getFieldDecorator(pane.key + item + 'style', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 100 }} onChange={this.changeStyle}>
                    {styleArr.map(i => {
                      return (
                        <Option title={i.name} key={i.code} value={i.code}>{i.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator(pane.key + item + 'coordinates', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 80 }} onChange={this.changeMeasure}>
                    {Y_zhou.map(i => {
                      return (
                        <Option key={i.code} value={i.code}>{i.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              {baodan_arr[index] ?
                <FormItem label='保单年度' style={{ display: 'flex', marginLeft: 20 }}>
                  {getFieldDecorator(pane.key + item + 'baodan', {
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{ width: 120 }} onChange={this.changeMeasure}>
                      {baodan_Data.map(item => {
                        return (
                          <Option title={item.name} key={item.code} value={item.code}>{item.name}</Option>
                        )
                      })}
                    </Select>
                  )}
                </FormItem>
                :
                <FormItem label='是否过往同期数据' style={{ display: 'flex', marginLeft: 20 }}>
                  {getFieldDecorator(pane.key + item + 'beforeData', {
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{ width: 120 }} onChange={this.changeMeasure}>
                      {beforeData.map(item => {
                        return (
                          <Option title={item.name} key={item.code} value={item.code}>{item.name}</Option>
                        )
                      })}
                    </Select>
                  )}
                </FormItem>}
              {true ?
                <FormItem style={{ display: 'flex', marginLeft: 20 }}>
                  {getFieldDecorator(pane.key + item + 'show', {
                    initialValue: '1',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Radio.Group>
                      <Radio value='1'>显示</Radio>
                      <Radio value='2'>不显示</Radio>
                    </Radio.Group>
                  )}
                </FormItem> : null}
              {index !== 0 ?
                <Button type='primary' size='small' style={{ marginLeft: 15 }}
                  onClick={e => this.delete(index, pane.key)}>删除</Button> : null}
              {index === measure.length - 1 ?
                <Button type='primary' size='small' style={{ marginLeft: 15 }} disabled={addDisabled}
                  onClick={e => this.addMeasure()}>添加其他指标</Button> :
                null}
            </div>
          )
        }); element =
          <div>
            <div>
              <Button type='primary' disabled={modal} onClick={this.diff}>差异比较</Button>
              <Button type='primary' style={{ marginLeft: 15 }} disabled={!modal} onClick={this.deleteDiff}>删除比较</Button>
              <Button type='primary' style={{ marginLeft: 15 }} disabled={!modal} onClick={this.addDiff}>添加比较</Button>
            </div>
            {modal ?
              <div>
                <FilterData style={{ width: '100%' }} parent={diffArr} span={22} getChange={false}
                  wrappedComponentRef={(form) => this.FilterDiff = form} id={id} root={this}></FilterData>

                {otherFilterDiff.map((inx, ind) => {
                  return (
                    <div key={inx}>
                      <FilterData style={{ width: '100%' }} parent={diffArr} span={22} getChange={false}
                        wrappedComponentRef={(form) => this['FilterDiff' + inx] = form} id={id} root={this}></FilterData>
                      <Button size='small' type='primary' onClick={() => this.deleteOtherDiff(ind)}>删除</Button>
                    </div>
                  )
                })}
              </div>
              : null}
          </div>
        element3 =
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <FormItem label='（3）选择x轴的坐标维度' style={{ display: 'flex' }}>
                {getFieldDecorator(pane.key + 'coordinatesX_left', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 150 }} onFocus={this.getDim} onChange={(e) => this.changeFilter(e, pane.key + 'coordinatesX_Right', 'X')}>
                    {getUserFilterDataX.map(item => {
                      return (
                        <Option key={item.dimTable} value={item.dimTable}>{item.dimDesc}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              {!Xshow ?
                <FormItem>
                  {getFieldDecorator(pane.key + 'coordinatesX_Right', {
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{ width: 150 }} disabled={Xshow}>
                      {getDimLevelDataX.map(item => {
                        return (
                          <Option key={item.columnCode} value={item.columnCode}>{item.columnDesc}</Option>
                        )
                      })}
                    </Select>
                  )}
                </FormItem> : null}
              {accounted ?
                <div style={{ display: 'flex', marginLeft: 15 }}>
                  <FormItem label='选择占比维度' style={{ display: 'flex' }}>
                    {getFieldDecorator(pane.key + 'coordinatesZ_left', {
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 150 }}
                        onChange={(e) => this.changeFilter(e, pane.key + 'coordinatesZ_Right', 'Z', pane.key + 'coordinatesZ_second')}>
                        {getUserFilterDataZ.map(item => {
                          return (
                            <Option key={item.dimTable} value={item.dimTable}>{item.dimDesc}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  {!Zshow ?
                    <div style={{ display: 'flex' }}>
                      <FormItem>
                        {getFieldDecorator(pane.key + 'coordinatesZ_Right', {
                          rules: [{ required: true, message: '必选' }]
                        })(
                          <Select style={{ width: 150 }} disabled={Zshow}
                            onChange={(e, a) => this.changeDimLevel(e, a, pane.key + 'coordinatesZ_second')}>
                            {getDimLevelDataZ.map(item => {
                              return (
                                <Option key={item.columnCode} value={item.columnCode} datas1={item.dimTable}
                                  datas2={item.columnName}>{item.columnDesc}</Option>
                              )
                            })}
                          </Select>
                        )}
                      </FormItem>
                      {!closeDimValue &&
                        <FormItem>
                          {getFieldDecorator(pane.key + 'coordinatesZ_second', {
                            // rules: [{ required: true, message: '必选' }]
                          })(
                            <Select style={{ width: 150 }} mode="multiple">
                              {getDimValueDataZ.map(item => {
                                return (
                                  <Option key={item.dimValue} title={item.dimName} value={item.dimValue}>{item.dimName}</Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>}
                    </div> : null}
                </div> : null}
              <FormItem label='选择y1轴的坐标单位' style={{ display: 'flex', marginLeft: 15 }}>
                {getFieldDecorator(pane.key + 'coordinatesY1', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 100 }}>
                    {coordinatesY.map(item => {
                      return (
                        <Option key={item.code} value={item.code}>{item.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem label='选择y2轴的坐标单位（如要）' style={{ display: 'flex', marginLeft: 15 }}>
                {getFieldDecorator(pane.key + 'coordinatesY2', {
                  rules: [{ required: false, message: '必选' }]
                })(
                  <Select style={{ width: 100 }} allowClear>
                    {coordinatesY.map(item => {
                      return (
                        <Option key={item.code} value={item.code}>{item.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
            </div>
            <Tabs
              data-set='line'
              type="editable-card"
              onChange={e => this.onChange(e, 'line')}
              activeKey={lineActiveKey}
              onEdit={(targetKey, action) => this.onEdit(targetKey, action)}
            >
              {linePanes.map(pane => (
                <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                  <Line wrappedComponentRef={e => this[pane.key] = e} root={this} pane={pane}></Line>
                </TabPane>
              ))}
            </Tabs>
          </div>; break;
      case '2': elem =
        measure.map((item, index) => {
          return (
            <div key={item} style={{ display: 'flex', flexWrap: 'wrap' }}>
              {this.getSameMeasure(item, index, pane)}
            </div>
          )
        }); element = this.setColorSpace('地图', 'map', mapSpace, mapDisabled); break;
      case '3': elem =
        measure.map((item, index) => {
          return (
            <div key={item} style={{ display: 'flex', flexWrap: 'wrap' }}>
              {this.getSameMeasure(item, index, pane)}
              <FormItem label='选择要统计的维度' style={{ display: 'flex', marginLeft: 15 }}>
                {getFieldDecorator(pane.key + item + 'pieDimension_left', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 150 }} onChange={e => this.changeFilter(e, pane.key + item + 'pieDimension_right', 'X')}>
                    {getUserFilterDataX.map(item => {
                      return (
                        <Option key={item.dimTable} value={item.dimTable}>{item.dimDesc}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              {!Xshow ?
                <FormItem>
                  {getFieldDecorator(pane.key + item + 'pieDimension_right', {
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{ width: 150 }} disabled={Xshow}>
                      {getDimLevelDataX.map(item => {
                        return (
                          <Option key={item.columnCode} value={item.columnCode}>{item.columnDesc}</Option>
                        )
                      })}
                    </Select>
                  )}
                </FormItem> : null}
              {accounted ?
                <div style={{ display: 'flex', marginLeft: 15 }}>
                  <FormItem label='选择占比维度' style={{ display: 'flex', marginLeft: 15 }}>
                    {getFieldDecorator(pane.key + item + 'pieDimensionZ_left', {
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 150 }}
                        onChange={e => this.changeFilter(e, pane.key + item + 'pieDimensionZ_right', 'Z', pane.key + item + 'pieDimensionZ_second')}>
                        {getUserFilterDataZ.map(item => {
                          return (
                            <Option key={item.dimTable} value={item.dimTable}>{item.dimDesc}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  {!Zshow ?
                    <div style={{ display: 'flex' }}>
                      <FormItem>
                        {getFieldDecorator(pane.key + item + 'pieDimensionZ_right', {
                          rules: [{ required: true, message: '必选' }]
                        })(
                          <Select style={{ width: 150 }} disabled={Zshow}
                            onChange={(e, a) => this.changeDimLevel(e, a, pane.key + item + 'pieDimensionZ_second')}>
                            {getDimLevelDataZ.map(item => {
                              return (
                                <Option key={item.columnCode} value={item.columnCode} datas1={item.dimTable}
                                  datas2={item.columnName}>{item.columnDesc}</Option>
                              )
                            })}
                          </Select>
                        )}
                      </FormItem>
                      {!closeDimValue &&
                        <FormItem>
                          {getFieldDecorator(pane.key + item + 'pieDimensionZ_second', {
                            // rules: [{ required: true, message: '必选' }]
                          })(
                            <Select style={{ width: 150 }} mode="multiple">
                              {getDimValueDataZ.map(item => {
                                return (
                                  <Option key={item.dimValue} title={item.dimName} value={item.dimValue}>{item.dimName}</Option>
                                )
                              })}
                            </Select>
                          )}
                        </FormItem>}
                    </div> : null}
                </div> : null}
            </div>
          )
        }); element =
          <div>
            <div>
              <FormItem label='是否自定义饼图颜色' style={{ display: 'flex' }}>
                {getFieldDecorator(pane.key + 'pieUseColor', {
                  initialValue: '1',
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Radio.Group onChange={e => this.setState({ pieUseColor: e.target.value })}>
                    <Radio value='1'>是，自定义</Radio>
                    <Radio value='2'>否，随机颜色</Radio>
                  </Radio.Group>
                )}
              </FormItem>
            </div>
            {pieUseColor === '1' ? this.setColorSpace('饼图', 'pie', pieSpace, pieDisabled) : null}
          </div>; break;
    };
    return (
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          <FormItem label={`（1）输入${pane.title}的标题`} style={{ display: 'flex' }}>
            {getFieldDecorator(pane.key + 'title', {
              rules: [{ required: true, message: '必填' }]
            })(
              <Input style={{ width: 400 }}></Input>
            )}
          </FormItem>

          <FormItem label='图表图形' style={{ display: 'flex', marginLeft: 20 }}>
            {getFieldDecorator(pane.key + 'check', {
              initialValue: '1',
              rules: [{ required: true, message: '必选' }]
            })(
              <Radio.Group onChange={this.changeType}>
                <Radio value='1'>常规图形（柱状图、折线图与面积图）</Radio>
                {queryUserData.companycode === '01' ? <Radio value='2'>地图</Radio> : null}
                <Radio value='3'>饼状图</Radio>
              </Radio.Group>
            )}
          </FormItem>

          <FormItem label='选择更新频度' style={{ display: 'flex', marginLeft: 20 }}>
            {getFieldDecorator(pane.key + 'timeType', {
              rules: [{ required: true, message: '必选' }]
            })(
              <Select style={{ width: 60 }} onChange={this.changeCycle}>
                {timeType.map(i => {
                  return (
                    <Option title={i.name} key={i.code} value={i.code}>{i.name}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          {chartType === '1' &&
            <Button size='small' onClick={this.changeIndex} type='primary' style={{ margin: '7px 0 0 15px' }}>切换下列指标位置</Button>}
        </div>

        {elem}

        <div style={{ marginLeft: 32 }}>
          <span style={{ color: '#000', fontSize: 12 }}>选择指标的数据维度：</span>
          <FilterData style={{ width: '100%' }} getChange={true} otherPayload={appThemeList} useFnc={true}
            wrappedComponentRef={(form) => this.Filter = form} id={id} root={this} span={22}></FilterData>
          {element}
        </div>

        {element3}

        <Modal
          visible={measureModel}
          onOk={() => this.setMeasureIndex()}
          onCancel={() => this.setState({ measureModel: false })}
          title='指标顺序'>
          <FormItem label='选择指标的顺序' style={{ display: 'flex' }}>
            {getFieldDecorator('measureIndex')(
              <Select mode='multiple' style={{ width: 200 }}>
                {measure.map(item => {
                  return (
                    <Option key={item}>{item}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
        </Modal>
      </div>
    );
  }
}
