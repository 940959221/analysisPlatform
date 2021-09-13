import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Card, Spin, Button, message, Modal, Input, Collapse } from 'snk-web';

@connect(({ analysis, loading, umssouserinfo, global }) => ({    // umssouserinfo为用户的属性
  analysis,
  loading: loading.models.analysis,
  currentUser: umssouserinfo.currentUser,
  global
}))
@Form.create()
export default class Mode extends Component{
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentWillMount(){
    if(this.props.location.state === undefined){
      
    }
  }

  render(){
    return(
      <div></div>
    )
  }
}
