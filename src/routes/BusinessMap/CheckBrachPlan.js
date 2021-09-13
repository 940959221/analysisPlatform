import React, { PureComponent } from 'react';
import { Table } from 'snk-web';

export default class CheckBrachPlan extends PureComponent {
  state = {}
  componentDidMount() {

  }

  render() {
    const { datalist } = this.props;
    const columns = [
      {
        title: '序号',
        dataIndex: 'planId',
        align: 'center',
        width: 80,
        render: (text, record, index) => {
          return (
            <span>{index + 1}</span>
          );
        },
      },
      {
        title: '方案名称',
        dataIndex: 'planName',
        align: 'center',
        width: 200,
      },
      {
        title: '状态',
        dataIndex: 'runStatusName',
        align: 'center',
        width: 120,
      },
    ];
    return (
      <div>
        <Table
          columns={columns}
          dataSource={datalist}
          bordered
          pagination={{
            pageSize: 10,
          }}
        />
      </div>
    );
  }
}
