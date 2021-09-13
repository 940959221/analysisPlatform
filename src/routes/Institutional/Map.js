import React, { Component } from 'react';
import { connect } from 'dva';
import { ReactSortable } from "react-sortablejs";
import { Form, Card, Spin, Button, message, Modal, Input, Collapse, Select, Row, Col, Popconfirm } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/component/title';
import 'echarts/lib/component/graphic';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';

const { Panel } = Collapse;
const FormItem = Form.Item;
const Option = Select.Option;

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

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class Map extends Component{
  constructor(props){
    super(props);
    this.state = {
      list: [{ id: "1", name: "line", width: '100%', height: '400px' },{ id: "2", name: "pie", width: '25%', height: '300px' },{ id: "3", name: "bar", width: '70%', height: '200px' }],
      addVisibilit: false,      // 点击添加时的弹窗
      aitdVisibilit: false,     // 点击编辑时的弹窗
      add: false,               // 是否点击添加按钮
      widthList: [{size: '1X1', width: '33.3%'}, {size: '2X1', width: '66.6%'}, {size: '1X2', width: '33.3%'}, {size: '3X1', width: '100%'}, {size: '2X2', width: '66.6%'}],
      measures: [1,2,3,4,5],
      type: [{name: '柱状图', code: 'bar'}, {name: '饼状图', code: 'pie'}, {name: '折线图', code: 'line'}, {name: '地图', code: 'map'}],
      id: null,                 // 当前操作的元素id
      setTitle: false,          // 是否设置标题
      titleBackground: [{name: '红色', code: '#e1251b'}, {name: '绿色', code: '#C7E2D7'}, {name: '蓝色', code: '#23a2d9'}],
      allowSet: false,          // 是否允许自定义
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
    let mychart = echarts.init(i);
    let option = {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: 'line',
        areaStyle: {}
      }]
    };
    mychart.setOption(option);
    mychart.resize();           // 重置让echarts图表自适应高宽
  }

  setPie = (i) => {
    let mychart = echarts.init(i);
    console.log(1010110)
    let option = {
      tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
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
    mychart.setOption(option);
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
    mychart.setOption(option);
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
      if(err) return;
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

  render(){
    const { list, widthList, measures, addVisibilit, type, setTitle, titleBackground, allowSet } = this.state;
    const { getFieldDecorator } = this.props.form;
    // 声明变量，在点击自定义模板按钮的时候会切换allowSet的值，根据值不同来让部分功能显示隐藏
    let isTitle = false, display;
    if(allowSet) display = 'block';
    else display = 'none'
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
                  <div className='sortable' id={item.name} ref={e => this[item.name] = e} 
                    style={isTitle ? {...picture, ...title_style, background: item.background} : {...picture}}>
                    {item.text ? item.text : null}
                  </div>
                </div>
              )
              } )}
            </ReactSortable>
            </div>
            
            <Modal
              visible={addVisibilit}
              onOk={e => this.onOkModel(e)}
              onCancel={e => { this.setState({ addVisibilit: false }) }}
              title='设置元素'
            >
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
          </Card>
        </Spin>
  {/* <iframe src='https://max.datahunter.cn/#/dashboard-preview/5e6202d2a70062088fada64d'></iframe> */}
      </PageHeaderLayout>
    )
  }
}