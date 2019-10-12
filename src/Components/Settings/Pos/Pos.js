import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../../../Containers/Protected/Header.js';
import Footer from '../../../Containers/Protected/Footer.js';
import { ToastContainer, toast } from "react-toastify";
import IntlTelInput from 'react-intl-tel-input';
import validator from 'validator';
import { Link } from 'react-router-dom'
import Sidebar from '../../../Containers/Settings/sidebar.js';
import Loader from '../../Common/Loader.js'
import { getPosData, changePosStatus, changePosConnectionStatus,exportEmptyData, checkPosStripeBalance, disconnectPosStripeAcount,getPosStripeUpdateFields,
updatePosStripeAccountFields,getPosStripeDashboardUrl } from '../../../Actions/Settings/settingsActions.js';
import { capitalizeFirstLetter, numberFormat,toggleBodyScroll, getIsPosEnabled, showFormattedDate } from '../../../Utils/services.js';
import config from '../../../config';

class Pos extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      userChanged: false,
      showLoader: false,
      posData:{},
      stripeConfigClinic: [],
      stripeConfigGlobal: [],
      isStripeConfigGlobal:false,
      stripeConnectionMode :'global',
      stripeCountry: "US",
      stripeCurrency: "usd",
      stripeMode: "",
      pos_enabled: getIsPosEnabled(),
      isShowAlertModal : false,
      alertModalContent : '',
      alertModalType : 'pos_enabled',
      disconnectStripeId:'',
      disconnectClinicId:0,
      updateStripeId:'',
      updateClinicId:0,
      isShowUpdateModal:false,

      first_name:'',
      last_name:'',
      email:'',
      phoneNumber:'',
      firstNameClass:'setting-input-box',
      lastNameClass:'setting-input-box',
      emailClass:'setting-input-box',
      phoneNumberClass:'setting-input-box',
      phoneNumberError:false,
      isRender:false,
      defaultCountry: localStorage.getItem('cCode'),
      isPhoneNumberChanged:false,
      cardInputChnaged: false,
      showLoaderStripeUpdate:false,

      stripeSetupClinicId:0,
      posDashboardData:{}
    }
    const userData = JSON.parse(localStorage.getItem('userData'));
  }

  componentDidMount() {
    this.setState({showLoader: true })
    this.props.getPosData();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.posData !== undefined && nextProps.posData !== prevState.posData) {
      returnState.posData = nextProps.posData;
      returnState.stripeMode = returnState.posData.stripe_mode;
      returnState.stripeConfigClinic= returnState.posData.clinic_stripe_config;
      returnState.stripeConfigGlobal= returnState.posData.global_stripe_config;
      let isStripeConfigGlobal = Object.keys(returnState.stripeConfigGlobal).length;
      if(returnState.stripeMode === 'express' && isStripeConfigGlobal <= 1){
        isStripeConfigGlobal = 0
      }
      returnState.isStripeConfigGlobal = (isStripeConfigGlobal) ? true : false;

      if (!prevState.userChanged) {
        returnState.stripeConnectionMode= returnState.posData.connection_method;
        returnState.stripeCountry= returnState.posData.stripe_country;
        returnState.stripeCurrency= returnState.posData.stripe_currency;
        returnState.pos_enabled = returnState.posData.pos_enabled;
      }
      if(nextProps.isDisconnect !== undefined && nextProps.isDisconnect === true){
        returnState.pos_enabled = getIsPosEnabled()//(nextProps.pos_enabled) ? true : false;
      }

      returnState.showLoader = false;
      returnState.showLoaderStripeUpdate = false;
      returnState.isShowUpdateModal = false;
      returnState.disconnectStripeId = '';
      returnState.disconnectClinicId = 0;
      returnState.updateStripeId = '';
      returnState.updateClinicId = 0;
      returnState.first_name = '';
      returnState.last_name = '';
      returnState.email = '';
      returnState.phoneNumber = '';
      returnState.firstNameClass = 'setting-input-box';
      returnState.lastNameClass = 'setting-input-box';
      returnState.emailClass = 'setting-input-box';
      returnState.phoneNumberClass = 'setting-input-box';
      returnState.phoneNumberError = false;
      returnState.defaultCountry = 'us';
      returnState.isPhoneNumberChanged = false;
      returnState.cardInputChnaged = false;
      returnState.isRender = false;
      toggleBodyScroll(false);
    } else if (nextProps.resetConnectionAccount != undefined && nextProps.resetConnectionAccount == true) {
      returnState.showLoader = false;
      returnState.isShowAlertModal= true;
      returnState.alertModalType = 'warning';
      returnState.alertModalContent = nextProps.message;
      nextProps.exportEmptyData();
    } else if (nextProps.changePosMode != undefined && nextProps.changePosMode == true) {
      returnState.showLoader = false;
      returnState.pos_enabled = !prevState.pos_enabled;
      nextProps.exportEmptyData();
    } else if (nextProps.changeStripeConnectionMode != undefined && nextProps.changeStripeConnectionMode == true) {
      returnState.showLoader = false;
      returnState.stripeConnectionMode = (prevState.stripeConnectionMode == 'global') ? 'clinic' : 'global';
      nextProps.exportEmptyData();
    } else if (nextProps.posStripeBalanceData != undefined) {
      nextProps.exportEmptyData();
      if(nextProps.posStripeBalanceData == 0){
        returnState.alertModalType = 'pos_disconnect';
        returnState.isShowAlertModal =true;
        returnState.alertModalContent = prevState.settingsLang.pos_delete_account_for_zero_balance_alert_msg;
        toggleBodyScroll(true)
      } else {
        returnState.alertModalType = 'warning';
        returnState.isShowAlertModal =true;
        returnState.alertModalContent = prevState.settingsLang.pos_delete_account_for_balance_part_1_alert_msg +' '+ numberFormat(nextProps.posStripeBalanceData, 'currency',2)+' ,'+prevState.settingsLang.pos_delete_account_for_balance_part_2_alert_msg;
        returnState.disconnectStripeId = '';
        returnState.disconnectClinicId =0;
      }
      returnState.showLoader = false;
      toggleBodyScroll(true)
    } else if (nextProps.posStripeUpdateData != undefined) {
      nextProps.exportEmptyData();
      returnState.showLoader = false;
      returnState.showLoaderStripeUpdate = false;
      returnState.isShowUpdateModal = true;
      returnState.first_name = nextProps.posStripeUpdateData.stripe_first_name;
      returnState.last_name = nextProps.posStripeUpdateData.stripe_last_name;
      returnState.email = nextProps.posStripeUpdateData.stripe_email;
      returnState.phoneNumber = nextProps.posStripeUpdateData.stripe_phone_number;
      returnState.firstNameClass = 'setting-input-box';
      returnState.lastNameClass = 'setting-input-box';
      returnState.emailClass = 'setting-input-box';
      returnState.phoneNumberClass = 'setting-input-box';
      returnState.phoneNumberError = false;
      returnState.defaultCountry = 'us';
      returnState.isPhoneNumberChanged = false;
      returnState.cardInputChnaged = false;
      returnState.isRender = true;
      toggleBodyScroll(true)
    }  else if (nextProps.posDashboardData != undefined) {
      nextProps.exportEmptyData();
      returnState.showLoader = false;
      window.open(nextProps.posDashboardData,'_blank')
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      returnState.showLoaderStripeUpdate = false;
      nextProps.exportEmptyData();
    }
    return returnState
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value = target.value;
    const name = target.name;
    let returnState = {}
    returnState.userChanged = true;
    switch (target.type) {
      case 'checkbox':
        value = target.checked;
        break;
      case 'radio':
        //value = target.checked;
        break;
    }
    if(!value && name == 'pos_enabled'){
      returnState.alertModalType = 'pos_enabled';
      returnState.isShowAlertModal =true;
      returnState.alertModalContent = this.state.settingsLang.pos_enable_alert_msg;
      toggleBodyScroll(false)
    } else if(name == 'stripeConnectionMode'){
      returnState.alertModalType = 'connection';
      returnState.isShowAlertModal =true;
      returnState.alertModalContent = this.state.settingsLang.pos_stripe_alert_msg;
      toggleBodyScroll(false)
    } else {
      if(name == 'pos_enabled'){
        returnState.showLoader = true;
        this.props.changePosStatus({status:1})
      }
    }
    this.setState(returnState);
  }

  handleSubmit = (event) => {
    return
  }

  handlePosDisable = () => {
    toggleBodyScroll(false)
    this.setState({showLoader:true, isShowAlertModal: false})
    this.props.changePosStatus({status:0})
  }

  handleStripeType = () => {
    toggleBodyScroll(false)
    this.props.changePosConnectionStatus({connection_type:(this.state.stripeConnectionMode == 'global') ? 'clinic' : 'global'});
    this.setState({showLoader:true,isShowAlertModal: false})
  }


  handleAlertModal = () => {
    toggleBodyScroll(!this.state.isShowAlertModal)
    this.setState({isShowAlertModal: !this.state.isShowAlertModal})
  }

  PosSetup = (event) => {
    const accountType = event.target.dataset.accountType;
    const clinicId = event.target.dataset.clinicId;
    if(accountType == 'global'){
      return (
        <div>
          {this.props.history.push(`/settings/pos/setup/global`)}
        </div>
      );
    } else if(accountType == 'clinic' && clinicId > 0){
      return (
        <div>
          {this.props.history.push(`/settings/pos/setup/clinic/${clinicId}`)}
        </div>
      );
    }
  }
  PosCardReader = (event) => {
    const accountType = event.target.dataset.accountType;
    const clinicId = event.target.dataset.clinicId;
    if(accountType == 'global'){
      return (
        <div>
          {this.props.history.push(`/settings/pos/card-reader/global`)}
        </div>
      );
    } else if(accountType == 'clinic' && clinicId > 0){
      return (
        <div>
          {this.props.history.push(`/settings/pos/card-reader/clinic/${clinicId}`)}
        </div>
      );
    }
  }

  StripeSetup = (clinicId,setupUrl) => {
    this.setState({stripeSetupClinicId:clinicId})
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.setState({showLoader:true})
    if((userData) && userData.user !== undefined && userData.user.email_id !== undefined ){
      localStorage.setItem('stripeSetupClinicId',clinicId)
      //setupUrl += '&stripe_user[email]='+userData.user.email_id+"&redirect_uri="+window.location.origin+"/settings/pos/express/setup";
      setupUrl += "&redirect_uri="+window.location.origin+"/settings/pos/express/setup";
      window.location = setupUrl;
    } else {
      this.setState({showLoader:false})
    }
  }

  VisitStipeDashboard = (clinicId) => {
    this.setState({showLoader:true})
    this.props.getPosStripeDashboardUrl({clinic_id:clinicId})
  }

  checkPosStripeBalance = (event) => {
    const stripeId = event.target.dataset.stripeId;
    const clinicId = event.target.dataset.clinicId;
    if(stripeId != undefined && stripeId != null && stripeId != ''){
      this.setState({showLoader:true, disconnectStripeId : stripeId,disconnectClinicId:clinicId})
      this.props.checkPosStripeBalance({stripe_user_id:stripeId});
    }
  }

  disconnectPosStripeAcount = () => {
    if(this.state.disconnectStripeId !== ''){
      this.setState({showLoader:true})
      this.props.disconnectPosStripeAcount({stripe_user_id:this.state.disconnectStripeId, clinic_id:this.state.disconnectClinicId});
    }
    toggleBodyScroll(false)
    this.setState({isShowAlertModal: false})
  }

  getPosStripeUpdateFields = (event) => {
    const stripeId = event.target.dataset.stripeId;
    const clinicId = event.target.dataset.clinicId;
    if(stripeId != undefined && stripeId != null && stripeId != ''){
      this.setState({showLoader:true, updateStripeId : stripeId,updateClinicId:clinicId,isRender: false})
      this.props.getPosStripeUpdateFields(stripeId);
    }
  }

  handleCardInputChange = (event) => {
    const target = event.target;
    let value = target.value;
    const name = target.name;
    let returnState = {}
    returnState.cardInputChnaged = true;
    returnState[name] = value;
    this.setState(returnState);
  }

  updatePosStripeAccountFields = (event) => {
    let error = false;

    if (this.state.first_name === undefined || this.state.first_name === null || this.state.first_name.trim() === '' || !validator.isAlpha(this.state.first_name)) {
      this.setState({firstNameClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.first_name) {
      this.setState({firstNameClass:'setting-input-box'})
    }

    if (this.state.last_name === undefined || this.state.last_name === null || this.state.last_name.trim() === '' || !validator.isAlpha(this.state.last_name)) {
      this.setState({lastNameClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.last_name) {
      this.setState({lastNameClass:'setting-input-box'})
    }

    if (typeof this.state.email === undefined || this.state.email === null || this.state.email.trim() === '' || !validator.isEmail(this.state.email)) {
      this.setState({emailClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.email) {
      this.setState({emailClass:'setting-input-box'})
    }

    if ((typeof this.state.phoneNumber === undefined || this.state.phoneNumber === null || this.state.phoneNumber.trim() === '')) {
      this.setState({phoneNumberClass:'setting-input-box'})
    } else if(this.state.phoneNumber !== '' && this.state.phoneNumberError) {
      this.setState({phoneNumberClass:'setting-input-box  field_error'})
      error = true;
    } else if(this.state.phoneNumber !== '' && !this.state.phoneNumberError) {
      this.setState({phoneNumberClass:'setting-input-box'})
    }
    if(error){
      return
    }

    let formData = {
      stripe_user_id :  this.state.updateStripeId,
      clinic_id :  this.state.updateClinicId,
      first_name : this.state.first_name,
      last_name : this.state.last_name,
      email : this.state.email,
      phone_number : this.state.phoneNumber
    }
    if(this.state.updateStripeId !== ''){
      this.setState({showLoaderStripeUpdate:true})
      this.props.updatePosStripeAccountFields(formData);
    }
  }

  handleUpdatModal = (event) => {
    toggleBodyScroll(false);
    this.setState({isShowUpdateModal:false})
  }

  phoneNumberChanged = (inputFiled,t, x, y, number) => {
    this.setState({cardInputChnaged: true,isPhoneNumberChanged:true});
    let fullNumber = ''
    //const phoneNumber = number.replace(/\s/g,'')
    const phoneNumber = number.replace(/[ `~!@#$%^&*()_|\-=?;:'",.<>\{\}\[\]\\\/]/gi,'')
    let phoneNumberError = true;
    let phoneNumberClass = 'setting-input-box setting-input-box-invalid';
    if(t) {
      phoneNumberError = false;
      phoneNumberClass = 'setting-input-box';
      fullNumber = number
    }
    this.setState({[inputFiled]:phoneNumber,[inputFiled+'Error']:phoneNumberError,[inputFiled+'Class']:phoneNumberClass})
  }

  render() {
    return (
      <div className="main protected pos-settings">
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-container">
                <div className="setting-title">{this.state.settingsLang.sidebar_POS_settings_menu}
                <span className="setting-custom-switch pull-right no-margin">
                    <span id="enabled-text">
                      {this.state.pos_enabled ? this.state.settingsLang.pos_enabled_label : this.state.settingsLang.pos_disabled_label }
                      </span>
                    <label className="setting-switch pull-right">
                      <input type="checkbox" id="pos_enabled" name="pos_enabled" className=" setting-custom-switch-input" checked={this.state.pos_enabled ? "checked" : false} value={this.state.pos_enabled} onChange={this.handleInputChange} />
                      <span className="setting-slider" />
                    </label><br /><br />
                  </span>
                </div>
                <div className={this.state.pos_enabled ? 'is-pos_enabled-form-title' : 'is-pos_enabled-form-title no-display'}>
                  <p className="p-text no-margin">{this.state.settingsLang.pos_please_select_label}:</p>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="pos-stripe-outer">
                        <input type="radio" onChange={this.handleInputChange} className="pos-stripe-input pos-stripe-option stripe-option" id="single-stripe" name="stripeConnectionMode" value="global" checked={this.state.stripeConnectionMode == 'global' ? 'checked' : false} />
                        <label className="pos-stripe-discrip" htmlFor="single-stripe">
                          <span className="pos-stripe-title">{(this.state.stripeMode=== 'custom') ? this.state.settingsLang.pos_single_pos_account : this.state.settingsLang.pos_single_stripe_account}</span>
                          {this.state.settingsLang.pos_single_stripe_account_label}</label>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="pos-stripe-outer">
                        <input type="radio" onChange={this.handleInputChange} className="pos-stripe-input pos-stripe-option stripe-option" id="stripe-account" name="stripeConnectionMode" value="clinic" checked={this.state.stripeConnectionMode == 'clinic' ? 'checked' : false} />
                        <label className="pos-stripe-discrip" htmlFor="stripe-account">
                          <span className="pos-stripe-title">{(this.state.stripeMode=== 'custom') ? this.state.settingsLang.pos_pos_account_per_clinic : this.state.settingsLang.pos_stripe_account_per_clinic}</span>
                          {this.state.settingsLang.pos_stripe_account_per_clinic_label}</label>
                      </div>
                    </div>
                  </div>
                  <div className={this.state.stripeConnectionMode == 'global' ? "row single" : "row single no-display"} id="global-settings">
                    { (!this.state.isStripeConfigGlobal)
                      ?
                      <div className="col-lg-12 col-xs-12 m-t-10">
                        <div className="row global-connect">
                          <div className="col-sm-6 col-md-8 col-lg-9">
                          {this.state.settingsLang.pos_you_have_not_connected_your_pos_account_yet}
                          {this.state.settingsLang.pos_please_click_connect_to_link_your_pos_account}
                          </div>
                          <div className="col-sm-6 col-md-4 col-lg-3 text-right">
                            {(this.state.stripeMode === 'express') ?
                              <a href="javascript:void(0)" onClick={this.StripeSetup.bind(this,0, this.state.stripeConfigGlobal.account_connect_url)} data-account-type="global" data-clinic-id="0" className="stripe-link">{'Connect with Stripe'}</a>
                            :
                              <a href="javascript:void(0)" onClick={this.PosSetup} data-account-type="global" data-clinic-id="0" className="new-white-btn small-stripe-btn modal-link">{this.state.settingsLang.pos_setup_your_account}</a>
                          }
                          </div>
                        </div>
                      </div>
                      :
                      (this.state.stripeMode === 'express') ?
                        <div className="col-lg-12 col-xs-12 m-t-10">
                          <div className="row">
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_your_account_is_connected_on}</div>
                                <div className="setting-input-box">{showFormattedDate(this.state.stripeConfigGlobal.date_created, false, 'MM/DD/YYYY')}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_your_stripe_id}</div>
                                <div className="setting-input-box">{this.state.stripeConfigGlobal.stripe_user_id}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_application_fee}</div>
                                <div className="setting-input-box">{(this.state.stripeConfigGlobal.platform_fee) ? numberFormat(this.state.stripeConfigGlobal.platform_fee,'decimal',2)+'%' : ''}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_application_fee_for_swipe}:</div>
                                <div className="setting-input-box">{(this.state.stripeConfigGlobal.platform_fee_swipe) ? numberFormat(this.state.stripeConfigGlobal.platform_fee_swipe,'decimal',2)+'%' : ''}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_stripe_dashboard}</div>
                                <a href="javascript:void(0)" onClick={this.VisitStipeDashboard.bind(this,0)} data-account-type="global" data-clinic-id="0" data-stripe-id={this.state.stripeConfigGlobal.stripe_user_id} className="new-white-btn small-stripe-btn dashboard-link">{this.state.settingsLang.pos_visit_stripe_dashboard}</a>
                              </div>
                            </div>
                            <div className="col-sm-12">
                              {(this.state.stripeCurrency === 'usd') &&
                                <a href="javascript:void(0)" onClick={this.checkPosStripeBalance} data-account-type="global" data-clinic-id="0" data-stripe-id={this.state.stripeConfigGlobal.stripe_user_id} className="new-blue-btn small-stripe-btn stripe-disconnect">{this.state.settingsLang.pos_disconnect_with_stripe}</a>
                              }
                              <a href="javascript:void(0)" onClick={this.PosCardReader} data-account-type="global" data-clinic-id="0" data-stripe-id={this.state.stripeConfigGlobal.stripe_user_id} className="new-blue-btn small-stripe-btn modal-link">{this.state.settingsLang.pos_card_readers}</a>
                            </div>
                          </div>
                        </div>
                        :
                        <div className="col-lg-12 col-xs-12 m-t-10">
                          <div className="row">
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_legal_name}</div>
                                <div className="setting-input-box">{this.state.stripeConfigGlobal.stripe_first_name + " "+this.state.stripeConfigGlobal.stripe_last_name}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.post_treatment_email}</div>
                                <div className="setting-input-box">{this.state.stripeConfigGlobal.stripe_email}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_application_fee}</div>
                                <div className="setting-input-box">{(this.state.stripeConfigGlobal.platform_fee) ? numberFormat(this.state.stripeConfigGlobal.platform_fee,'decimal',2)+'%' : ''}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_application_fee_for_swipe}:</div>
                                <div className="setting-input-box">{(this.state.stripeConfigGlobal.platform_fee_swipe) ? numberFormat(this.state.stripeConfigGlobal.platform_fee_swipe,'decimal',2)+'%' : ''}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.setting_currency}</div>
                                <div className="setting-input-box">{(this.state.stripeConfigGlobal.platform_fee_swipe) ? this.state.stripeCurrency.toUpperCase() :''}</div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.settingsLang.pos_account_status}</div>
                                <div className={(this.state.stripeConfigGlobal.stripe_account_status == 'verified') ? "setting-input-box stripe-verified" : "setting-input-box stripe-unverified"}>{(this.state.stripeConfigGlobal.stripe_account_status != null && this.state.stripeConfigGlobal.stripe_account_status != '') ? capitalizeFirstLetter(this.state.stripeConfigGlobal.stripe_account_status) : null}</div>
                              </div>
                            </div>
                            <div className="col-sm-12">
                              <a href="javascript:void(0)" onClick={this.checkPosStripeBalance} data-account-type="global" data-clinic-id='0' data-stripe-id={this.state.stripeConfigGlobal.stripe_user_id} className="new-blue-btn small-stripe-btn stripe-disconnect">{this.state.settingsLang.pos_disconnect_pos}</a>
                              {(this.state.stripeCurrency === 'usd') &&
                                <a href="javascript:void(0)" onClick={this.PosCardReader} data-account-type="global" data-clinic-id='0' data-stripe-id={this.state.stripeConfigGlobal.stripe_user_id} className="new-blue-btn small-stripe-btn modal-link">{this.state.settingsLang.pos_card_readers}</a>
                              }
                              <a href="javascript:void(0)" onClick={this.getPosStripeUpdateFields} data-account-type="global" data-clinic-id='0' data-stripe-id={this.state.stripeConfigGlobal.stripe_user_id}  data-title className="new-blue-btn small-stripe-btn modal-link">{this.state.settingsLang.pos_update_info}</a>
                            </div>
                          </div>
                        </div>
                    }
                  </div>
                </div>
              </div>
              <div id="per-clinic-settings" className={this.state.pos_enabled ? '' : 'no-display'}>
                <div className={this.state.stripeConnectionMode == 'clinic' ? "table-responsive" : "table-responsive no-display"}>
                  {(this.state.stripeMode=== 'custom') &&
                    <table className="table-updated no-hover setting-table table-min-width">
                      <thead className="table-updated-thead">
                        <tr>
                          <th className="col-xs-2 table-updated-th sorting">{this.state.globalLang.label_clinic}</th>
                          <th className="col-xs-2 table-updated-th sorting">{this.state.settingsLang.pos_legal_name}</th>
                          <th className="col-xs-1 table-updated-th sorting">{this.state.settingsLang.post_treatment_email}</th>
                          <th className="col-xs-1 table-updated-th sorting">{this.state.globalLang.label_fee} </th>
                          <th className="col-xs-1 table-updated-th sorting">{this.state.settingsLang.pos_swipe_fee}</th>
                          <th className="col-xs-1 table-updated-th sorting">{this.state.settingsLang.setting_currency}</th>
                          <th className="col-xs-1 table-updated-th sorting">{this.state.settingsLang.pos_account_status}</th>
                          <th className="col-xs-3 table-updated-th sorting">{this.state.globalLang.label_action} </th>
                        </tr>
                      </thead>
                      <tbody className="ajax_body">
                        {(this.state.stripeConfigClinic.length > 0) &&
                          this.state.stripeConfigClinic.map((obj,idx) => {
                              return (
                                <tr className="table-updated-tr" key={'stripeConfigClinic-'+idx}>
                                  <td className="table-updated-td">{obj.clinic_name}</td>
                                  <td className="table-updated-td">{obj.stripe_first_name + " "+obj.stripe_last_name}</td>
                                  <td className="table-updated-td">{obj.stripe_email}</td>
                                  <td className="table-updated-td">{(obj.platform_fee) ? numberFormat(obj.platform_fee,'decimal',2)+'%' : ''}</td>
                                  <td className="table-updated-td">{(obj.platform_fee_swipe) ? numberFormat(obj.platform_fee_swipe,'decimal',2)+'%' : ''}</td>
                                  <td className="table-updated-td">{(obj.platform_fee) ? this.state.stripeCurrency.toUpperCase() : ''}</td>
                                  <td className={(obj.stripe_account_status == 'verified') ? "table-updated-td stripe-verified" : "table-updated-td stripe-unverified"}>{(obj.stripe_account_status != null && obj.stripe_account_status != '') ? capitalizeFirstLetter(obj.stripe_account_status) : null}</td>
                                  {(obj.stripe_user_id == undefined || obj.stripe_user_id == null || obj.stripe_user_id == '') ?
                                  <td className="table-updated-td">
                                    <a href="javascript:void(0)" onClick={this.PosSetup} data-account-type="clinic" data-clinic-id={obj.id} className="stripe-link">{this.state.settingsLang.pos_setup_your_account}</a>
                                  </td>
                                  :
                                  <td className="table-updated-td">
                                    <a href="javascript:void(0)" onClick={this.checkPosStripeBalance} data-account-type="clinic" data-clinic-id={obj.id} data-stripe-id={obj.stripe_user_id} className="stripe-link">{this.state.settingsLang.pos_disconnect_pos}</a>
                                    <br />
                                    {(this.state.stripeCurrency === 'usd') &&
                                      <a href="javascript:void(0)" onClick={this.PosCardReader} data-account-type="clinic" data-clinic-id={obj.id} data-stripe-id={obj.stripe_user_id} className="stripe-link modal-link">{this.state.settingsLang.pos_card_readers}</a>
                                    }
                                    {(this.state.stripeCurrency === 'usd') &&
                                      <br />
                                    }
                                    <a href="javascript:void(0)" onClick={this.getPosStripeUpdateFields} data-account-type="clinic" data-clinic-id={obj.id} data-stripe-id={obj.stripe_user_id} className="stripe-link get-stripe-acct-details">{this.state.settingsLang.pos_update_info}</a>
                                  </td>
                                  }
                                </tr>
                              )
                          })
                        }
                      </tbody>
                    </table>
                  }
                  {(this.state.stripeMode=== 'express') &&
                    <table className="table-updated no-hover setting-table table-min-width">
                      <thead className="table-updated-thead">
                        <tr>
                          <th className="col-xs-3 table-updated-th sorting">{this.state.globalLang.label_clinic}</th>
                          <th className="col-xs-2 table-updated-th sorting">{this.state.globalLang.label_status} </th>
                          <th className="col-xs-2 table-updated-th sorting">{this.state.globalLang.label_fee} </th>
                          <th className="col-xs-2 table-updated-th sorting">{this.state.settingsLang.pos_swipe_fee}</th>
                          <th className="col-xs-3 table-updated-th sorting">{(this.state.stripeConfigClinic.length > 0) ? this.state.globalLang.label_action : ''} </th>
                        </tr>
                      </thead>
                      <tbody className="ajax_body">
                        {(this.state.stripeConfigClinic.length > 0) &&
                          this.state.stripeConfigClinic.map((obj,idx) => {
                              return (
                                <tr className="table-updated-tr" key={'stripeConfigClinic-'+idx}>
                                  <td className="table-updated-td">{obj.clinic_name}</td>
                                  <td className="table-updated-td">
                                    {(obj.stripe_user_id == undefined || obj.stripe_user_id == null || obj.stripe_user_id == '') ?
                                    'Not connected' : 'Connected ' + showFormattedDate(obj.stripe_date_created) }
                                 </td>
                                 <td className="table-updated-td">{(obj.platform_fee) ? numberFormat(obj.platform_fee,'decimal',2)+'%' : ''}</td>
                                 <td className="table-updated-td">{(obj.platform_fee_swipe) ? numberFormat(obj.platform_fee_swipe,'decimal',2)+'%' : ''}</td>
                                 {(obj.stripe_user_id == undefined || obj.stripe_user_id == null || obj.stripe_user_id == '') ?
                                  <td className="table-updated-td">
                                    <a href="javascript:void(0)" onClick={this.StripeSetup.bind(this,obj.id, obj.account_connect_url)} data-account-type="clinic" data-clinic-id={obj.id} className="stripe-link">{'Connect with Stripe'}</a>
                                  </td>
                                  :
                                  <td className="table-updated-td">
                                    <a href="javascript:void(0)" onClick={this.VisitStipeDashboard.bind(this,obj.id)} data-account-type="clinic" data-clinic-id={obj.id} data-stripe-id={obj.stripe_user_id} className="stripe-link get-stripe-acct-details">{this.state.settingsLang.pos_visit_stripe_dashboard} </a>
                                    <br />
                                    <a href="javascript:void(0)" onClick={this.checkPosStripeBalance} data-account-type="clinic" data-clinic-id={obj.id} data-stripe-id={obj.stripe_user_id} className="stripe-link">{this.state.settingsLang.pos_disconnect_with_stripe}</a>
                                    <br />
                                    {(this.state.stripeCurrency === 'usd') &&
                                      <a href="javascript:void(0)" onClick={this.PosCardReader} data-account-type="clinic" data-clinic-id={obj.id} data-stripe-id={obj.stripe_user_id} className="stripe-link modal-link">{this.state.settingsLang.pos_card_readers}</a>
                                    }
                                   </td>
                                  }
                                </tr>
                              )
                          })
                        }
                      </tbody>
                    </table>
                  }
                </div>
              </div>
              <Loader showLoader={this.state.showLoader} />
            </div>

          </div>
          {/* Update Stipe Info Modal - START */}
          <div className={this.state.isShowUpdateModal ? "modalOverlay" : 'no-display'}>
            <div className="small-popup-outer no-popup-scroll">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.settingsLang.pos_update_account_details}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handleUpdatModal} >×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.user_First_Name}<span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                        <input name="first_name" value={this.state.first_name} onChange={this.handleCardInputChange} className={this.state.firstNameClass}  type="text"  autoComplete="off"/>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.user_Last_Name}<span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                        <input  name="last_name" value={this.state.last_name} onChange={this.handleCardInputChange} className={this.state.lastNameClass}  type="text"  autoComplete="off"/>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.post_treatment_email}<span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                        <input  name="email" value={this.state.email} onChange={this.handleCardInputChange} className={this.state.emailClass}  type="text"  autoComplete="off"/>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.pos_phone_number}</div>
                        <div className="setting-input-outer">
                          {(this.state.isRender) && <IntlTelInput
                              preferredCountries={['tw']}
                              css={ ['intl-tel-input', this.state.phoneNumberClass] }
                              utilsScript={ 'libphonenumber.js' }
                              defaultValue = {(this.state.phoneNumber) ? this.state.phoneNumber : ''}
                              defaultCountry = {this.state.defaultCountry}
                              fieldName='phoneNumber'
                              onPhoneNumberChange={ this.phoneNumberChanged.bind(this,'phoneNumber') }
                              onPhoneNumberBlur={ this.phoneNumberChanged.bind(this,'phoneNumber') }
                              placeholder="Phone Number"
                              separateDialCode={`true`}
                            />}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.updatePosStripeAccountFields}>{this.state.globalLang.label_save}</a>
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handleUpdatModal}>{this.state.globalLang.label_cancel}</a>
              </div>
              <Loader showLoader={this.state.showLoaderStripeUpdate} />
            </div>
          </div>
          {/* Update Stipe Info Modal - END */}
          {/* Alert Modal - START */}
          <div className={this.state.isShowAlertModal ? "modalOverlay" : 'no-display' }>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.globalLang.label_alert}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handleAlertModal} >×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-sm-12 col-xs-12">
                      <div className="setting-field-outer">
                        {(this.state.alertModalType != 'warning') &&
                          <div className="new-field-label alert-modal-title">{this.state.globalLang.are_you_sure}</div>
                        }
                        <div className="new-field-label alert-modal-content">{this.state.alertModalContent}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handleAlertModal}>{this.state.globalLang.label_cancel}</a>
                {(this.state.alertModalType == 'pos_enabled') &&
                  <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.handlePosDisable} >{this.state.settingsLang.yes_disable_it}</a>
                }
                {(this.state.alertModalType == 'connection') &&
                  <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.handleStripeType}>{this.state.settingsLang.yes_change_it}</a>
                }
                {(this.state.alertModalType == 'pos_disconnect') &&
                  <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.disconnectPosStripeAcount}>{this.state.settingsLang.pos_yes_disconnect_it}</a>
                }
              </div>
            </div>
          </div>
          {/* Alert Modal - END */}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SettingReducer.action === "GET_POS_DATA") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.posData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "CHANGE_POS_STATUS") {
    toast.dismiss();
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.changePosMode = true;
    }
  } else if (state.SettingReducer.action === "CHANGE_POS_CONNECTION_STATUS") {
   toast.dismiss();
   if (state.SettingReducer.data.status != 200 && state.SettingReducer.data.status != 201) {
     toast.error(languageData.global[state.SettingReducer.data.message]);
     returnState.showLoader = false
   } else {
     if (state.SettingReducer.data.status == 201) {
       returnState.resetConnectionAccount = true;
       returnState.message = languageData.global[state.SettingReducer.data.message]
     } else {
       toast.success(languageData.global[state.SettingReducer.data.message]);
       returnState.changeStripeConnectionMode = true;
     }
   }
  } else if (state.SettingReducer.action === "CHECK_POS_STRIPE_BALANCE") {
   toast.dismiss();
   if (state.SettingReducer.data.status != 200) {
     if(state.SettingReducer.data.message == 'third_party_error'){
       toast.error(state.SettingReducer.data.data);
     } else {
       toast.error(languageData.global[state.SettingReducer.data.message]);
     }
     returnState.showLoader = false
   } else {
     returnState.posStripeBalanceData= state.SettingReducer.data.data
   }
  } else if (state.SettingReducer.action === "DISCONNENCT_POS_STRIPE_ACCOUNT") {
   toast.dismiss();
   if (state.SettingReducer.data.status != 200) {
     if(state.SettingReducer.data.message == 'third_party_error'){
       toast.error(state.SettingReducer.data.data);
     } else {
       toast.error(languageData.global[state.SettingReducer.data.message]);
     }
     returnState.showLoader = false
   } else {
     toast.success(languageData.global[state.SettingReducer.data.message]);
     returnState.posData= state.SettingReducer.data.data
     returnState.isDisconnect = true;
   }
  } else if (state.SettingReducer.action === "GET_POS_STRIPE_ACCOUNT_FIELDS") {
   toast.dismiss();
   if (state.SettingReducer.data.status != 200) {
     if(state.SettingReducer.data.message == 'third_party_error'){
       toast.error(state.SettingReducer.data.data);
     } else {
       toast.error(languageData.global[state.SettingReducer.data.message]);
     }
     returnState.showLoader = false
   } else {
     returnState.posStripeUpdateData= state.SettingReducer.data.data
   }
  } else if (state.SettingReducer.action === "UPDATE_POS_STRIPE_ACCOUNT") {
   toast.dismiss();
   if (state.SettingReducer.data.status != 200) {
     if(state.SettingReducer.data.message == 'third_party_error'){
       toast.error(state.SettingReducer.data.data);
     } else {
       toast.error(languageData.global[state.SettingReducer.data.message]);
     }
     returnState.showLoader = false
   } else {
     toast.success(languageData.global[state.SettingReducer.data.message]);
     returnState.posData= state.SettingReducer.data.data
   }
  }  else if (state.SettingReducer.action === "GET_POS_STRIPE_DASHBOARD_URL") {
   toast.dismiss();
   if (state.SettingReducer.data.status != 200) {
     if(state.SettingReducer.data.message == 'third_party_error'){
       toast.error(state.SettingReducer.data.data);
     } else {
       toast.error(languageData.global[state.SettingReducer.data.message]);
     }
     returnState.showLoader = false
   } else {
     //toast.success(languageData.global[state.SettingReducer.data.message]);
     returnState.posDashboardData= state.SettingReducer.data.data
   }
  } else if (state.SettingReducer.action === "EMPTY_DATA") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getPosData: getPosData,
    changePosStatus: changePosStatus,
    changePosConnectionStatus: changePosConnectionStatus,
    checkPosStripeBalance: checkPosStripeBalance,
    disconnectPosStripeAcount: disconnectPosStripeAcount,
    getPosStripeUpdateFields:getPosStripeUpdateFields,
    getPosStripeDashboardUrl:getPosStripeDashboardUrl,
    updatePosStripeAccountFields:updatePosStripeAccountFields,
    exportEmptyData:exportEmptyData
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(Pos);
