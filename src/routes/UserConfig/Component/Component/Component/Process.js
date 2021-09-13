import React, { Component } from 'react'
import { connect } from 'dva';
import { Card, Form, Spin, Tabs, Collapse, Select, Input, Radio, InputNumber, Button, message, Modal, TreeSelect, Checkbox } from 'snk-web';
import { type } from 'jquery';


const Option = Select.Option;
const FormItem = Form.Item;
const { TreeNode } = TreeSelect;

const measureStyle = {
  border: 'solid 1px #000',
  width: 100,
  height: 30,
  position: 'relative',
  borderRadius: 10,
  textAlign: 'center',
  lineHeight: '28px',
  cursor: 'pointer',
  marginRight: 30
}

const { Search } = Input;
@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class Process extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showBox: false,
      val: { value: undefined },
      setMeasure: false,    // 指标弹窗是否显示
      measureData: [{ val: { value: '请选择' } }],      // 指标数据信息
      index: 0,             // 当前配置指标的下标
      add_disabled: false,  // 增加按钮是否禁用
      count: [
        { name: '加', code: 'add' },
        { name: '减', code: 'minus' },
        { name: '乘', code: 'ride' },
        { name: '除', code: 'divide' },
      ],                    // 计算公式
    };
  }

  componentDidMount() {
    const { getThemeSelectData, measureObj } = this.props.analysis;
    if (Object.keys(measureObj).length === 0) {
      const measureObj = {};
      for (let i of getThemeSelectData) {
        const appId = i.ATId.split('_')[0];
        const themeId = i.ATId.split('_')[1];
        this.props.dispatch({
          type: 'analysis/getUserMeasures',
          payload: {
            appId,
            themeId
          }
        }).then(() => {
          measureObj[i.ATId] = this.props.analysis.getUserMeasuresData;
        })
      }
      // 在获取第一次之后就保存在redux中
      this.props.dispatch({
        type: 'analysis/setAllMeasure',
        payload: {
          measureObj
        }
      })
    }
    // 每次进来重新设置state和fieldValue
    const { processNow, processObj } = this.props;
    if (processObj[processNow].state) this.setState({ ...processObj[processNow].state })
    if (processObj[processNow].field) this.props.form.setFieldsValue({ ...processObj[processNow].field })
  }

  onChange = (value, b, c) => {
    if (value === undefined) this.setState({ val: { value: undefined } });
    else {
      const code = c.triggerNode.props.eventKey;
      this.setState({ val: { value, code } });
    }
  };

  // 点击请选择
  getMeasure = (index) => {
    const { measureData } = this.state;
    let val = { value: undefined };
    // 如果当前点击的是配置了指标的，就显示，否则就给初始值
    const value = measureData[index].val.value;
    if (value && value !== '请选择') val = measureData[index].val;
    this.setState({ setMeasure: true, index, val })
  }

  // 完成配置
  handleOk = () => {
    const { val, measureData, index } = this.state;
    const { processNow } = this.props;
    const values = this.props.form.getFieldsValue();
    console.log(values);

    if (!val.value && !values[processNow + 'constant' + index]) {
      message.warn('请选择指标或常数！');
      return;
    } else if (val.value && values[processNow + 'constant' + index]) {
      message.warn('指标和常数不能同时存在，请修改！');
      return;
    }
    // 如果用户选择的是常数，则把常数替换value
    let constants = 0;
    for (let i in values) {
      if (i.indexOf(processNow + 'constant' && values[i]) >= 0) constants++;
    }
    if (constants > 1) {
      message.warn('只能设置一个常数，请选择指标！');
      return;
    }
    measureData[index] = {
      val,
      tenDay: values[processNow + 'tenDay' + index],
      constant: values[processNow + 'constant' + index]
    }
    console.log(measureData);


    this.setState({ measureData, setMeasure: false })
  }

  // 删除
  delete = () => {
    const { measureData, index } = this.state;
    measureData.splice(index, 1);
    // 如果删到了最后一个元素，数组清空后再给一个初始值
    if (measureData.length === 0) measureData.push({ val: { value: '请选择' } });
    if (measureData.length < 10) this.setState({ add_disabled: false })
    this.setState({ measureData, setMeasure: false })
  }

  // 添加
  addMeasure = () => {
    const { measureData } = this.state;
    let disabled = false;
    measureData.push({ val: { value: '请选择' } });
    // 如果总数超过2个，就不允许再增加
    if (measureData.length >= 2) disabled = true;
    this.setState({ measureData, add_disabled: disabled })
  }

  // 关闭弹窗
  close = () => {
    this.props.form.resetFields();
    this.setState({ setMeasure: false })
  }

  render() {
    const { processObj, processNow } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { getThemeSelectData, getUserMeasuresData, measureObj } = this.props.analysis;
    const { setMeasure, val, measureData, add_disabled, count, index } = this.state;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {measureData.map((item, index) => {
          let value;
          if (item.constant) value = item.constant;
          else value = item.val.value
          return (
            <div key={value + index}
              style={{ display: 'flex', marginRight: index === measureData.length - 1 ? 0 : 30, marginBottom: 15 }}>
              <span style={measureStyle}
                onClick={() => this.getMeasure(index)} title={value}>
                {value.length > 6 ? value.slice(0, 6) + '...' : value}
              </span>
              {measureData.length > 1 ? (index !== measureData.length - 1 ?
                <FormItem>
                  {getFieldDecorator('count' + index, {
                    rules: [{ required: false, message: '必选' }]
                  })(
                    <Select style={{ width: 60, bottom: 4 }}>
                      {count.map(item => {
                        return (
                          <Option key={item.code} value={item.code}>{item.name}</Option>
                        )
                      })}
                    </Select>
                  )}
                </FormItem>
                : null) : null}
            </div>
          )
        })}
        <Button disabled={add_disabled} onClick={this.addMeasure} type='primary'>添加指标</Button>

        <Modal
          visible={setMeasure}
          onCancel={this.close}
          footer={[
            <Button key="delete" type='danger' onClick={this.delete}>删除</Button>,
            <Button key="submit" type="primary" onClick={this.handleOk}>确定</Button>]}
          title='配置指标'>
          <TreeSelect
            showSearch
            style={{ width: '100%' }}
            value={val.value}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="请选择指标"
            allowClear
            treeDefaultExpandAll
            onChange={(a, b, c) => this.onChange(a, b, c)}
          >
            {getThemeSelectData.map(i => {
              return (
                <TreeNode title={i.ATName} key={i.ATId} value={i.ATId} disabled>
                  {measureObj[i.ATId] ? measureObj[i.ATId].map(measure => {
                    return (
                      <TreeNode title={measure.attrName} key={measure.attrCode} value={measure.attrName}></TreeNode>
                    )
                  }) : null}
                </TreeNode>
              )
            })}
          </TreeSelect>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
            <FormItem>
              {getFieldDecorator(processNow + 'tenDay' + index, {
                initialValue: measureData[index].tenDay ? measureData[index].tenDay : '01'
              })(
                <Radio.Group>
                  <Radio value='01'>使用10天前数据</Radio>
                  <Radio value='02'>不使用10天前数据</Radio>
                </Radio.Group>
              )}
            </FormItem>
            <FormItem label='常数' style={{ display: 'flex', marginLeft: 15 }}>
              {getFieldDecorator(processNow + 'constant' + index, {
                initialValue: measureData[index].constant
              })(
                <InputNumber style={{ width: 150 }}></InputNumber>
              )}
            </FormItem>
          </div>
        </Modal>
      </div>
    )
  }
}
