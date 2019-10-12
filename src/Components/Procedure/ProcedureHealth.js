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
import { emptyProcedureReducer, getHealthProcedureData, saveHealthProcedureData, deleteProcedure, getApptConsultData, getAssociatedClinics, getProcedureTemplateData, saveProcedure, updateProcedure } from '../../Actions/Procedures/procedureActions.js';
import Select from 'react-select';
import { displayName, showFormattedDate, getTimeFormat,isPositiveNumber,isFormSubmit } from '../../Utils/services.js';
import { setHours, setMinutes } from 'date-fns';
import crossImage from '../../images/close.png';
import defLogo from '../../images/upload.png';

const procedureInstance = axios.create();
procedureInstance.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  if (!error.response) {
    return { data: { data: "", message: "file_type_error", status: 400 } }
  }
});

const formatType = 'YYYY/MM/DD hh:mm A';

const dateFormat = (date) => {
  return moment(date).format(formatType);
}

let apptServiceData = ''
let clinicsOpt = ''
let curObj = ''

const nextChar = (value) => {
  value = String(value)
  return String.fromCharCode(value.charCodeAt(0) + 1);
}

class ProcedureHealth extends Component {
  constructor(props) {
    super(props);

    const languageData = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType: (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      clientID: this.props.match.params.clientID,
      procedureID: (this.props.match.params.procedureID) ? this.props.match.params.procedureID : 0,
      globalLang: languageData.global,
      returnTo:'',
      showModal: false,
      showLoader: false,
      procedureData: {},
      procedureTemplateList: [],
      appointmentList: [],
      providerList: [],
      clinicList: [],
      associatedClinics: [],
      clinic_id: 0,
      appointment_id: 0,
      user_id: 0,
      procedure_template_id: 0,
      procedureTemplateIdClass: 'setting-select-box',
      appointmentIdClass: 'setting-select-box',
      userIdClass: 'setting-select-box',
      clinicIdClass: 'setting-select-box',
      procedureDetails: {},

      apptConsultData: {},
      clinicData: {},

      procedureTemplateData: {},
      templateQuesionList: [],
      questionShowFlag: [],
      uploadIndex: '',

      consultation_fee: '',
      consultationFeeClass: 'report-input',
      consultationFeeShow: false,
      displayedQuestionId: 0,

      invoice_id:0,

      fileReader: '',

      showDatePicker: false,

      selectedQuestionnaireOptions: [],
      questionnaireOptions: [],
      selectedConsentsOptions: [],
      consentsOptions: [],
      type: 'face',
      areaClass: 'setting-select-box',
      pronameClass: 'setting-input-box',
      procedure_name: '',

      procedure_date: dateFormat(new Date()),
      languageData  : languageData.clients,
      // selected_date                 : new Date()
    }
  }

