import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card, Form, Row, Col, Select, Input, Button, Modal, message, Spin, Collapse, DatePicker
} from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import ReaderDimensionForm from '../../components/ReaderDimensionForm';
import Measure from '../../components/Measure';
import Dimension from '../../components/Dimension';
import Filter from './components/Filter';
import AlarmLevel from './components/AlarmLevel';
import CycleAndTime from './components/CycleAndTime';
import AppAndTheme from './components/AppAndTheme';
import AlarmModel from './components/AlarmModel';
import SelectComponent from './components/SelectComponent';
import SelectTime from './components/SelectTime';
import moment from 'moment';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option

@Form.create()
@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine,
}))

export default class SpecialCreate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      alarmId: this.props.location.alarmId,
      operaType: this.props.location.operaType,
      flag: this.props.location.flag,
      pathname: this.props.location.pathname,
      appId: '', // 
      themeId: '',
      measure: [],
      dimension: [],
      alarmLevelList: [],
      alarmModelVisible: false,
      dimensionModelVisible: false,
      modelStatu: '',
      dimensionList: [],
      measureList: [],
      isLeaf: false,
      indexAnalyze: [],
      optionsGroup: [],
      indexAnalyId: [],
      options: [],
      uuid: 1,
      customUuid: 1,
      occupFilterOneId: 1,
      occupFilterTwoId: 1,
      onLoading: false,
      searchData: {},
      measureAllSel: 0, // 是否显示指标全选
      compareType: '',
      cumntimeType: '',
      customTimeType: '',
      idName: [],
      isSpecialCreate: true,
      themeName: '',
      alarmspeGetThemeData: [],
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
      type: 'mine/getAlarmspeApplication',
      payload: []
    }).then(() => {
      const { alarmspeGetApplication } = this.props.mine;
      // const appIds = [];
      // alarmspeGetApplication.apps.map((item) => {
      //   appIds.push(item.appId)
      // })
      // dispatch({
      //   type: 'mine/getApplication',
      //   payload: appIds
      // });
    });

    dispatch({
      type: 'mine/getUserInfo'
    });

    if (this.state.operaType !== undefined && this.state.alarmId !== undefined) {
      dispatch({
        type: 'mine/alarmspeProduct',
        payload: {
          alarmId: this.state.alarmId,
          operateType: this.state.operaType,
        }
      }).then(() => {
        const { searchData } = this.props.mine;
        this.setState({ appId: searchData.appId.value, themeId: searchData.themeId.value, searchData, customTimeType: searchData.customTimeType.value + '-' + searchData.customTimeType.name });
        if (searchData.compareType.name === '自定义') {
          this.setState({ compareType: '2-自定义' });
        }
        this.setState({ themeName: searchData.themeId.name });
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

        // 获取过滤维度
        this.props.dispatch({
          type: 'mine/getFilterDimensions',
          payload: {
            appId: searchData.appId !== undefined ? searchData.appId.value : this.state.appId,
            themeId: searchData.themeId !== undefined ? searchData.themeId.value : this.state.themeId,
          }
        }).then(() => {
          let { dimension } = this.props.mine;
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

          // 回显实际业务1
          if (searchData.filterOne !== undefined) {
            const keys = this.props.form.getFieldValue('keys');
            if (searchData.filterOne.length === 0) {
              this.setState({ uuid: 1 });
            } else {
              this.setState({ uuid: searchData.filterOne.length });
            }
            for (const i in searchData.filterOne) {
              for (const j in dimension) {
                if (dimension[j].dimDesc === searchData.filterOne[i].name) {
                  if (searchData.filterOne[i].context.length > 0) {
                    const filterTotalName =
                      [dimension[j].dimColumn + '+' + dimension[j].dimDesc + '+' + dimension[j].dimTable, dimension[j].dimColumn + '+' + searchData.filterOne[i].context[0].name + '+' + dimension[j].dimTable];
                    setTimeout(() => {
                      this.props.form.setFieldsValue({ [`filterOne${keys[i]}`]: filterTotalName });
                    }, 400);
                  }
                }
              }
              const filterSelectValue = searchData.filterOne[i].context[0].name;
              setTimeout(() => {
                this.props.form.setFieldsValue({ [`filterOneArr${keys[i]}`]: [filterSelectValue] });
              }, 400);
            }
          }

          // 回显参考业务1
          if (searchData.filterTwo !== undefined) {
            const keys1 = this.props.form.getFieldValue('keys1');
            if (searchData.filterTwo.length === 0) {
              this.setState({ customUuid: 1 });
            } else {
              this.setState({ customUuid: searchData.filterTwo.length });
            }
            // this.getFilterFilterValue(searchData.filterTwo, dimension, keys1);
            for (const i in searchData.filterTwo) {
              for (const j in dimension) {
                if (dimension[j].dimDesc === searchData.filterTwo[i].name) {
                  if (searchData.filterTwo[i].context.length > 0 && searchData.filterTwo[i].name !== '') {
                    const filterTotalName = [dimension[j].dimColumn + '+' + dimension[j].dimDesc + '+' + dimension[j].dimTable, dimension[j].dimColumn + '+' + searchData.filterTwo[i].context[0].name + '+' + dimension[j].dimTable];
                    setTimeout(() => {
                      this.props.form.setFieldsValue({ [`filterTwo${keys1[i]}`]: filterTotalName });
                    }, 400);
                  }
                }
              }
              const filterSelectValue = searchData.filterTwo[i].context[0].name;
              setTimeout(() => {
                this.props.form.setFieldsValue({ [`filterTwoArr${keys1[i]}`]: [filterSelectValue] });
              }, 400);
            }
          }

          // 回显实际业务2
          if (searchData.occupFilterOne !== undefined) {
            const occupFilterOneKey = this.props.form.getFieldValue('occupFilterOneKey');
            if (searchData.occupFilterOne.length === 0) {
              this.setState({ occupFilterOneId: 1 });
            } else {
              this.setState({ occupFilterOneId: searchData.occupFilterOne.length });
            }
            for (const i in searchData.occupFilterOne) {
              for (const j in dimension) {
                if (dimension[j].dimDesc === searchData.occupFilterOne[i].name) {
                  if (searchData.occupFilterOne[i].context.length > 0 && searchData.occupFilterOne[i].name !== '') {
                    const filterTotalName = [dimension[j].dimColumn + '+' + dimension[j].dimDesc + '+' + dimension[j].dimTable, dimension[j].dimColumn + '+' + searchData.occupFilterOne[i].context[0].name + '+' + dimension[j].dimTable];
                    setTimeout(() => {
                      this.props.form.setFieldsValue({ [`occupFilterOne${occupFilterOneKey[i]}`]: filterTotalName });
                    }, 400);
                  }
                }
              }
              const filterSelectValue = searchData.occupFilterOne[i].context[0].name;
              setTimeout(() => {
                this.props.form.setFieldsValue({ [`occupFilterOneArr${occupFilterOneKey[i]}`]: [filterSelectValue] });
              }, 400);
            }
          }

          // 回显参考业务2
          if (searchData.occupFilterTwo !== undefined) {
            const occupFilterTwoKey = this.props.form.getFieldValue('occupFilterTwoKey');
            if (searchData.occupFilterTwo.length === 0) {
              this.setState({ occupFilterTwoId: 1 });
            } else {
              this.setState({ occupFilterTwoId: searchData.occupFilterTwo.length });
            }
            for (const i in searchData.occupFilterTwo) {
              for (const j in dimension) {
                if (dimension[j].dimDesc === searchData.occupFilterTwo[i].name) {
                  if (searchData.occupFilterTwo[i].context.length > 0 && searchData.occupFilterTwo[i].name !== '') {
                    const filterTotalName = [dimension[j].dimColumn + '+' + dimension[j].dimDesc + '+' + dimension[j].dimTable, dimension[j].dimColumn + '+' + searchData.occupFilterTwo[i].context[0].name + '+' + dimension[j].dimTable];
                    setTimeout(() => {
                      this.props.form.setFieldsValue({ [`occupFilterTwo${occupFilterTwoKey[i]}`]: filterTotalName });
                    }, 400);
                  }
                }
              }
              const filterSelectValue = searchData.occupFilterTwo[i].context[0].name;
              setTimeout(() => {
                this.props.form.setFieldsValue({ [`occupFilterTwoArr${occupFilterTwoKey[i]}`]: [filterSelectValue] });
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

        // 回显告警等级
        if (searchData.indexAnalyze !== undefined) {
          for (const i in searchData.indexAnalyze) {
            this.state.alarmLevelList.push(searchData.indexAnalyze[i].name)
          }
          this.setState({ indexAnalyze: searchData.indexAnalyze });
        }
      });
    }
  }

  getFilterFilterValue = (searchData, dimension) => {
    for (const i in searchData) {
      for (const j in dimension) {
        if (dimension[j].dimDesc === searchData[i].name) {
          if (searchData[i].context.length > 0 && searchData[i].name !== '') {
            const filterTotalName = [dimension[j].dimColumn + '+' + dimension[j].dimDesc + '+' + dimension[j].dimTable, dimension[j].dimColumn + '+' + searchData.filterTwo[i].context[0].name + '+' + dimension[j].dimTable];
            setTimeout(() => {
              this.props.form.setFieldsValue({ [`filterTwo${keys1[i]}`]: filterTotalName });
            }, 400);
          }
        }
      }
      const filterSelectValue = searchData[i].context[0].name;
      setTimeout(() => {
        this.props.form.setFieldsValue({ [`filterTwoArr${keys1[i]}`]: [filterSelectValue] });
      }, 400);
    }
  }

  filterPayload = (filterArr, filterItem) => {
    const filterItemValue = filterItem[filterItem.length - 1];
    const filterObj = {
      context: [{
        field: filterItemValue.split('+')[0],
        name: filterItemValue.split('+')[1],
        value: filterItemValue.split('+')[2],
      }],
      value: filterItem[0].split('+')[0],
      name: filterItem[0].split('+')[1],
    };
    filterArr.push(filterObj);
    return filterArr;
  }

  getFilterSearchData = (filterArr, searchData, filterItemValue) => {
    for (const j in searchData) {
      if (searchData[j].name === filterItemValue[0].split('+')[1]) {
        filterArr.push(searchData[j]);
      }
    }
    return filterArr;
  }

  getNullFilterValue = (filterArr) => {
    const filterArrObj = {
      context: [{ field: '', name: '', value: '', }],
      value: '',
      name: '',
    };
    filterArr.push(filterArrObj);
    return filterArr;
  }

  // 提交
  submitForm = (e) => {
    e.preventDefault();
    let { searchData } = this.props.mine;
    if (searchData === undefined) {
      searchData = {};
    }
    this.props.form.validateFields((err, values) => {
      if (err) return;
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
      let timeFrame = { leftValue: '', rightValue: '' }, cycle = ''; // 统计时间和周期
      let compareType = { name: values.compareType.split('-')[1], value: values.compareType.split('-')[0] }; // 对比类型
      let cumntimeType = values.cumntimeType !== undefined && values.cumntimeType !== '' ?
        { name: values.cumntimeType.split('-')[1], value: values.cumntimeType.split('-')[0] } // 类计时间类型
        : { name: '', value: '' };
      let customCalType = values.customCalType !== undefined && values.customCalType !== '' ? // 计算类型
        { name: values.customCalType.split('-')[1], value: values.customCalType.split('-')[0] }
        : { name: '', value: '' };
      let customTimeType = values.customTimeType !== undefined && values.customTimeType !== '' ? // 统计时间
        { name: values.customTimeType.split('-')[1], value: values.customTimeType.split('-')[0] }
        : { name: '', value: '' };
      let timeFrameOne; // 统计时间条件一
      let timeFrameTwo; // 统计时间条件两
      let recentTime; // 统计时间
      console.log(values.filterOneLeftTime)
      if (values.customTimeType === '0-含起止时间') {
        timeFrameOne = { leftValue: values.filterOneLeftTime.format("YYYY-MM-DD"), rightValue: values.filterOneRightTime.format("YYYY-MM-DD") };
        timeFrameTwo = { leftValue: values.filterTwoLeftTime.format("YYYY-MM-DD"), rightValue: values.filterTwoRightTime.format("YYYY-MM-DD") };
        recentTime = { name: '', value: '' };
      } else if (values.customTimeType === '1-含开始时间') {
        if (values.filterOneLeftTime === '' || values.filterOneLeftTime === null) {
          message.warn('请输入[实际业务统计时间]');
          return;
        } else {
          timeFrameOne = { leftValue: values.filterOneLeftTime.format("YYYY-MM-DD"), rightValue: '' };
        }
        if (values.filterTwoLeftTime === '' || values.filterTwoLeftTime === null) {
          message.warn('请输入[参考业务统计时间]');
          return;
        } else {
          timeFrameTwo = { leftValue: values.filterTwoLeftTime.format("YYYY-MM-DD"), rightValue: '' };
        }
        recentTime = { name: '', value: '' };
      } else if (values.customTimeType === '2-统计最近时间') {
        timeFrameOne = { leftValue: '', rightValue: '' };
        timeFrameTwo = { leftValue: '', rightValue: '' };
        recentTime = { name: values.recentTime.split('-')[1], value: values.recentTime.split('-')[0] };
      } else {
        timeFrameOne = { leftValue: '', rightValue: '' };
        timeFrameTwo = { leftValue: '', rightValue: '' };
        recentTime = { name: '', value: '' };
      }

      // 获取指标
      const measureListItem = [...new Set(this.state.measureList)];
      for (const i in values.measure) {
        for (const j in measureListItem) {
          if (measureListItem[j].includes(values.measure[i])) {
            measureItem = { name: measureListItem[j].split('-')[0], value: measureListItem[j].split('-')[1] }
          }
        }
        measure.push(measureItem);
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

      // 实际业务
      let filterOne = [];
      for (var i = 0; i < values.keys.length; i++) {
        const filterOneItem = `filterOne${values.keys[i]}`;
        const filterOneValue = `filterOneArr${values.keys[i]}`;
        if (values[filterOneValue].length === 0) {
          if (this.state.themeName === '业务结构') {
            message.warn(`请确定是否给[实际业务分子]第${i + 1}个滤器选择了具体的值`);
          } else {
            message.warn(`请确定是否给[实际业务]第${i + 1}个滤器选择了具体的值`);
          }
          return;
        } else {
          if (values[filterOneItem][values[filterOneItem].length - 1].split('+').length > 3) {
            this.filterPayload(filterOne, values[filterOneItem]);
          } else {
            // 获取回写值
            this.getFilterSearchData(filterOne, searchData.filterOne, values[filterOneItem]);
          }
        }
      }

      // 参考业务
      let filterTwo = [];
      if (values.customCalType !== '' && values.customCalType !== undefined) {
        for (var i = 0; i < values.keys1.length; i++) {
          const filterTwoItem = `filterTwo${values.keys1[i]}`;
          const filterTwoValue = `filterTwoArr${values.keys1[i]}`;
          if (values[filterTwoValue].length === 0) {
            if (this.state.themeName === '业务结构') {
              message.warn(`请确定是否给[参考业务分子]第${i + 1}个滤器选择了具体的值`);
            } else {
              message.warn(`请确定是否给[参考业务]第${i + 1}个滤器选择了具体的值`);
            }
            return;
          } else {
            if (values[filterTwoItem][values[filterTwoItem].length - 1].split('+').length > 3) {
              this.filterPayload(filterTwo, values[filterTwoItem]);
            } else {
              // 获取回写值
              this.getFilterSearchData(filterTwo, searchData.filterTwo, values[filterTwoItem]);
            }
          }
        }
      } else {
        this.getNullFilterValue(filterTwo);
      }

      // 实际占比业务
      let occupFilterOne = [];
      if (this.state.themeName === '业务结构') {
        for (var i = 0; i < values.occupFilterOneKey.length; i++) {
          const occupFilterOneItem = `occupFilterOne${values.occupFilterOneKey[i]}`;
          const occupFilterOneValue = `occupFilterOneArr${values.occupFilterOneKey[i]}`;
          if (values[occupFilterOneValue].length === 0) {
            message.warn(`请确定是否给[实际业务分母]第${i + 1}个滤器选择了具体的值`);
            return;
          } else {
            if (values[occupFilterOneItem][values[occupFilterOneItem].length - 1].split('+').length > 3) {
              this.filterPayload(occupFilterOne, values[occupFilterOneItem],);
            } else {
              // 获取回显值
              this.getFilterSearchData(occupFilterOne, searchData.occupFilterOne, values[occupFilterOneItem]);
            }
          }
        }
      } else {
        this.getNullFilterValue(occupFilterOne);
      }

      // 参考占比业务
      let occupFilterTwo = [];
      if (this.state.themeName === '业务结构' && this.state.compareType === '2-自定义') {
        for (var i = 0; i < values.occupFilterTwoKey.length; i++) {
          const occupFilterTwoItem = `occupFilterTwo${values.occupFilterTwoKey[i]}`;
          const occupFilterTwoValue = `occupFilterTwoArr${values.occupFilterTwoKey[i]}`;
          if (values[occupFilterTwoValue].length === 0) {
            message.warn(`请确定是否给[参考业务分母]第${i + 1}个滤器选择了具体的值`);
            return;
          } else {
            if (values[occupFilterTwoItem][values[occupFilterTwoItem].length - 1].split('+').length > 3) {
              this.filterPayload(occupFilterTwo, values[occupFilterTwoItem],);
            } else {
              // 获取回显值
              this.getFilterSearchData(occupFilterTwo, searchData.occupFilterTwo, values[occupFilterTwoItem]);
            }
          }
        }
      } else {
        this.getNullFilterValue(occupFilterTwo);
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
        type: 'mine/alarmspeProduct',
        payload: {
          alarmId,
          alarmName,
          alarmTemplate,
          appId,
          compareType,
          createTime,
          cumntimeType,
          customCalType,
          cycle: '',
          filterOne,
          filterTwo,
          occupFilterOne,
          occupFilterTwo,
          indexAnalyze,
          man,
          measure,
          operateType,
          receiver,
          sendType,
          themeId,
          timeFrame,
          webParam: '/getresult/monitoring/specialcreate',
          timeFrameOne,
          timeFrameTwo,
          recentTime,
          customTimeType,
        }
      }).then(() => {
        this.setState({ onLoading: true, flag: 0 });
        setTimeout(() => {
          this.setState({ onLoading: false });
        }, 200);
        this.props.form.resetFields();
        this.setState({
          measure: [], dimension: [], alarmLevelList: [], dimensionList: [], measureList: [], idName: [],
          indexAnalyze: [], optionsGroup: [], timeFrame: [], searchData: {}, themeName: '', compareType: ''
        });
        this.props.form.setFieldsValue({
          themeId: '', appId: '', alarmName: '', receiver: '', selDimResult: [], keys: [0], timeFrame: [],
          leftTime: '', rightTime: ''
        });
      }).catch((e) => {
        message.warn(e.message);
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
      type: 'mine/alarmspeGetTheme',
      payload: {
        appId: optionsVlaue,
      }
    }).then(() => {
      const { alarmspeGetThemeData } = this.props.mine
      this.setState({ alarmspeGetThemeData, });
    }).catch((e) => {
      const { alarmspeGetThemeData } = this.props.mine
      this.setState({ alarmspeGetThemeData: [], });
      message.warn(e.message);
    });
  }

  // 选择主题
  selThemeItem = (value) => {
    this.setState({ themeName: value.split('-')[1] });
    setTimeout(() => {
      const keys = this.props.form.getFieldValue('keys');
      for (var i = 0; i < keys.length; i++) {
        this.props.form.setFieldsValue({ [`filterOne${keys[i]}`]: [], [`filterOneArr${keys[i]}`]: [] });
      }
      const keys1 = this.props.form.getFieldValue('keys1');
      for (var i = 0; i < keys1.length; i++) {
        this.props.form.setFieldsValue({ [`filterTwo${keys1[i]}`]: [], [`filterTwoArr${keys1[i]}`]: [] });
      }
      const occupFilterOneKey = this.props.form.getFieldValue('occupFilterOneKey');
      for (var i = 0; i < occupFilterOneKey.length; i++) {
        this.props.form.setFieldsValue({ [`occupFilterOne${occupFilterOneKey[i]}`]: [], [`occupFilterOneArr${occupFilterOneKey[i]}`]: [] });
      }
      const occupFilterTwoKey = this.props.form.getFieldValue('occupFilterTwoKey');
      for (var i = 0; i < occupFilterTwoKey.length; i++) {
        this.props.form.setFieldsValue({ [`occupFilterTwo${occupFilterTwoKey[i]}`]: [], [`occupFilterTwoArr${occupFilterTwoKey[i]}`]: [] });
      }
    }, 100);
    this.props.form.setFieldsValue({ measure: [], keys: [0], keys1: [0], occupFilterOneKey: [0], occupFilterTwoKey: [0] });
    let { searchData } = this.props.mine;
    if (searchData === undefined) {
      searchData = {};
    }
    const optionsVlaue = value.split('-')[0];
    this.setState({
      alarmLevelList: [], themeId: optionsVlaue, options: [], optionsGroup: [], uuid: 1, customUuid: 1,
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
          optionsGroup: [],
        });
      }
    });

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
          const list = {
            value: dimension[i].dimColumn + '+' + dimension[i].dimDesc + '+' + dimension[i].dimTable,
            label: dimension[i].dimDesc,
            isLeaf: false,
          };
          dimensionAttrCode.push(list);
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
  }

  onCancelAlarmModel = () => {
    this.setState({ alarmModelVisible: false });
  }

  onChange = (value, selectedOptions) => {
    setTimeout(() => {
      const keys = this.props.form.getFieldValue('keys');
      for (var i = 0; i < keys.length; i++) {
        const filterItemValue = this.props.form.getFieldValue(`filterOne${keys[i]}`);
        if (value[0] !== undefined && filterItemValue !== undefined && value[0] === filterItemValue[0] && value.length === 1 && filterItemValue.length === 1) {
          this.props.form.setFieldsValue({
            [`filterOneArr${keys[i]}`]: []
          });
        }
      }
      const keys1 = this.props.form.getFieldValue('keys1');
      for (var i = 0; i < keys1.length; i++) {
        const filterItemValue = this.props.form.getFieldValue(`filterTwo${keys1[i]}`);
        if (value[0] !== undefined && filterItemValue !== undefined && value[0] === filterItemValue[0] && value.length === 1 && filterItemValue.length === 1) {
          this.props.form.setFieldsValue({
            [`filterTwoArr${keys1[i]}`]: []
          });
        }
      }
      const occupFilterOneKey = this.props.form.getFieldValue('occupFilterOneKey');
      for (var i = 0; i < occupFilterOneKey.length; i++) {
        const filterItemValue = this.props.form.getFieldValue(`occupFilterOne${occupFilterOneKey[i]}`);
        if (value[0] !== undefined && filterItemValue !== undefined && value[0] === filterItemValue[0] && value.length === 1 && filterItemValue.length === 1) {
          this.props.form.setFieldsValue({
            [`occupFilterOneArr${occupFilterOneKey[i]}`]: []
          });
        }
      }
      const occupFilterTwoKey = this.props.form.getFieldValue('occupFilterTwoKey');
      for (var i = 0; i < occupFilterTwoKey.length; i++) {
        const filterItemValue = this.props.form.getFieldValue(`occupFilterTwo${occupFilterTwoKey[i]}`);
        if (value[0] !== undefined && filterItemValue !== undefined && value[0] === filterItemValue[0] && value.length === 1 && filterItemValue.length === 1) {
          this.props.form.setFieldsValue({
            [`occupFilterTwoArr${occupFilterTwoKey[i]}`]: []
          });
        }
      }
    }, 400);
    if (selectedOptions.length === 1) {
      const dimColumn = selectedOptions[0].value.split('+')[0];
      const dimTable = selectedOptions[0].value.split('+')[2];
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
          for (var i = 0; i < keys.length; i++) {
            const filterItemValue = this.props.form.getFieldValue(`filterOne${keys[i]}`);
            if (filterItemValue !== undefined && filterItemValue.length > 0 && filterItemValue[1].split('+').length > 3) { // 判断>3，以此来判断那些过滤器是回写值，避免重置值
              const filterItemName = filterItemValue[filterItemValue.length - 1].split('+')[1];
              let filterName = `filterOneArr${keys[i]}`;
              this.props.form.setFieldsValue({
                [filterName]: filterItemName,
                [filterItemValue]: value
              });
            }
          }
          const keys1 = this.props.form.getFieldValue('keys1');
          for (var i = 0; i < keys1.length; i++) {
            const filterItemValue = this.props.form.getFieldValue(`filterTwo${keys1[i]}`);
            if (filterItemValue !== undefined && filterItemValue.length > 0 && filterItemValue[1].split('+').length > 3) { // 判断>3，以此来判断那些过滤器是回写值，避免重置值
              const filterItemName = filterItemValue[filterItemValue.length - 1].split('+')[1];
              let filterName = `filterTwoArr${keys1[i]}`;
              this.props.form.setFieldsValue({
                [filterName]: filterItemName,
                [filterItemValue]: value,
              });
            }
          }
          const occupFilterOneKey = this.props.form.getFieldValue('occupFilterOneKey');
          for (var i = 0; i < occupFilterOneKey.length; i++) {
            const filterItemValue = this.props.form.getFieldValue(`occupFilterOne${occupFilterOneKey[i]}`);
            if (filterItemValue !== undefined && filterItemValue.length > 0 && filterItemValue[1].split('+').length > 3) { // 判断>3，以此来判断那些过滤器是回写值，避免重置值
              const filterItemName = filterItemValue[filterItemValue.length - 1].split('+')[1];
              let filterName = `occupFilterOneArr${occupFilterOneKey[i]}`;
              this.props.form.setFieldsValue({
                [filterName]: filterItemName,
                [filterItemValue]: value
              });
            }
          }
          const occupFilterTwoKey = this.props.form.getFieldValue('occupFilterTwoKey');
          for (var i = 0; i < occupFilterTwoKey.length; i++) {
            const filterItemValue = this.props.form.getFieldValue(`occupFilterTwo${occupFilterTwoKey[i]}`);
            if (filterItemValue !== undefined && filterItemValue.length > 0 && filterItemValue[1].split('+').length > 3) { // 判断>3，以此来判断那些过滤器是回写值，避免重置值
              const filterItemName = filterItemValue[filterItemValue.length - 1].split('+')[1];
              let filterName = `occupFilterTwoArr${occupFilterTwoKey[i]}`;
              this.props.form.setFieldsValue({
                [filterName]: filterItemName,
                [filterItemValue]: value
              });
            }
          }
        }, 400);
        const splitValue = selectedOptions[selectedOptions.length - 1].value;
        const payloadVlaue = splitValue.split("+");
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

  // 对比类型
  selectCompareType = (option) => {
    this.setState({
      compareType: option, uuid: 1, customUuid: 1, occupFilterOneId: 1, occupFilterTwoId: 1,
    });
    this.props.form.setFieldsValue({ keys: [0], keys1: [0], occupFilterOneKey: [0], occupFilterTwoKey: [0], filterOne0: [], filterOneArr0: [], filterTwo0: [], filterTwoArr0: [], occupFilterOne0: [], occupFilterOneArr0: [], occupFilterTwo0: [], occupFilterTwoArr0: [] });
    if (option !== '2-自定义') {
      this.props.form.setFieldsValue({ customCalType: '', customTimeType: '', cumntimeType: '' });
      this.setState({ customTimeType: '', cumntimeType: '' });
    } else {
      this.props.form.setFieldsValue({ cumntimeType: '', });
    }
  }

  // 选择统计时间类型
  selectCustomTimeType = (option) => {
    this.props.form.setFieldsValue({
      filterOneLeftTime: '', filterOneRightTime: '', filterTwoLeftTime: '', filterTwoRightTime: '',
    });
    this.setState({ customTimeType: option });
  }

  // 累计时间类型
  selectCumnTimeType = (option) => {
    this.setState({ cumntimeType: option });
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

  toggleHover = () => {
    this.setState({ hover: !this.state.hover })
  }

  toTop = (e) => {
    e.preventDefault();
    document.getElementById('top').scrollTop = 0;
  }

  renderForm() {
    const { loading, form: { getFieldDecorator, getFieldValue } } = this.props;
    const { alarmspeGetApplication, getUserInfoData, getTimePeriodData, searchData } = this.props.mine;
    let { measure, alarmspeGetThemeData } = this.state;
    let indexAnalyze = '';
    const linkStyle = this.state.hover ? { width: 80, height: 32, } : { width: 40, height: 32, borderColor: '#40a9ff', color: '#40a9ff' };
    return (
      <Spin spinning={this.state.onLoading}>
        <Form onSubmit={e => this.submitForm(e)} layout="inline">
          <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7']} style={{ marginTop: 10 }}>
            <Panel header="告警名称、应用和主题" key="1">
              <AppAndTheme
                getApplicationData={alarmspeGetApplication}
                getThemeData={alarmspeGetThemeData}
                searchData={this.state.searchData}
                root={this}
                {...this.props}
              />
            </Panel>
            <Panel header="指标" key="2">
              <Measure root={this} measure={measure} {...this.props} />
            </Panel>
            <Panel header="类型配置" key="3">
              <SelectComponent searchData={this.state.searchData} root={this}{...this.props} />
            </Panel>
            <Panel header="业务选择" key="4">
              <div>
                {/* <SelectTime root={this} searchData={this.state.searchData} {...this.props} /> */}
                <Filter root={this} searchData={this.state.searchData} {...this.props} />
              </div>
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
                    {getFieldDecorator('receiver', { initialValue: this.state.searchData ? this.state.searchData.receiver : '' })(
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

