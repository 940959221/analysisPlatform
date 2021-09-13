import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, Menu, Dropdown, Checkbox, Tabs, Modal, InputNumber, message } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './style.less';
import { Link } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;
const { TabPane } = Tabs;

const svg = <svg t="1589958490703" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1712" width="200" height="200"><path d="M512 729.86624c-13.70112 0-27.40224-5.23264-37.84704-15.6672l-328.69376-328.704c-20.91008-20.91008-20.91008-54.80448 0-75.70432 20.89984-20.89984 54.79424-20.89984 75.70432 0L512 600.63744l290.83648-290.83648c20.91008-20.89984 54.80448-20.89984 75.70432 0 20.91008 20.89984 20.91008 54.79424 0 75.70432l-328.69376 328.704C539.40224 724.64384 525.70112 729.86624 512 729.86624z" p-id="1713" fill="#0088CC"></path></svg>



@connect(({ mine, loading }) => ({
  mine,
  loading: loading
}))
@Form.create()
export default class ChartsHeader extends Component {
  state = {
    defaultArr: [],
    temporaryArr: [],
    visibilit: false,
    type: '',
    colours: [],              // 彩色数组
    solidColor: [],           // 单色数组
  };

  componentDidMount(){
    const colours = [], solidColor = [];
    let oldColor = [];        // 用于储存彩色的当前数组的色值
    let oldSolid;
    for(let i = 0; i < 4; i ++){
      const colorItem = [], solidItem = [];
      for(let j = 0; j < 6; j ++){
        let newColor = getColor();
        // 如果现在获取的颜色在当前数组中已存在，就重新获取获取
        while (oldColor.indexOf(newColor) > 0) newColor = getColor();
        // 此处的code是为了循环的key值，不能保证不重复，但尽可能不重复，下同
        colorItem.push({ rgb: newColor, code: `彩色+${Math.random()}+${newColor}` })      
        oldColor.push(newColor);
        // 给单色增加一个透明度的色值
        if(!oldSolid) oldSolid = getColor(true);
        let newSolid = getColor(null, 1 - j * 0.1, oldSolid);
        solidItem.push({ rgb: newSolid, code: `单色+${Math.random()}+${newSolid}` })
      }
      colours.push(colorItem);
      solidColor.push(solidItem);
      oldSolid = null;     // 重置单色
    }
    function getColor(num, a, color){
      let r,g,b, rgb;
      r = Math.floor(Math.random() * 255);
      g = Math.floor(Math.random() * 255);
      b = Math.floor(Math.random() * 255);
      if((r + g + b === 0) || (r + g + b === 765)) getColor();
      if(num) rgb = `${r}+${g}+${b}`
      else if(a && color) rgb = `rgba(${color.split('+')[0]}, ${color.split('+')[1]}, ${color.split('+')[2]}, ${a})`
      else rgb = `rgb(${r},${g},${b})`;
      return rgb;
    }
    this.setState({ colours, solidColor })
  }

  // 基准线选中
  changeItem = (val) => {
    const { chartName, root } = this.props;
    root.setState({ [chartName + 'Line']: val }, () => {
      root.reloadCharts(chartName)
    });
  }

  // 切换颜色
  changeColor = (e) => {
    const { chartName, root } = this.props;
    root.setState({ [chartName + 'Color']: e.item.props.children }, () => {
      root.reloadCharts(chartName)
    });
  }

  // 点击新增
  add = (name) => {
    const { defaultArr, temporaryArr } = this.state;
    let type;
    if((name === 'temporary' && temporaryArr.length >= 3) || (name === 'default' && defaultArr.length >= 3)){
      message.warn('当前列表超过或已存在3个，不允许新增');
      return;
    }
    if(name === 'temporary') type = '临时';
    else type = '默认'
    this.setState({ visibilit: true, type })
  }

