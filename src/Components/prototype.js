import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';

class FileName extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }


  render() {
    return (
    );
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ActionName: ActionName }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(FileName));
