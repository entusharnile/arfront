import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import axios from 'axios';
import { connect } from 'react-redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import DatePicker from "react-datepicker";
import Select from 'react-select';
import { Link } from 'react-router-dom';
import config from '../../../config';
import {PropTypes} from 'prop-types';
import { DragDropContext } from "react-dnd";
import HTML5Backend from 'react-dnd-html5-backend';
import moment from 'moment';
import AppointmentHeader from '../AppointmentHeader.js'
import BigCalendar from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import { getAppointments, getAppointment, markNoShow, updateNotes, checkin, makePatientCheckin, exportEmptyData, getAppointmentFees, getCancelNotification, cancelAppointment, checkRescheduleTime, rescheduleAppointment, sendNotification} from '../../../Actions/Appointment/appointmentAction.js';
import calenLogo from '../../../images/calender.svg';
import { convertTime12to24, convertTime24to12, getAmPm, displayName } from '../../../Utils/services.js';
let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])
//import localizer from 'react-big-calendar/lib/localizers/globalize'
const localizer = BigCalendar.momentLocalizer(moment)



const DragAndDropCalendar = withDragAndDrop(BigCalendar)

const showSelectedWeek = (date = moment()) => {
  let showSelectedLabel = '';
  let startOfWeek = moment(date).startOf('week');
  let ednOfWeek = moment(date).endOf('week');
  if (startOfWeek.format('YYYY') != ednOfWeek.format('YYYY')) {
    showSelectedLabel = startOfWeek.format('MMM DD, YY - ') + ednOfWeek.format('MMM DD, YY')
  } else if (startOfWeek.format('MM') != ednOfWeek.format('MM')) {
    showSelectedLabel = startOfWeek.format('MMM DD - ') + ednOfWeek.format('MMM DD, YYYY')
  } else {
    showSelectedLabel = startOfWeek.format('MMM ') + startOfWeek.format('DD - ') + ednOfWeek.format('DD, YYYY');
  }
  return showSelectedLabel;
}

const startEndDateOfWeek = (date, format = 'MM-DD-YYYY') => {
  return {
    start:moment.utc(date, format).startOf('week'),
    end: moment.utc(date, format).endOf('week'),
  }
}

const isEmpty = (obj) => {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


const viewDateFormat = (date) => {
  return moment(date).format('MMMM DD, YYYY');
}

class Calendar extends Component {

  constructor(props) {
    super(props);
    const languageData  = JSON.parse(localStorage.getItem('languageData'))
    this.props.exportEmptyData({})
    let user = JSON.parse(localStorage.getItem('userData'));
    var today = new Date();
    var dd = today.getDate()+1;
        var mm = today.getMonth()+1;
        var yyyy = today.getFullYear();

        today = dd+'/'+mm+'/'+yyyy;

    this.state = {
      showSelectedDate : moment().format('LL'),
      selectedDate : moment().toDate(),
      providers: [],
      clinics: [],
      services: [],
      calendarView: 'day',
      showLoader: false,
      showProvider: false,
      showService: false,
      showClinics: false,
      selectedProviders: [],
      selectedServices: [],
      selectedClinic : '',
      showAppointmentDetails: false,
      appointmentData: [],
      available_buttons: [],
      editAppointmentId: 0,
      showBookings: false,
      showEditNote: false,
      checkinData: [],
      showCheckinData : false,
      room: '',
      customer_note: '',
      send_to_provider: false,
      last_canceled_appointment: null,
      markedAsNoShow: true,
      selectedProvidersLength: 0,
      selectedServicesLength: 0,
      globalLang       : languageData.global,
      appointmentLang : languageData.appointments,
      userChanged: false,
      forceChanged: false,
      showNotifyPop: false,
      showModal : false,
      cancelNotificationMessage : {},
      rescheduledData: {},
      notification_type : 'email',
      noteError: false,
      refreshListAfterCancelling: false

    }

    this.moveEvent = this.moveEvent.bind(this)
    //BigCalendar.props.onNavigate('NEXT');
  }
  handleSelect = ({ start, end, resourceId }) => {
    /*const title = window.prompt('New Event name')
    if (title)
      this.setState({
        events: [
          ...this.state.events,
          {
            start,
            end,
            title,
            resourceId
          },
        ],
      })*/
  }

  navigate = () => {
  }
  getAppointmentFees = (event) => {
      localStorage.setItem("showLoader", true);
      this.setState({showLoader: true, feesMode: event.currentTarget.dataset.mode})
      this.props.getAppointmentFees(this.state.editAppointmentId)
  }

  onView = (event) => {
  }

  moveEvent({ event, start, end, resourceId, isAllDay: droppedOnAllDaySlot }) {
    const { events } = this.state
    if(event.resourceId != resourceId) {
      return
    }


    const idx = events.indexOf(event)
    let allDay = event.allDay

    if (!event.allDay && droppedOnAllDaySlot) {
      allDay = true
    } else if (event.allDay && !droppedOnAllDaySlot) {
      allDay = false
    }
    const updatedEvent = { ...event, start, end, resourceId, allDay }
    localStorage.setItem("showLoader", true);
    this.setState({showLoader: true, updatedEvent : updatedEvent, appointment_id: event.id});
    let formData = {}
    formData.startdate = moment(start).format("YYYY-MM-DD HH:mm:ss");
    formData.appointment_id = event.id
    this.props.checkRescheduleTime(formData);

    /* will use it later */
    /*const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)
    this.setState({
      events: nextEvents,
      forceChanged: true
    })*/
  }

  resizeEvent = (resizeType, { event, start, end }) => {
    const { events } = this.state

    const nextEvents = events.map(existingEvent => {
      return existingEvent.id == event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    })

    this.setState({
      events: nextEvents,
    })
  }
componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
    this.props.exportEmptyData({});
  }

handleClick = (e) =>  {
  if (!this.refServiceButton.contains(e.target)) {
    this.setState({showService:false})
  }
  if (!this.refProviderButton.contains(e.target)) {
    this.setState({showProvider:false})
  }
  if (!this.refClinicButton.contains(e.target)) {
    this.setState({showClinics:false})
  }

}
componentDidMount() {
  document.addEventListener('click', this.handleClick, false);
  const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      showLoader : true
  })
  let formData = {}
  formData.start = moment().format('YYYY-MM-DD');
  formData.end = moment().format('YYYY-MM-DD');
  this.setState({showLoader: true})
  this.props.getAppointments(formData);
}

