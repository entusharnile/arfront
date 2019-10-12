import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import axios from 'axios';
import { connect } from 'react-redux';
import IntlTelInput from 'react-intl-tel-input';
import { userProfile, createUser, getUser, fetchSelectMD, fetchClinics, deleteUser, getDefaultUserData } from '../../../../Actions/Settings/settingsActions.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import Select from 'react-select';
import { Link } from 'react-router-dom';
import config from '../../../../config';
import FileUploader from '../../../FileUploader/FileUploader.js';
import defLogo from '../../../../images/appmale.png';
import {setRedirectTo} from '../../../../Utils/services.js';

class CreateEditUser extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    let user = JSON.parse(localStorage.getItem('userData'))
    this.state = {
      accountType : (userData.account != undefined && userData.account.account_type != undefined) ? userData.account.account_type : 'trial',
      other_user_image: '',
      other_user_image_url: '',
      userData: {},
      firstnameMD: '',
      lastnameMD: '',
      address_line_1: '',
      address_line_2: '',
      address_line_3: '',
      address_line_4: '',
      bio_description: '',
      commission_percentage: '',
      bio_name: '',
      bio_title: '',
      contact_number_1: '',
      contact_number_2: '',
      contact_number_3: '',
      contact_number_4: '',
      commission_percentage: '',
      city: '',
      country: '',
      email_id: '',
      email_id_2: '',
      email_id_3: '',
      firstname: '',
      lastname: '',
      startFresh: true,
      showLoader: false,
      showModal: false,
      showPriceModal: false,
      user_changed: false,
      monthly_procedure_goal: '0',
      monthly_sales_goal: '0',
      pincode: '',
      weekly_sales_goal: '0',
      weekly_procedure_goal: '0',
      website: '',
      is_dashboard_enabled: true,
      supplementary_title: '',
      user_role_id: '',
      clinic_list: '',
      state: '',
      is_md_consent_required: false,
      md_user_id: '',
      is_available_online: true,
      userId: '',
      userChanged: false,
      firstnameClass: 'setting-input-box',
      lastnameClass: 'setting-input-box',
      email_idClass: 'setting-input-box',
      passcodeClass: 'setting-input-box',
      passwordClass: 'setting-input-box',
      bio_nameClass: 'setting-input-box',
      bio_descriptionClass: 'setting-input-box',
      stateClass: 'setting-input-box',
      cityClass: 'setting-input-box',
      countryClass: 'setting-input-box',
      commission_percentageClass: 'setting-input-box',
      clinic_name: '',
      clinicList: [],
      select_Default_Clinic: [],
      clinic_id: '',
      select_Role: '',
      select_clinics: '',
      clinics_array: [],
      password: '',
      pass_code: '',
      is_provider: false,
      rowDisplayEnable: 'row',
      rowDisplayDisable: 'row no-display',
      mdConsetDisplayEnable: 'setting-container work_as_provider_container border-top',
      mdConsetDisplayDisable: 'setting-container work_as_provider_container no-display',
      selectedOption: null,
      defaultOptions: [],
      select_RoleClass: 'setting-select-box',
      inputType: 'password',
      contactClass1: 'setting-input-box',
      contactClass2: 'setting-input-box',
      contactClass3: 'setting-input-box',
      contactClass4: 'setting-input-box',
      select_DefClinicClass: 'setting-select-box',
      dbfirstname: '',
      uploadedFile: '',
      dzImgObj: {},
      showLoader: false,
      loggedInUserId: user.user.id,
      loggedInAdminId: user.account.admin_id,
      loggedInUserType: user.user_type,
      loggedInUserPermissions: user.permissions,
      loggedInUserIsDemo: user.user.is_demo,
      settingsLang: languageData.settings,
      receive_checkin_sms: false,
      mdUserIdError: false,
      price_per_user: '',
      isShowDeleteButton: false,
      isShowPrivilegesButton: false,
      defaultCountry: localStorage.getItem('cCode'),
      isRender: false
      //select clinics, select default clinics, passcode, password
    };

    window.onscroll = () => {
      return false;
    }
    localStorage.setItem("showLoader", false);
  }
  showLoaderFunc = () => {
    this.setState({ showLoader: true });
    localStorage.setItem("showLoader", true);
  }
  componentDidMount() {
    let isShowDeleteButton = true;
    let isShowPrivilegesButton = false;
    if (this.state.loggedInUserId !== undefined) {
      if (this.state.loggedInUserId == this.props.match.params.userId) {
        isShowDeleteButton = false;
      } else if (this.state.loggedInAdminId == this.props.match.params.userId) {
        isShowDeleteButton = false;
      }
      if ((this.state.loggedInUserType == 'superadmin' || this.state.loggedInUserPermissions.indexOf('manage-user-roles') != -1) && (this.props.match.params.userId) && this.state.loggedInUserId != this.props.match.params.userId) {
        if (this.state.loggedInUserIsDemo == 0) {
          isShowPrivilegesButton = true
        }
      }
    }
    this.setState({ isShowDeleteButton: isShowDeleteButton, isShowPrivilegesButton: isShowPrivilegesButton })
    window.onscroll = () => {
      return false;
    }
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    let userId = (this.props.match.params.userId) ? this.props.match.params.userId : 0;
    let isRender = false;
    if (!userId) {
      isRender = true;
    }
    this.setState({
      validation_clinics_array_required: languageData.global['validation_clinics_array_required'],
      createUsers_Work_As_Provider: languageData.settings['createUsers_Work_As_Provider'],
      profile_first_name: languageData.settings['profile_first_name'],
      editUsers_Drop_Files_To_Upload: languageData.settings['editUsers_Drop_Files_To_Upload'],
      profile_last_name: languageData.settings['profile_last_name'],
      saveBtn: languageData.global['saveBtn'],
      editUsers_Edit_User: languageData.settings['editUsers_Edit_User'],
      editUsers_Clinic_Information: languageData.settings['editUsers_Clinic_Information'],
      editUsers_Dashboard_Access: languageData.settings['editUsers_Dashboard_Access'],
      editUsers_Yes: languageData.settings['editUsers_Yes'],
      editUsers_No: languageData.settings['editUsers_No'],
      editUsers_Select_Role: languageData.settings['editUsers_Select_Role'],
      editUsers_Select_clinics: languageData.settings['editUsers_Select_clinics'],
      editUsers_Select_Default_Clinic: languageData.settings['editUsers_Select_Default_Clinic'],
      editUsers_Website: languageData.settings['editUsers_Website'],
      editUsers_User_Information: languageData.settings['editUsers_User_Information'],
      editUsers_Supplementary_Title: languageData.settings['editUsers_Supplementary_Title'],
      editUsers_Email: languageData.settings['editUsers_Email'],
      editUsers_Password: languageData.settings['editUsers_Password'],
      editUsers_Passcode: languageData.settings['editUsers_Passcode'],
      editUsers_Generate_Passcode: languageData.settings['editUsers_Generate_Passcode'],
      editUsers_Provider_Address_Information: languageData.settings['editUsers_Provider_Address_Information'],
      editUsers_Contact_No_1: languageData.settings['editUsers_Contact_No_1'],
      editUsers_Contact_No_2: languageData.settings['editUsers_Contact_No_2'],
      editUsers_Contact_No_3: languageData.settings['editUsers_Contact_No_3'],
      editUsers_Contact_No_4: languageData.settings['editUsers_Contact_No_4'],
      editUsers_Email_2: languageData.settings['editUsers_Email_2'],
      editUsers_Email_3: languageData.settings['editUsers_Email_3'],
      editUsers_Address_Line_1: languageData.settings['editUsers_Address_Line_1'],
      editUsers_Address_Line_2: languageData.settings['editUsers_Address_Line_2'],
      editUsers_Address_Line_3: languageData.settings['editUsers_Address_Line_3'],
      editUsers_Zip_Code: languageData.settings['editUsers_Zip_Code'],
      editUsers_City: languageData.settings['editUsers_City'],
      editUsers_State: languageData.settings['editUsers_State'],
      editUsers_Country: languageData.settings['editUsers_Country'],
      editUsers_MD_Consent_Required: languageData.settings['editUsers_MD_Consent_Required'],
      editUsers_Is_availble_Smart_Booking: languageData.settings['editUsers_Is_availble_Smart_Booking'],
      editUsers_Provider_Goals: languageData.settings['editUsers_Provider_Goals'],
      editUsers_Monthly_Procedure_Goals: languageData.settings['editUsers_Monthly_Procedure_Goals'],
      editUsers_Weekly_Procedure_Goals: languageData.settings['editUsers_Weekly_Procedure_Goals'],
      editUsers_Monthly_Sales_Goals: languageData.settings['editUsers_Monthly_Sales_Goals'],
      editUsers_Weekly_Sales_Goals: languageData.settings['editUsers_Weekly_Sales_Goals'],
      editUsers_Bio_For_Appointment_Booking: languageData.settings['editUsers_Bio_For_Appointment_Booking'],
      editUsers_Display_Name: languageData.settings['editUsers_Display_Name'],
      editUsers_Display_title: languageData.settings['editUsers_Display_title'],
      editUsers_Bio: languageData.settings['editUsers_Bio'],
      editUsers_CancelBtn: languageData.settings['editUsers_CancelBtn'],
      privilege_admin: languageData.settings['privilege_admin'],
      privilege_front_desk_user: languageData.settings['privilege_front_desk_user'],
      privilege_md: languageData.settings['privilege_md'],
      privilege_provider: languageData.settings['privilege_provider'],
      user_Create_UserBtn: languageData.settings['user_Create_UserBtn'],
      editUsers_Select_MD: languageData.settings['editUsers_Select_MD'],
      showLoader: true,
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      Appointment_Reminder_Delete: languageData.settings['Appointment_Reminder_Delete'],
      settings_commission_percentage: languageData.settings['settings_commission_percentage'],
      settings_create_text_msg1: languageData.settings['settings_create_text_msg1'],
      settings_create_text_msg2: languageData.settings['settings_create_text_msg2'],
      currentUserId: (this.props.match.params.userId) ? this.props.match.params.userId : undefined,
      isRender: isRender
    })
    if (this.props.match.params.userId !== undefined) {
      this.props.getUser(this.props.match.params.userId, 'user');
    } else {
      this.props.getDefaultUserData();
      //this.setState({dbfirstname:'display profile image'})
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user !== undefined && prevProps.user.status === 200 && this.props.user !== undefined) {
      if (prevProps.user.data.user_image_url !== this.props.user.data.user_image_url) {
        if (this.props.user.data.user_image !== "") {
          this.setState({ defImageCls: 'no-display', cameraInPreviewCls: 'camra-icon dz-clickable camera-in-preview', dzCSS: '', other_user_image: this.props.user.data.user_image, other_user_image_url: this.props.user.data.user_image_url });
        } else {
          this.setState({ uploadedFile: this.props.user.data.user_image, other_user_image: this.props.user.data.user_image });
        }
        let reInitData = {};
        reInitData.dzImgObj = this.state.dzImgObj;
        reInitData.mockFile = { name: this.props.user.data.user_image_url, accepted: true, size: 7627 };
        reInitData.other_user_image_url = this.props.user.data.user_image_url;
        reInitData.other_user_image = this.props.user.data.user_image;
        this.refs.child.reInit(reInitData);
      }
    }
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value = target.value;
    switch (target.type) {
      case 'checkbox': {
        value = target.checked;
        break;
      }

      case 'radio': {
        value = (target.value == true || target.value == "true") ? true : false;
        break;
      }
    }
    this.setState({ [event.target.name]: value, userChanged: true });
  }

  handleChildChange = (stateToUpdate) => {
    this.setState(stateToUpdate);
  }

  handleUserRole = (e) => {
    this.setState({
      select_Role: e.target.value
    });
  }

  handleChange = (selectedOption) => {
    let returnState = {};

    let clinic_array = []
    if (selectedOption.length) {
      selectedOption.map((obj, idx) => {
        clinic_array.push(obj.value);
      })
    }

    returnState.clinics_array = clinic_array;
    if (selectedOption.length == 1) {
      returnState.clinic_id = selectedOption[0].value
    }
    returnState.select_Default_Clinic = selectedOption
    returnState.userChanged = true;
    this.setState(
      returnState
    );
  }

  changeInputType = () => {
    this.setState({
      inputType: (this.state.inputType == 'password') ? 'text' : 'password'
    });
  }

  getPassCode = () => {
    this.showLoaderFunc()
    axios.get(config.API_URL + `user/check-passcode`)
      .then(res => {
        this.setState({ pass_code: res.data.data.passcode, showLoader: false })
      })
      .catch(function (error) {
      });
  }

  phoneNumberChanged1 = (t, x, y, n) => {
    if (t) {
      this.setState({ contact_number_1: n.replace(/\s/g,''), contactClass1: 'setting-input-box', contactError: false, userChanged: true });
    } else {
      this.setState({ contactClass1: 'setting-input-box field_error', contactError: true, contact_number_1: n.replace(/\s/g,'') });
    }
  }
  phoneNumberChanged2 = (t, x, y, n) => {
    if (t) {
      this.setState({ contact_number_2: n.replace(/\s/g,''), contactClass2: 'setting-input-box', contactError: false, userChanged: true });
    } else {
      this.setState({ contactClass2: 'setting-input-box field_error', contactError: true, contact_number_2: n.replace(/\s/g,'') });
    }
  }

  phoneNumberChanged3 = (t, x, y, n) => {
    if (t) {
      this.setState({ contact_number_3: n.replace(/\s/g,''), contactClass3: 'setting-input-box', contactError: false, userChanged: true });
    } else {
      this.setState({ contactClass3: 'setting-input-box field_error', contactError: true, contact_number_3: n.replace(/\s/g,'') });
    }
  }

  phoneNumberChanged4 = (t, x, y, n) => {
    if (t) {
      this.setState({ contact_number_4: n.replace(/\s/g,''), contactClass4: 'setting-input-box', contactError: false, userChanged: true });
    } else {
      this.setState({ contactClass4: 'setting-input-box field_error', contactError: true, contact_number_4: n.replace(/\s/g,'') });
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();

    //---------------------Front-End Validation------------------------//

    let error = false;
    let regularExpression = /^[a-zA-Z]$/;

    this.setState({
      firstnameError: false,
      lastnameError: false,
      email_idError: false,
      passwordError: false,
      passcodeError: "",
      bio_nameError: false,
      bio_descriptionError: false,
      stateError: false,
      cityError: false,
      countryError: false,
      select_DefClinicError: false,
      commission_percentageError: false,
      select_Role: false
    });
    if (typeof this.state.firstname === undefined || this.state.firstname === null || this.state.firstname.trim() === '') {
      this.setState({
        firstnameError: true,
        firstnameClassError: 'setting-input-box field_error'
      })
      error = true;
    }
    if (this.state.firstname) {
      this.setState({
        firstnameError: false,
        firstnameClass: 'setting-input-box'
      })
    }
    if (typeof this.state.lastname === undefined || this.state.lastname === null || this.state.lastname.trim() === '') {
      this.setState({
        lastnameError: true,
        lastnameClassError: 'setting-input-box field_error'
      })
      error = true;
    }
    if (this.state.lastname) {
      this.setState({
        lastnameError: false,
        lastnameClass: 'setting-input-box'
      })
    }
    if (typeof this.state.email_id === undefined || this.state.email_id === null || this.state.email_id.trim() === '') {
      this.setState({
        email_idError: true,
        email_idClassError: 'setting-input-box field_error'
      })
      error = true;
    }
    if (!validator.isEmail(this.state.email_id)) {
      toast.error("Incorrect email address");
      error = true;
    }
    if (this.state.email_id) {
      this.setState({
        email_idError: false,
        email_idErrorClass: 'setting-input-box'
      })
    }
    if (this.state.is_provider === true || this.state.user_role_id == 2) {
      if (this.state.is_md_consent_required === true || this.state.is_md_consent_required === 'true') {
        if (!this.state.md_user_id) {
          this.setState({ mdUserIdError: true })
          error = true;
        }
      }
      if (typeof this.state.bio_name === undefined || this.state.bio_name === null || this.state.bio_name.trim() === '') {
        this.setState({
          bio_nameError: true,
          bio_nameClassError: 'setting-input-box field_error'
        })
        error = true;
      }
      if (this.state.bio_name) {
        this.setState({
          bio_nameError: false,
          bio_nameErrorClass: 'setting-input-box'
        })
      }
      if (typeof this.state.bio_description === undefined || this.state.bio_description === null || this.state.bio_description.trim() === '') {
        this.setState({
          bio_descriptionError: true,
          bio_descriptionClassError: 'setting-input-box field_error'
        })
        error = true;
      }
      if (this.state.bio_description) {
        this.setState({
          bio_descriptionError: false,
          bio_descriptionErrorClass: 'setting-input-box'
        })
      }
    }


    if (typeof this.state.state === undefined || this.state.state === null || this.state.state.trim() === '') {
      this.setState({
        stateError: true,
        stateClassError: 'setting-input-box field_error'
      })
      error = true;
    }
    if (this.state.state) {
      this.setState({
        stateError: false,
        stateErrorClass: 'setting-input-box'
      })
    }
    if (typeof this.state.city === undefined || this.state.city === null || this.state.city.trim() === '') {
      this.setState({
        cityError: true,
        cityClassError: 'setting-input-box field_error'
      })
      error = true;
    }
    if (this.state.city) {
      this.setState({
        cityError: false,
        cityErrorClass: 'setting-input-box'
      })
    }
    if (typeof this.state.country === undefined || this.state.country === null || this.state.country.trim() === '') {
      this.setState({
        countryError: true,
        countryClassError: 'setting-input-box field_error'
      })
      error = true;
    }
    if (this.state.country) {
      this.setState({
        countryError: false,
        countryErrorClass: 'setting-input-box'
      })
    }
    if (typeof this.state.user_role_id === undefined || this.state.user_role_id === null || this.state.user_role_id === '') {
      this.setState({
        select_RoleError: true,
        select_RoleClassError: 'setting-select-box field_error'
      })
      error = true;
    }
    if (this.state.select_Role) {
      this.setState({
        select_RoleError: false,
        select_RoleClass: 'setting-select-box'
      })
    }
    if (typeof this.state.pass_code === undefined || this.state.pass_code === null || this.state.pass_code === '') {
      this.setState({
        passcodeError: true,
        passcodeClassError: 'setting-input-box field_error'
      })
      error = true;
    }
    if (this.state.passcode) {
      this.setState({
        passcodeError: false,
        passcodeErrorClass: 'setting-input-box'
      })
    }
    if (this.props.match.params.userId === undefined) {
      if (typeof this.state.password === undefined || this.state.password === null || this.state.password === '') {
        this.setState({
          passwordError: true,
          passwordErrorClass: 'setting-input-box field_error'
        })
        error = true;
      }
      if (this.state.password) {
        this.setState({
          passwordError: false,
          passwordErrorClass: 'setting-input-box'
        })
      }
    }
    if (typeof this.state.clinic_id === undefined || this.state.clinic_id === null || this.state.clinic_id === '') {
      this.setState({
        select_DefClinicError: true,
        select_DefClinicClassError: 'setting-input-box field_error'
      })
      //error = true;
    }
    if (this.state.select_Default_Clinic) {
      this.setState({
        select_DefClinicError: false,
        select_DefClinicClassError: 'setting-input-box'
      })
    }


    if (error === true) {
      return;
    }
    var clinicVal = [];
    if (this.state.select_Default_Clinic != undefined && this.state.select_Default_Clinic.length > 0) {
      clinicVal = this.state.select_Default_Clinic.map((obj, idx) => {
        return obj.value
      })
    }
    if (!clinicVal.length) {
      if (this.state.clinics_array.length && this.state.clinicList != undefined && this.state.clinicList.length) {
        this.state.clinicList.map((obj, idx) => {
          if (this.state.clinics_array.indexOf(obj.id) > -1) {
            clinicVal.push(obj.id)
          }
        })
      }
    }

    if(clinicVal.length <= 0){
      toast.dismiss()
      toast.error(this.state.validation_clinics_array_required);
      return
    }


    //--------------------------------------------------End-Of-Validation----------------------------------------------------
    let formData = {
      clinics_array: clinicVal,
      address_line_1: this.state.address_line_1,
      address_line_2: this.state.address_line_2,
      address_line_3: this.state.address_line_3,
      address_line_4: this.state.address_line_4,
      bio_description: this.state.bio_description,
      contact_number_1: this.state.contact_number_1,
      contact_number_2: this.state.contact_number_2,
      contact_number_3: this.state.contact_number_3,
      contact_number_4: this.state.contact_number_4,
      city: this.state.city,
      country: this.state.country,
      commission_percentage: this.state.commission_percentage,
      email_id: this.state.email_id,
      email_id_2: this.state.email_id_2,
      email_id_3: this.state.email_id_3,
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      monthly_procedure_goal: this.state.monthly_procedure_goal,
      monthly_sales_goal: this.state.monthly_sales_goal,
      pincode: this.state.pincode,
      weekly_sales_goal: this.state.weekly_sales_goal,
      weekly_procedure_goal: this.state.weekly_procedure_goal,
      website: this.state.website,
      is_dashboard_enabled: (this.state.is_dashboard_enabled === true || this.state.is_dashboard_enabled === 'true') ? 0 : 1,
      supplementary_title: this.state.supplementary_title,
      user_role_id: this.state.user_role_id,
      state: this.state.state,
      is_md_consent_required: (this.state.is_md_consent_required) ? 1 : 0,
      md_user_id: (this.state.is_md_consent_required) ? this.state.md_user_id : 0,
      is_available_online: (this.state.is_available_online) ? 1 : 0,
      //clinic_name: this.state.clinic_name,
      clinic_id: this.state.clinic_id,
      pass_code: this.state.pass_code,
      is_provider: (this.state.is_provider == true) ? 1 : 0,
      user_image: this.state.other_user_image,
      receive_checkin_sms: (this.state.receive_checkin_sms == true) ? 1 : 0
    }
    //this.props.getUser(formData);
    if (this.state.is_provider || this.state.user_role_id == 2) {
      formData.bio_name = this.state.bio_name;
      formData.bio_title = this.state.bio_title;
      formData.bio_description = this.state.bio_description;
    }
    if (this.state.password != '') {
      formData.password = this.state.password
    }

    if (this.props.match.params.userId !== undefined) {
      this.showLoaderFunc()
      this.props.userProfile(formData, this.props.match.params.userId, 'user');
    }
    else {

      if(this.state.accountType === 'trial'){
        this.showLoaderFunc();
        this.props.createUser(formData);
      } else {
        this.setState({ showPriceModal: true, userFormData: formData })
      }
      //this.props.createUser(formData);
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.showLoader != undefined && props.showLoader == false) {
      if (localStorage.getItem("showLoader") == "false") {
        return { showLoader: false };
      }
    }
    if (props.userData != undefined && props.userData !== state.userData) {
      if (localStorage.getItem("showLoader") == "false") {
        let x = (state.userChanged) ? state.other_user_image : ((props.userData.user_image == null) ? '' : props.userData.user_image);
        let defClinicArr = []
        if (!state.userChanged) {
          if (props.userData.clinics_array.length && state.clinicList) {
            props.userData.clinics_array.map((obj, idx) => {
              let c = props.userData.clinics.find(y => y.id === obj);
              if (c)
                defClinicArr.push({ value: c.id, label: c.clinic_name })
            })
          }
        }
        return {
          userData: props.userData,
          showLoader: false,
          dbfirstname: props.userData.firstname,
          firstname: (state.userChanged) ? state.firstname : props.userData.firstname,
          lastname: (state.userChanged) ? state.lastname : props.userData.lastname,
          address_line_1: (state.userChanged) ? state.address_line_1 : props.userData.address_line_1,
          address_line_2: (state.userChanged) ? state.address_line_2 : props.userData.address_line_2,
          address_line_3: (state.userChanged) ? state.address_line_3 : props.userData.address_line_3,
          address_line_4: (state.userChanged) ? state.address_line_4 : props.userData.address_line_4,
          bio_description: (state.userChanged) ? state.bio_description : props.userData.bio_description,
          bio_name: (state.userChanged) ? state.bio_name : props.userData.bio_name,
          bio_title: (state.userChanged) ? state.bio_title : (props.userData.bio_title) ? props.userData.bio_title : '',
          contact_number_1: (state.userChanged) ? state.contact_number_1 : props.userData.contact_number_1,
          contact_number_2: (state.userChanged) ? state.contact_number_2 : props.userData.contact_number_2,
          contact_number_3: (state.userChanged) ? state.contact_number_3 : props.userData.contact_number_3,
          contact_number_4: (state.userChanged) ? state.contact_number_4 : props.userData.contact_number_4,
          city: (state.userChanged) ? state.city : props.userData.city,
          country: (state.userChanged) ? state.country : props.userData.country,
          commission_percentage: (state.userChanged) ? state.commission_percentage : ((props.userData.commission_percentage) ? props.userData.commission_percentage : ""),
          email_id: (state.userChanged) ? state.email_id : props.userData.email_id,
          email_id_2: (state.userChanged) ? state.email_id_2 : (props.userData.email_id_2) ? props.userData.email_id_2 : '',
          email_id_3: (state.userChanged) ? state.email_id_3 : (props.userData.email_id_3) ? props.userData.email_id_3 : '',
          monthly_procedure_goal: (state.userChanged) ? state.monthly_procedure_goal : props.userData.monthly_procedure_goal,
          monthly_sales_goal: (state.userChanged) ? state.monthly_sales_goal : props.userData.monthly_sales_goal,
          pincode: (state.userChanged) ? state.pincode : props.userData.pincode,
          weekly_sales_goal: (state.userChanged) ? state.weekly_sales_goal : props.userData.weekly_sales_goal,
          weekly_procedure_goal: (state.userChanged) ? state.weekly_procedure_goal : props.userData.weekly_procedure_goal,
          website: (state.userChanged) ? state.website : props.userData.website,
          is_dashboard_enabled: (state.userChanged) ? state.is_dashboard_enabled : ((props.userData.is_dashboard_enabled) ? true : false),
          supplementary_title: (state.userChanged) ? state.supplementary_title : props.userData.supplementary_title,
          user_role_id: (state.userChanged) ? state.user_role_id : props.userData.user_role_id,
          state: (state.userChanged) ? state.state : props.userData.state,
          is_md_consent_required: (state.is_md_consent_required) ? state.is_md_consent_required : ((props.userData.is_md_consent_required) ? true : false),
          md_user_id: (state.md_user_id) ? state.md_user_id : props.userData.md_user_id,
          is_available_online: (state.is_available_online) ? state.is_available_online : ((props.userData.is_available_online) ? true : false),
          is_provider: (state.userChanged) ? state.is_provider : props.userData.is_provider,
          clinics_array: (state.userChanged) ? state.clinics_array : props.userData.clinics_array,
          select_Default_Clinic: (state.userChanged) ? state.select_Default_Clinic : defClinicArr,
          clinic_id: (state.userChanged) ? state.clinic_id : props.userData.clinic_id,
          pass_code: (state.userChanged) ? state.pass_code : props.userData.pass_code,
          defaultOptions: (state.userChanged) ? state.defaultOptions : props.userData.defaultOptions,
          receive_checkin_sms: (state.userChanged) ? state.receive_checkin_sms : props.userData.receive_checkin_sms,
          other_user_image: (state.userChanged) ? state.other_user_image : ((props.userData.user_image == null) ? '' : props.userData.user_image),
          other_user_image_url: props.userData.user_image_url,
          role_id: props.userData.user_role_id,
          MDListData: props.userData.md_list,
          clinicList: props.userData.clinics,
          isRender: true
        };
      }
    }
    else if (
      props.defaultUserData != undefined &&
      props.defaultUserData !== state.defaultUserData
    ) {
      if (localStorage.getItem("showLoader") == "false") {
        let returnState = {};
        returnState.clinicList = (state.clinicList.length) ? state.clinicList : props.defaultUserData.clinics;
        returnState.MDListData = (state.userChanged) ? state.MDListData : props.defaultUserData.md_list;
        returnState.price_per_user = (state.userChanged) ? state.MDListData : props.defaultUserData.price_per_user;
        returnState.defaultUserData = props.defaultUserData;
        returnState.userChanged = false;
        returnState.showLoader = false;
        if (!state.currentUserId) {
          returnState.dbfirstname = "asd";
        }
        return returnState;
      }
    }
    else if (props.MDListData != undefined && props.MDListData.data !== state.MDListData) {
      if (localStorage.getItem("showLoader") == "false") {
        return {
          MDListData: (state.userChanged) ? state.MDListData : props.MDListData.data,
          userChanged: false,
          showLoader: false
        };
      }
    }
    else if (props.redirect !== undefined && props.redirect === true) {
      if (localStorage.getItem("showLoader") == "false") {
        if (props.redirectMode) {
          toast.error(props.message)
          props.history.push('/settings/users');
        } else {
          toast.success(props.message)
          props.history.push('/settings/users');
        }
      }
    }
    return null;
  }

  showDeleteModal = () => {
    this.setState({ showModal: true })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  showPriceModal = () => {
    this.setState({ showPriceModal: true })
  }

  dismissPriceModal = () => {
    this.setState({ showPriceModal: false })
  }

  deleteUserID = () => {
    this.dismissModal();
    let id = this.props.match.params.userId;
    this.showLoaderFunc();
    this.props.deleteUser(id);
  }

  createUserNow = () => {
    this.setState({ showPriceModal: false })
    this.showLoaderFunc();
    this.props.createUser(this.state.userFormData);
  }

  render() {
    var defaultOptions = [];
    if (this.state.clinics_array != undefined && this.state.clinics_array.length && this.state.clinicList != undefined && this.state.clinicList.length) {
      this.state.clinicList.map((obj, idx) => {
        if (this.state.clinics_array.indexOf(obj.id) > -1) {
          defaultOptions.push({ value: obj.id, label: obj.clinic_name })
        }
      })
    }

    var defaultClinics = this.state.select_Default_Clinic;
    /*if(this.state.select_Default_Clinic != undefined && this.state.select_Default_Clinic.length) {
      defaultClinics = this.state.select_Default_Clinic.map((lobj, lidx) => {
        return {value: lobj.value,  label: lobj.label}
      })
      defaultOptions = [];
      defaultOptions = this.state.select_Default_Clinic.map((lobj, lidx) => {
        return {value: lobj.value,  label: lobj.label}
      })
    } else {
      if(defaultOptions.length) {
        defaultClinics = defaultOptions;
      }
    }*/

    var options = [];
    if (this.state.clinicList != undefined && this.state.clinicList.length > 0) {
      options = this.state.clinicList.map((obj, idx) => {
        return { value: obj.id, label: obj.clinic_name }
      })
    }

    return (
      <div className="main protected">
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <form id="edit-user-form" name="login-form" className="nobottommargin" action="#" method="post" onSubmit={this.handleSubmit}>
                <div className="setting-container">
                  <div className="setting-title">
                    {this.props.match.params.userId ? this.state.editUsers_Edit_User : (this.state.accountType === 'trial') ? this.state.user_Create_UserBtn : (this.state.settings_create_text_msg1 +  ' ' + this.state.price_per_user + ' ' + this.state.settings_create_text_msg2)}
                    <Link to="/settings/users" className="pull-right crossIcon cancelAction"><img src="/images/close.png" /></Link>
                  </div>
                  <div className="row">
                    <div className="col-xs-12 profile-detail-left">
                      <div className="main-profile-picture">
                        {this.state.dbfirstname != '' && <FileUploader type='profile' uploadedFileName={'other_user_image'} fileUrl={'other_user_image_url'} other_user_image={this.state.other_user_image} other_user_image_url={this.state.other_user_image_url} defLogo={defLogo} handleChildChange={this.handleChildChange} ref="child" containerClass={'dropzone-holder'} />}
                      </div>
                      <div className="settings-subtitle">{this.state.editUsers_Clinic_Information}
                        <div className="pull-right dash-access-outer">
                          <span className="setting-text dash-access">{this.state.editUsers_Dashboard_Access}</span>
                          <input type="radio" name="is_dashboard_enabled" id="UserIsDashboardEnabled0" checked={this.state.is_dashboard_enabled} className="basic-form-checkbox" onChange={this.handleInputChange} value={true} />
                          <label htmlFor="UserIsDashboardEnabled0" className="basic-form-text">{this.state.editUsers_Yes}</label>
                          <input type="radio" name="is_dashboard_enabled" id="UserIsDashboardEnabled1" checked={!this.state.is_dashboard_enabled} className="basic-form-checkbox" onChange={this.handleInputChange} value={false} />
                          <label htmlFor="UserIsDashboardEnabled1" className="basic-form-text">{this.state.editUsers_No}</label>
                          {(this.state.isShowPrivilegesButton) && <Link to={"/settings/user-privileges/" + this.state.currentUserId + '/role/' + this.state.role_id} className="new-blue-btn pull-right edit_setting" id="manage-privileges">Manage Privileges</Link>}

                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Select_Role} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <select name="user_role_id" className={(this.state.select_RoleError === true) ? this.state.select_RoleClassError : this.state.select_RoleClass} onChange={this.handleInputChange} value={this.state.user_role_id}>
                                <option value>Select</option>
                                <option value='1'>{this.state.privilege_admin}</option>
                                <option value='2'>{this.state.privilege_provider}</option>
                                <option value='3'>{this.state.privilege_front_desk_user}</option>
                                <option value='4'>{this.state.privilege_md}</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-8">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Select_clinics} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <div className="tag-auto-select">
                                {
                                  options && <Select
                                    name="clinic_list"
                                    onChange={this.handleChange}
                                    value={defaultOptions}
                                    isClearable
                                    isSearchable
                                    options={options}
                                    isMulti={true}
                                  />
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Select_Default_Clinic}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer">

                              <select name="clinic_id" className={(this.state.select_DefClinicError === true) ? this.state.select_DefClinicClassError : this.state.select_DefClinicClass} onChange={this.handleInputChange} value={this.state.clinic_id} >
                                <option disabled="disabled" >Select</option>
                                {
                                  defaultClinics.map((lobj, lidx) => {
                                    return (
                                      <option value={lobj.value} key={lobj.value} >{lobj.label}</option>
                                    )
                                  })}
                              </select>

                            </div>
                          </div>
                        </div>
                        <div className="col-lg-8">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Website}</div>
                            <div className="setting-input-outer">
                              <input name="website" id="website1" className="setting-input-box" maxLength={500} type="text" value={(this.state.website !== null) ? this.state.website : ""} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                      </div>
                      <div className="settings-subtitle">{this.state.editUsers_User_Information}</div>
                      <div className="row">
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Supplementary_Title}</div>
                            <div className="setting-input-outer">
                              <input name="supplementary_title" id="supplementary_title" className="setting-input-box" type="text" value={(this.state.supplementary_title) ? this.state.supplementary_title : ""} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.profile_first_name}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="firstname" id="firstname" className={(this.state.firstnameError === true) ? this.state.firstnameClassError : this.state.firstnameClass} maxLength={255} type="text" value={this.state.firstname} onChange={this.handleInputChange} autoComplete="off" />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.profile_last_name}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="lastname" id="lastname" className={this.state.lastnameError === true ? this.state.lastnameClassError : this.state.lastnameClass} maxLength={255} type="text" value={this.state.lastname} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Email} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="email_id" id="user_email" className={this.state.email_idError === true ? this.state.email_idClassError : this.state.email_idClass} maxLength="500" type="text" value={this.state.email_id} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Password}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer hide-pwd-outer">
                              <input name="password" id="password" className={this.state.passwordError === true ? this.state.passwordErrorClass : this.state.passwordClass} value={this.state.password} type={this.state.inputType} autoComplete="new-password" onChange={this.handleInputChange} />	<div className="hidePassword" onClick={this.changeInputType} >
                                <i className="fas fa-eye" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer passcode">
                            <div className="new-field-label">{this.state.editUsers_Passcode}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="pass_code" type="text" className={this.state.passcodeError === true ? this.state.passcodeClassError : this.state.passcodeClass} value={(this.state.pass_code) ? this.state.pass_code : ""} onChange={this.handleInputChange} />
                            </div>
                          </div>
                          <a id="generate_number" className="new-white-btn pull-right gene-pascod" onClick={this.getPassCode}>{this.state.editUsers_Generate_Passcode}</a>
                        </div>
                      </div>
                      <div className="settings-subtitle">{this.state.editUsers_Provider_Address_Information}</div>
                      <div className="row">
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Contact_No_1}</div>
                            <div className="setting-input-outer flag-input">
                              <input type="hidden" name="full_number" />

                              {(this.state.isRender) && <IntlTelInput className="form-control"
                                utilsScript={'libphonenumber.js'}
                                css={['intl-tel-input', this.state.contactClass1]}
                                defaultValue={(this.state.contact_number_1) ? this.state.contact_number_1 : ''}
                                defaultCountry={this.state.defaultCountry}
                                fieldName='contact_number_1'
                                onPhoneNumberChange={this.phoneNumberChanged1}
                                onPhoneNumberBlur={this.phoneNumberChanged1}
                                fieldId='contact_number_1'
                                placeholder="Phone Number"
                                autoPlaceholder={true}
                                separateDialCode={`true`}
                              />}
                              <input type="hidden" name="data[User][full_number]" id="full_number" />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Contact_No_2}</div>
                            <div className="setting-input-outer flag-input">
                              <input type="hidden" name="full_number_2" />
                              {(this.state.isRender) && <IntlTelInput className="form-control"
                                utilsScript={'libphonenumber.js'}
                                css={['intl-tel-input', this.state.contactClass2]}
                                defaultValue={(this.state.contact_number_2) ? this.state.contact_number_2 : ''}
                                defaultCountry={this.state.defaultCountry}
                                fieldName='contact_number_2'
                                onPhoneNumberChange={this.phoneNumberChanged2}
                                fieldId='contact_number_2'
                                placeholder="Phone Number"
                                autoPlaceholder={true}
                                separateDialCode={`true`}
                              />}
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Contact_No_3}</div>
                            <div className="setting-input-outer flag-input">
                              <input type="hidden" name="full_number_3" />
                              {(this.state.isRender) && <IntlTelInput className="form-control"
                                utilsScript={'libphonenumber.js'}
                                css={['intl-tel-input', this.state.contactClass3]}
                                defaultValue={(this.state.contact_number_3) ? this.state.contact_number_3 : ''}
                                defaultCountry={this.state.defaultCountry}
                                fieldName='contact_number_3'
                                onPhoneNumberChange={this.phoneNumberChanged3}
                                ifieldIdd='contact_number_3'
                                placeholder="Phone Number"
                                autoPlaceholder={true}
                                separateDialCode={`true`}
                              />}
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Contact_No_4}</div>
                            <div className="setting-input-outer flag-input">
                              <input type="hidden" name="full_number_4" />
                              {(this.state.isRender) && <IntlTelInput className="form-control"
                                utilsScript={'libphonenumber.js'}
                                css={['intl-tel-input', this.state.contactClass4]}
                                defaultValue={(this.state.contact_number_4) ? this.state.contact_number_4 : ''}
                                defaultCountry={this.state.defaultCountry}
                                fieldName='contact_number_4'
                                onPhoneNumberChange={this.phoneNumberChanged4}
                                fieldId='contact_number_4'
                                placeholder="Phone Number"
                                autoPlaceholder={true}
                                separateDialCode={`true`}
                              />}
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Email_2} </div>
                            <div className="setting-input-outer">
                              <input name="email_id_2" id="email_id_2" className="setting-input-box" type="text" value={this.state.email_id_2} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Email_3}</div>
                            <div className="setting-input-outer">
                              <input name="email_id_3" id="email_id_3" className="setting-input-box" type="text" value={this.state.email_id_3} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Address_Line_1}</div>
                            <div className="setting-input-outer">
                              <input name="address_line_1" className="setting-input-box" id="address_line_1" value={(this.state.address_line_1) ? this.state.address_line_1 : ""} onChange={this.handleInputChange} maxLength={500} type="text" autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Address_Line_2}</div>
                            <div className="setting-input-outer">
                              <input name="address_line_2" className="setting-input-box" id="address_line_2" maxLength={500} type="text" value={(this.state.address_line_2) ? this.state.address_line_2 : ""} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Address_Line_3}</div>
                            <div className="setting-input-outer">
                              <input name="address_line_3" className="setting-input-box" id="address_line_3" maxLength={500} type="text" value={(this.state.address_line_3) ? this.state.address_line_3 : ""} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Zip_Code}</div>
                            <div className="setting-input-outer">
                              <input name="pincode" className="setting-input-box" id="pincode" maxLength={255} value={(this.state.pincode) ? this.state.pincode : ""} onChange={this.handleInputChange} type="text" autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_City} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="city" id="city" className={this.state.cityError === true ? this.state.cityClassError : this.state.cityClass} maxLength={255} value={(this.state.city) ? this.state.city : ""} onChange={this.handleInputChange} type="text" autoComplete="off" />	</div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_State} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="state" id="state" className={this.state.stateError === true ? this.state.stateClassError : this.state.stateClass} maxLength={255} type="text" value={this.state.state} onChange={this.handleInputChange} autoComplete="off" />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Country} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="country" id="country" className={this.state.countryError === true ? this.state.countryClassError : this.state.countryClass} maxLength={255} value={this.state.country} onChange={this.handleInputChange} type="text" autoComplete="off" />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className={(this.state.is_provider == true) ? "setting-field-outer" : 'no-display'} >
                            <div className="new-field-label">{this.state.settings_commission_percentage}</div>
                            <div className="setting-input-outer">
                              <input name="commission_percentage" id="commission_percentage" className={this.state.stateClass} maxLength={255} type="text" value={this.state.commission_percentage} onChange={this.handleInputChange} autoComplete="off" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={this.state.user_role_id == 2 ? 'no-display' : "setting-container border-top work_as_provider_container"}>
                  <div className="setting-title no-margin" id="work_as_provider_box">{this.state.createUsers_Work_As_Provider}
                    <label className="setting-switch pull-right" >
                      <input type="checkbox" name="is_provider" className="setting-custom-switch-input" checked={(this.state.is_provider) ? 'checked' : false} onChange={this.handleInputChange} />
                      <span className="setting-slider"></span>
                    </label>
                  </div>
                </div>
                <div className={((this.state.user_role_id == 2) || this.state.is_provider == true) ? this.state.mdConsetDisplayEnable : this.state.mdConsetDisplayDisable}>
                  <div className="row is-provider-form-title" >
                    <div className="col-xs-12 profile-detail-left">
                      <div className="row">
                        <div className="col-lg-7 col-md-12">{this.state.editUsers_MD_Consent_Required}<span className="setting-require">*</span></div>
                        <div className="col-lg-5 col-md-12">
                          <div className="basic-checkbox-outer">
                            <input id="radiobutton1" className="basic-form-checkbox md_consent_required" name="is_md_consent_required" type="radio"
                              checked={this.state.is_md_consent_required} className="basic-form-checkbox"
                              value={true} onChange={this.handleInputChange} />
                            <label className="basic-form-text" htmlFor="radiobutton1">{this.state.editUsers_Yes}</label>
                          </div>
                          <div className="basic-checkbox-outer">
                            <input id="radiobutton2" className="basic-form-checkbox md_consent_required" name="is_md_consent_required" type="radio" checked={!this.state.is_md_consent_required} value={false} onChange={this.handleInputChange} />
                            <label className="basic-form-text" htmlFor="radiobutton2">{this.state.editUsers_No}</label>
                          </div>
                        </div>
                      </div>

                      <div className={(this.state.is_md_consent_required === 'true' || this.state.is_md_consent_required == true) ? this.state.rowDisplayEnable : this.state.rowDisplayDisable} id="select_md_consent">
                        <div className="col-lg-5 ">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Select_MD}<span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <select name="md_user_id" id="md_user_id" className={(this.state.mdUserIdError) ? "setting-select-box field_error" : "setting-select-box"} value={this.state.md_user_id} onChange={this.handleInputChange}>
                                <option value={0} onChange={this.handleInputChange}>Select</option>
                                {
                                  this.state.MDListData !== undefined && this.state.MDListData !== null && this.state.MDListData.map((obj, idx) => {
                                    return (
                                      <option key={idx} value={obj.id} onChange={this.handleInputChange}>{obj.firstname} {obj.lastname}</option>
                                    )
                                  })
                                }
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-lg-7 col-md-12">
                          {this.state.editUsers_Is_availble_Smart_Booking}
                        </div>
                        <div className="col-lg-5 col-md-12">
                          <div className="basic-checkbox-outer">
                            <input id="radiobutton3" className="basic-form-checkbox" name="is_available_online" type="radio" value='true' onChange={this.handleInputChange} checked={this.state.is_available_online} />
                            <label className="basic-form-text" htmlFor="radiobutton3">{this.state.editUsers_Yes}</label>
                          </div>
                          <div className="basic-checkbox-outer">
                            <input id="radiobutton4" className="basic-form-checkbox" name="is_available_online" type="radio" value='false' checked={!this.state.is_available_online} onChange={this.handleInputChange} />
                            <label className="basic-form-text" htmlFor="radiobutton4">{this.state.editUsers_No}</label>
                          </div>
                        </div>
                      </div>
                      <div className="settings-subtitle m-t-20">{this.state.editUsers_Provider_Goals}</div>
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Monthly_Procedure_Goals}</div>
                            <div className="setting-input-outer">
                              <input name="monthly_procedure_goal" id="monthly_goal" className="setting-input-box" maxLength={11} value={this.state.monthly_procedure_goal} onChange={this.handleInputChange} type="text" autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Weekly_Procedure_Goals}</div>
                            <div className="setting-input-outer">
                              <input name="weekly_procedure_goal" id="monthly_goal1" className="setting-input-box" maxLength={11} value={this.state.weekly_procedure_goal} onChange={this.handleInputChange} type="text" autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Monthly_Sales_Goals}</div>
                            <div className="setting-input-outer">
                              <input name="monthly_sales_goal" id="monthly_goal2" className="setting-input-box" type="text" value={this.state.monthly_sales_goal} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Weekly_Sales_Goals}</div>
                            <div className="setting-input-outer">
                              <input name="weekly_sales_goal" id="monthly_goal3" className="setting-input-box" type="text" value={this.state.weekly_sales_goal} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                      </div>
                      <div className="settings-subtitle m-t-20">{this.state.editUsers_Bio_For_Appointment_Booking}</div>
                      <div className="row ">
                        <div className="col-lg-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Display_Name} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="bio_name" id="bio_name" className={this.state.bio_nameError === true ? this.state.bio_nameClassError : this.state.bio_nameClass} maxLength={255} type="text" value={this.state.bio_name} onChange={this.handleInputChange} autoComplete="off" /></div>

                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Display_title}</div>
                            <div className="setting-input-outer">
                              <input name="bio_title" id="bio_title" className="setting-input-box" maxLength={255} type="text" value={this.state.bio_title} onChange={this.handleInputChange} autoComplete="off" /></div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.editUsers_Bio} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer">
                              <input name="bio_description" id="bio_description" className={this.state.bio_descriptionError === true ? this.state.bio_descriptionClassError : this.state.bio_descriptionClass} value={this.state.bio_description} onChange={this.handleInputChange} type="text" autoComplete="off" /></div>
                          </div>
                          <div className="m-b-30 pull-left">
                            <input type="checkbox" className="new-check child_view-patients" id="recieveCheckInSms" name="receive_checkin_sms" checked={(this.state.receive_checkin_sms) ? 'checked' : false} onChange={this.handleInputChange} />
                            <label className="setting-text" htmlFor="view-patients">{this.state.settingsLang.receive_checkin_sms_text}</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="footer-static">
                  <input className="new-blue-btn pull-right" id="editsave" type="submit" value="Save" />
                  <Link to="/settings/users" className="new-white-btn pull-right cancelAction">
                    Cancel
              </Link>
                  {(this.state.isShowDeleteButton) &&
                    <button type="button" className={this.props.match.params.userId ? "new-red-btn pull-left" : "no-display"} id="resetform" onClick={this.showDeleteModal} data-message={this.state.settingsLang.settings_are_you_sure_del_PTI} >{this.state.Appointment_Reminder_Delete}</button>
                  }
                  <div className={(this.state.showModal ? 'overlay' : '')}></div>
                  <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                          <h4 className="modal-title" id="model_title">{this.state.settingsLang.settings_Confirmation_required}{this.state.showModal}</h4>
                        </div>
                        <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                          {this.state.settingsLang.settings_del_PTI}
                        </div>
                        <div className="modal-footer" >
                          <div className="col-md-12 text-left" id="footer-btn">
                            <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.settingsLang.no_option}</button>
                            <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteUserID}>{this.state.settingsLang.yes_option}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={(this.state.showPriceModal ? 'overlay' : '')}></div>
                  <div id="filterModal" role="dialog" className={(this.state.showPriceModal ? 'modal fade in displayBlock' : 'modal fade')}>
                    <div className="modal-dialog">
                      <div className="modal-content">
                        <div className="modal-header">
                          <button type="button" className="close" data-dismiss="modal" onClick={this.dismissPriceModal}>×</button>
                          <h4 className="modal-title" id="model_title">Charges</h4>
                        </div>
                        <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                          You will be charged {this.state.price_per_user} by adding this user. Are you sure you want to continue?
                      </div>
                        <div className="modal-footer" >
                          <div className="col-md-12 text-left" id="footer-btn">
                            <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissPriceModal}>{this.state.settingsLang.no_option}</button>
                            <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.createUserNow}>{this.state.settingsLang.yes_option}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
  const returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  toast.dismiss();
  localStorage.setItem("showLoader", false);
  if (state.SettingReducer.action === "USER_GET") {
    if (state.SettingReducer.data.status != 200) {
      returnState.redirect = true;
      returnState.redirectMode = 'error';
      returnState.message = languageData.global[state.SettingReducer.data.message];
    }
    else {
      returnState.userData = state.SettingReducer.data.data
    }
  }

  if (state.SettingReducer.action === "MDS_LIST") {
    if (state.SettingReducer.data.status != 200) {
      returnState.showLoader = false
    }
    else {
      returnState.MDListData = state.SettingReducer.data
    }
  }

  if (state.SettingReducer.action === "USER_CREATE") {
    if (state.SettingReducer.data.status != 201) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.updateData = state.SettingReducer.data
      returnState.showLoader = false
    }
    else {
      returnState.redirect = true;
      returnState.message = languageData.global[state.SettingReducer.data.message];
    }
  }

  if (state.SettingReducer.action === "DEFAULT_USERADD_DATA") {
    if (state.SettingReducer.data.status != 200) {
      returnState.showLoader = false
    }
    else {
      returnState.defaultUserData = state.SettingReducer.data.data
    };
  }
  if (state.SettingReducer.action === "USER_DELETE") {
    if (state.SettingReducer.data.status != 200) {
      returnState.showLoader = false
    }
    else {
      returnState.redirect = true;
      returnState.message = languageData.global[state.SettingReducer.data.message]
    }
  }
  if (state.SettingReducer.action === "USER_UPDATE") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    }
    else {
      // update localStorage data if logged-user update user-data (in case of self) - START
      if(state.SettingReducer.data.data !== undefined && state.SettingReducer.data.data.login_data !== undefined){
        let login_data = state.SettingReducer.data.data.login_data;
        if(login_data && login_data.user_role_id > 0){
          let userData = JSON.parse(localStorage.getItem('userData'));
          userData.user = login_data
          localStorage.setItem('currentUserRole', login_data.user_role_id);
          localStorage.setItem('userData', JSON.stringify(userData))
          returnState.status = 200;
        }
      }
      // update localStorage data if logged-user update user-data (in case of self) - END

      returnState.redirect = true;
      returnState.message = languageData.global[state.SettingReducer.data.message];
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getUser: getUser, fetchClinics: fetchClinics,
    userProfile: userProfile, createUser: createUser, fetchSelectMD: fetchSelectMD, deleteUser: deleteUser, getDefaultUserData: getDefaultUserData
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateEditUser);
