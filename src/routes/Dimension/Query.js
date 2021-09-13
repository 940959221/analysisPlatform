import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card, Form, Row, Col, Select, Input, Button, Modal, message, Collapse, Spin,
} from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import ReaderDimensionForm from '../../components/ReaderDimensionForm';
import Measure from '../../components/Measure';
import Dimension from '../../components/Dimension';
import Filter from '../../components/Filter';
import CycleAndTime from './components/CycleAndTime';
import ShowEcharts from './components/ShowEcharts';
import moment from 'moment';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const Option = Select.Option;

@connect(({ analysis, loading, umssouserinfo, global }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
  global
}))
@Form.create()

export default class Query extends PureComponent {
  state = {
    url: '', //最后点击确定的时候 请求的url
    appId: '', // 
    themeId: '',
    measure: [],
    dimension: [],
    alarmLevelList: [],
    filterList: [],
    getDimensions: [],
    alarmModelVisible: false,
    dimensionModelVisible: false,
    modelStatu: '',
    dimensionList: [],
    measureList: [],
    isLeaf: false,
    filterDimName: [],
    tempFilterName: [],
    filterShowName: [], // 存放显示对象
    filterObj: [], // 存放点击对象
    dimensionGroup: [], // 存放维度分组
    indexAnalyze: [],
    optionsGroup: [],
    dimensionLabel: '', //自定义分组对应的维度名
    options: [{
      value: "companycode",
      label: '机构',
      isLeaf: false,
    }],
    customGroupData: [], // 存放所有的分组
    getTimePeriodData: [],
    cycle: '', // 时间周期
    selectOption: [], //主维度元素
    onLoading: false,
    echartsMeasure: [],
    loadEcharts: false,
    selectMainDimArr: [], // 主维度元素
    mainDim: '', //
    getMeasureData: {},
    modelVisible: false,
    man: '',
    id: this.props.location.id,
    analyName: this.props.location.analyName,
    timeUuid: 1,
    uuid: 1,
    payload: {},
    measureNameCode: {},
    downloadButFlag: false,
    analysisName: '',
    updateCommalyId: '',
    token: '',
    indeterminate: true,
    checkAll: false,
    checkedList: [],
    columnValue: '',
    showClickPreData: false,
    getFilterLevelData: [], // 记录每次下钻点击的数据
    filter: {},
    clickChartsFilter: {}, // 下钻之后 导出数据 需要用到这里的filter数据
    clickXdataIsCycle: {}, // 下钻主维度是时间的时候 导出数据的content用这里
    isRequertUrl: 'analysis/getDimensionContent', // 查询维度 ReaderDimensionForm组件用到
    modelType: 'analysis',
    hover: false,
    isCuston: true, //是否需要自定义分组
    filterOptionHasTime: false, // 过滤器维度是否有时间维度
    dimensionSelectDisable: false, //分析维度置灰
    appName: '',
    themeName: '',
    isStack: false, // 柱状图是否折叠
    filterItemArrValue: [], // 过滤器左边当前的值
    publicMode: true,                          // 用于判定是否为公共模板
    saveMode: 'saveMode',                      // 保存模板的请求models路径
    editMode: 'queryMode',                      // 编辑模板的请求models路径
    queryMode: 'queryMode',                    // 查询模板的请求models路径
    queryConfigParam: 'queryModeData',         // 查询模板的请求返回数据  
    visual: 'queryModeData',                    // 编辑模板的请求返回数据
    clickMode: true
  }

  // 回显信息后 离开界面 清空界面内容
  componentWillMount() {
    Object.keys(this.props.analysis).map((item) => {
      if (item === 'clickCommalyData') {
        delete this.props.analysis[item]
      }
    });
  }

