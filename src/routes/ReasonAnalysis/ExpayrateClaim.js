import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Card, Checkbox, Spin, Button, Table, message } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Business from './components/Business';
import Dimensions from './components/Dimensions';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

@connect(({ analysis, loading, umssouserinfo, global }) => ({
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
  global
}))
@Form.create()
export default class ExpayrateClaim extends PureComponent {
  state = {
    loadEcharts: false,
    showInsuranceDate: 'none',
    showBusiness: 'none',         // 分析维度选择的形式
    showFlow: 'none',             // 分析维度选择的形式
    institutions: false,          // 是否显示机构
    filter: 'getFilter_claim',    // 筛选数据维度的请求类型
    insuranceDate: false,         // 是否显示保险起期
    showPolicy: true,             // 是否显示保单年度
    dataSource1: [],              // 图表1数据
    dataSource2: [],              // 图表2数据
    cycle: '',              // 统计频度
    publicMode: true,                          // 用于判定是否为公共模板
    saveMode: 'saveMode',                      // 保存模板的请求models路径
    editMode: 'queryMode',                      // 编辑模板的请求models路径
    queryMode: 'queryMode',                    // 查询模板的请求models路径
    queryConfigParam: 'queryModeData',         // 查询模板的请求返回数据  
    visual: 'queryModeData',                    // 编辑模板的请求返回数据
    clickMode: true
  }

