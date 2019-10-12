import React, { Component } from 'react';
import Header from '../../../Containers/Protected/Header.js';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from "../../../Containers/Settings/sidebar.js";
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown,faAngleRight} from '@fortawesome/free-solid-svg-icons';
import config from '../../../config';
import axios from 'axios';
import IntlTelInput from 'react-intl-tel-input';
import { get2FA, disable2FA, getGoogle2FA, verifyGoogleToken, sendOTP, verifyMobileOTP } from '../../../Actions/Settings/settingsActions.js';


class TwoFactorAuthentication extends Component{
  constructor(props) {
    super(props);
    this.state = { pictures: [],
    sms_class:'row factor-step setting-container',
    google_class:'setting-container factor-step',
    enabledDisabledText:'',
    isDisabled:'Disabled',
    value:1,
    two_factor_auth_status : 0,
    verification_type : false,
    googleImage : '',
    addNewDevice : false,
    addNewPhone : false,
    contactClass: 'setting-input-box',
    otp_sent: false,
    circleText: false,
    phone_number_display : '',
    authTokenClass : 'setting-input-box w-150',
    otpClass : 'setting-input-box m-b-20',
    google_auth_code_display: '',
    showLoader : false,
    user2FaData: {},
    defaultCountry: localStorage.getItem('cCode'),
  };
  }

  componentDidMount() {
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      twoFA_enabled: languageData.settings['twoFA_enabled'],
      twoFA_disabled: languageData.settings['twoFA_disabled'],
      twoFA_header: languageData.settings['twoFA_header'],
      twoFA_subheader: languageData.settings['twoFA_subheader'],
      twoFA_google_auth	: languageData.settings['twoFA_google_auth'],
      twoFA_googleAuth_key: languageData.settings['twoFA_googleAuth_key'],
      twoFA_device: languageData.settings['twoFA_device'],
      twoFA_google_auth:languageData.settings['twoFA_google_auth'],
      twoFA_sms_verify:languageData.settings['twoFA_sms_verify'],
      twoFA_sms_phoneNo:languageData.settings['twoFA_sms_phoneNo'],
      twoFA_step1:languageData.settings['twoFA_step1'],
      twoFa_Scan_bar:languageData.settings['twoFa_Scan_bar'],
      twoFA_download_link:languageData.settings['twoFA_download_link'],
      twoFA_step2:languageData.settings['twoFA_step2'],
      twoFA_Enter_key:languageData.settings['twoFA_Enter_key'],
      twoFA_otp:languageData.settings['twoFA_otp'],
      twoFA_sms_no:languageData.settings['twoFA_sms_no'],
      showLoader : true,
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      Two_Factor_Authentication_Change_Add_New_Device:  languageData.settings['Two_Factor_Authentication_Change_Add_New_Device'],
      twoFA_sms_phoneNo:  languageData.settings['twoFA_sms_phoneNo'],
      Two_Factor_Authentication_Change:  languageData.settings['Two_Factor_Authentication_Change'],
      Two_Factor_Authentication_Click_on_reload_button:  languageData.settings['Two_Factor_Authentication_Click_on_reload_button'],
      Two_Factor_Authentication_Send_OTP: languageData.settings['Two_Factor_Authentication_Send_OTP'],
      Two_Factor_Authentication_OTP_sent_successfully:  languageData.settings['Two_Factor_Authentication_OTP_sent_successfully'],
      Two_Factor_Authentication_Enter_OTP_to_verify:  languageData.settings['Two_Factor_Authentication_Enter_OTP_to_verify'],
      Two_Factor_Authentication_Verify:  languageData.settings['Two_Factor_Authentication_Verify'],

   })
   this.showLoaderFunc();
   this.props.get2FA({});

}

showLoaderFunc = ()  => {
  this.setState({showLoader: true});
  localStorage.setItem("showLoader", false);
}

handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    let returnState = {}
    if(target.name == 'two_factor_auth_status') {
      if(!value) {
        returnState.addNewPhone = false;
        returnState.addNewDevice = false;
        returnState.verification_type = '';
        returnState.two_factor_auth_status = 0;
        //returnState.showLoader = true;
        this.showLoaderFunc();
        this.props.disable2FA({"two_factor_auth_status":0});
      }/* else {
        this.props.get2FA({});
      }*/
    }

    if(target.name == 'verification_type') {
      if(value == 'google' && this.state.google_auth_code_display == '' ) {
        returnState.addNewDevice = true;
        returnState.addNewPhone = false;
        //returnState.showLoader = true;
        this.showLoaderFunc();
        this.props.getGoogle2FA({});
      } else {
        returnState.addNewPhone = true;
        returnState.addNewDevice = false;
      }
    }
    returnState[event.target.name] = value;
    returnState.dataChanged = true;
    this.setState(returnState);
 }

addNewDevice = () => {
  this.setState({addNewDevice : true, addNewPhone: false, auth_token: ''});
  this.showLoaderFunc();
  this.props.getGoogle2FA({});
}

addNewPhone = () => {
  this.setState({addNewPhone : true, addNewDevice: false});
  //this.props.getGoogle2FA({});
}

phoneNumberChanged = (t, x, y, n) => {
    if(t) {
      this.setState({phone_number: n, contactClass : 'setting-input-box', contactError: false, userChanged: true });
    } else {
      this.setState({contactClass:  'setting-input-box field_error', contactError: true, phone_number : n});
    }
}

