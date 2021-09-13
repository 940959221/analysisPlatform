import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, DatePicker, Table, Select, Collapse, message, Checkbox, Modal } from 'snk-web';
import FilterData from '../../PayPredict/components/FilterData';
import ExportJsonExcel from 'js-export-excel';   // 导出excel
import moment from 'moment';

const FormItem = Form.Item;
const { Panel } = Collapse;
const { Option } = Select;
const CheckboxGroup = Checkbox.Group;

@connect(({ analysis, loading, umssouserinfo, global }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
  global
}))
@Form.create()
export default class Monitoring extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      appId: "",
      themeId: "",
      getFilter: 'getUserFilter',
      getFilterAfter: 'getDimensionContent',
      dimensions: [],
      timer: {},      // 记录统计时间
      dataUrl: '',    // 请求的地址
      publicMode: true,                          // 用于判定是否为公共模板
      saveMode: 'saveMode',                      // 保存模板的请求models路径
      editMode: 'queryMode',                      // 编辑模板的请求models路径
      queryMode: 'queryMode',                    // 查询模板的请求models路径
      queryConfigParam: 'queryModeData',         // 查询模板的请求返回数据  
      visual: 'queryModeData',                    // 编辑模板的请求返回数据
      clickMode: true,
      measureName: [],                            // 指标名
      measureCode: [],                            // 指标编号
      measureArr: [],
      checkAll: false,                            // 全选是否选中
      data: [],                                   // 表格数据
      datas_other: [],
      columns: [],                                // 表头
      showTable: false,
      columns_other: [],                           // 第二个表格的表头
      visibilt: false,                            // 是否展示弹窗
    };
  }
  componentWillMount() {
    const { appId, themeId } = this.props.root.state;
    this.setState({ appId, themeId })
  }

  componentDidMount() {
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    // 如果是从公共模板管理点进来的，那就固定显示个人模板，否则的话就根据当前点击切换的是什么模板，后面的也相应换成什么模板
    if (this.props.location.manaIscommon) {
      this.props.dispatch({
        type: 'global/changeClick',
        payload: true
      })
    } else {
      const { global: { publicModeName } } = this.props;
      let publicMode;
      if (publicModeName === '公共') publicMode = false;
      else publicMode = true;
      this.setState({ publicMode })
    }

    const { appId, themeId } = this.state;

    this.props.dispatch({
      type: 'analysis/dimAnalysisMeasures',
      payload: {
        appId, themeId
      }
    }).then(() => {
      const { measure } = this.props.analysis;
      const measureName = [];
      const measureCode = [];
      for (let i of measure) {
        measureName.push(i.attrName);
        measureCode.push(i.attrCode);
      }
      this.setState({ measureName, measureCode })
    })

    this.props.dispatch({
      type: 'analysis/dimAnalysisTheme',
      payload: {
        appId,
      }
    }).then(() => {
      const { getThemeData } = this.props.analysis;
      getThemeData.map((item) => {
        if (item.themeId === themeId) {
          this.setState({ dataUrl: item.urlContent, });
        }
      });
    });

    this.props.dispatch({
      type: 'analysis/getUserInfo'
    }).then(() => {
      const { currentUser, location: { manaIscommon, company_, companyName_ } } = this.props;
      const { queryMode, queryConfigParam } = this.state;
      const { companyCode, companyName } = this.props.analysis.getUserInfoData;
      this.props.dispatch({
        type: `analysis/${queryMode}`,
        payload: {
          man: currentUser.principal.name,
          company: company_ ? company_ : companyCode,
          companyName: companyName_ ? companyName_ : companyName,
          appId,
          themeId,
          manaIscommon: manaIscommon
        }
      }).then(async () => {
        const { commonAnalysisConfig, isPar } = this.props.analysis[queryConfigParam];
        if (!commonAnalysisConfig) return;
        await this.reloadData(this.props.analysis[queryConfigParam], isPar);
        // setTimeout(() => {
        this.submit('图表');
        // }, 400);
      })
    })
  }

  componentWillReceiveProps(props) {
    // 当用户点击菜单栏的编辑公共默认按钮的时候发送请求，如果当前模块为可视化模块则替换当前模块数据
    // 判断条件为控制模块的个人默认和公共默认相互切换，同时没值的时候不执行，设定在SiderMenu.js文件
    const { companyCode, companyName } = this.props.analysis.getUserInfoData;
    if (!companyCode) return;
    if (!this.state.clickMode) return;
    const { editMode, visual, queryMode, queryConfigParam, appId, themeId } = this.state;
    const { currentUser } = this.props;
    let payload, msg, publicMode, route, routeData;
    if (props.global.publicMode === '公共') {
      payload = {
        appId,
        themeId,
        iscommon: '0',
        company: companyCode,
        companyName
      }
      msg = '公共';
      publicMode = false;
      route = editMode;
      routeData = visual;
    } else if (props.global.publicMode === '个人') {
      payload = {
        man: currentUser.principal.name,
        appId,
        themeId,
        company: companyCode,
        companyName
      }
      msg = '个人';
      publicMode = true;
      route = queryMode;
      routeData = queryConfigParam;
    }

    if (props.global.publicMode) {
      this.props.dispatch({
        type: `analysis/${route}`,
        payload
      }).then(() => {
        if (this.props.analysis[routeData].commonAnalysisConfig) {
          const { isPar } = this.props.analysis[routeData];
          this.reloadData(this.props.analysis[routeData], isPar)
          setTimeout(() => {
            this.submit('图表');
          }, 400);
        } else {
          message.warn(`当前${msg}模板没有设置，请重新填写完后点击保存`);
        }
      })

      this.setState({ clickMode: false })
      setTimeout(() => {
        this.setState({ publicMode, clickMode: true })
      }, 300)
    }
  }

  // 数据回显
  reloadData = (data, isPar) => {
    if (data.commonAnalysisConfig !== undefined) {
      const searchData = JSON.parse(data.commonAnalysisConfig);
      const { state, state: { timer, measureArr, measureName, measureCode }, field, filterState, filterField } = searchData;
      const { publicMode } = this.state;

      const { measure } = this.props.analysis;
      const newCode = [];
      const newName = [];
      const newArr = [];
      for (let i of measure) {
        newCode.push(i.attrCode);
        newName.push(i.attrName);
      }
      for (let i of measureArr) {
        const ind = measureName.indexOf(i);
        const oldCode = measureCode[ind];
        const newInd = newCode.indexOf(oldCode);
        newArr.push(newName[newInd]);
      }

      state.measureArr = newArr;
      state.publicMode = publicMode;
      state.measureName = newName;
      state.measureCode = newCode;
      field.measure = newArr;
      this.setState({ ...state });
      delete field.leftTime;
      delete field.rightTime;
      this.props.form.setFieldsValue({
        ...field,
        leftTime: moment(timer.leftTime, 'YYYY-MM-DD'),
        rightTime: moment(timer.rightTime, 'YYYY-MM-DD'),
      })

      this.Filter.setState({ ...filterState, userOnce: true });
      for (let j in filterField) {
        this.Filter.props.form.setFieldsValue({
          [j]: j.slice(0, 9) === 'selectDim' ? [filterField[j][0]] : filterField[j]
        })
      }
      this.Filter.getCascader();
    }
  }

  // 日期选择监听
  pickerChange(e, dateString, name) {
    const { timer } = this.state;
    timer[name] = dateString;
    this.setState({ timer })
  }

  // 生成图表&保存模板
  submit = (type) => {
    this.props.form.validateFields((err, values) => {
      if (err) return;
      const { appId, themeId, dataUrl, timer, saveMode, publicMode } = this.state;
      const { dispatch, currentUser, analysis_ } = this.props;
      const { measure } = this.props.analysis;
      const dimension = [];
      const measures = [];
      const statitime = {
        timeSegment: [
          { leftValue: timer.leftTime, rightValue: timer.rightTime },
        ],
        cycle: values.cycle
      };
      const filter = {};
      const filterDim = this.Filter.state;
      for (let i in values) {
        if (i.indexOf('dimision') >= 0) {
          if (values[i]) {
            dimension.push(values[i])
          }
        }
      }

      if (values.measure.length === 0) {
        message.warn('请至少选择一个指标！');
        return;
      }

      if (dimension.length === 0 && !analysis_) {
        message.warn('请选择一个分析维度！');
        return;
      }

      if (dimension.length > 1) {
        message.warn('只能选择一个分析维度！');
        return;
      }

      for (let i of filterDim.filterData) {
        if (i.length > 0) {
          const filterArr = [];
          for (let k of i) {
            filterArr.push(k.dimValue)
          }
          if (filter[i[0].dimColumn]) filter[i[0].dimColumn] = [...filter[i[0].dimColumn], ...filterArr];
          else filter[i[0].dimColumn] = filterArr;
        }
      }

      for (let i of measure) {
        for (let j of values.measure) {
          if (i.attrName === j) {
            measures.push(i.attrCode);
          }
        }
      }

      if (type === '模板') {
        const filterState = this.Filter.state;

        const { companyCode, companyName } = this.props.analysis.getUserInfoData;
        filterState.cascaderOption = [];
        this.Filter.setState({ userOnce: true });
        const commonAnalysisConfig = {
          state: this.state,
          field: values,
          filterState: this.Filter.state,
          filterField: this.Filter.props.form.getFieldsValue()
        }

        dispatch({
          type: `analysis/${saveMode}`,
          payload: {
            man: currentUser.principal.name,
            company: companyCode,
            companyName,
            themeId,
            appId,
            appName: '综改监控',
            themeName: this.props.name,
            iscommon: publicMode ? '1' : '0',
            commonAnalysisConfig: JSON.stringify(commonAnalysisConfig)
          }
        }).then(() => {
          message.success('保存成功，下次将引用该模板，详细模板管理请在个人设置中的公共模板管理进行操作！')
        }, err => {
          message.warn(err.message);
        })
      } else if (type === '图表') {
        console.log(filter);
        const payload = {
          dataUrl,
          themeId,
          appId,
          dimension,
          customDimension: {},
          filter,
          measure: measures,
          statitime,
          isQuery: '1',
          mainDim: '',
        }
        dispatch({
          type: 'analysis/getMeasureData',
          payload,
        }).then(async () => {
          const { getMeasureData: { content }, measure } = this.props.analysis;
          const data = JSON.parse(content);
          console.log(data);

          const { cycle } = this.props;
          let columns = [
            {
              title: cycle ? '指标' : '分析维度',
              width: 150,
              dataIndex: cycle ? 'measure' : 'x2data',
              align: 'center',
            }
          ];
          let columns_other = JSON.parse(JSON.stringify(columns));    // 这里需要转换再解析，不然会影响下面的
          const dataIndex = {};     // 存储所有指标的对象集合
          let datas = [];
          let datas_other = [];
          let unit;
          let newData;

          if (cycle) {
            for (let i in data) {
              columns.push({
                title: data[i].x2data,
                width: 150,
                dataIndex: data[i].x2data,
                align: 'center',
              })
              columns_other.push({
                title: data[i].x2data,
                width: 150,
                dataIndex: data[i].x2data,
                align: 'center',
              })
              for (let j in data[i]) {
                const obj = {
                  key: i
                }
                const obj_other = {
                  key: i
                }
                for (let k of measure) {
                  if (j !== 'x2data' && j === k.attrCode) {
                    switch (k.unit) {
                      case '0': unit = ''; break;
                      case '2': unit = '(万元)'; break;
                      case '3': unit = '(%)'; break;
                      case '4': unit = '(元)'; break;
                    }
                    switch (unit) {
                      case '': newData = data[i][j]; break;
                      case '(万元)': newData = (data[i][j] / 10000).toFixed(2); break;
                      case '(%)': newData = (data[i][j] * 100).toFixed(2); break;
                      case '(元)': newData = data[i][j]; break;
                    }
                    if (j.indexOf('cur') >= 0) {
                      obj[data[i].x2data] = newData;
                      obj.measure = k.attrName
                    } else if (j.indexOf('accu') >= 0) {
                      obj_other[data[i].x2data] = newData;
                      obj_other.measure = k.attrName + unit;
                    }
                  }
                }
                if (Object.keys(obj).length > 1) datas.push(obj);
                if (Object.keys(obj_other).length > 1) datas_other.push(obj_other);
              }
            }

            const measures = {};
            const measures_other = {};
            for (let i of datas) {
              if (!measures[i.measure]) {
                measures[i.measure] = i;
              } else {
                measures[i.measure] = { ...measures[i.measure], ...i }
              }
            }
            for (let i of datas_other) {
              if (!measures_other[i.measure]) {
                measures_other[i.measure] = i;
              } else {
                measures_other[i.measure] = { ...measures_other[i.measure], ...i }
              }
            }
            datas = [];
            datas_other = [];
            for (let i in measures) {
              measures[i].key = i;
              datas.push(measures[i])
            }
            for (let i in measures_other) {
              measures_other[i].key = i;
              datas_other.push(measures_other[i])
            }
          } else {
            const units = {};     // 需要一个对象来存储指标对应的单位
            function setData(arg) {
              datas = [];
              for (let i in data) {
                const obj = {
                  key: i
                }
                for (let k in data[i]) {
                  if (!dataIndex[k] && k !== 'x2data') {
                    dataIndex[k] = true;
                  }

                  if (arg && k !== 'x2data') {
                    switch (units[k]) {
                      case '': newData = data[i][k]; break;
                      case '(万元)': newData = (data[i][k] / 10000).toFixed(2); break;
                      case '(%)': newData = (data[i][k] * 100).toFixed(2); break;
                      case '(元)': newData = data[i][k]; break;
                    }
                  }
                  if (k === 'x2data') obj[k] = data[i][k];
                  else obj[k] = arg ? newData : data[i][k];
                }
                datas.push(obj);
              }
            }
            setData();
            for (let i in dataIndex) {
              // 业务说这里又要跟指标一样排序，扯淡，下标j要多算一个，不然会少了最左侧排头，然后按下标填空，最后过滤
              for (let j in measure) {
                const val = measure[j];
                j = Number(j) + 1;
                if (i === val.attrCode) {
                  switch (val.unit) {
                    case '0': units[val.attrCode] = ''; break;
                    case '2': units[val.attrCode] = '(万元)'; break;
                    case '3': units[val.attrCode] = '(%)'; break;
                    case '4': units[val.attrCode] = '(元)'; break;
                  }
                  columns[j] = {
                    title: val.attrName + units[val.attrCode],
                    width: 150,
                    dataIndex: i,
                    align: 'center',
                  }
                }
              }
            }
            columns = columns.filter(item => !!item);
            setData(true);      // 这里需要执行第二次，用于根据单位进行换算值
          }

          await this.setState({ showTable: true })
          // 获取表格元素的当前宽度，然后获取所有数据原有的宽度，判定是否让表格左侧固定
          const table = document.getElementsByClassName('ant-table-wrapper');
          for (let i in table) {      // 当前批量处理表格的固定
            if (!parseInt(i) && i !== '0') continue;
            const width = table[i].clientWidth;
            let col;
            if (i === '0') col = columns;
            else col = columns_other;
            const dataWidth = col.length * 150;
            if (dataWidth > width) col[0].fixed = 'left';
          }

          // 因业务需求，在趋势监控中，当期和累计要进行同层比对的一个排序
          let sameArr = [];
          for (let i of datas) {
            datas_other.map(item => {
              if (i.key.split('(')[0] === item.key.split('(')[0]) sameArr.push(item)
            })
          }
          // 如果存在当期和累计不匹配的情况，导致sameArr存入的数据少于datas_other，则在最后补齐数据
          if (sameArr.length < datas_other.length) {
            for (let i of datas_other) {
              for (let j = 0; j < sameArr.length; sameArr++) {
                if (i.key === sameArr[j].key) break;
                if (j === sameArr.length - 1) sameArr.push(i);
              }
            }
          }
          this.setState({ data: datas, columns, columns_other, datas_other: sameArr })
        }, err => {
          message.error(err.message)
        })
      }
    })
  }

  // 选择指标
  changeMeasure = e => {
    const { measure } = this.props.analysis;
    const { appId, themeId, measureArr, measureName } = this.state;
    const isCheck = e.length === measureName.length;    // 是否全选了
    const isindeterminate = e.length > 0 && e.length < measureName.length;    // 是否有选，同时没有全选
    if (measureArr.length <= e.length) {
      const measures = [];
      for (let i of measure) {
        for (let j of e) {
          if (i.attrName === j) measures.push(i.attrCode);
        }
      }
      this.props.dispatch({
        type: 'analysis/getDimensions',
        payload: {
          appId,
          themeId,
          measures
        }
      }).then(() => {
        const { getDimensions } = this.props.analysis;
        this.setState({ dimensions: getDimensions })
      })
    }
    if (e.length === 0) this.setState({ dimensions: [] });
    this.setState({ measureArr: e, checkAll: isCheck, indeterminate: isindeterminate })
  }

  // 点击全选
  changeAllMeasure = async e => {
    const { checked } = e.target;
    const { measureName } = this.state;
    const measureArr = checked ? measureName : [];
    await this.setState({ measureArr, indeterminate: false, checkAll: checked });
    this.props.form.setFieldsValue({ measure: measureArr });
    !checked && this.setState({ dimensions: [] });
    checked && this.changeMeasure(measureArr)
  }

  // 导出数据
  download = () => {
    const { cycle } = this.props;
    if (cycle) this.setState({ visibilt: true });
    else this.downfiles()
  }

  // 导出
  downfiles = (fileArr) => {
    const { columns, data, columns_other, datas_other } = this.state;
    const { name } = this.props;
    const option = {
      datas: [],
      fileName: name
    };
    if (fileArr) {    // 趋势监控，多个表格
      for (let i of fileArr) {
        const dataTable = [];
        let titles = [];
        if (i.indexOf('当期') >= 0) {
          titles = countData(dataTable, titles, columns, data);
          option.datas.push({
            sheetData: dataTable,
            sheetName: '当期值监控表',
            sheetFilter: titles,
            sheetHeader: titles,
          })
        } else {
          titles = countData(dataTable, titles, columns_other, datas_other);
          option.datas.push({
            sheetData: dataTable,
            sheetName: '累计值监控表',
            sheetFilter: titles,
            sheetHeader: titles,
          })
        }
      }
    } else {        // 监管报表，单个表格
      const dataTable = [];
      let titles = [];
      titles = countData(dataTable, titles, columns, data);
      option.datas.push({
        sheetData: dataTable,
        sheetName: 'sheet',
        sheetFilter: titles,
        sheetHeader: titles,
      })
    }

    function countData(dataTable, title, columns, data) {
      for (let i of data) {
        const obj = {};
        for (let j of columns) {
          obj[j.title] = i[j.dataIndex];
          title.push(j.title)
        }
        dataTable.push(obj);
      }
      // 因为是在循环中进行添加，所以有重复，进行去重
      return title.filter((item, index) => title.indexOf(item) === index);
    }

    let toExcel = new ExportJsonExcel(option);
    toExcel.saveExcel();
  }

  // 弹窗点击确定
  ok = async () => {
    const args = this.props.form.getFieldValue('downFiles');
    await this.downfiles(args);
    this.setState({ visibilt: false })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { dimensions, publicMode, checkAll, measureName, indeterminate, showTable, columns, data,
      datas_other, columns_other, visibilt } = this.state;
    const { cycle, analysis_ } = this.props;
    const { getTimePeriodData } = this.props.analysis;
    return (
      <React.Fragment>
        <Collapse defaultActiveKey={['1', '2', '3', '4']}>
          <Panel header={'统计时间' + (cycle ? '和周期' : '')} key="1">
            <FormItem label='统计时间' style={{ display: 'flex' }}>
              {getFieldDecorator('leftTime', {
                rules: [{ required: true, message: '必选' }]
              })(
                <DatePicker placeholder="起始时间" onChange={(e, d) => this.pickerChange(e, d, 'leftTime')} />
              )}
              <span style={{ margin: '0 4px' }}>~</span>
              {getFieldDecorator('rightTime', {
                rules: [{ required: true, message: '必选' }]
              })(
                <DatePicker placeholder="终止时间" onChange={(e, d) => this.pickerChange(e, d, 'rightTime')} />
              )}
            </FormItem>
            {cycle ?
              <FormItem label='统计周期' style={{ display: 'flex' }}>
                {getFieldDecorator('cycle', {
                  rules: [{ required: true, message: '必选' }]
                })(
                  <Select style={{ width: 100 }}>
                    {getTimePeriodData.map(val => {
                      return <Option key={val.periodId} value={val.periodId}>{val.periodName}</Option>
                    })}
                  </Select>
                )}
              </FormItem> : null}
          </Panel>
          <Panel header="数据筛选条件" key="2">
            <FilterData wrappedComponentRef={(form) => this.Filter = form} id={true} root={this}></FilterData>
          </Panel>
          <Panel header="指标" key="3">
            <div>
              <Checkbox
                indeterminate={indeterminate}
                onChange={this.changeAllMeasure}
                checked={checkAll}
              >
                全选
                  </Checkbox>
              {getFieldDecorator('measure', {})(
                <CheckboxGroup options={measureName} onChange={this.changeMeasure} />
              )}
            </div>
          </Panel>
          {!analysis_ ?
            <Panel header="分析维度" key="4">
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {dimensions.map((item, index) => {
                  return (
                    <FormItem key={item.dimTable} label={item.dimTotalName} style={{ display: 'flex', marginRight: 15 }}>
                      {getFieldDecorator(`dimision${index}`)(
                        <Select style={{ width: 150 }} allowClear>
                          {item.tableDesc ? item.tableDesc.map(val => {
                            return <Option key={val.columnValue} value={val.columnValue}>{val.columnName}</Option>
                          }) : null}
                        </Select>
                      )}
                    </FormItem>
                  )
                })}
              </div>
            </Panel> : null}
        </Collapse>

        <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button type="primary" onClick={() => this.submit('图表')}>生成图表</Button>
          </div>
          <div>
            <Button onClick={this.download} disabled={!showTable} style={{ marginRight: 10, }}>导出数据</Button>
            <Button type="primary" style={{ marginRight: 20 }} onClick={() => this.submit('模板')}>
              保存为{publicMode ? '个人模板' : '公共模板'}</Button>
          </div>
        </div>

        {showTable ?
          <div>
            <Table
              columns={columns}
              dataSource={data}
              bordered
              pagination={this.props.paginationProps(data)}
              size="middle"
              title={cycle ? () => {
                return <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>当期值监控表</div>
              } : undefined}
              scroll={{ x: columns.length * 150 }}
            />
            {cycle ?
              <Table
                columns={columns_other}
                dataSource={datas_other}
                bordered
                pagination={this.props.paginationProps(datas_other)}
                style={{ marginTop: 15 }}
                size="middle"
                title={cycle ? () => {
                  return <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>累计值监控表</div>
                } : undefined}
                scroll={{ x: columns_other.length * 150 }}
              /> : null}
          </div> : null}

        {visibilt ?
          <Modal
            visible={visibilt}
            onOk={e => this.ok(e)}
            onCancel={e => { this.setState({ visibilt: false }) }}
            title='下钻设置'>
            <FormItem label='选择导出的表格' style={{ display: 'flex' }}>
              {getFieldDecorator('downFiles', {
                rules: [{ required: true, message: '必选' }]
              })(
                <Select style={{ width: 200 }} mode="multiple">
                  {['当期值监控表', '累计值监控表'].map(item => {
                    return (
                      <Option key={item}>{item}</Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>
          </Modal> : null}
      </React.Fragment>
    );
  }
}
