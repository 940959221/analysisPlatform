import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, Avatar, Row, Col, message } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class Components extends Component {
  state = {
    columns: [],            // 表头
    data: [],               // 表格数据
    totalCount: '',         // 总数
    pageSize: 10,           // 一页几条数据
    pageNum: 1,             // 当前页
    permissionName: undefined,    // 权限名称
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';
    const columns = [
      {
        title: '权限名称',
        width: 120,
        dataIndex: 'permissionName',
        align: 'center'
      }, {
        title: '更新时间',
        width: 120,
        dataIndex: 'updateTime',
        align: 'center'
      }, {
        title: '更新人员',
        width: 200,
        dataIndex: 'updater',
        align: 'center'
      }, {
        title: '是否生效',
        width: 80,
        dataIndex: 'active',
        align: 'center',
        render: text => {
          let txt;
          if (text === '1') txt = '是';
          else txt = '否';
          return (
            <span>{txt}</span>
          )
        }
      }, {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 100,
        render: (text, record, index) => {
          return (
            <span>
              <Link to={{ pathname: '/userconfig/permission/creatPermissions', id: record.key }}>编辑</Link>
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
      }
    ];
    this.setTable({});
    this.setState({ columns })
  }

  // 设置表格数据
  setTable = (payload) => {
    this.props.dispatch({
      type: 'analysis/qPermissionList',
      payload
    }).then(() => {
      const { qPermissionListData: { list, total, pageSize, pageNum } } = this.props.analysis;
      const data = [];
      for (let i of list) {
        data.push({
          key: i.permissionId,
          active: i.active,
          updateTime: i.updateTime,
          updater: i.updater,
          permissionName: i.permissionName
        })
      }
      this.setState({ data, totalCount: total, pageSize, pageNum })
    })
  }

  // 查询
  query = () => {
    const values = this.props.form.getFieldsValue();
    const obj = {
      pageNum: 1,
      pageSize: 10,
      permissionName: values.permissionName
    };

    this.setTable(obj);
    // 在查询的请求发送完之后修改值
    this.setState({ permissionName: values.permissionName });
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    const { permissionName } = this.state;
    const obj = {
      pageNum: current,
      pageSize,
      permissionName
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
      type: 'analysis/deletePermission',
      payload: {
        PermissionId: record.key
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
            <h1>权限管理</h1>
            <Form layout="inline" style={{ border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center' }}>
              <Row>
                <Col>
                  <FormItem label='权限名称'>
                    {getFieldDecorator('permissionName', {})(
                      <Input placeholder='请输入' style={{ width: 200 }}></Input>
                    )}
                  </FormItem>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '20px 0' }}>
                    <Button style={{ marginRight: 15 }} type='primary'>
                      <Link to={{ pathname: '/userconfig/permission/creatPermissions' }}>新建</Link>
                    </Button>
                    <Button style={{ marginRight: 15 }} type='primary' onClick={this.query}>查询</Button>
                    <Button style={{ marginRight: 15 }} onClick={() => this.props.form.resetFields()}>重置</Button>
                  </div>
                </Col>
              </Row>
            </Form>

            <Table
              columns={columns}
              dataSource={data}
              bordered
              size="middle"
              pagination={this.paginationProps()}
              scroll={{ x: 850, y: 400 }}
            />
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