  componentDidMount() {
    this.setState({showLoader: true})
    this.props.getHealthProcedureData(this.state.clientID, this.state.procedureID)

    let returnTo = '';

    if (this.state.backURLType && this.state.backURLType === 'clients') {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID : "/" + this.state.backURLType
    } else {

    }
    this.setState({returnTo:returnTo})
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}
    if (nextProps.procedureData !== undefined && nextProps.procedureData !== prevState.procedureData) {
      returnState.showLoader = false
      returnState.procedureData = nextProps.procedureData
      returnState.procedureTemplateList = (nextProps.procedureData.procedure_templates) ? nextProps.procedureData.procedure_templates : []
      returnState.appointmentList = (nextProps.procedureData.appointments) ? nextProps.procedureData.appointments : []
      returnState.providerList = (nextProps.procedureData.providers) ? nextProps.procedureData.providers : []
      returnState.associatedClinics = (nextProps.procedureData.clinics) ? nextProps.procedureData.clinics : []

      if(prevState.procedureID > 0 && nextProps.procedureData.procedure !== undefined && nextProps.procedureData.procedure !== null){
        returnState.clinic_id = (nextProps.procedureData.procedure.clinic_id) ? nextProps.procedureData.procedure.clinic_id : 0;
        returnState.appointment_id = (nextProps.procedureData.procedure.appointment_id) ? nextProps.procedureData.procedure.appointment_id : 0;
        returnState.user_id = (nextProps.procedureData.procedure.user_id) ? nextProps.procedureData.procedure.user_id : 0;
        returnState.invoice_id = (nextProps.procedureData.procedure.invoice_id) ? nextProps.procedureData.procedure.invoice_id : 0;
        returnState.procedure_template_id = (nextProps.procedureData.procedure.procedure_template_id) ? nextProps.procedureData.procedure.procedure_template_id : 0;
        returnState.consultation_fee = (nextProps.procedureData.procedure.consultation_fee) ? nextProps.procedureData.procedure.consultation_fee : '0.00';
        if(nextProps.procedureData.procedure.questions){
          let templateQuesionList = (nextProps.procedureData.procedure.questions.procedure_template_question !== undefined && nextProps.procedureData.procedure.questions.procedure_template_question !== null) ? nextProps.procedureData.procedure.questions.procedure_template_question : []
          templateQuesionList.map((question, idx) => {
            let answerObj = (nextProps.procedureData.procedure.answers) ?  nextProps.procedureData.procedure.answers.find(ans => ans.question_id === question.id) : {}

            let answer = '';
            if(answerObj !== undefined && answerObj.answer !== undefined && answerObj.answer !== null){
              answer = answerObj.answer
            }
            console.log('answer ',question.question_type, ' |', answer);
            switch (question.question_type) {
              case "Textbox":
                question.field_name = 'Textbox_' + question.id
                question.field_value = answer
                question.class_name = 'report-input'
                break;
              case "Multiple Choice":
                question.field_name = 'Multiple_Choice_' + question.id
                question.field_value = [] //(answer) ? answer.split(',').map(function(item) {return parseInt(item, 10);}) : []
                if(answer){
                  answer = answer.split(',').map(function(item) {return item.trim()})
                  answer.map((obj1,idx1)=> {
                    const tempAnswer0 = question.procedure_template_question_option.find(x => x.question_option == answer[idx1]);
                    if(tempAnswer0){
                      question.field_value.push(tempAnswer0.id);
                    }
                  })
                }
                question.class_name = 'col-sm-12 multisel-outer'
                break;
              case "File Upload":
                question.field_name = 'File_Upload_' + question.id
                question.field_value = answer
                question.class_name = 'file-container file-upload-img'
                question.file_thumbnail = (answer) ?  answer :''
                question.file_size = ''
                question.download_path = (answer) ?  answerObj.file_path :''

                break;
              case "Yes/No":
                question.field_name = 'Yes_No_' + question.id
                question.field_value = ''  //parseInt(answer)
                if(answer){
                  const tempAnswer = question.procedure_template_question_option.find(x => x.question_option == answer);
                  if(tempAnswer){
                    question.field_value = tempAnswer.id;
                  }
                }
                question.class_name = 'col-sm-12 multisel-outer'
                break;
              case "Single Choice":
                question.field_name = 'Single_Choice_' + question.id
                question.field_value = '';//parseInt(answer)
                if(answer){
                  const tempAnswer1 = question.procedure_template_question_option.find(x => x.question_option == answer);
                  if(tempAnswer1){
                    question.field_value = tempAnswer1.id;
                  }
                }
                question.class_name = 'col-sm-12 multisel-outer'

                break;
              case "Opinion Scale":
                question.field_name = 'Opinion_Scale_' + question.id
                question.field_value = ''; //parseInt(answer)
                if(answer){
                  answer = parseInt(answer) - 1;
                  const tempAnswer2 = ((question.procedure_template_question_option) && (question.procedure_template_question_option[answer])) ? question.procedure_template_question_option[answer] : '';
                  if(tempAnswer2){
                    question.field_value = tempAnswer2.id;
                  }
                }
                question.field_name_why = 'Opinion_Scale_Why_' + question.id
                question.field_value_why = (answer) ? ((answerObj.comment) ? answerObj.comment : '') : ''
                question.class_name = 'survey-rate-outer'
                question.display_step = 0
                break;
              default:
                return null
                break;
            }
            question.error_flag = false
            question.isShow = (idx === 0) ? true : false;
            question.button_next = (templateQuesionList[idx + 1] !== undefined) ? templateQuesionList[idx + 1]['id'] : 0;
            question.button_back = (idx !== 0) ? templateQuesionList[idx - 1]['id'] : 0;


          });
          returnState.templateQuesionList = templateQuesionList;
          returnState.consultationFeeClass = 'report-input';
          returnState.consultationFeeShow = false;
          returnState.displayedQuestionId = (templateQuesionList.length > 0) ? templateQuesionList[0]['id'] : 0
        }
      }
    } else if (nextProps.apptConsultData !== undefined && nextProps.apptConsultData !== prevState.apptConsultData) {
      returnState.showLoader = false
      returnState.apptConsultData = nextProps.apptConsultData
      returnState.clinic_id = (nextProps.apptConsultData && nextProps.apptConsultData.selected_clinic_id) ? nextProps.apptConsultData.selected_clinic_id : 0
      returnState.user_id = 0
      let associatedClinics = []
      if(nextProps.apptConsultData.associated_clinic !== null && nextProps.apptConsultData.associated_clinic !== undefined && nextProps.apptConsultData.associated_clinic.length > 0){
        returnState.user_id = nextProps.apptConsultData.associated_clinic[0].provider_id
        nextProps.apptConsultData.associated_clinic.map((obj, idx) => {
          associatedClinics.push(obj.clinic)
        })
      }
      returnState.associatedClinics = associatedClinics
    } else if (nextProps.clinicData !== undefined && nextProps.clinicData !== prevState.clinicData) {
      returnState.showLoader = false
      returnState.clinicData = nextProps.clinicData
      returnState.associatedClinics = (nextProps.clinicData.all_clinics) ? nextProps.clinicData.all_clinics : []
      returnState.clinic_id = (prevState.procedureDetails && prevState.procedureDetails.clinic_id) ? prevState.procedureDetails.clinic_id : (nextProps.clinicData.default_clinic_id) ? nextProps.clinicData.default_clinic_id : (nextProps.clinicData.all_clinics && nextProps.clinicData.all_clinics.length > 0) ? nextProps.clinicData.all_clinics[0].id : 0
    } else if (nextProps.procedureTemplateData !== undefined && nextProps.procedureTemplateData !== prevState.procedureTemplateData) {
      returnState.showLoader = false
      returnState.procedureTemplateData = nextProps.procedureTemplateData
      let templateQuesionList = (nextProps.procedureTemplateData.procedure_template_question) ? nextProps.procedureTemplateData.procedure_template_question : []
      templateQuesionList.map((question, idx) => {
        switch (question.question_type) {
          case "Textbox":
            question.field_name = 'Textbox_' + question.id
            question.field_value = ''
            question.class_name = 'report-input'
            break;
          case "Multiple Choice":
            question.field_name = 'Multiple_Choice_' + question.id
            question.field_value = []
            question.class_name = 'col-sm-12 multisel-outer'
            break;
          case "File Upload":
            question.field_name = 'File_Upload_' + question.id
            question.field_value = ''
            question.class_name = 'file-container file-upload-img'
            break;
          case "Yes/No":
            question.field_name = 'Yes_No_' + question.id
            question.field_value = ''
            question.class_name = 'col-sm-12 multisel-outer'
            break;
          case "Single Choice":
            question.field_name = 'Single_Choice_' + question.id
            question.field_value = ''
            question.class_name = 'col-sm-12 multisel-outer'
            break;
          case "Opinion Scale":
            question.field_name = 'Opinion_Scale_' + question.id
            question.field_value = ''
            question.field_name_why = 'Opinion_Scale_Why_' + question.id
            question.field_value_why = ''
            question.class_name = 'survey-rate-outer'
            question.display_step = 0
            break;
          default:
            return null
            break;
        }
        question.error_flag = false
        question.isShow = (idx === 0) ? true : false;
        question.button_next = (templateQuesionList[idx + 1] !== undefined) ? templateQuesionList[idx + 1]['id'] : 0;
        question.button_back = (idx !== 0) ? templateQuesionList[idx - 1]['id'] : 0;
      });
      returnState.templateQuesionList = templateQuesionList;
      returnState.consultation_fee = '';
      returnState.consultationFeeClass = 'report-input';
      returnState.consultationFeeShow = false;
      returnState.displayedQuestionId = (templateQuesionList.length > 0) ? templateQuesionList[0]['id'] : 0
      nextProps.emptyProcedureReducer()
    } else if (nextProps.showLoader !== undefined && nextProps.showLoader === false) {
      returnState.showLoader = false
      nextProps.emptyProcedureReducer()
    } else if (nextProps.redirect !== undefined && nextProps.redirect === true) {
      nextProps.emptyProcedureReducer()
      toast.success(nextProps.message)
      nextProps.history.push(prevState.returnTo);
    } else if (nextProps.procedureNotFound !== undefined && nextProps.procedureNotFound === true) {
      setTimeout(function() {
          nextProps.history.push(prevState.returnTo);
      }, 1700)
    }

