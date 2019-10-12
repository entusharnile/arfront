import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../../../Containers/Protected/Header.js';
import Footer from '../../../Containers/Protected/Footer.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { findDOMNode } from 'react-dom'
import Select from 'react-select';
import config from '../../../config';
import axios from 'axios';
import Sidebar from '../../../Containers/Settings/sidebar.js';
import FileUploader from '../../FileUploader/FileUploader.js';
import { getAccountDetails, updateAccountDetails } from '../../../Actions/Settings/settingsActions.js';
import DropzoneComponent from 'react-dropzone-component';
import { getToken } from '../../../Utils/services.js';
import defLogo from '../../../images/no-image-vertical.png';
import {showFormattedDate} from '../../../Utils/services.js';

class Araccount extends Component {

  constructor(props) {
    super(props);

    const userData = JSON.parse(localStorage.getItem('userData'));
    this.state = {
      pictures: [],
      userId: userData.user.id,
      accountID: userData.user.account_id,
      pos_enabled:userData.pos_enabled,
      user_type:userData.user_type,
      accDetails: {},
      dateFormats: [{ val: 'mm/dd/yyyy', show: 'mm/dd/yyyy' }, { val: 'dd/mm/yyyy', show: 'dd/mm/yyyy' }, { val: 'yyyy/mm/dd', show: 'yyyy/mm/dd' }],
      logo: '',
      defLogo: defLogo,
      name: '',
      address: '',
      default_template: '',
      website: '',
      date_format: '',
      time_format:'',
      selectedUserEmailOptions:[],
      userEmailOptions:[],
      activeUsersList:[],
      is_bba_signed:false,
      bba_signed_date:'',
      commission_enabled:false,
      commission_type:'',
      commissionTypeError:false,
      nameErrorClass: 'setting-input-box',
      dataChanged: false,
      defImageCls: 'no-display',
      cameraInPreviewCls: 'camra-icon dz-clickable no-image',
      uploadedFile: '',
      dzImgObj: {},
      logo_url: '',
      dzCSS: '',
      dbBusinessName: '',
      showLoader: false,
      accountsScopes: 'accountPreference,activeUsers',
      client_replacement_text: 'Client'
    }
    window.onscroll = () => {
     return false;
    }

  }