static getDerivedStateFromProps(props, state) {

     if ( props.user2FaData !== undefined && props.user2FaData.status === 200 && props.user2FaData.data != state.user2FaData ) {
      if(localStorage.getItem("showLoader") == "false") {
         return {
           user2FaData       : props.user2FaData.data,
           two_factor_auth_status : (props.user2FaData.data) ? ((props.user2FaData.data.two_factor_auth_status) ? true : false) : false,
           verification_type : (props.user2FaData.data && props.user2FaData.data.two_factor_auth_status) ? props.user2FaData.data.verification_type : false,
           google_auth_code : (props.user2FaData.data && props.user2FaData.data.verification_type == 'google' && props.user2FaData.data.two_factor_auth_status) ? props.user2FaData.data.google_auth_code : '',
           google_auth_code_display : (props.user2FaData.data && props.user2FaData.data.verification_type == 'google' && props.user2FaData.data.two_factor_auth_status) ? props.user2FaData.data.google_auth_code : '',
           otp_sent: false,
           phone_number_display : (props.user2FaData.data && props.user2FaData.data.verification_type == 'sms' && props.user2FaData.data.two_factor_auth_status) ? props.user2FaData.data.phone_number : '',
           phone_number : (props.user2FaData.data && props.user2FaData.data.verification_type == 'sms' && props.user2FaData.data.two_factor_auth_status) ? props.user2FaData.data.phone_number : '',
           addNewPhone : (props.user2FaData.data && props.user2FaData.data.phone_number) ? false : true,
           addNewDevice : (props.user2FaData.data && props.user2FaData.data.google_auth_code) ? false : true,
           showLoader : false
         }
       }
     }

     if ( props.google2FaData !== undefined && props.google2FaData.status === 200 && props.google2FaData.data != state.google2FaData ) {
      if(localStorage.getItem("showLoader") == "false") {
         return {
           google2FaData       : props.google2FaData.data,
           qr_code_url : props.google2FaData.data.qr_code_url,
           google_auth_code : props.google2FaData.data.google_auth_code,
           otp_sent: false,
           showLoader : false
         }
       }
     }

     if ( props.otp_sent !== undefined && props.otp_sent) {
      if(localStorage.getItem("showLoader") == "false") {
         return {
           otp_sent       : props.otp_sent,
           showLoader : false
         }
       }
     }

     if ( props.showLoader !== undefined && props.showLoader == false) {
      if(localStorage.getItem("showLoader") == "false") {
         return {
           showLoader : false,
           otp_sent : (props.otp_sent) ? props.otp_sent : false,
           phone_number: ''
         }
       }
     }


     return null
 }

 handleSubmit = () => {
    if(!this.state.auth_token) {
      this.setState({'authTokenClass' : 'setting-input-box w-150 field-error'});
      return
    } else {
      this.setState({'authTokenClass' : 'setting-input-box w-150'});
    }
    this.showLoaderFunc();
    this.props.verifyGoogleToken({"google_auth_code":this.state.google_auth_code, "auth_token":this.state.auth_token})
 }

 sendOtpToNumber = () => {
    if(!(this.state.phone_number.trim())) {
      this.setState({contactClass: 'setting-input-box field-error'});
      return;
    } else if(this.state.contactError) {
      this.setState({contactClass :'setting-input-box field-error'});
      return;
    }
    this.showLoaderFunc();
    this.props.sendOTP({"phone_number":this.state.phone_number})
 }

 reloadBarcode = () => {
    this.showLoaderFunc();
    this.props.getGoogle2FA({params : {is_refresh:1}})
 }

 verifyOTP = () => {
    if(!this.state.otp) {
      this.setState({otpClass: 'setting-input-box field-error'});
      return;
    } else {
      this.setState({otpClass : 'setting-input-box'}) ;
    }
    this.showLoaderFunc();
    this.props.verifyMobileOTP({"phone_number":this.state.phone_number, otp: this.state.otp})
 }

  render(){
    let enabledDisabledText = '';
    if(this.state.two_factor_auth_status) {
      enabledDisabledText = this.state.twoFA_enabled;
    } else {
      enabledDisabledText = this.state.twoFA_disabled;
    }
    return(
      <div className="main protected">

    <div id="content">
        <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
                <div className="setting-container">
                    <div className="setting-title m-b-40">{this.state.twoFA_header}
                        <label className="setting-switch pull-right enable-disable-switch"><span className="factor_status">
                  {enabledDisabledText}</span><input type="checkbox" id="two_step" onChange={this.handleInputChange} name="two_factor_auth_status" checked={(this.state.two_factor_auth_status) ? 'checked' : false} className="setting-custom-switch-input" />
                            <span  className="setting-slider "></span>
                        </label>
                    </div>
                    <div id="two_factors" className={(this.state.two_factor_auth_status) ? 'ques-radio-right m-b-0' : 'ques-radio-right m-b-0 no-display' }>
                        <div className="p-text">
                            {this.state.twoFA_subheader}
                        </div>
                        <div className="row">
                            <div className="col-lg-3 col-md-5 col-sm-6">
                                <div className="pos-stripe-outer m-b-0">
                                    <input type="radio" className="factor-type pos-stripe-input pos-stripe-option" id="type-google" name="verification_type" onChange={this.handleInputChange} value="google" checked={(this.state.verification_type == 'google') ? 'checked' : false} />
                                    <label className="pos-stripe-discrip" htmlFor="type-google">
                                        <span className="pos-stripe-title authenti-radio-label">{this.state.twoFA_google_auth}</span></label>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-7 col-sm-6">
                                <div className="pos-stripe-outer m-b-0">
                                    <input type="radio" className="factor-type pos-stripe-input pos-stripe-option" id="type-sms" name="verification_type" onChange={this.handleInputChange} value="sms" checked={(this.state.verification_type == 'sms') ? 'checked' : false} />
                                    <label className="pos-stripe-discrip" htmlFor="type-sms">
                                        <span className="pos-stripe-title authenti-radio-label">{this.state.twoFA_sms_verify}</span></label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={(this.state.two_factor_auth_status) ? '' : 'no-display'}>
                  <div id="google_edit" className={(this.state.two_factor_auth_status && this.state.verification_type == 'google' && this.state.google_auth_code_display != '' && !this.state.addNewDevice) ? 'row factor-step setting-container' : 'row factor-step setting-container no-display'} >
                    <div className="col-sm-12 m-b-20">
                      <div className="new-field-label">{this.state.twoFA_googleAuth_key}</div>
                      <div className="setting-input-outer">
                        <div className=" setting-input-box w-200" placeholder="Enter Token" >{this.state.google_auth_code_display}</div>
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <a className="google new-blue-btn m-l-0 m-t-10" onClick={this.addNewDevice} >{this.state.Two_Factor_Authentication_Change_Add_New_Device}</a>
                    </div>
                  </div>
                  <div id="sms_edit" className={(this.state.two_factor_auth_status && this.state.verification_type == 'sms'  && this.state.phone_number_display != '' && !this.state.addNewPhone) ? 'row factor-step setting-container' : 'row factor-step setting-container no-display'}>
                      <div className="col-sm-12 m-b-20">
                        <div className="new-field-label">{this.state.twoFA_sms_phoneNo}</div>
                        <div className="setting-input-outer">
                          <div className=" setting-input-box w-200" placeholder="Enter Token" >{this.state.phone_number_display}</div>
                        </div>
                      </div>
                      <div className="col-sm-12">
                        <a className="sms new-blue-btn m-l-0 m-t-10" onClick={this.addNewPhone}>{this.state.Two_Factor_Authentication_Change}</a>
                      </div>
                  </div>
                  <div className={(this.state.verification_type == 'google' && this.state.addNewDevice) ? 'setting-container factor-step' : 'setting-container factor-step no-display' } id="google">
                      <div className="row">
                          <div className="settings-subtitle col-xs-12">{this.state.twoFA_step1}</div>
                          <div className="col-lg-6 col-xs-12 m-b-40">
                              <p className="setting-text">{this.state.twoFa_Scan_bar}</p>
                              <div className="barcode-img">
                                  <img src={this.state.qr_code_url} />
                              </div>
                              <p className="authe-icons">
                                <a className="confirm-model" onClick={this.reloadBarcode}><i className="fas fa-redo-alt"></i></a>
                                  <a className="barcode-help m-l-10" onClick={()=> this.setState({circleText: !this.state.circleText})}>
                                    <i className="fas fa-info-circle"></i>

                                  </a>
                              </p>
                              <p className={this.state.circleText ? "barcode-title": "no-display"}>{this.state.Two_Factor_Authentication_Click_on_reload_button}</p>
                          </div>
                          <div className="col-lg-6 col-xs-12 m-b-40">
                              <p className="authe-discription">{this.state.twoFA_download_link}</p>
                              <span className="twofas-light-icons">
                                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener">
                                  <img src="/images/google-play.png" alt="Google Authenticator - Google Play"/>
                                </a>
                                <a className="m-l-10" href="https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8" target="_blank" rel="noopener">
                                  <img src="/images/app-store.png" alt="Google Authenticator - App Store"/>
                                </a>
                              </span>
                          </div>
                          <div className="col-xs-12">
                              <div className="settings-subtitle">{this.state.twoFA_step2}</div>
                              <div className="row">
                                  <div className="col-xs-12 m-b-20">
                                      <div className="new-field-label">{this.state.twoFA_Enter_key}</div>
                                      <div className="setting-input-outer">
                                          <input id="auth_token" className={this.state.authTokenClass} placeholder="Enter Token" autoComplete="off" name="auth_token" type="text" onChange={this.handleInputChange} value={this.state.auth_token} />
                                      </div>
                                  </div>
                                  <div className="col-xs-12">
                                      <a id="verify_google_token" onClick={this.handleSubmit} className="new-blue-btn m-l-0 m-t-10">{this.state.Two_Factor_Authentication_Verify}</a>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className={(this.state.verification_type == 'sms' && this.state.addNewPhone) ? 'factor-step setting-container' : 'row factor-step setting-container no-display' } id="sms">
                      <div className="row">
                          <div className="col-md-6 col-xs-12">
                              <div className="setting-field-outer">
                                  <span className="authe-discription">{this.state.twoFA_otp}</span>
                                  <div className="new-field-label">{this.state.twoFA_sms_no}</div>
                                  <div className="setting-input-outer m-b-20">
                                      <div className="intl-tel-input allow-dropdown">
                                        {(this.state.addNewPhone) && <IntlTelInput className="form-control"
                                          utilsScript={ 'libphonenumber.js' }
                                          css={ ['intl-tel-input', this.state.contactClass] }
                                          defaultValue = {(this.state.phone_number) ? this.state.phone_number : ''}
                                          defaultCountry = {this.state.defaultCountry}
                                          fieldName='phone_number'
                                          onPhoneNumberChange={this.phoneNumberChanged }
                                          onPhoneNumberBlur={this.phoneNumberChanged }
                                          fieldId='phone_number'
                                          placeholder="Phone Number"
                                          autoPlaceholder = {true}
                                          separateDialCode={`true`}
                                        />}
                                      </div>
                                  </div>
                                  <a id="validate_phone" className="new-blue-btn m-l-0 m-t-10" onClick={this.sendOtpToNumber}>{this.state.Two_Factor_Authentication_Send_OTP}</a>
                              </div>
                          </div>
                            <div className={(this.state.otp_sent) ? 'col-md-6 col-xs-12' : 'col-md-6 col-xs-12 no-display'}>
                              <div id="smstwostep">
                                  <span className="authe-discription">{this.state.Two_Factor_Authentication_OTP_sent_successfully}</span>
                                  <div className="new-field-label">{this.state.Two_Factor_Authentication_Enter_OTP_to_verify}</div>
                                  <div className="setting-field-outer">
                                      <input name="otp" id="sms_otp" className={this.state.otpClass} placeholder="Enter OTP" type="text" autoComplete="off" onChange={this.handleInputChange} value={this.state.otp} />
                                      <div>
                                          <a id="verify_sms_otp" type="button" className="new-blue-btn m-l-0 m-t-10" onClick={this.verifyOTP}>{this.state.Two_Factor_Authentication_Verify}</a>
                                      </div>
                                  </div>
                              </div>
                            </div>
                          </div>
                      </div>
                    </div>
                    <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                      <div className="loader-outer">
                        <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                        <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
        </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  toast.dismiss();
  localStorage.setItem("showLoader", false);
  if ( state.SettingReducer.action === "USER_2FA_GET" ) {
    return {user2FaData: state.SettingReducer.data, timestamp: new Date()}
  }

  if ( state.SettingReducer.action === "USER_2FA_DISABLED" ) {
    if(state.SettingReducer.data.status == 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {showLoader: false, otp_sent: false}
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
  }
  if ( state.SettingReducer.action === "GOOGLE_2FA_GET" ) {
    if(state.SettingReducer.data.status == 200) {
      return {google2FaData: state.SettingReducer.data}
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
  }
  if ( state.SettingReducer.action === "GOOGLE_2FA_VERIFY" ) {
    if(state.SettingReducer.data.status == 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {user2FaData: state.SettingReducer.data, timestamp: new Date()}
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      return {
        showLoader : false
      }
    }
  }
  if ( state.SettingReducer.action === "SEND_OTP" ) {
    if(state.SettingReducer.data.status == 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {otp_sent: true}
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
  }
  if ( state.SettingReducer.action === "VERIFY_OTP" ) {
    if(state.SettingReducer.data.status == 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {user2FaData: state.SettingReducer.data, timestamp: new Date()}
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
  }
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({get2FA: get2FA, disable2FA: disable2FA, getGoogle2FA: getGoogle2FA, verifyGoogleToken: verifyGoogleToken, sendOTP: sendOTP, verifyMobileOTP: verifyMobileOTP}, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps) (TwoFactorAuthentication);
