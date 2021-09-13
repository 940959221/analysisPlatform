import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'snk-web';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import { run } from 'snk-sso-um';
import styles from './index.less';

const { ConnectedRouter } = routerRedux;
dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

const menuData = [
  {
    name: '个人设置',
    icon: 'user',
    path: 'getresult',
    children: [
      {
        name: '告警管理',
        icon: 'bell',
        path: 'monitoring',
        children: [{
          name: '告警查询',
          path: 'query',
        },
        {
          name: '告警创建',
          path: 'create',
        },
        {
          name: '对比告警创建',
          path: 'specialcreate',
        },
        ],
      },
      {
        name: '个人工作台',
        path: 'getresult',
      },
      {
        name: '公共模板管理',
        path: 'publicMode',
      },
      {
        name: '数据导入',
        path: 'upload',
      },
    ],
  },
  {
    name: '门户跟踪',
    icon: 'bar-chart',
    path: 'datador',
    children: [
      {
        name: '默认门户',
        path: 'defaultdor',
      },
      {
        name: '个人门户',
        path: 'userdor',
      },
    ],
  },
  {
    name: '业务门户',
    icon: 'bar-chart',
    path: 'analysisdor',
    children: [
      {
        name: '评分技术运用',
        path: 'score',
        children: [
          {
            name: '新车系分类(非营业客车合计)',
            path: 'newCarCount',
          },
          {
            name: '新车系分类(家自车)',
            path: 'newCarOwn',
          },
          {
            name: '新车系分类(非营业机关企业客车)',
            path: 'newCarBisness',
          },
          {
            name: '货车评分',
            path: 'trucks',
          },
          {
            name: '保信分(营业货车)',
            path: 'creditTrucks',
          },
          {
            name: '保信分(家自车)',
            path: 'creditOwn',
          },
          {
            name: '保信分(非营业货车)',
            path: 'creditBisness',
          },
          {
            name: '保信分(车种合计)',
            path: 'creditCount',
          },
        ]
      },
      {
        name: '自核监管',
        path: 'nuclear',
        children: [
          {
            name: '自核监控',
            path: 'nuclear',
          },
          {
            name: '报价规则分析',
            path: 'rulers',
          },
        ]
      },
      {
        name: '高风险业务监控',
        path: 'highRisk',
        children: [
          {
            name: '重点关注业务',
            path: 'important',
          },
          {
            name: '待观察业务',
            path: 'observe',
          },
        ]
      },
      {
        name: '业务分析',
        path: 'analysis',
        children: [
          {
            name: '机构分析',
            path: 'businessAnalysis',
          },
          {
            name: '整体分析',
            path: 'countAnalysis',
          },
        ]
      },
      {
        name: '车型分析',
        path: 'cardor',
        children: [
          {
            name: '非营业货车',
            path: 'trucks'
          },
          {
            name: '非营业客车(不含家用车)',
            path: 'coach'
          },
          {
            name: '公路客运及城市公交',
            path: 'highway'
          },
          {
            name: '过户车',
            path: 'assigned'
          },
          {
            name: '家用车',
            path: 'household'
          },
          {
            name: '特种车',
            path: 'sonder'
          },
          {
            name: '网约车',
            path: 'internet'
          },
          {
            name: '新能源',
            path: 'newEnergy'
          },
          {
            name: '异地车',
            path: 'remote'
          },
          {
            name: '营业出租租赁',
            path: 'businessRent'
          },
          {
            name: '营业货车',
            path: 'businessTrucks'
          },
        ]
      },
      {
        name: '监控分析',
        path: 'monitoring',
        children: [
          {
            name: '业务品质监控',
            path: 'quality'
          },
          {
            name: '业务结构监控',
            path: 'construction'
          },
          {
            name: '赔案流量监控',
            path: 'flow'
          },
          {
            name: '每日线上化监控',
            path: 'onLine'
          },
          {
            name: '每日赔付率监控',
            path: 'compensate'
          },
          {
            name: '每日保费监控',
            path: 'premium'
          },
          {
            name: '每日签单净保费监控',
            path: 'written'
          },
        ]
      },
      {
        name: '行业风险地图',
        path: 'industry',
      },
      {
        name: '费用监控',
        path: 'cost',
      },
    ],
  },
  {
    name: '多维分析',
    icon: 'line-chart',
    path: 'dimension',
    children: [
      {
        name: '综改监控',
        path: 'query',
        children: [
          {
            name: '业务类(保险起期)',
            path: 'supervise-business', // /pcm-testTheme 测试,  supervise-business 正式
          },
          {
            name: '业务类(承保确认时间)',
            path: 'supervise-businessudr', // /pcm-businessudr 测试,  supervise-businessudr 正式
          },
          {
            name: '财务类',
            path: 'supervise-finance',
          },
          {
            name: '监管报表(签单口径)',
            path: 'supervise-cartype_bill',
          },
          {
            name: '监管报表(起保口径)',
            path: 'supervise-cartype_bartender',
          },
          {
            name: '趋势监控',
            path: 'supervise-trend',
          },
        ],
      },
      {
        name: '车险品质',
        path: 'cxpz',
        children: [
          {
            name: '理赔管理',
            path: 'cxpz-clm',
          },
          {
            name: '历年制赔付率',
            path: 'cxpz-linian',
          },
          {
            name: '满期赔付率',
            path: 'cxpz-expayrate',
          },
          {
            name: '承保管理',
            path: 'cxpz-nbz',
          },
          {
            name: '保费类',
            path: 'cxpz-prm',
          },
          {
            name: '业务结构',
            path: 'cxpz-busistructure',
          },
        ],
      },
      {
        name: '自动核保应用',
        path: 'zhjkquery',
        children: [
          {
            name: '自核指标(保险起期)',
            path: 'zhjk-zhindex', // /zhjk-testTheme 测试,  zhjk-zhindex 正式
          },
          {
            name: '自核指标(核保时间)',
            path: 'zhjk-zhindexudr',
          },
        ],
      },
    ],
  },
  {
    name: '清单查询',
    icon: 'dot-chart',
    path: 'queryanalysis',
  },
  {
    name: '赔付预测',
    icon: 'bar-chart',
    path: 'paypredict',
  },
  {
    name: '编辑公共默认模板',           // 这个模块是隐藏的，目的在于UM系统给用户配置，如果配置了，则菜单栏显示编辑的按钮，没有实际意义
    icon: 'bar-chart',
    path: 'public',
  },
  {
    name: '展业地图',
    icon: 'global',
    path: 'businessmap',
    children: [
      {
        name: '展业跟踪',
        path: 'mapTrack',
        children: [
          {
            name: '展业追踪',
            path: 'mapTracking'
          },
          {
            name: '预警详情',
            path: 'warnDetails'
          },
          {
            name: '预警通知',
            path: 'warnNotice'
          },
        ]
      },
      {
        name: '模型创建',
        path: 'mapcreate',
      },
      {
        name: '模型管理',
        path: 'mapquery',
      }, {
        name: '方案管理',
        path: 'planquery',
      },
      {
        name: '汇总方案',
        path: 'summaryplan',
      },
    ],
  },
  {
    name: '系统管理',
    icon: 'edit',
    path: 'userconfig',
    children: [{
      name: '用户列表管理',
      path: 'userlist',
    },
    {
      name: '用户群组管理',
      path: 'grouplist',
    }, {
      name: '预警指标库管理',
      path: 'warning',
      children: [{
        name: '指标库',
        path: 'measure'
      }, {
        name: '新建/编辑预警指标',
        path: 'creatMeasure'
      }]
    }, {
      name: '组件管理',
      path: 'component',
      children: [{
        name: '组件库',
        path: 'components',
      }, {
        name: '新建/编辑组件',
        path: 'creatComponents'
      }]
    }, {
      name: '用户管理',
      path: 'usermanage',
      children: [{
        name: '用户管理',
        path: 'usermanages',
      }]
    }, {
      name: '角色管理',
      path: 'rolemanage',
      children: [{
        name: '角色管理',
        path: 'rolemanages',
      }, {
        name: '新建角色',
        path: 'creatRolemanages'
      }]
    }, {
      name: '权限管理',
      path: 'permission',
      children: [{
        name: '权限管理',
        path: 'permissions',
      }, {
        name: '新建权限',
        path: 'creatPermissions'
      }]
    }, {
      name: '资源管理',
      path: 'resource',
      children: [{
        name: '资源管理',
        path: 'resources',
      }, {
        name: '新建资源',
        path: 'creatResources'
      }]
    }, {
      name: '敏感指标管理',
      path: 'sensitivemanage',
      children: [{
        name: '敏感指标管理',
        path: 'sensitivemanages',
      }, {
        name: '新建敏感指标',
        path: 'creatSensitivemanages'
      }]
    }, {
      name: '自定义分组管理',
      path: 'custommanage',
      children: [{
        name: '自定义分组管理',
        path: 'custommanages',
      }, {
        name: '新建自定义分组',
        path: 'creatCustommanages'
      }]
    }, {
      name: '邮件订阅',
      path: 'subscribe'
    }, {
      name: '数据字典',
      path: 'dictionary'
    }, {
      name: '门户功能',
      path: 'dorFunction',
      children: [{
        name: '门户复制',
        path: 'copy',
      }, {
        name: '门户还原',
        path: 'reduction'
      }, {
        name: '门户还原订阅',
        path: 'reductionSub'
      }]
    }],
  },
  {
    name: '归因分析',
    icon: 'dot-chart',
    path: 'reasonanalysis',
    children: [
      {
        name: '满期赔付率-业务分析',
        path: 'expayrate-business',
        children: [{
          name: '业务分析',
          path: 'business-analysis'
        }, {
          name: '结果查看',
          path: 'query-result'
        }]
      },
      {
        name: '满期赔付率-赔案流量分析',
        path: 'expayrate-claim',
      },
      {
        name: '历年制赔付率-赔案流量分析',
        path: 'historypayrate-claim',
      }
    ],
  },
  {
    name: '行业数据',
    icon: 'bar-chart',
    path: 'industrydata',
    children: [{
      name: '分主体及分业务类型(起保口径)',
      path: 'businesstype_body',
    }, {
      name: '分三级机构',
      path: 'business_organ',
    }]
  },
  {
    name: '机构分析',
    icon: 'stock',
    path: 'institutional',
    children: [{
      name: '发起评级',
      path: 'rating',
      // children: [{
      //   name: '发起评级',
      //   path: 'rate',
      // }, {
      //   name: '确认发起评级',
      //   path: 'such',
      // }]
    }, {
      name: '数据上传',
      path: 'upload',
      children: [{
        name: '分公司评级',
        path: 'branchOffice',
      }, {
        name: '三级机构评级',
        path: 'mechanism',
      }]
    }, {
      name: '数据分析',
      path: 'score',
      children: [{
        name: '分公司评级',
        path: 'branchOffice',
      }, {
        name: '三级机构评级',
        path: 'mechanism',
      }]
    }, {
      name: '评级结果',
      path: 'history',
    }, {
      name: '机构地图',
      path: 'map',
    }]
  }, {
    name: '操作手册',
    icon: 'edit',
    path: 'operationManual',
  }
];

