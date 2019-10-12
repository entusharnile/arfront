import React, { Component } from 'react';
import {
  fetchServiceAndListData,
  createService,
  updateService,
  deleteService,
  exportEmptyData,
  createServiceCategory,
  createDevice
} from '../../../Actions/Appointment/appointmentAction.js';
import {geCommonTrackEvent} from '../../../Actions/Common/commonAction.js';
import config from '../../../config.js';
import { ToastContainer, toast } from "react-toastify";
import { Link, Redirect, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TagAutoSelect from './../Common/TagAutoSelect.js';
import AppointmentHeader from '../AppointmentHeader.js'

const getAutoSelectOptions = (validTagList, keyName) => {
  keyName = keyName || 'name'
  let optionList = []
  if (typeof validTagList === 'array' || typeof validTagList === 'object') {
    validTagList.map((validObj, validIdx) => {
      const option = {
        label: validObj[keyName],
        value: validObj.id,
      }
      optionList.push(option);
    });
  }
  return optionList;
}

const getAutoSelectValues = (validTagList, selectedTagList, keyName, isOptionType) => {
  isOptionType = isOptionType || false;
  let valueList = []
  if (typeof selectedTagList === 'array' || typeof selectedTagList === 'object') {
    selectedTagList.map((selectedObj, selectedIdx) => {
      validTagList.map((validObj, validIdx) => {
        if (isOptionType) {
          if (selectedObj[keyName] == validObj.value) {
            const value = {
              label: validObj.label,
              value: validObj.value,
            }
            valueList.push(value)
          }
        } else {
          if (selectedObj[keyName] == validObj.id) {
            const value = {
              label: validObj.name,
              value: validObj.id,
            }
            valueList.push(value)
          }
        }
      });
    });
  }
  return valueList;
}

const initSurvey = () => {
  return { survey_id: '', scheduled: '1-hour', custom_scheduled_after: '', schedule_type: 'hours', custom_days: 0, scheduled_after: '' }
}

const setMultipleSurveyList = (surveyData) => {
  let multipleSurveyList = [];
  if (surveyData !== undefined && surveyData.length) {
    surveyData.map((obj, idx) => {
      const surveyData = {
        survey_id: obj.survey_id,
        custom_days: obj.custom_days,
        scheduled: (obj.custom_days) ? 'custom' : (obj.schedule_type === "hours") ? obj.scheduled_after +'-hour' :  obj.scheduled_after,
        scheduled_after: obj.scheduled_after,
        custom_scheduled_after: (obj.custom_days) ? obj.scheduled_after : '',
        schedule_type: obj.schedule_type,
      }
      multipleSurveyList.push(surveyData);
    });
  } else {
    multipleSurveyList = [initSurvey()];
  }
  return multipleSurveyList;
}

const isNotEmpty = (value) => {
  let returnFlag = true;
  if (value != undefined && typeof value != undefined && value != null && value != '') {
    if (typeof value == 'string' && value.trim() === '') {
      returnFlag = false
    }
  } else {
    returnFlag = false
  }

  return returnFlag;
}

class CreateEditServices extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.state = {
      serviceData: {},
      listData: {},
      serviceCategoryId: 0,
      serviceId: 0,
      cloneId: 0,
      deposit: "",
      hideBtns: false,
      showModal: false,
      showLoader: false,
      userChanged: false,
      depositError: false,
      name: '',
      is_device_dependent: false,
      is_available_online: false,
      is_service_free: false,
      free_consultation: false,
      description: '',
      categoryList: {
        options: [],
        value: [],
        selectedId: [],
      },
      clinicList: {
        options: [],
        value: [],
        selectedId: [],
      },
      deviceList: {
        options: [],
        value: [],
        selectedId: [],
      },
      questionnaireList: {
        options: [],
        value: [],
        selectedId: [],
      },
      providerList: {
        options: [],
        value: [],
        selectedId: [],
      },
      resourceList: {
        options: [],
        value: [],
        selectedId: [],
      },
      serviceList: {
        options: [],
        value: [],
        selectedId: [],
      },
      preTreatmentInstructionList: {
        options: [],
        value: [],
        selectedId: [],
      },
      postTreatmentInstructionList: {
        options: [],
        value: [],
        selectedId: [],
      },
      multipleSurveyList: [initSurvey()],
      duration: '',
      custom_duration: '',
      surveyList: [],
      survey_id: [],
      scheduled: '',
      is_send_custom: false,
      is_add_new_category: false,
      addNewCategoryName: '',
      is_add_new_device: false,
      addNewDeviceName: '',
      nameClass: 'newInputField',
      categoriesClass: 'newInputField',
      addNewCategoryNameClass: 'newInputField',
      addNewDeviceNameClass: 'newInputField',
      categoryListClass: 'newInputField',
      clinicListClass: 'newInputField',
      deviceListClass: 'newInputField',
      questionnaireListClass: 'newInputField',
      providerListClass: 'newInputField',
      resourceListClass: 'newInputField',
      serviceListClass: 'newInputField',
      preTreatmentInstructionListClass: 'newInputField',
      postTreatmentInstructionListClass: 'newInputField',
      postTreatmentInstructionListClass: 'newInputField',
      durationClass: 'newSelectField',
      customDurationClass: 'newInputField',
      descriptionClass: 'newtextareaField',
      multipleSurveyListClass: [{ survey_id: 'newSelectField', scheduled: 'newSelectField', custom_scheduled_after: 'newInputField', schedule_type: 'newSelectField' }],
      tabMode: 'general'
    };
  }

  componentDidMount() {
    window.onscroll = () => {
      return false;
    }
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      appointment_service_create_service: languageData.appointments['appointment_service_create_service'],
      appointment_service_edit_service: languageData.appointments['appointment_service_edit_service'],
      appointment_service_services: languageData.appointments['appointment_service_services'],
      appointment_service_service_name: languageData.appointments['appointment_service_service_name'],
      appointment_service_service_category: languageData.appointments['appointment_service_service_category'],
      appointment_add_new_category: languageData.appointments['appointment_add_new_category'],
      appointment_new_category_name: languageData.appointments['appointment_new_category_name'],
      appointment_service_available_at_clinics: languageData.appointments['appointment_service_available_at_clinics'],
      appointment_service_does_this_service_require_equipment: languageData.appointments['appointment_service_does_this_service_require_equipment'],
      appointment_service_select_devices: languageData.appointments['appointment_service_select_devices'],
      appointment_add_new_device: languageData.appointments['appointment_add_new_device'],
      appointment_new_device_name: languageData.appointments['appointment_new_device_name'],
      appointment_service_is_this_service_available_for_smart_booking: languageData.appointments['appointment_service_is_this_service_available_for_smart_booking'],
      appointment_service_disable_card_capture_for_this_service: languageData.appointments['appointment_service_disable_card_capture_for_this_service'],
      appointment_service_is_this_service_a_free_consultation: languageData.appointments['appointment_service_is_this_service_a_free_consultation'],
      appointment_service_select_questionnaires: languageData.appointments['appointment_service_select_questionnaires'],
      appointment_service_select_providers: languageData.appointments['appointment_service_select_providers'],
      appointment_service_select_resources: languageData.appointments['appointment_service_select_resources'],
      appointment_service_can_not_book_with: languageData.appointments['appointment_service_can_not_book_with'],
      appointment_service_select_pre_treatment_instructions: languageData.appointments['appointment_service_select_pre_treatment_instructions'],
      appointment_service_select_post_treatment_instructions: languageData.appointments['appointment_service_select_post_treatment_instructions'],
      appointment_service_select_duration: languageData.appointments['appointment_service_select_duration'],
      appointment_service_description_shown_for_smart_booking: languageData.appointments['appointment_service_description_shown_for_smart_booking'],
      appointment_service_select_survey: languageData.appointments['appointment_service_select_survey'],
      appointment_service_send: languageData.appointments['appointment_service_send'],
      appointment_service_services: languageData.appointments['appointment_service_services'],
      appointment_service_surveys: languageData.appointments['appointment_service_surveys'],
      service_delete_msg: languageData.appointments['service_delete_msg'],
      label_save: languageData.global['label_save'],
      label_cancel: languageData.global['label_cancel'],
      label_delete: languageData.global['label_delete'],
      label_yes: languageData.global['label_yes'],
      label_no: languageData.global['label_no'],
      Please_Wait: languageData.global['Please_Wait'],
      delete_confirmation: languageData.global['delete_confirmation'],
      serviceDataTimeStamp : new Date(),
      showLoaderTimeStamp : new Date(),
    });

    //const serviceCategoryId = this.props.match.params.serviceCategoryId;
    const valTrack = "Service Category Setup";
    //if(!serviceCategoryId){
    this.props.geCommonTrackEvent(valTrack);
    //}

    /*const serviceCategoryId = this.props.match.params.serviceCategoryId;
    const valTrack = "Service Category Setup";
    if(!serviceCategoryId){
      this.props.geCommonTrackEvent(valTrack);
    }*/

    /*const serviceCategoryId = this.props.serviceId;
    if (serviceCategoryId) {
      this.setState({ serviceCategoryId: serviceCategoryId });
    }*/

    let returnState = {};
    let fetchServiceId = 0
    const serviceId = this.props.serviceId;
    const serviceMode = this.props.serviceMode;
    if (serviceId && serviceMode == 'edit') {
      fetchServiceId = serviceId;
      returnState.serviceId = serviceId;
      returnState.whichMode = 'edit';
    } else if(serviceId && serviceMode == 'clone') {
      fetchServiceId = serviceId;
      returnState.cloneId = serviceId;
    } else {
      returnState.whichMode = 'create';
    }

    returnState.showLoader = true;

    this.setState(returnState)
    this.props.fetchServiceAndListData({}, fetchServiceId);

  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {}
    if (props.showLoader != undefined && props.showLoader == false && props.showLoaderTimeStamp != state.showLoaderTimeStamp) {
      return { showLoader: false, showLoaderTimeStamp: props.showLoaderTimeStamp };
    }
    if (props.serviceData !== undefined && props.status === 200 && props.serviceData !== state.serviceData && props.serviceDataTimeStamp != state.serviceDataTimeStamp) {
      returnState.serviceData = props.serviceData;
      returnState.name = (state.serviceId || state.cloneId > 0) ? props.serviceData.name : state.name;
      returnState.description = (state.serviceId > 0 || state.cloneId > 0) ? props.serviceData.description : state.description;
      /*returnState.is_pre_payment_accepted = (state.serviceId || state.cloneId > 0) ? ((props.serviceData.is_pre_payment_accepted == 1) ? true : false) : state.is_pre_payment_accepted;
      if(returnState.is_pre_payment_accepted) {
        returnState.deposit = props.serviceData.deposit;
      }*/

      returnState.is_device_dependent = (state.serviceId || state.cloneId > 0) ? ((props.serviceData.is_device_dependent == 1) ? true : false) : state.is_device_dependent;
      returnState.is_available_online = (state.serviceId || state.cloneId > 0) ? ((props.serviceData.is_available_online == 1) ? true : false) : state.is_available_online;
      returnState.is_service_free = (state.serviceId || state.cloneId > 0) ? ((props.serviceData.is_service_free == 1) ? true : false) : state.is_service_free;
      returnState.free_consultation = (state.serviceId || state.cloneId > 0) ? ((props.serviceData.free_consultation == 1) ? true : false) : state.free_consultation;
      returnState.duration = (state.serviceId || state.cloneId > 0) ? ((props.serviceData.custom_duration) ? 'custom' : props.serviceData.duration) : state.duration;
      returnState.custom_duration = (state.serviceId || state.cloneId > 0) ? ((props.serviceData.custom_duration) ? props.serviceData.duration : '') : state.custom_duration;
      returnState.multipleSurveyList = (state.serviceId || state.cloneId > 0) ? setMultipleSurveyList(props.serviceData.service_surveys) : state.multipleSurveyList;
      returnState.showLoader = false;
      returnState.serviceDataTimeStamp = props.serviceDataTimeStamp;
      if (props.listData !== undefined && props.listData.length != 0 && props.listData !== state.listData) {
        returnState.listData = props.listData;

        let catList = getAutoSelectOptions(props.listData.categories);
        //catList.push({label: 'Create New Category', value: 'addnewcat'});
        returnState.categoryList = {
          options: (state.userChanged) ? state.categoryList.options : catList,
          value: (state.userChanged) ? state.categoryList.value : getAutoSelectValues(props.listData.categories, props.serviceData.service_category_assoc, 'category_id'),
          selectedId: [],
        }



        // set by defffaulllt ccatgorry for new services
        if (state.serviceCategoryId > 0 && state.serviceId == 0) {
          let index = returnState.categoryList.options.findIndex(y => y.value == state.serviceCategoryId);
          if (index !== -1) {
            returnState.categoryList.value = [returnState.categoryList.options[index]];
          }
        }

        const clinicList = getAutoSelectOptions(props.listData.clinics, 'clinic_name');
        returnState.clinicList = {
          options: (state.userChanged) ? state.clinicList.options : clinicList,
          value: (state.userChanged) ? state.clinicList.value : getAutoSelectValues(clinicList, props.serviceData.service_clinics, 'clinic_id', true),
          selectedId: [],
        }


        returnState.deviceList = {
          options: (state.userChanged) ? state.deviceList.options : getAutoSelectOptions(props.listData.devices),
          value: (state.userChanged) ? state.deviceList.value : getAutoSelectValues(props.listData.devices, props.serviceData.service_devices, 'device_id'),
          selectedId: [],
        }

        const questionnaireList = getAutoSelectOptions(props.listData.questionnaires, 'consultation_title');
        returnState.questionnaireList = {
          options: (state.userChanged) ? state.questionnaireList.options : questionnaireList,
          value: (state.userChanged) ? state.questionnaireList.value : getAutoSelectValues(questionnaireList, props.serviceData.service_questionnaires, 'questionnaire_id', true),
          selectedId: [],
        }

        let providerList = [];
        props.listData.providers.map((obj, idx) => {
          return providerList.push({ value: obj.id, label: obj.firstname + " " + obj.lastname })
        });
        returnState.providerList = {
          options: (state.userChanged) ? state.providerList.options : providerList,
          value: (state.userChanged) ? state.providerList.value : getAutoSelectValues(providerList, props.serviceData.service_providers, 'user_id', true),
          selectedId: [],
        }

        const resourceList = []; //getAutoSelectOptions(props.listData.resources);
        if(typeof props.listData.resources === 'array' || typeof props.listData.resources === 'object'){
          props.listData.resources.map((obj,idx) => {
            let resource = {}
            resource.value = obj.id
            resource.label = obj.name
            if(obj.resource_type !== undefined && obj.resource_type !== null && obj.resource_type.name !== undefined){
              resource.label = obj.name + ' - ' + obj.resource_type.name
            }
            resourceList.push(resource);
          })
        }
        returnState.resourceList = {
          options: (state.userChanged) ? state.resourceList.options : resourceList,
          value: (state.userChanged) ? state.resourceList.value : getAutoSelectValues(resourceList, props.serviceData.service_resources, 'resource_id', true),
          selectedId: [],
        }

        returnState.serviceList = {
          options: (state.userChanged) ? state.serviceList.options : getAutoSelectOptions(props.listData.services),
          value: (state.userChanged) ? state.serviceList.value : getAutoSelectValues(props.listData.services, props.serviceData.service_not_clubbables, 'not_clubbed_service'),
          selectedId: [],
        }

        const preTreatmentInstructionList = getAutoSelectOptions(props.listData.pre_treatment_instructions, 'title');
        returnState.preTreatmentInstructionList = {
          options: (state.userChanged) ? state.preTreatmentInstructionList.options : preTreatmentInstructionList,
          value: (state.userChanged) ? state.preTreatmentInstructionList.value : getAutoSelectValues(preTreatmentInstructionList, props.serviceData.service_pre_treatment_instruction, 'pre_treatment_instruction_id', true),
          selectedId: [],
        }

        const postTreatmentInstructionList = getAutoSelectOptions(props.listData.post_treatment_instructions, 'title');
        returnState.postTreatmentInstructionList = {
          options: (state.userChanged) ? state.postTreatmentInstructionList.options : postTreatmentInstructionList,
          value: (state.userChanged) ? state.postTreatmentInstructionList.value : getAutoSelectValues(postTreatmentInstructionList, props.serviceData.service_post_treatment_instruction, 'post_treatment_instruction_id', true),
          selectedId: [],
        }
        returnState.surveyList = (state.userChanged) ? state.surveyList : props.listData.surveys;
      }
    } else if (props.serviceCategoryData !== undefined && props.serviceCategoryData !== state.serviceCategoryData) {
      returnState.serviceCategoryData = props.serviceCategoryData;
      returnState.showLoader = false;
      /*let options = state.categoryList.options;
      options.push({ value: props.serviceCategoryData.id, label: props.serviceCategoryData.name });
      let value = state.categoryList.value;
      value.push({ value: props.serviceCategoryData.id, label: props.serviceCategoryData.name });
      let selectedId = state.categoryList.selectedId;
      selectedId.push(props.serviceCategoryData.id);
      let categoryList = {
        options: options,
        value: value,
        selectedId: selectedId,
      }
      returnState.categoryList = categoryList;*/

      let catList = getAutoSelectOptions(props.serviceCategoryData);
      catList.push({label: 'Create New Category', value: 'addnewcat'});
      let selectedId = state.categoryList.selectedId;
      console.log(props.serviceCategoryData[0].id);
      let value = state.categoryList.value;
      value.push({ value: props.serviceCategoryData[0].id, label: props.serviceCategoryData[0].name });
      selectedId.push(props.serviceCategoryData[0].id)
      returnState.categoryList = {
        options: catList,
        value: value,
        selectedId: selectedId,
      }

      returnState.is_add_new_category = false;
      returnState.addNewCategoryName = '';
      console.log(returnState);

    } else if (props.deviceData !== undefined && props.deviceData !== state.deviceData) {
      returnState.deviceData = props.deviceData;
      returnState.showLoader = false;
      let options = state.deviceList.options;
      options.push({ value: props.deviceData.current.id, label: props.deviceData.current.name });
      let value = state.deviceList.value;
      value.push({ value: props.deviceData.current.id, label: props.deviceData.current.name });
      let selectedId = state.deviceList.selectedId;
      selectedId.push(props.deviceData.current.id);
      let deviceList = {
        options: options,
        value: value,
        selectedId: selectedId,
      }
      returnState.deviceList = deviceList;
      returnState.is_add_new_device = false;
      returnState.addNewDeviceName = '';
    } else if (props.redirect != undefined && props.redirect == true) {
      toast.success(props.message)
      props.listServices();
    } else if (props.createdId != undefined && props.mode == 'create' && props.createdTimeStamp != state.createdTimeStamp) {
      returnState.serviceId = props.createdId;
      //returnState.whichMode = props.mode;
      if(state.modeToBeChanged == 'continue') {
        if(state.tabMode == 'general') {
          returnState.tabMode = 'clinical';
        } else if (state.tabMode == 'clinical') {
          returnState.tabMode = 'additional';
        } else {
          //returnState.tabMode = '';
          toast.success(props.message)
          props.listServices();
        }
      } else {
        returnState.tabMode = state.modeToBeChanged;
      }
      returnState.showLoader = false;
      returnState.createdTimeStamp = props.createdTimeStamp;
    } else if (props.showLoader != undefined && props.showLoader == false) {
      returnState.showLoader = false;
    }
    return returnState;
  }

  handleAddCategory = () => {
    this.setState({ is_add_new_category: !this.state.is_add_new_category, addNewCategoryNameClass: 'newInputField' });
  }

  handleAddDevice = () => {
    this.setState({ is_add_new_device: !this.state.is_add_new_device, addNewDeviceNameClass: 'newInputField' });
  }

  handleDeviceDependent = () => {
    this.setState({ is_device_dependent: !this.state.is_device_dependent, deviceListClass: 'newInputField' });
  }

  handleChildChange = (stateToUpdate, a) => {
    if(a == 'addnewcat') {
      this.setState({is_add_new_category: true})
    } else {
      this.setState(stateToUpdate);
      this.setState({ userChanged: true })
    }
  }


  handleInputChange = (event) => {
    let returnState = { userChanged: true }
    const target = event.target;
    let value = target.value;
    let inputName = target.name;
    const surveyindex = event.target.dataset.surveyindex;
    if (surveyindex) {
      const multipleSurveyList = this.state.multipleSurveyList;
      multipleSurveyList[surveyindex][inputName] = value;
      if (inputName == 'scheduled') {
        multipleSurveyList[surveyindex]['custom_days'] = "0";
        if (value == 'custom') {
          multipleSurveyList[surveyindex]['schedule_type'] = 'days';
          multipleSurveyList[surveyindex]['custom_scheduled_after'] = '';
          multipleSurveyList[surveyindex]['scheduled_after'] = '1';
          multipleSurveyList[surveyindex]['custom_days'] = "1";
        } else {
          switch (value) {
            case '1-hour':
              multipleSurveyList[surveyindex]['scheduled_after'] = '1';
              multipleSurveyList[surveyindex]['schedule_type'] = 'hours';
              multipleSurveyList[surveyindex]['custom_scheduled_after'] = '';
              break;
            case '2-hour':
              multipleSurveyList[surveyindex]['scheduled_after'] = '2';
              multipleSurveyList[surveyindex]['schedule_type'] = 'hours';
              multipleSurveyList[surveyindex]['custom_scheduled_after'] = '';
              break;
            default:
              multipleSurveyList[surveyindex]['schedule_type'] = 'days';
              multipleSurveyList[surveyindex]['custom_scheduled_after'] = '';
              multipleSurveyList[surveyindex]['scheduled_after'] = value;
              break;
          }
        }
      } else if (inputName == 'custom_scheduled_after' && multipleSurveyList[surveyindex]['scheduled'] == 'custom') {
        multipleSurveyList[surveyindex]['scheduled_after'] = multipleSurveyList[surveyindex]['custom_scheduled_after'];
      }
      this.setState({ multipleSurveyList: multipleSurveyList });
    } else {
      if (inputName == 'duration') {
        returnState.custom_duration = "";
        returnState.customDurationClass = "newInputField";
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

  createServiceCat = () => {
    let error = false;
    if (typeof this.state.addNewCategoryName === undefined || this.state.addNewCategoryName === null || this.state.addNewCategoryName.trim() === '') {
        this.setState({
          addNewCategoryNameClass: 'newInputField field_error'
        })
        error = true;
      } else if (this.state.addNewCategoryName) {
        this.setState({
          addNewCategoryNameClass: 'newInputField'
        })
      }
      if (error) {
        return;
      }

      let formData = {
        name: this.state.addNewCategoryName,
        is_active: 1
      }
      this.setState({
        showLoader: true
      });

      formData.from = "services";
      this.props.createServiceCategory(formData);
  }

  createDeviceForService = () => {
    let error = false;
    if (typeof this.state.addNewDeviceName === undefined || this.state.addNewDeviceName === null || this.state.addNewDeviceName.trim() === '') {
        this.setState({
          addNewDeviceNameClass: 'newInputField field_error'
        })
        error = true;
      } else if (this.state.addNewDeviceName) {
        this.setState({
          addNewDeviceNameClass: 'newInputField'
        })
      }
      if (error) {
        return;
      }

      let formData = {
        name: this.state.addNewDeviceName
      }
      this.setState({
        showLoader: true
      });
      this.props.createDevice(formData);
  }

  handleSubmit = (event) => {
    //====Frontend validation=================
      let error = false;
        const multipleSurveyList = this.state.multipleSurveyList;
        const multipleSurveyListClass = [];
        if (this.state.tabMode == 'general') {
          // category validation
          if (typeof this.state.categoryList.selectedId === undefined || this.state.categoryList.selectedId === null || this.state.categoryList.selectedId.length <= 0) {
            this.setState({ categoryListClass: 'newInputField field_error' })
            error = true;
          } else if (this.state.categoryList.selectedId.length > 0) {
            this.setState({ categoryListClass: 'newInputField' })
          }

          // new category validation
          if (this.state.is_add_new_category) {
            if (typeof this.state.addNewCategoryName === undefined || this.state.addNewCategoryName === null || this.state.addNewCategoryName.trim() === '') {
              this.setState({ addNewCategoryNameClass: 'newInputField field_error' })
              error = true;
            } else if (this.state.addNewCategoryName) {
              this.setState({ addNewCategoryNameClass: 'newInputField' })
            }
          }

          // name validation
          if (typeof this.state.name === undefined || this.state.name === null || this.state.name.trim() === '') {
            this.setState({ nameClass: 'newInputField field_error' })
            error = true;
          } else if (this.state.name) {
            this.setState({ nameClass: 'newInputField' })
          }

          // available clinics validation
          if (typeof this.state.clinicList.selectedId === undefined || this.state.clinicList.selectedId === null || this.state.clinicList.selectedId <= 0) {
            this.setState({ clinicListClass: 'newInputField field_error' })
            error = true;
          } else if (this.state.clinicList.selectedId.length > 0) {
            this.setState({ clinicListClass: 'newInputField' })
          }

          // provider list validation
          if (typeof this.state.providerList.selectedId === undefined || this.state.providerList.selectedId === null || this.state.providerList.selectedId <= 0) {
            this.setState({ providerListClass: 'newInputField field_error' })
            error = true;
          } else if (this.state.providerList.selectedId.length > 0) {
            this.setState({ providerListClass: 'newInputField' })
          }


          // duration validation
          if (!isNotEmpty(this.state.duration) || this.state.duration == 0) {
            this.setState({ durationClass: 'newSelectField field_error' })
            error = true;
          } else if (this.state.duration) {
            this.setState({ durationClass: 'newSelectField' })
            if (this.state.duration == 'custom') {
              if (!isNotEmpty(this.state.custom_duration) || parseInt(this.state.custom_duration) < 10) {
                this.setState({ customDurationClass: 'newInputField field_error' })
                error = true;
              } else if (this.state.custom_duration) {
                this.setState({ customDurationClass: 'newInputField' })
              }
            }
          } else {
            this.setState({ customDurationClass: 'newInputField' })
          }
        }


    if (this.state.tabMode == 'additional') {
      if (this.state.is_device_dependent) {
            if (typeof this.state.deviceList.selectedId === undefined || this.state.deviceList.selectedId === null || this.state.deviceList.selectedId <= 0) {
              this.setState({ deviceListClass: 'newInputField field_error' })
              error = true;
            } else if (this.state.deviceList.selectedId.length > 0) {
              this.setState({ deviceListClass: 'newInputField' })
            }

            if (this.state.is_add_new_device) {
              if (typeof this.state.addNewDeviceName === undefined || this.state.addNewDeviceName === null || this.state.addNewDeviceName.trim() === '') {
                this.setState({ addNewDeviceNameClass: 'newInputField field_error' })
                error = true;
              } else if (this.state.addNewDeviceName) {
                this.setState({ addNewDeviceNameClass: 'newInputField' })
              }
            }
          } else {
            this.setState({ deviceListClass: 'newInputField' })
          }

          /*if(this.state.is_pre_payment_accepted) {
            if(typeof this.state.deposit === undefined || this.state.deposit === null || this.state.deposit === '') {
              this.setState({ depositError: true })
                error = true;
            } else if(isNaN(this.state.deposit)) {
              this.setState({ depositError: true })
                error = true;
            } else {
              console.log('3');
              if(this.state.deposit > 0) {
                this.setState({ depositError: false })
              } else {
                console.log('4');
                this.setState({ depositError: true })
                error = true;
              }
            }
          }*/
        }



    if(this.state.tabMode == 'clinical'){
      if (typeof this.state.description === undefined || this.state.description === null || this.state.description.trim() === '') {
            this.setState({ descriptionClass: 'newtextareaField field_error' })
            error = true;
          } else if (this.state.description) {
            this.setState({ descriptionClass: 'newtextareaField' })
          }


          multipleSurveyList.map((obj, surveyindex) => {
            const survayClass = {};
            if (obj.survey_id === null || obj.survey_id === '') {
              if (multipleSurveyList.length > 1) {
                survayClass.survey_id = 'newSelectField field_error';
                error = true;
              } else {
                survayClass.survey_id = 'newSelectField';
              }
            } else {
              survayClass.survey_id = 'newSelectField';
            }
            if (obj.scheduled === null || obj.scheduled === '') {
              survayClass.scheduled = 'newSelectField field_error';

            } else {
              survayClass.scheduled = 'newSelectField';
              multipleSurveyList[surveyindex]['custom_days'] = "0";
              if (obj.scheduled == 'custom') {
                multipleSurveyList[surveyindex]['scheduled_after'] = obj.custom_scheduled_after;
                multipleSurveyList[surveyindex]['custom_days'] = "1";
              } else {
                switch (obj.scheduled) {
                  case '1-hour':
                    multipleSurveyList[surveyindex]['scheduled_after'] = '1';
                    multipleSurveyList[surveyindex]['schedule_type'] = 'hours';
                    multipleSurveyList[surveyindex]['custom_scheduled_after'] = '';
                    break;
                  case '2-hour':
                    multipleSurveyList[surveyindex]['scheduled_after'] = '2';
                    multipleSurveyList[surveyindex]['schedule_type'] = 'hours';
                    multipleSurveyList[surveyindex]['custom_scheduled_after'] = '';
                    break;
                  default:
                    multipleSurveyList[surveyindex]['scheduled_after'] = obj.scheduled;
                    multipleSurveyList[surveyindex]['schedule_type'] = "days";
                    multipleSurveyList[surveyindex]['custom_scheduled_after'] = '';
                }
              }
            }
            if (obj.scheduled == 'custom' && (obj.custom_scheduled_after === null || obj.custom_scheduled_after === '' || parseInt(obj.custom_scheduled_after) < 0)) {
              survayClass.custom_scheduled_after = 'newInputField field_error';
              error = true;
              const languageData = JSON.parse(localStorage.getItem('languageData'));
              toast.dismiss();
              toast.error(languageData.global['validation_scheduled_after_integer']);
            } else {
              survayClass.custom_scheduled_after = 'newInputField';
            }
            if (obj.scheduled == 'custom' && (obj.schedule_type === null || obj.schedule_type === '')) {
              survayClass.schedule_type = 'newSelectField field_error';
              error = true;
            } else {
              survayClass.schedule_type = 'newSelectField';
            }
            multipleSurveyListClass.push(survayClass);
          });
          this.setState({ multipleSurveyList: multipleSurveyList, multipleSurveyListClass: multipleSurveyListClass });
      }
      if (error === true) {
        return;
      }

      let formData = {};
      if(this.state.tabMode == 'general'){
        formData.name= this.state.name;
        formData.categories= this.state.categoryList.selectedId;
        formData.clinics= this.state.clinicList.selectedId;
        formData.providers= this.state.providerList.selectedId;
        formData.duration= (this.state.duration == 'custom') ? this.state.custom_duration : this.state.duration;
        formData.not_clubbed_services= this.state.serviceList.selectedId;
        formData.custom_duration= (this.state.duration == 'custom') ? 1 : 0;
        formData.step = 1;
      }

      if(this.state.tabMode == 'clinical') {
        formData.questionnaires= this.state.questionnaireList.selectedId;
        formData.resources= this.state.resourceList.selectedId;
        formData.pre_instructions= this.state.preTreatmentInstructionList.selectedId;
        formData.post_instructions= this.state.postTreatmentInstructionList.selectedId;
        formData.description= this.state.description;
        formData.step = 2;
        if (multipleSurveyList.length > 1) {
          formData.surveys = multipleSurveyList;
        } else {
          if (multipleSurveyList[0].survey_id > 0) {
            formData.surveys = multipleSurveyList;
          }
        }
      }

      if(this.state.tabMode == 'additional') {
        formData.devices = (this.state.is_device_dependent == true || this.state.is_device_dependent == 'true') ? this.state.deviceList.selectedId : [];
        formData.is_device_dependent = (this.state.is_device_dependent == true || this.state.is_device_dependent == 'true') ? 1 : 0;
        formData.is_available_online = (this.state.is_available_online == true || this.state.is_available_online == 'true') ? 1 : 0;
        formData.is_service_free = (this.state.is_service_free == true || this.state.is_service_free == 'true') ? 1 : 0;
        formData.free_consultation = (this.state.free_consultation == true || this.state.free_consultation == 'true') ? 1 : 0;
        //formData.is_pre_payment_accepted = (this.state.is_pre_payment_accepted == true || this.state.is_pre_payment_accepted == 'true') ? 1 : 0;
        formData.step = 3;
        /*if(this.state.is_pre_payment_accepted) {
          formData.deposit = this.state.deposit;
        }*/
      }
      formData.mode = (this.state.whichMode == 'edit') ? 'edit' : 'add';


      //const serviceCategoryId = this.state.serviceCategoryId;
      //if (serviceCategoryId) {
      this.setState({
        showLoader: true
      });
      const serviceId = this.state.serviceId;
      if (serviceId) {
        this.props.updateService(formData, 0, serviceId);
      } else {
        this.props.createService(formData, 0);
      }
        //}

  };

  ServiceBack = () => {
    return <div>{this.props.history.push(`/appointment/services/${this.state.serviceCategoryId}`)}</div>;
  }

  addMultipleSurvey = () => {
    const multipleSurveyList = this.state.multipleSurveyList;
    let returnState = {};
    multipleSurveyList.push(initSurvey());
    this.setState({ multipleSurveyList: multipleSurveyList });
  }

  deleteMultipleSurvey = (event) => {
    let returnState = {};
    const multipleSurveyList = this.state.multipleSurveyList;
    if (multipleSurveyList.length == 1) { return false }
    const surveyindex = event.target.dataset.surveyindex;
    multipleSurveyList.splice(surveyindex, 1);
    const multipleSurveyListClass = this.state.multipleSurveyListClass;
    if (multipleSurveyListClass[surveyindex] != undefined) {
      multipleSurveyListClass.splice(surveyindex, 1);
    }
    this.setState({ multipleSurveyList: multipleSurveyList, multipleSurveyListClass: multipleSurveyListClass });
  }

  showDeleteModal = () => {
    this.setState({ showModal: true })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteService = () => {
    if (this.state.serviceId) {
      this.setState({ showLoader: true, hideBtns: true })
      this.dismissModal();
      this.props.deleteService(this.state.serviceId);
    }
  }

  changeTab = (mode) => {
    if(mode != 'general' && !this.state.serviceId) {
      return;
    }
    this.setState({modeToBeChanged : mode, clickedOn: 'tabs'}, () => {
      this.handleSubmit();
    })
    //this.setState({tabMode : mode})
  }

  continueSave = () => {
    this.setState({modeToBeChanged: 'continue'}, () => {
      this.handleSubmit();
    });
  }

  render() {
    return (
      <div className="setting-setion">
          <div className="appointment-container">
            <div className="juvly-title">Create / Edit Service(s)<a onClick={() => {this.props.listServices()}} className="pull-right cross-icon"><img src="/images/close.png" /></a></div>

            <ul className="appointment-tabs">
              <li name='tabs'><a onClick={this.changeTab.bind(this, 'general')} className={ ( this.state.tabMode == 'general') ? "active" : ""} name='tabs'>1. General</a></li>
              <li name='tabs'><a onClick={this.changeTab.bind(this, 'clinical')} className={ ( this.state.tabMode == 'clinical') ? "active" : ""} name='tabs'>2. Clinical resources</a></li>
              <li name='tabs'><a onClick={this.changeTab.bind(this, 'additional')} className={ ( this.state.tabMode == 'additional') ? "active" : ""} name='tabs'>3. Additional Info</a></li>
            </ul>
            <div className={(this.state.tabMode == 'general') ? "row" : "row no-display" }>
              {/*Service Category*/}
              <div className="col-xs-12 col-md-6 col-sm-6">
                <div className="newInputFileldOuter relative">
                  <div className="newInputLabel">{this.state.appointment_service_service_category} <span className="setting-require">*</span></div>
                      <TagAutoSelect
                        inputClassName={this.state.categoryListClass}
                        handleChildChange={this.handleChildChange}
                        options={this.state.categoryList.options}
                        value={this.state.categoryList.value}
                        listName='categoryList'
                      />

                </div>
              </div>

              {/*Add New Category*/}
              {
                (this.state.is_add_new_category) &&
                <div className="col-xs-12 col-md-6 col-sm-6">
                  <div className="newInputFileldOuter relative">
                    <div className="newInputLabel">{this.state.appointment_new_category_name} <span className="setting-require">*</span></div>
                    <div className="row">
                      <div className="col-lg-7 col-xs-12">
                        <input name="addNewCategoryName" className={this.state.addNewCategoryNameClass} maxLength={255} type="text" value={this.state.addNewCategoryName} onChange={this.handleInputChange} autoComplete="off" />
                      </div>
                      <div className="col-lg-5 col-xs-12 add-category-outer text-right m-t-5">
                        <a href="javascript:void(0);" className="new-white-btn sm-btn no-margin" name='addNewCategoryNameSave' onClick={this.createServiceCat}>{this.state.label_save}</a>
                        <a href="javascript:void(0);" className="new-white-btn sm-btn" onClick={this.handleAddCategory}>{this.state.label_cancel}</a>
                      </div>
                    </div>
                  </div>
                </div>
              }

              {/*Service Name*/}
              <div className="col-xs-12 col-md-6 col-sm-6">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_service_name} <span className="setting-require">*</span></div>
                  <input name="name" id="name" className={this.state.nameClass} maxLength={255} type="text" value={this.state.name} onChange={this.handleInputChange} autoComplete="off" />
                </div>
              </div>
            </div>

            <div className={(this.state.tabMode == 'general') ? "row" : "row no-display" }>

              {/*Available At Clinics*/}
              <div className="col-xs-12 col-md-6 col-sm-6">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_available_at_clinics} <span className="setting-require">*</span></div>
                  <div className="setting-input-outer">
                    <TagAutoSelect
                      inputClassName={this.state.clinicListClass}
                      handleChildChange={this.handleChildChange}
                      options={this.state.clinicList.options}
                      value={this.state.clinicList.value}
                      listName='clinicList'
                    />
                  </div>
                </div>
              </div>


              {/*Select Providers*/}
              <div className="col-xs-12 col-md-6 col-sm-6">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_select_providers} <span className="setting-require">*</span></div>
                  <div className="setting-input-outer">
                    <TagAutoSelect
                      inputClassName={this.state.providerListClass}
                      handleChildChange={this.handleChildChange}
                      options={this.state.providerList.options}
                      value={this.state.providerList.value}
                      listName='providerList'
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={(this.state.tabMode == 'general') ? "row" : "row no-display" }>
              {/*Select Duration*/}
              <div className="col-xs-12 col-md-3 col-sm-6">
                <div className="newInputFileldOuter">
                    <div className="newInputLabel">{this.state.appointment_service_select_duration} <span className="setting-require">*</span></div>
                    <select className={this.state.durationClass} name="duration" value={this.state.duration} onChange={this.handleInputChange} >
                      <option value="0">Please select</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="75">1 hour 15 minutes</option>
                      <option value="90">1 hour 30 minutes</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
              </div>

              <div className="col-xs-12 col-md-3 col-sm-6">
                <div className={(this.state.duration != 'custom') ? "newInputFileldOuter no-display" : "newInputFileldOuter"}>
                    <div className="newInputLabel">Custom Duration<span className="setting-require">*</span></div>
                    <input className={this.state.customDurationClass } placeholder="Time in minutes  (10 min)" type="text" name="custom_duration" onChange={this.handleInputChange} disabled={(this.state.duration != 'custom') ? true : false} autoComplete="off" value={this.state.custom_duration} />
                </div>
              </div>

              {/*Cant Book with*/}
              <div className="col-xs-12 col-md-6 col-sm-6">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_can_not_book_with}</div>
                  <div className="setting-input-outer">
                    <TagAutoSelect
                      inputClassName={this.state.serviceListClass}
                      handleChildChange={this.handleChildChange}
                      options={this.state.serviceList.options}
                      value={this.state.serviceList.value}
                      listName='serviceList'
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className={(this.state.tabMode == 'additional') ? "row p-t-20" : "row p-t-20 no-display" }>
              <div className="row no-margin">
                {/*Service Requirement*/}
                <div className="col-lg-4 col-md-6  col-xs-12 m-b-40">
                  <p className="p-text">{this.state.appointment_service_does_this_service_require_equipment}? <span className="setting-require">*</span></p>
                  <label className="setting-switch">
                    <input id="radiobutton1" className="setting-custom-switch-input" name="is_device_dependent" type="checkbox" value="true" onChange={this.handleInputChange} checked={(this.state.is_device_dependent) ? 'checked' : false} />
                    <span className="setting-slider "></span>
                  </label>
                </div>

                {/*Service Available for Smart Booking*/}
                <div className="col-lg-5  col-md-6 col-xs-12 m-b-40">
                  <p className="p-text">{this.state.appointment_service_is_this_service_available_for_smart_booking}? <span className="setting-require">*</span></p>
                  <label className="setting-switch">
                    <input id="radiobutton1" className="setting-custom-switch-input" name="is_available_online" type="checkbox" value="true" onChange={this.handleInputChange} checked={(this.state.is_available_online) ? 'checked' : false} />
                    <span className="setting-slider "></span>
                  </label>
                </div>
              </div>

              <div className="row no-margin">
                {/*Disable Card Capture*/}
                <div className="col-lg-4 col-md-6 col-xs-12 m-b-40">
                  <p className="p-text">{this.state.appointment_service_disable_card_capture_for_this_service}? <span className="setting-require">*</span></p>
                  <label className="setting-switch">
                    <input id="radiobutton1" className="setting-custom-switch-input" name="is_service_free" type="checkbox" value="true" onChange={this.handleInputChange} checked={(this.state.is_service_free) ? 'checked' : false} />
                    <span className="setting-slider "></span>
                  </label>
                </div>

                {/*Free Consultation*/}
                <div className="col-lg-5 col-md-6 col-xs-12 m-b-40">
                  <p className="p-text">{this.state.appointment_service_is_this_service_a_free_consultation}? <span className="setting-require">*</span></p>
                  <label className="setting-switch">
                    <input id="radiobutton1" className="setting-custom-switch-input" name="free_consultation" type="checkbox" value="true" onChange={this.handleInputChange} checked={(this.state.free_consultation) ? 'checked' : false} />
                    <span className="setting-slider "></span>
                  </label>
                </div>
              </div>

              {/*<div className="row no-margin">
                              <div className="col-lg-4 col-md-6 col-xs-12 m-b-40">
                                  <p className="p-text">Accepts Pre payment? <span className="setting-require">*</span></p>
                                  <label className="setting-switch">
                                    <input id="radiobutton1" className="setting-custom-switch-input" name="is_pre_payment_accepted" type="checkbox" value="true" onChange={this.handleInputChange} checked={(this.state.is_pre_payment_accepted) ? 'checked' : false} />
                                    <span className="setting-slider "></span>
                                  </label>
                              </div>

                              <div className={(this.state.is_pre_payment_accepted) ? "col-lg-4 col-md-6 col-xs-12 m-b-40" : "no-display col-lg-4 col-md-6 col-xs-12 m-b-40"}>
                                  <div className="newInputFileldOuter m-t-10">
                                    <div className="newInputLabel">Amount <span className="setting-require">*</span></div>
                                    <input className={(this.state.is_pre_payment_accepted) ? ((this.state.depositError) ? "newInputField field_error" : "newInputField") : "newInputField disable"} disabled={(!this.state.is_pre_payment_accepted) ? true : false}  type="text"  name="deposit" onChange={this.handleInputChange} value={this.state.deposit}/>
                                  </div>
                              </div>
                            </div>*/}


              {/*Is Device Dependent*/}
              <div className={(this.state.is_device_dependent) ? "col-xs-12" : "col-xs-12 no-display"}>
                <div className="newInputFileldOuter relative">
                  <div className="newInputLabel">{this.state.appointment_service_select_devices} <span className="setting-require">*</span></div>
                  <div className="row">
                    <div className="col-md-9 col-xs-12 m-b-10">
                      <TagAutoSelect
                        inputClassName={this.state.deviceListClass}
                        handleChildChange={this.handleChildChange}
                        selectedTag={this.state.deviceList.selectedTag}
                        options={this.state.deviceList.options}
                        value={this.state.deviceList.value}
                        listName='deviceList'
                      />
                    </div>
                    {/*<div className="col-md-3 col-xs-12 add-category-outer">
                        <a href="javascript:void(0);" className="new-white-btn sm-btn no-margin" onClick={this.handleAddDevice} >{this.state.appointment_add_new_device}</a>
                      </div>*/}
                  </div>
                </div>
              </div>

              {/*Add New Device*/}
              {(this.state.is_device_dependent && this.state.is_add_new_device) &&
                <div className="col-xs-12">
                  <div className="newInputFileldOuter relative">
                    <div className="newInputLabel">{this.state.appointment_new_device_name} <span className="setting-require">*</span></div>
                    <div className="row">
                      <div className="col-md-9 col-xs-12 m-b-10">
                        <input name="addNewDeviceName" className={this.state.addNewDeviceNameClass} maxLength={255} type="text" value={this.state.addNewDeviceName} onChange={this.handleInputChange} autoComplete="off" />
                      </div>
                      <div className="col-md-3 col-xs-12 add-category-outer">
                        <a href="javascript:void(0);" className="new-white-btn sm-btn no-margin" name='addNewDeviceNameSave' onClick={this.createDeviceForService}>{this.state.label_save}</a>
                        <a href="javascript:void(0);" className="new-white-btn sm-btn" onClick={this.handleAddDevice} >{this.state.label_cancel}</a>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>

            <div className={(this.state.tabMode == 'clinical') ? "row m-b-40" : "row m-b-40 no-display" }>
              {/*Select Questionnaire*/}
              <div className="col-xs-12 col-md-7">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_select_questionnaires}</div>
                  <div className="setting-input-outer">
                    <TagAutoSelect
                      inputClassName={this.state.questionnaireListClass}
                      handleChildChange={this.handleChildChange}
                      options={this.state.questionnaireList.options}
                      value={this.state.questionnaireList.value}
                      listName='questionnaireList'
                    />
                  </div>
                </div>
              </div>



              {/*Select Resources*/}
              <div className="col-xs-12 col-md-7">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_select_resources}</div>
                  <div className="setting-input-outer">
                    <TagAutoSelect
                      inputClassName={this.state.resourceListClass}
                      handleChildChange={this.handleChildChange}
                      options={this.state.resourceList.options}
                      value={this.state.resourceList.value}
                      listName='resourceList'
                    />
                  </div>
                </div>
              </div>


              {/*Select Pre Treatment Instructions*/}
              <div className="col-xs-12 col-md-7">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_select_pre_treatment_instructions}</div>
                  <div className="setting-input-outer">
                    <TagAutoSelect
                      inputClassName={this.state.preTreatmentInstructionListClass}
                      handleChildChange={this.handleChildChange}
                      options={this.state.preTreatmentInstructionList.options}
                      value={this.state.preTreatmentInstructionList.value}
                      listName='preTreatmentInstructionList'
                    />
                  </div>
                </div>
              </div>

              {/*Select Post Treatment Instructions*/}
              <div className="col-xs-12 col-md-7">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_select_post_treatment_instructions}</div>
                  <div className="setting-input-outer">
                    <TagAutoSelect
                      inputClassName={this.state.postTreatmentInstructionListClass}
                      handleChildChange={this.handleChildChange}
                      options={this.state.postTreatmentInstructionList.options}
                      value={this.state.postTreatmentInstructionList.value}
                      listName='postTreatmentInstructionList'
                    />
                  </div>
                </div>
              </div>


              {/*Description for smart Booking*/}
              <div className="col-xs-12 col-md-7">
                <div className="newInputFileldOuter">
                  <div className="newInputLabel">{this.state.appointment_service_description_shown_for_smart_booking} <span className="setting-require">*</span></div>
                  <div className="setting-input-outer">
                    <textarea name="description" id="name" className={this.state.descriptionClass} maxLength={255} type="textarea" value={this.state.description} onChange={this.handleInputChange} autoComplete="off" />
                  </div>
                </div>
              </div>
            </div>

            <div className={(this.state.tabMode == 'clinical') ? "setting-subtitle" : "no-display" }>{this.state.appointment_service_surveys}</div>
            <div className={(this.state.tabMode == 'clinical') ? "row relative resource-survey-outer" : "row resource-survey-outer no-display" }>
              {(this.state.multipleSurveyList.length) &&
                this.state.multipleSurveyList.map((multipleObj, multipleIdx) => {
                  return (
                    <div className="resourceSurveyRow"  key={'surveyIndex-' + multipleIdx}>
                      <div className="col-lg-4 col-xs-11">
                        <div className="newInputFileldOuter">
                          <div className="newInputLabel">{this.state.appointment_service_select_survey}</div>
                          <select className={(this.state.multipleSurveyListClass[multipleIdx]) ? this.state.multipleSurveyListClass[multipleIdx].survey_id : 'newSelectField'} name="survey_id" value={multipleObj.survey_id} data-surveyindex={multipleIdx} onChange={this.handleInputChange}>
                            <option value={0}>Select Survey</option>
                            {(this.state.surveyList.length) ?
                              this.state.surveyList.map((obj, idx) => {
                                return (
                                  <option key={'surveyOption-' + idx} value={obj.id}>{obj.title}</option>
                                )
                              }) :
                              null
                            }
                          </select>
                        </div>
                      </div>
                      <div className="col-lg-8 col-xs-11">
                        <div className="row">
                          <div className="col-lg-5 col-sm-6 col-xs-12">
                            <div className="newInputFileldOuter">
                              <div className="newInputLabel">{this.state.appointment_service_send}</div>
                              <select className={(this.state.multipleSurveyListClass[multipleIdx]) ? this.state.multipleSurveyListClass[multipleIdx].scheduled + " m-b-30" : 'newSelectField m-b-30'} value={multipleObj.scheduled} name="scheduled" data-surveyindex={multipleIdx} onChange={this.handleInputChange}>
                                <option value="1-hour">After 1 hour</option>
                                <option value="2-hour">After 2 hours</option>
                                <option value={1}>After 1 day</option>
                                <option value={2}>After 2 days</option>
                                <option value={3}>After 3 days</option>
                                <option value={4}>After 4 days</option>
                                <option value={5}>After 5 days</option>
                                <option value={6}>After 6 days</option>
                                <option value={7}>After 1 week</option>
                                <option value={14}>After 2 weeks</option>
                                <option value={21}>After 3 weeks</option>
                                <option value={30}>After 1 month</option>
                                <option value={60}>After 2 months</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>
                          </div>
                          <div className={(multipleObj.scheduled != 'custom') ? "col-sm-3 col-xs-6 no-display" : "col-sm-3 col-xs-6"}>
                            <div className="newInputFileldOuter">
                            <div className="newInputLabel invisible"></div>
                              <input className={(this.state.multipleSurveyListClass[multipleIdx]) ? this.state.multipleSurveyListClass[multipleIdx].custom_scheduled_after : 'newInputField'} type="text" placeholder="Days" name="custom_scheduled_after" data-surveyindex={multipleIdx} onChange={this.handleInputChange} disabled={(multipleObj.scheduled != 'custom') ? true : false} autoComplete="off" value={multipleObj.custom_scheduled_after} />
                            </div>
                          </div>
                          <div className={(multipleObj.scheduled != 'custom') ? "col-sm-3 col-xs-6 no-display" : "col-sm-3 col-xs-6"}>
                            <div className="newInputFileldOuter">
                            <div className="newInputLabel invisible"></div>
                              <select className={(this.state.multipleSurveyListClass[multipleIdx]) ? this.state.multipleSurveyListClass[multipleIdx].schedule_type : 'newSelectField'} value={multipleObj.schedule_type} name="schedule_type" data-surveyindex={multipleIdx} onChange={this.handleInputChange} disabled={(multipleObj.scheduled != 'custom') ? true : false}>
                                <option value="days">Days</option>
                                <option value="hours">Hours</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      {(multipleIdx == 0)
                        ?
                        <a href="javascript:void(0);" className="add-round-btn" onClick={this.addMultipleSurvey}><span>+</span></a>
                        :
                        <a href="javascript:void(0);" className="add-round-btn" data-surveyindex={multipleIdx} onClick={this.deleteMultipleSurvey}><span data-surveyindex={multipleIdx}>-</span></a>
                      }
                    </div>
                  )
                })
              }
            </div>
          </div>




            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
              </div>
            </div>
            <div className="footer-static">
              {this.state.serviceId && this.state.tabMode == 'general' ?
                <input className="new-red-btn pull-left confirm-model" onClick={this.showDeleteModal} data-message={this.state.service_delete_msg} data-confirm-url="" type="submit" autoComplete="off" value={this.state.label_delete} />
                : null}
              <div className={(this.state.showModal) ? 'overlay' : ''} ></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.delete_confirmation}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.service_delete_msg}</div>
                    <div className="modal-footer">
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.label_no}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteService}>{this.state.label_yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <input className="new-blue-btn pull-right" name='save_services' id="save_services" onClick={this.continueSave} type="button" autoComplete="off" defaultValue={(this.state.tabMode == 'additional') ? this.state.label_save : "Continue"} />
            </div>
          </div>

    );
  }
}
function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  toast.dismiss();
  if (state.AppointmentReducer.action === "SERVICE_DATA_AND_LIST_DATA") {
    if (state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.serviceData = state.AppointmentReducer.data.data.service_data;
      returnState.serviceDataTimeStamp = new Date()
      returnState.listData = state.AppointmentReducer.data.data.list_data;
      returnState.status = 200;
    }
  } else if (state.AppointmentReducer.action === "CREATE_SERVICE") {
    if (state.AppointmentReducer.data.status == 201) {
      returnState.createdId = state.AppointmentReducer.data.data.id;
      returnState.mode = 'create';
      returnState.createdTimeStamp = new Date();
      //returnState.redirect = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'UPDATE_SERVICE') {
    if (state.AppointmentReducer.data.status == 200 || state.AppointmentReducer.data.status == 201) {
      returnState.createdId = state.AppointmentReducer.data.data.id;
      returnState.mode = 'create';
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
      returnState.createdTimeStamp = new Date();
      //returnState.redirect = true;
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
    return returnState;
  } else if (state.AppointmentReducer.action === 'DELETE_SERVICE') {
    if (state.AppointmentReducer.data.status == 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
    return returnState;
  } else if (state.AppointmentReducer.action === 'CREATE_SERVICE_CATEGORY_FROM_SERVICE') {
    if (state.AppointmentReducer.data.status == 201) {
      returnState.serviceCategoryData = state.AppointmentReducer.data.data;
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
    } else {
      returnState.showLoader = false
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'CREATE_DEVICE') {
    if (state.AppointmentReducer.data.status == 201) {
      returnState.deviceData = state.AppointmentReducer.data.data;
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'EMPTY_DATA') {
    //returnState.showLoader = false;
    returnState.showLoaderTimeStamp = new Date()
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
    fetchServiceAndListData: fetchServiceAndListData,
    createService: createService,
    updateService: updateService,
    deleteService: deleteService,
    exportEmptyData: exportEmptyData,
    createServiceCategory: createServiceCategory,
    createDevice: createDevice,
    geCommonTrackEvent: geCommonTrackEvent
  }, dispatch)
}



export default connect(mapStateToProps, mapDispatchToProps)(CreateEditServices);
