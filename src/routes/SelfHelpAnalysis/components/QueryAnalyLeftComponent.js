import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {Form, message, Tree, Spin} from 'snk-web';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;

@connect(({ analysis, loading }) => ({
  analysis,
  loading: loading.models.analysis,
}))
@Form.create()
export default class QueryAnalyLeftComponent extends PureComponent {
  state = {
    autoExpandParent: true,
  }

  componentDidMount() {}

  onExpand = (expandedKeys) => {
    this.props.root.onExpand(expandedKeys);
    this.setState({
      autoExpandParent: false,
    });
  }

  onCheck = (checkedKeys) => {
    this.props.root.onCheck(checkedKeys);
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item}/>;
    });
  }
 
  // 树形结构
  renderLeftForm () {
    const { loading, form: { getFieldDecorator, getFieldValue } } = this.props;
    const {getAllTableInfoData} = this.props;
    const treeData = [];
    if (getAllTableInfoData.length > 0) {
      getAllTableInfoData.map((i) => {
        let treeDataChild = {};
        treeDataChild['title'] = i.tbCname;
        treeDataChild['key'] = i.dbName +'-'+ i.tbId;
        let treeDataChildArr = [];
        i.farColumnDictList.map((k) => {
          let childList = {};
          childList['title'] = k.colCname;
          childList['key'] = k.colCname +'-'+ k.dbName +'-'+ k.tbId +'-'+ k.tbName +'-'+ k.colId +'-'+ k.colName +'-'+ i.tbCname;
          treeDataChildArr.push(childList);
        }); 
        treeDataChild['children'] = treeDataChildArr;
        treeData.push(treeDataChild);
      });
    }

    return(
    <Spin spinning={this.props.root.state.loadLeftData}>
     <Tree
        checkable
        onExpand={this.onExpand}
        expandedKeys={this.props.expandedKeys}
        defaultExpandAll
        onCheck={this.onCheck}
        checkedKeys={this.props.root.state.checkedKeys}
      >
        {this.renderTreeNodes(treeData)}
      </Tree>
    </Spin>
    );
  }

  render () {
    return (
      <div>
        {this.renderLeftForm()}
      </div>
    );
  }
}
