import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Select, Row, Cascader, Icon, Button, Modal } from 'snk-web';
import ReaderDimensionForm from './ReaderDimensionForm';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class Dimensions extends PureComponent {
  state = {
    appId: '',   // 一个id
    userOnce: true,   // 在筛选数据维度联级的时候只发送一次请求，后续不发送
    cascaderOption: [],  // 联级数据
    getAllData: [],    // 存放所有联级选择后的对象
    selectList: [],    // 下拉框展示的数据
    userPost: true,    // 筛选数据维度是否发送请求
    defined: true,   // 是否使用自定义分组
    dimensionModelVisible: false,   // 是否显示弹窗
    dimensionLabel: '',    // 储存打开弹窗时候选择的维度名
    dimensionGroup: [],    // 存放维度分组
    optionsGroup: [],
    nowChooes: '',    // 现在选择的是哪一个下拉框的自定义
    saveAllData: [],   // 提供给子组件的
    filterData: [],    // 在添加过滤器的时候会因为新点击选择的值触发onchange改变getAllData，所以在添加过滤器的时候把现在的getAllData给push进来
    filterSave: [],    // 提供给保存结果的筛选数据维度的value集合，方便回显时数据显示
  }
  componentDidMount() {
    
  }

  // 点击联级框发送请求获取联级数据
  getCascader = () => {
    if(this.props.id && this.state.userOnce === true){
      this.props.dispatch({
        type: `analysis/getFilterDimensions`,
        payload: { themeId: 'mqbusiness', appId: 'attri' }
      })
    }
    if(!this.state.userOnce) return;
    const getFilterDimensionsData = this.props.analysis.getFilterDimensionsData;
    let cascaderOption = [];
    for(let i of getFilterDimensionsData){
      cascaderOption.push({
        label: i.dimDesc,
        value: i.dimDesc,
        isLeaf: false,
        getPost: true,   //  判断是否要发送请求
        obj: {
          appId: i.appId,
          dimColumn: i.dimColumn,
          dimName: i.dimName ? i.dimName : '',  
          dimTable: i.dimTable,
          dimValue: i.dimValue ? i.dimValue : '',
          themeId: i.themeId
        }
      })
    }
    this.setState({ cascaderOption, userOnce: false })
  }

  // 选择联级项后发送请求
  loadData = (selectedOptions, item) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const { filter } = this.props.root.state;   // 这里引入父级状态中的过滤，因为模块不同，联级的请求路径也不同
    if(!targetOption.getPost) return;    // 如果这个属性为false，就不进行操作
    targetOption.loading = true;
    setTimeout(() => {
      targetOption.loading = false;
      this.props.dispatch({
        type: `analysis/${filter}`,
        payload: targetOption.obj
      }).then(() => {
        const arr = [];
        const getData = this.props.analysis[filter + 'Data'];
        for(let i of getData){    // 这里循环是为了给子项也设置好属性
          arr.push({
            label: i.dimName,
            value: i.dimName,
            isLeaf: false,
            getPost: true,
            dimTable: i.dimTable,
            dimColumn: i.dimColumn,
            dimValue: i.dimValue,
            obj: {
              appId: i.appId,
              dimColumn: i.dimColumn,
              dimLevel: i.dimLevel,
              dimName: i.dimName,
              dimTable: i.dimTable,
              dimValue: i.dimValue,
              themeId: i.themeId
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

  // 地区联级选择的展示
  renderSelect(label){
    if (label.length !== 0) {
      return label[0];
    }
  }

  // 选中联级后把值推给下拉
  changeCascader(value, valueObj, item){
    let { getAllData, selectList, filterData, filterSave } = this.state;
    let selectName = `dimensionArr${item}`;    //  下拉框的组件名
    let getAllDataArr = [];    // 替代getAllData
    let selectListArr = []    // 替代selectList
    let addItem = true;
    let val = value.slice(-1)[0];   //  记录选中的值
    let obj = { val, case: value.length }
    // 回显信息可以先行执行，不受其他限制
    if(!filterSave[item]){
      filterSave[item] = {
        parent: [value[0]],
        children: value.length > 1 ? [value[value.length-1]] : [],    // 如果没有操作过就直接给定最后一个值保存为select需要展示的值
        length: value.length
      };
    }else{
      filterSave[item] = {
        parent: [value[0]],
        children: value.length > 1 ? (filterSave[item].length === value.length ?    // 按照是否同层级操作给定不同的值
          [...filterSave[item].children, value[value.length-1]] : [value[value.length-1]]) : [],
        length: value.length
      };
    }
    this.setState({ filterSave })

    // 循环第二个参数，把需要的值代入obj
    for(let i of valueObj){
      if(i.obj.dimLevel){
        obj.dimColumn = i.dimColumn;
        obj.dimValue = i.dimValue;
      }
    }

    if(getAllData.length === 0){   // 第一次直接加
      getAllData.push(obj); 
      if(obj.case !== 1) filterData[item] = getAllData; // 把getAllData数据放入filterData当中保存，这样不会流失，而且能更新
      // 这里需要循环展示filterData中的数据，不能和自定义分组一样，这里需要下标控制
      // 防止：当一个用户添加过滤后，操作了最后一个，又回头操作第一个会出问题，显示的值也不一样
      for(let i in filterData){
        if(parseInt(i) === item){
          for(let j of filterData[i]){
            if(j.case === 1) selectListArr = [];   // 不展示一级目录
            else selectListArr.push(j.val);
          }
        }
      }
      this.props.form.setFieldsValue({ [selectName]: selectListArr });
      this.setState({ getAllData, selectList: selectListArr, filterData });

    }else {
      for(let i of getAllData){
        // 如果选中的是重复值就pass，这里只比较两个，因为loadData在之后才执行，之后改变了obj所有只能对比两项，不能用json判断对象
        if(i.val === obj.val && i.case === obj.case) return;  
        else if(i.case === obj.case){
          // 因为判断会判断多个，为避免之后需要去重，所以只添加一次
          addItem && getAllDataArr.push(obj);   
          addItem = false;
        } 
        else {                 //  否则就清空数组，再添加
          getAllData = [];
          getAllDataArr = [];
          getAllDataArr.push(obj);
        }
      }

      getAllData = [...getAllData, ...getAllDataArr];
      // 把getAllData数据放入filterData当中保存，这样不会流失，而且能更新
      for(let i of getAllData) if(i.case !== 1) filterData[item] = getAllData; 
      // 这里需要循环展示filterData中的数据，不能和自定义分组一样，这里需要下标控制
      // 防止：当一个用户添加过滤后，操作了最后一个，又回头操作第一个会出问题，显示的值也不一样
      for(let i in filterData){
        if(parseInt(i) === item){
          for(let j of filterData[i]){
            if(j.case === 1) selectListArr = [];   // 不展示一级目录
            else selectListArr.push(j.val);
          }
        }
      }
      this.props.form.setFieldsValue({ [selectName]: selectListArr });
      this.setState({ getAllData, selectList: selectListArr, filterData });
    }
  }

  // 筛选维度下拉框取消选中
  deselect = (value, index) => {
    let { getAllData, selectList, filterData, filterSave } = this.state;
    selectList = selectList.filter(item => item !== value);
    getAllData = getAllData.filter(item => item.val !== value);

    // 过滤getAllData的同时也需要过滤filterData
    filterData[index] = filterData[index].filter(item => item.val !== value);
    if(filterData[index].length === 0) filterData[index] = [];

    // 过滤filterSave
    filterSave[index].children = filterSave[index].children.filter(item => item !== value);
    this.setState({ getAllData, selectList, filterData });
  }

  // 添加过滤器
  add = () => {
    const keys = this.props.form.getFieldValue('keys');
    const now = keys.slice(-1)[0] + 1;
    keys.push(now);
    this.props.form.setFieldsValue({ 'keys': keys });
  }

  // 点击删除
  remove(index){
    const { form } = this.props;
    const { filterData, filterSave } = this.state;
    let keys = form.getFieldValue('keys');
    keys = keys.filter(item => item !== index);

    // 删除需要把当前位置的数组值清空，保留位置不能删除
    filterData[index] = [];

    // 删除可以把当前数据删除，不需要保留位置
    filterSave.splice(index, 1);
    this.setState({ filterData, filterSave })
    
    form.setFieldsValue({ 'keys': keys, [`dimensionArr${index}`]: [] });
  }

  // 分析维度选中
  analysisSelect = (value, label, string) => {
    if(value.split('-')[1] === '自定义分组') this.setState({ dimensionModelVisible: true, dimensionLabel: label });
    let obj = this.props.analysis.getFilterDimensionsData;
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
  }

  // 分析维度监听叉叉
  onDeselect = (e, label, name) => {
    if(e === undefined){
      const { dimensionGroup } = this.state;
      for(let i in dimensionGroup){
        if(dimensionGroup[i].nowChooes === `${name}+${label}`){
          dimensionGroup.splice(i, 1)
        }
      }
    }
  }

  // 弹窗点击确定和取消
  onCancelDimModel(){
    this.setState({ dimensionModelVisible: false });
    // console.log(this.state.dimensionGroup)
    // console.log(this.props.form.getFieldsValue())
  }

  // 点击分析维度的区域
  changeAnalysis1 = (title) => {
    if(title === '生成图表'){
      this.tu_biao.style.border = '2px dashed #1890ff';
      this.tu_biao_title.style.background = '#e1251b';
      this.props.root.setState({ tubiao_button: false });

      this.jian_yi.style.border = '2px dashed gray';
      this.jian_yi_title.style.background = '#b9b8b8';
      this.props.root.setState({ jianyi_button: true });
    }else{
      this.tu_biao.style.border = '2px dashed gray';
      this.tu_biao_title.style.background = '#b9b8b8';
      this.props.root.setState({ tubiao_button: true });

      this.jian_yi.style.border = '2px dashed #1890ff';
      this.jian_yi_title.style.background = '#e1251b';
      this.props.root.setState({ jianyi_button: false });
    }
  }

  render() {
    const comBox = {
      padding: 12,
      border: '2px dashed gray',
      position: 'relative',
      flex: '30%',
      marginTop: 20,
      borderRadius: '10px'
    }
    const comText = {
      position: 'absolute',
      top: '-15px',
      left: '50%',
      marginLeft: '-24px',
      background: '#b9b8b8',
      color: '#fff',
      padding: '4px',
    }
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    const { form: { getFieldDecorator, getFieldValue } } = this.props;
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 10 },
    };
    const keyArr = [0];
    getFieldDecorator('keys', { initialValue: keyArr });
    const keys = getFieldValue('keys'); 
    return (
      <div>
        { keys.map( item => {
          return(
            <FormItem {...formItemLayout} style={{width: '100%', display: 'flex'}} label='筛选数据维度' key={item}>
              { getFieldDecorator(`selectDim${item}`, { initialValue: [] })(
                <Cascader
                  style= {{width: 80}} 
                  onClick={ this.getCascader }
                  displayRender={ this.renderSelect }
                  options={ this.state.cascaderOption }
                  loadData={ e => this.loadData(e, item) }
                  changeOnSelect={ true }
                  onChange={ (e, obj) => this.changeCascader(e, obj, item) }
                  placeholder= ''
                  allowClear={ false }
                />
              ) }
              
              {getFieldDecorator(`dimensionArr${item}`, { initialValue: [] })(
                <Select onDeselect={ e => this.deselect(e, item) } mode="multiple" style={{ width: 'calc(100% - 102px)' }}>
                  { [] }
                </Select>
              )}
              {item !== 0 ? (
                <Icon
                  style={{ marginLeft: 10 }}
                  className="dynamic-delete-button"
                  type="minus-circle-o"
                  onClick={() => this.remove(item)}
                />
              ) : null}
            </FormItem>
            
          )
        }) }
        <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
          <Button
            type="dashed"
            onClick={this.add}
            style={{ width: '60%' }}
            disabled={!(this.props.form.getFieldValue(
              `dimensionArr${this.props.form.getFieldValue('keys')[this.props.form.getFieldValue('keys').length - 1]}`
).length > 0)
            }
          >
            <Icon type="plus" /> 添加过滤器
          </Button>
        </FormItem>
        
        {/* 此处为流量分析的分析维度，与业务分析不同 */}
        <div style={{ display: this.props.root.state.showFlow}}>
          <FormItem label='分析维度' layout="inline" style={{display: 'flex'}} {...formItemLayout}>
            { getFieldDecorator('flowAnalysis', {
              initialValue: '', rules: [{ required: true, message: '必选' }]
            })(
              <Select style={{width: 120}}>

              </Select>
            ) }
          </FormItem>
        </div>
        {/* ///////////////////////////////////////////////////////// */}

        <div style={{...comBox, display: this.props.root.state.showBusiness}} 
          onClick={ () => this.changeAnalysis1('生成图表') } ref={ tu_biao => this.tu_biao = tu_biao }>
          <div style={{ ...comText }} ref={ tu_biao_title => this.tu_biao_title = tu_biao_title }>生成图表分析维度</div>
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            { this.props.analysis.get_DimensionsData.map((item, index) => {
              return(
                <FormItem label={item.dimTotalName} key={item + index} style={{display: 'flex', marginLeft: 10}}>
                  { getFieldDecorator(`analysisDimension1-${index}`, { 
                    initialValue: '' ,
                    getValueFromEvent: e => e === undefined ? '' : e 
                  })(
                    <Select style={{width: 120}} allowClear onChange={ e => this.onDeselect(e, item.dimTotalName, '生成图表') } 
                      onSelect={ e => this.analysisSelect(e, item.dimTotalName, '生成图表') }>
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
          </div>
        </div>

        <div style={{...comBox, marginTop: 40, display: this.props.root.state.showBusiness}} 
          onClick={ () => this.changeAnalysis1('获取系统建议') } 
          ref={ jian_yi => this.jian_yi = jian_yi }>
          <div style={{ ...comText }} ref={ jian_yi_title => this.jian_yi_title = jian_yi_title }>获取系统建议分析维度</div>
          <div style={{display: 'flex', flexWrap: 'wrap'}}>
            { this.props.analysis.get_DimensionsData.map((item, index) => {
              return(
                <FormItem label={item.dimTotalName} key={item + index} style={{display: 'flex', marginLeft: 10}}>
                  { getFieldDecorator(`analysisDimension2-${index}`, { 
                    initialValue: '',
                    getValueFromEvent: e => e === undefined ? '' : e 
                  })(
                    <Select style={{width: 120}} allowClear  onChange={ e => this.onDeselect(e, item.dimTotalName, '获取系统建议') } 
                      onSelect={ e => this.analysisSelect(e, item.dimTotalName, '获取系统建议') }>
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
          </div>
        </div>
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
      </div>
    );
  }
}
