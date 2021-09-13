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
export default class ExpayrateBusiness extends PureComponent {
  state = {
    loadEcharts: false,
    showPolicy: 'none',
    showInsuranceDate: '',
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'analysis/getModelList',
    });
  }

  handleChangeRadio = (e) => {
    console.log(e.target.value)
  }

  onChangeCheck = (checkedList) => {
    console.log(checkedList)
  }

  getMeasure = () => {
    const {form: {getFieldDecorator}} = this.props;
    const measure = [
      '满期赔付率',
      '对整体赔付率影响',
      '满期出险频度',
      '案均赔款',
      '净费率系数',
      '单均折前保费',
      '跟单净保费',
      '满期净保费',
      '业务占比',
    ];
    const staticformItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    };
    return (
      <div>
        <FormItem {...staticformItemLayout} label='统计指标'>
          {getFieldDecorator('measure', {
            initialValue: [], rules: [{ required: true, message: '必选' }]
          })(
            <CheckboxGroup
              options={measure}
              onChange={this.onChangeCheck}
            />
            )}
        </FormItem>
      </div>
    );
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
        <Card>
          <Business root={this} changeRadio={this.handleChangeRadio.bind(this)}/>
          <Dimensions root={this} />
          {this.getMeasure()}
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
