import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, Tabs, Collapse, Select, Input, Radio, InputNumber, message } from 'snk-web';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const Option = Select.Option;
const FormItem = Form.Item;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class List extends Component {
  state = {
    chartsPanes: [],        // 选择展示的指标维度
    name: '排名',           // 范围的名字     
    measureList: [],        // 现添加的相关指标域
  };

  componentDidMount() {
    const { name } = this.state;
    const value = this.props.form.getFieldsValue();
    if (name === '排名') {      // 如果是排名的话，避免之前配置过程中疏忽的问题，这里让所有的数据全部变成整数，针对于回显
      for (let i in value) {
        if ((i.indexOf('rank_left') >= 0 || i.indexOf('rank_left') >= 0) && value[i]) {
          this.props.form.setFieldsValue({ [i]: parseInt(value[i]) })
        }
      }
    }
  }

  // 校验数字输入框的右边是否大于左边
  checkValue = (e, a, other) => {
    const otherVal = this.props.form.getFieldValue(other);
    if (otherVal === '') return true;

    if (e.field.indexOf('left') >= 0) {
      if (otherVal > a) return true;
      else return false;
    } else {
      if (otherVal < a) return true;
      else return false;
    }
  }

  // 获取所有子图表
  getList = () => {
    const { chartsPanes } = this.props.root.state;
    this.setState({ chartsPanes })
  }

  // 修改取值范围
  changeType = (e, field1, field2) => {
    let name;
    if (e.target.value === '1') name = '排名';
    else name = '指标值';
    this.setState({ name });
    this.props.form.setFieldsValue({ [field1]: undefined, [field2]: undefined });
  }

  // 获取相关指标域
  getMeasure = (comp) => {
    const value = this.props.form.getFieldValue(comp + 'dimension');
    if (value) this.props.root.getList(comp, value);
  }

  // 修改选择展示的指标维度
  changeCharts = (e, field) => {
    if (e === undefined) this.setState({ measureList: [] })
    this.props.form.setFieldsValue({ [field]: undefined })
  }

  // 数字输入框校验
  limitNumber = value => {
    const { name } = this.state;
    if (name === '排名') {
      if (value < 0) return '';
      if (typeof value === 'string') {
        return !isNaN(Number(value)) ? value.replace(/^(0+)|[^\d]/g, '') : ''
      } else if (typeof value === 'number') {
        return !isNaN(value) ? String(value).replace(/^(0+)|[^\d]/g, '') : ''
      } else {
        return ''
      }
    } else {
      return value
    }
  }

  render() {
    // const { id, type } = this.props.location;
    const { getFieldDecorator } = this.props.form;
    const { pane } = this.props;
    const { chartsPanes, name, measureList } = this.state;

    const id = true
    return (
      <div>
        <div style={{ display: 'flex' }}>
          <FormItem label={`（1）输入${pane.title}的标题`} style={{ display: 'flex' }}>
            {getFieldDecorator(pane.key + 'title', {
              rules: [{ required: false, message: '必填' }]
            })(
              <Input style={{ width: 200 }}></Input>
            )}
          </FormItem>
          <FormItem label='选择展示的指标维度' style={{ display: 'flex', marginLeft: 15 }}>
            {getFieldDecorator(pane.key + 'dimension', {
              rules: [{ required: false, message: '必填' }]
            })(
              <Select style={{ width: 100 }} onFocus={this.getList} allowClear onChange={(e) => this.changeCharts(e, pane.key + 'space')}>
                {chartsPanes.map(item => {
                  return (
                    <Option key={item.key} value={item.key}>{item.title}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
        </div>

        <FormItem label='（2）现添加的相关指标域' style={{ display: 'flex' }}>
          {getFieldDecorator(pane.key + 'space', {
            rules: [{ required: false, message: '必填' }]
          })(
            <Select style={{ width: 400 }} onFocus={() => this.getMeasure(pane.key)} allowClear>
              {measureList.map((item, index) => {
                return (
                  <Option title={item.name} key={item.code + '+' + index} value={item.code}>{item.name}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>

        <div style={{ display: 'flex', marginBottom: 10 }}>
          <FormItem label='（3）选择取值范围' style={{ display: 'flex' }}>
            {getFieldDecorator(pane.key + 'range', {
              initialValue: '1',
              rules: [{ required: false, message: '必填' }]
            })(
              <Radio.Group onChange={e => this.changeType(e, pane.key + 'rank_left', pane.key + 'rank_right')}>
                <Radio value='1'>排名取值</Radio>
                <Radio value='2'>范围取值</Radio>
              </Radio.Group>
            )}
          </FormItem>
          <FormItem label='范围' style={{ display: 'flex', marginLeft: 15 }}>
            {getFieldDecorator(pane.key + 'rank_left', {
              initialValue: '',
              rules: [{ required: false, message: '必选', },
              { validator: (e, v) => this.checkValue(e, v, pane.key + 'rank_right'), message: '右边必须大于左边' }]
            })(
              <InputNumber parser={this.limitNumber} formatter={this.limitNumber} placeholder='请输入' style={{ width: 100 }} />
            )}
          </FormItem>
          <span style={{ lineHeight: '36px', color: '#000' }}>&lt; {name} &lt;</span>
          <FormItem>
            {getFieldDecorator(pane.key + 'rank_right', {
              initialValue: '',
              rules: [{ required: false, message: '必选', },
              { validator: (e, v) => this.checkValue(e, v, pane.key + 'rank_left'), message: '右边必须大于左边' }]
            })(
              <InputNumber parser={this.limitNumber} formatter={this.limitNumber} placeholder='请输入' style={{ width: 100 }} />
            )}
          </FormItem>
        </div>

        <div style={{ color: 'red', fontSize: 12 }}>*如果选择的指标域为占比指标域，将不展示列表</div>
      </div>
    );
  }
}
