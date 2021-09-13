import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, Modal, Pagination, Row, Col, Cascader, message } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Filter from './component/Filter';
import UserModal from './component/UserModal';
import VolumeSetModal from './component/VolumeSetModal';
// import { Link } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class Usermanages extends Component {
  state = {
    addVisibilt: false,       // 新增弹窗是否显示
    volumeVisibilt: false,    // 批量设置弹窗是否显示
    columns: [],              // 表头
    data: [],                 // 表格数据
    totalCount: '',           // 总数
    pageSize: 10,             // 一页几条数据
    pageNum: 1,               // 当前页
    userName: undefined,      // 用户名称
    companycode: undefined,   // Filter组件中的机构代码
    oldCode: undefined,       // 点击查询后保存的companycode的值，在下次查询前不会变化
    // companycode: '',          // 
    id: undefined,            // 点击编辑后保存的当前用户的id
    deleteArr: [],            // UserModal组件中的需要删除的id
  };

  componentDidMount(){
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.setTable({});

    const columns = [
      {
        title: '用户名称',
        dataIndex: 'userName',
        width: 150,
        align: 'center'
      },
      {
        title: '所属机构',
        dataIndex: 'company',
        width: 120,
        align: 'center'
      },
      {
        title: '拥有角色',
        dataIndex: 'userRole',
        width: 150,
        align: 'center'
      },
      {
        title: '操作',
        dataIndex: 'action',
        width: 100,
        align: 'center',
        render: (text, record, index) => {
          return (
            <span>
              <Popconfirm 
                title={"是否对当前用户进行编辑？"} 
                onConfirm={() => this.edit(record)}
                okText="确定" 
                cancelText="取消"
              >
                <a herf='#'>编辑</a>
              </Popconfirm>
            </span>
          );
        }
      },
    ];
    this.setState({ columns })
  }

  // 设置表格数据
  setTable = (payload) =>{
    this.props.dispatch({
      type: 'analysis/qPubUserList',
      payload
    }).then(() =>{
      const { qPubUserListData: { list, total, pageSize, pageNum } } = this.props.analysis;
      const data = [];
      for(let i of list){
        data.push({
          key: i.usercode,
          userName: `${i.usercname}(${i.usercode})`,
          company: i.companyName,
          userRole: i.roleName,
          active: i.usercode
        })
      }
      this.setState({ data, totalCount: total, pageSize, pageNum })
    })
  }

  // 点击编辑
  edit = (e) => {
    (async () => {
      await this.setState({ addVisibilt: true, id: e.key });
      this.UserModal.props.form.setFieldsValue({user: []});
      this.UserModal.changeUserPageSize(1, 10);   // 调用子组件方法
    })()
  }

  // 点击重置
  reset = () => {
    this.props.form.resetFields();
    this.Filter.props.form.resetFields();
  }

  // 点击查询
  query = () => {
    const { pageSize, pageNum, companycode } = this.state;
    const name = this.props.form.getFieldValue('name');
    const oldCode = companycode;    // 使用新变量储存code
    const obj = {
      pageNum,
      pageSize,
      usercname: name,
      companycode
    }
    this.setTable(obj)
    // 在查询的请求发送完之后修改一个值
    this.setState({ userName: name, oldCode });
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    const { userName, oldCode } = this.state;
    const obj = {
      pageNum: current,
      pageSize,
      usercname: userName,
      companycode: oldCode
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
      pageSizeOptions: ['10','20','50','100'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  // 编辑点击确定
  editOk = () => {
    const { id, deleteArr } = this.state;
    const { qRoleData: { list } } = this.props.analysis;
    const checkArr = this.UserModal.props.form.getFieldValue('user');
    const delRoleIdList = [];
    for(let i of list){
      if(checkArr.indexOf(i.roleId) < 0) delRoleIdList.push(i.roleId)
    }
    this.props.dispatch({
      type: 'analysis/updUserRoleList',
      payload: {
        usercode: id,
        delRoleIdList,
        incRoleIdList: checkArr
      }
    }).then(() => {
      message.success('修改成功！');
      this.query();   // 调用query方法，进行重新请求数据
      this.setState({ addVisibilt: false });
    }).catch(e => {
      message.warn(e.message)
    })
  }

  // 点击批量设置
  volumeSet = () => {
    (async () => {
      await this.setState({ volumeVisibilt: true });
      this.VolumeSetModal.getData();    // 调用子组件
    })()
  }

  // 批量设置点击确定，调用子组件方法进行操作
  volumeOk = () => {
    this.VolumeSetModal.volumeOk();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { addVisibilt, volumeVisibilt, columns, data } = this.state;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{height: '100%'}}>
            <h1>用户管理</h1>
            <Form layout="inline" style={{border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center'}}>
              <Row>
                <Col>
                  <FormItem label='用户名称'>
                    { getFieldDecorator('name', {})(
                      <Input placeholder='请输入' style={{width: 200}}></Input>
                    ) }
                  </FormItem>

                  <Filter wrappedComponentRef={(form) => this.Filter = form}
                    getFilter='qCompanyLeveInfo' root={this} label='相关机构' rules={false}></Filter>

                  <div style={{display: 'flex', justifyContent: 'flex-end', margin: '20px 0'}}>
                    <Button style={{marginRight: 15}} type='primary' onClick={this.query}>查询</Button>
                    <Button style={{marginRight: 15}} type='primary' onClick={this.volumeSet}>批量设置</Button>
                    <Button style={{marginRight: 15}} onClick={this.reset}>重置</Button>
                  </div>
                </Col>
              </Row>
            </Form>

            <Table
              columns={columns}
              dataSource={data}
              bordered
              size="middle"
              pagination={ this.paginationProps() }
              scroll={{x: 870}}
            />

            {/* 编辑弹窗 */}
            <Modal
              visible={addVisibilt}
              onOk={() => this.editOk()}
              onCancel={() => this.setState({ addVisibilt: false })}
              title='编辑用户'
            >
              <UserModal wrappedComponentRef={(form) => this.UserModal = form} 
                root={this} label='设置用户角色' rules={false}></UserModal>
            </Modal>

            {/* 批量设置弹窗 */}
            <Modal
              visible={volumeVisibilt}
              onOk={() => this.volumeOk()}
              onCancel={e => this.setState({ volumeVisibilt: false })}
              title='批量设置-根据机构进行批量设置'
            >
              <VolumeSetModal wrappedComponentRef={(form) => this.VolumeSetModal = form} root={this}></VolumeSetModal>
            </Modal>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
