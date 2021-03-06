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
    measureObj: [],         // ??????????????????????????????
    showLine: true,        // ????????????-?????????-??????/????????????-????????????-?????????????????????
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
    // ??????????????????
    *getUserInfo({ payload }, { call, put }) {
      const response = yield call(Analysis.getUserInfo, payload);
      yield put({
        type: 'save',
        payload: {
          getUserInfoData: response,
        },
      });
    },

    // ---------------------------------------???????????????-------------------------------------------------

    // ????????????--????????????
    *dimAnalysisApplication({ payload }, { call, put }) {
      const response = yield call(Analysis.dimAnalysisApplication, payload);
      yield put({
        type: 'save',
        payload: {
          getApplicationData: response,
        },
      });
    },

    // ????????????--????????????
    *dimAnalysisTheme({ payload }, { call, put }) {
      const response = yield call(Analysis.dimAnalysisTheme, payload);
      yield put({
        type: 'save',
        payload: {
          getThemeData: response,
        },
      });
    },

    // ????????????--?????????????????????
    *dimAnalysisMeasures({ payload }, { call, put }) {
      const response = yield call(Analysis.dimAnalysisMeasures, payload);
      yield put({
        type: 'save',
        payload: {
          measure: response,
        },
      });
    },

    // ????????????--?????????????????????
    *getDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.anaGetDimensions, payload);
      yield put({
        type: 'save',
        payload: {
          getDimensions: response,
        },
      });
    },

    // ????????????--??????????????????
    *dimAnalysisFilterDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.dimAnalysisFilterDimensions, payload);
      yield put({
        type: 'save',
        payload: {
          dimension: response,
        },
      });
    },

    // ????????????--????????????
    *getDimensionContent({ payload }, { call, put }) {
      const response = yield call(Analysis.getDimensionContent, payload);
      yield put({
        type: 'save',
        payload: {
          getDimensionContentData: response,
        },
      });
    },

    // ????????????--??????????????????
    *getalarm({ payload }, { call, put }) {
      const response = yield call(Analysis.getalarm, payload);
      yield put({
        type: 'save',
        payload: {
          getalarmData: response,
        },
      });
    },

    // ????????????--????????????????????????
    *setflag({ payload }, { call }) {
      const response = yield call(Analysis.setflag, payload);
      if (response === true) {
        message.success('????????????');
      } else {
        message.warn('????????????');
      }
    },

    // ????????????--????????????
    *createProduct({ payload }, { call }) {
      const response = yield call(Analysis.product, payload);
      if (response === true) {
        if (payload.operateType === 'c') {
          message.success('????????????');
        } else {
          message.success('????????????');
        }
      }
    },

    // ????????????--????????????
    *searchProduct({ payload }, { call, put }) {
      const response = yield call(Analysis.product, payload);
      yield put({
        type: 'save',
        payload: {
          searchData: response,
        },
      });
    },

    // ????????????--????????????
    *deleteProduct({ payload }, { call, put }) {
      const response = yield call(Analysis.product, payload);
      yield put({
        type: 'save',
        payload: {
          productData: response,
        },
      });
    },

    // ????????????--???????????????????????????
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

    // ????????????--????????????????????????
    *getTimePeriod({ payload }, { call, put }) {
      const response = yield call(Analysis.getTimePeriod, payload);
      yield put({
        type: 'save',
        payload: {
          getTimePeriodData: response,
        },
      });
    },

    // ????????????????????????
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

    // ??????---????????????
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

    // ?????????????????????
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

    // ???????????????--????????????
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

    // ????????????????????????
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


    // ????????????
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

    // ??????????????????
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

    // ??????????????? --- ????????????
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

    // ???????????? --- ????????????
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

    // ????????????????????????
    *addCommaly({ payload }, { call }) {
      const response = yield call(Analysis.addCommaly, payload);
      message.success('????????????');
    },

    // ????????????????????????
    *updateCommaly({ payload }, { call }) {
      const response = yield call(Analysis.updateCommaly, payload);
      message.success('????????????');
    },

    // ??????????????????
    *clickCommaly({ payload }, { call, put }) {
      const response = yield call(Analysis.clickCommaly, payload);
      yield put({
        type: 'save',
        payload: {
          clickCommalyData: response,
        },
      });
    },

    // ??????????????????
    *downLoad({ payload }, { call }) {
      yield call(Analysis.downLoad, payload);
    },

    // ??????????????????
    // *autolyDownLoad({ payload }, { call }) {
    //   yield call(Analysis.downLoad, payload);
    // },
    *autolyDownLoad({ payload }, { call }) {
      const response = yield call(autolyDownLoad, payload);
      const fileName = '??????????????????.xls';
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


    // --------------------------------------????????????----------------------------------
    // ????????????????????????
    *getAllTableInfo({ payload }, { call, put }) {
      const response = yield call(Analysis.getAllTableInfo, payload);
      yield put({
        type: 'save',
        payload: {
          getAllTableInfoData: response,
        },
      });
    },

    // ????????????????????????????????????????????????
    *getMainTabRelateTabInfo({ payload }, { call, put }) {
      const response = yield call(Analysis.getMainTabRelateTabInfo, payload);
      yield put({
        type: 'save',
        payload: {
          getAllTableInfoData: response,
        },
      });
    },

    // ??????????????????
    *getMainTable({ payload }, { call, put }) {
      const response = yield call(Analysis.getMainTable, payload);
      yield put({
        type: 'save',
        payload: {
          getMainTableData: response,
        },
      });
    },

    // ?????????????????????
    *getFilterInfo({ payload }, { call, put }) {
      const response = yield call(Analysis.getFilterInfo, payload);
      yield put({
        type: 'save',
        payload: {
          getFilterInfoData: response,
        },
      });
    },

    // ??????????????????
    *getDimDesc({ payload }, { call, put }) {
      const response = yield call(Analysis.getDimDesc, payload);
      yield put({
        type: 'save',
        payload: {
          getDimDescData: response,
        },
      });
    },

    // ??????????????????????????????
    *getMainTabDateCol({ payload }, { call, put }) {
      const response = yield call(Analysis.getMainTabDateCol, payload);
      yield put({
        type: 'save',
        payload: {
          getMainTabDateColData: response,
        },
      });
    },

    // ??????impala??????
    *getPageResult({ payload }, { call, put }) {
      const response = yield call(Analysis.getPageResult, payload);
      if (response.result.length === 0) {
        message.warn('????????????');
      }
      yield put({
        type: 'save',
        payload: {
          getPageResultData: response,
        },
      });
    },

    // ????????????????????????
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

    // ????????????????????????
    *clickCommAutoAnaly({ payload }, { call, put }) {
      const response = yield call(Analysis.clickCommAutoAnaly, payload);
      yield put({
        type: 'save',
        payload: {
          clickCommAutoAnalyData: response,
        },
      });
    },

    // ??????????????????
    *addCommAutoAnaly({ payload }, { call }) {
      yield call(Analysis.addCommAutoAnaly, payload);
      message.success('????????????');
    },

    // ??????????????????
    *updateCommAutoAnaly({ payload }, { call }) {
      yield call(Analysis.updateCommAutoAnaly, payload);
      message.success('????????????');
    },

    // --------------------------------------????????????--------------------------------------------------

    // ????????????????????????
    *getModelList({ payload }, { call, put }) {
      const response = yield call(Analysis.getModelList, payload);
      yield put({
        type: 'save',
        payload: {
          getModelListData: response,
        },
      });
    },

    // ????????????????????????
    *getNewModelList({ payload }, { call, put }) {
      const response = yield call(Analysis.getNewModelList, payload);
      yield put({
        type: 'save',
        payload: {
          getNewModelListData: response,
        },
      });
    },

    // ??????????????????
    *getMapFilterDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.getMapFilterDimensions, payload);
      yield put({
        type: 'save',
        payload: {
          getMapFilterDimensionsData: response,
        },
      });
    },

    // ????????????????????????
    *getRealTimeDimContent({ payload }, { call, put }) {
      const response = yield call(Analysis.getRealTimeDimContent, payload);
      yield put({
        type: 'save',
        payload: {
          getDimContentData: response,
        },
      });
    },

    // ????????????
    *discardChanges({ payload }, { call }) {
      yield call(Analysis.discardChanges, payload);
    },

    // ?????????????????????
    *enableCreateModel({ payload }, { call, put }) {
      const response = yield call(Analysis.enableCreateModel, payload);
      yield put({
        type: 'save',
        payload: {
          enableCreateModelData: response,
        },
      });
    },

    // -------------------------------------------????????????-----------------------------------------------------

    // ????????????
    *saveModel({ payload }, { call }) {
      yield call(Analysis.saveModel, payload);
      message.success('????????????');
    },

    // ?????????????????????????????????????????????
    *displayModelContent({ payload }, { call, put }) {
      const response = yield call(Analysis.displayModelContent, payload);
      yield put({
        type: 'save',
        payload: {
          displayModelContentData: response,
        },
      });
    },

    // ????????????
    *deleteModel({ payload }, { call }) {
      const response = yield call(Analysis.deleteModel, payload);
      message.success('????????????');
    },

    // ???????????????????????????
    *getCompanyByUser({ payload }, { call, put }) {
      const response = yield call(Analysis.getCompanyByUser, payload);
      yield put({
        type: 'save',
        payload: {
          getCompanyByUserData: response,
        },
      });
    },

    // ?????????????????????
    *enableEditModel({ payload }, { call }) {
      yield call(Analysis.enableEditModel, payload);
    },

    // ??????????????????????????????
    *getCompanyInManage({ payload }, { call, put }) {
      const response = yield call(Analysis.getCompanyInManage, payload);
      yield put({
        type: 'save',
        payload: {
          getCompanyInManageData: response,
        },
      });
    },

    // ????????????????????????
    *getkylinTreeCal({ payload }, { call }) {
      const response = yield call(Analysis.getkylinTreeCal, payload);
      console.log(response);
    },

    // ???????????? -- ????????????????????????
    *initPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.initPlan, payload);
      yield put({
        type: 'save',
        payload: {
          initPlanData: response,
        },
      });
    },

    // ???????????? -- ??????
    *doPredict({ payload }, { call, put }) {
      const response = yield call(Analysis.doPredict, payload);
      yield put({
        type: 'save',
        payload: {
          initNodesData: response,
        },
      });
    },

    // ???????????? -- ??????
    *savePlan({ payload }, { call }) {
      const response = yield call(Analysis.savePlan, payload);
      console.log(response);
    },

    // ???????????? -- ??????
    *lookback({ payload }, { call, put }) {
      const response = yield call(Analysis.lookback, payload);
      yield put({
        type: 'save',
        payload: {
          lookbackData: response,
        },
      });
    },

    // ???????????? -- ??????????????????
    *prmProCheck({ payload }, { call, put }) {
      const response = yield call(Analysis.prmProCheck, payload);
      yield put({
        type: 'save',
        payload: {
          prmProCheckData: response,
        },
      });
    },

    // ????????????????????????
    *getCompanyInAddPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.getCompanyInAddPlan, payload);
      yield put({
        type: 'save',
        payload: {
          getCompanyInAddPlanData: response,
        },
      });
    },

    // ??????????????????????????????
    *getReferPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.getReferPlan, payload);
      yield put({
        type: 'save',
        payload: {
          getReferPlanData: response,
        },
      });
    },

    // ??????????????????????????????
    *getCompanyplanManage({ payload }, { call, put }) {
      const response = yield call(Analysis.getCompanyplanManage, payload);
      yield put({
        type: 'save',
        payload: {
          getCompanyplanManageData: response,
        },
      });
    },

    // ????????????
    *createPlan({ payload }, { call }) {
      const response = yield call(Analysis.createPlan, payload);
      message.success(`[${response}]?????????????????????????????????????????????????????????????????????`);
    },

    // ????????????????????????????????????
    *getAllRunStatus({ payload }, { call, put }) {
      const response = yield call(Analysis.getAllRunStatus, payload);
      yield put({
        type: 'save',
        payload: {
          getAllRunStatusData: response,
        },
      });
    },

    // ??????????????????
    *queryPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.queryPlan, payload);
      yield put({
        type: 'save',
        payload: {
          queryPlanData: response,
        },
      });
    },

    // ??????????????????????????????
    *selectEffectModel({ payload }, { call, put }) {
      const response = yield call(Analysis.selectEffectModel, payload);
      yield put({
        type: 'save',
        payload: {
          selectEffectModelData: response,
        },
      });
    },

    // ?????????????????????
    *planNeedSummarized({ payload }, { call, put }) {
      const response = yield call(Analysis.planNeedSummarized, payload);
      yield put({
        type: 'save',
        payload: {
          planNeedSummarizedData: response,
        },
      });
    },

    // ????????????????????????
    *getPlanAuth({ payload }, { call, put }) {
      const response = yield call(Analysis.getPlanAuth, payload);
      yield put({
        type: 'save',
        payload: {
          getPlanAuthData: response,
        },
      });
    },

    // ????????????
    *planDelete({ payload }, { call }) {
      yield call(Analysis.planDelete, payload);
      message.success('????????????');
    },

    // ????????????
    *submitPlan({ payload }, { call }) {
      yield call(Analysis.submitPlan, payload);
      message.success('????????????');
    },

    // ??????????????????
    *saveSimulatedPlan({ payload }, { call }) {
      yield call(Analysis.saveSimulatedPlan, payload);
      message.success('????????????');
    },

    // ??????????????????
    *saveSummarizedPlan({ payload }, { call }) {
      yield call(Analysis.saveSummarizedPlan, payload);
      message.success('????????????');
    },

    // ??????
    *toSummarizedPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.toSummarizedPlan, payload);
      yield put({
        type: 'save',
        payload: { toSummarizedPlanData: response },
      });
    },

    // ????????????
    *planCopy({ payload }, { call }) {
      yield call(Analysis.planCopy, payload);
      message.success('??????????????????');
    },

    // ??????????????????
    *planLookBackCal({ payload }, { call }) {
      const response = yield call(Analysis.planLookBackCal, payload);
      message.success(`[${response}]???????????????????????????????????????????????????`);
    },

    // ??????????????????
    *getCrenPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.getCrenPlan, payload);
      yield put({
        type: 'save',
        payload: {
          getCrenPlanData: response,
        },
      });
    },

    // ????????????
    *planCal({ payload }, { call }) {
      yield call(Analysis.planCal, payload);
      message.success('???????????????,???????????????????????????');
    },

    // ????????????
    *enbalePlan({ payload }, { call }) {
      const response = yield call(Analysis.enbalePlan, payload);
      message.success(`${response}??????????????????`);
    },

    // ????????????
    *getPlanDetailById({ payload }, { call, put }) {
      const response = yield call(Analysis.getPlanDetailById, payload);
      yield put({
        type: 'save',
        payload: {
          getPlanDetailByIdData: response,
        },
      });
    },

    // ????????????
    *resetPlan({ payload }, { call, put }) {
      const response = yield call(Analysis.resetPlan, payload);
      yield put({
        type: 'save',
        payload: {
          initPlanData: response,
        },
      });
    },

    // ????????????
    *quitPlan({ payload }, { call }) {
      yield call(Analysis.quitPlan, payload);
      message.success('??????');
    },

    // ????????????????????????
    *lookBackDownLoad({ payload }, { call }) {
      const response = yield call(lookBackDownLoad, payload);
      const fileName = '????????????????????????.xlsx';
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

    // -------------------------------------------????????????-----------------------------------------------------

    // ???????????????????????????
    *getSelectData({ payload }, { call, put }) {
      const response = yield call(Analysis.getSelectData, payload);
      yield put({
        type: 'save',
        payload: {
          getSelectData: response,
        },
      });
    },

    // ????????????????????????
    *InitialCoverage({ payload }, { call, put }) {
      const response = yield call(Analysis.InitialCoverage, payload);
      yield put({
        type: 'save',
        payload: {
          InitialCoverageData: response,
        },
      });
    },

    // ????????????
    *getQuota({ payload }, { call, put }) {
      const response = yield call(Analysis.getQuota, payload);
      yield put({
        type: 'save',
        payload: {
          getQuotaData: response,
        },
      });
    },

    // ??????????????????
    *queryInsurance({ payload }, { call, put }) {
      const response = yield call(Analysis.queryInsurance, payload);
      yield put({
        type: 'save',
        payload: {
          queryInsuranceData: response,
        },
      });
    },

    // ???????????????????????????
    *getInitialConditions({ payload }, { call, put }) {
      const response = yield call(Analysis.getInitialConditions, payload);
      yield put({
        type: 'save',
        payload: {
          getInitialConditionsData: response,
        },
      });
    },

    // ???????????????????????????
    *getIndex({ payload }, { call, put }) {
      const response = yield call(Analysis.getIndex, payload);
      yield put({
        type: 'save',
        payload: {
          getIndexData: response,
        },
      });
    },

    // ????????????????????????????????????
    *getBusiness({ payload }, { call, put }) {
      const response = yield call(Analysis.getBusiness, payload);
      yield put({
        type: 'save',
        payload: {
          getBusinessData: response,
        },
      });
    },

    // ????????????????????????????????????????????????
    *getZbxMarketData({ payload }, { call, put }) {
      const response = yield call(Analysis.getZbxMarketData, payload);
      yield put({
        type: 'save',
        payload: {
          getZbxMarketData: response,
        },
      });
    },

    // ?????????-???????????????????????????
    *getXunByMonth({ payload }, { call, put }) {
      const response = yield call(Analysis.getXunByMonth, payload);
      yield put({
        type: 'save',
        payload: {
          getXunByMonthData: response,
        },
      });
    },

    // ---------------------------------------- ???????????? ---------------------------------------------------

    // ??????????????????
    *getEndTime_Period({ payload }, { call, put }) {
      const response = yield call(Analysis.getEndTime_Period, payload);
      yield put({
        type: 'save',
        payload: {
          getEndTime_PeriodData: response,
        },
      });
    },

    // ??????????????????
    *getEndTime_Content({ payload }, { call, put }) {
      const response = yield call(Analysis.getEndTime_Content, payload);
      yield put({
        type: 'save',
        payload: {
          getEndTime_ContentData: response,
        },
      });
    },

    // ??????????????????
    *get_Dimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.get_Dimensions, payload);
      yield put({
        type: 'save',
        payload: {
          get_DimensionsData: response,
        },
      });
    },

    // ????????????
    *getMeasures({ payload }, { call, put }) {
      const response = yield call(Analysis.getMeasures_analysis, payload);
      yield put({
        type: 'save',
        payload: {
          getMeasuresData: response,
        },
      });
    },

    // ?????????????????????
    *getDimension_Content({ payload }, { call, put }) {
      const response = yield call(Analysis.getDimension_Content, payload);
      yield put({
        type: 'save',
        payload: {
          getDimension_ContentData: response,
        },
      });
    },

    // ????????????
    *get_Company({ payload }, { call, put }) {
      const response = yield call(Analysis.get_Company, payload);
      yield put({
        type: 'save',
        payload: {
          get_CompanyData: response,
        },
      });
    },

    // ??????????????????
    *getFilterDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.getFilterDimensions_analysis, payload);
      yield put({
        type: 'save',
        payload: {
          getFilterDimensionsData: response,
        },
      });
    },

    // ????????????
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

    // ??????????????????
    *addanaly({ payload }, { call, put }) {
      yield call(Analysis.addanaly, payload);
    },

    // ??????????????????
    *updateanaly({ payload }, { call, put }) {
      yield call(Analysis.updateanaly, payload);
    },

    // ?????????????????????
    *clickanaly({ payload }, { call, put }) {
      const response = yield call(Analysis.clickanaly, payload);
      yield put({
        type: 'save',
        payload: {
          clickanalyData: response,
        },
      });
    },

    // ??????????????????
    *addSystemSugg({ payload }, { call, put }) {
      yield call(Analysis.addSystemSugg, payload);
    },

    // ????????????
    *getSystemSugg({ payload }, { call, put }) {
      const response = yield call(Analysis.getSystemSugg, payload);
      yield put({
        type: 'save',
        payload: {
          getSystemSuggData: response,
        },
      });
    },

    // ????????????-??????
    *getRunStatus({ payload }, { call, put }) {
      const response = yield call(Analysis.getRunStatus, payload);
      yield put({
        type: 'save',
        payload: {
          getRunStatusData: response,
        },
      });
    },

    // ????????????-??????
    *delSuggest({ payload }, { call, put }) {
      yield call(Analysis.delSuggest, payload);
    },

    // ????????????-??????????????????
    *getpolicyYr({ payload }, { call, put }) {
      const response = yield call(Analysis.getpolicyYr, payload);
      yield put({
        type: 'save',
        payload: {
          getpolicyYrData: response,
        },
      });
    },

    // ????????????-????????????????????????
    *getFilter_claim({ payload }, { call, put }) {
      const response = yield call(Analysis.getFilter_claim, payload);
      yield put({
        type: 'save',
        payload: {
          getFilter_claimData: response,
        },
      });
    },

    // ????????????-????????????
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

    // ---------------------------------------- ???????????? ---------------------------------------------------

    // ??????????????????
    *payDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.payDimensionsData, payload);
      yield put({
        type: 'save',
        payload: {
          payDimensionsData: response,
        },
      });
    },

    // ??????????????????
    *payTimePeriod({ payload }, { call, put }) {
      const response = yield call(Analysis.payTimePeriodData, payload);
      yield put({
        type: 'save',
        payload: {
          payTimePeriodData: response,
        },
      });
    },

    // ????????????????????????
    *payEndTimePeriod({ payload }, { call, put }) {
      const response = yield call(Analysis.payEndTimePeriodData, payload);
      yield put({
        type: 'save',
        payload: {
          payEndTimePeriodData: response,
        },
      });
    },

    // ????????????????????????
    *payEndTimeContent({ payload }, { call, put }) {
      const response = yield call(Analysis.payEndTimeContentData, payload);
      yield put({
        type: 'save',
        payload: {
          payEndTimeContentData: response,
        },
      });
    },

    // ????????????????????????
    *payDimensionContent({ payload }, { call, put }) {
      const response = yield call(Analysis.payDimensionContentData, payload);
      yield put({
        type: 'save',
        payload: {
          payDimensionContentData: response,
        },
      });
    },

    // ??????????????????
    *payFilter({ payload }, { call, put }) {
      const response = yield call(Analysis.payFilterData, payload);
      yield put({
        type: 'save',
        payload: {
          payFilterData: response,
        },
      });
    },

    // ????????????
    *payMeasures({ payload }, { call, put }) {
      const response = yield call(Analysis.payMeasuresData, payload);
      yield put({
        type: 'save',
        payload: {
          payMeasuresData: response,
        },
      });
    },

    // ???????????????????????????
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

    // ??????????????????????????????
    *paySave({ payload }, { call, put }) {
      yield call(Analysis.paySaveData, payload);
    },

    // ??????????????????????????????
    *payUpdate({ payload }, { call, put }) {
      yield call(Analysis.payUpdateData, payload);
    },

    // ?????????????????????
    *payclickanaly({ payload }, { call, put }) {
      const response = yield call(Analysis.payclickanaly, payload);
      yield put({
        type: 'save',
        payload: {
          payclickanaly: response,
        },
      });
    },

    // ??????????????????
    *payApplication({ payload }, { call, put }) {
      const response = yield call(Analysis.guiyin_getApplication, payload);
      yield put({
        type: 'save',
        payload: {
          payApplicationData: response,
        },
      });
    },

    // ???????????????????????????
    *saveMode({ payload }, { call, put }) {
      yield call(Analysis.saveMode, payload);
    },

    // ???????????????????????????
    *queryMode({ payload }, { call, put }) {
      const response = yield call(Analysis.queryMode, payload);
      yield put({
        type: 'save',
        payload: {
          queryModeData: response,
        },
      });
    },

    // ???????????????????????????
    *editMode({ payload }, { call, put }) {
      const response = yield call(Analysis.editMode, payload);
      yield put({
        type: 'save',
        payload: {
          editModeData: response,
        },
      });
    },

    // ??????????????????-????????????
    *public_user({ payload }, { call, put }) {
      const response = yield call(Analysis.public_user, payload);
      yield put({
        type: 'save',
        payload: {
          public_userData: response,
        },
      });
    },

    // ??????????????????-????????????
    *publicDelete({ payload }, { call, put }) {
      yield call(Analysis.publicDelete, payload);
    },

    // ??????????????????-?????????
    *publicQuery({ payload }, { call, put }) {
      const response = yield call(Analysis.publicQuery, payload);
      yield put({
        type: 'save',
        payload: {
          publicQueryData: response,
        },
      });
    },

    // ??????????????????-????????????????????????
    *publicName({ payload }, { call, put }) {
      const response = yield call(Analysis.publicName, payload);
      yield put({
        type: 'save',
        payload: {
          publicNameData: response,
        },
      });
    },

    // ??????????????????-????????????
    *publicDel({ payload }, { call, put }) {
      yield call(Analysis.publicDel, payload);
    },

    // ------------------------------------------------ ???????????? ---------------------------------------------------------

    // ??????????????????
    *in_task({ payload }, { call, put }) {
      const response = yield call(Analysis.in_task, payload);
      yield put({
        type: 'save',
        payload: {
          in_taskData: response,
        },
      });
    },

    // ?????????????????????
    *in_select({ payload }, { call, put }) {
      const response = yield call(Analysis.in_select, payload);
      yield put({
        type: 'save',
        payload: {
          in_selectData: response,
        },
      });
    },

    // ??????????????????
    *in_initiateRat({ payload }, { call, put }) {
      const response = yield call(Analysis.in_initiateRat, payload);
      yield put({
        type: 'save',
        payload: {
          in_initiateRatData: response,
        },
      });
    },

    // ????????????????????????
    *in_rat({ payload }, { call, put }) {
      yield call(Analysis.in_rat, payload);
    },

    // ????????????-?????????
    *in_getRatTask({ payload }, { call, put }) {
      const response = yield call(Analysis.in_getRatTask, payload);
      yield put({
        type: 'save',
        payload: {
          in_getRatTaskData: response,
        },
      });
    },

    // ????????????-????????????
    *in_download({ payload }, { call, put }) {
      yield call(Analysis.in_download, payload);
    },

    // ????????????-?????????-???????????????
    *in_upload({ payload, name }, { call, put }) {
      yield call(Analysis.in_upload, payload, name);
    },

    // ????????????-??????????????????
    *in_log({ payload }, { call, put }) {
      const response = yield call(Analysis.in_log, payload);
      yield put({
        type: 'save',
        payload: {
          in_logData: response,
        },
      });
    },

    // ????????????-????????????
    *in_score({ payload }, { call, put }) {
      const response = yield call(Analysis.in_score, payload);
      yield put({
        type: 'save',
        payload: {
          in_scoreData: response,
        },
      });
    },

    // ????????????-??????
    *in_revoke({ payload }, { call, put }) {
      yield call(Analysis.in_revoke, payload);
    },

    // ????????????-????????????
    *in_scoreCal({ payload, url }, { call, put }) {
      yield call(Analysis.in_scoreCal, payload, url);
    },

    // ????????????-??????
    *in_hisQuery({ payload }, { call, put }) {
      const response = yield call(Analysis.in_hisQuery, payload);
      yield put({
        type: 'save',
        payload: {
          in_hisQueryData: response,
        },
      });
    },

    // ????????????-??????
    *in_historyExport({ payload, url }, { call, put }) {
      yield call(Analysis.in_historyExport, payload, url);
    },

    // ---------------------------------------------------  ????????????  -------------------------------------------------

    // ?????????????????????????????????
    *getDefaultPlanUnit({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getDefaultPlanUnit, payload);
      yield put({
        type: 'save',
        payload: {
          getDefaultPlanUnitData: response,
        },
      });
    },

    // ??????????????????
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

    // ????????????
    *getEffectPlanContent({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getEffectPlanContent, payload);
      yield put({
        type: 'save',
        payload: {
          getEffectPlanContentData: response,
        },
      });
    },

    // ??????????????????
    *getPlanBusUnit({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getPlanBusUnit, payload);
      yield put({
        type: 'save',
        payload: {
          getPlanBusUnitData: response,
        },
      });
    },

    // ???????????????
    *getmonidata({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getmonidata, payload);
      yield put({
        type: 'save',
        payload: {
          getmonidataData: response,
        },
      });
    },

    // ????????????
    *getTrackdata({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getTrackdata, payload);
      yield put({
        type: 'save',
        payload: {
          getTrackdataData: response,
        },
      });
    },

    // ---------------------------------------------------  ????????????-????????????  -------------------------------------------------

    // ??????????????????
    *getAlertEffectPlan({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getAlertEffectPlan, payload);
      yield put({
        type: 'save',
        payload: {
          getAlertEffectPlanData: response,
        },
      });
    },

    // ????????????
    *getAlertMeasureContent({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getAlertMeasureContent, payload);
      yield put({
        type: 'save',
        payload: {
          getAlertMeasureContentData: response,
        },
      });
    },

    // ??????
    *addAlert({ payload, url }, { call, put }) {
      yield call(Analysis.addAlert, payload);
    },

    // ????????????
    *updateAlert({ payload, url }, { call, put }) {
      yield call(Analysis.updateAlert, payload);
    },

    // ??????
    *deleteAlert({ payload, url }, { call, put }) {
      yield call(Analysis.deleteAlert, payload);
    },

    // ??????????????????
    *selectAlert({ payload, url }, { call, put }) {
      const response = yield call(Analysis.selectAlert, payload);
      yield put({
        type: 'save',
        payload: {
          selectAlertData: response,
        },
      });
    },

    // ---------------------------------------------------  ????????????-????????????  -------------------------------------------------

    // ????????????
    *getAlertResult({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getAlertResult, payload);
      yield put({
        type: 'save',
        payload: {
          getAlertResultData: response,
        },
      });
    },

    // ------------------------------------------------ ????????????-?????????????????? ------------------------------------------------

    // ????????????
    *getThemeSelect({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getThemeSelect, payload);
      yield put({
        type: 'save',
        payload: {
          getThemeSelectData: response,
        },
      });
    },

    // ????????????
    *getUserMeasures({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getUserMeasures, payload);
      yield put({
        type: 'save',
        payload: {
          getUserMeasuresData: response,
        },
      });
    },

    // ??????????????????-??????
    *getUserFilter({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getUserFilter, payload);
      yield put({
        type: 'save',
        payload: {
          getUserFilterData: response,
        },
      });
    },

    // ????????????????????????
    *getUserCompany({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getUserCompany, payload);
      yield put({
        type: 'save',
        payload: {
          getUserCompany: response,
        },
      });
    },

    // ????????????????????????
    *componentCopy({ payload, url }, { call, put }) {
      yield call(Analysis.componentCopy, payload);
    },

    // ??????????????????-????????????
    *getUserFilterDim({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getUserFilterDim, payload);
      yield put({
        type: 'save',
        payload: {
          getUserFilterDimData: response,
        }
      });
    },

    // ??????
    *saveAlarmInfo({ payload, url }, { call, put }) {
      yield call(Analysis.saveAlarmInfo, payload);
    },

    // ------------------------------------------------ ????????????-????????? ------------------------------------------------

    // ??????????????????
    *qAlarmInfoList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qAlarmInfoList, payload);
      yield put({
        type: 'save',
        payload: {
          qAlarmInfoListData: response,
        },
      });
    },

    // ?????????????????????
    *qAlarmInfo({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qAlarmInfo, payload);
      yield put({
        type: 'save',
        payload: {
          qAlarmInfoData: response,
        },
      });
    },

    // ???????????????
    *updAlarmInfo({ payload, url }, { call, put }) {
      yield call(Analysis.updAlarmInfo, payload);
    },

    // ??????
    *delAlarmInfo({ payload, url }, { call, put }) {
      yield call(Analysis.delAlarmInfo, payload);
    },

    // ------------------------------------------------ ??????/???????????? ------------------------------------------------

    // ????????????
    *qCardTypeList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCardTypeList, payload);
      yield put({
        type: 'save',
        payload: {
          qCardTypeListData: response,
        },
      });
    },

    // ????????????
    *getDimValue({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getDimValue, payload);
      yield put({
        type: 'save',
        payload: {
          getDimValueData: response,
        },
      });
    },

    // ??????X???????????????????????????
    *getDimLevel({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getDimLevel, payload);
      yield put({
        type: 'save',
        payload: {
          getDimLevelData: response,
        },
      });
    },

    // ??????
    *saveCardAssem({ payload, url }, { call, put }) {
      yield call(Analysis.saveCardAssem, payload);
    },

    // ??????
    *updCardAssem({ payload, url }, { call, put }) {
      yield call(Analysis.updCardAssem, payload);
    },

    // ----------------------------------------------- ????????? -----------------------------------------------------------

    // ??????
    *qCardAssemList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCardAssemList, payload);
      yield put({
        type: 'save',
        payload: {
          qCardAssemListData: response,
        },
      });
    },

    // ??????
    *delCardAssem({ payload, url }, { call, put }) {
      yield call(Analysis.delCardAssem, payload);
    },

    // ??????
    *qCardAssemInfo({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCardAssemInfo, payload);
      yield put({
        type: 'save',
        payload: {
          qCardAssemInfoData: response,
        },
      });
    },

    // ----------------------------------------------- ???????????? -----------------------------------------------------------

    // ??????
    *saveResource({ payload, url }, { call, put }) {
      yield call(Analysis.saveResource, payload);
    },

    // ??????
    *updResource({ payload, url }, { call, put }) {
      yield call(Analysis.updResource, payload);
    },

    // ??????
    *qResourceList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qResourceList, payload);
      yield put({
        type: 'save',
        payload: {
          qResourceListData: response,
        },
      });
    },

    // ??????
    *qResourceInfoById({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qResourceInfoById, payload);
      yield put({
        type: 'save',
        payload: {
          qResourceInfoByIdData: response,
        },
      });
    },

    // ----------------------------------------------- ???????????? -----------------------------------------------------------

    // ??????
    *qPubUserList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qPubUserList, payload);
      yield put({
        type: 'save',
        payload: {
          qPubUserListData: response,
        },
      });
    },

    // ??????????????????
    *qCompanyLeveInfo({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCompanyLeveInfo, payload);
      yield put({
        type: 'save',
        payload: {
          qCompanyLeveInfoData: response,
        },
      });
    },

    // ????????????
    *qRole({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qRole, payload);
      yield put({
        type: 'save',
        payload: {
          qRoleData: response,
        },
      });
    },

    // ????????????
    *updUserRoleList({ payload, url }, { call, put }) {
      yield call(Analysis.updUserRoleList, payload);
    },

    // ????????????
    *addCompanyRole({ payload, url }, { call, put }) {
      yield call(Analysis.addCompanyRole, payload);
    },

    // ----------------------------------------------- ???????????? -----------------------------------------------------------

    // ??????????????????
    *qPermi({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qPermi, payload);
      yield put({
        type: 'save',
        payload: {
          qPermiData: response,
        },
      });
    },

    // ????????????
    *saveRoleInfo({ payload, url }, { call, put }) {
      yield call(Analysis.saveRoleInfo, payload);
    },

    // ????????????
    *delRoleInfo({ payload, url }, { call, put }) {
      yield call(Analysis.delRoleInfo, payload);
    },

    // ????????????
    *updRoleInfo({ payload, url }, { call, put }) {
      yield call(Analysis.updRoleInfo, payload);
    },

    // ??????????????????????????????
    *qRoleInfoLis({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qRoleInfoLis, payload);
      yield put({
        type: 'save',
        payload: {
          qRoleInfoLisData: response,
        },
      });
    },

    // ??????????????????????????????
    *qRoleInfoById({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qRoleInfoById, payload);
      yield put({
        type: 'save',
        payload: {
          qRoleInfoByIdData: response,
        },
      });
    },

    // ----------------------------------------------- ???????????? -----------------------------------------------------------

    // ??????????????????
    *qResource({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qResource, payload);
      yield put({
        type: 'save',
        payload: {
          qResourceData: response,
        },
      });
    },

    // ??????????????????????????????
    *qPermissionInfoById({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qPermissionInfoById, payload);
      yield put({
        type: 'save',
        payload: {
          qPermissionInfoByIdData: response,
        },
      });
    },

    // ??????????????????????????????
    *qPermissionList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qPermissionList, payload);
      yield put({
        type: 'save',
        payload: {
          qPermissionListData: response,
        },
      });
    },

    // ????????????
    *savePermission({ payload, url }, { call, put }) {
      yield call(Analysis.savePermission, payload);
    },

    // ????????????
    *updatePermission({ payload, url }, { call, put }) {
      yield call(Analysis.updatePermission, payload);
    },

    // ????????????
    *deletePermission({ payload, url }, { call, put }) {
      yield call(Analysis.deletePermission, payload);
    },

    // -------------------------------------------------  ????????????  -----------------------------------------

    // ??????????????????
    *createGraph({ payload, url }, { call, put }) {
      const response = yield call(Analysis.createGraph, payload);
      yield put({
        type: 'save',
        payload: {
          graphChartId: response.id,
        },
      });
    },

    // ???????????????????????????
    *queryGraph({ payload, url }, { call, put }) {
      const response = yield call(Analysis.queryGraph, payload);
      yield put({
        type: 'save',
        payload: {
          queryGraphData: response,
        },
      });
    },

    // ???????????????????????????
    *delGraph({ payload, url }, { call, put }) {
      yield call(Analysis.delGraph, payload);
    },

    // ??????????????????
    *updateGraph({ payload, url }, { call, put }) {
      const response = yield call(Analysis.updateGraph, payload);
      yield put({
        type: 'save',
        payload: {
          graphChartId: response.id,
        },
      });
    },

    // ???????????????????????????
    *graphPreview({ payload, url }, { call, put }) {
      const response = yield call(Analysis.graphPreview, payload);
      yield put({
        type: 'save',
        payload: {
          graphPreviewData: response,
        },
      });
    },

    // ?????????????????????????????????
    *queryUser({ payload, url }, { call, put }) {
      const response = yield call(Analysis.queryUser, payload);
      yield put({
        type: 'save',
        payload: {
          queryUserData: response,
        },
      });
    },

    // ??????????????????
    *queryMeasureValueType({ payload, url }, { call, put }) {
      const response = yield call(Analysis.queryMeasureValueType, payload);
      yield put({
        type: 'save',
        payload: {
          queryMeasureValueTypeData: response,
        },
      });
    },

    // -----------------------------------------------------  ??????  --------------------------------------------------------------

    // ???????????????
    *savePortalConfig({ payload, url }, { call, put }) {
      yield call(Analysis.savePortalConfig, payload);
    },

    // ???????????????
    *queryPortalList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.queryPortalList, payload);
      yield put({
        type: 'save',
        payload: {
          queryPortalListData: response,
        },
      });
    },

    // ?????????????????????????????????
    *saveGraphRelate({ payload, url }, { call, put }) {
      yield call(Analysis.saveGraphRelate, payload);
    },

    // ????????????????????????????????????
    *qMeasureData({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qMeasureData, payload);
      yield put({
        type: 'save',
        payload: {
          qMeasureDataData: response,
        },
      });
    },

    // ????????????????????????
    *updateSortNum({ payload, url }, { call, put }) {
      yield call(Analysis.updateSortNum, payload);
    },

    // ??????????????????????????????
    *cardQMeasureData({ payload, url }, { call, put }) {
      const response = yield call(Analysis.cardQMeasureData, payload);
      yield put({
        type: 'save',
        payload: {
          cardQMeasureDataData: response,
        },
      });
    },

    // ??????????????????
    *cardDrillDown({ payload, url }, { call, put }) {
      const response = yield call(Analysis.cardDrillDown, payload);
      yield put({
        type: 'save',
        payload: {
          cardDrillDownData: response,
        },
      });
    },

    // ??????????????????
    *chartDrillDown({ payload, url }, { call, put }) {
      const response = yield call(Analysis.chartDrillDown, payload);
      yield put({
        type: 'save',
        payload: {
          chartDrillDownData: response,
        },
      });
    },

    // ???????????????????????????
    *doorAlarmqList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.doorAlarmqList, payload);
      yield put({
        type: 'save',
        payload: {
          doorAlarmqListData: response,
        },
      });
    },

    // ???????????????????????????
    *doorAlarmredis({ payload, url }, { call, put }) {
      yield call(Analysis.doorAlarmredis, payload);
    },

    // ???????????????????????????
    *doorAlarmdeleteRedis({ payload, url }, { call, put }) {
      yield call(Analysis.doorAlarmdeleteRedis, payload);
    },

    // ???????????????????????????
    *graphqList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.graphqList, payload);
      yield put({
        type: 'save',
        payload: {
          graphqListData: response,
        },
      });
    },

    // ???????????????????????????
    *graphredis({ payload, url }, { call, put }) {
      yield call(Analysis.graphredis, payload);
    },

    // ???????????????????????????
    *graphdeleteRedis({ payload, url }, { call, put }) {
      yield call(Analysis.graphdeleteRedis, payload);
    },

    // ???????????????????????????
    *openSave({ payload, url }, { call, put }) {
      yield call(Analysis.openSave, payload);
    },

    // -----------------------------------------------------  ????????????  --------------------------------------------------------------

    // ???????????????????????????
    *portalList({ payload, url }, { call, put }) {
      const response = yield call(Analysis.portalList, payload);
      yield put({
        type: 'save',
        payload: {
          portalListData: response,
        },
      });
    },

    // ????????????
    *copyPortal({ payload, url }, { call, put }) {
      yield call(Analysis.copyPortal, payload);
    },

    // ???????????????????????????
    *getCompany({ payload, url }, { call, put }) {
      const response = yield call(Analysis.getCompany, payload);
      yield put({
        type: 'save',
        payload: {
          getCompany: response,
        },
      });
    },

    // ?????????????????????
    *copyAssemToCompany({ payload, url }, { call, put }) {
      yield call(Analysis.copyAssemToCompany, payload);
    },

    // ?????????????????????
    *copyGraphToCompany({ payload, url }, { call, put }) {
      yield call(Analysis.copyGraphToCompany, payload);
    },

    // ????????????
    *qCopyLog({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qCopyLog, payload);
      yield put({
        type: 'save',
        payload: {
          qCopyLogData: response,
        },
      });
    },

    // ????????????
    *reduPortal({ payload, url }, { call, put }) {
      yield call(Analysis.reduPortal, payload);
    },

    // ??????????????????
    *qSubscribe({ payload, url }, { call, put }) {
      const response = yield call(Analysis.qSubscribe, payload);
      yield put({
        type: 'save',
        payload: {
          qSubscribeData: response
        }
      })
    },

    // ????????????
    *updSubscribe({ payload, url }, { call, put }) {
      yield call(Analysis.updSubscribe, payload);
    },

    // ??????????????????
    *getCompanyLevel({ payload, url }, { call, put }) {
      const request = yield call(Analysis.getCompanyLevel, payload);
      yield put({
        type: 'save',
        payload: {
          getSubCompanyData: request
        }
      })
    },

    // ??????????????????
    *changeCompany({ payload, url }, { call, put }) {
      yield call(Analysis.changeCompany, payload);
    },

    // ????????????????????????
    *getMeasureList({ payload, url }, { call, put }) {
      const request = yield call(Analysis.getMeasureList, payload);
      yield put({
        type: 'save',
        payload: {
          getMeasureListData: request
        }
      })
    },

    // ??????????????????????????????
    *getMeasureDefi({ payload, url }, { call, put }) {
      const request = yield call(Analysis.getMeasureDefi, payload);
      yield put({
        type: 'save',
        payload: {
          getMeasureDefiData: request
        }
      })
    },

    // ??????????????????????????????
    *updMeasureDefi({ payload, url }, { call, put }) {
      yield call(Analysis.updMeasureDefi, payload);
    },

    // ????????????
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