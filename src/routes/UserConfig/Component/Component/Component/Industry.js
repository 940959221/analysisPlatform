import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, Tabs, Collapse, Select, Input, Radio, InputNumber, message, Button } from 'snk-web';
import { SketchPicker } from 'react-color'

const { TabPane } = Tabs;
const { Panel } = Collapse;
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class Industry extends Component {
  state = {
    chartType: [{ name: '常规图形', code: '1' }, { name: '地图', code: '2' }, { name: '饼图', code: '3' }],
    style: [{ name: '柱状图', code: '柱状图' }, { name: '折线图', code: '折线图' }, { name: '面积图', code: '面积图' }, { name: '堆积柱状图', code: '堆积柱状图' }],
    useMore: false,
    unit: [{ name: '件数', code: '件数' },
    { name: '百分比', code: '百分比' },
    { name: '万元', code: '万元' },
    { name: '元', code: '元' },
    { name: '原始值', code: '原始值' },
    { name: '排名', code: '排名' },
    { name: '日', code: '日' }],
    mapSpace: [{ name: '区间1' }],        // 地图区间
    mapDisabled: false,                   // 地图是否禁用添加
  };

  componentDidMount() {
    setTimeout(() => {
      const { queryUserData } = this.props.analysis;
      const { chartType } = this.state;

      if (queryUserData.companycode !== '01') chartType.splice(1, 1);
      this.setState({ chartType });

      // 处理后续测试提出的问题，针对现有组件回显后添加原始值和日
      const { unit } = this.state;
      let name1, name2, name3;
      for (let i of unit) {
        if (i.name === '原始值') name1 = true;
        if (i.name === '日') name2 = true;
        if (i.name === '元') name3 = true;
      }
      if (!name1) unit.push({ name: '原始值', code: '原始值' });
      if (!name2) unit.push({ name: '日', code: '日' });
      if (!name3) unit.push({ name: '元', code: '元' });
      const style = [{ name: '柱状图', code: '柱状图' }, { name: '折线图', code: '折线图' }, { name: '面积图', code: '面积图' }, { name: '堆积柱状图', code: '堆积柱状图' }]
      this.setState({ unit, style })
    }, 200);
  }

  change = e => {
    let useMore;
    if (e === '1') useMore = true;
    else useMore = false;
    this.setState({ useMore })
  }

  // 地图点击添加
  addSpace = () => {
    const { mapSpace } = this.state;
    mapSpace.push({ name: '区间' + (Number(mapSpace[mapSpace.length - 1].name.split('区间')[1]) + 1) });
    if (mapSpace.length >= 6) this.setState({ mapSpace, mapDisabled: true });
    else this.setState({ mapSpace, mapDisabled: false })
  }

  // 校验数字输入框的右边是否大于左边
  checkValue = (e, a, other) => {
    const otherVal = this.props.form.getFieldValue(other);
    if ((a || a === 0) && otherVal) {
      if (otherVal === '') return true;

      if (e.field.indexOf('Left') >= 0) {
        if (otherVal > a) return true;
        else return false;
      } else {
        if (otherVal < a) return true;
        else return false;
      }
    } else return true;
  }

  // 点击选择颜色
  changeColor = (index) => {
    const { mapSpace } = this.state;
    mapSpace[index].showColor = true;
    this.setState({ mapSpace });
  }

  // 点击完成按钮
  colorFinish = (index) => {
    const { hex } = this.color.state;
    const { mapSpace } = this.state;
    mapSpace[index].color = hex;
    mapSpace[index].showColor = false;
    this.setState({ mapSpace });
  }

  // 删除
  deleteColor = (index) => {
    const { mapSpace } = this.state;
    mapSpace.splice(index, 1);
    if (mapSpace.length < 6) this.setState({ mapDisabled: false })
    this.setState({ mapSpace })
  }

  render() {
    // const { id, type } = this.props.location;
    const { getFieldDecorator } = this.props.form;
    const { chartType, style, useMore, unit, mapDisabled, mapSpace } = this.state;
    const { pane } = this.props;

    return (
      <div>
        <FormItem label={`输入${pane.title}的标题`} style={{ display: 'flex' }}>
          {getFieldDecorator(pane.key + 'title', {
            rules: [{ required: true, message: '必填' }]
          })(
            <Input style={{ width: 400 }}></Input>
          )}
        </FormItem>
        <FormItem label='输入SQL语句' style={{ display: 'flex' }}>
          {getFieldDecorator(pane.key + 'sql', {
            rules: [{ required: true, message: '必填' }]
          })(
            <TextArea rows={6} style={{ width: 600 }} />
          )}
        </FormItem>
        <div style={{ color: 'red' }}>
          <div>*1、可查询表 zbx_start_query、zbx_apply_query、zbx_car_query、zbx_cha_query、zbx_new_old_query</div><br />
          <div>*2、(1)公共可查询维度month,companycode,company ,risk,business<br />
            <span style={{ marginLeft: 28 }}>(2)表zbx_start_query、zbx_apply_query可查询维度：type,cen_company,xun</span><br />
            <span style={{ marginLeft: 28 }}>(3)表zbx_car_query、zbx_cha_query可查询维度：area</span><br />
            <span style={{ marginLeft: 28 }}>(4)表zbx_new_old_query可查询维度：type,area</span>
          </div><br />
          <div>*3、查询字段 date_type,period,index,value 必填</div><br />
          <div>*4、图表y轴最多只能显示2种单位，如果有第3种单位则默认按照y1轴单位显示</div>
        </div>
        <br /><hr />
        <div style={{ display: 'flex' }}>
          <FormItem label='图表图形' style={{ display: 'flex' }}>
            {getFieldDecorator(pane.key + 'chartType', {
              rules: [{ required: true, message: '必选' }]
            })(
              <Select style={{ width: 100 }} onChange={this.change}>
                {chartType.map(item => {
                  return (
                    <Option key={item.code} value={item.code}>{item.name}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          {useMore ?
            <div style={{ display: 'flex' }}>
              <FormItem label='选择样式' style={{ display: 'flex', marginLeft: 15 }}>
                {getFieldDecorator(pane.key + 'style', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 100 }}>
                    {style.map(item => {
                      return (
                        <Option key={item.code} value={item.code}>{item.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem label='选择y1轴的坐标单位' style={{ display: 'flex', marginLeft: 15 }}>
                {getFieldDecorator(pane.key + 'y1', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 100 }}>
                    {unit.map(item => {
                      return (
                        <Option key={item.code} value={item.code}>{item.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem label='选择y2轴的坐标单位' style={{ display: 'flex', marginLeft: 15 }}>
                {getFieldDecorator(pane.key + 'y2', {})(
                  <Select style={{ width: 100 }} allowClear>
                    {unit.map(item => {
                      return (
                        <Option key={item.code} value={item.code}>{item.name}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
            </div>
            : null}
        </div>
        <FormItem label='校验参数和x轴' style={{ display: 'flex' }}>
          {getFieldDecorator(pane.key + 'required', {
            rules: [{ required: true, message: '必选' }]
          })(
            <Input style={{ width: 300 }}></Input>
          )}
        </FormItem>
        <div style={{ color: 'red' }}>*校验参数、x轴维度字段是否正, x轴维度字段只能有1个，地图x轴字段只能是机构</div>
        <div style={{ color: 'red' }}>*格式：companycode,risk,date_type,period,index,business,type,month(校验参数)#companycode(校验x轴)</div>
        <br /><hr />
        <div>
          <span>设置地图颜色区间</span>
          <Button onClick={this.addSpace} disabled={mapDisabled} style={{ margin: '0 10px' }} type='primary'>添加</Button>
          <span>，未输入即是无穷大或无穷小</span>
          {mapSpace.map((item, index) => {
            return (
              <div key={item.name} style={{ display: 'flex' }}>
                <FormItem label={item.name} style={{ display: 'flex' }}>
                  {getFieldDecorator('mapLeft' + index, {
                    rules: [{ required: false, message: '必填' },
                    { validator: (e, v) => this.checkValue(e, v, 'mapRight' + index), message: '右边必须大于左边' }],
                  })(
                    <InputNumber style={{ width: 100 }} />
                  )}
                </FormItem>
                <span style={{ lineHeight: '36px', margin: '0 10px' }}>至</span>
                <FormItem style={{ display: 'flex', marginBottom: 15 }}>
                  {getFieldDecorator('mapRight' + index, {
                    rules: [{ required: false, message: '必填' },
                    { validator: (e, v) => this.checkValue(e, v, 'mapLeft' + index), message: '右边必须大于左边' }]
                  })(
                    <InputNumber style={{ width: 100 }} />
                  )}
                </FormItem>
                <p style={{ cursor: 'pointer', margin: '6px 0 0 10px' }} onClick={() => this.changeColor(index)}>
                  {item.color ? item.color : '选择颜色'}
                </p>
                {item.showColor ?
                  <div style={{ display: 'flex' }}>
                    <SketchPicker ref={e => this.color = e} />
                    <Button type='primary' onClick={() => this.colorFinish(index)}>完成</Button>
                  </div>
                  : null}
                {index !== 0 ? <Button type='primary' size='small'
                  onClick={() => this.deleteColor(index)} style={{ marginLeft: 15 }}>删除</Button> : null}
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}
