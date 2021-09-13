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

export default class Mainlysis extends Component{
  constructor(props){
    super(props);
    this.state = {
      
    }
  }

  render(){
    const { form: { getFieldDecorator }, root: { state: { getEndTimeContent, getEndTimePeriod, mainArr } } } = this.props;
    const data = [];
    if(mainArr.length > 0){
      for(let i of mainArr){
        data.push(i.label)
      }
    }
    return(
      <FormItem label='主维度元素' style={{display: 'flex', flexWrap: 'wrap'}}>
        {getFieldDecorator('main', {
            initialValue: [],
            rules: [{ required: true, message: '必选' }]
          })(
            <Select placeholder="请选择" style={{ width: 200 }}>
              { data.map(item => {
                return(
                  <Option key={item} value={item}>{item}</Option>
                )
              }) }
            </Select>
          )}
      </FormItem>
    )
  }
}