  componentDidMount() {
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    // 如果是从公共模板管理点进来的，那就固定显示个人模板，否则的话就根据当前点击切换的是什么模板，后面的也相应换成什么模板
    if (this.props.location.manaIscommon) {
      this.props.dispatch({
        type: 'global/changeClick',
        payload: true
      })
    } else {
      const { global: { publicModeName } } = this.props;
      let publicMode;
      if (publicModeName === '公共') publicMode = false;
      else publicMode = true;
      this.setState({ publicMode })
    }

    let themeId = '', appId = '';
    const value = window.location.href;
    if (value !== '') {
      const index = value.lastIndexOf('\/');
      appId = value.substring(index + 1, value.length).split('-')[0];
      themeId = value.substring(index + 1, value.length).split('-')[1];
    };
    if (themeId !== '' && themeId === 'businessudr') { // 测试的themeId--> businessudr,正式的themeId--> businessudr
      this.setState({ appName: '综改监控', themeName: '业务类(承保确认时间)' });
    } else if (themeId !== '' && themeId === 'business') { // 测试的themeId--> testTheme,正式的themeId--> business
      this.setState({ appName: '综改监控', themeName: '业务类(保险起期)' });
    } else if (themeId !== '' && themeId === 'clm') {
      this.setState({ appName: '车险品质', themeName: '理赔管理' });
    } else if (themeId !== '' && themeId === 'nbz') {
      this.setState({ appName: '车险品质', themeName: '承保管理' });
    } else if (themeId !== '' && themeId === 'prm') {
      this.setState({ appName: '车险品质', themeName: '保费类' });
    }
    this.setState({ appId, themeId });
    // 获取用户信息
    this.props.dispatch({
      type: 'analysis/getUserInfo'
    }).then(() => {
      const { getUserInfoData } = this.props.analysis;
      if (getUserInfoData.domain !== undefined) {
        this.setState({ man: getUserInfoData.domain });
      }
      const { queryMode, queryConfigParam } = this.state;
      const { dispatch, currentUser } = this.props;

      // 获取回显信息
      if (this.state.id !== undefined) {
        dispatch({
          type: 'analysis/clickCommaly',
          payload: {
            id: this.state.id
          }
        }).then(() => {
          const { clickCommalyData } = this.props.analysis;
          if (clickCommalyData.analysisName !== undefined && clickCommalyData.id !== undefined) {
            this.setState({ analysisName: clickCommalyData.analysisName, updateCommalyId: clickCommalyData.id, });
          }
          this.reloadData(clickCommalyData, '0')
        });
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
          this.reloadData(this.props.analysis[queryConfigParam], isPar);
          setTimeout(() => {
            this.submitForm();
          }, 400);
        })
      }
    });
    this.props.dispatch({
      type: 'analysis/iapHomeGetApplication',
      payload: []
    }).then(() => {
      const { iapHomeData } = this.props.analysis;
      this.setState({ token: iapHomeData.token });
    });

    if (themeId !== '' && appId !== '') {
      // 获取主题下的url --- 生成图表请求需要
      this.props.dispatch({
        type: 'analysis/dimAnalysisTheme',
        payload: {
          appId,
        }
      }).then(() => {
        const { getThemeData } = this.props.analysis;
        getThemeData.map((item) => {
          if (item.themeId === themeId) {
            this.setState({ url: item.urlContent, });
          }
        });
      });

      // 获取指标
      this.props.dispatch({
        type: 'analysis/dimAnalysisMeasures',
        payload: {
          appId,
          themeId,
        }
      }).then(() => {
        let { measure } = this.props.analysis;
        this.setState({ measure });
      }).catch((e) => {
        message.warn(e.message || '查无数据');
      });

      // 获取统计时间周期
      this.props.dispatch({
        type: 'analysis/getTimePeriod',
        payload: {
          appId,
          themeId,
        }
      }).then(() => {
        const { getTimePeriodData } = this.props.analysis;
        this.setState({ getTimePeriodData, });
      }).catch((e) => {
        message.warn(e.message || '查无数据');
      });

      // 获取过滤维度
      this.props.dispatch({
        type: 'analysis/dimAnalysisFilterDimensions',
        payload: {
          appId,
          themeId,
        }
      }).then(() => {
        const { dimension } = this.props.analysis;
        let dimensionAttrCode = [];
        this.setState({ dimension, });
        // 查询出来的维度 往过滤器添加元素
        if (dimension.length > 0) {
          for (const i in dimension) {
            const list = {
              value: dimension[i].dimColumn + '+' + dimension[i].dimDesc + '+' + dimension[i].dimTable,
              label: dimension[i].dimDesc,
              isLeaf: false,
            };
            dimensionAttrCode.push(list);
          }
          this.setState({ options: dimensionAttrCode });
        }
      }).catch((e) => {
        message.warn(e.message || '查无数据');
      });
    }
  }

  // 数据回显
  reloadData(data, isPar) {
    if (data.commonAnalysisConfig !== undefined) {
      // 下面这个循环为清空分析维度的值
      const dimObj = this.Dimensions.props.form.getFieldsValue();
      for (let i in dimObj) {
        if (i.indexOf('customDim') !== -1) this.Dimensions.props.form.setFieldsValue({ [i]: '' })
      }
      const searchData = JSON.parse(data.commonAnalysisConfig);
      console.log(searchData)

      // 回显统计周期
      if (searchData.statitime.cycle !== undefined) {
        this.props.form.setFieldsValue({ cycleTime: `${searchData.statitime.cycle}` });
      }

      // 回显统计时间
      if (searchData.statitime.timeSegment !== undefined) {
        this.setState({ timeUuid: searchData.statitime.timeSegment.length });
        const keys = this.props.form.getFieldValue('timekeys');
        for (const i in searchData.statitime.timeSegment) {
          const leftTime = `leftTime${keys[i]}`;
          const rightTime = `rightTime${keys[i]}`;
          setTimeout(() => {
            this.props.form.setFieldsValue({
              [leftTime]: moment(searchData.statitime.timeSegment[i].leftValue, 'YYYY-MM-DD'),
              [rightTime]: moment(searchData.statitime.timeSegment[i].rightValue, 'YYYY-MM-DD'),
            });
          }, 400);
        }
      }

      // 回显过滤器
      if (isPar === '0') {
        if (searchData.filter !== undefined) {
          const keys = this.props.form.getFieldValue('keys');
          if (searchData.filter.length === 0) {
            this.setState({ uuid: 1 });
          } else {
            this.setState({ uuid: searchData.filter.length });
          }
          for (const i in searchData.filter) {
            // 回显左边的值
            let fileterLetKey = `selectDim${keys[i]}`;
            if (this.state.dimension.length > 0) {
              const dimension = this.state.dimension;
              for (const j in dimension) {
                if (dimension[j].dimDesc === searchData.filter[i].name) {
                  if (searchData.filter[i].context.length > 0) {
                    // 这里把filterTotalName赋值为数组大于1的值 是因为回写的时候 如果有多个选择框选择了一样的维度 
                    // 避免重新点击其中一个选择框时 清空了其他选择框的回写值 
                    const filterTotalName =
                      [dimension[j].dimColumn + '+' + dimension[j].dimDesc + '+' + dimension[j].dimTable, dimension[j].dimColumn + '+' + searchData.filter[i].context[0].name + '+' + dimension[j].dimTable];
                    setTimeout(() => {
                      this.props.form.setFieldsValue({ [fileterLetKey]: filterTotalName });
                    }, 200);
                  }
                }
              }
            }
            // 回写右边的值
            const filterContext = [];
            const fileKey = `dimensionArr${keys[i]}`;
            searchData.filter[i].context.map((item) => {
              filterContext.push(item.name);
            });
            const totalName = searchData.filter[i].name;
            setTimeout(() => {
              this.props.form.setFieldsValue({ [fileKey]: filterContext });
            }, 200);
          }
        }
      }

      let tempMeasures = [];
      // 回显指标
      if (searchData.measure !== undefined) {
        let measureName = [];
        for (const i in searchData.measure) {
          measureName.push(searchData.measure[i].name);
          tempMeasures.push(searchData.measure[i].value);
        }
        this.props.form.setFieldsValue({ measure: measureName });
      }

      //获取选择维度
      this.props.dispatch({
        type: 'analysis/getDimensions',
        payload: {
          measures: tempMeasures,
          appId: this.state.appId,
          themeId: this.state.themeId
        }
      }).then(() => {
        const { getDimensions } = this.props.analysis;
        this.setState({ getDimensions, });
      });

      // 回显分析维度
      if (searchData.dimension !== undefined) {
        for (var j = 0; j < searchData.dimension.length; j++) {
          let dataArr = [], groupName = [];
          if (searchData.dimension[j].custom !== undefined) {
            searchData.dimension[j].custom.map((item) => {
              let dataItem = [];
              if (item.context !== undefined) {
                for (var i = 0; i < item.context.length; i++) { // -----------
                  dataItem.push(item.context[i].name + '+' + item.context[i].value)
                }
              }
              dataArr.push(dataItem);
              groupName.push(item.groupName);
            });
          }
          // 回显自定义维度分组卡片显示
          dataArr.map((item, index) => {
            const list = {
              title: searchData.dimension[j].name + '+' + groupName[index],
              dataItem: item,
              dimColumn: searchData.dimension[j].custom[0].context[0].field,
              dimTable: searchData.dimension[j].custom[0].context[0].dimTable,
              dimLevel: searchData.dimension[j].custom[0].context[0].dimLevel,
            }
            this.state.customGroupData.push(list)
          })
        }

        // 回显自定义维度分组table显示的list
        setTimeout(() => {
          let getDimensions = this.state.getDimensions;
          if (getDimensions.length > 0) {
            getDimensions.map((i, index) => {
              for (var k = 0; k < searchData.dimension.length; k++) {
                if (i.dimTotalName === searchData.dimension[k].name) {
                  let result = [];
                  const item = {
                    name: searchData.dimension[k].name,
                    value: i.tableDesc[0].columnValue, // 在这里用this.state.getDimensions 是因为分组维度的时候第一次请求需要用columnValue参数
                    appId: this.state.appId,
                    themeId: this.state.themeId,
                    result: this.state.customGroupData.filter(item => item.title.split('+')[0] === searchData.dimension[k].name),
                    dimTable: i.dimTable
                  }
                  this.state.dimensionGroup.push(item);

                  // 回显勾选和下拉选择结果
                  const fileKey = `customDim${index}`
                  if (searchData.dimension[k].hierarchy !== undefined) {
                    const fileValue = searchData.dimension[k].hierarchy.field + '-' + searchData.dimension[k].hierarchy.value + '-' + searchData.dimension[k].hierarchy.name + '-' + searchData.dimension[k].name;
                    this.props.form.setFieldsValue({ [fileKey]: fileValue });
                  } else if (searchData.dimension[k].custom !== undefined) {
                    const fileValue = i.tableDesc[0].columnValue + '-' + '自定义分组' + '-' + searchData.dimension[k].name;
                    this.props.form.setFieldsValue({ [fileKey]: fileValue });
                  }
                  const checkedItem = `checkbox${index}`;
                  this.props.form.setFieldsValue({ [checkedItem]: true })
                }
              }
            })
          }
        }, 400);
      }

      // 回显主维度
      if (searchData.mainDim !== undefined && searchData.dimension !== undefined) {
        let temp = [];
        const selectCycle = this.props.form.getFieldValue('cycleTime');
        if (selectCycle !== '' && selectCycle !== undefined) {
          temp.push(`calc${selectCycle.split('-')[0]}` + '-' + `${selectCycle.split('-')[1]}`);
        }
        for (const i in searchData.dimension) {
          if (searchData.dimension[i].hierarchy !== undefined) { // 非自定义维度
            const item = searchData.dimension[i].hierarchy.field + '-' + searchData.dimension[i].name;
            temp.push(item);
          } else if (searchData.dimension[i].custom !== undefined) { // 自定义维度
            const item = searchData.dimension[i].custom[0].context[0].field + '-' + searchData.dimension[i].name;
            temp.push(item);
          }
        }
        this.setState({ selectOption: temp });
        setTimeout(() => {
          this.props.form.setFieldsValue({ mainDim: searchData.mainDim });
        }, 0);
      }
    }
  }

  componentWillReceiveProps(props) {
    // 当用户点击菜单栏的编辑公共默认按钮的时候发送请求，如果当前模块为可视化模块则替换当前模块数据
    // 判断条件为控制模块的个人默认和公共默认相互切换，同时没值的时候不执行，设定在SiderMenu.js文件
    const { companyCode, companyName } = this.props.analysis.getUserInfoData;
    if (!companyCode) return;
    if (!this.state.clickMode) return;
    const { editMode, visual, queryMode, queryConfigParam, appId, themeId } = this.state;
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
      publicMode = false;
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
      publicMode = true;
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
          this.reloadData(this.props.analysis[routeData], isPar)
          setTimeout(() => {
            this.submitForm();
          }, 400);
        } else {
          message.warn(`当前${msg}模板没有设置，请重新填写完后点击保存`);
        }
      })
      this.setState({ publicMode, clickMode: false })
      setTimeout(() => {
        this.setState({ clickMode: true })
      }, 300)
    }
  }

  // 指标全选
  onCheckAllChange = (e) => {
    this.setState({ selectOption: [] });
    let measureName = [], measureCode = [];
    let { measure } = this.props.analysis;
    for (const i in measure) {
      measureName.push(measure[i].attrName);
      measureCode.push(measure[i].attrCode);
    }
    if (e.target.checked) {
      this.props.form.setFieldsValue({ measure: measureName });
      //获取选择维度
      this.props.dispatch({
        type: 'analysis/getDimensions',
        payload: {
          measures: measureCode,
          appId: this.state.appId,
          themeId: this.state.themeId
        }
      }).then(() => {
        const { getDimensions } = this.props.analysis;
        this.setState({ getDimensions, });
      });
    } else {
      this.props.form.setFieldsValue({ measure: [] });
    }
    this.props.form.setFieldsValue({ mainDim: '' });
    this.setState({
      indeterminate: false,
      checkAll: e.target.checked,
      getDimensions: []
    });
  }

  // 选择指标
  onChangeMeasure = (checkedValues) => {
    this.setState({ alarmLevelList: checkedValues });
    const { measure } = this.props.analysis;
    const tempMeasures = [];
    if (measure.length > 0 && checkedValues.length > 0) {
      for (var i = 0; i < checkedValues.length; i++) {
        for (var j = 0; j < measure.length; j++) {
          if (checkedValues[i] === measure[j].attrName) {
            tempMeasures.push(measure[j].attrCode);
          }
        }
      }
      //获取选择维度
      this.props.dispatch({
        type: 'analysis/getDimensions',
        payload: {
          measures: tempMeasures,
          appId: this.state.appId,
          themeId: this.state.themeId
        }
      }).then(() => {
        const { getDimensions } = this.props.analysis;
        this.setState({ getDimensions, });
      });
    } else {
      this.setState({ getDimensions: [] });
      this.props.form.setFieldsValue({ mainDim: [] })
    }
  }

  // 分析维度区下拉选择
  handleChange = (value, label, tableName) => {
    this.props.form.setFieldsValue({ mainDim: '' });
    const tempDimensionName = [];
    if (value.split('-')[1] === '自定义分组') {
      if (this.state.dimensionGroup.length > 0) {
        this.setState({ dimensionModelVisible: true, dimensionLabel: label });
        this.state.dimensionGroup.map((i) => {
          tempDimensionName.push(i.name);
        });
        if (tempDimensionName.indexOf(label) === -1) {
          const item = {
            name: label,
            value: value.split('-')[0],
            appId: this.state.appId,
            themeId: this.state.themeId,
            result: [],
            dimTable: tableName,
          }
          this.state.dimensionGroup.push(item);
        }
      } else {
        this.setState({ dimensionModelVisible: true, dimensionLabel: label });
        const item = {
          name: label,
          value: value.split('-')[0],
          appId: this.state.appId,
          themeId: this.state.themeId,
          result: [],
          dimTable: tableName,
        }
        this.state.dimensionGroup.push(item);
      }
    }
  }

  //选择主维度
  changeItem = () => {
    const { getDimensions } = this.props.analysis;
    let temp = [];
    const selectCycle = this.props.form.getFieldValue('cycleTime');
    if (selectCycle !== '' && selectCycle !== undefined) {
      temp.push(`calc${selectCycle.split('-')[0]}` + '-' + `${selectCycle.split('-')[1]}`);
    }
    this.props.form.validateFields((err, values) => {
      if (getDimensions.length > 0) {
        for (const i in getDimensions) {
          if (values[`customDim${i}`] !== '' && values[`customDim${i}`] !== undefined) {
            if (values[`customDim${i}`].split('-')[1] !== '自定义分组') {
              const item = values[`customDim${i}`].split('-')[0] + '-' + values[`customDim${i}`].split('-')[3];
              temp.push(item)
            } else {
              this.state.customGroupData.map((j) => {
                let contextValue = [];
                let contextItem = {};
                if (values[`customDim${i}`].split('-')[2] === j.title.split('+')[0]) { // ---
                  const item = j.dimColumn + '-' + j.title.split('+')[0]; // ---
                  temp.push(item)
                }
              })
            }
          }
        }
      }
    });
    this.setState({ selectOption: temp });
  }

  // 选择过滤器元素
  onChange = (value, selectedOptions) => {
    if (value.length === 1) {
      this.setState({ filterItemArrValue: [] });
    } else {
      this.setState({ filterItemArrValue: value });
    }
    const keys = this.props.form.getFieldValue('keys');
    setTimeout(() => {
      // 避免同一个选择框出现多次操作选择不同维度的时候，筛选出来的结果糅合在一起
      for (var i = 0; i < keys.length; i++) {
        const valuekey = `dimensionArr${keys[i]}`;
        const item = this.props.form.getFieldValue(`selectDim${keys[i]}`);
        if (item !== undefined && item.length === 1 && value[0] === item[0]) {
          const list = this.props.form.getFieldValue(valuekey);
          let filterShowName = [...new Set(this.state.filterShowName)];
          let filterObj = [...new Set(this.state.filterObj)];
          for (var j = 0; j < list.length; j++) {
            for (var n = 0; n < filterShowName.length; n++) {
              if (list[j] === filterShowName[n]) {
                filterShowName.splice(n, 1);
              }
            }
            for (var k = 0; k < filterObj.length; k++) {
              if (list[j] === filterObj[k].split('+')[1]) {
                filterObj.splice(k, 1);
              }
            }
          }
          this.setState({ filterShowName, filterObj });
          this.props.form.setFieldsValue({ [valuekey]: [] });
        }
      }
    }, 400);

    if (selectedOptions.length === 1) {
      const dimColumn = selectedOptions[0].value.split('+')[0];
      const dimTable = selectedOptions[0].value.split('+')[2];
      this.props.dispatch({
        type: 'analysis/getDimensionContent',
        payload: {
          dimColumn,
          dimName: '',
          dimValue: '',
          themeId: this.state.themeId,
          appId: this.state.appId,
          dimTable,
        },
      }).then(() => {
        this.setState({ isLeaf: false });
      }).catch((e) => {
        if (e.code === 1) {
          this.setState({ isLeaf: true });
        }
      });
    } else {
      if (selectedOptions.length > 1) {
        const filterObj = [...new Set(this.state.filterObj)];
        setTimeout(() => {
          const keys = this.props.form.getFieldValue('keys');
          if (keys.length > 0) {
            let tempComItemArr = []; //存放相同维度的最低级元素
            for (var i = 0; i < keys.length; i++) {
              const item = this.props.form.getFieldValue(`selectDim${keys[i]}`);
              let dimCode = '';
              if (value !== undefined) { //获取当前元素所在维度的code;
                dimCode = value[0].split('+')[0];
              }
              const valuekey = `dimensionArr${keys[i]}`;
              if (value === item) {
                let k = `${keys[i]}`;
                const selectItem = item[item.length - 1]; // 点击对象 
                const tempItem = selectItem + '+' + k + '+' + dimCode; //这里加上k值 遍历数组filterObj 根据k值来放入相应的fileForm里去
                if (this.state.filterObj.length > 0) {
                  this.state.filterObj.push(tempItem);
                  this.state.filterShowName.push(tempItem.split('+')[1]);
                  this.state.filterObj.map((objItem) => { // 维度的元素根据层级比较来获取低层级的元素 比如 总部是第一层 深圳是第二层 这里的低层级指总部 高层级指深圳
                    // 从底层级元素向高层级点击，过滤底层及元素
                    if (objItem.split('+')[4] === value[value.length - 1].split('+')[4]
                      && k === objItem.split('+')[5] // 这里是避免多个选择框选择同一个维度时 同一维度里元素进行比较
                      && objItem.split('+')[3] < value[value.length - 1].split('+')[3]) {
                      tempComItemArr.push(objItem);
                    } else { // 前面选了高层级之后返回点击低层低元素，过滤底层级元素
                      if (objItem.split('+')[4] === value[value.length - 1].split('+')[4]
                        && k === objItem.split('+')[5] // 这里是避免多个选择框选择同一个维度时 同一维度里元素进行比较
                        && objItem.split('+')[3] > value[value.length - 1].split('+')[3]) {
                        const tempItem = value[value.length - 1] + '+' + objItem.split('+')[5] + '+' + objItem.split('+')[6];
                        tempComItemArr.push(tempItem);
                      }
                    }
                  });
                  for (var j = 0; j < this.state.filterObj.length; j++) { // 相同维度的元素去掉低层级元素 留下最高层级元素
                    for (var a = 0; a < tempComItemArr.length; a++) {
                      if (tempComItemArr[a] === this.state.filterObj[j]) {
                        this.state.filterObj.splice(j, 1);
                      }
                    }
                  };

                  let uniqueName = [...new Set(this.state.filterShowName)];
                  let uniqueObj = [...new Set(this.state.filterObj)];
                  this.props.form.setFieldsValue({
                    [valuekey]: uniqueName.filter((item) => {
                      for (const i in uniqueObj) {
                        if (valuekey.search(uniqueObj[i].split('+')[5]) != -1
                          && uniqueObj[i].split('+')[1] === item) {
                          return item
                        }
                      }
                    })
                  });
                } else { // 回写赋值
                  this.state.filterObj.push(tempItem);
                  this.state.filterShowName.push(tempItem.split('+')[1]);
                  this.props.form.setFieldsValue({
                    [valuekey]: [...new Set(this.state.filterObj)].map((item) => {
                      if (valuekey.search(item.split('+')[5] != -1)) {
                        return item.split('+')[1];
                      }
                    })
                  });
                }
              }
            }
          }
        }, 400);

        if (selectedOptions[selectedOptions.length - 1]) {
          const splitValue = selectedOptions[selectedOptions.length - 1].value;
          const payloadVlaue = splitValue.split("+");
          this.props.dispatch({
            type: 'analysis/getDimensionContent',
            payload: {
              dimColumn: payloadVlaue[0],
              dimName: payloadVlaue[1],
              dimValue: payloadVlaue[2],
              themeId: this.state.themeId,
              appId: this.state.appId,
              dimTable: payloadVlaue[4],
            },
          }).then(() => {
            this.setState({ isLeaf: false });
          }).catch((e) => {
            if (e.code === 1) {
              this.setState({ isLeaf: true });
            }
          });
        }
      }
    }
  }

  // 加在过滤器下一层数据
  loadData = (selectedOptions) => {
    let itemArr = [];
    let targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    setTimeout(() => {
      targetOption.loading = false;
      let { getDimensionContentData } = this.props.analysis;
      if (this.state.isLeaf === true) {
        this.setState({
          options: [...this.state.options],
        });
      } else {
        if (getDimensionContentData.length > 0) {
          for (const i in getDimensionContentData) {
            const item = {
              value: `${getDimensionContentData[i].dimColumn}+${getDimensionContentData[i].dimName}+${getDimensionContentData[i].dimValue}+${getDimensionContentData[i].dimLevel}+${getDimensionContentData[i].dimTable}`,
              label: `${getDimensionContentData[i].dimName}`,
              isLeaf: this.state.isLeaf,
            };
            itemArr.push(item);
          }
        }
        targetOption.children = itemArr;
        this.setState({
          options: [...this.state.options],
        });
      }
    }, 300);
  }

  reSetfilter = (filterShowName, filterObj) => {
    this.setState({ filterShowName, filterObj });
  }

  // 选择统计周期
  selectTime = (value) => {
    this.props.form.setFieldsValue({ mainDim: '' });
    this.setState({ cycle: value });
  }

  changeCycle = (e) => {
    this.props.form.setFieldsValue({ mainDim: '' });
  }

  // 生成图表
  submitForm = (e) => {
    // e.preventDefault();
    this.setState({ getFilterLevelData: [], position: '' });
    const { getDimensions, iapHomeData } = this.props.analysis;
    const { queryConfigParam } = this.state;
    const { commonAnalysisConfig } = this.props.analysis[queryConfigParam];
    this.props.form.validateFields((err, values) => {
      if (err) return;
      let searchData = [];
      const { clickCommalyData } = this.props.analysis;
      console.log(this.props.analysis[queryConfigParam]);
      console.log(clickCommalyData);
      if (clickCommalyData !== undefined && clickCommalyData.commonAnalysisConfig !== undefined) {
        searchData = JSON.parse(clickCommalyData.commonAnalysisConfig);
      }
      // else searchData = JSON.parse(commonAnalysisConfig);
      let isQuery = '1';
      let dimension = [], measure = [], filter = {}, customDimension = {}; // 选择维度 指标 过滤器 自定义维度
      let statitime = {}; // 统计时间
      let timeSegment = [];
      let mainDim = '', token = '';

      mainDim = values.mainDim;
      this.setState({ mainDim, });
      statitime = this.getStatiTime(values, 1);
      // 获取指标
      const measureListItem = [...new Set(this.state.measureList)];
      for (const i in values.measure) {
        for (const j in measureListItem) {
          if (measureListItem[j].split('-')[0] === values.measure[i]) {
            measure.push(measureListItem[j].split('-')[1])
          }
        }
      }
      if (measure.length === 0) {
        message.warn('请至少选择一个指标！');
        return;
      }
      this.setState({ echartsMeasure: measure });

      //过滤器
      const filterObj = [...new Set(this.state.filterObj)];
      for (const i in values.keys) {
        let filterValue = [];
        let filterList = {};
        let dimColumn = '';
        if (values[`selectDim${values.keys[i]}`] !== undefined
          && values[`selectDim${values.keys[i]}`].length > 0
          && values[`selectDim${values.keys[i]}`][1].split('+').length > 3) {
          const item = values[`selectDim${values.keys[i]}`][0];
          for (var j = 0; j < filterObj.length; j++) {
            if (Number(values.keys[i]) === Number(filterObj[j].split('+')[5])) {
              filterValue.push(filterObj[j].split('+')[2]);
              dimColumn = filterObj[j].split('+')[0];
            }
          }
          if (filterValue.length > 0) {
            filter[dimColumn] = [...new Set(filterValue)];
            this.state.getFilterLevelData.push(filter[dimColumn]); // 下钻时需要记录手动添加的filter元素
          }
        } else {
          if (searchData.filter !== undefined) {
            for (const j in searchData.filter) {
              if (values[`dimensionArr${values.keys[i]}`] !== undefined && values[`dimensionArr${values.keys[i]}`].length > 0) {
                const dimensionArr = values[`dimensionArr${values.keys[i]}`];
                if (searchData.filter[j].context.length > 0) {
                  const contextNameArr = [];
                  searchData.filter[j].context.map((item) => {
                    contextNameArr.push(item.name);
                  });
                  function isContained(contextNameArr, dimensionArr) { // 回写之后 删除元素之后 判断剩下的元素是否被包含于原先searchData.filter[j]的元素
                    if (!(contextNameArr instanceof Array) || !(dimensionArr instanceof Array)) return false;
                    var context = contextNameArr.toString();
                    for (var n = 0; n < dimensionArr.length; n++) {
                      if (context.indexOf(dimensionArr[n]) == -1) return false;
                    }
                    return true;
                  }
                  // 在这里多一次判断 如果同一个维度多次过滤选择 回写之后在不改的情况下 通过每个筛选的结果来判断对应哪一个searchData.filter
                  if (JSON.stringify(contextNameArr) === JSON.stringify(dimensionArr)) {
                    for (const k in dimensionArr) {
                      searchData.filter[j].context.map((item) => {
                        if (dimensionArr[k] === item.name) {
                          filterValue.push(item.value);
                        }
                      });
                    }
                    if (filterValue.length > 0) {
                      if (searchData.filter[j].context !== undefined && searchData.filter[j].context.length > 0) {
                        filter[searchData.filter[j].context[0].field] = [...new Set(filterValue)];
                        this.state.getFilterLevelData.push(filter[searchData.filter[j].context[0].field]);
                      }
                    }
                  } else {
                    const isFlag = isContained(contextNameArr, dimensionArr);
                    if (isFlag) {
                      for (const i in dimensionArr) {
                        if (contextNameArr.indexOf(dimensionArr[i]) > -1) {
                          searchData.filter[j].context.map((item) => {
                            if (dimensionArr[i] === item.name) {
                              filterValue.push(item.value);
                            }
                          });
                        }
                        if (filterValue.length > 0 && searchData.filter[j].context !== undefined && searchData.filter[j].context.length > 0) {
                          filter[searchData.filter[j].context[0].field] = [...new Set(filterValue)];
                          this.state.getFilterLevelData.push(filter[searchData.filter[j].context[0].field]);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      // 获取分析维度
      for (const i in getDimensions) {
        if (values[`customDim${i}`] !== '' && values[`customDim${i}`] !== undefined) {
          if (values[`customDim${i}`].split('-')[1] !== '自定义分组') {
            dimension.push(values[`customDim${i}`].split('-')[0]);
          } else {
            let customDim = {};
            let contextArr = [], groupName = [];
            let dimColumn = '';
            Array.from(new Set(this.state.customGroupData)).map((j) => {
              let contextValue = [];
              let contextItem = {};
              if (values[`customDim${i}`].split('-')[2] === j.title.split('+')[0]) { // ----
                dimColumn = j.dimColumn;
                j.dataItem.map((item, index) => { //每一个分组
                  contextValue.push(item.split('+')[1]); // -------
                });
                contextArr.push(contextValue);
                groupName.push(j.title.split('+')[1]); // -------
              }
            })
            // 自定义维度分组
            if (contextArr.length > 0) {
              let customArr = [];
              contextArr.map((item, i) => {
                let tempObj = {};
                const index = groupName[i];
                tempObj[index] = item;
                customArr.push(tempObj);
              });
              customDimension[dimColumn] = customArr;
            }
          }
        }
      }

      this.setState({ loadEcharts: true, filter, });
      if (iapHomeData.token !== undefined) {
        token = iapHomeData.token;
      }
      const payload = {
        dataUrl: this.state.url,
        token,
        themeId: this.state.themeId,
        appId: this.state.appId,
        dimension,
        customDimension,
        filter,
        measure,
        statitime,
        isQuery,
        mainDim,
      }
      console.log(measure);

      this.setState({ payload, });
      this.props.dispatch({
        type: 'analysis/getMeasureData',
        payload,
      }).then(() => {
        const { getMeasureData } = this.props.analysis;
        const parentNode = document.getElementById('chartBox');
        const newdiv = document.getElementById('newdiv');
        if (newdiv !== null) {
          parentNode.removeChild(newdiv); // 删除图形拖拽合并的div
        }
        if (getMeasureData.content !== null) {
          setTimeout(() => { // 防止echarts图表数据过大 延长加载时间
            if (this.state.echartsMeasure.length > 0) { // 清除拖拽合并后的样式
              this.state.echartsMeasure.map((i) => {
                const item = document.getElementById('idNameIs' + i);
                if (item !== null) {
                  item.style.position = '';
                  item.style.display = '';
                  item.style.top = '';
                }
              });
            }
            let parentNode = document.getElementById('chartBox');
            parentNode.style.height = 0 + 'px';
            this.setState({ loadEcharts: false, getMeasureData, downloadButFlag: true, clickXdataIsCycle: {}, showClickPreData: false });
          }, 2000);
        }
      }).catch((e) => {
        e.code === 1 ? message.warn(e.message) : message.warn(e.message);
        this.setState({ loadEcharts: false, getMeasureData: [] });
      });
    });
  }

  // 获取统计时间和周期
  getStatiTime = (values, flag) => {
    let statitime = {}; // 统计时间
    let timeSegment = [];
    if (values.timekeys.length > 0) {
      for (var i = 0; i < values.timekeys.length; i++) {
        const leftTime = `leftTime${values.timekeys[i]}`;
        const rightTime = `rightTime${values.timekeys[i]}`;
        const index = i + 1;
        if ((values[leftTime] !== null && values[leftTime] !== '' && values[leftTime] !== undefined) && (values[rightTime] !== null && values[rightTime] !== '' && values[rightTime] !== undefined)) {
          const leftTimeValue = new Date(values[leftTime].format("YYYY-MM-DD"));
          const rightTimeValue = new Date(values[rightTime].format("YYYY-MM-DD"));
          if (leftTimeValue > rightTimeValue) {
            message.warning(`第${index}个统计时间的[起始时间]不能大于[终止时间]`);
            return;
          } else {
            const list = {
              leftValue: values[leftTime].format("YYYY-MM-DD"),
              rightValue: values[rightTime].format("YYYY-MM-DD")
            }
            timeSegment.push(list);
          }
        }
      }
    }

    if (timeSegment.length > 0) {
      statitime['timeSegment'] = timeSegment;
    }

    const cycle = this.props.form.getFieldValue('cycleTime');
    if (cycle !== undefined && cycle !== '' && flag === 1) {
      statitime['cycle'] = cycle.split('-')[0];
    } else {
      statitime['cycle'] = cycle;
    }
    return statitime;
  }

  // 保存查询结果
  conserve = (e) => {
    if (this.state.analysisName !== '') {
      this.updateCommaly(e);
    } else {
      this.props.form.validateFields((err, values) => {
        if (values.measure.length === 0) {
          message.warn('请至少选择一个指标！');
          return
        }
        const statitime = this.getStatiTime(values, 2);
        this.setState({ modelVisible: true });
      });
    }
  }

  toTop = (e) => {
    e.preventDefault();
    document.getElementById('top').scrollTop = 0;
  }

  // 更新保存
  updateCommaly = (e) => {
    e.preventDefault();
    let searchData = [];
    const { clickCommalyData } = this.props.analysis;
    if (clickCommalyData !== undefined && clickCommalyData.commonAnalysisConfig !== undefined) {
      searchData = JSON.parse(clickCommalyData.commonAnalysisConfig);
    }
    this.conserveData(searchData, this.state.analyName, 'updateCommaly');
  }

  // 导出数据
  download = () => {
    const dataUrl = this.state.url;
    const token = this.state.token
    delete this.state.payload.dataUrl;
    delete this.state.payload.token;
    let payload = {};
    if (JSON.stringify(this.state.clickChartsFilter) !== '{}') { // 主维度是时间
      payload = {
        ...this.state.payload,
        filter: {
          ...this.state.clickChartsFilter
        },
      };
    } else {
      payload = {
        ...this.state.payload,
      };
    }
    let content;
    if (JSON.stringify(this.state.clickXdataIsCycle) !== '{}') { // 主维度是时间
      content = JSON.stringify(this.state.clickXdataIsCycle);
    } else {
      content = JSON.stringify(payload);
    }
    const measureNameCode = JSON.stringify(this.state.measureNameCode);

    var url = `${SERVER}/iap/dimAnalysis/downLoad`;
    var TargetFrame = document.createElement("iframe");
    TargetFrame.setAttribute("name", 'download_frame');
    TargetFrame.setAttribute("style", "display:none");
    document.body.appendChild(TargetFrame);

    var form = document.createElement("form");
    form.setAttribute("style", "display:none");
    form.setAttribute("target", "download_frame");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);

    var input1 = document.createElement("input");
    input1.setAttribute("type", "hidden");
    input1.setAttribute("name", "url");
    input1.setAttribute("value", dataUrl);
    form.appendChild(input1);

    var input2 = document.createElement("input");
    input2.setAttribute("type", "hidden");
    input2.setAttribute("name", "token");
    input2.setAttribute("value", token);
    form.appendChild(input2);

    var input3 = document.createElement("input");
    input3.setAttribute("type", "hidden");
    input3.setAttribute("name", "content");
    input3.setAttribute("value", content);
    form.appendChild(input3);

    var input4 = document.createElement("input");
    input4.setAttribute("type", "hidden");
    input4.setAttribute("name", "header");
    input4.setAttribute("value", measureNameCode);
    form.appendChild(input4);

    document.body.appendChild(form);
    form.submit();
  }

  onCancelDimModel = (e) => {
    const { getDimensions } = this.props.analysis;
    this.props.form.validateFields((err, values) => {
      for (var i = 0; i < getDimensions.length; i++) {
        if (values[`customDim${i}`] !== '') {
          for (var j = 0; j < this.state.dimensionGroup.length; j++) {
            if (JSON.stringify(this.state.dimensionGroup[j].result) === '[]' && values[`customDim${i}`] !== undefined
              && this.state.dimensionGroup[j].name === values[`customDim${i}`].split('-')[2]) {
              this.props.form.setFieldsValue({
                [`customDim${i}`]: `${getDimensions[i].tableDesc[0].columnValue + '-' + getDimensions[i].tableDesc[0].level + '-' + getDimensions[i].tableDesc[0].columnName + '-' + getDimensions[i].dimTotalName}`
              });
            }
          }
        }
      }
    });
    this.setState({ dimensionModelVisible: false });
  }

  // 保存查询结果命名确定
  onOkModel = (e) => {
    e.preventDefault();
    let searchData = [];
    const { clickCommalyData } = this.props.analysis;
    if (clickCommalyData !== undefined && clickCommalyData.commonAnalysisConfig !== undefined) {
      searchData = JSON.parse(clickCommalyData.commonAnalysisConfig);
    }
    let analysisName = document.getElementById('names').value;
    // let reg = /^[\u4E00-\u9FA5A-Za-z0-9_]{1,200}$/;
    if (analysisName === '') {
      message.warn('名称必填');
      return
    } else if (analysisName.length > 200) {
      message.warn('名称长度请控制在1-200个字以内');
      return;
    } else {
      this.conserveData(searchData, analysisName, 'addCommaly');
    }
  }

  // 保存模板
  saveMode = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      let searchData = [];
      const { clickCommalyData, getUserInfoData: { companyCode, companyName } } = this.props.analysis;
      if (clickCommalyData !== undefined && clickCommalyData.commonAnalysisConfig !== undefined) {
        searchData = JSON.parse(clickCommalyData.commonAnalysisConfig);
      }

      if (values.measure.length === 0) {
        message.warn('请至少选择一个指标！');
        return
      }
      const { commonAnalysisConfig } = this.setPostData(searchData, values);
      const { saveMode, themeId, appId, themeName, appName, publicMode } = this.state;
      const { dispatch, currentUser } = this.props;
      dispatch({
        type: `analysis/${saveMode}`,
        payload: {
          man: currentUser.principal.name,
          company: companyCode,
          companyName,
          themeId,
          appId,
          appName,
          themeName,
          iscommon: publicMode ? '1' : '0',
          commonAnalysisConfig: JSON.stringify(commonAnalysisConfig)
        }
      }).then(() => {
        message.success('保存成功，下次将引用该模板，详细模板管理请在个人工作台中的公共模板管理进行操作！')
      }).catch((e) => {
        message.warn(e.message);
      })
    })
  }

  // 保存查询和保存模板公共配置参数函数
  setPostData(searchData, values) {
    const { getDimensions, iapHomeData } = this.props.analysis;
    let statitime = {}; // 统计时间
    let mainDim = ''; //主维度
    let filter = [], dimension = [], measure = [], measureItem = []; // 过滤器、选择维度和指标
    statitime = this.getStatiTime(values, 2);
    mainDim = values.mainDim;
    const webParam = this.state.appId === 'cxpz' ? 'cxpz' : 'query';
    // 获取指标
    const measureListItem = [...new Set(this.state.measureList)];
    for (const i in values.measure) {
      for (const j in measureListItem) {
        if (measureListItem[j].split('-')[0] === values.measure[i]) {
          measureItem = { name: measureListItem[j].split('-')[0], value: measureListItem[j].split('-')[1] }
        }
      }
      measure.push(measureItem);
    }
    console.log(measure);


    // 获取过滤器
    const filterObj = [...new Set(this.state.filterObj)];
    for (const i in values.keys) {
      let filterContext = [];
      if (values[`selectDim${values.keys[i]}`] !== undefined && values[`selectDim${values.keys[i]}`][1].split('+').length > 3) {
        const item = values[`selectDim${values.keys[i]}`][0];
        for (var j = 0; j < filterObj.length; j++) {
          if (Number(values.keys[i]) === Number(filterObj[j].split('+')[5])) {
            const list = {
              field: filterObj[j].split('+')[0],
              name: filterObj[j].split('+')[1],
              value: filterObj[j].split('+')[2],
            }
            filterContext.push(list)
          }
        }
        if (filterContext.length > 0) {
          const filterList = {
            context: filterContext,
            value: item.split('+')[0],
            name: item.split('+')[1],
          };
          filter.push(filterList);
        }
      } else {
        if (searchData.filter !== undefined) {
          for (const j in searchData.filter) {
            if (values[`selectDim${values.keys[i]}`] !== undefined && values[`selectDim${values.keys[i]}`].length > 0
              && values[`selectDim${values.keys[i]}`][0].split('+')[1] === searchData.filter[j].name) {
              if (values[`dimensionArr${values.keys[i]}`] !== undefined && values[`dimensionArr${values.keys[i]}`].length > 0) {
                const dimensionArr = values[`dimensionArr${values.keys[i]}`];
                let context = [];
                for (const k in dimensionArr) {
                  searchData.filter[j].context.map((item) => {
                    if (dimensionArr[k] === item.name) {
                      context.push(item);
                    }
                  });
                }
                if (context.length > 0) {
                  const filterList = {
                    context: context,
                    value: searchData.filter[j].value,
                    name: searchData.filter[j].name,
                  };
                  filter.push(filterList);
                }
              }
            }
          }
        }
      }
    }
    // 获取分析维度
    for (const i in getDimensions) {
      if (values[`customDim${i}`] !== '' && values[`customDim${i}`] !== undefined) {
        if (values[`customDim${i}`].split('-')[1] !== '自定义分组') {
          const item = {
            name: values[`customDim${i}`].split('-')[3],
            hierarchy: {
              name: values[`customDim${i}`].split('-')[2],
              value: values[`customDim${i}`].split('-')[1],
              field: values[`customDim${i}`].split('-')[0]
            }
          }
          dimension.push(item);
        } else {
          let contextArr = [], groupName = [];
          let name = '';
          Array.from(new Set(this.state.customGroupData)).map((j) => {
            let contextListArr = [];
            let contextItem = {};
            if (values[`customDim${i}`].split('-')[2] === j.title.split('+')[0]) {
              name = values[`customDim${i}`].split('-')[2];
              j.dataItem.map((item, index) => { //每一个分组
                contextItem = {
                  name: item.split('+')[0],
                  value: item.split('+')[1],
                  field: j.dimColumn,
                  dimTable: j.dimTable,
                  dimLevel: j.dimLevel,
                }
                contextListArr.push(contextItem);
              });
              contextArr.push(contextListArr);
              groupName.push(j.title.split('+')[1]);
            } else {
              contextListArr.length = 0;
              contextItem = {};
            }
          });
          let customArr = [];
          if (contextArr.length > 0) {
            contextArr.map((item, i) => {
              const indexName = groupName[i];
              const list = {
                groupName: indexName,
                context: item,
              }
              customArr.push(list);
            });
            const item = {
              name: name,
              custom: customArr,
            }
            dimension.push(item);
          }
        }
      }
    }

    let commonAnalysisConfig = {
      themeId: this.state.themeId,
      appId: this.state.appId,
      dimension,
      filter,
      measure,
      statitime,
      mainDim,
    };
    return { commonAnalysisConfig, webParam };
  }

  conserveData = (searchData, analysisName, flag) => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const { commonAnalysisConfig, webParam } = this.setPostData(searchData, values);
      if (flag === 'addCommaly') {
        this.props.dispatch({
          type: 'analysis/addCommaly',
          payload: {
            analysisName,
            commonAnalysisConfig,
            man: this.state.man,
            appId: this.state.appId,
            themeId: this.state.themeId,
            webParam,
            appName: this.state.appName,
            themeName: this.state.themeName,
          }
        }).then(() => {
          this.setState({ modelVisible: false });
          message.success('保存成功，可在个人工作台查看！')
        }).catch((e) => {
          message.warn(e.message);
        });
      } else {
        this.props.dispatch({
          type: 'analysis/updateCommaly',
          payload: {
            commonAnalysisConfig: JSON.stringify(commonAnalysisConfig),
            id: this.state.updateCommalyId,
            webParam,
          }
        }).then(() => {
        }).catch((e) => {
          message.warn(e.message);
        });
      }
    });
  }

  // 下钻
  clickChart = (object, xcode) => {
    let payload = {}, filter = {}, clickChartsFilter = {};
    if (JSON.stringify(this.state.payload) !== '{}') {
      payload = this.state.payload;
    }
    if (payload.mainDim.search('calc') === -1) { // 主维度不是时间的时候
      if (payload.mainDim !== undefined && payload.mainDim !== '') {
        filter[payload.mainDim] = xcode;
      }
      clickChartsFilter = {
        ...this.state.filter,
        ...filter
      }
    }
    console.log(this.state.filter);
    console.log(filter);
    let payloadData = {
      xdata: object.name,
      upAndDown: 'down',
      ...payload,
      token: this.state.token,
      dataUrl: this.state.url,
      filter: {
        ...this.state.filter,
        ...filter,
      },
    }
    this.setState({ loadEcharts: true });
    this.props.dispatch({
      type: 'analysis/getMeasureData',
      payload: payloadData,
    }).then(() => {
      const { getMeasureData, getDimensions } = this.props.analysis;
      const getDimensionAndMainDim = this.getDimensionAndMainDim(getMeasureData, getDimensions);
      let payload = {};
      if (getDimensionAndMainDim.mainDim.search('calc') !== -1) { // 主维度是时间的时候
        payload = {
          ...this.state.payload,
          ...getDimensionAndMainDim,
          statitime: {
            ...this.state.payload.statitime,
            cycle: getDimensionAndMainDim.mainDim.substring(4)
          }
        };
        this.setState({ clickXdataIsCycle: payloadData });
      } else {
        this.state.getFilterLevelData.push(filter);
        this.setState({ clickChartsFilter });
        payload = {
          ...this.state.payload,
          ...getDimensionAndMainDim,
        };
      }
      this.setState({ loadEcharts: false, showClickPreData: true, getMeasureData, payload, mainDim: getMeasureData.mainDim });
    }).catch((e) => {
      message.warn(e.message)
      this.setState({ loadEcharts: false });
    });
  }

  // 下钻之后返回上一层
  returnData = () => {
    this.setState({ loadEcharts: true });
    const getFilterLevelData = Array.from(new Set(this.state.getFilterLevelData));
    let filter, payload, clickChartsFilter;
    if (this.state.payload.mainDim.search('calc') === -1) { // 主维度不是时间的时候
      if (getFilterLevelData.length > 0) {
        getFilterLevelData.pop();
      }
      if (getFilterLevelData.length > 0) {
        filter = getFilterLevelData[getFilterLevelData.length - 1];
      } else {
        filter = {};
      }
      clickChartsFilter = {
        ...this.state.filter,
        ...filter
      }
      payload = {
        ...this.state.payload,
        token: this.state.token,
        dataUrl: this.state.url,
        filter: {
          ...this.state.filter,
          ...filter,
        },
        upAndDown: 'up',
      }
    } else {
      payload = {
        ...this.state.payload,
        token: this.state.token,
        dataUrl: this.state.url,
        upAndDown: 'up',
      }
      this.setState({ clickXdataIsCycle: payload });
    }
    this.props.dispatch({
      type: 'analysis/getRetMeasureData',
      payload,
    }).then(() => {
      const { getRetMeasureData, getDimensions } = this.props.analysis;
      const getDimensionAndMainDim = this.getDimensionAndMainDim(getRetMeasureData, getDimensions);
      const payload = {
        ...this.state.payload,
        ...getDimensionAndMainDim,
      };
      this.setState({ payload, getFilterLevelData, clickChartsFilter, });
      this.setState({ getMeasureData: getRetMeasureData, loadEcharts: false });
    }).catch((e) => {
      e.code === 1 ? message.warn(e.message) : message.warn(e.message);
      this.setState({ showClickPreData: false, loadEcharts: false, clickXdataIsCycle: {}, });
    });
  }

  getDimensionAndMainDim = (getRetMeasureData, getDimensions) => {
    let temp = [], dimension = [];
    let mainDimName = '', index = '', mainDim = '';
    mainDim = getRetMeasureData.mainDim;
    for (const i in getDimensions) {
      const customDim = this.props.form.getFieldValue(`customDim${i}`);
      if (customDim !== '' && customDim !== undefined) {
        temp.push(customDim);
      }
    }
    // temp 是当前分析维度选择的层级
    temp.map((item) => {
      const mainDim = this.props.form.getFieldValue('mainDim');
      // 如果它是主维度的话 拿取维度名称 mainDimName 然后通过它改变最新层级元素
      if (item.split('-')[0] === mainDim) {
        mainDimName = item.split('-')[3];
      } else {
        // 如果它不是主维度的话 原来的值不变 放入数组
        dimension.push(item.split('-')[0]);
      }
    });
    for (const i in getDimensions) {
      // 通过返回的getRetMeasureData.mainDim 更新维度层级元素
      if (getDimensions[i].dimTotalName === mainDimName) {
        if (getRetMeasureData.mainDim !== undefined && getRetMeasureData.mainDim !== '') {
          getDimensions[i].tableDesc.map((item) => {
            if (item.columnValue === getRetMeasureData.mainDim) {
              const value = item.columnValue;
              dimension.push(value);
            }
          });
        }
      }
    }
    const data = {
      dimension,
      mainDim,
    }
    return data;
  }

  //隐藏'返回上一层'按钮
  hiddenClickPreDataBtn = () => {
    if (this.state.showClickPreData) {
      this.setState({ showClickPreData: false });
    }
  }

  renderForm() {
    const { loading, form: { getFieldDecorator, getFieldValue } } = this.props;
    const { getApplicationData, getThemeData, getUserInfoData, getDimensionContentData } = this.props.analysis;
    let { clickCommalyData } = this.props.analysis;
    let { getDimensions, measure, getTimePeriodData, dimension, publicMode } = this.state;
    let dimensionArr = [], tempArr = [], searchData = [];
    let indexAnalyze = '';

    if (clickCommalyData !== undefined && clickCommalyData.commonAnalysisConfig !== undefined) {
      searchData = JSON.parse(clickCommalyData.commonAnalysisConfig);
    }
    Array.from(new Set(this.state.selectOption)).map((item) => {
      const optionItem = (
        <Option value={item.split('-')[0]} key={item.split('-')[0]}>
          {item.split('-')[1]}
        </Option>
      );
      tempArr.push(optionItem);
    });

    return (
      <Form layout="inline">
        <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6']}>
          <Panel header="统计周期和时间" key="1">
            <CycleAndTime root={this} getTimePeriodData={getTimePeriodData} searchData={searchData} {...this.props} />
          </Panel>
          <Panel header="筛选数据维度" key="2">
            <Filter root={this} searchData={searchData} {...this.props} />
          </Panel>
          <Panel header="指标" key="3">
            <Measure root={this} measure={measure} {...this.props} />
          </Panel>
          <Panel header="分析维度" key="4">
            <Dimension wrappedComponentRef={(form) => this.Dimensions = form} root={this} getDimensions={getDimensions} {...this.props} />
          </Panel>
          <Panel header="主维度元素" key="5">
            <Spin spinning={this.state.onLoading}>
              <FormItem label='主维度元素'>
                {getFieldDecorator('mainDim', {
                  initialValue: '',
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 140, marginRight: 8 }} onFocus={this.changeItem} allowClear>
                    {tempArr.length > 0 ? tempArr.map(i => { return i }) : ''}
                  </Select>
                )}
              </FormItem>
            </Spin>
          </Panel>
        </Collapse>
        <div style={{ width: '100%', textAlign: 'left', marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <Button type="primary" onClick={this.submitForm}>生成图表</Button>
          <span>
            <Button type="primary" style={{ marginRight: 20 }} onClick={this.saveMode}>
              保存为{publicMode ? '个人模板' : '公共模板'}</Button>
            <Button type="primary"
              onClick={this.returnData}
              style={{ marginRight: 10, display: this.state.showClickPreData === true ? '' : 'none' }}>
              返回上一层
            </Button>
            <Button onClick={this.download} style={{ marginRight: 10, display: this.state.downloadButFlag === true ? '' : 'none' }}>导出数据</Button>
            <Button type="primary" onClick={e => this.conserve(e)}>保存查询</Button>
          </span>
        </div>
        <Modal
          visible={this.state.modelVisible}
          onOk={e => this.onOkModel(e)}
          onCancel={e => { this.setState({ modelVisible: false }) }}
          destroyOnClose={true}
          title='常用分析命名'
        >
          <div><span>名称</span><Input id='names' style={{ width: '60%', marginLeft: 10 }} /></div>
        </Modal>
        <Modal
          visible={this.state.dimensionModelVisible}
          onOk={e => this.onCancelDimModel(e)}
          onCancel={e => this.onCancelDimModel(e)}
          title='自定义维度分组配置'
          maskClosable={false}
          width={1000}
        >
          <ReaderDimensionForm
            {...this.props}
            root={this}
            optionsGroup={this.state.optionsGroup}
            dimensionGroup={this.state.dimensionGroup}
          />
        </Modal>
      </Form>
    )
  }

  toggleHover = () => {
    this.setState({ hover: !this.state.hover })
  }

  render() {
    const { measure } = this.props.analysis;
    const { selectOption, mainDim, getMeasureData } = this.state;
    const linkStyle = this.state.hover ? { width: 80, height: 32, } : { width: 40, height: 32, borderColor: '#40a9ff', color: '#40a9ff' };

    return (
      <PageHeaderLayout>
        <Card bordered={false} style={{ overflowY: 'scroll', height: '100%' }} id='top'>
          <div>
            {this.renderForm()}
            <Spin spinning={this.state.loadEcharts}>
              <ShowEcharts
                dataContent={getMeasureData}
                measure={this.state.echartsMeasure}
                measureData={measure}
                selectMainDimArr={selectOption}
                mainDim={mainDim}
                measureNameCode={this.state.measureNameCode}
                root={this}
              />
            </Spin>
          </div>
          <div style={{ position: 'fixed', top: '50%', zIndex: 99999999, right: 0 }}>
            <Button style={linkStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} onClick={e => this.toTop(e)}>{this.state.hover ? '回到顶部' : <span style={{ marginLeft: -7 }}>置顶</span>}</Button>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
