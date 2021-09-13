import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Modal, Tabs, Collapse, Select, Button, Input, message } from 'snk-web';
import Charts from './Component/Chart';
import Line from './Component/Line';
import List from './Component/List';
import Conclusion from './Component/Conclusion';
import ChartComponent from '../../../Datador/component/ChartsComponent';
import { PublicFilter } from '../PublicFilter';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const Option = Select.Option;
const FormItem = Form.Item;

const whiteFont = {
  position: 'absolute',
  left: 0,
  top: 0,
  bottom: 0,
  right: 0,
  color: '#fff',
  height: 60,
  margin: 'auto',
  textAlign: 'center',
  fontSize: 40
}
const chartsPane = [
  { title: '子图表1', content: 'Content of Tab 1', key: 'charts+1', closable: false },
];
const linePane = [
  { title: '基准线1', content: 'Content of Tab 1', key: 'line+1', closable: false },
]
const listPane = [
  { title: '列表1', content: 'Content of Tab 1', key: 'list+1', closable: false },
]

@connect(({ analysis, loading, umssouserinfo }) => ({
  analysis,
  loading: loading,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()
export default class ChartsComponent extends Component {
  newTabIndex = 1;
  state = {
    chartsActiveKey: chartsPane[0].key,
    lineActiveKey: linePane[0].key,
    listActiveKey: listPane[0].key,
    chartsPanes: chartsPane,
    linePanes: linePane,
    listPanes: listPane,
    setName: false,         // 弹窗是否显示
    lastName: '',           // 设置图标组件名称
    nameDisabled: false,    // 设置图标组件名称是否禁用
    qMeasureData: {},       // 图表的数据
    showChart: false,
    saveAs: false,          // 是否另存为
    chartsModel: false,     // 子图表切换顺序弹窗是否显示
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    // 判断用户是否有权限使用地图
    this.props.dispatch({
      type: 'analysis/queryUser',
      payload: {
        usercode: this.props.currentUser.principal.name
      }
    })

    // 组件库点击编辑进行数据回显
    const { id, type } = this.props;
    if (id && type === '图表组件') {
      this.props.dispatch({
        type: 'analysis/graphPreview',
        payload: {
          id
        }
      }).then(async () => {
        const { graphPreviewData: { frontConfig, graphComponentName, file1, file2 } } = this.props.analysis;
        const config = JSON.parse(frontConfig);
        const { chartStateAll, chartValueAll, componentState, conclusion, diffFilterAll, filterAll,
          lineAll, listAll, } = config;
        await this.setState({ ...JSON.parse(componentState), setName: false, lastName: graphComponentName, showChart: false, qMeasureData: {} });

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
        const { chartsPanes, listPanes, chartsActiveKey, listActiveKey } = this.state;
        for (let i in chartsPanes) {
          this.setState({ chartsActiveKey: chartsPanes[i].key })
        }
        for (let i in listPanes) {
          this.setState({ listActiveKey: listPanes[i].key })
        }
        this.setState({ chartsActiveKey, listActiveKey })


        for (let i in chartStateAll) {
          const chartState = JSON.parse(chartStateAll[i]);

          // 处理后续测试提出的问题，针对现有组件回显后添加原始值和日
          const { coordinatesY } = chartState;
          let name1, name2, name3;
          for (let j of coordinatesY) {
            if (j.name === '原始值') name1 = true;
            if (j.name === '日') name2 = true;
            if (j.name === '元') name3 = true;
          }
          if (!name1) coordinatesY.push({ name: '原始值', code: '原始值' });
          if (!name2) coordinatesY.push({ name: '日', code: '日' });
          if (!name3) coordinatesY.push({ name: '元', code: '元' });

          await this[i].setState({ ...chartState });
          this[i].getAllData();
        }
        for (let i in chartValueAll) {
          const fieldValue = JSON.parse(chartValueAll[i]);
          this[i].props.form.setFieldsValue(fieldValue);
          if (file1) {
            for (let j in fieldValue) {
              if (j.indexOf('coordinatesX_Right') >= 0) {
                const left = j.split('coordinatesX_Right')[0] + 'coordinatesX_left';
                if (fieldValue[left].indexOf('company') >= 0) this[i].props.form.setFieldsValue({ [j]: file1 });
              }
            }
          }
        }

        for (let i in filterAll) {
          const filterState = JSON.parse(filterAll[i].split('+')[0]);
          let fieldValue = JSON.parse(filterAll[i].split('+')[1]);
          let { filterData, filterSave, getAllData, selectList } = filterState;

          // 先判定是否需要删除筛选维度中的机构维度，调用公共函数
          if (filterSave.length > 0 && file2 === '1') {
            const newVal = PublicFilter(filterData, filterSave, getAllData, selectList, fieldValue);
            if (newVal) {
              filterData = newVal.filterData;
              filterSave = newVal.filterSave;
              getAllData = newVal.getAllData;
              selectList = newVal.selectList;
              fieldValue = newVal.fieldValue;
            }
          }
          this[i].Filter.setState({ ...filterState, userOnce: true });
          for (let j in fieldValue) {
            this[i].Filter.props.form.setFieldsValue({
              [j]: j.slice(0, 9) === 'selectDim' ? [fieldValue[j][0]] : fieldValue[j]
            })
          }
          this[i].Filter.getCascader();
        }
        for (let i in diffFilterAll) {
          for (let k in diffFilterAll[i]) {
            const diffFilterState = JSON.parse(diffFilterAll[i][k].split('+')[0]);
            let diffFilterValue = JSON.parse(diffFilterAll[i][k].split('+')[1]);
            let { filterData, filterSave, getAllData, selectList } = diffFilterState;

            // 先判定是否需要删除筛选维度中的机构维度，调用公共函数
            if (filterSave.length > 0 && file2 === '1') {
              const newVal = PublicFilter(filterData, filterSave, getAllData, selectList, diffFilterValue);
              if (newVal) {
                filterData = newVal.filterData;
                filterSave = newVal.filterSave;
                getAllData = newVal.getAllData;
                selectList = newVal.selectList;
                diffFilterValue = newVal.fieldValue;
              }
            }
            this[i][k].setState({ ...diffFilterState, userOnce: true });
            for (let j in diffFilterValue) {
              this[i][k].props.form.setFieldsValue({
                [j]: j.slice(0, 9) === 'selectDim' ? [diffFilterValue[j][0]] : diffFilterValue[j]
              })
            }
            this[i][k].getCascader();
          }
        }
        for (let i in lineAll) {
          for (let j in lineAll[i]) {
            this[i][j].setState({ ...JSON.parse(lineAll[i][j].state) });
            this[i][j].props.form.setFieldsValue(JSON.parse(lineAll[i][j].field))
          }
        }
        for (let i in listAll) {
          this[i].setState({ ...JSON.parse(listAll[i].state) });
          this[i].props.form.setFieldsValue(JSON.parse(listAll[i].field));
        }
        const conclusionState = JSON.parse(conclusion).state;
        const conclusionValue = JSON.parse(conclusion).field;
        this.Conclusion.setState({ ...conclusionState });
        this.Conclusion.props.form.setFieldsValue(conclusionValue);
      }, err => {
        if (err.code === 1) {
          message.error(err.message);
          this.props.id = null;
        }
      })
    }
  }

  onChange = (key, type) => {
    switch (type) {
      case 'charts': {
        this.removeLine('one')
        this.setState({ chartsActiveKey: key }); break;
      }
      // case 'line': this.setState({ lineActiveKey: key }); break;
      case 'list': this.setState({ listActiveKey: key }); break;
    }
  };

  onEdit = (targetKey, action, type) => {
    this[action](targetKey);
  };

  add = (e) => {
    const type = e.target.parentNode.parentNode.parentNode.parentNode.getAttribute('data-set');
    const { chartsPanes, linePanes, listPanes } = this.state;
    let activeKey;
    switch (type) {
      case 'charts': {
        if (chartsPanes.length >= 10) {
          message.warn('最多添加10个子图表！');
          return;
        }
        calc.call(this, chartsPanes, 'charts', '子图表');
      }; break;
      case 'list': {
        if (listPanes.length >= 2) {
          message.warn('最多添加2个列表！');
          return;
        }
        calc.call(this, listPanes, 'list', '列表');
      }; break;
    }
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
      if (type === 'charts' && this.props.id) this[activeKey].getAllData(true);
    }
  };

  remove = targetKey => {
    const type = targetKey.split('+')[0];
    const { chartsPanes, linePanes, listPanes, chartsActiveKey, lineActiveKey, listActiveKey } = this.state;
    switch (type) {
      case 'charts': {
        this.removeLine('both', targetKey);
        calc.call(this, chartsPanes, chartsActiveKey, 'charts'); break;
      }
      case 'line': calc.call(this, linePanes, lineActiveKey, 'line'); break;
      case 'list': calc.call(this, listPanes, listActiveKey, 'list'); break;
    }

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

  // 改变子图表的同时清空基准线和列表以及结论的相关维度
  removeLine = (type, charts) => {
    for (let i in this) {
      if (type === 'both' && i.indexOf('list+') >= 0) {
        // 获取当前列表的所有值
        const values = this[i].props.form.getFieldsValue();
        for (let j in values) {
          if (j.indexOf('dimension') >= 0) {    // 找到指标维度
            // 如果指标维度和删除的子图表相同，则清空指标维度，同时清空指标域
            if (values[j] === charts) {
              const paneKey = j.split('dimension')[0];
              this[i].props.form.setFieldsValue({ [j]: undefined, [paneKey + 'space']: undefined })
              this[i].setState({ measureList: [] })
            }
          }
        }
      }
      setTimeout(() => {    // 这边延迟处理，先让上面的逻辑跑完，不然下面的return可能会影响上面
        if (type === 'both') {
          // 先获取到当前删除图表的名字
          const { chartsPanes } = this.state;
          let chartName = '';
          for (let j of chartsPanes) {
            if (j.key === charts) chartName = j.title;
          }
          // 获取相关维度
          const value = this.Conclusion.props.form.getFieldValue('dimension');
          // 如果在智能公式中存在用当前删除图表配置的公式时，则清空所有数据
          for (let j of this.Conclusion.state.formulaNameList) {
            if (j.indexOf(chartName) >= 0) {
              this.Conclusion.props.form.resetFields();
              this.Conclusion.setState({ measureList: [] });
              this.Conclusion.reserve();
              return;
            }
          }
          // 如果相关维度和删除的子图表相同，则清空指标维度，同时清空指标域
          if (value === charts) {
            this.Conclusion.props.form.setFieldsValue({ dimension: undefined, measure: undefined });
            this.Conclusion.setState({ measureList: [] });
          }
        }
      });
    }
  }

  // 该方法为列表和基准线以及结论编辑的子组件调用
  getList = async (comp, charts) => {
    const { chartsActiveKey } = this.state;

    let useChart = chartsActiveKey;     // 使用哪个图表
    if (charts) useChart = charts;

    const { [useChart]: { FilterDiff, state: { filterState, filterDiffState, getFilter, measure, diffArr } } } = this;
    const { filterData, filterSave } = this[useChart].Filter.state;

    const values = this[useChart].props.form.getFieldsValue();
    let measureList = [];

    // 这两个变量用于下面的特殊情况
    let diffCode, diffName;
    let code, name;

    // 根据有多少个指标就配置多少个
    for (let m in measure) {
      let { getUserMeasuresData, styleArr, Y_zhou, beforeData, lineActiveKey, valueList, baodan_Data } = this[useChart].state;

      // 指标code、name拼接
      for (let i in values) {
        if (i.indexOf(measure[m]) >= 0 && i.indexOf('right') >= 0) {
          // 如果没输入就不执行后续
          if (values[i] === undefined) {
            if (comp) {
              // 如果是基准线过来的
              if (comp.indexOf('line') >= 0) {
                const chart = this[useChart];
                // const { lineActiveKey } = chart.state;
                chart[lineActiveKey].setState({ measureList });
              } else this[comp].setState({ measureList });
            }
            return
          };
          code = values[i] + '&';
          diffCode = values[i] + '&';   // 备份一份，如果出现特殊情况，就不需要再次遍历

          // 配置中文
          const chart = this[useChart];
          getUserMeasuresData = getUserMeasuresData.filter(item => {
            if (!!item) return item;
          })
          for (let j of getUserMeasuresData) {
            for (let k of j) {
              if (k.attrCode === values[i]) {
                diffName = k.attrName + '&';   // 备份一份，如果出现特殊情况，就不需要再次遍历
                name = k.attrName + '&';
              }
            }
          }
        }
      }

      if (code) {
        let otherCode = '';
        codeAdd('value');
        codeAdd('style');
        codeAdd('coordinates');
        codeAdd('beforeData');
        codeAdd('baodan');
        function codeAdd(string) {
          const name = useChart + measure[m] + string;
          if (values[name]) {
            otherCode += `-${values[name]}`
          }
        }
        code = code.split('&')[0] + otherCode + '&' + code.split('&')[1];
      }
      if (name) {
        let otherName = '';
        nameAdd('value', valueList[m]);
        nameAdd('style', styleArr);
        nameAdd('coordinates', Y_zhou);
        nameAdd('beforeData', beforeData);
        nameAdd('baodan', baodan_Data);

        if (values[useChart + 'check'] === '1') {
          const showName = useChart + measure[m] + 'show';
          if (values[showName] === '1') otherName += '-显示';
          else otherName += '-不显示';
        }

        function nameAdd(string, arr) {
          const name = useChart + measure[m] + string;
          if (values[name]) {
            for (let j of arr) {
              if (string === 'value') {
                if (j.code === values[name]) otherName += `-${j.name}`;
              } else {
                if (j.code === values[name]) otherName += `-${j.name}`;
              }
            }
          }
        }

        name = name.split('&')[0] + otherName + '&' + name.split('&')[1];
      }

      for (let i in filterSave) {
        if (filterSave[i].children.length > 0) {
          if (Number(i) > 0) code += '/'
          const parent = this.props.analysis[getFilter + 'Data'];
          for (let j of parent) {
            if (filterSave[i].parent[0] === j.dimDesc) code += j.dimTable
          }
          for (let k of filterData[i]) {
            code += ',' + k.dimValue;
            name += k.val + '/';
          }
        }
      }
      measureList.push({ name, code })
    }

    // 差异比较计算函数
    const setFilterDiff = (filterData, filterSave, fieldsValue) => {
      let filter = this[useChart].Filter.state.filterData;
      let save = this[useChart].Filter.state.filterSave;
      // filterData = filterData[0];
      let diffCode = '', diffName = '';
      const addMeasure = [];
      const filterValue = this[useChart].Filter.props.form.getFieldsValue();
      const filterArr = [];
      const fieldsArr = [];
      const newFilterData = [];
      // 这里需要根据筛选维度和差异比较的对比，判定出是否存在遗漏或者位置不同的，如果有则进行处理
      for (let i in filterValue) {
        if (i.indexOf('selectDim') >= 0) filterArr.push(filterValue[i][0]);
      }
      for (let i in fieldsValue) {
        if (i.indexOf('selectDim') >= 0) fieldsArr.push(fieldsValue[i][0]);
      }
      for (let i in filterArr) {
        if (fieldsArr.indexOf(filterArr[i]) >= 0) {
          newFilterData[i] = filterData[fieldsArr.indexOf(filterArr[i])]
        } else newFilterData[i] = null
      }
      console.log(measureList);
      for (let t in measureList) {
        for (let i in filterSave) {
          if (filterSave[i].children.length > 0) {
            // 先获取差异比较是第几个维度
            // 获取第一个指标域，第一个一定是指标1
            const index = diffArr.indexOf(filterSave[i].parent[0]);
            let mainMeasure = measureList[t];
            const filterObj = filter[index];
            for (let j in filterObj) {

              // 取到第一个指标域，更改对应位置的数据
              const firstCode = mainMeasure.code.split('&')[0] + '&';
              const measureArr = mainMeasure.code.split('&')[1].split('/');

              // 循环计算出差异比较对应的code和name
              for (let k in newFilterData) {
                let code = [], name = [];
                if (newFilterData[k]) {
                  for (let o of newFilterData[k]) {
                    name.push(o.val);
                    code.push(o.dimValue);
                  }
                  let splitAll = measureArr[k].split(',');
                  const parentCode = splitAll[0];
                  const codeArr = code;
                  measureArr[k] = parentCode + ',' + codeArr.join(',');
                  // nameArr[k] = name.join('/');
                }
              }
              // 重新计算中文名
              const firstName = mainMeasure.name.split('&')[0] + '&';
              const nameArr = mainMeasure.name.split('&')[1].split('/');
              let newName = '';
              for (let o in save) {
                let hasSave = 0;
                for (let p in filterSave) {
                  if (save[o].parent[0] === filterSave[p].parent[0]) {
                    for (let x of filterData[p]) {
                      newName += `/${x.val}`;
                    }
                    hasSave++;
                  }
                  // 没找到，说明筛选维度的当前维度没有出现在差异比较中，那就需要额外配置
                  if (hasSave === 0) {
                    for (let x of filter[o]) {
                      newName += `/${x.val}`
                    }
                    hasSave = 0;
                  }
                }
              }

              diffCode = firstCode + measureArr.join('/');
              diffName = firstName + newName.slice(1);

              const obj = { name: diffName, code: diffCode };
              mainMeasure = obj;
            }
          }
        }
        addMeasure.push({ name: diffName, code: diffCode })
      }
      return { addMeasure };
    }
    const diffDataArr = [];
    // 如果子图表设置了差异比较
    if (this[useChart].state.modal) {
      for (let i in this[useChart]) {
        if (i.indexOf('FilterDiff') >= 0 && this[useChart][i]) {
          let { filterData, filterSave } = this[useChart][i].state;
          console.log(this[useChart][i].state);
          const fieldsValue = this[useChart][i].props.form.getFieldsValue();
          const { addMeasure } = setFilterDiff(filterData, filterSave, fieldsValue);

          diffDataArr.push(...addMeasure);
        }
      }
    }
    measureList.push(...diffDataArr)
    measureList = measureList.filter((item, index) => {
      let { name, code } = item;
      if (name[name.length - 1] === '/') name = name.slice(0, name.length - 1);
      item.name = name;
      const codeArr = [];
      for (let i of measureList) {
        codeArr.push(i.code);
      }
      return codeArr.indexOf(code) === index;
    })

    if (comp) {
      // 如果是基准线过来的
      if (comp.indexOf('line') >= 0) {
        const chart = this[useChart];
        const { lineActiveKey } = chart.state;
        chart[lineActiveKey].setState({ measureList });
      }
      else {
        this[comp].setState({ measureList });
      }
    }
    else this[useChart].setState({ measureList });
    console.log(measureList);
  }

  // 获取结论编辑
  getConclusion = () => {
    const { state } = this.Conclusion;
    const field = this.Conclusion.props.form.getFieldsValue();
    const { FCodeArr, TName, FName } = state;
    const ConclusionValue = field.textArea;
    if (!ConclusionValue) return { state: undefined, field: undefined, code: undefined };

    const length = ConclusionValue.length;
    let code = '';
    let FIndex = 0;
    let prevString = '';
    for (let i = 0; i < length;) {
      // 如果截取的连续6个字符为时间
      if (ConclusionValue.slice(i, i + 6) === TName) {
        prevAdd();
        code += '#endTime#';
        i += 6;
      } else if (ConclusionValue.slice(i, i + 6) === FName) {
        prevAdd();
        code += `#${FCodeArr[FIndex]}#`;
        FIndex++;
        i += 6
      } else {
        prevString += ConclusionValue[i];
        i++
      }
    }
    prevAdd();
    function prevAdd() {
      if (prevString !== '') {
        code += `#${prevString}#`;
        prevString = '';
      }
    }
    return { state, field, code };
  }

  // 点击保存
  clickSave = async (e, saveAs) => {
    let isOK = true;
    let chartName = '';
    for (let i in this) {
      if (i.indexOf('charts+') >= 0 && this[i]) {
        this[i].props.form.validateFields((err, values) => {
          if (err) {
            isOK = false;
            chartName = '子图表' + i.split('charts+')[1];
          }
        })
      }
    }
    if (!isOK) {
      message.warn(`请把${chartName}中的必选项填完！`);
      return;
    };
    await this.setState({ setName: true });
    // 这个值只有回显的时候才会赋值
    if (this.state.lastName) {
      this.setState({ nameDisabled: true });
      this.props.form.setFieldsValue({ name: this.state.lastName })
    }
    if (saveAs) this.setState({ saveAs: true });
    else this.setState({ saveAs: false });
  }

  // 点击保存
  save = () => {
    this.props.form.validateFields(async (err, values) => {
      if (err) return;

      if (values.name.indexOf('-') < 0) {
        message.warn('请检查组件名称是否按红字提示填写！');
        return;
      }
      const { chartsPanes, listPanes, saveAs } = this.state;
      const { state, field, code } = this.getConclusion();     // 结论编辑
      const chartsPanesLength = chartsPanes.length;
      const listPanesLength = listPanes.length;
      const subGraph = [];
      // 储存所有组件的状态和field值
      const componentState = this.state;
      const chartStateAll = {};
      const chartValueAll = {};
      const filterAll = {};
      const diffFilterAll = {};
      const lineAll = {};
      const listAll = {};
      const conclusion = { state, field };
      const accountedObj = {};
      let referMeasure = '';
      // 根据子图表数量循环
      for (let j = 0; j < chartsPanesLength; j++) {
        await this.getList(chartsPanes[j].key, chartsPanes[j].key);
        const chart = this[chartsPanes[j].key];
        const { key } = chartsPanes[j];
        const chartValue = chart.props.form.getFieldsValue();
        const chartState = chart.state;
        const { modal, measureList, getUserMeasuresData, accounted, getUserFilterDataZ } = chartState;
        const firstMeasure = chartState.measure[0];
        const filter = [];
        let measureCode = chartValue[key + firstMeasure + 'right'];

        console.log(measureList);
        if (modal && measureList[measureList.length - 1].code === '') {
          message.warn('差异比较存在问题，请先删除比较重新进行差异比较！');
          return;
        }

        for (let i in chartValue) {
          if (i.indexOf('指标') >= 0 && i.indexOf('right') >= 0) {
            referMeasure += `${chartValue[i]},`
          }
        }

        // 查找所有指标中占比的指标
        for (let i of getUserMeasuresData) {
          for (let k of i) {
            if (k.propFlag === '1') {
              accountedObj[k.attrCode] = true;
            }
          }
        }

        // 配置指标名称和code
        let measureName, factTable;
        for (let i of getUserMeasuresData[0]) {
          if (i.attrCode === measureCode) {
            measureName = i.attrName;
            measureCode = i.urlId + measureCode;
            factTable = i.factTable;
          }
        }
        // 配置过滤维度
        const filterDim = chart.Filter.state;
        // console.log(filterDim);
        for (let i of filterDim.filterData) {
          if (i.length > 0) {
            const filterArr = [];
            for (let k of i) {
              filterArr.push(k.dimValue)
            }
            let ind;
            for (let l in filter) {
              if (filter[l][i[0].dimColumn]) ind = l;
            }
            if (ind) filter[ind][i[0].dimColumn] = [...filter[ind][i[0].dimColumn], ...filterArr];
            else filter.push({ [i[0].dimColumn]: filterArr })
            // if (filter[i[0].dimColumn]) filter[i[0].dimColumn] = [...filter[i[0].dimColumn], ...filterArr];
            // else filter[i[0].dimColumn] = filterArr;
          }
        }
        // 比较维度
        let compareFilter = undefined;
        if (modal) {
          compareFilter = [];
          for (let t in chart) {
            if (t.indexOf('FilterDiff') >= 0 && chart[t]) {
              const filterObj = [];
              const filterDiffDim = chart[t].state;
              for (let i of filterDiffDim.filterData) {
                if (i.length > 0) {
                  const filterDiffArr = [];
                  let ind;
                  for (let k of i) {
                    filterDiffArr.push(k.dimValue)
                  }
                  for (let l in filterObj) {
                    if (filterObj[l][i[0].dimColumn]) ind = l;
                  }
                  if (ind) filterObj[ind][i[0].dimColumn] = [...filterObj[ind][i[0].dimColumn], ...filterDiffArr];
                  else filterObj.push({ [i[0].dimColumn]: filterDiffArr })
                  // if (filterObj[i[0].dimColumn]) filterObj[i[0].dimColumn] = [...filterObj[i[0].dimColumn], ...filterDiffArr];
                  // else filterObj[i[0].dimColumn] = filterDiffArr;
                }
              }
              compareFilter.push(filterObj);
            }
          }
        }
        // 其他指标
        let otherMeasure = undefined;
        if (chartState.measure.length > 1) {
          otherMeasure = [];

          for (let i in chartState.measure.slice(1)) {
            const value = chartState.measure.slice(1)[i];
            let otherCode = chartValue[key + value + 'right'];
            let otherName, otherFactTable;
            for (let k of getUserMeasuresData.slice(1)[i]) {
              if (k.attrCode === otherCode) {
                otherName = k.attrName;
                otherCode = k.urlId + otherCode;
                otherFactTable = k.factTable;
              }
            }
            otherMeasure.push({
              yAxis: chartValue[key + value + 'coordinates'],
              measureCode: otherCode,
              factTable: otherFactTable,
              dataSource: 'kylin',
              themeId: chartValue[key + value + 'left'],
              measureDomainName: measureList[Number(i) + 1].name,
              style: chartValue[key + value + 'style'],
              measureDomainCode: measureList[Number(i) + 1].code,
              measureName: otherName,
              valueType: chartValue[key + value + 'value'],
              contemporaneousDataType: chartValue[key + value + 'beforeData'],
              spltimeType: chartValue[key + value + 'baodan'],
              isShow: chartValue[key + value + 'show'],
              cycle: chartValue[key + 'timeType']
              // timeType: chartValue[key + value + 'statisticsType'] + chartValue[key + 'timeType'],
            })
          }
        }
        // 基准线
        let baseline = undefined, mapColor = undefined, pieChartColor = undefined;
        if (chartValue[key + 'check'] === '1') {
          const { linePanes } = chartState;
          baseline = [];
          lineAll[key] = {};  // 准备给基准线配状态和field
          for (let i = 0; i < linePanes.length; i++) {
            const line = chart[linePanes[i].key];
            const lineKey = linePanes[i].key;
            const lineValue = line.props.form.getFieldsValue();
            lineAll[key][lineKey] = {
              state: JSON.stringify(line.state),
              field: JSON.stringify(lineValue)
            }
            baseline.push({
              colour: lineValue[lineKey + 'color'],
              yAxis: lineValue[lineKey + 'coordinates'],
              style: lineValue[lineKey + 'style'],
              value: lineValue[lineKey + 'value']
            })
          }
        }
        // 地图
        else if (chartValue[key + 'check'] === '2') {
          const { mapSpace } = chartState;
          mapColor = [];
          for (let i of mapSpace) {
            mapColor.push({
              style: i.color,
              minValue: chartValue['map' + i.name + 'left'],
              maxValue: chartValue['map' + i.name + 'right'],
            })
          }
        }
        // 饼图
        else {
          const { pieSpace } = chartState;
          pieChartColor = {
            isCustomize: chartValue[key + 'pieUseColor'],
            customizeColor: []
          };
          for (let i of pieSpace) {
            pieChartColor.customizeColor.push({
              style: i.color,
              minValue: chartValue['pie' + i.name + 'left'],
              maxValue: chartValue['pie' + i.name + 'right'],
            })
          }
        }
        // 占比维度名
        let accountedName;
        let accountedValue;
        if (accounted) {
          accountedValue = chartValue[key + 'check'] === '1' ?
            chartValue[key + 'coordinatesZ_left'] : chartValue[key + firstMeasure + 'pieDimensionZ_left'];

          for (let i of getUserFilterDataZ) {
            if (i.dimTable === accountedValue) accountedName = i.dimDesc;
          }
        }

        // 调用measureList的配置方法，配置出一组数据
        subGraph.push({
          factTable,
          subGraphName: chartValue[key + 'title'],
          graphType: chartValue[key + 'check'],
          isShow: chartValue[key + firstMeasure + 'show'],
          measureDomainCompareCode: modal ? measureList[measureList.length - 1].code : undefined,
          otherMeasure,
          percentageColumn: accountedValue,
          percentageTableColumn: accounted ? (chartValue[key + 'check'] === '1' ?
            chartValue[key + 'coordinatesZ_Right'] : chartValue[key + firstMeasure + 'pieDimensionZ_right']) : undefined,
          percentageName: accountedName,
          dataSource: 'kylin',
          valueType: chartValue[key + firstMeasure + 'value'],
          contemporaneousDataType: chartValue[key + firstMeasure + 'beforeData'],
          spltimeType: chartValue[key + firstMeasure + 'baodan'],
          xDim: chartValue[key + 'check'] === '1' ?
            chartValue[key + 'coordinatesX_left'] : chartValue[key + firstMeasure + 'pieDimension_left'],
          themeId: chartValue[key + firstMeasure + 'left'],
          cycle: chartValue[key + 'timeType'],
          // timeType: chartValue[key + firstMeasure + 'statisticsType'] + chartValue[key + 'timeType'],
          // statiType: chartValue[key + firstMeasure + 'statisticsType'],
          y1Unit: chartValue[key + 'coordinatesY1'],
          measureDomainName: measureList[0].name,
          baseline,
          isList: chartValue[key + firstMeasure + 'show'],
          measureDomainCode: measureList[0].code,
          measureName,
          filter,
          yAxis: chartValue[key + firstMeasure + 'coordinates'],
          measureCode,
          measureDomainCompareName: modal ? measureList[measureList.length - 1].name : undefined,
          compareFilter,
          percentagefilter: accounted ? (chartValue[key + 'check'] === '1' ?
            (chartValue[key + 'coordinatesZ_second'] && chartValue[key + 'coordinatesZ_second'].length > 0 ?
              chartValue[key + 'coordinatesZ_second'] : undefined) :
            (chartValue[key + firstMeasure + 'pieDimensionZ_second'] && chartValue[key + firstMeasure + 'pieDimensionZ_second'].length > 0 ?
              chartValue[key + firstMeasure + 'pieDimensionZ_second'] : undefined)) : undefined,
          style: chartValue[key + firstMeasure + 'style'],
          subGraphCode: 'subGraph' + (j + 1),
          y2Unit: chartValue[key + 'coordinatesY2'],
          dimColumn: chartValue[key + 'check'] === '1' ?
            chartValue[key + 'coordinatesX_Right'] : chartValue[key + firstMeasure + 'pieDimension_right'],
          mapColor,
          pieChartColor,
        })

        // 循环最后给回显需要的数据配值

        const filterState = chart.Filter.state;
        const filterForm = chart.Filter.props.form.getFieldsValue();
        diffFilterAll[key] = {};
        if (chart.FilterDiff) {
          for (let i in chart) {
            if (i.indexOf('FilterDiff') >= 0 && chart[i]) {
              const diffFilterstate = chart[i].state;
              const diffFilterForm = chart[i].props.form.getFieldsValue();
              diffFilterstate.cascaderOption = [];
              chart[i].setState({ userOnce: true });
              diffFilterAll[key][i] = JSON.stringify(diffFilterstate) + '+' + JSON.stringify(diffFilterForm);
            }
          }
        }
        filterState.cascaderOption = [];
        chart.Filter.setState({ userOnce: true });
        chartStateAll[key] = JSON.stringify(chartState);
        chartValueAll[key] = JSON.stringify(chartValue);
        filterAll[key] = JSON.stringify(filterState) + '+' + JSON.stringify(filterForm);
      }

      // 列表
      const list = [];
      for (let j = 0; j < listPanesLength; j++) {
        const list_ = this[listPanes[j].key];
        const { key } = listPanes[j];
        const listValue = list_.props.form.getFieldsValue();
        const number = listValue[key + 'dimension'] ? Number(listValue[key + 'dimension'].split('+')[1]) : undefined;
        const listState = list_.state;
        const measureCode = listValue[key + 'space'] ? listValue[key + 'space'].split('+')[0] : undefined;

        listAll[key] = {
          state: JSON.stringify(listState),
          field: JSON.stringify(listValue)
        }
        list.push({
          minValue: listValue[key + 'rank_left'],
          maxValue: listValue[key + 'rank_right'],
          valueType: listValue[key + 'range'],
          name: listValue[key + 'title'],
          measureDomainCode: listValue[key + 'space'],
          subGraphCode: number ? 'subGraph' + number : undefined,
          propFlag: accountedObj[measureCode] ? '1' : '0'
        })
      }

      const frontConfig = {
        componentState: JSON.stringify(componentState),
        chartStateAll,
        chartValueAll,
        filterAll,
        diffFilterAll,
        lineAll,
        listAll,
        conclusion: JSON.stringify(conclusion),
      }

      const payload = {
        graphComponentName: values.name,
        referMeasure,
        chartConfigs: {
          config: {
            subGraph,
            comment: code,
            list
          }
        },
        frontConfig: JSON.stringify(frontConfig)
      }

      this.setState({ qMeasureData: {} });    // 先修改状态，有数据返回的时候再重新渲染
      // 如果是回显数据，则修改，否则新建
      const { id, type } = this.props;
      if (id && type === '图表组件' && !saveAs) {
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
            // console.log(Object.keys(qMeasureDataData.subGraphs.subGraph2.measureInfos));

            const showChart = qMeasureDataData.id ? true : false;
            this.setState({ qMeasureData: qMeasureDataData, showChart });
          })
        }, err => {
          message.error(err.message);
        })
      }
      this.setState({ saveAs: false })

      console.log(payload)
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
    // const { id, type } = this.props.location;
    const { getFieldDecorator } = this.props.form;
    const { showLine } = this.props.analysis;
    const { chartsPanes, chartsActiveKey, linePanes, lineActiveKey, listPanes, listActiveKey, chartsModel,
      setName, nameDisabled, qMeasureData, showChart } = this.state;
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
                  <Charts wrappedComponentRef={e => this[pane.key] = e} root={this} pane={pane}></Charts>
                </TabPane>
              ))}
            </Tabs>
          </Panel>

          <Panel header="列表" key="4">
            <Tabs
              data-set='list'
              type="editable-card"
              onChange={e => this.onChange(e, 'list')}
              activeKey={listActiveKey}
              onEdit={(targetKey, action) => this.onEdit(targetKey, action, 'list')}
            >
              {listPanes.map(pane => (
                <TabPane tab={pane.title} key={pane.key} closable={pane.closable}>
                  <List wrappedComponentRef={e => this[pane.key] = e} root={this} pane={pane}></List>
                </TabPane>
              ))}
            </Tabs>
          </Panel>

          <Panel header="结论编辑" key="5">
            <Conclusion wrappedComponentRef={e => this.Conclusion = e} root={this}></Conclusion>
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
          <div style={{ color: 'red' }}>*基准线、列表和结论编辑为非必选项，如果基准线和列表的内容填写不完整将不会展示</div>
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
    );
  }
}
