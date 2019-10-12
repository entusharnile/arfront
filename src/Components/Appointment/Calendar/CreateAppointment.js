import React, { Component } from "react";
import { bindActionCreators } from "redux";
import DatePicker from "react-datepicker";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import validator from 'validator';
import { searchPatientByName, getClinics, getProviders, getServices, getProviderAvailability, getProviderTime, saveAppointment, getAppointment, exportEmptyData, checkePosEnabled, getCardDetails, sendNotification, getAppointmentFees, getClientData} from '../../../Actions/Appointment/appointmentAction.js';
import { geCommonTrackEvent } from '../../../Actions/Common/commonAction.js';
import IntlTelInput from 'react-intl-tel-input';
import moment from 'moment';
import config from '../../../config';
import { convertTime12to24, convertTime24to12, getAmPm, displayName, showFormattedDate, numberFormat } from '../../../Utils/services.js';
const viewDateFormat = (date) => {
  return moment(date).format('MMMM DD, YYYY');
}

var cardNumber  = '';
var cardExpiry  = '';
var cardCvc     = '';
var stripeToken = '';

const onlyUnique = (value, index, self) => {
    return self.indexOf(value) === index;
}

const isEmpty = (obj) => {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

class CreateAppointment extends Component {
  constructor(props) {
    super(props);
    const languageData  = JSON.parse(localStorage.getItem('languageData'));

    this.state = {
      clients : [],
      services: [],
      "services-0": [],
      packages: [],
      providers: [],
      clinics: [],
      showClients : false,
      defaultCountry: localStorage.getItem('cCode'),
      contactClass: 'setting-input-box',
      clientEmail : '',
      appointmentType : 1,
      serviceArr: [0],
      selectedClinicName : '',
      serviceArrNames: [],
      selectedClient: {},
      providerAvailability: [],
      showSelectedDate : '',
      searchPickerDate: '',
      includeDates:[],
      providerTime: [],
      showLoader: false,
      editServiceError: false,
      actualTime: '',
      client: '',
      isPosEnabled: false,
      showCCForm: false,
      showNotifyPop: false,
      card_data: '',
      cardNumber: '',
      cardDetails: {},
      allow_double : 0,
      editService : 0,
      appointmentNotificationData: [],
      notification_type : 'emailAndSms',
      appointmentLang : languageData.appointments,
      globalLang : languageData.global,
      userChanged: false,
      patientNameError: false,
      patientEmailError: false,
      providerError: false,
      clinicError: false,
      dateError: false,
      timeError: false,
      showModal: false,
      mode: 'Create',
      rescheduledTime: '',
      notes: "",
      reInit: true
    };

  }
  handleClick = (e) =>  {
    if (this.refDatePickerContainer && !this.refDatePickerContainer.contains(e.target)) {
      this.refDatePicker.setOpen(false);
      this.setState({showDatePicker:false})
    }
    if (this.refAutoSuggestionClients && !this.refAutoSuggestionClients.contains(e.target)) {
      this.setState({showClients:false})
    }
  }
  componentDidUpdate(props, state) {
    if(state.selectedClinic != this.state.selectedClinic) {
      //localStorage.setItem("showLoader", true);
      if(this.state.selectedClinic) {
        this.props.checkePosEnabled(this.state.selectedClinic)
      }
    }

    /*if(state.stripe != this.state.stripe) {
        var elements = this.state.stripe.elements();

        cardNumber  = elements.create('cardNumber');
        cardNumber.mount('#card-number');

        cardExpiry  = elements.create('cardExpiry');
        cardExpiry.mount('#card-expiry');

        cardCvc     = elements.create('cardCvc');
        cardCvc.mount('#card-cvc');
    }*/
  }
  componentDidMount() {
    let returnState = {};
    const valTrack = "Appointment Reminder Setup";
    this.props.geCommonTrackEvent(valTrack);
    if ( window.Stripe ) {
      this.setState({stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY)});
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY)});
      });
    }
    localStorage.setItem("showLoader", true);
    returnState.showLoader = true;
    this.props.getClinics();
    if(this.props.match.params.id) {
      returnState.showLoader = true;
      if(this.props.match.params.mode != undefined && this.props.match.params.mode == 'reschedule') {
        returnState.mode = 'Reschedule';
        returnState.rescheduledTime = localStorage.getItem('rescheduledTime');
      } else {
        returnState.mode = 'Edit';
      }

      returnState.editAppointmentId = this.props.match.params.id
      this.props.getAppointment(this.props.match.params.id, 'edit');
    }

    if(this.props.match.params.clientId) {
      returnState.clientId = this.props.match.params.clientId;
      this.props.getClientData(this.props.match.params.clientId)
    }
    this.setState(returnState);
    document.addEventListener('click', this.handleClick, false);
    const datePicker1 = document.getElementsByClassName("react-datepicker__input-container")[0];
    datePicker1.childNodes[0].setAttribute("readOnly", true);
  }

  handleDatePicker = (date) => {
    this.setState({selectedPickerDate: date, showDatePicker:false});
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

  handleSearchDatePicker = (date) => {
    let returnState = {},
    serviceArr = [];
    returnState.showLoader = true;
    returnState.searchPickerDate = date;
    returnState.selectedDate = date;
    let formData = {}
    localStorage.setItem("showLoader", true);
    formData.date = moment(date).format('YYYY-MM-DD')
    formData.clinic_id = this.state.selectedClinic;
    if(this.state.appointmentType == 1) {
       serviceArr = this.getAllServiceIds();
    } else {
      let selectedPackage = this.state.packages.find(y => y.id == this.state.selectedPackage);
      if(selectedPackage.service_packages.length > 0) {
        selectedPackage.service_packages.map((obj, idx)=> {
          serviceArr.push(obj.service_id);
        })
      }
    }
    formData.appointment_service = serviceArr
    formData.provider_id = this.state.provider;
    formData.appointment_id = (this.state.editAppointmentId)? this.state.editAppointmentId : 0;
    formData.double_booking = "false";
    returnState.showLoader = true;
    this.setState(returnState)
    this.props.getProviderTime(formData);
  }

  componentWillUnmount() {
    this.props.exportEmptyData({});
  }
  getDoubleBookingData = (val) => {
    let returnState = {},
    serviceArr = [];
    returnState.searchPickerDate = this.state.searchPickerDate;
    returnState.selectedDate = this.state.searchPickerDate;
    let formData = {}
    localStorage.setItem("showLoader", true);
    formData.date = moment(this.state.searchPickerDate).format('YYYY-MM-DD')
    formData.clinic_id = this.state.selectedClinic;
    if(this.state.appointmentType == 1) {
       serviceArr = this.getAllServiceIds();
    } else {
      let selectedPackage = this.state.packages.find(y => y.id == this.state.selectedPackage);
      if(selectedPackage.service_packages.length > 0) {
        selectedPackage.service_packages.map((obj, idx)=> {
          serviceArr.push(obj.service_id);
        })
      }
    }
    formData.appointment_service = serviceArr
    if(this.state.selectedClientId) {
      formData.patient_id = this.state.selectedClientId
    }
    formData.provider_id = this.state.provider;
    formData.appointment_id = (this.state.editAppointmentId)? this.state.editAppointmentId : 0;
    formData.double_booking = (val) ? "true" : "false";
    returnState.showLoader = true;
    this.setState(returnState)
    this.props.getProviderTime(formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
      }
    }

    if (nextProps.clinics != undefined && nextProps.clinics !== prevState.clinics) {
      if(localStorage.getItem("showLoader") == "false") {

        if (prevState.stripe) {
          var elements = prevState.stripe.elements();

          cardNumber  = elements.create('cardNumber');
          cardNumber.mount('#card-number');

          cardExpiry  = elements.create('cardExpiry');
          cardExpiry.mount('#card-expiry');

          cardCvc     = elements.create('cardCvc');
          cardCvc.mount('#card-cvc');
        }
        returnState.clinics = nextProps.clinics;
        if(!prevState.editAppointmentId) {
          returnState.showLoader = false;
        }
      }
    }

    if (nextProps.redirect != undefined && nextProps.redirect !== prevState.redirect) {
      if(localStorage.getItem("showLoader") == "false") {
        nextProps.history.push(`/appointment/index`);
      }
    }



    if (nextProps.appointmentFees != undefined && nextProps.appointmentFees !== prevState.appointmentFees) {
      if(localStorage.getItem("showLoader") == "false") {
        if(nextProps.appointmentFees.cancellation_fee){
          returnState.cancellation_fee = nextProps.appointmentFees.cancellation_fee;
          returnState.showLoader = false;
          returnState.showModal = true;
          returnState.appointmentFees = prevState.appointmentFees;
          localStorage.setItem('showLoader' , true)
        } else {
          nextProps.saveAppointment(prevState.formData);
        }
      }
    }
    if (nextProps.selectedClientData != undefined && nextProps.selectedClientData !== prevState.selectedClientData) {
      if(localStorage.getItem("showLoader") == "false") {
        let client = nextProps.selectedClientData;
        returnState.selectedClientData = client;
        returnState.clientEmail = (client.email) ? client.email : "";
        returnState.selectedClientId = client.id;
        returnState.selectedClient = client;
        returnState.phone = client.phoneNumber;
        returnState.showClients = false;
        returnState.contactError = false;
        returnState.card_data = false;
        returnState.cardNumber = "";
        returnState.client = displayName(client);
      }
    }

    if (nextProps.notificationSent != undefined && nextProps.notificationSent == true && nextProps.notificationSentTimestamp != prevState.notificationSentTimestamp) {
      if(localStorage.getItem("showLoader") == "false") {
        let msg = '';
        if(prevState.mode == 'Reschedule') {
          msg = prevState.globalLang["appointment_rescheduled_success"];
        } else {
          msg = nextProps.message
        }
        localStorage.setItem("showLoader", true);
        if(nextProps.notificationSentData == true || nextProps.notificationSentData == "true") {
            toast.success(msg)
            returnState.showLoader = false;
            returnState.notificationSentTimestamp = nextProps.notificationSentTimestamp;
            returnState.showNotifyPop = false;
            nextProps.history.push(`/appointment/index`);
            return returnState;
        } else {
            toast.error(msg )
            returnState.showLoader = false;
            returnState.notificationSentTimestamp = nextProps.notificationSentTimestamp;
            returnState.showNotifyPop = false;
            nextProps.history.push(`/appointment/index`);
            return returnState;
        }

      }
    }
    if (nextProps.appointmentNotificationData != undefined && nextProps.appointmentNotificationData !== prevState.appointmentNotificationData) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.showNotifyPop = true;
        returnState.appointment_email_text = (prevState.userChanged && prevState.appointment_email_text) ?  prevState.appointment_email_text : nextProps.appointmentNotificationData.appointment_email_text;
        returnState.appointment_sms = (prevState.userChanged && prevState.appointment_sms) ?  prevState.appointment_sms : nextProps.appointmentNotificationData.appointment_sms;
        returnState.appointment_subject = (prevState.userChanged && prevState.appointment_subject) ?  prevState.appointment_subject : nextProps.appointmentNotificationData.appointment_subject;
        returnState.noti_type = nextProps.appointmentNotificationData.noti_type;
        returnState.notification_body = (prevState.userChanged && prevState.notification_body) ?  prevState.notification_body : nextProps.appointmentNotificationData.appointment_email_text;
        returnState.appointment_id = nextProps.appointmentNotificationData.appointment_id;
        returnState.showLoader = false;
        returnState.showModal = false;
      }
    }

    if (nextProps.isPosEnabled != undefined && nextProps.isPosEnabled) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.isPosEnabled = parseInt(nextProps.isPosEnabled.data);
        returnState.showLoader = false;
      }
    }
    if (nextProps.cardDetails != undefined && nextProps.cardDetails !== prevState.cardDetails) {
      if(localStorage.getItem("showLoader") == "false") {
        if(nextProps.cardDetails.card_number) {
          returnState.cardNumber = nextProps.cardDetails.card_number;
        } else {
          returnState.showCCForm = true;
        }

        returnState.cardDetails = nextProps.cardDetails;
        returnState.showLoader = false;
      }
    }

    if (nextProps.appointmentData != undefined && nextProps.appointmentData !== prevState.appointmentData && nextProps.appointmentDataTime != prevState.appointmentDataTime) {
      //returnState = {};
      if(isEmpty(nextProps.appointmentData)) {
        returnState = {
          appointmentData : {},
          client : '',
          clientEmail : '',
          phoneNumber : '',
          selectedClient : '',
          phone : '',
          notes : '',
          selectedClinic : '',
          selectedClinicName : '',
          appointmentType : 1,
          services : [],
          packages : [],
          serviceArr: [0],
          providers : '',
          provider : '',
          searchPickerDate : '',
          actualTime : '',
          providerTime : [],
          includeDates : [],
          showLoader : false,
          isPosEnabled : false,
          actualTime : 0,
          contactClass: 'setting-input-box',
          appointmentDataTime: nextProps.appointmentDataTime

        }
      } else {
        returnState.appointmentData = nextProps.appointmentData;
        returnState.appointment_details = nextProps.appointmentData.appointment_details;
        let serviceArr = []
        returnState.isPosEnabled = false;
        returnState.client = displayName(nextProps.appointmentData.appointment_details.patient);
        returnState.selectedClientId = nextProps.appointmentData.appointment_details.patient.id;
        returnState.selectedClient = nextProps.appointmentData.appointment_details.patient;
        returnState.clientEmail = nextProps.appointmentData.appointment_details.appointment_booking.email;
        returnState.phone = nextProps.appointmentData.appointment_details.appointment_booking.phone;
        returnState.notes = nextProps.appointmentData.appointment_details.appointment_booking.appointment_notes;
        returnState.selectedClinic = nextProps.appointmentData.appointment_details.clinic.id;
        returnState.selectedClinicName = nextProps.appointmentData.appointment_details.clinic.clinic_name;
        returnState.appointmentType = (nextProps.appointmentData.appointment_details.package) ? 2 : 1;
        returnState.selectedPackage = (nextProps.appointmentData.appointment_details.package) ? nextProps.appointmentData.appointment_details.package_id : "";
        returnState.services = nextProps.appointmentData.all_services_and_packages.services;
        returnState.packages = nextProps.appointmentData.all_services_and_packages.packages;
        //returnState.serviceArr = nextProps.appointmentData.appointment_details.appointment_services;
        if(nextProps.appointmentData.appointment_details.appointment_services.length && (!nextProps.appointmentData.appointment_details.package)) {
          nextProps.appointmentData.appointment_details.appointment_services.map((obj, idx) => {
            returnState["services-"+idx] = returnState.services;
            serviceArr.push(obj.service_id);
          })
        }

        returnState.serviceArr = serviceArr;
        returnState.providers = nextProps.appointmentData.all_providers;
        returnState.provider = nextProps.appointmentData.appointment_details.provider.id;
        returnState.searchPickerDate = moment(nextProps.appointmentData.appointment_details.date).toDate();
        returnState.actualTime = convertTime24to12((nextProps.appointmentData.appointment_details.time))+' '+getAmPm(nextProps.appointmentData.appointment_details.time);
        if(nextProps.appointmentData.appointment_details.appointment_services.length > 0) {
          nextProps.appointmentData.appointment_details.appointment_services.map((obj, idx) => {
             returnState['service-'+idx] = obj.service_id;
             returnState['hours-'+idx] = obj.service.hours;
             returnState['mins-'+idx] = obj.service.mins;
          })
        }

        let arr = []
        if(nextProps.appointmentData.schedules.length > 0) {
          nextProps.appointmentData.available_times.map((obj, idx)=> {
            arr.push(convertTime24to12(obj)+ ' '+getAmPm(obj));
          })
        }
        returnState.providerTime = arr;

        let arr2 = []
        if(nextProps.appointmentData.schedules.length > 0) {
          nextProps.appointmentData.schedules.map((obj, idx)=> {
            arr2.push(moment(obj).toDate());
          })
        }

        returnState.includeDates = arr2;
        returnState.showLoader = false;
        returnState.appointmentDataTime = nextProps.appointmentDataTime;
      }
        returnState.userChanged = false;
        //return returnState;
    }


    if (nextProps.providerAvailability != undefined && nextProps.providerAvailability != prevState.providerAvailability) {
      if(localStorage.getItem("showLoader") == "false") {
          let arr = []
          if(nextProps.providerAvailability.length > 0) {
            nextProps.providerAvailability.map((obj, idx)=> {
              arr.push(moment(obj).toDate());
            })
          }

          returnState.providerAvailability = nextProps.providerAvailability;
          returnState.includeDates = arr;
          returnState.searchPickerDate = '';
          returnState.actualTime = 0;
          returnState.providerTime = [];
          localStorage.setItem("showLoader", true);
          returnState.showLoader = false;
          //return returnState
        }
      }

    if (nextProps.providerTime != undefined && nextProps.providerTime !== prevState.providerTimeOriginal) {
      if(localStorage.getItem("showLoader") == "false") {
        let arr = []
        if(nextProps.providerTime.length > 0) {
          nextProps.providerTime.map((obj, idx)=> {
            arr.push(convertTime24to12(obj)+' '+getAmPm(obj));
          })
        }
        if(prevState.editAppointmentId) {
          returnState['actualTime'] = 0;
        }
        returnState.providerTime = arr;
        returnState.providerTimeOriginal = nextProps.providerTime;
        returnState.showLoader = false;
        //returnState.includeDates = arr;
      }
    }

    if (nextProps.providers != undefined && nextProps.providers !== prevState.providers && nextProps.services !== prevState.services) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.providers = nextProps.providers.doctors;
        let id = prevState.serviceArr.length
        returnState["services-"+id] = nextProps.providers.services;
        if(prevState.editAppointmentId) {
          returnState["services"] = nextProps.providers.services;
          returnState["editService"] = 0;
          returnState["provider"] = 0;

        }
        returnState.providerTime = [];
        returnState.includeDates = [];
        returnState.searchPickerDate = '';
        returnState.actualTime = 0;
        localStorage.setItem("showLoader", true);
        returnState.showLoader = false;
      }
    }

    if (nextProps.servicePackageData != undefined && nextProps.servicePackageData !== prevState.servicePackageData ) {
      if(localStorage.getItem("showLoader") == "false") {
        returnState.servicePackageData = nextProps.servicePackageData;
        returnState.services = nextProps.servicePackageData.services;
        returnState["services-0"] = nextProps.servicePackageData.services;
        returnState.packages = nextProps.servicePackageData.packages;
        returnState["provider"] = 0;
        returnState["providers"] = [];
        returnState["includeDates"] = [];
        returnState["providerTime"] = [];
        returnState["actualTime"] = 0;
        returnState["searchPickerDate"] = '';

        //returnState.showLoader = false;
        returnState['serviceArr'] = (nextProps.servicePackageData.services.length) ?
                                     ((prevState.editAppointmentId) ? [] : ([nextProps.servicePackageData.services.length ] ? [nextProps.servicePackageData.services[0].id ] : [])): [0];
        returnState['serviceArrNames'] = (nextProps.servicePackageData.services.length) ? [nextProps.servicePackageData.services[0].name +" ("+nextProps.servicePackageData.services[0].hours + "hrs "+nextProps.servicePackageData.services[0].mins+" mins)" ] : 0;
      }
    }

    if (nextProps.clients != undefined && nextProps.clients != prevState.clients) {
      if(localStorage.getItem("showLoader") == "false") {
        if(nextProps.clients.length == 0) {
          returnState.clientEmail = '';
          returnState.phone = '';
          returnState.selectedClient = {};
        }
        returnState.clients = nextProps.clients;
        returnState.showClients = true;
        returnState.showLoader = false;
        returnState.reInit = false;
      }
    }
    return returnState;
  }

  getAllServiceIds = (name, value) => {
    if(this.state.editAppointmentId) {
      return this.state.serviceArr;
    } else {
      let state = this.state,
          fl = false,
          arr = [];
          for(let x in state) {
            if(x.startsWith('service-')){
              if(name) {
                if(name == x) {
                  arr.push(value)
                  fl = true;
                } else {
                  arr.push(this.state[x]);
                }
              } else {
                arr.push(this.state[x]);
              }
            }
          }
          if(name && name.startsWith('service-') && arr.length && value && !fl) {
            arr.push(value)
          }

          if(arr.indexOf(0) > -1) {
            arr.splice(arr.indexOf(0), 1);
          }
      return arr;
    }
  }

  getDuration = () => {
    let state = this.state,
        arr = [];
    let duration = 0;
    if(this.state.appointmentType == 1) {
      if(this.state.editAppointmentId) {
        this.state.serviceArr.map((obj, idx)=> {
          let selectedService = this.state.services.find(y => y.id == obj);
          if(selectedService.hours) {
            duration += parseInt(parseInt(selectedService.hours) * 60);
          }
          if(selectedService.mins) {
           duration += parseInt(selectedService.mins);
          }
        });
      } else {
        for(let x in state) {
          if(x.startsWith('service-')){
            let serviceId = this.state[x];
            let selectedService = this.state.services.find(y => y.id == serviceId);
            if(selectedService.hours) {
              duration += parseInt(parseInt(selectedService.hours) * 60);
            }
            if(selectedService.mins) {
             duration += parseInt(selectedService.mins);
            }
          }
        }
      }
    } else {
      let selectedPackage = this.state.packages.find(y => y.id == this.state.selectedPackage);
      if(selectedPackage.hours) {
        duration += parseInt(parseInt(selectedPackage.hours) * 60);
      }
      if(selectedPackage.mins) {
       duration += parseInt(selectedPackage.mins);
      }
    }
    return duration;
  }

  handleInputChange = (event) => {
    const {target} = event
    const {name} = event.target;
    let value = target.value;
    let returnState = {}
    switch(target.type) {
        case 'checkbox': {
            value = target.checked;
            break;
        }
    }
    returnState[event.target.name] = value;
    returnState.userChanged = true;

    if(name == 'appointmentType') {
      returnState.providers = [];
      returnState.includeDates = [];
      returnState.providerTime = [];
      returnState.searchPickerDate = '';
      if(value == 1) {
        returnState.selectedPackage = ""
        returnState.serviceArr = ""
      } else {
        returnState.selectedService = "";
        for(let x in this.state) {
            if(x.startsWith('service-')){
              delete this.state[x];
            }
          }
      }
    }

    if(name == 'selectedClinic' && value != 0) {
      localStorage.setItem("showLoader", true);
      let formData = {}
      formData.clinicId = value;
      this.props.getServices(formData);
      let clinic = this.state.clinics.find(y => y.id == value)
      returnState['selectedClinicName'] = clinic.clinic_name;
      returnState.showLoader = true;
    }

    if(name == 'selectedPackage' && value != 0) {
      localStorage.setItem("showLoader", true);
      let formData = {}
      let serviceArr = []

      let selectedPackage = this.state.packages.find(y => y.id == value);
      if(selectedPackage) {
        returnState.packageHours = selectedPackage.hours
        returnState.packageMins = selectedPackage.mins
      }
      if(selectedPackage.service_packages.length > 0) {
        selectedPackage.service_packages.map((obj, idx)=> {
          serviceArr.push(obj.service_id);
        })
      }
      formData.clinic_id = this.state.selectedClinic;
      formData.service_id = serviceArr;
      returnState.showLoader = true;
      returnState.provider = '';
      this.props.getProviders(formData);
    }

    if(name == 'provider' && value != 0) {
      localStorage.setItem("showLoader", true);
      let formData = {}
      let serviceArr = []
      if(this.state.appointmentType == 1) {
         serviceArr = this.getAllServiceIds(name, value);
      } else {
        let selectedPackage = this.state.packages.find(y => y.id == this.state.selectedPackage);
        if(selectedPackage.service_packages.length > 0) {
          selectedPackage.service_packages.map((obj, idx)=> {
            serviceArr.push(obj.service_id);
          })
        }
      }
      formData.appointment_service = serviceArr;
      formData.clinic_id = this.state.selectedClinic;
      formData.provider_id = value;
      returnState.showLoader = true;
      this.props.getProviderAvailability(formData);
    }
    if(name == 'card_data' && value) {
      localStorage.setItem("showLoader", true);
      let formData = {}
      if(this.state.selectedClientId) {
        formData.clinic_id = this.state.selectedClinic;
        formData.patient_id = this.state.selectedClientId;
        returnState.showLoader = true;
        this.props.getCardDetails(formData);
      } else {
        returnState.showCCForm = true;
      }
    } else if(name == 'card_data' && !value) {
       returnState.showCCForm = false;
    }
    if(name == 'notification_type' && value) {
      returnState.notification_body = (value == 'sms') ? this.state.appointment_sms : this.state.appointment_email_text;
    }




    if(name.startsWith('service-') && value != 0) {
      localStorage.setItem("showLoader", true);
      let arr = [],
      formData = {},
      state = this.state,
      service = this.state.services.find(y => y.id == value),
      nameArr = name.split('-');

      returnState['serviceError-'+nameArr[1]] = false;
      returnState['hours-'+nameArr[1]] = service.hours;
      returnState['mins-'+nameArr[1]] = service.mins;
      returnState.providers = [];
      returnState.provider = 0;
      let serviceArr = this.getAllServiceIds(name, value)
      if(serviceArr.length == 0) {
        serviceArr.push(value)
      }
      formData.clinic_id = this.state.selectedClinic;
      formData.service_id = serviceArr;
      returnState.showLoader = true;
      returnState.serviceArr = serviceArr;
      this.props.getProviders(formData);
    }
    this.setState(returnState);
    if(name == 'allow_double' && this.state.searchPickerDate) {
      this.getDoubleBookingData(value);
      return false;
    }
  }

  selectClient = (event) => {
    let clientId = event.currentTarget.dataset.id;
    let client = this.state.clients.find(y => y.id == clientId)
    let returnState = {}
    returnState.clientEmail = (client.email) ? client.email : "";
    returnState.selectedClientId = client.id;
    returnState.selectedClient = client;
    returnState.phone = (client.phoneNumber) ? client.phoneNumber : "";
    returnState.showClients = false;
    returnState.contactError = false;
    returnState.card_data = false;
    returnState.cardNumber = "";
    returnState.client = displayName(client);
    returnState.reInit = true;
    this.setState(returnState);
  }

  handleClientChange = (event) => {
    const target = event.target;
    let value= target.value;
    let name = event.target.name;
    let returnState = {}
    localStorage.setItem("showLoader", true);
    returnState[event.target.name] = value;
    this.setState(returnState);
    let formData = {}
    formData.client = value;
    if(value.length > 2){
      this.props.searchPatientByName(formData)
    }
  }

  phoneNumberChanged = (t, x, y, number) => {
      if(t) {
        //this.setState({contact_number_1: '+'+y.dialCode+x, contactClass : 'setting-input-box', contactError: false });
        this.setState({phone: number.replace(/\s/g,''), contactClass : 'setting-input-box', contactError: false });
      } else {
        this.setState({contactClass:  'setting-input-box setting-input-box-invalid', contactError: true, phone: number.replace(/\s/g,'')});
      }
  }

  addAnotherService = (event) => {
    let arr = this.state.serviceArr;
    let id = this.state.serviceArr.length;
    let error = false;
    let returnState = {};
    if(this.state.editAppointmentId) {
      let formData = {};
      let newServiceId = parseInt(this.state.editService);
      if(newServiceId) {
        arr.push(newServiceId);
        localStorage.setItem("showLoader", true)
        this.setState({serviceArr : arr, editServiceError: false, showLoader: true}, () => {
          //let serviceArr = this.getAllServiceIds()
          formData.clinic_id = this.state.selectedClinic;
          formData.service_id = arr;
          this.props.getProviders(formData)
        })
      } else {
        this.setState({editServiceError: true});
        return false;
      }
    } else {
      this.state.serviceArr.map((obj, idx) => {
        if(!this.state['service-'+idx]) {
          returnState['serviceError-'+idx] = true;
          error = true;
        } else {
          returnState['serviceError-'+idx] = false;
        }
      })
      if(error) {
        this.setState(returnState);
        return false;
      }
      arr.push(0);
      let arrNames = this.state.serviceArrNames;
      let formData = {};
      if(this.state.services.length) {
        let services = this.state.services
        let serviceName = services[0].name +" ("+services[0].hours + "hrs "+services[0].mins+" mins)";
        arrNames.push(serviceName)
        returnState.serviceArrNames = arrNames;
        returnState['hours-'+id] = services[0].hours;
        returnState['mins-'+id] = services[0].mins;
        returnState['services-'+id] = services;
      }
      returnState.serviceArr = arr;
      this.setState(returnState)
      let serviceArr = this.getAllServiceIds()
      formData.clinic_id = this.state.selectedClinic;
      formData.service_id = serviceArr;
    }
  }

  removeService = (event) => {
    let id = event.currentTarget.dataset.id;
    let serviceId = event.currentTarget.dataset.serviceid;
    let arr = this.state.serviceArr;
    let returnState = {},
    formData = {};
    let state = this.state;
    for(let x in state) {
      if(x.startsWith('service-')) {
        delete this.state[x];
      }
    }
    let index = arr.findIndex( ob=> ob == serviceId)
    arr.splice(index, 1)
    arr.map((obj, idx) => {
      returnState['service-'+idx] = obj
    })
    returnState.serviceArr = arr
    returnState.showLoader = true;
    this.setState(returnState, () => {
      let serviceArr = this.getAllServiceIds()
      if(serviceArr.length) {
        formData.clinic_id = this.state.selectedClinic;
        formData.service_id = serviceArr;
        this.props.getProviders(formData);
      } else {
        let returnState = {}
        returnState.providerTime = [];
        returnState.includeDates = [];
        returnState.searchPickerDate = '';
        returnState.provider = '';
        returnState.providers = [];
        returnState.actualTime = 0;
        returnState.showLoader = false;
        this.setState(returnState)
      }
    }, this.state.provider = '')
  }

  getServiceDetails = (id) => {
    if(this.state.services.length) {
      let service = {};
      let serviceName = '';
      let serviceId = '';
      if(serviceId) {
        service = this.state.services.find(y => y.id == serviceId)
      } else if(id) {
        service = this.state.services.find(y => y.id == id)
      } else {
        service = ''
      }
      if(service) {
         serviceName = service.name + " ("+service.hours+" hrs "+service.mins+" mins)";
      }
      return serviceName;
    }
  }

  saveAppointment = () => {
    let formData = {},
        returnState = {},
    serviceArr = [];
    this.setState({patientNameError: false, patientEmailError: false, clinicError: false, providerError: false, dateError: false,timeError: false});
    let selectedClient = this.state.selectedClient;

    if(selectedClient.id) {
      formData.patient_id = selectedClient.id;
      formData.patient_name = displayName(selectedClient);
      formData.patient_phone = ((selectedClient.phoneNumber != this.state.phone)) ? this.state.phone : selectedClient.phoneNumber;
      if(this.state.clientEmail) {
        formData.patient_email = ((selectedClient.email != this.state.clientEmail) && validator.isEmail(this.state.clientEmail)) ? this.state.clientEmail : selectedClient.email;
      }
    } else {
      //formData.patient_id = 0;
      formData.patient_name = this.state.client;
      if(this.state.clientEmail != '') {
        formData.patient_email = this.state.clientEmail;
      }
      formData.patient_phone = this.state.phone;
    }

    if(formData.patient_name.trim() == '') {
      returnState.patientNameError = true;
      this.setState(returnState)
      return false;
    }
    /*if(formData.patient_email.trim() == '' || (!validator.isEmail(formData.patient_email))) {
      returnState.patientEmailError = true;
      this.setState(returnState)
      return false;
    }*/
    if(!this.state.selectedClinic) {
      returnState.clinicError = true;
      this.setState(returnState)
      return false;
    }
    if(!this.state.serviceArr.length) {
      if(this.state.appointmentType == 1) {
        toast.error("Please select atleast one service!");
      } else {
        toast.error("Please select atleast one package!");
      }
      return false;
    }
    if(!parseInt(this.state.provider)) {
      returnState.providerError = true;
      this.setState(returnState)
      return false;
    }

    if(!this.state.searchPickerDate || this.state.searchPickerDate == '') {
      returnState.dateError = true;
      this.setState(returnState)
      return false;
    }
    if(!this.state.actualTime) {
      returnState.timeError = true;
      this.setState(returnState)
      return false;
    }

    formData.clinic_id = this.state.selectedClinic;
    formData.patient_name = this.state.client;
    formData.double_booking = this.state.allow_double;
    formData.patient_to_be_charged = 0;
    formData.date = moment(this.state.searchPickerDate).format('YYYY-MM-DD');
    formData.time = convertTime12to24(this.state.actualTime, true);
    formData.notes = this.state.notes;


    if(this.state.selectedPackage) {
      let selectedPackage = this.state.packages.find(y => y.id == this.state.selectedPackage);
      if(selectedPackage.service_packages.length > 0) {
        selectedPackage.service_packages.map((obj, idx)=> {
          serviceArr.push(obj.service_id);
        })
      }
      formData.appointment_service = serviceArr;
      formData.package = this.state.selectedPackage;
    } else {
      formData.appointment_service = this.getAllServiceIds();
      formData.package = 0;
    }
    formData.duration = this.getDuration();
    formData.provider_id = this.state.provider;
    localStorage.setItem("showLoader", true);
    this.setState({showLoader: true})
    if(this.state.card_data && this.state.showCCForm) {
      this.state.stripe.createToken(cardNumber).then((response) => {
        if ( response.error ) {
          toast.error(response.error.message)
          localStorage.setItem("showLoader", false);
          this.setState({showLoader: false});
          return false;
        } else {
          stripeToken = response.token.id;
          if ( stripeToken ) {
            formData.stripeToken = stripeToken;
            formData.isAddClicked = true;
            formData["cc-check"] = 1;
            if(this.state.editAppointmentId) {
              formData.appointment_id = this.state.editAppointmentId;
              this.setState({formData: formData})
              this.props.getAppointmentFees(this.state.editAppointmentId);
            } else {
              this.props.saveAppointment(formData);
            }
            //this.props.saveClientCard(this.state.clientID, formData)
          }
        }
      })
    } else {
      if(this.state.editAppointmentId) {
        if(this.state.card_data) {
          formData["cc-check"] = 1;
        }
        formData.appointment_id = this.state.editAppointmentId;
        this.setState({formData: formData, showLoader: true})
        this.props.getAppointmentFees(this.state.editAppointmentId);
        //this.props.saveAppointment(formData);
      } else {
        if(this.state.cardNumber && this.state.card_data) {
          formData["cc-check"] = 1;
        }
        formData.appointment_id = 0;
        this.setState({showLoader: true})
        this.props.saveAppointment(formData);
      }
    }
  }

  toggleCCForm = () => {
    this.setState({showCCForm : !this.state.showCCForm, cardNumber: ""})
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
    formData.notifyFrom = 'create';
    this.props.sendNotification(formData)
  }

  chargeAndReschedule = (event) => {
    let charge = event.currentTarget.dataset.charge;
    let formData = this.state.formData;
    formData.patient_to_be_charged = (charge == "true") ? 1 : 0;
    if(charge) {
      this.setState({showLoader: true, showModal: false});
      this.props.saveAppointment(formData);
    }
  }

  dismissModal = () => {
    this.setState({showModal: false, userChanged: true})
  }

  getSelectedPackageData = () => {
    let selectedPackage = this.state.packages.find(y => y.id == this.state.selectedPackage);
    return selectedPackage.name+"("+selectedPackage.hours+ " hrs "+selectedPackage.mins+" mins)";
  }
  render() {
    let clientName = '',
        clientEmail = '',
        mode = '',
        providerName = '',
        clientPhone = '';


        mode = this.state.mode;

        if(this.state.selectedClient.firstname) {
          clientName = displayName(this.state.selectedClient)
        }

        if(clientName == '') {
          clientName = this.state.client;
        }


        if(this.state.selectedClient.email) {
          clientEmail = (this.state.editAppointmentId) ? this.state.appointment_details.appointment_booking.email :  this.state.selectedClient.email;
        }

        if(clientEmail == '') {
          clientEmail = this.state.clientEmail;
        }


        if(this.state.selectedClient.phoneNumber) {
          clientPhone = (this.state.editAppointmentId) ? this.state.appointment_details.appointment_booking.phone :  this.state.selectedClient.phoneNumber;
        }

        if(clientPhone == '') {
          clientPhone = this.state.phone;
        }

        if(this.state.provider) {
          let providerDetails = this.state.providers.find(y => y.id == this.state.provider);
          providerName = displayName(providerDetails);
        }

    return (<div className="create-appointment-container">
        <div className="awesome" style={{border: '1px solid red'}}>
          <label htmlFor="name">{this.state.appointmentLang.appointment_enter_ur_name}: </label>
          <input type="text" id="name" />
        </div>
        <p>{this.state.appointmentLang.appointment_enter_your} </p><div>
          <div className="create-appoint-popup">
            <div className="create-appoint-title">
              <Link to="/appointment/index" className="back-txt"><img src="/images/back-arrow.png" />&nbsp; {this.state.appointmentLang.appointment_calender}</Link>
            </div>
            <div className="table popup-new-container">
              <div className="table-row">
                <div className="table-cell popup-left-section">
                  <div className="popup-left-title">{this.state.appointmentLang.appointment_book_an}</div>
                  <div className="left-field-outer">
                    <label className="popup-input-label">{this.state.appointmentLang.appointment_clinic}</label>
                    <div className="popup-input-box" id="clinic_left_side_label">{this.state.selectedClinicName}</div>
                  </div>
                  <div className={(this.state.appointmentType == 1) ? "left-field-outer" : "left-field-outer no-display"}>
                    <label className="popup-input-label" id="Service_package_left_lable">{this.state.appointmentLang.appointment_service_services}</label>
                    <div className="popup-input-box" id="service_left_side_label">
                      {
                        this.state.serviceArr && this.state.serviceArr.length > 0 &&
                        this.state.serviceArr.map((obj, idx) => {
                          return (<span key={"serviceDetails-"+idx}>{this.getServiceDetails(obj)}<br /></span>)
                        })
                      }
                    </div>
                  </div>
                  <div className={(this.state.appointmentType == 2) ? "left-field-outer" : "left-field-outer no-display"}>
                    <label className="popup-input-label" id="Service_package_left_lable">Packages</label>
                    <div className="popup-input-box" id="service_left_side_label">
                    {this.state.selectedPackage && this.getSelectedPackageData(this.state.selectedPackage)}
                    </div>
                  </div>
                  <div className="left-field-outer">
                    <label className="popup-input-label">{this.state.appointmentLang.appointment_medical_provider_label}</label>
                    <div className="popup-input-box" id="provider_left_side_label">{providerName}</div>
                  </div>
                  <div className="left-field-outer">
                    <label className="popup-input-label">{this.state.appointmentLang.appointment_date_time_label}</label>
                    <div className="popup-input-box" id="datetime_left_side_label" >{((this.state.searchPickerDate != '') ? viewDateFormat(this.state.searchPickerDate) : '') + "  " +((this.state.actualTime) ? this.state.actualTime : '')}</div>
                  </div>
                  <div className="left-field-outer">
                    <label className="popup-input-label">{this.state.appointmentLang.appointment_client}</label>
                    <div className="popup-input-box" id="patient_left_side_label" >{clientName}</div>
                  </div>
                  <div className="left-field-outer">
                    <label className="popup-input-label">{this.state.appointmentLang.appointment_email}</label>
                    <div className="popup-input-box" id="email_left_side_label" >{clientEmail} </div>
                  </div>
                  <div className="left-field-outer">
                    <label className="popup-input-label">{this.state.appointmentLang.appointment_phone}</label>
                    <div className="popup-input-box" id="phone_left_side_label" >{clientPhone}</div>
                  </div>
                  <div className="left-field-outer">
                    <label className="popup-input-label">{this.state.appointmentLang.appointment_notes_label}</label>
                    <div className="popup-input-box" id="notes_left_side_label" >{this.state.notes}</div>
                  </div>
                  <div className="left-field-outer">
                    <label className="popup-input-label">{this.state.appointmentLang.appointment_service_appointments}</label>
                    <div className="popup-input-box" id="previous_appointments">
                      <ul className="past-appointments">
                      {this.state.selectedClient && this.state.selectedClient.upcoming_appointments && this.state.selectedClient.upcoming_appointments.length > 0 && this.state.selectedClient.upcoming_appointments.map((obj, idx) => {
                          let serviceName = '';
                          if(obj.appointment_services.length) {
                            obj.appointment_services.map((serviceObj, serviceIdx) => {
                              serviceName += ((serviceName != '') ? (serviceName + ' ,') : '')  + ((serviceObj.service) ? serviceObj.service.name : '');
                            })
                          }
                          let status = '';
                          let statusClass = '';
                          if(moment(new Date()).isAfter(obj.appointment_datetime) && obj.status == 'booked') {
                            status = 'completed';
                            statusClass = 'completed'
                          } else if (obj.status == 'booked' && moment(obj.appointment_datetime).isAfter(new Date())) {
                            status = 'upcoming';
                            statusClass = 'upcoming'
                          } else {
                            status = (obj.status == 'canceled') ? 'canceled' : 'no show';
                            statusClass = 'canceled';
                          }

                          return (<li key={'upcoming-'+idx}>
                            <span className={"app_status_span "+statusClass}>{status}</span> {showFormattedDate(obj.appointment_datetime, true)}
                            <div> {this.state.appointmentLang.appointment_at} {obj.clinic.clinic_name}</div>
                            <div>{this.state.appointmentLang.appointment_with} {displayName(obj.user)}</div>
                            <div>{this.state.appointmentLang.appointment_for} {serviceName}</div>
                          </li>)
                      })}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="table-cell popup-right-section">
                  <div className="popup-right-form-outer">
                    <div className="setting-title m-b-40">{mode} {this.state.appointmentLang.appointment}
                      <a data-url="/settings/clinics" className="pull-right cancelAction" />
                    </div>
                    <div className="row">
                      <div className="col-md-4 col-xs-12">
                        <div className="setting-field-outer relative">
                          <div className="new-field-label">{this.state.appointmentLang.appointment_client}</div>
                          <input className={(this.state.patientNameError) ? "setting-input-box field-error" : "setting-input-box"} name="client" value={this.state.client} onChange={this.handleClientChange} type="text" disabled = {(this.state.editAppointmentId)? "disabled" : ""} />
                          <ul className={(this.state.clients.length && this.state.showClients) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"} ref={(refAutoSuggestionClients) => this.refAutoSuggestionClients = refAutoSuggestionClients}>
                          {this.state.clients.length && this.state.clients.map((obj, idx) => {
                              return(
                                  <li key={"client-"+idx} data-id={obj.id} onClick={this.selectClient}>
                                    <a >
                                        {obj && displayName(obj)}
                                    </a>
                                  </li>
                                )
                            })}
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-4 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.appointmentLang.appointment_email}</div>
                          <input className={(this.state.patientEmailError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="clientEmail" value={this.state.clientEmail} onChange={this.handleInputChange} disabled = {(this.state.editAppointmentId)? "disabled" : ""}/>
                        </div>
                      </div>
                      <div className="col-md-4 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.appointmentLang.appointment_phone}</div>
                          <div className="setting-input-outer">
                            {(this.state.reInit) && <IntlTelInput
                              preferredCountries={['tw']}
                              css={ ['intl-tel-input', this.state.contactClass] }
                              utilsScript={ 'libphonenumber.js' }
                              defaultValue = {(this.state.phone) ? this.state.phone : ''}
                              defaultCountry = {this.state.defaultCountry}
                              fieldName='phone'
                              onPhoneNumberChange={ this.phoneNumberChanged }
                              onPhoneNumberBlur={ this.phoneNumberChanged }
                              placeholder="Phone Number"
                              disabled = {(this.state.editAppointmentId)? "disabled" : ""}
                              separateDialCode={`true`}
                            />}
                            {(!this.state.reInit) && <IntlTelInput
                              preferredCountries={['tw']}
                              css={ ['intl-tel-input', this.state.contactClass] }
                              utilsScript={ 'libphonenumber.js' }
                              defaultValue = {(this.state.phone) ? this.state.phone : ''}
                              defaultCountry = {this.state.defaultCountry}
                              fieldName='phone'
                              onPhoneNumberChange={ this.phoneNumberChanged }
                              onPhoneNumberBlur={ this.phoneNumberChanged }
                              placeholder="Phone Number"
                              disabled = {(this.state.editAppointmentId)? "disabled" : ""}
                              separateDialCode={`true`}
                            />}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.appointmentLang.appointment_notes}</div>
                          <textarea className="setting-textarea-box appoint-note"  name="notes" value={this.state.notes} onChange={this.handleInputChange} disabled={(this.state.mode == "Reschedule") ? "disabled" : ""} > </textarea>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.appointmentLang.appointment_clinic}</div>
                          <select className={(this.state.clinicError) ? "setting-select-box field-error" : "setting-select-box"} name="selectedClinic" value={this.state.selectedClinic} onChange={this.handleInputChange} disabled={(this.state.mode == "Reschedule") ? "disabled" : ""}>
                            <option value={0}>{this.state.appointmentLang.appointment_select_clinic}</option>
                            {this.state.clinics && this.state.clinics.length > 0 && this.state.clinics.map((obj, idx) => {
                              return (
                                  <option value={obj.id} key={"clinic-"+obj.id}>{obj.clinic_name}</option>
                                )
                            })}
                        </select>
                        </div>
                      </div>
                      <div className="col-md-6 col-xs-12">
                        <div className={(this.state.selectedClinic) ? "setting-field-outer" : "setting-field-outer no-display"}>
                            <div className="new-field-label">{this.state.appointmentLang.appointment_type}</div>
                            <select className="setting-select-box" name="appointmentType" value={this.state.appointmentType} onChange={this.handleInputChange} disabled={(this.state.mode == "Reschedule") ? "disabled" : ""}>
                              <option value="1">{this.state.appointmentLang.appointment_service_services}</option>
                              <option value="2">{this.state.appointmentLang.appointment_packages}</option>
                            </select>
                          </div>
                      </div>

                      <div className={(this.state.appointmentType == 1) ? "col-md-6 col-sm-12 col-xs-12" : "col-md-6 col-sm-12 col-xs-12 no-display" }>
                        <div className={(this.state.selectedClinic) ? "setting-field-outer" : "setting-field-outer no-display"}>
                        <div className="new-field-label">{this.state.appointmentLang.appointment_services_label}</div>

                        <div className={(this.state.editAppointmentId) ? "appointment-service-name-outer" : "appointment-service-name-outer no-display"}>
                          {this.state.serviceArr.length > 0 && this.state.serviceArr.map((obj, idx)=> {
                            return (
                                <div className="setting-input-box appointment-service-name" key={"serviceArr-edit-"+idx}>

                                  {this.getServiceDetails(obj)}

                                  <a className={(this.state.mode == "Reschedule") ? "add-round-btn no-display" : "add-round-btn"} onClick={this.removeService} data-id={idx} data-serviceid = {obj}><span>-</span></a>
                                </div>
                                )
                            })
                          }

                            <div className={(this.state.mode == "Reschedule") ? "add-service-outer no-display" : "add-service-outer"}>
                              <select name={"editService"} value={this.state["editService"]} onChange={this.handleInputChange} className={(this.state.editServiceError) ? "setting-select-box field-error" : "setting-select-box"} disabled={(this.state.mode == "Reschedule") ? "disabled" : ""}>
                                  <option value={0} >{this.state.appointmentLang.appointment_please_select}</option>
                                  { this.state.services.length > 0 && this.state.services.map((objInner, idxInner) => {
                                    return (
                                        <option value={objInner.id} key={"servicesOptions-"+objInner.id}>{objInner.name}</option>
                                      )
                                  })
                                  }
                              </select>
                              <a className="line-btn add-service-btn" onClick={this.addAnotherService}>Add Service</a>
                            </div>
                          </div>



                        {!this.state.editAppointmentId && this.state.serviceArr.length > 0 && this.state.serviceArr.map((obj, idx)=> {
                          return (
                              <div className={(this.state['serviceError-'+idx]) ? "setting-input-box add-services relative field-error" : "setting-input-box add-services relative"} key={"serviceArr-"+idx}>
                                <select name={"service-"+idx} value={this.state["service-"+idx]} onChange={this.handleInputChange} className="setting-select-box" disabled={(this.state.mode == "Reschedule") ? "disabled" : ""}>
                                  <option value={0} >{this.state.appointmentLang.appointment_please_select}</option>
                                  { this.state["services-"+idx].length > 0 && this.state["services-"+idx].map((objInner, idxInner) => {
                                    return (
                                        <option value={objInner.id} key={"servicesOptions-"+objInner.id}>{objInner.name}</option>
                                      )
                                  })
                                  }
                                </select>
                                <input className="" type="text" placeholder="Hrs" disabled={true} name={"hours-"+idx} value={this.state["hours-"+idx]} onChange={this.handleInputChange}/>
                                <input className="" type="text" placeholder="min" disabled={true} name={"mins-"+idx} value={this.state["mins-"+idx]}  onChange={this.handleInputChange}/>
                                <a className={(idx > 0) ? "add-round-btn" : "add-round-btn no-display"} onClick={this.removeService} data-id={idx} data-serviceid = {obj}>
                                  <span>-</span>
                                </a>
                              </div>
                            )
                        })}
                        <div className={(!this.state.editAppointmentId && this.state.services.length > 0) ? ((this.state.mode == 'Reschedule') ? "input-outer clint-name add-another-service no-display" : "input-outer clint-name add-another-service") : "input-outer clint-name add-another-service no-display"}>
                          <input className="form-control" id="add-more-service" value="Add another service" type="button" onClick={this.addAnotherService} />
                        </div>
                        </div>
                      </div>
                      <div className={(this.state.appointmentType == 2) ? "col-md-6 col-sm-12 col-xs-12" : "col-md-6 col-sm-12 col-xs-12 no-display" }>
                        <div className={(this.state.selectedClinic) ? "setting-field-outer" : "setting-field-outer no-display"}>
                          <div className="new-field-label">{this.state.appointmentLang.appointment_package_label}</div>
                          <div className="setting-input-box add-services relative">
                            <select className="setting-select-box" value={this.state["selectedPackage"]} onChange={this.handleInputChange} name="selectedPackage" disabled={(this.state.mode == "Reschedule") ? "disabled" : ""}>
                              <option value={0} >{this.state.appointmentLang.appointment_please_select}</option>
                              { this.state.packages.length > 0 && this.state.packages.map((obj, idx) => {
                                return (
                                    <option value={obj.id} key={"packages-"+obj.id}>{obj.name}</option>
                                  )
                              })
                            }
                            </select>
                            <input className="" type="text" placeholder="Hrs" value={this.state.packageHours} />
                            <input className="" type="text" placeholder="min" value={this.state.packageMins} />

                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-sm-12 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="row">
                              <div className="col-xs-12">
                                <div className="setting-field-outer">
                                  <div className="new-field-label">{this.state.appointmentLang.appointment_provider}</div>
                                  <select className={(this.state.providerError) ? "setting-select-box field-error" : "setting-select-box"} name="provider" value={this.state.provider} onChange={this.handleInputChange} disabled={(this.state.mode == "Reschedule") ? "disabled" : ""}>
                                    <option value={0} >{this.state.appointmentLang.appointment_please_select}</option>
                                    { this.state.providers.length > 0 && this.state.providers.map((obj, idx) => {
                                        return (
                                            <option value={obj.id} key={"providers-"+obj.id}>{obj && displayName(obj)}</option>
                                          )
                                      })
                                    }
                                  </select>
                                </div>
                              </div>
                              <div className={(this.state.mode != 'Reschedule') ? "col-xs-12 no-display" : "col-xs-12"}>
                                <p className="reschedule-msg">
                                  {this.state.appointmentLang.appointment_sorry_selected_date_time} {showFormattedDate(this.state.rescheduledTime, true)} {this.state.appointmentLang.appointment_is_not_msg}.
                                </p>
                              </div>
                              <div className="col-xs-12">
                                <div className="setting-field-outer">
                                  <div className="new-field-label">{this.state.appointmentLang.appointment_day}</div>
                                  <div className="setting-input-outer appointmant-date-picker" ref={(refDatePickerContainer) => this.refDatePickerContainer = refDatePickerContainer}>
                                    <a className="client-treat-cal" onClick={this.toggleDatePicker}>
                                       <i className="fas fa-calendar-alt" ></i>
                                    </a>

                                    <DatePicker
                                        value={(this.state.searchPickerDate) ? viewDateFormat(this.state.searchPickerDate) : null}
                                        onChange={this.handleSearchDatePicker}
                                        className={((this.state.dateError) ? "setting-input-box field-error" : "setting-input-box") ? "setting-input-box" : "setting-field-outer no-display"}
                                        dateFormat="YYYY-MM-dd"
                                        includeDates={this.state.includeDates}
                                        name='searchPickerDate'
                                        selected={(this.state.searchPickerDate != '') ? this.state.searchPickerDate : null}
                                        autoComplete="off"
                                        showDisabledMonthNavigation
                                        ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                                      />
                                  </div>
                                </div>
                              </div>
                              <div className="col-xs-12">
                                <div className="setting-field-outer no-margin">
                                  <div className="new-field-label">{this.state.appointmentLang.appointment_time}</div>
                                  <div className="setting-input-outer">
                                    <select className={(this.state.timeError) ? "setting-select-box field-error" : "setting-select-box"} name="actualTime" value={this.state.actualTime} onChange={this.handleInputChange}>
                                      <option value={0} >{this.state.appointmentLang.appointment_please_select}</option>
                                      { this.state.providerTime.length > 0 && this.state.providerTime.map((obj, idx) => {
                                          return (
                                              <option value={obj} key={"providers-"+idx}>{obj}</option>
                                            )
                                        })
                                      }
                                  </select>
                                  </div>
                                  <div className="important-instruction m-t-15 text-right">

                                  </div>
                                </div>
                              </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-xs-12">
                        <p className={(this.state.mode == "Reschedule") ? "p-text allow-double-booking no-display" : "p-text allow-double-booking"}>
                          <input type="checkbox" className="new-check" id="double-booking" name="allow_double" checked={(this.state.allow_double) ? "checked" : false} onChange={this.handleInputChange}/>
                          <label htmlFor="double-booking">{this.state.appointmentLang.appointment_double_booking}</label>
                        </p>
                        <p className={(this.state.isPosEnabled && !this.state.editAppointmentId) ? "p-text allow-double-booking m-b-20" : "p-text allow-double-booking no-display"}>
                          <input type="checkbox" className="new-check" id="card_data" name="card_data" checked={(this.state.card_data) ? "checked" : false} onChange={this.handleInputChange} />
                          <label htmlFor="card_data">{this.state.appointmentLang.appointment_enter_card_details}</label>
                        </p>
                        <div className={(this.state.cardNumber && this.state.card_data) ? "form-group row right-field-outer app-card-detail cc-detail": "form-group row right-field-outer app-card-detail cc-detail no-display"} >
                          <div className="col-sm-12">
                          <label className="popup-input-label">{this.state.appointmentLang.appointment_ur_card_details}</label>
                            <div className="popup-input-box">
                              <label id="savedCC">{this.state.cardNumber}</label>
                              <a className="normal-link pull-right addNewCard" onClick={this.toggleCCForm}>{this.state.appointmentLang.appointment_add_edit_card}</a>
                            </div>
                          </div>
                        </div>
                        <div className={(this.state.showCCForm) ? "row": "row no-display"}>
                          <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.appointmentLang.appointment_credit_card_no}<span className="setting-require">*</span></div>
                            <div className="setting-input-box" id="card-number"></div>
                          </div>
                        </div>
                        <div className="col-sm-4 col-xs-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.appointmentLang.appointment_expiration_date} <span className="setting-require">*</span></div>
                            <div className="setting-input-box" id="card-expiry"></div>
                          </div>
                        </div>
                        <div className="col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.appointmentLang.appointment_cvc}<span className="setting-require">*</span></div>
                            <div className="setting-input-box" id="card-cvc"></div>
                          </div>
                        </div>
                        </div>
                        <a className="new-blue-btn save-appoint-btn" onClick={this.saveAppointment}>{this.state.appointmentLang.appointment_sales_label}</a>
                      </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={(this.state.showNotifyPop) ? "modalOverlay": "modalOverlay no-display"}>
            <div className="small-popup-outer appointment-detail-main">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.appointmentLang.appointment_send_notification}</div>
                <a onClick={() => {this.setState({showNotifyPop: !this.state.showNotifyPop}); this.props.history.push(`/appointment/index`);}} className="small-cross">×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">

                  <div className="juvly-subtitle">{this.state.appointmentLang.appointment_your} {this.state.noti_type} {this.state.appointmentLang.appointment_successfully}</div>
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{displayName(this.state.selectedClient)} {this.state.appointmentLang.appoinment_will_be_notified}:</div>
                        <select className="setting-select-box" name="notification_type" onChange={this.handleInputChange} value={this.state.notification_type}>
                          <option value="email">{this.state.appointmentLang.appointment_email}</option>
                          <option value="sms">{this.state.appointmentLang.appointment_sms}</option>
                          <option value="emailAndSms">{this.state.appointmentLang.appointment_both}</option>
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
                <Link to="/appointment/index"  className="new-red-btn pull-left">{this.state.appointmentLang.appointment_dont_send_notification}</Link>
                <a  className="new-blue-btn pull-right" onClick={this.sendNotification}>{this.state.appointmentLang.appointment_send_notification}</a>
              </div>
            </div>
          </div>

          <div className={(this.state.showModal ? 'overlay' : '')}></div>
          <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                  <h4 className="modal-title" id="model_title">
                    {this.state.appointmentLang.appointment_rescheduling_fees}
                  </h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                  {this.state.appointmentLang.appointment_rescheduling_fee} {numberFormat(this.state.cancellation_fee, 'currency')}. {this.state.appointmentLang.appointment_want_to_do}
                </div>
                <div className="modal-footer" >
                  <div className="col-md-12 text-left" id="footer-btn">
                    <button type="button" className="btn btn-success pull-right" data-dismiss="modal" data-charge={true} onClick={this.chargeAndReschedule}>{this.state.appointmentLang.appointment_save_charge}</button>
                    <button type="button" className="btn  logout pull-right m-r-10" data-dismiss="modal" data-charge={false} onClick={this.chargeAndReschedule}>{this.state.appointmentLang.appointment_save_do_not_charge}</button>
                  </div>
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
      </div>);

  }
}

