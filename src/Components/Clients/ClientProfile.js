import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {connect} from 'react-redux'
import { bindActionCreators } from "redux";
import {getClientDetail, fireClient, doNotCall, changePortaAccess, getClientCardData, saveClientCard, resendWelcomeEmail, resetPortalPassword, deleteClient, exportClientPDF, sendPostInstructions, getMembershipData, addMonthyMembership, cancelMembership, applyCouponCode, updateMembershipCC, searchProduct, getTreatmentTemplates, getTemplateDetails, savePAYGTreatmentPlan, getPlanDataByID, saveMonthlyTreatmentPlan, getProgramData, applyStartProgramDiscount, changeTreatmentPlanClinic, viewPriceBreakUp, startTreatmentProgram, cancelTreatmentPlan, savePlanAsTemplate, updatePlanCard, getPrescribeOnlyDetails, updatePrescribeOnly, doThisAction} from '../../Actions/Clients/clientsAction.js';
import {saveProcedurePrescription, deleteProcedurePrescription, sendProcedurePrescription, emptyProcedureReducer} from '../../Actions/Procedures/procedureActions.js';
import { emptyMembershipWallet, getMembershipMultiTier} from '../../Actions/Settings/membershipWalletActions.js';

import { ToastContainer, toast } from "react-toastify";
import config from '../../config';
import { checkIfPermissionAllowed, numberFormat, showFormattedDate, displayName, isNumber,toggleBodyScroll,validateEmail, getDateFormat,isFormSubmit, getIsMembershipEnabled, dateFormatPicker, isInt, capitalizeFirstLetter } from '../../Utils/services.js';
import { format } from 'date-fns';
import defVImage from '../../images/no-image-vertical.png';
import Lightbox from 'react-images';
import picClose from '../../images/popupClose.png';
import moment from 'moment';
import CustomDatePicker from '../Common/CustomDatePicker.js';
import { Scrollbars } from 'react-custom-scrollbars';
import calRight from '../../images/cal-right.png';
import TreatmentPlan from './TreatmentPlan.js';
import { SketchField, Tools } from 'react-sketch';
import axios from 'axios';
import { signProcedure,exportEmptyData } from '../../Actions/Settings/settingsActions.js';

const clientProfileInstance = axios.create();

clientProfileInstance.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error) {
   if(!error.response) {
      return {data : {data : "", message : "file_type_error", status : 400}}
   }
});

var cardNumber  = '';
var cardExpiry  = '';
var cardCvc     = '';
var stripeToken = '';

const initPaygElem = () => {
  return {
    product_name  : '',
    product_id    : '',
    units         : '',
    rep_val       : '',
    rep_by        : 'day'
  }
}

const initPaygElemClass = () => {
  return {
    product_name  : 'simpleInput',
    product_id    : 'simpleInput',
    units         : 'simpleInput',
    rep_val       : 'simpleInput p-r-5',
    rep_by        : 'simpleInput'
  }
}

const initMonthlyElem = () => {
  return {
    product_name  : '',
    units         : '',
    month         : '',
    product_id    : '',
  }
}

const initMonthlyElemClass = () => {
  return {
    product_name  : 'simpleInput',
    units         : 'simpleInput',
    month         : 'simpleInput',
    product_id    : 'simpleInput',
  }
}

var dayOfMonth  = moment().format('D');

if ( dayOfMonth > 28 ) {
  dayOfMonth = 1;
}

const initPrescriptionField = () => {
  return {
    medicine_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    medicineNameClass: 'setting-input-box',
    dosageClass: 'setting-input-box',
    frequencyClass: 'setting-input-box',
    durationClass: 'setting-input-box'
  }
}


