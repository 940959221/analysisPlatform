import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, message, Tabs } from 'snk-web';

const FormItem = Form.Item;
const Option = Select.Option;
const { TabPane } = Tabs;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class Components extends Component {
  state = {
    columns: [],      // 表头
    data: [],         // 表格数据
    totalCount: null,  // 表格数据总数
    pageSize: 10,     // 当前页数量
    pageNum: 1,       // 当前页
  }

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    const columns = [
      {
        title: '指标名称',
        dataIndex: 'name',
        align: 'center',
        width: 120,
      },
      {
        title: '操作',
        dataIndex: 'operation',
        align: 'center',
        width: 120,
        render: (text, record, index) => {
          return (
            <span>
              <span>
                <Popconfirm
                  title={"请确定是否要插入？"}
                  onConfirm={() => this.onAction(record.key, 'redis')}
                  okText="确定"
                  cancelText="取消"
                >
                  <a herf='#'>插入</a>
                </Popconfirm>
              </span>
              <span>
                <Divider type="vertical" />
                <Popconfirm
                  title={"请确定是否要删除？"}
                  onConfirm={() => this.onAction(record.key, 'deleteRedis')}
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
    this.setState({ columns })
  }

  // 操作
  onAction = (e, action) => {
    const { name } = this.props;
    this.props.dispatch({
      type: `analysis/${name}${action}`,
      payload: {
        id: e
      }
    }).then(() => {
      message.success('操作成功！');
      if (action === 'deleteRedis') {
        const { pageNum, pageSize } = this.state;
        this.changePageSize(pageNum, pageSize)
      }
    }).catch(err => {
      message.error(err.message);
    })
  }

  // 点击查询
  search = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;

      this.changePageSize(1, 10);
    })
  }

  // 获取表格数据
  changePageSize = (pageNum, pageSize) => {
    const { name } = this.props;
    const code = this.props.form.getFieldValue('code');
    const payload = {
      companyCode: code,
      pageSize
    }
    if (name === 'doorAlarm') payload.pageNum = pageNum;
    else payload.page = pageNum;

    this.props.dispatch({
      type: `analysis/${name}qList`,
      payload
    }).then(() => {
      const { list, total, pageSize, pageNum } = this.props.analysis[name + 'qListData'];
      const data = [];
      for (let i of list) {
        data.push({
          key: i.id,
          name: i.assemName ? i.assemName : i.graphComponentName,
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const { data, columns } = this.state;

    return (
      <React.Fragment>
        <Form layout="inline"
          style={{ border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center', padding: '10px 0' }}>
          <FormItem label='请输入查询条件'>
            {getFieldDecorator('code', {
              rules: [{ required: true, message: '必选' }]
            })(
              <Input style={{ width: 200 }}></Input>
            )}
          </FormItem>
          <Button type='primary' style={{ marginRight: 16 }} onClick={this.search}>查询</Button>
          <Button type='primary' style={{ marginRight: 16 }} onClick={() => this.onAction(undefined, 'redis')}>批量插入</Button>
          <Button type='primary' style={{ marginRight: 16 }} onClick={() => this.onAction(undefined, 'deleteRedis')}>批量删除</Button>
        </Form>
        <Table
          bordered
          size="middle"
          pagination={this.paginationProps()}
          dataSource={data}
          columns={columns}
        />
      </React.Fragment>
    )
  }
}
