import React, { PureComponent, Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Checkbox, Spin, Button, message, Modal, Input, Table, Collapse } from 'snk-web';

const allTable = [{
  title: '主维度',
  dataIndex: 'name',
  key: 'name',
  align: 'center'
},{
  title: '分析维度组合',
  dataIndex: 'combination',
  key: 'combination',
  align: 'center'
},{
  title: '已赚车年（车年）',
  dataIndex: 'caryear_yz',
  key: 'caryear_yz',
  align: 'center'
},{
  title: '已赚保费（元）',
  dataIndex: 'mqnetprm',
  key: 'mqnetprm',
  align: 'center'
},{
  title: '实际满期赔付率（%）',
  dataIndex: 'exppayrate',
  key: 'exppayrate',
  align: 'center'
},{
  title: '滚动12个月满期赔付率（%）',
  dataIndex: 'twemonexppayrate',
  key: 'twemonexppayrate',
  align: 'center'
},{
  title: '风险成本赔付率（%）',
  dataIndex: 'riskcostpayrate',
  key: 'riskcostpayrate',
  align: 'center'
},{
  title: '含IBNR满期赔付率（%）',
  dataIndex: 'hasibnexppayrate',
  key: 'hasibnexppayrate',
  align: 'center'
}];
const riskTable = [{
  title: '细分类别',
  dataIndex: 'name',
  key: 'name',
  align: 'center'
},{
  title: '分析维度组合',
  dataIndex: 'combination',
  key: 'combination',
  align: 'center'
},{
  title: '已赚车年（车年）',
  dataIndex: 'caryear_yz',
  key: 'caryear_yz',
  align: 'center'
},{
  title: '实收保费（元）',
  dataIndex: 'sumnetpremium',
  key: 'sumnetpremium',
  align: 'center'
},{
  title: '折前保费（元）',
  dataIndex: 'befprm',
  key: 'befprm',
  align: 'center'
},{
  title: '纯风险成本',
  dataIndex: 'ap_premium',
  key: 'ap_premium',
  align: 'center'
},{
  title: '实际满期赔付率（%）',
  dataIndex: 'exppayrate',
  key: 'exppayrate',
  align: 'center'
},{
  title: '风险成本赔付率（%）',
  dataIndex: 'riskcostpayrate',
  key: 'riskcostpayrate',
  align: 'center'
}];
const IBNR_Table = [{
  title: '细分类别',
  dataIndex: 'name',
  key: 'name',
  align: 'center'
},{
  title: '分析维度组合',
  dataIndex: 'combination',
  key: 'combination',
  align: 'center'
},{
  title: '已赚车年（车年）',
  dataIndex: 'caryear_yz',
  key: 'caryear_yz',
  align: 'center'
},{
  title: '满期保费（元）',
  dataIndex: 'mqnetprm',
  key: 'mqnetprm',
  align: 'center'
},{
  title: '已决赔款',
  dataIndex: 'settleamt',
  key: 'settleamt',
  align: 'center'
},{
  title: '未决赔款',
  dataIndex: 'oustdclmamt',
  key: 'oustdclmamt',
  align: 'center'
},{
  title: 'IBNR',
  dataIndex: 'ibnr',
  key: 'ibnr',
  align: 'center'
},{
  title: '含IBNR满期赔付率（%）',
  dataIndex: 'hasibnexppayrate',
  key: 'hasibnexppayrate',
  align: 'center'
}];
const twelve_Table = [{
  title: '细分类别',
  dataIndex: 'name',
  key: 'name',
  align: 'center'
},{
  title: '分析维度组合',
  dataIndex: 'combination',
  key: 'combination',
  align: 'center'
},{
  title: '滚动12个月的已赚车年（车年）',
  dataIndex: 'caryear_yz',
  key: 'caryear_yz',
  align: 'center'
},{
  title: '滚动12个月的满期保费（元）',
  dataIndex: 'mqnetprm',
  key: 'mqnetprm',
  align: 'center'
},{
  title: '滚动12个月的满期出险频度',
  dataIndex: 'expclmfreq',
  key: 'expclmfreq',
  align: 'center'
},{
  title: '滚动12个月的案均赔款',
  dataIndex: 'avgpay',
  key: 'avgpay',
  align: 'center'
},{
  title: '滚动12个月的单均保费',
  dataIndex: 'avgprm',
  key: 'avgprm',
  align: 'center'
},{
  title: '滚动12个月的折扣系数',
  dataIndex: 'disfactor',
  key: 'disfactor',
  align: 'center'
},{
  title: '滚动12个月的满期赔付率',
  dataIndex: 'twemonexppayrate',
  key: 'twemonexppayrate',
  align: 'center'
}];
const actualTable = [{
  title: '细分类别',
  dataIndex: 'name',
  key: 'name',
  align: 'center'
},{
  title: '分析维度组合',
  dataIndex: 'combination',
  key: 'combination',
  align: 'center'
},{
  title: '已赚车年（车年）',
  dataIndex: 'caryear_yz',
  key: 'caryear_yz',
  align: 'center'
},{
  title: '满期保费（元）',
  dataIndex: 'mqnetprm',
  key: 'mqnetprm',
  align: 'center'
},{
  title: '满期出险频度',
  dataIndex: 'expclmfreq',
  key: 'expclmfreq',
  align: 'center'
},{
  title: '案均赔款',
  dataIndex: 'avgpay',
  key: 'avgpay',
  align: 'center'
},{
  title: '单均保费',
  dataIndex: 'avgprm',
  key: 'avgprm',
  align: 'center'
},{
  title: '折扣系数',
  dataIndex: 'disfactor',
  key: 'disfactor',
  align: 'center'
},{
  title: '满期赔付率',
  dataIndex: 'exppayrate',
  key: 'exppayrate',
  align: 'center'
}];

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class TableData extends Component{
  constructor(props){
    super(props);
    this.state = {
      dataSource1: [],          // 总表格数据
      dataSource2: [],          // 风险成本赔付率表格数据
      dataSource3: [],          // 含IBNR满期赔付率表格数据
      dataSource4: [],          // 滚动12个月满期赔付率表格数据
      show: 'none',             // 总表格是否显示
      show1: 'none',             // 风险成本赔付率表格是否显示
      show2: 'none',             // 含IBNR满期赔付率表格是否显示
      show3: 'none',             // 滚动12个月满期赔付率表格是否显示
    }
  }

  // 父组件调用的方法，设置表格数据
  setTable = () => {
    const { getMeasure } = this.props.root.state;
    const { payRate, rollTwelvePayRate } = this.props.analysis[getMeasure + 'Data'];
    const measureCode = this.props.root.Measure.state.measure;
    let { show, show1, show2, show3, show4 } = this.state;
    const dataSource1 = [], dataSource2 = [], dataSource3 = [], dataSource4 = [], dataSource5 = [];     // 存放表格数据
    // 先设置总表格
    if(payRate.length !== 0){
      for(let i in payRate){
        const { mainDimeVal, mainDim } = payRate[i];
        for(let j in mainDimeVal){
          const obj = {};
          obj.name = mainDim;
          obj.combination = mainDimeVal[j].xdata;
          obj.caryear_yz = mainDimeVal[j].caryear_yz;
          obj.mqnetprm = mainDimeVal[j].mqnetprm;
          obj.exppayrate = mainDimeVal[j].exppayrate;
          obj.riskcostpayrate = mainDimeVal[j].riskcostpayrate;
          obj.hasibnexppayrate = mainDimeVal[j].hasibnexppayrate;
          obj.twemonexppayrate = gettwe(mainDimeVal[j], mainDim);
          dataSource1.push(obj)
        }
      }
      show = 'block';
    }

    function gettwe(main, mainD){
      // 这个地方给总表格的滚动12个月配值，因为处于不同的两个对象，所以需要在滚动12个月对象中判断当前主维度并且包含分析维度，再赋值
      let twemonexppayrate = '';
      for(let o in rollTwelvePayRate){
        let { mainDimeVal, mainDim } = rollTwelvePayRate[o];
        if(!mainDim) mainDim = mainD;
        for(let k in mainDimeVal){
          if(main.xdata.indexOf(mainDimeVal[k].xdata) !== -1 && mainD === mainDim){
            twemonexppayrate = mainDimeVal[k].twemonexppayrate;
            return twemonexppayrate
          }
        }
      }
    }
    for(let i of measureCode){
      // 风险成本赔付率
      if(i === 'riskcostpayrate'){
        if(payRate.length !== 0){
          for(let i in payRate){
            const { mainDimeVal, mainDim } = payRate[i];
            for(let j in mainDimeVal){
              const obj = {};
              obj.name = mainDim;
              obj.combination = mainDimeVal[j].xdata;
              obj.caryear_yz = mainDimeVal[j].caryear_yz;
              obj.sumnetpremium = mainDimeVal[j].sumnetpremium;
              obj.befprm = mainDimeVal[j].befprm;
              obj.ap_premium = mainDimeVal[j].ap_premium;
              obj.exppayrate = mainDimeVal[j].exppayrate;
              obj.riskcostpayrate = mainDimeVal[j].riskcostpayrate;
              dataSource2.push(obj)
            }
          }
          show1 = 'block';
        }
      }
      // 含IBNR满期赔付率
      if(i === 'hasibnexppayrate'){
        if(payRate.length !== 0){
          for(let i in payRate){
            const { mainDimeVal, mainDim } = payRate[i];
            for(let j in mainDimeVal){
              const obj = {};
              obj.name = mainDim;
              obj.combination = mainDimeVal[j].xdata;
              obj.caryear_yz = mainDimeVal[j].caryear_yz;
              obj.mqnetprm = mainDimeVal[j].mqnetprm;
              obj.settleamt = mainDimeVal[j].settleamt;
              obj.oustdclmamt = mainDimeVal[j].oustdclmamt;
              obj.ibnr = mainDimeVal[j].ibnr;
              obj.hasibnexppayrate = mainDimeVal[j].hasibnexppayrate;
              dataSource3.push(obj)
            }
          }
          show2 = 'block';
        }
      }
      // 滚动12个月满期赔付率
      if(i === 'twemonexppayrate'){
        if(rollTwelvePayRate.length !== 0){
          for(let i in rollTwelvePayRate){
            const { mainDimeVal, mainDim } = rollTwelvePayRate[i];
            for(let j in mainDimeVal){
              const obj = {};
              obj.name = mainDim;
              obj.combination = mainDimeVal[j].xdata;
              obj.caryear_yz = mainDimeVal[j].caryear_yz;
              obj.mqnetprm = mainDimeVal[j].mqnetprm;
              obj.expclmfreq = mainDimeVal[j].expclmfreq;
              obj.avgpay = mainDimeVal[j].avgpay;
              obj.avgprm = mainDimeVal[j].avgprm;
              obj.disfactor = mainDimeVal[j].disfactor;
              obj.twemonexppayrate = mainDimeVal[j].twemonexppayrate;
              dataSource4.push(obj)
            }
          }
          show3 = 'block';
        }
      }
      // 实际满期赔付率
      if(i === 'exppayrate'){
        if(payRate.length !== 0){
          for(let i in payRate){
            const { mainDimeVal, mainDim } = payRate[i];
            for(let j in mainDimeVal){
              const obj = {};
              obj.name = mainDim;
              obj.combination = mainDimeVal[j].xdata;
              obj.caryear_yz = mainDimeVal[j].caryear_yz;
              obj.mqnetprm = mainDimeVal[j].mqnetprm;
              obj.expclmfreq = mainDimeVal[j].expclmfreq;
              obj.avgpay = mainDimeVal[j].avgpay;
              obj.avgprm = mainDimeVal[j].avgprm;
              obj.disfactor = mainDimeVal[j].disfactor;
              obj.exppayrate = mainDimeVal[j].exppayrate;
              dataSource5.push(obj)
            }
          }
          show4 = 'block';
        }
      }
    }
    
    this.setState({ dataSource1, dataSource2, dataSource3, dataSource4, dataSource5, show, show1, show2, show3, show4 })
  }

  render(){
    const { dataSource1, dataSource2, dataSource3, dataSource4, dataSource5, show, show1, show2, show3, show4 } = this.state;
    return(
      <div>
        <Table columns={allTable} dataSource={dataSource1} style={{display: show}} bordered size="middle"/>
        <Table 
          style={{display: show1}} 
          columns={riskTable} 
          dataSource={dataSource2} 
          bordered size="middle"
          title={()=>{
            return(
              <div style={{position: 'relative'}}>
                <div style={{ textAlign:'center', fontWeight:'bolder' }}>风险成本赔付率</div>
              </div>
            )
          }}/>
        <Table 
          style={{display: show2}} 
          columns={IBNR_Table} 
          dataSource={dataSource3} 
          bordered size="middle"
          title={()=>{
            return(
              <div style={{position: 'relative'}}>
                <div style={{ textAlign:'center', fontWeight:'bolder' }}>含IBNR满期赔付率</div>
              </div>
            )
          }}/>
        <Table 
          style={{display: show3}} 
          columns={twelve_Table} 
          dataSource={dataSource4} 
          bordered size="middle"
          title={()=>{
            return(
              <div style={{position: 'relative'}}>
                <div style={{ textAlign:'center', fontWeight:'bolder' }}>滚动12个月满期赔付率</div>
              </div>
            )
          }}/>
        <Table 
          style={{display: show4}} 
          columns={actualTable} 
          dataSource={dataSource5} 
          bordered size="middle"
          title={()=>{
            return(
              <div style={{position: 'relative'}}>
                <div style={{ textAlign:'center', fontWeight:'bolder' }}>实际满期赔付率</div>
              </div>
            )
          }}/>
      </div>
    )
  }
}