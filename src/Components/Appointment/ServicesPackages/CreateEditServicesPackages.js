import React, { Component } from 'react';
import {
      getServicesPackagesById,
      createServicesPackages,
      updateServicesPackages,
      deleteServicesPackages,
      exportEmptyData
    } from '../../../Actions/Appointment/appointmentAction.js';
import config from '../../../config.js';
import { ToastContainer, toast } from "react-toastify";
import { Link, Redirect, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppointmentHeader from '../AppointmentHeader.js'

const defaultServicePackage = () => {
  return {id:"", break_time: "", custom_duration:"", duration:""}
};

const convertDurationToHrsMins = (duration) =>{
  let response = '' ;
  const hours = Math.floor(duration/60);
  const minutes = Math.floor(duration%60);
  if(hours){
    let hours1 = hours.toString();
    let minutes1 = minutes.toString();
    response = hours1.padStart(2, '0') +":"+ minutes1.padStart(2, '0');
    if(hours > 1){
      response += ' hours';
    } else {
      response += ' hour';
    }
  } else {
    response = minutes+' minutes';
  }
  return response;
}

 class CreateEditServicesPackages extends Component{
   constructor(props) {
     super(props);
     const userData = JSON.parse(localStorage.getItem('userData'));
     this.state = {
        clinicList: [],
        serviceList:[],
        servicesPackagesData:{},
        packageData:{},
        servicePackageId : 0,
        cloneId:0,
        hideBtns:false,
        showModal: false,
        showLoader: false,
        userChanged:false,
        name: '',
        description: '',
        clinic_id: '',
        is_active: true,
        multipleServicePackageList: [defaultServicePackage()],
        multipleServicePackageListClass: [{
          id:'setting-select-box',
			    break_time: 'setting-select-box',
          custom_duration:'setting-input-box',
        }],
        nameClass:'setting-input-box',
        descriptionClass:'setting-textarea-box',
        cinicIdClass:'setting-select-box',
        cleanupTimeClass:'setting-select-box'
     };
   }

   componentDidMount(){
     window.onscroll = () => {
        return false;
     }
     const languageData = JSON.parse(localStorage.getItem('languageData'));
     this.setState({
       appointment_create_package: languageData.appointments['appointment_create_package'],
       appointment_edit_package: languageData.appointments['appointment_edit_package'],
       appointment_package_name: languageData.appointments['appointment_package_name'],
       appointment_description: languageData.appointments['appointment_description'],
       appointment_clinic: languageData.appointments['appointment_clinic'],
       appointment_service: languageData.appointments['appointment_service'],
       appointment_break_time: languageData.appointments['appointment_break_time'],
       services_packages_delete_msg: languageData.appointments['services_packages_delete_msg'],
       label_active: languageData.global['label_active'],
       label_yes: languageData.global['label_yes'],
       label_no: languageData.global['label_no'],
       label_cancel: languageData.global['label_cancel'],
       label_save: languageData.global['label_save'],
       label_delete: languageData.global['label_delete'],
       Please_Wait: languageData.global['Please_Wait'],
       delete_confirmation: languageData.global['delete_confirmation'],
     });
     let fetchServicePackageId = 0
     const servicePackageId = this.props.servicePackageId;
     let mode = this.props.mode;
     if(servicePackageId && mode == 'edit') {
        fetchServicePackageId = servicePackageId;
        this.setState({servicePackageId : servicePackageId});
      } else if (servicePackageId && mode == 'clone') {
        const cloneId = servicePackageId;
        if(cloneId) {
          fetchServicePackageId = cloneId;
          this.setState({cloneId : cloneId});
        }
      }
     this.setState({showLoader: true})
     this.props.getServicesPackagesById({},fetchServicePackageId);
   }

   static getDerivedStateFromProps(props, state) {
     let returnState = {}
     if(props.showLoader != undefined && props.showLoader == false) {
         return {showLoader : false};
      }
     if (props.servicesPackagesData !== undefined && props.servicesPackagesData !== state.servicesPackagesData) {
        returnState.servicesPackagesData = props.servicesPackagesData;
        returnState.clinicList = props.servicesPackagesData.clinics;
        returnState.serviceList = props.servicesPackagesData.services;
        returnState.showLoader = false;
        if (props.servicesPackagesData.package_data !== undefined  && props.servicesPackagesData.package_data !== state.packageData && (state.servicePackageId || state.cloneId)) {
          returnState.packageData = props.servicesPackagesData.package_data;
          returnState.name = (state.servicePackageId || state.cloneId) ? props.servicesPackagesData.package_data.name : state.name;
          returnState.description = (state.servicePackageId || state.cloneId) ? props.servicesPackagesData.package_data.description : state.description;
          returnState.clinic_id = (state.servicePackageId || state.cloneId) ? props.servicesPackagesData.package_data.clinic_id : state.clinic_id;
          returnState.is_active = (state.servicePackageId || state.cloneId) ? props.servicesPackagesData.package_data.is_active : state.is_active;
          const multipleServicePackageList = [];
          props.servicesPackagesData.package_data.service_packages.map((obj,idx) => {
            let servicePackage = {};
            servicePackage.id = obj.service_id;
            servicePackage.service_id = obj.service_id;
            servicePackage.break_time = obj.break_time;
            servicePackage.custom_duration = convertDurationToHrsMins(obj.duration);
            servicePackage.duration = obj.duration;
            multipleServicePackageList.push(servicePackage);
          });
          returnState.multipleServicePackageList = multipleServicePackageList;
        }
     } else if(props.redirect != undefined && props.redirect == true) {
      setTimeout(function(){
        props.openServicePackages()
      }, 2000)
        /*toast.success(props.message, {onClose : () => {
            props.history.push('/appointment/services-packages');
        }});*/
     } else if(props.showLoader != undefined && props.showLoader == false) {
        returnState.showLoader = false;
     }
     return returnState;
   }

   handleInputChange = (event) => {
     let returnState = {userChanged : true}
     const target = event.target;
     let value= target.value;
     let inputName = target.name;
     const  servicepackageindex = event.target.dataset.servicepackageindex;
     if(servicepackageindex){
       let multipleServicePackageList = this.state.multipleServicePackageList;
       multipleServicePackageList[servicepackageindex][inputName] = value;
       if(inputName == 'service_id'){
         multipleServicePackageList[servicepackageindex]['id'] = value;
         if(value != ''){
           const serviceData = this.state.serviceList.find(x => x.id == value);
           if(serviceData != undefined && serviceData.id != undefined){
             multipleServicePackageList[servicepackageindex]['duration'] = serviceData.duration;
             multipleServicePackageList[servicepackageindex]['custom_duration'] = convertDurationToHrsMins(serviceData.duration);
           } else {
             multipleServicePackageList[servicepackageindex]['custom_duration'] = '';
             multipleServicePackageList[servicepackageindex]['duration'] = '';
           }
         } else {
           multipleServicePackageList[servicepackageindex]['custom_duration'] = '';
           multipleServicePackageList[servicepackageindex]['duration'] = '';
         }
       }
       this.setState({multipleServicePackageList:multipleServicePackageList});
     } else {
       switch(target.type) {
         case 'checkbox': {
             value = target.checked;
             break;
         }
         case 'radio' :{
           value = (target.value == true || target.value == "true") ? true : false;
           break;
         }
       }
       returnState[event.target.name] = value
       this.setState(returnState);
    }
   }


   handleSubmit = (event) => {
     //====Frontend validation=================

     let targetName = event.target.name;
     let error = false;
     if (typeof this.state.name === undefined || this.state.name === null || this.state.name.trim() === '') {
       this.setState({
         nameClass:'setting-input-box field_error'
       })
       error = true;
     } else if(this.state.name) {
       this.setState({
         nameClass:'setting-input-box'
       })
     }

     if (typeof this.state.description === undefined || this.state.description === null || this.state.description.trim() === '') {
       this.setState({
         descriptionClass:'setting-textarea-box field_error'
       })
       error = true;
     } else if(this.state.description) {
       this.setState({
         descriptionClass:'setting-textarea-box'
       })
     }

     if (typeof this.state.clinic_id === undefined || this.state.clinic_id === null || this.state.clinic_id === null) {
       this.setState({
         cinicIdClass:'setting-select-box field_error'
       })
       error = true;
     } else if(this.state.clinic_id) {
       this.setState({
         cinicIdClass:'setting-select-box'
       })
     }

     const multipleServicePackageList = this.state.multipleServicePackageList;
     const multipleServicePackageListClass = [];
     multipleServicePackageList.map((obj, idx) => {
       const servicePackageClass = {};
       if(obj.id === null || obj.id === '') {
          servicePackageClass.id = 'setting-select-box field_error';
          error = true;
       } else {
         servicePackageClass.id = 'setting-select-box';
       }
       if(obj.custom_duration === null || obj.custom_duration === '') {
          servicePackageClass.custom_duration = 'setting-input-box field_error';
          error = true;
       } else {
         servicePackageClass.custom_duration = 'setting-input-box';
       }
       if(obj.break_time === null || obj.break_time === '') {
          servicePackageClass.break_time = 'setting-select-box field_error';
          error = true;
       } else {
         servicePackageClass.break_time = 'setting-select-box';
       }
       multipleServicePackageListClass.push(servicePackageClass);
     });
     this.setState({multipleServicePackageList:multipleServicePackageList,multipleServicePackageListClass:multipleServicePackageListClass});

     if (error === true) {
        return;
     }

     let formData={
       name :this.state.name,
       description: this.state.description,
       clinic_id: this.state.clinic_id,
       is_active: (this.state.is_active == true || this.state.is_active == 'true') ? 1 : 0,
       service_packages:multipleServicePackageList
     }

     this.setState({
       showLoader : true
     });
     const servicePackageId = this.state.servicePackageId;
     if(servicePackageId){
       this.props.updateServicesPackages(formData,servicePackageId);
     } else{
       this.props.createServicesPackages(formData);
     }
   };

   showDeleteModal = () => {
      this.setState({showModal: true})
   }

   dismissModal = () => {
      this.setState({showModal: false})
   }

   deleteServicesPackages = () => {
     if(this.state.servicePackageId){
       this.setState({showLoader: true, hideBtns : true})
       this.dismissModal();
       this.props.deleteServicesPackages(this.state.servicePackageId);
     }
   }

   addMultipleServicePackage = () => {
     const multipleServicePackageList = this.state.multipleServicePackageList;
     let returnState = {};
     multipleServicePackageList.push(defaultServicePackage());
     this.setState({multipleServicePackageList:multipleServicePackageList});
   }

   deleteMultipleServicePackage = (event) => {
     let returnState = {};
     const multipleServicePackageList = this.state.multipleServicePackageList;
     if(multipleServicePackageList.length == 1) { return false}
     const  servicepackageindex = event.target.dataset.servicepackageindex;
     multipleServicePackageList.splice(servicepackageindex, 1);
     const multipleServicePackageListClass = this.state.multipleServicePackageListClass;
     if(multipleServicePackageListClass[servicepackageindex] != undefined){
       multipleServicePackageListClass.splice(servicepackageindex, 1);
     }
     this.setState({multipleServicePackageList:multipleServicePackageList,multipleServicePackageListClass:multipleServicePackageListClass});
   }

   render(){
     return(
             <div className="setting-setion">
                  <div className="appointment-container">
                    <div className="juvly-title m-b-40">{(this.state.servicePackageId) ? this.state.appointment_edit_package : this.state.appointment_create_package }
                      <a onClick={() => {this.props.openServicePackages()}} className="pull-right cross-icon"><img src="/images/close.png" /></a>
                    </div>
                    <div className="row">
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.appointment_package_name} <span className="setting-require">*</span></div>
                          <input name="name"  className={this.state.nameClass} maxLength={255} type="text" value={this.state.name} onChange={this.handleInputChange} autoComplete="off" />
                        </div>
                      </div>
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.appointment_description} <span className="setting-require">*</span></div>
                          <textarea name="description"  className={this.state.descriptionClass} maxLength={255} type="textarea" value={this.state.description} onChange={this.handleInputChange} autoComplete="off" />
                        </div>
                      </div>
                      <div className="col-xs-12">
                        <div className="setting-field-outer relative">
                          <div className="new-field-label">{this.state.appointment_clinic} <span className="setting-require">*</span></div>
                          <select className={this.state.cinicIdClass} name="clinic_id" value={this.state.clinic_id} onChange={this.handleInputChange} >
                            <option value="">Select Clinic</option>
                            {(this.state.clinicList.length) ?
                              this.state.clinicList.map((obj, idx) => {
                                return(
                                  <option key={'clinic-'+idx} value={obj.id}>{obj.clinic_name}</option>
                                )
                              }):
                            null
                            }
                          </select>
                        </div>
                      </div>
                      <div className="col-xs-12">
            						<div className="setting-field-outer">
            							<div className="new-field-label">{this.state.label_active}</div>
            							<div className="setting-input-outer">
            								<div className="basic-checkbox-outer">
                              <input id="radiobutton1" className="basic-form-checkbox" name="is_active" type="radio" value={true} onChange={this.handleInputChange} checked={(this.state.is_active) ? 'checked' :  false} />
                              <label className="basic-form-text" htmlFor="radiobutton1">{this.state.label_yes}</label>
            								</div>
            								<div className="basic-checkbox-outer">
                              <input id="radiobutton2" className="basic-form-checkbox" name="is_active" type="radio" value={false} onChange={this.handleInputChange} checked={(!this.state.is_active) ? 'checked' :  false} />
                              <label className="basic-form-text" htmlFor="radiobutton2">{this.state.label_no}</label>
            								</div>
            							</div>
            						</div>
            					</div>
                    </div>
                    {(this.state.multipleServicePackageList.length > 0) &&
                      this.state.multipleServicePackageList.map((multipleObj, multipleIdx) => {
                        return (
                          <div className="row relative" key={'servicePackage-'+multipleIdx}>
                  					<div className="col-sm-7 col-xs-11">
                  						<div className="setting-field-outer">
                  							<div className="new-field-label">Select Service <span className="setting-require">*</span></div>
                  							<select name="service_id" className={(this.state.multipleServicePackageListClass[multipleIdx]) ? this.state.multipleServicePackageListClass[multipleIdx].id : 'setting-select-box'} value={multipleObj.id} onChange={this.handleInputChange} data-servicepackageindex={multipleIdx}>
                  								<option>Select Service</option>
                                  {(this.state.serviceList.length) &&
                                    this.state.serviceList.map((serviceObj, serviceIdx) => {
                                      return(
                                        <option key={'service-'+serviceIdx} value={serviceObj.id}>{serviceObj.name}</option>
                                      )
                                    })
                                  }
                  							</select>
                  						</div>
                  					</div>
                  					<div className="col-sm-2 col-xs-11">
                  						<div className="setting-field-outer">
                  							<div className="new-field-label">Time Duration</div>
                  							<input name="custom_duration" className={(this.state.multipleServicePackageListClass[multipleIdx]) ? this.state.multipleServicePackageListClass[multipleIdx].custom_duration : 'setting-input-box'} value={multipleObj.custom_duration} onChange={this.handleInputChange} type="text" disabled={true} autoComplete="off" data-servicepackageindex={multipleIdx} />
                  						</div>
                  					</div>
                  					<div className="col-sm-3 col-xs-12">
                  						<div className="new-field-label">Break Time <span className="setting-require">*</span></div>
                  						<div className="row">
                  							<div className="col-xs-11">
                  								<select name="break_time" className={(this.state.multipleServicePackageListClass[multipleIdx]) ? this.state.multipleServicePackageListClass[multipleIdx].break_time+' m-b-30' : 'setting-select-box m-b-30'} value={multipleObj.break_time} onChange={this.handleInputChange} data-servicepackageindex={multipleIdx}>
                                    <option value="">Select Break Time</option>
                                    <option value="0">No Break Time</option>
                                    <option value="5">5 minutes</option>
                                    <option value="10">10 minutes</option>
                                    <option value="15">15 minutes</option>
                                    <option value="20">20 minutes</option>
                                    <option value="25">25 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="35">35 minutes</option>
                                    <option value="40">40 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="50">50 minutes</option>
                                    <option value="55">55 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="75">1 hour 15 minutes</option>
                                    <option value="90">1 hour 30 minutes</option>
                                  </select>
                  							</div>
                  						</div>
                  					</div>
                            {(multipleIdx == 0)
                              ?
                              <a href="javascript:void(0);" className="add-round-btn" onClick={this.addMultipleServicePackage}><span>+</span></a>
                              :
                              <a href="javascript:void(0);" className="add-round-btn" data-servicepackageindex={multipleIdx} onClick={this.deleteMultipleServicePackage}><span data-servicepackageindex={multipleIdx}>-</span></a>
                            }
                  				</div>
                        )
                      })
                    }
                    <div className="footer-static">
                      {this.state.servicePackageId ?
                        <input className="new-red-btn pull-left confirm-model" onClick={this.showDeleteModal} data-message={this.state.services_packages_delete_msg} data-confirm-url="" type="submit" autoComplete="off" value={this.state.label_delete} />
    : null}

                        <a className="new-blue-btn pull-right"  onClick={this.handleSubmit} >{this.state.label_save}</a>
                      </div>
                  </div>

                  <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                    <div className="loader-outer">
                      <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                      <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
                    </div>
                  </div>
                  <div className={(this.state.showModal) ? 'overlay' : ''} ></div>
                  <div id="filterModal" role="dialog" className={(this.state.showModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                          <h4 className="modal-title" id="model_title">{this.state.delete_confirmation}</h4>
                        </div>
                        <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.services_packages_delete_msg}</div>
                        <div className="modal-footer">
                          <div className="col-md-12 text-left" id="footer-btn">
                            <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.label_no}</button>
                            <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteServicesPackages}>{this.state.label_yes}</button>
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
   let returnState = {};
   const languageData = JSON.parse(localStorage.getItem('languageData'));
   toast.dismiss();
   if (state.AppointmentReducer.action === "SERVICES_PACKAGES_DATA") {
     if(state.AppointmentReducer.data.status != 200) {
       toast.dismiss();
       toast.error(languageData.global[state.AppointmentReducer.data.message]);
       returnState.showLoader = false
     } else {
       returnState.servicesPackagesData = state.AppointmentReducer.data.data;
     }
   } else if (state.AppointmentReducer.action === "CREATE_SERVICES_PACKAGES") {
     if(state.AppointmentReducer.data.status == 201){
       returnState.redirect = true;
       toast.success(languageData.global[state.AppointmentReducer.data.message]);
       returnState.message = languageData.global[state.AppointmentReducer.data.message];
     } else {
       toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
       returnState.showLoader = false
     }
   }  else if(state.AppointmentReducer.action === 'UPDATE_SERVICES_PACKAGES') {
     if(state.AppointmentReducer.data.status == 200){
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
       returnState.redirect = true;
       returnState.message = languageData.global[state.AppointmentReducer.data.message];
     } else {
       toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
       returnState.showLoader = false
     }
   } else if(state.AppointmentReducer.action === 'DELETE_SERVICES_PACKAGES') {
     if(state.AppointmentReducer.data.status == 200){
        toast.success(languageData.global[state.AppointmentReducer.data.message]);
       returnState.redirect = true;
       returnState.message = languageData.global[state.AppointmentReducer.data.message];
     } else {
       toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
       returnState.showLoader = false
     }
   } else if(state.AppointmentReducer.action === 'EMPTY_DATA') {
      returnState.showLoader = false
   }
  return returnState;
}
 function mapDispatchToProps(dispatch){
   return bindActionCreators({
      getServicesPackagesById:getServicesPackagesById,
      createServicesPackages:createServicesPackages,
      updateServicesPackages :updateServicesPackages,
      deleteServicesPackages:deleteServicesPackages,
      exportEmptyData :exportEmptyData

    },dispatch)
}

 export default connect(mapStateToProps, mapDispatchToProps) (CreateEditServicesPackages);
