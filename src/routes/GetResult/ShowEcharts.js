import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Input, Icon, Button, Cascader, Select, DatePicker
} from 'snk-web';
import echarts from 'echarts/lib/echarts'; // 必须
import 'echarts/lib/chart/bar';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';


@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine,
}))
@Form.create()
export default class ShowEcharts extends PureComponent {
  state = {};

  componentWillReceiveProps(nextProps) {
    const {getresultData} = nextProps;
    let xAxisData = [], seriesData = [];
    if (getresultData !== undefined && getresultData.length > 0) {
        getresultData.map((item)=> {
            xAxisData.push(item.countName);
            seriesData.push(item.count);
        });
        const option = {
            xAxis: {
                type: 'category',
                data: xAxisData
            },
            yAxis: {
                type: 'value'
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            series: [{
                data: seriesData,
                type: 'bar'
            }]
        };
        let lineEcharts = echarts.init(window.document.getElementById(`ecahrts`));
        lineEcharts.setOption(option,true);
        // lineEcharts.on('click',function(object){
        //     echarts.dispose(lineEcharts);

        // });
    }
  }

  render() {
    return (
        <div id='ecahrts' style={{width: '100%', minHeight: 400}}></div>
    );
  }
}
