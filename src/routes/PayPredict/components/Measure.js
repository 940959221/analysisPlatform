import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Checkbox } from 'snk-web';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class Measure extends Component{
  constructor(props){
    super(props);
    this.state = {
      checkAll: false,      // 是否全选
      checkedList: [],      // 初始化的指标
      measure: [],          // 存放选择指标的code
    }
  }

  // 指标全选
  onCheckAllChange = (e) => {
    let measureName = [], measureCode = [];
    let measure = this.props.analysis[this.props.root.state.getMeasures + 'Data'];
    for (const i in measure) {
      if(measure[i].isIndex === '1'){
        measureName.push(measure[i].attrName);
        measureCode.push(measure[i].attrCode);
      }
    }
    if (e.target.checked) {
      this.props.form.setFieldsValue({ measure: measureName });
      this.setState({ measure: measureCode })
    } else {
      this.props.form.setFieldsValue({ measure: [] });
      this.setState({ measure: [] })
    }
    this.setState({
      checkAll: e.target.checked,
    });
  }

  // 选择指标
  onChangeCheck = (checkedList) => {
    const measure = [];
    for(let i of this.props.analysis[this.props.root.state.getMeasures + 'Data']){
      for(let j of checkedList){
        if(j === i.attrName) measure.push(i.attrCode);
      }
    }
    this.setState({ measure })
  }

  render(){
    const { form: { getFieldDecorator }, analysis, root: { state: { getMeasures } } } = this.props;
    const getMeasuresData = this.props.analysis[getMeasures + 'Data'];
    const measure = [];
    for(let i of getMeasuresData){
      if(i.isIndex === '1') measure.push(i.attrName);
    }
    const staticformItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    };
    return(
      <FormItem {...staticformItemLayout}>
        <Checkbox
          onChange={this.onCheckAllChange}
          checked={this.state.checkAll}
        >
          全选
        </Checkbox>   
        {getFieldDecorator('measure', { 
          initialValue: this.state.checkedList,
        })(
          <CheckboxGroup options={measure} onChange={this.onChangeCheck} />
        )}
      </FormItem>
    )
  }
}