import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Table, Button, Input, Divider, Popconfirm, Spin, Select, Tabs, Collapse, Radio, Row, Col, Pagination } from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './cardComponent.less';

const up = <svg t="1588054594161" className="icon" style={{ width: 15, height: 15 }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="11503" width="200" height="200"><path d="M434.666714 187.469324C297.43919 367.276666 160.191798 547.082201 22.964274 726.889542c-48.854624 64.034092-3.20604 156.297589 77.324255 156.297589h823.421135c80.530295 0 126.198748-92.263496 77.324256-156.297589C863.806396 547.082201 726.559004 367.276666 589.333286 187.469324c-38.933061-51.01125-115.733512-51.01125-154.666572 0z" fill="#1afa29" p-id="11504"></path></svg>
const down = <svg t="1588054628176" className="icon" style={{ width: 15, height: 15 }} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12283" width="200" height="200"><path d="M589.320643 836.512614c137.245586-179.809148 274.469497-359.614683 411.693408-539.422024 48.874492-64.014224 3.225908-156.297589-77.322449-156.297589H100.306592c-80.548357 0-126.195135 92.283365-77.342318 156.297589 137.24378 179.807341 274.467691 359.612876 411.713277 539.422024 38.933061 51.009444 115.711837 51.009444 154.643092 0z" fill="#d81e06" p-id="12284"></path></svg>

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis
}))
@Form.create()
export default class cardComponent extends Component {
  state = {

  };

  setCard = (item, week, month) => {
    let card;
    if (item.data1) {
      card =
        <div className={styles.smallFont}>
          <div>
            <div>{item.data}</div>
            <div className={styles.big}>{item.data2}</div>
          </div>
          <div>
            <div>{item.data1}</div>
            <div className={styles.big}>{item.data3}</div>
          </div>
          <div>
            <div>{item.data4}</div>
            <div className={styles.big}>{item.data5}</div>
          </div>
        </div>
    } else if (item.week) {
      card =
        <div>
          <div className={styles.bigFont}>{item.data}</div>
          <div className={styles.bottom}>
            <div>
              <span>周环比</span>
              <span className={styles.span}>{week > 0 ? up : down}</span>
              <span>{item.week}</span>
            </div>
            <div>
              <span>月环比</span>
              <span className={styles.span}>{month > 0 ? up : down}</span>
              <span>{item.month}</span>
            </div>
          </div>
        </div>
    } else {
      card =
        <div>
          <div className={styles.bigFont}>{item.data}</div>
        </div>
    }
    return card;
  }

  render() {
    const { cardArr } = this.props;
    return (
      <div style={{ width: 300 }}>
        { cardArr.map(item => {
          const week = parseInt(item.week);
          const month = parseInt(item.month);
          return (
            <div key={item.id} className={styles.box}>
              <div className={styles.warn} style={{ background: item.warn }}></div>
              <div className={styles.card} style={item.warn !== '#fff' ? { borderLeft: 'none' } : {}}>
                <div>{item.title}</div>
                {this.setCard(item, week, month)}
              </div>
            </div>
          )
        })}
      </div>
    );
  }
}
