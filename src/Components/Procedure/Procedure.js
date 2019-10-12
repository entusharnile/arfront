import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import { checkIfPermissionAllowed, numberFormat, formatBytes } from '../../Utils/services.js';
import axios from 'axios';
import config from '../../config';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import {getProcedureData, getApptConsultData, saveProcedure, updateProcedure, getAssociatedClinics, deleteProcedure, emptyProcedureReducer} from '../../Actions/Procedures/procedureActions.js';
import Select from 'react-select';
import { displayName, showFormattedDate, getTimeFormat } from '../../Utils/services.js';
import { setHours, setMinutes } from 'date-fns';
import crossImage from '../../images/close.png';
import defLogo from '../../images/appmale.png';

const procedureInstance = axios.create();
procedureInstance.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error) {
   if(!error.response) {
      return {data : {data : "", message : "file_type_error", status : 400}}
   }
});

const formatType = 'YYYY/MM/DD hh:mm A';

const dateFormat = (date) => {
  return moment(date).format(formatType);
}

let apptServiceData = ''
let clinicsOpt      = ''
let curObj          = ''

class Procedure extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType           : (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      clientID              : this.props.match.params.clientID,
      procedureID           : (this.props.match.params.procedureID) ? this.props.match.params.procedureID : 0,
      globalLang            : languageData.global,
      fileReader            : '',
      showLoader            : false,
      showDatePicker        : false,
      procedureData         : [],
      selectedQuestionnaireOptions  : [],
      questionnaireOptions          : [],
      selectedConsentsOptions       : [],
      consentsOptions               : [],
      type                          : 'face',
      providerClass                 : 'setting-select-box',
      clinicClass                   : 'setting-select-box',
      areaClass                     : 'setting-select-box',
      pronameClass                  : 'setting-input-box',
      procedure_name                : '',
      showModal                     : false,
      procedure_date                : dateFormat(new Date()),
      associatedClinics             : [],
      languageData                  : languageData.clients,
      serviceClass                  : 'setting-select-box'
      // selected_date                 : new Date()
    }

    this.props.emptyProcedureReducer({});
  }

  handleUpload = (targetName) => {
    let uploadtype = '';

    uploadtype = (targetName === 'signature_image') ? 'patient_signatures' : 'procedure_image'
    const data = new FormData()
    data.append('file', this.state.file, this.state.file.name)
    let endpoint = config.API_URL + `media/upload?upload_type=${uploadtype}`;

    axios.post(endpoint, data).then(res => {
      let name      = this.state.target.name
      this.setState({[name]: res.data.data.file_name, showLoader: false});
    }).catch(error => {
      this.setState({showLoader: false});
      toast.error(error.response.data.message);
    })
  }

  handleFileRead = (e) => {
    const content     = this.state.fileReader.result;
    let name      = this.state.target.name + '_thumbnail'
    let src       = this.state.target.name + '_src'
    let size      = this.state.target.name + '_size'

    let fileSize  = formatBytes(this.state.file.size, 1)
    this.setState({[name]: this.state.file.name, [size]: fileSize, [src] : this.state.fileReader.result, showLoader: true});

    this.handleUpload(this.state.target.name)
  }

  handleFileChosen = (file, target) => {
    this.state.fileReader           = new FileReader();
    this.state.fileReader.onloadend = this.handleFileRead;
    this.state.fileReader.readAsDataURL(file);
    this.state.file = file
    this.state.target = target
  }

  handleInputChange = event => {
    const target  = event.target;
    const value   = target.type === 'checkbox' ? target.checked : target.value;
    let name      = event.target.name

    if ( target && target.type === 'file' ) {
      const allowedTypes  = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/gif","image/GIF"];

      if ( target.files && allowedTypes.indexOf(target.files[0].type) > -1 ) {
        this.handleFileChosen(target.files[0], target)
      } else {
        toast.error('This file type is not allowed');
      }
    } else {
      this.setState({[event.target.name]: value , dataChanged : true});
    }

    if ( name === 'appointment_id' ) {
      this.getApptData(value)
    }
    if ( name === 'user_id' ) {
      this.getAssociatedClinics(value)
    }
  }

  componentWillUnmount() {
    this.props.emptyProcedureReducer({});
    document.removeEventListener('click', this.handleClick, false);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick, false);

    this.setState({showLoader: true})
    this.props.getProcedureData(this.state.clientID, this.state.procedureID)
  }

  handleClick = (e) =>  {
    if (!this.refDatePickerContainer.contains(e.target)) {
      this.refDatePicker.setOpen(false);
      this.setState({showDatePicker:false})
    }
  }

  handleDatePicker = (date) => {
    this.setState({procedure_date: dateFormat(date), selected_date: date, showDatePicker:false, dataChanged: true});
    this.refDatePicker.setOpen(false);
  }

  resetDatePicker = () => {
    this.setState({procedure_date: null, selected_date: null, showDatePicker: true, dataChanged: true});
  }

  blurDatePicker = (date) => {
    this.refDatePicker.setOpen(true);
    this.setState({showDatePicker:true, dataChanged: true});
  }

  toggleDatePicker = () => {
    this.setState({showDatePicker: true});
    this.refDatePicker.setFocus(true);
    this.refDatePicker.setOpen(true);
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.procedureData !== undefined && props.procedureData.status === 200 && props.procedureData.data !== state.procedureData ) {

      let questionnaireOptions = [];

      if ( props.procedureData.data.questionnaires && props.procedureData.data.questionnaires.length > 0 ) {
        questionnaireOptions = props.procedureData.data.questionnaires.map((obj, idx) => {
          return {value: obj.id, label: obj.consultation_title}
        })
      }

      let consentsOptions = [];

      if ( props.procedureData.data.consents && props.procedureData.data.consents.length > 0 ) {
        consentsOptions = props.procedureData.data.consents.map((obj, idx) => {
          return {value: obj.id, label: obj.consent_name}
        })
      }
      return {
        procedureData         : props.procedureData.data,
        showLoader            : false,
        questionnaireOptions  : questionnaireOptions,
        consentsOptions       : consentsOptions,
        associatedClinics      : []
      }
    }

    if ( props.apptConsultData !== undefined && props.apptConsultData.status === 200 && props.apptConsultData.data !== state.apptConsultData ) {
      return {
        showLoader            : false,
        apptConsultData       : props.apptConsultData.data,
        user_id               : (props.apptConsultData.data && props.apptConsultData.data.associated_clinic) ? props.apptConsultData.data.associated_clinic[0].provider_id : 0,
        clinic_id             : (props.apptConsultData.data && props.apptConsultData.data.selected_clinic_id) ? props.apptConsultData.data.selected_clinic_id : 0,
      }
    }

    if ( props.saveProData !== undefined && props.saveProData.status === 200 && props.saveProData.data !== state.saveProData ) {
       return {
         saveProData  : props.saveProData.data,
         saveMessage  : props.saveProData.message
       }

     } else if ( props.saveProData !== undefined && props.saveProData.status !== 200 && props.saveProData.data !== state.saveProData ) {
       return {
         showLoader   : false,
         saveProData  : props.saveProData.data,
         saveMessage  : ''
       }
     }

     if ( props.updateProData !== undefined && props.updateProData.status === 200 && props.updateProData.data !== state.updateProData ) {
        return {
          updateProData  : props.updateProData.data,
          updateMessage  : props.updateProData.message
        }

      } else if ( props.updateProData !== undefined && props.updateProData.status !== 200 && props.updateProData.data !== state.updateProData ) {
        return {
          showLoader     : false,
          updateProData  : props.updateProData.data,
          updateMessage  : ''
        }
      }

      if ( props.associatedClinics !== undefined && props.associatedClinics.status === 200 && props.associatedClinics.data.all_clinics !== state.associatedClinics ) {
        return {
          showLoader        : false,
          associatedClinics : props.associatedClinics.data.all_clinics,
          clinic_id         : (state.procedureData && state.procedureData.procedure_details && state.procedureData.procedure_details.clinic_id) ? state.procedureData.procedure_details.clinic_id : (props.associatedClinics.data.default_clinic_id) ? props.associatedClinics.data.default_clinic_id : (props.associatedClinics.data.all_clinics && props.associatedClinics.data.all_clinics.length > 0) ? props.associatedClinics.data.all_clinics[0].id : 0,
          apptConsultData   : undefined
        }
      }

      if ( props.deleteProData !== undefined && props.deleteProData.status === 200 && props.deleteProData.data !== state.deleteProData ) {
         return {
           deleteProData  : props.deleteProData.data,
           deleteMessage  : props.deleteProData.message
         }

       } else if ( props.deleteProData !== undefined && props.deleteProData.status !== 200 && props.deleteProData.data !== state.deleteProData ) {
         return {
           showLoader     : false,
           deleteProData  : props.deleteProData.data,
           deleteMessage  : ''
         }
       }

    return null
  }

  componentDidUpdate = (prevProps, prevState) => {
    if ( this.state.saveProData !== null && this.state.saveProData !== '' && this.state.saveProData !== prevState.saveProData && this.state.saveMessage !== null && this.state.saveMessage !== '' ) {
      toast.success(this.state.globalLang[this.state.saveMessage])
      curObj = this

      if ( curObj.props.match.params.actionType && curObj.props.match.params.actionType === 'clients' ) {
        curObj.props.history.push((curObj.props.match.params.type) ? "/" + curObj.state.backURLType + "/" + curObj.props.match.params.type + "/" + curObj.props.match.params.clientID  : "/" + curObj.state.backURLType);
      }

    }

    if ( this.state.updateProData !== null && this.state.updateProData !== '' && this.state.updateProData !== prevState.updateProData && this.state.updateMessage !== null && this.state.updateMessage !== '' ) {
      toast.success(this.state.globalLang[this.state.updateMessage])
      curObj = this

      if ( curObj.props.match.params.actionType && curObj.props.match.params.actionType === 'clients' ) {
        curObj.props.history.push((curObj.props.match.params.type) ? "/" + curObj.state.backURLType + "/" + curObj.props.match.params.type + "/" + curObj.props.match.params.clientID  : "/" + curObj.state.backURLType);
      }
    }

    if ( this.state.procedureData && this.state.procedureData !== prevState.procedureData ) {
      if ( this.state.procedureID ) {
        if ( this.state.procedureData && this.state.procedureData.procedure_details ) {
          if ( this.state.procedureData.procedure_details.appointment_id ) {
            this.showServices(this.state.procedureData.procedure_details.appointment_id)
          }
          //this.reRenderClinics(this.state.procedureData.procedure_details.appointment_id)
          this.getAssociatedClinics(this.state.procedureData.procedure_details.user_id)

          let questionnaireOptions = [];
          let consentsOptions      = [];

          if ( this.state.procedureData.procedure_details && this.state.procedureData.procedure_details.procedure_questionnaries && this.state.procedureData.procedure_details.procedure_questionnaries.length > 0 ) {
            questionnaireOptions = this.state.procedureData.procedure_details.procedure_questionnaries.map((obj, idx) => {
              if ( obj.questionnaire ) {
                return {value: obj.questionnaire.id, label: obj.questionnaire.consultation_title}
              }
            })
          }

          if ( this.state.procedureData.procedure_details && this.state.procedureData.procedure_details.signature_consent && this.state.procedureData.procedure_details.signature_consent.length > 0 ) {
            consentsOptions = this.state.procedureData.procedure_details.signature_consent.map((obj, idx) => {
              if ( obj && obj.consent ) {
                return {value: obj.consent.id, label: obj.consent.consent_name}
              }
            })
          }

          this.setState({
            appointment_id: this.state.procedureData.procedure_details.appointment_id,
            service_id: this.state.procedureData.procedure_details.service_id,
            user_id: this.state.procedureData.procedure_details.user_id,
            clinic_id: this.state.procedureData.procedure_details.clinic_id,
            type: this.state.procedureData.procedure_details.type,
            procedure_name: this.state.procedureData.procedure_details.procedure_name,
            procedure_date: dateFormat(this.state.procedureData.procedure_details.procedure_date),
            selectedQuestionnaireOptions: questionnaireOptions,
            selectedConsentsOptions     : consentsOptions,
            patient_image_front_src: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_front_thumb_url : '',
            patient_image_front: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_front : '',

            procedure_image_45_src: (this.state.procedureData.procedure_details) ? this.state.procedureData.procedure_details.procedure_image_45_thumb_url : '',
            procedure_image_45: (this.state.procedureData.procedure_details) ? this.state.procedureData.procedure_details.procedure_image_45 : '',

            patient_image_left_45_src: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_left_45_thumb_url : '',
            patient_image_left_45: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_left_45 : '',
            patient_image_right_45_src: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_right_45_thumb_url : '',
            patient_image_right_45: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_right_45 : '',

            procedure_image_src: (this.state.procedureData.procedure_details) ? this.state.procedureData.procedure_details.procedure_image_thumb_url : '',
            procedure_image: (this.state.procedureData.procedure_details) ? this.state.procedureData.procedure_details.procedure_image : '',

            patient_image_left_src: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_left_thumb_url : '',
            patient_image_left: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_left : '',
            patient_image_right_src: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_right_thumb_url : '',
            patient_image_right: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_right : '',
            patient_image_back_src: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_back_thumb_url : '',
            patient_image_back: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_back : '',
            patient_image_back_left_45_src: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_back_left_45_thumb_url : '',
            patient_image_back_left_45: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_back_left_45 : '',

            patient_image_back_right_45_src: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_back_right_45_thumb_url : '',
            patient_image_back_right_45: (this.state.procedureData.procedure_details.procedure_image_data) ? this.state.procedureData.procedure_details.procedure_image_data.patient_image_back_right_45 : '',

            signature_image_src: (this.state.procedureData.procedure_details.signature_image_data) ? this.state.procedureData.procedure_details.signature_image_data.signature_thumb_image_url : '',
            signature_image: (this.state.procedureData.procedure_details.signature_image_data) ? this.state.procedureData.procedure_details.signature_image_data.signature_image : '',


            patient_ai_image_left_45_src: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_left_45_thumb_url : '',
            patient_ai_image_right_45_src: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_right_45_thumb_url : '',
            patient_ai_image_front_src: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_front_thumb_url : '',
            patient_ai_image_left_src: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_left_thumb_url : '',
            patient_ai_image_right_src: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_right_thumb_url : '',
            patient_ai_image_back_src: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_back_thumb_url : '',
            patient_ai_image_back_left_45_src: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_back_left_45_thumb_url : '',
            patient_ai_image_back_right_45_src: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_back_right_45_thumb_url : '',


            patient_ai_image_left_45: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_left_45 : '',
            patient_ai_image_right_45: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_right_45 : '',
            patient_ai_image_front: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_front : '',
            patient_ai_image_left: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_left : '',
            patient_ai_image_right: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_right : '',
            patient_ai_image_back: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_back : '',
            patient_ai_image_back_left_45: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_back_left_45 : '',
            patient_ai_image_back_right_45: (this.state.procedureData.procedure_details.procedure_after_photos) ? this.state.procedureData.procedure_details.procedure_after_photos.patient_image_back_right_45 : '',

            // 'patient_image_left_45'      : this.state.patient_ai_image_left_45,
            // 'patient_image_right_45'     : this.state.patient_ai_image_right_45,
            // 'patient_image_front'        : this.state.patient_ai_image_front,
            // 'patient_image_left'         : this.state.patient_ai_image_left,
            // 'patient_image_right'        : this.state.patient_ai_image_right,
            // 'patient_image_back'         : this.state.patient_ai_image_back,
            // 'patient_image_back_left_45' : this.state.patient_ai_image_back_left_45,
            // 'patient_image_back_right_45': this.state.patient_ai_image_back_right_45,
         })
        }
      }
    }

    if ( this.state.deleteProData !== null && this.state.deleteProData !== '' && this.state.deleteProData !== prevState.deleteProData && this.state.deleteMessage !== null && this.state.deleteMessage !== '' ) {
      toast.success(this.state.globalLang[this.state.deleteMessage])
      curObj = this

      if ( curObj.props.match.params.actionType && curObj.props.match.params.actionType === 'clients' ) {
        curObj.props.history.push((curObj.props.match.params.type) ? "/" + curObj.state.backURLType + "/" + curObj.props.match.params.type + "/" + curObj.props.match.params.clientID  : "/" + curObj.state.backURLType);
      }
    }
  }

  handleQuestionChange = (selectedQuestionnaireOptions) => {
    this.setState({
      selectedQuestionnaireOptions : selectedQuestionnaireOptions,
      dataChanged                  : true
    });
  }

  handleConsentChange = (selectedConsentsOptions) => {
    this.setState({
      selectedConsentsOptions : selectedConsentsOptions,
      dataChanged             : true
    })
  }

  getAssociatedClinics = (value) => {
    if ( value > 0 ) {
      this.props.getAssociatedClinics(value);
      this.setState({showLoader: true})
    }
  }

  getApptData = (value) => {
    if ( value > 0 ) {
      let formData = {
        appointment_id  : value,
        patient_id      : this.state.clientID,
        service_id      : 0
      }

      this.props.getApptConsultData(formData);
      this.showServices(value);
      this.reRenderClinics(value)
      this.setState({showLoader: true})
    } else {
      this.setState({
        serviceClass: 'setting-select-box'
      });
      apptServiceData = ''
    }
  }

  showServices = (appointmentID) => {
    if (appointmentID) {
      if ( this.state.procedureData && this.state.procedureData.appointmentServices )  {
        let serviceOfAppt = []
        serviceOfAppt     = (this.state.procedureData.appointmentServices[appointmentID]) ? this.state.procedureData.appointmentServices[appointmentID] : []

        if ( serviceOfAppt && serviceOfAppt.length > 0 ) {
          apptServiceData = serviceOfAppt.map((obj, idx) => {
            return <option key={idx} value={obj.service.id}>{obj.service.name}</option>
          })
        }
      }
    }
  }

  reRenderClinics = () => {
    if ( this.state.procedureData && this.state.procedureData.clinics && this.state.procedureData.clinics.length > 0 ) {
      clinicsOpt = this.state.procedureData.clinics.map((obj, idx) => {
        return <option key={idx} value={obj.id}>{obj.clinic_name}</option>
      })
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();

    let isFormValid = false;

    if ( this.state.appointment_id && this.state.appointment_id > 0 ) {
      if ( !this.state.service_id || this.state.service_id == 0 ) {
        this.setState({
          serviceClass: 'setting-select-box setting-input-box-invalid'
        });
        isFormValid = false;
      } else {
        this.setState({
          serviceClass: 'setting-select-box'
        });
      }
    } else {
      this.setState({
        serviceClass: 'setting-select-box'
      });
    }

    if (typeof this.state.user_id === 'undefined' || this.state.user_id === null || this.state.user_id === '' || this.state.user_id === '0') {
      this.setState({
        providerClass: 'setting-select-box setting-input-box-invalid'
      })
    } else if (this.state.user_id) {
      this.setState({
        providerClass: 'setting-select-box'
      })
    }

    if (typeof this.state.clinic_id === 'undefined' || this.state.clinic_id === null || this.state.clinic_id === '' || this.state.clinic_id === '0') {
      this.setState({
        clinicClass: 'setting-select-box setting-input-box-invalid'
      })
    } else if (this.state.clinic_id) {
      this.setState({
        clinicClass: 'setting-select-box'
      })
    }

    if (typeof this.state.type === 'undefined' || this.state.type === null || this.state.type === '' || this.state.type === '0') {
      this.setState({
        areaClass: 'setting-select-box setting-input-box-invalid'
      })
    } else if (this.state.type) {
      this.setState({
        areaClass: 'setting-select-box'
      })
    }

    if (typeof this.state.procedure_name === 'undefined' || this.state.procedure_name === null || this.state.procedure_name === '') {
      this.setState({
        pronameClass: 'setting-input-box setting-input-box-invalid'
      })
    } else if (this.state.procedure_name) {
      this.setState({
        pronameClass: 'setting-input-box'
      })
    }

    if (this.state.selectedConsentsOptions && this.state.selectedConsentsOptions.length > 0 ) {
      if ( !this.state.signature_image ) {
        toast.error('Signature image is required')
        isFormValid = false
      } else {
        isFormValid = true
      }
    } else {
      isFormValid = true
    }

    if ( this.state.user_id && this.state.clinic_id && this.state.type && this.state.procedure_name && isFormValid ) {
      let consentIDS  = []
      let questionIDS = []

      if (this.state.selectedConsentsOptions && this.state.selectedConsentsOptions.length > 0 ) {
        this.state.selectedConsentsOptions.map((obj, idx) => {
          consentIDS.push(obj.value)
        })
      }

      if (this.state.selectedQuestionnaireOptions && this.state.selectedQuestionnaireOptions.length > 0 ) {
        this.state.selectedQuestionnaireOptions.map((obj, idx) => {
          questionIDS.push(obj.value)
        })
      }

      let formData = {
        'procedure' : {
           'appointment_id'     : this.state.appointment_id,
           'service_id'         : this.state.service_id,
           'user_id'            : this.state.user_id,
           'clinic_id'          : this.state.clinic_id,
           'type'               : this.state.type,
           'procedure_name'     : this.state.procedure_name,
           'procedure_date'     : this.state.procedure_date,
           'procedure_image_45' : this.state.procedure_image_45,
           'procedure_image'    : this.state.procedure_image,
           'patient_id'         : this.state.clientID
        },
        'procedure_images' : {
           'patient_image_front'        : this.state.patient_image_front,
           'patient_image_left_45'      : this.state.patient_image_left_45,
           'patient_image_right_45'     : this.state.patient_image_right_45,
           'patient_image_left'         : this.state.patient_image_left,
           'patient_image_right'        : this.state.patient_image_right,
           'patient_image_back'         : this.state.patient_image_back,
           'patient_image_back_left_45' : this.state.patient_image_back_left_45,
           'patient_image_back_right_45': this.state.patient_image_back_right_45,
         },
         'procedure_after_photo' : {
            'patient_image_left_45'      : this.state.patient_ai_image_left_45,
            'patient_image_right_45'     : this.state.patient_ai_image_right_45,
            'patient_image_front'        : this.state.patient_ai_image_front,
            'patient_image_left'         : this.state.patient_ai_image_left,
            'patient_image_right'        : this.state.patient_ai_image_right,
            'patient_image_back'         : this.state.patient_ai_image_back,
            'patient_image_back_left_45' : this.state.patient_ai_image_back_left_45,
            'patient_image_back_right_45': this.state.patient_ai_image_back_right_45,
          },
       'signature_consents' : {
          'consent_ids'       : consentIDS,
          'signature_image'   : this.state.signature_image

        },
       'questionnaires_ids'   : questionIDS

      }

      if ( this.state.patient_ai_image_left_45 === null || this.state.patient_ai_image_left_45 === '' ) {
        delete formData.procedure_after_photo.patient_image_left_45;
      }

      if ( this.state.patient_ai_image_right_45 === null || this.state.patient_ai_image_right_45 === '' ) {
        delete formData.procedure_after_photo.patient_image_right_45;
      }

      if ( this.state.patient_ai_image_front === null || this.state.patient_ai_image_front === '' ) {
        delete formData.procedure_after_photo.patient_image_front;
      }

      if ( this.state.patient_ai_image_left === null || this.state.patient_ai_image_left === '' ) {
        delete formData.procedure_after_photo.patient_image_left;
      }

      if ( this.state.patient_ai_image_right === null || this.state.patient_ai_image_right === '' ) {
        delete formData.procedure_after_photo.patient_image_right;
      }

      if ( this.state.patient_ai_image_back === null || this.state.patient_ai_image_back === '' ) {
        delete formData.procedure_after_photo.patient_image_back;
      }

      if ( this.state.patient_ai_image_back_left_45 === null || this.state.patient_ai_image_back_left_45 === '' ) {
        delete formData.procedure_after_photo.patient_image_back_left_45;
      }

      if ( this.state.patient_ai_image_back_right_45 === null || this.state.patient_ai_image_back_right_45 === '' ) {
        delete formData.procedure_after_photo.patient_image_back_right_45;
      }


      if ( consentIDS.length === 0 ) {
        delete formData.signature_consents.consent_ids
      }

      if ( questionIDS.length === 0 ) {
        delete formData.questionnaires_ids
      }

      if ( typeof this.state.procedure_image === null || this.state.procedure_image === '' || this.state.procedure_image === null ) {
        //delete formData.procedure.procedure_image
      }

      if ( this.state.procedure_image_45 === null || this.state.procedure_image_45 === '' ) {
        //delete formData.procedure.procedure_image_45
      }

      if ( this.state.patient_image_front === null || this.state.patient_image_front === '' ) {
        delete formData.procedure_images.patient_image_front
      }

      if ( this.state.patient_image_left_45 === null || this.state.patient_image_left_45 === '' ) {
        delete formData.procedure_images.patient_image_left_45
      }

      if ( this.state.patient_image_right_45 === null || this.state.patient_image_right_45 === '' ) {
        delete formData.procedure_images.patient_image_right_45
      }

      if ( this.state.patient_image_left === null || this.state.patient_image_left === '' ) {
        delete formData.procedure_images.patient_image_left
      }

      if ( this.state.patient_image_right === null || this.state.patient_image_right === '' ) {
        delete formData.procedure_images.patient_image_right
      }

      if ( this.state.patient_image_back === null || this.state.patient_image_back === '' ) {
        delete formData.procedure_images.patient_image_back
      }

      if ( this.state.patient_image_back_left_45 === null || this.state.patient_image_back_left_45 === '' ) {
        delete formData.procedure_images.patient_image_back_left_45
      }

      if ( this.state.patient_image_back_right_45 === null || this.state.patient_image_back_right_45 === '' ) {
        delete formData.procedure_images.patient_image_back_right_45
      }

      if ( this.state.procedureID ) {
        this.props.updateProcedure(formData, this.state.procedureID);
      } else {
        this.props.saveProcedure(formData);
      }

      this.setState({showLoader: true})
    }
  }

  showDelProModal = () => {
    if (this.state.procedureID) {
      this.setState({showModal: true})
    }
  }

  dismissModal = () => {
    this.setState({showModal: false})
  }

  deleteProcedure = () => {
    if ( this.state.clientID && this.state.procedureID ) {
      this.setState({showLoader: true, showModal: false})

      this.props.deleteProcedure(this.state.clientID, this.state.procedureID)
    }
  }

  removeThisImage = (image) =>{
    if (image) {
      let imageSrc  = image + '_src';
      let imageSize = image + '_size';
      let thumbnail = image + '_thumbnail';

      this.setState({[image]: null, [imageSrc]: null, [imageSize]: null, [thumbnail]: null});
    }
  }

  render() {
    let returnTo      = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {

    }

    //let defLogo       = (this.state.procedureID) ? "../../../../../images/appmale.png" : "../../../../images/appmale.png";

    let apptOptData   = '';

    let patientName   = (this.state.procedureData && this.state.procedureData.patient) ? displayName(this.state.procedureData.patient) : ''

    if ( this.state.procedureData && this.state.procedureData.appointments && this.state.procedureData.appointments.length > 0 )  {
      apptOptData = this.state.procedureData.appointments.map((obj, idx) => {

        let apptDateTime = showFormattedDate(obj.appointment_datetime, true)
        return <option key={idx} value={obj.id}>{patientName + ' - ' + apptDateTime}</option>
      })
    }

    let providerApptOpt = '';

    if ( this.state.procedureData && this.state.procedureData.doctors && this.state.procedureData.doctors.length > 0 )  {
      providerApptOpt = this.state.procedureData.doctors.map((obj, idx) => {
        let providerName  = displayName(obj)
        return <option key={idx} value={obj.id}>{providerName}</option>
      })
    }

    //let crossImage = (this.state.procedureID) ? '../../../../../images/close.png' : '../../../../images/close.png';
    if ( this.state.associatedClinics && this.state.associatedClinics.length > 0 ) {
      clinicsOpt = this.state.associatedClinics.map((obj, idx) => {
        return <option key={idx} value={obj.id}>{obj.clinic_name}</option>
      })
    } else {
      clinicsOpt = "";
    }

    if ( this.state.apptConsultData && this.state.apptConsultData.associated_clinic && this.state.apptConsultData.associated_clinic.length > 0 ) {
      clinicsOpt = this.state.apptConsultData.associated_clinic.map((obj, idx) => {
        return <option key={idx} value={obj.clinic.id}>{obj.clinic.clinic_name}</option>
      })
    }

    let proType         = '';
    let backImageClass  = 'no-display';
    let proFimageClass  = 'col-md-3 col-sm-6 col-xs-12';
    let proImage90Class = '';

    let after45Class    = 'row';
    let after90Class    = 'row';
    let after90PAIClass = 'col-md-3 col-sm-6 col-xs-12';
    let backAfterClass  = 'row no-display';

    if (this.state.type) {
      proType = this.state.type
    }

    if ( proType && proType === 'coolsculpting' ) {
      proFimageClass = 'col-md-3 col-sm-6 col-xs-12 no-display';
      backImageClass = '';
      after90PAIClass= 'col-md-3 col-sm-6 col-xs-12 no-display';
      backAfterClass = 'row';
    } else if ( proType && proType === 'laser' ) {
      proFimageClass = 'col-md-3 col-sm-6 col-xs-12 no-display';
      backImageClass = 'no-display';
      proImage90Class= 'no-display';
      after90Class   = 'no-display';
      after90PAIClass= 'col-md-3 col-sm-6 col-xs-12 no-display';
      backAfterClass = 'row no-display';
    }

    return (
        <div id="content">
          <form onSubmit={this.handleSubmit}>
            <div className="container-fluid content setting-wrapper add-edit-procedure">
            <div className="juvly-section full-width m-t-15">
              <div className="juvly-container">
                <div className="juvly-title m-b-30">
                  {(this.state.showLoader === false) ? ((this.state.procedureID) ? patientName + ' - ' + this.state.languageData.pro_edit_procedure : patientName + ' - ' + this.state.languageData.pro_add_procedure) : ''}
                  <Link to={returnTo} className="pull-right"><img src={crossImage}/></Link>
                </div>
                <div className="juvly-subtitle">{this.state.languageData.pro_procedure_information}</div>
                <div className="row">
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_select_appointment}</div>
                      <select name="appointment_id" className="setting-select-box" onChange={this.handleInputChange} value={this.state.appointment_id}>
                        <option value="0">Select</option>
                        {apptOptData}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_select_services} {(this.state.appointment_id && this.state.appointment_id > 0) && <span className="required">*</span>}</div>
                      <select name="service_id" className={this.state.serviceClass} onChange={this.handleInputChange} value={this.state.service_id}>
                        <option value='0'>Select</option>
                        {apptServiceData}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.client_select_provider} <span className="required">*</span></div>
                      <select name="user_id" className={this.state.providerClass} onChange={this.handleInputChange} value={this.state.user_id}>
                        <option value='0'>Select</option>
                        {providerApptOpt}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.wallet_select_clinic} <span className="required">*</span></div>
                      <select name="clinic_id" className={this.state.clinicClass} onChange={this.handleInputChange} value={this.state.clinic_id}>
                        <option value='0'>Select</option>
                        {clinicsOpt}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_pro_area} <span className="required">*</span></div>
                      <select name="type" className={this.state.areaClass} onChange={this.handleInputChange} value={this.state.type} >
                        <option value="butt">Butt</option>.
                        <option value="chest">Chest</option>
                        <option value="coolsculpting">Coolsculpting</option>
                        <option value="face">Face</option>
                        <option value="laser">Laser</option>
                        <option value="thighs">Thighs</option>
                        <option value="trunk">Trunk</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_pro_name} <span className="required">*</span></div>
                      <div className="setting-input-outer">
                        <input name="procedure_name" className={this.state.pronameClass} type="text" autoComplete="off" onChange={this.handleInputChange} value={this.state.procedure_name}/>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_pro_date}</div>
                      <div className="setting-input-outer" ref={(refDatePickerContainer) => this.refDatePickerContainer = refDatePickerContainer}>
                        {/*<a href="javascript:void(0);" className="client-treat-cal" onClick={this.toggleDatePicker}>
                          <i className="fas fa-calendar-alt" />
                        </a>*/}
                        {/*<a href="javascript:void(0);" className="client-treat-reset" onClick={this.resetDatePicker}>
                          <i className="fas fa-times" />
                        </a>*/}
                        {<DatePicker
                          value={showFormattedDate(this.state.procedure_date, true)}
                          onChange={this.handleDatePicker}
                          className={'setting-input-box p-r-40'}
                          maxDate={new Date()}
                          minTime={setHours(setMinutes(new Date(), 0), 0)}
                          maxTime={setHours(setMinutes(new Date(), parseInt(moment().format("mm"))), parseInt(moment().format("HH")))}
                          name='procedure_date'
                          autoComplete="off"
                          ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                          onBlur={this.blurDatePicker}
                          showTimeSelect
                          timeFormat={(getTimeFormat() === 'hh:mm A' ) ? 'hh:mm aa' : getTimeFormat()}
                          timeIntervals={1}
                          dateFormat={formatType}
                        //  showMonthDropdown
                          //showYearDropdown
                          timeCaption="time"
                          selected={(this.state.selected_date) ? this.state.selected_date : (this.state.procedure_date) ? moment(this.state.procedure_date).toDate() : this.state.selected_date}
                        />}
                      </div>

                    </div>
                  </div>
                </div>
                <div className="juvly-subtitle">{this.state.languageData.pro_front_image}</div>
                <div className="setting-field-outer">
                   <div className="new-field-label">{this.state.languageData.pro_text_front_image}</div>
                   <div className="main-profile-picture relative-pic">
                      <div className="col-xs-6 no-padding">
                         <div className="file-container">
                            <img src={(this.state['patient_image_front_src']) ? this.state['patient_image_front_src'] : defLogo}/>
                            <span className={(this.state['patient_image_front_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_image_front_thumbnail']}</span>
                            <span className={(this.state['patient_image_front_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_image_front_size']}</span>

                            {(this.state['patient_image_front']) && <span onClick={() => this.removeThisImage('patient_image_front')} className="upload-img-cross"></span>}
                            <div className="upload">{this.state.languageData.pro_upload}
                               <input
                                  type="file"
                                  name={'patient_image_front'}
                                  autoComplete="off"
                                  onChange={this.handleInputChange}
                                  className="image_questionnaire"
                                  />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="juvly-subtitle">{this.state.languageData.pro_image_45_deg}</div>
                <div className="row">
                  <div className={proFimageClass}>
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_image}</div>
                      <div className="main-profile-picture relative-pic">
                         <div className="col-xs-6 no-padding">
                            <div className="file-container">
                               <img src={(this.state['procedure_image_45_src']) ? this.state['procedure_image_45_src'] : defLogo}/>
                               <span className={(this.state['procedure_image_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['procedure_image_45_thumbnail']}</span>
                               <span className={(this.state['procedure_image_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['procedure_image_45_size']}</span>

                               {(this.state['procedure_image_45']) && <span onClick={() => this.removeThisImage('procedure_image_45')} className="upload-img-cross"></span>}
                               <div className="upload">{this.state.languageData.pro_upload}
                                  <input
                                     type="file"
                                     name={'procedure_image_45'}
                                     autoComplete="off"
                                     onChange={this.handleInputChange}
                                     className="image_questionnaire"
                                     />
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_left_image}</div>
                      <div className="main-profile-picture relative-pic">
                         <div className="col-xs-6 no-padding">
                            <div className="file-container">
                               <img src={(this.state['patient_image_left_45_src']) ? this.state['patient_image_left_45_src'] : defLogo}/>
                               <span className={(this.state['patient_image_left_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_image_left_45_thumbnail']}</span>
                               <span className={(this.state['patient_image_left_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_image_left_45_size']}</span>

                               {(this.state['patient_image_left_45']) && <span onClick={() => this.removeThisImage('patient_image_left_45')} className="upload-img-cross"></span>}
                               <div className="upload">{this.state.languageData.pro_upload}
                                  <input
                                     type="file"
                                     name={'patient_image_left_45'}
                                     autoComplete="off"
                                     onChange={this.handleInputChange}
                                     className="image_questionnaire"
                                     />
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_right_image}</div>
                      <div className="main-profile-picture relative-pic">
                         <div className="col-xs-6 no-padding">
                            <div className="file-container">
                               <img src={(this.state['patient_image_right_45_src']) ? this.state['patient_image_right_45_src'] : defLogo}/>
                               <span className={(this.state['patient_image_right_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_image_right_45_thumbnail']}</span>
                               <span className={(this.state['patient_image_right_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_image_right_45_size']}</span>

                               {(this.state['patient_image_right_45']) && <span onClick={() => this.removeThisImage('patient_image_right_45')} className="upload-img-cross"></span>}
                               <div className="upload">{this.state.languageData.pro_upload}
                                  <input
                                     type="file"
                                     name={'patient_image_right_45'}
                                     autoComplete="off"
                                     onChange={this.handleInputChange}
                                     className="image_questionnaire"
                                     />
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={proImage90Class}>
                  <div className="juvly-subtitle">{this.state.languageData.pro_image_90_deg}</div>
                  <div className="row">
                    <div className={proFimageClass}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.pro_image}</div>
                        <div className="main-profile-picture relative-pic">
                           <div className="col-xs-6 no-padding">
                              <div className="file-container">
                                 <img src={(this.state['procedure_image_src']) ? this.state['procedure_image_src'] : defLogo}/>
                                 <span className={(this.state['procedure_image_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['procedure_image_thumbnail']}</span>
                                 <span className={(this.state['procedure_image_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['procedure_image_size']}</span>

                                 {(this.state['procedure_image']) && <span onClick={() => this.removeThisImage('procedure_image')} className="upload-img-cross"></span>}
                                 <div className="upload">{this.state.languageData.pro_upload}
                                    <input
                                       type="file"
                                       name={'procedure_image'}
                                       autoComplete="off"
                                       onChange={this.handleInputChange}
                                       className="image_questionnaire"
                                       />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.pro_left_image}</div>
                        <div className="main-profile-picture relative-pic">
                           <div className="col-xs-6 no-padding">
                              <div className="file-container">
                                 <img src={(this.state['patient_image_left_src']) ? this.state['patient_image_left_src'] : defLogo}/>
                                 <span className={(this.state['patient_image_left_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_image_left_thumbnail']}</span>
                                 <span className={(this.state['patient_image_left_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_image_left_size']}</span>

                                 {(this.state['patient_image_left']) && <span onClick={() => this.removeThisImage('patient_image_left')} className="upload-img-cross"></span>}
                                 <div className="upload">{this.state.languageData.pro_upload}
                                    <input
                                       type="file"
                                       name={'patient_image_left'}
                                       autoComplete="off"
                                       onChange={this.handleInputChange}
                                       className="image_questionnaire"
                                       />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.pro_right_image}</div>
                        <div className="main-profile-picture relative-pic">
                           <div className="col-xs-6 no-padding">
                              <div className="file-container">
                                 <img src={(this.state['patient_image_right_src']) ? this.state['patient_image_right_src'] : defLogo}/>
                                 <span className={(this.state['patient_image_right_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_image_right_thumbnail']}</span>
                                 <span className={(this.state['patient_image_right_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_image_right_size']}</span>

                                 {(this.state['patient_image_right']) && <span onClick={() => this.removeThisImage('patient_image_right')} className="upload-img-cross"></span>}
                                 <div className="upload">{this.state.languageData.pro_upload}
                                    <input
                                       type="file"
                                       name={'patient_image_right'}
                                       autoComplete="off"
                                       onChange={this.handleInputChange}
                                       className="image_questionnaire"
                                       />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={backImageClass}>
                  <div className="juvly-subtitle">{this.state.languageData.pro_back_images}</div>
                  <div className="row">
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.pro_back_image}</div>
                        <div className="main-profile-picture relative-pic">
                           <div className="col-xs-6 no-padding">
                              <div className="file-container">
                                 <img src={(this.state['patient_image_back_src']) ? this.state['patient_image_back_src'] : defLogo}/>
                                 <span className={(this.state['patient_image_back_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_image_back_thumbnail']}</span>
                                 <span className={(this.state['patient_image_back_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_image_back_size']}</span>

                                 {(this.state['patient_image_back']) && <span onClick={() => this.removeThisImage('patient_image_back')} className="upload-img-cross"></span>}
                                 <div className="upload">{this.state.languageData.pro_upload}
                                    <input
                                       type="file"
                                       name={'patient_image_back'}
                                       autoComplete="off"
                                       onChange={this.handleInputChange}
                                       className="image_questionnaire"
                                       />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.pro_back_left_45_deg}</div>
                        <div className="main-profile-picture relative-pic">
                           <div className="col-xs-6 no-padding">
                              <div className="file-container">
                                 <img src={(this.state['patient_image_back_left_45_src']) ? this.state['patient_image_back_left_45_src'] : defLogo}/>
                                 <span className={(this.state['patient_image_back_left_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_image_back_left_45_thumbnail']}</span>
                                 <span className={(this.state['patient_image_back_left_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_image_back_left_45_size']}</span>

                                 {(this.state['patient_image_back_left_45']) && <span onClick={() => this.removeThisImage('patient_image_back_left_45')} className="upload-img-cross"></span>}
                                 <div className="upload">{this.state.languageData.pro_upload}
                                    <input
                                       type="file"
                                       name={'patient_image_back_left_45'}
                                       autoComplete="off"
                                       onChange={this.handleInputChange}
                                       className="image_questionnaire"
                                       />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.pro_back_right_45_deg}</div>
                        <div className="main-profile-picture relative-pic">
                           <div className="col-xs-6 no-padding">
                              <div className="file-container">
                                 <img src={(this.state['patient_image_back_right_45_src']) ? this.state['patient_image_back_right_45_src'] : defLogo}/>
                                 <span className={(this.state['patient_image_back_right_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_image_back_right_45_thumbnail']}</span>
                                 <span className={(this.state['patient_image_back_right_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_image_back_right_45_size']}</span>

                                 {(this.state['patient_image_back_right_45']) && <span onClick={() => this.removeThisImage('patient_image_back_right_45')} className="upload-img-cross"></span>}
                                 <div className="upload">{this.state.languageData.pro_upload}
                                    <input
                                       type="file"
                                       name={'patient_image_back_right_45'}
                                       autoComplete="off"
                                       onChange={this.handleInputChange}
                                       className="image_questionnaire"
                                       />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                <div className={after45Class}>
                  <div className="juvly-subtitle">{this.state.languageData.pro_after_45_deg}</div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_left_after_image}</div>
                      <div className="main-profile-picture relative-pic">
                        <div className="col-xs-6 no-padding">
                          <div className="file-container">
                             <img src={(this.state['patient_ai_image_left_45_src']) ? this.state['patient_ai_image_left_45_src'] : defLogo}/>
                             <span className={(this.state['patient_ai_image_left_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_ai_image_left_45_thumbnail']}</span>
                             <span className={(this.state['patient_ai_image_left_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_ai_image_left_45_size']}</span>

                             {(this.state['patient_ai_image_left_45']) && <span onClick={() => this.removeThisImage('patient_ai_image_left_45')} className="upload-img-cross"></span>}
                             <div className="upload">{this.state.languageData.pro_upload}
                                <input
                                   type="file"
                                   name={'patient_ai_image_left_45'}
                                   autoComplete="off"
                                   onChange={this.handleInputChange}
                                   className="image_questionnaire"
                                   />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_right_after_image}</div>
                      <div className="main-profile-picture relative-pic">
                        <div className="col-xs-6 no-padding">
                          <div className="file-container">
                             <img src={(this.state['patient_ai_image_right_45_src']) ? this.state['patient_ai_image_right_45_src'] : defLogo}/>
                             <span className={(this.state['patient_ai_image_right_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_ai_image_right_45_thumbnail']}</span>
                             <span className={(this.state['patient_ai_image_right_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_ai_image_right_45_size']}</span>

                             {(this.state['patient_ai_image_right_45']) && <span onClick={() => this.removeThisImage('patient_ai_image_right_45')} className="upload-img-cross"></span>}
                             <div className="upload">{this.state.languageData.pro_upload}
                                <input
                                   type="file"
                                   name={'patient_ai_image_right_45'}
                                   autoComplete="off"
                                   onChange={this.handleInputChange}
                                   className="image_questionnaire"
                                   />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <div className={after90Class}>
                  <div className="juvly-subtitle">{this.state.languageData.pro_after_90_deg}</div>
                  <div className={after90PAIClass}>
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_after_image}</div>
                      <div className="main-profile-picture relative-pic">
                        <div className="col-xs-6 no-padding">
                          <div className="file-container">
                             <img src={(this.state['patient_ai_image_front_src']) ? this.state['patient_ai_image_front_src'] : defLogo}/>
                             <span className={(this.state['patient_ai_image_front_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_ai_image_front_thumbnail']}</span>
                             <span className={(this.state['patient_ai_image_front_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_ai_image_front_size']}</span>

                             {(this.state['patient_ai_image_front']) && <span onClick={() => this.removeThisImage('patient_ai_image_front')} className="upload-img-cross"></span>}
                             <div className="upload">{this.state.languageData.pro_upload}
                                <input
                                   type="file"
                                   name={'patient_ai_image_front'}
                                   autoComplete="off"
                                   onChange={this.handleInputChange}
                                   className="image_questionnaire"
                                   />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_left_after_image}</div>
                      <div className="main-profile-picture relative-pic">
                        <div className="col-xs-6 no-padding">
                          <div className="file-container">
                             <img src={(this.state['patient_ai_image_left_src']) ? this.state['patient_ai_image_left_src'] : defLogo}/>
                             <span className={(this.state['patient_ai_image_left_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_ai_image_left_thumbnail']}</span>
                             <span className={(this.state['patient_ai_image_left_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_ai_image_left_size']}</span>

                             {(this.state['patient_ai_image_left']) && <span onClick={() => this.removeThisImage('patient_ai_image_left')} className="upload-img-cross"></span>}
                             <div className="upload">{this.state.languageData.pro_upload}
                                <input
                                   type="file"
                                   name={'patient_ai_image_left'}
                                   autoComplete="off"
                                   onChange={this.handleInputChange}
                                   className="image_questionnaire"
                                   />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_right_after_image}</div>
                      <div className="main-profile-picture relative-pic">
                        <div className="col-xs-6 no-padding">
                          <div className="file-container">
                             <img src={(this.state['patient_ai_image_right_src']) ? this.state['patient_ai_image_right_src'] : defLogo}/>
                             <span className={(this.state['patient_ai_image_right_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_ai_image_right_thumbnail']}</span>
                             <span className={(this.state['patient_ai_image_right_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_ai_image_right_size']}</span>

                             {(this.state['patient_ai_image_right']) && <span onClick={() => this.removeThisImage('patient_ai_image_right')} className="upload-img-cross"></span>}
                             <div className="upload">{this.state.languageData.pro_upload}
                                <input
                                   type="file"
                                   name={'patient_ai_image_right'}
                                   autoComplete="off"
                                   onChange={this.handleInputChange}
                                   className="image_questionnaire"
                                   />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


                <div className={backAfterClass}>
                  <div className="juvly-subtitle">{this.state.languageData.pro_back_after_images}</div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_back_image}</div>
                      <div className="main-profile-picture relative-pic">
                        <div className="col-xs-6 no-padding">
                          <div className="file-container">
                             <img src={(this.state['patient_ai_image_back_src']) ? this.state['patient_ai_image_back_src'] : defLogo}/>
                             <span className={(this.state['patient_ai_image_back_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_ai_image_back_thumbnail']}</span>
                             <span className={(this.state['patient_ai_image_back_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_ai_image_back_size']}</span>

                             {(this.state['patient_ai_image_back']) && <span onClick={() => this.removeThisImage('patient_ai_image_back')} className="upload-img-cross"></span>}
                             <div className="upload">{this.state.languageData.pro_upload}
                                <input
                                   type="file"
                                   name={'patient_ai_image_back'}
                                   autoComplete="off"
                                   onChange={this.handleInputChange}
                                   className="image_questionnaire"
                                   />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_back_left_45_deg}</div>
                      <div className="main-profile-picture relative-pic">
                        <div className="col-xs-6 no-padding">
                          <div className="file-container">
                             <img src={(this.state['patient_ai_image_back_left_45_src']) ? this.state['patient_ai_image_back_left_45_src'] : defLogo}/>
                             <span className={(this.state['patient_ai_image_back_left_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_ai_image_back_left_45_thumbnail']}</span>
                             <span className={(this.state['patient_ai_image_back_left_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_ai_image_back_left_45_size']}</span>

                             {(this.state['patient_ai_image_back_left_45']) && <span onClick={() => this.removeThisImage('patient_ai_image_back_left_45')} className="upload-img-cross"></span>}
                             <div className="upload">{this.state.languageData.pro_upload}
                                <input
                                   type="file"
                                   name={'patient_ai_image_back_left_45'}
                                   autoComplete="off"
                                   onChange={this.handleInputChange}
                                   className="image_questionnaire"
                                   />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_back_right_45_deg}</div>
                      <div className="main-profile-picture relative-pic">
                        <div className="col-xs-6 no-padding">
                          <div className="file-container">
                             <img src={(this.state['patient_ai_image_back_right_45_src']) ? this.state['patient_ai_image_back_right_45_src'] : defLogo}/>
                             <span className={(this.state['patient_ai_image_back_right_45_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['patient_ai_image_back_right_45_thumbnail']}</span>
                             <span className={(this.state['patient_ai_image_back_right_45_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['patient_ai_image_back_right_45_size']}</span>

                             {(this.state['patient_ai_image_back_right_45']) && <span onClick={() => this.removeThisImage('patient_ai_image_back_right_45')} className="upload-img-cross"></span>}
                             <div className="upload">{this.state.languageData.pro_upload}
                                <input
                                   type="file"
                                   name={'patient_ai_image_back_right_45'}
                                   autoComplete="off"
                                   onChange={this.handleInputChange}
                                   className="image_questionnaire"
                                   />
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



                <div className="juvly-subtitle">{this.state.languageData.pro_questionnaire}</div>
                <div className="row">
                  <div className="col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_select_questionnaire}</div>
                      <div className="setting-input-outer">
                        <div className="tag-auto-select">
                          {(this.state.questionnaireOptions) && <Select
                            onChange={this.handleQuestionChange}
                            value={this.state.selectedQuestionnaireOptions}
                            isClearable
                            isSearchable
                            options={this.state.questionnaireOptions}
                            isMulti={true}
                          />}
                      </div>
                      </div>
                    </div>
                  </div>
                </div>


                <div className="juvly-subtitle">{this.state.languageData.pro_client_consents}</div>
                <div className="row">
                  <div className="col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_select_consents}</div>
                      <div className="setting-input-outer">
                        <div className="tag-auto-select">
                      { (this.state.consentsOptions) && <Select
                        onChange={this.handleConsentChange}
                        value={this.state.selectedConsentsOptions}
                        isClearable
                        isSearchable
                        options={this.state.consentsOptions}
                        isMulti={true}
                      />}
                      </div>
                    </div>
                    </div>
                  </div>
                  <div className="col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_signature_image}</div>
                      <div style={{"zIndex": '0'}} className="main-profile-picture relative-pic sig-pic">
                         <div className="col-xs-6 no-padding">
                            <div className="file-container">
                               <img src={(this.state['signature_image_src']) ? this.state['signature_image_src'] : ''}/>
                               <span className={(this.state['signature_image_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['signature_image_thumbnail']}</span>
                               <span className={(this.state['signature_image_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['signature_image_size']}</span>

                               {(this.state['signature_image']) && <span onClick={() => this.removeThisImage('signature_image')} className="upload-img-cross"></span>}
                               <div className="upload">{this.state.languageData.pro_upload}
                                  <input
                                     type="file"
                                     name={'signature_image'}
                                     autoComplete="off"
                                     onChange={this.handleInputChange}
                                     className="image_questionnaire"
                                     />
                               </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={(this.state.showModal === true ) ? 'overlay' : ''}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                 <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                        <h4 className="modal-title">{this.state.languageData.client_conf_requierd}</h4>
                      </div>
                      <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                         {this.state.languageData.pro_delete_message}
                      </div>
                      <div className="modal-footer" >
                        <div className="col-md-12 text-left">
                          <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.languageData.client_no}</button>
                          <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteProcedure}>{this.state.languageData.client_yes}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              <div className="footer-static">
                {(this.state.procedureID > 0) && <a onClick={() => this.showDelProModal()} className="new-red-btn pull-left">{this.state.languageData.client_delete}</a>}
                <input className="new-blue-btn pull-right" type="submit" value={this.state.languageData.clientprofile_save}/>
                <Link to={returnTo} className="new-white-btn pull-right">{this.state.languageData.clientprofile_cancel}</Link>
              </div>
            </div>
            </div>
          </form>
          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader clientProfileLoader' : 'new-loader text-left'}>
            <div className="loader-outer">
              <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
              <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
            </div>
          </div>
        </div>
    )
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState  = {};

  if ( state.ProcedureReducer.action === 'GET_PROCEDURE_DATA' ) {
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message])
    } else {
      returnState.procedureData = state.ProcedureReducer.data
    }
  }

  if ( state.ProcedureReducer.action === 'GET_APPT_CONSULT_DATA' ) {
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message])
    } else {
      returnState.apptConsultData = state.ProcedureReducer.data
    }
  }

  if ( state.ProcedureReducer.action === 'CREATE_PROCEDURE' ) {
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.saveProData = state.ProcedureReducer.data
    } else {
      returnState.saveProData = state.ProcedureReducer.data
    }
  }

  if ( state.ProcedureReducer.action === 'UPDATE_PROCEDURE' ) {
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.updateProData = state.ProcedureReducer.data
    } else {
      returnState.updateProData = state.ProcedureReducer.data
    }
  }

  if ( state.ProcedureReducer.action === 'GET_ASSOCIATED_CLINICS' ) {
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message])
    } else {
      returnState.associatedClinics = state.ProcedureReducer.data
    }
  }

  if ( state.ProcedureReducer.action === 'DELETE_PROCEDURE' ) {
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.deleteProData = state.ProcedureReducer.data
    } else {
      returnState.deleteProData = state.ProcedureReducer.data
    }
  }

  if ( state.ProcedureReducer.action === 'EMPTY_PROCEDURE_REDUCER' ) {
    if ( state.ProcedureReducer.data.status != 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message]);
      return {}
    } else {
      return {}
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getProcedureData: getProcedureData, getApptConsultData: getApptConsultData, saveProcedure: saveProcedure, updateProcedure: updateProcedure, getAssociatedClinics: getAssociatedClinics, deleteProcedure: deleteProcedure, emptyProcedureReducer: emptyProcedureReducer}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps) (Procedure);
