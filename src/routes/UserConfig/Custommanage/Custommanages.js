import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine
}))
@Form.create()
export default class Custommanages extends Component {
  state = {

  };

  render() {
    console.log(this)
    return (
      <PageHeaderLayout>
        <Spin spinning={false}>
          <Card>

          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
