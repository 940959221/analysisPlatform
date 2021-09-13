import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import PublicModel from './DorFunction/PublicModel';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class Subscribe extends Component {
  state = {

  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';
  }

  render() {
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <PublicModel down={true} url='qSubscribe' type='1' buttonName='勾选模块订阅' saveUrl='updSubscribe'></PublicModel>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
