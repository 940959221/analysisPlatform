import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Form,Checkbox} from 'snk-web';

const CheckboxGroup = Checkbox.Group;

@Form.create()
export default class Measure extends PureComponent {

  renderForm () {
    const {form: { getFieldDecorator, getFieldValue }, measure} = this.props;
    let measureArr = [];
    for (const i in measure) {
      this.props.root.state.measureList.push(measure[i].attrName + '-' + measure[i].attrCode);
      measureArr.push(measure[i].attrName);
    }

    return(
      <div>
          <Checkbox
          indeterminate={this.props.root.state.indeterminate}
          onChange={this.props.root.onCheckAllChange}
          checked={this.props.root.state.checkAll}
          style={{ display: this.props.root.state.measureAllSel !== undefined ? 'none' : ''}}
        >
          全选
        </Checkbox>   
        {getFieldDecorator('measure', { initialValue: this.props.root.state.checkedList })(
          <CheckboxGroup options={measureArr} onChange={this.props.root.onChangeMeasure} />
        )}
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
