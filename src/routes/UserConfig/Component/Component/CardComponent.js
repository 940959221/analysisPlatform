import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, InputNumber, Button, Input, Select, Collapse, Radio, Pagination, message, Icon, TreeSelect } from 'snk-web';
import CardComponent from '../../../../components/cardComponent';
import FilterData from '../../../PayPredict/components/FilterData';
import { PublicFilter } from '../PublicFilter';

const FormItem = Form.Item;
const Option = Select.Option;
const { Panel } = Collapse;
const { TreeNode } = TreeSelect;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class CardComponents extends Component {
  state = {
    radio: '01',             // 默认使用预警组件
    card: null,              // 卡片组件的dom元素
    ordinaryX: [],           // 预警组件x下拉数据
    ordinaryY: [],           // 预警组件y下拉数据
    ordinaryZ: [],           // 预警组件z下拉数据
    totalX: 0,               // 预警组件x总数量
    totalY: 0,               // 预警组件y总数量
    totalZ: 0,               // 预警组件z总数量
    mainMeasure: [],         // 主要指标的下拉数据
    charts: [],            // 点击该组件后下钻的图表-指标数量
    defaults: [{ label: '柱状图', value: '柱状图' }, { label: '折线图', value: '折线图' }],  // 默认形式
    coordinates: [{ label: 'y1', value: '1' }, { label: 'y2', value: '2' }],                        // 坐标轴
    disable: false,          // 增加其他指标按钮是否可用
    count: [],               // 预警组件中选择指标需要展示几项
    rules: false,            // 点击该组件后下钻的图表-其他指标的默认形式和坐标轴是否必选
    xDimension: [],          // x轴维度的第二个下拉值
    staDimension: [],        // 统计组件-选择指标-统计维度的第二个下拉值
    id: '',                  // 预警组件主要指标的id
    initTheme: '',   // 默认初始  统计组件的选择主题
    appId: 'supervise',      // 主题id，默认使用综改监控_财务类
    themeId: 'finance',      // 指标主题的中文名，默认综改监控_财务类
    getFilter: 'getUserFilter',
    getFilterAfter: 'getUserFilterDim',   // 给筛选数据维度组件使用
    frequency: [],           // 统计组件中的统计频度
    tongji_main: {},         // 统计组件中的主要指标
    valueDatas: {},          // 所有值类型的数据集合
    tenDays: {},             // 所有数据是否使用10天前数据集合
    showZ: false,            // 统计组件是否展示z指标
    measureObj: {},          // 统计组件多个主题对应的指标集合
    getUserFilterData: [],   // 过滤维度集合
    addType: '01',           // 默认使用不关联图表
    chartsData: [],          // 关联图表的所有数据
    flagArr: {},             // 是否显示占比维度
    flagData1: [],           // 占比一级维度
    flagData2: [],           // 占比二级维度
    flagData3: [],           // 占比三级维度
    coordinatesY: [
      { name: '件数', code: '件数' },
      { name: '百分比', code: '百分比' },
      { name: '万元', code: '万元' },
      { name: '元', code: '元' },
      { name: '原始值', code: '原始值' },
      { name: '日', code: '日' }
    ],
    Xshow: false,
    Yshow: false,
    Zshow: false,
    closeDimValue: false,     // 占比三级维度是否可见
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'analysis/qCardTypeList',
    })

    this.props.dispatch({
      type: 'analysis/getThemeSelect',
    }).then(() => {
    })

    this.getData_X()

    this.props.dispatch({
      type: 'analysis/queryGraph',
      payload: {}
    }).then(() => {
      const { queryGraphData: { list } } = this.props.analysis;
      // this.props.form.setFieldsValue({ chartComponent: undefined })
      const data = [];
      for (let i of list) {
        data.push({
          code: i.id,
          name: i.graphComponentName
        })
      }
      this.setState({ chartsData: data })
    })

    // 更新状态里面的charts和count，给定初始值
    const charts = [{
      modal: 'mainMeasure',
      measureLabel: '主要指标',
      measureField: 'mainMeasure',
      defaultField: 'default',
      coordinateField: 'coordinate',
      rules: true
    }], count = [{
      label: 'X（预警用）',
      field: 'x',
      parameter1: 'x',
      parameter2: 'y',
      parameter3: 'z',
      large: 'X'
    }], frequency = [{ key: 'day', name: '日' }, { key: 'week', name: '周' }, { key: 'month', name: '月' }];
    this.setState({ charts, count, frequency });

    // 组件库点击编辑进行数据回显
    const { id, type } = this.props;
    if (id && type === '卡片组件') {
      this.props.dispatch({
        type: 'analysis/qCardAssemInfo',
        payload: {
          id
        }
      }).then(async () => {
        const { qCardAssemInfoData: { frontConfig, file1, file2 } } = this.props.analysis;
        const config = JSON.parse(frontConfig);
        let { state, state: { radio, appId, themeId, id }, fieldValue, fieldValue: { x }, filter } = config;
        this.setState({ ...state });
        if (radio === '01') {
          await this.props.dispatch({     // 这里发请求获取x预警的中文名，然后重新更新ordinaryX，保证回显正确，同时避免回显的其他预警和实际不匹配
            type: 'analysis/qAlarmInfo',
            payload: {
              id: x
            }
          }).then(() => {
            const { qAlarmInfoData: { alarmTag } } = this.props.analysis;
            this.getData_X(alarmTag, undefined, undefined, true);
          })
        }

        // 处理后续测试提出的问题，针对现有组件回显后添加原始值和日
        const { coordinatesY } = this.state;
        let name1, name2, name3;
        for (let i of coordinatesY) {
          if (i.name === '原始值') name1 = true;
          if (i.name === '日') name2 = true;
          if (i.name === '元') name3 = true;
        }
        if (!name1) coordinatesY.push({ name: '原始值', code: '原始值' });
        if (!name2) coordinatesY.push({ name: '日', code: '日' });
        if (!name3) coordinatesY.push({ name: '元', code: '元' });
        this.setState({ coordinatesY })

        // let appId, themeId;
        if (radio === '01') {
          appId = id.split('_')[0];
          themeId = id.split('_')[1];
        } else if (radio === '02') {
          const filterState = JSON.parse(filter.state);
          let fieldValue = JSON.parse(filter.value);
          let { filterData, filterSave, getAllData, selectList } = filterState;

          // 先判定是否需要删除筛选维度中的机构维度，调用公共函数
          if (filterSave.length > 0 && file2 === '1') {
            const newVal = PublicFilter(filterData, filterSave, getAllData, selectList, fieldValue);
            if (newVal) {
              filterData = newVal.filterData;
              filterSave = newVal.filterSave;
              getAllData = newVal.getAllData;
              selectList = newVal.selectList;
              fieldValue = newVal.fieldValue;
            }
          }
          this.Filter.setState({ ...filterState, userOnce: true });
          for (let j in fieldValue) {
            this.Filter.props.form.setFieldsValue({
              [j]: j.slice(0, 9) === 'selectDim' ? [fieldValue[j][0]] : fieldValue[j]
            })
          }
          this.Filter.getCascader();
        }
        this.props.dispatch({
          type: 'analysis/getUserMeasures',
          payload: {
            appId,
            themeId,
            visibleColumn: 'door'
          }
        })
        this.props.dispatch({
          type: 'analysis/getUserFilter',
          payload: {
            appId,
            themeId,
            timeFilter: '0'
          }
        }).then(() => {
          const { getUserFilterData } = this.props.analysis;
          this.setState({ getUserFilterData })
        })
        this.props.form.setFieldsValue(fieldValue);

        // 如果file1有值，说明当前是复制的组件，同时x轴维度为机构，把二级维度改成对应的值
        const values = this.props.form.getFieldsValue();
        if (file1 && values.ordinaryX1.indexOf('company') >= 0) this.props.form.setFieldsValue({ ordinaryX2: file1 });
        if (file1 && values.dimensionLeft.indexOf('company') >= 0) this.props.form.setFieldsValue({ dimensionRight: file1 });
      }, err => {
        if (err.code === 1) {
          message.error(err.message);
          this.props.id = null;
        }
      })
    }
  }

  // X预警的数据请求
  getData_X = (names, arg1, arg2, back) => {
    const name = !back ? this.props.form.getFieldValue('XName') : names;

    this.props.dispatch({
      type: 'analysis/qAlarmInfoList',
      payload: {
        pageNum: 1,
        pageSize: 10,
        alarmTag: names ? name : undefined
      }
    }).then(() => {
      const { qAlarmInfoListData: { list, total } } = this.props.analysis;
      // 先把X、Y、Z的所有数据配好，后续跟进情况使用
      const X = [], Y = [], Z = [];
      for (let i of list) {
        X.push({
          alarmTag: i.alarmTag,
          id: i.id,
          themeId: i.themeId,
          indId: i.indId,
          indName: i.indName,
          frequency: i.frequency,
          themeId: i.themeId
        })
      }
      this.setState({ ordinaryX: X, totalX: total, });
      if (names && !back) {
        this.props.form.setFieldsValue({ x: undefined });
        this.changeMeasure(arg1, arg2);
      }
    })
  }

  // 清空全部的10天前数据和值类型
  removeSome = () => {
    const values = this.props.form.getFieldsValue();
    const { tenDays } = this.state;
    for (let i in values) {     // 所有值类型全部清空
      if (i.indexOf('-value') >= 0) {
        this.props.form.setFieldsValue({ [i]: undefined });
      }
    }
    for (let i in tenDays) {
      tenDays[i] = false;   // 删掉所有指标的10天数据
    }
  }

  // 改变组件类型
  changeType = (e) => {
    // 切换组件的时候一定把主要指标清空
    const val = e.target.value,
      { initTheme, count, measureObj, charts } = this.state;
    this.props.form.setFieldsValue({ mainMeasure: [], ordinaryX1: undefined, ordinaryX2: undefined, addType: '01' });

    // 调用方法清空所有10天前数据和值类型
    this.removeSome();

    // 如果此时的组件是统计组件的话需要额外发送请求，获取指标和维度，因为统计组件中这两项不受主要指标影响，而是主题
    if (val === '02') {
      // 因为刚刚切换到统计组件，所以还没渲染出theme表单数据，先使用默认初始的值
      const appId = initTheme.split('_')[0],
        themeId = initTheme.split('_')[1];
      this.props.dispatch({
        type: 'analysis/getUserMeasures',
        payload: {
          appId,
          themeId,
          visibleColumn: 'door'
        }
      }).then(() => {
        const { getUserMeasuresData } = this.props.analysis;
        for (let i in measureObj) {
          measureObj[i] = getUserMeasuresData
        }
        this.setState({ measureObj })
      })
      this.props.dispatch({
        type: 'analysis/getUserFilter',
        payload: {
          appId,
          themeId,
          timeFilter: '0'
        }
      }).then(() => {
        const { getUserFilterData } = this.props.analysis;
        this.setState({ getUserFilterData })
      })
      this.setState({ appId, themeId })

      // 此处是在切换组件的时候执行，当前还未切换完成，所以找不到过滤组件，需要使用定时器的宏任务
      setTimeout(() => {
        // 重置筛选维度
        this.Filter.setState({ filterSave: [], filterData: [], userOnce: true });
        this.Filter.props.form.resetFields();
      });
    } else if (val === '01') {
      // 切换回预警组件的时候，由于是用渲染的方式，所以要把count删除到最开始的样子
      const nowCount = count.slice(0, 1);
      this.setState({ count: nowCount, getUserFilterData: [] })
    }
    this.setState({
      radio: val, charts: charts.slice(0, 1), mainMeasure: [], xDimension: [],
      showZ: false, addType: '01', disable: false, flagArr: {}, measureObj: {}
    });
  }

  // 分页
  changePageSize = (current, pageSize, type, arg1, arg2) => {
    if (type) {
      this.props.dispatch({
        type: 'analysis/qAlarmInfoList',
        payload: {
          pageNum: current,
          pageSize: pageSize,
          alarmTag: this.props.form.getFieldValue('XName')
        }
      }).then(() => {
        // 储存总数，同时根据type的不同，分页的数据也对应不同，不会互相影响
        const { qAlarmInfoListData } = this.props.analysis,
          arr = [],
          ordinary = 'ordinary' + type,
          total = 'total' + type;
        for (let i of qAlarmInfoListData.list) {
          arr.push({
            alarmTag: i.alarmTag,
            id: i.id,
            themeId: i.themeId,
            indId: i.indId,
            indName: i.indName,
            frequency: i.frequency,
            themeId: i.themeId
          })
        }
        this.setState({ [ordinary]: arr, [total]: qAlarmInfoListData.total });
        this.props.form.setFieldsValue({ x: undefined });
        this.changeMeasure(arg1, arg2)
      })
    } else {
      const name = this.props.form.getFieldValue('componentName');
      this.props.dispatch({
        type: 'analysis/queryGraph',
        payload: {
          page: current,
          pageSize,
          graphComponentName: name === '' || name === undefined ? undefined : name,
          moduleType: '1'
        }
      }).then(() => {
        const { queryGraphData: { list } } = this.props.analysis;
        this.props.form.setFieldsValue({ chartComponent: undefined })
        const data = [];
        for (let i of list) {
          data.push({
            code: i.id,
            name: i.graphComponentName
          })
        }
        this.setState({ chartsData: data })
      })
    }
  }

  // 关联图表选择现有图表组件
  getGrapData = () => {
    const { queryGraphData: { pageNum, pageSize } } = this.props.analysis;
    const name = this.props.form.getFieldValue('componentName');
    this.props.dispatch({
      type: 'analysis/queryGraph',
      payload: {
        page: 1,
        pageSize,
        graphComponentName: name === '' || name === undefined ? undefined : name,
        moduleType: '1'
      }
    }).then(() => {
      const { queryGraphData: { list } } = this.props.analysis;
      this.props.form.setFieldsValue({ chartComponent: undefined })
      const data = [];
      for (let i of list) {
        data.push({
          code: i.id,
          name: i.graphComponentName
        })
      }
      this.setState({ chartsData: data })
    })
  }

  // 预警组件修改指标
  changeMeasure = (e, type, type1, type2) => {
    let { ordinaryX, ordinaryY, mainMeasure, charts, valueDatas, tenDays } = this.state;
    let id;
    const { qAlarmInfoListData: { list } } = this.props.analysis;


    if (type !== 'x') {
      if (!mainMeasure[0].indId) return;
      // this.setTenDays(type)
      if (type === 'y') {
        for (let i of ordinaryY) {
          if (i.id === e) mainMeasure[1] = {
            alarmTag: i.alarmTag,
            id: i.id,
          }
        }
      } else if (type === 'z') {
        for (let i of ordinaryY) {
          if (i.id === e) mainMeasure[2] = {
            alarmTag: i.alarmTag,
            id: i.id,
          }
        }
      }
      mainMeasure = mainMeasure.filter((item, index) => {
        if (index < mainMeasure.length - 1) {
          return item.id !== mainMeasure[Number(index) + 1].id;
        } else return item
      })
      this.props.form.setFieldsValue({ mainMeasure: [], [`${type}-value`]: undefined })

      valueDatas[`${type}-value`] = [];
      tenDays[`${type}-value`] = false;
      this.setState({ mainMeasure, tenDays, valueDatas })
    } else {
      // 清空其他所有的指标
      for (let i of charts) {
        if (charts.length > 0) this.props.form.setFieldsValue({ [i.measureField]: [] });
        i.rules = false;
      }
      // 清空y和z
      this.props.form.setFieldsValue({ y: undefined, z: undefined });
      // 这里额外要清空x轴维度
      this.props.form.setFieldsValue({ ordinaryX1: [], ordinaryX2: [] });
      this.setState({ charts })

      // 调用方法清空所有10天前数据和值类型
      this.removeSome();

      const mainMeasures = [];
      for (let i of ordinaryX) {
        if (i.id === e) {
          mainMeasures.push({
            alarmTag: i.indName,
            id: i.indId,
            themeId: i.themeId,
            indId: i.indId,
            indName: i.indName,
            mainId: i.id
          })
          this.props.dispatch({
            type: 'analysis/getUserMeasures',
            payload: {
              appId: i.themeId.split('_')[0],
              themeId: i.themeId.split('_')[1],
              visibleColumn: 'door'
            }
          }).then(() => {
            const { getUserMeasuresData } = this.props.analysis;
            const arr = [];
            for (let i of getUserMeasuresData) {
              arr.push({
                alarmTag: i.attrName,
                id: i.attrCode
              })
            }
            this.setState({ ordinaryY: arr, ordinaryZ: arr })

            this.checkFlag(e, type);     // 调用检测是否占比的函数
          })
          this.props.dispatch({
            type: 'analysis/getUserFilter',
            payload: {
              appId: i.themeId.split('_')[0],
              themeId: i.themeId.split('_')[1],
              timeFilter: '0'
            }
          }).then(() => {
            const { getUserFilterData } = this.props.analysis;
            this.setState({ getUserFilterData })
          })
          this.setState({ id: i.themeId })
        }
      }
      this.setState({ mainMeasure: mainMeasures })
    }
    this.checkFlag(e, type);     // 调用检测是否占比的函数
  }

  // 获取10天前数据
  getTendays = (e, type, tongji) => {
    const measure = type.split('-value')[0];
    const { radio } = this.state;
    if (radio === '02') tongji = true
    const tenDays = this.setTendays(e, type, measure, tongji);
    this.setState({ tenDays })
  }

  // 是否使用10天前数据
  setTendays = (e, type, measure, tongji) => {
    const { tenDays, ordinaryX } = this.state;
    const X = this.props.form.getFieldValue('x');
    const measureValue = this.props.form.getFieldValue(measure);
    const frequency = this.props.form.getFieldValue('frequency');
    if (frequency && frequency !== 'day') return putValue();

    if (!measureValue || measureValue.length === 0) return putValue();
    if (e !== 'value') return putValue();
    if (tongji) {
      const { getUserMeasuresData } = this.props.analysis;
      for (let i of getUserMeasuresData) {
        const lastString = measureValue.slice(measureValue.length - 4);
        if (lastString === 'accu') return putValue();
      }
    } else {
      for (let i of ordinaryX) {
        if (X === i.id) {
          if (i.frequency !== 'day') return putValue();
          const measureCode = measureValue.indexOf('#') >= 0 ? measureValue.split('#')[1] : measureValue;
          const lastString = measureCode.slice(measureCode.length - 4);
          if (lastString === 'accu') return putValue();
        }
      }
    }

    tenDays[type] = true;
    return tenDays;

    function putValue() {
      tenDays[type] = false;
      return tenDays;
    }
  }

  // 预警组件切换卡片组件
  changeCard = (e) => {
    const val = e.target.value;
    const arr = [];
    let { mainMeasure } = this.state;
    // 根据卡片组件的不同，选择指标的可操作性也不同
    switch (val) {
      case '101': {
        arr.push({
          label: 'X（预警用）',
          field: 'x',
          parameter1: 'x',
          parameter2: 'y',
          parameter3: 'z',
          large: 'X'
        })
        mainMeasure = mainMeasure.slice(0, 1);
      }; break;
      case '102': {
        arr.push({
          label: 'X（预警用）',
          field: 'x',
          parameter1: 'x',
          parameter2: 'y',
          parameter3: 'z',
          large: 'X'
        })
        arr.push({
          label: 'Y',
          field: 'y',
          parameter1: 'y',
          parameter2: 'x',
          parameter3: 'z',
          large: 'Y'
        })
        mainMeasure = mainMeasure.slice(0, 2);
      }; break;
      case '103': {
        arr.push({
          label: 'X（预警用）',
          field: 'x',
          parameter1: 'x',
          parameter2: 'y',
          parameter3: 'z',
          large: 'X'
        })
        arr.push({
          label: 'Y',
          field: 'y',
          parameter1: 'y',
          parameter2: 'x',
          parameter3: 'z',
          large: 'Y'
        })
        arr.push({
          label: 'Z',
          field: 'z',
          parameter1: 'z',
          parameter2: 'x',
          parameter3: 'y',
          large: 'Z'
        })
        mainMeasure = mainMeasure.slice(0);
      }; break;
    }

    // 切换卡片的时候清空主要指标的所有数据同时调用变化监听事件，并且已经根据卡片类型删减了mainMeasure
    this.props.form.setFieldsValue({ mainMeasure: undefined });
    this.changeMain(undefined, '主要指标', `mainMeasure-value`)
    this.setState({ count: arr, mainMeasure })
  }

  // 统计组件修改主题
  changeTheme = (e, type, field) => {
    // 切换主题重新根据主题获取数据，同时把所有受主题影响的表单值重置
    const appId = e.split('_')[0], themeId = e.split('_')[1];
    const { measureObj, valueDatas, tenDays, tongji_main, charts } = this.state;
    const measureField = field.split('-value')[0];
    this.props.form.setFieldsValue({
      mainMeasure: [], ordinaryX1: [], ordinaryX2: [],
      [measureField]: [], dimensionLeft: [], dimensionRight: [], [field]: undefined
    })
    this.props.dispatch({
      type: 'analysis/getUserMeasures',
      payload: {
        appId,
        themeId,
        visibleColumn: 'door'
      }
    }).then(() => {
      const { getUserMeasuresData } = this.props.analysis;
      measureObj[type] = getUserMeasuresData;
      this.setState({ measureObj })
    })
    this.props.dispatch({
      type: 'analysis/getUserFilter',
      payload: {
        appId,
        themeId,
        timeFilter: '0'
      }
    }).then(() => {
      const { getUserFilterData } = this.props.analysis;
      this.setState({ getUserFilterData })
    })

    for (let i of charts) {
      if (charts.length > 0) this.props.form.setFieldsValue({ [i.measureField]: [] });
      i.rules = false;
    }

    // 重置筛选维度
    this.Filter.setState({ filterSave: [], filterData: [], userOnce: true });
    this.Filter.props.form.resetFields();

    delete tongji_main[type];
    valueDatas[field] = [];
    tenDays[field] = false;
    this.setState({ valueDatas, tenDays, tongji_main, appId, themeId, initTheme: e, charts, flagArr: {} })

    this.removeMainData();

    // 修改x的时候修改y
    setTimeout(() => {
      this.props.form.setFieldsValue({ themeZ: e })
    });
    if (type === 'x') this.changeTheme(e, 'z', 'statisticalZ-value');
  }

  // 统计组件统计指标x修改
  measureXChange = (e, type, field) => {
    const { getUserMeasuresData } = this.props.analysis;
    let { valueDatas, tenDays, measureObj, tongji_main } = this.state;
    for (let i of measureObj[type]) {
      if (i.attrCode === e) tongji_main[type] = {
        attrCode: i.attrCode,
        attrName: i.attrName,
        isIndex: i.isIndex,
        urlId: i.urlId
      }
    }
    this.props.form.setFieldsValue({ mainMeasure: [], [field]: undefined })

    valueDatas[field] = [];
    tenDays[field] = false;
    this.setState({ valueDatas, tenDays, tongji_main })

    this.removeMainData();

    this.checkFlag(e);     // 调用检测是否占比的函数
  }

  // 统计组件中切换指标和主题的时候清空主要和其他指标中的值类型和10天前数据
  removeMainData = () => {
    const { radio, charts, tenDays } = this.state;
    const values = this.props.form.getFieldsValue();
    for (let i in values) {
      if (i.indexOf('-value') >= 0 && i.indexOf('Measure') >= 0) {
        this.props.form.setFieldsValue({ [i]: undefined })
      }
    };
    for (let i in tenDays) {
      if (i.indexOf('Measure') >= 0) {
        tenDays[i] = false;
      }
    }
    this.setState({ tenDays })
  }

  // 获取指标值
  getValue = (field, tongji) => {
    const measure = this.props.form.getFieldValue(field);
    const { ordinaryX, valueDatas, radio } = this.state;
    const X = this.props.form.getFieldValue('x');
    let cycle;
    if (radio === '02') {
      const frequency = this.props.form.getFieldValue('frequency');
      if (!frequency) {
        valueDatas[field] = [];
        this.setState({ valueDatas });
        return;
      }
      cycle = frequency;
    } else {
      for (let i of ordinaryX) {
        if (i.id === X) cycle = i.frequency;
      }
    }

    if (!measure || measure.length === 0) {  // 强制先选指标，不然会出现没选指标结果就会有10天数据，同时清除值类型的所有数据
      valueDatas[field] = [];
      this.setState({ valueDatas });
      return;
    };

    const { getUserMeasuresData } = this.props.analysis;
    const valueData = [{ name: '取指标值', code: 'value' }];
    for (let i of getUserMeasuresData) {
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
    valueDatas[field] = valueData;
    this.setState({ valueDatas });
  }

  // 统计组件切换卡片类型
  changeCards = e => {
    const theme = this.props.form.getFieldValue('theme');
    if (theme) {
      this.changeTheme(theme, 'x', 'statisticalX-value');
    }
    if (e.target.value === '203') this.setState({ showZ: true });
    else this.setState({ showZ: false });
  }

  // 校验数字输入框的右边是否大于左边
  checkValue = (e, a, other) => {
    const otherVal = this.props.form.getFieldValue(other);
    if ((a || a === 0) && otherVal) {
      if (otherVal === '') return true;

      if (e.field.indexOf('Left') >= 0) {
        if (otherVal > a) return true;
        else return false;
      } else {
        if (otherVal < a) return true;
        else return false;
      }
    } else return true;
  }

  // 根据选择的组件类型切换数据展示
  setData = () => {
    const { getFieldDecorator } = this.props.form;
    const { ordinaryX, ordinaryY, ordinaryZ, radio, totalX, totalY, totalZ, count, staDimension,
      initTheme, frequency, valueDatas, tenDays, showZ, measureObj, getUserFilterData, Yshow } = this.state;
    const { qCardTypeListData, getThemeSelectData, getUserMeasuresData } = this.props.analysis;

    const typeValue_tongjiX = valueDatas['statisticalX'] ? valueDatas['statisticalX'] : [];
    const typeValue_tongjiZ = valueDatas['statisticalZ'] ? valueDatas['statisticalZ'] : [];
    const measureObjX = measureObj.x ? measureObj.x : [];
    const measureObjZ = measureObj.z ? measureObj.z : [];
    const id = true;
    let ind = 0, ind1 = 0, that = this, card, measure,
      cardArr1 = [{ id: 1, title: '预警文本', data: 'aaaa%', week: '12%', month: '-11%', warn: 'green' }],
      cardArr2 = [{ id: 2, title: '预警文本', data: 'XXXX', data1: 'YYYY', data2: 'aa亿元', data3: 'bb%', warn: 'yellow' }],
      cardArr3 = [{ id: 3, title: '预警文本', data: 'XXXX', data1: 'YYYY', data2: 'aa亿元', data3: 'bb%', data4: 'ZZZZ', data5: 'cc亿元', warn: 'red' }],
      cardArr4 = [{ id: 1, title: 'XXXX小于aa%的yy数', data: 'n个', warn: '#fff' }],
      cardArr5 = [{ id: 2, title: 'XXXX小于aa%的yy数', data: '个数', data1: 'yy', data2: 'n个', data3: 'y1,y2,y3', warn: '#fff' }],
      cardArr6 = [{ id: 3, title: 'XXXX小于aa%的yy数', data: '个数', data1: 'zzz', data2: 'n个', data3: 'zzz', warn: '#fff' }];
    // 根据组件类型不同，切换不同的卡片组件和指标
    radio === '01' ? card =
      <FormItem>
        {getFieldDecorator('card1', {
          initialValue: '101'
        })(
          <Radio.Group onChange={this.changeCard}>
            {qCardTypeListData.map(item => {
              let indNum;
              switch (item.indNum) {
                case 1: indNum = '（单指标X）'; break;
                case 2: indNum = '（双指标X、Y）'; break;
                case 3: indNum = '（三指标X、Y、Z）'; break;
              }
              if (item.carType === radio) {
                ind += 1;
                return (
                  <Radio value={item.id} key={item.id}>
                    <span>卡片式{ind + indNum}</span>
                    <CardComponent cardArr={eval('cardArr' + ind)}></CardComponent>
                  </Radio>
                )
              }
            })}
          </Radio.Group>
        )}
      </FormItem> :

      card =
      <div>
        <FormItem label='统计频度' style={{ display: 'flex' }}>
          {getFieldDecorator('frequency', {
            initialValue: '',
            rules: [{ required: true, message: '必选' }]
          })(
            <Select style={{ width: 100 }} onChange={this.removeSome}>
              {frequency.map(item => {
                return (
                  <Option value={item.key} key={item.key}>{item.name}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('card2', {
            initialValue: '201'
          })(
            <Radio.Group onChange={e => this.changeCards(e)}>
              {qCardTypeListData.map(item => {
                if (item.carType === radio) {
                  ind1 += 1;
                  let indNum;
                  switch (item.carStyle) {
                    case '1': indNum = '（只显示个数）'; break;
                    case '2': indNum = '（显示个数+维度值）'; break;
                    case '3': indNum = '（显示个数+另外的指标Z）'; break;
                  }
                  return (
                    <Radio value={item.id} key={item.id}>
                      <span>卡片式{ind1 + indNum}</span>
                      <CardComponent cardArr={eval(`cardArr${3 + ind1}`)}></CardComponent>
                    </Radio>
                  )
                }
              })}
            </Radio.Group>
          )}
        </FormItem>
      </div >

    radio === '01' ? measure =
      <div>
        <div >
          {count.map(item => {
            const typeValue = valueDatas[item.field] ? valueDatas[item.field] : []
            return (
              <div key={item.field}>
                <div style={{ display: 'flex' }}>
                  <FormItem label={item.label} style={{ display: 'flex' }}>
                    {getFieldDecorator(item.field, {
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 150 }}
                        showSearch
                        optionLabelProp="children"
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        onChange={e => this.changeMeasure(e, item.parameter1, item.parameter2, item.parameter3)}>
                        {eval('ordinary' + item.large).map(i => {
                          return (
                            <Option key={i.id} title={i.alarmTag}>{i.alarmTag}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  {item.field === 'x' ?
                    <div style={{ display: 'flex' }}>
                      <FormItem label='请输入查询条件' style={{ display: 'flex', marginLeft: 10 }}>
                        {getFieldDecorator('XName', {})(
                          <Input style={{ width: 150 }} />
                        )}
                      </FormItem>
                      <Button type='primary' onClick={() => this.getData_X(true, undefined, item.parameter1)} style={{ marginLeft: 10 }}>查询</Button>
                      <Pagination size="small" total={eval('total' + item.large)}
                        style={{ position: 'relative', top: 7, marginLeft: 10 }}
                        showSizeChanger showQuickJumper
                        showTotal={total => `共 ${total} 条数据`}
                        onShowSizeChange={(current, pageSize) => this.changePageSize(current, pageSize, item.large, undefined, item.parameter1)}
                        onChange={(current, pageSize) => this.changePageSize(current, pageSize, item.large, undefined, item.parameter1)} />
                    </div>
                    : null}

                  {item.parameter1 !== 'x' ?
                    <FormItem>
                      {getFieldDecorator(`${item.field}-value`, {
                        rules: [{ required: true, message: '必选' }]
                      })(
                        <Select style={{ width: 100 }} onFocus={() => this.getValue(item.field)}
                          onChange={e => this.getTendays(e, `${item.field}-value`)}>
                          {typeValue.map(i => {
                            return (
                              <Option key={i.code} value={i.code}>{i.name}</Option>
                            )
                          })}
                        </Select>
                      )}
                    </FormItem> : null}
                  {item.parameter1 !== 'x' ?
                    tenDays[`${item.field}-value`] ?
                      <FormItem style={{ marginLeft: 15 }}>
                        {getFieldDecorator(`${item.field}-tenDays`, {
                          initialValue: '02',
                          rules: [{ required: true, message: '必选' }]
                        })(
                          <Radio.Group>
                            <Radio value='01'>使用10天前数据</Radio>
                            <Radio value='02'>不使用10天前数据</Radio>
                          </Radio.Group>
                        )}
                      </FormItem> : null : null}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ color: 'red', margin: '10px 0' }}>（维度需要保持一致）</div>
      </div> :

      measure =
      <div>
        <div style={{ display: 'block', display: 'flex', flexWrap: 'wrap' }}>
          <FormItem label='选择要参与统计的指标X' style={{ display: 'flex' }}>
            {getFieldDecorator('theme', {
              // initialValue: initTheme,
              rules: [{ required: true, message: '必选' }]
            })(
              <Select style={{ width: 200 }} onChange={e => this.changeTheme(e, 'x', 'statisticalX-value')}>
                {getThemeSelectData.map(item => {
                  return (
                    <Option value={item.ATId} key={item.ATId}>{item.ATName}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('statisticalX', {
              rules: [{ required: true, message: '必选' }]
            })(
              <Select style={{ width: 150 }}
                showSearch
                optionLabelProp="children"
                filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                onChange={e => this.measureXChange(e, 'x', 'statisticalX-value')}>
                {measureObjX.map(item => {
                  return (
                    <Option key={item.attrCode} title={item.attrName} value={item.attrCode}>{item.attrName}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          <FormItem style={{ marginRight: 15 }}>
            {getFieldDecorator('statisticalX-value', {
              rules: [{ required: true, message: '必选' }]
            })(
              <Select style={{ width: 100 }} onFocus={() => this.getValue('statisticalX', true)}
                onChange={e => this.getTendays(e, 'statisticalX-value', true)}>
                {typeValue_tongjiX.map(i => {
                  return (
                    <Option key={i.code} value={i.code}>{i.name}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          {
            tenDays['statisticalX-value'] ?
              <FormItem style={{ marginLeft: 15 }}>
                {getFieldDecorator('statisticalX-tenDays', {
                  initialValue: '02',
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Radio.Group>
                    <Radio value='01'>使用10天前数据</Radio>
                    <Radio value='02'>不使用10天前数据</Radio>
                  </Radio.Group>
                )}
              </FormItem> : null
          }
          <div style={{ display: 'flex', marginRight: 20 }}>
            <FormItem label='统计区间' style={{ display: 'flex' }}>
              {getFieldDecorator('spaceLeft', {
                rules: [{ required: false, message: '必选' },
                { validator: (e, v) => this.checkValue(e, v, 'spaceRight'), message: '右边必须大于左边' }]
              })(
                <InputNumber placeholder='请输入' style={{ width: 150 }} />
              )}
            </FormItem>
            <span style={{ lineHeight: '36px' }}>&lt; X &lt;</span>
            <FormItem style={{ display: 'flex' }}>
              {getFieldDecorator('spaceRight', {
                rules: [{ required: false, message: '必选' },
                { validator: (e, v) => this.checkValue(e, v, 'spaceLeft'), message: '右边必须大于左边' }]
              })(
                <InputNumber placeholder='请输入' style={{ width: 150 }} />
              )}
            </FormItem>
          </div>
          <div style={{ display: 'flex' }}>
            <FormItem label='统计维度' style={{ display: 'flex' }}>
              {getFieldDecorator('dimensionLeft', {
                rules: [{ required: true, message: '必选' }]
              })(
                <Select style={{ width: 150 }} onChange={e => this.changeDimension(e, 'staDimension', 'dimensionRight', 'Y')}>
                  {getUserFilterData.map(item => {
                    return (
                      <Option key={item.dimTable} value={item.dimTable}>{item.dimDesc}</Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
            {!Yshow ?
              <FormItem style={{ display: 'flex', marginRight: 15 }}>
                {getFieldDecorator('dimensionRight', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 150 }} disabled={Yshow}>
                    {staDimension.map(item => {
                      return (
                        <Option key={item.columnCode} value={item.columnCode}>{item.columnDesc}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem> : null}
          </div>
          {showZ ?
            <div style={{ display: 'flex' }}>
              <FormItem label='选择要填入Z的指标' style={{ display: 'flex' }}>
                {getFieldDecorator('themeZ', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 200 }} disabled
                  >
                    {getThemeSelectData.map(item => {
                      return (
                        <Option value={item.ATId} key={item.ATId}>{item.ATName}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('statisticalZ', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 150 }}
                    showSearch
                    optionLabelProp="children"
                    filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                    onChange={e => this.measureXChange(e, 'z', 'statisticalZ-value')}>
                    {measureObjZ.map(item => {
                      return (
                        <Option key={item.attrCode} title={item.attrName} value={item.attrCode}>{item.attrName}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator('statisticalZ-value', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 100 }} onFocus={() => this.getValue('statisticalZ', true)}
                    onChange={e => this.getTendays(e, 'statisticalZ-value', true)}>
                    {typeValue_tongjiZ.map(i => {
                      return (
                        <Option key={i.code} value={i.code}>{i.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              {
                tenDays['statisticalZ-value'] ?
                  <FormItem style={{ marginLeft: 15 }}>
                    {getFieldDecorator('statisticalZ-tenDays', {
                      initialValue: '02',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Radio.Group>
                        <Radio value='01'>使用10天前数据</Radio>
                        <Radio value='02'>不使用10天前数据</Radio>
                      </Radio.Group>
                    )}
                  </FormItem> : null
              }
            </div>
            : null}
        </div>
        <FilterData style={{ width: '100%' }} filter={['pub_its_statdate']}
          wrappedComponentRef={(form) => this.Filter = form} id={id} root={this} span={22}></FilterData>
        <div style={{ color: 'red' }}>*统计区间的值如果设置为‘-999999999999’表示负无穷，‘999999999999’表示正无穷</div>
      </div>
    return { card, measure };
  }

  // 增加其他指标
  addMeasure = () => {
    const { charts } = this.state, length = charts.length;
    if (length >= 10) {
      message.warn('最多10个指标！');
      this.setState({ disable: true });
      return;
    }
    // 这里的判断是根据其他指标后面的小图标删除的功能来判定
    if (length > 1) {
      const number = Number(charts[length - 1].measureLabel.split('其他指标')[1]) + 1;
      charts.push({
        modal: 'getUserMeasuresData',
        measureLabel: `其他指标${number}`,
        measureField: `otherMeasure${number}`,
        defaultField: `default${number}`,
        coordinateField: `coordinate${number}`,
        rules: false,
      })
    } else {
      charts.push({
        modal: 'getUserMeasuresData',
        measureLabel: `其他指标1`,
        measureField: `otherMeasure1`,
        defaultField: `default1`,
        coordinateField: `coordinate1`,
        rules: false,
      })
    }
    this.setState({ charts });
  }

  // 修改主要指标
  changeMain = (e, label, field) => {
    // 因为是遍历获取的数据，所有每个指标都有绑定该事件，如果不是主要指标的话，执行操作，否则执行下面
    const { radio, charts, tenDays } = this.state;
    tenDays[field] = false;     // 删掉当前指标的10天数据
    this.props.form.setFieldsValue({ [field]: undefined });
    // 如果不是主要指标，找到此时操作的其他指标，把当前其他指标的rules修改，用于判定是否必选
    // if (label !== '主要指标') {
    for (let i of charts) {
      if (i.measureLabel !== '主要指标') {
        if (i.measureLabel === label) {
          if (e) i.rules = true;
          else i.rules = false;
        }
      }
    }
    this.setState({ charts, tenDays });

    if (e !== undefined) this.checkFlag(e, label);    // 调用检测是否占比的函数
    return;
  }

  // 修改X轴维度
  changeDimension = (e, type, field, name) => {
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
      if (type === 'xDimension') {
        this.setState({ xDimension: getDimLevelData });
        this.props.form.setFieldsValue({ ordinaryX2: [] })
      } else if (type === 'staDimension') {
        this.setState({ staDimension: getDimLevelData });
        this.props.form.setFieldsValue({ dimensionRight: [] })
      } else if (type === 'flag') {
        this.setState({ flagData2: getDimLevelData, flagData3: [] });
        this.props.form.setFieldsValue({ propFlag2: [], propFlag3: [] });
      }
    })

    if (e === 'pub_its_statdate') {     // 如果选择的是统计时间，就不能选择后面的数据
      this.setState({ [name + 'show']: true });
      this.props.form.setFieldsValue({ [field]: ' ' });
    } else {
      this.setState({ [name + 'show']: false });
      this.props.form.setFieldsValue({ [field]: undefined });
    }
  }

  // 添加&修改
  save = (e, saveAs) => {
    const value = this.props.form.getFieldsValue();
    const { charts, count, xDimension, getUserFilterData, mainMeasure, measureObj, showZ } = this.state;
    const { getUserMeasuresData, qAlarmInfoListData } = this.props.analysis;
    let referMeasure = '';
    // 创建名为dispatch的函数
    console.log('添加事件已触发');
    const dispatch = (values, type) => {
      // 创建共用的参数对象
      const payload = {
        assemName: values.name,
        typeId: values.card1,
        grapInd: null,
        grapStyle: values.default,
        grapAxis: values.coordinate,
        grapDimTable: values.ordinaryX1,
        grapDimCode: values.ordinaryX2,
        grapIstendaysAgo: values['mainMeasure-tenDays'] === '01' ? '1' : '0',
        grapValueType: values['mainMeasure-value'],
        grapFlag: values.addType === '01' ? '0' : '1',
        grapId: values.addType === '01' ? undefined : values.chartComponent,
        contexConfig: {
          y1Unit: values.y1Unit,
          y2Unit: values.y2Unit,
          propDimTable: values.propFlag1,
          propDimCode: values.propFlag2,
          propDimValue: values.propFlag3 ? values.propFlag3.join(',') : undefined
        },
        frontConfig: {                // frontConfig为组件库点击编辑后，回显数据时所需的对象
          type: '卡片组件',
          state: this.state,
          fieldValue: values
        }
      }
      if (type === '01') {
        // 给对象赋值一个数组
        const useObj = {
          type: '卡片组件',
          state: this.state,
          fieldValue: values
        };
        payload.contexConfig.grapConfig = [];
        payload.contexConfig.indConfig = [];
        payload.assemAlarmList = [];
        payload.frontConfig = JSON.stringify(useObj)
        // 找到主指标，并获取到指标的code
        let get_yujing = false;
        for (let i of getUserMeasuresData) {
          if (i.attrCode === values.mainMeasure) {
            get_yujing = true;
            payload.grapInd = i.urlId + '#' + i.attrCode + '#' + i.factTable;
            payload.grapIndName = i.attrName
          }
        }
        if (!get_yujing) {
          for (let i of mainMeasure) {
            if (i.id === values.mainMeasure) {
              payload.grapInd = i.indId;
              payload.grapIndName = i.alarmTag
            }
          }
        }

        // 后端需要所有指标的合集
        for (let i of qAlarmInfoListData.list) {
          if (i.id === values.x) referMeasure += `${i.indId.split('#')[1]},`;
        }
        if (values.y) referMeasure += `${values.y},`;
        if (values.z) referMeasure += `${values.z},`;
        if (values.mainMeasure) {
          if (values.mainMeasure.indexOf('#') >= 0) referMeasure += `${values.mainMeasure.split('#')[1]},`;
        }
        else referMeasure += `${values.mainMeasure},`;

        for (let i in values) {
          // 如果charts大于1，说明存在其他指标
          // 进而判定其他指标是否有选择值
          same(i);
          // 获取选择指标的X、Y、Z的id，因为是按情况展示，所以不一定会同时有三个
          if (i === 'y' || i === 'z') {
            let indName, indId_;
            for (let j of getUserMeasuresData) {
              if (j.attrCode === values[i]) {
                indName = j.attrName;
                indId_ = j.urlId + '#' + j.attrCode + '#' + j.factTable;
              }
            }

            payload.contexConfig.indConfig.push({
              indId: indId_,
              indName,
              istendaysAgo: values[i + '-tenDays'] === '01' ? '1' : '0',
              valueType: values[i + '-value'],
            })
          }
        }
        payload.referMeasure = referMeasure;

        payload.assemAlarmList.push({
          indId: values.x,
        })
      } else if (type === '02') {
        const filterDim = this.Filter.state;
        // 这里直接在最后校验，没有再添加多功能校验，嫌麻烦
        if (values.spaceLeft === values.spaceRight) {
          message.warn('统计区间左右不能相等！');
          return;
        }
        const { getUserMeasuresData } = this.props.analysis;
        let dimName, indName, dimNameZ, indNameZ, indIdX, indIdZ;
        for (let i of getUserFilterData) {
          if (i.dimTable === values.dimensionLeft) dimName = i.dimDesc;
        }
        for (let i of measureObj.x) {
          if (i.attrCode === values.mainMeasure) {
            payload.grapIndName = i.attrName;
            payload.grapInd = i.urlId + '#' + i.attrCode + '#' + i.factTable;
          }
          if (i.attrCode === values.statisticalX) {
            indName = i.attrName;
            indIdX = i.urlId + '#' + i.attrCode + '#' + i.factTable;
          }
          if (values.statisticalZ && i.attrCode === values.statisticalZ) {
            indNameZ = i.attrName;
            indIdZ = i.urlId + '#' + i.attrCode + '#' + i.factTable;
          }
        }
        // 对对象进行一个赋值，miniValue和maxValue是采取谁大谁用max的方式
        const tongjiObj = {
          indId: indIdX,
          miniValue: values.spaceRight && values.spaceLeft ? (values.spaceLeft < values.spaceRight ? values.spaceLeft : values.spaceRight) : values.spaceLeft,
          maxValue: values.spaceLeft && values.spaceRight ? (values.spaceRight > values.spaceLeft ? values.spaceRight : values.spaceLeft) : values.spaceRight,
          dimTable: values.dimensionLeft,
          // dimCode: values.dimensionRight,
          themeId: values.theme,
          frequency: values.frequency,
          dimName,
          indName,
          valueType: values['statisticalX-value'],
          istendaysAgo: values['statisticalX-tenDays'] === '01' ? '1' : '0',
          indConfig: [],
          dimColum: values.dimensionRight,
          filter: {}
        }
        if (showZ) {
          tongjiObj.indConfig.push({
            indId: indIdZ,
            indName: indNameZ,
            istendaysAgo: values['statisticalZ-tenDays'] === '01' ? '1' : '0',
            valueType: values['statisticalZ-value']
          })
        }

        for (let i of filterDim.filterData) {
          if (i.length > 0) {
            const filterArr = [];
            for (let k of i) {
              filterArr.push(k.dimValue)
            }
            if (tongjiObj.filter[i[0].dimColumn]) tongjiObj.filter[i[0].dimColumn] = [...tongjiObj.filter[i[0].dimColumn], ...filterArr];
            else tongjiObj.filter[i[0].dimColumn] = filterArr;
          }
        }
        // payload.contexConfig = {};
        payload.contexConfig.statiAssemConfig = {};
        payload.contexConfig.grapConfig = [];
        // payload.contexConfig.y1Unit = values.y1Unit;
        // payload.contexConfig.y2Unit = values.y2Unit;
        payload.typeId = values.card2;
        // payload.grapInd = values.mainMeasure;
        payload.contexConfig.statiAssemConfig = tongjiObj;

        // 后端需要所有指标的合集
        referMeasure += `${values.statisticalX},`;
        if (values.statisticalZ) referMeasure += `${values.statisticalZ},`;
        referMeasure += `${values.mainMeasure},`;

        for (let i in values) {
          // 找到主指标，并获取到指标的名字
          same(i);
        }
        payload.referMeasure = referMeasure;

        const filterForm = this.Filter.props.form.getFieldsValue();
        filterDim.cascaderOption = [];
        this.Filter.setState({ userOnce: true });
        payload.frontConfig.filter = {
          state: JSON.stringify(filterDim),
          value: JSON.stringify(filterForm)
        }
      }

      function same(i) {
        if (charts.length > 1) {
          if (i.indexOf('otherMeasure') >= 0 && i.indexOf('-') === -1 && values[i]) {
            referMeasure += `${values[i]},`;   // 借用循环

            let grapIndName, otherId;
            for (let j of getUserMeasuresData) {
              if (j.attrCode === values[i]) {
                grapIndName = j.attrName;
                otherId = j.urlId + '#' + j.attrCode + '#' + j.factTable;
              }
            }
            const obj = {
              grapInd: otherId,
              grapStyle: values['default' + i.split('otherMeasure')[1]],
              grapAxis: values['coordinate' + i.split('otherMeasure')[1]],
              grapIndName,
              grapIstendaysAgo: values[i + '-tenDays'] === '01' ? '1' : '0',
              grapValueType: values[i + '-value'],
            }
            if (type === '01') payload.contexConfig.grapConfig.push(obj)
            else payload.contexConfig.grapConfig.push(obj)
          }
        }
      }

      if (payload.grapFlag === '1') {
        for (let i in payload) {
          if (i.indexOf('grap') >= 0 && i !== 'grapFlag' && i !== 'grapId') {
            delete payload[i]
          }
        }
      }

      console.log(payload);
      // 如果是组件库点击编辑后，回显的数据，则调用修改接口，否则就使用新增接口
      console.log(this.props.id);
      console.log(this.props.type);
      console.log(!saveAs);
      if (this.props.id && this.props.type === '卡片组件' && !saveAs) {
        payload.id = this.props.id;
        this.props.dispatch({
          type: 'analysis/updCardAssem',
          payload
        }).then(() => {
          message.success('修改成功！')
        }).catch(err => {
          message.warn(err.message)
        })
      } else {
        this.props.dispatch({
          type: 'analysis/saveCardAssem',
          payload
        }).then(() => {
          message.success('添加成功！')
        }).catch(err => {
          message.warn(err.message)
        })
      }
    }
    // 因为不是用判定来渲染普通和统计组件，所以在最后校验的时候两边的组件的表单值都会被校验，所以删除另一边的属性，确保当前组件没错误就行
    this.props.form.validateFields((err, values) => {
      let componentName = '';
      if (value.type === '01') componentName = '预警组件';
      else if (value.type === '02') {
        componentName = '统计组件';

        if (!values.spaceLeft && !values.spaceRight) {
          message.warn(`统计区间的值至少填写一个！`);
          return
        }
      }

      if (err) {
        message.warn(`请检查${componentName}的必选项是否填写！`);
        return;
      };
      if (values.name.indexOf('-') < 0) {
        message.warn('请检查组件名称是否按红字提示填写！');
        return;
      }
      dispatch(values, value.type);
    })
  }

  // 点击其他指标后面的小图标删除改指标
  remove = (e) => {
    const { charts } = this.state;
    for (let i in charts) {
      if (charts[i].measureLabel === e.measureLabel) charts.splice(i, 1)
    }
    this.setState({ charts, disable: false })
  }

  changeFlag2 = (e, type) => {
    const { flagData2 } = this.state;
    const { getCompany: { companyCode } } = this.props.analysis;
    for (let i in flagData2) {
      const val = flagData2[i];
      if (val.columnCode === e && i === '0' && companyCode.length > 2 && type.props.datas1.indexOf('company') >= 0) {
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
      } else dimValue = getDimValueData
      this.setState({ flagData3: dimValue })
    })
    this.props.form.setFieldsValue({ propFlag3: undefined })
  }

  // 检测当前指标是否是占比指标
  checkFlag = (e, type) => {
    const { radio, id, appId, themeId, flagArr } = this.state;
    const values = this.props.form.getFieldsValue();
    const getFlag = measureCode => {
      const { getUserMeasuresData } = this.props.analysis;
      let flag = false;
      for (let i of getUserMeasuresData) {
        if (i.attrCode === measureCode) {
          if (i.propFlag === '1') flag = true;
        }
      }
      if (flag) {
        let id1, id2;
        if (radio === '01') {
          id1 = id.split('_')[0];
          id2 = id.split('_')[1];
        } else {
          id1 = appId;
          id2 = themeId;
        }
        this.props.dispatch({
          type: 'analysis/getUserFilter',
          payload: {
            appId: id1,
            themeId: id2,
            timeFilter: '0'
          }
        }).then(() => {
          const { getUserFilterData } = this.props.analysis;
          this.setState({ flagData1: getUserFilterData })
        })
      }
      flagArr[type] = flag;
      this.setState({ flagArr });
    }

    // 预警组件
    if (type === 'x') {
      const { qAlarmInfoListData: { list } } = this.props.analysis;
      for (let i of list) {
        if (i.id === e) {
          getFlag(i.indId.split('#')[1]);
        }
      }
    } else if (type === '主要指标') {
      if (radio === '01') getFlag(e.split('#')[1]);
      else getFlag(e)
    }
    else getFlag(e)
  }

  // 修改选择添加方式
  changeAddType = e => {
    if (e.target.value === '02') {
      this.changePageSize(1, 10);
    }
    this.setState({ addType: e.target.value });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { mainMeasure, charts, defaults, coordinates, disable, rules, radio, xDimension, flagData1, flagData2, flagData3, closeDimValue,
      tongji_main, tenDays, valueDatas, getUserFilterData, addType, chartsData, coordinatesY, flagArr, Xshow, Zshow } = this.state;
    const { getUserMeasuresData, queryGraphData: { total } } = this.props.analysis;

    let propFlag = false;
    for (let i in flagArr) {
      if (flagArr[i]) propFlag = true;
    }
    return (
      <div>
        <Collapse defaultActiveKey={['1', '2', '3', '4']}>
          <Panel header="组件类型" key="1">
            <div style={{ display: 'flex' }}>
              <FormItem>
                {getFieldDecorator('type', {
                  initialValue: '01',
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Radio.Group onChange={this.changeType}>
                    <Radio value='01'>预警组件</Radio>
                    <Radio value='02'>统计组件</Radio>
                  </Radio.Group>
                )}
              </FormItem>
              <FormItem label='输入对应组件名称' style={{ display: 'flex' }}>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Input style={{ width: 200 }} placeholder='请输入'></Input>
                )}
              </FormItem>
              <span style={{ color: 'red', lineHeight: '40px', marginLeft: 10 }}>
                *组件名称中至少输入一个‘-’，‘-’后面的内容用做图表展示时的名称，只取最后一个‘-’后面文本</span>
            </div>
          </Panel>

          <Panel header="卡片组件" key="2">
            {this.setData().card}
          </Panel>

          <Panel header="选择指标" key="3">
            {this.setData().measure}
          </Panel>

          <Panel header="点击该组件后下钻的图表" key="4">
            <FormItem label='选择添加方式' style={{ display: 'flex' }}>
              {getFieldDecorator('addType', {
                initialValue: '01',
                rules: [{ required: true, message: '必选' }]
              })(
                <Radio.Group onChange={e => this.changeAddType(e)}>
                  <Radio value='01'>不关联重新创建</Radio>
                  <Radio value='02'>关联现有图表</Radio>
                </Radio.Group>
              )}
            </FormItem>
            {propFlag ?
              <div style={{ display: 'flex' }}>
                <FormItem label='占比维度' style={{ display: 'flex' }}>
                  {getFieldDecorator('propFlag1', {
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{ width: 150 }} onChange={e => this.changeDimension(e, 'flag', 'propFlag2', 'Z')}>
                      {flagData1.map(item => {
                        return (
                          <Option key={item.dimTable} title={item.dimDesc} value={item.dimTable}>{item.dimDesc}</Option>
                        )
                      })}
                    </Select>
                  )}
                </FormItem>
                {!Zshow ?
                  <div style={{ display: 'flex' }}>
                    <FormItem>
                      {getFieldDecorator('propFlag2', {
                        rules: [{ required: true, message: '必选' }]
                      })(
                        <Select style={{ width: 150 }} onChange={(e, a) => this.changeFlag2(e, a)} disabled={Zshow}>
                          {flagData2.map(item => {
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
                        {getFieldDecorator('propFlag3', {
                          rules: [{ required: true, message: '必选' }]
                        })(
                          <Select style={{ width: 150 }} mode="multiple">
                            {flagData3.map(item => {
                              return (
                                <Option key={item.dimValue} title={item.dimName} value={item.dimValue}>{item.dimName}</Option>
                              )
                            })}
                          </Select>
                        )}
                      </FormItem>}
                  </div> : null
                }
              </div> : null}

            {addType === '01' ?
              <div>
                <div style={{ display: 'flex' }}>
                  <FormItem label='y1轴坐标单位' style={{ display: 'flex' }}>
                    {getFieldDecorator('y1Unit', {
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 100 }}>
                        {coordinatesY.map(i => {
                          return (
                            <Option key={i.code} value={i.code}>{i.name}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label='y2轴坐标单位' style={{ display: 'flex', marginLeft: 15 }}>
                    {getFieldDecorator('y2Unit', {
                      // rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 100 }} allowClear>
                        {coordinatesY.map(i => {
                          return (
                            <Option key={i.code} value={i.code}>{i.name}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                </div>
                {charts.map((i, index) => {
                  // 此处遍历charts，其中包括点击按钮添加的其他指标和初始的主要指标，根据类型的不同来赋值，最好结合charts数组来看
                  let modalData, rule;
                  const typeValue = valueDatas[i.measureField] ? valueDatas[i.measureField] : []

                  if (i.modal === 'mainMeasure') {
                    if (radio === '01') modalData = mainMeasure;
                    else if (radio === '02') {
                      let ddarr = [];
                      for (let j in tongji_main) {
                        ddarr.push(tongji_main[j]);
                      }
                      ddarr = ddarr.filter((val, ind) => {
                        if (ind < ddarr.length - 1) {
                          return val.attrCode !== ddarr[Number(ind) + 1].attrCode;
                        } else return val
                      })
                      modalData = ddarr;
                    }
                    rule = true;
                  } else {
                    if (radio === '01') modalData = this.props.analysis[i.modal];
                    else if (radio === '02') modalData = getUserMeasuresData;
                    rule = false;
                  }

                  return (
                    <div key={i.measureLabel} style={{ display: 'flex', flexWrap: 'wrap' }}>
                      <FormItem label={i.measureLabel} style={{ display: 'flex' }}>
                        {getFieldDecorator(`${i.measureField}`, {
                          rules: rule ? [{ required: true, message: '必选' }] : []
                        })(
                          <Select style={{ width: 200 }} allowClear={!rule}
                            showSearch
                            optionLabelProp="children"
                            filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                            onChange={e => this.changeMain(e, i.measureLabel, `${i.measureField}-value`)}>
                            {modalData.map(item => {
                              if (i.modal === 'mainMeasure' && radio === '01')
                                return (
                                  <Option key={item.id} title={item.alarmTag} value={item.id}>{item.alarmTag}</Option>
                                )
                              else return (
                                <Option key={item.attrCode} title={item.attrName} value={item.attrCode}>{item.attrName}</Option>
                              )
                            })}
                          </Select>
                        )}
                      </FormItem>
                      <FormItem>
                        {getFieldDecorator(`${i.measureField}-value`, {
                          rules: rule ? [{ required: true, message: '必选' }] : (i.rules ? [{ required: true, message: '必选' }] : [])
                        })(
                          <Select style={{ width: 100 }} onFocus={() => this.getValue(i.measureField)}
                            onChange={e => this.getTendays(e, `${i.measureField}-value`)}>
                            {typeValue.map(i => {
                              return (
                                <Option key={i.code} value={i.code}>{i.name}</Option>
                              )
                            })}
                          </Select>
                        )}
                      </FormItem>
                      {
                        tenDays[`${i.measureField}-value`] ?
                          <FormItem style={{ marginLeft: 15 }}>
                            {getFieldDecorator(`${i.measureField}-tenDays`, {
                              initialValue: '02',
                              rules: rule ? [{ required: true, message: '必选' }] : (i.rules ? [{ required: true, message: '必选' }] : [])
                            })(
                              <Radio.Group>
                                <Radio value='01'>使用10天前数据</Radio>
                                <Radio value='02'>不使用10天前数据</Radio>
                              </Radio.Group>
                            )}
                          </FormItem> : null
                      }
                      <FormItem label='默认形式' style={{ display: 'flex', marginRight: 20, marginLeft: 10 }}>
                        {getFieldDecorator(`${i.defaultField}`, {
                          rules: rule ? [{ required: true, message: '必选' }] : (i.rules ? [{ required: true, message: '必选' }] : [])
                        })(
                          <Select style={{ width: 100 }}>
                            {defaults.map(item => {
                              return (
                                <Option key={item.value} value={item.value}>{item.label}</Option>
                              )
                            })}
                          </Select>
                        )}
                      </FormItem>
                      <FormItem label='坐标轴' style={{ display: 'flex' }}>
                        {getFieldDecorator(`${i.coordinateField}`, {
                          rules: rule ? [{ required: true, message: '必选' }] : (i.rules ? [{ required: true, message: '必选' }] : [])
                        })(
                          <Select style={{ width: 100 }}>
                            {coordinates.map(item => {
                              return (
                                <Option key={item.value} value={item.value}>{item.label}</Option>
                              )
                            })}
                          </Select>
                        )}
                      </FormItem>
                      {index === 0 ? null :
                        <Icon
                          style={{ marginLeft: 10, lineHeight: '36px' }}
                          className="dynamic-delete-button"
                          type="minus-circle-o"
                          onClick={() => this.remove(i)}
                        />}
                    </div>
                  )
                })}
                <div style={{ display: 'flex' }}>
                  <FormItem label='X轴维度' style={{ display: 'flex' }}>
                    {getFieldDecorator('ordinaryX1', {
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 150 }} onChange={e => this.changeDimension(e, 'xDimension', 'ordinaryX2', 'X')}>
                        {getUserFilterData.map(item => {
                          return (
                            <Option key={item.dimTable} value={item.dimTable}>{item.dimDesc}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  {!Xshow ?
                    <FormItem>
                      {getFieldDecorator('ordinaryX2', {
                        rules: [{ required: true, message: '必选' }]
                      })(
                        <Select style={{ width: 150 }} disabled={Xshow}>
                          {xDimension.map(item => {
                            return (
                              <Option key={item.columnCode} value={item.columnCode}>{item.columnDesc}</Option>
                            )
                          })}
                        </Select>
                      )}
                    </FormItem> : null}
                </div>
                <Button type='primary' disabled={disable} onClick={this.addMeasure}>增加其他指标</Button>
              </div> :

              <div>
                <div style={{ display: 'flex' }}>
                  <FormItem label='选择现有图表组件' style={{ display: 'flex' }}>
                    {getFieldDecorator('chartComponent', {
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select
                        style={{ width: 400 }}
                        showSearch
                        optionLabelProp="children"
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                      >
                        {chartsData.map(item => {
                          return (
                            <Option value={item.code} key={item.code}>{item.name}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  <Pagination size="small" total={total}
                    style={{ position: 'relative', top: 7, marginLeft: 10 }}
                    showSizeChanger showQuickJumper
                    showTotal={total => `共 ${total} 条数据`}
                    onShowSizeChange={(current, pageSize) => this.changePageSize(current, pageSize)}
                    onChange={(current, pageSize) => this.changePageSize(current, pageSize)} />
                </div>
                <div style={{ display: 'flex' }}>
                  <FormItem label='过滤组件名称' style={{ display: 'flex' }}>
                    {getFieldDecorator('componentName', {})(
                      <Input style={{ width: 200 }} />
                    )}
                  </FormItem>
                  <Button type='primary' style={{ marginLeft: 15 }} onClick={this.getGrapData}>查询</Button>
                </div>
              </div>}
          </Panel>
        </Collapse>
        <div style={{ color: 'red', margin: '10px 0' }}>注意：在统计组件的第三步和第四步中的指标，并不是从预警指标库中获取。</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0' }}>
          <Button type='primary' onClick={e => this.save(e, true)} style={{ marginRight: 15 }}>另存为</Button>
          <Button type='primary' onClick={this.save}>保存</Button>
        </div>
      </div>
    );
  }
}
