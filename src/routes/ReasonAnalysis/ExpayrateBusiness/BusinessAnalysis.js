import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Card, Checkbox, Spin, Button, message, Modal, Input, Table } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Business from '../components/Business';
import Dimensions from '../components/Dimensions';
import moment from 'moment';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/component/title';
import 'echarts/lib/component/graphic';
import 'echarts/lib/component/legend';
import 'echarts/lib/chart/bar';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

@connect(({ analysis, loading, umssouserinfo, global }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
  global
}))
@Form.create()
export default class BusinessAnalysis extends PureComponent {
  state = {
    loadEcharts: false,
    showPolicy: false,      // 是否显示保单年度
    showInsuranceDate: '',
    jianyi_button: true,    // 获取系统建议按钮disable
    tubiao_button: true,    // 生成图表按钮disable
    measure: [],            // 存放指标
    measureObj: {},         // 存放指标和对应编码
    cycle: '',              // 统计频度
    showBusiness: '',       // 分析维度选择的形式
    showFlow: 'none',       // 分析维度选择的形式
    saveModelVisible: false,    // 保存结果的弹窗
    inputValue: '',         // 保存结果输入框的值
    postObj: {},            // 保存结果的需要传递的所有数据对象
    dataSource: [],         // 生成图表的表格数据
    columns: [],            // 生成图表的表格头
    table_width: 0,         // 生成图表的表格数据宽度
    modelName: '',          // 弹窗弹出时对应的名字
    objData: {},            // 提供给获取系统建议时需要传递的参数
    suggustData: {},        // 提供给结果查看回显后前端需要额外展示的系统建议数据
    filter: 'getDimension_Content',   // 筛选数据维度的请求类型
    insuranceDate: true,    // 是否显示保险起期
    institutions: true,     // 是否显示机构
    charts3Show: 'none',    // echarts第三个图的显示与否
    tableShow: 'none',    // 表格的显示与否
    checkAll: false,      // 是否全选
    publicMode: true,                          // 用于判定是否为公共模板
    saveMode: 'saveMode',                      // 保存模板的请求models路径
    editMode: 'queryMode',                      // 编辑模板的请求models路径
    queryMode: 'queryMode',                    // 查询模板的请求models路径
    queryConfigParam: 'queryModeData',         // 查询模板的请求返回数据  
    visual: 'queryModeData',                    // 编辑模板的请求返回数据
    clickMode: true
  }

  componentWillMount() {
    const { location, dispatch, currentUser } = this.props;
    const { queryMode, queryConfigParam } = this.state;
    dispatch({
      type: 'analysis/getEndTime_Period',
      payload: {
        themeId: 'mqbusiness',
        appId: 'attri',
      }
    })
    dispatch({
      type: 'analysis/get_Dimensions',
      payload: {
        themeId: 'mqbusiness',
        appId: 'attri',
      }
    })
    dispatch({
      type: 'analysis/getMeasures',
      payload: {
        themeId: 'mqbusiness',
        appId: 'attri',
      }
    })
    dispatch({
      type: 'analysis/getFilterDimensions',
      payload: {
        themeId: 'mqbusiness',
        appId: 'attri',
      }
    })
    dispatch({
      type: 'analysis/payApplication',
      payload: []
    })
    dispatch({
      type: 'analysis/getUserInfo'
    }).then(() => {
      // 数据回显
      if (location.id) {      // 个人工作台
        dispatch({
          type: 'analysis/clickanaly',
          payload: { id: location.id }
        }).then(() => {
          const getResult = JSON.parse(this.props.analysis.clickanalyData.commonAnalysisConfig);
          console.log(getResult)
          this.reloadData(getResult, '0');
        })
      } else if (location.sugID) {
        dispatch({          // 归因分析-结果查看
          type: 'analysis/getSystemSugg',
          payload: {
            man: location.person,
            id: location.sugID
          }
        }).then(() => {
          setTimeout(() => {
            const { getSystemSuggData } = this.props.analysis;
            const getResult = JSON.parse(getSystemSuggData[0].userConfig)
            console.log(getResult);
            this.reloadData(getResult, '0');
            // 解析字符串，用于展示系统建议的前端数据
            if (!getSystemSuggData[0].suggest) return;
            const suggustObj = JSON.parse(getSystemSuggData[0].suggest);
            const suggustData = {};
            for (let i in suggustObj) {
              const item = JSON.parse(suggustObj[i]);
              suggustData[i] = [];
              for (let j in item) {
                suggustData[i].push(j + '：' + (item[j] * 100).toFixed(2) + '%')
              }
            }
            this.setState({ suggustData });
          }, 100)
        })
      } else {               // 先查看是否个人工作台的回显，否则再请求个人默认模板的数据
        const { companyCode, companyName } = this.props.analysis.getUserInfoData;
        const { manaIscommon, company_, companyName_ } = this.props.location;
        console.log(this.props)
        dispatch({
          type: `analysis/${queryMode}`,
          payload: {
            man: currentUser.principal.name,
            company: company_ ? company_ : companyCode,
            companyName: companyName_ ? companyName_ : companyName,
            appId: 'attri',
            themeId: 'mqbusiness',
            manaIscommon: manaIscommon
          }
        }).then(() => {
          const { commonAnalysisConfig, isPar } = this.props.analysis[queryConfigParam];
          if (!commonAnalysisConfig) return;
          const getResult = JSON.parse(commonAnalysisConfig);
          this.reloadData(getResult, isPar);
          this.getDataButton(null, '生成图表');
        })
      }
    })
  }

