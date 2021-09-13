import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Spin, Button, message, Modal, Input, Collapse, Select, Row, Col, Popconfirm, List, Avatar, Tabs } from 'snk-web';
import Charts from './Charts'
import { CreateCharts } from './CreateCharts';
import styles from './styles.less';

const { TabPane } = Tabs;
const { Option } = Select;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class ChartsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visbilit: false,
      measure: [],
      index: null,          // 当前是哪个位置
      drillDown: null,      // 是否下钻
      chooseDim: false,     // 选择维度弹窗
      drillDownData: {},    // 下钻的参数
      getDimLevelData: [],  // 二级维度
      saveObj: {},          // 储存当前下钻的图表数据结构
      yUnit: 'y1',
      subGraph: 'subGraph1',// 当前点击下钻的是哪个子图表
    }
  }

  componentDidMount() {
    const { drillDown } = this.props;
    this.setState({ drillDown })

    const { datas, datas: { subGraphs, id, graphComponentName } } = this.props;

    if (JSON.stringify(datas) !== '{}' && !subGraphs) message.error(`id为：${id}\n组件名为：${graphComponentName}的图表存在问题，无法展示！`);
  }

  onOkModel = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        if (err.name || err.type) return;
      }
      const { index } = this.state;
      const { chart: { measureInfos, y1Unit, y2Unit, measureName, baseline }, chart } = this['Charts' + index].props;
      console.log(this.props);
      // const baseLine = baseline.length > 0 ? baseline : undefined;
      const { graphComponentName, sqlType } = this.props.datas;


      // 原本就是常规图
      if (y1Unit) {
        CreateCharts.default(sqlType, undefined, [], graphComponentName, this, this['Charts' + index].charts, chart, y1Unit, y2Unit, baseline, values.name, values.type);
      } else {
        CreateCharts.other(undefined, graphComponentName, this, this['Charts' + index].charts, chart, values.name, values.type);
      }

      // 判定位置是否够用，不够的话子元素会被撑开，这个时候加上滚动条，否则删掉，滚动条也是占位置的

      this.setState({ visbilit: false });
      this.props.form.resetFields();
    })
  }

  // 下钻
  drillDown = async (params, datas, other) => {
    let { measureInfos, xDim, filter, cycle, dimension, graphType, subGraph } = datas;    // 后端返回的数据
    const { seriesName, name, seriesType } = params;    // echarts中的数据
    let compareDimValue = undefined;

    if (graphType === '2') {  // 地图暂时不可下钻
      message.warn('该组件不允许下钻！');
      return
    };

    if (!seriesType) return;   // 点中的是基准线

    // 首先查看父组件是否传递参数允许下钻
    const { drillDown, drillDownData } = this.state;
    if (!drillDown) {
      message.warn('该组件不允许下钻！');
      return
    };

    for (let i in measureInfos) {
      if (measureInfos[i].measureName === seriesName) {
        if (measureInfos[i].splmeasureFlag === '1') {
          message.warn('特殊指标不支持下钻！');
          return;
        }
        if (measureInfos[i].compareFilterMap) {
          // filter = { ...filter, ...measureInfos[i].compareFilterMap };
          compareDimValue = measureInfos[i].compareFilterMap;
        }
      }
    }

    // let yUnit;
    // if (seriesName.indexOf('y1') >= 0) yUnit = 'y1';
    // else yUnit = 'y2';

    // 先打开弹窗，然后重新清空值
    await this.setState({ chooseDim: true });
    this.props.form.setFieldsValue({ dim: undefined, col: undefined });

    let valueType, otherTypeName;
    for (let i in measureInfos) {
      if (measureInfos[i].measureName === seriesName) {
        valueType = measureInfos[i].valueType;
        // compareDimValue = measureInfos[i].compareFilterMap;
      }
      otherTypeName = measureInfos[i].measureName;
    }

    // 如果上面的循环没有赋值，说明是饼图或者地图
    if (!valueType) valueType = measureInfos[Object.keys(measureInfos)[0]].valueType
    const obj = {
      dimTable: xDim,
      dimValue: null,
      dimTable2: xDim,
      dimColum: dimension,
      dimColum2: dimension,
      filter,
      frequency: cycle,
      istendaysAgo: '0',
      compareDimValue,
      measure: null,
      themeId: null,
      measureName: other ? otherTypeName : seriesName,
      valueType,
    };
    let saveObj = {};
    console.log(measureInfos);
    for (let i in measureInfos) {
      if (measureInfos[i].measureName === seriesName || other) {
        const appId = measureInfos[i].themeId.split('_')[0];
        const themeId = measureInfos[i].themeId.split('_')[1];
        const measureData = measureInfos[i].measureData;

        if (measureInfos[i].istendaysAgo) obj.istendaysAgo = measureInfos[i].istendaysAgo;
        if (measureInfos[i].propFlag) obj.propFlag = measureInfos[i].propFlag;
        if (measureInfos[i].percentageTableColumn) obj.percentageTableColumn = measureInfos[i].percentageTableColumn;
        if (measureInfos[i].propColumnValue) obj.propColumnValue = measureInfos[i].propColumnValue;
        if (measureInfos[i].splmeasureFlag) obj.splmeasureFlag = measureInfos[i].splmeasureFlag;
        if (measureInfos[i].contemporaneousDataType) obj.contemporaneousDataType = measureInfos[i].contemporaneousDataType;
        if (measureInfos[i].spltimeType) obj.spltimeType = measureInfos[i].spltimeType;
        if (measureInfos[i].dateValue) obj.dateValue = measureInfos[i].dateValue;

        // 存为json字符串，避免篡改原对象
        saveObj = JSON.stringify(measureInfos[i]);
        for (let j of measureData) {
          if (j.dimensionValue === name) obj.dimValue = j.measureCode;
          if (other) {
            if (j.province === name) obj.dimValue = j.measureCode;
          }
        }
        obj.themeId = measureInfos[i].themeId;
        obj.measure = measureInfos[i].measure;
        this.props.dispatch({
          type: 'analysis/getUserFilter',
          payload: {
            appId,
            themeId
          }
        })
      }
    }

    this.setState({ drillDownData: obj, subGraph })
    // this.props.setState({ yUnit })
    this.props.root.setState({ saveObj })
  }

  // 选择维度弹窗点击确定
  openDrillDown = () => {
    const values = this.props.form.getFieldsValue();
    if (values.dim === undefined && values.col === undefined) {
      message.warn('请选择下钻维度！');
      return;
    }
    if (values.dim === undefined || values.col === undefined) {
      message.warn('维度必须都选择！');
      return;
    }
    let { drillDownAllData, saveObj } = this.props.root.state;
    if (drillDownAllData.length >= 10) {
      message.warn('图表下钻只允许下钻10次！');
      return;
    }

    let { drillDownData } = this.state;
    saveObj = JSON.parse(saveObj)

    if (values.dim) {
      drillDownData.dimTable2 = values.dim;
      drillDownData.dimColum2 = values.col;
    }

    this.props.root.setState({ openChart: false, drillDownData })
    this.chartsDrillDown(drillDownData, saveObj, this)
  }

  // 图表和推荐图表共同下钻逻辑
  chartsDrillDown = (drillDownData, saveObj, that, recommend) => {
    let { getService, yUnit } = this.props.root.state;
    // const { yUnit } = this.state;
    if (getService) {   // 配置这个的原因在于有可能请求过慢，导致过程中用户进行了其他的下钻，会导致数据混淆
      message.warn('当前有请求正在发送，请稍后操作！');
      return;
    }
    this.props.root.setState({ getService: true })
    this.props.dispatch({
      type: 'analysis/chartDrillDown',
      payload: drillDownData
    }).then(async () => {
      message.success('下钻成功！');
      const { chartDrillDownData, chartDrillDownData: { measureInfos, measureName } } = this.props.analysis;
      const { drillDownAllData } = this.props.root.state;
      const { subGraph } = this.state;    // 获取点击的时候保存的子图表key，否则会造成数据和单位错误
      const { datas: { graphComponentName } } = this.props;
      const subGraph1 = this.props.datas.subGraphs[subGraph];

      let newUnit;
      if (subGraph1.graphType === '3') {    // 如果是饼图下钻
        newUnit = subGraph1.measureInfos[Object.keys(subGraph1.measureInfos)[0]].UNIT
      }

      let yUnit = measureName.indexOf('y1') >= 0 ? 'y1' : 'y2';
      saveObj.yAxis = yUnit.slice(1);
      saveObj.style = '柱状图';
      saveObj.isShow = '1';

      const infoObj = {};
      const newParameter = {};
      for (let i in measureInfos) {
        const value = measureInfos[i];
        saveObj.measureName = value.measureName;
        saveObj.measureCode = value.measureCode;
        saveObj.measure = value.measureFile;
        saveObj.measureData = value.measureData;
        saveObj.propDimColum = value.propDimColum;
        saveObj.propDimValue = value.propDimValue;
        saveObj.propFlag = value.propFlag;
        saveObj.percentageTableColumn = value.percentageTableColumn;
        saveObj.propColumnValue = value.propColumnValue;
        saveObj.splmeasureFlag = value.splmeasureFlag;
        saveObj.contemporaneousDataType = value.contemporaneousDataType;
        saveObj.spltimeType = value.spltimeType;
        saveObj.dateValue = chartDrillDownData.dateValue;
        saveObj.compareFilterMap = value.compareFilterMap;
        infoObj[i] = saveObj;

        // payload中需要这些新的参数
        newParameter.propFlag = value.propFlag;
        newParameter.percentageTableColumn = value.percentageTableColumn;
        newParameter.propColumnValue = value.propColumnValue;
        newParameter.splmeasureFlag = value.splmeasureFlag;
      }
      // 配置一个数据对象，前端手工配置，和图表的数据结构中的常规图形一样
      const newDatas = {
        datas: {
          retListInfos: [],
          graphComponentName,
          subGraphs: {
            subGraph1: {
              baseline: [],
              contemporaneousDataType: subGraph1.contemporaneousDataType,
              spltimeType: subGraph1.spltimeType,
              cycle: subGraph1.cycle,
              dimension: chartDrillDownData.dimColum2,
              filter: chartDrillDownData.filter,
              graphType: "1",
              isList: "1",
              measureCode: subGraph1.measureCode,
              measureDomainCode: subGraph1.measureDomainCode,
              style: "柱状图",
              measureInfos: infoObj,
              subGraph: "subGraph1",
              subGraphName: chartDrillDownData.filterName,
              valueType: subGraph1.valueType,
              xDim: chartDrillDownData.dimTable2,
              y1Unit: newUnit ? newUnit : subGraph1.y1Unit,
              y2Unit: newUnit ? undefined : subGraph1.y2Unit,
              yAxis: yUnit.slice(1),
            }
          }
        },
        payload: {
          istendaysAgo: chartDrillDownData.istendaysAgo,
          dimColum: chartDrillDownData.dimColum,
          dimColum2: chartDrillDownData.dimColum2,
          dimTable: chartDrillDownData.dimTable,
          dimTable2: chartDrillDownData.dimTable2,
          filter: chartDrillDownData.filter,
          compareDimValue: chartDrillDownData.compareFilterMap,
          frequency: chartDrillDownData.frequency,
          measure: chartDrillDownData.measureFile,
          themeId: chartDrillDownData.themeId,
          valueType: chartDrillDownData.valueType,
          measureName: chartDrillDownData.measureName,
          dateValue: chartDrillDownData.dateValue,
          ...newParameter
        },
        recommList: chartDrillDownData.recommList,
        reFilterName: chartDrillDownData.reFilterName,
      };
      await this.setState({ chooseDim: false });
      await this.props.root.setState({ drillDownAllData: [...drillDownAllData, newDatas], drillVisibilit: true, getService: false });

      // 调用Charts组件中的方法，重绘echarts图形
      for (let i in that) {
        if (i.indexOf('Charts') >= 0) {
          that[i].didMount()
        }
      }
    }, err => {
      message.error(err.message);
      this.props.root.setState({ getService: false });
    })
  }

  // 选择一级维度后获取二级维度
  changeDim = (e) => {
    this.props.form.setFieldsValue({ col: undefined })
    this.props.dispatch({
      type: 'analysis/getDimLevel',
      payload: {
        dimTable: e
      }
    }).then(() => {
      const { getDimLevelData } = this.props.analysis;
      this.setState({ getDimLevelData });
    })
  }

  render() {
    let { datas: { subGraphs, retListInfos, comment, graphComponentName, sqlType }, ind } = this.props;
    if (!retListInfos) retListInfos = [];
    let data = [];
    if (subGraphs) data = Object.keys(subGraphs);
    const { visbilit, measure, chooseDim, getDimLevelData } = this.state;
    const { getFieldDecorator } = this.props.form;
    let { getUserFilterData } = this.props.analysis;

    getUserFilterData = JSON.stringify(getUserFilterData);
    getUserFilterData = JSON.parse(getUserFilterData);
    getUserFilterData.forEach((item, index) => {
      if (item.dimTable === 'pub_its_statdate') getUserFilterData.splice(index, 1);
    })
    return (
      <div className={styles.bigBox} style={{ width: '100%' }}>

        <Tabs defaultActiveKey='0'>
          {data.sort((a, b) => a.split('subGraph')[1] - b.split('subGraph')[1]).map((item, index) => {
            const lists = retListInfos.filter(list => list.subGraphCode === item);
            return (
              <TabPane tab={subGraphs[item].subGraphName} key={index}>
                <Charts root={this} lists={lists} comment={comment} component={graphComponentName} ind={ind} sqlType={sqlType}
                  index={index} wrappedComponentRef={e => this['Charts' + index] = e} chart={subGraphs[item]}></Charts>
              </TabPane>
            )
          })}
        </Tabs>

        <Modal
          visible={chooseDim}
          onOk={e => this.openDrillDown(e)}
          onCancel={e => { this.setState({ chooseDim: false }) }}
          title='下钻设置'
        >
          <div style={{ display: 'flex' }}>
            <Form.Item label='选择维度' style={{ display: 'flex' }}>
              {getFieldDecorator('dim', {
                rules: [{ required: true, message: '必填' }]
              })(
                <Select style={{ width: 150 }} onChange={this.changeDim}>
                  {getUserFilterData.map(item => {
                    return (
                      <Option key={item.dimTable} value={item.dimTable}>{item.dimDesc}</Option>
                    )
                  })}
                </Select>
              )}
            </Form.Item>
            <Form.Item label='选择维度层级' style={{ display: 'flex', marginLeft: 15 }}>
              {getFieldDecorator('col', {
                rules: [{ required: true, message: '必填' }]
              })(
                <Select style={{ width: 150 }}>
                  {getDimLevelData.map(item => {
                    return (
                      <Option key={item.columnCode} value={item.columnCode}>{item.columnDesc}</Option>
                    )
                  })}
                </Select>
              )}
            </Form.Item>
          </div>
        </Modal>

        <Modal
          visible={visbilit}
          onOk={e => this.onOkModel(e)}
          onCancel={e => { this.setState({ visbilit: false }) }}
          title='设置'
        >
          <Form.Item label='选择指标' style={{ display: 'flex' }}>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '必填' }]
            })(
              <Select style={{ width: 200 }}>
                {measure.map(item => {
                  return (
                    <Option key={item} value={item}>{item}</Option>
                  )
                })}
              </Select>
            )}
          </Form.Item>
          <Form.Item label='选择切换图形' style={{ display: 'flex' }}>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: '必填' }]
            })(
              <Select style={{ width: 200 }}>
                {['柱状图', '折线图', '面积图'].map(item => {
                  return (
                    <Option key={item} value={item}>{item}</Option>
                  )
                })}
              </Select>
            )}
          </Form.Item>
        </Modal>
      </div>
    )
  }
}