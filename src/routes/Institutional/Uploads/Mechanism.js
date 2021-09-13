import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Spin, Button, message, Modal, Input, Collapse, Upload, Icon } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const { Panel } = Collapse;

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class Uploads extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filesName: [],      // 选择的文件名
      files: [],          // 选择的文件
      fileList: [],
      headOffice: '',     // 判定当前用户是否为总公司用户
      companyName: '无',  // 公司名
      time: '无',         // 评级的时间
      upload: '无',       // 上传状态
      complete: '无',     // 上传是否完整
      company: '无',      // 评级类型
      disabled: true,     // 保存并上传按钮是否可用
    }
  }

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.down.addEventListener('mousemove', () => {
      this.down.style.cursor = 'pointer'
    })

    this.props.dispatch({
      type: 'analysis/in_log'
    }).then(() => {
      const string = this.props.analysis.in_logData.HeadComPany;
      let headOffice;
      if (string === '1') headOffice = true;
      else if (string === '2') headOffice = false;
      this.setState({ headOffice })
    })

    this.getText();
  }

  // 获取文字信息请求
  getText = () => {
    this.props.dispatch({
      type: 'analysis/in_task',
      payload: {
        ratLevel: '2'
      }
    }).then(() => {
      const { companyName, ratType, ratTimeSlot, ratStatus, uploadStatus, isComplete, ratLevel } = this.props.analysis.in_taskData;
      let time, upload, complete, company;
      if (ratStatus === '1') {
        if (ratType === '1') time = '正式评级-' + ratTimeSlot + '年年度';
        else time = '模拟评级-' + ratTimeSlot.split('_')[0] + '年' + ratTimeSlot.split('_')[1] + '季度';
        if (ratLevel === '1') company = '分公司评级';
        else company = '三级机构评级';
        if (uploadStatus === '1') upload = '未上传';
        else upload = '已上传';
        if (isComplete === '1') complete = '不完整';
        else complete = '完整';
        this.setState({ time, company, companyName, upload, complete, company, disabled: false })
      }
    })
  }

  // 点击上传附件
  handlechoose = () => {
    this.file.click();
  }

  // 选择了文件后调用
  handleChange = () => {
    const upload = this.file.files;
    const arr = [];
    for (let i in upload) {
      if (upload[i].name) arr.push(upload[i].name)
    }
    arr.splice(-1)
    this.setState({ filesName: arr, files: upload });
  }

  // 点击此处下载模板
  downFile = () => {

    const url = `${SERVER}/branch/files`;
    let postData;
    if (this.state.headOffice) postData = 'Head3Template.xlsx';
    else postData = 'Bran3Template.xlsx';
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
    input3.setAttribute("value", postData);
    form.appendChild(input3);

    document.body.appendChild(form);
    form.submit();
  }

  // 保存并上传
  upload = () => {
    const { fileList, headOffice } = this.state;
    if (fileList.length === 0) {
      message.warn('请先选择文件');
      return;
    }
    this.props.dispatch({
      type: 'analysis/in_upload',
      payload: {
        files: fileList[0],
      },
      name: headOffice ? 'uploadHead3' : 'uploadBranch3'
    }).then(() => {
      message.success('上传成功!');
      this.getText();
    }).catch(e => {
      message.error(e.message)
    })
  }

  render() {
    const { filesName, fileList, headOffice, complete, companyName, time, upload, company, disabled } = this.state;
    const prams = {
      name: 'file',
      action: `${SERVER}/branch/uploadHead2`,
      method: 'post',
      onRemove: (file) => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(({ fileList }) => ({
          fileList: [file],
        }));
        return false
      },
      fileList: fileList,
    };
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <div>
              <h1>{headOffice ? '总' : '分'}公司数据上传</h1>
              <div style={{ height: 40, lineHeight: '40px' }}>您当前所属的部门：<span>{companyName ? companyName : '无'}</span></div>
              <div style={{ height: 40, lineHeight: '40px' }}>您当前正在参与的评级为：
                <span>{time}</span>，评级类型为：
                <span>{company}</span>
              </div>
              <div style={{ height: 40, lineHeight: '40px' }}>您上传的表格需要包含如下数据：</div>
              <div style={{ padding: 10, marginBottom: 20 }}>

                {headOffice ?
                  <div>
                    <div style={{ marginBottom: 20 }}>（1）三级机构加减分项</div>
                  </div> :
                  <div>
                    <div style={{ marginBottom: 20 }}>（1）规模能力指标：包含保费收入、市场份额、市场增速、三级机构增速等</div>
                    <div style={{ marginBottom: 20 }}>（2）盈利能力指标：包含承保盈利、已赚保费、泛保单获取成本率等</div>
                    <div>（2）人力资源效能指标：三级机构后台人均支持保费</div>
                  </div>
                }
                <div style={{ marginTop: 20 }}>
                  <span>请在此处上传表格数据</span>
                  <span style={{ marginLeft: 30 }}>您的数据上传状态为：{upload}</span>
                  <span style={{ marginLeft: 20 }}>上传数据是否完整：{complete}</span>
                </div>
                <div style={{ display: 'flex', marginTop: 20 }}>
                  <div style={{ margin: '0 10px', display: 'flex' }}>
                    {filesName.map((item, index) => {
                      return (
                        <div key={item + index}>
                          <span style={{ color: 'blue', textDecoration: 'underline' }}>{item}</span>
                          <span>{index === filesName.length - 1 ? '' : '、'}</span>
                        </div>
                      )
                    })}
                  </div>
                  <Upload {...prams} accept=".xls,.xlsx">
                    <Button style={{ width: 110 }}>
                      <Icon type="upload" />上传文件
                        </Button>
                  </Upload>

                  <div>（仅支持xls格式，
                    <span ref={down => this.down = down} onClick={this.downFile} style={{ color: 'rgb(0,136,204)' }}>点击此处下载模板</span>）
                  </div>
                </div>
              </div>
              <Button type='primary' onClick={this.upload} disabled={disabled}>保存并上传</Button>
            </div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    )
  }
}