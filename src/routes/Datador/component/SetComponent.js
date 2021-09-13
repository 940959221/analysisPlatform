import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Spin, Button, message, Modal, Input, Collapse, Select, Row, Col, Popconfirm, List, Switch, Table } from 'snk-web';
import Components from '../../UserConfig/Component/CreatComponents';

const FormItem = Form.Item;
const { Option } = Select;

function Search(props) {
  const { getFieldDecorator } = props.props.form;
  const that = props.root;
  return (
    <React.Fragment>
      <div style={{ display: 'flex' }}>
        <FormItem label='输入组件名称' style={{ display: 'flex' }}>
          {getFieldDecorator('name', {})(
            <Input style={{ width: 200 }} placeholder='请输入'></Input>
          )}
        </FormItem>
        <FormItem label='输入修改人' style={{ display: 'flex', marginLeft: 15 }}>
          {getFieldDecorator('createMan', {})(
            <Input style={{ width: 200 }} placeholder='请输入'></Input>
          )}
        </FormItem>
        <Button style={{ marginLeft: 15 }} onClick={that.search} type='primary'>搜索</Button>
        <Button style={{ marginLeft: 15 }} onClick={() => that.props.form.resetFields()}>重置</Button>
        <Button style={{ marginLeft: 15 }} onClick={() => that.setTable({ isCheck: '1' }, that.props.tabs, true)}>查询已开启组件</Button>
      </div>
    </React.Fragment>
  )
}

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class SearchComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: [],         // 打开状态的所有操作过的组件id
      off: [],          // 关闭状态的所有操作过的组件id
      // cardOpen: [],         // 打开状态的所有操作过的组件id
      // cardOff: [],          // 关闭状态的所有操作过的组件id
      createMan: null,
      showEdit: false,         // 是否打开编辑弹窗
      location: {},
      componentOpen: false
    }
  }

  componentDidMount() {
    const columns = [
      {
        title: '组件名称',
        width: 150,
        dataIndex: 'assemName',
        align: 'center',
        render: (text, record) => {
          const { sqlType, key } = record
          return <div style={{ cursor: 'pointer', color: '#1890ff' }} onClick={() => this.openEdit(key, sqlType)}>{text}</div>
        }
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
        title: '是否选择',
        dataIndex: 'action',
        align: 'center',
        width: 100,
        render: (text, record, index) => {
          let check = true;
          if (text === '0') check = false;
          return (
            <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked={check}
              onChange={(e) => this.switch(e, record)}></Switch>
          );
        }
      }
    ];

    const { otherColumn } = this.props;
    console.log(otherColumn);
    if (otherColumn) columns.splice(1, 0, {
      title: '组件类型',
      width: 100,
      dataIndex: 'type',
      align: 'center'
    })

    this.setState({ columns });
    this.setTable({}, this.props.tabs)
  }

  // 开关
  switch = (e, record) => {
    const { open, off } = this.state;
    const { tabs } = this.props;
    const id = record.key;
    // 判定当前是打开还是关闭
    if (e) {
      // 判定当前的id是否有存入过另一个数组中，如果有的话就先删除再添加
      const index = off.indexOf(id);
      if (index >= 0) {
        off.splice(index, 1)
      }
      open.push(id);
    } else {
      const index = open.indexOf(id);
      if (index >= 0) {
        open.splice(index, 1)
      }
      off.push(id);
    }
    this.setState({ open, off })
  }

  // 设置表格
  setTable = (payload, type, component) => {
    payload.portalId = this.props.id;
    if (type === '1') {
      payload.moduleType = '0'
      this.props.dispatch({
        type: 'analysis/qCardAssemList',
        payload
      }).then(() => {
        const { qCardAssemListData: { list, total, pageSize, pageNum } } = this.props.analysis;
        const { open, off } = this.state;
        const data = [];
        for (let i of list) {
          let isCheck = i.isCheck;
          for (let j of open) {
            if (j === i.id) isCheck = '1';
          }
          for (let j of off) {
            if (j === i.id) isCheck = '0';
          }
          data.push({
            key: i.id,
            assemName: i.assemName,
            updateTime: i.updateTime,
            updater: i.updater,
            createMan: i.creator,
            action: isCheck,
            type: i.typeId.slice(0, 1) === '1' ? '预警组件' : '统计组件'
          })
        }
        this.setState({ data, totalCount: total, pageSize, pageNum, componentOpen: component ? true : false });
      }, err => {
        console.log(err)
      })
    } else {
      payload.moduleType = '1'
      this.props.dispatch({
        type: 'analysis/queryGraph',
        payload
      }).then(() => {
        const { queryGraphData: { list, total, pageSize, pageNum } } = this.props.analysis;
        const { open, off } = this.state;
        const data = [];
        // 额外多做一次循环判定，因为分页和搜索都需要从后端重新请求数据，并且该操作是不会执行保存操作，所以在用户操作过开关并且
        // 重新获取数据之后，去把用户操作的记录覆盖获取数据的记录，达到响应之前操作的效果，同时避免因为数据重新渲染而可能导致
        // 用户重新操作同一个组件所产生重复id而需要去重的操作
        for (let i of list) {
          let isCheck = i.isCheck;
          for (let j of open) {
            if (j === i.id) isCheck = '1';
          }
          for (let j of off) {
            if (j === i.id) isCheck = '0';
          }
          data.push({
            key: i.id,
            assemName: i.graphComponentName,
            sqlType: i.sqlType,
            updateTime: i.updateTime,
            updater: i.updateMan,
            createMan: i.createMan,
            action: isCheck
          })
        }
        this.setState({ data, totalCount: total, pageSize, pageNum, componentOpen: component ? true : false })
      }, err => {
        console.log(err);
      })
    }
  }

  // 点击搜索
  search = () => {
    const values = this.props.form.getFieldsValue();
    const { tabs } = this.props;
    let obj = {
      pageNum: 1,
      pageSize: 10,
      assemName: values.name === '' ? undefined : values.name,
      updater: values.createMan === '' ? undefined : values.createMan
    };
    if (tabs === '2') obj = {
      page: 1,
      pageSize: 10,
      graphComponentName: values.name === '' ? undefined : values.name,
      updateMan: values.createMan === '' ? undefined : values.createMan,
      moduleType: '1'
    }

    this.setTable(obj, tabs);
    // 在查询的请求发送完之后修改三个值
    this.setState({ name: values.name, createMan: values.createMan });
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    const { name, createMan, componentOpen } = this.state;
    const { tabs } = this.props;
    let obj, componentObj;
    if (tabs === '1') {
      obj = {
        pageNum: current,
        pageSize,
        assemName: name === '' ? undefined : name,
        updater: createMan === '' ? undefined : createMan
      };
      componentObj = {
        isCheck: '1',
        pageNum: current,
        pageSize,
      }
    }
    else {
      obj = {
        page: current,
        pageSize,
        graphComponentName: name === '' ? undefined : name,
        updateMan: createMan === '' ? undefined : createMan,
        moduleType: '1'
      };
      componentObj = {
        isCheck: '1',
        page: current,
        pageSize,
      }
    }

    if (componentOpen) this.setTable(componentObj, this.props.tabs, true)
    else this.setTable(obj, tabs)
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

  openEdit = (id, sqlType) => {
    let name = '';
    if (sqlType === '2') name = '行业数据图表';
    else {
      if (this.props.tabs === '1') name = '卡片组件';
      else if (this.props.tabs === '2') name = '图表组件';
    }
    const location = { type: name, id }
    this.setState({ showEdit: true, location })
  }

  render() {
    const { columns, data, showEdit, location } = this.state;
    return (
      <React.Fragment>
        <Search props={this.props} root={this}></Search>
        <Table
          columns={columns}
          dataSource={data}
          bordered
          size="middle"
          pagination={this.paginationProps()}
          scroll={{ x: 850, y: 400 }}
        />

        <Modal
          visible={showEdit}
          footer={null}
          width='80%'
          onCancel={e => { this.setState({ showEdit: false }) }}
        >
          {showEdit ? <Components door={location}></Components> : null}
        </Modal>
      </React.Fragment>
    )
  }
}
