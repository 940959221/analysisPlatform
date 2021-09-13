import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/toolbox';
import 'echarts/lib/component/markLine';
import 'echarts/map/js/china';
// import 'echarts/theme/macarons';
import echartTheme from '../echartTheme';
import { setTextStyle } from 'echarts/lib/util/graphic';

echarts.registerTheme('westeros', echartTheme)

const defaultColor = ['59,161,255', '182,162,222', '255,185,128', '252,164,187', '184,208,124', '46,199,201', '216,122,128', '159,230,184', '141,152,179', '255,234,1'];

function checkTitle(timeType) {
  let title1 = '';
  let title2 = '';
  switch (timeType) {
    case 'day': title1 = '日'; break;
    case 'week': title1 = '周'; break;
    case 'month': title1 = '月'; break;
  }

  return title1;
}

// 设置x轴一行显示几个字
function setName(params, max) {
  let newParamsName = "";
  let paramsNameNumber = params.length;
  let provideNumber = max;  //一行显示几个字
  let rowNumber = Math.ceil(paramsNameNumber / provideNumber);
  if (paramsNameNumber > provideNumber) {
    for (let p = 0; p < rowNumber; p++) {
      let tempStr = "";
      let start = p * provideNumber;
      let end = start + provideNumber;
      if (p == rowNumber - 1) {
        tempStr = params.substring(start, paramsNameNumber);
      } else {
        tempStr = params.substring(start, end) + "<br/>";
      }
      newParamsName += tempStr;
    }
  } else newParamsName = params;
  return newParamsName;
}

// 区间颜色的设置
function setSpaceColor(colors, callback) {
  // 这里去校验一下是否有最小值比最大值还大的
  for (let i of colors) {
    if (i.minValue !== undefined && i.maxValue !== undefined) {
      if (i.minValue > i.maxValue) {
        const saveValue = i.minValue;
        i.minValue = i.maxValue;
        i.maxValue = saveValue;
      }
    }
  }

  const infinite = colors.filter(item => !item.minValue && !item.maxValue && item.minValue !== 0 && item.maxValue !== 0);   // 左右无穷
  const leftInfinite = colors.filter(item => !item.minValue && item.maxValue !== 0 && item.minValue !== 0);   // 左无穷
  const rightInfinite = colors.filter(item => !item.maxValue && item.minValue !== 0 && item.maxValue !== 0);   // 右无穷
  const infiniteArr = [];
  if (infinite.length > 0) {    // 存在两边都为无穷的值
    callback(infinite[0].style)
  }
  if (leftInfinite.length > 0) {
    leftInfinite.sort((a, b) => b.maxValue - a.maxValue);     // 从大到小排序
    colors = colors.filter(item => {    // 如果当前最大值小于左无穷的最大值，将被删掉
      if (item.maxValue > leftInfinite[0].maxValue) {
        // 如果满足条件同时最小值也大于左无穷，直接返回，否则用左无穷替换最小值
        if (item.minValue > leftInfinite[0].maxValue) return item;
        else {
          item.minValue = leftInfinite[0].maxValue;
          return item;
        }
      }
    });
    infiniteArr.push(leftInfinite[0]);
  }

  if (rightInfinite.length > 0) {
    rightInfinite.sort((a, b) => a.minValue - b.minValue);     // 从小到大排序
    colors = colors.filter(item => {    // 如果当前最小值小于右无穷的最小值，将被删掉
      if (item.minValue < rightInfinite[0].minValue) {
        // 如果满足条件同时最大值也小于右无穷，直接返回，否则用右无穷替换最大值
        if (item.maxValue < rightInfinite[0].minValue) return item;
        else {
          item.maxValue = rightInfinite[0].minValue;
          return item;
        }
      }
    });
    infiniteArr.push(rightInfinite[0]);
  }
  colors = colors.sort((a, b) => a.minValue - b.minValue);      // 排序，按照最小值递增的顺序
  return { colors, infiniteArr }
}

// 循环并处理区间颜色
function forSpaceColor(colors, callback1, type) {
  for (let i = 0; i < colors.length; i++) {
    if (i === colors.length - 1) {    // 如果是最后一个元素了就直接加
      if (callback1) callback1(colors[i]);
      break;
    }
    // 如果下一个区间被包裹在当前区间中
    if (colors[i + 1].minValue >= colors[i].minValue && colors[i + 1].maxValue <= colors[i].maxValue) {
      colors.splice(i + 1, 1);    // 删掉下一个元素
      i--;
      // 如果下一个最小值在当前区间中
    } else if (colors[i + 1].minValue >= colors[i].minValue && colors[i + 1].minValue < colors[i].maxValue) {
      colors[i + 1].minValue = colors[i].maxValue;
      i--;
      // 如果下一个最大值在当前区间中
    } else if (colors[i + 1].maxValue > colors[i].minValue && colors[i + 1].maxValue <= colors[i].maxValue) {
      colors[i + 1].maxValue = colors[i].minValue;
      i--;
    } else {    // 所有区间都不重叠，并且都是从大到小顺序排列
      if (type === 'map') {
        if (colors[i + 1].minValue !== colors[i].maxValue) {    // 非无缝区间
          const obj = { minValue: colors[i].maxValue, maxValue: colors[i + 1].minValue, style: '#023677' };
          colors.splice(i + 1, 0, obj);   // 插入一条数据，迫使成为无缝区间
        }
        callback1(colors[i]);
      } else if (type === 'pie') {
        callback1(colors[i])
      }
    }
  }
}