  componentWillMount() {
    const { dispatch, currentUser, analysis } = this.props;
    const { queryMode, queryConfigParam } = this.state;
    dispatch({
      type: 'analysis/getEndTime_Period',
      payload: {
        themeId: 'mqclmflow',
        appId: 'attri',
      }
    })
    dispatch({
      type: 'analysis/getpolicyYr',
      payload: {
        themeId: 'mqclmflow',
        appId: 'attri',
      }
    })
    dispatch({
      type: 'analysis/getFilterDimensions',
      payload: {
        themeId: 'mqclmflow',
        appId: 'attri',
      }
    })
    dispatch({
      type: 'analysis/getUserInfo'
    }).then(() => {
      const { companyCode, companyName } = this.props.analysis.getUserInfoData;
      const { manaIscommon, company_, companyName_ } = this.props.location;
      dispatch({
        type: `analysis/${queryMode}`,
        payload: {
          man: currentUser.principal.name,
          company: company_ ? company_ : companyCode,
          companyName: companyName_ ? companyName_ : companyName,
          themeId: 'mqclmflow',
          appId: 'attri',
          manaIscommon: manaIscommon
        }
      }).then(() => {
        const { commonAnalysisConfig, isPar } = this.props.analysis[queryConfigParam];
        if (!commonAnalysisConfig) return;
        const getResult = JSON.parse(commonAnalysisConfig);
        this.reloadData(getResult, isPar);
        this.submit();
      })
    })
    dispatch({
      type: 'analysis/payApplication',
      payload: []
    })
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
        themeId: 'mqclmflow',
        appId: 'attri',
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
        themeId: 'mqclmflow',
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
          this.submit();
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

  // 数据回显
  reloadData(getResult, isPar) {
    console.log(getResult)
    const { cycle, analyStatitime, filterSave, dimensionsOption,
      filterData, referTime } = getResult;
    //------------------------------------- 上半部分 ----------------------------------------
    // 先行修改状态，这部分状态第一个是联级选择，第二个是保险起期，第三个是机构，第四个是频度
    this.setState({ cycle })
    this.Business.props.form.setFieldsValue({
      frequency: cycle,
      referTime1: referTime.referTime1,
      referTime2: referTime.referTime2,
      statisticalTime1: analyStatitime.statisticalTime1,
      statisticalTime2: analyStatitime.statisticalTime2,
    })
    // 筛选数据维度
    if (isPar === '0') {
      this.Dimensions.setState({ cascaderOption: dimensionsOption });
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
    }
    this.props.dispatch({
      type: 'analysis/getEndTime_Content',
      payload: {
        themeId: "mqclmflow",
        appId: "attri",
        cycle
      }
    })
  }

  // 获取统计时点数据
  handleChangeRadio = (e) => {
    this.props.dispatch({
      type: 'analysis/getEndTime_Content',
      payload: {
        themeId: "mqclmflow",
        appId: "attri",
        cycle: e.target.value
      }
    })
  }

  // 系统建议和保存结果公用的部分
  saveData() {
    const { filterData, filterSave } = this.Dimensions.state;        // 获取子组件的所有状态数据
    const dimensionsOption = this.Dimensions.state.cascaderOption;       // 获取筛选数据维度的数据列表
    const analyStatitime = {
      statisticalTime1: this.Business.props.form.getFieldValue('statisticalTime1'),
      statisticalTime2: this.Business.props.form.getFieldValue('statisticalTime2'),
    };                                                     // 获取统计时点
    const cycle = this.Business.props.form.getFieldValue('frequency');         // 选择的指标
    const referTime = {
      referTime1: this.Business.props.form.getFieldValue('referTime1'),
      referTime2: this.Business.props.form.getFieldValue('referTime2'),
    }
    const postObj = {
      dimensionsOption, filterSave, filterData,
      cycle, analyStatitime, referTime
    };
    // 返回结果
    return postObj;
  }

  // 保存模板
  saveMode = () => {
    this.Business.props.form.validateFields((err, values) => {
      if (err) return;
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
          themeId: 'mqclmflow',
          appId: 'attri',
          themeName: '满期赔付率-赔案流量分析',
          appName: '归因分析',
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

  // 生成图表
  submit = (e) => {
    // e.preventDefault();
    this.Business.props.form.validateFields((err, values) => {
      if (err) return;
      const { filterData } = this.Dimensions.state;        // 获取子组件的所有状态数据
      const filter = {};
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
      // 下面的url是请求地址，在models里面会进行处理，原本参数不包含url
      let url;
      for (let i of this.props.analysis.payApplicationData.apps) {
        if (i.urlContent.split('/').slice(-2, -1)[0] === 'mqclmflow') {
          url = i.urlContent;
        }
      }
      this.props.dispatch({
        type: 'analysis/getTableData',
        payload: {
          appId: 'attri',
          themeId: 'mqclmflow',
          cycle: values.frequency,
          analyPolicyYr: values.referTime1,
          referPolicyYr: values.referTime2,
          analyStaTimeNode: values.statisticalTime1,
          referStaTimeNode: values.statisticalTime2,
          filter,
          companyCode: this.props.analysis.getUserInfoData.companyCode,
          url
        }
      }).then(() => {
        const { getTableData: { tuAnalyVsRefer, tuMqoccuAffect } } = this.props.analysis;
        const name1 = [{
          name: '赔付率',
          code: 'exppayrate'
        }, {
          name: '满期保费',
          code: 'mqprm'
        }, {
          name: '已决',
          code: 'settleamt'
        }, {
          name: '未决',
          code: 'oustdclaim'
        }, {
          name: '大案',
          code: 'hugeloss'
        }, {
          name: '非大案',
          code: 'unhugeloss'
        }];
        const name2 = [{
          name: '新增报案已决',
          code: 'newsettleamt'
        }, {
          name: '销案偏差',
          code: 'revoke'
        }, {
          name: '正常结案案件的结案偏差',
          code: 'endcaserevoke'
        }, {
          name: '结案追加',
          code: 'endcaseadd'
        }, {
          name: '新增报案未决',
          code: 'newreoustdclm'
        }, {
          name: '存量未决估损变动',
          code: 'stoustdclm'
        }, {
          name: '合计',
          code: 'accoutaff'
        }];
        const dataSource1 = [];
        const dataSource2 = [];
        for (let j of name1) {
          for (let i in tuAnalyVsRefer) {
            let name;
            if (j.code === i) {
              name = j.name;
              const { num, amt } = tuAnalyVsRefer[i];
              const obj = {
                key: i + 1,
                name,
                '分析业务0': num ? num.anaValue : '',
                '参考业务0': num ? num.referValue : '',
                '变化0': num ? num.changeValue : '',
                '分析业务1': amt ? amt.anaValue : '',
                '参考业务1': amt ? amt.referValue : '',
                '变化1': amt ? amt.changeValue : '',
              }
              dataSource1.push(obj);
            }
          }
        }
        for (let j of name2) {
          for (let i in tuMqoccuAffect) {
            let name;
            if (j.code === i) {
              name = j.name;
              const { num, amt, payrateaff } = tuMqoccuAffect[i];
              const obj = {
                key: i + 100,
                name,
                '件数': num !== null ? num : '',
                '金额': amt !== null ? amt : '',
                '对赔付率影响': payrateaff !== null ? payrateaff : '',
              }
              dataSource2.push(obj);
            }
          }
        }
        this.setState({ dataSource1, dataSource2 })
        this.graph.style.height = 'auto';       // 此处节省dom渲染，改变高度让其展开，不用display
      }).catch((err) => {
        console.log(err)
      })
    });
  }

  render() {
    const { dataSource1, dataSource2, publicMode } = this.state;
    // const { global: { publicMode } } = this.props;
    console.log(publicMode)
    const columns1 = [{
      title: '',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      align: 'center'
    }];
    const columns2 = [{
      title: '',
      dataIndex: 'name',
      key: 'name',
      align: 'center'
    }, {
      title: '件数',
      dataIndex: '件数',
      key: '件数',
      align: 'center'
    }, {
      title: '金额',
      dataIndex: '金额',
      key: '金额',
      align: 'center'
    }, {
      title: '对赔付率影响',
      dataIndex: '对赔付率影响',
      key: '对赔付率影响',
      align: 'center'
    }]
    const titleName = ['件数', '金额'];
    for (let i in titleName) {
      columns1.push({
        title: titleName[i],
        children: [{
          title: '分析业务',
          dataIndex: `分析业务${i}`,
          key: `分析业务${i}`,
          align: 'center'
        }, {
          title: '参考业务',
          dataIndex: `参考业务${i}`,
          key: `参考业务${i}`,
          align: 'center'
        }, {
          title: '变化',
          dataIndex: `变化${i}`,
          key: `变化${i}`,
          align: 'center'
        }]
      })
    }
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <Business wrappedComponentRef={e => this.Business = e} root={this} changeRadio={this.handleChangeRadio.bind(this)} />
            <Dimensions wrappedComponentRef={e => this.Dimensions = e} root={this} />
            <div style={{ textAlign: 'right' }}>
              <Button type="primary" style={{ marginRight: 20 }} onClick={this.saveMode}>
                保存为{publicMode ? '个人模板' : '公共模板'}</Button>
              <Button type="primary" onClick={e => this.submit(e)} style={{ marginTop: 20 }}>生成图表</Button>
            </div>
            <div ref={e => this.graph = e} style={{ height: 0, overflow: 'hidden' }}>
              <Table
                columns={columns1}
                dataSource={dataSource1}
                bordered
                size="middle"
              />
              <Table
                columns={columns2}
                dataSource={dataSource2}
                bordered
                size="middle"
              />
            </div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
