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
      dimensionCode: 'originFileName',
      dimensionModelVisible: false,
      customDimGroup: [], //存放点击对象
      customDimItemName: [], //存放显示对象
      customGroupTempData: [],
      fileValue: [],
      dimensionLabel: this.props.root.state.dimensionLabel,
      loading: false,
      groupNameModelVisible: false,
    };
  }

  componentDidMount() {
    this.setState({customGroupTempData:this.props.root.state.customGroupData});
   }

  addOk = () => {
    this.props.root.addOk();
  }

  onCancelDimModel = () => {
    this.setState({
      dimensionModelVisible: false,
      optionsGroup: [],
      customDimItemName: [],
      customDimGroup: [],
    });
    this.props.form.setFieldsValue({ [this.state.dimensionCode]: [] });
  }

  hendleShowModel = () => {
    const customGroupData = Array.from(new Set(this.props.root.state.customGroupData));
    console.log(customGroupData)
    if (this.props.dimensionGroup) { 
      this.props.dimensionGroup.map((item) => {
        const commontCuston = [];
        if (customGroupData.length > 0) {
          for (var i = 0; i < customGroupData.length; i++) {
            if (item.name === customGroupData[i].title.split('+')[0]) {
            commontCuston.push(customGroupData[i]);
            }
            item.result = commontCuston;
          }
        }
        item.result = commontCuston;
      })
    }
    this.setState({
      dimensionModelVisible: false,
      optionsGroup: [],
      customDimItemName: [],
      customDimGroup: [],
    });
    this.props.form.setFieldsValue({ [this.state.dimensionCode]: [] });
  }

  onChange = (value, selectedOptions) => {
    if (selectedOptions.length === 1 && this.state.optionsGroup !== undefined) {
      this.props.dispatch({
        // type: 'analysis/getDimensionContent',
        type: this.props.root.state.isRequertUrl,
        payload: {
          dimColumn: this.state.optionsGroup[0].value.split('+')[0],
          dimName: '',
          dimValue: '',
          themeId: this.props.root.state.themeId,
          appId: this.props.root.state.appId,
          dimTable: this.state.optionsGroup[0].value.split('+')[1]
        },
      }).then(() => {
        this.setState({ isLeaf: false });
      }).catch((e) => {
        if (e.code === 1) {
          this.setState({ isLeaf: true });
        }
      });
    } else {
      if (selectedOptions.length > 1) {
        setTimeout(() => {
          const companyItem = this.props.form.getFieldValue("selectDimension");
          const temp = companyItem[companyItem.length - 1];
          const tempName = temp.split('+')[1];
          if (this.state.customDimGroup.length === 0) {
            this.state.customDimGroup.push(temp); // 存放点击对象
            this.state.customDimItemName.push(tempName); // 存放显示对象 
            this.props.form.setFieldsValue({ [this.state.dimensionCode]: Array.from(new Set(this.state.customDimItemName)) });
          } else if (this.state.customDimGroup.length === 1) {
            if (temp.split('+')[3] > this.state.customDimGroup[0].split('+')[3]) {
              this.state.customDimGroup.shift();
              this.state.customDimGroup.push(temp);
              this.state.customDimItemName.shift();
              this.state.customDimItemName.push(tempName);
              this.props.form.setFieldsValue({ [this.state.dimensionCode]: Array.from(new Set(this.state.customDimItemName)) });
            } else if (temp.split('+')[3] === this.state.customDimGroup[0].split('+')[3]) {
              if (!this.state.customDimGroup.includes(temp)) {
                this.state.customDimGroup.push(temp);
              }
              if (!this.state.customDimItemName.includes(tempName)) {
                this.state.customDimItemName.push(tempName);
              }
              this.props.form.setFieldsValue({ [this.state.dimensionCode]: Array.from(new Set(this.state.customDimItemName)) });
            }
          } else if (this.state.customDimGroup.length > 1) {
            if (this.state.customDimGroup[0].split('+')[3] === temp.split('+')[3]) {
              if (!this.state.customDimGroup.includes(temp)) {
                this.state.customDimGroup.push(temp);
              }
              if (!this.state.customDimItemName.includes(tempName)) {
                this.state.customDimItemName.push(tempName);
              }
              this.props.form.setFieldsValue({ [this.state.dimensionCode]: Array.from(new Set(this.state.customDimItemName)) });
            } else if (temp.split('+')[3] > this.state.customDimGroup[0].split('+')[3]) {
              this.state.customDimGroup.splice(0, this.state.customDimGroup.length);
              this.state.customDimGroup.push(temp);
              this.state.customDimItemName.splice(0, this.state.customDimItemName.length);
              this.state.customDimItemName.push(tempName);
              this.props.form.setFieldsValue({ [this.state.dimensionCode]: Array.from(new Set(this.state.customDimItemName)) });
            }
          }
        }, 200);

        if (selectedOptions[selectedOptions.length - 1]) {
          const splitValue = selectedOptions[selectedOptions.length - 1].value;
          const payloadVlaue = splitValue.split("+");
          this.props.dispatch({
            // type: 'analysis/getDimensionContent',
            type: this.props.root.state.isRequertUrl,
            payload: {
              dimColumn: payloadVlaue[0],
              dimName: payloadVlaue[1],
              dimValue: payloadVlaue[2],
              themeId: this.props.root.state.themeId,
              appId: this.props.root.state.appId,
              dimTable: payloadVlaue[4],
            },
          }).then(() => {
            this.setState({ isLeaf: false });
          }).catch((e) => {
            if (e.code === 1) {
              this.setState({ isLeaf: true });
            }
          });
        }
      }
    }
  }

  loadData = (selectedOptions) => {
    let itemArr = [];
    let targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    setTimeout(() => {
      targetOption.loading = false;
      let getDimensionContentData;
      if (this.props.root.state.modelType === 'analysis') {
        getDimensionContentData = this.props.analysis.getDimensionContentData;
      } else {
        getDimensionContentData = this.props.mine.getDimensionContentData;
      }
      
      if (this.state.isLeaf === true) {
        this.setState({
          optionsGroup: [...this.state.optionsGroup],
        });
      } else {
        if (getDimensionContentData.length > 0) {
          for (const i in getDimensionContentData) {
            const item = {
              value: `${getDimensionContentData[i].dimColumn}+${getDimensionContentData[i].dimName}+${getDimensionContentData[i].dimValue}+${getDimensionContentData[i].dimLevel}+${getDimensionContentData[i].dimTable}`,
              label: `${getDimensionContentData[i].dimName}`,
              isLeaf: this.state.isLeaf,
            };
            itemArr.push(item);
          }
        }
        targetOption.children = itemArr;
        this.setState({
          optionsGroup: [...this.state.optionsGroup],
        });
      }
    }, 300);
  }

  showModel = (record) => {
    const item = {
      value: record.value + '+' + record.dimTable,
      label: record.name,
      isLeaf: false,
    }
    console.log(this.state.optionsGroup)
    this.state.optionsGroup.push(item);
    this.setState({ dimensionModelVisible: true, dimensionName: record.name, dimensionCode: record.value });
  }

  //确定分组
  sureGroup = (e) => {
    this.setState({ groupNameModelVisible: true, });
  }

  // 自定义分组命名确定
  onOkGroupNameModel = () => {
    const groupName = document.getElementById('groupName').value;
    if (this.state.customDimGroup.length > 0) { // customDimGroup--点击对象
      let tempArr = [], tempContextName = [], flag = false, deleteItemArr = [];
      const customDimGroup = this.state.customDimGroup;
      const customGroupData = this.props.root.state.customGroupData; // 储存所有元素的数组
      for (var j = 0; j < customDimGroup.length; j++) {
        for (var i = 0; i < customGroupData.length; i++) {
          if (customDimGroup[0].split('+')[4] === customGroupData[i].dimTable){
            customGroupData[i].dataItem.map((i) => {
              tempContextName.push(i.split('+')[0]);
            });
          }
          if (flag) return;
          if (customDimGroup[0].split('+')[4] === customGroupData[i].dimTable && customDimGroup[0].split('+')[3] < customGroupData[i].dimLevel) {
            message.info('只能对同一层级的元素进行分组！');
            flag = true;
          } else if (customDimGroup[0].split('+')[4] === customGroupData[i].dimTable && customDimGroup[0].split('+')[3] > customGroupData[i].dimLevel) {
            // 获取底层级元素
            deleteItemArr.push(customGroupData[i]);
          }
        }
        if (flag) return;
        if (tempContextName.indexOf(this.state.customDimGroup[j].split('+')[1]) != -1) {
          message.info('分组的元素不能有重复');
          return;
        } 
        const item = customDimGroup[j].split('+')[1] + '+' + customDimGroup[j].split('+')[2];
        this.state.fileValue.push(item);

        // 删除底层级元素
        for (const i of deleteItemArr) {
          this.props.root.state.customGroupData.map((item, index) => {
            if (i.dimTable === item.dimTable && i.dataItem.toString() === item.dataItem.toString() && i.title === item.title) {
              this.props.root.state.customGroupData.splice(index,1);
            }
          });
        }
      }

      if (this.state.fileValue.length > 0) {
        const list = {
          title: this.state.dimensionName + '+' + groupName,
          dataItem: [...new Set(this.state.fileValue)],
          dimColumn: this.state.customDimGroup[0].split('+')[0],
          dimTable: this.state.customDimGroup[0].split('+')[4],
          dimLevel: this.state.customDimGroup[0].split('+')[3],
        }
        this.props.root.state.customGroupData.push(list);
      }
      this.props.form.setFieldsValue({ [this.state.dimensionCode]: [] });
      this.setState({ customDimItemName: [], customDimGroup: [], groupNameModelVisible: false, fileValue: [],}); 
    } else {
      message.info('请选择过滤元素');
    }
  }

  // 删除单个元素
  onDeselect = (value) => {
    this.state.customDimItemName.map((item, index) => {
      if (item === value) {
        this.state.customDimItemName.splice(index, 1);
      }
    })
    this.state.customDimGroup.map((item, index) => {
      if (item.split('+')[1] === value) {
        this.state.customDimGroup.splice(index, 1);
      }
    })
  }

  // 删除分组
  confirm = (data) => {
    for (var i = 0; i < this.props.root.state.customGroupData.length; i++) {
      if (this.props.root.state.customGroupData[i] === data) {
        this.props.root.state.customGroupData.splice(i, 1)
      }
      const arr = this.props.root.state.customGroupData;
      this.setState({ loading: true });
      setTimeout(() => {
        this.setState({ customGroupData: arr, loading: false });
      }, 200);

    }
  }

  renderSelect = (label, selectedOptions) => {
    return label[0];
    if (label.length !== 0) {
      return label[0];
    }
  }

  render() {
    const { loading, form: { getFieldDecorator } } = this.props;
    let optionsGroup = [];
    if (this.state.optionsGroup !== undefined && this.props.dimensionGroup !== undefined) {
      optionsGroup = this.state.optionsGroup;
    }
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
          dataSource={
            this.props.dimensionGroup.filter(
              item => item.result.length > 0
                ?
                item.name === this.props.root.state.dimensionLabel && item.result.length > 0
                :
                item.name === this.props.root.state.dimensionLabel
            )
          }
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
                      displayRender={e=>{return []}} // this.renderSelect
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
                      onDeselect={e => this.onDeselect(e)}
                    >
                      {[]}
                    </Select>
                  )}
                  <Button onClick={e => this.sureGroup(`${this.state.dimensionName}`)} style={{ margin: '0 4px 0 14px' }}>
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
              dataSource={
                Array.from(new Set(this.props.root.state.customGroupData)).filter(item => item.title.split('+')[0] === `${this.state.dimensionName}`)
              }
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
          onCancel={e=> { this.setState({ groupNameModelVisible: false }) }}
          destroyOnClose={true}
          title='自定义分组命名'
          >
           <div><span>名称</span><Input id='groupName' style={{ width: '60%', marginLeft: 10 }}/></div> 
        </Modal>
      </Form>
    );
  }
}