//计算echarts内部图例占用高度(不考虑富文本的情况) //5ms
function getLegendHeight(index, dom, mychart) {
  var height = 0;
  var charDOM = dom;
  var chart = mychart;
  var option = chart.getOption();
  var legends = option.legend;
  if (!legends || legends.length <= 0) return 0;
  index = parseInt(index);
  if (isNaN(index) || index < 0 || index >= legend.length) index = 0;
  var legend = legends[index];
  if (!legend || !legend.show || !legend.data || legend.data.length <= 0) return 0;
  //主算法，将legend中的设置渲染为DOM元素，用dom元素的宽高来模拟legend组件在echarts内部的高度
  var icongap = 5;//legend图形左右两边各有5个px的间隔
  var left = Number(legend.left), right = Number(legend.right);
  //计算legend组件的可用宽度
  var chartWidth = legend.width || charDOM.style.width - left - right;
  //legend的padding
  var padding = legend.padding || 0;
  if (Array.isArray(padding)) padding = padding.join('px ') + 'px';
  else padding += 'px';
  //每个legend item之间的间隙（包括水平和垂直）
  var itemGap = legend.itemGap;
  //创建一个不可见的模拟盒子

  var $legendbox = document.createElement('div');
  $legendbox.style.width = (chartWidth + itemGap) + 'px';
  $legendbox.style.padding = padding;
  $legendbox.style.lineHeight = '1';
  $legendbox.style.boxSizing = 'border-box';
  $legendbox.style.position = 'absolute';
  $legendbox.style.overflow = 'hidden';
  $legendbox.style.zIndex = '-1';
  $legendbox.style.opacity = '0';
  $legendbox.style.filter = 'alpha(opacity=0)';
  dom.appendChild($legendbox);
  //模拟绘制单个legend item
  var itemHeight = Number(legend.itemHeight), itemWidth = Number(legend.itemWidth);
  if (itemHeight % 2 != 0) itemHeight++;
  if (itemWidth % 2 != 0) itemWidth++;
  var fontSize = legend.textStyle.fontSize || 12;
  var fontWeight = legend.textStyle.fontWeight || 'normal';

  for (let i of legend.data) {
    var name = document.createElement('span');
    name.innerText = i;
    var $icon = document.createElement('span');
    $icon.style.display = 'inline-block';
    $icon.style.padding = '0 ' + icongap + 'px';
    $icon.style.boxSizing = 'content-box';
    $icon.style.width = itemWidth + 'px';
    $icon.style.height = itemHeight + 'px';

    var $item = document.createElement('div');
    $item.style.display = 'inline-block';
    $item.style.float = 'left';
    $item.style.marginRight = itemGap + 'px';
    $item.style.marginBottom = itemGap + 'px';
    $item.style.fontSize = fontSize + 'px';
    $item.style.fontWeight = fontWeight;

    $item.appendChild($icon);
    $item.appendChild(name);
    $legendbox.appendChild($item);
  }
  //得到模拟高度
  height = $legendbox.clientHeight - itemGap;
  //善后工作
  dom.removeChild($legendbox);
  return height;
}

