import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'snk-web';
import green from '../../../assets/cardGreen.png';
import { message } from 'snk-web';
const red = require('../../../assets/cardRed.png');
const yellow = require('../../../assets/cardYellow.png');
const styles = require('./styles.less');




@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class CardsComponent extends Component {
  state = {
    show: true
  }

  componentDidMount() {
    const { datas } = this.props;
    if (datas.code !== "S") {
      message.error(datas.msg);
      this.setState({ show: false })
    }
  }

  // 卡片点击下钻
  cardDrillDown = (id) => {
    const { getService, drillDownAllData } = this.props.root.state;
    if (getService) {    // 配置这个的原因在于有可能请求过慢，导致过程中用户进行了其他的下钻，会导致数据混淆
      message.warn('当前有请求正在发送，请稍后操作！');
      return;
    }
    this.props.root.setState({ getService: true })
    this.props.dispatch({
      type: 'analysis/cardDrillDown',
      payload: {
        assemId: id
      }
    }).then(async () => {
      message.success('下钻成功！');
      const { cardDrillDownData } = this.props.analysis;
      const infoObj = {};
      let saveObj = {};
      // 下钻返回的数据中进行一个图表的配置
      console.log(cardDrillDownData.measureInfos);
      for (let i in cardDrillDownData.measureInfos) {
        const datas = cardDrillDownData.measureInfos[i];
        infoObj[i] = {
          UNIT: cardDrillDownData[`y${datas.axis}Unit`],
          contemporaneousDataType: '1',
          cycle: cardDrillDownData.frequency,
          dataSource: 'kylin',
          isPercentage: '0',
          isShow: '1',
          measure: datas.measureFile,
          measureCode: datas.measureFile,
          measureData: datas.measureData,
          measureDomainCode: datas.measureFile,
          measureName: datas.measureName,
          propFlag: datas.propFlag,
          percentageTableColumn: datas.percentageTableColumn,
          propColumnValue: datas.propColumnValue,
          splmeasureFlag: datas.splmeasureFlag,
          style: datas.style,
          themeId: datas.themeId,
          valueType: datas.valueType,
          yAxis: datas.axis,
          istendaysAgo: datas.istendaysAgo
        }
        saveObj = JSON.stringify(infoObj[i]);
      }
      const newDatas = {
        datas: {
          retListInfos: [],
          graphComponentName: cardDrillDownData.assemName,
          subGraphs: {
            subGraph1: {
              baseline: [],
              contemporaneousDataType: undefined,
              cycle: cardDrillDownData.frequency,
              dimension: cardDrillDownData.dimColum,
              filter: cardDrillDownData.filter,
              graphType: "1",
              isList: "1",
              measureCode: cardDrillDownData.mainMeasureFile,
              measureDomainCode: cardDrillDownData.mainMeasureFile,
              // style: "柱状图",
              measureInfos: infoObj,
              subGraph: "subGraph1",
              subGraphName: cardDrillDownData.filterName,
              // valueType: subGraph1.valueType,
              xDim: cardDrillDownData.dimTable,
              y1Unit: cardDrillDownData.y1Unit,
              y2Unit: cardDrillDownData.y2Unit,
              // yAxis: "1",
            }
          }
        },
        payload: {
          istendaysAgo: cardDrillDownData.istendaysAgo,
          dimColum: cardDrillDownData.dimColum,
          dimColum2: cardDrillDownData.dimColum,
          dimTable: cardDrillDownData.dimTable,
          dimTable2: cardDrillDownData.dimTable,
          filter: cardDrillDownData.filter,
          frequency: cardDrillDownData.frequency,
          measure: cardDrillDownData.mainMeasureFile,
          themeId: cardDrillDownData.themeId,
          valueType: cardDrillDownData.valueType,
          measureName: cardDrillDownData.measureName,
          propFlag: cardDrillDownData.propFlag,
          percentageTableColumn: cardDrillDownData.percentageTableColumn,
          propColumnValue: cardDrillDownData.propColumnValue,
          splmeasureFlag: cardDrillDownData.splmeasureFlag,
        },
        recommList: cardDrillDownData.recommList,
        reFilterName: cardDrillDownData.reFilterName
      };
      console.log(newDatas);
      await this.props.root.setState({
        drillDownAllData: [...drillDownAllData, newDatas], drillVisibilit: true,
        saveObj, getService, componentName: cardDrillDownData.assemName
      });

      // 调用Charts组件中的方法，重绘echarts图形
      // for (let i in this.props.root.chartDirll) {
      //   if (i.indexOf('Charts') >= 0) {
      //     this.props.root.chartDirll[i].didMount()
      //   }
      // }
    }, err => {
      if (err.code === 99) {
        const { queryPortalListData: { portalId } } = this.props.analysis;
        this.props.dispatch({
          type: 'analysis/qMeasureData',
          payload: {
            id: err.message,
            portalId
          }
        }).then(() => {
          const { qMeasureDataData } = this.props.analysis;
          const newDatas = {
            datas: qMeasureDataData
          }
          this.props.root.setState({ drillDownAllData: [...drillDownAllData, newDatas], drillVisibilit: true, getService });
        }, err => {
          message.error(err.message)
        })
      } else {
        message.error(err.message);
        this.props.root.setState({ getService: false });
      }
    })
  }

  render() {
    const { show } = this.state;
    let { datas: { alaIndInfo, cardType, othIndInfos, alarmType, count, dimName, alarmTex, showDim, id, frequency }, type } = this.props;
    let color, obj, colorType, text, time, showText, colors;
    if (type === 'ord') {
      obj = {
        measureName: alaIndInfo.measureName,
        measureUnit: alaIndInfo.measureUnit,
        measureValue: alaIndInfo.measureValue,
        showLink: alaIndInfo.showLink,
        id
      }
      colorType = alaIndInfo.alarmType;
      text = alaIndInfo.alarmTex;
    } else {
      obj = {
        measureName: '个数',
        measureUnit: '',
        measureValue: count,
        showLink: showDim,
        id
      }
      colorType = alarmType;
      text = alarmTex;
    }

    if (!othIndInfos) othIndInfos = {};
    const measureArr = [obj, ...othIndInfos];
    switch (colorType) {
      case 'green': color = green; colors = '#4DC61B'; break;
      case 'red': color = red; colors = '#FD574B'; break;
      default: color = yellow; colors = '#E5B100'; break;
    }
    switch (frequency) {
      case 'week': time = '周'; break;
      case 'day': time = '日'; break;
      default: time = '月'; break;
    }

    return (
      <React.Fragment>
        {show ?
          <div className={styles.parent} onClick={() => this.cardDrillDown(id)}>
            <div className={styles.child} style={{ backgroundImage: `url(${color})`, backgroundSize: '200%', backgroundRepeat: 'round' }}>
              <div className={styles.title} title={text} style={{ color: colors, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{text}</div>
              <div className={styles.measures}>
                {measureArr.map((item, index) => {
                  let unit, link, value, useLink = false, moreDom = false, widths = null, title = null;
                  if (type === 'ord') {
                    if (item.showLink && item.showLink === '1') {
                      link = alaIndInfo.link;
                      useLink = true;
                    }
                  } else {
                    if (dimName !== '') link = dimName;
                  }
                  switch (item.measureUnit) {
                    case '1': {
                      unit = '(件数)';
                      value = item.measureValue;
                    }; break;
                    case '2': {
                      if (parseInt(item.measureValue).toString().length > 8) {
                        unit = '(亿元)';
                        value = (item.measureValue / 100000000).toFixed(2);
                      } else {
                        unit = '(万元)';
                        value = (item.measureValue / 10000).toFixed(2);
                      }
                    } break;
                    case '3': {
                      unit = '(%)';
                      value = (item.measureValue * 100).toFixed(2);
                    } break;
                    case '5': {
                      unit = '(日)';
                      value = item.measureValue;
                    } break;
                    default: {
                      unit = '';
                      value = item.measureValue;
                    } break;
                  }
                  title = `${item.measureName + unit}\n频度：${time}\n ${link || link === 0 ?
                    (useLink ? '环比：' + link : '' + moreDom ? '' : link) : ''}`;

                  if (!useLink && link && link !== '') moreDom = true;

                  switch (measureArr.length) {
                    case 1: widths = '100%'; break;
                    case 2: widths = '45%'; break;
                    default: widths = '30%';
                  }
                  if (moreDom) widths = '100%';
                  return (
                    <div key={index} className={styles.middleMeasure} style={item.dim ? {} : { width: widths }}>
                      <div style={moreDom ? { width: '45%' } : {}} className={styles.measure} key={item.measureName + index}>
                        <div className={styles.value} title={item.measureValue}>{item.dim ? '' : value}</div>
                        <div title={title}
                          className={styles.measureName}>{item.dim ? '' : item.measureName + unit}</div>
                        <div title={title} className={styles.measureName}>{item.dim ? '' : '频度：' + time}</div>
                        {moreDom ? null : link || link === 0 ? <div title={title} className={styles.measureName}>{useLink ? '环比：' + (link * 100).toFixed(2) + '%' : link}</div> : null}
                      </div>
                      {moreDom ? <div style={moreDom ? { width: '45%' } : {}} className={styles.moreDom} title={link}>维度：{link}</div> : null}
                    </div>

                  )
                })}
              </div>
            </div>
          </div> : null}
      </React.Fragment>
    )
  }
}
