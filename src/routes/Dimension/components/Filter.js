import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Cascader, Icon, Select } from 'snk-web';

const FormItem = Form.Item;

@Form.create()
export default class Filter extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // 删除过滤元素
  onDeleteItem = (value) => {
    const filterShowName = Array.from(new Set(this.props.root.state.filterShowName));
    filterShowName.map((item, index) => {
      if (item === value) {
        filterShowName.splice(index, 1);
      }
    });
    const filterObj = Array.from(new Set(this.props.root.state.filterObj));
    filterObj.map((item, index) => {
      if (item.split('-')[1] === value) {
        filterObj.splice(index, 1);
      }
    });
    this.props.root.reSetfilter(filterShowName, filterObj);
  }

  // 添加选择过滤器
  add = () => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(this.props.root.state.uuid);
    this.props.root.state.uuid += 1;
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  // 删除过滤器
  remove = (k, formValue, formName) => {
    const filterObj = Array.from(new Set(this.props.root.state.filterObj));
    const filterShowName = Array.from(new Set(this.props.root.state.filterShowName));
    for (let j = 0; j < filterObj.length; j += 1) {
      if (formValue !== undefined) {
        for (let i = 0; i < formValue.length; i += 1) {
          if (filterObj[j].split('-')[1] === formValue[i]) {
            filterObj.splice(j, 1);
          }
          if (filterShowName[j] === formValue[i]) {
            filterShowName.splice(j, 1);
          }
        }
      }
    }
    this.props.root.reSetfilter(filterShowName, filterObj);
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
      [formName]: [],
    });
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

    const keyArr = [];
    if (searchData.filter !== undefined) {
      for (let i = 0; i < searchData.filter.length; i += 1) {
        keyArr.push(i);
      }
    }

    getFieldDecorator('keys', { initialValue: keyArr.length > 0 ? keyArr : [0] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      return (
        <FormItem
          style={{ display: 'block' }}
          {...formItemLayoutWithOutLabel}
          label={index === 0 ? '' : ''}
          required={false}
          key={k}
        >
          {getFieldDecorator(`selectDim${k}`)(
            <Cascader
              style={{ width: 90 }}
              displayRender={this.renderSelect}
              options={this.props.root.state.options}
              loadData={this.props.root.loadData}
              onChange={this.props.root.onChange}
              changeOnSelect
              allowClear
              placeholder=""
            />
          )}
          {getFieldDecorator(`dimensionArr${k}`, { initialValue: [] })(
            <Select
              mode="multiple"
              notFoundContent=""
              style={{ width: 600 }}
              onDeselect={e => this.onDeleteItem(e)}
            >
              {[]}
            </Select>
          )}
          {k !== 0 ? (
            <Icon
              style={{ marginLeft: 10 }}
              className="dynamic-delete-button"
              type="minus-circle-o"
              onClick={() => this.remove(k, this.props.form.getFieldValue(`dimensionArr${k}`), `selectDim${k}`)}
            />
          ) : null}
        </FormItem>
      );
    });

    return (
      <div style={{ marginLeft: '-190px' }}>
        {formItems}
        <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
          <Button
            type="dashed"
            onClick={this.add}
            style={{ width: '60%' }}
            disabled={!(this.props.form.getFieldValue(
              `dimensionArr${this.props.form.getFieldValue('keys')[this.props.form.getFieldValue('keys').length - 1]}`
).length > 0)
            }
          >
            <Icon type="plus" /> 添加过滤器
          </Button>
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
