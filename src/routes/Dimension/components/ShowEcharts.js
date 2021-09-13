import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Spin } from 'snk-web';
// import echarts from 'echarts';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/toolbox';

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class ShowEcharts extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      measureData: props.measureData,
      dataContent: props.dataContent,
      getDimensions: props.getDimensions,
      measureNameCode: props.measureNameCode,
      loading: false,
    }
  }
  componentWillReceiveProps(nextProps) {
    const { dataContent, selectMainDimArr, mainDim } = nextProps;
    let data = [];
    setTimeout(() => {
      if (dataContent.content !== undefined) {
        data = JSON.parse(dataContent.content);
        let xAxisData = [],
          legendData = [],
          seriesDataList = [],
          combineChartSeries = [], // 图表合并的series
          combineLegend = [], // 图表合并的legend
          xAxisMainDimName = '',
          yAxisValue = []; // 合并图表y轴最大区间
        if (selectMainDimArr !== undefined) {
          selectMainDimArr.map((item) => {
            if (item.split('-')[0] === mainDim) {
              xAxisMainDimName = item.split('-')[1];
            }
          })
        }

        if (data !== null && data.length > 0) {
          for (var i = 0; i < data.length; i++) {
            xAxisData.push(data[i].xdata);
            legendData.push(data[i].x2data);
          }
          const legendDataArr = Array.from(new Set(legendData));
          const xAxisDataArr = Array.from(new Set(xAxisData));
          let comListArr = [];
          // 对指标数组循环
          for (let s = 0; s < this.props.measure.length; s++) {
            let listArr = [];
            // 对x2data数组循环 
            for (let a = 0; a < legendDataArr.length; a++) {
              let termArr = [];
              // 对xdata数组循环 
              for (let l = 0; l < xAxisDataArr.length; l++) {
                let isGetData = false
                // 对原始数据循环 
                for (let i = 0; i < data.length; i++) {
                  if (data[i].xdata === xAxisDataArr[l] && data[i].x2data === legendDataArr[a]) {
                    if (data[i][this.props.measure[s]] !== undefined && data[i][this.props.measure[s]] !== null) {
                      termArr.push(data[i][this.props.measure[s]]);
                      isGetData = true;
                    }
                  }
                };

                // 同一个xdata所在的数据里 缺少了哪个x2data 相应的指标补null
                if (isGetData === false) {
                  termArr.push('-');
                }
              }
              listArr.push(termArr);
            };
            comListArr.push(listArr);
          };

          const labelOption = {
            normal: {
              show: false,
              formatter: '{c}  {name|{a}}',
              fontSize: 16,
              rich: {
                name: {
                  textBorderColor: '#fff'
                }
              }
            }
          };
          let legendLength = Array.from(new Set(legendData)).length;
          // 根据指标的数组的长度 设置图形跟legend的距离
          function setTop() {
            if (legendLength < 20) {
              return '80';
            } else if (20 < legendLength < 40) {
              return '160';
            }
          }
          if (this.props.measure.length > 0) {
            for (var i = 0; i < this.props.measure.length; i++) {
              let seriesDataList = [], temp = [], YAxisValueArr = [];
              for (const j in legendDataArr) {
                const list = {
                  name: legendDataArr[j],
                  type: 'bar',
                  barGap: 0,
                  stack: this.props.root.state.isStack ? '总量' : '',
                  label: labelOption,
                  data: comListArr[i][j]
                }
                temp.push(comListArr[i][j]);
                seriesDataList.push(list);
                const measureData = this.props.measureData;
                for (const k in measureData) {
                  if (measureData[k].attrCode === this.props.measure[i]) {
                    const combineList = {
                      name: measureData[k].attrName + '--' + legendDataArr[j],
                      type: i === 0 ? 'bar' : 'line',
                      data: [...comListArr[i][j]],
                      yAxisIndex: i === 0 ? 0 : 1,
                    }
                    combineChartSeries.push(combineList); // 图表合并的series数据
                    combineLegend.push(measureData[k].attrName + '--' + legendDataArr[j]); // 图表合并的legend
                  }
                }
              }
              const option = {
                toolbox: { //可视化的工具箱
                  show: true,
                  orient: 'horizontal',
                  feature: {
                    magicType: {//动态类型切换
                      show: true,
                      type: ['bar', 'line',]
                    },
                    saveAsImage: {},
                    dataView: {
                      readOnly: true,
                      optionToContent: function (opt) {
                        let axisData = opt.xAxis[0].data; //坐标数据
                        let series = opt.series; //折线图数据
                        let tdHeads = `<td  style="padding: 0 10px">${xAxisMainDimName}</td>`; //表头
                        let tdBodys = ''; //数据
                        series.forEach(function (item) {
                          //组装表头
                          tdHeads += `<td style="padding: 0 10px">${item.name}</td>`;
                        });
                        let table = `<table border="1" style="margin-left:20px;border-collapse:collapse;font-size:14px;text-align:center"><tbody><tr>${tdHeads} </tr>`;
                        for (let i = 0, l = axisData.length; i < l; i++) {
                          for (let j = 0; j < series.length; j++) {
                            //组装表数据
                            tdBodys += `<td>${series[j].data[i]}</td>`;
                          }
                          table += `<tr><td style="padding: 0 10px">${axisData[i]}</td>${tdBodys}</tr>`;
                          tdBodys = '';
                        }
                        table += '</tbody></table>';
                        return table;
                      }
                    },
                  }
                },
                tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                    type: 'shadow'
                  },
                },
                legend: {
                  show: Array.from(new Set(legendData)).length > 30 ? false : true,
                  data: Array.from(new Set(legendData)),
                  width: 780,
                  formatter: function (name) {
                    console.log(name);

                    return (name.length > 8 ? (name.slice(0, 8) + "...") : name);
                  }
                },
                // grid: {top: '80'},top: setTop(),
                grid: { top: setTop(), bottom: '100', },
                calculable: true,
                xAxis: [
                  {
                    type: 'category',
                    axisTick: { show: false },
                    data: Array.from(new Set(xAxisData)),
                    axisLabel: {
                      interval: 0,
                      rotate: 40
                    }
                  }
                ],
                yAxis: [{ type: 'value' }],
                series: seriesDataList,
              };
              const _this = this;
              const myEcharts = echarts.init(window.document.getElementById(`${this.props.measure[i]}`));
              myEcharts.setOption(option, true);
              myEcharts.off('click'); // 如果不加上这行代码，那么会出现叠加触发请求
              myEcharts.setOption(option, true);
              myEcharts.on('click', (object) => {
                let xcode = [];
                if (data.length > 0) {
                  data.map((item) => {
                    if (object.name === item.xdata) {
                      xcode.push(item.xcode);
                    }
                  })
                }
                _this.props.root.clickChart(object, [...new Set(xcode)]);
              });

              for (var k = 0; k < temp.length; k++) {
                for (var l = 0; l < temp[k].length; l++) {
                  if (temp[k][l] !== '-') {
                    YAxisValueArr.push(temp[k][l]);
                  }
                }
              }
              yAxisValue.push(YAxisValueArr);
            }
          }
        }

        // 拖拽图形 进行合并
        const measure = this.props.measure;
        if (measure.length > 0 && measure.length === 2) {
          const _this = this;
          let measureName = [];
          let parentNode = document.getElementById('chartBox');
          parentNode.style.height = 900 + 'px';
          measure.forEach(function (i, index) {
            _this.props.measureData.map((item) => {
              if (i === item.attrCode) {
                measureName.push(item.attrName);
              }
            })
            const item = document.getElementById('idNameIs' + i);
            if (item !== null) {
              if (index === 0) {
                item.style.position = 'absolute';
                item.style.top = 0 + 'px';
              } else {
                item.style.position = 'absolute';
                item.style.bottom = 0 + 'px';
              }
              item.addEventListener('mousedown', start);
              function start(e) {
                var e = e || window.event;
                /*记录拖拽前的坐标*/
                item.startY = e.clientY - item.offsetTop;
                document.onmousemove = function (e) {
                  var e = e || window.event;
                  item.style.top = e.clientY - item.startY + "px";
                  /*边界的判断*/
                  if (e.clientY - item.startY < 0) {
                    item.style.top = 0 + "px";
                  }
                  if (e.clientY - item.startY > 420) {
                    item.style.top = 420 + "px";
                  }
                };
                document.onmouseup = function (e) {
                  document.onmousemove = null;
                  document.onmouseup = null;
                  if (index === 0 && item.offsetTop < 220) {
                    item.style.top = 0 + "px";
                  } else if (index === 1 && item.offsetTop > 220) {
                    item.style.top = 440 + "px";
                  } else {
                    _this.props.root.hiddenClickPreDataBtn(); // 隐藏[返回上一层]点击按钮
                    // 图形合并
                    _this.setState({ loading: true });
                    setTimeout(() => {
                      document.getElementById('idNameIs' + measure[0]).style.display = 'none';
                      document.getElementById('idNameIs' + measure[1]).style.display = 'none';
                      _this.setState({ loading: false });
                      const newNode = document.createElement("div");
                      newNode.setAttribute('id', 'newdiv');
                      newNode.style.height = 400 + 'px';
                      parentNode.style.height = 450 + 'px'
                      parentNode.appendChild(newNode);
                      let getGridTop = '10%'
                      const combineLegendLen = combineLegend.length;
                      if (combineLegendLen < 5) {
                        getGridTop = '17%';
                      } else if (combineLegendLen > 4 && combineLegendLen < 9) {
                        getGridTop = '27%';
                      } else if (combineLegendLen > 8 && combineLegendLen < 13) {
                        getGridTop = '37%';
                      }
                      const option = {
                        grid: {
                          top: getGridTop,
                        },
                        tooltip: {
                          trigger: 'axis',
                        },
                        legend: {
                          data: combineLegend.length > 12 ? [] : combineLegend,
                        },
                        xAxis: [
                          {
                            type: 'category',
                            data: Array.from(new Set(xAxisData)),
                            axisPointer: {
                              type: 'shadow'
                            },
                          }
                        ],
                        yAxis: [
                          {
                            type: 'value',
                            name: measureName[0],
                            min: Math.min(...yAxisValue[0]) > 0 ? 0 : Math.min(...yAxisValue[0]),
                            max: Math.max(...yAxisValue[0]) > 0 ? Math.max(...yAxisValue[0]) : 0,
                            splitLine: {
                              show: false
                            }
                          },
                          {
                            type: 'value',
                            name: measureName[1],
                            min: Math.min(...yAxisValue[1]) > 0 ? 0 : Math.min(...yAxisValue[1]),
                            max: Math.max(...yAxisValue[1]) > 0 ? Math.max(...yAxisValue[1]) : 0,
                            splitLine: {
                              show: false
                            }
                          }
                        ],
                        series: combineChartSeries,
                      };
                      const myEcharts = echarts.init(window.document.getElementById(`newdiv`));
                      myEcharts.setOption(option, true);
                      window.onresize = myEcharts.resize;
                    }, 500);
                  }
                }
              }
            }
          }, this)
        }
      }
    }, 100);
  }

  render() {
    const { dataContent } = this.props;
    let content = [];
    if (dataContent.content !== undefined) {
      content = JSON.parse(dataContent.content);
    }
    let divArr = [];
    for (var i = 0; i < this.props.measure.length; i++) {
      let measureName = '';
      this.props.measureData.map((item) => {
        if (this.props.measure[i] === item.attrCode) {
          measureName = item.attrName;
          this.state.measureNameCode[this.props.measure[i]] = measureName;
        }
      })
      const list = (
        <div style={{ marginBottom: 10 }} id={'idNameIs' + this.props.measure[i]} key={this.props.measure[i]}>
          <div style={{ marginLeft: 20 }}>{measureName}</div>
          <div
            id={this.props.measure[i]}
            style={{ width: '100%', minHeight: 400 }}
            key={this.props.measure[i]} />
          <hr style={{ size: 1, color: '#987cb9' }} />
        </div>
      );
      divArr.push(list)
    }
    return (
      <Spin spinning={this.state.loading}>
        <div style={{ marginTop: 20, position: 'relative' }} id='chartBox'>
          {content.length === 0 ? '' : (divArr.length > 0 ? divArr.map(i => { return i }) : '')}
        </div>
      </Spin>
    );
  }
}
