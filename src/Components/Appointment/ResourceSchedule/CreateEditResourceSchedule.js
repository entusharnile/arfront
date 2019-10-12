import React, { Component } from 'react';
import {
  getResourceScheduleById,
  createResourceSchedule,
  updateResourceSchedule,
  deleteResourceSchedule,
  createResourceType
} from '../../../Actions/Appointment/appointmentAction.js';
import config from '../../../config.js';
import { ToastContainer, toast } from "react-toastify";
import { Link, Redirect, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import WeekScheduleHours from './../Common/WeekScheduleHours.js';
import AppointmentHeader from '../AppointmentHeader.js'
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
    day: dayIndex,
    name: weekDaysName[dayIndex],
    is_checked: false,
    schedules: [{
      from_time: "00:00",
      from_time_option: "AM",
      from_time_24: '00:00',
      to_time: "00:00",
      to_time_option: "PM",
      to_time_24: '00:00',
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
class CreateEditResourceSchedule extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.state = {
      resourceData: {},
      clinicList: [],
      resourceTypeList: [],
      resourceId: 0,
      hideBtns: false,
      showModal: false,
      showLoader: false,
      userChanged: false,
      name: '',
      clinic_id: '',
      resource_type_id: '',
      is_add_new_resource_type: false,
      addNewResourceType: '',
      deviceSchedule_1: initDeviceSchedule(1),
      deviceSchedule_2: initDeviceSchedule(2),
      deviceSchedule_3: initDeviceSchedule(3),
      deviceSchedule_4: initDeviceSchedule(4),
      deviceSchedule_5: initDeviceSchedule(5),
      deviceSchedule_6: initDeviceSchedule(6),
      deviceSchedule_7: initDeviceSchedule(7),
      nameClass: 'newInputField',
      cinicIdClass: 'newInputField',
      resourceTypeIdClass: 'newSelectField',
      addNewResourceTypeClass: 'newInputField',
      isUniqueName:true,
      existResourceList: [],
      resourceScheduleData:{}
    };
  }

  componentDidMount() {
    window.onscroll = () => {
       return false;
    }
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      appointment_resource_schedule: languageData.appointments['appointment_resource_schedule'],
      appointment_business_hours: languageData.appointments['appointment_business_hours'],
      appointment_let_your_clients_know_when_you_are_open: languageData.appointments['appointment_let_your_clients_know_when_you_are_open'],
      appointment_resource_name: languageData.appointments['appointment_resource_name'],
      appointment_resource_type: languageData.appointments['appointment_resource_type'],
      appointment_clinic: languageData.appointments['appointment_clinic'],
      appointment_add_resource_type: languageData.appointments['appointment_add_resource_type'],
      appointment_open_hours: languageData.appointments['appointment_open_hours'],
      appointment_close_hours: languageData.appointments['appointment_close_hours'],
      resource_schedule_delete_msg: languageData.appointments['resource_schedule_delete_msg'],
      label_save: languageData.global['label_save'],
      label_cancel: languageData.global['label_cancel'],
      label_save: languageData.global['label_save'],
      label_delete: languageData.global['label_delete'],
      label_yes: languageData.global['label_yes'],
      label_no: languageData.global['label_no'],
      Please_Wait: languageData.global['Please_Wait'],
      delete_confirmation: languageData.global['delete_confirmation'],
    });

    this.setState({ showLoader: true })
    const resourceId = this.props.resourceScheduleId;
    if (resourceId) {
      this.setState({ resourceId: resourceId });
      this.props.getResourceScheduleById({}, resourceId);
    } else {
      this.props.getResourceScheduleById({}, 0);

    }
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {}
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
    if (props.resourceScheduleData !== undefined && props.resourceScheduleData !== state.resourceScheduleData) {
      returnState.resourceScheduleData = props.resourceScheduleData;
      returnState.clinicList = props.resourceScheduleData.clinics;
      returnState.existResourceList = props.resourceScheduleData.resource_names;
      returnState.resourceTypeList = props.resourceScheduleData.resource_types;
      returnState.showLoader = false;
      if (props.resourceScheduleData.resource !== undefined && props.resourceScheduleData.resource !== state.resourceData && state.resourceId) {
        returnState.resourceData = props.resourceScheduleData.resource;
        returnState.name = (!state.userChanged) ? props.resourceScheduleData.resource.name : state.name;
        returnState.clinic_id = (!state.userChanged) ? props.resourceScheduleData.resource.clinic_id : state.clinic_id;
        returnState.resource_type_id = (!state.userChanged) ? props.resourceScheduleData.resource.resource_type_id : state.resource_type_id;

        for (var dayIndex = 1; dayIndex <= 7; dayIndex++) {
          const resourceSchedules = initDeviceSchedule(dayIndex);
          const daySchedule = [];
          props.resourceScheduleData.resource.resource_schedules.map((obj, idx) => {
            if (obj.day == dayIndex) {
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
          if (daySchedule.length) {
            resourceSchedules['schedules'] = daySchedule;
            resourceSchedules['is_checked'] = true;
          } else {
            resourceSchedules['is_checked'] = false;
          }
          returnState['deviceSchedule_' + dayIndex] = resourceSchedules;
        }
      }
    } else if (props.reourceTypeData !== undefined && props.reourceTypeData !== state.reourceTypeData) {
      returnState.showLoader = false;
      returnState.reourceTypeData = props.reourceTypeData;
      let resourceTypeList = state.resourceTypeList;
      let resourceType = {
        id: props.reourceTypeData.id,
        name: props.reourceTypeData.name
      }
      resourceTypeList.push(resourceType);
      returnState.resourceTypeList = resourceTypeList;
      returnState.resource_type_id = props.reourceTypeData.id;
      returnState.is_add_new_resource_type = false;
    } else if (props.redirect != undefined && props.redirect == true) {
      toast.dismiss();
      toast.success(props.message)
      props.openListSchedule('resource');
    } else if (props.showLoader != undefined && props.showLoader == false) {
      returnState.showLoader = false;
    }
    return returnState;
  }

  handleChildChange = (stateToUpdate) => {
    if (stateToUpdate.index != undefined && stateToUpdate.dayValue != undefined) {
      let deviceScheduleList = this.state.deviceScheduleList;
      this.setState({ ['deviceSchedule_' + stateToUpdate.index]: stateToUpdate.dayValue });
    }
  }

  handleAddResourceType = () => {
    this.setState({ is_add_new_resource_type: !this.state.is_add_new_resource_type, addNewResourceTypeClass: 'newInputField' });
  }


  handleInputChange = (event) => {
    let returnState = { userChanged: true }
    const target = event.target;
    let value = target.value;
    let inputName = target.name;
    const surveyindex = event.target.dataset.surveyindex;
    if (surveyindex) {
    } else {
      if (inputName == 'duration') {
        returnState.custom_duration = "";
        returnState.customDurationClass = "newInputField";
      }
      if (inputName == 'name') {
        returnState.isUniqueName = checkUniqueName(this.state.resourceId,value,this.state.existResourceList)
      }
      switch (target.type) {
        case 'checkbox': {
          value = target.checked;
          break;
        }
        case 'radio': {
          value = (target.value == true || target.value == "true") ? true : false;
          if (value && inputName == 'is_device_dependent') {
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
    let targetName = event.target.name;
    let resourceNameError = false
    let error = false;
    if (targetName == 'addNewResourceTypeSave') {
      if (typeof this.state.addNewResourceType === undefined || this.state.addNewResourceType === null || this.state.addNewResourceType.trim() === '') {
        this.setState({
          addNewResourceTypeClass: 'newInputField field_error'
        })
        error = true;
      } else if (this.state.addNewResourceType) {
        this.setState({
          addNewResourceTypeClass: 'newInputField',
          addNewResourceType: ''
        })
      }
      if (error) {
        return;
      }

      let formData = {
        name: this.state.addNewResourceType,
        is_active: 1
      }
      this.setState({
        showLoader: true
      });
      this.props.createResourceType(formData);
      return;
    } else {
      if (typeof this.state.name === undefined || this.state.name === null || this.state.name.trim() === '' ) {
        this.setState({
          nameClass: 'newInputField field_error'
        })
        error = true;
      } else if (this.state.name) {
        if(!checkUniqueName(this.state.resourceId,this.state.name,this.state.existResourceList)){
          this.setState({
            nameClass: 'newInputField field_error'
          })
          error = true;
          resourceNameError = true
          toast.dismiss()
          toast.error('Already added devices: '+this.state.name)
        } else {
          this.setState({
            nameClass: 'newInputField'
          })
        }
      }

      if (typeof this.state.clinic_id === undefined || this.state.clinic_id === null || this.state.clinic_id === '') {
        this.setState({
          cinicIdClass: 'newInputField field_error'
        })
        error = true;
      } else if (this.state.clinic_id) {
        this.setState({
          cinicIdClass: 'newInputField'
        })
      }

      if (typeof this.state.resource_type_id === undefined || this.state.resource_type_id === null || this.state.resource_type_id === '') {
        this.setState({
          resourceTypeIdClass: 'newInputField field_error'
        })
        error = true;
      } else if (this.state.resource_type_id) {
        this.setState({
          resourceTypeIdClass: 'newInputField'
        })
      }
      if (this.state.is_add_new_resource_type) {
        if (typeof this.state.addNewResourceType === undefined || this.state.addNewResourceType === null || this.state.addNewResourceType.trim() === '') {
          this.setState({
            addNewResourceTypeClass: 'newInputField field_error'
          })
          error = true;
        } else if (this.state.addNewResourceType) {
          this.setState({
            addNewResourceTypeClass: 'newInputField'
          })
        }
      }

      let resourceSchedulesList = [];
      let sheduleTimeError = false;
      const currentDate = moment().format('YYYY-MM-DD');

      // Check To-time should not be greater than from-time
      for (var dayIndex = 1; dayIndex <= 7; dayIndex++) {
        let daySchedule = {};
        let deviceSchedule = null;
        deviceSchedule = this.state['deviceSchedule_' + dayIndex];
        if (deviceSchedule['is_checked']) {
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
                  deviceSchedule['schedules'][idx]['className']['to_time'] = 'setting-input-box hours-time to-time-input field_error';
                } else if(obj.from_time == '00:00'){
                  deviceSchedule['schedules'][idx]['className']['from_time'] = 'setting-input-box hours-time from-time-input field_error';
                } else if(obj.to_time == "00:00"){
                  deviceSchedule['schedules'][idx]['className']['to_time'] = 'setting-input-box hours-time to-time-input field_error';
                }
                sheduleTimeError = true;
                error = true;
              }
            })
            daySchedule.schedules = scheduleInterval;
            resourceSchedulesList.push(daySchedule)
        }
        this.setState({['deviceSchedule_' + dayIndex]:deviceSchedule})
      }
      if(sheduleTimeError && !resourceNameError) {
        error = true;
        const languageData = JSON.parse(localStorage.getItem('languageData'));
        toast.dismiss()
        toast.error(languageData.global['enter_valid_time']);
      }

      // Check Time- overlaping
      if(!sheduleTimeError){
        resourceSchedulesList = [];
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
                    overLapError = true;
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
            resourceSchedulesList.push(daySchedule)
          }
          this.setState({['deviceSchedule_' + dayIndex]:deviceSchedule})
        }
        if(sheduleTimeError && !resourceNameError){
          const languageData = JSON.parse(localStorage.getItem('languageData'));
          toast.dismiss()
          toast.error(languageData.global['time_overlapping']);
        }
      }

      if (error === true) {
        return;
      }

      let formData = {
        name: this.state.name,
        clinic_id: this.state.clinic_id,
        resource_type_id: this.state.resource_type_id,
      }
      if (resourceSchedulesList.length > 0) {
        formData.resource_schedules = resourceSchedulesList;
      }
      this.setState({
        showLoader: true
      });
      const resourceId = this.state.resourceId;
      if (resourceId) {
        this.props.updateResourceSchedule(formData, resourceId);
      } else {
        this.props.createResourceSchedule(formData);
      }
    }
  };

  showDeleteModal = () => {
    this.setState({ showModal: true })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteResourceSchedule = () => {
    if (this.state.resourceId) {
      this.setState({ showLoader: true, hideBtns: true })
      this.dismissModal();
      this.props.deleteResourceSchedule(this.state.resourceId);
    }
  }

  render() {
    return (
          <div>
              <div className="juvly-title">{this.state.appointment_resource_schedule}
                <a onClick={() => {this.props.openListSchedule('resource')}} className="pull-right cross-icon"><img src="/images/close.png" /></a>
              </div>
              <div className="AppointmentSubtitle m-b-0 m-t-5">{this.state.appointment_business_hours}</div>
              <p className="AppointmentSubtitle m-b-20 m-t-10">{this.state.appointment_let_your_clients_know_when_you_are_open}</p>


              <div class="row">
                <div class="col-lg-6 col-xs-12">

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
                <div class="col-lg-5 col-xs-12 pull-right">
                    <div className="newInputFileldOuter m-b-20">
                    <div className="newInputLabel">{this.state.appointment_clinic} <span className="setting-require">*</span></div>
                    <select className={this.state.cinicIdClass} name="clinic_id" value={this.state.clinic_id} onChange={this.handleInputChange} >
                      <option value="">Select</option>
                      {(this.state.clinicList.length) ?
                        this.state.clinicList.map((obj, idx) => {
                          return (
                            <option key={'clinic-' + idx} value={obj.id}>{obj.clinic_name}</option>
                          )
                        }) :
                        null
                      }
                    </select>
                  </div>

                  <div className="newInputFileldOuter">
                    <div className="newInputLabel">{this.state.appointment_resource_name} <span className="setting-require">*</span></div>
                    <input name="name" className={this.state.nameClass} maxLength={255} type="text" value={this.state.name} onChange={this.handleInputChange} autoComplete="off" />
                    {(this.state.isUniqueName === false) && <span className="field_error_span">Already added devices: {this.state.name}</span>}
                  </div>

                  <div className="newInputFileldOuter relative">
                    <div className="newInputLabel">{this.state.appointment_resource_type} <span className="setting-require">*</span></div>
                    <div className="row">
                      <div className="col-xs-12 m-b-20">
                        <select name="resource_type_id" className={this.state.resourceTypeIdClass} value={this.state.resource_type_id} onChange={this.handleInputChange} >
                          <option value="">Select</option>
                          {(this.state.resourceTypeList.length) ?
                            this.state.resourceTypeList.map((obj, idx) => {
                              return (
                                <option key={'resourcetype-' + idx} value={obj.id}>{obj.name}</option>
                              )
                            }) :
                            null
                          }
                        </select>
                      </div>
                      {(!this.state.is_add_new_resource_type) ?
                        <div className="col-xs-12">
                          <a href="javascript:void(0);" className="new-blue-btn no-margin" onClick={this.handleAddResourceType}>{this.state.appointment_add_resource_type}</a>
                        </div>
                        :
                        <div className="m-b-20">
                          <div className="col-sm-7 col-xs-12 resource-type-field m-t-0">
                            <input name="addNewResourceType" className={this.state.addNewResourceTypeClass} value={this.state.addNewResourceType} type="text" placeholder="Enter resource type" autoComplete="off" onChange={this.handleInputChange} />
                          </div>
                          <div className="col-sm-5 col-xs-12 no-padding">
                            <a href="javascript:void(0);" className="new-blue-btn no-margin no-width" name='addNewResourceTypeSave' onClick={this.handleSubmit} >{this.state.label_save}</a>
                            <a href="javascript:void(0);" className="new-blue-btn no-margin no-width m-l-5" onClick={this.handleAddResourceType} >{this.state.label_cancel}</a>
                          </div>
                        </div>
                      }
                    </div>
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
              {this.state.resourceId ?
                <input className="new-red-btn pull-left confirm-model" onClick={this.showDeleteModal} data-message={this.state.resource_schedule_delete_msg} data-confirm-url="" type="submit" autoComplete="off" value={this.state.label_delete} />
                : null}
              <div className={(this.state.showModal) ? 'overlay' : ''} ></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.delete_confirmation}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.resource_schedule_delete_msg}</div>
                    <div className="modal-footer">
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.label_no}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteResourceSchedule}>{this.state.label_yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <input className="new-blue-btn pull-right" name='save_services' id="save_services" onClick={this.handleSubmit} type="button" autoComplete="off" defaultValue={this.state.label_save} />
              <a onClick={() => {this.props.openListSchedule('resource')}} className="new-white-btn pull-right cancelAction">{this.state.label_cancel}</a>
            </div>
        </div>
    );
  }
}
function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.AppointmentReducer.action === "RESOURCE_SCHEDULE_DATA") {
    if (state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.resourceScheduleData = state.AppointmentReducer.data.data;
    }
  } else if (state.AppointmentReducer.action === "CREATE_RESOURCE_SCHEDULE") {
    if (state.AppointmentReducer.data.status == 201) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'UPDATE_RESOURCE_SCHEDULE') {
    if (state.AppointmentReducer.data.status == 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'DELETE_RESOURCE_SCHEDULE') {
    if (state.AppointmentReducer.data.status == 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'CREATE_RESOURCE_TYPE') {
    if (state.AppointmentReducer.data.status == 201) {
      returnState.reourceTypeData = state.AppointmentReducer.data.data.resource_type_data;
      toast.dismiss();
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'EMPTY_DATA') {
    returnState.showLoader = false
  }
  return returnState;
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getResourceScheduleById: getResourceScheduleById,
    createResourceSchedule: createResourceSchedule,
    updateResourceSchedule: updateResourceSchedule,
    deleteResourceSchedule: deleteResourceSchedule,
    createResourceType: createResourceType

  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateEditResourceSchedule);
