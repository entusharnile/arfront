import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import {signUp, getSignUpPlans } from '../../Actions/SignUp/signUpAction.js';
import {accountReset, upgradeTrailToPaid,getAccountPrivileges } from '../../Actions/Accounts/accountAction.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import moment from 'moment';
import config from '../../config';
import { setToken,setRedirectTo,getRedirectTo } from '../../Utils/services.js';

var cardNumber = '';
var cardExpiry = '';
var cardCvc = '';
var stripeToken = '';
class TrailToPaid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      globalLang: {},
      isShowHippa: true,
      isShowBba: false,
      agree_checkbox: false,
      isHppaPolicyAccepted: false,
      isBbaPolicyAccepted: false,
      tempLoggedUserData: {},

      stripeToken: '',
      processingLoder: false,
      isShowUpgradeModal:true,
      isShowPolicyModal:false,
      planAndCountryData:{},
      subscriptionPlanList: {},
      subscription_type: 'monthly',
      loginData:{},
      loginData:{},
      privilegeData:{}
    };
  }

  componentDidMount() {
    this.props.getSignUpPlans();
    this.props.accountReset();
    let tempLoggedUserData = {};
    if (localStorage.getItem('tempLoggedUserData') && getRedirectTo() == '/upgrade-subscription-plan') {
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
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
    } else if (nextProps.planAndCountryData != undefined && nextProps.planAndCountryData != prevState.planAndCountryData) {
      returnState.planAndCountryData = nextProps.planAndCountryData;
      returnState.subscriptionPlanList = nextProps.planAndCountryData.subscription_plans;
      nextProps.signUp();
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
          if ( stripeToken ) {
            this.setState({stripeToken:stripeToken,processingLoder:false})
            this.handlePolicyModal();
          }
        }
      }
    })
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  }

  handleSubmit = () => {
    this.setState({processingLoder:true})
    this.handlePolicyModal();
    let formData = {
      stripe_token  : this.state.stripeToken,
      subscription_type : this.state.subscription_type,
      return_type : 'login',
    }
    this.props.upgradeTrailToPaid(formData)
  }

  redirectToLogin = () => {
    this.props.history.push('/logout');
  }

  handleUpgradeModal = () => {
    this.setState({ isShowUpgradeModal: !this.state.isShowUpgradeModal})
  }

  handlePolicyModal = () => {
    this.setState({ isShowPolicyModal: !this.state.isShowPolicyModal})
  }

  renderSubscriptionPlan = () => {
    let htmlList = []
    Object.keys(this.state.subscriptionPlanList).forEach((idx) => {
      htmlList.push(<option key={'subscriptionPlanList-' + idx} value={idx}>{this.state.subscriptionPlanList[idx]} </option>);
    })
    return htmlList;
  }

  render() {
    return (
      <div className="guest">
        <Header />
        <div className="wrapper">
          {/*  Card Details START  */}
          <div className='login-main  sign-up-main trail-to-paid-main'>
            <form action="javascript:void(0);" onSubmit={this.generateStripeCardToken}>
              <h1 className="login-title">{this.state.globalLang.update_credit_card_details}</h1>
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
              <div className="form-group row">
                <div className="col-sm-12">
                  <label>{this.state.globalLang.signup_label_subscription_type}</label>
                  <select name="subscription_type" value={this.state.subscription_type} onChange={this.handleInputChange} className='form-control'>
                    {this.renderSubscriptionPlan()}
                  </select>
                </div>
              </div>
              <div className="form-group row text-right">
          			<div className="col-sm-12">
                  <button  disabled={this.state.processingLoder} className={(this.state.processingLoder) ? "btn btn-success green" : "btn btn-success"}>{(this.state.processingLoder) ? this.state.globalLang.signup_please_wait : this.state.globalLang.upgrade_account}
                    <img className={(this.state.processingLoder) ? "" : "no-display"} src="../images/btn-load.gif"/>
                  </button>
          			</div>
          		</div>
            </form>
          </div>
          {/*  Card Details START  */}
          {/* Upgrade Modal - START */}
          <div className={(this.state.isShowUpgradeModal) ? 'overlay' : ''} ></div>
          <div id="filterModal" role="dialog" className={(this.state.isShowUpgradeModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog trail-to-paid-modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.redirectToLogin}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.globalLang.upgrade_subscription}</h4>
                </div>
                <div className="modal-body add-patient-form filter-patient">{this.state.globalLang.upgrade_subscription_trial_expiration_msg}</div>
                <div className="modal-footer">
                  <div className="col-md-12 text-left">
                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.redirectToLogin}>{this.state.globalLang.label_cancel}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.handleUpgradeModal}>{this.state.globalLang.upgrade_account}</button>

                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Upgrade Modal - END */}
          {/* Policy Modal - START */}
          <div className={(this.state.isShowPolicyModal) ? 'overlay' : ''} ></div>
          <div id="filterModal" role="dialog" className={(this.state.isShowPolicyModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog trail-to-paid-modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.redirectToLogin}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.globalLang.subscription_payments_are_non_refundable}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                  YOU MAY CANCEL YOUR SUBSCRIPTION TO THE SERVICE AT LEAST 24 HOURS PRIOR TO THE NEXT DATE OF SUBSCRIPTION RENEWAL, AFTER WHICH AESTHETIC RECORD LLC WILL NOT RENEW YOUR SUBSCRIPTION. <b><u>SUBSCRIPTION PAYMENTS ARE NON-REFUNDABLE</u></b>. ALL SUBSCRIPTIONS ARE FINAL, REGARDLESS OF A YEARLY SUBSCRIPTION OR MONTHLY SUBSCRIPTION. YOU MAY CANCEL YOUR SUBSCRIPTION THROUGH THE FUNCTIONALITY PROVIDED THROUGH THE SETTINGS TAB ON THE WEB APPLICATION, UNDER THE "ACCOUNT INFORMATION" TAB. It is your responsibility to manage any subscription changes to your account.<br /><br />Recurring Charges. YOU AUTHORIZE AESTHETIC RECORD LLC TO CHARGE THE PAYMENT METHOD THAT OUR PAYMENT PROCESSOR HAS ON FILE FOR YOU TO PAY FOR ANY RENEWAL SUBSCRIPTION. YOU WILL BE BILLED FOR THE SAME SUBSCRIPTION PLAN (OR THE MOST SIMILAR SUBSCRIPTION PLAN, IF YOUR PRIOR PLAN IS NO LONGER AVAILABLE) AT THE THEN-CURRENT MONTHLY, OR ANNUAL SUBSCRIPTION PRICE PLUS ANY APPLICABLE TAXES. ADDITIONAL TERMS AND CONDITIONS MAY APPLY UPON RENEWAL, AND SUBSCRIPTION FEES MAY CHANGE AT ANY TIME, TO THE FULLEST EXTENT PERMITTED UNDER APPLICABLE LAW.
                </div>
                <div className="modal-footer">
                  <div className="col-md-12 text-left">
                    <button disabled={this.state.processingLoder} className="btn btn-success green" onClick={this.handleSubmit}>
                      {(this.state.processingLoder) ? this.state.globalLang.signup_please_wait : this.state.globalLang.signup_button_agree}
                        <img className={(this.state.processingLoder) ? "" : "no-display"} src="../images/btn-load.gif"/>
                    </button>
                    <button disabled={this.state.processingLoder} className="btn btn-danger m-r-10" data-dismiss="modal" onClick={this.redirectToLogin}>{this.state.globalLang.signup_button_disagree}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Policy Modal - END */}

        </div>
        <Footer />
      </div>
    );
  }
}
const mapStateToProps = state => {
  let returnState = {};
  if (state.SignUpReducer.action === "SIGN_UP_PLANS") {
    toast.dismiss();
    if (state.SignUpReducer.data.status != 200) {
      const languageData = JSON.parse(localStorage.getItem('languageData'));
      toast.error(languageData.global[state.SignUpReducer.data.message]);
      returnState.showLoader = true;
    } else {
      returnState.planAndCountryData = state.SignUpReducer.data.data;
    }
  } else if (state.AccountReducer.action === "UPGRADE_TRAIL_TO_PAID") {
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
    upgradeTrailToPaid: upgradeTrailToPaid,
    getSignUpPlans: getSignUpPlans,
    signUp:signUp
  }, dispatch)
};
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TrailToPaid));
