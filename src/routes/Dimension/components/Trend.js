import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Spin, Card } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Monitoring from './Monitoring';

@connect(({ analysis, loading }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class Trend extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      appId: "supervise",
      themeId: "trend",
      pageSize: 10,
      current: 1,
      pageSizeOther: 10,
      currentOther: 1
    };
  }

  componentDidMount() {
    const { appId, themeId } = this.state;
    this.props.dispatch({
      type: 'analysis/getTimePeriod',
      payload: {
        appId, themeId
      }
    })
  }

  // 获取表格数据
  changePageSize = (pageSize, current, other) => {
    if (!other) this.setState({ pageSize, current });
    else this.setState({ pageSizeOther: pageSize, currentOther: current });
  }

  // 表格的分页信息
  paginationProps = (data, other) => {
    const { pageSize, pageSizeOther } = this.state;
    const paginationProps = {
      pageSize: other ? pageSizeOther : pageSize,
      showSizeChanger: true,
      size: 'large',
      onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current, other),
      onChange: (current, pageSize) => this.changePageSize(pageSize, current, other),
      showTotal: () => `共${data.length}条数据`,
      total: data.length,
      pageSizeOptions: ['10', '20', '50', '100'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  render() {
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <Monitoring root={this} location={this.props.location} paginationProps={this.paginationProps} cycle={true} name='趋势监控' analysis_={true}></Monitoring>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
