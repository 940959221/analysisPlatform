import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, Tabs } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import CardComponent from './Component/CardComponent';
import ChartsComponent from './Component/ChartsComponent';
import IndustryCharts from './Component/IndustryCharts';

const { TabPane } = Tabs;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class CreatComponents extends Component {
  state = {
    defaultKey: '1',    // 默认组件
    clear: false,
    ids: {}
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'analysis/getCompany'
    })

    let type, defaultKey;
    const { location, door } = this.props;
    if (location) type = location.type;
    else if (door) type = door.type;

    if (type === '图表组件') defaultKey = '2';
    else if (type === '行业数据图表') defaultKey = '3';
    else defaultKey = '1';
    // setTimeout(() => {
    this.setState({ defaultKey });
    // }, 1000);

    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';
  }

  // 改操作是为了防止回显组件时共用同一个id的问题
  changeTab = e => {
    const { defaultKey } = this.state;
    const ids = {};
    if (defaultKey !== e) ids[e] = false;
    else ids[defaultKey] = true;
    this.setState({ ids })
  }

  render() {
    let type, id;
    const { location, door } = this.props;
    const { ids } = this.state;
    if (location) {
      type = location.type;
      id = location.id;
    } else if (door) {
      type = door.type;
      id = door.id;
    }
    let defaultKey;
    if (type === '图表组件') defaultKey = '2';
    else if (type === '行业数据图表') defaultKey = '3';
    else defaultKey = '1';

    ids[defaultKey] = true;
    return (
      <React.Fragment>
        {door ?
          <Spin spinning={this.props.loading}>
            <Card style={{ height: '100%' }}>
              <h1>新建/编辑组件</h1>
              <Tabs defaultActiveKey={defaultKey} onChange={this.changeTab}>
                <TabPane tab="卡片组件" key="1">
                  <CardComponent wrappedComponentRef={e => this.CardComponent = e} id={ids['1'] ? id : null} type={type}></CardComponent>
                </TabPane>
                <TabPane tab="图表组件" key="2">
                  <ChartsComponent wrappedComponentRef={e => this.ChartsComponent = e} id={ids['2'] ? id : null} type={type}></ChartsComponent>
                </TabPane>
                <TabPane tab="行业数据图表" key="3">
                  <IndustryCharts wrappedComponentRef={e => this.IndustryCharts = e} id={ids['3'] ? id : null} type={type}></IndustryCharts>
                </TabPane>
              </Tabs>
            </Card>
          </Spin> :

          <PageHeaderLayout>
            <Spin spinning={this.props.loading}>
              <Card style={{ height: '100%' }}>
                <h1>新建/编辑组件</h1>
                <Tabs defaultActiveKey={defaultKey} onChange={this.changeTab}>
                  <TabPane tab="卡片组件" key="1">
                    <CardComponent wrappedComponentRef={e => this.CardComponent = e} id={ids['1'] ? id : null} type={type}></CardComponent>
                  </TabPane>
                  <TabPane tab="图表组件" key="2">
                    <ChartsComponent wrappedComponentRef={e => this.ChartsComponent = e} id={ids['2'] ? id : null} type={type}></ChartsComponent>
                  </TabPane>
                  <TabPane tab="行业数据图表" key="3">
                    <IndustryCharts wrappedComponentRef={e => this.IndustryCharts = e} id={ids['3'] ? id : null} type={type}></IndustryCharts>
                  </TabPane>
                </Tabs>
              </Card>
            </Spin>
          </PageHeaderLayout>}
      </React.Fragment>
    );
  }
}
