import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, message, Button, Input, Collapse, Spin, Select, Radio } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
const { Panel } = Collapse;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class CreatResources extends Component {
  state = {
    radio: '1',      // 当前选中的资源类型
    disabled: true,  // 输入资源名称是否禁用
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.props.dispatch({
      type: 'analysis/getThemeSelect'
    })

    // 资源管理点击编辑后回显数据
    const { id } = this.props.location;
    if (id) {
      this.props.dispatch({
        type: 'analysis/qResourceInfoById',
        payload: {
          resourceId: id
        }
      }).then(() => {
        const { qResourceInfoByIdData: { resourceName, type, active, remark, themeId, resourceCode } } = this.props.analysis;
        // 统一修改通用部分的数据
        this.props.form.setFieldsValue({
          name: resourceName ? resourceName : '',
          type,
          note: remark ? remark : '',
          effect: active
        })
        switch (type) {
          case '1': {
            // 先利用编辑数据权限中的主题监听事件，传递现在的id发送请求获取指标
            this.changeTheme(themeId, true);
            this.props.form.setFieldsValue({
              dataPermissions: themeId,
              dataMeasures: resourceCode
            })
          }; break;
          case '2': {
            // 如果是选择了url资源，还需要修改state，一定先执行修改state，否则无法渲染出urlPermissions，也就无法修改值
            this.setState({ radio: '2', disabled: false })
            this.props.form.setFieldsValue({
              urlPermissions: resourceCode
            })
          }; break;
        }
      })
    }
  }

  // 修改资源类型
  changeType = (e) => {
    const val = e.target.value;
    let disabled;
    if (val === '1') disabled = true;
    else disabled = false;
    this.props.form.setFieldsValue({ name: '' });
    this.setState({ radio: val, disabled });
  }

  // 指标型资源修改主题
  changeTheme = (e, start) => {
    const appId = e.split('_')[0], themeId = e.split('_')[1];
    this.props.form.setFieldsValue({ dataMeasures: undefined });
    !start && this.props.form.setFieldsValue({ name: undefined });
    this.props.dispatch({
      type: 'analysis/getUserMeasures',
      payload: {
        appId,
        themeId
      }
    })
  }

  // 指标型资源修改指标
  changeMeasure = (e) => {
    const { getUserMeasuresData } = this.props.analysis;
    for (let i of getUserMeasuresData) {
      if (e === i.attrCode) this.props.form.setFieldsValue({ name: i.attrName });
    }
  }

  // 编辑权限部分
  permissions = () => {
    const { radio } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { getThemeSelectData, getUserMeasuresData } = this.props.analysis;
    let dom;
    switch (radio) {
      case '1': {
        dom =
          <div style={{ display: 'flex' }}>
            <FormItem label='编辑数据权限' style={{ display: 'flex' }}>
              {getFieldDecorator('dataPermissions', {
                initialValue: '',
                rules: [{ required: true, message: '必选' }]
              })(
                <Select placeholder='选择主题' style={{ width: 150 }} onChange={this.changeTheme}>
                  {getThemeSelectData.map(item => {
                    return (
                      <Option key={item.ATId} value={item.ATId}>{item.ATName}</Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('dataMeasures', {
                initialValue: '',
                rules: [{ required: true, message: '必选' }]
              })(
                <Select placeholder='选择指标' style={{ width: 150 }} onChange={this.changeMeasure}>
                  {getUserMeasuresData.map(item => {
                    return (
                      <Option key={item.attrCode} value={item.attrCode}>{item.attrName}</Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
          </div>
      }; break;
      case '2': {
        dom =
          <div>
            <FormItem label='编辑URL权限' style={{ display: 'flex' }}>
              {getFieldDecorator('urlPermissions', {
                initialValue: '',
                rules: [{ required: true, message: '必选' }]
              })(
                <TextArea placeholder='请输入url地址' style={{ width: 500 }}></TextArea>
              )}
            </FormItem>
          </div>
      }; break;
    }
    return dom;
  }

  // 保存
  save = () => {
    const { radio } = this.state;
    const { id } = this.props.location;
    this.props.form.validateFields((err, values) => {
      console.log(values);
      if (err) return;
      const note = values.note.replace(/</g, '&lt;');
      const payload = {
        resourceCode: null,
        resourceName: values.name,
        type: values.type,
        remark: note,
        active: values.effect,
        themeId: values.dataPermissions
      }
      switch (radio) {
        case '1': {
          payload.resourceCode = values.dataMeasures
        }; break;
        case '2': {
          const urlPermissions = values.urlPermissions.replace(/</g, '&lt;');
          payload.resourceCode = urlPermissions;
        }; break;
      }
      // 如果id存在，说明是从资源管理点击编辑过来后，回显的数据，所以调用修改接口，否则用新增接口
      if (id) {
        payload.resourceId = id;
        this.props.dispatch({
          type: 'analysis/updResource',
          payload
        }).then(() => {
          message.success('修改成功！');
        }).catch((e) => {
          message.warn(e.message);
        })
      } else {
        this.props.dispatch({
          type: 'analysis/saveResource',
          payload
        }).then(() => {
          message.success('保存成功！');
        }).catch((e) => {
          message.warn(e.message);
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { disabled } = this.state;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <h1>新建/编辑资源</h1>
            <Collapse defaultActiveKey={['1', '2', '3', '4', '5']}>

              <Panel header="名称" key="1">
                <div style={{ display: 'flex' }}>
                  <FormItem label='输入资源名称' style={{ display: 'flex' }}>
                    {getFieldDecorator('name', {
                      initialValue: '',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Input disabled={disabled} style={{ width: 150 }}></Input>
                    )}
                  </FormItem>
                  <div style={{ color: 'red', marginLeft: 15, lineHeight: '40px' }}>*只在类型为url型资源的时候可操作</div>
                </div>
              </Panel>

              <Panel header="类型" key="2">
                <FormItem label='选择资源类型' style={{ display: 'flex', marginRight: 20 }}>
                  {getFieldDecorator('type', {
                    initialValue: '1',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Radio.Group onChange={this.changeType}>
                      <Radio value='1'>指标型资源</Radio>
                      <Radio value='2'>url型资源</Radio>
                    </Radio.Group>
                  )}
                </FormItem>
              </Panel>

              <Panel header="权限" key="3">
                {this.permissions()}
              </Panel>

              <Panel header="备注" key="4">
                <FormItem>
                  {getFieldDecorator('note', {
                    initialValue: '',
                  })(
                    <TextArea placeholder='请输入'></TextArea>
                  )}
                </FormItem>
              </Panel>

              <Panel header="是否生效" key="5">
                <FormItem>
                  {getFieldDecorator('effect', {
                    initialValue: '1',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Radio.Group>
                      <Radio value='1'>是</Radio>
                      <Radio value='0'>否</Radio>
                    </Radio.Group>
                  )}
                </FormItem>
              </Panel>
            </Collapse>
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0' }}>
              <Button type='primary' onClick={this.save}>保存</Button>
            </div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
