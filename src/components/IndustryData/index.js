import React, { PureComponent } from 'react';
import { connect } from 'dva';
import ExportJsonExcel from 'js-export-excel';   // 导出excel
import { Form, Collapse, Card, Radio, Select, Button, Table, Modal, Spin, message, Cascader } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const upIcon = require('../../assets/up.png');
const downIcon = require('../../assets/down.png');

const { Panel } = Collapse;
// --------------------------------- CSS 样式 -------------------------------------
const itemBox = {
  display: 'flex',
  alignItems: 'center',
  margin: '3px 0'
}
const butBox = {
  width: 48,
  height: 21,
  display: 'flex',
  justifyContent: 'flex-end',
  marginRight: 5,
}
const commentStyle = {
  height: '100%',
  width: '21px',
}
const upBut = {
  marginLeft: 6,
  background: `url(${upIcon}) no-repeat`
}
const downBut = {
  background: `url(${downIcon}) no-repeat`,
}
const itemDiv = {
  display: 'flex',
  alignItems: 'center',
  width: 500,
}
const textStyle = {
  display: 'inline-block',
  marginRight: 8,
  width: 58,
}
const getQuotaStyle = {
  height: '50px',
  display: 'flex',
  position: 'relative'
}
const spanStyle = {
  cursor: 'pointer',
  marginLeft: 4
}
const getQuotaItemStyle = {
  position: 'absolute',
  width: '1000px',
  left: '0',
  top: '30px',
  display: 'none'
}


@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()

