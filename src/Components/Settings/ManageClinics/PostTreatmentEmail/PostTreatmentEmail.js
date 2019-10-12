import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types';
import ImageUploader from 'react-images-upload';
import config from '../../../../config.js';
import axios from 'axios';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import IntlTelInput from 'react-intl-tel-input';
import { getUser,userProfile, uploadImage,getPostTreatmentEmail,postEmailUpdate } from '../../../../Actions/Settings/settingsActions.js';
import {SketchField, Tools} from 'react-sketch';


class PostTreatmentEmail extends Component{
  constructor(props){
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));

    this.state={
      post_treatment_subject:'',
      post_treatment_body:'',
      userChanged:false,
      emailList: {},
      userId: userData.user.id,
      isDisabled: true,
      buttonChange:'Edit',
      save:'new-blue-btn pull-right save',
      edit:'new-blue-btn pull-right edit',
      showLoader: false,
      subjectError: false,
      bodyError: false
    }
  }
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      post_treatment_email:languageData.settings['post_treatment_email'],
      post_treatment_email_Subject:languageData.settings['post_treatment_email_Subject'],
      post_treatment_email_body:languageData.settings['post_treatment_email_body'],
      post_treatment_header:languageData.settings['post_treatment_header'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
    })
    this.setState({'showLoader': true});
    this.props.getPostTreatmentEmail();
  }

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
      if (props.emailList !== undefined && props.emailList != state.emailList) {
          return {
              emailList:props.emailList,
              post_treatment_subject: (state.userChanged) ? state.post_treatment_subject : props.emailList.data.post_treatment_subject,
              post_treatment_body: (state.userChanged) ? state.post_treatment_body : props.emailList.data.post_treatment_body,
              showLoader: false
          };
      }  else
          return null;
  }
  handleInputChange = (event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      this.setState({
          [event.target.name]: value, userChanged : true
      });
  }

  handleEdit =()=>{
    this.setState({isDisabled:false,
      buttonChange:'Save'
    })
  }
  handleSubmit =(event) => {
    this.setState({
      save:'new-blue-btn pull-right save display',
      edit:'new-blue-btn pull-right edit display',
      subjectError: false,
      bodyError: false,
      isDisabled: true,})

    event.preventDefault();
    //====Frontend validation=================
    let error = false;

    if (this.state.post_treatment_subject === '' || this.state.post_treatment_subject.trim() == "") {
      this.setState({
        isDisabled: false,
        subjectError: true
      })
      error = true;
    }else if (this.state.pre_treatment_subject) {
      this.setState({
        isDisabled: true,
        subjectError: false
      })
    }
    if (this.state.post_treatment_body === '' || this.state.post_treatment_body.trim() == "") {
      this.setState({
        isDisabled: false,
        bodyError: true
      })
      error = true;
    } else if (this.state.pre_treatment_body) {
      this.setState({
        isDisabled: true,
        bodyError: false
      })
    }
    if (error === true) {
        return;
    }
    let formData = {
        post_treatment_subject: this.state.post_treatment_subject,
        post_treatment_body: this.state.post_treatment_body,
    }
    this.props.postEmailUpdate(formData);
  }
  handleCancel = () => {
    this.setState({
      pre_treatment_subject: this.state.emailList.pre_treatment_subject,
      pre_treatment_body: this.state.emailList.pre_treatment_body,
      isDisabled:true
    });
  }
  render(){
    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
        <Sidebar />
          <div className="setting-setion">
            <div className="setting-container">
              <div className="setting-title">{this.state.post_treatment_header}
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="instruction-subtitle">{this.state.post_treatment_email}</div>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.post_treatment_email_Subject}<span className="setting-require">*</span></div>
                        <input name="post_treatment_subject" id="post_treatment_subject" className={this.state.subjectError === true ? "setting-input-box setting-input-box-invalid" :"setting-input-box"} autoComplete="off" placeholder="Subject" value={this.state.post_treatment_subject} disabled={this.state.isDisabled} onChange={this.handleInputChange} type="text" />
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.post_treatment_email_body}<span className="setting-require">*</span></div>
                        <textarea name="post_treatment_body" id="post_treatment_body" className={this.state.bodyError === true ? "setting-textarea-box m-h-300 setting-input-box-invalid" :"setting-textarea-box m-h-300"} placeholder="Email body" disabled={this.state.isDisabled} onChange={this.handleInputChange} value={this.state.post_treatment_body} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="instruction-subtitle">Variables</div>
              <div className="setting-variable">
                <div className="row">
                  <div className="col-md-4 col-xs-12">Patient Name: {'{'}{'{'}PATIENTNAME{'}'}{'}'}</div>
                  <div className="col-md-4 col-xs-12">Provider Name: {'{'}{'{'}PROVIDERNAME{'}'}{'}'}</div>
                  <div className="col-md-4 col-xs-12">Appointment Date Time: {'{'}{'{'}APPOINTMENTDATETIME{'}'}{'}'}</div>
                </div>
                <div className="row">
                  <div className="col-md-4 col-xs-12">Clinic Name:{'{'}{'{'}CLINICNAME{'}'}{'}'}</div>
                  <div className="col-md-4 col-xs-12">Clinic Location:{'{'}{'{'}CLINICLOCATION{'}'}{'}'}</div>
                  <div className="col-md-4 col-xs-12">Instructions Service:{'{'}{'{'}INSTRUCTIONSSERVICE{'}'}{'}'}</div>
                </div>
                <div className="row">
                  <div className="col-md-4 col-xs-12">Instructions Title:{'{'}{'{'}INSTRUCTIONSTITLE{'}'}{'}'}</div>
                  <div className="col-md-4 col-xs-12">Instructions Description:{'{'}{'{'}INSTRUCTIONSDESCRIPTION{'}'}{'}'}</div>
                </div>
              </div>
            </div>
            {this.state.isDisabled == true ?
              <div id="post_edit_div" className="footer-static">
                <button id="edit_post" className={this.state.edit} onClick={this.handleEdit}>Edit</button>
              </div>
              :
              <div id="post_save_div" className="footer-static">
                <button id="edit_post" className={this.state.save} onClick={this.handleSubmit}>Save</button>
                <button id="post_cancel" data-url="" className="new-white-btn pull-right" onClick={this.handleCancel}>Cancel</button>
              </div>
            }
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
    if (state.SettingReducer.action === "POST_TREATMENT_EMAIL_LIST") {
      if(state.SettingReducer.data.status != 200) {
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false
      } else {
        returnState.emailList = state.SettingReducer.data;
      }
    } else if (state.SettingReducer.action === "POST_TREATMENT_EMAIL_UPDATE") {
      if(state.SettingReducer.data.status != 200){
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false
      }
      else {
        toast.success(languageData.global[state.SettingReducer.data.message]);
        returnState.emailList = state.SettingReducer.data;
      }
    }else if (state.SettingReducer.action === "FILE_UPLOADED") {
      if(state.SettingReducer.data.status != 200){
        returnState.tempFileName = state.SettingReducer.data.file_name;
        returnState.showLoader = false
      }
      else {
        returnState.user_image = state.SettingReducer.data.data.file_name
      }
    }
    return returnState;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      getPostTreatmentEmail: getPostTreatmentEmail,
      postEmailUpdate:postEmailUpdate
    }, dispatch)

}
export default connect(mapStateToProps, mapDispatchToProps)(PostTreatmentEmail);
