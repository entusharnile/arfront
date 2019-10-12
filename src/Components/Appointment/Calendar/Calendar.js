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
import { getAppointments, getAppointment, markNoShow, updateNotes, checkin, makePatientCheckin, exportEmptyData, getAppointmentFees, getCancelNotification, cancelAppointment, checkRescheduleTime, rescheduleAppointment, sendNotification, printAppointment} from '../../../Actions/Appointment/appointmentAction.js';
import calenLogo from '../../../images/calender.svg';
import { checkIfPermissionAllowed, convertTime12to24, convertTime24to12, getAmPm, displayName, showFormattedDate, formatTime, numberFormat, positionFooterCorrectly } from '../../../Utils/services.js';
import ReactTooltip from 'react-tooltip'
import Fullscreen from "react-full-screen";
let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])
//import localizer from 'react-big-calendar/lib/localizers/globalize'
const localizer = BigCalendar.momentLocalizer(moment)



const DragAndDropCalendar = withDragAndDrop(BigCalendar)

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}

const convertDurationToVisibleFormat = (duration) => {
    var hours = Math.floor(duration / 60);
    var minutes = duration % 60;
    return "("+hours+" hrs "+ minutes + " mins)";
}

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
const makeTitle = (obj) => {
  let titleArr = [],
  title = '';
  if(obj.appointment_services) {
    obj.appointment_services.map((objInner, idx) => {
      if(objInner.service) {
        titleArr.push(objInner.service.name)
      }
    })
  }
  if(titleArr.length) {
    title = titleArr.join(', ');
  }
  return title;
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

    let calendarFilter  = JSON.parse(localStorage.getItem('calendarFilter'));

    this.state = {
      showSelectedDate : (calendarFilter) ? ((calendarFilter.calendarView == 'week') ? showSelectedWeek(calendarFilter.searchPickerDate) : viewDateFormat(calendarFilter.searchPickerDate)) : moment().format('LL'),
      selectedDate : (calendarFilter) ? moment(calendarFilter.searchPickerDate).toDate() : moment().toDate(),
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
      notificationSent: false,
      checkinData: [],
      showCheckinData : false,
      room: '',
      customer_note: '',
      send_to_provider: true,
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
      showPrintModal : false,
      cancelNotificationMessage : {},
      rescheduledData: {},
      notification_type : 'emailAndSms',
      noteError: false,
      selectAllProviders: false,
      selectAllService: false,
      refreshListAfterCancelling: false,
      showRescheduleConfirmModal: false,
      userData: user,
      openAt : '',
      timestamp : '',
      markedTimeStamp : '',
      success_msg : '',
      patient_name : '',
      patient_type : '',
      closesAt: '',
      printTimeStamp: new Date(),
      patientCheckedIdTimestamp: new Date(),
      clinic_timezone: "",
      notesUpdatedTimeStamp: new Date(),
      tempnotes:'',
      isFull: false,
    }
    window.onscroll = () => {
     return false;
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

  goFull = () => {
    this.setState({ isFull: true });
  }
  getAppointmentFees = (event) => {
      localStorage.setItem("showLoader", true);
      this.setState({showLoader: true, feesMode: event.currentTarget.dataset.mode, notiMode: 'cancel'})
      this.props.getAppointmentFees(this.state.editAppointmentId)
  }

  onView = (event) => {
  }

  moveEvent({ event, start, end, resourceId, isAllDay: droppedOnAllDaySlot }) {
    if(!checkIfPermissionAllowed('update-cancel-reschedule-appointment')) {
      return false;
    }
    if(event.checkedIn) {
      return false;
    }
    const { events } = this.state
    if(event.resourceId != resourceId) {
      return
    }
    if(moment(start).isSame(event.start)) {
      return
    }
    const idx = events.indexOf(event)
    let allDay = event.allDay

    if (!event.allDay && droppedOnAllDaySlot) {
      allDay = true
    } else if (event.allDay && !droppedOnAllDaySlot) {
      allDay = false
    }

    var isAfterOriginalEventDate = moment(event.start).isAfter(new Date()) || moment(event.start).isSame(new Date(), 'day');
    var isAfter = moment(start).isAfter(new Date())  || moment(start).isSame(new Date(), 'day');
    let currentDate = moment(new Date());
    let eventOriginalDate = moment(event.start);
    var currentDayCheck = eventOriginalDate.diff(currentDate, 'days')
    if(isAfterOriginalEventDate && isAfter && currentDayCheck >= 0) {
      const updatedEvent = { ...event, start, end, resourceId, allDay }

      let formData = {}
      formData.startdate = moment(start).format("YYYY-MM-DD HH:mm:ss");
      localStorage.setItem('rescheduledTime', formData.startdate)
      formData.appointment_id = event.id;
      this.setState({ updatedEvent : updatedEvent, appointment_id: event.id, rescheduleFormData: formData, showRescheduleConfirmModal: true});
      //localStorage.setItem('rescheduleFormData', JSON.stringify(formData))
    } else {
      return;
    }


    /* will use it later */
    /*const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)
    this.setState({
      events: nextEvents,
      forceChanged: true
    })*/
  }

  rescheduleAppoint = () => {
      localStorage.setItem("showLoader", true);
      this.setState({showLoader: true, showRescheduleConfirmModal: false});
      let formData = this.state.rescheduleFormData
      this.props.checkRescheduleTime(formData);
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
    toast.dismiss();
    this.props.exportEmptyData({});
  }

handleClick = (e) =>  {
  if((this.state.showProvider || this.state.showClinics || this.state.showService) && e.target.parentElement.className !== 'cal-filter-outer') {
    if (this.state.showService && !this.refServiceButton.contains(e.target)) {
      this.setState({showService:false})
    }
    if (this.state.showProvider && !this.refProviderButton.contains(e.target)) {
      this.setState({showProvider:false})
    }
    if (this.state.showClinics && !this.refClinicButton.contains(e.target)) {
      this.setState({showClinics:false})
    }
  }
}

componentDidMount() {
  this.props.exportEmptyData({})
  document.addEventListener('click', this.handleClick, false);
  const languageData = JSON.parse(localStorage.getItem('languageData'))
  let startEndDateWeek = '';
  let formData = {}
  formData.start = moment().format('YYYY-MM-DD');
  formData.end = moment().format('YYYY-MM-DD');
  let returnState = {}
  returnState.showLoader = true;
  returnState.showModal = false;
  if(this.props.match.params.appointmentId) {
    returnState.dontShowAppointment = true;
    returnState.editAppointmentId = this.props.match.params.appointmentId;
    this.setState(returnState);
    this.props.getAppointment(this.props.match.params.appointmentId, 'view');
  } else if(localStorage.getItem('calendarFilter')) {
    let calendarFilter  = JSON.parse(localStorage.getItem('calendarFilter'));
    returnState.searchPickerDate = moment(calendarFilter.searchPickerDate).toDate();
    if(calendarFilter.calendarView == 'week') {
      returnState.calendarView = 'week';
      returnState.showSelectedDate = showSelectedWeek(calendarFilter.searchPickerDate);
      startEndDateWeek = startEndDateOfWeek(calendarFilter.searchPickerDate, 'YYYY-MM-DD')
      formData.start = apiDateFormat(startEndDateWeek.start);
      formData.end = apiDateFormat(startEndDateWeek.end);
    } else {
      returnState.showSelectedDate = viewDateFormat(calendarFilter.searchPickerDate);
      formData.start = formData.end = apiDateFormat(calendarFilter.start);
    }

    formData.doctor_ids = calendarFilter.doctor_ids;
    formData.service_ids = calendarFilter.service_ids;
    formData.clinic_id = calendarFilter.clinic_id;
    returnState.selectedProviders = calendarFilter.doctor_ids;
    returnState.selectedServices = calendarFilter.service_ids;
    if(returnState.selectedServices) {
      returnState.selectedServices.map((obj, idx) => {
        returnState['service-'+obj] = true;
      })
    }

    this.setState(returnState);
    this.props.getAppointments(formData);
  } else {
    this.setState(returnState);
    //localStorage.setItem('calendarFilter', JSON.stringify(formData))
    this.props.getAppointments(formData);
  }
  let windowHeight = parseInt(window.innerHeight);
  let calendarHeight = windowHeight - 267;
  document.getElementById("juvly-section").style.height = calendarHeight+"px";
}


static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};

    if ( nextProps.exportCsvData != undefined && prevState.printTimeStamp != nextProps.printTimeStamp ) {
      if(localStorage.getItem('showLoader') == "false") {
        returnState.showLoader = false;
        returnState.showPrintModal = false;
        returnState.printTimeStamp = nextProps.printTimeStamp;
        window.open(nextProps.exportCsvData.file)
        return returnState;
      }
    }

    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      return returnState;
    }
    if (nextProps.notificationSent != undefined && nextProps.notificationSent == true && nextProps.notiTimeStamp != prevState.notiTimeStamp) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        returnState.showNotifyPop = false;
        returnState.notificationSent = nextProps.notificationSent;
        returnState.notiTimeStamp = nextProps.notiTimeStamp;
        returnState.refreshListAfterCancelling = !prevState.refreshListAfterCancelling;
        return returnState;
      }
    }

    if (nextProps.notesUpdates != undefined && nextProps.notesUpdates == true && nextProps.notesUpdatedTimeStamp != prevState.notesUpdatedTimeStamp) {
      if(localStorage.getItem("showLoader") == "false") {
        toast.success(nextProps.message);
        returnState.showLoader = false;
        returnState.notesUpdatedTimeStamp = nextProps.notesUpdatedTimeStamp;
        returnState.showEditNote = false;
        return returnState;
      }
    }


    if(nextProps.rescheduledData != undefined && nextProps.rescheduledData != prevState.rescheduledData) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.rescheduledData = nextProps.rescheduledData;
        if(nextProps.rescheduledData.status == 'fail') {
          returnState.showLoader = false;
          nextProps.history.push('/appointment/edit/'+prevState.updatedEvent.id+'/reschedule');
          return returnState;
        } else {
          if(nextProps.rescheduledData.fee_details.cancellation_fee > 0) {
            returnState.cancellation_fee = nextProps.rescheduledData.fee_details.cancellation_fee;
            returnState.showLoader = false;
            returnState.showAppointmentDetails = false;
            returnState.showModal = true;
            returnState.notiMode = 'reschedule';
            return returnState;
            //returnState.feesTime = nextProps.feesTime;
          } else {
            let formData = {}
            formData.appointment_id = prevState.updatedEvent.id;
            formData.appointment_date = moment(prevState.updatedEvent.start).format('YYYY-MM-DD');
            formData.appointment_time = moment(prevState.updatedEvent.start).format('HH:mm:ss');
            nextProps.rescheduleAppointment(formData);
          }
        }
      }
     }
    if(nextProps.patientCheckedIn != undefined && nextProps.patientCheckedIn == true && nextProps.patientCheckedIdTimestamp != prevState.patientCheckedIdTimestamp) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        returnState.showCheckinData = false;
        returnState.room = '';
        returnState.send_to_provider = true;
        returnState.customer_note = "";
        returnState.patientCheckedIdTimestamp = nextProps.patientCheckedIdTimestamp;
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
        returnState.patient_name = nextProps.updatedAppointmentData.patient_name;
        returnState.success_msg = nextProps.updatedAppointmentData.success_msg;
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
        returnState.timestamp = nextProps.timestamp
        //toast.success(nextProps.message);
        return returnState;
      }
     }

    if(nextProps.appointmentFees != undefined && nextProps.appointmentFees != prevState.appointmentFees &&  nextProps.feesTime != prevState.feesTime) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.appointmentFees = nextProps.appointmentFees;
        if(nextProps.appointmentFees.cancellation_fee){
          returnState.cancellation_fee = nextProps.appointmentFees.cancellation_fee;
          returnState.showLoader = false;
          returnState.showAppointmentDetails = false;
          returnState.showModal = true;
          returnState.feesTime = nextProps.feesTime;
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
        returnState.success_msg = nextProps.cancelNotificationMessage.success_msg;
        returnState.showAppointmentDetails = false;
        returnState.showNotifyPop = true;
        returnState.showLoader = false;
        returnState.showModal = false;
        returnState.notiMode = 'cancel';
        return returnState;
      }
    }

    if (nextProps.appointmentData != undefined && nextProps.appointmentData !== prevState.appointmentData && localStorage.getItem("showLoader") == "false") {
        if(!isEmpty(nextProps.appointmentData)){
          let returnState = {};
          let appointment_details = nextProps.appointmentData.appointment_details;
          returnState.appointmentData = nextProps.appointmentData;
          returnState.patient_type = nextProps.appointmentData.patient_type;
          returnState.appointment_details = nextProps.appointmentData.appointment_details;
          returnState.appointment_user_log = nextProps.appointmentData.appointment_user_log;
          returnState.available_buttons = nextProps.appointmentData.available_buttons;
          returnState.last_canceled_appointment = nextProps.appointmentData.last_canceled_appointment;
          returnState.notes = nextProps.appointmentData.appointment_details.appointment_booking.appointment_notes;
          returnState.tempnotes = nextProps.appointmentData.appointment_details.appointment_booking.appointment_notes;
          if(!prevState.dontShowAppointment) {
            returnState.showLoader = false;
            returnState.showAppointmentDetails = true;
          } else {
            returnState.selectedDate = appointment_details.date;
            returnState.showSelectedDate = viewDateFormat(moment(appointment_details.date));
            let formData = {};
            formData.start = appointment_details.date;
            formData.end = appointment_details.date;
            formData.clinic_id = appointment_details.clinic_id;
            nextProps.getAppointments(formData);
          }
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

    if (nextProps.markedAsNoShow != undefined && nextProps.markedAsNoShow == true && nextProps.markedTimeStamp != prevState.markedTimeStamp) {
      if(localStorage.getItem("showLoader") == "false"){
        //toast.success(nextProps.message);
        returnState.markedAsNoShow = !prevState.markedAsNoShow;
        returnState.showAppointmentDetails = false;
        returnState.showLoader = false;
        returnState.showModal = false;
        returnState.markedTimeStamp = nextProps.markedTimeStamp;
        return returnState
        //nextProps.history.push(`/appointment/calendar`);
      }
    }

    if (nextProps.appointmentsData != undefined &&
      nextProps.appointmentsData !== prevState.appointmentsData && nextProps.appointmentsTimestamp != prevState.appointmentsTimestamp
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
            returnState['provider-'+obj] = (prevState.userChanged) ? prevState['provider-'+obj] : true;
          })
          returnState.selectedProvidersLength = nextProps.appointmentsData.doctor_ids.length;
          returnState.selectedProviders = nextProps.appointmentsData.doctor_ids;
        }
        if(localStorage.getItem('calendarFilter')) {
          let calendarFilter  = JSON.parse(localStorage.getItem('calendarFilter'));
          if(calendarFilter.clinic_id != nextProps.appointmentsData.clinic_id) {
            returnState.selectedProviders = [];
          } else {
            returnState.selectedProviders = (prevState.userChanged && nextProps.appointmentsData.providers == prevState.providers) ? prevState.selectedProviders : nextProps.appointmentsData.doctor_ids;
          }
        } else {
          returnState.selectedProviders = nextProps.appointmentsData.doctor_ids;
        }
        if(prevState.dontShowAppointment) {
          returnState.dontShowAppointment = false;
          returnState.showAppointmentDetails = true;
        }

        if(nextProps.appointmentsData.appointments.length) {
          nextProps.appointmentsData.appointments.map((obj,idx) => {
            //let apDate = showFormattedDate(obj.appointment_date, false);
            let dateArr = obj.appointment_date.split('-');
            let startTime = obj.appointment_start_time.split(':');
            let endTime = obj.appointment_end_time.split(':');
            let title = makeTitle(obj);
            appointments.push({
                id: obj.id,
                title: "("+ title+ ")",
                start: new Date(dateArr[0], dateArr[1]-1, dateArr[2], startTime[0],startTime[1],startTime[2]),
                end: new Date(dateArr[0], dateArr[1]-1, dateArr[2], endTime[0],endTime[1],endTime[2]),
                resourceId: obj.user_id,
                color: obj.color,
                clientName: displayName(obj.patient),
                checkedIn: obj.patient_checkedin
              })
          })
        }

        let clinic = nextProps.appointmentsData.clinics.find(y => y.id == nextProps.appointmentsData.clinic_id);
        let originalOpens = nextProps.appointmentsData.opensAt.split(':');
        let open = nextProps.appointmentsData.clinicOpensAt.split(':');
        let close = nextProps.appointmentsData.clinicClosesAt.split(":");
        let originalCloses = nextProps.appointmentsData.closesAt.split(":");
        returnState.events = (prevState.forceChanged) ? prevState.events : appointments;
        returnState.clinics = nextProps.appointmentsData.clinics;
        returnState.providers = nextProps.appointmentsData.providers;
        returnState.appointmentsTimestamp = nextProps.appointmentsTimestamp;
        returnState.clinic_timezone = nextProps.appointmentsData.clinic_timezone;
        if(nextProps.appointmentsData.providers.length == 0) {
          for(let x in prevState) {
            if(x.startsWith('provider-')) {
              returnState[x] = false;
            }
          }
        }
        returnState.resourceMap = resourceMap;
        returnState.services = nextProps.appointmentsData.services;
        returnState.clinic_id = nextProps.appointmentsData.clinic_id;
        returnState.selectedClinic = (clinic) ? clinic.clinic_name : '';
        returnState.showLoader =  false;
        returnState.forceChanged =  false;
        if(prevState.selectedServices.length && prevState.selectedServices.length == nextProps.appointmentsData.services.length) {
          returnState.selectAllService = true
        } else {
          returnState.selectAllService = false
        }
        if(prevState.selectedProviders.length && prevState.selectedProviders.length == returnState.selectedProviders.length) {
          returnState.selectAllProviders = true
        } else {
          returnState.selectAllProviders = false
        }
        //returnState.showProvider = (prevState.userChanged) ? prevState.showProvider : false;
        //returnState.showService = (prevState.userChanged) ? prevState.showService : false;
        //returnState.showClinics = (prevState.userChanged) ? prevState.showClinics : false;
        returnState.openAt = originalOpens[0] + ":" + originalOpens[1]; //convertTime24to12(nextProps.appointmentsData.clinicOpensAt);//
        returnState.closesAt = originalCloses[0] + ":" + originalCloses[1]; //convertTime24to12(nextProps.appointmentsData.clinicClosesAt) //
        returnState.min = new Date(2019, 1, 28, open[0], open[1], open[2]);
        returnState.max = new Date(2019, 1, 28, close[0], close[1], close[2]);
      }
      return returnState;
    }

    if(prevState.isFull == false) {
      positionFooterCorrectly();
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
    //returnState.showProvider = false;
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


  if(name != 'room' && name != 'customer_note' && name != 'send_to_provider' && !name.startsWith('notes-') && name != 'notification_body' && name != 'notification_type' && name != 'notes' && !name.startsWith('provider-') && !name.startsWith('service-')) {
    localStorage.setItem("showLoader", true);
    returnState.showLoader = true;
    let startEndDateWeek = (this.state.calendarView == 'week') ? startEndDateOfWeek(this.state.selectedDate, 'YYYY-MM-DD') : { start: this.state.selectedDate, end: this.state.selectedDate }

    //this.setState(returnState);
    this.setState(returnState, () => {
      this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end, this.state.calendarView);
    })
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
          returnState.selectedDate = moment();
          selectedDate = moment();
          returnState.showSelectedDate = showSelectedWeek(selectedDate);
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
          selectedDate = moment();
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

    let startEndDateWeek = (calendarView == 'week') ? startEndDateOfWeek(selectedDate, 'YYYY-MM-DD') : { start: formattedDate, end: formattedDate }
    this.setState(returnState, () => {
      this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end, this.state.calendarView);
    })
  }

