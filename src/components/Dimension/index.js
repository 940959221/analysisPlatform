import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Form,Select} from 'snk-web';

const Option = Select.Option;

@Form.create()
export default class Dimension extends PureComponent {
   // 清空主维度
  cleanMainDin = (e) => {
    this.props.form.setFieldsValue({ mainDim: '', occupDim: [] });
  }

  renderForm () {
    const {form: { getFieldDecorator, getFieldValue }, getDimensions} = this.props;
    console.log(getDimensions)
    const readerDimension = getDimensions.map((item, index) => {
      let itemIndex = index + 1;
      const tempList = [];
      const tempListArr = [];
      const selectOption = [];
      item.tableDesc.map((i) => {
        const list = (
          <Option value={i.columnValue + '-' + i.level + '-' + i.columnName + '-' + item.dimTotalName}>{i.columnName}</Option>
        );
        tempList.push(list)
      })
      selectOption.push(tempList);
      return (
        <span key={item.dimTotalName} style={{ display: 'inline-block'}}>
          <span style={{ marginRight: 6 }}>{item.dimTotalName}</span>
          {getFieldDecorator(`customDim${index}`, { initialValue: '' })(
            <Select style={{ width: 100, margin: '0 14px 4px 0' }} allowClear
              onChange={e => this.cleanMainDin(e)}
              onSelect={e => this.props.root.handleChange(e, item.dimTotalName, item.dimTable)}
              disabled={this.props.root.state.dimensionSelectDisable}
              >
              {selectOption.map((k) => { return k })}
              <Option value={`${item.tableDesc[0].columnValue}` + '-' + '自定义分组' + '-' + item.dimTotalName} 
                style={{display: this.props.root.state.isCuston ? '' : 'none'}}>
                自定义分组
              </Option>
            </Select>
          )}
        </span>
      );
    });

    return(
      <div>
          {readerDimension}
      </div>
    );
  }
  
  render () {
    return (
      <div>
         {this.renderForm()}
      </div>
    );
  }
}
