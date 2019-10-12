import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Sidebar from '../../../Containers/Settings/sidebar.js';
import { getMembershipWallet, updateMembershipWallet } from '../../../Actions/Settings/settingsActions.js';
import { isPositiveNumber,isInteger, numberFormat, checkIfPermissionAllowed } from '../../../Utils/services.js'

class MembershipWallet extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.state = {
      recurly_program_name: '',
      add_fees_to_client_wallet: false,
      mothly_membership_fees: '',
      one_time_membership_setup: '',
      thankyou_message: '',
      wallet_item_expiry: '',
      wallet_dollar_expiry: '',
      wallet_send_expiry_email: true,
      wallet_send_expiry_reminder: true,
      wallet_reminder_days_before: '1',
      showLoader: false,
      is_membership_enable: true,
      is_membership_enable_yes: 'row',
      is_membership_enable_no: 'row no-display',
      reminderDisplay: 'setting-field-outer',
      reminderNone: 'setting-field-outer no-display',
      recurly_program_nameErrorClass: 'setting-input-box',
      thankyou_messageErrorClass: 'setting-textarea-box',
      mothly_membership_feesErrorClass: 'setting-input-box',
      one_time_membership_setupErrorClass: 'setting-input-box',
      wallet_item_expiryErrorClass: 'setting-input-box',
      wallet_reminder_days_beforeErrorClass: 'input-fill-box',

      mothly_membership_type: 'paid',

