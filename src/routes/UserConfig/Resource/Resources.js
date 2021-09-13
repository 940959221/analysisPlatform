import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, message } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';
import { act } from 'react-test-renderer';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class Resources extends Component {
  state = {
    columns: [],            // 表头
    data: [],               // 表格数据
    totalCount: '',         // 总数
    pageSize: 10,           // 一页几条数据
    pageNum: 1,             // 当前页
    name: undefined,             // 资源名称
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.setTable({});

    const columns = [
      {
        title: '资源名称',
        width: 150,
        dataIndex: 'resourceName',
        align: 'center'
      },
      {
        title: '资源类型',
        width: 120,
        dataIndex: 'resourceType',
        align: 'center',
        render: text => {
          let type;
          if (text === '1') type = '指标型';
          else type = 'url型';
          return (
            <span>{type}</span>
          )
        }
      },
      {
        title: '更新时间',
        width: 150,
        dataIndex: 'updateTime',
        align: 'center'
      },
      {
        title: '更新人员',
        width: 200,
        dataIndex: 'updater',
        align: 'center'
      },
      {
        title: '是否生效',
        width: 150,
        dataIndex: 'active',
        align: 'center',
        render: text => {
          let active;
          if (text === '1') active = '是';
          else active = '否';
          return (
            <span>{active}</span>
          )
        }
      },
      {
        title: '操作',
        width: 100,
        dataIndex: 'action',
        align: 'center',
        render: (text, record, index) => {
          return (
            <span>
              <Link to={{ pathname: '/userconfig/resource/creatResources', id: record.key, type: record.resourceType }}>编辑</Link>
              <span>
                <Divider type="vertical" />
                <Popconfirm
                  title={"请确定是否要删除？"}
                  onConfirm={() => this.onDelete(record)}
                  okText="确定"
                  cancelText="取消"
                >
                  <a herf='#'>删除</a>
                </Popconfirm>
              </span>
            </span>
          );
        }
      },
    ];
    this.setState({ columns })
  }

  // 设置表格数据
  setTable = (payload) => {
    this.props.dispatch({
      type: 'analysis/qResourceList',
      payload
    }).then(() => {
      const { qResourceListData: { list, total, pageSize, pageNum } } = this.props.analysis;
      const data = [];
      for (let i of list) {
        data.push({
          key: i.resourceId,
          resourceName: i.resourceName,
          updateTime: i.updateTime,
          updater: i.updater,
          resourceType: i.type,
          active: i.active
        })
      }
      this.setState({ data, totalCount: total, pageSize, pageNum })
    })
  }

  // 点击查询
  query = () => {
    const { pageSize, pageNum } = this.state;
    const name = this.props.form.getFieldValue('name');
    const obj = {
      pageNum,
      pageSize,
      resourceName: name
    }
    this.setTable(obj)
    // 在查询的请求发送完之后修改一个值
    this.setState({ name });
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    const { name } = this.state;
    const obj = {
      pageNum: current,
      pageSize,
      resourceName: name
    }
    this.setTable(obj)
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

  // 删除
  onDelete = (record) => {
    const { pageNum, pageSize } = this.state;
    this.props.dispatch({
      type: 'analysis/delCardAssem',
      payload: {
        resourceId: record.key
      }
    }).then(() => {
      // 删除之后携带当前的页码和数量去重新请求请求数据
      message.success('删除成功！');
      this.changePageSize(pageSize, pageNum);
    }).catch((e) => {
      message.warn(e.message)
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { columns, data } = this.state;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <h1>资源管理</h1>
            <Form layout="inline" style={{ border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center' }}>
              <FormItem label='资源名称'>
                {getFieldDecorator('name', {})(
                  <Input placeholder='请输入' style={{ width: 200 }}></Input>
                )}
              </FormItem>
              <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '20px 0' }}>
                <Button style={{ marginRight: 15 }} type='primary'>
                  <Link to={{ pathname: '/userconfig/resource/creatResources' }}>新建</Link>
                </Button>
                <Button style={{ marginRight: 15 }} type='primary' onClick={this.query}>查询</Button>
                <Button style={{ marginRight: 15 }} onClick={() => this.props.form.resetFields()}>重置</Button>
              </div>
            </Form>

            <Table
              columns={columns}
              dataSource={data}
              bordered
              size="middle"
              pagination={this.paginationProps()}
              scroll={{ x: 870 }}
            />
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
