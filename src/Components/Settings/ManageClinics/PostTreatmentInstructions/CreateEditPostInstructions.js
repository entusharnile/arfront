import React, { Component } from 'react';
import Sidebar from "../../../../Containers/Settings/sidebar.js";
import {fetchSelectedPosttreatmentInstructions,
        createPosttreatmentInstructions,
        deleteSelectedPosttreatmentInstructions,
        updateSelectedPosttreatmentInstructions,
        exportEmptyData
      } from '../../../../Actions/Settings/settingsActions.js';
import config from '../../../../config.js';
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
import { Editor } from '@tinymce/tinymce-react';
import { isNumber, isInt } from '../../../../Utils/services.js';

 class CreateEditPostInstructions extends Component{
   constructor(props) {
     super(props);
     const userData = JSON.parse(localStorage.getItem('userData'));
     const languageData = JSON.parse(localStorage.getItem('languageData'));
     this.state = {
       postData: {},
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
      showModal: false,
      settingsLang: languageData.settings,
      title:'',
      description:'',
      scheduled_after:'',
      days_after:'PleaseSelect',
      days_after_enable:'col-md-2 col-sm-3 col-xs-12 daysValue',
      days_after_disable:'col-md-2 col-sm-3 col-xs-12 daysValue no-display',
      defaultDays : [1,2,3,4,5,6,7,14,21,30,60],
      scheduleAfterClass: 'setting-input-box daysValue'
     };
     window.onscroll = () => {
       return false;
     }
   }
   componentDidMount(){
     window.onscroll = () => {
       return false;
     }
     const postId =this.props.match.params.id;
     if(postId) {
      this.setState({postId : postId});
     }
     if(!localStorage.getItem('languageData')){
                     axios.get(config.API_URL + `getLanguageText/1/settings`)
                     .then(res =>{
                       const languageData =res.data.data;
                       localStorage.setItem('languageData',JSON.stringify(languageData))
                       this.setState({
                         edit_post_instructions:languageData.settings['edit_post_instructions'],
                         pre_instructions_title:languageData.settings['pre_instructions_title'],
                         post_instructions_sendAfter:languageData.settings['post_instructions_sendAfter'],
                         post_create_instructions:languageData.settings['post_create_instructions'],

                       })
                     })
                     .catch(function(error){
                     });
                   }
                   else{
                   const languageData = JSON.parse(localStorage.getItem('languageData'))
                   this.setState({
                     edit_post_instructions:languageData.settings['edit_post_instructions'],
                     pre_instructions_title:languageData.settings['pre_instructions_title'],
                     post_instructions_sendAfter:languageData.settings['post_instructions_sendAfter'],
                     post_create_instructions:languageData.settings['post_create_instructions'],

                   })
                   }
                   let formData = {'params':{

                     }
                   }

                   if(postId){
                     this.setState({'showLoader': true})
                     this.props.fetchSelectedPosttreatmentInstructions(formData,postId);
                    } else {
                      this.props.exportEmptyData({});
                    }
   }

   static getDerivedStateFromProps(props, state) {
     if(props.showLoader != undefined && props.showLoader == false) {
         return {showLoader : false};
      }
     if (props.postData !== undefined && props.postData.status === 200 && props.postData.data.description !== state.description) {
      let returnState = {};
      if(!state.userChanged && state.defaultDays.indexOf(parseInt(props.postData.data.days_after)) == -1) {
        returnState.days_after = "custom";
        returnState.scheduled_after = props.postData.data.days_after;
      } else {
        returnState.days_after = (state.userChanged) ? state.days_after : props.postData.data.days_after
      }

       returnState.title = (state.userChanged) ? state.title : props.postData.data.title;
       returnState.description = (state.userChanged) ? state.description : props.postData.data.description;
       returnState.showLoader = false;
       return returnState;

     }
      if(props.redirect != undefined && props.redirect == true) {
        toast.success(props.message)
            props.history.push('/settings/post-treatment-instructions');
     }
     if (props.showLoader !== undefined && props.showLoader === false){
       return { showLoader : false}
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

   deleteSelectedPosttreatmentInstructions = () => {
     this.setState({showLoader: true, hideBtns : true})
     this.dismissModal();
     let postId =this.props.match.params.id;
     this.props.deleteSelectedPosttreatmentInstructions(postId);
   }

   handleSubmit = (event) => {
     //====Frontend validation=================
     let error = false;
     let regularExpression  = /^[a-zA-Z]$/;
     let scheduleVal=this.state.days_after;


     this.setState({
       title_Error: false,
       description_Error: false,
       days_after_Error: false,
       scheduleAfterClass: 'setting-input-box daysValue'
     });



     if (typeof this.state.title === undefined || this.state.title === null || this.state.title === '' ||  this.state.title.trim() =="") {
       this.setState({
         title_Error: true
       })
       error = true;
     } if (typeof this.state.days_after === undefined || this.state.days_after === null || this.state.days_after === '' || this.state.days_after === "PleaseSelect" ) {
       this.setState({
         days_after_Error: true
       })
       error = true;
     }
     if (typeof this.state.description === undefined || this.state.description === null || this.state.description === '' ||  this.state.description.trim() =="") {
       this.setState({
         description_Error: true
       })
       error = true;
     }

     if ( scheduleVal === 'custom' ) {
       if ( !isNumber(this.state.scheduled_after) || !isInt(this.state.scheduled_after) ) {
         this.setState({scheduleAfterClass: 'setting-input-box daysValue field_error'});
         error = true;
       }
     }

          if (error === true) {
              return;
          }
let formData={}
     const postId = this.props.match.params.id;
     if(scheduleVal !== 'custom') {

       formData.title = this.state.title;
       formData.description = this.state.description;
       formData.days_after = this.state.days_after;
     } else {
       formData.title = this.state.title;
       formData.description = this.state.description;
       formData.days_after = this.state.scheduled_after;
       this.setState({days_after:this.state.scheduled_after})
     }

     this.setState({
       title:this.state.title,
       description: this.state.description,
       days_after:this.state.days_after,
       loadMore: true,
       startFresh: true,
       next_page_url: "",
       postData: [],
       showLoader : true,

     });

     if(postId){
       this.props.updateSelectedPosttreatmentInstructions(formData,postId);
     }
     else{
      this.props.createPosttreatmentInstructions(formData);
   }
   };
   handleEditorChange = (e) => {
     this.setState({description : e.target.getContent(), userChanged: true});
   }

   handlePrintSelected = () =>{
     	var head	= this.state.title;
			var div	= this.state.description;
			var mywindow = window.open('', head);
			mywindow.document.write('<html><head><title>'+head+'</title>');
			mywindow.document.write('<style>.title {width: 100%; float:left; text-align: center; font-size:25px;margin-bottom:20px!important; } .printClass{margin-top: 50px!important;clear:both;}</style>');
			mywindow.document.write('</head><body>');
			mywindow.document.write('<p><b class="title">'+head+'</b></p>');
			mywindow.document.write('<div class="printClass">'+div+'</div>');
			mywindow.document.write('</body></html>');
			mywindow.document.close();
			mywindow.focus();
			mywindow.print();
			mywindow.close();
   }

   render(){
     let daysArr =['PleaseSelect','1','2','custom'];

     return(
       <div id="content">
          <div className="container-fluid content setting-wrapper">
               <Sidebar/>
                 <div className="setting-setion">
                   <div className="setting-container">
                     <div className="setting-title m-b-40">{(this.state.postId) ? this.state.edit_post_instructions :	this.state.post_create_instructions}<Link to="/settings/post-treatment-instructions" className="pull-right cancelAction"><img src="/images/close.png" /></Link>
                     </div>
                     <div className="row">
                       <div className="col-md-8 col-sm-6 col-xs-12">
                         <div className="setting-field-outer no-ques-margin">
                           <input type="hidden" name="data[PreTreatmentInstruction][id]" defaultValue={2} id="PreTreatmentInstructionId" />					<div className="new-field-label">{this.state.pre_instructions_title}<span className="setting-require">*</span></div>
                           <div className="setting-input-outer" id="divToPrint">
                             <input name="title" id="title" onChange={this.handleInputChange} className={this.state.title_Error === true ? "setting-input-box field_error" :"setting-input-box" } autoComplete="off" placeholder="Title" maxLength={255} type="text" value={this.state.title} />					</div>
                         </div>
                       </div>
                       <div className="col-md-2 col-sm-3 col-xs-12">
                         <div className="setting-field-outer no-ques-margin">
                           <div className="new-field-label">{this.state.post_instructions_sendAfter}<span className="setting-require">*</span></div>
                           <div className="setting-input-outer">
                             <select name="days_after" value={this.state.days_after} onChange={this.handleInputChange} data-placeholder="Select day duration" id="beforeDuration" className={this.state.days_after_Error === true ? "setting-select-box field_error" :"setting-select-box" } >
                               <option value='PleaseSelect'>{this.state.settingsLang.settings_please_select}</option><option value={1}>{this.state.settingsLang.Edit_Appointment_One_Day}</option><option value={2}>{this.state.settingsLang.Edit_Appointment_Two_Day}</option><option value={3}>{this.state.settingsLang.Edit_Appointment_Three_Day}</option><option value={4}>{this.state.settingsLang.Edit_Appointment_Four_Day}</option><option value={5}>{this.state.settingsLang.Edit_Appointment_Five_Day}</option><option value={6}>{this.state.settingsLang.Edit_Appointment_Six_Day}</option><option value={7}>{this.state.settingsLang.Edit_Appointment_One_Week}</option><option value={14}>{this.state.settingsLang.Edit_Appointment_Two_Weeks}</option><option value={21}>{this.state.settingsLang.Edit_Appointment_Three_Weeks}</option><option value={30}>1 {this.state.settingsLang.Edit_Appointment_Reminder_Month}</option><option value={60}>2 {this.state.settingsLang.Edit_Appointment_Reminder_Month}</option><option value="custom">{this.state.settingsLang.settings_custom}</option></select>
                           </div>
                         </div>
                       </div>

                       <div className={(this.state.days_after === "custom") ? this.state.days_after_enable : this.state.days_after_disable}>
                         <div className="new-field-label">Days<span className="setting-require">*</span></div>
                         <input name="scheduled_after" className={this.state.scheduleAfterClass} placeholder="Days" type="text" onChange={this.handleInputChange} autoComplete="off" value={this.state.scheduled_after} id="customdaypost"/>
                       </div>
                       <div className="col-xs-12 textarea-img m-t-40" id="divToPrint">
                         <div className={(this.state.description_Error ) ? "editor_textarea field_error" : "editor_textarea"} id="divToPrint" >
                           <Editor
                             value={(this.state.description) ? this.state.description : ""}
                             init={{
                               theme: 'modern',
                               menu:{},
                               plugins: [
                                 'autolink link  lists hr anchor pagebreak',
                                 'nonbreaking',
                                 'textcolor','placeholder'
                               ],
                               toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link | hr',
                               placeholder:"Placeholder text..."
                             }}
                             onChange={this.handleEditorChange} id="descriptionpost"
                             placeholder="Description"
                           />
                         </div>
                       </div>
                     </div>
                   </div>
                   <div className="footer-static">
                  { this.state.postId ?
                     <input className="new-red-btn pull-left confirm-model"  onClick={this.showDeleteModal}  data-message="Are you sure you want to delete this Pre Treatment Instruction?" data-confirm-url="/pre_treatment_instructions/delete_pre_treatment_instruction/2" type="submit" value="Delete" />
:''}
                     <div className={(this.state.showModal ? 'overlay' : '')}></div>
                           <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                             <div className="modal-dialog">
                               <div className="modal-content">
                                 <div className="modal-header">
                                   <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                                   <h4 className="modal-title" id="model_title">{this.state.settingsLang.settings_Confirmation_required}{this.state.showModal}</h4>
                                 </div>
                                 <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                                {this.state.settingsLang.settings_r_u_want_to_delete}
                                 </div>
                                   <div className="modal-footer" >
                                   <div className="col-md-12 text-left" id="footer-btn">

                                   <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>No</button>
                                   	<button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteSelectedPosttreatmentInstructions}>Yes</button>
                                 </div>
                                   </div>
                                   </div>
                                   </div>

                    </div>
                        <input className="new-blue-btn pull-right" id="save_pre" onClick={this.handlePrintSelected} type="submit" value="Print" />
                     		<input className="new-blue-btn pull-right" id="save_pre" onClick={this.handleSubmit} type="submit"  value="Save" />
                        <Link to="/settings/post-treatment-instructions" className="new-white-btn pull-right cancelAction">Cancel</Link>
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
 function mapStateToProps(state){
   const languageData = JSON.parse(localStorage.getItem('languageData'));
   const returnState = {};
   if (state.SettingReducer.action === "SELECTED_POST_TREATMENT_INSTRUCTIONS_LIST") {
     if(state.SettingReducer.data.status != 200) {
       toast.error(languageData.global[state.SettingReducer.data.message]);
       returnState.showLoader = false
     } else {
       returnState.postData = state.SettingReducer.data;
     }
   } else if (state.SettingReducer.action === "CREATE_POST_TREATMENT_INSTRUCTIONS_LIST") {
     if(state.SettingReducer.data.status != 201){
       toast.error(languageData.global[state.SettingReducer.data.message]);
       returnState.showLoader = false
     }
     else {
       returnState.redirect = true;
       returnState.message = languageData.global[state.SettingReducer.data.message];
     }
   }  else if(state.SettingReducer.action === 'UPDATE_POST_TREATMENT_INSTRUCTIONS_LIST') {
     if(state.SettingReducer.data.status != 200){
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false
      }
      else {
        returnState.redirect = true;
        returnState.message = languageData.global[state.SettingReducer.data.message];
      }
   }  else if(state.SettingReducer.action === 'DELETE_POST_TREATMENT_INSTRUCTIONS_LIST') {
     if(state.SettingReducer.data.status != 200){
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false
      }
      else {
        returnState.redirect = true;
        returnState.message = languageData.global[state.SettingReducer.data.message];
      }
   }
   if(state.SettingReducer.action === 'EMPTY_DATA') {
      return {}
   }
  return returnState;
}
 function mapDispatchToProps(dispatch){
    return bindActionCreators({
      fetchSelectedPosttreatmentInstructions:fetchSelectedPosttreatmentInstructions,
      createPosttreatmentInstructions:createPosttreatmentInstructions,
      updateSelectedPosttreatmentInstructions :updateSelectedPosttreatmentInstructions,
      deleteSelectedPosttreatmentInstructions :deleteSelectedPosttreatmentInstructions,
      exportEmptyData :exportEmptyData,

    },dispatch)
}
 export default withRouter(connect(mapStateToProps,mapDispatchToProps) (CreateEditPostInstructions));