  componentDidMount() {
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    // 如果是从公共模板管理点进来的，那就固定显示个人模板，否则的话就根据当前点击切换的是什么模板，后面的也相应换成什么模板
    if (this.props.location.manaIscommon) {
      this.props.dispatch({
        type: 'global/changeClick',
        payload: true
      })
    } else {
      const { global: { publicModeName } } = this.props;
      let publicMode;
      if (publicModeName === '公共') publicMode = false;
      else publicMode = true;
      this.setState({ publicMode })
    }
  }

  componentWillReceiveProps(props) {
    // 当用户点击菜单栏的编辑公共默认按钮的时候发送请求，如果当前模块为可视化模块则替换当前模块数据
    // 判断条件为控制模块的个人默认和公共默认相互切换，同时没值的时候不执行，设定在SiderMenu.js文件
    const { companyCode, companyName } = this.props.analysis.getUserInfoData;
    if (!companyCode) return;
    if (!this.state.clickMode) return;
    const { editMode, visual, queryMode, queryConfigParam } = this.state;
    const { currentUser } = this.props;
    let payload, msg, publicMode, route, routeData;
    if (props.global.publicMode === '公共') {
      payload = {
        appId: 'attri',
        themeId: 'mqbusiness',
        iscommon: '0',
        company: companyCode,
        companyName
      }
      msg = '公共';
      publicMode = false;
      route = editMode;
      routeData = visual;
    } else if (props.global.publicMode === '个人') {
      payload = {
        man: currentUser.principal.name,
        appId: 'attri',
        themeId: 'mqbusiness',
        company: companyCode,
        companyName
      }
      msg = '个人';
      publicMode = true;
      route = queryMode;
      routeData = queryConfigParam;
    }
    if (props.global.publicMode) {
      this.props.dispatch({
        type: `analysis/${route}`,
        payload
      }).then(() => {
        if (this.props.analysis[routeData].commonAnalysisConfig) {
          const { isPar } = this.props.analysis[routeData];
          const getResult = JSON.parse(this.props.analysis[routeData].commonAnalysisConfig);
          this.reloadData(getResult, isPar);
          this.getDataButton(null, '生成图表');
        } else {
          message.warn(`当前${msg}模板没有设置，请重新填写完后点击保存`);
        }
      })
      this.setState({ publicMode, clickMode: false })
      setTimeout(() => {
        this.setState({ clickMode: true })
      }, 300)
    }
  }

