import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import { userSignInRequest } from '../../Actions/signinAction.js';
import validator from 'validator';
import ReCAPTCHA from "react-google-recaptcha";
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import moment from 'moment';
import config from '../../config';
import {getToken,setRedirectTo,getRedirectTo} from '../../Utils/services.js';
import loginBG from '../../images/login-bg.jpg';
import arPoweredBlack from '../../images/aestheticnext-powered-black.png';

class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            emailError: '',
            passwordError: '',
            loginMessage: null,
            showProcess: '',
            recaptcha: '',
            recaptchaInstance: '',
            status: '',
            showRecaptcha: localStorage.getItem('showRecaptcha'),
            blockIP: localStorage.getItem('blockIP'),
            recaptchaError: '',
            ResetCAPTCHA: 1,
            login_attempts: 1,
            toastId: '',
            sitekey: config.CAPTCHA_SITE_KEY,
            showModal: false,
            loggingIn: false,
            forceLoggingIn: false,
        };
        /*if(localStorage.getItem('blockIP') == 1) {
          this.props.history.push('/block-ip');
        }*/
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.forceLogIn = this.forceLogIn.bind(this);
        this.dismissModal = this.dismissModal.bind(this);
        this._reCaptchaRef = React.createRef();

        const _this = this;
        localStorage.removeItem('tempLoggedUserData')
        axios.get(config.API_URL + `privileges`)
                .then(res => {
              localStorage.removeItem('showRecaptcha')
          })
          .catch(function(error) {
            if(error.response && error.response.data.status == 602) {
              _this.props.history.push('/block-ip');
            }
          });

          // add user's country code to localStorage
        //  fetch("http://ip-api.com/json").then(res => res.json()).then((result) => { localStorage.setItem('cCode', result.countryCode.toLowerCase()) },(error) => { localStorage.setItem('cCode', 'us') });

    }
    componentWillUnmount() {
      document.removeEventListener('keydown', this.handleEnter, false);
    }
    componentDidUpdate(prevProps){
      if (this.props.login_attempts !== prevProps.login_attempts && localStorage.getItem('login_attempts') !== 1) {
          const newLoginAttempts = this.props.login_attempts;
          let showRecaptcha = false;
          let showshowModal = false;
          let forceLoggingIn = false;
          localStorage.setItem('login_attempts', newLoginAttempts);

          if (newLoginAttempts > config.SHOW_CAPTCHA_AFTER_COUNT || localStorage.getItem('showRecaptcha')) {
              if(parseInt(newLoginAttempts) - parseInt(config.SHOW_CAPTCHA_AFTER_COUNT)  > 1) {
                this._reCaptchaRef.reset()
              }
              showRecaptcha = true;
              localStorage.setItem('showRecaptcha', 1);
          }
          if (this.props.status == 601) {
              showshowModal = true;
          }
          this.setState({
              login_attempts: this.props.login_attempts ,
              showRecaptcha: (showRecaptcha) ? 1 : 0 ,
              showModal: (showshowModal) ? true : false,
              forceLoggingIn: (forceLoggingIn) ? true : false,
              loggingIn: false
          })
        } else if(this.props.status == 604) {
            this.props.history.push('/upgrade-account-to-stripe');
        } else if(this.props.status == 603) {
            this.props.history.push('/upgrade-subscription-plan');
        } else if(this.props.status == 602) {
            this.props.history.push('/accept-agreement');
        } else if(this.props.status == 605) {
            this.props.history.push('/two-factor-login');
        } else if(this.props.status == 200) {
          localStorage.setItem('languageData', JSON.stringify(this.props.userData.languageData))
          const stateData = {permissions: this.props.userData.globalPrivileges};
          localStorage.setItem('globalPrivileges', JSON.stringify(this.props.userData.globalPrivileges))

          // add user's country code to localStorage
          let cCode = (this.props.userData && this.props.userData.country_code) ? this.props.userData.country_code : 'us';
          localStorage.setItem('cCode', this.props.userData.country_code)
          // add user's country code to localStorage
          
          this.props.history.push(this.props.redirect_url);
        }
      }

    handleEnter = (e) => {
      let handleSubmitFunc = this.handleSubmit;
        e = e || window.event;
        switch (e.which || e.keyCode) {
              case 13 : {
                if(!this.state.showModal) {
                  handleSubmitFunc(e);
                }
              }
                  break;
        }
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
                        loginEmailLabel: languageData.global['loginEmailLabel'],
                        loginCloseBtn: languageData.global['loginCloseBtn'],
                        loginAccountLocked: languageData.global['loginAccountLocked'],
                        loginAccountLockedMsg: languageData.global['loginAccountLockedMsg'],
                        loginForgotLabel: languageData.global['loginForgotLabel'],
                        loginPasswordLabel: languageData.global['loginPasswordLabel'],
                        loginHeader: languageData.global['loginHeader'],
                        loginBtn: languageData.global['loginBtn'],
                        languageData:languageData,
                        alreadyLoginLabel: languageData.global['already_logged_in_header'],
                        loggingInBtn: languageData.global['loggingInBtn']
                    })
                })
                .catch(function(error) {
                });
        } else {
          const languageData = JSON.parse(localStorage.getItem('languageData'))
          this.setState({
              loginEmailLabel: languageData.global['loginEmailLabel'],
              loginCloseBtn: languageData.global['loginCloseBtn'],
              loginAccountLocked: languageData.global['loginAccountLocked'],
              loginAccountLockedMsg: languageData.global['loginAccountLockedMsg'],
              loginForgotLabel: languageData.global['loginForgotLabel'],
              loginPasswordLabel: languageData.global['loginPasswordLabel'],
              loginHeader: languageData.global['loginHeader'],
              loginBtn: languageData.global['loginBtn'],
              languageData: languageData,
              alreadyLoginLabel: languageData.global['already_logged_in_header'],
              loggingInBtn: languageData.global['loggingInBtn']
          })
          axios.get(config.API_URL + `getLanguageText/1/global`)
                .then(res => {
              let langData = res.data.data;
              languageData.global = langData.global;
              localStorage.setItem('languageData', JSON.stringify(languageData))
            })
            .catch(function(error) {
            });
        }

    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({
            [event.target.name]: value
        });
    }


    asyncScriptOnLoad = () => {
        this.setState({ callback: "called!" });
    };



    handleChange = (response) => {
        this.setState({ recaptchaError: response })
    };
    errorCallback = (response) => {
    };

    expiredCallback = () => {
        toast.error('Recaptcha has expired. Please verify it again!');
        this.setState({ recaptchaError: 'Recaptcha has expired. Please verify it again!' });
    };


    // handle reset
    resetRecaptcha = () => {
        const recaptchaInstance = this.state.recaptchaInstance;
        recaptchaInstance.reset();
    };

    forceLogIn = () => {
        this.setState({forceLoggingIn: true})
        let formData = {
            email: this.state.email,
            password: this.state.password,
            login_attempts: this.state.login_attempts,
            languageId: 1,
            is_need: 1
        }

        this.props.userSignInRequest(formData);
        //this.dismissModal();
    }

    dismissModal = () => {
        this.setState({ showModal: false })
    }

    handleSubmit(event) {

        event.preventDefault();

        //====Frontend validation=================
        let error = false;
        this.setState({ emailError: "", passwordError: "", "loggingIn" : true });

        if (typeof this.state.email === undefined || this.state.email === null || this.state.email === '') {
            toast.error("Email can not be blank!");
            error = true;
        } else if (!validator.isEmail(this.state.email)) {
            toast.error("Incorrect email address");

            error = true;
        }
        if (typeof this.state.password === undefined || this.state.password === null || this.state.password === '') {
            toast.error("Password can not be blank!");
            error = true;
        }

        if (this.state.showRecaptcha) {
            if (typeof this.state.recaptchaError === undefined || this.state.recaptchaError === null || this.state.recaptchaError.trim() === '') {
                toast.error("Please verify recaptcha!");
                error = true;
            }
        }
        if (error === true) {
          this.setState({"loggingIn" : false });
            return;
        }
        //======End frontend validation=========

        let formData = {
            email: this.state.email,
            password: this.state.password,
            login_attempts: (this.props.login_attempts) ? this.props.login_attempts : 1,
            languageId: 1
        }

        if(!localStorage.getItem('login_attempts')) {
          localStorage.setItem('login_attempts', 0)
        }
        this.props.userSignInRequest(formData);
    }
    render() {
        let loginText = (this.state.loggingIn) ? this.state.loggingInBtn : this.state.loginBtn;
        let forceloginText = (this.state.forceLoggingIn) ? this.state.loggingInBtn : this.state.loginBtn;

        return (
            <div className="guest no-padding arNextLoginguest">
            <div className="arNextLogin">
              <Header />
              <div className="login-main">
                  <h1>{this.state.loginHeader}</h1>
                  <form  >
                  <div className="form-group">
                    <label htmlFor="usr">{this.state.loginEmailLabel}:</label>
                    <input name="email" className="form-control" placeholder={this.state.loginEmailLabel} maxLength="500" type="text" id="UserEmailId" value={this.state.email} onChange={this.handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="pwd">{this.state.loginPasswordLabel}:</label>
                    <input name="password" className="form-control" placeholder={this.state.loginPasswordLabel} type="password" id="UserPassword" value={this.state.password} onChange={this.handleInputChange} />
                  </div>
                  <div className={(this.state.showRecaptcha) ? '' : 'no-display'}>
                  <ReCAPTCHA
                    style={{ display: "inline-block" }}
                    theme="light"
                    ref={el => { this._reCaptchaRef = el }}
                    sitekey={this.state.sitekey}
                    onChange={this.handleChange}
                    onExpired={this.expiredCallback}
                    onErrored={this.errorCallback}
                    asyncScriptOnLoad={this.asyncScriptOnLoad}
                  />
                  </div>
                  <div className="form-group">
                    <a className={(this.state.loggingIn) ? "button login-form-submit login-form-submit-anchor green" : "button login-form-submit login-form-submit-anchor"} disable={(this.state.loggingIn) ? "disable" : ""} onClick={(!this.state.loggingIn) ? this.handleSubmit : (e) => e.preventDefault()}>{loginText} <img className={(this.state.loggingIn) ? "" : "no-display"} src="../images/btn-load.gif"/></a>
                  </div>
                  <div className="text-center forgot-password"><Link to="/forgot-password">{this.state.loginForgotLabel}?</Link></div>

                </form>
              </div>
          </div>

          <div className="ar-next">
            <center><img src="/images/sponsor-recognition.png" alt="" className="sponsership"/></center>
            <div className="aestheticNextMain">
                <center><img src={arPoweredBlack} height="57" className="ar-next-logo"/></center>
                <h3 className="m-t-20">Have you secured your seats?</h3>
                <p className="m-b-20 m-t-5">If not, reserve them today! You don’t want to miss your chance to attend this game-changing event!</p>
                <a href="https://www.aestheticnext.com/product/" target="_blank">Get Tickets</a>
                <a href="https://www.aestheticnext.com/schedule" className="m-l-10" target="_blank">2019 Agenda</a>
            </div>
        </div>

        <form><div className={(this.state.showModal ? 'overlay' : '')}></div>
        <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className={(this.state.forceLoggingIn) ? "no-display" : "close"} data-dismiss="modal" onClick={this.dismissModal}>×</button>
                <h4 className="modal-title" id="model_title">{this.state.alreadyLoginLabel}{this.state.showModal}</h4>
              </div>
              <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                {this.state.loginAccountLockedMsg}
              </div>
              <div className="modal-footer" >
                <div className="col-md-12 text-left" id="footer-btn">
                  <button type="button" className={(this.state.forceLoggingIn) ? "no-display" : "btn defaut-btn loinCloseBtn"} data-dismiss="modal" onClick={this.dismissModal}>{this.state.loginCloseBtn}</button>
                  <button type="button" disable={(this.state.forceLoggingIn) ? "disable" : ""} className={(this.state.forceLoggingIn) ? "btn btn-success logout pull-right green-btn" : "btn btn-success logout pull-right"} data-dismiss="modal" onClick={(!this.state.forceLoggingIn) ? this.forceLogIn : (e) => e.preventDefault()}>{forceloginText} <img className={(this.state.forceLoggingIn) ? "" : "no-display"} src="../images/btn-load.gif" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </form>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnVisibilityChange draggable pauseOnHover />
        {/*<Footer />*/}
      </div>
        );
    }
}