static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    toast.dismiss();
      if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        returnState.showLoader = false;
        return returnState;
     }

    if (nextProps.notificationSent != undefined && nextProps.notificationSent == true) {
      if(localStorage.getItem("showLoader") == "false") {
        toast.success(nextProps.message);
        returnState.showLoader = false;
        returnState.showNotifyPop = false;
        returnState.refreshListAfterCancelling = !prevState.refreshListAfterCancelling;
        return returnState;
      }
    }
    if (nextProps.notesUpdates != undefined && nextProps.notesUpdates == true) {
      if(localStorage.getItem("showLoader") == "false") {
        toast.success(nextProps.message);
        returnState.showLoader = false;
        returnState.showEditNote = false;
        return returnState;
      }
    }


    if(nextProps.rescheduledData != undefined && nextProps.rescheduledData != prevState.rescheduledData) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.rescheduledData = nextProps.rescheduledData;
        if(nextProps.rescheduledData.status == 'fail') {
          returnState.showLoader = false;
          toast.error('Time is not available!!!')
          return returnState;
        } else {
          let formData = {}
          formData.appointment_id = prevState.updatedEvent.id;
          formData.appointment_date = moment(prevState.updatedEvent.start).format('YYYY-MM-DD');
          formData.appointment_time = moment(prevState.updatedEvent.start).format('HH:mm:ss');
          nextProps.rescheduleAppointment(formData);
        }
      }
     }
    if(nextProps.patientCheckedIn != undefined && nextProps.patientCheckedIn == true) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        returnState.showCheckinData = false;
        toast.success(nextProps.message);
        return returnState;
      }
     }
    if(nextProps.updatedAppointmentData != undefined && nextProps.updatedAppointmentData != prevState.updatedAppointmentData) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.updatedAppointmentData = nextProps.updatedAppointmentData;
        returnState.noti_type = nextProps.updatedAppointmentData.noti_type;
        returnState.appointment_email_text = nextProps.updatedAppointmentData.appointment_email_text;
        returnState.notification_body = nextProps.updatedAppointmentData.appointment_email_text;
        returnState.appointment_sms = nextProps.updatedAppointmentData.appointment_sms;
        returnState.appointment_subject = nextProps.updatedAppointmentData.appointment_subject;
        returnState.showAppointmentDetails = false;
        returnState.showNotifyPop = true;
        returnState.showLoader = false;
        returnState.notiMode = 'reschedule';
        return returnState;
      }
     }

    if(nextProps.appointmentCancelled != undefined && nextProps.appointmentCancelled == true) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        returnState.refreshListAfterCancelling = false;
        returnState.showNotifyPop = false;
        toast.success(nextProps.message);
        return returnState;
      }
     }

    if(nextProps.appointmentFees != undefined && nextProps.appointmentFees != prevState.appointmentFees) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.appointmentFees = nextProps.appointmentFees;
        if(nextProps.appointmentFees.cancellation_fee){
          returnState.cancellation_fee = nextProps.appointmentFees.cancellation_fee;
          returnState.showLoader = false;
          returnState.showAppointmentDetails = false;
          returnState.showModal = true;
        } else {
          returnState.cancellation_fee = 0;
          if(prevState.feesMode == 'cancel') {
            nextProps.getCancelNotification(prevState.editAppointmentId);
          } else {
            let formData = {};
            formData.appointment_id = prevState.editAppointmentId;
            formData.charge = false;
            nextProps.markNoShow(formData);
          }
        }
        return returnState;
      }
    }
    if(nextProps.cancelNotificationMessage != undefined && nextProps.cancelNotificationMessage != prevState.cancelNotificationMessage) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.cancelNotificationMessage = nextProps.cancelNotificationMessage;
        returnState.noti_type = nextProps.cancelNotificationMessage.noti_type;
        returnState.appointment_email_text = nextProps.cancelNotificationMessage.appointment_email_text;
        returnState.notification_body = nextProps.cancelNotificationMessage.appointment_email_text;
        returnState.appointment_sms = nextProps.cancelNotificationMessage.appointment_sms;
        returnState.appointment_subject = nextProps.cancelNotificationMessage.appointment_subject;
        returnState.showAppointmentDetails = false;
        returnState.showNotifyPop = true;
        returnState.showLoader = false;
        returnState.notiMode = 'cancel';

        return returnState;
      }
    }

    if (nextProps.appointmentData != undefined && nextProps.appointmentData !== prevState.appointmentData && localStorage.getItem("showLoader") == "false") {
        if(!isEmpty(nextProps.appointmentData)){
          let returnState = {};
          returnState.appointmentData = nextProps.appointmentData;
          returnState.appointment_details = nextProps.appointmentData.appointment_details;
          returnState.appointment_user_log = nextProps.appointmentData.appointment_user_log;
          returnState.available_buttons = nextProps.appointmentData.available_buttons;
          returnState.last_canceled_appointment = nextProps.appointmentData.last_canceled_appointment;
          returnState.notes = nextProps.appointmentData.appointment_details.appointment_booking.appointment_notes;
          returnState.showAppointmentDetails = true;
          returnState.showLoader = false;
          return returnState;
        }
    }

    if (nextProps.checkinData != undefined && nextProps.checkinData !== prevState.checkinData && localStorage.getItem("showLoader") == "false") {
      if(nextProps.checkinData.length) {
        nextProps.checkinData.map((obj, idx) => {
          returnState["notes-"+obj.id] = false;
        })
      }
      returnState.checkinData = nextProps.checkinData;
      returnState.showLoader = false;
      returnState.showAppointmentDetails = false;
      returnState.showCheckinData = true;
      return returnState;
    }

    if (nextProps.markedAsNoShow != undefined && nextProps.markedAsNoShow == true) {
      if(localStorage.getItem("showLoader") == "false"){
        toast.success(nextProps.message);
        returnState.markedAsNoShow = false;
        returnState.showAppointmentDetails = false;
        returnState.showLoader = false;
        returnState.showModal = false;
        return returnState
        //nextProps.history.push(`/appointment/calendar`);
      }
    }

    if (nextProps.appointmentsData != undefined &&
      nextProps.appointmentsData !== prevState.appointmentsData
    ) {
      if(localStorage.getItem("showLoader") == "false"){
        let resourceMap = [],
            appointments = []
        if(nextProps.appointmentsData.resources.length) {
          nextProps.appointmentsData.resources.map((obj,idx) => {
            resourceMap.push({resourceId: obj.id,resourceTitle: displayName(obj), resourceColor: '#FF1493'})
          })
        } else {
          resourceMap.push({resourceId: 0,resourceTitle: "", resourceColor: '#FF1493'})
        }
        if(nextProps.appointmentsData.doctor_ids.length) {
          nextProps.appointmentsData.doctor_ids.map((obj, idx) => {
            returnState['provider-'+obj] = true;
          })
          returnState.selectedProvidersLength = nextProps.appointmentsData.doctor_ids.length;
        }
        returnState.selectedProviders = (prevState.userChanged) ? prevState.selectedProviders : nextProps.appointmentsData.doctor_ids;
        if(nextProps.appointmentsData.appointments.length) {
          nextProps.appointmentsData.appointments.map((obj,idx) => {
            let dateArr = obj.appointment_date.split('-');
            let startTime = obj.appointment_start_time.split(':');
            let endTime = obj.appointment_end_time.split(':');
            appointments.push({
                id: obj.id,
                title: displayName(obj.patient),
                start: new Date(dateArr[0], dateArr[1]-1, dateArr[2], startTime[0],startTime[1],startTime[2]),
                end: new Date(dateArr[0], dateArr[1]-1, dateArr[2], endTime[0],endTime[1],endTime[2]),
                resourceId: obj.user_id,
                color: obj.color
              })
          })
        }

        let clinic = nextProps.appointmentsData.clinics.find(y => y.id == nextProps.appointmentsData.clinic_id);
        let open = nextProps.appointmentsData.clinicOpensAt.split(':');
        let close = nextProps.appointmentsData.clinicClosesAt.split(":");
        returnState.events = (prevState.forceChanged) ? prevState.events : appointments;
        returnState.clinics = nextProps.appointmentsData.clinics;
        returnState.providers = nextProps.appointmentsData.providers;
        returnState.resourceMap = resourceMap;
        returnState.services = nextProps.appointmentsData.services;
        returnState.clinic_id = nextProps.appointmentsData.clinic_id;
        returnState.selectedClinic = clinic.clinic_name;
        returnState.showLoader =  false;
        returnState.forceChanged =  false;
        //returnState.showProvider = (prevState.userChanged) ? prevState.showProvider : false;
        //returnState.showService = (prevState.userChanged) ? prevState.showService : false;
        //returnState.showClinics = (prevState.userChanged) ? prevState.showClinics : false;
        returnState.min = new Date(2019, 1, 28, open[0], open[1], open[2]);
        returnState.max = new Date(2019, 1, 28, close[0], close[1], close[2]);
      }
      return returnState;
    }

    return null;
  }

