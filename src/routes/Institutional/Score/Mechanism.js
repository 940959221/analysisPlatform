import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Spin, Button, message, Modal, Input, Collapse, Table, Popconfirm } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const { Panel } = Collapse;

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class Score extends Component{
  constructor(props){
    super(props);
    this.state = {
      columns: [],            // 表头
      dataSource: [],         // 表格数据
      pageSize: 10,           // 显示几条一页
      totalCount: 0,          // 总共有多少条数据
      show: false,            // 按钮是否显示
      name: '',               // 当前正在进行的评级为
    }
  }

  componentDidMount(){
    const columns = [
      {
        title: '上传状态',
        dataIndex: 'state',
        key: 'state',
        width: 80,
        align: 'center'
      },
      {
        title: '所属机构',
        dataIndex: 'company',
        key: 'company',
        width: 120,
        align: 'center'
      },
      {
        title: '机构类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        align: 'center'
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 120,
        align: 'center'
      },
      {
        title: '更新账号',
        dataIndex: 'updateUser',
        key: 'updateUser',
        width: 120,
        align: 'center'
      },
    ];
    this.setState({ columns });
    this.tableData(10, 1, '2');

    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';
  }

  // 表格数据请求
  tableData(pageSize, pageIndex, ratLevel){
    this.props.dispatch({
      type: 'analysis/in_score',
      payload: {
        pageSize,
        pageIndex,
        ratLevel
      }
    }).then(() => {
      const { params: { recordCount, pageSize, ratType, ratTimeSlot }, tOrgRatUploadStatusList } = this.props.analysis.in_scoreData;
      const dataSource = [];
      let show = false, name;
      if(tOrgRatUploadStatusList.length > 0) show = true;
      for(let i of tOrgRatUploadStatusList){
        dataSource.push({
          key: i.companyCode,
          updateTime: i.updatTime,
          state: i.uploadStatus === '1' ? '未上传' : '已上传',
          company: i.companyName,
          type: i.companyType === '1' ? '总公司' : '分公司',
          updateUser: i.updater
        })
      }
      if(ratType === '1') name = '正式评级-' + ratTimeSlot + '年年度';
      else name = '模拟评级-' + ratTimeSlot.split('_')[0] + '年' + ratTimeSlot.split('_')[1] + '季度';

      this.setState({ dataSource, totalCount: recordCount, pageSize, show, name });
    })
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    this.tableData(pageSize, current, '2');
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
      pageSizeOptions: ['10','20','50','100','150','200','300','500','700','1000'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  // 评分计算
  scoring = () => {
    this.props.dispatch({
      type: 'analysis/in_scoreCal',
      url: 'scoreCal3'
    }).then(() => {
      message.success('评级成功！')
    }).catch(e => {
      message.warn(e.message)
    })
  }

  // 一件提醒
  caution = () => {
    
  }

  // 撤销
  del = () => {
    this.props.dispatch({
      type: 'analysis/in_revoke',
      payload: {
        ratLevel: '2'
      }
    }).then(() => {
      message.success('任务撤销成功！')
    }).catch(e => {
      message.warn(e.message)
    })
  }

  // 数据导出
  export = () => {
    const url = `${SERVER}/branch/downlRatInfo3`;
    let TargetFrame = document.createElement("iframe");
    TargetFrame.setAttribute("name", 'download_frame');
    TargetFrame.setAttribute("style", "display:none");
    document.body.appendChild(TargetFrame);
    
    let form = document.createElement("form");
    form.setAttribute("style", "display:none");
    form.setAttribute("target", "download_frame");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);
    form.setAttribute('enctype', 'multipart/form-data');

    let input3 = document.createElement("input");
    input3.setAttribute("type", "hidden");
    input3.setAttribute("name", "fileName");
    input3.setAttribute("value", '');
    form.appendChild(input3);

    document.body.appendChild(form);
    form.submit();
  }

  render(){
    const { columns, dataSource, show, name } = this.state
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{height: '100%'}}>
            <div>
              <h1>得分计算</h1>
              <div style={{height: 40, lineHeight: '40px'}}>当前正在进行的评级为：<span>{name}</span></div>
              <div style={{height: 40, lineHeight: '40px'}}>数据上传情况：</div>
              <Table
                columns={columns}
                // style={{display: tableShow}}
                dataSource={dataSource}
                bordered
                pagination={ this.paginationProps() }
                size="middle"
                scroll={{ x: 540 }}
              />
              <div style={show ? {marginTop: 20} : {display: 'none'}}>
                <Popconfirm
                  title='是否确定撤销当前正在评级的任务'
                  onConfirm={e => this.del(e)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type='primary' style={{marginLeft: 20}}>撤销</Button>
                </Popconfirm>
                <Button type='primary' onClick={ this.export } style={{marginLeft: 20}}>数据导出</Button>
                <Button type='primary' onClick={ this.caution } style={{marginLeft: 20}}>一件提醒</Button>
                <Button type='primary' onClick={ this.scoring } style={{marginLeft: 20}}>评分计算</Button>
              </div>
            </div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    )
  }
}