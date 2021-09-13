import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Row, Col, Modal, Button, Table, Card, message, Collapse, Select,
  List, Spin, DatePicker, Input
} from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import QueryAnalyLeftComponent from './components/QueryAnalyLeftComponent';
import QueryAnalyFilter from './components/QueryAnalyFilter';
import moment from 'moment';

const Panel = Collapse.Panel;
const FormItem = Form.Item;
const Option = Select.Option;
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

@connect(({ analysis, loading, umssouserinfo, global }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
  global
}))
@Form.create()
export default class QueryAnalysis extends PureComponent {
  state = {
    expandedKeys: [],
    autoExpandParent: true,
    checkedKeys: [],
    treeData: [],
    loadLeftData: false,
    parentKey: '',
    getMainTableData: [],
    tdId: '',
    filterListModel: false,
    mainTabInfo: '',
    filterInfoValue: [],
    filterExpandedKeys: [],
    filterConfigName: '',
    filterItemList: [],
    loadingList: false,
    currentPageNum: 1, // 当前页码数
    pageSize: 10, // 每页大小
    payload: {},
    showTable: false,
    getMainTabDateColData: [],
    tabelScrollX: 0,
    downloadButFlag: false,
    columns: [],
    modelVisible: false,
    man: '',
    analysisName: '',
    newFilterMetasJson: [],
    id: this.props.location.id,
    autoAnalyName: this.props.location.autoAnalyName,
    loadList: false,
    publicMode: true,                          // 用于判定是否为公共模板
    saveMode: 'saveMode',                      // 保存模板的请求models路径
    editMode: 'queryMode',                      // 编辑模板的请求models路径
    queryMode: 'queryMode',                    // 查询模板的请求models路径
    queryConfigParam: 'queryModeData',         // 查询模板的请求返回数据  
    visual: 'queryModeData',                    // 编辑模板的请求返回数据
    clickMode: true,
  }

  componentDidMount() {
    // 获取主表信息
    this.props.dispatch({
      type: 'analysis/getMainTable',
    }).then(() => {
      const { getMainTableData } = this.props.analysis;
      this.setState({ getMainTableData, });
      if (getMainTableData.length > 0) {
        const tbId = getMainTableData[0].tbId;
        // 获取主表下的统计时间
        this.props.dispatch({
          type: 'analysis/getMainTabDateCol',
          payload: {
            mainTabInfo: { tbId, }
          }
        });
      }
    }).catch((e) => {
      message.warn(e.message);
    });

    this.props.dispatch({
      type: 'analysis/getAllTableInfo',
    }).then(() => {
      const { getAllTableInfoData } = this.props.analysis;
      const expandedKeys = [];
      getAllTableInfoData.map((i) => {
        expandedKeys.push(i.dbName + '-' + i.tbId);
      });
      this.setState({ expandedKeys: [], checkedKeys: [], loadLeftData: false, }); // expandedKeys
      this.props.form.setFieldsValue({ filterInfo: [] });
    }).catch((e) => {
      message.warn(e.message);
    });

    // 获取用户
    this.props.dispatch({
      type: 'analysis/getUserInfo'
    }).then(() => {
      const { getUserInfoData } = this.props.analysis;
      if (getUserInfoData.domain !== undefined) {
        this.setState({ man: getUserInfoData.domain });
      }

      // 回写信息
      if (this.state.id !== undefined) {
        this.props.dispatch({
          type: 'analysis/clickCommAutoAnaly',
          payload: {
            id: this.state.id,
          }
        }).then(() => {
          const { clickCommAutoAnalyData } = this.props.analysis;
          this.reloadData('user', clickCommAutoAnalyData);
        });
      } else {
        const { dispatch, currentUser, location: { manaIscommon, company_, companyName_ } } = this.props;
        const { queryMode, queryConfigParam } = this.state;
        const { companyCode, companyName } = this.props.analysis.getUserInfoData;
        dispatch({
          type: `analysis/${queryMode}`,
          payload: {
            man: currentUser.principal.name,
            company: company_ ? company_ : companyCode,
            companyName: companyName_ ? companyName_ : companyName,
            appId: 'attri',
            themeId: 'selfAnalysis',
            manaIscommon: this.props.location.manaIscommon
          }
        }).then(() => {
          if (!this.props.analysis[queryConfigParam].commonAnalysisConfig) return;
          this.reloadData('other', this.props.analysis[queryConfigParam]);
          setTimeout(() => {
            this.submitForm();
          }, 400);
        })
      }
    });

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
  }

