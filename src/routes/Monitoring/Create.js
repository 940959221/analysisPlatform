import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card, Form, Row, Col, Select, Input, Button, Modal, message, Spin, Collapse
} from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import ReaderDimensionForm from '../../components/ReaderDimensionForm';
import Measure from '../../components/Measure';
import Dimension from '../../components/Dimension';
import Filter from '../../components/Filter';
import AlarmLevel from './components/AlarmLevel';
import CycleAndTime from './components/CycleAndTime';
import AppAndTheme from './components/AppAndTheme';
import AlarmModel from './components/AlarmModel';
import moment from 'moment';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option

@Form.create()
@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine,
}))

export default class Create extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      alarmId: this.props.location.alarmId,
      operaType: this.props.location.operaType,
      flag: this.props.location.flag,
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
      options: [],
      customGroupData: [], // 存放所有的分组
      uuid: 1,
      onLoading: false,
      searchDimension: [], // 回显的分析维度
      indexAnalyId: [],
      idName: [],
      searchData: {},
      measureAllSel: 0, // 是否显示指标全选
      isRequertUrl: 'mine/getDimensionContent',
      modelType: 'mine',
      isCuston: true, //是否需要自定义分组
      filterOptionHasTime: false, // 过滤器维度是否有时间维度
      dimensionSelectDisable: false, //分析维度置灰
      isSpecialCreate: false,
    };
  };

  // 回显信息后 离开界面 清空界面内容
  componentWillMount() {
    Object.keys(this.props.mine).map((item) => {
      if (item === 'searchData') {
        delete this.props.mine[item]
      }
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.props.dispatch({
      type: 'mine/iapHomeGetApplication',
      payload: []
    }).then(() => {
      const { iapHomeData } = this.props.mine;
      const appIds = [];
      iapHomeData.apps.map((item) => {
        appIds.push(item.appId)
      })
      dispatch({
        type: 'mine/getApplication',
        payload: appIds
      });
    });

    dispatch({
      type: 'mine/getUserInfo'
    });

    if (this.state.operaType !== undefined && this.state.alarmId !== undefined) {
      dispatch({
        type: 'mine/searchProduct',
        payload: {
          alarmId: this.state.alarmId,
          operateType: this.state.operaType,
        }
      }).then(() => {
        const { searchData } = this.props.mine;
        this.setState({ appId: searchData.appId.value, themeId: searchData.themeId.value, searchData, });
        // 获取指标
        this.props.dispatch({
          type: 'mine/getMeasures',
          payload: {
            appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
            themeId: searchData.themeId !== undefined ? searchData.themeId.value : this.state.themeId,
          }
        }).then(() => {
          let { measure } = this.props.mine;
          this.setState({ measure });
        });

        let tempMeasures = [], checkedValues = [];
        // 获取分析维度
        if (searchData.measure !== undefined) {
          searchData.measure.map((i) => {
            tempMeasures.push(i.value);
            checkedValues.push(i.name);
          })
        }

        this.props.dispatch({
          type: 'mine/getDimensions',
          payload: {
            measures: tempMeasures,
            appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
            themeId: searchData.themeId !== undefined ? searchData.themeId.value : this.state.themeId
          }
        }).then(() => {
          const { getDimensions } = this.props.mine;
          this.setState({ getDimensions, });
        });

        // 获取统计时间周期
        this.props.dispatch({
          type: 'mine/getTimePeriod',
          payload: {
            appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
            themeId: searchData.themeId !== undefined ? searchData.themeId.value : this.state.themeId,
          }
        }).then(() => {
          const { getTimePeriodData } = this.props.mine;
        }).catch((e) => {
          message.warn(e.message || '查无数据');
        });

        // 获取过滤维度
        this.props.dispatch({
          type: 'mine/getFilterDimensions',
          payload: {
            appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
            themeId: searchData.themeId !== undefined ? searchData.themeId.value : this.state.themeId,
          }
        }).then(() => {
          const { dimension } = this.props.mine;
          let dimensionAttrCode = [];
          this.setState({ dimension, });
          // 查询出来的维度 往过滤器添加元素
          if (dimension.length > 0) {
            for (const i in dimension) {
              // if (dimension[i].dimDesc !== '机构') {
              const list = {
                value: dimension[i].dimColumn + '-' + dimension[i].dimDesc + '-' + dimension[i].dimTable,
                label: dimension[i].dimDesc,
                isLeaf: false,
              };
              dimensionAttrCode.push(list);
              // }
            }
            this.setState({ options: dimensionAttrCode });
          }
          // 回显过滤器
          if (searchData.filter !== undefined) {
            const keys = this.props.form.getFieldValue('keys');
            if (searchData.filter.length === 0) {
              this.setState({ uuid: 1 });
            } else {
              this.setState({ uuid: searchData.filter.length });
            }
            const { dimension } = this.props.mine;
            // this.setState({uuid: searchData.filter.length});
            for (const i in searchData.filter) {
              let fileterLetKey = `selectDim${keys[i]}`;
              if (dimension.length > 0) {
                for (const j in dimension) {
                  if (dimension[j].dimDesc === searchData.filter[i].name) {
                    if (searchData.filter[i].context.length > 0) {
                      // 这里赋值为数组大于1的值 是因为回写的时候 如果有多个选择框选择了一样的维度 避免重新点击其中一个维度时 清空了其他选择框的回写值 
                      const filterTotalName =
                        [dimension[j].dimColumn + '-' + dimension[j].dimDesc + '-' + dimension[j].dimTable, dimension[j].dimColumn + '-' + searchData.filter[i].context[0].name + '-' + dimension[j].dimTable];
                      setTimeout(() => {
                        this.props.form.setFieldsValue({ [fileterLetKey]: filterTotalName });
                      }, 400);
                    }
                  }
                }
              }
              const filterContext = [];
              const fileKey = `dimensionArr${keys[i]}`;
              searchData.filter[i].context.map((item) => {
                filterContext.push(item.name);
              });
              setTimeout(() => {
                this.props.form.setFieldsValue({ [fileKey]: filterContext });
              }, 400);
            }
          }
        });

        // 回显指标
        if (searchData.measure !== undefined) {
          let measureName = [];
          for (const i in searchData.measure) {
            measureName.push(searchData.measure[i].name);
          }
          this.props.form.setFieldsValue({ measure: measureName });
        }
        // 回显分析维度
        if (searchData.dimension !== undefined) {
          for (var j = 0; j < searchData.dimension.length; j++) {
            let dataArr = [], groupName = [];
            if (searchData.dimension[j].custom !== undefined) {
              searchData.dimension[j].custom.map((item) => {
                let dataItem = [];
                if (item.context !== undefined) {
                  for (var i = 0; i < item.context.length; i++) {
                    dataItem.push(item.context[i].name + '-' + item.context[i].value)
                  }
                }
                dataArr.push(dataItem);
                groupName.push(item.groupName);
              });
            }
            // 回显自定义维度分组卡片显示
            dataArr.map((item, index) => {
              const list = {
                title: searchData.dimension[j].name + '-' + groupName[index],
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
                  let dataItem = [];
                  if (i.dimTotalName === searchData.dimension[k].name) {
                    let result = [];
                    const item = {
                      name: searchData.dimension[k].name,
                      value: i.tableDesc[0].columnValue, // 在这里用this.state.getDimensions 是因为分组维度的时候第一次请求需要用columnValue参数
                      appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
                      themeId: searchData.themeId !== undefined ? searchData.themeId.value : this.state.themeId,
                      result: this.state.customGroupData.filter(item => item.title.split('-')[0] === searchData.dimension[k].name),
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

        // 回显告警等级
        if (searchData.indexAnalyze !== undefined) {
          for (const i in searchData.indexAnalyze) {
            this.state.alarmLevelList.push(searchData.indexAnalyze[i].name)
          }
          this.setState({ indexAnalyze: searchData.indexAnalyze });
        }

        // 回显统计周期
        if (searchData.cycle !== undefined) {
          this.props.form.setFieldsValue({ cycle: `${searchData.cycle}` });
        }
      });
    }
  }

  // 提交
  submitForm = (e) => {
    e.preventDefault();
    let { searchData, getDimensions } = this.props.mine;
    if (searchData === undefined) {
      searchData = {};
    }
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (this.state.alarmLevelList.length === 0) {
        message.warn('[指标]至少选择一个');
        return;  // 校验选择的指标个数
      }
      const { getUserInfoData } = this.props.mine;
      let alarmName = values.alarmName;
      let appId = { name: values.appId.split('-')[1], value: values.appId.split('-')[0] }; //选择应用
      let themeId = { name: values.themeId.split('-')[1], value: values.themeId.split('-')[0] }; //选择主题
      let filter = [], dimension = [], measure = [], measureItem = []; // 过滤器，选择维度和指标
      let sendType = { name: values.sendType.split('-')[1], value: values.sendType.split('-')[0] }; // 发送方式
      let man = getUserInfoData.domain; // 用户名
      let operateType = this.state.flag === 1 ? 'u' : 'c'; // 操作类型
      let alarmId = this.props.location.alarmId ? searchData.alarmId : '';
      let createTime = this.props.location.alarmId ? searchData.createTime : '';
      let alarmTemplate = this.props.location.alarmId ? searchData.alarmTemplate : '';
      let timeFrame = {}, cycle = ''; // 统计时间和周期

      if (values.cycle !== undefined && values.cycle !== '') {
        cycle = values.cycle;
      } else {
        cycle = '';
      }
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
      // 获取统计时间
      if ((values.leftTime === '' || values.leftTime === null) || (values.rightTime === '' || values.rightTime === null)) {
        message.warn('[统计时间]必选');
        return;
      } else {
        timeFrame = {
          leftValue: values.leftTime.format("YYYY-MM-DD"),
          rightValue: values.rightTime.format("YYYY-MM-DD")
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
              if (values[`customDim${i}`].split('-')[2] === j.title.split('-')[0]) {
                name = values[`customDim${i}`].split('-')[2];
                j.dataItem.map((item, index) => { //每一个分组
                  contextItem = {
                    name: item.split('-')[0],
                    value: item.split('-')[1],
                    field: j.dimColumn,
                    dimTable: j.dimTable,
                    dimLevel: j.dimLevel,
                  }
                  contextListArr.push(contextItem);
                });
                contextArr.push(contextListArr);
                groupName.push(j.title.split('-')[1]);
              } else {
                contextListArr.length = 0;
                contextItem = {};
              }
            })
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

      //过滤器
      /*
      **此处的split('++')参照本js里面loadData方法的注释
      */
      const dimensionArr = [];
      const filterObj = [...new Set(this.state.filterObj)];
      for (const i in values.keys) {
        let filterContext = [];
        if (values[`selectDim${values.keys[i]}`] !== undefined && values[`selectDim${values.keys[i]}`].length > 1) {
          if (values[`selectDim${values.keys[i]}`][1].split('++').length > 3) {
            const item = values[`selectDim${values.keys[i]}`][0];
            dimensionArr.push(item);
            for (var j = 0; j < filterObj.length; j++) {
              // if (item.split('-')[0].search(filterObj[j].split('-')[filterObj[j].split('-').length -1]) != -1) {
              if (Number(values.keys[i]) === Number(filterObj[j].split('++')[4].split('-')[1])) {
                const list = {
                  field: filterObj[j].split('++')[0],
                  name: filterObj[j].split('++')[1],
                  value: filterObj[j].split('++')[2],
                }
                filterContext.push(list)
              }
            }
            const filterList = {
              context: filterContext,
              value: item.split('-')[0],
              name: item.split('-')[1],
            };
            filter.push(filterList);
          }
        }
        // 获取回写的值
        if (searchData.filter !== undefined) {
          for (const j in searchData.filter) {
            if (values[`selectDim${values.keys[i]}`] !== undefined && values[`selectDim${values.keys[i]}`].length > 0
              && values[`selectDim${values.keys[i]}`][0].split('-')[1] === searchData.filter[j].name) {
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
      if (searchData.appId !== undefined) {
        if (values.appId === searchData.appId.name) {
          appId = searchData.appId
        }
      }
      if (searchData.themeId !== undefined) {
        if (values.themeId === searchData.themeId.name) {
          themeId = searchData.themeId
        }
      }
      let indexAnalyze = []; // 告警等级
      for (const i in measure) {
        const divDom = document.getElementById(`${measure[i].value}`);
        const context = [];
        for (var j = 0; j < divDom.childNodes.length; j++) {
          const contextItem = {
            type: divDom.childNodes[j].id,
            leftValue: divDom.childNodes[j].childNodes[2].innerText === '∞' ? '-' : divDom.childNodes[j].childNodes[2].innerText,
            rightValue: divDom.childNodes[j].childNodes[4].innerText === '∞' ? '-' : divDom.childNodes[j].childNodes[4].innerText,
          }
          context.push(contextItem)
        }
        if (context.length > 0) {
          const indexAnalyzeItem = {
            context: context,
            value: measure[i].value,
            name: measure[i].name,
          }
          indexAnalyze.push(indexAnalyzeItem);
        } else {
          message.warn(`请确认所选的指标都设置了[告警等级]`);
          return;
        }
      }
      let receiver;
      if (values.receiver !== '' && values.receiver !== undefined) {
        const reg = /^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}\;))*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/;
        if (reg.test(values.receiver)) {
          receiver = values.receiver;
        } else {
          message.warn(`请填写正确的邮箱地址`);
          return;
        }
      } else {
        message.warn(`请填写[接受地址]`);
        return;
      }

      this.props.dispatch({
        type: 'mine/createProduct',
        payload: {
          alarmId,
          alarmName,
          alarmTemplate,
          appId,
          createTime,
          dimension,
          filter,
          man,
          measure,
          receiver,
          sendType,
          themeId,
          indexAnalyze,
          operateType,
          timeFrame,
          cycle,
          webParam: '/getresult/monitoring/create',
        }
      }).then(() => {
        this.setState({ onLoading: true, flag: 0 });
        setTimeout(() => {
          this.setState({ onLoading: false });
        }, 200);
        this.props.form.resetFields();
        this.setState({
          measure: [], dimension: [], alarmLevelList: [], filterList: [], getDimensions: [], dimensionList: [],
          measureList: [], filterDimName: [], tempFilterName: [], filterShowName: [], filterObj: [], dimensionGroup: [],
          indexAnalyze: [], optionsGroup: [], customGroupData: [], timeFrame: [], indexAnalyId: [], idName: [], searchData: {}
        });
        this.props.form.setFieldsValue({
          themeId: '', appId: '', alarmName: '', receiver: '', selDimResult: [], keys: [0], timeFrame: [],
          leftTime: '', rightTime: ''
        });
      }).catch((e) => {
        if (e.code === 1) {
          message.warn(e.message)
        } else {
          message.warn(e.message);
        }
      });
    });
  }

  handleFormReset = () => {
    this.props.form.resetFields();
  }

  // 选择应用
  selApplicationItem = (value) => {
    this.props.form.setFieldsValue({ themeId: '' });
    const optionsVlaue = value.split('-')[0];
    this.setState({
      appId: optionsVlaue,
      measure: [],
      dimension: [],
    });
    this.props.dispatch({
      type: 'mine/getTheme',
      payload: {
        appId: optionsVlaue,
      }
    });
  }

  // 选择主题
  selThemeItem = (value) => {
    const keys = this.props.form.getFieldValue('keys');
    for (var i = 0; i < keys.length; i++) {
      const dimensionkey = `dimensionArr${keys[i]}`;
      const selectDimnsion = `selectDim${keys[i]}`;
      this.props.form.setFieldsValue({ [dimensionkey]: [], [selectDimnsion]: [] });
    }
    this.props.form.setFieldsValue({ measure: [], keys: [0] });
    let { searchData } = this.props.mine;
    if (searchData === undefined) {
      searchData = {};
    }
    const optionsVlaue = value.split('-')[0];
    this.setState({
      alarmLevelList: [], themeId: optionsVlaue,
      options: [], filterShowName: [], filterObj: [], dimensionGroup: [], optionsGroup: [], uuid: 1
    });
    // 获取指标
    this.props.dispatch({
      type: 'mine/getMeasures',
      payload: {
        appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
        themeId: optionsVlaue,
      }
    }).then(() => {
      let { measure } = this.props.mine;
      this.setState({ measure });
    }).catch((e) => {
      if (e.code === 1) {
        this.setState({
          measure: [],
          dimension: [],
          alarmLevelList: [],
          filterList: [],
          optionsGroup: [],
        });
      }
    });

    // 获取统计时间周期
    this.props.dispatch({
      type: 'mine/getTimePeriod',
      payload: {
        appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
        themeId: optionsVlaue,
      }
    }).then(() => {
      const { getTimePeriodData } = this.props.mine;
    }).catch((e) => {
      message.warn(e.message || '查无数据');
    });

    //获取选择维度
    this.props.dispatch({
      type: 'mine/getDimensions',
      payload: {
        appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
        themeId: optionsVlaue
      }
    }).then(() => {
      const { getDimensions } = this.props.mine;
      this.setState({ getDimensions, });
    })

    // 获取过滤维度
    this.props.dispatch({
      type: 'mine/getFilterDimensions',
      payload: {
        appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
        themeId: optionsVlaue,
      }
    }).then(() => {
      const { dimension } = this.props.mine;
      let dimensionAttrCode = [];
      this.setState({ dimension, });
      // 查询出来的维度 往过滤器添加元素
      if (dimension.length > 0) {
        for (const i in dimension) {
          // if (dimension[i].dimDesc !== '机构') {
          const list = {
            value: dimension[i].dimColumn + '-' + dimension[i].dimDesc + '-' + dimension[i].dimTable,
            label: dimension[i].dimDesc,
            isLeaf: false,
          };
          dimensionAttrCode.push(list);
          // }
        }
        this.setState({ options: dimensionAttrCode });
      }
    });
  }

  // 选择指标
  onChangeMeasure = (checkedValues) => {
    this.setState({ alarmLevelList: checkedValues });
    const { searchData, measure } = this.props.mine;
    const tempMeasures = [];
    if (measure.length > 0 && checkedValues.length > 0) {
      for (var i = 0; i < checkedValues.length; i++) {
        for (var j = 0; j < measure.length; j++) {
          if (checkedValues[i] === measure[j].attrName) {
            tempMeasures.push(measure[j].attrCode);
          }
        }
      }
    }
  }

  editAlarm = (e, codeValue) => {
    this.props.form.validateFields(err => {
      if (err) {
        message.warn('请先填好界面[红框或者红*]的必选项再进行设置');
        return;
      }
      const divDom = document.getElementById(`${codeValue}`);
      const context = [];
      if (divDom.childNodes.length > 0) {
        for (var j = 0; j < divDom.childNodes.length; j++) {
          const contextItem = {
            type: divDom.childNodes[j].id,
            leftValue: divDom.childNodes[j].childNodes[2].innerText === '∞' ? '-' : divDom.childNodes[j].childNodes[2].innerText,
            rightValue: divDom.childNodes[j].childNodes[4].innerText === '∞' ? '-' : divDom.childNodes[j].childNodes[4].innerText,
          }
          context.push(contextItem)
        }
      }
      // 回写表单
      setTimeout(() => {
        if (context.length > 0) {
          context.map((item) => {
            let startValue = `start${item.type}Value`;
            let endValue = `end${item.type}Value`;
            if (item.leftValue !== '-') {
              this.props.form.setFieldsValue({ [startValue]: Number(item.leftValue) });
            } else {
              this.props.form.setFieldsValue({ [startValue]: '' });
            }
            if (item.rightValue !== '-') {
              this.props.form.setFieldsValue({ [endValue]: Number(item.rightValue) });
            } else {
              this.props.form.setFieldsValue({ [endValue]: '' });
            }
          });
        }
      }, 100);
      this.setState({ alarmModelVisible: true, modelStatu: codeValue })
    })
  }

  onCancelAlarmModel = () => {
    this.setState({ alarmModelVisible: false });
  }

  onChange = (value, selectedOptions) => {
    const keys = this.props.form.getFieldValue('keys');
    setTimeout(() => {
      // 避免同一个选择框筛选出来的结果糅合多个维度元素
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
              if (list[j] === filterObj[k].split('++')[1]) {    // 此处问题详见下面loadData方法的注释
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
      const dimColumn = selectedOptions[0].value.split('-')[0];
      const dimTable = selectedOptions[0].value.split('-')[2];
      this.props.dispatch({
        type: 'mine/getDimensionContent',
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
        setTimeout(() => {
          const keys = this.props.form.getFieldValue('keys');
          if (keys.length > 0) {
            let tempComItemArr = []; //存放相同维度的最低级元素
            let tempComDimension = []; //临时存放相同维度的元素
            for (var i = 0; i < keys.length; i++) {
              const item = this.props.form.getFieldValue(`selectDim${keys[i]}`);
              let dimCode = '';
              if (value !== undefined) { //获取当前元素所在维度的code;
                dimCode = value[0].split('-')[0];
              }
              const valuekey = `dimensionArr${keys[i]}`;
              if (value === item) {
                let k = `${keys[i]}`;
                const selectItem = item[item.length - 1]; // 点击对象 
                const tempItem = selectItem + '-' + k + '-' + dimCode; //最后加上k值 遍历数组filterObj 根据k值来放入相应的fileForm里去
                if (this.state.filterObj.length > 0) {
                  this.state.filterObj.push(tempItem);
                  // this.state.filterObj.map((item) => {
                  //   if (item.split('-')[4] === value[value.length - 1].split('-')[4] && item.split('-')[3] < value[value.length - 1].split('-')[3]) {
                  //     tempComItemArr.push(item)
                  //   }
                  // });
                  // if (tempComDimension.length > 0) {
                  //   if (value[value.length - 1].split('-')[3] >= tempComDimension[tempComDimension.length - 1].split('-')[3]) {
                  //     this.state.filterObj.push(tempItem);
                  //     this.state.filterShowName.push(tempItem.split('-')[1]);
                  //   }
                  // } else {
                  //   this.state.filterObj.push(tempItem);
                  //   this.state.filterShowName.push(tempItem.split('-')[1]);
                  // }
                  // this.state.filterObj.push(tempItem);
                  this.state.filterShowName.push(tempItem.split('++')[1]);    // 此处问题详见下面loadData方法的注释
                  this.state.filterObj.map((item) => { // 维度的元素根据等级比较来获取低等级的元素 
                    // 从底层级元素向高层级点击，过滤底层及元素
                    const pub = item.split('++')[4];
                    if (pub.split('-')[0] === value[value.length - 1].split('++')[4]
                      && k === pub.split('-')[1] // 这里是避免多个选择框选择同一个维度时 同一维度里元素进行比较 
                      && item.split('++')[3] < value[value.length - 1].split('++')[3]) {
                      tempComItemArr.push(item);
                    } else { // 前面选了高层级之后返回点击低层低元素，过滤底层级元素
                      if (pub.split('-')[0] === value[value.length - 1].split('++')[4]
                        && k === pub.split('-')[1] // 这里是避免多个选择框选择同一个维度时 同一维度里元素进行比较
                        && item.split('++')[3] > value[value.length - 1].split('++')[3]) {
                        const tempItem = value[value.length - 1] + '-' + pub.split('-')[1] + '-' + pub.split('-')[2];
                        tempComItemArr.push(tempItem);
                      }
                    }
                  });

                  for (var j = 0; j < this.state.filterObj.length; j++) { // 相同维度的元素去掉低等级元素 留下最高级元素
                    for (var a = 0; a < tempComItemArr.length; a++) {
                      /*
                      **此处再填锐豪的坑，只考虑到了向下层级的删除，没有考虑向上层级，这里增添，抱怨一下，你真是坑逼    2019-9-11  汪
                      */
                      // 判断pub_its的编号一致的情况，也就是同一个维度的情况下是不是选择了上面层级的维度，
                      // 考虑到可以添加过滤器，选择了上面层级的维度后需要过滤掉所有的该维度再进行添加，为了防止其他bug，这里使用break直接跳出
                      if (tempComItemArr[a].split('++')[4].split('-')[0] === this.state.filterObj[j].split('++')[4].split('-')[0]
                        && tempComItemArr[a].split('++')[3] < this.state.filterObj[j].split('++')[3]) {
                        this.state.filterObj = this.state.filterObj.filter(item =>
                          item.split('++')[4].split('-')[0] !== tempComItemArr[a].split('++')[4].split('-')[0]
                        )
                        this.state.filterObj.push(tempComItemArr[a])
                        break;
                      } else if (tempComItemArr[a] === this.state.filterObj[j]) this.state.filterObj.splice(j, 1);
                    }
                  };
                  let uniqueName = [...new Set(this.state.filterShowName)];
                  let uniqueObj = [...new Set(this.state.filterObj)];
                  this.props.form.setFieldsValue({ // 给每个维度框赋值
                    [valuekey]: uniqueName.filter((item) => {
                      for (const i in uniqueObj) {
                        if (valuekey.search(uniqueObj[i].split('++')[4].split('-')[1]) != -1
                          && uniqueObj[i].split('++')[1] === item) {     // 此处问题详见下面loadData方法的注释
                          return item;
                        }
                      }
                    })
                  });
                } else {
                  this.state.filterObj.push(tempItem);
                  this.state.filterShowName.push(tempItem.split('++')[1]);
                  this.props.form.setFieldsValue({
                    [valuekey]: [...new Set(this.state.filterObj)].map((item) => {
                      if (valuekey.search(item.split('++')[4].split('-')[1] != -1)) {
                        return item.split('++')[1];     // 此处问题详见下面loadData方法的注释
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
          const payloadVlaue = splitValue.split("++");    // 此处问题详见下面loadData方法的注释
          this.props.dispatch({
            type: 'mine/getDimensionContent',
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

  reSetfilter = (filterShowName, filterObj) => {
    this.setState({ filterShowName, filterObj });
  }

  loadData = (selectedOptions) => {
    let itemArr = [];
    let targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    setTimeout(() => {
      targetOption.loading = false;
      let { getDimensionContentData } = this.props.mine;
      if (this.state.isLeaf === true) {
        this.setState({
          options: [...this.state.options],
        });
      } else {
        if (getDimensionContentData.length > 0) {
          for (const i in getDimensionContentData) {
            const item = {
              /*
              **此处修改锐豪一个bug，此前连接的方式为‘-’，现改为++，该bug曾导致有数据中携带‘-’符号的会被split额外打散一次，
              **从而上面的onChange事件中会因此数据出现错误，例如筛选数据维度中的年龄下级有1-2年，其中就包括了‘-’符号，
              **此处修改仅针对于此界面的筛选数据维度的联级选择事件，其他未做修改   2019-9-10 汪
              */
              value: `${getDimensionContentData[i].dimColumn}++${getDimensionContentData[i].dimName}++${getDimensionContentData[i].dimValue}++${getDimensionContentData[i].dimLevel}++${getDimensionContentData[i].dimTable}`,
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

  handleChange = (value, label, tableName) => {
    const tempDimensionName = [];
    if (value.split('-')[1] === '自定义分组') {
      if (this.state.dimensionGroup.length > 0) {
        this.setState({ dimensionModelVisible: true, dimensionLabel: label });
        this.state.dimensionGroup.map((i) => {
          tempDimensionName.push(i.name);
        })
        if (tempDimensionName.indexOf(label) === -1) {
          const item = {
            name: label,
            value: value.split('-')[0],
            appId: this.state.appId,
            themeId: this.state.themeId,
            result: {},
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
          result: {},
          dimTable: tableName,
        }
        this.state.dimensionGroup.push(item);
      }
    }
  }

  onCancelDimModel = (e) => {
    const { getDimensions } = this.props.mine;
    this.props.form.validateFields((err, values) => {
      for (var i = 0; i < getDimensions.length; i++) {
        if (values[`customDim${i}`] !== '' && values[`customDim${i}`] !== undefined) {
          for (var j = 0; j < this.state.dimensionGroup.length; j++) {
            if (JSON.stringify(this.state.dimensionGroup[j].result) === '{}'
              && this.state.dimensionGroup[j].name === values[`customDim${i}`].split('-')[2]) {
              this.props.form.setFieldsValue({
                [`customDim${i}`]: `${getDimensions[i].tableDesc[0].columnValue + '-' + getDimensions[i].tableDesc[0].level + '-' + getDimensions[i].tableDesc[0].columnName + '-' + getDimensions[i].dimTotalName}`
              });
            }
          }
        }
      }
    });
    this.setState({ dimensionModelVisible: false })
  }

  toggleHover = () => {
    this.setState({ hover: !this.state.hover })
  }

  toTop = (e) => {
    e.preventDefault();
    document.getElementById('top').scrollTop = 0;
  }

  renderForm() {
    const { loading, form: { getFieldDecorator, getFieldValue } } = this.props;
    const { getApplicationData, getThemeData, getUserInfoData, getTimePeriodData } = this.props.mine;
    let { getDimensions, measure } = this.state;
    let indexAnalyze = '';
    const linkStyle = this.state.hover ? { width: 80, height: 32, } : { width: 40, height: 32, borderColor: '#40a9ff', color: '#40a9ff' };

    return (
      <Spin spinning={this.state.onLoading}>
        <Form onSubmit={e => this.submitForm(e)} layout="inline">
          <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7']} style={{ marginTop: 10 }}>
            <Panel header="告警名称、应用和主题" key="1">
              <AppAndTheme
                getApplicationData={getApplicationData}
                getThemeData={getThemeData}
                searchData={this.state.searchData}
                root={this}
                {...this.props}
              />
            </Panel>
            <Panel header="指标" key="2">
              <Measure root={this} measure={measure} {...this.props} />
            </Panel>
            <Panel header="分析维度" key="3">
              <Dimension root={this} getDimensions={getDimensions} {...this.props} />
            </Panel>
            <Panel header="统计时间" key="4">
              <CycleAndTime root={this} getTimePeriodData={getTimePeriodData} searchData={this.state.searchData} {...this.props} />
            </Panel>
            <Panel header="筛选数据维度" key="5">
              <Filter root={this} searchData={this.state.searchData} {...this.props} />
            </Panel>
            <Panel header="告警等级" key="6">
              <AlarmLevel root={this} searchData={this.state.searchData} {...this.props} />
            </Panel>
            <Panel header="发送方式和接受地址" key="7">
              <Row gutter={{ md: 6, lg: 18, xl: 48 }} style={{ marginTop: 8 }}>
                <Col md={10} sm={24}>
                  <FormItem label="发送方式">
                    {getFieldDecorator('sendType', { initialValue: 'email-邮箱' })(
                      <Select style={{ width: 200 }}>
                        <Option value='email-邮箱'>邮件</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col md={10} sm={24}>
                  <FormItem label="接受地址">
                    {getFieldDecorator('receiver', {
                      initialValue: this.state.searchData ? this.state.searchData.receiver : '',
                    })(
                      <Input placeholder='xxx@sinosafe.com.cn' style={{ width: 220 }} />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Panel>
          </Collapse>
          <div style={{ width: '100%', textAlign: 'right', marginTop: 60 }}>
            <Button type="primary" htmlType="submit">保存</Button>
            <Button style={{ marginLeft: 10, width: 88 }}>取消</Button>
          </div>
          <div style={{ position: 'fixed', top: '50%', zIndex: 99999999, right: 0 }}>
            <Button style={linkStyle} onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} onClick={e => this.toTop(e)}>{this.state.hover ? '回到顶部' : <span style={{ marginLeft: -7 }}>置顶</span>}</Button>
          </div>
          <AlarmModel root={this} {...this.props} alarmModelVisible={this.state.alarmModelVisible} />
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
      </Spin>
    );
  }

  render() {
    return (
      <PageHeaderLayout>
        <Card bordered={false} style={{ overflowY: 'scroll' }} id='top'>
          <div>
            {this.renderForm()}
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}

