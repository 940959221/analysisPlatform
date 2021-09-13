import React, { Component, PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Input, Button, Card, Popconfirm, message, Table, Divider, Spin, Tree, Modal } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';

const { TreeNode } = Tree;
const { Search } = Input;
const FormItem = Form.Item;

const userSvg = <svg t="1582528622840" className="icon" style={{ width: 20, height: 20 }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1190" width="200" height="200"><path d="M625.683 746.667c-14.139 0-25.6-11.462-25.6-25.6 0-14.139 11.461-25.6 25.6-25.6h170.666c14.139 0 25.6 11.461 25.6 25.6 0 14.138-11.461 25.6-25.6 25.6H625.683z m59.733-110.934c0-14.138 11.461-25.6 25.6-25.6 14.138 0 25.6 11.462 25.6 25.6V806.4c0 14.138-11.462 25.6-25.6 25.6-14.139 0-25.6-11.462-25.6-25.6V635.733zM488.05 470.561c20.53-5.32 41.485 7.011 46.804 27.541 5.32 20.53-7.011 41.485-27.541 46.804-170.981 44.3-269.3 127.283-300.987 249.736-6.494 25.094 8.585 50.701 33.678 57.195a46.933 46.933 0 0 0 11.758 1.496h249.862c21.207 0 38.4 17.193 38.4 38.4 0 21.208-17.193 38.4-38.4 38.4H251.763a123.733 123.733 0 0 1-30.998-3.945c-66.156-17.12-105.909-84.63-88.79-150.786 39.382-152.185 160.085-254.061 356.076-304.841z m9.632 75.572c-115.465 0-209.067-93.602-209.067-209.066C288.616 221.602 382.218 128 497.683 128c115.464 0 209.066 93.602 209.066 209.067 0 115.464-93.602 209.066-209.066 209.066z m0-76.8c73.048 0 132.266-59.217 132.266-132.266 0-73.05-59.218-132.267-132.266-132.267-73.05 0-132.267 59.218-132.267 132.267 0 73.049 59.218 132.266 132.267 132.266z m213.333 456.534c-113.108 0-204.8-91.692-204.8-204.8 0-113.108 91.692-204.8 204.8-204.8 113.108 0 204.8 91.692 204.8 204.8 0 113.108-91.692 204.8-204.8 204.8z m0-68.267c75.405 0 136.533-61.128 136.533-136.533 0-75.406-61.128-136.534-136.533-136.534-75.405 0-136.533 61.128-136.533 136.534 0 75.405 61.128 136.533 136.533 136.533z" p-id="1191" fill="#1afa29"></path></svg>
const del = <svg t="1582531606950" className="icon" style={{ width: 20, height: 20 }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3741" width="200" height="200"><path d="M767.232384 286.013793H649.173013v-49.127436c0-10.823388-8.827586-19.650975-19.650974-19.650975H393.710345c-10.823388 0-19.650975 8.827586-19.650975 19.650975v49.127436H256.076762c-10.823388 0-19.650975 8.827586-19.650975 19.650975 0 10.823388 8.827586 19.650975 19.650975 19.650974h20.725637l47.822489 429.02069c3.30075 29.86027 28.555322 52.428186 58.569115 52.428186h256.767616c30.013793 0 55.268366-22.567916 58.569116-52.428186l47.822488-429.02069h20.725638c10.823388 0 19.650975-8.750825 19.650974-19.650974 0.153523-10.823388-8.674063-19.650975-19.497451-19.650975z m-353.871065-29.476462h196.509745v29.476462h-196.509745v-29.476462zM659.535832 749.961019c-1.074663 9.97901-9.518441 17.501649-19.497451 17.50165H383.270765c-9.97901 0-18.422789-7.522639-19.497452-17.50165l-47.361919-424.645277H706.974513L659.535832 749.961019z m-88.966717-48.283058c10.823388 0 19.650975-8.827586 19.650975-19.650974V393.556822c0-10.823388-8.827586-19.650975-19.650975-19.650975s-19.650975 8.827586-19.650974 19.650975v288.546926c0 10.823388 8.827586 19.574213 19.650974 19.574213z m-108.080359 0c10.823388 0 19.650975-8.827586 19.650974-19.650974V393.556822c0-10.823388-8.827586-19.650975-19.650974-19.650975-10.823388 0-19.650975 8.827586-19.650975 19.650975v288.546926c0 10.823388 8.827586 19.574213 19.650975 19.574213z m0 0" p-id="3742"></path></svg>

@connect(({ analysis, loading, umssouserinfo, global }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
  global
}))
@Form.create()

export default class PublicMode extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modelVisible: false,         // 添加用户弹窗是否显示
      getUser: false,              // 获取用户弹窗是否显示
      userCheck: [],               // 复选框选中的用户数组
      columns: [],                 // 表格头部
      leftShow: false,             // 左侧列表是否显示
      treeNode: [],                // 用户储存列
      newNode: [],                 // 查询过滤后新的用户储存列
      searchValue: '',             // 用于查询时候的高亮显示
      dataSource: [],              // 表格数据
      data: [],                    // 当前可见所有菜单子项的中文名称
      disabled: true,              // 返回个人模板数据按钮是否可操作
      pageNum: '',                 // 当前页数
      pageSize: '',                // 当前页总数
      total: '',                   // 表格数据总额
      payload: {},                 // 发起请求的参数对象
      query: false,                // 判定返回个人模板数据显示隐藏
      companyName: null,
      companyCode: null,
    }
  }

  componentDidMount() {
    if (this.add !== undefined) {
      this.add.addEventListener('mousemove', () => {
        this.add.style.cursor = 'pointer';
      });
    }

    setTimeout(() => {
      document.querySelector('.ant-card-body').style.height = '100%';
      document.querySelector('.ant-spin-nested-loading').style.height = '100%';
      document.querySelector('.ant-spin-container').style.height = '100%';
      const height = parseInt(window.getComputedStyle(this.top).height);
      this.bottom.style.height = `calc(100% - ${height}px)`;
    })

    this.getTableData(null, null, true);
    const columns = [
      {
        title: '机构名称',
        dataIndex: 'companyName',
        key: 'companyName',
        width: 200,
        align: 'center',
      },
      {
        title: '应用名称',
        dataIndex: 'appName',
        key: 'appName',
        width: 200,
        align: 'center',
      },
      {
        title: '主题名称',
        dataIndex: 'themeName',
        key: 'themeName',
        width: 200,
        align: 'center',
      },
      {
        title: '编辑人员',
        dataIndex: 'man',
        key: 'man',
        width: 200,
        align: 'center',
      }, {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        width: 100,
        render: (text, record, index) => {
          // text中存储了整个数据的对象，后端返回的该数据皆可获取
          const { routerData } = this.props;
          console.log(routerData);
          console.log(record);
          console.log(text);


          const { isDelete, company, companyName } = text;
          let url;
          for (let i in routerData) {
            let routerName;
            if (record.themeName !== '') routerName = record.themeName;
            else routerName = record.appName;
            if (routerData[i].name === routerName) url = i;
          }
          return (
            <span>
              <Link to={{ pathname: url, manaIscommon: isDelete, company_: company, companyName_: companyName }}>查看</Link>
              {isDelete === '1' ?
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
                </span> : null
              }
            </span>
          );
        }
      }];
    this.setState({ columns })
  }

  // 获取表格数据
  getTableData = (companyName, company, change, query, obj) => {
    // 发起请求
    const { getUserDictionData: { authType }, menuDataAll } = this.props.global;
    if (authType === '0') this.setState({ leftShow: true });
    const payload = {
      authType,
      initialParameter: 'a',
      allAppTheName: this.props.global.menuData,
      iscommon: '1',
    };
    // 根据参数不一样，修改传参对象
    if (companyName) payload.companyName = companyName;
    if (company) payload.company = company;
    if (companyName || company) payload.iscommon = '0';
    if (!companyName && !companyCode) this.setState({ companyName: null, companyCode: null })

    // 这里新增一个右侧表格分页的情况，如果有提供参数对象obj，则使用，否则参数使用上面配好的payload
    this.props.dispatch({
      type: 'analysis/publicQuery',
      payload: obj ? obj : payload
    }).then(() => {
      const { mans, templateList, pageNum, pageSize, total } = this.props.analysis.publicQueryData;
      const dataSource = [];
      for (let i in templateList) {
        dataSource.push({
          key: Number(i) + 1,
          companyName: templateList[i].companyName,
          appName: templateList[i].appName,
          themeName: templateList[i].themeName,
          man: templateList[i].man,
          action: templateList[i]
        })
      }
      this.setState({ dataSource, pageNum, pageSize, total, payload, query })
      if (change) this.setState({ treeNode: mans })    // 判定是否需要修改左侧用户列表，这里只在初始化时修改，不然右边进行操作会重置左边
      if (query) this.setState({ disabled: false })
      else this.setState({ disabled: true })
    }).catch(res => {
      message.warn(res.message)
    })
  }

  // 点击复选框触发
  onCheck = (e) => {
    this.setState({ userCheck: e })
  }

  // 添加用户点击确定
  onOkModel = () => {
    this.props.dispatch({
      type: 'analysis/publicName',
      payload: {
        man: this.input.input.value
      }
    }).then(() => {
      const { useerName } = this.props.analysis.publicNameData;
      this.props.dispatch({
        type: 'analysis/public_user',
        payload: {
          man: this.input.input.value,
          userName: useerName
        }
      }).then(() => {
        message.success('添加成功！');
        const obj = { man: this.input.input.value, userName: useerName };
        this.setState({ modelVisible: false, treeNode: [obj, ...this.state.treeNode] })
      }).catch(e => {
        message.warn(message.warn(e.message))
      })
    }).catch(e => {
      message.warn(message.warn(e.message))
    })
  }

  // 点击删除
  del = () => {
    const { userCheck, treeNode } = this.state;
    const mans = [];
    for (let i of userCheck) {
      mans.push(i.split('+')[1])
    }
    if (userCheck.length === 0) return;
    this.props.dispatch({
      type: 'analysis/publicDelete',
      payload: {
        mans
      }
    }).then(() => {
      message.success('删除成功！');
      const delNode = [];
      for (let i of treeNode) {
        for (let j of mans) {
          if (i.man !== j) delNode.push(i);
        }
      }
      this.setState({ treeNode: delNode });
    })
  }

  // 用户模糊查询
  onChange = e => {
    const { value } = e.target;
    if (value === '') {
      this.setState({ newNode: [], searchValue: value, });
      return;
    }
    const { treeNode } = this.state;
    const newNode = [];
    treeNode.map(item => {
      const titleName = item.userName + '-' + item.man;
      if (titleName.indexOf(value) > -1) {
        newNode.push(item);
      }
    })
    this.setState({
      newNode,
      searchValue: value,
    });
  };

  // 获取用户点击确定
  onUserModel = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.props.dispatch({
        type: 'analysis/publicQuery',
        payload: {
          authType: this.props.global.getUserDictionData.authType,
          initialParameter: values.eng.toLowerCase()
        }
      }).then(() => {
        this.setState({ getUser: false, treeNode: this.props.analysis.publicQueryData.mans })
      })
    })
  }

  // 查找
  queryTable = () => {
    const { companyName, companyCode } = this.props.form.getFieldsValue();
    if (!companyName && !companyCode) {
      message.warn('请先填写机构名称或机构码！');
      return;
    }
    this.setState({ companyName, companyCode });
    this.getTableData(companyName, companyCode, false, true)
  }

  // 删除模板
  onDelete = (record) => {
    const { action: { appId, themeId }, key } = record;
    let { dataSource } = this.state;
    this.props.dispatch({
      type: 'analysis/publicDel',
      payload: {
        man: record.man,
        appId,
        themeId
      }
    }).then(() => {
      message.success('删除成功！');
      dataSource = dataSource.filter(item => item.key !== key);
      this.setState({ dataSource });
    })
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    // 这里的两个状态是使用上次请求的对象，query用于判定是否disabled返回个人模板数据按钮
    const { payload, query, companyName, companyCode } = this.state;
    payload.pageNum = current;
    payload.pageSize = pageSize;
    this.getTableData(companyName, companyCode, false, query, payload)
  }

  // 表格的分页信息
  paginationProps = () => {
    const { total, pageSize, pageNum } = this.state;
    const paginationProps = {
      pageSize,
      showSizeChanger: true,
      size: 'large',
      onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
      onChange: (current, pageSize) => this.changePageSize(pageSize, current),
      showTotal: () => `共${total}条数据`,
      total,
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  render() {
    const { userCheck, columns, modelVisible, searchValue, newNode, treeNode, getUser, leftShow, dataSource, disabled } = this.state;
    const { getFieldDecorator } = this.props.form;
    let delTitle;
    switch (userCheck.length) {
      case 0: delTitle = '请选择要删除的用户'; break;
      case 1: delTitle = `请确定是否要删除[${userCheck[0].split('+')[0]}]？`; break;
      default: delTitle = '请确定是否要删除选择的所有用户'; break;
    }
    // 该函数用于查询
    const loop = data =>
      data.map((item, ind) => {
        const titleName = item.userName + '-' + item.man;
        const index = titleName.indexOf(searchValue);
        const beforeStr = titleName.substr(0, index);
        const afterStr = titleName.substr(index + searchValue.length);
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span style={{ color: '#f50' }}>{searchValue}</span>
              {afterStr}
            </span>
          ) : (
              <span>{titleName}</span>
            );
        return <TreeNode key={item.userName + '+' + item.man} title={title} />;
      });
    return (
      <PageHeaderLayout>
        <div style={{ display: 'flex', height: '100%' }}>
          {leftShow ?
            <Card style={{ height: '100%' }}>
              <Spin spinning={this.props.loading}>
                <div ref={e => this.top = e}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div ref={e => this.add = e} style={{ display: 'flex', alignItems: 'center' }}
                      onClick={() => this.setState({ modelVisible: true })}>{userSvg}
                      <div>&nbsp;添加用户</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Popconfirm
                        title={delTitle}
                        onConfirm={e => this.del(e)}
                        okText="确定"
                        cancelText="取消"
                      >
                        {del}
                      </Popconfirm>
                    </div>
                  </div>
                  <Search style={{ marginBottom: 8 }} placeholder="可对下列用户进行模糊查询并过滤" onChange={this.onChange} />
                  <Button type='primary' onClick={() => this.setState({ getUser: true })}>获取用户</Button>
                </div>
                <div ref={e => this.bottom = e} style={{ overflow: 'auto', paddingBottom: 10 }}>
                  <Tree
                    checkable
                    defaultExpandAll
                    onCheck={this.onCheck}
                  >
                    {loop(newNode.length > 0 ? newNode : treeNode)}
                  </Tree>
                </div>
              </Spin>
            </Card> : null
          }

          <Card style={{ overflowY: 'scroll', flex: 1, height: '100%' }}>
            <Spin spinning={this.props.loading}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <h2>常用默认模板</h2>
                <div>
                  <div style={{ color: '#f5222d' }}>*机构名称和机构码可只填一个或者都填，点击查找可以查询公共模板</div>
                  <Button type='primary' disabled={disabled} onClick={() => this.getTableData(null, null, false)}
                    style={{ marginRight: 20 }}>返回个人模板数据</Button>
                  {getFieldDecorator('companyName', {})(
                    <Input placeholder='输入机构名称' style={{ width: 200, marginRight: 20 }}></Input>
                  )}
                  {getFieldDecorator('companyCode', {})(
                    <Input placeholder='输入机构码' style={{ width: 200, marginRight: 20 }}></Input>
                  )}
                  <Button type='primary' onClick={this.queryTable}>查找</Button>
                </div>
              </div>
              <Table
                columns={columns}
                dataSource={dataSource}
                bordered
                size="middle"
                pagination={this.paginationProps()}
              />
            </Spin>
          </Card>
        </div>
        <Modal
          visible={modelVisible}
          onOk={e => this.onOkModel(e)}
          onCancel={e => { this.setState({ modelVisible: false }) }}
          title='添加用户'
        >
          <div><span>用户域名</span><Input ref={e => this.input = e} style={{ width: '60%', marginLeft: 10 }} /></div>
        </Modal>
        <Modal
          visible={getUser}
          onOk={e => this.onUserModel(e)}
          onCancel={e => { this.setState({ getUser: false }) }}
          title='获取用户'
        >
          <div>
            <div>输入一个a~z英文字母，查询以该字母开头的所有用户，不区分大小写</div>
            <FormItem>
              {getFieldDecorator('eng', {
                rules: [{
                  required: true,
                  pattern: new RegExp(/^[a-zA-Z]*$/, "g"),
                  message: '请输入正确的内容'
                }]
              })(
                <Input maxLength='1' style={{ width: '60%', marginLeft: 10 }} />
              )}
            </FormItem>
          </div>
        </Modal>
      </PageHeaderLayout>
    )
  }
}