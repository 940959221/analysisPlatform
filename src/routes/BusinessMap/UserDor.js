import React, { Component } from 'react';
import { connect } from 'dva';
import { ReactSortable } from "react-sortablejs";
import { Form, Card, Spin, Button, message, Modal, Input, Collapse, Select, Row, Col, Popconfirm, List, Avatar } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/component/title';
import 'echarts/lib/component/graphic';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/toolbox';
import { resolve } from 'url';

const { Panel } = Collapse;
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

const data = [
  {
    title: 'Ant Design Title 1',
  },
  {
    title: 'Ant Design Title 2',
  },
  {
    title: 'Ant Design Title 3',
  },
  {
    title: 'Ant Design Title 4',
  },
];
const data1 = [
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
  'Man charged over missing wedding girl.',
  'Los Angeles battles huge wildfires.',
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
  'Man charged over missing wedding girl.',
  'Los Angeles battles huge wildfires.',
];

const sort = {
  display: 'flex', 
  flexWrap: 'wrap'
  // columnCount:2, 
  
}; 
const picture = {
  width: '100%', 
  height: '100%', 
  border: 'solid 2px #000', 
  boxSizing: 'border-box', 
}
const title_style = {
  border: 'none',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  paddingLeft: '15px',
}
const box = {
  padding: '14px',
  position: 'relative', 
  breakInside: 'avoid'
}
const edit = {
  position: 'absolute', 
  color: 'red', 
  textDecoration: 'underline', 
  fontSize: '12px',
  zIndex: 100, 
  right: 0, 
  top: 0
}
const openModal = {
  position: 'absolute',
  top: 0, 
  bottom: 0,
  left: 0,
  right: 0,
  margin: 'auto',
  height: '90%', 
  paddingBottom: 0, 
  overflow: 'auto'
}

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class UserDor extends Component{
  constructor(props){
    super(props);
    this.state = {
      list: [{ id: "1", name: "line", width: '100%', height: '400px' },{ id: "2", name: "pie", width: '25%', height: '300px' },{ id: "3", name: "bar", width: '25%', height: '200px' }],
      addVisibilit: false,      // 点击添加时的弹窗
      aitdVisibilit: false,     // 点击编辑时的弹窗
      add: false,               // 是否点击添加按钮
      widthList: [{size: '小', width: '25%'}, {size: '大', width: '100%'}],
      measures: [1,2,3,4,5],
      type: [{name: '柱状图', code: 'bar'}, {name: '饼状图', code: 'pie'}, {name: '折线图', code: 'line'}, {name: '地图', code: 'map'}],
      id: null,                 // 当前操作的元素id
      setTitle: false,          // 是否设置标题
      titleBackground: [{name: '红色', code: '#e1251b'}, {name: '绿色', code: '#C7E2D7'}, {name: '蓝色', code: '#23a2d9'}],
      allowSet: false,          // 是否允许自定义
      drillVisibilit: false,    // 下钻弹窗是否显示
    }
  }

  componentWillMount(){
    const list = window.localStorage.getItem('chartsList');
    console.log(list) 
    if(list) this.setState({ list: JSON.parse(list) })
  }

  componentDidMount(){
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';
    
    this.sor.sortable.options.disabled = true;

    setTimeout(() => {
      const sortableList = document.getElementsByClassName('sortable');
      console.log(sortableList)
      for(let i of sortableList){
        if(i.id.split('+')[0] === 'line') this.setLine(i);
        if(i.id.split('+')[0] === 'bar') this.setBar(i);
        if(i.id.split('+')[0] === 'pie') this.setPie(i);
      }
    })
  }

  setLine = (i) => {
    console.log(i)
    let mychart = echarts.init(i);
    console.log(mychart)
    let option = {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      toolbox: {
        show: true,
        feature: {
          myTool1: {
            show: true,
            title: '自定义扩展方法1',
            icon: 'path://M989.866667 512a477.866667 477.866667 0 1 1-477.866667-477.866667c2.2528 116.053333 0 477.866667 0 477.866667s389.12 0.682667 477.866667 0z" fill="#4185F4" opacity=".5" p-id="2960"></path><path d="M989.866667 443.733333a409.6 409.6 0 0 0-409.6-409.6c1.297067 292.864 0 409.6 0 409.6s171.690667-3.413333 409.6 0z',
            onclick: function (){
                alert('myToolHandler1')
            }
        },
            // dataZoom: {
            //     yAxisIndex: 'none'
            // },
            dataView: {readOnly: false},
            magicType: {type: ['line', 'bar', 'stack', 'tiled']},
            restore: {},
            saveAsImage: {}
        }
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        areaStyle: {}
      }]
    };
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  }

  setPie = (i) => {
    const _this = this;
    let mychart = echarts.init(i);
    let option = {
      element: i,
      tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      toolbox: {
        show: true,
        feature: {
          myTool1: {
            show: true,
            title: '切换为饼图',
            icon: 'path://M902.573115 538.712435l60.111478 4.035763C946.843521 778.856364 748.861121 963.768529 511.970002 963.768529 262.851599 963.768529 60.231471 761.148401 60.231471 512.029998c0-235.205218 183.526247-433.066625 417.888514-450.473605l4.456739 60.051482C279.535621 136.665992 120.463942 308.145945 120.463942 512.029998c0 215.870351 175.635709 391.50706 391.50606 391.50706 205.329969 0 376.869918-160.216612 390.603113-364.824623zM1023.940004 451.737531v30.116235l-30.176232 1.02394h-450.653595V0L573.286409 0.059996C821.801848 0.601965 1023.940004 203.282089 1023.940004 451.737531z m-61.075422-29.091295C949.434369 231.711423 795.661379 76.735504 603.341648 61.556393v361.088843H962.863582z',
            onclick: function (e){
              _this.setPie(e.option.element);
            }
          },
          myTool2: {
            show: true,
            title: '切换为柱状图',
            icon: 'path://M277.71875 461.75h-93.1875c-34.6875 0-62.90625 28.78125-62.90625 64.125v315.9375c0 35.34375 28.21875 64.125 62.90625 64.125h93.1875c34.6875 0 62.90625-28.78125 62.90625-64.125v-315.9375c0-35.34375-28.21875-64.125-62.90625-64.125z m-7.03125 372.9375h-79.21875V533h79.21875v301.6875zM544.15625 276.5h-80.71875c-38.15625 0-69.1875 31.59375-69.1875 70.5v488.4375c0 38.90625 31.03125 70.5 69.1875 70.5h80.71875c38.15625 0 69.1875-31.59375 69.1875-70.5V347c0-38.90625-31.03125-70.5-69.1875-70.5z m-0.75 558.1875l-79.21875 0.75-0.75-487.6875 79.96875-0.75v487.6875zM811.71875 95.9375h-70.40625c-40.96875 0-74.34375 33.9375-74.34375 75.75v658.5c0 41.8125 33.375 75.75 74.34375 75.75h70.40625c40.96875 0 74.34375-34.03125 74.34375-75.75V171.6875c0-41.71875-33.375-75.75-74.34375-75.75z m4.40625 734.25c0 2.4375-1.96875 4.5-4.40625 4.5h-70.40625c-2.4375 0-4.40625-2.0625-4.40625-4.5V171.6875c0-2.4375 1.96875-4.5 4.40625-4.5h70.40625c2.4375 0 4.40625 1.96875 4.40625 4.5v658.5z',
            onclick: function (e){
              console.log(e)
              _this.setBar(e.option.element);
            }
          },
          myTool3: {
            show: true,
            title: '切换为折线图',
            icon: 'path://M1024 331.9c0-54.8-44.5-99.2-99.2-99.2-54.8 0-99.2 44.4-99.2 99.2 0 29.4 13.1 55.6 33.5 73.8L785.1 652c-0.6 0.1-1.3 0.1-1.9 0.1L484.7 216.5c8.8-14.8 14.2-31.9 14.2-50.3 0-54.8-44.5-99.3-99.3-99.3s-99.3 44.5-99.3 99.3c0 21.1 6.7 40.4 17.8 56.4L81.6 790C35.3 798.4 0 838.7 0 887.5c0 54.8 44.5 99.2 99.3 99.2 54.7 0 99.2-44.4 99.2-99.2 0-30.4-13.9-57.4-35.5-75.6L391.1 264.5c2.9 0.2 5.5 0.9 8.4 0.9 5.6 0 10.9-0.8 16.2-1.7l298.5 435.7c-8.7 14.7-14.1 31.9-14.1 50.3 0 54.8 44.4 99.2 99.2 99.2s99.2-44.4 99.2-99.2c0-29.6-13.1-55.7-33.4-73.9l73.8-246.2c48.2-6.9 85.1-47.8 85.1-97.7z',
            onclick: function (e){
              _this.setLine(e.option.element);
            }
          },
          dataZoom: {
              yAxisIndex: 'none'
          },
          dataView: {readOnly: false},
          magicType: {type: ['line', 'bar', 'stack', 'tiled']},
          restore: {},
          saveAsImage: {}
        }
      },
      legend: {
          orient: 'vertical',
          left: 10,
          data: ['直达', '营销广告', '搜索引擎', '邮件营销', '联盟广告', '视频广告', '百度', '谷歌', '必应', '其他']
      },
      series: [
          {
              name: '访问来源',
              type: 'pie',
              selectedMode: 'single',
              radius: [0, '30%'],
  
              label: {
                  position: 'inner'
              },
              labelLine: {
                  show: false
              },
              data: [
                  {value: 335, name: '直达', selected: true},
                  {value: 679, name: '营销广告'},
                  {value: 1548, name: '搜索引擎'}
              ]
          },
          {
              name: '访问来源',
              type: 'pie',
              radius: ['40%', '55%'],
              label: {
                  formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ',
                  backgroundColor: '#eee',
                  borderColor: '#aaa',
                  borderWidth: 1,
                  borderRadius: 4,
                  // shadowBlur:3,
                  // shadowOffsetX: 2,
                  // shadowOffsetY: 2,
                  // shadowColor: '#999',
                  // padding: [0, 7],
                  rich: {
                      a: {
                          color: '#999',
                          lineHeight: 22,
                          align: 'center'
                      },
                      // abg: {
                      //     backgroundColor: '#333',
                      //     width: '100%',
                      //     align: 'right',
                      //     height: 22,
                      //     borderRadius: [4, 4, 0, 0]
                      // },
                      hr: {
                          borderColor: '#aaa',
                          width: '100%',
                          borderWidth: 0.5,
                          height: 0
                      },
                      b: {
                          fontSize: 16,
                          lineHeight: 33
                      },
                      per: {
                          color: '#eee',
                          backgroundColor: '#334455',
                          padding: [2, 4],
                          borderRadius: 2
                      }
                  }
              },
              data: [
                  {value: 335, name: '直达'},
                  {value: 310, name: '邮件营销'},
                  {value: 234, name: '联盟广告'},
                  {value: 135, name: '视频广告'},
                  {value: 1048, name: '百度'},
                  {value: 251, name: '谷歌'},
                  {value: 147, name: '必应'},
                  {value: 102, name: '其他'}
              ]
          }
      ]
  };
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  }

  setBar = (i) => {
    let mychart = echarts.init(i);
    var xAxisData = [];
    var data1 = [];
    var data2 = [];
    for (var i = 0; i < 100; i++) {
        xAxisData.push('类目' + i);
        data1.push((Math.sin(i / 5) * (i / 5 -10) + i / 6) * 5);
        data2.push((Math.cos(i / 5) * (i / 5 -10) + i / 6) * 5);
    }
    
    let option = {
        title: {
            text: '柱状图动画延迟'
        },
        legend: {
            data: ['bar', 'bar2']
        },
        toolbox: {
            // y: 'bottom',
            feature: {
                magicType: {
                    type: ['stack', 'tiled']
                },
                dataView: {},
                saveAsImage: {
                    pixelRatio: 2
                }
            }
        },
        tooltip: {},
        xAxis: {
            data: xAxisData,
            splitLine: {
                show: false
            }
        },
        yAxis: {
        },
        series: [{
            name: 'bar',
            type: 'bar',
            data: data1,
            animationDelay: function (idx) {
                return idx * 10;
            }
        }, {
            name: 'bar2',
            type: 'bar',
            data: data2,
            animationDelay: function (idx) {
                return idx * 10 + 100;
            }
        }],
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
            return idx * 5;
        }
    };
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  }

  saveList = () => {
    console.log(document.getElementsByClassName('sortable'))
    window.localStorage.setItem('chartsList', JSON.stringify(this.state.list));
  }

  // 添加
  add = () => {
    this.setState({ addVisibilit: true, add: true })
  }

  // 设置大小
  setWidth = (e) => {
    let type;
    if(e === '1X1') {
      type = [{name: '标签', code: 'tab'}];
    }else if(e === '3X1'){
      type = [{name: '标题', code: 'title'},{name: '柱状图', code: 'bar'}, {name: '饼状图', code: 'pie'}, {name: '折线图', code: 'line'}, {name: '地图', code: 'map'}];
    }else{
      type = [{name: '柱状图', code: 'bar'}, {name: '饼状图', code: 'pie'}, {name: '折线图', code: 'line'}, {name: '地图', code: 'map'}];
    }
    this.setState({ type })
    this.props.form.setFieldsValue({ setType: [] })
  }

  // 弹窗点击确定
  onOkModel = () => {
    this.props.form.validateFields((err, values) => {
      if(err && !err.textarea) return;
      const { add, list, id, widthList } = this.state;
      const nowTime = new Date().getTime();   // 获取当前时间
      const { setWidth, measures, url, setType, setTitleName, setTitleBackground } = values;
      let nowWidth;
      for(let i of widthList){
        if(i.size === setWidth) nowWidth = i.width;
      }
      // 创建一个新的数据对象
      const obj = { id: nowTime, name: setType + '+' + nowTime, background: setTitleBackground, width: nowWidth, height: '', text: setTitleName };
      // 如果是点击添加进行的就把新增的元素插入到最前面，否则就修改元素
      if(add){
        list.unshift(obj)
        this.setState({ id: setType + '+' + nowTime, add: false })
      }else{
        for(let i in list){
          if(list[i].name === id){
            list.splice(i,1,obj)
            this.setState({ list: list, id: setType + '+' + nowTime });
          }
        }
      }
      
      // 在一段时间的延迟后
      setTimeout(() => {
        let { id, list } = this.state;
        const sortableList = document.getElementById(setType + '+' + nowTime);
        const parent = sortableList.parentNode;
        const width = window.getComputedStyle(this.sor.ref.current).width;
        let height;
        if(setWidth === '1X1' || setWidth === '2X1') height = (2 * parseInt(width)) / 9 + 'px';
        else if(setWidth === '2X2' || setWidth === '1X2') height = (4 * parseInt(width)) / 9 + 'px';
        else height = parseInt(width) / 2 + 'px';

        if(setType === 'title'){
          height = '80px';
          parent.style.height = height;
          parent.childNodes[0].style.fontSize = '12px';
        }else parent.style.height = height;

        obj.height = height;
        if(setType === 'line') this.setLine(sortableList);
        if(setType === 'bar') this.setBar(sortableList);
        if(setType === 'pie') this.setPie(sortableList);
        
        for(let i in list){
          if(list[i].name === id){
            list.splice(i,1,obj)
            this.setState({ list: list });
          }
        }
      }, 200);
      this.setState({ addVisibilit: false })
    })
  }

  // 编辑
  edit = (e) => {
    this.setState({ addVisibilit: true, id: e })
  }

  // 下钻
  drill = (e) => {
    (async () => {
      await this.setState({ drillVisibilit: true, id: e })
      const type = e.split('+')[0];
      const width = parseInt(window.getComputedStyle(this.dirllChart).width);
      const height = width * 2 / 3 + 'px';
      this.dirllChart.style.height = height;
      console.log(type)
      if(type === 'line') this.setLine(this.dirllChart);
      if(type === 'bar') this.setBar(this.dirllChart);
      if(type === 'pie') this.setPie(this.dirllChart);
    })()
  }

  // 添加的时候监听选择的类型
  changeType = (e) => {
    if(e === 'title') this.setState({ setTitle: true })
    else this.setState({ setTitle: false })
  }

  // 点击自定义当前模板
  userSet = () => {
    const { allowSet } = this.state
    this.setState({ allowSet: !allowSet })
    // 目前只能在函数中修改sortable的disabled值，直接在标签上用disabled会无法进行切换
    this.sor.sortable.options.disabled = allowSet;
  }

  // 删除
  onDelete = (e, index) => {
    const { list } = this.state;
    list.splice(index, 1);
    this.setState({ list })
  }

  // 弹窗点击右侧标题列
  changeData = () => {

  }

  // 新增备注
  addNote = () => {

  }

  render(){
    const { list, widthList, measures, addVisibilit, type, setTitle, titleBackground, allowSet, drillVisibilit } = this.state;
    const { getFieldDecorator } = this.props.form;
    // 声明变量，在点击自定义模板按钮的时候会切换allowSet的值，根据值不同来让部分功能显示隐藏
    let isTitle = false, display, display_;
    if(allowSet){
      display_ = 'none';
      display = 'block';
    }else{
      display_ = 'block';
      display = 'none';
    } 
    return (
      <PageHeaderLayout>
        <Spin spinning={false}>
          <Card style={{height: '100%'}}>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Button type='primary' style={{marginRight: 15, display}} onClick={this.add}>添加</Button>
              <Button type='primary' style={{marginRight: 15, display}} onClick={this.saveList}>保存</Button>
              <Button type='primary' onClick={this.userSet}>{allowSet ? '应用自定义模板' : '自定义当前模板'}</Button>
            </div>
            <div style={{height: '100%'}}>
              <div>
                <h1 style={{margin: 0, paddingLeft: 14}}>预警</h1>
                <ReactSortable ref={e => this.sor = e} list={list} setList={newState => this.setState({ list: newState })} animation={1000} style={sort}>
                  {list.map((item, index) =>{
                    // 判定当前的元素是否是标题元素，是的话增加标题的元素样式
                    if(item.name.split('+')[0] === 'title') isTitle = true;
                    else isTitle = false;
                    return (
                      <div key={item.id} style={{ ...box, width: item.width, height: item.height, fontSize: isTitle ? '20px' : 'inherit' }}>
                        <div style={{...edit, display}}>
                          <a onClick={() => this.edit(item.name)} style={{marginRight: 15}}>编辑</a>
                          <Popconfirm 
                            title={"请确定是否要删除？"} 
                            onConfirm={(e)=>this.onDelete(e, index)}
                            okText="确定" 
                            cancelText="取消"
                          >
                            <a herf='#' style={{color: 'red'}}>删除</a>
                          </Popconfirm>
                        </div>
                        <div style={{...edit, display: display_}}>
                          <a onClick={() => this.drill(item.name)}>下钻</a>
                        </div>
                        <div className='sortable' id={item.name} ref={e => this[item.name] = e} 
                          style={isTitle ? {...picture, ...title_style, background: item.background} : {...picture}}>
                          {item.text ? item.text : null}
                        </div>
                      </div>
                    )
                  } )}
                </ReactSortable>
              </div>
              <div style={{width: '100%', height: 20, margin: '10px 0', background: 'rgb(243,243,243)', borderRadius: '10px'}}></div>
              <div>
                <h1 style={{margin: 0, paddingLeft: 14}}>关注</h1>
                <ReactSortable ref={e => this.sor = e} list={list} setList={newState => this.setState({ list: newState })} animation={1000} style={sort}>
                  {list.map((item, index) =>{
                    // 判定当前的元素是否是标题元素，是的话增加标题的元素样式
                    if(item.name.split('+')[0] === 'title') isTitle = true;
                    else isTitle = false;
                    return (
                      <div key={item.id} style={{ ...box, width: item.width, height: item.height, fontSize: isTitle ? '20px' : 'inherit' }}>
                        <div style={{...edit, display}}>
                          <a onClick={() => this.edit(item.name)} style={{marginRight: 15}}>编辑</a>
                          <Popconfirm 
                            title={"请确定是否要删除？"} 
                            onConfirm={(e)=>this.onDelete(e, index)}
                            okText="确定" 
                            cancelText="取消"
                          >
                            <a herf='#' style={{color: 'red'}}>删除</a>
                          </Popconfirm>
                        </div>
                        <div style={{...edit, display: display_}}>
                          <a onClick={() => this.drill(item.name)}>下钻</a>
                        </div>
                        <div className='sortable' id={item.name} ref={e => this[item.name] = e} 
                          style={isTitle ? {...picture, ...title_style, background: item.background} : {...picture}}>
                          {item.text ? item.text : null}
                        </div>
                      </div>
                    )
                  } )}
                </ReactSortable>
              </div>
            </div>
            
            <Modal
              visible={addVisibilit}
              onOk={e => this.onOkModel(e)}
              onCancel={e => { this.setState({ addVisibilit: false }) }}
              title='设置元素'
            >
              <FormItem label='选择模块'>
                { getFieldDecorator('chooseMode', { 
                  initialValue: '',
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{width: 100}} onSelect={ e => this.setWidth(e) }>
                    { widthList.map((item) => {
                      return (
                        <Option key={item.size}>{item.size}</Option>
                      )
                    }) }
                  </Select>
                ) }
              </FormItem>
              <FormItem label='设置元素的大小'>
                { getFieldDecorator('setWidth', { 
                  initialValue: '',
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{width: 100}} onSelect={ e => this.setWidth(e) }>
                    { widthList.map((item) => {
                      return (
                        <Option key={item.size}>{item.size}</Option>
                      )
                    }) }
                  </Select>
                ) }
              </FormItem>
              <FormItem label='设置展示的类型'>
                { getFieldDecorator('setType', { 
                  initialValue: '',
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select onChange={e => this.changeType(e)} style={{width: 100}}>
                    { type.map((item) => {
                      return (
                        <Option value={item.code} key={item.name}>{item.name}</Option>
                      )
                    }) }
                  </Select>
                ) }
              </FormItem>
              { setTitle ? 
              <div>
                <FormItem label='设置标题的名称'>
                  { getFieldDecorator('setTitleName', { 
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Input style={{width: 150}}/>
                  ) }
                </FormItem>
                <FormItem label='设置标题的背景色'>
                  { getFieldDecorator('setTitleBackground', { 
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{width: 100}}>
                      { titleBackground.map((item) => {
                        return (
                          <Option value={item.code} key={item.name}>{item.name}</Option>
                        )
                      }) }
                    </Select>
                  ) }
                </FormItem>
              </div> : 
              <div>
                <FormItem label='选择指标'>
                  { getFieldDecorator('measures', { 
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{width: 100}}>
                      { measures.map((item) => {
                        return (
                          <Option value={item} key={item}>{item}</Option>
                        )
                      }) }
                    </Select>
                  ) }
                </FormItem>
                <FormItem label='输入数据路径'>
                  { getFieldDecorator('url', { 
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Input style={{ width: 150 }} />
                  ) }
                </FormItem>
              </div> }
            </Modal>

            <Modal
              visible={drillVisibilit}
              footer={null}
              width='80%'
              style={openModal}
              onCancel={e => { this.setState({ drillVisibilit: false }) }}
              title='下钻'
            >
              <div style={{display: 'flex'}}>
                <div style={{width: '60%', position: 'relative'}}>
                  <p>2020年1月1日至今，各业务结构的保费收入分布情况</p>
                  <div ref={e => this.dirllChart = e} style={{width: '100%'}}></div>
                </div>
                <div style={{flex: 1}}>
                  <List
                    itemLayout="horizontal"
                    dataSource={data}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                          title={<a onClick={this.changeData} href="https://ant.design">{item.title}</a>}
                          // description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                        />
                      </List.Item>
                    )}
                  />
                </div>
              </div>
              <div>
                <List
                  header={<h2>近期备注</h2>}
                  // footer={<div>Footer</div>}
                  bordered
                  dataSource={data1}
                  renderItem={item => (
                    <List.Item>{item}</List.Item>
                  )}
                />
                <div style={{display: 'flex', marginTop: 20}}>
                  { getFieldDecorator('textarea', {
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <TextArea />
                  ) }
                  <Button onClick={this.addNote} type='primary' style={{marginLeft: 20}}>新增备注</Button>
                </div>
              </div>
            </Modal>
          </Card>
        </Spin>
  {/* <iframe src='https://max.datahunter.cn/#/dashboard-preview/5e6202d2a70062088fada64d'></iframe> */}
      </PageHeaderLayout>
    )
  }
}