import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Select, Input, message } from 'snk-web';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
export default class AppAndTheme extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderForm() {
    const { form: { getFieldDecorator }, getApplicationData, getThemeData, searchData } = this.props;
    const getApplicationArr = [];
    const getThemeArr = [];
    for (const i in getApplicationData) {
      if (getApplicationData[i]) {
        const getApplicationItem = (
          <Option
            value={`${getApplicationData[i].appId}-${getApplicationData[i].appName}`}
            key={getApplicationData[i].appId}
          >
            {getApplicationData[i].appName}
          </Option>
        );
        getApplicationArr.push(getApplicationItem);
      }
    }

    for (const i in getThemeData) {
      if (getThemeData[i]) {
        const getThemeDataItem = (
          <Option
            value={`${getThemeData[i].themeId}-${getThemeData[i].themeName}`}
            key={getThemeData[i].themeId}
          >
            {getThemeData[i].themeName}
          </Option>
        );
        getThemeArr.push(getThemeDataItem);
      }
    }

    return (
      <div>
        <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
          <Col>
            <FormItem label="告警名称">
              {getFieldDecorator('alarmName', {
                    initialValue: searchData ? searchData.alarmName : '',
                    rules: [{
                    required: true, message: '必填', pattern: /^[\u4E00-\u9FA5A-Za-z0-9_]{1,50}$/, message: '长度为1-50个字符，且只允许有中文、字母、数字和下划线',
                    }],
                  })(
                    <Input placeholder="" style={{ width: 200 }} disabled={!!(this.props.root.state.flag !== undefined && this.props.root.state.flag === 1)} />
                    )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
          <Col md={12} sm={24}>
            <FormItem label="选择应用">
              {getFieldDecorator('appId', {
                    initialValue: searchData ? (searchData.appId ? searchData.appId.name : '') : '',
                     rules: [{ required: true, message: '必选' }],
                  })(
                    <Select style={{ width: 200 }} onSelect={this.props.root.selApplicationItem} allowClear disabled={!!(this.props.root.state.operaType !== undefined && this.props.root.state.operaType === 'r')}>
                      {getApplicationArr.map((item) => { return item; })}
                    </Select>
                    )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="选择主题">
              {getFieldDecorator('themeId', {
                    initialValue: searchData ? (searchData.themeId ? searchData.themeId.name : '') : '',
                     rules: [{ required: true, message: '必选' }],
                  })(
                    <Select style={{ width: 200 }} onSelect={this.props.root.selThemeItem} allowClear disabled={!!(this.props.root.state.operaType !== undefined && this.props.root.state.operaType === 'r')}>
                      {getThemeArr.map((item) => { return item; })}
                    </Select>
                    )}
            </FormItem>
          </Col>
        </Row>
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