class ClientProfile extends Component {
  constructor(props) {
    super(props);

    this.runCarousel    = this.runCarousel.bind(this);
    this.selectProduct  = this.selectProduct.bind(this);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))
    const userData      = JSON.parse(localStorage.getItem('userData'));
    let showSigPopup = userData.user.show_signature_popup;

    // get default-timeline from localStorage
    let defTimeLine = localStorage.getItem("defTimeLine");
    // set default-timeline into localStorage from logged user's account_preference
    if(!defTimeLine){
      if(userData){
        defTimeLine = (userData.account_preference !== undefined && userData.account_preference.default_template !== undefined) ? userData.account_preference.default_template : 'cosmetic'
      } else {
        defTimeLine = "cosmetic"
      }
      localStorage.setItem("defTimeLine",defTimeLine);
    }

    this.state = {
      clientID              : this.props.match.params.id,
      globalLang            : languageData.global,
      roomTextData          : languageData.rooms,
      showLoader            : false,
      clientData            : [],
      userData              : userData,
      showModal             : false,
      modalMessage          : '',
      modalAction           : '',
      modalActType          : '',
      isSliderCheck         : false,
      defTimeLine           : (defTimeLine) ? defTimeLine : '',
      appendedImagesData    : [],
      def_no_image_vertical : defVImage,
      fireData              : [],
      fireStatus            : null,
      dncData               : [],
      dncStatus             : null,
      portalAccessData      : [],
      portalAccessStatus    : null,
      showPrescriptionModal : false,
      prescriptionField     : [initPrescriptionField()],
      prescriptionValue     : [],
      prescriptionProcedureId     : 0,
      showCCPopup           : false,
      cardData              : [],
      clicnicForCard        : 0,
      savedTime             : null,
      resendStatus          : null,
      showResetPassModal    : false,
      resetPassClass        : "setting-input-box p-r-40",
      resetPortalPasswordStatus : null,
      deleteData            : [],
      deleteStatus          : null,
      lightboxIsOpen        : false,
			currentImage          : 0,
      lightboxImage         : null,
      resetPassType         : 'password',
      eyeClass              : 'client-treat-cal pass-hidden',
      apptIDToSend          : '',
      patientSkinScore      : {},
      showSkinModal         : false,
      modalSkinMessage      : '',
      showMembershipModal   : false,
      showMembershipSection : false,
      showNewCardSection    : false,
      waiveOffOTFee         : false,

      membership_tier                 : 'single',
      membership_tier_id              : '',
      membership_tier_idClass         : 'simpleInput',
      membership_tier_types           : [],
      membership_tier_type_products   : '',
      membership_on_all_product       :0,
      discount_percentage             :0,
      monthly_membership_type         :'free',
      monthly_membership_fees         : 0,
      one_time_membership_setup       : 0,
      total_membership_with_waive     : 0,
      total_membership_without_waive  : 0,
      subscription_started_at         : new Date(),
      subscription_started_atClass    : 'simpleInput',
      recurly_program_name            : '',
      patientEmailClass               : 'simpleInput',
      patientEmail                    : '',
      showImmediateMembershipModal    : false,
      showFutureMembershipModal       : false,
      couponCodeClass                 : 'simpleInput',
      couponCode                      : '',
      discountCouponApplied           : 0,
      totalDiscount                   : 0,
      drawDate                        : dayOfMonth,
      isMembershipOn                  : 0,
      showTreatmentModal              : false,
      showCreateTreatModal            : false,
      treatType                       : 'payg',
      showPaygSection                 : true,
      showMonthlySection              : false,
      expirePlanAfter                 : 0,
      treatmentStartOn                : new Date(),
      multiplePaygList                : [initPaygElem()],
      multiplePaygClassList           : [initPaygElemClass()],
      showSearchResult                : false,
      selProIndex                     : 0,
      showTemplateConfirmation        : false,
      showPreviewBtn                  : false,
      showGenerateBtn                 : false,
      multipleMonthlyListDefObj       : initMonthlyElem(),
      multipleMonthlyList             : [],
      skinGoal                        : '',
      multipleMonthlyClassDefObj      : initMonthlyElemClass(),
      multipleMonthlyClassList        : [],
      skinGoalClass                   : 'simpleInput',
      prescribeOnly                   : '0',
      requestType                     : 'add',
      requestMode                     : 'new',
      treatmentPlanID                 : 0,
      languageData                    : languageData.clients,
      showPreviewDetails              : false,
      showStartProgram                : false,
      cardType                        : 'new',
      chargeType                      : 'later',
      canExpireProduct                : 0,
      taxAmount                       : '',
      discountValue                   : '',
      htmlGenerator                   : '',
      discountType                    : 'percentage',
      returnFromStartProgram          : false,
      showNewCardInput                : false,
      cardNumberArray                 : [],
      proClinicOptData                : '',
      startProTotal                   : 0,
      startProMonthly                 : 0,
      discountOuterClass              : 'TP-discount-outer',
      showPriceBreakModal             : false,
      taxOuterClass                   : 'TP-discount-outer',
      subscriptionID                  : 0,
      showChangePlanCCPopup           : false,
      showSaveTemplate                : false,
      templateName                    : '',
      templateNameClass               : 'simpleInput',
      showPresOnlyPopup               : false,
      treatmentAction                 : '',

      showSigPopup:(showSigPopup)? 1 : 0,
      showSignModal: false,
      canvasClass : "signature-box sig-div",
      inputOut    : 'input-outer no-display',
      clearClass  : 'new-white-btn no-margin clear no-display',
      resetClass  : 'new-blue-btn reset no-display',
      changeClass : 'new-blue-btn no-margin Change',
      uploadedSignature: '',
      uploadedSignature_url:'',

      save_sign: false,
    }

    window.onscroll = () => {
      return false;
    }

    this.closeLightbox = this.closeLightbox.bind(this);
		this.gotoImage = this.gotoImage.bind(this);
		this.openLightbox = this.openLightbox.bind(this);
  }

  openLightbox (index, event, src) {
		event.preventDefault();
		this.setState({
			currentImage: index,
			lightboxIsOpen: true,
      lightboxImage: src
		});
	}


	closeLightbox () {
		this.setState({
			currentImage: 0,
			lightboxIsOpen: false,
      lightboxImage: null
		});
	}

  gotoImage (index) {
		this.setState({
			currentImage: index,
		});
	}

  componentDidMount() {
    this.setState({
      showLoader                     : true,
      showCCPopup                    : false,
      showMembershipModal            : false,
      showImmediateMembershipModal   : false,
      showFutureMembershipModal      : false,
      showTreatmentModal             : false,
      showCreateTreatModal           : false,
      treatType                      : 'payg',
      showPaygSection                : true,
      showMonthlySection             : false,
      showTemplateConfirmation       : false,
      showPreviewBtn                 : false,
      showGenerateBtn                : false,
      multipleMonthlyList            : [],
      returnFromStartProgram         : false,
      showPriceBreakModal            : false,
      canExpireProduct               : 0,
      subscriptionID                 : 0,
      showChangePlanCCPopup          : false,
      showSaveTemplate               : false,
      templateName                   : '',
      showPresOnlyPopup              : false,
      treatmentAction                : ''
    });

    this.state.clientScopes = 'cardOnFiles,procedures';
    this.props.getClientDetail(this.state.clientID, this.state.clientScopes);

    if ( window.Stripe ) {
      this.setState({stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY)});
    } else {
      document.querySelector('#stripe-js').addEventListener('load', () => {
        // Create Stripe instance once Stripe.js loads
        this.setState({stripe: window.Stripe(config.STRIPE_PUBLISHABLE_KEY)});
      });
    }

    const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
    datePicker1.childNodes[0].setAttribute("readOnly",true);
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.clientData !== undefined && props.clientData.status === 200 && props.clientData.data !== state.clientData ) {

      let src                 = '../../../images/user.png';
      let clientID            = '';
      let clientName          = '';
      let patientSkinScore    = {};
      let modalSkinMessage    = '';

      if ( props.clientData.data !== undefined && props.clientData.data.user_image !== '' && props.clientData.data.user_image_url !== '' ) {
        src = props.clientData.data.user_image_url
      }

      if ( props.clientData.data !== undefined && props.clientData.data ) {
        clientID    = props.clientData.data.id;
        clientName  = displayName(props.clientData.data)
        if (props.clientData.data.patients_skin_score) {
          patientSkinScore = props.clientData.data.patients_skin_score;
          modalSkinMessage    = props.clientData.data.patients_skin_score.skin_discription;
        }
      }

      let recentlyViewedSaved           = JSON.parse(localStorage.getItem('recentlyViewedData'));

      if ( recentlyViewedSaved ) {
        let clientIDArray = [];

        if ( recentlyViewedSaved.length > 0 ) {
          recentlyViewedSaved.map((obj, idx) => {
            if ( obj.profile_id === props.clientData.data.id) {
              obj.profile_name  = clientName;
              obj.profile_pic   = src;
            }
            clientIDArray.push(obj.profile_id)
          })
        }

        localStorage.removeItem('recentlyViewedData');
        localStorage.setItem("recentlyViewedData", JSON.stringify(recentlyViewedSaved));

        if ( clientIDArray.indexOf(clientID) === -1 ) {
          let recentlyViewedData              = {};
          recentlyViewedData['profile_pic']   = src;
          recentlyViewedData['profile_id']    = clientID;
          recentlyViewedData['profile_name']  = clientName;
          recentlyViewedSaved.push(recentlyViewedData);

          localStorage.removeItem('recentlyViewedData');
          localStorage.setItem("recentlyViewedData", JSON.stringify(recentlyViewedSaved));
        }
      } else {
        let viewedArray                     = []
        let recentlyViewedData              = {};
        recentlyViewedData['profile_pic']   = src;
        recentlyViewedData['profile_id']    = clientID;
        recentlyViewedData['profile_name']  = clientName;
        viewedArray[0]                      = recentlyViewedData;

        localStorage.setItem("recentlyViewedData", JSON.stringify(viewedArray));
      }

      let defTimeLine = localStorage.getItem("defTimeLine");
      if(!defTimeLine){
        if(props.clientData.data){
          defTimeLine = (props.clientData.data.account_preference !== undefined && props.clientData.data.account_preference.default_template !== undefined) ? props.clientData.data.account_preference.default_template : 'cosmetic'
        } else {
          defTimeLine = "cosmetic"
        }
        localStorage.setItem("defTimeLine",defTimeLine);
      }

      let isMembershipOn = (props.clientData.data.is_monthly_membership) ? props.clientData.data.is_monthly_membership : 0;
      if ( props.clientData.data && props.clientData.data.account_prefrences && props.clientData.data.account ) {
        if ( props.clientData.data.account.account_type === 'paid' && props.clientData.data.account_prefrences.is_membership_enable === 1 ) {
          //isMembershipOn = 1;
        }
      }

      if ( state.clientData && props.clientData.data && state.clientData.active_treamtment_plan === 0 && (state.clientData.active_treamtment_plan !== props.clientData.data.active_treamtment_plan) ) {
        defTimeLine = "treatmentPlan";
      }

      if ( state.requestType && state.requestType === 'edit' ) {
        defTimeLine = "treatmentPlan";
      }

      if ( state.returnFromStartProgram && state.returnFromStartProgram === true ) {
        defTimeLine = "treatmentPlan";
      }
      let showSigPopup = state.showSigPopup;
      let canvasClass           = 'signature-box sig-div';
      let inputOut              = 'input-outer no-display';
      let clearClass            = 'new-white-btn no-margin clear';
      let resetClass            = 'new-blue-btn reset ';
      let changeClass           = 'new-blue-btn no-margin Change no-display';
      let signature_url         = '';
      let signature             = '';

      if(props.clientData.data.login_user){
        console.log('props.clientData.data.login_user',props.clientData.data.login_user);
        showSigPopup = (props.clientData.data.login_user.show_signature_popup) ? 1 : 0
        if(props.clientData.data.login_user.signature_url){
          canvasClass  = 'signature-box sig-div no-display';
          inputOut = 'input-outer';
          clearClass = 'new-white-btn no-margin clear no-display';
          resetClass = 'new-blue-btn reset no-display';
          changeClass = 'new-blue-btn no-margin Change';
          signature_url  = props.clientData.data.login_user.signature_url;
          signature = props.clientData.data.login_user.signature;
        }
      }

      return {
        clientData                     : props.clientData.data,
        showLoader                     : false,
        defTimeLine                    : defTimeLine, //(localStorage.getItem("defTimeLine") !== null && localStorage.getItem("defTimeLine") !== '') ? localStorage.getItem("defTimeLine") : props.clientData.data.account_prefrences.default_template,
        patientSkinScore               : patientSkinScore,
        modalSkinMessage               : modalSkinMessage,
        showCCPopup                    : false,
        showMembershipModal            : false,
        showImmediateMembershipModal   : false,
        showFutureMembershipModal      : false,
        isMembershipOn                 : isMembershipOn, //(getIsMembershipEnabled()) ? 1 : 0 //isMembershipOn
        showTreatmentModal             : false,
        showCreateTreatModal           : false,
        treatType                      : 'payg',
        showPaygSection                : true,
        showMonthlySection             : false,
        showTemplateConfirmation       : false,
        showPreviewBtn                 : false,
        showGenerateBtn                : false,
        multipleMonthlyList            : [],
        requestType                    : 'add',
        treatmentPlanID                : (props.clientData.data.current_treatment_plan) ? props.clientData.data.current_treatment_plan.id : 0,
        returnFromStartProgram         : false,
        startProTotal                  : (props.clientData.data.current_treatment_plan) ? props.clientData.data.current_treatment_plan.total_amount : 0,
        startProMonthly                : (props.clientData.data.current_treatment_plan) ? props.clientData.data.current_treatment_plan.monthly_amount : 0,
        showPriceBreakModal            : false,
        showChangePlanCCPopup          : false,
        showSaveTemplate               : false,
        templateName                   : '',
        showPresOnlyPopup              : false,
        treatmentAction                : '',
        // Signature pop-up
        uploadedSignature     : '',
        uploadedSignature_url : '',
        save_sign             : false,
        signature_url         : signature_url,
        signature             : signature_url,
        showSigPopup          : showSigPopup,
        canvasClass           : canvasClass,
        inputOut              : inputOut,
        clearClass            : clearClass,
        resetClass            : resetClass,
        changeClass           : changeClass,
        signature_url         : signature_url,
        signature             : signature,
      }
    } else if ( props.clientData !== undefined && props.clientData.status !== 200 && props.clientData.data !== state.clientData ) {
      return {
        clientData       : props.clientData.data,
        showLoader       : false,
      }
    } else if ( props.clientData !== undefined && props.clientData.status !== 200 && props.clientData.data !== state.clientData ) {
      return {
        clientData       : props.clientData.data,
        showLoader       : false,

      }
    }

    if ( props.fireData !== undefined && props.fireData.status === 200 && props.fireData.data !== state.fireData ) {
      return {
        fireData     : props.fireData,
        fireStatus   : props.fireData.message
      }
    }

    if ( props.dncData !== undefined && props.dncData.status === 200 && props.dncData.data !== state.dncData ) {
      return {
        dncData       : props.dncData,
        dncStatus     : props.dncData.message
      }
    }

    if ( props.portalAccessData !== undefined && props.portalAccessData.status === 200 && props.portalAccessData.data !== state.portalAccessData ) {
      return {
        portalAccessData       : props.portalAccessData,
        portalAccessStatus     : props.portalAccessData.message
      }
    }

    if ( props.cardData !== undefined && props.cardData.status === 200 && props.cardData.data !== state.cardData ) {
      return {
        cardData          : props.cardData.data,
        showCCPopup       : true,
        showLoader        : false
      }
    } else if ( props.cardData !== undefined && props.cardData.status !== 200 && props.cardData.data !== state.cardData ) {
      return {
        cardData          : props.cardData.data,
        showLoader        : false
      }
    }

    if ( props.saveCCData !== undefined && props.saveCCData.status === 200 && props.saveCCData.data !== state.saveCCData ) {
      return {
        savedTime     : props.saveCCData.data,
        showCCPopup   : false
      }
    } else if ( props.saveCCData !== undefined && props.saveCCData.status !== 200 ) {
      return {
        showLoader    : false
      }
    }

    if ( props.resendEmailData !== undefined && props.resendEmailData.status === 200 && props.resendEmailData.data !== state.resendEmailData ) {
      return {
        resendEmailData : props.resendEmailData.data,
        resendStatus    : props.resendEmailData.data,
      }
    }

    if ( props.resetPortalPasswordData !== undefined && props.resetPortalPasswordData.status === 200 && props.resetPortalPasswordData.data !== state.resetPortalPasswordData ) {
      return {
        resetPortalPasswordData   : props.resetPortalPasswordData.data,
        resetPortalPasswordStatus : props.resetPortalPassword.data,
      }
    }

    if ( props.deleteData !== undefined && props.deleteData.status === 200 && props.deleteData.data !== state.deleteData ) {
      return {
        deleteData        : props.deleteData.data,
        deleteStatus      : props.deleteData.data,
      }
    }

    if ( props.exportClientPDFData !== undefined && props.exportClientPDFData.status === 200 && props.exportClientPDFData.data !== state.exportClientPDFData ) {
       let returnState                  = {};
       returnState.exportClientPDFData  = props.exportClientPDFData.data;
       returnState.showLoader           = false;

       if ( props.exportClientPDFData.data && props.exportClientPDFData.data.file ) {
         //window.location.href           = props.exportClientPDFData.data.file;
         window.open(props.exportClientPDFData.data.file);
       }

       return returnState
     } else if ( props.exportClientPDFData !== undefined && props.exportClientPDFData.status !== 200 && props.exportClientPDFData.data !== state.exportClientPDFData ) {
       return {
         showLoader          : false,
         exportClientPDFData : props.exportClientPDFData.data,
       }
     }

     if ( props.sendPostInsData !== undefined && props.sendPostInsData.status === 200 && props.sendPostInsData.data !== state.sendPostInsData ) {
       return {
         sendPostInsData  : props.sendPostInsData.data,
         showLoader       : false
       }
     } else if ( props.sendPostInsData !== undefined && props.sendPostInsData.status !== 200 && props.sendPostInsData.data !== state.sendPostInsData ) {
       return {
         sendPostInsData  : props.sendPostInsData.data,
         showLoader       : false
       }
     }

     if ( props.healthProcedurePrescription !== undefined && props.healthProcedurePrescription.status === 200 && props.healthProcedurePrescription.data !== state.healthProcedurePrescription ) {
       toggleBodyScroll(false)
       props.emptyProcedureReducer()
       return {
         savedTime     : props.healthProcedurePrescription.data,
         showPrescriptionModal: false,
         isSendEmail           : false,
         prescriptionProcedureId: 0,
       }
     } else if ( props.healthProcedurePrescription !== undefined && props.healthProcedurePrescription.status !== 200 ) {
       props.emptyProcedureReducer()
       return {
         showLoader    : false
       }
     }

     if ( props.membershipData !== undefined && props.membershipData.status === 200 && props.membershipData.data !== state.membershipData ) {
       let monthly_membership_type    = 'free';
       let monthly_membership_fees    =  0;
       let one_time_membership_setup  =  0;
       let recurly_program_name       = '';
       let membership_tier            = 'single';
       let membership_tier_id         = '';
       let membership_on_all_product  = 0;
       let membership_tier_types      = [];
       let membership_tier_type_products = '';
       let discount_percentage = 0;

       let membershipType             = props.membershipData.data.type;

       document.body.style.overflow = "hidden";

       if ( membershipType === "start" ) {
         if (true) {
           const elements = state.stripe.elements();
           var style = {
              base: {
                lineHeight: '35px',
              }
            };

           cardNumber  = elements.create('cardNumber', {style: style});
           cardNumber.mount('#m-card-number');

           cardExpiry  = elements.create('cardExpiry', {style: style});
           cardExpiry.mount('#m-card-expiry');

           cardCvc     = elements.create('cardCvc', {style: style});
           cardCvc.mount('#m-card-cvc');
         }

         let patientEmail = (state.clientData && state.clientData.email) ? state.clientData.email : '';

         monthly_membership_type      = props.membershipData.data.mothly_membership_type;
         monthly_membership_fees      = (props.membershipData.data.membership_tier === 'single' && monthly_membership_type === 'paid') ?  props.membershipData.data.mothly_membership_fees : 0;
         one_time_membership_setup    = (props.membershipData.data.membership_tier === 'single') ? props.membershipData.data.one_time_membership_setup : 0;
         recurly_program_name         = props.membershipData.data.recurly_program_name;
         membership_tier              = props.membershipData.data.membership_tier;
         membership_tier_types        = (props.membershipData.data.membership_tier === 'multiple' && props.membershipData.data.membership_tier_types !== undefined) ? props.membershipData.data.membership_tier_types :[]

         if (props.membershipData.data.membership_tier === 'multiple' && membership_tier_types.length > 0) {
           let membershipTierTypeProducts = [];
           membership_tier_id = membership_tier_types[0].id
           if(membership_tier_types[0].tier_products){
             membership_tier_types[0].tier_products.map((obj, idx) => {
               const product_name = ((obj.product) && (obj.product.product_name)) ? obj.product.product_name : '';
               if(product_name){
                 membershipTierTypeProducts.push(product_name+ ' - '+obj.units+' units');
               }
             })
           }
           membership_tier_type_products = membershipTierTypeProducts.join(', ');
           monthly_membership_fees = (membership_tier_types[0]['price_per_month']) ?  membership_tier_types[0]['price_per_month'] : 0;
           one_time_membership_setup = (membership_tier_types[0]['one_time_setup_fee']) ?  membership_tier_types[0]['one_time_setup_fee'] : 0;
           discount_percentage = (membership_tier_types[0]['discount_percentage']) ?  membership_tier_types[0]['discount_percentage'] : 0;
           membership_on_all_product = (membership_tier_types[0].discount_percentage) ?  membership_tier_types[0].discount_percentage : 0;
         }


         return {
           membershipData                 : props.membershipData.data,
           showImmediateMembershipModal   : false,
           showFutureMembershipModal      : false,
           showMembershipModal            : true,
           patientEmailClass              : 'simpleInput',
           waiveOffOTFee                  : false,
           patientEmail                   : patientEmail,
           monthly_membership_type        : monthly_membership_type,
           monthly_membership_fees        : monthly_membership_fees,
           one_time_membership_setup      : one_time_membership_setup,
           total_membership_with_waive    : monthly_membership_fees,
           total_membership_without_waive : monthly_membership_fees + one_time_membership_setup,
           recurly_program_name           : recurly_program_name,
           membership_tier                : membership_tier,
           membership_tier_id             : membership_tier_id,
           membership_tier_idClass        : 'simpleInput',
           membership_tier_types          : membership_tier_types,
           membership_tier_type_products  : membership_tier_type_products,
           membership_on_all_product      :membership_on_all_product,
           discount_percentage            :discount_percentage,
           couponCodeClass                : 'simpleInput',
           couponCode                     : '',
           discountCouponApplied          : 0,
           totalDiscount                  : 0,
           drawDate                       : dayOfMonth,
           showLoader                     : false,
         }
       } else if ( membershipType === "future" ) {
         return {
           membershipData                 : props.membershipData.data,
           showMembershipModal            : false,
           showImmediateMembershipModal   : false,
           showFutureMembershipModal      : true,
           showLoader                     : false,
           appliedCoupon                  : props.membershipData.data.applied_coupon,
           total_discount                 : props.membershipData.data.total_discount,
           membership_on_all_product      :(props.membershipData.data.membership_tier_discount) ? props.membershipData.data.membership_tier_discount : 0
         }
       } else if ( membershipType === "immediate" ) {
         console.log('props.membershipData.data',props.membershipData.data);
         return {
           membershipData                 : props.membershipData.data,
           showMembershipModal            : false,
           showImmediateMembershipModal   : true,
           showFutureMembershipModal      : false,
           showMembershipSection          : true,
           showNewCardSection             : false,
           showLoader                     : false,
           appliedCoupon                  : props.membershipData.data.applied_coupon,
           total_discount                 : props.membershipData.data.total_discount,
           membership_on_all_product      :(props.membershipData.data.membership_tier_discount) ? props.membershipData.data.membership_tier_discount : 0
         }
       } else {
         return {
           membershipData   : props.membershipData.data,
           showLoader       : false
         }
       }
     } else if ( props.membershipData !== undefined && props.membershipData.status !== 200 && props.membershipData.data !== state.membershipData ) {
       return {
         membershipData   : props.membershipData.data,
         showLoader       : false
       }
     }

     if ( props.addMembershipData !== undefined && props.addMembershipData.status === 200 && props.addMembershipData.data !== state.addMembershipData ) {
        document.body.style.overflow = "";
        return {
          addMembershipData       : props.addMembershipData.data,
          addMembershipMessage    : props.addMembershipData.message
        }

      } else if ( props.addMembershipData !== undefined && props.addMembershipData.status !== 200 && props.addMembershipData.data !== state.addMembershipData ) {
        return {
          showLoader                 : false,
          addMembershipData          : props.addMembershipData.data,
          addMembershipMessage       : ''
        }
      }

      if ( props.cancelMembershipData !== undefined && props.cancelMembershipData.status === 200 && props.cancelMembershipData.data !== state.cancelMembershipData ) {
         document.body.style.overflow = "";
         return {
           cancelMembershipData       : props.cancelMembershipData.data,
           cancelMembershipMessage    : props.cancelMembershipData.message
         }

       } else if ( props.cancelMembershipData !== undefined && props.cancelMembershipData.status !== 200 && props.cancelMembershipData.data !== state.cancelMembershipData ) {
         document.body.style.overflow = "";
         return {
           showLoader                 : false,
           cancelMembershipData       : props.cancelMembershipData.data,
           cancelMembershipMessage    : ''
         }
       }

       if ( props.couponData !== undefined && props.couponData.status === 200 && props.couponData.data !== state.couponData ) {
        return {
          couponData            : props.couponData.data,
          showLoader            : false,
          discountCouponApplied : 1,
          totalDiscount         : props.couponData.data.total_discount
        }

      } else if ( props.couponData !== undefined && props.couponData.status !== 200 && props.couponData.data !== state.couponData ) {
        return {
          showLoader            : false,
          couponData            : props.couponData.data,
          discountCouponApplied : 0
        }
      }

      if ( props.MDSignData !== undefined && props.MDSignData.status === 201 && props.MDSignData.data !== state.MDSignData ) {
        props.exportEmptyData()
       return {
         MDSignData            : props.MDSignData.data,
         showLoader            : false,
         savedTime             : moment().format('X')
       }
     } else if ( props.MDSignData !== undefined && props.MDSignData.status !== 201 && props.MDSignData.data !== state.MDSignData ) {
       props.exportEmptyData()
       return {
         showLoader            : false,
         MDSignData            : props.MDSignData.data,
       }

     }



      if ( props.updateWalletCCData !== undefined && props.updateWalletCCData.status === 200 && props.updateWalletCCData.data !== state.updateWalletCCData ) {
        document.body.style.overflow = "";
         return {
           updateWalletCCData         : props.updateWalletCCData.data,
           updateWalletCCMessage      : props.updateWalletCCData.message
         }

       } else if ( props.updateWalletCCData !== undefined && props.updateWalletCCData.status !== 200 && props.updateWalletCCData.data !== state.updateWalletCCData ) {
         document.body.style.overflow = "";
         return {
           showLoader                 : false,
           updateWalletCCData         : props.updateWalletCCData.data,
           updateWalletCCMessage      : ''
         }
       }

       if (props.membershipTypeData !== undefined && state.membershipTypeData !== props.membershipTypeData) {
         let returnState = {}
         returnState.membershipTypeData = props.membershipTypeData
         returnState.showLoader = false;
         if (props.membershipTypeData.tier_products !== undefined && props.membershipTypeData.tier_products !== null) {
           let membershipTierTypeProducts = [];
           props.membershipTypeData.tier_products.map((obj, idx) => {
             const product_name = ((obj.product) && (obj.product.product_name)) ? obj.product.product_name : '';
             if(product_name){
               membershipTierTypeProducts.push(product_name+ ' - '+obj.units+' units');
             }
           })
           returnState.membership_tier_type_products = membershipTierTypeProducts.join(', ');
           returnState.monthly_membership_fees = (props.membershipTypeData.price_per_month) ?  props.membershipTypeData.price_per_month : 0;
           returnState.one_time_membership_setup = (props.membershipTypeData.one_time_setup_fee) ?  props.membershipTypeData.one_time_setup_fee : 0;
           returnState.discount_percentage = (props.membershipTypeData.discount_percentage) ?  props.membershipTypeData.discount_percentage : 0;
           returnState.total_membership_with_waive = returnState.monthly_membership_fees;
           returnState.total_membership_without_waive =  returnState.monthly_membership_fees + returnState.one_time_membership_setup;
           returnState.waiveOffOTFee = false;
           returnState.membership_tier_idClass =  'simpleInput';
           returnState.membership_on_all_product = (props.membershipTypeData.discount_percentage) ?  props.membershipTypeData.discount_percentage : 0;
         }
         props.emptyMembershipWallet()
         return returnState;
       }

     if ( props.productData !== undefined && props.productData.status === 200 && props.productData.data !== state.productData ) {
        return {
          productData               : props.productData.data,
          showSearchResult          : true
        }
      }

      if ( props.templatesData !== undefined && props.templatesData.status === 200 && props.templatesData.data !== state.templatesData ) {
         return {
           showLoader                 : false,
           templatesData              : props.templatesData.data,
           showTreatmentModal         : true
         }

       } else if ( props.templatesData !== undefined && props.templatesData.status !== 200 && props.templatesData.data !== state.templatesData ) {
         return {
           showLoader                 : false,
           templatesData              : props.templatesData.data
         }
       }

       if ( props.templatesDetails !== undefined && props.templatesDetails.status === 200 && props.templatesDetails.data !== state.templatesDetails ) {
         return {
           templatesDetails: props.templatesDetails.data
         }
        } else if ( props.templatesDetails !== undefined && props.templatesDetails.status !== 200 && props.templatesDetails.data !== state.templatesDetails ) {
          return {
            showLoader                 : false,
            templatesDetails           : props.templatesDetails.data
          }
        }

      if ( props.savePaygData !== undefined && props.savePaygData.status === 200 && props.savePaygData.data !== state.savePaygData ) {
         return {
           savePaygData           : props.savePaygData.data,
           showLoader             : false,
           savePaygStatus         : props.savePaygData.data,
           showCreateTreatModal   : false,
           showTreatmentModal     : false
         }
       } else if ( props.savePaygData !== undefined && props.savePaygData.status !== 200 && props.savePaygData.data !== state.savePaygData ) {
         return {
           savePaygData       : props.savePaygData.data,
           showLoader         : false,
           savePaygStatus     : ''
         }
       }

       if ( props.planDetails !== undefined && props.planDetails.status === 200 && props.planDetails.data !== state.planDetails ) {
          return {
            planDetails      : props.planDetails.data,
            showLoader       : false,
          }
        } else if ( props.planDetails !== undefined && props.planDetails.status !== 200 && props.planDetails.data !== state.planDetails ) {
          return {
            planDetails      : props.planDetails.data,
            showLoader       : false,
          }
        }

        if ( props.programDetails !== undefined && props.programDetails.status === 200 && props.programDetails.data !== state.programDetails ) {
          let startProgramCardNumber = (props.programDetails.data && props.programDetails.data.credit_card_details) ? props.programDetails.data.credit_card_details.card_number : null;
          let cardNumberArray        = [];

          if (startProgramCardNumber) {
            cardNumberArray         = startProgramCardNumber.split("ending");
          }

          let clinicOptData = "";

          if ( props.programDetails.data && props.programDetails.data.clinics && props.programDetails.data.clinics.length > 0 ) {
            clinicOptData = props.programDetails.data.clinics.map((obj, idx) => {
               return <option key={idx} value={obj.id}>{obj.clinic_name}</option>;
           })
          }

           return {
             programDetails   : props.programDetails.data,
             showLoader       : false,
             showStartProgram : true,
             cardType         : (props.programDetails.data && props.programDetails.data.credit_card_details) ? 'saved' : 'new',
             showNewCardInput : (props.programDetails.data && props.programDetails.data.credit_card_details) ? true : false,
             canExpireProduct : (props.programDetails.data && props.programDetails.data.accountPreference && props.programDetails.data.accountPreference.expire_product_at_month_end) ? 1 : 0,
             discountValue    : (props.programDetails.data && props.programDetails.data.treatMentPlan && props.programDetails.data.treatMentPlan.discount_value) ? props.programDetails.data.treatMentPlan.discount_value : '',
             discountType     : (props.programDetails.data && props.programDetails.data.treatMentPlan && props.programDetails.data.treatMentPlan.discount_type) ? props.programDetails.data.treatMentPlan.discount_type : 'percentage',
             cardNumberArray  : cardNumberArray,
             proClinicOptData : clinicOptData,
             planClinic       : (props.programDetails.data && props.programDetails.data.treatMentPlan && props.programDetails.data.treatMentPlan.clinic_id) ? props.programDetails.data.treatMentPlan.clinic_id : 0,
             startProTotal    : (props.programDetails.data && props.programDetails.data.treatMentPlan && props.programDetails.data.treatMentPlan.total_amount) ? props.programDetails.data.treatMentPlan.total_amount : 0,
             startProMonthly  : (props.programDetails.data && props.programDetails.data.treatMentPlan && props.programDetails.data.treatMentPlan.monthly_amount) ? props.programDetails.data.treatMentPlan.monthly_amount : 0,
             discountOuterClass: 'TP-discount-outer',
             taxAmount        : (props.programDetails.data && props.programDetails.data.default_clinic_tax) ? props.programDetails.data.default_clinic_tax : 0,
             taxOuterClass    : 'TP-discount-outer',
           }
         } else if ( props.programDetails !== undefined && props.programDetails.status !== 200 && props.programDetails.data !== state.programDetails ) {
           return {
             programDetails   : props.programDetails.data,
             showLoader       : false,
           }
         }

       if ( props.startDiscountData !== undefined && props.startDiscountData.status === 200 && props.startDiscountData.data !== state.startDiscountData ) {
          return {
            startDiscountData : props.startDiscountData.data,
            showLoader        : false,
            startProTotal     : (props.startDiscountData.data) ? props.startDiscountData.data.total_amount : 0,
            startProMonthly   : (props.startDiscountData.data) ? props.startDiscountData.data.monthly_amount : 0,
          }
        } else if ( props.startDiscountData !== undefined && props.startDiscountData.status !== 200 && props.startDiscountData.data !== state.startDiscountData ) {
          return {
            startDiscountData : props.startDiscountData.data,
            showLoader        : false,
          }
        }

        if ( props.priceBreakUpData !== undefined && props.priceBreakUpData.status === 200 && props.priceBreakUpData.data !== state.priceBreakUpData ) {
           return {
             priceBreakUpData     : props.priceBreakUpData.data,
             showLoader           : false,
             showPriceBreakModal  : true
           }
         } else if ( props.priceBreakUpData !== undefined && props.priceBreakUpData.status !== 200 && props.priceBreakUpData.data !== state.priceBreakUpData ) {
           return {
             priceBreakUpData  : props.priceBreakUpData.data,
             showLoader        : false,
           }
         }

         if ( props.startProgram !== undefined && props.startProgram.status === 200 && props.startProgram.data !== state.startProgram ) {
            return {
              startProgram         : props.startProgram.data,
              showLoader           : false,
              startProStatus       : props.startProgram.data,
              showStartProgram     : false
            }
          } else if ( props.startProgram !== undefined && props.startProgram.status !== 200 && props.startProgram.data !== state.startProgram ) {
            return {
              startProgram         : props.startProgram.data,
              showLoader           : false,
              startProStatus       : ''
            }
          }

      if ( props.cancelPlanData !== undefined && props.cancelPlanData.status === 200 && props.cancelPlanData.data !== state.cancelPlanData ) {
         return {
           cancelPlanData       : props.cancelPlanData.data,
           showLoader           : false,
           cancelPlanStatus     : props.cancelPlanData.data,
           showModal            : false
         }
       } else if ( props.cancelPlanData !== undefined && props.cancelPlanData.status !== 200 && props.cancelPlanData.data !== state.cancelPlanData ) {
         return {
           cancelPlanData       : props.cancelPlanData.data,
           showLoader           : false,
           cancelPlanStatus     : ''
         }
       }

       if ( props.saveAsTemplateData !== undefined && props.saveAsTemplateData.status === 200 && props.saveAsTemplateData.data !== state.saveAsTemplateData ) {
          return {
            saveAsTemplateData   : props.saveAsTemplateData.data,
            showLoader           : false,
            showSaveTemplate     : false,
            showPreviewDetails   : true,
            templateName         : ''
          }
        } else if ( props.saveAsTemplateData !== undefined && props.saveAsTemplateData.status !== 200 && props.saveAsTemplateData.data !== state.saveAsTemplateData ) {
          return {
            saveAsTemplateData   : props.saveAsTemplateData.data,
            showLoader           : false,
            templateName         : ''
          }
        }

        if ( props.updatePlanCardData !== undefined && props.updatePlanCardData.status === 200 && props.updatePlanCardData.data !== state.updatePlanCardData ) {
           return {
             updatePlanCardData   : props.updatePlanCardData.data,
             showLoader           : false,
             showChangePlanCCPopup: false,
             updatePlanCardStatus : props.updatePlanCardData.data
           }
         } else if ( props.updatePlanCardData !== undefined && props.updatePlanCardData.status !== 200 && props.updatePlanCardData.data !== state.updatePlanCardData ) {
           return {
             updatePlanCardData   : props.updatePlanCardData.data,
             showLoader           : false,
             updatePlanCardStatus : ''
           }
         }

         if ( props.presOnlyDetails !== undefined && props.presOnlyDetails.status === 200 && props.presOnlyDetails.data !== state.presOnlyDetails ) {

           let monthArray    = [];
           let treatStartOn  = parseInt(props.presOnlyDetails.data.start_year) + '/' + props.presOnlyDetails.data.start_month + '/' + 1;
           let expireAfter   = props.presOnlyDetails.data && props.presOnlyDetails.data.duration;

           if ( props.presOnlyDetails.data && props.presOnlyDetails.data.plan_type === 'monthly' ) {
             for (let i = 1; i <= expireAfter; i++ ) {
               let tempArray = [];

               if ( i === 1 ) {
                 tempArray.push(moment(treatStartOn).format('MMMM, YYYY'));
               } else {
                 tempArray.push(treatStartOn);
               }

               treatStartOn = moment(treatStartOn).add(1, 'month').format('MMMM, YYYY');
               monthArray.push(tempArray);
             }
           }

            return {
              presOnlyDetails      : props.presOnlyDetails.data,
              showLoader           : false,
              showPresOnlyPopup    : true,
              pMonthArray          : monthArray
            }
          } else if ( props.presOnlyDetails !== undefined && props.presOnlyDetails.status !== 200 && props.presOnlyDetails.data !== state.presOnlyDetails ) {
            return {
              presOnlyDetails      : props.presOnlyDetails.data,
              showLoader           : false
            }
          }

          if ( props.updatePresOnlyData !== undefined && props.updatePresOnlyData.status === 200 && props.updatePresOnlyData.data !== state.updatePresOnlyData ) {
             return {
               updatePresOnlyData   : props.updatePresOnlyData.data,
               showLoader           : false,
               showPreviewDetails   : false,
               updatePresOnlyStatus : props.updatePresOnlyData.data
             }
           } else if ( props.updatePresOnlyData !== undefined && props.updatePresOnlyData.status !== 200 && props.updatePresOnlyData.data !== state.updatePresOnlyData ) {
             return {
               updatePresOnlyData   : props.updatePresOnlyData.data,
               showLoader           : false,
               updatePresOnlyStatus : ''
             }
           }

         if ( props.performActionData !== undefined && props.performActionData.status === 200 && props.performActionData.data !== state.performActionData ) {
           let returnState                = {};
           returnState.performActionData  = props.performActionData.data;
           returnState.showLoader         = false;

           if ( state.treatmentAction === 'print' || state.treatmentAction === 'download' ) {
             window.open(props.performActionData.data, "_blank");
           }

           if ( state.treatmentAction === 'send_to_patient' ) {
             toast.dismiss();
             toast.success(state.globalLang[props.performActionData.message]);
           }

           return returnState;
          } else if ( props.performActionData !== undefined && props.performActionData.status !== 200 && props.performActionData.data !== state.performActionData ) {
            return {
              performActionData    : props.performActionData.data,
              showLoader           : false,
            }
          }
    return null
  }

  openModal = (event) => {
    let message = event.target.dataset.message;
    let mtype   = event.target.dataset.mtype;
    let action  = event.target.dataset.action;
    let checked = '';

    if ( event.target.type === 'checkbox' ) {
      let checked = event.target.checked;
    }

    if ( action === 'changePlanClinic' ) {
      this.setState({modalMessage: message, modalAction: action, modalActType: mtype, showModal: true, isSliderCheck: checked, showFutureMembershipModal: false, planClinic: event.target.value});
    } else {
      this.setState({modalMessage: message, modalAction: action, modalActType: mtype, showModal: true, isSliderCheck: checked, showFutureMembershipModal: false});
    }
  }

  dismissModal = () => {
    let show = false;

    if ( this.state.modalAction === "updateDnc" ) {
      let ref = 'ref_2';
      this.refs[ref].checked = !this.refs[ref].checked;
    }
    if ( this.state.modalAction === "updateFireStatus" ) {
      let ref = 'ref_1';
      this.refs[ref].checked = !this.refs[ref].checked;
    }

    if ( this.state.modalAction === "updatePatientPortalAccess" ) {
      let ref = 'ref_3';
      this.refs[ref].checked = !this.refs[ref].checked;
    }

    if ( this.state.modalAction === 'cancelMembership' ) {
      show = true;
    }

    if ( this.state.modalAction === 'changePlanClinic' ) {
      let clinicID = this.state.modalActType;

      this.setState({modalMessage: '', modalAction: '', modalActType: '', showModal: false, showFutureMembershipModal: show, planClinic: clinicID});
    } else {
      this.setState({modalMessage: '', modalAction: '', modalActType: '', showModal: false, showFutureMembershipModal: show});
    }
  }

  handleModalAction = () => {
    if ( this.state.modalAction && this.state.modalAction === 'updateFireStatus' ) {
      this.updateFireStatus();
    }

    if ( this.state.modalAction && this.state.modalAction === 'updateDnc' ) {
      this.updateDnc();
    }

    if ( this.state.modalAction && this.state.modalAction === 'updatePatientPortalAccess' ) {
      this.updatePatientPortalAccess();
    }

    if ( this.state.modalAction && this.state.modalAction === 'deleteClient' ) {
      this.deleteClient();
      this.setState({modalMessage: '', modalAction: '', modalActType: '', showModal: false, showLoader: true})
    }

    if ( this.state.modalAction && this.state.modalAction === 'deleteProcedurePrescription' ) {
      this.deleteProcedurePrescription();
    }

    if ( this.state.modalAction && this.state.modalAction === 'cancelMembership' ) {
      this.cancelMembership();
    }

    if ( this.state.modalAction && this.state.modalAction === 'cancelStartedMembership' ) {
      this.cancelMembership();
    }

    if ( this.state.modalAction && this.state.modalAction === 'changePlanClinic' ) {
      this.changePlanClinic();
    }

    if ( this.state.modalAction && this.state.modalAction === 'cancelPlan' ) {
      this.cancelPlan();
    }
  }

  updateFireStatus = () => {
    this.props.fireClient(this.state.clientID)
    this.setState({modalMessage: '', modalAction: '', modalActType: '', showModal: false, showLoader: true})
  }

  updateDnc = () => {
    this.props.doNotCall(this.state.clientID)
    this.setState({modalMessage: '', modalAction: '', modalActType: '', showModal: false, showLoader: true})
  }

  updatePatientPortalAccess = () => {
    this.props.changePortaAccess(this.state.clientID)
    this.setState({modalMessage: '', modalAction: '', modalActType: '', showModal: false, showLoader: true})
  }

  changeTimelinePref = (type) => {
    this.setState({defTimeLine: type});

    if ( type !== 'treatmentPlan' ) {
      localStorage.setItem("defTimeLine", type);
    }
  }

  openProcedureDetail = (proID, proType) => {

    if ( proType && proType === "cosmetic" ) {
      return (
        <div>
          {this.props.history.push(`/clients/procedure/edit/${proID}/${this.state.clientID}/profile`)}
        </div>
      )
    } else if (proType && proType === 'health' ) {
      return (
        <div>
          {this.props.history.push(`/clients/procedure-health/edit/${proID}/${this.state.clientID}/profile`)}
        </div>
      )
    }
  }

  viewProcedureDetail = (proID, proType) => {

    if ( proType && proType === "cosmetic" ) {
      return (
        <div>
          {/*{this.props.history.push(`/clients/procedure/edit/${proID}/${this.state.clientID}/profile`)} */}
        </div>
      )
    } else if (proType && proType === 'health' ) {
      return (
        <div>
          {this.props.history.push(`/clients/procedure-health-detail/${proID}/${this.state.clientID}/profile`)}
        </div>
      )
    }
  }

  viewQuestionnaires = (proID) => {
    return (
      <div>
        {this.props.history.push(`/clients/${this.state.clientID}/questionnaire/${proID}/profile`)}
      </div>
    );
  }

  viewConsents = (proID) => {
    return (
      <div>
        {this.props.history.push(`/clients/${this.state.clientID}/consent/${proID}/profile`)}
      </div>
    );
  }



  addConsents = (proID) => {
    return (
      <div>
        {this.props.history.push(`/clients/consent/add/${proID}/${this.state.clientID}/profile`)}
      </div>
    )
  }
  editConsents = (proID) => {
    return (
      <div>
        {this.props.history.push(`/clients/consent/edit/${proID}/${this.state.clientID}/profile`)}
      </div>
    )
  }


  runCarousel = (e, imageCount) => {
    e.preventDefault();

    if ( imageCount && imageCount > 0 ) {
      let targetNode = e.target.parentNode.parentNode.parentNode.children[0].children[0].childNodes
      let nodeLength = targetNode.length

      for (let i = 0; i < nodeLength; i++) {
        if (targetNode[i].classList.contains('active')) {

          targetNode[i].classList.remove('active');

          if ( i === (nodeLength - 1) ) {
            i = -1
          }

          targetNode[i+1].classList.add('active');
          return
        }
      }
    }
  }

  viewNotes = (proID) => {
    return (
      <div>
        {this.props.history.push(`/clients/notes/${proID}/${this.state.clientID}/profile`)}
      </div>
    );
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.fireStatus !== null && this.state.fireStatus !== '' && this.state.fireStatus !== prevState.fireStatus) {
      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);

      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null
      });
    }

    if (this.state.dncStatus !== null && this.state.dncStatus !== '' && this.state.dncStatus !== prevState.dncStatus) {
      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);

      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null
      });
    }

    if (this.state.portalAccessStatus !== null && this.state.portalAccessStatus !== '' && this.state.portalAccessStatus !== prevState.portalAccessStatus) {
      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);

      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null
      });
    }

    if (this.state.savedTime !== null && this.state.savedTime !== '' && this.state.savedTime !== prevState.savedTime) {
      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);

      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null,
        savedTime           : null,
        clicnicForCard      : 0
      });
    }

    if (this.state.resendStatus !== null && this.state.resendStatus !== '' && this.state.resendStatus !== prevState.resendStatus) {
      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);

      this.setState({
        showLoader          : true,
        resendStatus        : null
      });
    }

    if (this.state.resetPortalPasswordStatus !== null && this.state.resetPortalPasswordStatus !== '' && this.state.resetPortalPasswordStatus !== prevState.resetPortalPasswordStatus) {
      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);

      this.setState({
        showLoader          : true,
        resendStatus        : null
      });
    }

    if ( this.state.deleteStatus !== null && this.state.deleteStatus !== '' && this.state.deleteStatus !== prevState.deleteStatus ) {
      setTimeout(function() {
        return (
          <div>
            {this.props.history.push(`/clients`)}
          </div>
        );
      }.bind(this), 1000)
    }

    if ( this.state.addMembershipData !== null && this.state.addMembershipData !== '' && this.state.addMembershipData !== prevState.addMembershipData && this.state.addMembershipMessage !== null && this.state.addMembershipMessage  !== '' ) {
      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null
      });

      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }

    if ( this.state.cancelMembershipData !== null && this.state.cancelMembershipData !== '' && this.state.cancelMembershipData !== prevState.cancelMembershipData && this.state.cancelMembershipMessage !== null && this.state.cancelMembershipMessage  !== '' ) {
      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null
      });

      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }

    if ( this.state.updateWalletCCData !== null && this.state.updateWalletCCData !== '' && this.state.updateWalletCCData !== prevState.updateWalletCCData && this.state.updateWalletCCMessage !== null && this.state.updateWalletCCMessage  !== '' ) {
      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null
      });
      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }

    if ( this.state.savePaygData !== null && this.state.savePaygData !== '' && this.state.savePaygData !== prevState.savePaygData && this.state.savePaygStatus !== null && this.state.savePaygStatus !== '' ) {
      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null,
        showPreviewDetails  : (this.state.submitType && this.state.submitType === 'preview') ? true: false,
        defTimeLine         : 'treatmentPlan'
      });

      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }

    if (this.state.templatesDetails && this.state.templatesDetails !== prevState.templatesDetails) {
      this.generateTemplateHTML(this.state.templatesDetails, 'template');
    }

    if (this.state.planDetails && this.state.planDetails !== prevState.planDetails) {
      this.generateTemplateHTML(this.state.planDetails, 'treatment');
    }

    if ( this.state.startProgram !== null && this.state.startProgram !== '' && this.state.startProgram !== prevState.startProgram && this.state.startProStatus !== null && this.state.startProStatus !== '' ) {
      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null,
        showPreviewDetails  : false,
        defTimeLine         : 'treatmentPlan'
      });

      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }

    if ( this.state.cancelPlanData !== null && this.state.cancelPlanData !== '' && this.state.cancelPlanData !== prevState.cancelPlanData && this.state.cancelPlanStatus !== null && this.state.cancelPlanStatus !== '' ) {
      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null,
        showPreviewDetails  : false,
        defTimeLine         : 'treatmentPlan',
        subscriptionID      : 0,
        treatmentPlanID     : 0
      });

      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }

    if ( this.state.updatePlanCardData !== null && this.state.updatePlanCardData !== '' && this.state.updatePlanCardData !== prevState.updatePlanCardData && this.state.updatePlanCardStatus !== null && this.state.updatePlanCardStatus !== '' ) {
      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null,
        showPreviewDetails  : false,
        defTimeLine         : 'treatmentPlan',
        returnFromStartProgram  : true,
      });

      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }

    if ( this.state.updatePresOnlyData !== null && this.state.updatePresOnlyData !== '' && this.state.updatePresOnlyData !== prevState.updatePresOnlyData && this.state.updatePresOnlyStatus !== null && this.state.updatePresOnlyStatus !== '' ) {
      this.setState({
        showLoader          : true,
        dncStatus           : null,
        fireStatus          : null,
        portalAccessStatus  : null,
        showPreviewDetails  : false,
        defTimeLine         : 'treatmentPlan',
        returnFromStartProgram  : true,
      });

      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }
  }

  viewTreatMentMarkings = (proID) => {
    return (
      <div>
        {this.props.history.push(`/clients/treatment-markings/${proID}/${this.state.clientID}/profile`)}
      </div>
    );
  }

  showPrescription = (proID,index) => {
    let prescriptionField = []
    let isSendEmail = false
    if(index > -1){
      if(this.state.clientData !== undefined && this.state.clientData.procedure_health !== null && this.state.clientData.procedure_health !== undefined &&  this.state.clientData.procedure_health.length > 0){
        const procedure_prescription = this.state.clientData.procedure_health[index]['procedure_prescription'];
        if(procedure_prescription.length > 0){
          isSendEmail = true
          procedure_prescription.map((ppObj, ppIdx) => {
            let precription = {};
            precription = initPrescriptionField();
            precription.medicine_name = ppObj.medicine_name;
            precription.dosage = ppObj.dosage;
            precription.frequency = ppObj.frequency;
            precription.duration = ppObj.duration;
            prescriptionField.push(precription)
          })
        }
      }
    }

    if(prescriptionField.length === 0){
      prescriptionField = [initPrescriptionField()]
    }

    this.setState({
      showPrescriptionModal: true,
      prescriptionField     : prescriptionField,
      prescriptionValue     : [],
      isSendEmail           : isSendEmail,
      prescriptionProcedureId: proID});
      toggleBodyScroll(true)
  }

  hidePrescription = () => {
    this.setState({showPrescriptionModal: false});
    toggleBodyScroll(false)
  }

  addMultiplePrescription = () => {
    let prescriptionField = this.state.prescriptionField;
    prescriptionField.push(initPrescriptionField());
    this.setState({ prescriptionField: prescriptionField });
  }

  saveProcedurePrescription = () => {
    if(isFormSubmit()){
    let error = false
    let errorMedicineName = false
    let errorDoase = false
    let prescriptionField = this.state.prescriptionField;
    prescriptionField.map((obj,idx) => {
      if (obj.medicine_name === '' || obj.medicine_name === null || obj.medicine_name === undefined) {
        prescriptionField[idx]['medicineNameClass'] = 'setting-input-box field_error'
        error = true
      } else {
        if(obj.medicine_name.trim() === ''){
          prescriptionField[idx]['medicineNameClass'] = 'setting-input-box field_error'
          error = true
          errorMedicineName = true;
        } else {
          prescriptionField[idx]['medicineNameClass'] = 'setting-input-box'
        }
      }
      if (obj.dosage === '' || obj.dosage === null || obj.dosage === undefined) {
        prescriptionField[idx]['dosageClass'] = 'setting-input-box field_error'
        error = true
      } else {
        if(obj.dosage.trim() === ''){
          prescriptionField[idx]['dosageClass'] = 'setting-input-box field_error'
          error = true
          errorDoase = true;
        } else {
          prescriptionField[idx]['dosageClass'] = 'setting-input-box'
        }
      }
    })
    this.setState({prescriptionField:prescriptionField})
    if(error){
      if(errorMedicineName){
        toast.dismiss();
        toast.error('Please enter Medicine name');
      } else if(errorDoase){
        toast.dismiss();
        toast.error('Please enter Dosage');
      }
      return false
    }
    this.setState({showLoader:true})
    let formData = {
      prescription_data: prescriptionField
    }
    this.props.saveProcedurePrescription(this.state.prescriptionProcedureId,formData)
  }
  }

  sendProcedurePrescription = () => {
    if(isFormSubmit()){
      this.setState({showLoader:true})
      this.props.sendProcedurePrescription(this.state.prescriptionProcedureId,this.state.clientID)
    }
  }

  deleteProcedurePrescription = () => {
    this.setState({showLoader:true,showModal:false})
    this.props.deleteProcedurePrescription(this.state.prescriptionProcedureId)
  }

  deleteMultiplePrescription = (index) => {
    if (index > -1) {
      let prescriptionField = this.state.prescriptionField;
      if (prescriptionField.length == 1) { return false }
      prescriptionField.splice(index, 1);
      this.setState({ prescriptionField: prescriptionField});
    }
  }

  handleInputChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;
     const modal = event.target.dataset.modal;
     if(modal === 'prescription'){
       const index = event.target.dataset.index;
       let prescriptionField = this.state.prescriptionField;
       prescriptionField[index][event.target.name] = value;
       this.setState({prescriptionField:prescriptionField , dataChanged : true});
     } if(event.target.name === 'membership_tier_id'){


       let monthly_membership_fees    =  0;
       let one_time_membership_setup  =  0;
       let recurly_program_name       = '';
       let membership_tier            = 'single';
       let membership_tier_id         = '';
       let membership_on_all_product  = 0;
       let membership_tier_types      = [];
       let membership_tier_type_products = '';

       if(value){
         if (this.state.membership_tier_types.length > 0) {
           let membershipTierTypeProducts = [];
           const membership_tier_type = this.state.membership_tier_types.find(x => x.id == value);
           console.log('membership_tier_type',membership_tier_type);
           if(membership_tier_type){
             membership_tier_id = membership_tier_type.id
             if(membership_tier_type.tier_products){
               membership_tier_type.tier_products.map((obj, idx) => {
                 const product_name = ((obj.product) && (obj.product.product_name)) ? obj.product.product_name : '';
                 if(product_name){
                   membershipTierTypeProducts.push(product_name+ ' - '+obj.units+' units');
                 }
               })
             }
             membership_tier_type_products = membershipTierTypeProducts.join(', ');
             monthly_membership_fees = (membership_tier_type.price_per_month) ?  membership_tier_type.price_per_month : 0;
             one_time_membership_setup = (membership_tier_type.one_time_setup_fee) ?  membership_tier_type.one_time_setup_fee : 0;
             membership_on_all_product = (membership_tier_type.discount_percentage) ?  membership_tier_type.discount_percentage : 0;
           }

         }
       } else {
        //this.setState({[event.target.name]: value , dataChanged : true, membership_tier_type_products:'',monthly_membership_fees:0,one_time_membership_setup:0,discount_percentage:0,total_membership_with_waive:0,total_membership_without_waive:0,waiveOffOTFee:false,membership_tier_idClass:membership_tier_idClass,membership_on_all_product:0});
       }

       this.setState({
         [event.target.name]:value,
         dataChanged:true,
         waiveOffOTFee                  : false,
         monthly_membership_fees        : monthly_membership_fees,
         one_time_membership_setup      : one_time_membership_setup,
         total_membership_with_waive    : monthly_membership_fees,
         total_membership_without_waive : monthly_membership_fees + one_time_membership_setup,
         membership_tier_id             : membership_tier_id,
         membership_tier_idClass        : 'simpleInput',
         membership_tier_type_products  : membership_tier_type_products,
         membership_on_all_product      :membership_on_all_product,
         discount_percentage:0,
         couponCode:'',
         discountCouponApplied:false,
         totalDiscount:0,
       })

     }

     if ( event.target.name === 'planClinic' ) {
       this.openModal(event);
     } else {
       const multiplePaygList     = this.state.multiplePaygList;

       if (event.target.dataset.index && !event.target.dataset.parentindex) {
         let inputName                      = target.name;
         const  index                       = event.target.dataset.index;
         multiplePaygList[index][inputName] = value;
       }

       const multipleMonthlyList = this.state.multipleMonthlyList;

       if (event.target.dataset.index && event.target.dataset.parentindex) {
         let inputName                      = target.name;
         const parentIndex                  = event.target.dataset.parentindex;
         const index                        = event.target.dataset.index;
         multipleMonthlyList[parentIndex]['dataRows'][index][inputName] = value;
       }

       this.setState({[event.target.name]: value , dataChanged : true, clicnicForCard: 0, multiplePaygList: multiplePaygList, multipleMonthlyList: multipleMonthlyList});

       if ( event.target.name === 'treatType' ) {
         this.changeTreatType(event.target.value);
       }

       if ( event.target.name === 'expirePlanAfter' ) {
         if ( this.state.treatType === 'monthly' ) {
           this.setState({expirePlanAfter: event.target.value, showPreviewBtn: false, showGenerateBtn: true});
         }
       }
       const modal = event.target.dataset.modal;
       if(modal === 'prescription'){
         const index = event.target.dataset.index;
         let prescriptionField = this.state.prescriptionField;
         prescriptionField[index][event.target.name] = value;
         this.setState({prescriptionField:prescriptionField , dataChanged : true});
       } else {
         this.setState({[event.target.name]: value , dataChanged : true, clicnicForCard: 0});
       }
     }
  }

  openCCPopUp = () => {
    var elements = this.state.stripe.elements();

    cardNumber  = elements.create('cardNumber');
    cardNumber.mount('#card-number');

    cardExpiry  = elements.create('cardExpiry');
    cardExpiry.mount('#card-expiry');

    cardCvc     = elements.create('cardCvc');
    cardCvc.mount('#card-cvc');

    this.props.getClientCardData(this.state.clientID);
    //this.setState({showCCPopup: true});
    this.setState({showLoader: true});
  }

  closeCCPopup = () => {
    this.setState({showCCPopup: false, clicnicForCard: 0});
  }

  saveCC = () => {
    let clinicID = 0;

    if ( this.refs.clinicCardRef !== undefined ) {
      clinicID = this.refs.clinicCardRef.value
    }

    if ( this.state.clicnicForCard && this.state.clicnicForCard > 0 ) {
      clinicID = this.state.clicnicForCard
    }

    this.setState({showLoader: true})

    this.state.stripe.createToken(cardNumber).then((response) => {
      if ( response.error ) {
        toast.dismiss();
        toast.error(response.error.message)
        this.setState({showLoader: false})
      } else {
        stripeToken = response.token.id;

        if ( stripeToken ) {
          let formData = {
            clinic_id     : clinicID,
            stripe_token  : stripeToken
          }

          this.props.saveClientCard(this.state.clientID, formData)
        }
      }
    })
  }

  editSavedCard = (clinicID) => {
    if (clinicID) {
      this.setState({clicnicForCard: clinicID, card_clinic: clinicID});
    }
  }

  cancelEditSavedCard = () => {
    this.setState({clicnicForCard: 0});
  }

  viewTraceAbility = (proID) => {
    return (
      <div>
        {this.props.history.push(`/clients/traceability-info/${proID}/${this.state.clientID}/profile`)}
      </div>
    );
  }

  getMedicalHistory = () => {
    return (
      <div>
        {this.props.history.push(`/clients/medical-history/${this.state.clientID}/profile`)}
      </div>
    )
  }

  getUpcomingAppointments = () => {
    return (
      <div>
        {this.props.history.push(`/clients/upcoming-appointments/${this.state.clientID}/profile`)}
      </div>
    )
  }

  getPaymentHistory = () => {
    return (
      <div>
        {this.props.history.push(`/clients/payment-history/${this.state.clientID}/profile/invoices`)}
      </div>
    )
  }

  getCustomerNotes = () => {
    return (
      <div>
        {this.props.history.push(`/clients/customer-notes/${this.state.clientID}/profile`)}
      </div>
    )
  }

  getClientDocuments = () => {
    return (
      <div>
        {this.props.history.push(`/clients/documents/${this.state.clientID}/profile`)}
      </div>
    )
  }



  resendEmail = () => {
    this.setState({showLoader: true})
    this.props.resendWelcomeEmail(this.state.clientID)
  }

  showResetPassModal = () => {
    this.setState({showResetPassModal: true})
  }

  dismissPassModal = () => {
    this.setState({showResetPassModal: false})
  }

  changePassType = () => {
    var oldState      = this.state.resetPassType;
    var oldClass      = this.state.eyeClass;
    var isTextOrHide  = (oldState === 'password');
    var newState      = (isTextOrHide) ? 'text' : 'password';
    var newClass      = (!isTextOrHide) ? 'client-treat-cal pass-hidden' : 'client-treat-cal pass-show';

    this.setState({
      resetPassType : newState,
      eyeClass      : newClass
    })
  }

  handleSubmit = (event) => {
    event.preventDefault();

    let password    = this.state.clientNewPassword;
    let isValidPass = /^(?=.{8,})(?=.*[A-Z])(?=.*[`~*-/\[\]\\|{}().:;,''""!_<>-@#$%^&+=]).*$/.test(password);

    if ( !isValidPass ) {
      this.setState({
        resetPassClass: "setting-input-box p-r-40 setting-input-box-invalid"
      })
    } else if ( this.state.clientData && this.state.clientData.patient_account && this.state.clientData.patient_account.patient_user && this.state.clientData.patient_account.patient_user.email !== '' ) {
      this.setState({
        resetPassClass    : "setting-input-box p-r-40",
        showLoader        : true,
        showResetPassModal: false,
        clientNewPassword : ''
      })

      this.refs.clientPass.value = "";

      let formData = {
        portal_email     : (this.state.clientData && this.state.clientData.patient_account && this.state.clientData.patient_account.patient_user && this.state.clientData.patient_account.patient_user.email !== '') ? this.state.clientData.patient_account.patient_user.email : '',
        patient_user_id  : (this.state.clientData.patient_account !== undefined && this.state.clientData.patient_account !== null) ? this.state.clientData.patient_account.patient_user_id : 0,
        portal_password  : password,
      }

      this.props.resetPortalPassword(this.state.clientID, formData);
    }
  }

  getInvoiceDetails = (invoiceID) => {
    return (
      <div>
        {this.props.history.push(`/clients/invoice/${invoiceID}/${this.state.clientID}/profile`)}
      </div>
    )
  }

  editClienProfile = () => {
    return (
      <div>
        {this.props.history.push(`/clients/${this.state.clientID}/profile`)}
      </div>
    );
  }

  deleteClient = () => {
    let recentlyViewedSaved           = JSON.parse(localStorage.getItem('recentlyViewedData'));

    if ( recentlyViewedSaved ) {
      if ( recentlyViewedSaved.length > 0 ) {
        recentlyViewedSaved.map((obj, idx) => {
          if ( obj.profile_id === parseInt(this.state.clientID) ) {
            recentlyViewedSaved.splice(idx, 1);
          }
        })

        localStorage.removeItem('recentlyViewedData');
        localStorage.setItem("recentlyViewedData", JSON.stringify(recentlyViewedSaved));
      }
    }

    this.props.deleteClient(this.state.clientID)
  }

  createProcedure = (proType) => {
    if (proType && proType === 'cosmetic' ) {
      return (
        <div>
          {this.props.history.push(`/clients/procedure/add/${this.state.clientID}/profile`)}
        </div>
      )
    } else if (proType && proType === 'health' ) {
      return (
        <div>
          {this.props.history.push(`/clients/procedure-health/add/${this.state.clientID}/profile`)}
        </div>
      )
    }
  }

  openClientWallet = () => {
    return (
      <div>
        {this.props.history.push(`/clients/wallet/${this.state.clientID}/profile`)}
      </div>
    )
  }

  exportClientPDF = () => {
    if ( this.state.clientID ) {
      this.setState({showLoader: true})
      let formData = {
        patient_id: this.state.clientID
      }

      this.props.exportClientPDF(formData);
    }
  }

  createAppointment = () => {
    if ( this.state.clientID ) {
      window.open(`/appointment/create/` + this.state.clientID)
    }
  }

  exportClientProcedures = () => {
    /*
    if (proType && proType === 'cosmetic' ) {
      return (
        <div>
          {this.props.history.push(`/clients/export-procedures/${this.state.clientID}/profile`)}
        </div>
      )
    } else if (proType && proType === 'health' ) {
      return (
        <div>
          {this.props.history.push(`/clients/procedure-health/add/${this.state.clientID}/profile`)}
        </div>
      )
    }
    */
    return (
      <div>
        {this.props.history.push(`/clients/export-procedures/${this.state.clientID}/profile`)}
      </div>
    )
  }

  viewFilledSurvey = (procedureID, appointmentID) => {
    if ( procedureID && appointmentID ) {
      return (
        <div>
          {this.props.history.push(`/clients/export-procedures/${this.state.clientID}/profile/${procedureID}/${appointmentID}`)}
        </div>
      )
    }
  }

  showSendInstructionPopup = (appointmentID,procedureId) => {
    this.setState({showInsSendModal: true, apptIDToSend: appointmentID, procedure_id: procedureId})
  }

  sendPostInstructions = () => {
    if ( this.state.apptIDToSend ) {
      this.setState({showLoader: true, showInsSendModal: false})
      this.props.sendPostInstructions(this.state.apptIDToSend,this.state.procedure_id);
    }
  }

  dismissInsSendModal = () => {
    this.setState({showInsSendModal: false, apptIDToSend: '', procedure_id: ''});
  }

  dismissSkinModal = () => {
    this.setState({showSkinModal: false})
  }

  viewAfterPhotos = (procedureID) => {
    if ( procedureID ) {
      return (
        <div>
          {this.props.history.push(`/clients/after-photos/${procedureID}/${this.state.clientID}/profile`)}
        </div>
      )
    }
  }

  showMembershipModal = () => {
    this.setState({showLoader: true});
    this.props.getMembershipData(this.state.clientID);
  }

  hideMembershipModal = () => {
    document.body.style.overflow = "";
    let ref = 'ref_waive';

    if ( this.refs[ref] ) {
      this.refs[ref].checked = false;
    }

    this.setState({showMembershipModal: false, drawDate: dayOfMonth, subscription_started_at: new Date()})
  }

  hideImmediateMembershipModal = () => {
    document.body.style.overflow = "";
    this.setState({showImmediateMembershipModal: false})
  }

  hideFutureMembershipModal = () => {
    document.body.style.overflow = "";
    this.setState({showFutureMembershipModal: false})
  }

  handleMembershipSubmit = (e) => {
    e.preventDefault();

    let error = false;

    if (this.state.membership_tier === 'multiple' && this.state.membership_tier_id <= 0) {
      this.setState({membership_tier_idClass: 'simpleInput setting-input-box-invalid'})
      error = true;
    } else {
      this.setState({membership_tier_idClass: 'simpleInput'})
    }

    if ( this.state.patientEmail.trim() === '' || !validateEmail(this.state.patientEmail.trim()) ) {
      this.setState({patientEmailClass: 'simpleInput setting-input-box-invalid'})
      error = true;
    } else {
      this.setState({patientEmailClass: 'simpleInput'})
    }

    if ( this.state.subscription_started_at === '' || this.state.subscription_started_at === null) {
      this.setState({subscription_started_atClass: 'simpleInput setting-input-box-invalid'})
      error = true;
    } else {
      this.setState({subscription_started_atClass: 'simpleInput'})
    }
    if(error){
      return
    }

    let ref = 'ref_waive';

    if ( this.refs[ref] ) {
      this.refs[ref].checked = false;
    }

    toast.dismiss();

    if ( this.state.patientEmail.trim() !== '' && validateEmail(this.state.patientEmail.trim()) ) {
      this.setState({showLoader: true})

      if ( (this.state.monthly_membership_type === 'free' && this.state.waiveOffOTFee === true) || (this.state.monthly_membership_type === 'free' && parseFloat(this.state.one_time_membership_setup) === 0.00) ) {
        let formData = {
          waive_off_one_time_fee  : (this.state.waiveOffOTFee) ? 1 : 0,
          email                   : this.state.patientEmail,
          subscription_started_at : moment(this.state.subscription_started_at).format('YYYY-MM-DD'),
          membership_total        : (this.state.waiveOffOTFee) ? this.state.total_membership_with_waive : this.state.total_membership_without_waive,
          membership_tier : this.state.membership_tier
        }

        if (this.state.membership_tier === 'multiple') {
          formData.membership_tier_id = this.state.membership_tier_id
        }

        this.props.addMonthyMembership(this.state.clientID, formData)
        document.body.style.overflow = "";
        this.setState({showLoader: true, showMembershipModal: false})
      } else {
        this.state.stripe.createToken(cardNumber).then((response) => {
          if ( response.error ) {
            toast.dismiss();
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
                membership_total        : (this.state.waiveOffOTFee) ? this.state.total_membership_with_waive : this.state.total_membership_without_waive,
                applied_discount_coupon : this.state.discountCouponApplied,
                coupon_code             : this.state.couponCode,
                draw_day                : this.state.drawDate,
                membership_tier : this.state.membership_tier
              }

              if ( this.state.discountCouponApplied === 0 ) {
                delete formData.coupon_code;
              }

              if ( this.state.draw_day === 0 ) {
                delete formData.draw_day;
              }
              if (this.state.membership_tier === 'multiple') {
                formData.membership_tier_id = this.state.membership_tier_id
              }

              if ( this.state.monthly_membership_type !== 'paid' ) {
                delete formData.draw_day;
              }

              this.props.addMonthyMembership(this.state.clientID, formData)
              document.body.style.overflow = "";
              this.setState({showLoader: true, showMembershipModal: false})
            }
          }
        })
      }
    }
  }

  onChangeDatePicker = (value) => {
    this.setState(value)

    if ( value && value.treatmentStartOn ) {
      if ( this.state.treatType === 'monthly' ) {
        this.setState({showPreviewBtn: false, showGenerateBtn: true});
      }
    }
  }

  cancelMembership = () => {
    document.body.style.overflow = "";
    this.props.cancelMembership(this.state.clientID)

    this.setState({showLoader: true, showModal: false, showFutureMembershipModal: false, showImmediateMembershipModal: false})
  }

  applyCouponCode = () => {
    let code = this.state.couponCode;

    if ( code.trim() ) {
      this.setState({couponCodeClass: 'simpleInput', showLoader: true});

      let formData = {
        coupon_code: code,
        membership_tier_id :(this.state.membership_tier_id) ? this.state.membership_tier_id : 0
      }
      this.props.applyCouponCode(this.state.clientID, formData);
    } else {
      this.setState({couponCodeClass: 'simpleInput setting-input-box-invalid'});
    }
  }

  changeMembershipCard = () => {
    var elements = this.state.stripe.elements();
    var style    = {
     base: {
       lineHeight: '35px',
     }
   };

    cardNumber  = elements.create('cardNumber', {style: style});
    cardNumber.mount('#mem-card-number');

    cardExpiry  = elements.create('cardExpiry', {style: style});
    cardExpiry.mount('#mem-card-expiry');

    cardCvc     = elements.create('cardCvc', {style: style});
    cardCvc.mount('#mem-card-cvc');
    this.setState({showMembershipSection: false, showNewCardSection: true})
  }

  cancelUpdateMembershipCard = () => {
    this.setState({showMembershipSection: true, showNewCardSection: false})
  }

  handleSubmitPayment = (e) => {
    e.preventDefault();

    toast.dismiss();

      this.setState({showLoader: true})

    this.state.stripe.createToken(cardNumber).then((response) => {
      if ( response.error ) {
        toast.dismiss();
        toast.error(response.error.message)
        this.setState({showLoader: false})
      } else {
        stripeToken = response.token.id;

        if ( stripeToken ) {
          let formData = {
            mstripeToken: stripeToken
          }

          this.setState({showLoader: true, showImmediateMembershipModal: false});

          this.props.updateMembershipCC(this.state.clientID, formData);
          document.body.style.overflow = "";
        }
      }
    })
  }


  showTreatmentModal = () => {
    this.setState({showLoader: true});
    this.props.getTreatmentTemplates();
  }

  hideTreatmentModal = () => {
    this.setState({showTreatmentModal: false});
  }

  showCreateTreatModal = () => {
    this.setState({showCreateTreatModal: true,  treatType: 'payg', showPaygSection: true, showMonthlySection: false, showTreatmentModal: false, expirePlanAfter: 0, treatmentStartOn: new Date(), multiplePaygList: [initPaygElem()], multiplePaygClassList: [initPaygElemClass()], showSearchResult: false, showGenerateBtn: false, showPreviewBtn: true, multipleMonthlyList: [], skinGoal: '', prescribeOnly: '0', requestType: 'add', requestMode: 'new'});
  }

  closeCreateTratmentModal = () => {
    let showTreatmentModal = true;

    if ( this.state.htmlGenerator && this.state.htmlGenerator === 'treatment' ) {
      showTreatmentModal = false;
    }

    this.setState({showCreateTreatModal: false,  treatType: 'payg', showPaygSection: true, showMonthlySection: false, showTreatmentModal: showTreatmentModal, showGenerateBtn: false, showPreviewBtn: true, multipleMonthlyList: [], skinGoal: '', prescribeOnly: '0', requestType: 'add', requestMode: 'new'});
  }

  changeTreatType = (treatType) => {
    let showPayg        = true;
    let showMontly      = false;
    let treatmentType   = "payg";
    let expirePlanAfter = 0;
    let showPreviewBtn  = true;
    let showGenerateBtn = false;


    if (treatType === 'monthly') {
      showPayg        = false;
      showMontly      = true;
      treatmentType   = "monthly";
      expirePlanAfter = 3;
      showGenerateBtn = true;
      showPreviewBtn  = false;
    }
    this.setState({showPaygSection: showPayg, showMonthlySection: showMontly, treatType: treatmentType, expirePlanAfter: expirePlanAfter, treatmentStartOn: new Date(), multiplePaygList: [initPaygElem()], multiplePaygClassList: [initPaygElemClass()], showSearchResult: false, showGenerateBtn: showGenerateBtn, showPreviewBtn: showPreviewBtn, multipleMonthlyList: [], skinGoal: '', prescribeOnly: '0', requestType: 'add', requestMode: 'new'});
  }

  handleChildCreateSubmit = (e, submitType) => {
    submitType = submitType || 'preview';
    e.preventDefault();

    if ( this.state.treatType === 'payg' ) {
      let error                 = false;
      let multiplePaygList      = this.state.multiplePaygList;
      let multiplePaygClassList = this.state.multiplePaygClassList;

      this.state.multiplePaygList.map((obj, idx) => {
        if (!obj.product_id) {
          multiplePaygClassList[idx]['product_name'] = "simpleInput field_error";
          error = true;
        } else {
          multiplePaygClassList[idx]['product_name'] = "simpleInput";
        }

        if (!isNumber(obj.units)) {
          multiplePaygClassList[idx]['units'] = "simpleInput field_error";
          error = true;
        } else {
          multiplePaygClassList[idx]['units'] = "simpleInput";
        }

        if (!isInt(obj.rep_val) || obj.rep_val <= 0 ) {
          multiplePaygClassList[idx]['rep_val'] = "simpleInput p-r-5 field_error";
          error = true;
        } else {
          multiplePaygClassList[idx]['rep_val'] = "simpleInput p-r-5";
        }
      });

      this.setState({
        multiplePaygClassList: multiplePaygClassList
      })

      if (error) {
        return
      }

      let formData            = {}
      let treatProductName    = [];
      let hProID              = [];
      let treatProductUnits   = [];
      let treatPlanRepValue   = [];
      let treatPlanRepBy      = [];

      this.state.multiplePaygList.map((obj, idx) => {
        treatProductName.push(obj.product_name);
        hProID.push(obj.product_id);
        treatProductUnits.push(obj.units);
        treatPlanRepValue.push(obj.rep_val);
        treatPlanRepBy.push(obj.rep_by);
      });

      formData.patient_id           = this.state.clientID;
      formData.plan_id              = this.state.treatmentPlanID; // if needed
      formData.request_type         = this.state.requestType;
      formData.plan_status          = (this.state.planDetails && this.state.planDetails.treatment_plan) ? this.state.planDetails.treatment_plan.status : 'notsaved';
      formData.request_mode         = this.state.requestMode;
      formData.edit_after_start     = 0;
      formData.prescribe_only       = parseInt(this.state.prescribeOnly);
      formData.treat_product_name   = treatProductName;
      formData.h_pro_id             = hProID;
      formData.treat_product_units  = treatProductUnits;
      formData.treat_plan_rep_val   = treatPlanRepValue;
      formData.treat_plan_rep_by    = treatPlanRepBy;
      formData.treat_start_date     = moment(this.state.treatmentStartOn).format('YYYY-MM-DD');
      formData.plan_duration        = this.state.expirePlanAfter;
      formData.sub_id               = this.state.subscriptionID; // if needed

      if ( this.state.requestType === 'add' ) {
        delete formData.plan_id;
        delete formData.sub_id;
      }

      this.setState({showLoader: true, submitType: submitType});
      this.props.savePAYGTreatmentPlan(formData);
    } else {
      let error                    = false;
      let multipleMonthlyList      = this.state.multipleMonthlyList;
      let multipleMonthlyClassList = this.state.multipleMonthlyClassList;
      let skinGoal                 = this.state.skinGoal;
      let skinGoalClass            = "simpleInput";

      if ( skinGoal.trim() === '' ) {
        error = true;
        skinGoalClass = "simpleInput field_error";
      }

      let totalDataRows     = 0;
      let totalUnfilledRows = 0;

      this.state.multipleMonthlyList.map((obj, idx) => {
        totalDataRows += obj.dataRows.length;
        if ( obj.dataRows ) {
          obj.dataRows.map((mobj, midx) => {
            let productID  = mobj.product_id;
            let units      = mobj.units;

            if ( !productID && !units ) {
              totalUnfilledRows = totalUnfilledRows + 1;
            }

            if ( productID && !isNumber(units) ) {
              error = true;
              multipleMonthlyClassList[idx].dataRows[midx]['units'] = "simpleInput field_error";
            } else {
              multipleMonthlyClassList[idx].dataRows[midx]['units'] = "simpleInput";
            }

            if ( !productID && isNumber(units) ) {
              error = true;
              multipleMonthlyClassList[idx].dataRows[midx]['product_name'] = "simpleInput field_error";
            }  else {
              multipleMonthlyClassList[idx].dataRows[midx]['product_name'] = "simpleInput";
            }

          })
        }
      });

      if ( totalDataRows === totalUnfilledRows ) {
        error = true;
        toast.dismiss();
        toast.error('At least one product and its units are required to start treatment plan');
      }

      this.setState({
        skinGoalClass: skinGoalClass,
        multipleMonthlyClassList: multipleMonthlyClassList
      });

      if (error) {
        return
      }

      let treatProductName    = [];
      let hProID              = {};
      let hMonth              = {};
      let hYear               = {};
      let treatProductUnits   = {};

      this.state.multipleMonthlyList.map((obj, idx) => {
        treatProductName.push(obj.product_name);

        let month = parseInt(moment(obj.month).format('MM'));
        let year  = moment(obj.month).format('YYYY');

        hProID[month] = {};
        hMonth[month] = {};
        hYear[month]  = {};
        treatProductUnits[month] = {};

        if ( obj.dataRows ) {
          hProID[month][year]   = [];
          hMonth[month][year]   = [];
          hYear[month][year]    = [];
          treatProductUnits[month][year]    = [];

          obj.dataRows.map((mobj, midx) => {
            hProID[month][year].push(mobj.product_id);
            hMonth[month][year].push(month);
            hYear[month][year].push(year);
            treatProductUnits[month][year].push(mobj.units);

          });
        }

      });

      let formData                  = {};
      formData.patient_id           = this.state.clientID;
      formData.plan_id              = this.state.treatmentPlanID; // if needed
      formData.request_type         = this.state.requestType;
      formData.plan_status          = (this.state.planDetails && this.state.planDetails.treatment_plan) ? this.state.planDetails.treatment_plan.status : 'notsaved';
      formData.request_mode         = this.state.requestMode;
      formData.edit_after_start     = 0;
      formData.prescribe_only       = parseInt(this.state.prescribeOnly);
      formData.treat_skin_goal      = skinGoal
      formData.treat_start_month    = parseInt(moment(this.state.treatmentStartOn).format('MM'));
      formData.treat_start_year     = moment(this.state.treatmentStartOn).format('YYYY');
      formData.h_pro_id             = hProID;
      formData.h_month              = hMonth;
      formData.h_year               = hYear;
      formData.treat_product_units  = treatProductUnits;
      formData.plan_duration        = this.state.expirePlanAfter;
      formData.sub_id               = this.state.subscriptionID; // if needed

      if ( this.state.requestType === 'add' ) {
        delete formData.plan_id;
        delete formData.sub_id;
      }

      this.setState({showLoader: true, submitType: submitType});
      this.props.saveMonthlyTreatmentPlan(formData);

    }
  }

  removePaygRows = (event) => {
    const  index = event.target.dataset.index;

    let multiplePaygList      = this.state.multiplePaygList;
    if (multiplePaygList.length === 1) { return false }

    if ( multiplePaygList[index] !== undefined ) {
      multiplePaygList.splice(index, 1);
    }

    let multiplePaygClassList = this.state.multiplePaygClassList;
    if ( multiplePaygClassList[index] !== undefined ) {
      multiplePaygClassList.splice(index, 1);
    }
    this.setState({multiplePaygList: multiplePaygList, multiplePaygClassList: multiplePaygClassList, showSearchResult: false});
  }

  addMorePaygRows = () => {
    let multiplePaygList      = this.state.multiplePaygList;
    multiplePaygList.push(initPaygElem());

    let multiplePaygClassList = this.state.multiplePaygClassList;
    multiplePaygClassList.push(initPaygElemClass());
    this.setState({multiplePaygList: multiplePaygList, multiplePaygClassList: multiplePaygClassList, showSearchResult: false});
  }

  handleProductChange = (event) => {
    const target    = event.target;
    let value       = target.value;
    let name        = event.target.name;

    if ( this.state.treatType === 'payg' ) {
      const index                = event.target.dataset.index;
      const multiplePaygList     = this.state.multiplePaygList;

      let inputName                      = target.name;
      multiplePaygList[index][inputName] = value;

      let formData        = {}
      formData.term       = value;
      formData.patient_id = this.state.clientID;

      if ( value.length > 2 ) {
        this.setState({multiplePaygList: multiplePaygList, selProIndex: index});
        this.props.searchProduct(formData);
      }

      if ( value.length <= 2 ) {
        let multiplePaygList                  = this.state.multiplePaygList;
        multiplePaygList[index]['product_id'] = '';

        this.setState({
          showSearchResult: false,
          selProIndex     : -1,
          multiplePaygList: multiplePaygList
        })
      }
    } else {
      let index                 = event.target.dataset.index;
      let parentIndex           = event.target.dataset.parentindex;
      const multipleMonthlyList = this.state.multipleMonthlyList;
      multipleMonthlyList[parentIndex]['dataRows'][index][name] = value;

      let formData        = {}
      formData.term       = value;
      formData.patient_id = this.state.clientID;

      if ( value.length > 2 ) {
        this.setState({multipleMonthlyList: multipleMonthlyList, selProIndex: index, selProParentIndex: parentIndex});
        this.props.searchProduct(formData);
      }

      if ( value.length <= 2 ) {
        let multipleMonthlyList = this.state.multipleMonthlyList;
        multipleMonthlyList[parentIndex]['dataRows'][index]['product_id'] = '';

        this.setState({
          showSearchResult    : false,
          selProIndex         : -1,
          multipleMonthlyList : multipleMonthlyList,
          selProParentIndex   : -1
        })
      }
    }
  }

  selectProduct = (obj) => {
     let productID    = 0;
     let productName  = '';

     if ( obj && obj.data && obj.data.id ) {
       productID     = obj.data.id
       productName   = obj.data.product_name
     }

     if ( this.state.treatType === 'payg' ) {
       const multiplePaygList     = this.state.multiplePaygList;
       let selProIndex            = this.state.selProIndex;

       if ( productID && productID > 0 && productName ) {
         if (selProIndex) {
           multiplePaygList[selProIndex]['product_id']    = productID;
           multiplePaygList[selProIndex]['product_name']  = productName;
         }
       }

       this.setState({multiplePaygList: multiplePaygList, showSearchResult: false, selProIndex: -1});
    } else {
      let selProIndex           = this.state.selProIndex;
      let selProParentIndex     = this.state.selProParentIndex;
      const multipleMonthlyList = this.state.multipleMonthlyList;

      if ( productID && productID > 0 && productName ) {
        if (selProIndex && selProParentIndex) {
          multipleMonthlyList[selProParentIndex]['dataRows'][selProIndex]['product_id']  = productID;
          multipleMonthlyList[selProParentIndex]['dataRows'][selProIndex]['product_name']  = productName;
        }
      }

      this.setState({multipleMonthlyList: multipleMonthlyList, showSearchResult: false, selProIndex: -1, selProParentIndex: -1});
    }
  }

  selectThisTemplate = () => {
    this.setState({showLoader: true, showTemplateConfirmation: false});
    this.props.getTemplateDetails(this.state.tempObj.id);
  }

  showUseConfirmation = (tempObj) => {
    this.setState({showTemplateConfirmation: true, tempObj: tempObj});
  }

  dismissUseModal = () => {
    this.setState({showTemplateConfirmation: false, tempObj: {}});
  }

  generateMonthlyHTML = (e) => {
    e.preventDefault();
    let dateArray     = [];
    let monthArray    = [];
    let treatStartOn  = this.state.treatmentStartOn;
    let expireAfter   = this.state.expirePlanAfter;
    let classArray    = [];

    for (let i = 1; i <= expireAfter; i++ ) {
      let tempArray = [];
      let monthName = '';

      if ( i === 1 ) {
        monthName = moment(treatStartOn).format('YYYY-MM');
      } else {
        monthName = treatStartOn;
      }

      treatStartOn = moment(treatStartOn).add(1, 'month').format('YYYY-MM');
      monthArray.push(monthName);
    }

    if (monthArray.length > 0) {

      monthArray.map((mobj, idx) => {
        let defMonthList        = JSON.parse(JSON.stringify(this.state.multipleMonthlyListDefObj));
        let defClassList        = JSON.parse(JSON.stringify(this.state.multipleMonthlyClassDefObj));
        let tempMonthList       = [];
        let tempClassList       = [];

        if (this.state.multipleMonthlyList && this.state.multipleMonthlyList[idx] && this.state.multipleMonthlyList[idx].dataRows && this.state.multipleMonthlyList[idx].dataRows.length > 0) {
          let monthlySchedules    = this.state.multipleMonthlyList[idx].dataRows;

            monthlySchedules.map((mmobj, midx) => {
                let tempObj            = {};
                let tempClassObj       = {};

                tempObj.product_id     = mmobj.product_id;
                tempObj.product_name   = mmobj.product_name;
                tempObj.month          = mobj; //mobj[0];
                tempObj.units          = mmobj.units;

                tempClassObj.product_id    = 'simpleInput';
                tempClassObj.product_name  = 'simpleInput';
                tempClassObj.month         = 'simpleInput';
                tempClassObj.units         = 'simpleInput';

                tempMonthList.push(tempObj);
                tempClassList.push(tempClassObj);
            });
        } else {
          let tempObj            = {};
          let tempClassObj       = {};

          tempObj.product_id     = '';
          tempObj.product_name   = '';
          tempObj.month          = mobj;
          tempObj.units          = '';

          tempClassObj.product_id    = 'simpleInput';
          tempClassObj.product_name  = 'simpleInput';
          tempClassObj.month         = 'simpleInput';
          tempClassObj.units         = 'simpleInput';

          tempMonthList.push(tempObj);
          tempClassList.push(tempClassObj);
        }

        dateArray.push({month: mobj, dataRows: tempMonthList});
        classArray.push({month: mobj, dataRows: tempClassList});
      })
    }

    this.setState({showGenerateBtn: false, showPreviewBtn: true, multipleMonthlyList: dateArray, multipleMonthlyClassList: classArray});
  }

  addMoreMonthlyRows = (passedIdx, passedObj) => {
    let multipleMonthList         = JSON.parse(JSON.stringify(this.state.multipleMonthlyList));
    let defMonthList              = JSON.parse(JSON.stringify(this.state.multipleMonthlyListDefObj));

    let multipleMonthlyClassList  = JSON.parse(JSON.stringify(this.state.multipleMonthlyClassList));
    let defClassList              = JSON.parse(JSON.stringify(this.state.multipleMonthlyClassDefObj));

    defMonthList['month']         = passedObj.month;
    defClassList['month']         = passedObj.month;

    multipleMonthList[passedIdx].dataRows.push(defMonthList);
    multipleMonthlyClassList[passedIdx].dataRows.push(defClassList);

    this.setState({multipleMonthlyList: multipleMonthList, multipleMonthlyClassList: multipleMonthlyClassList, showSearchResult: false});
  }

  removeMonthlyRows = (parentIndex, index) => {
    let multipleMonthlyList      = this.state.multipleMonthlyList;
    if (multipleMonthlyList[parentIndex]['dataRows'].length === 1) { return false }

    if ( multipleMonthlyList[parentIndex]['dataRows'][index] !== undefined ) {
      multipleMonthlyList[parentIndex]['dataRows'].splice(index, 1);
    }

    let multipleMonthlyClassList = this.state.multipleMonthlyClassList;
    if ( multipleMonthlyClassList[parentIndex]['dataRows'][index] !== undefined ) {
      multipleMonthlyClassList[parentIndex]['dataRows'].splice(index, 1);
    }
    this.setState({multipleMonthlyList: multipleMonthlyList, multipleMonthlyClassList: multipleMonthlyClassList, showSearchResult: false});
  }

  saveThePlan = (e) => {
    e.preventDefault();

    this.handleChildCreateSubmit(e, 'save');
  }

  hidePreviewDetails = (e) => {
    e.preventDefault();

    this.setState({showPreviewDetails: false});
  }

  hideProgramDetails = (e) => {
    e.preventDefault();

    this.setState({
      showLoader              : true,
      dncStatus               : null,
      fireStatus              : null,
      portalAccessStatus      : null,
      showStartProgram        : false,
      returnFromStartProgram  : true,
      canExpireProduct        : 0
    });

    this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
  }

  showProgramDetails = (e) => {
    e.preventDefault();

    var elements = this.state.stripe.elements();
    var style    = {
     base: {
       lineHeight: '36px',
     }
   };

    cardNumber  = elements.create('cardNumber', {style: style});
    cardNumber.mount('#treat-start-card-number');

    cardExpiry  = elements.create('cardExpiry', {style: style});
    cardExpiry.mount('#treat-start-card-expiry');

    cardCvc     = elements.create('cardCvc', {style: style});
    cardCvc.mount('#treat-start-card-cvc');

    this.setState({showPreviewDetails: false, showLoader: true, treatmentPlanID: this.state.clientData.current_treatment_plan.id});

    this.props.getProgramData(this.state.clientID, this.state.clientData.current_treatment_plan.id);
  }

  getPlanDetailsByID = (planID, requestMode, subID) => {
    this.setState({showLoader: true, treatmentPlanID: planID, requestType: 'edit', requestMode: requestMode, subscriptionID: subID});

    this.props.getPlanDataByID(planID);
  }

  generateTemplateHTML = (planDataObj, type) => {
    let treatType = '';
    if ( type && type === 'template' ) {
      treatType = (planDataObj && planDataObj.treatment_plan_template) ? planDataObj.treatment_plan_template.plan_type : 'payg';
    } else {
      treatType = (planDataObj && planDataObj.treatment_plan) ? planDataObj.treatment_plan.plan_type : 'payg';
    }

    let multiplePaygList         = [];
    let multiplePaygClassList    = [];

    let multipleMonthlyList      = [];
    let multipleMonthlyClassList = [];
    let skinGoal                 = '';
    let dateArray                = [];
    let classArray               = [];

    if (treatType === 'payg') {
      let paygObj = [];

      if ( type && type === 'template' ) {
         paygObj = planDataObj.template_schedule_pay_as_u_go;
      } else {
        paygObj = planDataObj.schedule_pay_as_u_go;
      }

       (paygObj && paygObj.length > 0 ) && paygObj.map((obj, idx) =>  {
        let tempObj      = {};
        let tempClassObj = {};

        tempObj.product_id     = obj.product_id;
        tempObj.product_name   = (obj.product) ? obj.product.product_name : '';
        tempObj.rep_by         = obj.repeat_by;
        tempObj.rep_val        = obj.repeat_value;
        tempObj.units          = obj.units;

        tempClassObj.product_name  = 'simpleInput';
        tempClassObj.product_id    = 'simpleInput';
        tempClassObj.units         = 'simpleInput';
        tempClassObj.rep_val       = 'simpleInput p-r-5';
        tempClassObj.rep_by        = 'simpleInput';

        multiplePaygList.push(tempObj);
        multiplePaygClassList.push(tempClassObj);
      })
    } else {
      let duration = '';
      if ( type && type === 'template' ) {
        skinGoal     = (planDataObj && planDataObj.treatment_plan_template) ? planDataObj.treatment_plan_template.skincare_goal : '';
        duration     = (planDataObj && planDataObj.treatment_plan_template) ? planDataObj.treatment_plan_template.duration : 3;
      } else {
        skinGoal     = (planDataObj && planDataObj.treatment_plan) ? planDataObj.treatment_plan.skincare_goal : '';
        duration     = (planDataObj && planDataObj.treatment_plan) ? planDataObj.treatment_plan.duration : 3;
      }

      let monthArray    = [];
      let treatStartOn  = new Date();

      if ( type && type === 'template' ) {
        treatStartOn  = new Date();
      } else {
        treatStartOn  = (planDataObj && planDataObj.treatment_plan) ? parseInt(planDataObj.treatment_plan.start_year) + '/' + planDataObj.treatment_plan.start_month + '/' + 1 : new Date();
      }

      let expireAfter   = duration;

      for ( let i = 1; i <= expireAfter; i++ ) {
        let tempArray = [];

        if ( i === 1 ) {
          tempArray.push(moment(treatStartOn).format('YYYY-MM'));
        } else {
          tempArray.push(treatStartOn);
        }

        treatStartOn = moment(treatStartOn).add(1, 'month').format('YYYY-MM');
        monthArray.push(tempArray);
      }

      if (monthArray.length > 0) {
        monthArray.map((mobj, idx) => {
          let tempArray           = [];
          let defMonthList        = JSON.parse(JSON.stringify(this.state.multipleMonthlyListDefObj));
          let defClassList        = JSON.parse(JSON.stringify(this.state.multipleMonthlyClassDefObj));
          let monthlySchedules    = [];

          if ( type && type === 'template' ) {
            monthlySchedules    = (planDataObj && planDataObj.template_schedule_monthly) ? planDataObj.template_schedule_monthly : [];
          } else {
            monthlySchedules    = (planDataObj && planDataObj.schedule_monthly) ? planDataObj.schedule_monthly : [];
          }

          let tempMonthList      = [];
          let tempClassList      = [];

          if ( monthlySchedules && monthlySchedules.length > 0 ) {
            monthlySchedules.map((mmobj, midx) => {
              let monthToCompare = '';

              if ( type && type === 'template' ) {
                monthToCompare = mmobj.belong_to_month;
              } else {
                monthToCompare = mmobj.month;
              }

              if ( type && type === 'template' ) {
                if ((idx + 1) === monthToCompare) {
                  let tempObj            = {};
                  let tempClassObj       = {};

                  tempObj.product_id     = mmobj.product_id;
                  tempObj.product_name   = (mmobj.product) ? mmobj.product.product_name : '';
                  tempObj.month          = mobj[0];
                  tempObj.units          = mmobj.units;


                  tempClassObj.product_id    = 'simpleInput';
                  tempClassObj.product_name  = 'simpleInput';
                  tempClassObj.month         = 'simpleInput';
                  tempClassObj.units         = 'simpleInput';

                  tempMonthList.push(tempObj);
                  tempClassList.push(tempClassObj);
                }
              } else {
                if (parseInt(moment(mobj[0]).format('MM')) === monthToCompare) {
                  let tempObj            = {};
                  let tempClassObj       = {};

                  tempObj.product_id     = mmobj.product_id;
                  tempObj.product_name   = (mmobj.product) ? mmobj.product.product_name : '';
                  tempObj.month          = mobj[0];
                  tempObj.units          = mmobj.units;


                  tempClassObj.product_id    = 'simpleInput';
                  tempClassObj.product_name  = 'simpleInput';
                  tempClassObj.month         = 'simpleInput';
                  tempClassObj.units         = 'simpleInput';

                  tempMonthList.push(tempObj);
                  tempClassList.push(tempClassObj);
                }
              }
            });
          } else {
            let tempObj            = {};
            let tempClassObj       = {};

            tempObj.product_id     = '';
            tempObj.product_name   = '';
            tempObj.month          = mobj[0];
            tempObj.units          = '';


            tempClassObj.product_id    = 'simpleInput';
            tempClassObj.product_name  = 'simpleInput';
            tempClassObj.month         = 'simpleInput';
            tempClassObj.units         = 'simpleInput';

            tempMonthList.push(tempObj);
            tempClassList.push(tempClassObj);
          }


          dateArray.push({month: mobj[0], dataRows: tempMonthList});
          classArray.push({month: mobj[0], dataRows: tempClassList});
        })
      }
    }

    let returnState                  = {};
    returnState.showLoader           = false;
    returnState.showTreatmentModal   = false;
    returnState.treatType            = treatType;
    returnState.showCreateTreatModal = true;
    returnState.showPaygSection      = (treatType === 'payg') ? true: false;
    returnState.showMonthlySection   = (treatType === 'monthly') ? true: false;
    returnState.htmlGenerator        = type;

    if ( type && type === 'template' ) {
      returnState.expirePlanAfter      = (planDataObj && planDataObj.treatment_plan_template) ? planDataObj.treatment_plan_template.duration : 3;
    } else {
      returnState.expirePlanAfter      = (planDataObj && planDataObj.treatment_plan) ? planDataObj.treatment_plan.duration : 3;
    }
    returnState.showSearchResult     = false;
    returnState.showPreviewBtn       = (treatType === 'payg') ? true: false;
    returnState.showGenerateBtn      = (treatType === 'monthly') ? true: false;
    returnState.treatmentStartOn     = new Date();
    returnState.requestType          = (this.state.requestType) ? this.state.requestType : 'add';
    returnState.requestMode          = (this.state.requestMode) ? this.state.requestMode : 'new';

    if (treatType === 'payg') {
      returnState.multiplePaygClassList   = multiplePaygClassList;
      returnState.multiplePaygList        = multiplePaygList;
    }

    if (treatType === 'monthly') {
      returnState.skinGoal                 = skinGoal;
      returnState.showGenerateBtn          = false;
      returnState.showPreviewBtn           = true;
      returnState.multipleMonthlyList      = dateArray;
      returnState.multipleMonthlyClassList = classArray;
    }

    this.setState({...returnState})
  }

  changeDisCountType = (type) => {
    this.setState({discountType: type})
  }

  applyProgramDiscount = (e) => {
    e.preventDefault();

    let discountType        = this.state.discountType;
    let discountValue       = this.state.discountValue.toString().trim();
    let error               = false;
    let discountOuterClass  = 'TP-discount-outer';

    if ( discountValue === '' ) {
      error = true;
      discountOuterClass = 'TP-discount-outer field_error';
    }

    if (!isNumber(discountValue)) {
      error = true;
      discountOuterClass = 'TP-discount-outer field_error';
    } else {
      discountOuterClass = 'TP-discount-outer';
    }

    this.setState({discountOuterClass: discountOuterClass});

    if ( error ) {
      return
    }

    let formData              = {};
    formData.patient_id       = this.state.clientId;
    formData.discount_value   = this.state.discountValue;
    formData.discount_type    = this.state.discountType;
    formData.plan_id          = this.state.treatmentPlanID;

    this.setState({showLoader: true});
    this.props.applyStartProgramDiscount(formData);
  }

  changePlanClinic = () => {
    this.setState({showModal: false, showLoader: true});

    let formData        = {};
    formData.plan_id    = this.state.treatmentPlanID;
    formData.clinic_id  = this.state.planClinic;

    this.props.changeTreatmentPlanClinic(formData);
  }

  viewBreakDown = (prescribeOnly) => {

    prescribeOnly = prescribeOnly || false;
    let planID    = '';

    if ( prescribeOnly ) {
      planID    = (this.state.presOnlyDetails) ? this.state.presOnlyDetails.id : 0;
    } else {
      planID    = (this.state.clientData && this.state.clientData.current_treatment_plan) ? this.state.clientData.current_treatment_plan.id : 0;
    }

    if ( planID ) {
      this.setState({showLoader: true});

      this.props.viewPriceBreakUp(planID);
    }
  }

  hideBreakDown = () => {
    this.setState({showPriceBreakModal: false});
  }

  handleProgramSubmit = (e) => {
    e.preventDefault();

    let error           = false;
    let taxAmount       = this.state.taxAmount;
    let taxOuterClass   = 'TP-discount-outer';
    let hidIsTaxEnabled = 0;
    let defClinicTax    = (this.state.programDetails) ? this.state.programDetails.default_clinic_tax : 0;
    let totalAmount     = this.state.startProTotal;
    let cardType        = this.state.cardType;
    let stripeToken     = '';
    let planType        = (this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.plan_type) ? this.state.clientData.current_treatment_plan.plan_type : 'payg';
    let chargeType      = (planType === 'monthly') ? 'now' : this.state.chargeType;
    let planID          = this.state.treatmentPlanID;
    let formData        = {};
    let canExiprePro    = this.state.canExpireProduct;

    if ( taxAmount != '' && !isNumber(taxAmount) ) {
      error = true;
      taxOuterClass = 'TP-discount-outer field_error';
    } else {
      taxOuterClass = 'TP-discount-outer';
    }

    this.setState({taxOuterClass: taxOuterClass});

    if (error) {
      return
    }

    if ( totalAmount < 1 ) {
      toast.dismiss();
      toast.error('Minimum amount to start a plan should be at least ' + numberFormat(1, 'currency'));
      return
    }

    if ( taxAmount || defClinicTax ) {
      hidIsTaxEnabled = 1;
    }

    this.setState({showLoader: true, returnFromStartProgram: true});

    if ( cardType === 'saved' ) {
      formData.plan_id            = planID;
      formData.payment_day        = 1;
      formData.patient_id         = this.state.clientID;
      formData.card_type          = cardType;
      formData.can_expire_product = (canExiprePro) ? 1 : 0;
      formData.hid_is_tax_enabled = hidIsTaxEnabled;
      formData.hid_tax_amount     = taxAmount;
      formData.charge_type        = chargeType;

      this.props.startTreatmentProgram(formData);
    } else {
      this.state.stripe.createToken(cardNumber).then((response, stripeToken) => {
        if ( response.error ) {
          toast.dismiss();
          toast.error(response.error.message);
          this.setState({showLoader: false});
        } else {
          stripeToken = response.token.id;

          formData.plan_id            = planID;
          formData.payment_day        = 1;
          formData.patient_id         = this.state.clientID;
          formData.card_type          = cardType;
          formData.can_expire_product = (canExiprePro) ? 1 : 0;
          formData.hid_is_tax_enabled = hidIsTaxEnabled;
          formData.hid_tax_amount     = taxAmount;
          formData.stripeToken        = stripeToken;
          formData.charge_type        = chargeType;

          this.props.startTreatmentProgram(formData);
        }
      })
    }
  }

  cancelPlanByID = (planID, subID) => {
    this.setState({subscriptionID: subID, treatmentPlanID: planID, modalMessage: "Sure? Once canceled, you will not be able to use this plan.", modalAction: 'cancelPlan', modalActType: 'cancelPlan', showModal: true});
  }

  cancelPlan = () => {
    this.setState({showLoader: true});
    let formData                            = {};
    formData.patient_id                     = this.state.clientID;
    formData.plan_id                        = this.state.treatmentPlanID;
    formData.treatment_plan_subscription_id = this.state.subscriptionID;

    this.props.cancelTreatmentPlan(formData);
  }

  changePlanCard = () => {
    let subID    = (this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.treatment_plan_subscription) ? this.state.clientData.current_treatment_plan.treatment_plan_subscription.id : 0;

    let planID   = (this.state.clientData && this.state.clientData.current_treatment_plan) ? this.state.clientData.current_treatment_plan.id : 0;

    var elements = this.state.stripe.elements();
    var style    = {
      base: {
        lineHeight: '36px',
      }
    };

    cardNumber  = elements.create('cardNumber', {style: style});
    cardNumber.mount('#treat-change-card-number');

    cardExpiry  = elements.create('cardExpiry', {style: style});
    cardExpiry.mount('#treat-change-card-expiry');

    cardCvc     = elements.create('cardCvc', {style: style});
    cardCvc.mount('#treat-change-card-cvc');

    this.setState({showChangePlanCCPopup: true, treatmentPlanID: planID, subscriptionID: subID});
  }

  hideChangePlanCCPopup = () => {
    this.setState({showChangePlanCCPopup: false});
  }

  handleChangeCard = (e) => {
    e.preventDefault();

    this.setState({showLoader: true});

    this.state.stripe.createToken(cardNumber).then((response, stripeToken) => {
      if ( response.error ) {
        toast.dismiss();
        toast.error(response.error.message);
        this.setState({showLoader: false});
      } else {
        stripeToken                             = response.token.id;
        let formData                            = {};
        formData.stripeToken                    = stripeToken;
        formData.patient_id                     = this.state.clientID;
        formData.plan_id                        = this.state.treatmentPlanID;
        formData.treatment_plan_subscription_id = this.state.subscriptionID;

        this.props.updatePlanCard(formData);
      }
    })
  }

  showTemplateNamePopup = () => {
    this.setState({showPreviewDetails: false, showSaveTemplate: true});
  }

  hideTemplateNamePopup = () => {
    this.setState({showPreviewDetails: true, showSaveTemplate: false, templateNameClass: 'simpleInput', templateName: ''});
  }

  handleTempNameSubmit = (e) => {
    e.preventDefault();

    let error               = false;
    let templateName        = this.state.templateName;
    let templateNameClass   = 'simpleInput';


    if ( templateName.trim() === '') {
      error             = true;
      templateNameClass = 'simpleInput field_error';
    } else {
      templateNameClass = 'simpleInput';
    }

    this.setState({templateNameClass: templateNameClass});

    if (error) {
      return
    }

    let formData                = {};
    formData.template_name      = templateName;
    formData.treatment_plan_id  = this.state.treatmentPlanID;

    this.setState({showLoader: true});
    this.props.savePlanAsTemplate(formData);
  }

  getPrescribedPlanData = (obj) => {
    this.setState({showLoader: true});

    this.props.getPrescribeOnlyDetails(obj.id);
  }

  hidePresOnlyPoup = () => {
    this.setState({showPresOnlyPopup: false});
  }

  makePrescribeOnly = () => {
    if ( this.state.treatmentPlanID ) {
      let formData                = {};
      formData.treatment_plan_id  = this.state.treatmentPlanID;

      this.setState({showLoader: true});

      this.props.updatePrescribeOnly(formData);
    }
  }

  performThisAction = (planID, actionType) => {
    this.setState({treatmentAction: actionType, showLoader: true});
    this.props.doThisAction(planID, actionType);
  }

  saveWithoutSign = () => {
    let proIDArr = [this.state.mdSignProcedureId]

        if (this.state.signature_url !== "") {
      let formData = {
        procedure_ids         : proIDArr,
        signature_saved       : (this.state.save_sign) ? 1 : 0,
        md_signature          : this.state.signature
      };

      //this.props.signProcedure(formData, true, listData, this.state.roomType, 'list');
      this.state.clientScopes = 'cardOnFiles,procedures';
      //this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
      let profileData = {
        'params': {
          scopes: this.state.clientScopes
        }
      };

      this.props.signProcedure(formData, false, profileData, 'md-room');
      this.setState({
        signature_url : this.state.signature_url,
        uploadedSignature_url : this.state.signature_url,
        uploadedSignature:this.state.signature,
        signature:this.state.signature,
        inputOut: 'input-outer',
        canvasClass: 'signature-box sig-div  no-display',
        clearClass: 'new-white-btn no-margin clear no-display',
        resetClass: 'new-blue-btn reset  no-display',
        changeClass: 'new-blue-btn no-margin Change',
        showSignModal: false,
        showLoader : true
      })
    }
  }

  signThis = () => {
    if ( (this._sketch && this._sketch.toJSON().objects.length === 0 && this.state.canvasClass.indexOf('no-display') === -1) || (this.state.canvasClass.indexOf('no-display') > 0 && this.state.signature_url === '' ) ) {

      toast.error(this.state.globalLang.validation_md_signature_required_if)
    } else {
      let proIDArr = [this.state.mdSignProcedureId]

      if (this.state.signature_url !== "" && this.state.canvasClass.indexOf('no-display') > 0) {
        let formData = {
          procedure_ids         : proIDArr,
          signature_saved       : (this.state.save_sign) ? 1 : 0,
          md_signature          : this.state.signature
        };
        //this.props.signProcedure(formData, true, listData, this.state.roomType, 'list');

        let profileData = {
          'params': {
            scopes: this.state.clientScopes
          }
        };

        this.props.signProcedure(formData, false, profileData, 'md-room');

        this.setState({
          signature_url : this.state.signature_url,
          uploadedSignature_url : this.state.signature_url,
          uploadedSignature:this.state.signature,
          signature:this.state.signature,
          inputOut: 'input-outer',
          canvasClass: 'signature-box sig-div  no-display',
          clearClass: 'new-white-btn no-margin clear no-display',
          resetClass: 'new-blue-btn reset  no-display',
          changeClass: 'new-blue-btn no-margin Change',
          showSignModal: false,
          showLoader : true
        })

      } else {
        clientProfileInstance.post(config.API_URL + "upload/signature", ({image_data : this._sketch.toDataURL(), upload_type: 'signatures'})).then(response => {
            if ( response.data && response.data.status === 200 ) {
              let formData = {
                procedure_ids         : proIDArr,
                signature_saved       : (this.state.save_sign) ? 1 : 0,
                md_signature          : response.data.data.file_name
              };

              //this.props.signProcedure(formData, true, listData, this.state.roomType, 'list');

              let profileData = {
                'params': {
                  scopes: this.state.clientScopes
                }
              };

              this.props.signProcedure(formData, false, profileData, 'md-room');

              this.setState({
                signature_url : this.state.signature_url,
                uploadedSignature_url : this.state.signature_url,
                uploadedSignature:this.state.signature,
                signature:this.state.signature,
                inputOut: 'input-outer',
                canvasClass: 'signature-box sig-div  no-display',
                clearClass: 'new-white-btn no-margin clear no-display',
                resetClass: 'new-blue-btn reset  no-display',
                changeClass: 'new-blue-btn no-margin Change',
                showSignModal: false,
                showLoader : true
              })
            }
        }).catch(error => {
            toast.error(this.state.roomTextData.signature_upload_error_text)
        })
      }
    }
  }


  openSignModal = (mdSignProcedureId) => {
    if(mdSignProcedureId){
      this.setState({mdSignProcedureId:mdSignProcedureId})
      if ( !this.state.showSigPopup ) {
        if ( this.state.signature_url ) {
          this.saveWithoutSign();
        } else {
          this.setState({showSignModal: true})
        }
      } else {
        this.setState({showSignModal: true})
      }
    }
  }

  dismissSignModal = () => {
     this.setState({showSignModal: false})
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

  clearCanvas = () => {
    if (this._sketch) {
      this._sketch.clear();
      this._sketch.setBackgroundFromDataUrl('');
    }
    this.setState({
        canvasClass: 'signature-box sig-div',
        inputOut: 'input-outer no-display',
        clearClass: 'new-white-btn no-margin clear',
        resetClass: 'new-blue-btn reset ',
        changeClass: 'new-blue-btn no-margin Change no-display'
    })
  }

 render() {
   let src          = '../../../images/user.png';
   let clientName   = '';
   let iconSrc      = '';
   let iconClass    = '';
   let fireCheck    = '';
   let fireMsg      = '';
   let dncCheck     = 0;
   let dncMsg       = '';
   let fireAction   = '';
   let dncAction    = '';
   let deleteMsg    = this.state.languageData.clientprofile_del_client_message;
   let address      = [];
   let isRegistered = this.state.languageData.clientprofile_not_registered;
   let portalAction = '';
   let portalCheck  = '';
   let hasPastAcc   = false;
   let ccNos        = [];
   let defTimeLine  = '';
   let portalInvited= '';
   let totalSavings = '';
   let memberImg    = '';

   if ( this.state.clientData !== undefined && this.state.clientData.user_image !== '' && this.state.clientData.user_image_url !== '' ) {
     src = this.state.clientData.user_image_url
   }

   clientName =  (this.state.clientData !== undefined && this.state.clientData.id !== undefined) ? this.state.clientData.firstname + " " + this.state.clientData.lastname : ''

   if ( this.state.clientData !== undefined && this.state.clientData.is_monthly_membership === 1 ) {
     memberImg = '../../../images/member.png'
   }

   if ( this.state.clientData !== undefined && this.state.clientData.is_monthly_membership === 0 && this.state.clientData.membership_cancelled_reason === 'payment_failed' ) {
     memberImg = '../../../images/non-member.png'
   }

   if ( this.state.clientData !== undefined && this.state.clientData.member_type === 'model' ) {
     if ( this.state.clientData.gender === '0' ) {
       iconClass = 'proc-img';
       iconSrc   = '../../../images/male-model.png'
     } else {
       iconSrc   = '../../../images/female-model.png'
     }
   }

   if ( this.state.clientData !== undefined && this.state.clientData.member_type === 'both' ) {
     //memberImg = '../../../images/member.png'
     if ( this.state.clientData.gender === '0' ) {
       iconClass = 'proc-img';
       iconSrc   = '../../../images/male-model.png'
     } else {
       iconSrc   = '../../../images/female-model.png'
     }
   }

    if ( this.state.clientData !== undefined && this.state.clientData.is_fired === 1 ) {
      fireCheck  = 'checked';
      fireMsg    = this.state.languageData.clientprofile_activate_message;
      fireAction = 'disable';
    } else {
      fireCheck  = '';
      fireMsg    = this.state.languageData.clientprofile_fire_message;
      fireAction = 'enable'
    }

    if ( this.state.clientData !== undefined && this.state.clientData.do_not_call === 1 ) {
      dncCheck   = 'checked';
      dncMsg     = this.state.languageData.clientprofile_disable_dnd_message;
      dncAction  = 'disable';
    } else {
      dncCheck   = '';
      dncMsg     = this.state.languageData.clientprofile_enable_dnd_message;
      dncAction  = 'enable';
    }

    if ( this.state.clientData !== undefined && this.state.clientData.address_line_1 ) {
      address.push(this.state.clientData.address_line_1)
    }

    if ( this.state.clientData !== undefined && this.state.clientData.address_line_2 ) {
      address.push(this.state.clientData.address_line_2)
    }

    if ( this.state.clientData !== undefined && this.state.clientData.city ) {
      address.push(this.state.clientData.city)
    }

    if ( this.state.clientData !== undefined && this.state.clientData.state ) {
      address.push(this.state.clientData.state)
    }

    if ( this.state.clientData !== undefined && this.state.clientData.pincode ) {
      address.push(this.state.clientData.pincode)
    }

    if ( this.state.clientData !== undefined && this.state.clientData.country ) {
      address.push(this.state.clientData.country)
    }

    if ( this.state.clientData !== undefined && this.state.clientData.is_monthly_membership ) {
      if ( this.state.clientData.is_monthly_membership === 1 ) {
        isRegistered = this.state.languageData.clientprofile_registered;
        totalSavings = this.state.languageData.clientprofile_mem_saving + ' ' + numberFormat(this.state.clientData.membership_benefits_this_year, 'currency')
      }
    }

    if ( this.state.clientData !== undefined && this.state.clientData.access_portal === 1 ) {
      if ( this.state.clientData.patient_account !== undefined && this.state.clientData.patient_account !== null ) {
        hasPastAcc = true;
      }
      portalAction = 'disable';
      portalCheck  = "checked";
    } else {
      portalAction = 'enable';
    }

    if ( this.state.clientData !== undefined && this.state.clientData.card_on_files ) {
      this.state.clientData.card_on_files.map((obj, idx) => {
        ccNos.push(obj.card_number)
      })
    }

    if ( this.state.clientData !== undefined && this.state.clientData.account_prefrences !== undefined && this.state.clientData.account_prefrences !== null && this.state.defTimeLine !== 'treatmentPlan') {
      defTimeLine = this.state.clientData.account_prefrences.default_template
    }

    let clinicOptData    = '';

    if ( this.state.cardData.clinics !== undefined && this.state.cardData.clinics.length ) {
      clinicOptData = this.state.cardData.clinics.map((clinicData, clinicIDx) => {
         return <option selected={this.state.clicnicForCard === clinicData.id} key={clinicIDx} value={clinicData.id}>{clinicData.clinic_name}</option>;
     })
    }

    let referer     = 0
    let showMissing = false

    if ( this.state.clientData !== undefined && (this.state.clientData.referral_source || this.state.clientData.referral_person) ) {
      referer = 1
    }

    if ( this.state.clientData !== undefined && (!this.state.clientData.address_line_1 || !this.state.clientData.city || !this.state.clientData.state || !this.state.clientData.country || !this.state.clientData.pincode) || referer === 0 ) {
      showMissing = true
    }

    let monthlyMembershipType = this.state.monthly_membership_type;

    let daysInMonth = moment().daysInMonth();

    let daysOptData = "";
    let daysArray   = [];

    //for ( let i = 1; i <= daysInMonth; i++ ) {
    for ( let i = 1; i <= 28; i++ ) {
      daysArray.push(i);
    }

    if ( daysArray !== undefined && daysArray.length ) {
      daysOptData = daysArray.map((daysData, daysIdx) => {
         return <option key={daysData} value={daysData}>{daysData}</option>;
     })
    }


    let monthArray    = [];
    let treatStartOn  = parseInt(this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.start_year) + '/' + (this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.start_month) + '/' + 1;
    let expireAfter   = this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.duration;

    if ( this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.plan_type === 'monthly' ) {
      for ( let i = 1; i <= expireAfter; i++ ) {
        let tempArray = [];

        if ( i === 1 ) {
          tempArray.push(moment(treatStartOn).format('MMMM, YYYY'));
        } else {
          tempArray.push(treatStartOn);
        }

        treatStartOn = moment(treatStartOn).add(1, 'month').format('MMMM, YYYY');
        monthArray.push(tempArray);
      }
    }

   return(

     <div id="content">
        <div className="container-fluid content setting-wrapper">

          <div className={(this.state.showPresOnlyPopup === true && this.state.presOnlyDetails) ? 'blackOverlay' : 'blackOverlay no-display'}>
            <div className="vert-middle">
              <div className="loyaltyMembership treatmentPlan">
                <div className="newPopupTitle">{(this.state.userData && this.state.userData.account) ? capitalizeFirstLetter(this.state.userData.account.name) : ''} Treatment Plan <a className="popupClose"><img onClick={() => this.hidePresOnlyPoup()} src={picClose} /></a></div>
                <div className="newPopupContent">
                <div className="treatment-timeline">
                  <div className="row">

                    <div className="col-sm-7 col-xs-12">
                    {(this.state.presOnlyDetails && this.state.presOnlyDetails.plan_type === 'payg' && this.state.presOnlyDetails.pay_as_you_go && this.state.presOnlyDetails.pay_as_you_go.length > 0) && this.state.presOnlyDetails.pay_as_you_go.map((obj, idx) => {
                      return (
                        <div key={idx} className="treatmentSection">
                            {<div className="procedureDate payg-schedule">{obj.product_name}: <label className="smallDetails">{obj.units} Units (Every {obj.repeat_val} {obj.repeat_by})</label> </div>}
                        </div>
                      )
                    })
                    }

                    {

                      (this.state.pMonthArray && this.state.pMonthArray.length > 0 ) && this.state.pMonthArray.map((mobj, idx) => {
                        let show          = false;
                        let returnedArray = (this.state.presOnlyDetails && this.state.presOnlyDetails.patient_treatment_plan_schedule && this.state.presOnlyDetails.patient_treatment_plan_schedule.length > 0) && this.state.presOnlyDetails.patient_treatment_plan_schedule.map((mmobj, midx) => {
                          let monthToCompare  = parseInt(mmobj.month);
                          let returnJSX       = '';
                          let productName     = (mmobj.product) ? capitalizeFirstLetter(mmobj.product.product_name) : 'N/A';
                          let units           = (mmobj.units) ? ', ' + mmobj.units + ' units' : '';

                          if (parseInt(moment(mobj[0]).format('MM')) === monthToCompare) {
                            show = true;
                            return (
                              <div key={midx}>{productName}{units}</div>
                            )
                          }
                        })
                        return (
                          <div key={idx} className={(show) ? "treatmentSection" : "treatmentSection no-display"}>
                            <div className="procedureDate">{mobj[0]}</div>
                              <div className="treatmentContent">
                                <div className="treatmentDetails">
                                  {
                                    returnedArray
                                  }
                                </div>
                              </div>
                          </div>
                        )
                      })
                    }
                    </div>

                    <div className="col-sm-5 col-xs-12 treatment-timeline">
                        <div className="row">
                          <div className="col-xs-12">
                            <div className="treat-text">Prescribed by</div>
                            <div className="TP-total">{(this.state.presOnlyDetails && this.state.presOnlyDetails.user) && displayName(this.state.presOnlyDetails.user)}</div>
                          </div>
                          <div className="col-xs-6">
                            <div className="treat-text">Total <a onClick={() => this.viewBreakDown(true)} title="View detailed breakdown of this amount" className="help-icon sm-help">?</a></div>
                            <div className="TP-total">{numberFormat(this.state.presOnlyDetails && this.state.presOnlyDetails.total_amount, 'currency')}</div>
                          </div>
                          <div className="col-xs-12">
                            <div className="treat-text">Plan type</div>
                            <div className="TP-total">{(this.state.presOnlyDetails && this.state.presOnlyDetails.plan_type === 'payg') ? 'Pay As You Go' : 'Monthly' }</div>
                          </div>
                          {(this.state.presOnlyDetails && this.state.presOnlyDetails.clinic) && <div className="col-xs-12">
                            <div className="treat-text">Clinic</div>
                            <div className="TP-total">{(this.state.presOnlyDetails && this.state.presOnlyDetails.clinic) &&  this.state.presOnlyDetails.clinic.clinic_name}</div>
                          </div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {(this.state.presOnlyDetails) && <div className="footer-static p-b-0">
                  <a onClick={() => this.performThisAction(this.state.presOnlyDetails.id, 'print')} className="line-btn pull-right no-width">Print/Download</a>
                  <a onClick={() => this.performThisAction(this.state.presOnlyDetails.id, 'send_to_patient')} className="line-btn pull-right">Send to Patient</a>
                </div>}
              </div>
            </div>
          </div>


          <TreatmentPlan closeTratmentModal={() => this.hideTreatmentModal()} createNewTreatmentPlan={() => this.showCreateTreatModal()} cancelCreateTreatmenPlan={() => this.closeCreateTratmentModal()} parentState={this.state} changeTreatType={this.changeTreatType} handleChildChange={this.handleInputChange} handleChildFormSubmit={this.handleChildCreateSubmit} onChangeChildDatePicker={this.onChangeDatePicker} removePaygRows={this.removePaygRows} addMorePaygRows={this.addMorePaygRows} handleChildProductChange={this.handleProductChange} selectChildProduct={this.selectProduct} selectThisTemplate={this.selectThisTemplate} showUseConfirmation={this.showUseConfirmation} dismissUseModal={this.dismissUseModal} generateChildMonthlyHTML={this.generateMonthlyHTML} addMoreMonthlyRows={this.addMoreMonthlyRows} removeMonthlyRows={this.removeMonthlyRows} saveThePlan={this.saveThePlan} hideChildPreviewDetails={this.hidePreviewDetails} hideChildStartProgram={this.hideProgramDetails} showChildProgramDetails={this.showProgramDetails} changeChildDiscType={this.changeDisCountType} applyChildProgramDiscount={this.applyProgramDiscount} viewChildBreakDown={this.viewBreakDown} hideChildBreakDown={this.hideBreakDown} handleChildProgramSubmit={this.handleProgramSubmit} hideChildChangePlanCCPopup={this.hideChangePlanCCPopup} handleChildChangeCard={this.handleChangeCard} showChildTemplateNamePopup={this.showTemplateNamePopup} hideChildTemplateNamePopup={this.hideTemplateNamePopup} handleChildTempNameSubmit={this.handleTempNameSubmit} makeChildPrescribeOnly={this.makePrescribeOnly}/>
        <div className={(this.state.showSignModal) ? 'modalOverlay' : 'modalOverlay no-display'}>
          <div className="small-popup-outer">
            <div className="small-popup-header">
              <div className="popup-name">{this.state.roomTextData.md_dir_consent_text}</div>
              <a onClick={this.dismissSignModal} className="small-cross">×</a>
            </div>

            <div className="juvly-container">
              <div className="settings-subtitle signature-subtitle">{this.state.roomTextData.please_sign_below_text}:</div>
              <div className={this.state.canvasClass} id="sig-div">
                  {((this.state.showSignModal) && this.state.canvasClass === 'signature-box sig-div') && <SketchField width='400px'
                   ref={c => (this._sketch = c)}
                   height='200px'
                   tool={Tools.Pencil}
                   lineColor='black'
                   lineWidth={6}
                   />}
              </div>
              <div className="img-src" id="img-src">
                <div className={this.state.inputOut} style={{background: '#fff none repeat scroll 0 0'}}>
                  <img className="" id="signature_image" src={(this.state.uploadedSignature_url) ? this.state.uploadedSignature_url : this.state.signature_url}/>
                </div>
              </div>

              <div className="right-sign-btn m-t-20">
                <input className="pull-left sel-all-visible" type="checkbox" name="save_sign" autoComplete="off" onChange={this.handleInputChange}/>
                <label className="search-text" htmlFor="save_sign"> {this.state.roomTextData.save_sig_text}</label>
              </div>

              <div className="img-src change-sig">
                <div className="pull-left">
                  <button type="button" id="change" onClick={this.clearCanvas} className={this.state.changeClass}>{this.state.roomTextData.btn_change_text}</button>
                </div>
                <div className="pull-left">
                  <button type="button" id="change1" onClick={this.clear} className={this.state.clearClass}>{this.state.roomTextData.btn_clear_text}</button>
                </div>
                <div className="pull-left">
                  <button type="button" id="change2" onClick={this.handleClearReset} className={this.state.resetClass}>{this.state.roomTextData.btn_reset_text}</button>
                </div>
                <div className="pull-left">
                  {/*<button type="button" id="change3" onClick={this.saveSignature} className={this.state.resetClass}>Save Signature</button>*/}
                </div>
              </div>
            </div>
            <div className="footer-static">
              <a id="saveConsultation" onClick={this.signThis} className="new-blue-btn pull-right">{this.state.roomTextData.sign_text}</a>
            </div>
          </div>
        </div>

          {<div className={(this.state.showMembershipModal === true) ? "blackOverlay" : "blackOverlay no-display"}>

              <div className="vert-middle">

                  <div className="loyaltyMembership">
                    <form onSubmit={this.handleMembershipSubmit}>
                    <div className="newPopupTitle">{this.state.languageData.clientprofile_monthly_membership} <a onClick={() => this.hideMembershipModal()} className="popupClose"><img src={picClose} /></a></div>
                    <div className="newPopupSubTitle">{this.state.languageData.clientprofile_add_membership}</div>
                    <div className="newPopupContent">
                      <div className="membershipDetail">
                        <div className="row">
                          <div className="col-sm-12">
                            <div className="simpleLabel">{this.state.languageData.clientprofile_membersip_plan}</div>
                            <div className="simpleField">
                              <input name="recurly_program_name_temp" className={'simpleInput'} onChange={this.handleInputChange} type="text" value={this.state.recurly_program_name} autoComplete="off" placeholder={this.state.languageData.clientprofile_membersip_plan} readOnly={'readOnly'} disabled={'disabled'} />
                            </div>
                          </div>
                        </div>
                        {(this.state.membership_tier === 'multiple') && <div className="row">
                          <div className="col-sm-12">
                            <div className="simpleLabel">{this.state.languageData.clientprofile_membership_type}</div>
                            <div className="simpleField">
                              <select className={this.state.membership_tier_idClass} onChange={this.handleInputChange} name="membership_tier_id" value={this.state.membership_tier_id}>
                                {((this.state.membership_tier_types) && this.state.membership_tier_types.length > 0) ?
                                  this.state.membership_tier_types.map((obj,idx)=>{
                                    return (
                                      <option value={obj.id} >{obj.tier_name}</option>
                                    )
                                  })
                                  :
                                  <option value="" >Select</option>
                                }
                              </select>
                            </div>
                          </div>
                          {(this.state.membership_tier_type_products !== '' && this.state.membership_tier_type_products !== null && this.state.membership_tier_type_products !== undefined) &&
                          <div className="col-sm-12">
                            <div className="simpleLabel">{this.state.languageData.client_free_monthly_products}</div>
                            <div className="simpleField font-weight-600">{this.state.membership_tier_type_products}
                            </div>
                          </div>
                        }
                        {(this.state.membership_on_all_product > 0) &&
                        <div className="col-sm-12">
                          <div className="simpleField">{this.state.languageData.client_discount_on_all_items} <span className="font-weight-600">{numberFormat(this.state.membership_on_all_product,'decimal',2)+'%'}</span>
                          </div>
                        </div>
                      }
                    </div>
                  }

                        {(this.state.membership_tier === 'single') &&
                          <div className="row">
                            <div className="col-sm-5 col-xs-12 membershipLabel">{this.state.globalLang.signup_label_subscription_type}</div>
                            <div className="col-sm-3 col-xs-6">{monthlyMembershipType.toUpperCase()}</div>
                          </div>
                        }
                        <div className="row">
                          <div className="col-sm-5 col-xs-12 membershipLabel">{this.state.languageData.label_price_per_month}</div>
                          <div className="col-sm-3 col-xs-6">{numberFormat(this.state.monthly_membership_fees, 'currency', 2)}</div>
                        </div>


                        <div className="row">
                          <div className="col-sm-5 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_ots_fee}</div>
                          <div className="col-sm-3 col-xs-6">{numberFormat(((!this.state.waiveOffOTFee) ? this.state.one_time_membership_setup : 0.00), 'currency', 2)}</div>
                          {(this.state.one_time_membership_setup > 0) && <div className="col-sm-4 col-xs-6 no-padding-left"><div className="waive-setup"><input type="checkbox" className="new-check" checked={(this.state.waiveOffOTFee) ? 'checked' : false} check name="waiveOffOTFee" onChange={this.handleInputChange} ref={'ref_waive'}/> {this.state.languageData.clientprofile_waive_setup_fee}</div></div>}
                        </div>
                        {(this.state.discountCouponApplied === 1) && <div className="row">
                          <div className="col-sm-5 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_discount}</div>
                          <div className="col-sm-3 col-xs-6">{numberFormat(this.state.totalDiscount, 'currency', 2)}</div>
                        </div>}
                        <div className="row">
                          <div className="col-sm-5 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_total}</div>
                          <div className="col-sm-3 col-xs-6">{numberFormat(((!this.state.waiveOffOTFee) ? (this.state.total_membership_without_waive - this.state.totalDiscount) : this.state.total_membership_with_waive - this.state.totalDiscount), 'currency', 2)}</div>
                        </div>
                      </div>

                      {(this.state.monthly_membership_type === 'paid') && <div className="newPopupSubTitle m-t-15">{this.state.languageData.clientprofile_coupon_code}</div>}
                      {(this.state.monthly_membership_type === 'paid') && <div className="row m-b-15">
                        <div className="col-sm-6">
                          <div className="simpleField"><input name="couponCode" className={this.state.couponCodeClass} onChange={this.handleInputChange} type="text" value={this.state.couponCode} autoComplete="off" placeholder="Enter Code" readOnly={(this.state.discountCouponApplied) ? true : false} /></div>
                        </div>
                        <div className="col-sm-6">
                          {(this.state.discountCouponApplied) ? <div><a className="simple-btn pull-right disable">{this.state.languageData.clientprofile_applied}</a></div> : <div><a onClick={() => this.applyCouponCode()} className="simple-btn pull-right">{this.state.languageData.clientprofile_apply}</a></div>}
                        </div>
                      </div>}

                      {(this.state.monthly_membership_type === 'paid') && <div className="newPopupSubTitle m-t-15">{this.state.languageData.client_specify_membership_fee_charge_day}</div>}
                      {(this.state.monthly_membership_type === 'paid') && <div className="row m-b-15">
                        <div className="col-sm-6">
                          <div className="simpleField">
                            <select className="simpleInput" onChange={this.handleInputChange} name="drawDate" value={this.state.drawDate}>
                              {daysOptData}
                            </select>
                          </div>
                        </div>

                      </div>}

                      <div className="newPopupSubTitle m-t-15">{this.state.languageData.clientprofile_details}</div>
                      <div className="row m-b-15">
                        <div className="col-sm-6">
                          <div className="simpleLabel">{this.state.languageData.clientprofile_email}<span className="required m-l-5">*</span></div>
                          <div className="simpleField"><input name="patientEmail" className={this.state.patientEmailClass} onChange={this.handleInputChange} type="text" value={this.state.patientEmail} autoComplete="off" placeholder={this.state.languageData.clientprofile_enter_email} /></div>
                        </div>
                        <div className="col-sm-6 calender">
                          <div className="simpleLabel">{this.state.languageData.clientprofile_start_date}<span className="required m-l-5">*</span></div>
                          <div className="simpleField field-icon start-date-picker">

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
                      </div>
                      <div className={((!this.state.waiveOffOTFee && this.state.total_membership_without_waive > 0) || (this.state.waiveOffOTFee && this.state.total_membership_with_waive > 0)) ? '' : 'no-display'}>
                        <div className="newPopupSubTitle">{this.state.languageData.clientprofile_payment_details}</div>
                        <div className="row m-b-15">
                          <div className="col-sm-6 payment-field">
                            <div className="simpleLabel">{this.state.languageData.clientprofile_cc_number}<span className="required m-l-5">*</span></div>
                            <div className="simpleField"><div className="simpleInput" id="m-card-number"></div></div>
                          </div>
                          <div className="col-sm-3 payment-field">
                            <div className="simpleLabel">{this.state.languageData.clientprofile_exp_date}<span className="required m-l-5">*</span></div>
                            <div className="simpleField"><div className="simpleInput" id="m-card-expiry"></div></div>
                          </div>
                          <div className="col-sm-3 payment-field">
                            <div className="simpleLabel">{this.state.languageData.clientprofile_cvc}<span className="required m-l-5">*</span></div>
                            <div className="simpleField"><div className="simpleInput" id="m-card-cvc"></div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="newPopupfooter">
                      <input type="submit" className="simple-btn pull-right" value={this.state.languageData.clientprofile_save} />
                    </div>
                    </form>
                  </div>

              </div>

          </div>}

          {
            <div className={(this.state.showImmediateMembershipModal === true) ? "blackOverlay" : "blackOverlay no-display"}>
              <div className="vert-middle">
                <div className="loyaltyMembership start-program-main">
                  <div className="newPopupTitle">{this.state.languageData.clientprofile_monthly_membership} <a onClick={() => this.hideImmediateMembershipModal()} className="popupClose"><img src={picClose} /></a></div>
                  <div className={(this.state.showMembershipSection) ? "row m-b-20" : "row m-b-20 no-display"}>
                    {(this.state.membershipData && this.state.membershipData.main_monthly_membership_fees > 0) && <div className="col-sm-6 col-xs-12 m-b-10"><a onClick={() => this.changeMembershipCard()} className="simple-btn full-width">{this.state.languageData.clientprofile_change_card}</a></div>}
                    <div className="col-sm-6 col-xs-12"><a data-message="Are you sure you want to cancel your monthly membership subscription?" data-mtype="cancel" data-action="cancelStartedMembership" onClick={this.openModal} className="simple-btn full-width">{this.state.languageData.clientprofile_cancel_membership}</a></div>
                  </div>
                  {(this.state.membershipData && this.state.showMembershipSection) && <div className="newPopupContent">
                    <div className="membershipDetail m-b-20">
                      <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_membership_fee}</div>
                        {this.state.membershipData && this.state.membershipData.mothly_membership_type == 'paid' && <div className="col-sm-8 col-xs-12">{numberFormat(this.state.membershipData.mothly_membership_fees, 'currency')} {'(recurring per month)'}</div>}

                        {this.state.membershipData && this.state.membershipData.mothly_membership_type != 'paid' && <div className="col-sm-8 col-xs-12">{numberFormat(this.state.membershipData.mothly_membership_fees, 'currency')} {'(recurring per month)'}</div>}
                        {/* as said by anup*/}
                      </div>
                      <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_ots_fee}</div>
                        <div className="col-sm-8 col-xs-12">{numberFormat(this.state.membershipData.one_time_membership_setup, 'currency')}</div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_start_date}</div>
                        <div className="col-sm-8 col-xs-12">{showFormattedDate(this.state.membershipData.subscription_started_at)}</div>
                      </div>
                      <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_sub_valid_upto}</div>
                        <div className="col-sm-8 col-xs-12">{showFormattedDate(this.state.membershipData.subscription_valid_upto)}</div>
                      </div>
                      {(this.state.membershipData.card_details && this.state.membershipData.card_details !== '--') && <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_client_card}</div>
                        <div className="col-sm-8 col-xs-12">{this.state.membershipData.card_details}</div>
                      </div>}
                      {(this.state.appliedCoupon) && <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.label_coupon_applied}</div>
                        <div className="col-sm-8 col-xs-12">{this.state.appliedCoupon} ({numberFormat(this.state.total_discount, 'currency')})</div>
                      </div>}
                      {(this.state.membership_on_all_product > 0) && <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.client_discount_on_all_items}</div>
                        <div className="col-sm-8 col-xs-12">{numberFormat(this.state.membership_on_all_product, 'decimal')+'%'}</div>
                      </div>}

                    </div>
                  </div>}

                  <div className={(this.state.showNewCardSection) ? '' : 'no-display'}>
                    <form onSubmit={this.handleSubmitPayment}>
                      <div className="newPopupSubTitle">{this.state.languageData.clientprofile_card_details}</div>
                      <div className="row">
                        <div className="col-sm-6 payment-field">
                          <div className="simpleLabel">{this.state.languageData.clientprofile_cc_number}<span className="required m-l-5">*</span></div>
                          <div className="simpleField"><div className="simpleInput" id="mem-card-number"></div></div>
                        </div>
                        <div className="col-sm-3 payment-field">
                          <div className="simpleLabel">{this.state.languageData.clientprofile_exp_date}<span className="required m-l-5">*</span></div>
                          <div className="simpleField"><div className="simpleInput" id="mem-card-expiry"></div></div>
                        </div>
                        <div className="col-sm-3 payment-field">
                          <div className="simpleLabel">{this.state.languageData.clientprofile_cvc}<span className="required m-l-5">*</span></div>
                          <div className="simpleField"><div className="simpleInput" id="mem-card-cvc"></div></div>
                        </div>
                      </div>
                      <div className="pull-right m-b-20">
                      <input type="submit" className="simple-btn pull-right m-l-10" value={this.state.languageData.clientprofile_save_card} />
                      <a onClick={() => this.cancelUpdateMembershipCard()} className="simple-btn pull-right">{this.state.languageData.clientprofile_cancel}</a>
                      </div>
                   </form>
                  </div>

                  <div className="newPopupSubTitle m-b-15">{this.state.languageData.clientprofile_mem_sub_invoices}</div>

                  <div className="table-responsive fixed-header-table">
                  <table className="table-updated juvly-table no-hover table-min-width table-fixed">
                    <thead className="table-updated-thead">
                      <tr>
                        <th className="col-xs-5 table-updated-th">{this.state.languageData.clientprofile_invoice_number}</th>
                        <th className="col-xs-3 table-updated-th">{this.state.languageData.clientprofile_invoice_date}</th>
                        <th className="col-xs-2 table-updated-th text-right">{this.state.languageData.clientprofile_amount}</th>
                        <th className="col-xs-2 table-updated-th">{this.state.languageData.clientprofile_status}</th>
                      </tr>
                    </thead>
                    <Scrollbars style={{ height:217}} className="full-width">
                      <tbody className="ajax_body">
                      {(this.state.showLoader === false && this.state.membershipData && this.state.membershipData.monthly_membership_invoices && this.state.membershipData.monthly_membership_invoices.length > 0 ) && this.state.membershipData.monthly_membership_invoices.map((obj, idx) => {
                          return (
                            <tr key={idx} className="table-updated-tr">
                              <td className="col-xs-5 table-updated-td">{(obj.invoice_number) ? obj.invoice_number : ''}</td>
                              <td className="col-xs-3 table-updated-td">{(obj.created) ? showFormattedDate(obj.created) : ''}</td>
                              <td className="col-xs-2 table-updated-td text-right">{(obj.amount) ? numberFormat(obj.amount, 'currency') : ''}</td>
                              <td className="col-xs-2 table-updated-td">{(obj.payment_status) ? obj.payment_status : ''}</td>
                            </tr>
                          )
                        })}
                        <tr className={this.state.membershipData && this.state.membershipData.monthly_membership_invoices && this.state.membershipData.monthly_membership_invoices.length > 0 ? "table-updated-tr no-display" : "table-updated-tr"}><td className="no-record" colSpan="4">{this.state.languageData.client_no_record_found}</td></tr>
                      </tbody>
                    </Scrollbars>
                  </table>
                  </div>

                </div>
              </div>
            </div>
          }

          {
            <div className={(this.state.showFutureMembershipModal === true) ? "blackOverlay" : "blackOverlay no-display"}>
              <div className="vert-middle">
                <div className="loyaltyMembership">
                  <div className="newPopupTitle">{this.state.languageData.clientprofile_monthly_membership} <a onClick={() => this.hideFutureMembershipModal()} className="popupClose"><img src={picClose} /></a></div>
                  {(this.state.membershipData) && <div className="newPopupContent">
                    <div className="membershipDetail">
                      <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_membership_fee}</div>
                        {<div className="col-sm-8 col-xs-12">{numberFormat(this.state.membershipData.mothly_membership_fees, 'currency')} {(this.state.membershipData && this.state.membershipData.one_time_membership_setup > 0) ? '(Setup fee included)' : '(Setup fee not included)'}</div>}
                      </div>
                      <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_ots_fee}</div>
                        <div className="col-sm-8 col-xs-12">{numberFormat(this.state.membershipData.one_time_membership_setup, 'currency')}</div>
                      </div>
                      {(this.state.appliedCoupon) && <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.label_coupon_applied}</div>
                        <div className="col-sm-8 col-xs-12">{this.state.appliedCoupon} ({numberFormat(this.state.total_discount, 'currency')})</div>
                      </div>}
                      {(this.state.membership_on_all_product > 0) && <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.client_discount_on_all_items}</div>
                        <div className="col-sm-8 col-xs-12">{numberFormat(this.state.membership_on_all_product, 'decimal')+'%'}</div>
                      </div>}
                      <div className="row">
                        <div className="col-sm-4 col-xs-12 membershipLabel">{this.state.languageData.clientprofile_will_start_on}</div>
                        <div className="col-sm-8 col-xs-12">{showFormattedDate(this.state.membershipData.subscription_started_at)}</div>
                      </div>
                      <a data-message="Are you sure you want to cancel your monthly membership subscription?" data-mtype="cancel" data-action="cancelMembership" onClick={this.openModal} className="simple-btn m-t-20">{this.state.languageData.clientprofile_cancel_membership}</a>
                    </div>
                  </div>}
                </div>
              </div>
            </div>
          }


          <div className="row duplicate-patient-title">
            <div className="col-sm-3">
              <Link to={`/clients`} className="pull-left go-back go-back-arrow"></Link>
              <span className="patient-count">{this.state.languageData.clientprofile_profile}</span>
            </div>
            <div className="right-create-patient col-sm-9 profile-right">
              {(checkIfPermissionAllowed('view-customer-notes') || (checkIfPermissionAllowed('view-appointments')) || (checkIfPermissionAllowed('manage-medical-history')) || (checkIfPermissionAllowed('add-update-documents'))) && <div className="dropdown pull-right more-info-profile-dropdown">
                <button className="line-btn pull-right" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">{this.state.languageData.clientprofile_more_info}
                <i className="fas fa-angle-down"></i>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                  {(checkIfPermissionAllowed('export-procedures')) && <li><a className="header-unselect-btn modal-link" onClick={() => this.exportClientProcedures()}>{this.state.languageData.clientprofile_export_procedure}</a></li>}

                  {(checkIfPermissionAllowed('view-appointments')) && <li><a onClick={() => this.getUpcomingAppointments()} className="header-unselect-btn setting">{this.state.languageData.clientprofile_upcoming_appointments} {(this.state.clientData.upcoming_appointment_count) ? "(" + this.state.clientData.upcoming_appointment_count + ")" : "(0)"}</a></li>}

                  {(checkIfPermissionAllowed('manage-medical-history')) && <li><a onClick={() => this.getMedicalHistory()} className="header-unselect-btn setting modal-link" >{this.state.languageData.clientprofile_medical_history}</a></li>}

                  {(checkIfPermissionAllowed('add-update-documents')) && <li><a onClick={() => this.getClientDocuments()} className="header-unselect-btn setting modal-link" >{this.state.languageData.clientprofile_documents}</a></li>}

                  {(this.state.clientData !== undefined && this.state.clientData.account !== null && this.state.clientData.account !== undefined && this.state.clientData.account.pos_enabled === 1) && <li><a onClick={() => this.getPaymentHistory()} className="header-unselect-btn setting modal-link">{this.state.languageData.clientprofile_payment_history}</a></li>}
                </ul>
              </div>}

              {(checkIfPermissionAllowed('view-customer-notes')) && <a className="blue-btn pull-right" onClick={() => this.getCustomerNotes()}>{this.state.languageData.clientprofile_customer_notes}</a>}

              {(checkIfPermissionAllowed('manage-procedures') && this.state.defTimeLine !== '' && this.state.defTimeLine === 'cosmetic' ) && <a onClick={() => this.createProcedure('cosmetic')} className="blue-btn pull-right">{this.state.languageData.clientprofile_create_procedure}</a>}

              {(checkIfPermissionAllowed('manage-procedures') && this.state.defTimeLine !== '' && this.state.defTimeLine === 'health' ) && <a onClick={() => this.createProcedure('health')} className="blue-btn pull-right">{this.state.languageData.clientprofile_create_procedure}</a>}

              {this.state.clientData !== undefined && this.state.clientData.account !== null && this.state.clientData.account !== undefined && this.state.clientData.account.pos_enabled === 1 && <a onClick={() => this.openClientWallet()} className="blue-btn pull-right">{this.state.languageData.clientprofile_client_wallet}</a>}

              {this.state.clientData !== undefined && this.state.clientData.active_treamtment_plan === 0 && this.state.clientData.account !== null && this.state.clientData.account !== undefined && this.state.clientData.account.pos_enabled === 1 && this.state.clientData.account.pos_gateway === "stripe" && <a onClick={() => this.showTreatmentModal()} className="blue-btn pull-right">Treatment Plan</a>}
              {(this.state.isMembershipOn == 1 || getIsMembershipEnabled() === true) && <a onClick={() => this.showMembershipModal()} className="blue-btn pull-right">{this.state.languageData.clientprofile_membersip_plan}</a>}


              {(checkIfPermissionAllowed('create-appointment')) && <a onClick={() => this.createAppointment()} className="blue-btn pull-right">{this.state.languageData.clientprofile_create_appointment}</a>}
            </div>
          </div>

          <div className="merge-outer row">

            {(this.state.clientData !== undefined ) && <div className="patient-left col-sm-4 merge-info">
              <div className="merge-setion">
                <div className="section-title header-blue">
                  <span className="section-title-name">{this.state.languageData.client_client_information}</span>
                </div>
                {
                  (this.state.showLoader === false && showMissing && checkIfPermissionAllowed('add-update-patients')) && <div className="profile-header-red">{this.state.languageData.clientprofile_source_missing} <a onClick={this.editClienProfile}>{this.state.languageData.clientprofile_click_here}</a> {this.state.languageData.clientprofile_to_add}</div>
                }
                <div className="pro-pic-outer">

                  <img src={src} />
                  <div className="profile-img-info">
                    <h3 className="break-word-content">{clientName}</h3>
                    <div className="member-type-outer">

                      {
                        ( this.state.clientData && memberImg ) && <img src={memberImg} />
                      }
                      {
                        ( this.state.userData !== undefined && (this.state.userData.user.account_id === config.JUVLY_ACC_ID || this.state.userData.user.account_id === config.CC_ACC_ID) && iconSrc) && <img className={iconClass} src={iconSrc} />
                      }
                    </div>
                    <div className="client-setting">
                      <span>{this.state.languageData.clientprofile_fire_this_client}</span>
                      <label className="setting-switch pull-right">
                      <input ref={'ref_1'} type="checkbox" defaultChecked={this.state.clientData.is_fired} data-message={fireMsg} data-mtype={fireAction} data-action="updateFireStatus" name="fireCheck" className="setting-custom-switch-input" onClick={this.openModal} />
                      <span className="setting-slider "></span>
                      </label>
                    </div>
                    <div className="client-setting">
                      <span>{this.state.languageData.clientprofile_dnc}</span>
                      <label className="setting-switch pull-right">
                      <input ref={'ref_2'} type="checkbox" defaultChecked={this.state.clientData.do_not_call} data-mtype={dncAction} data-message={dncMsg} data-action="updateDnc" name="dncCheck" className="setting-custom-switch-input" onClick={this.openModal} />
                      <span className="setting-slider"></span>
                      </label>
                    </div>
                    {( checkIfPermissionAllowed('add-update-patients') || checkIfPermissionAllowed('delete-patients') || checkIfPermissionAllowed('export-patients') ) && <div className="dropdown">
                      <button className="line-btn profile-actions no-margin" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                      {this.state.languageData.client_actions}
                      <i className="fas fa-angle-down"></i>
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                        {(checkIfPermissionAllowed('add-update-patients')) && <li><a className="modal-link" onClick={this.editClienProfile}>{this.state.languageData.client_edit}</a></li>}
                        {(checkIfPermissionAllowed('delete-patients')) && <li><a className="confirm-model" onClick={this.openModal} data-message={deleteMsg} data-mtype="delete" data-action="deleteClient">{this.state.languageData.client_delete}</a></li>}
                        {(checkIfPermissionAllowed('export-patients')) && <li><a onClick={this.exportClientPDF}>{this.state.languageData.clientprofile_export_pdf}</a></li>}
                      </ul>
                    </div>}
                  </div>
                </div>
                <div className="about-form">
                  <div className="row">
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.client_email}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.email !== '') ? this.state.clientData.email : ''}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.client_phone}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.phoneNumber !== '') ? this.state.clientData.phoneNumber : ''}</span>
                    </div>

                    {(this.state.clientData && this.state.clientData.email && this.state.clientData.account_prefrences.allow_patients_to_manage_appt > 0 && this.state.clientData.account_prefrences.patient_portal_activation_link > 0 ) && <div className="col-xs-12">
                      <label className="popup-input-field-name accessporta-name">{this.state.languageData.clientprofile_access_portal}</label>
                      <div className="access-portal-allrow">
                        <div className="access-portal-row">
                          <span className="access-portal-label">{this.state.languageData.clientprofile_invited} </span>
                          <label className="setting-switch">
                          <input ref={'ref_3'} type="checkbox" name="access_portal" data-message={'Are you sure you want to change this access?'} data-mtype={portalAction} data-action="updatePatientPortalAccess" className="setting-custom-switch-input" onClick={this.openModal} defaultChecked={this.state.clientData.access_portal} />
                          <span className="setting-slider "></span>
                          </label>

                          {( hasPastAcc === true ) && <button onClick={() => this.showResetPassModal()} className="line-btn pull-right restPasPtn" type="button" id="reset_portal_btn" >{this.state.languageData.clientprofile_reset_password}</button>}
                        </div>
                        {( this.state.clientData.access_portal === 1 ) && <div className="access-portal-row acc_class">
                          <span className="access-portal-label">{this.state.languageData.clientprofile_accepted}</span>
                          <span className="access-portal-content pull-i">{( hasPastAcc === true ) ? "Yes" : "No"}</span>
                          <span className="access-portal-content">{( hasPastAcc === false ) && <button onClick={() => this.resendEmail()} className="line-btn pull-right" type="button">{this.state.languageData.clientprofile_resend_email}</button>}</span>
                        </div>}
                        {( hasPastAcc === true ) && <div className="access-portal-row login_email_class">
                          <span className="access-portal-label">{this.state.languageData.clientprofile_login_email}</span>
                          <span className="access-portal-content login_email">{(this.state.clientData.patient_account !== undefined && this.state.clientData.patient_account !== null && this.state.clientData.patient_account.patient_user !== undefined) ? this.state.clientData.patient_account.patient_user.email : 'N/A' }</span>
                        </div>}
                      </div>
                    </div>}
                    {(this.state.clientData && this.state.clientData.account_prefrences && this.state.clientData.account_prefrences.allow_patients_to_manage_appt == 0 ) &&
                      <div className="col-xs-12">
                        <label className="popup-input-field-name accessporta-name">{this.state.languageData.clientprofile_access_portal}</label>
                        <div className="access-portal-allrow">
                          <div className="access-portal-row">
                            <span className="">Customer Portal is Disabled.</span>
                            {checkIfPermissionAllowed("manage-appointment-settings") && <a className="pull-right easy-link p-t-0" href="/appointment/booking-portal" target="_blank">Settings</a>}
                            {!checkIfPermissionAllowed("manage-appointment-settings") && <span className="">&nbsp;Contact Admin</span>}
                          </div>
                        </div>
                      </div>
                    }


                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_birthday}</label>
                      <span className="popup-field-box">{(this.state.showLoader === false && this.state.clientData !== undefined && this.state.clientData.date_of_birth !== '' && this.state.clientData.date_of_birth !== null) ? showFormattedDate(this.state.clientData.date_of_birth) : ''}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_address}</label>
                      <span className="popup-field-box">{address.join()}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_emergency_name}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.emergency_contact_name !== '') ? this.state.clientData.emergency_contact_name : ''}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_emergency_number}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.emergency_contact_number !== '') ? this.state.clientData.emergency_contact_number : ''}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_last_visit}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.last_appointment !== undefined && this.state.clientData.last_appointment.length > 0) ? showFormattedDate(this.state.clientData.last_appointment[0].appointment_datetime) : 'Never'}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_membership_program}</label>
                      <span className="popup-field-box">{isRegistered}
                        <br/>
                        {totalSavings}
                      </span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_sale_relation}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.total_sale_relationship !== null && this.state.clientData.total_sale_relationship > 0 ) ? numberFormat(this.state.clientData.total_sale_relationship, 'currency') : numberFormat(0, 'currency')}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_bd_acc_no}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.brilliant_acc_number !== '') ? this.state.clientData.brilliant_acc_number : ''}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_aspire_acc_no}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.aspire_acc_email !== '') ? this.state.clientData.aspire_acc_email : ''}</span>
                    </div>
                    {(this.state.patientSkinScore !== undefined && this.state.patientSkinScore.points !== undefined) &&
                      <div className="col-xs-12 fitzpatrick-block">
                        <label className="popup-input-field-name">{this.state.languageData.clientprofile_fitzpatrick_test}</label>
                        <span className="popup-field-box">
                          {this.state.languageData.clientprofile_your_pts} {this.state.patientSkinScore.points}
                          <br/>
                          {this.state.languageData.clientprofile_skin_type} {this.state.patientSkinScore.skin_type}
                          <br/>
                          {this.state.languageData.clientprofile_last_taken} {showFormattedDate(this.state.patientSkinScore.created, true)}
                        </span>
                        <button className="line-btn pull-right skin-descp" type="button" onClick={() => this.setState({showSkinModal:true})} >{this.state.languageData.clientprofile_view_details}</button>
                      </div>
                    }

                    {( this.state.clientData !== undefined && this.state.clientData.account !== null && this.state.clientData.account !== undefined && this.state.clientData.account.pos_enabled === 1 && this.state.stripe !== undefined ) && <div className="col-xs-12">
                      {
                        ( this.state.clientData.account.pos_gateway === 'stripe' && ccNos.length > 0 ) ? <div>
                        <label className="popup-input-field-name">{this.state.languageData.clientprofile_cc_number}</label>
                        <span>{ccNos.join()}</span>
                        <a className="setting popup-field-box" onClick={() => this.openCCPopUp()}> {this.state.languageData.clientprofile_update_card} </a>
                      </div> : (( this.state.clientData.account.pos_gateway === 'stripe' && this.state.clientData.can_add_card === 1 ) &&
                      <div>
                        <label className="popup-input-field-name">{this.state.languageData.clientprofile_cc_number}</label>
                        <a onClick={() => this.openCCPopUp()} className="setting popup-field-box"> {this.state.languageData.clientprofile_add_cc} </a>
                      </div>)
                    }
                    </div>}

                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.client_zip_code}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.pincode !== '') ? this.state.clientData.pincode : ''}</span>
                    </div>
                    <div className="col-xs-12">
                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_referral_source}</label>
                      <span className="popup-field-box">{(this.state.clientData !== undefined && this.state.clientData.referral_source !== '') ? this.state.clientData.referral_source : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

            <div className={(this.state.showCCPopup === true ) ? 'modalOverlay' : ''}>
            	<div className={(this.state.showCCPopup === true && this.state.cardData) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
            		<div className="small-popup-header">
            			<div className="popup-name">{this.state.languageData.clientprofile_add_cc_details}</div>
            			<a onClick={() => this.closeCCPopup()} className="small-cross">×</a>
            		</div>
            		<div className="small-popup-content">
            			<div className="juvly-container no-padding-bottom">

                  {(this.state.cardData !== undefined && this.state.cardData.cards_data !== undefined && this.state.cardData.cards_data.length > 0) && this.state.cardData.cards_data.map((cobj, cidx) => {
                      return (

                        (this.state.cardData.stripe_connection && this.state.cardData.stripe_connection !== 'global') ?  <div key={cidx} className="row m-b-20">
                            <div className="col-md-3 col-xs-12">
                                <div className="bank-account">
                                    {cobj.card_details}
                                </div>
                            </div>
                            <div className="col-md-6 col-xs-12">
                                <div className="bank-account">
                                    {cobj.clinic_name}
                                </div>
                            </div>
                            <div className="col-md-3 col-xs-12">
                                {(this.state.clicnicForCard > 0 && this.state.clicnicForCard === cobj.clinic_id) ? <a onClick={() => this.cancelEditSavedCard()} className="new-blue-btn edit-account set-default-bank-acct credit-edit-btn" data-clinic={cobj.clinic_id}>{this.state.languageData.clientprofile_cancel}</a> : <a onClick={() => this.editSavedCard(cobj.clinic_id)} className="new-white-btn edit-account set-default-bank-acct credit-edit-btn" data-clinic={cobj.clinic_id}>{this.state.languageData.client_edit}</a>}
                            </div>
                        </div> : <div key={cidx} className="row m-b-20">
                            <div className="col-md-6 col-xs-12">
                                <div className="bank-account">
                                    {this.state.languageData.clientprofile_saved_card_number}
                                </div>
                            </div>
                            <div className="col-md-6 col-xs-12">
                                <div className="bank-account">
                                    {cobj.card_details}
                                </div>
                            </div>
                        </div>

                      )
                    })
                  }

                  <div className="juvly-subtitle m-b-20">{(this.state.clicnicForCard > 0) ? "Update Credit Card Information" : "Add New Credit Card Information"}</div>
            					<div className="row">
            						{(this.state.cardData.stripe_connection && this.state.cardData.stripe_connection !== 'global') ? <div className="col-xs-12">
            							<div className="setting-field-outer">
            								<div className="new-field-label">Clinic <span className="setting-require">*</span></div>
            								<select ref="clinicCardRef" className="setting-select-box" name="card_clinic" onChange={this.handleInputChange} >
            									{clinicOptData}
            								</select>
            							</div>
            						</div> : ''}
            						<div className="col-xs-12">
            							<div className="setting-field-outer">
            								<div className="new-field-label">{this.state.languageData.clientprofile_cc_number} <span className="setting-require">*</span></div>
                            <div className="setting-input-box" id="card-number"></div>
            							</div>
            						</div>
            						<div className="col-sm-4 col-xs-6">
            							<div className="setting-field-outer">
            								<div className="new-field-label">{this.state.languageData.clientprofile_exp_date} <span className="setting-require">*</span></div>
                            <div className="setting-input-box" id="card-expiry"></div>
            							</div>
            						</div>
            						<div className="col-sm-4 col-xs-6">
            							<div className="setting-field-outer">
            								<div className="new-field-label">{this.state.languageData.clientprofile_cvc} <span className="setting-require">*</span></div>
                            <div className="setting-input-box" id="card-cvc"></div>
            							</div>
            						</div>
            					</div>
            			</div>
            		</div>
            		<div className="footer-static">
            			<a className="new-blue-btn pull-right" onClick={() => this.saveCC() }>{this.state.languageData.clientprofile_save}</a>
            		</div>
            	</div>
            </div>


            <div className={(this.state.showPrescriptionModal === true ) ? 'modalOverlay' : ''}>
            	<div className={(this.state.showPrescriptionModal === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
            		<div className="small-popup-header">
            			<div className="popup-name">{this.state.languageData.clientprofile_prescription_detail}</div>
            			<a onClick={() => this.hidePrescription()} className="small-cross">×</a>
            		</div>
            		<div className="small-popup-content">
            			<div className="juvly-container no-padding-bottom">

                <div className="prescription-content">
                <div className="doc-section">
            			<div className="col-xs-12 no-margin">
                    { this.state.prescriptionField.map((obj,idx) => {
                      return (
                        <div key={'prescription-row-'+idx} className="row prescription-row">
                					<div className="col-xs-12">
                						<div className="setting-field-outer">
                							<div className="new-field-label">{this.state.languageData.clientprofile_medicine_name} <span className="setting-require">*</span></div>
                							<div className="setting-input-outer">
                								<input name="medicine_name" value={obj.medicine_name} className={obj.medicineNameClass} data-index={idx} data-modal={'prescription'} type="text" autoComplete="off" onChange={this.handleInputChange}/>
                							</div>
                						</div>
                					</div>
                					<div className="col-sm-4 col-xs-12">
                						<div className="setting-field-outer">
                							<div className="new-field-label">{this.state.languageData.clientprofile_dosage} <span className="setting-require">*</span></div>
                							<div className="setting-input-outer">
                								<input name="dosage" value={obj.dosage} className={obj.dosageClass} data-index={idx} data-modal={'prescription'} type="text" autoComplete="off" onChange={this.handleInputChange}/>
                							</div>
                						</div>
                					</div>
                					<div className="col-sm-4 col-xs-12">
                						<div className="setting-field-outer">
                							<div className="new-field-label">{this.state.languageData.clientprofile_frequency} </div>
                							<div className="setting-input-outer">
                								<input name="frequency" value={obj.frequency} className={obj.frequencyClass} data-index={idx} data-modal={'prescription'} type="text" autoComplete="off" onChange={this.handleInputChange}/>
                							</div>
                						</div>
                					</div>
                					<div className="col-sm-4 col-xs-12">
                						<div className="setting-field-outer">
                							<div className="new-field-label">{this.state.languageData.clientprofile_duration} </div>
                							<div className="setting-input-outer">
                								<input name="duration" value={obj.duration} className={obj.durationClass} data-index={idx} data-modal={'prescription'} type="text" autoComplete="off" onChange={this.handleInputChange}/>
                							</div>
                						</div>
                					</div>
                          {(this.state.prescriptionField.length > 1) &&
                            <a className="add-round-btn" onClick={() => this.deleteMultiplePrescription(idx)}>
                              <span>-</span>
                            </a>
                          }
                          </div>
                      )
                    })
                    }

            				</div>
            			</div>
            		</div>

            			</div>
            		</div>
            		<div className="footer-static">
            			<a className="new-blue-btn pull-right" onClick={() => this.saveProcedurePrescription()}>{this.state.languageData.clientprofile_save}</a>
            			<a className="new-blue-btn pull-right" onClick={() => this.addMultiplePrescription()}>{this.state.globalLang.label_add_more}</a>
                  {(this.state.isSendEmail === true) && <a className="new-blue-btn pull-right" onClick={() => this.sendProcedurePrescription()}>{this.state.languageData.clientprofile_send_email}</a> }
                  {(this.state.isSendEmail === true) && <a onClick={this.openModal} data-message={'Are you sure you want to delete this prescription?'} data-mtype="delete" data-action="deleteProcedurePrescription" className="new-red-btn pull-left">{this.state.languageData.client_delete}</a>}

            		</div>
            	</div>
            </div>


            <div className={(this.state.showInsSendModal === true ) ? 'overlay' : ''}></div>
            <div id="filterModal" role="dialog" className={(this.state.showInsSendModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" onClick={this.dismissInsSendModal}>×</button>
                    <h4 className="modal-title">{this.state.languageData.client_conf_requierd}</h4>
                  </div>
                  <div className="modal-body add-patient-form filter-patient">
                    {this.state.languageData.clientprofile_send_post_message}
                  </div>
                  <div className="modal-footer" >
                    <div className="col-md-12 text-left">
                      <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissInsSendModal}>{this.state.languageData.client_no}</button>
                      <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.sendPostInstructions}>{this.state.languageData.client_yes}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className={(this.state.showModal === true ) ? 'overlay' : ''}></div>
            <div id="filterModal" role="dialog" className={(this.state.showModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
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

            <div className={(this.state.showSkinModal === true ) ? 'overlay' : ''}></div>
            <div id="filterModal" role="dialog" className={(this.state.showSkinModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" onClick={this.dismissSkinModal}>×</button>
                    <h4 className="modal-title">{this.state.languageData.clientprofile_skin_details}</h4>
                  </div>
                  <div  className="modal-body add-patient-form modalSkinMessage-patient p-b-30">
                    {this.state.modalSkinMessage !== undefined ? this.state.modalSkinMessage : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className={(this.state.showResetPassModal === true ) ? 'modalOverlay' : 'modalOverlay no-display'}>
              <form onSubmit={this.handleSubmit}>
                <div className="small-popup-outer">
                  <div className="small-popup-header">
                    <div className="popup-name">{this.state.languageData.clientprofile_reset_password}</div>
                    <a onClick={() => this.dismissPassModal()} className="small-cross">×</a>
                  </div>
                  <div className="small-popup-content">
                    <div className="juvly-container no-padding-bottom">
                      <div className="row">
                        <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.languageData.clientprofile_user_emailid}</div>
                            <div className="setting-input-outer">
                              <input className="setting-input-box" type="text" name="clientEmailID" defaultValue={(this.state.clientData && this.state.clientData.patient_account && this.state.clientData.patient_account.patient_user && this.state.clientData.patient_account.patient_user.email !== '') ? this.state.clientData.patient_account.patient_user.email : ''} readOnly />
                            </div>
                          </div>
                        </div>
                        <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.languageData.clientprofile_new_password}</div>
                            <div className="setting-input-outer">
                              <input ref="clientPass" className={this.state.resetPassClass} type={this.state.resetPassType} name="clientNewPassword" onChange={this.handleInputChange}/>
                              <span onClick={this.changePassType} className={this.state.eyeClass}></span>
                            </div>
                          </div>
                        </div>
                        <p className="p-text col-xs-12">{this.state.languageData.clientprofile_password_note}</p>
                      </div>
                    </div>
                  </div>
                  <div className="footer-static">
                    <input className="new-blue-btn pull-right" type="submit" value={this.state.languageData.clientprofile_save}/>
                  </div>
                </div>
              </form>
            </div>

            <div className="patient-right col-sm-8">
              <div className="merge-setion">
                <ul className="section-title section-tab-outer setting-tabs setting-sub-tabs">
                  <li><a href="javascript:void(0);" onClick={() => this.changeTimelinePref('cosmetic')} id="cosmetic_tab" className={(this.state.defTimeLine !== '' && this.state.defTimeLine === "cosmetic") ? "section-title-name r section-tab sel-merge-tab" : "section-title-name r section-tab"} data-title="Cosmetic">{this.state.languageData.clientprofile_cosmetic_timeline}</a></li>
                  <li><a href="javascript:void(0);" onClick={() => this.changeTimelinePref('health')} id="health_tab" className={(this.state.defTimeLine !== '' && this.state.defTimeLine === "health") ? "section-title-name r section-tab sel-merge-tab" : "section-title-name r section-tab"} data-title="Health">{this.state.languageData.clientprofile_health_timeline}</a></li>

                  {(this.state.clientData && (this.state.clientData.active_treamtment_plan === 1 || this.state.clientData.priscribed_treatment_plans && this.state.clientData.priscribed_treatment_plans.length > 0)) && <li><a href="javascript:void(0);" onClick={() => this.changeTimelinePref('treatmentPlan')} id="plan_tab" className={(this.state.defTimeLine !== '' && this.state.defTimeLine === "treatmentPlan") ? "section-title-name r section-tab sel-merge-tab" : "section-title-name r section-tab"} data-title="Treatment Plan">Treatment Plan</a></li>}
                </ul>

                {<div> <div className={(this.state.defTimeLine !== '' && this.state.defTimeLine  === "cosmetic" && this.state.clientData !== undefined && this.state.clientData.procedure !== null && this.state.clientData.procedure !== undefined &&  this.state.clientData.procedure.length > 0) ? "time-line" : "time-line no-display"} id="Cosmetic_Timeline">


                  {(this.state.clientData !== undefined && this.state.clientData.procedure !== null && this.state.clientData.procedure !== undefined &&  this.state.clientData.procedure.length > 0) && this.state.clientData.procedure.map((hobj, hidx) => {

                    let left_img_for_append_first     = (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_left_45 !== "") ? hobj.procedure.procedure_image_data.patient_image_left_45 : '';
                    let right_img_for_append_first    = (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_right_45 !== "") ? hobj.procedure.procedure_image_data.patient_image_right_45 : '';
                    let front_image_for_append_first  = (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_front !== "") ? hobj.procedure.procedure_image_data.patient_image_front : '';

                    let left_img_for_append_next     = (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_left !== "") ? hobj.procedure.procedure_image_data.patient_image_left : '';
                    let right_img_for_append_next    = (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_right !== "") ? hobj.procedure.procedure_image_data.patient_image_right : '';

                    return (
                          <div key={hidx} className="timeline-outer row">

                          {(this.state.lightboxImage) && <Lightbox
                            images={[
                              { src: this.state.lightboxImage },
                            ]}
                            isOpen={this.state.lightboxIsOpen}
                            onClose={this.closeLightbox}
                            preventScroll={false}
                            showImageCount={false}
                            backdropClosesModal={true}
                          />}

                          <div className="col-md-12 procedure-name-time-top">
                            <div className="procedure-name-time">
                              <div className="procedure-number">{(hidx < 9 ) ?  '0' + ++hidx : ++hidx}</div>
                              <div className="pro-name-section">
                                {checkIfPermissionAllowed('manage-procedures') ? <a onClick={() => this.openProcedureDetail(hobj.procedure.id, this.state.defTimeLine) } className="modal-link pro-name"><h4>{hobj.procedure.procedure_name}</h4>
                              </a> : <a className="modal-link pro-name"><h4>{hobj.procedure.procedure_name}</h4>
                            </a>}

                                <p className="pro-time">{showFormattedDate(hobj.procedure.procedure_date, true)}</p>
                              </div>
                            </div>
                            <div className="procedure-edit-btn">
                            {checkIfPermissionAllowed('manage-procedures') && <a onClick={() => this.openProcedureDetail(hobj.procedure.id, this.state.defTimeLine) } className="modal-link pull-right invoice-btn edit-pro-btn">{this.state.languageData.client_edit}</a>}
                            </div>

                            {(hobj.procedure.invoice_id > 0 && hobj.procedure.pos_invoices && hobj.procedure.pos_invoices.is_deleted === 0 && hobj.procedure.pos_invoices.invoice_status !== 'draft' && hobj.procedure.pos_invoices.invoice_status !== 'canceled' ) ? <h5 className="proc-cost">{numberFormat(hobj.procedure.total_amount, 'currency')}
                              <a onClick={this.getInvoiceDetails.bind(this, hobj.procedure.pos_invoices.id)} className="modal-link pull-right invoice-btn view-invoice" >{this.state.languageData.clientprofile_view_invoice}</a>
                            </h5> : <h5 className="proc-cost">{this.state.languageData.clientprofile_no_invoice}</h5>}

                          </div>
                          <div className="col-md-6 timeline-left">
                            <center>
                              <img className="left-big-image" onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_front_url !== "") ? hobj.procedure.procedure_image_data.patient_image_front_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_front_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_front_thumb_url : this.state.def_no_image_vertical} />

                            </center>
                            <div className="timeline-detail">
                              <h4>{this.state.languageData.clientprofile_treatment_summary}
                                {(hobj.procedure.type !== 'laser' && hobj.procedure.type !== 'coolsculpting' && checkIfPermissionAllowed('manage-tracebility-info') ) && <a onClick={() => this.viewTraceAbility(hobj.procedure.id) } className="modal-link line-btn pull-right trac-info" >{this.state.languageData.clientprofile_trace_info}</a>}
                              </h4>
                              <ul className="treat-sumry profile-treat-sumry no-padding">

                                {
                                  hobj.procedure.injection_array !== undefined && hobj.procedure.injection_array.map((injobj, injidx) => {
                                    return (
                                      <li key={injidx}>
                                        <label>{injobj.product_name}</label> <span>{(injobj.quantity) ? numberFormat(injobj.quantity, 'decimal') : ''} {injobj.unit}</span>
                                      </li>
                                      )
                                    }
                                  )
                                }

                                {
                                  (hobj.procedure.type === 'laser' || hobj.procedure.type === 'coolsculpting') && hobj.procedure.procedure_information !== undefined && hobj.procedure.procedure_information.map((pojobj, poidx) => {
                                    return (
                                      <li key={poidx}>
                                        <label>{pojobj.field}</label> <span>{(pojobj.value && isNumber(pojobj.value)) ? numberFormat(pojobj.value, 'decimal') : pojobj.value} {pojobj.unit}</span>
                                      </li>
                                      )
                                    }
                                  )
                                }

                                {(hobj.procedure.type !== 'laser' && hobj.procedure.type !== 'coolsculpting' && (hobj.procedure.injection_array !== undefined && hobj.procedure.injection_array.length === 0)) && <li>
                                  <label className="sorry-no-record">{this.state.languageData.clientprofile_no_rec_found} </label>
                                </li>}

                                {((hobj.procedure.type === 'laser' || hobj.procedure.type === 'coolsculpting') && (hobj.procedure.injection_array !== undefined && hobj.procedure.injection_array.length === 0 && hobj.procedure.procedure_information !== undefined && hobj.procedure.procedure_information.length === 0)) && <li>
                                  <label className="sorry-no-record">{this.state.languageData.clientprofile_no_rec_found} </label>
                                </li>}

                              </ul>
                              <div className="tracbi-outer">
                                <div className="provder-md">
                                  <h5><label className="popup-input-field-name">{this.state.languageData.clientprofile_provider}</label> <span className="popup-field-box"> {(hobj.procedure.doctor_name) ? hobj.procedure.doctor_name : "N/A"}</span></h5>
                                  {(this.state.userData.user.user_role_id === 4) &&
                                    <h5>
                                      <label className="popup-input-field-name">{this.state.languageData.clientprofile_md_consent}</label>
                                      {(hobj.procedure.md_signed === 0) ?
                                        (hobj.procedure.provider_signed === 1 && hobj.procedure.sent_to_md === 1  && hobj.procedure.md_user_id == this.state.userData.user.id) ?
                                          <span onClick={this.openSignModal.bind(this,hobj.procedure.id)} className={"popup-field-box cursor-pointer"}> {this.state.languageData.clientprofile_not_signed}</span>
                                        :
                                          <span className={"popup-field-box"}> {this.state.languageData.clientprofile_not_signed}</span>
                                      :
                                        <span className="popup-field-box"> {this.state.languageData.clientprofile_signed}</span>}
                                    </h5>
                                  }
                                </div>
                              </div>
                              {/*(this.state.userData.user.user_role_id === 4) && <div className="tracbi-outer">
                                <div className="provder-md">
                                  {( hobj.procedure.md_signed === 0 ) ?
                                      <h5><label className={(hobj.procedure.sent_to_md === 1  && hobj.procedure.md_user_id === this.state.userData.user.id) ? "popup-input-field-name loggedUserSign" : "popup-input-field-name"}>{this.state.languageData.clientprofile_md_consent}</label> <span className="popup-field-box"> {this.state.languageData.clientprofile_not_signed}</span></h5>

                                     : <h5><label className="popup-input-field-name">{this.state.languageData.clientprofile_md_consent}</label> <span className="popup-field-box"> {this.state.languageData.clientprofile_signed}</span></h5>}
                                </div>
                              </div>*/}
                              <div>
                                {(hobj.procedure.consent_ids !== null && hobj.procedure.consent_ids !== "") ? (
                                    <a onClick={() => this.viewConsents(hobj.procedure.id) } className="line-btn pull-left sign-fill">{this.state.languageData.clientprofile_consent_signed}<img src='../../../images/check-icon-new.png' /></a>
                                  ) : ( <a className="line-btn pull-left sign-fill">{this.state.languageData.clientprofile_consent_signed}<img src='../../../images/cross-icon-new.png' /></a> ) }
                                {(hobj.procedure.answers_count > 0 || hobj.procedure.answer_multiples_count > 0) ? (
                                    <a onClick={() => this.viewQuestionnaires(hobj.procedure.id) } className="line-btn pull-left sign-fill">{this.state.languageData.clientprofile_questionaaires_filled}<img src='../../../images/check-icon-new.png' /></a>
                                  ) : ( <a className="line-btn pull-left sign-fill">{this.state.languageData.clientprofile_questionaaires_filled}<img src='../../../images/cross-icon-new.png' /></a> ) }
                                {(hobj.procedure.survey_appointment_id) && (
                                    <a onClick={() => this.viewFilledSurvey(hobj.procedure.id, hobj.procedure.survey_appointment_id) } className="line-btn pull-left sign-fill">{this.state.languageData.clientprofile_survey_filled}<img src='../../../images/check-icon-new.png' /></a>
                                  )}
                                {(hobj.procedure.can_send_post_instruction && hobj.procedure.can_send_post_instruction > 0) ? (
                                    <a onClick={() => this.showSendInstructionPopup(hobj.procedure.appointment_id,hobj.procedure.id) } className="line-btn pull-left send-instruction">{this.state.languageData.clientprofile_send_post}</a>
                                  ) : ''}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6 timeline-right">
                            <div className="carousel slide" data-ride="carousel" data-interval="false">
                              <div className="carousel-inner">
                                <div className="item active">
                                  <div className="right-images">
                                    <div className="images-half">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_left_45_url !== "") ? hobj.procedure.procedure_image_data.patient_image_left_45_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_left_45_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_left_45_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                    <div className="images-half pull-right">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_right_45_url !== "") ? hobj.procedure.procedure_image_data.patient_image_right_45_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_right_45_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_right_45_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                    <div className={(hobj.procedure.type !== 'coolsculpting' && hobj.procedure.type !== 'laser' && left_img_for_append_first !== '' && right_img_for_append_first !== '' && front_image_for_append_first !== '' && hobj.procedure.combined_image_45 !== '' && hobj.procedure.combined_image_45 !== null) ? "images-full" : "images-full no-display"}>
                                    <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.combined_image_45) ? hobj.procedure.combined_image_45 : this.state.def_no_image_vertical)} src={hobj.procedure.combined_image_45} />
                                    </div>
                                  </div>
                                </div>
                                <div className="item">
                                  <div className="right-images">
                                    <div className="images-half">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_left_url !== "") ? hobj.procedure.procedure_image_data.patient_image_left_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_left_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_left_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                    <div className="images-half pull-right">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_right_url !== "") ? hobj.procedure.procedure_image_data.patient_image_right_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_right_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_right_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                    <div className={(hobj.procedure.type !== 'coolsculpting' && left_img_for_append_next !== '' && right_img_for_append_next !== '' && front_image_for_append_first !== '' && hobj.procedure.combined_image !== '' && hobj.procedure.combined_image !== null) ? "images-full" : "images-full no-display"}>
                                    <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.combined_image) ? hobj.procedure.combined_image : this.state.def_no_image_vertical)} src={hobj.procedure.combined_image} />
                                    </div>
                                  </div>
                                </div>

                                {(hobj.procedure.type === 'coolsculpting') && <div className="item">
                                  <div className="right-images">
                                    <div className="images-half">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_left_45_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_left_45_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_left_45_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_left_45_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                    <div className="images-half pull-right">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_right_45_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_right_45_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_right_45_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_right_45_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                    <div className="images-full">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                  </div>
                                </div>}

                                {(hobj.procedure.type === 'laser') && <div className="item">
                                  <div className="right-images">
                                    <div className="images-half">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_left_45_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_left_45_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_left_45_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_left_45_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                    <div className="images-half pull-right">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_right_45_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_right_45_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_right_45_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_right_45_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                    <div className="images-full">
                                      <img onClick={(e) => this.openLightbox(0, e, (hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_url : this.state.def_no_image_vertical)} src={(hobj.procedure.procedure_image_data !== null && hobj.procedure.procedure_image_data.patient_image_back_thumb_url !== "") ? hobj.procedure.procedure_image_data.patient_image_back_thumb_url : this.state.def_no_image_vertical} />
                                    </div>
                                  </div>
                                </div>}
                              </div>
                            </div>
                            <div className="trac-right-btn-outer">
                              <div>
                              {checkIfPermissionAllowed('view-procedure-notes') && <a onClick={() => this.viewNotes(hobj.procedure.id) } className="modal-link line-btn pull-left">{this.state.languageData.clientprofile_view_notes} ({(hobj.procedure.procedure_notes !== undefined && hobj.procedure.procedure_notes.length > 0) ? hobj.procedure.procedure_notes.length : 0})</a>}

                              <a onClick={(e) => this.runCarousel(e, hobj.procedure.total_image_count)} className="line-btn pull-right">{this.state.languageData.clientprofile_more_photos} ({hobj.procedure.total_image_count})</a>
                              </div>
                              <div>
                              <a onClick={() => this.viewTreatMentMarkings(hobj.procedure.id) }  className="line-btn marketing-photo modal-link">{this.state.languageData.clientprofile_view_treat_markings}</a>

                              {hobj && hobj.procedure && (hobj.procedure.after_photos_available ===1) && <a onClick={() => this.viewAfterPhotos(hobj.procedure.id) } className="modal-link line-btn pull-left after-photos-btn">{this.state.languageData.clientprofile_view_after}</a>}
                              </div>
                            </div>
                          </div>
                        </div>
                    )
                  })
                  }

                </div>

                {<div className={( this.state.clientData !== undefined && this.state.clientData.procedure !== undefined &&  this.state.clientData.procedure.length > 0 ) ? "no-record no-display" : ( this.state.clientData !== undefined && this.state.clientData.procedure !== undefined &&  this.state.clientData.procedure.length === 0 && this.state.defTimeLine === 'cosmetic' ) ? "no-record" : "no-record no-display"}>
                  {this.state.languageData.clientprofile_no_rec_found}
                </div>}

                </div>}

                {<div> <div className={(this.state.defTimeLine !== '' && this.state.defTimeLine  === "health" && this.state.clientData !== undefined && this.state.clientData.procedure_health !== undefined &&  this.state.clientData.procedure_health.length > 0) ? "time-line under-dev" : "time-line no-display"} id="Health_Timeline">

            			{(this.state.clientData !== undefined && this.state.clientData.procedure_health !== null && this.state.clientData.procedure_health !== undefined &&  this.state.clientData.procedure_health.length > 0) && this.state.clientData.procedure_health.map((hobj, hidx) => {
                    return (
                            <div key={hidx} className="timeline-outer hlth-outer">
                            <div className="col-md-12 procedure-name-time-top health-name-top">
                              <div className="procedure-name-time health-name-time"></div>
                            </div>

                            <div className="row timeline-right">
                              <div className="col-md-5">
                                {checkIfPermissionAllowed('manage-procedures') ? <a onClick={() => this.openProcedureDetail(hobj.id, this.state.defTimeLine) } className="modal-link pro-name"><h4>{hobj.procedure_name}</h4>
                                  </a> : <a className="modal-link pro-name"><h4>{hobj.procedure_name}</h4></a>}

                                <p className="pro-time">{showFormattedDate(hobj.procedure_date,true)}</p>

                                {(checkIfPermissionAllowed('manage-procedures') === true) && <a onClick={() => this.openProcedureDetail(hobj.id, this.state.defTimeLine) } className="modal-link invoice-btn edit-pro-btn health-btn">Edit</a>}
                                {checkIfPermissionAllowed('manage-procedures') ? <a onClick={() => this.viewProcedureDetail(hobj.id, this.state.defTimeLine) } className="modal-link invoice-btn edit-pro-btn health-btn">View</a> : <a className="modal-link invoice-btn edit-pro-btn health-btn">View</a>}

                                {((hobj.pos_invoices !== null && hobj.pos_invoices !== undefined) && hobj.pos_invoices.is_deleted === 0 && hobj.pos_invoices.invoice_status !== 'draft' && hobj.pos_invoices.invoice_status !== 'canceled' ) && <a onClick={this.getInvoiceDetails.bind(this, hobj.pos_invoices.id)} className="modal-link invoice-btn view-invoice edit-pro-btn health-btn" >View Invoice</a>}

                                <div className="provder-md health-md">
                                  <h5>
                                    <label className="popup-input-field-name">{this.state.languageData.clientprofile_provider}</label>
                                    <span className="popup-field-box m-b-15">{hobj.doctor_name}</span>
                                  </h5>
                                  <h5>
                                    <label className="popup-input-field-name">Consultation Fee</label>
                                    <span className="popup-field-box no-border">{numberFormat(hobj.consultation_fee, 'currency')}</span>
                                  </h5>
                                </div>


                              </div>

                              <div className="col-md-7 health-trac-right">

                                <div className="health-smry-outer">
                                {(hobj.procedure_prescription.length > 0) && <h4 className="health-trac-summry">{this.state.languageData.clientprofile_treatment_summary}</h4>}
                                {(hobj.procedure_prescription.length > 0) &&
                                  <ul className="treat-sumry profile-treat-sumry no-padding">
                                    {
                                      hobj.procedure_prescription.map((ppObj,ppIdx) => {
                                        return (
                                          <li key={'procedure-health-'+ppIdx} className="health-treat-sumry-li">
                                            <label>{ppObj.medicine_name}</label> <span>{(ppObj.dosage) ? ppObj.dosage : ''}</span>
                                          </li>
                                        )
                                      })
                                    }
                                  </ul>
                                }
                                </div>
                                <div className="timeline-detail health-links">
                                  {(hobj.procedure_prescription.length > 0) ? (
                                      <a onClick={() => this.showPrescription(hobj.id,hidx)} className="line-btn pull-left sign-fill m-l-0">{this.state.languageData.clientprofile_prescription}<img src='../../../images/check-icon-new.png' /></a>
                                    ) : ( <a onClick={() => this.showPrescription(hobj.id,-1)} className="line-btn pull-left sign-fill">{this.state.languageData.clientprofile_prescription}<img src='../../../images/cross-icon-new.png' /></a> ) }
                                    {(hobj.consent_ids !== null && hobj.consent_ids !== "") ? (
                                        <a onClick={() => this.viewConsents(hobj.id) } className="line-btn pull-left sign-fill">{this.state.languageData.clientprofile_consent_signed}<img src='../../../images/check-icon-new.png' /></a>
                                      ) : ( <a onClick={() => this.addConsents(hobj.id) } className="line-btn pull-left sign-fill">{this.state.languageData.clientprofile_consent_signed}<img src='../../../images/cross-icon-new.png' /></a> ) }
                                  <a onClick={() => this.viewNotes(hobj.id) } className="modal-link line-btn pull-left">
                                    View Notes ({hobj.procedure_notes.length})
                                  </a>
                                </div>
                              </div>



                            </div>
                          </div>
                    )
                  })
                  }
            		</div>
                {<div className={( this.state.clientData !== undefined && this.state.clientData.procedure_health !== undefined &&  this.state.clientData.procedure_health.length > 0 ) ? "no-record no-display" : ( this.state.clientData !== undefined && this.state.clientData.procedure_health !== undefined &&  this.state.clientData.procedure_health.length === 0 && this.state.defTimeLine === 'health' ) ? "no-record" : "no-record no-display"}>
                  {this.state.languageData.clientprofile_no_rec_found}
                </div>}

                </div>
              }

              {(this.state.defTimeLine !== '' && this.state.defTimeLine  === "treatmentPlan" && this.state.clientData.priscribed_treatment_plans && this.state.clientData.priscribed_treatment_plans.length > 0) && <Scrollbars style={{ height: 270 }} className= {"custome-scroll" }>
                  <div className="mCustomScrollbar _mCS_1">
                    <div className="mCustomScrollBox mCS-dark mCSB_vertical mCSB_inside" style={{maxHeight: 'none'}} tabIndex={0}>
                      {
                        this.state.clientData.priscribed_treatment_plans.map((obj, idx) => {
                          return (
                            <div className="treatmentPlanTitle" key={idx}>
                              <a className="prescribeTreatmentHeading" onClick={() => this.getPrescribedPlanData(obj)}>Prescribed Treatment Plan : {(obj.plan_type && obj.plan_type === 'payg') ? 'pay as you go' : 'monthly'}</a>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
              </Scrollbars>}

              {
                <div id="print_area" className={(this.state.defTimeLine !== '' && this.state.defTimeLine  === "treatmentPlan" && this.state.clientData.active_treamtment_plan === 1) ? '' : ' no-display'}>
                  <div className="treatmentPlanTitle">
                    <span>{(this.state.userData && this.state.userData.account) ? capitalizeFirstLetter(this.state.userData.account.name) : ''} Treatment Plan</span>

                    {(this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.prescribe_only === 0) && <span className="pull-right">

                      {(this.state.clientData && this.state.clientData.current_treatment_plan && !this.state.clientData.current_treatment_plan.treatment_plan_subscription) && <a className="blue-btn pull-right" onClick={this.showProgramDetails}>Start Program</a>}

                      {(this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.treatment_plan_subscription && this.state.clientData.current_treatment_plan.treatment_plan_subscription.subscription_status === 'active') && <a onClick={() => this.cancelPlanByID(this.state.clientData.current_treatment_plan.id, this.state.clientData.current_treatment_plan.treatment_plan_subscription.id)} className="line-btn pull-right">Cancel Plan</a>}

                      {(this.state.clientData && this.state.clientData.current_treatment_plan && (this.state.clientData.current_treatment_plan.status === 'saved' || this.state.clientData.current_treatment_plan.status === 'notsaved' || this.state.clientData.current_treatment_plan.status === 'draft') && !this.state.clientData.current_treatment_plan.treatment_plan_subscription) && <a onClick={() => this.getPlanDetailsByID(this.state.clientData.current_treatment_plan.id, 'new', 0)} className="line-btn pull-right">Edit</a>}

                      {(this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.treatment_plan_subscription && this.state.clientData.current_treatment_plan.treatment_plan_subscription.subscription_status === 'active' && (this.state.userData.user.is_provider || this.state.userData.user.user_role_id === 2)) && <a onClick={() => this.getPlanDetailsByID(this.state.clientData.current_treatment_plan.id, 'new' , this.state.clientData.current_treatment_plan.treatment_plan_subscription.id)} className="line-btn pull-right">Edit</a>}

                      {/*(this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.treatment_plan_subscription && this.state.clientData.current_treatment_plan.treatment_plan_subscription.subscription_status === 'expired') && <a onClick={() => this.getPlanDetailsByID(this.state.clientData.current_treatment_plan.id, 'renew', this.state.clientData.current_treatment_plan.treatment_plan_subscription.id)} className="line-btn pull-right">Edit & Renew</a>*/}
                      {(this.state.clientData && this.state.clientData.current_treatment_plan) && <a onClick={() => this.performThisAction(this.state.clientData.current_treatment_plan.id, 'print')} className="line-btn pull-right">Print</a>}
                    </span>}

                    {/*(this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.prescribe_only === 1) && <span className="pull-right">
                      <a className="blue-btn pull-right">Send to Patient</a>
                      <a className="line-btn pull-right">Download as PDF</a>
                    </span>*/}

                  </div>
                  <div className="treatment-timeline">
                      <div className="row">
                        <div className="col-sm-7 col-xs-12">

                          {(this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.plan_type === 'payg' && this.state.clientData.current_treatment_plan.pay_as_you_go && this.state.clientData.current_treatment_plan.pay_as_you_go.length > 0) && this.state.clientData.current_treatment_plan.pay_as_you_go.map((obj, idx) => {
                            return (
                              <div key={idx} className="treatmentSection">
                                  {<div className="procedureDate payg-schedule">{obj.product_name}: <label className="smallDetails">{obj.units} Units (Every {obj.repeat_val} {obj.repeat_by})</label> </div>}
                              </div>
                            )
                          })
                          }

                          {
                            (monthArray && monthArray.length > 0 ) && monthArray.map((mobj, idx) => {

                              let show            = false;
                              let returnedArray   = (this.state.clientData && this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.patient_treatment_plan_schedule && this.state.clientData.current_treatment_plan.patient_treatment_plan_schedule.length > 0) && this.state.clientData.current_treatment_plan.patient_treatment_plan_schedule.map((mmobj, midx) => {
                                let monthToCompare  = parseInt(mmobj.month);
                                let returnJSX       = '';
                                let productName     = (mmobj.product) ? capitalizeFirstLetter(mmobj.product.product_name) : 'N/A';
                                let units           = (mmobj.units) ? ', ' + mmobj.units + ' units' : '';

                                if (parseInt(moment(mobj[0]).format('MM')) === monthToCompare) {
                                  show = true;
                                  return (
                                    <div key={midx}>{productName}{units}</div>
                                  )
                                }
                              })
                              return (
                                <div key={idx} className={(show) ? "treatmentSection" : "treatmentSection no-display"}>
                                  <div className="procedureDate">{mobj[0]}</div>
                                    <div className="treatmentContent">
                                      <div className="treatmentDetails">
                                        {
                                          returnedArray
                                        }
                                      </div>
                                    </div>
                                </div>
                              )
                            })
                          }

                        </div>

                        {(this.state.clientData && this.state.clientData.current_treatment_plan) && <div className="col-sm-5 col-xs-12 treatment-timeline">
                          <div className="row">
                            {(this.state.clientData.current_treatment_plan.plan_type === 'monthly') && <div className="col-xs-12">
                              <div className="treat-text">Skin goal</div>
                              <div className="TP-total">{(this.state.clientData.current_treatment_plan) && this.state.clientData.current_treatment_plan.skincare_goal}</div>
                            </div>}
                            <div className="col-xs-12">
                              <div className="treat-text">Prescribed by</div>
                              <div className="TP-total">{(this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.user) && displayName(this.state.clientData.current_treatment_plan.user)}</div>
                            </div>
                            <div className="col-xs-6">
                              <div className="treat-text">Total <a onClick={() => this.viewBreakDown()} title="View detailed breakdown of this amount" className="help-icon sm-help">?</a></div>
                              <div className="TP-total">{numberFormat(this.state.startProTotal, 'currency')}</div>
                            </div>
                            {(this.state.clientData.current_treatment_plan.plan_type === 'monthly') && <div className="col-xs-6">
                              <div className="treat-text">Per month</div>
                              <div className="TP-total">{numberFormat(this.state.startProMonthly, 'currency')}</div>
                            </div>}

                            <div className="col-xs-12">
                              <div className="treat-text">Plan type</div>
                              <div className="TP-total">{(this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.plan_type === 'payg') ? 'Pay As You Go' : 'Monthly' }</div>
                            </div>

                            {(this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.treatment_plan_subscription) && <div className="col-xs-12">
                              <div className="treat-text">Plan started on</div>
                              <div className="TP-total">{showFormattedDate(this.state.clientData.current_treatment_plan.treatment_plan_subscription.started_on, false, 'DD MMMM YYYY')}</div>
                            </div>}

                            {(this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.treatment_plan_subscription) && <div className="col-xs-12 no-padding-right">
                              <div className="treat-text">Plan duration</div>
                              <div className="TP-total">{this.state.clientData.current_treatment_plan.duration_date}</div>
                            </div>}

                            {(this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.treatment_plan_subscription) && <div className="col-xs-12 no-padding-right">
                              <div className="treat-text">Card in use</div>
                              <div className="TP-total pull-left">{this.state.clientData.current_treatment_plan.treatment_plan_subscription.card_number}</div>
                              <a onClick={() => this.changePlanCard()} className="line-btn pull-right no-width">Change</a>
                            </div>}

                            {(this.state.clientData.current_treatment_plan.clinic) && <div className="col-xs-12">
                              <div className="treat-text">Clinic</div>
                              <div className="TP-total">{(this.state.clientData.current_treatment_plan && this.state.clientData.current_treatment_plan.clinic) &&  this.state.clientData.current_treatment_plan.clinic.clinic_name}</div>
                            </div>}
                          </div>
                        </div>}

                      </div>
                    </div>
                </div>
              }

              </div>
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
   );
 }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  let returnState  = {};

  if ( state.ClientsReducer.action === "GET_CLIENT_DETAIL" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      if ( state.ClientsReducer.data.message === 'patient_not_found_or_deleted' ) {
        toast.dismiss();
        toast.error(languageData.global[state.ClientsReducer.data.message]);
        setTimeout(function() {
            window.location.href = '/clients';
        }, 1700)
      } else {
        toast.error(languageData.global[state.ClientsReducer.data.message]);
        returnState.clientData = state.ClientsReducer.data;
      }
    } else {
      returnState.clientData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "FIRE_CLIENT" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
    } else {
      returnState.fireData = state.ClientsReducer.data;
      toast.success(languageData.global[state.ClientsReducer.data.message]);
    }
  }

  if ( state.ClientsReducer.action === "DNC_CLIENT" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
    } else {
      returnState.dncData = state.ClientsReducer.data;
      toast.success(languageData.global[state.ClientsReducer.data.message]);
    }
  }

  if ( state.ClientsReducer.action === "CHANGE_PORTAL_CLIENT" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      if ( state.ClientsReducer.data.message === 'third_party_error' ) {
        toast.error(state.ClientsReducer.data.data);
      } else {
        toast.error(languageData.global[state.ClientsReducer.data.message]);
      }
    } else {
      returnState.portalAccessData = state.ClientsReducer.data;
      toast.success(languageData.global[state.ClientsReducer.data.message]);
    }
  }

  if ( state.ClientsReducer.action === "GET_CLIENT_CARDS" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.cardData = state.ClientsReducer.data;
    } else {
      returnState.cardData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "SAVE_CLIENT_CARD" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      if ( state.ClientsReducer.data.message === 'third_party_error' ) {
        toast.error(state.ClientsReducer.data.data);
      } else {
        toast.error(languageData.global[state.ClientsReducer.data.message]);
      }
      returnState.saveCCData = [];
    } else {
      returnState.saveCCData = state.ClientsReducer.data;
      toast.success(languageData.global[state.ClientsReducer.data.message]);
    }
  }

  if ( state.ClientsReducer.action === "RESEND_WELCOME_EMAIL" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.resendEmailData = state.ClientsReducer.data;
      toast.success(languageData.global[state.ClientsReducer.data.message]);
    }
  }

  if ( state.ClientsReducer.action === "RESET_CLIENT_PORTAL_PASSWORD" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.resetPortalPasswordData = state.ClientsReducer.data;
      toast.success(languageData.global[state.ClientsReducer.data.message]);
    }
  }

  if ( state.ClientsReducer.action === "DELETE_CLIENT" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.deleteData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "EXPORT_CLIENT_PDF" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.exportClientPDFData = state.ClientsReducer.data;
    } else {
      returnState.exportClientPDFData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "SEND_POST_INSTRUCTION" ) {
    toast.dismiss();

    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.sendPostInsData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.sendPostInsData = state.ClientsReducer.data;
    }
  }

  if ( state.ProcedureReducer.action === "SAVE_HEALTH_PROCEDURE_PRESCRIPTION" ) {
    returnState = {}
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message]);
      returnState.healthProcedurePrescription = [];
    } else {
      toast.success(languageData.global[state.ProcedureReducer.data.message]);
      returnState.healthProcedurePrescription = state.ProcedureReducer.data;
    }
  }

  if ( state.ProcedureReducer.action === "DELETE_HEALTH_PROCEDURE_PRESCRIPTION" ) {
    returnState = {}
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message]);
      returnState.healthProcedurePrescription = [];
    } else {
      toast.success(languageData.global[state.ProcedureReducer.data.message]);
      returnState.healthProcedurePrescription = state.ProcedureReducer.data;
    }
  }

  if ( state.ProcedureReducer.action === "SEND_HEALTH_PROCEDURE_PRESCRIPTION" ) {
    returnState = {}
    if ( state.ProcedureReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ProcedureReducer.data.message]);
      returnState.healthProcedurePrescription = [];
    } else {
      toast.success(languageData.global[state.ProcedureReducer.data.message]);
      returnState.healthProcedurePrescription = state.ProcedureReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "GET_MEMBERSHIP_DETAILS" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.membershipData = state.ClientsReducer.data;
    } else {
      returnState.membershipData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "ADD_MONTHLY_MEMBERSHIP" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      if ( state.ClientsReducer.data.message === 'third_party_error' ) {
        toast.error(state.ClientsReducer.data.data);
        returnState.addMembershipData = {status: 400, data : moment().unix()};
        returnState.showLoader        = false;
      } else {
        toast.error(languageData.global[state.ClientsReducer.data.message]);
        returnState.addMembershipData = state.ClientsReducer.data;
      }
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.addMembershipData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "CANCEL_MEMBERSHIP" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.cancelMembershipData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.cancelMembershipData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "APPLY_DISCOUNT_COUPON" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.couponData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.couponData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "UPDATE_MEMBERSHIP_CC" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.updateWalletCCData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.updateWalletCCData = state.ClientsReducer.data;
    }
  } else if ( state.SettingReducer.action === 'SIGN_PROCEDURE' ) {
    if ( state.SettingReducer.data.status !== 201 ) {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.MDSignData = state.SettingReducer.data
    } else {
      toast.dismiss();
      toast.success(languageData.global[state.SettingReducer.data.message]);
      returnState.MDSignData = state.SettingReducer.data
    }
  }

  if (state.MembershipWalletReducer.action === "GET_MEMBERSHIP_MULTI_TIER") {
   if (state.MembershipWalletReducer.data.status != 200) {
     returnState.showLoader = false
     toast.error(languageData.global[state.MembershipWalletReducer.data.message]);
   } else {
     returnState.membershipTypeData = state.MembershipWalletReducer.data.data;
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

  if ( state.ClientsReducer.action === "GET_TREAT_TEMPLATES" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.templatesData = state.ClientsReducer.data;
    } else {
      returnState.templatesData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "GET_PLAN_TEMPLATE_DATA" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.templatesDetails = state.ClientsReducer.data;
    } else {
      returnState.templatesDetails = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "SAVE_PAYG_TREATMENT_PLAN" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.savePaygData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.savePaygData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "GET_PLAN_DATA_BY_ID" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.planDetails = state.ClientsReducer.data;
    } else {
      returnState.planDetails = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "SAVE_MONTHLY_TREATMENT_PLAN" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.savePaygData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.savePaygData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "GET_START_PROGRAM_DATA" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.programDetails = state.ClientsReducer.data;
    } else {
      returnState.programDetails = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "START_PROGRAM_APPLY_DISCOUNT" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.startDiscountData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.startDiscountData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "CHANGE_PLAN_CLINIC" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.programDetails = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.programDetails = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "VIEW_PRICE_BREAK_UP" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.priceBreakUpData = state.ClientsReducer.data;
    } else {
      returnState.priceBreakUpData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "START_TREATMENT_PROGRAM" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.startProgram = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.startProgram = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "CANCEL_TREATMENT_PLAN" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.cancelPlanData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.cancelPlanData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "SAVE_PLAN_AS_TEMPLATE" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.saveAsTemplateData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.saveAsTemplateData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "UPDATE_PLAN_CARD" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.updatePlanCardData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.updatePlanCardData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "GET_PRESCRIBE_ONLY_DETAILS" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.presOnlyDetails = state.ClientsReducer.data;
    } else {
      returnState.presOnlyDetails = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "UPDATE_PRESCRIBE_ONLY" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.updatePresOnlyData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.updatePresOnlyData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "PERFORM_TREATMENT_ACTIONS" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.performActionData = state.ClientsReducer.data;
    } else {
      returnState.performActionData = state.ClientsReducer.data;
    }
  }

  return returnState;
}


function mapDispatchToProps(dispatch) {
  return bindActionCreators({getClientDetail: getClientDetail, fireClient: fireClient, doNotCall: doNotCall, changePortaAccess: changePortaAccess, getClientCardData: getClientCardData, saveClientCard: saveClientCard, resendWelcomeEmail: resendWelcomeEmail, resetPortalPassword: resetPortalPassword, deleteClient: deleteClient, exportClientPDF: exportClientPDF, sendPostInstructions: sendPostInstructions, saveProcedurePrescription: saveProcedurePrescription, deleteProcedurePrescription: deleteProcedurePrescription, sendProcedurePrescription:sendProcedurePrescription,  emptyProcedureReducer: emptyProcedureReducer,  getMembershipData: getMembershipData, addMonthyMembership: addMonthyMembership, cancelMembership: cancelMembership, applyCouponCode: applyCouponCode, updateMembershipCC: updateMembershipCC, emptyMembershipWallet:emptyMembershipWallet, getMembershipMultiTier:getMembershipMultiTier, searchProduct: searchProduct, getTreatmentTemplates: getTreatmentTemplates, getTemplateDetails: getTemplateDetails, savePAYGTreatmentPlan: savePAYGTreatmentPlan, getPlanDataByID: getPlanDataByID, saveMonthlyTreatmentPlan: saveMonthlyTreatmentPlan, getProgramData: getProgramData, applyStartProgramDiscount: applyStartProgramDiscount, changeTreatmentPlanClinic: changeTreatmentPlanClinic, viewPriceBreakUp: viewPriceBreakUp, startTreatmentProgram: startTreatmentProgram, cancelTreatmentPlan: cancelTreatmentPlan, savePlanAsTemplate: savePlanAsTemplate, updatePlanCard: updatePlanCard, getPrescribeOnlyDetails: getPrescribeOnlyDetails, updatePrescribeOnly: updatePrescribeOnly, doThisAction: doThisAction, signProcedure:signProcedure,exportEmptyData:exportEmptyData}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (ClientProfile);
