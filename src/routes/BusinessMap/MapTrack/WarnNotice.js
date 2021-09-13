import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select } from 'snk-web';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';
import styles from './MapTracking.less';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class MapTracking extends Component {
  state = {
    columns: [],      // 表头
    datas: [],        // 表格数据
    total: 0,         // 总数
    pageSize: 10,     // 当前页数量
    pageNum: 1,       // 当前页
    dataDate: '',     // 数据截止
  };

  componentDidMount() {
    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';

    const columns = [
      {
        title: '序号',
        width: 50,
        dataIndex: 'number',
        key: 'number',
        align: 'center',
        fixed: 'left'
      },
      {
        title: '预警指标',
        width: 150,
        dataIndex: 'measure',
        key: 'measure',
        align: 'center',
        fixed: 'left'
      },
      {
        title: '预警程度',
        width: 100,
        dataIndex: 'degree',
        key: 'degree',
        align: 'center'
      },
      {
        title: '预警时间段',
        width: 200,
        dataIndex: 'time',
        key: 'time',
        align: 'center'
      },
      {
        title: '预警时的实际值',
        width: 150,
        dataIndex: 'actualValue',
        key: 'actualValue',
        align: 'center'
      },
      {
        title: '预警时的环比值',
        width: 150,
        dataIndex: 'ratioValue',
        key: 'ratioValue',
        align: 'center'
      },
      {
        title: '预警结论',
        width: 150,
        dataIndex: 'alertText',
        key: 'alertText',
        align: 'center'
      },
      {
        title: '预警原因',
        width: 250,
        dataIndex: 'actualAlert',
        key: 'actualAlert',
        align: 'center'
      },
      {
        title: '所属方案',
        width: 200,
        dataIndex: 'plan',
        key: 'plan',
        align: 'center'
      },
      {
        title: '所属机构',
        width: 150,
        dataIndex: 'company',
        key: 'company',
        align: 'center',
      },
      {
        title: '所属业务单元',
        width: 150,
        dataIndex: 'busniess',
        key: 'busniess',
        align: 'center',
      },
      {
        title: '时间单位',
        width: 100,
        dataIndex: 'cycle',
        key: 'cycle',
        align: 'center',
      },
    ];

    this.getList();
    this.setState({ columns })
  }

  // 初始化获取表格数据
  getList = () => {
    this.props.dispatch({
      type: 'analysis/getAlertResult'
    }).then(() => {
      const { getAlertResultData } = this.props.analysis;
      // 因为后端没有做分页，所以前端进行分页，先获取前十数据
      const firstCount = getAlertResultData.slice(0, 10);
      const dataDate = getAlertResultData[0].dataDate

      this.setTable(0, firstCount, 10)
      this.setState({ total: getAlertResultData.length, dataDate })
    })
  }

  // 表格数据配置
  setTable = (prev, list, pageSize) => {
    const datas = [];
    for (let i in list) {
      let degree, actualValue, cycle;
      switch (list[i].colourType) {
        case 'red': degree = '红色'; break;
        case 'yellow': degree = '黄色'; break;
        case 'green': degree = '绿色'; break;
      }
      switch (list[i].unitFlag) {
        case '1': actualValue = list[i].measureValue ? (list[i].measureValue * 100).toFixed(2) + '%' : '0.00%'; break;
        case '0': actualValue = list[i].measureValue ? list[i].measureValue + '万元' : ''; break;
        case '2': actualValue = list[i].measureValue ? list[i].measureValue + '件' : ''; break;
        default: actualValue = list[i].measureValue ? list[i].measureValue : 0; break;
      }
      switch (list[i].alarmCycle) {
        case 'week': cycle = '周'; break;
        case 'month': cycle = '月'; break;
      }
      datas.push({
        key: list[i].hisId,
        number: prev + Number(i) + 1,
        measure: list[i].measureName,
        degree,
        time: list[i].startTime + ' ~ ' + list[i].endTime,
        actualValue,
        ratioValue: list[i].ratioValue ? (list[i].ratioValue * 100).toFixed(2) + '%' : '0.00%',
        alertText: list[i].alertText ? list[i].alertText : '',
        actualAlert: list[i].actualAlert ? (list[i].ratioAlert ? list[i].actualAlert + '，' + list[i].ratioAlert : list[i].actualAlert) :
          (list[i].ratioAlert ? list[i].ratioAlert : ''),
        plan: list[i].planName,
        company: list[i].companyName,
        busniess: list[i].nodeName,
        cycle
      })
    }
    this.setState({ datas, pageSize })
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    const { getAlertResultData } = this.props.analysis;
    const startNum = (current - 1) * pageSize;
    const nowCount = getAlertResultData.slice(startNum, startNum + pageSize);

    this.setTable(startNum, nowCount, pageSize)
  }

  // 表格的分页信息
  paginationProps = () => {
    const { total, pageSize } = this.state;
    const paginationProps = {
      pageSize,
      showSizeChanger: true,
      size: 'large',
      onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
      onChange: (current, pageSize) => this.changePageSize(pageSize, current),
      showTotal: () => `共${total}条数据`,
      total: total,
      pageSizeOptions: ['10', '20', '50', '100'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { columns, datas, dataDate } = this.state;
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{ height: '100%' }}>
            <header className={styles.header}>
              <div style={{ fontSize: 18 }}>
                <span className={styles.appName}>预警通知</span>
              </div>
              <div style={{ display: 'flex' }}>
                {/* <FormItem label='所属机构' style={{display: 'flex', marginRight: 20}}>
                  { getFieldDecorator('company', {})(
                    <Select style={{width: 100}}>
                      { ['全部'].map(item => {
                        return (
                          <Option key={item} value={item}>{item}</Option>
                        )
                      }) }
                    </Select>
                  ) }
                </FormItem> */}
                <span style={{ lineHeight: '40px' }}>数据截止：{dataDate}</span>
              </div>
            </header>
            <Table
              pagination={this.paginationProps()}
              columns={columns}
              style={{ marginTop: 20 }}
              bordered
              size='middle'
              scroll={{ x: 1800 }}
              dataSource={datas} />
          </Card>
        </Spin>
      </PageHeaderLayout>
    );
  }
}
