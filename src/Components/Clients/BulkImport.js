import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import config from '../../config';
import axios from 'axios';
import {clientBulkUpload,exportEmptyData} from '../../Actions/Clients/clientsAction.js';
import {connect} from 'react-redux'
import { bindActionCreators } from "redux";
import { ToastContainer, toast } from "react-toastify";
import DropzoneComponent from 'react-dropzone-component';
import { getToken,checkIfPermissionAllowed, numberFormat, formatBytes } from '../../Utils/services.js';
import Loader from '../Common/Loader.js'
import validator from 'validator';

class BulkImport extends Component{
  constructor(props){
    super(props);
    const languageData  = JSON.parse(localStorage.getItem('languageData'))
    this.state={
      clientsLang: languageData.clients,
      globalLang: languageData.global,
      showLoader: false,
      clientList:[],
      userChanged:false,
      file_name:'',
      file_size:'',
      file_thumbnail:'',
      fileColomNames:[],
      fileColomOptions:[],
      providerList:[],
      provider_id:'',
      providerIdClass:'setting-select-box',
      notification_email:'',
      notificationEmailClass:'setting-input-box',
      isShowAlertModal:false,
      alertModalContent:''
    }

    window.onscroll = () => {
      return false;
    }
  }

  componentDidMount(){

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}
    if (nextProps.redirect != undefined && nextProps.redirect == true) {
      returnState.alertModalContent = `Your request is in queue, we will notify you on ${prevState.notification_email} within 30 minutes`;
      returnState.isShowAlertModal = true;
      returnState.showLoader = false;
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      nextProps.exportEmptyData();
    }
    return returnState
  }

  componentDidUpdate = (prevProps, prevState) => {
  }


  handleUpload = (targetName) => {
    const data = new FormData()
    data.append('file', this.state.file, this.state.file.name)
    data.append('upload_type', 'profile')
    let endpoint = config.API_URL + `media/upload-patient-import`;

    axios.post(endpoint, data).then(res => {
      if(res.status === 200){
        let fileColomNames = [];
        res.data.data.field_array.map((obj,idx) => {
          let colomName = {}
          colomName.name = obj;
          colomName.value = '';
          colomName.class = 'setting-select-box';
          let name = obj.replace(/[ `~!@#$%^&*()_|\-=?;:'",.<>\{\}\[\]\\\/]/gi,'')
          name  = name.toLowerCase()
          if(name == 'name' || name == 'firstname' || name == 'lastname' || name == 'email') {
  					colomName.select_label = 'Select';
            colomName.is_required = true;
  				} else {
  					colomName.select_label = 'Do Not Import This Field';
            colomName.is_required = false;
  				}
          fileColomNames.push(colomName);
        })

        this.setState({
          file_name:res.data.data.file_name,
          fileColomNames:fileColomNames,
          fileColomOptions:res.data.data.db_field_array,
          providerList:res.data.data.providers,
          notification_email:res.data.data.notification_email,
          notificationEmailClass:'setting-input-box',
          provider_id:'',
          providerIdClass:'setting-select-box',
          showLoader: false
        });
      } else {
        toast.error(this.state.globalLang[res.data.message]);
        this.setState({showLoader: false});
      }
    }).catch(error => {
      toast.error(this.state.globalLang[error.response.data.message]);
      this.setState({showLoader: false});
    })
  }

  removeUploadedFile = () => {
    this.setState({
      file_name:'',
      file_size:'',
      file_thumbnail:'',
      fileColomNames:[]
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

  handleInputChange = (event) => {
    this.setState({userChanged : true});
    const target = event.target;
    let value= target.value;
    let inputName = target.name;

    if ( target && target.type === 'file' ) {
      const allowedTypes    = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      const allowedExtTypes = ["csv", "xls", "xlsx"];

      let fileType = '';

      if ( target.files && target.files[0] && target.files[0].name ) {
        fileType = target.files[0].name.split('.')[1];
      }

      if ( (target.files && allowedTypes.indexOf(target.files[0].type) > -1) || (allowedExtTypes.indexOf(fileType) > -1) ) {
        this.handleFileChosen(target.files[0], target)
      } else {
        toast.error('This file type is not allowed');
      }
    } else {
      const  index = event.target.dataset.index;
      if(index !== undefined){
        let fileColomNames = this.state.fileColomNames;
        fileColomNames[index]['value'] = value
        this.setState({fileColomNames:fileColomNames});
      } else {
        this.setState({[event.target.name]: value});
      }
    }
  }
  handleSubmit = (event) => {
    event.preventDefault();
    if(this.state.file_name){
      let error = false;
      let formData = {}
      formData.file_name = this.state.file_name
      if (this.state.provider_id === undefined || this.state.provider_id === null || this.state.provider_id === '') {
        this.setState({providerIdClass:'setting-select-box field_error'})
        error = true;
      } else if(this.state.provider_id) {
        this.setState({providerIdClass:'setting-select-box'})
        formData.provider_id = this.state.provider_id
      }

      if (typeof this.state.notification_email === undefined || this.state.notification_email === null || this.state.notification_email.trim() === '' || !validator.isEmail(this.state.notification_email)) {
        this.setState({notificationEmailClass:'setting-input-box field_error'})
        error = true;
      } else if(this.state.notification_email) {
        this.setState({notificationEmailClass:'setting-input-box'})
        formData.notification_email = this.state.notification_email
      }

      let fileColomNames = this.state.fileColomNames;
      let isFirstNameExist = false;
      let isLastNameExist = false;
      let field_array = {}
      fileColomNames.map((obj,idx) => {
        if(obj.value === 'firstname'){
          isFirstNameExist = true;
        } else if(obj.value === 'lastname'){
          isLastNameExist = true;
        }
        if(obj.is_required){
          if (obj.value === undefined || obj.value === null || obj.value === '') {
            obj.class = 'setting-select-box field_error'
            error = true;
          } else if(obj.value) {
            obj.class = 'setting-select-box'
            field_array[obj.name] = obj.value
          }
        } else {
          field_array[obj.name] = obj.value
        }
      })
      this.setState({fileColomNames:fileColomNames})
      formData.field_array = field_array

      if(!isFirstNameExist && !isFirstNameExist){
        error = true;
        toast.error(this.state.globalLang['patient_import_first_last_name_required']);
      }

      if(error){
        return
      }
      this.setState({showLoader:true})
      this.props.clientBulkUpload(formData);
    } else {
      toast.error(this.state.globalLang['file_required']);
    }

  };


  render(){
    let defLogo = (this.state.documentID) ? "/../../../../images/upload.png" : "../../../images/upload.png";

    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <div className="juvly-section full-width">
            <div className="juvly-container">
              <div className="juvly-title m-b-40">{this.state.clientsLang.client_bulk_import}
                <Link to='/clients' className="pull-right"><img src="/images/close.png" /></Link>
              </div>
              <div className="juvly-subtitle">{this.state.globalLang.global_file_upload}</div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.clientsLang.client_upload_excel_or_csv_file}<span className="setting-require">*</span></div>
                    <div className="main-profile-picture static-upload-file">
                      <div className="col-xs-6 no-padding">
                        <div className="file-container file-upload-img">
                        {(this.state.file_name) && <a className="delete-file" onClick={this.removeUploadedFile}></a>}
                          <img src={defLogo} />
                          <span className={(this.state.file_name) ? "file-name file-info" : "file-name-hide no-display"}> {this.state.file_thumbnail}</span>
                          <span className={(this.state.file_name) ? "file-size file-info" : "file-size-hide no-display"}>{this.state.file_size}</span>
                          <div className="upload">{this.state.globalLang.global_upload}
                            <input type="file" className={'image_questionnaire'} name="file" value={''} autoComplete="off" onChange={this.handleInputChange}  />
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="p-text">{this.state.clientsLang.client_bulk_import_allowed_file_types}</p>
                  </div>
                </div>
              </div>
              {(this.state.fileColomNames.length > 0) &&
                <div className="import-field-mapping">
                  <div className="juvly-subtitle">{this.state.clientsLang.client_field_mapping}</div>
                  <div className="row field-mapping-outer">
                    {
                      this.state.fileColomNames.map((obj,idx) => {
                        return (
                          <div key={'fileColomNames-'+idx} className="col-xs-12">
                            <div className="setting-field-outer table">
                              <div className="new-field-label table-cell"><div>{obj.name} {(obj.is_required) && <span className="setting-require">*</span>}</div></div>
                              <div className="setting-input-outer table-cell">
                                <select className={obj.class} name={obj.name} value={obj.value} onChange={this.handleInputChange} data-index={idx} >
                                  <option value="">{obj.select_label}</option>
                                  {
                                    this.state.fileColomOptions.map((OptionObj,optionIdx) => {
                                      return (
                                        <option key={'fileColomOptions-'+idx+'-'+optionIdx} value={OptionObj.key}>{OptionObj.value}</option>
                                      )
                                    })
                                  }
                                </select>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_select_provider} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <select className={this.state.providerIdClass} name='provider_id' value={this.state.provider_id} onChange={this.handleInputChange}>
                            <option value="">{this.state.globalLang.label_select}</option>
                            {
                              this.state.providerList.map((obj,idx) => {
                                return (
                                  <option key={'providerList-'+idx} value={obj.id}>{obj.firstname+' '+obj.lastname}</option>
                                )
                              })
                            }
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_notification_email} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <input type="text" className={this.state.notificationEmailClass} name='notification_email' value={this.state.notification_email} onChange={this.handleInputChange} />
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-12 p-text">{this.state.clientsLang.client_notification_email_msg_content}</div>
                  </div>
                </div>
              }
            </div>
            <div className="footer-static">
              <a className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.globalLang.label_save}</a>
            </div>
            <Loader showLoader={this.state.showLoader} />
            {/* Alert Modal - START */}
            <div className={this.state.isShowAlertModal ? "modalOverlay" : 'no-display' }>
              <div className="small-popup-outer">
                <div className="small-popup-header">
                  <div className="popup-name">{this.state.globalLang.global_success}</div>
                  <Link to='/clients' className="small-cross">×</Link>
                </div>
                <div className="small-popup-content">
                  <div className="juvly-container no-padding-bottom">
                    <div className="row">
                      <div className="col-sm-12 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label alert-modal-content">{this.state.alertModalContent}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="footer-static">
                  <Link to='/clients' className="new-white-btn pull-right" >{this.state.globalLang.global_ok}</Link>
                </div>
              </div>
            </div>
            {/* Alert Modal - END */}
          </div>
        </div>
      </div>
    )
  }
}
function mapStateToProps(state){
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.ClientsReducer.action === "CLIENT_BULK_UPLOAD") {
    if(state.ClientsReducer.data.status != 200) {
      returnState.showLoader = false;
      toast.dismiss()
      toast.error(languageData.global[state.ClientsReducer.data.message]);
    } else {
      returnState.redirect = true;
      returnState.message = state.ClientsReducer.data.message;
    }
  }
 return returnState;
}



function mapDispatchToProps(dispatch){
return bindActionCreators({
  clientBulkUpload:clientBulkUpload,
  exportEmptyData:exportEmptyData
},dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps) (BulkImport);
