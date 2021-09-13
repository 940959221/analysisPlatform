import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Card, Checkbox, Spin, Button } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Business from './components/Business';
import Dimensions from './components/Dimensions';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class HistoryPayrateClaim extends PureComponent {
  state = {
    loadEcharts: false,
    showPolicy: false,          // 是否显示保单年度
    showInsuranceDate: false,
    showBusiness: 'none',       // 分析维度选择的形式
    showFlow: '',               // 分析维度选择的形式
    institutions: true,         // 是否显示机构
  }
  componentDidMount() {
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';
  }

  onChangeRadio = (value) => {
    console.log(value)
  }

  // 生成图表
  submit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return;

    });
  }

  render() {
    return (
      <PageHeaderLayout>
        <Card style={{height: '100%'}}>
          <Business root={this} />
          <Dimensions root={this} />
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={e=>this.submit(e)}>生成图表</Button>
          </div>
          <Spin spinning={this.state.loadEcharts}>
            <div id='showEcharts'/>
          </Spin>
        </Card>
      </PageHeaderLayout>
    );
  }
}
