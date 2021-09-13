import { message } from 'snk-web';
import Analysis, { autolyDownLoad, lookBackDownLoad } from '../services/analysis';

export default {
  namespace: 'analysis',

  state: {
    getApplicationData: {},
    getThemeData: {},
    dimension: {},
    measure: {},
    getDimensions: {},
    getDimensionContentData: {},
    getUserInfoData: {},
    getalarmData: [],
    setflagData: {},
    productData: {},
    searchData: {},
    iapHomeData: [],
    JESSIONID: '',
    getTimePeriodData: [],
    getMeasureData: {},
    clickCommalyData: {},
    getAllTableInfoData: {},
    getMainTabInfoData: {},
    getMainTableData: [],
    getFilterInfoData: {},
    getDimDescData: [],
    getMainTabDateColData: [],
    getPageResultData: [],
    getEndTimePeriodData: [],
    getEndTimeContentData: [],
    getBusistructureMeasureData: [],
    clickCommAutoAnalyData: [],
    getCommAutoalyData: [],
    getModelListData: [],
    getNewModelListData: [],
    getMapFilterDimensionsData: [],
    getDimContentData: [],
    displayModelContentData: [],
    deleteModelData: [],
    getCompanyByUserData: [],
    enableCreateModelData: [],
    initPlanData: [],
    initNodesData: [],
    lookbackData: [],
    prmProCheckData: [],
    getCompanyInManageData: [],
    getCompanyInAddPlanData: [],
    getReferPlanData: [],
    getCompanyplanManageData: [],
    getAllRunStatusData: [],
    queryPlanData: [],
    selectEffectModelData: [],
    planNeedSummarizedData: [],
    getPlanAuthData: {},
    toSummarizedPlanData: {},
    getCrenPlanData: [],
    getPlanDetailByIdData: [],
    InitialCoverageData: [],
    getSelectData: [],
    getQuotaData: [],
    queryInsuranceData: [],
    getInitialConditionsData: [],
    getIndexData: [],
    getBusinessData: [],
    getZbxMarketData: [],
    getEndTime_PeriodData: [],
    getEndTime_ContentData: [],
    get_DimensionsData: [],
    getMeasuresData: [],
    getDimension_ContentData: [],
    get_CompanyData: [],
    getFilterDimensionsData: [],
    getMqbusinessData: [],
    clickanalyData: {},
    getSystemSuggData: [],
    getRunStatusData: [],
    getFilter_claimData: [],
    getpolicyYrData: [],
    getTableData: [],
    payDimensionsData: [],
    payTimePeriodData: [],
    payEndTimePeriodData: [],
    payEndTimeContentData: [],
    payDimensionContentData: [],
    payFilterData: [],
    payMeasureData: [],
    payMeasuresData: [],
    payApplicationData: [],
    payclickanaly: [],
    queryModeData: [],
    editModeData: [],
    publicUserData: [],
    publicQueryData: [],
    publicNameData: [],
    public_userData: [],
    in_getRatTaskData: [],
    in_scoreData: [],
    in_hisQueryData: [],
    in_logData: [],
    in_selectData: [],
    in_taskData: [],
    in_initiateRatData: [],
    getDefaultPlanUnitData: [],
    getEffectPlanContentData: [],
    getPlanBusUnitData: [],
    getmonidataData: [],
    getTrackdataData: [],
    getThemeSelectData: [],
    getUserMeasuresData: [],
    getUserFilterData: [],
    qAlarmInfoListData: [],
    qAlarmInfoData: [],
    qCardTypeListData: [],
    getDimLevelData: [],
    qCardAssemListData: [],
    qCardAssemInfoData: [],
    updCardAssemData: [],
    getXunByMonthData: [],
    qResourceListData: [],
    qResourceInfoByIdData: [],
    qPubUserListData: [],
    qCompanyLeveInfoData: [],
    qRoleData: [],
    qPermiData: [],
    qRoleInfoLisData: [],
    qRoleInfoByIdData: [],
    qResourceData: [],
    qPermissionInfoByIdData: [],
    qPermissionListData: [],
    getAlertEffectPlanData: [],
    getAlertMeasureContentData: [],
    selectAlertData: [],
    getAlertResultData: [],
    getMainAlertResultData: [],
    measureObj: [],         // 主题下的所有指标合集
    showLine: true,        // 用户配置-组件库-新建/编辑组件-图表组件-基准线是否展示
    queryGraphData: [],
    graphPreviewData: [],
    queryPortalListData: [],
    qMeasureDataData: [],
    queryUserData: [],
    queryMeasureValueTypeData: [],
    graphChartId: null,
    cardQMeasureDataData: [],
    chartDrillDownData: [],
    cardDrillDownData: [],
    getDimValueData: [],
    doorAlarmqListData: [],
    graphqListData: [],
    getUserCompany: [],
    portalListData: [],
    getCompany: [],
    qCopyLogData: [],
    getSubCompanyData: [],
    getMeasureListData: [],
    getMeasureDefiData: [],
    getFileListData: []
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },

    setAllMeasure(state, { payload }) {
      return { ...state, ...payload };
    },

    showLine(state, { payload }) {
      return { ...state, ...payload };
    }
  },

  effects: {
    // 获取用户信息
    *getUserInfo({ payload }, { call, put }) {
      const response = yield call(Analysis.getUserInfo, payload);
      yield put({
        type: 'save',
        payload: {
          getUserInfoData: response,
        },
      });
    },

    // ---------------------------------------多维度分析-------------------------------------------------

    // 监控创建--获取应用
    *dimAnalysisApplication({ payload }, { call, put }) {
      const response = yield call(Analysis.dimAnalysisApplication, payload);
      yield put({
        type: 'save',
        payload: {
          getApplicationData: response,
        },
      });
    },

    // 监控创建--获取主题
    *dimAnalysisTheme({ payload }, { call, put }) {
      const response = yield call(Analysis.dimAnalysisTheme, payload);
      yield put({
        type: 'save',
        payload: {
          getThemeData: response,
        },
      });
    },

    // 监控创建--获取主题下指标
    *dimAnalysisMeasures({ payload }, { call, put }) {
      const response = yield call(Analysis.dimAnalysisMeasures, payload);
      yield put({
        type: 'save',
        payload: {
          measure: response,
        },
      });
    },

    // 监控创建--获取指标下维度
    *getDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.anaGetDimensions, payload);
      yield put({
        type: 'save',
        payload: {
          getDimensions: response,
        },
      });
    },

    // 监控创建--获取过滤维度
    *dimAnalysisFilterDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.dimAnalysisFilterDimensions, payload);
      yield put({
        type: 'save',
        payload: {
          dimension: response,
        },
      });
    },

    // 监控创建--查询维度
    *getDimensionContent({ payload }, { call, put }) {
      const response = yield call(Analysis.getDimensionContent, payload);
      yield put({
        type: 'save',
        payload: {
          getDimensionContentData: response,
        },
      });
    },

    // 监控管理--查询用户告警
    *getalarm({ payload }, { call, put }) {
      const response = yield call(Analysis.getalarm, payload);
      yield put({
        type: 'save',
        payload: {
          getalarmData: response,
        },
      });
    },

    // 监控管理--设置告警是否生效
    *setflag({ payload }, { call }) {
      const response = yield call(Analysis.setflag, payload);
      if (response === true) {
        message.success('设置成功');
      } else {
        message.warn('设置失败');
      }
    },

    // 告警生成--创建告警
    *createProduct({ payload }, { call }) {
      const response = yield call(Analysis.product, payload);
      if (response === true) {
        if (payload.operateType === 'c') {
          message.success('创建成功');
        } else {
          message.success('修改成功');
        }
      }
    },

    // 告警生成--更新告警
    *searchProduct({ payload }, { call, put }) {
      const response = yield call(Analysis.product, payload);
      yield put({
        type: 'save',
        payload: {
          searchData: response,
        },
      });
    },

    // 告警生成--删除告警
    *deleteProduct({ payload }, { call, put }) {
      const response = yield call(Analysis.product, payload);
      yield put({
        type: 'save',
        payload: {
          productData: response,
        },
      });
    },

    // 监控创建--查询过滤的时间维度
    *getFilterTime({ payload }, { call, put }) {
      const response = yield call(Analysis.getFilterTime, payload);
      yield put({
        type: 'save',
        payload: {
          getFilterTimeData: response,
        },
      });
    },

    *iapHomeGetApplication({ payload }, { call, put }) {
      const response = yield call(Analysis.iapHome, payload);
      yield put({
        type: 'save',
        payload: {
          iapHomeData: response,
        },
      });
    },

    // 监控创建--获取统计时间周期
    *getTimePeriod({ payload }, { call, put }) {
      const response = yield call(Analysis.getTimePeriod, payload);
      yield put({
        type: 'save',
        payload: {
          getTimePeriodData: response,
        },
      });
    },

    // 请求数据生成图表
    *getMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (payload.mainDim === '') {
        parma = payload;
        parma.dataUrl = undefined;
      } else if (JSON.stringify(payload.filter) === '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
        };
      } else if (JSON.stringify(payload.statitime) === '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
        };
      } else if (JSON.stringify(payload.filter) === '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
        };
      } else if (JSON.stringify(payload.statitime) === '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
        };
      } else if (JSON.stringify(payload.filter) !== '{}' && JSON.stringify(payload.statitime) !== '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
        };
      }

      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getMeasureData: response,
        },
      });
    },

    // 历年---生成图表
    *getLinianMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (JSON.stringify(payload.filter) === '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          endtime: payload.endtime,
        };
      } else if (JSON.stringify(payload.filter) === '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          endtime: payload.endtime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
        };
      } else if (JSON.stringify(payload.filter) !== '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
          endtime: payload.endtime,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          endtime: payload.endtime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
        };
      }

      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getMeasureData: response,
        },
      });
    },

    // 财务类生成图表
    *getFinanceMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (JSON.stringify(payload.filter) === '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
        };
      } else if (JSON.stringify(payload.filter) === '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
        };
      } else if (JSON.stringify(payload.filter) !== '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          filter: payload.filter,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
        };
      }
      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getMeasureData: response,
        },
      });
    },

    // 满期赔付率--生成图表
    *getExpayrateMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (JSON.stringify(payload.filter) === '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          endtime: payload.endtime,
        };
      } else if (JSON.stringify(payload.statitime) === '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          endtime: payload.endtime,
        };
      } else if (JSON.stringify(payload.filter) === '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
          endtime: payload.endtime,
        };
      } else if (JSON.stringify(payload.statitime) === '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
          endtime: payload.endtime,
        };
      } else if (JSON.stringify(payload.filter) !== '{}' && JSON.stringify(payload.statitime) !== '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
          endtime: payload.endtime,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          endtime: payload.endtime,
        };
      }

      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getMeasureData: response,
        },
      });
    },

    // 请求数据生成图表
    *getBusistructureMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (JSON.stringify(payload.filter) === '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          occupDim: payload.occupDim,
        };
      } else if (JSON.stringify(payload.statitime) === '{}' && payload.xdata === undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          occupDim: payload.occupDim,
        };
      } else if (JSON.stringify(payload.filter) === '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
          occupDim: payload.occupDim,
        };
      } else if (JSON.stringify(payload.statitime) === '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
          occupDim: payload.occupDim,
        };
      } else if (JSON.stringify(payload.filter) !== '{}' && JSON.stringify(payload.statitime) !== '{}' && payload.xdata !== undefined) {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          xdata: payload.xdata,
          upAndDown: payload.upAndDown,
          occupDim: payload.occupDim,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          occupDim: payload.occupDim,
        };
      }

      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getMeasureData: response,
        },
      });
    },


    // 下钻返回
    *getRetMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (JSON.stringify(payload.filter) === '{}') {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
        };
      } else if (JSON.stringify(payload.statitime) === '{}') {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
        };
      }
      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getRetMeasureData: response,
        },
      });
    },

    // 历年下钻返回
    *getLinianRetMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (JSON.stringify(payload.filter) === '{}') {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          endtime: payload.endtime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          endtime: payload.endtime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
        };
      }
      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getRetMeasureData: response,
        },
      });
    },

    // 满期赔付率 --- 下钻返回
    *getRetExpayrateMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (JSON.stringify(payload.filter) === '{}') {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
          endtime: payload.endtime,
        };
      } else if (JSON.stringify(payload.statitime) === '{}') {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
          endtime: payload.endtime,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
          endtime: payload.endtime,
        };
      }
      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getRetMeasureData: response,
        },
      });
    },

    // 业务结构 --- 下钻返回
    *getBusistructureRetMeasureData({ payload }, { call, put }) {
      const url = payload.dataUrl;
      const tokes = payload.token;
      let parma = {};
      if (JSON.stringify(payload.filter) === '{}') {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
          occupDim: payload.occupDim,
        };
      } else if (JSON.stringify(payload.statitime) === '{}') {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
          occupDim: payload.occupDim,
        };
      } else {
        parma = {
          themeId: payload.themeId,
          appId: payload.appId,
          dimension: payload.dimension,
          customDimension: payload.customDimension,
          filter: payload.filter,
          measure: payload.measure,
          statitime: payload.statitime,
          isQuery: payload.isQuery,
          mainDim: payload.mainDim,
          upAndDown: payload.upAndDown,
          occupDim: payload.occupDim,
        };
      }
      const response = yield call(Analysis.getMeasureData, url, tokes, parma);
      if (response.code === 0) {
        message.success(response.message);
      }
      yield put({
        type: 'save',
        payload: {
          getRetMeasureData: response,
        },
      });
    },

    // 添加用户常用分析
    *addCommaly({ payload }, { call }) {
      const response = yield call(Analysis.addCommaly, payload);
      message.success('保存成功');
    },

    // 修改用户常用分析
    *updateCommaly({ payload }, { call }) {
      const response = yield call(Analysis.updateCommaly, payload);
      message.success('操作成功');
    },

    // 点击常用分析
    *clickCommaly({ payload }, { call, put }) {
      const response = yield call(Analysis.clickCommaly, payload);
      yield put({
        type: 'save',
        payload: {
          clickCommalyData: response,
        },
      });
    },

    // 图表数据下载
    *downLoad({ payload }, { call }) {
      yield call(Analysis.downLoad, payload);
    },

    // 自助分析下载
    // *autolyDownLoad({ payload }, { call }) {
    //   yield call(Analysis.downLoad, payload);
    // },
    *autolyDownLoad({ payload }, { call }) {
      const response = yield call(autolyDownLoad, payload);
      const fileName = '自助分析下载.xls';
      if ('msSaveOrOpenBlob' in navigator) {
        window.navigator.msSaveOrOpenBlob(response, fileName);
      } else {
        const aLink = document.createElement('a');
        document.body.appendChild(aLink);
        aLink.style.display = 'none';
        const objectUrl = window.URL.createObjectURL(response);
        aLink.href = objectUrl;
        aLink.download = fileName;
        aLink.click();
        document.body.removeChild(aLink);
      }
    },


    // --------------------------------------自助分析----------------------------------
    // 查询表和字段信息
    *getAllTableInfo({ payload }, { call, put }) {
      const response = yield call(Analysis.getAllTableInfo, payload);
      yield put({
        type: 'save',
        payload: {
          getAllTableInfoData: response,
        },
      });
    },

    // 根据主表获取相关表信息，包括主表
    *getMainTabRelateTabInfo({ payload }, { call, put }) {
      const response = yield call(Analysis.getMainTabRelateTabInfo, payload);
      yield put({
        type: 'save',
        payload: {
          getAllTableInfoData: response,
        },
      });
    },

    // 获取主表信息
    *getMainTable({ payload }, { call, put }) {
      const response = yield call(Analysis.getMainTable, payload);
      yield put({
        type: 'save',
        payload: {
          getMainTableData: response,
        },
      });
    },

    // 过滤器选择字段
    *getFilterInfo({ payload }, { call, put }) {
      const response = yield call(Analysis.getFilterInfo, payload);
      yield put({
        type: 'save',
        payload: {
          getFilterInfoData: response,
        },
      });
    },

    // 获取维度信息
    *getDimDesc({ payload }, { call, put }) {
      const response = yield call(Analysis.getDimDesc, payload);
      yield put({
        type: 'save',
        payload: {
          getDimDescData: response,
        },
      });
    },

    // 获取主表统计时间字段
    *getMainTabDateCol({ payload }, { call, put }) {
      const response = yield call(Analysis.getMainTabDateCol, payload);
      yield put({
        type: 'save',
        payload: {
          getMainTabDateColData: response,
        },
      });
    },

    // 查询impala结果
    *getPageResult({ payload }, { call, put }) {
      const response = yield call(Analysis.getPageResult, payload);
      if (response.result.length === 0) {
        message.warn('查无数据');
      }
      yield put({
        type: 'save',
        payload: {
          getPageResultData: response,
        },
      });
    },

    // 获取截止时间周期
    *getEndTimePeriod({ payload }, { call, put }) {
      const response = yield call(Analysis.getEndTimePeriod, payload);
      yield put({
        type: 'save',
        payload: {
          getEndTimePeriodData: response,
        },
      });
    },

    *getEndTimeContent({ payload }, { call, put }) {
      const response = yield call(Analysis.getEndTimeContent, payload);
      yield put({
        type: 'save',
        payload: {
          getEndTimeContentData: response,
        },
      });
    },

    // 点击自助常用分析
    *clickCommAutoAnaly({ payload }, { call, put }) {
      const response = yield call(Analysis.clickCommAutoAnaly, payload);
      yield put({
        type: 'save',
        payload: {
          clickCommAutoAnalyData: response,
        },
      });
    },

    // 自助分析保存
    *addCommAutoAnaly({ payload }, { call }) {
      yield call(Analysis.addCommAutoAnaly, payload);
      message.success('保存成功');
    },

    // 更新用户配置
    *updateCommAutoAnaly({ payload }, { call }) {
      yield call(Analysis.updateCommAutoAnaly, payload);
      message.success('保存成功');
    },

    // --------------------------------------展业地图--------------------------------------------------

    // 获取已有模型列表
    *getModelList({ payload }, { call, put }) {
      const response = yield call(Analysis.getModelList, payload);
      yield put({
        type: 'save',
        payload: {
          getModelListData: response,
        },
      });
    },

    // 获取新建模型列表
    *getNewModelList({ payload }, { call, put }) {
      const response = yield call(Analysis.getNewModelList, payload);
      yield put({
        type: 'save',
        payload: {
          getNewModelListData: response,
        },
      });
    },

    // 获取过滤维度
    *getMapFilterDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.getMapFilterDimensions, payload);
      yield put({
        type: 'save',
        payload: {
          getMapFilterDimensionsData: response,
        },
      });
    },

    // 动态查询维度内容
    *getRealTimeDimContent({ payload }, { call, put }) {
      const response = yield call(Analysis.getRealTimeDimContent, payload);
      yield put({
        type: 'save',
        payload: {
          getDimContentData: response,
        },
      });
    },

    // 放弃修改
    *discardChanges({ payload }, { call }) {
      yield call(Analysis.discardChanges, payload);
    },

    // 是否能新建模型
    *enableCreateModel({ payload }, { call, put }) {
      const response = yield call(Analysis.enableCreateModel, payload);
      yield put({
        type: 'save',
        payload: {
          enableCreateModelData: response,
        },
      });
    },

    // -------------------------------------------展业地图-----------------------------------------------------

    // 保存模型
    *saveModel({ payload }, { call }) {
      yield call(Analysis.saveModel, payload);
      message.success('保存成功');
    },

    // 查询某个模型具体内容（树呈现）
    *displayModelContent({ payload }, { call, put }) {
      const response = yield call(Analysis.displayModelContent, payload);
      yield put({
        type: 'save',
        payload: {
          displayModelContentData: response,
        },
      });
    },

    // 删除模型
    *deleteModel({ payload }, { call }) {
      const response = yield call(Analysis.deleteModel, payload);
      message.success('删除成功');
    },

    // 获取可编辑公司列表
    *getCompanyByUser({ payload }, { call, put }) {
      const response = yield call(Analysis.getCompanyByUser, payload);
      yield put({
        type: 'save',
        payload: {
          getCompanyByUserData: response,
        },
      });
    },

    // 是否能编辑模型
    *enableEditModel({ payload }, { call }) {
      yield call(Analysis.enableEditModel, payload);
    },

    // 模型管理查询机构列表
    *getCompanyInManage({ payload }, { call, put }) {
      const response = yield call(Analysis.getCompanyInManage, payload);
      yield put({
        type: 'save',
        payload: {
          getCompanyInManageData: response,
        },
      });
    },

    // 模型管理创建方案
    *getkylinTreeCal({ payload }, { call }) {
      const response = yield call(Analysis.getkylinTreeCal, payload);
      console.log(response);
    },

    // 模拟预测 -- 获取初始基础数据
    *initPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.initPlan, payload);
      yield put({
        type: 'save',
        payload: {
          initPlanData: response,
        },
      });
    },

    // 模拟预测 -- 刷新
    *doPredict({ payload }, { call, put }) {
      const response = yield call(Analysis.doPredict, payload);
      yield put({
        type: 'save',
        payload: {
          initNodesData: response,
        },
      });
    },

    // 模拟预测 -- 保存
    *savePlan({ payload }, { call }) {
      const response = yield call(Analysis.savePlan, payload);
      console.log(response);
    },

    // 模拟预测 -- 回溯
    *lookback({ payload }, { call, put }) {
      const response = yield call(Analysis.lookback, payload);
      yield put({
        type: 'save',
        payload: {
          lookbackData: response,
        },
      });
    },

    // 模拟预测 -- 检验保费占比
    *prmProCheck({ payload }, { call, put }) {
      const response = yield call(Analysis.prmProCheck, payload);
      yield put({
        type: 'save',
        payload: {
          prmProCheckData: response,
        },
      });
    },

    // 新建方案获取机构
    *getCompanyInAddPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.getCompanyInAddPlan, payload);
      yield put({
        type: 'save',
        payload: {
          getCompanyInAddPlanData: response,
        },
      });
    },

    // 中支公司获取参考方案
    *getReferPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.getReferPlan, payload);
      yield put({
        type: 'save',
        payload: {
          getReferPlanData: response,
        },
      });
    },

    // 方案管理页面机构选项
    *getCompanyplanManage({ payload }, { call, put }) {
      const response = yield call(Analysis.getCompanyplanManage, payload);
      yield put({
        type: 'save',
        payload: {
          getCompanyplanManageData: response,
        },
      });
    },

    // 新增方案
    *createPlan({ payload }, { call }) {
      const response = yield call(Analysis.createPlan, payload);
      message.success(`[${response}]方案初始数据计算中，请稍后在“方案管理”中查看`);
    },

    // 方案管理获取方案所有状态
    *getAllRunStatus({ payload }, { call, put }) {
      const response = yield call(Analysis.getAllRunStatus, payload);
      yield put({
        type: 'save',
        payload: {
          getAllRunStatusData: response,
        },
      });
    },

    // 查询方案列表
    *queryPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.queryPlan, payload);
      yield put({
        type: 'save',
        payload: {
          queryPlanData: response,
        },
      });
    },

    // 获取分公司非失效模型
    *selectEffectModel({ payload }, { call, put }) {
      const response = yield call(Analysis.selectEffectModel, payload);
      yield put({
        type: 'save',
        payload: {
          selectEffectModelData: response,
        },
      });
    },

    // 待汇总方案列表
    *planNeedSummarized({ payload }, { call, put }) {
      const response = yield call(Analysis.planNeedSummarized, payload);
      yield put({
        type: 'save',
        payload: {
          planNeedSummarizedData: response,
        },
      });
    },

    // 获取某个方案权限
    *getPlanAuth({ payload }, { call, put }) {
      const response = yield call(Analysis.getPlanAuth, payload);
      yield put({
        type: 'save',
        payload: {
          getPlanAuthData: response,
        },
      });
    },

    // 删除方案
    *planDelete({ payload }, { call }) {
      yield call(Analysis.planDelete, payload);
      message.success('操作成功');
    },

    // 提交方案
    *submitPlan({ payload }, { call }) {
      yield call(Analysis.submitPlan, payload);
      message.success('操作成功');
    },

    // 保存模拟方案
    *saveSimulatedPlan({ payload }, { call }) {
      yield call(Analysis.saveSimulatedPlan, payload);
      message.success('操作成功');
    },

    // 保存汇总方案
    *saveSummarizedPlan({ payload }, { call }) {
      yield call(Analysis.saveSummarizedPlan, payload);
      message.success('操作成功');
    },

    // 汇总
    *toSummarizedPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.toSummarizedPlan, payload);
      yield put({
        type: 'save',
        payload: { toSummarizedPlanData: response },
      });
    },

    // 方案复制
    *planCopy({ payload }, { call }) {
      yield call(Analysis.planCopy, payload);
      message.success('方案复制成功');
    },

    // 方案管理回溯
    *planLookBackCal({ payload }, { call }) {
      const response = yield call(Analysis.planLookBackCal, payload);
      message.success(`[${response}]方案回溯中，请稍后在方案管理中查看`);
    },

    // 查看中支方案
    *getCrenPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.getCrenPlan, payload);
      yield put({
        type: 'save',
        payload: {
          getCrenPlanData: response,
        },
      });
    },

    // 方案计算
    *planCal({ payload }, { call }) {
      yield call(Analysis.planCal, payload);
      message.success('方案计算中,请稍后查看方案状态');
    },

    // 启用方案
    *enbalePlan({ payload }, { call }) {
      const response = yield call(Analysis.enbalePlan, payload);
      message.success(`${response}方案启用成功`);
    },

    // 查看方案
    *getPlanDetailById({ payload }, { call, put }) {
      const response = yield call(Analysis.getPlanDetailById, payload);
      yield put({
        type: 'save',
        payload: {
          getPlanDetailByIdData: response,
        },
      });
    },

    // 模拟重置
    *resetPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.resetPlan, payload);
      yield put({
        type: 'save',
        payload: {
          initPlanData: response,
        },
      });
    },

    // 模拟确定
    *quitPlan({ payload }, { call }) {
      yield call(Analysis.quitPlan, payload);
      message.success('成功');
    },

    // 查看回溯结果下载
    *lookBackDownLoad({ payload }, { call }) {
      const response = yield call(lookBackDownLoad, payload);
      const fileName = '查看回溯结果下载.xlsx';
      if ('msSaveOrOpenBlob' in navigator) {
        window.navigator.msSaveOrOpenBlob(response, fileName);
      } else {
        const aLink = document.createElement('a');
        document.body.appendChild(aLink);
        aLink.style.display = 'none';
        const objectUrl = window.URL.createObjectURL(response);
        aLink.href = objectUrl;
        aLink.download = fileName;
        aLink.click();
        document.body.removeChild(aLink);
      }
    },

    // -------------------------------------------行业数据-----------------------------------------------------

    // 选择数据源获取下拉
    *getSelectData({ payload }, { call, put }) {
      const response = yield call(Analysis.getSelectData, payload);
      yield put({
        type: 'save',
        payload: {
          getSelectData: response,
        },
      });
    },

    // 起保口径初始数据
    *InitialCoverage({ payload }, { call, put }) {
      const response = yield call(Analysis.InitialCoverage, payload);
      yield put({
        type: 'save',
        payload: {
          InitialCoverageData: response,
        },
      });
    },

    // 获取指标
    *getQuota({ payload }, { call, put }) {
      const response = yield call(Analysis.getQuota, payload);
      yield put({
        type: 'save',
        payload: {
          getQuotaData: response,
        },
      });
    },

    // 查询起保数据
    *queryInsurance({ payload }, { call, put }) {
      const response = yield call(Analysis.queryInsurance, payload);
      yield put({
        type: 'save',
        payload: {
          queryInsuranceData: response,
        },
      });
    },

    // 分三级机构初始数据
    *getInitialConditions({ payload }, { call, put }) {
      const response = yield call(Analysis.getInitialConditions, payload);
      yield put({
        type: 'save',
        payload: {
          getInitialConditionsData: response,
        },
      });
    },

    // 分三级机构获取指标
    *getIndex({ payload }, { call, put }) {
      const response = yield call(Analysis.getIndex, payload);
      yield put({
        type: 'save',
        payload: {
          getIndexData: response,
        },
      });
    },

    // 分三级获取数据源获取下拉
    *getBusiness({ payload }, { call, put }) {
      const response = yield call(Analysis.getBusiness, payload);
      yield put({
        type: 'save',
        payload: {
          getBusinessData: response,
        },
      });
    },

    // 分三级获取数据源获取获取查询数据
    *getZbxMarketData({ payload }, { call, put }) {
      const response = yield call(Analysis.getZbxMarketData, payload);
      yield put({
        type: 'save',
        payload: {
          getZbxMarketData: response,
        },
      });
    },

    // 分三级-选择统计时间获取旬
    *getXunByMonth({ payload }, { call, put }) {
      const response = yield call(Analysis.getXunByMonth, payload);
      yield put({
        type: 'save',
        payload: {
          getXunByMonthData: response,
        },
      });
    },

    // ---------------------------------------- 归因分析 ---------------------------------------------------

    // 获取统计频度
    *getEndTime_Period({ payload }, { call, put }) {
      const response = yield call(Analysis.getEndTime_Period, payload);
      yield put({
        type: 'save',
        payload: {
          getEndTime_PeriodData: response,
        },
      });
    },

    // 获取统计时点
    *getEndTime_Content({ payload }, { call, put }) {
      const response = yield call(Analysis.getEndTime_Content, payload);
      yield put({
        type: 'save',
        payload: {
          getEndTime_ContentData: response,
        },
      });
    },

    // 获取分析维度
    *get_Dimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.get_Dimensions, payload);
      yield put({
        type: 'save',
        payload: {
          get_DimensionsData: response,
        },
      });
    },

    // 获取指标
    *getMeasures({ payload }, { call, put }) {
      const response = yield call(Analysis.getMeasures_analysis, payload);
      yield put({
        type: 'save',
        payload: {
          getMeasuresData: response,
        },
      });
    },

    // 按层级获取维度
    *getDimension_Content({ payload }, { call, put }) {
      const response = yield call(Analysis.getDimension_Content, payload);
      yield put({
        type: 'save',
        payload: {
          getDimension_ContentData: response,
        },
      });
    },

    // 获取机构
    *get_Company({ payload }, { call, put }) {
      const response = yield call(Analysis.get_Company, payload);
      yield put({
        type: 'save',
        payload: {
          get_CompanyData: response,
        },
      });
    },

    // 获取过滤维度
    *getFilterDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.getFilterDimensions_analysis, payload);
      yield put({
        type: 'save',
        payload: {
          getFilterDimensionsData: response,
        },
      });
    },

    // 生成图表
    *getMqbusiness({ payload }, { call, put }) {
      const { url } = payload;
      delete payload.url;
      console.log(payload)
      const response = yield call(Analysis.getMqbusiness, payload, url);
      yield put({
        type: 'save',
        payload: {
          getMqbusinessData: response,
        },
      });
    },

    // 新增保存结果
    *addanaly({ payload }, { call, put }) {
      yield call(Analysis.addanaly, payload);
    },

    // 更新保存结果
    *updateanaly({ payload }, { call, put }) {
      yield call(Analysis.updateanaly, payload);
    },

    // 个人工作台点击
    *clickanaly({ payload }, { call, put }) {
      const response = yield call(Analysis.clickanaly, payload);
      yield put({
        type: 'save',
        payload: {
          clickanalyData: response,
        },
      });
    },

    // 获取系统建议
    *addSystemSugg({ payload }, { call, put }) {
      yield call(Analysis.addSystemSugg, payload);
    },

    // 结果查看
    *getSystemSugg({ payload }, { call, put }) {
      const response = yield call(Analysis.getSystemSugg, payload);
      yield put({
        type: 'save',
        payload: {
          getSystemSuggData: response,
        },
      });
    },

    // 结果查看-状态
    *getRunStatus({ payload }, { call, put }) {
      const response = yield call(Analysis.getRunStatus, payload);
      yield put({
        type: 'save',
        payload: {
          getRunStatusData: response,
        },
      });
    },

    // 结果查看-删除
    *delSuggest({ payload }, { call, put }) {
      yield call(Analysis.delSuggest, payload);
    },

    // 满期赔案-获取统计时点
    *getpolicyYr({ payload }, { call, put }) {
      const response = yield call(Analysis.getpolicyYr, payload);
      yield put({
        type: 'save',
        payload: {
          getpolicyYrData: response,
        },
      });
    },

    // 满期赔案-获取筛选数据维度
    *getFilter_claim({ payload }, { call, put }) {
      const response = yield call(Analysis.getFilter_claim, payload);
      yield put({
        type: 'save',
        payload: {
          getFilter_claimData: response,
        },
      });
    },

    // 满期赔案-生成图表
    *getTableData({ payload }, { call, put }) {
      const { url } = payload;
      delete payload.url;
      const response = yield call(Analysis.getTableData, payload, url);
      yield put({
        type: 'save',
        payload: {
          getTableData: response,
        },
      });
    },

    // ---------------------------------------- 赔付预测 ---------------------------------------------------

    // 获取分析维度
    *payDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.payDimensionsData, payload);
      yield put({
        type: 'save',
        payload: {
          payDimensionsData: response,
        },
      });
    },

    // 获取统计周期
    *payTimePeriod({ payload }, { call, put }) {
      const response = yield call(Analysis.payTimePeriodData, payload);
      yield put({
        type: 'save',
        payload: {
          payTimePeriodData: response,
        },
      });
    },

    // 获取时间节点周期
    *payEndTimePeriod({ payload }, { call, put }) {
      const response = yield call(Analysis.payEndTimePeriodData, payload);
      yield put({
        type: 'save',
        payload: {
          payEndTimePeriodData: response,
        },
      });
    },

    // 获取时间节点内容
    *payEndTimeContent({ payload }, { call, put }) {
      const response = yield call(Analysis.payEndTimeContentData, payload);
      yield put({
        type: 'save',
        payload: {
          payEndTimeContentData: response,
        },
      });
    },

    // 获取维度具体内容
    *payDimensionContent({ payload }, { call, put }) {
      const response = yield call(Analysis.payDimensionContentData, payload);
      yield put({
        type: 'save',
        payload: {
          payDimensionContentData: response,
        },
      });
    },

    // 获取过滤维度
    *payFilter({ payload }, { call, put }) {
      const response = yield call(Analysis.payFilterData, payload);
      yield put({
        type: 'save',
        payload: {
          payFilterData: response,
        },
      });
    },

    // 获取指标
    *payMeasures({ payload }, { call, put }) {
      const response = yield call(Analysis.payMeasuresData, payload);
      yield put({
        type: 'save',
        payload: {
          payMeasuresData: response,
        },
      });
    },

    // 赔付率预测生成图表
    *payMeasure({ payload }, { call, put }) {
      const { url } = payload;
      delete payload.url;
      const response = yield call(Analysis.payMeasureData, payload, url);
      yield put({
        type: 'save',
        payload: {
          payMeasureData: response,
        },
      });
    },

    // 赔付预测新增保存查询
    *paySave({ payload }, { call, put }) {
      yield call(Analysis.paySaveData, payload);
    },

    // 赔付预测更新保存结果
    *payUpdate({ payload }, { call, put }) {
      yield call(Analysis.payUpdateData, payload);
    },

    // 个人工作台点击
    *payclickanaly({ payload }, { call, put }) {
      const response = yield call(Analysis.payclickanaly, payload);
      yield put({
        type: 'save',
        payload: {
          payclickanaly: response,
        },
      });
    },

    // 请求接口路径
    *payApplication({ payload }, { call, put }) {
      const response = yield call(Analysis.guiyin_getApplication, payload);
      yield put({
        type: 'save',
        payload: {
          payApplicationData: response,
        },
      });
    },

    // 可视化需求保存模板
    *saveMode({ payload }, { call, put }) {
      yield call(Analysis.saveMode, payload);
    },

    // 可视化需求查询模板
    *queryMode({ payload }, { call, put }) {
      const response = yield call(Analysis.queryMode, payload);
      yield put({
        type: 'save',
        payload: {
          queryModeData: response,
        },
      });
    },

    // 可视化需求编辑模板
    *editMode({ payload }, { call, put }) {
      const response = yield call(Analysis.editMode, payload);
      yield put({
        type: 'save',
        payload: {
          editModeData: response,
        },
      });
    },

    // 公共模板管理-添加用户
    *public_user({ payload }, { call, put }) {
      const response = yield call(Analysis.public_user, payload);
      yield put({
        type: 'save',
        payload: {
          public_userData: response,
        },
      });
    },

    // 公共模板管理-删除用户
    *publicDelete({ payload }, { call, put }) {
      yield call(Analysis.publicDelete, payload);
    },

    // 公共模板管理-初始化
    *publicQuery({ payload }, { call, put }) {
      const response = yield call(Analysis.publicQuery, payload);
      yield put({
        type: 'save',
        payload: {
          publicQueryData: response,
        },
      });
    },

    // 公共模板管理-获取用户真实姓名
    *publicName({ payload }, { call, put }) {
      const response = yield call(Analysis.publicName, payload);
      yield put({
        type: 'save',
        payload: {
          publicNameData: response,
        },
      });
    },

    // 公共模板管理-删除模板
    *publicDel({ payload }, { call, put }) {
      yield call(Analysis.publicDel, payload);
    },

    // ------------------------------------------------ 机构分析 ---------------------------------------------------------

    // 文字数据获取
    *in_task({ payload }, { call, put }) {
      const response = yield call(Analysis.in_task, payload);
      yield put({
        type: 'save',
        payload: {
          in_taskData: response,
        },
      });
    },

    // 发起评级初始化
    *in_select({ payload }, { call, put }) {
      const response = yield call(Analysis.in_select, payload);
      yield put({
        type: 'save',
        payload: {
          in_selectData: response,
        },
      });
    },

    // 发起评级按钮
    *in_initiateRat({ payload }, { call, put }) {
      const response = yield call(Analysis.in_initiateRat, payload);
      yield put({
        type: 'save',
        payload: {
          in_initiateRatData: response,
        },
      });
    },

    // 确认发起评级按钮
    *in_rat({ payload }, { call, put }) {
      yield call(Analysis.in_rat, payload);
    },

    // 数据上传-初始化
    *in_getRatTask({ payload }, { call, put }) {
      const response = yield call(Analysis.in_getRatTask, payload);
      yield put({
        type: 'save',
        payload: {
          in_getRatTaskData: response,
        },
      });
    },

    // 数据上传-下载模板
    *in_download({ payload }, { call, put }) {
      yield call(Analysis.in_download, payload);
    },

    // 数据上传-总公司-分公司上传
    *in_upload({ payload, name }, { call, put }) {
      yield call(Analysis.in_upload, payload, name);
    },

    // 数据上传-判定总分公司
    *in_log({ payload }, { call, put }) {
      const response = yield call(Analysis.in_log, payload);
      yield put({
        type: 'save',
        payload: {
          in_logData: response,
        },
      });
    },

    // 得分计算-获取数据
    *in_score({ payload }, { call, put }) {
      const response = yield call(Analysis.in_score, payload);
      yield put({
        type: 'save',
        payload: {
          in_scoreData: response,
        },
      });
    },

    // 得分计算-撤销
    *in_revoke({ payload }, { call, put }) {
      yield call(Analysis.in_revoke, payload);
    },

    // 得分计算-评分计算
    *in_scoreCal({ payload, url }, { call, put }) {
      yield call(Analysis.in_scoreCal, payload, url);
    },

    // 历史数据-查询
    *in_hisQuery({ payload }, { call, put }) {
      const response = yield call(Analysis.in_hisQuery, payload);
      yield put({
        type: 'save',
        payload: {
          in_hisQueryData: response,
        },
      });
    },

    // 历史数据-导出
    *in_historyExport({ payload, url }, { call, put }) {
      yield call(Analysis.in_historyExport, payload, url);
    },

    // ---------------------------------------------------  展业跟踪  -------------------------------------------------

    // 默认方案和业务单元信息
    *getDefaultPlanUnit({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getDefaultPlanUnit, payload);
      yield put({
        type: 'save',
        payload: {
          getDefaultPlanUnitData: response,
        },
      });
    },

    // 预警卡片数据
    *getMainAlertResult({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getMainAlertResult, payload);
      console.log(response);
      yield put({
        type: 'save',
        payload: {
          getMainAlertResultData: response,
        },
      });
    },

    // 获取方案
    *getEffectPlanContent({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getEffectPlanContent, payload);
      yield put({
        type: 'save',
        payload: {
          getEffectPlanContentData: response,
        },
      });
    },

    // 获取业务单元
    *getPlanBusUnit({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getPlanBusUnit, payload);
      yield put({
        type: 'save',
        payload: {
          getPlanBusUnitData: response,
        },
      });
    },

    // 初始化数据
    *getmonidata({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getmonidata, payload);
      yield put({
        type: 'save',
        payload: {
          getmonidataData: response,
        },
      });
    },

    // 回溯结果
    *getTrackdata({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getTrackdata, payload);
      yield put({
        type: 'save',
        payload: {
          getTrackdataData: response,
        },
      });
    },

    // ---------------------------------------------------  展业跟踪-预警详情  -------------------------------------------------

    // 选择所属方案
    *getAlertEffectPlan({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getAlertEffectPlan, payload);
      yield put({
        type: 'save',
        payload: {
          getAlertEffectPlanData: response,
        },
      });
    },

    // 选择指标
    *getAlertMeasureContent({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getAlertMeasureContent, payload);
      yield put({
        type: 'save',
        payload: {
          getAlertMeasureContentData: response,
        },
      });
    },

    // 新增
    *addAlert({ payload, url }, { call, put }) {
      yield call(Analysis.addAlert, payload);
    },

    // 编辑修改
    *updateAlert({ payload, url }, { call, put }) {
      yield call(Analysis.updateAlert, payload);
    },

    // 删除
    *deleteAlert({ payload, url }, { call, put }) {
      yield call(Analysis.deleteAlert, payload);
    },

    // 查询所有信息
    *selectAlert({ payload, url }, { call, put }) {
      const response = yield call(Analysis.selectAlert, payload);
      yield put({
        type: 'save',
        payload: {
          selectAlertData: response,
        },
      });
    },

    // ---------------------------------------------------  展业跟踪-预警通知  -------------------------------------------------

    // 预警通知
    *getAlertResult({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getAlertResult, payload);
      yield put({
        type: 'save',
        payload: {
          getAlertResultData: response,
        },
      });
    },

    // ------------------------------------------------ 用户配置-新建预警指标 ------------------------------------------------

    // 指标主题
    *getThemeSelect({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getThemeSelect, payload);
      yield put({
        type: 'save',
        payload: {
          getThemeSelectData: response,
        },
      });
    },

    // 数据指标
    *getUserMeasures({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getUserMeasures, payload);
      yield put({
        type: 'save',
        payload: {
          getUserMeasuresData: response,
        },
      });
    },

    // 获取筛选维度-初始
    *getUserFilter({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getUserFilter, payload);
      yield put({
        type: 'save',
        payload: {
          getUserFilterData: response,
        },
      });
    },

    // 获取用户下级机构
    *getUserCompany({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getUserCompany, payload);
      yield put({
        type: 'save',
        payload: {
          getUserCompany: response,
        },
      });
    },

    // 获取用户下级机构
    *componentCopy({ payload, url }, { call, put }) {
      yield call(Analysis.componentCopy, payload);
    },

    // 获取筛选维度-下级维度
    *getUserFilterDim({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getUserFilterDim, payload);
      yield put({
        type: 'save',
        payload: {
          getUserFilterDimData: response,
        }
      });
    },

    // 保存
    *saveAlarmInfo({ payload, url }, { call, put }) {
      yield call(Analysis.saveAlarmInfo, payload);
    },

    // ------------------------------------------------ 用户配置-指标库 ------------------------------------------------

    // 初始表格数据
    *qAlarmInfoList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qAlarmInfoList, payload);
      yield put({
        type: 'save',
        payload: {
          qAlarmInfoListData: response,
        },
      });
    },

    // 点击编辑后回显
    *qAlarmInfo({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qAlarmInfo, payload);
      yield put({
        type: 'save',
        payload: {
          qAlarmInfoData: response,
        },
      });
    },

    // 回显后保存
    *updAlarmInfo({ payload, url }, { call, put }) {
      yield call(Analysis.updAlarmInfo, payload);
    },

    // 删除
    *delAlarmInfo({ payload, url }, { call, put }) {
      yield call(Analysis.delAlarmInfo, payload);
    },

    // ------------------------------------------------ 新建/编辑组件 ------------------------------------------------

    // 卡片列表
    *qCardTypeList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCardTypeList, payload);
      yield put({
        type: 'save',
        payload: {
          qCardTypeListData: response,
        },
      });
    },

    // 卡片列表
    *getDimValue({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getDimValue, payload);
      yield put({
        type: 'save',
        payload: {
          getDimValueData: response,
        },
      });
    },

    // 修改X轴维度后的下级维度
    *getDimLevel({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getDimLevel, payload);
      yield put({
        type: 'save',
        payload: {
          getDimLevelData: response,
        },
      });
    },

    // 保存
    *saveCardAssem({ payload, url }, { call, put }) {
      yield call(Analysis.saveCardAssem, payload);
    },

    // 修改
    *updCardAssem({ payload, url }, { call, put }) {
      yield call(Analysis.updCardAssem, payload);
    },

    // ----------------------------------------------- 组件库 -----------------------------------------------------------

    // 查询
    *qCardAssemList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCardAssemList, payload);
      yield put({
        type: 'save',
        payload: {
          qCardAssemListData: response,
        },
      });
    },

    // 删除
    *delCardAssem({ payload, url }, { call, put }) {
      yield call(Analysis.delCardAssem, payload);
    },

    // 编辑
    *qCardAssemInfo({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCardAssemInfo, payload);
      yield put({
        type: 'save',
        payload: {
          qCardAssemInfoData: response,
        },
      });
    },

    // ----------------------------------------------- 资源管理 -----------------------------------------------------------

    // 保存
    *saveResource({ payload, url }, { call, put }) {
      yield call(Analysis.saveResource, payload);
    },

    // 修改
    *updResource({ payload, url }, { call, put }) {
      yield call(Analysis.updResource, payload);
    },

    // 查询
    *qResourceList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qResourceList, payload);
      yield put({
        type: 'save',
        payload: {
          qResourceListData: response,
        },
      });
    },

    // 编辑
    *qResourceInfoById({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qResourceInfoById, payload);
      yield put({
        type: 'save',
        payload: {
          qResourceInfoByIdData: response,
        },
      });
    },

    // ----------------------------------------------- 用户管理 -----------------------------------------------------------

    // 查询
    *qPubUserList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qPubUserList, payload);
      yield put({
        type: 'save',
        payload: {
          qPubUserListData: response,
        },
      });
    },

    // 机构联级数据
    *qCompanyLeveInfo({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCompanyLeveInfo, payload);
      yield put({
        type: 'save',
        payload: {
          qCompanyLeveInfoData: response,
        },
      });
    },

    // 点击编辑
    *qRole({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qRole, payload);
      yield put({
        type: 'save',
        payload: {
          qRoleData: response,
        },
      });
    },

    // 修改角色
    *updUserRoleList({ payload, url }, { call, put }) {
      yield call(Analysis.updUserRoleList, payload);
    },

    // 批量设置
    *addCompanyRole({ payload, url }, { call, put }) {
      yield call(Analysis.addCompanyRole, payload);
    },

    // ----------------------------------------------- 角色管理 -----------------------------------------------------------

    // 编辑数据权限
    *qPermi({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qPermi, payload);
      yield put({
        type: 'save',
        payload: {
          qPermiData: response,
        },
      });
    },

    // 新增角色
    *saveRoleInfo({ payload, url }, { call, put }) {
      yield call(Analysis.saveRoleInfo, payload);
    },

    // 删除角色
    *delRoleInfo({ payload, url }, { call, put }) {
      yield call(Analysis.delRoleInfo, payload);
    },

    // 修改角色
    *updRoleInfo({ payload, url }, { call, put }) {
      yield call(Analysis.updRoleInfo, payload);
    },

    // 角色管理表格数据请求
    *qRoleInfoLis({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qRoleInfoLis, payload);
      yield put({
        type: 'save',
        payload: {
          qRoleInfoLisData: response,
        },
      });
    },

    // 角色管理点击编辑回显
    *qRoleInfoById({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qRoleInfoById, payload);
      yield put({
        type: 'save',
        payload: {
          qRoleInfoByIdData: response,
        },
      });
    },

    // ----------------------------------------------- 权限管理 -----------------------------------------------------------

    // 编辑拥有资源
    *qResource({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qResource, payload);
      yield put({
        type: 'save',
        payload: {
          qResourceData: response,
        },
      });
    },

    // 权限管理点击编辑回显
    *qPermissionInfoById({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qPermissionInfoById, payload);
      yield put({
        type: 'save',
        payload: {
          qPermissionInfoByIdData: response,
        },
      });
    },

    // 权限管理表格数据请求
    *qPermissionList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qPermissionList, payload);
      yield put({
        type: 'save',
        payload: {
          qPermissionListData: response,
        },
      });
    },

    // 新增权限
    *savePermission({ payload, url }, { call, put }) {
      yield call(Analysis.savePermission, payload);
    },

    // 修改权限
    *updatePermission({ payload, url }, { call, put }) {
      yield call(Analysis.updatePermission, payload);
    },

    // 删除权限
    *deletePermission({ payload, url }, { call, put }) {
      yield call(Analysis.deletePermission, payload);
    },

    // -------------------------------------------------  图表组件  -----------------------------------------

    // 保存图表组件
    *createGraph({ payload, url }, { call, put }) {
      const response = yield call(Analysis.createGraph, payload);
      yield put({
        type: 'save',
        payload: {
          graphChartId: response.id,
        },
      });
    },

    // 组件库查询图表组件
    *queryGraph({ payload, url }, { call, put }) {
      const response = yield call(Analysis.queryGraph, payload);
      yield put({
        type: 'save',
        payload: {
          queryGraphData: response,
        },
      });
    },

    // 组件库删除图表组件
    *delGraph({ payload, url }, { call, put }) {
      yield call(Analysis.delGraph, payload);
    },

    // 图表组件修改
    *updateGraph({ payload, url }, { call, put }) {
      const response = yield call(Analysis.updateGraph, payload);
      yield put({
        type: 'save',
        payload: {
          graphChartId: response.id,
        },
      });
    },

    // 组件库图表组件编辑
    *graphPreview({ payload, url }, { call, put }) {
      const response = yield call(Analysis.graphPreview, payload);
      yield put({
        type: 'save',
        payload: {
          graphPreviewData: response,
        },
      });
    },

    // 判断当前用户是否是总部
    *queryUser({ payload, url }, { call, put }) {
      const response = yield call(Analysis.queryUser, payload);
      yield put({
        type: 'save',
        payload: {
          queryUserData: response,
        },
      });
    },

    // 获取指标的值
    *queryMeasureValueType({ payload, url }, { call, put }) {
      const response = yield call(Analysis.queryMeasureValueType, payload);
      yield put({
        type: 'save',
        payload: {
          queryMeasureValueTypeData: response,
        },
      });
    },

    // -----------------------------------------------------  门户  --------------------------------------------------------------

    // 门户初始化
    *savePortalConfig({ payload, url }, { call, put }) {
      yield call(Analysis.savePortalConfig, payload);
    },

    // 门户初始化
    *queryPortalList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.queryPortalList, payload);
      yield put({
        type: 'save',
        payload: {
          queryPortalListData: response,
        },
      });
    },

    // 门户用户配置数据后保存
    *saveGraphRelate({ payload, url }, { call, put }) {
      yield call(Analysis.saveGraphRelate, payload);
    },

    // 门户获取卡片和图表的数据
    *qMeasureData({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qMeasureData, payload);
      yield put({
        type: 'save',
        payload: {
          qMeasureDataData: response,
        },
      });
    },

    // 门户图表组件换位
    *updateSortNum({ payload, url }, { call, put }) {
      yield call(Analysis.updateSortNum, payload);
    },

    // 门户卡片组件数据请求
    *cardQMeasureData({ payload, url }, { call, put }) {
      const response = yield call(Analysis.cardQMeasureData, payload);
      yield put({
        type: 'save',
        payload: {
          cardQMeasureDataData: response,
        },
      });
    },

    // 门户卡片下钻
    *cardDrillDown({ payload, url }, { call, put }) {
      const response = yield call(Analysis.cardDrillDown, payload);
      yield put({
        type: 'save',
        payload: {
          cardDrillDownData: response,
        },
      });
    },

    // 门户图表下钻
    *chartDrillDown({ payload, url }, { call, put }) {
      const response = yield call(Analysis.chartDrillDown, payload);
      yield put({
        type: 'save',
        payload: {
          chartDrillDownData: response,
        },
      });
    },

    // 给后端配的界面请求
    *doorAlarmqList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.doorAlarmqList, payload);
      yield put({
        type: 'save',
        payload: {
          doorAlarmqListData: response,
        },
      });
    },

    // 给后端配的界面请求
    *doorAlarmredis({ payload, url }, { call, put }) {
      yield call(Analysis.doorAlarmredis, payload);
    },

    // 给后端配的界面请求
    *doorAlarmdeleteRedis({ payload, url }, { call, put }) {
      yield call(Analysis.doorAlarmdeleteRedis, payload);
    },

    // 给后端配的界面请求
    *graphqList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.graphqList, payload);
      yield put({
        type: 'save',
        payload: {
          graphqListData: response,
        },
      });
    },

    // 给后端配的界面请求
    *graphredis({ payload, url }, { call, put }) {
      yield call(Analysis.graphredis, payload);
    },

    // 给后端配的界面请求
    *graphdeleteRedis({ payload, url }, { call, put }) {
      yield call(Analysis.graphdeleteRedis, payload);
    },

    // 给后端配的界面请求
    *openSave({ payload, url }, { call, put }) {
      yield call(Analysis.openSave, payload);
    },

    // -----------------------------------------------------  门户功能  --------------------------------------------------------------

    // 给后端配的界面请求
    *portalList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.portalList, payload);
      yield put({
        type: 'save',
        payload: {
          portalListData: response,
        },
      });
    },

    // 门户复制
    *copyPortal({ payload, url }, { call, put }) {
      yield call(Analysis.copyPortal, payload);
    },

    // 判定当前用户的机构
    *getCompany({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getCompany, payload);
      yield put({
        type: 'save',
        payload: {
          getCompany: response,
        },
      });
    },

    // 组件库卡片复制
    *copyAssemToCompany({ payload, url }, { call, put }) {
      yield call(Analysis.copyAssemToCompany, payload);
    },

    // 组件库图表复制
    *copyGraphToCompany({ payload, url }, { call, put }) {
      yield call(Analysis.copyGraphToCompany, payload);
    },

    // 门户日志
    *qCopyLog({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCopyLog, payload);
      yield put({
        type: 'save',
        payload: {
          qCopyLogData: response,
        },
      });
    },

    // 门户还原
    *reduPortal({ payload, url }, { call, put }) {
      yield call(Analysis.reduPortal, payload);
    },

    // 邮件订阅查询
    *qSubscribe({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qSubscribe, payload);
      yield put({
        type: 'save',
        payload: {
          qSubscribeData: response
        }
      })
    },

    // 邮件订阅
    *updSubscribe({ payload, url }, { call, put }) {
      yield call(Analysis.updSubscribe, payload);
    },

    // 下级机构查询
    *getCompanyLevel({ payload, url }, { call, put }) {
      const request = yield call(Analysis.getCompanyLevel, payload);
      yield put({
        type: 'save',
        payload: {
          getSubCompanyData: request
        }
      })
    },

    // 下级机构切换
    *changeCompany({ payload, url }, { call, put }) {
      yield call(Analysis.changeCompany, payload);
    },

    // 数据字典指标查询
    *getMeasureList({ payload, url }, { call, put }) {
      const request = yield call(Analysis.getMeasureList, payload);
      yield put({
        type: 'save',
        payload: {
          getMeasureListData: request
        }
      })
    },

    // 数据字典指标定义查询
    *getMeasureDefi({ payload, url }, { call, put }) {
      const request = yield call(Analysis.getMeasureDefi, payload);
      yield put({
        type: 'save',
        payload: {
          getMeasureDefiData: request
        }
      })
    },

    // 数据字典指标定义保存
    *updMeasureDefi({ payload, url }, { call, put }) {
      yield call(Analysis.updMeasureDefi, payload);
    },

    // 操作手册
    *getFileList({ payload, url }, { call, put }) {
      const request = yield call(Analysis.getFileList, payload);
      yield put({
        type: 'save',
        payload: {
          getFileListData: request
        }
      })
    },
  },
};