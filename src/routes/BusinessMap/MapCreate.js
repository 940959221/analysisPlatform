import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form, Button, Card, Input, Icon, message, Select, Table,
  Popconfirm, Divider, Spin, Collapse, Row, Col, Modal,
} from 'snk-web';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import $ from '../../assets/jquery-vendor.js';
import zTree from 'ztree';
import 'ztree/css/zTreeStyle/zTreeStyle.css';
import './ztree.less';
import Command from '../../assets/Command';

const deleteIcon = require('../../assets/delete.png');
const FormItem = Form.Item;
const Option = Select.Option;
const Panel = Collapse.Panel;

const dimNameColumn = 'riskkindcname';
const dimValueColumn = 'riskkindcode';
const dimTable = 'pub_its_risk';
const dimLevel = '1';
const dimDesc = '险种大类';
const dimValue = '03';
const domContext = {
  dimTable, dimNameColumn, dimValueColumn, dimValue, dimLevel, dimDesc,
};
const firstNodes = [{ name: '车险', pId: 'No.0', id: 'No.1', open: true, domContext, title: '车险' }];

@connect(({ analysis }) => ({
  analysis,
}))
@Form.create()
export default class MapCreate extends PureComponent {
  state = {
    count: 1,
    treeDomShow: false,
    curTarget: null,
    curTmpTarget: null,
    setting: {},
    modelName: '',
    modelID: this.props.location.state !== undefined ? this.props.location.state.modelID : null,
    loading: false,
    isSelect: false,
    pathData: this.props.location.state,
    operate: this.props.location.operate,
    alertModelVisible: false,
    deleteTreeNode: '',
    reNameModelVisible: false,
    showDimensionsDiv: true,
    companyCode: '',
    clickDom: [], // shift + click 点击的时候所选维度的集合
    clickDomIdArr: [], // shift + click 点击的时候所选维度id的集合
    allTree: [null],      // 每次操作的结果都会存入数组
    spaceArr: [],         // 撤回时渲染所需要的元素组
    selectArr: [],        // 撤回时渲染所需要的元素组
    parentArr: [],        // 撤回时渲染所需要的元素组
    changeName: false,    // 是否手动修改树结构名字
  };

  componentDidMount() {
    // ztree API文档 http://www.treejs.cn/v3/api.php 

    // 获取可编辑公司列表
    this.props.dispatch({
      type: 'analysis/getCompanyByUser',
    });

    // 获取过滤维度
    this.props.dispatch({
      type: 'analysis/getMapFilterDimensions',
    }).then(() => {
    }).catch((e) => {
      message.warn(e.message);
    });

    if (this.state.operate === 'check') {
      this.setState({ showDimensionsDiv: false });
    }

    // 回写数据
    if (this.state.pathData !== undefined) {
      this.setState({ allTree: [''] })
      $('#treeDom').removeAttr('style');
      $('#titles').css('display', 'none');
      this.props.dispatch({
        type: 'analysis/displayModelContent',
        payload: {
          modelID: this.state.pathData.modelID,
        }
      }).then(() => {
        const { getCompanyByUserData } = this.props.analysis;
        const companyCode = this.state.pathData.companyCode;
        getCompanyByUserData.map((item) => {
          if (Number(item.companyCode) === Number(companyCode)) {
            if (this.state.operate !== 'copy') {
              this.props.form.setFieldsValue({
                companyName: item.companyCode,
                modelName: this.state.pathData.modelName,
              });
            }

          }
        });
        const { displayModelContentData } = this.props.analysis;
        const zNodes = [];
        if (displayModelContentData.length > 0) {
          displayModelContentData.map((item) => {
            zNodes.push(JSON.parse(item));
          })
        }

        setTimeout(() => { // 回写 合计与 不合计
          const dom = document.getElementById("treeDom").getElementsByTagName('span');
          for (var i = 0; i < zNodes.length; i++) {
            if (zNodes[i].hasSelect === '1') {
              for (var j = 0; j < dom.length; j++) {
                if (dom[j].getAttribute('attrId') === zNodes[i].id) {
                  const domTid = dom[j].id.replace('span', 'a');
                  var obj = $("#" + domTid);
                  var editStr = "<span id='diySel_space_" + zNodes[i].id + "' >&nbsp;</span><select class='selDemo ' id='diySel_" + zNodes[i].id + "'><option value=1>合计</option><option value=0>不合计</option></select>";
                  obj.after(editStr);
                  document.getElementById("diySel_" + zNodes[i].id).value = zNodes[i].totalFlag;
                }
              }
            }
          }
        }, 100)
        $.fn.zTree.init($("#treeDom"), this.state.setting, zNodes);
        if (this.state.operate === 'copy') {
          this.setState({ companyCode, });
        } else {
          this.setState({ isSelect: true, companyCode, });
        }

        // 下面三行，在回显过来的时候调用方法保存元素，同时在state中存储当前的操作，即撤回最多撤回到当前的操作    ---汪秋童2019.12.31
        const zTree = $.fn.zTree.getZTreeObj('treeDom');
        this.record();
        this.state.allTree.push(JSON.stringify(zTree.getNodes()[0].children));
      });
    }

    var setting = {
      treeId: 'id',
      edit: {
        enable: true,
        showRemoveBtn: this.showRemoveBtn,
        showRenameBtn: true,
      },
      data: {
        keep: {
          parent: true,
          leaf: true
        },
        simpleData: {
          enable: true,
          idKey: "id",
        },
        key: {
          title: "title",
        }
      },
      callback: {
        onMouseUp: this.onMouseUp,
        beforeDrop: this.zTreeBeforeDrop, // 仅同层级节点间可拖动合并
        onDrop: this.zTreeOnDrop,
        onClick: this.zTreeOnClick,
        onRename: this.zTreeOnRename
      },
      view: {
        addHoverDom: this.addHoverDom, // 当鼠标移动到节点上时，显示用户自定义控件
        removeHoverDom: this.removeHoverDom,
        selectedMulti: false,
        addDiyDom: this.addDiyDom, // 在节点上添加自定义控件和事件
        showLine: true,
        showIcon: this.showIconForTree,
        showTitle: true,
      },
    };
    this.setState({ setting, });
    $.fn.zTree.init($("#treeDom"), setting, firstNodes);
    this.updateType();
    this.bindDom();
    console.log($.fn.zTree.init($("#treeDom"), setting, firstNodes).getNodes())
  }

