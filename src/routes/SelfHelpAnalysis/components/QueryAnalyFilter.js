import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Form, Spin, Card, message, InputNumber, Input, Select, Col, Row, 
    Tree, Button, Icon, DatePicker } from 'snk-web';
import moment from 'moment';

const formItemLayoutWithOutLabel = {
    wrapperCol: {
      xs: { span: 24, offset: 0 },
      sm: { span: 20, offset: 4 },
    },
  };
const FormItem = Form.Item;
const Option = Select.Option;
const TreeNode = Tree.TreeNode;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class QueryAnalyFilter extends PureComponent {
  state = {
    isDataType: '', // 过滤字段数据类型
    isDateFlag: '0', //过滤添加的字段是否为时间， 1是 0不是
    isColType: '', // 0是指标，1是维度，下拉选择，2高基维度，自行填写
    filterConfigName: '',
    filterInfo: [],
    clickFilterInfo: '',
    editItem: {},
    addFilterFlag: 0,
    uuid: 1,
    loadingList: false,
  }
  componentDidMount() {}

  // 确定添加过滤添加
  onAddFilterList = () => {
    if (this.props.filterItemList.length > 0) { 
      if (this.state.addFilterFlag === 1) { // 修改的时候 添加前 先判断修改的字段是否存在 存在先删除 在添加
        this.props.filterItemList.map((i,index) => {
          if (i.tbId === this.state.editItem.tbId && i.colCname === this.state.editItem.colCname && i.value === this.state.editItem.value) {
            this.props.filterItemList.splice(index,1);
          }
        });
      }
    }
    let filterItemList = [];
    this.props.form.validateFields((err, values) => {
      // 时间
      if (this.state.isDateFlag === '1') {
          if (values.keys.length > 0) {
            let list = {}, dateContext = [], symbolArr = [], dateFlag = true;
            values.keys.map((i) => {
              if (values[`dateContext${i}`] !== undefined && values[`dateContext${i}`] !== null && values[`selectSymbol${i}`] !== undefined){
                dateContext.push(values[`dateContext${i}`].format("YYYY-MM-DD"));
                symbolArr.push(values[`selectSymbol${i}`]);
                dateFlag = true;
              } else {
                message.warn('请把信息配置完整');
                dateFlag = false;
                return;
              }
            });
            if (dateFlag) {
              list = this.getListValue(dateContext,symbolArr);
              this.props.filterItemList.push(list);
              filterItemList = this.props.filterItemList; 
            }
            // 清空内容
            setTimeout(()=>{
              values.keys.map((i,index) => {
                const selectSymbol = `selectSymbol${index}`;
                const dateContext = `dateContext${index}`;
                this.props.form.setFieldsValue({
                  [selectSymbol]: '',
                  [dateContext]: undefined,
                  keys: [0]
                });
              });
            },100);
            this.setState({ uuid: 1, });
          }
        } else {
          // 指标
          if (this.state.isColType === '0') { 
            if (values.keys.length > 0) {
              let list = {}, measureContext = [], symbolArr = [], measureFlag = true;
              values.keys.map((i) => {
                if (values[`selectSymbol${i}`] !== undefined && values[`measureContext${i}`] !== undefined) {
                  symbolArr.push(values[`selectSymbol${i}`]);
                  measureContext.push(values[`measureContext${i}`]);
                  measureFlag = true
                } else {
                  measureFlag = false;
                  // message.warn('请把信息配置完整');
                }
              });
              if (measureFlag) {
                list = this.getListValue(measureContext,symbolArr);
                this.props.filterItemList.push(list);
                filterItemList = this.props.filterItemList;
              }
              // 清空内容
              setTimeout(()=>{
                values.keys.map((i,index) => {
                  const selectSymbol = `selectSymbol${index}`;
                  const measureContext = `measureContext${index}`;
                  this.props.form.setFieldsValue({
                    [selectSymbol]: '',
                    [measureContext]: '',
                    keys: [0]
                  });
                });
              },100);
              this.setState({ uuid: 1, });
            }
          } else if (this.state.isColType === '1') { // 维度
            let dimDescFlag = true;
            if (values.dimDesc !== undefined && values.dimDesc.length > 0) {
              let list = {}, filterContext = [], symbolArr = [];
              values.dimDesc.map((item) => {
                filterContext.push(item);
                symbolArr.push('=');
              });
              list = this.getListValue(filterContext,symbolArr);
              this.props.filterItemList.push(list);
              filterItemList = this.props.filterItemList;  
            } else {
              // message.warn('请选择维度元素');
              return
            }
            // 清空内容
            setTimeout(()=>{
              values.keys.map((i,index) => {
                this.props.form.setFieldsValue({ dimDesc: [], });
              });
            },100);
          } else { // 高基维度
            if (values.keys.length > 0) {
              let list = {}, hightDimenContext = [], symbolArr = [], hightDimenFlag =  true;
              values.keys.map((i) => {
                if (values[`hightDimenContext${i}`] !== '' && values[`hightDimenContext${i}`] !== undefined) {
                  symbolArr.push('=');
                  hightDimenContext.push(values[`hightDimenContext${i}`]);
                  hightDimenFlag = true;
                } else {
                  hightDimenFlag = false
                  // message.warn('请把信息填写完整');
                }
              });
              if (hightDimenFlag) {
                list = this.getListValue(hightDimenContext,symbolArr);
                this.props.filterItemList.push(list);
                filterItemList = this.props.filterItemList;
              } 
              // 清空内容
              setTimeout(()=>{
                values.keys.map((i,index) => {
                  const hightDimenContext = `hightDimenContext${index}`;
                  this.props.form.setFieldsValue({
                    [hightDimenContext]: '',
                    keys: [0]
                  });
                });
              },100);
              this.setState({ uuid: 1, });
            }
          }
        }
    });
    this.setState({ loadingList: true, filterItemList, });
    setTimeout(()=>{
      this.setState({ loadingList: false, filterItemList, });
    },100);
  }

  getListValue = (context,symbol) => {
    const list = {};
    list['checkedKeys'] = this.state.filterInfo;
    list['colCname'] = this.state.filterInfo[0].split('-')[0];
    list['dbName'] = this.state.filterInfo[0].split('-')[1];
    list['tbId'] = this.state.filterInfo[0].split('-')[2];
    list['tbName'] = this.state.filterInfo[0].split('-')[3];
    list['colId'] = this.state.filterInfo[0].split('-')[4];
    list['colName'] = this.state.filterInfo[0].split('-')[5];
    list['dateFlag'] = this.state.filterInfo[0].split('-')[6];
    list['dataType'] = this.state.filterInfo[0].split('-')[7];
    list['colType'] = this.state.filterInfo[0].split('-')[8];
    list['tbCname'] = this.state.filterInfo[0].split('-')[9];
    list['value'] = context;
    list['operation'] = symbol;
    return list;
  }

  // 取消选择的过滤条件
  onCancelFilter = () => {
    // 不是维度的情况
    if (!(this.state.isColType === '1' && this.state.isDateFlag === '0')) {
      this.props.form.setFieldsValue({ keys: [0], });
      this.setState({ uuid: 1 });
    }
    if (this.state.isDateFlag === '1') { // 时间
      this.props.form.setFieldsValue({selectSymbol0: '' });
    } else {
      if (this.state.isColType === '0') { // 指标
        this.props.form.setFieldsValue({ measureContext0 : '', selectSymbol0: '' });
      } else if (this.state.isColType === '1') { // 维度
        this.props.form.setFieldsValue({ dimDesc: [], });
      } else { //高基维度
        this.props.form.setFieldsValue({ hightDimenContext0: '' });
      }
    }
  }

  onCancelFilterList = () => {
    this.props.root.onCancelFilterList();
  }

  addTime = () => {
    this.props.form.validateFields((err, values) => {
      const { form } = this.props;
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(this.state.uuid);
        this.state.uuid++;
        form.setFieldsValue({
          keys: nextKeys,
        });
    });
  }

  removeTime = (k) => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    form.setFieldsValue({
      keys: keys.filter(keys => keys !== k),
    });
  }

  editFilterList = (e,item) => {
    this.setState({ 
      editItem: item, 
      addFilterFlag: 1, 
    });
    let keys = [];
    item.value.map((i,index) => {
      keys.push(index);
    });

    // 不是高基维度
    if (!(item.checkedKeys[0].split('-')[8] === '1' && item.dateFlag === '0')) {
      this.props.form.setFieldsValue({ keys: keys, });
      this.setState({ uuid: item.value.length });
    }
    // 时间
    if (item.checkedKeys[0].split('-')[6] === '1') {
      keys.map((i) => {
        const selectSymbol = `selectSymbol${i}`;
        const dateContext = `dateContext${i}`;
        setTimeout(()=>{
          this.props.form.setFieldsValue({ 
            [selectSymbol]: item.operation[i], 
            [dateContext]: moment(item.value[i],'YYYY-MM-DD'),
          });
        },200);
      });
    } else { 
      // 指标
      if (item.checkedKeys[0].split('-')[8] === '0' ) {
        keys.map((i) => {
          const selectSymbol = `selectSymbol${i}`;
          const measureContext = `measureContext${i}`;
          setTimeout(()=>{
            this.props.form.setFieldsValue({ 
              [selectSymbol]: item.operation[i], 
              [measureContext]: item.checkedKeys[0].split('-')[7] === 'string' ? item.value[i] : Number(item.value[i]),
            });
          },200);
        });
      } else if (item.checkedKeys[0].split('-')[8] === '1') { // 维度
        this.props.root.getDimDescData('edit',item);
      } else { // 高基维度 
        keys.map((i) => {
          const hightDimenContext = `hightDimenContext${i}`;
          setTimeout(()=>{
            this.props.form.setFieldsValue({ 
              [hightDimenContext]: item.value[i],
            });
          },200);
        });
      }
    }
    this.setState({
      isDataType: item.dataType,
      isDateFlag: item.checkedKeys[0].split('-')[6],
      isColType: item.checkedKeys[0].split('-')[8],
      filterConfigName: item.colCname,
      filterInfo: item.checkedKeys,
      clickFilterInfo: '0',
    });
  }

  deleteFilterList = (e,item) => {
    this.props.filterItemList.map((i,index) => {
      if (i.tbId === item.tbId && i.value === item.value) {
        this.props.filterItemList.splice(index,1);
      }
    });
    const filterItemList = this.props.filterItemList;
    if (filterItemList.length === 0) {
      this.setState({ filterInfo: [], filterConfigName: '', clickFilterInfo: '', });
    }
    this.setState({ loadingList: true, });
    this.props.form.setFieldsValue({ dimDesc: [], });
    setTimeout(()=>{
      this.setState({ loadingList: false, filterItemList, });
      this.props.form.setFieldsValue({ dimDesc: [], });
      if (this.state.clickFilterInfo !== '' && this.state.filterConfigName === item.colCname) {
        this.setState({ clickFilterInfo: '', });
      }
    },100);
  }

  onCheck = (checkedKeys) => { 
    if (checkedKeys.length === 2) { // 只能选一个
      checkedKeys.shift();
      // this.setState({ filterInfo: checkedKeys, });
    }
    if (checkedKeys[0].split('-').length > 2) { // 点击子节点
      const filterConfigName = checkedKeys[0].split('-')[0];
      const isDateFlag = checkedKeys[0].split('-')[6];
      const isDataType = checkedKeys[0].split('-')[7];
      const isColType = checkedKeys[0].split('-')[8];
      if (isDateFlag === '1') { // 时间
      this.props.form.setFieldsValue({selectSymbol0: '', dateContext0: undefined });
      } else if (isColType === '0') { // 指标
        this.props.form.setFieldsValue({measureContext0 : '', selectSymbol0: '' });
      } else if (isColType === '1') { // 维度 
        this.props.form.setFieldsValue({ dimDesc: [], });
      } else { // 高基维度
        this.props.form.setFieldsValue({ hightDimenContext0: '' });
      }
      this.setState({ 
        filterConfigName, isDateFlag, isDataType, isColType, 
        clickFilterInfo: '0', uuid: 1, filterInfo: checkedKeys, 
        addFilterFlag: 0,
      });
      this.props.form.setFieldsValue({ keys: [0]});
      if (checkedKeys[0].split('-')[8] === '1') {
        this.props.root.getDimDescData('select',checkedKeys);
      }
    } 
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item} disabled>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  }

  // 过滤器树形数据
  renderFilterInfo () {
      const {getFilterInfoData} = this.props.analysis;
      const treeData = [];
      if (getFilterInfoData.length > 0) {
        getFilterInfoData.map((i) => {
          let treeDataChild = {};
          treeDataChild['title'] = i.tbCname;
          treeDataChild['key'] = i.dbName +'-'+ i.tbId;
          let treeDataChildArr = [];
          i.farColumnDictList.map((k) => { // colType (0是指标，1是维度，下拉选择，2高基维度，自行填写)
            let childList = {};
            childList['title'] = k.colCname;
            childList['key'] = k.colCname +'-'+ k.dbName +'-'+ k.tbId +'-'+ k.tbName +'-'+ k.colId +'-'+ k.colName +'-'+ k.dateFlag +'-'+ k.dataType +'-'+ k.colType +'-'+ i.tbCname;
            treeDataChildArr.push(childList);
          }); 
          treeDataChild['children'] = treeDataChildArr;
          treeData.push(treeDataChild);
        });
      }

      return ( 
        <Tree
          onExpand={this.props.root.filterOnExpand}
          expandedKeys={this.props.filterExpandedKeys}
          onCheck={this.onCheck}
          checkedKeys={this.state.filterInfo}
          checkable
        >
        {this.renderTreeNodes(treeData)}
      </Tree>
      );
  }

   // 过滤器操作
  renderFilterConfig = () => {
    const { loading, form: { getFieldDecorator, getFieldValue } } = this.props;
    const symbol = ['>','<','=','>=','<='];
    const getSymbolOption = [];
    symbol.map((item) => {
      const list = (
        <Option value={item} key={item}>{item}</Option>
      );
      getSymbolOption.push(list);
    });
    getFieldDecorator('keys', { initialValue: [0] });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => { //  时间
      if (this.state.isDateFlag === '1') { 
        return (
          <Col md={10} sm={24}>
              <FormItem
              style={{ display: 'block' }}
              {...(formItemLayoutWithOutLabel) }
              label={''}
              required={false}
              key={k}
            > 
              {getFieldDecorator(`selectSymbol${k}`)(  
                <Select style={{ width: 70, marginRight: 2, }} allowClear >
                  {getSymbolOption.map((i) => { return i })}
                </Select>
              )}
              {getFieldDecorator(`dateContext${k}`)(<DatePicker />)}
              {k !== 0 ? (
                <Icon
                  style={{ marginLeft: 10 }}
                  className="dynamic-delete-button"
                  type="minus-circle-o"
                  onClick={() => this.removeTime(k)}
                />
              ) : null}
            </FormItem>
          </Col>
        );
      } else {
        // 字段是指标
        if (this.state.isColType === '0') {  
          if (this.state.isDataType === 'string') {
            return (
              <Col md={10} sm={24}>
                <FormItem
                style={{ display: 'block' }}
                {...(formItemLayoutWithOutLabel) }
                label={''}
                required={false}
                key={k}
              > 
                {getFieldDecorator(`selectSymbol${k}`)(
                  <Select style={{ width: 70, marginRight: 2, }} allowClear >
                    {getSymbolOption.map((i) => { return i })}
                  </Select>
                )}
                {getFieldDecorator(`measureContext${k}`)(<Input />)}
                {k !== 0 ? (
                  <Icon
                    style={{ marginLeft: 10 }}
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                    onClick={() => this.removeTime(k)}
                  />
                ) : null}
              </FormItem>
            </Col>
            );
          } else {
            return (
              <Col md={10} sm={24}>
                <FormItem
                style={{ display: 'block' }}
                {...(formItemLayoutWithOutLabel) }
                label={''}
                required={false}
                key={k}
              > 
                {getFieldDecorator(`selectSymbol${k}`)(
                  <Select style={{ width: 70, marginRight: 2, }} allowClear >
                    {getSymbolOption.map((i) => { return i })}
                  </Select>
                )}
                {getFieldDecorator(`measureContext${k}`)(<InputNumber />)}
                {k !== 0 ? (
                  <Icon
                    style={{ marginLeft: 10 }}
                    className="dynamic-delete-button"
                    type="minus-circle-o"
                    onClick={() => this.removeTime(k)}
                  />
                ) : null}
              </FormItem>
            </Col>
            );
          }
        } else if (this.state.isColType === '2'){ // 高基维度
          return (
            <Col md={12} sm={24}>
              <FormItem
                {...(formItemLayoutWithOutLabel) }
                label={''}
                required={false}
                key={k}
              > 
              {getFieldDecorator(`hightDimenContext${k}`)(<Input style={{ width: 260 }}/>)}
              {k !== 0 ? (
                <Icon
                  style={{ marginLeft: 10 }}
                  className="dynamic-delete-button"
                  type="minus-circle-o"
                  onClick={() => this.removeTime(k)}
                />
              ) : null}
              </FormItem>
            </Col>
          );
        }
      }
    });

    const {getDimDescData} = this.props;
    const getDimDescArr = [];
    getDimDescData.map((i) => {
      const list = (
        <Option value={i.dimCode} key={i.dimCode}>{i.dimCode}</Option>
      );
      getDimDescArr.push(list);
    })

    return (
      <div>
        <div style={{ height: 40, lineHeight: '40px', paddingLeft: 20, fontSize: 16, borderBottom: '1px solid #d9d9d9'}}>
          <span style={{ display: this.state.filterConfigName !== '' ? '' : 'none'}}>配置【{this.state.filterConfigName}】信息</span>
        </div>
        <div style={{ display: this.state.clickFilterInfo !== '' ? '' : 'none', marginTop: 10,}}>
          {
            this.state.isColType === '1' && (this.state.isDateFlag === '0' || this.state.isDateFlag === '2') ? 
            <div style={{ textAlign: 'center'}}>
                {getFieldDecorator(`dimDesc`)(
                  <Select style={{ width: '80%' }} mode="multiple" allowClear >
                    {getDimDescArr.map((item) => { return item })}
                  </Select>
                )}
               <div style={{ margin: '10px 0 4px', textAlign: 'left'}}>
                <Button style={{ margin: '0 10px'}} onClick={this.onAddFilterList}>确定</Button>
                <Button onClick={this.onCancelFilterList}>取消</Button>
              </div>
            </div> :
            <div>
              <Row gutter={{ md: 6, lg: 18, xl: 48 }}>
              {formItems}
              </Row>
              <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
                <Button type="dashed" onClick={this.addTime} style={{ width: '60%' }}
                disabled={false}>
                  <Icon type="plus" /> 添加配置
                </Button>
              </FormItem>
               <div style={{ margin: '10px 0 4px' }}>
                <Button style={{ margin: '0 10px'}}  onClick={this.onAddFilterList}>确定</Button>
                <Button onClick={this.onCancelFilter}>取消</Button>
              </div> 
            </div>
          }
        </div>
      </div>
    );
  }

  renderForm () {
    const gridStyle = {
      textAlign: 'center',
      marginRight: 4,
    };
    const listItem = {
      marginRight: 4,
      display: 'inline-block',
      width: 30,
      textAlign: 'center',
    }
    const CardList = [];
    if (this.props.filterItemList.length > 0) {
      this.props.filterItemList.map((item) => {
        const list = (
          <Col span={6}>
            <Card title={item.colCname} style={gridStyle}>
              <div style={{ textAlign: 'left', }}>
                {item.operation.map((i,index) => {
                  return (
                    item.checkedKeys[0].split('-')[8] === '1' && item.checkedKeys[0].split('-')[6] === '0' ?
                    <div><span>{item.value[index]}</span></div>
                    :
                    item.checkedKeys[0].split('-')[8] === '2' && item.checkedKeys[0].split('-')[6] === '0' ? 
                    <div><span>{item.value[index]}</span></div>
                    :
                    <div><span style={listItem}>{i}</span><span>{item.value[index]}</span></div>
                  );
                })}
              </div>
              <div style={{ textAlign: 'right' }}>
                <a onClick={e=>this.editFilterList(e,item)} style={{ marginRight: 4 }}>修改</a>
                <a onClick={e=>this.deleteFilterList(e,item)}>删除</a>
              </div>
            </Card>
          </Col>
        );
        CardList.push(list);
      })
    }
    return(
      <div>
         <Spin spinning={this.state.loadingList}>
          <Card title="已添加的过滤条件" style={{ display: this.props.filterItemList.length > 0 ? '' : 'none', }}>
            <div>
              <Row gutter={18}>
              {CardList.map((item)=>{ return item; })}
              </Row>
            </div>
          </Card>
        </Spin> 
          <div style={{ 
            display: 'flex', border: '1px solid #d9d9d9', marginTop: 6, borderRadius: 4, padding: '0 0 0 21px', height: 600, 
          }}>
          <div style={{ width: '24%', borderRight: '1px solid #d9d9d9', padding: '10px 0', overflowY: 'scroll' }}>
            {this.renderFilterInfo()}
          </div>
          <div style={{ flex: 1,}}>
            {this.renderFilterConfig()}
          </div>
        </div>  
      </div>
    );
  }

  render () {
    return (
      <div>
        {this.renderForm()}
      </div>
    );
  }
}