  // 数据回显
  reloadData(getResult, isPar) {
    console.log(getResult)
    const dimObj = this.Dimensions.props.form.getFieldsValue();
    for (let i in dimObj) {
      if (i.indexOf('analysisDimension') !== -1) this.Dimensions.props.form.setFieldsValue({ [i]: '' })
    }
    // this.Dimensions.setState({ dimensionGroup: [] })
    const { timer, companyObj, company1, cycle, analyStatitime, filterSave, dimensionsOption,
      filterData, dimensionGroup, measure, D_getFieldsValue, selectValue } = getResult;
    //------------------------------------- 上半部分 ----------------------------------------
    // 先行修改状态，这部分状态第一个是联级选择，第二个是保险起期，第三个是机构，第四个是频度
    const company = [];       // 把companyObj对象重新转换为数组
    for (let i in companyObj) company[i] = companyObj[i];
    this.Business.setState({ timer, company, company1 });
    this.setState({ cycle })
    this.Business.props.form.setFieldsValue({
      frequency: cycle,
      analyInsuranceDateLeft1: moment(timer.analyInsuranceDateLeft1, 'YYYY-MM-DD'),
      analyInsuranceDateRight1: moment(timer.analyInsuranceDateRight1, 'YYYY-MM-DD'),
      analyInsuranceDateLeft2: moment(timer.analyInsuranceDateLeft2, 'YYYY-MM-DD'),
      analyInsuranceDateRight2: moment(timer.analyInsuranceDateRight2, 'YYYY-MM-DD'),
      statisticalTime1: analyStatitime.statisticalTime1,
      statisticalTime2: analyStatitime.statisticalTime2,
      analyCompany1: company1.analyCompany1,
      analyCompany2: company1.analyCompany2,
      analySelect1: isPar === '0' ? selectValue.analySelect1 : [],
      analySelect2: isPar === '0' ? selectValue.analySelect2 : [],
    });
    // 调用函数获取统计时点的下拉数据
    this.handleChangeRadio(null, cycle);
    // 筛选数据维度
    this.Dimensions.setState({ cascaderOption: dimensionsOption, dimensionGroup });
    const keys = [];
    const length = filterSave.length;
    // 根据循环的值修改组件的keys值，按照保存条件显示相同数量的筛选数据维度 
    for (let i = 0; i < length; i++) {
      keys.push(i);
      this.Dimensions.props.form.setFieldsValue({ keys });
      this.Dimensions.props.form.setFieldsValue({
        [`selectDim${i}`]: filterSave[i].parent, [`dimensionArr${i}`]: filterSave[i].children
      });
    }
    this.Dimensions.setState({ filterSave: filterSave, filterData });
    //------------------------------------- 中间部分 ----------------------------------------
    // 分析维度-------------其中dimensionGroup和filterData已经在上面设置到了Dimensions中
    for (let i in D_getFieldsValue) {
      // 这个判断根据有值，并且是维度里面的其中一个进行赋值，如果不加并且判断也可以实现，但是会抛出警告
      if (D_getFieldsValue[i] !== '' && i.split('-')[0].indexOf('analysisDimension') !== -1) {
        this.Dimensions.props.form.setFieldsValue({ [i]: D_getFieldsValue[i] })
      }
    }
    //------------------------------------- 底层部分 ----------------------------------------
    // 统计指标
    this.props.form.setFieldsValue({ measure });
    const newMeasure = [];
    const newMeasureObj = {};
    const { getMeasuresData } = this.props.analysis;
    getMeasuresData.filter(item => {
      for (let i of measure) {
        if (item.attrName === i) {
          newMeasure.push(item.attrCode);
          newMeasureObj[item.attrCode] = item.attrName
        }
      }
    })
    this.setState({ measure: newMeasure, measureObj: newMeasureObj })
  }

  handleChangeRadio = (e, value) => {
    let data;
    if (e) data = e.target.value;
    else data = value;
    this.props.dispatch({
      type: 'analysis/getEndTime_Content',
      payload: {
        themeId: "mqbusiness",
        appId: "attri",
        cycle: data
      }
    })
    this.setState({ cycle: data })
  }

  // 复选框选中事件
  onChangeCheck = (checkedList) => {
    const measure = [];
    const measureObj = {};
    for (let i of this.props.analysis.getMeasuresData) {
      for (let j of checkedList) {
        if (j === i.attrName) {
          measure.push(i.attrCode);
          measureObj[i.attrCode] = i.attrName;
        }
      }
    }
    console.log(measureObj)
    this.setState({ measure, measureObj })
  }

  // 指标全选
  onCheckAllChange = (e) => {
    const measure = [];
    const measureObj = {};
    const measureName = [];
    for (let i of this.props.analysis.getMeasuresData) {
      measure.push(i.attrCode);
      measureName.push(i.attrName);
      measureObj[i.attrCode] = i.attrName;
    }
    if (e.target.checked) {
      this.props.form.setFieldsValue({ measure: measureName });
      this.setState({ measure, measureObj })
    } else {
      this.props.form.setFieldsValue({ measure: [] });
      this.setState({ measure: [], measureObj: {} })
    }
    this.setState({
      checkAll: e.target.checked,
    });
  }

  // 统计指标
  getMeasure = () => {
    const { form: { getFieldDecorator } } = this.props;
    const { getMeasuresData } = this.props.analysis;
    const measure = [];
    for (let i of getMeasuresData) {
      measure.push(i.attrName);
    }
    const staticformItemLayout = {
      labelCol: { span: 2 },
      wrapperCol: { span: 22 },
    };
    return (
      <div>
        <FormItem {...staticformItemLayout} label='统计指标'>
          <Checkbox
            onChange={this.onCheckAllChange}
            checked={this.state.checkAll}
          >
            全选
          </Checkbox>
          {getFieldDecorator('measure', {
            initialValue: [], rules: [{ required: true, message: '必选' }]
          })(
            <CheckboxGroup
              options={measure}
              onChange={this.onChangeCheck}
            />
          )}
        </FormItem>
      </div>
    );
  }

