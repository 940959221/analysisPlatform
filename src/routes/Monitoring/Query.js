import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { Link } from 'dva/router';

@connect(({ mine, loading }) => ({
  mine,
  loading: loading.models.mine,
}))
@Form.create()
export default class Query extends PureComponent {
  state = {
    tabelListData: [],
  };

  componentDidMount() {
    console.log(this.props)
    this.loadData();
  }

  loadData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'mine/getUserInfo'
    }).then(() => {
      const { getUserInfoData } = this.props.mine;
      if (getUserInfoData.domain !== undefined) {
        dispatch({
          type: 'mine/getalarm',
          payload: {
            man: getUserInfoData.domain,
          },
        }).then(() => {
          const { mine: { getalarmData } } = this.props;
          this.setState({ tabelListData: getalarmData });
        }).catch((e) => {
          console.log(e)
        });
      }
    });
  }

  onConfirm = (e, record, falg) => {
    this.props.dispatch({
      type: 'mine/setflag',
      payload: {
        alarmId: record.alarmId,
        flag: falg,
      },
    }).then(() => {
      this.loadData();
    });
  }

  onDelete = (e, record, flag) => {
    if (record.webParam !== undefined && record.webParam === '/getresult/monitoring/specialcreate') {
      this.props.dispatch({
        type: 'mine/alarmspeProduct',
        payload: {
          alarmId: record.alarmId,
          operateType: flag,
        }
      }).then(() => {
        this.loadData();
      }).catch((e) => {
        message.warn(e.message)
      });
    } else {
      this.props.dispatch({
        type: 'mine/deleteProduct',
        payload: {
          alarmId: record.alarmId,
          operateType: 'd',
        }
      }).then(() => {
        this.loadData();
      }).catch((e) => {
        message.warn(e.message)
      });
    }
  }

  render() {
    const { loading, history } = this.props;
    const rowKey = (record, index) => {
      return index;
    }

    const columns = [
      {
        title: '????????????',
        dataIndex: 'alarmName',
        align: 'center',
        width: 100,
      },
      {
        title: '????????????',
        dataIndex: 'man',
        align: 'center',
        width: 160,
      },
      {
        title: '????????????',
        dataIndex: 'createTime',
        align: 'center',
        width: 100,
      },
      {
        title: '????????????',
        dataIndex: 'updateTime',
        align: 'center',
        width: 100,
      },
      {
        title: '????????????',
        dataIndex: 'flag',
        align: 'center',
        width: 80,
        render: (text, record, index) => {
          return (
            <span>
              <Popconfirm
                title={"??????????????????????????????"}
                onConfirm={e => this.onConfirm(e, record, 'T')}
                okText="??????"
                cancelText="??????"
              >
                <a href='#'>
                  <span style={{ color: record.flag === 'T' ? '#0088CC' : '#8c8484' }}>???</span>
                </a>
              </Popconfirm>
              <Divider type="vertical" />
              <Popconfirm
                title={"?????????????????????????????????"}
                onConfirm={e => this.onConfirm(e, record, 'F')}
                okText="??????"
                cancelText="??????"
              >
                <a href='#'>
                  <span style={{ color: record.flag === 'F' ? '#0088CC' : '#8c8484' }}>???</span>
                </a>
              </Popconfirm>
            </span>
          );
        }
      },
      {
        title: '????????????',
        dataIndex: 'insrncName',
        align: 'center',
        width: 140,
        render: (text, record, index) => {
          return (
            <span>
              <Link to={{ pathname: record.webParam, alarmId: record.alarmId, operaType: 'r', flag: 2 }}>??????</Link>
              <Divider type="vertical" />
              <Link to={{ pathname: record.webParam, alarmId: record.alarmId, operaType: 'r', flag: 1 }}>??????</Link>
              <Divider type="vertical" />
              <Popconfirm
                title={"???????????????????????????"}
                onConfirm={e => this.onDelete(e, record, 'd')}
                okText="??????"
                cancelText="??????"
              >
                <a herf='#'>??????</a>
              </Popconfirm>
            </span>
          );
        }
      },
    ];

    return (
      <PageHeaderLayout>
        <Card style={{ overflow: 'scroll' }}>
          <Table
            rowKey={rowKey}
            pagination={false}
            size='small'
            bordered
            onChange={this.handleTablePage}
            columns={columns}
            loading={loading}
            dataSource={this.state.tabelListData}
            pagination={{
              pageSize: 10,
            }}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}
