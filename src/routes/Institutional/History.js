import React, { Component } from 'react';
import { connect } from 'dva';
import { Col, Row, Form, Card, Spin, Button, message, Modal, Select, Collapse, Table } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const { Panel } = Collapse;
const FormItem = Form.Item;
const Option = Select.Option;

const up = <svg t="1581666623716" style={{width: 10, height: 18}} className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1447" width="200" height="200"><path d="M898 730c-6.4 0-12.8-2.4-17.7-7.3L512 354.4 143.7 722.7c-9.8 9.8-25.6 9.8-35.4 0-9.8-9.8-9.8-25.6 0-35.4l386-386c9.8-9.8 25.6-9.8 35.4 0l386 386c9.8 9.8 9.8 25.6 0 35.4-4.9 4.9-11.3 7.3-17.7 7.3z" fill="#d81e06" p-id="1448"></path></svg>
const down = <svg t="1581667660828" style={{width: 10, height: 18}} className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2706" width="200" height="200"><path d="M512 730c-6.4 0-12.8-2.4-17.7-7.3l-386-386c-9.8-9.8-9.8-25.6 0-35.4 9.8-9.8 25.6-9.8 35.4 0L512 669.6l368.3-368.3c9.8-9.8 25.6-9.8 35.4 0 9.8 9.8 9.8 25.6 0 35.4l-386 386c-4.9 4.9-11.3 7.3-17.7 7.3z" fill="#1afa29" p-id="2707"></path></svg>

// 绿色：1afa29，红色：d81e06

