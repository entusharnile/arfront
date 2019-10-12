import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { doAutoLogin } from '../../Actions/signinAction.js';
import {getToken,setRedirectTo,getRedirectTo, logout} from '../../Utils/services.js';
import moment from 'moment';
import config from '../../config';

class AutoLogin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cipherKey : this.props.match.params.cipherKey
    };
  }

  componentDidMount() {
    if ( this.state.cipherKey ) {
      this.props.doAutoLogin(this.state.cipherKey);
    }
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.autoLoginData !== undefined && props.autoLoginData.status === 200 && props.autoLoginData.data !== state.autoLoginData ) {
       return {
         autoLoginData     : props.autoLoginData.data,
         autoLoginMessage  : ''
       }

     } else if ( props.autoLoginData !== undefined && props.autoLoginData.status !== 200 && props.autoLoginData.data !== state.autoLoginData ) {
       return {
         autoLoginData     : props.autoLoginData.data,
         autoLoginMessage  : props.autoLoginData.data,
       }
     }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    if ( this.state.autoLoginData !== null && this.state.autoLoginData !== '' && this.state.autoLoginData !== prevState.autoLoginData && this.state.autoLoginMessage !== null && this.state.autoLoginMessage !== '' ) {
      let curObj = this

      setTimeout(function(){
        curObj.props.history.push(`/login`);
      }, 1000)
    } else {
      if (this.props.login_attempts !== prevProps.login_attempts && localStorage.getItem('login_attempts') !== 1) {
          const newLoginAttempts = this.props.login_attempts;
          let showRecaptcha = false;
          let showshowModal = false;
          localStorage.setItem('login_attempts', 0);

          // if (newLoginAttempts > config.SHOW_CAPTCHA_AFTER_COUNT || localStorage.getItem('showRecaptcha')) {
          //     showRecaptcha = true;
          //     localStorage.setItem('showRecaptcha', 1);
          // }
          if (this.props.status == 601) {
              showshowModal = true;
          }
          this.setState({
              login_attempts: 0 ,
              showRecaptcha:  0 ,
              showModal: false,
              loggingIn: this.props.loggingIn
          })
        } else if(this.props.status == 604) {;
            this.props.history.push('/upgrade-account-to-stripe');
        } else if(this.props.status == 603) {;
            this.props.history.push('/upgrade-subscription-plan');
        } else if(this.props.status == 602) {;
            this.props.history.push('/accept-agreement');
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
  }

  render() {
    return (
      <div id="content">
        {(this.state.cipherKey) && <div className="autologin text-center">Logging you in ...</div>}

        {(!this.state.cipherKey) && <div className="autologin text-center">No key found</div>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData  = JSON.parse(localStorage.getItem("languageData"))
  const returnState   = {}

  if ( state.UserReducer.action === "DO_AUTO_LOGIN" ) {

    if ( state.UserReducer.footerData.status !== 200 ) {
      toast.error(languageData.global[state.UserReducer.footerData.message]);
      returnState.autoLoginData = state.UserReducer.footerData;
    } else {
      returnState.status = 200;
      returnState.autoLoginData = state.UserReducer.footerData;
      returnState.login_attempts = 1;
      returnState.loggingIn = true;
      localStorage.removeItem('showRecaptcha');
      localStorage.removeItem('login_attempts');
      const userData = state.UserReducer.footerData.data;
      returnState.userData = state.UserReducer.footerData.data;

      // add user's country code to localStorage
      let cCode = (userData && userData.country_code) ? userData.country_code : 'us';
      localStorage.setItem('cCode', userData.country_code)
      // add user's country code to localStorage

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
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({doAutoLogin: doAutoLogin}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AutoLogin));
