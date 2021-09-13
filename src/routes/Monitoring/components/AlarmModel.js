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

export default class AlarmModel extends PureComponent {
  state = {};

  componentDidMount() {}

  addOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const tempArr = [
        'startcriticalValue', 'startmajorValue', 'startminorValue', 'startwarningValue',
        'endcriticalValue', 'endmajorValue', 'endminorValue', 'endwarningValue'
      ];
      const alarmName = ['critical', 'major', 'minor', 'warning']
      let itemNum = [];
      // let idName = [];
      let divArr = [];
      for (const i in tempArr) {
        if (typeof values[tempArr[i]] === 'number') {
          itemNum.push(tempArr[i])
        }
      }

      for (const i in itemNum) {
        for (const j in alarmName) {
          if (itemNum[i].includes(alarmName[j])) {
            this.props.root.state.idName.push(alarmName[j])
          }
        }
      }

      function formaColorUnit(value) {
        let color = '';
        switch (value) {
          case 'critical': color = '#ce0d17'; break;
          case 'major': color = '#e6cd0e'; break;
          case 'minor': color = '#1890ff'; break;
          case 'warning': color = '#067b15'; break;
          default: break;
        }
        return color;
      }

      function formaUnit(value) {
        let text = '';
        switch (value) {
          case 'critical': text = '严重告警'; break;
          case 'major': text = '重大告警'; break;
          case 'minor': text = '次要告警'; break;
          case 'warning': text = '一般告警'; break;
          default: break;
        }
        return text;
      }
      const divDom = document.getElementById(`${this.props.root.state.modelStatu}`);
      if (divDom.innerHTML === '') {
        Array.from(new Set(this.props.root.state.idName)).map((i) => {
          createDom(i);
        })
      } else {
        divDom.innerHTML = '';
        Array.from(new Set(this.props.root.state.idName)).map((i) => {
          createDom(i);
        })
      }

      this.props.root.onCancelAlarmModel();
      function createDom(i) {
        const div = document.createElement('div');
        if ((typeof values[`start${i}Value`] === 'number') || (typeof values[`end${i}Value`] === 'number')) {
          const alarmLevelSpan = document.createElement('span');
          alarmLevelSpan.style.width = '16px';
          alarmLevelSpan.style.height = '16px';
          alarmLevelSpan.style.display = 'inline-block';
          alarmLevelSpan.style.background = formaColorUnit(i);
          alarmLevelSpan.style.marginRight = '14px';
          alarmLevelSpan.style.verticalAlign = 'sub';
          const labelSpan = document.createElement('span');
          labelSpan.innerText = formaUnit(i);
          labelSpan.style.marginRight = '10px';
          const leftValueSpan = document.createElement('span');
          if (typeof values[`start${i}Value`] === 'number') {
            leftValueSpan.innerText = values[`start${i}Value`];
          } else if (typeof values[`start${i}Value`] !== 'number' && typeof values[`end${i}Value`] === 'number'){
            leftValueSpan.innerText = '∞';
          }
          const nullSpan = document.createElement('span');
          nullSpan.innerText = '--';
          nullSpan.style.margin = '0 4px';
          const rightValueSpan = document.createElement('span');
          if (typeof values[`end${i}Value`] === 'number') {
            rightValueSpan.innerText = values[`end${i}Value`];
          } else if (typeof values[`end${i}Value`] !== 'number' && typeof values[`start${i}Value`] === 'number'){
            rightValueSpan.innerText = '∞';
          }
          div.id = i;
          div.appendChild(alarmLevelSpan);
          div.appendChild(labelSpan);
          div.appendChild(leftValueSpan);
          div.appendChild(nullSpan)
          div.appendChild(rightValueSpan);
          divDom.appendChild(div);
        } 
      }
      this.props.form.setFieldsValue({
        startcriticalValue: '',
        endcriticalValue: '',
        startmajorValue: '',
        endmajorValue: '',
        startminorValue: '',
        endminorValue: '',
        startwarningValue: '',
        endwarningValue: '',
      });
    });
  }

  renderForm() {
      const {loading, form: {getFieldDecorator}} = this.props;
      return (
        <Form>
          <Row>
          <Col>
            <FormItem label={this.props.root.state.isSpecialCreate ? "告警设置" :"严重告警" }{...formItemLayout}>
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
          <Row style={{ display: this.props.root.state.isSpecialCreate ? 'none' : ''}}>
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
          <Row style={{ display: this.props.root.state.isSpecialCreate ? 'none' : ''}}>
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
          <Row style={{ display: this.props.root.state.isSpecialCreate ? 'none' : ''}}>
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
           <span style={{ display: 'inline-block', marginTop: 14, color: '#827d7d', color: 'red' }}>
            注：<span>如果两边都填写，左边的值必须小于或等于右边的值;
              如果左右两边只填写一个，另外一个不填写表示无穷；
              如果两边都不填写，则表示该级别告警不做设置。
              </span>
          </span> 
        </Form>
      );
  }

  onCancel = () => {
    // this.setState({ alarmModelVisible: false });
    this.props.root.onCancelAlarmModel();
    this.props.form.setFieldsValue({
      startcriticalValue: '',
      endcriticalValue: '',
      startmajorValue: '',
      endmajorValue: '',
      startminorValue: '',
      endminorValue: '',
      startwarningValue: '',
      endwarningValue: '',
    });
  }

  render() {
    const { rule, pagination, loading, alarmModelVisible } = this.props;
    return (
      <div>
        <Modal
          visible={alarmModelVisible}
          onOk={this.addOk}
          onCancel={this.onCancel}
          title='告警等级设置'
        >
          {this.renderForm()}
        </Modal>
        
      </div>
    );
  }
}
