import React, { PureComponent } from 'react';
import { Form, Collapse, Card, Radio, Select, Button, Table } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const upIcon = require('../../assets/up.png');
const downIcon = require('../../assets/down.png');

const Panel = Collapse.Panel;
const itemBox = {
  display: 'flex',
  alignItems: 'center',
  margin: '10px 0'
}
const butBox = {
  width: 48,
  height: 21,
  display: 'flex',
  justifyContent: 'flex-end',
  marginRight: 5,
}
const commentStyle = {
  height: '100%',
  width: '21px',
}
const upBut = {
  marginLeft: 6,
  background: `url(${upIcon}) no-repeat`
}
const downBut = {
  background: `url(${downIcon}) no-repeat`,
}
const itemDiv = {
  display: 'flex',
  alignItems: 'center',
  width: 400,
}
const textStyle = {
  marginRight: 8,
  width: 58,
}

export default class BusinessType extends PureComponent {
  state = {
    radioValue: '',
    measureBoxHeight: 20,
    columns: [],
  }
  componentDidMount() {

  }

  change = (v) => {
    console.log(v)
  }

  clickSpan = (id, flag) => {
    const _this = this;
    const boxDom = document.getElementById('box');
    const dom = document.getElementById(id);
    const newDom = dom.cloneNode(true);
    const perDom = dom.previousElementSibling || dom.previousSbiling;
    const nextDom = dom.nextElementSibling || dom.nextSibling;
    const item = dom.children[1].children[1];
    function getDom(parameter1,parameter2) {
      parameter1.addEventListener('click',function(){_this.clickSpan(id,'down')}, false);
      parameter2.addEventListener('click',function(){_this.clickSpan(id,'up')}, false);
      //clone的节点无法触发changes事件，所以先对clone的下拉节点删除，在添加原先的节点，才能触发change
      newDom.children[1].removeChild(newDom.children[1].children[1]);
      newDom.children[1].insertBefore(item,newDom.children[1].children[1]); 
    }
    if (flag == 'up') {
      const downBut = document.getElementById(id + '-down');
      if (downBut.style.display === 'none') {
        newDom.children[0].children[0].style.display = '';
        perDom.children[0].children[0].style.display = 'none';
        getDom(newDom.children[0].children[0],newDom.children[0].children[1]);
      } else {
        if (perDom.children[0].children[1].style.display === 'none') {
          newDom.children[0].children[1].style.display = 'none';
          perDom.children[0].children[1].style.display = '';
          getDom(newDom.children[0].children[0],newDom.children[0].children[1]);
        }
      }
      boxDom.removeChild(dom);
      boxDom.insertBefore(newDom, perDom)
    } else {
      const upBut = document.getElementById(id + '-up');
      console.log(upBut)
      if (upBut.style.display === 'none') {
        newDom.children[0].children[1].style.display = '';
        nextDom.children[0].children[1].style.display = 'none';
        getDom(newDom.children[0].children[0],newDom.children[0].children[1]);
      } else {
        if (nextDom.children[0].children[0].style.display === 'none') {
          newDom.children[0].children[0].style.display = 'none';
          nextDom.children[0].children[0].style.display = '';
          getDom(newDom.children[0].children[0],newDom.children[0].children[1]);
        }
      }
      boxDom.removeChild(dom);
      boxDom.insertBefore(newDom, nextDom.nextSibling)
    }
  }

  getSelValue = (id,childId) => {
    const checkItem = document.getElementById(id).checked;
    const checkItemChild = document.getElementById(childId).getElementsByTagName('input');
    if (checkItemChild.length > 0) {
      for (var i = 0; i < checkItemChild.length; i++) {
        if (checkItem) {
          checkItemChild[i].checked = true;
        } else {
          checkItemChild[i].checked = false;
        }
      }
    }
  }

  clickMeasure = (m) => {
    const obj = ['保费类','件数类'];
    for (var i = 0; i < obj.length; i++) {
      if (m !== obj[i]) {
        document.getElementById(obj[i]).style.display = 'none';
      }
    }
    if (document.getElementById(m).style.display === 'none') {
      document.getElementById(m).style.display = '';
      this.setState({ measureBoxHeight: 50 });
    } else {
      document.getElementById(m).style.display = 'none';
      this.setState({ measureBoxHeight: 20 });
    }
  }

