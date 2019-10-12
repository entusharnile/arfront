import React, { Component } from 'react';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import axios from 'axios';
import config from '../../config';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { verifyOTP } from '../../Actions/signinAction.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import {getToken,setRedirectTo,getRedirectTo} from '../../Utils/services.js';

import { Link } from 'react-router-dom'


class TwoFactorLogin extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
			gCode: '',
			otpError: false,
      showProcess: '',
      pwdchangeMessage:'',
      status:'',
      otp: '',
      token: '',
      timeStamp: new Date(),
      loggingIn: false,
      twoFactorType : localStorage.getItem('twoFactorData') ? JSON.parse(localStorage.getItem('twoFactorData')) : ""
		};
    if(!localStorage.getItem('twoFactorData')) {
      this.props.history.push('/login');
      return false;
    }
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleEnter, false);
    let langData = {}
        if(localStorage.getItem('languageData')) {
          langData = JSON.parse(localStorage.getItem('languageData'));
        }
        if ( !langData || langData.global === undefined || !langData.global ) {
            axios.get(config.API_URL + `getLanguageText/1/global`)
                .then(res => {

        const languageData = res.data.data;
        localStorage.setItem('languageData', JSON.stringify(languageData))

        this.setState({
          two_step_verification : languageData['global']['two_step_verification'],
          enter_otp: languageData['global']['enter_otp'],
          label_continue: languageData['global']['label_continue'],
          backToLoginBtn : languageData['global']['backToLoginBtn'],
          resetPasswordBtnn : languageData['global']['resetPasswordBtnn'],
          otpPlaceholder : languageData['global']['enter_otp'],
          enter_token : languageData['global']['enter_token'],
          loggingInBtn: languageData.global['loggingInBtn']
        })
      })
      .catch(function (error) {
      });
    } else {
      const languageData = JSON.parse(localStorage.getItem('languageData'))
      this.setState({
        two_step_verification : languageData['global']['two_step_verification'],
        enter_otp: languageData['global']['enter_otp'],
        label_continue: languageData['global']['label_continue'],
        backToLoginBtn : languageData['global']['backToLoginBtn'],
        resetPasswordBtnn : languageData['global']['resetPasswordBtnn'],
        enter_token : languageData['global']['enter_token'],
        otpPlaceholder : languageData['global']['enter_otp'],
        loggingInBtn: languageData.global['loggingInBtn']
      })
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};

    if ( nextProps.userData != undefined && prevState.timeStamp != nextProps.timeStamp ) {
      if(localStorage.getItem('showLoader') == "false") {
        let userData = nextProps.userData;
        localStorage.removeItem('showRecaptcha');
        localStorage.removeItem('login_attempts');
        returnState.userData = nextProps.userData;
        if(userData.redirect_to != undefined && userData.redirect_to != null && userData.redirect_to != ''){
          setRedirectTo(userData.redirect_to);
          returnState.redirect_to = userData.redirect_to;
          returnState.redirect_url = getRedirectTo()
        }
        if(userData.redirect_to != undefined && userData.redirect_to != 'upgrade-account-to-stripe' && userData.redirect_to != 'upgrade-subscription-plan' && userData.is_bba_signed != undefined && userData.is_bba_signed == 1){
          returnState.status = 200;
          setRedirectTo(userData.redirect_to);
          localStorage.setItem('currentUserRole', userData.user.user_role_id);
          localStorage.setItem('userData', JSON.stringify(userData))
          localStorage.setItem('isLoggedIn', 1)
          localStorage.setItem('user_listing_settings', JSON.stringify(userData.user_listing_settings))
          returnState.showLoader = false;
          localStorage.setItem('languageData', JSON.stringify(userData.languageData))
          const stateData = {permissions: userData.globalPrivileges};
          localStorage.setItem('globalPrivileges', JSON.stringify(userData.globalPrivileges))
          localStorage.removeItem('twoFactorData');
          nextProps.history.push(getRedirectTo());
        } else {
          const  tempLoggedUserData= {
            userData : userData,
            currentUserRole : userData.user.user_role_id,
            isLoggedIn: 1,
            user_listing_settings:userData.user_listing_settings,
            access_token:getToken()
          }
          localStorage.setItem('tempLoggedUserData', JSON.stringify(tempLoggedUserData))
          if(userData.redirect_to != undefined && userData.redirect_to == 'upgrade-account-to-stripe'){
            nextProps.history.push('/upgrade-account-to-stripe');
          }else if(userData.redirect_to != undefined && userData.redirect_to == 'upgrade-subscription-plan'){
            nextProps.history.push('/upgrade-subscription-plan');
          } else{
            setRedirectTo('accept-agreement');
            nextProps.history.push('/accept-agreement');
          }
          returnState.showLoader = false;
        }
      }
    }
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      returnState.loggingIn = false;

      return returnState;
    }
    return returnState;
  }
  handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [event.target.name]: value });
	}

  submitOTP = () => {
    this.setState({otpError : false, tokenError: false, "loggingIn" : true})

    if(this.state.twoFactorType.render_view == 'sms_otp') {
      if(this.state.otp == '') {
        this.setState({otpError: true, "loggingIn" : false })
        return false;
      }
    } else {
      if(this.state.token == '') {
        this.setState({tokenError: true, "loggingIn" : false })
        return false;
      }
    }

    let formData = {}
    if(this.state.twoFactorType.render_view == 'sms_otp') {
      formData.smsOTP = this.state.otp;
    } else {
      formData.auth_token = this.state.token;
      formData.google_auth_code = this.state.twoFactorType.google_auth_code;
    }
    let twoFactorData = JSON.parse(localStorage.getItem('twoFactorData'))
    formData.email = twoFactorData.email;
    formData.password = twoFactorData.password;
    this.props.verifyOTP(formData, this.state.twoFactorType.render_view)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleEnter, false);
  }

  handleEnter = (e) => {
      let handleSubmitFunc = this.submitOTP;
      e = e || window.event;
      switch (e.which || e.keyCode) {
            case 13 : {
              handleSubmitFunc(e);
            }
                break;
      }
  }
  render() {
    let loginText = (this.state.loggingIn) ? this.state.loggingInBtn : this.state.label_continue;
    return (
      <div className="guest">
        <Header />
          <div className="login-container">
            <div className="login-main">
              <h1>{this.state.two_step_verification}</h1>
                <form>
                  <div className={(this.state.twoFactorType && this.state.twoFactorType.render_view == 'sms_otp') ? "form-group" : "no-display"}>
                    <label htmlFor="usr">{this.state.enter_otp}:</label>
                    <input name="otp" className={(this.state.otpError) ? "form-control field-error" : "form-control"} placeholder={this.state.otpPlaceholder}  type="text" value={this.state.otp} onChange={this.handleInputChange} />
                  </div>
                  <div className={(this.state.twoFactorType && this.state.twoFactorType.render_view == 'google_authenticator') ? "form-group" : "no-display"}>
                    <label htmlFor="usr">{this.state.enter_token}:</label>
                    <input name="token" className={(this.state.tokenError) ? "form-control field-error" : "form-control"} placeholder={this.state.tokenPlaceholder}  type="text" value={this.state.token} onChange={this.handleInputChange} />
                  </div>

                  <div className="form-group">
                    <div className="resetpswd pull-left">
                      <div className="submit">
                        <a className={(this.state.loggingIn) ? "button login-form-submit login-form-submit-anchor green" : "button login-form-submit login-form-submit-anchor"} disable={(this.state.loggingIn) ? "disable" : ""} onClick={(!this.state.loggingIn) ? this.submitOTP : (e) => e.preventDefault()}>{loginText} <img className={(this.state.loggingIn) ? "" : "no-display"} src="../images/btn-load.gif"/></a>
                      </div>
                    </div>
                  </div>
              </form>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  toast.dismiss();
  localStorage.setItem("showLoader", false);
  if (state.UserReducer.action === 'VERIFY_OTP' ) {
    if(state.UserReducer.data.status != 200) {
      toast.error(languageData.global[state.UserReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.userData = state.UserReducer.data.data
      returnState.message = languageData.global[state.UserReducer.data.message];
    }
  }
  return returnState;
}

const mapDispatchToProps = (dispatch) => {
  return {
    verifyOTP : bindActionCreators(verifyOTP, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TwoFactorLogin));
