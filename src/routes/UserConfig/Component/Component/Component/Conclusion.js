import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Form, Spin, Tabs, Collapse, Select, Input, Radio, InputNumber, message, Button } from 'snk-web';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input;

const textStyle = {
  width: '100%',
  height: 400,
  border: 'solid 1px #000',
  borderRadius: 10,
  padding: 10,
  outline: 'none',
  cursor: 'text',
}

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading
}))
@Form.create()
export default class Conclusion extends Component {
  state = {
    formulaList: [],      // 需添加的相关公式
    inputNumber: false,   // 是否展示相关公式旁边的输入框
    chartsPanes: [],      // 相关维度
    measureList: [],      // 指标域
    newValue: '',         // 文本内容
    name: '',
    FName: '#智能公式#',  // 点击插入按钮，生成对应的文本
    TName: '#当前时间#',  // 点击插入按钮，生成对应的文本
    FCodeArr: [],         // 智能公式的数组集
    formulaNameList: [],  // 智能公式对应的参数名称
  };

  componentDidMount() {
    const formulaList = [
      { name: '正序', code: 'ascenOrder' },
      { name: '倒序', code: 'ReverseOrder' },
      { name: '大于', code: 'greatThan' },
      { name: '小于', code: 'lessThan' },
      { name: '整体', code: 'sum' },
      { name: '环比', code: 'liRat' },
      { name: '同比', code: 'yOny' },
    ];
    this.setState({ formulaList })
  }

  // 修改相关公式
  changeFormula = e => {
    let inputNumber;
    if (e === 'ascenOrder' || e === 'ReverseOrder' || e === 'greatThan' || e === 'lessThan') inputNumber = true;
    else inputNumber = false;
    this.setState({ inputNumber })
  }

  // 获取相关维度
  getDimension = () => {
    const { chartsPanes } = this.props.root.state;
    this.setState({ chartsPanes })
  }

  // 获取指标域
  getList = () => {
    const value = this.props.form.getFieldValue('dimension');
    if (value) this.props.root.getList('Conclusion', value);
  }

  // 修改选择展示的指标维度
  changeCharts = e => {
    if (e === undefined) this.setState({ measureList: [] })
    this.props.form.setFieldsValue({ measure: undefined })
  }

  // 截止当前时间
  getTime = () => {
    const { TName } = this.state;
    const code = '#endTime#';
    // 设置文本和code
    this.setText(TName, code)
  }

  // 插入上述智能公式
  getFormula = () => {
    const values = this.props.form.getFieldsValue();
    const { inputNumber, FName, formulaList, measureList, chartsPanes } = this.state;
    let code;
    if (values.dimension && values.formula && values.measure) {
      // 如果相关公式为前4个，同时又没填数字
      if (inputNumber && !values.number) {
        message.warn('请填写智能公式相关值！');
        return;
      }
      // 先拼接公式，如果有相关值再拼相关值加‘;’，否则直接拼‘;’
      code = 'expression_' + values.formula;
      if (inputNumber) code += `,${values.number};`;
      else code += ';';

      // 拼接相关维度
      code += `subGraph${values.dimension.split('+')[1]};`
      // 拼接指标域
      code += `${values.measure};`;

      // 配置当前公式的中文参数名
      console.log(measureList);
      console.log(values.measure);
      let num = '';
      if (inputNumber) num = values.number;
      const name1 = formulaList.filter(item => item.code === values.formula)[0].name + num;
      const name2 = chartsPanes.filter(item => item.key === values.dimension)[0].title;
      const name3 = measureList.filter(item => item.code === values.measure)[0].name;
      const name = name1 + '-' + name2 + '-' + name3;

      // 设置文本和code
      this.setText(FName, code, name);
    } else {
      message.warn('请填写智能公式相关值！')
    }
  }

  // 设置文本和code
  setText = (name, code, _name) => {
    const start = this.text.textAreaRef.selectionStart;   // 当前光标的位置
    const { TName, FName, FCodeArr, formulaNameList } = this.state;
    let newValue;

    let value = this.props.form.getFieldValue('textArea');
    if (value === undefined) value = '';

    // 如果加了5个位置后不相等，说明此时的光标正处于公式或者时间内，因为设定的时间和公式都是6个字符串
    const prevString = value.slice(0, start);
    const nextString = value.slice(0, start + 5);
    const prevCount = this.getCharCount(prevString, FName) + this.getCharCount(prevString, TName);
    const nextCount = this.getCharCount(nextString, FName) + this.getCharCount(nextString, TName);

    if (prevCount !== nextCount) {
      message.warn('请不要在时间或者公式中插入！');
      return;
    }

    // 如果当前是智能公式，则按当前光标的位置调整插入的顺序
    if (name === FName) {
      const prevFName = this.getCharCount(prevString, FName);
      FCodeArr.splice(prevFName, 0, code);
    }
    newValue = value.slice(0, start) + name + value.slice(start);

    if (_name) {
      const beforeValue = value.slice(0, start);
      let index = 0;
      for (let i = 0; i < beforeValue.length;) {
        if (value.slice(i, i + 6) === FName) {
          index += 1;
          i += 6;
        } else {
          i++
        }
      }
      formulaNameList.splice(index, 0, _name)
    }

    this.setState({ newValue, FCodeArr, formulaNameList });
    this.props.form.setFieldsValue({ textArea: newValue });
    this.text.textAreaRef.focus();
  }

