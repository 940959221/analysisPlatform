import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Button, Card, Select, Upload, Icon, message, Modal } from 'snk-web';
import { Link } from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine,
}))
@Form.create()
export default class UploadFile extends PureComponent {

  state = {
    fileList: [],
    selectItem: '',
    alertVisible: false,
    timer: 30,
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'mine/getTargetTables'
    }).then(() => {
      const { getTargetTablesData } = this.props.mine;
    });
  }

  submitForm = (e) => {
    e.preventDefault();
    if (this.state.fileList.length !== 1) {
      message.info('请选择上传的文件');
      return;
    }
    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({ alertVisible: true, timer: 30, })
      const time = setInterval(function () {
        var timer = this.state.timer;
        timer -= 1;
        if (timer < 1) {
          this.setState({
            alertVisible: false
          });
          timer = 0;
          clearInterval(time);
        }
        this.setState({ timer, });
      }.bind(this), 1000);
      if (values.selectItem === '' || values.selectItem === undefined) {
        return;
      } else {
        console.log(values);
        const entity = values.selectItem.split('-')[0];
        const listener = values.selectItem.split('-')[1];
        const tableName = values.selectItem.split('-')[2];
        const importHive = values.selectItem.split('-')[3];
        console.log(this.state.fileList[0])
        this.props.dispatch({
          type: 'mine/uploadFile',
          payload: {
            entity,
            listener,
            tableName,
            importHive,
            file: this.state.fileList[0],
          }
        }).then(() => {
          this.setState({ fileList: [], });
          this.props.form.setFieldsValue({ selectItem: '', });
        }).catch((e) => {
          message.warn(e.message, 2);
        });
      }

    });
  }

  selectItem = (value) => {
    this.setState({ selectItem: value });
  }

  // 下载
  downLoad = () => {
    console.log(SERVER);
    this.props.form.validateFields((err, values) => {
      if (err) return;

      const url = `${SERVER}/iap/import/downLoad`;
      let postData = values.selectItem.split('-')[4];

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
      input3.setAttribute("name", "tableName");
      input3.setAttribute("value", postData);
      form.appendChild(input3);

      document.body.appendChild(form);
      form.submit();
    })
  }

  render() {
    const { loading, form: { getFieldDecorator, getFieldValue } } = this.props;
    const { getTargetTablesData } = this.props.mine;

    const optionArr = [];
    if (getTargetTablesData.length > 0) {
      getTargetTablesData.map((i) => {
        const list = (
          <Option key={i.listener} value={i.entity + '-' + i.listener + '-' + i.tableName + '-' + i.importHive + '-' + i.tableCname}>{i.tableCname}</Option>
        );
        optionArr.push(list);
      });
    }

    const prams = {
      // showUploadList: true,
      action: '',
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
      beforeUpload: (file) => {
        this.setState(({ fileList }) => ({
          fileList: [file],
          alertVisible: false,
          timer: 30,
        }));
        //       this.timer = setInterval(function () {
        //         var timer = this.state.timer;
        //         timer -= 1;
        //         if (timer < 1) {
        //           this.setState({
        //             alertVisible: false
        //           });
        //           timer = 0;
        // 　　　　　　clearInterval(this.timer);
        //         }
        //         this.setState({ timer,});
        //       }.bind(this), 1000);
        return false;
      },
      fileList: this.state.fileList,
    }

    return (
      <Card>
        <div style={{ padding: '20px 80px' }}>
          <Form onSubmit={e => this.submitForm(e)} layout="inline" encType="multipart/form-data">
            <FormItem label='生成插入表'>
              {getFieldDecorator('selectItem', {
                initialValue: '',
                rules: [{ required: true, message: '必选' }]
              })(
                <Select style={{ width: 200, marginRight: 8 }} allowClear onSelect={this.selectItem}>
                  {optionArr.length > 0 ? optionArr.map(i => { return i }) : ''}
                </Select>
              )}
            </FormItem>
            <span style={{ margin: '10px 2px 0 0', display: 'inline-block' }}>数据导入：</span>
            <FormItem label="">
              <Upload {...prams}>
                <Button style={{ width: 110 }}>
                  <Icon type="upload" />上传文件
                    </Button>
              </Upload>
            </FormItem>
            <FormItem>
              <Button type='primary' htmlType="submit">提交</Button>
              <Button type='primary' style={{ marginLeft: 15 }} onClick={this.downLoad}>下载</Button>
            </FormItem>
          </Form>
          <Modal
            title={`处理提示：正在解析上传数据，请稍等${this.state.timer}s。`}
            footer={null}
            visible={this.state.alertVisible}
            maskClosable={false}
            closable={false}
          />
          {/* <p>{this.state.modalType}{this.state.resCode == "0" ? `成功。` :`失败。` }</p>
          </Modal> */}
        </div>
      </Card>
    );
  }
}
