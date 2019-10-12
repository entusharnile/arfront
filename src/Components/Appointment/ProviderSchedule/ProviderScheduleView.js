import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import axios from 'axios';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import config from '../../../config';
import { PropTypes } from 'prop-types';
import { DragDropContext } from "react-dnd";
import InputMask from 'react-input-mask';
import DatePicker from "react-datepicker";
import calenLogo from '../../../images/calender.svg';
import "react-datepicker/dist/react-datepicker.css";
import HTML5Backend from 'react-dnd-html5-backend';
import moment from 'moment';
import AppointmentHeader from '../AppointmentHeader.js'
import BigCalendar from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import dates from 'react-big-calendar/lib/utils/dates'
import {
  getProviderScheduleById,
  createProviderSchedule,
  updateProviderSchedule,
  deleteProviderSchedule,
} from '../../../Actions/Appointment/appointmentAction.js';
import { geCommonTrackEvent} from '../../../Actions/Common/commonAction.js';
import { convertTime12to24, convertTime24to12, getAmPm, displayName,handleScheduleMasking, showFormattedDate, formatTime } from '../../../Utils/services.js';
import "react-datepicker/dist/react-datepicker.css";
import ReactTooltip from 'react-tooltip'



//import localizer from 'react-big-calendar/lib/localizers/globalize'
const localizer = BigCalendar.momentLocalizer(moment)

const ColorArray = [
  '#6ca6cd', '#ae0001', '#C71577', '#9932CC', '#632a01', '#FF8C00', '#c0c0c0', '#FF1493', '#4af79c', '#1E90FF', '#7b526c', '#DC143C', '#9f0101',
  '#404040', '#9f0101', '#404040', '#598a6f', '#FF6347', '#efb509', '#fff8b6', '#ffb90f', '#2abe3d', '#c66f6f', '#6897bb', '#00008B', '#76588c',
  '#800000', '#6BA5C2', '#4B0082'
];

const DragAndDropCalendar = withDragAndDrop(BigCalendar)

const resourceMap = [
  { resourceId: 1, resourceTitle: 'Heena Naaz' },
  { resourceId: 2, resourceTitle: 'Deepika Atri' },
  { resourceId: 3, resourceTitle: 'Avdesh' },
  { resourceId: 4, resourceTitle: 'Ravi' },
]

const dateFormatPicker = 'yyyy-MM-dd';
const dateFormatMoment = 'YYYY-MM-DD';

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

const showSelectedMonth = (date = moment()) => {
  let showSelectedLabel = '';
  let startOfWeek = moment(date).startOf('month');
  let ednOfWeek = moment(date).endOf('month');
  if (startOfWeek.format('YYYY') != ednOfWeek.format('YYYY')) {
    showSelectedLabel = startOfWeek.format('MMM DD, YY - ') + ednOfWeek.format('MMM DD, YY')
  } else if (startOfWeek.format('MM') != ednOfWeek.format('MM')) {
    showSelectedLabel = startOfWeek.format('MMM DD - ') + ednOfWeek.format('MMM DD, YYYY')
  } else {
    showSelectedLabel = startOfWeek.format('MMM ') + startOfWeek.format('DD - ') + ednOfWeek.format('DD, YYYY');
  }
  return showSelectedLabel;
}

const startEndDateOfWeek = (date, format = 'YYYY-MM-DD') => {
  return {
    startDate: moment(date).startOf('week'),
    endDate: moment(date).endOf('week'),
  }
}

const startEndDateOfMonth = (date, format = 'YYYY-MM-DD') => {
  return {
    startDate: moment(date).startOf('month'),
    endDate: moment(date).endOf('month'),
  }
}

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}
const viewDateFormat = (date) => {
  return moment(date).format('MMMM DD, YYYY');
}

const week = {
                Monday: "Monday",
                Tuesday: "Tuesday",
                Wednesday: "Wednesday",
                Thursday: "Thursday",
                Friday: "Friday",
                Saturday: "Saturday",
                Sunday: "Sunday",
              }

const initClinicSchedule = () => {
  return {
    id: '',
    name: '',
    schedules: [{
      from_time: "00:00",
      from_time_option: "AM",
      from_time_24: '00:00',
      to_time: "00:00",
      to_time_option: "PM",
      to_time_24: '00:00',
      /*
      from_time:"12:00",
      from_time_option:"AM",
      from_time_24 : '00:00',
      to_time:"12:00",
      to_time_option:"PM",
      to_time_24 : '12:00',
      */
    }]
  }
}

const initSchedule = () => {
  return {
    from_time: "00:00",
    from_time_option: "AM",
    from_time_24: '00:00',
    to_time: "00:00",
    to_time_option: "PM",
    to_time_24: '00:00',
    /*
    from_time:"12:00",
    from_time_option:"AM",
    from_time_24 : '00:00',
    to_time:"12:00",
    to_time_option:"PM",
    to_time_24 : '12:00',
    */
  }
}


const initScheduleError = () => {
  return {
    from_time: 'setting-input-box hours-time from-time-input',
    from_time_option: 'setting-select-box hours-pm from_time_option',
    to_time: 'setting-input-box hours-time to-time-input',
    to_time_option: 'setting-select-box hours-pm to_time_option',
  }
}



