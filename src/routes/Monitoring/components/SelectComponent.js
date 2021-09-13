import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Col, Row, Select } from 'snk-web';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
export default class SelectComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.props.root.state = {};
  }

  renderForm() {
    const { form: { getFieldDecorator }, searchData } = this.props;

    return (
      <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
        <Col md={6} sm={24}>
          <FormItem label="对比类型" style={{ marginLeft: 10 }}>
            {getFieldDecorator('compareType', {
              initialValue: searchData.compareType !== undefined ? (`${searchData.compareType.value}-${searchData.compareType.name}`) : '',
              rules: [{ required: true, message: '必选' }],
            })(
              <Select
                style={{ width: 110 }}
                onSelect={this.props.root.selectCompareType}
              >
                <Option value="0-同比" >同比</Option>
                <Option value="1-环比" >环比</Option>
                <Option value="2-自定义" >自定义</Option>
              </Select>
              )}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
          <FormItem label="计算类型">
            {getFieldDecorator('customCalType', {
              initialValue: searchData.customCalType !== undefined && searchData.customCalType.name !== '' ? (`${searchData.customCalType.value}-${searchData.customCalType.name}`) : '',
              rules: [{ required: this.props.root.state.compareType === '2-自定义', message: '必选' }],
            })(
              <Select style={{ width: 110 }} disabled={this.props.root.state.compareType !== '2-自定义'}>
                <Option value="0-加" >加</Option>
                <Option value="1-减" >减</Option>
                <Option value="2-除" >除</Option>
              </Select>
              )}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
          <FormItem label="累计时间类型">
            {getFieldDecorator('cumntimeType', {
              initialValue: searchData.customCalType !== undefined && searchData.cumntimeType.name !== '' ? (`${searchData.cumntimeType.value}-${searchData.cumntimeType.name}`) : '',
              rules: [{ required: this.props.root.state.compareType !== '2-自定义', message: '必选' }],
            })(
              <Select
                style={{ width: 110 }}
                disabled={this.props.root.state.compareType === '2-自定义'}
                onSelect={this.props.root.selectCumnTimeType}
              >
                <Option value="0-当月累计" >当月累计</Option>
                <Option value="1-当年累计" >当年累计</Option>
              </Select>
              )}
          </FormItem>
        </Col>
        <Col md={6} sm={24}>
          <FormItem label="统计时间类型">
            {getFieldDecorator('customTimeType', {
              initialValue: searchData.customCalType !== undefined && searchData.customTimeType.name !== '' ? (`${searchData.customTimeType.value}-${searchData.customTimeType.name}`) : '',
              rules: [{ required: this.props.root.state.compareType === '2-自定义', message: '必选' }],
            })(
              <Select
                style={{ width: 110 }}
                disabled={this.props.root.state.compareType !== '2-自定义'}
                onSelect={this.props.root.selectCustomTimeType}
              >
                <Option value="0-含起止时间" >含起止时间</Option>
                <Option value="1-含开始时间" >含开始时间</Option>
                <Option value="2-统计最近时间" >统计最近时间</Option>
              </Select>
              )}
          </FormItem>
        </Col>
      </Row>
    );
  }

  render() {
    return (
      <div>
        {this.renderForm()}
      </div>
    );
  }
}
