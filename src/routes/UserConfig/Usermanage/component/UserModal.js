import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Select, Pagination } from 'snk-web';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class Usermanages extends Component {
  state = {
    current: 1
  };

  // 新建/编辑用户分页
  changeUserPageSize = (current, pageSize) => {
    this.setState({ current })
    this.props.dispatch({
      type: 'analysis/qRole',
      payload: {
        pageNum: current,
        pageSize: pageSize,
        usercode: this.props.root.state.id
      }
    }).then(() => {
      const { qRoleData: { list } } = this.props.analysis;
      const checkArr = [], deleteArr = [];
      for (let i of list) {
        if (i.isCheck === '1') checkArr.push(i.roleId);
        // else deleteArr.push(i.roleId);
      }
      this.props.form.setFieldsValue({ user: checkArr });
      // this.props.root.setState({ deleteArr });
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { qRoleData: { list, total } } = this.props.analysis;
    const { label, rules } = this.props;
    const { current } = this.state;
    return (
      <div>
        <FormItem label={label} style={{ display: 'flex' }}>
          {getFieldDecorator('user', {
            rules: [{ required: rules, message: '必选' }]
          })(
            <Select style={{ width: 300 }} mode="multiple">
              {list ? list.map(item => {
                return (
                  <Option key={item.roleId} value={item.roleId}>{item.roleName}</Option>
                )
              }) : null}
            </Select>
          )}
        </FormItem>
        <Pagination size="small" total={total} showTotal={total => `共 ${total} 条数据`} showSizeChanger showQuickJumper
          onShowSizeChange={(current, pageSize) => this.changeUserPageSize(current, pageSize)} current={current}
          onChange={(current, pageSize) => this.changeUserPageSize(current, pageSize)} />
      </div>
    );
  }
}
