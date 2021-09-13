import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Select } from 'snk-web';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class CycleTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectData: [],         // 下拉数据
    }
  }

  // 获取时间节点内容
  getEndTimeContent = (value) => {
    const { root: { state: { getEndTimeContent, mainArr } }, dispatch, form } = this.props;
    form.setFieldsValue({ timeContent: [], });
    const payload = {
      appId: this.props.root.state.appId,
      themeId: this.props.root.state.themeId,
      cycle: value,
    };
    dispatch({
      type: `analysis/${getEndTimeContent}`,
      payload,
    }).then(() => {
      console.log(this.props.analysis[getEndTimeContent + 'Data']);
      this.setState({ selectData: this.props.analysis[getEndTimeContent + 'Data'] });
    })
    // 给父节点状态添加数值，此操作针对于主维度，和当前模块无关
    for (let i of mainArr) {
      if (i.label === '时间节点') return;
    }
    mainArr.push({ label: '时间节点', code: 'datadate' });
    this.props.root.setState({ mainArr })
  }

  render() {
    const { form: { getFieldDecorator }, analysis, root: { state: { getEndTimeContent, getEndTimePeriod } } } = this.props;
    let timeContent = this.state.selectData, timePeriod = analysis[getEndTimePeriod + 'Data'];
    console.log(timeContent);
    return (
      <Form>
        <FormItem label=''>
          <span style={{ color: '#f5222d', fontSize: 12, fontFamily: 'SimSun', margin: '8px 4px 0 0', display: 'inline-block' }}>*</span>
          {getFieldDecorator('endtime', {
            initialValue: '',
            rules: [{ required: true, message: '必选' }]
          })(
            <Select style={{ width: 90 }} onSelect={this.getEndTimeContent}>
              {timePeriod.map(item => {
                return (
                  <Option key={item.periodId} value={item.periodId}>{item.periodName}</Option>
                )
              })}
            </Select>
          )}
          {getFieldDecorator('timeContent', {
            initialValue: [],
            rules: [{ required: true, message: '必选' }]
          })(
            <Select mode="multiple" placeholder="请选择" style={{ width: 400 }} >
              {timeContent.map(item => {
                console.log(item);
                return (
                  <Option key={item} value={item}>{item}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>
      </Form>
    )
  }
}