markAsNoShow = (event) => {
  localStorage.setItem("showLoader", true);
  this.setState({showLoader: true})
  this.props.markNoShow(this.state.editAppointmentId)
}
emptyFunction = (event) => {
}

showEvent = (event) => {
  if(checkIfPermissionAllowed('update-cancel-reschedule-appointment')) {
      localStorage.setItem("showLoader", true);
      this.setState({editAppointmentId : event.id, showLoader: true})
      this.props.getAppointment(event.id, 'view');
    }
}
closePopUp = () => {
    this.setState({showAppointmentDetails : false, showBookings: false})
}

toggleClinics = (event) => {
  this.setState({showClinics : !this.state.showClinics, showService: false, showProvider: false, userChanged: true})
}

toggleService = (event) => {
  //event.preventDefault()
  event.stopPropagation()
  this.setState({showClinics : false, showService: true, showProvider: false, userChanged: true})
}

toggleProvider = (event) => {
  //event.preventDefault()
  event.stopPropagation()
  this.setState({showClinics : false, showService: false, showProvider: true, userChanged: true})
}

refreshAppointments = (start, end, view="") => {
  let formData = {};
  let showSelectedDate = '';
  if(view == "") {view = this.state.calendarView}
  let startEndDateWeek = (view == 'week') ? startEndDateOfWeek(this.state.selectedDate, 'YYYY-MM-DD') : { start: this.state.selectedDate, end: this.state.selectedDate }
  formData.start = (start) ? apiDateFormat(start) : apiDateFormat(startEndDateWeek.start);
  formData.end = (end) ? apiDateFormat(end) : apiDateFormat(startEndDateWeek.end);
  formData.service_ids = (this.state.services.length) ? this.state.selectedServices : [];
  formData.doctor_ids = (this.state.providers.length) ? this.state.selectedProviders : [];
  formData.clinic_id = this.state.clinic_id;
  let calendarFilter = JSON.parse(JSON.stringify(formData))

  //let calendarFilterObj = JSON.stringify(formData)
  //calendarFilter.selectedDate = this.state.selectedDate;
  calendarFilter.searchPickerDate = this.state.selectedDate;
  calendarFilter.calendarView = view;
  localStorage.setItem('calendarFilter', JSON.stringify(calendarFilter))
  this.setState({showClinics : false, showService: false, showProvider: false, userChanged: true, showLoader: true})
  this.props.getAppointments(formData);
}