  updateType = () => {
    var zTree = $.fn.zTree.getZTreeObj("treeDom"),
      nodes = zTree.getNodes();
    for (var i = 0, l = nodes.length; i < l; i++) {
      var num = nodes[i].children ? nodes[i].children.length : 0;
      nodes[i].name = nodes[i].name;
      zTree.updateNode(nodes[i]);
    }
  };

  bindDom = () => {
    $(".domBtnDiv").bind("mousedown", this.bindMouseDown);
  }

  showRemoveBtn = (treeId, treeNode) => {
    return false;
  }

  // 显示删除子节点按钮
  addHoverDom = (treeId, treeNode) => {
    const _this = this;
    var aObj = $("#" + treeNode.tId + "_a");
    if ($("#diyBtn_" + treeNode.num).length > 0) return;
    if (treeNode.children !== undefined && treeNode.children.length > 0) {
      var editStr = "<span id='diyBtn_space_" + treeNode.num + "'>&nbsp;</span><span id='diyBtn_" + treeNode.num + "' title='删除子节点' onfocus='this.blur();' style='width: 14px; height: 15px; display: inline-block; background: url(" + deleteIcon + ")'></span>";
      aObj.append(editStr);
      var btn = $("#diyBtn_" + treeNode.num);
      if (btn) btn.bind("click", function () {
        _this.setState({ alertModelVisible: true, deleteTreeNode: treeNode });
      });
    }
  }

  addDiyDom = (treeId, treeNode) => {
    if (treeNode) {
      const dom = document.getElementById("treeDom").getElementsByTagName('a');
      for (var i = 0; i < dom.length; i++) {
        if (dom[i].getAttribute('title') !== undefined) {
          if (treeNode.title === dom[i].getAttribute('title')) {
            dom[i].getElementsByTagName('span')[1].setAttribute('attrId', `${treeNode.id}`);
          }
        }
      }
    }
  };

  removeHoverDom = (treeId, treeNode) => {
    $("#diyBtn_" + treeNode.num).unbind().remove();
    $("#diyBtn_space_" + treeNode.num).unbind().remove();
  }

  showIconForTree = (treeId, treeNode) => {
    return treeNode.level != 0;
  };

  bindMouseDown = (e) => {
    var target = e.target;
    if (target.tagName !== 'DIV' && target != null) {
      var doc = $(document), target = $(target),
        docScrollTop = doc.scrollTop(),
        docScrollLeft = doc.scrollLeft();
      var curDom = $("<span>" + target.text() + "</span>");
      curDom.appendTo("body");

      curDom.css({
        "top": (e.clientY + docScrollTop + 3) + "px",
        "left": (e.clientX + docScrollLeft + 3) + "px",
        'position': 'absolute',
        'display': 'inline-block',
        'cursor': 'pointer',
        'padding': 2,
        'margin': '2px 10px',
        'backgroundColor': '#FFE6B0'
      });
      this.state.curTarget = target;
      this.state.curTmpTarget = curDom;

      doc.bind("mousemove", this.bindMouseMove);
      doc.bind("mouseup", this.bindMouseUp);
      doc.bind("selectstart", this.docSelect);
    }
    if (e.preventDefault) {
      e.preventDefault();
    }
  }

