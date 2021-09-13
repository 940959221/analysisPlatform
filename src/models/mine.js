import { message } from 'snk-web';
import Analysis from '../services/analysis';

export default {
  namespace: 'mine',
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
    getFilterTimeData: {},
    analysisApplicaData: {},
    analysisThemeData: {},
    analysisMeasuresData: {},
    analysisDimensionsData: {},
    analysisFilterDimensionsData: {},
    getCommalyData: {},
    getTimePeriodData: {},
    findAllGroupData: {},
    getTableByGroupData: {},
    findAllGroupByNameData: {},
    getAllColumnsByTablePageData: {},
    findAllGroupByPageData: {},
    getAllGroupNotInByPageData: {},
    getTargetTablesData: [],
    getCommAutoalyData: [],
    alarmspeGetThemeData: [],
    alarmspeGetApplication: [],
    getanalyData: [],
    payanalyData: [],
    getUserDictionData: [],
    getThemeSelectData: [],
    getUserMeasuresData: [],

  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
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

    // ---------------------------------------监控管理模块-------------------------------------------------

    // 监控创建--获取应用
    *getApplication({ payload }, { call, put }) {
      const response = yield call(Analysis.getApplication, payload);
      yield put({
        type: 'save',
        payload: {
          getApplicationData: response,
        },
      });
    },

    // 监控创建--获取主题
    *getTheme({ payload }, { call, put }) {
      const response = yield call(Analysis.getTheme, payload);
      yield put({
        type: 'save',
        payload: {
          getThemeData: response,
        },
      });
    },

    // 监控创建--获取主题下指标
    *getMeasures({ payload }, { call, put }) {
      const response = yield call(Analysis.getMeasures, payload);
      yield put({
        type: 'save',
        payload: {
          measure: response,
        },
      });
    },

    // 监控创建--获取指标下维度
    *getDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.getDimensions, payload);
      yield put({
        type: 'save',
        payload: {
          getDimensions: response,
        },
      });
    },

    // 监控创建--获取过滤维度
    *getFilterDimensions({ payload }, { call, put }) {
      const response = yield call(Analysis.getFilterDimensions, payload);
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

    // ---------------------------------------告警统计-------------------------------------------------
    *getresult({ payload }, { call, put }) {
      const response = yield call(Analysis.getresult, payload);
      yield put({
        type: 'save',
        payload: {
          getresultData: response,
        },
      });
    },

    // 获取用户常用分析
    *getCommaly({ payload }, { call, put }) {
      const response = yield call(Analysis.getCommaly, payload);
      yield put({
        type: 'save',
        payload: {
          getCommalyData: response,
        },
      });
    },

    // 删除用户常用分析
    *delCommaly({ payload }, { call }) {
      const response = yield call(Analysis.delCommaly, payload);
      message.success('操作成功');
    },

    // 进入群组界面
    *findAllGroupByPage({ payload }, { call, put }) {
      const response = yield call(Analysis.findAllGroupByPage, payload);
      yield put({
        type: 'save',
        payload: {
          findAllGroupData: response,
        },
      });
    },

    // 添加表
    *getTableByGroup({ payload }, { call, put }) {
      const response = yield call(Analysis.getTableByGroup, payload);
      yield put({
        type: 'save',
        payload: {
          getTableByGroupData: response,
        },
      });
    },

    // 群组界面修改
    *getGroupById({ payload }, { call }) {
      yield call(Analysis.getGroupById, payload);
    },

    // 群组界面删除
    *deleteGroup({ payload }, { call }) {
      yield call(Analysis.deleteGroup, payload);
    },

    // 添加群组
    *addGroup({ payload }, { call }) {
      yield call(Analysis.addGroup, payload);
      message.success('添加成功');
    },

    // 修改群组
    *updateGroup({ payload }, { call }) {
      yield call(Analysis.updateGroup, payload);
      message.success('操作成功');
    },

    // 通过名字分页查询组
    *findAllGroupByNamePage({ payload }, { call, put }) {
      const response = yield call(Analysis.findAllGroupByNamePage, payload);
      yield put({
        type: 'save',
        payload: {
          findAllGroupData: response.list,
        },
      });
    },

    // getAllGroupNotInByPage
    *getAllGroupNotInByPage({ payload }, { call, put }) {
      const response = yield call(Analysis.getAllGroupNotInByPage, payload);
      yield put({
        type: 'save',
        payload: {
          getAllGroupNotInByPageData: response,
        },
      });
    },

    // 取消用户授权
    *deleteUserGroup({ payload }, { call }) {
      yield call(Analysis.deleteUserGroup, payload);
      message.success('操作成功');
    },

    // 用户列表用户授权
    *getGroupByUser({ payload }, { call, put }) {
      const response = yield call(Analysis.getGroupByUser, payload);
      yield put({
        type: 'save',
        payload: {
          findAllGroupData: response,
        },
      });
    },

    // 用户列确定添加
    *addTableGroup({ payload }, { call }) {
      yield call(Analysis.addTableGroup, payload);
      message.success('操作成功');
    },

    // 用户列表点击表数据
    *getAllColumnsByTablePage({ payload }, { call, put }) {
      const response = yield call(Analysis.getAllColumnsByTablePage, payload);
      yield put({
        type: 'save',
        payload: {
          getAllColumnsByTablePageData: response,
        },
      });
    },

    // 用户授权
    *addUserGroup({ payload }, { call }) {
      yield call(Analysis.addUserGroup, payload);
      message.success('操作成功');
    },

    // 数据导入
    *uploadFile({ payload }, { call }) {
      yield call(Analysis.uploadFile, payload);
      message.success('上传成功');
    },

    *getTargetTables({ payload }, { call, put }) {
      const response = yield call(Analysis.getTargetTables, payload);
      yield put({
        type: 'save',
        payload: {
          getTargetTablesData: response,
        },
      });
    },

    // 删除分析记录
    *delCommAutoAnaly({ payload }, { call }) {
      const response = yield call(Analysis.delCommAutoAnaly, payload);
      if (response.code === 0) {
        message.success(response.message);
      }
    },

    // 查看用户常用分析列表
    *getCommAutoaly({ payload }, { call, put }) {
      const response = yield call(Analysis.getCommAutoaly, payload);
      yield put({
        type: 'save',
        payload: {
          getCommAutoalyData: response,
        },
      });
    },

    // 特殊告警创建、删除、修改、查看
    *alarmspeProduct({ payload }, { call, put }) {
      const response = yield call(Analysis.alarmspeProduct, payload);
      if (payload.operateType === 'r') {
        yield put({
          type: 'save',
          payload: {
            searchData: response,
          },
        });
      } else if (payload.operateType === 'c') {
        message.success('操作成功');
      } else if (payload.operateType === 'u') {
        message.success('修改成功');
      } else {
        message.success('删除成功');
      }
    },

    *alarmspeGetTheme({ payload }, { call, put }) {
      const response = yield call(Analysis.alarmspeGetTheme, payload);
      yield put({
        type: 'save',
        payload: {
          alarmspeGetThemeData: response,
        },
      });
    },

    *getAlarmspeApplication({ payload }, { call, put }) {
      const response = yield call(Analysis.getAlarmspeApplication, payload);
      yield put({
        type: 'save',
        payload: {
          alarmspeGetApplication: response,
        },
      });
    },

    // 个人工作台归因分析获取数据
    *getanaly({ payload }, { call, put }) {
      const response = yield call(Analysis.getanaly, payload);
      yield put({
        type: 'save',
        payload: {
          getanalyData: response,
        },
      });
    },

    // 个人工作台归因分析删除数据
    *delanaly({ payload }, { call, put }) {
      yield call(Analysis.delanaly, payload);
    },
    
    // 个人工作台赔付预测获取数据
    *payanaly({ payload }, { call, put }) {
      const response = yield call(Analysis.payanalyData, payload);
      yield put({
        type: 'save',
        payload: {
          payanalyData: response,
        },
      });
    },

    // 个人工作台赔付预测删除数据
    *paydelanaly({ payload }, { call, put }) {
      yield call(Analysis.paydelanaly, payload);
    },
  },
};