    return returnState
  }

  resetFileState = (questionId) => {
    questionId = questionId || 0
    this.setState({
      uploadIndex: '',
      fileReader: {},
      file: '',
      target: '',
      file_name: '',
      file_thumbnail: '',
      file_size: ''
    });

    // reset input-field value (it's required for upload same file after removing)
    if (questionId) {
      var inputFiled = document.getElementById("image_questionnaire-" + questionId);
      if (inputFiled) {
        inputFiled.value = ''
      }
    }
  }

  removeUploadedFile = (index, questionId, event) => {
    let returnState = {};
    let templateQuesionList = this.state.templateQuesionList;
    templateQuesionList[index]['field_value'] = ''
    templateQuesionList[index]['file_thumbnail'] = ''
    templateQuesionList[index]['file_size'] = ''
    templateQuesionList[index]['download_path'] = ''
    templateQuesionList[index]['class_name'] = 'file-container file-upload-img';
    this.setState({ templateQuesionList: templateQuesionList });
    this.resetFileState(questionId)
  }

  handleUpload = (targetName) => {
    let uploadtype = 'procedure_image'
    const data = new FormData()
    data.append('file', this.state.file, this.state.file.name)
    let endpoint = config.API_URL + `media/upload?upload_type=${uploadtype}`;

    axios.post(endpoint, data).then(res => {
      let templateQuesionList = this.state.templateQuesionList;
      let uploadIndex = this.state.uploadIndex
      templateQuesionList[uploadIndex]['field_value'] = res.data.data.file_name
      templateQuesionList[uploadIndex]['file_thumbnail'] = this.state.file_thumbnail
      templateQuesionList[uploadIndex]['file_size'] = this.state.file_size
      templateQuesionList[uploadIndex]['download_path'] = this.state.fileReader.result
      templateQuesionList[uploadIndex]['class_name'] = 'file-container file-upload-img';
      this.setState({
        templateQuesionList: templateQuesionList,
        showLoader: false
      });
      this.resetFileState()
    }).catch(error => {
      toast.error(this.state.globalLang[error.response.data.message]);
      this.setState({ showLoader: false });
      this.resetFileState()
    })
  }

  handleFileRead = (e) => {
    const content = this.state.fileReader.result;
    let fileSize = formatBytes(this.state.file.size, 1)
    this.setState({ file_thumbnail: this.state.file.name, file_size: fileSize, file_src: this.state.fileReader.result, showLoader: true });
    this.handleUpload(this.state.target.name)

  }

  handleFileChosen = (event) => {
    const target = event.target;
    if (target && target.type === 'file') {
      const allowedTypes = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/gif", "image/GIF"];
      if (target.files && allowedTypes.indexOf(target.files[0].type) > -1) {
        const file = target.files[0]
        this.state.fileReader = new FileReader();
        this.state.fileReader.onloadend = this.handleFileRead;
        this.state.fileReader.readAsDataURL(file);
        this.state.file = file
        this.state.target = target
        this.state.uploadIndex = target.dataset.index
      } else {
        toast.error('This file type is not allowed');
      }
    }
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    let name = event.target.name

    const question = event.target.dataset.question;
    if (question) {
      const option = event.target.dataset.option;
      const index = event.target.dataset.index;
      let templateQuesionList = this.state.templateQuesionList;
      if (option == -1) {
        if (name.startsWith('Opinion_Scale_Why')) {
          templateQuesionList[index]['field_value_why'] = value
        } else {
          templateQuesionList[index]['field_value'] = value
        }
        templateQuesionList[index]['class_name'] = 'report-input'
        this.setState({ templateQuesionList: templateQuesionList })
      }
    } else {
      this.setState({ [event.target.name]: value, dataChanged: true });
    }


    if (name === 'procedure_template_id') {
      this.getProcedureTemplateData(value)

    }
    if (name === 'appointment_id') {
      this.getApptData(value)
    }
    if (name === 'user_id') {
      this.getAssociatedClinics(value)
    }
  }

  handleAnswerChange = (index, questionId, optionId, event) => {
    let templateQuesionList = this.state.templateQuesionList;
    switch (templateQuesionList[index]['question_type']) {
      case "Textbox":
      case "File Upload":
        break;
      case "Multiple Choice":
        let field_value = (templateQuesionList[index]['field_value']) ? templateQuesionList[index]['field_value'] : [];
        let existOrNot = field_value.indexOf(optionId);
        if (existOrNot > -1) {
          field_value.splice(existOrNot, 1);
        } else {
          field_value.push(optionId);
        }
        templateQuesionList[index]['field_value'] = field_value;
        templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer'
        break;
      case "Yes/No":
        templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer'
        templateQuesionList[index]['field_value'] = optionId;
        break;
      case "Single Choice":
        templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer'
        templateQuesionList[index]['field_value'] = optionId;
        break;
      case "Opinion Scale":
        templateQuesionList[index]['field_value'] = optionId;
        templateQuesionList[index]['class_name'] = 'survey-rate-outer'
        templateQuesionList[index]['display_step'] = (templateQuesionList[index]['why_choose'] === 1) ? 1 : 0
        break;
      default:
        break;
    }
    this.setState({ templateQuesionList: templateQuesionList })
  }


  handleSubmit = (event) => {
    event.preventDefault();
    if(isFormSubmit()){
    let error = false;



    if (this.state.procedure_template_id == undefined || this.state.procedure_template_id == null || this.state.procedure_template_id == '' || this.state.procedure_template_id <= 0) {
      this.setState({ procedureTemplateIdClass: 'setting-select-box field_error' });
      error = true
    } else {
      this.setState({ procedureTemplateIdClass: 'setting-select-box' });
    }

    if (this.state.user_id == undefined || this.state.user_id == null || this.state.user_id == '' || this.state.user_id <= 0) {
      this.setState({ userIdClass: 'setting-select-box field_error' });
      error = true
    } else {
      this.setState({ userIdClass: 'setting-select-box' });
    }

    if (this.state.clinic_id == undefined || this.state.clinic_id == null || this.state.clinic_id == '' || this.state.clinic_id <= 0) {
      this.setState({ clinicIdClass: 'setting-select-box field_error' });
      error = true
    } else {
      this.setState({ clinicIdClass: 'setting-select-box' });
    }

    if (this.state.consultation_fee !== undefined && this.state.consultation_fee !== null && this.state.consultation_fee !== '' && !isPositiveNumber(this.state.consultation_fee)) {
      this.setState({ consultationFeeClass: 'report-input field_error error' });
      error = true
      toast.dismiss()
      toast.error('Please enter valid consultation fee')
    } else {
      this.setState({ consultationFeeClass: 'report-input' });
    }

    let templateQuesionList = this.state.templateQuesionList;
    let isShow = false;
    let questions_data = []
    templateQuesionList.map((obj, index) => {
      let answer = ''
      if(templateQuesionList[index]['field_value']){
        switch (obj['question_type']) {
          case "Textbox":
          case "File Upload":
            answer = templateQuesionList[index]['field_value'];
            break;
          case "Multiple Choice":
            answer = []
            templateQuesionList[index]['field_value'].map((obj1,idx)=> {
              const tempAnswer = obj.procedure_template_question_option.find(x => x.id == templateQuesionList[index]['field_value'][idx]);
              if(tempAnswer){
                answer.push(tempAnswer.question_option);
              }
            })
            break;
          case "Yes/No":
          case "Single Choice":
          case "Opinion Scale":
              const tempAnswer = obj.procedure_template_question_option.find(x => x.id ==templateQuesionList[index]['field_value']);
              if(tempAnswer){
                answer = tempAnswer.question_option;
              }
            break;
          default:
            break;
        }
      }

      questions_data.push({
        question_id: templateQuesionList[index]['id'],
        quest_type: templateQuesionList[index]['question_type'],
        answers: answer, //templateQuesionList[index]['field_value'],
        why_choose: (templateQuesionList[index]['why_choose']) ? true : false,
        comment: (templateQuesionList[index]['why_choose']) ? templateQuesionList[index]['field_value_why'] : ''
      })
    })
    if (error) {
      return false
    }

    let template = this.state.procedureTemplateList.find(x => x.id == this.state.procedure_template_id)

    let formData = {
      patient_id: this.state.clientID,
      procedure_template_id: this.state.procedure_template_id,
      procedure_template_name: (template !== undefined && template.title !== undefined) ? template.title : '',
      appointment_id: this.state.appointment_id,
      user_id: this.state.user_id,
      clinic_id: this.state.clinic_id,
      consultation_fee: (this.state.consultation_fee) ? this.state.consultation_fee : 0.00,
      questions: questions_data
    }


    this.setState({showLoader:true})
    this.props.saveHealthProcedureData(this.state.clientID,this.state.procedureID,formData)
  }
    return false
  }

  getProcedureTemplateData = (value) => {
    if (value > 0) {
      this.props.getProcedureTemplateData(value);
      this.setState({ showLoader: true })
    } else {
      this.setState({ templateQuesionList: [] })
    }
  }

  getAssociatedClinics = (value) => {
    if (value > 0) {
      this.props.getAssociatedClinics(value);
      this.setState({ showLoader: true })
    }
  }

  getApptData = (value) => {
    if (value > 0) {
      let formData = {
        appointment_id: value,
        patient_id: this.state.clientID,
        service_id: 0
      }

      this.props.getApptConsultData(formData);
      this.reRenderClinics(value)
      this.setState({ showLoader: true })
    } else {
      apptServiceData = ''
    }
  }

  reRenderClinics = () => {
    if (this.state.clinicList.length > 0) {
      this.setState({ associatedClinics: this.state.clinicList })
    }
  }


  showDelProModal = () => {
    if (this.state.procedureID) {
      this.setState({ showModal: true })
    }
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteProcedure = () => {
    if (this.state.clientID && this.state.procedureID) {
      this.setState({ showLoader: true, showModal: false })

      this.props.deleteProcedure(this.state.clientID, this.state.procedureID)
    }
  }



  handleBackNext = (index, questionId, buttonAction, event) => {
    let backQuestionId = 0
    let nextQuestionId = 0
    let templateQuesionList = this.state.templateQuesionList;
    let consultationFeeShow = this.state.consultationFeeShow;
    let displayedQuestionId = this.state.displayedQuestionId;

    // display back-question if back request comming from consultation_fee question
    if (index == -1 && consultationFeeShow === true && buttonAction === 'back') {
      backQuestionId = displayedQuestionId;
      templateQuesionList.map((obj, idx) => {
        if (obj.id == backQuestionId) {
          templateQuesionList[idx]['isShow'] = true
          displayedQuestionId = templateQuesionList[idx]['id'];
        } else {
          templateQuesionList[idx]['isShow'] = false
        }
      })
      this.setState({ templateQuesionList: templateQuesionList, consultationFeeShow: false, displayedQuestionId: displayedQuestionId })
      return
    }

    // checke input-field is required or not
    const field_value = templateQuesionList[index]['field_value'];
    if (templateQuesionList[index]['required'] === 1 && buttonAction === 'next' && (field_value == '' || field_value == null || field_value == undefined)) {
      // prevent to move next or back question if input-field is empty (when input-field is required)
      switch (templateQuesionList[index]['question_type']) {
        case "Textbox":
          templateQuesionList[index]['class_name'] = 'report-input field_error'
          break;
        case "Multiple Choice":
          templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer error'
          break;
        case "File Upload":
          templateQuesionList[index]['class_name'] = 'file-container file-upload-img field_error'
          break;
        case "Yes/No":
          templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer error'
          break;
        case "Single Choice":
          templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer error'
          break;
        case "Opinion Scale":
          templateQuesionList[index]['class_name'] = 'survey-rate-outer field_error'
          break;
        default:
          return null
          break;
      }
      this.setState({ templateQuesionList: templateQuesionList })
      return
    } else {
      switch (templateQuesionList[index]['question_type']) {
        case "Textbox":
          templateQuesionList[index]['class_name'] = 'report-input'
          break;
        case "Multiple Choice":
          templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer'
          break;
        case "File Upload":
          templateQuesionList[index]['class_name'] = 'file-container file-upload-img'
          break;
        case "Yes/No":
          templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer'
          break;
        case "Single Choice":
          templateQuesionList[index]['class_name'] = 'col-sm-12 multisel-outer'
          break;
        case "Opinion Scale":
          templateQuesionList[index]['class_name'] = 'survey-rate-outer'
          break;
        default:
          return null
          break;
      }
    }

    // fetch next-question-id
    if (buttonAction === 'next') {
      switch (templateQuesionList[index]['question_type']) {
        case "Textbox":
        case "Multiple Choice":
        case "File Upload":
          // get next question id (without logic jump)
          nextQuestionId = (templateQuesionList[index + 1] !== undefined) ? templateQuesionList[index + 1]['id'] : 0;
          break;
        case "Yes/No":
        case "Single Choice":
        case "Opinion Scale":
          if (templateQuesionList[index]['procedure_templates_logic'] !== undefined && templateQuesionList[index]['procedure_templates_logic'].length > 0) {

            // fetch login-jump-question if set for selected option (value)
            let procedureTemplatesLogic = templateQuesionList[index]['procedure_templates_logic'].find(logicJump => logicJump.procedure_question_option_id == field_value)

            // fetch login-jump-question if not set for selected option (value) or default next question-id
            if (procedureTemplatesLogic === undefined) {
              procedureTemplatesLogic = templateQuesionList[index]['procedure_templates_logic'].find(logicJump => logicJump.procedure_question_option_id == 0)
            }

            if (procedureTemplatesLogic !== undefined && procedureTemplatesLogic.jump_to_question !== undefined) {
              // get next-question-id if logic jump found
              nextQuestionId = procedureTemplatesLogic.jump_to_question;
            } else {
              // get default next-question-id if logic jump not found
              nextQuestionId = (templateQuesionList[index + 1] !== undefined) ? templateQuesionList[index + 1]['id'] : 0;
            }
          } else {
            // get default next-question-id if logic jump not found
            nextQuestionId = (templateQuesionList[index + 1] !== undefined) ? templateQuesionList[index + 1]['id'] : 0;
          }
          if (templateQuesionList[index]['question_type'] === "Opinion Scale") {
            templateQuesionList[index]['display_step'] = 0;
          }
          break;
        default:
          break;
      }
    }
    // fetch back-question-id
    if (buttonAction === 'back') {
      const currentQuestion = templateQuesionList[index];
      // get default back-question-id from current question
      backQuestionId = currentQuestion.button_back;

      if (templateQuesionList[index]['question_type'] === "Opinion Scale") {
        if (templateQuesionList[index]['why_choose'] === 1 && templateQuesionList[index]['display_step'] === 1) {
          templateQuesionList[index]['display_step'] = 0;
          this.setState({ templateQuesionList: templateQuesionList })
          return
        }
      }
    }

    let isShow = false
    templateQuesionList.map((obj, idx) => {
      if (obj.id == questionId) { // hide current question
        templateQuesionList[idx]['isShow'] = false
      } else if (buttonAction === 'back' && obj.id == backQuestionId && backQuestionId != 0) { // display back question
        templateQuesionList[idx]['isShow'] = true
        displayedQuestionId = templateQuesionList[idx]['id'];
        consultationFeeShow = false
        isShow = true
      } else if (buttonAction === 'next' && obj.id == nextQuestionId && nextQuestionId != 0) { // display next question
        templateQuesionList[idx]['isShow'] = true
        // set back question for next question
        templateQuesionList[idx]['button_back'] = questionId
        displayedQuestionId = templateQuesionList[idx]['id'];
        consultationFeeShow = false
        isShow = true
      }
    })
    if(isShow === false && this.state.invoice_id == 0 && buttonAction === 'next'){
      consultationFeeShow = true
    }
    this.setState({ templateQuesionList: templateQuesionList, consultationFeeShow: consultationFeeShow, displayedQuestionId: displayedQuestionId })
  }

  renderInputFields = (questionObj, questionIdx) => {
    let returnHtml = '';
    let serialCount = 'A';
    switch (questionObj.question_type) {
      case "Textbox":
        returnHtml = (
          <input data-index={questionIdx} data-question={questionObj.id} data-option={-1} className={questionObj.class_name} value={questionObj.field_value} name={questionObj.field_name} type="text" onChange={this.handleInputChange} placeholder="Write your answer here..." autoComplete="off" />
        )
        break;
      case "Multiple Choice":
        returnHtml = (
          <div className={questionObj.class_name}>
            {((questionObj.procedure_template_question_option) && questionObj.procedure_template_question_option.length > 0) &&
              questionObj.procedure_template_question_option.map((optionObj, optionIdx) => {
                if (optionIdx !== 0) {
                  serialCount = nextChar(serialCount)
                }
                return (
                  <div key={'templateQuesionList-' + questionObj.id + '-optionList-' + optionObj.id} className={(questionObj.field_value.indexOf(optionObj.id) > -1) ? "multisel activated" : "multisel"} onClick={this.handleAnswerChange.bind(this, questionIdx, questionObj.id, optionObj.id)}>
                    <input data-index={questionIdx} data-question={questionObj.id} data-option={optionObj.id} className="servy-checkbox servy-radio preboxval" value={optionObj.id} name={questionObj.field_name} type="checkbox" onChange={this.handleInputChange} />
                    <span className="multi-sel-alpha">{serialCount}</span>
                    <label className="multisel-label" htmlFor={"Multiple_Choice_" + questionObj.id}>{optionObj.question_option}</label>
                    <i className="fa fa-check" />
                  </div>
                )
              })
            }
          </div>
        )
        break;
      case "File Upload":
        returnHtml = (
          <div className="row add-doc-section">
            <div className="col-xs-6 m-b-20">
              <div className={questionObj.class_name} title={(questionObj.field_value) ? questionObj.field_value : ''}>
                {(questionObj.field_value) && <a className="delete-file" onClick={this.removeUploadedFile.bind(this, questionIdx, questionObj.id)} ></a>}
                <img
                  className={(questionObj.field_value) ? "full-custom-img" : ""}
                  src={(questionObj.field_value) ? questionObj.download_path : defLogo}
                />
                <span className={(questionObj.field_value) ? "file-name file-info" : "file-name-hide no-display"}> {questionObj.file_thumbnail}</span>
                <span className={(questionObj.field_value) ? "file-size file-info" : "file-size-hide no-display"}>{questionObj.file_size}</span>
                <div className="upload">{this.state.globalLang.global_upload}
                  <input data-index={questionIdx} data-question={questionObj.id} data-option={-1} type="file" className={'image_questionnaire'} name="file" autoComplete="off" onChange={this.handleFileChosen} title={(questionObj.field_value) ? '' : 'No file chosen'} id={'image_questionnaire-' + questionObj.id} />
                </div>
              </div>
            </div>
          </div>
        )
        break;
      case "Yes/No":
        returnHtml = (
          <div className={questionObj.class_name}>
            {((questionObj.procedure_template_question_option) && questionObj.procedure_template_question_option.length > 0) &&
              questionObj.procedure_template_question_option.map((optionObj, optionIdx) => {
                if (optionIdx !== 0) {
                  serialCount = nextChar(serialCount)
                }
                return (
                  <div key={'templateQuesionList-' + questionObj.id + '-optionList-' + optionObj.id} className={(questionObj.field_value == optionObj.id) ? "multisel activated" : "multisel"} onClick={this.handleAnswerChange.bind(this, questionIdx, questionObj.id, optionObj.id)}>
                    <input data-index={questionIdx} data-question={questionObj.id} data-option={optionObj.id} className="servy-checkbox servy-radio preboxval" value={optionObj.id} name={questionObj.field_name} type="radio" onChange={this.handleInputChange} />
                    <span className="multi-sel-alpha">{serialCount}</span>
                    <label className="multisel-label" htmlFor={"Yes_No_" + questionObj.id}>{optionObj.question_option}</label>
                    <i className="fa fa-check" />
                  </div>
                )
              })
            }
          </div>
        )
        break;
      case "Single Choice":
        returnHtml = (
          <div className={questionObj.class_name}>
            {((questionObj.procedure_template_question_option) && questionObj.procedure_template_question_option.length > 0) &&
              questionObj.procedure_template_question_option.map((optionObj, optionIdx) => {
                if (optionIdx !== 0) {
                  serialCount = nextChar(serialCount)
                }
                return (
                  <div key={'templateQuesionList-' + questionObj.id + '-optionList-' + optionObj.id} className={(questionObj.field_value == optionObj.id) ? "multisel activated" : "multisel"} data-index={questionIdx} onClick={this.handleAnswerChange.bind(this, questionIdx, questionObj.id, optionObj.id)}>
                    <input data-index={questionIdx} data-question={questionObj.id} data-option={optionObj.id} className="servy-checkbox servy-radio preboxval" value={optionObj.id} name={questionObj.field_name} type="radio" onChange={this.handleInputChange} />
                    <span className="multi-sel-alpha">{serialCount}</span>
                    <label className="multisel-label" htmlFor={"Single_Choice_" + questionObj.id}>{optionObj.question_option}</label>
                    <i className="fa fa-check" />
                  </div>
                )
              })
            }
          </div>
        )
        break;
      case "Opinion Scale":
        returnHtml = (
          <div className="col-sm-12 opinion-scale">
            {(questionObj.why_choose === 1 && questionObj.display_step === 1)
              ?
              <input data-index={questionIdx} data-question={questionObj.id} data-option={-1} className="report-input" value={questionObj.field_value_why} name={questionObj.field_name_why} type="text" onChange={this.handleInputChange} placeholder="Write your answer here..." autoComplete="off" />
              :
              <div>
                <ul className={questionObj.class_name}>
                  {((questionObj.procedure_template_question_option) && questionObj.procedure_template_question_option.length > 0) &&
                    questionObj.procedure_template_question_option.map((optionObj, optionIdx) => {
                      return (
                        <li key={'templateQuesionList-' + questionObj.id + '-optionList-' + optionObj.id} className={(questionObj.field_value == optionObj.id) ? "survey-li preboxval survey-li-active" : "survey-li preboxval"} onClick={this.handleAnswerChange.bind(this, questionIdx, questionObj.id, optionObj.id)} >{optionObj.question_option}</li>
                      )
                    })
                  }
                </ul>
                <div className={'likeornot m-b-20'}><span>{this.state.languageData.pro_not_likely}</span> <span className="pull-right">{this.state.languageData.pro_likely}</span></div>
              </div>
            }
          </div>
        )
        break;
      default:
        return null
        break;
    }
    return returnHtml;
  }

  render() {
    let patientName = (this.state.procedureData && this.state.procedureData.patient_name) ? this.state.procedureData.patient_name : ''

    //let defLogo       = (this.state.procedureID) ? "../../../../../images/appmale.png" : "../../../../images/appmale.png";

    let procedureTemplateList = '';
    if (this.state.procedureTemplateList.length > 0) {
      procedureTemplateList = this.state.procedureTemplateList.map((obj, idx) => {
        let apptDateTime = showFormattedDate(obj.appointment_datetime, true)
        return <option key={idx} value={obj.id}>{obj.title}</option>
      })
    }

    let appointmentList = '';
    if (this.state.appointmentList.length > 0) {
      appointmentList = this.state.appointmentList.map((obj, idx) => {
        let apptDateTime = showFormattedDate(obj.appointment_datetime, true)
        return <option key={idx} value={obj.id}>{patientName + ' - ' + apptDateTime}</option>
      })
    }

    let providerList = '';
    if (this.state.providerList.length > 0) {
      providerList = this.state.providerList.map((obj, idx) => {
        let providerName = displayName(obj)
        return <option key={idx} value={obj.id}>{providerName}</option>
      })
    }

    let associatedClinics = '';
    if (this.state.associatedClinics.length > 0) {
      associatedClinics = this.state.associatedClinics.map((obj, idx) => {
        return <option key={idx} value={obj.id}>{obj.clinic_name}</option>
      })
    }

    let templateQuesionList = ''
    if (this.state.templateQuesionList.length > 0) {
      templateQuesionList = this.state.templateQuesionList.map((questionObj, questionIdx) => {
        return (
          <div key={'templateQuesionList-' + questionObj.id} id={"question-outer-" + questionObj.id} className="report-question-outer" style={{ 'display': (questionObj.isShow) ? 'block' : 'none' }}>
            {(questionObj.question_type === "Opinion Scale" && questionObj.why_choose === 1 && questionObj.display_step === 1) ?
              <div className="survey-title no-margin" id={"question-" + questionObj.id}>{this.state.languageData.pro_why_did_choose}</div>
              :
              <div>
                <div className="survey-title no-margin" id={"question-" + questionObj.id}>{questionObj.question}{(questionObj.required == 1) && <span className="setting-require font-size-16">*</span>}</div>
                {(questionObj.description == 1) &&
                  <div className="quest-discription" id={"question-description-" + questionObj.id}> {questionObj.description_text}</div>
                }
              </div>
            }
            {this.renderInputFields(questionObj, questionIdx)}
            {(questionIdx !== 0) &&
              <button id={"back_ok-"+questionObj.id} className="back-ok m-r-20" onClick={this.handleBackNext.bind(this, questionIdx, questionObj.id, 'back')}>{this.state.languageData.pro_back}<i className="fa fa-arrow-left"></i></button>
            }
            <button id={"rating-ok"+questionObj.id} className="report-btn" onClick={(this.state.invoice_id != 0 && this.state.templateQuesionList[questionIdx + 1] === undefined) ? this.handleSubmit : this.handleBackNext.bind(this, questionIdx, questionObj.id, 'next')} style={{ 'display': (questionObj.question_type === "Opinion Scale" && questionObj.why_choose === 1 && questionObj.display_step === 0 && questionObj.required === 1) ? 'none' : 'block' }}>{(this.state.invoice_id != 0 && this.state.templateQuesionList[questionIdx + 1 ] === undefined) ? this.state.languageData.clientprofile_save : this.state.languageData.pro_ok }<i className="fa fa-check" /></button>
          </div>
        )
      })
    }



    return (
      <div id="content" className="content-health-timeline-procedure">
        <form action="javascript:void(0);">
          <div className="container-fluid content setting-wrapper add-edit-procedure">
            <div className="juvly-section full-width m-t-15">
              <div className="juvly-container">


                <div className="juvly-title m-b-40">
                  {(this.state.showLoader === false) ? ((this.state.procedureID) ? patientName + ' - ' + this.state.languageData.pro_edit_procedure : patientName + ' - ' + this.state.languageData.pro_add_procedure) : ''}
                  <Link to={this.state.returnTo} className="pull-right"><img src={crossImage} /></Link>
                </div>


                <div className="row">
                  {(this.state.procedureID <= 0) &&
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.pro_template}<span className="required">*</span></div>
                        <select name="procedure_template_id" className={this.state.procedureTemplateIdClass} onChange={this.handleInputChange} value={this.state.procedure_template_id}>
                          <option value="0">Select</option>
                          {procedureTemplateList}
                        </select>
                      </div>
                    </div>
                  }
                  <div className={(this.state.procedureID <= 0) ? "col-md-3 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12"}>
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_appointment}</div>
                      <select name="appointment_id" className={this.state.appointmentIdClass} onChange={this.handleInputChange} value={this.state.appointment_id}>
                        <option value='0'>Select</option>
                        {appointmentList}
                      </select>
                    </div>
                  </div>
                  <div className={(this.state.procedureID <= 0) ? "col-md-3 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12"}>
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.clientprofile_provider} <span className="required">*</span></div>
                      <select name="user_id" className={this.state.userIdClass} onChange={this.handleInputChange} value={this.state.user_id}>
                        <option value='0'>Select</option>
                        {providerList}
                      </select>
                    </div>
                  </div>
                  <div className={(this.state.procedureID <= 0) ? "col-md-3 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12"}>
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.languageData.pro_clinic} <span className="required">*</span></div>
                      <select name="clinic_id" className={this.state.clinicIdClass} onChange={this.handleInputChange} value={this.state.clinic_id}>
                        <option value='0'>Select</option>
                        {associatedClinics}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="half-preview healthtimeline" id="half-preview -12">
                  {templateQuesionList}
                  {(templateQuesionList !== '') &&
                    <div key={'consultation_fee'} id={"qconsultation-fee-0"} className="report-question-outer" style={{ 'display': (this.state.consultationFeeShow) ? 'block' : 'none' }}>
                      <div className="survey-title no-margin" id={"consultation-fee-1"}>{this.state.languageData.pro_consultation_fee}</div>
                      <input className={this.state.consultationFeeClass} value={this.state.consultation_fee} name="consultation_fee" type="text" onChange={this.handleInputChange} placeholder="Write your answer here..." autoComplete="off" />
                      <button id="back_ok-consultation-fee-0" className="back-ok m-r-20" onClick={this.handleBackNext.bind(this, -1, -1, 'back')}>{this.state.languageData.pro_back}<i className="fa fa-arrow-left"></i></button>
                      <button id="rating-ok-consultation-fee-1" className="report-btn" onClick={this.handleSubmit}>{this.state.globalLang.label_save} <i className="fa fa-check" /></button>
                    </div>
                  }
                </div>

              </div>

              <div className={(this.state.showModal === true) ? 'overlay' : ''}></div>
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
  const returnState = {};

  if (state.ProcedureReducer.action === 'GET_HEALTH_PROCEDURE_DATA') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ProcedureReducer.data.message]);
      if ( state.ProcedureReducer.data.message === 'procedure_not_found' ) {
        returnState.message = languageData.global[state.ProcedureReducer.data.message]
        returnState.procedureNotFound = true
      } else {
        returnState.showLoader = false
      }
    } else {
      returnState.procedureData = state.ProcedureReducer.data.data
    }
  }

  if (state.ProcedureReducer.action === 'SAVE_HEALTH_PROCEDURE_DATA') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.message = languageData.global[state.ProcedureReducer.data.message]
      returnState.redirect = true
    }
  }


  if (state.ProcedureReducer.action === 'GET_APPT_CONSULT_DATA') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.apptConsultData = state.ProcedureReducer.data.data
    }
  }

  if (state.ProcedureReducer.action === 'GET_ASSOCIATED_CLINICS') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.clinicData = state.ProcedureReducer.data.data
    }
  }

  if (state.ProcedureReducer.action === 'GET_HEALTH_PROCEDURE_TEMPLATE_DATA') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.procedureTemplateData = state.ProcedureReducer.data.data
    }
  }

  if (state.ProcedureReducer.action === 'DELETE_PROCEDURE') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.deleteProData = state.ProcedureReducer.data
    } else {
      returnState.message = languageData.global[state.ProcedureReducer.data.message]
      returnState.redirect = true
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getHealthProcedureData: getHealthProcedureData, saveHealthProcedureData:saveHealthProcedureData, deleteProcedure:deleteProcedure, getApptConsultData: getApptConsultData, getAssociatedClinics: getAssociatedClinics, getProcedureTemplateData: getProcedureTemplateData, emptyProcedureReducer: emptyProcedureReducer }, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(ProcedureHealth);
