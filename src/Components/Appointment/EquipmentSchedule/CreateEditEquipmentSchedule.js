import React, { Component } from 'react';
import {
      getEquipmentScheduleById,
      createEquipmentSchedule,
      updateEquipmentSchedule,
      deleteEquipmentSchedule,
      exportEmptyData
    } from '../../../Actions/Appointment/appointmentAction.js';
import config from '../../../config.js';
import { ToastContainer, toast } from "react-toastify";
import { Link, Redirect, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppointmentHeader from '../AppointmentHeader.js'
import WeekScheduleHours from './../Common/WeekScheduleHours.js';
import { convertTime12to24, convertTime24to12, getAmPm } from '../../../Utils/services.js';
import moment from 'moment';

const weekDaysName = {
  2: 'Monday',
  3: 'Tuesday',
  4: 'Wednesday',
  5: 'Thursday',
  6: 'Friday',
  7: 'Saturday',
  1: 'Sunday',
}

const initDeviceSchedule = (dayIndex) => {
  return {
    day : dayIndex,
    name : weekDaysName[dayIndex],
    is_checked : false,
    schedules: [{
      from_time:"00:00",
      from_time_option:"AM",
      from_time_24 : '00:00',
      to_time:"00:00",
      to_time_option:"PM",
      to_time_24 : '00:00',
      className : {
        from_time:"setting-input-box hours-time from-time-input",
        from_time_option:"newSelectField hours-pm from_time_option",
        to_time:"setting-input-box hours-time to-time-input",
        to_time_option:"newSelectField hours-pm to_time_option",
      }
    }]
  };
}

const initScheduleClass = () => {
  return {
    from_time:"setting-input-box hours-time from-time-input",
    from_time_option:"newSelectField hours-pm from_time_option",
    to_time:"setting-input-box hours-time to-time-input",
    to_time_option:"newSelectField hours-pm to_time_option",
  }
}

const checkUniqueName = (id, name, list) => {
  let returnFlag = true
  if(typeof name == 'string' && name.length > 1 && (typeof list === 'object' || typeof list === 'array')){
    name = name.toLowerCase()
    let isKeyExist =list.find(obj => (typeof obj.name == 'string' && name == obj.name.toLowerCase() && (id === 0 || id != obj.id)))
    if(isKeyExist){
      returnFlag = false
    }
  }
  return returnFlag;
}

 class CreateEditEquipmentSchedule extends Component{
   constructor(props) {
     super(props);
     const userData = JSON.parse(localStorage.getItem('userData'));
     this.state = {
        deviceData: {},
        clinicList: {},
        deviceId : 0,
        hideBtns:false,
        showModal: false,
        showLoader: false,
        userChanged:false,
        name: '',
        clinic_id: '',
        cleanup_time: '',
        deviceSchedule_1 : initDeviceSchedule(1),
        deviceSchedule_2 : initDeviceSchedule(2),
        deviceSchedule_3 : initDeviceSchedule(3),
        deviceSchedule_4 : initDeviceSchedule(4),
        deviceSchedule_5 : initDeviceSchedule(5),
        deviceSchedule_6 : initDeviceSchedule(6),
        deviceSchedule_7 : initDeviceSchedule(7),
        nameClass:'newInputField',
        cinicIdClass:'newInputField',
        cleanupTimeClass:'newInputField',
        isUniqueName: true,
        existDeviceList:[],
        equipmentScheduleData:{}
     };
   }

   componentDidMount(){
     window.onscroll = () => {
        return false;
     }
     const languageData = JSON.parse(localStorage.getItem('languageData'));
     this.setState({
       appointment_equipment_schedule: languageData.appointments['appointment_equipment_schedule'],
       appointment_business_hours: languageData.appointments['appointment_business_hours'],
       appointment_let_your_clients_know_when_you_are_open: languageData.appointments['appointment_let_your_clients_know_when_you_are_open'],
       appointment_equipment_equipment_name: languageData.appointments['appointment_equipment_equipment_name'],
       appointment_clinic: languageData.appointments['appointment_clinic'],
       appointment_equipment_clean_up_time_in_minutes: languageData.appointments['appointment_equipment_clean_up_time_in_minutes'],
       appointment_open_hours: languageData.appointments['appointment_open_hours'],
       appointment_close_hours: languageData.appointments['appointment_close_hours'],
       equipment_schedule_delete_msg: languageData.appointments['equipment_schedule_delete_msg'],
       label_cancel: languageData.global['label_cancel'],
       label_save: languageData.global['label_save'],
       label_delete: languageData.global['label_delete'],
       label_yes: languageData.global['label_yes'],
       label_no: languageData.global['label_no'],
       Please_Wait: languageData.global['Please_Wait'],
       delete_confirmation: languageData.global['delete_confirmation'],
     });

     this.setState({showLoader: true})
     const deviceId = this.props.equipmentScheduleId;
     if(deviceId) {
       this.setState({deviceId : deviceId});
       this.props.getEquipmentScheduleById({},deviceId);
     } else {
       this.props.getEquipmentScheduleById({},0);

     }
   }

   static getDerivedStateFromProps(props, state) {
     let returnState = {}
     if(props.showLoader != undefined && props.showLoader == false) {
         return {showLoader : false};
      }
     if (props.equipmentScheduleData !== undefined && props.equipmentScheduleData !== state.equipmentScheduleData) {
       returnState.equipmentScheduleData = props.equipmentScheduleData
        returnState.clinicList = props.equipmentScheduleData.clinics;
        returnState.existDeviceList = props.equipmentScheduleData.device_names
        returnState.showLoader = false;
        if (props.equipmentScheduleData.device !== undefined  && props.equipmentScheduleData.device !== state.deviceData) {
          returnState.deviceData = props.equipmentScheduleData.device;
          returnState.name = (!state.userChanged) ? returnState.deviceData.name : state.name;
          returnState.clinic_id = (!state.userChanged) ? returnState.deviceData.clinic_id : state.clinic_id;
          returnState.cleanup_time = (!state.userChanged) ? returnState.deviceData.cleanup_time : state.cleanup_time;

          for (var dayIndex = 1; dayIndex <= 7; dayIndex++) {
            const deviceSchedules = initDeviceSchedule(dayIndex);
            const daySchedule = [];
            returnState.deviceData.device_schedules.map((obj,idx) => {
              if(obj.day == dayIndex){
                  let scheduleInterval = {};
                  scheduleInterval.from_time_24 = obj.from_time;
                  scheduleInterval.from_time = convertTime24to12(obj.from_time);
                  scheduleInterval.from_time_option = getAmPm(obj.from_time);
                  scheduleInterval.to_time_24 = obj.to_time;
                  scheduleInterval.to_time = convertTime24to12(obj.to_time);
                  scheduleInterval.to_time_option = getAmPm(obj.to_time);
                  scheduleInterval.className = initScheduleClass();
                  daySchedule.push(scheduleInterval);
              }
            })
            if(daySchedule.length){
              deviceSchedules['schedules'] = daySchedule;
              deviceSchedules['is_checked'] = true;
            } else {
              deviceSchedules['is_checked'] = false;
            }
            returnState['deviceSchedule_'+dayIndex] = deviceSchedules;
          }
        }
     } else if(props.redirect != undefined && props.redirect == true) {
        toast.dismiss();
        toast.success(props.message)
        props.openListSchedule('equipment')
     } else if(props.showLoader != undefined && props.showLoader == false) {
        returnState.showLoader = false;
     }
     return returnState;
   }

   handleChildChange = (stateToUpdate) => {
     if(stateToUpdate.index != undefined && stateToUpdate.dayValue != undefined){
        let deviceScheduleList = this.state.deviceScheduleList;
        this.setState({['deviceSchedule_'+stateToUpdate.index] : stateToUpdate.dayValue});
     }
    }

   handleInputChange = (event) => {
     let returnState = {userChanged : true}
     const target = event.target;
     let value= target.value;
     let inputName = target.name;
     const  surveyindex = event.target.dataset.surveyindex;
     if(surveyindex){
     } else {
       if(inputName == 'duration'){
         returnState.custom_duration = "";
         returnState.customDurationClass = "newInputField";
       }
       if (inputName == 'name') {
         returnState.isUniqueName = checkUniqueName(this.state.deviceId,value,this.state.existDeviceList)
       }
       switch(target.type) {
         case 'checkbox': {
             value = target.checked;
             break;
         }
         case 'radio' :{
           value = (target.value == true || target.value == "true") ? true : false;
           if(value && inputName == 'is_device_dependent'){
             returnState.deviceListClass = "newInputField";
           }
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
     let deviceNameError = false
     let error = false;
     if(true){

       if (typeof this.state.name === undefined || this.state.name === null || this.state.name.trim() === '') {
         this.setState({
           nameClass:'newInputField field_error'
         })
         error = true;
       } else if(this.state.name) {
         if(!checkUniqueName(this.state.deviceId,this.state.name,this.state.existDeviceList)){
           this.setState({
             nameClass: 'newInputField field_error'
           })
           error = true;
           deviceNameError = true
           toast.dismiss()
           toast.error('Already added equipment: '+this.state.name)
         } else {
           this.setState({
             nameClass:'newInputField'
           })
         }
       }

       if (typeof this.state.clinic_id === undefined || this.state.clinic_id === null || this.state.clinic_id === '') {
         this.setState({
           cinicIdClass:'newInputField field_error'
         })
         error = true;
       } else if(this.state.clinic_id) {
         this.setState({
           cinicIdClass:'newInputField'
         })
       }

       let deviceSchedulesList = [];
       let sheduleTimeError = false;
       const currentDate = moment().format('YYYY-MM-DD');

       // Check To-time should not be greater than from-time
       for (var dayIndex = 1; dayIndex <= 7; dayIndex++) {
         let daySchedule = {}
         let deviceSchedule = null;
         deviceSchedule = this.state['deviceSchedule_' + dayIndex];
         if(deviceSchedule['is_checked']){
           daySchedule.day = dayIndex;
           let scheduleInterval = [];
           deviceSchedule['schedules'].map((obj, idx) => {
             deviceSchedule['schedules'][idx]['className'] = initScheduleClass();
             if(obj.from_time != '00:00' && obj.to_time != "00:00"){
               let schedule = {};
               schedule.from_time = convertTime12to24(obj.from_time+ " " +obj.from_time_option);
               schedule.to_time = convertTime12to24(obj.to_time+ " " +obj.to_time_option);
               if (moment(currentDate+' '+schedule.from_time) >= moment(currentDate+' '+schedule.to_time)) {
                 deviceSchedule['schedules'][idx]['className']['from_time'] = 'setting-input-box hours-time from-time-input field_error';
                 deviceSchedule['schedules'][idx]['className']['from_time_option'] = 'newSelectField hours-pm from_time_option field_error';
                 deviceSchedule['schedules'][idx]['className']['to_time'] = 'setting-input-box hours-time to-time-input field_error';
                 deviceSchedule['schedules'][idx]['className']['to_time_option'] = 'newSelectField hours-pm to_time_option field_error';
                 sheduleTimeError = true;
               } else {
                 scheduleInterval.push(schedule);
               }
             } else {
               if(obj.from_time == '00:00' && obj.to_time == "00:00"){
                 deviceSchedule['schedules'][idx]['className']['from_time'] = 'setting-input-box hours-time from-time-input field_error';
                 deviceSchedule['schedules'][idx]['className']['to_time'] = 'newSelectField hours-time to-time-input field_error';
               } else if(obj.from_time == '00:00'){
                 deviceSchedule['schedules'][idx]['className']['from_time'] = 'setting-input-box hours-time from-time-input field_error';
               } else if(obj.to_time == "00:00"){
                 deviceSchedule['schedules'][idx]['className']['to_time'] = 'newSelectField hours-time to-time-input field_error';
               }
               sheduleTimeError = true;
               error = true;
             }
           })
           daySchedule.schedules = scheduleInterval;
           deviceSchedulesList.push(daySchedule)
         }
       }
       if(sheduleTimeError && !deviceNameError) {
         error = true;
         const languageData = JSON.parse(localStorage.getItem('languageData'));
         toast.error(languageData.global['enter_valid_time']);
       }

       // Check Time- overlaping
       if(!sheduleTimeError){
         deviceSchedulesList = [];
         for (var dayIndex = 1; dayIndex <= 7; dayIndex++) {
           let daySchedule = {};
           let deviceSchedule = null;
           deviceSchedule = this.state['deviceSchedule_' + dayIndex];
           if (deviceSchedule['is_checked']) {
             daySchedule.day = dayIndex;
             let scheduleInterval = [];
             const copySchedules = deviceSchedule['schedules'];
             deviceSchedule['schedules'].map((obj, idx) => {
               //deviceSchedule['schedules'][idx]['className'] = initScheduleClass();
               const from_time = convertTime12to24(obj.from_time+ " " +obj.from_time_option);
               const to_time = convertTime12to24(obj.to_time+ " " +obj.to_time_option);
               let overLapError = false;
               copySchedules.map((copyObj, copyIdx) => {
                 if(idx != copyIdx){
                   const copy_from_time = convertTime12to24(copyObj.from_time+ " " +copyObj.from_time_option);
                   const copy_to_time = convertTime12to24(copyObj.to_time+ " " +copyObj.to_time_option);
                   if(((from_time >= copy_from_time) && (from_time <= copy_to_time)) ||
                   ((to_time <= copy_from_time) && (to_time >= copy_to_time)) ||
                   ((from_time == copy_from_time) && (to_time== copy_to_time))
                   ){
                     overLapError = true
                     overLapError = true
                     sheduleTimeError = true;
                     error = true;
                     deviceSchedule['schedules'][idx]['className']['from_time'] = 'setting-input-box hours-time from-time-input field_error';
                     deviceSchedule['schedules'][idx]['className']['from_time_option'] = 'newSelectField hours-pm from_time_option field_error';
                     deviceSchedule['schedules'][idx]['className']['to_time'] = 'setting-input-box hours-time to-time-input field_error';
                     deviceSchedule['schedules'][idx]['className']['to_time_option'] = 'newSelectField hours-pm to_time_option field_error';

                     deviceSchedule['schedules'][copyIdx]['className']['from_time'] = 'setting-input-box hours-time from-time-input field_error';
                     deviceSchedule['schedules'][copyIdx]['className']['from_time_option'] = 'newSelectField hours-pm from_time_option field_error';
                     deviceSchedule['schedules'][copyIdx]['className']['to_time'] = 'setting-input-box hours-time to-time-input field_error';
                     deviceSchedule['schedules'][copyIdx]['className']['to_time_option'] = 'newSelectField hours-pm to_time_option field_error';
                   }
                 }
               });
               if(!overLapError){
                 let schedule = {};
                 schedule.from_time = from_time;
                 schedule.to_time = to_time;
                 scheduleInterval.push(schedule);
               }
             });
             daySchedule.schedules = scheduleInterval;
             deviceSchedulesList.push(daySchedule)
           }
           this.setState({['deviceSchedule_' + dayIndex]:deviceSchedule})
         }
         if(sheduleTimeError && !deviceNameError){
           const languageData = JSON.parse(localStorage.getItem('languageData'));
           toast.error(languageData.global['time_overlapping']);
         }
       }

       if (error === true) {
          return;
       }

       let formData={
         name :this.state.name,
         clinic_id: this.state.clinic_id,
         cleanup_time: this.state.cleanup_time,
       }
       if(deviceSchedulesList.length > 0){
         formData.device_schedules = deviceSchedulesList;
       }
       this.setState({
         showLoader : true
       });
       const deviceId = this.state.deviceId;
       if(deviceId){
         this.props.updateEquipmentSchedule(formData,deviceId);
       } else{
        this.props.createEquipmentSchedule(formData);
       }
     }
   };

   showDeleteModal = () => {
      this.setState({showModal: true})
   }

   dismissModal = () => {
      this.setState({showModal: false})
   }

   deleteEquipmentSchedule = () => {
     if(this.state.deviceId){
       this.setState({showLoader: true, hideBtns : true})
       this.dismissModal();
       this.props.deleteEquipmentSchedule(this.state.deviceId);
     }
   }

   render(){
     return(
          <div >
             <div className="juvly-title">
                {this.state.appointment_equipment_schedule}
                <a onClick={() => {this.props.openListSchedule('equipment')}} className="pull-right cross-icon">
                  <img src="/images/close.png" />
                </a>
             </div>
             <div className="AppointmentSubtitle m-b-0 m-t-5">{this.state.appointment_business_hours}</div>
             <p className="AppointmentSubtitle m-b-20 m-t-10">{this.state.appointment_let_your_clients_know_when_you_are_open}</p>


             <div className="row">

                <div className="col-lg-6 col-xs-12">
                  <div className="business-hours-outer equipment-hours m-b-40">

                    <WeekScheduleHours
                       index={2}
                       dayValue={this.state.deviceSchedule_2}
                       handleChildChange={this.handleChildChange}
                       />
                    <WeekScheduleHours
                       index={3}
                       dayValue={this.state.deviceSchedule_3}
                       handleChildChange={this.handleChildChange}
                       />
                    <WeekScheduleHours
                       index={4}
                       dayValue={this.state.deviceSchedule_4}
                       handleChildChange={this.handleChildChange}
                       />
                    <WeekScheduleHours
                       index={5}
                       dayValue={this.state.deviceSchedule_5}
                       handleChildChange={this.handleChildChange}
                       />
                    <WeekScheduleHours
                       index={6}
                       dayValue={this.state.deviceSchedule_6}
                       handleChildChange={this.handleChildChange}
                       />
                    <WeekScheduleHours
                       index={7}
                       dayValue={this.state.deviceSchedule_7}
                       handleChildChange={this.handleChildChange}
                       />
                    <WeekScheduleHours
                       index={1}
                       dayValue={this.state.deviceSchedule_1}
                       handleChildChange={this.handleChildChange}
                       />
             </div>
                </div>


                <div className="col-lg-5 col-xs-12 pull-right">

                    <div className="newInputFileldOuter m-b-20">
                      <div className="newInputLabel">{this.state.appointment_equipment_equipment_name} <span className="setting-require">*</span></div>
                      <input name="name"  className={this.state.nameClass} maxLength={255} type="text" value={this.state.name} onChange={this.handleInputChange} autoComplete="off" />
                      {(this.state.isUniqueName === false) && <span className="field_error_span">Already added equipment: {this.state.name}</span>}
                   </div>


                   <div className="newInputFileldOuter m-b-20">
                      <div className="newInputLabel">{this.state.appointment_clinic} <span className="setting-require">*</span></div>
                      <select className={this.state.cinicIdClass} name="clinic_id" value={this.state.clinic_id} onChange={this.handleInputChange} >
                         <option value="">Select</option>
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

                   <div className="newInputFileldOuter m-b-20">
                      <div className="newInputLabel">{this.state.appointment_equipment_clean_up_time_in_minutes} </div>
                      <select name="cleanup_time" className={this.state.cleanupTimeClass} value={this.state.cleanup_time} onChange={this.handleInputChange} >
                         <option value="">Select</option>
                         <option value="5">5</option>
                         <option value="10">10</option>
                         <option value="15">15</option>
                         <option value="20">20</option>
                         <option value="25">25</option>
                         <option value="30">30</option>
                      </select>
                   </div>

                </div>
             </div>



             <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
             <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
             </div>
          </div>
          <div className="footer-static">
             {this.state.deviceId ?
                 <input className="new-red-btn pull-left confirm-model" onClick={this.showDeleteModal} data-message={this.state.equipment_schedule_delete_msg} data-confirm-url="" autoComplete="off" type="submit" value={this.state.label_delete} />
                 : null}
              <a className="new-blue-btn pull-right"   onClick={this.handleSubmit} >{this.state.label_save}</a>
          </div>
          <div className={(this.state.showModal) ? 'overlay' : ''} >
          </div>
          <div id="filterModal" role="dialog" className={(this.state.showModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
               <div className="modal-content">
                  <div className="modal-header">
                     <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                     <h4 className="modal-title" id="model_title">{this.state.delete_confirmation}</h4>
                  </div>
                  <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.equipment_schedule_delete_msg}</div>
                  <div className="modal-footer">
                     <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.label_no}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteEquipmentSchedule}>{this.state.label_yes}</button>
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
   if (state.AppointmentReducer.action === "EQUIPMENT_SCHEDULE_DATA") {
     if(state.AppointmentReducer.data.status != 200) {
       toast.dismiss();
       toast.error(languageData.global[state.AppointmentReducer.data.message]);
       returnState.showLoader = false
     } else {
       returnState.equipmentScheduleData = state.AppointmentReducer.data.data;
       returnState.deviceData = state.AppointmentReducer.data.data.device;
       returnState.clinicList = state.AppointmentReducer.data.data.clinics;
       returnState.status = 200;
     }
   } else if (state.AppointmentReducer.action === "CREATE_EQUIPMENT_SCHEDULE") {
     if(state.AppointmentReducer.data.status == 201){
       returnState.redirect = true;
       returnState.message = languageData.global[state.AppointmentReducer.data.message];
     } else {
       toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
       returnState.showLoader = false
     }
   }  else if(state.AppointmentReducer.action === 'UPDATE_EQUIPMENT_SCHEDULE') {
     if(state.AppointmentReducer.data.status == 200){
       returnState.redirect = true;
       returnState.message = languageData.global[state.AppointmentReducer.data.message];
     } else {
       toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
       returnState.showLoader = false
     }
   } else if(state.AppointmentReducer.action === 'DELETE_EQUIPMENT_SCHEDULE') {
     if(state.AppointmentReducer.data.status == 200){
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
      getEquipmentScheduleById:getEquipmentScheduleById,
      createEquipmentSchedule:createEquipmentSchedule,
      updateEquipmentSchedule :updateEquipmentSchedule,
      deleteEquipmentSchedule:deleteEquipmentSchedule,
      exportEmptyData :exportEmptyData

    },dispatch)
}



 export default connect(mapStateToProps, mapDispatchToProps) (CreateEditEquipmentSchedule);
