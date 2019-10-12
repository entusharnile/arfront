import React, { Component } from 'react';
import Sidebar from "../../../../Containers/Settings/sidebar.js";
import {fetchSelectedPretreatmentInstructions,
        createPretreatmentInstructions,
        deleteSelectedPretreatmentInstructions,
        updateSelectedPretreatmentInstructions,
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

 class CreateEditPreInstructions extends Component{
   constructor(props) {
     super(props);
     const userData = JSON.parse(localStorage.getItem('userData'));
     this.state = {
       preData: {},
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
      title:'',
      description:'',
      days_before:'PleaseSelect',
      descriptionError: false,
      days_before_enable:'col-md-2 col-sm-3 col-xs-12 daysValue',
      days_before_disable:'col-md-2 col-sm-3 col-xs-12 daysValue no-display',
      scheduled_after:''

     };
     window.onscroll = () => {
       return false;
     }
   }
   componentDidMount(){
     window.onscroll = () => {
       return false;
     }

     const preId =this.props.match.params.id;
     if(preId) {
      this.setState({preId : preId});
     }
     if(!localStorage.getItem('languageData')){
         axios.get(config.API_URL + `getLanguageText/1/settings`)
         .then(res =>{
           const languageData =res.data.data;
           localStorage.setItem('languageData',JSON.stringify(languageData))
           this.setState({
             edit_pre_instruction:languageData.settings['edit_pre_instruction'],
             pre_instructions_title:languageData.settings['pre_instructions_title'],
             pre_instructions_sendAfter:languageData.settings['pre_instructions_sendAfter'],
             pre_instructions_create:languageData.settings['pre_instructions_create'],
             pre_instructions_sendBefore:languageData.settings['pre_instructions_sendBefore']


           })
         })
         .catch(function(error){
         });
       }
       else{
       const languageData = JSON.parse(localStorage.getItem('languageData'))
       this.setState({
         edit_pre_instruction:languageData.settings['edit_pre_instruction'],
         pre_instructions_title:languageData.settings['pre_instructions_title'],
         pre_instructions_sendAfter:languageData.settings['pre_instructions_sendAfter'],
         pre_instructions_create:languageData.settings['pre_instructions_create'],
         pre_instructions_sendBefore:languageData.settings['pre_instructions_sendBefore'],
         clinic_Please_Wait : languageData.settings['clinic_Please_Wait'],
       })
       }
       let formData = {'params':{

         }
       }

       if(preId){
         this.setState({'showLoader': true})
         this.props.fetchSelectedPretreatmentInstructions(formData,preId);
        } else {
          this.props.exportEmptyData({});
        }

   }

   static getDerivedStateFromProps(props, state) {
     if(props.showLoader != undefined && props.showLoader == false) {
         return {showLoader : false};
      }
     if (props.preData !== undefined && props.preData.status === 200 && props.preDataTime != state.preDataTime) {
         return {
             title: (state.userChanged) ? state.title : props.preData.data.title,
             description: (state.userChanged) ? state.description : props.preData.data.description,
             days_before: (state.userChanged) ? state.days_before : props.preData.data.days_before,
             showLoader : false,
             preDataTime: props.preDataTime
         };
     } else if(props.redirect != undefined && props.redirect == true) {
        toast.success(props.message)
        props.history.push('/settings/pre-treatment-instructions');
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

   deleteSelectedPretreatmentInstructions = () => {
     this.setState({showLoader: true, hideBtns : true})
     this.dismissModal();
     let preId =this.props.match.params.id;
      this.props.deleteSelectedPretreatmentInstructions(preId);

   }

   handleSubmit = (event) => {
     //====Frontend validation=================
     let error = false;
     let regularExpression  = /^[a-zA-Z]$/;
     let scheduleVal=this.state.days_before;

     this.setState({
       title_Error: false,
       descriptionError: false,
       days_before_Error: false,
     });



     if (typeof this.state.title === undefined || this.state.title === null || this.state.title === '' || this.state.title.trim() == "") {
       this.setState({
         title_Error: true
       })
       error = true;
     }
     /*
     if (typeof this.state.days_before === undefined || this.state.days_before === null || this.state.days_before === '' || this.state.days_before === "PleaseSelect") {
       this.setState({
         days_before_Error: true
       })
       error = true;
     }
     */
     if (typeof this.state.description === undefined || this.state.description === null || this.state.description === ''  || this.state.description.trim() == "") {
       this.setState({
         descriptionError: true
       })
       error = true;
     }

      if (error === true) {
          return;
      }

     const preId = this.props.match.params.id;

     let formData={
       title:this.state.title,
       description:this.state.description
     }
      const postId = this.props.match.params.id;
      /*
      if(scheduleVal !== 'custom') {
        formData.title = this.state.title;
        formData.description = this.state.description;
        formData.days_before = this.state.days_before;
      } else {
        formData.title = this.state.title;
        formData.description = this.state.description;
        formData.days_before = this.state.scheduled_after;
      }
      */

     this.setState({
       title:this.state.title,
       description: this.state.description,
       days_before:this.state.days_before,
       loadMore: true,
       startFresh: true,
       next_page_url: "",
       preData: [],
       showLoader : true
     });

     if(preId){
       this.props.updateSelectedPretreatmentInstructions(formData,preId);
     }
     else{
      this.props.createPretreatmentInstructions(formData);
   }
   };
   handleEditorChange = (content) => {
     this.setState({description : content, userChanged: true});
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
     return(
       <div id="content">
               <div className="container-fluid content setting-wrapper">
               <Sidebar/>
                 <div className="setting-setion">
                   <div className="setting-container">
                     <div className="setting-title m-b-40">{(this.state.preId) ? this.state.edit_pre_instruction :	this.state.pre_instructions_create}<Link to="/settings/pre-treatment-instructions" data-url="/settings/pre_treatment_instructions" className="pull-right cancelAction"><img src="/images/close.png" /></Link>
                     </div>
                     <div className="row">
                       <div className="col-md-8 col-sm-6 col-xs-12">
                         <div className="setting-field-outer no-ques-margin">
                           <input type="hidden" name="data[PreTreatmentInstruction][id]" defaultValue={2} id="PreTreatmentInstructionId" />					<div className="new-field-label">{this.state.pre_instructions_title}<span className="setting-require">*</span></div>
                           <div className="setting-input-outer">
                             <input name="title" id="title" onChange={this.handleInputChange}  className={this.state.title_Error === true ? "setting-input-box field_error" :"setting-input-box" } placeholder="Title" maxLength={255} type="text" autoComplete="off" value={this.state.title} />					</div>
                         </div>
                       </div>
                       {/*  }
                       <div className="col-md-2 col-sm-3 col-xs-12">
                         <div className="setting-field-outer no-ques-margin">
                           <div className="new-field-label">{this.state.pre_instructions_sendBefore} <span className="setting-require">*</span></div>
                           <div className="setting-input-outer">
                             <select name="days_before" value={this.state.days_before} onChange={this.handleInputChange} data-placeholder="Select day duration" id="beforeDuration" className={this.state.days_before_Error === true ? "setting-select-box field_error" :"setting-select-box" } >
                                 <option value="PleaseSelect">Please select</option>
                                 <option value={1} >1 day</option>
                                 <option value={2}>2 days</option>
                                 <option value={3}>3 days</option>
                                 <option value={4}>4 days</option>
                                 <option value={5}>5 days</option>
                                 <option value={6}>6 days</option>
                                 <option value={7}>1 week</option>
                                 <option value={14}>2 weeks</option>
                                 <option value={21}>3 weeks</option>
                                 <option value={30}>1 month</option>
                                 <option value={60}>2 month</option>
                                 <option value="custom">Custom</option>
                               </select>
                           </div>
                         </div>
                       </div>
                       { */}

                       <div className={(this.state.days_before === "custom" ) ? this.state.days_before_enable : this.state.days_before_disable}>
                         <div className="new-field-label">Days<span className="setting-require">*</span></div>
                         <input name="scheduled_after" className="setting-input-box daysValue" placeholder="Days" type="text" onChange={this.handleInputChange} autoComplete="off" value={this.state.scheduled_after} id="customdaypost"/>
                       </div>

                       <div className="col-xs-12 textarea-img m-t-40">
                         <div className={(this.state.descriptionError) ? "editor_textarea field_error" : "editor_textarea"} id="divToPrint" >
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
                             toolbar: 'bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link | hr'
                           }}
                           onEditorChange={this.handleEditorChange} id="descriptionpost"
                           placeholder="Description"
                         />
                         </div>
                       </div>
                     </div>
                   </div>
                   <div className="footer-static">
                   {this.state.preId ?
                     <input className="new-red-btn pull-left confirm-model" onClick={this.showDeleteModal} data-message="Are you sure you want to delete this Pre Treatment Instruction?" data-confirm-url="/pre_treatment_instructions/delete_pre_treatment_instruction/2" type="submit" value="Delete" />
: ''}
                     <div className={(this.state.showModal ? 'overlay' : '')}></div>
                           <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                             <div className="modal-dialog">
                               <div className="modal-content">
                                 <div className="modal-header">
                                   <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                                   <h4 className="modal-title" id="model_title">Confirmation required!{this.state.showModal}</h4>
                                 </div>
                                 <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                                Are you sure you want to delete this Pre Treatment Instruction?
                                 </div>
                                   <div className="modal-footer" >
                                   <div className="col-md-12 text-left" id="footer-btn">

                                   <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>No</button>
                                   	<button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteSelectedPretreatmentInstructions}>Yes</button>
                                 </div>
                                   </div>
                                   </div>
                                   </div>

                   </div>
                      <input className="new-blue-btn pull-right" id="save_pre" onClick={this.handlePrintSelected} type="submit" value="Print" />
                     <input className="new-blue-btn pull-right" id="save_pre" onClick={this.handleSubmit}type="submit" value="Save" />
                     <Link to="/settings/pre-treatment-instructions" className="new-white-btn pull-right cancelAction">Cancel</Link>
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
   if (state.SettingReducer.action === "SELECTED_PRE_TREATMENT_INSTRUCTIONS_LIST") {
     if(state.SettingReducer.data.status != 200) {
       toast.error(languageData.global[state.SettingReducer.data.message]);
       returnState.showLoader = false
     } else {
       returnState.preData = state.SettingReducer.data;
       returnState.preDataTime = new Date();
     }
   } else if (state.SettingReducer.action === "CREATE_PRE_TREATMENT_INSTRUCTIONS_LIST") {
     if(state.SettingReducer.data.status != 201){
       toast.error(languageData.global[state.SettingReducer.data.message]);
       returnState.showLoader = false
     }
     else {
       returnState.redirect = true;
       returnState.message = languageData.global[state.SettingReducer.data.message];
       returnState.preDataTime = new Date();
     }
   }  else if(state.SettingReducer.action === 'UPDATE_PRE_TREATMENT_INSTRUCTIONS_LIST') {
     if(state.SettingReducer.data.status != 200){
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false
      }
      else {
        returnState.redirect = true;
        returnState.message = languageData.global[state.SettingReducer.data.message];
        returnState.preDataTime = new Date();
      }
   }  else if(state.SettingReducer.action === 'DELETE_PRE_TREATMENT_INSTRUCTIONS_LIST') {
     if(state.SettingReducer.data.status != 200){
       toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false
      }
      else {
        returnState.redirect = true;
        returnState.message = languageData.global[state.SettingReducer.data.message];
        returnState.preDataTime = new Date();
      }
   }
   if(state.SettingReducer.action === 'EMPTY_DATA') {
      return {}
   }
  return returnState;
}

 function mapDispatchToProps(dispatch){
    return bindActionCreators({
      fetchSelectedPretreatmentInstructions:fetchSelectedPretreatmentInstructions,
      createPretreatmentInstructions:createPretreatmentInstructions,
      updateSelectedPretreatmentInstructions :updateSelectedPretreatmentInstructions,
      deleteSelectedPretreatmentInstructions :deleteSelectedPretreatmentInstructions,
      exportEmptyData :exportEmptyData,

    },dispatch)
}

 export default withRouter(connect(mapStateToProps,mapDispatchToProps) (CreateEditPreInstructions));
