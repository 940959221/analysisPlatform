import React, { Component } from 'react';
import { connect } from 'dva';
import { ReactSortable } from "react-sortablejs";
// import html2canvas from 'html2canvas'
import { Form, Card, Spin, Button, message, Modal, List, Tabs, Switch, Input, Tree } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SearchComponent from './component/SetComponent';
import ChartsComponent from './component/ChartsComponent';
import CardsComponent from './component/CardsComponent';
import styles from './component/styles.less';
import setting from '../../assets/setting.png';

const { TabPane } = Tabs;
const { Search } = Input;
const { TreeNode } = Tree;

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class Dor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drillVisibilit: false,    // 下钻弹窗是否显示
      setVisbilit: false,       // 设置弹窗是否显示
      tabs: '1',                // 当前tab是哪一页
      chartsDataArr: [],        // 图表组件的数据集合
      cardsDataArr: [],         // 卡片组件的数据集合
      sortNumArr: [],           // 图表组件的排序编号
      cardsDataArr: [],         // 卡片组件的数据集合
      cardSortNumArr: [],       // 卡片组件的排序编号
      drillDownAllData: [],     // 下钻数据的数组集合
      saveObj: {},              // 图表数据结构的对象
      getService: false,        // 卡片组件当前是否在发送一次下钻请求
      permission: true,         // 判断默认门户，用户是否有操作的权限
      componentName: null,        // 组件名称
      yUnit: 'y1',
      companyVisible: false,    // 机构切换按钮是否显示
      companycode: null,        // 当前选择的机构码
      // sor2Sortable: true,       // 关注内容是否禁用拖拽换位功能
      searchValue: '',          // 机构切换搜索的名字
      autoExpandParent: true,  // 机构切换是否展开树结构
      treeData: [],             // 树机构数据
      dataList: [],             // 机构切换所有散数据
      expandedKeys: [],         // 机构切换节点的key
    }
  }

  componentWillMount() {
    const list = window.localStorage.getItem('chartsList');
    if (list) this.setState({ list: JSON.parse(list) })
  }

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.snk-page-wapper-content').style.background = '#f6f6f6';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-card-body').style.padding = '13px 20px';
    document.querySelector('.ant-card-body').style.background = '#f6f6f6';

    // 业务需求，先禁用图表的拖拽功能
    this.sor2.sortable.options.disabled = true;

    const { type, name, parentName } = this.props;
    let portalName, portalType;
    // if (type === 'user') {
    //   portalName = '个人门户';
    //   portalType = '1';
    // } else {
    //   portalName = '默认门户';
    //   portalType = '0';
    // }

    this.props.dispatch({
      type: 'analysis/savePortalConfig',
      payload: {
        portalName: name,
        portalType: type,
        portalParentsName: parentName
      }
    })

    this.props.dispatch({
      type: 'analysis/getCompany'
    })

    this.dispatchData(type);
  }

  // 数据请求
  dispatchData = (portalType) => {
    this.props.dispatch({
      type: 'analysis/queryPortalList',
      payload: {
        portalType
      }
    }).then(() => {
      const { queryPortalListData: { alarmArray, graphArray, portalId, edit_door } } = this.props.analysis;
      const chartsDataArr = [];
      const cardsDataArr = [];
      const sortNumArr = [];
      const cardSortNumArr = [];
      const graphList = [];
      const assemIdList = [];
      // const allId = [...alarmArray, ...graphArray];
      // 如果用户把所有的都关掉了，就重置数组
      if (alarmArray.length === 0) this.setState({ cardsDataArr: [] });
      if (graphArray.length === 0) this.setState({ chartsDataArr: [] });

      // 判定默认门户，用户是否有操作的权限
      if (edit_door !== '1' && portalType !== '1') this.permission();

      for (let i of graphArray) {
        graphList.push({
          id: i.componentId,
          sortNum: i.sortNum
        })
        sortNumArr.push(i.sortNum);
      }
      graphList.sort((a, b) => a.sortNum - b.sortNum);

      for (let i of graphArray) {
        this.props.dispatch({
          type: 'analysis/qMeasureData',
          payload: {
            id: i.componentId,
            portalId
          }
        }).then(() => {
          const { qMeasureDataData } = this.props.analysis;
          for (let j in graphList) {
            const value = graphList[j];
            if (qMeasureDataData.id === value.id) {
              qMeasureDataData.sortNum = value.sortNum;
              chartsDataArr.push(qMeasureDataData)
            }
          }
          chartsDataArr.sort((a, b) => a.sortNum - b.sortNum);
          this.setState({ chartsDataArr, sortNumArr })
        }, err => {
          message.error(err.message)
        })
      }
      setTimeout(() => {
        console.log(chartsDataArr);
      }, 2000);

      for (let i of alarmArray) {
        assemIdList.push(i.componentId);
        cardSortNumArr.push(i.sortNum);
      }

      this.props.dispatch({
        type: 'analysis/cardQMeasureData',
        payload: {
          assemIdList
        }
      }).then(() => {
        const { cardQMeasureDataData } = this.props.analysis;
        for (let j in cardQMeasureDataData) {
          const value = cardQMeasureDataData[j];
          for (let k in assemIdList) {
            if (j === assemIdList[k]) {
              value.sortNum = cardSortNumArr[k];
              cardsDataArr.push(value);
              // cardSortNumArr.sort((a, b) => a.sortNum - b.sortNum);
            }
          }
        }
        if (cardQMeasureDataData.message !== '') message.warn(cardQMeasureDataData.message);
        cardsDataArr.sort((a, b) => a.sortNum - b.sortNum);
        this.setState({ cardsDataArr, cardSortNumArr });
      }, err => {
        message.error(err.message)
      })
    }, err => {
      message.error(err.message)
    })
  }

  // 用户没有权限的时候操作
  permission = () => {
    this.sor1.sortable.options.disabled = true;
    this.sor2.sortable.options.disabled = true;
    this.setState({ permission: false });
  }

  // 设置组件点击确定
  setComponent = () => {
    const cardOpen = this.cards_.state.open;
    const cardOff = this.cards_.state.off;
    const buttonType = [];
    const { type } = this.props;
    let chartOpen = [];
    let chartOff = [];
    let portalType;
    let portalModel;
    // 默认进来就是卡片组件，首先确认用户是否有查看图表组件
    if (this.charts_) {
      chartOpen = this.charts_.state.open;
      chartOff = this.charts_.state.off;
    }
    const { queryPortalListData: { alarmArray, graphArray } } = this.props.analysis;

    let newCard = [...cardOpen];
    alarmArray.forEach(item => newCard.push(item.componentId));
    newCard = newCard.filter((item, index) => newCard.indexOf(item) === index).filter(item => cardOff.indexOf(item) < 0);
    if (newCard.length > 16) {
      message.warn('最多同时开启16个卡片组件！');
      return;
    }
    let newChart = [...chartOpen];
    graphArray.forEach(item => newChart.push(item.componentId));
    newChart = newChart.filter((item, index) => newChart.indexOf(item) === index).filter(item => chartOff.indexOf(item) < 0);
    if (newChart.length > 10) {
      message.warn('最多同时开启10个图表组件！');
      return;
    }
    // 如果压根就没操作，就不发请求
    if (cardOpen.length === 0 && cardOff.length === 0 && chartOpen.length === 0 && chartOff.length === 0) {
      this.setState({ setVisbilit: false });
      return;
    };

    // 分情况处理，只要操作了就配置对象
    if (cardOpen.length !== 0 || cardOff.length !== 0) {
      buttonType.push({
        moduleType: '0',
        portalConfigIdOff: cardOpen.length === 0 ? undefined : cardOpen,
        portalConfigIdNo: cardOff.length === 0 ? undefined : cardOff
      })
    }
    if (chartOpen.length !== 0 || chartOff.length !== 0) {
      buttonType.push({
        moduleType: '1',
        portalConfigIdOff: chartOpen.length === 0 ? undefined : chartOpen,
        portalConfigIdNo: chartOff.length === 0 ? undefined : chartOff
      })
    }
    // if (type === 'user') {
    portalType = type;
    portalModel = type;
    // } else {
    //   portalType = '0';
    //   portalModel = '0';
    // }
    this.props.dispatch({
      type: 'analysis/saveGraphRelate',
      payload: {
        portalModel,
        button: {
          buttonType
        }
      }
    }).then(() => {
      message.success('保存成功！');
      this.setState({ setVisbilit: false });
      this.dispatchData(portalType);
    }, err => {
      message.error(err.message)
    })
  }

  // 图表、卡片拖拽换位
  changeCharts = (e, type) => {
    setTimeout(() => {
      const { chartsDataArr, sortNumArr, cardsDataArr, cardSortNumArr } = this.state;
      let data, num;
      if (type === 'charts') {
        data = chartsDataArr;
        num = sortNumArr;
        this.setState({ chartsDataArr: e });
      } else {
        data = cardsDataArr;
        num = cardSortNumArr;
        this.setState({ cardsDataArr: e });
      }

      if (JSON.stringify(data) !== JSON.stringify(e)) {
        const sort = [];
        num = num.map(item => item = Number(item));
        const arr = num.sort((a, b) => a - b).map(item => item = item.toString());
        for (let i of arr) {
          i = Number(i);
        }

        for (let i in arr) {
          sort.push({
            id: e[i].id,
            sortNum: arr[i]
          })
        }
        for (let i of sort) {
          i.sortNum = Number(i.sortNum);
        }
        this.props.dispatch({
          type: 'analysis/updateSortNum',
          payload: {
            sort
          }
        }).then(() => {
          message.success('换位成功！');
        }, err => {
          message.error(err.message)
        })
      }
    });
  }

  // 点击推荐图表
  recommend = e => {
    const { drillDownAllData } = this.state;
    if (drillDownAllData.length >= 10) {
      message.warn('图表下钻只允许下钻10次！');
      return;
    }

    // 获取图表最后一个元素吗，然后调用子组件方法
    const lastData = drillDownAllData[drillDownAllData.length - 1];
    const { saveObj } = this.state;
    const obj = JSON.stringify(lastData);
    const { payload } = JSON.parse(obj);
    if (e) payload.dimValue = e;
    this.chartDirll.chartsDrillDown(payload, JSON.parse(saveObj), this.chartDirll, true);
  }

  // 下钻点击返回
  goBack = async () => {
    const { drillDownAllData } = this.state;
    drillDownAllData.pop();     // 先删除最后一个元素

    await this.setState({ drillDownAllData });
    // 执行图表的初始化函数，更新图表
    for (let i in this.chartDirll) {
      if (i.indexOf('Charts') >= 0) {
        this.chartDirll[i].didMount()
      }
    }
  }

  // 点击滑块
  switch = e => {
    if (e) this.sor2.sortable.options.disabled = false;
    else this.sor2.sortable.options.disabled = true;
  }

  // 点击机构切换
  showChangeCompany = () => {
    this.props.dispatch({
      type: 'analysis/getCompanyLevel'
    }).then(() => {
      const { getSubCompanyData } = this.props.analysis;

      const codes = [];     // 计算过的节点放入
      const dataList = [];
      const treeData = (data, leve, companyCode) => {
        let recursive = false;
        const tns = [];
        const level = leve || 1;    // 层级
        const code = companyCode || '0';    // 父级机构码
        for (let i of data) {
          if (level.toString() === i.leve && i.companycode.indexOf(code) === 0) {
            tns.push({ title: i.companycname, key: i.companycode });
            codes.push(i.companycode);
          }
          if (i.leve > level) recursive = true;   // 存在更深的层级，需要递归
        }
        if (!recursive) return tns;   // 如果不需要递归则直接返回

        const newData = data.filter(item => {     // 进行一次过滤，减少后续循环数量
          if (codes.indexOf(item.companycode) < 0) return item;
        })
        for (let j of tns) {
          j.children = treeData(newData, level + 1, j.key);
        }
        return tns;
      }

      const data = treeData(getSubCompanyData);
      for (let i of getSubCompanyData) {
        dataList.push({ title: i.companycname, key: i.companycode })
      }
      this.setState({ treeData: data, dataList })
    })
    this.setState({ companyVisible: true });
  }

  // 确认切换机构
  submit = () => {
    const { companycode } = this.state;
    if (!companycode) {
      message.warn('请先选择机构！');
      return;
    }
    this.props.dispatch({
      type: 'analysis/changeCompany',
      payload: {
        companycode
      }
    }).then(() => {
      message.success('切换成功！');
      window.location.reload();
    }, err => {
      message.error(err.message);
    })
  }

  // 展开/收起节点时触发
  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  // 查找所有的key
  getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (this.getParentKey(key, node.children)) {
          parentKey = this.getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  // 切换机构搜索节点
  changeSearch = e => {
    const { dataList, treeData } = this.state;
    const { value } = e.target;
    const expandedKeys = dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return this.getParentKey(item.key, treeData);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true,
    });
  };

  // 获取节点元素
  loop = data => {
    const { searchValue } = this.state;
    const arr = data.map(item => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: '#f50' }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        );
      if (item.children) {
        return (
          <TreeNode key={item.key} title={title}>
            {this.loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={title} />;
    });
    return arr;
  }

  // 选中树节点
  selectTree = e => {
    this.setState({ companycode: e[0] });
  }

  render() {
    const { allowSet, drillVisibilit, setVisbilit, tabs, chartsDataArr, cardsDataArr, drillDownAllData,
      permission, componentName, companyVisible, treeData, autoExpandParent, expandedKeys } = this.state;
    const { queryPortalListData, cardDrillDownData, getSubCompanyData, getCompany } = this.props.analysis;
    const { name } = this.props;
    const lastValueData = drillDownAllData[drillDownAllData.length - 1];

    // 声明变量，在点击自定义模板按钮的时候会切换allowSet的值，根据值不同来让部分功能显示隐藏
    let display, display_;
    if (allowSet) {
      display_ = 'none';
      display = 'block';
    } else {
      display_ = 'block';
      display = 'none';
    }
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card className={styles.card}>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <h2 style={{ marginRight: 15 }}>截止时间：{queryPortalListData.date}</h2>
              <h2 style={{ marginRight: 15 }}>当前机构：{getCompany.companyName}</h2>
              <Button type='primary' style={{ marginRight: 15 }} onClick={this.showChangeCompany}>机构切换</Button>
              <Switch checkedChildren="关注开启拖拽" unCheckedChildren="关注关闭拖拽" defaultChecked={false}
                onChange={this.switch}></Switch>
            </div>
            <div>
              <div className={styles.focus}>
                <div className={styles.focusText}>
                  <span>预警</span>
                  {permission ?
                    <img src={setting} alt="" className={styles.img} onClick={() => this.setState({ setVisbilit: true })} />
                    : null}
                </div>
                <ReactSortable ref={e => this.sor1 = e} list={cardsDataArr} setList={e => this.changeCharts(e, 'cards')}
                  animation={1000} className={styles.sort1}>
                  {cardsDataArr.map(item => {
                    return (
                      <CardsComponent datas={item} key={item.id} type={item.cardType} root={this}
                        wrappedComponentRef={e => this.cardDill = e}></CardsComponent>
                    )
                  })}
                </ReactSortable>
              </div>
              <div className={styles.focus}>
                <div className={styles.focusText}>
                  <span>关注</span>
                  {permission ?
                    <img src={setting} alt="" className={styles.img} onClick={() => this.setState({ setVisbilit: true })} />
                    : null}
                </div>
                <ReactSortable ref={e => this.sor2 = e} list={chartsDataArr} setList={e => this.changeCharts(e, 'charts')}
                  animation={1000} className={styles.sort}>
                  {chartsDataArr.map((item, index) => {
                    return (
                      <ChartsComponent drillDown={item.sqlType ? false : true} ind={index}
                        datas={item} key={item.id} root={this}></ChartsComponent>
                    )
                  })}
                </ReactSortable>
              </div>
            </div>

            <Modal
              visible={setVisbilit}
              onOk={e => this.setComponent(e)}
              onCancel={e => { this.setState({ setVisbilit: false }) }}
              title={`修改${name}-选择展示的组件`}
              width='80%'
            >
              <p style={{ color: 'red' }}>*操作了界面后无论是否点击确定，关闭弹窗都会保留操作记录，但是组件生效则必须点击确定</p>
              <Tabs defaultActiveKey='1' onChange={e => this.setState({ tabs: e })}>
                <TabPane tab="卡片组件" key="1">
                  <SearchComponent otherColumn={true} wrappedComponentRef={e => this.cards_ = e} tabs={tabs} id={queryPortalListData.portalId}></SearchComponent>
                </TabPane>
                <TabPane tab="图表组件" key="2">
                  <SearchComponent wrappedComponentRef={e => this.charts_ = e} tabs={tabs} id={queryPortalListData.portalId}></SearchComponent>
                </TabPane>
              </Tabs>
            </Modal>

            <Modal
              visible={drillVisibilit}
              footer={null}
              width='80%'
              className={styles.drillModal}
              onCancel={e => { this.setState({ drillVisibilit: false, drillDownAllData: [], componentName: null }) }}
              title='下钻'
            >
              <div className={styles.drillBox}>
                {componentName ?
                  <h2>组件名称：{cardDrillDownData.assemName}</h2> : null}
                <Button type='primary' onClick={this.goBack} className={styles.back}
                  disabled={drillDownAllData.length <= 1} style={componentName ? { top: 42 } : {}}>返回</Button>
                {drillVisibilit ?
                  <div>
                    <ChartsComponent drillDown={true} datas={lastValueData.datas}
                      root={this} wrappedComponentRef={e => this.chartDirll = e}></ChartsComponent>
                    <List
                      header={<div><h2>推荐图表</h2> <div>{lastValueData.reFilterName}</div></div>}
                      bordered
                      dataSource={lastValueData.recommList}
                      renderItem={item => (
                        <List.Item className={styles.recommendList} onClick={() => this.recommend(item.codeValue)}>{item.nameValue}</List.Item>
                      )}
                    />
                  </div> : null}
              </div>
            </Modal>

            <Modal
              visible={companyVisible}
              onOk={this.submit}
              onCancel={() => this.setState({ companyVisible: false })}
              title='切换下级机构账号权限'
            >
              <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={this.changeSearch} />
              <Tree
                onExpand={this.onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
                onSelect={this.selectTree}
              >
                {this.loop(treeData)}
              </Tree>
            </Modal>
          </Card>
        </Spin>
      </PageHeaderLayout>
    )
  }
}