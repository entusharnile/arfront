import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import { signUp, signUpPremium, checkUniqueEmail, getSignUpPlans } from '../../Actions/SignUp/signUpAction.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import TextBox from "./TextBox";
import ContactNumber from "./ContactNumber";
import HippaPolicy from '../../Components/Policies/HippaPolicy.js';
import BbaPolicy from '../../Components/Policies/BbaPolicy.js';
import config from '../../config';

var cardNumber = '';
var cardExpiry = '';
var cardCvc = '';
var stripeToken = '';

class SignUpPremium extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: '',
      lastname: '',
      email: '',
      contactNumber: '',
      password: '',
      confirm_password: '',
      business_name: '',
      subscription_type: 'monthly',
      term_condition: false,
      agree_checkbox: false,
      isHppaPolicyAccepted: false,
      isBbaPolicyAccepted: false,
      firstNameClass: 'form-control',
      lastNameClass: 'form-control',
      emailClass: 'form-control',
      contactNumberClass: 'form-control',
      passwordClass: 'form-control',
      confirmPasswordClass: 'form-control',
      businessNameClass: 'form-control',
      subscriptionTypeClass: 'form-control',
      termconditionClass: '',
      agreecheckboxClass: '',
      defaultCountry: 'us',
      contactNumberError: false,
      isRender: true,
      processingLoder: false,
      isShowInfo: true,
      isShowCardInfo: false,
      isShowHippa: false,
      isShowBba: false,
      signUpData: {},
      uniqueEmailData: {},
      isUniqueEmail: false,
      isInfoValid: false,
      isCardInfoValid: false,

      card_number: '',
      cvc: '',
      expiry: '',
      cardNumberClass: 'form-control card-details',
      cardCvcClass: 'form-control card-details',
      cardExpiryClass: 'form-control card-details',

      address: '',
      city: '',
      state: '',
      country: '',
      pin_code: '',
      addressClass: 'form-control',
      cityClass: 'form-control',
      stateClass: 'form-control',
      countryClass: 'form-control',
      pinCodeClass: 'form-control',

      planAndCountryData: {},
      countryList: [],
      subscriptionPlanList: {},
      stripeToken: '',
      globalLang: {}
    };
  }

  componentDidMount() {
    localStorage.removeItem('accountSetupFile');
    localStorage.removeItem('accountSetupStatus');
    this.props.getSignUpPlans();
    let langData = {}
    if (localStorage.getItem('languageData')) {
      langData = JSON.parse(localStorage.getItem('languageData'));
    }
    if (!langData || langData.global === undefined || !langData.global) {
      axios.get(config.API_URL + `getLanguageText/1/global`)
        .then(res => {
          const languageData = res.data.data;
          localStorage.setItem('languageData', JSON.stringify(languageData))
          this.setState({ globalLang: languageData.global })
        })
        .catch(function (error) {
        });
    } else {
      const languageData = JSON.parse(localStorage.getItem('languageData'))
      this.setState({ globalLang: languageData.global })
    }

    if (window.Stripe) {
      this.setState({ stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY) }, () => {
        this.generateStripeInput();
      });
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({ stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY) });
      }, () => {
        this.generateStripeInput();
      });
    }

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        return {showLoader : false};
     }
    if (nextProps.processingLoder != undefined && nextProps.processingLoder == false) {
      returnState.processingLoder = false;
    } else if (nextProps.signUpData != undefined && nextProps.signUpData != prevState.signUpData) {
      returnState.signUpData = nextProps.signUpData;
      return (
        <div>
          {nextProps.history.push(`/account-setup/premium`)}
        </div>
      );
    } else if (nextProps.planAndCountryData != undefined && nextProps.planAndCountryData != prevState.planAndCountryData) {
      returnState.planAndCountryData = nextProps.planAndCountryData;
      returnState.countryList = nextProps.planAndCountryData.country_list;
      returnState.subscriptionPlanList = nextProps.planAndCountryData.subscription_plans;
    } else if (nextProps.isUniqueEmail != undefined) {
      returnState.isUniqueEmail = nextProps.isUniqueEmail;
      returnState.processingLoder = false;
      if (!nextProps.isUniqueEmail) {
        returnState.emailClass = 'form-control field_error'
      } else if (nextProps.isUniqueEmail == true && nextProps.isUniqueEmail != prevState.isUniqueEmail) {
        if (prevState.isInfoValid) {
          returnState.isShowInfo = false;
          returnState.isShowBba = false;
          returnState.isShowHippa = false;
          returnState.isShowCardInfo = true;
        }
      }
      nextProps.signUp();
    }
    return returnState;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const name = event.target.name;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    if (name == 'password' || name == 'confirm_password' || name == 'email') {
      value = value.trim();
    }
    this.setState({
      [name]: value
    });
  }

  handleChildChange = (value) => {
    this.setState(value)
  }

  handleInfoSubmit = (event) => {
    toast.dismiss();
    if (typeof event === 'object') {
      event.preventDefault();
    }
    this.setState({ isInfoValid: false })
    //====Frontend validation=================
    let error = false;
    let errorEmail = false;
    let errorPassword = false;
    let errorContactNumber = false;
    let toastError = false;
    let regularExpression = /^(?=.{8,})(?=.*[A-Z])(?=.*[`~*-/\[\]\\|{}().:;,''""!_<>-@#$%^&+=]).*$/
    //let regularExpression =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (typeof this.state.firstname == undefined || this.state.firstname == null || this.state.firstname == '') {
      this.setState({ firstNameClass: 'form-control field_error' })
      error = true;
    } else if (this.state.firstname) {
      this.setState({ firstNameClass: 'form-control' })
    }

    if (typeof this.state.lastname == undefined || this.state.lastname == null || this.state.lastname == '') {
      this.setState({ lastNameClass: 'form-control field_error' })
      error = true;
    } else if (this.state.lastname) {
      this.setState({ lastNameClass: 'form-control' })
    }

    if (typeof this.state.email == undefined || this.state.email == null || this.state.email == '') {
      this.setState({ emailClass: 'form-control field_error' })
      error = true;
    } else {
      if (!validator.isEmail(this.state.email)) {
        this.setState({ emailClass: 'form-control field_error' })
        error = true;
        toast.error(this.state.globalLang.signup_error_email_valid);
        toastError = true;
      } else {
        this.props.checkUniqueEmail({ email_id: this.state.email });
        this.setState({ emailClass: 'form-control', isUniqueEmail: false, uniqueEmailData: {} })
      }
    }

    if (typeof this.state.contactNumber == undefined || this.state.contactNumber == null || this.state.contactNumber == '') {
      this.setState({ contactNumberClass: 'form-control field_error' })
      error = true;
    } else {
      if (this.state.contactNumberError) {
        this.setState({ contactNumberClass: 'form-control field_error' })
        error = true;
        if (!toastError) {
          toast.error(this.state.globalLang.signup_error_phone_number_valid);
        }
        toastError = true;
      } else if (this.state.contactNumber.length <= 9) {
        this.setState({ contactNumberClass: 'form-control field_error' });
        error = true;
        if (!toastError) {
          toast.error(this.state.globalLang.signup_error_phone_number_valid);
        }
        toastError = true
      } else {
        this.setState({ contactNumberClass: 'form-control' })
      }
    }

    if (typeof this.state.password === undefined || this.state.password === null || this.state.password === '' || this.state.password.trim() == "") {
      this.setState({ passwordClass: 'form-control field_error' })
      error = true;
    } else if (this.state.password) {
      if (this.state.password.length <= 8) {
        this.setState({ passwordClass: 'form-control field_error' });
        error = true;
        if (!toastError) {
          toast.error(this.state.globalLang.signup_error_password_length);
        }
        toastError = true
      } else if (!regularExpression.test(this.state.password)) {
        this.setState({ passwordClass: 'form-control field_error' })
        error = true;
        if (!toastError) {
          toast.error(this.state.globalLang.signup_error_password_combination);
        }
        toastError = true
      } else {
        this.setState({ passwordClass: 'form-control' })
      }
    }

    if (typeof this.state.confirm_password === undefined || this.state.confirm_password === null || this.state.confirm_password === '') {
      this.setState({ confirmPasswordClass: 'form-control field_error' })
      error = true;
      if (this.state.password.length > 0) {
        this.setState({ passwordClass: 'form-control field_error' })
        error = true;
        if (!toastError) {
          toast.error(this.state.globalLang.signup_error_password_match_with_confirm);
        }
        toastError = true
      }
    } else if (this.state.confirm_password) {
      if (this.state.password !== this.state.confirm_password) {
        this.setState({ passwordClass: 'form-control field_error', confirmPasswordClass: 'form-control field_error' })
        error = true;
        if (!toastError) {
          toast.error(this.state.globalLang.signup_error_password_match_with_confirm);
        }
        toastError = true
      } else {
        this.setState({ confirmPasswordClass: 'form-control' })
      }
    }

    if (!this.state.term_condition && !toastError) {
      toast.error(this.state.globalLang.signup_error_accept_terms_of_services);
      error = true;
      toastError = true;
    }

    if (error) {
      this.toggleSignUpForm('isShowInfo');
      return;
    } else {
      this.setState({ isInfoValid: true })
      if (this.state.isUniqueEmail) {
        this.toggleSignUpForm('isShowCardInfo');
      }
    }
    //======End frontend validation=========
  }

  handleCardInfoSubmit = (event) => {
    toast.dismiss();
    if (typeof event === 'object') {
      event.preventDefault();
    }
    this.setState({ isCardInfoValid: false })
    //====Frontend validation=================
    let error = false;
    if (typeof this.state.address == undefined || this.state.address == null || this.state.address == '') {
      this.setState({ addressClass: 'form-control field_error' })
      error = true;
    } else if (this.state.address) {
      this.setState({ addressClass: 'form-control' })
    }

    if (typeof this.state.city == undefined || this.state.city == null || this.state.city == '') {
      this.setState({ cityClass: 'form-control field_error' })
      error = true;
    } else if (this.state.city) {
      this.setState({ cityClass: 'form-control' })
    }

    if (typeof this.state.state == undefined || this.state.state == null || this.state.state == '') {
      this.setState({ stateClass: 'form-control field_error' })
      error = true;
    } else if (this.state.state) {
      this.setState({ stateClass: 'form-control' })
    }

    if (typeof this.state.country == undefined || this.state.country == null || this.state.country == '') {
      this.setState({ countryClass: 'form-control field_error' })
      error = true;
    } else if (this.state.country) {
      this.setState({ countryClass: 'form-control' })
    }

    if (typeof this.state.pin_code == undefined || this.state.pin_code == null || this.state.pin_code == '') {
      this.setState({ pinCodeClass: 'form-control field_error' })
      error = true;
    } else if (this.state.pin_code) {
      this.setState({ pinCodeClass: 'form-control' })
    }


    if (error) {
      this.toggleSignUpForm('isShowCardInfo');
      return;
    } else {
      this.setState({ processingLoder: true })
      this.generateStripeCardToken();
      //this.setState({isCardInfoValid:true})
      //this.toggleSignUpForm('isShowHippa');
    }
    //======End frontend validation=========
  }

  generateStripeInput = (type) => {
    var elements = this.state.stripe.elements();
    cardNumber = elements.create('cardNumber');
    cardExpiry = elements.create('cardExpiry');
    cardCvc = elements.create('cardCvc');
    cardNumber.mount('#stripe-card-number');
    cardExpiry.mount('#stripe-card-expiry');
    cardCvc.mount('#stripe-card-cvc');
  }

  generateStripeCardToken = () => {
    this.state.stripe.createToken(cardNumber).then((response) => {
      if (response.error) {
        this.setState({ stripeToken: '', processingLoder: false });
        toast.error(response.error.message)
      } else {
        stripeToken = response.token.id;
        if (stripeToken) {
          this.setState({ stripeToken: stripeToken, processingLoder: false });
          this.setState({ isCardInfoValid: true })
          this.toggleSignUpForm('isShowHippa');
        }
      }
    })
  }

  toggleSignUpForm = (nextStep, isSubmit) => {
    isSubmit = isSubmit || false;
    this.setState({
      isShowInfo: false,
      isShowCardInfo: false,
      isShowHippa: false,
      isShowBba: (nextStep == 'isShowBba' || isSubmit == true) ? true : false,
      [nextStep]: true,
    })
    if (isSubmit) {
      this.setState({ processingLoder: true })
      let formData = {}
      formData.firstname = this.state.firstname;
      formData.lastname = this.state.lastname;
      formData.email_id = this.state.email;
      formData.contact_number_1 = this.state.contactNumber;
      formData.password = this.state.password;
      formData.confirm_password = this.state.confirm_password;
      formData.business_name = this.state.business_name;
      formData.term_condition = (this.state.term_condition) ? 1 : 0;
      formData.agree_checkbox = (this.state.agree_checkbox) ? 1 : 0;
      formData.subscription_type = this.state.subscription_type;
      formData.stripe_token = this.state.stripeToken;
      formData.address = this.state.address;
      formData.city = this.state.city;
      formData.state = this.state.state;
      formData.country = this.state.country;
      formData.pincode = this.state.pin_code;
      this.props.signUpPremium(formData);
    }
  }

  renderSubscriptionPlan = () => {
    let htmlList = []
    Object.keys(this.state.subscriptionPlanList).forEach((idx) => {
      htmlList.push(<option key={'subscriptionPlanList-' + idx} value={idx}>{this.state.subscriptionPlanList[idx]} </option>);
    })
    return htmlList;
  }
  render() {
    return (
      <div className="guest">
        <Header />
        <div className="wrapper">
          {/*  Info Data Block START  */}
          <div className={(this.state.isShowInfo) ? 'info-block' : 'info-block hide'}>
            <div className="login-main sign-up-main">
              <form action="javascript:void(0);" onSubmit={this.handleInfoSubmit}>
                <h1 className="login-title">{this.state.globalLang.signup_premium_plan_sign_up}</h1>
                <div className="form-group row">
                  <div className="col-sm-6 first-name">
                    <TextBox
                      name="firstname"
                      value={this.state.firstname}
                      handleInputChange={this.handleInputChange}
                      class={this.state.firstNameClass}
                      placeholder={this.state.globalLang.signup_placeholder_first_name}
                      type='text'
                      label={this.state.globalLang.signup_label_your_name}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-sm-6 last-name">
                    <TextBox
                      name="lastname"
                      value={this.state.lastname}
                      handleInputChange={this.handleInputChange}
                      class={this.state.lastNameClass}
                      placeholder={this.state.globalLang.signup_placeholder_last_name}
                      type='text'
                      label='&nbsp;'
                      isRequired={false}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-12">
                    <TextBox
                      name="email"
                      value={this.state.email}
                      handleInputChange={this.handleInputChange}
                      class={this.state.emailClass}
                      placeholder={this.state.globalLang.signup_placeholder_email}
                      type='text'
                      label={this.state.globalLang.signup_label_email}
                      isRequired={true}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-12">
                    <ContactNumber
                      name="contactNumber"
                      value={this.state.contactNumber}
                      handleChildChange={this.handleChildChange}
                      class={this.state.contactNumberClass}
                      placeholder={this.state.globalLang.signup_placeholder_phone}
                      type='text'
                      label={this.state.globalLang.signup_label_phone}
                      isRequired={true}
                      isRender={this.state.isRender}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-6 first-name">
                    <TextBox
                      name="password"
                      value={this.state.password}
                      handleInputChange={this.handleInputChange}
                      class={this.state.passwordClass}
                      placeholder={this.state.globalLang.signup_placeholder_password}
                      type='password'
                      label={this.state.globalLang.signup_label_password}
                      isRequired={true}
                    />
                  </div>
                  <div className="col-sm-6 last-name">
                    <TextBox
                      name="confirm_password"
                      value={this.state.confirm_password}
                      handleInputChange={this.handleInputChange}
                      class={this.state.confirmPasswordClass}
                      placeholder={this.state.globalLang.signup_placeholder_retype_password}
                      type='password'
                      label='&nbsp;'
                      isRequired={false}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-12">
                    <TextBox
                      name="business_name"
                      value={this.state.business_name}
                      handleInputChange={this.handleInputChange}
                      class={this.state.businessNameClass}
                      placeholder={this.state.globalLang.signup_business_name}
                      type='text'
                      label={this.state.globalLang.signup_label_business_name}
                      isRequired={false}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-12">
                    <label>{this.state.globalLang.signup_label_subscription_type}</label>
                    <select name="subscription_type" value={this.state.subscription_type} onChange={this.handleInputChange} className={this.state.subscriptionTypeClass}>
                      {this.renderSubscriptionPlan()}
                    </select>
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-12 terms text-left">
                    <input type="checkbox" className={this.state.termConditionClass} name="term_condition" checked={(this.state.term_condition) ? 'checked' : false} onChange={this.handleInputChange} /> {this.state.globalLang.signup_i_agree_to_the} <a href="https://www.aestheticrecord.com/terms-of-service/" target="_blank">{this.state.globalLang.signup_aesthetic_record_terms_of_service_link}</a>
                  </div>
                </div>
                <div className="form-group">
                  <button type="submit" className="subscriptionBtn">{this.state.globalLang.signup_button_continue}</button>
                </div>
              </form>
            </div>
          </div>
          {/*  Info Data Block END  */}
          {/*  Card And Billing Block START  */}
          <div className='sign-up-main'>
            <form action="javascript:void(0);" onSubmit={this.handleCardInfoSubmit}>
              <div className={(this.state.isShowCardInfo) ? 'card-block' : 'card-block hide'}>
                <div className="col-sm-12">
                  <div className="login-title">{this.state.globalLang.signup_premium_plan_sign_up}</div>
                </div>
                <div className="col-md-6 col-xs-12">
                  <div className="member-section pull-left">
                    <div className="member-section-title no-margin">{this.state.globalLang.signup_payment_details}s</div>
                    <div className="col-sm-12 form-group">
                      <div className="field-group">
                        <label>{this.state.globalLang.signup_label_card_number}<span className="required">*</span></label>
                        <div className={this.state.cardNumberClass} id="stripe-card-number"></div>
                      </div>
                    </div>
                    <div className="col-sm-12 form-group">
                      <div className="field-group">
                        <label>{this.state.globalLang.signup_label_security_code}<span className="required">*</span></label>
                        <div className={this.state.cardCvcClass} id="stripe-card-cvc"></div>
                      </div>
                    </div>
                    <div className="col-sm-12 form-group">
                      <div className="field-group">
                        <label>{this.state.globalLang.signup_label_expiration_date}<span className="required">*</span></label>
                        <div className={this.state.cardExpiryClass} id="stripe-card-expiry"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-xs-12">
                  <div className="member-section pull-left">
                    <div className="member-section-title no-margin">{this.state.globalLang.signup_billing_details}</div>
                    <div className="col-sm-12 form-group">
                      <TextBox
                        name="address"
                        value={this.state.address}
                        handleInputChange={this.handleInputChange}
                        class={this.state.addressClass}
                        placeholder={this.state.globalLang.signup_placeholder_billing_address}
                        type='text'
                        label={this.state.globalLang.signup_label_billing_address}
                        isRequired={true}
                      />
                    </div>
                    <div className="col-sm-6 form-group">
                      <TextBox
                        name="city"
                        value={this.state.city}
                        handleInputChange={this.handleInputChange}
                        class={this.state.cityClass}
                        placeholder={this.state.globalLang.signup_placeholder_city}
                        type='text'
                        label={this.state.globalLang.signup_label_city}
                        isRequired={true}
                      />
                    </div>
                    <div className="col-sm-6 form-group">
                      <TextBox
                        name="state"
                        value={this.state.state}
                        handleInputChange={this.handleInputChange}
                        class={this.state.stateClass}
                        placeholder={this.state.globalLang.signup_placeholder_state}
                        type='text'
                        label={this.state.globalLang.signup_label_state}
                        isRequired={true}
                      />
                    </div>
                    <div className="col-sm-6 form-group">
                      <label>{this.state.globalLang.signup_label_country}</label>
                      <select name="country" value={this.state.country} onChange={this.handleInputChange} className={this.state.countryClass} placeholder="Country">
                        <option value=''>{this.state.globalLang.signup_select_country}</option>
                        {this.state.countryList.map((obj, idx) => {
                          return (
                            <option key={'countryList-' + idx} value={obj.country_code}>{obj.country_name}</option>
                          )
                        })
                        }
                      </select>
                    </div>
                    <div className="col-sm-6 form-group">
                      <TextBox
                        name="pin_code"
                        value={this.state.pin_code}
                        handleInputChange={this.handleInputChange}
                        class={this.state.pinCodeClass}
                        placeholder={this.state.globalLang.signup_placeholder_zip_code}
                        type='text'
                        label={this.state.globalLang.signup_label_zip_code}
                        isRequired={true}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group col-sm-12">
                  <button type="submit" disabled={this.state.processingLoder} className="billingBtn premium-btn ar-login-btn">
                    {(this.state.processingLoder) ? this.state.globalLang.signup_please_wait + '...' : this.state.globalLang.signup_button_continue}
                  </button>
                </div>
              </div>
            </form>
          </div>
          {/*  Card And Billing Block END  */}
          {/*  Hippa Policy Block START  */}
          <div className='sign-up-main'>
            <div className={(this.state.isShowHippa) ? 'hippa-block' : 'hippa-block hide'}>
              <HippaPolicy
                handleChildChange={this.handleChildChange}
                toggleSignUpForm={this.toggleSignUpForm}
                nextStep={'isShowBba'}
                globalLang={this.state.globalLang}
                signUpLabel={this.state.globalLang.signup_premium_plan_sign_up}
              />
            </div>
          </div>
          {/*  Hippa Policy Block END  */}
          {/*  Bba Policy Block START  */}
          <div className='sign-up-main'>
            <div className={(this.state.isShowBba) ? 'bba-block' : 'bba-block hide'}>
              <BbaPolicy
                handleChildChange={this.handleChildChange}
                toggleSignUpForm={this.toggleSignUpForm}
                handleInputChange={this.handleInputChange}
                name="agree_checkbox"
                value={this.state.agree_checkbox}
                nextStep={'isShowBba'}
                processingLoder={this.state.processingLoder}
                globalLang={this.state.globalLang}
                signUpLabel={this.state.globalLang.signup_premium_plan_sign_up}
              />
            </div>
          </div>
          {/*  Bba Policy Block END  */}
        </div>


        <div className='sign-up-main'>
          <center>
            <img className="banner-image" src="/images/signup-banner1.png" />
          </center>
        </div>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => {
  let returnState = {};
  if (state.SignUpReducer.action === "SIGN_UP_PREMIUM") {
    toast.dismiss();
    if (state.SignUpReducer.data.status != 201) {
      const languageData = JSON.parse(localStorage.getItem('languageData'));
      toast.error(languageData.global[state.SignUpReducer.data.message]);
      returnState.processingLoder = true;
      returnState.showLoader = false
    } else {
      localStorage.setItem('accountSetupFile', state.SignUpReducer.data.data)
      localStorage.setItem('accountSetupStatus', 0)
      returnState.signUpData = state.SignUpReducer.data.data;
    }
  } else if (state.SignUpReducer.action === "UNIQUE_EMAIL") {
    toast.dismiss();
    if (state.SignUpReducer.data.status != 200) {
      const languageData = JSON.parse(localStorage.getItem('languageData'));
      toast.error(languageData.global[state.SignUpReducer.data.message]);
      returnState.processingLoder = true;
      returnState.isUniqueEmail = false;
      returnState.showLoader = false
    } else {
      returnState.isUniqueEmail = true;
    }
  } else if (state.SignUpReducer.action === "SIGN_UP_PLANS") {
    toast.dismiss();
    if (state.SignUpReducer.data.status != 200) {
      const languageData = JSON.parse(localStorage.getItem('languageData'));
      toast.error(languageData.global[state.SignUpReducer.data.message]);
      returnState.processingLoder = true;
      returnState.showLoader = false
    } else {
      returnState.planAndCountryData = state.SignUpReducer.data.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    signUp: signUp,
    getSignUpPlans: getSignUpPlans,
    signUpPremium: signUpPremium,
    checkUniqueEmail: checkUniqueEmail
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SignUpPremium));
