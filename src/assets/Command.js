const Command={
  //cmdQueue:new Array(),
  createAddCommand:function(option){
      var command={};
      $.extend(command,option)
      command.undo=function(zTree){
        console.log(this)
         zTree.removeNode(this.zTree.getNodeByTId(this.node));
         Command.updateNodes(this.nodeObj.tId,null);
      };
      return command;
  },
  createModifyCommand:function(option){
      var command={};
      $.extend(command,option)
      command.undo=function(){
        var curNode=this.zTree.getNodeByTId(this.node);
        curNode.name=this.beforeValue;
        this.zTree.updateNode(curNode);
      };
      return command;
  },
  createRemoveCommand:function(option){
      var command={};
      $.extend(command,option)
      command.undo=function(){
         var tmpNode=Command.addNodes(this,this.zTree.getNodeByTId(this.parentNode)?this.zTree.getNodeByTId(this.parentNode):null,this.nodeObj);
        //Command.print();
        if(this.preNode){
          tmpNode=this.zTree.moveNode(this.zTree.getNodeByTId(this.preNode),tmpNode,"next");
        }else  if(this.nextNode){
          tmpNode=this.zTree.moveNode(this.zTree.getNodeByTId(this.nextNode),tmpNode,"prev");
        }
        
      };
      return command;
  },
  updateNodes:function(oldNode,newNode){
        console.info("updateNodes");
       $.each(window.cmdQueue,function(k,v){
         if(v.preNode==oldNode){
           v.preNode=newNode;
         }
         if(v.nextNode==oldNode){
           v.nextNode=newNode;
         }
         if(v.parentNode==oldNode){
           v.parentNode=newNode;
         }if(v.node==oldNode){
           v.node=newNode;
         }
       });
   },
   addNodes:function(cmd,truefather,appendNode){
     var appendNodeJson=cmd.zTree.transformToArray(appendNode)[0];
     var appendNodeJsonFather=$.extend({},{"id":appendNodeJson.id,"name":appendNodeJson.name});
     var appendNodeFatherTreeNode=cmd.zTree.transformTozTreeNodes(appendNodeJsonFather);
     appendNodeFatherTreeNode=cmd.zTree.addNodes(truefather,appendNodeFatherTreeNode)[0];
     Command.updateNodes(appendNode.tId,appendNodeFatherTreeNode.tId);
     if(appendNode.children){
       $.each(appendNode.children,function(k,v){
         Command.addNodes(cmd,appendNodeFatherTreeNode,v);
       });
     }
     return appendNodeFatherTreeNode;
   },
   print:function(){
     console.info("print");
     $.each(window.cmdQueue,function(k,v){
       console.info(v);
     });
   },
   getOptions:function(node, zTree){
          var option={};
          option.nodeObj=node;
          option.zTree=zTree;
          option.node=node.tId;
          option.parentNode=node.parentTId;
          
          if(node.getPreNode()){
            option.preNode=node.getPreNode().tId;
          }
          if(node.getNextNode()){
            option.nextNode=node.getNextNode().tId;
          }
          
          return option;
    }
};
export default Command;

window.cmdQueue=new Array();