changeClinic = (event) => {
  localStorage.setItem("showLoader", true);
  let clinicId = parseInt(event.currentTarget.dataset.id);
  let formData = {},
      returnState = {},
      clinic = {};

  let dateToSend = this.getFormDataDate();
  formData.start = apiDateFormat(dateToSend.start);
  formData.end = apiDateFormat(dateToSend.end);
  formData.service_ids = [];
  formData.doctor_ids = [];
  formData.clinic_id = clinicId;
  if(clinicId) {
    clinic = this.state.clinics.find(y => y.id == clinicId);
    returnState.selectedClinic = clinic.clinic_name;
  } else {
    returnState.clinic_id = clinicId;
    returnState.selectedClinic = 'Please Select';
  }
  for(let x in this.state) {
    if(x.startsWith('provider-') || x.startsWith('service-')) {
      returnState[x] = undefined;
    }
  }
  returnState.showLoader = true
  returnState.selectedServices = []
  returnState.selectedProviders = []
  this.setState(returnState)
  let calendarFilter = JSON.stringify(formData)
  localStorage.setItem('calendarFilter', calendarFilter)
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
    let formattedDate = moment(returnState.selectedDate);
    formattedDate = formattedDate.format('YYYY-MM-DD')
    let startEndDateWeek = (nextCalendarView == 'week') ? startEndDateOfWeek(this.state.selectedDate, 'YYYY-MM-DD') : { start: formattedDate, end: formattedDate };
    this.setState(returnState);
    this.setState(returnState, () => {
      this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end, 'week');
    })

    //this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end, 'week');
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
    return startEndDateWeek;
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
    //this.setState(returnState);
    let formattedDate = moment(date);
    formattedDate = formattedDate.format('YYYY-MM-DD')
    let startEndDateWeek = (this.state.calendarView == 'week') ? startEndDateOfWeek(date, 'YYYY-MM-DD') :  { start: formattedDate, end: formattedDate }
    this.setState(returnState, () => {
      this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end);
    })
    //this.refreshAppointments(startEndDateWeek.start, startEndDateWeek.end);
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
  if(this.props.markedTimeStamp != undefined && this.props.markedTimeStamp != state.markedTimeStamp) {
    let selDate = moment(this.state.selectedDate);
    //selDate = selDate.format('YYYY-MM-DD');
    this.refreshAppointments();
  }
  if(this.props.timestamp && this.props.timestamp != state.timestamp && (this.props.appointmentCancelled || this.props.notificationSent)) {
    //let dateForm = this.getFormDataDate()
    this.refreshAppointments();
  }
  if(this.props.notiTimeStamp && this.props.notiTimeStamp != state.notiTimeStamp) {
    //let dateForm = this.getFormDataDate()
    this.refreshAppointments();
  }
  if(this.props.patientCheckedIdTimestamp && this.props.patientCheckedIdTimestamp != state.patientCheckedIdTimestamp) {
    //let dateForm = this.getFormDataDate()
    this.refreshAppointments();
  }
  if(this.state.showModal || this.state.showPrintModal || this.state.showRescheduleConfirmModal || this.state.showAppointmentDetails || this.state.showCheckinData || this.state.showNotifyPop) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  ReactTooltip.rebuild();
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
  formData.success_msg = this.state.success_msg;
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
    formData.success_msg = this.state.success_msg;
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

