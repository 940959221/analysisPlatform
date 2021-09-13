import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Spin, Modal, Table } from 'snk-web';
import styles from './index.less';
import { ThemeConfig, changeTheme } from '../../theme/themeConfig';
import '../../assets/icon/iconfont.js';

const svg = <svg t="1587711096354" className="icon" style={{ width: '100%', height: '100%' }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2171" id="mx_n_1587711096354" width="200" height="200"><path d="M480.369 926.453h56.252c72.791 0 92.257-9.119 94.811-70.327h-224.611c0.331 65.292 5.118 70.327 73.551 70.327z" fill="#CFCF5A" p-id="2172"></path><path d="M814.634 384.853c0-158.912-133.313-288.166-290.59-288.166h-20.228c-157.29 0-279.871 129.274-279.871 288.166v232.188h590.685v-232.188z" fill="#CFCF5A" p-id="2173"></path><path d="M870.885 618.489v-233.635c0-189.939-158.562-344.438-346.839-344.438h-20.228c-188.277 0-336.123 154.499-336.123 344.438v232.345c-62.518 1.901-112.475 53.025-112.505 115.822v7.051c0 0.003 0 0.007 0 0.020 0 64.053 51.926 115.978 115.978 115.978 0.007 0 0.025 0 0.042 0h179.471c1.68 88.955 19.819 126.58 129.685 126.58h56.252c104.729 0 146.863-31.318 151.007-126.58h165.666c64.058-0.006 115.986-51.938 115.998-115.996v-7.047c0.020-58.048-42.703-106.021-98.407-114.534zM223.95 384.853c0-158.912 122.577-288.166 279.871-288.166h20.228c157.27 0 290.59 129.274 290.59 288.166v232.188h-590.685v-232.188zM536.621 926.453h-56.252c-68.416 0-73.219-5.037-73.551-70.327h224.611c-2.578 61.207-22.044 70.327-94.811 70.327zM913.061 740.091c0 15.872-6.268 31.065-17.494 42.252-10.775 10.809-25.682 17.494-42.145 17.494-0.037 0-0.075 0-0.112 0h-682.096c-0.019 0-0.037 0-0.058 0-32.975 0-59.71-26.732-59.71-59.71 0-0.007 0-0.025 0-0.042v-7.007c0-0.019 0-0.037 0-0.058 0-32.975 26.732-59.71 59.71-59.71 0.021 0 0.042 0 0.061 0h682.076c0 0 0 0 0 0 32.999 0 59.745 26.749 59.745 59.745 0 0.004 0 0.007 0 0.021v7.008z" fill="#504C23" p-id="2174"></path><path d="M588.948 190.721c89.023 39.584 149.979 127.238 149.991 229.132 0-0.004 0-0.004 0-0.004 0 7.763 6.294 14.059 14.059 14.059 7.763 0 14.059-6.294 14.059-14.059 0 0 0 0 0 0 0-0.002 0-0.005 0-0.018 0-113.345-67.807-210.857-165.073-254.18-3.426-1.45-5.364-1.882-7.402-1.882-7.77 0-14.066 6.295-14.066 14.066 0 5.73 3.425 10.66 8.343 12.85zM489.057 169.945c7.907 0 15.838 0.372 23.547 1.091 0.14 0.003 0.304 0.004 0.463 0.004 7.785 0 14.097-6.313 14.097-14.097 0-7.019-5.131-12.839-11.846-13.921-7.868-0.781-16.915-1.223-26.062-1.223-0.070 0-0.141 0-0.211 0-7.536 0.29-13.541 6.479-13.541 14.069 0 7.59 6.007 13.779 13.526 14.067z" fill="#848D2F" p-id="2175"></path></svg>;
const msgSvg = <svg t="1595211626440" className="icon" style={{ width: '100%', height: '100%' }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2450" width="200" height="200"><path d="M512.000512 512m-356.282472 0a348.168 348.168 0 1 0 712.564945 0 348.168 348.168 0 1 0-712.564945 0Z" p-id="2451" fill="#d81e06"></path></svg>

@connect(({ global, loading }) => ({
  global,
  loading: loading.models.global
}))
export default class GlobalHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fullScreen: false,
      dataVisible: false,
      businessMapData: [],
      businessMapCol: [],
      count: 0
    };
  }
  componentDidMount = () => {
    document.addEventListener('fullscreenchange', () => {
      this.fullScreenChange();
    });
    document.addEventListener('webkitfullscreenchange', () => {
      this.fullScreenChange();
    });
    document.addEventListener('mozfullscreenchange', () => {
      this.fullScreenChange();
    });
    document.addEventListener('MSFullscreenChange', () => {
      this.fullScreenChange();
    });

    const businessMapCol = [
      {
        title: '指标',
        dataIndex: 'measureName',
        align: 'center',
        width: 150
      },
      {
        title: '来源',
        dataIndex: 'from',
        align: 'center',
        width: 250
      },
      {
        title: '报警程度',
        dataIndex: 'warn',
        align: 'center',
        width: 100
      },
    ]
    
    this.props.dispatch({
      type: 'global/getAlertResultBell'
    }).then(() => {
      const { getAlertResultBellData: { alertContent, count } } = this.props.global;
      const businessMapData = [];
      for(let i of alertContent){
        let color;
        switch (i.colourType){
          case 'red': color = '红色'; break;
          case 'yellow': color = '黄色'; break;
          default : color = '绿色'; break;
        }
        businessMapData.push({
          key: i.hisId,
          measureName: i.measureName,
          from: i.alertResource === 'businessmap' ? '展业地图' : i.alertResource,
          warn: color
        })
      }
      this.setState({ businessMapCol, businessMapData, count })
    })
  }
  fullScreenChange = () => {
    this.setState({
      fullScreen: !this.state.fullScreen,
    }, () => {
    });
  }
  themeChange = (data) => {
    changeTheme(data);
  }

  fullScreen = () => {
    if (this.state.fullScreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      const el = document.documentElement;
      const rfs = el.requestFullScreen || el.webkitRequestFullScreen
        || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (typeof rfs !== 'undefined' && rfs) {
        rfs.call(el);
      }
    }
  }
  exit = () => {
    // eslint-disable-next-line
    const img = document.createElement('img');
    // eslint-disable-next-line
    img.src = SSOLOGOUTSERVER;
    try {
      setTimeout(() => {
        this.props.dispatch({
          type: 'umssouserinfo/getUserInfo',
        }).then(() => {
        });
      }, 300);
    } catch (e) {
      console.log(e);
    }
  }

  // 
  showTable = () => {
    this.setState({ dataVisible: true })
  }

  // 点击进行模块跳转
  pathTo = () => {
    location.hash = '#/businessmap/mapTrack/warnNotice';
    this.setState({ dataVisible: false })
  }

  render() {
    const { currentUser } = this.props;
    const { businessMapCol, businessMapData, dataVisible, count } = this.state;
    let userName = currentUser.principal ? currentUser.principal.name : '';
    if (currentUser.principal
      && currentUser.principal.attributes && currentUser.principal.attributes.USERNAME) {
      userName = currentUser.principal.attributes.USERNAME;
    }
    const themeBlocks = [];
    // eslint-disable-next-line
    for (const key in ThemeConfig) {
      const item = ThemeConfig[key];
      themeBlocks.push(
        <div
          key={item.key}
          onClick={this.themeChange.bind(this, key)}
          style={{
            cursor: 'pointer',
            backgroundColor: item.color,
            marginRight: 20,
            width: 20,
            height: 20,
            display: 'inline-block',
          }}
        />
      );
    }
    return (
      <div className={styles.header}>
        <a title={this.state.fullScreen ? '退出全屏' : '全屏'} onClick={this.fullScreen.bind(this)} style={{ position: 'absolute', top: 8, right: 430 }} className="primary-fill">
          <svg style={{ width: 20, height: 20 }} aria-hidden="true">
            <use xlinkHref={this.state.fullScreen ? '#icon-suoxiaopingmu' : '#icon-quanping1'} />
          </svg>
        </a>
        <div style={{ position: 'absolute', top: 7, right: 250 }}>{themeBlocks}</div>
        <div onClick={this.showTable}
          style={{ position: 'absolute', top: 14, right: 220, width: 25, height: 25, cursor: 'pointer', display: 'flex' }}>
          {svg}
          <div style={{position: 'absolute', width: 40, height: 26, bottom: 13}}>{msgSvg}</div>
          <div style={{position: 'absolute', left: 10, top: -22, width: 18, height: 18, color: '#fff'}}>
            <div style={{transform: 'scale(0.8)', textAlign: 'center'}}>{count}</div>
          </div>
        </div>
        <div className={styles.right}>
          {userName ? (
            <span className={`${styles.account}`}>
              <span className={styles.name}>{userName}</span>
              <a style={{ marginLeft: 10 }} onClick={this.exit.bind(this)}>退出</a>
            </span>
          ) : <Spin size="small" style={{ marginLeft: 8 }} />}
        </div>

        <Modal
        visible={dataVisible}
        footer={null}
        onCancel={e => { this.setState({ dataVisible: false }) }}
        title='当前通知'
        className={styles.modal}>
          <div onClick={this.pathTo} style={{cursor: 'pointer', fontSize: 18, color: '#fff', 
            background: 'rgb(2,167,240)', display: 'flex', justifyContent: 'space-between'}}>
            <span>展业跟踪预警&gt;&gt;&gt;</span>
            <span style={{fontSize: 12, color: '#D55621'}}>*当前仅展示部分，更多数据请前往查看</span>
          </div>
          <Table 
            columns={businessMapCol} 
            // style={{height: otherHeight, display: showBack2 ? 'block' : 'none', overflow: 'hidden'}} 
            bordered 
            size='middle'
            dataSource={businessMapData}  />
        </Modal>
      </div>
    );
  }
}

