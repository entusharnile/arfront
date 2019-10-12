import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { enableGoogleCalendarSync } from '../../../Actions/Settings/settingsActions.js';
import { numberFormat } from '../../../Utils/services.js';
import { ToastContainer, toast } from "react-toastify";
import { showMonthFormattedDate, capitalizeFirstLetter } from '../../../Utils/services.js';
import moment from 'moment';
import queryString from 'query-string';
import IntlTelInput from 'react-intl-tel-input';
import Header from '../../../Containers/Protected/Header.js';
import Footer from '../../../Containers/Protected/Footer.js';
import Sidebar from '../../../Containers/Settings/sidebar.js';
import Loader from '../../Common/Loader.js'

const redirectToPos = () => {
  window.location = '/settings/profile';
}

class GoogleCalendarReturnUrl extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    return {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      showLoader: false,
      backAction: '/settings/profile',
      posStripeSetupData: {},
      code: '',
      clinicId: 0,
      showLoader: true,

      posData: {},
      stripeConfigClinic: [],
      stripeConfigGlobal: [],
      stripeConnectionMode: 'clinic',
      stripeCountry: "US",
      stripeCurrency: "usd",
      stripeMode: "",
      pos_enabled: false,
      isShowAlertModal: false,
      alertModalContent: '',
      alertModalType: 'pos_enabled',
      disconnectStripeId: '',
      disconnectClinicId: 0,
      updateStripeId: '',
      updateClinicId: 0,
      isShowUpdateModal: false,
      defaultCountry: localStorage.getItem('cCode'),
    }
  }

  componentDidMount() {
    this.setState({ 'showLoader': true })
      const query = queryString.parse(this.props.location.search)
      if(Object.keys(query).length){
        if(query.code !== undefined && query.code !== '' && query.code !== null){
          const formData ={
            google_redirect_url :  window.location.origin+"/settings/profile/calendar/sync",
            code : query.code,
            scope : query.scope
          }
          this.props.enableGoogleCalendarSync(formData);
        } else {
            if(query.error_description !== undefined && query.error_description !== '' && query.error_description !== null){
              this.displayToastMessage(query.error_description);
            } else {
              this.displayToastMessage('Unknow Error!');
            }
        }
      } else {
        this.displayToastMessage('Google response data is empty');
      }

  }

  displayToastMessage = (msg) => {
    toast.error(msg)
    redirectToPos();
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.redirect != undefined && nextProps.redirect == true) {
      if (nextProps.status) {
        toast.success(nextProps.message)
        redirectToPos();
      } else {
        toast.error(nextProps.message)
        redirectToPos()
      }
    }
    return returnState
  }

  handleInputChange = () => {

  }



  render() {
    return (
      <div className="main protected">
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <form id="login-form" name="login-form" className="nobottommargin" action="#" method="post" autoComplete="new-password" >
                <div className="setting-container">
                  <div className="setting-title">
                    {this.state.profileHeader}
                  </div>
                  <div className="row">
                    <div className="col-lg-8 col-xs-12 profile-detail-left">
                      <div className="main-profile-picture">
                      </div>
                      <div className="settings-subtitle">{this.state.profile_subheader}</div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.profile_first_name}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="firstname" id="first_name" className={this.state.firstnameError === true ? this.state.firstnameClassError : this.state.firstnameClass} placeholder="firstname" maxLength="255" type="text" value={this.state.firstname} onChange={this.handleInputChange} autoComplete="new-password" />
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.profile_last_name}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="lastname" placeholder="lastname" className={this.state.lastnameError === true ? this.state.lastnameClassError : this.state.lastnameClass} maxLength="255" type="text" value={this.state.lastname} onChange={this.handleInputChange} autoComplete="new-password" /></div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.profile_phone} <span className="setting-require"></span></div>
                            <div className="setting-input-outer">
                              {this.state.dbfirstname != '' && <IntlTelInput
                                preferredCountries={['tw']}
                                css={['intl-tel-input', this.state.contactClass]}
                                utilsScript={'libphonenumber.js'}
                                defaultValue={(this.state.contact_number_1) ? this.state.contact_number_1 : ''}
                                defaultCountry={this.state.defaultCountry}
                                fieldName='contact_number_1'
                                onPhoneNumberChange={this.phoneNumberChanged}
                                onPhoneNumberBlur={this.phoneNumberChanged}
                                placeholder="Phone Number"
                                separateDialCode={`true`}
                              />}
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.profile_email} <span className="setting-require">*</span>
                            </div>
                            <div className="setting-input-outer">
                              <input name="email_id" className={this.state.email_idError === true ? this.state.email_idClassError : this.state.email_idClass} placeholder="email" maxLength="500" type="text" value={this.state.email_id} onChange={this.handleInputChange}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck="false"
                              /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4 col-xs-12 change-pwd-outer">
                      <div className="settings-subtitle">Change Password</div>
                      <div className="row">
                        <div className="col-sm-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">CURRENT PASSWORD <span className="setting-require">*</span></div>
                            <div className="setting-input-outer"><input name="old_password" type="password" className="passwordclassName setting-input-box" autoComplete="new-password" defaultValue="" /></div>
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">NEW PASSWORD<span className="setting-require">*</span></div>
                            <div className="setting-input-outer"><input name="password" type="password" className="passwordclassName setting-input-box" autoComplete="new-password" defaultValue /></div>
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">REPEAT PASSWORD <span className="setting-require">*</span></div>
                            <div className="setting-input-outer"><input name="repeat_password" type="password" className="passwordclassName setting-input-box" autoComplete="new-password" defaultValue /></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="settings-subtitle signature-subtitle">Personal Signature</div>
                      <div className="signature-box sig-div" id="sig-div"><div style={{ width: '400px', height: '200px' }}><div className="canvas-container" style={{ width: '398px', height: '200px', position: 'relative', userSelect: 'none' }}>
                        <canvas id="88f5165c-1e43-470e-a95a-1b901ac6026f" className="lower-canvas" width="437.80000948905945" height="220.00000476837158" style={{ position: 'absolute', width: '398px', height: '200px', left: '0px', top: '0px', touchAction: 'none', userSelect: 'none' }}>Sorry, Canvas HTML5 element is not supported by your browser </canvas>
                        <canvas className="upper-canvas " style={{ position: 'absolute', width: '398px', height: '200px', left: '0px', top: '0px', touchAction: 'none', userSelect: 'none', cursor: 'crosshair' }} />
                      </div>
                      </div>
                      </div>
                      <div className="img-src" id="img-src"><div className="input-outer no-display" style={{ background: 'none 0px 0px repeat scroll rgb(255, 255, 255)' }}>
                        <img  id="signature_image"  /></div>
                      </div>
                      <span className="setting-custom-switch pull-right">
                        <span className="switch-text">Show Signature Pop-up</span>
                        <label className="setting-switch pull-right" htmlFor="show_signature_popup">
                          <input type="checkbox" name="show_signature_popup" id="show_signature_popup" />
                          <span className="setting-slider" />
                        </label>
                      </span>
                      <div className="sig-div no-display">
                        <div className="pull-left" /></div>
                      <div className="img-src change-sig">
                        <div className="pull-left"><button type="button" id="change" className="new-blue-btn no-margin Change no-display">Change</button></div>
                        <div className="pull-left"><button type="button" id="change1" className="new-white-btn no-margin clear">Clear</button></div>
                        <div className="pull-left"><button type="button" id="change2" className="new-blue-btn reset ">Reset</button></div>
                        <div className="pull-left"><button type="button" id="change3" className="new-blue-btn reset ">Save Signature</button></div>
                      </div>
                      <div className="row">
                        <div className="col-xs-12"><span className="setting-custom-switch pull-right syn-wid-google"><span className="switch-text">Sync With Google Calendar</span><label className="setting-switch pull-right"><input type="checkbox" name="google_calender_sync" id="google_calender_sync" /><span className="setting-slider" /></label></span></div>
                      </div>
                    </div>


                  </div>
                </div>
                <div className="footer-static">
                  <button className="new-blue-btn pull-right" type="submit" id="save-profile" onClick={this.handleSubmit}>{this.state.user_save_btn_text}</button>
                </div>
              </form>
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
  const returnState = {};
  if (state.SettingReducer.action === "ENABLE_GOOGLE_CALENDAR_SYNC") {
    if (state.SettingReducer.data.status != 200) {
      if (state.SettingReducer.data.message == 'third_party_error') {
        returnState.message = state.SettingReducer.data.data;
      } else {
        returnState.message = languageData.global[state.SettingReducer.data.message];
      }
      returnState.redirect = true;
      returnState.status = false;
    } else {
      returnState.status = true;
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.redirect = true;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    enableGoogleCalendarSync: enableGoogleCalendarSync
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(GoogleCalendarReturnUrl));