  // 确定新增
  onOkModel = () => {
    this.props.form.validateFields((err, values) => {
      if(err) return;
      const { defaultArr, temporaryArr, type } = this.state;
      if(type === '默认'){
        const num = defaultArr.length + 1;
        defaultArr.push({
          num: `默认${num}`,
          y: values.y,
          value: `默认基准线${num} | 坐标轴：${values.y}轴-基准线值：${values.scope}`,
          scope: values.scope
        })
      }else{
        const num = temporaryArr.length + 1;
        temporaryArr.push({
          num: `临时${num}`,
          y: values.y,
          value: `临时基准线${num} | 坐标轴：${values.y}轴-基准线值：${values.scope}`,
          scope: values.scope
        })
      }
      this.setState({ defaultArr, temporaryArr, visibilit: false })
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { isDefault, y2, disabled } = this.props;
    const { temporaryArr, visibilit, defaultArr, colours, solidColor } = this.state;
    const menu = (
      <Menu onClick={this.changeColor}>
        <Menu.ItemGroup title="彩色">
          { colours.map((item, index) => {
            return (
              <Menu.Item key={'彩色' + index} title='彩色' style={{display: 'flex'}}>
                { item.map(i => {
                  return (
                    <div key={i.code} style={{width: 20, height: 20, background: i.rgb}}></div>
                  )
                }) }
              </Menu.Item>
            )
          }) }
        </Menu.ItemGroup>
        <Menu.Divider />
        <Menu.ItemGroup title="单色">
          { solidColor.map((item, index) => {
            return (
              <Menu.Item key={'单色' + index} title='单色' style={{display: 'flex'}}>
                { item.map(i => {
                  return (
                    <div key={i.code} style={index === 0 ? {marginTop: 20} : {}} style={{width: 20, height: 20, background: i.rgb}}></div>
                  )
                }) }
              </Menu.Item>
            )
          }) }
        </Menu.ItemGroup>
      </Menu>
    );
    return (
      <div className={styles.box} style={disabled ? {display: 'none'} : {display: 'block'}}>
        <div className={styles.lineBox}>
          <a style={{lineHeight: '32px'}} className="ant-dropdown-link">
            基准线 
          </a>
          <div className={styles.linData}>
            <Tabs defaultActiveKey="1" className={styles.tabs}>
              { isDefault ? 
              <TabPane tab="默认基准线" key="1" className={styles.tabPane}>
                { getFieldDecorator('default', {})(
                  <Checkbox.Group
                    onChange={this.changeItem}
                    styles={styles.checkbox}
                  >
                    { defaultArr.map(item => {
                      return (
                        <Checkbox 
                          style={{margin: '0 0 15px 0', display: 'flex'}} 
                          key={item.num} 
                          value={item.y + '-' + item.scope}>
                            <div>
                              <div>{item.value.split('-')[0]}</div>
                              <div>{item.value.split('-')[1]}</div>
                            </div>
                        </Checkbox>
                      )
                    }) }
                  </Checkbox.Group>
                ) }
                <Button type='primary' onClick={() => this.add('default')}>新增</Button>
              </TabPane> : null}
              <TabPane tab="临时基准线" key={isDefault ? '2' : '1'} className={styles.tabPane}>
                { getFieldDecorator('temporary', {})(
                  <Checkbox.Group
                    onChange={this.changeItem}
                    styles={styles.checkbox}
                  >
                    { temporaryArr.map(item => {
                      return (
                        <Checkbox 
                          style={{margin: '0 0 15px 0', display: 'flex'}} 
                          key={item.num} 
                          value={item.y + '-' + item.scope}>
                            <div>
                              <div>{item.value.split('-')[0]}</div>
                              <div>{item.value.split('-')[1]}</div>
                            </div>
                        </Checkbox>
                      )
                    }) }
                  </Checkbox.Group>
                ) }
                <Button type='primary' onClick={() => this.add('temporary')}>新增</Button>
              </TabPane>
            </Tabs>
          </div>
        </div>
        <Modal
          visible={visibilit}
          onOk={e => this.onOkModel(e)}
          onCancel={e => { this.setState({ visibilit: false }) }}
          title='新增基准线'
        >
          <div className={styles.modalBox}>
            <FormItem label='坐标轴' className={styles.formItem}>
              { getFieldDecorator('y', {
                initialValue: [], rules: [{ required: true, message: '必选' }]
              })(
                <Select className={styles.select}>
                  <Option value='y1'>y1轴</Option>
                  { y2 ? <Option value='y2'>y2轴</Option> : null }
                </Select>
              ) }
            </FormItem>
            <FormItem label='范围' className={styles.formItem}>
              { getFieldDecorator('scope', {
                initialValue: '', rules: [{ required: true, message: '必选' }]
              })(
                <InputNumber/>
              ) }
            </FormItem>
          </div>
        </Modal>
        <Dropdown overlay={menu} trigger={['hover']} className={styles.drop}>
          <a className={styles.color} className="ant-dropdown-link" onClick={e => e.preventDefault()}>
            选择色彩 
          </a>
        </Dropdown>
      </div>
    );
  }
}