  // 数据回显
  reloadData(type, data) {
    let searchData, tbId;
    if (type === 'user') {
      if (data.commAutoAnalyConfig !== undefined) {
        searchData = JSON.parse(data.commAutoAnalyConfig);
        tbId = data.mainTabId;
        const that = this;
        reload(searchData, tbId, that);
      }
    } else if (type === 'other') {
      if (data.commonAnalysisConfig !== undefined) {
        searchData = JSON.parse(data.commonAnalysisConfig);
        tbId = searchData.mainTableInfo.split('-')[0];
        const that = this;
        reload(searchData, tbId, that);
      }
    }
    function reload(searchData, tbId, that) {// 回显统计时间
      setTimeout(() => {
        // 获取左边和字段
        that.props.dispatch({
          type: 'analysis/getMainTabRelateTabInfo',
          payload: {
            tbIdList: [tbId]
          }
        });
        // 获取统计时间
        that.props.dispatch({
          type: 'analysis/getMainTabDateCol',
          payload: {
            mainTabInfo: { tbId, }
          }
        }).then(() => {
          const { getMainTabDateColData } = that.props.analysis;
          that.setState({ getMainTabDateColData, });
        });
        // 回显 主表信息,统计时间和选择字段
        that.props.form.setFieldsValue({
          leftValue: moment(searchData.leftValue, 'YYYY-MM-DD'),
          rightValue: moment(searchData.rightValue, 'YYYY-MM-DD'),
          mainTabDate: searchData.mainTabDate,
          filterInfo: searchData.filterInfo,
          tableInfo: searchData.mainTableInfo,
        });
        // 展开支点回显勾选, 回显过滤条件
        that.setState({
          checkedKeys: searchData.checkedKeys,
          expandedKeys: searchData.expandedKeys,
          filterItemList: searchData.filterItemList,
        });
      }, 100);
    }
  }

  componentWillReceiveProps(props) {
    // 当用户点击菜单栏的编辑公共默认按钮的时候发送请求，如果当前模块为可视化模块则替换当前模块数据
    // 判断条件为控制模块的个人默认和公共默认相互切换，同时没值的时候不执行，设定在SiderMenu.js文件
    const { companyCode, companyName } = this.props.analysis.getUserInfoData;
    if (!companyCode) return;
    if (!this.state.clickMode) return;
    const { editMode, visual, queryMode, queryConfigParam } = this.state;
    const { currentUser } = this.props;
    let payload, msg, publicMode, route, routeData;
    if (props.global.publicMode === '公共') {
      payload = {
        appId: 'attri',
        themeId: 'selfAnalysis',
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
        appId: 'attri',
        themeId: 'selfAnalysis',
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
          this.reloadData('other', this.props.analysis[routeData]);
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

  // 保存模板
  saveMode = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (values.leftValue === undefined || values.rightValue === undefined || values.leftValue === null || values.rightValue === null) {
        message.warn('时间必选');
        return;
      }
      const mainTabDate = values.mainTabDate; // 统计时间选择字段
      const leftValue = values.leftValue.format("YYYY-MM-DD"); // 起始时间
      const rightValue = values.rightValue.format("YYYY-MM-DD"); // 终止时间
      const filterInfo = values.filterInfo; // 选择字段
      const expandedKeys = [];
      // 获取支点展开的key值
      this.state.checkedKeys.map((i) => {
        let flag = true;
        const Keys = i.split('-')[1] + '-' + i.split('-')[2];
        if (expandedKeys.indexOf(Keys) > -1) {
          flag = false
        }
        if (flag && i.split('-').length > 2) {
          expandedKeys.push(i.split('-')[1] + '-' + i.split('-')[2]);
        }
      });
      const commAutoAnalyConfig = { // 配置信息 
        mainTabDate,
        leftValue,
        rightValue,
        filterInfo,
        filterItemList: this.state.filterItemList,
        mainTableInfo: values.tableInfo,
        checkedKeys: this.state.checkedKeys,
        expandedKeys,
      };
      console.log(commAutoAnalyConfig)
      const { saveMode, publicMode } = this.state;
      const { dispatch, currentUser } = this.props;
      const { companyCode, companyName } = this.props.analysis.getUserInfoData;
      dispatch({
        type: `analysis/${saveMode}`,
        payload: {
          man: currentUser.principal.name,
          company: companyCode,
          companyName,
          themeId: 'selfAnalysis',
          appId: 'attri',
          appName: '自助分析',
          // themeName: '自助分析',
          iscommon: publicMode ? '1' : '0',
          commonAnalysisConfig: JSON.stringify(commAutoAnalyConfig)
        }
      }).then(() => {
        message.success('保存成功，下次将引用该模板，详细模板管理请在个人工作台中的公共模板管理进行操作！')
      }).catch((e) => {
        message.warn(e.message);
      })
    });
  }

