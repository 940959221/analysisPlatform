import 'url-polyfill';
import dva from 'dva';
import createLoading from 'dva-loading';
import 'antd/dist/antd.less';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'ant-design-pro/dist/ant-design-pro.css'; // 统一引入样式
import './index.less';

moment.locale('zh-cn');
// 1. Initialize
const app = dva({
  onError(e) {
    console.log('onError', e);
  },
});

// 2. Plugins
app.use(createLoading());

// 3. Register global model
app.model(require('./models/global'));

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');
