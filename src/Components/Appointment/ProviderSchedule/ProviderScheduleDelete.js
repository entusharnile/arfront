import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import config from '../../../config';
import calenLogo from '../../../images/calender.svg';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import AppointmentHeader from '../AppointmentHeader.js'
import {
  getScheduleOfProvider,
  deleteMassSchedule
} from '../../../Actions/Appointment/appointmentAction.js';
import { convertTime12to24, convertTime24to12, getAmPm, showFormattedDate, formatTime} from '../../../Utils/services.js';

const dateFormatPicker = 'yyyy-MM-dd';
const dateFormatMoment = 'YYYY-MM-DD';


const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}
const viewDateFormat = (date) => {
  return moment(date).format('MMMM DD, YYYY');
}


class ProviderScheduleDelete extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    localStorage.setItem("showLoader", true);
    this.state = {
      globalLang: languageData.global,
      appointmentLang: languageData.appointments,
      clinics: [],
      selectedClinics: [],
      selectedSchedules: [],
      providerId: this.props.providerId,
      showClinics: false,
      selectAllSchedules: false,
      selectAllClinics: false,
      selectAllVisible: false,
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick, false);

    const providerId = this.props.providerId
    if (providerId) {
      let formData = {};
      this.showLoaderFunc()
      this.props.getScheduleOfProvider(formData, providerId);
    }
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {}
    if(props.providerScheduleData != undefined && props.providerScheduleData != state.providerScheduleData){
      if(localStorage.getItem('showLoader') == 'false') {
        let selectedClinics = [],
        allAssociatedClinicIds = [];
        returnState.providerScheduleData = props.providerScheduleData;
        returnState.clinics = props.providerScheduleData.associated_clinics;
        if(props.providerScheduleData.associated_clinics && props.providerScheduleData.associated_clinics.length > 0) {
          props.providerScheduleData.associated_clinics.map((obj, idx) => {
            allAssociatedClinicIds.push(obj.clinic_id)
            if(state['clinic-'+obj.clinic_id]) {
              selectedClinics.push(obj.clinic_id)
              returnState['clinic-'+obj.clinic_id] = true;
            } else if(state['clinic-'+obj.clinic_id] && state['clinic-'+obj.clinic_id] == false) {
              returnState['clinic-'+obj.clinic_id] = false;
            }
          })
        }

        if(selectedClinics.length == 0) {
          selectedClinics = allAssociatedClinicIds
          selectedClinics.map((obj, idx) => {
            returnState['clinic-'+obj] = true;
          })
        }

        returnState.selectedClinics = selectedClinics;
        if(selectedClinics) {
          returnState.selectAllClinics = true;
        }
        returnState.schedules = props.providerScheduleData.provider_schedules;
        if(props.responseMode && props.responseMode == 'delete'){
          returnState.schedules.map((obj, idx) => {
            returnState['schedule-'+obj.id] = false;
          })
        }
        returnState.selectAllVisible = false;
        returnState.showLoader = false;
        returnState.selectedSchedules = [];
        localStorage.setItem("showLoader", true);
      }
    }
    return returnState
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value= target.value;
    let name = event.target.name;
    let returnState = {}
    switch(target.type) {
        case 'checkbox': {
            value = target.checked;
            break;
        }

        case 'radio' :{
          value = target.value;
          break;
      }
    }

    if(name.startsWith('clinic-')) {
      let nameArr = name.split('-');
      let clinicId = parseInt(nameArr[1]);
      let selectedClinics = this.state.selectedClinics;
      if(value) {
        selectedClinics.push(clinicId);
        returnState.selectAllClinics = true;
      } else {
        let index = selectedClinics.indexOf(clinicId);
        console.log(index, clinicId);
        if(index > -1) {
          selectedClinics.splice(index,1)
        }
      }
      console.log(selectedClinics);
      returnState.selectedClinics = selectedClinics;
    }
    if(name.startsWith('schedule-')) {
      let nameArr = name.split('-');
      let scheduleId = nameArr[1];
      let selectedSchedules = this.state.selectedSchedules;
      if(value) {
        selectedSchedules.push(scheduleId);
      } else {
        let index = selectedSchedules.indexOf(scheduleId);
        if(index > -1) {
          selectedSchedules.splice(index,1)
        }
      }
      returnState.selectedSchedules = selectedSchedules;
    }

    returnState[event.target.name] = value;
    returnState.userChanged = true;
    this.setState(returnState);
  }

  showLoaderFunc = ()  => {
    this.setState({showLoader: true});
    localStorage.setItem("showLoader", true);
  }

  handleClick = (e) =>  {

    if((this.state.showClinics) && e.target.parentElement.className !== 'cal-filter-outer') {
      if (this.state.showClinics && !this.refClinicButton.contains(e.target)) {
        this.setState({showClinics:false})
      }
    }
  }

  toggleClinics = (event) => {
    if(event.target.className == 'multi-sel-btn' || event.target.className == 'line-btn pull-right text-center') {
      this.setState({showClinics : !this.state.showClinics, userChanged: true})
    }
  }

  toggleAllClinics = (event) => {
    event.stopPropagation()
    let allClinics = this.state.clinics;
    let returnState = {}
    let x = (this.state.selectAllClinics) ? false : true;
    let selectedClinics = [];
    returnState.selectAllClinics = x;
    allClinics.map((obj, idx) => {
      returnState["clinic-"+obj.clinic_id] = x;
      selectedClinics.push(obj.clinic_id);
    })
    returnState.selectedClinics = (x) ? selectedClinics : [];
    returnState.userChanged = true;
    this.setState(returnState)
  }

  selectAllVisible = (event) => {
    event.stopPropagation()
    let allSchedules = this.state.schedules;
    let returnState = {}
    let selectedSchedules = [];
    let x = (this.state.selectAllSchedules) ? false : true;
    returnState.selectAllSchedules = x;
    allSchedules.map((obj, idx) => {
      returnState["schedule-"+obj.id] = x;
      selectedSchedules.push(obj.id);
    })
    returnState.selectedSchedules = (x) ? selectedSchedules : [];
    returnState.selectAllVisible = !this.state.selectAllVisible;
    returnState.userChanged = true;
    this.setState(returnState)
  }

  showDeleteModal = () => {
    this.setState({showModal: true})
  }

   dismissModal = () => {
      this.setState({showModal: false})
   }

   deleteSchedule = () => {
      this.dismissModal();
      if(this.state.selectedSchedules.length) {
        let formData = {}
        let ids = []
        this.state.selectedSchedules.map((obj, idx) => {
          if(this.state['schedule-'+obj]) {
            ids.push(obj)
          }
        })
        formData.schedule_ids = ids;
        formData.provider_id = this.state.providerId;
        this.showLoaderFunc()
        this.props.deleteMassSchedule(formData);
      } else {
        toast.error('Please select at least one schedule to delete!')
      }
   }

  applyFilter = () => {
    let formData = {}

    if(this.state.selectedClinics.length)
      formData.clinic_ids = this.state.selectedClinics;
    this.showLoaderFunc()
    this.props.getScheduleOfProvider(formData, this.state.providerId);
  }
  backToProviderSchedule = () => {
    this.props.backToProviderSchedule()
  }

  render() {
    let clinicLabel = (!this.state.selectedClinics.length) ? this.state.appointmentLang.appointment_select_all : this.state.appointmentLang.appointment_unselect_all;
    return (<div>
    <div className="juvly-section full-width">
      <div className="setting-search-outer">
        <a onClick={this.backToProviderSchedule} className="new-blue-btn pull-left consent-model no-margin" id="sign">{this.state.appointmentLang.appointment_go_back}</a>
        <div className={(this.state.showClinics) ? "multi-sel-btn active" : "multi-sel-btn"} onClick={this.toggleClinics} ref={(refClinicButton) => this.refClinicButton = refClinicButton}>{((this.state.clinics.length == 0) ? "No Clinic" : (this.state.selectedClinics.length == 0) ? "All Clinics" : "All Selected ("+this.state.selectedClinics.length+")")}

          <ul className={(this.state.showClinics && this.state.clinics.length > 0) ? "new-dropdown-menu Providers" : "new-dropdown-menu Providers no-visible"}>
            <li id="select_btn_li">
              <a className={(this.state.clinics.length == 0) ? "line-btn pull-right no-display text-center" : "line-btn pull-right text-center"} onClick={this.applyFilter} disabled={this.state.clinics.length}>{this.state.appointmentLang.appointment_apply}</a>
              <a className={(this.state.clinics.length == 0) ? "line-btn pull-right no-display" : "line-btn pull-right"} onClick={this.toggleAllClinics} disabled={this.state.clinics.length}>{clinicLabel}</a>
            </li>
            {this.state.clinics.length > 0 && this.state.clinics.map((obj, idx) => {
              return (
              <li key={"clinics-"+idx}>
                  <label  data-tip={obj.name}>
                    <input type="checkbox" value={obj.clinic_id} name={"clinic-"+obj.clinic_id} checked={(this.state["clinic-"+obj.clinic_id]) ? "checked" : false} autoComplete="off" onChange={this.handleInputChange} className={"clinicCheckbox "} data-tip={obj.clinic.clinic_name} /> {obj.clinic.clinic_name}{this.state["clinic-"+obj.clinic_id]}
                    <span > &nbsp; </span>
                  </label>
              </li>
               )
            })}
          </ul>
        </div>
        <div className="right-sign-btn">
          <input className="pull-left sel-all-visible" type="checkbox" id="select-all-pending-procedures" name="selectAllVisible" checked={(this.state.selectAllVisible) ? "checked" : false} onClick={this.selectAllVisible} />
          <label className="search-text" >{this.state.appointmentLang.appointment_select_all_visible}</label>
          <button type="submit" className="new-blue-btn pull-right consent-model" id="sign" onClick={this.showDeleteModal}>{this.state.appointmentLang.appointment_delete_schedule}</button>
        </div>
      </div>

      <div className="table-responsive min-h-200">
        <table className="table-updated setting-table min-w-1000 ajax-view">
        <thead className="table-updated-thead">
          <tr>
            <th className="table-checkbox table-updated-th"></th>
            <th className="col-xs-4 table-updated-th">{this.state.appointmentLang.appointment_clinic_name}</th>
            <th className="col-xs-4 table-updated-th">{this.state.appointmentLang.appointment_date}</th>
            <th className="col-xs-4 table-updated-th">{this.state.appointmentLang.appointment_schedule}</th>
          </tr>
        </thead>
        <tbody className="patient-list">
          {this.state.schedules && this.state.schedules.length > 0  && this.state.schedules.map((obj, idx) => {
            return (
                <tr className="table-updated-tr md-rooms-checkbox" key={"schedule-"+idx}>
                  <td className="table-checkbox table-updated-td">
                    <input type="checkbox" name={"schedule-"+obj.id} onChange={this.handleInputChange} value={obj.id} checked={(this.state["schedule-"+obj.id]) ? "checked" : false} className="cursor-pointer select_pending_procedure"/>
                  </td>
                  <td className="col-xs-4 table-updated-td">{obj.title}</td>
                  <td className="col-xs-4 table-updated-td"> {showFormattedDate(obj.schedule_date)}</td>
                  <td className="col-xs-4 table-updated-td modal-link">{formatTime(obj.start_time)} - {formatTime(obj.end_time)}</td>
                </tr>
              )
          })}

        </tbody>
      </table>
      {this.state.schedules && this.state.schedules.length == 0 &&
        <div className="" style={{float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px"
          }}
        >
          {this.state.appointmentLang.appointment_sorry_no_record_found}
        </div>
      }
    </div>
    </div>
    <div className={(this.state.showModal ? 'overlay' : '')}></div>
      <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
              <h4 className="modal-title" id="model_title">{"Confirmation Required"}{this.state.showModal}</h4>
            </div>
            <div id="errorwindow" className="modal-body add-patient-form filter-patient">
              {this.state.appointmentLang.appointment_r_u_sure_want_to_delete}
            </div>
            <div className="modal-footer" >
              <div className="col-md-12 text-left" id="footer-btn">

                <button type="button" className="btn logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.appointmentLang.no_option}</button>
                <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteSchedule}>{this.state.appointmentLang.appointment_yes}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock full-fixed-loader' : 'new-loader text-left full-fixed-loader'}>
        <div className="loader-outer">
          <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
          <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
        </div>
      </div>
    </div>
    )
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  localStorage.setItem("showLoader", false);
  if (state.AppointmentReducer.action === "SCHEDULE_OF_PROVIDER") {
    if (state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.providerScheduleData = state.AppointmentReducer.data.data;
    }
  }
  if (state.AppointmentReducer.action === "DELETE_MASS_SCHEDULES") {
    if (state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      let res = languageData.global[state.AppointmentReducer.data.message].replace("$i", state.AppointmentReducer.data.data.i)
      res = res.replace("$j", state.AppointmentReducer.data.data.j)
      toast.success(res)
      returnState.providerScheduleData = state.AppointmentReducer.data.data;
      returnState.responseMode = "delete";
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getScheduleOfProvider: getScheduleOfProvider,
    deleteMassSchedule: deleteMassSchedule,
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProviderScheduleDelete);
