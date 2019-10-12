import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import {accountReset, upgradeRecurlyToStripe,getAccountPrivileges } from '../../Actions/Accounts/accountAction.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import moment from 'moment';
import config from '../../config';
import HippaPolicyRecurly from '../../Components/Policies/HippaPolicyRecurly.js';
import { setToken,setRedirectTo,getRedirectTo } from '../../Utils/services.js';

var cardNumber = '';
var cardExpiry = '';
var cardCvc = '';
var stripeToken = '';
class RecurlyToStripe extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      globalLang: {},
      isShowHippa: true,
      isShowBba: false,
      agree_checkbox: false,
      isHppaPolicyAccepted: false,
      isBbaPolicyAccepted: false,
      tempLoggedUserData: {},

      stripeToken: '',
      processingLoder: false,
      skip_upgrade:0,
      stripe_inactive:0,
      isShowCardInfo:true,
      isShowHippa:false,
      loginData:{},
      privilegeData:{}
    };
  }

  componentDidMount() {
    let tempLoggedUserData = {};
    if (localStorage.getItem('tempLoggedUserData')) {
      tempLoggedUserData = JSON.parse(localStorage.getItem('tempLoggedUserData'));
      if(tempLoggedUserData.userData != undefined){
        if(tempLoggedUserData.userData.skip_upgrade != undefined ){
          this.setState({ skip_upgrade: tempLoggedUserData.userData.skip_upgrade})
        }
        if(tempLoggedUserData.userData.stripe_inactive != undefined ){
          this.setState({ stripe_inactive: tempLoggedUserData.userData.stripe_inactive})
        }
        if(tempLoggedUserData.userData.redirect_to != undefined && tempLoggedUserData.userData.redirect_to !== 'upgrade-account-to-stripe'){
          this.redirectToLogin();
        }
      }
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

    if (window.Stripe) {
      this.setState({ stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY) }, () => {
        this.generateStripeInput();
      });
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({ stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY) });
      }, () => {
        this.generateStripeInput();
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.processingLoder != undefined && nextProps.processingLoder == false) {
      returnState.processingLoder = false;
    } else if (nextProps.loginData != undefined && Object.keys(nextProps.loginData).length > 0 && nextProps.loginData !== prevState.loginData ) {
      toast.dismiss()
      toast.success(prevState.globalLang[nextProps.message]);
      returnState.loginData = nextProps.loginData;
      setRedirectTo(nextProps.loginData.redirect_to);
      if(nextProps.loginData.is_bba_signed != undefined && nextProps.loginData.is_bba_signed == 1){
        localStorage.setItem('currentUserRole', nextProps.loginData.user.user_role_id);
        localStorage.setItem('userData', JSON.stringify(nextProps.loginData))
        localStorage.setItem('isLoggedIn', 1)
        localStorage.setItem('user_listing_settings', JSON.stringify(nextProps.loginData.user_listing_settings));
        localStorage.setItem('languageData', JSON.stringify(nextProps.loginData.languageData))
        localStorage.setItem('globalPrivileges', JSON.stringify(nextProps.loginData.globalPrivileges))
        localStorage.removeItem('tempLoggedUserData')
        nextProps.history.push(getRedirectTo());
      } else {
        setRedirectTo('accept-agreement');
        let tempLoggedUserData = prevState.tempLoggedUserData;
        tempLoggedUserData.userData = nextProps.loginData;
        localStorage.setItem('tempLoggedUserData', JSON.stringify(tempLoggedUserData));
        nextProps.accountReset();
        nextProps.history.push(getRedirectTo());
      }
    }
    return returnState;
  }

  generateStripeInput = (type) => {
    var elements = this.state.stripe.elements();
    cardNumber = elements.create('cardNumber');
    cardExpiry = elements.create('cardExpiry');
    cardCvc = elements.create('cardCvc');
    cardNumber.mount('#stripe-card-number');
    cardExpiry.mount('#stripe-card-expiry');
    cardCvc.mount('#stripe-card-cvc');
  }

  generateStripeCardToken = () => {
    this.setState({ stripeToken: '', processingLoder: true });
    toast.dismiss();
    this.state.stripe.createToken(cardNumber).then((response) => {
      if (response.error) {
        this.setState({ stripeToken: '', processingLoder: false });
        toast.error(response.error.message)
      } else {
        stripeToken = response.token.id;
        if (stripeToken) {
          this.setState({ stripeToken: stripeToken, processingLoder: false,isShowCardInfo:false,isShowHippa:true });
        }
      }
    })
  }

  handleSubmit = () => {
    this.setState({processingLoder:true});
    let formData = {
      stripe_token  : this.state.stripeToken,
      return_type : 'login',
      stripe_inactive:this.state.stripe_inactive
    }
    this.props.upgradeRecurlyToStripe(formData)
  }

  redirectToDashboard = () => {
    const tempLoggedUserData = this.state.tempLoggedUserData;
    localStorage.setItem('currentUserRole', tempLoggedUserData.currentUserRole);
    localStorage.setItem('userData', JSON.stringify(tempLoggedUserData.userData))
    localStorage.setItem('isLoggedIn', tempLoggedUserData.isLoggedIn)
    localStorage.setItem('user_listing_settings', JSON.stringify(tempLoggedUserData.user_listing_settings))
    setToken(tempLoggedUserData.access_token);
    axios.get(config.API_URL + `privileges`)
      .then(privilegeResponse => {
        const priviligeData = privilegeResponse.data.data;
        const stateData = { permissions: priviligeData.permissions };
        localStorage.setItem('globalPrivileges', JSON.stringify(priviligeData))
        this.props.history.push(getRedirectTo());
      })
      .catch(function (privilegeError) {
      });
  }

  redirectToLogin = () => {
    this.props.history.push('/logout');
  }

  render() {
    return (
      <div className="guest">
        <Header />
        <div className="wrapper">
          {/*  Card Details START  */}
          <div className={(this.state.isShowCardInfo) ? 'card-block' : 'card-block hide'}>
            <div className='login-main  recurly-to-stripe-main sign-up-main'>
              <form action="javascript:void(0);" onSubmit={this.generateStripeCardToken}>
                <h1 className="login-title">{this.state.globalLang.update_credit_card_details}</h1>
                <div className="login-title-description">{this.state.globalLang.update_credit_card_details_notes}
  		          </div>
                <div className="form-group row">
                  <div className="col-sm-12 first-name">
                    <label>{this.state.globalLang.signup_label_card_number}<span className="required">*</span></label>
                    <div className='form-control card-details' id="stripe-card-number"></div>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-12 first-name">
                    <label>{this.state.globalLang.signup_label_security_code}<span className="required">*</span></label>
                    <div className='form-control card-details' id="stripe-card-cvc"></div>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-12 first-name">
                    <label>{this.state.globalLang.signup_label_expiration_date}<span className="required">*</span></label>
                    <div className='form-control card-details' id="stripe-card-expiry"></div>
                  </div>
                </div>
                <div className="form-group row no-margin-bottom">
            			<div className="col-sm-6 text-left">
                    {(this.state.skip_upgrade) ?
              				<button disabled={this.state.processingLoder} className="btn btn-danger skip-upgrade" onClick={this.redirectToDashboard}>{this.state.globalLang.upgrade_button_skip}</button>
                      :
                      null
                    }
                    </div>
            			<div className="col-sm-6 text-right">
                    <button  disabled={this.state.processingLoder} className={(this.state.processingLoder) ? "btn btn-success green" : "btn btn-success"}>{(this.state.processingLoder) ? this.state.globalLang.signup_please_wait : this.state.globalLang.signup_button_continue}
                      <img className={(this.state.processingLoder) ? "" : "no-display"} src="../images/btn-load.gif"/>
                    </button>
            			</div>
            		</div>
              </form>
            </div>
          </div>
          {/*  Card Details END  */}
          {/*  Hippa Policy Block START  */}
          <div className={(this.state.isShowHippa) ? 'hippa-block' : 'hippa-block hide'}>
            <div className='recurly-to-stripe-main sign-up-main'>
              <HippaPolicyRecurly
                globalLang={this.state.globalLang}
                processingLoder={this.state.processingLoder}
                redirectToLogin={this.redirectToLogin}
                handleSubmit={this.handleSubmit}
              />
            </div>
          </div>
          {/*  Hippa Policy Block START  */}

        </div>
        <Footer />
      </div>
    );
  }
}
const mapStateToProps = state => {
  let returnState = {};
  if (state.AccountReducer.action === "UPGRADE_RECURLY_TO_STRIPE") {
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
    upgradeRecurlyToStripe: upgradeRecurlyToStripe,
  }, dispatch)
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(RecurlyToStripe));
