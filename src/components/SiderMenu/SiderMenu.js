import React, { PureComponent } from 'react';
import { Layout, Menu, Icon, Button, Form, message } from 'snk-web';
import pathToRegexp from 'path-to-regexp';
import Debounce from 'lodash-decorators/debounce';
import { Link } from 'dva/router';
import styles from './index.less';
import { urlToList } from '../utils/pathTools';

import { connect } from 'dva';


const { Sider } = Layout;
const { SubMenu } = Menu;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = (icon) => {
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" className={`${styles.icon} sider-menu-item-img`} />;
  }
  if (typeof icon === 'string') {
    return <Icon type={icon} />;
  }
  return icon;
}
export const getMeunMatcheys = (flatMenuKeys, path) => {
  return flatMenuKeys.filter((item) => {
    return pathToRegexp(item).test(path);
  });
};
;

// 下面connect为需求新增代码，2020.2.11  ---  汪秋童
@connect(({ global, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  global,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.menus = props.menuData;
    this.flatMenuKeys = this.getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
      button: false,    // 2020.2.11 --- 汪秋童
      click: props.global.click,      // 记录点击的是个人还是公共
      data: []
    };
  }
  componentWillMount() {     // 2020.2.11 --- 汪秋童
    // for(let i of this.menus){
    //   if(i.name === '编辑公共默认模板') this.setState({ button: true })
    // }

    // 发送请求获取用户权限
    this.props.dispatch({
      type: 'global/getUserDiction',
      payload: {
        man: this.props.currentUser.principal.name
      }
    }).then(() => {
      const number = this.props.global.getUserDictionData.authType;
      const { menuData } = this.props;
      this.setName(menuData)
      if (number === '0' || number === '1') {
        this.setState({ button: true })
      }
      this.props.dispatch({
        type: 'global/menuData',
        payload: menuData
      })
    })
  }

  setName(datas, name) { //遍历树  获取id数组
    for (let i in datas) {
      if (datas[i].children.length === 0) {
        if (name) {
          let data = name + '_' + datas[i].name;
          this.props.dispatch({
            type: 'global/setMenuData',
            payload: [...this.props.global.menuData, data]
          })
        } else {
          let data = datas[i].name + '_';
          this.props.dispatch({
            type: 'global/setMenuData',
            payload: [...this.props.global.menuData, data]
          })
        }
      }
      else this.setName(datas[i].children, datas[i].name);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.pathname !== this.props.location.pathname) {
      this.setState({
        openKeys: this.getDefaultCollapsedSubMenus(nextProps),
      });
    }
  }
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }
  /**
   * Convert pathname to openKeys
   * /list/search/articles = > ['list','/list/search']
   * @param  props
   */
  getDefaultCollapsedSubMenus(props) {
    const { location: { pathname } } = props || this.props;
    return urlToList(pathname)
      .map((item) => {
        return getMeunMatcheys(this.flatMenuKeys, item)[0];
      })
      .filter(item => item);
  }
  /**
   * Recursively flatten the data
   * [{path:string},{path:string}] => {path,path2}
   * @param  menus
   */
  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach((item) => {
      if (item.children) {
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      }
      keys.push(item.path);
    });
    return keys;
  }
  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */
  getMenuItemPath = (item) => {
    const itemPath = this.conversionPath(item.path);
    const icon = getIcon(item.icon);
    const { target, name } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {icon}
          <span>{name}</span>
        </a>
      );
    }
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === this.props.location.pathname}
        onClick={
          this.props.isMobile
            ? () => {
              this.props.onCollapse(true);
            }
            : undefined
        }
      >
        {icon}
        <span>{name}</span>
      </Link>
    );
  };
  /**
   * get SubMenu or Item
   */
  getSubMenuOrItem = (item) => {
    if (item.name === '编辑公共默认模板') return;    // 2020.2.11 --- 汪秋童
    if (item.children && item.children.some(child => child.name)) {
      const childrenItems = this.getNavMenuItems(item.children);
      // 当无子菜单时就不展示菜单
      if (childrenItems && childrenItems.length > 0) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  {getIcon(item.icon)}
                  <span>{item.name}</span>
                </span>
              ) : (
                  item.name
                )
            }
            key={item.path}
          >
            {childrenItems}
          </SubMenu>
        );
      }
      return null;
    } else {
      return (
        <Menu.Item key={item.path}>{this.getMenuItemPath(item)}</Menu.Item>
      );
    }
  };
  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   */
  getNavMenuItems = (menusData) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter(item => item.name && !item.hideInMenu)
      .map((item) => {
        // make dom
        const ItemDom = this.getSubMenuOrItem(item);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter(item => item);
  };
  // Get the currently selected menu
  getSelectedMenuKeys = () => {
    const { location: { pathname } } = this.props;
    return urlToList(pathname).map(itemPath =>
      getMeunMatcheys(this.flatMenuKeys, itemPath).pop());
  };
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  }
  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  // conversion Path
  // 转化路径
  conversionPath = (path) => {
    if (path && path.indexOf('http') === 0) {
      return path;
    } else {
      return `/${path || ''}`.replace(/\/+/g, '/');
    }
  };
  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    if (this.props.Authorized && this.props.Authorized.check) {
      const { check } = this.props.Authorized;
      return check(authority, ItemDom);
    }
    return ItemDom;
  };
  isMainMenu = (key) => {
    return this.menus.some(
      item =>
        key && (item.key === key || item.path === key),
    );
  }
  handleOpenChange = (openKeys) => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [lastOpenKey] : [...openKeys],
    });
  };
  changeMode = () => {     // 2020.2.11 --- 汪秋童
    let change1, change2;
    const { click } = this.props.global
    console.log(click);

    if (click) {
      change1 = '公共';
      change2 = false;
      message.success('切换为公共模板！');
    } else {
      change1 = '个人';
      change2 = false;
      message.success('切换为个人模板！');
    }
    this.props.dispatch({
      type: 'global/changeMode',
      payload: change1
    })
    // 此处多发一个请求修改参数是为了在点击按钮的时候影响全局
    // 根据global的状态直接修改可视化界面的保存按钮，否则会无论什么时候初始化都是显示保存为个人模板
    this.props.dispatch({
      type: 'global/changeModeName',
      payload: change1
    })
    this.props.dispatch({
      type: 'global/changeClick',
      payload: !click
    })
    // this.setState({ click: !this.state.click });
    setTimeout(() => {
      this.props.dispatch({
        type: 'global/changeMode',
        payload: change2
      })
    }, 200);
  }
  render() {
    const { logo, logo2, collapsed, onCollapse } = this.props;
    const { openKeys, button } = this.state;
    const { click } = this.props.global;
    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed
      ? {}
      : {
        openKeys,
      };
    // if pathname can't match, use the nearest parent's key
    let selectedKeys = this.getSelectedMenuKeys();
    if (!selectedKeys.length) {
      selectedKeys = [openKeys[openKeys.length - 1]];
    }
    // eslint-disable-next-line
    const systemname = SYSTEMNAME;
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={onCollapse}
        width={210}
        style={{ float: 'left' }}
        className={styles.sider}
      >
        <div className={styles.logo} key="logo">
          <Link to="/">
            <img src={logo} alt="logo" />
          </Link>
          <span className="snk-sys-name">{systemname}（慧策）</span>
          {/* <img src={logo2} alt="logo" style={{ marginLeft: 31, height: 'auto', width: 80 }} /> */}
        </div>
        <div className="menutop-wrapper">
          {collapsed ? null : <span>导航栏</span>}
          <Icon
            className="snk-fold-trigger"
            type={collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={this.toggle}
          />
        </div>
        <Menu
          key="Menu"
          mode="inline"
          {...menuProps}
          onOpenChange={this.handleOpenChange}
          selectedKeys={selectedKeys}
          style={{ padding: '0', width: '100%' }}
        >
          {this.getNavMenuItems(this.menus)}
        </Menu>
        {/* 下面button为新增需求   2020.2.11 --- 汪秋童 */}
        <Button type='primary' style={button ? {} : { display: 'none' }} onClick={this.changeMode}>编辑{click ? '公共' : '个人'}默认模板</Button>
      </Sider>
    );
  }
}
