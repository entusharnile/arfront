import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { getPosDashboardVerification, savePosDashboardVerification } from '../../../../Actions/Settings/settingsActions.js';
import { numberFormat } from '../../../../Utils/services.js';
import { ToastContainer, toast } from "react-toastify";
import { showMonthFormattedDate,formatBytes } from '../../../../Utils/services.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import axios from 'axios';
import config from '../../../../config';
import Loader from '../../../Common/Loader.js'

const dateFormatPicker = 'yyyy-MM-dd';
const dateFormatMoment = 'YYYY-MM-DD';

class PosDashboardVerification extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    return {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      showLoader: false,
      backAction: '/settings/pos-dashboard',
      posVerificationData: {},
      verificationData: [],
      userChanged: false,
      file:{}
    };
  }

  componentDidMount() {
    this.setState({ 'showLoader': true })
    this.props.getPosDashboardVerification(this.state.invoiceId);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.posVerificationData !== undefined && nextProps.posVerificationData !== prevState.posVerificationData) {
      returnState.posVerificationData = nextProps.posVerificationData;
      if (!prevState.userChanged) {
        let verificationData = [];
        returnState.posVerificationData.map((obj, idx) => {
          let data = {};
          data = obj
          obj.fields.map((fieldObj, fieldIdx) => {
            data['fields'][fieldIdx]['value'] = (fieldObj.field_name == 'dob') ? new Date(moment().subtract(13, "years").toDate()) : '';
            data['fields'][fieldIdx]['error'] = false;
            if(fieldObj.field_name == 'legal_entity.verification.document'){
              data['fields'][fieldIdx]['type'] = 'file';
              data['fields'][fieldIdx]['className'] = 'image_questionnaire';
            } else {
              data['fields'][fieldIdx]['type'] = 'text';
              data['fields'][fieldIdx]['className'] = 'setting-input-box dynamic-fields';
            }

          });
          verificationData.push(data);
        })
        returnState.verificationData = verificationData;
      }
      returnState.showLoader = false;
    } else if (nextProps.redirect != undefined && nextProps.redirect == true) {
      if(nextProps.status){
        toast.success(nextProps.message)
        nextProps.history.push(prevState.backAction);
      } else {
        toast.error(nextProps.message)
        nextProps.history.push(prevState.backAction);
      }
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
    }

    return returnState
  }


  handleInputChange = (event) => {
    this.setState({ userChanged: true})
    const target = event.target;
    let value = target.value;
    let inputName = target.name;
    const accountIndex = event.target.dataset.accountIndex;
    const fieldIndex = event.target.dataset.fieldIndex;
    let verificationData = this.state.verificationData;
    if(target && target.type == 'file'){
      const allowedTypes  = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/gif","image/GIF"];

      if ( target.files && allowedTypes.indexOf(target.files[0].type) > -1 ) {
        this.handleFileChosen(target.files[0], target)
      } else {
        toast.error('This file type is not allowed');
      }
    } else{
      verificationData[accountIndex]['fields'][fieldIndex]['value'] = value;
    }
    this.setState({ verificationData: verificationData })
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
    const data = new FormData()
    data.append('file', this.state.file.file, this.state.file.file.name)
    data.append('stripe_user_id', 'acct_1DvPJ2H0tOYYnZRh')
    let endpoint = config.API_URL + `pos-stripe-image-upload`;

    axios.post(endpoint, data).then(res => {
      if(res.data.status == 200){
        const target = this.state.file.target;
        const accountIndex = target.dataset.accountIndex;
        const fieldIndex = target.dataset.fieldIndex;
        let verificationData = this.state.verificationData;
        verificationData[accountIndex]['fields'][fieldIndex]['value'] = res.data.data;
        verificationData[accountIndex]['fields'][fieldIndex]['error'] = false
        this.setState({verificationData:verificationData, file:{}});
      } else {
        toast.error(this.state.globalLang[res.data.message]);
      }
      this.setState({showLoader: false});
    }).catch(error => {
      toast.error(this.state.globalLang[error.response.data.message]);
      this.setState({showLoader: false});
    })
  }


  handleSubmit = (event) => {
    let targetName = event.target.name;
    let error = false;
    let verificationData = this.state.verificationData;
    verificationData.map((obj, idx) => {
      obj.fields.map((fieldObj, fieldIdx) => {
        if (typeof fieldObj.value === undefined || fieldObj.value === null || fieldObj.value === '') {
          verificationData[idx]['fields'][fieldIdx]['className'] = (fieldObj.type == 'file') ? 'image_questionnaire': 'setting-input-box field_error';
          verificationData[idx]['fields'][fieldIdx]['error'] = true;
          error = true;
        } else if (fieldObj.value) {
          verificationData[idx]['fields'][fieldIdx]['className'] = (fieldObj.type == 'file') ? 'image_questionnaire':'setting-input-box';
          verificationData[idx]['fields'][fieldIdx]['error'] = false;
        }
      });
    })
    this.setState({ verificationData: verificationData, 'userChanged': true });
    if (error) {
      return
    }
    this.setState({ showLoader:true });
    this.props.savePosDashboardVerification({verificaion_fields_data:verificationData})
  }

  onChangeDatePicker = (accountIndex,fieldIndex,date) => {
    let verificationData = this.state.verificationData;
    verificationData[accountIndex]['fields'][fieldIndex]['value'] = date;
    this.setState({ userChanged: true, verificationData: verificationData })
  }


  render() {
    let defLogo = "/../../../../../images/upload.png";
    return (
      <div id="content">
        <div className="wide-popup">
          <div className="modal-blue-header">
            {(this.state.showLoader == false) && <Link to={this.state.backAction} className="popup-cross">×</Link>}
            <span className="popup-blue-name">{this.state.settingsLang.pos_verification_page_title}</span>
          </div>

          <div className="wide-popup-wrapper time-line">
            {(this.state.verificationData.length > 0) &&
              this.state.verificationData.map((obj, idx) => {
                return (
                  <div className="row" key={'verificationData-' + idx}>
                    <div className="juvly-subtitle m-b-20">{obj.clinic_name}</div>
                    {obj.fields.map((fieldObj, fieldIdx) => {
                      return (
                        <div className="setting-field-outer" key={'verificationData-field-' + idx + '-' + fieldIdx}>
                          <div className="new-field-label">{fieldObj.place_holder}<span className="setting-require">*</span></div>
                          <div className="setting-input-outer">
                            {(fieldObj.type == 'file') ?
                              <div className="main-profile-picture pos-doc-verification">
                                <div className="file-container file-upload-img">
                                  <img src={defLogo} />
                                  <span className="file-name-hide no-display" />
                                  <span className="file-size-hide no-display" />
                                  <div className={fieldObj.error ? 'upload error-color' : 'upload'} >{(fieldObj.value == '') ? 'Upload' : 'Change'}
                                    <input type="file" className={fieldObj.className} name={fieldObj.field_name} onChange={this.handleInputChange} data-account-index={idx} data-field-index={fieldIdx} />
                                  </div>
                                </div>
                              </div>
                              :
                              (fieldObj.field_name == 'dob') ?
                                <DatePicker
                                  className={fieldObj.className}
                                  selected = {(fieldObj.value) ? fieldObj.value: null}
                                  dateFormat={dateFormatPicker}
                                  onChange={this.onChangeDatePicker.bind(this, idx,fieldIdx)}
                                  maxDate={new Date(moment().subtract(13, "years").toDate())}
                                  minDate={new Date(moment().subtract(100, "years").toDate())}
                                  showMonthDropdown
                                  showYearDropdown
                                  dropdownMode="select"
                                  ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                                  autoComplete='off'
                                  name={fieldObj.field_name}
                                  data-account-index={idx}
                                  data-field-index={fieldIdx}
                                />
                              :
                                <input autoComplete='off' type="text" className={fieldObj.className} name={fieldObj.field_name} value={fieldObj.value} placeholder={fieldObj.place_holder} onChange={this.handleInputChange} data-account-index={idx} data-field-index={fieldIdx} />
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })
            }
            <div className="row">
              {(this.state.verificationData.length > 0) &&
                <button type="button" className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.globalLang.label_save}</button>
              }
            </div>
          </div>
          <Loader showLoader={this.state.showLoader} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SettingReducer.action === "GET_POS_DASHBOARD_VERIFICATION") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.posVerificationData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "SAVE_POS_DASHBOARD_VERIFICATION") {
    if (state.SettingReducer.data.status != 200) {
      returnState.message = languageData.global[state.SettingReducer.data.message]
      returnState.redirect = true
      returnState.status = false
    } else {
      returnState.message = languageData.global[state.SettingReducer.data.message]
      returnState.redirect = true
      returnState.status = true
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getPosDashboardVerification: getPosDashboardVerification,
    savePosDashboardVerification: savePosDashboardVerification
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PosDashboardVerification));
