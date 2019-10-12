import React, { Component } from 'react';
import Sidebar from "../../../../Containers/Settings/sidebar.js";
import config from '../../../../config';
import axios from 'axios';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown,faAngleRight} from '@fortawesome/free-solid-svg-icons';
import {fetchSelectedClinic,
        createClinic,
        updateSelectedClinic,
        fetchAllTimezone,
        fetchAllCountries,
        deleteClinic,
        fetchDefaultClinicData,
        exportEmptyData
      } from "../../../../Actions/clinicsActions.js";
import {geCommonTrackEvent} from '../../../../Actions/Common/commonAction.js';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import IntlTelInput from 'react-intl-tel-input';
import $ from 'jquery';
import InputMask from 'react-input-mask';
import { isPositiveNumber, isFormSubmit } from "../../../../Utils/services.js";


function convertTime12to24(time12h) {
  const [time, modifier] = time12h.split(' ');

  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12;
  }

  return hours + ':' + minutes;
}

function tConvert (time) {
  time = time.toString().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) {
    time = time.slice (1);
    time[0] = +time[0] % 12 || 12;
    if(time[0] < 10) {
      time[0] = '0'+time[0]
    }
  }

  delete time[time.length-1];
  return time.join ('');
}

function getAmPm (time) {
  time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) {
    time = time.slice (1);
    time[5] = +time[0] < 12 ? 'AM' : 'PM';
    time[0] = +time[0] % 12 || 12;
  }
  return time[5];
}
 class CreateEditClinics extends Component{
   constructor(props) {
     super(props);
     const userData = JSON.parse(localStorage.getItem('userData'));
     const languageData  = JSON.parse(localStorage.getItem('languageData'));
     this.state = {
       globalLang : languageData.global,
        timezone:'',
        city:'',
        php_timezone:'',
        country_name:'',
        country_code:'',
        defaultCountry: localStorage.getItem('cCode'),
        clinic_name: '',
        contact_no: '',
        address: '',
        email_special_instructions:'',
        sms_notifications_phone:'',
        clinic_business_hours: ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        tax: '',
        clinicData: {},
        userId:userData.user.id,
        userType:userData.user_type,
        id: this.props.match.params.id,
        page: 1,
        appliedClinicId: 0,
        pagesize: 15,
        sortorder: 'asc',
        term: '',
        hasMoreItems: true,
        appointment_notification_emails: '',
        next_page_url: '',
        loadMore: true,
        startFresh: true,
        showLoader: false,
        apply_clinic: "true",
        productPricePop: false,
        scopes: 'business_hours',
        user_changed:false,
        timezoneList:[],
        countryList:[],
        notiEmailArr: [],
        multipleEmailClass : "setting-input-box notiEmailInput",
        contactClass: 'setting-input-box',
        notiContactClass: 'setting-input-box',
        'day-1' : false,
        'day-2' : false,
        'day-3' : false,
        'day-4' : false,
        'day-5' : false,
        'day-6' : false,
        'day-7' : false,
        from_time_1 : '00:00',
        from_time_2 : '00:00',
        from_time_3 : '00:00',
        from_time_4 : '00:00',
        from_time_5 : '00:00',
        from_time_6 : '00:00',
        from_time_7 : '00:00',
        from_ampm_1 : 'AM',
        from_ampm_2 : 'AM',
        from_ampm_3 : 'AM',
        from_ampm_4 : 'AM',
        from_ampm_5 : 'AM',
        from_ampm_6 : 'AM',
        from_ampm_7 : 'AM',
        to_time_1 : '00:00',
        to_time_2 : '00:00',
        to_time_3 : '00:00',
        to_time_4 : '00:00',
        to_time_5 : '00:00',
        to_time_6 : '00:00',
        to_time_7 : '00:00',
        to_ampm_1 : 'AM',
        to_ampm_2 : 'AM',
        to_ampm_3 : 'AM',
        to_ampm_4 : 'AM',
        to_ampm_5 : 'AM',
        to_ampm_6 : 'AM',
        to_ampm_7 : 'AM',
        disableClass_1: 'fromandtoTime disable',
        disableClass_2: 'fromandtoTime disable',
        disableClass_3: 'fromandtoTime disable',
        disableClass_4: 'fromandtoTime disable',
        disableClass_5: 'fromandtoTime disable',
        disableClass_6: 'fromandtoTime disable',
        disableClass_7: 'fromandtoTime disable',
        from_hours_format_1 : 'setting-select-box hours-pm from_time_option',
        from_hours_format_2 : 'setting-select-box hours-pm from_time_option',
        from_hours_format_3 : 'setting-select-box hours-pm from_time_option',
        from_hours_format_4 : 'setting-select-box hours-pm from_time_option',
        from_hours_format_5 : 'setting-select-box hours-pm from_time_option',
        from_hours_format_6 : 'setting-select-box hours-pm from_time_option',
        from_hours_format_7 : 'setting-select-box hours-pm from_time_option',
        to_hours_format_1 : 'setting-select-box hours-pm from_time_option',
        to_hours_format_2 : 'setting-select-box hours-pm from_time_option',
        to_hours_format_3 : 'setting-select-box hours-pm from_time_option',
        to_hours_format_4 : 'setting-select-box hours-pm from_time_option',
        to_hours_format_5 : 'setting-select-box hours-pm from_time_option',
        to_hours_format_6 : 'setting-select-box hours-pm from_time_option',
        to_hours_format_7 : 'setting-select-box hours-pm from_time_option',
        from_time_class_1 : 'setting-input-box hours-time from-time-input',
        from_time_class_2 : 'setting-input-box hours-time from-time-input',
        from_time_class_3 : 'setting-input-box hours-time from-time-input',
        from_time_class_4 : 'setting-input-box hours-time from-time-input',
        from_time_class_5 : 'setting-input-box hours-time from-time-input',
        from_time_class_6 : 'setting-input-box hours-time from-time-input',
        from_time_class_7 : 'setting-input-box hours-time from-time-input',
        to_time_class_1 : 'setting-input-box hours-time to-time-input',
        to_time_class_2 : 'setting-input-box hours-time to-time-input',
        to_time_class_3 : 'setting-input-box hours-time to-time-input',
        to_time_class_4 : 'setting-input-box hours-time to-time-input',
        to_time_class_5 : 'setting-input-box hours-time to-time-input',
        to_time_class_6 : 'setting-input-box hours-time to-time-input',
        to_time_class_7 : 'setting-input-box hours-time to-time-input',
        defaultClinicData : {},
        isTimeZomeChanged:false,
        showTimeZoneModal: false,
        isRender: false
     };

     window.onscroll = () => {
       return false;
     }
   }
   componentDidMount(){
     this.props.fetchDefaultClinicData();
     const clinicId =this.props.match.params.id;
     const languageData = JSON.parse(localStorage.getItem('languageData'));
     const valTrack = "Clinic Setup";
     let isRender = false;
     if(!clinicId){
       isRender = true;
       this.props.geCommonTrackEvent(valTrack);
     }
     window.onscroll = () => {
       return false;
     }
     this.setState({
       edit_clinic_header: (clinicId != undefined) ? languageData.settings['edit_clinic_header'] : languageData.settings['create_clinic_header'],
       clinicId: (clinicId != undefined) ? clinicId : undefined,
       edit_clinic_subheader: languageData.settings['edit_clinic_subheader'],
       edit_clinic_Clinic_name: languageData.settings['edit_clinic_Clinic_name'],
       edit_clinic_contact_no: languageData.settings['edit_clinic_contact_no'],
       edit_clinic_time_zone: languageData.settings['edit_clinic_time_zone'],
       edit_clinic_address: languageData.settings['edit_clinic_address'],
       edit_clinic_city_state: languageData.settings['edit_clinic_city_state'],
       edit_clinic_country:languageData.settings['edit_clinic_country'],
       edit_clinic_notif_email : languageData.settings['edit_clinic_notif_email'],
       edit_clinic_sms_notif_phone: languageData.settings['edit_clinic_sms_notif_phone'],
       edit_clinic_sms_multiple_emails:languageData.settings['edit_clinic_sms_multiple_emails'],
       edit_clinic_tax_settings:languageData.settings['edit_clinic_tax_settings'],
       edit_clinic_tax_rate:languageData.settings['edit_clinic_tax_rate'],
       edit_clinic_business_hours:languageData.settings['edit_clinic_business_hours'],
       edit_clinic_open_hours:languageData.settings['edit_clinic_open_hours'],
       edit_clinic_close_hours:languageData.settings['edit_clinic_close_hours'],
       edit_clinic_monday:languageData.settings['edit_clinic_monday'],
       edit_clinic_tuesday:languageData.settings['edit_clinic_tuesday'],
       edit_clinic_wednesday:languageData.settings['edit_clinic_wednesday'],
       edit_clinic_thursday:languageData.settings['edit_clinic_thursday'],
       edit_clinic_friday:languageData.settings['edit_clinic_friday'],
       edit_clinic_Saturday:languageData.settings['edit_clinic_Saturday'],
       edit_clinic_sunday:languageData.settings['edit_clinic_sunday'],
       edit_clinic_delete_button:languageData.settings['edit_clinic_delete_button'],
       clinic_delete_warning:languageData.settings['clinic_delete_warning'],
       settings_price_of_products_msg: languageData.settings['settings_price_of_products_msg'],
       settings_you_are_adding: languageData.settings['settings_you_are_adding'],
       settings_plz_select_how_u: languageData.settings['settings_plz_select_how_u'],
       settings_i_dont_want: languageData.settings['settings_i_dont_want'],
       settings_copy_price: languageData.settings['settings_copy_price'],
       settings_clinic: languageData.settings['settings_clinic'],
       settings_select: languageData.settings['settings_select'],
       user_save_btn_text: languageData.settings['user_save_btn_text'],
       yes_option:languageData.settings['yes_option'],
       no_option:languageData.settings['no_option'],
       label_cancel:languageData.global['label_cancel'],
       delete_confirmation:languageData.global['delete_confirmation'],
       saveBtn:languageData.global['saveBtn'],
       editUsers_CancelBtn:languageData.settings['editUsers_CancelBtn'],
       clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
       setting_clinic_timezone_change_msg_confirmation: languageData.settings['setting_clinic_timezone_change_msg_confirmation'],
       showLoader: true,
       isRender: isRender
     })
     let formData = {'params':{

       }
     }

     if(clinicId){
       this.props.fetchSelectedClinic(formData,clinicId);
      }
    /*this.props.fetchAllTimezone();

    this.props.fetchAllCountries();*/
   }

   static getDerivedStateFromProps(props, state) {
     if(props.showLoader != undefined && props.showLoader == false) {
       props.exportEmptyData()
         return {showLoader : false};
      }
       if (props.clinicData !== undefined && props.clinicData.status === 200 && props.clinicData.data != state.clinicData) {
          let notiEmails = (props.clinicData.data.appointment_notification_emails) ? props.clinicData.data.appointment_notification_emails.split(',') : [] ;
          //let index = notiEmails.indexOf('');
          //notiEmails = notiEmails.slice(index, '');

          var array = notiEmails

          notiEmails = notiEmails.filter(function (el) {
            return el != '';
          });
          let returnState = {};
          if(props.clinicData.data.clinic_business_hours.length) {
            let hours = props.clinicData.data.clinic_business_hours;
            hours.map((obj, idx) => {
              returnState["day-"+ obj.day] = true;
              returnState["from_time_"+ obj.day] = tConvert(obj.from_time);

              returnState["from_ampm_"+ obj.day] = getAmPm(obj.from_time);
              returnState["to_time_"+ obj.day] = tConvert(obj.to_time);
              returnState["disableClass_"+ obj.day] = 'fromandtoTime';
              returnState["to_ampm_"+ obj.day] = getAmPm(obj.to_time);
            })
          }
          returnState.clinicData = props.clinicData.data
          returnState.showLoader = false
          returnState.clinic_name = (state.userChanged) ? state.clinic_name : props.clinicData.data.clinic_name
          returnState.contact_no = (state.userChanged) ? state.contact_no : props.clinicData.data.contact_no
          returnState.timezone = (state.userChanged) ? state.timezone : props.clinicData.data.timezone
          returnState.php_timezone =(state.userChanged) ? state.php_timezone : props.clinicData.data.php_timezone
          returnState.address = (state.userChanged) ? state.address : props.clinicData.data.address
          returnState.city = (state.userChanged) ? state.city : props.clinicData.data.city
          returnState.notiEmailArr =  notiEmails
          //returnState.appointment_notification_emails = (state.userChanged) ? state.appointment_notification_emails : props.clinicData.data.appointment_notification_emails ? props.clinicData.data.appointment_notification_emails.split(',') : []
          returnState.tax = (state.userChanged) ? state.tax : props.clinicData.data.tax
          returnState.status =  (state.userChanged) ? state.status : props.clinicData.data.status
          returnState.business_hours = (state.userChanged) ? state.business_hours : props.clinicData.data.clinic_business_hours
          returnState.email_special_instructions =  (state.userChanged) ? state.email_special_instructions : props.clinicData.data.email_special_instructions
          returnState.sms_notifications_phone = (state.userChanged) ? state.sms_notifications_phone : props.clinicData.data.sms_notifications_phone
          returnState.country_name = (state.userChanged) ? state.country_name : props.clinicData.data.country
          returnState.isRender = true
          props.exportEmptyData()
          return returnState;
       }else if(props.countryList !== undefined && props.countryList.status === 200){
         props.exportEmptyData()
         return{
           countryList: (state.userChanged) ? state.countryList : props.countryList.data,
           showLoader:false
         };
       }else if(props.defaultClinicData !== undefined && props.defaultClinicData.status === 200 && props.defaultClinicData.data != state.defaultClinicData){
         props.exportEmptyData()
         return{
           countryList: (state.userChanged) ? state.countryList : props.defaultClinicData.data.country_list,
           timezoneList: (state.userChanged) ? state.countryList : props.defaultClinicData.data.timezone_list,
           clinicList: (state.userChanged) ? state.countryList : props.defaultClinicData.data.clinic_list,
           defaultClinicData: (state.userChanged) ? state.countryList : props.defaultClinicData.data,
           showLoader:false
         };
       } else if(props.timezoneList !== undefined && props.timezoneList.status === 200){
         props.exportEmptyData()
         return{
         timezoneList: (state.userChanged) ? state.timezoneList : props.timezoneList.data,
         showLoader: false
        };
       }  else if(props.redirect != undefined && props.redirect == true) {
         props.exportEmptyData()
         toast.dismiss();
        toast.success(props.message, {onClose : () => {
            props.history.push('/settings/clinics');
          }
        });
     } else{
        return null;
      }
    return null
   }

  phoneNumberChanged = (t, x, y, number) => {
      if(t) {
        this.setState({contact_no: number.replace(/\s/g,''), contactClass : 'setting-input-box', contactError: false, userChanged: true });
      } else {
        this.setState({contactClass:  'setting-input-box setting-input-box-invalid', contactError: true, contact_no: number.replace(/\s/g,''), userChanged: true});
      }
  }

  phoneNumberChanged1 = (t, x, y, number) => {
      if(t) {
          this.setState({sms_notifications_phone: number.replace(/\s/g,''), notiContactClass : 'setting-input-box', contactError: false });
      } else {
        this.setState({notiContactClass:  'setting-input-box setting-input-box-invalid', contactError: false, sms_notifications_phone: number.replace(/\s/g,'')});
      }
  }

   handleInputChange = (event) => {
       const target = event.target;
       const value = target.type === 'checkbox' ? target.checked : target.value;
       let arr = [];
       let changedVal = {
           [event.target.name]: value, userChanged : true
       }
       if(target.name === 'timezone'){
         changedVal.isTimeZomeChanged = true
       }
       this.setState(changedVal);
   }

   onBlur = (event) => {
      if(validator.isEmail(event.target.value)) {
        let arr = this.state.notiEmailArr;
        if(arr.indexOf(event.target.value) == -1) {// return adjusted time or original string
          arr.push(event.target.value.trim());
        }
        this.setState({notiEmailArr : arr, userChanged: true, appointment_notification_emails : '', multipleEmailClass : 'setting-input-box notiEmailInput '});
      } else {
        this.setState({appointment_notification_emails : '', multipleEmailClass : 'setting-input-box notiEmailInput field_error'});
      }
   }

   removeEmail = (event) => {
      let arr = this.state.notiEmailArr;
      delete arr[event.currentTarget.dataset.emailid];

      var array = arr

      arr = arr.filter(function (el) {
        return el != '';
      });
      this.setState({notiEmailArr : arr});
   }

   maskChange = (newState, oldState, userInput) => {
    var { value } = newState;
    var selection = newState.selection;
    var cursorPosition = selection ? selection.start : null;

    if (value.endsWith(':') && userInput !== ':') {
      if (cursorPosition === value.length) {
        cursorPosition--;
        selection = { start: cursorPosition, end: cursorPosition };
      }
      value = value.slice(0, -1);
    }
    if(cursorPosition == 2) {
      if(value > 12) {
        value = 12;
      }
    }
    var tmpArr = value.split(':');
    if(parseInt(tmpArr[0]) > 12) {
      tmpArr[0] = 12;
    }
    if(cursorPosition == 5) {
      if(parseInt(tmpArr[1]) >= 60) {
        tmpArr[1] = 59;
        var tmpVal = tmpArr.join(':');
        value = tmpVal;
      }
    }

    if(tmpArr[1] == undefined) {
      if(tmpArr[0] < 10) {

      }
      tmpArr[1] = '00';
    }
      value = tmpArr.join(':');

    return {
      value,
      selection
    };
  }

   toggleTime = (event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;
      let nameArr = name.split('-');
      let id = nameArr[nameArr.length-1];
      let tempState = {}
      tempState['day-'+id] = value;
      if(value) {
        tempState['disableClass_'+id] = 'fromandtoTime'
      } else {
        tempState['disableClass_'+id] = 'fromandtoTime disable'
      }
      tempState['from_time_'+id] = '00:00'
      tempState['from_ampm_'+id] = 'AM'
      tempState['to_time_'+id] = '00:00'
      tempState['to_ampm_'+id] = 'AM'
      this.setState(tempState);
   }

   showDeleteModal = () => {
      this.setState({showModal: true})
   }

   dismissModal = () => {
      this.setState({showModal: false})
   }

   deleteClinic = () => {
      this.setState({showLoader: true, hideBtns : true})
      this.dismissModal();
      let cId = this.state.clinicId;
      this.props.deleteClinic(cId);
   }

   handleSubmit = (event) => {
     this.setState({
       showTimeZoneModal:false,
       isTimeZomeChanged:false
     })
     //====Frontend validation=================
     let error = false;
     let regularExpression  = /^[a-zA-Z]$/;


     this.setState({ clinic_name_Error: false,
       contact_no_Error: false,
       timezone_Error: false,
       address_Error: false,
       city_Error: false,
       country_Error: false,
       appointment_notification_emails_Error: false,
       sms_notifications_phone_Error: false,
       tax_Error: false,
       status_Error: false,
       email_special_instructions_Error: false,
       business_hours_Error: false
     });

     if (typeof this.state.clinic_name === undefined || this.state.clinic_name === null || this.state.clinic_name === '' || this.state.clinic_name.trim() == "") {
       this.setState({
         clinic_name_Error:true
       })
       error = true;
     }
      if (typeof this.state.contact_no === undefined || this.state.contact_no === null || this.state.contact_no === '' || this.state.contact_no.length < 11 || this.state.contactError) {

       this.setState({
         contact_no_Error:true
       })
       error = true;
     }
     if (typeof this.state.timezone === undefined || this.state.timezone === null || this.state.timezone === '' ) {
       this.setState({
         timezone_Error:true
       })
       error = true;
     }
      if (typeof this.state.address === undefined || this.state.address === null || this.state.address === '' || this.state.address.trim() == "") {
       this.setState({
         address_Error:true
       })
       error = true;
     }
     if (typeof this.state.city === undefined || this.state.city === null || this.state.city === '' || this.state.city.trim() == "") {
       this.setState({
         city_Error:true
       })
       error = true;
     }
      if (typeof this.state.country_name === undefined || this.state.country_name === null || this.state.country_name === '' || this.state.country_name.trim() === '' || this.state.country_name.value == "select" ) {
       this.setState({
         country_Error:true
       })
       error = true;
     }

     if (typeof this.state.tax === undefined || this.state.tax === null || this.state.tax === '' || !isPositiveNumber(this.state.tax)) {
       this.setState({
         tax_Error:true
       })
       error = true;
     }else if (typeof this.state.status === undefined || this.state.status === null || this.state.status === '' ) {
       this.setState({
         status_Error:true
       })
       error = true;
     }
          if (error === true) {
              return;
          }



    let business_hours = [];
    let valid_business_hours = [];

    this.state.clinic_business_hours.map((obj, idx) => {
      let dayId = idx + 1;
      let errorState = {}
      errorState['from_time_class_'+dayId] = 'setting-input-box hours-time from-time-input';
      errorState['to_time_class_'+dayId] = 'setting-input-box hours-time to-time-input';
      errorState['from_hours_format_'+ dayId] = 'setting-select-box hours-pm from_time_option';
      errorState['to_hours_format_'+ dayId] = 'setting-select-box hours-pm from_time_option';
      this.setState(errorState);
    })
    let errorClinicBusinesshours = false;
    this.state.clinic_business_hours.map((obj, idx) => {
      let dayId = idx + 1;
      if(this.state['day-'+dayId]) {
        let errorState = {}
        let from_time = this.state['from_time_'+dayId];
        let to_time = this.state['to_time_'+dayId];
        let from_hours = this.state['from_ampm_'+dayId];
        let to_hours = this.state['to_ampm_'+dayId];
        var appointment_form  = "11/24/2014 "+from_time+" "+from_hours;
        var appointment_to    = "11/24/2014 "+to_time+" "+to_hours;
        var fromDate= new Date(Date.parse(appointment_form));
        var toDate = new Date(Date.parse(appointment_to));
        if((from_time == '' || from_time == '00:00') && (to_time == '' || to_time == '00:00')) {
          errorState['from_time_class_'+dayId] = 'setting-input-box hours-time from-time-input field_error';
          errorState['to_time_class_'+dayId] = 'setting-input-box hours-time to-time-input field_error';
          errorState['from_hours_format_'+ dayId] = 'setting-select-box hours-pm from_time_option field_error';
          errorState['to_hours_format_'+ dayId] = 'setting-select-box hours-pm from_time_option field_error';
          //this.setState(errorState);
          errorClinicBusinesshours = true;


        } else if(from_time == '' || from_time == '00:00') {
          errorState['from_time_class_'+dayId] = 'setting-input-box hours-time from-time-input field_error';
          errorClinicBusinesshours = true;
        } else if(to_time == '' || to_time == '00:00') {
          errorState['to_time_class_'+dayId] = 'setting-input-box hours-time to-time-input field_error';
          errorClinicBusinesshours = true;
        } else if(fromDate >= toDate){
          errorState['from_time_class_'+dayId] = 'setting-input-box hours-time from-time-input field_error';
          errorState['to_time_class_'+dayId] = 'setting-input-box hours-time to-time-input field_error';
          errorState['from_hours_format_'+ dayId] = 'setting-select-box hours-pm from_time_option field_error';
          errorState['to_hours_format_'+ dayId] = 'setting-select-box hours-pm from_time_option field_error';
          errorClinicBusinesshours = true;
        } else {
          errorState['from_hours_format_'+ dayId] = 'setting-select-box hours-pm from_time_option';
          errorState['to_hours_format_'+ dayId] = 'setting-select-box hours-pm from_time_option';
          let x = convertTime12to24(this.state['from_time_'+dayId]+' '+this.state['from_ampm_'+dayId])
          let y = convertTime12to24(this.state['to_time_'+dayId]+' '+this.state['to_ampm_'+dayId])
          business_hours.push({day: dayId, from_time : x, to_time : y});
        }
        this.setState(errorState);
      }
    })
    this.setState({business_hours:business_hours})
    if(errorClinicBusinesshours){
      toast.dismiss();
      toast.error(this.state.globalLang.error_please_a_valid_time);
      return false
    }
    //return
    if(this.state.isTimeZomeChanged && this.props.match.params.id > 0){
      this.setState({showTimeZoneModal:true})
    } else {
      this.handleFormSubmit(business_hours)
    }


   };

   handleFormSubmit = (business_hours) => {
     this.setState({
       showTimeZoneModal:false,
       isTimeZomeChanged:false
     })
     localStorage.setItem('sortOnly', true);
      let formData = {
          clinic_name:this.state.clinic_name,
          contact_no: this.state.contact_no,
          timezone: this.state.timezone,
          php_timezone:this.state.php_timezone,
          address: this.state.address,
          city: this.state.city,
          country_name: this.state.country_name,
          country : this.state.country_name,
          sms_notifications_phone: this.state.sms_notifications_phone,
          tax: parseFloat(this.state.tax)
      };
      if(business_hours){
        formData.business_hours = business_hours
      }
      let notiEmailList = '';
      if(this.state.notiEmailArr.length) {

         if(this.state.notiEmailArr.length > 1) {
           notiEmailList = this.state.notiEmailArr.join(',')
         } else {
           notiEmailList = this.state.notiEmailArr[0]
         }
      }


      formData.appointment_notification_emails = notiEmailList;
      const clinicId =this.props.match.params.id;
       if(clinicId){
         this.setState({showLoader: true});
         this.props.updateSelectedClinic(formData,clinicId);
       }
       else{
         this.setState({clinicFormData: formData, productPricePop: true});
         //this.props.createClinic(formData);
       }
   }


   createClinicNow = () => {
    this.setState({appliedClinicIdError: false})
    let formData = this.state.clinicFormData;
    if(this.state.apply_clinic == "true") {
      if(this.state.appliedClinicId == 0) {
        this.setState({appliedClinicIdError: true})
        return false;
      }
      formData.apply_clinic = true;
    } else {
      formData.apply_clinic = false;
    }
    formData.appliedClinicId = this.state.appliedClinicId;
    this.setState({showLoader: true, productPricePop: false})
    this.props.createClinic(formData);
   }

   dismissTimeZoneModal = (event) => {
     this.setState({showTimeZoneModal: false})
   }

   render(){
    var enableDays = [];
    var fromHours = [];
    if(this.state.business_hours !== undefined && this.state.business_hours.length) {
      this.state.business_hours.map((obj, idx) => {
        enableDays.push(obj.day);
      })
    }

   return(
    <div className="main protected">
    <div id="content">
       <div className="container-fluid content setting-wrapper">
          <Sidebar />
          <div className="setting-setion">
             <div className="setting-container">
                <div className="setting-title">
                   {this.state.edit_clinic_header}
                   <Link to="/settings/clinics" className="pull-right cancelAction">
                   <img src={'../../../../images/close.png'}/></Link>
                </div>
                <div className="row">
                   <div className="col-lg-6 col-xs-12">
                      <div className="settings-subtitle">{this.state.edit_clinic_subheader}</div>
                      <div className="row">
                         <div className="col-sm-12 col-xs-12">
                            <div className="setting-field-outer">
                               <div className="new-field-label">{this.state.edit_clinic_Clinic_name}<span className="setting-require">*</span></div>
                               <div className="setting-input-outer"><input name="clinic_name" id="clinicname" className={this.state.clinic_name_Error === true ? "setting-input-box setting-input-box-invalid" :"setting-input-box"} autoComplete="off" placeholder="Clinic Name" maxLength="255" type="text" value={this.state.clinic_name} onChange={this.handleInputChange}/></div>
                            </div>
                         </div>
                         <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                               <div className="new-field-label">{this.state.edit_clinic_contact_no}<span className="setting-require">*</span></div>
                               <div className="setting-input-outer" >
                               {(this.state.isRender) && <IntlTelInput
                                  preferredCountries={['tw']}
                                  css={ ['intl-tel-input', (this.state.contactError === true ? "setting-input-box setting-input-box-invalid" :"setting-input-box")] }
                                  utilsScript={ 'libphonenumber.js' }
                                  defaultValue = {(this.state.contact_no) ? this.state.contact_no : ''}
                                  defaultCountry = {this.state.defaultCountry}
                                  fieldName='contact_no'
                                  onPhoneNumberChange={ this.phoneNumberChanged }
                                  onPhoneNumberBlur={ this.phoneNumberChanged }
                                  placeholder="Phone Number"
                                  pattern="[0-9]*"
                                  separateDialCode={`true`}
                                />}
                               </div>
                            </div>
                         </div>
                         <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                               <div className="new-field-label">{this.state.edit_clinic_time_zone}<span className="setting-require">*</span></div>
                               <div className="setting-input-outer">
                                  <select name="timezone" id="time_zone" onChange={this.handleInputChange}  className={this.state.timezone_Error === true ? "setting-input-box setting-input-box-invalid" :"setting-input-box"} placeholder="Timezone" value={this.state.timezone}>
                                     <option value="select">Select</option>
                                     {this.state.timezoneList !== undefined &&
                                     this.state.timezoneList.map((obj, idx) =>
                                     <option key={'timezoneList'+idx} value={obj.php_timezone} key={idx}>{obj.timezone}</option>
                                     )}
                                  </select>
                               </div>
                            </div>
                         </div>
                         <div className="col-sm-12 col-xs-12">
                            <div className="setting-field-outer">
                               <div className="new-field-label">{this.state.edit_clinic_address}<span className="setting-require">*</span></div>
                               <div className="setting-input-outer"><input name="address" id="address" className={this.state.address_Error === true ? "setting-input-box setting-input-box-invalid" :"setting-input-box"} onChange={this.handleInputChange} autoComplete="off" placeholder="Clinic Address" type="text" value={this.state.address}/></div>
                            </div>
                         </div>
                         <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                               <div className="new-field-label">{this.state.edit_clinic_city_state}<span className="setting-require">*</span></div>
                               <div className="setting-input-outer"><input name="city" id="city" className={this.state.city_Error === true ? "setting-input-box setting-input-box-invalid" : "setting-input-box"} onChange={this.handleInputChange} autoComplete="off" placeholder="City" maxLength="255" type="text" value={this.state.city}/></div>
                            </div>
                         </div>
                         <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                               <div className="new-field-label">{this.state.edit_clinic_country}<span className="setting-require">*</span></div>
                               <div className="setting-input-outer">
                                  <select onChange={this.handleInputChange} name="country_name" id="country_name" className={(this.state.country_Error)? "setting-select-box field_error" : "setting-select-box"} placeholder="Country" value={this.state.country_name}>
                                     <option value="select">Select Country</option>
                                     {this.state.countryList !== undefined &&
                                     this.state.countryList.map((obj, idx) =>
                                     <option value={obj.country_code} key={idx}>{obj.country_name}</option>
                                     )}
                                  </select>
                               </div>
                            </div>
                         </div>
                         <div className="col-sm-6 col-xs-12 notificationEmail">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.edit_clinic_notif_email}<span className="setting-require"></span></div>
                               <div className={this.state.multipleEmailClass}>
                                  <div className="multiple_emails-container" >
                                     <ul className={(this.state.notiEmailArr.length ? "multiple_emails-ul" : 'multiple_emails-ul no-display')}>
                                       {this.state.notiEmailArr.length && this.state.notiEmailArr.map((obj, idx) =>
                                          <li className="multiple_emails-email" key={idx}>
                                            <a href="javascript:void(0)" className="multiple_emails-close" data-emailid= {idx} onClick = {this.removeEmail.bind(this)} title="Remove">
                                              <i className="fas fa-times"></i>
                                            </a>
                                            <span className="email_name">{obj}</span>
                                          </li>
                                        )}
                                     </ul>
                                     <input type="text" name="appointment_notification_emails" className="multiple_emails-input text-left" value={this.state.appointment_notification_emails} autoComplete="off" onChange={this.handleInputChange} onBlur={this.onBlur}/>
                                  </div>
                               </div>
                            </div>
                          </div>
                         <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                               <div className="new-field-label">{this.state.edit_clinic_sms_notif_phone}<span className="setting-require"></span></div>
                               <div className="setting-input-outer">
                                  {(this.state.isRender) && <IntlTelInput
                                    preferredCountries={['tw']}
                                    css={ ['intl-tel-input', this.state.notiContactClass] }
                                    utilsScript={ 'libphonenumber.js' }
                                    defaultValue = {(this.state.sms_notifications_phone) ? this.state.sms_notifications_phone : ''}
                                    defaultCountry = {this.state.defaultCountry}
                                    fieldName='sms_notifications_phone'
                                    onPhoneNumberChange={ this.phoneNumberChanged1 }
                                    onPhoneNumberBlur={ this.phoneNumberChanged1 }
                                    placeholder="Phone Number"
                                    separateDialCode={`true`}
                                  />}
                               </div>
                            </div>
                         </div>
                         </div>
                            <div className="important-instruction m-t-10">{this.state.edit_clinic_sms_multiple_emails}</div>
                      </div>
                      <div className="col-lg-6 col-xs-12">
                      <div className="settings-subtitle">
                         {this.state.edit_clinic_tax_settings}
                      </div>
                      <div className="row">
                         <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                               <div className="new-field-label">{this.state.edit_clinic_tax_rate}<span className="setting-require">*</span></div>
                               <div className="setting-input-outer">
                                  <input name="tax" id="tax" className={this.state.tax_Error === true ? "setting-input-box setting-input-box-invalid" :"setting-input-box"} placeholder="Tax" type="text" onChange={this.handleInputChange} autoComplete="off" value={this.state.tax}/>
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="settings-subtitle m-b-60">{this.state.edit_clinic_business_hours}</div>
                      <div className="business-hours-outer">
                         <div className="row">
                            <div className="col-xs-4">&nbsp;</div>
                            <div className="col-xs-4">
                               <div className="new-field-label">{this.state.edit_clinic_open_hours}</div>
                            </div>
                            <div className="col-xs-4">
                               <div className="new-field-label">{this.state.edit_clinic_close_hours}</div>
                            </div>
                         </div>
                         {this.state.clinic_business_hours.map((obj, idx) =>{
                            let mainTimeId = idx+1;
                            return(
                             <div className="row datetimeparent" key={idx}>
                                <div className="col-xs-4">
                                   <input type="checkbox" className="new-check" id={"new-check"+mainTimeId} name={"day-"+mainTimeId} checked={this.state["day-"+mainTimeId]} data-day-index={mainTimeId} onChange={this.toggleTime} />
                                   <label className="setting-week" htmlFor={"new-check"+mainTimeId} >{obj}</label>
                                </div>
                                <div className={this.state['disableClass_'+mainTimeId]}>
                                   <div className="col-xs-4">
                                  {this.state["from_time_"+mainTimeId] !== undefined &&
                                      <InputMask  name={"from_time_"+mainTimeId} mask="99:99" className={this.state['from_time_class_'+mainTimeId]} placeholder="00:00" value={this.state["from_time_"+mainTimeId]} onChange={this.handleInputChange} maskChar="" beforeMaskedValueChange={this.maskChange} />
                                  }
                                      <select className={this.state['from_hours_format_'+mainTimeId]}  name={"from_ampm_"+mainTimeId} onChange={this.handleInputChange} value={this.state["from_ampm_"+mainTimeId]}>
                                         <option value="AM">AM</option>
                                         <option value="PM">PM</option>
                                      </select>
                                   </div>
                                   <div className="col-xs-4">
                                   {this.state["to_time_"+mainTimeId] !== undefined &&
                                      <InputMask  name={"to_time_"+mainTimeId} mask="99:99" className={this.state['to_time_class_'+mainTimeId]} placeholder="00:00" value={this.state["to_time_"+mainTimeId]} onChange={this.handleInputChange} maskChar="" beforeMaskedValueChange={this.maskChange} />
                                    }

                                      <select className={this.state['to_hours_format_'+mainTimeId]} name={"to_ampm_"+mainTimeId} onChange={this.handleInputChange} value={this.state["to_ampm_"+mainTimeId]}>
                                         <option value="AM">AM</option>
                                         <option value="PM">PM</option>
                                      </select>
                                   </div>
                                </div>
                             </div>
                             )
                         }
                         )}
                      </div>

                    <div className={(this.state.showModal ? 'overlay' : '')}></div>
                      <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                        <div className="modal-dialog">
                          <div className="modal-content">
                            <div className="modal-header">
                              <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                              <h4 className="modal-title" id="model_title">{this.state.delete_confirmation}{this.state.showModal}</h4>
                            </div>
                            <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                              {this.state.clinic_delete_warning}
                            </div>
                            <div className="modal-footer" >
                              <div className="col-md-12 text-left" id="footer-btn">

                                <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.no_option}</button>
                                <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteClinic}>{this.state.yes_option}</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
             <div className={(this.state.productPricePop) ? "modalOverlay": "modalOverlay no-display"}>
              <div className="small-popup-outer appointment-detail-main">
                <div className="small-popup-header">
                  <div className="popup-name">{this.state.settings_price_of_products_msg}</div>
                  <a onClick={() => {this.setState({productPricePop: !this.state.productPricePop}); this.props.history.push(`/settings/clinic/create`);}} className="small-cross">×</a>
                </div>
                <div className="small-popup-content">
                  <div className="juvly-container no-padding-bottom">

                    <div className="juvly-subtitle">{this.state.settings_you_are_adding} - {this.state.clinic_name}</div>
                    <div className="row">
                      <div className="col-xs-12">
                        <div className="setting-field-outer">

                        </div>
                      </div>
                      <div className="col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.settings_plz_select_how_u}</div>
                          <div className="new-field-label"></div>
                          <div className="basic-checkbox-outer">
                            <input id="radiobutton1" className="basic-form-checkbox" name="apply_clinic" type="radio" value={"false"} onChange={this.handleInputChange} checked={(this.state.apply_clinic == "false") ? 'checked' :  false} />
                            <label className="basic-form-text" htmlFor="radiobutton1">{this.state.settings_i_dont_want}</label>
                          </div>
                          <div className="new-field-label"></div>
                          <div className="basic-checkbox-outer">
                          <input id="radiobutton2" className="basic-form-checkbox" name="apply_clinic" type="radio" value={"true"} onChange={this.handleInputChange} checked={(this.state.apply_clinic == "true") ? 'checked' :  false} />
                          <label className="basic-form-text" htmlFor="radiobutton2">{this.state.settings_copy_price}</label>
                          </div>
                        </div>
                        <div className={(this.state.apply_clinic == "false") ? "setting-field-outer no-display" : "setting-field-outer"}>
                           <div className="new-field-label">{this.state.settings_clinic}<span className="setting-require">*</span></div>
                             <div className="setting-input-outer">
                                <select name="appliedClinicId" id="time_zone" onChange={this.handleInputChange}  className={this.state.appliedClinicIdError === true ? "setting-input-box setting-input-box-invalid" :"setting-input-box"} value={this.state.appliedClinicId}>
                                   <option value="select">{this.state.settings_select}</option>
                                   {this.state.clinicList !== undefined &&
                                   this.state.clinicList.map((obj, idx) =>
                                   <option value={obj.id} key={"clinics-"+idx}>{obj.clinic_name}</option>
                                   )}
                                </select>
                             </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="footer-static">
                  <a  className="new-blue-btn pull-right" onClick={this.createClinicNow}>{this.state.user_save_btn_text}</a>
                </div>
              </div>
            </div>
             <div className="footer-static">
              {(this.state.id > 0 && this.state.userType ==  "superadmin") &&
                <a href="javascript:void(0)" className="new-red-btn pull-left confirm-model" onClick={this.showDeleteModal}>{this.state.edit_clinic_delete_button}</a>
              }
                <button type="button" id="save_clinic" className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.saveBtn}</button>
                <Link to="/settings/clinics" className="new-white-btn pull-right cancelAction">
                {this.state.editUsers_CancelBtn}</Link>

                <div className={(this.state.showTimeZoneModal ? 'overlay' : '')}></div>
                  <div id="filterModal" role="dialog" className={(this.state.showTimeZoneModal ? 'modal fade in displayBlock' : 'modal fade')}>
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <button type="button" className="close" data-dismiss="modal" onClick={this.dismissTimeZoneModal}>×</button>
                          <h4 className="modal-title" id="model_title">{this.state.delete_confirmation}{this.state.showModal}</h4>
                        </div>
                        <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                          {this.state.setting_clinic_timezone_change_msg_confirmation}
                        </div>
                        <div className="modal-footer" >
                          <div className="col-md-12 text-left" id="footer-btn">
                            <button type="button" className="btn btn-success pull-right " data-dismiss="modal" onClick={this.handleFormSubmit.bind(this, this.state.business_hours)}>{this.state.yes_option}</button>
                            <button type="button" className="btn  logout pull-right m-r-10" data-dismiss="modal" onClick={this.dismissTimeZoneModal}>{this.state.label_cancel}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

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
    </div>
    );
   }
 }
 function mapStateToProps(state){
   const languageData = JSON.parse(localStorage.getItem('languageData'));
   const returnState = {};
   if (state.ClinicReducer.action === "SELECTED_CLINIC_LIST") {
     if(state.ClinicReducer.data.status != 200) {
       toast.dismiss()
       toast.error(languageData.global[state.ClinicReducer.data.message]);
       returnState.showLoader = false
     } else {
       returnState.clinicData = state.ClinicReducer.data;
     }
   } else if (state.ClinicReducer.action === "CREATE_CLINIC") {
     if(state.ClinicReducer.data.status != 201){
        returnState.user = state.ClinicReducer.data;
        returnState.showLoader = false
        toast.dismiss()
        toast.error(languageData.global[state.ClinicReducer.data.message]);
      }
      else {
        returnState.redirect = true;
        returnState.message = languageData.global[state.ClinicReducer.data.message];
      }
     }
   else if(state.ClinicReducer.action === 'UPDATE_SELECTED_CLINIC') {
       if (state.ClinicReducer.data.status != 200) {
         toast.dismiss()
          toast.error(languageData.global[state.ClinicReducer.data.message]);
          returnState.showLoader = false
        }
        else {
          returnState.redirect = true;
          returnState.message = languageData.global[state.ClinicReducer.data.message];
        }
      return returnState;
   } else if (state.ClinicReducer.action === "TIMEZONE_LIST") {
      if(state.ClinicReducer.data.status != 200){
        returnState.showLoader = false
      }
      else {
        returnState.timezoneList = state.ClinicReducer.data;
      }
   } else if (state.ClinicReducer.action === "COUNTRIES_LIST") {
      if(state.ClinicReducer.data.status != 200){
        returnState.showLoader = false
      }
      else {
        returnState.countryList = state.ClinicReducer.data;
      }
   } else if (state.ClinicReducer.action === "DEFAULT_CLINIC_DATA") {
      if(state.ClinicReducer.data.status != 200){
        returnState.showLoader = false
      }
      else {
        returnState.defaultClinicData = state.ClinicReducer.data;
      }
   } else if(state.ClinicReducer.action === 'DELETE_CLINIC') {
     if(state.ClinicReducer.data.status != 200){
       returnState.showLoader = false
     }
     else {
       returnState.redirect = true;
       returnState.message = languageData.global[state.ClinicReducer.data.message];
     }
   }
   else if (state.CommonReducer.action === "GET_TRACK_HEAP_EVENT") {
     if(state.CommonReducer.data.status != 201){
        returnState.message = languageData.global[state.CommonReducer.data.message];
      }
     }
  return returnState;
}

 function mapDispatchToProps(dispatch)
{
  return bindActionCreators({
    fetchSelectedClinic:fetchSelectedClinic,
    createClinic:createClinic,
    updateSelectedClinic:updateSelectedClinic,
    fetchAllTimezone:fetchAllTimezone,
    fetchAllCountries:fetchAllCountries,
    deleteClinic: deleteClinic,
    fetchDefaultClinicData: fetchDefaultClinicData,
    geCommonTrackEvent: geCommonTrackEvent,
    exportEmptyData:exportEmptyData
  }, dispatch)
}

 export default connect(mapStateToProps,mapDispatchToProps) (CreateEditClinics);
