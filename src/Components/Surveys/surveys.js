import React, { Component } from 'react';

import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import Sidebar from '../../../Containers/Settings/sidebar.js';

class Surveys extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
			showProcess: '',

		}

		this.state = {
			email: '',
			emailError: '',
			showProcess: '',
		};

    this.handleInputChange = this.handleInputChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

  handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [event.target.name]: value });
	}

  handleSubmit(event) {

		event.preventDefault();

		//====Frontend validation=================
		let error = false;
		this.setState({ emailError: "" });
		if (typeof this.state.email === undefined || this.state.email === null || this.state.email === '') {
			toast.error("Email can not be blank!");
			error = true;
		} else if (!validator.isEmail(this.state.email)) {
			toast.error("Incorrect email address");
			error = true;
		}

	   if (error === true) {
			return;
		}

		// //======End frontend validation=========

		this.setState({ showProcess: 1 });
		let formData = {
			email: this.state.email,
		}
    // alert('Please check you email for the link')

		this.props.UserResetPasswordForm(formData);
	}

  render() {
    return (
      <div classNameName="main protected">
        <div id="content">
      	  <div className="container-fluid content setting-wrapper">
            <Sidebar/>
      	      <div className="setting-left-menu">
      	      <div className="setting-title">Settings</div>
      	      <ul className="new-setting-tabs">
      		      <li className="new-setting-tabs-li">
      		        <a className="new-setting-tabs-a active-menu" href="javascript:void(0);">Account
              		Information <i className="fas fa-angle-down"></i></a>
              		<ul className="setting-submenu">
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a" data-loading="false"
              			data-title="Profile" data-url="/settings/profile"
              			href="javascript:void(0);" onclick="setting_menu(this)">Profile </a>
              			</li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a" data-loading="false"
              			data-title="two_factor" data-url="/settings/two_factor"
              			href="javascript:void(0);" onclick="setting_menu(this)">2FA Authentication
              			</a></li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a sel-submenu" data-loading="false"
              			data-title="Personal Information"
              			data-url="/settings/account_information" href="javascript:void(0);"
              			onclick="setting_menu(this)">AR Account</a> </li>
              		</ul>
              		</li>
              		<li className="new-setting-tabs-li"><a className="new-setting-tabs-a "
              		href="javascript:void(0);">Manage Your Clinics
              		<i className="fas fa-angle-right"></i></a>
              		<ul className="setting-submenu no-display">
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="true"
              			data-title="Manage Clinics" data-url="/settings/clinics"
              			href="javascript:void(0);" onclick="setting_menu(this)">Clinics</a>
              			</li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="true"
              			data-title="Questionnares" data-url="/settings/questionnaires"
              			href="javascript:void(0);" onclick="setting_menu(this)">Questionnaires</a>
              			</li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="true"
              			data-title="Consent" data-url="/settings/consents"
              			href="javascript:void(0);" onclick="setting_menu(this)">Consents</a>
              			</li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-title="Procedure Templates"
              			data-url="/settings/procedure_templates" href="javascript:void(0);"
              			onclick="setting_menu(this)">Procedure Templates</a> </li>
              		</ul>
              		</li>
              		<li className="new-setting-tabs-li"><a className="new-setting-tabs-a "
              		href="javascript:void(0);">Appointments <i className="fas fa-angle-right">
              		</i></a>
              		<ul className="setting-submenu no-display">
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-title="Post treatment instructions"
              			data-url="/settings/appointments_ajax" href="javascript:void(0);"
              			onclick="setting_menu(this)">Appointment Emails &amp; SMS</a> </li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-title="Post treatment instructions"
              			data-url="/appointments/Survey_email_sms"
              			href="javascript:void(0);" onclick="setting_menu(this)">Survey Settings</a>
              			</li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-title="Post treatment instructions"
              			data-url="/appointments/configure_uri" href="javascript:void(0);"
              			onclick="setting_menu(this)">Configure URL’s</a> </li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-title="Post treatment instructions"
              			data-url="/appointments/cancellation_policy"
              			href="javascript:void(0);" onclick="setting_menu(this)">Cancellation
              			Policy</a> </li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-title="Patient Portal  Access"
              			data-url="/appointments/patient_portal" href="javascript:void(0);"
              			onclick="setting_menu(this)">Patient Portal Access</a> </li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-url="/settings/appointment_reminder"
              			href="javascript:void(0);" onclick="setting_menu(this)">Patient Appointment
              			Reminders</a> </li>
              		</ul>
              		</li>
              		<li className="new-setting-tabs-li patients"><a className="new-setting-tabs-a "
              		data-loading="false"
              		data-url="/appointments/membership_and_wallet_setting"
              		href="javascript:void(0);" onclick="setting_menu(this)">Patients </a>
              		</li>
              		<li className="new-setting-tabs-li"><a className="new-setting-tabs-a "
              		href="javascript:void(0);">Teammates <i className="fas fa-angle-right"></i>
              		</a>
              		<ul className="setting-submenu no-display">
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="true"
              			data-title="Post treatment instructions" data-url="/settings/user"
              			href="javascript:void(0);" onclick="setting_menu(this)">Users</a>
              			</li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-title="Post treatment instructions" data-url="/settings/roles"
              			href="javascript:void(0);" onclick="setting_menu(this)">User Role</a>
              			</li>
              		</ul>
              		</li>
              		<li className="new-setting-tabs-li"><a className="new-setting-tabs-a "
              		href="javascript:void(0);">POS <i className="fas fa-angle-right"></i></a>
              		<ul className="setting-submenu no-display">
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-url="/settings/pos_dashboard" href="javascript:void(0);"
              			onclick="setting_menu(this)">Dashboard</a> </li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="true"
              			data-url="/settings/payments" href="javascript:void(0);"
              			onclick="setting_menu(this)">Payments</a> </li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="true"
              			data-url="/settings/payouts" href="javascript:void(0);"
              			onclick="setting_menu(this)">Payouts</a> </li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-url="/settings/pos" href="javascript:void(0);"
              			onclick="setting_menu(this)">POS Settings</a> </li>
              			<li className="new-setting-subtabs-li">
              			<a className="new-setting-subtabs-a " data-loading="false"
              			data-url="/settings/payment_settings" href="javascript:void(0);"
              			onclick="setting_menu(this)">Payment Settings</a> </li>
              		</ul>
              		</li>
              	</ul>
              </div>

              <div className="setting-setion">
      					<div className="setting-container">

      					<div className="setting-title">Appointment Survey Emails &amp; SMS</div>

      					    <div className="row" id="survey_email_sms">
      							<div className="col-md-6 col-xs-12">
      								<div className="row">
      									<div className="col-xs-12">
      										<div className="instruction-subtitle">Email</div>
      										<div className="setting-field-outer">
      											<div className="new-field-label">Email Message<span className="setting-require">*</span></div>

      										</div>
      									</div>
      								</div>
      							</div>

      							<div className="col-md-6 col-xs-12">
      								<div className="row">
      									<div className="col-xs-12">
      										<div className="instruction-subtitle">SMS</div>
      										<div className="setting-field-outer">
      											<div className="new-field-label">SMS Message<span className="setting-require">*</span></div>
      										</div>
      									</div>
      								</div>
      							</div>
      							<div className="col-md-12 col-xs-12">
      								<div className="row">
      									<div className="col-xs-12">
      										<div className="instruction-subtitle">Survey Thank You Page Content</div>
      										<div className="setting-field-outer">
      											<div className="new-field-label">CONTENT<span className="setting-require"></span></div>
      										</div>
      									</div>
      								</div>
      							</div>
      							<div className="col-md-12 col-xs-12">
      								<div className="row setting-variable">
      								<div className="col-md-4 col-xs-12">Patient Name: {/*{{PATIENTNAME}}*/}</div>
      								<div className="col-md-4 col-xs-12">Provider Name: {/*{{PROVIDERNAME}}*/}</div>
      								<div className="col-md-4 col-xs-12">Appointment Date Time: {/*{{APPOINTMENTDATETIME}}*/}</div>
      								<div className="col-md-4 col-xs-12">Clinic Name:{/*{{CLINICNAME}}*/}</div>
      								<div className="col-md-4 col-xs-12">Clinic Location:{/*{{CLINICLOCATION}}*/}</div>
      								<div className="col-md-4 col-xs-12">Survey Name:{/*{{SURVEYNAME}}*/} </div>
      								<div className="col-md-4 col-xs-12">Survey Service:{/*{{SURVEYSERVICE}}*/}</div>
      								<div className="col-md-4 col-xs-12">Survey Url:{/*{{SURVEYURL}}*/}</div>
      							</div>
      						</div>
      						</div>
      					</div>
      					<div className="footer-static">
      						<button className="new-blue-btn pull-right" id="surveyform">Save</button>
      					</div>
              </div>
      	    </div>
          </div>
      </div>
    );
  }
}

export default Surveys;
