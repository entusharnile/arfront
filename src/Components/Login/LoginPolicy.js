import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import {accountReset, signTosAgreement,getAccountPrivileges } from '../../Actions/Accounts/accountAction.js';
import validator from 'validator';
import ReCAPTCHA from "react-google-recaptcha";
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import moment from 'moment';
import config from '../../config';
import HippaPolicy from '../../Components/Policies/HippaPolicy.js';
import BbaPolicy from '../../Components/Policies/BbaPolicy.js';
import { setToken,setRedirectTo,getRedirectTo } from '../../Utils/services.js';

class LoginPolicy extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      processingLoder: false,
      globalLang: {},
      isShowHippa: true,
      isShowBba: false,
      agree_checkbox: false,
      isHppaPolicyAccepted: false,
      isBbaPolicyAccepted: false,
      tempLoggedUserData: {},
      loginData:{},
      privilegeData:{}
    };
  }

  componentDidMount() {
    this.props.accountReset();
    let tempLoggedUserData = {};
    if (localStorage.getItem('tempLoggedUserData') && getRedirectTo() == '/accept-agreement') {
      tempLoggedUserData = JSON.parse(localStorage.getItem('tempLoggedUserData'));
    } else {
      this.redirectToLogin();
    }
    this.setState({ tempLoggedUserData: tempLoggedUserData })

    let langData = {}
    if (localStorage.getItem('languageData')) {
      langData = JSON.parse(localStorage.getItem('languageData'));
    }
    if (!langData || langData.global === undefined || !langData.global) {
      axios.get(config.API_URL + `getLanguageText/1/global`)
        .then(res => {

          const languageData = res.data.data;
          localStorage.setItem('languageData', JSON.stringify(languageData))
          this.setState({ globalLang: languageData.global })
        })
        .catch(function (error) {
        });
    } else {
      const languageData = JSON.parse(localStorage.getItem('languageData'))
      this.setState({ globalLang: languageData.global })
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      returnState.processingLoder = false;
    } else if (nextProps.loginData != undefined && Object.keys(nextProps.loginData).length > 0 && nextProps.loginData !== prevState.loginData ) {
      toast.dismiss()
      toast.success(prevState.globalLang[nextProps.message]);
      returnState.loginData = nextProps.loginData;
      setRedirectTo(nextProps.loginData.redirect_to);
      localStorage.setItem('currentUserRole', nextProps.loginData.user.user_role_id);
      localStorage.setItem('userData', JSON.stringify(nextProps.loginData))
      localStorage.setItem('isLoggedIn', 1)
      localStorage.setItem('user_listing_settings', JSON.stringify(nextProps.loginData.user_listing_settings));
      localStorage.setItem('languageData', JSON.stringify(nextProps.loginData.languageData))
      localStorage.setItem('globalPrivileges', JSON.stringify(nextProps.loginData.globalPrivileges))
      localStorage.removeItem('tempLoggedUserData')
      nextProps.history.push(getRedirectTo());
    }
    return returnState;
  }



  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  }

  handleChildChange = (value) => {
    this.setState(value)
  }

  toggleSignUpForm = (nextStep, isSubmit) => {
    isSubmit = isSubmit || false;
    this.setState({
      isShowHippa: false,
      isShowBba: (nextStep == 'isShowBba' || isSubmit == true) ? true : false,
      [nextStep]: true,
    })
    if (isSubmit) {
      this.setState({ processingLoder: true })
      let formData = {
        term_condition : (this.state.agree_checkbox) ? 1 : 0
      }
      this.props.signTosAgreement(formData);
    }
  }

  redirectToLogin = () => {
    this.props.history.push('/logout');
  }

  render() {
    return (
      <div className="guest">
        <div className="header login-policy-header">
          <div className="wrapper text-center">
            <a href="https://www.aestheticrecord.com/">
              <img src="/images/logo.png?v=123" />
            </a>
          </div>
        </div>
        <div className="wrapper">
          <div className="login-policy-wrapper">
            {/*  Hippa Policy Block START  */}
            <div className={(this.state.isShowHippa) ? 'hippa-block' : 'hippa-block hide'}>
              <HippaPolicy
                handleChildChange={this.handleChildChange}
                toggleSignUpForm={this.toggleSignUpForm}
                nextStep={'isShowBba'}
                globalLang={this.state.globalLang}
              />
            </div>
            {/*  Hippa Policy Block END  */}
            {/*  Bba Policy Block START  */}
            <div className={(this.state.isShowBba) ? 'bba-block' : 'bba-block hide'}>
              <BbaPolicy
                handleChildChange={this.handleChildChange}
                toggleSignUpForm={this.toggleSignUpForm}
                handleInputChange={this.handleInputChange}
                name="agree_checkbox"
                value={this.state.agree_checkbox}
                nextStep={'isShowBba'}
                processingLoder={this.state.processingLoder}
                globalLang={this.state.globalLang}
              />
            </div>
            {/*  Bba Policy Block END  */}
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => {
  let returnState = {};
  if (state.AccountReducer.action === "ACCEPT_TOS_AGREEMENT") {
    if (state.AccountReducer.data.status != 200) {
      toast.dismiss();
      const languageData = JSON.parse(localStorage.getItem('languageData'));
      toast.error(languageData.global[state.AccountReducer.data.message]);
      returnState.processingLoder = true;
    } else {
      returnState.loginData = state.AccountReducer.data.data;
      returnState.message = state.AccountReducer.data.message;
    }
  }
  return returnState;
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    accountReset:accountReset,
    signTosAgreement: signTosAgreement,
  }, dispatch)
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginPolicy));
