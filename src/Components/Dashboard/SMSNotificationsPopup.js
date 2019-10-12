import React, { Component } from 'react';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fetchSMSNotificationsPopups, createReply } from '../../Actions/Dashboard/dashboardActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {showFormattedDate} from '../../Utils/services.js';
import moment from 'moment';


class SMSNotificationsPopup extends Component{
  constructor(props) {
    super(props);
      const userData = JSON.parse(localStorage.getItem('userData'));
      this.state = {
      timezone:'',
      city:'',
      php_timezone:'',
      country_name:'',
      country_code:'',
      defaultCountry: 'us',
      clinic_name: '',
      contact_no: '',
      address: '',
      email_special_instructions:'',
      sms_notifications_phone:'',
      smsPopupData: [],
      defaultImg: '/images/user.png',
      reply: '',
      tax: '',
      time_format: '',
      clinicData: {},
      userId:userData.user.id,
      id: this.props.match.params.id,
      page: 1,
      pagesize: 15,
      sortorder: 'asc',
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      loadMore: true,
      startFresh: true,
      showLoader: false,
      scopes: 'business_hours',
      user_changed:false,
      timezoneList:[],
      countryList:[],
      notiEmailArr: [],
      multipleEmailClass : "setting-input-box notiEmailInput",
      contactClass: 'setting-input-box',
      notiContactClass: 'setting-input-box'
    };
  }

  componentDidMount(){
        const smsId =this.props.match.params.id;
        const languageData = JSON.parse(localStorage.getItem('languageData'))

        this.setState({
          smsId: (smsId != undefined) ? smsId : undefined,
          SMS_Notifications_popup: languageData.dashboard['SMS_Notifications_popup'],
          SMS_Notifications_popup_IM_History: languageData.dashboard['SMS_Notifications_popup_IM_History'],
          edit_clinic_subheader: languageData.settings['edit_clinic_subheader'],
          edit_clinic_Clinic_name: languageData.settings['edit_clinic_Clinic_name'],
          edit_clinic_contact_no: languageData.settings['edit_clinic_contact_no'],
          edit_clinic_time_zone: languageData.settings['edit_clinic_time_zone'],
          edit_clinic_address: languageData.settings['edit_clinic_address'],
          edit_clinic_city_state: languageData.settings['edit_clinic_city_state'],
          edit_clinic_country:languageData.settings['edit_clinic_country'],
          edit_clinic_notif_email : languageData.settings['edit_clinic_notif_email'],
          edit_clinic_sms_notif_phone: languageData.settings['edit_clinic_sms_notif_phone'],
          edit_clinic_sms_multiple_emails:languageData.settings['edit_clinic_sms_multiple_emails'],
          edit_clinic_tax_settings:languageData.settings['edit_clinic_tax_settings'],
          edit_clinic_tax_rate:languageData.settings['edit_clinic_tax_rate'],
          edit_clinic_business_hours:languageData.settings['edit_clinic_business_hours'],
          edit_clinic_open_hours:languageData.settings['edit_clinic_open_hours'],
          edit_clinic_close_hours:languageData.settings['edit_clinic_close_hours'],
          edit_clinic_monday:languageData.settings['edit_clinic_monday'],
          edit_clinic_tuesday:languageData.settings['edit_clinic_tuesday'],
          edit_clinic_wednesday:languageData.settings['edit_clinic_wednesday'],
          edit_clinic_thursday:languageData.settings['edit_clinic_thursday'],
          edit_clinic_friday:languageData.settings['edit_clinic_friday'],
          edit_clinic_Saturday:languageData.settings['edit_clinic_Saturday'],
          edit_clinic_sunday:languageData.settings['edit_clinic_sunday'],
          edit_clinic_delete_button:languageData.settings['edit_clinic_delete_button'],
          clinic_delete_warning:languageData.settings['clinic_delete_warning'],
          yes_option:languageData.settings['yes_option'],
          no_option:languageData.settings['no_option'],
          delete_confirmation:languageData.global['delete_confirmation'],
          editUsers_CancelBtn:languageData.settings['editUsers_CancelBtn'],
        //  showLoader: true
    })

        this.setState({showLoader: true})
        if(smsId){
          this.props.fetchSMSNotificationsPopups(smsId);
        }
    }

