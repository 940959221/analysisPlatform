import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Button, DatePicker, Icon, Select } from 'snk-web';

const FormItem = Form.Item;

@Form.create()
export default class CycleAndTime extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 添加统计时间
  addTime = () => {
    const { form } = this.props;
    const timekeys = form.getFieldValue('timekeys');
    const nextKeys = timekeys.concat(this.props.root.state.timeUuid);
    this.props.root.state.timeUuid += 1;
    form.setFieldsValue({
      timekeys: nextKeys,
    });
  }

  // 删除统计时间
  removeTime = (k) => {
    const { form } = this.props;
    const timekeys = form.getFieldValue('timekeys');
    form.setFieldsValue({
      timekeys: timekeys.filter(timekeys => timekeys !== k),
    });
  }

  renderForm() {
    const { form: { getFieldDecorator, getFieldValue }, searchData, getTimePeriodData } = this.props;
    const getTimePeriodArr = [];
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };

    // 获取统计时间周期
    for (const i in getTimePeriodData) {
      if (getTimePeriodData[i]) {
        const getTimePeriodItem = (
          <Select.Option value={`${getTimePeriodData[i].periodId}-${getTimePeriodData[i].periodName}`}>
            {getTimePeriodData[i].periodName}
          </Select.Option>
        );
        getTimePeriodArr.push(getTimePeriodItem);
      }
    }

    const timekeysArr = [];
    if (searchData.statitime !== undefined) {
      if (searchData.statitime.timeSegment !== undefined && searchData.statitime.timeSegment.length > 0) {
        for (let i = 0; i < searchData.statitime.timeSegment.length; i += 1) {
          timekeysArr.push(i);
        }
      }
    }

    getFieldDecorator('timekeys', { initialValue: timekeysArr.length > 0 ? timekeysArr : [0] });
    const timekeys = getFieldValue('timekeys');
    const formItems = timekeys.map((k, index) => {
      const i = index + 1;
      return (
        <Col
          md={this.props.root.state.mustWriteFlag !== undefined ? (index % 2 === 0 ? 13 : 11) : 12}
          sm={24}
          style={{ marginLeft: this.props.root.state.mustWriteFlag !== undefined ? (i % 2 === 0 ? (i === 2 ? -118 : -100) : (i === 1 ? 0 : -18)) : (i % 2 === 0 ? -100 : 0) }}
        >
          <FormItem
            style={{ display: 'block' }}
            {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
            label={this.props.root.state.mustWriteFlag !== undefined ? '' : index === 0 ? '统计时间' : ''}
            required={false}
            key={k}
          >
            <span style={{ display: this.props.root.state.mustWriteFlag !== undefined ? (index === 0 ? '' : 'none') : 'none' }}>
              <span style={{
              color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', marginRight: 4,
              }}
              >*
              </span>
              统计时间
              <span style={{ margin: '0 8px 0 2px' }}>:</span>
            </span>
            {getFieldDecorator(`leftTime${k}`, { rules: [{ required: this.props.root.state.mustWriteFlag !== undefined ? (k === 0) : false, message: '必选' }] })(
              <DatePicker placeholder="起始时间" />
            )}
            <span style={{ margin: '0 4px' }}>~</span>
            {getFieldDecorator(`rightTime${k}`, { rules: [{ required: this.props.root.state.mustWriteFlag !== undefined ? (k === 0) : false, message: '必选' }] })(
              <DatePicker placeholder="终止时间" />
            )}
            {k !== 0 ? (
              <Icon
                style={{ marginLeft: 10 }}
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.removeTime(k)}
              />
            ) : null}
          </FormItem>
        </Col>
      );
    });

    return (
      <Form>
        <Row>
          <Col>
            <FormItem label="统计周期">
              {getFieldDecorator('cycleTime', { rules: [{ required: this.props.root.state.mustWriteFlag !== undefined, message: '必选' }] })(
                 <Select style={{ width: 80, marginRight: 8 }} onSelect={this.props.root.selectTime} allowClear onChange={e => this.props.root.changeCycle(e)}>
                   {getTimePeriodArr.map((item) => { return item; })}
                 </Select>
            )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ marginLeft: this.props.root.state.mustWriteFlag !== undefined ? 0 : -24 }}>
          <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
            {formItems}
          </Row>
          <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
            <Button
              type="dashed"
              onClick={this.addTime}
              style={{ width: '60%' }}
              disabled={
              !((this.props.form.getFieldValue(
                `rightTime${this.props.form.getFieldValue('timekeys')[this.props.form.getFieldValue('timekeys').length - 1]}`
              ) !== '') &&
                (this.props.form.getFieldValue(
                `rightTime${this.props.form.getFieldValue('timekeys')[this.props.form.getFieldValue('timekeys').length - 1]}`
              ) !== null))
              }
            >
              <Icon type="plus" /> 添加统计时间
            </Button>
          </FormItem>
        </div>
      </Form>
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
