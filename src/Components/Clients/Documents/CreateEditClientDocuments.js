import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import { checkIfPermissionAllowed, numberFormat, formatBytes } from '../../../Utils/services.js';
import axios from 'axios';
import config from '../../../config';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import {getClientDocumentData, saveClientDocument, updateClientDocument, exportEmptyData} from '../../../Actions/Clients/clientsAction.js';
import Select from 'react-select';
import { displayName, showFormattedDate } from '../../../Utils/services.js';

const initDocument = () => {
  return {
    document_name :'',
    document_type :'',
    appointment_id:'',
    filename:'',
    file_thumbnail:'',
    file_size:'',
    file_ype:'', // image, doc, pdf,
    download_path:''
  }
}

const initDocumentClass = () => {
  return {
    document_name :'setting-input-box',
    document_type :'setting-input-box',
    appointment_id:'setting-select-box',
    filename:'image_questionnaire',
    fileError:false
  }
}

// use fnction while uplaoding file
const getFileMimeType = (value) => {
  value = String (value);
  let fileType = '';
  if (["application/pdf"].indexOf(value) > -1 ) {
    fileType = 'pdf';
  } else if (["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/gif","image/GIF"].indexOf(value) > -1 ) {
    fileType = 'image';
  } else if(["application/excel", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/x-excel", "application/x-msexcel"].indexOf(value) > -1){
    fileType = 'xls';
}  else if(["application/doc", "application/ms-doc", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].indexOf(value) > -1){
    fileType = 'doc';
  }
  return fileType;
}

// use function for already uplaoded file
const getFileType = (value) => {
  value = String (value);
  value = value.split('.').pop();
  if(!value){
    return null
  }
  value = value.toLowerCase()
  let fileType = '';
  if (["pdf"].indexOf(value) > -1 ) {
    fileType = 'pdf';
  } else if (["png", "jpg", "jpeg", "gif"].indexOf(value) > -1 ) {
    fileType = 'image';
  } else if(["xls", "xlsx"].indexOf(value) > -1){
    fileType = 'xls';
  }  else if(["doc", "docs"].indexOf(value) > -1){
    fileType = 'doc';
  }
  return fileType;
}

const documentTypeList = [
  {label: "image", value: "image", data: {patient_documents: {document_type: "image"}}},
  {label: "pdf", value: "pdf", data: {patient_documents: {document_type: "pdf"}}},
  {label: "word", value: "word", data: {patient_documents: {document_type: "word"}}},
  {label: "excel", value: "excel", data: {patient_documents: {document_type: "excel"}}}
];


class CreateEditClientDocuments extends Component {
  constructor(props) {
    super(props);
    const languageData  = JSON.parse(localStorage.getItem('languageData'))
    this.state = {
      clientsLang: languageData.clients,
      globalLang: languageData.global,
      showLoader: false,
      backURLType: (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      clientID: this.props.match.params.clientID,
      actionType: (this.props.match.params.actionType) ? this.props.match.params.actionType : 'profile',
      returnTo:'',
      isRender: false,
      isShowDeleteModal:false,
      documentID: 0, // use for deletetion, updation
      multipleDocumentList:[initDocument()],
      multipleDocumentClassList:[initDocumentClass()],
      appointmentList:[],
      showAutoSuggestion:false,
      documentTypeList:[], //[],
      autoSuggestionDocumentTypes:[],
      selectedDocumentType:{},
      documentTypeIndex:'',
    }
  }

  componentDidMount() {
    this.setState({showLoader:false})
    document.addEventListener('click', this.handleClickDocument, false);
    let isRender = false;
    let clientID = this.props.match.params.clientID;
    if(clientID == undefined) {
      clientID = 0;
      isRender=true;
    }
    let actionType = this.props.match.params.type;
    if(actionType == undefined) {
      actionType = '';
    }
    let documentID = this.props.match.params.documentID;
    if(documentID == undefined || documentID < 0) {
      documentID = 0;
    }
    const formData ={
      params:{
        patient_id:clientID
      }
    }
    this.props.getClientDocumentData(documentID,formData)
    this.setState({clientID:clientID,actionType:actionType,isRender:isRender,documentID:documentID})

    let returnTo = '';
    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/documents/" +  clientID + "/" + this.props.match.params.type  : "/" + this.state.backURLType;
    } else {
    }
    this.setState({returnTo:returnTo})
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.documentData !== undefined && nextProps.documentData !== prevState.documentData){
      nextProps.exportEmptyData()
      returnState.documentData = nextProps.documentData
      returnState.appointmentList = (nextProps.documentData.appointments) ? nextProps.documentData.appointments : []
      returnState.documentTypeList = (nextProps.documentData.document_types) ? nextProps.documentData.document_types : []
      if(returnState.documentData.document !== undefined && returnState.documentData.document !== null){
        if(returnState.documentData.document.id == prevState.documentID){
          let  multipleDocumentList = initDocument()
          multipleDocumentList.filename = returnState.documentData.document.filename
          multipleDocumentList.file_type = getFileType(multipleDocumentList.filename)
          multipleDocumentList.download_path = returnState.documentData.document.download_path
          multipleDocumentList.file_thumbnail = returnState.documentData.document.filename
          multipleDocumentList.document_name = returnState.documentData.document.document_name
          multipleDocumentList.document_type = returnState.documentData.document.document_type
          multipleDocumentList.appointment_id = returnState.documentData.document.appointment_id
          returnState.multipleDocumentList = [multipleDocumentList]
          returnState.multipleDocumentClassList = [initDocumentClass()]
        }
      }
      returnState.showLoader = false
    } else if(nextProps.showLoader !== undefined && nextProps.showLoader === false){
      nextProps.exportEmptyData()
      returnState.showLoader = false
    } else if(nextProps.redirect !== undefined && nextProps.redirect === true){
      nextProps.exportEmptyData()
      toast.success(nextProps.message)
      nextProps.history.push(prevState.returnTo);
    }
    return returnState
  }

  componentDidUpdate = (prevProps, prevState) => {
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickDocument, false);
  }

  handleClickDocument = (e) =>  {
    if (this.refAutoSuggestionProducts && !this.refAutoSuggestionProducts.contains(e.target)) {
      this.setState({showAutoSuggestion:false,documentTypeIndex:''})
    }
  }


  handleUpload = (targetName) => {
    let uploadtype = '';
    uploadtype = 'patient_documents'
    const data = new FormData()
    data.append('file', this.state.file, this.state.file.name)
    data.append('upload_type', uploadtype)
    let endpoint = config.API_URL + `media/upload?upload_type=${uploadtype}`;
    axios.post(endpoint, data).then(res => {
      let multipleDocumentList = this.state.multipleDocumentList;
      let uploadIndex = this.state.uploadIndex
      multipleDocumentList[uploadIndex]['filename'] =  res.data.data.file_name
      multipleDocumentList[uploadIndex]['file_thumbnail'] = this.state.file_thumbnail
      multipleDocumentList[uploadIndex]['file_size'] =   this.state.file_size
      multipleDocumentList[uploadIndex]['download_path'] =  this.state.fileReader.result
      multipleDocumentList[uploadIndex]['file_type'] = getFileType(res.data.data.file_name);
      this.setState({multipleDocumentList:multipleDocumentList, showLoader: false});
    }).catch(error => {
      toast.error(this.state.globalLang[error.response.data.message]);
      this.setState({showLoader: false});
    })
  }

  handleFileRead = (e) => {
    const content     = this.state.fileReader.result;
    let fileSize  = formatBytes(this.state.file.size, 1)
    this.setState({file_thumbnail: this.state.file.name, file_size: fileSize, file_src : this.state.fileReader.result, showLoader: true});

    this.handleUpload(this.state.target.name)
  }

  handleFileChosen = (file, target) => {
    this.state.fileReader           = new FileReader();
    this.state.fileReader.onloadend = this.handleFileRead;
    this.state.fileReader.readAsDataURL(file);
    this.state.file = file
    this.state.target = target
    this.state.uploadIndex = target.dataset.index
  }

  handleInputChange = event => {
    this.setState({userChanged:true});
    const target = event.target;
    let value= target.value;
    let inputName = target.name;
    const  index = event.target.dataset.index;
    const multipleDocumentList = this.state.multipleDocumentList;
    multipleDocumentList[index][inputName] = value;
    this.setState({multipleDocumentList:multipleDocumentList});

    if ( target && target.type === 'file' ) {
      const allowedTypes  = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/gif","image/GIF", "application/excel",  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/x-excel", "application/x-msexcel",  "application/pdf", "application/doc", "application/ms-doc", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if ( target.files && allowedTypes.indexOf(target.files[0].type) > -1 ) {
        //multipleDocumentList[index]['file_type'] = getFileMimeType(target.files[0].type);
        //this.setState({multipleDocumentList:multipleDocumentList});
        this.handleFileChosen(target.files[0], target)
      } else {
        toast.error('This file type is not allowed');
      }
    } else {
      this.setState({[event.target.name]: value});
    }
  }


  handleSubmit = (event) => {
    event.preventDefault();
    let error = false;
    let multipleDocumentList = this.state.multipleDocumentList;
    let multipleDocumentClassList = this.state.multipleDocumentClassList;
    let arr = []
    arr = this.state.multipleDocumentList.map((obj,idx) => {
      if(obj.document_name === '' || obj.document_name === null || obj.document_name === undefined){
        multipleDocumentClassList[idx]['document_name'] = "setting-input-box field_error"
        error = true;
      } else {
        multipleDocumentClassList[idx]['document_name'] = "setting-input-box"
      }
      if(obj.filename === '' || obj.filename === null || obj.filename === undefined){
        multipleDocumentClassList[idx]['fileError'] = true
        error = true;
      } else {
        multipleDocumentClassList[idx]['fileError'] = false;
        return {appointment_id: obj.appointment_id, document_name: obj.document_name, document_type: obj.document_type, filename: obj.filename}
      }
    })
    this.setState({
      multipleDocumentClassList:multipleDocumentClassList
    })
    if(error){
      return
    }
    let formData = {
      patient_id : this.state.clientID,
      document_data : arr
    }
    this.setState({showLoader:true})
    if(this.state.documentID){
      this.props.updateClientDocument(this.state.documentID,formData)
    } else {
      this.props.saveClientDocument(formData)

    }

  }

  addMultipleDocumentList = (event) => {
    let multipleDocumentList = this.state.multipleDocumentList;
    multipleDocumentList.push(initDocument());
    let multipleDocumentClassList = this.state.multipleDocumentClassList;
    multipleDocumentClassList.push(initDocumentClass());
    this.setState({multipleDocumentList:multipleDocumentList,multipleDocumentClassList:multipleDocumentClassList});
  }

  deleteMultipleDocumentList = (event) => {
    let returnState = {};
    let multipleDocumentList = this.state.multipleDocumentList;
    if(multipleDocumentList.length == 1) { return false}
    const  index = event.target.dataset.index;
    multipleDocumentList.splice(index, 1);
    let multipleDocumentClassList = this.state.multipleDocumentClassList;
    if(multipleDocumentClassList[index] != undefined){
      multipleDocumentClassList.splice(index, 1);
    }
    this.setState({multipleDocumentList:multipleDocumentList,multipleDocumentClassList:multipleDocumentClassList});
  }

  removeUploadedFile = (event) => {
    let returnState = {};
    let multipleDocumentList = this.state.multipleDocumentList;
    const  index = event.target.dataset.index;
    multipleDocumentList[index]['file_thumbnail'] = ''
    multipleDocumentList[index]['file_type'] = ''
    multipleDocumentList[index]['download_path'] = ''
    multipleDocumentList[index]['file_size'] =   ''
    multipleDocumentList[index]['filename'] =  ''
    this.setState({multipleDocumentList:multipleDocumentList});
  }

  handleSelectedDocumentType = (selectedDocumentType) => {
    if(typeof selectedDocumentType == 'object' && selectedDocumentType.label != undefined && this.state.documentTypeIndex != ''){
      let multipleDocumentList = this.state.multipleDocumentList;
      multipleDocumentList[this.state.documentTypeIndex]['document_type'] = selectedDocumentType.label;
      multipleDocumentList = multipleDocumentList;
      this.setState({selectedDocumentType:{},showAutoSuggestion:false,multipleDocumentList:multipleDocumentList,documentTypeIndex:''});
    }
  }

  handleAutoSuggestion = (event) => {
    let returnState = {}
    const target = event.target;
    let value= target.value;
    let inputName = event.target.name;
    const index = event.target.dataset.index;

    // Update document type value (document list array)
    let multipleDocumentList = this.state.multipleDocumentList;
    multipleDocumentList[index][inputName] = value;
    returnState.multipleDocumentList = multipleDocumentList;

    // fetch list (document type) for auto-suggestion
    let autoSuggestionDocumentTypes = [];
    let showAutoSuggestion = false;
    let documentTypeIndex = '';
    if(value.length > 2){ // fetch list (document type) for auto-suggestion only if entered value length is equal/more than 2
      documentTypeIndex = index;
      showAutoSuggestion = true;
      // fetch match item/value form document-type-list-type (stored data type into DB)
      this.state.documentTypeList.map((obj,idx) =>  {
          if(typeof obj.label == 'string'){
            let regex = new RegExp(value.toLowerCase() ,"g");
            let label = obj.label.toLowerCase()
            if(label.match(regex)){
              // check suggested value is alread exist or not into autoSuggestionDocumentTypes list
              regex = new RegExp(label ,"g");
              let isKeyExist = autoSuggestionDocumentTypes.find(type => type.label.match(regex))
              // if suggested value is not exist into autoSuggestionDocumentTypes list then push that value(key-pair) into autoSuggestionDocumentTypes list
              if(isKeyExist === undefined){
                autoSuggestionDocumentTypes.push(obj);
              }
            }
          }
      })

      // fetch match item/value form entered document-type into form
      multipleDocumentList.map((obj,idx) => {
        if(typeof obj.document_type == 'string' && obj.document_type != ''){
          let regex = new RegExp(value.toLowerCase() ,"g");
          let documentType = obj.document_type.toLowerCase()
          if(index != idx && documentType.match(regex)){
            // check suggested value is alread exist or not into autoSuggestionDocumentTypes list
            regex = new RegExp(obj.document_type ,"g");
            let isKeyExist = autoSuggestionDocumentTypes.find(type => type.label.match(regex))
            // if suggested value is not exist into autoSuggestionDocumentTypes list then push that value(key-pair) into autoSuggestionDocumentTypes list
            if(isKeyExist === undefined){
              autoSuggestionDocumentTypes.push({label:obj.document_type, value:obj.document_type});
            }
          }
        }
      })
    }
    returnState.autoSuggestionDocumentTypes = autoSuggestionDocumentTypes;
    returnState.selectedDocumentType = {};
    returnState.userChanged = true;
    returnState.showAutoSuggestion = showAutoSuggestion;
    returnState.documentTypeIndex = documentTypeIndex;
    this.setState(returnState);
  }

  render() {


    let defLogo = (this.state.documentID) ? "/../../../../../images/upload.png" : "../../../../images/upload.png";
    let uploadProfile = (this.state.documentID) ? "/../../../../../images/file.png" : "../../../../images/file.png";
    // let firstName = (userData && userData.user && userData.user['firstname']) ? capitalizeFirstLetter(userData.user['firstname']) : '';
    return (
        <div id="content" className="content-client-documents">
          <div className="container-fluid content setting-wrapper">
            <div className="juvly-section full-width m-t-15">
              <div className="juvly-container">
                <div className="juvly-title m-b-40">{(this.state.documentID) ? this.state.clientsLang.client_edit_document : this.state.clientsLang.client_add_document}
                  <Link to={this.state.returnTo} className="pull-right"><img src="/images/close.png" /></Link>
                </div>

                <div className="juvly-subtitle no-margin">{this.state.clientsLang.client_document_information}</div>
                {this.state.multipleDocumentList.map((obj,idx) =>{
                  const documentClass = (this.state.multipleDocumentClassList[idx] != undefined) ? this.state.multipleDocumentClassList[idx] : initDocumentClass();
                  return (
                    <div key={'document-upload'+idx} className="row add-doc-section">
                      <div className="col-xs-12 profile-detail-left no-margin">
                        <div className="main-profile-picture">
                          <div className="col-xs-6 no-padding">
                            <div className={(documentClass.fileError) ? "file-container file-upload-img field_error" : "file-container file-upload-img"} title={(obj.filename) ? obj.filename : ''}>
                              {(obj.filename) && <a className="delete-file" onClick={this.removeUploadedFile} data-index={idx}></a>}
                              <img
                              className={(obj.file_type === 'image' && obj.download_path !== '') ? "full-custom-img" : "" }
                              src={(obj.file_type === 'image' && obj.download_path !== '') ? obj.download_path : (obj.file_type !== 'image' && obj.download_path !== '') ? uploadProfile : defLogo}

                              />
                              <span className={(obj.filename) ? "file-name file-info" : "file-name-hide no-display"}> {obj.file_thumbnail}</span>
                              <span className={(obj.filename) ? "file-size file-info" : "file-size-hide no-display"}>{obj.file_size}</span>
                              <div className="upload">{this.state.globalLang.global_upload}
                                <input type="file" className={documentClass.filename} name="file" autoComplete="off" onChange={this.handleInputChange} data-index={idx} title={(obj.filename) ? '' : 'No file chosen'} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.clientsLang.client_document_name}<span className="setting-require">*</span></div>
                              <div className="setting-input-outer">
                                <input type="text" autoComplete="off" className={documentClass.document_name} name="document_name" value={obj.document_name} onChange={this.handleInputChange} data-index={idx} />
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.clientsLang.client_document_type}</div>
                              <div className="setting-input-outer add-doc-serach-dropdown">
                                <input type="text" autoComplete="off" className={documentClass.document_type} name="document_type" value={obj.document_type} onChange={this.handleAutoSuggestion} data-index={idx} />
                                <ul className={(this.state.autoSuggestionDocumentTypes.length && this.state.showAutoSuggestion && this.state.documentTypeIndex == idx) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"} ref={(refAutoSuggestionProducts) => this.refAutoSuggestionProducts = refAutoSuggestionProducts}>
                                {this.state.autoSuggestionDocumentTypes.map((typeObj, typeIdx) => {
                                    return(
                                        <li key={"products-"+idx+'-'+typeIdx} data-id={typeObj.id} onClick={this.handleSelectedDocumentType.bind(this,typeObj)}>
                                          <a>
                                              {typeObj && typeObj.label}
                                          </a>
                                        </li>
                                      )
                                  })}
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer no-margin">
                              <div className="new-field-label">{this.state.clientsLang.client_select_appointment}</div>
                              <div className="setting-input-outer">
                                <select className={documentClass.appointment_id} name="appointment_id" value={obj.appointment_id} onChange={this.handleInputChange} data-index={idx} >
                                  <option value=''>{this.state.globalLang.label_select}</option>
                                  {(this.state.appointmentList.length > 0) &&
                                    this.state.appointmentList.map((obj,idx) => {
                                      return (
                                        <option key={'appointmentList-'+idx} value={obj.id}>{showFormattedDate(obj.appointment_datetime,true)}</option>
                                      )
                                    })
                                  }
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                        {(this.state.multipleDocumentList.length > 1) &&
                          <a href="javascript:void(0);" className="add-round-btn" onClick={this.deleteMultipleDocumentList} data-index={idx}>
                            <span data-index={idx}>-</span>
                          </a>
                        }
                      </div>
                    </div>
                  )
                })}

                <div className="add-document-btns">
                  {(this.state.documentID == 0) && <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.addMultipleDocumentList}>{this.state.clientsLang.client_add_more_documents}</a>}
                  <p className="p-text pull-left">{this.state.clientsLang.client_document_allowed_file_types}</p>
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.globalLang.label_save}</a>
                <Link to={this.state.returnTo} className="new-white-btn pull-right">{this.state.globalLang.label_cancel}</Link>
              </div>
            </div>
          </div>
          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader' : 'new-loader text-left'}>
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
  if ( state.ClientsReducer.action === 'CLIENT_DOCUMENT_DATA' ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.documentData = state.ClientsReducer.data.data
    }
  } else if ( state.ClientsReducer.action === 'CLIENT_DOCUMENT_SAVE' ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.redirect = true
      returnState.message = languageData.global[state.ClientsReducer.data.message]
    }
  } else if ( state.ClientsReducer.action === 'CLIENT_DOCUMENT_UPDATE' ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message])
      returnState.showLoader = false
    } else {
      returnState.redirect = true
      returnState.message = languageData.global[state.ClientsReducer.data.message]
    }
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getClientDocumentData: getClientDocumentData,
    saveClientDocument:saveClientDocument,
    updateClientDocument:updateClientDocument,
    exportEmptyData:exportEmptyData
  }, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps) (CreateEditClientDocuments);
