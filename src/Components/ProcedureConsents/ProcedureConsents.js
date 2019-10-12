import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { formatBytes } from '../../Utils/services.js';
import axios from 'axios';
import config from '../../config';
import "react-datepicker/dist/react-datepicker.css";
import { emptyProcedureReducer, getProcedureConsent, updateProcedureConsent } from '../../Actions/Procedures/procedureActions.js';
import Select from 'react-select';
import crossImage from '../../images/close.png';
import defLogo from '../../images/upload.png';
import { isFormSubmit } from '../../Utils/services.js';

const procedureInstance = axios.create();
procedureInstance.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  if (!error.response) {
    return { data: { data: "", message: "file_type_error", status: 400 } }
  }
});

class ProcedureConsents extends Component {
  constructor(props) {
    super(props);

    const languageData = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType: (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      clientID: this.props.match.params.clientID,
      procedureID: (this.props.match.params.procedureID) ? this.props.match.params.procedureID : 0,
      globalLang: languageData.global,
      returnTo: '',
      showModal: false,
      showLoader: false,
      consentData: {},
      selectedConsentsOptions: [],
      consentsOptions: [],
      isSelectFocus: false,

    }
  }

  componentDidMount() {
    this.setState({ showLoader: true })
    this.props.getProcedureConsent(this.state.procedureID)

    let returnTo = '';

    if (this.state.backURLType && this.state.backURLType === 'clients') {
      if(this.props.match.params.resourceType === 'edit'){
        returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.state.clientID + "/consent/" + this.props.match.params.procedureID + '/profile' : "/" + this.state.backURLType
      } else {
        returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID : "/" + this.state.backURLType
      }
    } else {



    }
    this.setState({ returnTo: returnTo })
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}
    if (nextProps.consentData !== undefined && nextProps.consentData !== prevState.consentData) {
      returnState.showLoader = false
      returnState.consentData = nextProps.consentData

      let consentsOptions = [];
      if (nextProps.consentData.all_consents && nextProps.consentData.all_consents.length > 0) {
        consentsOptions = nextProps.consentData.all_consents.map((obj, idx) => {
          return { value: obj.id, label: obj.consent_name }
        })
      }
      returnState.consentsOptions = consentsOptions

      // For Edit Mode - START
      let selectedConsentsOptions = [];
      if (nextProps.consentData.saved_consents && nextProps.consentData.saved_consents && nextProps.consentData.saved_consents.length > 0) {
        selectedConsentsOptions = nextProps.consentData.saved_consents.map((obj, idx) => {
          if (obj && obj.consent_id) {
            let tmp = consentsOptions.find(x => x.value == obj.consent_id);
            if(tmp){
                return tmp;
            }
          }
        })
      }
      returnState.selectedConsentsOptions = selectedConsentsOptions

      if(nextProps.consentData.signature_image_name){
        returnState.signature_image = nextProps.consentData.signature_image_name;
        returnState.download_path = nextProps.consentData.signature_image_url;
        returnState.file_thumbnail = nextProps.consentData.signature_image_name;
      }
      // For Edit Mode - END


      nextProps.emptyProcedureReducer()
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
    }

