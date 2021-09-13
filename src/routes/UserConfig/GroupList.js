import React, { PureComponent } from 'react';
import { connect } from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Form, Col, Row, Divider, Input, Modal, Button, Popconfirm, Table, Card, message, Transfer } from 'snk-web';

const { TextArea } = Input;
const FormItem = Form.Item;
const Search = Input.Search;

@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine,
}))
@Form.create()
export default class GroupList extends PureComponent {
  state = {
    addGroupModel: false,
    listCurrentPageNo: 1,
    currentPageNo: 1,
    pageSize: 5,
    groupId: '',
    modelFlag: 'isAdd',
    transferModel: false,
    targetKeys: [],
    selectedKeys: [],
    tbCname: '',
    butFlag: false,
    groupName: '',
    showColCnameModel: false,
    ColCnameModelFlag: 0,
    targetSelectedKeys: '',
    tbNameListModel: false,
    selectedRows: [],
    selectedRowKeys: [],
    tbNameList: [],
    groupId: '',
    mockData: [],
    searchName: '',
    moveKeys: [],
    tbIdArr: [],
    isActive: '',
  }

  componentDidMount() {
    this.loadData(1,5,this.state.searchName);
  }

  loadData = (currentPageNo,pageSize,keyword) => {
    const {dispatch}  =this.props;
    dispatch({
      type: 'mine/findAllGroupByPage',
      payload: {
        currentPageNo,
        pageSize,
        keyword,
      }
    }).then(()=>{
      const {findAllGroupData} = this.props.mine;
      
    });
  }

  // 取消
  onCancel = (e) => {
    e.preventDefault();
    this.setState({ addGroupModel: false });
    this.props.form.setFieldsValue({ groupName: '', groupDesc: '' });
  }