dismissModal = () => {
  this.setState({showModal: !this.state.showModal})
}
dismissRescheduleModal = () => {
  this.setState({showRescheduleConfirmModal: !this.state.showRescheduleConfirmModal})
}
dismissPrintModal = () => {
  this.setState({showPrintModal: !this.state.showPrintModal})
}

toggleAllServices = (event) => {
  event.stopPropagation()
  let allServices = this.state.services;
  let returnState = {}
  let x = (this.state.selectAllService) ? false : true;
  let selectedServices = [];
  returnState.selectAllService = x;
  allServices.map((obj, idx) => {
    returnState["service-"+obj.id] = x;
    selectedServices.push(obj.id);
  })
  returnState.selectedServices = (x) ? selectedServices : [];
  returnState.userChanged = true;
  this.setState(returnState)
}

toggleAllProviders = (event) => {
  event.stopPropagation()
  let allServices = this.state.providers;
  let returnState = {}
  let x = (this.state.selectAllProviders) ? false : true;
  let selectedProviders = []
  returnState.selectAllProviders = x;
  allServices.map((obj, idx) => {
    returnState["provider-"+obj.id] = x;
    selectedProviders.push(obj.id)
  })
  returnState.selectedProviders = (x) ? selectedProviders : [];
  returnState.userChanged = true;
  this.setState(returnState)
}

