import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Collapse, Card, Radio, Select, Button, Table, Modal, Spin, message, Cascader } from 'snk-web';
import IndustryData from '../../components/IndustryData';


const dataSource = [
  { label: '渠道', value: '渠道' },
  { label: '车辆细类', value: '车辆细类' },
  { label: '新旧车', value: '新旧车' },
  { label: '主体', value: '主体' }
];
const cssObj = {
  // tongji: {  },
  dataSource,
  area: '机构',
  width: { width: 260 },
  body: { display: 'none' }
}

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class businessOrgan extends PureComponent {
  state = {
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
    /////////////////////////////////////////////////////
    cascaderList: [],   // 分三级里面联级选择的列表,
    areaObj: [],    // 分三级里面每个地区的对象集合
    cascaderValue: [],
    beginChange: false,  // 暂时无意义
    indexMap: {}
  };

  componentWillMount() {
    this.props.dispatch({
      type: 'analysis/getInitialConditions',
    }).then(() => {
      const { getInitialConditionsData: { area, agency, dataDate, risk } } = this.props.analysis;
      const arr = [];
      for (let i of area) {
        let obj = {};
        // if(agency === '总部'){
        obj = {
          value: i.companyName,
          label: i.companyName,
          isLeaf: false,
          parent: 'parent',
          length: i.cityList ? i.cityList.length : 0
        }
        // }else{
        //   obj = {
        //     value: i.companyName,
        //     label: i.companyName,
        //     isLeaf: false,
        //     parent:'parent',
        //     length: i.cityList.length
        //   }
        // }
        arr.push(obj);
      }
      this.setState({ dataDate, risk, cascaderList: arr })
    }).catch((e) => {
      message.warn(e.message)
    })
  }

  // 先清除不需要的dom元素，脱离文档流有些情况会影响，同时把form组件给定一个值
  componentDidMount() {
    document.getElementById('body').remove();
    this.formRef.setItemsValue({ 'company': ['1'] });
  }

  // 统计口径单选框监听
  caliberChange(e) {
    const formItem = this.formRef.getItemsValue();
    const tableName = formItem.tableName;
    const risk = this.state.riskChange;
    if (tableName !== '') {
      this.setState({ radioValue: e.target.value });
      this.get_weidu(e.target.value, tableName);
    }
    this.formRef.setItemsValue({ 'business': [] });
    if (risk.length > 0) this.getQuota(e.target.value, risk);
  }

  // 数据源监听
  radioChange(e) {
    const formItem = this.formRef.getItemsValue();
    const caliber = formItem.caliber;
    if (caliber !== '') {
      this.setState({ radioValue: e.target.value });
      this.get_weidu(caliber, e.target.value);
    }
    this.setState({ showItemName: e.target.value });
    this.formRef.setItemsValue({ 'business': [] });
  }

  // 险种监听
  riskChange(e) {
    const formItem = this.formRef.getItemsValue();
    const riskArr = [];
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
    const caliber = formItem.caliber;
    if (e.length === 0) this.setState({ checkedItem: {}, getQuotaData: [] })
    if (caliber !== '' && e.length > 0) this.getQuota(caliber, riskArr);
  }

  // 在统计口径和险种都有值的情况下获取指标
  getQuota(caliber, risk) {
    this.props.dispatch({
      type: 'analysis/getIndex',
      payload: {
        caliber,
        risk
      }
    }).then(() => {
      const { getIndexData } = this.props.analysis;
      this.setState({ getQuotaData: getIndexData })
    })
  }

  // 在统计口径和数据源都有值的情况下获取下拉数据
  get_weidu(caliber, tableName) {
    this.props.dispatch({
      type: 'analysis/getBusiness',
      payload: {
        tableName,
        caliber
      }
    }).then(() => {
      const { getBusinessData } = this.props.analysis;
      const getSelectDataIndex = getBusinessData.indexOf('合计');
      if (getSelectDataIndex !== -1) {
        const value = getBusinessData.splice(getSelectDataIndex, 1);
        getBusinessData.unshift(value[0])
      }
      this.setState({ getSelectData: getBusinessData })
    })
  }

  // 地区选择后加载子级
  loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    // 先行判定，如果选择的是没有parent属性的就是二级且没有子项，如果没有length属性的就是一级没有子项
    // 这两种情况全部不判定，两个属性均设在初始父级
    if (!targetOption.parent || targetOption.length === 0) return;
    const itmeArr = [];
    let getChild = true;
    const { area } = this.props.analysis.getInitialConditionsData;
    const areaObj = area.filter(item => item.companyName === targetOption.label)[0];    // 过滤出需要编入子项的对象
    targetOption.loading = true;
    setTimeout(() => {
      targetOption.loading = false;
      if (areaObj.cityList.length > 0) {
        for (let i of areaObj.cityList) {
          const item = {
            value: i.city,
            label: i.city,
            isLeaf: false,  //  没有子项的应该给true，但是此处需求要可以多选，如果为true选择该项后下拉就会关闭，效果不好
          }
          itmeArr.push(item)
        }
      } else getChild = false;
      if (getChild) targetOption.children = itmeArr;
      this.setState({
        cascaderList: [...this.state.cascaderList],
      });
    }, 200);
  }

  // 地区联级选择的展示
  renderSelect(label) {
    if (label.length !== 0) {
      return label[0];
    }
  }

  // 选择地区
  changeCascader = (value, selectedOptions) => {
    let val = value.slice(-1)[0];   // 自定义
    let arr = this.state.areaObj;
    let noPush = false;
    let parent = value.slice(-2, -1)[0];
    let option = [];
    if (value.length < 2) {    // 如果长度小于2就只有省级，改变parent和val
      parent = '';
      val = value[0];
    }
    let obj = { parent, val, isParent: '' };
    if (value.length === 1) obj = { parent, val, isParent: val + 'true' }   // 如果长度为1就只有省级，改变obj
    if (arr.length > 0) {    // 二次及以上的选择
      if (obj.parent === '') {
        arr = arr.filter(item => item.parent !== obj.val);
      }
      else arr = arr.filter(item => item.isParent !== obj.parent + 'true');
      for (let i of arr) {
        if (JSON.stringify(i) === JSON.stringify(obj)) noPush = true;
      }
      if (!noPush) arr.push(obj);
      this.setState({ areaObj: arr });
    } else {    // 初次选择
      arr.push(obj);
      this.setState({ areaObj: arr });
    }
    for (let i of arr) {
      if (i.parent !== '') option.push(i.parent + '·' + i.val);
      else option.push(i.val);
    }
    this.formRef.setItemsValue({ 'area': option });
    this.setState({ cascaderValue: value });
  }

  // 删除机构的下拉项后删除aeraObj的对应项
  deselect = (value) => {
    let { areaObj } = this.state;
    const arr = value.split('·');
    for (let i in areaObj) {
      // 如果删除的是父级项，则因为没有后面没有跟上市级单位使用else if
      if (areaObj[i].parent === arr[0] && areaObj[i].val === arr[1]) areaObj.splice(i, 1)
      else if (arr[1] === undefined && areaObj[i].val === arr[0]) areaObj.splice(i, 1)
    }
    this.setState({ areaObj })
  }

  // 机构全选
  chooseAll = (filed) => {
    switch (filed) {
      case 'area': {
        const { getInitialConditionsData: { area, agency } } = this.props.analysis;
        const option = [];
        const areaObj = [];          // 后面需要根据这个去获取数据，所以只要修改机构就必须修改areaObj
        if (agency === '总部') {
          for (let i of area) {
            option.push(i.companyName);
            areaObj.push({ parent: '', val: i.companyName, isParent: `${i.companyName}true` })
          }
        } else {
          for (let i of area[0].cityList) {
            option.push(i.city);
            areaObj.push({ parent: area[0].companyName, val: i.city, isParent: '' })
          }
        }
        this.formRef.setItemsValue({ 'area': option });
        this.setState({ areaObj })
      }; break;
      case 'business': {
        const { getBusinessData } = this.props.analysis;
        this.formRef.setItemsValue({ 'business': getBusinessData });
      }
    }
  }

  // 机构全清
  clearAll = (filed) => {
    this.formRef.setItemsValue({ [filed]: [] });
    switch (filed) {
      case 'area': this.setState({ areaObj: [] }); break;
      case 'business': this.setState({ timeChange: [] }); break;
    }
  }

  // 点击查询
  queryData(state, values) {
    const checkedItem = state.checkedItem;
    const { caliber, tableName, datadate, risk, business } = values;
    const areaObj = state.areaObj;
    const agencyMap = {};
    const excelIndex = [];      // 生成表格会根据维度的顺序进行排序，以为左侧有可点击的上下箭头，这里存放当前顺序
    const dataSet = document.querySelectorAll('.getDataSet');  // 获取所有需要排序的元素
    let parent = [], dataDate;
    // 在datadate上面拼上‘旬’，如果没有则不拼
    if (this.props.analysis.getXunByMonthData.xunDate) dataDate = [datadate + '_' + values.xun];
    else dataDate = [datadate];
    for (let i of dataSet) {
      excelIndex.push(i.dataset.set);
    }
    for (let i of areaObj) {
      if (i.parent !== '') parent.push(i.parent);
      else parent.push(i.val);
    }
    parent = parent.filter((item, index) => parent.indexOf(item) === index);
    for (let i of parent) {
      agencyMap[i] = [];
      for (let j of areaObj) {
        if (j.parent === i) agencyMap[i].push(j.val);
      }
    }
    this.setState({ current: 1 });  // 校验通过后设定current为1重置页码，同时在数据获取成功后再进行切换，不然之后点击时当前页始终为1
    this.props.dispatch({
      type: 'analysis/getZbxMarketData',
      payload: {
        caliber,
        type: tableName,
        datadate: dataDate,
        agencyMap,
        risk,
        business,
        indexMap: checkedItem,
        excelIndex
      }
    }).then(() => {
      const { getZbxMarketData: { indic, data } } = this.props.analysis;
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
    this.setState({ cascaderValue: [] });
    this.formRef.setItemsValue({ 'business': [], 'area': [], 'tableName': '', 'datadate': [], 'caliber': [], 'risk': [] });
    this.setState({ checkedItem: {}, getQuotaData: [], radioValue: '', areaObj: [] });
  }

  // 表格头部
  getColumns(item) {
    const { getZbxMarketData: { data } } = this.props.analysis;
    const columns = [];
    if (data.length > 0) {
      for (let i of item.orderIndex) {
        i.width = 120;
        i.title = i.dataIndex;
        i.align = 'center';
        switch (i.title) {
          case '统计时间': i.width = 100;
            break;
          case '机构': i.width = 85;
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
      item.key = i;
      // for (let j of arr.indexArray) {      // 根据返回数据需要展示的所有指标进行查找，没有值的给空
      //   if (item[j.indexDetail] === undefined) {
      //     item[j.indexDetail] = '';
      //   }
      // }
      // // 此处用于机构把省级和市级进行拼接，初始化拼一次，后面不再拼
      // if (item.company.split('-').length === 1) {
      //   if (item.cenCompany) {
      //     item.company = item.company + '-' + item.cenCompany;
      //   }
      // }
    })
    dataSource.push(arr.data);
    return arr.data;
  }

  // 修改表格的每页数量
  changePageSize(pageSize, current, obj, index) {
    const { indic: { caliber, agencyMap, type, dataDate, risk, business, excelIndex } } = this.props.analysis.getZbxMarketData;
    // 先同步修改pageSize，再异步获取需要加载的内容，用于展示
    const { pageSizeList, indexMap } = this.state;
    pageSizeList.splice(index, 1, pageSize)
    this.setState({ pageSizeList })
    this.props.dispatch({
      type: 'analysis/getZbxMarketData',
      payload: {
        caliber,
        agencyMap,
        type,
        datadate: dataDate,
        risk,
        business,
        indexMap: {
          [obj.index]: indexMap[obj.index]
        },
        page: current,
        pageSize: pageSize,
        excelIndex
      }
    }).then(() => {
      const { getZbxMarketData: { data } } = this.props.analysis;
      const arr = this.state.queryInsuranceData;
      arr.splice(index, 1, data[0]);
      this.setState({ queryInsuranceData: arr, beginChange: true });
    })
  }

  // 导出表格
  exportExcel(tName) {
    var url = `${SERVER}/iap/ZbxAgencyData/zbxExcelNew`;
    const datas = this.props.analysis.getZbxMarketData;
    const { indexMap, queryInsuranceData } = this.state;
    let map = {};
    const { indic: { type, dataDate, caliber, risk, business, excelIndex, agencyMap } } = datas;
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
      caliber,
      type,
      datadate: dataDate,
      agencyMap,
      risk,
      business,
      indexMap: map,
      pageMap,
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

  // 点击统计时间后获取上中下旬
  getXun = (e) => {
    this.formRef.setItemsValue({ xun: [] })
    this.props.dispatch({
      type: 'analysis/getXunByMonth',
      payload: {
        month: e
      }
    })
  }


  render() {
    return (
      <div style={{ height: '100%' }}>
        <IndustryData wrappedComponentRef={(form) => this.formRef = form}
          excelObj='分三级机构'
          queryInsuranceData='getZbxMarketData'
          parentProps={this.props}
          tags={true}
          xun={true}                // 这个用于三级机构是否展示上下旬
          xunData='getXunByMonthData'
          root={this}></IndustryData>
      </div>
    )
  }
}