showPreviousBookings = (event) => {
  event.preventDefault();
  this.setState({showBookings : !this.state.showBookings})
}

editNote = () => {
  this.setState({showEditNote: !this.state.showEditNote})
}

saveNotes = () => {
  this.setState({noteError: false})
  if(this.state.notes.trim() == '') {
    this.setState({noteError: true});
    return false;
  }
  localStorage.setItem('showLoader', true);
  this.setState({noteError: false, showLoader: true});
  let formData = {}
  formData.appointment_id = this.state.editAppointmentId;
  formData.note = this.state.notes;
  this.props.updateNotes(formData);
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

  if(name.startsWith('provider-')) {
    let nameArr = name.split('-');
    let providerId = parseInt(nameArr[1]);
    let selectedProviders = this.state.selectedProviders;
    if(value) {
      selectedProviders.push(providerId);
    } else {
      let index = selectedProviders.indexOf(providerId);
      if(index > -1) {
        selectedProviders.splice(index,1)
      }
    }
    returnState.selectedProvidersLength = selectedProviders.length;
    returnState.selectedProviders = selectedProviders;
    returnState.showProvider = false;
  }

  if(name.startsWith('service-')) {
    let nameArr = name.split('-');
    let serviceId = nameArr[1];
    let selectedServices = this.state.selectedServices;
    if(value) {
      selectedServices.push(serviceId);
    } else {
      let index = selectedServices.indexOf(serviceId);
      if(index > -1) {
        selectedServices.splice(index,1)
      }
    }
    returnState.selectedServices = selectedServices;
    returnState.selectedServicesLength = selectedServices.length;
  }

  if(name == 'notification_type' && value) {
    returnState.notification_body = (value == 'sms') ? this.state.appointment_sms : this.state.appointment_email_text;
  }

  returnState[event.target.name] = value;
  returnState.userChanged = true;

  if(name != 'room' && name != 'customer_note' && name != 'send_to_provider' && !name.startsWith('notes-') && name != 'notification_body' && name != 'notification_type' && name != 'notes') {
    localStorage.setItem("showLoader", true);
    returnState.showLoader = true;
    let selDate = moment(this.state.selectedDate);
    selDate = selDate.format('YYYY-MM-DD');
    this.setState(returnState);
    this.refreshAppointments(selDate, selDate);
  } else {
    this.setState(returnState);
  }
}

handleNextPrevDate = (navigate) => {
    var selectedDate = moment(this.state.selectedDate);
    let calendarView = this.state.calendarView
    let returnState = {};
    returnState.userChanged = true;
    switch (calendarView) {
      case 'week':
        if (navigate == 'next') {
          let newSelectedDate = selectedDate.add(1, 'weeks').toDate();
          returnState.selectedDate = newSelectedDate;
          returnState.showSelectedDate = showSelectedWeek(newSelectedDate);
          returnState.searchPickerDate = moment(returnState.selectedDate).startOf('week').toDate();
          returnState.isChangeWeek = true;
        } else if (navigate == 'prev') {
          let newSelectedDate = selectedDate.subtract(1, 'weeks').toDate();
          returnState.selectedDate = newSelectedDate;
          returnState.showSelectedDate = showSelectedWeek(newSelectedDate);
          returnState.searchPickerDate = moment(returnState.selectedDate).startOf('week').toDate();
          returnState.isChangeWeek = true;
        } else {
          returnState.selectedDate = moment().toDate();
          returnState.showSelectedDate = showSelectedWeek();
          returnState.searchPickerDate = moment(returnState.selectedDate).toDate();
          returnState.isChangeWeek = false;
        }
        break;
      case 'day':
        if (navigate == 'next') {
          let newSelectedDate = selectedDate.add(1, 'days').toDate();
          returnState.selectedDate = newSelectedDate;
          returnState.showSelectedDate = viewDateFormat(moment(newSelectedDate));
        } else if (navigate == 'prev') {
          let newSelectedDate = selectedDate.subtract(1, 'days').toDate();
          returnState.selectedDate = newSelectedDate;
          returnState.showSelectedDate = viewDateFormat(moment(newSelectedDate));
        } else {
          returnState.selectedDate = moment().toDate();
          returnState.showSelectedDate = viewDateFormat(moment());
        }
        returnState.searchPickerDate = moment(returnState.selectedDate).toDate();
        break;
    }
    localStorage.setItem("showLoader", true);
    let formattedDate = selectedDate;
    formattedDate = formattedDate.format('YYYY-MM-DD');
    returnState.showLoader = true;
    this.setState(returnState)
    let startEndDateWeek = (calendarView == 'week') ? startEndDateOfWeek(selectedDate, 'YYYY-MM-DD') : { start: formattedDate, end: formattedDate }
    this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end);
  }

