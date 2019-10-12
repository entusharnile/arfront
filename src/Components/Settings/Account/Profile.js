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
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types';
import config from '../../../config';
import axios from 'axios';
import Sidebar from '../../../Containers/Settings/sidebar.js';
import IntlTelInput from 'react-intl-tel-input';
import { getUser, userProfile, uploadImage, uploadBase64Image,  disableGoogleCalendarSync,exportEmptyData } from '../../../Actions/Settings/settingsActions.js';
import defLogo from '../../../images/appmale.png';
import { getToken, isFormSubmit,setRedirectTo } from '../../../Utils/services.js';
import { SketchField, Tools } from 'react-sketch';
import FileUploader from '../../FileUploader/FileUploader.js';

class Profile extends Component {

    interval = null;

    static defaultProps = {
        width: 400,
        height: 200,
        color: '#000',
        size: 5,
        fillColor: '',
        canvasClassName: 'canvas',
        debounceTime: 1000,
        animate: true,
        userChanged:false

    };

    constructor(props) {
        super(props);

        this.state = {
            icon: 'faAngleDown',
            clicked: false,
        }

        const userData = JSON.parse(localStorage.getItem('userData'));
        const languageData  = JSON.parse(localStorage.getItem('languageData'));
        this.state = {
            globalLang : languageData.global,
            pictures: [],
            timezones: [],
            userId: userData.user.id,
            firstname: '',
            lastname: '',
            email_id: '',
            password: '',
            old_password: '',
            repeat_password: '',
            contact_number_1: '',
            file: '',
            file_name: '',
            defaultCountry: localStorage.getItem('cCode'),
            contactClass: 'setting-input-box',
            firstnameClass: 'setting-input-box',
            lastnameClass: 'setting-input-box',
            email_idClass: 'setting-input-box',
            passwordClass: 'passwordclassName setting-input-box',
            oldPasswordClass: 'passwordclassName setting-input-box',
            repeatpasswordClass: 'passwordclassName setting-input-box',
            userChanged: false,
            contactError: false,
            user_image: '',
            signature: '',
            canvasClass: 'signature-box sig-div ',
            inputOut: 'input-outer',
            clearClass: 'new-white-btn no-margin clear no-display',
            resetClass: 'new-blue-btn reset no-display m-l-10',
            changeClass: 'new-blue-btn no-margin Change m-l-10',
            defImageCls: 'no-display',
            cameraInPreviewCls: 'camra-icon dz-clickable no-image',
            uploadedFile: '',
            dzImgObj: {},
            user_image_url: '',
            dzCSS: '',
            show_signature_popup : false,
            google_calender_sync : false,
            dbfirstname: '',
            uploadedSignature: '',
            uploadedSignature_url:'',
            userDetails:{},
            showLoader: false,

            google_oauth_url: ''
        };

    }

    handleInputChange = (event) => {
        const target = event.target;
        let value = target.value;
        switch (target.type) {
          case 'checkbox':
          {
              value = target.checked;
              break;
          }
          case 'file':
          {
              value = target.files[0];
              break;
          }
        }

        this.setState({
          [event.target.name]: value, userChanged: true });
        }

    phoneNumberChanged = (t, x, y, number) => {
        if(t) {
          //this.setState({contact_number_1: '+'+y.dialCode+x, contactClass : 'setting-input-box', contactError: false });
          this.setState({contact_number_1: number.replace(/\s/g,''), contactClass : 'setting-input-box', contactError: false });
        } else {
          this.setState({contactClass:  'setting-input-box setting-input-box-invalid', contactError: true});
        }

    }
    componentDidUpdate(prevProps) {
        if (prevProps.user !== undefined && prevProps.user.status === 200 && this.props.user !== undefined ) {
          if (prevProps.user.data.user_image_url !== this.props.user.data.user_image_url) {

            if (this.props.user.data.user_image !== "") {
                this.setState({ defImageCls: 'no-display', cameraInPreviewCls: 'camra-icon dz-clickable camera-in-preview', dzCSS: '', user_image :  this.props.user.data.user_image, user_image_url : this.props.user.data.user_image_url});
            } else {
                this.setState({ uploadedFile: this.props.user.data.user_image, user_image: this.props.user.data.user_image });
            }

            let reInitData = {};

            reInitData.dzImgObj = this.state.dzImgObj;
            reInitData.mockFile = {name:this.props.user.data.user_image_url, accepted: true, size: 7627};
            reInitData.user_image_url = this.props.user.data.user_image_url;
            reInitData.user_image = this.props.user.data.user_image;
            this.refs.child.reInit(reInitData);
        }
      }
    }