applyFilter = (event) => {
  event.stopPropagation();
  localStorage.setItem("showLoader", true);
  this.refreshAppointments();
}
print = (mode) => {
  if(localStorage.getItem('calendarFilter')) {
    localStorage.setItem('showLoader', true)
    this.setState({showLoader: true})
    let calendarFilter  = JSON.parse(localStorage.getItem('calendarFilter'));
    calendarFilter.print_type = mode;
    this.props.printAppointment(calendarFilter);
  } else {
    let formData = {}
    formData.print_type = mode;
    formData.start = moment().format('YYYY-MM-DD');
    formData.end = moment().format('YYYY-MM-DD');
    this.props.printAppointment(formData)
  }
}
closeNotiPop = () => {
  if(this.state.notiMode == 'reschedule')
    toast.success(this.state.globalLang[this.state.success_msg]);

  this.setState({showNotifyPop: !this.state.showNotifyPop});
  this.refreshAppointments();
}

chargeAndReschedule = (event) => {
  let charge = event.currentTarget.dataset.charge;
  let formData = {}
  formData.appointment_id = this.state.updatedEvent.id;
  formData.patient_to_be_charged = (charge == "true") ? 1 : 0;
  formData.appointment_date = moment(this.state.updatedEvent.start).format('YYYY-MM-DD');
  formData.appointment_time = moment(this.state.updatedEvent.start).format('HH:mm:ss');
  localStorage.setItem('showLoader', true)
  this.setState({showModal: false, showLoader: true})
  this.props.rescheduleAppointment(formData);
}

