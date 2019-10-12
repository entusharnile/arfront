import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import config from '../../config';
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import {
  getClientDetail,createClient,updateClient
} from '../../Actions/Clients/clientsAction.js';
import { connect } from 'react-redux'
import { bindActionCreators } from "redux";
import DatePicker from "react-datepicker";
import calenLogo from '../../images/calender.svg';
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import IntlTelInput from 'react-intl-tel-input';

import FileUploader from '../FileUploader/FileUploader.js';
import defLogo from '../../images/appmale.png';
import validator from 'validator';
import { showFormattedDate,dateFormatPicker } from '../../Utils/services.js';


const initAdditionalPhoneNumber = () => {
  return {phoneNumber:'', phoneNumberError:false, 'phoneNumberClass':'setting-input-box'}
}
const initAdditionalEmail = () => {
  return {email:'', emailError:false, 'emailClass':'setting-input-box'}
}

const formatType = 'YYYY-MM-DD'
const dateFormat = (date) => {
  return moment(date).format(formatType);
}

const isNotEmpty = (value) => {
  return (typeof value != undefined && value != null && value != '');
}

const nullToString = (value) => {
  if((typeof value != undefined && value != null)){
    return value;
  } else {
    return '';
  }
}

class CreateEditClients extends Component {
  constructor(props) {
    super(props);
    const languageData  = JSON.parse(localStorage.getItem('languageData'))
    let userData = JSON.parse(localStorage.getItem('userData'));
    this.state = {
      userData:userData,
      globalLang: languageData.global,
      clientsLang: languageData.clients,
      clientId: this.props.match.params.id,
      showLoader: false,
      redirect:false,
      userChanged: false,
      clientData:{},
      clientId: '',
      actionType:'',
      backAction:'clients',
      isRender:false,
      countryList:[],
      referralSourceList:[],
      firstname: '',
      lastname: '',
      nick_name: '',
      email: '',
      phoneNumber: '',
      gender: '',
      date_of_birth: '',
      referral_source: '',
      referral_other:'',
      referral_person: '',
      ssn_number: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      country: '',
      pincode: '',
      additionalPhoneNumber:[initAdditionalPhoneNumber()],
      additionalEmail:[initAdditionalEmail()],
      brilliant_acc_number: '',
      brilliant_password: '',
      aspire_acc_email: '',
      aspire_password: '',
      emergency_contact_name: '',
      emergency_contact_number: '',
      emergencyContactNumber:'',
      member_type: '', //juvly_member, model
      firstNameClass:'setting-input-box',
      lastNameClass:'setting-input-box',
      emailClass:'setting-input-box',
      phoneNumberClass:'setting-input-box',
      phoneNumberError:false,
      emergencyContactNumberClass:'setting-input-box',
      emergencyContactNumberError:false,
      aspireAccEmailClass:'setting-input-box',

      // Applicable only for juvly account
      member_type_juvly : false,
      member_type_model : false,

      showDatePicker:false,
      selectedPickerDate: '',

      defaultCountry: localStorage.getItem('cCode'),

      clearClass: 'new-white-btn no-margin clear no-display',
      resetClass: 'new-blue-btn reset no-display m-l-10',
      changeClass: 'new-blue-btn no-margin Change m-l-10',
      defImageCls: 'no-display',
      cameraInPreviewCls: 'camra-icon dz-clickable no-image',
      user_image: '',
      dzImgObj: {},
      user_image_url: '',
      uploadedFile:'',
      dzCSS: '',
    }
  }

