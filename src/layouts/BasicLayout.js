import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'snk-web';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import { enquireScreen } from 'enquire-js';
import SiderMenu from '../components/SiderMenu';
import GlobalHeader from '../components/GlobalHeader';
import NotFound from '../routes/Exception/404';
import { getRoutes } from '../utils/utils';
import Authorized from '../utils/Authorized';
import logo from '../assets/halogo.png';
import logo2 from '../assets/huiyan.png';
import { changeTheme } from '../theme/themeConfig';

const { Content, Header } = Layout;
const { AuthorizedRoute, check } = Authorized;

/**
 * 根据菜单取得重定向地址.
 */
const redirectData = [];
const getRedirect = (item) => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach((children) => {
        getRedirect(children);
      });
    }
  }
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

let isMobile;
enquireScreen((b) => {
  isMobile = b;
});

const thirdRoute = ['/model/template/add', '/rule/valid/add', '/maintenance/basicFactor/add', '/model/factor/add', '/model/type/add'];

class BasicLayout extends React.PureComponent {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  }
  constructor(props) {
    super(props);
    changeTheme(window.localStorage.getItem('snk-theme'));
    props.menuData.forEach(getRedirect);
  }
  state = {
    isMobile,
  };
  getChildContext() {
    const { location, routerData } = this.props;
    return {
      location,
      breadcrumbNameMap: routerData,
    };
  }
  componentDidMount() {
    enquireScreen((mobile) => {
      this.setState({
        isMobile: mobile,
      });
    });
  }
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'E Contract';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - E Contract`;
    }
    return title;
  }
  getBashRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      const { routerData } = this.props;
      // get the first authorized route path in routerData
      const routerObj = Object.keys(routerData);
      let authorizedPath = routerObj.find(item =>
        check(routerData[item].authority, item) && item !== '/' && item !== '/userconfig/actionRedis');
      if (routerObj.indexOf('/datador/defaultdor') >= 0) authorizedPath = '/datador/defaultdor';  // 如果存在默认门户，那默认门户就是默认菜单

      if (authorizedPath.indexOf('businessmap') >= 0) authorizedPath = '/exception/403'
      return authorizedPath;
    }
    return redirect;
  }
  handleMenuCollapse = (collapsed) => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  }
  render() {
    const {
      currentUser, collapsed, fetchingNotices, notices, routerData, match, location,
    } = this.props;

    const bashRedirect = this.getBashRedirect();

    const content = (
      <Content style={{ overflow: 'hidden', height: '100%' }}>
        <Switch>
          {
            redirectData.map(item =>
              <Redirect key={item.from} exact from={item.from} to={item.to} />)
          }
          {
            getRoutes(match.path, routerData)
              .filter(item => thirdRoute.indexOf(item.path) < 0)
              .map(item =>
              (
                <AuthorizedRoute
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                  authority={item.authority}
                  redirectPath="/exception/403"
                />
              ))
          }
          {
            thirdRoute.map(i => (<Route
              key={i}
              exact
              path={i}
              component={routerData[i] ? routerData[i].component : null}
            />))
          }
          <Redirect exact from="/" to={bashRedirect} />
          <Route render={NotFound} />
        </Switch>
      </Content>
    );

    const layout = (
      <React.Fragment>
        {/* {location.pathname.includes('/_') ?   // 配置特殊界面，不受菜单管控，单页应用
          <Layout>
            {content}
          </Layout> : */}
        <Layout>
          <SiderMenu
            logo={logo}
            logo2={logo2}
            // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
            // If you do not have the Authorized parameter
            // you will be forced to jump to the 403 interface without permission
            Authorized={Authorized}
            menuData={this.props.menuData}
            collapsed={collapsed}
            location={location}
            isMobile={this.state.isMobile}
            onCollapse={this.handleMenuCollapse}
          />
          <Layout>
            <Header style={{ padding: 0 }}>
              <GlobalHeader
                logo={logo}
                currentUser={currentUser}
                fetchingNotices={fetchingNotices}
                notices={notices}
                dispatch={this.props.dispatch}
                collapsed={collapsed}
                isMobile={this.state.isMobile}
                onCollapse={this.handleMenuCollapse}
              />
            </Header>
            {content}
          </Layout>
        </Layout>
        {/* } */}
      </React.Fragment>
    );

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default connect(({ global, umssouserinfo }) => ({
  currentUser: umssouserinfo.currentUser,
  collapsed: global.collapsed
}))(BasicLayout);