const mapStateToProps = state => {
    if (state.UserReducer.action === "LOGIN") {
        const returnState = {};

        if (state.UserReducer.Logindata.status != 200) {
          if(localStorage.getItem('login_attempts')) {
            returnState.login_attempts = (parseInt(localStorage.getItem('login_attempts')) == 0) ? parseInt(localStorage.getItem('login_attempts')) + 2  : parseInt(localStorage.getItem('login_attempts')) + 1;
            returnState.loggingIn = false;
          }

          if (state.UserReducer.Logindata.status == 601) {
            returnState.showModal = true;
            returnState.loggingIn = false;
          } else {
            toast.dismiss();
            const languageData = JSON.parse(localStorage.getItem('languageData'));

            toast.error(languageData.global[state.UserReducer.Logindata.message]);
            returnState.loggingIn = false;
          }
          returnState.loginMessage = state.UserReducer.Logindata.message;
          returnState.status = state.UserReducer.Logindata.status;


        } else {
          const userData = state.UserReducer.Logindata.data;
          if(userData.render_view) {
            returnState.status = 605;
            returnState.twoFactorData = userData;
            localStorage.setItem('twoFactorData', JSON.stringify(userData))
          } else {
            returnState.status = 200;
            returnState.login_attempts = 1;
            returnState.loggingIn = true;
            localStorage.removeItem('showRecaptcha');
            localStorage.removeItem('login_attempts');
            returnState.userData = state.UserReducer.Logindata.data;
            if(userData.redirect_to != undefined && userData.redirect_to != null && userData.redirect_to != ''){
              setRedirectTo(userData.redirect_to);
              returnState.redirect_to = userData.redirect_to;
              returnState.redirect_url = getRedirectTo()
            }
            if(userData.redirect_to != undefined && userData.redirect_to != 'upgrade-account-to-stripe' && userData.redirect_to != 'upgrade-subscription-plan' && userData.is_bba_signed != undefined && userData.is_bba_signed == 1){
              returnState.status = 200;
              localStorage.setItem('currentUserRole', userData.user.user_role_id);
              localStorage.setItem('userData', JSON.stringify(userData))
              localStorage.setItem('isLoggedIn', 1)
              localStorage.setItem('user_listing_settings', JSON.stringify(userData.user_listing_settings))
            } else {
              if(userData.redirect_to != undefined && userData.redirect_to == 'upgrade-account-to-stripe'){
                returnState.status = 604;
              }else if(userData.redirect_to != undefined && userData.redirect_to == 'upgrade-subscription-plan'){
                returnState.status = 603;
              } else{
                setRedirectTo('accept-agreement');
                returnState.status = 602;
              }
              const  tempLoggedUserData= {
                userData : userData,
                currentUserRole : userData.user.user_role_id,
                isLoggedIn: 1,
                user_listing_settings:userData.user_listing_settings,
                access_token:getToken()
              }
              localStorage.setItem('tempLoggedUserData', JSON.stringify(tempLoggedUserData))
            }
          }
        }

        return returnState;
    } else {
        return {
            loginMessage: ''
        }
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        // same effect
        userSignInRequest: bindActionCreators(userSignInRequest, dispatch)
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Login));