export default class IndustryData extends PureComponent {
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
      cssObj: {},   // 根据不同的菜单给定部分样式以及对象等
      /////////////////////////////////////////////////////
      cascaderList: [],   // 分三级里面联级选择的列表,
      areaObj: [],    // 分三级里面每个地区的对象集合
      cascaderValue: [],  // 联级选择的值
      updateChecked: true,   // 更改数据源后清空复选框指标
      beginChange: false     // 暂时无意义
    }
  }

  componentWillReceiveProps(props, nextProps) {
    this.setState(props.root.state);
  }

  // 界面加载完后调整antd的元素属性
  componentDidMount() {
    // 修改Card标签主体的高度
    document.querySelector('.ant-card-body').style.height = '100%';

    // 修改加载动画界面Spin的高度
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';

    // 修改维度的子项属性，在选择很多的选项时维度名称可以居中
    const form_item = document.querySelectorAll('.ant-form-item-children');
    for (let i of form_item) {
      i.style.display = 'flex';
      i.style.alignItems = 'center';
    }
    this.handleElementScroll(document.getElementById('form'));
  }

  // 滚动条滚动事件
  handleElementScroll(element) {
    if (!element) return;
    element.onscroll = (e) => {
      if (e.srcElement.scrollTop > 50) this.topButton.style.display = 'block';
      else this.topButton.style.display = 'none';
    }
  }

  changeChecked = () => {
    for (let i in this.state.checkedItem) {
      delete this.state.checkedItem[i]
    }
  }

  // 获取当前form表单值，用于传递到父组件
  getItemsValue = () => {
    const valus = this.props.form.getFieldsValue();
    return valus;
  }

  // 父组件修改form表单值
  setItemsValue = (el) => {
    this.props.form.setFieldsValue(el);
  }

  // 点击指标获取子项
  clickMeasure(e) {
    const itemName = e.target.innerHTML;
    const dom = document.getElementById(itemName);
    const domList = document.querySelectorAll('.getQuotaItem');
    const spanList = document.querySelectorAll('.parentName');
    for (let i of domList) {
      if (i.getAttribute('id') !== itemName) i.style.display = 'none';
      else i.style.display = 'block';
    }
    for (let i of spanList) {
      if (i.innerHTML === itemName) i.style.color = 'red';
      else i.style.color = 'black';
    }
  }

  // 选中父级指标
  checkedParent(e, id) {
    const checkParent = e.target.checked;
    const checkedItem = this.state.checkedItem;
    const indexName = e.target.getAttribute('data-set');
    const { getQuotaData, updateChecked } = this.state;
    const domList = document.getElementById(id).getElementsByTagName('input');
    let itemList;
    if (!checkedItem[indexName]) checkedItem[indexName] = [];
    // 获取父级下面子项的数组
    for (let i of getQuotaData) {
      if (i.indexName === indexName) itemList = i.zbxindex;
    }
    // 点击父级，子项跟着变化
    for (let i of domList) {
      i.checked = checkParent
    }
    // 选中父级后把所有子项添加再去重
    // 未选中则为避免取消一个子项，父级跟着变化会导致触发所有子项均删除，所以根据子项有多少是未选中状态进行判定
    if (checkParent) {
      if (itemList[0] !== null) {
        itemList.forEach(item => {
          checkedItem[indexName].push(item.indexName)
        })
        const arr = checkedItem[indexName].filter((item, i) => checkedItem[indexName].indexOf(item) === i)
        checkedItem[indexName] = arr;
        this.setState({ checkedItem })
      } else {
        checkedItem[indexName] = [];
      }
    } else {
      if (itemList[0] !== null) {
        let arr = checkedItem[indexName];
        for (let i of domList) {
          if (!i.checked) {
            const itemIndexDetail = i.getAttribute('data-set');
            arr = arr.filter(item => item !== itemIndexDetail);
          }
        }
        checkedItem[indexName] = arr;
        if (arr.length === 0) delete checkedItem[indexName];
        this.setState({ checkedItem })
      } else {
        delete checkedItem[indexName];
        this.setState({ checkedItem })
      }
    }
  }

  // 选中子级指标
  checkedChild(e, id) {
    const checkedItem = this.state.checkedItem;
    const checkedChild = e.target.checked;
    const parentChecked = document.getElementById(id);
    const itemId = parentChecked.getAttribute('value');
    const domList = document.getElementById(itemId).getElementsByTagName('input');
    const indexName = e.target.getAttribute('data-set');
    const indexDetailParent = e.target.getAttribute('data-parent');
    if (!checkedItem[indexDetailParent]) checkedItem[indexDetailParent] = [];
    if (checkedChild) {
      checkedItem[indexDetailParent].push(indexName);
      this.setState({ checkedItem });
      let checkedAll = true;
      for (let i of domList) {
        if (i.checked === false) checkedAll = false;
      }
      if (checkedAll) parentChecked.checked = true;
    } else {
      const arr = checkedItem[indexDetailParent].filter(item => item !== indexName);
      checkedItem[indexDetailParent] = arr;
      if (arr.length === 0) delete checkedItem[indexDetailParent];
      this.setState({ checkedItem });
      parentChecked.checked = false;
    }
  }

  // 点击数据源旁边的箭头切换位置
  clickSpan(id, flag) {
    const dom = document.getElementById(id);
    const nextDom = dom.nextElementSibling;
    const prevDom = dom.previousElementSibling;
    const parent = document.getElementById('box');
    if (flag === 'up') {
      if (prevDom.children[0].children[1].style.display === 'none') {
        prevDom.children[0].children[1].style.display = 'block';
        dom.children[0].children[1].style.display = 'none';
      } else if (dom.children[0].children[0].style.display === 'none') {
        dom.children[0].children[0].style.display = 'block';
        prevDom.children[0].children[0].style.display = 'none';
      }
      parent.insertBefore(dom, prevDom)
    } else {
      if (dom.children[0].children[1].style.display === 'none') {
        dom.children[0].children[1].style.display = 'block';
        nextDom.children[0].children[1].style.display = 'none';
      } else if (nextDom.children[0].children[0].style.display === 'none') {
        nextDom.children[0].children[0].style.display = 'block';
        dom.children[0].children[0].style.display = 'none';
      }
      parent.insertBefore(nextDom, dom)
    }
  }

  // 点击查询
  queryData() {
    const { validateFields } = this.props.form;
    const checkedItem = this.state.checkedItem;
    validateFields((err, values) => {
      if (err) return;
      if (JSON.stringify(checkedItem) === '{}') {
        message.warn('查询错误，请先勾选[指标]');
        return;
      }
      this.props.root.queryData(this.state, values);   // 调用父组件方法
    })
  }

  // 表格的分页信息
  paginationProps(obj, index) {
    const paginationProps = {
      pageSize: this.state.pageSizeList[index],
      showSizeChanger: true,
      onShowSizeChange: (current, pageSize) => this.props.root.changePageSize(pageSize, current, obj, index),
      onChange: (current, pageSize) => this.props.root.changePageSize(pageSize, current, obj, index),
      showTotal: () => `共${obj.count}条数据`,
      total: obj.count,
      pageSizeOptions: ['10', '20', '50', '100', '150', '200', '300', '500', '700', '1000'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    if (this.state.current === 1) paginationProps.current = 1;
    return paginationProps;
  }

  // 点击导出表格
  export() {
    const length = this.state.queryInsuranceData.length;
    console.log(this.state.queryInsuranceData);

    if (length === 0) {
      message.warn('请先点击[查询]获取表格数据后再进行导出');
      return;
    } else if (length === 1) {
      const arr = [];
      arr.push(this.state.queryInsuranceData[0].index); // 传递表的名字
      // this.exportTable(arr);
      this.props.root.exportExcel(arr);   // 使用父组件导出excel方法
    } else {
      const titleList = [];
      this.state.queryInsuranceData.forEach(element => {
        titleList.push(element.index)
      });
      this.setState({ modalShow: true, titleList })
    }
  }

  // ------------------------------ 该方法导出的excel不能产生sheet页，多个excel不能集合到一张表上，现已停用，使用后端方法 ----------------------
  // // 导出表格的方法
  exportTable(tName) {
    const data = this.state.queryInsuranceData;
    const willExport = [];  // 需要被导出表格的集合
    // 先确定需要导出的表
    for (let i of data) {
      for (let j of tName) {
        if (j === i.indexName) willExport.push(i);
      }
    }
    // 再根据需要导出的表格进行遍历，根据表格数量循环几次
    for (let i of willExport) {
      const option = {};
      const dataTable = [];
      let title = [];
      // 遍历数据同时创建excel头部对象
      for (let k of i.zbxData) {
        // 初始头部对象使用后端对应字段赋值
        let obj;
        switch (this.props.excelObj) {     //  根据父组件传递的excelObj来创建excel的头部
          case '分三级机构':
            obj = {
              [`数据源（${i.tableName}）`]: 'data',
              '统计时间': 'dataDate',
              '机构': 'company',
              '险种': 'risk',
            };
            break;
          case '起保口径':
            obj = {
              [`数据源（${i.tableName}）`]: 'data',
              '统计时间': 'dataDate',
              '地区': 'area',
              '主体': 'company',
              '险种': 'risk',
            }
            break;
        }
        // 补齐obj中剩余指标属性和值，该属性和值每个表不相同，需要遍历
        for (let j of i.indexArray) obj[j.indexName] = j.indexName;
        // 根据obj的值作为属性名去对应查找值，有值就替换，没有就重新赋值空
        for (let o in obj) {
          if (!k[obj[o]]) obj[o] = '';
          else obj[o] = k[obj[o]];
          title.push(o);    // 保存所有的属性名
        }
        dataTable.push(obj);
      }
      // 因为属性名在保存过程中被外层循环额外遍历了，所有需要去重
      title = title.filter((item, index) => title.indexOf(item) === index);
      option.fileName = `${i.indexName}数据报表`;
      option.datas = [{
        sheetData: dataTable,
        sheetName: 'sheet',
        sheetFilter: title,
        sheetHeader: title,
      }]
      let toExcel = new ExportJsonExcel(option);
      toExcel.saveExcel();
    }
  }
  //  -------------------------------------------------------------------------------------------------------------------------------------

  // 弹窗点击确定和关闭
  chooseTable(value) {
    if (value) {
      if (this.state.exportList.length === 0) {
        message.warn('请先选择需要导出的表格！');
        return;
      }
      // this.exportTable(this.state.exportList);
      this.props.root.exportExcel(this.state.exportList);  // 使用父组件导出excel方法
    }
    this.setState({ modalShow: false, exportList: [] })
  }

  // 点击置顶按钮
  isTop() {
    let top = document.getElementById('form').scrollTop;
    let timer = setInterval(() => {
      top -= 100;
      if (top <= 0) {
        document.getElementById('form').scrollTop = 0;
        clearInterval(timer);
      }
      document.getElementById('form').scrollTop = top;
    }, 5);
  }


  renderForm() {
    const dataSource_caliber = [
      { label: '投保口径', value: 'zbx_apply_query' },
      { label: '起保口径', value: 'zbx_start_query' }
    ];
    ///////////////////////////////////

    const { form: { getFieldDecorator }, tags, xun, xunData } = this.props;
    //  此处的queryInsuranceData由父组件带参数过来，因为请求地址不同，analysis对应数据不同，而且此处不能单用state
    const queryInsuranceData = this.props.analysis[this.props.queryInsuranceData].data;
    // 创建arr数组，在表格初始化的时候使用state里的queryInsuranceData，之后则使用更改过后的arr
    const arr = this.state.queryInsuranceData;
    if (arr.length > 0) {
      for (let i in arr) {
        if (arr[i].index === queryInsuranceData[0].index)
          arr.splice(i, 1, queryInsuranceData[0]);
      }
    }
    // 此处的xunData由父组件带参数过来，方便修改，并且只有分三级才会用到
    let xunDataArr;
    if (xunData) {
      if (this.props.analysis[xunData].xunDate) xunDataArr = this.props.analysis[xunData].xunDate;
      else xunDataArr = [];
    }
    console.log(xunDataArr)
    console.log(this.state.titleList);

    return (
      // 表单的查询按钮为点击事件，没有设置为表单提交是因为查询后获取的表格中可以跳转至某页，
      // 当输入框聚焦后回车会自动触发表单提交事件导致发送两个请求并且覆盖
      <Form id='form' style={{ height: '100%', overflowY: 'auto' }}>
        <Collapse defaultActiveKey={['one', 'two']} style={{ width: 'calc(100% - 24px)' }}>
          <Panel header="维度" key="one">
            <div id='box'>

              {/* 统计口径 */}
              <div id='tongji' style={{ ...itemBox, margin: '0' }}>
                <div style={butBox}></div>
                <div>
                  <Form.Item>
                    <span style={textStyle}>统计口径</span>
                    {getFieldDecorator('caliber', {
                      initialValue: '', rules: [{ required: true, message: '必选' }]
                    })(
                      <Radio.Group
                        options={dataSource_caliber}
                        onChange={e => this.props.root.caliberChange(e)}>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </div>
              </div>

              {/* 数据源 */}
              <div style={{ ...itemBox, margin: '0' }} className='getDataSet' id='dataSource' data-set='business'>
                <div style={butBox}>
                  <span
                    style={{ ...commentStyle, ...downBut, cursor: 'pointer' }}
                    onClick={e => this.clickSpan('dataSource', 'down')}
                    id='dataSource-down'
                  />
                  <span
                    style={{ ...commentStyle, ...upBut, display: 'none', cursor: 'pointer' }}
                    onClick={e => this.clickSpan('dataSource', 'up')}
                    id='dataSource-up'
                  />
                </div>
                <div>
                  <Form.Item>
                    <span style={textStyle}>数据源</span>
                    {getFieldDecorator('tableName', {
                      initialValue: '', rules: [{ required: true, message: '必选' }]
                    })(
                      <Radio.Group
                        options={this.state.cssObj.dataSource}
                        onChange={e => this.props.root.radioChange(e)}>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </div>
              </div>

              {/* 统计时间 */}
              <div style={itemBox} id='statisticalTime' className='getDataSet' data-set='data_date'>
                <div style={butBox}>
                  <span
                    style={{ ...commentStyle, ...downBut, cursor: 'pointer' }}
                    onClick={e => this.clickSpan('statisticalTime', 'down')}
                    id='statisticalTime-down'
                  />
                  <span
                    style={{ ...commentStyle, ...upBut, cursor: 'pointer' }}
                    onClick={e => this.clickSpan('statisticalTime', 'up')}
                    id='statisticalTime-up'
                  />
                </div>
                <div style={itemDiv}>
                  <Form.Item>
                    <span style={textStyle}>统计时间</span>
                    {getFieldDecorator('datadate', {
                      initialValue: [], rules: [{ required: true, message: '必选' }]
                    })(
                      // getXun这个方法只有三级机构有 
                      <Select style={{ width: 350 }} mode={tags ? "" : "multiple"} placeholder='请选择统计时间'
                        onChange={this.props.root.getXun}>
                        {this.state.dataDate.length > 0 ? this.state.dataDate.map(i => {
                          return (
                            <Select.Option key={i} value={i}>{i}</Select.Option>
                          )
                        }) : ''}
                      </Select>
                    )}
                  </Form.Item>
                  {xun ?
                    <Form.Item>
                      {getFieldDecorator('xun', {
                        initialValue: [], rules: [{ required: xunDataArr.length > 0 ? true : false, message: '必选' }]
                      })(
                        <Select style={{ width: 100 }}>
                          {xunDataArr.map(i => {
                            return (
                              <Select.Option key={i.loc} value={i.loc}>{i.dataDate}</Select.Option>
                            )
                          })}
                        </Select>
                      )}
                    </Form.Item> : null}
                </div>
              </div>

              {/* 地区或者机构 */}
              <div style={itemBox} id='area' className='getDataSet' data-set='area'>
                <div style={butBox}>
                  <span
                    style={{ ...commentStyle, ...downBut, cursor: 'pointer' }}
                    onClick={e => this.clickSpan('area', 'down')}
                    id='area-down'
                  />
                  <span
                    style={{ ...commentStyle, ...upBut, cursor: 'pointer' }}
                    onClick={e => this.clickSpan('area', 'up')}
                    id='area-up'
                  />
                </div>
                <div style={itemDiv}>
                  <Form.Item>
                    <span style={textStyle}>{this.state.cssObj.area}</span>
                    <Cascader
                      style={this.state.cssObj.tongji ? this.state.cssObj.tongji : { width: 90 }}
                      displayRender={this.props.root.renderSelect}
                      options={this.state.cascaderList}
                      loadData={this.props.root.loadData}
                      changeOnSelect={true}
                      onChange={this.props.root.changeCascader}
                      placeholder=''
                      value={this.state.cascaderValue}
                      allowClear={false}
                    />

                    {getFieldDecorator('area', {
                      initialValue: [], rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={this.state.cssObj.width}
                        onDeselect={this.props.root.deselect}
                        mode='multiple' placeholder='请选择地区'>
                        {this.state.area.length > 0 ? this.state.area.map((i) => {
                          return (
                            <Select.Option key={i} value={i}>{i}</Select.Option>
                          )
                        }) : []}
                      </Select>
                    )}
                    <div style={{ display: 'flex' }}>
                      <Button onClick={() => this.props.root.chooseAll('area')}>全选</Button>
                      <Button onClick={() => this.props.root.clearAll('area')}>清除</Button>
                    </div>

                  </Form.Item>
                </div>
              </div>

              {/* 主体 */}
              <div id='body' style={itemBox} className='getDataSet' data-set='company'>
                <div style={butBox}>
                  <span
                    style={{ ...commentStyle, ...downBut, cursor: 'pointer' }}
                    onClick={e => this.clickSpan('body', 'down')}
                    id='body-down'
                  />
                  <span
                    style={{ ...commentStyle, ...upBut, cursor: 'pointer' }}
                    onClick={e => this.clickSpan('body', 'up')}
                    id='body-up'
                  />
                </div>
                <div style={itemDiv}>
                  <Form.Item>
                    <span style={textStyle}>主体</span>
                    {getFieldDecorator('company', {
                      initialValue: [], rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 350 }} mode='multiple' placeholder='请选择主体'>
                        {this.state.company.length > 0 ? this.state.company.map((i) => {
                          return (
                            <Select.Option key={i} value={i}>{i}</Select.Option>
                          )
                        }) : []}
                      </Select>
                    )}
                    <div style={this.props.useButton ? { display: 'flex' } : { display: 'none' }}>
                      <Button onClick={() => this.props.root.chooseAll('company')}>全选</Button>
                      <Button onClick={() => this.props.root.clearAll('company')}>清除</Button>
                    </div>
                  </Form.Item>
                </div>
              </div>

              {/* 险种 */}
              <div style={itemBox} id='riskCode' className='getDataSet' data-set='risk'>
                <div style={butBox}>
                  <span
                    style={{ ...commentStyle, ...downBut, display: 'none', cursor: 'pointer' }}
                    onClick={e => this.clickSpan('riskCode', 'down')}
                    id='riskCode-down'
                  />
                  <span
                    style={{ ...commentStyle, ...upBut, cursor: 'pointer' }}
                    onClick={e => this.clickSpan('riskCode', 'up')}
                    id='riskCode-up'
                  />
                </div>
                <div style={itemDiv}>
                  <Form.Item>
                    <span style={textStyle}>险种</span>
                    {getFieldDecorator('risk', {
                      initialValue: [], rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 350 }} mode='multiple' placeholder='请选择险种' onChange={e => this.props.root.riskChange(e)}>
                        {this.state.risk.length > 0 ? this.state.risk.map((i) => {
                          return (
                            <Select.Option key={i} value={i}>{i}</Select.Option>
                          )
                        }) : ''}
                      </Select>
                    )}
                  </Form.Item>
                </div>
              </div>

              {/* 选择数据源后显示的下拉 */}
              <div style={this.state.radioValue !== '' ? itemBox : { display: 'none' }} id='radioValue'>
                <div style={butBox}></div>
                <div style={itemDiv}>
                  <Form.Item>
                    <span style={textStyle}>{this.state.showItemName}</span>
                    {getFieldDecorator('business', {
                      initialValue: [], rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 350 }} mode='multiple'
                        placeholder={`请选择${this.state.showItemName}`}
                        onSelect={e => this.setState({ timeChange: e })}>
                        {this.state.getSelectData.length > 0 ? this.state.getSelectData.map((i) => {
                          return (
                            <Select.Option key={i} value={i}>{i}</Select.Option>
                          )
                        }) : ''}
                      </Select>
                    )}
                    <div style={{ display: 'flex' }}>
                      <Button onClick={() => this.props.root.chooseAll('business')}>全选</Button>
                      <Button onClick={() => this.props.root.clearAll('business')}>清除</Button>
                    </div>
                  </Form.Item>
                </div>
              </div>
            </div>
          </Panel>
          <Panel header="指标" key="two">
            <div style={getQuotaStyle}>
              {this.state.getQuotaData.map((item, index) => {
                return (
                  <div key={item.indexName + `+${index}`}>
                    <div style={{ marginRight: 10, }}>
                      <input id={`parentChecked${index}`}
                        data-set={item.indexName}
                        type='checkbox' value={item.indexName}
                        onChange={e => this.checkedParent(e, item.indexName)}></input>
                      <span className='parentName'
                        style={spanStyle}
                        onClick={e => this.clickMeasure(e)}>
                        {item.indexName}
                      </span>
                    </div>
                    <div className='getQuotaItem' id={item.indexName} style={getQuotaItemStyle}>
                      {item.zbxindex[0] !== null ? item.zbxindex.map((value, i) => {
                        return (
                          <div key={`${item.indexName}+${value.indexName}+${i}`} style={{ float: 'left', marginRight: 3 }}>
                            <label>
                              <input type='checkbox'
                                data-parent={item.indexName}
                                data-set={value.indexName}
                                value={item.indexName}
                                onChange={e => this.checkedChild(e, `parentChecked${index}`)}></input>
                              <span style={{ marginLeft: '5px' }}>{value.indexName}</span>
                            </label>
                          </div>
                        )
                      }) : ''}
                      <div style={{ clear: 'both' }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <Button onClick={this.queryData.bind(this)}>查询</Button>
            <Button onClick={this.props.root.reset} style={{ margin: '0 12px' }}>重置</Button>
            <Button onClick={this.export.bind(this)}>导出</Button>
          </div>
        </Collapse>

        {/* 数据表格 */}
        <div style={{ width: 'calc(100% - 24px)' }}>
          {arr.length > 0 ? arr.map((item, index) => {
            return (
              <Table
                key={item + index}
                rowKey="key"
                bordered={true}
                title={() => {
                  return (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', fontWeight: 'bolder' }}>单位：件/万元</div>
                      <div style={{ textAlign: 'center', fontWeight: 'bolder' }}>{item.index}</div>
                    </div>
                  )
                }}
                style={{ display: 'block', marginTop: 20 }}
                dataSource={this.props.root.getDataSource(item)}
                columns={this.props.root.getColumns(item)}
                pagination={this.paginationProps(item, index)}
                scroll={{ x: 1500 }}
              />
            )
          }) : this.state.queryInsuranceData.map((item, index) => {
            return (
              <Table
                key={item + index}
                rowKey="key"
                bordered={true}
                title={() => {
                  return (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', fontWeight: 'bolder' }}>单位：件/万元</div>
                      <div style={{ textAlign: 'center', fontWeight: 'bolder' }}>{item.index}</div>
                    </div>
                  )
                }}
                style={{ display: 'block', marginTop: 20 }}
                dataSource={this.props.root.getDataSource(item)}
                columns={this.props.root.getColumns(item)}
                pagination={this.paginationProps(item, index)}
                scroll={{ x: 2200 }}
              />
            )
          })}
        </div>


        {/* 置顶按钮 */}
        <div ref={(topButton) => this.topButton = topButton}
          style={{ display: 'none', position: 'fixed', top: '50%', zIndex: 99999999, right: 0 }}>
          <Button style={{ width: 80, height: 32, borderColor: '#40a9ff', color: '#40a9ff' }}
            onClick={this.isTop.bind(this)}>回到顶部</Button>
        </div>

        {/* 弹窗选择导出表格 */}
        <Modal
          visible={this.state.modalShow}
          onOk={() => this.chooseTable(true)}
          onCancel={() => this.chooseTable(false)}
          maskClosable={false}
          title='导出表格'
        >
          <Select style={{ width: '100%' }} onChange={e => this.setState({ exportList: e })}
            value={this.state.exportList}
            mode="multiple" placeholder='请选择需要导出的表格'>
            {this.state.titleList.length > 0 ? this.state.titleList.map(i => {
              return (
                <Select.Option key={i} value={i}>{i}</Select.Option>
              )
            }) : ''}
          </Select>
        </Modal>
      </Form>
    )
  }

  render() {
    return (
      <PageHeaderLayout style={{ height: '100%' }}>
        <Card bordered={false} style={{ height: '100%' }}>
          <Spin spinning={this.props.loading}>
            {this.renderForm()}
          </Spin>
        </Card>
      </PageHeaderLayout>
    );
  }
}