function mapStateToProps(state) {
    let returnState = {};
    if(state.AppointmentReducer.action !== "") {
      const languageData = JSON.parse(localStorage.getItem("languageData"));
      //toast.dismiss();
      localStorage.setItem("showLoader", false);
      if (state.AppointmentReducer.action === 'GET_CLINICS' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.clinics = state.AppointmentReducer.data.data;
        }
      } else if (state.AppointmentReducer.action === 'GET_PROVIDERS' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.providers = state.AppointmentReducer.data.data;
        }
      } else if (state.AppointmentReducer.action === 'GET_SERVICES' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.servicePackageData = state.AppointmentReducer.data.data;
        }
      } else if (state.AppointmentReducer.action === 'SEARCH_PATIENTS' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.clients = state.AppointmentReducer.data.data;
        }
      } else if (state.AppointmentReducer.action === 'GET_PROVIDER_AVAILABILITY' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.providerAvailability = state.AppointmentReducer.data.data;
        }
      } else if (state.AppointmentReducer.action === 'GET_PROVIDER_TIME' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.providerTime = state.AppointmentReducer.data.data;
        }
      } else if (state.AppointmentReducer.action === 'SAVE_APPOINTMENT' ) {
        if(state.AppointmentReducer.data.status == 201 || state.AppointmentReducer.data.status == 200) {
          toast.success(languageData.global[state.AppointmentReducer.data.message])
          returnState.appointmentSaveMessage = languageData.global[state.AppointmentReducer.data.message];
          returnState.appointmentNotificationData = state.AppointmentReducer.data.data;
        } else {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
          returnState.tstamp = new Date()
        }
      } else if (state.AppointmentReducer.action === 'APPOINTMENT_EDIT_GET' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.appointmentData = state.AppointmentReducer.data.data;
          returnState.appointmentDataTime = new Date();
        }
      } else if (state.AppointmentReducer.action === 'EMPTY_DATA' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.appointmentData = {};
        }
      } else if (state.AppointmentReducer.action === 'CHECK_POS_ENABLED' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.isPosEnabled = state.AppointmentReducer.data;
        }
      } else if (state.AppointmentReducer.action === 'GET_CARD_DETAILS' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.cardDetails = state.AppointmentReducer.data.data;
        }
      } else if (state.AppointmentReducer.action === 'SEND_NOTIFICATION' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.notificationSentData = state.AppointmentReducer.data.data;
          returnState.message = languageData.global[state.AppointmentReducer.data.message];
          returnState.notificationSent = true;
          returnState.notificationSentTimestamp = new Date();
        }
      } else if (state.AppointmentReducer.action === 'APPOINTMENT_FEES' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
        } else {
          returnState.appointmentFees = state.AppointmentReducer.data.data;
        }
      } else if (state.AppointmentReducer.action === 'CLIENT_DATA_APPOINTMENT' ) {
        if(state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false;
          returnState.redirect = true;
        } else {
          returnState.selectedClientData = state.AppointmentReducer.data.data;
        }
      }
      else if (state.CommonReducer.action === "GET_TRACK_HEAP_EVENT") {
        if(state.CommonReducer.data.status != 201){
           //returnState.message = languageData.global[state.CommonReducer.data.message];
         }
        }
    }

  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({searchPatientByName: searchPatientByName, getClinics : getClinics, getProviders : getProviders, getServices: getServices, getProviderAvailability: getProviderAvailability , getProviderTime: getProviderTime, saveAppointment: saveAppointment, getAppointment: getAppointment, exportEmptyData: exportEmptyData, checkePosEnabled:checkePosEnabled, getCardDetails: getCardDetails, sendNotification: sendNotification, getAppointmentFees: getAppointmentFees, getClientData: getClientData, geCommonTrackEvent: geCommonTrackEvent }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateAppointment));
