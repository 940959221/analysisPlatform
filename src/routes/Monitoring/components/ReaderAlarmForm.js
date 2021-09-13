import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Row, Col, Input, Button, Modal, InputNumber
} from 'snk-web';

const FormItem = Form.Item;
const InputGroup = Input.Group;
const formItemLayout = {
      labelCol: {
          xs: { span: 18 },
          sm: { span: 5 },
      },
      wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
      },
  };

@Form.create()
@connect(({ monitoring, loading }) => ({
  monitoring,
  loading: loading.models.monitoring,
}))

export default class ReaderAlarmForm extends PureComponent {
  state = {};

  componentDidMount() {}

  onChangeDimension = (checkedValues) => {
    this.setState({dimensionOptoin: checkedValues});
  }


  addOk = () => {
    this.props.root.addOk();
  }

  onCancel = () => {
    this.props.root.onCancel(this.props.form);
  }

  renderForm() {
      const {loading, form: {getFieldDecorator}} = this.props;
      return (
        <Form>
          <Row>
          <Col>
            <FormItem label="严重告警" {...formItemLayout}>
              <InputGroup compact>
                {getFieldDecorator('startcriticalValue',{initialValue: '',})(
                  <InputNumber/>
              )}
                <span style={{margin: '4px 2px'}}>~</span>
                {getFieldDecorator('endcriticalValue',{initialValue: '',})(
                  <InputNumber/>
              )}
              </InputGroup>
            </FormItem>
          </Col>
          </Row>
          <Row>
          <Col>
            <FormItem label="重大告警" {...formItemLayout}>
              <InputGroup compact>
                {getFieldDecorator('startmajorValue',{initialValue: '',})(
                  <InputNumber/>
              )}
                <span style={{margin: '4px 2px'}}>~</span>
                {getFieldDecorator('endmajorValue',{initialValue: '',})(
                  <InputNumber/>
              )}
              </InputGroup>
            </FormItem>
          </Col>
          </Row>
          <Row>
          <Col>
            <FormItem label="次要告警" {...formItemLayout}>
              <InputGroup compact>
                {getFieldDecorator('startminorValue',{initialValue: '',})(
                  <InputNumber/>
                )}
                <span style={{margin: '4px 2px'}}>~</span>
                {getFieldDecorator('endminorValue',{initialValue: '',})(
                  <InputNumber/>
                )}
              </InputGroup>
            </FormItem>
          </Col>
          </Row>
          <Row>
          <Col>
            <FormItem label="一般告警" {...formItemLayout}>
              <InputGroup compact>
                {getFieldDecorator('startwarningValue',{initialValue: '',})(
                  <InputNumber/>
              )}
               <span style={{margin: '4px 2px'}}>~</span>
                {getFieldDecorator('endwarningValue',{initialValue: '',})(
                  <InputNumber/>
              )}
              </InputGroup>
            </FormItem>
          </Col>
          </Row>
           <span style={{ display: 'inline-block', marginTop: 14, color: '#827d7d' }}>
            注：如果左右两边只填写一个，另外一个不填写表示无穷；如果两边都不填写，则表示该级别告警不做设置。
          </span> 
        </Form>
      );
  }

  render() {
    const { rule, pagination, loading } = this.props;
    return (
      <div>
        {this.renderForm()}
      </div>
    );
  }
}
