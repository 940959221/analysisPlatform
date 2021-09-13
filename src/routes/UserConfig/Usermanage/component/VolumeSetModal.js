import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, message, Select} from 'snk-web';
import Filter from './Filter';
import UserModal from './UserModal';

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class Usermanages extends Component {
  state = {
    id: '',
    companycode: undefined
  };

  // 父组件调用该方法，再通过方法调用子组件
  getData = () =>{
    this.UserModal.changeUserPageSize(1, 10);
  }

  // 父组件调用该方法，批量设置弹窗点击确定的时候
  volumeOk = () => {
    this.Filter.props.form.validateFields((err1, values1) => {
      if(err1) return;
      this.UserModal.props.form.validateFields((err2, values2) => {
        if(err2) return;
        this.props.dispatch({
          type: 'analysis/addCompanyRole',
          payload: {
            companyCode: this.state.companycode,
            roleList: values2.user
          }
        }).then(() => {
          message.success('设置成功！');
          this.props.root.setState({ volumeVisibilt: false })
        }).catch(e => {
          message.warn(e.message)
        })
      })
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { qRoleData: { list, total } } = this.props.analysis;
    return (
      <div>
        <Filter getFilter='qCompanyLeveInfo' 
          wrappedComponentRef={(form) => this.Filter = form} 
          root={this} label='选择要批量设置的机构员工'
          rules={true}
          useStyle={true}></Filter>
        <UserModal wrappedComponentRef={(form) => this.UserModal = form} 
          root={this} label='选择要进行批量设置的角色'
          rules={true}></UserModal>
      </div>
    );
  }
}