  // 渲染系统建议
  getSuggust() {
    const { suggustData } = this.state;
    if (JSON.stringify(suggustData) === '{}') return;
    return (
      <div style={{ height: 150, margin: '20px 0', display: 'flex', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>系统建议：</div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex' }}>
            {suggustData.actual.map((item, index) => {
              return (
                <span style={{ color: 'rgb(201,22,35)' }}>{index === suggustData.actual.length - 1 ? item : item + '、'}</span>
              )
            })}
            <span style={{ color: 'blue' }}>（影响分析业务较大的维度）</span>
          </div>
          <div style={{ display: 'flex' }}>
            {suggustData.refer.map((item, index) => {
              return (
                <span style={{ color: 'rgb(201,22,35)' }}>{index === suggustData.refer.length - 1 ? item : item + '、'}</span>
              )
            })}
            <span style={{ color: 'blue' }}>（影响参考业务较大的维度）</span>
          </div>
          <div style={{ display: 'flex' }}>
            {suggustData.actual_refer.map((item, index) => {
              return (
                <span style={{ color: 'rgb(201,22,35)' }}>{index === suggustData.actual_refer.length - 1 ? item : item + '、'}</span>
              )
            })}
            <span style={{ color: 'blue' }}>（分析业务较参考业务变化较大的维度）</span>
          </div>
        </div>
      </div>
    )
  }

  // 校验
  checked(err) {
    if (err) {
      if (err.analyInsuranceDateRight1 && err.analyInsuranceDateRight2) message.warn('请选择[终止时间]！')
      else if (err.analyInsuranceDateRight1 && !err.analyInsuranceDateRight2) message.warn('请选择分析业务的[终止时间]！')
      else if (!err.analyInsuranceDateRight1 && err.analyInsuranceDateRight2) message.warn('请选择参考业务的[终止时间]！')
      return false;
    }
    let checkMeasure = true;
    this.props.form.validateFields(err => {
      if (err) {
        checkMeasure = false;
        message.warn('请选择[统计指标]！')
      }
    })
    if (!checkMeasure) return false;     // 如果本地校验不通过就pass
    return true;
  }

  // 获取系统建议和生成图表需要传递的对象获取
  getObjData(name, values) {
    console.log(this.Business.props.form.getFieldsValue())
    const { dimensionGroup, filterData } = this.Dimensions.state;        // 获取子组件的所有状态数据
    const { timer, company } = this.Business.state;        // 获取子组件的所有状态数据
    const D_getFieldsValue = this.Dimensions.props.form.getFieldsValue();   // 获取子组件的所有自定义组件值
    const { measure, cycle } = this.state;          // 选择的指标
    const dimension = [];             // 选择的分析维度
    const customDimension = {};       // 自定义的分析维度
    const filter = {};                // 过滤的分析维度
    const analyStatitime = {          // 分析业务里面的保险起期和统计时点
      timeContent: values.statisticalTime1,
      timeSegment: {
        leftValue: timer.analyInsuranceDateLeft1,
        rightValue: timer.analyInsuranceDateRight1
      }
    };
    const analyCompany = {             // 分析业务里面的机构
      code: company.analyCompany1.code,
      companyCol: company.analyCompany1.companyCol
    };
    const referStatitime = {           // 参考业务里面的保险起期和统计时点
      timeContent: values.statisticalTime2,
      timeSegment: {
        leftValue: timer.analyInsuranceDateLeft2,
        rightValue: timer.analyInsuranceDateRight2
      }
    };
    const referCompany = {             // 参考业务里面的机构
      code: company.analyCompany2.code,
      companyCol: company.analyCompany2.companyCol
    };
    // 先判断再循环
    if (name === '生成图表') getDimension('analysisDimension1');
    else getDimension('analysisDimension2');
    function getDimension(analysis) {
      for (let i in D_getFieldsValue) {
        if (i.split('-')[0] === analysis) {    // 用以区分图表和系统建议，并且下拉有值并且不为自定义分组
          if (D_getFieldsValue[i].split('-')[1] !== '自定义分组' && D_getFieldsValue[i] !== '') {
            dimension.push(D_getFieldsValue[i].split('-')[0]);
          }
        }
      }
    }

    if (dimensionGroup.length > 0) {
      for (let i of dimensionGroup) {
        if (i.saveAllData.length > 0 && i.nowChooes.split('+')[0] === name) {         // 根据传递的名字来储存不同的数据
          customDimension[i.saveAllData[0].dimColumn] = [];
          for (let j of i.saveAllData) {
            customDimension[i.saveAllData[0].dimColumn].push({
              [j.title.split('+')[1]]: j.dimValue
            })
          }
        }
      }
    }

    // 最后一层判断，至少需要一个维度
    if (dimension.length === 0 && JSON.stringify(customDimension) === '{}') {
      message.warn(name + '至少选择一个分析维度，如果自定义请设置分组！');
      return false;
    }

    // 过滤维度可以不需要
    for (let i of filterData) {
      if (i.length > 0) {
        const filterArr = [];
        for (let j of i) {
          filterArr.push(j.dimValue);
        }
        if (filter[i[0].dimColumn]) filter[i[0].dimColumn] = [...filter[i[0].dimColumn], ...filterArr];
        else filter[i[0].dimColumn] = filterArr;
      }
    }
    // 推送对象
    const objData = { cycle, dimension, customDimension, filter, measure, analyStatitime, analyCompany, referStatitime, referCompany };
    return objData;
  }

  // 保存模板
  saveMode = () => {
    this.Business.props.form.validateFields((err, values) => {
      if (!this.saveData(err, values, '生成图表')) return;
      const postObj = this.saveData(err, values, '生成图表')
      console.log(postObj)
      const { saveMode, publicMode } = this.state;
      const { dispatch, currentUser } = this.props;
      const { companyCode, companyName } = this.props.analysis.getUserInfoData;
      dispatch({
        type: `analysis/${saveMode}`,
        payload: {
          man: currentUser.principal.name,
          company: companyCode,
          companyName,
          themeId: 'mqbusiness',
          appId: 'attri',
          appName: '满期赔付率-业务分析',
          themeName: '业务分析',
          iscommon: publicMode ? '1' : '0',
          commonAnalysisConfig: JSON.stringify(postObj)
        }
      }).then(() => {
        message.success('保存成功，下次将引用该模板，详细模板管理请在个人工作台中的公共模板管理进行操作！')
      }).catch((e) => {
        message.warn(e.message);
      })
    })
  }

  // 生成图表按钮
  getDataButton = (e, name) => {
    this.Business.props.form.validateFields((err, values) => {
      if (!this.checked(err)) return;
      if (!this.getObjData(name, values)) return;
      const { cycle, dimension, customDimension, filter, measure, analyStatitime,
        analyCompany, referStatitime, referCompany } = this.getObjData(name, values);      // 调用获取传递对象
      // 下面的url是请求地址，在models里面会进行处理，原本参数不包含url
      let url;
      for (let i of this.props.analysis.payApplicationData.apps) {
        if (i.urlContent.split('/').slice(-2, -1)[0] === 'mqbusiness') {
          url = i.urlContent;
        }
      }
      console.log({
        themeId: 'mqbusiness',
        appId: 'attri',
        cycle,
        dimension,
        customDimension,
        filter,
        measure,
        analyStatitime,
        analyCompany,
        referStatitime,
        referCompany,
        url
      })
      this.props.dispatch({
        type: 'analysis/getMqbusiness',
        payload: {
          themeId: 'mqbusiness',
          appId: 'attri',
          cycle,
          dimension,
          customDimension,
          filter,
          measure,
          analyStatitime,
          analyCompany,
          referStatitime,
          referCompany,
          url
        },
      }).then(() => {
        this.setCharts();
        this.graph.style.height = 'auto';       // 此处节省dom渲染，改变高度让其展开，不用display
      })
    })
  }

  // 获取系统建议按钮
  suggest() {
    this.Business.props.form.validateFields((err, values) => {
      if (!this.saveData(err, values, '获取系统建议')) return;
      const postObj = this.saveData(err, values, '获取系统建议');
      if (!this.getObjData(name, values)) return;
      const objData = this.getObjData(name, values);
      this.setState({ saveModelVisible: true, postObj, modelName: '获取系统建议', objData });
      console.log(postObj)
    })
  }

  // 保存结果
  submit() {
    this.Business.props.form.validateFields((err, values) => {
      if (!this.saveData(err, values, '生成图表')) return;
      const postObj = this.saveData(err, values, '生成图表')
      // 如果判定成功说明是回显过来的数据，需要调用更新接口，否则用新增接口
      if (this.props.analysis.clickanalyData.id !== undefined && this.props.location.id) {   // 不加并且判断会导致操作一次后clickanalyData一直保留
        this.props.dispatch({
          type: 'analysis/updateanaly',
          payload: {
            id: this.props.analysis.clickanalyData.id,
            commonAnalysisConfig: JSON.stringify(postObj)
          }
        }).then(() => {
          message.success('更新成功，可在个人工作台查看！');
        }).catch((e) => {
          message.warn(e.message);
          return;
        })
      } else this.setState({ saveModelVisible: true, postObj, modelName: '保存结果' });
      console.log(postObj)
    })
  }

  // 系统建议和保存结果公用的部分
  saveData(err, values, name) {
    if (!this.checked(err)) return false;
    const { dimensionGroup, filterData, filterSave } = this.Dimensions.state;        // 获取子组件的所有状态数据
    const dimensionsOption = this.Dimensions.state.cascaderOption;       // 获取筛选数据维度的数据列表
    const { timer, company1, company } = this.Business.state;        // 获取子组件的所有状态数据
    const analyStatitime = {
      statisticalTime1: this.Business.props.form.getFieldValue('statisticalTime1'),
      statisticalTime2: this.Business.props.form.getFieldValue('statisticalTime2'),
    };                                                     // 获取统计时点
    const D_getFieldsValue = this.Dimensions.props.form.getFieldsValue();   // 获取子组件的所有自定义组件值
    const measure = this.props.form.getFieldValue('measure');
    const { cycle } = this.state;          // 选择的指标
    const dimension = [], customDimension = {};     // 和生成图表一样，储存的分析维度
    const selectValue = {       // 机构旁边的下拉选择框
      analySelect1: this.Business.props.form.getFieldValue('analySelect1'),
      analySelect2: this.Business.props.form.getFieldValue('analySelect2')
    }
    console.log(D_getFieldsValue)
    // 这里的company需要进行处理，原因是数组的下标是自定义值无法JSON，需要换成对象
    const companyObj = {};  // 处理后的对象
    let analysis;
    if (name === '生成图表') analysis = 'analysisDimension1';
    else if (name === '获取系统建议') analysis = 'analysisDimension2';

    for (let i in company) companyObj[i] = company[i]
    const postObj = {
      dimensionGroup, dimensionsOption, filterSave, filterData, timer,
      companyObj, company1, D_getFieldsValue, measure, cycle, analyStatitime, selectValue
    };
    for (let i in D_getFieldsValue) {
      if (i.split('-')[0] === analysis) {    // 用以区分图表和系统建议，并且下拉有值并且不为自定义分组
        if (D_getFieldsValue[i].split('-')[1] !== '自定义分组' && D_getFieldsValue[i] !== '') {
          dimension.push(D_getFieldsValue[i].split('-')[0]);
        }
      }
    }
    if (dimensionGroup.length > 0) {
      for (let i of dimensionGroup) {
        // 这里不同于生成图表需要完整的对象，只需要给值通过校验即可
        if (i.saveAllData.length > 0 && i.nowChooes.split('+')[0] === name) customDimension.save = 'ok';  // ok是随便起的   
      }
    }
    // 此处根据过滤出不是生成图表的数据，如果过滤后length没变，说明没有生成图表的数据
    if (dimension.length === 0 && JSON.stringify(customDimension) === '{}') {
      message.warn(name + '至少选择一个分析维度，如果自定义请设置分组！');
      return false;
    }
    // 返回结果
    return postObj;
  }

  // 弹窗点击
  onCancelDimModel(type, name) {
    if (type === 'ok') {
      const input = this.input.input.value;      // 输入框的值
      if (input === '') {
        message.warn('请给保存的结果设置一个名字');
        return
      } else if (name === '保存结果') {
        this.props.dispatch({
          type: 'analysis/addanaly',
          payload: {
            analysisName: input,
            man: this.props.currentUser.principal.name,
            appId: 'attri',
            themeId: 'mqbusiness',
            webParam: 'reasonanalysis/expayrate-business/business-analysis',
            appName: '归因分析',
            themeName: '满期业务分析',
            commonAnalysisConfig: JSON.stringify(this.state.postObj)
          }
        }).then(() => {
          message.success('保存成功，可在个人工作台查看！');
          this.input.input.value = '';
          this.setState({ saveModelVisible: false })
        }).catch((e) => {
          message.warn(e.message);
          return;
        })
      } else if (name === '获取系统建议') {
        const systemSuggParams = this.state.objData;
        systemSuggParams.appId = 'attri';
        systemSuggParams.themeId = 'mqbusiness';        // 给对象在添加两条参数
        this.props.dispatch({
          type: 'analysis/addSystemSugg',
          payload: {
            suggestName: input,
            man: this.props.currentUser.principal.name,
            webParam: 'reasonanalysis/expayrate-business/business-analysis',
            userConfig: JSON.stringify(this.state.postObj),
            systemSuggParams
          }
        }).then(() => {
          message.success('保存成功，可在同级目录的结果查看中查看！');
          this.input.input.value = '';
          this.setState({ saveModelVisible: false })
        }).catch((e) => {
          message.warn(e.message);
          return;
        })
      }
    } else {
      this.setState({ saveModelVisible: false });
      this.input.input.value = '';
    }
  }

  // 设置echart图和表格
  setCharts() {
    const { tuAnaRate, tuCarRate, tuCompare, tabAnaly, tabRefer } = this.props.analysis.getMqbusinessData;
    const { getMeasuresData } = this.props.analysis;
    const { measure, measureObj } = this.state;
    const ana_x = [];
    const ana_y = [];
    const compare_x = [];
    const compare_y = [];
    const carRate_x = [];
    const carRate_y = [];
    const head_name = {};      // 表格中需要用到的数组
    let table_width = -800;
    this.charts1.style.width = 'calc(100% / 2 - 10px)'
    this.charts2.style.width = 'calc(100% / 2 - 10px)'

    if (tuAnaRate) {
      if (tuAnaRate.length * 80 > 32500) this.charts3.style.width = '32500px';
      else this.charts3.style.width = tuAnaRate.length * 80 + 'px';
      // 给图3添加x、y轴值
      for (let i of tuAnaRate) {
        ana_x.push(i.xdata);
        ana_y.push(i.effectrate);
      }
      this.setState({ charts3Show: 'block' })
    } else {
      this.setState({ charts3Show: 'none' });
    }
    // 给图1添加x、y轴值 
    for (let i of tuCarRate) {
      carRate_x.push(i.xdata);
      carRate_y.push(i.effectrate)
    }

    // 给图2添加x、y轴值
    for (let i of getMeasuresData) {
      for (let j in tuCompare[0]) {
        if (i.attrCode === j) {
          compare_x.push(i.attrName + '变化值');
          compare_y.push(tuCompare[0][j]);
        }
      }
    }
    this.everyEcharts('charts1', carRate_x, carRate_y);
    this.everyEcharts('charts2', compare_x, compare_y);
    this.everyEcharts('charts3', ana_x, ana_y);

    for (let i in measureObj) {
      // 顺便给表格头部的值进行循环
      if (tabAnaly) {
        for (let k in tabAnaly[0]) {
          if (i === k) {
            head_name[i] = measureObj[i];
            table_width += 200;
          }
        }
        this.setState({ tableShow: 'block' })
      } else {
        this.setState({ tableShow: 'none' })
      }
    }

    // 设置表格
    let { dimensionGroup } = this.Dimensions.state;
    let string_name = '';
    dimensionGroup = dimensionGroup.filter(item => item.nowChooes.split('+')[0] === '生成图表')
    for (let i of dimensionGroup) {
      if (string_name === '') string_name = i.name;
      else string_name += `、${i.name}`
    }
    const columns = [
      {
        title: string_name,
        dataIndex: 'name',
        key: 'name',
        width: 200,
        fixed: 'left',
        align: 'center'
      }
    ];
    for (let i in head_name) {
      columns.push({
        title: head_name[i],
        children: [{
          title: '分析业务',
          dataIndex: `分析${i}`,
          key: `分析${i}`,
          align: 'center'
        }, {
          title: '参考业务',
          dataIndex: `参考${i}`,
          key: `参考${i}`,
          align: 'center'
        }]
      })
    }
    // 给表格填上数据
    const dataSource = [];
    let nameArr = [];
    if (tabAnaly) {
      for (let i of tabAnaly) nameArr.push(i.xdata);
    }
    if (tabRefer) {
      for (let i of tabRefer) nameArr.push(i.xdata);
    }
    nameArr = nameArr.filter((item, index) => nameArr.indexOf(item) === index);
    for (let i in nameArr) {
      const obj = {
        key: Number(i),
        name: nameArr[i]
      }
      for (let j in head_name) {
        const fenxi = tabAnaly.filter(item => item.xdata === nameArr[i])[0];
        const cankao = tabRefer.filter(item => item.xdata === nameArr[i])[0];
        obj[`分析${j}`] = fenxi ? fenxi[j] : '';
        obj[`参考${j}`] = cankao ? cankao[j] : '';
      }
      dataSource.push(obj)
    }
    // 如果这个数据有后端返回，那就在表格最后插入一条头部和数据
    if (tuAnaRate) {
      for (let i in measureObj) {
        if (i === 'effectrate') {
          columns.push({
            title: '对整体赔付率影响',
            dataIndex: 'effectrate',
            key: 'effectrate',
            align: 'center'
          })
          table_width += 200;
        }
      }
      for (let i of dataSource) {
        for (let j of tuAnaRate) {
          if (i.name === j.xdata) {
            i.effectrate = j.effectrate
          }
        }
      }
    }
    this.setState({ dataSource, columns, table_width })
  }

  // 按不同图进行绘制
  everyEcharts(name, x, y) {
    let mychart, rate;
    switch (name) {
      case 'charts1': mychart = echarts.init(this.charts1);
        rate = '4%';
        break;
      case 'charts2': mychart = echarts.init(this.charts2);
        rate = '4%';
        break;
      case 'charts3': mychart = echarts.init(this.charts3);
        rate = '0%';
        break;
    }
    let option = {
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: rate,
        right: rate,
        bottom: '3%',
        containLabel: true,
        width: '100%'
      },
      xAxis: [
        {
          type: 'category',
          data: x,
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            show: true,
            interval: 0,
            textStyle: {
              fontSize: 12
            },
            formatter: function (params) {
              let newParamsName = "";
              let paramsNameNumber = params.length;
              let provideNumber = 5;  //一行显示几个字
              let rowNumber = Math.ceil(paramsNameNumber / provideNumber);
              if (paramsNameNumber > provideNumber) {
                for (let p = 0; p < rowNumber; p++) {
                  let tempStr = "";
                  let start = p * provideNumber;
                  let end = start + provideNumber;
                  if (p == rowNumber - 1) {
                    tempStr = params.substring(start, paramsNameNumber);
                  } else {
                    tempStr = params.substring(start, end) + "\n";
                  }
                  newParamsName += tempStr;
                }

              } else {
                newParamsName = params;
              }
              return newParamsName
            },
            textStyle: {
              color: '#6861a6' //文字颜色
            }
          },
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '直接访问',
          type: 'bar',
          barWidth: '20px',
          data: y,
          itemStyle: {
            normal: {
              label: {
                show: true, //开启显示
                position: 'top', //在上方显示
                formatter: '{c}',
                textStyle: { //数值样式
                  color: 'black',
                  fontSize: 12
                }
              }
            }
          },
        }
      ]
    };
    mychart.setOption(option);
    mychart.resize();           // 重置让echarts图表自适应高宽
  }

