import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Spin, Checkbox, message } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class Reduction extends Component {
  state = {
    columns: [],      // 表头
    datas: [],        // 总数据
    data: [],         // 当前数据量
    totalCount: 0,    // 总数
    pageSize: 10,     // 当前页大小
    portalList: [],   // 已勾选的数据
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.getTableData();
  }

  // 获取表格数据
  getTableData = () => {
    this.props.dispatch({
      type: 'analysis/qCopyLog'
    }).then(() => {
      const { qCopyLogData } = this.props.analysis;
      const columns = [
        {
          title: '大场景名称',
          width: 200,
          dataIndex: 'portalName1',
          align: 'center'
        },
        {
          title: '小场景名称',
          width: 200,
          dataIndex: 'portalName2',
          align: 'center'
        },
        {
          title: '更换时间',
          width: 200,
          dataIndex: 'updateTime',
          align: 'center'
        },
        {
          title: '是否还原更换之前版本',
          width: 200,
          dataIndex: 'change',
          align: 'center',
          render: (text, record, index) => {
            return (
              <Checkbox onChange={e => this.change(e, record)} checked={text}>是</Checkbox>
            );
          }
        },
      ];
      const datas = [];
      for (let i of qCopyLogData) {
        datas.push({
          key: i.portalId,
          portalName1: i.portalName1,
          portalName2: i.portalName2,
          updateTime: i.updateTime,
          change: false
        })
      }
      const data = datas.slice(0, 9);
      this.setState({ columns, datas, totalCount: qCopyLogData.length, data })
    }, err => {
      message.error(err.message)
    })
  }

  // 选中复选框
  change = (e, record) => {
    const { portalList, datas } = this.state;
    if (e.target.checked) {
      portalList.push(record.key)
    } else {
      for (let i in portalList) {
        if (portalList[i] === record.key) portalList.splice(i, 1);
      }
    }
    for (let i of datas) {
      if (i.key === record.key) i.change = e.target.checked;
    }
    this.setState({ portalList, datas })
  }

  // 更新表格数据
  changePageSize = (pageSize, current) => {
    const { datas } = this.state;
    const data = datas.slice((current - 1) * pageSize, (current - 1) * pageSize + pageSize);
    this.setState({ data, pageSize });
  }

  // 表格的分页信息
  paginationProps = () => {
    const { totalCount, pageSize } = this.state;
    const paginationProps = {
      pageSize,
      showSizeChanger: true,
      size: 'large',
      onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
      onChange: (current, pageSize) => this.changePageSize(pageSize, current),
      showTotal: () => `共${totalCount}条数据`,
      total: totalCount,
      pageSizeOptions: ['10', '20', '50', '100'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  // 点击按钮
  submit = () => {
    const { portalList } = this.state;
    this.props.dispatch({
      type: 'analysis/reduPortal',
      payload: {
        portalList
      }
    }).then(() => {
      message.success('还原成功！');
      this.getTableData();
    }, err => {
      message.error(err.message);
    })
  }

  render() {
    const { data, columns } = this.state;

    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <h1>上级机构更换门户日志</h1>
            <Table
              columns={columns}
              dataSource={data}
              bordered
              size="middle"
              pagination={this.paginationProps()}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button type='primary' onClick={this.submit}>勾选模块确认恢复</Button></div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
