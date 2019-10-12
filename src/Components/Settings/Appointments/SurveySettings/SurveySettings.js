import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import axios from 'axios';
import config from '../../../../config.js';
import {getAppointmentSurveys,postAppointmentSurveys} from '../../../../Actions/Settings/appointmentActions.js';


class SurveySettings extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
      userChanged:false,
      email: '',
      emailError: '',
			showProcess: '',
      survey_thankyou_message:'',
      appointment_survey_sms:'',
      appointment_survey_email:'',
      surveyData:{},
      showLoader: false
		}
	}
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      Appointment_survey_settings_header:languageData.settings['Appointment_survey_settings_header'],
      Survey_email:languageData.settings['Survey_email'],
      survey_email_message:languageData.settings['survey_email_message'],
      survey_sms:languageData.settings['survey_sms'],
      survey_sms_message:languageData.settings['survey_sms_message'],
      survey_thank_you:languageData.settings['survey_thank_you'],
      survey_content:languageData.settings['survey_content'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      showLoader: true

    })
    this.props.getAppointmentSurveys();

  }
  static getDerivedStateFromProps(props, state) {

      if (props.surveyData !== undefined && props.surveyData.status === 200) {

          return {
              appointment_survey_email: (state.userChanged) ? state.appointment_survey_email : props.surveyData.data.account_details.appointment_survey_email,
              appointment_survey_sms: (state.userChanged) ? state.appointment_survey_sms : props.surveyData.data.account_details.appointment_survey_sms,
              survey_thankyou_message: (state.userChanged) ? state.survey_thankyou_message : props.surveyData.data.account_details.account_preference.survey_thankyou_message,
              showLoader: false


          };
      }  else
          return null;
  }
  handleInputChange =(event)=> {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [event.target.name]: value ,userChanged : true});
	}

  handleSubmit=(event) =>{

		event.preventDefault();
this.setState({
  appointment_survey_email_Error: false,
appointment_survey_sms_Error: false  });
		//====Frontend validation=================
	let error = false;
		this.setState({ emailError: "" });
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

	if (error === true) {
			return;
		}

		// //======End frontend validation=========


		let formData = {
      account_details:{
			appointment_survey_email: this.state.appointment_survey_email,
      appointment_survey_sms: this.state.appointment_survey_sms,
      account_preference:{
      survey_thankyou_message: this.state.survey_thankyou_message,

}
}
		}
  this.props.postAppointmentSurveys(formData)

	}


  render() {
    return (
      <div className="main protected">
      <div id="content">
      	<div className="container-fluid content setting-wrapper">
<Sidebar/>
          <div className="setting-setion">
      					<div className="setting-container">

      					<div className="setting-title">{this.state.Appointment_survey_settings_header}</div>

      					    <div className="row" id="survey_email_sms">
      							<div className="col-md-6 col-xs-12">
      								<div className="row">
      									<div className="col-xs-12">
      										<div className="instruction-subtitle">{this.state.Survey_email}</div>
      										<div className="setting-field-outer">
      											<div className="new-field-label">{this.state.survey_email_message}<span className="setting-require">*</span></div>
                            <textarea onChange={this.handleInputChange} id="appointment_survey_email" placeholder="Email Message" rows="10" name="appointment_survey_email" value={this.state.appointment_survey_email} className={this.state.appointment_survey_email_Error === true ? "setting-textarea-box field_error" :"setting-textarea-box "} style={{height: "250px"}}></textarea>
      										</div>
      									</div>
      								</div>
      							</div>

      							<div className="col-md-6 col-xs-12">
      								<div className="row">
      									<div className="col-xs-12">
      										<div className="instruction-subtitle">{this.state.survey_sms}</div>
      										<div className="setting-field-outer">
      											<div className="new-field-label">{this.state.survey_sms_message}<span className="setting-require">*</span></div>
                            <textarea onChange={this.handleInputChange} id="appointment_survey_sms" placeholder="SMS Message" name="appointment_survey_sms" rows="10" className={this.state.appointment_survey_sms_Error === true ? "setting-textarea-box field_error" :"setting-textarea-box "} value={this.state.appointment_survey_sms} style={{height: "110px"}}>
                            </textarea>
      										</div>
      									</div>
      								</div>
      							</div>

      							<div className="col-md-12 col-xs-12">
      								<div className="row">
      									<div className="col-xs-12">
      										<div className="instruction-subtitle">{this.state.survey_thank_you}</div>
      										<div className="setting-field-outer">
      											<div className="new-field-label">{this.state.survey_content}<span className="setting-require"></span></div>
                            <textarea onChange={this.handleInputChange} id="survey_thankyou_message" placeholder="Content" name="survey_thankyou_message" rows="10" value={this.state.survey_thankyou_message} className="setting-textarea-box" style={{height: "210px"}}></textarea>
                        	</div>
      									</div>
      								</div>
      							</div>

      							<div className="col-md-12 col-xs-12">
      								<div className="row setting-variable">
      								<div className="col-md-4 col-xs-12">Patient Name: {'{'}{'{'}PATIENTNAME{'}'}{'}'}</div>
      								<div className="col-md-4 col-xs-12">Provider Name: {'{'}{'{'}PROVIDERNAME{'}'}{'}'}</div>
      								<div className="col-md-4 col-xs-12">Appointment Date Time: {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'}</div>
      								<div className="col-md-4 col-xs-12">Clinic Name:{'{'}{'{'}CLINICNAME{'}'}{'}'}</div>
      								<div className="col-md-4 col-xs-12">Clinic Location:{'{'}{'{'}CLINICLOCATION{'}'}{'}'}</div>
      								<div className="col-md-4 col-xs-12">Survey Name:{'{'}{'{'}SURVEYNAME{'}'}{'}'} </div>
      								<div className="col-md-4 col-xs-12">Survey Service:{'{'}{'{'}SurveySERVICE{'}'}{'}'}</div>
      								<div className="col-md-4 col-xs-12">Survey Url:{'{'}{'{'}SURVEYURL{'}'}{'}'}</div>
      							</div>
      						</div>
      						</div>
      					</div>

      					<div className="footer-static">
      						<button className="new-blue-btn pull-right" id="surveyform" onClick={this.handleSubmit}>Save</button>
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
function mapStateToProps(state){
  const languageData =JSON.parse(localStorage.getItem('languageData'));
  const returnState ={};
  if(state.AppointmentReducer.action === "APPOINTMENT_SURVEY_UPDATE"){
    if(state.AppointmentReducer.data.status == 200){
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
    }
  }
  if(state.AppointmentReducer.action === "APPOINTMENT_SURVEY_LIST"){
    if(state.AppointmentReducer.data.status !=200){

      toast.error(languageData.global[state.AppointmentReducer.data.message]);

    }
    else {
      returnState.surveyData = state.AppointmentReducer.data;

    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    getAppointmentSurveys:getAppointmentSurveys,
    postAppointmentSurveys:postAppointmentSurveys
  },dispatch)
}

export default connect(mapStateToProps,mapDispatchToProps)(SurveySettings);