      componentDidUpdate(){
        var objDiv = document.getElementById("main-chat-outer");
        objDiv.scrollTop = objDiv.scrollHeight;
      }

      static getDerivedStateFromProps(props, state) {
          if (props.smsPopupData !== undefined && props.smsPopupData.status === 200 && props.smsPopupData.data.all_notifications !== state.smsPopupData ) {
          let returnState = {}
          returnState.showLoader = false
          returnState.from_number = (state.userChanged) ? state.from_number : props.smsPopupData.data.notification.from_number
          returnState.firstname = (state.userChanged) ? state.firstname : (state.firstname == '' || state.firstname == null ? '' : props.smsPopupData.data.notification.patient.firstname)
          returnState.lastname = (state.userChanged) ? state.lastname : (state.lastname == '' || state.lastname == null ? '' : props.smsPopupData.data.notification.patient.lastname)
          returnState.time_format=  (props.smsPopupData.data.time_format ?  props.smsPopupData.data.time_format : '' )
          returnState.smsPopupData = props.smsPopupData.data.all_notifications
          return returnState;
        }
      else
        return null;
      }

      handleInputChange = (event) => {
        const target = event.target;
        let value= target.value;
        this.setState({[event.target.name]: value, userChanged : true});
      }

      handleSubmit = (event) => {
        event.preventDefault();
        let formData = {
          id: this.props.match.params.id,
          reply: this.state.reply
        }

          this.setState({showLoader: true})
          this.props.createReply(formData, this.props.match.params.id);
          this.state.reply = "";
          this.refs.reply.value = "";
      }

      validateForm() {
        return this.state.reply.length > 0 ;
      }

