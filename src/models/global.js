import Analysis from '../services/analysis';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    publicMode: false,
    click: true,      // 菜单栏编辑模板显示公共还是个人
    publicModeName: '',
    getUserDictionData: [],
    menuData: [],
    menuDataAll: [],
    getAlertResultBellData: []
  },

  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    changeMode(state, { payload }) {
      return {
        ...state,
        publicMode: payload,
      };
    },
    changeClick(state, { payload }) {
      return {
        ...state,
        click: payload,
      };
    },
    changeModeName(state, { payload }) {
      return {
        ...state,
        publicModeName: payload,
      };
    },
    setMenuData(state, { payload }) {
      return {
        ...state,
        menuData: payload,
      };
    },
    menuData(state, { payload }) {
      return {
        ...state,
        menuDataAll: payload,
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },

  effects: {
    // 获取用户权限
    *getUserDiction({ payload }, { call, put }) {
      const response = yield call(Analysis.getUserDiction, payload);
      yield put({
        type: 'save',
        payload: {
          getUserDictionData: response,
        },
      });
    },

    // 界面顶部铃铛--获取预警信息
    *getAlertResultBell({ payload }, { call, put }) {
      const response = yield call(Analysis.getAlertResultBell, payload);
      yield put({
        type: 'save',
        payload: {
          getAlertResultBellData: response,
        },
      });
    },
  }
};
