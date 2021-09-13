import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, DatePicker, Select } from 'snk-web';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
export default class SelectTime extends PureComponent {
  constructor(props) {
    super(props);
    this.props.root.state = {};
  }

  renderForm() {
    const { form: { getFieldDecorator }, searchData } = this.props;
    return (
      <div>
        <FormItem style={{
          display: this.props.root.state.customTimeType === '0-含起止时间' || this.props.root.state.customTimeType === '1-含开始时间'
            ? '' : 'none',
        }}
        >
          <span>
            <span style={{
              color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', marginRight: 4,
            }}
            >*
            </span>
            <span style={{ margin: '0 8px 0 2px' }}>条件1统计时间:</span>
          </span>
          {getFieldDecorator('filterOneLeftTime', {
            initialValue: searchData !== undefined && searchData.timeFrameOne !== undefined && searchData.timeFrameOne.leftValue !== '' ? moment(searchData.timeFrameOne.leftValue, 'YYYY-MM-DD') : '',
            rules: [{ required: this.props.root.state.customTimeType === '0-含起止时间', message: '必选' }],
          })(
            <DatePicker placeholder="起始时间" />
            )}
          <span style={{ margin: '0 4px', display: this.props.root.state.customTimeType === '1-含开始时间' ? 'none' : '' }}>~</span>
          {getFieldDecorator('filterOneRightTime', {
            initialValue: searchData !== undefined && searchData.timeFrameOne !== undefined && searchData.timeFrameOne.rightValue !== '' ? moment(searchData.timeFrameOne.rightValue, 'YYYY-MM-DD') : '',
            rules: [{ required: this.props.root.state.customTimeType === '0-含起止时间', message: '必选' }],
          })(
            <DatePicker placeholder="终止时间" style={{ display: this.props.root.state.customTimeType === '1-含开始时间' ? 'none' : '' }} />
            )}
        </FormItem>
        <FormItem style={{
          marginLeft: 57,
          display: this.props.root.state.customTimeType === '0-含起止时间' || this.props.root.state.customTimeType === '1-含开始时间'
            ? '' : 'none',
        }}
        >
          <span>
            <span style={{
              color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', marginRight: 4,
            }}
            >*
            </span>
            <span style={{ margin: '0 8px 0 2px' }}>条件2统计时间:</span>
          </span>
          {getFieldDecorator('filterTwoLeftTime', {
            initialValue: searchData.timeFrameTwo !== undefined && searchData.timeFrameTwo !== undefined && searchData.timeFrameTwo.leftValue !== '' ? moment(searchData.timeFrameTwo.leftValue, 'YYYY-MM-DD') : '',
            rules: [{ required: this.props.root.state.customTimeType === '0-含起止时间', message: '必选' }],
          })(
            <DatePicker placeholder="起始时间" />
            )}
          <span style={{ margin: '0 4px', display: this.props.root.state.customTimeType === '1-含开始时间' ? 'none' : '' }}>~</span>
          {getFieldDecorator('filterTwoRightTime', {
            initialValue: searchData.timeFrameTwo !== undefined && searchData.timeFrameTwo !== undefined && searchData.timeFrameTwo.rightValue !== '' ? moment(searchData.timeFrameTwo.rightValue, 'YYYY-MM-DD') : '',
            rules: [{ required: this.props.root.state.customTimeType === '0-含起止时间', message: '必选' }],
          })(
            <DatePicker placeholder="终止时间" style={{ display: this.props.root.state.customTimeType === '1-含开始时间' ? 'none' : '' }} />
            )}
        </FormItem>
        <FormItem label="最近统计时间" style={{ display: this.props.root.state.customTimeType === '2-统计最近时间' ? '' : 'none' }}>
          {getFieldDecorator('recentTime', {
            initialValue: searchData.recentTime !== undefined && searchData.recentTime.name !== '' ? `${searchData.recentTime.value}-${searchData.recentTime.name}` : '',
            rules: [{ required: this.props.root.state.customTimeType === '2-统计最近时间', message: '必选' }],
          })(
            <Select style={{ width: 200 }}>
              <Option value="0-最近一天" >最近一天</Option>
              <Option value="1-最近一周" >最近一周</Option>
              <Option value="2-最近一个月" >最近一个月</Option>
              <Option value="1-最近一个季度" >最近一个季度</Option>
              <Option value="2-最近半年" >最近半年</Option>
              <Option value="1-最近一年" >最近一年</Option>
              <Option value="2-最近两年" >最近两年</Option>
            </Select>
            )}
        </FormItem>
      </div>
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
