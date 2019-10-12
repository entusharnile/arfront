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
import config from '../../../config';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';
import { getUser,userProfile, uploadImage,getCancellationPolicy,updateCancellationPolicy, cancellationPolicyStatus } from '../../../Actions/Settings/settingsActions.js';
import {numberFormat} from '../../../Utils/services.js';

class CancellationPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      policyData:{},
      cancellation_fees: '',
      cancelation_fee_charge_days: '',
      cc_auth_text: '',
      cancellation_policy:'',
      cancelation_policy_status:false,
      userChanged:false,
      clinic_patient_portal_access_body:'',
      clinic_patient_portal_access_subject:'',
      text: '',
      showLoader: false
      };
  }

  handleEditorChange = (content) => {
    this.setState({cancellation_policy : content, userChanged: true});
  }

  componentDidMount() {
      const languageData = JSON.parse(localStorage.getItem('languageData'))
        this.setState({
          cp_header: languageData.settings['cp_header'],
          cp_fees: languageData.settings['cp_fees'],
          cp_charge_fee: languageData.settings['cp_charge_fee'],
          cp_auth_text: languageData.settings['cp_auth_text'],
          clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
          showLoader: true
        })
      this.setState({'showLoader': true})
      this.props.getCancellationPolicy();
  }

  static getDerivedStateFromProps(props, state) {
    console.log(props.policyDataTimestamp, state.policyDataTimestamp);
    if (props.policyData !== undefined && props.policyData.status === 200 && props.policyData.data != null && props.policyDataTimestamp != state.policyDataTimestamp) {
        return {
          cancellation_policy: (state.userChanged) ? state.cancellation_policy : props.policyData.data.account_details.cancellation_policy,
          cancelation_policy_status: (state.userChanged) ? state.cancelation_policy_status : props.policyData.data.account_details.account_preference.cancelation_policy_status,
          cancellation_fees: (state.userChanged) ? state.cancellation_fees : props.policyData.data.account_details.cancellation_fees,
          cancelation_fee_charge_days:(state.userChanged) ? state.cancelation_fee_charge_days : props.policyData.data.account_details.account_preference.cancelation_fee_charge_days,
          cc_auth_text:(state.userChanged) ? state.cc_auth_text : props.policyData.data.account_details.account_preference.cc_auth_text,
          showLoader: false,
          policyDataTimestamp: props.policyDataTimestamp
          };
    }
    if(props.showLoader !== undefined && props.showLoader != state.showLoader){
      return {
        showLoader : props.showLoader
      }
    }
    return null;
  }

  handleInputChange = (event) => {
      const target = event.target;
      let returnState = {};
      let value= target.value;
      switch(target.type) {
          case 'checkbox': {
              value = target.checked;
              break;
          }
          case  'file' :{
              value = target.files[0];
              break;
          }
      }

      if(target.name == 'cancelation_policy_status') {
        returnState.showLoader = true;
        this.props.cancellationPolicyStatus({field_name:'cancelation_policy_status', is_enabled : (value) ? 1 : 0});
      }

      returnState[event.target.name] = value;
      returnState.userChanged = true;
      this.setState(returnState);
  }

  handleSubmit = (event,questionId) => {
    let error =false;
    this.setState({
      cancellation_policy_Error:false,
      cancellation_fees_Error:false,
      cc_auth_text_Error:false,
      cancelation_fee_charge_days_Error:false,

    })
    if(typeof this.state.cancellation_policy === undefined || this.state.cancellation_policy === null || this.state.cancellation_policy === ''  || this.state.cancellation_policy.trim() === ''){
      this.setState({
      cancellation_policy_Error:true
      })
      error=true;
    }
    if(typeof this.state.cancellation_fees === undefined || this.state.cancellation_fees === null || this.state.cancellation_fees === ''){
      this.setState({
      cancellation_fees_Error:true
      })
      error=true;
    }  if  (typeof this.state.cc_auth_text === undefined || this.state.cc_auth_text === null || this.state.cc_auth_text === '' || this.state.cc_auth_text.trim() === ''){
         this.setState({
           cc_auth_text_Error:true
         })
         error=true;
       } if(typeof this.state.cancelation_fee_charge_days === undefined || this.state.cancelation_fee_charge_days === null || this.state.cancelation_fee_charge_days === '' || this.state.cancelation_fee_charge_days === 'SelectDays' ){
            this.setState({
              cancelation_fee_charge_days_Error:true
            })
            error=true;
          }
    if (error === true) {
        return;
    }
    this.setState({showLoader: true})
    let formData={
      account_details: {
        cancellation_policy: this.state.cancellation_policy,
        cancellation_fees:this.state.cancellation_fees,
        account_preference: {
          cc_auth_text:this.state.cc_auth_text,
          cancelation_fee_charge_days:this.state.cancelation_fee_charge_days,
        }
      }
    }
  this.props.updateCancellationPolicy(formData)
}