markAsNoShow = (event) => {
  localStorage.setItem("showLoader", true);
  this.setState({showLoader: true})
  this.props.markNoShow(this.state.editAppointmentId)
}
emptyFunction = (event) => {
}

showEvent = (event) => {
    localStorage.setItem("showLoader", true);
    this.setState({editAppointmentId : event.id, showLoader: true})
    this.props.getAppointment(event.id);
}
closePopUp = () => {
    this.setState({showAppointmentDetails : false})
}

toggleClinics = (event) => {
  this.setState({showClinics : !this.state.showClinics, showService: false, showProvider: false, userChanged: true})
}

toggleService = (event) => {
  this.setState({showClinics : false, showService: !this.state.showService, showProvider: false, userChanged: true})
}

toggleProvider = (event) => {
  this.setState({showClinics : false, showService: false, showProvider: !this.state.showProvider, userChanged: true})
}

refreshAppointments = (start, end) => {
  let formData = {};
  formData.start = start;
  formData.end = end;
  formData.service_ids = this.state.selectedServices;
  formData.doctor_ids = this.state.selectedProviders;
  formData.clinic_id = this.state.clinic_id;
  this.props.getAppointments(formData);
}

changeClinic = (event) => {
  localStorage.setItem("showLoader", true);
  let clinicId = parseInt(event.currentTarget.dataset.id);
  let formData = {},
      returnState = {},
      clinic = {};

  let dateToSend = this.getFormDataDate();
  formData.start = dateToSend;
  formData.end = dateToSend;
  formData.service_ids = this.state.selectedServices;
  formData.doctor_ids = this.state.selectedProviders;
  formData.clinic_id = clinicId;
  if(clinicId) {
    clinic = this.state.clinics.find(y => y.id == clinicId);
    returnState.selectedClinic = clinic.clinic_name;
  } else {
    returnState.clinic_id = clinicId;
    returnState.selectedClinic = 'Please Select';
  }
  returnState.showLoader = true
  this.setState(returnState)
  this.props.getAppointments(formData);

}

  handleCalendarView = (nextCalendarView) => {
    localStorage.setItem("showLoader", true);
    let returnState = {};
    returnState.calendarView = nextCalendarView;
    returnState.userChanged = true;
    returnState.selectedDate = this.state.selectedDate;
    if (nextCalendarView == 'week') {
      returnState.calendarStep = 15;
      returnState.showSelectedDate = showSelectedWeek(returnState.selectedDate);
    } else if (nextCalendarView == 'day') {
      returnState.isChangeWeek = false;
      returnState.calendarStep = 15;
      if(this.state.returnState){
        returnState.selectedDate = moment(returnState.selectedDate).startOf('week').toDate();
      }
      returnState.showSelectedDate = viewDateFormat(returnState.selectedDate);
    }
    returnState.searchPickerDate = moment(returnState.selectedDate).toDate();
    returnState.showLoader = true;
    this.setState(returnState);
    let formattedDate = moment(returnState.selectedDate);
    formattedDate = formattedDate.format('YYYY-MM-DD')
    let startEndDateWeek = (nextCalendarView == 'week') ? startEndDateOfWeek(this.state.selectedDate, 'YYYY-MM-DD') : { start: formattedDate, end: formattedDate }
    this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end);
  }

  handleDatePicker = (date) => {
    this.setState({selectedPickerDate: date,showDatePicker:false});
    this.refDatePicker.setOpen(false);
  }

  resetDatePicker = () => {
    this.setState({selectedPickerDate: null,'showDatePicker':true});
    this.toggleDatePicker();
  }

  blurDatePicker = (date) => {
    this.refDatePicker.setOpen(true);
    this.setState({'showDatePicker':true});
  }

  focusDatePicker = (date) => {
    this.setState({'showDatePicker':true});
  }

  toggleDatePicker = () => {
    this.setState({'showDatePicker':true});
    this.refDatePicker.setFocus(true);
    this.refDatePicker.setOpen(true);
  }

  handleRepeatDatePicker = (date) => {
    this.setState({selectedRepeatPickerDate: date});
  }

  resetRepeatDatePicker = () => {
    this.setState({selectedRepeatPickerDate: null});
    this.toggleRepeatDatePicker();
  }

  blurRepeatDatePicker = (date) => {
    this.refRepeatDatePicker.setOpen(true);
  }

  toggleRepeatDatePicker = () => {
    this.refRepeatDatePicker.setFocus(true);
    this.refRepeatDatePicker.setOpen(true);
  }
  getFormDataDate = () => {
    let selDate = moment(this.state.selectedDate);
    selDate = selDate.format('YYYY-MM-DD');
    let startEndDateWeek = (this.state.calendarView == 'week') ? startEndDateOfWeek(this.state.selectedDate, 'YYYY-MM-DD') : { start: selDate, end: selDate }
    return selDate;
  }

  handleSearchDatePicker = (date) => {
    localStorage.setItem("showLoader", true);
    let returnState = {};
    returnState.showLoader = true;
    returnState.searchPickerDate = date;
    returnState.isChangeWeek = false;
    returnState.selectedDate = date;
    returnState.userChanged = true;
    if (this.state.calendarView == 'week') {
      returnState.calendarStep = 15;
      returnState.showSelectedDate = showSelectedWeek(returnState.selectedDate);
    } else if (this.state.calendarView == 'day') {
      returnState.isChangeWeek = false;
      returnState.calendarStep = 15;
      if(this.state.returnState){
        returnState.selectedDate = moment(returnState.selectedDate).startOf('week').toDate();
      }
      returnState.showSelectedDate = viewDateFormat(returnState.selectedDate);
    }
    returnState.calendarView = this.state.calendarView;
    this.setState(returnState);
    let formattedDate = moment(date);
    formattedDate = formattedDate.format('YYYY-MM-DD')
    let startEndDateWeek = { start: formattedDate, end: formattedDate }
    this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end);
  }

  patientCheckIn = () => {
    localStorage.setItem("showLoader", true);
    this.setState({showLoader: true})
    this.props.checkin(this.state.editAppointmentId);
  }

  makeCheckin = () => {
    let formData = {};
    formData.id = this.state.editAppointmentId;
    if(this.state.room.trim() != '') {
      formData.room = this.state.room.trim();
      localStorage.setItem("showLoader", true);
      this.setState({roomError : false, showLoader: true})
    } else {
      this.setState({roomError : true})
      return false;
    }

    let arr = [];
    for(let x in this.state) {
      if(x.startsWith('notes-')) {
        if(this.state[x]) {
          arr.push(x.split('-')[1])
        }
      }
    }

    formData.notes_arr = arr;
    formData.customer_new_note = this.state.customer_note;
    formData.send_to_provider = this.state.send_to_provider;
    this.props.makePatientCheckin(formData);
  }

