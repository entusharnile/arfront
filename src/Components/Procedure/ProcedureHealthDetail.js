import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { emptyProcedureReducer, vieweHealthProcedureData, fetchSelectMD, signProcedure } from '../../Actions/Procedures/procedureActions.js';
import { restoreRecentlyDeleted } from '../../Actions/Settings/settingsActions.js';
import { withRouter } from 'react-router';
import defLogo from '../../images/upload.png';
import { numberFormat } from '../../Utils/services.js';
import arrowLeft from '../../images/arrow-left.png';
import arrowRight from '../../images/arrow-right.png';

import { SketchField, Tools } from 'react-sketch';
import config from '../../config';
import axios from 'axios';

const proHealthDetInstance = axios.create();

class ProcedureHhealthDetail extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    const userData        = JSON.parse(localStorage.getItem('userData'));
    let isConsentRequired = userData.user.is_md_consent_required;
    let showSigPopup      = userData.user.show_signature_popup;
    let mdUserID          = userData.user.md_user_id;

    this.state = {
      action: (props.match.params.type) ? props.match.params.type : 'pending',
      backURLType: (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      clientID: this.props.match.params.clientID,
      procedureID: (this.props.match.params.procedureID) ? this.props.match.params.procedureID : 0,
      globalLang: languageData.global,
      settingsLang: languageData.settings,
      returnTo: '',
      showModal: false,
      showLoader: false,
      procedureData: [],
      procedureTemplateList: [],
      procedure_name: '',
      templateQuesionList: [],
      isShowDeletedModal: false,
      nextProcedureID: 0,
      prevProcedureID: 0,
      languageData      : languageData.procedure,
      isConsentRequired: (isConsentRequired) ? 1 : 0,
      showSigPopup:(showSigPopup) ? 1 : 0,
      md_id             : (mdUserID) ? mdUserID : 0,
      showSignModal: false,
      canvasClass : "signature-box sig-div",
      inputOut    : 'input-outer',
      clearClass  : 'new-white-btn no-margin clear no-display',
      resetClass  : 'new-blue-btn reset no-display',
      changeClass : 'new-blue-btn no-margin Change',
      uploadedSignature: '',
      uploadedSignature_url:'',
      mdList            : [],
      roomType:this.props.match.params.actionType,
      languageData      : languageData.procedure
    }
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      return false;
    }

  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  componentDidMount() {
    this.setState({ showLoader: true })
    let returnTo = '';
    if (this.state.backURLType && this.state.backURLType === 'clients') {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID : "/" + this.state.backURLType
    } else if (this.state.backURLType && this.state.backURLType === 'provider-room') {
      returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.state.action  : 'pending'
    } else if (this.state.backURLType && this.state.backURLType === 'md-room') {
      returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.state.action  : 'pending'
    } else if (this.state.backURLType && this.state.backURLType === 'settings') {
      returnTo =  "/" + this.state.backURLType + "/" + this.state.action
    }
    this.setState({ returnTo: returnTo })
    if (this.state.procedureID) {
      let formData = {
      'params': {
        //room_type : (this.props.match.params.actionType === 'provider-room') ? 'provider' : 'md',
        action    : this.props.match.params.type
      }}
      if(this.state.backURLType !== 'settings'){
        formData.params.room_type = (this.props.match.params.actionType === 'provider-room') ? 'provider' : 'md'
      }
      this.props.vieweHealthProcedureData(formData, this.state.procedureID);

      if ( this.state.backURLType === 'provider-room' && this.state.action === 'pending') {
        this.props.fetchSelectMD();
      }
    } else {
      toast.dismiss(this.state.globalLang.procedure_not_found)
      setTimeout(function () {
        this.props.history.push(returnTo);
      }, 1700)
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.procedureData === undefined && nextProps.mdList !== undefined && nextProps.mdList !== prevState.mdList && nextProps.mdList.length > 0) {

      let mdID = (prevState.md_id) ? prevState.md_id : nextProps.mdList[0].id;

      return {
        mdList : nextProps.mdList,
        md_id  : mdID
      }
    }

    if (nextProps.procedureSignData !== undefined && nextProps.procedureSignData.status === 201 && nextProps.procedureSignData.data != prevState.procedureData) {
      if ( prevState.nextProcedureID && prevState.nextProcedureID !== null && prevState.nextProcedureID !== '' && prevState.nextProcedureID > 0 && prevState.procedureID === nextProps.match.params.procedureID ) {
        nextProps.history.push(`/${prevState.roomType}/procedure-health-detail/${prevState.nextProcedureID}/${nextProps.match.params.type}`);

        return {
          procedureData: nextProps.procedureSignData.data,
          showLoader: false
        }
      } else {
        nextProps.history.push(`/${prevState.roomType}/${nextProps.match.params.type}`);

        return {
          showLoader: false
        }
      }

    }

    let returnState = {}
    if (nextProps.procedureData !== undefined && nextProps.procedureData !== prevState.procedureData) {
      returnState.showLoader = false

      if(nextProps.procedureData.login_user){
        if(nextProps.procedureData.login_user.is_md_consent_required !== undefined){
          returnState.isConsentRequired = (nextProps.procedureData.login_user.is_md_consent_required) ? 1 : 0
        }
        if(nextProps.procedureData.login_user.show_signature_popup !== undefined){
          returnState.showSigPopup = (nextProps.procedureData.login_user.show_signature_popup) ? 1 : 0
        }
      }

      returnState.procedureData = nextProps.procedureData
      returnState.procedure_name = nextProps.procedureData.procedure_name
      returnState.consultationFees      = nextProps.procedureData.consultation_fee;

      returnState.nextProcedureID = (nextProps.procedureData.next) ? nextProps.procedureData.next : 0;
      returnState.prevProcedureID = (nextProps.procedureData.previous) ? nextProps.procedureData.previous : 0;

      if(nextProps.procedureData.procedure.user){
        returnState.canvasClass = (nextProps.procedureData.procedure.user.signature_url) ?  'signature-box sig-div no-display' : 'signature-box sig-div';
        returnState.inputOut = (nextProps.procedureData.procedure.user.signature_url) ?  'input-outer' : 'input-outer no-display';
        returnState.clearClass = (nextProps.procedureData.procedure.user.signature_url) ?  'new-white-btn no-margin clear no-display' : 'new-white-btn no-margin clear';
        returnState.resetClass = (nextProps.procedureData.procedure.user.signature_url) ?  'new-blue-btn reset no-display' : 'new-blue-btn reset ';
        returnState.changeClass = (nextProps.procedureData.procedure.user.signature_url) ?  'new-blue-btn no-margin Change' : 'new-blue-btn no-margin Change no-display';
      } else {
        returnState.canvasClass = 'signature-box sig-div';
        returnState.inputOut    = 'input-outer no-display';
        returnState.clearClass  = 'new-white-btn no-margin clear';
        returnState.resetClass  = 'new-blue-btn reset ';
        returnState.changeClass = 'new-blue-btn no-margin Change no-display';
      }


      returnState.signature_url = nextProps.procedureData.login_user.signature_url;

      if (nextProps.procedureData.questions) {
        let templateQuesionList = (nextProps.procedureData.questions.procedure_template_question) ? nextProps.procedureData.questions.procedure_template_question : []
        templateQuesionList.map((question, idx) => {
          let answerObj = (nextProps.procedureData.answers) ? nextProps.procedureData.answers.find(ans => ans.question_id === question.id) : {}

          let answer = '';
          if (answerObj !== undefined && answerObj.answer !== undefined && answerObj.answer !== null) {
            answer = answerObj.answer
          }
          switch (question.question_type) {
            case "Textbox":
              question.field_name = 'Textbox_' + question.id
              question.field_value = answer
              question.class_name = 'report-input'
              break;
            case "Multiple Choice":
              question.field_name = 'Multiple_Choice_' + question.id
              question.field_value = answer
              question.class_name = 'col-sm-12 multisel-outer'
              break;
            case "File Upload":
              question.field_name = 'File_Upload_' + question.id
              question.field_value = answer
              question.class_name = 'file-container file-upload-img'
              question.file_thumbnail = (answer) ? answer : ''
              question.file_size = ''
              question.download_path = (answer) ? answerObj.file_path : ''

              break;
            case "Yes/No":
              question.field_name = 'Yes_No_' + question.id
              question.field_value = answer
              question.class_name = 'col-sm-12 multisel-outer'
              break;
            case "Single Choice":
              question.field_name = 'Single_Choice_' + question.id
              question.field_value = answer
              question.class_name = 'col-sm-12 multisel-outer'
              break;
            case "Opinion Scale":
              question.field_name = 'Opinion_Scale_' + question.id
              question.field_value = answer
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
        nextProps.emptyProcedureReducer()
      }
    } else if (nextProps.showLoader !== undefined && nextProps.showLoader === false) {
      returnState.showLoader = false
      nextProps.emptyProcedureReducer()
    } else if (nextProps.redirect !== undefined && nextProps.redirect === true) {
      nextProps.emptyProcedureReducer()
      toast.success(nextProps.message)
      nextProps.history.push(prevState.returnTo);
    } else if (nextProps.procedureNotFound !== undefined && nextProps.procedureNotFound === true) {
      setTimeout(function () {
        nextProps.history.push(prevState.returnTo);
      }, 1700)
    } else if (nextProps.redirectToDeleted !== undefined && nextProps.redirectToDeleted === true) {

      toast.success(nextProps.message, {
        onClose: () => {
          nextProps.history.push(`/settings/${nextProps.match.params.type}`);
        }
      });
    } else if (nextProps.showLoader !== undefined && nextProps.showLoader === false) {
      returnState.showLoader = false
    }



    return returnState
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.match.params.procedureID !== this.state.procedureID){

     this.setState({ showLoader: true, procedureID : this.props.match.params.procedureID });

     let formData = {
     'params': {
       room_type : (this.props.match.params.actionType === 'provider-room') ? 'provider' : 'md',
       action    : this.props.match.params.type
     }}

     this.props.vieweHealthProcedureData(formData, this.props.match.params.procedureID);

     if ( this.props.match.params.actionType === 'provider-room' && this.props.match.params.type === 'pending') {
       this.props.fetchSelectMD();
     }
    }
  }

  handleRestoreModal = () => {
    this.setState({ isShowDeletedModal: !this.state.isShowDeletedModal })
  }
  restoreSelected = () => {
    if (this.state.procedureID && this.props.match.params.type == 'recently-deleted') {
      const procedureIds = [this.state.procedureID];
      this.setState({ showLoader: true })
      this.props.restoreRecentlyDeleted({ 'procedure_ids': procedureIds })
      this.setState({ isShowDeletedModal: !this.state.isShowDeletedModal })
    }
  }

  renderAnswer = (questionObj, questionIdx) => {
    let returnHtml = '';
    let answerObj = (this.state.procedureData.answers) ? this.state.procedureData.answers.find(ans => ans.question_id === questionObj.id) : {}

    let answer = '';
    if (answerObj !== undefined && answerObj.answer !== undefined && answerObj.answer !== null) {
      answer = answerObj.answer
    } else {
      answerObj = {}
    }

    switch (questionObj.question_type) {
      case "Textbox":
      case "Yes/No":
      case "Single Choice":
      case "Multiple Choice":
        returnHtml = (
          <div className="survey-ans"><span className="ans-label">{this.state.languageData.pro_ans}</span>{(questionObj.field_value) ? questionObj.field_value : ' '}&nbsp;</div>
        )
        break;
      case "Multiple Choice1":
        let multipleAnswer = []
        if ((questionObj.procedure_template_question_option) && questionObj.procedure_template_question_option.length > 0) {
          questionObj.procedure_template_question_option.map((optionObj, optionIdx) => {
            if (questionObj.field_value.indexOf(optionObj.id) > -1) {
              multipleAnswer.push(optionObj.question_option)
            }
          })
        }
        returnHtml = (
          <div className="survey-ans"><span className="ans-label">{this.state.languageData.pro_ans}</span>{(questionObj.field_value) ? questionObj.field_value : ' '}</div>
        )

        break;
      case "File Upload":
        returnHtml = (
          <div className="survey-ans"><span className="ans-label">{this.state.languageData.pro_ans}</span>

            <div className="row add-doc-section">
              <div className="col-xs-6 m-b-20">
                <div className={"file-container file-upload-img"} title={(questionObj.field_value) ? questionObj.field_value : ''}>
                  <img
                    className={(questionObj.field_value) ? "full-custom-img" : ""}
                    src={(questionObj.field_value) ? questionObj.download_path : defLogo}
                  />
                  <span className={(questionObj.field_value) ? "file-name file-info" : "file-name-hide no-display"}> {questionObj.file_thumbnail}</span>
                </div>
              </div>
            </div>
          </div>
        )
        break;
      case "Yes/No1":
      case "Single Choice1":
        if ((questionObj.procedure_template_question_option) && questionObj.procedure_template_question_option.length > 0) {
          questionObj.procedure_template_question_option.map((optionObj, optionIdx) => {
            if (questionObj.field_value == optionObj.id) {
              returnHtml = (
                <div className="survey-ans"><span className="ans-label">{this.state.languageData.pro_ans}</span>{optionObj.question_option}</div>
              )
            }
          })
        }
        break;
      case "Opinion Scale":
        returnHtml = (
          <div>
          <div className="survey-ans">
            <span className="ans-label">{this.state.languageData.pro_ans}</span>
            {questionObj.field_value}
            </div>
            {questionObj.why_choose == 1 && questionObj.field_value_why !== '' &&
              <div className="survey-ans survey-ans-why-choose"><span className="ans-label ans-label-why-choose">{this.state.languageData.pro_why_choose}</span> {questionObj.field_value_why}</div>
            }
          </div>
        )
        break;
      default:
        return null
        break;
    }
    if(returnHtml == ''){
      returnHtml = (
        <div className="survey-ans"><span className="ans-label">{this.state.languageData.pro_ans}</span> &nbsp; </div>
      )
    }
    return returnHtml;
  }

  getProcedureDataByID = (e) => {
    e.preventDefault();
    let type = e.target.parentNode.name
    let procedureID = 0

    if ( type && type == 'getNext' ) {
      procedureID = this.state.nextProcedureID
    } else if ( type && type == 'getPrev' ) {
      procedureID = this.state.prevProcedureID
    }

    if ( procedureID && procedureID > 0 ) {
      this.props.history.push(`/${this.props.match.params.actionType}/procedure-health-detail/${procedureID}/${this.props.match.params.type}`);
    }
  }

  openSignModal = () => {
    let procedureID = this.state.procedureID

    if ( procedureID ) {
      if ( !this.state.showSigPopup ) {
        if ( this.state.signature_url ) {
          this.saveWithoutSign();
        } else {
          this.setState({showSignModal: true});
        }
      } else {
        this.setState({showSignModal: true});
      }
    }
  }

  dismissSignModal = () => {
     this.setState({showSignModal: false})
  }

  handleClearReset = () => {
      this.setState({
          inputOut: 'input-outer',
          canvasClass: 'signature-box sig-div  no-display',
          clearClass: 'new-white-btn no-margin clear no-display',
          resetClass: 'new-blue-btn reset  no-display',
          changeClass: 'new-blue-btn no-margin Change'
      })
  }

  clear = () => {
      this._sketch.clear();
      this._sketch.setBackgroundFromDataUrl('');
      this.setState({
          controlledValue: null,
          backgroundColor: 'transparent',
          fillWithBackgroundColor: false,
          canUndo: this._sketch.canUndo(),
          canRedo: this._sketch.canRedo(),
      });
  };

  clearCanvas = () => {
    if (this._sketch) {
      this._sketch.clear();
      this._sketch.setBackgroundFromDataUrl('');
    }
    this.setState({
        canvasClass: 'signature-box sig-div',
        inputOut: 'input-outer no-display',
        clearClass: 'new-white-btn no-margin clear',
        resetClass: 'new-blue-btn reset ',
        changeClass: 'new-blue-btn no-margin Change no-display'
    })
  }

  signThis = () => {

    if ( (this._sketch && this._sketch.toJSON().objects.length === 0 && this.state.canvasClass.indexOf('no-display') === -1) || (this.state.canvasClass.indexOf('no-display') > 0 && this.state.signature_url === '' ) ) {
      toast.error(this.state.globalLang.validation_md_signature_required_if)
    } else {
      let procedureID = this.state.procedureID;
      let mdID        = this.state.md_id

      if (this.state.signature_url !== "" && this.state.canvasClass.indexOf('no-display') > 0) {
        let formData = {}

        if ( this.state.roomType && this.state.roomType === 'provider-room' ) {
          formData = {
            current_procedure_id  : procedureID,
            procedure_ids         : [procedureID],
            signature             : this.state.signature,
            signature_saved       : (this.state.save_sign) ? 1 : 0,
            is_consult            : 0,
            md_user_id            : mdID
          };

          if ( !this.state.isConsentRequired) {
            delete formData.md_user_id;
          }
        } else {
          formData = {
            current_procedure_id  : procedureID,
            procedure_ids         : [procedureID],
            signature_saved       : (this.state.save_sign) ? 1 : 0,
            md_signature          : this.state.signature,
          };
        }

        this.props.signProcedure(formData, false, {}, this.state.roomType);

        this.setState({
          signature_url : this.state.signature_url,
          uploadedSignature_url : this.state.signature_url,
          uploadedSignature:this.state.signature,
          signature:this.state.signature,
          inputOut: 'input-outer',
          canvasClass: 'signature-box sig-div  no-display',
          clearClass: 'new-white-btn no-margin clear no-display',
          resetClass: 'new-blue-btn reset  no-display',
          changeClass: 'new-blue-btn no-margin Change',
          showSignModal: false,
          showLoader : true
        })

      } else {
        proHealthDetInstance.post(config.API_URL + "upload/signature", ({image_data : this._sketch.toDataURL(), upload_type: 'signatures'})).then(response => {
            if ( response.data && response.data.status === 200 ) {
              let formData = {}

              if ( this.state.roomType && this.state.roomType === 'provider-room' ) {
                formData = {
                  current_procedure_id  : procedureID,
                  procedure_ids         : [procedureID],
                  signature             : response.data.data.file_name,
                  signature_saved       : (this.state.save_sign) ? 1 : 0,
                  is_consult            : 0,
                  md_user_id            : mdID
                };

                if ( !this.state.isConsentRequired) {
                  delete formData.md_user_id;
                }
              } else {
                formData = {
                  current_procedure_id  : procedureID,
                  procedure_ids         : [procedureID],
                  signature_saved       : (this.state.save_sign) ? 1 : 0,
                  md_signature          : response.data.data.file_name
                };
              }

              this.props.signProcedure(formData, false, {}, this.state.roomType);

              this.setState({
                signature_url : response.data.data.signature_url,
                uploadedSignature_url : response.data.data.signature_url,
                uploadedSignature:response.data.data.file_name,
                signature:response.data.data.file_name,
                inputOut: 'input-outer',
                canvasClass: 'signature-box sig-div  no-display',
                clearClass: 'new-white-btn no-margin clear no-display',
                resetClass: 'new-blue-btn reset  no-display',
                changeClass: 'new-blue-btn no-margin Change',
                showSignModal: false,
                showLoader: true
              })
            }
        }).catch(error => {
            toast.error(`${this.state.languageData.pro_sign_upload_error_text}`)
        })
      }
    }
  }

  saveWithoutSign = () => {
    let procedureID = this.state.procedureID;
    let mdID        = this.state.md_id

    if (this.state.signature_url !== "") {
      let formData = {}

      if ( this.state.roomType && this.state.roomType === 'provider-room' ) {
        formData = {
          current_procedure_id  : procedureID,
          procedure_ids         : [procedureID],
          signature             : this.state.signature,
          signature_saved       : (this.state.save_sign) ? 1 : 0,
          is_consult            : 0,
          md_user_id            : mdID
        };

        if ( !this.state.isConsentRequired) {
          delete formData.md_user_id;
        }
      } else {
        formData = {
          current_procedure_id  : procedureID,
          procedure_ids         : [procedureID],
          signature_saved       : (this.state.save_sign) ? 1 : 0,
          md_signature          : this.state.signature,
        };
      }

      this.props.signProcedure(formData, false, {}, this.state.roomType);

      this.setState({
        signature_url : this.state.signature_url,
        uploadedSignature_url : this.state.signature_url,
        uploadedSignature:this.state.signature,
        signature:this.state.signature,
        inputOut: 'input-outer',
        canvasClass: 'signature-box sig-div  no-display',
        clearClass: 'new-white-btn no-margin clear no-display',
        resetClass: 'new-blue-btn reset  no-display',
        changeClass: 'new-blue-btn no-margin Change',
        showSignModal: false,
        showLoader : true
      })

    }
  }

  render() {
    let templateQuesionList = ''
    if (this.state.templateQuesionList.length > 0) {
      templateQuesionList = this.state.templateQuesionList.map((questionObj, questionIdx) => {
        return (
          <div key={'templateQuesionList-' + questionObj.id} className="survey-qus-ans">
            <div className="survey-ques"><span className="que-label">{this.state.languageData.pro_que}</span> {questionObj.question}</div>
            {this.renderAnswer(questionObj, questionIdx)}
          </div>
        )
      })
    }

    let optData    = '';

    if ( this.state.mdList !== undefined && this.state.mdList.length > 0 ) {
      optData = this.state.mdList.map((mdObj, mdidx) => {

         return <option key={mdidx} value={mdObj.id}>{(mdObj.firstname && mdObj.firstname != undefined) ? mdObj.firstname : ''} {(mdObj.lastname && mdObj.lastname != undefined) ? mdObj.lastname : ''}</option>;
     })
    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <div className="wide-popup">
            <div className="modal-blue-header">
              <Link to={this.state.returnTo} className="popup-cross">×</Link>

              {(this.state.showLoader === false && this.state.prevProcedureID && this.state.prevProcedureID > 0 ) ? <a onClick={this.getProcedureDataByID.bind(this)} name="getPrev" className="slide-arrows"><img src={arrowLeft} onClick={this.getProcedureDataByID.bind(this)} name="getPrev" /></a> : ''}

              {this.state.showLoader === false && <span className="popup-blue-name">{this.state.procedure_name}</span>}

              {(this.state.showLoader === false && this.state.nextProcedureID && this.state.nextProcedureID > 0 ) ? <a onClick={this.getProcedureDataByID.bind(this)} name="getNext" className="slide-arrows"><img src={arrowRight} onClick={this.getProcedureDataByID.bind(this)} name="getNext" /></a> : ''}

              {(this.state.action && this.state.action === 'recently-deleted' && this.state.showLoader === false) ?
                <div className="popup-new-btns popup-new-btns-restore">
                  <button className="header-select-btn confirm-model" data-confirm-url="" data-message={this.state.settingsLang.recently_deleted_restore_msg} onClick={this.handleRestoreModal}>{this.state.settingsLang.recently_deleted_restore}</button>
                </div>
                : ""
              }

              {(this.state.action === 'pending') && <div className="popup-new-btns"><button type="submit" className="new-blue-btn pull-right consent-model m-r-5" onClick={this.openSignModal}>{this.state.languageData.pro_text_sgn}</button> </div>}
            </div>

            <div className="wide-popup-wrapper time-line">

            <div className={(this.state.showSignModal) ? 'modalOverlay' : 'modalOverlay no-display'}>
              <div className="small-popup-outer">
                <div className="small-popup-header">
                  <div className="popup-name">{(this.state.roomType && this.state.roomType === 'provider-room' && this.state.action && this.state.action === 'pending') ? this.state.languageData.pro_sign_and_send_text : this.state.languageData.pro_popup_md_consent_text}</div>
                  <a onClick={this.dismissSignModal} className="small-cross">×</a>
                </div>

                <div className="juvly-container">
                  {(this.state.roomType && this.state.roomType === 'provider-room' && this.state.action && this.state.action === 'pending' && this.state.isConsentRequired) ? <div>
                    <div className="settings-subtitle signature-subtitle">Please select MD's:</div>
                    <select name="md_id" className="setting-select-box" onChange={this.handleInputChange} value={this.state.md_id}>
                    {optData}
                    </select>
                  </div> : ""}

                  <div className="settings-subtitle signature-subtitle">{this.state.languageData.pro_please_sign_text}:</div>
                  <div className={this.state.canvasClass} id="sig-div">
                      {((this.state.showSignModal) && this.state.canvasClass === 'signature-box sig-div') && <SketchField width='400px'
                       ref={c => (this._sketch = c)}
                       height='200px'
                       tool={Tools.Pencil}
                       lineColor='black'
                       lineWidth={6}
                       />}
                  </div>
                  <div className="img-src" id="img-src">
                    <div className={this.state.inputOut} style={{background: '#fff none repeat scroll 0 0'}}>
                      <img className="" id="signature_image" src={(this.state.uploadedSignature_url) ? this.state.uploadedSignature_url : this.state.signature_url}/>
                    </div>
                  </div>

                  <div className="right-sign-btn m-t-20">
                    <input className="pull-left sel-all-visible" type="checkbox" name="save_sign" onChange={this.handleInputChange}/>
                    <label className="search-text" htmlFor="save_sign">{this.state.languageData.pro_save_sig_text}</label>
                  </div>

                  <div className="img-src change-sig">
                    <div className="pull-left">
                      <button type="button" id="change" onClick={this.clearCanvas} className={this.state.changeClass}>{this.state.languageData.pro_change_text}</button>
                    </div>
                    <div className="pull-left">
                      <button type="button" id="change1" onClick={this.clear} className={this.state.clearClass}>{this.state.languageData.pro_clear_text}</button>
                    </div>
                    <div className="pull-left">
                      <button type="button" id="change2" onClick={this.handleClearReset} className={this.state.resetClass}>{this.state.languageData.pro_reset_text}</button>
                    </div>
                    <div className="pull-left">
                      {/*<button type="button" id="change3" onClick={this.saveSignature} className={this.state.resetClass}>Save Signature</button>*/}
                    </div>
                  </div>
                </div>
                <div className="footer-static">
                  <a id="saveConsultation" onClick={this.signThis} className="new-blue-btn pull-right">{(this.state.roomType && this.state.roomType === 'provider-room' && this.state.action && this.state.action === 'pending') ?  this.state.languageData.pro_btn_sign_and_send_text : this.state.languageData.pro_text_sgn}</a>
                </div>
              </div>
            </div>

              <div className="row">
                <div className="col-xs-12">
                  {templateQuesionList}
                </div>

                {this.state.showLoader === false && <div className="col-xs-12">
                  <div className="survey-qus-ans">
                    <div className="survey-ques consult-fee"> <span className="que-label">Consultation Fee:</span>{numberFormat(this.state.consultationFees, 'currency')}</div>
                  </div>
                </div>}
              </div>
            </div>




            <div className={this.state.showLoader ? "new-loader text-left displayBlock proDetailLoader" : "new-loader text-left"} >
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
              </div>
            </div>
          </div>
          {/* Resotre Modal - START */}
          <div className={(this.state.isShowDeletedModal) ? 'overlay' : ''} ></div>
          {(this.props.match.params.type != undefined && this.props.match.params.type == 'recently-deleted') &&
            <div id="filterModal" role="dialog" className={(this.state.isShowDeletedModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" onClick={this.handleRestoreModal}>×</button>
                    <h4 className="modal-title" id="model_title">{this.state.globalLang.delete_confirmation}</h4>
                  </div>
                  <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.settingsLang.recently_deleted_restore_msg}</div>
                  <div className="modal-footer">
                    <div className="col-md-12 text-left" id="footer-btn">
                      <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.handleRestoreModal}>{this.state.globalLang.label_no}</button>
                      <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.restoreSelected}>{this.state.globalLang.label_yes}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          {/* Resotre Modal - END */}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};

  if (state.ProcedureReducer.action === 'VIEW_HEALTH_PROCEDURE_DATA') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ProcedureReducer.data.message]);
      if (state.ProcedureReducer.data.message === 'procedure_not_found') {
        returnState.message = languageData.global[state.ProcedureReducer.data.message]
        returnState.procedureNotFound = true
      } else {
        returnState.showLoader = false
      }
    } else {
      returnState.procedureData = state.ProcedureReducer.data.data
    }
  } else if (state.SettingReducer.action === "RECENTLY_DELETED_RESTORE") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      return { showLoader: false }
    } else {
      return {
        message: languageData.global[state.SettingReducer.data.message],
        redirectToDeleted: true
      }
    }
  } else if ( state.ProcedureReducer.action === 'PRO_MDS_LIST' ) {
    toast.dismiss();

    if ( state.ProcedureReducer.data.status !== 200 ) {
    //  toast.error(languageData.global[state.ProcedureReducer.data.message]);
    } else {
      return {
        mdList: state.ProcedureReducer.data.data
      }
    }
    return {}
  } else if ( state.ProcedureReducer.action === 'SIGN_HEALTH_PROCEDURE' ) {
    toast.dismiss();

    if ( state.ProcedureReducer.data.status !== 201 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message]);
    } else {
      toast.success(languageData.global[state.ProcedureReducer.data.message]);
      return {
        procedureSignData: state.ProcedureReducer.data,
      }
    }
    return {}
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ vieweHealthProcedureData: vieweHealthProcedureData, emptyProcedureReducer: emptyProcedureReducer, restoreRecentlyDeleted: restoreRecentlyDeleted, fetchSelectMD: fetchSelectMD, signProcedure: signProcedure }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProcedureHhealthDetail));
