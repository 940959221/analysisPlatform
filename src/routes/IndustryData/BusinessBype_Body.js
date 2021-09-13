import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Collapse, Card, Radio, Select, Button, Table, Modal, Spin, message, Cascader } from 'snk-web';
import IndustryData from '../../components/IndustryData';
import axios from 'axios';

const dataSource = [
  { label: '渠道', value: 'zbx_cha_query' },
  { label: '车辆细类', value: 'zbx_car_query' },
  { label: '新旧车', value: 'zbx_new_old_query' }
];
const cssObj = {
  tongji: { display: 'none' },
  dataSource,
  area: '地区',
  width: { width: 350 },
  // body: {  }
}

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class BusinessBype_Body extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      radioValue: '',
      area: [],
      company: [],
      risk: [],
      dataDate: [],
      timeChange: [],
      areaChange: [],
      bodyChange: [],
      riskChange: [],
      showItemName: '',   // 因为后端数据的问题，这里临时一个变量储存隐藏的下拉名
      getQuotaData: [],
      checkedItem: {},
      getSelectData: [],
      queryInsuranceData: [],
      pageSizeList: [],   // 所有表格的每页数据量集合
      current: 0,  // 点击查询时重置所有表格的当前页为第一页
      modalShow: false,  // 点击导出时候的弹窗是否显示
      titleList: [],  // 用于储存所有的表格名
      exportList: [], // 选择的需要导出的表格名
      cssObj,   // 根据不同的菜单给定部分样式以及对象等
      beginChange: false,   // 暂时无意义
      indexMap: {},
    }
  }

  componentWillMount() {
    this.props.dispatch({
      type: 'analysis/InitialCoverage',
    }).then(() => {
      const { InitialCoverageData: { area, company, risk, dataDate } } = this.props.analysis;
      // 检测到后端数据有合计传过来，把合计调整到第一位
      const areaIndex = area.indexOf('合计');
      const companyIndex = company.indexOf('合计');
      if (areaIndex !== -1) {
        const value = area.splice(areaIndex, 1);
        area.unshift(value[0])
      }
      // if(companyIndex === -1) company.unshift('合计');     // 这步是没有合计就给他插入，现在剔除这个
      this.setState({ area, company, risk, dataDate });
    }).catch((e) => {
      message.warn(e.message)
    })
  }

  // 先清除不需要的dom元素，脱离文档流有些情况会影响，同时把form组件给定一个值
  componentDidMount() {
    document.getElementById('tongji').remove();
    this.formRef.setItemsValue({ 'caliber': '1' })
  }

  // 数据源单选框监听
  radioChange(e) {
    this.formRef.changeChecked();
    this.formRef.setItemsValue({ 'business': [] });
    const riskChange = this.state.riskChange;
    this.props.dispatch({
      type: 'analysis/getSelectData',
      payload: {
        tableName: e.target.value
      }
    }).then(() => {
      const { getSelectData } = this.props.analysis;
      const getSelectDataIndex = getSelectData.indexOf('合计');
      if (getSelectDataIndex !== -1) {
        const value = getSelectData.splice(getSelectDataIndex, 1);
        getSelectData.unshift(value[0])
      }
      this.setState({ getSelectData })
    })
    let showItemName;
    switch (e.target.value) {
      case 'zbx_cha_query': showItemName = '渠道';
        break;
      case 'zbx_car_query': showItemName = '车辆细类';
        break;
      case 'zbx_new_old_query': showItemName = '新旧车';
        break;
    }
    this.setState({
      radioValue: e.target.value,
      showItemName
    });
    if (riskChange.length > 0) this.getQuota(e.target.value, riskChange);
  }

  // 点击全选
  chooseAll = (obj) => {
    const { InitialCoverageData: { area, company }, getSelectData } = this.props.analysis;
    switch (obj) {
      case 'area': this.formRef.setItemsValue({ 'area': area }); break;
      case 'company': this.formRef.setItemsValue({ 'company': company }); break;
      case 'business': this.formRef.setItemsValue({ 'business': getSelectData }); break;
    }
  }

  // 点击清除
  clearAll = (obj) => {
    this.formRef.setItemsValue({ [obj]: [] });
  }

  // 险种监听
  riskChange(e) {
    const formItem = this.formRef.getItemsValue();
    const riskArr = [];
    const value = formItem.tableName;
    e.forEach(item => {
      switch (item) {
        case '车险': riskArr.push('car');
          break;
        case '交强险': riskArr.push('tfc');
          break;
        case '商业险': riskArr.push('com');
      }
    })
    this.setState({
      riskChange: riskArr
    })
    if (e.length === 0) this.setState({ checkedItem: {}, getQuotaData: [] })
    if (value !== '' && e.length > 0) this.getQuota(value, riskArr);
  }

  // 在数据源和险种都有值的情况下获取指标
  getQuota(radio, risk) {
    this.props.dispatch({
      type: 'analysis/getQuota',
      payload: {
        tableName: radio,
        risk: risk
      }
    }).then(() => {
      const { getQuotaData } = this.props.analysis;
      this.setState({ getQuotaData })
    })
  }

  // 点击查询
  queryData = (state, values) => {
    const { getQuotaData } = this.props.analysis;
    const { showItemName } = this.state;
    const excelIndex = [];      // 生成表格会根据维度的顺序进行排序，以为左侧有可点击的上下箭头，这里存放当前顺序
    const dataSet = document.querySelectorAll('.getDataSet');  // 获取所有需要排序的元素
    const checkedItem = state.checkedItem;
    const { tableName, datadate, company, risk, area, business } = values;
    for (let i of dataSet) {
      excelIndex.push(i.dataset.set);
    }
    this.setState({ current: 1 });  // 校验通过后设定current为1重置页码，同时在数据获取成功后再进行切换，不然之后点击时当前页始终为1
    // console.log(121212);
    // console.log({
    //   area, business, company, datadate, indexMap: checkedItem, tableName
    // });
    // return
    this.props.dispatch({
      type: 'analysis/queryInsurance',
      payload: {
        tableName: showItemName,
        table: tableName,
        datadate,
        company,
        risk,
        area,
        business,
        indexMap: checkedItem,
        excelIndex
      }
    }).then(() => {
      const { queryInsuranceData: { data, indic } } = this.props.analysis;
      const pageSizeList = [];   // 把所有表格数据的每页数量分别存入数组
      const indexMap = indic.indexMap;
      data.forEach(item => {
        pageSizeList.push(item.pageSize);
      });
      this.setState({ queryInsuranceData: data, pageSizeList, current: 0, indexMap });
    })
  }

  // 重置
  reset = () => {
    this.formRef.setItemsValue({ 'business': [], 'area': [], 'tableName': '', 'datadate': [], 'company': [], 'risk': [] });
    this.setState({ checkedItem: {}, getQuotaData: [], radioValue: '' });
  }

  // 表格头部
  getColumns(item) {
    const { queryInsuranceData: { data } } = this.props.analysis;
    const columns = [];
    if (data.length > 0) {
      for (let i of item.orderIndex) {
        i.width = 120;
        i.title = i.dataIndex;
        i.align = 'center';
        switch (i.title) {
          case '统计时间': i.width = 100;
            break;
          case '地区': i.width = 85;
            break;
          case '险种': i.width = 85;
            break;
          default: i.width = 120;
            break;
        }
        columns.push(i);
      }
    }
    return columns;
  }

  // 表格数据
  getDataSource(arr) {
    const dataSource = [];
    arr.data.forEach((item, i) => {
      item.key = i + 1;
      // for (let j of arr.indexArray) {      // 根据返回数据需要展示的所有指标进行查找，没有值的给空
      //   if (item[j.indexDetail] === undefined) {
      //     item[j.indexDetail] = '';
      //   }
      // }
    })
    dataSource.push(arr.data);
    return arr.data;
  }

  // 修改表格的每页数量
  changePageSize = (pageSize, current, obj, index) => {
    const { indic: { tableName, datadate, company, risk, area, business, excelIndex, table } } = this.props.analysis.queryInsuranceData;
    // const { indic:  } = obj;
    // 先同步修改pageSize，再异步获取需要加载的内容，用于展示
    const { pageSizeList, indexMap } = this.state;
    pageSizeList.splice(index, 1, pageSize)
    this.setState({ pageSizeList })

    // console.log({
    //   area, business, company, datadate, indexMap: map, page: current, pageSize, tableName
    // });
    // return
    this.props.dispatch({
      type: 'analysis/queryInsurance',
      payload: {
        tableName,
        table,
        datadate: datadate,
        company,
        risk,
        area,
        business,
        indexMap: {
          [obj.index]: indexMap[obj.index]
        },
        page: current,
        pageSize: pageSize,
        excelIndex
      }
    }).then(() => {
      const { queryInsuranceData: { data } } = this.props.analysis;
      const arr = this.state.queryInsuranceData;
      arr.splice(index, 1, data[0]);
      this.setState({ queryInsuranceData: arr, beginChange: true });
    })
  }

  // 导出表格
  exportExcel(tName) {
    var url = `${SERVER}/iap/ciitc/zbxExcelNew`;
    const datas = this.props.analysis.queryInsuranceData;
    const { indexMap, queryInsuranceData } = this.state;
    let map = {};
    const { indic: { tableName, datadate, company, risk, area, business, excelIndex, table } } = datas;
    let pageMap = {};
    for (let i of queryInsuranceData) {
      for (let j of tName) {
        if (j === i.index) {
          pageMap[j] = [i.page, i.pageSize];
          map[j] = indexMap[j];
        }
      }
    }
    let payload = {
      tableName,
      datadate,
      company,
      risk,
      area,
      business,
      indexMap: map,
      pageMap,
      table,
      excelIndex
    }

    // 导出excel表格，用form表单提交的方式，因为传递过来的是一个数据流，用dva会导致返回数据被JSON解析错误
    let content = JSON.stringify(payload);
    let TargetFrame = document.createElement("iframe");
    TargetFrame.setAttribute("name", 'download_frame');
    TargetFrame.setAttribute("style", "display:none");
    document.body.appendChild(TargetFrame);

    let form = document.createElement("form");
    form.setAttribute("style", "display:none");
    form.setAttribute("target", "download_frame");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);
    form.setAttribute('enctype', 'multipart/form-data');

    let input3 = document.createElement("input");
    input3.setAttribute("type", "hidden");
    input3.setAttribute("name", "content");
    input3.setAttribute("value", content);
    form.appendChild(input3);

    document.body.appendChild(form);
    form.submit();
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <IndustryData wrappedComponentRef={(form) => this.formRef = form}
          excelObj='起保口径'
          queryInsuranceData='queryInsuranceData'
          useButton={true}
          parentProps={this.props} root={this}></IndustryData>
      </div>
    )
  }
}