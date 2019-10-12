import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { getAppointment, updateAppointment} from '../../Actions/Settings/settingsActions.js';
import AppointmentConfigSidebar from './AppointmentConfigSidebar.js';
import AppointmentHeader from './AppointmentHeader.js';

class AppointmentCommunication extends Component {

  constructor(props) {
    super(props);

    const langData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      langData: langData,
      appointmentData: {},
      clinicList: [],
      appointment_cancel_status: false,
      appointment_booking_status: false,
      appointment_reschedule_status: false,
      appointment_reminder_status: false,
      userChanged: false,
      specialInstruction: true,
      bookingConfirmation: false,
      cancellationConfirmation: false,
      appointmentReminder: false,
      bookingEmail: true,
      bookingSMS: false,
      cancellationEmail: true,
      cancellationSMS: false,
      reminderEmail: true,
      surveyEmailMsg: true,
      reminderSMS: false,
      surveySMS: false,
      rescheduleEmail: true,
      rescheduleSMS:false,
      appointment_booking_emailClass: 'newtextareaField',
      from_emailClass : 'newInputField',
      appointment_booking_smsClass : 'newtextareaField',
      appointment_canceled_emailClass : 'newtextareaField',
      appointment_canceled_smsClass: 'newtextareaField',
      appointment_reschedule_emailClass: 'newtextareaField',
      appointment_survey_emailClass: 'newtextareaField',
      appointment_reschedule_smsClass: 'newtextareaField',
      reminder_email_subjectClass: 'newtextareaField',
      reminder_emailClass: 'newtextareaField',
      reminder_smsClass: 'newtextareaField',
      reminder_smsClassError: 'newtextareaField field-error',
      checkboxClosed: 'switch-accordian-row closed',
      checkboxOn: 'switch-accordian-row',

      clinic_name: '',
      contact_no: '',
      city: '',
      country: '',
      address: '',
      tax: '',
      status: true,
      appointment_notification_emails: '',
      clinic_color: '',
      sms_notifications_phone: '',
      reminder_email_subject: '',
      reminder_sms: '',
      reminder_email: '',
      appointment_reminder: '',
      from_email: '',
      appointment_booking_email: '',
      appointment_booking_sms: '',
      appointment_canceled_email: '',
      appointment_canceled_sms: '',
      email_special_instructions: '',
      appointment_reschedule_email: '',
      appointment_reschedule_sms: '',
      appointment_reminder_email_subject: '',
      appointment_reminder_sms: '',
      appointment_reminder_email_body: '',
      AppointmentCancelEnable: 'setting-container',
      AppointmentCancelDisable: 'setting-container no-display',
      showLoader: false
    };
  }

  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      AppointmentEmailSMS_Special_Instructions: languageData.settings['AppointmentEmailSMS_Special_Instructions'],
      AppointmentEmailSMS_From_Email: languageData.settings['AppointmentEmailSMS_From_Email'],
      AppointmentEmailSMS_Instructions: languageData.settings['AppointmentEmailSMS_Instructions'],
      AppointmentEmailSMS_Appointment_Booking_Confirmation: languageData.settings['AppointmentEmailSMS_Appointment_Booking_Confirmation'],
      Survey_email: languageData.settings['Survey_email'],
      survey_email_message: languageData.settings['survey_email_message'],
      survey_sms: languageData.settings['survey_sms'],
      survey_sms_message: languageData.settings['survey_sms_message'],
      AppointmentEmailSMS_Appointment_Cancellation_Confirmation: languageData.settings['AppointmentEmailSMS_Appointment_Cancellation_Confirmation'],
      AppointmentEmailSMS_Appointment_Reschedule_Confirmation: languageData.settings['AppointmentEmailSMS_Appointment_Reschedule_Confirmation'],
      AppointmentEmailSMS_Appointment_Reminder: languageData.settings['AppointmentEmailSMS_Appointment_Reminder'],
      editUsers_CancelBtn: languageData.settings['editUsers_CancelBtn'],
      AppointmentEmailSMS_Submitbtn: languageData.settings['AppointmentEmailSMS_Submitbtn'],
      AppointmentEmailSMS_Your_Demo_Clinic: languageData.settings['AppointmentEmailSMS_Your_Demo_Clinic'],
      AppointmentEmailSMS_EMAIL_SUBJECT:  languageData.settings['AppointmentEmailSMS_EMAIL_SUBJECT'],
      AppointmentEmailSMS_EMAIL_BODY:  languageData.settings['AppointmentEmailSMS_EMAIL_BODY'],
      editUsers_CancelBtn:  languageData.settings['editUsers_CancelBtn'],
      AppointmentEmailSMS_Patient_Name: languageData.settings['AppointmentEmailSMS_Patient_Name'],
      AppointmentEmailSMS_Special_Appointment_Date_Time:  languageData.settings['AppointmentEmailSMS_Special_Appointment_Date_Time'],
      clinics_Clinic_Name:  languageData.settings['clinics_Clinic_Name'],
      AppointmentEmailSMS_Special_Clinic_Location: languageData.settings['AppointmentEmailSMS_Special_Clinic_Location'],
      AppointmentEmailSMS_Clinic_Instructions: languageData.settings['AppointmentEmailSMS_Clinic_Instructions'],
      AppointmentEmailSMS_Booked_Services: languageData.settings['AppointmentEmailSMS_Booked_Services'],
      AppointmentEmailSMS_Cancellation_Fee_Charge_Days: languageData.settings['AppointmentEmailSMS_Cancellation_Fee_Charge_Days'],
      AppointmentEmailSMS_Cancellation_Fee: languageData.settings['AppointmentEmailSMS_Cancellation_Fee'],
      AppointmentEmailSMS_InstructionsLabel: languageData.settings['AppointmentEmailSMS_InstructionsLabel'],
      AppointmentEmailSMS_Provider_Name: languageData.settings['AppointmentEmailSMS_Provider_Name'],
      AppointmentEmailSMS_Business_Name: languageData.settings['AppointmentEmailSMS_Business_Name'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      user_save_btn_text: languageData.settings['user_save_btn_text'],
      booking_status_enable: languageData.settings['booking_status_enable'],
      booking_status_disable: languageData.settings['booking_status_disable'],
      appointment_cancellation_disable: languageData.settings['appointment_cancellation_disable'],
      appointment_cancellation_enable: languageData.settings['appointment_cancellation_enable'],
      appointment_reminder_disable: languageData.settings['appointment_reminder_disable'],
      appointment_reminder_enable: languageData.settings['appointment_reminder_enable'],
      appointment_reschedule_enable: languageData.settings['appointment_reschedule_enable'],
      appointment_reschedule_disable: languageData.settings['appointment_reschedule_disable'],
      showLoader: true
  })
    this.setState({'showLoader': true});
    this.props.getAppointment();
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value= target.value;
    switch(target.type) {
        case 'checkbox': {
            value = target.checked;
            break;
        }

    }
    let statusArr = ['appointment_cancel_status', 'appointment_booking_status', 'appointment_reminder_status', 'appointment_reschedule_status']
    if(statusArr.indexOf(target.name) > -1) {
      let formData = {}
      formData.account_details = {}
      formData.account_details[target.name] = value;
      this.setState({showLoader: true})
      this.props.updateAppointment(formData);
    } else {
      this.setState({[event.target.name]: value , userChanged : true});
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();

    //----------------------------------------------------------Front-End Validation---------------------------------------------------------

    let error = false;
    let regularExpression  = /^[a-zA-Z]$/;

    this.setState({
        from_emailError: false,
        appointment_booking_emailError : false,
        appointment_booking_smsError : false,
        appointment_canceled_emailError : false,
        appointment_canceled_smsError: false,
        appointment_reschedule_emailError: false,
        appointment_reschedule_smsError: false,
        reminder_email_subjectError: false,
        reminder_emailError: false,
        reminder_smsError: false
    });


    if(this.state.specialInstruction) {
      if (this.state.from_email != '' && !validator.isEmail(this.state.from_email)) {
          toast.error("Incorrect email address");
          this.setState({
            from_emailError: true,
            from_emailClassError: 'newInputField field-error'
          })
          error = true;
      } else if (this.state.from_email) {
          this.setState({
              from_emailError: false,
              from_emailErrorClass: 'newInputField'
          })
      }
    }

    if(this.state.appointmentReminder) {
      if (typeof this.state.reminder_sms === undefined || this.state.reminder_sms === null || this.state.reminder_sms === '' || this.state.reminder_sms.trim() === '') {
        this.setState({
          reminder_smsError: true,
          reminder_smsClassError: 'newtextareaField field-error'
        })
        error = true;
      }else if(this.state.reminder_sms) {
        this.setState({
          reminder_smsError: false,
          reminder_smsErrorClass: 'newtextareaField'
        })
      }

      if (typeof this.state.reminder_email === undefined || this.state.reminder_email === null || this.state.reminder_email === '' || this.state.reminder_email.trim() === '') {
        this.setState({
          reminder_emailError: true,
          reminder_emailClassError: 'newtextareaField field-error'
        })
        error = true;
      }else if(this.state.reminder_email)
      {
      this.setState({
        reminder_emailError: false,
        reminder_emailErrorClass: 'newtextareaField'
      })
    }

      if (typeof this.state.reminder_email_subject === undefined || this.state.reminder_email_subject === null || this.state.reminder_email_subject === '' || this.state.reminder_email_subject.trim() === '') {
        this.setState({
          reminder_email_subjectError: true,
          reminder_email_subjectClassError: 'newtextareaField field-error'
        })
        error = true;
      }else if(this.state.reminder_email_subject)
        {
        this.setState({
          reminder_email_subjectError: false,
          reminder_email_subjectErrorClass: 'newtextareaField'
        })
      }
    }

      if(this.state.appointmentReschedule){
            if (typeof this.state.appointment_reschedule_sms === undefined || this.state.appointment_reschedule_sms === null || this.state.appointment_reschedule_sms === '' || this.state.appointment_reschedule_sms.trim() === '') {
              this.setState({
                appointment_reschedule_smsError: true,
                appointment_reschedule_smsClassError: 'newtextareaField field-error'
              })
              error = true;
            }else if(this.state.appointment_reschedule_sms)
            {
            this.setState({
              appointment_reschedule_smsError: false,
              appointment_reschedule_smsErrorClass: 'newtextareaField'
            })
          }

            if (typeof this.state.appointment_reschedule_email === undefined || this.state.appointment_reschedule_email === null || this.state.appointment_reschedule_email === '' || this.state.appointment_reschedule_email.trim() === '') {
              this.setState({
                appointment_reschedule_emailError: true,
                appointment_reschedule_emailClassError: 'newtextareaField field-error'
              })
              error = true;
            }else if(this.state.appointment_reschedule_email)
            {
            this.setState({
              appointment_reschedule_emailError: false,
              appointment_reschedule_emailErrorClass: 'newtextareaField'
            })
          }
        }

      if(this.state.cancellationEmail) {
          if (typeof this.state.appointment_canceled_sms === undefined || this.state.appointment_canceled_sms === null || this.state.appointment_canceled_sms === '' || this.state.appointment_canceled_sms.trim() === '') {
            this.setState({
              appointment_canceled_smsError: true,
              appointment_canceled_smsClassError: 'newtextareaField field-error'
            })
            error = true;
          }else if(this.state.appointment_canceled_sms)
          {
          this.setState({
            appointment_canceled_smsError: false,
            appointment_canceled_smsErrorClass: 'newtextareaField'
          })
        }

          if (typeof this.state.appointment_canceled_email === undefined || this.state.appointment_canceled_email === null || this.state.appointment_canceled_email === '' || this.state.appointment_canceled_email.trim() === '') {
            this.setState({
              appointment_canceled_emailError: true,
              appointment_canceled_emailClassError: 'newtextareaField field-error'
            })
            error = true;
          }else if(this.state.appointment_canceled_email)
          {
          this.setState({
            appointment_canceled_emailError: false,
            appointment_canceled_emailErrorClass: 'newtextareaField'
          })
        }
      }

    if(this.state.bookingConfirmation) {
          if (typeof this.state.appointment_booking_sms === undefined || this.state.appointment_booking_sms === null || this.state.appointment_booking_sms === ''
        || this.state.appointment_booking_sms.trim() === '') {
            this.setState({
              appointment_booking_smsError: true,
              appointment_booking_smsClassError: 'newtextareaField field-error'
            })
            error = true;
          }else if(this.state.appointment_booking_sms)
          {
          this.setState({
            appointment_booking_smsError: false,
            appointment_booking_smsErrorClass: 'newtextareaField'
          })
        }

          if (typeof this.state.appointment_booking_email === undefined || this.state.appointment_booking_email === null || this.state.appointment_booking_email === '' || this.state.appointment_booking_email.trim() === '') {
            this.setState({
              appointment_booking_emailError: true,
              appointment_booking_emailClassError : 'newtextareaField field-error'
            })
            error = true;
          }
          else if(this.state.appointment_booking_email)
          {
          this.setState({
            appointment_booking_emailError : false,
            appointment_booking_emailClass : 'newtextareaField'
          })
        }
    }
  if(this.state.surveyEmail){
    if (typeof this.state.appointment_survey_email === undefined || this.state.appointment_survey_email === null || this.state.appointment_survey_email === '' || this.state.appointment_survey_email.trim() === '') {
        this.setState({
          appointment_survey_email_Error: true });
        error = true;
      }
    if (typeof this.state.appointment_survey_sms === undefined || this.state.appointment_survey_sms === null || this.state.appointment_survey_sms === '' || this.state.appointment_survey_sms.trim() === '') {
      this.setState({
        appointment_survey_sms_Error: true });
      error = true;
    }
  }

  if(error) {
    return;
  }
  //-----------------------------------------------------------End of Validation ------------------------------------------------------------
    let formData = {}
      formData.account_details = {};
      if(this.state.specialInstruction) {
        formData.clinics = [];
        if(this.state.clinicList != undefined  && this.state.clinicList.length > 0){
          formData.clinics = this.state.clinicList.map((obj, idx) => {
            return {id:obj.id, email_special_instructions:this.state['email_special_instructions-'+obj.id]};
        })}
        formData.account_details.account_preference = {}
        formData.account_details.account_preference.from_email = this.state.from_email
      }

      if(this.state.bookingConfirmation) {
        formData.account_details.appointment_booking_email = this.state.appointment_booking_email
        formData.account_details.appointment_booking_sms = this.state.appointment_booking_sms
        formData.account_details.appointment_booking_status = this.state.appointment_booking_status
      }
      if(this.state.cancellationConfirmation) {
        formData.account_details.appointment_canceled_email = this.state.appointment_canceled_email
        formData.account_details.appointment_canceled_sms = this.state.appointment_canceled_sms
        formData.account_details.appointment_cancel_status = this.state.appointment_cancel_status
      }
      if(this.state.appointmentReschedule) {
        formData.account_details.appointment_reschedule_email = this.state.appointment_reschedule_email
        formData.account_details.appointment_reschedule_sms = this.state.appointment_reschedule_sms
        formData.account_details.appointment_reschedule_status = this.state.appointment_reschedule_status
      }
      if(this.state.appointmentReminder) {
        formData.account_details.account_preference = {}
        formData.account_details.account_preference.reminder_email_subject = this.state.reminder_email_subject
        formData.account_details.account_preference.reminder_email = this.state.reminder_email
        formData.account_details.account_preference.reminder_sms = this.state.reminder_sms
        formData.account_details.appointment_reminder_status = this.state.appointment_reminder_status

      }
      if(this.state.surveyEmail) {
        formData.account_details.account_preference = {}
        formData.account_details.appointment_survey_email = this.state.appointment_survey_email
        formData.account_details.appointment_survey_sms = this.state.appointment_survey_sms
        formData.account_details.account_preference.survey_thankyou_message = this.state.survey_thankyou_message
      }

    this.setState({showLoader: true})
    this.props.updateAppointment(formData);
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {};
    console.log(state.appointmentDataTimeStamp, props.appointmentDataTimeStamp);
    if (props.appointmentData != undefined && props.appointmentData.data !== state.appointmentData && props.appointmentDataTimeStamp != state.appointmentDataTimeStamp) {
            if(props.appointmentData.data.clinics.length) {
          props.appointmentData.data.clinics.map((obj, idx) => {
            returnState['email_special_instructions-'+obj.id] = obj.email_special_instructions;
          })
        }
        let accData = props.appointmentData.data.account_details.account_preference;
        returnState.appointment_survey_email = (state.userChanged) ? state.appointment_survey_email : props.appointmentData.data.account_details.appointment_survey_email;
        returnState.appointment_survey_sms = (state.userChanged) ? state.appointment_survey_sms : props.appointmentData.data.account_details.appointment_survey_sms;
        returnState.survey_thankyou_message = (state.userChanged) ? state.survey_thankyou_message : props.appointmentData.data.account_details.account_preference.survey_thankyou_message;
        returnState.from_email = (state.userChanged) ? state.from_email : accData.from_email ? accData.from_email : '' ;
        returnState.appointment_booking_status = props.appointmentData.data.account_details.appointment_booking_status;
        returnState.appointment_booking_email = (state.userChanged) ? state.appointment_booking_email :  props.appointmentData.data.account_details.appointment_booking_email;
        returnState.appointment_booking_sms = (state.userChanged) ? state.appointment_booking_sms :  props.appointmentData.data.account_details.appointment_booking_sms;
        returnState.appointment_cancel_status =props.appointmentData.data.account_details.appointment_cancel_status;
        returnState.appointment_canceled_email = (state.userChanged) ? state.appointment_canceled_email :  props.appointmentData.data.account_details.appointment_canceled_email;
        returnState.appointment_canceled_sms= props.appointmentData.data.account_details.appointment_canceled_sms;
        returnState.appointment_reschedule_status = props.appointmentData.data.account_details.appointment_reschedule_status;
        returnState.appointment_reschedule_email= (state.userChanged) ? state.appointment_reschedule_email :  props.appointmentData.data.account_details.appointment_reschedule_email;
        returnState.appointment_reschedule_sms = (state.userChanged) ? state.appointment_reschedule_sms :  props.appointmentData.data.account_details.appointment_reschedule_sms;
        returnState.appointment_reminder_status =  props.appointmentData.data.account_details.appointment_reminder_status;
        returnState.reminder_email_subject = (state.userChanged) ? state.reminder_email_subject :  accData.reminder_email_subject;
        returnState.reminder_email = (state.userChanged) ? state.reminder_email :  accData.reminder_email;
        returnState.reminder_sms = (state.userChanged) ? state.reminder_sms :  accData.reminder_sms;
        returnState.email_special_instructions = (state.userChanged) ? state.email_special_instructions : accData.email_special_instructions;
        returnState.clinicList = (state.userChanged) ? state.clinicList : props.appointmentData.data.clinics;
        returnState.showLoader = false;
        returnState.appointmentDataTimeStamp = props.appointmentDataTimeStamp;
      }
    return returnState
  }

  changeTab = (mode) => {
    var modeArr = ['specialInstruction', 'bookingConfirmation', 'appointmentReminder', 'cancellationConfirmation', 'appointmentReschedule', 'surveyEmail'];
    let returnState = {}
    if(modeArr.indexOf(mode) > -1) {
      returnState[mode] = true;
    }

    modeArr.splice(modeArr.indexOf(mode),1);

    modeArr.map((obj, idx) => {
      returnState[obj] = false;
    })
    this.setState(returnState);
  }

  changeInternalTab = (mode) => {
    if(mode == 'bookingEmail') {
      this.setState({bookingEmail: true, bookingSMS: false})
    } else if (mode == 'bookingSMS') {
      this.setState({bookingSMS: true, bookingEmail: false})
    }else if (mode == 'cancellationEmail') {
      this.setState({cancellationEmail: true, cancellationSMS: false})
    }else if (mode == 'cancellationSMS') {
      this.setState({cancellationSMS: true, cancellationEmail: false})
    }else if (mode == 'reminderEmail') {
      this.setState({reminderEmail: true, reminderSMS: false})
    }else if (mode == 'reminderSMS') {
      this.setState({reminderSMS: true, reminderEmail: false})
    }else if (mode == 'rescheduleEmail') {
      this.setState({rescheduleEmail: true, rescheduleSMS: false})
    }else if (mode == 'rescheduleSMS') {
      this.setState({rescheduleSMS: true, rescheduleEmail: false})
    }else if (mode == 'surveyEmailMsg') {
      this.setState({surveyEmailMsg: true, surveySMS: false})
    }else if (mode == 'surveySMS') {
      this.setState({surveyEmailMsg: false, surveySMS: true})
    }
  }
  render(){
    var clinicName = [];
    if(this.state.clinicList != undefined  && this.state.clinicList.length > 0){
      clinicName = this.state.clinicList.map((obj, idx) => {
        return (<div className="col-sm-6 col-xs-12" key={idx}>
        <div className="newInputFileldOuter m-b-40">
          <div className="newInputLabel">{obj.clinic_name}</div>
          <input type="hidden" name="clinic_ids[]" defaultValue={1} />
          <textarea name={'email_special_instructions-'+obj.id}  className="newtextareaField" placeholder={"Clinic "+this.state.langData['appointments']['app-instructions']} value={this.state['email_special_instructions-'+obj.id] || ""}  cols={30} rows={6} style={{height: '130px', resize: 'none'}} onChange={this.handleInputChange} />     </div>
      </div>)
    })}
    return(
        <div id="content">
        <div className="container-fluid content setting-wrapper">
        <AppointmentHeader activeMenuTag={'config'}/>
          <AppointmentConfigSidebar />
          <form  name="appointment_Sms_And_Email-form" className="nobottommargin" action="#" method="post" onSubmit={this.handleSubmit}>
            <div className="setting-setion">
              <div className="appointment-container">
                <div className="juvly-title">{this.state.langData['appointments']['app-communications']}</div>

                <ul className="appointment-tabs communication-tabs">
                  <li >
                    <a  onClick={this.changeTab.bind(this,'specialInstruction')} className={(this.state.specialInstruction) ? "active" : ""}>{this.state.langData['appointments']['app-special-instructions']}
                    </a>
                  </li>
                  <li >
                    <a onClick={this.changeTab.bind(this,'bookingConfirmation')} className={(this.state.bookingConfirmation) ? "active" : ""} >{this.state.langData['appointments']['app-booking-email']}
                    </a>
                  </li>
                  <li>
                    <a onClick={this.changeTab.bind(this,'cancellationConfirmation')} className={(this.state.cancellationConfirmation) ? "active" : ""}>{this.state.langData['appointments']['app-cancellation-email']}
                    </a>
                  </li>
                  <li>
                    <a onClick={this.changeTab.bind(this,'appointmentReminder')} className={(this.state.appointmentReminder) ? "active" : ""}>{this.state.langData['appointments']['app-reminder-email']}
                    </a>
                  </li>
                  <li>
                    <a onClick={this.changeTab.bind(this,'appointmentReschedule')} className={(this.state.appointmentReschedule) ? "active" : ""}>{this.state.langData['appointments']['app-reshcedule-email']}
                    </a>
                  </li>
                  <li>
                    <a onClick={this.changeTab.bind(this,'surveyEmail')} className={(this.state.surveyEmail) ? "active" : ""}>{this.state.langData['appointments']['app-survey-email']}
                    </a>
                  </li>
                </ul>


              <div className={(this.state.specialInstruction) ? "specialInstruction" : "no-display"}>
                <div className="row m-b-40">
                  <div className="col-md-5 col-xs-12">
                    <div className="newInputFileldOuter m-b-30">
                      <div className="newInputLabel">{this.state.AppointmentEmailSMS_From_Email}<span className="setting-require" /></div>
                      <div className="setting-input-outer">
                      <input type="text" name="from_email" className={(this.state.from_emailError === true ) ? this.state.from_emailClassError : this.state.from_emailClass }  value={this.state.from_email || ''} autoComplete="off" onChange={this.handleInputChange} /></div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  {clinicName}
                </div>
              </div>

              <div className={(this.state.bookingConfirmation) ? "bookingConfirmation" : "no-display"}>
                <div className="row">
                  <div className="col-md-12 col-xs-12">
                    <div className={(this.state.appointment_booking_status==true) ? this.state.checkboxOn: this.state.checkboxClosed} id="book">
                      {this.state.AppointmentEmailSMS_Appointment_Booking_Confirmation}<a title="Your Appointment Booking Confirmation Email/SMS" className="help-icon m-t-0">?</a>
                      <label className="setting-switch pull-right">
                        <input type="checkbox" name="appointment_booking_status" className="setting-custom-switch-input" checked= {(this.state.appointment_booking_status) ? 'checked': false} value={this.state.appointment_booking_status || ''} onChange={this.handleInputChange} />
                        <span className="setting-slider" />

                      </label>
                      <span className="factor_status">{(this.state.appointment_booking_status) ? this.state.booking_status_enable : this.state.booking_status_disable}</span>
                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">

                    <ul className="appointment-tabs">
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'bookingEmail')} className={(this.state.bookingEmail) ? "active" : ""}>{this.state.langData['appointments']['app-']}{this.state.langData['appointments']['app-email']}</a>
                      </li>
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'bookingSMS')} className={(this.state.bookingSMS) ? "active" : ""}>{this.state.langData['appointments']['app-']}{this.state.langData['appointments']['app-sms']}</a>
                      </li>
                    </ul>

                    <div className="newInputFileldOuter m-b-40">
                      <div className="newInputLabel">{this.state.langData['appointments']['app-instructions']}</div>
                      <textarea placeholder="Email Message" rows={10} name="appointment_booking_email" className={this.state.bookingEmail ? ((this.state.appointment_booking_emailError === true && this.state.appointment_booking_status) ? this.state.appointment_booking_emailClassError : this.state.appointment_booking_emailClass ) : "no-display"} value={this.state.appointment_booking_email || ""} onChange={this.handleInputChange} style={{resize: 'none'}}  />
                      <textarea placeholder="SMS Message" name = "appointment_booking_sms" value = {this.state.appointment_booking_sms || ""}
                          rows={10} className={this.state.bookingSMS ? (this.state.appointment_booking_smsError === true ? this.state.appointment_booking_smsClassError : this.state.appointment_booking_smsClass ) : "no-display"} onChange={this.handleInputChange} style={{resize: 'none'}} />

                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <div className="AppointmentSubtitle">{this.state.langData['appointments']['app-snippets']}</div>
                    <div className="setting-variable snippets m-b-40">
                      <p><b>{this.state.AppointmentEmailSMS_Patient_Name}:</b> {'{'}{'{'}PATIENTNAME{'}'}{'}'} </p>
                      <p><b>{this.state.AppointmentEmailSMS_Provider_Name}:</b> {'{'}{'{'}PROVIDERNAME{'}'}{'}'} </p>
                      <p ><b>{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}:</b> {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'} </p>
                      <p><b>{this.state.clinics_Clinic_Name}:</b>{'{'}{'{'}CLINICNAME{'}'}{'}'} </p>
                      <p><b>{this.state.AppointmentEmailSMS_Special_Clinic_Location}:</b>{'{'}{'{'}CLINICLOCATION{'}'}{'}'} </p>
                      <p><b>{this.state.AppointmentEmailSMS_Clinic_Instructions}:</b>{'{'}{'{'}CLINICINSTRUCTIONS{'}'}{'}'} </p>
                      <p><b>{this.state.AppointmentEmailSMS_Booked_Services}:</b>{'{'}{'{'}BOOKEDSERVICES{'}'}{'}'} </p>
                      <p><b>{this.state.AppointmentEmailSMS_Cancellation_Fee_Charge_Days}:</b>{'{'}{'{'}CANFEECHARGEDAYS{'}'}{'}'} </p>
                      <p><b>{this.state.AppointmentEmailSMS_Cancellation_Fee}:</b>{'{'}{'{'}CANCELATIONFEES{'}'}{'}'} </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={(this.state.cancellationConfirmation) ? "cancellationConfirmation" : "no-display"}>
                <div className="row">
                  <div className="col-md-12 col-xs-12">
                    <div className={(this.state.appointment_cancel_status==true) ? this.state.checkboxOn: this.state.checkboxClosed} id="cancel">
                      {this.state.AppointmentEmailSMS_Appointment_Cancellation_Confirmation}<a title="Your Appointment Cancellation Confirmation Email/SMS" className="help-icon m-t-0">?</a>
                      <label className="setting-switch pull-right">
                        <input type="checkbox" name="appointment_cancel_status" className="setting-custom-switch-input" checked= {(this.state.appointment_cancel_status) ? 'checked': false} value={this.state.appointment_cancel_status || ''} onChange={this.handleInputChange} />
                        <span className="setting-slider" />
                      </label>
                      <span className="factor_status">{(this.state.appointment_cancel_status) ? this.state.appointment_cancellation_enable : this.state.appointment_cancellation_disable}</span>
                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <ul className="appointment-tabs">
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'cancellationEmail')} className={(this.state.cancellationEmail) ? "active" : ""}>{this.state.langData['appointments']['app-email']}</a>
                      </li>
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'cancellationSMS')} className={(this.state.cancellationSMS) ? "active" : ""}>{this.state.langData['appointments']['app-sms']}</a>
                      </li>
                    </ul>
                    <div className="newInputFileldOuter m-b-40">
                      <div className="newInputLabel">{this.state.langData['appointments']['app-instructions']}</div>
                      <textarea className={this.state.cancellationEmail ? (this.state.appointment_canceled_emailError === true ? this.state.appointment_canceled_emailClassError : this.state.appointment_canceled_emailClass ) : "no-display"} placeholder="Email Message" id="appointment_canceled_email" name="appointment_canceled_email" value = {this.state.appointment_canceled_email || ""} onChange={this.handleInputChange} rows={10} style={{resize: 'none'}} />
                      <textarea className={this.state.cancellationSMS ? (this.state.appointment_canceled_smsError === true ? this.state.appointment_canceled_smsClassError : this.state.appointment_canceled_smsClass) : "no-display" } placeholder="SMS Message" id="appointment_canceled_sms" value= {this.state.appointment_canceled_sms || ""} rows={10} name="appointment_canceled_sms" onChange={this.handleInputChange} style={{resize: 'none'}} />                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <div className="AppointmentSubtitle">{this.state.langData['appointments']['app-snippets']}</div>
                    <div className="setting-variable snippets m-b-40">
                      <p><b>{this.state.AppointmentEmailSMS_Patient_Name}:</b> {'{'}{'{'}PATIENTNAME{'}'}{'}'}</p>
                      <p ><b>{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}:</b> {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'} &nbsp;&nbsp;</p>
                      <p><b>{this.state.clinics_Clinic_Name}:</b>{'{'}{'{'}CLINICNAME{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Special_Clinic_Location}:</b>{'{'}{'{'}CLINICLOCATION{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Clinic_Instructions}:</b>{'{'}{'{'}CLINICINSTRUCTIONS{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Booked_Services}:</b>{'{'}{'{'}BOOKEDSERVICES{'}'}{'}'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={(this.state.appointmentReminder) ? "appointmentReminder" : "no-display"}>
                <div className="row">
                  <div className="col-md-12 col-xs-12">
                    <div className={(this.state.appointment_reminder_status==true) ? this.state.checkboxOn: this.state.checkboxClosed} id="reminder">
                      {this.state.AppointmentEmailSMS_Appointment_Reminder}<a title="Your Appointment Reminder Email/SMS" className="help-icon m-t-0">?</a>
                      <label className="setting-switch pull-right">
                        <input type="checkbox" name="appointment_reminder_status" className="setting-custom-switch-input" checked= {(this.state.appointment_reminder_status) ? 'checked': false} value={this.state.appointment_reminder_status || ''} onChange={this.handleInputChange} />
                        <span className="setting-slider" />
                      </label>
                      <span className="factor_status">{(this.state.appointment_reminder_status) ? this.state.appointment_reminder_enable : this.state.appointment_reminder_disable}</span>
                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <ul className="appointment-tabs">
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'reminderEmail')} className={(this.state.reminderEmail) ? "active" : ""}>{this.state.langData['appointments']['app-email']}</a>
                      </li>
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'reminderSMS')} className={(this.state.reminderSMS) ? "active" : ""}>{this.state.langData['appointments']['app-sms']}</a>
                      </li>
                    </ul>
                    <div className={(this.state.reminderEmail) ? "newInputFileldOuter m-b-30" : "newInputFileldOuter m-b-30 no-display"}>
                        <div className={(this.state.reminderEmail) ? "newInputLabel" : "newInputLabel no-display"}>Email Subject</div>
                        <input className={this.state.reminderEmail ? (this.state.reminder_email_subjectError && this.state.appointment_reminder_status == 1 ? this.state.reminder_email_subjectClassError : this.state.reminder_email_subjectClass) : "no-display" } placeholder="Email Subject" name="reminder_email_subject" value ={this.state.reminder_email_subject || ''} type="text"  onChange={this.handleInputChange} />
                    </div>

                    <div className="newInputFileldOuter m-b-40">
                      <div className="newInputLabel">{this.state.langData['appointments']['app-instructions']}</div>
                      <textarea className={this.state.reminderEmail ? (this.state.reminder_emailError === true ? this.state.reminder_emailClassError : this.state.reminder_emailClass ) : "no-display"} placeholder="Email Body" name="reminder_email" id="reminder_email" value = {this.state.reminder_email || "" } onChange={this.handleInputChange} contenteditable="true" rows={10} style={{height: '210px', resize: 'none'}} />
                      <textarea className={this.state.reminderSMS ? (this.state.reminder_smsError === true ? this.state.reminder_smsClassError : this.state.reminder_smsClass ) : "no-display"} placeholder="SMS Message" name = "reminder_sms" id = "reminder_sms" rows={10} value =
                            {this.state.reminder_sms || ""}
                            onChange={this.handleInputChange} style={{height: '162px', resize: 'none'}}/>


                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <div className="AppointmentSubtitle">{this.state.langData['appointments']['app-snippets']}</div>
                    <div className="setting-variable snippets m-b-40">
                      <p><b>{this.state.AppointmentEmailSMS_Patient_Name}:</b> {'{'}{'{'}PATIENTNAME{'}'}{'}'}</p>
                      <p ><b>{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}:</b> {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'} &nbsp;&nbsp;</p>
                      <p><b>{this.state.clinics_Clinic_Name}:</b>{'{'}{'{'}CLINICNAME{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Special_Clinic_Location}:</b>{'{'}{'{'}CLINICLOCATION{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Clinic_Instructions}:</b>{'{'}{'{'}CLINICINSTRUCTIONS{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Cancellation_Fee_Charge_Days}:</b>{'{'}{'{'}CANFEECHARGEDAYS{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Cancellation_Fee}:</b>{'{'}{'{'}CANCELATIONFEES{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Business_Name}:</b>{'{'}{'{'}BUSINESSNAME{'}'}{'}'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={(this.state.appointmentReschedule) ? "appointmentReschedule" : "no-display"}>
                <div className="row">
                  <div className="col-md-12 col-xs-12">
                    <div className={(this.state.appointment_reschedule_status==true) ? this.state.checkboxOn: this.state.checkboxClosed} id="reschedule">
                      {this.state.AppointmentEmailSMS_Appointment_Reschedule_Confirmation}<a title="Your Appointment Reschedule Confirmation Email/SMS" className="help-icon m-t-0">?</a>
                      <label className="setting-switch pull-right">
                        <input type="checkbox" name="appointment_reschedule_status" className="setting-custom-switch-input" checked= {(this.state.appointment_reschedule_status) ? 'checked': false} value={this.state.appointment_reschedule_status || ''} onChange={this.handleInputChange} />
                        <span className="setting-slider" />
                      </label>
                      <span className="factor_status">{(this.state.appointment_reschedule_status) ? this.state.appointment_reschedule_enable : this.state.appointment_reschedule_disable}</span>
                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <ul className="appointment-tabs">
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'rescheduleEmail')} className={(this.state.rescheduleEmail) ? "active" : ""}>{this.state.langData['appointments']['app-email']}</a>
                      </li>
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'rescheduleSMS')} className={(this.state.rescheduleSMS) ? "active" : ""}>{this.state.langData['appointments']['app-sms']}</a>
                      </li>
                    </ul>
                    <div className="newInputFileldOuter m-b-40">
                      <div className="newInputLabel">{this.state.langData['appointments']['app-instructions']}</div>
                      <textarea className={this.state.rescheduleEmail ?  (this.state.appointment_reschedule_emailError === true && this.state.appointment_reschedule_status ? this.state.appointment_reschedule_emailClassError : this.state.appointment_reschedule_emailClass ) : "no-display"} placeholder="Email Message" id="appointment_reschedule_email" rows={10} name="appointment_reschedule_email" value = {this.state.appointment_reschedule_email || ""} onChange={this.handleInputChange} style={{height: '310px', resize: 'none'}} />
                      <textarea className={this.state.rescheduleSMS ? (this.state.appointment_reschedule_smsError === true ? this.state.appointment_reschedule_smsClassError : this.state.appointment_reschedule_smsClass ) : "no-display"} placeholder="SMS Message" id="appointment_reschedule_sms" value = {this.state.appointment_reschedule_sms || ""} rows={10}  name="appointment_reschedule_sms" onChange={this.handleInputChange} style={{height: '162px', resize: 'none'}} />
                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <div className="AppointmentSubtitle">{this.state.langData['appointments']['app-snippets']}</div>
                    <div className="setting-variable snippets m-b-40">
                      <p><b>{this.state.AppointmentEmailSMS_Patient_Name}:</b> {'{'}{'{'}PATIENTNAME{'}'}{'}'}</p>
                      <p ><b>{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}:</b> {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'} &nbsp;&nbsp;</p>
                      <p><b>{this.state.clinics_Clinic_Name}:</b>{'{'}{'{'}CLINICNAME{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Special_Clinic_Location}:</b>{'{'}{'{'}CLINICLOCATION{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Clinic_Instructions}:</b>{'{'}{'{'}CLINICINSTRUCTIONS{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Cancellation_Fee_Charge_Days}:</b>{'{'}{'{'}CANFEECHARGEDAYS{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Cancellation_Fee}:</b>{'{'}{'{'}CANCELATIONFEES{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Business_Name}:</b>{'{'}{'{'}BUSINESSNAME{'}'}{'}'}</p>
                      <br />{this.state.AppointmentEmailSMS_Business_Name}: {'{'}{'{'}BUSINESSNAME{'}'}{'}'}
                    </div>
                  </div>
                </div>
              </div>

              <div className={(this.state.surveyEmail) ? "surveyEmail" : "no-display"}>
                <div className="row">
                  <div className="col-md-6 col-xs-12">
                    <ul className="appointment-tabs">
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'surveyEmailMsg')} className={(this.state.surveyEmailMsg) ? "active" : ""}>{this.state.langData['appointments']['app-email']}</a>
                      </li>
                      <li >
                        <a  onClick={this.changeInternalTab.bind(this, 'surveySMS')} className={(this.state.surveySMS) ? "active" : ""}>{this.state.langData['appointments']['app-sms']}</a>
                      </li>
                    </ul>
                    <div className="newInputFileldOuter m-b-40">
                      <div className="newInputLabel">{this.state.langData['appointments']['app-instructions']}</div>
                      <textarea onChange={this.handleInputChange} id="appointment_survey_email" placeholder="Email Message" rows="10" name="appointment_survey_email" value={this.state.appointment_survey_email} className={this.state.surveyEmailMsg ?  (this.state.appointment_survey_email_Error === true  ? "newtextareaField field-error" : "newtextareaField" ) : "no-display"} style={{height: "250px", resize: 'none'}}></textarea>
                      <textarea className={this.state.surveySMS ?  (this.state.appointment_survey_sms_Error === true  ? "newtextareaField field-error" : "newtextareaField" ) : "no-display"} placeholder="SMS Message" name = "appointment_survey_sms" id = "appointment_survey_sms" rows={10} value ={this.state.appointment_survey_sms || ""}  onChange={this.handleInputChange} style={{height: '162px', resize: 'none'}}/>
                    </div>
                    <div className="newInputFileldOuter m-b-40">
                      <div className="newInputLabel">{this.state.langData['appointments']['app-survey-thankyou']}</div>
                      <textarea onChange={this.handleInputChange} id="survey_thankyou_message" placeholder="Content" name="survey_thankyou_message" rows="10" value={this.state.survey_thankyou_message} className="newtextareaField" style={{height: "210px", resize: 'none'}}></textarea>
                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <div className="AppointmentSubtitle">{this.state.langData['appointments']['app-snippets']}</div>
                    <div className="setting-variable snippets m-b-40">
                      <p><b>{this.state.AppointmentEmailSMS_Patient_Name}:</b> {'{'}{'{'}PATIENTNAME{'}'}{'}'}</p>
                      <p><b>Provider Name:</b> {'{'}{'{'}PROVIDERNAME{'}'}{'}'}</p>
                      <p ><b>{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}:</b> {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'} &nbsp;&nbsp;</p>
                      <p><b>{this.state.clinics_Clinic_Name}:</b>{'{'}{'{'}CLINICNAME{'}'}{'}'}</p>
                      <p><b>{this.state.AppointmentEmailSMS_Special_Clinic_Location}:</b>{'{'}{'{'}CLINICLOCATION{'}'}{'}'}</p>
                      <p><b>Survey Name:</b>{'{'}{'{'}SURVEYNAME{'}'}{'}'}</p>
                      <p><b>Survey Service:</b>{'{'}{'{'}SURVEYSERVICE{'}'}{'}'}</p>
                      <p><b>Survey Url:</b>{'{'}{'{'}SURVEYURL{'}'}{'}'}</p>
                    </div>
                  </div>
                </div>
              </div>



{/*              <div className="switch-accordian-outer">
                              <div className={(this.state.appointment_booking_status == true) ? this.state.checkboxOn: this.state.checkboxClosed} id="book">
                                {this.state.AppointmentEmailSMS_Appointment_Booking_Confirmation}<a title="Your Appointment Booking Confirmation Email/SMS" className="help-icon">?</a>
                                <label className="setting-switch pull-right">
                                  <input type="checkbox" name="appointment_booking_status" className="setting-custom-switch-input" checked= {(this.state.appointment_booking_status) ? 'checked': false} value={this.state.appointment_booking_status || ''} onChange={this.handleInputChange} />
                                  <span className="setting-slider" />
                                </label>
                              </div>
                              <div className={(this.state.appointment_booking_status==true) ? this.state.AppointmentCancelEnable: this.state.AppointmentCancelDisable} id="Appointment_Booking-form-title">
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="instruction-subtitle">{this.state.Survey_email}</div>
                                    <div className="setting-field-outer">
                                      <div className="new-field-label">{this.state.survey_email_message}<span className="setting-require">*</span></div>
                                      <textarea placeholder="Email Message" rows={10} name="appointment_booking_email" className={(this.state.appointment_booking_emailError === true && this.state.appointment_booking_status) ? this.state.appointment_booking_emailClassError : this.state.appointment_booking_emailClass } value={this.state.appointment_booking_email || ""} onChange={this.handleInputChange} style={{height: '310px'}}  />
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="instruction-subtitle">{this.state.survey_sms}</div>
                                    <div className="setting-field-outer">
                                      <div className="new-field-label">{this.state.survey_sms_message}<span className="setting-require">*</span></div>
                                      <textarea placeholder="SMS Message" name = "appointment_booking_sms" value = {this.state.appointment_booking_sms || ""}
                                        rows={10} className={this.state.appointment_booking_smsError === true ? this.state.appointment_booking_smsClassError : this.state.appointment_booking_smsClass } onChange={this.handleInputChange} style={{resize: 'none', width: '100%', height: '182px'}} />
                                    </div>
                                  </div>
                                </div>
                                <div className="row setting-variable">
                                  <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Patient_Name}: {'{'}{'{'}PATIENTNAME{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Provider_Name}: {'{'}{'{'}PROVIDERNAME{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}: {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'}
                                  </div>
                                  <div className="col-md-4 col-sm-12">{this.state.clinics_Clinic_Name}:{'{'}{'{'}CLINICNAME{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Special_Clinic_Location}:{'{'}{'{'}CLINICLOCATION{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Clinic_Instructions}:{'{'}{'{'}CLINICINSTRUCTIONS{'}'}{'}'}
                                  </div>
                                  <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Booked_Services}:{'{'}{'{'}BOOKEDSERVICES{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Cancellation_Fee_Charge_Days}:{'{'}{'{'}CANFEECHARGEDAYS{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Cancellation_Fee}:{'{'}{'{'}CANCELATIONFEES{'}'}{'}'}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="switch-accordian-outer">
                              <div className={(this.state.appointment_cancel_status==true) ? this.state.checkboxOn: this.state.checkboxClosed} id="cancel">
                                {this.state.AppointmentEmailSMS_Appointment_Cancellation_Confirmation}<a title="Your Appointment Cancellation Confirmation Email/SMS" className="help-icon">?</a>
                                <label className="setting-switch pull-right">
                                  <input type="checkbox" name="appointment_cancel_status" className="setting-custom-switch-input" checked= {(this.state.appointment_cancel_status) ? 'checked': false} value={this.state.appointment_cancel_status || ''} onChange={this.handleInputChange} />
                                  <span className="setting-slider" />
                                </label>
                              </div>
                            </div>
                            <div className= {(this.state.appointment_cancel_status==true) ? this.state.AppointmentCancelEnable: this.state.AppointmentCancelDisable} id="Appointment_Cancel_Booking">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="instruction-subtitle">{this.state.Survey_email}</div>
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.survey_email_message}<span className="setting-require">*</span></div>
                                    <textarea className={this.state.appointment_canceled_emailError === true ? this.state.appointment_canceled_emailClassError : this.state.appointment_canceled_emailClass } placeholder="Email Message" id="appointment_canceled_email" name="appointment_canceled_email"
                                    value = {this.state.appointment_canceled_email || ""} onChange={this.handleInputChange}
                                    rows={10} style={{height: '330px'}} />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="instruction-subtitle">{this.state.survey_sms}</div>
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.survey_sms_message}<span className="setting-require">*</span></div>
                                    <textarea className={this.state.appointment_canceled_smsError === true ? this.state.appointment_canceled_smsClassError : this.state.appointment_canceled_smsClass } placeholder="SMS Message" id="appointment_canceled_sms" value= {this.state.appointment_canceled_sms || ""} rows={10}
                                    name="appointment_canceled_sms" onChange={this.handleInputChange} style={{height: '162px'}} />
                                  </div>
                                </div>
                              </div>
                              <div className="row setting-variable">
                                <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Patient_Name}: {'{'}{'{'}PATIENTNAME{'}'}{'}'}
                                  <br />{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}: {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'}
                                  <br />{this.state.clinics_Clinic_Name}:{'{'}{'{'}CLINICNAME{'}'}{'}'}
                                </div>
                                <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Special_Clinic_Location}:{'{'}{'{'}CLINICLOCATION{'}'}{'}'}
                                  <br />{this.state.AppointmentEmailSMS_Clinic_Instructions}:{'{'}{'{'}CLINICINSTRUCTIONS{'}'}{'}'}
                                  <br />{this.state.AppointmentEmailSMS_Booked_Services}:{'{'}{'{'}BOOKEDSERVICES{'}'}{'}'}
                                </div>
                              </div>
                            </div>
                            <div className="switch-accordian-outer">
                              <div className={(this.state.appointment_reschedule_status==true) ? this.state.checkboxOn: this.state.checkboxClosed} id="reschedule">
                                {this.state.AppointmentEmailSMS_Appointment_Reschedule_Confirmation}<a title="Your Appointment Reschedule Confirmation Email/SMS" className="help-icon">?</a>
                                <label className="setting-switch pull-right">
                                  <input type="checkbox" name="appointment_reschedule_status" className="setting-custom-switch-input" checked= {(this.state.appointment_reschedule_status) ? 'checked': false} value={this.state.appointment_reschedule_status || ''} onChange={this.handleInputChange} />
                                  <span className="setting-slider" />
                                </label>
                              </div>
                            </div>
                            <div className= {(this.state.appointment_reschedule_status==true) ? this.state.AppointmentCancelEnable: this.state.AppointmentCancelDisable} id="appointment_reschedule">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="instruction-subtitle">{this.state.Survey_email}</div>
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.survey_email_message}<span className="setting-require">*</span></div>
                                    <textarea className={this.state.appointment_reschedule_emailError === true && this.state.appointment_reschedule_status ? this.state.appointment_reschedule_emailClassError : this.state.appointment_reschedule_emailClass } placeholder="Email Message" id="appointment_reschedule_email" rows={10} name="appointment_reschedule_email" value = {this.state.appointment_reschedule_email || ""} onChange={this.handleInputChange} style={{height: '310px'}} />
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="instruction-subtitle">{this.state.survey_sms}</div>
                                  <div className="setting-field-outer">
                                    <div className="new-field-label">{this.state.survey_sms_message}<span className="setting-require">*</span></div>
                                    <textarea className={this.state.appointment_reschedule_smsError === true ? this.state.appointment_reschedule_smsClassError : this.state.appointment_reschedule_smsClass } placeholder="SMS Message" id="appointment_reschedule_sms" value = {this.state.appointment_reschedule_sms || ""} rows={10}  name="appointment_reschedule_sms" onChange={this.handleInputChange} style={{height: '162px'}} />
                                  </div>
                                </div>
                              </div>
                              <div className="row setting-variable">
                                <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Patient_Name}: {'{'}{'{'}PATIENTNAME{'}'}{'}'}
                                  <br />{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}: {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'}
                                  <br />{this.state.clinics_Clinic_Name}:{'{'}{'{'}CLINICNAME{'}'}{'}'}
                                </div>
                                <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Special_Clinic_Location}:{'{'}{'{'}CLINICLOCATION{'}'}{'}'}
                                  <br />{this.state.AppointmentEmailSMS_Clinic_Instructions}:{'{'}{'{'}CLINICINSTRUCTIONS{'}'}{'}'}
                                  <br />{this.state.AppointmentEmailSMS_Booked_Services}:{'{'}{'{'}BOOKEDSERVICES{'}'}{'}'}
                                </div>
                                <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Cancellation_Fee_Charge_Days}:{'{'}{'{'}CANFEECHARGEDAYS{'}'}{'}'}
                                  <br />{this.state.AppointmentEmailSMS_Cancellation_Fee}:{'{'}{'{'}CANCELATIONFEES{'}'}{'}'}
                                </div>
                              </div>
                            </div>
                            <div className="switch-accordian-outer">
                              <div className={(this.state.appointment_reminder_status==true) ? this.state.checkboxOn: this.state.checkboxClosed} id="reminder">
                                {this.state.AppointmentEmailSMS_Appointment_Reminder}<a title="Your Appointment Reminder Email/SMS" className="help-icon">?</a>
                                <label className="setting-switch pull-right">
                                  <input type="checkbox" name="appointment_reminder_status" className="setting-custom-switch-input" checked= {(this.state.appointment_reminder_status) ? 'checked': false} value={this.state.appointment_reminder_status || ''} onChange={this.handleInputChange} />
                                  <span className="setting-slider" />
                                </label>
                              </div>
                              <div className={(this.state.appointment_reminder_status==true) ? this.state.AppointmentCancelEnable: this.state.AppointmentCancelDisable} id="appointment_reminder_container">
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="row">
                                      <div className="col-sm-12">
                                        <div className="instruction-subtitle">{this.state.Survey_email}</div>
                                        <div className="setting-field-outer">
                                          <div className="new-field-label">{this.state.AppointmentEmailSMS_EMAIL_SUBJECT}<span className="setting-require">*</span></div>
                                          <input className={this.state.reminder_email_subjectError && this.state.appointment_reminder_status == 1 ? this.state.reminder_email_subjectClassError : this.state.reminder_email_subjectClass } placeholder="Email Subject" name="reminder_email_subject" value =
                                          {this.state.reminder_email_subject || ''}
                                          type="text"  onChange={this.handleInputChange} />
                                        </div>
                                      </div>
                                      <div className="col-sm-12">
                                        <div className="setting-field-outer">
                                          <div className="new-field-label">{this.state.AppointmentEmailSMS_EMAIL_BODY}<span className="setting-require">*</span></div>
                                          <textarea className={this.state.reminder_emailError === true ? this.state.reminder_emailClassError : this.state.reminder_emailClass } placeholder="Email Body" name="reminder_email" id="reminder_email" value = {this.state.reminder_email || "" } onChange={this.handleInputChange} contenteditable="true" rows={10} style={{height: '210px'}} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="row">
                                      <div className="col-sm-12">
                                        <div className="instruction-subtitle">{this.state.survey_sms}</div>
                                        <div className="setting-field-outer">
                                          <div className="new-field-label">{this.state.survey_sms_message}</div>
                                          <textarea className={this.state.reminder_smsError === true ? this.state.reminder_smsClassError : this.state.reminder_smsClass } placeholder="SMS Message" name = "reminder_sms" id = "reminder_sms" rows={10}
                                          value =
                                          {this.state.reminder_sms || ""}
                                          onChange={this.handleInputChange} style={{height: '162px'}} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="row setting-variable">
                                  <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Patient_Name}: {'{'}{'{'}PATIENTNAME{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Special_Appointment_Date_Time}: {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'}
                                    <br />{this.state.clinics_Clinic_Name}:{'{'}{'{'}CLINICNAME{'}'}{'}'}
                                  </div>
                                  <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Special_Clinic_Location}:{'{'}{'{'}CLINICLOCATION{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Clinic_Instructions}:{'{'}{'{'}CLINICINSTRUCTIONS{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Booked_Services}:{'{'}{'{'}BOOKEDSERVICES{'}'}{'}'}
                                  </div>
                                  <div className="col-md-4 col-sm-12">{this.state.AppointmentEmailSMS_Cancellation_Fee_Charge_Days}:{'{'}{'{'}CANFEECHARGEDAYS{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Cancellation_Fee}:{'{'}{'{'}CANCELATIONFEES{'}'}{'}'}
                                    <br />{this.state.AppointmentEmailSMS_Business_Name}: {'{'}{'{'}BUSINESSNAME{'}'}{'}'}
                                  </div>
                                </div>
                              </div>
                            </div>
              */}



            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
              </div>
            </div>

            </div>
            <div className="footer-static">
                <a className="new-blue-btn pull-right" onClick={this.handleSubmit}>Save</a>
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
  toast.dismiss();
  if (state.SettingReducer.action === "APPOINTMENT_GET") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.appointmentData = state.SettingReducer.data;
      returnState.appointmentDataTimeStamp = new Date();
    }
  }

  if (state.SettingReducer.action === "APPOINTMENT_UPDATE") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.appointmentDataTimeStamp = new Date();
      returnState.appointmentData = state.SettingReducer.data;
      toast.success(languageData.global[state.SettingReducer.data.message]);
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      getAppointment: getAppointment,
      updateAppointment: updateAppointment
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(AppointmentCommunication);
