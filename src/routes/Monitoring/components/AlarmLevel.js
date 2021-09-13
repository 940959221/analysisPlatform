import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button } from 'snk-web';

const FormItem = Form.Item;

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
export default class AlarmLevel extends PureComponent {

  formaUnit = (value) => { 
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

  formaColorUnit = (value) => {
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

  renderForm() {
    const { form: { getFieldDecorator } } = this.props;
    const alarmLevelArr = [];
    const newArr = [];
    const indexAnalyzeVlaueArr = [];
    if (this.props.root.state.alarmLevelList !== undefined && this.props.root.state.alarmLevelList.length > 0) {
      const alarmLevelList = this.props.root.state.alarmLevelList;
      const measureList = Array.from(new Set(this.props.root.state.measureList));
      const tempArr = [];
      for (const i in alarmLevelList) {
        if (alarmLevelList[i]) {
          for (const j in measureList) {
            if (measureList[j].split('-')[0] === alarmLevelList[i]) {
              tempArr.push(measureList[j]);
            }
          }
        }
      }

      // 回显告警等级
      if (this.props.searchData.indexAnalyze !== undefined) {
        const indexAnalyze = this.props.searchData.indexAnalyze;
        for (const i in indexAnalyze) {
          if (indexAnalyze[i]) {
            indexAnalyzeVlaueArr.push(indexAnalyze[i].value);
            const divItemArr = [];
            indexAnalyze[i].context.map((item) => {
              const divItem = (
                <div id={item.type} className={indexAnalyze[i].value}>
                  <span style={{
                    width: 16, height: 16, marginRight: 14, display: 'inline-block', verticalAlign: 'sub', background: this.formaColorUnit(item.type),
                  }}
                  />
                  <span style={{ marginRight: 8 }}>{this.formaUnit(item.type)}:</span>
                  <span>{item.leftValue === '-' ? '∞' : item.leftValue}</span> -- <span>{item.rightValue === '-' ? '∞' : item.rightValue}</span>
                </div>
              );
              divItemArr.push(divItem);
            });
            newArr.push(divItemArr);
          }
        }
      }

      for (const i in tempArr) {
        if (newArr.length > 0 && indexAnalyzeVlaueArr.indexOf(tempArr[i].split('-')[1]) !== -1) {
          for (let j = 0; j < newArr.length; j+=1) {
            if (newArr[j][0].props.className === tempArr[i].split('-')[1]) {
              this.props.root.state.indexAnalyId.push(tempArr[i].split('-')[1]);
              const alarmLevelItem = (
                <div style={{ display: 'inline-flex' }} key={tempArr[i]}>
                  <span style={{ width: '100px' }}>{tempArr[i].split('-')[0]}</span>
                  <div style={{ marginBottom: 10 }}>
                    <FormItem {...formItemLayout}>
                      {getFieldDecorator(`${tempArr[i].split('-')[1]}`)(
                        <div
                          style={{
                          width: 350, minHeight: 40, border: '1px solid #d9d9d9', marginLeft: 8, paddingLeft: 38,
                          }}
                          id={tempArr[i].split('-')[1]}
                        >
                          {newArr[j].map((item) => { return item; })}
                        </div>
                      )}
                    </FormItem>
                    <Button onClick={e => this.props.root.editAlarm(e, tempArr[i].split('-')[1], tempArr[i].split('-')[0])}>设置</Button>
                  </div>
                </div>
              );
              alarmLevelArr.push(alarmLevelItem);
            }
          }
        } else if (indexAnalyzeVlaueArr.indexOf(tempArr[i].split('-')[1]) === -1) {
          const alarmLevelItem = (
            <div style={{ display: 'inline-flex' }} key={tempArr[i]}>
              <span style={{ width: '100px' }}>{tempArr[i].split('-')[0]}</span>
              <div style={{ marginBottom: 10 }}>
                <FormItem {...formItemLayout}>
                  {getFieldDecorator(`${tempArr[i].split('-')[1]}`)(
                    <div
                      style={{
                        width: 350, minHeight: 40, border: '1px solid #d9d9d9', marginLeft: 8, paddingLeft: 38,
                      }}
                      id={tempArr[i].split('-')[1]}
                    />
                  )}
                </FormItem>
                <Button onClick={e => this.props.root.editAlarm(e, tempArr[i].split('-')[1], tempArr[i].split('-')[0])}>设置</Button>
              </div>
            </div>
          );
          alarmLevelArr.push(alarmLevelItem);
        }
      }
    }

    return (
      <div id="indexAyaly">
        {alarmLevelArr.map((item) => { return item; })}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderForm()}
      </div>
    );
  }
}
