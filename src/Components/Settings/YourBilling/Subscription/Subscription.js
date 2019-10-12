import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../../../Containers/Settings/sidebar.js";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  getSubscriptionDetails,
  subscriptionAddOn,
  subscriptionCancelReactivate,
  subscriptionUpgradeAccount,
  subscriptionUpdateCard,
  subscriptionAutoRefill,
  getSubscriptionMonthlyEstimate,
  subscriptionUpgradeToYearly,
  exportEmptyData
} from "../../../../Actions/Settings/settingsActions.js";
import SubscriptionDataUsage from './SubscriptionDataUsage.js';
import SubscriptionMonthlyEstimate from './SubscriptionMonthlyEstimate.js';
import { numberFormat,getCurrencySymbol, isFormSubmit } from "../../../../Utils/services.js";
import config from '../../../../config';
import moment from 'moment';

const getPercentage = (used, total) => {
  return numberFormat((used * 100 / total), 'decimal', 2);
}

const smsEmailLimit = () =>{
  return [50,60,70,80,90,100,200,300,400,500,600,700,800,900,1000]
}

var cardNumber  = '';
var cardExpiry  = '';
var cardCvc     = '';
var stripeToken = '';

class Subscriptions extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      showLoader: true,
      isShowConfirmationModal: false,
      confirmationModalMsg: '',
      confirmationModalHandler: '',
      refill_sms_status: false,
      refill_sms_limit:'250',
      refill_sms_value:'50',
      refill_email_status: false,
      refill_email_limit:'500',
      refill_email_value:'50',
      refill_data_status: false,
      refill_data_limit:'1',
      refill_data_value:'1',
      is_edit_card: false,
      card_number: '',
      card_cvv: '',
      card_month: '',
      card_year: '',
      add_on_sms: '250',
      add_on_email: '500',
      add_on_data: '1',
      isAddMoreSms: false,
      isAddMoreEmail: false,
      isAddMoreData: false,
      subscriptionData: {},
      storageData: {
        limit: 0,
        used: 0,
        used_percentage: 0,
        free: 0,
        free_percentage: 0
      },
      cardNumberClass: 'setting-input-box',
      cardCvvClass: 'setting-input-box',
      cardMonthClass: 'setting-select-box',
      cardYearClass: 'setting-select-box',
      userChanged:false,
      message:'',
      isShowUpgradeModal: false,
      subscription_type:'monthly',
      accountType:'trial',
      accountStatus:'cancelled',
      isShowMonthlyEstimateModal:false,
      monthlyToYearlyData:{},
      isAccountInStripe:false,
    };
    window.onscroll = () => {
      return false
    }
  }

  componentDidMount() {
    this.state['showLoader'] = true;
    this.props.exportEmptyData()
    this.props.getSubscriptionDetails();
    if ( window.Stripe ) {
      this.setState({stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY)});
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY)});
      });
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.subscriptionData != undefined && nextProps.subscriptionData !== prevState.subscriptionData) {
      returnState.subscriptionData = nextProps.subscriptionData;
      returnState.isAccountInStripe = (nextProps.subscriptionData.account_code.indexOf('cus_') > -1) ? true : false
      const storageLimit = numberFormat((returnState.subscriptionData.storage_limit / 1000), 'decimal', 2);
      const storageUsed = numberFormat(returnState.subscriptionData.storage_used, 'decimal', 2);
      const storageUsedPercentage = numberFormat(getPercentage(storageUsed, storageLimit), 'decimal', 2);
      const storageFree = numberFormat((storageLimit - storageUsed), 'decimal', 2);
      const storageFreePercentage = numberFormat(getPercentage(storageFree, storageLimit), 'decimal', 2);

      returnState.storageData = {
        limit: storageLimit,
        used: storageUsed,
        used_percentage: storageUsedPercentage,
        free: storageFree,
        free_percentage: storageFreePercentage,
        graph: [{
          name: 'Used',
          y: parseFloat(storageUsedPercentage),
          color: '#0066B4',
          z: storageUsed + ' GB / ' + storageUsedPercentage + "%"
        }, {
          name: 'Free',
          y: parseFloat(storageFreePercentage),
          color: '#C7E3F5',
          z: storageFree + ' GB / ' + storageFreePercentage + "%"
        }]
      }
      returnState.isAddMoreSms =  false;
      returnState.isAddMoreEmail =  false;
      returnState.isAddMoreData =  false;
      returnState.is_edit_card = false;

      returnState.accountType = (returnState.subscriptionData.account_type != undefined && returnState.subscriptionData.account_type != '') ?  returnState.subscriptionData.account_type.toLowerCase() : 'trial'
      returnState.accountStatus = (returnState.subscriptionData.account_status != undefined && returnState.subscriptionData.account_status != '') ?  returnState.subscriptionData.account_status.toLowerCase() : 'cancelled'

      returnState.refill_sms_status = (returnState.subscriptionData.refill_sms_status) ? true : false;
      returnState.refill_sms_limit = returnState.subscriptionData.refill_sms_limit;
      returnState.refill_sms_value = returnState.subscriptionData.refill_sms_value;

      returnState.refill_email_status = (returnState.subscriptionData.refill_email_status) ? true : false;
      returnState.refill_email_limit = returnState.subscriptionData.refill_email_limit;
      returnState.refill_email_value = returnState.subscriptionData.refill_email_value;

      returnState.refill_data_status = (returnState.subscriptionData.refill_data_status) ? true : false;
      returnState.refill_data_limit = returnState.subscriptionData.refill_data_limit;
      returnState.refill_data_value = returnState.subscriptionData.refill_data_value;

      if (nextProps.message !== undefined && nextProps.message != null && nextProps.message != '') {
        returnState.message = nextProps.message;
        toast.dismiss();
        toast.success(nextProps.message)
        return;
      }
      returnState.showLoader = false;
    } if (nextProps.monthlyToYearlyData != undefined && nextProps.monthlyToYearlyData !== prevState.monthlyToYearlyData) {
      returnState.showLoader = false;
      returnState.monthlyToYearlyData = nextProps.monthlyToYearlyData;
    } else if (nextProps.reload !== undefined && nextProps.reload === true) {
      toast.dismiss();
      toast.success(nextProps.message)
      nextProps.getSubscriptionDetails();
    } else if (nextProps.showLoader !== undefined && nextProps.showLoader === false) {
      if (nextProps.message !== undefined && nextProps.message != null && nextProps.message != '' && nextProps.message != prevState.message) {
        returnState.message = nextProps.message;
        toast.dismiss();
        toast.success(nextProps.message, {onClose : () => {return}});
      }
      returnState.showLoader = false;
      if (nextProps.isEditCard !== undefined && nextProps.isEditCard === false) {
        returnState.is_edit_card = false;
      }
      nextProps.exportEmptyData()
    }
    return returnState;
  }


  handleInputChange = event => {
    this.setState({userChanged:true});
    const target = event.target;
    const name = event.target.name;
    let value = target.value;
    if (target.type === "checkbox") {
      value = target.checked;
      if (!value) {
        if (name == 'refill_sms_status') {
          this.setState({
            confirmationModalMsg: this.state.settingsLang.subscription_refill_sms_package_warning,
            confirmationModalHandler: "handleRefillSmsStatus"
          })
          this.toggleConfirmationModal();
          return;
        } else if (name == 'refill_email_status') {
          this.setState({
            confirmationModalMsg: this.state.settingsLang.subscription_refill_emails_package_warning,
            confirmationModalHandler: "handleRefillEmailStatus"
          })
          this.toggleConfirmationModal();
          return;
        } else if (name == 'refill_data_status') {
          this.setState({
            confirmationModalMsg: this.state.settingsLang.subscription_refill_data_package_warning,
            confirmationModalHandler: "handleRefillDataStatus"
          })
          this.toggleConfirmationModal();
          return;
        }
      } else {
          if (name == 'is_edit_card') {
            this.setState({is_edit_card: true});
           this.generateStripeInput('is_edit_card');
           return;
          }
        }
    }

    this.setState({
      [event.target.name]: value
    });
  };

  handleSubmit = event => {
    if(isFormSubmit()){
      let formData = {
        "refill_sms_status":(this.state.refill_sms_status) ? 1 : 0,
        "refill_sms_value": this.state.refill_sms_value,
        "refill_sms_limit": this.state.refill_sms_limit,
        "refill_email_status":(this.state.refill_email_status) ? 1 : 0,
        "refill_email_value": this.state.refill_email_value,
        "refill_email_limit": this.state.refill_email_limit,
        "refill_data_status":(this.state.refill_data_status) ? 1 : 0,
        "refill_data_value": this.state.refill_data_value,
        "refill_data_limit": this.state.refill_data_limit
      }
      this.setState({showLoader:true,message:''});
      this.props.subscriptionAutoRefill(formData)
    }
  };

  handleSubmitAddOn = (type) => {
    let formData = {
      addon_type: (type == 'add_on_sms') ? 'sms' : (type == 'add_on_email') ? 'email' : 'storage',
      addon_value: this.state[type]
    };
    this.setState({showLoader:true,message:''});
    this.props.subscriptionAddOn(formData)
  };

  generateStripeInput = (type) => {
    var elements = this.state.stripe.elements();
    cardNumber  = elements.create('cardNumber');
    cardExpiry  = elements.create('cardExpiry');
    cardCvc     = elements.create('cardCvc');
    if(type == 'is_edit_card'){
      cardNumber.mount('#card-number-edit');
      cardExpiry.mount('#card-expiry-edit');
      cardCvc.mount('#card-cvc-edit');
    } else if(type == 'isShowUpgradeModal'){
      cardNumber.mount('#card-number-upgrade');
      cardExpiry.mount('#card-expiry-upgrade');
      cardCvc.mount('#card-cvc-upgrade');
    }


  }
  generateStripeCardToken = (type) => {
    //this.setState({showLoader: true})

    this.state.stripe.createToken(cardNumber).then((response) => {
      if ( response.error ) {
        toast.dismiss();
        toast.error(response.error.message)
        this.setState({showLoader: false})
      } else {
        if(isFormSubmit()){
        stripeToken = response.token.id;

        if ( stripeToken ) {
          let formData = {
            stripe_token  : stripeToken
          }
          if(type == 'is_edit_card'){
            this.setState({showLoader: true})
            this.props.subscriptionUpdateCard(formData)
          } else if(type == 'isShowUpgradeModal'){

            this.setState({showLoader: true})
            formData.subscription_type = this.state.subscription_type;
            this.setState({isShowUpgradeModal:false});
            this.props.subscriptionUpgradeAccount(formData)
          }

        }
        }
      }
    })
  }

  toggleConfirmationModal = (type) => {
    if (type == 'cancel_plan') {
      this.setState({
        confirmationModalMsg: this.state.settingsLang.subscription_cancel_plan_msg,
        confirmationModalHandler: 'subscriptionCancelReactivate',
      })
    } else if (type == 'reactivate_plan') {
      this.setState({
        confirmationModalMsg: this.state.settingsLang.subscription_resume_plan_msg,
        confirmationModalHandler: 'subscriptionCancelReactivate',
      })
    }
    this.setState({ isShowConfirmationModal: !this.state.isShowConfirmationModal })
  }

  toggleUpgradeModal = () => {
    if(!this.state.isShowUpgradeModal){
        this.generateStripeInput('isShowUpgradeModal')
    }
    this.setState({isShowUpgradeModal:!this.state.isShowUpgradeModal});
  }

  toggleMonthlyEstimateModal = () => {
    if(!this.state.isShowMonthlyEstimateModal){
      this.setState({showLoader:true})
        this.props.getSubscriptionMonthlyEstimate();
    }
    this.setState({isShowMonthlyEstimateModal:!this.state.isShowMonthlyEstimateModal});
  }

  handleRefillSmsStatus = () => {
    this.setState({ refill_sms_status: !this.state.refill_sms_status });
    this.toggleConfirmationModal();
  }
  handleRefillEmailStatus = () => {
    this.setState({ refill_email_status: !this.state.refill_email_status });
    this.toggleConfirmationModal();
  }
  handleRefillDataStatus = () => {
    this.setState({ refill_data_status: !this.state.refill_data_status });
    this.toggleConfirmationModal();
  }

  subscriptionCancelReactivate = () => {
    if(this.state.subscriptionData.account_status != undefined)
    this.setState({ showLoader: true,message:'' })
    this.toggleConfirmationModal();
    this.props.subscriptionCancelReactivate({action_type: (this.state.subscriptionData.account_status == 'Cancelled') ? 'reactivate' : 'cancelled'})
  }

  subscriptionUpgradeToYearly = () => {
      this.setState({showLoader:true})
      this.props.subscriptionUpgradeToYearly();
      this.toggleMonthlyEstimateModal();
  }

  toggleState = (type) => {
    this.setState({ [type]: !this.state[type],userChanged:true });
  }



  renderObjectOption = (list, key,labelTag,insideBraces) => {
    let htmlList = []
      Object.keys(list).forEach((idx) => {
        htmlList.push(<option key={key+'-'+idx} value={idx} >{idx} {(insideBraces == true) ? labelTag + ' - '+ numberFormat((list[idx].price / 100),'currency',2) : `(${labelTag})`}</option>);
      })
    return htmlList;
  }

  renderArrayOption = (list, key,labelTag,insideBraces) => {
    let htmlList = []
      list.map((obj,idx) => {
        htmlList.push(<option key={key+'-'+idx} value={obj} >{obj} {(insideBraces == true) ? labelTag : `(${labelTag})`}</option>);
      })
    return htmlList;
  }

  render() {
    const subDate = moment(this.state.subscriptionData.subscription_satartdate).format('DD MMMM YYYY');
    return (
      <div className="main protected">
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-container">
                <div className="setting-title">{this.state.settingsLang.subscription_your_current_account_usage_heading}</div>
                <div className="row">
                  <div className="col-md-6 billing-stats">
                    <div className="settings-subtitle text-left">{this.state.settingsLang.subscription_your_current_account_usage}:</div>
                    <div className="col-sm-6">
                      <div className="portal-numbers">{this.state.subscriptionData.users_used}</div>
                      <div className="patient-portal-label">{this.state.settingsLang.subscription_users_in_your_account}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="portal-numbers">{this.state.subscriptionData.procedure_used}</div>
                      <div className="patient-portal-label">{this.state.settingsLang.subscription_procedures_in_your_account}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="portal-numbers">{this.state.subscriptionData.sms_used}</div>
                      <div className="patient-portal-label">{this.state.settingsLang.subscription_total_sms_used_this_month}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="portal-numbers">{this.state.subscriptionData.email_used}</div>
                      <div className="patient-portal-label">{this.state.settingsLang.subscription_total_email_used_this_month}</div>
                    </div>
                  </div>
                  <div className="col-md-6 billing-stats">
                    <div className="settings-subtitle text-left">{this.state.settingsLang.subscription_data_usage}:</div>
                    <div className="text-left data-usage">
                      <SubscriptionDataUsage storageData={this.state.storageData} />
                    </div>
                  </div>
                </div>
              </div>
              {(this.state.subscriptionData.subscription_type == 'Monthly' && this.state.accountType == 'paid' && this.state.subscriptionData.plan_estimated_amount != undefined) &&
                <div className="setting-container border-top" style={{ display: 'block' }}>
                  <div className="setting-title">{this.state.settingsLang.subscription_your_estimated_bill}
                    <div className=" credit-balance col-sm-6 pull-right no-padding">
                      <div className="pull-right credit-text">{numberFormat((this.state.subscriptionData.credits <= 0) ? '0.00' : this.state.subscriptionData.credits, 'currency', 2)}</div>
                      <div className="pull-right credit-text">{this.state.settingsLang.subscription_credit_balance}: &nbsp;&nbsp;</div>
                    </div>
                  </div>
                  <div className="accordion-table your-billing">
                    <div className="accordion-row accordion-head">
                      <div className="accordian-section col-xs-6 text-left">{this.state.settingsLang.subscription_your_billing_cycle} ({this.state.subscriptionData.plan_estimated_amount.bill_cycle})</div>
                      <div className="accordian-section col-xs-6 text-right">{this.state.settingsLang.subscription_your_expected_bill_for_this_month}
                        {numberFormat((this.state.subscriptionData.plan_estimated_amount.total_amount <= 0) ? '0.00' : this.state.subscriptionData.plan_estimated_amount.total_amount, 'currency', 2)}</div>
                    </div>
                    <SubscriptionMonthlyEstimate estimatedData={this.state.subscriptionData.plan_estimated_amount} />
                  </div>
                </div>
              }
              <div className="setting-container border-top">
                <div className="setting-title">{this.state.settingsLang['manage-subscription-details']}
                  {(this.state.accountType != 'paid')
                  ?
                  <button className="save-profile confirm-model new-blue-btn pull-right" data-message={this.state.settingsLang.subscription_resume_plan_msg} data-confirm-url="" id="upgrade_account" type="button" onClick={this.toggleUpgradeModal}>{this.state.settingsLang.subscription_upgrade_account}</button>
                  :
                    (this.state.accountStatus == 'cancelled')
                  ?
                    <button className="save-profile confirm-model new-blue-btn pull-right" data-message={this.state.settingsLang.subscription_resume_plan_msg} data-confirm-url="" id="cancel_plan" type="button" onClick={this.toggleConfirmationModal.bind(this, 'reactivate_plan')}>{this.state.settingsLang.subscription_resume_plan}</button>
                  :
                    <button className="save-profile confirm-model new-blue-btn pull-right" data-message={this.state.settingsLang.subscription_cancel_plan_msg} data-confirm-url="" id="cancel_plan" type="button" onClick={this.toggleConfirmationModal.bind(this, 'cancel_plan')}>{this.state.settingsLang.subscription_cancel_plan}</button>
                  }
                  {(this.state.subscriptionData.stripe_subscription && this.state.subscriptionData.subscription_type == 'Monthly' && this.state.accountType == 'paid' && this.state.accountStatus == 'active') &&
                    <button className="save-profile confirm-model new-blue-btn pull-right" data-message="" data-confirm-url="" id="switch_plan_btn" type="button" onClick={this.toggleMonthlyEstimateModal}>{this.state.settingsLang.subscription_switch_to_yearly_subscription}</button>
                  }

                </div>
                <div className="settings-subtitle">{this.state.settingsLang.subscription_plan}</div>
                {(this.state.accountType == 'paid') ?
                  <div className="row only-paid-content">
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_start_date}</div>
                        <div className="setting-input-box">{subDate}</div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_type}</div>
                        <div className="setting-input-box">{this.state.subscriptionData.subscription_type}</div>
                      </div>
                    </div>
                    <div className="col-lg-2 col-md-6 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.globalLang.label_status}</div>
                        <div className="setting-input-box">{this.state.subscriptionData.account_status}</div>
                      </div>
                    </div>
                  </div>
                  :
                  <div className="row">
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_type}</div>
                        <div className="setting-input-box">{this.state.subscriptionData.subscription_type} ({this.state.subscriptionData.account_type})</div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_start_date}</div>
                        <div className="setting-input-box">{this.state.subscriptionData.subscription_satartdate}</div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_end_date}</div>
                        <div className="setting-input-box">{this.state.subscriptionData.subscription_valid_upto}</div>
                      </div>
                    </div>
                    <div className="col-lg-2 col-md-6 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.globalLang.label_status}</div>
                        <div className="setting-input-box">{this.state.subscriptionData.account_status}</div>
                      </div>
                    </div>
                  </div>
                }
                <div className="settings-subtitle">{this.state.settingsLang.subscription_limits}</div>
                <div className="row">
                  <div className="col-lg-3 col-md-4 col-sm-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.subscription_sms_in_plan}</div>
                      <div className="setting-input-box">{this.state.subscriptionData.sms_limit} {this.state.settingsLang.subscription_sms_per_month}</div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-4 col-sm-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.subscription_addon_sms_this_month}</div>
                      <div className="setting-input-box">{this.state.subscriptionData.add_on_sms}</div>
                    </div>
                  </div>
                  {(this.state.accountType == 'paid') &&
                    <div className='only-paid-content'>
                      <div className={this.state.isAddMoreSms ? "buy-more-sms-div" : "no-display"}>
                        <div className="col-lg-3 col-md-6 col-sm-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_buy_more_sms}</div>
                            <div className="setting-input-outer">
                              <form id="add-sms-form" name="add-sms-form" action="javascript:void(0);" method="post" acceptCharset="utf-8">
                                <select className="setting-select-box" name="add_on_sms" value={this.state.add_on_sms} onChange={this.handleInputChange} id="addon_sms">
                                  {this.state.subscriptionData.sms_packages &&
                                  this.renderObjectOption(this.state.subscriptionData.sms_packages,'add_on_sms',this.state.settingsLang.subscription_sms,true)}
                                </select>
                              </form>
                            </div>
                            <div className="important-instruction m-t-10">{this.state.settingsLang.subscription_current_sms_limit}: {this.state.settingsLang.subscription_up_to} {this.state.subscriptionData.sms_limit + this.state.subscriptionData.add_on_sms} {this.state.settingsLang.subscription_sms}
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 no-padding-right">
                          <button type="button" id="addon-sms-btn" className="new-blue-btn sms-btn m-l-0 m-t-10 no-width" type="button" onClick={this.handleSubmitAddOn.bind(this,'add_on_sms')}>{this.state.settingsLang.subscription_buy_sms}</button>
                          <a href="javascript:void(0)" className="new-white-btn sms-btn m-l-10 m-t-10 cancel-buy-div no-width" data-div_to_show="add-more-sms-div" data-div_to_hide="buy-more-sms-div" onClick={this.toggleState.bind(this, 'isAddMoreSms')}>{this.state.globalLang.label_cancel}</a>
                        </div>
                      </div>
                      <div className={!this.state.isAddMoreSms ? "col-lg-3 col-md-4 col-sm-12 add-more-sms-div" : "no-display"}>
                        <a href="javascript:void(0)" className="new-white-btn sms-btn m-l-0 m-t-10 show-buy-div" data-div_to_show="buy-more-sms-div" data-div_to_hide="add-more-sms-div" onClick={this.toggleState.bind(this, 'isAddMoreSms')}>{this.state.globalLang.label_add_more}</a>
                      </div>
                    </div>
                  }
                </div>
                <div className="row">
                  <div className="col-lg-3 col-md-4 col-sm-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.subscription_emails_in_plan}</div>
                      <div className="setting-input-box">{this.state.subscriptionData.email_limit} {this.state.settingsLang.subscription_email_per_month}</div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-4 col-sm-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.subscription_addon_emails_this_month}</div>
                      <div className="setting-input-box">{this.state.subscriptionData.add_on_email}</div>
                    </div>
                  </div>
                  {(this.state.accountType == 'paid') &&
                    <div className='only-paid-content'>
                      <div className={this.state.isAddMoreEmail ? "buy-more-email-div" : "no-display"}>
                        <div className="col-lg-3 col-md-6 col-sm-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_buy_more_emails}</div>
                            <form id="add-email-form" name="add-email-form" action="javascript:void(0);" method="post" acceptCharset="utf-8">
                              <div className="setting-input-outer">
                                <select className="setting-select-box" name="add_on_email" value={this.state.add_on_email} onChange={this.handleInputChange} id="addon_email">
                                  {this.state.subscriptionData.email_packages &&
                                  this.renderObjectOption(this.state.subscriptionData.email_packages,'add_on_email',this.state.settingsLang.subscription_email,true)}
                                </select>
                              </div>
                            </form>
                            <div className="important-instruction m-t-10">{this.state.settingsLang.subscription_current_email_limit}: {this.state.settingsLang.subscription_up_to} {this.state.subscriptionData.email_limit + this.state.subscriptionData.add_on_email}
                        {this.state.settingsLang.subscription_emails}</div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 no-padding-right">
                          <button type="button" id="addon-email-btn" className="new-blue-btn sms-btn m-l-0 m-t-10 no-width" type="button" onClick={this.handleSubmitAddOn.bind(this,'add_on_email')}>{this.state.settingsLang.subscription_buy_email}</button>
                          <a href="javascript:void(0)" className="new-white-btn sms-btn m-l-10 m-t-10 cancel-buy-div no-width" data-div_to_show="add-more-email-div" data-div_to_hide="buy-more-email-div" onClick={this.toggleState.bind(this, 'isAddMoreEmail')}>{this.state.globalLang.label_cancel}</a>
                        </div>
                      </div>
                      <div className={!this.state.isAddMoreEmail ? "col-lg-3 col-md-4 col-sm-12 add-more-email-div" : "no-display"}>
                        <a href="javascript:void(0)" className="new-white-btn sms-btn m-l-0 m-t-10 show-buy-div" data-div_to_show="buy-more-email-div" data-div_to_hide="add-more-email-div" onClick={this.toggleState.bind(this, 'isAddMoreEmail')}>{this.state.globalLang.label_add_more}</a>
                      </div>
                  </div>
                }
                </div>
                <div className="row">
                  <div className="col-lg-3 col-md-4 col-sm-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.subscription_data_in_plan}</div>
                      <div className="setting-input-box">{this.state.storageData.limit} {this.state.settingsLang.subscription_gb}</div>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-4 col-sm-12">
                  </div>
                  {(this.state.accountType == 'paid') &&
                    <div className='only-paid-content'>
                      <div className={this.state.isAddMoreData ? "buy-more-data-div" : "no-display"}>
                        <div className="col-lg-3 col-md-6 col-sm-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_buy_more_data}</div>
                            <form id="add-data-form" name="add-data-form" action="javascript:void(0);" method="post" acceptCharset="utf-8">
                              <div className="setting-input-outer">
                                <select className="setting-select-box"  name="add_on_data" value={this.state.add_on_data} onChange={this.handleInputChange} id="addon_data">
                                  {this.state.subscriptionData.storage_data_packages &&
                                  this.renderArrayOption(this.state.subscriptionData.storage_data_packages,'add_on_data',this.state.settingsLang.subscription_gb,true)}
                                </select>
                              </div>
                            </form>
                            <div className="important-instruction m-t-10" id="add-data-sub">{this.state.settingsLang.subscription_you_will_be_charged}
                        <span className="new_amount"><b> {numberFormat(this.state.add_on_data,'currency',2)} </b></span>{this.state.settingsLang.subscription_one_time_from_credit_card_you_have_in_file}</div>
                          </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 no-padding-right">
                          <button type="button" id="addon-data-btn" className="new-blue-btn sms-btn m-l-0 m-t-10 no-width" type="button" onClick={this.handleSubmitAddOn.bind(this,'add_on_data')}>{this.state.settingsLang.subscription_buy_data}</button>
                          <a href="javascript:void(0)" className="new-white-btn sms-btn m-l-10 m-t-10 cancel-buy-div reset-to-first no-width" data-div_to_show="add-more-data-div" data-div_to_hide="buy-more-data-div" onClick={this.toggleState.bind(this, 'isAddMoreData')}>{this.state.globalLang.label_cancel}</a>
                        </div>
                      </div>
                      <div className={!this.state.isAddMoreData ? "col-lg-3 col-md-4 col-sm-12 add-more-data-div" : "no-display"}>
                        <a href="javascript:void(0)" className="new-white-btn sms-btn m-l-0 m-t-10 show-buy-div" data-div_to_show="buy-more-data-div" data-div_to_hide="add-more-data-div" onClick={this.toggleState.bind(this, 'isAddMoreData')}>{this.state.globalLang.label_add_more}</a>
                      </div>
                    </div>
                  }
                </div>
                {(this.state.accountType == 'paid' && this.state.subscriptionData.subscription_type == 'Yearly' && this.state.isAccountInStripe == true) &&
                  <div className="row only-paid-content">
                    <div className="col-lg-3 col-md-4 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_users_limit}</div>
                        <div className="setting-input-box">{this.state.subscriptionData.users_limit}</div>
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-4 col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_users_used}</div>
                        <div className="setting-input-box">{this.state.subscriptionData.users_used}</div>
                      </div>
                    </div>
                  </div>
                }
              </div>
              {(this.state.accountType == 'paid') &&
                <div className='only-paid-content'>
                  <div className="bg-light-blue setting-container setting-credit-card" style={{ display: 'block' }}>
                    <div className="setting-title">{this.state.settingsLang.subscription_credit_card}
                      <span className="setting-custom-switch pull-right">{this.state.settingsLang.subscription_edit_card} &nbsp;
                  <label className="setting-switch pull-right">
                          <input type="checkbox" className="setting-custom-switch-input edit-cc-toggle" name="is_edit_card" value={this.state.is_edit_card} checked={this.state.is_edit_card ? 'checked' : false} onChange={this.handleInputChange} />
                          <span className="setting-slider" />
                        </label><br /><br />
                      </span>
                    </div>
                    <div className={this.state.is_edit_card ? "card-edit-mode" : 'no-display'}>
                      <form id="CardChangeCardForm" name="CardChangeCardForm" action="javascript:void(0);" method="post" acceptCharset="utf-8" noValidate="novalidate">
                        <div className="row">
                          <div className="col-lg-3 col-md-4 col-sm-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.settingsLang.subscription_credit_card_number}</div>
                              <div className="setting-input-outer">
                                <div className="setting-input-box" id="card-number-edit"></div>
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-3 col-md-4 col-sm-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.settingsLang.subscription_security_code}</div>
                              <div className="setting-input-outer">
                                <div className="setting-input-box" id="card-cvc-edit"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-lg-3 col-md-4 col-sm-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.settingsLang.subscription_expiration_date}</div>
                              <div className="setting-input-outer">
                                <div className="card-exp-date">
                                  <div className="setting-input-box" id="card-expiry-edit"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <a href="javascript:void(0)" className="new-white-btn cancel-edit-cc" onClick={ () => {
                          this.setState({is_edit_card:!this.state.is_edit_card})
                        }}>{this.state.globalLang.label_cancel}</a>
                        <input type="button" id="update_Credit_Card" name="update_credit_card" value={this.state.settingsLang.subscription_save_card} onClick={this.generateStripeCardToken.bind(this,'is_edit_card')} className="new-blue-btn" />
                      </form>
                    </div>
                    <div className={!this.state.is_edit_card ? "card-view-mode" : 'no-display'}>
                      <div className="row">
                        <div className="col-lg-3 col-md-4 col-sm-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_credit_card_number}</div>
                            <div className="setting-input-box" id="Card_Number_label">{this.state.subscriptionData.stripe_card_details}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <form id="auto_refill_form" name="auto-refill-form" action="javascript:void(0);" method="post" acceptCharset="utf-8">
                    <div className="setting-container">
                      <div className="setting-title">{this.state.settingsLang.subscription_auto_refill_settings}</div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="important-instruction m-t-0">
                            <span style={{ color: 'red' }}>{this.state.globalLang.label_note}:
                            </span>{this.state.settingsLang.subscription_auto_refill_settings_note}
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-3 col-xs-5">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_refill_sms_package}</div>
                            <div className="setting-input-outer">
                              <select name="refill_sms_value" value={this.state.refill_sms_value} onChange={this.handleInputChange} disabled={!this.state.refill_sms_status} className="setting-select-box">
                                {
                                  this.state.subscriptionData.sms_packages &&
                                  this.renderObjectOption(this.state.subscriptionData.sms_packages,'refill_sms_value',this.state.settingsLang.subscription_sms)
                                }
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-xs-5">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_if_sms_balance_goes_below}</div>
                            <div className="setting-input-outer">
                              <select name="refill_sms_limit" value={this.state.refill_sms_limit} onChange={this.handleInputChange} disabled={!this.state.refill_sms_status} className="setting-select-box">
                                {this.renderArrayOption(smsEmailLimit(),'refill_sms_limit',this.state.settingsLang.subscription_sms)}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-xs-2">
                          <label className="setting-switch m-t-20">
                            <input type="checkbox" id="refill_sms_status" name="refill_sms_status" value={this.state.refill_sms_status} checked={this.state.refill_sms_status ? 'checked' : false} onChange={this.handleInputChange} className="refill-status setting-custom-switch-input" data-message={this.state.settingsLang.subscription_refill_sms_package_warning} />

                            <span className="setting-slider" />
                          </label>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-3 col-xs-5">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_refill_emails_package}</div>
                            <div className="setting-input-outer">
                              <select name="refill_email_value" value={this.state.refill_email_value} onChange={this.handleInputChange} disabled={!this.state.refill_email_status} className="setting-select-box">
                                {this.state.subscriptionData.email_packages &&
                                this.renderObjectOption(this.state.subscriptionData.email_packages,'refill_email_value',this.state.settingsLang.subscription_email)}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-xs-5">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_if_emails_balance_goes_below}</div>
                            <div className="setting-input-outer">
                              <select name="refill_email_limit" value={this.state.refill_email_limit} onChange={this.handleInputChange} disabled={!this.state.refill_email_status} className="setting-select-box">
                                {this.renderArrayOption(smsEmailLimit(),'refill_email_limit',this.state.settingsLang.subscription_email)}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-xs-2">
                          <label className="setting-switch m-t-20">
                            <input type="checkbox" id="refill_email_status" name="refill_email_status" value={this.state.refill_email_status} checked={this.state.refill_email_status ? 'checked' : false} onChange={this.handleInputChange} className="refill-status setting-custom-switch-input" data-message={this.state.settingsLang.subscription_refill_emails_package_warning} />
                            <span className="setting-slider" />
                          </label>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-3 col-xs-5">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_refill_data_package}</div>
                            <div className="setting-input-outer">
                              <select name="refill_data_value" value={this.state.refill_data_value} onChange={this.handleInputChange} disabled={!this.state.refill_data_status} className="setting-select-box">
                                {this.state.subscriptionData.storage_data_packages &&
                                this.renderArrayOption(this.state.subscriptionData.storage_data_packages,'refill_data_value',this.state.settingsLang.subscription_gb)}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-xs-5">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.subscription_if_data_goes_below}</div>
                            <div className="setting-input-outer">
                              <select name="refill_data_limit" value={this.state.refill_data_limit} onChange={this.handleInputChange} disabled={!this.state.refill_data_status} className="setting-select-box">
                                {this.state.subscriptionData.storage_data_packages &&
                                this.renderArrayOption(this.state.subscriptionData.storage_data_packages,'refill_data_limit',this.state.settingsLang.subscription_gb)}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-xs-2">
                          <label className="setting-switch m-t-20">
                            <input type="checkbox" id="refill_data_status" name="refill_data_status" value={this.state.refill_data_status} checked={this.state.refill_data_status ? 'checked' : false} onChange={this.handleInputChange} className="refill-status setting-custom-switch-input" data-message={this.state.settingsLang.subscription_refill_data_package_warning} />
                            <span className="setting-slider" />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="footer-static">
                      <button className="new-blue-btn pull-right" id="saveAutoRefill" type="button" onClick={this.handleSubmit}>{this.state.globalLang.label_save}</button>

                    </div>
                  </form>
                </div>
              }
              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Confirmation Modal - START */}
          <div className={(this.state.isShowConfirmationModal) ? 'overlay' : ''} ></div>
          <div id="filterModal" role="dialog" className={(this.state.isShowConfirmationModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.toggleConfirmationModal}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.globalLang.delete_confirmation}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.confirmationModalMsg}</div>
                <div className="modal-footer">
                  <div className="col-md-12 text-left" id="footer-btn">
                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.toggleConfirmationModal}>{this.state.globalLang.label_no}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this[this.state.confirmationModalHandler]}>{this.state.globalLang.label_yes}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/*  Confirmation Modal - END */}
          {/* Upgrade Account Modal - START */}
          <div className={(this.state.isShowUpgradeModal) ? 'modalOverlay' : 'no-display'}>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.settingsLang.subscription_upgrade_account}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.toggleUpgradeModal}>×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    {(this.state.subscriptionData.subscription_plans != undefined) &&
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.settingsLang.subscription_type}<span className="setting-require">*</span></div>
                          <select  className="setting-select-box" name="subscription_type" value={this.state.subscription_type} onChange={this.handleInputChange} >
                            <option value='monthly'>{this.state.subscriptionData.subscription_plans.monthly}</option>
                            <option value="yearly">{this.state.subscriptionData.subscription_plans.yearly}</option>
                          </select>
                        </div>
                      </div>
                    }
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_credit_card_number}<span className="setting-require">*</span></div>
                        <div className="setting-input-box" id="card-number-upgrade"></div>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_expiration_date}<span className="setting-require">*</span></div>
                        <div className="setting-input-box" id="card-expiry-upgrade"></div>
                      </div>
                    </div>
                    <div className="col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.subscription_security_code} <span className="setting-require">*</span></div>
                        <div className="setting-input-box" id="card-cvc-upgrade"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-blue-btn pull-right" name='btn_create_schedule' onClick={this.generateStripeCardToken.bind(this,'isShowUpgradeModal')}>{this.state.globalLang.label_save}</a>
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.toggleUpgradeModal}>{this.state.globalLang.label_cancel}</a>
              </div>
            </div>
          </div>
          {/* Upgrade Account Modal - END */}
          {/* Monthly Estimate Modal - START */}
          <div className={(this.state.isShowMonthlyEstimateModal) ? 'modalOverlay' : 'no-display'}>
            <div className="small-popup-outer subscription-popup">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.settingsLang.subscription_switch_to_yearly_subscription}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.toggleMonthlyEstimateModal}>×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">

                  {(this.state.monthlyToYearlyData.monthly_plan_estimated != undefined && this.state.monthlyToYearlyData.yearly_plan_estimated != undefined) &&
                    <div className="monthly-estimate-block">
                      <div className="popup-accordian-section-head">
                        <div className="accordian-section text-left">{this.state.settingsLang.subscription_we_will_charge_your_card_with} {numberFormat(this.state.monthlyToYearlyData.monthly_plan_estimated.total_amount,'currency',2)} {this.state.settingsLang.subscription_we_will_charge_your_card_with}<br /> From {this.state.monthlyToYearlyData.monthly_plan_estimated.from_date} To {this.state.monthlyToYearlyData.monthly_plan_estimated.to_date}</div>
                      </div>
                      <div className="accordion-table your-billing m-b-20">
                        <SubscriptionMonthlyEstimate estimatedData={this.state.monthlyToYearlyData.monthly_plan_estimated} />
                      </div>

                      <div className="popup-accordian-section-head">
                        <div className="accordian-section text-left">{this.state.settingsLang.subscription_we_will_charge_your_card_with} {numberFormat(this.state.monthlyToYearlyData.yearly_plan_estimated.total_amount,'currency',2)} {this.state.settingsLang.subscription_we_will_charge_your_card_with}<br /> From {this.state.monthlyToYearlyData.yearly_plan_estimated.from_date} To {this.state.monthlyToYearlyData.yearly_plan_estimated.to_date}</div>
                      </div>
                      <div className="accordion-table your-billing m-b-20">
                          <div className="profile accordion-row">
                            <div className="accordian-section col-xs-6 text-left inner-box">
                              {this.state.settingsLang.subscription_your_yearly_subscription_for} {this.state.monthlyToYearlyData.yearly_plan_estimated.total_users} {this.state.settingsLang.subscription_users}
                            </div>
                            <div className="accordian-section col-xs-6 text-right inner-box">{numberFormat(this.state.monthlyToYearlyData.yearly_plan_estimated.total_amount,'currency',2)}</div>
                          </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-blue-btn pull-right" name='btn_create_schedule' onClick={this.subscriptionUpgradeToYearly}>{this.state.globalLang.label_continue}</a>
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.toggleMonthlyEstimateModal}>{this.state.globalLang.label_cancel}</a>
              </div>
            </div>
          </div>
          {/* Monthly Estimate Modal - END */}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SettingReducer.action === "SUBSCRIPTION_DETAILS") {
    if (state.SettingReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.subscriptionData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "SUBSCRIPTION_ADD_ON") {
    if (state.SettingReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.subscriptionData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "SUBSCRIPTION_CANCEL_REACTIVATE") {
    if (state.SettingReducer.data.status != 200 && state.SettingReducer.data.status != 201) {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      if (state.SettingReducer.data.status == 201) {
        returnState.message = state.SettingReducer.data.message;
      } else {
        returnState.message = languageData.global[state.SettingReducer.data.message];
      }
      returnState.subscriptionData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "SUBSCRIPTION_UPGRADE_ACCOUNT") {
   if (state.SettingReducer.data.status != 200) {
     toast.dismiss();
     toast.error(languageData.global[state.SettingReducer.data.message]);
     returnState.showLoader = false;
   } else {
     returnState.message = languageData.global[state.SettingReducer.data.message];
     returnState.subscriptionData = state.SettingReducer.data.data
   }
  } else if (state.SettingReducer.action === "SUBSCRIPTION_UPDATE_CARD") {
   if (state.SettingReducer.data.status != 200) {
     toast.dismiss();
     toast.error(languageData.global[state.SettingReducer.data.message]);
     returnState.showLoader = false;
   } else {
     returnState.showLoader = false;
     returnState.isEditCard = false;
     returnState.message = languageData.global[state.SettingReducer.data.message];
   }
  } else if (state.SettingReducer.action === "SUBSCRIPTION_AUTO_REFILL") {
    if (state.SettingReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.showLoader = false;
      returnState.message = languageData.global[state.SettingReducer.data.message];
    }
  } else if (state.SettingReducer.action === "SUBSCRIPTION_MONTHLY_TO_YEARLY_ESTIMATE") {
    if (state.SettingReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.monthlyToYearlyData = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "SUBSCRIPTION_MONTHLY_TO_YEARLY_UPGRADE") {
    if (state.SettingReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.subscriptionData = state.SettingReducer.data.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getSubscriptionDetails: getSubscriptionDetails,
    subscriptionAddOn: subscriptionAddOn,
    subscriptionCancelReactivate: subscriptionCancelReactivate,
    subscriptionUpgradeAccount:subscriptionUpgradeAccount,
    subscriptionUpdateCard:subscriptionUpdateCard,
    subscriptionAutoRefill:subscriptionAutoRefill,
    getSubscriptionMonthlyEstimate:getSubscriptionMonthlyEstimate,
    subscriptionUpgradeToYearly:subscriptionUpgradeToYearly,
    exportEmptyData:exportEmptyData

   }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Subscriptions
);
