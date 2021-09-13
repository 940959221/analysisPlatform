import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Row, Col, Select, Input, Button, Icon, Card, List,
} from 'snk-web';
import moment from 'moment';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './QueryTemplate.less';

const FormItem = Form.Item;
const { Option } = Select;

class QueryTemplate extends PureComponent {
  state = {
    expandForm: false,
  };

  toggleForm() {
    this.setState({ expandForm: true });
  }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="模板名称">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="系统">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">车险</Option>
                  <Option value="1">激活卡</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const { template: { list }, pagination, loading } = this.props;

    const ListItemContent = ({
      data: {
        classify, createAt, status, remark,
      },
    }) => (
      <div className={styles.listContent}>
        <div className={styles.listContentItem}>
          <span>系统</span>
          <p>{classify[0]}</p>
        </div>
        <div className={styles.listContentItem}>
          <span>开始时间</span>
          <p>{moment(createAt).format('YYYY-MM-DD HH:mm')}</p>
        </div>
        <div className={styles.listContentItem}>
          <span>状态</span>
          <p style={{ textAlign: 'center' }}>{status === 1 ? <Icon type="check-circle" style={{ color: 'green' }} /> : <Icon type="close-circle" style={{ color: 'red' }} />}</p>
        </div>
        <div className={styles.listContentItem}>
          {remark}
        </div>
      </div>
    );

    return (
      <PageHeaderLayout title="已有模板">
        <div className={styles.standardList}>
          <Card bordered={false}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <List
              size="large"
              rowKey="id"
              loading={loading}
              pagination={pagination}
              dataSource={list}
              renderItem={item => (
                <List.Item
                  actions={[<a>编辑</a>, <a>删除</a>]}
                >
                  <List.Item.Meta
                    title={item.templateName}
                    description={
                      <div>模板ID： {item.templateId}</div>
                    }
                  />
                  <ListItemContent data={item} />
                </List.Item>
              )}
            />
          </Card>
        </div>
      </PageHeaderLayout>
    );
  }
}

export default connect(({ template, loading }) => ({
  template,
  loading: loading.models.template,
}))(Form.create()(QueryTemplate));
