import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Select, Row, Cascader, Icon, Button, Modal } from 'snk-web';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class FilterData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cascaderOption: [],   // 联级数据
      userPost: true,       // 筛选数据维度是否发送请求
      userOnce: true,       // 在筛选数据维度联级的时候只发送一次请求，后续不发送
      getAllData: [],       // 存放所有联级选择后的对象
      selectList: [],       // 下拉框展示的数据
      filterData: [],       // 在添加过滤器的时候会因为新点击选择的值触发onchange改变getAllData，所以在添加过滤器的时候把现在的getAllData给push进来
      filterSave: [],       // 提供给保存结果的筛选数据维度的value集合，方便回显时数据显示
    }
  }

  // 点击联级框发送请求获取联级数据
  getCascader = async () => {
    const { getFilter, themeId, appId } = this.props.root.state;

    // 如果父组件有传递parent，则请求之后的数据只用包含parent节点的，如果有传递otherPayload，则是额外追加请求参数
    let { parent, otherPayload, filter, useFnc } = this.props;

    if (useFnc) {
      await this.props.root.useFnc();
      // 这里是按照父组件对应的方式写死了参数，因为父组件需要再去修改state，但是props已经传递过来了
      otherPayload = this.props.root.state.appThemeList;
    }
    // if(!this.state.userOnce) return;

    let otherObj = {};
    if (otherPayload) otherObj = otherPayload;
    if (this.props.id && this.state.userOnce === true) {
      this.props.dispatch({
        type: `analysis/${getFilter}`,
        payload: { themeId, appId, ...otherObj }
      }).then(() => {
        let filterData = this.props.analysis[getFilter + 'Data'];
        if (parent) {
          filterData = filterData.filter(item => {
            for (let i of parent) {
              if (item.dimDesc === i) return item
            }
          })
        }

        if (filter) {
          filterData = filterData.filter(item => {
            for (let i of filter) {
              if (item.dimTable !== i) return item
            }
          })
        }

        let cascaderOption = [];
        for (let i of filterData) {
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
      })
    }
  }

  // 选择联级项后发送请求
  loadData = (selectedOptions, item) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    const { root: { state: { getFilterAfter } } } = this.props;   // 这里引入父级状态中的过滤，因为模块不同，联级的请求路径也不同
    if (!targetOption.getPost) return;    // 如果这个属性为false，就不进行操作
    targetOption.loading = true;
    setTimeout(() => {
      targetOption.loading = false;
      this.props.dispatch({
        type: `analysis/${getFilterAfter}`,
        payload: targetOption.obj
      }).then(() => {
        const arr = [];
        const getData = this.props.analysis[getFilterAfter + 'Data'];
        for (let i of getData) {    // 这里循环是为了给子项也设置好属性
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
      }).catch(() => {
        // 如果请求失败了，证明是没有子项，改变属性，不再重复请求，
        // 考虑用户关闭了联级后再选，不会因为没有子项而导致多选不流畅，所以不改变isLeaf
        targetOption.getPost = false;
      })
    }, 300);
  };

  // 地区联级选择的展示
  renderSelect(label) {
    if (label.length !== 0) {
      return label[0];
    }
  }

  // 选中联级后把值推给下拉
  changeCascader(value, valueObj, item) {
    setTimeout(() => {
      console.log(this.props.form.getFieldValue('selectDim0'))
    });
    // 此处判定父节点是否给了getChange，如果有说明父组件需要做其他事情
    if (this.props.getChange) this.props.root.getChange(value)

    let { getAllData, selectList, filterData, filterSave } = this.state;
    let selectName = `dimensionArr${item}`;    //  下拉框的组件名
    let getAllDataArr = [];    // 替代getAllData
    let selectListArr = []    // 替代selectList
    let addItem = true;
    let val = value.slice(-1)[0];   //  记录选中的值
    let obj = { val, case: value.length }
    // 回显信息可以先行执行，不受其他限制
    if (!filterSave[item]) {
      filterSave[item] = {
        parent: [value[0]],
        children: value.length > 1 ? [value[value.length - 1]] : [],    // 如果没有操作过就直接给定最后一个值保存为select需要展示的值
        length: value.length
      };
    } else {
      filterSave[item] = {
        parent: [value[0]],
        children: value.length > 1 ? (filterSave[item].length === value.length ?    // 按照是否同层级操作给定不同的值
          [...filterSave[item].children, value[value.length - 1]] : [value[value.length - 1]]) : [],
        length: value.length
      };
    }
    this.setState({ filterSave })

    // 循环第二个参数，把需要的值代入obj
    for (let i of valueObj) {
      if (i.obj.dimLevel) {
        obj.dimColumn = i.dimColumn;
        obj.dimValue = i.dimValue;
      }
    }

    if (getAllData.length === 0) {   // 第一次直接加
      getAllData.push(obj);
      if (obj.case !== 1) filterData[item] = getAllData; // 把getAllData数据放入filterData当中保存，这样不会流失，而且能更新
      // 这里需要循环展示filterData中的数据，不能和自定义分组一样，这里需要下标控制
      // 防止：当一个用户添加过滤后，操作了最后一个，又回头操作第一个会出问题，显示的值也不一样
      for (let i in filterData) {
        if (parseInt(i) === item) {
          for (let j of filterData[i]) {
            if (j.case === 1) selectListArr = [];   // 不展示一级目录
            else selectListArr.push(j.val);
          }
        }
      }
      this.props.form.setFieldsValue({ [selectName]: selectListArr });
      this.setState({ getAllData, selectList: selectListArr, filterData });

    } else {
      for (let i of getAllData) {
        // 如果选中的是重复值就pass，这里只比较两个，因为loadData在之后才执行，之后改变了obj所有只能对比两项，不能用json判断对象
        if (i.val === obj.val && i.case === obj.case) return;
        else if (i.case === obj.case) {
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

      // if (i.case !== 1 && filterData[item][0].dimColumn !== getAllData[0].dimColumn) getAllData = getAllDataArr;
      // 把getAllData数据放入filterData当中保存，这样不会流失，而且能更新
      for (let i of getAllData) {
        if (i.case !== 1) {
          if (filterData[item] && getAllData[0]) {
            if (filterData[item][0] && filterData[item][0].dimColumn !== getAllData[0].dimColumn) getAllData = getAllDataArr;
          }
          filterData[item] = getAllData;
        }
      }
      // 这里需要循环展示filterData中的数据，不能和自定义分组一样，这里需要下标控制
      // 防止：当一个用户添加过滤后，操作了最后一个，又回头操作第一个会出问题，显示的值也不一样
      for (let i in filterData) {
        if (parseInt(i) === item) {
          for (let j of filterData[i]) {
            if (j.case === 1) selectListArr = [];   // 不展示一级目录
            else selectListArr.push(j.val);
          }
        }
      }

      this.props.form.setFieldsValue({ [selectName]: selectListArr });
      this.setState({ getAllData, selectList: selectListArr, filterData });
    }
  }

  // 点击删除
  remove(index) {
    const { form } = this.props;
    const { filterData, filterSave, getAllData } = this.state;
    let keys = form.getFieldValue('keys');
    keys = keys.filter(item => item !== index);

    // 删除需要把当前位置的数组值清空，保留位置不能删除
    filterData[index] = [];

    // 删除可以把当前数据删除，不需要保留位置
    filterSave.splice(index, 1);
    this.setState({ filterData, filterSave })

    form.setFieldsValue({ 'keys': keys, [`dimensionArr${index}`]: [] });
  }

  // 添加过滤器
  add = () => {
    const keys = this.props.form.getFieldValue('keys');
    const now = keys.slice(-1)[0] + 1;
    keys.push(now);
    this.props.form.setFieldsValue({ 'keys': keys });
  }

  // 下拉框取消选中
  deselect = (value, index) => {
    let { getAllData, selectList, filterData, filterSave } = this.state;
    selectList = selectList.filter(item => item !== value);
    getAllData = getAllData.filter(item => item.val !== value);

    // 过滤getAllData的同时也需要过滤filterData
    filterData[index] = filterData[index].filter(item => item.val !== value);
    if (filterData[index].length === 0) filterData[index] = [];

    // 过滤filterSave
    filterSave[index].children = filterSave[index].children.filter(item => item !== value);
    this.setState({ getAllData, selectList, filterData });

    // 此处判定父节点是否给了getChange，如果有说明父组件需要做其他事情
    if (this.props.getChange) this.props.root.getChange(value);
  }

  render() {
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    };
    const { form: { getFieldDecorator, getFieldValue }, noFilter, span } = this.props;
    const formItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: span ? span : 10 },
    };
    const keyArr = [0];
    getFieldDecorator('keys', { initialValue: keyArr });
    const keys = getFieldValue('keys');
    return (
      <Form>
        {keys.map(item => {
          return (
            <FormItem {...formItemLayout} style={{ width: '100%', display: 'flex' }} key={item}>
              {getFieldDecorator(`selectDim${item}`, { initialValue: [] })(
                <Cascader
                  style={{ width: 80 }}
                  onClick={this.getCascader}
                  displayRender={this.renderSelect}
                  options={this.state.cascaderOption}
                  loadData={e => this.loadData(e, item)}
                  changeOnSelect={true}
                  onChange={(e, obj) => this.changeCascader(e, obj, item)}
                  placeholder=''
                  allowClear={false}
                />
              )}

              {getFieldDecorator(`dimensionArr${item}`, { initialValue: [] })(
                <Select onDeselect={e => this.deselect(e, item)} mode="multiple" style={{ width: 'calc(100% - 102px)' }}>
                  {[]}
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
        })}
        {noFilter ? null :

          <FormItem {...formItemLayoutWithOutLabel} style={{ display: 'block' }}>
            <Button
              type="dashed"
              onClick={this.add}
              style={{ width: '60%' }}
              disabled={!(this.props.form.getFieldValue(
                `dimensionArr${this.props.form.getFieldValue('keys')[this.props.form.getFieldValue('keys').length - 1]}`).length > 0)
              }
            >
              <Icon type="plus" /> 添加过滤器
          </Button>
          </FormItem>}
      </Form>
    )
  }
}