componentDidUpdate = (props, state) => {
  if(state.markedAsNoShow != this.state.markedAsNoShow && this.props.markedAsNoShow) {
    let selDate = moment(this.state.selectedDate);
    selDate = selDate.format('YYYY-MM-DD');
    this.refreshAppointments(selDate, selDate);
  }

  if(state.refreshListAfterCancelling != this.state.refreshListAfterCancelling && (this.props.appointmentCancelled || this.props.notificationSent)) {
    let dateForm = this.getFormDataDate()
    this.refreshAppointments(dateForm, dateForm);
  }
}

cancelAppointment = () => {
  localStorage.setItem("showLoader", true);
  this.setState({showLoader: true})
  let formData = {};
  formData.pat_to_be_charged = this.state.patient_to_charge;
  formData.appointment_id = this.state.editAppointmentId;
  formData.notification_type = this.state.notification_type;
  formData.notification_body = this.state.notification_body;
  formData.appointment_sms = this.state.appointment_sms;
  formData.appointment_subject = this.state.appointment_subject;
  this.props.cancelAppointment(formData);
}

sendNotification = () => {
    let formData = {},
        notiBodyClassError = false;
    notiBodyClassError = (this.state.notification_body.trim()) ? false : true;
    if(notiBodyClassError) {
      return false;
    }
    localStorage.setItem("showLoader", true);
    this.setState({showLoader: true});
    formData.notification_type = this.state.notification_type;
    formData.notification_body = this.state.notification_body;
    formData.appointment_sms = this.state.appointment_sms;
    formData.appointment_subject = this.state.appointment_subject;
    formData.appointment_id = this.state.appointment_id;
    this.props.sendNotification(formData)
}

chargeAndFurther = (event) => {
  let mode = this.state.feesMode;
  let charge = event.currentTarget.dataset.charge;
  this.setState({patient_to_charge : charge})
  if(mode == 'cancel') {
    this.props.getCancelNotification(this.state.editAppointmentId);
  } else {
    localStorage.setItem("showLoader", true);
    this.setState({showLoader: true});
    let formData = {}
    formData.appointment_id = this.state.editAppointmentId;
    formData.charge = charge;
    this.props.markNoShow(formData)
  }
}

