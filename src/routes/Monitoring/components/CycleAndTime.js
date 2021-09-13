import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Select, DatePicker } from 'snk-web';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
export default class CycleAndTime extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderForm() {
    const { form: { getFieldDecorator }, searchData, getTimePeriodData } = this.props;
    const getTimePeriodArr = [];
    // 获取统计时间周期
    for (const i in getTimePeriodData) {
      if (getTimePeriodData[i]) {
        const getTimePeriodItem = (
          <Select.Option value={`${getTimePeriodData[i].periodId}`}>
            {getTimePeriodData[i].periodName}
          </Select.Option>
        );
        getTimePeriodArr.push(getTimePeriodItem);
      }
    }
    return (
      <div>
        <Row>
          <Col>
            <FormItem label="统计周期" style={{marginLeft: 10}}>
              {getFieldDecorator('cycle')(
                <Select style={{ width: 80, marginRight: 8 }} allowClear>
                  {getTimePeriodArr.map((item) => { return item; })}
                </Select>
                )}
            </FormItem>
          </Col>
        </Row>
        <div style={{display: 'flex'}}>
          <FormItem label="统计时间" style={{margin: 0}}>
            {getFieldDecorator('leftTime', {
              initialValue: searchData.timeFrame !== undefined ? moment(searchData.timeFrame.leftValue, 'YYYY-MM-DD') : '',
              rules: [{ required: true, message: '必选' }]
            })(<DatePicker placeholder="[起始时间]必选"/>)}
          </FormItem>
          <div style={{ margin: '0 4px', lineHeight: 3 }}>~</div>
          <FormItem>
            {getFieldDecorator('rightTime', {
              initialValue: searchData.timeFrame !== undefined ? moment(searchData.timeFrame.rightValue, 'YYYY-MM-DD') : '',
              rules: [{ required: true, message: '必选' }]
            })(<DatePicker placeholder="[终止时间]必选" />)}
          </FormItem>
        </div>
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