  // 获取字符串中某些字符出现的次数
  getCharCount = (str, char) => {
    const regex = new RegExp(char, 'g');
    const result = str.match(regex);          //match方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。
    const count = !result ? 0 : result.length;
    return count;
  }

  // 监听文本框变化
  listen = e => {
    let { newValue, TName, FName } = this.state;
    const nowValue = e.target.value;
    const newCount = this.getCharCount(newValue, FName) + this.getCharCount(newValue, TName);
    const nowCount = this.getCharCount(nowValue, FName) + this.getCharCount(nowValue, TName);

    // 如果使用时间或者公式后的长度大于或等于现在的长度，说明用户正在删减文字或者直接替换文字
    if (newValue.length >= nowValue.length) {
      validateField.bind(this)('不允许修改公式或时间！');
      // 用户正在添加文字
    } else {
      validateField.bind(this)('不允许手动输入公式或时间！')
    }

    function validateField(message) {
      // 如果之前保存的文本信息中所包含的智能公式和时间，对比现在的是否变化
      if (newCount === nowCount) {
        this.setState({ newValue: nowValue })
      } else {
        message.warn(message);
        e.target.value = newValue
        this.props.form.setFieldsValue({ textArea: newValue });
      }
    }
  }

  submit = () => {
    const { FCodeArr, TName, FName } = this.state;
    const value = this.props.form.getFieldValue('textArea');
    let code = '';
    let FIndex = 0;
    let prevString = '';
    for (let i = 0; i < value.length;) {
      if (value.slice(i, i + 6) === TName) {
        prevAdd();
        code += '#endTime#';
        i += 6;
      } else if (value.slice(i, i + 6) === FName) {
        prevAdd();
        code += FCodeArr[FIndex];
        FIndex++;
        i += 6
      } else {
        prevString += value[i];
        i++
      }
    }
    prevAdd();
    function prevAdd() {
      if (prevString !== '') {
        code += `#${prevString}#`;
        prevString = '';
      }
    }
    console.log(code);
  }

  // 重置
  reserve = () => {
    this.props.form.setFieldsValue({ textArea: '' });
    this.setState({ FCodeArr: [], newValue: '', formulaNameList: [] })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { formulaList, inputNumber, chartsPanes, measureList, formulaNameList } = this.state;

    const wrapperCol = {
      xs: { span: 24, offset: 0 },
    }
    return (
      <div>
        <h2>智能公式相关值：</h2>
        <div style={{ display: 'flex' }}>
          <FormItem label='（1）需添加的相关公式' style={{ display: 'flex' }}>
            {getFieldDecorator('formula', {
              rules: [{ required: false, message: '必选' }]
            })(
              <Select style={{ width: 200 }} onChange={this.changeFormula}>
                {formulaList.map(item => {
                  return (
                    <Option title={item.name} key={item.code} value={item.code}>{item.name}</Option>
                  )
                })}
              </Select>
            )}
          </FormItem>
          <FormItem label='填写相关值' style={inputNumber ? { display: 'flex', marginLeft: 15 } : { display: 'none' }}>
            {getFieldDecorator('number', {
              rules: [{ required: false, message: '必选' }]
            })(
              <InputNumber style={{ width: 100 }}></InputNumber>
            )}
          </FormItem>
        </div>
        <FormItem label='（2）需添加的相关维度' style={{ display: 'flex' }}>
          {getFieldDecorator('dimension', {
            rules: [{ required: false, message: '必选' }]
          })(
            <Select style={{ width: 200 }} onFocus={this.getDimension} onChange={this.changeCharts}>
              {chartsPanes.map(item => {
                return (
                  <Option title={item.title} key={item.key} value={item.key}>{item.title}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label='（3）需选择的现指标域' style={{ display: 'flex' }}>
          {getFieldDecorator('measure', {
            rules: [{ required: false, message: '必选' }]
          })(
            <Select style={{ width: 200 }} onFocus={this.getList}>
              {measureList.map((item, index) => {
                return (
                  <Option title={item.name} key={item.code + '+' + index} value={item.code}>{item.name}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>

        <div>
          <h2>文本编辑框</h2>
          <div>
            <Button type='primary' onClick={this.getTime}>插入截止当前时间</Button>
            <Button type='primary' style={{ marginLeft: 15 }} onClick={this.getFormula}>插入上述智能公式</Button>
            <Button type='primary' style={{ marginLeft: 15 }} onClick={this.reserve}>重置</Button>
          </div>
          <div style={{ color: 'red' }}>*智能公式的具体值会在此处按文本框中的顺序显示，不包括截止当前时间</div>
          {formulaNameList.map((item, index) => {
            return (
              <p key={item + index} style={{ marginLeft: 10 }}>{Number(index) + 1 + '、' + item}</p>
            )
          })}
          {/* <p contenteditable='true' style={textStyle} onInput={this.listen} ref={e => this.textArea = e}></p> */}
          <FormItem style={{ display: 'flex', marginTop: 20, width: '100%' }} wrapperCol={wrapperCol}>
            {getFieldDecorator('textArea', {
              rules: [{ required: true, message: '必填' }]
            })(
              <TextArea style={{ width: '100' }} ref={e => this.text = e} rows={4} onInput={this.listen}></TextArea>
            )}
          </FormItem>
          {/* <Button onClick={this.submit}>提交</Button> */}
        </div>
      </div>
    );
  }
}