  // 根据主表获取相关表信息
  selectTbInfo = (value) => {
    const tbId = value.split('-')[0];
    this.setState({ loadLeftData: true, mainTabInfo: tbId, filterInfoValue: [], filterItemList: [], expandedKeys: [], checkedKeys: [] });

    // 获取左边和字段
    this.props.dispatch({
      type: 'analysis/getMainTabRelateTabInfo',
      payload: {
        tbIdList: [tbId]
      }
    }).then(() => {
      setTimeout(() => {
        this.setState({ loadLeftData: false, tdId: '' });
        this.props.form.setFieldsValue({ filterInfo: [], mainTabDate: '', rightValue: undefined, leftValue: undefined }); // rightValue
      }, 100);
    }).catch((e) => {
      message.warn(e.message);
    });
    // 获取统计时间
    this.props.dispatch({
      type: 'analysis/getMainTabDateCol',
      payload: {
        mainTabInfo: { tbId, }
      }
    }).then(() => {
      const { getMainTabDateColData } = this.props.analysis;
      this.setState({ getMainTabDateColData, });
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
    });
  }

  onCheck = (checkedKeys) => {
    const tableInfo = this.props.form.getFieldValue('tableInfo');
    if (checkedKeys.length > 0) {
      this.setState({ checkedKeys, });
      let filterInfoValue = [];
      checkedKeys.map((i) => {
        if (i.split('-').length > 3 && tableInfo !== undefined) { // 选择表里面的字段
          if (i.split('-')[6] === tableInfo.split('-')[2]) { // 主表字段
            filterInfoValue.push(i.split('-')[0]);
          } else { // 关联表字段
            filterInfoValue.push(i.split('-')[6] + '-' + i.split('-')[0]);
          }
        }
      });
      setTimeout(() => {
        this.props.form.setFieldsValue({ filterInfo: filterInfoValue });
      }, 50);
      this.setState({ filterInfoValue, });
      setTimeout(() => { // 删除字段 在选择字段里，如果该删除元素对应的表 已经没有其他的字段 在filterItemList里面对应表的数据也要删除
        let tbName = [], filterItemList = [];
        checkedKeys.map((item) => {
          if (item.split('-').length > 2) {
            tbName.push(item.split('-')[6]);
          }
        });
        const tbNameArr = Array.from(new Set(tbName));
        for (var i = 0; i < tbNameArr.length; i++) {
          for (var j = 0; j < this.state.filterItemList.length; j++) {
            if (tbNameArr[i] === this.state.filterItemList[j].tbCname) {
              filterItemList.push(this.state.filterItemList[j])
            }
          }
        }
        this.setState({ filterItemList, });
      }, 200);
    } else {
      this.props.form.setFieldsValue({ filterInfo: [] });
      this.setState({ tdId: '', checkedKeys, filterInfoValue: [], filterItemList: [], mainTabInfo: '', });
    }
  }

  // 删除选择字段
  onDeleteItem = (deleteItem) => {
    // 删除字段 在选择字段里，如果该删除元素对应的表 已经没有其他的字段 在filterItemList里面对应表的数据也要删除
    let filterInfo = [];
    const tableInfo = this.props.form.getFieldValue('tableInfo');
    setTimeout(() => {
      filterInfo = this.props.form.getFieldValue('filterInfo');
      if (this.state.filterItemList.length > 0 && filterInfo.length > 0) {
        let tbName = [], filterItemList = [];
        filterInfo.map((i) => {
          if (i.split('-').length > 1) { // 如果选择字段是关联表的时候 
            tbName.push(i.split('-')[0]);
          } else { // 否则是主表字段
            tbName.push(tableInfo.split('-')[2]);
          }
        });
        const tbNameArr = [...new Set(tbName)];
        for (var i = 0; i < tbNameArr.length; i++) {
          for (var j = 0; j < this.state.filterItemList.length; j++) {
            if (tbNameArr[i] === this.state.filterItemList[j].tbCname) {
              filterItemList.push(this.state.filterItemList[j]);
            }
          }
        }
        this.setState({ filterItemList, });
      } else if (filterInfo.length === 0) {
        this.setState({ filterItemList: [], });
      }
    }, 200);

    const checkedKeys = this.state.checkedKeys;
    checkedKeys.map((i, index) => {
      if (deleteItem.split('-').length > 1) { // 关联表
        if (i.split('-')[0] === deleteItem.split('-')[1] && i.split('-')[6] === deleteItem.split('-')[0]) {
          checkedKeys.splice(index, 1);
        }
      } else { // 主表
        if (tableInfo.split('-')[2] === i.split('-')[6] && deleteItem === i.split('-')[0]) {
          checkedKeys.splice(index, 1);
        }
      }
    });
    this.setState({ checkedKeys, });
  }

  onOkFilterListModel = (e) => {
    e.preventDefault();
    this.setState({ filterListModel: false, filterConfigName: '', });
  }

  onCanelFilterListModel = (e) => {
    if (this.state.filterItemList.length === 0) {
      this.setState({ filterItemList: [], });
    }
    this.setState({ filterListModel: false, filterConfigName: '', })
  }

