const path = require('path');
const svgSpriteDirs = [
  require.resolve('antd').replace(/warn\.js$/, ''), // antd 内置svg
  path.resolve(__dirname, 'src/assets/svg'),  // 业务代码本地私有 svg 存放目录
];

export default {
  entry: 'src/index.js',
  theme: 'src/theme/theme.js',
  publicPath: "./",
  hash: true,
  svgSpriteLoaderDirs: svgSpriteDirs,
  extraBabelPlugins: [
    'transform-runtime',
    'transform-decorators-legacy',
    ['import', { 'libraryName': 'snk-web', 'libraryDirectory': 'src/lib' }],
  ],
  extraBabelIncludes: ["node_modules/snk-sso-um"],
  env: {
    development: { // 开发环境
      extraBabelPlugins: [
        'dva-hmr',
      ],
      define: {
        SYSTEMNAME: '经营决策平台',
        // SERVER: 'http://10.11.1.72:10011', // 浩哥 10.11.1.72   测试 10.1.108.35
        // SERVER: 'http://10.11.1.223:10020', // 小易 
        // SERVER: 'http://10.11.1.72:10011', // 健康
        SERVER: 'http://10.11.1.89:10013', // 武昌
        // SERVER: 'http://10.11.1.150:10013', // 超辛
        // SERVER: 'http://10.11.1.88:10011', // 波哥
        // UMBUTTONSERVER:'http://10.11.1.72:10011/um/system/iap/user/{userCode}/button',// UM 按钮
        SSOSERVER: 'http://10.11.1.89:10013/sso/user', // sso 地址
        UMMENUSERVER: 'http://10.11.1.89:10013/um/system/iap/user/{userCode}/menu', // UM 地址
        SSOLOGOUTSERVER: 'http://10.11.1.72:10011/sso/logout',
      }
    },
    uat: { // 测试环境
      define: {
        SYSTEMNAME: '经营决策平台',
        // SERVER: 'http://10.1.100.198:10011',
        // SSOSERVER:'http://10.1.100.198:10011/sso/user', // sso 地址
        // UMMENUSERVER:'http://10.1.100.198:10011/um/system/iap/user/{userCode}/menu', // UM 地址
        SERVER: 'http://10.11.1.223:10020',
        SSOSERVER: 'http://10.11.1.223:10020/sso/user', // sso 地址
        UMMENUSERVER: 'http://10.11.1.223:10020/um/system/iap/user/{userCode}/menu', // UM 地址
        SSOLOGOUTSERVER: 'http://10.1.109.27:8080/sso/logout',
      }
    },
    production: { // 生产环境
      define: {
        SYSTEMNAME: '经营决策平台',
        // SERVER: 'http://10.1.100.198:10011',
        // SSOSERVER:'http://10.1.100.198:10011/sso/user', // sso 地址
        // UMMENUSERVER:'http://10.1.100.198:10011/um/system/iap/user/{userCode}/menu', // UM 地址
        // SERVER: 'http://10.1.102.211:10020',
        SERVER: 'http://iapbackend.sinosafe.com.cn:10011',
        SSOSERVER: 'http://iapbackend.sinosafe.com.cn:10011/sso/user', // sso 地址
        UMMENUSERVER: 'http://iapbackend.sinosafe.com.cn:10011/um/system/iap/user/{userCode}/menu', // UM 地址
        SSOLOGOUTSERVER: 'http://sso.sinosafe.com.cn/sso/logout',
      }
    }
  },
  define: {
    VERSION: require('./package.json').version
  },
  hash: true,
  ignoreMomentLocale: true,
}