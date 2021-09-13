import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Pagination, Button, Input, Radio, Collapse, Spin, Select, message } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const Option = Select.Option;
const { Panel } = Collapse;
const { TextArea } = Input;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class CreatRolemanages extends Component {
  state = {
    pageNum: 1,
    pageSize: 10,
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.changeUserPageSize(1, 10);

    // 角色管理点击编辑回显
    const { id } = this.props.location;
    if (id) {
      this.props.dispatch({
        type: 'analysis/qPermissionInfoById',
        payload: {
          permissionId: id
        }
      }).then(() => {
        // 修改数据
        const { qPermissionInfoByIdData: { permissionName, remark, active } } = this.props.analysis;
        this.props.form.setFieldsValue({
          name: permissionName,
          note: remark,
          effect: active
        })
      })
    }
  }

  // 编辑拥有资源分页
  changeUserPageSize = (current, pageSize) => {
    const { id } = this.props.location;
    this.props.dispatch({
      type: 'analysis/qResource',
      payload: {
        pageNum: current,
        pageSize: pageSize,
        permissionId: id ? id : undefined
      }
    }).then(() => {
      const { qResourceData: { list } } = this.props.analysis;
      const checkArr = [];
      // 分页之后，如果当前数据的isCheck为1，说明是有的权限，需要填写上去
      for (let i of list) {
        if (i.isCheck === '1') checkArr.push(i.resourceId);
      }
      this.props.form.setFieldsValue({ jurisdiction: checkArr })
    })
  }

  // 保存
  save = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const note = values.note ? values.note.replace(/</g, '&lt;') : undefined;
      const payload = {
        permissionName: values.name,
        remark: note,
        active: values.effect,
        incResourceIdList: values.jurisdiction
      }
      const { id } = this.props.location;
      const { qResourceData: { list } } = this.props.analysis;
      const delPermissionIdList = [];
      // 根据是否存在id来判定是否为点击编辑后回显过来的数据
      if (id) {
        // 修改需要额外的两个参数
        payload.permissionId = id;
        for (let i of list) {
          if (values.jurisdiction.indexOf(i.resourceId) < 0) delPermissionIdList.push(i.resourceId)
        }
        payload.delResourceIdList = delPermissionIdList;
        this.props.dispatch({
          type: 'analysis/updatePermission',
          payload
        }).then(() => {
          message.success('修改成功！');
        }).catch(e => {
          message.warn(e.message)
        })
      } else {
        this.props.dispatch({
          type: 'analysis/savePermission',
          payload
        }).then(() => {
          message.success('保存成功！');
        }).catch(e => {
          message.warn(e.message)
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { qResourceData: { list, total } } = this.props.analysis;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <h1>新建/编辑权限</h1>
            <Collapse defaultActiveKey={['1', '2', '3', '4']}>
              <Panel header="名称" key="1">
                <FormItem label='输入权限名称' style={{ display: 'flex' }}>
                  {getFieldDecorator('name', {
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Input style={{ width: 150 }}></Input>
                  )}
                </FormItem>
              </Panel>

              <Panel header="权限" key="2">
                <FormItem label='编辑拥有资源' style={{ display: 'flex' }}>
                  {getFieldDecorator('jurisdiction', {
                    initialValue: [],
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{ width: 300 }} mode='multiple'>
                      {list ? list.map(item => {
                        return (
                          <Option key={item.resourceId} value={item.resourceId}>{item.resourceName}</Option>
                        )
                      }) : []}
                    </Select>
                  )}
                </FormItem>
                <Pagination size="small" total={total} showTotal={total => `共 ${total} 条数据`} showSizeChanger showQuickJumper
                  onShowSizeChange={(current, pageSize) => this.changeUserPageSize(current, pageSize)}
                  onChange={(current, pageSize) => this.changeUserPageSize(current, pageSize)} />
              </Panel>

              <Panel header="备注" key="3">
                <FormItem label='备注' style={{ display: 'flex' }}>
                  {getFieldDecorator('note', {})(
                    <TextArea placeholder='请输入' style={{ width: 400 }}></TextArea>
                  )}
                </FormItem>
              </Panel>

              <Panel header="生效" key="4">
                <FormItem label='是否生效' style={{ display: 'flex' }}>
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