class ProviderScheduleView extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      globalLang: languageData.global,
      appointmentLang: languageData.appointments,
      providerId: 0,
      events: [],
      showSelectedDate: showSelectedMonth(),
      selectedDate: moment().toDate(),
      calendarView: 'month',
      calendarStep: 5,
      calenderTimeslots: 3,
      searchPickerDate: moment().toDate(),
      isChangeWeek: false,
      providerScheduleData: {},
      allClinics: [],
      associatedClinics: [],
      providerScheduleList: [],
      providerInfo: [],
      selectedClinicId: 0, // 0 for all
      selectedClinics: [], // 0 for all
      isShowClinicModal: false,
      showLoader: false,
      isCreateProviderScheduleModal: false,
      isGetProviderScheduleModal: false,
      userChanged: false,
      clinicScheduleList: [initClinicSchedule()],
      selectedPickerDate: null,
      selectedRepeatPickerDate: null,
      showDatePicker: false,
      showRepeatDatePicker: false,
      isShowDeleteModal: false,
      checkMode: false,
      selectedEvent: {
        id: null,
        clinic_id: null,
        clinic_name: null,
        from_time: "00:00",
        from_time_option: "AM",
        from_time_24: '00:00',
        to_time: "00:00",
        to_time_option: "AM",
        to_time_24: '00:00',
        date: null,
        isPassedDateForDelete: false // if selected event is passed
      },
      selectedPickerDateClass: 'setting-input-box p-r-40',
      selectedRepeatPickerDateClass: 'setting-input-box p-r-40',
      clinicScheduleListError: [initScheduleError()],
      selectedEventError: {
        date: 'setting-input-box p-r-40',
        from_time: 'setting-input-box hours-time from-time-input',
        from_time_option: 'setting-select-box hours-pm from_time_option',
        to_time: 'setting-input-box hours-time to-time-input',
        to_time_option: 'setting-select-box hours-pm to_time_option',
      },
      schedule_type: 'daily',
      day: 'Monday',
      errorDates : [],
      errorMessageModal: false,
      errorText: '',
      createdTimestamp: new Date()
    }
    let user = JSON.parse(localStorage.getItem('userData'));
    this.moveEvent = this.moveEvent.bind(this);
  }

  componentDidUpdate(props, state) {
    ReactTooltip.rebuild();

    if(this.props.createdTimestamp != undefined && this.props.createdTimestamp != state.createdTimestamp) {
      this.props.getProviderScheduleById(this.state.formData, state.providerId);
    }
    if(this.state.errorMessageModal || this.state.isShowDeleteModal || this.state.isGetProviderScheduleModal || this.state.isCreateProviderScheduleModal ) {
      document.body.style.overflow = 'hidden';
      const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
      datePicker1.childNodes[0].setAttribute("readOnly",true);
      const datePicker2=document.getElementsByClassName("react-datepicker__input-container")[1];
      datePicker2.childNodes[0].setAttribute("readOnly",true);
      const datePicker3=document.getElementsByClassName("react-datepicker__input-container")[2];
      datePicker3.childNodes[0].setAttribute("readOnly",true);
    }

  }

  componentDidMount() {

    document.addEventListener('click', this.handleClick, false);

    const providerId = this.props.providerId;
    const valTrack = "Provider Schedule Setup";
    if(!providerId){
      this.providerId.geCommonTrackEvent(valTrack);
    }
    if (providerId) {
      this.setState({ providerId: providerId, showLoader: true })
      let startEndDateWeek = startEndDateOfMonth(moment());
      let formData = {
        'params': {
          start_date: apiDateFormat(moment(startEndDateWeek.startDate).toDate()),
          end_date: apiDateFormat(moment(startEndDateWeek.endDate).toDate()),
        }
      }
      this.props.getProviderScheduleById(formData, providerId);
    }

  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {}
    if (props.errorDates !== undefined && props.errorDates !== state.errorDates) {
      returnState.errorDates = (props.errorDates) ? props.errorDates : []
      if (props.errorDates) {
        returnState.errorMessageModal = true;
        returnState.isCreateProviderScheduleModal = true;
        returnState.errorText = props.errorText;
      }
    }
    if (props.providerScheduleData !== undefined && props.providerScheduleData !== state.providerScheduleData) {
      returnState.providerScheduleData = props.providerScheduleData;
      returnState.providerScheduleList = props.providerScheduleData.provider_schedule;
      returnState.showLoader = false;

      let associatedClinics = [];
      if (!state.userChanged) {
        //if (true) {
        returnState.allClinics = props.providerScheduleData.all_clinics;
        returnState.providerInfo = props.providerScheduleData.provider_info;
        let clinicScheduleList = [];
        let clinicScheduleListError = [];
        props.providerScheduleData.clinics_associated.map((obj, idx) => {
          let color = (ColorArray[idx] != undefined) ? ColorArray[idx] : ColorArray[1];
          let clinic = obj;
          props.providerScheduleData.all_clinics.map((obj1, idx1) => {
            if (obj1.id == obj.id) {
              clinic['color'] = obj1.clinic_color;
            }
          })
          clinic['checked'] = false;
          associatedClinics.push(clinic);


          let clinicSchedule = {};
          clinicSchedule.id = obj.id;
          clinicSchedule.name = obj.clinic_name;
          clinicSchedule.clientName = obj.clinic_name;
          clinicSchedule.title = obj.clinic_name;
          clinicSchedule.schedules = [initSchedule()];
          clinicScheduleList.push(clinicSchedule);

          let clinicScheduleError = {};
          clinicScheduleError.id = obj.id;
          clinicScheduleError.name = obj.clinic_name;
          clinicScheduleError.schedules = [initScheduleError()];
          clinicScheduleListError.push(clinicScheduleError);
        });
        returnState.associatedClinics = associatedClinics;
        returnState.clinicScheduleList = clinicScheduleList;
        returnState.clinicScheduleListError = clinicScheduleListError;
      } else {
        associatedClinics = state.associatedClinics
      }

      let events = [];
      props.providerScheduleData.provider_schedule.map((obj, idx) => {
        let dateArr = obj.date_scheduled_event.split('-');
        let startTime = obj.from_time.split(':');
        let endTime = obj.to_time.split(':');
        let schedule = {};
        schedule.id = obj.id + "_" + obj.clinic_id
        schedule.title = (obj.clinic) ? obj.clinic.clinic_name : '';
        schedule.clientName = schedule.title;
        schedule.title = formatTime(obj.from_time) + " - " + formatTime(obj.to_time);
        schedule.clinicColor = obj.clinic.clinic_color;
        schedule.start = new Date(dateArr[0], dateArr[1]-1, dateArr[2], startTime[0],startTime[1],'00');
        schedule.end = new Date(dateArr[0], dateArr[1]-1, dateArr[2], endTime[0],endTime[1],'00');
        schedule.color = obj.clinic.clinic_color;
        events.push(schedule);
      });
      returnState.events = events;
    } else if (props.reload != undefined && props.reload == true && props.createdTimestamp != state.createdTimestamp) {

      let startEndDateWeek = '';
      if (state.calendarView == 'week') {
        startEndDateWeek = startEndDateOfWeek(state.selectedDate)
      } else if (state.calendarView == 'day') {
        startEndDateWeek = { startDate: state.selectedDate, endDate: state.selectedDate }
      } else {
        startEndDateWeek = startEndDateOfMonth(state.selectedDate)
      }
      let formData = {
        'params': {
          start_date: apiDateFormat(startEndDateWeek.startDate),
          end_date: apiDateFormat(startEndDateWeek.endDate),
        }
      }
      if (state.selectedClinicId) {
        formData.params['clinic_id'] = state.selectedClinicId;
      }

      returnState.formData = formData;
      returnState.showLoader = true;
      returnState.isCreateProviderScheduleModal = false;
      returnState.isGetProviderScheduleModal = false;
      returnState.createdTimestamp = props.createdTimestamp;
          //props.getProviderScheduleById(formData, state.providerId);
    } else if (props.redirect != undefined && props.redirect == true) {
      toast.success(props.message)
      props.history.push('/appointment/provider-schedule');
    } else if (props.showLoader != undefined && props.showLoader == false) {
      returnState.showLoader = false;
    }
    return returnState;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }


  handleClick = (e) => {
    if (!this.refDatePickerContainer.contains(e.target) && !this.refRepeatDatePickerContainer.contains(e.target) && !this.refUpdateDatePickerContainer.contains(e.target)) {
      this.setState({ showDatePicker: false })
    } else {
      if (this.refDatePicker == e.target || this.refRepeatDatePicker == e.target || this.refUpdateDatePicker == e.target) {
        this.setState({ showDatePicker: false })
      } else {
        this.setState({ showDatePicker: true })
      }
    }
    if (!this.refDatePickerContainer.contains(e.target)) {
      this.refDatePicker.setOpen(false);
    }
    if (!this.refRepeatDatePickerContainer.contains(e.target)) {
      this.refRepeatDatePicker.setOpen(false);
    }
    if (!this.refUpdateDatePickerContainer.contains(e.target)) {
      this.refUpdateDatePicker.setOpen(false);
    }
    if (!this.refAssociateClinicContainer.contains(e.target)) {
      this.setState({ isShowClinicModal: false })
    }
  }

  onSelectEvent = (event) => {
    let selectedEvent = this.state.selectedEvent;
    let eventId = event.id.split('_');
    selectedEvent.id = parseInt(eventId[0]);
    selectedEvent.clinic_id = parseInt(eventId[1]);
    selectedEvent.clinic_name = event.clientName;
    selectedEvent.date = event.start;
    selectedEvent.from_time = moment(event.start).format('hh:mm');
    selectedEvent.from_time_24 = moment(event.start).format('HH:mm');
    selectedEvent.from_time_option = moment(event.start).format('A');
    selectedEvent.to_time = moment(event.end).format('hh:mm');
    selectedEvent.to_time_24 = moment(event.end).format('HH:mm');
    selectedEvent.to_time_option = moment(event.end).format('A');
    //selectedEvent.isPassedDateForDelete = (moment() < moment(event.start)) ? false : true;
    selectedEvent.isPassedDateForDelete = (moment(event.start).isSameOrAfter(new Date(), 'day')) ? false : true;
    let selectedEventError = {
      date: 'setting-input-box p-r-40',
      from_time: 'setting-input-box hours-time from-time-input',
      from_time_option: 'setting-select-box hours-pm from_time_option',
      to_time: 'setting-input-box hours-time to-time-input',
      to_time_option: 'setting-select-box hours-pm to_time_option',
    }
    this.setState({ selectedEvent: selectedEvent, selectedEventError: selectedEventError, isGetProviderScheduleModal: true, updateSelectedDate: event.start })
  }

  onSelectSlot = ({ start, end, slots, action }) => {
    let returnState = {}
    let currentDate = moment(new Date());
    let eventOriginalDate = moment(start);
    var currentDayCheck = eventOriginalDate.diff(currentDate, 'days')
    if (action == 'click' && currentDayCheck >= 0) {
      let dt = moment(start).format('dddd');
      if(this.state.schedule_type == 'weekly') {
        returnState.day = dt;
      }
      let clinicScheduleList = this.state.clinicScheduleList;
      let clinicScheduleListError = this.state.clinicScheduleListError;
      clinicScheduleList.map((obj, idx) => {
        clinicScheduleList[idx]['schedules'] = [initSchedule()];
        clinicScheduleListError[idx]['schedules'] = [initScheduleError()];
      });
      returnState.clinicScheduleList = clinicScheduleList;
      returnState.clinicScheduleListError = clinicScheduleListError;
      returnState.isCreateProviderScheduleModal = true;
      returnState.selectedPickerDate = start;
      returnState.selectedRepeatPickerDate = null;
      this.setState(returnState);
    }
  }

  onSelectSlotBtn = () => {
    let clinicScheduleList = this.state.clinicScheduleList;
    let clinicScheduleListError = this.state.clinicScheduleListError;
    clinicScheduleList.map((obj, idx) => {
      clinicScheduleList[idx]['schedules'] = [initSchedule()];
      clinicScheduleListError[idx]['schedules'] = [initScheduleError()];
    });
    this.setState({ clinicScheduleList: clinicScheduleList, clinicScheduleListError: clinicScheduleListError, isCreateProviderScheduleModal: true, selectedPickerDate: moment().toDate(), selectedRepeatPickerDate: null });
  }

  onNavigate = (event) => {
  }

  onView = (event) => {
  }

  moveEvent({ event, start, end, resourceId, isAllDay: droppedOnAllDaySlot }) {
    const { events } = this.state

    if (event.resourceId != resourceId) {
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

    const nextEvents = [...events]
    nextEvents.splice(idx, 1, updatedEvent)

    this.setState({
      events: nextEvents,
    })
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

  handleInputChange = (event) => {
    let returnState = {};
    const target = event.target;
    let value = target.value;
    const inputName = target.name;
    const scheduleIndex = event.target.dataset.scheduleindex;
    const clinicIndex = event.target.dataset.clinicindex;
    const updateschedule = target.dataset.updateschedule;
    if (clinicIndex && scheduleIndex) {
      let clinicScheduleList = this.state.clinicScheduleList;
      clinicScheduleList[clinicIndex]['schedules'][scheduleIndex][inputName] = value;
      clinicScheduleList[clinicIndex]['schedules'][scheduleIndex]['from_time_24'] = convertTime12to24(clinicScheduleList[clinicIndex]['schedules'][scheduleIndex]['from_time'] + " " + clinicScheduleList[clinicIndex]['schedules'][scheduleIndex]['from_time_option']);
      clinicScheduleList[clinicIndex]['schedules'][scheduleIndex]['to_time_24'] = convertTime12to24(clinicScheduleList[clinicIndex]['schedules'][scheduleIndex]['to_time'] + " " + clinicScheduleList[clinicIndex]['schedules'][scheduleIndex]['to_time_option']);
      this.setState({ clinicScheduleList: clinicScheduleList });
    } else if (updateschedule) {
      let selectedEvent = this.state.selectedEvent
      selectedEvent[inputName] = value;
      selectedEvent.from_time_24 = convertTime12to24(selectedEvent.from_time + " " + selectedEvent.from_time_option);
      selectedEvent.to_time_24 = convertTime12to24(selectedEvent.to_time + " " + selectedEvent.to_time_option);
      this.setState({ selectedEvent: selectedEvent });
    } else {
      switch (target.type) {
        case 'checkbox': {
          value = target.checked;
          const clinicId = parseInt(target.dataset.clinicid);
          let allSelectedClinics = this.state.selectedClinics;
          let returnState = {}
          if (clinicId) {
            let selectedClinicId = (value) ? clinicId : 0;
            let index = allSelectedClinics.indexOf(clinicId)
            if(index > -1) {
              if(!value) {
                allSelectedClinics.splice(index, 1);
              }
            } else {
              if(value) {
                allSelectedClinics.push(clinicId);
              }
            }
            if(this.state.associatedClinics.length == allSelectedClinics.length) {
              returnState.checkMode = true;
            } else {
              returnState.checkMode = false;
            }
            returnState.selectedClinics = allSelectedClinics
            returnState.selectedClinicId = selectedClinicId;
            this.setState(returnState);
            const associatedClinics = this.state.associatedClinics;
            associatedClinics.map((obj, idx) => {
              associatedClinics[idx]['checked'] = (clinicId == obj.id) ? value : false;
            });
            this.setState({ associatedClinics: associatedClinics });
            //this.getProviderScheduleById(this.state.calendarView, this.state.selectedDate, allSelectedClinics);
          }
          break;
        }
        case 'radio': {
          value = target.value;
          break;
        }
      }

      if(event.target.name == 'schedule_type' && value == "weekly") {
        let dt = moment(this.state.selectedPickerDate).format('dddd');
          returnState.day = dt;
      }
      returnState[event.target.name] = value;
      returnState.userChanged = true;
      this.setState(returnState);
    }
  }

  handleSubmitCreate = (event) => {
    const name = event.target.name;
    let error = false;
    let selectedPickerDate = this.state.selectedPickerDate;
    if (typeof selectedPickerDate === undefined || selectedPickerDate === null || selectedPickerDate === '') {
      this.setState({
        selectedPickerDateClass: 'setting-input-box p-r-40 field_error'
      })
      error = true;
    } else if (selectedPickerDate) {
      this.setState({
        selectedPickerDateClass: 'setting-input-box p-r-40'
      })
    }
    let selectedRepeatPickerDate = this.state.selectedRepeatPickerDate;
    if (typeof selectedRepeatPickerDate != undefined && selectedRepeatPickerDate != null && selectedRepeatPickerDate != '') {
      if (moment(selectedPickerDate) >= moment(selectedRepeatPickerDate)) {
        error = true;
        this.setState({
          selectedRepeatPickerDateClass: 'setting-input-box p-r-40 field_error'
        })
      } else {
        this.setState({
          selectedRepeatPickerDateClass: 'setting-input-box p-r-40'
        })
      }
    } else {
      if(this.state.schedule_type == 'weekly' && (selectedRepeatPickerDate == '' || selectedRepeatPickerDate == null)) {
        this.setState({
          selectedRepeatPickerDateClass: 'setting-input-box p-r-40 field_error'
        })
        toast.error("Please select date till repeat!");
        return false;
      } else {
        this.setState({
          selectedRepeatPickerDateClass: 'setting-input-box p-r-40'
        })
      }
    }

    if (error) {
      toast.dismiss();
      toast.error(this.state.globalLang.error_please_a_valid_time);
      return false;
    }

    selectedPickerDate = moment(new Date()).format('YYYY-MM-DD');
    let clinicScheduleList = this.state.clinicScheduleList;
    let clinicScheduleListError = this.state.clinicScheduleListError;
    let formClinicScheduleList = [];
    let errorAtLeastOne = true;
    let errorTime = true;
    clinicScheduleList.map((clinicObject, clinicIndex) => {
      clinicObject.schedules.map((scheduleObject, scheduleIndex) => {
        let errorSchedule = false;
        let scheduleError = {
          from_time: 'setting-input-box hours-time from-time-input',
          from_time_option: 'setting-select-box hours-pm from_time_option',
          to_time: 'setting-input-box hours-time to-time-input',
          to_time_option: 'setting-select-box hours-pm to_time_option',
        };

        if (scheduleObject.from_time != "00:00" || scheduleObject.to_time != "00:00") {
          errorAtLeastOne = false;
          if (scheduleObject.from_time == "00:00") {
            error = true;
            scheduleError.from_time = 'setting-input-box hours-time from-time-input field_error'
          } else if (scheduleObject.to_time == "00:00") {
            error = true;
            scheduleError.to_time = 'setting-input-box hours-time to-time-input field_error'
          } else {
            let fromDateTime = moment(selectedPickerDate + ' ' + scheduleObject.from_time_24);
            let toDateTime = moment(selectedPickerDate + ' ' + scheduleObject.to_time_24);

            if (moment(toDateTime).isSame(fromDateTime) || moment(toDateTime).isBefore(fromDateTime)) {
              error = true;
              errorSchedule = true;
              errorTime = true;
              scheduleError.from_time = 'setting-input-box hours-time from-time-input field_error'
              scheduleError.from_time_option = 'setting-select-box hours-pm from_time_option field_error'
              scheduleError.to_time = 'setting-input-box hours-time to-time-input field_error'
              scheduleError.to_time_option = 'setting-select-box hours-pm to_time_option field_error'
            }
          }

          if (!errorSchedule) {
            let clinicIdExists = false
            const timeSchedules = {
              from_time: scheduleObject.from_time_24,
              to_time: scheduleObject.to_time_24,
            }
            if (formClinicScheduleList.length) {
              formClinicScheduleList.map((formObj, formIndx) => {
                if (formObj.id == clinicObject.id) {
                  clinicIdExists = true;
                  formClinicScheduleList[formIndx]['time_schedules'].push(timeSchedules);
                }
              })
            }
            if (!clinicIdExists) {
              let formSchedule = {}
              formSchedule.id = clinicObject.id;
              formSchedule.time_schedules = [];
              formSchedule.time_schedules.push(timeSchedules)
              formClinicScheduleList.push(formSchedule);
            }
          }
        }
        clinicScheduleListError[clinicIndex]['schedules'][scheduleIndex] = scheduleError;
      })
    });
    this.setState({ clinicScheduleListError: clinicScheduleListError });
    if (error || errorAtLeastOne) {
      if (errorAtLeastOne) {
        toast.dismiss();
        toast.error(this.state.globalLang.error_please_fill_time_for_at_least_one_clinic);
      } else if (errorTime) {
        toast.dismiss();
        toast.error(this.state.globalLang.error_please_a_valid_time);
      } else {
        //toast.error(this.state.globalLang.error_please_a_valid_time);
      }
      return;
    }
    const providerId = this.state.providerId;
    let formData = {
      id: providerId,
      schedule_date: moment(this.state.selectedPickerDate).format('YYYY-MM-DD'),
      repeat_date: (this.state.selectedRepeatPickerDate) ? moment(this.state.selectedRepeatPickerDate).format('YYYY-MM-DD') : null,
      clinic_schedules: formClinicScheduleList,
      schedule_type: this.state.schedule_type,
    }

    if(this.state.schedule_type == 'weekly') {
      formData.day = this.state.day
    }

    if (providerId) {
      this.setState({ showLoader: true });
      this.handleCreateProviderScheduleModal();
      this.props.createProviderSchedule(formData);
    }
  }

  handleSubmitUpdate = (event) => {
    const name = event.target.name;
    let error = false;
    let selectedEvent = this.state.selectedEvent;
    let selectedEventError = this.state.selectedEventError;

    if (typeof this.state.updateSelectedDate === undefined || this.state.updateSelectedDate === null || this.state.updateSelectedDate === '') {
      selectedEventError.date = 'setting-input-box p-r-40 field_error'
      this.setState({
        selectedEventError: selectedEventError
      })
      error = true;
    } else if (this.state.updateSelectedDate) {
      selectedEventError.date = 'setting-input-box p-r-40'
      this.setState({
        selectedEventError: selectedEventError
      })
    }

    let selectedPickerDate = moment(new Date()).format('YYYY-MM-DD');
    let errorTime = false;
    if (selectedEvent.from_time != "00:00" && selectedEvent.to_time != "00:00") {
      let fromDateTime = moment(selectedPickerDate + ' ' + selectedEvent.from_time_24);
      let toDateTime = moment(selectedPickerDate + ' ' + selectedEvent.to_time_24);
      if (moment(toDateTime).isSame(fromDateTime) || moment(toDateTime).isBefore(fromDateTime)) {
      //if (fromDateTime >= toDateTime) {
        error = true;
        errorTime = true;
        selectedEventError.from_time = 'setting-input-box hours-time from-time-input field_error'
        selectedEventError.from_time_option = 'setting-select-box hours-pm from_time_option field_error'
        selectedEventError.to_time = 'setting-input-box hours-time to-time-input field_error'
        selectedEventError.to_time_option = 'setting-select-box hours-pm to_time_option field_error'
      }
    } else {
      if (selectedEvent.from_time == "00:00") {
        error = true;
        errorTime = true;
        selectedEventError.from_time = 'setting-input-box hours-time from-time-input field_error';
      } else if (selectedEvent.to_time == "00:00") {
        error = true;
        errorTime = true;
        selectedEventError.to_time = 'setting-input-box hours-time to-time-input field_error';
      }
    }
    this.setState({ selectedEventError: selectedEventError });

    if (error) {
      if (errorTime) {
        toast.dismiss();
        toast.error(this.state.globalLang.error_please_a_valid_time);
      } else {
        //toast.error(this.state.globalLang.error_please_a_valid_time);
      }
      return
    }
    const providerId = this.state.providerId;
    let formData = {
      id: providerId,
      schedule_date: apiDateFormat(this.state.updateSelectedDate),
      clinic_schedules: [{
        id: selectedEvent.clinic_id,
        time_schedules: [{
          from_time: selectedEvent.from_time_24,
          to_time: selectedEvent.to_time_24,
        }]
      }],
    }
    if (providerId) {
      this.setState({ showLoader: true });
      this.handleGetProviderScheduleModal();
      this.props.updateProviderSchedule(formData, selectedEvent.id);
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
      case 'month':
        if (navigate == 'next') {
          let newSelectedDate = selectedDate.add(1, 'months').toDate();
          returnState.selectedDate = newSelectedDate;
          returnState.showSelectedDate = showSelectedMonth(newSelectedDate);
          returnState.searchPickerDate = moment(returnState.selectedDate).startOf('month').toDate();
          returnState.isChangeWeek = true;
        } else if (navigate == 'prev') {
          let newSelectedDate = selectedDate.subtract(1, 'months').toDate();
          returnState.selectedDate = newSelectedDate;
          returnState.showSelectedDate = showSelectedMonth(newSelectedDate);
          returnState.searchPickerDate = moment(returnState.selectedDate).startOf('month').toDate();
          returnState.isChangeWeek = true;
        } else {
          returnState.selectedDate = moment().toDate();
          returnState.showSelectedDate = showSelectedMonth();
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
    this.setState(returnState);
    this.getProviderScheduleById(this.state.calendarView, returnState.selectedDate, this.state.selectedClinics);
  }

  handleCalendarView = (nextCalendarView) => {
    let returnState = {};
    returnState.calendarView = nextCalendarView;
    returnState.userChanged = true;
    returnState.selectedDate = this.state.selectedDate;
    if (nextCalendarView == 'week') {
      returnState.showSelectedDate = showSelectedWeek(returnState.selectedDate);
    } else if (nextCalendarView == 'day') {
      returnState.isChangeWeek = false;
      if (this.state.returnState) {
        returnState.selectedDate = moment(returnState.selectedDate).startOf('week').toDate();
      }
      returnState.showSelectedDate = viewDateFormat(returnState.selectedDate);
    } else {
      returnState.showSelectedDate = showSelectedMonth(returnState.selectedDate);
    }
    returnState.searchPickerDate = moment(returnState.selectedDate).toDate();
    this.setState(returnState);
    this.getProviderScheduleById(returnState.calendarView, returnState.selectedDate, this.state.selectedClinics);
  }

  getProviderScheduleById = (calendarView, selectedDate, selectedClinicId) => {
    if (this.state.providerId) {
      let startEndDateWeek = '';
      if (calendarView == 'week') {
        startEndDateWeek = startEndDateOfWeek(selectedDate)
      } else if (calendarView == 'day') {
        startEndDateWeek = { startDate: selectedDate, endDate: selectedDate }
      } else {
        startEndDateWeek = startEndDateOfMonth(selectedDate)
      }
      //let startEndDateWeek = (calendarView == 'week') ? startEndDateOfWeek(selectedDate) :
      let formData = {
        'params': {
          start_date: apiDateFormat(startEndDateWeek.startDate),
          end_date: apiDateFormat(startEndDateWeek.endDate),
        }
      }
      if (selectedClinicId) {
        formData.params['clinic_ids'] = selectedClinicId;
      }
      this.setState({ showLoader: true, isCreateProviderScheduleModal: false, isGetProviderScheduleModal: false });
      this.props.getProviderScheduleById(formData, this.state.providerId);
    }
  }

  handleSearchDatePicker = (date) => {
    this.setState({ searchPickerDate: date });
    this.setState({ showLoader: true });
    let returnState = {};
    returnState.isChangeWeek = false;
    returnState.selectedDate = date;
    returnState.userChanged = true;
    returnState.showSelectedDate = viewDateFormat(returnState.selectedDate);
    returnState.calendarView = 'day';
    this.setState(returnState);
    this.getProviderScheduleById(returnState.calendarView, returnState.selectedDate, this.state.selectedClinicId);
  }



  addMultipleSchedule = (event) => {
    const clinicIndex = event.target.dataset.clinicindex;
    if (clinicIndex) {
      let clinicScheduleList = this.state.clinicScheduleList;
      clinicScheduleList[clinicIndex]['schedules'].push(initSchedule());

      let clinicScheduleListError = this.state.clinicScheduleListError;
      clinicScheduleListError[clinicIndex]['schedules'].push(initScheduleError());

      this.setState({ clinicScheduleList: clinicScheduleList });
    }
  }

  deleteMultipleSchedule = (event) => {
    const clinicIndex = event.target.dataset.clinicindex;
    if (clinicIndex) {
      let clinicScheduleList = this.state.clinicScheduleList;
      let schedules = clinicScheduleList[clinicIndex]['schedules'];
      if (schedules.length == 1) { return false }
      const scheduleIndex = event.target.dataset.scheduleindex;
      schedules.splice(scheduleIndex, 1);
      clinicScheduleList[clinicIndex]['schedules'] = schedules;

      let clinicScheduleListError = this.state.clinicScheduleListError;
      let schedulesError = clinicScheduleListError[clinicIndex]['schedules'];
      schedulesError.splice(scheduleIndex, 1);
      clinicScheduleListError[clinicIndex]['schedules'] = schedulesError;

      this.setState({ clinicScheduleList: clinicScheduleList, clinicScheduleListError: clinicScheduleListError });
    }
  }

  handleShowClinicModal = (event) => {
    event.stopPropagation();
    if(event.target.className != 'line-btn pull-right' && event.target.className != 'provider_clinic_id') {
      this.setState({ isShowClinicModal: !this.state.isShowClinicModal })
    }
  }

  handleCreateProviderScheduleModal = () => {
    this.setState({ isCreateProviderScheduleModal: !this.state.isCreateProviderScheduleModal });
  }

  handleGetProviderScheduleModal = () => {
    this.setState({ isGetProviderScheduleModal: !this.state.isGetProviderScheduleModal });
  }

  handleDatePicker = (date) => {
    let returnState = {};
    returnState.selectedPickerDate = date;
    returnState.showDatePicker = false;
    let dt = moment(date).format('dddd');
    if(this.state.schedule_type == 'weekly') {
      returnState.day = dt;
    }
    this.setState(returnState);
    this.refDatePicker.setOpen(false);
  }

  resetDatePicker = () => {
    this.setState({ selectedPickerDate: null, 'showDatePicker': true });
    this.toggleDatePicker();
  }

  blurDatePicker = (date) => {
    this.refDatePicker.setOpen(true);
    this.setState({ 'showDatePicker': true });
  }

  focusDatePicker = (date) => {
    this.setState({ 'showDatePicker': true });
  }

  toggleDatePicker = () => {
    this.setState({ 'showDatePicker': true });
    this.refDatePicker.setFocus(true);
    this.refDatePicker.setOpen(true);
  }

  handleRepeatDatePicker = (date) => {
    this.setState({ selectedRepeatPickerDate: date });
  }

  resetRepeatDatePicker = () => {
    this.setState({ selectedRepeatPickerDate: null });
    this.toggleRepeatDatePicker();
  }

  blurRepeatDatePicker = (date) => {
    this.refRepeatDatePicker.setOpen(true);
  }

  focusRepeatDatePicker = (date) => {
    this.setState({ 'showDatePicker': true });
  }

  toggleRepeatDatePicker = () => {
    this.setState({ 'showDatePicker': true });
    this.refRepeatDatePicker.setFocus(true);
    this.refRepeatDatePicker.setOpen(true);
  }

  handleUpdateDatePicker = (date) => {
    this.setState({ selectedPickerDate: date, showDatePicker: false, updateSelectedDate: date });
    this.refUpdateDatePicker.setOpen(false);
  }

  resetUpdateDatePicker = () => {
    this.setState({ selectedPickerDate: null, 'showDatePicker': true });
    this.toggleUpdateDatePicker();
  }

  blurUpdateDatePicker = (date) => {
    this.refUpdateDatePicker.setOpen(true);
    this.setState({ 'showDatePicker': true });
  }

  focusUpdateDatePicker = (date) => {
    this.setState({ 'showDatePicker': true });
  }

  toggleUpdateDatePicker = () => {
    this.setState({ 'showDatePicker': true });
    this.refUpdateDatePicker.setFocus(true);
    this.refUpdateDatePicker.setOpen(true);
  }

  handleDeleteModal = () => {
    this.setState({ isShowDeleteModal: !this.state.isShowDeleteModal })
  }


  deleteProviderSchedule = () => {
    if (this.state.selectedEvent.id) {
      this.setState({ showLoader: true, hideBtns: true, isShowDeleteModal: false, isGetProviderScheduleModal: false })
      let formData = {};
      formData.schedule_id = this.state.selectedEvent.id;
      formData.provider_id = this.state.providerId;
      this.props.deleteProviderSchedule(formData);
    }
  }

  /*maskChange = (newState, oldState, userInput) => {
    var { value } = newState;
    var selection = newState.selection;
    var cursorPosition = selection ? selection.start : null;
    var { value } = newState;
    var selection = newState.selection;
    var cursorPosition = selection ? selection.start : null;
    console.log(value +"==maskChange");
    if (value.endsWith(':') && userInput !== ':') {
      if (cursorPosition === value.length) {
        cursorPosition--;
        selection = { start: cursorPosition, end: cursorPosition };
      }
      value = value.slice(0, -1);
    }
    if (cursorPosition == 2) {
      if (value > 12) {
        value = 12;
      }
    }
    var tmpArr = value.split(':');
    // handle hourse
    if (parseInt(tmpArr[0]) > 12) {
      if(cursorPosition == 1){
        tmpArr[0] = '0'+tmpArr[0].substring(0, 1)
      } else {
        tmpArr[0] = '0'+ +tmpArr[0].substring(1)
      }
      selection = { start: 3, end: 3 };
    }
    // handle minutes
    if (parseInt(tmpArr[1]) >= 60) {
      if(cursorPosition == 4){
        tmpArr[1] = '0'+tmpArr[1].substring(0, 1)
        selection = { start: 5, end: 5 };
      }
    }


    if(tmpArr[0] == undefined || tmpArr[0] == null) {
      tmpArr[0] = '00';
    }
    if(tmpArr[1] == undefined || tmpArr[1] == null) {
      tmpArr[1] = '00';
    }
    if(value.length < 5){
      value = value.padEnd(5,'0')
    }
    value = tmpArr.join(':');
    if(value.length < 5){
      value = value.padEnd(5,'0')
    }
    console.log(value, "returned");
    return {
      value,
      selection
    };
  }*/

  maskChange = (newState, oldState, userInput) => {
     var { value } = newState;
     var selection = newState.selection;
     var cursorPosition = selection ? selection.start : null;
     return handleScheduleMasking(value,selection,cursorPosition,userInput);
   }

  handleErrorModal = () => {
    this.setState({errorMessageModal : false})
  }

  toggleAllClinics = (event) => {
    //event.stopPropagation()
    let allClinics = this.state.associatedClinics;
    let returnState = {}

    let x = (event.target.dataset.checkmode == "true") ? false : true;
    let selectedClinics = []
    returnState.checkMode = x;
    allClinics.map((obj, idx) => {
      returnState["provider_clinic_id-"+obj.id] = x;
      selectedClinics.push(obj.id)
    })
    returnState.selectedClinics = (x) ? selectedClinics : [];
    returnState.isShowClinicModal = true;
    this.setState(returnState)
  }

  applyFilter = () => {
      this.getProviderScheduleById(this.state.calendarView, this.state.selectedDate, this.state.selectedClinics);
  }

  renderAssociateClinic = () => {
    let associatedClinics = this.state.associatedClinics;
    let label = 'Select All';

    if(this.state.associatedClinics.length == this.state.selectedClinics.length && this.state.selectedClinics.length > 0) {
      label = 'Unselect All'
    }
    return (
      <div class={(this.state.isShowClinicModal) ? "filter-wid-apply-btn" : "filter-wid-apply-btn no-display"}>
        <div className="cal-filter-outer">
          <a className={(!this.state.isShowClinicModal) ? "line-btn pull-right no-display" : "line-btn pull-right apply"} onClick={this.applyFilter} disabled={this.state.associatedClinics.length}>{this.state.appointmentLang.appointment_apply}</a>
          <a className={(!this.state.isShowClinicModal) ? "line-btn pull-right no-display" : "line-btn pull-right"} data-checkmode={this.state.checkMode} onClick={this.toggleAllClinics} disabled={this.state.associatedClinics.length}>{label}</a>
        </div>
        <ul className={this.state.isShowClinicModal ? "cal-dropdown" : "cal-dropdown no-display"}>
          {
            this.state.associatedClinics.map((obj, idx) => {
              return (
                <li key={'associateClinic-' + idx}>
                  <a href="javascript:void(0);">
                    <label className="checkbox">
                      <input type="checkbox" className="provider_clinic_id" name={"provider_clinic_id-"+obj.id} data-clinicid={obj.id}  checked={(this.state['provider_clinic_id-'+obj.id]) ? "checked" : false} onChange={this.handleInputChange} /> {obj.clinic_name}
                      <span style={{ backgroundColor: obj.color }} />
                    </label>
                  </a>
                </li>
              )
            })
          }
        </ul>
      </div>
    )
  }

  openDeleteSchedule = () => {
    this.props.openDeleteSchedule(this.state.providerId);
  }

  render() {
    document.body.style.overflow = 'hidden !important';
    let associatedClinics = this.state.associatedClinics;
    let buttonLabel = '';
    if(this.state.selectedClinics.length) {
      buttonLabel = (this.state.selectedClinics.length == 1) ? "(1) Clinic" : "("+this.state.selectedClinics.length+') Clinics';
    } else {
      buttonLabel = 'All Clinics';
    }

    if(this.state.associatedClinics.length == this.state.selectedClinics.length && this.state.selectedClinics.length > 0) {
      buttonLabel = 'All Clinics'
    }
    return (
      <div>
        <div className="row">
            <div className="col-lg-2 col-md-5 col-sm-6 cal-month-week-day-outer provider-m-d-w">
              <button className={(this.state.calendarView == 'month') ? 'calendar-btn btn-week selected' : 'calendar-btn btn-week'} onClick={this.handleCalendarView.bind(this, 'month')}>Month</button>
              <button className={(this.state.calendarView == 'week') ? 'calendar-btn btn-week selected' : 'calendar-btn btn-week'} onClick={this.handleCalendarView.bind(this, 'week')}>{this.state.globalLang.label_week}</button>
              <button className={(this.state.calendarView == 'day') ? 'calendar-btn btn-day selected' : 'calendar-btn btn-day'} onClick={this.handleCalendarView.bind(this, 'day')}>{this.state.globalLang.label_day}</button>
            </div>
            <div className="col-lg-4 col-md-3 col-sm-6 cal-date-btn-outer">
              <button className="calendar-btn today-btn" onClick={this.handleNextPrevDate.bind(this, 'today')}>{this.state.globalLang.label_today}</button>
              <button className="calendar-btn cal-date-btn">
                <a className="cal-arrow pull-left" onClick={this.handleNextPrevDate.bind(this, 'prev')}><img src="/images/cal-left.svg" /></a>
                {this.state.showSelectedDate}
                <a className="cal-arrow pull-right" onClick={this.handleNextPrevDate.bind(this, 'next')}><img src="/images/cal-right.svg" /></a>
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
            <div className="col-lg-5 col-md-4 col-sm-12 cal-filter provider-cal-filter">

              <button onClick={this.handleShowClinicModal} className={this.state.isShowClinicModal ? "calendar-dropdown provider-clinic-filter show" : "calendar-dropdown provider-clinic-filter "} ref={(refAssociateClinicContainer) => this.refAssociateClinicContainer = refAssociateClinicContainer}>{buttonLabel}
                <a href="javascript:void(0);" className="cal-arrow pull-right">
                  <img src={this.state.isShowClinicModal ? "/images/cal-up.png" : "/images/cal-down.png"} />
                </a>
                {(this.state.associatedClinics.length > 0) ?
                  this.renderAssociateClinic()
                  :
                  <ul className={this.state.isShowClinicModal ? "cal-dropdown" : "cal-dropdown no-display"}>
                    <li>
                      <a href="javascript:void(0);">
                        <label className="checkbox">
                          <input type="checkbox" defaultValue={9751} /> {this.state.appointmentLang.appointment_all_clinics}
                          <span style={{ backgroundColor: '#750808' }} />
                        </label>
                      </a>
                    </li>
                  </ul>
                }
              </button>
              <a className="new-blue-btn pull-right m-r-10" onClick={this.onSelectSlotBtn}>Add Schedule</a>
              <a className="new-blue-btn pull-right " onClick={this.openDeleteSchedule} >Delete Schedule</a>
            </div>
          </div>
          <div className="calendar-provider-schedule juvly-section full-width m-t-10" id="juvly-section">
            <BigCalendar
              selectable={'ignoreEvents'}
              //events={this.state.events}
              localizer={localizer}
              views={['week', 'day', 'month']}
              events={this.state.events}
              onEventDrop={this.moveEvent}
              defaultView={'month'}
              view={this.state.calendarView}
              defaultDate={new Date(2019, 0, 29)}

              showMultiDayTimes
              toolbar={false}
              onSelectSlot={this.onSelectSlot}
              onSelectEvent={this.onSelectEvent}
              date={this.state.selectedDate}
              onNavigate={this.onNavigate}
              onView={this.onView}
            />
          </div>

          {/* Create Provider Schedule Modal - START */}
          <div className={(this.state.isCreateProviderScheduleModal) ? 'modalOverlay' : 'no-display'}>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.appointmentLang.appointment_create_provider_schedule}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handleCreateProviderScheduleModal}>×</a>
              </div>
              <div className="small-popup-content provider-schedule-popup-height">
                <div className="juvly-container no-padding-bottom" style={(this.state.showDatePicker) ? { 'minHeight': 345 } : {}}>
                  <div className="row">
                    <div className="col-xs-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">Select Schedule Type <span className="required">*</span></div>
                          <div className="setting-input-outer" ref={(refDatePickerContainer) => this.refDatePickerContainer = refDatePickerContainer}>
                            <select name="schedule_type" value={this.state.schedule_type}
                              className="setting-select-box"
                              onChange={this.handleInputChange}>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className={(this.state.schedule_type == 'weekly') ? "col-xs-6" : "col-xs-6 no-display"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">Select Day <span className="required">*</span></div>
                          <div className="setting-input-outer" >
                            <select name="day" value={this.state.day}
                              className="setting-select-box"
                              onChange={this.handleInputChange}>
                              <option value="Sunday">Sunday</option>
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  <div className="row">
                    <div className="col-xs-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{(this.state.schedule_type == 'daily') ? this.state.globalLang.label_date : "Start Date"} <span className="required">*</span></div>
                        <div className="setting-input-outer" ref={(refDatePickerContainer) => this.refDatePickerContainer = refDatePickerContainer}>
                          <a href="javascript:void(0);" className="client-treat-cal" onClick={this.toggleDatePicker}>
                            <i className="fas fa-calendar-alt" />
                          </a>
                          <a href="javascript:void(0);" className="client-treat-reset" onClick={this.resetDatePicker}>
                            <i className="fas fa-times" />
                          </a>
                          <DatePicker
                            selected={(this.state.selectedPickerDate) ? this.state.selectedPickerDate : null}
                            onChange={this.handleDatePicker}
                            ocol-lg-6 col-md-4 col-sm-12 cal-filter provider-cal-filternBlur={this.blurDatePicker}
                            onFocus={this.focusDatePicker}
                            minDate={new Date()}
                            maxDate={new Date(moment().add(5, "years").toDate())}
                            autoComplete="off"
                            className={this.state.selectedPickerDateClass}
                            dateFormat={dateFormatPicker}
                            ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                            name='selectedPickerDate'
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            value={(this.state.selectedPickerDate) ? showFormattedDate(moment(this.state.selectedPickerDate).format('YYYY-MM-DD'), false) : null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.appointmentLang.appointment_repeat_this_till}  <span className={(this.state.schedule_type == 'weekly') ? "required" : "required no-display"}>*</span></div>
                        <div className="setting-input-outer" ref={(refRepeatDatePickerContainer) => this.refRepeatDatePickerContainer = refRepeatDatePickerContainer}>
                          <a href="javascript:void(0);" className="client-treat-cal" onClick={this.toggleRepeatDatePicker}>
                            <i className="fas fa-calendar-alt" />
                          </a>
                          <a href="javascript:void(0);" className="client-treat-reset" onClick={this.resetRepeatDatePicker}>
                            <i className="fas fa-times" onClick={this.resetRepeatDatePicker} />
                          </a>
                          <DatePicker
                            selected={(this.state.selectedRepeatPickerDate) ? this.state.selectedRepeatPickerDate : null}
                            onChange={this.handleRepeatDatePicker}
                            onBlur={this.blurRepeatDatePicker}
                            onFocus={this.focusRepeatDatePicker}
                            className={this.state.selectedRepeatPickerDateClass}
                            dateFormat={dateFormatPicker}
                            minDate={this.state.selectedPickerDate}
                            maxDate={new Date(moment().add(5, "years").toDate())}
                            name='selectedRepeatPickerDate'
                            autoComplete="off"
                            ref={(refRepeatDatePicker) => this.refRepeatDatePicker = refRepeatDatePicker}
                            value={(this.state.selectedRepeatPickerDate) ? showFormattedDate(moment(this.state.selectedRepeatPickerDate).format('YYYY-MM-DD'), false) : null}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="business-hours-outer m-t-20">
                    <div className="row">
                      <div className="col-xs-4">&nbsp;</div>
                      <div className="col-xs-4"><div className="new-field-label">{this.state.appointmentLang.appointment_open_hours}</div></div>
                      <div className="col-xs-4"><div className="new-field-label">{this.state.appointmentLang.appointment_close_hours}</div></div>
                    </div>
                    {this.state.clinicScheduleList &&
                      this.state.clinicScheduleList.map((clinicObj, clinicIdx) => {
                        return (
                          clinicObj.schedules.map((scheduleObj, scheduleIdx) => {
                            const schedulesError = (this.state.clinicScheduleListError[clinicIdx] != undefined && this.state.clinicScheduleListError[clinicIdx]['schedules'] != undefined) ? this.state.clinicScheduleListError[clinicIdx]['schedules'][scheduleIdx] : initScheduleError();
                            return (
                              <div className="row datetimeparent" key={'schedules-' + clinicIdx + "-" + scheduleIdx}>
                                {(scheduleIdx == 0) ?
                                  <div className="col-xs-4">
                                    <label className="setting-week" htmlFor="Tuesday">{clinicObj.name}</label>
                                  </div>
                                  :
                                  <div className="col-xs-4">
                                    &nbsp;
                                    </div>
                                }
                                <div className="fromandtoTime">
                                  <div className="col-xs-4">
                                    <InputMask name="from_time" value={scheduleObj.from_time}
                                      className={schedulesError.from_time}
                                      onChange={this.handleInputChange}
                                      data-clinicindex={clinicIdx}
                                      data-scheduleindex={scheduleIdx}
                                      placeholder="00:00"
                                      autoComplete="off"
                                      mask="99:99"
                                      maskChar=""
                                      beforeMaskedValueChange={this.maskChange} />
                                    <select name="from_time_option" value={scheduleObj.from_time_option}
                                      className={schedulesError.from_time_option}
                                      onChange={this.handleInputChange}
                                      data-clinicindex={clinicIdx}
                                      data-scheduleindex={scheduleIdx} >
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                    </select>
                                  </div>
                                  <div className="col-xs-4">
                                    <InputMask name="to_time" value={scheduleObj.to_time}
                                      className={schedulesError.to_time}
                                      onChange={this.handleInputChange}
                                      data-clinicindex={clinicIdx}
                                      data-scheduleindex={scheduleIdx}
                                      placeholder="00:00"
                                      autoComplete="off"
                                      mask="99:99"
                                      maskChar=""
                                      beforeMaskedValueChange={this.maskChange} />
                                    <select name="to_time_option" value={scheduleObj.to_time_option}
                                      className={schedulesError.to_time_option}
                                      onChange={this.handleInputChange}
                                      data-clinicindex={clinicIdx}
                                      data-scheduleindex={scheduleIdx} >
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                    </select>
                                  </div>
                                  {(scheduleIdx === 0) ?
                                    <a href="javascript:void(0);" className="add-round-btn" data-clinicindex={clinicIdx} data-scheduleindex={scheduleIdx}
                                      onClick={this.addMultipleSchedule}>
                                      <span data-clinicindex={clinicIdx} data-scheduleindex={scheduleIdx}>+</span></a>
                                    :
                                    <a href="javascript:void(0);" className="add-round-btn" data-clinicindex={clinicIdx} data-scheduleindex={scheduleIdx}
                                      onClick={this.deleteMultipleSchedule}>
                                      <span data-clinicindex={clinicIdx} data-scheduleindex={scheduleIdx}>-</span></a>
                                  }
                                </div>
                              </div>
                            )
                          })
                        )
                      })
                    }
                  </div>
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-blue-btn pull-right" name='btn_create_schedule' onClick={this.handleSubmitCreate}>{this.state.globalLang.label_save}</a>
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handleCreateProviderScheduleModal}>{this.state.globalLang.label_cancel}</a>
              </div>
            </div>
          </div>
          {/* Create Provider Schedule Modal - END */}
          {/* Get Provider Schedule Modal - START */}
          <div className={(this.state.isGetProviderScheduleModal) ? 'modalOverlay' : 'no-display'}>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.appointmentLang.appointment_schedule_details}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handleGetProviderScheduleModal}>×</a>
              </div>
              <div className="small-popup-content editSchedulePop">
                <div className="juvly-container no-padding-bottom" style={(this.state.showDatePicker) ? { 'minHeight': 30 } : {}}>
                  <div className="row">

                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.globalLang.label_date}</div>
                        <div className="setting-input-outer" ref={(refUpdateDatePickerContainer) => this.refUpdateDatePickerContainer = refUpdateDatePickerContainer}>
                          <a href="javascript:void(0);" className={this.state.selectedEvent.isPassedDateForDelete ? "client-treat-cal no-display" : "client-treat-cal"} onClick={this.toggleUpdateDatePicker}>
                            <i className="fas fa-calendar-alt" />
                          </a>
                          <a href="javascript:void(0);" className={this.state.selectedEvent.isPassedDateForDelete ? "client-treat-reset no-display" : "client-treat-reset"} onClick={this.resetUpdateDatePicker}>
                            <i className="fas fa-times" />
                          </a>
                          <DatePicker
                            selected={(this.state.updateSelectedDate) ? this.state.updateSelectedDate : null}
                            onChange={this.handleUpdateDatePicker}
                            onBlur={this.blurUpdateDatePicker}
                            onFocus={this.focusUpdateDatePicker}
                            className={this.state.selectedEventError.date}
                            data-updateschedule={this.state.selectedEvent.id}
                            dateFormat={dateFormatPicker}
                            minDate={new Date()}
                            //showDisabledMonthNavigation
                            name='updateSelectedDate'
                            autoComplete="off"
                            disabled={this.state.selectedEvent.isPassedDateForDelete ? true : false}
                            ref={(refUpdateDatePicker) => this.refUpdateDatePicker = refUpdateDatePicker}
                            //value={(this.state.selectedEvent.date) ? showFormattedDate(moment(this.state.selectedEvent.date).format('YYYY-MM-DD'), false) : null}

                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.globalLang.label_clinic}</div>
                        <div className="setting-input-outer">
                          <div className="setting-input-box">{this.state.selectedEvent.clinic_name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.globalLang.label_open}</div>
                        <div className="setting-input-outer row">
                          <div className="col-xs-6">
                            <InputMask name="from_time" value={this.state.selectedEvent.from_time}
                              className={this.state.selectedEventError.from_time}
                              data-updateschedule={this.state.selectedEvent.id}
                              onChange={this.handleInputChange}
                              placeholder="00:00"
                              autoComplete="off"
                              mask="99:99"
                              maskChar=""
                              beforeMaskedValueChange={this.maskChange}
                              disabled={this.state.selectedEvent.isPassedDateForDelete ? true : false}
                            />
                          </div>
                          <div className="col-xs-6">
                            <select name="from_time_option" value={this.state.selectedEvent.from_time_option}
                              className={this.state.selectedEventError.from_time_option}
                              data-updateschedule={this.state.selectedEvent.id}
                              onChange={this.handleInputChange}
                              disabled={this.state.selectedEvent.isPassedDateForDelete ? true : false}
                            >
                              <option>AM</option><option>PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.globalLang.label_closed}</div>
                        <div className="setting-input-outer row">
                          <div className="col-xs-6">
                            <InputMask name="to_time" value={this.state.selectedEvent.to_time}
                              className={this.state.selectedEventError.to_time}
                              data-updateschedule={this.state.selectedEvent.id}
                              onChange={this.handleInputChange}
                              placeholder="00:00"
                              autoComplete="off"
                              mask="99:99"
                              maskChar=""
                              beforeMaskedValueChange={this.maskChange}
                              disabled={this.state.selectedEvent.isPassedDateForDelete ? true : false}
                            />
                          </div>
                          <div className="col-xs-6">
                            <select name="to_time_option" value={this.state.selectedEvent.to_time_option}
                              className={this.state.selectedEventError.to_time_option}
                              data-updateschedule={this.state.selectedEvent.id}
                              onChange={this.handleInputChange}
                              disabled={this.state.selectedEvent.isPassedDateForDelete ? true : false}
                            >
                              <option>AM</option><option>PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-static">
                {(!this.state.selectedEvent.isPassedDateForDeleteForDelete) ?
                  <div>
                    <a href="javascript:void(0);" className="new-blue-btn pull-right" name='btn_update_schedule' onClick={this.handleSubmitUpdate}>{this.state.globalLang.label_save}</a>
                    <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.handleDeleteModal}>{this.state.globalLang.label_delete}</a>
                  </div>
                  :
                  null
                }

              </div>
            </div>
          </div>
          {/* Get Provider Schedule Modal - END */}
          {/* Delete Provider Schedule Confirmation Modal - START */}
          <div className={(this.state.isShowDeleteModal) ? 'overlay' : ''} ></div>
          <div id="filterModal" role="dialog" className={(this.state.isShowDeleteModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.handleDeleteModal}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.globalLang.delete_confirmation}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.appointmentLang.provider_schedule_delete_msg}</div>
                <div className="modal-footer">
                  <div className="col-md-12 text-left" id="footer-btn">
                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.handleDeleteModal}>{this.state.globalLang.label_no}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteProviderSchedule}>{this.state.globalLang.label_yes}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Delete Provider Schedule Confirmation Modal - END */}

          <div className={(this.state.errorMessageModal) ? 'overlay' : ''} ></div>
          <div id="filterModal" role="dialog" className={(this.state.errorMessageModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.handleErrorModal}>×</button>
                  <h4 className="modal-title" id="model_title">Time Conflict</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                    <p className="p-text conflict-date">{this.state.errorText}:</p>
                    <p className="p-text">
                    {this.state.errorDates && this.state.errorDates.length > 0 && this.state.errorDates.map((obj, idx) => {
                      return(
                        <React.Fragment key={"asd-"+idx}><span>{showFormattedDate(obj, false)}</span> <br /></React.Fragment>
                        )
                    })}
                    </p>
                </div>
                <div className="modal-footer conflict-date-footer">
                  <div className="col-md-12 text-left" id="footer-btn">
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.handleErrorModal}>{"Ok"}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock full-fixed-loader' : 'new-loader text-left full-fixed-loader'}>
          <div className="loader-outer">
            <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
            <div id="modal-confirm-text" className="popup-subtitle" >{this.state.appointmentLang.appointment_processing_please_wait}</div>
          </div>
        </div>
        <ReactTooltip effect="float" multiline={true} place="right" />
      </div>
    );
  }
}

