import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types';
import config from '../../../../config';
import axios from 'axios';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import { getUser,userProfile, uploadImage,getPatientPortal,updatePatientPortal,activatePatientPortal, exportEmptyData, updateToggleAPI } from '../../../../Actions/Settings/settingsActions.js';

class PatientPortal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      patientData:{},
      portal_active_patients: '',
      portal_inactive_patients: null,
      patient_portal_activation_link: true,
      total_patients: null,
      userChanged:false,
      clinic_patient_portal_access_body:'',
      clinic_patient_portal_access_subject:'',
      hideBtns:false,
      showModal: false,
      patientData: {},
      showLoader: false
      };
      window.onscroll = () => {
        return false;
      }
      localStorage.setItem("showLoader", true);
  }
  componentDidMount() {
      window.onscroll = () => {
        return false;
      }
      let formData = {
      }
      const languageData = JSON.parse(localStorage.getItem('languageData'))
        this.setState({
          pp_total_clients: languageData.settings['pp_total_clients'],
          pp_active: languageData.settings['pp_active'],
          pp_inactive: languageData.settings['pp_inactive'],
          pp_active_email: languageData.settings['pp_active_email'],
          pp_email_sub: languageData.settings['pp_email_sub'],
          pp_email_body: languageData.settings['pp_email_body'],
          clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
          switch_label_text_enable: languageData.settings['switch_label_text_enable'],
          switch_label_text_disable: languageData.settings['switch_label_text_disable'],
          })
      this.showLoaderFunc()
      this.props.getPatientPortal();
  }

  componentWillUnmount() {
    toast.dismiss();
    this.setState({showLoader: false})
    this.props.exportEmptyData({});
  }

  showLoaderFunc = ()  => {
    this.setState({showLoader: true});
    localStorage.setItem("showLoader", true);
  }


  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
      return {showLoader : false};
     }
    if (props.patientData !== undefined && props.patientData.status === 200 && props.patientData.data != state.patientData ) {
      if(localStorage.getItem("showLoader") == "false") {
        return {
            portal_active_patients: (state.userChanged) ? state.portal_active_patients : props.patientData.data.portal_active_patients,
            portal_inactive_patients:(state.userChanged) ? state.portal_inactive_patients : props.patientData.data.portal_inactive_patients,
            total_patients:(state.userChanged) ? state.total_patients : props.patientData.data.total_patients,
            clinic_patient_portal_access_body:(state.userChanged) ? state.clinic_patient_portal_access_body : props.patientData.data.account_prefrence.clinic_patient_portal_access_body,
            clinic_patient_portal_access_subject:(state.userChanged) ? state.clinic_patient_portal_access_subject : props.patientData.data.account_prefrence.clinic_patient_portal_access_subject,
            patient_portal_activation_link:(state.userChanged) ? state.patient_portal_activation_link : props.patientData.data.account_prefrence.patient_portal_activation_link ? true : false ,
            showLoader: false,
            patientData : props.patientData.data
            };
        }
    }
    if (props.portalActivated == true && props.timeStamp != state.timeStamp) {
      if(localStorage.getItem("showLoader") == "false") {
          return {showLoader: false}
        }
    } else{
        return null;
    }
  }
  handleInputChange = (event) => {
      const target = event.target;
      let value= target.value;
      switch(target.type) {
          case 'checkbox': {
              value = target.checked;
          }
      }
      this.setState({
          [event.target.name]: value, userChanged : true
      });
  }

  handleToggleChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
        [event.target.name]: value, userChanged: true
      });
      let formData={
        patient_portal_activation_link: (this.state.patient_portal_activation_link) ? 0 : 1,
      }
      this.showLoaderFunc();
      this.props.updateToggleAPI(formData)
  }

  handleSubmit = (event,questionId) => {
    let error =false;
    this.setState({
      clinic_patient_portal_access_body_Error:false,
      clinic_patient_portal_access_Error:false,
    })
    if(typeof this.state.clinic_patient_portal_access_body === undefined || this.state.clinic_patient_portal_access_body === null || this.state.clinic_patient_portal_access_body === '' || this.state.clinic_patient_portal_access_body.trim() === ''){
      this.setState({
        clinic_patient_portal_access_body_Error:true
      })
      error=true;
    }
    if(typeof this.state.clinic_patient_portal_access_subject === undefined || this.state.clinic_patient_portal_access_subject === null || this.state.clinic_patient_portal_access_subject === '' || this.state.clinic_patient_portal_access_subject.trim() === ''){
         this.setState({
           clinic_patient_portal_access_subject_Error:true
         })
         error=true;
       }
    if (error === true) {
        return;
    }
    let formData={
      clinic_patient_portal_access_body:this.state.clinic_patient_portal_access_body,
      clinic_patient_portal_access_subject:this.state.clinic_patient_portal_access_subject
    }
    //this.setState({showModal: true})
    this.showLoaderFunc();
    this.props.updatePatientPortal(formData)
  }
  showDeleteModal = () => {
     this.setState({showModal: true})
  }

  dismissModal = () => {
     this.setState({showModal: false})
  }

  handleClick = () => {
     this.setState({showLoader: true, hideBtns : true})
     this.dismissModal();
     let cId = this.state.id;
     this.showLoaderFunc();
     this.props.activatePatientPortal()
  }

  render() {
    const{patientData}=this.props;
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <Sidebar/>
            <div className="setting-setion">
              <div className="setting-container">
                <div className="row portal-stats-outer">
                  <div className="col-sm-4 col-xs-12">
                    <div name="total_patients"  className="portal-numbers">{this.state.total_patients}</div>
                    <div className="patient-portal-label">Total number of clients</div>
                  </div>
                  <div className="col-sm-4 col-xs-12">
                    <div name="portal_active_patients"  className="portal-numbers">{this.state.portal_active_patients}</div>
                    <div  className="patient-portal-label">Client portal is active</div>
                  </div>
                  <div className="col-sm-4 col-xs-12">
                    <div name="portal_inactive_patients" className="portal-numbers">{this.state.portal_inactive_patients}</div>
                      <div className="patient-portal-label">Client portal is inactive</div>
                        <a className="new-white-btn confirm-model" data-message="Are you sure you want to activate patient portal for all clients? <br>(It may take few hours to activate)" data-dismiss="modal" onClick={this.showDeleteModal} data-confirm-url="/settings/toggle_portal_access">Activate Now</a>
                        <div className={(this.state.showModal ? 'overlay' : '')}></div>
                          <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                            <div className="modal-dialog">
                              <div className="modal-content">
                                <div className="modal-header">
                                  <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                                  <h4 className="modal-title" id="model_title">Confirmation required!{this.state.showModal}</h4>
                                </div>
                                <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                                Are you sure you want to activate patient portal for all clients?
                                (It may take few hours to activate)
                                </div>
                                  <div className="modal-footer" >
                                  <div className="col-md-12 text-left" id="footer-btn">

                                  <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>No</button>
                                  <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.handleClick}>Yes</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="setting-title m-b-60">Client Portal Activation Email Content<a title="Your very own patient portal" className="help-icon">?</a>
                      <div class="pull-right activateEmail">
                      <label className="setting-switch pull-right">
                        <input type="checkbox" id="patient_portal_activation_link" className="setting-custom-switch-input" name="patient_portal_activation_link" checked={(this.state.patient_portal_activation_link) ? 'checked' : false} onChange={this.handleToggleChange} />
                      <span className="setting-slider"></span></label>
                      <span class="factor_status">{(this.state.patient_portal_activation_link) ? this.state.switch_label_text_enable : this.state.switch_label_text_disable}</span>

                      </div>
                    </div>
                  <form id="ppform" className= {this.state.patient_portal_activation_link ? "form-horizontal form-label-left" : "no-display"} acceptCharset="utf-8" noValidate="novalidate">
                    <div className="row">
                      <div className="col-lg-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">Email Subject<span className="setting-require">*</span></div>
                          <div className="setting-input-outer"><input placeholder="Email Subject" type="text" id="ppmail_subject" className={this.state.clinic_patient_portal_access_subject_Error === true ? "setting-input-box field_error" : "setting-input-box"} autoComplete="off" onChange={this.handleInputChange} name="clinic_patient_portal_access_subject" value={this.state.clinic_patient_portal_access_subject} /></div>
                        </div>
                      </div>
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">Email body <span className="setting-require">*</span></div>
                          <textarea className={this.state.clinic_patient_portal_access_body_Error === true ? "setting-textarea-box field_error" : "setting-textarea-box"} id="ppmail_body" placeholder="Email Body" name="clinic_patient_portal_access_body" onChange={this.handleInputChange} style={{height: '90px'}} value={this.state.clinic_patient_portal_access_body} />
                        </div>
                      </div>
                    </div>
                  </form></div>
                <div className={ this.state.patient_portal_activation_link ? "footer-static" : 'no-display'}>
                  <button className="new-blue-btn pull-right ppmail_save" onClick={this.handleSubmit} id="ppmail_save">Save</button>
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
    );
  }
}