  bindMouseMove = (e) => {
    var doc = $(document),
      docScrollTop = doc.scrollTop(),
      docScrollLeft = doc.scrollLeft(),
      tmpTarget = this.state.curTmpTarget;
    if (tmpTarget) {
      tmpTarget.css({
        "top": (e.clientY + docScrollTop + 3) + "px",
        "left": (e.clientX + docScrollLeft + 3) + "px"
      });
    }
    return false;
  }

  bindMouseUp = (e) => {
    const tmpTarget = this.state.curTmpTarget;
    if (tmpTarget) tmpTarget.remove();

    var doc = $(document);
    doc.unbind("mousemove", this.bindMouseMove);
    doc.unbind("mouseup", this.bindMouseUp);
    doc.unbind("selectstart", this.docSelect);

    this.setState({ curTarget: null, curTmpTarget: null });
  }

  onMouseUp = (e, treeId, treeNode) => {

    if (treeNode !== null) this.record();     // 赶在添加之前调用方法保存数据    ---汪秋童2019.12.31

    const { analysis: { getMapFilterDimensionsData }, dispatch } = this.props;
    const target = this.state.curTarget, tmpTarget = this.state.curTmpTarget;
    const _this = this;
    if (!target) return;
    if (tmpTarget) tmpTarget.remove(); // 清除拖拽节点
    var zTree = $.fn.zTree.getZTreeObj("treeDom"), parentNode;
    const nodes = zTree.transformToArray(zTree.getNodes());
    if (treeNode != null) {
      const treeObj = $.fn.zTree.getZTreeObj('treeDom');
      const nodes = treeObj.transformToArray(treeObj.getNodes());
      const parentNode = treeNode;
      let targetNum;
      // 获取提示信息和父节点信息
      function getTitleNameAndParentNode(nodes, idOrder, itemName, itemList, clickType) {
        let n = 0, arr = [], idArr = [], titleNmae = '';
        idArr.push('No.' + idOrder.split('.')[1]); // 获取根节点id
        while (idOrder.indexOf('.', n) != -1) { // 获取'.'索引位置
          var m = idOrder.indexOf('.', n);
          n = m + 1;
          arr.push(m);
        }
        for (var i = 2; i < arr.length; i++) { // 获取父节点id序号
          var subId = idOrder.substring(0, arr[i]);
          idArr.push(subId);
        }
        let nodesName = [], parentNode = [];
        for (var j = 0; j < nodes.length; j++) {
          for (var k = 0; k < idArr.length; k++) {
            if (nodes[j].id === idArr[k]) {
              nodesName.push(nodes[j].name);
              parentNode.push(nodes[j]);
            }
          }
        }
        nodesName.push(itemName);
        if (clickType !== 'isShiftClick') {
          parentNode.push(treeNode);
        } else {
          parentNode.push(itemList);
        }
        return { nodesName, parentNode };
      }

      if (getMapFilterDimensionsData.length > 0) {
        this.setState({ loading: true });
        let dimNameColumn = '', dimValueColumn = '', dimTable = '', dimLevel = '', dimDesc = '',
          payloadData = [], parentDim = [];
        getMapFilterDimensionsData.forEach(function (i) {
          if (i.dimDesc === target.text()) {
            dimNameColumn = i.dimNameColumn;
            dimValueColumn = i.dimValueColumn;
            dimTable = i.dimTable;
            dimLevel = i.dimLevel;
            dimDesc = target.text();
          }
        }, this);
        // 拖拽放下的父元素包含在clickDom集合里面
        if (this.state.clickDomIdArr.length > 0 && this.state.clickDomIdArr.includes(treeNode.id)) {
          const clickDom = this.state.clickDom;
          for (var i = 0; i < clickDom.length; i++) {
            let parentDim = [];
            const nodesObj = getTitleNameAndParentNode(nodes, clickDom[i].id, clickDom[i].name, clickDom[i], 'isShiftClick');
            if (nodesObj.parentNode.length > 0) {
              nodesObj.parentNode.map((item) => {
                const tempObj = {
                  dimValueColumn: item.domContext.dimValueColumn,
                  dimNameColumn: item.domContext.dimNameColumn,
                  dimName: item.name,
                  dimValue: item.domContext.dimValue,
                  dimLevel: item.domContext.dimLevel,
                  dimTable: item.domContext.dimTable,
                  dimDesc: item.domContext.dimDesc,
                };
                parentDim.push(tempObj);
              });
            }
            const payloadList = {
              dimNameColumn,
              dimValueColumn,
              dimTable,
              dimLevel,
              dimDesc,
              parentDim,
            };
            payloadData.push(payloadList);
          }
        } else { // 直接拖拽过来 或者 拖拽放下的父元素不包含在clickDom集合里面
          const nodesObj = getTitleNameAndParentNode(nodes, parentNode.id, parentNode.name, {}, 'isClick');
          if (nodesObj.parentNode.length > 0) {
            nodesObj.parentNode.map((item) => {
              if (item.name !== '车险') {
                const tempObj = {
                  dimValueColumn: item.domContext.dimValueColumn,
                  dimNameColumn: item.domContext.dimNameColumn,
                  dimName: item.name,
                  dimValue: item.domContext.dimValue,
                  dimLevel: item.domContext.dimLevel,
                  dimTable: item.domContext.dimTable,
                  dimDesc: item.domContext.dimDesc,
                };
                parentDim.push(tempObj);
              }
            });
          }
          const payloadList = {
            dimNameColumn,
            dimValueColumn,
            dimTable,
            dimLevel,
            dimDesc,
            parentDim,
          };
          payloadData.push(payloadList);
        }
        if (payloadData.length > 0) {
          this.props.dispatch({
            type: 'analysis/getRealTimeDimContent',
            payload: payloadData
          }).then(() => {
            const { getDimContentData } = _this.props.analysis;
            // 拖拽放下的父元素包含在clickDom集合里面
            if (this.state.clickDomIdArr.length > 0 && this.state.clickDomIdArr.includes(treeNode.id)) {
              const clickDom = this.state.clickDom;
              for (var i = 0; i < clickDom.length; i++) {
                if (clickDom[i].isParent === false) {
                  clickDom[i].isParent = true;
                  // 添加下拉控件
                  var obj = $("#" + clickDom[i].tId + "_a");
                  var editStr = "<span id='diySel_space_" + clickDom[i].id + "' >&nbsp;</span><select class='selDemo ' id='diySel_" + clickDom[i].id + "'><option value=1>合计</option><option value=0 selected='selected'>不合计</option></select>";
                  obj.after(editStr);
                  for (var j = 0; j < getDimContentData.length; j++) {
                    if (clickDom[i].dimValue === getDimContentData[j].dimValue) {
                      if (getDimContentData[j].data.length > 0) {
                        for (var k = 0; k < getDimContentData[j].data.length; k++) {
                          const itemObj = getDimContentData[j].data[k];
                          const idOrder = clickDom[i].id + '.' + (k + 1); // 序号
                          const nodesObj = getTitleNameAndParentNode(nodes, idOrder, itemObj[dimNameColumn.toUpperCase()]);
                          const titleName = nodesObj.nodesName.join('-');
                          const domContext = {
                            dimTable, dimNameColumn, dimValueColumn, dimValue: itemObj[dimValueColumn.toUpperCase()],
                            dimLevel, dimDesc,
                          };
                          const list = {
                            name: itemObj[dimNameColumn.toUpperCase()],
                            dimValue: itemObj[dimValueColumn.toUpperCase()],
                            pId: clickDom[i].id, id: clickDom[i].id + '.' + (k + 1),
                            domContext,
                            title: titleName,
                            open: true
                          };
                          zTree.addNodes(clickDom[i], list);
                          // cmdQueue.push(Command.createAddCommand(Command.getOptions(zTree.addNodes(clickDom[i], list))));
                          treeObj.expandAll(true);
                          $("#" + clickDom[i].tId + "_a").css('background', '#fff');
                        }
                      }
                    }
                  }
                }
              }
              this.setState({ clickDom: [], clickDomIdArr: [] });

            } else { // 直接拖拽过来 或者 拖拽放下的父元素不包含在clickDom集合里面
              if (parentNode.isParent === false) { // 添加子节点
                parentNode.isParent = true;
                // 添加下拉控件
                var obj = $("#" + parentNode.tId + "_a");
                if (parentNode.id === 'No.1') { // 第一个根节点必须是合计
                  var editStr = "<span id='diySel_space_" + parentNode.id + "' >&nbsp;</span><select class='selDemo ' id='diySel_" + parentNode.id + "'><option value=1 selected='selected'>合计</option></select>";
                } else {
                  var editStr = "<span id='diySel_space_" + parentNode.id + "' >&nbsp;</span><select class='selDemo ' id='diySel_" + parentNode.id + "'><option value=1>合计</option><option value=0 selected='selected'>不合计</option></select>";
                }
                obj.after(editStr);

                // this.change(parentNode.id);    // 调用组件给下拉添加监听事件   ---汪秋童 2019.12.31

                for (var i = 0; i < getDimContentData.length; i++) {
                  if (getDimContentData[i].data.length > 0) {
                    for (var j = 0; j < getDimContentData[i].data.length; j++) {
                      const itemObj = getDimContentData[i].data[j];
                      const idOrder = parentNode.id + '.' + (j + 1); // 序号
                      const nodesObj = getTitleNameAndParentNode(nodes, idOrder, itemObj[dimNameColumn.toUpperCase()]);
                      const titleName = nodesObj.nodesName.join('-');
                      const domContext = {
                        dimTable, dimNameColumn, dimValueColumn, dimValue: itemObj[dimValueColumn.toUpperCase()],
                        dimLevel, dimDesc,
                      };
                      const list = {
                        name: itemObj[dimNameColumn.toUpperCase()],
                        dimValue: itemObj[dimValueColumn.toUpperCase()],
                        pId: parentNode.id,
                        id: parentNode.id + '.' + (j + 1),
                        domContext,
                        title: titleName,
                        open: true
                      };
                      zTree.addNodes(parentNode, list);
                      treeObj.expandAll(true);
                    }
                  }
                }
              }
            }
            this.state.allTree.push(JSON.stringify(zTree.getNodes()[0].children));
            _this.setState({ loading: false });
          }).catch((e) => {
            message.warn(e.message);
            _this.setState({ loading: false });
          });
        }
      }
    }
    this.setState({ curTarget: null, curTmpTarget: null, treeDomShow: true });
  }

