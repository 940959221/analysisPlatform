import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
} from 'snk-web';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

class AddTemplate extends PureComponent {
  render() {
    return (
      <PageHeaderLayout title="新增模板">
        <div>xxx</div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ loading }) => ({
  submitting: loading.effects['form/submitRegularForm'],
}))(Form.create({
  onFieldsChange(props, fields) {
    props.dispatch({
      type: 'user/save',
      payload: fields,
    });
  },
})(AddTemplate));
