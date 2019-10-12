import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import {getClientWallet, addCreditToWallet, removeCreditFromWallet, updateWalletPackage, removeWalletPackage, updateMembershipCC, cancelMembership, addMonthyMembership, searchProduct, addPackageProduct, getBogoPackageDetails, getProductPriceByClinic} from '../../Actions/Clients/clientsAction.js';
import { checkIfPermissionAllowed, numberFormat, isNumber, validateEmail, showFormattedDate, capitalizeFirstLetter, displayName, getCurrencySymbol, getDateFormat, dateFormatPicker } from '../../Utils/services.js';
import config from '../../config';
import moment from 'moment';
import CustomDatePicker from '../Common/CustomDatePicker.js';
import { Scrollbars } from 'react-custom-scrollbars';

var cardNumber  = '';
var cardExpiry  = '';
var cardCvc     = '';
var stripeToken = '';

class ClientWallet extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType           : (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      clientID              : this.props.match.params.clientID,
      globalLang            : languageData.global,
      showLoader            : false,
      showCreditModal       : false,
      creditMode            : '',
      creditType            : 'dollar',
      creditTypeClass       : 'setting-select-box',
      amountClass           : 'setting-input-box',
      reasonClass           : 'setting-input-box',
      showPackageModal      : false,
      showMembershipModal   : false,
      productType           : 'product',
      proPackageClass       : 'setting-select-box',
      proPackageUnitsClass  : 'setting-input-box',
      bogoPackageClass      : 'setting-select-box',
      bogoMainUnitClass     : 'setting-input-box',
      bogoFreeUnitClass     : 'setting-input-box',
      productClass          : 'setting-input-box',
      productUnitClass      : 'setting-input-box',
      productClinicClass    : 'setting-select-box',
      productPriceClass     : 'setting-input-box',
      patientEmailClass     : 'setting-input-box',
      credit_amount         : '',
      reason                : '',
      patientEmail          : '',
      package_units         : '',
      mainBogoUnitsUsed     : '0',
      freeBogoUnitsUsed     : '0',
      product_name          : '',
      product_units         : '',
      price_per_unit        : '',
      showEditPackageModal  : false,
      balanceUnitClass      : 'setting-input-box',
      balance_units         : '',
      packageProductName    : '',
      showModal             : false,
      modalMessage          : '',
      modalAction           : '',
      modalData             : '',
      showPaymentDetails    : false,
      showMembershipSection : true,
      showNewCardSection    : false,
      editPackageData       : {},
      waiveOffOTFee         : false,
      showSearchResult      : false,
      hidProductID          : 0,
      showBogoTable         : false,

      monthly_membership_type:'free',
      monthly_membership_fees: 0,
      one_time_membership_setup: 0,
      total_membership_with_waive:0,
      total_membership_without_waive:0,
      subscription_started_at: new Date(),
      subscription_started_atClass: 'setting-input-box',

      unitsToAddClass       : 'col-sm-6 col-xs-12',
      languageData          : languageData.clients,
    }
  }

  handleInputChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;
     this.setState({[event.target.name]: value , dataChanged : true, clicnicForCard: 0});

     if ( this.state.hidProductID && event.target.name === 'proClinicId' ) {
       this.getProductPrice()
     }
     if ( event.target.name === 'credit_type' ) {
       this.setState({creditType: value})
     }
     if ( event.target.name === 'bogo_id' ) {
       if ( target.value && target.value > 0 ) {
         let formData = {
           bogo_id : target.value
         }
         this.setState({showLoader: true})
         this.props.getBogoPackageDetails(formData)
       } else {
         this.setState({bogoPackData: undefined, showBogoTable: false})
       }
     }

     if ( event.target.name === 'package_id' ) {
       this.handleUnitsToAdd(value, event)
     }
  }

  handleUnitsToAdd = (value, event) => {
    if ( event.target.options[event.target.selectedIndex].dataset.qty ) {
      let units     = event.target.options[event.target.selectedIndex].dataset.qty;
      let count     = event.target.options[event.target.selectedIndex].dataset.count;
      let unitClass = this.state.unitsToAddClass;

      if ( count > 1 ) {
        unitClass = 'col-sm-6 col-xs-12 no-display';
			} else {
        unitClass = 'col-sm-6 col-xs-12';
			}

      this.setState({
        package_units: units,
        hid_package_units: units,
        unitsToAddClass: unitClass
      })
    } else {
      this.setState({
        package_units: '',
        hid_package_units: '',
        unitsToAddClass: 'col-sm-6 col-xs-12'
      })
    }
  }

  showEditPackageModal = (obj) => {
    let balanceUnits        = ''
    let packageProductName  = ''

    if (obj && obj.balance_units) {
      balanceUnits = obj.balance_units
    }

    if (obj && obj.product_name) {
      packageProductName = obj.product_name
    }

    this.setState({showEditPackageModal: true, packageProductName: packageProductName, balance_units: balanceUnits, balanceUnitClass: 'setting-input-box', editPackageData: obj})
  }

  hideEditPackageModal = () => {
    this.setState({showEditPackageModal: false, packageProductName: '', balance_units: '', editPackageData: {}})
  }

  showCreditModal = (mode, creditType) => {
    this.setState({showCreditModal: true, creditMode: mode, creditType: creditType, credit_amount: '', reason: '', amountClass: 'setting-input-box', reasonClass: 'setting-input-box'})
  }

  hideCreditModal = () => {
    this.setState({showCreditModal: false, creditMode: '', creditType: 'dollar'})
  }

  showPackageModal = () => {
    this.setState({showPackageModal: true, package_id: 0, package_units: '', bogo_id: 0, mainBogoUnitsUsed: '0', freeBogoUnitsUsed: '0', product_name: '', product_units: '', price_per_unit: '', productType: 'product', proPackageClass: 'setting-select-box', proPackageUnitsClass: 'setting-input-box', bogoPackageClass: 'setting-select-box', bogoMainUnitClass: 'setting-input-box', bogoFreeUnitClass: 'setting-input-box', productClass: 'setting-input-box', productUnitClass: 'setting-input-box', productClinicClass: 'setting-select-box', productPriceClass: 'setting-input-box'})
  }

  hidePackageModal = () => {
    this.setState({showPackageModal: false})
  }

  showMembershipModal = () => {
    var elements = this.state.stripe.elements();

    cardNumber  = elements.create('cardNumber');
    cardNumber.mount('#card-number');

    cardExpiry  = elements.create('cardExpiry');
    cardExpiry.mount('#card-expiry');

    cardCvc     = elements.create('cardCvc');
    cardCvc.mount('#card-cvc');

    let patientEmail = (this.state.clientWalletData && this.state.clientWalletData.patient_data && this.state.clientWalletData.patient_data.email) ? this.state.clientWalletData.patient_data.email : ''

    this.setState({showMembershipModal: true, patientEmail: '', patientEmailClass: 'setting-input-box', waiveOffOTFee: false, patientEmail: patientEmail})
  }

  hideMembershipModal = () => {
    this.setState({showMembershipModal: false})
  }

  componentDidMount = () => {
    if ( window.Stripe ) {
      this.setState({stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY)});
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY)});
      });
    }

    this.setState({showLoader: true})
    this.props.getClientWallet(this.state.clientID)
  }

  handleCreditSubmit = (e) => {
    e.preventDefault();

    if ( !isNumber(this.state.credit_amount) || !this.state.credit_amount || Math.sign(this.state.credit_amount) === -1 ) {
      this.setState({amountClass: 'setting-input-box setting-input-box-invalid'})
    } else {
      this.setState({amountClass: 'setting-input-box'})
    }

    if ( this.state.reason.trim() === '' ) {
      this.setState({reasonClass: 'setting-input-box setting-input-box-invalid'})
    } else {
      this.setState({reasonClass: 'setting-input-box'})
    }

    if ( isNumber(this.state.credit_amount) && this.state.credit_amount && this.state.reason.trim() !== '' && Math.sign(this.state.credit_amount) !== -1 ) {
      let formData = {
        credit_amount  : this.state.credit_amount,
        credit_type    : this.state.creditType,
        reason         : this.state.reason.trim()
      }

      if ( this.state.creditMode && this.state.creditMode === 'remove' ) {
        this.props.removeCreditFromWallet(this.state.clientID, formData)
      } else {
        this.props.addCreditToWallet(this.state.clientID, formData)
      }

      this.setState({showLoader: true, showCreditModal: false})
    }
  }

  handleMembershipSubmit = (e) => {
    e.preventDefault();

    let error = false;
    if ( this.state.patientEmail.trim() === '' || !validateEmail(this.state.patientEmail.trim()) ) {
      this.setState({patientEmailClass: 'setting-input-box setting-input-box-invalid'})
      error = true;
    } else {
      this.setState({patientEmailClass: 'setting-input-box'})
    }

    if ( this.state.subscription_started_at === '' || this.state.subscription_started_at === null) {
      this.setState({subscription_started_atClass: 'setting-input-box setting-input-box-invalid'})
      error = true;
    } else {
      this.setState({subscription_started_atClass: 'setting-input-box'})
    }
    if(error){
      return
    }

    toast.dismiss();

    if ( this.state.patientEmail.trim() !== '' && validateEmail(this.state.patientEmail.trim()) ) {
      this.setState({showLoader: true})

      if ( (this.state.clientWalletData.account_prefrence.monthly_membership_type === 'free' && this.state.waiveOffOTFee === true) || (this.state.clientWalletData.account_prefrence.monthly_membership_type === 'free' && parseFloat(this.state.clientWalletData.account_prefrence.one_time_membership_setup) === 0.00) ) {
        let formData = {
          waive_off_one_time_fee  : (this.state.waiveOffOTFee) ? 1 : 0,
          email                   : this.state.patientEmail,
          subscription_started_at : moment(this.state.subscription_started_at).format('YYYY-MM-DD'),
          membership_total        : (this.state.waiveOffOTFee) ? this.state.total_membership_with_waive : this.state.total_membership_without_waive
        }

        this.props.addMonthyMembership(this.state.clientID, formData)

        this.setState({showLoader: true, showMembershipModal: false})
      } else {
        this.state.stripe.createToken(cardNumber).then((response) => {
          if ( response.error ) {
            toast.error(response.error.message)
            this.setState({showLoader: false})
          } else {
            stripeToken = response.token.id;

            if ( stripeToken ) {

              let formData = {
                stripeToken             : stripeToken,
                waive_off_one_time_fee  : (this.state.waiveOffOTFee) ? 1 : 0,
                email                   : this.state.patientEmail,
                subscription_started_at : moment(this.state.subscription_started_at).format('YYYY-MM-DD'),
                membership_total        : (this.state.waiveOffOTFee) ? this.state.total_membership_with_waive : this.state.total_membership_without_waive
              }

              this.props.addMonthyMembership(this.state.clientID, formData)

              this.setState({showLoader: true, showMembershipModal: false})
            }
          }
        })
      }
    }
  }

  handlePackageSubmit = (e) => {
    e.preventDefault();
    let formData = {}

    if ( this.state.productType && this.state.productType === 'product' ) {

      if ( this.state.package_id && this.state.package_id > 0 ) {
        this.setState({proPackageClass: 'setting-select-box'})
      } else {
        this.setState({proPackageClass: 'setting-select-box setting-input-box-invalid'})
      }

      if ( !this.state.package_units || (this.state.unitsToAddClass.indexOf('no-display') === -1 && (!isNumber(this.state.package_units) || Math.sign(this.state.package_units) === -1 || this.state.package_units > this.state.hid_package_units )) ) {
        this.setState({proPackageUnitsClass: 'setting-input-box setting-input-box-invalid'})
      } else {
        this.setState({proPackageUnitsClass: 'setting-input-box'})
      }

      if ( this.state.package_id && this.state.package_id > 0 && isNumber(this.state.package_units) && this.state.package_units <= this.state.hid_package_units && Math.sign(this.state.package_units) !== -1 ) {
        formData = {
          patient_id    : this.state.clientID,
          product_type  : "product",
          package_id    : this.state.package_id,
          package_units : this.state.package_units
        }

        this.setState({showLoader: true, showPackageModal : false})
        this.props.addPackageProduct(formData);
      }

    } else if ( this.state.productType && this.state.productType === 'package' ) {

      if ( this.state.bogo_id && this.state.bogo_id > 0 ) {
        this.setState({bogoPackageClass: 'setting-select-box'})
      } else {
        this.setState({bogoPackageClass: 'setting-select-box setting-input-box-invalid'})
      }

      if ( !this.state.mainBogoUnitsUsed || !isNumber(this.state.mainBogoUnitsUsed) || Math.sign(this.state.mainBogoUnitsUsed) === -1 ) {
        this.setState({bogoMainUnitClass: 'setting-input-box setting-input-box-invalid'})
      } else {
        this.setState({bogoMainUnitClass: 'setting-input-box'})
      }

      if ( !this.state.freeBogoUnitsUsed || !isNumber(this.state.freeBogoUnitsUsed) || Math.sign(this.state.freeBogoUnitsUsed) === -1 ) {
        this.setState({bogoFreeUnitClass: 'setting-input-box setting-input-box-invalid'})
      } else {
        this.setState({bogoFreeUnitClass: 'setting-input-box'})
      }

      if ( this.state.bogo_id && this.state.bogo_id > 0 && isNumber(this.state.mainBogoUnitsUsed) && isNumber(this.state.freeBogoUnitsUsed) && Math.sign(this.state.mainBogoUnitsUsed) !== -1 && Math.sign(this.state.freeBogoUnitsUsed) !== -1 ) {
        let mainRef         = "mainBogoUnitRef"
        let savedMainUnits  = this.refs[mainRef].value
        let freeRef         = "freeBogoUnitRef"
        let savedFreeUnits  = this.refs[freeRef].value

        if ( parseFloat(this.state.mainBogoUnitsUsed) > parseFloat(savedMainUnits) ) {
          this.setState({bogoMainUnitClass: 'setting-input-box setting-input-box-invalid'})
        } else {
          this.setState({bogoMainUnitClass: 'setting-input-box'})
        }

        if ( parseFloat(this.state.freeBogoUnitsUsed) > parseFloat(savedFreeUnits) ) {
          this.setState({bogoFreeUnitClass: 'setting-input-box setting-input-box-invalid'})
        } else {
          this.setState({bogoFreeUnitClass: 'setting-input-box'})
        }

        if ( parseFloat(this.state.mainBogoUnitsUsed) <= parseFloat(savedMainUnits) && parseFloat(this.state.freeBogoUnitsUsed) <= parseFloat(savedFreeUnits) ) {
          formData = {
            patient_id            : this.state.clientID,
            product_type          : "package",
            bogo_id               : this.state.bogo_id,
            main_bogo_units_used  : this.state.mainBogoUnitsUsed,
            free_bogo_units_used  : this.state.freeBogoUnitsUsed
          }

          this.setState({showLoader: true, showPackageModal : false})
          this.props.addPackageProduct(formData);
        }
      }

    } else if ( this.state.productType && this.state.productType === 'actualProduct' ) {
      let ref         = 'clinic_ref';
      let selClinicID = this.refs[ref].value

      if ( this.state.hidProductID && this.state.hidProductID > 0 ) {
        this.setState({productClass: 'setting-input-box'})
      } else {
        this.setState({productClass: 'setting-input-box setting-input-box-invalid'})
      }

      if ( !this.state.product_units || !isNumber(this.state.product_units) || Math.sign(this.state.product_units) === -1 ) {
        this.setState({productUnitClass: 'setting-input-box setting-input-box-invalid'})
      } else {
        this.setState({productUnitClass: 'setting-input-box'})
      }

      if ( (this.state.proClinicId && this.state.proClinicId > 0) || selClinicID ) {
        this.setState({productClinicClass: 'setting-select-box'})
      } else {
        this.setState({productClinicClass: 'setting-select-box setting-input-box-invalid'})
      }

      if ( !this.state.price_per_unit || !isNumber(this.state.price_per_unit) || Math.sign(this.state.price_per_unit) === -1 ) {
        this.setState({productPriceClass: 'setting-input-box setting-input-box-invalid'})
      } else {
        this.setState({productPriceClass: 'setting-input-box'})
      }

      if ( this.state.hidProductID && this.state.hidProductID > 0 && isNumber(this.state.product_units) && ((this.state.proClinicId && this.state.proClinicId > 0) || selClinicID) && isNumber(this.state.price_per_unit) && Math.sign(this.state.product_units) !== -1 && Math.sign(this.state.price_per_unit) !== -1 ) {
        formData = {
          patient_id            : this.state.clientID,
          product_type          : "actualProduct",
          hidden_product_id     : this.state.hidProductID,
          product_units         : this.state.product_units,
          price_per_unit        : this.state.price_per_unit
        }

        this.setState({showLoader: true, showPackageModal : false})
        this.props.addPackageProduct(formData);
      }
    }

  }

  handleEditPackageSubmit = (e) => {
    e.preventDefault();

    if ( !this.state.balance_units || !isNumber(this.state.balance_units) ) {
      this.setState({balanceUnitClass: 'setting-input-box setting-input-box-invalid'})
    } else {
      this.setState({balanceUnitClass: 'setting-input-box'})
    }

    if ( this.state.balance_units && isNumber(this.state.balance_units) ) {
      let formData = {
        balance_units       : this.state.balance_units,
        patient_package_id  : this.state.editPackageData.patient_package_id,
        patient_product_id  : this.state.editPackageData.product_id,
        total_balance_units : this.state.editPackageData.balance_units,
      }

      this.props.updateWalletPackage(this.state.clientID, formData)

      this.setState({showLoader: true, showEditPackageModal: false})
    }
  }

  static getDerivedStateFromProps(props, state) {
      if ( props.clientWalletData !== undefined && props.clientWalletData.status === 200 && props.clientWalletData.data !== state.clientWalletData ) {

        return {
          clientWalletData         : props.clientWalletData.data,
          showLoader               : false,
        }
      } else if ( props.clientWalletData !== undefined && props.clientWalletData.status !== 200 && props.clientWalletData.data !== state.clientWalletData ) {

        return {
          clientWalletData         : props.clientWalletData.data,
          showLoader               : false,
        }
      }

      if ( props.productData !== undefined && props.productData.status === 200 && props.productData.data !== state.productData ) {
         return {
           productData               : props.productData.data,
           showSearchResult          : true
         }
       }

      if ( props.bogoPackData !== undefined && props.bogoPackData.status === 200 && props.bogoPackData.data !== state.bogoPackData ) {
       return {
         bogoPackData              : props.bogoPackData.data,
         showBogoTable             : (state.bogo_id > 0) ? true : false,
         showLoader                : false,
         mainBogoUnitsUsed         : 0,
         freeBogoUnitsUsed         : 0
       }
      } else if ( props.bogoPackData !== undefined && props.bogoPackData.status !== 200 && props.bogoPackData.data !== state.bogoPackData ) {
        return {
          bogoPackData              : [],
          showBogoTable             : false,
          showLoader                : false
        }
      }

      if ( props.priceData !== undefined && props.priceData.status === 200 && props.priceData.data !== state.priceData ) {
       return {
         priceData                 : props.priceData.data,
         showLoader                : false,
         price_per_unit            : (props.priceData.data) ? props.priceData.data.product_price_per_clinic : 0
       }
      } else if ( props.priceData !== undefined && props.priceData.status !== 200 && props.priceData.data !== state.priceData ) {
        return {
          showLoader                : false
        }
      }

    return null
  }

  showModal = (action, message, data) => {
    this.setState({showModal: true, modalMessage: message, modalAction: action, modalData: data})
  }

  dismissModal = () => {
    this.setState({showModal: false, modalMessage: '', modalAction: '', modalData: ''})
  }

  handleModalAction = () => {
    if ( this.state.modalAction && this.state.modalAction === 'removePackage' ) {
      this.removePackage();
    }

    if ( this.state.modalAction && this.state.modalAction === 'cancelMembership' ) {
      this.cancelMembership()
    }
  }

  removePackage = () => {
    if ( this.state.modalData ) {
      let formData = {
        balance_units       : 0,
        patient_package_id  : this.state.modalData.patient_package_id,
        patient_product_id  : this.state.modalData.product_id,
        total_balance_units : this.state.modalData.total_units,
      }

      this.props.removeWalletPackage(this.state.clientID, formData)

      this.setState({showLoader: true, showModal: false})
    }
  }


  showPaymentDetails = () => {
    this.setState({showPaymentDetails: true, showMembershipSection: true, showNewCardSection: false})
  }

  hidePaymentDetails = () => {
    this.setState({showPaymentDetails: false})
  }

  handleSubmitPayment = (e) => {
    e.preventDefault();

    toast.dismiss();

      this.setState({showLoader: true})

    this.state.stripe.createToken(cardNumber).then((response) => {
      if ( response.error ) {
        toast.error(response.error.message)
        this.setState({showLoader: false})
      } else {
        stripeToken = response.token.id;

        if ( stripeToken ) {
          let formData = {
            mstripeToken: stripeToken
          }
          this.props.updateMembershipCC(this.state.clientID, formData)

          this.setState({showLoader: true, showPaymentDetails: false})
        }
      }
    })
  }

  cancelMembership = () => {
    this.props.cancelMembership(this.state.clientID)

    this.setState({showLoader: true, showModal: false, showPaymentDetails: false})
  }

  changeMembershipCard = () => {
    var elements = this.state.stripe.elements();

    cardNumber  = elements.create('cardNumber');
    cardNumber.mount('#mem-card-number');

    cardExpiry  = elements.create('cardExpiry');
    cardExpiry.mount('#mem-card-expiry');

    cardCvc     = elements.create('cardCvc');
    cardCvc.mount('#mem-card-cvc');
    this.setState({showMembershipSection: false, showNewCardSection: true})
  }

  cancelUpdateMembershipCard = () => {
    this.setState({showMembershipSection: true, showNewCardSection: false})
  }

  handleProductChange = (event) => {
    const target    = event.target;
    let value       = target.value;
    let name        = event.target.name;
    let returnState = {}
    returnState[event.target.name] = value;
    this.setState(returnState);
    let formData    = {}
    formData.term    = value;
    formData.patient_id = this.state.clientID;

    if ( value.length > 2 ) {
      this.props.searchProduct(formData);
    }
    if ( value.length <= 2 ) {
      this.setState({
        showSearchResult: false,
        hidProductID    : 0
      })
    }
  }

  selectProduct = (obj) => {
    let productID    = 0;
    let productName  = '';
    let returnState  = {}

    if ( obj && obj.data && obj.data.id ) {
      productID     = obj.data.id
      productName   = obj.data.product_name
    }

    if ( productID && productID > 0 && productName ) {
      returnState.hidProductID      = productID
      returnState.product_name      = productName
      returnState.showSearchResult  = false
    }

    this.setState(returnState)

    this.getProductPrice(productID)
  }

  getProductPrice = (productID) => {
    productID     = productID || this.state.hidProductID
    let ref       = 'clinic_ref';
    let clinicID  = this.refs[ref].value

    if ( clinicID && productID ) {
      let formData = {
        clinic_id : clinicID,
        product_id: productID,
        patient_id: this.state.clientID
      }

      this.setState({showLoader: true})
      this.props.getProductPriceByClinic(formData)
    }
  }

  onChangeDatePicker = (value) => {
    this.setState(value)
  }

  render() {
    let returnTo      = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {

    }
    let crossImage    = '../../../../images/close.png';


    let isMonthlyMember      = 0;
    let patientName          = '';
    let stripeCusID          = '';
    let membershipFee        = 0;
    let creditBalance        = 0;
    let isMembershipOn       = 0;
    let packOptData          = '';
    let bogoOptData          = '';
    let clinicOptData        = '';
    let monthlyMemFee        = 0;
    let oneTimeFee           = 0;
    let totalFee             = 0;
    let membershipPlan       = '';
    let membershipType       = '';
    let isMemberShipAdded    = 0;
    let isFuturememberShip   = 0;
    let futureMemberShipDate = '';
    let monthlySubscribedFee = 0

    if ( this.state.clientWalletData && this.state.clientWalletData.patient_data ) {
      isMonthlyMember = this.state.clientWalletData.patient_data.is_monthly_membership
      patientName     = displayName(this.state.clientWalletData.patient_data)

      if (this.state.clientWalletData.patient_data.patient_membership_subscription ) {
        isMemberShipAdded     = (this.state.clientWalletData.patient_data.patient_membership_subscription.subscription_status === '0' && this.state.clientWalletData.patient_data.patient_membership_subscription.start_type === 'future') ? 1 : (this.state.clientWalletData.patient_data.patient_membership_subscription.subscription_status === '1' && this.state.clientWalletData.patient_data.patient_membership_subscription.start_type === 'immediate') ? 1 : 0

        isFuturememberShip    = (this.state.clientWalletData.patient_data.patient_membership_subscription.subscription_status === '0' && this.state.clientWalletData.patient_data.patient_membership_subscription.start_type === 'future') ? 1 : 0;

        futureMemberShipDate  = (this.state.clientWalletData.patient_data.patient_membership_subscription.subscription_started_at) ? showFormattedDate(this.state.clientWalletData.patient_data.patient_membership_subscription.subscription_started_at, false, 'YYYY-MM-DD') : null;
        monthlySubscribedFee  = this.state.clientWalletData.patient_data.patient_membership_subscription.mothly_membership_fees;
      }

      if ( this.state.clientWalletData.patient_data.client_wallet ) {
        membershipFee = this.state.clientWalletData.patient_data.client_wallet.membership_fee
        creditBalance = this.state.clientWalletData.patient_data.client_wallet.balance
      }

      if ( this.state.clientWalletData && this.state.clientWalletData.account_prefrence ) {
        isMembershipOn = this.state.clientWalletData.account_prefrence.is_membership_enable
        membershipPlan = this.state.clientWalletData.account_prefrence.recurly_program_name
        membershipType = this.state.clientWalletData.account_prefrence.monthly_membership_type

        monthlyMemFee = (membershipType === 'free') ? 0 : this.state.clientWalletData.account_prefrence.monthly_membership_fees;
        oneTimeFee    = this.state.clientWalletData.account_prefrence.one_time_membership_setup;
        if ( this.state.waiveOffOTFee ) {
          totalFee      = monthlyMemFee
        } else {
          totalFee      = monthlyMemFee + oneTimeFee
        }
      }

      if ( this.state.clientWalletData.patient_data.patient_membership_subscription ) {
        stripeCusID   = this.state.clientWalletData.patient_data.patient_membership_subscription.subscription_uuid;
      }
    }

    if ( this.state.clientWalletData && this.state.clientWalletData.all_packages ) {
      if ( this.state.clientWalletData.all_packages.length > 0 )  {
        packOptData = this.state.clientWalletData.all_packages.map((obj, idx) => {
          let units     = 0;
          let dataCount = 0;

          if ( obj.discount_package_product ) {
            if ( obj.discount_package_product.length > 0 )  {
                units += obj.discount_package_product.map((iobj, iidx) => {
                  return iobj.units;
              })
            }
            dataCount = Object.keys(obj.discount_package_product).length
          }

          return <option data-qty={parseFloat(units)} data-count={dataCount} key={idx} value={obj.id}>{obj.name}</option>
        })
      }
    }

    if ( this.state.clientWalletData && this.state.clientWalletData.all_bogos ) {
      if ( this.state.clientWalletData.all_bogos.length > 0 )  {
        bogoOptData = this.state.clientWalletData.all_bogos.map((obj, idx) => {
          return <option key={idx} value={obj.id}>{obj.name}</option>
        })
      }
    }

    if ( this.state.clientWalletData && this.state.clientWalletData.allClinics ) {
      if ( this.state.clientWalletData.allClinics.length > 0 )  {
        clinicOptData = this.state.clientWalletData.allClinics.map((obj, idx) => {
          return <option key={idx} value={obj.id}>{obj.clinic_name}</option>
        })
      }
    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">

        <div className={(this.state.showPaymentDetails === true ) ? 'modalOverlay' : ''}>

            <div className={(this.state.showPaymentDetails === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
              <div className="small-popup-header">
                <div className="popup-name">Membership Details</div>
                <a onClick={() => this.hidePaymentDetails()} className="small-cross">×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">

              <div className="prescription-content">
              <div className="doc-section row">
                <div className={(this.state.showMembershipSection) ? "col-xs-12 no-margin" : "col-xs-12 no-margin no-display"}> <span className="juvly-subtitle">Membership Details
                  <a onClick={() => this.showModal("cancelMembership", "Are you sure you want to cancel your monthly membership subscription?", '')} className="new-blue-btn pull-right">Cancel Membership</a>
                  {(monthlySubscribedFee > 0) && <a onClick={() => this.changeMembershipCard()} className="new-blue-btn pull-right">Change Card</a>}
                  </span>
                </div>
                <div className={(this.state.showMembershipSection) ? "col-xs-12 no-margin" : "col-xs-12 no-margin no-display"}>
                    <div className="row">
                      <div className="col-sm-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">START DATE</div>
                          <div className="setting-input-box">{(this.state.clientWalletData && this.state.clientWalletData.patient_data && this.state.clientWalletData.patient_data.patient_membership_subscription) ? showFormattedDate(this.state.clientWalletData.patient_data.patient_membership_subscription.subscription_started_at) : ''}</div>
                        </div>
                      </div>
                      <div className="col-sm-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">VALID UPTO DATE</div>
                          <div className="setting-input-box">{(this.state.clientWalletData && this.state.clientWalletData.patient_data && this.state.clientWalletData.patient_data.patient_membership_subscription) ? showFormattedDate(this.state.clientWalletData.patient_data.patient_membership_subscription.subscription_valid_upto) : ''}</div>
                        </div>
                      </div>
                      <div className="col-sm-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">MEMBERSHIP FEE</div>
                          <div className="setting-input-box">{(this.state.clientWalletData && this.state.clientWalletData.patient_data && this.state.clientWalletData.patient_data.patient_membership_subscription) ? numberFormat(this.state.clientWalletData.patient_data.patient_membership_subscription.mothly_membership_fees, 'currency') : ''}</div>
                        </div>
                      </div>
                      <div className="col-sm-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">ONE TIME SETUP FEE</div>
                          <div className="setting-input-box">{(this.state.clientWalletData && this.state.clientWalletData.patient_data && this.state.clientWalletData.patient_data.patient_membership_subscription) ? numberFormat(this.state.clientWalletData.patient_data.patient_membership_subscription.one_time_membership_setup, 'currency') : ''}</div>
                        </div>
                      </div>
                      {(this.state.clientWalletData !== undefined && this.state.clientWalletData.patient_data !== undefined && this.state.clientWalletData.patient_data.patient_membership_subscription  !== undefined && this.state.clientWalletData.patient_data.patient_membership_subscription !== null) && (this.state.clientWalletData.patient_data.patient_membership_subscription.stripe_card_details !== undefined && this.state.clientWalletData.patient_data.patient_membership_subscription.stripe_card_details !== '--') &&
                        <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">CARD DETAILS</div>
                            <div className="setting-input-box">{(this.state.clientWalletData && this.state.clientWalletData.patient_data && this.state.clientWalletData.patient_data.patient_membership_subscription) ? this.state.clientWalletData.patient_data.patient_membership_subscription.stripe_card_details : ''}</div>
                          </div>
                        </div>
                      }
                    </div>
                </div>
                <div className={(this.state.showNewCardSection) ? "col-xs-12 no-margin" : "col-xs-12 no-margin no-display"}>
                  <form onSubmit={this.handleSubmitPayment}>
                    <span className="juvly-subtitle">Card Details</span>
                    <div className="row">
                      <div className="col-sm-6 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">Credit card number <span className="required">*</span></div>
                          <div className="setting-input-box" id="mem-card-number"></div>
                        </div>
                      </div>
                      <div className="col-sm-2 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">Exp. Date <span className="required">*</span></div>
                          <div className="setting-input-box" id="mem-card-expiry"></div>
                        </div>
                      </div>
                      <div className="col-sm-2 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">CVC <span className="required">*</span></div>
                          <div className="setting-input-box" id="mem-card-cvc"></div>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <input type="submit" className="new-blue-btn pull-right" value="Save Card" />
                      <a onClick={() => this.cancelUpdateMembershipCard()} className="new-white-btn pull-right">Cancel</a>
                    </div>
                  </form>
                </div>
                  <div className="col-xs-12 no-margin">
                    <span className="juvly-subtitle">Membership Subscription Invoices</span>
                  </div>
                    <div className="table-responsive">
                      <table className="table-updated juvly-table no-hover">
                        <thead className="table-updated-thead">
                          <tr>
                            <th className="col-xs-3 table-updated-th">INVOICE#</th>
                            <th className="col-xs-3 table-updated-th text-right">INVOICE DATE</th>
                            <th className="col-xs-3 table-updated-th text-right">AMOUNT</th>
                            <th className="col-xs-3 table-updated-th text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="ajax_body">
                          {(this.state.showLoader === false && this.state.clientWalletData && this.state.clientWalletData.patient_data && this.state.clientWalletData.patient_data.monthly_membership_invoice && this.state.clientWalletData.patient_data.monthly_membership_invoice.length > 0 ) && this.state.clientWalletData.patient_data.monthly_membership_invoice.map((obj, idx) => {
                              return (
                                <tr key={idx} className="table-updated-tr">
                                  <td className="table-updated-td">{(obj.invoice_number) ? obj.invoice_number : ''}</td>
                                  <td className="table-updated-td">{(obj.created) ? showFormattedDate(obj.created) : ''}</td>
                                  <td className="table-updated-td">{(obj.amount) ? numberFormat(obj.amount, 'currency') : ''}</td>
                                  <td className="table-updated-td">{(obj.payment_status) ? obj.payment_status : ''}</td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                      {this.state.showLoader === false && <div className={this.state.clientWalletData && this.state.clientWalletData.patient_data && this.state.clientWalletData.patient_data.monthly_membership_invoice && this.state.clientWalletData.patient_data.monthly_membership_invoice.length > 0 ? "no-record no-display" : 'no-record'}>
                        No record found
                      </div>}
                    </div>

                </div>
              </div>
                </div>
              </div>
              </div>

        </div>

        <div className={(this.state.showModal === true ) ? 'overlay' : ''}></div>
        <div role="dialog" className={(this.state.showModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                <h4 className="modal-title">{this.state.languageData.client_conf_requierd}</h4>
              </div>
              <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                {this.state.modalMessage !== undefined ? this.state.modalMessage : ''}
              </div>
              <div className="modal-footer" >
                <div className="col-md-12 text-left">
                  <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.languageData.client_no}</button>
                  <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.handleModalAction}>{this.state.languageData.client_yes}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={(this.state.showEditPackageModal === true ) ? 'modalOverlay' : ''}>
          <form onSubmit={this.handleEditPackageSubmit}>
            <div className={(this.state.showEditPackageModal === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
              <div className="small-popup-header">
                <div className="popup-name">{this.state.languageData.wallet_edit_package}</div>
                <a onClick={() => this.hideEditPackageModal()} className="small-cross">×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">

              <div className="prescription-content">
              <div className="doc-section">
                <div className="col-xs-12 no-margin">

                  <div className="row">

                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_product}</div>
                        <div className="setting-input-box">{this.state.packageProductName}</div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_balance_units} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <input name="balance_units" placeholder="Enter Balance Units" className={this.state.balanceUnitClass} type="text" onChange={this.handleInputChange} autoComplete="off" value={this.state.balance_units}/>
                        </div>
                      </div>
                    </div>
                    </div>

                  </div>
                </div>
              </div>
                </div>
              </div>
              <div className="footer-static">
                <input type="submit" className="new-blue-btn pull-right" value={this.state.languageData.clientprofile_save} />
              </div>
              </div>
            </form>
        </div>

        <div className={(this.state.showCreditModal === true ) ? 'modalOverlay' : ''}>
          <form onSubmit={this.handleCreditSubmit}>
            <div className={(this.state.showCreditModal === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
              <div className="small-popup-header">
                <div className="popup-name">{this.state.creditMode} {this.state.languageData.wallet_text_credit}</div>
                <a onClick={() => this.hideCreditModal()} className="small-cross">×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">

              <div className="prescription-content">
              <div className="doc-section">
                <div className="col-xs-12 no-margin">

                  <div className="row">

                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_select_credit_type} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                        <select name="credit_type" className={this.state.creditTypeClass} onChange={this.handleInputChange} value={this.state.creditType}>
                         <option value="dollar">{this.state.languageData.wallet_dollar}</option>
                         <option value="bd">{this.state.languageData.wallet_bd}</option>
                         <option value="aspire">{this.state.languageData.wallet_aspire}</option>
                        </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_enter_amount_in} {getCurrencySymbol()} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <input name="credit_amount" placeholder={(this.state.creditMode === 'add') ? this.state.languageData.wallet_enter_credit_amount : this.state.languageData.wallet_enter_amount_remove} className={this.state.amountClass} type="text" autoComplete="off" onChange={this.handleInputChange} value={this.state.credit_amount}/>
                        </div>
                      </div>
                    </div>

                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_reason} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <input name="reason" placeholder={this.state.languageData.wallet_enter_reason} className={this.state.reasonClass} type="text" onChange={this.handleInputChange} autoComplete="off" value={this.state.reason}/>
                        </div>
                      </div>
                    </div>
                    </div>

                  </div>
                </div>
              </div>
                </div>
              </div>
              <div className="footer-static">
                <input type="submit" className="new-blue-btn pull-right" value={this.state.languageData.clientprofile_save} />
              </div>
              </div>
            </form>
        </div>


        <div className={(this.state.showPackageModal === true ) ? 'modalOverlay' : ''}>
          <form onSubmit={this.handlePackageSubmit}>
            <div className={(this.state.showPackageModal === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
              <div className="small-popup-header">
                <div className="popup-name">{this.state.languageData.wallet_add_product_package}</div>
                <a onClick={() => this.hidePackageModal()} className="small-cross">×</a>
              </div>
              <div className="small-popup-content">

                <div className="juvly-container">

                  <div className="p-text m-b-20">{this.state.languageData.wallet_select_what_add} <span className="required">*</span></div>
                  <div className="row m-b-0">
                    <div className="basic-checkbox-outer col-sm-4 col-xs-12 no-margin">
                      <input id="Product Package" className="basic-form-checkbox" type="radio" name="productType" value='product' checked={this.state.productType === 'product'} onChange={this.handleInputChange}/>
                      <label className="basic-form-text" htmlFor="Product Package">{this.state.languageData.wallet_product_package}</label>
                    </div>
                    <div className="basic-checkbox-outer col-sm-4 col-xs-12 no-margin">
                      <input id="Package Bogo" className="basic-form-checkbox" type="radio" name="productType" value='package' checked={this.state.productType === 'package'} onChange={this.handleInputChange}/>
                      <label className="basic-form-text" htmlFor="Package Bogo">{this.state.languageData.wallet_package_bogo}</label>
                    </div>
                    <div className="basic-checkbox-outer col-sm-4 col-xs-12 no-margin">
                      <input id="Product" className="basic-form-checkbox" type="radio" name="productType" value='actualProduct' checked={this.state.productType === 'actualProduct'} onChange={this.handleInputChange}/>
                      <label className="basic-form-text" htmlFor="Product">{this.state.languageData.wallet_product}</label>
                    </div>
                  </div>
                </div>
                <div className={(this.state.productType === 'product') ? "juvly-container" : "juvly-container no-display"}>
                  <div className="row">
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_select_package} <span className="required">*</span></div>
                        <select className={this.state.proPackageClass} name="package_id" onChange={this.handleInputChange} value={this.state.package_id}>
                          <option value="0">Select</option>
                          {packOptData}
                        </select>
                      </div>
                    </div>
                    <div className={this.state.unitsToAddClass}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_unit_to_add} <span className="required">*</span></div>
                        <input name="package_units" className={this.state.proPackageUnitsClass} type="text" onChange={this.handleInputChange} value={this.state.package_units} autoComplete="off" placeholder="Enter units"/>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={(this.state.productType === 'package') ? "juvly-container" : "juvly-container no-display"}>
                  <div className="row">
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_select_package}  <span className="required">*</span></div>
                        <select name="bogo_id" className={this.state.bogoPackageClass} onChange={this.handleInputChange} value={this.state.bogo_id}>
                          <option value="0">Select</option>
                          {bogoOptData}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={(this.state.productType === 'package') ? "table-responsive" : "table-responsive no-display"} >
                  {(this.state.bogoPackData && this.state.showBogoTable) && <table className="table-updated juvly-table no-hover">
                    <thead className="table-updated-thead">
                      <tr>
                        <th className="col-xs-4 table-updated-th">{this.state.languageData.wallet_product}</th>
                        <th className="col-xs-4 table-updated-th text-right">{this.state.languageData.wallet_buy_units}</th>
                        <th className="col-xs-4 table-updated-th text-right">{this.state.languageData.wallet_unit_used}</th>
                      </tr>
                    </thead>
                    <tbody className="ajax_body">
                      <tr className="table-updated-tr">
                        <td className="table-updated-td">{(this.state.bogoPackData) ? this.state.bogoPackData.main_product_name: ''}</td>
                        <td className="table-updated-td text-right">{(this.state.bogoPackData) ? this.state.bogoPackData.bogo_product_quantity: 0}</td>
                        <td className="table-updated-td text-right"><input autoComplete="off" name="mainBogoUnitsUsed" className={this.state.bogoMainUnitClass} type="text" onChange={this.handleInputChange} value={this.state.mainBogoUnitsUsed}/></td>
                        <td className="no-display"><input name="mainUnitRef" type="hidden" ref="mainBogoUnitRef" value={(this.state.bogoPackData) ? this.state.bogoPackData.bogo_product_quantity: 0} disabled={true} /></td>
                      </tr>
                      <tr className="table-updated-tr">
                        <td className="table-updated-td">{(this.state.bogoPackData) ? this.state.bogoPackData.free_product_name: ''}</td>
                        <td className="table-updated-td text-right">{(this.state.bogoPackData) ? this.state.bogoPackData.bogo_free_product_quantity: 0}</td>
                        <td className="table-updated-td text-right"><input autoComplete="off" name="freeBogoUnitsUsed" className={this.state.bogoFreeUnitClass} type="text" onChange={this.handleInputChange} value={this.state.freeBogoUnitsUsed}/></td>
                        <td className="no-display"><input name="freeUnitRef" type="hidden" ref="freeBogoUnitRef" value={(this.state.bogoPackData) ? this.state.bogoPackData.bogo_free_product_quantity: 0} disabled={true} /></td>
                      </tr>
                    </tbody>
                  </table>}
                  <div className="no-record no-display">
                    {this.state.languageData.clientprofile_no_rec_found}
                  </div>
                </div>
                <div className={(this.state.productType === 'actualProduct') ? "juvly-container" : "juvly-container no-display"}>
                  <div className="row">
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_select_product} <span className="required">*</span></div>
                        <input autoComplete="off" name="product_name" className={this.state.productClass} type="text" onChange={this.handleProductChange} value={this.state.product_name} placeholder={this.state.languageData.wallet_type_to_search}/>
                        <ul className={(this.state.productData && this.state.productData.length && this.state.showSearchResult) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"}>
                        {this.state.productData && this.state.productData.length && this.state.productData.map((obj, idx) => {
                            return(
                                <li key={"product_"+idx} onClick={() => this.selectProduct(obj)}>
                                  <a>
                                      {obj && obj.data && obj.data.product_name && capitalizeFirstLetter(obj.data.product_name)}
                                  </a>
                                </li>
                              )
                          })}
                        </ul>
                        <ul className={(this.state.productData && !this.state.productData.length && this.state.showSearchResult) ? "search-dropdown" : " cal-dropdown clinicname-dropdown no-display"}>
                        {( this.state.productData && this.state.productData.length === 0 ) &&
                          <li><a>{this.state.languageData.wallet_no_search_result}</a></li>
                         }
                        </ul>

                      </div>
                    </div>
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_unit_to_add} <span className="required">*</span></div>
                        <input name="product_units" className={this.state.productUnitClass} type="text" onChange={this.handleInputChange} value={this.state.product_units} autoComplete="off" placeholder={this.state.languageData.wallet_enter_units} />
                      </div>
                    </div>
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_select_clinic} <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                        <select ref="clinic_ref" name="proClinicId" className={this.state.productClinicClass} onChange={this.handleInputChange} value={this.state.proClinicId} >
                         {clinicOptData}
                        </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.languageData.wallet_price_per_unit}  <span className="required">*</span></div>
                        <input name="price_per_unit" className={this.state.productPriceClass} type="text" onChange={this.handleInputChange} value={this.state.price_per_unit} autoComplete="off" placeholder={this.state.languageData.wallet_enter_price_per_units}/>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
                <div className="footer-static">
                  <input type="submit" className="new-blue-btn pull-right" value={this.state.languageData.clientprofile_save} />
                </div>
              </div>
            </form>
        </div>

        <div className={(this.state.showMembershipModal === true ) ? 'modalOverlay' : ''}>
          <form onSubmit={this.handleMembershipSubmit}>
            <div className={(this.state.showMembershipModal === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
              <div className="small-popup-header">
                <div className="popup-name">{this.state.languageData.clientprofile_add_membership}</div>
                <a onClick={() => this.hideMembershipModal()} className="small-cross">×</a>
              </div>
              <div className="small-popup-content">

              <div className="juvly-container">

                <div className="row">
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">Membership Plan</div>
                      <div className="setting-input-box">{membershipPlan}</div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">Membership Type</div>
                      <div className="setting-input-box">{membershipType.toUpperCase()}</div>
                    </div>
                  </div>
                  {(membershipType === 'paid') &&
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{membershipPlan} (Recurring Per Month)</div>
                        <div className="setting-input-box">{numberFormat(this.state.monthly_membership_fees, 'currency', 2)}</div>
                      </div>
                    </div>
                  }
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">One Time Setup Fee</div>
                      <div className="setting-input-box">{numberFormat(((!this.state.waiveOffOTFee) ? this.state.one_time_membership_setup : 0.00), 'currency', 2)}</div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">Total</div>
                      <div className="setting-input-box">{numberFormat(((!this.state.waiveOffOTFee) ? (this.state.total_membership_without_waive) : this.state.total_membership_with_waive), 'currency', 2)}</div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">Client Email <span className="required">*</span></div>
                      <input name="patientEmail" className={this.state.patientEmailClass} onChange={this.handleInputChange} type="text" value={this.state.patientEmail} autoComplete="off" placeholder="Enter Email"/>
                    </div>
                  </div>
                  <div className="col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">Start Date <span className="required">*</span></div>
                      <CustomDatePicker
                        name="subscription_started_at"
                        onChangeDatePicker={this.onChangeDatePicker}
                        minDate={new Date()}
                        maxDate={new Date(moment().add(10, "years").toDate())}
                        value={this.state.subscription_started_at}
                        class={this.state.subscription_started_atClass}
                        format={dateFormatPicker()}
                      />
                    </div>
                  </div>
                  {(this.state.one_time_membership_setup > 0) &&
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">Waive Setup Fee</div>
                        <input type="checkbox" className="new-check" value={this.state.waiveOffOTFee} name="waiveOffOTFee" onChange={this.handleInputChange}/>
                      </div>
                    </div>
                  }

                </div>

                <div className={((!this.state.waiveOffOTFee && this.state.total_membership_without_waive > 0) || (this.state.waiveOffOTFee && this.state.total_membership_with_waive > 0)) ? '' : 'no-display'}>
                  <div className="juvly-subtitle">Payment Details</div>
                  <div className='row'>
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">Credit card number <span className="required">*</span></div>
                        <div className="setting-input-box" id="card-number"></div>
                      </div>
                    </div>
                    <div className="col-sm-2 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">Exp. Date <span className="required">*</span></div>
                        <div className="setting-input-box" id="card-expiry"></div>
                      </div>
                    </div>
                    <div className="col-sm-2 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">CVC <span className="required">*</span></div>
                        <div className="setting-input-box" id="card-cvc"></div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
                </div>
                <div className="footer-static">
                  <input type="submit" className="new-blue-btn pull-right" value="Save" />
                </div>
              </div>
            </form>
        </div>


          <div className="juvly-section full-width m-t-15">
            <div className="juvly-container">
              <div className="juvly-title m-b-40">{(this.state.showLoader === false) && <span>{this.state.languageData.wallet_heading} {patientName}</span>}
                <Link to={returnTo} className="pull-right"><img src={crossImage}/></Link>
              </div>
              <div className="row">
              {/*<div className="col-sm-8 col-xs-12">
                  {(isMemberShipAdded === 1 && this.state.showLoader === false) ?
                      (isFuturememberShip === 1) ?
                      <div className="text-left">
                        <span>Will start on: {showFormattedDate(futureMemberShipDate)}<br />
                          <a className="confirm-model" onClick={() => this.showModal("cancelMembership", "Are you sure you want to cancel your monthly membership subscription?", '')}> Cancel Membership</a>
                        </span>
                      </div>
                      :
                      <div className="membershipPrice text-left dashboard-bal">
                        {numberFormat(membershipFee, 'currency')}
                      </div>
                      :
                      null
                  }

                  {(isMonthlyMember === 0 && isMemberShipAdded === 0 && this.state.showLoader === false && isMembershipOn === 1) && <a onClick={() => this.showMembershipModal()} className="pull-left new-blue-btn add-mon-mem-btn no-margin-left">Add Monthly Membership</a>}

                  {(this.state.showLoader === false && isMembershipOn === 1) && <div className="new-field-label text-left">MEMBERSHIP/MONTH</div>}
                </div>*/}

                <div className="col-xs-12 text-right total-wallet-value">
                {(this.state.showLoader === false) && <div className="dashboard-bal">{numberFormat(creditBalance, 'currency')}</div>}
                  <div className="new-field-label">{this.state.languageData.wallet_total_wallet_value}</div>
                </div>

              </div>
            </div>
            <div className="juvly-container border-top">
              <div className="juvly-title m-b-0">{this.state.languageData.wallet_what_is_in_wallet}  <a onClick={() => this.showPackageModal()} className="pull-right new-blue-btn">{this.state.languageData.wallet_add_product_package}</a></div>
            </div>
            <div className="table-responsive fixed-header-table">
              <table className="table-updated juvly-table no-hover table-min-width table-fixed">
              <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-5 table-updated-th">{this.state.languageData.wallet_item}</th>
                    <th className="col-xs-2 table-updated-th text-right">{this.state.languageData.wallet_balance_unit}</th>
                    <th className="col-xs-2 table-updated-th text-right">{getCurrencySymbol()} {this.state.languageData.wallet_balance}</th>
                    <th className="col-xs-3 table-updated-th text-center">{this.state.languageData.wallet_action}</th>
                  </tr>
                </thead>
                <Scrollbars style={{ height:217}} className="custome-scroll">
                <tbody className="ajax_body">{(this.state.showLoader === false && this.state.clientWalletData && this.state.clientWalletData.data && this.state.clientWalletData.data.length > 0) && this.state.clientWalletData.data.map((obj, idx) => {
                      let dBalance = ''
                      if ( obj && obj.row_type === 'product' ) {
        								if ( obj.balance > 0 ) {
        									dBalance = numberFormat(obj.balance, 'currency')
        								} else {
        									dBalance = 'free';
        								}
        							}
                      return (
                        <React.Fragment key={idx}>
                          {(obj && obj.row_type === 'product') ? <tr key={'product_'+idx} className="table-updated-tr">
                            <td className="col-xs-5 table-updated-td">{(obj.product_name) ? obj.product_name : "NA"}</td>
                            <td className="col-xs-2 table-updated-td text-right">{(obj.balance_units) ? numberFormat(obj.balance_units, 'decimal', 2) : ''}</td>
                            <td className="col-xs-2 table-updated-td text-right">{dBalance}</td>
                            <td className="col-xs-3 table-updated-td text-center">
                              <a onClick={() => this.showEditPackageModal(obj)} className="easy-link">{this.state.languageData.client_edit}</a>
                              <a onClick={() => this.showModal("removePackage", "Are you sure? You won't be able to revert this!", obj)} className="easy-link">{this.state.languageData.wallet_remove}</a>
                            </td>
                          </tr>
                            :
                            (obj && obj.row_type === 'credit' && obj.credit_type !== 'egiftcard') ? <tr key={'credit_'+idx} className="table-updated-tr">
                              <td className="col-xs-5 table-updated-td"><b>{(obj.product_name) ? obj.product_name : "NA"}</b></td>
                              <td className="col-xs-2 table-updated-td text-right">&nbsp;</td>
                              <td className="col-xs-2 table-updated-td text-right">{numberFormat((obj.balance) ? obj.balance :0.00, 'currency') }</td>
                              <td className="col-xs-3 table-updated-td text-center">
                                {checkIfPermissionAllowed('add-remove-dollar-credits') && <div>
                                <a onClick={() => this.showCreditModal('add', obj.credit_type)} className="easy-link">{this.state.languageData.wallet_add}</a>
                                <a className="easy-link" onClick={() => this.showCreditModal('remove', obj.credit_type)}>{this.state.languageData.wallet_remove}</a></div>}
                              </td>
                            </tr> : <tr key={'egift_'+idx} className="table-updated-tr">
                              <td className="col-xs-5 table-updated-td"><b>{(obj.product_name) ? obj.product_name : "NA"}</b></td>
                              <td className="col-xs-2 table-updated-td text-right">&nbsp;</td>
                              <td className="col-xs-2 table-updated-td text-right">{numberFormat((obj.balance) ? obj.balance :0.00, 'currency') }</td>
                              <td className="col-xs-3 table-updated-td text-center"></td>
                            </tr>}


                            {/*((stripeCusID.indexOf('cus_') > -1 || membershipFee <= 0) && isMonthlyMember > 0 && idx === 2) && <tr key={'membership_'+idx} className="table-updated-tr">
                              <td className="col-xs-5 table-updated-td"><b>Membership - Monthly</b></td>
                              <td className="col-xs-2 table-updated-td text-right"></td>
                              <td className="col-xs-2 table-updated-td text-right">{numberFormat(membershipFee, 'currency')}</td>
                              <td className="col-xs-3 table-updated-td text-center">
                                <a onClick={() => this.showPaymentDetails()} className="easy-link">Payment details</a>
                              </td>
                            </tr>*/}
                        </React.Fragment>
                      )
                    })}
                </tbody>
                </Scrollbars>
              </table>
            </div>
            <div className="juvly-container">
              <div className="juvly-title m-b-0">{this.state.languageData.wallet_log_usage}</div>
            </div>
            <div className="table-responsive fixed-header-table">
              <table className="table-updated juvly-table no-hover table-min-width  table-fixed">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-2 table-updated-th">{this.state.languageData.wallet_date}</th>
                    <th className="col-xs-3 table-updated-th">{this.state.languageData.wallet_employee}</th>
                    <th className="col-xs-5 table-updated-th">{this.state.languageData.wallet_description}</th>
                    <th className="col-xs-2 table-updated-th text-right">{this.state.languageData.wallet_amount}</th>
                  </tr>
                  </thead>
                  <Scrollbars style={{ height:217}} className="custome-scroll">
                  <tbody className="ajax_body">
                  {
                    (this.state.showLoader === false && this.state.clientWalletData && this.state.clientWalletData.log_data && this.state.clientWalletData.log_data.length > 0 ) && this.state.clientWalletData.log_data.map((obj, idx) => {
                      let description   = obj.description;
                      description       = description.replace("_", " ");

                      let logBalance    = ''

                      if ( obj.type && obj.type === 'units' ) {
                        logBalance = obj.units + " Units"
                      } else {
                        logBalance = numberFormat(obj.amount, 'currency')
                      }

                      return (
                        <tr className="table-updated-tr" key={idx}>
                					<td className="col-xs-2 table-updated-td">{(obj.log_date) ? showFormattedDate(obj.log_date, true) : ''}</td>
                					<td className="col-xs-3 table-updated-td">{(obj.employee) ? capitalizeFirstLetter(obj.employee) : 'NA' }</td>
                					<td className="col-xs-5 table-updated-td">{(description) ? capitalizeFirstLetter(description) : '' }</td>
                					<td className="col-xs-2 table-updated-td text-right">{(logBalance) && logBalance}</td>
                				</tr>
                      )
                    })
                  }
                </tbody>
                </Scrollbars>

              </table>
              {this.state.showLoader === false && <div className={this.state.clientWalletData && this.state.clientWalletData.log_data && this.state.clientWalletData.log_data.length > 0 ? "no-record no-display" : 'no-record'}>
                {this.state.languageData.client_no_record_found}
              </div>}
            </div>
          </div>
        </div>
        <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader clientProfileLoader healthPrescriptionLoader' : 'new-loader text-left'}>
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

  if ( state.ClientsReducer.action === "GET_CLIENT_WALLET" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      if ( state.ClientsReducer.data.message === 'patient_not_found' ) {
        toast.dismiss();
        toast.error(languageData.global[state.ClientsReducer.data.message]);
        setTimeout(function() {
            window.location.href = '/clients';
        }, 1700)
      } else {
        toast.error(languageData.global[state.ClientsReducer.data.message]);
      }
    } else {
      returnState.clientWalletData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "ADD_CREDIT_TO_WALLET" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "REMOVE_CREDIT_FROM_WALLET" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "UPDATE_WALLET_PACKAGE" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "REMOVE_WALLET_PACKAGE" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "SEARCH_WALLET_PRODUCT" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.productData = state.ClientsReducer.data;
    } else {
      returnState.productData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "ADD_PACKAGE_PRODUCT" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.clientWalletData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "GET_BOGO_PACKAGE_DETAILS" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.bogoPackData = state.ClientsReducer.data;
    } else {
      returnState.bogoPackData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "GET_PRODUCT_PRICE_BY_CLINIC" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.priceData = state.ClientsReducer.data;
    } else {
      returnState.priceData = state.ClientsReducer.data;
    }
  }

  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getClientWallet: getClientWallet, addCreditToWallet: addCreditToWallet, removeCreditFromWallet: removeCreditFromWallet, updateWalletPackage: updateWalletPackage, removeWalletPackage: removeWalletPackage, updateMembershipCC: updateMembershipCC, cancelMembership: cancelMembership, addMonthyMembership: addMonthyMembership, searchProduct: searchProduct, addPackageProduct: addPackageProduct, getBogoPackageDetails: getBogoPackageDetails, getProductPriceByClinic: getProductPriceByClinic}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (ClientWallet);