  zTreeBeforeDrop = (treeId, treeNodes, targetNode, moveType) => {
    var moveNode = treeNodes[0];
    switch (moveType) {
      case "prev":
        if (moveNode.level == targetNode.level) {
          if (moveNode.pId === targetNode.pId) {
            if (moveNode.children !== undefined || targetNode.children !== undefined) {
              if (moveNode.children !== undefined && moveNode.children.length > 0) {
                message.warn('合并节点不能存在子节点');
              } else if (targetNode.children !== undefined && targetNode.children.length > 0) {
                message.warn('合并节点不能存在子节点');
              } else {
                return true;
              }
            } else {
              return true;
            }
          } else {
            message.warn('只允许兄弟节点进行合并', 0.8);
          }
        } else {
          message.warn('只允许同一层级的节点进行合并', 0.8);
        }
        break;
      case "next":
        if (moveNode.level == targetNode.level) {
          if (moveNode.pId === targetNode.pId) {
            if (moveNode.children !== undefined || targetNode.children !== undefined) {
              if (moveNode.children !== undefined && moveNode.children.length > 0) {
                message.warn('合并节点不能存在子节点');
              } else if (targetNode.children !== undefined && targetNode.children.length > 0) {
                message.warn('合并节点不能存在子节点');
              } else {
                return true;
              }
            } else {
              return true;
            }
          } else {
            message.warn('只允许兄弟节点进行合并', 0.8);
          }
        } else {
          message.warn('只允许同一层级的节点进行合并', 0.8);
        }
        break;
      case "inner":
        if (moveNode.level == targetNode.level) {
          if (moveNode.pId === targetNode.pId) {
            if (moveNode.children !== undefined || targetNode.children !== undefined) {
              if (moveNode.children !== undefined && moveNode.children.length > 0) {
                message.warn('合并节点不能存在子节点');
              } else if (targetNode.children !== undefined && targetNode.children.length > 0) {
                message.warn('合并节点不能存在子节点');
              } else {
                return true;
              }
            } else {
              return true;
            }
          } else {
            message.warn('只允许兄弟节点进行合并', 0.8);
          }
        } else {
          message.warn('只允许同一层级的节点进行合并', 0.8);
        }
        break;
    }
    return false;
  };

