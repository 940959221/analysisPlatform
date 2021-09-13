import React, { PureComponent, Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Checkbox, Spin, Button, message, Modal, Input, Table, Collapse } from 'snk-web';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/component/title';
import 'echarts/lib/component/graphic';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class Echarts extends Component{
  constructor(props){
    super(props);
    this.state = {

    }
  }

  setCharts = () => {
    const mychart = echarts.init(this.charts);
    const { getMeasure, getMeasures } = this.props;
    const { payRate, rollTwelvePayRate } = this.props.analysis[getMeasure + 'Data'];
    const measures = this.props.analysis[getMeasures + 'Data'];
    const measureCode = this.props.root.Measure.state.measure;
    let button = [];
    let buttonName = [];
    console.log(this.props.analysis[getMeasure + 'Data']);
    const xdata = [];
    // 把所有的xdata遍历去重后存入button
    for(let i in payRate){ 
      xdata.push(payRate[i].mainDim);
      const { mainDimeVal } = payRate[i];
      for(let j of mainDimeVal){
        button.push(j.xdata);
      }
    }
    button = button.filter((item, index) => button.indexOf(item) === index);
    // 根据不同的指标搭配上不同的xdata，形成完整的按钮名称
    for(let i of button){
      for(let j of measureCode){
        for(let k of measures){
          if(k.attrCode === j) buttonName.push(i + '+' + k.attrName)
        }
      }
    }
    console.log(buttonName)
    // echarts图配置
    const option = {
      title: {
          text: '赔付预测统计图',
          x: 'center',
          y: 0,
          textStyle:{
              fontSize:16,
              fontWeight:'normal',
          },
          
      },
      tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow',
              label: {
                  show: true,
              }
          }
      },
      legend: {
          data: buttonName,
          textStyle: {
              color: '#B4B4B4'
          },
          top:'5%',
      },
      grid:{
        left: '3%',
        right: '4%',
        top: '30%',
        containLabel: true
      },
      xAxis: {
          data: xdata,
          axisLine: {
              lineStyle: {
              }
          },
          axisTick:{
              show:false,
          },
          axisLabel: {
            show: true,
            interval:0,
          }
      },
      yAxis: [{
          axisLabel:{
              formatter:'{value} ',
          }
      },
          {
          axisLabel:{
              formatter:'{value} ',
          }
      }],
      
      series: []
  };
  // 创建对象用于储存payRate的数据，属性名为按钮名，值为所选指标对应的值的数组集合
    const allData_obj = {};
    const length = payRate.length;
    for(let i in buttonName){
      allData_obj[buttonName[i]] = [];
      for(let l = 0; l < length; l++){
        allData_obj[buttonName[i]][l] = {};
      }
      for(let j in payRate){
        const { mainDimeVal } = payRate[j];
        for(let k in mainDimeVal){
          if(buttonName[i].split('+')[0] === mainDimeVal[k].xdata){
            for(let a of measureCode){
              if(a === 'twemonexppayrate'){
                allData_obj[buttonName[i]][j].twemonexppayrate = rollTwelvePayRate[j] ? (rollTwelvePayRate[j].mainDimeVal[k] ? (rollTwelvePayRate[j].mainDimeVal[k].twemonexppayrate === undefined 
                ? 0 : rollTwelvePayRate[j].mainDimeVal[k].twemonexppayrate) : 0) : 0;
              }else{
                allData_obj[buttonName[i]][j][a] = mainDimeVal[k][a];
              }
            }
            
          }
        }
      }
    }
    console.log(allData_obj)
    // 根据所创建对象的属性名所截取的值不同，给echarts的配置新增数据
    for(let i in allData_obj){
      switch (i.split('+')[1]){
        case '已赚车年': {
          const data = [];
          for(let j of allData_obj[i]){
            if(JSON.stringify(allData_obj[i]) !== '{}'){
              data.push(j.caryear_yz)
            }
          }
          option.series.push({
            name: i,
            type: 'bar',
            stack: '已赚车年',
            data
          })
        }break;
        case '满期赔付率': {
          const data = [];
          for(let j of allData_obj[i]){
            if(JSON.stringify(allData_obj[i]) !== '{}'){
              data.push(j.exppayrate)
            }
          }
          option.series.push({
            name: i,
            type: 'line',
            stack: '满期赔付率',
            yAxisIndex: 1,
            data
          })
        }break;
        case '含IBNR满满期赔付率': {
          const data = [];
          for(let j of allData_obj[i]){
            if(JSON.stringify(allData_obj[i]) !== '{}'){
              data.push(j.hasibnexppayrate)
            }
          }
          option.series.push({
            name: i,
            type: 'line',
            stack: '含IBNR满满期赔付率',
            yAxisIndex: 1,
            data
          })
        }break;
        case '风险成本赔付率': {
          const data = [];
          for(let j of allData_obj[i]){
            if(JSON.stringify(allData_obj[i]) !== '{}'){
              data.push(j.riskcostpayrate)
            }
          }
          option.series.push({
            name: i,
            type: 'line',
            stack: '风险成本赔付率',
            yAxisIndex: 1,
            data
          })
        }break;
        case '滚动12个月满期赔付率': {
          const data = [];
          for(let j of allData_obj[i]){
            if(JSON.stringify(allData_obj[i]) !== '{}'){
              data.push(j.twemonexppayrate)
            }
          }
          option.series.push({
            name: i,
            type: 'line',
            stack: '滚动12个月满期赔付率',
            yAxisIndex: 1,
            data
          })
        }break;
      } 

    }
    if(buttonName.length * 30 < 300) this.charts.style.height = '300px';
    else if(buttonName.length * 30 > 32500) this.charts.style.height = '32500px';
    else this.charts.style.height = `${buttonName.length * 30}px`
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  }

  render(){
    return(
      <div ref={e => this.charts = e} style={{width: '100%'}}></div>
    )
  }
}