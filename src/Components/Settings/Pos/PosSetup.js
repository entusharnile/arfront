import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { getPosSetupData, getPosAdditionalSetupData,savePosSetupData,exportEmptyData } from '../../../Actions/Settings/settingsActions.js';
import { numberFormat } from '../../../Utils/services.js';
import { ToastContainer, toast } from "react-toastify";
import { showMonthFormattedDate,capitalizeFirstLetter,showFormattedDate,dateFormatPicker } from '../../../Utils/services.js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import validator from 'validator';

//const dateFormatPicker = 'yyyy-MM-dd';
const dateFormatMoment = 'YYYY-MM-DD';

class PosSetup extends Component {
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
      posSetupData: {},
      posAdditionalSetupData: {},
      verificationData:[],
      userChanged: false,
      userChangedAdditional: false,
      type:'',
      country:'',
      typeClass:'setting-select-box',
      countryClass:'setting-select-box',
      typeList:[],
      countryList:[],
      currencyList:[],
      show_countries_status:true,
      defaultCountry: 'US',
      defaultCurrency:'USD',
      countryCurrencyLabel:'',
      clinicId:0,

    }
  }

  componentDidMount() {
    this.setState({ 'showLoader': true })
    this.props.getPosSetupData();
    const clinicId = this.props.match.params.clinicId;
    if(clinicId) {
      this.setState({clinicId : clinicId});
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.posSetupData !== undefined && nextProps.posSetupData !== prevState.posSetupData) {
      returnState.posSetupData = nextProps.posSetupData;
      returnState.show_countries_status = returnState.posSetupData.show_countries_status;
      returnState.defaultCountry = returnState.posSetupData.default_country;
      returnState.defaultCurrency = returnState.posSetupData.default_currency;
      returnState.countryList = returnState.posSetupData.stripe_countries;
      returnState.typeList = returnState.posSetupData.business_type;
      if(!returnState.show_countries_status){
        returnState.country = returnState.defaultCountry;
        let countryName = (returnState.countryList.length > 0) ? returnState.countryList.find(x => x.country_code == returnState.defaultCountry) : null
        if(countryName){
          countryName = countryName.country_name
        }
        returnState.countryCurrencyLabel = capitalizeFirstLetter(countryName) + ` (${returnState.defaultCurrency.toUpperCase()})`;
      }
      returnState.showLoader = false;
    } else if (nextProps.posAdditionalSetupData !== undefined && nextProps.posAdditionalSetupData !== prevState.posAdditionalSetupData) {
      returnState.posAdditionalSetupData = nextProps.posAdditionalSetupData;
      returnState.currencyList = returnState.posAdditionalSetupData.currencies;
      returnState.defaultCurrency = returnState.posAdditionalSetupData.default_currency;
      //if (!prevState.userChangedAdditional) {
        let verificationData = [];
        returnState.posAdditionalSetupData.verification_fields.map((fieldObj, fieldIdx) => {
          let data = {};
          data = fieldObj
          data['value'] = (fieldObj.field_name == 'dob') ? new Date(moment().subtract(13, "years").toDate()) : '';
          data['error'] = false;
          if(fieldObj.field_name == 'legal_entity.verification.document'){
            data['type'] = 'file';
            data['className'] = 'image_questionnaire';
          } else {
            data['type'] = 'text';
            data['className'] = 'setting-input-box dynamic-fields';
          }
          verificationData.push(data);
        })
        returnState.verificationData = verificationData;

      returnState.showLoader = false;
    } else if (nextProps.redirect != undefined && nextProps.redirect == true) {
      if(nextProps.status){
        toast.success(nextProps.message)
        nextProps.history.push(prevState.backAction);
      } else {
        toast.error(nextProps.message, {
          onClose: () => {
            nextProps.history.push(prevState.backAction);
          }
        });
      }
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      nextProps.exportEmptyData()
    }

    return returnState
  }

  componentDidUpdate(){
    const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
    if(datePicker1){
      datePicker1.childNodes[0].setAttribute("readOnly",true);
    }
  }


  handleInputChange = (event) => {
    this.setState({ userChanged: true})
    const target = event.target;
    let value = target.value;
    let inputName = target.name;

    const fieldIndex = event.target.dataset.fieldIndex;
    if(fieldIndex >= 0){
      let verificationData = this.state.verificationData;
      verificationData[fieldIndex]['value'] = value;
      this.setState({ verificationData: verificationData })
    } else {
      this.setState({[inputName]: value}, () => {
        if(inputName == 'type' || inputName == 'country'){
          if(this.state.type != null && this.state.type != '' && this.state.country != null && this.state.country != ''){
            this.setState({ 'showLoader': true })
            this.props.getPosAdditionalSetupData({type:this.state.type,country:this.state.country})
          }
        }
      })
    }
  }



  handleSubmit = (event) => {
    let targetName = event.target.name;
    let error = false;
    if (typeof this.state.type === undefined || this.state.type === null || this.state.type === '') {
      this.setState({typeClass:'setting-select-box field_error'})
      error = true;
    } else if(this.state.type) {
      this.setState({typeClass:'setting-select-box'})
    }
    if (typeof this.state.country === undefined || this.state.country === null || this.state.country === '') {
      this.setState({countryClass:'setting-select-box field_error'})
      error = true;
    } else if(this.state.country) {
      this.setState({countryClass:'setting-select-box'})
    }
    let verificationData = this.state.verificationData;
    if(verificationData.length > 0){
      verificationData.map((fieldObj, fieldIdx) => {
        if (fieldObj.value === undefined || fieldObj.value === null || fieldObj.value === '') {
          verificationData[fieldIdx]['className'] = (fieldObj.type == 'file') ? 'image_questionnaire': 'setting-input-box field_error';
          verificationData[fieldIdx]['error'] = true;
          error = true;
        } else if (fieldObj.value) {
          if(fieldObj.field_name === 'legal_entity.first_name' && !validator.isAlpha(fieldObj.value)){
            verificationData[fieldIdx]['className'] = 'setting-input-box field_error';
            verificationData[fieldIdx]['error'] = true;
            error = true;
          } else if(fieldObj.field_name === 'legal_entity.last_name' && !validator.isAlpha(fieldObj.value)){
            verificationData[fieldIdx]['className'] = 'setting-input-box field_error';
            verificationData[fieldIdx]['error'] = true;
            error = true;
          } else if(fieldObj.field_name === 'email' && !validator.isEmail(fieldObj.value)){
            verificationData[fieldIdx]['className'] = 'setting-input-box field_error';
            verificationData[fieldIdx]['error'] = true;
            error = true;
          } else {
            verificationData[fieldIdx]['className'] = (fieldObj.type == 'file') ? 'image_questionnaire':'setting-input-box';
            verificationData[fieldIdx]['error'] = false;
          }
        }
      })
      this.setState({ verificationData: verificationData, 'userChanged': true });
    } else {
      error = true;
    }
    if (error) {
      return
    }
    let formData = {
      verificaion_fields_data : verificationData,
      type:this.state.type,
      country:this.state.country,
      currency:this.state.defaultCurrency,
      clinic_id:this.state.clinicId,
    }
    this.setState({ showLoader:true });
    this.props.savePosSetupData(formData)
  }

  onChangeDatePicker = (fieldIndex,date) => {
    if(fieldIndex >= 0){
      let verificationData = this.state.verificationData;
      verificationData[fieldIndex]['value'] = date;
      this.setState({ verificationData: verificationData })
    }
  }


  render() {
    let defLogo = "/../../../../../images/upload.png";

    if(this.state.verificationData.length > 0){
        this.state.verificationData.map((fieldObj, fieldIdx) => {
          if(fieldObj.field_name == 'dob'){
            const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
            if(datePicker1){
              //datePicker1.childNodes[0].setAttribute("readOnly",true);
            }
          }
      })
    }

    return (
      <div id="content">
        <div className="wide-popup">
          <div className="modal-blue-header">
            {(this.state.showLoader == false) && <Link to={this.state.backAction} className="popup-cross">×</Link>}
            <span className="popup-blue-name">{this.state.settingsLang.pos_add_pos_account_details}</span>
          </div>

          <div className="wide-popup-wrapper time-line">
            <div className="row">
              <div className="col-sm-6">
                <div className="setting-field-outer">
                  <div className="new-field-label">{this.state.settingsLang.pos_account_type}<span className="setting-require">*</span></div>
                  <div className="setting-input-outer">
                    <select autoComplete='off' className="setting-select-box" name="type" value={this.state.type}  onChange={this.handleInputChange}  >
                      <option value="">{this.state.settingsLang.pos_select_account_type}</option>
                      {this.state.typeList.map((obj,idx)=>{
                        return (
                          <option key={'typeList-'+idx} value={obj.value}>{obj.label}</option>
                        )
                      })}
                    </select>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="setting-field-outer">
                  <div className="new-field-label">{this.state.globalLang.label_country}<span className="setting-require">*</span></div>
                  <div className="setting-input-outer">
                    {(this.state.show_countries_status) ?
                      <select autoComplete='off' className="setting-select-box" name="country" value={this.state.country}  onChange={this.handleInputChange}  >
                        <option value="">{this.state.globalLang.signup_select_country}</option>
                        {this.state.countryList.map((obj,idx)=>{
                          return (
                            <option key={'countryList-'+idx} value={obj.country_code}>{obj.country_name}</option>
                          )
                        })}
                      </select>
                      :
                      <input autoComplete='off' className="setting-input-box" name="country_currency_label" readOnly="readOnly" value={this.state.countryCurrencyLabel}  onChange={this.handleInputChange} />
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              {(this.state.verificationData.length > 0) &&
                this.state.verificationData.map((fieldObj, fieldIdx) => {
                  return (
                    <div key={'verificationData-'+fieldIdx} className="col-sm-6">
                      <div className="setting-field-outer" key={'verificationData-field-' + fieldIdx}>
                        <div className="new-field-label">{fieldObj.place_holder}<span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          {(fieldObj.type == 'file') ?
                            <div className="main-profile-picture pos-doc-verification">
                              <div className="file-container file-upload-img">
                                <img src={defLogo} />
                                <span className="file-name-hide no-display" />
                                <span className="file-size-hide no-display" />
                                <div className={fieldObj.error ? 'upload error-color' : 'upload'} >{(fieldObj.value == '') ? 'Upload' : 'Change'}
                                  <input type="file" className={fieldObj.className} name={fieldObj.field_name} onChange={this.handleInputChange} data-field-index={fieldIdx} />
                                </div>
                              </div>
                            </div>
                            :
                            (fieldObj.field_name == 'dob') ?
                              <DatePicker
                                className={fieldObj.className}
                                selected = {(fieldObj.value) ? fieldObj.value: null}
                                dateFormat={dateFormatPicker()}
                                placeholderText={dateFormatPicker().toLowerCase()}
                                onChange={this.onChangeDatePicker.bind(this,fieldIdx)}
                                maxDate={new Date(moment().subtract(13, "years").toDate())}
                                minDate={new Date(moment().subtract(100, "years").toDate())}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                autoComplete='off'
                                name={fieldObj.field_name}
                                data-field-index={fieldIdx}
                              />
                            :
                              <input autoComplete='off' type="text" className={fieldObj.className} name={fieldObj.field_name} value={fieldObj.value} placeholder={fieldObj.place_holder} onChange={this.handleInputChange} data-field-index={fieldIdx} />
                          }
                        </div>
                      </div>
                    </div>
                  )
                })
              }
              {(this.state.verificationData.length > 0 && this.state.show_countries_status == true) &&
                <div className="col-sm-6">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.settingsLang.setting_currency}<span className="setting-require">*</span></div>
                    <div className="setting-input-outer">
                      <select autoComplete='off' className="setting-select-box" name="defaultCurrency" value={this.state.defaultCurrency}  onChange={this.handleInputChange}  >
                        {this.state.currencyList.map((obj,idx)=>{
                          return (
                            <option key={'currencyList-'+idx} value={obj.value}>{obj.label}</option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              }
            </div>
            <div className="row">
              {(this.state.verificationData.length > 0) &&
                <button type="button" className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.globalLang.label_save}</button>
              }
            </div>
          </div>

          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
            <div className="loader-outer">
              <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
              <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SettingReducer.action === "GET_POS_SETUP_DATA") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.posSetupData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "GET_POS_ADDITIONAL_SETUP_DATA") {
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false
    } else {
      returnState.posAdditionalSetupData = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "SAVE_POS_SETUP_DATA") {
    if (state.SettingReducer.data.status != 200) {
      returnState.message = languageData.global[state.SettingReducer.data.message]
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
        returnState.showLoader = false
      } else {
        returnState.message = languageData.global[state.SettingReducer.data.message]
        returnState.redirect = true
        returnState.status = false
      }
    } else {
      returnState.message = languageData.global[state.SettingReducer.data.message]
      returnState.redirect = true
      returnState.status = true
    }
  } else if (state.SettingReducer.action === "EMPTY_DATA") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getPosSetupData: getPosSetupData,
    getPosAdditionalSetupData: getPosAdditionalSetupData,
    savePosSetupData:savePosSetupData,
    exportEmptyData:exportEmptyData
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PosSetup));