  componentDidMount() {
    window.onscroll = () => {
       return false;
    }
    document.addEventListener('click', this.handleClick, false);
    let isRender = false;
    let clientId = this.props.match.params.id;
    if(clientId == undefined) {
      clientId = 0;
      isRender=true;
    }


    this.setState({showLoader:true});
    this.props.getClientDetail(clientId,'');
    let actionType = this.props.match.params.type;
    if(actionType == undefined) {
      actionType = '';
    }
    let backAction = `/clients`;
    if(clientId){
      if(actionType == 'profile'){
        backAction = `/clients/profile/${clientId}`;
      }
    }
    this.setState({clientId:clientId,actionType:actionType,backAction:backAction,isRender:isRender})
    const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
    datePicker1.childNodes[0].setAttribute("readOnly",true);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}
    if(nextProps.clientData !== undefined && nextProps.clientData.status === 200 && nextProps.clientData.data !== prevState.clientData) {
      returnState.clientData =  nextProps.clientData.data;
      if(returnState.clientData.id != undefined && returnState.clientData.id == prevState.clientId && !prevState.userChanged){
        returnState.firstname =  nullToString(returnState.clientData.firstname);
        returnState.lastname =  nullToString(returnState.clientData.lastname);
        returnState.nick_name =  nullToString(returnState.clientData.nick_name);
        returnState.email =  nullToString(returnState.clientData.email);
        returnState.phoneNumber =  nullToString(returnState.clientData.phoneNumber);
        returnState.gender =  nullToString(returnState.clientData.gender);
        returnState.referral_source =  nullToString(returnState.clientData.referral_source);
        returnState.referral_other =  nullToString(returnState.clientData.referral_other);
        returnState.referral_person =  nullToString(returnState.clientData.referral_person);
        returnState.ssn_number =  nullToString(returnState.clientData.ssn_number);
        returnState.address_line_1 =  nullToString(returnState.clientData.address_line_1);
        returnState.address_line_2 =  nullToString(returnState.clientData.address_line_2);
        returnState.city =  nullToString(returnState.clientData.city);
        returnState.state =  nullToString(returnState.clientData.state);
        returnState.country =  nullToString(returnState.clientData.country);
        returnState.pincode =  nullToString(returnState.clientData.pincode);
        returnState.brilliant_acc_number =  nullToString(returnState.clientData.brilliant_acc_number);
        returnState.brilliant_password =  nullToString(returnState.clientData.brilliant_password);
        returnState.aspire_acc_email =  nullToString(returnState.clientData.aspire_acc_email);
        returnState.aspire_password =  nullToString(returnState.clientData.aspire_password);
        returnState.emergency_contact_name =  nullToString(returnState.clientData.emergency_contact_name);
        returnState.emergency_contact_number =  nullToString(returnState.clientData.emergency_contact_number);
        returnState.emergencyContactNumber =  nullToString(returnState.clientData.emergency_contact_number);
        //returnState.member_type =  nullToString(returnState.clientData.member_type);
        returnState.user_image =  nullToString(returnState.clientData.user_image);
        returnState.user_image_url =  nullToString(returnState.clientData.user_image_url);
        if(returnState.clientData.member_type === 'both'){
          returnState.member_type_model = true;
          returnState.member_type_juvly = true;
        } else if(returnState.clientData.member_type === 'juvly_member'){
          returnState.member_type_model = false;
          returnState.member_type_juvly = true;
        } else if(returnState.clientData.member_type === 'model'){
          returnState.member_type_model = true;
          returnState.member_type_juvly = false;
        } else {
          returnState.member_type_model = false;
          returnState.member_type_juvly = false;
        }

        let selectedPickerDate =  nullToString(returnState.clientData.date_of_birth);
        if(selectedPickerDate == "0000-00-00"){
          selectedPickerDate = '';
        }
        if(selectedPickerDate != ''){
          returnState.selectedPickerDate = new Date(selectedPickerDate)
        }
        returnState.date_of_birth = nullToString(returnState.clientData.date_of_birth)

        let additionalPhoneNumber = [];
        if(isNotEmpty(returnState.clientData.phoneNumber_2)){
          let phoneNumber2 = initAdditionalPhoneNumber();
          phoneNumber2.phoneNumber = returnState.clientData.phoneNumber_2;
          additionalPhoneNumber.push(phoneNumber2);
        }
        if(isNotEmpty(returnState.clientData.phoneNumber_3)){
          let phoneNumber3 = initAdditionalPhoneNumber();
          phoneNumber3.phoneNumber = returnState.clientData.phoneNumber_3;
          additionalPhoneNumber.push(phoneNumber3);
        }
        if(isNotEmpty(returnState.clientData.phoneNumber_4)){
          let phoneNumber4 = initAdditionalPhoneNumber();
          phoneNumber4.phoneNumber = returnState.clientData.phoneNumber_4;
          additionalPhoneNumber.push(phoneNumber4);
        }
        if(additionalPhoneNumber.length == 0){
          additionalPhoneNumber = [initAdditionalPhoneNumber()];
        }
        returnState.additionalPhoneNumber = additionalPhoneNumber;

        let additionalEmail = [];
        if(isNotEmpty(returnState.clientData.email_2)){
          let email2 = initAdditionalEmail();
          email2.email = returnState.clientData.email_2;
          additionalEmail.push(email2);
        }
        if(isNotEmpty(returnState.clientData.email_3)){
          let email3 = initAdditionalEmail();
          email3.email = returnState.clientData.email_3;
          additionalEmail.push(email3);
        }
        if(isNotEmpty(returnState.clientData.email_4)){
          let email4 = initAdditionalEmail();
          email4.email = returnState.clientData.email_4;
          additionalEmail.push(email4);
        }
        if(additionalEmail.length == 0){
          additionalEmail = [initAdditionalEmail()];
        }
        returnState.additionalEmail = additionalEmail;
      }
      returnState.isRender=true;

      returnState.countryList =  returnState.clientData.countries;
      returnState.referral_source_array =  returnState.clientData.referral_source_array;
      let referralSourceList = [];
      Object.keys(returnState.referral_source_array).forEach(function(key) {
        referralSourceList.push({value:key, label:returnState.referral_source_array[key]});
      });
      returnState.referralSourceList = referralSourceList;
      returnState.showLoader=  false;
    } else if(nextProps.redirect != undefined && nextProps.redirect == true && nextProps.redirect != prevState.redirect) {
      returnState.redirect = true;
       toast.success(nextProps.message)
       nextProps.history.push(prevState.backAction);

     } else if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
       returnState.showLoader = false;
      }
    return returnState;
  }

  componentDidUpdate(prevProps) {
      if (prevProps.clientData !== undefined && prevProps.clientData.status === 200 && this.props.clientData !== undefined ) {
        if (prevProps.clientData.data.user_image !== this.props.clientData.data.user_image) {
          if (this.props.clientData.data.user_image !== "") {
              this.setState({ defImageCls: 'no-display', cameraInPreviewCls: 'camra-icon dz-clickable camera-in-preview', dzCSS: '', user_image :  this.props.clientData.data.user_image, user_image_url : this.props.clientData.data.user_image_url});
          } else {
              this.setState({ uploadedFile: this.props.clientData.data.user_image, user_image: this.props.clientData.data.user_image });
          }

          let reInitData = {};

          reInitData.dzImgObj = this.state.dzImgObj;
          reInitData.mockFile = {name:this.props.clientData.data.user_image_url, accepted: true, size: 7627};
          reInitData.user_image_url = this.props.clientData.data.user_image_url;
          reInitData.user_image = this.props.clientData.data.user_image;
          this.refs.child.reInit(reInitData);
        }
      }
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleClick = (e) =>  {
    if (!this.refDatePickerContainer.contains(e.target)) {
      this.refDatePicker.setOpen(false);
      this.setState({showDatePicker:false})
    }
  }

  handleDatePicker = (date) => {
    this.setState({selectedPickerDate: date,showDatePicker:false,userChanged: true});
    this.refDatePicker.setOpen(false);
  }

  resetDatePicker = () => {
    this.setState({selectedPickerDate: '','showDatePicker':true,userChanged: true});
    this.toggleDatePicker();
  }

  blurDatePicker = (date) => {
    this.refDatePicker.setOpen(true);
    this.setState({'showDatePicker':true,userChanged: true});
  }

  focusDatePicker = (date) => {
    this.setState({'showDatePicker':true});
  }

  toggleDatePicker = () => {
    this.setState({'showDatePicker':true});
    this.refDatePicker.setFocus(true);
    this.refDatePicker.setOpen(true);
  }

  phoneNumberChanged = (inputFiled,t, x, y, number) => {
    this.setState({userChanged: true});
    inputFiled = inputFiled.split('_');
    //let fullNumber = ''
    //const phoneNumber = number.replace(/\s/g,'')
    let phoneNumber = number.replace(/[ `~!@#$%^&*()_|\-=?;:'",.<>\{\}\[\]\\\/]/gi,'')

    let phoneNumberError = true;
    let phoneNumberClass = 'setting-input-box setting-input-box-invalid';
    if(t) {
      phoneNumberError = false;
      phoneNumberClass = 'setting-input-box';
      //fullNumber = number
    }

    if(inputFiled.length > 1){
      let additionalPhoneNumber = this.state.additionalPhoneNumber;
      additionalPhoneNumber[inputFiled[1]]['phoneNumber'] = phoneNumber;
      additionalPhoneNumber[inputFiled[1]]['phoneNumberError'] = phoneNumberError;
      additionalPhoneNumber[inputFiled[1]]['phoneNumberClass'] = phoneNumberClass;
      this.setState(additionalPhoneNumber);
    } else {
      this.setState({[inputFiled[0]]:phoneNumber,[inputFiled[0]+'Error']:phoneNumberError,[inputFiled[0]+'Class']:phoneNumberClass})
    }
  }

  onDrop(picture) {
      this.setState({
          pictures: this.state.pictures.concat(picture),
      });
  }

  removeItems() {
      this.setState({ icon: 'faAngleRight' })
  }

  handleChildChange = (stateToUpdate) => {
      this.setState(stateToUpdate);
   }

  handleInputChange = (event) => {
    this.setState({userChanged: true});
    const target = event.target;
    let value = target.value;
    const name = target.name;
    switch(target.type) {
      case 'checkbox': {
          value = target.checked;
          break;
      }
      case 'radio' :{
        value = target.value;
        break;
      }
      case 'file':{
        value = target.files[0];
        break;
      }
   }
   if(name == 'additional_email'){
     const  index = event.target.dataset.index;
     let additionalEmail = this.state.additionalEmail;
     additionalEmail[index]['email'] = value;
     this.setState(additionalEmail);
   } else {
     this.setState({[event.target.name]: value});
   }
  }

  handleSubmit = event => {
    event.preventDefault();
    //====Frontend validation=================
    let formData = {};
    let additionalEmail = [];
    let additionalPhoneNumber = [];
    let error = false;
    let errorEmail = false;
    let errorPhoneNumber = false;
    if (typeof this.state.firstname == undefined || this.state.firstname == null || this.state.firstname == '') {
        this.setState({firstNameClass: 'setting-input-box field_error'})
        error = true;
    } else if (this.state.firstname) {
        this.setState({firstNameClass: 'setting-input-box'})
    }

    if (typeof this.state.lastname == undefined || this.state.lastname == null || this.state.lastname == '') {
        this.setState({lastNameClass: 'setting-input-box field_error'})
        error = true;
    } else if (this.state.lastname) {
        this.setState({lastNameClass: 'setting-input-box'})
    }

    if (typeof this.state.email != undefined && this.state.email != null && this.state.email != '' && !validator.isEmail(this.state.email)) {
        this.setState({emailClass: 'setting-input-box field_error'})
        error = true;
        errorEmail = true;
    } else {
        this.setState({emailClass: 'setting-input-box'})
    }

    if (this.state.phoneNumber != undefined && this.state.phoneNumber != null && this.state.phoneNumber != '' && this.state.phoneNumberError) {
      error = true;
      errorPhoneNumber = true;
      this.setState({phoneNumberClass: 'setting-input-box setting-input-box-invalid'})
    } else {
        this.setState({phoneNumberClass: 'setting-input-box'})
    }

    if (typeof this.state.aspire_acc_email != undefined && this.state.aspire_acc_email != null && this.state.aspire_acc_email != '' && !validator.isEmail(this.state.aspire_acc_email)) {
        this.setState({aspireAccEmailClass: 'setting-input-box field_error'})
        error = true;
        errorEmail = true;
    } else {
        this.setState({aspireAccEmailClass: 'setting-input-box'})
    }

    if (this.state.emergencyContactNumber != undefined && this.state.emergencyContactNumber != null && this.state.emergencyContactNumber != '' && this.state.emergencyContactNumberError) {
      error = true;
      errorPhoneNumber = true;
      this.setState({emergencyContactNumberClass: 'setting-input-box setting-input-box-invalid'})
    } else {
        this.setState({emergencyContactNumberClass: 'setting-input-box'})
    }

    additionalPhoneNumber = this.state.additionalPhoneNumber;
    additionalPhoneNumber.map((obj,idx)=> {
        if(obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== '' && obj.phoneNumberError){
          error = true;
          errorPhoneNumber = true;
          additionalPhoneNumber[idx]['phoneNumberClass'] = 'setting-input-box setting-input-box-invalid';
        } else {
          if(additionalPhoneNumber.length > 1){
            if(obj.phoneNumber === undefined || obj.phoneNumber === null || obj.phoneNumber === ''){
              error = true;
              errorPhoneNumber = true;
              additionalPhoneNumber[idx]['phoneNumberClass'] = 'setting-input-box setting-input-box-invalid';
            } else {
              additionalPhoneNumber[idx]['phoneNumberClass'] = 'setting-input-box';
            }
          }  else {
            additionalPhoneNumber[idx]['phoneNumberClass'] = 'setting-input-box';
          }
        }
    })
    this.setState(additionalPhoneNumber)

    additionalEmail = this.state.additionalEmail;
    additionalEmail.map((obj,idx)=> {
        if(obj.email != undefined && obj.email != null && obj.email != ''&& !validator.isEmail(obj.email)){
          error = true;
          errorEmail = true;
          additionalEmail[idx]['emailClass'] = 'setting-input-box field_error';
          additionalEmail[idx]['emailError'] = true;
        } else {
          if(additionalEmail.length > 1){
            if(obj.email === undefined || obj.email === null || obj.email === ''){
              error = true;
              errorEmail = true;
              additionalEmail[idx]['emailClass'] = 'setting-input-box field_error';
              additionalEmail[idx]['emailError'] = true;
            } else {
              additionalEmail[idx]['emailClass'] = 'setting-input-box';
              additionalEmail[idx]['emailError'] = false;
            }
          } else {
            additionalEmail[idx]['emailClass'] = 'setting-input-box';
            additionalEmail[idx]['emailError'] = false;
          }
        }
    })
    this.setState(additionalEmail)
    if(error){
      if(errorEmail || errorPhoneNumber){
        let errorMessage = '';
        if(errorEmail && errorPhoneNumber){
          errorMessage = 'Please enter valid email and phone number.'
        } else if(errorEmail){
          errorMessage = 'Please enter valid email.'
        } else{
          errorMessage = 'Please enter valid  phone number.'
        }
        toast.dismiss();
        toast.error(errorMessage);
      }
      return;
    }

    formData.firstname = this.state.firstname;
    formData.lastname = this.state.lastname;
    formData.nick_name = this.state.nick_name;
    formData.email = this.state.email;
    formData.phoneNumber = this.state.phoneNumber;
    formData.user_image = this.state.user_image;
    formData.gender = this.state.gender;
    formData.referral_source = this.state.referral_source;
    formData.referral_other = this.state.referral_other;
    formData.referral_person = this.state.referral_person;
    formData.ssn_number = this.state.ssn_number;
    formData.address_line_1 = this.state.address_line_1;
    formData.address_line_2 = this.state.address_line_2;
    formData.city = this.state.city;
    formData.state = this.state.state;
    formData.pincode = this.state.pincode;
    formData.country = this.state.country;
    formData.brilliant_acc_number = this.state.brilliant_acc_number;
    formData.brilliant_password = this.state.brilliant_password;
    formData.aspire_acc_email = this.state.aspire_acc_email;
    formData.aspire_password = this.state.aspire_password;
    formData.emergency_contact_name = this.state.emergency_contact_name;
    formData.emergency_contact_number = this.state.emergencyContactNumber;
    formData.date_of_birth = (this.state.selectedPickerDate == undefined || this.state.selectedPickerDate == null || this.state.selectedPickerDate == '') ? '' : dateFormat(this.state.selectedPickerDate);
    for(var count= 0; count<3;  count++){
      formData['email_'+(count+2)] = (additionalEmail[count] != undefined && additionalEmail[count]['email'] != undefined ) ? additionalEmail[count]['email'] :'';
      formData['phoneNumber_'+(count+2)] = (additionalPhoneNumber[count] != undefined && additionalPhoneNumber[count]['phoneNumber'] != undefined ) ? additionalPhoneNumber[count]['phoneNumber'] :'';
    }


    formData.member_type = '';
    if (this.state.userData.user != undefined && this.state.userData.user.account_id != undefined && (this.state.userData.user.account_id === config.JUVLY_ACC_ID || this.state.userData.user.account_id === config.CC_ACC_ID)) {
      if(this.state.member_type_juvly && this.state.member_type_model){
          formData.member_type = 'both';
      } else if(this.state.member_type_juvly){
        formData.member_type = 'juvly_member';
      } else if(this.state.member_type_model){
        formData.member_type = 'model';
      }
    }

    toast.dismiss();
    this.setState({showLoader:true});
    if(this.state.clientId > 0){
      this.props.updateClient(this.state.clientId,formData)
    } else {
      this.props.createClient(formData)
    }

  };

  addAdditionalPhoneNumber = () => {
    if(this.state.additionalPhoneNumber.length == 3) { return false}
    let additionalPhoneNumber = this.state.additionalPhoneNumber;
    additionalPhoneNumber.push(initAdditionalPhoneNumber());
    this.setState({additionalPhoneNumber:additionalPhoneNumber});
  }

  deleteAdditionalPhoneNumber = (event) => {
    if(this.state.additionalPhoneNumber.length == 1) { return false}
    let additionalPhoneNumber = this.state.additionalPhoneNumber;
    const  index = event.target.dataset.index;
    additionalPhoneNumber.splice(index, 1);
    if(additionalPhoneNumber.length === 1 && (additionalPhoneNumber[0]['phoneNumber'] === undefined || additionalPhoneNumber[0]['phoneNumber'] === null || additionalPhoneNumber[0]['phoneNumber'] === '')){
      additionalPhoneNumber[0] = initAdditionalPhoneNumber();
    }
    this.setState({additionalPhoneNumber:additionalPhoneNumber});
  }

  addAdditionalEmail = () => {
    if(this.state.additionalEmail.length == 3) { return false}
    let additionalEmail = this.state.additionalEmail;
    additionalEmail.push(initAdditionalEmail());
    this.setState({additionalEmail:additionalEmail});
  }

  deleteAdditionalEmail = (event) => {
    if(this.state.additionalEmail.length == 1) { return false}
    let additionalEmail = this.state.additionalEmail;
    const  index = event.target.dataset.index;
    additionalEmail.splice(index, 1);
    if(additionalEmail.length === 1 && (additionalEmail[0]['email'] === undefined || additionalEmail[0]['email'] === null || additionalEmail[0]['email'] === '')){
      additionalEmail[0] = initAdditionalEmail();
    }
    this.setState({additionalEmail:additionalEmail});
  }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <div className="juvly-section full-width">
            <div className="juvly-container">
              <div className="juvly-title"> {this.state.clientId > 0 ? this.state.clientsLang.client_edit_client : this.state.clientsLang.client_create_client}
                <Link to={this.state.backAction} className="pull-right"><img src="/images/close.png" /></Link>
              </div>
              <div className="row">
                <div className="col-xs-12 profile-detail-left">
                  <div className="main-profile-picture">
                     {this.state.isRender && <FileUploader  type='patient_profile' uploadedFileName={'user_image'} fileUrl={'user_image_url'} user_image={this.state.user_image} user_image_url={this.state.user_image_url} defLogo={defLogo} logo_url={this.state.user_image_url} handleChildChange={this.handleChildChange} ref="child" containerClass={'dropzone-holder'}  />
                   }
                  </div>
                  <div className="juvly-subtitle">{this.state.clientsLang.client_client_information}</div>
                  <div className="row">
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_first_name}<span className="setting-require">*</span></div>
                        <input className={this.state.firstNameClass} type="text" name='firstname' value={this.state.firstname} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_last_name}<span className="setting-require">*</span></div>
                        <input className={this.state.lastNameClass} type="text" name='lastname' value={this.state.lastname} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_nickname}</div>
                        <input className="setting-input-box" type="text" name='nick_name' value={this.state.nick_name} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_email_address}</div>
                        <input autoComplete="new-password" className={this.state.emailClass} type="text" name='email' value={this.state.email} onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_phone}</div>
                        <div className="setting-input-outer">
                        {(this.state.isRender) && <IntlTelInput
                            preferredCountries={['tw']}
                            css={ ['intl-tel-input', this.state.phoneNumberClass] }
                            utilsScript={ 'libphonenumber.js' }
                            defaultValue = {(this.state.phoneNumber) ? this.state.phoneNumber : ''}
                            defaultCountry = {this.state.defaultCountry}
                            fieldName='phoneNumber'
                            onPhoneNumberChange={ this.phoneNumberChanged.bind(this,'phoneNumber') }
                            onPhoneNumberBlur={ this.phoneNumberChanged.bind(this,'phoneNumber') }
                            placeholder={this.state.clientsLang.client_phone_number}
                            separateDialCode={`true`}
                          />}</div>
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_gender}</div>
                        <select className="setting-select-box" name='gender' value={this.state.gender} onChange={this.handleInputChange}>
                          <option value="2">Not Disclosed</option>
                          <option value="0">Male</option>
                          <option value="1">Female</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_date_of_birth}</div>
                        <div className="setting-input-outer" ref={(refDatePickerContainer) => this.refDatePickerContainer = refDatePickerContainer}>
                          <a href="javascript:void(0);" className="client-treat-cal" onClick={this.toggleDatePicker}>
                            <i className="fas fa-calendar-alt" />
                          </a>
                          <a href="javascript:void(0);" className="client-treat-reset" onClick={this.resetDatePicker}>
                            <i className="fas fa-times" />
                          </a>
                          <DatePicker
                            selected={(this.state.selectedPickerDate) ? this.state.selectedPickerDate : null}
                            onChange={this.handleDatePicker}
                            className={'setting-input-box p-r-40'}
                            dateFormat={dateFormatPicker()}
                            placeholderText={dateFormatPicker().toLowerCase()}
                            autoComplete="off"
                            ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                            onBlur={this.blurDatePicker}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            minDate={new Date(moment().subtract(100, "years").toDate())}
                            maxDate={new Date()}
                          />
                        </div>

                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_select_referral_source}</div>
                        <select className="setting-select-box" name='referral_source' value={this.state.referral_source} onChange={this.handleInputChange}>
                          <option value="">Select</option>
                          { this.state.referralSourceList.map((obj,idx) => {
                              return (<option value={obj.key} key={'referralSourceList-'+idx}>{obj.label}</option>)
                          })
                          }
                        </select>
                      </div>
                    </div>
                    {(this.state.referral_source == 'Other') &&
                      <div className="col-md-4 col-sm-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.clientsLang.client_select_referral_source}</div>
                          <input className="setting-input-box p-r-40" type="text" name='referral_other' value={this.state.referral_other} autoComplete="off" onChange={this.handleInputChange} />
                        </div>
                      </div>
                    }

                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_referring_person}</div>
                        <input className="setting-input-box" type="text" name='referral_person' value={this.state.referral_person} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_ssn}</div>
                        <input className="setting-input-box" type="text" name='ssn_number' value={this.state.ssn_number} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>

                    {(this.state.userData.user != undefined && this.state.userData.user.account_id != undefined && (this.state.userData.user.account_id === config.JUVLY_ACC_ID || this.state.userData.user.account_id === config.CC_ACC_ID)) &&
                      <div className="col-md-4 col-sm-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.clientsLang.client_client_status}</div>
                          <div className="setting-input-outer">
                            <div className="basic-checkbox-outer">
                              <input id="checkbox1" className="basic-form-checkbox new-check" name="member_type_juvly" type="checkbox"  onChange={this.handleInputChange} checked={(this.state.member_type_juvly) ? 'checked' :  false} />
                              <label className="basic-form-text" htmlFor="checkbox1">{this.state.clientsLang.client_client_status_member}</label>
                            </div>
                            <div className="basic-checkbox-outer">
                              <input id="checkbox2" className="basic-form-checkbox new-check" name="member_type_model" type="checkbox"  onChange={this.handleInputChange} checked={(this.state.member_type_model) ? 'checked' :  false} />
                              <label className="basic-form-text" htmlFor="checkbox2">{this.state.clientsLang.client_client_status_model}</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                  <div className="juvly-subtitle">{this.state.clientsLang.client_address_information}</div>
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_address1}</div>
                        <input className="setting-input-box" type="text" name='address_line_1' value={this.state.address_line_1} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_address2}</div>
                        <input className="setting-input-box" type="text" name='address_line_2' value={this.state.address_line_2} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_city}</div>
                        <input className="setting-input-box" type="text" name='city' value={this.state.city} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_state}</div>
                        <input className="setting-input-box" type="text" name='state' value={this.state.state} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_zip_code}</div>
                        <input className="setting-input-box" type="text" name='pincode' value={this.state.pincode} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_country}</div>
                        <select className="setting-select-box" name='country' value={this.state.country} onChange={this.handleInputChange}>
                          <option>Select</option>
                          { this.state.countryList.map((obj,idx) => {
                              return (<option value={obj.country_code} key={'countryList-'+idx}>{obj.country_name}</option>)
                          })
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="juvly-subtitle">{this.state.clientsLang.client_additional_contact_information}</div>
                  <div className="row">
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="row">
                        {this.state.additionalPhoneNumber.map((obj,idx)=>{
                          return (
                              <div className="col-xs-12 relative" key={'additionalPhoneNumber-'+idx}>
                                <div className="setting-field-outer">

                                  <div className="new-field-label">{this.state.clientsLang.client_phone_number} {idx + 1}</div>
                                  <div className="setting-input-outer">
                                  {(this.state.isRender) && <IntlTelInput
                                      preferredCountries={['tw']}
                                      css={ ['intl-tel-input', obj.phoneNumberClass] }
                                      utilsScript={ 'libphonenumber.js' }
                                      defaultValue = {(obj.phoneNumber) ? obj.phoneNumber : ''}
                                      defaultCountry = {this.state.defaultCountry}
                                      fieldName={'phoneNumber_'+idx}
                                      onPhoneNumberChange={ this.phoneNumberChanged.bind(this,'phoneNumber_'+idx) }
                                      onPhoneNumberBlur={ this.phoneNumberChanged.bind(this,'phoneNumber_'+idx) }
                                      placeholder={this.state.clientsLang.client_phone_number}
                                      separateDialCode={`true`}
                                    />
                                  }
                                  </div>
                                </div>
                                {(idx == 0) ?
                                  <a href="javascript:void(0);" className="add-round-btn" data-index={idx} onClick={this.addAdditionalPhoneNumber}>
                                    <span data-index={idx}>+</span>
                                  </a>
                                  :
                                  <a href="javascript:void(0);" className="add-round-btn" data-index={idx} onClick={this.deleteAdditionalPhoneNumber}>
                                    <span data-index={idx}>-</span>
                                  </a>
                                }
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="row relative">
                        {this.state.additionalEmail.map((obj,idx)=>{
                          return (
                              <div className="col-xs-12 relative" key={'additionalPhoneNumber-'+idx}>
                                <div className="setting-field-outer">
                                  <div className="new-field-label">{this.state.clientsLang.client_email_address} {idx + 1}</div>
                                  <input autoComplete="new-password" className={obj.emailClass} type="text" name='additional_email' value={obj.email} onChange={this.handleInputChange} data-index={idx} placeholder={this.state.clientsLang.client_email}/>
                                </div>
                                {(idx == 0) ?
                                  <a href="javascript:void(0);" className="add-round-btn" data-index={idx} onClick={this.addAdditionalEmail}>
                                    <span data-index={idx}>+</span>
                                  </a>
                                  :
                                  <a href="javascript:void(0);" className="add-round-btn" data-index={idx} onClick={this.deleteAdditionalEmail}>
                                    <span data-index={idx}>-</span>
                                  </a>
                                }
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                  </div>
                  <div className="juvly-subtitle">{this.state.clientsLang.client_brilliant_distinction_information}</div>
                  <div className="row">
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_account_number}</div>
                        <input autoComplete="new-password" className="setting-input-box" type="text" name='brilliant_acc_number' value={this.state.brilliant_acc_number} onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_password}</div>
                        <input autoComplete="new-password" className="setting-input-box" type="Password" name='brilliant_password' value={this.state.brilliant_password} onChange={this.handleInputChange} />
                      </div>
                    </div>
                  </div>
                  <div className="juvly-subtitle">{this.state.clientsLang.client_aspire_rewards_information}</div>
                  <div className="row">
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_email_address}</div>
                        <input autoComplete="new-password" className={this.state.aspireAccEmailClass} type="text" name='aspire_acc_email' value={this.state.aspire_acc_email} onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_password}</div>
                        <input autoComplete="new-password" className="setting-input-box" type="Password" name='aspire_password' value={this.state.aspire_password} onChange={this.handleInputChange} />
                      </div>
                    </div>
                  </div>
                  <div className="juvly-subtitle">{this.state.clientsLang.client_emergency_contact}</div>
                  <div className="row">
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_name}</div>
                        <input autoComplete="new-password" className="setting-input-box" type="text" name='emergency_contact_name' value={this.state.emergency_contact_name} onChange={this.handleInputChange} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.clientsLang.client_phone_number}</div>
                        <div className="setting-input-outer">

                        { (this.state.isRender) && <IntlTelInput
                            preferredCountries={['tw']}
                            css={ ['intl-tel-input', this.state.emergencyContactNumberClass] }
                            utilsScript={ 'libphonenumber.js' }
                            defaultValue = {(this.state.emergencyContactNumber) ? this.state.emergencyContactNumber : ''}
                            defaultCountry = {this.state.defaultCountry}
                            fieldName='emergencyContactNumber'
                            onPhoneNumberChange={ this.phoneNumberChanged.bind(this,'emergencyContactNumber') }
                            onPhoneNumberBlur={ this.phoneNumberChanged.bind(this,'emergencyContactNumber') }
                            placeholder={this.state.clientsLang.client_phone_number}
                            separateDialCode={`true`}
                          />
                        }</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-static">
              <a id="saveConsultation" className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.globalLang.label_save}</a>
              <Link to={this.state.backAction} className="new-white-btn pull-right">{this.state.globalLang.label_cancel}</Link>
            </div>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader clientProfileLoader' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
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
  if (state.ClientsReducer.action === "GET_CLIENT_DETAIL") {
    if (state.ClientsReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.clientData = state.ClientsReducer.data;
    }
  } else if (state.ClientsReducer.action === "CREATE_CLIENT") {
    if (state.ClientsReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.message = languageData.global[state.ClientsReducer.data.message];
      returnState.redirect = true;
    }
  } else if (state.ClientsReducer.action === "UPDATE_CLIENT") {
    if (state.ClientsReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.message = languageData.global[state.ClientsReducer.data.message];
      returnState.redirect = true;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getClientDetail: getClientDetail,
    createClient:createClient,
    updateClient:updateClient

  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(CreateEditClients);
