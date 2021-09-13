import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Button, Checkbox, message } from 'snk-web';

const CheckboxGroup = Checkbox.Group;

@connect(({ analysis, loading, umssouserinfo }) => ({
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
}))
@Form.create()
export default class PublicModel extends Component {
  state = {
    indeterminate: {},    // 非全选对象
    checkAll: {},         // 全选对象
    portalObj: {},        // 所有数据对象
    checkedList: {},      // 当前选中的所有子项
  };

  componentDidMount() {
    const { down, url, type } = this.props;
    const { checkAll, checkedList, indeterminate } = this.state;
    const obj = {
      type: `analysis/${url ? url : 'portalList'}`,
      payload: !url ? {
        companyFlag: down ? '0' : '1'
      } : { type }
    }
    this.props.dispatch(obj).then(() => {
      const { analysis } = this.props;
      let data = url ? analysis[url + 'Data'] : analysis.portalListData;
      const portalObj = {};
      for (let i of data) {
        if (i.portalType.indexOf('-') < 0) {
          portalObj[i.portalName] = { num: i.portalType, children: [], id: i.id, disabled: i.copyStatus };
          if (i.isSubscribe === '1') {    // 回显订阅
            checkAll[i.portalType] = true;
            checkedList[i.portalType] = [];
          }
        }
      }
      for (let i in portalObj) {
        const checkedArr = [];
        for (let j of data) {
          if (j.portalType.indexOf('-') >= 0 && j.portalType.split('-')[0] === portalObj[i].num) {
            portalObj[i].children.push({ name: j.portalName, num: j.portalType, id: j.id, disabled: false });
            if (j.isSubscribe === '1') checkedArr.push(j.portalName);  // 回显订阅
          }
        }
        if (checkedArr.length > 0) {    // 回显订阅
          if (checkedArr.length === portalObj[i].children.length) {
            checkAll[portalObj[i].num] = true;
            indeterminate[portalObj[i].num] = false;
          } else {
            checkAll[portalObj[i].num] = false;
            indeterminate[portalObj[i].num] = true;
          }
          checkedList[portalObj[i].num] = checkedArr
        }
      }
      this.setState({ portalObj, checkAll, indeterminate, checkedList })
    })
  }

  // 点击全选
  onCheckAllChange = (e, num) => {
    const { checked } = e.target;
    const { checkAll, portalObj, checkedList, indeterminate } = this.state;
    checkAll[num] = checked;
    indeterminate[num] = false;
    const selectedList = [];
    for (let i in portalObj) {
      if (portalObj[i].num === num) {
        for (let j of portalObj[i].children) {
          selectedList.push(j.name)
        }
      }
    }
    checkedList[num] = checked ? selectedList : [];
    this.setState({ checkAll, checkedList, indeterminate })
  }

  // 点击子项
  onChange = (e, num, options) => {

    const { checkedList, indeterminate, checkAll } = this.state;
    indeterminate[num] = options.length > e.length && e.length > 0;
    checkAll[num] = options.length === e.length;
    checkedList[num] = e;
    this.setState({ checkedList, indeterminate, checkAll });
  }

  // 点击按钮
  save = () => {
    console.log(this.state);
    let portalList = this.publicFunction();
    const { down, saveUrl, type } = this.props;    // 如果有down，就是上级给下级复制，否则是下级主动复制上级的内容
    if (!portalList) return;

    console.log(portalList);
    if (saveUrl) portalList = portalList.map(item => {
      console.log(item);
      return item.portalId
    })
    const obj = {
      type: `analysis/${saveUrl ? saveUrl : 'copyPortal'}`,
      payload: !saveUrl ? {
        portalList,
        copyMode: down ? '0' : '1'
      } : { type, portalConfigIdList: portalList }
    }
    this.props.dispatch(obj).then(() => {
      message.success(type === '1' ? '订阅成功！' : (type === '2' ? '还原订阅成功！' : '复制成功！'));
    }, err => {
      message.error(err.message);
    })
  }

  // 公用获取已选子项的数组
  publicFunction = () => {
    const { checkedList, checkAll, portalObj } = this.state;
    const { hiddenSave, url } = this.props;    // hiddenSave的校验用于不同的父组件需要的参数不同
    const portalList = [];
    let data = url ? this.props.analysis[url + 'Data'] : this.props.analysis.portalListData;
    for (let i in checkAll) {
      // 选中过即会存在，判定是否有全选的，如果有则再判定是否该模块是否有子项，有则把所有子项插入，否则插入当前模块
      if (checkAll[i]) {
        for (let j in portalObj) {
          if (portalObj[j].num === i) {
            if (portalObj[j].children.length === 0) {
              if (!hiddenSave) portalList.push({ portalId: portalObj[j].id, portalType: portalObj[j].num });
              else portalList.push(portalObj[j].num);
            }
            else {
              for (let k of portalObj[j].children) {
                if (!hiddenSave) portalList.push({ portalId: k.id, portalType: k.num });
                else portalList.push(k.num);
              }
            }
          }
        }
      } else {  // 当前不是全选则判定是否存在部分选择，有则遍历数据同时校验是否存在‘-’并插入
        if (checkedList[i].length > 0) {
          for (let i of checkedList[i]) {
            for (let j of data) {
              if (j.portalName === i && j.portalType.indexOf('-') >= 0) {
                if (!hiddenSave) portalList.push({ portalId: j.id, portalType: j.portalType });
                else portalList.push(j.portalType);
              }
            }
          }
        }
      }
    }
    if (portalList.length === 0) {
      message.warn('请至少选择一个模块！');
      return null;
    };
    return portalList;
  }

  render() {
    const { indeterminate, checkAll, portalObj, checkedList } = this.state;
    const { hiddenSave, down, buttonName, analysis, url } = this.props;
    let data = url ? analysis[url + 'Data'] : analysis.portalListData;

    return (
      <React.Fragment>
        <h1>{down ? '本级' : '上级'}机构现有业务门户板块</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {Object.keys(portalObj).map(item => {
            const indeter = indeterminate[portalObj[item].num] ? true : false;
            const checkedAll = checkAll[portalObj[item].num] ? true : false;
            const { children } = portalObj[item];
            const options = [];
            for (let i of children) {
              options.push(i.name)
            }
            for (let i of data) {
              if (i.copyStatus) {
                if (portalObj[item].num === i.portalType.split('-')[0]) portalObj[item].disabled = true;
              }
            }
            return (
              <div key={portalObj[item].num} style={{ width: '50%', marginBottom: 20 }}>
                <Checkbox indeterminate={indeter} disabled={portalObj[item].disabled}
                  onChange={e => this.onCheckAllChange(e, portalObj[item].num)} checked={checkedAll}>
                  {item}
                </Checkbox>
                <CheckboxGroup options={options} value={checkedList[portalObj[item].num]}
                  disabled={portalObj[item].disabled}
                  style={{ display: 'flex', flexDirection: 'column', paddingLeft: 20 }}
                  onChange={e => this.onChange(e, portalObj[item].num, options)} />
              </div>
            )
          })}
        </div>
        {!hiddenSave && <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button type='primary' onClick={this.save}>{buttonName}</Button></div>}
      </React.Fragment>
    );
  }
}
