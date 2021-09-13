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
export default class CarType extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      appId: "supervise",
      themeId: "vehicle",
      totalCount: '',
      pageSize: 10,
      current: 1
    };
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    this.setState({ pageSize, current })
  }

  // 表格的分页信息
  paginationProps = (data) => {
    const { pageSize } = this.state;
    const paginationProps = {
      pageSize,
      showSizeChanger: true,
      size: 'large',
      onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current, data),
      onChange: (current, pageSize) => this.changePageSize(pageSize, current, data),
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
            <Monitoring root={this} wrappedComponentRef={e => this.Monitoring = e}
              location={this.props.location} paginationProps={this.paginationProps} name='监管报表(签单口径)'></Monitoring>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
