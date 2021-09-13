import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, message } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class Measure extends Component {
  state = {
    columns: [],      // 表头
    data: [],         // 表格数据
    totalCount: null,  // 表格数据总数
    pageSize: 10,     // 当前页数量
    pageNum: 1,       // 当前页
    name: null,       // 指标名称
    module: null,     // 所属模块
    company: null,    // 相关机构
    updater: null,    // 修改人
    creater: null,    // 创建人
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.props.dispatch({
      type: 'analysis/getThemeSelect',
    })

    const columns = [
      {
        title: '指标名称',
        dataIndex: 'indName',
        align: 'center',
        width: 200,
      },
      {
        title: '指标简称',
        dataIndex: 'alarmTag',
        align: 'center',
        width: 200,
      },
      {
        title: '所属模块',
        dataIndex: 'themeName',
        align: 'center',
        width: 150,
      },
      {
        title: '修改人',
        dataIndex: 'updater',
        align: 'center',
        width: 100,
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        align: 'center',
        width: 100,
      },
      {
        title: '修改时间',
        dataIndex: 'updateTime',
        align: 'center',
        width: 150,
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        align: 'center',
        width: 150,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        width: 100,
        render: (text, record, index) => {
          return (
            <span>
              <Link to={{ pathname: '/userconfig/warning/creatMeasure', id: record.key }}>编辑</Link>
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
    this.changePageSize(1, 10)
    this.setState({ columns });

    setTimeout(() => {
      const table = document.getElementsByClassName('ant-table-wrapper')[0].clientWidth;
      let itemWidth = 0;
      for (let i of columns) {
        itemWidth += i.width;
      }
      console.log(itemWidth);
      console.log(table);
      if (itemWidth > table) {
        columns[0].fixed = 'left';
        this.setState({ columns });
      }
    });
  }

  // 获取表格数据
  changePageSize = (pageNum, pageSize) => {
    const { name, module, updater, creater } = this.state,
      payload = {
        pageNum,
        pageSize,
        alarmTag: name,
        themeId: module,
        updater,
        creator: creater
      }
    if (name === null) delete payload.alarmTag;
    if (module === null) delete payload.themeId;
    if (updater === null) delete payload.updater;
    if (creater === null) delete payload.creater;

    this.props.dispatch({
      type: 'analysis/qAlarmInfoList',
      payload
    }).then(() => {
      const { qAlarmInfoListData: { list, total, pageSize, pageNum } } = this.props.analysis, data = [];
      for (let i of list) {
        data.push({
          key: i.id,
          indName: i.indName,
          alarmTag: i.alarmTag,
          themeName: i.themeName,
          updater: i.updater,
          creator: i.creator,
          createTime: i.createTime,
          updateTime: i.updateTime,
        })
      }
      this.setState({ data, totalCount: total, pageSize, pageNum })
    })
  }

  // 表格的分页信息
  paginationProps = () => {
    const { totalCount, pageSize } = this.state;
    const paginationProps = {
      pageSize,
      showSizeChanger: true,
      size: 'large',
      onShowSizeChange: (current, pageSize) => this.changePageSize(current, pageSize),
      onChange: (current, pageSize) => this.changePageSize(current, pageSize),
      showTotal: () => `共${totalCount}条数据`,
      total: totalCount,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  // 查询
  search = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      let alarmTag = values.name, themeId = values.module, creater = values.creater, updater = values.updater;

      if (alarmTag === '' || alarmTag === undefined) alarmTag = null;
      else if (themeId === '' || themeId === undefined) themeId = null;
      this.setState({ name: alarmTag, module: themeId, creater, updater }, () => {
        this.changePageSize(1, 10);
      })
    })
  }

  // 删除
  onDelete = (record) => {
    const { pageNum, pageSize } = this.state;
    console.log(record)
    this.props.dispatch({
      type: 'analysis/delAlarmInfo',
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

  render() {
    const { getFieldDecorator } = this.props.form,
      { data, columns } = this.state,
      { getThemeSelectData } = this.props.analysis;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <h1>指标库</h1>
            <Form layout="inline"
              style={{ border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center', padding: '10px 0' }}>
              <FormItem label='指标名称'>
                {getFieldDecorator('name', {})(
                  <Input style={{ width: 200 }} placeholder='请输入指标名称'></Input>
                )}
              </FormItem>
              <FormItem label='所属模块'>
                {getFieldDecorator('module', {})(
                  <Select style={{ width: 180 }} allowClear>
                    {getThemeSelectData.map(item => {
                      return (
                        <Option value={item.ATId} key={item.ATId}>{item.ATName}</Option>
                      )
                    })}
                  </Select>
                )}
              </FormItem>
              <FormItem label='修改人'>
                {getFieldDecorator('updater', {})(
                  <Input style={{ width: 150 }} placeholder='请输入指标名称'></Input>
                )}
              </FormItem>
              <FormItem label='创建人'>
                {getFieldDecorator('creater', {})(
                  <Input style={{ width: 150 }} placeholder='请输入指标名称'></Input>
                )}
              </FormItem>
            </Form>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 30 }}>
              <Button type='primary' style={{ marginRight: 16 }}>
                <Link to={{ pathname: '/userconfig/warning/creatMeasure' }}>新建</Link>
              </Button>
              <Button type='primary' style={{ marginRight: 16 }} onClick={e => { this.search() }}>查询</Button>
              <Button style={{ marginRight: 16 }} onClick={() => { this.props.form.resetFields() }}>重置</Button>
            </div>
            <Table
              bordered
              size="middle"
              pagination={this.paginationProps()}
              dataSource={data}
              columns={columns}
              scroll={{ x: 1020, y: 400 }}
            />
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
