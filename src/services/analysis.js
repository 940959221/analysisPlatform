import HttpUtils from '../utils/HttpUtils';
import request from '../utils/request';

// const SERVER = 'http://10.1.4.113:10011';
// 自助分析数据下载
export async function autolyDownLoad(params) {
  return request(`${SERVER}/iap/autoly/downLoad`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

// 查看回溯结果下载
export async function lookBackDownLoad(params) {
  return request(`${SERVER}/iap/businessmap/lookback/download`, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export default class Analysis {
  // 获取用户信息
  static getUserInfo(body) {
    return HttpUtils.post({ url: '/iap/alarmConfig/getUserInfo', body });
  }

  // 获取用户权限
  static getUserDiction(body) {
    return HttpUtils.post({ url: '/iap/visual/queryTemplateAuth', body, options: { linaRedirect: false } });
  }

  // 监控创建--获取应用
  static getApplication(body) {
    return HttpUtils.post({ url: '/iap/alarmConfig/getApplication', body });
  }

  // 监控创建--获取主题
  static getTheme(body) {
    return HttpUtils.post({ url: '/iap/alarmConfig/getTheme', body });
  }

  // 监控创建--获取主题下指标
  static getMeasures(body) {
    return HttpUtils.post({ url: '/iap/alarmConfig/getMeasures', body });
  }

  // 监控创建--获取指标下维度
  static getDimensions(body) {
    return HttpUtils.post({ url: '/iap/alarmConfig/getDimensions', body });
  }

  // 监控创建--获取维度
  static getFilterDimensions(body) {
    return HttpUtils.post({ url: '/iap/alarmConfig/getFilterDimensions', body });
  }

  // 监控创建--查询维度
  static getDimensionContent(body) {
    return HttpUtils.post({ url: '/iap/alarmConfig/getDimensionContent', body });
  }

  // 监控管理--查询用户告警
  static getalarm(body) {
    return HttpUtils.post({ url: '/iap/alarm/getalarm', body });
  }

  // 监控管理--设置告警是否生效
  static setflag(body) {
    return HttpUtils.post({ url: '/iap/alarm/setflag', body });
  }

  // 告警生成--创建告警
  static product(body) {
    return HttpUtils.post({ url: '/iap/alarm/product', body });
  }

  // 告警生成--删除告警
  static deleteProduct(body) {
    return HttpUtils.post({ url: '/iap/alarm/product', body });
  }

  // 告警生成--更新告警
  static updateProduct(body) {
    return HttpUtils.post({ url: '/iap/alarm/product', body });
  }

  // 告警生成--查询告警
  static searchProduct(body) {
    return HttpUtils.post({ url: '/iap/alarm/product', body });
  }

  // 获取token
  static iapHome(body) {
    return HttpUtils.post({ url: '/iap/iapHome/getApplication', body });
  }

  // 告警生成--查询告警
  static getFilterTime(body) {
    return HttpUtils.post({ url: '/iap/alarmConfig/getFilterTime', body });
  }

  // 多维分析查询--获取应用
  static dimAnalysisApplication(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getApplication', body });
  }

  // 多维分析查询--获取主题
  static dimAnalysisTheme(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getTheme', body });
  }

  // 多维分析查询--获取指标
  static dimAnalysisMeasures(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getMeasures', body });
  }

  // 多维分析查询--获取过滤维度
  static dimAnalysisFilterDimensions(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getFilterDimensions', body });
  }

  // 多维分析查询--获取统计时间周期
  static getTimePeriod(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getTimePeriod', body });
  }

  static getMeasureData(url, tokes, body) {
    return HttpUtils.post({ url, tokes, body });
  }

  // static getMeasureData(url, body) {
  //   return HttpUtils.post({ url, body });
  // }

  // 统计用户告警
  static getresult(body) {
    return HttpUtils.post({ url: '/iap/countalarm/getresult', body });
  }

  static anaGetDimensions(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getDimensions', body });
  }

  // 添加用户常用分析
  static addCommaly(body) {
    return HttpUtils.post({ url: '/iap/commaly/addCommaly', body });
  }

  // 更新用户常用分析
  static updateCommaly(body) {
    return HttpUtils.post({ url: '/iap/commaly/updateCommaly', body });
  }

  // 删除用户常用分析
  static delCommaly(body) {
    return HttpUtils.post({ url: '/iap/commaly/delCommaly', body });
  }

  // 点击常用分析
  static clickCommaly(body) {
    return HttpUtils.post({ url: '/iap/commaly/clickCommaly', body });
  }

  // 获取用户常用分析
  static getCommaly(body) {
    return HttpUtils.post({ url: '/iap/commaly/getCommaly', body });
  }

  // 图表数据下载
  static downLoad(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/downLoad', body });
  }

  // 图表数据下载
  // static autolyDownLoad(body) {
  //   return HttpUtils.post({ url: '/iap/autoly/downLoad', body });
  // }

  // -----------------------------------用户授权----------------------------------------------

  // 进入群组界面
  static findAllGroupByPage(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/findAllGroupByPage', body });
  }

  // 添加表
  static getTableByGroup(body) {
    return HttpUtils.get({ url: `/iap/dataPermission/getTableByGroup/${body.groupId}` });
  }

  // 群组界面修改
  static getGroupById(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/getGroupById', body });
  }

  // 群组界面删除
  static deleteGroup(body) {
    return HttpUtils.post({ url: `/iap/dataPermission/deleteGroup/${body.groupId}` });
  }

  // 添加群组
  static addGroup(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/addGroup', body });
  }

  // 修改 群组
  static updateGroup(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/updateGroup', body });
  }

  // 通过名字分页查询组
  static findAllGroupByNamePage(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/findAllGroupByNamePage', body });
  }

  // getAllGroupNotInByPage
  static getAllGroupNotInByPage(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/getAllGroupNotInByPage', body });
  }

  // 用户列表查询
  static getGroupByUser(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/getGroupByUser', body });
  }

  // 用户列表删除
  static deleteUserGroup(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/deleteUserGroup', body });
  }

  // 用户列确定添加
  static addTableGroup(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/addTableGroup', body });
  }

  // 用户列表点击表数据
  static getAllColumnsByTablePage(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/getAllColumnsByTablePage', body });
  }

  // 用户授权
  static addUserGroup(body) {
    return HttpUtils.post({ url: '/iap/dataPermission/addUserGroup', body });
  }

  // 查询表和字段信息
  static getAllTableInfo(body) {
    return HttpUtils.get({ url: '/iap/autoly/getAllTableInfo', body });
  }

  // 根据主表获取相关表信息，包括主表
  static getMainTabRelateTabInfo(body) {
    return HttpUtils.post({ url: '/iap/autoly/getMainTabRelateTabInfo', body });
  }

  // 获取主表信息
  static getMainTable(body) {
    return HttpUtils.get({ url: '/iap/autoly/getMainTable', body });
  }

  // 过滤器选择字段
  static getFilterInfo(body) {
    return HttpUtils.post({ url: '/iap/autoly/getFilterInfo', body });
  }

  // 用户过滤条件时选择维度
  static getDimDesc(body) {
    return HttpUtils.post({ url: '/iap/autoly/getDimDesc', body });
  }

  // 获取主表统计时间字段
  static getMainTabDateCol(body) {
    return HttpUtils.post({ url: '/iap/autoly/getMainTabDateCol', body });
  }

  // 查询impala结果
  static getPageResult(body) {
    return HttpUtils.post({ url: '/iap/autoly/getPageResult', body });
  }

  // 获取截止时间周期
  static getEndTimePeriod(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getEndTimePeriod', body });
  }

  // 获取截止时间内容
  static getEndTimeContent(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getEndTimeContent', body });
  }

  static getTargetTables(body) {
    return HttpUtils.post({ url: '/iap/import/getTargetTables', body });
  }

  // 数据导入
  static uploadFile(body) {
    return HttpUtils.upload({ url: '/iap/import/upload', body });
  }

  // 增加自助分析记录
  static addCommAutoAnaly(body) {
    return HttpUtils.post({ url: '/iap/commautoaly/addCommAutoAnaly', body });
  }

  // 删除分析记录
  static delCommAutoAnaly(body) {
    return HttpUtils.post({ url: '/iap/commautoaly/delCommAutoAnaly', body });
  }

  // 更新用户配置
  static updateCommAutoAnaly(body) {
    return HttpUtils.post({ url: '/iap/commautoaly/updateCommAutoAnaly', body });
  }

  // 查看用户常用分析列表
  static getCommAutoaly(body) {
    return HttpUtils.post({ url: '/iap/commautoaly/getCommAutoaly', body });
  }

  // 点击自助常用分析
  static clickCommAutoAnaly(body) {
    return HttpUtils.post({ url: '/iap/commautoaly/clickCommAutoAnaly', body });
  }

  // 特殊告警主题
  static alarmspeGetTheme(body) {
    return HttpUtils.post({ url: '/iap/alarmspe/getTheme', body });
  }

  // 特殊告警应用
  static getAlarmspeApplication(body) {
    return HttpUtils.post({ url: '/iap/alarmspe/getApplication', body });
  }

  // 特殊告警创建、删除、修改、查看
  static alarmspeProduct(body) {
    return HttpUtils.post({ url: '/iap/alarmspe/product', body });
  }

  // 获取已有模型列表
  static getModelList(body) {
    return HttpUtils.post({ url: '/iap/getModel/getModelList', body });
  }

  // 获取新建模型列表
  static getNewModelList(body) {
    return HttpUtils.post({ url: '/iap/getModel/getNewModelList', body });
  }

  // 是否能新建模型
  static enableCreateModel(body) {
    return HttpUtils.post({ url: '/iap/getModel/enableCreateModel', body });
  }

  // 放弃修改
  static discardChanges(body) {
    return HttpUtils.post({ url: '/iap/getModel/discardChanges', body });
  }

  // 获取过滤维度
  static getMapFilterDimensions(body) {
    return HttpUtils.post({ url: '/iap/getModel/getFilterDimensions', body });
  }

  // 动态查询维度内容
  static getRealTimeDimContent(body) {
    return HttpUtils.post({ url: '/iap/getModel/getDimContentByMultiSelect', body });
  }

  // 保存模型
  static saveModel(body) {
    return HttpUtils.post({ url: '/iap/getModel/saveModel', body });
  }

  // 查询某个模型具体内容（树呈现）
  static displayModelContent(body) {
    return HttpUtils.post({ url: '/iap/getModel/displayModelContent', body });
  }

  // 删除模型
  static deleteModel(body) {
    return HttpUtils.post({ url: '/iap/getModel/deleteModel', body });
  }

  // 获取可编辑公司列表
  static getCompanyByUser(body) {
    return HttpUtils.post({ url: '/iap/getModel/getCompanyByUser', body });
  }

  // 是否能编辑模型
  static enableEditModel(body) {
    return HttpUtils.post({ url: '/iap/getModel/enableEditModel', body });
  }

  // 模型管理查询机构列表
  static getCompanyInManage(body) {
    return HttpUtils.post({ url: '/iap/getModel/getCompanyInManage', body });
  }

  // 模型管理创建方案
  static getkylinTreeCal(body) {
    return HttpUtils.post({ url: '/iap/calmodel/getkylinTreeCal', body });
  }

  // 模拟预测 -- 获取初始基础数据
  static initPlan(body) {
    return HttpUtils.post({ url: '/iap/businessmap/predict/initPlan', body });
  }

  // 模拟预测 -- 提交
  static doPredict(body) {
    return HttpUtils.post({ url: '/iap/businessmap/predict/doPredict', body });
  }

  // 模拟方案 -- 保存
  static savePlan(body) {
    return HttpUtils.post({ url: '/iap/businessmap/predict/savePlan', body });
  }

  // 模拟方案 -- 回溯
  static lookback(body) {
    return HttpUtils.post({ url: '/iap/businessmap/lookback/doLookback', body });
  }

  // 模拟方案 -- 检验保费占比
  static prmProCheck(body) {
    return HttpUtils.post({ url: '/iap/businessmap/predict/prmProCheck', body });
  }

  // 新建方案获取机构
  static getCompanyInAddPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/getCompanyInAddPlan', body });
  }

  // 中支公司获取参考方案
  static getReferPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/getReferPlan', body });
  }

  // 方案管理页面机构选项
  static getCompanyplanManage(body) {
    return HttpUtils.post({ url: '/iap/planManage/getCompanyInManage', body });
  }

  // 新增方案
  static createPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/createPlan', body });
  }

  // 方案管理获取方案所有状态
  static getAllRunStatus(body) {
    return HttpUtils.post({ url: '/iap/planManage/getAllRunStatus', body });
  }

  // 查询方案列表
  static queryPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/queryPlan', body });
  }

  // 获取分公司非失效模型
  static selectEffectModel(body) {
    return HttpUtils.post({ url: '/iap/getModel/selectEffectModel', body });
  }

  // 待汇总方案列表
  static planNeedSummarized(body) {
    return HttpUtils.post({ url: '/iap/planManage/planNeedSummarized', body });
  }

  // 获取某个方案权限
  static getPlanAuth(body) {
    return HttpUtils.post({ url: '/iap/planManage/getPlanAuth', body });
  }

  // 删除方案
  static planDelete(body) {
    return HttpUtils.post({ url: '/iap/planManage/planDelete', body });
  }

  // 提交方案
  static submitPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/submitPlan', body });
  }

  // 保存模拟方案
  static saveSimulatedPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/saveSimulatedPlan', body });
  }

  // 保存汇总方案
  static saveSummarizedPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/saveSummarizedPlan', body });
  }

  // 汇总
  static toSummarizedPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/toSummarizedPlan', body });
  }

  // 方案回溯
  static planLookBackCal(body) {
    return HttpUtils.post({ url: '/iap/planManage/planLookBackCal', body });
  }

  // 方案复制
  static planCopy(body) {
    return HttpUtils.post({ url: '/iap/planManage/planCopy', body });
  }

  // 方案计算
  static planCal(body) {
    return HttpUtils.post({ url: '/iap/planManage/planCal', body });
  }

  // 查看中支方案
  static getCrenPlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/getCrenPlan', body });
  }

  // 请用方案
  static enbalePlan(body) {
    return HttpUtils.post({ url: '/iap/planManage/enbalePlan', body });
  }

  // 查看方案
  static getPlanDetailById(body) {
    return HttpUtils.post({ url: '/iap/businessmap/predict/getPlanDetailById', body });
  }

  // 模拟重置
  static resetPlan(body) {
    return HttpUtils.post({ url: '/iap/businessmap/predict/reset', body });
  }

  // 模拟确定
  static quitPlan(body) {
    return HttpUtils.post({ url: '/iap/businessmap/predict/quit', body });
  }

  // 获取起保口径初始数据
  static InitialCoverage(body) {
    return HttpUtils.post({ url: '/iap/ciitc/getInitialConditions', body });
  }

  // 选择数据源获取下拉
  static getSelectData(body) {
    return HttpUtils.post({ url: '/iap/ciitc/getBusiness', body });
  }

  // 获取指标
  static getQuota(body) {
    return HttpUtils.post({ url: '/iap/ciitc/getIndex', body });
  }

  // 查询起保数据
  static queryInsurance(body) {
    return HttpUtils.post({ url: '/iap/ciitc/getZbxMarketDataNew', body });
  }

  // 行业数据分三级机构初始数据
  static getInitialConditions(body) {
    return HttpUtils.post({ url: '/iap/ZbxAgencyData/getInitialConditions', body });
  }

  // 行业数据分三级获取指标
  static getIndex(body) {
    return HttpUtils.post({ url: '/iap/ZbxAgencyData/getIndex', body });
  }

  // 行业数据分三级获取数据源获取下拉
  static getBusiness(body) {
    return HttpUtils.post({ url: '/iap/ZbxAgencyData/getBusiness', body });
  }

  // 行业数据分三级获取查询数据
  static getZbxMarketData(body) {
    return HttpUtils.post({ url: '/iap/ZbxAgencyData/getZbxMarketDataNew', body });
  }

  // 分三级-选择统计时间获取旬
  static getXunByMonth(body) {
    return HttpUtils.post({ url: '/iap/ZbxAgencyData/getXunByMonth', body });
  }

  // 归因分析-获取统计频度
  static getEndTime_Period(body) {
    return HttpUtils.post({ url: '/iap/attricommon/getEndTimePeriod', body });
  }

  // 归因分析-获取统计时点
  static getEndTime_Content(body) {
    return HttpUtils.post({ url: '/iap/attricommon/getEndTimeContent', body });
  }

  // 归因分析-获取分析维度
  static get_Dimensions(body) {
    return HttpUtils.post({ url: '/iap/attricommon/getDimensions', body });
  }

  // 归因分析-获取指标
  static getMeasures_analysis(body) {
    return HttpUtils.post({ url: '/iap/attricommon/getMeasures', body });
  }

  // 归因分析-按层级获取维度
  static getDimension_Content(body) {
    return HttpUtils.post({ url: '/iap/attricommon/getDimensionContent', body });
  }

  // 归因分析-获取机构
  static get_Company(body) {
    return HttpUtils.post({ url: '/iap/attricommon/getCompany', body });
  }

  // 归因分析-获取过滤维度
  static getFilterDimensions_analysis(body) {
    return HttpUtils.post({ url: '/iap/attricommon/getFilterDimensions', body });
  }

  // 归因分析-生成图表
  static getMqbusiness(body, url) {
    return HttpUtils.post({ url, body });
  }

  // 归因分析-新增保存结果
  static addanaly(body) {
    return HttpUtils.post({ url: '/iap/commattrialy/addanaly', body });
  }

  // 归因分析-更新保存结果
  static updateanaly(body) {
    return HttpUtils.post({ url: '/iap/commattrialy/updateanaly', body });
  }

  // 个人工作台归因分析获取数据
  static getanaly(body) {
    return HttpUtils.post({ url: '/iap/commattrialy/getanaly', body });
  }

  // 个人工作台归因分析删除数据
  static delanaly(body) {
    return HttpUtils.post({ url: '/iap/commattrialy/delanaly', body });
  }

  // 个人工作台归因点击获取数据
  static clickanaly(body) {
    return HttpUtils.post({ url: '/iap/commattrialy/clickanaly', body });
  }

  // 归因分析-获取系统建议
  static addSystemSugg(body) {
    return HttpUtils.post({ url: '/iap/attri/mqsuggest/addSystemSugg', body });
  }

  // 归因分析-结果查看
  static getSystemSugg(body) {
    return HttpUtils.post({ url: '/iap/attri/mqsuggest/getSystemSugg', body });
  }

  // 归因分析-结果查看-状态
  static getRunStatus(body) {
    return HttpUtils.post({ url: '/iap/attri/mqsuggest/getRunStatus', body });
  }

  // 归因分析-结果查看-删除
  static delSuggest(body) {
    return HttpUtils.post({ url: '/iap/attri/mqsuggest/delSuggest', body });
  }

  // 归因分析-满期赔案-获取统计时点
  static getpolicyYr(body) {
    return HttpUtils.post({ url: '/iap/attrimqclm/getpolicyYr', body });
  }

  // 归因分析-满期赔案-获取筛选数据维度
  static getFilter_claim(body) {
    return HttpUtils.post({ url: '/iap/attrimqclm/getDimensionContent', body });
  }

  // 归因分析-满期赔案-生成图表
  static getTableData(body, url) {
    return HttpUtils.post({ url, body });
  }

  // 赔付预测-获取分析维度
  static payDimensionsData(body) {
    return HttpUtils.post({ url: '/iap/prepayrate/getDimensions', body });
  }

  // 赔付预测-获取统计周期
  static payTimePeriodData(body) {
    return HttpUtils.post({ url: '/iap/prepayrate/getTimePeriod', body });
  }

  // 赔付预测-获取时间节点周期
  static payEndTimePeriodData(body) {
    return HttpUtils.post({ url: '/iap/prepayrate/getEndTimePeriod', body });
  }

  // 赔付预测-获取时间节点内容
  static payEndTimeContentData(body) {
    return HttpUtils.post({ url: '/iap/prepayrate/getEndTimeContent', body });
  }

  // 赔付预测-获取维度具体内容
  static payDimensionContentData(body) {
    return HttpUtils.post({ url: '/iap/prepayrate/getDimensionContent', body });
  }

  // 赔付预测-获取过滤维度
  static payFilterData(body) {
    return HttpUtils.post({ url: '/iap/prepayrate/getFilterDimensions', body });
  }

  // 赔付预测-获取指标
  static payMeasuresData(body) {
    return HttpUtils.post({ url: '/iap/prepayrate/getMeasures', body });
  }

  // 赔付预测-生成图表
  static payMeasureData(body, url) {
    return HttpUtils.post({ url, body });
  }

  // 赔付预测-新增保存查询
  static paySaveData(body) {
    return HttpUtils.post({ url: '/iap/commprepayaly/addanaly', body });
  }

  // 赔付预测-更新保存查询
  static payUpdateData(body) {
    return HttpUtils.post({ url: '/iap/commprepayaly/updateanaly', body });
  }

  // 个人工作台赔付预测获取数据
  static payanalyData(body) {
    return HttpUtils.post({ url: '/iap/commprepayaly/getanaly', body });
  }

  // 个人工作台赔付预测删除数据
  static paydelanaly(body) {
    return HttpUtils.post({ url: '/iap/commprepayaly/delanaly', body });
  }

  // 个人工作台赔付预测点击获取数据
  static payclickanaly(body) {
    return HttpUtils.post({ url: '/iap/commprepayaly/clickanaly', body });
  }

  // 归因分析接口路径
  static guiyin_getApplication(body) {
    return HttpUtils.post({ url: '/iap/iapHome/getApplication', body });
  }

  // 可视化-保存模板
  static saveMode(body) {
    return HttpUtils.post({ url: '/iap/visual/saveConfig', body });
  }

  // 可视化-查询模板
  static queryMode(body) {
    return HttpUtils.post({ url: '/iap/visual/queryConfigParam', body });
  }

  // 公共模板管理-添加用户
  static public_user(body) {
    return HttpUtils.post({ url: '/iap/visual/addUser', body });
  }

  // 公共模板管理-删除用户
  static publicDelete(body) {
    return HttpUtils.post({ url: '/iap/visual/deleteUser', body });
  }

  // 公共模板管理-初始化
  static publicQuery(body) {
    return HttpUtils.post({ url: '/iap/visual/queryTemplate', body });
  }

  // 公共模板管理-获取用户真实姓名
  static publicName(body) {
    return HttpUtils.post({ url: '/iap/visual/queryUserName', body });
  }

  // 公共模板管理-删除模板
  static publicDel(body) {
    return HttpUtils.post({ url: '/iap/visual/deleteTemplate', body });
  }



  // ---------------------------------------------------- 机构分析 -------------------------------------------------------

  // 文字数据获取
  static in_task(body) {
    return HttpUtils.post({ url: '/branch/getRatTask', body });
  }

  // 发起评级初始化
  static in_select(body) {
    return HttpUtils.post({ url: '/branch/getSelectList', body });
  }

  // 发起评级按钮
  static in_initiateRat(body) {
    return HttpUtils.post({ url: '/branch/initiateRat', body });
  }

  // 确认发起评级按钮
  static in_rat(body) {
    return HttpUtils.post({ url: '/branch/ratConfirm', body });
  }

  // 下载模板
  static in_download(body) {
    return HttpUtils.post({ url: '/branch/files', body });
  }

  // 数据上传
  static in_upload(body, name) {
    return HttpUtils.upload({ url: `/branch/${name}`, body });
  }

  // 数据上传-初始化
  static in_getRatTask(body) {
    return HttpUtils.post({ url: '/branch/getRatTask', body });
  }

  // 数据上传-初始化
  static in_log(body) {
    return HttpUtils.post({ url: '/branch/logCompany', body });
  }

  // 得分计算-获取数据
  static in_score(body) {
    return HttpUtils.post({ url: '/branch/getUploadStauts', body });
  }

  // 得分计算-撤销
  static in_revoke(body) {
    return HttpUtils.post({ url: '/branch/revokeRat', body });
  }

  // 得分计算-评分计算
  static in_scoreCal(body, url) {
    return HttpUtils.post({ url: `/branch/${url}`, body });
  }

  // 历史数据-查询
  static in_hisQuery(body) {
    return HttpUtils.post({ url: '/branch/getRatResult', body });
  }

  // 历史数据-导出
  static in_historyExport(body, url) {
    return HttpUtils.post({ url: `/branch/${url}`, body });
  }

  // --------------------------------------------------  展业跟踪  --------------------------------------------------------------

  // 默认方案和业务单元信息
  static getDefaultPlanUnit(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getDefaultPlanUnit' });
  }

  // 预警卡片数据
  static getMainAlertResult(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getMainAlertResult', body });
  }

  // 获取方案
  static getEffectPlanContent(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getEffectPlanContent', body });
  }

  // 获取业务单元
  static getPlanBusUnit(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getPlanBusUnit', body });
  }

  // 初始化数据
  static getmonidata(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getmonidata', body });
  }

  // 回溯结果
  static getTrackdata(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getTrackdata', body });
  }

  // 界面顶部铃铛
  static getAlertResultBell(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getAlertResultBell', body, options: { linaRedirect: false } });
  }

  // --------------------------------------------------  展业跟踪-预警详情  --------------------------------------------------------------

  // 选择所属方案
  static getAlertEffectPlan(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getAlertEffectPlan', body });
  }

  // 选择指标
  static getAlertMeasureContent(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getAlertMeasureContent', body });
  }

  // 新增
  static addAlert(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/addAlert', body });
  }

  // 编辑修改
  static updateAlert(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/updateAlert', body });
  }

  // 删除
  static deleteAlert(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/deleteAlert', body });
  }

  // 查询所有信息
  static selectAlert(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/selectAlert', body });
  }

  // --------------------------------------------------  展业跟踪-预警通知  --------------------------------------------------------------

  // 预警通知
  static getAlertResult(body) {
    return HttpUtils.post({ url: '/iap/monitorlookback/getAlertResult', body });
  }

  // ------------------------------------------------ 用户配置-新建预警指标 ------------------------------------------------

  // 指标主题
  static getThemeSelect(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getThemeSelect', body });
  }

  // 数据指标
  static getUserMeasures(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getMeasures', body });
  }

  // 获取筛选维度-初始
  static getUserFilter(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getFilterDimensions', body });
  }

  // 获取筛选维度-下级维度
  static getUserFilterDim(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getDimensionContent', body });
  }

  // 保存
  static saveAlarmInfo(body) {
    return HttpUtils.post({ url: '/doorAM/saveAlarmInfo', body });
  }

  // ------------------------------------------------ 用户配置-指标库 ------------------------------------------------

  // 初始表格数据
  static qAlarmInfoList(body) {
    return HttpUtils.post({ url: '/doorAM/qAlarmInfoList', body });
  }

  // 点击编辑后数据回显
  static qAlarmInfo(body) {
    return HttpUtils.post({ url: '/doorAM/qAlarmInfo', body });
  }

  // 回显后保存
  static updAlarmInfo(body) {
    return HttpUtils.post({ url: '/doorAM/updAlarmInfo', body });
  }

  // 删除
  static delAlarmInfo(body) {
    return HttpUtils.post({ url: '/doorAM/delAlarmInfo', body });
  }

  // ------------------------------------------------ 新建/编辑组件 ------------------------------------------------

  // 卡片列表
  static qCardTypeList(body) {
    return HttpUtils.post({ url: '/cardAssem/qCardTypeList', body });
  }

  // 修改X轴维度后的下级维度
  static getDimLevel(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getDimLevel', body });
  }

  // 保存
  static saveCardAssem(body) {
    return HttpUtils.post({ url: '/cardAssem/saveCardAssem', body });
  }

  // 修改
  static updCardAssem(body) {
    return HttpUtils.post({ url: '/cardAssem/updCardAssem', body });
  }

  // 维度第三级
  static getDimValue(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getDimValue', body });
  }

  // 获取用户下级机构
  static getUserCompany(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getCompanyAndLevel', body });
  }

  // ------------------------------------------------ 组件库 ------------------------------------------------

  // 查询
  static componentCopy(body) {
    let url = '/cardAssem/copyGraphToCompany';
    if (body.type === '卡片组件') url = '/cardAssem/copyAssemToCompany';
    delete body.type;
    return HttpUtils.post({ url, body });
  }

  // 查询
  static qCardAssemList(body) {
    return HttpUtils.post({ url: '/cardAssem/qCardAssemList', body });
  }

  // 删除
  static delCardAssem(body) {
    return HttpUtils.post({ url: '/cardAssem/delCardAssem', body });
  }

  // 编辑
  static qCardAssemInfo(body) {
    return HttpUtils.post({ url: '/cardAssem/qCardAssemInfo', body });
  }

  // ------------------------------------------------ 资源管理 ------------------------------------------------

  // 保存
  static saveResource(body) {
    return HttpUtils.post({ url: '/resource/saveResource', body });
  }

  // 修改
  static updResource(body) {
    return HttpUtils.post({ url: '/resource/updResource', body });
  }

  // 查询
  static qResourceList(body) {
    return HttpUtils.post({ url: '/resource/qResourceList', body });
  }

  // 编辑
  static qResourceInfoById(body) {
    return HttpUtils.post({ url: '/resource/qResourceInfoById', body });
  }

  // ------------------------------------------------ 用户管理 ------------------------------------------------

  // 查询
  static qPubUserList(body) {
    return HttpUtils.post({ url: '/userManag/qPubUserList', body });
  }

  // 机构联级数据
  static qCompanyLeveInfo(body) {
    return HttpUtils.post({ url: '/userManag/qCompanyLeveInfo', body });
  }

  // 点击编辑
  static qRole(body) {
    return HttpUtils.post({ url: '/userManag/qRole', body });
  }

  // 修改角色
  static updUserRoleList(body) {
    return HttpUtils.post({ url: '/userManag/updUserRoleList', body });
  }

  // 批量设置
  static addCompanyRole(body) {
    return HttpUtils.post({ url: '/userManag/addCompanyRole', body });
  }

  // ------------------------------------------------ 角色管理 ------------------------------------------------

  // 编辑数据权限
  static qPermi(body) {
    return HttpUtils.post({ url: '/role/qPermi', body });
  }

  // 新增角色
  static saveRoleInfo(body) {
    return HttpUtils.post({ url: '/role/saveRoleInfo', body });
  }

  // 角色管理表格数据请求
  static qRoleInfoLis(body) {
    return HttpUtils.post({ url: '/role/qRoleInfoLis', body });
  }

  // 删除角色
  static delRoleInfo(body) {
    return HttpUtils.post({ url: '/role/delRoleInfo', body });
  }

  // 修改角色
  static updRoleInfo(body) {
    return HttpUtils.post({ url: '/role/updRoleInfo', body });
  }

  // 角色管理点击编辑回显
  static qRoleInfoById(body) {
    return HttpUtils.post({ url: '/role/qRoleInfoById', body });
  }

  // ------------------------------------------------ 权限管理 ------------------------------------------------

  // 编辑拥有资源
  static qResource(body) {
    return HttpUtils.post({ url: '/RolePermi/qResource', body });
  }

  // 权限管理点击编辑回显
  static qPermissionInfoById(body) {
    return HttpUtils.post({ url: '/RolePermi/qPermissionInfoById', body });
  }

  // 新增权限
  static savePermission(body) {
    return HttpUtils.post({ url: '/RolePermi/savePermission', body });
  }

  // 修改权限
  static updatePermission(body) {
    return HttpUtils.post({ url: '/RolePermi/updatePermission', body });
  }

  // 删除权限
  static deletePermission(body) {
    return HttpUtils.post({ url: '/RolePermi/deletePermission', body });
  }

  // 权限管理表格数据请求
  static qPermissionList(body) {
    return HttpUtils.post({ url: '/RolePermi/qPermissionList', body });
  }

  // ----------------------------------------------------  图表组件  --------------------------------------------------------

  // 图表组件保存
  static createGraph(body) {
    return HttpUtils.post({ url: '/portal/graph/createGraph', body });
  }

  // 组件库查询图表组件
  static queryGraph(body) {
    return HttpUtils.post({ url: '/portal/graph/queryGraph', body });
  }

  // 组件库删除图表组件
  static delGraph(body) {
    return HttpUtils.post({ url: '/portal/graph/delGraph', body });
  }

  // 组件库图表组件编辑
  static graphPreview(body) {
    return HttpUtils.post({ url: '/portal/graph/graphPreview', body });
  }

  // 图表组件修改
  static updateGraph(body) {
    return HttpUtils.post({ url: '/portal/graph/updateGraph', body });
  }

  // 判断当前用户是否是总部
  static queryUser(body) {
    return HttpUtils.post({ url: '/portal/graph/queryUser', body });
  }

  // 获取指标的值
  static queryMeasureValueType(body) {
    return HttpUtils.post({ url: '/graph/queryMeasureValueType', body });
  }

  // ---------------------------------------------------------  门户  ---------------------------------------------------------

  // 门户初始化
  static queryPortalList(body) {
    return HttpUtils.post({ url: '/portal/graph/queryPortalList', body, options: { linaRedirect: false } });
  }

  // 门户初始化
  static savePortalConfig(body) {
    return HttpUtils.post({ url: '/portal/graph/savePortalConfig', body, options: { linaRedirect: false } });
  }

  // 门户用户配置数据后保存
  static saveGraphRelate(body) {
    return HttpUtils.post({ url: '/portal/graph/saveGraphRelate', body });
  }

  // 门户获取卡片和图表的数据
  static qMeasureData(body) {
    return HttpUtils.post({ url: '/graph/qMeasureData', body, options: { linaRedirect: false } });
  }

  // 门户图表组件换位
  static updateSortNum(body) {
    return HttpUtils.post({ url: '/portal/graph/updateSortNum', body });
  }

  // 门户卡片组件数据
  static cardQMeasureData(body) {
    return HttpUtils.post({ url: '/doorAlarm/qMeasureData', body, options: { linaRedirect: false } });
  }

  // 门户卡片下钻
  static cardDrillDown(body) {
    return HttpUtils.post({ url: '/carLower/qLowerData', body });
  }

  // 门户图表下钻
  static chartDrillDown(body) {
    return HttpUtils.post({ url: '/lower/deepLower', body });
  }

  // 给后端配的界面请求
  static doorAlarmqList(body) {
    return HttpUtils.post({ url: '/doorAlarm/qList', body });
  }

  // 给后端配的界面请求
  static doorAlarmredis(body) {
    return HttpUtils.post({ url: '/doorAlarm/redis', body });
  }

  // 给后端配的界面请求
  static doorAlarmdeleteRedis(body) {
    return HttpUtils.post({ url: '/doorAlarm/deleteRedis', body });
  }

  // 给后端配的界面请求
  static graphqList(body) {
    return HttpUtils.post({ url: '/graph/qList', body });
  }

  // 给后端配的界面请求
  static graphredis(body) {
    return HttpUtils.post({ url: '/graph/redis', body });
  }

  // 给后端配的界面请求
  static graphdeleteRedis(body) {
    return HttpUtils.post({ url: '/graph/deleteRedis', body });
  }

  // 给后端配的界面请求
  static openSave(body) {
    return HttpUtils.post({ url: '/doorAlarm/cachSwich', body });
  }

  // ---------------------------------------------------------  门户  ---------------------------------------------------------

  // 给后端配的界面请求
  static portalList(body) {
    return HttpUtils.post({ url: '/cardAssem/qPortalList', body });
  }

  // 门户复制
  static copyPortal(body) {
    return HttpUtils.post({ url: '/cardAssem/copyPortal', body });
  }

  // 判定当前用户的机构
  static getCompany(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getCompany', body });
  }

  // 组件库卡片复制
  static copyAssemToCompany(body) {
    return HttpUtils.post({ url: '/cardAssem/copyAssemToCompany', body });
  }

  // 组件库图表复制
  static copyGraphToCompany(body) {
    return HttpUtils.post({ url: '/cardAssem/copyGraphToCompany', body });
  }

  // 门户日志
  static qCopyLog(body) {
    return HttpUtils.post({ url: '/cardAssem/qCopyLog', body });
  }

  // 门户还原
  static reduPortal(body) {
    return HttpUtils.post({ url: '/cardAssem/reduPortal', body });
  }

  // 邮件订阅查询
  static qSubscribe(body) {
    return HttpUtils.post({ url: '/cardAssem/qSubscribe', body });
  }

  // 邮件订阅
  static updSubscribe(body) {
    return HttpUtils.post({ url: '/cardAssem/updSubscribe', body });
  }

  // 下级机构查询
  static getCompanyLevel(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getCompanyLevel', body });
  }

  // 下级机构切换
  static changeCompany(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/changeCompany', body });
  }

  // 数据字典指标查询
  static getMeasureList(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getMeasureList', body });
  }

  // 数据字典指标定义查询
  static getMeasureDefi(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/getMeasureDefi', body });
  }

  // 数据字典指标定义保存
  static updMeasureDefi(body) {
    return HttpUtils.post({ url: '/iap/dimAnalysis/updMeasureDefi', body });
  }

  // 操作手册
  static getFileList(body) {
    return HttpUtils.post({ url: '/docDownload/getFileList', body });
  }
}