handleChange =(value) =>{
  this.setState({ text: value })
}

  render() {
    return (
        <div>
          <div >
            <div className="setting-title m-b-40">{this.state.cp_header}
              <a title="Your cancellation policy" className="help-icon">?</a>
              <label className="setting-switch pull-right">
                <input type="checkbox" name="cancelation_policy_status" id="cancel_policy" className="setting-custom-switch-input" onChange={this.handleInputChange} checked={(this.state.cancelation_policy_status) ? 'checked' : false}  />
                <span className="setting-slider" />
              </label>
            </div>
            <div name="cancellation_policy" className={(this.state.cancelation_policy_status) ? 'row' : 'row no-display' }  id="view_policy" >
              <div className={this.state.cancellation_policy_Error === true ? "col-sm-12 cancel-policy m-b-50 field_error" :"col-sm-12 cancel-policy m-b-50 " }>
              <Editor
                value={(this.state.cancellation_policy) ? this.state.cancellation_policy : ""}
                init={{
                   theme: 'modern',
                   menu:{},
                   plugins: [
                     'autolink link  lists hr anchor pagebreak',
                     'nonbreaking',
                     'textcolor','placeholder'
                   ],
                   toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link | hr'
                 }}
                onEditorChange={this.handleEditorChange} id="descriptionpost"
              />
              </div>
              <div className="col-lg-3 col-xs-12">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.cp_fees}<span className="setting-require">*</span></div>
                    <input type="text" name="cancellation_fees" onChange={this.handleInputChange} className={this.state.cancellation_fees_Error === true ? "newInputField field_error" : "newInputField "} autoComplete="off" value= {numberFormat(this.state.cancellation_fees, 'decimal', 2)} />
                </div>
              </div>
              <div className="col-lg-9 col-xs-12">
                <div className="row ques-radio-right">

                  <div className="col-md-5 col-xs-12 newInputFileldOuter">
                  <div className="newInputLabel">{this.state.cp_charge_fee}<span className="setting-require">*</span></div>
                    <div className={this.state.cancelation_fee_charge_days_Error === true ?"setting-input-outer field_error" : "setting-input-outer"}>
                      <select className={this.state.cancelation_fee_charge_days_Error === true ?"newSelectField field_error" : "newSelectField "} name="cancelation_fee_charge_days" value={this.state.cancelation_fee_charge_days} onChange={this.handleInputChange}>
                        {}
                        <option value='SelectDays'>Select Days</option>
                        <option value={1} >24 hrs of Appointment time</option>
                        <option value={2}> 2 days of Appointment time </option>
                        <option value={3}> 3 days of Appointment time </option>
                        <option value={4}> 4 days of Appointment time </option>
                        <option value={5}> 5 days of Appointment time </option>
                        <option value={6}> 6 days of Appointment time </option>
                        <option value={7}> 7 days of Appointment time </option>
                        <option value={8}> 8 days of Appointment time </option>
                        <option value={9}> 9 days of Appointment time </option>
                        <option value={10}> 10 days of Appointment time </option>
                        <option value={11}> 11 days of Appointment time </option>
                        <option value={12}> 12 days of Appointment time </option>
                        <option value={13}> 13 days of Appointment time </option>
                        <option value={14}> 14 days of Appointment time </option>
                        <option value={15}> 15 days of Appointment time </option>
                      </select></div>
                  </div>
                </div>
              </div>
              <div className="col-xs-12">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.cp_auth_text}<span className="setting-require">*</span></div>
                  <div className="setting-input-outer">
                    <textarea  name="cc_auth_text" onChange={this.handleInputChange} className={this.state.cc_auth_text_Error === true ? "newtextareaField field_error" : "newtextareaField "} value={this.state.cc_auth_text} style={{resize: 'none'}} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={(this.state.cancelation_policy_status) ? 'footer-static' : 'footer-static no-display' }>
            <a className="new-blue-btn pull-right" onClick={this.handleSubmit} id="c_policy">Save</a>
          </div>
          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
            <div className="loader-outer">
              <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
              <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
            </div>
          </div>
        </div>
    );
  }
}


function mapStateToProps(state) {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const returnState = {};
    toast.dismiss();
    if (state.SettingReducer.action === "GET_CANCELLATION_POLICY") {
      if(state.SettingReducer.data.status != 200) {
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false;
      } else {
        returnState.policyData = state.SettingReducer.data;
        returnState.policyDataTimestamp = new Date();
      }
    } else if (state.SettingReducer.action === "UPDATE_CANCELLATION_POLICY") {
      if(state.SettingReducer.data.status == 200){
        toast.success(languageData.global[state.SettingReducer.data.message]);
        returnState.policyDataTimestamp = new Date();
        returnState.policyData = state.SettingReducer.data;
      } else {
        returnState.showLoader = false;
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
    } else if (state.SettingReducer.action === "CANCELLATION_POLICY_STATUS") {
      returnState.showLoader = false;
      if(state.SettingReducer.data.status == 200){
        toast.success(languageData.global[state.SettingReducer.data.message]);
        returnState.policyData = state.SettingReducer.data;
        returnState.policyDataTimestamp = new Date();
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false;
      }
    }
    return returnState;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getCancellationPolicy:getCancellationPolicy,
        updateCancellationPolicy:updateCancellationPolicy,
        cancellationPolicyStatus:cancellationPolicyStatus
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(CancellationPolicy);
