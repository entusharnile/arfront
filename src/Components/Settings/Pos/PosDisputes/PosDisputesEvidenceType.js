import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Select from 'react-select';
import { getPosDisputeDetails, exportEmptyData, submitPosDispute, saveLaterPosDispute } from '../../../../Actions/Settings/settingsActions.js';
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'
import axios from 'axios';
import config from '../../../../config';
import { showMonthFormattedDate,formatBytes, dateFormatPicker } from '../../../../Utils/services.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import validator from 'validator';

//const dateFormatPicker = 'yyyy-MM-dd';
const dateFormatMoment = 'YYYY-MM-DD';

class PosDisputesEvidenceType extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      backAction: '/settings/pos-disputes',
      disputeId:0,
      evidenceType:'',
      eveidenceTypeName:'',
      eveidenceTypeNotes:'',
      eveidenceTypeSlug:'',
      posDisputeData:{},
      disputeData:{},
      generalFields:{},
      evidenceFields:{},
      formFields:[],
      userChanged:false,
      file:{}
    }
  }

  componentDidMount() {
    this.setState({showLoader:true})
    const disputeId = this.props.match.params.disputeId;
    if(disputeId > 0){
      const backAction = `/settings/pos-disputes/${disputeId}/view`
      this.setState({disputeId:disputeId,backAction:backAction})
    } else {
      this.PosDisputesEvidence()
    }
    let returnState = {};
    switch (this.props.match.params.type) {
      case 'physical':
        returnState.eveidenceTypeName = this.state.settingsLang.pos_physical_products;
        returnState.eveidenceTypeNotes = this.state.settingsLang.pos_physical_products_notes;
        returnState.evidenceType = 'physical';
        returnState.eveidenceTypeSlug = 'physical_product';
        break;
      case 'digital':
        returnState.eveidenceTypeName = this.state.settingsLang.pos_digital_products;
        returnState.eveidenceTypeNotes = this.state.settingsLang.pos_digital_products_notes;
        returnState.evidenceType = 'digital';
        returnState.eveidenceTypeSlug = 'digital_product_or_service';
        break;
      case 'offline':
        returnState.eveidenceTypeName = this.state.settingsLang.pos_offline_services;
        returnState.eveidenceTypeNotes = this.state.settingsLang.pos_offline_services_notes;
        returnState.evidenceType = 'offline';
        returnState.eveidenceTypeSlug = 'offline_service';
        break;
      default:
        this.PosDisputesEvidence()
        break;
    }
    this.setState(returnState);
    this.props.getPosDisputeDetails(disputeId, true)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      nextProps.exportEmptyData();
      returnState.showLoader = false;
    }  else if (nextProps.redirect != undefined && nextProps.redirect == true) {
      nextProps.exportEmptyData();
      toast.success(nextProps.message)
      nextProps.history.push(prevState.backAction);
    } else if (nextProps.posDisputeData !== undefined && nextProps.posDisputeData !== prevState.posDisputeData) {
      nextProps.exportEmptyData();
      returnState.posDisputeData = nextProps.posDisputeData;
      returnState.disputeData = returnState.posDisputeData.dispute_details;
      returnState.generalFields = returnState.posDisputeData.dispute_evidence_fields.general_fields;
      returnState.evidenceFields = returnState.posDisputeData.dispute_evidence_fields[returnState.disputeData.dispute_reason][prevState.eveidenceTypeSlug];
      returnState.showLoader = false;
      const fileInputFields = returnState.posDisputeData.file_input_fields;
      const dateInputFields = returnState.posDisputeData.date_input_fields;
      const textareaInputFields = returnState.posDisputeData.textarea_input_fields;
      const requiredFields = returnState.posDisputeData.required_fields;
      let formFields = []
      if(typeof returnState.generalFields === 'object' || typeof returnState.generalFields === 'array'){
        Object.keys(returnState.generalFields).forEach((idx) => {
          let data = {};
          data['name'] = idx;
          data['label'] = returnState.generalFields[idx];
          data['value'] = (idx === 'customer_purchase_ip') ? returnState.disputeData.client_ip : '';
          data['require'] = (requiredFields.indexOf(idx) > -1) ? true : false;
          data['read_only'] = (idx === 'customer_purchase_ip') ? true : false;
          data['type'] = (textareaInputFields.indexOf(idx) > -1) ? 'textarea' : 'text';
          data['class'] = (textareaInputFields.indexOf(idx) > -1) ? 'setting-textarea-box' : 'setting-input-box';
          data['service_type'] = 'general';
          data['render'] = (textareaInputFields.indexOf(idx) > -1) ? 'renderTextArea' : 'renderText';
          formFields.push(data)
        })
      }
      if(typeof returnState.evidenceFields === 'object' || typeof returnState.evidenceFields === 'array'){
        Object.keys(returnState.evidenceFields).forEach((idx) => {
          let data = {};
          data['name'] = idx;
          data['label'] = returnState.evidenceFields[idx];
          data['value'] = '';
          data['require'] = (requiredFields.indexOf(idx) > -1) ? true : false;
          data['read_only'] = false;
          data['type'] = (textareaInputFields.indexOf(idx) > -1) ? 'textarea' : (fileInputFields.indexOf(idx) > -1) ? 'file' : (dateInputFields.indexOf(idx) > -1) ? 'date' : 'text';
          data['class'] = (textareaInputFields.indexOf(idx) > -1) ? 'setting-textarea-box' : (fileInputFields.indexOf(idx) > -1) ? 'setting-input-box' : 'setting-input-box';
          data['service_type'] = prevState.evidenceType;
          data['render'] = (textareaInputFields.indexOf(idx) > -1) ? 'renderTextArea' : (fileInputFields.indexOf(idx) > -1) ? 'renderFile' : (dateInputFields.indexOf(idx) > -1) ? 'renderDate' : 'renderText';
          formFields.push(data)
        })
      }
      if(typeof returnState.disputeData.dispute_evidence === 'object' || typeof returnState.disputeData.dispute_evidence === 'array'){
        returnState.disputeData.dispute_evidence.map((obj,idx) => {
          formFields.map((formObj,formIdx) => {
            if(obj.field === formObj.name && obj.service_type === formObj.service_type){
              formFields[formIdx]['value'] = obj.value
              if(formObj.type === 'date'){
                if(obj.value){
                  if(obj.value != '0000-00-00' || obj.value != '0000-00-00 00:00'){
                    formFields[formIdx]['value'] = moment(obj.value).toDate()
                  }
                } else {

                }
              }
            }
          })
        })
      }
      returnState.formFields = formFields;
    }

    return returnState
  }

  handleInputChange = (event) => {
    const target = event.target;
    const index = target.dataset.index;
    let value = target.value;
    let returnState = {}
    returnState.userChanged = true;
    let formFields = this.state.formFields;
    if(typeof formFields[index] !== 'undefined'){
      if(target && target.type == 'file'){
        const allowedTypes  = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/gif","image/GIF"];

        if ( target.files && allowedTypes.indexOf(target.files[0].type) > -1 ) {
          this.handleFileChosen(target.files[0], target)
        } else {
          toast.error('This file type is not allowed');
        }
      } else{
        formFields[index]['value'] = value
        returnState.formFields = formFields;
      }
    }
    this.setState(returnState);
  }

  handleFileChosen = (file, target) => {
    let response = {};
    this.state.file.fileReader           = new FileReader();
    this.state.file.fileReader.onloadend = this.handleFileRead;
    this.state.file.fileReader.readAsDataURL(file);
    this.state.file.file = file
    this.state.file.target = target
    return response;
  }

  handleFileRead = (e) => {
    const content     = this.state.file.fileReader.result;
    let name      = this.state.file.target.name + '_thumbnail'
    let src       = this.state.file.target.name + '_src'
    let size      = this.state.file.target.name + '_size'

    let fileSize  = formatBytes(this.state.file.file.size, 1)
    this.setState({[name]: this.state.file.file.name, [size]: fileSize, [src] : this.state.file.fileReader.result, showLoader: true});

    this.handleUpload(this.state.file.target.name)
  }

  handleUpload = (targetName) => {
    const target = this.state.file.target;
    const index = target.dataset.index;
    let formFields = this.state.formFields;
    const data = new FormData()
    data.append('file', this.state.file.file, this.state.file.file.name)
    data.append('file_purpose', formFields[index]['name'])
    let endpoint = config.API_URL + `pos-dispute-image-upload`;

    axios.post(endpoint, data).then(res => {
      if(res.data.status == 200){
        formFields[index]['value'] = res.data.data;
        formFields[index]['error'] = false
      } else {
        if(res.data.message == 'third_party_error'){
          toast.error(res.data.data);
        } else {
          toast.error(this.state.globalLang[res.data.message]);
        }
      }
      this.setState({showLoader: false});
    }).catch(error => {
      toast.error(this.state.globalLang[error.response.data.message]);
      this.setState({showLoader: false});
    })
  }

  handleRemoveFile(index){
    let formFields = this.state.formFields;
    formFields[index]['value'] = '';
    this.setState({ userChanged: true, formFields: formFields })
  }

  onChangeDatePicker = (index,date) => {
    let formFields = this.state.formFields;
    formFields[index]['value'] = date;
    this.setState({ userChanged: true, formFields: formFields })
  }

  handleSubmit = (isSubmit,event) => {
    //this.props.exportEmptyData();
    //isSubmit =1 => submit
    //isSubmit =0 => save for future

    let error = false;
    let formFields = this.state.formFields;
    formFields.map((formObj,formIdx) => {
      formFields[formIdx]['class'] = (formObj.type === 'textarea') ? 'setting-textarea-box' : ((formObj.type === 'file') ? 'setting-input-box' : 'setting-input-box');
      if(formObj.require){
        if(formObj.value === undefined || formObj.value === null || formObj.value === ''){
          error = true;
          formFields[formIdx]['class'] += ' field_error'
          //if (typeof this.state.aspire_acc_email != undefined && this.state.aspire_acc_email != null && this.state.aspire_acc_email != '' && !validator.isEmail(this.state.aspire_acc_email)) {
        } else {
          if(formObj.name === 'customer_email_address'){
            if(!validator.isEmail(formObj.value)){
              error = true;
              formFields[formIdx]['class'] += ' field_error'
            }
          }
        }
      }
    })
    this.setState({formFields:formFields})
    if(error){
      return
    }

    this.setState({showLoader:true})
    let formData = {
      dispute_id : this.state.disputeData.dispute_id,
      dispute_evidence_data : formFields
    }
    if(isSubmit){
      formData.stripe_user_id = this.state.disputeData.stripe_user_id

      this.props.submitPosDispute(formData)
    } else {
      this.props.saveLaterPosDispute(formData)
    }
  }


  handleSettingModal = () => {
    this.setState({isShowSettingModal: !this.state.isShowSettingModal})
  }
  PosDisputesEvidence = (type) => {
    return (
      <div>
        {this.props.history.push(this.state.backAction)}
      </div>
    );
  }



  renderFile = (idx,data) => {
    return <div className="pos-dispute-file setting-input-box choose-file-outer dropzone-filename">
      <div className="new-white-btn choose-file dz-clickable">
        {this.state.settingsLang.Questionnaire_Choose_File}
        <div className="dz-default dz-message">
          <span>{this.state.settingsLang.editUsers_Drop_Files_To_Upload}</span>
        </div>
      </div>
      <span className="span_dropzone_0">
        {(data.value) ? data.value : 'No File'}
      </span>
        <input name={data.name} className={"image_questionnaire"} onChange={this.handleInputChange} data-index={idx} type="file"  />
        <a href="javascript:void(0);" className="remove-file-name choice-question-cross"><img src="/images/close.png" onClick={this.handleRemoveFile.bind(this,idx)} /></a>
    </div>
  }

  renderDate = (idx,data) => {
    return <div className="setting-input-outer">
      <DatePicker
        className={data.class}
        selected = {(data.value) ? data.value: null}
        dateFormat={dateFormatPicker()}
        onChange={this.onChangeDatePicker.bind(this, idx)}
        maxDate={new Date()}
        minDate={new Date(moment().subtract(3, "years").toDate())}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        autoComplete='off'
        name={data.name}
        data-index={idx}
        readOnly={data.read_only}
        autoComplete="off"
        placeholderText={dateFormatPicker().toLowerCase()}
      />
     </div>
  }

  renderText = (idx,data) => {
    return <div className="setting-input-outer">
      <input name={data.name} value={data.value} className={data.class} onChange={this.handleInputChange} readOnly={data.read_only} data-index={idx} type="text" autoComplete="off" />
    </div>
  }

  renderTextArea = (idx,data) => {
    return (<div className="setting-input-outer">
        <textarea name={data.name} value={data.value} className={data.class} onChange={this.handleInputChange} readOnly={data.read_only} data-index={idx}  autoComplete="off" />
      </div>
        )
  }



  render() {
  let  defaultOptions = [{id:12, label:"shine@yopmail.com", value:12}];
  let options = [];

    return (
      <div className="main protected">
        <Header />
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-container">
                <div className="setting-title m-b-30">
                  <span>{this.state.settingsLang.pos_i_provided_the_customer_with}</span>
                  <a className="pull-right back-step-1 add-btn"  onClick={this.PosDisputesEvidence}>{this.state.settingsLang.Two_Factor_Authentication_Change}</a>
                </div>
                <div className="setting-title m-b-10">
                  <span id="service_type">{this.state.eveidenceTypeName}</span>
                </div>
                <p className="p-text m-b-40">{this.state.eveidenceTypeNotes}</p>
                <div className="row">
                  {this.state.formFields.map((obj,idx)=>{
                      return (
                        <div key={'formFields-'+idx} className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{obj.label}
                              {(obj.require === true) && <span className="setting-require">*</span>}
                            </div>
                            {this[obj.render](idx,obj)}

                          </div>
                        </div>
                      )
                  })}
                </div>
                <p className="p-text text-justify no-margin">{this.state.settingsLang.pos_dispute_avidence_boottom_notes} <strong>{this.state.settingsLang.pos_dispute_avidence_boottom_notes_strong}</strong></p>
                <br />
                {(moment(this.state.disputeData.evidence_due_date) < moment()) ?
                  <p className="p-text text-justify"><strong>Note:</strong> Since evidence for this dispute was due by <strong>{moment(this.state.disputeData.evidence_due_date).format('MMM DD, YYYY')} at {moment(this.state.disputeData.evidence_due_date).format('hh:mm A')}</strong>, we can't guarantee that the cardholder's bank will accept or review it.</p>

                  :
                  <p className="p-text text-justify no-margin">{this.state.settingsLang.pos_evidence_draft_notes}</p>
                }

              </div>
              <Loader showLoader={this.state.showLoader} />
              <div className="footer-static">
                <button type="button" id="submit-evidence" className="new-blue-btn pull-right" onClick={this.handleSubmit.bind(this,1)}>{this.state.settingsLang.pos_submit_evidence_now}</button>
                <button type="button" id="save-evidence-later" className="new-white-btn pull-right" onClick={this.handleSubmit.bind(this,0)}>{this.state.settingsLang.pos_save_for_later}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "GET_POS_DISPUTE_EVIDENCE") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posDisputeData = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "SUBMIT_POS_DISPUTE") {
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false;
    } else {
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.redirect = true;
    }
  } else if (state.SettingReducer.action === "SAVE_LATER_POS_DISPUTE") {
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false;
    } else {
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.redirect = true;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getPosDisputeDetails: getPosDisputeDetails,
    submitPosDispute:submitPosDispute,
    saveLaterPosDispute:saveLaterPosDispute,
     exportEmptyData: exportEmptyData
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosDisputesEvidenceType);
