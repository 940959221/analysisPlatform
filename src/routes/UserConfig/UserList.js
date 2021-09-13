import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Form, Col, Row, Divider, Input, Modal, Button, Popconfirm, Table, Card, message} from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const { TextArea } = Input;
const Search = Input.Search;

@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine,
}))
@Form.create()
export default class UserList extends PureComponent {
  state = {
    addGroupModel: false,
    currentPageNo: 1,
    notInDatacurrentPageNo: 1,
    pageSize: 5,
    domainModel: false,
    groupId: '',
    searchName: '',
    flag: '0',
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
    }).catch(res => {
      message.warn(res.message);
    })
  }

  // 添加群组
  addGroup = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      const groupName = values.groupName;
      const groupDesc = values.groupDesc;

      this.props.dispatch({
        type: 'mine/addGroup',
        payload: {
          groupName,
          groupDesc,
        },
      }).then(()=>{
        this.setState({ addGroupModel: false });
      }).catch(res => {
        message.warn(res.message);
      })
    });
  }

  onSearch = (value) => {
    this.setState({ searchName: value, flag: '1', currentPageNo: 1, notInDatacurrentPageNo: 1 });
    this.groupByUser(1,5,value)
    this.notInByGroupData(1,5,value)
  }

  groupByUser = (currentPageNo,pageSize,keyword) => {
    this.props.dispatch({
      type: 'mine/getGroupByUser',
      payload: {
        currentPageNo,
        pageSize,
        keyword,
      }
    }).then(()=>{
    }).catch((e) => {
      message.warn(e.message)
    });
  }
  

  notInByGroupData = (currentPageNo,pageSize,keyword) => {
    this.props.dispatch({
      type: 'mine/getAllGroupNotInByPage',
      payload: {
        currentPageNo,
        pageSize,
        keyword,
      }
    }).then(()=>{
      const {getAllGroupNotInByPageData} = this.props.mine;
    }).catch((e) => {
      message.warn(e.message)
    });
  }

  showDomainModal = (record) => {
    this.setState({ domainModel: true, groupId: record.groupId });
  }

  onOkDomainModel = () => {
    // e.preventDefault();
    const domain = document.getElementById('domain').value;
    this.props.dispatch({
      type: 'mine/addUserGroup',
      payload: {
        groupId: this.state.groupId,
        domain,
      },
    }).then(()=>{
      this.setState({ domainModel: false });
    }).catch(res => {
      message.warn(res.message);
    })
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

  handleNotInDataTableChange = (page, pageSize) => {
    this.setState({
      notInDatacurrentPageNo: page,
      pageSize: pageSize,
      selectedRowKeys: [],
      selectedRows: [],
    });
    this.notInByGroupData(page,pageSize,this.state.searchName)
  }

  deleteUser = (record) => {
    this.props.dispatch({
      type: 'mine/deleteUserGroup',
      payload: {
        domain: this.state.searchName,
        groupId: record.groupId,
      }
    }).then(()=>{
      this.groupByUser(this.state.currentPageNo,this.state.pageSize,this.state.searchName);
      this.notInByGroupData(this.state.page,this.state.pageSize,this.state.searchName);
    }).catch(res => {
      message.warn(res.message);
    })
  }

  addUser = (record) => {
    this.props.dispatch({
      type: 'mine/addUserGroup',
      payload: {
        groupId: record.groupId,
        domain: this.state.searchName,
      },
    }).then(()=>{
      this.groupByUser(this.state.notInDatacurrentPageNo,this.state.pageSize,this.state.searchName);
      this.notInByGroupData(this.state.page,this.state.pageSize,this.state.searchName);
    }).catch(res => {
      message.warn(res.message);
    })
  }

  deleteAll = () => {
    this.props.dispatch({
      type: 'mine/deleteUserGroup',
      payload: {
        domain: this.state.searchName,
      }
    }).then(()=>{
       this.groupByUser(this.state.currentPageNo,this.state.pageSize,this.state.searchName);
      this.notInByGroupData(this.state.page,this.state.pageSize,this.state.searchName);
    }).catch(res => {
      message.warn(res.message);
    })
  }
 
  renderForm () {
    const {form: { getFieldDecorator, getFieldValue, loading }, 
      mine: {getGroupByUserData, getAllGroupNotInByPageData, findAllGroupData}} = this.props;
    let data, groupNotInData;
    if (findAllGroupData.list !== undefined) {
      data = findAllGroupData.list.length > 0 ? findAllGroupData.list : [];
    } else {
      data = [];
    }
    if (getAllGroupNotInByPageData.list !== undefined) {
      groupNotInData = getAllGroupNotInByPageData.list.length > 0 ? getAllGroupNotInByPageData.list : [];
    } else {
      groupNotInData = [];
    }

    let total;
    if (findAllGroupData.totalRecordCount !== undefined) {
      total = findAllGroupData.totalRecordCount;
    } else {
      total = 0;
    }
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
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            render: (text, record, index) => { // 用户授权 
                return (
                  this.state.flag === '0' ?
                  <Button onClick={e=>this.showDomainModal(record)}>{'用户授权'}</Button>
                  :  <Button onClick={e=>this.deleteUser(record)}>{'取消授权'}</Button>
                );
            }
        }
    ];

    const columns1 = [
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
            title: '操作',
            dataIndex: 'action',
            align: 'center',
            render: (text, record, index) => { // 用户授权 
                return (
                 <Button onClick={e=>this.addUser(record)}>{'确定授权'}</Button>
                );
            }
        }
    ];

    return(
      <div>
        <div style={{ textAlign: 'center' }}>
          <Search
            placeholder="请输入用户域名"
            enterButton="查找"
            size="large"
            onSearch={this.onSearch}
            style={{ width: '40%', margin: '20px 0'}}
          />
        </div>
          <div style={{ display: this.state.flag === '1' ? 'block' : 'none', padding: '10px 0' }}>
            <span>当前列表是<span>[{`${this.state.searchName}`}]</span>的权限操作列表</span>
          </div>
          <Table
              loading={loading}
              columns={columns}
              dataSource={data}
              pagination={{
              current:this.state.currentPageNo,
              pageSize:this.state.pageSize,
              total: total,
              onChange: (page, pageSize) => this.handleTableChange(page, pageSize),
            }}
              bordered
            title={() => {
              return this.state.flag === '1' ? 
              <Button style={{ textAlign: 'left' }} type='primary' onClick={this.deleteAll}>删除<span>[{`${this.state.searchName}`}]</span>的所有权限</Button>
              : ''
            }}
          />
          <Table
              style={{ display: this.state.flag === '0' ? 'none' : '' }}
              loading={loading}
              columns={columns1}
              dataSource={groupNotInData}
              pagination={{
              current:this.state.notInDatacurrentPageNo,
              pageSize:this.state.pageSize,
              total: total,
              onChange: (page, pageSize) => this.handleNotInDataTableChange(page, pageSize),
            }}
              bordered
          />
        <Modal
          visible={this.state.domainModel}
          onOk={e => this.onOkDomainModel(e)}
          onCancel={e=> { this.setState({ domainModel: false }) }}
          destroyOnClose={true}
          title={'添加域名'}
          >  
            <TextArea placeholder="输入多个域名请用英文逗号隔开" autosize id={'domain'} />
          </Modal>
        </div>
    );
  }
  // linhao3@sinosafe.com.cn
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
