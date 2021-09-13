import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Button, Table, Tabs, message, Modal, Select } from 'snk-web';
import { CreateCharts } from './CreateCharts';
import ExportJsonExcel from 'js-export-excel';   // 导出excel
import styles from './styles.less';
import echarts from 'echarts/lib/echarts'; // 必须

const { TabPane } = Tabs;
const { Option } = Select;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class Charts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      useTable: false,      // 是否使用表格
      columns: [],          // 表格头
      data: [],             // 表格数据
      title: null,          // 表格标题
      height: 500,          // 图表的高度
      maHeight: 750,
      unit: '',             // 表格单位
      openDatas: false,     // 显示数据
    }
  }

  componentDidMount() {
    this.didMount();

    // 根据列表数据数量是否超过指定高度来判定是否给滚动条
    if (this.tab) {
      const ownList = this.tab.props.children._owner.stateNode.list.childNodes[0].childNodes[1];
      if (ownList.clientHeight < this.useFlow.clientHeight) {
        ownList.style.overflowY = 'auto';
      }
    }
  }

  didMount = () => {
    document.querySelector('.ant-tabs-content-no-animated').style.height = 'calc(100% - 56px)';

    const { chart: { measureInfos, graphType, y1Unit, y2Unit, measureName, xDim }, sqlType } = this.props;
    console.log(measureInfos);

    let unit = '';
    const reg = /^\d+$/;
    let isCard = false;     // 下钻是否为卡片
    this.setCharts(graphType);

    const columns = [
      {
        title: 'X轴坐标',
        width: 150,
        dataIndex: 'X',
        align: 'center',
        fixed: 'left'
      }
    ];
    let data = [];
    let moreMeasure = [];
    for (let i in measureInfos) {
      if (reg.test(i)) isCard = true;
      const datas = measureInfos[i];
      switch (datas.UNIT) {
        case '百分比': unit = '%'; break;
        case '件数': unit = '件'; break;
        case '万元': unit = '万元'; break;
        case '原始值': unit = ''; break;
        case '排名': unit = '排名'; break;
        case '日': unit = '日'; break;
        default: unit = `${datas.UNIT}`;
      }

      // 去掉表格中的‘&不显示’的内容
      let title = datas.measureName;
      if (datas.measureName.indexOf('&') >= 0) {
        const titleArr = datas.measureName.split('-');
        for (let l in titleArr) {
          if (titleArr[l].indexOf('&') >= 0) title = titleArr.slice(0, l).join('-');
        }
      }
      columns.push({
        title: title + (unit === '' ? '' : `（${unit}）`),
        width: 200,
        dataIndex: datas.measureName,
        align: 'center'
      })
      if (!datas.measureData) datas.measureData = [];
      for (let j of datas.measureData) {
        if (j.dimensionValue) moreMeasure.push(j.measureCode ? j.measureCode + '+' + j.dimensionValue : j.dimensionValue)
      }
    }

    // 去除因为排序用到的measureCode前缀
    moreMeasure = moreMeasure.map(item => {
      if (item.indexOf('+') >= 0) return item.split('+')[1];
      else return item;
    });

    // 去重得到所有x轴的集合
    moreMeasure = moreMeasure.filter((item, index) => moreMeasure.indexOf(item) === index);

    console.log(moreMeasure);


    if (sqlType !== '2') {    // 行业数据前端不排序
      // 冒泡排序
      for (let i = 0; i < moreMeasure.length - 1; i++) {
        for (let j = 0; j < moreMeasure.length - i - 1; j++) {
          if (moreMeasure[j] > moreMeasure[j + 1]) {
            const q = moreMeasure[j];
            moreMeasure[j] = moreMeasure[j + 1];
            moreMeasure[j + 1] = q;
          }
        }
      }
    }

    // 首先根据所有x轴合集循环，保证不会漏掉x，同时根据x轴数量对应对象，然后再每个数据数组中抽出当前x轴数据进行对象配置
    for (let i of moreMeasure) {
      const obj = {
        key: i,
        X: i
      }
      for (let j in measureInfos) {
        const { measureName, UNIT } = measureInfos[j];
        for (let k of measureInfos[j].measureData) {
          if (i === k.dimensionValue) {
            let measureValue = '';
            switch (UNIT) {
              case '百分比': measureValue = (k.measureValue * 100).toFixed(2); break;
              case '万元': measureValue = (k.measureValue / 10000).toFixed(2); break;
              default: measureValue = k.measureValue; break;
            }
            obj[measureName] = measureValue;
          }
        }
      }
      data.push(obj);
    }

    /**
     * @背景 下面的操作为更改表格头部，精简title中的文字，业务提的需求
     * @步骤1 首先判定是图表还是卡片下钻，这两种的指标名称结构不一样，根据title中的‘-’区分，取其中一个进行遍历，
     *       后与所有的column中的title进行比对，以‘-’分隔一一比较，其中些许指标中本身就带有‘-’，
     *       所以在分隔出来的数据取第二个值，这个值在配置中的所有值中第一个字都是‘取’，以此为分隔判定是否指标中带有‘-’
     * @步骤2 如果当前title对应位置在所有title中存在相同名称，则过滤掉该位置，否则保留
     * @步骤3 判定以下创建的变量也表示该位置是否保留，再整合成新的title
     * @步骤4 因后端数据问题，且重新跑数代价过大，所以指标中会存在‘blank’和‘其他’的名称，这两种名称则全部放到末尾
     */
    const columnsValue = columns.slice(1);

    const newColumns = columnsValue.map(item => {
      const obj = { ...item };
      let measureNameSame = true;
      let measureValueSame = true;
      let yearDataSame = true;
      let kindSame = true;
      let itemArr = obj.title.split('-');
      let itemIndex = 1;
      const length = columnsValue.length;

      if (isCard) {
        const measureName = itemArr.slice(0, itemArr.length - 1).join('-');
        const unit = itemArr[itemArr.length - 1].slice(2);
        const newTitle = measureName + unit;
        obj.title = newTitle;
      } else {
        for (let i in itemArr) {
          if (itemArr[i][0] === '取') itemIndex = i;
        }
        itemArr = [itemArr.slice(0, itemIndex).join('-'), ...itemArr.slice(itemIndex)];
        for (let i of columnsValue) {
          let allItemArr = i.title.split('-');
          let index = 1;
          for (let i in allItemArr) {
            if (allItemArr[i][0] === '取') index = i;
          }
          allItemArr = [allItemArr.slice(0, index).join('-'), ...allItemArr.slice(index)];
          if (itemArr[0] !== allItemArr[0] || length === 1) measureNameSame = false;
          if (itemArr[1] !== allItemArr[1] || length === 1) measureValueSame = false;
          if (itemArr[4] !== allItemArr[4] || length === 1) yearDataSame = false;
          if (itemArr[5] && itemArr[5] !== allItemArr[5] || length === 1) kindSame = false;
        }
        let newTitle = '';
        if (!measureNameSame) newTitle += `${itemArr[0]}-`;
        if (!measureValueSame) newTitle += `${itemArr[1]}-`;
        if (!yearDataSame) newTitle += `${itemArr[4]}`;
        if (itemArr[5] && !kindSame) newTitle += `-${itemArr.slice(5).join('-')}`;
        if (newTitle[0] === '-') newTitle = newTitle.slice(1);
        if (newTitle.indexOf('，') >= 0) newTitle = newTitle.slice(0, newTitle.indexOf('，') - 1) + newTitle.slice(newTitle.indexOf('，') + 1);
        if (newTitle[newTitle.length - 1] === '-') newTitle = newTitle.slice(0, newTitle.length - 1) + itemArr[itemArr.length - 1].slice(itemArr[itemArr.length - 1].indexOf('（'))
        obj.title = newTitle;
      }

      return obj;
    })
    newColumns.unshift(columns[0]);
    let blankItem;
    let otherItem;
    const nowColumns = newColumns.filter(item => {
      let num = 0;
      if (item.title.indexOf('blank') >= 0) {
        blankItem = item;
        num++;
      }
      if (item.title.indexOf('其他') >= 0) {
        otherItem = item;
        num++;
      }
      if (num === 0) return item;
    })
    if (blankItem) nowColumns.push(blankItem);
    if (otherItem) nowColumns.push(otherItem);
    // --------------------------------------------------
    if (xDim === 'pub_its_statdate') data = data.reverse();
    this.setState({ columns: nowColumns, data, unit })
  }

  // 共用方法
  setCharts = (type, useData, measureNames = []) => {
    const { comment } = this.props;
    if (type === '2') {
      const { maHeight } = this.state;
      this.left.style.height = `${maHeight}px`;
      this.dash ? this.dash.style.height = `${maHeight}px` : null;
      this.charts.style.height = comment ? `${maHeight - 50}px` : `${maHeight}px`;
      this.list.style.height = `${maHeight}px`;
    } else {
      this.charts.style.height = comment ? `${500 - 50}px` : `${500}px`;
    }

    const { chart: { measureInfos, graphType, y1Unit, y2Unit, measureName,
      baseline, pieChartColor, mapColor }, root, chart, component, sqlType } = this.props;

    let pieColors = [];
    let mapColors = [];
    if (pieChartColor) pieColors = pieChartColor.customizeColor;
    if (mapColor) mapColors = mapColor;

    switch (graphType) {
      case '3': CreateCharts.pie(useData, component, root, this.charts, chart, pieColors); break;
      case '2': CreateCharts.map(useData, component, root, this.charts, chart, mapColors, sqlType); break;
      default: CreateCharts.default(sqlType, useData, measureNames, component, root, this.charts, chart, y1Unit, y2Unit, baseline); break;
    }
  }

  // 功能
  getdata = (data, index) => {
    const { graphType, measureInfos } = data;
    if (graphType === '3' && Object.keys(measureInfos).length > 1) {
      message.warn('多指标的饼图暂不支持切换图形！');
      return;
    }
    const measure = [];
    for (let i in measureInfos) {
      if (measureInfos[i].measureName) measure.push(measureInfos[i].measureName)
    }
    this.props.root.setState({ visbilit: true, measure, index })
  }

  // 还原
  recover = async () => {
    const { chart: { graphType } } = this.props;
    this.setCharts(graphType);
  }

  // 下载按钮，下面为echart部分源码
  download = () => {
    var myChart = echarts.getInstanceByDom(this.charts);
    var url = myChart.getConnectedDataURL({
      pixelRatio: 5,　　//导出的图片分辨率比率,默认是1
      backgroundColor: '#fff',　　//图表背景色
      excludeComponents: [　　//保存图表时忽略的工具组件,默认忽略工具栏
        'toolbox'
      ],
      type: 'png'　　//图片类型支持png和jpeg
    });
    var $a = document.createElement('a');
    var type = 'png';
    $a.download = myChart.getOption().title[0].text + '.' + type;
    $a.target = '_blank';
    $a.href = url;
    // Chrome and Firefox
    if (typeof MouseEvent === 'function') {
      var evt = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: false
      });
      $a.dispatchEvent(evt);
    }
    // IE
    else {
      var html = ''

      '<body style="margin:0;">'
      '![](' + url + ')'
      '</body>';
      var tab = window.open();
      tab.document.write(html);
    }
  }

  // 表格
  getTable = async () => {
    const { useTable } = this.state;
    if (!useTable) {
      await this.setState({ useTable: true });
      // 获取表格元素的当前宽度，然后获取所有数据原有的宽度，判定是否让表格左侧固定
      const table = document.getElementsByClassName('ant-table-wrapper');
      const width = table[0].clientWidth;
      const { columns } = this.state;
      const dataWidth = columns.length * 200 - 50;

      if (dataWidth > width) columns[0].fixed = 'left';
      else delete columns[0].fixed;
      this.setState({ columns });
    } else {
      await this.setState({ useTable: false });

      // 这里需要重新给tabs设定高度，不然从表格切换回来的时候高度会出问题
      document.querySelector('.ant-tabs-content-no-animated').style.height = 'calc(100% - 56px)';
    }
  }

  // 导出
  export = () => {
    const { name, chart: { xDim } } = this.props;
    let { columns, data } = this.state;
    const option = {};
    const dataTable = [];
    let title = [];
    if (xDim === 'pub_its_statdate') data = data.reverse();
    for (let i of data) {
      const obj = {};
      for (let j of columns) {
        obj[j.title] = i[j.dataIndex];
        title.push(j.title)
      }
      dataTable.push(obj);
    }
    // 因为是在循环中进行添加，所以有重复，进行去重
    title = title.filter((item, index) => title.indexOf(item) === index);
    option.fileName = name;
    option.datas = [
      {
        sheetData: dataTable,
        sheetName: 'sheet',
        sheetFilter: title,
        sheetHeader: title,
      }
    ];
    let toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  }

  openData = () => {
    const { chart: { graphType } } = this.props;
    if (graphType === '1') this.setState({ openDatas: true })
    else this.setCharts(graphType, true);
  }

  // 选择显示部分指标数据
  openDataArr = (graphType) => {
    const value = this.props.form.getFieldValue('datas');
    this.setCharts(graphType, true, value);
    this.setState({ openDatas: false })
  }

  // 刷新
  update = (index) => {
    const { chartsDataArr } = this.props.root.props.root.state;
    const id = chartsDataArr[index].id;
    const { portalId } = this.props.analysis.queryPortalListData;

    this.props.dispatch({
      type: 'analysis/qMeasureData',
      payload: {
        id,
        portalId,
        update: true
      }
    }).then(async () => {
      const { qMeasureDataData } = this.props.analysis;
      chartsDataArr.splice(index, 1, qMeasureDataData);
      await this.props.root.props.root.setState({ chartsDataArr });
      this.didMount();
    })
  }

  // 点击全选
  getAll = (measureInfos) => {
    const measureArr = [];
    for (let i in measureInfos) {
      measureArr.push(measureInfos[i].measureName)
    }
    this.props.form.setFieldsValue({ datas: measureArr });
  }

  render() {
    const { chart, chart: { subGraphName, graphType, measureInfos }, index, lists, comment, ind,
      form: { getFieldDecorator } } = this.props;
    const { useTable, columns, data, height, openDatas } = this.state;
    const measureKey = Object.keys(measureInfos);

    return (
      <div>
        <div className={styles.buttonBox}>
          {useTable ? <Button type='primary' className={styles.button} onClick={this.export}>导出</Button> : null}
          <Button type='primary' className={styles.button} onClick={this.getTable}>{useTable ? '关闭表格' : '显示表格'}</Button>
          <Button type='primary' className={styles.button} onClick={this.recover}>还原</Button>
          <Button type='primary' className={styles.button} onClick={this.openData}>显示数据</Button>
          <Button type='primary' className={styles.button} onClick={this.download}>下载图片</Button>
          <Button type='primary' className={styles.button} onClick={() => this.getdata(chart, index)}>功能</Button>
          <Button type='primary' className={styles.button} onClick={() => this.update(ind)}>刷新</Button>
        </div>

        <div className={styles.chartBox}>
          <div style={{ width: lists.length > 0 ? 'calc(99% - 300px)' : '99%' }} className={styles.left} ref={e => this.left = e}>
            <div ref={e => this.charts = e} className={styles.chart} style={{ height: comment ? 'calc(100% - 50px)' : '100%' }}></div>
            <h3 className={styles.comment}>{comment}</h3>
          </div>

          {lists.length > 0 ? <div className={styles.dash} ref={e => this.dash = e}></div> : null}

          <div className={styles.list} style={{ width: lists.length > 0 ? 270 : 0, height: 500 }} ref={e => this.list = e}>
            <Tabs defaultActiveKey="0" type="card" size='default' className={styles.tabs}>
              {lists.map((item, index) => {
                // const arr = [...item.listData, ...item.listData];
                const unit = item.UNIT;
                return (
                  <TabPane tab={item.name} key={index} className={styles.tabPane} ref={e => this.tab = e}>
                    <div ref={e => this.useFlow = e}>
                      {item.listData.length > 0 ? item.listData.map((list, ind) => {
                        let value;
                        switch (unit) {
                          case '百分比': value = (list.measureValue * 100).toFixed(2) + '%'; break;
                          case '万元': value = (list.measureValue / 10000).toFixed(2) + '万元'; break;
                          case '件数': value = list.measureValue + '件'; break;
                          default: value = list.measureValue; break;
                        }
                        return (
                          <div key={ind}>
                            <div className={styles.lists}><span>{Number(ind) + 1}</span>&nbsp;{list.dimensionValue}</div>
                            <div>{value}</div>
                          </div>
                        )
                      }) : <h2 className={styles.noData}>暂无数据</h2>}
                    </div>
                  </TabPane>
                )
              })}
            </Tabs>
          </div>
        </div>
        {useTable ?
          <Table
            columns={columns}
            dataSource={data}
            bordered
            size="middle"
            scroll={{ x: columns.length * 200 - 50 }}
            title={() => {
              return (
                <div className={styles.tableTitle}>{subGraphName}</div>
              )
            }}
          /> : null}

        <Modal
          visible={openDatas}
          onOk={() => this.openDataArr(graphType)}
          onCancel={e => { this.setState({ openDatas: false }) }}
          title='选择显示数据的指标'
        >
          <Form.Item>
            {getFieldDecorator('datas')(
              <Select style={{ width: 300 }} mode="multiple">
                {measureKey.map(item => {
                  return (
                    <Option key={item} title={measureInfos[item].measureName} value={measureInfos[item].measureName}>{measureInfos[item].measureName}</Option>
                  )
                })}
              </Select>
            )}
          </Form.Item>
          <Button onClick={() => this.getAll(measureInfos)}>全选</Button>
          <Button onClick={() => this.props.form.setFieldsValue({ datas: undefined })}>清除</Button>
        </Modal>
      </div>
    )
  }
}
