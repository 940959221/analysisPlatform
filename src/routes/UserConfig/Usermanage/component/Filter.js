import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Select, Cascader } from 'snk-web';

const FormItem = Form.Item;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class Usermanages extends Component {
  state = {
    userOnce: true,       // 在联级选择的时候只发送一次请求，后续不发送
    cascaderOption: [],   // 联级数据
  };

  // 点击联级框发送请求获取联级数据
  getCascader = () => {
    const { getFilter } = this.props;
    // if(!this.state.userOnce) return;
    if(this.state.userOnce === true){
      this.props.dispatch({
        type: `analysis/${getFilter}`,
        payload: {  }
      }).then(() => {
        const filterData = this.props.analysis[getFilter + 'Data'];
        console.log(filterData)
        let cascaderOption = [];
        for(let i of filterData){
          cascaderOption.push({
            label: i.companyName,
            value: i.companyCode,
            level: i.level,
            isLeaf: false,
            getPost: true,   //  判断是否要发送请求
            obj: {
              level: i.level,
              companyCode: i.companyCode
            }
          })
        }
        this.setState({ cascaderOption, userOnce: false })
      })
    }
  }

  // 选择联级项后发送请求
  loadData = (selectedOptions, item) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const { getFilter } = this.props;   // 这里引入父级状态中的过滤，因为模块不同，联级的请求路径也不同
    if(!targetOption.getPost) return;    // 如果这个属性为false，就不进行操作
    targetOption.loading = true;
    setTimeout(() => {
      targetOption.loading = false;
      this.props.dispatch({
        type: `analysis/${getFilter}`,
        payload: targetOption.obj
      }).then(() => {
        const arr = [];
        const getData = this.props.analysis[getFilter + 'Data'];
        for(let i of getData){    // 这里循环是为了给子项也设置好属性
          arr.push({
            label: i.companyName,
            value: i.companyCode,
            level: i.level,
            isLeaf: false,
            getPost: true,   //  判断是否要发送请求
            obj: {
              level: i.level,
              companyCode: i.companyCode
            }
          })
        }
        targetOption.children = arr;
        this.setState({
          cascaderOption: [...this.state.cascaderOption],
        });
      }).catch(()=>{
        // 如果请求失败了，证明是没有子项，改变属性，不再重复请求，
        // 考虑用户关闭了联级后再选，不会因为没有子项而导致多选不流畅，所以不改变isLeaf
        targetOption.getPost = false;  
      })
    }, 300);
  };

  // 修改联级选择
  changeCascader = (e, obj) => {
    const object = obj[obj.length - 1];
    this.props.root.setState({ companycode: object.value });
    this.props.form.setFieldsValue({ company: [], companyValue: object.label })
  }

  // 地区联级选择的展示
  renderSelect(label){
    if (label.length !== 0) {
      return label[0];
    }
  }

  // 清除
  deselect = (e) => {
    this.props.root.setState({ companycode: undefined })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { cascaderOption } = this.state;
    const { label, useStyle, rules } = this.props;
    return (
      <div style={useStyle ? {display: 'flex'} : {display: 'inline'}}>
        <FormItem label={label} style={useStyle ? {display: 'flex'} : {margin: 0}}>
          { getFieldDecorator('company', {
            rules: [{ required: rules, message: '必选' }]
          })(
            <Cascader
              style= {{width: 80}} 
              onClick={ this.getCascader }
              displayRender={ this.renderSelect }
              options={ cascaderOption }
              loadData={ this.loadData }
              changeOnSelect={ true }
              onChange={ this.changeCascader }
              placeholder= ''
              allowClear={ false }
            />
          ) }
        </FormItem>
        <FormItem>
          {getFieldDecorator('companyValue', { 
            initialValue: [],
            rules: [{ required: rules, message: '必选' }]
          })(
            <Select onDeselect={ this.deselect } mode="multiple" style={{ width: 200 }}>
              { [] }
            </Select>
          )}
        </FormItem>
      </div>
    );
  }
}
