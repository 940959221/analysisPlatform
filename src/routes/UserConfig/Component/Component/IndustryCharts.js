import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Modal, Tabs, Collapse, Select, Button, Input, message } from 'snk-web';
import Industry from './Component/Industry';
import ChartComponent from '../../../Datador/component/ChartsComponent';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;

const chartsPane = [
  { title: '子图表1', content: 'Content of Tab 1', key: 'charts+1', closable: false },
];

@connect(({ analysis, loading, umssouserinfo }) => ({
  analysis,
  loading: loading,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()
export default class IndustryCharts extends Component {
  state = {
    chartsActiveKey: chartsPane[0].key,
    chartsPanes: chartsPane,
    setName: false,         // 弹窗是否显示
    lastName: '',           // 设置图标组件名称
    nameDisabled: false,    // 设置图标组件名称是否禁用
    qMeasureData: {},       // 图表的数据
    showChart: false,
    saveAs: false,          // 是否另存为
    chartsModel: false,     // 子图表切换顺序弹窗是否显示
  }

  componentDidMount() {
    // 判断用户是否有权限使用地图
    this.props.dispatch({
      type: 'analysis/queryUser',
      payload: {
        usercode: this.props.currentUser.principal.name
      }
    })

    // 组件库点击编辑进行数据回显
    const { id, type } = this.props;
    if (id && type === '行业数据图表') {
      this.props.dispatch({
        type: 'analysis/graphPreview',
        payload: {
          id
        }
      }).then(async () => {
        const { graphPreviewData: { frontConfig, graphComponentName } } = this.props.analysis;
        const config = JSON.parse(frontConfig);
        console.log(this.props.analysis.graphPreviewData);
        console.log(JSON.parse(this.props.analysis.graphPreviewData.chartConfigs));

        const { chartStateAll, chartValueAll, componentState } = config;
        await this.setState({ ...JSON.parse(componentState), setName: false, lastName: graphComponentName, qMeasureData: {} })

        // 如果有id，带着id去获取图表数据
        this.props.dispatch({
          type: 'analysis/qMeasureData',
          payload: {
            id
          }
        }).then(() => {
          const { qMeasureDataData } = this.props.analysis;
          const showChart = qMeasureDataData.id ? true : false;
          this.setState({ qMeasureData: qMeasureDataData, showChart })
        })

        // 把子图表和列表全部走一遍，渲染出所有的子图表和列表，之后再回到本应该打开的位置
        const { chartsPanes, chartsActiveKey } = this.state;
        for (let i in chartsPanes) {
          this.setState({ chartsActiveKey: chartsPanes[i].key })
        }
        this.setState({ chartsActiveKey })


        for (let i in chartStateAll) {
          const chartState = JSON.parse(chartStateAll[i]);
          await this[i].setState({ ...chartState });
        }
        for (let i in chartValueAll) {
          this[i].props.form.setFieldsValue(JSON.parse(chartValueAll[i]));
        }
      })
    }
  }

  onEdit = (targetKey, action, type) => {
    this[action](targetKey);
  };

  onChange = (key, type) => {
    this.setState({ chartsActiveKey: key });
  };

  add = (e) => {
    const { chartsPanes } = this.state;
    let activeKey;
    if (chartsPanes.length >= 10) {
      message.warn('最多添加10个子图表！');
      return;
    }
    // this.removeLine('both');
    calc.call(this, chartsPanes, 'charts', '子图表');

    async function calc(list, type, name) {
      const newPanes = [...list];
      const nowList = list.sort((a, b) => a.key.split('+')[1] - b.key.split('+')[1]);
      const number = Number(nowList[nowList.length - 1].title.split(name)[1]) + 1;
      activeKey = type + '+' + number;

      newPanes.push({ title: name + number, content: 'Content of new Tab', key: activeKey });
      await this.setState({
        [type + 'Panes']: newPanes,
        [type + 'ActiveKey']: activeKey,
      });

      // 在数据回显的时候避开了很多数据请求，导致在回显后重新添加子图表也会因为是回显数据无法请求数据，这里在新增图表的时候调用接口
      // if (type === 'charts' && this.props.id) this[activeKey].getAllData(true);
    }
  };

  remove = targetKey => {
    const { chartsPanes, chartsActiveKey } = this.state;
    calc.call(this, chartsPanes, chartsActiveKey, 'charts');

    function calc(list, key, name) {
      let newActiveKey = key;
      let lastIndex;
      list.forEach((pane, i) => {
        if (pane.key === targetKey) {
          lastIndex = i - 1;
        }
      });
      const newPanes = list.filter(pane => pane.key !== targetKey);
      if (newPanes.length && newActiveKey === targetKey) {
        if (lastIndex >= 0) {
          newActiveKey = newPanes[lastIndex].key;
        } else {
          newActiveKey = newPanes[0].key;
        }
      }
      this.setState({
        [name + 'Panes']: newPanes,
        [name + 'ActiveKey']: newActiveKey,
      });
    }
  };

  // 点击保存
  clickSave = async (e, saveAs) => {
    let isOK = true;
    for (let i in this) {
      if (i.indexOf('charts+') >= 0 && this[i]) {
        this[i].props.form.validateFields((err, values) => {
          if (err) isOK = false;
        })
      }
    }
    if (!isOK) {
      message.warn('请把所有子图表中的必选项填完！');
      return;
    };
    await this.setState({ setName: true });
    // 这个值只有回显的时候才会赋值
    if (this.state.lastName) {
      this.setState({ nameDisabled: true });
      this.props.form.setFieldsValue({ name: this.state.lastName })
    }
    if (saveAs) this.setState({ saveAs: true })
  }

  // 点击保存
  save = () => {
    this.props.form.validateFields(async (err, values) => {
      if (err) return;

      if (values.name.indexOf('-') < 0) {
        message.warn('请检查组件名称是否按红字提示填写！');
        return;
      }
      const { chartsPanes, saveAs } = this.state;
      const chartsPanesLength = chartsPanes.length;
      const subGraph = [];
      // 储存所有组件的状态和field值
      const componentState = this.state;
      const chartStateAll = {};
      const chartValueAll = {};

      for (let j = 0; j < chartsPanesLength; j++) {
        const chart = this[chartsPanes[j].key];
        const { key } = chartsPanes[j];
        const chartValue = chart.props.form.getFieldsValue();
        const chartState = chart.state;

        const mapColor = [];
        for (let i in chart.state.mapSpace) {
          const value = chart.state.mapSpace[i];
          mapColor.push({
            style: value.color,
            minValue: chartValue['mapLeft' + i],
            maxValue: chartValue['mapRight' + i],
          })
        }
        subGraph.push({
          sql: chartValue[key + 'sql'],
          subGraphName: chartValue[key + 'title'],
          graphType: chartValue[key + 'chartType'],
          isShow: '1',
          selectParam: chartValue[key + 'required'],
          y1Unit: chartValue[key + 'y1'],
          y2Unit: chartValue[key + 'y2'],
          yAxis: '1',
          style: chartValue[key + 'style'],
          subGraphCode: 'subGraph' + (j + 1),
          mapColor
        })

        chartStateAll[key] = JSON.stringify(chartState);
        chartValueAll[key] = JSON.stringify(chartValue);
      }
      const frontConfig = {
        componentState: JSON.stringify(componentState),
        chartStateAll,
        chartValueAll,
      }

      const payload = {
        graphComponentName: values.name,
        chartConfigs: {
          config: {
            subGraph,
          }
        },
        sqlType: '2',
        frontConfig: JSON.stringify(frontConfig)
      }

      this.setState({ qMeasureData: {} });    // 先修改状态，有数据返回的时候再重新渲染

      // 如果是回显数据，则修改，否则新建
      const { id, type } = this.props;
      if (id && type === '行业数据图表' && !saveAs) {
        this.props.dispatch({
          type: 'analysis/updateGraph',
          payload: { ...payload, id }
        }).then(() => {
          message.success('修改成功，可在上面图表中查看！');
          this.setState({ setName: false });
          const { graphChartId } = this.props.analysis;
          this.props.dispatch({
            type: 'analysis/qMeasureData',
            payload: {
              id: graphChartId
            }
          }).then(() => {
            const { qMeasureDataData } = this.props.analysis;
            const showChart = qMeasureDataData.id ? true : false;
            this.setState({ qMeasureData: qMeasureDataData, showChart })
          })
        }, err => {
          message.error(err.message);
        })
      } else {
        this.props.dispatch({
          type: 'analysis/createGraph',
          payload
        }).then(() => {
          message.success('保存成功，可在上面图表中查看！');
          this.setState({ setName: false })
          const { graphChartId } = this.props.analysis;
          this.props.dispatch({
            type: 'analysis/qMeasureData',
            payload: {
              id: graphChartId
            }
          }).then(() => {
            const { qMeasureDataData } = this.props.analysis;
            const showChart = qMeasureDataData.id ? true : false;
            this.setState({ qMeasureData: qMeasureDataData, showChart })
          })
        }, err => {
          message.error(err.message);
        })
      }
      this.setState({ saveAs: false })
    })
  }

  // 点击切换子图表顺序
  changeCharts = async () => {
    const { chartsPanes } = this.state;
    const titles = [];
    for (let i of chartsPanes) {
      titles.push(i.title)
    }
    await this.setState({ chartsModel: true });
    this.props.form.setFieldsValue({ chartsIndex: titles })
  }

  // 点击切换子图表顺序弹窗后确定
  setChartsIndex = () => {
    const { chartsPanes } = this.state;
    const value = this.props.form.getFieldsValue().chartsIndex;

    if (!value || value.length !== chartsPanes.length) {
      message.warn('请把所有子图表都选上！');
      return;
    }
    const newPanes = value.map(item => {
      for (let i of chartsPanes) {
        if (item === i.title) return i;
      }
    })
    console.log(newPanes);
    this.setState({ chartsPanes: newPanes, chartsModel: false });
  }

  render() {
    const { chartsActiveKey, chartsPanes, setName, nameDisabled, qMeasureData, showChart, chartsModel } = this.state;
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
        <Collapse defaultActiveKey={['1', '2', '3', '4', '5']}>
          <Panel header="图表" key="1">
            {
              showChart ?
                <ChartComponent datas={qMeasureData} wrappedComponentRef={e => this.chartComponent = e}></ChartComponent> :
                <div></div>
            }
          </Panel>

          <Panel header="子图表" key="2">
            <Tabs
              data-set='charts'
              type="editable-card"
              onChange={e => this.onChange(e, 'charts')}
              activeKey={chartsActiveKey}
              onEdit={(targetKey, action) => this.onEdit(targetKey, action, 'charts')}
            >
              {chartsPanes.map(pane => (
                <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                  <Industry wrappedComponentRef={e => this[pane.key] = e} root={this} pane={pane}></Industry>
                </TabPane>
              ))}
            </Tabs>
          </Panel>
        </Collapse>
        <div style={{ marginTop: 15, display: 'flex', flexDirection: 'row-reverse' }}>
          <Button onClick={this.clickSave} type='primary'>保存</Button>
          <Button onClick={e => this.clickSave(e, true)} type='primary' style={{ marginRight: 15 }}>另存为</Button>
        </div>
        <Button onClick={this.changeCharts} type='primary' style={{ position: 'fixed', right: 0, top: '50%' }}>切换子图表顺序</Button>

        <Modal
          visible={setName}
          onOk={e => this.save(e)}
          onCancel={e => { this.setState({ setName: false, saveAs: false }) }}
          title='图表名称'
        >
          <FormItem label="设置图表组件名称" style={{ display: 'flex' }}>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '必选' }]
            })(
              <Input style={{ width: 200 }} />
            )}
          </FormItem>
          <div style={{ color: 'red' }}>
            *组件名称中至少输入一个‘-’，‘-’后面的内容用做图表展示时的名称，只取最后一个‘-’后面文本</div>
        </Modal>
        <Modal
          visible={chartsModel}
          onOk={e => this.setChartsIndex()}
          onCancel={e => this.setState({ chartsModel: false })}
          title='切换子图表顺序'
        >
          <FormItem label='选择子图表的顺序' style={{ display: 'flex' }}>
            {getFieldDecorator('chartsIndex')(
              <Select mode='multiple' style={{ width: 200 }}>
                {chartsPanes.map(item => {
                  return (
                    <Option key={item.title}>{item.title}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
        </Modal>
      </div>
    )
  }
}