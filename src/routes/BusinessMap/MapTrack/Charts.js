import { message } from 'snk-web';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/markLine';
import 'echarts/theme/macarons';

const Charts = {
  // 折线图
  // 参数解释：i--DOM元素，data--数据，code--当前选择的指标编码，line--基准线，colors--选择色彩，toolbox-是否使用图表工具
  setLine: (i, data, code, type, line, colors, toolbox, moreLine) => {
    // console.log(i, data, code, type, line, colors, toolbox, moreLine);
    let year;
    let mychart = echarts.init(i, 'macarons');
    const xData = [], value = [], lineArr = [], color = [], value1 = [], value2 = [], dataTitle = [];
    const unit = type.slice(1, -1);
    if (moreLine) {
      dataTitle.push('实际值（生效时间起始）', '方案值')
      for (let k in data[moreLine]) {
        if (k === 'effectTime') {
          for (let j of data[moreLine][k]) {
            xData.push(j.dataDate);
            if (j[code]) {
              if (unit === '%') value.push((j[code] * 100).toFixed(2));
              else value.push(j[code])
            } else value.push('0.00');

            for (let l of data.mockstart.mock) {
              if (l[code]) {
                if (unit === '%') value2.push((l[code] * 100).toFixed(2));
                else value2.push(l[code])
              } else value2.push('0.00');
            }
          }
        } else if (k.length === 4 && moreLine === 'startdate') {
          year = k;
          dataTitle.push(`实际值（保单年度起始）${year}`)
          for (let o of data[moreLine][k]) {
            if (o[code]) {
              if (unit === '%') value1.push((o[code] * 100).toFixed(2));
              else value1.push(o[code])
            } else value1.push('0.00');
          }
        }
      }
    } else {
      for (let j of data) {
        xData.push(j.dataDate);
        if (j[code]) {
          if (unit === '%') value.push((j[code] * 100).toFixed(2));
          else value.push(j[code])
        } else value.push('0.00')
      }
    }
    if (line) {
      for (let i of line) {
        lineArr.push({ yAxis: i.split('-')[1] })
      }
    }
    if (colors) {
      for (let i of colors) {
        color.push(i.key.split('+')[2]);
      }
    }

    const option = {
      xAxis: {
        type: 'category',
        data: xData.reverse()
      },
      yAxis: [
        {
          type: 'value',
          name: unit,
        }
      ],
      legend: moreLine ? {
        data: dataTitle,
        // textStyle: {
        //     color: '#B4B4B4'
        // },
        top: '5%',
      } : null,
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: function (params) {
          var str = "";
          for (var i = 0; i < params.length; i++) {
            if (params[i].seriesName !== "") {
              str += `${i === 0 ? params[i].name + ':' : ''} <br/> 
                ${params[i].seriesName.indexOf('series') >= 0 ? '' : params[i].seriesName + ': '}
                ${params[i].value}${unit}`
            }
          }
          return str;
        }
      },
      toolbox: {
        show: toolbox,
        feature: {
          myTool1: {
            show: true,
            title: '切换为饼图',
            icon: 'path://M989.866667 512a477.866667 477.866667 0 1 1-477.866667-477.866667c2.2528 116.053333 0 477.866667 0 477.866667s389.12 0.682667 477.866667 0z" fill="#4185F4" opacity=".5" p-id="2960"></path><path d="M989.866667 443.733333a409.6 409.6 0 0 0-409.6-409.6c1.297067 292.864 0 409.6 0 409.6s171.690667-3.413333 409.6 0z',
            onclick: () => {
              if (!confirm('切换为饼图后不可在当前切换回其他图，可通过切换指标或者操作基准线和颜色来恢复')) return;
              let more = null;
              if (moreLine) more = moreLine;
              Charts.setPie(i, [data], code, more, year, dataTitle)
            }
          },
          // dataZoom: {
          //     yAxisIndex: 'none'
          // },
          // dataView: {readOnly: false},
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      series: [{
        name: moreLine ? '实际值（生效时间起始）' : null,
        type: 'line',
        data: value.reverse(),
        label: {
          show: true,
          position: 'top',
          // textStyle: {
          //     color: '#555'
          // }
        },
        markLine: line ? {
          silent: true,
          lineStyle: {
            normal: {
              color: '#333'                  // 这儿设置安全基线颜色
            }
          },
          data: lineArr,                       //这儿定义基准线的数值为多少
          label: {
            normal: {
              formatter: '基准线'           // 这儿设置安全基线
            }
          }
        } : null,
      }]
    };
    if (color.length > 0) option.color = color;
    if (moreLine) {
      option.series.push({
        name: moreLine ? `实际值（保单年度起始）${year}` : null,
        type: 'line',
        data: value1.reverse(),
        label: {
          show: true,
          position: 'top',
          // textStyle: {
          //     color: '#555'
          // }
        }
      }, {
        name: moreLine ? '方案值' : null,
        type: 'line',
        data: value2.reverse(),
        label: {
          show: true,
          position: 'top',
          // textStyle: {
          //     color: '#555'
          // }
        }
      })
    }
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  },

  // 柱状图
  // 参数解释：i--DOM元素，data--数据，code--当前选择的指标编码
  setBar: (i, data, code) => {
    let mychart = echarts.init(i, 'macarons');
    const xData = [], value = [];
    for (let j of data) {
      xData.push(j.dataDate);
      if (j[code] === undefined) value.push(0)
      else value.push(j[code]);
    }
    const option = {
      // color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: function (params) {
          var str = "";
          for (var i = 0; i < params.length; i++) {
            if (params[i].seriesName !== "") {
              str += `${params[i].name}: <br/> ${params[i].value}万元`
            }
          }
          return str;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: xData.reverse(),
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: '万元'
        }
      ],
      series: [
        {
          // name: '直接访问',
          type: 'bar',
          barWidth: '60%',
          data: value.reverse(),
          label: {
            show: true,
            position: 'top',
            // textStyle: {
            //     color: '#555'
            // }
          },
        }
      ]
    };
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  },

  // 饼状图
  setPie: (dom, data, code, more, year, dataTitle) => {
    let mychart = echarts.init(dom, 'macarons');
    const option = {
      title: {
        text: "",
        subtext: "",
        left: "center",
        textStyle: {
          color: "#fff",
          fontSize: 18
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: "{a}:{c} <br/>{b}:({d}%)"
      },
      series: []
    };
    let count = 0, now = 0, prev = 0, def;
    const radiusArr = [];
    if (more) {
      for (let i = 0; i <= data[0][more].effectTime.length; i++) {
        if (i === 0) count += 1;
        else count += Math.pow(2 / 3, i)
      }
      def = Math.floor(90 / count);
      now = def;
      prev = def;
      for (let i = 0; i <= data[0][more].effectTime.length; i++) {
        if (i === 0) radiusArr.push([0, `${def - 2}%`]);
        else {
          const next = parseInt(prev * 2 / 3);
          radiusArr.push([`${now}%`, `${now + next - 2}%`]);
          now = now + next;
          prev = next;
        }
      }
      const seriesArr = [];
      for (let i = 0; i < Object.getOwnPropertyNames(data[0][more]).length; i++) {
        seriesArr.push({
          name: '',
          type: 'pie',
          radius: radiusArr[i],
          label: {
            normal: {
              position: 'inner'
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: []
        })
      }
      let arr;
      for (let i in data[0][more]) {
        arr = seriesArr;
        let num = 0;
        if (i.length === 4) {
          for (let j of data[0][more][i]) {
            arr[num].data.push({
              value: j[code] !== undefined ? j[code] : 0,
              name: j.dataDate
            });
          }
          arr[num].name = '实际值（生效时间起始）';
        } else {
          // 判定是不是有三个指标
          if (dataTitle.length > 2) {
            num = 1;
            for (let j of data[0][more].effectTime) {
              arr[num].data.push({
                value: j[code] !== undefined ? j[code] : 0,
                name: j.dataDate
              });
            }
            arr[num].name = `实际值（保单年度起始）${year}`;
          }
        }
      }
      option.series.push(...arr);
      const series = {
        name: '方案值',
        type: 'pie',
        radius: radiusArr[radiusArr.length - 1],
        label: {
          normal: {
            position: 'inner'
          }
        },
        labelLine: {
          normal: {
            show: false
          }
        },
        data: []
      }
      for (let i = 0; i < seriesArr.length; i++) {
        for (let j in data[0].mockstart.mock) {
          series.data.push({
            value: data[0].mockstart.mock[j][code] !== undefined ? data[0].mockstart.mock[j][code] : 0,
            name: data[0][more].effectTime[j].dataDate
          })
        }
      }
      option.series.push(series);
    } else {
      for (let i in data) {
        if (i === '0') count += 1;
        else count += Math.pow(2 / 3, i)
      }
      def = Math.floor(90 / count);
      now = def;
      prev = def;
      for (let i in data) {
        if (i === '0') radiusArr.push([0, `${def - 2}%`]);
        else {
          const next = parseInt(prev * 2 / 3);
          radiusArr.push([`${now}%`, `${now + next - 2}%`]);
          now = now + next;
          prev = next;
        }
      }
      for (let i in data) {
        const series = {
          name: '数据值',
          type: 'pie',
          radius: radiusArr[i],
          label: {
            normal: {
              position: 'inner'
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: []
        }
        for (let j of data[i]) {
          series.data.push({
            value: j[code] !== undefined ? j[code] : 0,
            name: j.dataDate
          })
        }
        option.series.push(series)
      }
    }
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  }
}
export default Charts;