  renderForm = () => {
    const dataSource = [
      { objName: '渠道', objValue: 'channel' },
      { objName: '车辆细类', objValue: 'carType' },
      { objName: '新旧车', objValue: 'car' },
    ];
    const selectChildren = [];
    const statisticalTime = [
      { objName: '2019-06-01' },
      { objName: '2019-06-02' },
      { objName: '2019-06-03' }
    ];
    const riskCode = [
      { objName: '交强险' },
      { objName: '商业险' },
      { objName: '车险' }
    ];
    const measure = [
      {danwei: 'baofei',objName: '保费类', children: [{objName: '当年累计保费'},{objName: '保费累计同比'}]},
      {danwei: 'jianshu',objName: '件数类', children: [{objName: '占车险件数比例'},{objName: '当月件数'}]},
      {danwei: 'danjun',objName: '单均保费类', children: [{objName: '单均保费累计同比'},{objName: '当月单均保费'}]}
    ];
    return (
      <Form layout="inline">
        <Collapse defaultActiveKey={['1', '2']}>
          <Panel header="维度" key="1">
            <div id='box'>
              <div style={{ ...itemBox, margin: '6px 0' }} id='dataSource'>
                <span style={butBox}>
                  <span
                    style={{ ...commentStyle, ...downBut }}
                    onClick={e => this.clickSpan('dataSource', 'down')}
                    id='dataSource-down'
                  />
                  <span
                    style={{ ...commentStyle, ...upBut, display: 'none' }}
                    onClick={e => this.clickSpan('dataSource', 'up')}
                    id='dataSource-up'
                  />
                </span>
                <div>
                  <span style={{ marginRight: 20 }}>数据源</span>
                  <Radio.Group
                    onChange={e => { this.setState({ radioValue: e.target.value }) }}
                    value={this.state.radioValue}>
                    {
                      dataSource.map((i) => {
                        return (<Radio value={i.objValue}>{i.objName}</Radio>);
                      })
                    }
                  </Radio.Group>
                </div>
              </div>
              <div style={{ ...itemBox }} id='statisticalTime'>
                <span style={butBox}>
                  <span
                    style={{ ...commentStyle, ...downBut }}
                    onClick={e => this.clickSpan('statisticalTime', 'down')}
                    id='statisticalTime-down'
                  />
                  <span
                    style={{ ...commentStyle, ...upBut }}
                    onClick={e => this.clickSpan('statisticalTime', 'up')}
                    id='statisticalTime-up'
                  />
                </span>
                <div style={itemDiv}>
                  <span style={textStyle}>统计时间</span>
                   <Select
                    mode="multiple"
                    placeholder="Please select"
                    onChange={v => this.change(v)}
                  >
                    {
                      statisticalTime.map((i) => {
                        return (
                          <Select.Option value={i.objName}>{i.objName}</Select.Option>
                        );
                      })
                    }
                  </Select> 
                </div>
              </div>
              <div style={itemBox} id='riskCode'>
                <span style={butBox}>
                  <span
                    style={{ ...commentStyle, ...downBut, display: 'none' }}
                    onClick={e => this.clickSpan('riskCode', 'down')}
                    id='riskCode-down'
                  />
                  <span
                    style={{ ...commentStyle, ...upBut }}
                    onClick={e => this.clickSpan('riskCode', 'up')}
                    id='riskCode-up'
                  />
                </span>
                <div style={itemDiv}>
                  <span style={textStyle}>险种</span>
                  <Select
                    mode="multiple"
                    placeholder="Please select"
                    id='riskCode-sel'
                    onChange={v => { console.log(v) }}
                  >
                    {
                      riskCode.map((i) => {
                        return (
                          <Select.Option value={i.objName}>{i.objName}</Select.Option>
                        );
                      })
                    }
                  </Select>
                </div>
              </div>
            </div>
          </Panel>
          <Panel header="指标" key="2">
            <div style={{ height: this.state.measureBoxHeight }}>
              {
                measure.map((i) => {
                  return (
                    <span>
                      <span style={{ marginRight: 10, position: 'relative' }}>
                        <input 
                          type="checkbox" 
                          id={i.danwei} 
                          value={i.objName} 
                          style={{ verticalAlign: 'sub' }}
                          onChange={e=>this.getSelValue(i.danwei,i.objName)}
                        />
                        <span style={{ cursor: 'pointer', marginLeft: 4 }} 
                          onClick={e=>this.clickMeasure(i.objName)}>
                          {i.objName}
                        </span>
                      </span>
                      <span id={i.objName} style={{ position: 'absolute', bottom: 26, left: 48, display: 'none' }}>
                        [{i.objName}]的指标细类：
                        {
                          i.children.map((item) => {
                            return (
                              <span style={{ marginRight: 10 }}>
                                <input type="checkbox" name={item.objName} value={item.objName} style={{ verticalAlign: 'sub' }}/>
                                <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={e=>console.log(e)}>{item.objName}</span>
                              </span>
                            );
                          })
                        }
                      </span>
                    </span>
                  );
                })
              }
            </div>
          </Panel>
          <div style={{ textAlign: 'center', padding: '15px 0' }}>
            <Button>查询</Button>
            <Button style={{ margin:'0 12px' }}>重置</Button>
            <Button>导出</Button>
          </div>
          <Table 
            style={{ display: 'none' }}
            dataSource={[]} 
            columns={this.state.columns} 
          />
        </Collapse>
      </Form>
    );
  }

  render() {
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div>
            {this.renderForm()}
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
