import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Select, Row, Cascader, Icon, Button, Modal } from 'snk-web';
import ReaderDimensionForm from './ReaderDimensionForm';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class Dimensions extends Component{
  constructor(props){
    super(props);
    this.state = {
      defined: true,   // 是否使用自定义分组
      dimensionGroup: [],    // 存放维度分组
      nowChooes: '',    // 现在选择的是哪一个下拉框的自定义
      saveAllData: [],   // 提供给子组件的
      dimensionModelVisible: false,   // 是否显示弹窗
      dimensionLabel: '',    // 储存打开弹窗时候选择的维度名
    }
  }

  // 分析维度选中
  analysisSelect = (value, label, string, code) => {
    const { analysis, root: { state: { getFilter, mainArr } } } = this.props;
    let obj = analysis[getFilter + 'Data'];
    let usePush = true;
    let nowChooes = string + '+' + label;
    obj = obj.filter(item => item.dimDesc === label)[0];
    const item = {
      name: label,
      value: value.split('-')[0],
      appId: obj.appId,
      themeId: this.state.themeId,
      result: [],        //  自定义表格需要展示的选择了的项
      saveAllData: [],   //  储存自定义里面所选择的数据
      dimTable: value.split('-')[2],
      nowChooes: string + '+' + label,    //  现在选择的名字
      customDimension: [],
      obj: {
        appId: obj.appId,
        dimColumn: obj.dimColumn,
        dimName: obj.dimName ? obj.dimName : '',  
        dimTable: obj.dimTable,
        dimValue: obj.dimValue ? obj.dimValue : '',
        themeId: obj.themeId
      }
    }
    this.setState({ nowChooes });
    for(let i of this.state.dimensionGroup){
      if(item.nowChooes === i.nowChooes) usePush = false;
    }
    if(usePush) this.state.dimensionGroup.push(item);
    // 先对数据进行过滤，这其中包括过滤两个不同板块的维度，以及同板块不同维度
    let arr = this.state.dimensionGroup.filter(item => item.nowChooes.split('+')[0] === nowChooes.split('+')[0]);
    let dataSource = arr.filter(item => item.name === nowChooes.split('+')[1]);
    let saveAllData = dataSource[0].saveAllData;
    this.setState({ saveAllData });
    
    if(value.split('-')[1] === '自定义分组'){
      this.setState({ dimensionModelVisible: true, dimensionLabel: label });
    }else{
      // 给父节点状态添加数值
      for(let i of mainArr){
        if(i.label === label) return;
      }
      console.log(value)
      mainArr.push({ label, code: value.split('-')[0] });
      this.props.root.setState({ mainArr });
    }
  }

  // 弹窗点击确定和取消
  onCancelDimModel(){
    const { root: { state: { mainArr } } } = this.props;
    let arr = this.state.dimensionGroup;
    const formData = this.props.form.getFieldsValue();
    // 先除去有选择值或者是有自定义但是没有设置的，留下自定义设置了值的对象
    for(let i in formData){
      if(i.indexOf('-') !== -1){
        if(formData[i].split('-')[1] !== '自定义分组' && formData[i] !== ''){
          arr = arr.filter( item => item.value !== formData[i].split('-')[0])
        }else if(formData[i].split('-')[1] === '自定义分组' && formData[i] !== ''){
          arr = arr.filter( item => item.saveAllData.length > 0)
        }
      }
    }
    this.setState({ dimensionModelVisible: false });
    // 把所有对象都推入数组，再去重
    for(let i of arr){
      for(let j of mainArr){
        if(j.label === i.name) return;
      }
      mainArr.push({ label: i.name, code: i.value });
    }
    this.props.root.setState({ mainArr });
  }

  // 下拉监听
  onDeselect = (e, label) => {
    let { mainArr } = this.props.root.state;
    const { dimensionGroup } = this.state;
    // 如果点击了下拉框的删除按钮，就过滤父级状态的当前项，此操作针对于主维度，和当前模块无关
    // 如果切换了同一个维度的不同选项，需要改变主维度的code
    if(e === undefined){
      for(let i in mainArr){
        if(mainArr[i].label === label) mainArr.splice(i, 1);
      }
      // 这步删除dimensionGroup是为了配合onCancelDimModel方法
      for(let i in dimensionGroup){
        if(dimensionGroup[i].name === label) dimensionGroup.splice(i, 1)
      }
      this.setState({ dimensionGroup })
    }else{
      for(let i in mainArr){
        if(mainArr[i].label === label) mainArr[i].code = e.split('-')[0];
      }
    }
    this.props.root.setState({ mainArr })
  }

  render(){
    const { form: { getFieldDecorator, getFieldValue }, root: { state: { getDimensions } } } = this.props;
    const dimensionsData = this.props.analysis[getDimensions + 'Data'];
    return(
      <Form style={{display: 'flex', flexWrap: 'wrap'}}>
        { dimensionsData.map((item, index) => {
          return(
            <FormItem label={item.dimTotalName} key={item + index} style={{display: 'flex', marginLeft: 10}}>
              { getFieldDecorator(`analysisDimension1-${index}`, { 
                initialValue: '' ,
                getValueFromEvent: e => e === undefined ? '' : e 
              })(
                <Select style={{width: 120}} allowClear onSelect={ e => this.analysisSelect(e, item.dimTotalName, '生成图表', item.dimTable) }
                  onChange={ (e) => this.onDeselect(e, item.dimTotalName) }>
                  { item.tableDesc.map(i => {
                    return(
                      <Option value={i.columnValue + '-' + i.columnName} key={i.columnName + i.columnValue}>{i.columnName}</Option>
                    )
                  }) }
                  <Option value={`${item.tableDesc[0].columnValue}` + '-' + '自定义分组' + '-' + item.dimTable} 
                    style={{display: this.state.defined ? '' : 'none'}}>
                    自定义分组
                  </Option>
                </Select>
              ) }
            </FormItem>
          )
        }) }
        <Modal
          visible={this.state.dimensionModelVisible}
          onOk={e => this.onCancelDimModel(e)}
          onCancel={e => this.onCancelDimModel(e)}
          title='自定义维度分组配置'
          maskClosable={false}
          width={1000}
        >
          <ReaderDimensionForm
            {...this.props}
            root={this}
            nowChooes={this.state.nowChooes}
            optionsGroup={this.state.optionsGroup}
            saveAllData={this.state.saveAllData}
            dimensionGroup={this.state.dimensionGroup}
          />
        </Modal>
      </Form>
    )
  }
}