      render(){
        return(
          <div id="content">
            <div className="container-fluid content setting-wrapper">
              <div className="wide-popup">
                <div className="modal-blue-header">
                  <Link to="/dashboard/sms-notifications" className="popup-cross">×</Link>
                    <span className={ (this.state.showLoader) ? "popup-blue-name no-display" : "popup-blue-name"}> { this.state.firstname === '' ? this.state.from_number : (this.state.firstname + '' + this.state.lastname) } - {this.state.SMS_Notifications_popup_IM_History}</span>
                </div>
                <div className="timezone-note col-xs-12 text-right">{this.state.SMS_Notifications_popup}</div>
                <div className="main-chat-outer" id="main-chat-outer">
                {
                  this.state.smsPopupData !== undefined && this.state.smsPopupData.map((obj, idx) => {
                  let displayDate = '';
                  let todaysDate = new Date();
                  let getTodaysDate = todaysDate.getDate();

                  if(obj.created === getTodaysDate ){
                    displayDate = getTodaysDate;
                  } else {
                    //displayDate = JSON.stringify(obj.created);
                    displayDate = obj.created;
                  }

                  let displayMessage = '';
                  if(obj.message_type === "message") {
                    displayMessage = obj.message;
                  }
                  else{
                    displayMessage = '' ;
                  }

                  let displayRightMessage = '';
                  if(obj.message_type === "reply") {
                    displayRightMessage = obj.message;
                  }
                  else{
                    displayRightMessage = '' ;
                  }

                  var imgUrl = obj.patient === null ? "/images/user.png" : obj.patient.user_image_url === '' ? " " : obj.patient.user_image_url ;
                  var leftdivStyle = {
                    backgroundImage: 'url(' + imgUrl + ')' , backgroundColor: '#dddddd'
                  }

                  var rimgUrl = obj.user === null ? "/images/user.png" : obj.user.user_image_url === '' ? " " : obj.user.user_image_url ;
                  var rightdivStyle = {
                    backgroundImage: 'url(' + rimgUrl + ')' , backgroundColor: '#dddddd'
                  }

                let name = obj.patient !== null ? obj.patient.firstname.charAt(0).toUpperCase() : '' ;
                let lname = obj.patient !== null ? obj.patient.lastname.charAt(0).toUpperCase() : '' ;

                let uname = obj.user !== null ? obj.user.firstname.charAt(0).toUpperCase() : '' ;
                let ulname = obj.user !== null ? obj.user.lastname.charAt(0).toUpperCase() : '' ;

                return (
                  <div key = {idx}>
                    <div className={ getTodaysDate !== obj.created ? "date-divider" : "no-display"} >
                      <span className = "chat-date">{showFormattedDate(displayDate, false, 'DD MMM YYYY')}</span>
                    </div>
                    <div className= { obj.message_type === "message" ? "left-chat-outer chat-div" : "no-display" } data-notty-id={146}>
                      <div className="sms-user-picture" style={leftdivStyle} />
                        {obj.patient !== null && obj.patient.user_image_url === '' ? <div className="sms-user-picture" >{name}{lname}</div> : <div className="sms-user-picture" style={leftdivStyle} /> }
                      <div className="chat-txt-gray">{displayMessage}</div>
                        <div className="chat-name ">{obj.patient === null ? obj.from_number : obj.patient.firstname === '' ? obj.from_number : (obj.patient.firstname.charAt(0).toUpperCase() + obj.patient.firstname.slice(1) + ' ' + obj.patient.lastname.charAt(0).toUpperCase() + obj.patient.lastname.slice(1) + ',') } <div className="chat-time">{this.state.time_format == 12 ? (showFormattedDate(obj.created, JSON.stringify(obj.created) , 'LT')) : (showFormattedDate(obj.created, JSON.stringify(obj.created) , ' hh:mm'))}</div></div>
                        </div>

                        <div className= { obj.message_type === "reply" ? "right-chat-outer chat-div" : "no-display" } data-notty-id={147}>
                          {
                            obj.user !== null && obj.user.user_image_url === '' ? <div className="sms-user-picture" >{uname}{ulname}</div> : <div className="sms-user-picture" style={rightdivStyle} /> }
                            <div className="chat-txt-gray">{displayRightMessage}</div>
                              <div className="chat-name ">{obj.user === null ? obj.from_number : obj.user.firstname === '' ? obj.from_number : (obj.user.firstname.charAt(0).toUpperCase() + obj.user.firstname.slice(1) + ' ' + obj.user.lastname.charAt(0).toUpperCase() + obj.user.lastname.slice(1) + ',') } <div className="chat-time">{this.state.time_format == 12 ? (showFormattedDate(obj.created, JSON.stringify(obj.created) , 'LT')) : (showFormattedDate(obj.created, JSON.stringify(obj.created) , ' hh:mm'))}</div></div>
                              </div>
                            </div>
                          );
                        })}
                    <form id="reply" name="reply-form" className="type-message" action="#" method="post" onSubmit={this.handleSubmit}>
                      <textarea className="reply-box" placeholder="Type a message..." value={this.state.reply} ref="reply" onChange={this.handleInputChange} name="reply" />
                        <input value="reply" type="submit" className={!this.validateForm() ? "header-select-btn reply-btn disable" : "header-select-btn reply-btn"}  disabled={!this.validateForm()} />
                    </form>
                    <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock chat-loader' : 'new-loader text-left'}>
                      <div className="loader-outer">
                        <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                        <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
                      </div>
                    </div>
                  </div>
                  <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display "}>{this.state.loading_please_wait_text}</div>
                </div>
              </div>
            </div>
        );
      }
    }

      function mapStateToProps(state){
        const languageData = JSON.parse(localStorage.getItem('languageData'));
        const returnState = {};
        if (state.DashboardReducer.action === "SELECTED_SMS_POPUPS") {
          {
            returnState.smsPopupData = state.DashboardReducer.data
          }
        }
        else if ( state.DashboardReducer.action === "CREATE_REPLY" ) {
          toast.dismiss();

          if ( state.DashboardReducer.data.status !== 200 ) {
            toast.error(languageData.global[state.DashboardReducer.data.message]);
          } else {
            {
              returnState.smsPopupData = state.DashboardReducer.data
            }
          }
          return returnState;
        }

        else {
          return {}
        }
          return returnState;
        }

        function mapDispatchToProps(dispatch)
        {
          return bindActionCreators({
            fetchSMSNotificationsPopups: fetchSMSNotificationsPopups, createReply: createReply
          }, dispatch)
        }

  export default connect(mapStateToProps,mapDispatchToProps) (SMSNotificationsPopup);