      showLoader: false
    }
  }
  componentDidMount() {
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      Patient_Membership_Program: languageData.settings['Patient_Membership_Program'],
      Patient_Membership_Enabled: languageData.settings['Patient_Membership_Enabled'],
      Patient_Membership_Disabled: languageData.settings['Patient_Membership_Disabled'],
      patient_do_you_want_to_add_monthly_membership_fees_in_clients_wallet: languageData.settings['patient_do_you_want_to_add_monthly_membership_fees_in_clients_wallet'],
      Patient_recurly: languageData.settings['Patient_recurly'],
      Patient_com: languageData.settings['Patient_com'],
      Patient_PROGRAM_NAME: languageData.settings['Patient_PROGRAM_NAME'],
      Patient_RECURLY_API_KEY: languageData.settings['Patient_RECURLY_API_KEY'],
      Patient_MONTHLY_MEMBERSHIP_FEES: languageData.settings['Patient_MONTHLY_MEMBERSHIP_FEES'],
      Patient_ONE_TIME_MEMBERSHIP_SETUP_FEES: languageData.settings['Patient_ONE_TIME_MEMBERSHIP_SETUP_FEES'],
      Patient_THANK_YOU_MESSAGE: languageData.settings['Patient_THANK_YOU_MESSAGE'],
      Patient_Wallet_Settings: languageData.settings['Patient_Wallet_Settings'],
      Patient_Items_in_client_wallet_will_expire_in: languageData.settings['Patient_Items_in_client_wallet_will_expire_in'],
      Patient_DAYS: languageData.settings['Patient_DAYS'],
      Patient_Product_Expires_Message: languageData.settings['Patient_Product_Expires_Message'],
      Patient_Product_Expire_Reminder_Message: languageData.settings['Patient_Product_Expire_Reminder_Message'],
      Patient_Expiration_Reminder_Email: languageData.settings['Patient_Expiration_Reminder_Email'],
      saveBtn: languageData.global['saveBtn'],
      Configure_URL_http: languageData.settings['Configure_URL_http'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      settings_send_reminder_email: languageData.settings['settings_send_reminder_email'],
      settings_days_before_wallet_expiration: languageData.settings['settings_days_before_wallet_expiration'],
      settings_dollar_credits: languageData.settings['settings_dollar_credits'],
    })
    this.setState({ 'showLoader': true });
    this.props.getMembershipWallet();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.showLoader != undefined && props.showLoader == false) {
      return { showLoader: false };
    }
    if (props.membershipList !== undefined && props.membershipList.status === 200 && state.membershipList != props.membershipList.data) {
      let returnState =  {
        add_fees_to_client_wallet: (state.userChanged) ? state.add_fees_to_client_wallet : props.membershipList.data.add_fees_to_client_wallet,
        recurly_program_name: (state.userChanged) ? state.recurly_program_name : props.membershipList.data.recurly_program_name,
        mothly_membership_fees: (state.userChanged) ? state.mothly_membership_fees : (props.membershipList.data.mothly_membership_fees) ? props.membershipList.data.mothly_membership_fees : '0.00',
        one_time_membership_setup: (state.userChanged) ? state.one_time_membership_setup : (props.membershipList.data.one_time_membership_setup) ? props.membershipList.data.one_time_membership_setup : '0.00',
        thankyou_message: (state.userChanged) ? state.thankyou_message : props.membershipList.data.thankyou_message,
        wallet_item_expiry: (state.userChanged) ? state.wallet_item_expiry : props.membershipList.data.wallet_item_expiry,
        wallet_dollar_expiry: (state.userChanged) ? state.wallet_dollar_expiry : props.membershipList.data.wallet_dollar_expiry,
        wallet_send_expiry_email: (state.userChanged) ? state.wallet_send_expiry_email : props.membershipList.data.wallet_send_expiry_email,
        wallet_send_expiry_reminder: (state.userChanged) ? state.wallet_send_expiry_reminder : (props.membershipList.data.wallet_send_expiry_reminder) ? true : false,
        wallet_reminder_days_before: (state.userChanged) ? state.wallet_reminder_days_before : (props.membershipList.data.wallet_reminder_days_before !== null) ? props.membershipList.data.wallet_reminder_days_before : "1",
        is_membership_enable: (state.userChanged) ? state.is_membership_enable : props.membershipList.data.is_membership_enable,
        mothly_membership_type: (state.userChanged) ? state.mothly_membership_type : props.membershipList.data.mothly_membership_type,


        showLoader: false,
        membershipList: props.membershipList.data
      };
      returnState.mothly_membership_fees = numberFormat(returnState.mothly_membership_fees, 'decimal',2)
      returnState.one_time_membership_setup = numberFormat(returnState.one_time_membership_setup, 'decimal',2)

      return returnState;

    } else if (props.showLoader !== undefined && props.showLoader == false) {
      return { showLoader: false }
    }
    return null;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [event.target.name]: value, userChanged: true
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let error = false;
    this.setState({
      recurly_sub_domainError: false,
      recurly_program_nameError: false,
      recurly_api_keyError: false,
      mothly_membership_feesError: false,
      thankyou_messageError: false,
      one_time_membership_setupError: false
    });

    if (this.state.is_membership_enable) {
      if (typeof this.state.recurly_program_name === undefined || this.state.recurly_program_name === null || this.state.recurly_program_name.trim() === '') {
        this.setState({
          recurly_program_nameError: true,
          recurly_program_nameClassError: 'setting-input-box field-error'
        })
        error = true;
      } else if (this.state.recurly_program_name) {
        this.setState({
          recurly_program_nameError: false,
          recurly_program_nameErrorClass: 'setting-input-box'
        })
      }

      if (this.state.is_membership_enable) {
        //
        if (this.state.mothly_membership_type === 'paid'){
          if (typeof this.state.mothly_membership_fees === undefined || this.state.mothly_membership_fees === null || !isPositiveNumber(this.state.mothly_membership_fees,1)) {
            this.setState({
              mothly_membership_feesError: true,
              mothly_membership_feesClassError: 'setting-input-box field-error'
            })
            error = true;
          } else {
            this.setState({
              mothly_membership_feesError: false,
              mothly_membership_feesErrorClass: 'setting-input-box'
            })
          }
        }
      } else {
        this.setState({
          mothly_membership_feesError: false,
          mothly_membership_feesErrorClass: 'setting-input-box'
        })
      }

      if (typeof this.state.one_time_membership_setup === undefined || this.state.one_time_membership_setup === null || this.state.one_time_membership_setup === '' || !isPositiveNumber(this.state.one_time_membership_setup)) {
        this.setState({
          one_time_membership_setupError: true,
          one_time_membership_setupClassError: 'setting-input-box field-error'
        })
        error = true;
      } else if (this.state.one_time_membership_setup) {
        this.setState({
          one_time_membership_setupError: false,
          one_time_membership_setupErrorClass: 'setting-input-box'
        })
      }

      if (typeof this.state.thankyou_message === undefined || this.state.thankyou_message === null || this.state.thankyou_message.trim() === '') {
        this.setState({
          thankyou_messageError: true,
          thankyou_messageClassError: 'setting-textarea-box field-error'
        })
        error = true;
      } else if (this.state.thankyou_message) {
        this.setState({
          thankyou_messageError: false,
          thankyou_messageErrorClass: 'setting-textarea-box'
        })
      }

      if (typeof this.state.wallet_item_expiry === undefined || this.state.wallet_item_expiry === null || this.state.wallet_item_expiry === '' || !isInteger(this.state.wallet_item_expiry,1)) {
        this.setState({
          wallet_item_expiryError: true,
          wallet_item_expiryClassError: 'setting-input-box field-error'
        })
        error = true;
      } else if (this.state.wallet_item_expiry) {
        this.setState({
          wallet_item_expiryError: false,
          wallet_item_expiryErrorClass: 'setting-input-box'
        })
      }
      if (typeof this.state.wallet_dollar_expiry === undefined || this.state.wallet_dollar_expiry === null || this.state.wallet_dollar_expiry === '' || !isInteger(this.state.wallet_dollar_expiry,1)) {
        this.setState({
          wallet_dollar_expiryError: true,
        })
        error = true;
      } else if (this.state.wallet_item_expiry) {
        this.setState({
          wallet_dollar_expiryError: false,
        })
      }
      if (this.state.wallet_reminder_days_before === undefined || this.state.wallet_reminder_days_before === null || this.state.wallet_reminder_days_before === '' || !isInteger(this.state.wallet_reminder_days_before,1)) {
        if (this.state.wallet_send_expiry_reminder || this.state.wallet_send_expiry_reminder === 'true') {
          this.setState({
            wallet_reminder_days_beforeError: true,
            wallet_reminder_days_beforeClassError: 'input-fill-box field-error'
          })
          error = true;
        } else {
          this.setState({
            wallet_reminder_days_beforeError: false,
            wallet_reminder_days_beforeErrorClass: 'setting-input-box'
          })
        }
      } else if (this.state.wallet_reminder_days_before) {
        this.setState({
          wallet_reminder_days_beforeError: false,
          wallet_reminder_days_beforeErrorClass: 'setting-input-box'
        })
      }

      if (error) {
        return;
      }
    }
    let formData = {
      is_membership_enable: (this.state.is_membership_enable) ? 1 : 0,
      wallet_send_expiry_email: (this.state.wallet_send_expiry_email) ? 1 : 0,
      wallet_send_expiry_reminder: (this.state.wallet_send_expiry_reminder) ? 1 : 0,
      wallet_item_expiry: this.state.wallet_item_expiry,
      wallet_dollar_expiry: this.state.wallet_dollar_expiry
    }
    if (this.state.is_membership_enable == 1) {
      formData.recurly_program_name = this.state.recurly_program_name
      formData.mothly_membership_type = this.state.mothly_membership_type
      formData.mothly_membership_fees = this.state.mothly_membership_fees
      formData.one_time_membership_setup = this.state.one_time_membership_setup
      formData.thankyou_message = this.state.thankyou_message
      formData.add_fees_to_client_wallet = (this.state.add_fees_to_client_wallet) ? 1 : 0;
    }
    if (this.state.wallet_send_expiry_reminder == 1) {
      formData.wallet_reminder_days_before = this.state.wallet_reminder_days_before;
    }
    this.setState({ showLoader: true })
    this.props.updateMembershipWallet(formData);

  }

  /*
  if (checkIfPermissionAllowed(sideBarPermissions, 'wallet-settings')){

  }

  */

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <form id="membership_program_form" action=" " method="post" onSubmit={this.handleSubmit} acceptCharset="utf-8" noValidate="novalidate">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-container p-l-40 p-r-40">
                <div className="row">
                  <div className="col-lg-6 col-xs-12 member-program">
                    <div className="setting-title m-b-40">{this.state.Patient_Membership_Program}
                      <span className="setting-custom-switch pull-right">
                        <span id="membership_lable">{(this.state.is_membership_enable) ? this.state.Patient_Membership_Enabled : this.state.Patient_Membership_Disabled}</span>
                        <label className="setting-switch pull-right">
                          <input type="checkbox" id="is_membership_enable" className="setting-custom-switch-input" name="is_membership_enable" checked={(this.state.is_membership_enable) ? 'checked' : false} onChange={this.handleInputChange} />
                          <span className="setting-slider" />
                        </label><br /><br />
                      </span>
                      <input id="mHidden" type="hidden" defaultValue={0} name="is_membership_enable" />
                    </div>
                    <div className={(this.state.is_membership_enable == true) ? this.state.is_membership_enable_yes : this.state.is_membership_enable_no} id="memeberview">
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.Patient_PROGRAM_NAME}<span className="setting-require">*</span></div>
                          <div className="setting-input-outer"><input type="text" id="recurly_program_name" className={this.state.recurly_program_nameError === true ? this.state.recurly_program_nameClassError : this.state.recurly_program_nameErrorClass} autoComplete="off" name="recurly_program_name" value={this.state.recurly_program_name} onChange={this.handleInputChange} /></div>
                          <span style={{ color: 'red' }}>{this.state.recurly_program_nameError === true ? '' : ''}</span>
                        </div>
                      </div>
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">Membership Type</div>
                          <div className="setting-input-outer">
                            <div className="basic-checkbox-outer">
                              <input id="radiobutton1" className="basic-form-checkbox" name="mothly_membership_type" type="radio" value="paid" onChange={this.handleInputChange} checked={(this.state.mothly_membership_type === 'paid') ? 'checked' : false} />
                              <label className="basic-form-text" htmlFor="radiobutton1">Paid</label>
                            </div>
                            <div className="basic-checkbox-outer">
                              <input id="radiobutton2" className="basic-form-checkbox" name="mothly_membership_type" type="radio" value="free" onChange={this.handleInputChange} checked={(this.state.mothly_membership_type === 'free') ? 'checked' : false} />
                              <label className="basic-form-text" htmlFor="radiobutton1">Free</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      {(this.state.mothly_membership_type === 'paid') &&
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.Patient_MONTHLY_MEMBERSHIP_FEES}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer"><input type="text" id="mothly_membership_fees" className={this.state.mothly_membership_feesError === true ? this.state.mothly_membership_feesClassError : this.state.mothly_membership_feesErrorClass} autoComplete="off" name="mothly_membership_fees" value={this.state.mothly_membership_fees} onChange={this.handleInputChange} /></div>
                          </div>
                          <span style={{ color: 'red' }}>{this.state.mothly_membership_feesError === true ? '' : ''}</span>
                        </div>
                      }
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.Patient_ONE_TIME_MEMBERSHIP_SETUP_FEES}<span className="setting-require">*</span></div>
                          <div className="setting-input-outer"><input type="text" id="one_time_membership_setup" name="one_time_membership_setup" className={this.state.one_time_membership_setupError === true ? this.state.one_time_membership_setupClassError : this.state.one_time_membership_setupErrorClass} autoComplete="off" value={this.state.one_time_membership_setup} onChange={this.handleInputChange} /></div>
                        </div>
                        <span style={{ color: 'red' }}>{this.state.one_time_membership_setupError === true ? '' : ''}</span>
                      </div>
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.Patient_THANK_YOU_MESSAGE}<span className="setting-require">*</span></div>
                          <textarea className={this.state.thankyou_messageError === true ? this.state.thankyou_messageClassError : this.state.thankyou_messageErrorClass} name="thankyou_message" id="thankyou_message" rows="5" value={this.state.thankyou_message} onChange={this.handleInputChange} />
                        </div>
                        <span style={{ color: 'red' }}>{this.state.thankyou_messageError === true ? '' : ''}</span>
                      </div>
                      <div className="col-xs-12">
                        <div className="setting-custom-switch wallet-switch no-border">{this.state.patient_do_you_want_to_add_monthly_membership_fees_in_clients_wallet}
                          <label className="setting-switch pull-right">
                            <input type="checkbox" id="add_fees_to_client_wallet" className="setting-custom-switch-input" name="add_fees_to_client_wallet" checked={(this.state.add_fees_to_client_wallet) ? 'checked' : false} onChange={this.handleInputChange} />
                            <span className="setting-slider"></span>
                          </label></div>
                      </div>
                    </div>
                  </div>
                  {(checkIfPermissionAllowed('wallet-settings') === true) &&
                    <div className="col-lg-6 col-xs-12 wallet-setting">
                      <div className="setting-title m-b-50">{this.state.Patient_Wallet_Settings}</div>
                      <div className="row ques-radio-right m-t-20">
                        <div className="col-md-8 col-xs-12 m-t-20 text-setting">
                          {this.state.Patient_Items_in_client_wallet_will_expire_in}<span className="setting-require">*</span>
                        </div>
                        <div className="col-md-4 col-xs-12">
                          <div className="new-field-label">{this.state.Patient_DAYS}</div>
                          <div className="setting-input-outer">
                            <input type="text" className={this.state.wallet_item_expiryError === true ? this.state.wallet_item_expiryClassError : this.state.wallet_item_expiryErrorClass} id="wallet_item_expiry" name="wallet_item_expiry" autoComplete="off" value={this.state.wallet_item_expiry} onChange={this.handleInputChange} />
                          </div>
                        </div>
                        <span style={{ color: 'red' }}>{this.state.wallet_item_expiryError === true ? '' : ''}</span>
                      </div>
                      <div className="row ques-radio-right m-t-20">
                        <div className="col-md-8 col-xs-12 m-t-20 text-setting">
                          {this.state.settings_dollar_credits}<span className="setting-require">*</span>
                        </div>
                        <div className="col-md-4 col-xs-12">
                          <div className="new-field-label">{this.state.Patient_DAYS}</div>
                          <div className="setting-input-outer">
                            <input type="text" className={this.state.wallet_dollar_expiryError === true ? "setting-input-box field-error" : "setting-input-box"} id="wallet_dollar_expiry" name="wallet_dollar_expiry" autoComplete="off" value={this.state.wallet_dollar_expiry} onChange={this.handleInputChange} />
                          </div>
                        </div>
                        <span style={{ color: 'red' }}>{this.state.wallet_item_expiryError === true ? '' : ''}</span>
                      </div>
                      <div className="setting-custom-switch wallet-switch">
                        {this.state.Patient_Product_Expires_Message}
                        <label className="setting-switch pull-right">
                          <input type="checkbox" id="wallet_send_expiry_email" className="setting-custom-switch-input" name="wallet_send_expiry_email" checked={(this.state.wallet_send_expiry_email) ? 'checked' : false} onChange={this.handleInputChange} />
                          <span className="setting-slider" />
                        </label>
                      </div>
                      <div className="setting-custom-switch wallet-switch">
                        {this.state.Patient_Product_Expire_Reminder_Message}
                        <label className="setting-switch pull-right">
                          <input type="checkbox" id="wallet_send_expiry_reminder" className="setting-custom-switch-input" name="wallet_send_expiry_reminder" checked={(this.state.wallet_send_expiry_reminder) ? 'checked' : false} onChange={this.handleInputChange} />
                          <span className="setting-slider" />
                        </label>
                      </div>
                      <div className={(this.state.wallet_send_expiry_reminder == true) ? this.state.reminderDisplay : this.state.reminderNone} id="days_before">
                        <div className="new-field-label">{this.state.settings_send_reminder_email}
                          <input id="wallet_reminder_days_before" type="text" className={this.state.wallet_reminder_days_beforeError === true ? this.state.wallet_reminder_days_beforeClassError : this.state.wallet_reminder_days_beforeErrorClass} autoComplete="off" name="wallet_reminder_days_before" value={this.state.wallet_reminder_days_before} onChange={this.handleInputChange} />{this.state.settings_days_before_wallet_expiration}<span className="setting-require">*</span></div>
                      </div>
                      <span style={{ color: 'red' }}>{this.state.wallet_reminder_days_beforeError === true ? '' : ''}</span>
                    </div>
                  }

                </div>
              </div>
              <div className="footer-static">
                <button className="new-blue-btn pull-right" id="memberform" onClick={this.handleSubmit}>{this.state.saveBtn}</button>
              </div>
              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SettingReducer.action === "GET_MEMBERSHIP_WALLET_LIST") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true
    }
    else {
      returnState.membershipList = state.SettingReducer.data;
    }
  }
  else if (state.SettingReducer.action === "UPDATE_MEMBERSHIP_WALLET_LIST") {
    if (state.SettingReducer.data.status != 200) {
      returnState.showLoader = false
    }
    else {
      returnState.membershipList = state.SettingReducer.data;
      toast.success("Membership Wallet data updated sucessfully");
    }
  }
  if (state.SettingReducer.action == "third_party_error") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    }
    else {
      returnState.membershipListUpdate = state.SettingReducer.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getMembershipWallet: getMembershipWallet,
    updateMembershipWallet: updateMembershipWallet
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MembershipWallet);