    return returnState
  }

  resetFileState = () => {
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
    var inputFiled = document.getElementById("image_questionnaire-signature_image");
    if (inputFiled) {
      inputFiled.value = ''
    }
  }

  removeUploadedFile = (index, questionId, event) => {
    this.setState({ signature_image: '' });
    this.resetFileState(questionId)
  }

  handleUpload = (targetName) => {
    let uploadtype = 'patient_signatures'
    const data = new FormData()
    data.append('file', this.state.file, this.state.file.name)
    let endpoint = config.API_URL + `media/upload?upload_type=${uploadtype}`;

    axios.post(endpoint, data).then(res => {
      let templateQuesionList = this.state.templateQuesionList;
      let uploadIndex = this.state.uploadIndex
      this.setState({ signature_image: res.data.data.file_name, download_path: this.state.fileReader.result, showLoader: false })
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

  handleConsentChange = (selectedConsentsOptions) => {
    this.setState({
      selectedConsentsOptions: selectedConsentsOptions,
      dataChanged: true
    })
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
    this.setState({ [event.target.name]: value, dataChanged: true });

  }


  handleSubmit = (event) => {
    event.preventDefault();
    if(isFormSubmit()){
      let error = false;
      let consentIDS = []
      if (this.state.selectedConsentsOptions && this.state.selectedConsentsOptions.length > 0) {
        this.state.selectedConsentsOptions.map((obj, idx) => {
          consentIDS.push(obj.value)
        })
        if (this.state.signature_image == undefined || this.state.signature_image == null || this.state.signature_image == '') {
          toast.dismiss()
          toast.error(this.state.globalLang.signature_image_required)
          error = true;
        }
      }
      if (this.state.signature_image != undefined && this.state.signature_image != null && this.state.signature_image != '') {
        if(consentIDS.length <= 0){
          toast.dismiss()
          toast.error(this.state.globalLang.validation_please_select_consent)
          error = true;
        }
      }
      if (error) {
        return
      }
      let formData = {
        signature_consents: {
          consent_ids: consentIDS,
          signature_image: this.state.signature_image,
        }
      }

      this.setState({ showLoader: true })
      this.props.updateProcedureConsent(this.state.procedureID, formData)
    }
    return false
  }


  showDelProModal = () => {
    if (this.state.procedureID) {
      this.setState({ showModal: true })
    }
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteConsent = () => {
    if (this.state.clientID && this.state.procedureID) {
      this.setState({ showModal: false })
      //this.setState({ showLoader: true, showModal: false })
      //this.props.deleteConsent(this.state.clientID, this.state.procedureID)
    }
  }

selectOnFocus = () => {
    this.setState({isSelectFocus:true})
}

selectOnBlur = () => {
  this.setState({isSelectFocus:false})
}
  render() {
    let patientName = (this.state.consentData && this.state.consentData.patient_name) ? this.state.consentData.patient_name : ''


    return (
      <div id="content" className="content-health-timeline-procedure">
        <form action="javascript:void(0);">
          <div className="container-fluid content setting-wrapper add-edit-procedure">
            <div className="juvly-section full-width m-t-15">
              <div className="juvly-container">


                <div className="juvly-title m-b-40">
                  {(this.state.showLoader === false) ? ((this.state.resourceType === 'edit') ? patientName + ' - Edit Consent' : patientName + ' - Add Consent') : ''}
                  <Link to={this.state.returnTo} className="pull-right"><img src={crossImage} /></Link>
                </div>


                <div className="row">
                  <div className="col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">Select Consents</div>
                      <div className="setting-input-outer">
                        <div className="tag-auto-select">
                          {(this.state.consentsOptions) && <Select
                            onChange={this.handleConsentChange}
                            value={this.state.selectedConsentsOptions}
                            isClearable
                            isSearchable
                            options={this.state.consentsOptions}
                            isMulti={true}
                            onFocus={this.selectOnFocus}
                            onBlur={this.selectOnBlur}
                          />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">Signature Image</div>
                      <div className="row add-doc-section">
                        <div className="col-xs-6 m-b-20">
                          <div className={"file-container file-upload-img"} title={(this.state.signature_image) ? this.state.signature_image : ''}>
                            {((this.state.signature_image) && this.state.isSelectFocus === false) && <a className="delete-file" onClick={this.removeUploadedFile} ></a>}
                            <img
                              className={(this.state.signature_image) ? "full-custom-img" : ""}
                              src={(this.state.signature_image) ? this.state.download_path : defLogo}
                            />
                            <span className={(this.state.signature_image) ? "file-name file-info" : "file-name-hide no-display"}> {this.state.file_thumbnail}</span>
                            <span className={(this.state.signature_image) ? "file-size file-info" : "file-size-hide no-display"}>{this.state.file_size}</span>
                            <div className="upload">{this.state.globalLang.global_upload}
                              <input type="file" className={'image_questionnaire'} name="file" autoComplete="off" onChange={this.handleFileChosen} title={(this.state.signature_image) ? '' : 'No file chosen'} id={'image_questionnaire-signature_image'} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className={(this.state.showModal === true) ? 'overlay' : ''}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title">Confirmation required!</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      Are you sure you want to delete this Consent?
                      </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>No</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteConsent}>Yes</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="footer-static">
                {(this.state.resourceType === 'edit') && <a onClick={() => this.showDelProModal()} className="new-red-btn pull-left">Delete</a>}
                <input className="new-blue-btn pull-right" type="button" onClick={this.handleSubmit} value={"Save"} />
                <Link to={this.state.returnTo} className="new-white-btn pull-right">Cancel</Link>
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

  if (state.ProcedureReducer.action === 'GET_HEALTH_PROCEDURE_CONSENT') {
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
      returnState.consentData = state.ProcedureReducer.data.data
    }
  }

  if (state.ProcedureReducer.action === 'UPDATE_HEALTH_PROCEDURE_CONSENT') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ProcedureReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.message = languageData.global[state.ProcedureReducer.data.message]
      returnState.redirect = true
    }
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getProcedureConsent: getProcedureConsent, updateProcedureConsent: updateProcedureConsent, emptyProcedureReducer: emptyProcedureReducer }, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(ProcedureConsents);
