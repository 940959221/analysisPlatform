import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, Tabs, Collapse, Select, Input, Radio, Button, message, InputNumber } from 'snk-web';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const Option = Select.Option;
const FormItem = Form.Item;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class Line extends Component {
  state = {
    measureList: [],      // 颜色
    zuo_biao: [],   // 坐标轴
    styles_: [],    // 样式
    close: false,
  };

  componentDidMount() {
    const zuo_biao = [
      { name: 'y1轴', code: '1' },
      { name: 'y2轴', code: '2' }
    ];
    const styles_ = [
      { name: '虚线', code: '虚线' },
      { name: '实线', code: '实线' },
      // { name: '点划线', code: 3 },
      // { name: '双点划线', code: 4 },
      // { name: '波浪线', code: 5 },
    ]
    this.setState({ zuo_biao, styles_ })
  }

  // 切换颜色类型
  getList = (key) => {
    const colorType = this.props.form.getFieldsValue()[key + 'colorType'];

    // 判定是选择颜色还是跟随指标颜色
    if (colorType === '01') {
      const arr = [
        { name: '灰色', code: '#808080' },
        { name: '红色', code: '#FF0000' },
        { name: '蓝色', code: '#0000FF' },
        { name: '黑色', code: '#000000' },
      ]
      this.setState({ measureList: arr })
    } else {
      this.props.root.props.root.getList(key)
    }
  }

  // 切换单选框
  changeColor = (field) => {
    this.props.form.setFieldsValue({ [field]: undefined })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { pane } = this.props;
    const { measureList, zuo_biao, styles_ } = this.state;

    const id = true
    // console.log(measureList);
    return (
      <div>
        <div style={{ display: 'flex' }}>
          <FormItem label={`（1）设置${pane.title}的坐标轴`} style={{ display: 'flex' }}>
            {getFieldDecorator(pane.key + 'coordinates', {
              rules: [{ required: false, message: '必填' }]
            })(
              <Select style={{ width: 100 }} allowClear>
                {zuo_biao.map(item => {
                  return (
                    <Option key={item.code} value={item.code}>{item.name}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label='选择展示的样式' style={{ display: 'flex', marginLeft: 15 }}>
            {getFieldDecorator(pane.key + 'style', {
              rules: [{ required: false, message: '必填' }]
            })(
              <Select style={{ width: 100 }} allowClear>
                {styles_.map(item => {
                  return (
                    <Option key={item.code} value={item.code}>{item.name}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label='' style={{ display: 'flex', marginLeft: 15 }}>
            {getFieldDecorator(pane.key + 'colorType', {
              rules: [{ required: false, message: '必填' }],
              initialValue: '01',
            })(
              <Radio.Group onChange={() => this.changeColor(pane.key + 'color')}>
                <Radio value='01'>选择颜色</Radio>
                <Radio value='02'>跟随指标颜色</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label='' style={{ display: 'flex', marginLeft: 15 }}>
            {getFieldDecorator(pane.key + 'color', {
              rules: [{ required: false, message: '必填' }]
            })(
              <Select style={{ width: 150 }} onFocus={() => this.getList(pane.key)} allowClear>
                {measureList.map((item, index) => {
                  return (
                    <Option title={item.name} key={item.code + '+' + index} value={item.code}>{item.name}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
        </div>

        <FormItem label='（2）设置该基准线的值' style={{ display: 'flex' }}>
          {getFieldDecorator(pane.key + 'value', {
            rules: [{ required: false, message: '必填' }]
          })(
            <InputNumber style={{ width: 150 }}></InputNumber>
          )}
        </FormItem>

        <div style={{ color: 'red', fontSize: 12 }}>PS：只有当基准线的值，坐落在所选坐标轴的范围内才会进行展示</div>
      </div>
    );
  }
}
