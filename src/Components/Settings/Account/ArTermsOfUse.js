import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { downloadTos,exportEmptyData } from '../../../Actions/Settings/settingsActions.js';

class ArTermsOfUse extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.state = {
      globalLang:languageData.global,
      showLoader: false,
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false){
      nextProps.exportEmptyData();
      returnState.showLoader = false;
    } else if (nextProps.tosFilePath != undefined && nextProps.tosFilePath !== null){
      nextProps.exportEmptyData();
      returnState.showLoader = false;
      window.open(nextProps.tosFilePath)
    }
    return returnState
  }

  downloadTos = () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if(userData !== undefined && userData.user !== undefined && userData.user.id !== undefined){
      this.setState({showLoader:true})
       this.props.downloadTos('AR')
    }
  }

  render() {
    return (
      <div id="content" className="content-terms">
        <div className="wide-popup">
          <div className="wide-popup-wrapper">
            <div className="popup-btns popup-three-btns">
  		          <a href="javascript:void(0);" onClick={this.downloadTos} type="button" className="header-select-btn line-btn" id="download_agreement" value="">{this.state.globalLang.label_download}</a>
  	          </div>
              <div className="content-ar-terms-of-use"></div>
          </div>
        </div>
        <div className={this.state.showLoader ? "new-loader full-fixed-loader text-left displayBlock" : "new-loader text-left full-fixed-loader"} >
          <div className="loader-outer">
            <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
            <div id="modal-confirm-text" className="popup-subtitle">
              {this.state.globalLang.Please_Wait}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "DOWNLOAD_TOS") {
    if (state.SettingReducer.data.status != 200) {
      toast.dismiss()
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.tosFilePath = state.SettingReducer.data.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ downloadTos: downloadTos,exportEmptyData:exportEmptyData}, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(ArTermsOfUse);
