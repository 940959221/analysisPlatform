import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, List, Button } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';


@connect(({ analysis, loading, umssouserinfo }) => ({
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()
export default class OperationManual extends Component {
  state = {

  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.props.dispatch({
      type: 'analysis/getFileList'
    })
  }

  // 下载
  downLoad = value => {
    const url = `${SERVER}/docDownload/downloadLocal`;

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
    input3.setAttribute("name", "filename");
    input3.setAttribute("value", value);
    form.appendChild(input3);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  render() {
    const { getFileListData } = this.props.analysis;

    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <List
              size="large"
              header={<h2 style={{ fontWeight: 'bold' }}>操作手册</h2>}
              bordered
              dataSource={getFileListData}
              renderItem={item =>
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{item.chinaName}</span>
                    <Button type='primary' onClick={() => this.downLoad(item.name)}>下载</Button>
                  </div>
                </List.Item>}
            />
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