render(){
return(
<div id="content">
  <div className="container-fluid content">
    <AppointmentHeader activeMenuTag={'calendar'} />
    <div className="row">
      <div className="col-lg-2 col-md-2 col-sm-4 cal-month-week-day-outer">
        <button className={(this.state.calendarView == 'week') ? 'calendar-btn btn-week selected' : 'calendar-btn btn-week'} onClick={this.handleCalendarView.bind(this, 'week')}>Week</button>
        <button className={(this.state.calendarView == 'day') ? 'calendar-btn btn-day selected' : 'calendar-btn btn-day'} onClick={this.handleCalendarView.bind(this, 'day')}>Day</button>
      </div>
      <div className="col-lg-4 col-md-3 col-sm-6 cal-date-btn-outer">
        <button className="calendar-btn today-btn" onClick={this.handleNextPrevDate.bind(this, 'today')}>Today</button>
        <button className="calendar-btn cal-date-btn">
          <a  className="cal-arrow pull-left" onClick={this.handleNextPrevDate.bind(this, 'prev')}><img src="/images/cal-left.svg"/></a>
          {this.state.showSelectedDate}
          <a className="cal-arrow pull-right" onClick={this.handleNextPrevDate.bind(this, 'next')}><img src="/images/cal-right.svg"/></a>
        </button>
        <div className="search-bg new-calender" ref={(refSearchDatePickerContainer) => this.refSearchDatePickerContainer = refSearchDatePickerContainer}>
          <img src={calenLogo} />
          <DatePicker
            value={(this.state.searchPickerDate) ? viewDateFormat(this.state.searchPickerDate) : null}
            onChange={this.handleSearchDatePicker}
            className='setting-search-input search-key'
            dateFormat="YYYY-MM-dd"
            minDate={new Date(moment().subtract(10, 'years'))}
            selected={this.state.searchPickerDate}
            name='searchPickerDate'
            autoComplete="off"
            ref={(refSearchDatePicker) => this.refSearchDatePicker = refSearchDatePicker}
          />
        </div>

      </div>
      <div className="col-lg-4 col-md-5 col-sm-12 cal-filter">
        <button className="calendar-dropdown" onClick={this.toggleService} ref={(refServiceButton) => this.refServiceButton = refServiceButton}>{(this.state.selectedServicesLength == 0) ? "All Selected" : "Services ("+this.state.selectedServicesLength+")"}<a href="javascript:void(0);" className="cal-arrow pull-right"><img src={(this.state.showService) ? "/images/cal-up.png" : "/images/cal-down.png"}/></a>
          <ul className={(this.state.showService) ? "cal-dropdown cal-service-dropdown" : "cal-dropdown no-display"} >
            {this.state.services.length && this.state.services.map((obj, idx) => {
              return (
              <li key={"services-"+idx}>
                <a href="#">
                  <label className="checkbox">
                    <input type="checkbox" value={obj.id} name={"service-"+obj.id} checked={(this.state["service-"+obj.id]) ? "checked" : false} autoComplete="off" onChange={this.handleInputChange} /> {obj.name}
                    <span > &nbsp; </span>
                  </label>
                </a>
              </li>
               )
            })}
          </ul>
        </button>
        <button className="calendar-dropdown show" onClick={this.toggleProvider} ref={(refProviderButton) => this.refProviderButton = refProviderButton}>{(this.state.selectedProvidersLength == 0) ? "All Selected" : "Providers ("+this.state.selectedProvidersLength+")"}<a href="javascript:void(0);" className="cal-arrow pull-right" ><img src={(this.state.showProvider) ? "/images/cal-up.png" : "/images/cal-down.png"}/></a>
          <ul className={(this.state.showProvider) ? "cal-dropdown" : "cal-dropdown no-display"} >
          {this.state.providers.length && this.state.providers.map((obj, idx) => {
            return (
            <li key={"provider-"+idx}>
              <a href="#">
                <label className="checkbox">
                  <input type="checkbox" value={obj.id} name={"provider-"+obj.id} checked={(this.state["provider-"+obj.id]) ? "checked" : false}  onChange={this.handleInputChange} /> {displayName(obj)}
                    <span className="filter-provider-span" style={{backgroundColor: obj.appointment_color}}>  </span>
                </label>
              </a>
            </li>
             )
          })}
          </ul>
        </button>
        <button className="calendar-dropdown cal-clinic" onClick={this.toggleClinics} ref={(refClinicButton) => this.refClinicButton = refClinicButton}><span>{this.state.selectedClinic}</span> <a href="javascript:void(0);" className="cal-arrow pull-right"><img src={(this.state.showClinics) ? "/images/cal-up.png" : "/images/cal-down.png"}/></a>
        <ul className={(this.state.showClinics) ? "cal-dropdown clinicname-dropdown" : "cal-dropdown clinicname-dropdown no-display"} >
        <li data-id={0} onClick={this.changeClinic}>
              <a href="javascript:void(0);">
                <label className="checkbox">
                  Select Clinic
                </label>
              </a>
            </li>
          {this.state.clinics.length && this.state.clinics.map((obj, idx) => {
            return (
                <li key={"clinics-"+idx} data-id={obj.id} onClick={this.changeClinic}>
                  <a href="javascript:void(0);">
                    <label className="checkbox">
                      {obj.clinic_name}
                    </label>
                  </a>
                </li>
              )
          })}
        </ul>
        </button>
      </div>
      <div className="calender-btns">
        <Link id="create_appointment1" className="new-blue-btn pull-right" data-url="/appointments/add_appointment" to="/appointment/create">
        {this.state.appointmentLang.appointment_create}</Link>
            <a id="" className="new-procedure-btn new-blue-btn pull-right">
        <i className=""></i>{this.state.appointmentLang.appointment_smar_booking}</a>
      </div>
    </div>
    <div className="juvly-section full-width m-t-10" id="juvly-section">
    {this.state.events &&

       <DragAndDropCalendar
          selectable
          localizer={localizer}
          views={['week', 'day']}
          events={this.state.events}
          min={this.state.min}
          max={this.state.max}
          resources={this.state.resourceMap}
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"
          onEventDrop={this.moveEvent}
          view={this.state.calendarView}
          defaultDate={new Date(2019, 0, 29)}
          onSelectSlot={this.handleSelect}
          onSelectEvent={this.showEvent}
          step={5}
          timeslots={3}
          showMultiDayTimes
          toolbar={false}
          date = {this.state.selectedDate}
          onNavigate = {this.navigate}
          onView={this.onView}
        />
    }
    </div>

  </div>
<div className={(this.state.showAppointmentDetails) ? "modalOverlay" : "modalOverlay no-display"}>
  <div className="small-popup-outer appointment-detail-main">
    <div className="small-popup-header">
      <div className="popup-name">{this.state.appointmentLang.appointment_details}</div>
      <a onClick={this.closePopUp} className="small-cross">×</a>
    </div>
    <div className="small-popup-content">
      <div className="juvly-container no-padding-bottom">
          <div className="row">
          <div className="col-sm-6 col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_client}</div>
              <div className="setting-input-box">
                {this.state.appointment_details && displayName(this.state.appointment_details.patient)}
                <div className="existing-user">
                  <a href={`/clients/profile/${this.state.appointment_details && this.state.appointment_details.patient.id}`} target="_blank" className="easy-link pull-left no-padding">{this.state.appointmentLang.appointment_view_profile}</a>
                  <span className="pull-right">
                    <img src="images/member.png" alt=""/>
                    <img src="images/male-model.png" alt="" className="male-model"/>
                    {this.state.appointmentLang.appointment_existing}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_booking_info}</div>
              <div className="relative setting-input-box p-r-15" >
                <div className="appo-booking-info">
                  <span>{this.state.appointmentLang.sales_date_of_booking} :</span> {this.state.appointment_details && this.state.appointment_details.appointment_booking.booking_datetime}
                </div>
                <div className="appo-booking-info">
                  <span>{this.state.appointmentLang.appointment_booded_by} :</span> {this.state.appointment_details && this.state.appointment_details.appointment_booking.booked_by}
                </div>
                <span onClick={this.showPreviousBookings}>
                  <i className="far fa-clock client-treat-cal" ></i>
                </span>
              </div>
              <div className={(this.state.showBookings) ? "appoint-pro-edit" : "appoint-pro-edit no-display"}>
                <ul className="log-appoint-his">
                  {this.state.appointment_details && this.state.appointment_user_log.length > 0 && this.state.appointment_user_log.map((obj, idx) => {
                    return (<li key={"customer_bookings-"+idx}>{this.state.appointmentLang.appointment_customer_booked_on} {obj.appointment_datetime} </li>)
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6 col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_email}</div>
              <div className="setting-input-box">
                {this.state.appointment_details && this.state.appointment_details.patient.email}
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_booking_info}</div>
              <div className="setting-input-box">
                {this.state.appointment_details && this.state.appointment_details.patient.phoneNumber}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_notes}</div>
              <div className="setting-input-outer">
                <textarea className={(this.state.noteError) ? "setting-textarea-box field-error" : "setting-textarea-box"} name="notes" value={this.state.notes} disabled={(!this.state.showEditNote) ? "disabled" : ""} onChange={this.handleInputChange}>{this.state.appointment_details && this.state.notes}</textarea>
                <a onClick={this.editNote} className="client-treat-cal appoint-note">
                  <i className="far fa-edit"></i>
                </a>
              </div>
            </div>
          </div>
          <div className={(this.state.showEditNote) ? "setting-field-outer col-xs-12" : "setting-field-outer col-xs-12 no-display"}>
            <a  className="new-white-btn">{this.state.appointmentLang.appointment_cancel}</a>
            <a  className="new-blue-btn" onClick={this.saveNotes}>{this.state.appointmentLang.appointment_save}</a>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6 col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_clinic}</div>
              <div className="setting-input-box">
                {this.state.appointment_details && this.state.appointment_details.clinic.clinic_name}
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_medical_provider}</div>
              <div className="setting-input-box relative p-r-15">
                {this.state.appointment_details && displayName(this.state.appointment_details.provider)}

                <div className="medical-pro-color" id="provider-color-box" style={{backgroundColor : (this.state.appointment_details) ? this.state.appointment_details.provider.appointment_color : ""}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-6 col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_service_services}</div>
              <div className="setting-input-box">
              {
                this.state.appointment_details && this.state.appointment_details.appointment_services.map((obj, idx) => {
                  return (
                      <div className="services-listdiv service-list" key={"appointment_services-"+idx}>{obj.service.name}<span data-duration_hours="0" className="duration_hours">( {obj.service.hours} hrs </span><span data-duration_mins="15" className="duration_mins">{obj.service.mins} {this.state.appointmentLang.appointment_minutes} )</span></div>
                    )
                })
              }
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">{this.state.appointmentLang.appointment_date_time}</div>
              <div className="setting-input-box">
                {this.state.appointment_details && this.state.appointment_details.appointment_datetime}
              </div>
              <div className="important-instruction m-t-15">
                {this.state.appointmentLang.appointment_ends_at} {this.state.appointment_details && this.state.appointment_details.appointment_endtime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="footer-static">
      <p className={(this.state.last_canceled_appointment != null) ? "p-text last-cancel-appint" : "p-text last-cancel-appint no-display"}>{this.state.appointmentLang.appointment_last_cancelled}: {this.state.last_canceled_appointment && this.state.last_canceled_appointment.appointment_datetime}</p>
      <Link to={"/appointment/edit/"+this.state.editAppointmentId} className={(this.state.appointment_details && this.state.available_buttons.indexOf('edit-appointment') > -1) ? "new-green-btn pull-right" : "new-green-btn pull-right no-display"}>{this.state.appointmentLang.appointment_edit_label}</Link>
      <a  className={(this.state.appointment_details && this.state.available_buttons.indexOf('cancel-appointment') > -1) ? "new-red-btn pull-right m-l-10" : "new-red-btn pull-right m-l-10 no-display"} data-mode="cancel" onClick={this.getAppointmentFees}>{this.state.appointmentLang.appointment_cancel_label}</a>
      <a  className={(this.state.appointment_details && this.state.available_buttons.indexOf('mark-as-noshow') > -1) ? "new-yellow-btn pull-right" : "new-yellow-btn pull-right no-display"} data-mode="markasnoshow" onClick={this.getAppointmentFees}>{this.state.appointmentLang.appointment_mark_as_no_show}</a>
      <a  className={(this.state.appointment_details && this.state.available_buttons.indexOf('patient-check-in') > -1) ? "new-green-btn pull-right" : "new-green-btn pull-right no-display"} onClick={this.patientCheckIn}>{this.state.appointmentLang.appointment_patient_check_in}</a>
      <a  className={(this.state.appointment_details && this.state.available_buttons.indexOf('patient-checked-in') > -1) ? "new-green-btn pull-right" : "new-green-btn pull-right no-display"}>{this.state.appointmentLang.appointment_patient_checked}</a>
      {/*
          this.state.appointment_details && this.state.available_buttons.map((obj, idx) => {
            return (
                <a onClick={(obj.trim() == 'Mark as No-Show') ? this.markAsNoShow : this.emptyFunction} className="new-green-btn pull-right">{obj}</a>
              )
          })*/
      }
    </div>
  </div>
</div>
<div className={(this.state.showCheckinData) ? "modalOverlay" : "modalOverlay no-display"}>
      <div className="small-popup-outer">
        <div className="small-popup-header">
          <div className="popup-name">KIRANJOT KAUR - {this.state.appointmentLang.appointment_check_in}</div>
          <a onClick={() => {this.setState({showCheckinData : !this.state.showCheckinData})}} className="small-cross">×</a>
        </div>
        <div className="small-popup-content">
          <div className="juvly-container no-padding-bottom">
            <div className="row">
              <div className="col-xs-12">
                <div className="setting-field-outer">
                  <div className="new-field-label">ROOM <span className="required">*</span></div>
                  <div className="setting-input-outer">
                    <input className={(!this.state.roomError) ? "setting-input-box" : "setting-input-box field-error"} type="text" name="room" value={this.state.room} autoComplete="off" onChange={this.handleInputChange} />
                  </div>
                </div>
              </div>
              <div className="col-xs-12">
                <div className="setting-field-outer">
                  <div className="new-field-label">{this.state.appointmentLang.appointment_customer_note}</div>
                  <div className="setting-input-outer">
                    <input className="setting-input-box" type="text" name="customer_note" value={this.state.customer_note} autoComplete="off" onChange={this.handleInputChange}/>
                  </div>
                </div>
              </div>
              <p className="p-text col-xs-12">
              <input type="checkbox" className="new-check" name="send_to_provider" checked={(this.state.send_to_provider) ? "checked" : false} onChange={this.handleInputChange}/>{this.state.appointmentLang.appointment_send_this}</p>
            </div>
            <div className="customer-note">
              <div className="juvly-subtitle m-b-15">{this.state.appointmentLang.appointment_select_customer_notes}:</div>
              {this.state.checkinData && this.state.checkinData.map((obj, idx) => {
                return (
                    <div className="check-note">
                      <input type="checkbox" className="note-check" name={"notes-"+obj.id} checked={(this.state['notes-'+obj.id]) ? "checked" : false} onChange={this.handleInputChange} />
                      <div className="check-note-text">{obj.added_by}, {obj.created} - {obj.notes}</div>
                    </div>
                  )
              })}
            </div>
          </div>
        </div>
        <div className="footer-static">
          <a  className="new-blue-btn pull-right" onClick={this.makeCheckin}>{this.state.appointmentLang.appointment_complete_check_in}</a>
          <a  className="new-white-btn pull-right" onClick={() => this.setState({showCheckinData: !this.state.showCheckinData})}>{this.state.appointmentLang.appointment_cancel}</a>
        </div>
      </div>
    </div>
<div className={(this.state.showNotifyPop) ? "modalOverlay": "modalOverlay no-display"}>
  <div className="small-popup-outer appointment-detail-main">
    <div className="small-popup-header">
      <div className="popup-name">{(this.state.notiMode == 'cancel') ? "Cancel Appointment"  : "Send Notification"}</div>
      <a className="small-cross" onClick={() => this.setState({showNotifyPop: !this.state.showNotifyPop})}>×</a>
    </div>
    <div className="small-popup-content">
      <div className="juvly-container no-padding-bottom">

        <div className={(this.state.notiMode == 'cancel') ? "juvly-subtitle" : "no-display"}>{this.state.appointmentLang.appointment_r_u_sure_cancel} Rahul's {this.state.appointmentLang.appointment_question_mark}<br/>
          {this.state.appointmentLang.appointment_will_be_removed} Rahul's {this.state.appointmentLang.appointment_history}.
        </div>
        <div className={(this.state.notiMode == 'reschedule') ? "juvly-subtitle" : "no-display"}>{this.state.appointmentLang.appointment_r_u_sure_cancel} Rahul's {this.state.appointmentLang.appointment_question_mark}<br/>
          {this.state.appointmentLang.appointment_will_be_removed} Rahul's {this.state.appointmentLang.appointment_history}.
        </div>

        <div className="row">
          <div className="col-xs-12">
            <div className="setting-field-outer">
              <div className="new-field-label">Rahul {this.state.appointmentLang.appoinment_will_be_notified}:</div>
              <select className="setting-select-box" name="notification_type" onChange={this.handleInputChange} value={this.state.notification_type}>
                <option value="email">{this.state.appointmentLang.appointment_email}</option>
                <option value="sms">{this.state.appointmentLang.appointment_sms}</option>
                <option value="emailAndSms">{this.state.appointmentLang.appointment_both}</option>
                <option value="dontsend">{this.state.appointmentLang.appointment_dont_send_notification}</option>
              </select>
            </div>
          </div>
        </div>

        <p className="p-text">
          {this.state.appointmentLang.appointment_notification_message}<br/>
          {this.state.appointmentLang.appointment_top_notification}
        </p>

        <div className="setting-field-outer">
          <textarea className="setting-textarea-box h-130 scroll-y" name="notification_body" onChange={this.handleInputChange} value={this.state.notification_body}>{this.state.notification_body}</textarea>
        </div>
      </div>
    </div>
    <div className="footer-static">
      <a   onClick={() => this.setState({showNotifyPop: !this.state.showNotifyPop})} className="new-red-btn pull-left">{this.state.appointmentLang.appointment_back}</a>
      <a  className={(this.state.notiMode == 'cancel') ? "new-blue-btn pull-right": "no-display"} onClick={this.cancelAppointment}>{this.state.appointmentLang.appointment_cancel_label}</a>
      <a  className={(this.state.notiMode == 'reschedule') ? "new-blue-btn pull-right": "no-display"} onClick={this.sendNotification}>{this.state.appointmentLang.appointment_send_notification}</a>
    </div>
  </div>
</div>
<div className={(this.state.showModal ? 'overlay' : '')}></div>
<div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
        <h4 className="modal-title" id="model_title"></h4>
      </div>
      <div id="errorwindow" className="modal-body add-patient-form filter-patient">
        {this.state.appointmentLang.appointment_cancellation_fee_of} {this.state.cancellation_fee}. {this.state.appointmentLang.appointment_want_to_do}
      </div>
      <div className="modal-footer" >
        <div className="col-md-12 text-left" id="footer-btn">
          <button type="button" className="btn btn-success pull-right" data-charge={true} onClick={this.chargeAndFurther}>{this.state.appointmentLang.appointment_cancel_and_charge}</button>
          <button type="button" className="btn  logout pull-right m-r-10" data-charge={false} onClick={this.chargeAndFurther}>{this.state.appointmentLang.appointment_cancel_donot_charge}</button>
        </div>
      </div>
    </div>
  </div>
</div>
    <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock positionFixed' : 'new-loader text-left'}>
    <div className="loader-outer">
      <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
      <div id="modal-confirm-text" className="popup-subtitle" >{this.state.appointmentLang.appointment_processing_please_wait}</div>
    </div>
  </div>
</div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  toast.dismiss();
  localStorage.setItem("showLoader", false);
  if (state.AppointmentReducer.action === 'GET_APPOINTMENTS' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.appointmentsData = state.AppointmentReducer.data.data;
    }
  }
  if (state.AppointmentReducer.action === 'APPOINTMENT_GET' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.appointmentData = state.AppointmentReducer.data.data;
    }
  }
  if (state.AppointmentReducer.action === 'MARKED_NO_SHOW' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.markedAsNoShow = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    }
  }
  if (state.AppointmentReducer.action === 'GET_CHECKIN_DATA' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.checkinData = state.AppointmentReducer.data.data;
    }
  }
  if (state.AppointmentReducer.action === 'POST_CHECKIN_DATA' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.patientCheckedIn = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    }
  }
  if (state.AppointmentReducer.action === 'EMPTY_DATA' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.appointmentData = {};
    }
  }

  if (state.AppointmentReducer.action === 'APPOINTMENT_FEES' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.appointmentFees = state.AppointmentReducer.data.data;
    }
  }
  if (state.AppointmentReducer.action === 'CANCEL_NOTIFICATION_MESSAGE' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.cancelNotificationMessage = state.AppointmentReducer.data.data;
    }
  }
  if (state.AppointmentReducer.action === 'APPOINTMENT_CANCELLED' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.appointmentCancelled = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    }
  }
  if (state.AppointmentReducer.action === 'RESCHEDULE_TIME' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.rescheduledData = state.AppointmentReducer.data.data;
    }
  }
  if (state.AppointmentReducer.action === 'APPOINTMENT_RESCHEDULED' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.updatedAppointmentData = state.AppointmentReducer.data.data;
    }
  }

  if (state.AppointmentReducer.action === 'SEND_NOTIFICATION' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
      returnState.notificationSent = true;
    }
  }
  if (state.AppointmentReducer.action === 'UPDATE_NOTES' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.notesUpdates = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    }
  }
  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getAppointments: getAppointments, getAppointment: getAppointment, markNoShow: markNoShow, updateNotes: updateNotes, checkin: checkin, makePatientCheckin: makePatientCheckin, exportEmptyData:exportEmptyData, getAppointmentFees: getAppointmentFees, getCancelNotification: getCancelNotification, cancelAppointment: cancelAppointment, checkRescheduleTime: checkRescheduleTime, rescheduleAppointment: rescheduleAppointment, sendNotification: sendNotification}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(Calendar));
