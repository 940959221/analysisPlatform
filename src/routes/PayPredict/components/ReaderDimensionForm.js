import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Card, Form, Row, Col, Select, Input, Button, Modal, Table, Cascader, List, icon, message, Popconfirm, Spin
} from 'snk-web';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
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

export default class ReaderDimensionForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dimensionGroup: props.dimensionGroup,
      optionsGroup: props.optionsGroup,
      dimensionName: '',
      dimensionCode: 'originFileName',   // 随意的名字，初始组件名字不能为空，点击重置维度会进行修改
      dimensionModelVisible: false,
      customDimGroup: [], //存放点击对象
      customDimItemName: [], //存放显示对象
      customGroupTempData: [],
      fileValue: [],
      dimensionLabel: this.props.root.state.dimensionLabel,
      loading: false,
      groupNameModelVisible: false,
      getAllData: [],    // 存放所有联级选择后的对象
      selectList: [],    // 下拉框展示的数据
      saveAllData: this.props.saveAllData,    // 存放自定义分组命名，确定后的数据
      ReceiveProps: true,
      selectedOptions: [],     // 选中联级的所有数据
      customDimension: []
    };
  }

  componentDidMount() {
    
  }

  componentWillReceiveProps(props, nextProps){
    this.setState({ saveAllData: props.saveAllData, ReceiveProps: false });  // 当操作子组件的时候改变了父组件状态，重新赋值saveAllData
  }

  // 分组维度点击取消
  onCancelDimModel = () => {
    this.setState({
      dimensionModelVisible: false,
      getAllData: [],
      selectList: [],
    });
    this.props.form.setFieldsValue({ [this.state.dimensionCode]: [] });
  }

  // 分组维度点击确定
  hendleShowModel = () => {
    const { saveAllData, getAllData } = this.state;
    let arr = this.props.dimensionGroup.filter(item => item.nowChooes.split('+')[0] === this.props.nowChooes.split('+')[0]);
    let dataSource = arr.filter(item => item.name === this.props.nowChooes.split('+')[1]);
    const commontCuston = [];
    if(saveAllData.length > 0){     // 如果没有进行选择，就不执行
      for(let i of saveAllData){
        if(dataSource[0].name === i.title.split('+')[0]){
          commontCuston.push(i)
        }
      }
    }
    dataSource[0].result = commontCuston;
    dataSource[0].saveAllData = saveAllData;
    this.setState({
      dimensionModelVisible: false,
      getAllData: [],
      selectList: [],
    });
    this.props.form.setFieldsValue({ [this.state.dimensionCode]: [] });
  }

  // 选择联级项后发送请求
  loadData = (selectedOptions) => {
    let targetOption = selectedOptions[selectedOptions.length - 1];
    if(!targetOption.getPost) return;  // 这里循环是为了给子项也设置好属性
    targetOption.loading = true;
    const { root: { props: { root: { state : { getFilterAfter } } } }, dispatch } = this.props;

    setTimeout(() => {
      targetOption.loading = false;
      dispatch({
        type: `analysis/${getFilterAfter}`,
        payload: targetOption.obj
      }).then(() => {
        const arr = [];
        const getData = this.props.analysis[getFilterAfter + 'Data'];
        for(let i of getData){
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
          optionsGroup: [...this.state.optionsGroup],
          selectedOptions
        });
      }).catch(()=>{
        // 如果请求失败了，证明是没有子项，改变属性，不再重复请求，
        // 考虑用户关闭了联级后再选，不会因为没有子项而导致多选不流畅，所以不改变isLeaf
        targetOption.getPost = false;
      })
    }, 300);
  }

  // 点击重置维度
  showModel = (record) => {
    const item = {
      value: record.name,
      label: record.name,
      isLeaf: false,
      getPost: true,
      obj: record.obj,
      dimTable: record.dimTable,
      dimColumn: record.value,
    }
    let { optionsGroup } = this.state;
    // 每次点击进来都先清空optionsGroup，再重新添加现在的新值
    optionsGroup = [];
    optionsGroup.push(item);
    this.setState({ dimensionModelVisible: true, dimensionName: record.name, dimensionCode: record.value, optionsGroup });
  }

  // 选中联级后把值推给下拉
  onChange = (value, valueObj) => {
    let { getAllData, selectList } = this.state;
    let selectName = this.state.dimensionCode;    //  下拉框的组件名
    let getAllDataArr = [];    // 替代getAllData
    let selectListArr = []    // 替代selectList
    let addItem = true;
    let val = value.slice(-1)[0];   //  记录选中的值
    // let parent = value.slice(-2, -1)[0];  // 记录选中值的父级
    // if(parent === undefined) parent = val + 'true';   // 如果找不到父级，改变父级
    // if(value.length > 2) parent = JSON.stringify(value.slice(0, -2));   // 如果选到第三级开始，父子重名的解决办法，前两级重名也没关系
    let obj = { val, case: value.length }
    // 循环第二个参数，把需要的值代入obj
    for(let i of valueObj){
      if(i.obj.dimLevel){
        obj.dimColumn = i.dimColumn;
        obj.dimValue = i.dimValue;
      }
    }
    if(getAllData.length === 0){   // 第一次直接加
      getAllData.push(obj); 
      if(obj.case === 1) selectListArr = [];   
      else selectList.push(val);    // 不展示一级目录
      this.props.form.setFieldsValue({ [selectName]: selectList });
      this.setState({ getAllData, selectList })
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
      getAllData = [...getAllData, ...getAllDataArr]
      for(let i of getAllData){
        if(i.case === 1) selectListArr = [];   // 不展示一级目录
        else selectListArr.push(i.val)
      }
      this.props.form.setFieldsValue({ [selectName]: selectListArr });
      this.setState({ getAllData, selectList: selectListArr })
    }
  }

  //确定分组
  sureGroup = () => {
    if(this.state.selectList.length === 0){
      message.info('请选择过滤元素');
      return;
    }
    this.setState({ groupNameModelVisible: true, });
  }

  // 自定义分组命名确定
  onOkGroupNameModel = () => {
    const groupName = this.input.input.value;   // 输入框的值
    const { saveAllData, getAllData, customDimension } = this.state;
    if(groupName === ''){                  // 一系列校验
      message.info('请填写名称');
      return;
    }
    for(let i of saveAllData){
      if(i.title.split('+')[1] === groupName){
        message.info('请不要使用相同名称');
        return;
      }
    }
    const dataItem = [];
    const length = getAllData[0].case;    // 记录选中值的层级
    const dimColumn = getAllData[0].dimColumn;   // 记录同层的编号，同层都相同
    const dimValue = []
    for(let i of getAllData){
      dimValue.push(i.dimValue);    // 把选中的值的编号存入数组
      dataItem.push(i.val)
      for(let j of saveAllData){
        if(j.case !== getAllData[0].case){
          message.info('只能对同一层级的元素进行分组！');
          return;
        }
        let arr = j.dataItem.filter(item => item !== i.val);
        if(arr.length !== j.dataItem.length){    // 如果过滤后的长度和过滤前的长度不一致说明有过滤出相同元素
          message.info('分组的元素不能有重复');
          return;
        }
      }
    }
    const list = {
      title: this.state.dimensionName + '+' + groupName,
      dataItem,
      case: length,
      dimColumn,
      dimValue
    }
    saveAllData.push(list);
    this.props.form.setFieldsValue({ [this.state.dimensionCode]: [] });
    this.setState({ selectList: [], groupNameModelVisible: false, saveAllData, getAllData: [] })
  }

  // 下拉框取消选中
  onDeselect = (value) => {
    let { getAllData, selectList } = this.state;
    selectList = selectList.filter(item => item !== value);
    getAllData = getAllData.filter(item => item.val !== value);
    this.setState({ getAllData, selectList });
  }

  // 删除分组
  confirm = (data) => {
    const json = JSON.stringify(data);
    let { saveAllData } = this.state;
    saveAllData = saveAllData.filter(item => JSON.stringify(item) !== json);
    this.setState({ loading: true });
    setTimeout(() => {
      // 因为使用了监听变化，所以这里需要改变父组件的saveAllData，然后再次被监听改变当前的state
      // 如果仅仅改变当前的state，再次选择维度会重新被监听到父组件的saveAllData，从而跟没删除一样
      this.props.root.setState({ saveAllData });    
      this.setState({ loading: false });
    }, 200);
  }

  // 获取表格的数据
  dataSource(){
    let arr = this.props.dimensionGroup.filter(item => item.nowChooes.split('+')[0] === this.props.nowChooes.split('+')[0]);
    return (
      arr.filter(item => item.name === this.props.nowChooes.split('+')[1])
    )
  }

  render() {
    const { loading, form: { getFieldDecorator } } = this.props;
    const columns = [
      {
        title: '维度名',
        dataIndex: 'name',
        align: 'center',
      },
      {
        title: '维度分组结果',
        dataIndex: 'result',
        align: 'center',
        width: 400,
        render: (text, record, index) => {
          let itemArr = [];
          if (record.result.length > 0) {
            record.result.map((i) => {
              let dataItemName = [];
              if (i.title.split('+')[0] === record.name) {
                let tempContextName = [];
                i.dataItem.map((item) => {
                  tempContextName.push(item.split('+')[0]);
                })
                const item = (
                  <div>｛{`${tempContextName}`}｝</div>
                );
                return itemArr.push(item);
              }
            });
          }
          return (
            <span>
              {itemArr.map((item) => { return item })}
            </span>
          );
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        align: 'center',
        render: (text, record, index) => {
          return (
            <a onClick={e => this.showModel(record)}>重置维度</a>
          );
        }
      },
    ];
    // 使用过滤的dataSource，保证显示的是当前点击的
    let arr = this.props.dimensionGroup.filter(item => item.nowChooes.split('+')[0] === this.props.nowChooes.split('+')[0]);
    let dataSource = arr.filter(item => item.name === this.props.nowChooes.split('+')[1]);
    return (
      <Form>
        <Table
          rowKey='id'
          pagination={false}
          size='small'
          bordered
          onChange={this.handleTablePage}
          columns={columns}
          loading={loading}
          dataSource={ dataSource }
        />
        <Modal
          visible={this.state.dimensionModelVisible}
          onOk={this.hendleShowModel}
          onCancel={this.onCancelDimModel}
          maskClosable={false}
          title='维度分组'
          width={1200}
        >
          <Row>
            <Col>
              <FormItem label={this.state.dimensionName} {...formItemLayout}>
                <div>
                  {getFieldDecorator(`selectDimension`, { initialValue: [] })(
                    <Cascader
                      style={{ width: 90 }}
                      options={this.state.optionsGroup}
                      displayRender={ () => [] } // this.renderSelect
                      loadData={this.loadData}
                      onChange={this.onChange}
                      allowClear={false}
                      changeOnSelect
                      placeholder={''}
                    />
                  )}
                  {getFieldDecorator(`${this.state.dimensionCode}`, { initialValue: [] })(
                    <Select
                      mode="multiple"
                      notFoundContent=''
                      style={{ width: 420 }}
                      onDeselect={ this.onDeselect }
                    >
                      {[]}
                    </Select>
                  )}
                  <Button onClick={ this.sureGroup } style={{ margin: '0 4px 0 14px' }}>
                    确定分组
                  </Button>
                </div>
              </FormItem>
            </Col>
          </Row>
          <Spin spinning={this.state.loading}>
            <List
              rowKey="id"
              grid={{ gutter: 16, column: 4 }}
              dataSource={ this.state.saveAllData }
              renderItem={item => (
                <List.Item>
                  <Card title={item.title.split('+')[1]} key={item.title}>
                    <Popconfirm placement="bottomRight" title='请确定要删除吗？' onConfirm={e => this.confirm(item)} okText="确定" cancelText="取消">
                      <Button icon='close' style={{ position: 'absolute', top: 0, right: 0 }} />
                    </Popconfirm>
                    {item.dataItem.map((i) => {
                      return (
                        <div style={{ fontSize: 15, margin: '0 0 4px 20px' }} key={i}>{i.split('+')[0]}</div>
                      );
                    })}
                  </Card>
                </List.Item>
              )}
            />
          </Spin>
        </Modal>
        <Modal
          visible={this.state.groupNameModelVisible}
          onOk={e => this.onOkGroupNameModel(e)}
          onCancel={() => { this.setState({ groupNameModelVisible: false }) }}
          destroyOnClose={true}
          title='自定义分组命名'
          >
           <div><span>名称</span><Input id='groupName' ref={ input => this.input = input } style={{ width: '60%', marginLeft: 10 }}/></div> 
        </Modal>
      </Form>
    );
  }
}