const router = {
  // '/_ces': {      // 配置特殊路由，不受菜单管控，单页应用
  //   component: () => import('./routes/Aces'), model: ['analysis'], permission: 'all', // permission: 'all' 隐藏菜单
  // },
  '/': {
    component: () => import('./layouts/BasicLayout'), model: [],
  },
  '/getresult/monitoring/create': {
    component: () => import('./routes/Monitoring/Create'), model: ['mine'],
  },
  '/getresult/monitoring/specialcreate': {
    component: () => import('./routes/Monitoring/SpecialCreate'), model: ['mine'],
  },
  '/getresult/monitoring/query': {
    component: () => import('./routes/Monitoring/Query'), model: ['mine'],
  },
  '/getresult/getresult': {
    component: () => import('./routes/GetResult/GetResult'), model: ['mine'],
  },
  '/getresult/upload': {
    component: () => import('./routes/GetResult/UploadFile'), model: ['mine'],
  },
  '/getresult/publicMode': {
    component: () => import('./routes/GetResult/PublicMode'), model: ['analysis'],
  },
  '/datador/defaultdor': {
    component: () => import('./routes/Datador/Defaultdor'), model: ['analysis'],
  },
  '/datador/userdor': {
    component: () => import('./routes/Datador/Userdor'), model: ['analysis'],
  },
  '/analysisdor/score/newCarCount': {
    component: () => import('./routes/Analysisdor/Score/NewCarCount'), model: ['analysis'],
  },
  '/analysisdor/score/newCarOwn': {
    component: () => import('./routes/Analysisdor/Score/NewCarOwn'), model: ['analysis'],
  },
  '/analysisdor/score/newCarBisness': {
    component: () => import('./routes/Analysisdor/Score/NewCarBisness'), model: ['analysis'],
  },
  '/analysisdor/score/trucks': {
    component: () => import('./routes/Analysisdor/Score/Trucks'), model: ['analysis'],
  },
  '/analysisdor/score/creditTrucks': {
    component: () => import('./routes/Analysisdor/Score/CreditTrucks'), model: ['analysis'],
  },
  '/analysisdor/score/creditOwn': {
    component: () => import('./routes/Analysisdor/Score/CreditOwn'), model: ['analysis'],
  },
  '/analysisdor/score/creditBisness': {
    component: () => import('./routes/Analysisdor/Score/CreditBisness'), model: ['analysis'],
  },
  '/analysisdor/score/creditCount': {
    component: () => import('./routes/Analysisdor/Score/CreditCount'), model: ['analysis'],
  },
  '/analysisdor/nuclear/nuclear': {
    component: () => import('./routes/Analysisdor/Nuclear/Nuclear'), model: ['analysis'],
  },
  '/analysisdor/nuclear/rulers': {
    component: () => import('./routes/Analysisdor/Nuclear/Rulers'), model: ['analysis'],
  },
  '/analysisdor/highRisk/important': {
    component: () => import('./routes/Analysisdor/HighRisk/Important'), model: ['analysis'],
  },
  '/analysisdor/highRisk/observe': {
    component: () => import('./routes/Analysisdor/HighRisk/Observe'), model: ['analysis'],
  },
  '/analysisdor/analysis/businessAnalysis': {
    component: () => import('./routes/Analysisdor/Analysis/BusinessAnalysis'), model: ['analysis'],
  },
  '/analysisdor/analysis/countAnalysis': {
    component: () => import('./routes/Analysisdor/Analysis/CountAnalysis'), model: ['analysis'],
  },
  '/analysisdor/industry': {
    component: () => import('./routes/Analysisdor/Industry'), model: ['analysis'],
  },
  '/analysisdor/monitoring/premium': {
    component: () => import('./routes/Analysisdor/Monitoring/Premium'), model: ['analysis'],
  },
  '/analysisdor/monitoring/written': {
    component: () => import('./routes/Analysisdor/Monitoring/Written'), model: ['analysis'],
  },
  '/analysisdor/monitoring/quality': {
    component: () => import('./routes/Analysisdor/Monitoring/Quality'), model: ['analysis'],
  },
  '/analysisdor/monitoring/compensate': {
    component: () => import('./routes/Analysisdor/Monitoring/Compensate'), model: ['analysis'],
  },
  '/analysisdor/monitoring/construction': {
    component: () => import('./routes/Analysisdor/Monitoring/Construction'), model: ['analysis'],
  },
  '/analysisdor/monitoring/flow': {
    component: () => import('./routes/Analysisdor/Monitoring/Flow'), model: ['analysis'],
  },
  '/analysisdor/monitoring/onLine': {
    component: () => import('./routes/Analysisdor/Monitoring/OnLine'), model: ['analysis'],
  },
  '/analysisdor/cardor/trucks': {
    component: () => import('./routes/Analysisdor/Cardor/Trucks'), model: ['analysis'],
  },
  '/analysisdor/cardor/coach': {
    component: () => import('./routes/Analysisdor/Cardor/Coach'), model: ['analysis'],
  },
  '/analysisdor/cardor/highway': {
    component: () => import('./routes/Analysisdor/Cardor/Highway'), model: ['analysis'],
  },
  '/analysisdor/cardor/assigned': {
    component: () => import('./routes/Analysisdor/Cardor/Assigned'), model: ['analysis'],
  },
  '/analysisdor/cardor/household': {
    component: () => import('./routes/Analysisdor/Cardor/Household'), model: ['analysis'],
  },
  '/analysisdor/cardor/sonder': {
    component: () => import('./routes/Analysisdor/Cardor/Sonder'), model: ['analysis'],
  },
  '/analysisdor/cardor/internet': {
    component: () => import('./routes/Analysisdor/Cardor/Internet'), model: ['analysis'],
  },
  '/analysisdor/cardor/newEnergy': {
    component: () => import('./routes/Analysisdor/Cardor/NewEnergy'), model: ['analysis'],
  },
  '/analysisdor/cardor/remote': {
    component: () => import('./routes/Analysisdor/Cardor/Remote'), model: ['analysis'],
  },
  '/analysisdor/cardor/businessRent': {
    component: () => import('./routes/Analysisdor/Cardor/BusinessRent'), model: ['analysis'],
  },
  '/analysisdor/cardor/businessTrucks': {
    component: () => import('./routes/Analysisdor/Cardor/BusinessTrucks'), model: ['analysis'],
  },
  '/analysisdor/cost': {
    component: () => import('./routes/Analysisdor/Cost'), model: ['analysis'],
  },
  '/userconfig/userlist': {
    component: () => import('./routes/UserConfig/UserList'), model: ['mine'],
  },
  '/userconfig/grouplist': {
    component: () => import('./routes/UserConfig/GroupList'), model: ['mine'],
  },
  '/userconfig/actionRedis': {
    component: () => import('./routes/UserConfig/Actions/ActionRedis'), model: ['analysis'], permission: 'all', // permission: 'all' 隐藏菜单
  },
  '/userconfig/warning/measure': {
    component: () => import('./routes/UserConfig/Warning/Measure'), model: ['analysis'],
  },
  '/userconfig/warning/creatMeasure': {
    component: () => import('./routes/UserConfig/Warning/CreatMeasure'), model: ['analysis'],
  },
  '/userconfig/component/components': {
    component: () => import('./routes/UserConfig/Component/Components'), model: ['analysis'],
  },
  '/userconfig/component/creatComponents': {
    component: () => import('./routes/UserConfig/Component/CreatComponents'), model: ['analysis'],
  },
  '/userconfig/rolemanage/rolemanages': {
    component: () => import('./routes/UserConfig/Rolemanage/Rolemanages'), model: ['analysis'],
  },
  '/userconfig/rolemanage/creatRolemanages': {
    component: () => import('./routes/UserConfig/Rolemanage/CreatRolemanages'), model: ['analysis'],
  },
  '/userconfig/permission/permissions': {
    component: () => import('./routes/UserConfig/Permission/Permissions'), model: ['analysis'],
  },
  '/userconfig/permission/creatPermissions': {
    component: () => import('./routes/UserConfig/Permission/CreatPermissions'), model: ['analysis'],
  },
  '/userconfig/resource/resources': {
    component: () => import('./routes/UserConfig/Resource/Resources'), model: ['analysis'],
  },
  '/userconfig/resource/creatResources': {
    component: () => import('./routes/UserConfig/Resource/CreatResources'), model: ['analysis'],
  },
  '/userconfig/usermanage/usermanages': {
    component: () => import('./routes/UserConfig/Usermanage/Usermanages'), model: ['analysis'],
  },
  '/userconfig/sensitivemanage/sensitivemanages': {
    component: () => import('./routes/UserConfig/Sensitivemanage/Sensitivemanages'), model: ['analysis'],
  },
  '/userconfig/sensitivemanage/creatSensitivemanages': {
    component: () => import('./routes/UserConfig/Sensitivemanage/CreatSensitivemanages'), model: ['analysis'],
  },
  '/userconfig/custommanage/custommanages': {
    component: () => import('./routes/UserConfig/Custommanage/Custommanages'), model: ['analysis'],
  },
  '/userconfig/custommanage/creatCustommanages': {
    component: () => import('./routes/UserConfig/Custommanage/CreatCustommanages'), model: ['analysis'],
  },
  '/userconfig/subscribe': {
    component: () => import('./routes/UserConfig/Subscribe'), model: ['analysis'],
  },
  '/userconfig/dictionary': {
    component: () => import('./routes/UserConfig/Dictionary'), model: ['analysis'],
  },
  '/userconfig/dorFunction/copy': {
    component: () => import('./routes/UserConfig/DorFunction/Copy'), model: ['analysis'],
  },
  '/userconfig/dorFunction/reduction': {
    component: () => import('./routes/UserConfig/DorFunction/Reduction'), model: ['analysis'],
  },
  '/userconfig/dorFunction/reductionSub': {
    component: () => import('./routes/UserConfig/DorFunction/ReductionSub'), model: ['analysis'],
  },
  '/dimension/query/supervise-business': { // 测试 pcm-testTheme  正式 supervise-business
    component: () => import('./routes/Dimension/Query'), model: ['analysis'],
  },
  '/dimension/query/supervise-businessudr': { // 测试 pcm-businessudr  正式 supervise-businessudr
    component: () => import('./routes/Dimension/Query'), model: ['analysis'],
  },
  '/dimension/query/supervise-finance': {
    component: () => import('./routes/Dimension/FinanceQuery'), model: ['analysis'],
  },
  '/dimension/query/supervise-cartype_bill': {
    component: () => import('./routes/Dimension/components/CarType'), model: ['analysis'],
  },
  '/dimension/query/supervise-cartype_bartender': {
    component: () => import('./routes/Dimension/components/Bartender'), model: ['analysis'],
  },
  '/dimension/query/supervise-trend': {
    component: () => import('./routes/Dimension/components/Trend'), model: ['analysis'],
  },
  '/dimension/cxpz/cxpz-clm': {
    component: () => import('./routes/Dimension/Query'), model: ['analysis'],
  },
  '/dimension/cxpz/cxpz-linian': {
    component: () => import('./routes/Dimension/LinianQuery'), model: ['analysis'],
  },
  '/dimension/cxpz/cxpz-expayrate': {
    component: () => import('./routes/Dimension/ExpayrateQuery'), model: ['analysis'],
  },
  '/dimension/cxpz/cxpz-busistructure': {
    component: () => import('./routes/Dimension/BusistructureQuery'), model: ['analysis'],
  },
  '/dimension/cxpz/cxpz-nbz': {
    component: () => import('./routes/Dimension/Query'), model: ['analysis'],
  },
  '/dimension/cxpz/cxpz-prm': {
    component: () => import('./routes/Dimension/Query'), model: ['analysis'],
  },
  '/dimension/zhjkquery/zhjk-zhindex': { // 测试 zhjk-testTheme  正式 zhjk-zhindex
    component: () => import('./routes/Dimension/ZhjkQuery'), model: ['analysis'],
  },
  '/dimension/zhjkquery/zhjk-zhindexudr': {
    component: () => import('./routes/Dimension/ZhjkQuery'), model: ['analysis'],
  },
  '/queryanalysis': {
    component: () => import('./routes/SelfHelpAnalysis/QueryAnalysis'), model: ['analysis'],
  },
  '/paypredict': {
    component: () => import('./routes/PayPredict/PayPredict'), model: ['analysis'],
  },
  '/operationManual': {
    component: () => import('./routes/OperationManual/OperationManual'), model: ['analysis'],
  },
  '/businessmap/mapdor/userdor': {
    component: () => import('./routes/BusinessMap/UserDor'), model: ['analysis'],
  },
  '/businessmap/mapTrack/mapTracking': {
    component: () => import('./routes/BusinessMap/MapTrack/MapTracking'), model: ['analysis'],
  },
  '/businessmap/mapTrack/warnDetails': {
    component: () => import('./routes/BusinessMap/MapTrack/WarnDetails'), model: ['analysis'],
  },
  '/businessmap/mapTrack/warnNotice': {
    component: () => import('./routes/BusinessMap/MapTrack/WarnNotice'), model: ['analysis'],
  },
  '/businessmap/mapcreate': {
    component: () => import('./routes/BusinessMap/MapCreate'), model: ['analysis'],
  },
  '/businessmap/mapquery': {
    component: () => import('./routes/BusinessMap/MapQuery'), model: ['analysis'],
  },
  '/businessmap/planquery': {
    component: () => import('./routes/BusinessMap/PlanQuery'), model: ['analysis'],
  },
  '/businessmap/summaryplan': {
    component: () => import('./routes/BusinessMap/SummaryPlan'), model: ['analysis'],
  },
  '/businessmap/checkplan': {
    component: () => import('./routes/BusinessMap/CheckPlan'), model: ['analysis'], permission: 'all', // permission: 'all' 隐藏菜单
  },
  '/businessmap/simulateplan': {
    component: () => import('./routes/BusinessMap/SimulatePlan'), model: ['analysis'], permission: 'all',
  },
  '/businessmap/checklookback': {
    component: () => import('./routes/BusinessMap/CheckLookBack'), model: ['analysis'], permission: 'all',
  },
  '/businessmap/summaryresults': {
    component: () => import('./routes/BusinessMap/SummaryResults'), model: ['analysis'], permission: 'all',
  },
  // '/industrydata/businesstype': {
  //   component: () => import('./routes/IndustryData/BusinessType'), model: ['analysis'],
  // },
  '/industrydata/businesstype_body': {
    component: () => import('./routes/IndustryData/BusinessBype_Body'), model: ['analysis'],
  },
  '/industrydata/business_organ': {
    component: () => import('./routes/IndustryData/BusinessOrgan'), model: ['analysis'],
  },
  // '/reasonanalysis/expayrate-business': {
  //   component: () => import('./routes/ReasonAnalysis/ExpayrateBusiness'), mode: ['analysis'],
  // },
  '/reasonanalysis/expayrate-business/business-analysis': {
    component: () => import('./routes/ReasonAnalysis/ExpayrateBusiness/BusinessAnalysis'), model: ['analysis'],
  },
  '/reasonanalysis/expayrate-business/query-result': {
    component: () => import('./routes/ReasonAnalysis/ExpayrateBusiness/QueryResult'), model: ['analysis'],
  },
  '/reasonanalysis/expayrate-claim': {
    component: () => import('./routes/ReasonAnalysis/ExpayrateClaim'), model: ['analysis'],
  },
  '/reasonanalysis/historypayrate-claim': {
    component: () => import('./routes/ReasonAnalysis/HistoryPayrateClaim'), model: ['analysis'],
  },
  '/exception/403': {
    component: () => import('./routes/Exception/403'), model: [],
  },
  '/exception/404': {
    component: () => import('./routes/Exception/404'), model: [],
  },
  '/exception/500': {
    component: () => import('./routes/Exception/500'), model: [],
  },
  '/exception/trigger': {
    component: () => import('./routes/Exception/triggerException'), model: ['error'],
  },
  '/institutional/rating': {
    component: () => import('./routes/Institutional/Rating/Rate'), model: ['analysis'],
  },
  // '/institutional/rating/such': {
  //   component: () => import('./routes/Institutional/Rating/Such'), model: ['analysis'],
  // },
  '/institutional/upload/branchOffice': {
    component: () => import('./routes/Institutional/Uploads/BranchOffice'), model: ['analysis'],
  },
  '/institutional/upload/mechanism': {
    component: () => import('./routes/Institutional/Uploads/Mechanism'), model: ['analysis'],
  },
  '/institutional/score/branchOffice': {
    component: () => import('./routes/Institutional/Score/BranchOffice'), model: ['analysis'],
  },
  '/institutional/score/mechanism': {
    component: () => import('./routes/Institutional/Score/Mechanism'), model: ['analysis'],
  },
  '/institutional/history': {
    component: () => import('./routes/Institutional/History'), model: ['analysis'],
  },
  '/institutional/map': {
    component: () => import('./routes/Institutional/Map'), model: ['analysis'],
  },
};

function RouterConfig({ history, app }) {
  return run({
    app,
    um: true,
    menuData,
    router,
    renderContent: (params) => {
      return (
        <LocaleProvider locale={zhCN}>
          <ConnectedRouter history={history}>
            <Switch>
              <Route
                path="/"
                render={
                  props => {
                    // 这里做一个校验，如果用户没权限查看展业地图，就把展业地图的隐藏模块也给删掉
                    // if (params.menuData.length === 0) {
                    //   for (let i in router) {
                    //     if (i.indexOf('businessmap') >= 0) {
                    //       delete router[i]
                    //     }
                    //   }
                    // }
                    return <params.BasicLayout {...props} {...params} />
                  }}
              />
            </Switch>
          </ConnectedRouter>
        </LocaleProvider>);
    },
  });
}

export default RouterConfig;