function mapStateToProps(state) {
  toast.dismiss();
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.AppointmentReducer.action === "PROVIDER_SCHEDULE_DATA") {
    if (state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.providerScheduleData = state.AppointmentReducer.data.data;
    }
  } else if (state.AppointmentReducer.action === "CREATE_PROVIDER_SCHEDULE") {
    if (state.AppointmentReducer.data.status == 201) {
      returnState.reload = true;
      returnState.createdTimestamp = new Date();
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
      toast.success(languageData.global[state.AppointmentReducer.data.message])
    } else {
      toast.dismiss();
      if(!state.AppointmentReducer.data.data) {
        toast.error(languageData.global[state.AppointmentReducer.data.message]);
      }
      returnState.errorDates = (state.AppointmentReducer.data.data) ? state.AppointmentReducer.data.data : false;
      returnState.showLoader = false
      returnState.errorText = languageData.global[state.AppointmentReducer.data.message];
    }
  } else if (state.AppointmentReducer.action === 'UPDATE_PROVIDER_SCHEDULE') {
    if (state.AppointmentReducer.data.status == 200) {
      returnState.reload = true;
      returnState.createdTimestamp = new Date();
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
      toast.success(languageData.global[state.AppointmentReducer.data.message])
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      toast.dismiss();
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'DELETE_PROVIDER_SCHEDULE') {
    if (state.AppointmentReducer.data.status == 200) {
      returnState.reload = true;
      returnState.createdTimestamp = new Date();
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
      toast.success(languageData.global[state.AppointmentReducer.data.message])
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  }
  else if (state.CommonReducer.action === "GET_TRACK_HEAP_EVENT") {
    if(state.CommonReducer.data.status != 201){
       returnState.message = languageData.global[state.CommonReducer.data.message];
     }
    }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getProviderScheduleById: getProviderScheduleById,
    createProviderSchedule: createProviderSchedule,
    updateProviderSchedule: updateProviderSchedule,
    deleteProviderSchedule: deleteProviderSchedule,
    geCommonTrackEvent: geCommonTrackEvent
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(ProviderScheduleView));