@connect(({ analysis, loading, umssouserinfo }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()

export default class History extends Component{
  constructor(props){
    super(props);
    this.state = {
      columns: [],            // 表头
      dataSource: [],         // 表格数据
      pageSize: 10,           // 显示几条一页
      timeArr: [],
      show: false,            // 表格区域是否显示
      ratLevel: '',           // 表示当前机构类型
      ratTimeSlot: '',        // 表示当前评级时间
      ratType: '',            // 选择的是季度还是年度
      tableData: [],          // 表格数据
    }
  }

  componentDidMount(){
    this.props.dispatch({
      type: 'analysis/in_select'
    })

    // 修改元素样式
    document.querySelector('.snk-page-wapper-content').style.overflow = 'auto';
    document.querySelector('.ant-card-body').style.height = '100%';
    document.querySelector('.ant-spin-nested-loading').style.height = '100%';
    document.querySelector('.ant-spin-container').style.height = '100%';
    document.querySelector('.ant-card-body').style.overflow = 'auto';
  }

  // 设置表头
  setcolumns = (ratLevel) => {
    // 下面的branch1和branch2是区别分公司和三级机构不同的两部分
    // columns为公共表头，并且后续成为当前模块的表头
    let branch1 = [
      {
        title: '综合成本率得分',
        dataIndex: 'compreScore',
        key: 'compreScore',
        width: 150,
        align: 'center',
      },
      {
        title: '综合成本率排名',
        dataIndex: 'compreRank',
        key: 'compreRank',
        width: 120,
        align: 'center',
        render: (text, record, index) => {
          return this.setText(text);
        }
      },
      {
        title: '业务管理得分',
        dataIndex: 'businessScore',
        key: 'businessScore',
        width: 150,
        align: 'center',
      },
      {
        title: '业务管理排名',
        dataIndex: 'businessRank',
        key: 'businessRank',
        width: 120,
        align: 'center',
        render: (text, record, index) => {
          return this.setText(text);
        }
      }
    ];
    let branch2 = [
      {
        title: '内控与风险得分',
        dataIndex: 'rickScore',
        key: 'rickScore',
        width: 150,
        align: 'center',
      },
      {
        title: '内控与风险排名',
        dataIndex: 'rickRank',
        key: 'rickRank',
        width: 120,
        align: 'center',
        render: (text, record, index) => {
          return this.setText(text);
        }
      },
      {
        title: '机构发展得分',
        dataIndex: 'developScore',
        key: 'developScore',
        width: 150,
        align: 'center',
      },
      {
        title: '机构发展排名',
        dataIndex: 'developRank',
        key: 'developRank',
        width: 120,
        align: 'center',
        render: (text, record, index) => {
          return this.setText(text);
        }
      },
    ];
    if(ratLevel !== 1){
      branch1 = [
        {
          title: '盈利能力得分',
          dataIndex: 'profitAbiScore',
          key: 'profitAbiScore',
          width: 150,
          align: 'center',
        },
        {
          title: '盈利能力排名',
          dataIndex: 'profitAbiRank',
          key: 'profitAbiRank',
          width: 120,
          align: 'center',
          render: (text, record, index) => {
            return this.setText(text);
          }
        }
      ];
      branch2 = [];
    }
    const columns = [
      {
        title: '排名',
        dataIndex: 'rank',
        key: 'rank',
        width: 100,
        align: 'center',
        fixed: 'left',
      },
      {
        title: '机构',
        dataIndex: 'company',
        key: 'company',
        width: 180,
        align: 'center',
        fixed: 'left',
      },
      {
        title: '总得分',
        dataIndex: 'score',
        key: 'score',
        width: 120,
        align: 'center',
      },
      {
        title: '评级',
        dataIndex: 'rate',
        key: 'rate',
        width: 60,
        align: 'center',
      },
      {
        title: '排名',
        dataIndex: 'rank1',
        key: 'rank1',
        width: 120,
        align: 'center',
        render: (text, record, index) => {
          return this.setText(text);
        }
      },
      {
        title: '规模能力得分',
        dataIndex: 'markScore',
        key: 'markScore',
        width: 150,
        align: 'center',
      },
      {
        title: '规模能力排名',
        dataIndex: 'markRank',
        key: 'markRank',
        width: 120,
        align: 'center',
        render: (text, record, index) => {
          return this.setText(text);
        }
      },
      ...branch1,
      {
        title: '人力资源效能得分',
        dataIndex: 'teamScore',
        key: 'teamScore',
        width: 150,
        align: 'center',
      },
      {
        title: '人力资源效能排名',
        dataIndex: 'teamRank',
        key: 'teamRank',
        width: 120,
        align: 'center',
        render: (text, record, index) => {
          return this.setText(text);
        }
      },
      ...branch2,
      {
        title: '加减分项',
        dataIndex: 'setScore',
        key: 'setScore',
        width: 100,
        align: 'center',
      },
    ];
    this.setState({ columns, ratLevel });
  }

  // 设置表格排名中的文字
  setText = (text) => {
    if(text === undefined) return <div></div>;
    const left = text.split('+')[0];
    const right = text.split('+')[1];
    let txt, color, svg;
    // 三种不同的文字展示类型，配合引入的svg设置当前文字展示
    if(right === '0'){
      txt = '-';
      color = '#000';
      svg = null;
    }else if(Number(right) > 0){
      txt = right;
      color = '#d81e06';
      svg = up;
    }else{
      txt = right.split('-')[1];
      color = '#1afa29';
      svg = down;
    }
    return (
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <div>{left}</div>&nbsp;&nbsp;
        <div style={{display: 'flex', color}}>(
          <div>{txt}</div>
          {svg})
        </div>
      </div>
    );
  }

  // 获取表格数据
  changePageSize = (pageSize, current) => {
    console.log(pageSize, current)
    const values = this.props.form.getFieldsValue();
    this.tableData(pageSize, current, values.companyType, values)
  }

  // 表格的分页信息
  paginationProps = () => {
    const { totalCount, pageSize } = this.state;
    const paginationProps = {
      pageSize,
      showSizeChanger: true,
      size: 'large',
      onShowSizeChange: (current, pageSize) => this.changePageSize(pageSize, current),
      onChange: (current, pageSize) => this.changePageSize(pageSize, current),
      showTotal: () => `共${totalCount}条数据`,
      total: totalCount,
      pageSizeOptions: ['10','20','50','100','150','200','300','500','700','1000'],
      showQuickJumper: true,
      defaultCurrent: 1
    }
    return paginationProps;
  }

  // 表格数据请求
  tableData(pageSize, pageIndex, ratLevel, values){
    let ratType;
    const type = values.type.split('评级')[1];
    if(type === '（年度）') ratType = '1';
    else ratType = '2';
    
    this.props.dispatch({
      type: 'analysis/in_hisQuery',
      payload: {
        ratTimeSlot: values.time,
        ratType,
        pageSize,
        pageIndex,
        ratLevel
      }
    }).then(() => {
      let data;
      const { params: { pageSize, recordCount, pageIndex } } = this.props.analysis.in_hisQueryData;
      const dataSource = [];
      if(ratLevel === 1) data = this.props.analysis.in_hisQueryData.tOrgRatResult2List;
      else data = this.props.analysis.in_hisQueryData.tOrgRatResult3List;
      
      // 调用函数设置表格头部
      this.setcolumns(ratLevel);
      for(let i in data){
        // source1和source2均为分公司和三级机构不同的两部分，dataSource则是公共部分，利用拓展运算符补充完整dataSource
        // 只是减少重复代码，没有实际意义，做法和表头一样
        let source1 = {
          markScore: data[i].scaleScore,
          markRank: data[i].scaleRank + '+' + `${data[i].scaleLift}`,
          compreScore: data[i].compreCostRateScore,
          compreRank: data[i].compreCostRateRank + '+' + `${data[i].compreCostRateLift}`,
          businessScore: data[i].busiManagScore,
          businessRank: data[i].busiManagRank + '+' + `${data[i].busiManagLift}`,
        };
        let source2 = {
          rickScore: data[i].workPerfScore,
          rickRank: data[i].workPerfRank + '+' + `${data[i].workPerfLift}`,
          developScore: data[i].orgScore,
          developRank: data[i].orgRank + '+' + `${data[i].orgLift}`,
        };
        if(ratLevel !== 1){
          source1 = {
            markScore: data[i].scaleAbilScore,
            markRank: data[i].scaleAbilRank + '+' + `${data[i].scaleAbilLift}`,
            profitAbiScore: data[i].profitAbilScore,
            profitAbiRank: data[i].profitAbilRank + '+' + `${data[i].profitAbilLift}`
          };
          source2 = {};
        }
        dataSource.push({
          key: data[i].companyCode,
          rank: (pageIndex - 1) * pageSize + Number(i) + 1,
          type: data[i].companyType,
          company: data[i].companyName,
          score: data[i].totalScore,
          rank1: data[i].rank + '+' + `${data[i].lift}`,
          rate: data[i].rat,
          ...source1,
          teamScore: data[i].humanEffiScore,
          teamRank: data[i].humanEffiRank + '+' + `${data[i].humanEffiLift}`,
          ...source2,
          setScore: data[i].bonus
        })
      }
      this.setState({ dataSource, totalCount: recordCount, pageSize, show: true, ratTimeSlot: values.time, ratType, tableData: data });
    })
  }

  // 查询
  query = () => {
    this.props.form.validateFields((err, values) => {
      if(err) return;
      this.tableData(10, 1, values.companyType, values)
    })
  }

  // 发布
  release = () => {

  }

  // 导出
  export = () => {
    const { ratLevel, ratType, ratTimeSlot } = this.state;
    let url;
    if(ratLevel === 1) url = `${SERVER}/branch/downlRatResult2`;
    else url = `${SERVER}/branch/downlRatResult3`;
    let TargetFrame = document.createElement("iframe");
    TargetFrame.setAttribute("name", 'download_frame');
    TargetFrame.setAttribute("style", "display:none");
    document.body.appendChild(TargetFrame);
    
    let form = document.createElement("form");
    form.setAttribute("style", "display:none");
    form.setAttribute("target", "download_frame");
    form.setAttribute("method", "post");
    form.setAttribute("action", url);
    form.setAttribute('enctype', 'multipart/form-data');

    let input2 = document.createElement("input");
    input2.setAttribute("type", "hidden");
    input2.setAttribute("name", "ratType");
    input2.setAttribute("value", ratType);
    form.appendChild(input2);

    let input3 = document.createElement("input");
    input3.setAttribute("type", "hidden");
    input3.setAttribute("name", "ratTimeSlot");
    input3.setAttribute("value", ratTimeSlot);
    form.appendChild(input3);

    document.body.appendChild(form);
    form.submit();
  }

  // 评级类型切换
  changeTime = (e) => {
    this.props.form.setFieldsValue({ time: '' });
    let timeArr;
    if(e === '正式评级（年度）') timeArr = this.props.analysis.in_selectData[1];
    else if(e === '模拟评级（季度）') timeArr = this.props.analysis.in_selectData[2];
    this.setState({ timeArr })
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    const { columns, dataSource, timeArr, show, ratLevel, tableData } = this.state;
    const gradeType = ['正式评级（年度）', '模拟评级（季度）'];
    const companyType = ['分公司评级', '三级机构评级'];
    return (
      <PageHeaderLayout>
        <Spin spinning={this.props.loading}>
          <Card style={{height: '100%'}}>
            <Form layout="inline"
              style={{ border: '1px solid #e8e8e8', borderBottom: 'none', textAlign: 'center', padding: '10px 0' }}>
              <Row>
                <Col>
                  <FormItem label='选择需要查看的评级类型'>
                    { getFieldDecorator('type', { 
                      initialValue: '',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{width: 130}} onChange={ this.changeTime }>
                        { gradeType.map((item) => {
                          return (
                            <Option value={item} key={item}>{item}</Option>
                          )
                        }) }
                      </Select>
                    ) }
                  </FormItem>
                  <FormItem label='选择需要查看的评级时间'>
                    { getFieldDecorator('time', { 
                      initialValue: '',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{width: 100}}>
                        { timeArr.map((item) => {
                          return (
                            <Option value={item.code} key={item.code}>{item.name}</Option>
                          )
                        }) }
                      </Select>
                    ) }
                  </FormItem>
                  <FormItem label='选择需要查看的机构类型'>
                    { getFieldDecorator('companyType', { 
                      initialValue: '',
                      rules: [{ required: true, message: '必选' }]
                    })(
                      <Select style={{width: 100}}>
                        { companyType.map((item, index) => {
                          return (
                            <Option value={index + 1} key={item}>{item}</Option>
                          )
                        }) }
                      </Select>
                    ) }
                  </FormItem>
                  <Button type='primary' onClick={ this.query }>查询</Button>
                </Col>
              </Row>
            </Form>
            <div style={show ? {marginTop: 20} : {display: 'none'}}>
              <Table
                columns={columns}
                // style={{display: tableShow}}
                dataSource={dataSource}
                bordered
                pagination={ this.paginationProps() }
                size="middle"
                scroll={ratLevel === 1 ? { x: 2300 } : { x: 1490 }}
              />
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <div>
                  <Button type='primary' disabled={tableData.length > 0 ? false : true} 
                    style={{marginRight: 15}} onClick={ this.release }>发布</Button>
                  <Button type='primary' disabled={tableData.length > 0 ? false : true} onClick={ this.export }>导出</Button>
                </div>
              </div>
            </div>
          </Card>
        </Spin>
      </PageHeaderLayout>
    )
  }
}