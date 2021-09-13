import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, message } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class Dictionary extends Component {
  state = {
    defiData: [],
    edit: '0'
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    this.props.dispatch({
      type: 'analysis/getMeasureList'
    })
  }

  query = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;

      this.props.dispatch({
        type: 'analysis/getMeasureDefi',
        payload: {
          attrName: values.measure
        }
      }).then(async () => {
        const { getMeasureDefiData: { dMeasures, edit } } = this.props.analysis;
        const { setFieldsValue } = this.props.form;
        await this.setState({ defiData: dMeasures, edit });
        for (let i in dMeasures) {
          const { define, formula, remarks } = dMeasures[i];
          setFieldsValue({ ['define' + i]: define })
          setFieldsValue({ ['formula' + i]: formula })
          setFieldsValue({ ['remarks' + i]: remarks })
        }
      }, err => {
        message.error(err.message);
      })
    })
  }

  save = () => {
    const values = this.props.form.getFieldsValue();
    const { getMeasureDefiData: { dMeasures } } = this.props.analysis;
    const length = dMeasures.length;
    const dmMeasures = [];

    for (let i = 0; i < length; i++) {
      dmMeasures.push({
        urlId: dMeasures[i].urlId,
        attrCode: dMeasures[i].attrCode,
        define: values['define' + i] ? values['define' + i] : '',
        formula: values['formula' + i] ? values['formula' + i] : '',
        remarks: values['remarks' + i] ? values['remarks' + i] : ''
      })
    }
    this.props.dispatch({
      type: 'analysis/updMeasureDefi',
      payload: {
        dmMeasures
      }
    }).then(() => {
      message.success('保存成功！');
    }, err => {
      message.error(err.message);
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { getMeasureListData } = this.props.analysis;
    const { defiData, edit } = this.state;
    const wrapperCol = {
      xs: { span: 24, offset: 0 },
    }
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <Form layout="inline" style={{ textAlign: 'center' }}>
              <FormItem label='查询标签'>
                {getFieldDecorator('measure', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 200 }}
                    showSearch
                    optionLabelProp="children"
                    filterOption={(input, option) => option.props.children.indexOf(input) >= 0}>
                    {getMeasureListData.map(item => {
                      return (
                        <Option key={item.attrName} value={item.attrName} title={item.attrName}>{item.attrName}</Option>
                      )
                    })}
                  </Select>
                )
                }
              </FormItem>
              <Button type='primary' onClick={this.query} style={{ marginTop: 4 }}>查询</Button>
              {defiData.map((item, index) => {
                return (
                  <div style={{ marginTop: 15 }} key={index}>
                    <h2>{item.themeName}</h2>
                    <FormItem label='定义' wrapperCol={wrapperCol} style={{ width: '30%' }}>
                      {getFieldDecorator(`define${index}`, {})(
                        <TextArea rows={4}></TextArea>
                      )
                      }
                    </FormItem>
                    <FormItem label='计算公式' wrapperCol={wrapperCol} style={{ width: '30%' }}>
                      {getFieldDecorator(`formula${index}`, {})(
                        <TextArea rows={4}></TextArea>
                      )
                      }
                    </FormItem>
                    <FormItem label='备注' wrapperCol={wrapperCol} style={{ width: '30%' }}>
                      {getFieldDecorator(`remarks${index}`, {})(
                        <TextArea rows={4}></TextArea>
                      )
                      }
                    </FormItem>
                  </div>
                )
              })}
            </Form>
            {defiData.length > 0 && edit === '1' &&
              <div style={{ display: 'flex', flexDirection: 'row-reverse', marginTop: 15, marginRight: '4.5%' }}>
                <Button type='primary' onClick={this.save}>保存</Button></div>}
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