function mapStateToProps(state) {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const returnState = {};
    localStorage.setItem("showLoader", false);
    if (state.SettingReducer.action === "GET_PATIENT_PORTAL") {
      if(state.SettingReducer.data.status != 200) {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      } else {
        returnState.patientData = state.SettingReducer.data;
      }
    }
    if (state.SettingReducer.action === "UPDATE_PATIENT_PORTAL") {
      if(state.SettingReducer.data.status != 200){
        toast.success(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false;
      } else {
        returnState.user = state.SettingReducer.data;
        toast.success(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false;
      }
    }
    if (state.SettingReducer.action === "PATIENT_PORTAL") {
      if(state.SettingReducer.data.status != 200){
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false;
      } else {
        toast.success(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false;
      }
    }
    if (state.SettingReducer.action === "ACTIVATE_PATIENT_PORTAL") {
      if(state.SettingReducer.data.status != 200){
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false;
      } else {
        toast.success(languageData.global[state.SettingReducer.data.message]);
        returnState.portalActivated = true;
        returnState.timeStamp = new Date();
      }
    }
    return returnState;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      getPatientPortal:getPatientPortal,
      updatePatientPortal:updatePatientPortal,
      activatePatientPortal:activatePatientPortal,
      exportEmptyData:exportEmptyData,
      updateToggleAPI: updateToggleAPI
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PatientPortal);
