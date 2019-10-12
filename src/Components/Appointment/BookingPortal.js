import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import config from '../../config.js';
import axios from 'axios';
import { getBookingURL, updateBookingURL, cancellationPolicyStatus } from '../../Actions/Settings/settingsActions.js';
import AppointmentHeader from './AppointmentHeader.js';
import AppointmentConfigSidebar from './AppointmentConfigSidebar.js';


class BookingPortal extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const langData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      pportal_subdomain: '',
      showLoader: false,
      userChanged: false,
      save: 'new-blue-btn url-save m-r-5',
      cancel: 'new-white-btn url-save',
      edit: 'new-blue-btn url-save',
      editUrl: false,
      edit_time: false,
      clinic_name: '',
      clinic_url: '',
      booking_time_interval: '60',
      urlEnable: 'row m-b-20',
      urlDisable: 'row m-b-20 no-display',
      intervalEnable: 'row',
      intervalDisable: 'row no-display',
      buttonEnable: 'col-lg-4 col-xs-12',
      buttonDisable: 'col-lg-4 col-xs-12 no-display',
      clinics: [],
      hostname: '',
      domain_name: '',
      pportal_subdomainClass: 'newInputField ar-url',
      lead_time: false,
      leadEnable: 'row',
      leadDisable: 'row no-display',
      minimum_lead_time: "",
      temp_minimum_lead_time: '',
      temp_minimum_lead_time_label: '',
      minimum_lead_time_options: [],
      temp_booking_time_interval_label: '',
      booking_time_interval_options: [],
      bookingPortal: true,
      timeSetting: false,
      langData: langData
    }
  }
  componentDidMount() {

    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      Configure_URL_Customer_Portal: languageData.settings['Configure_URL_Customer_Portal'],
      Configure_URL_Url: languageData.settings['Configure_URL_Url'],
      Appointment_Reminder_Edit: languageData.settings['Appointment_Reminder_Edit'],
      Configure_URL_dot_estheticrecord_dot_com: languageData.settings['Configure_URL_dot_estheticrecord_dot_com'],
      editUsers_CancelBtn: languageData.settings['editUsers_CancelBtn'],
      Configure_URL_Appointment_Booking: languageData.settings['Configure_URL_Appointment_Booking'],
      Configure_URL_dot_estheticrecord_dot_com: languageData.settings['Configure_URL_dot_estheticrecord_dot_com'],
      Configure_URL_Customize_Appointment_Booking: languageData.settings['Configure_URL_Customize_Appointment_Booking'],
      Configure_URL_Time_Slots_For_Appointment_Booking: languageData.settings['Configure_URL_Time_Slots_For_Appointment_Booking'],
      Edit_Appointment_Reminder_Select: languageData.settings['Edit_Appointment_Reminder_Select'],
      Configure_URL_Mins_Increments: languageData.settings['Configure_URL_Mins_Increments'],
      saveBtn: languageData.global['saveBtn'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      Configure_URL_http: languageData.settings['Configure_URL_http'],
      Configure_URL_Five: languageData.settings['Configure_URL_Five'],
      Configure_URL_Ten: languageData.settings['Configure_URL_Ten'],
      Configure_URL_Fifteen: languageData.settings['Configure_URL_Fifteen'],
      Configure_URL_Tweenty: languageData.settings['Configure_URL_Tweenty'],
      Configure_URL_Tweenty_Five: languageData.settings['Configure_URL_Tweenty_Five'],
      Configure_URL_Thirty: languageData.settings['Configure_URL_Thirty'],
      Configure_URL_Thirty_Five: languageData.settings['Configure_URL_Thirty_Five'],
      Configure_URL_Fourty: languageData.settings['Configure_URL_Fourty'],
      Configure_URL_Fourty_Five: languageData.settings['Configure_URL_Fourty_Five'],
      Configure_URL_Fifty: languageData.settings['Configure_URL_Fifty'],
      Configure_URL_Fifty_Five: languageData.settings['Configure_URL_Fifty_Five'],
      Configure_URL_Sixty: languageData.settings['Configure_URL_Sixty'],
      Configure_URL_Minimum_lead_time_for_booking: languageData.settings['Configure_URL_Minimum_lead_time_for_booking'],
      Configure_URL_increments: languageData.settings['Configure_URL_increments'],
      yes_option:languageData.settings['yes_option'],
      no_option:languageData.settings['no_option'],
    })

    this.setState({ 'showLoader': true });
    this.props.getBookingURL();


  }

  static getDerivedStateFromProps(props, state) {

    if (props.bookingList !== undefined && props.bookingList.status === 200 && state.clinics !== props.bookingList.data.clinics && state.bookingList != props.bookingList.data) {

      let returnState = {
        bookingList: props.bookingList.data,
        pportal_subdomain: (state.userChanged) ? state.pportal_subdomain : props.bookingList.data.account_details.pportal_subdomain,
        temp_pportal_subdomain: props.bookingList.data.account_details.pportal_subdomain,
        booking_time_interval: (state.userChanged) ? state.booking_time_interval : props.bookingList.data.account_details.booking_time_interval,
        temp_booking_time_interval: (props.bookingList.data.account_details.booking_time_interval !== undefined) ? props.bookingList.data.account_details.booking_time_interval : '60',
        clinic_name: (state.userChanged) ? state.clinic_name : props.bookingList.data.clinic_name,
        clinics: props.bookingList.data.clinics,
        clinic_url: (state.userChanged) ? state.clinic_url : props.bookingList.data.clinic_url,
        hostname: (state.userChanged) ? state.hostname : props.bookingList.data.hostname,
        domain_name: (state.userChanged) ? state.domain_name : props.bookingList.data.domain_name,
        showLoader: false,
        minimum_lead_time: (state.userChanged) ? state.minimum_lead_time : props.bookingList.data.account_details.minimum_lead_time,
        temp_minimum_lead_time: (props.bookingList.data.account_details.minimum_lead_time !== undefined) ? props.bookingList.data.account_details.minimum_lead_time : '0',
        minimum_lead_time_options: props.bookingList.data.minimum_lead_time,
        booking_time_interval_options: props.bookingList.data.booking_time_interval,
        allow_patients_to_manage_appt: (props.bookingList.data.smart_booking) ? true : false
      };

      const intervalValue = returnState.booking_time_interval_options.filter(obj => obj.value == returnState.temp_booking_time_interval);
      returnState.temp_booking_time_interval_label = (returnState.temp_booking_time_interval !== '' && intervalValue.length === 1) ? intervalValue[0]['label'] : ''

      const leadValue = returnState.minimum_lead_time_options.filter(obj => obj.value !== '' && obj.value == returnState.temp_minimum_lead_time);
      returnState.temp_minimum_lead_time_label = (returnState.temp_minimum_lead_time !== '' && leadValue.length === 1) ? leadValue[0]['label'] : '1 hr'
      returnState.showLoader = false;
      return returnState;
    }
    if(props.showLoader != undefined && props.showLoader == false) {
      return {showLoader: false}
    }
      return null;
  }
  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    let returnState = {};

    if(target.name == 'allow_patients_to_manage_appt') {
      if(value) {
        returnState.showLoader = true;
        let userData = JSON.parse(localStorage.getItem('userData'));
        userData.account.account_preference.allow_patients_to_manage_appt = 1;
        localStorage.setItem('userData', JSON.stringify(userData))
        this.props.cancellationPolicyStatus({field_name:'allow_patients_to_manage_appt', is_enabled : (value) ? 1 : 0});
      } else {
        this.showDeleteModal()
        returnState.formData = {field_name:'allow_patients_to_manage_appt', is_enabled : (value) ? 1 : 0}
      }
    }

    returnState[event.target.name] = value;
    returnState.userChanged = true;
    console.log(returnState);
    this.setState(returnState);
  }

  changeURLValue = () => {
    this.setState({
      editUrl: !this.state.editUrl
    })
  }

  changeCancelURLValue = () => {
    this.setState({
      editUrl: !this.state.editUrl,
      pportal_subdomain: this.state.temp_pportal_subdomain
    })
  }

  changeIntervalValue = () => {
    this.setState({
      edit_time: !this.state.edit_time
    })
  }

  changeCancelIntervalValue = () => {
    this.setState({
      edit_time: !this.state.edit_time,
      booking_time_interval: this.state.temp_booking_time_interval
    })
  }

  changeLeadValue = () => {
    this.setState({
      lead_time: !this.state.lead_time
    })
  }

  changeCancelLeadValue = () => {
    this.setState({
      lead_time: !this.state.lead_time,
      minimum_lead_time: this.state.temp_minimum_lead_time
    })
  }

  saveUrl = (event) => {
    let error = false;
    this.setState({
      pportal_subdomainError: false,
    });

    if (typeof this.state.pportal_subdomain === undefined || this.state.pportal_subdomain === null || this.state.pportal_subdomain === '') {
      this.setState({
        pportal_subdomainError: true,
        pportal_subdomainClassError: 'newInputField ar-url field-error'
      })
      error = true;
    }
    else if (this.state.pportal_subdomain) {
      this.setState({
        pportal_subdomainError: false,
        pportal_subdomainClass: 'newInputField ar-url'
      })
    }

    if (error) {
      return;
    }

    let formData = {
      pportal_subdomain: this.state.pportal_subdomain
    }
    this.props.updateBookingURL(formData);
    this.changeURLValue();
  }

  handleSubmit = (timeType, event) => {
    event.preventDefault();
    if (timeType === 'edit_time') {
      let error = false;

      if (this.state.booking_time_interval === 'select') {
        toast.error("Please select Time Interval")
        error = true;
      }

      if (error) {
        return;
      }
      let formData = {
        booking_time_interval: this.state.booking_time_interval,
      }
      this.props.updateBookingURL(formData);
      this.changeIntervalValue();
    } else if (timeType === 'lead_time') {
      let error = false;

      if (this.state.minimum_lead_time === 'select') {
        toast.error("Please select Minimum Lead Time")
        error = true;
      }

      if (error) {
        return;
      }
      let formData = {
        minimum_lead_time: this.state.minimum_lead_time,
      }
      this.props.updateBookingURL(formData);
      this.changeLeadValue();
    }
  }
  showDeleteModal = () => {
      this.setState({showModal: true})
   }

   dismissModal = () => {
      this.setState({showModal: false, formData:{}, allow_patients_to_manage_appt: true})
   }

   toggleSetting = () => {
      this.setState({showLoader: true, hideBtns : true, showModal: false})
      let formData = this.state.formData;
      let userData = JSON.parse(localStorage.getItem('userData'));
      userData.account.account_preference.allow_patients_to_manage_appt = 0;
      localStorage.setItem('userData', JSON.stringify(userData))
      this.props.cancellationPolicyStatus(formData);
   }

  changeTab = (mode) => {
    console.log(mode);
    let returnState = {}
    let newMode = (mode == 'bookingPortal') ? 'timeSetting' : 'bookingPortal';
    returnState[mode] = true;
    returnState[newMode] = false;
    console.log(returnState);
    this.setState(returnState)
  }
  render() {
    var options = [];
    if (this.state.clinics != undefined && this.state.clinics.length > 0) {
      options = this.state.clinics.map((uobj, uidx) => {
        return (
          <div className="col-sm-12" key={uidx}>
            <div className="newInputFileldOuter">
              <div className="newInputLabel">{uobj.clinic_name} {'Url'} <span className="setting-require"></span></div>
              <a target="_blank" href={uobj.clinic_url} className="newInputField"><span>{uobj.clinic_url}</span></a>
            </div></div>
        )
      })

    }
    let url = '';
    if (this.state.hostname != '') {
      url = this.state.hostname + this.state.pportal_subdomain + '.' + this.state.domain_name + '.com';
    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <AppointmentHeader activeMenuTag={'config'}/>
          <AppointmentConfigSidebar />
          <div className="setting-setion no-margin">
            <div className="appointment-container">
              <div className="juvly-title">Booking Portal</div>
              <ul className="appointment-tabs">
                <li><a className={(this.state.bookingPortal) ? "active" : ""} onClick={() => {this.changeTab('bookingPortal')}}>{this.state.langData['appointments']['domain-config']}</a></li>
                <li><a className={(this.state.timeSetting) ? "active" : ""} onClick={() => {this.changeTab('timeSetting')}}>{this.state.langData['appointments']['app-time-settings']}</a></li>
              </ul>

              <div className={(this.state.bookingPortal) ? "appointment-content" : "appointment-content no-display"}>
                <div className={(this.state.editUrl == false) ? this.state.urlEnable : this.state.urlDisable} id="viewmode">
                  <div className="col-lg-5 col-xs-12">
                    <div className="newInputFileldOuter">
                      <div className="newInputLabel">{this.state.Configure_URL_Url}<span className="setting-require">*</span></div>
                      <div>
                        <a target="_blank" href={url} className="newInputField">{url}</a>
                      </div>
                      <a onClick={this.changeURLValue} className="editField"><img src="/images/editIcon.png"/></a>
                    </div>
                  </div>
                </div>
                <div className={(this.state.editUrl == true) ? this.state.urlEnable : this.state.urlDisable} id="editmode">
                  <div className="col-lg-5 col-xs-12">
                    <div className="newInputFileldOuter">
                      <div className="newInputLabel">{this.state.Configure_URL_Url}<span className="setting-require">*</span></div>
                      <input type="text" id="pportal_subdomain" name="pportal_subdomain" className={this.state.pportal_subdomainError === true ? this.state.pportal_subdomainClassError : this.state.pportal_subdomainClass} value={this.state.pportal_subdomain} autoComplete="off" onChange={this.handleInputChange} />
                      <span style={{ color: 'red' }}>{this.state.pportal_subdomainError === true ? '' : ''}</span>
                      <span class="url-first">https://</span>
                      <span class="url-last">.{this.state.domain_name}.com</span>
                    </div>
                  </div>
                  <div className="col-lg-4 col-xs-12 m-t-5">
                    <button className="new-blue-btn url-save m-r-5" id="saveurl" onClick={this.saveUrl}>{this.state.saveBtn}</button>
                    <button className="new-white-btn url-save m-l-10" id="cancelurl" onClick={this.changeCancelURLValue}>{this.state.editUsers_CancelBtn}</button>
                  </div>
                </div>
                <div class="AppointmentSubtitle no-margin">{this.state.langData['appointments']['app-manage-through-customer-portal']}
                  <label class="setting-switch pull-right sm-switch">
                        <input type="checkbox" id="portalAccess" className="confirm-model  setting-custom-switch-input" checked="checked"  name="allow_patients_to_manage_appt" checked={(this.state.allow_patients_to_manage_appt) ? 'checked' : false} onChange={this.handleInputChange} />
                    <span class="setting-slider "></span>
                  </label>
                </div>
                <p class="p-text m-b-20">{this.state.langData['appointments']['app-book-cancel-rescedule']}</p>
                <div className={"row"}>
                  {options}
                </div>
              </div>
              <div className={(this.state.timeSetting) ? "appointment-content" : "appointment-content no-display"}>

                    <div className={(this.state.edit_time == true) ? this.state.intervalEnable : this.state.intervalDisable} id="edit_time_box">
                      <div className="col-lg-8 col-xs-12">
                        <div className="newInputFileldOuter m-t-15">
                          <div>
                            {this.state.Configure_URL_Time_Slots_For_Appointment_Booking}:&nbsp;
                            <select name="booking_time_interval" id="booking_time_interval" className="setting-select-box ar-url" value={this.state.booking_time_interval} onChange={this.handleInputChange}>
                              {(this.state.booking_time_interval_options.length > 0) ?
                                this.state.booking_time_interval_options.map((obj, idx) => {
                                  return (
                                    <option key={'booking_time_interval_options' + idx} value={obj.value}>{obj.label}</option>
                                  )
                                })
                                :
                                <option value="select">{this.state.Edit_Appointment_Reminder_Select}</option>
                              }
                            </select> &nbsp;
                            {this.state.Configure_URL_increments}
                          </div>
                        </div>
                      </div>
                      <div className={(this.state.edit_time == true) ? this.state.buttonEnable : this.state.buttonDisable}>
                        <button className="new-blue-btn url-save m-r-5" id="save_time" onClick={this.handleSubmit.bind(this, 'edit_time')}>{this.state.saveBtn}</button>
                        <button className="new-white-btn url-save m-l-10" id="cancel_time" onClick={this.changeCancelIntervalValue}>{this.state.editUsers_CancelBtn}</button>
                      </div>
                    </div>
                    <div className={(this.state.edit_time == false) ? this.state.intervalEnable : this.state.intervalDisable} id="print_time_box">
                      <div className="col-lg-8 col-xs-12">
                        <div className="newInputFileldOuter m-t-15">
                          <div>
                            {this.state.Configure_URL_Time_Slots_For_Appointment_Booking} <span id="seltime">{this.state.temp_booking_time_interval_label}</span> {this.state.Configure_URL_increments}
                            <a onClick={this.changeIntervalValue} className="editField appointmentTimeSettingsEdit"><img src="/images/editIcon.png"/></a>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className={(this.state.lead_time == true) ? this.state.leadEnable : this.state.leadDisable} id="lead_time_box">
                      <div className="col-lg-8 col-xs-12">
                        <div className="newInputFileldOuter m-t-15">
                          <div>
                            {this.state.Configure_URL_Minimum_lead_time_for_booking}: &nbsp;
                            <select name="minimum_lead_time" id="minimum_lead_time" className="setting-select-box ar-url" value={this.state.minimum_lead_time} onChange={this.handleInputChange}>
                              {(this.state.minimum_lead_time_options.length > 0) ?
                                this.state.minimum_lead_time_options.map((obj, idx) => {
                                  return (
                                    <option key={'minimum_lead_time_options' + idx} value={obj.value}>{obj.label}</option>
                                  )
                                })
                                :
                                <option value="select">{this.state.Edit_Appointment_Reminder_Select}</option>
                              }
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className={(this.state.lead_time == true) ? this.state.buttonEnable : this.state.buttonDisable}>
                        <button className="new-blue-btn url-save m-r-5" id="save_time" onClick={this.handleSubmit.bind(this, 'lead_time')}>{this.state.saveBtn}</button>
                        <button className="new-white-btn url-save m-l-10" id="cancel_time" onClick={this.changeCancelLeadValue}>{this.state.editUsers_CancelBtn}</button>
                      </div>
                    </div>
                    <div className={(this.state.lead_time == false) ? this.state.leadEnable : this.state.leadDisable} id="print_time_box">
                      <div className="col-lg-8 col-xs-12">
                        <div className="newInputFileldOuter m-t-15">
                          <div>
                            {this.state.Configure_URL_Minimum_lead_time_for_booking}:&nbsp;<span id="selleadtime">{this.state.temp_minimum_lead_time_label}</span>
                            <a onClick={this.changeLeadValue} className="editField appointmentTimeSettingsEdit"><img src="/images/editIcon.png"/></a>
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
        <div className={(this.state.showModal ? 'overlay' : '')}></div>
          <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.langData['appointments']['app-confirmation-required']}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                  {this.state.langData['appointments']['app-disable-manage-message']}
                </div>
                <div className="modal-footer" >
                  <div className="col-md-12 text-left" id="footer-btn">

                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.no_option}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.toggleSetting}>{this.state.yes_option}</button>
                  </div>
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
  if (state.SettingReducer.action === "GET_BOOKING_URL_LIST") {
    if (state.SettingReducer.data.status == 200) {
      returnState.bookingList = state.SettingReducer.data;
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.bookingListUpdate = state.SettingReducer.data;
    }
  }
  if (state.SettingReducer.action === "UPDATE_BOOKING_URL_LIST") {
    console.log(state.SettingReducer.data.message, languageData.global[state.SettingReducer.data.message]);
    if (state.SettingReducer.data.status == 200) {
      toast.dismiss();
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.bookingList = state.SettingReducer.data;
      returnState.userChanged = false;
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.bookingListUpdate = state.SettingReducer.data;
    }
  }

  if (state.SettingReducer.action === "CANCELLATION_POLICY_STATUS") {
    if(state.SettingReducer.data.status == 200){
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
      returnState.timeStamp = new Date();
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.policyData = state.SettingReducer.data;
      returnState.showLoader = false;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getBookingURL: getBookingURL,
    updateBookingURL: updateBookingURL,
    cancellationPolicyStatus: cancellationPolicyStatus,
  }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(BookingPortal);