render(){
  var stringLengt = this.state.selectedClinic;
  let smartBookingUrl = '';
  /*if(this.state.userData && this.state.userData.user.account_id === config.JUVLY_ACC_ID) {
    smartBookingUrl = "https://juvly.aestheticrecord.com/book/appointments?user_id=" + this.state.userData.user.hash_id;
   } else {*/
    /*let domainType = config.CURRENT_DOMAIN;
    */

    /*if ( domainType === 'dev' ) {
      curDomain = config.DEV_DOMAIN;
    } else {
      curDomain = config.LIVE_DOMAIN;
    }*/
    let curDomain  = this.state.userData.domain;
    smartBookingUrl = this.state.userData.host_name + this.state.userData.account.pportal_subdomain + "." + curDomain + ".com/book/appointments?user_id=" + this.state.userData.user.hash_id;
  //}

  let pName = (this.state.appointment_details && this.state.appointment_details.patient) ? this.state.appointment_details.patient.firstname  : ((this.state.patient_name) ? this.state.patient_name : "");
  let checkinPname = (this.state.appointment_details && this.state.appointment_details.patient) ? displayName(this.state.appointment_details.patient)  : "";

  let selectAllProvidersLabel  = (this.state.selectAllProviders) ? 'Unselect All' : 'Select All',
      selectAllServiceLabel = (this.state.selectAllService) ? 'Unselect All' : 'Select All';

return(
<div id="content">
  <div className="container-fluid content">
    <AppointmentHeader activeMenuTag={'calendar'} />
    <button className="line-btn pull-right goFullScreen show-desktop" onClick={this.goFull}><i className="fa fa-expand"></i> Enter Fullscreen</button>
    <Fullscreen
          enabled={this.state.isFull}
          onChange={isFull => this.setState({isFull})}
        >
    <span id="business_time" className={(this.state.openAt != '' && this.state.calendarView != 'week') ? "" : "no-display"}>{this.state.appointmentLang.appointment_opens_at}: {formatTime(this.state.openAt)} &nbsp;&nbsp; {this.state.appointmentLang.appointment_closes_at}: {formatTime(this.state.closesAt)}</span>
    <div className="row">
      <div className="col-lg-2 col-md-2 col-sm-4 cal-month-week-day-outer">
        <button className={(this.state.calendarView == 'week') ? 'calendar-btn btn-week selected' : 'calendar-btn btn-week'} onClick={this.handleCalendarView.bind(this, 'week')}>{this.state.appointmentLang.appointment_week}</button>
        <button className={(this.state.calendarView == 'day') ? 'calendar-btn btn-day selected' : 'calendar-btn btn-day'} onClick={this.handleCalendarView.bind(this, 'day')}>{this.state.appointmentLang.appointment_day}</button>
      </div>
      <div className="col-lg-4 col-md-3 col-sm-6 cal-date-btn-outer">
        <button className="calendar-btn today-btn" onClick={this.handleNextPrevDate.bind(this, 'today')}>{this.state.appointmentLang.appointment_today}</button>
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
        <button className="calendar-dropdown" onClick={this.toggleService} ref={(refServiceButton) => this.refServiceButton = refServiceButton}>{((this.state.services.length == 0) ? "No Service" : (this.state.selectedServices.length == 0) ? "All Services" : "("+this.state.selectedServices.length+") Services")}<a href="javascript:void(0);" className="cal-arrow pull-right"><img src={(this.state.showService) ? "/images/cal-up.png" : "/images/cal-down.png"}/></a>

           <div className={(this.state.showService) ? "filter-wid-apply-btn" : "filter-wid-apply-btn no-display"} >
            <div className="cal-filter-outer">
              <a className={(this.state.services.length == 0) ? "line-btn pull-right no-display" : "line-btn pull-right"} onClick={this.applyFilter} disabled={this.state.services.length}>{this.state.appointmentLang.appointment_apply}</a>
              <a className={(this.state.services.length == 0) ? "line-btn pull-right no-display" : "line-btn pull-right"} onClick={this.toggleAllServices} disabled={this.state.services.length}>{selectAllServiceLabel}</a>
            </div>
          <ul className={(this.state.services.length > 0) ? "cal-dropdown cal-service-dropdown" : "cal-dropdown cal-service-dropdown no-visible"}>
            {this.state.services.length > 0 && this.state.services.map((obj, idx) => {
              return (
              <li key={"services-"+idx}>
                <a >
                  <label className="checkbox" data-tip={obj.name}>
                    <input type="checkbox" value={obj.id} name={"service-"+obj.id} checked={(this.state["service-"+obj.id]) ? "checked" : false} autoComplete="off" onChange={this.handleInputChange} data-tip={obj.name} /> {obj.name}
                    <span > &nbsp; </span>
                  </label>
                </a>
              </li>
               )
            })}
          </ul>
          <div className={(this.state.services.length == 0) ? "no-record" : "no-display"}>{this.state.appointmentLang.appointment_no_service_found}</div>
          </div>
        </button>
        <button className="calendar-dropdown show" onClick={this.toggleProvider} ref={(refProviderButton) => this.refProviderButton = refProviderButton}>{(this.state.providers.length == 0) ? "No Provider" : ((this.state.selectedProviders.length == 0) ? "All Providers" : "("+this.state.selectedProviders.length+") Providers")}<a href="javascript:void(0);" className="cal-arrow pull-right" ><img src={(this.state.showProvider) ? "/images/cal-up.png" : "/images/cal-down.png"}/></a>

          <div className={(this.state.showProvider) ? "filter-wid-apply-btn" : "filter-wid-apply-btn no-display"} >
            <div className="cal-filter-outer">
              <a className={(this.state.providers.length == 0) ? "line-btn pull-right no-display" : "line-btn pull-right"} onClick={this.applyFilter} disabled={this.state.providers.length}>{this.state.appointmentLang.appointment_apply}</a>
              <a className={(this.state.providers.length == 0) ? "line-btn pull-right no-display" : "line-btn pull-right"} onClick={this.toggleAllProviders} disabled={this.state.providers.length}>{selectAllProvidersLabel}</a>
            </div>
            <ul className={(this.state.providers.length > 0) ? "cal-dropdown cal-service-dropdown" : "cal-dropdown cal-service-dropdown no-visible"}>
            {this.state.providers.length > 0 && this.state.providers.map((obj, idx) => {
              return (
              <li key={"provider-"+idx}>
                <a >
                  <label className="checkbox">
                    <input type="checkbox" value={this.state['provider-'+obj.id]} name={"provider-"+obj.id}  onChange={this.handleInputChange} checked={(this.state['provider-'+obj.id]) ? "checked" : false}/> {displayName(obj)}
                      <span className="filter-provider-span" style={{backgroundColor: obj.appointment_color}}>  </span>
                  </label>
                </a>
              </li>
               )
            })}
            </ul>
            <div className={(this.state.providers.length == 0) ? "no-record" : "no-display"}>{this.state.appointmentLang.appointment_no_provider_found}</div>
          </div>
        </button>
        <button className="calendar-dropdown cal-clinic" onClick={this.toggleClinics} ref={(refClinicButton) => this.refClinicButton = refClinicButton}>{stringLengt.length > 16 ? stringLengt.substring(0,15)+'...' : stringLengt } <a href="javascript:void(0);" className="cal-arrow pull-right"><img src={(this.state.showClinics) ? "/images/cal-up.png" : "/images/cal-down.png"}/></a>
        <ul className={(this.state.showClinics) ? "cal-dropdown clinicname-dropdown" : "cal-dropdown clinicname-dropdown no-display"} >
          {this.state.clinics.length > 0 && this.state.clinics.map((obj, idx) => {
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
        <a className="header-select-btn pull-right " onClick={() => {this.setState({showPrintModal: true})}}  id="print_cal" >{this.state.appointmentLang.appointment_print}</a>
        {checkIfPermissionAllowed('create-appointment') && <Link id="create_appointment1" className="new-blue-btn pull-right" data-url="/appointments/add_appointment" to="/appointment/create">
        {this.state.appointmentLang.appointment_create}</Link> }
            {checkIfPermissionAllowed('create-appointment') && <a id="" href={smartBookingUrl} target="_blank" className="new-procedure-btn new-blue-btn pull-right">
        <i className=""></i>{this.state.appointmentLang.appointment_smar_booking}</a> }
      </div>
    </div>
    <div className={(this.state.calendarView == 'week') ? "juvly-section full-width m-t-10 week-view-calendar" : "juvly-section full-width m-t-10 day-view-calendar"} id="juvly-section">
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
          step={15}
          timeslots={4}
          showMultiDayTimes
          toolbar={false}
          date = {this.state.selectedDate}
          onNavigate = {this.navigate}
          onView={this.onView}
        />
    }
    </div>
    <div className="allTimeDisplay">


      <div className="allTimeLabel"><img src="/images/History.svg" /> All times displayed in {this.state.clinic_timezone}</div>
      <div id="timezone_after_calendar" ></div>

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
                      <span>{this.state.appointmentLang.sales_date_of_booking} :</span> {this.state.appointment_details && showFormattedDate(this.state.appointment_details.appointment_booking.booking_datetime, true)}
                    </div>
                    <div className="appo-booking-info">
                      <span>{this.state.appointmentLang.appointment_booded_by} :</span> {this.state.appointment_details && this.state.appointment_details.appointment_booking.booked_by == 'staff' && displayName(this.state.appointment_details.appointment_booking.user)}
                      {this.state.appointment_details && this.state.appointment_details.appointment_booking.booked_by == 'customer' && "Customer"}
                    </div>
                    <span onClick={this.showPreviousBookings}>
                      <i className="far fa-clock client-treat-cal" ></i>
                    </span>
                  </div>
                  <div className={(this.state.showBookings) ? "appoint-pro-edit" : "appoint-pro-edit no-display"}>
                    <ul className="log-appoint-his">
                      {this.state.appointment_details && this.state.appointment_user_log.length > 0 && this.state.appointment_user_log.map((obj, idx) => {
                        let action = ''; if(obj.action == 'booked') {action = ' Booked on ';} else if(obj.action == 'marknoshow') {action = ' Mark no show on '} else if(obj.action == 'cancel') {action = ' Cancelled on '} else if(obj.child == 'notes' && obj.action == 'edit') {action = ' has Updated Appointment Note'} else if(obj.action == 'reschedule' || obj.action == 'edit') {action = ' Rescheduled on '}
                        return (<li key={"customer_bookings-"+idx}>{this.state.appointment_user_log && displayName(obj.user)} {action}  {showFormattedDate(obj.appointment_datetime, true)} </li>)
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
                    {this.state.appointment_details && this.state.appointment_details.appointment_booking.email}
                  </div>
                </div>
              </div>

              <div className="col-sm-6 col-xs-12">
                <div className="setting-field-outer">
                  <div className="new-field-label">{this.state.appointmentLang.appointment_phone}</div>
                  <div className="setting-input-box">
                    {this.state.appointment_details && this.state.appointment_details.appointment_booking.phone}
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
                <a  className="new-white-btn" onClick={() => {this.setState({showEditNote : false, notes: this.state.tempnotes })}}>{this.state.appointmentLang.appointment_cancel}</a>
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
                  <div className="new-field-label">{(this.state.appointment_details && this.state.appointment_details.package_id == 0) ? this.state.appointmentLang.appointment_service_services : this.state.appointmentLang.appointment_packages}</div>
                  <div className="setting-input-box">
                  {
                    this.state.appointment_details && this.state.appointment_details.package_id == 0 &&  this.state.appointment_details.appointment_services.map((obj, idx) => {
                      return (
                          <div className="services-listdiv service-list" key={"appointment_services-"+idx}>{obj.service.name}<span data-duration_hours="0" className="duration_hours">{convertDurationToVisibleFormat(obj.duration)} </span></div>
                        )
                    })
                  }
                  {
                    this.state.appointment_details && this.state.appointment_details.package_id != 0 &&
                          <div className="services-listdiv service-list">{this.state.appointment_details.package.name +" ("+this.state.appointment_details.package.hours+" hrs "+this.state.appointment_details.package.mins+ "mins)"}</div>
                  }
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xs-12">
                <div className="setting-field-outer">
                  <div className="new-field-label">{this.state.appointmentLang.appointment_date_time}</div>
                  <div className="setting-input-box">
                    {this.state.appointment_details && showFormattedDate(this.state.appointment_details.appointment_datetime, true)}
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
          <p className={(this.state.last_canceled_appointment != null) ? "p-text last-cancel-appint" : "p-text last-cancel-appint no-display"}>{this.state.appointmentLang.appointment_last_cancelled}: {this.state.last_canceled_appointment && showFormattedDate(this.state.last_canceled_appointment.appointment_datetime, true)}</p>
          <Link to={"/appointment/edit/"+this.state.editAppointmentId} className={(this.state.appointment_details && this.state.available_buttons.indexOf('edit-appointment') > -1) ? "new-green-btn pull-right" : "new-green-btn pull-right no-display"}>{this.state.appointmentLang.appointment_edit_label}</Link>
          <a  className={(this.state.appointment_details && this.state.available_buttons.indexOf('cancel-appointment') > -1) ? "new-red-btn pull-right m-l-10" : "new-red-btn pull-right m-l-10 no-display"} data-mode="cancel" onClick={this.getAppointmentFees}>{this.state.appointmentLang.appointment_cancel_label}</a>
          <a  className={(this.state.appointment_details && this.state.available_buttons.indexOf('mark-as-noshow') > -1) ? "new-yellow-btn pull-right" : "new-yellow-btn pull-right no-display"} data-mode="markasnoshow" onClick={this.getAppointmentFees}>{this.state.appointmentLang.appointment_mark_as_no_show}</a>
          <a  className={(this.state.appointment_details && this.state.available_buttons.indexOf('patient-check-in') > -1) ? "new-green-btn pull-right no-margin" : "new-green-btn pull-right no-display"} onClick={this.patientCheckIn}>{this.state.appointmentLang.appointment_patient_check_in}</a>
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
              <div className="popup-name">{pName} - {this.state.appointmentLang.appointment_check_in}</div>
              <a onClick={() => {this.setState({showCheckinData : !this.state.showCheckinData})}} className="small-cross">×</a>
            </div>
            <div className="small-popup-content">
              <div className="juvly-container no-padding-bottom">
                <div className="row">
                  <div className="col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.appointmentLang.appointment_room}<span className="required">*</span></div>
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
                  <p className="p-text col-xs-12"><input type="checkbox" className="new-check" name="send_to_provider" checked={(this.state.send_to_provider) ? "checked" : false} autoComplete="off" onChange={this.handleInputChange}/>{this.state.appointmentLang.appointment_send_this}</p>
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
              <a className="small-cross" onClick={this.closeNotiPop}>×</a>
            </div>
            <div className="small-popup-content">
            <div className="juvly-container no-padding-bottom">

            <div className={(this.state.notiMode == 'cancel') ? "juvly-subtitle" : "no-display"}>{this.state.appointmentLang.appointment_r_u_sure_cancel} {pName}'s {this.state.appointmentLang.appointment_question_mark}<br/>
              {this.state.appointmentLang.appointment_will_be_removed} {pName}'s {this.state.appointmentLang.appointment_history}.
            </div>
            <div className={(this.state.notiMode == 'reschedule') ? "juvly-subtitle" : "no-display"}>{this.state.appointmentLang.appointment_rescheduled_successfully}
            </div>

            <div className="row">
              <div className="col-xs-12">
                <div className="setting-field-outer">
                  <div className="new-field-label">{pName} {this.state.appointmentLang.appoinment_will_be_notified}:</div>
                  <select className="setting-select-box" name="notification_type" onChange={this.handleInputChange} value={this.state.notification_type}>
                    <option value="email">{this.state.appointmentLang.appointment_email}</option>
                    <option value="sms">{this.state.appointmentLang.appointment_sms}</option>
                    <option value="emailAndSms">{this.state.appointmentLang.appointment_both}</option>
                    {(this.state.notiMode == 'cancel') && <option value="dontsend">{this.state.appointmentLang.appointment_dont_send_notification}</option> }
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
          <a   onClick={this.closeNotiPop} className="new-red-btn pull-left">{(this.state.notiMode == 'cancel') ? "Back" : this.state.appointmentLang.appointment_dont_send_notification}</a>
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
            <h4 className="modal-title" id="model_title">{(this.state.notiMode == 'reschedule') ? "Rescheduling Fee" : "Cancellation Fee"}</h4>
          </div>
          <div id="errorwindow" className="modal-body add-patient-form filter-patient">
            {(this.state.notiMode == 'reschedule') ? "There is a rescheduling fee of " : this.state.appointmentLang.appointment_cancellation_fee_of } {numberFormat(this.state.cancellation_fee, 'currency')}. {this.state.appointmentLang.appointment_want_to_do}
          </div>
          <div className="modal-footer" >

              {this.state.notiMode == 'reschedule' &&
                <div className="col-md-12 text-left" id="footer-btn">
                  <button type="button" className="btn btn-success pull-right" data-charge={true} onClick={this.chargeAndReschedule}>{this.state.appointmentLang.appointment_save_charge}</button>
                  <button type="button" className="btn  logout pull-right m-r-10" data-charge={false} onClick={this.chargeAndReschedule}>{this.state.appointmentLang.appointment_save_do_not_charge}</button>
                </div>
              }
              {this.state.notiMode != 'reschedule' &&
                <div className="col-md-12 text-left" id="footer-btn">
                   <button type="button" className="btn btn-success pull-right" data-charge={true} onClick={this.chargeAndFurther}>{this.state.appointmentLang.appointment_cancel_and_charge}</button>
                  <button type="button" className="btn  logout pull-right m-r-10" data-charge={false} onClick={this.chargeAndFurther}>{this.state.appointmentLang.appointment_cancel_donot_charge}</button>
                </div>
              }
          </div>
        </div>
      </div>
    </div>
    <div className={(this.state.showPrintModal) ? "modalOverlay" : "modalOverlay no-display"}>
      <div className="small-popup-outer">
          <div className="small-popup-header">
            <div className="popup-name">{this.state.appointmentLang.appointment_print}</div>
            <a className="small-cross" onClick={() => this.setState({showPrintModal: !this.state.showPrintModal})}>×</a>
          </div>
          <div className="small-popup-content">
              <div className="juvly-container">
               <div className="row">
                    <div className="col-xs-12 printable-img-title">
                      {this.state.appointmentLang.appointment_we_offer}.
                    </div>
                    <div className="col-sm-6">
                      <a className="printable-img print_cal_option" onClick={this.print.bind(this, 'short')}>
                        <img src="/images/short.png" />
                        <div className="text-center">{this.state.appointmentLang.appointment_short}</div>
                      </a>
                    </div>
                    <div className="col-sm-6">
                      <a className="printable-img print_cal_option" onClick={this.print.bind(this, 'extensive')}>
                        <img src="/images/extensive.png" />
                        <div className="text-center">{this.state.appointmentLang.appointment_extensive}</div>
                      </a>
                    </div>
                </div>
              </div>
          </div>
        </div>
    </div>
    <div className={(this.state.showRescheduleConfirmModal ? 'overlay' : '')}></div>
      <div id="filterModal" role="dialog" className={(this.state.showRescheduleConfirmModal ? 'modal fade in displayBlock' : 'modal fade')}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" onClick={this.dismissRescheduleModal}>×</button>
              <h4 className="modal-title" id="model_title">{this.state.globalLang.are_you_sure}</h4>
            </div>
            <div id="errorwindow" className="modal-body add-patient-form filter-patient">
              {this.state.appointmentLang.reschedule_confirmation_message}
            </div>
            <div className="modal-footer" >
              <div className="col-md-12 text-left" id="footer-btn">
                <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissRescheduleModal}>{this.state.appointmentLang.no_option}</button>
                <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.rescheduleAppoint}>{this.state.appointmentLang.yes_option}</button>
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
      <ReactTooltip effect="float" multiline={true} place="right" />

      
        </Fullscreen>
      </div>
    </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  //toast.dismiss();
  localStorage.setItem("showLoader", false);
  if (state.AppointmentReducer.action === 'GET_APPOINTMENTS' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.appointmentsData = state.AppointmentReducer.data.data;
      returnState.appointmentsTimestamp = new Date()
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
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
      returnState.markedAsNoShow = true;
      returnState.markedTimeStamp = state.AppointmentReducer.data.data.timestamp;
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
      returnState.patientCheckedIdTimestamp = new Date();
      toast.success(languageData.global[state.AppointmentReducer.data.message])
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
      returnState.feesTime = new Date()
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
      returnState.notificationSent = true;
      returnState.timestamp = state.AppointmentReducer.data.data.timestamp;
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
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
      //toast.success(languageData.global[state.AppointmentReducer.data.message]);
    }
  }

  if (state.AppointmentReducer.action === 'SEND_NOTIFICATION_CALENDAR' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
      returnState.notificationSent = true;
      returnState.notiTimeStamp = new Date();
    }
  }
  if (state.AppointmentReducer.action === 'UPDATE_NOTES' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.notesUpdates = true;
      returnState.notesUpdatedTimeStamp = new Date();
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    }
  }
  if (state.AppointmentReducer.action === 'PRINT_APPOINTMENT' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.exportCsvData = state.AppointmentReducer.data.data;
      returnState.printTimeStamp = new Date();
    }
  }


  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getAppointments: getAppointments, getAppointment: getAppointment, markNoShow: markNoShow, updateNotes: updateNotes, checkin: checkin, makePatientCheckin: makePatientCheckin, exportEmptyData:exportEmptyData, getAppointmentFees: getAppointmentFees, getCancelNotification: getCancelNotification, cancelAppointment: cancelAppointment, checkRescheduleTime: checkRescheduleTime, rescheduleAppointment: rescheduleAppointment, sendNotification: sendNotification, printAppointment: printAppointment}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(Calendar));