    handleSubmit = (event) => {
      if(isFormSubmit()){
        event.preventDefault();
        //====Frontend validation=================
        let error = false;
        let regularExpression = /^(?=.{8,})(?=.*[A-Z])(?=.*[`~*-/\[\]\\|{}().:;,''""!_<>-@#$%^&+=]).*$/
        let passError = false;

        this.setState({
            firstnameError: false,
            lastnameError: false,
            email_idError: false,
            oldPassError: false,
            passwordError: false,
            repeatpasswordError: false,
            old_passwordError: "",
            repeat_passwordError: "",
            timezoneError: false,
        });
        if (typeof this.state.firstname === undefined || this.state.firstname === null || this.state.firstname === '' || this.state.firstname.trim() == "") {
            this.setState({
                firstnameError: true,
                firstnameClassError: 'setting-input-box setting-input-box-invalid'
            })
            error = true;
        } else if (this.state.firstname) {
            this.setState({
                firstnameError: false,
                firstnameClass: 'setting-input-box'
            })
        }
        if (typeof this.state.lastname === undefined || this.state.lastname === null || this.state.lastname === '' || this.state.lastname.trim() == "") {
            this.setState({
                lastnameError: true,
                lastnameClassError: 'setting-input-box setting-input-box-invalid'
            })
            error = true;
        } else if (this.state.lastname) {
            this.setState({
                lastnameError: false,
                lastnameClass: 'setting-input-box'
            })
        }

        if(this.state.contactError) {
          error = true;
        }
        if (typeof this.state.email_id === undefined || this.state.email_id === null || this.state.email_id === '' || this.state.email_id.trim() == "") {
            this.setState({
                email_idError: true,
                email_idClassError: 'setting-input-box setting-input-box-invalid'
            })
            error = true;
        } else if (!validator.isEmail(this.state.email_id)) {
            toast.error("Incorrect email address");
            error = true;
        } else if (this.state.email_id) {
            this.setState({
                email_idError: false,
                email_idErrorClass: 'setting-input-box'
            })
        }

        if (typeof this.state.timezone === undefined || this.state.timezone === null || this.state.timezone === '') {
            this.setState({
                timezoneError: true,
            })
            error = true;
        } else if (this.state.timezone) {
            this.setState({
                timezoneError: false,
            })
        }
        if(this.state.repeat_password === '' && this.state.password === '' && this.state.old_password === '') {
          passError = true;
        } else {
          if (this.state.old_password === undefined || this.state.old_password === null || this.state.old_password === '') {
              this.setState({
                  oldPassError: true,
                  oldPasswordClassError: 'setting-input-box setting-input-box-invalid'
              })
              error = true;
          } else if (this.state.old_password) {
              this.setState({
                  oldPassError: false,
                  oldPassword: 'setting-input-box'
              })
          }

          if (this.state.password === undefined || this.state.password === null || this.state.password === '' ) {
              this.setState({
                  passwordError: true,
                  passwordClassError: 'setting-input-box setting-input-box-invalid'
              })
              error = true;
          } else if (this.state.password) {
              this.setState({
                  passwordError: false,
                  passwordClassError: 'setting-input-box'
              })
              if (this.state.password.length < 8) {
                this.setState({
                    passwordError: true,
                    passwordClassError: 'setting-input-box setting-input-box-invalid'
                })
                error = true;
                toast.error(this.state.globalLang.signup_error_password_length);
                return false;

              } else if (!regularExpression.test(this.state.password)) {
                this.setState({
                    passwordError: true,
                    passwordClassError: 'setting-input-box setting-input-box-invalid'
                })
                error = true;
                toast.error(this.state.globalLang.signup_error_password_combination);
                return false;
              } else {
                this.setState({
                    passwordError: false,
                    passwordClassError: 'setting-input-box'
                })
              }
          }

          if (this.state.repeat_password === undefined || this.state.repeat_password === null || this.state.repeat_password === '') {
              this.setState({
                  repeatpasswordError: true,
                  repeatpasswordClassError: 'setting-input-box setting-input-box-invalid'
              })
              error = true;
          } else if (this.state.repeat_password) {
              this.setState({
                  repeatpasswordError: false,
                  repeatpassword: 'setting-input-box'
              })
          }

          if (this.state.password !== this.state.repeat_password) {
              this.setState({
                  passwordError: true,
                  passwordClassError: 'setting-input-box setting-input-box-invalid'

              })
              error = true;
              toast.error(this.state.globalLang.signup_confirm_password_same);
              return false;
          }
          else if (this.state.password) {
              this.setState({
                  passwordError: false,
                  passwordClassError: 'setting-input-box'
              })
          }

           /*if ((this.state.password !== '') === this.state.repeat_password) {
              this.setState({
                  passwordError: false,
                  passwordErrorClass: 'setting-input-box'
              })
          } else if (this.state.password === null) {
              this.setState({
                  passwordError: true,
                  passwordClassError: 'setting-input-box setting-input-box-invalid'
              })
              error = true;
          } else if (!regularExpression.test(this.state.password)) {
              toast.error("New Password and Repeat Password doesn't match!");
              return false;
              error = true;
          }*/
        }

        if (error === true) {
            return;
        }

        let formData = {
            firstname: this.state.firstname,
            lastname: this.state.lastname,
            email_id: this.state.email_id,
            contact_number_1: this.state.contact_number_1,
            show_signature_popup: this.state.show_signature_popup ? 1 : 0,
            user_image: this.state.user_image,
            timezone: this.state.timezone
            //signature: (this.state.uploadedSignature) ? this.state.uploadedSignature : this.state.signature,
        }
        if(!passError) {
          formData.password = this.state.password;
          formData.old_password = this.state.old_password;
        }
        this.setState({showLoader : true})
        this.props.userProfile(formData, this.state.userId, 'profile');
      }
    }

    static getDerivedStateFromProps(props, state) {
      if(props.showLoader != undefined && props.showLoader == false) {
          props.exportEmptyData();
          return {showLoader : false};

       }
        let returnState = {};
        if (props.user !== undefined && props.user.status === 200 && props.user.data !== state.userDetails ) {
          if(props.user.data.signature_url == "") {
            returnState.canvasClass = 'signature-box sig-div';
            returnState.inputOut = 'input-outer no-display';
            returnState.clearClass = 'new-white-btn no-margin clear';
            returnState.resetClass = 'new-blue-btn reset ';
            returnState.changeClass = 'new-blue-btn no-margin Change no-display';
          } else {
            returnState.canvasClass = 'signature-box sig-div no-display';
            returnState.inputOut = 'input-outer';
            returnState.clearClass = 'new-white-btn no-margin clear no-display';
            returnState.resetClass = 'new-blue-btn reset no-display';
            returnState.changeClass = 'new-blue-btn no-margin Change ';
          }
          returnState.userDetails  = props.user.data;
          returnState.timezones  = props.user.data.timezones;
          returnState.timezone  = props.user.data.timezone;
          returnState.showLoader  = false;
          returnState.firstname =  props.user.data.firstname;
          returnState.lastname =  props.user.data.lastname;
          returnState.email_id =  props.user.data.email_id;
          returnState.old_password =  '';
          returnState.password =  '';
          returnState.repeat_password =  '';
          returnState.contact_number_1 =   props.user.data.contact_number_1;
          returnState.user_image =  (props.user.data.user_image == null) ? '' : props.user.data.user_image;
          returnState.user_image_url =  props.user.data.user_image_url;
          returnState.signature =  props.user.data.signature;
          returnState.signature_url = props.user.data.signature_url;
          returnState.show_signature_popup = (props.user.data.show_signature_popup ? 1 : 0);
          returnState.google_calender_sync = (props.user.data.google_calender_sync ? 1 : 0);
          returnState.dbfirstname = props.user.data.firstname;

          returnState.google_oauth_url =  props.user.data.google_oauth_url;
          props.exportEmptyData();
          return returnState;
        } else if(props.signature != undefined && props.signature != state.signature) {
          returnState.signature = props.signature;
          props.exportEmptyData();
          return returnState;
        }
        return null;
    }

    componentDidMount() {
        const languageData = JSON.parse(localStorage.getItem('languageData'))
        this.setState({
            profileHeader: languageData.settings['profileHeader'],
            profile_subheader: languageData.settings['profile_subheader'],
            profile_first_name: languageData.settings['profile_first_name'],
            profile_last_name: languageData.settings['profile_last_name'],
            profile_phone: languageData.settings['profile_phone'],
            profile_email: languageData.settings['profile_email'],
            profile_password_subheader: languageData.settings['profile_password_subheader'],
            profile_current_password: languageData.settings['profile_current_password'],
            profile_new_password: languageData.settings['profile_new_password'],
            profile_repeat_password: languageData.settings['profile_repeat_password'],
            profile_personal_signature: languageData.settings['profile_personal_signature'],
            profile_signature_popup: languageData.settings['profile_signature_popup'],
            profile_sync_google_calendar: languageData.settings['profile_sync_google_calendar'],
            sidebar_account_menu: languageData.settings['sidebar_account_menu'],
            sidebar_userRole_menu: languageData.settings['sidebar_userRole_menu'],
            sidebar_users_menu: languageData.settings['sidebar_users_menu'],
            sidebar_teammates_menu: languageData.settings['sidebar_teammates_menu'],
            sidebar_appointmentReminder_menu: languageData.settings['sidebar_appointmentReminder_menu'],
            sidebar_patient_menu: languageData.settings['sidebar_patient_menu'],
            sidebar_cancellation_menu: languageData['sidebar_cancellation_menu'],
            sidebar_url_menu: languageData.settings['sidebar_url_menu'],
            sidebar_survey_menu: languageData.settings['sidebar_survey_menu'],
            sidebar_appointment_menu: languageData.settings['sidebar_appointment_menu'],
            sidebar_Appointments_menu: languageData.settings['sidebar_Appointments_menu'],
            sidebar_procedure_menu: languageData.settings['sidebar_procedure_menu'],
            sidebar_consents_menu: languageData.settings['sidebar_consents_menu'],
            sidebar_questionnaires_menu: languageData.settings['sidebar_questionnaires_menu'],
            sidebar_menu_clinics: languageData.settings['sidebar_menu_clinics'],
            sidebar_manageClinics_menu: languageData.settings['sidebar_manageClinics_menu'],
            sidebar_AR_menu: languageData.settings['sidebar_AR_menu'],
            sidebar_2FA_menu: languageData.settings['sidebar_2FA_menu'],
            sidebar_profile_menu: languageData.settings['sidebar_profile_menu'],
            sidebar_account_menu: languageData.settings['sidebar_account_menu'],
            clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
            user_save_btn_text: languageData.settings['user_save_btn_text'],
            showLoader : true,
            globalLang: languageData.global
        })
        this.props.getUser(this.state.userId, 'profile');
    }

   /* componentWillUnmount = () => {
      window.onscroll = () => {
        return false;
      }
    }*/

    onDrop(picture) {
        this.setState({
            pictures: this.state.pictures.concat(picture),
        });
    }

    removeItems() {
        this.setState({ icon: 'faAngleRight' })
    }

    handleClick = () => {
        this.setState({ clicked: !this.state.clicked });
    }

    clearCanvas = () => {
      this._sketch.clear();
      this._sketch.setBackgroundFromDataUrl('');
      this.setState({
          canvasClass: 'signature-box sig-div',
          inputOut: 'input-outer no-display',
          clearClass: 'new-white-btn no-margin clear',
          resetClass: 'new-blue-btn reset ',
          changeClass: 'new-blue-btn no-margin Change no-display'
      })
    }

    saveSignature = () => {
      if ( (this._sketch && this._sketch.toJSON().objects.length === 0 && this.state.canvasClass.indexOf('no-display') === -1) || (this.state.canvasClass.indexOf('no-display') > 0 && this.state.signature_url === '' ) ) {

        toast.error(this.state.globalLang.validation_md_signature_required_if)
        return
      }

      var pngUrl = this._sketch.toDataURL();
      //this.props.uploadBase64Image({image_data : pngUrl, upload_type: 'signatures'})
      this.setState({showLoader:true})
      axios.post(config.API_URL + "upload-and-save/signature", ({image_data : pngUrl, upload_type: 'signatures'})).then(response => {
          if ( response.data && response.data.status === 200 ) {
            toast.success(this.state.globalLang['signature_'+response.data.message])
            this.setState({
              signature_url : response.data.data.signature_url,
              uploadedSignature_url : response.data.data.signature_url,
              uploadedSignature:response.data.data.file_name,
              signature:response.data.data.file_name,
              inputOut: 'input-outer',
              canvasClass: 'signature-box sig-div  no-display',
              clearClass: 'new-white-btn no-margin clear no-display',
              resetClass: 'new-blue-btn reset  no-display',
              changeClass: 'new-blue-btn no-margin Change'
            })
          } else {
            toast.error(this.state.globalLang[response.data.message])
          }
          this.setState({showLoader:false})
      }).catch(error => {
        toast.error(this.state.globalLang.unknown_error_file_upload)
        this.setState({showLoader:false})
          //error.response.data
      })
    }

    handleChildChange = (stateToUpdate) => {
        this.setState(stateToUpdate);
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

    handleReset = () => {
        this.setState({
            inputOut: 'input-outer no-display',
            canvasClass: 'signature-box sig-div  ',
            clearClass: 'new-white-btn no-margin clear no-display',
            resetClass: 'new-blue-btn reset no-display',
            changeClass: 'new-blue-btn no-margin Change'
        })
    }

    newCanvas = () => {
        this.canvas.clearRect(0, 0, 0, 0);
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

    enableCalenderSync = () => {
      this.setState({google_calender_sync:true})
      const goolgeCalendarUrl = this.state.google_oauth_url +'&redirect_uri='+ window.location.origin+"/settings/profile/calendar/sync"
      window.location = goolgeCalendarUrl;
    }

    disableCalenderSync = () => {
      this.setState({showLoader:false, google_calender_sync:false})
      this.props.disableGoogleCalendarSync();
    }

    render() {
        return (
          <div className="main protected">
            <div id="content">
              <div className="container-fluid content setting-wrapper">
                <Sidebar />
                  <div className="setting-setion">
                    <form id="login-form"  name="login-form" className="nobottommargin" action="javascript:void(0);" method="post" autoComplete="new-password" >
                    <div className="setting-container">
                      <div className="setting-title">
                      {this.state.profileHeader}
                      </div>
                      <div className="row">
                        <div className="col-lg-8 col-xs-12 profile-detail-left">
                          <div className="main-profile-picture">
                          {this.state.dbfirstname != '' && <FileUploader  type='profile' uploadedFileName={'user_image'} fileUrl={'user_image_url'} user_image={this.state.user_image} user_image_url={this.state.user_image_url} defLogo={defLogo} logo_url={this.state.user_image_url} handleChildChange={this.handleChildChange} ref="child" containerClass={'dropzone-holder'}  />}
                          </div>
                          <div className="settings-subtitle">{this.state.profile_subheader}</div>
                          <div className="row">
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.profile_first_name}<span className="setting-require">*</span></div>
                                <div className="setting-input-outer">
                                  <input name="firstname" id="first_name" className={this.state.firstnameError === true ? this.state.firstnameClassError : this.state.firstnameClass}  placeholder="firstname"  maxLength="255" type="text" value={this.state.firstname} onChange={this.handleInputChange} autoComplete="off"/>
                                </div>
                                </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.profile_last_name}<span className="setting-require">*</span></div>
                                <div className="setting-input-outer">
                                <input name="lastname" placeholder="lastname" className={this.state.lastnameError === true ? this.state.lastnameClassError : this.state.lastnameClass} maxLength="255" type="text" value={this.state.lastname} onChange={this.handleInputChange} autoComplete="off" /></div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.profile_phone} <span className="setting-require"></span></div>
                                <div className="setting-input-outer">
                                {this.state.dbfirstname != '' && <IntlTelInput
                                    preferredCountries={['tw']}
                                    css={ ['intl-tel-input', this.state.contactClass] }
                                    utilsScript={ 'libphonenumber.js' }
                                    defaultValue = {(this.state.contact_number_1) ? this.state.contact_number_1 : ''}
                                    defaultCountry = {this.state.defaultCountry}
                                    fieldName='contact_number_1'
                                    onPhoneNumberChange={ this.phoneNumberChanged }
                                    onPhoneNumberBlur={ this.phoneNumberChanged }
                                    placeholder="Phone Number"
                                    separateDialCode={`true`}
                                  />}
                                  </div>
                              </div>
                            </div>
                            <div className="col-sm-6">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.profile_email} <span className="setting-require">*</span>
                                </div>
                                <div className="setting-input-outer">
                                <input name="email_id" className={this.state.email_idError === true ? this.state.email_idClassError : this.state.email_idClass}  placeholder="email"  maxLength="500" type="text" value={this.state.email_id} onChange={this.handleInputChange}
                                  autoComplete="off"
                                  autoCorrect="off"
                                  autoCapitalize="none"
                                  spellCheck="false"
                                 /></div>
                              </div>
                            </div>
                            <div className="col-sm-12">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{"Timezone"} <span className="setting-require">*</span>
                                </div>
                                <div className="setting-input-outer">
                                <select name="timezone" className={this.state.timezoneError === true ? "setting-select-box field-error" : "setting-select-box"}  type="text" value={this.state.timezone} onChange={this.handleInputChange} >
                                    {this.state.timezones && this.state.timezones.length > 0 && this.state.timezones.map((obj, idx) => {
                                        return (
                                            <option key={idx} value={obj.php_timezone}> {obj.timezone}</option>
                                          )
                                    })}
                                 </select>
                                 </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4 col-xs-12 change-pwd-outer">
                          <div className="settings-subtitle">{this.state.profile_password_subheader}</div>
                          <div className="row">
                            <div className="col-sm-12">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.profile_current_password} <span className="setting-require">*</span></div>
                                <div className="setting-input-outer">
                                <input
                                name="old_password"
                                type="password"
                                className={this.state.oldPassError === true ? this.state.oldPasswordClassError : this.state.oldPasswordClass}
                                value={this.state.old_password}
                                onChange={this.handleInputChange}
                                autoComplete="new-password" />
                                </div>
                              </div>
                            </div>
                            <div className="col-sm-12">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.profile_new_password}<span className="setting-require">*</span></div>
                                <div className="setting-input-outer">
                                  <input
                                  name="password"
                                  type="password"
                                  className={this.state.passwordError == true ? this.state.passwordClassError : this.state.passwordClass}
                                  value = {this.state.password}
                                  onChange={this.handleInputChange}
                                   autoComplete="new-password" />
                                  </div>
                              </div>
                            </div>
                            <div className="col-sm-12">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.profile_repeat_password} <span className="setting-require">*</span></div>
                                <div className="setting-input-outer">
                                  <input
                                  name="repeat_password"
                                  type="password"
                                  className = {this.state.repeatpasswordError === true ? this.state.repeatpasswordClassError : this.state.repeatpasswordClass}
                                  value={this.state.repeat_password}
                                  onChange={this.handleInputChange}
                                  autoComplete="new-password" />
                                  </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="settings-subtitle signature-subtitle">{this.state.profile_personal_signature}</div>
                            <div className={this.state.canvasClass} id="sig-div">
                              <SketchField width='400px'
                               ref={c => (this._sketch = c)}
                               height='200px'
                               tool={Tools.Pencil}
                               lineColor='black'
                               lineWidth={6}
                               />
                            </div>
                            <div className="img-src" id="img-src">
                              <div className={this.state.inputOut} style={{background: '#fff none repeat scroll 0 0'}}>
                                <img className="" id="signature_image" src={(this.state.uploadedSignature_url) ? this.state.uploadedSignature_url : this.state.signature_url}/>
                              </div>
                            </div>
                            <span className="setting-custom-switch pull-right">
                              <span className="switch-text">{this.state.profile_signature_popup}</span>
                              <label className="setting-switch pull-right" htmlFor ="show_signature_popup" >
                                <input type="checkbox" name="show_signature_popup" id="show_signature_popup" checked={(this.state.show_signature_popup) ? 'checked' : 0 } onChange={this.handleInputChange} />
                                <span className="setting-slider"></span>
                              </label>
                            </span>
                            <div className="sig-div no-display">
                              <div className="pull-left">
                              </div>
                            </div>
                          <div className="img-src change-sig">
                            <div className="pull-left">
                              <button type="button" id="change" onClick={this.clearCanvas} className={this.state.changeClass}>Change</button>
                            </div>
                            <div className="pull-left">
                              <button type="button" id="change1" onClick={this.clear} className={this.state.clearClass} >Clear</button>
                            </div>
                            <div className="pull-left">
                              <button type="button" id="change2" onClick={this.handleClearReset} className={this.state.resetClass}>Reset</button>
                            </div>
                            <div className="pull-left">
                              <button type="button" id="change3" onClick={this.saveSignature} className={this.state.resetClass}>Save Signature</button>
                            </div>
                          </div>
                          <div className="row">
                            <div className="col-xs-12">
                              <span className="setting-custom-switch pull-right syn-wid-google">
                                <span className="switch-text">{this.state.profile_sync_google_calendar}</span>
                                  <label className="setting-switch pull-right">
                                    <input type="checkbox" name="google_calender_sync" id="google_calender_sync" checked={(this.state.google_calender_sync) ? 'checked' : 0 } onChange={(this.state.google_calender_sync) ? this.disableCalenderSync : this.enableCalenderSync } />
                                    <span className="setting-slider"></span>
                                  </label>
                                </span>
                              </div>
                            </div>
                        </div>
                      </div>
                    </div>
                    <div className="footer-static">
                      <button className="new-blue-btn pull-right" type="submit" id="save-profile" onClick={this.handleSubmit}>{this.state.user_save_btn_text}</button>
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
    const languageData  = JSON.parse(localStorage.getItem('languageData'));
    const userData      = JSON.parse(localStorage.getItem('userData'));

    const returnState = {};
    if (state.SettingReducer.action === "PROFILE_GET") {
        if (state.SettingReducer.data.status != 200) {
          toast.dismiss()
            toast.error(languageData.global[state.SettingReducer.data.message]);
            returnState.showLoader = false
        } else {
            returnState.user = state.SettingReducer.data;
        }

    } else if (state.SettingReducer.action === "PROFILE_UPDATE") {
      toast.dismiss()
        if (state.SettingReducer.data.status != 200) {
            toast.error(languageData.global[state.SettingReducer.data.message]);
            returnState.showLoader = false
        } else {
            toast.success(languageData.global[state.SettingReducer.data.message]);
            returnState.user = state.SettingReducer.data
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
        }
    } else if (state.SettingReducer.action === "DISABLE_GOOGLE_CALENDAR_SYNC") {
        toast.dismiss()
        if (state.SettingReducer.data.status != 200) {
            toast.error(languageData.global[state.SettingReducer.data.message]);
            returnState.showLoader = false
        } else {
            toast.success(languageData.global[state.SettingReducer.data.message]);
            //returnState.user = state.SettingReducer.data
            returnState.showLoader = false
        }
    }

    return returnState;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        uploadImage: uploadImage,
        getUser: getUser,
        userProfile: userProfile,
        uploadBase64Image: uploadBase64Image,
        disableGoogleCalendarSync:disableGoogleCalendarSync,
        exportEmptyData:exportEmptyData
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
