import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Cascader, Icon, Col, Row, Select, DatePicker } from 'snk-web';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
export default class Filter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 添加选择过滤器
  add = (e, flag) => {
    const { form } = this.props;
    if (flag === '1') {
      const keys = form.getFieldValue('keys');
      const nextKeys = keys.concat(this.props.root.state.uuid);
      this.props.root.state.uuid += 1;
      form.setFieldsValue({
        keys: nextKeys,
      });
    } else if (flag === '2') {
      const keys1 = form.getFieldValue('keys1');
      const customNextKeys = keys1.concat(this.props.root.state.customUuid);
      this.props.root.state.customUuid += 1;
      form.setFieldsValue({
        keys1: customNextKeys,
      });
    } else if (flag === '3') {
      const occupFilterOneKey = form.getFieldValue('occupFilterOneKey');
      const occupFilterOneNextKeys = occupFilterOneKey.concat(this.props.root.state.occupFilterOneId);
      this.props.root.state.occupFilterOneId += 1;
      form.setFieldsValue({
        occupFilterOneKey: occupFilterOneNextKeys,
      });
    } else {
      const occupFilterTwoKey = form.getFieldValue('occupFilterTwoKey');
      const occupFilterTwoNextKeys = occupFilterTwoKey.concat(this.props.root.state.occupFilterTwoId);
      this.props.root.state.occupFilterTwoId += 1;
      form.setFieldsValue({
        occupFilterTwoKey: occupFilterTwoNextKeys,
      });
    }
  }

  // 删除过滤器
  remove = (k, flag) => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const keys1 = form.getFieldValue('keys1');
    const occupFilterOneKey = form.getFieldValue('occupFilterOneKey');
    const occupFilterTwoKey = form.getFieldValue('occupFilterTwoKey');
    if (flag === '1') {
      if (keys.length === 1) {
        return;
      }
      form.setFieldsValue({
        keys: keys.filter(key => key !== k),
      });
    } else if (flag === '2') {
      if (keys1.length === 1) {
        return;
      }
      form.setFieldsValue({
        keys1: keys1.filter(key => key !== k),
      });
    } else if (flag === '3') {
      if (occupFilterOneKey.length === 1) {
        return;
      }
      form.setFieldsValue({
        occupFilterOneKey: occupFilterOneKey.filter(key => key !== k),
      });
    } else {
      if (occupFilterTwoKey.length === 1) {
        return;
      }
      form.setFieldsValue({
        occupFilterTwoKey: occupFilterTwoKey.filter(key => key !== k),
      });
    }
  }

  renderSelect = (label) => {
    if (label.length !== 0) {
      return label[0];
    }
  }

  renderForm() {
    const { form: { getFieldDecorator, getFieldValue }, searchData } = this.props;
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };

    const filterOneKeyArr = [];
    if (searchData.filterOne !== undefined) {
      for (let i = 0; i < searchData.filterOne.length; i += 1) {
        filterOneKeyArr.push(i);
      }
    }

    const filterTwoKeyArr = [];
    if (searchData.filterOne !== undefined) {
      for (let i = 0; i < searchData.filterTwo.length; i += 1) {
        filterTwoKeyArr.push(i);
      }
    }

    const occupFilterOneArr = [];
    if (searchData.occupFilterOne !== undefined) {
      for (let i = 0; i < searchData.occupFilterOne.length; i += 1) {
        occupFilterOneArr.push(i);
      }
    }

    const occupFilterTwoArr = [];
    if (searchData.occupFilterTwo !== undefined) {
      for (let i = 0; i < searchData.occupFilterTwo.length; i += 1) {
        occupFilterTwoArr.push(i);
      }
    }

    // 实际业务分子
    getFieldDecorator('keys', { initialValue: filterOneKeyArr.length > 0 ? filterOneKeyArr : [0] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      const i = index + 1;
      return (
        <Col
          md={this.props.root.state.mustWriteFlag !== undefined ? (index % 2 === 0 ? 13 : 11) : 12}
          sm={24}
          style={{
            marginLeft: this.props.root.state.themeName === '业务结构' ?
              i % 2 === 0 ? (i === 2 ? -81 : -184) : (i === 1 ? 0 : 104)
              : i % 2 === 0 ? (i === 2 ? -81 : -134) : (i === 1 ? 0 : 54),
          }}
        >
          <FormItem
            style={{ display: 'block' }}
            {...formItemLayoutWithOutLabel}
            label={index === 0 ? '' : ''}
            required={false}
            key={k}
          >
            <span style={{ marginRight: 4, display: index === 0 ? '' : 'none' }}>
              实际业务
              <span style={{ display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>（分子）</span>:
            </span>
            <span style={{
              color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', marginRight: 4,
            }}
            >*
            </span>
            {getFieldDecorator(`filterOne${k}`, { rules: [{ required: true, message: '必选' }] })(
              <Cascader
                style={{ width: 110 }}
                displayRender={this.renderSelect}
                options={this.props.root.state.options}
                loadData={this.props.root.loadData}
                onChange={this.props.root.onChange}
                changeOnSelect
                allowClear
                placeholder=""
              />
            )}
            {getFieldDecorator(`filterOneArr${k}`, { initialValue: [] })(
              <Select
                notFoundContent=""
                showArrow={false}
                style={{ width: 180 }}
              >
                {[]}
              </Select>
            )}
            {k !== 0 ? (
              <Icon
                style={{ marginLeft: 10 }}
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.remove(k, '1')}
              />
            ) : null}
          </FormItem>
        </Col>
      );
    });

    // 参考业务分子
    getFieldDecorator('keys1', { initialValue: filterTwoKeyArr.length > 0 ? filterTwoKeyArr : [0] });
    const keys1 = getFieldValue('keys1');
    const customFormItems = keys1.map((i, index) => {
      const j = index + 1;
      return (
        <Col
          md={this.props.root.state.mustWriteFlag !== undefined ? (index % 2 === 0 ? 13 : 11) : 12}
          sm={24}
          style={{
            marginLeft: this.props.root.state.themeName === '业务结构' ?
              i % 2 === 0 ? (i === 2 ? 103 : -4) : (i === 1 ? -80 : -187)
              : i % 2 === 0 ? (i === 2 ? 55 : 0) : (i === 1 ? -80 : -135),
          }}
        >
          <FormItem
            style={{ display: 'block' }}
            {...formItemLayoutWithOutLabel}
            label={index === 0 ? '' : ''}
            required={false}
            key={i}
          >
            <span style={{ marginRight: 4, display: index === 0 ? '' : 'none' }}>
              参考业务
              <span style={{ display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>（分子）</span>:
            </span>
            <span style={{
              color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', marginRight: 4,
            }}
            >*
            </span>
            {getFieldDecorator(`filterTwo${i}`, { rules: [{ required: this.props.root.state.compareType === '2-自定义', message: '必选' }] })(
              <Cascader
                style={{ width: 110 }}
                displayRender={this.renderSelect}
                options={this.props.root.state.options}
                loadData={this.props.root.loadData}
                onChange={this.props.root.onChange}
                changeOnSelect
                allowClear
                placeholder=""
              />
            )}
            {getFieldDecorator(`filterTwoArr${i}`, { initialValue: '' })(
              <Select
                notFoundContent=""
                showArrow={false}
                style={{ width: 180 }}
              >
                {''}
              </Select>
            )}
            {i !== 0 ? (
              <Icon
                style={{ marginLeft: 10 }}
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.remove(i, '2')}
              />
            ) : null}
          </FormItem>
        </Col>
      );
    });

    // 实际业务分母
    getFieldDecorator('occupFilterOneKey', { initialValue: occupFilterOneArr.length > 0 ? occupFilterOneArr : [0] });
    const occupFilterOneKey = getFieldValue('occupFilterOneKey');
    const occupFilterOneFormItems = occupFilterOneKey.map((k, index) => {
      const i = index + 1;
      return (
        <Col
          md={this.props.root.state.mustWriteFlag !== undefined ? (index % 2 === 0 ? 13 : 11) : 12}
          sm={24}
          style={{
            marginLeft: this.props.root.state.themeName === '业务结构' ?
              i % 2 === 0 ? (i === 2 ? -81 : -184) : (i === 1 ? 0 : 104)
              : i % 2 === 0 ? (i === 2 ? -81 : -134) : (i === 1 ? 0 : 54),
          }}
        >
          <FormItem
            style={{ display: 'block' }}
            {...formItemLayoutWithOutLabel}
            label={index === 0 ? '' : ''}
            required={false}
            key={k}
          >
            <span style={{ marginRight: 4, display: this.props.root.state.themeName === '业务结构' && index === 0 ? '' : 'none' }}>
              实际业务
              <span style={{ display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>（分母）</span>:
            </span>
            <span style={{
              color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', marginRight: 4,
            }}
            >*
            </span>
            {getFieldDecorator(`occupFilterOne${k}`, { rules: [{ required: !!(this.props.root.state.themeName === '业务结构' && this.props.root.state.compareType === '2-自定义'), message: '必选' }] })(
              <Cascader
                style={{ width: 110 }}
                displayRender={this.renderSelect}
                options={this.props.root.state.options}
                loadData={this.props.root.loadData}
                onChange={this.props.root.onChange}
                changeOnSelect
                allowClear
                placeholder=""
              />
            )}
            {getFieldDecorator(`occupFilterOneArr${k}`, { initialValue: [] })(
              <Select
                notFoundContent=""
                showArrow={false}
                style={{ width: 180 }}
              >
                {[]}
              </Select>
            )}
            {k !== 0 ? (
              <Icon
                style={{ marginLeft: 10 }}
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.remove(k, '3')}
              />
            ) : null}
          </FormItem>
        </Col>
      );
    });

    // 参考业务分母
    getFieldDecorator('occupFilterTwoKey', { initialValue: occupFilterTwoArr.length > 0 ? occupFilterTwoArr : [0] });
    const occupFilterTwoKey = getFieldValue('occupFilterTwoKey');
    const occupFilterTwoFormItems = occupFilterTwoKey.map((k, index) => {
      const i = index + 1;
      return (
        <Col
          md={this.props.root.state.mustWriteFlag !== undefined ? (index % 2 === 0 ? 13 : 11) : 12}
          sm={24}
          style={{
            marginLeft: this.props.root.state.themeName === '业务结构' ?
              i % 2 === 0 ? (i === 2 ? -81 : -184) : (i === 1 ? 0 : 104)
              : i % 2 === 0 ? (i === 2 ? -81 : -134) : (i === 1 ? 0 : 54),
          }}
        >
          <FormItem
            style={{ display: 'block' }}
            {...formItemLayoutWithOutLabel}
            label={index === 0 ? '' : ''}
            required={false}
            key={k}
          >
            <span style={{ marginRight: 4, display: this.props.root.state.compareType === '2-自定义' && index === 0 ? '' : 'none' }}>
              参考业务
              <span style={{ display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>（分母）</span>:
            </span>
            <span style={{
              color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', marginRight: 4,
            }}
            >*
            </span>
            {getFieldDecorator(`occupFilterTwo${k}`, { rules: [{ required: !!(this.props.root.state.themeName === '业务结构' && this.props.root.state.compareType === '2-自定义'), message: '必选' }] })(
              <Cascader
                style={{ width: 110 }}
                displayRender={this.renderSelect}
                options={this.props.root.state.options}
                loadData={this.props.root.loadData}
                onChange={this.props.root.onChange}
                changeOnSelect
                allowClear
                placeholder=""
              />
            )}
            {getFieldDecorator(`occupFilterTwoArr${k}`, { initialValue: [] })(
              <Select
                notFoundContent=""
                showArrow={false}
                style={{ width: 180 }}
              >
                {[]}
              </Select>
            )}
            {k !== 0 ? (
              <Icon
                style={{ marginLeft: 10 }}
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.remove(k, '4')}
              />
            ) : null}
          </FormItem>
        </Col>
      );
    });


    return (
      <div>
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
              <span style={{ margin: '0 8px 0 2px' }}>实际业务统计时间:</span>
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
        <div style={{ marginLeft: -86 }}>
          <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
            {formItems}
          </Row>
          <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
            <Button
              type="dashed"
              onClick={e => this.add(e, '1')}
              style={{ width: '50%' }}
              disabled={!(this.props.form.getFieldValue(
                `filterOneArr${this.props.form.getFieldValue('keys')[this.props.form.getFieldValue('keys').length - 1]}`
              ).length > 0)}
            >
              <Icon type="plus" /> 添加实际业务<span style={{ display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>（分子）</span>
            </Button>
          </FormItem>
        </div>
        <div style={{ marginLeft: -86, display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>
          <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
            {occupFilterOneFormItems}
          </Row>
          <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
            <Button
              type="dashed"
              onClick={e => this.add(e, '3')}
              style={{ width: '50%' }}
              disabled={!(this.props.form.getFieldValue(
                `occupFilterOneArr${this.props.form.getFieldValue('occupFilterOneKey')[this.props.form.getFieldValue('occupFilterOneKey').length - 1]}`
              ).length > 0)}
            >
              <Icon type="plus" /> 添加实际业务<span style={{ display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>（分母）</span>
            </Button>
          </FormItem>
        </div>
        <div style={{ marginTop: 20, }}>
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
              <span style={{ margin: '0 8px 0 2px' }}>参考业务统计时间:</span>
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
        </div>
        <div style={{ display: this.props.root.state.compareType === '2-自定义' ? '' : 'none' }}>
          <div style={{ marginLeft: -86 }}>
            <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
              {customFormItems}
            </Row>
            <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
              <Button
                type="dashed"
                onClick={e => this.add(e, '2')}
                style={{ width: '50%' }}
                disabled={!(this.props.form.getFieldValue(
                  `filterTwoArr${this.props.form.getFieldValue('keys1')[this.props.form.getFieldValue('keys1').length - 1]}`
                ).length > 0)}
              >
                <Icon type="plus" /> 添加参考业务<span style={{ display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>（分子）</span>
              </Button>
            </FormItem>
          </div>
        </div>
        <div style={{ marginTop: 20, display: this.props.root.state.themeName === '业务结构' && this.props.root.state.compareType === '2-自定义' ? '' : 'none' }}>
          <div style={{ marginLeft: -86 }}>
            <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
              {occupFilterTwoFormItems}
            </Row>
            <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
              <Button
                type="dashed"
                onClick={e => this.add(e, '4')}
                style={{ width: '50%' }}
                disabled={!(this.props.form.getFieldValue(
                  `occupFilterTwoArr${this.props.form.getFieldValue('occupFilterTwoKey')[this.props.form.getFieldValue('occupFilterTwoKey').length - 1]}`
                ).length > 0)}
              >
                <Icon type="plus" /> 添加参考业务<span style={{ display: this.props.root.state.themeName === '业务结构' ? '' : 'none' }}>（分母）</span>
              </Button>
            </FormItem>
          </div>
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