export const CreateCharts = {       // 最后两个参数是在切换图形的时候使用
  default: (sqlType, useData, measureNames, component, that, dom, datass, y1, y2, baseLine, newName, newType) => {
    const data = JSON.parse(JSON.stringify(datass.measureInfos));
    console.log(Object.keys(data));

    const { xDim } = datass;
    const dataCount = Object.keys(data).length;
    let mychart = echarts.init(dom, 'westeros');
    let useStack = false;       // 是否使用堆积柱状图
    const dataName = [];        // 数据对应名称
    let moreMeasure = [];       // 最长的一个数据对象
    const objType = {};         // 图形类型对象
    let y1Unit, y2Unit;
    let title;
    let ind = 0;
    let useDataZoom = false;    // 是否使用切片
    const isDate = xDim === 'pub_its_statdate' ? true : false;    // x轴是否为时间

    // 判定名称是否含有‘-’，有的话截取最后一段，没有就是之前配置的数据，正常展示
    if (component.indexOf('-') >= 0) {
      const names = component.split('-')
      component = names[names.length - 1];
    }

    // 根据y1轴和y2轴的单位来配置
    switch (y1) {
      case '件数': y1Unit = '件'; break;
      case '万元': y1Unit = '万元'; break;
      case '排名': y1Unit = '排名'; break;
      case '原始值': y1Unit = '原始值'; break;
      case '元': y1Unit = '元'; break;
      case '日': y1Unit = '日'; break;
      default: y1Unit = '%'; break;
    }
    if (y2) {
      switch (y2) {
        case '件数': y2Unit = '件'; break;
        case '万元': y2Unit = '万元'; break;
        case '排名': y2Unit = '排名'; break;
        case '原始值': y2Unit = '原始值'; break;
        case '元': y2Unit = '元'; break;
        case '日': y2Unit = '日'; break;
        default: y2Unit = '%'; break;
      }
    }

    for (let i in data) {
      // if (data[i].istendaysAgo === '1') data[i].measureName += '-十天前';

      title = checkTitle(data[i].cycle);
      if (data[i].style === "堆积柱状图") useStack = true;
      if (data[i].measureName[data[i].measureName.length - 1] === '/') {
        data[i].measureName = data[i].measureName.slice(0, data[i].measureName.length - 1);
      }

      dataName.push(data[i].measureName);
      const measureData = data[i].measureData ? data[i].measureData : [];
      for (let j of measureData) {
        moreMeasure.push(j.measureCode ? (isDate ? j.dimensionValue : j.measureCode + '+' + j.dimensionValue) :
          (j.sortNum ? j.sortNum + '+' + j.dimensionValue : j.dimensionValue))
      }

      // 此处需要一个变量存储style，如果直接修改style会影响对象原本的style
      let newStyle = data[i].style;
      // 如果当前指标名称和需要切换的指标一样，那就修改图形
      if (data[i].measureName === newName) {
        newStyle = newType;
      }

      // 配置数据对应的图形类型
      let type;
      switch (newStyle) {
        case '折线图': type = 'line'; break;
        case '面积图': type = 'line'; break;
        default: type = 'bar'; break;
      }
      objType[data[i].measureName] = {
        type,
        typeName: newStyle,
        isShow: data[i].isShow === '1' ? true : false,     // 是否显示
        unit: data[i].yAxis === '1' ? y1Unit : y2Unit ? y2Unit : y1Unit,    // 根据情况使用单位，如果没有y2，全部使用y1
        data: [],
        y: data[i].yAxis,
        color: (function () {   // 如果当前因为指标过多导致的颜色少了，那就随机配颜色
          const color = defaultColor[ind];
          if (color) return color;
          else {
            let randomColor = `${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)}`;
            while (defaultColor.indexOf(randomColor) >= 0 ||
              randomColor === '0,0,0' || randomColor === '255,255,255') {
              randomColor = `${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)}`;
            }
            return randomColor;
          }
        })()
      };

      ind++;
    }

    // 去重得到所有x轴的集合
    moreMeasure = moreMeasure.filter((item, index) => moreMeasure.indexOf(item) === index);

    // 如果没给x轴的话，过滤掉，不然会展示undefined
    if (moreMeasure.indexOf(undefined) >= 0) moreMeasure.splice(moreMeasure.indexOf(undefined), 1)

    if (sqlType !== '2') {    // 行业数据前端不排序
      // 冒泡排序
      for (let i = 0; i < moreMeasure.length - 1; i++) {
        for (let j = 0; j < moreMeasure.length - i - 1; j++) {
          if (moreMeasure[j] > moreMeasure[j + 1]) {
            const q = moreMeasure[j];
            moreMeasure[j] = moreMeasure[j + 1];
            moreMeasure[j + 1] = q;
          }
        }
      }
    }

    // 去除因为排序用到的measureCode前缀
    moreMeasure = moreMeasure.map(item => {
      if (item.indexOf('+') >= 0) return item.split('+')[1];
      else return item;
    });

    if (isDate) useDataZoom = true;    // 当前维度为时间，使用切片

    // 配置所有指标对应的数据，先获取总数据，然后再按所有数据来进行查漏补缺
    for (let i in data) {
      for (let j of moreMeasure) {
        // 过滤出对应的数据，如果没有就补0，否则的话就直接配值
        const measureData = data[i].measureData ? data[i].measureData : [];
        const sameData = measureData.filter(item => item.dimensionValue === j);
        if (sameData.length === 0) objType[data[i].measureName].data.push('0');
        else {
          let datas;
          switch (objType[data[i].measureName].unit) {
            case '件': datas = parseInt(sameData[0].measureValue); break;
            case '万元': datas = (sameData[0].measureValue / 10000).toFixed(2); break;
            case '排名': datas = sameData[0].measureValue; break;
            case '原始值': datas = sameData[0].measureValue; break;
            case '元': datas = (sameData[0].measureValue * 1).toFixed(2); break;
            case '日': datas = sameData[0].measureValue; break;
            default: datas = (sameData[0].measureValue * 100).toFixed(2); break;
          }
          objType[data[i].measureName].data.push(datas);
        }
      }
    }

    // 图表配置
    let option = {
      title: {
        text: component ? `${component}` : '',
        subtext: title ? '频度：' + title : undefined,
        left: 'center',
        textStyle: {
          color: '#008ACD'
        }
      },
      backgroundColor: '#fff',
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            show: true
          }
        },
        formatter: function (params) {
          // 如果是对象的话，强制转换数组统一操作
          if (Object.prototype.toString.call(params) === '[object Object]') params = [params];
          let name = params[0].axisValue;

          for (let j of params) {
            let { seriesName } = j;

            // const { y1Unit, y2Unit } = datass;
            let unit;
            for (let i in data) {
              if (data[i].measureName === seriesName) {
                if (data[i].yAxis === '1') unit = y1Unit;
                else unit = y2Unit;

                seriesName = setName(seriesName, 40);

                if (unit === '原始值' || unit === '排名' || unit === '日') unit = false;
                name += `<br/>${j.marker}${seriesName}: ${j.data ? j.data : 0}${unit ? unit : ''}`
              }
            }
          }
          return name;
        }
      },
      toolbox: {
        right: 20,
        show: true,
        feature: {
          // saveAsImage: { show: true }
        }
      },
      legend: {
        // textStyle: {
        //     color: '#fff',
        // },
        top: 'bottom',
        margin: [50, 0, 0, 0],
        data: dataName,
        selected: {}
      },
      grid: {
        left: '3%',
        top: '60',
        right: '4%',
        bottom: useDataZoom ? Math.ceil(dataCount / 2) * 25 + 30 : Math.ceil(dataCount / 2) * 25,
        padding: '0 0 50 0',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        axisLine: {
          lineStyle: {
            color: '#808eb7',
            width: 2
          },
        },
        axisLabel: {
          // formatter: function (params) {
          //   return setName(params)
          // },
          rotate: 60
        },
        data: moreMeasure,
      },
      yAxis: [{
        name: y1Unit,
        axisLine: {
          lineStyle: {
            color: '#808eb7',
            width: 2
          }
        },
        splitLine: { //分割线配置
          lineStyle: {
            color: "#AAAAAA56",
          }
        },
      }],
      series: new Array,
    }

    // 使用切片
    if (useDataZoom) {
      option.dataZoom = [{
        show: true,
        height: 20,
        startValue: moreMeasure.length - 7,
        endValue: moreMeasure.length - 1,
        handleSize: '110%',
        backgroundColor: '#DCDCDC',
        type: 'slider',
        handleStyle: {
          color: '#000'
        },
        dataBackground: {                        //数据阴影的样式。
          lineStyle: {
            color: 'red'
          },              //阴影的线条样式
          areaStyle: {
            color: 'green'
          },
        },
        fillerColor: "rgba(0,0,0,0.5)",
        textStyle: { color: "#000" },
        borderColor: "#ccc",
        // bottom: Math.ceil(dataCount / 2) * 25,
      },
      { type: "inside" }
      ]
    }

    // 如果有y2轴
    if (y2) {
      option.yAxis.push({
        name: y2Unit,
        axisLine: {
          lineStyle: {
            color: '#808eb7',
            width: 2
          }
        },
        splitLine: { //分割线配置
          lineStyle: {
            color: "#AAAAAA56",
          }
        },
      })
    }

    // 找到最后一个柱状图，后面给他盖帽
    // let objTypeArr = Object.keys(objType).reverse();
    // let lastBar;
    // for (let i of objTypeArr) {
    //   if (objType[i].type === 'bar') {
    //     lastBar = i;
    //     break;
    //   }
    // }

    // 循环数据，根据图表类型进行配置
    for (let i in objType) {
      let obj;
      // 柱状图
      if (objType[i].type === 'bar') {
        obj = {
          name: i,
          type: objType[i].type,
          barMaxWidth: 30,
          data: objType[i].data,
          itemStyle: {
            normal: {
              color: `rgb(${objType[i].color})`,
              // barBorderRadius: lastBar === i ? [20, 20, 0, 0] : undefined

              // color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
              //   offset: 1,
              //   color: "#00ffff" // 0% 处的颜色
              // },
              // {
              //   offset: 0,
              //   color: "#3893e5" // 100% 处的颜色
              // }
              // ], false),
            },
          },
          animationDuration: 3000
        }
        // 是否使用堆积柱状图
        if (useStack) obj.stack = '柱状图';
      } else {
        // 折线图
        obj = {
          name: i,
          data: objType[i].data,
          type: objType[i].type,
          smooth: false,
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: {
            color: `rgb(${objType[i].color})`,
            // borderColor: "#fff",
          },
          animationDuration: 3000
        }
        if (objType[i].typeName === '面积图') {
          let args;
          if (!!window.ActiveXObject || "ActiveXObject" in window) {    // 判断是否为ie浏览器，但在ie中无法使用下面echart中的颜色渐变函数
            args = [[{
              offset: 0,
              color: `rgb(${objType[i].color},0.4)`,
            },
            {
              offset: 1,
              color: `rgb(${objType[i].color},0)`
            }
            ], false, 0, 0, 0, 1]
          } else {
            args = [0, 0, 0, 1, [{
              offset: 0,
              color: `rgb(${objType[i].color},0.4)`,
            },
            {
              offset: 1,
              color: `rgb(${objType[i].color},0)`
            }
            ], false];
          }
          obj.areaStyle = {
            normal: {
              color: new echarts.graphic.LinearGradient(...args),
              shadowColor: `rgb(${objType[i].color},0.9)`,
              shadowBlur: 20
            }
          }
        }
      }
      // 如果当前数据的是y2轴，并且有传递y2过来，那就配置当前跟随y2
      if (objType[i].y === '2' && y2) obj.yAxisIndex = 1;

      // 显示数据
      if (useData) {
        if (measureNames.length > 0) {
          if (measureNames.includes(obj.name)) obj.label = { show: true, position: 'top' };
        } else {
          obj.label = { show: true, position: 'top' };
        }
      }

      // 如果有基准线
      if (baseLine.length > 0) {
        obj.markLine = {
          symbol: "none",
          data: []
        }
        for (let o of baseLine) {
          if (objType[i].y === o.yAxis) {
            let color;
            // 如果是跟随指标颜色，那就获取是第几个指标，再从默认颜色中获取到对应位置的颜色
            const dataName = Object.keys(data);
            if (o.colour[0] === '#') color = o.colour;
            else {
              const colorIndex = dataName.indexOf(o.colour);
              color = `rgb(${defaultColor[colorIndex]})`;
            }
            const markLineObj = {
              silent: false,             //鼠标悬停事件  true没有，false有
              lineStyle: {               //警戒线的样式  ，虚实  颜色
                type: o.style === '虚线' ? 'dashed' : "solid",
                color,
              },
              label: {
                position: o.yAxis === '1' ? 'end' : 'start',
                formatter: `y${o.yAxis}基准线`
              },
              yAxis: o.value
            };
            obj.markLine.data.push(markLineObj);
          }
        }
      }

      option.series.push(obj);

      // 配置当前数据是否默认显示
      option.legend.selected[i] = objType[i].isShow;
    }

    // 调用函数检查是否需要使用y轴的负数轴
    setStyleY();

    // 调用函数检查当前是否有指标是未选中状态，并且导致对应这个y轴没有数据对应
    checkY(option.legend.selected)

    // 点击图形按钮事件
    mychart.on('legendselectchanged', obj => {
      const { selected, name } = obj;
      checkY(selected);
      option.legend.selected[name] = selected[name];    // 修改选中状态
      setStyleY();

      mychart.setOption(option, true);
      mychart.resize();           // 重置让echarts图表自适应高宽
    })

    mychart.on('click', params => {
      // 配置一个标识符，快速找到是哪个图表
      // params.graphType = '1';
      that.drillDown(params, datass);
    })
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽

    // 调用函数获取图例高度
    option.grid.bottom = useDataZoom ? getLegendHeight(null, dom, mychart) + 30 : getLegendHeight(null, dom, mychart);
    if (useDataZoom) option.dataZoom[0].bottom = getLegendHeight(null, dom, mychart);
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽

    // 共同判定是否显示y轴的函数
    function checkY(selected) {
      const open = {};
      for (let i in selected) {
        if (i.indexOf('y1') >= 0 || i.indexOf('y2') >= 0) {   // 如果是正常情况则包含具体轴名
          if (i.indexOf('y1') >= 0 && selected[i]) open.y1 = true;
          else if (i.indexOf('y2') >= 0 && selected[i]) open.y2 = true;
        } else {    // 通过sql添加的方式：行业数据图表
          for (let j in data) {
            if (j === i && selected[i]) open['y' + data[j].yAxis] = true;
          }
        }
      }

      // 根据选中状态展示或隐藏坐标单位
      if (!open.y1) option.yAxis[0].name = '';
      if (!open.y2 && option.yAxis[1]) option.yAxis[1].name = '';
      if (open.y1) option.yAxis[0].name = y1Unit;
      if (open.y2 && option.yAxis[1]) option.yAxis[1].name = y2Unit;
    }

    // 是否使用y轴的负数轴
    function setStyleY() {
      const select = {};    // 存入所有当前选中的项
      for (let i in option.legend.selected) {
        if (option.legend.selected[i]) select[i] = true;
      }
      // 此时有两个y轴
      for (let k of option.series) {
        let hasMin = false;
        if (!select[k.name]) continue;    // 如果当前未选中，则不进行处理
        for (let o of k.data) {
          for (let p of option.yAxis) {
            if (option.yAxis.length > 1) {    // 存在两个y轴
              if (o < 0) {      // 如果当前值小于零则添加负数轴，同时修改变量不再进行循环，否则依次删除添加的内容
                p.max = function (value) {
                  if (Math.abs(value.max) > Math.abs(value.min)) {
                    return (Math.abs(value.max) * 1.2).toFixed(2);
                  } else {
                    return (Math.abs(value.min) * 1.2).toFixed(2);
                  }
                };
                p.min = function (value) {
                  if (Math.abs(value.max) > Math.abs(value.min)) {
                    return (-Math.abs(value.max) * 1.2).toFixed(2);
                  } else {
                    return (-Math.abs(value.min) * 1.2).toFixed(2);
                  }
                }
                hasMin = true;
              } else {
                delete p.min;
                delete p.max;
              }
            }
          };
          if (hasMin) break;
        }
        if (hasMin) break;
      }
    }
  },

  map: (useData, component, that, dom, datass, colors, sqlType) => {
    let data = datass.measureInfos;
    let mychart = echarts.init(dom);
    const mapName = 'china';
    const mapData = [];
    const pieces = [];
    const otherArea = ['深圳', '大连', '宁波', '青岛'];     // 其他非省份的分公司
    let name;
    let minValue;
    let maxValue;
    let title1;
    let title2;
    let unit = '';
    let oneMeasure = false;
    let oneMeasureName = '';
    let measureLength = 0;

    // 判断当前地图是否是占比指标，如果是则需要修改数据结构，因为占比的结构和普通指标不一样
    const dataKey = Object.keys(data);
    if (data[dataKey[0]].propFlag === '1') {
      const newData = { [dataKey[0]]: data[dataKey[0]] };
      for (let i of dataKey.slice(1)) {
        newData[dataKey[0]].measureData.push(...data[i].measureData);
      }
      data = newData;
    }

    // 判定名称是否含有‘-’，有的话截取最后一段，没有就是之前配置的数据，正常展示
    if (component.indexOf('-') >= 0) {
      const names = component.split('-')
      component = names[names.length - 1];
    }

    for (let i in data) {
      if (data[i].isShow === '1') {
        if (data[i].measureData.length > measureLength) {
          oneMeasureName = i;
          measureLength = data[i].measureData.length;
        }
      }
    }

    for (let i in data) {
      if (i === oneMeasureName || !sqlType) {
        title1 = checkTitle(data[i].cycle);
        title2 = data[i].measureName;
        const { measureName } = data[i];
        const measureData = data[i].measureData ? data[i].measureData : [];
        name = measureName;
        for (let j of measureData) {
          mapData.push({ name: j.province, value: j.measureValue })
        }
        // 单位
        switch (data[i].UNIT) {
          case '百分比': unit = '%'; break;
          case '原始值': unit = ''; break;
          case '日': unit = ''; break;
          case '件数': unit = '件'; break;
          default: unit = data[i].UNIT; break;
        }
        oneMeasure = true;      // 只允许展示一个指标
        oneMeasureName = i;
      }
    }

    // 排序
    mapData.sort((a, b) => b.value - a.value);

    for (let i of mapData) {
      switch (unit) {
        case '万元': i.value = (i.value / 10000).toFixed(2); break;
        case '元': i.value = (i.value * 1).toFixed(2); break;
        case '%': i.value = (i.value * 100).toFixed(2); break;
        default: break;
      }
    }

    // 给最大最小值赋值
    if (mapData.length > 0) {
      minValue = mapData[mapData.length - 1].value < 0 ? mapData[mapData.length - 1].value : 0;
      maxValue = mapData[0].value;
    }

    // 给范围颜色进行配置
    if (colors.length > 0) {
      const setSpace = setSpaceColor(colors, directlyPush);
      const { infiniteArr } = setSpace;
      let afterColor = setSpace.colors;
      forSpaceColor(afterColor, pushs, 'map')
      function pushs(color) {
        pieces.push({
          gte: color.minValue,
          lte: color.maxValue,
          label: `${color.minValue} ~ ${color.maxValue}`,
          color: color.style
        })
      }

      for (let i of infiniteArr) {
        if (infiniteArr.length > 1) {   // 如果存在最小的值和最大值直接有交集，就互换值
          if (infiniteArr[1].minValue - infiniteArr[0].maxValue < 0) {
            const saveValue = infiniteArr[0].maxValue;
            infiniteArr[0].maxValue = infiniteArr[1].minValue;
            infiniteArr[1].minValue = saveValue;
          }
        }
        if (i.minValue === undefined) {
          pieces.unshift({
            lte: i.maxValue,
            label: `< ${i.maxValue}`,
            color: i.style
          })
        } else {
          pieces.push({
            gte: i.minValue,
            label: `> ${i.minValue}`,
            color: i.style
          })
        }
      }
    } else {
      directlyPush('#023677');
    }

    // 检查一下pieces，如果中间有断档就补上
    for (let i = 0; i < pieces.length; i++) {
      if (i !== pieces.length - 1) {
        if (pieces[i].lte !== pieces[i + 1].gte) {
          const obj = {
            gte: pieces[i].lte,
            lte: pieces[i + 1].gte,
            label: `${pieces[i].lte} ~ ${pieces[i + 1].gte}`,
            color: '#023677'
          }
          pieces.splice(i + 1, 0, obj)
        }
      }
    }
    // 如果第一个的最小值比总数据的最小值还大，那就把剩余数据补上
    if (pieces[0].gte !== undefined && pieces[0].gte > minValue) {
      const obj = {
        lte: pieces[0].gte,
        label: `< ${pieces[0].gte}`,
        color: '#023677'
      }
      pieces.unshift(obj)
    }
    // 如果最后一个的最大值比总数据的最大值还小，那就把剩余数据补上
    if (pieces[pieces.length - 1].lte !== undefined && pieces[pieces.length - 1].lte < maxValue) {
      const obj = {
        gte: pieces[pieces.length - 1].lte,
        label: `> ${pieces[pieces.length - 1].lte}`,
        color: '#023677'
      }
      pieces.push(obj)
    }

    // 直接插入
    function directlyPush(color) {
      pieces.push({
        gte: minValue,
        lte: maxValue,
        label: `${minValue} ~ ${maxValue}`,
        color
      })
    }

    // 除数，用于后续散点的圆形大小
    const divisor = mapData.length > 0 ? mapData[0].value / 20 : undefined;

    const geoCoordMap = {};

    /*获取地图数据*/
    mychart.showLoading();
    const mapFeatures = echarts.getMap(mapName).geoJson.features;
    mychart.hideLoading();
    mapFeatures.forEach(function (v) {
      // 地区名称
      const name = v.properties.name;
      // 地区经纬度
      geoCoordMap[name] = v.properties.cp;

    });
    // 额外添加4个散点
    geoCoordMap[otherArea[0]] = [114.07, 22.62];
    geoCoordMap[otherArea[1]] = [121.62, 38.92];
    geoCoordMap[otherArea[2]] = [121.56, 29.86];
    geoCoordMap[otherArea[3]] = [120.33, 36.07];

    let convertData = function (data) {
      let res = [];
      for (let i = 0; i < data.length; i++) {
        let geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
          res.push({
            name: data[i].name,
            value: geoCoord.concat(data[i].value),
          });
        }
      }
      return res;
    };

    // 判定标题中是否有&符号和一些不必要的中文，删除 
    if (!title2) title2 = '';
    let title = title2;

    if (title2.indexOf('&') >= 0) {
      const titleArr = title2.split('-');
      for (let l in titleArr) {
        if (titleArr[l].indexOf('&') >= 0) title = titleArr.slice(0, l).join('-');
      }
    }
    let option = {
      title: [{
        text: component ? component : '',
        subtext: title1 ? '频度：' + title1 : undefined,
        left: 'center',
        textStyle: {
          color: '#008ACD',
          fontWeight: 'normal'
        }
      }, {
        text: title2 ? `${'指标：' + title}` : '',
        left: 'center',
        bottom: 0,
        textStyle: {
          color: '#008ACD',
          fontWeight: 'normal'
        }
      }],
      toolbox: {
        right: 70,
        show: true,
        feature: {
          mark: { show: true },
          // saveAsImage: { show: true }
        }
      },
      tooltip: {
        formatter: function (params) {
          let otherMeasure = '';
          if (Object.keys(data).length > 1) {
            for (let i in data) {
              if (i !== oneMeasureName) {
                if (params.seriesIndex === 1) {
                  for (let j of data[i].measureData) {
                    if (j.dimensionValue === params.name) {
                      otherMeasure += `<br/>${data[i].measureName}`;
                      let value = j.measureValue;
                      switch (unit) {
                        case '万元': value = (value / 10000).toFixed(2); break;
                        case '元': value = (value * 1).toFixed(2); break;
                        case '%': value = (value * 100).toFixed(2); break;
                        default: break;
                      }
                      otherMeasure += `<br/>${params.name}: ${value}${unit}`
                    }
                  }
                  for (let j of data[i].measureData) {
                    let areaValue;
                    switch (params.name) {
                      case '广东': areaValue = otherArea[0]; break;
                      case '辽宁': areaValue = otherArea[1]; break;
                      case '浙江': areaValue = otherArea[2]; break;
                      case '山东': areaValue = otherArea[3]; break;
                      default: break;
                    }
                    if (j.dimensionValue === areaValue) {
                      let value = j.measureValue;
                      switch (unit) {
                        case '万元': value = (value / 10000).toFixed(2); break;
                        case '元': value = (value * 1).toFixed(2); break;
                        case '%': value = (value * 100).toFixed(2); break;
                        default: break;
                      }
                      otherMeasure += `<br/>${areaValue}: ${value}${unit}`
                    }
                  }
                } else {
                  for (let j of data[i].measureData) {
                    let value = j.measureValue;
                    switch (unit) {
                      case '万元': value = (value / 10000).toFixed(2); break;
                      case '元': value = (value * 1).toFixed(2); break;
                      case '%': value = (value * 100).toFixed(2); break;
                      default: break;
                    }
                    if (j.dimensionValue === params.name) {
                      otherMeasure += `<br/>${data[i].measureName} <br/>${params.marker} ${params.name}: ${value}${unit}`
                    }
                  }
                }
              }
            }
          }

          // 如果当前没有数据的直接返回
          if (params.name === '' || !params.data) return undefined;
          const nowData = `${title} <br/>${params.name}: ${params.data.value}${unit}`;
          let cycle = `${title} <br/>${params.marker} ${params.name}: ${params.data.value[2]}${unit}`;
          // 如果当前是省份
          cycle += otherMeasure !== '' ? ('<br/>' + otherMeasure) : '';

          if (params.seriesIndex === 1) {
            switch (params.name) {
              case '广东': return nowData + `<br/>${otherArea[0]}: ${forGet(otherArea[0])}${unit}${otherMeasure !== '' ? ('<br/>' + otherMeasure) : ''}`;
              case '辽宁': return nowData + `<br/>${otherArea[1]}: ${forGet(otherArea[1])}${unit}${otherMeasure !== '' ? ('<br/>' + otherMeasure) : ''}`;
              case '浙江': return nowData + `<br/>${otherArea[2]}: ${forGet(otherArea[2])}${unit}${otherMeasure !== '' ? ('<br/>' + otherMeasure) : ''}`;
              case '山东': return nowData + `<br/>${otherArea[3]}: ${forGet(otherArea[3])}${unit}${otherMeasure !== '' ? ('<br/>' + otherMeasure) : ''}`;
              default: return nowData + '<br/>' + otherMeasure;
            }
          } else {
            return cycle;
          }

          function forGet(name) {
            for (let i of mapData) {
              if (i.name === name) return i.value
            }
          }
        }
      },

      visualMap: {
        show: true,
        min: minValue,
        max: maxValue,
        left: '10%',
        top: 'bottom',
        // calculable: true,
        seriesIndex: [1],
        pieces: pieces.reverse(),
        // inRange: {
        //   color: ['#04387b', '#467bc0'] // 蓝绿
        // }
      },
      geo: {
        show: true,
        map: mapName,
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: false,
          }
        },
        roam: false,
        itemStyle: {
          normal: {
            areaColor: '#023677',
            borderColor: '#1180c7',
          },
          emphasis: {
            areaColor: '#4499d0',
          }
        }
      },
      series: [
        {
          // label: useData ? { show: true, position: 'top' } : undefined,
          name: '散点',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: convertData(mapData),
          symbolSize: function (val) {
            if (unit === '%') return val[2] / (divisor * 10);
            else return val[2] / divisor;
          },
          label: {
            normal: {
              formatter: '{b}',
              position: 'right',
              show: true
            },
            emphasis: {
              show: true
            }
          },
          itemStyle: {
            normal: {
              color: '#FF8C00'
            }
          }
        },
        {
          type: 'map',
          map: mapName,
          geoIndex: 0,
          aspectScale: 0.75, //长宽比
          showLegendSymbol: false, // 存在legend时显示
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: false,
              textStyle: {
                color: '#fff'
              }
            }
          },
          roam: true,
          itemStyle: {
            normal: {
              areaColor: '#031525',
              borderColor: '#3B5077',
            },
            emphasis: {
              areaColor: '#2B91B7'
            }
          },
          animation: false,
          data: mapData
        },
        {
          name: '点',
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 6,
        },
        {
          name: 'Top 5',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: convertData(mapData.sort(function (a, b) {
            return b.value - a.value;
          }).slice(0, 10)),
          symbolSize: function (val) {
            if (unit === '%') return val[2] / (divisor * 10);
            else return val[2] / divisor;
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke'
          },
          hoverAnimation: true,
          label: {
            normal: {
              formatter: '{b}',
              position: 'left',
              show: false
            }
          },
          itemStyle: {
            normal: {
              color: 'yellow',
              shadowBlur: 10,
              shadowColor: 'yellow'
            }
          },
          zlevel: 1
        },
      ]
    };

    if (useData) {
      option.series.push({
        name: '气泡散点图',
        type: 'scatter',
        coordinateSystem: 'geo',
        // 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none'
        symbol: 'pin', //气泡
        symbolSize: function (val) {
          return val[2] * 3 / divisor;
        },
        label: {
          normal: {
            show: true,
            formatter: function (obj) {
              return obj.data.value[2];
            },
            textStyle: {
              color: '#fff',
              fontSize: 9,
            }
          }
        },
        itemStyle: {
          normal: {
            // 气泡颜色
            color: '#F62157',
          }
        },
        zlevel: 6,
        data: convertData(mapData),
      })
    }

    mychart.on('click', (params) => {
      // 配置一个标识符，快速找到是哪个图表
      // params.graphType = '1';
      if (params.name === '') return;
      that.drillDown(params, datass, true);
    })
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  },

  pie: (useData, component, that, dom, datass, colors) => {
    const data = datass.measureInfos;
    let mychart = echarts.init(dom, 'westeros');

    const dataName = [];
    const datas = [];
    const randomColorArr = [];   // 随机色
    let title2 = '';
    let names = [];
    let unit;

    const setSpace = setSpaceColor(colors, setColorLength);
    const { infiniteArr } = setSpace;
    let afterColor = setSpace.colors;

    function setColorLength() {
      colors = [];
    }

    // 判定名称是否含有‘-’，有的话截取最后一段，没有就是之前配置的数据，正常展示
    if (component.indexOf('-') >= 0) {
      const names = component.split('-')
      component = names[names.length - 1];
    }

    for (let i in data) {
      // 单位
      switch (data[i].UNIT) {
        case '百分比': unit = '%'; break;
        case '原始值': unit = ''; break;
        case '日': unit = ''; break;
        case '件数': unit = '件'; break;
        default: unit = data[i].UNIT; break;
      }

      title2 = checkTitle(data[i].cycle);
      let name = data[i].measureName;
      if (name.indexOf('&') >= 0) name = name.split('&')[0] + name.split('&')[1]
      names.push(name)
      const colorObj = {};    // 临时数组，用于测定随机色，省去遍历
      const measureData = data[i].measureData ? data[i].measureData : [];
      for (let j of measureData) {
        let getValue = false, dimName;
        const sliceInd = name.indexOf('-不显示');
        if (Object.keys(data).length <= 1) dimName = j.dimensionValue;
        else dimName = (sliceInd > 0 ? name.split('-不显示')[0] + name.split('-不显示')[1] : name) + '+' + j.dimensionValue;
        dataName.push(dimName);
        datas.push({
          name: dimName,
          value: j.measureValue
        })

        if (colors.length > 0) {
          // 添加不重复的随机色
          let randomColor = '#' + Math.floor(Math.random() * 16777216).toString(16);
          const value = Number(j.measureValue);   // 把值全部改为数值型
          forSpaceColor(afterColor, pieFunc, 'pie');

          function pieFunc(color) {
            const minValue = color.minValue;
            const maxValue = color.maxValue;
            if (!getValue) {
              if (value > minValue && value < maxValue) {
                randomColor = color.style;  // 如果当前值在区间范围内就替换随机色
                getValue = true;      // 如果有一个满足条件则进行标记，下次则不执行，不然会走else
              }
              else {    // 否则就一直随机颜色，排除重复、不合规、与随机颜色一样、黑白
                while (colorObj[randomColor] || randomColor === color.style || randomColor.length < 7 ||
                  randomColor === '#ffffff' || randomColor === '#000000') {
                  randomColor = '#' + Math.floor(Math.random() * 16777216).toString(16);
                }
              }
            }
          }
          // 判定当前值是否在无穷区间内
          for (let k of infiniteArr) {
            if (k.minValue === undefined) {
              if (value <= k.maxValue) {
                randomColor = k.style;
              }
            } else if (k.maxValue === undefined) {
              if (value >= k.minValue) {
                randomColor = k.style;
              }
            }
          }
          randomColorArr.push(randomColor);
        }
      }
    }

    for (let i in names) {
      if (names[i].indexOf('/') >= 0) {
        const titleArr = names[i].split('-');
        for (let l in titleArr) {
          if (titleArr[l].indexOf('/') >= 0) names[i] = titleArr.slice(0, l).join('-');
        }
      }
      if (names[i].indexOf('-不显示') > 0) name[i] = names[i].split('-不显示')[0] + names[i].split('-不显示')[1];
      if (names[i].indexOf('&') > 0) names[i] = names[i].split('&')[0];
    }
    let option = {
      title: [{
        text: component,
        subtext: title2,
        left: 'center',
        textStyle: {
          color: '#008ACD',
          fontWeight: 'normal'
        }
      }, {
        text: names.length < 2 ? '指标：' + names[0] : '',
        left: 'center',
        bottom: 0,
        textStyle: {
          color: '#008ACD',
          fontWeight: 'normal'
        }
      }],
      toolbox: {
        right: 70,
        show: true,
        feature: {
          mark: { show: true },
          // saveAsImage: { show: true }
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          const { data, seriesName, name } = params;
          let value = '';
          switch (unit) {
            case '万元': value = (data.value / 10000).toFixed(2); break;
            case '元': value = (data.value * 1).toFixed(2); break;
            case '%': value = (data.value * 100).toFixed(2); break;
            default: value = data.value; break;
          }
          return `${(names.length < 2 ? names[0] + '<br/>' : '') + name}: ${value}${unit}`
        }
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: 100,
        top: 20,
        bottom: 20,
        data: dataName,
      },
      series: [
        {
          name: name,
          type: 'pie',
          radius: '55%',
          center: ['40%', '50%'],
          data: datas,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            normal: colors.length > 0 ? {
              color: function (params) {
                return randomColorArr[params.dataIndex]
              }
            } : undefined
          },
        }
      ]
    };

    if (useData) {
      for (let i of option.series) {
        i.label = {
          normal: {
            formatter: function (params) {
              const { data, seriesName, name } = params;
              let value = '';
              switch (unit) {
                case '万元': value = (data.value / 10000).toFixed(2); break;
                case '元': value = (data.value * 1).toFixed(2); break;
                case '%': value = (data.value * 100).toFixed(2); break;
                default: value = data.value; break;
              }
              return name + '：' + value + unit
            },
            rich: {
              icon: {
                fontSize: 16
              },
              name: {
                fontSize: 14,
                padding: [0, 10, 0, 4],
              },
              value: {
                fontSize: 18,
                fontWeight: 'bold',
              }
            }
          }
        }
      }
    }

    mychart.on('click', (params) => {
      // 配置一个标识符，快速找到是哪个图表
      // params.graphType = '1';
      that.drillDown(params, datass, true);
    })
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  },

  other: (useData, component, that, dom, datass, measure, newName) => {
    const data = datass.measureInfos;
    let mychart = echarts.init(dom, 'westeros');
    let name = [];
    let datas = [];
    let title2 = '';
    let unit = '';

    // 判定名称是否含有‘-’，有的话截取最后一段，没有就是之前配置的数据，正常展示
    if (component.indexOf('-') >= 0) {
      const names = component.split('-')
      component = names[names.length - 1];
    }

    for (let i in data) {
      // 单位
      switch (data[i].UNIT) {
        case '百分比': unit = '%'; break;
        case '原始值': unit = ''; break;
        case '日': unit = ''; break;
        case '件数': unit = '件'; break;
        default: unit = data[i].UNIT; break;
      }

      title2 = checkTitle(data[i].timeType);
      const allData = data[i].measureData ? data[i].measureData : [];
      for (let j of allData) {
        name.push(j.dimensionValue);

        switch (unit) {
          case '万元': datas.push((j.measureValue / 10000).toFixed(2)); break;
          case '元': datas.push((j.measureValue * 1).toFixed(2)); break;
          case '%': datas.push((j.measureValue * 100).toFixed(2)); break;
          default: datas.push(j.measureValue); break;
        }
      }
    }
    if (measure.indexOf('&') >= 0) measure = measure.split('&')[0] + measure.split('&')[1];
    if (measure.indexOf('-不显示') >= 0) measure = measure.split('-不显示')[0] + measure.split('-不显示')[1];

    let option = {
      title: {
        text: `${component}\n指标：${measure}`,
        subtext: title2,
        left: 'center',
        textStyle: {
          color: '#008ACD',
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            show: true
          }
        },
        formatter: function (params) {
          let { data, name } = params[0];
          return `${name} : ${data}${unit}`
        }
      },
      toolbox: {
        right: 20,
        show: true,
        feature: {
          // saveAsImage: { show: true }
        }
      },
      // legend: {
      //   // textStyle: {
      //   //     color: '#fff',
      //   // },
      //   padding: [30, 0, 0, 0],
      //   data: [measure],
      //   selected: {}
      // },
      grid: {
        left: '3%',
        top: '80',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        axisLine: {
          lineStyle: {
            color: '#808eb7',
            width: 2
          },
        },
        axisLabel: {
          // formatter: function (params) {
          //   return setName(params)
          // },
          rotate: 60
        },
        data: name,
      },
      yAxis: [{
        // name: '',
        axisLine: {
          lineStyle: {
            color: '#808eb7',
            width: 2
          }
        },
        splitLine: { //分割线配置
          lineStyle: {
            color: "#AAAAAA56",
          }
        },
      }],
      series: []
    }

    let obj;

    if (useData) obj.label = { show: true, position: 'top' };
    switch (newName) {
      case '柱状图': obj = {
        type: 'bar',
        barMaxWidth: 30,
        data: datas,
        itemStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [{
              offset: 1,
              color: "#00ffff" // 0% 处的颜色
            },
            {
              offset: 0,
              color: "#3893e5" // 100% 处的颜色
            }
            ], false),
          },
        },
        animationDuration: 3000
      }; break;
      case '折线图': obj = {
        data: datas,
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 15,
        itemStyle: {
          color: "rgb(108,80,243)",
          borderColor: "#fff",
        },
        animationDuration: 3000
      }; break;
      default: obj = {
        data: datas,
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 15,
        itemStyle: {
          color: "rgb(108,80,243)",
          borderColor: "#fff",
        },
        animationDuration: 3000,
        areaStyle: {
          normal: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(108,80,243,0.4)',
            },
            {
              offset: 1,
              color: 'rgba(108,80,243,0)'
            }
            ], false),
            shadowColor: 'rgba(108,80,243, 0.9)',
            shadowBlur: 20
          }
        }
      }
    }
    option.series.push(obj);

    mychart.on('click', (params) => {
      // 配置一个标识符，快速找到是哪个图表
      // params.graphType = '1';
      that.drillDown(params, datass, true);
    })
    mychart.setOption(option, true);
    mychart.resize();           // 重置让echarts图表自适应高宽
  }
}