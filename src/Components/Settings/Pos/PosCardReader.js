import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { getPosCardReaderData, changePosCardReaderStatus,addPosCardReaderMarchent,addPosCardReaderDevice,deletePosCardReaderDevice, exportEmptyData } from '../../../Actions/Settings/settingsActions.js';
import { numberFormat } from '../../../Utils/services.js';
import { ToastContainer, toast } from "react-toastify";
import { showMonthFormattedDate,capitalizeFirstLetter, toggleBodyScroll } from '../../../Utils/services.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import validator from 'validator';
import Loader from '../../Common/Loader.js'
import PhoneNumber from '../../Common/PhoneNumber.js'

const dateFormatPicker = 'yyyy-MM-dd';
const dateFormatMoment = 'YYYY-MM-DD';

class PosCardReader extends Component {
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
      backAction: '/settings/pos',
      clinicId:0,
      posCardReaderData: {},
      clinic_name: '',
      is_swipe_enabled:false,
      show_countries_status: false,
      defaultCountry:{},
      merchant_info:{},

      isShowAddMerchentModal:false,
      showLoaderAddMerchent:false,
      name:'',
      nameClass:'setting-input-box',
      address:'',
      addressClass:'setting-input-box',
      zip:'',
      zipClass:'setting-input-box',
      email:'',
      emailClass:'setting-input-box',
      city:'',
      cityClass:'setting-input-box',
      contact_number:'',
      contact_numberClass:'setting-input-box',
      contact_numberError:false,
      country:'',
      countryClass:'setting-select-box',
      isShowAddDeviceModal:false,
      showLoaderAddDevice:false,
      serial_number:'',
      serialNumberClass:'setting-input-box',
      isShowAlertModal : false,
      alertModalType : '',
      alertModalContent : '',
      detechDeviceData:{},
      countryList: [],
    }
  }

  componentDidMount() {
    this.setState({ 'showLoader': true })
    let clinicId = this.props.match.params.clinicId;
    if(clinicId) {
      this.setState({clinicId : clinicId});
    } else {
      clinicId = 0
    }
    this.props.getPosCardReaderData(clinicId);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.posCardReaderData !== undefined && nextProps.posCardReaderData !== prevState.posCardReaderData) {
      returnState.posCardReaderData = nextProps.posCardReaderData;
      returnState.is_swipe_enabled = (nextProps.posCardReaderData.is_swipe_enabled) ? true : false;
      returnState.clinic_name = nextProps.posCardReaderData.clinic_name;
      returnState.assignedDeviceList = nextProps.posCardReaderData.assigned_devices;
      returnState.countryList = nextProps.posCardReaderData.countries
      returnState.defaultCountry = nextProps.posCardReaderData.default_country;
      returnState.showLoader = false;
      returnState.isShowAddMerchentModal = false;
      returnState.showLoaderAddMerchent = false;
      returnState.isShowAddDeviceModal = false;
      returnState.showLoaderAddDevice = false;
      returnState.detechDeviceData = {};
      returnState.isShowAlertModal = false;
      returnState.merchant_info = (nextProps.posCardReaderData.merchant_info) ? nextProps.posCardReaderData.merchant_info : {}
      returnState.country = (returnState.merchant_info.country !== undefined) ? returnState.merchant_info.country : ''
      toggleBodyScroll(false)
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      returnState.showLoaderAddMerchent = false;
      returnState.showLoaderAddDevice = false;
      nextProps.exportEmptyData()
    }

    return returnState
  }


  handleInputChange = (event) => {
    this.setState({ userChanged: true})
    const target = event.target;
    let value = (target.type == 'checkbox') ? target.checked : target.value;
    let inputName = target.name;
    if(inputName === 'is_swipe_enabled'){
      if(value){
        this.setState({
          name: (this.state.merchant_info.name !== undefined ) ? this.state.merchant_info.name : '',
          nameClass:'setting-input-box',
          address:(this.state.merchant_info.address !== undefined ) ? this.state.merchant_info.address : '',
          addressClass:'setting-input-box',
          zip:(this.state.merchant_info.zip !== undefined ) ? this.state.merchant_info.zip : '',
          zipClass:'setting-input-box',
          email:(this.state.merchant_info.email !== undefined ) ? this.state.merchant_info.email : '',
          emailClass:'setting-input-box',
          city:(this.state.merchant_info.city !== undefined ) ? this.state.merchant_info.city : '',
          cityClass:'setting-input-box',
          contact_number:(this.state.merchant_info.contact_number !== undefined ) ? this.state.merchant_info.contact_number : '',
          contactNumberClass:'setting-input-box',
          country:(this.state.country !== undefined ) ? this.state.country  : '',
          countryClass:'setting-select-box',
          isShowAddMerchentModal:true
        })
        toggleBodyScroll(true)
      } else {
        this.setState({isShowAlertModal:true,alertModalContent:this.state.settingsLang.pos_card_reader_delete_alert_msg,alertModalType:'change_card_reader_status'})
      }
    } else {
      this.setState({[inputName]: value})
    }
  }



  addPosCardReaderMarchent = (event) => {
    let targetName = event.target.name;
    let error = false;
    if (typeof this.state.name === undefined || this.state.name === null || this.state.name === '' ) {
      this.setState({nameClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.name) {
      this.setState({nameClass:'setting-input-box'})
    }
    if (typeof this.state.email === undefined || this.state.email === null || this.state.email === '' || !validator.isEmail(this.state.email)) {
      this.setState({emailClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.email) {
      this.setState({emailClass:'setting-input-box'})
    }
    if (typeof this.state.address === undefined || this.state.address === null || this.state.address === '') {
      this.setState({addressClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.address) {
      this.setState({addressClass:'setting-input-box'})
    }
    if (typeof this.state.city === undefined || this.state.city === null || this.state.city === '') {
      this.setState({cityClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.city) {
      this.setState({cityClass:'setting-input-box'})
    }
    if (typeof this.state.zip === undefined || this.state.zip === null || this.state.zip === '') {
      this.setState({zipClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.zip) {
      this.setState({zipClass:'setting-input-box'})
    }
    if (typeof this.state.country === undefined || this.state.country === null || this.state.country === '') {
      this.setState({countryClass:'setting-select-box field_error'})
      error = true;
    } else if(this.state.country) {
      this.setState({countryClass:'setting-select-box'})
    }
    if (this.state.contact_number === undefined || this.state.contact_number === null || this.state.contact_number === '' ||  this.state.contact_numberError === true) {
      error = true;
      this.setState({contact_numberClass: 'setting-input-box setting-input-box-invalid'})
    } else {
        this.setState({contact_numberClass: 'setting-input-box'})
    }

    if (error) {
      return
    }
    let formData = {
      name : this.state.name,
      email:this.state.email,
      address:this.state.address,
      city:this.state.city,
      zip:this.state.zip,
      contact_number:this.state.contact_number,
      country : this.state.country,
      clinic_id:this.state.clinicId,
    }
    this.setState({ showLoaderAddMerchent:true });
    this.props.addPosCardReaderMarchent(formData)
  }

  dismissAddMerchentModal = () => {
    toggleBodyScroll(false)
    this.setState({ isShowAddMerchentModal:false });
  }

  addPosCardReaderDevice = (event) => {
    let targetName = event.target.name;
    let error = false;
    if (typeof this.state.serial_number === undefined || this.state.serial_number === null || this.state.serial_number === '') {
      this.setState({serialNumberClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.serial_number) {
      this.setState({serialNumberClass:'setting-input-box'})
    }
    if (error) {
      return
    }
    let formData = {
      serial_number : this.state.serial_number,
      clinic_id:this.state.clinicId,
    }
    this.setState({ showLoaderAddDevice:true });
    this.props.addPosCardReaderDevice(formData)
  }

  handleAddDeviceModal = () => {
    if(!this.state.isShowAddDeviceModal){
        this.setState({
          serial_number:'',
          serialNumberClass:'setting-input-box'
        });
    }
    toggleBodyScroll(!this.state.isShowAddDeviceModal)
    this.setState({ isShowAddDeviceModal:!this.state.isShowAddDeviceModal });
  }

  showDetachCardReaderModal = (data) => {
    let detechDeviceData = {
      reader_identifier : data.reader_identifier,
      serial_number : data.serial_number,
      merchant_identifier : this.state.merchant_info.merchant_identifier
    }
    this.setState({detechDeviceData:detechDeviceData, isShowAlertModal:true,alertModalContent:this.state.settingsLang.pos_card_reader_detach_device_alert_msg,alertModalType:'detach_card_reader'})
    toggleBodyScroll(true)
  }

  dismissAlertModal = () => {
    this.setState({detechDeviceData:{}, isShowAlertModal:false,alertModalContent:'',alertModalContent:''})
    toggleBodyScroll(false);
  }

  deletePosCardReaderDevice = () => {
    let formData = {
      clinic_id:this.state.clinicId,
      reader_identifier : this.state.detechDeviceData.reader_identifier,
      serial_number : this.state.detechDeviceData.serial_number,
      merchant_identifier : this.state.detechDeviceData.merchant_identifier
    }
    this.setState({ showLoader:true});
    this.props.deletePosCardReaderDevice(formData)
    this.dismissAlertModal();
    toggleBodyScroll(false);
  }

  changePosCardReaderStatus= () => {
    this.setState({ showLoader:true});
    this.props.changePosCardReaderStatus({clinic_id:this.state.clinicId})
    this.dismissAlertModal();
    toggleBodyScroll(false);
  }

  onPhoneNumberChange = (value) => {
    this.setState(value)
  }

  render() {
    let defLogo = "/../../../../../images/upload.png";
    return (
      <div id="content">
        <div className="wide-popup">
          <div className="modal-blue-header">
            {(this.state.showLoader == false) && <Link to={this.state.backAction} className="popup-cross">×</Link>}
            <span className="popup-blue-name">{(this.state.clinic_name) ? this.state.clinic_name+' - ' : null} {this.state.settingsLang.pos_card_reader}</span>
          </div>
          <div className="wide-popup-wrapper time-line no-table m-t-50">
              <div className="card-reader-outer">
                <span className="setting-custom-switch pull-right pos-enable-disable">
                  <span id="enabled-text">{(this.state.is_swipe_enabled) ? this.state.settingsLang.twoFA_enabled : this.state.settingsLang.twoFA_disabled} {this.state.settingsLang.pos_card_present_swipe_card}</span>
                  <label className="setting-switch pull-right">
                    <input type="checkbox" name="is_swipe_enabled" checked={(this.state.is_swipe_enabled) ? 'checked' : false} onChange={this.handleInputChange} className=" setting-custom-switch-input"  />
                    <span className="setting-slider colored-slider" />
                  </label>
                </span>
                {(this.state.is_swipe_enabled) &&
                <div>
                <div className="card-reader-info">
                  <div className="row">
                    <div className="col-sm-3 card-reader-label">{this.state.settingsLang.pos_merchant_identifier}</div>
                    <div className="col-sm-9 card-reader-data">{(this.state.merchant_info.merchant_identifier !== undefined ) ? this.state.merchant_info.merchant_identifier  : ''}</div>
                  </div>
                  <div className="row">
                    <div className="col-sm-3 card-reader-label">{this.state.settingsLang.pos_connected_on}</div>
                    <div className="col-sm-9 card-reader-data">{(this.state.merchant_info.created_at !== undefined ) ? this.state.merchant_info.created_at  : ''}</div>
                  </div>
                </div>
                <div className="juvly-subtitle m-t-20 m-b-20">{this.state.settingsLang.pos_card_readers} <a href="javascript:void(0);" className="new-blue-btn sm-btn pull-right" onClick={this.handleAddDeviceModal}>{this.state.settingsLang.pos_attach_Card_reader}</a></div>
                <div className="table-responsive">
                  <table className="table-updated setting-table no-hover table-min-width">
                    <thead className="table-updated-thead">
                      <tr>
                        <th className="col-xs-3 table-updated-th">{this.state.settingsLang.pos_model}</th>
                        <th className="col-xs-3 table-updated-th">{this.state.settingsLang.pos_serial_number}</th>
                        <th className="col-xs-3 table-updated-th">{this.state.globalLang.label_status}</th>
                        <th className="col-xs-3 table-updated-th">{this.state.globalLang.label_action}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(this.state.assignedDeviceList.length > 0) ?
                        this.state.assignedDeviceList.map((obj,idx) =>{
                            return (
                              <tr key={'assignedDeviceList-'+idx}>
                                <th className="col-xs-3 table-updated-th">{obj.model}</th>
                                <th className="col-xs-3 table-updated-th">{obj.serial_number}</th>
                                <th className="col-xs-3 table-updated-th">{obj.status}</th>
                                <th className="col-xs-3 table-updated-th">
                                  <a href="javascript:void(0);" className="easy-link" onClick={this.showDetachCardReaderModal.bind(this,obj)}>{this.state.settingsLang.pos_detach_card_reader}</a>
                                </th>
                              </tr>
                            )
                        })
                      :
                      <tr className="table-updated-tr">
                        <td className="table-updated-td text-center" colSpan={4}>
                          <div className="no-record">{this.state.globalLang.sorry_no_record_found}</div>
                        </td>
                      </tr>
                    }
                    </tbody>
                  </table>
                </div>
                <p className="p-text card-reader-note"><b>{this.state.globalLang.label_note}:</b>{this.state.settingsLang.pos_card_reader_attached_msg}</p>
              </div>
              }
            </div>
          </div>
          <Loader showLoader={this.state.showLoader} />
        </div>
        {/* Add Merchent  Modal - START  */}
        <div className={(this.state.isShowAddMerchentModal) ? "modalOverlay" : 'no-display'}>
          <div className="small-popup-outer no-popup-scroll">
            <div className="small-popup-header">
              <div className="popup-name">{this.state.settingsLang.pos_enable_card_swiping}</div>
              <a href="javascript:void(0);" onClick={this.dismissAddMerchentModal} className="small-cross">×</a>
            </div>
            <div className="small-popup-content">
              <div className="juvly-container no-padding-bottom">
                <div className="row">
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.pos_name} <span className="required">*</span></div>
                      <div className="setting-input-outer">
                        <input name='name' value={this.state.name} onChange={this.handleInputChange} className={this.state.nameClass} type="text" autoComplete="off" placeholder={this.state.settingsLang.pos_enter_name} />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.pos_email} <span className="required">*</span></div>
                      <div className="setting-input-outer">
                        <input name='email' value={this.state.email} onChange={this.handleInputChange} className={this.state.emailClass} type="text" autoComplete="off" placeholder={this.state.settingsLang.pos_enter_email} />
                      </div>
                    </div>
                  </div>
                  <div className="col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.pos_address} <span className="required">*</span></div>
                      <div className="setting-input-outer">
                        <input name='address' value={this.state.address} onChange={this.handleInputChange} className={this.state.addressClass} type="text" autoComplete="off" placeholder={this.state.settingsLang.pos_enter_address} />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.pos_zip_code} <span className="required">*</span></div>
                      <div className="setting-input-outer">
                        <input name='zip' value={this.state.zip} onChange={this.handleInputChange} className={this.state.zipClass} type="text" autoComplete="off" placeholder={this.state.settingsLang.pos_enter_zip_code} />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.pos_city} <span className="required">*</span></div>
                      <div className="setting-input-outer">
                        <input name='city' value={this.state.city} onChange={this.handleInputChange} className={this.state.cityClass} type="text" autoComplete="off" placeholder={this.state.settingsLang.pos_enter_city} />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.pos_phone} <span className="required">*</span></div>
                      <div className="setting-input-outer">
                        <PhoneNumber
                          name={'contact_number'}
                          value={this.state.contact_number}
                          class={this.state.contact_numberClass}
                          onPhoneNumberChange={this.onPhoneNumberChange}
                          isRender={this.state.isShowAddMerchentModal}
                          placeholder={this.state.settingsLang.pos_enter_contact_number}
                          separateDialCode={`true`}
                          />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.globalLang.label_country} <span className="required">*</span></div>
                        <select name='country' value={this.state.country} onChange={this.handleInputChange} className={this.state.countryClass}  >
                          <option value="">Select Country</option>
                          {(this.state.countryList !== undefined && this.state.countryList.length > 0) &&
                            this.state.countryList.map((obj,idx) => {
                              return (
                                <option key={'countryList-'+idx} value={obj.country_code}>{obj.country_name}</option>
                              )
                            })
                          }
                        </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-static">
              <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.addPosCardReaderMarchent}>{this.state.globalLang.label_save}</a>
              <a href="javascript:void(0);" onClick={this.dismissAddMerchentModal} className="new-white-btn pull-right">{this.state.globalLang.label_cancel}</a>
            </div>
            <Loader showLoader={this.state.showLoaderAddMerchent} />
          </div>
        </div>
        {/* Add Merchent  Modal - END  */}
        {/* Add Device Modal - START  */}
        <div className={(this.state.isShowAddDeviceModal) ? "modalOverlay" : 'no-display'}>
          <div className="small-popup-outer">
            <div className="small-popup-header">
              <div className="popup-name">{this.state.settingsLang.pos_attach_Card_reader}</div>
              <a href="javascript:void(0);" onClick={this.handleAddDeviceModal} className="small-cross">×</a>
            </div>
            <div className="small-popup-content">
              <div className="juvly-container no-padding-bottom">
                <div className="row">
                  <div className="col-sm-12 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.settingsLang.pos_serial_number} <span className="required">*</span></div>
                      <div className="setting-input-outer">
                        <input name='serial_number' value={this.state.serial_number} onChange={this.handleInputChange} className={this.state.serialNumberClass} type="text" autoComplete="off" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-static">
              <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.addPosCardReaderDevice}>{this.state.globalLang.label_save}</a>
              <a href="javascript:void(0);" onClick={this.handleAddDeviceModal} className="new-white-btn pull-right">{this.state.globalLang.label_cancel}</a>
            </div>
            <Loader showLoader={this.state.showLoaderAddDevice} />
          </div>
        </div>
        {/* Add Device Modal - END  */}
        {/* Alert Modal - START */}
        <div className={this.state.isShowAlertModal ? "modalOverlay" : 'no-display' }>
          <div className="small-popup-outer">
            <div className="small-popup-header">
              <div className="popup-name">{this.state.globalLang.label_alert}</div>
              <a href="javascript:void(0);" className="small-cross" onClick={this.dismissAlertModal} >×</a>
            </div>
            <div className="small-popup-content">
              <div className="juvly-container no-padding-bottom">
                <div className="row">
                  <div className="col-sm-12 col-xs-12">
                    <div className="setting-field-outer">
                      {(this.state.alertModalType != 'warning') &&
                        <div className="new-field-label alert-modal-title">{this.state.globalLang.are_you_sure}</div>
                      }
                      <div className="new-field-label alert-modal-content">{this.state.alertModalContent}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-static">
              <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.dismissAlertModal}>{this.state.globalLang.label_cancel}</a>
              {(this.state.alertModalType ==='detach_card_reader') &&
                <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.deletePosCardReaderDevice} >{this.state.settingsLang.pos_yes_disconnect_it}</a>
              }
              {(this.state.alertModalType ==='change_card_reader_status') &&
                <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.changePosCardReaderStatus} >{this.state.settingsLang.yes_disable_it}</a>
              }
            </div>
          </div>
        </div>
        {/* Alert Modal - END */}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SettingReducer.action === "GET_POS_CARD_READER_DATA") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.posCardReaderData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "CHANGE_POS_CARD_READER_STATUS") {
    if (state.SettingReducer.data.status != 200) {
      returnState.message = languageData.global[state.SettingReducer.data.message]
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.posCardReaderData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "ADD_POS_CARD_READER_MERCHENT") {
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.posCardReaderData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "ADD_POS_CARD_READER_DEVICE") {
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.posCardReaderData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "DELETE_POS_CARD_READER_DEVICE") {
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.posCardReaderData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "EMPTY_DATA") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getPosCardReaderData: getPosCardReaderData,
    changePosCardReaderStatus: changePosCardReaderStatus,
    addPosCardReaderMarchent:addPosCardReaderMarchent,
    addPosCardReaderDevice:addPosCardReaderDevice,
    deletePosCardReaderDevice:deletePosCardReaderDevice,
    exportEmptyData:exportEmptyData
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PosCardReader));
