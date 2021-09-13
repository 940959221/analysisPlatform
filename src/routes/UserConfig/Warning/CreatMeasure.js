import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, Collapse, InputNumber, message, Radio } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';
import FilterData from '../../PayPredict/components/FilterData';
import { PublicFilter } from '../Component/PublicFilter';

const FormItem = Form.Item;
const Option = Select.Option;
const { Panel } = Collapse;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class CreatMeasure extends Component {
  state = {
    appId: 'supervise',                   // 应用id，默认使用综改监控_财务类
    themeId: 'finance',                   // 主题id，默认使用综改监控_财务类
    themeName: '综改监控_财务类',          // 指标主题的中文名，默认综改监控_财务类
    unit: [],                             // 单位
    frequency: [],                        // 统计频度
    getFilter: 'getUserFilter',
    getFilterAfter: 'getUserFilterDim',   // 给筛选数据维度组件使用
    filterState: [],                      // 筛选数据维度的所有状态
    indName: [],                         // 指标中文名
    valueData: [],                        // 值类型数组
    tenDays: false,                       // 10天前数据是否显示
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    let { appId, themeId } = this.state;

    this.props.dispatch({
      type: 'analysis/getThemeSelect',
    })

    // 公共请求指标
    let dispatch = (appId, themeId) => {
      this.props.dispatch({
        type: 'analysis/getUserMeasures',
        payload: {
          appId,
          themeId,
          visibleColumn: 'door'
        }
      })
    }

    // 手动配置组件单位和统计频度
    const unit = [{ key: 0, name: '自动' }, { key: 1, name: '亿元' }, { key: 2, name: '万元' }],
      frequency = [{ key: 'day', name: '日' }, { key: 'week', name: '周' }, { key: 'month', name: '月' }];
    this.setState({ unit, frequency, filterState: this.Filter.state })

    const { id } = this.props.location;
    // 如果存在id，则是指标库点击编辑后的情况
    if (id) {
      this.props.dispatch({
        type: 'analysis/qAlarmInfo',
        payload: { id }
      }).then(() => {
        const { qAlarmInfoData } = this.props.analysis;
        // 根据数据返回，回显数据
        const parse = JSON.parse(qAlarmInfoData.frontConfig);
        const state = JSON.parse(parse.state);
        const values = JSON.parse(parse.field);
        this.setState({ ...state })
        this.props.form.setFieldsValue(values)

        // 保存必须的状态
        const themeName = qAlarmInfoData.themeName,
          indName = qAlarmInfoData.indName;
        appId = qAlarmInfoData.themeId.split('_')[0];
        themeId = qAlarmInfoData.themeId.split('_')[1];
        this.setState({ appId, themeId, themeName, indName });

        dispatch(appId, themeId);     // 携带此时的两种id发起指标请求
        // 解析筛选数据维度的相关数据，处理筛选数据维度，进行回显
        let frontConfig = JSON.parse(parse.filter.split('+')[0]),
          filterForm = JSON.parse(parse.filter.split('+')[1]);
        let { filterData, filterSave, getAllData, selectList } = frontConfig;

        // 先判定是否需要删除筛选维度中的机构维度，调用公共函数
        if (filterSave.length > 0 && qAlarmInfoData.filterFlag === '1') {
          const newVal = PublicFilter(filterData, filterSave, getAllData, selectList, filterForm);
          if (newVal) {
            filterData = newVal.filterData;
            filterSave = newVal.filterSave;
            getAllData = newVal.getAllData;
            selectList = newVal.selectList;
            filterForm = newVal.fieldValue;
          }
        }
        this.Filter.setState({ ...frontConfig });
        this.Filter.setState({ userOnce: true });

        for (let i in filterForm) {
          this.Filter.props.form.setFieldsValue({
            [i]: i.slice(0, 9) === 'selectDim' ? [filterForm[i][0]] : filterForm[i]
          })
        }
        this.Filter.getCascader();
      }, err => {
        if (err.code === 1) {
          message.error(err.message);
          this.props.location.id = null;
        }
      })
    }
  }

  // 保存
  save = () => {
    this.props.form.validateFields((err, values) => {
      const { redSetLeft, redSetRight, yellowSetLeft, yellowSetRight } = values;
      if (!redSetLeft && !redSetRight) {
        message.warn('红色预警设置至少填一个！');
        return
      } else if (!yellowSetLeft && !yellowSetRight) {
        console.log(111);

        message.warn('黄色预警设置至少填一个！');
        return
      }
      if (err) return;
      // 获取筛选数据维度的状态、状态中的filterData和表单数据
      const frontConfig = this.Filter.state,
        filter = frontConfig.filterData,
        contextConfig = { filter: {} },
        filterForm = this.Filter.props.form.getFieldsValue();
      const { getUserMeasuresData } = this.props.analysis;
      let indId;
      for (let i of getUserMeasuresData) {
        if (i.attrCode === values.measure) {
          indId = i.urlId + '#' + i.attrCode + '#' + i.factTable;
        }
      }
      // 配置contextConfig参数
      console.log(filter);
      for (let i of filter) {
        const filterArr = [];
        for (let j of i) {
          filterArr.push(j.dimValue);
        }
        if (i.length > 0) {
          if (contextConfig.filter[i[0].dimColumn]) contextConfig.filter[i[0].dimColumn] = [...contextConfig.filter[i[0].dimColumn], ...filterArr]
          else contextConfig.filter[i[0].dimColumn] = filterArr;
        }
      }
      // 去掉cascaderOption联级数据，减少JSON字符串大小，但这样做会影响筛选数据维度的状态，此时需要修改状态中的userOnce，避免功能失效
      frontConfig.cascaderOption = [];
      this.Filter.setState({ userOnce: true });

      const { indName, appId, themeId, themeName } = this.state,
        payload = {
          indName,
          themeName,
          alarmTag: values.referred,
          contextConfig,
          frontConfig: {
            filter: JSON.stringify(frontConfig) + '+' + JSON.stringify(filterForm),
            state: JSON.stringify(this.state),
            field: JSON.stringify(values)
          },
          frequency: values.frequency,
          greenName: values.greenWarnText,
          indId,
          valueType: values.typeValue,
          redMax: redSetRight ? redSetRight : undefined,
          redMin: redSetLeft ? redSetLeft : undefined,
          redName: values.redWarnText,
          themeId: appId + '_' + themeId,
          // unit: values.unit,
          yellowMax: yellowSetRight ? yellowSetRight : undefined,
          yellowMin: yellowSetLeft ? yellowSetLeft : undefined,
          yellowName: values.yellowWarnText,
          istendaysAgo: values.tenDays === '01' ? '1' : '0',
        }
      // 如果id存在，调用更新接口，否则调用保存接口
      if (this.props.location.id) {
        payload.id = this.props.location.id;
        this.props.dispatch({
          type: 'analysis/updAlarmInfo',
          payload
        }).then(() => {
          message.success('更新成功！')
        }).catch(e => {
          message.warn(e.message)
        })
      } else {
        this.props.dispatch({
          type: 'analysis/saveAlarmInfo',
          payload
        }).then(() => {
          message.success('保存成功！')
        }).catch(e => {
          message.warn(e.message)
        })
      }
    })
  }

  // 修改主题
  changeTheme = (e) => {
    const appId = e.split('_')[0], themeId = e.split('_')[1],
      { getThemeSelectData } = this.props.analysis;
    this.props.dispatch({
      type: 'analysis/getUserMeasures',
      payload: {
        appId,
        themeId,
        visibleColumn: 'door'
      }
    })
    // 遍历数据，找到id和当前选择相同的保存，同时清除指标的表单数据
    for (let i of getThemeSelectData) {
      if (i.ATId === e) this.setState({ themeName: i.ATName })
    }
    this.props.form.setFieldsValue({ measure: [] })
    this.setState({ appId, themeId, tenDays: false });
    // 重置筛选数据维度的状态和表单数据
    this.Filter.setState({ ...this.state.filterState })
    this.Filter.props.form.resetFields();
    this.props.form.setFieldsValue({ typeValue: undefined })
  }

  // 修改指标
  changeMeasure = (e) => {
    const { getUserMeasuresData } = this.props.analysis;
    for (let i of getUserMeasuresData) {
      if (i.attrCode === e) {
        this.setState({ indName: i.attrName })
      }
    }
    this.props.form.setFieldsValue({ typeValue: undefined })
    this.setState({ tenDays: false })
  }

  // 校验数字输入框的右边是否大于左边
  checkValue = (e, a, other) => {
    const otherVal = this.props.form.getFieldValue(other);
    if ((a || a === 0) && otherVal) {
      if (otherVal === '') return true;

      if (e.field.indexOf('Left') >= 0) {
        if (otherVal > a) return true;
        else return false;
      } else {
        if (otherVal < a) return true;
        else return false;
      }
    } else return true;
  }

  // 获取值类型
  getValue = () => {
    const measure = this.props.form.getFieldValue('measure');
    const cycle = this.props.form.getFieldValue('frequency');
    const { getUserMeasuresData } = this.props.analysis;
    const valueData = [{ name: '取指标值', code: 'value' }];

    if (!measure || measure.length === 0) {  // 强制先选指标，不然会出现没选指标结果就会有10天数据，同时清除值类型的所有数据
      this.setState({ valueData: [] });
      return;
    };
    if (!cycle) {
      this.setState({ valueData: [] });
      return;
    }
    for (let i of getUserMeasuresData) {
      if (i.attrCode === measure) {
        switch (cycle) {
          case 'day': {
            if (i.dayLink === '1') valueData.push({ name: '取其环比值', code: 'link' });
            if (i.dayYoy === '1') valueData.push({ name: '取其同比值', code: 'yoy' });
          }; break;
          case 'week': {
            if (i.weekLink === '1') valueData.push({ name: '取其环比值', code: 'link' });
            if (i.weekYoy === '1') valueData.push({ name: '取其同比值', code: 'yoy' });
          }; break;
          case 'month': {
            if (i.monthLink === '1') valueData.push({ name: '取其环比值', code: 'link' });
            if (i.monthYoy === '1') valueData.push({ name: '取其同比值', code: 'yoy' });
          }; break;
        }
      }
    }
    this.setState({ valueData });
  }

  // 获取10天前数据
  getTenDays = e => {
    const measureValue = this.props.form.getFieldValue('measure');
    const frequency = this.props.form.getFieldValue('frequency');
    if (!measureValue || measureValue.length === 0) {
      this.setState({ tenDays: false });
      return
    }
    if (e !== 'value') {
      this.setState({ tenDays: false });
      return
    }
    if (frequency !== 'day') {
      this.setState({ tenDays: false });
      return
    }
    const lastString = measureValue.slice(measureValue.length - 4);
    if (lastString === 'accu') {
      this.setState({ tenDays: false });
      return
    }
    this.setState({ tenDays: true });
  }

  render() {
    const { getFieldDecorator } = this.props.form,
      { unit, frequency, valueData, tenDays } = this.state,
      { getThemeSelectData, getUserMeasuresData } = this.props.analysis;

    const disabled = this.props.location.id ? true : false;
    let id = '123'
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card>
            <h1>新建/编辑预警指标</h1>
            <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6']}>

              <Panel header="主题" key="1">
                <FormItem label='选择指标主题' style={{ display: 'flex' }}>
                  {getFieldDecorator('theme', {
                    // initialValue: 'supervise_finance',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Select style={{ width: 200 }} disabled={disabled} onChange={this.changeTheme}>
                      {getThemeSelectData.map(item => {
                        return (
                          <Option value={item.ATId} key={item.ATId}>{item.ATName}</Option>
                        )
                      })}
                    </Select>
                  )}
                </FormItem>
              </Panel>

              <Panel header="指标" key="2">
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  <FormItem label='选择数据指标' style={{ display: 'flex', marginRight: 20 }}>
                    {getFieldDecorator('measure', {
                      initialValue: '',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select
                        showSearch
                        optionLabelProp="children"
                        filterOption={(input, option) => option.props.children.indexOf(input) >= 0}
                        style={{ width: 180 }} disabled={disabled} onChange={this.changeMeasure}>
                        {getUserMeasuresData.map(item => {
                          return (
                            <Option title={item.attrName} value={item.attrCode} key={item.attrCode}>{item.attrName}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label='输入指标简称' style={{ display: 'flex', marginRight: 20 }}>
                    {getFieldDecorator('referred', {
                      initialValue: '',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Input placeholder='请输入'></Input>
                    )}
                  </FormItem>
                  <FormItem label='统计频度' style={{ display: 'flex', marginRight: 20 }}>
                    {getFieldDecorator('frequency', {
                      initialValue: '',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 100 }} onChange={() => this.props.form.setFieldsValue({ typeValue: undefined })}>
                        {frequency.map(item => {
                          return (
                            <Option value={item.key} key={item.key}>{item.name}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  <FormItem label='值类型' style={{ display: 'flex' }}>
                    {getFieldDecorator('typeValue', {
                      initialValue: '',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{ width: 100 }} onFocus={this.getValue} onChange={this.getTenDays}>
                        {valueData.map(item => {
                          return (
                            <Option value={item.code} key={item.code}>{item.name}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </FormItem>
                  {
                    tenDays ?
                      <FormItem style={{ marginLeft: 15 }}>
                        {getFieldDecorator('tenDays', {
                          initialValue: '02',
                          rules: [{ required: true, message: '必选' }]
                        })(
                          <Radio.Group>
                            <Radio value='01'>使用10天前数据</Radio>
                            <Radio value='02'>不使用10天前数据</Radio>
                          </Radio.Group>
                        )}
                      </FormItem> : null
                  }
                </div>
              </Panel>

              <Panel header="筛选数据维度" key="3">
                <FilterData wrappedComponentRef={(form) => this.Filter = form} id={id} filter={['pub_its_statdate']}
                  root={this}></FilterData>
              </Panel>

              <Panel header="红色预警" key="4">
                <div style={{ display: 'flex' }}>
                  <FormItem label='红色预警设置' style={{ display: 'flex' }}>
                    {getFieldDecorator('redSetLeft', {
                      initialValue: '',
                      rules: [{ required: false, message: '必选', },
                      { validator: (e, v) => this.checkValue(e, v, 'redSetRight'), message: '右边必须大于左边' }]
                    })(
                      <InputNumber placeholder='请输入' style={{ width: 150 }} />
                    )}
                  </FormItem>
                  <span style={{ lineHeight: '36px', margin: '0 10px' }}>~</span>
                  <FormItem >
                    {getFieldDecorator('redSetRight', {
                      initialValue: '',
                      rules: [{ required: false, message: '必选', },
                      { validator: (e, v) => this.checkValue(e, v, 'redSetLeft'), message: '右边必须大于左边' }]
                    })(
                      <InputNumber placeholder='请输入' style={{ width: 150 }} />
                    )}
                  </FormItem>
                </div>
                <FormItem label='红色预警文本' style={{ display: 'flex' }}>
                  {getFieldDecorator('redWarnText', {
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Input placeholder='请输入' style={{ width: 300 }}></Input>
                  )}
                </FormItem>
              </Panel>

              <Panel header="黄色预警" key="5">
                <div style={{ display: 'flex' }}>
                  <FormItem label='黄色预警设置' style={{ display: 'flex' }}>
                    {getFieldDecorator('yellowSetLeft', {
                      initialValue: '',
                      rules: [{ required: false, message: '必选', },
                      { validator: (e, v) => this.checkValue(e, v, 'yellowSetRight'), message: '右边必须大于左边' }]
                    })(
                      <InputNumber placeholder='请输入' style={{ width: 150 }} />
                    )}
                  </FormItem>
                  <span style={{ lineHeight: '36px', margin: '0 10px' }}>~</span>
                  <FormItem >
                    {getFieldDecorator('yellowSetRight', {
                      initialValue: '',
                      rules: [{ required: false, message: '必选', },
                      { validator: (e, v) => this.checkValue(e, v, 'yellowSetLeft'), message: '右边必须大于左边' }]
                    })(
                      <InputNumber placeholder='请输入' style={{ width: 150 }} />
                    )}
                  </FormItem>
                </div>
                <FormItem label='黄色预警文本' style={{ display: 'flex' }}>
                  {getFieldDecorator('yellowWarnText', {
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Input placeholder='请输入' style={{ width: 300 }}></Input>
                  )}
                </FormItem>
              </Panel>

              <Panel header="绿色预警" key="6">
                <FormItem label='绿色预警文本' style={{ display: 'flex' }}>
                  {getFieldDecorator('greenWarnText', {
                    initialValue: '',
                    rules: [{ required: true, message: '必选' }]
                  })(
                    <Input placeholder='请输入' style={{ width: 300 }}></Input>
                  )}
                </FormItem>

              </Panel>
            </Collapse>
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '10px 0' }}>
              <Button type='primary' onClick={this.save}>保存</Button>
            </div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
