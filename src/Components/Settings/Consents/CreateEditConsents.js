import React, { Component } from 'react';
import Sidebar from "../../../Containers/Settings/sidebar.js";
import {fetchSelectedConsent,
        createConsent,
        deleteConsent, exportEmptyData,
        updateSelectedConsent} from '../../../Actions/Settings/settingsActions.js';
import config from '../../../config';
import axios from 'axios';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link, Redirect, withRouter } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown,faAngleRight} from '@fortawesome/free-solid-svg-icons';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import IntlTelInput from 'react-intl-tel-input';

 class CreateEditConsents extends Component{
   constructor(props) {
     super(props);
     const userData = JSON.parse(localStorage.getItem('userData'));
     this.state = {
       consent_name: '',
       consent_large_description: '',
       consent_small_description:'',
       consentData: {},
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
      hideBtns:false,
      showModal: false

     };
     window.onscroll = () => {
       return false;
     }
   }
   componentDidMount(){
     window.onscroll = () => {
       return false;
     }
     const consentId =this.props.match.params.id;
     if(consentId) {
      this.setState({consentId : consentId});
     }
     const languageData = JSON.parse(localStorage.getItem('languageData'))
     this.setState({
       create_edit_consent_name:languageData.settings['create_edit_consent_name'],
       edit_consent:languageData.settings['edit_consent'],
       add_consent:languageData.settings['add_consent'],
       delete_confirmation:languageData.global['delete_confirmation'],
       create_edit_consent_body:languageData.settings['create_edit_consent_body'],
       consent_delete_warning:languageData.settings['consent_delete_warning'],
       yes_option:languageData.settings['yes_option'],
       no_option:languageData.settings['no_option'],

     })
     let formData = {'params':{

       }
     }

     if(consentId){
       this.setState({'showLoader': true})
       this.props.fetchSelectedConsent(formData,consentId);
      }
      else {
          this.props.exportEmptyData({});
        }
   }

   static getDerivedStateFromProps(props, state) {
     if (props.consentData !== undefined && props.consentData.status === 200 ) {
         return {
             consent_name: (state.userChanged) ? state.consent_name : props.consentData.data.consent_name,
             consent_small_description: (state.userChanged) ? state.consent_small_description : props.consentData.data.consent_small_description,
             consent_large_description: (state.userChanged) ? state.consent_large_description : props.consentData.data.consent_large_description,
             showLoader : false
         };
     } else if(props.redirect != undefined && props.redirect == true) {
        toast.success(props.message)
          props.history.push('/settings/consents');
     }
     return null;
   }

   handleInputChange = (event) => {
       const target = event.target;
       const value = target.type === 'checkbox' ? target.checked : target.value;
       this.setState({
           [event.target.name]: value, userChanged : true
       });
   }

   showDeleteModal = () => {
      this.setState({showModal: true})
   }

   dismissModal = () => {
      this.setState({showModal: false})
   }

   deleteConsent = () => {
      this.setState({showLoader: true, hideBtns : true})
      this.dismissModal();
      let cId = this.state.id;
      this.props.deleteConsent(cId);
   }

   handleSubmit = (event) => {
     //====Frontend validation=================
     let error = false;
     let regularExpression  = /^[a-zA-Z]$/;


     this.setState({
       consent_name_Error: false,
       consent_large_description_Error: false,
       consent_small_Description_Error: false,



     });
     if (typeof this.state.consent_name === undefined || this.state.consent_name === null || this.state.consent_name === '') {
       this.setState({
         consent_name_Error: true
       })
       error = true;
     }
     if (typeof this.state.consent_large_description === undefined || this.state.consent_large_description === null || this.state.consent_large_description === '') {
       this.setState({
         consent_large_description_Error: true
       })
       error = true;
     }

          if (error === true) {
              return;
          }

     const consentId = this.props.match.params.id;

     let formData = {
         consent_name:this.state.consent_name,
         consent_large_description: this.state.consent_large_description,
     };

     this.setState({
       consent_name:this.state.consent_name,
       consent_large_description: this.state.consent_large_description,
       loadMore: true,
       startFresh: true,
       next_page_url: "",
       consentData: [],
       showLoader : true
     });

     if(consentId){
       this.props.updateSelectedConsent(formData,consentId);
     }
     else{
      this.props.createConsent(formData);
   }
   };

   render(){

     return(<div className="main protected">

    <div id="content">
        <div className="container-fluid content setting-wrapper">

            <Sidebar />
            <div className="setting-setion">
                <div className="setting-container">
                    <div className="setting-title m-b-40">
                        {(this.state.consentId) ? this.state.edit_consent : this.state.add_consent}
                        <Link to="/settings/consents" className="pull-right cancelAction">
                  <img src={'../../../../images/close.png'}/></Link>
                    </div>
                    <div className="row">
                        <div className="col-xs-12">
                            <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.create_edit_consent_name}<span className="setting-require">*</span></div>
                                <div className="setting-input-outer">
                                    <input name="consent_name" required="required" className={this.state.consent_name_Error=== true ? "consent_name setting-input-box-invalid setting-input-box" : "consent_name setting-input-box"} id="consent_name" placeholder="Consent Name" maxLength={255} type="text" autoComplete="off" onChange={this.handleInputChange} value={this.state.consent_name} />
                                </div>
                            </div>
                        </div>
                        <div className="col-xs-12">
                            <div className="new-field-label">{this.state.create_edit_consent_body}<span className="setting-require">*</span></div>
                            <textarea name="consent_large_description" id="large_desc" className={this.state.consent_large_description_Error === true ? "col-sm-9 setting-textarea-box setting-input-box-invalid" : "col-sm-9 setting-textarea-box"} placeholder="Description" style={{padding: '0px', height: '300px'}} rows={20} cols={30} onChange={this.handleInputChange} value={this.state.consent_large_description}/>
                        </div>
                    </div>
                </div>
                <div className="footer-static">
                {this.props.match.params.id != undefined &&
                  <input className="new-red-btn pull-left confirm-model" type="button" value="Delete" onClick={this.showDeleteModal} />
                }
                  {!this.state.hideBtns &&
                    <button type="button" id="save_clinic" className="new-blue-btn pull-right" onClick={this.handleSubmit}>Save</button>

                  }{!this.state.hideBtns &&
                     <Link to="/settings/consents" className="new-white-btn pull-right cancelAction">
                      Cancel
                    </Link>
                  }
                </div>
                <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
                </div>
              </div>
              <div className={(this.state.showModal ? 'overlay' : '')}></div>
                <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                        <h4 className="modal-title" id="model_title">{this.state.delete_confirmation}{this.state.showModal}</h4>
                      </div>
                      <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                        {this.state.consent_delete_warning}
                      </div>
                      <div className="modal-footer" >
                        <div className="col-md-12 text-left" id="footer-btn">

                          <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.no_option}</button>
                          <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteConsent}>{this.state.yes_option}</button>
                        </div>
                      </div>
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
 function mapStateToProps(state){
   const languageData = JSON.parse(localStorage.getItem('languageData'));
   const returnState = {};
   if (state.SettingReducer.action === "SELECTED_CONSENTS_LIST") {
     if(state.SettingReducer.data.status != 200) {
       toast.error(languageData.global[state.SettingReducer.data.message]);
     } else {
       returnState.consentData = state.SettingReducer.data;
     }
   } else if (state.SettingReducer.action === "CREATE_CONSENTS") {
     if(state.SettingReducer.data.status == 200){
       //toast.success(languageData.global[state.SettingReducer.data.message]);
       returnState.redirect = true;
       returnState.message = languageData.global[state.SettingReducer.data.message];
     } else {
       return {}
     }
     return returnState;
   }  else if(state.SettingReducer.action === 'UPDATE_SELECTED_CONSENTS') {
     if(state.SettingReducer.data.status == 200){
       //toast.success(languageData.global[state.SettingReducer.data.message]);
       returnState.redirect = true;

       returnState.message = languageData.global[state.SettingReducer.data.message];
     } else {
       return {}
     }
     return returnState;
   }  else if(state.SettingReducer.action === 'CONSENT_DELETED') {
     if(state.SettingReducer.data.status == 200){
       returnState.redirect = true;
       returnState.message = languageData.global[state.SettingReducer.data.message];
     } else {
       return {}
     }
     return returnState;
   }
   if(state.SettingReducer.action === 'EMPTY_DATA') {
      return {}
   }
  return returnState;
}
 function mapDispatchToProps(dispatch){
    return bindActionCreators({
      fetchSelectedConsent:fetchSelectedConsent,
      createConsent:createConsent,
      updateSelectedConsent :updateSelectedConsent,
      deleteConsent :deleteConsent,
      exportEmptyData :exportEmptyData

    },dispatch)
}
 export default withRouter(connect(mapStateToProps,mapDispatchToProps) (CreateEditConsents));
