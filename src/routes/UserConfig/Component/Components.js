import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, Switch, Row, Col, message, Modal } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import PublicModel from '../DorFunction/PublicModel';
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
    companyType: [],        // 组件类型
    type: '卡片组件',        // 组件类型
    name: null,             // 组件名称
    createMan: null,        // 修改人
    creator: null,          // 创建人
    visiblit: false,        // 滑块弹窗
    record: null,           // 弹窗当前作用的数据对象
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.props.dispatch({
      type: 'analysis/getUserCompany',
    })
    const columns = [
      {
        title: '组件名称',
        width: 150,
        dataIndex: 'assemName',
        align: 'center'
      }, {
        title: '组件类型',
        width: 100,
        dataIndex: 'type',
        align: 'center'
      }, {
        title: '修改人',
        width: 100,
        dataIndex: 'updater',
        align: 'center'
      }, {
        title: '创建人',
        width: 100,
        dataIndex: 'createMan',
        align: 'center'
      }, {
        title: '更新时间',
        width: 100,
        dataIndex: 'updateTime',
        align: 'center'
      }, {
        title: '创建时间',
        width: 100,
        dataIndex: 'createTime',
        align: 'center'
      }, {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 100,
        render: (text, record, index) => {
          const { getUserCompany } = this.props.analysis;
          return (
            <span>
              <Link to={{ pathname: '/userconfig/component/creatComponents', id: record.key, type: record.type }}>编辑</Link>
              <span>
                <Divider type="vertical" />
                <Popconfirm
                  title={"请确定是否要删除？"}
                  onConfirm={() => this.onDelete(record, record.type)}
                  okText="确定"
                  cancelText="取消"
                >
                  <a herf='#'>删除</a>
                </Popconfirm>
                {/* {getUserCompany.length > 0 &&
                  <span>
                    <Divider type="vertical" />
                    <a herf='#' onClick={() => this.copy(record)}>复制</a>
                  </span>} */}
              </span>
            </span>
          );
        }
      }, {
        title: '是否向下级机构公开',
        dataIndex: 'open',
        align: 'center',
        width: 100,
        render: (text, record, index) => {
          let check = text === '1';
          return (
            <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked={check} checked={check}
              onChange={(e) => this.switch(e, record)}></Switch>
          );
        }
      }
    ];
    this.setTable({}, '卡片组件');

    const companyType = [
      {
        label: '卡片组件',
        value: 1
      },
      {
        label: '图表组件',
        value: 2
      }
    ]
    this.setState({ columns, companyType })
  }

  // 修改滑块状态
  switch = (e, record) => {
    if (!e) {
      message.warn('当前不允许手动关闭，如需关闭请修改该组件后重新保存则会自动关闭！');
    } else {
      this.setState({ visiblit: true, record })
    }
  }

  // 复制
  copy = record => {
    const { getUserCompany } = this.props.analysis;
    const { key, type, assemName } = record;
    console.log(record);
    const list = [];
    for (let i of getUserCompany) list.push(i.COMPANYCODE);
    this.props.dispatch({
      type: 'analysis/componentCopy',
      payload: {
        assemId: key,
        companyCodeList: list,
        type
      }
    }).then(() => {
      message.success(`已将组件名为：[${assemName}]复制给下级机构！`)
    }, err => {
      message.error(err.message);
    })
  }

  // 设置表格数据
  setTable = (payload, type) => {
    if (type === '卡片组件') {
      this.props.dispatch({
        type: 'analysis/qCardAssemList',
        payload
      }).then(() => {
        const { qCardAssemListData: { list, total, pageSize, pageNum } } = this.props.analysis;
        const data = [];
        for (let i of list) {
          data.push({
            key: i.id,
            assemName: i.assemName,
            updateTime: i.updateTime,
            createTime: i.createTime,
            updater: i.updater,
            createMan: i.creator,
            open: i.publishStatus,
            type: '卡片组件'
          })
        }
        this.setState({ data, totalCount: total, pageSize, pageNum })
      })
    } else {
      this.props.dispatch({
        type: 'analysis/queryGraph',
        payload
      }).then(() => {
        const { queryGraphData: { list, total, pageSize, pageNum } } = this.props.analysis;
        const data = [];
        for (let i of list) {
          data.push({
            key: i.id,
            assemName: i.graphComponentName,
            updateTime: i.updateTime,
            createTime: i.createTime,
            updater: i.updateMan,
            createMan: i.createMan,
            open: i.publishStatus,
            type: i.sqlType === '2' ? '行业数据图表' : '图表组件'
          })
        }
        this.setState({ data, totalCount: total, pageSize, pageNum })
      })
    }
  }

  // 查询
  query = () => {
    const values = this.props.form.getFieldsValue();
    let obj = {
      pageNum: 1,
      pageSize: 10,
      assemName: values.name === '' ? undefined : values.name,
      updater: values.createMan === '' ? undefined : values.createMan,
      creator: values.creator === '' ? undefined : values.creator,
    };
    if (values.type === '图表组件') obj = {
      page: 1,
      pageSize: 10,
      graphComponentName: values.name === '' ? undefined : values.name,
      updateMan: values.createMan === '' ? undefined : values.createMan,
      createMan: values.creator === '' ? undefined : values.creator,
      moduleType: '1'
    }

    let type;
    // if (!values.name) delete obj.assemName;
    // if (!values.createMan) delete obj.updater;

    if (values.type) type = values.type;
    else type = '卡片组件';
    this.setTable(obj, type);
    // 在查询的请求发送完之后修改四个值
    this.setState({ type, name: values.name, createMan: values.createMan, creator: values.creator });
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    const { type, name, createMan, creator } = this.state;
    let obj;
    if (type === '卡片组件') obj = {
      pageNum: current,
      pageSize,
      assemName: name === '' ? undefined : name,
      updater: createMan === '' ? undefined : createMan,
      creator: creator === '' ? undefined : creator,
    }
    else obj = {
      page: current,
      pageSize,
      graphComponentName: name === '' ? undefined : name,
      updateMan: createMan === '' ? undefined : createMan,
      createMan: creator === '' ? undefined : creator,
      moduleType: '1'
    }

    // if (!name) delete obj.assemName;
    // if (!createMan) delete obj.updater;
    this.setTable(obj, type)
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
  onDelete = (record, type) => {
    const { pageNum, pageSize } = this.state;
    if (type === '卡片组件') {
      this.props.dispatch({
        type: 'analysis/delCardAssem',
        payload: {
          id: record.key
        }
      }).then(() => {
        // 删除之后携带当前的页码和数量去重新请求请求数据
        message.success('删除成功！');
        this.changePageSize(pageSize, pageNum);
      }).catch((e) => {
        message.warn(e.message)
      })
    } else {
      this.props.dispatch({
        type: 'analysis/delGraph',
        payload: {
          id: record.key
        }
      }).then(() => {
        // 删除之后携带当前的页码和数量去重新请求请求数据
        message.success('删除成功！');
        this.changePageSize(pageSize, pageNum);
      }).catch((e) => {
        message.warn(e.message)
      })
    }
  }

  // 复制弹窗确认
  copyFinish = () => {
    const { data, record } = this.state;
    const address = record.type === '卡片组件' ? 'copyAssemToCompany' : 'copyGraphToCompany';
    const portalTypeList = this.PublicModel.publicFunction();

    if (!portalTypeList) return;
    this.props.dispatch({
      type: `analysis/${address}`,
      payload: {
        assemId: record.key,
        portalTypeList
      }
    }).then(() => {
      for (let i of data) {
        if (i.key === record.key) {
          if (i.open === '1') i.open = '0';
          else i.open = '1';
        }
      }
      this.setState({ data, visiblit: false });
      message.success('复制成功！');
    }, err => {
      message.error(err.message);
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { columns, data, companyType, visiblit } = this.state;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <h1>组件库</h1>
            <h3 style={{ color: 'red' }}>*初始默认只展示卡片组件，如需图表组件请选择后查询</h3>
            <Form layout="inline" style={{ border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center' }}>
              <Row>
                <Col>
                  <FormItem label='组件名称'>
                    {getFieldDecorator('name', {})(
                      <Input placeholder='请输入' style={{ width: 200 }}></Input>
                    )}
                  </FormItem>
                  <FormItem label='组件类型'>
                    {getFieldDecorator('type', {})(
                      <Select style={{ width: 150 }}>
                        {companyType.map(item => {
                          return (
                            <Option key={item.label} value={item.label}>{item.label}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label='修改人'>
                    {getFieldDecorator('createMan', {})(
                      <Input placeholder='请输入' style={{ width: 150 }}></Input>
                    )}
                  </FormItem>
                  <FormItem label='创建人'>
                    {getFieldDecorator('creator', {})(
                      <Input placeholder='请输入' style={{ width: 150 }}></Input>
                    )}
                  </FormItem>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '20px 0' }}>
                    <Button style={{ marginRight: 15 }} type='primary'>
                      <Link to={{ pathname: '/userconfig/component/creatComponents' }}>新建</Link>
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

            <Modal
              visible={visiblit}
              width='80%'
              onCancel={e => this.setState({ visiblit: false })}
              onOk={e => this.copyFinish()}
              title='复制给下级机构'
            >
              <PublicModel wrappedComponentRef={(e) => this.PublicModel = e} hiddenSave={true}></PublicModel>
            </Modal>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