  handleInputChange = (event) => {
    let returnState ={dataChanged: true}
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    //this.setState({ [event.target.name]: value, dataChanged: true });
    if(target.name === 'commission_enabled' && !value){
      returnState.commission_type = '';
      returnState.commissionTypeError = false
    } else if(target.name === 'commission_type' && this.state.commission_enabled){
      returnState.commissionTypeError = false
    }
    returnState[event.target.name] = value;
    this.setState(returnState)
  }
  handleSelectChange = (selectedUserEmailOptions) => {
    this.setState({
      selectedUserEmailOptions: selectedUserEmailOptions,
      userChanged:true
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    //====Frontend validation=================
    let error = false;
    this.setState({
      nameError: false,
    });
    if (typeof this.state.name === undefined || this.state.name === null || this.state.name === '') {
      this.setState({
        nameError: true,
        nameErrorClass: 'setting-input-box setting-input-box-invalid'
      })
      error = true
    } else if (this.state.name) {
      this.setState({
        nameError: false,
        nameErrorClass: 'setting-input-box'
      })

      if (this.state.commission_enabled && (typeof this.state.commission_type === undefined || this.state.commission_type === null || this.state.commission_type === '')) {
        this.setState({commissionTypeError: true})
        error = true
      } else if (this.state.commission_type) {
        this.setState({commissionTypeError: false})
      }
      if(error){
        return
      }

      let selectedUserEmailOptions = [];
      this.state.selectedUserEmailOptions.map((obj,idx)=>{
        selectedUserEmailOptions.push(obj.label);
      })


      let formData = {
        name: this.state.name,
        address: this.state.address,
        default_template: this.state.default_template,
        website: this.state.website,
        date_format: this.state.date_format,
        time_format: this.state.time_format,
        logo: this.state.logo,
        monthly_sales_email_receivers: selectedUserEmailOptions.join(','),
        commission_enabled: (this.state.commission_enabled) ? 1 : 0,
        commission_type:(this.state.commission_enabled) ? this.state.commission_type : '',
        client_replacement_text: this.state.client_replacement_text
      }
      this.setState({ showLoader: true })
      this.props.updateAccountDetails(formData, this.state.accountID);
    }
  }

  handleChildChange = (stateToUpdate) => {
    this.setState(stateToUpdate);
 }


 componentDidMount() {

   const languageData = JSON.parse(localStorage.getItem('languageData'))
   this.setState({
     arAccount_header: languageData.settings['arAccount_header'],
     ar_business_name: languageData.settings['ar_business_name'],
     ar_address : languageData.settings['ar_address'],
     ar_default_timeline: languageData.settings['ar_default_timeline'],
     ar_cosmetic: languageData.settings['ar_cosmetic'],
     ar_health: languageData.settings['ar_health'],
     ar_website_url: languageData.settings['ar_website_url'],
     ar_default_date: languageData.settings['ar_default_date'],
     clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
     user_save_btn_text: languageData.settings['user_save_btn_text'],
     showLoader: true
  })
   this.props.getAccountDetails(this.state.accountID);
 }

 componentDidUpdate(prevProps) {
   if ( prevProps.accountData !== undefined && prevProps.accountData.status === 200 && this.props.accountData !== undefined ) {
      if ( prevProps.accountData.data.logo_url !== this.props.accountData.data.logo_url ) {
          /*this.dropzone.removeFile(this.state.dzImgObj)*/

          if (this.props.accountData.data.logo !== "") {
            this.setState({defImageCls: 'no-display', cameraInPreviewCls: 'camra-icon dz-clickable camera-in-preview', dzCSS: '', uploadedFile: this.props.accountData.data.logo, logo: this.props.accountData.data.logo, logo_url : this.props.accountData.data.logo_url});
          } else {
            this.setState({uploadedFile: this.props.accountData.data.logo, logo: this.props.accountData.data.logo});
          }

          //let mockFile    = {name:this.props.accountData.data.logo_url, accepted: true, size: 7627};
          let reInitData = {};

          reInitData.dzImgObj = this.state.dzImgObj;
          reInitData.mockFile = {name:this.props.accountData.data.logo_url, accepted: true, size: 7627};
          reInitData.logo_url = this.props.accountData.data.logo_url;
          reInitData.logo = this.props.accountData.data.logo;

          this.refs.child.reInit(reInitData);
          /*let mockFile    = {name:this.props.accountData.data.logo_url, accepted: true, size: 7627};
          this.dropzone.options.addedfile.call(this.dropzone, mockFile);
          this.dropzone.options.thumbnail.call(this.dropzone, mockFile, this.props.accountData.data.logo_url);
          this.dropzone.emit("complete", mockFile);*/
        }
    }
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {};
    if (props.accountData !== undefined && props.accountData.status === 200 && props.accountData.data != state.accDetails) {
      returnState.showLoader = false
      returnState.accDetails= props.accountData.data;
      returnState.logo= props.accountData.data.logo;
      returnState.logo_url= props.accountData.data.logo_url;
      returnState.name= (state.dataChanged) ? state.name : props.accountData.data.name;
      returnState.address= (state.dataChanged) ? state.address : props.accountData.data.address;
      returnState.default_template= (state.dataChanged) ? state.default_template : props.accountData.data.account_preference.default_template;
      returnState.website= (state.dataChanged) ? state.website : props.accountData.data.website;
      returnState.date_format= (state.dataChanged) ? state.date_format : props.accountData.data.account_preference.date_format;
      returnState.time_format= (state.dataChanged) ? state.time_format : props.accountData.data.account_preference.time_format;
      returnState.is_bba_signed= (state.dataChanged) ? state.is_bba_signed : (props.accountData.data.account_preference.is_bba_signed == 1) ? true : false;
      returnState.bba_signed_date= props.accountData.data.account_preference.bba_signed_date;
      returnState.commission_enabled= (state.dataChanged) ? state.commission_enabled : props.accountData.data.account_preference.commission_enabled;
      returnState.commission_type= (state.dataChanged) ? state.commission_type : props.accountData.data.account_preference.commission_type;
      returnState.dbBusinessName= props.accountData.data.name;
      returnState.activeUsersList = (props.accountData.data.active_users != undefined) ? props.accountData.data.active_users : [];

      returnState.client_replacement_text= (state.dataChanged) ? state.client_replacement_text : props.accountData.data.account_preference.client_replacement_text;

      let userEmailOptions = [];
      if(returnState.activeUsersList != undefined && returnState.activeUsersList.length) {
        userEmailOptions = returnState.activeUsersList.map((lobj, lidx) => {
          return {value: lobj.id,  label: lobj.email_id}
        })
      }
      returnState.userEmailOptions = userEmailOptions;
      if(!state.dataChanged){
        let selectedUserEmailOptions = [];
        if(props.accountData.data.account_preference!= undefined && props.accountData.data.account_preference.monthly_sales_email_receivers != undefined && props.accountData.data.account_preference.monthly_sales_email_receivers != '' && props.accountData.data.account_preference.monthly_sales_email_receivers != null  && returnState.activeUsersList.length){
          const monthlySalesEmailReceivers= props.accountData.data.account_preference.monthly_sales_email_receivers.split(',');
          returnState.activeUsersList.map((obj, idx) => {
            if(monthlySalesEmailReceivers.indexOf(obj.email_id) > -1) {
              selectedUserEmailOptions.push({value: obj.id,  label: obj.email_id})
            }
          })
        }
        returnState.selectedUserEmailOptions = selectedUserEmailOptions
      }
      returnState.showLoader= false;
    }
    return returnState;
  }

  componentDidMount() {

    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      arAccount_header: languageData.settings['arAccount_header'],
      ar_business_name: languageData.settings['ar_business_name'],
      ar_address: languageData.settings['ar_address'],
      ar_default_timeline: languageData.settings['ar_default_timeline'],
      ar_cosmetic: languageData.settings['ar_cosmetic'],
      ar_health: languageData.settings['ar_health'],
      ar_website_url: languageData.settings['ar_website_url'],
      ar_default_date: languageData.settings['ar_default_date'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],

      ar_default_time: languageData.settings['ar_default_time'],
      ar_send_monthly_sales_report_to: languageData.settings['ar_send_monthly_sales_report_to'],
      ar_aesthetic_record_terms_of_service: languageData.settings['ar_aesthetic_record_terms_of_service'],
      ar_accepted_on: languageData.settings['ar_accepted_on'],
      ar_not_accepted_yet: languageData.settings['ar_not_accepted_yet'],
      ar_view_terms_of_service: languageData.settings['ar_view_terms_of_service'],
      ar_hipaa_business_associate_addendum: languageData.settings['ar_hipaa_business_associate_addendum'],
      ar_view_hipaa_terms_of_service: languageData.settings['ar_view_hipaa_terms_of_service'],
      ar_payroll_commission_report: languageData.settings['ar_payroll_commission_report'],
      ar_net_value_services_performed: languageData.settings['ar_net_value_services_performed'],
      ar_net_value_services_performed_formula: languageData.settings['ar_net_value_services_performed_formula'],
      ar_net_sales: languageData.settings['ar_net_sales'],
      ar_net_sales_formula: languageData.settings['ar_net_sales_formula'],
      settings_net_sales: languageData.settings['settings_net_sales'],
      ar_gross_sales: languageData.settings['ar_gross_sales'],
      ar_net_profit: languageData.settings['ar_net_profit'],
      settings_twenty_four_hours:  languageData.settings['settings_twenty_four_hours'],
      Edit_Appointment_Twelve_Hours: languageData.settings['Edit_Appointment_Twelve_Hours'],
      ar_net_profit_formula: languageData.settings['ar_net_profit_formula'],
      ar_please_select_payroll_commission_report: languageData.settings['ar_please_select_payroll_commission_report'],

      showLoader: true
    })
    this.props.getAccountDetails(this.state.accountID,this.state.accountsScopes);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.accountData !== undefined && prevProps.accountData.status === 200 && this.props.accountData !== undefined) {
      if (prevProps.accountData.data.logo_url !== this.props.accountData.data.logo_url) {
        /*this.dropzone.removeFile(this.state.dzImgObj)*/

        if (this.props.accountData.data.logo !== "") {
          this.setState({ defImageCls: 'no-display', cameraInPreviewCls: 'camra-icon dz-clickable camera-in-preview', dzCSS: '', uploadedFile: this.props.accountData.data.logo, logo: this.props.accountData.data.logo, logo_url: this.props.accountData.data.logo_url });
        } else {
          this.setState({ uploadedFile: this.props.accountData.data.logo, logo: this.props.accountData.data.logo });
        }

        //let mockFile    = {name:this.props.accountData.data.logo_url, accepted: true, size: 7627};
        let reInitData = {};

        reInitData.dzImgObj = this.state.dzImgObj;
        reInitData.mockFile = { name: this.props.accountData.data.logo_url, accepted: true, size: 7627 };
        reInitData.logo_url = this.props.accountData.data.logo_url;
        reInitData.logo = this.props.accountData.data.logo;

        this.refs.child.reInit(reInitData);
        /*let mockFile    = {name:this.props.accountData.data.logo_url, accepted: true, size: 7627};
        this.dropzone.options.addedfile.call(this.dropzone, mockFile);
        this.dropzone.options.thumbnail.call(this.dropzone, mockFile, this.props.accountData.data.logo_url);
        this.dropzone.emit("complete", mockFile);*/
      }
    }
  }



  render() {
    let optData = '';

    if (this.state.accDetails.account_preference !== undefined) {
      optData = this.state.dateFormats.map((dateFormat) => {
        return <option key={dateFormat.val} value={dateFormat.val}>{dateFormat.show}</option>;
      })
    }

    return (
      <div className="main protected">
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <form id="ar-account-form" name="ar-account-form" className="nobottommargin" action="#" method="post" onSubmit={this.handleSubmit}>
                <div className="setting-container">
                  <div className="setting-title m-b-40">{this.state.arAccount_header}</div>

                  <div className="row">

                    <div className="col-xs-12 profile-detail-left m-b-0">

                      <div className="main-profile-picture">
                        {this.state.dbBusinessName != '' && <FileUploader type='logo' uploadedFileName={'logo'} fileUrl={'logo_url'} logo={this.state.logo} logo_url={this.state.logo_url} defLogo={defLogo} logo_url={this.state.logo_url} handleChildChange={this.handleChildChange} ref="child" containerClass={'dropzone-holder'} />}

                      </div>

                      <div className="row">
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.ar_business_name}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="name" id="name" className={this.state.nameError === true ? this.state.nameErrorClass : this.state.nameErrorClass} value={this.state.name} autoComplete="off" type="text" onChange={this.handleInputChange} />
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.ar_address} <span className="setting-require"></span></div>
                            <div className="setting-input-outer">
                              <input name="address" id="address" className="setting-input-box" value={this.state.address} autoComplete="off" type="text" onChange={this.handleInputChange} />
                            </div>
                          </div>
                        </div>

                        <div className="col-sm-6 col-xs-12">
                          <label className="new-field-label m-b-10">{this.state.ar_default_timeline}</label>
                          <div className="radio-outer">

                            <input type="radio" name="default_template" value="cosmetic" id="cosmetic" checked={this.state.default_template === 'cosmetic'} onChange={this.handleInputChange} />
                            <label htmlFor="cosmetic">{this.state.ar_cosmetic}</label>
                            <input type="radio" name="default_template" value="health" id="health" checked={this.state.default_template === 'health'} onChange={this.handleInputChange} />
                            <label htmlFor="health">{this.state.ar_health}</label>

                          </div>
                        </div>

                        <div className="col-sm-6 col-xs-12">
                          <label className="new-field-label m-b-10">{`What you will call your clients?`}</label>
                          <div className="radio-outer">

                            <input type="radio" name="client_replacement_text" value="Patient" id="patient_rad" checked={this.state.client_replacement_text === 'Patient'} onChange={this.handleInputChange} />
                            <label htmlFor="patient_rad">Patient</label>
                            <input type="radio" name="client_replacement_text" value="Client" id="client_rad" checked={this.state.client_replacement_text === 'Client'} onChange={this.handleInputChange} />
                            <label htmlFor="client_rad">Client</label>

                          </div>
                        </div>

                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.ar_website_url}<span className="setting-require"></span></div>

                            <div className="setting-input-outer">
                              <input name="website" id="website" className="setting-input-box" value={this.state.website} maxLength="500" autoComplete="off" type="text" onChange={this.handleInputChange} />
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.ar_default_time}</div>
                            <div className="setting-input-outer">
                              <select value={this.state.time_format} name="time_format" id="time_format" className="setting-select-box" onChange={this.handleInputChange}>
                              <option value="12 hours">{this.state.Edit_Appointment_Twelve_Hours}</option>
                              <option value="24 hours">{this.state.settings_twenty_four_hours}</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.ar_default_date}</div>
                            <div className="setting-input-outer">
                              <select value={this.state.date_format} name="date_format" id="date_format" className="setting-select-box" onChange={this.handleInputChange}>
                                {optData}
                              </select>
                            </div>
                          </div>
                        </div>
                        {(this.state.pos_enabled == true) &&
                          <div className="col-xs-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.ar_send_monthly_sales_report_to}</div>
                                <div className="setting-input-outer">
                                  <div className="tag-auto-select">
                                    {
                                      this.state.userEmailOptions && <Select
                                      onChange={this.handleSelectChange}
                                      value={this.state.selectedUserEmailOptions}
                                      isClearable
                                      isSearchable
                                      options={this.state.userEmailOptions}
                                      isMulti={true}
                                    />
                                    }
                                </div>
                              </div>
                            </div>
                          </div>
                        }

                        <div className="col-sm-12">
                        <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.ar_aesthetic_record_terms_of_service}</div><span className="pull-left">{this.state.is_bba_signed ? this.state.ar_accepted_on+' :  '+ showFormattedDate(this.state.bba_signed_date, false) : this.state.ar_not_accepted_yet}</span>
                            {this.state.is_bba_signed &&
                              <a className="easy-link no-padding pull-right" href="/settings/ar-terms-of-use" target="_blank">{this.state.ar_view_terms_of_service}</a>
                            }
                        </div>
                        </div>
                        <div className="col-sm-12">
                        <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.ar_hipaa_business_associate_addendum}</div><span className="pull-left">{this.state.is_bba_signed ? this.state.ar_accepted_on+' :  '+ showFormattedDate(this.state.bba_signed_date, false) : this.state.ar_not_accepted_yet}</span>
                            {this.state.is_bba_signed &&
                              <a className="easy-link no-padding pull-right" href="/settings/hipaa-terms-of-use" target="_blank">{this.state.ar_view_hipaa_terms_of_service}</a>
                            }
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                { (this.state.user_type == 'superadmin' && this.state.pos_enabled == true) &&
                  <div className="switch-accordian-outer">
                      <div className="switch-accordian-row closed" id="reminder">{this.state.ar_payroll_commission_report}
                      <label className="setting-switch pull-right">
                        <input type="checkbox" name="commission_enabled" className="setting-custom-switch-input" value={this.state.commission_enabled}  checked={this.state.commission_enabled ? 'checked' : false } onChange={this.handleInputChange} />
                        <span className="setting-slider colored-slider"></span>
                      </label>
                      </div>

                      <div className={this.state.commission_enabled ? "setting-container p-t-15" : 'no-display'}>

                      <div id="payroll_selection_div" className="radio-outer">
                        <div className="setting-input-outer">
                          <input type="radio" name="commission_type" value="Net Value Services Performed"  checked={this.state.commission_type == "Net Value Services Performed" ? 'checked' : false } onChange={this.handleInputChange} />
                          <label htmlFor="payroll1" className="payroll-label">{this.state.ar_net_value_services_performed}</label>
                          <div className="payroll-formula">{this.state.ar_net_value_services_performed_formula}</div>
                        </div>
                        <div className="setting-input-outer">
                          <input type="radio" name="commission_type" value="Net Sales"  checked={this.state.commission_type == "Net Sales" ? 'checked' : false } onChange={this.handleInputChange} />
                          <label htmlFor="payroll2" className="payroll-label">{this.state.ar_net_sales}</label>
                          <div className="payroll-formula">
                          {this.state.settings_net_sales}
                          </div>
                        </div>
                        <div className="setting-input-outer">
                          <input type="radio" name="commission_type" value="Gross Sales"  checked={this.state.commission_type == "Gross Sales" ? 'checked' : false } onChange={this.handleInputChange} />
                          <label htmlFor="payroll3" className="payroll-label">{this.state.ar_gross_sales}</label>
                        </div>
                        <div className="setting-input-outer">
                          <input type="radio" name="commission_type" value="Net Profit"  checked={this.state.commission_type == "Net Profit" ? 'checked' : false } onChange={this.handleInputChange} />
                          <label htmlFor="payroll4" className="payroll-label">{this.state.ar_net_profit}</label>
                          <div className="payroll-formula">{this.state.ar_net_sales_formula}</div>
                        </div>
                        { this.state.commissionTypeError &&
                          <div id="payroll_error">{this.state.ar_please_select_payroll_commission_report}</div>
                        }
                      </div>
                      </div>
                  </div>
                }

                <div className="footer-static">
                  <input className="new-blue-btn pull-right" type="submit" value="Save" id="save-profile" />
                </div>
              </form>
              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
                </div>
              </div>
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
  if (state.SettingReducer.action === "ACCOUNT_GET") {
    if(state.SettingReducer.data.status != 200){
      returnState.showLoader = false
    }
    else {
      returnState.accountData = state.SettingReducer.data
    }
  }
  else if (state.SettingReducer.action === "ACCOUNT_PUT") {
    toast.dismiss();
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.accountData = state.SettingReducer.data
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getAccountDetails: getAccountDetails, updateAccountDetails: updateAccountDetails }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Araccount);