  render() {
    const { dataSource, columns, table_width, suggustData, tableShow, charts3Show, publicMode } = this.state;
    const { id } = this.props.location;
    // const { global: { publicMode } } = this.props;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading} id='123456'>
          <Card style={{ height: '100%' }}>
            <Business wrappedComponentRef={(form) => this.Business = form} root={this} changeRadio={this.handleChangeRadio.bind(this)} />
            <Dimensions wrappedComponentRef={(form) => this.Dimensions = form} id={id} root={this} />

            {/* 系统建议 */}
            {this.getSuggust()}
            {this.getMeasure()}
            <div style={{ textAlign: 'right' }}>
              <Button type="primary" style={{ marginRight: 20 }} onClick={this.saveMode}>
                保存为{publicMode ? '个人模板' : '公共模板'}</Button>
              <Button type="primary" style={{ marginRight: 20 }} ref={jian_yi => this.jian_yi = jian_yi}
                disabled={this.state.jianyi_button} onClick={e => this.suggest(e, '获取系统建议')}>获取系统建议</Button>
              <Button type="primary" style={{ marginRight: 20 }} ref={tu_biao => this.tu_biao = tu_biao}
                disabled={this.state.tubiao_button} onClick={e => this.getDataButton(e, '生成图表')}>生成图表</Button>
              <Button type="primary" style={{ marginRight: 20 }} onClick={e => this.submit(e)}>保存结果</Button>
            </div>
            <Modal
              visible={this.state.saveModelVisible}
              onOk={() => this.onCancelDimModel('ok', this.state.modelName)}
              onCancel={() => this.onCancelDimModel('cancel', this.state.modelName)}
              title='设置保存结果'
              maskClosable={false}
              width={1000}
            >
              <Input placeholder='请填写保存名称' ref={input => this.input = input} />
            </Modal>

            {/* 点击生成图表后的图表 */}
            <div ref={e => this.graph = e} style={{ height: 0, overflow: 'hidden' }}>
              {/* echarts图 */}
              <div style={{ display: 'flex', marginBottom: 20 }}>
                <div ref={e => this.charts1 = e} style={{ height: 300, width: 400 }} />
                <div ref={e => this.charts2 = e} style={{ height: 300, width: 400 }} />
              </div>
              <div style={{ overflow: 'auto', width: '100%', marginBottom: 50 }}>
                <div ref={e => this.charts3 = e} style={{ height: 300, display: charts3Show }} />
              </div>

              {/* 表格 */}
              <Table
                columns={columns}
                style={{ display: tableShow }}
                dataSource={dataSource}
                bordered
                size="middle"
                scroll={{ x: `calc(100% + ${table_width}px)` }}
              />
            </div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
