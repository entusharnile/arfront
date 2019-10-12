import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Select from 'react-select';
import { getPosPaymentSettingData,getPosBankAccountFields,addPosBankAccount,setPosDefaultBnkAccount,getPosPayoutScheduleData,updatePosPayoutScheduleData,exportEmptyData } from '../../../../Actions/Settings/settingsActions.js';
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'
import { capitalizeFirstLetter, toggleBodyScroll } from '../../../../Utils/services.js';

class PosPaymentSettings extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      posPaymentData :{},
      bankConfigClinic: [],
      bankConfigGlobal: [],
      connectionMode :'clinic',
      defaultCurrency: "usd",
      hasClinicBankAccount: false,
      showBankNotAddedAlert: false,
      pos_enabled: false,
      showLoader: false,

      addBankClinicId:0,
      posBankAccountData: {},
      account_input_label:'',
      account_input_place_holder:'',
      account_input_value:'',
      account_holder_name:'',
      routing_number:'',
      show_routing_number: false,
      bankDefaultCountry:{},
      bankDefaultCurrency:'',
      accountInputLableCalss:'setting-input-box',
      accountHolderNameCalss:'setting-input-box',
      routingNumberCalss:'setting-input-box',
      showLoaderAddBank: false,
      isShowBankAccountModal:false,

      payoutScheduleClinicId:0,
      payout_anchor:'',
      payout_type:'automatic',
      payout_inteval:'daily',
      payout_daily_delay_days:'2',
      payoutMonthList:{},
      payoutWeekList:{},
      payoutTypeCalss:'setting-select-box',
      payoutIntervalCalss:'setting-select-box',
      payoutAnchorCalss:'setting-select-box',
      showLoaderPayoutSchedule: false,
      isShowPayoutScheduleModal:false,

      isShowAlertModal:false,
      defaultBankIdentifier:''
    }
  }

  componentDidMount() {
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({showLoader:true})
    this.props.getPosPaymentSettingData();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}
    if (nextProps.posPaymentData !== undefined && nextProps.posPaymentData !== prevState.posPaymentData) {
      returnState.posPaymentData = nextProps.posPaymentData;
      returnState.bankConfigClinic= returnState.posPaymentData.clinic_bank_config;
      returnState.bankConfigGlobal= returnState.posPaymentData.global_bank_config;
      returnState.connectionMode= returnState.posPaymentData.connection_method;
      returnState.defaultCurrency= returnState.posPaymentData.default_currency;
      returnState.hasClinicBankAccount= returnState.posPaymentData.has_clinic_bank_account;
      returnState.showBankNotAddedAlert= returnState.posPaymentData.show_bank_not_added_alert;
      returnState.pos_enabled = returnState.posPaymentData.pos_enabled;
      returnState.showLoader = false;
      returnState.posBankAccountData = {}
      returnState.showLoaderAddBank = false;
      returnState.isShowBankAccountModal = false;
      returnState.posPayoutScheduleData = {}
      returnState.showLoaderPayoutSchedule = false;
      returnState.isShowPayoutScheduleModal  = false;
      returnState.payoutMonthList = nextProps.posPaymentData.monthly_opions;
      returnState.payoutWeekList = nextProps.posPaymentData.weekly_options;
      returnState.addBankClinicId = 0;
      returnState.payoutScheduleClinicId = 0;
      returnState.defaultBankIdentifier =  ''
      toggleBodyScroll(false)
    } else if (nextProps.posBankAccountData != undefined && nextProps.posBankAccountData !== prevState.posBankAccountData) {
      returnState.showLoader = false;
      returnState.posBankAccountData = nextProps.posBankAccountData;
      returnState.account_input_label = nextProps.posBankAccountData.account_input_label;
      returnState.account_input_place_holder = nextProps.posBankAccountData.account_place_holder;
      returnState.account_input_value = '';
      returnState.account_holder_name = '';
      returnState.routing_number = '';
      returnState.show_routing_number =  nextProps.posBankAccountData.show_routing_number;
      returnState.bankDefaultCountry = nextProps.posBankAccountData.default_country;
      returnState.bankDefaultCurrency = nextProps.posBankAccountData.default_currency;
      returnState.accountInputLableCalss = 'setting-input-box';
      returnState.accountHolderNameCalss = 'setting-input-box';
      returnState.routingNumberCalss = 'setting-input-box';
      returnState.isShowBankAccountModal  = true;
      toggleBodyScroll(true)
      nextProps.exportEmptyData();
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      returnState.showLoaderAddBank = false;
      returnState.showLoaderPayoutSchedule = false;
      nextProps.exportEmptyData();
      toggleBodyScroll(false)
    }
    return returnState;
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value = target.value;
    const name = target.name;
    let returnState = {}
    returnState.dataChanged = true;
    if(name === this.state.account_input_label){
      returnState.account_input_value = value;
    } else {
      if(name === 'payout_interval'){
        returnState.payout_anchor = '';
      }
      returnState[name] = value;
    }
    this.setState(returnState);
  }

  handleSubmit = (event) => {
    return
  }

  handleBankAccountModal = (event) => {
    toggleBodyScroll(!this.state.isShowBankAccountModal)
    this.setState({isShowBankAccountModal: !this.state.isShowBankAccountModal})
  }

  getPosBankAccountFields = (event) => {
    const clinicId = event.target.dataset.clinicId;
    if(clinicId >= 0){
      this.setState({showLoader:true,addBankClinicId:clinicId})
      this.props.getPosBankAccountFields(clinicId);
    }
  }

  addPosBankAccount = (event) => {
    let error = false;

    if (typeof this.state.account_holder_name === undefined || this.state.account_holder_name === null || this.state.account_holder_name.trim() === '') {
      this.setState({accountHolderNameCalss:'setting-input-box field_error'})
      error = true;
    } else if(this.state.account_holder_name) {
      this.setState({accountHolderNameCalss:'setting-input-box'})
    }

    if (typeof this.state.account_input_value === undefined || this.state.account_input_value === null || this.state.account_input_value.trim() === '') {
      this.setState({accountInputLableCalss:'setting-input-box field_error'})
      error = true;
    } else if(this.state.account_input_value) {
      this.setState({accountInputLableCalss:'setting-input-box'})
    }

    if(this.state.show_routing_number){
      if (typeof this.state.routing_number === undefined || this.state.routing_number === null || this.state.routing_number.trim() === '' ) {
        this.setState({routingNumberCalss:'setting-input-box field_error'})
        error = true;
      } else if(this.state.routing_number) {
        this.setState({routingNumberCalss:'setting-input-box'})
      }
    }
    if(error){
      return
    }

    let formData = {
      account_number :  this.state.account_input_value,
      clinic_id :  this.state.addBankClinicId,
      account_holder_name : this.state.account_holder_name,
      country : (this.state.bankDefaultCountry !== undefined && this.state.bankDefaultCountry.value !== undefined) ? this.state.bankDefaultCountry.value : '',
      currency : this.state.bankDefaultCurrency,
    }
    if(this.state.show_routing_number){
      formData.routing_number = this.state.routing_number
    }

    if(this.state.addBankClinicId >=  0){
      this.setState({showLoaderAddBank:true})
      this.props.addPosBankAccount(formData)
    }
  }

  setPosDefaultBnkAccount = () => {
    if(this.state.defaultBankIdentifier !== ''){
        this.setState({showLoader:true})
        this.props.setPosDefaultBnkAccount({bank_identifier:this.state.defaultBankIdentifier})
    }
    this.handleAlertModal();
  }

  handleAlertModal = (defaultBankIdentifier) => {
    toggleBodyScroll(!this.state.isShowAlertModal)
    defaultBankIdentifier = (defaultBankIdentifier !== '') ? defaultBankIdentifier : ''
    this.setState({isShowAlertModal: !this.state.isShowAlertModal,defaultBankIdentifier:defaultBankIdentifier})
  }

  handlePayoutScheduleModal = () => {
    toggleBodyScroll(!this.state.isShowPayoutScheduleModal)
    this.setState({isShowPayoutScheduleModal: !this.state.isShowPayoutScheduleModal})
  }

  setPosPayoutScheduleData = (clinicId,data) => {
    this.setState({
        payout_type: (data.payout_interval == 'manual') ? 'manual' : 'automatic',
        payout_interval : (data.payout_interval == 'manual') ? 'daily' : data.payout_interval,
        payout_anchor : (data.payout_anchor) ?  data.payout_anchor : '',
        payoutScheduleClinicId:clinicId,
        isShowPayoutScheduleModal:true
    })
    toggleBodyScroll(true)
  }

  updatePosPayoutScheduleData = (event) => {
    let error = false;
    if (typeof this.state.payout_type === undefined || this.state.payout_type === null || this.state.payout_type === '') {
      this.setState({payoutTypeCalss:'setting-select-box field_error'})
      error = true;
    } else if(this.state.payout_type) {
      this.setState({payoutTypeCalss:'setting-select-box'})
    }

    if(this.state.payout_type === 'automatic'){
      if (typeof this.state.payout_interval === undefined || this.state.payout_interval === null || this.state.payout_interval === '') {
        this.setState({payoutIntervalCalss:'setting-select-box field_error'})
        error = true;
      } else if(this.state.payout_interval) {
        this.setState({payoutIntervalCalss:'setting-select-box'})
      }

      if(this.state.payout_interval === 'weekly' || this.state.payout_interval === 'monthly') {
        if (typeof this.state.payout_anchor === undefined || this.state.payout_anchor === null || this.state.payout_anchor === '') {
          this.setState({payoutAnchorCalss:'setting-select-box field_error'})
          error = true;
        } else if(this.state.payout_anchor) {
          this.setState({payoutAnchorCalss:'setting-select-box'})
        }
      }
    }

    if(error){
      return
    }

    let formData = {
      payout_type :  this.state.payout_type,
      payout_interval : this.state.payout_interval,
      clinic_id :  this.state.payoutScheduleClinicId,
    }
    if(this.state.payout_anchor){
      formData.payout_anchor = this.state.payout_anchor
    }
    if(this.state.payoutScheduleClinicId >=  0){
      this.setState({showLoaderPayoutSchedule:true})
      this.props.updatePosPayoutScheduleData(formData)
    }
  }

  renderObjectOption = (list,key) => {
    let htmlList = [<option value="">{(key==='weekly') ? this.state.settingsLang.pos_select_day_of_week : this.state.settingsLang.pos_select_a_day}</option>];

      Object.keys(list).forEach((idx) => {
        htmlList.push(<option key={key+'-'+idx} value={idx} >{list[idx]}</option>);
      })
    return htmlList;
  }

  renderPayoutSchedule = (payoutData) => {
    let scheduleType = ''
    let scheduleInterval = ''
    if(payoutData.payout_interval){
      if(payoutData.payout_interval === 'manual') {
        scheduleInterval = this.state.settingsLang.pos_you_will_no_longer_be_able_to_see_transactions
        scheduleType= this.state.settingsLang.pos_payout_manual
      } else {
        scheduleType= this.state.settingsLang.pos_payout_automatic
        if(payoutData.payout_interval == 'daily') {
          scheduleInterval = `${capitalizeFirstLetter(payoutData.payout_interval)} ${payoutData.payout_daily_delay_days} ${this.state.settingsLang.pos_day_rolling_basis}`;
        } else if(payoutData.payout_interval == 'weekly') {
          scheduleInterval = `${capitalizeFirstLetter(payoutData.payout_interval)} ${this.state.settingsLang.pos_every} ${capitalizeFirstLetter(payoutData.payout_anchor)}`;
        } else if(payoutData.payout_interval == 'monthly') {
          scheduleInterval = `${capitalizeFirstLetter(payoutData.payout_interval)} ${this.state.settingsLang.pos_on_the_day} ${payoutData.payout_anchor}`;
        }
      }
    } else {
      scheduleInterval = this.state.settingsLang.Npos_no_schedule_found
    }
    return (
      <div className="bank-account">
        <strong>{scheduleType}</strong> - {scheduleInterval}
      </div>
    )
  }

  render() {

    return (
      <div className="main protected">
        <Header />
        <div id="content" className="content-pos-payment-settings">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              {((this.state.connectionMode === 'global' && this.state.bankConfigGlobal !== undefined && (typeof this.state.bankConfigGlobal.account_bank_config === undefined || (typeof this.state.bankConfigGlobal.account_bank_config !== undefined && this.state.bankConfigGlobal.account_bank_config.length === 0))) || (this.state.connectionMode === 'clinic' && this.state.hasClinicBankAccount === false)) &&
                <div className="verification-field-warning">
                  <div className="alert">
                    <i className="fas fa-exclamation-triangle field-warning-color" />&nbsp;&nbsp;&nbsp;&nbsp;Please add a {this.state.defaultCurrency.toUpperCase()} {this.state.settingsLang.pos_denominated_bank_account_to_pay_out_your} {this.state.defaultCurrency.toUpperCase()} {this.state.settingsLang.pos_balance}.
                  </div>
                </div>
              }
              <div className="setting-container">
                <div className="setting-title m-b-40">{this.state.settingsLang.pos_bank_accounts}</div>
                <div id="per-clinic-settings">
                  {(this.state.connectionMode == 'clinic' && this.state.bankConfigClinic.length > 0) &&
                    this.state.bankConfigClinic.map((clinicObj,clinicIdx) => {
                      if(clinicObj.stripe_user_id !== undefined && clinicObj.stripe_user_id !== null && clinicObj.stripe_user_id !== ''){
                        return (
                          <div key={'clinicList-'+clinicIdx} className="clinic-account">
                            <div className="row">
                              <div className="col-xs-12 m-b-30"><b>{clinicObj.clinic_name}</b></div>
                            </div>
                            {(this.state.hasClinicBankAccount && clinicObj.account_bank_config !== undefined &&  clinicObj.account_bank_config.length > 0) ?
                            <div className="bank-account-list">
                              {clinicObj.account_bank_config.map((bankObj,bankIdx) => {
                                return (
                                  <div key={'clinicList-'+clinicIdx+'-'+bankIdx} className="row m-b-20">
                                    <div className="col-md-8 col-xs-12">
                                      <div className="bank-account">
                                        <img src="/images/bank-logo.png" className="bank-logo" />{bankObj.bank_name}&nbsp;****&nbsp;{bankObj.last4}&nbsp;/&nbsp;{bankObj.routing_number}&nbsp;
                                        <div className="payment-transit transit-usd bankusd">{this.state.defaultCurrency}</div>
                                      </div>
                                    </div>
                                    { (bankObj.is_default != 1) &&
                                      <div className="col-md-4 col-xs-12">
                                        <a href="javascript:void(0)" onClick={this.handleAlertModal.bind(this,bankObj.bank_identifier) } data-account-type="clinic" data-clinic-id={clinicObj.id} className="new-white-btn edit-account set-default-bank-acct">{this.state.settingsLang.pos_set_as_default}</a>
                                      </div>
                                    }
                                  </div>
                                )
                              })}
                              <div className="row m-b-20">
                                <div className="col-xs-12">
                                  <a href="javascript:void(0)" onClick={this.getPosBankAccountFields} data-account-type="clinic" data-clinic-id={clinicObj.id}  className="new-blue-btn add-stripe-bank-acct no-margin" >{this.state.settingsLang.pos_add_new_bank_account}</a>
                                </div>
                              </div>
                            </div>
                            :
                            <div className="row m-b-20">
                              <div className="col-md-8 col-xs-12">
                                <div className="bank-account">{this.state.settingsLang.pos_no_bank_account_found}</div>
                              </div>
                              <div className="col-md-4 col-xs-12">
                                <a href="javascript:void(0)" onClick={this.getPosBankAccountFields} data-account-type="clinic" data-clinic-id={clinicObj.id} className="new-blue-btn edit-account add-stripe-bank-acct m-l-0">{this.state.settingsLang.pos_add_new_bank_account}</a>
                              </div>
                            </div>
                            }
                          </div>
                        )
                      }
                    })
                  }

                  {(this.state.connectionMode == 'global' && this.state.bankConfigGlobal.stripe_user_id !== undefined && this.state.bankConfigGlobal.stripe_user_id !== null && this.state.bankConfigGlobal.stripe_user_id !== '') &&
                        <div  className="clinic-account">
                          {(this.state.bankConfigGlobal.account_bank_config !== undefined &&  this.state.bankConfigGlobal.account_bank_config.length > 0) ?
                          <div className="bank-account-list">
                            {this.state.bankConfigGlobal.account_bank_config.map((bankObj,bankIdx) => {
                              return (
                                <div key={'clinicList-'+bankIdx} className="row m-b-20">
                                  <div className="col-md-8 col-xs-12">
                                    <div className="bank-account">
                                      <img src="/images/bank-logo.png" className="bank-logo" />{bankObj.bank_name}&nbsp;****&nbsp;{bankObj.last4}&nbsp;/&nbsp;{bankObj.routing_number}&nbsp;
                                      <div className="payment-transit transit-usd bankusd">{this.state.defaultCurrency}</div>
                                    </div>
                                  </div>
                                  { (bankObj.is_default != 1) &&
                                    <div className="col-md-4 col-xs-12">
                                      <a href="javascript:void(0)" onClick={this.setPosDefaultBnkAccount.bind(this,bankObj.bank_identifier) } data-account-type="clinic" data-clinic-id={0} className="new-white-btn edit-account set-default-bank-acct">{this.state.settingsLang.pos_set_as_default}</a>
                                    </div>
                                  }
                                </div>
                              )
                            })}
                            <div className="row m-b-20">
                              <div className="col-xs-12">
                                <a href="javascript:void(0)" onClick={this.getPosBankAccountFields} data-account-type="clinic" data-clinic-id={0}  className="new-blue-btn add-stripe-bank-acct no-margin" >{this.state.settingsLang.pos_add_new_bank_account}</a>
                              </div>
                            </div>
                          </div>
                          :
                          <div className="row m-b-20">
                            <div className="col-md-8 col-xs-12">
                              <div className="bank-account">{this.state.settingsLang.pos_no_bank_account_found}</div>
                            </div>
                            <div className="col-md-4 col-xs-12">
                              <a href="javascript:void(0)" onClick={this.getPosBankAccountFields} data-account-type="clinic" data-clinic-id={0} className="new-blue-btn edit-account add-stripe-bank-acct m-l-0">{this.state.settingsLang.pos_add_new_bank_account}</a>
                            </div>
                          </div>
                          }
                        </div>
                  }
                </div>


              </div>
              <div className="setting-container border-top">
                <div className="setting-title m-b-20">{this.state.settingsLang.pos_payout_schedule}</div>
                <p className="p-text m-b-40">{this.state.settingsLang.pos_set_a_schedule_to_automatically_receive_payouts}</p>
                <div id="per-clinic-settings-payout">
                  {(this.state.hasClinicBankAccount && this.state.connectionMode == 'clinic' && this.state.bankConfigClinic.length > 0) &&
                    this.state.bankConfigClinic.map((clinicObj,clinicIdx) => {
                      if(clinicObj.stripe_user_id !== undefined && clinicObj.stripe_user_id !== null && clinicObj.stripe_user_id !== '' && (clinicObj.account_bank_config !== undefined &&  clinicObj.account_bank_config.length > 0)){
                        return (
                          <div key={'bankConfigClinic-payoutSchedule-'+clinicIdx} className="row m-b-20">
                            <div className="col-md-4 col-xs-12"><b>{clinicObj.clinic_name}</b></div>
                            <div className="col-md-6 col-xs-12">
                              {this.renderPayoutSchedule(clinicObj)}
                            </div>
                            <div className="col-md-2 col-xs-12">
                              <a href="javascript:void(0)" className="new-white-btn edit-account" onClick={this.setPosPayoutScheduleData.bind(this,clinicObj.id,clinicObj)} data-account-type="clinic" data-clinic-id={clinicObj.id} >{this.state.globalLang.label_edit}</a>
                            </div>
                          </div>
                        )
                      }
                    })
                  }
                  {(this.state.connectionMode == 'global' && this.state.bankConfigGlobal.stripe_user_id !== undefined && this.state.bankConfigGlobal.stripe_user_id !== null && this.state.bankConfigGlobal.stripe_user_id !== '') &&

                  <div key={'bankConfigClinic-payoutSchedule-'+0} className="row m-b-20">
                    <div className="col-md-10 col-xs-12">
                      {this.renderPayoutSchedule(this.state.bankConfigGlobal)}
                    </div>
                    <div className="col-md-2 col-xs-12">
                      <a href="javascript:void(0)" className="new-white-btn edit-account" onClick={this.setPosPayoutScheduleData.bind(this,0,this.state.bankConfigGlobal)} data-account-type="clinic" data-clinic-id={0} >{this.state.globalLang.label_edit}</a>
                    </div>
                  </div>
                }
                </div>
              </div>
              <Loader showLoader={this.state.showLoader} />
            </div>
          </div>
          {/*  Add Bank Details - START */}
          <div className={this.state.isShowBankAccountModal ? "modalOverlay" : 'no-display' }>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.settingsLang.pos_add_bank_details}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handleBankAccountModal} >×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.pos_person_business_name} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <input name="account_holder_name" value={this.state.account_holder_name} className={this.state.accountHolderNameCalss} onChange={this.handleInputChange} placeholder="Person/Business name" type="text" />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.account_input_label} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <input name={this.state.account_input_label}  value={this.state.account_input_value} className={this.state.accountInputLableCalss} onChange={this.handleInputChange} placeholder={this.state.account_input_place_holder} type="text" />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.globalLang.label_country} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <input  name="country" value={(this.state.bankDefaultCountry !== undefined && this.state.bankDefaultCountry.label !== undefined) ? this.state.bankDefaultCountry.label : ''} className="setting-input-box" onChange={this.handleInputChange} readOnly="readonly" type="text" />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.setting_currency} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <input name="currency" value={this.state.bankDefaultCurrency.toUpperCase()} onChange={this.handleInputChange} className="setting-input-box"  readOnly="readonly" type="text" />
                        </div>
                      </div>
                    </div>
                    {(this.state.show_routing_number) &&
                      <div className="col-sm-6">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.settingsLang.pos_routing_sort_number} <span className="setting-require">*</span></div>
                          <div className="setting-input-outer">
                            <input name="routing_number" value={this.state.routing_number} className={this.state.routingNumberCalss} onChange={this.handleInputChange}   placeholder={110000000} type="text" />
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.addPosBankAccount}>{this.state.globalLang.label_save}</a>
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handleBankAccountModal}>{this.state.globalLang.label_cancel}</a>
              </div>
              <Loader showLoader={this.state.showLoaderAddBank} />
            </div>
          </div>
          {/*  Add Bank Details - END */}
          {/*  Set Payout Schedule - START */}
          <div className={this.state.isShowPayoutScheduleModal ? "modalOverlay" : 'no-display' }>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.settingsLang.pos_set_payout_schedule}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handlePayoutScheduleModal} >×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.pos_payout_type} </div>
                        <div className="setting-input-outer">
                          <select name="payout_type" value={this.state.payout_type} onChange={this.handleInputChange} className={this.state.payoutTypeCalss}>
                            <option value="manual">{this.state.settingsLang.pos_payout_manual}</option>
                            <option value="automatic">{this.state.settingsLang.pos_payout_automatic}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    { (this.state.payout_type === 'automatic') ?
                      <div className="payout-automatic-options ">
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.pos_payout_type} </div>
                            <div className="setting-input-outer">
                              <select name="payout_interval" value={this.state.payout_interval} onChange={this.handleInputChange} className={this.state.payoutIntervalCalss}>
                                <option value="daily">{this.state.settingsLang.pos_days}</option>
                                <option value="weekly">{this.state.settingsLang.pos_every_week}</option>
                                <option value="monthly">{this.state.settingsLang.pos_every_month}</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        { (this.state.payout_interval === 'weekly' || this.state.payout_interval === 'monthly') &&
                          <div className="col-sm-6 show-hide-payout-on">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.settingsLang.pos_payout_on} <span className="setting-require">*</span></div>
                              <div className="setting-input-outer">
                                <select name="payout_anchor" value={this.state.payout_anchor} onChange={this.handleInputChange}  className={this.state.payoutAnchorCalss}>
                                  {(this.state.payout_interval === 'weekly') ?
                                    this.renderObjectOption(this.state.payoutWeekList,'weekly')
                                    :
                                    this.renderObjectOption(this.state.payoutMonthList,'monthly')
                                  }
                                </select>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                      :
                      <div className="col-sm-12 payout-manual-options">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.settingsLang.pos_you_will_no_longer_be_able_to_see_transactions}</div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
              <div className="footer-static">
              <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.updatePosPayoutScheduleData}>{this.state.globalLang.label_save}</a>
              <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handlePayoutScheduleModal}>{this.state.globalLang.label_cancel}</a>
              </div>
              <Loader showLoader={this.state.showLoaderPayoutSchedule} />
            </div>
          </div>
          {/*  Set Payout Schedule - END */}
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
                        <div className="new-field-label alert-modal-content">You are going to set this bank account as default!</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handleAlertModal}>{this.state.globalLang.label_cancel}</a>
                <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.setPosDefaultBnkAccount} >{this.state.globalLang.label_yes}</a>
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
  if (state.SettingReducer.action === "GET_POS_PAYMENT_SETTING_DATA") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.posPaymentData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "GET_POS_BANK_ACCOUNT_FIELDS") {
    toast.dismiss();
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false
    } else {
      returnState.posBankAccountData = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "ADD_POS_BANK_ACCOUNT") {
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
     returnState.posPaymentData = state.SettingReducer.data.data
   }
  } else if (state.SettingReducer.action === "SET_POS_DEFAULT_BANK_ACCOUNT") {
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
     returnState.posPaymentData = state.SettingReducer.data.data
   }
  }else if (state.SettingReducer.action === "UPDATE_POS_PAYOUT_SCHEDULE_DATA") {
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
     returnState.posPaymentData = state.SettingReducer.data.data
   }
  } else if (state.SettingReducer.action === "EMPTY_DATA") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
     getPosPaymentSettingData:getPosPaymentSettingData,
     getPosBankAccountFields:getPosBankAccountFields,
     addPosBankAccount:addPosBankAccount,
     setPosDefaultBnkAccount:setPosDefaultBnkAccount,
     getPosPayoutScheduleData:getPosPayoutScheduleData,
     updatePosPayoutScheduleData:updatePosPayoutScheduleData,
     exportEmptyData:exportEmptyData
   }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosPaymentSettings);
