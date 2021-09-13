import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, message, Tabs } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Components from './Components';

const FormItem = Form.Item;
const Option = Select.Option;
const { TabPane } = Tabs;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class ActionRedis extends Component {

  save = () => {
    this.props.dispatch({
      type: 'analysis/openSave'
    }).catch(e => {
      if (e.code === 1) message.success(e.message);
    })
  }

  render() {
    return (
      <PageHeaderLayout>
        <Spin spinning={false}>
          <Card style={{ height: '100%' }}>
            <Tabs defaultActiveKey='1'>
              <TabPane tab="卡片组件" key="1">
                <Components wrappedComponentRef={e => this.CardComponent = e} name='doorAlarm'></Components>
              </TabPane>
              <TabPane tab="图表组件" key="2">
                <Components wrappedComponentRef={e => this.ChartsComponent = e} name='graph'></Components>
              </TabPane>
            </Tabs>
            <Button onClick={this.save} type='primary' style={{ marginTop: 15 }}>开启/关闭缓存</Button>
          </Card>
        </Spin>
      </PageHeaderLayout>
    )
  }
}