  filterOnExpand = (expandedKeys,) => {
    this.setState({
      autoExpandParent: false,
      filterExpandedKeys: expandedKeys,
    });
  }

  addFilter = () => {
    this.setState({ filterListModel: true });
    const selectTabColInfo = [];
    if (this.state.checkedKeys.length > 0) {
      this.state.checkedKeys.map((i) => {
        const infoChild = {};
        if (i.split('-').length > 2) {
          infoChild['tbId'] = i.split('-')[2];
          selectTabColInfo.push(infoChild);
        }
      });
    }
    this.props.dispatch({
      type: 'analysis/getFilterInfo',
      payload: {
        mainTabInfo: { tbId: this.state.mainTabInfo },
        selectTabColInfo,
      }
    }).then(() => {
      const expandedKeys = [];
      const { getFilterInfoData } = this.props.analysis;
      getFilterInfoData.map((i) => {
        expandedKeys.push(i.dbName + '-' + i.tbId);
      });
      this.setState({ filterExpandedKeys: expandedKeys });
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  // 取消查询列表
  onCancelSearchInfo = () => {
    this.setState({ filterItemList: [], checkedKeys: [], showTable: false, autoAnalyName: undefined });
    this.props.form.resetFields();
  }

  onCancelFilterList = () => {
    setTimeout(() => {
      this.props.form.setFieldsValue({ dimDesc: [], });
    }, 10);
  }

  // 查询
  submitForm = (e) => {
    // e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({ loadList: true });
      if (values.leftValue === undefined || values.rightValue === undefined || values.leftValue === null || values.rightValue === null) {
        message.warn('统计时间必选');
        return;
      }
      const mainTabDateInfo = {}; // 主表时间 
      mainTabDateInfo['colName'] = values.mainTabDate.split('-')[0];
      mainTabDateInfo['dataType'] = values.mainTabDate.split('-')[1];
      mainTabDateInfo['dbName'] = values.mainTabDate.split('-')[2];
      mainTabDateInfo['tbName'] = values.mainTabDate.split('-')[3];
      mainTabDateInfo['timeSegment'] = { leftValue: values.leftValue.format("YYYY-MM-DD"), rightValue: values.rightValue.format("YYYY-MM-DD") };
      const filterMetas = this.getFilterMetas(this.state.filterItemList); // 过滤条件
      const mainTabInfo = {}; // 主表信息 
      mainTabInfo['tbId'] = values.tableInfo.split('-')[0];
      mainTabInfo['dbName'] = values.tableInfo.split('-')[1];
      mainTabInfo['tbCname'] = values.tableInfo.split('-')[2];
      mainTabInfo['tbName'] = values.tableInfo.split('-')[3];
      const selectTabColInfo = []; // 选择字段信息
      if (this.state.checkedKeys.length === 0) {
        message.warn('请选择字段');
        return;
      } else {
        this.state.checkedKeys.map((i) => {
          if (i.split('-').length > 2) { // 子节点
            const list = {};
            list['colCname'] = i.split('-')[0];
            list['dbName'] = i.split('-')[1];
            list['tbId'] = i.split('-')[2];
            list['tbName'] = i.split('-')[3];
            list['colId'] = i.split('-')[4];
            list['colName'] = i.split('-')[5];
            list['tbCname'] = i.split('-')[6];
            selectTabColInfo.push(list);
          }
        });
      }
      const autoParams = {
        mainTabDateInfo,
        mainTabInfo,
        selectTabColInfo,
        filterMetas,
      }
      const payload = {
        autoParams,
        currentPageNum: 1,
        pageSize: this.state.pageSize,
      }
      this.setState({ payload: autoParams, showTable: true, });
      this.props.dispatch({
        type: 'analysis/getPageResult',
        payload,
      }).then(() => {
        let columns = [];
        this.state.checkedKeys.map((item) => {
          const list = {};
          const reader = (item) => {
            return (
              <span>
                {/* <div>{item.split('-')[6]}</div> */}
                <div>{item.split('-')[0]}</div>
              </span>
            );
          }
          if (item.split('-').length > 2) {
            list['title'] = item.split('-')[0],
              list['dataIndex'] = item.split('-')[5],
              list['align'] = 'center',
              columns.push(list);
          }
        });
        this.setState({ columns, currentPageNum: 1, downloadButFlag: true });
        // 设置table滚动
        const checkedKeysLength = [...new Set(this.state.checkedKeys)].length;
        if (checkedKeysLength < 7) {
          this.setState({ tabelScrollX: 0 });
        } else if (7 < checkedKeysLength && checkedKeysLength < 10) {
          this.setState({ tabelScrollX: 1000 });
        } else if (9 < checkedKeysLength && checkedKeysLength < 12) {
          this.setState({ tabelScrollX: 1100 });
        } else if (11 < checkedKeysLength && checkedKeysLength < 14) {
          this.setState({ tabelScrollX: 1200 });
        } else if (13 < checkedKeysLength && checkedKeysLength < 16) {
          this.setState({ tabelScrollX: 1350 });
        } else if (15 < checkedKeysLength && checkedKeysLength < 18) {
          this.setState({ tabelScrollX: 1450 });
        } else if (17 < checkedKeysLength && checkedKeysLength < 20) {
          this.setState({ tabelScrollX: 1600 });
        } else if (19 < checkedKeysLength && checkedKeysLength < 22) {
          this.setState({ tabelScrollX: 1750 });
        } else if (21 < checkedKeysLength && checkedKeysLength < 24) {
          this.setState({ tabelScrollX: 1900 });
        } else if (23 < checkedKeysLength && checkedKeysLength < 26) {
          this.setState({ tabelScrollX: 2100 });
        } else if (25 < checkedKeysLength && checkedKeysLength < 28) {
          this.setState({ tabelScrollX: 2300 });
        } else if (27 < checkedKeysLength && checkedKeysLength < 30) {
          this.setState({ tabelScrollX: 2600 });
        } else if (29 < checkedKeysLength && checkedKeysLength < 32) {
          this.setState({ tabelScrollX: 2700 });
        } else if (31 < checkedKeysLength && checkedKeysLength < 34) {
          this.setState({ tabelScrollX: 3200 });
        } else if (33 < checkedKeysLength && checkedKeysLength < 36) {
          this.setState({ tabelScrollX: 3700 });
        } else if (35 < checkedKeysLength && checkedKeysLength < 40) {
          this.setState({ tabelScrollX: 4200 });
        } else if (39 < checkedKeysLength && checkedKeysLength < 50) {
          this.setState({ tabelScrollX: 4700 });
        } else if (49 < checkedKeysLength && checkedKeysLength < 60) {
          this.setState({ tabelScrollX: 5100 });
        } else if (59 < checkedKeysLength && checkedKeysLength < 70) {
          this.setState({ tabelScrollX: 6200 });
        } else if (69 < checkedKeysLength && checkedKeysLength < 80) {
          this.setState({ tabelScrollX: 7600 });
        } else if (79 < checkedKeysLength && checkedKeysLength < 90) {
          this.setState({ tabelScrollX: 8400 });
        } else if (89 < checkedKeysLength && checkedKeysLength < 100) {
          this.setState({ tabelScrollX: 9400 });
        } else if (99 < checkedKeysLength && checkedKeysLength < 110) {
          this.setState({ tabelScrollX: 10000 });
        } else if (109 < checkedKeysLength && checkedKeysLength < 120) {
          this.setState({ tabelScrollX: 11000 });
        } else if (119 < checkedKeysLength && checkedKeysLength < 130) {
          this.setState({ tabelScrollX: 13000 });
        } else if (129 < checkedKeysLength && checkedKeysLength < 150) {
          this.setState({ tabelScrollX: 15000 });
        } else if (149 < checkedKeysLength) {
          this.setState({ tabelScrollX: 13000 });
        }
        this.setState({ loadList: false });
      }).catch((e) => {
        message.warn(e.message);
        this.setState({ loadList: false });
      });
    });
  }

  // 过滤条件
  getFilterMetas = (filterItemList) => {
    const filterMetas = [];
    filterItemList.map((i) => {
      const operation = i.operation;
      const farCommMetaList = [];
      const filterInfo = {}, filterMetasItem = {};
      for (var j = 0; j < operation.length; j++) {
        const farCommMetaListItem = {};
        if (i.value.length > 0) {
          farCommMetaListItem['colCname'] = i.colCname;
          farCommMetaListItem['colId'] = i.colId;
          farCommMetaListItem['colName'] = i.colName;
          farCommMetaListItem['dataType'] = i.dataType;
          farCommMetaListItem['dbName'] = i.dbName;
          farCommMetaListItem['operation'] = operation[j];
          farCommMetaListItem['tbCname'] = i.tbCname;
          farCommMetaListItem['tbId'] = i.tbId;
          farCommMetaListItem['tbName'] = i.tbName;
          farCommMetaListItem['value'] = i.value[j];
          farCommMetaList.push(farCommMetaListItem);
        }
      }
      filterMetasItem['colName'] = i.colName;
      filterMetasItem['colType'] = i.colType;
      filterMetasItem['dateFlag'] = i.dateFlag;
      filterMetasItem['dbName'] = i.dbName;
      filterMetasItem['farCommMetaList'] = farCommMetaList;
      filterMetasItem['tbName'] = i.tbName;
      filterMetas.push(filterMetasItem);
    });

    let newFilterMetasJson = []; // 合并且去重后farCommMetaList的新数组
    for (const i of filterMetas) {
      let flag = true;
      for (const j of newFilterMetasJson) {
        if (j.colName === i.colName && j.tbName === i.tbName && j.dbName === i.dbName && i.colType === j.colType && i.dateFlag === j.dateFlag) {
          const farCommMetaList = [...j.farCommMetaList, ...i.farCommMetaList]
          const farCommMetaListArr = [];
          // 合并且去重后farCommMetaList的新数组
          for (const k of farCommMetaList) {
            let farCommMetaListFlag = true;
            for (const n of farCommMetaListArr) {
              if (k.colId === n.colId && k.tbId === n.tbId && k.tbName === n.tbName && k.dbName === n.dbName &&
                n.operation === k.operation && n.value === k.value && n.colName === k.colName) {
                farCommMetaListFlag = false
              }
            }
            if (farCommMetaListFlag) {
              farCommMetaListArr.push(k);
            }
          }
          j.farCommMetaList = farCommMetaListArr;
          flag = false;
        }
      }
      // 去重后的过滤数组
      if (flag) {
        newFilterMetasJson.push(i);
      }
    }
    return newFilterMetasJson;
  }

  // 获取过滤的维度数据
  getDimDescData = (flag, data) => {
    if (flag === 'edit') {
      this.props.dispatch({
        type: 'analysis/getDimDesc',
        payload: {
          colName: data.colName,
          dbName: data.dbName,
          tbName: data.tbName,
        },
      }).then(() => {
        this.props.form.setFieldsValue({ dimDesc: data.value });
      });
    } else {
      this.props.dispatch({
        type: 'analysis/getDimDesc',
        payload: {
          colName: data[0].split('-')[5],
          dbName: data[0].split('-')[1],
          tbName: data[0].split('-')[3],
        },
      });
    }
  }

  handleTableChange = (page, pageSize) => {
    this.setState({ pageSize, currentPageNum: page });
    const payload = this.state.payload;
    this.props.dispatch({
      type: 'analysis/getPageResult',
      payload: {
        autoParams: { ...payload },
        currentPageNum: page,
        pageSize: pageSize,
      },
    });
  }

  // 清除选择
  onChangeClean = (e) => {
    this.setState({ loadLeftData: true, filterInfoValue: [], filterItemList: [], });
    setTimeout(() => {
      const tableInfo = this.props.form.getFieldValue('tableInfo');
      if (tableInfo === undefined) {
        this.props.dispatch({
          type: 'analysis/getAllTableInfo',
        }).then(() => {
          const { getAllTableInfoData } = this.props.analysis;
          const expandedKeys = [];
          getAllTableInfoData.map((i) => {
            expandedKeys.push(i.dbName + '-' + i.tbId);
          });
          this.setState({ expandedKeys, checkedKeys: [], loadLeftData: false, getMainTabDateColData: [] });
          this.props.form.setFieldsValue({ filterInfo: [], mainTabDate: '', rightValue: undefined, leftValue: undefined });
        }).catch((e) => {
          message.warn(e.message);
        });
      }
    }, 100);
  }

  download = () => {
    const payload = { ...this.state.payload };
    const content = JSON.stringify(payload);
    const headerInfo = {}
    this.state.checkedKeys.map((item) => {
      const colCname = item.split('-')[0];
      const colName = item.split('-')[5];
      if (colName !== undefined) headerInfo[colName] = colCname;
    });

    this.setState({ loadList: true });
    this.props.dispatch({
      type: 'analysis/autolyDownLoad',
      payload: {
        header: JSON.stringify(headerInfo),
        content,
      }
    }).then((e) => {
      this.setState({ loadList: false });
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  // 保存查询结果
  conserve = (e) => {
    if (this.state.autoAnalyName !== undefined) {
      this.updateCommaly(e);
    } else {
      this.setState({ modelVisible: true });
    }
  }

  updateCommaly = (e) => {
    e.preventDefault();
    let searchData = [];
    const { clickCommalyData } = this.props.analysis;
    if (clickCommalyData !== undefined && clickCommalyData.commonAnalysisConfig !== undefined) {
      searchData = JSON.parse(clickCommalyData.commonAnalysisConfig);
    }
    this.conserveData(searchData, this.state.autoAnalyName, 'updateCommaly');
  }

  // 保存查询结果命名确定
  onOkModel = (e) => {
    e.preventDefault();
    let searchData = [];
    const { clickCommalyData } = this.props.analysis;
    if (clickCommalyData !== undefined && clickCommalyData.commonAnalysisConfig !== undefined) {
      searchData = JSON.parse(clickCommalyData.commonAnalysisConfig);
    }
    let autoAnalyName = document.getElementById('names').value;
    let reg = /^[\u4E00-\u9FA5A-Za-z0-9_]{1,20}$/;
    if (autoAnalyName === '') {
      message.warn('名称必填');
      return
    } else if (!autoAnalyName.match(reg)) {
      message.warn('名称长度请控制在1-20个字以内');
      return;
    } else {
      this.conserveData(searchData, autoAnalyName, 'addCommaly');
    }
    console.log(searchData)
  }

  conserveData = (searchData, autoAnalyName, flag) => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      if (values.leftValue === undefined || values.rightValue === undefined || values.leftValue === null || values.rightValue === null) {
        message.warn('时间必选');
        return;
      }
      const mainTabId = values.tableInfo.split('-')[0]; // 主表id
      const mainTabName = values.tableInfo.split('-')[2]; // 主表中文名
      const webParam = 'queryanalysis'; // 界面路由
      const mainTabDate = values.mainTabDate; // 统计时间选择字段
      const leftValue = values.leftValue.format("YYYY-MM-DD"); // 起始时间
      const rightValue = values.rightValue.format("YYYY-MM-DD"); // 终止时间
      const filterInfo = values.filterInfo; // 选择字段
      const expandedKeys = [];
      // 获取支点展开的key值
      this.state.checkedKeys.map((i) => {
        let flag = true;
        const Keys = i.split('-')[1] + '-' + i.split('-')[2];
        if (expandedKeys.indexOf(Keys) > -1) {
          flag = false
        }
        if (flag && i.split('-').length > 2) {
          expandedKeys.push(i.split('-')[1] + '-' + i.split('-')[2]);
        }
      });
      const commAutoAnalyConfig = { // 配置信息 
        mainTabDate,
        leftValue,
        rightValue,
        filterInfo,
        filterItemList: this.state.filterItemList,
        mainTableInfo: values.tableInfo,
        checkedKeys: this.state.checkedKeys,
        expandedKeys,
      };
      console.log(commAutoAnalyConfig)
      if (flag === 'addCommaly') {
        this.props.dispatch({
          type: 'analysis/addCommAutoAnaly',
          payload: {
            commAutoAnalyConfig: JSON.stringify(commAutoAnalyConfig),
            mainTabId,
            mainTabName,
            webParam,
            man: this.state.man,
            autoAnalyName,
          }
        }).then(() => {
          message.success('保存成功，可在个人工作台查看！')
          this.setState({ modelVisible: false });
        }).catch((e) => {
          message.warn(e.message);
        });
      } else {
        this.props.dispatch({
          type: 'analysis/updateCommAutoAnaly',
          payload: {
            id: this.state.id,
            commAutoAnalyConfig: JSON.stringify(commAutoAnalyConfig),
          },
        });
      }
    });
  }

  // 右边操作内容
  renderRightForm() {
    const { loading, form: { getFieldDecorator, getFieldValue },
      analysis: { getPageResultData, getDimDescData, getFilterInfoData } } = this.props;
    const { getMainTableData, getMainTabDateColData, publicMode } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    let getTableInfo = [];
    // 获取主表信息
    if (getMainTableData.length > 0) {
      getMainTableData.map((i) => {
        const list = (
          <Option value={i.tbId + '-' + i.dbName + '-' + i.tbCname + '-' + i.tbName} key={i.tbId}>{i.tbCname}</Option>
        );
        getTableInfo.push(list);
      });
    }

    const getMainTabDateCol = [];
    if (getMainTabDateColData.length > 0) {
      getMainTabDateColData.map((i) => {
        const list = (
          <Option value={i.colName + '-' + i.dataType + '-' + i.dbName + '-' + i.tbName} key={i.colCname}>{i.colCname}</Option>
        );
        getMainTabDateCol.push(list);
      });
    }

    const data = getPageResultData.result !== undefined ? getPageResultData.result : [];
    const total = getPageResultData.totalRecordCount !== undefined ? getPageResultData.totalRecordCount : 0;

    const rowKey = (record, index) => {
      return index;
    }

    return (
      <Form onSubmit={e => this.submitForm(e)} layout="inline">
        <Row style={{ border: '1px solid #dadada', borderBottom: 'none', paddingLeft: 6, }}>
          <FormItem label="主表信息" {...formItemLayout}>
            {getFieldDecorator('tableInfo', { rules: [{ required: true, message: '必选' }] })(
              <Select style={{ width: 172, }}
                onChange={e => this.onChangeClean(e)}
                onSelect={e => this.selectTbInfo(e)} allowClear
                disabled={this.state.autoAnalyName !== undefined ? true : false}
              >
                {getTableInfo.map((item) => { return item; })}
              </Select>
            )}
          </FormItem>
        </Row>
        <Row style={{ border: '1px solid #dadada', borderBottom: 'none', }}>
          <FormItem label="" {...formItemLayout}>
            <div style={{ width: 800, paddingLeft: 16, }}>
              <span style={{
                color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', margin: '0 4px 0 0', display: 'inline-block'
              }}
              >*
              </span>
              <span>统计时间</span><span style={{ margin: '0 8px 0 2px' }}>:</span>
              {getFieldDecorator(`mainTabDate`, { rules: [{ required: true, message: '必选' }] })(
                <Select style={{ width: '22%', marginRight: 4 }}>
                  {getMainTabDateCol.map((item) => { return item })}
                </Select>
              )}
              {getFieldDecorator(`leftValue`)(
                <DatePicker
                  placeholder='[起始时间]'
                  style={{ width: 170 }} />
              )}
              <span style={{ margin: '0 4px' }}>~</span>
              {getFieldDecorator(`rightValue`)(
                <DatePicker
                  placeholder='[终止时间]'
                  style={{ width: 170 }}
                />
              )}
            </div>
          </FormItem>
        </Row>
        <Collapse defaultActiveKey={['1']}>
          <Panel header="选择字段" key="1">
            <FormItem label="" {...formItemLayout}>
              {getFieldDecorator('filterInfo', { initialValue: [] })(
                <Select
                  mode="multiple"
                  notFoundContent=''
                  style={{ width: 830 }}
                  onDeselect={e => this.onDeleteItem(e)}
                >
                  {[]}
                </Select>
              )}
            </FormItem>
          </Panel>
        </Collapse>
        <Row style={{ border: '1px solid #dadada', borderTop: 'none' }}>
          <div style={{ padding: '6px 18px', background: '#fff', }}>
            <span>过滤器</span><span style={{ margin: '0 8px 0 2px' }}>:</span>
            <Button onClick={e => this.addFilter(e)}>添加过滤条件</Button>
          </div>
        </Row>
        <div style={{ margin: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button type="primary" htmlType="submit" style={{ marginRight: '10px' }}>查询</Button>
            <Button onClick={this.onCancelSearchInfo}>重置</Button>
          </div>
          <div>
            <Button type="primary" style={{ marginRight: 20 }} onClick={this.saveMode}>
              保存为{publicMode ? '个人模板' : '公共模板'}</Button>
            <Button onClick={this.download} style={{ marginRight: 10, display: this.state.downloadButFlag === true ? '' : 'none' }} type='primary'>
              导出数据
            </Button>
            <Button type="primary" onClick={e => this.conserve(e)}>保存查询</Button>
          </div>
        </div>

        <Table
          style={{ display: this.state.showTable ? '' : 'none' }}
          loading={this.state.loadList}
          rowKey={rowKey}
          columns={this.state.columns}
          dataSource={data}
          scroll={{ x: this.state.tabelScrollX }}
          bordered
          pagination={{
            current: this.state.currentPageNum,
            pageSize: this.state.pageSize,
            total: total,
            onChange: (page, pageSize) => this.handleTableChange(page, pageSize),
          }}
          title={() => { return '查询列表' }}
        />
        <div style={{ position: 'relative' }}>
          <Modal
            width={1200}
            visible={this.state.filterListModel}
            onOk={e => this.onOkFilterListModel(e)}
            okText={'保存'}
            onCancel={e => this.onCanelFilterListModel(e)}
            destroyOnClose={true}
            title={'添加过滤条件'}
            footer={null}
            closable={false}
          >
            <div style={{ position: 'absolute', top: 10, right: 20 }}>
              <Button style={{ marginRight: 10 }} onClick={e => this.onOkFilterListModel(e)} type='primary'>保存</Button>
              <Button onClick={e => this.onCanelFilterListModel(e)}>取消</Button>
            </div>
            <QueryAnalyFilter
              root={this}
              getDimDescData={getDimDescData}
              getFilterInfoData={getFilterInfoData}
              filterItemList={this.state.filterItemList}
              filterExpandedKeys={this.state.filterExpandedKeys}
              {...this.props}
            />
          </Modal>
        </div>
      </Form>
    );
  }

  render() {
    const { getAllTableInfoData } = this.props.analysis;
    const data = getAllTableInfoData.length > 0 ? getAllTableInfoData : [];
    return (
      <PageHeaderLayout>
        <div style={{ display: 'flex', height: '100%' }}>
          <Card bordered={false} style={{ overflowY: 'scroll', width: '20%' }}>
            <QueryAnalyLeftComponent root={this} {...this.props} getAllTableInfoData={data} expandedKeys={this.state.expandedKeys} />
          </Card>
          <Card bordered={false} style={{ overflowY: 'scroll', flex: 1 }} id='top'>
            {this.renderRightForm()}
          </Card>
        </div>
        <Modal
          visible={this.state.modelVisible}
          onOk={e => this.onOkModel(e)}
          onCancel={e => { this.setState({ modelVisible: false }) }}
          destroyOnClose={true}
          title='常用自助分析命名'
        >
          <div><span>名称</span><Input id='names' style={{ width: '60%', marginLeft: 10 }} /></div>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