  zTreeOnDrop = (event, treeId, treeNodes, targetNode, moveType) => {

    this.record();     // 赶在合并之前调用方法保存数据    ---汪秋童2019.12.31

    var zTree = $.fn.zTree.getZTreeObj("treeDom");
    var nodes = zTree.transformToArray(zTree.getNodes());
    const idArr = this.state.clickDomIdArr;
    if (targetNode !== null) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = 0; j < idArr.length; j++) {
          // 如果合并对象或者拖拽对象是之前已经按shift键选择的，在集合里要把该对象去掉
          if (idArr[j] === targetNode.id || treeNodes[0].id === idArr[j]) {
            this.state.clickDomIdArr.splice(j, 1);
            this.state.clickDom.splice(j, 1);
            $("#" + targetNode.tId + "_a").css('background', '#fff');
            $("#" + treeNodes[0].tId + "_a").css('background', '#fff');
          }
        }
        //------------- 此处修改菜逼的一个bug，该菜逼在下面两个if判断时没有加上并且判断，导致所有同名节点都发生变化   ----汪秋童2019/12/6---------------
        if (nodes[i].name === treeNodes[0].name && nodes[i].tId === treeNodes[0].tId) {
          zTree.removeNode(nodes[i]); // 删除移动节点
        }
        if (nodes[i].name === targetNode.name && nodes[i].tId === targetNode.tId) {
          nodes[i].title = nodes[i].title + '+' + treeNodes[0].name;
          nodes[i].name = nodes[i].name + '+' + treeNodes[0].name;
          nodes[i].domContext.dimValue = nodes[i].domContext.dimValue + ',' + treeNodes[0].domContext.dimValue;
          nodes[i].dimValue = nodes[i].domContext.dimValue;
          zTree.updateNode(nodes[i]); // 跟新合并节点信息
        }
      }
    }
    this.state.allTree.push(JSON.stringify(zTree.getNodes()[0].children));
    this.onMouseUp;
  };

  // 点击节点
  zTreeOnClick = (e, treeId, treeNode) => {
    if (e.shiftKey) { // 指定同时按下shift键 + click
      if (this.state.clickDomIdArr.indexOf(treeNode.id) !== -1) { // 已经选中的节点
        $("#" + treeNode.tId + "_a").css('background', '#fff');
        if (this.state.clickDom.length > 0) {
          this.state.clickDom.forEach(function (i, index) {
            if (i.id === treeNode.id) {
              this.state.clickDom.splice(index, 1);
              this.state.clickDomIdArr.splice(index, 1);
            }
          }, this);
        }
      } else {
        // 当节点没有子节点的时候 允许操作
        if (treeNode.children === undefined || treeNode.children.length === 0) {
          if (this.state.clickDom.length > 0) {
            if (this.state.clickDom[0].pId !== treeNode.pId) { // 如果treeNode跟之前点击的不是同一个父节点，不允许操作
              message.warn('只能对同一个父节点下的子节点进行操作');
              return;
            } else {
              $("#" + treeNode.tId + "_a").css('background', 'rgb(226, 168, 90)');
              this.state.clickDom.push(treeNode);
              this.state.clickDomIdArr.push(treeNode.id);
            }
          } else {
            $("#" + treeNode.tId + "_a").css('background', 'rgb(226, 168, 90)');
            this.state.clickDom.push(treeNode);
            this.state.clickDomIdArr.push(treeNode.id);
          }
        }
      }
    }
  }

  submitForm = () => {
    const { setting, allTree, spaceArr, selectArr, parentArr } = this.state;
    // 获取所有节点
    const treeObj = $.fn.zTree.getZTreeObj('treeDom');
    const nodes = treeObj.transformToArray(treeObj.getNodes());
    const payloadData = [];
    console.log(nodes)
    nodes.map((item, index) => {
      if (item.children !== undefined && item.children.length > 0) { // 有子节点
        if (item.pId === null) { // '车险'节点
          const list = {
            name: item.name,
            id: item.id,
            pId: 'No.0',
            domContext: item.domContext,
            isParent: item.isParent,
            totalFlag: document.getElementById(`diySel_${item.id}`).value,
            title: item.title,
            open: true,
            hasSelect: '1',
            dimValue: null,
            changeName: item.changeName ? item.changeName : false
          };
          payloadData.push(list);
        } else { // '车险下面的节点'
          const list = {
            name: item.name,
            id: item.id,
            pId: item.pId,
            domContext: item.domContext,
            isParent: item.isParent,
            totalFlag: document.getElementById(`diySel_${item.id}`).value,
            title: item.title,
            open: true,
            hasSelect: '1',
            dimValue: item.dimValue,
            changeName: item.changeName ? item.changeName : false
          };
          payloadData.push(list);
        }
      } else { // 没有子节点
        if (item.pId === null) { // 只有'车险'
          const list = {
            name: item.name,
            id: item.id,
            pId: 'No.0',
            domContext: item.domContext,
            isParent: item.isParent,
            totalFlag: '0',
            title: item.title,
            open: true,
            hasSelect: '0',
            dimValue: null,
            changeName: item.changeName ? item.changeName : false
          };
          payloadData.push(list);
        } else { // 最后一层节点
          const list = {
            name: item.name,
            id: item.id,
            pId: item.pId,
            domContext: item.domContext,
            isParent: item.isParent,
            totalFlag: '0',
            title: item.title,
            open: true,
            hasSelect: '0',
            dimValue: item.dimValue,
            changeName: item.changeName ? item.changeName : false
          };
          payloadData.push(list);
        }
      }
    });
    const nodeInfos = [];
    const stateObj = { parentArr, allTree, selectArr, spaceArr };
    payloadData.map((i) => {
      const temp = {};
      temp['nodeID'] = i.id;
      temp['nodeContent'] = JSON.stringify(i)
      nodeInfos.push(temp);
    });

    this.props.form.validateFields((err, values) => {
      if (err) return;
      this.setState({ loading: true });
      this.props.dispatch({
        type: 'analysis/saveModel',
        payload: {
          modelID: this.state.operate === 'edit' ? this.state.modelID : null,
          modelName: values.modelName,
          companyCode: this.state.companyCode,
          nodeInfos,
        }
      }).then(() => {
        setTimeout(() => {
          this.setState({ loading: false, isSelect: false });
          $.fn.zTree.init($("#treeDom"), this.state.setting, firstNodes);
          this.props.form.setFieldsValue({ companyName: '', modelName: '' });
        }, 50);
      }).catch((e) => {
        message.warn(e.message);
        this.setState({ loading: false, });
      });
    });
  }

  // 重置
  onReset = () => {
    this.setState({ isSelect: false });
    $.fn.zTree.init($("#treeDom"), this.state.setting, firstNodes);
    if (this.state.operate !== 'copy') {
      this.props.form.setFieldsValue({ companyName: '', modelName: '' });
    }
  }

  // 删除节点
  onOkModel = (e) => {
    this.record();     // 赶在删除之前调用方法保存数据    ---汪秋童2019.12.31
    const zTree = $.fn.zTree.getZTreeObj('treeDom');
    var nodes = zTree.transformToArray(zTree.getNodes());
    for (var i = 0; i < nodes.length; i++) {
      if (this.state.deleteTreeNode.pId !== null) { // 第二层开始
        if (nodes[i].name === this.state.deleteTreeNode.name && nodes[i].tId === this.state.deleteTreeNode.tId) {
          if (nodes[i].children !== undefined && nodes[i].children.length > 0) { // 这里只删除子节点
            nodes[i].isParent = false;
            document.getElementById(`diySel_space_${nodes[i].id}`).remove();
            document.getElementById(`diySel_${nodes[i].id}`).remove();
            zTree.removeChildNodes(nodes[i]);
            document.getElementById(`${this.state.deleteTreeNode.tId}_switch`).style.backgroundPosition = '-56px -18px';
          }
        }
      } else { // 第一层
        $.fn.zTree.init($("#treeDom"), this.state.setting, firstNodes);
      }
    }
    this.state.allTree.push(JSON.stringify(zTree.getNodes()[0].children));
    this.setState({ alertModelVisible: false, deleteTreeNode: '', });
  }

  // 合计不合计切换   ---汪秋童 2019.12.31
  // change = (id) => {
  //   const element = document.getElementById(`diySel_${id}`);
  //   element.addEventListener('focus', () => {
  //     this.record();     // 赶在切换之前调用方法保存数据    ---汪秋童2019.12.31
  //   }, false);
  //   element.addEventListener('change', (e) => {
  //     console.log(id)
  //     e.stopPropagation();
  //     const zTree = $.fn.zTree.getZTreeObj('treeDom');
  //     this.state.allTree.push(JSON.stringify(zTree.getNodes()[0].children));
  //   }, false)
  // }

  // 修改名字   ---汪秋童 2019.12.31
  zTreeOnRename = (e, treeId, treeNode) => {
    this.record();     // 赶在删除之前调用方法保存数据    ---汪秋童2019.12.31
    treeNode.changeName = true;     // 以此证明是手动修改过名字的
    const zTree = $.fn.zTree.getZTreeObj('treeDom');
    this.state.allTree.push(JSON.stringify(zTree.getNodes()[0].children));
  }

  // ztree每次操作都需要执行的操作，改操作都只为了撤回    ---汪秋童 2019.12.31
  record() {
    const zTree_before = $.fn.zTree.getZTreeObj('treeDom');
    const nodes_before = zTree_before.transformToArray(zTree_before.getNodes());
    const spaceArr = [];            // 用来存放空格span元素
    const selectArr = [];           // 用来存放下拉select元素
    const parentArr = [];           // 用来存放节点parent元素
    for (var i = 0; i < nodes_before.length; i++) {
      const space = document.getElementById(`diySel_space_${nodes_before[i].id}`);
      const select = document.getElementById(`diySel_${nodes_before[i].id}`);
      const parent = document.getElementById(`${nodes_before[i].tId}_a`);
      if (space !== null) spaceArr.push(space);
      if (select !== null) selectArr.push({ value: select.value, ele: select })
      if (nodes_before[i].isParent) parentArr.push(parent)
    }
    console.log(selectArr)
    this.setState({ spaceArr, selectArr, parentArr });
  }

  // 点击撤回      ---汪秋童 2019.12.31
  undo = () => {
    const { allTree, spaceArr, selectArr, parentArr } = this.state;
    if (allTree.length === 1) return;      // 如果长度为1，说明就是原始操作，无需撤回
    if (allTree.length === 2 && allTree[0] === '') return;       // 如果是回显过来的数据，长度为2并且初始为空，说明不需要撤回操作

    // 如果下标为2的元素找不到，说明下面操作只执行了一次，所以直接重置
    if (JSON.parse(allTree[allTree.length - 2]) === null) {
      const firstNodes = [{ name: '车险', pId: 'No.0', id: 'No.1', open: true, domContext, title: '车险' }];
      $.fn.zTree.init($("#treeDom"), this.state.setting, firstNodes);
    } else {
      // 把储存的子项的数组倒数第二项作为子集，此处也可先对数组进行pop操作，改方法是后面再执行pop
      const firstNodes = [{
        name: '车险', pId: 'No.0', id: 'No.1',
        open: true, domContext, title: '车险', children: JSON.parse(allTree[allTree.length - 2])
      }];
      $.fn.zTree.init($("#treeDom"), this.state.setting, firstNodes);

      // 构建好树结构之后把原始树结构中带有的span元素和select元素一并加上
      const zTree_after = $.fn.zTree.getZTreeObj('treeDom');
      const nodes_after = zTree_after.transformToArray(zTree_after.getNodes());
      for (var i = 0; i < nodes_after.length; i++) {
        for (let j of parentArr) {
          if (`${nodes_after[i].tId}_a` === j.id && nodes_after[i].isParent) {
            ``
            const parent = $(`#${nodes_after[i].tId}_a`);
            for (let m of spaceArr) {
              if (m.id === `diySel_space_${nodes_after[i].id}`) parent.after(m);
            }
            for (let k of selectArr) {
              if (k.ele.id === `diySel_${nodes_after[i].id}`) {
                k.ele.value = k.value;
                parent.after(k.ele);
              }
            }
          }
        }
      }
    }
    // 删除数组最后一项元素
    allTree.pop();
    this.setState({ allTree });
  }

  render() {
    const { form: { getFieldDecorator },
      analysis: { getMapFilterDimensionsData, getCompanyByUserData }
    } = this.props;
    const DimensionsArr = [], enableCreateModelList = [], getCompanyByUser = [];

    // 公司列表
    if (getCompanyByUserData !== undefined && getCompanyByUserData.length > 0) {
      getCompanyByUserData.map((item) => {
        const list = (
          <Option value={item.companyCode}>
            {item.companycName}
          </Option>
        );
        getCompanyByUser.push(list);
      });
    }

    // 维度
    if (getMapFilterDimensionsData !== undefined && getMapFilterDimensionsData.length > 0) {
      getMapFilterDimensionsData.map((item, index) => {
        const list = (
          <span
            style={{ display: 'block', cursor: 'pointer', borderBottom: index + 1 === getMapFilterDimensionsData.length ? '' : '1px solid #999', padding: '4px 0' }}
            id={item.dimDesc + '+' + item.dimNameColumn + '+' + item.dimTable + '+' + item.dimValueColumn + '+' + item.level}>{item.dimDesc}</span>
        );
        DimensionsArr.push(list);
      });
    }

    return (
      <PageHeaderLayout>
        <Form layout="inline">
          <Card bordered={false}>
            <div>
              <div style={{ height: 44, display: this.state.operate === 'check' ? 'none' : '' }}>
                <Button onClick={this.onReset} style={{ margin: '0 16px' }}>重置</Button>
                <Button disabled={false} style={{ margin: '0 16px' }} onClick={this.submitForm}>保存</Button>
                <Button onClick={this.undo}>撤回</Button>
              </div>
              <Collapse defaultActiveKey={['1']} style={{ display: this.state.operate === 'check' ? 'none' : '' }}>
                <Panel header="公司名称和模型名称" key="1">
                  <Row>
                    <Col>
                      <FormItem label='公司名称'>
                        {getFieldDecorator('companyName', {
                          initialValue: '', rules: [{ required: true, message: '必选' }]
                        })(
                          <Select style={{ width: 260 }} onSelect={v => { this.setState({ companyCode: v }); }} disabled={this.state.isSelect}>
                            {getCompanyByUser.map((item) => { return item })}
                          </Select>
                        )}
                      </FormItem>
                      <FormItem label='模型名称'>
                        {getFieldDecorator('modelName', {
                          initialValue: '', rules: [{ required: true, max: 30, message: '必填且只允许输入30个字' }]
                        })(
                          <Input placeholder='请输入模型名称' style={{ width: 220 }} />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
              <div style={{ marginTop: 6, display: 'flex' }} >
                <div style={{ width: 180, fontSize: 14, textAlign: 'center', border: '1px solid #999', height: 400, overflow: 'hidden', display: this.state.showDimensionsDiv ? '' : 'none' }}>
                  <div style={{ borderBottom: '1px solid #999', padding: '4px 0', fontSize: 16, background: '#ece9e9', fontWeight: 'bold' }}>维度列表</div>
                  <div class='domBtnDiv'
                    style={{ overflowY: 'scroll', height: 360 }}>
                    {DimensionsArr.map((item) => { return item; })}
                  </div>
                </div>
                <div style={{ height: this.state.operate === 'check' ? 500 : 400, overflow: 'scroll', flex: 1, marginLeft: 10 }}>
                  <Spin spinning={this.state.loading}>
                    <ul id='treeDom' className="ztree" ref={(s) => { this.sContent = s }}></ul>
                  </Spin>
                </div>
              </div>
            </div>
          </Card>
          <Modal
            title="Modal"
            visible={this.state.alertModelVisible}
            onOk={(e) => this.onOkModel(e)}
            onCancel={(e) => { this.setState({ alertModelVisible: false, deleteTreeNodeName: '' }); }}
            okText="确认"
            cancelText="取消"
          >
            <p>请确定是否要删除该节点</p>
          </Modal>
        </Form>
      </PageHeaderLayout>
    );
  }
}