  // 添加群组
  onOkAddGroupModel = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      const groupName = values.groupName;
      const groupDesc = values.groupDesc;
      if (this.state.modelFlag === 'isAdd') {
        this.props.dispatch({
          type: 'mine/addGroup',
          payload: {
            groupName,
            groupDesc,
            isActive: 0,
          },
        }).then(()=>{
          this.setState({ addGroupModel: false });
          this.loadData(1,5,this.state.searchName);
        });
      } else {
        this.props.dispatch({
          type: 'mine/updateGroup',
          payload: {
            groupName,
            groupDesc,
            groupId: this.state.groupId,
            isActive: this.state.isActive,
          },
        }).then(()=>{
          this.setState({ addGroupModel: false });
          this.loadData(1,5,this.state.searchName);
        });
      }
    });
  }

  onDelete = (e,record) => {
    this.props.dispatch({
      type: 'mine/deleteGroup',
      payload: {
        groupId: record.groupId,
      }
    }).then(()=>{
      this.loadData(this.state.currentPageNo,5,this.state.searchName);
    }).catch((e) => {
      message.warn(e.message)
    });
  }

  editTable = (record) => {
    setTimeout(()=>{
      this.setState({ addGroupModel: true, groupId: record.groupId, modelFlag: 'isEdit', isActive: record.isActive });
      this.props.form.setFieldsValue({ groupName: record.groupName, groupDesc: record.groupDesc });
    },50);
  }

  addTable = (record) => {
    this.setState({ transferModel: true, groupName: record.groupName, groupId: record.groupId });
    this.props.dispatch({
      type: 'mine/getTableByGroup',
      payload: {
        groupId: record.groupId,
      }
    }).then(()=>{
      const {getTableByGroupData} = this.props.mine;
      let mockData = [], oriTargetKeys = []; 
      if (getTableByGroupData.exclude !== undefined && getTableByGroupData.exclude.length > 0) {
        getTableByGroupData.exclude.map((item) => {
          mockData.push({
            key: item.tbId,
            title: item.tbCname,
          });
        });
      }
      let dataArr = [];
      if (getTableByGroupData.include !== undefined && getTableByGroupData.include.length > 0) {
        getTableByGroupData.include.map((item) => {
          const payload = {}
          mockData.push({
            key: item.tbId,
            title: item.tbCname,
          });
          payload['columns'] = item.columns;
          payload['groupId'] = this.state.groupId;
          payload['tbId'] = item.tbId;
          dataArr.push(payload);
          this.state.tbIdArr.push(item.tbId);
        });
        oriTargetKeys = getTableByGroupData.include.map(item => item.tbId);
      }
      this.setState({ mockData, targetKeys: oriTargetKeys, tbNameList: dataArr });
    }).catch((e) => {
      message.warn(e.message)
    });
  }

  onSearch = (value) => {
    this.setState({ searchName: value, currentPageNo: 1 });
    this.loadData(1,5,value);
  }

  handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    this.setState({ ColCnameModelFlag: 0, });
    if (targetSelectedKeys.length === 1) {
      this.setState({ butFlag:  true, targetSelectedKeys: targetSelectedKeys[0], });
    } else {
      this.setState({ butFlag: false });
    }
    const {getTableByGroupData} = this.props.mine;
    if (getTableByGroupData.include !== undefined && getTableByGroupData.include.length > 0) {
      getTableByGroupData.include.map((item) => {
        if (item.tbId === targetSelectedKeys[0]) {
          this.setState({ tbCname: item.tbCname, tbId: item.tbId });
        }
      })
    }
    this.setState({ selectedKeys: [...sourceSelectedKeys, ...targetSelectedKeys] });
    if (targetSelectedKeys.length > 0 && targetSelectedKeys.length === 1) {
      this.getAllColumnsList(this.state.listCurrentPageNo,5,targetSelectedKeys[0]);
    }
  }

  getAllColumnsList = (currentPageNo,pageSize,keyword) => {
    this.props.dispatch({
      type: 'mine/getAllColumnsByTablePage',
      payload: {
        currentPageNo,
        pageSize,
        keyword,
      }
    }).then(()=>{
      const {getAllColumnsByTablePageData} = this.props.mine;
    }).catch((e) => {
      message.warn(e.message);
    });
  }

  handleChange = (nextTargetKeys, direction, moveKeys) => {
    const tbNameList = [];
    for (var i = 0; i < this.state.tbNameList.length; i++) {
      for (var j = 0; j < moveKeys.length; j++) {
        if (moveKeys[j] !== this.state.tbNameList[i].tbId) {
          tbNameList.push(this.state.tbNameList[i]);
        }
      }
    }
    this.setState({ targetKeys: nextTargetKeys, moveKeys, tbNameList, });
  }

  handleTableChange = (page, pageSize) => {
    this.setState({
      currentPageNo: page,
      pageSize: pageSize,
      selectedRowKeys: [],
      selectedRows: [],
    });
    this.loadData(page,pageSize,this.state.searchName);
  }

  handleListTableChange = (page, pageSize) => {
    this.setState({
      listCurrentPageNo: page,
      pageSize: pageSize,
      selectedRows: [],
    });
    this.getAllColumnsList(page,pageSize,this.state.targetSelectedKeys);
  }

  onOkTbNameListModel = () => {
    let columns = [], payload = {};
    this.state.selectedRows.map((item) => {
      if (item.columns !== undefined) {
        columns.push(item.columns);
      } else {
        columns.push(item.colName);
      }
      
    });
    payload['columns'] = columns.join(',');
    payload['groupId'] = this.state.groupId;
    payload['tbId'] = this.state.tbId;
    this.state.tbNameList.map((item,index) => {
      if (item.tbId === this.state.tbId) {
        this.state.tbNameList.splice(index,1);
      }
    });
    this.state.tbNameList.push(payload);
    this.state.tbIdArr.push(this.state.tbId)
    this.setState({ tbNameListModel: false, ColCnameModelFlag: 1, selectedRows: [], selectedRowKeys: [], listCurrentPageNo: 1});
  }

  onOkTransferModel = (e) => {
    e.preventDefault();
    if (this.state.targetKeys.length > 0) {
      if (this.state.tbNameList.length > 0) {
        const targetKeys = Array.from(new Set(this.state.targetKeys));
        const tbIdArr = Array.from(new Set(this.state.tbIdArr));
        for (var j = 0; j < targetKeys.length; j++) {
          if (tbIdArr.indexOf(targetKeys[j]) === -1) {
            const payload = {};
            payload['columns'] = '*';
            payload['groupId'] = this.state.groupId;
            payload['tbId'] = targetKeys[j];
            this.state.tbNameList.push(payload);
          }
        }
        this.props.dispatch({
          type: 'mine/addTableGroup',
          payload: Array.from(new Set(this.state.tbNameList)),
        }).then(()=>{
        }).catch((e) => {
          message.warn(e.message);
        });
      } else {
        const {getTableByGroupData} = this.props.mine;
        let payloadData = [];
        if (this.state.targetKeys.length > 0) {
          for (var index = 0; index < this.state.targetKeys.length; index++) {
            const payload = {}
            payload['columns'] = '*';
            payload['groupId'] = this.state.groupId;
            payload['tbId'] = this.state.targetKeys[index];
            payloadData.push(payload);
          }
        }
        this.props.dispatch({
          type: 'mine/addTableGroup',
          payload: payloadData,
        }).then(()=>{
        }).catch((e) => {
          message.warn(e.message);
        });
      }
    } else {
      this.props.dispatch({
        type: 'mine/addTableGroup',
        payload: [{groupId: this.state.groupId}],
      });
    }
    this.setState({ selectedRows: [], selectedRowKeys: [], transferModel: false, targetKeys: [], tbNameList: [], tbIdArr: [],});
  }

  showColCnameModel = () => {
    this.setState({ tbNameListModel: true, ColCnameModelFlag: 1, });
    const {getTableByGroupData, getAllColumnsByTablePageData} = this.props.mine;
    let colNameArr = [], columns = [], indexArr = [];
    if (getTableByGroupData.include) {
      getTableByGroupData.include.map((item) => {
        if (item.tbCname === this.state.tbCname) {
          colNameArr.push(item);
          columns = item.columns.split(',');
        }
      });
    }
    if (getAllColumnsByTablePageData.list.length > 0 && columns.length > 0) {
      for (const i in columns) {
        for (const j in getAllColumnsByTablePageData.list) {
          if (columns[i] === getAllColumnsByTablePageData.list[j].colName) {
            indexArr.push(Number(j));
          }
        }
      }
    }
    this.setState({ selectedRows: colNameArr, selectedRowKeys: indexArr  });
  }

  isActive = (record) => {
    const isActive = record.isActive === '0' ? '1' : '0';
    this.props.dispatch({
      type: 'mine/updateGroup',
      payload: {
        groupName: record.groupName,
        groupDesc: record.groupDesc,
        groupId: record.groupId,
        isActive,
      },
    }).then(()=>{
      this.setState({ addGroupModel: false });
      this.loadData(this.state.currentPageNo,5,this.state.searchName);
    });
  }
 
  renderForm () {
    const {form: { getFieldDecorator, getFieldValue }, mine: {findAllGroupData,getTableByGroupData, getAllColumnsByTablePageData}, loading} = this.props;
    let data, groupNotInData, datas;
    if (findAllGroupData.list !== undefined) {
      data = findAllGroupData.list.length > 0 ? findAllGroupData.list : [];
    } else {
      data = [];
    }
    let total, listTotal;
    if (findAllGroupData.totalRecordCount !== undefined) {
      total = findAllGroupData.totalRecordCount;
    } else {
      total = 0;
    }
    const { targetKeys, selectedKeys } = this.state;
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRows, selectedRowKeys, });
      },
    };

    if (getAllColumnsByTablePageData.list !== undefined && getAllColumnsByTablePageData.list.length > 0) {
      datas = getAllColumnsByTablePageData.list;
    } else {
      datas = getAllColumnsByTablePageData.list;
    }
    if (getAllColumnsByTablePageData.totalRecordCount !== undefined) {
      listTotal = getAllColumnsByTablePageData.totalRecordCount
    } else {
      listTotal = 0
    }
    const columns1 = [
         {
            title: '编号',
            dataIndex: 'num',
            align: 'center',
            render: (text, record, index) => {
                const i = index + 1;
                return (
                    <span style={{ textAlign: 'center' }}>{i}</span>
                );
            }
        },
        {
          title: '字段名称',
          dataIndex: 'colCname',
          align: 'center',
        },
    ];
    const columns = [
         {
            title: '群组编号',
            dataIndex: 'num',
            align: 'center',
            render: (text, record, index) => {
                const i = index + 1;
                return (
                    <span style={{ textAlign: 'center' }}>{i}</span>
                );
            }
        },
        {
            title: '群组名称',
            dataIndex: 'groupName',
            align: 'center',
        }, 
        {
          title: '群组说明',
          dataIndex: 'groupDesc',
          align: 'center',
        },
        {
          title: '是否有效',
          dataIndex: 'isActive',
          align: 'center',
          render: (text, record, index) => {
            return (
              <span>
                <a onClick={() => this.isActive(record)}>{record.isActive === '0' ? '有效' : '无效'}</a>
                {/* <Divider type="vertical"/>
                <a onClick={() => this.isActive(record, 0)}>失效</a> */}
              </span>
            );
          }
        },
        {
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            render: (text, record, index) => {
                return (
                  <span>
                    <a onClick={() => this.addTable(record)}>添加表</a>
                    <Divider type="vertical"/>
                    <a onClick={() => this.editTable(record)}>修改</a>
                    <Divider type="vertical"/>
                    <Popconfirm 
                    title={"请确定是否要删除？"} 
                    onConfirm={e=>this.onDelete(e,record)}
                    okText="确定" 
                    cancelText="取消"
                  >
                    <a herf='#'>删除</a>
                  </Popconfirm>
                  </span>
                );
            }
        }
    ];

    return(
      <div style={{ textAlign: 'center' }}>
          <Search
            placeholder="请输入群组名称"
            enterButton="查找"
            size="large"
            onSearch={this.onSearch}
            style={{ width: '40%', margin: '20px 0'}}
          />
          <Table
              loading={loading}
              columns={columns}
              dataSource={data}
              bordered
              pagination={{
                current:this.state.currentPageNo,
                pageSize:this.state.pageSize,
                total: total,
                onChange: (page, pageSize) => this.handleTableChange(page, pageSize),
              }}
              title={() =>{
                return <div style={{ textAlign: 'left' }}>
                  <Button type='primary' onClick={e=>this.setState({ addGroupModel: true, modelFlag: 'isAdd' })}>
                      添加群组
                  </Button>
                </div>
              }}
          />
          <Modal
          visible={this.state.addGroupModel}
          onOk={e => this.onOkAddGroupModel(e)}
          onCancel={e=> this.onCancel(e)}
          destroyOnClose={true}
          title={ this.state.modelFlag === 'isAdd' ? '添加群组' : '修改群组'}
          >
          <Form>
            <FormItem label="群组名称" labelCol={{ span: 5 }} wrapperCol={{ span: 16 }}> 
              {getFieldDecorator('groupName', {initialValue: '',})(
                <Input placeholder='' style={{ width: 315 }} />
                )}
            </FormItem>
            <FormItem label="群组说明" labelCol={{ span: 5 }} wrapperCol={{ span: 16 }}> 
              {getFieldDecorator('groupDesc', {initialValue: '',})(
                <TextArea placeholder='' style={{ width: 330 }} />
                )}
            </FormItem>
          </Form>
        </Modal>
         <Modal
          visible={this.state.transferModel}
          onOk={e => this.onOkTransferModel(e)}
          onCancel={e=> { this.setState({ transferModel: false, selectedKeys: [], targetKeys: [], tbNameList: [] }) }}
          destroyOnClose={true}
          title={`您正在给[${this.state.groupName}]添加表权限`}
          >
            <Transfer
            dataSource={this.state.mockData}
            targetKeys={this.state.targetKeys}
            selectedKeys={selectedKeys}
            onChange={this.handleChange}
            onSelectChange={this.handleSelectChange}
            render={item => item.title}
          />
          <div style={{ marginTop: 20, textAlign: 'center'}}>
            <Button type='primary' style={{ display: this.state.butFlag ? '' : 'none'}} onClick={this.showColCnameModel}>
              {this.state.tbCname+'添加列'}
            </Button>
          </div>
        </Modal> 
         <Modal
          visible={this.state.tbNameListModel}
          onOk={e => this.onOkTbNameListModel(e)}
          onCancel={e=> { this.setState({ tbNameListModel: false, ColCnameModelFlag: 0, listCurrentPageNo: 1 }) }}
          destroyOnClose={true}
          title={`${this.state.tbCname}`}
          >  
            <Table
              loading={loading}
              columns={columns1}
              dataSource={datas}
              rowSelection={rowSelection}
              bordered
              pagination={{
                current:this.state.listCurrentPageNo,
                pageSize:this.state.pageSize,
                total: listTotal,
                onChange: (page, pageSize) => this.handleListTableChange(page, pageSize),
              }}
          />
          </Modal>     
      </div>
    );
  }

  render () {
    return (
        <PageHeaderLayout>
          <Card bordered={false} style={{ overflowY: 'scroll' }} id='top'>
            <div>
              {this.renderForm()}
            </div>
          </Card>
        </PageHeaderLayout>
    );
  }
}
