import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, Tabs } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import PublicModel from './PublicModel';

const { TabPane } = Tabs;

@connect(({ analysis, loading, umssouserinfo }) => ({
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()
export default class Copy extends Component {
  state = {
    companyCode: '01'
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.props.dispatch({
      type: 'analysis/getCompany'
    }).then(() => {
      const { getCompany } = this.props.analysis;
      this.setState({ companyCode: getCompany.companyCode });
    })
  }

  render() {
    const { companyCode } = this.state;

    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <Tabs type="card">
              <TabPane tab="本级机构复制给下级机构" key="1">
                <PublicModel down={true} buttonName='勾选模块复制给下级'></PublicModel>
              </TabPane>
              {companyCode.length > 2 &&
                <TabPane tab="本级机构复制于上级机构" key="2">
                  <PublicModel buttonName='勾选模块复制给本级'></PublicModel>
                </TabPane>}
            </Tabs>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
