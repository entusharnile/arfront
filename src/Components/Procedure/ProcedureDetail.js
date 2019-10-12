import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchUserRoomData, deleteProcedureNote, signProcedure, markUnmarkAsAfterPhotos, hidemarkAsAfter, fetchSelectMD, restoreRecentlyDeleted } from '../../Actions/Settings/settingsActions.js';
import defVImage from '../../images/no-image-vertical.png';
import defHImage from '../../images/no-image-horizontal.png';
import { getUser, checkIfPermissionAllowed, numberFormat, capitalizeFirstLetter, showFormattedDate, isNumber } from '../../Utils/services.js';
import { withRouter } from 'react-router';
import { getAProcedureNote } from '../../Actions/ProcedureNotes/proNotesActions.js';
import { SketchField, Tools } from 'react-sketch';
import config from '../../config';
import axios from 'axios';
import Lightbox from 'react-images';
import Carousel from 'react-images';
import arrowLeft from '../../images/arrow-left.png';
import arrowRight from '../../images/arrow-right.png';

const proDetInstance = axios.create();

class ProcedureDetail extends Component {
  constructor(props) {
    super(props);
    const languageData    = JSON.parse(localStorage.getItem('languageData'))
    const userData        = JSON.parse(localStorage.getItem('userData'));
    let isConsentRequired = userData.user.is_md_consent_required;
    let showSigPopup      = userData.user.show_signature_popup;
    let mdUserID          = userData.user.md_user_id;

    this.state = {
      firstname: '',
      lastname: '',
      procedure_name: '',
      procedure_date: '',
      product_name: '',
      quantity: '',
      unit: '',
      total_price: '',
      userFirstName: '',
      userLastName: '',
      md_signed_on: '',
      provider_signed_on: '',
      injection_array: [],
      procedureFirstName: '',
      procedureLastName: '',
      front_pdf_image: '',
      patient_image_front: '',
      consent_ids: '',
      answers_count: '',
      answer_multiples_count: '',
      total_image_count: '',
      front_pdf_image_thumb_url: '',
      left_pdf_image_45_url: '',
      left_pdf_image_45_thumb_url: '',
      right_pdf_image_45_url: '',
      right_pdf_image_45_thumb_url: '',

      type: '',
      left_pdf_image_thumb_url: '',
      left_pdf_image_url: '',
      right_pdf_image_thumb_url: '',
      right_pdf_image_url: '',
      back_pdf_image_thumb_url: '',
      back_pdf_image_url: '',
      total_amount: '',
      invoice_id: '',
      invoice_status: '',
      back_pdf_image_left_45_thumb_url: "",
      back_pdf_image_left_45_url: "",
      back_pdf_image_right_45_url: "",
      back_pdf_image_right_45_thumb_url: "",

      patient_image_front: '',
      patient_image_left: '',
      patient_image_right: '',
      patient_image_left_45: '',
      patient_image_right_45: '',
      patient_image_back: '',
      patient_image_back_left_45: '',
      patient_image_back_right_45: '',
      patient_image_front_thumb_url: '',
      patient_image_front_url: '',
      patient_image_left_thumb_url: '',
      patient_image_left_url: '',
      patient_image_left_45_thumb_url: '',
      patient_image_left_45_url: '',
      patient_image_right_thumb_url: '',
      patient_image_right_url: '',
      patient_image_right_45_thumb_url: '',
      patient_image_right_45_url: '',
      patient_image_back_left_45_thumb_url: '',
      patient_image_back_left_45_url: '',
      patient_image_back_right_45_thumb_url: '',
      patient_image_back_right_45_url: '',
      patient_image_back_thumb_url: '',
      patient_image_back_url: '',

      display: true,
      width: 600,

      startFresh: true,
      showLoader: false,
      page: 1,
      pagesize: 15,
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      procedure_date: '',
      patient: [],
      user: [],
      searchFunction: '',
      user_changed: false,
      procedureData: {},
      userRoomData: [],
      data: [],
      select_all_pending_procedures: false,
      childCheck: false,
      action: (props.match.params.type) ? props.match.params.type : 'pending',
      pendingProcedures: true,
      signedProcedures: false,
      total: '',
      selectVisible: 'right-sign-btn',
      selectHide: 'right-sign-btn no-display',
      spanHide: 'search-text no-display',
      spanVisible: 'search-text',
      hideCheckbox: 'table-checkbox table-updated-td no-display',
      showCheckbox: 'table-checkbox table-updated-td ',
      hideHeading: 'table-checkbox table-updated-th no-display',
      showHeading: 'table-checkbox table-updated-th ',

      clinic_name: '',
      contact_no: '',
      address: '',
      clinic_business_hours: [],
      //id: userData.user.id,
      tax: '',
      clinicList: [],
      sortorder: 'asc',
			scopes: 'business_hours',

      def_no_image_vertical : defVImage,
      def_no_image_horizontal : defHImage,
      procedure_image_45_thumb_url: "",
      procedure_image_45_url: "",
      procedure_image_thumb_url: "",
      procedure_image_url: "",
      injections: [],
      noteTobeDeleted : 0,
      showDeleteModal       : false,

      procedureID : (this.props.match.params.id !== null && this.props.match.params.id !== '' && this.props.match.params.id) ? this.props.match.params.id : 0,
      patientID   : 0,
      traceData   : [],
      md_signed   : 0,
      showSignModal: false,
      canvasClass : "signature-box sig-div",
      inputOut    : 'input-outer',
      clearClass  : 'new-white-btn no-margin clear no-display',
      resetClass  : 'new-blue-btn reset no-display',
      changeClass : 'new-blue-btn no-margin Change',
      uploadedSignature: '',
      uploadedSignature_url:'',

      save_sign         : false,
      nextProcedureID   : 0,
      prevProcedureID   : 0,
      signData          : [],
      roomType          : this.props.match.url.split('/')[1],
      languageData      : languageData.procedure,
      globalLang        : languageData.global,
      settingsLang        : languageData.settings,
      listAction        : '',
      mdList            : [],
      md_id             : (mdUserID) ? mdUserID : 0,
      showConfirmModal  : false,

      isShowDeletedModal:false,
      lightboxIsOpen        : false,
			currentImage          : 0,
      lightboxImage         : null,
      front_pdf_image_url   : '',
      isConsentRequired: (isConsentRequired) ? 1 : 0,
      showSigPopup:(showSigPopup) ? 1 : 0,
      imageArray : [],
      photoIndex:0
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);

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
    if (this.props.match.params.id !== undefined ) {
      let formData = {
      'params': {
        action: this.props.match.params.type
        // scopes : this.state.scopes signed
      }}

      this.setState({ 'showLoader': true, procedureID : this.props.match.params.id });
      this.props.fetchUserRoomData(this.props.match.params.id, formData, this.state.roomType);

      if ( this.state.roomType === 'provider-room' && this.state.action === 'pending') {
        this.props.fetchSelectMD();
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.match.params.id !== this.state.procedureID){
      let formData = {
        'params': {
          action: this.props.match.params.type
          // scopes : this.state.scopes signed
        }}
     this.setState({ showLoader: true, procedureID : this.props.match.params.id });
     this.props.fetchUserRoomData(this.props.match.params.id, formData, this.state.roomType);
    }

    if ( this.state.deleteNoteData !== null && this.state.deleteNoteData !== '' && this.state.deleteNoteData !== prevState.deleteNoteData && this.state.deleteMessage !== null && this.state.deleteMessage !== '' ) {
      if (this.props.match.params.id !== undefined ) {
        let formData = {
        'params': {
          action: this.props.match.params.type
          // scopes : this.state.scopes signed
        }}

        this.setState({ showLoader: true, procedureID : this.props.match.params.id });
        this.props.fetchUserRoomData(this.props.match.params.id, formData, this.state.roomType);

        if ( this.state.roomType === 'provider-room' && this.state.action === 'pending') {
          this.props.fetchSelectMD();
        }
      }
    }
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };


  static getDerivedStateFromProps(props, state) {
    if (props.userRoomData === undefined && props.mdList !== undefined && props.mdList !== state.mdList && props.mdList.length > 0) {
      let mdID = (state.md_id) ? state.md_id : props.mdList[0].id;

      return {
        mdList : props.mdList,
        md_id  : mdID
      }
    }
    if (props.userRoomData != undefined && props.userRoomData.data !== undefined && props.userRoomData.data.procedure !== undefined && props.userRoomData.data.procedure !== state.userRoomData && props.userRoomData.status === 200) {
      // let x = (props.userRoomData.procedure.procedure_image_data != null) ? "bbc" : 'xyz'
      let returnState =  {
        isConsentRequired : ((props.userRoomData.data.login_user) && props.userRoomData.data.login_user.is_md_consent_required !== undefined) ? ((props.userRoomData.data.login_user.is_md_consent_required) ? 1 : 0) : state.isConsentRequired,
        showSigPopup : ((props.userRoomData.data.login_user) && props.userRoomData.data.login_user.show_signature_popup !== undefined) ? ((props.userRoomData.data.login_user.show_signature_popup) ? 1 : 0) : state.showSigPopup,
        nextProcedureID : (props.userRoomData.data.next !== null && props.userRoomData.data.next !== "") ? props.userRoomData.data.next : 0,
        prevProcedureID : (props.userRoomData.data.previous !== null && props.userRoomData.data.previous !== "") ? props.userRoomData.data.previous : 0,

        canvasClass: (props.userRoomData.data.procedure.user.signature_url) ?  'signature-box sig-div no-display' : 'signature-box sig-div',
        inputOut: (props.userRoomData.data.procedure.user.signature_url) ?  'input-outer' : 'input-outer no-display',
        clearClass: (props.userRoomData.data.procedure.user.signature_url) ?  'new-white-btn no-margin clear no-display' : 'new-white-btn no-margin clear',
        resetClass: (props.userRoomData.data.procedure.user.signature_url) ?  'new-blue-btn reset no-display' : 'new-blue-btn reset ',
        changeClass: (props.userRoomData.data.procedure.user.signature_url) ?  'new-blue-btn no-margin Change' : 'new-blue-btn no-margin Change no-display',


        firstname: (state.userChanged) ? state.firstname : (props.userRoomData.data.procedure.patient && props.userRoomData.data.procedure.patient !== undefined &&  props.userRoomData.data.procedure.patient !== null) ? props.userRoomData.data.procedure.patient.firstname : '',
        lastname: (state.userChanged) ? state.lastname : (props.userRoomData.data.procedure.patient && props.userRoomData.data.procedure.patient !== undefined &&  props.userRoomData.data.procedure.patient !== null) ? props.userRoomData.data.procedure.patient.lastname : '',
        procedure_name:  (state.userChanged) ? state.procedure_name : props.userRoomData.data.procedure.procedure_name,
        procedure_date:  (state.userChanged) ? state.procedure_date : props.userRoomData.data.procedure.procedure_date,
        total_amount: (state.userChanged) ? state.total_amount : props.userRoomData.data.procedure.total_amount,
        invoice_id: (state.userChanged) ? state.invoice_id : props.userRoomData.data.procedure.invoice_id,
        invoice_status: (state.userChanged) ? state.invoice_status : props.userRoomData.data.procedure.invoice_status,
        signature_url : props.userRoomData.data.login_user.signature_url,

      //  injection_array:  (state.userChanged) ? state.unit : props.userRoomData.data.procedure.injection_array.unit,

        userRoomData: props.userRoomData.data.procedure,

        userLastName: (state.userChanged) ? state.lastname : props.userRoomData.data.procedure.user.lastname,
        userFirstName: (state.userChanged) ? state.firstname : props.userRoomData.data.procedure.user.firstname,
        provider_signed_on: (state.userChanged) ? state.provider_signed_on : props.userRoomData.data.procedure.provider_signed_on,
        md_signed_on: (state.userChanged) ? state.md_signed_on : props.userRoomData.data.procedure.md_signed_on,

        procedureFirstName: (state.userChanged) ? state.lastname : props.userRoomData.data.procedure.procedure_notes.firstname,
        procedureLastName: (state.userChanged) ? state.lastname : props.userRoomData.data.procedure.procedure_notes.lastname,

        patient_image_front: (state.userChanged) ? state.patient_image_front : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_front : ''),

        front_pdf_image: (state.userChanged) ? state.front_pdf_image : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.front_pdf_image : ''),

        front_pdf_image_url: (state.userChanged) ? state.front_pdf_image_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.front_pdf_image_url : ''),

        consent_ids: (state.userChanged) ? state.consent_ids : props.userRoomData.data.procedure.consent_ids,
        answers_count: (state.userChanged) ? state.answers_count : props.userRoomData.data.procedure.answers_count,
        answer_multiples_count: (state.userChanged) ? state.answer_multiples_count : props.userRoomData.data.procedure.answer_multiples_count,
        front_pdf_image_thumb_url: (state.userChanged) ? state.patient_image_front : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.front_pdf_image_thumb_url : ''),
        right_pdf_image_45_url:  (state.userChanged) ? state.right_pdf_image_45_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.right_pdf_image_45_url : ''),
        right_pdf_image_45_thumb_url: (state.userChanged) ? state.right_pdf_image_45_thumb_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.right_pdf_image_45_thumb_url : ''),
        left_pdf_image_45_thumb_url: (state.userChanged) ? state.left_pdf_image_45_thumb_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.left_pdf_image_45_thumb_url : ''),
        left_pdf_image_45_url: (state.userChanged) ? state.left_pdf_image_45_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.left_pdf_image_45_url : ''),
        left_pdf_image_thumb_url: (state.userChanged) ? state.left_pdf_image_thumb_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.left_pdf_image_thumb_url : ''),
        total_image_count: (state.userChanged) ? state.total_image_count : props.userRoomData.data.procedure.total_image_count,

        left_pdf_image_url: (state.userChanged) ? state.left_pdf_image_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.left_pdf_image_url : ''),
        right_pdf_image_thumb_url: (state.userChanged) ? state.right_pdf_image_thumb_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.right_pdf_image_thumb_url : ''),
        right_pdf_image_url: (state.userChanged) ? state.right_pdf_image_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.right_pdf_image_url : ''),
        back_pdf_image_thumb_url: (state.userChanged) ? state.back_pdf_image_thumb_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.back_pdf_image_thumb_url : ''),
        back_pdf_image_url: (state.userChanged) ? state.back_pdf_image_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.back_pdf_image_url : ''),
        type: (state.userChanged) ? state.type : props.userRoomData.data.procedure.type,

        patient_image_left: (state.userChanged) ? state.patient_image_left : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_left : ''),
        patient_image_right: (state.userChanged) ? state.patient_image_right : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_right : ''),
        patient_image_left_45: (state.userChanged) ? state.patient_image_left_45 : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_left_45 : ''),
        patient_image_right_45: (state.userChanged) ? state.patient_image_right_45 : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_right_45 : ''),
        patient_image_back: (state.userChanged) ? state.patient_image_back : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back : ''),
        patient_image_back_left_45: (state.userChanged) ? state.patient_image_back_left_45 : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back_left_45 : ''),
        patient_image_back_right_45: (state.userChanged) ? state.patient_image_back_right_45 : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back_right_45 : ''),
        patient_image_front_thumb_url: (state.userChanged) ? state.patient_image_front_thumb_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_front_thumb_url : ''),
        patient_image_front_url: (state.userChanged) ? state.patient_image_front_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_front_url : ''),
        patient_image_left_thumb_url: (state.userChanged) ? state.patient_image_left_thumb_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_left_thumb_url : ''),
        patient_image_left_url: (state.userChanged) ? state.patient_image_left_url : ( (props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_left_url : ''),
        patient_image_left_45_thumb_url: (state.userChanged) ? state.patient_image_left_45_thumb_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_left_45_thumb_url : ''),
        patient_image_left_45_url: (state.userChanged) ? state.patient_image_left_45_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_left_45_url : ''),
        patient_image_right_thumb_url: (state.userChanged) ? state.patient_image_right_thumb_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_right_thumb_url : ''),
        patient_image_right_url: (state.userChanged) ? state.patient_image_right_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_right_url : ''),
        patient_image_right_45_thumb_url: (state.userChanged) ? state.patient_image_right_45_thumb_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_right_45_thumb_url : ''),
        patient_image_right_45_url: (state.userChanged) ? state.patient_image_right_45_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_right_45_url : ''),
        patient_image_back_left_45_thumb_url: (state.userChanged) ? state.patient_image_back_left_45_thumb_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back_left_45_thumb_url : ''),
        patient_image_back_left_45_url: (state.userChanged) ? state.patient_image_back_left_45_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back_left_45_url : ''),
        patient_image_back_right_45_thumb_url: (state.userChanged) ? state.patient_image_back_right_45_thumb_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back_right_45_thumb_url : ''),
        patient_image_back_right_45_url: (state.userChanged) ? state.patient_image_back_right_45_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back_right_45_url: ''),
        patient_image_back_thumb_url: (state.userChanged) ? state.patient_image_back_thumb_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back_thumb_url : ''),
        patient_image_back_url: (state.userChanged) ? state.patient_image_back_url : ((props.userRoomData.data.procedure.procedure_image_data != null) ? props.userRoomData.data.procedure.procedure_image_data.patient_image_back_url : ''),

        total_price: (state.userChanged) ? state.procedure_name : props.userRoomData.data.procedure.total_price,
        showLoader: false,

        procedure_image_45_thumb_url: (state.userChanged) ? state.procedure_image_45_thumb_url : ((props.userRoomData.data.procedure.procedure_image_45_thumb_url != null) ? props.userRoomData.data.procedure.procedure_image_45_thumb_url : ''),
        procedure_image_45_url: (state.userChanged) ? state.procedure_image_45_url : ((props.userRoomData.data.procedure.procedure_image_45_url != null) ? props.userRoomData.data.procedure.procedure_image_45_url : ''),
        procedure_image_thumb_url: (state.userChanged) ? state.procedure_image_thumb_url : ((props.userRoomData.data.procedure.procedure_image_thumb_url != null) ? props.userRoomData.data.procedure.procedure_image_thumb_url : ''),
        procedure_image_url: (state.userChanged) ? state.procedure_image_url : ((props.userRoomData.data.procedure.procedure_image_url != null) ? props.userRoomData.data.procedure.procedure_image_url : ''),

        back_pdf_image_left_45_thumb_url: (state.userChanged) ? state.back_pdf_image_left_45_thumb_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.back_pdf_image_left_45_thumb_url : ''),
        back_pdf_image_left_45_url: (state.userChanged) ? state.back_pdf_image_left_45_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.back_pdf_image_left_45_url : ''),
        back_pdf_image_right_45_url: (state.userChanged) ? state.back_pdf_image_right_45_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.back_pdf_image_right_45_url : ''),
        back_pdf_image_right_45_thumb_url: (state.userChanged) ? state.back_pdf_image_right_45_thumb_url : ((props.userRoomData.data.procedure.pdf_image) ? props.userRoomData.data.procedure.pdf_image.back_pdf_image_right_45_thumb_url : ''),
        injections: (state.userChanged) ? state.injections : props.userRoomData.data.injections,
        patientID : (props.userRoomData.data.procedure.patient !== null && props.userRoomData.data.procedure.patient !== undefined) ? props.userRoomData.data.procedure.patient.id : 0,
        traceData: props.userRoomData.data.injections,

        md_signed:  (state.md_signed) ? state.injections : props.userRoomData.data.procedure.md_signed,
        signature: props.userRoomData.data.procedure.user.signature
    };
    return returnState;
    // There are no navigation arrows in procedure photo view - START
    // https://app.asana.com/0/1113829472898251/1124837077755838
    /*
    let imageArray = []
    if(returnState.type ===  'coolsculpting'){
      if(returnState.back_pdf_image_left_45_url || returnState.patient_image_back_left_45_url)
        imageArray.push({src:(returnState.back_pdf_image_left_45_url) ? returnState.back_pdf_image_left_45_url : (returnState.patient_image_back_left_45_url) ? returnState.patient_image_back_left_45_url : state.def_no_image_horizontal});
      if(returnState.back_pdf_image_right_45_url || returnState.back_pdf_image_right_45_url)
        imageArray.push({src:(returnState.back_pdf_image_right_45_url) ? returnState.back_pdf_image_right_45_url : (returnState.patient_image_back_right_45_url) ? returnState.patient_image_back_right_45_url : state.def_no_image_horizontal});
      if(returnState.back_pdf_image_url || returnState.patient_image_back)
      imageArray.push({src:(returnState.back_pdf_image_url) ? returnState.back_pdf_image_url : (returnState.patient_image_back) ? returnState.patient_image_back : state.def_no_image_vertical});
    } else {
      if(returnState.left_pdf_image_45_url || returnState.patient_image_left_45_url)
        imageArray.push({src:(returnState.left_pdf_image_45_url) ? returnState.left_pdf_image_45_url : (returnState.patient_image_left_45_url) ? returnState.patient_image_left_45_url : state.def_no_image_horizontal});
      if(returnState.right_pdf_image_45_url || returnState.patient_image_back_right_45_url)
        imageArray.push({src:(returnState.right_pdf_image_45_url) ? returnState.right_pdf_image_45_url : (returnState.patient_image_back_right_45_url) ? returnState.patient_image_back_right_45_url : state.def_no_image_horizontal});
      if(returnState.procedure_image_45_url)
        imageArray.push({src:(returnState.procedure_image_45_url) ? returnState.procedure_image_45_url : state.def_no_image_vertical});

      if(returnState.left_pdf_image_url || returnState.patient_image_left_url)
        imageArray.push({src:(returnState.left_pdf_image_url) ? returnState.left_pdf_image_url : (returnState.patient_image_left_url) ? returnState.patient_image_left_url : state.def_no_image_horizontal});
      if(returnState.right_pdf_image_url || returnState.patient_image_right_url)
        imageArray.push({src:(returnState.right_pdf_image_url) ? returnState.right_pdf_image_url : (returnState.patient_image_right_url) ? returnState.patient_image_right_url : state.def_no_image_horizontal});
      if(returnState.procedure_image_url)
        imageArray.push({src:(returnState.procedure_image_url) ? returnState.procedure_image_url : state.def_no_image_vertical});
    }
    */
    /*
    if(returnState.type ===  'coolsculpting'){
      imageArray.push((returnState.back_pdf_image_left_45_url) ? returnState.back_pdf_image_left_45_url : (returnState.patient_image_back_left_45_url) ? returnState.patient_image_back_left_45_url : state.def_no_image_horizontal);
      imageArray.push((returnState.back_pdf_image_right_45_url) ? returnState.back_pdf_image_right_45_url : (returnState.patient_image_back_right_45_url) ? returnState.patient_image_back_right_45_url : state.def_no_image_horizontal);
      imageArray.push((returnState.back_pdf_image_url) ? returnState.back_pdf_image_url : (returnState.patient_image_back) ? returnState.patient_image_back : state.def_no_image_vertical);
    } else {
      imageArray.push((returnState.left_pdf_image_45_url) ? returnState.left_pdf_image_45_url : (returnState.patient_image_left_45_url) ? returnState.patient_image_left_45_url : state.def_no_image_horizontal);
      imageArray.push((returnState.right_pdf_image_45_url) ? returnState.right_pdf_image_45_url : (returnState.patient_image_back_right_45_url) ? returnState.patient_image_back_right_45_url : state.def_no_image_horizontal);
      imageArray.push((returnState.procedure_image_45_url) ? returnState.procedure_image_45_url : state.def_no_image_vertical);

      imageArray.push((returnState.left_pdf_image_url) ? returnState.left_pdf_image_url : (returnState.patient_image_left_url) ? returnState.patient_image_left_url : state.def_no_image_horizontal);
      imageArray.push((returnState.right_pdf_image_url) ? returnState.right_pdf_image_url : (returnState.patient_image_right_url) ? returnState.patient_image_right_url : state.def_no_image_horizontal);
      imageArray.push((returnState.procedure_image_url) ? returnState.procedure_image_url : state.def_no_image_vertical);
    }*/
    //returnState.imageArray = imageArray
    // There are no navigation arrows in procedure photo view - END
    return returnState;
  }

  if (props.userRoomData !== undefined && props.userRoomData.status === 201 && props.userRoomData.data != state.userRoomData) {

    if ( state.nextProcedureID && state.nextProcedureID !== null && state.nextProcedureID !== '' && state.nextProcedureID > 0 && state.procedureID === props.match.params.id ) {
      props.history.push(`/${state.roomType}/procedure-detail/${state.nextProcedureID}/${props.match.params.type}`);

      return {
        userRoomData: props.userRoomData.data,
        showLoader: false
      }
    } else {
      props.history.push(`/${state.roomType}/${props.match.params.type}`);

      return {
        showLoader: false
      }
    }

  } else if (props.redirect !== undefined && props.redirect === true) {
      toast.success(props.message)
          props.history.push(`/${state.roomType}/${props.match.params.type}`);
    } else if (props.redirectToDeleted !== undefined && props.redirectToDeleted === true) {
        toast.success(props.message)
            props.history.push(`/settings/${props.match.params.type}`);
      } else if (props.showLoader !== undefined && props.showLoader === false) {
      return {showLoader:false}
    }

    if ( props.deleteNoteData !== undefined && props.deleteNoteData.status === 200 && props.deleteNoteData.data !== state.deleteNoteData ) {
       return {
         deleteNoteData     : props.deleteNoteData.data,
         showLoader         : false,
         deleteMessage      : props.deleteNoteData.data,
       }

     } else if ( props.deleteNoteData !== undefined && props.deleteNoteData.status !== 200 && props.deleteNoteData.data !== state.deleteNoteData ) {
       return {
         deleteNoteData     : props.deleteNoteData.data,
         showLoader         : false,
         deleteMessage      : ''
       }
     }

    return null;
  }

  getLoggedInUserData = () => {
    let userData = JSON.parse(getUser())
    if ( userData ) {
      return userData.user.id
    }
    return 0
  }

  openNotes = () => {
    let patientID      = (this.state.userRoomData.patient !== null && this.state.userRoomData.patient !== undefined) ? this.state.userRoomData.patient.id : 0

    if ( patientID && patientID > 0 ) {
      let procedureID    = this.state.userRoomData.id
      let procedureType  = this.props.match.params.type

      if ( patientID && procedureID && procedureType ) {
        return (
          <div>
            {this.props.history.push(`/${this.state.roomType}/notes/${procedureID}/${patientID}/${procedureType}`)}
          </div>
        );
      } else {
        toast.error(`${this.state.languageData.pro_something_went_wrong_text}`)
      }
    } else {
      toast.error(`${this.state.languageData.pro_no_pat_associated_text}`)
    }
  }

  showDeleteModal = (e) => {
    e.preventDefault();
    this.state.noteTobeDeleted = e.target.name
    this.setState({showDeleteModal: true})
  }

  dismissDeleteModal = () => {
     this.setState({showDeleteModal: false, noteTobeDeleted: 0})
  }

  deleteNote = () => {
    let noteID      = this.state.noteTobeDeleted
    let patientID   = this.state.patientID
    let procedureID = this.state.procedureID
    let action      = this.state.action
    let roomType    = this.state.roomType

    if ( noteID ) {
      this.props.deleteProcedureNote(noteID)
    } else {
      toast.error(`${this.state.languageData.pro_can_not_delete_note_error_text}`);
    }
    this.setState({showDeleteModal: false, noteTobeDeleted: 0, showLoader: true})
  }

  openSignModal = () => {
    let procedureID = this.state.procedureID

    if ( procedureID ) {
      if ( !this.state.showSigPopup ) {
        if ( this.state.signature_url ) {
          this.saveWithoutSign();
        } else {
          this.setState({showSignModal: true});
        }
      } else {
        this.setState({showSignModal: true});
      }
    }
  }

  saveWithoutSign = () => {
    let procedureID = this.state.procedureID;
    let listAction  = this.state.listAction;
    let listConsult = 0
    let mdID        = this.state.md_id

    if ( listAction === 'markconsult' ) {
      listConsult = 1;
    }

    if (this.state.signature_url !== "") {
      let formData = {}

      if ( this.state.roomType && this.state.roomType === 'provider-room' ) {
        formData = {
          current_procedure_id  : procedureID,
          procedure_ids         : [procedureID],
          signature             : this.state.signature,
          signature_saved       : (this.state.save_sign) ? 1 : 0,
          is_consult            : listConsult,
          md_user_id            : mdID
        };

        if ( !this.state.isConsentRequired) {
          delete formData.md_user_id;
        }
      } else {
        formData = {
          current_procedure_id  : procedureID,
          procedure_ids         : [procedureID],
          signature_saved       : (this.state.save_sign) ? 1 : 0,
          md_signature          : this.state.signature,
        };
      }

      this.props.signProcedure(formData, false, {}, this.state.roomType, 'detail');

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

  dismissSignModal = () => {
     this.setState({showSignModal: false, showConfirmModal: false, listAction: ''})
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

  signThis = () => {

    if ( (this._sketch && this._sketch.toJSON().objects.length === 0 && this.state.canvasClass.indexOf('no-display') === -1) || (this.state.canvasClass.indexOf('no-display') > 0 && this.state.signature_url === '' ) ) {
      toast.error(this.state.globalLang.validation_md_signature_required_if)
    } else {
      let procedureID = this.state.procedureID;
      let listAction  = this.state.listAction;
      let listConsult = 0
      let mdID        = this.state.md_id

      if ( listAction === 'markconsult' ) {
        listConsult = 1;
      }

      if (this.state.signature_url !== "" && this.state.canvasClass.indexOf('no-display') > 0) {
        let formData = {}

        if ( this.state.roomType && this.state.roomType === 'provider-room' ) {
          formData = {
            current_procedure_id  : procedureID,
            procedure_ids         : [procedureID],
            signature             : this.state.signature,
            signature_saved       : (this.state.save_sign) ? 1 : 0,
            is_consult            : listConsult,
            md_user_id            : mdID
          };

          if ( !this.state.isConsentRequired) {
            delete formData.md_user_id;
          }
        } else {
          formData = {
            current_procedure_id  : procedureID,
            procedure_ids         : [procedureID],
            signature_saved       : (this.state.save_sign) ? 1 : 0,
            md_signature          : this.state.signature,
          };
        }

        this.props.signProcedure(formData, false, {}, this.state.roomType, 'detail');

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
        proDetInstance.post(config.API_URL + "upload/signature", ({image_data : this._sketch.toDataURL(), upload_type: 'signatures'})).then(response => {
            if ( response.data && response.data.status === 200 ) {
              let formData = {}

              if ( this.state.roomType && this.state.roomType === 'provider-room' ) {
                formData = {
                  current_procedure_id  : procedureID,
                  procedure_ids         : [procedureID],
                  signature             : response.data.data.file_name,
                  signature_saved       : (this.state.save_sign) ? 1 : 0,
                  is_consult            : listConsult,
                  md_user_id            : mdID
                };

                if ( !this.state.isConsentRequired) {
                  delete formData.md_user_id;
                }
              } else {
                formData = {
                  current_procedure_id  : procedureID,
                  procedure_ids         : [procedureID],
                  signature_saved       : (this.state.save_sign) ? 1 : 0,
                  md_signature          : response.data.data.file_name
                };
              }

              this.props.signProcedure(formData, false, {}, this.state.roomType, 'detail');

              this.setState({
                signature_url : response.data.data.signature_url,
                uploadedSignature_url : response.data.data.signature_url,
                uploadedSignature:response.data.data.file_name,
                signature:response.data.data.file_name,
                inputOut: 'input-outer',
                canvasClass: 'signature-box sig-div  no-display',
                clearClass: 'new-white-btn no-margin clear no-display',
                resetClass: 'new-blue-btn reset  no-display',
                changeClass: 'new-blue-btn no-margin Change',
                showSignModal: false,
                showLoader: true
              })
            }
        }).catch(error => {
            toast.error(`${this.state.languageData.pro_sign_upload_error_text}`)
        })
      }
    }
  }

  getProcedureDataByID = (e) => {
    e.preventDefault();
    let type = e.target.parentNode.name
    let procedureID = 0

    if ( type && type == 'getNext' ) {
      procedureID = this.state.nextProcedureID
    } else if ( type && type == 'getPrev' ) {
      procedureID = this.state.prevProcedureID
    }

    if ( procedureID && procedureID > 0 ) {
      this.props.history.push(`/${this.state.roomType}/procedure-detail/${procedureID}/${this.props.match.params.type}`);
    }
  }

  doThis = (e) => {
    e.preventDefault();
    let action      = e.target.dataset.action
    let prodeureID  = e.target.dataset.procedureid

    if ( action && prodeureID > 0 ) {
      if ( action === "unmarkafterphoto" || action === "markafterphoto" ) {
        let isMarked = e.target.dataset.isafterphotos

        let formData = {
            is_marked : isMarked,
        }

        let listData = {
          'params': {
            action: this.state.action
          }
        };

        this.props.markUnmarkAsAfterPhotos(formData, prodeureID, listData, this.state.roomType, 'detail')

        this.setState({
          startFresh : true,
          showLoader: true
        })
      }

      if ( action === "hide" ) {
        let listData = {
          'params': {
            action: this.state.action
          }
        };

        this.props.hidemarkAsAfter(prodeureID, listData, this.state.roomType, 'detail', this.state.nextProcedureID)

        this.setState({
          startFresh : true,
          showLoader: true
        })
      }

      if ( action === "incompletesign" || action === "markconsult" || action === "completesign" ) {
        if ( action === "incompletesign" ) {
          this.setState({showConfirmModal: true, listAction: action})
        } else {
          if ( !this.state.showSigPopup ) {
            if ( this.state.signature_url ) {
              this.saveWithoutSign();
            } else {
              this.setState({showSignModal: true, listAction: action})
            }
          } else {
            this.setState({showSignModal: true, listAction: action})
          }
        }
      }
    }
  }

  dismissConfirmationModal = () => {
     this.setState({showConfirmModal: false, listAction: ''})
  }

  confirmAndOpen = () => {
    if ( !this.state.showSigPopup ) {
      if ( this.state.signature_url ) {
        this.setState({showConfirmModal: false});
        this.saveWithoutSign();
      } else {
        this.setState({showConfirmModal: false, showSignModal: true})
      }
    } else {
      this.setState({showConfirmModal: false, showSignModal: true})
    }
  }

  runCarousel = (e) => {
    e.preventDefault();

    if ( this.state.total_image_count && this.state.total_image_count > 0 ) {
      let targetNode = e.target.parentNode.parentNode.children[0].children[0].childNodes
      let nodeLength = targetNode.length

      for (let i = 0; i < nodeLength; i++) {
        if (targetNode[i].classList.contains('active')) {

          targetNode[i].classList.remove('active');

          if ( i === (nodeLength - 1) ) {
            i = -1
          }

          targetNode[i+1].classList.add('active');
          return
        } else {

        }
      }
    }
  }

  handleRestoreModal = () => {
    this.setState({ isShowDeletedModal: !this.state.isShowDeletedModal })
  }

  restoreSelected = () => {
    if(this.props.match.params.id != undefined && this.props.match.params.id > 0 && this.props.match.params.type != undefined && this.props.match.params.type == 'recently-deleted'){
      const procedureIds =  [this.props.match.params.id];
      this.setState({showLoader: true })
      this.props.restoreRecentlyDeleted({ 'procedure_ids': procedureIds })
      this.setState({ isShowDeletedModal: !this.state.isShowDeletedModal})
    }
  }

  viewTraceAbility = () => {
    let patientID      = (this.state.userRoomData.patient !== null && this.state.userRoomData.patient !== undefined) ? this.state.userRoomData.patient.id : 0;
    let procedureID    = this.state.userRoomData.id

    return (
      <div>
        {this.props.history.push(`/provider-room/traceability-info/${procedureID}/${patientID}/procedure-detail/${this.props.match.params.type}`)}
      </div>
    );
  }

  editNote = (noteID) => {
    let patientID      = (this.state.userRoomData.patient !== null && this.state.userRoomData.patient !== undefined) ? this.state.userRoomData.patient.id : 0

    if ( patientID && patientID > 0 ) {
      let procedureID    = this.state.userRoomData.id
      let procedureType  = this.props.match.params.type

      if ( patientID && procedureID && procedureType ) {
        return (
          <div>
            {this.props.history.push(`/${this.state.roomType}/notes/${procedureID}/${patientID}/${procedureType}/${noteID}`)}
          </div>
        );
      } else {
        toast.error(`${this.state.languageData.pro_something_went_wrong_text}`)
      }
    } else {
      toast.error(`${this.state.languageData.pro_no_pat_associated_text}`)
    }
  }

  render() {


    var traceInjectionData = '';
    {
      traceInjectionData = this.state.traceData !== undefined && this.state.traceData.length > 0 &&  this.state.traceData.map((traceobj, traceidx) => {
        let traceIdx        = traceidx++;
        let proNameHeading  = traceidx + ` - ` + capitalizeFirstLetter(traceobj.product_name) + ` ` + numberFormat(traceobj.quantity, 'decimal', 1) + ' ' + traceobj.unit
        return (
          <div className="table-responsive m-b-30" key={traceidx}>
            <div className="traceProduct">
              { proNameHeading }
            </div>
        		<table className="table-updated juvly-table no-hover">
        			<thead className="table-updated-thead">
        				<tr>
        					<th className="col-xs-3 table-updated-th">{this.state.languageData.pro_th_batch_id_text}</th>
        					<th className="col-xs-2 table-updated-th">{this.state.languageData.pro_th_expire_text} </th>
        					<th className="col-xs-3 table-updated-th">{this.state.languageData.pro_th_unit_text} </th>
        					<th className="col-xs-3 table-updated-th">{this.state.languageData.pro_price} </th>
        				</tr>
        			</thead>
              { (traceobj.trace_data !== undefined && traceobj.trace_data !== null && traceobj.trace_data.length > 0 ) ?
        			<tbody>
              {traceobj.trace_data.map((innerObj, innerIdx) => {
                return (
                  <tr key={innerIdx} className="table-updated-tr">
                    <td className="col-xs-3 table-updated-td">{(innerObj.product_inventory && innerObj.product_inventory.batch_id) ? innerObj.product_inventory.batch_id : ""}</td>
                    <td className="col-xs-2 table-updated-td">{(innerObj.product_inventory && innerObj.product_inventory.expiry_date) ? showFormattedDate(innerObj.product_inventory.expiry_date) : ""}</td>
                    <td className="col-xs-3 table-updated-td">{(innerObj.units_consumed) ? numberFormat(innerObj.units_consumed, 'decimal', 1) : ""}</td>
                    <td className="col-xs-1 table-updated-td">{(innerObj.price) ? numberFormat(innerObj.price, 'currency') : ""}</td>
                  </tr>
                )
              }) }
        			</tbody> : <tbody><tr className="table-updated-tr"><td colSpan="4" className="table-updated-td text-center">{this.state.languageData.pro_sory_no_record_text}</td></tr></tbody>
            }
        		</table>
        	</div>
          )
        }
      )
    }

    var procedurePrice = '';
    {
      procedurePrice = this.state.userRoomData.procedure_notes !== undefined && this.state.userRoomData.procedure_notes.map((probj, pridx) => {
        return this.state.userRoomData.procedure_notes.length
        }
      )
    }

    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1
    };

    let returnTo = (this.state.action) ? "/" + this.state.roomType + "/" + this.state.action  : 'pending'

    let traceClass = (this.state.type !== "coolsculpting" && this.state.type !== "laser") ? "" : "no-display"

    let notesClass = (checkIfPermissionAllowed('view-procedure-notes')) ? "settings-subtitle m-b-20" : "settings-subtitle m-b-20 no-display"

    let noteTimelineClass = (this.state.userRoomData.procedure_notes && this.state.userRoomData.procedure_notes.length > 0 ) ? "note-timeline" : "note-timeline no-display"

    let noRecordClass     = (this.state.userRoomData.procedure_notes && this.state.userRoomData.procedure_notes.length > 0 ) ? "no-record no-display" : "no-record"


    let isComplete        = 0;
    let signText          = this.state.languageData.pro_sign_incomplete;
    let isAfterPhotos     = 1;
    let markAsAfterText   = this.state.languageData.pro_mark_as_after_photos;

    if ( ( ( this.state.userRoomData.procedure_image !== null && this.state.userRoomData.procedure_image !== '') || (this.state.userRoomData.procedure_image_45 !== null && this.state.userRoomData.procedure_image_45 !== '') || this.state.userRoomData.type === 'laser' || this.state.userRoomData.type === 'coolsculpting' ) && ( this.state.traceData !== undefined && this.state.traceData.length > 0 ) && ( this.state.userRoomData.procedure_notes !== null && this.state.userRoomData.procedure_notes !== undefined && this.state.userRoomData.procedure_notes.length > 0 ) && ( this.state.userRoomData.consent_ids !== null && this.state.userRoomData.consent_ids !== '' ) && ( this.state.userRoomData.answers_count > 0 || this.state.userRoomData.answer_multiples_count > 0 ) && ( this.state.userRoomData.pos_invoices !== null && this.state.userRoomData.pos_invoices !== undefined && this.state.userRoomData.pos_invoices.id !== undefined ) ) {
      isComplete = 1;
      signText   = 'Sign';
    }


    if ( this.state.userRoomData.is_after_photos === 1 ) {
      isAfterPhotos   = 0;
      markAsAfterText = this.state.languageData.pro_unmark_as_after_photos;
    }

    let optData    = '';

    if ( this.state.mdList !== undefined && this.state.mdList.length > 0 ) {

      optData = this.state.mdList.map((mdObj, mdidx) => {

         return <option key={mdidx} value={mdObj.id}>{(mdObj.firstname && mdObj.firstname != undefined) ? mdObj.firstname : ''} {(mdObj.lastname && mdObj.lastname != undefined) ? mdObj.lastname : ''}</option>;
     })
    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <div className="wide-popup">
            <div className="modal-blue-header">
              <Link to={returnTo} className="popup-cross">×</Link>

              {(this.state.showLoader === false && this.state.prevProcedureID && this.state.prevProcedureID > 0 ) ? <a onClick={this.getProcedureDataByID.bind(this)} name="getPrev" className="slide-arrows"><img src={arrowLeft} onClick={this.getProcedureDataByID.bind(this)} name="getPrev" /></a> : ''}

              {(this.state.showLoader === false) && <span className="popup-blue-name">{this.state.firstname} {this.state.lastname + `-`}  {this.state.procedure_name}</span>}

              {(this.state.showLoader === false && this.state.nextProcedureID && this.state.nextProcedureID > 0 ) ? <a onClick={this.getProcedureDataByID.bind(this)} name="getNext" className="slide-arrows"><img src={arrowRight} onClick={this.getProcedureDataByID.bind(this)} name="getNext" /></a> : ''}

              { ( (this.state.roomType && this.state.roomType === 'md-room') && (this.state.action && this.state.action === 'pending') && this.state.showLoader === false ) ?
                <div className="popup-new-btns">
                  { this.state.md_signed !== 1 ?
                    <button type="submit" className="new-blue-btn pull-right consent-model" onClick={this.openSignModal}>{this.state.languageData.pro_text_sgn}</button> : ''
                  }
                </div> : ""
              }

              { ( (this.state.roomType && this.state.roomType === 'provider-room') && (this.state.action && this.state.action === 'pending') && this.state.showLoader === false ) ?
                <div className="popup-new-btns m-r-20">
                  <div className="dropdown show-hide-btn">

                    <button className="line-btn" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    Actions <i className="fas fa-angle-down"></i>
                    </button>

                    <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                      <li><a onClick={this.doThis} className="sign-procedure sign-procedure-class" data-consult="0" data-procedureid={this.state.userRoomData.id} data-iscomplete={isComplete} data-action={(isComplete === 0) ? "incompletesign" : "completesign" }>{signText}</a></li>

                      <li><a onClick={this.doThis} className="sign-as-consult sign-procedure-class" data-consult="1" data-procedureid={this.state.userRoomData.id} data-action="markconsult">Mark as consult</a></li>

                      <li><a onClick={this.doThis} className="mark-as-after-photo sign-procedure-class" data-procedureid={this.state.userRoomData.id} data-isafterphotos={isAfterPhotos} data-action={(isAfterPhotos === 0) ? "unmarkafterphoto" : "markafterphoto" }>{markAsAfterText}</a></li>

                      {this.state.userRoomData.is_after_photos === 1 && <li><a onClick={this.doThis} className="hide-procedure sign-procedure-class" data-procedureid={this.state.userRoomData.id} data-action="hide">Hide</a></li>}
                    </ul>
                  </div>
                </div> : ""
              }
              { (this.state.action && this.state.action === 'recently-deleted' && this.state.showLoader === false ) ?
                <div className="popup-new-btns popup-new-btns-restore">
                  <button className="header-select-btn confirm-model" data-confirm-url="" data-message={this.state.settingsLang.recently_deleted_restore_msg} onClick={this.handleRestoreModal}>{this.state.settingsLang.recently_deleted_restore}</button>
                </div>
                  : ""
              }
            </div>
            <div className="wide-popup-wrapper time-line">
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
              <div className="settings-subtitle m-b-20">{this.state.languageData.pro_detail_text}</div>
              <div className="timeline-outer row procedure-popup no-margin no-bg">
                <div className="col-md-12 procedure-name-time-top popup-pro-name-outer">
                  <div className="procedure-name-time">
                    <div className="pro-name-section">
                      <a className="modal-link pro-name"><h4>{this.state.procedure_name}</h4></a>
                      {this.state.showLoader === false && <p className="pro-time">{showFormattedDate(this.state.procedure_date, true)}</p>}
                    </div>
                  </div>

                  <h5 className="proc-cost">{
                    (this.state.userRoomData && this.state.userRoomData.invoice_status !== 'draft')
                    ?
                    numberFormat(this.state.userRoomData.total_amount, 'currency') : this.state.languageData.pro_no_invoice_text
                  }</h5>
                </div>
                <div className="col-md-6 timeline-left">
                  <center>
                    <img onClick={(e) => this.openLightbox(0, e, ((this.state.front_pdf_image !== "") ? this.state.front_pdf_image_url : ((this.state.patient_image_front_url) ? this.state.patient_image_front_url : this.state.def_no_image_vertical)))} src={(this.state.front_pdf_image_thumb_url) ? this.state.front_pdf_image_thumb_url : ((this.state.patient_image_front_thumb_url) ? this.state.patient_image_front_thumb_url : this.state.def_no_image_vertical)}></img>
                  </center>

                    <div className="tracbi-outer text-left">
                      <div className="provder-md">
                        <h5><label className="popup-input-field-name">{this.state.languageData.pro_provider_text}</label> <span className="popup-field-box"> {this.state.userFirstName} {this.state.userLastName}</span></h5>
                        <h5><label className="popup-input-field-name">{this.state.languageData.pro_provider_signed_on_text} </label> <span className="popup-field-box">{(this.state.provider_signed_on !== null && this.state.provider_signed_on !== '' && this.state.provider_signed_on !== "0000-00-00 00:00:00") ? showFormattedDate(this.state.provider_signed_on, true) : this.state.languageData.pro_not_signed_yet_text}</span></h5>
                        <h5><label className="popup-input-field-name">{this.state.languageData.pro_md_signed_on_text} </label> <span className="popup-field-box">{(this.state.md_signed_on !== null && this.state.md_signed_on !== '' && this.state.md_signed_on !== "0000-00-00 00:00:00") ? showFormattedDate(this.state.md_signed_on, true)  : this.state.languageData.pro_not_signed_yet_text}</span></h5>
                      </div>
                    </div>

                </div>
                <div className="col-md-6 timeline-right">
                  <div className="carousel slide" data-ride="carousel" data-interval="false">
                    <div className="carousel-inner">

                      <div className="item active">
                        <div className="right-images">
                          <div className="images-half">
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.left_pdf_image_45_url !== "") ? this.state.left_pdf_image_45_url : ((this.state.patient_image_left_45_url !== '' ) ? this.state.patient_image_left_45_url : this.state.def_no_image_vertical)))} src={(this.state.left_pdf_image_45_thumb_url) ? this.state.left_pdf_image_45_thumb_url : ((this.state.patient_image_left_45_thumb_url) ? this.state.patient_image_left_45_thumb_url : this.state.def_no_image_vertical)}></img>
                          </div>
                          <div className="images-half pull-right">
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.right_pdf_image_45_url !== "") ? this.state.right_pdf_image_45_url : ((this.state.patient_image_right_45_url !== '' ) ? this.state.patient_image_right_45_url : this.state.def_no_image_vertical)))} src={(this.state.right_pdf_image_45_thumb_url) ? this.state.right_pdf_image_45_thumb_url : ((this.state.patient_image_right_45_thumb_url) ? this.state.patient_image_right_45_thumb_url : this.state.def_no_image_vertical)}></img>
                          </div>

                          <div className={(this.state.type !== 'coolsculpting') ? "images-full" : "images-full no-display"}>
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.procedure_image_45_url !== "") ? this.state.procedure_image_45_url : this.state.def_no_image_horizontal))} src={(this.state.procedure_image_45_thumb_url !== "") ? this.state.procedure_image_45_thumb_url : this.state.def_no_image_horizontal}></img>
                          </div>
                        </div>
                      </div>
                      <div className="item">
                        <div className="right-images">
                          <div className="images-half">
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.left_pdf_image_url !== "") ? this.state.left_pdf_image_url : ((this.state.patient_image_left_url !== '' ) ? this.state.patient_image_left_url : this.state.def_no_image_vertical)))} src={(this.state.left_pdf_image_thumb_url) ? this.state.left_pdf_image_thumb_url : ((this.state.patient_image_left_thumb_url) ? this.state.patient_image_left_thumb_url : this.state.def_no_image_vertical)}></img>
                          </div>
                          <div className="images-half pull-right">
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.right_pdf_image_url !== "") ? this.state.right_pdf_image_url : ((this.state.patient_image_right_url !== '' ) ? this.state.patient_image_right_url : this.state.def_no_image_vertical)))} src={(this.state.right_pdf_image_thumb_url) ? this.state.right_pdf_image_thumb_url : ((this.state.patient_image_right_thumb_url) ? this.state.patient_image_right_thumb_url : this.state.def_no_image_vertical)}></img>
                          </div>

                          <div className={(this.state.type !== 'coolsculpting') ? "images-full" : "images-full no-display"}>
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.procedure_image_url !== "") ? this.state.procedure_image_url : this.state.def_no_image_vertical))} src={(this.state.procedure_image_thumb_url !== "") ? this.state.procedure_image_thumb_url : this.state.def_no_image_horizontal}></img>
                          </div>
                        </div>
                      </div>
                      {(this.state.type === 'coolsculpting') && <div className={"item"}>
                        <div className="right-images">
                          <div className="images-half">
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.back_pdf_image_left_45_url !== "") ? this.state.back_pdf_image_left_45_url : ((this.state.patient_image_back_left_45_url !== '' ) ? this.state.patient_image_back_left_45_url : this.state.def_no_image_vertical)))} src={(this.state.back_pdf_image_left_45_thumb_url) ? this.state.back_pdf_image_left_45_thumb_url : ((this.state.patient_image_back_left_45_thumb_url) ? this.state.patient_image_back_left_45_thumb_url : this.state.def_no_image_vertical)}></img>
                          </div>
                          <div className="images-half pull-right">
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.back_pdf_image_right_45_url !== "") ? this.state.back_pdf_image_right_45_url : ((this.state.patient_image_back_right_45_url !== '' ) ? this.state.patient_image_back_right_45_url : this.state.def_no_image_vertical)))} src={(this.state.back_pdf_image_right_45_thumb_url) ? this.state.back_pdf_image_right_45_thumb_url : ((this.state.patient_image_back_right_45_thumb_url) ? this.state.patient_image_back_right_45_thumb_url : this.state.def_no_image_vertical)}></img>
                          </div>
                          <div className="images-full">
                              <img onClick={(e) => this.openLightbox(0, e, ((this.state.back_pdf_image_url !== "") ? this.state.back_pdf_image_url : ((this.state.patient_image_back_url !== '' ) ? this.state.patient_image_back_url : this.state.def_no_image_horizontal)))} src={(this.state.back_pdf_image_thumb_url) ? this.state.back_pdf_image_thumb_url : ((this.state.patient_image_back_thumb_url) ? this.state.patient_image_back_thumb_url : this.state.def_no_image_horizontal)}></img>
                          </div>
                        </div>
                      </div>}
                    </div>
                  </div>
                  <div className="trac-right-btn-outer">

                    <a className="line-btn pull-right" onClick={this.runCarousel}>{this.state.languageData.pro_more_photo_text} ({this.state.total_image_count})</a>

                  </div>

                  <div className="timeline-detail">
                    <h4>{this.state.languageData.pro_treat_summary_text}</h4>
                    <ul className="treat-sumry profile-treat-sumry no-padding">

                    {
                      this.state.userRoomData.injection_array !== undefined && this.state.userRoomData.injection_array.map((injobj, injidx) => {
                        return (
                          <li key={injidx}>
                            <label>{injobj.product_name}</label> <span>{(injobj.quantity) ? numberFormat(injobj.quantity, 'decimal', 1) : ''} {injobj.unit}</span>
                          </li>
                          )
                        }
                      )
                    }

                    {
                      (this.state.type === 'laser' || this.state.type === 'coolsculpting') && this.state.userRoomData.procedure_information !== undefined && this.state.userRoomData.procedure_information.map((pojobj, poidx) => {
                        return (
                          <li key={poidx}>
                            <label>{pojobj.field}</label> <span>{(pojobj.value && isNumber(pojobj.value)) ? numberFormat(pojobj.value, 'decimal') : pojobj.value} {pojobj.unit}</span>
                          </li>
                          )
                        }
                      )
                    }

                    {(this.state.type !== 'laser' && this.state.type !== 'coolsculpting') && !this.state.userRoomData.injection_array && <li><label className="sorry-no-record">{this.state.languageData.pro_sory_no_record_text}</label></li>}

                    {((this.state.type === 'laser' || this.state.type === 'coolsculpting') && (this.state.userRoomData.injection_array == undefined && this.state.userRoomData.procedure_information !== undefined && this.state.userRoomData.procedure_information.length === 0)) && <li>
                      <label className="sorry-no-record">{this.state.languageData.pro_sory_no_record_text} </label>
                    </li>}

                    </ul>
                    </div>

                </div>
              </div>
              <div className={traceClass}>
                <div className="settings-subtitle m-b-20">{/*this.state.languageData.pro_trace_detail_text*/}</div>
                {(this.state.roomType === 'provider-room' && this.state.action === 'pending' && checkIfPermissionAllowed('manage-tracebility-info')) && <div className="settings-subtitle m-b-20">{this.state.languageData.pro_trace_detail_text} <a onClick={() => this.viewTraceAbility()} className="new-blue-btn pull-right">{this.state.languageData.pro_update_trace_info}</a></div>}
                {(this.state.injections !== null && this.state.injections !== '' && this.state.injections.length > 0) ? traceInjectionData : <p className="no-record">{this.state.languageData.pro_no_injection_text}</p>  }
              </div>

              <div className={(this.state.showSignModal) ? 'modalOverlay' : 'modalOverlay no-display'}>
              	<div className="small-popup-outer">
              		<div className="small-popup-header">
              			<div className="popup-name">{(this.state.roomType && this.state.roomType === 'provider-room' && this.state.action && this.state.action === 'pending') ? this.state.languageData.pro_sign_and_send_text : this.state.languageData.pro_popup_md_consent_text}</div>
              			<a onClick={this.dismissSignModal} className="small-cross">×</a>
              		</div>

                  <div className="juvly-container">
                    {(this.state.roomType && this.state.roomType === 'provider-room' && this.state.action && this.state.action === 'pending' && this.state.isConsentRequired) ? <div>
                      <div className="settings-subtitle signature-subtitle">{this.state.languageData.pro_please_select_md}</div>
                      <select name="md_id" className="setting-select-box" onChange={this.handleInputChange} value={this.state.md_id}>
                      {optData}
                      </select>
                    </div> : ""}

            				<div className="settings-subtitle signature-subtitle">{this.state.languageData.pro_please_sign_text}:</div>
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
            					<input className="pull-left sel-all-visible" type="checkbox" name="save_sign" onChange={this.handleInputChange}/>
            					<label className="search-text" htmlFor="save_sign">{this.state.languageData.pro_save_sig_text}</label>
            				</div>

            				<div className="img-src change-sig">
                      <div className="pull-left">
                        <button type="button" id="change" onClick={this.clearCanvas} className={this.state.changeClass}>{this.state.languageData.pro_change_text}</button>
                      </div>
                      <div className="pull-left">
                        <button type="button" id="change1" onClick={this.clear} className={this.state.clearClass}>{this.state.languageData.pro_clear_text}</button>
                      </div>
                      <div className="pull-left">
                        <button type="button" id="change2" onClick={this.handleClearReset} className={this.state.resetClass}>{this.state.languageData.pro_reset_text}</button>
                      </div>
                      <div className="pull-left">
                        {/*<button type="button" id="change3" onClick={this.saveSignature} className={this.state.resetClass}>Save Signature</button>*/}
                      </div>
            				</div>
            			</div>
                  <div className="footer-static">
            				<a id="saveConsultation" onClick={this.signThis} className="new-blue-btn pull-right">{(this.state.roomType && this.state.roomType === 'provider-room' && this.state.action && this.state.action === 'pending') ?  this.state.languageData.pro_btn_sign_and_send_text : this.state.languageData.pro_text_sgn}</a>
            			</div>
              	</div>
              </div>

              <div className={(this.state.showConfirmModal) ? 'overlay' : ''}></div>
              <div id="filterModal" role="dialog" className={(this.state.showConfirmModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissConfirmationModal}>×</button>
                      <h4 className="modal-title">{this.state.globalLang.delete_confirmation}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.languageData.pro_incomplete_sign_confirmation_text}
                    </div>
                    <div className="modal-footer">
                      <div className="col-md-12 text-left">

                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissConfirmationModal}>{this.state.languageData.pro_no_text}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.confirmAndOpen}>{this.state.languageData.pro_yes_text}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={(this.state.showDeleteModal) ? 'overlay' : ''}></div>
              <div id="filterModal" role="dialog" className={(this.state.showDeleteModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissDeleteModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.languageData.pro_delete_confirmation_text}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.languageData.pro_are_you_sure_text}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">

                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissDeleteModal}>{this.state.languageData.pro_no_text}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteNote}>{this.state.languageData.pro_yes_text}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={notesClass}>{this.state.languageData.pro_notes_text}
                  <a onClick = {this.openNotes.bind(this)} className="new-blue-btn pull-right">{this.state.languageData.pro_add_edit_note_text}</a>
              </div>
              <div className={noRecordClass}>{this.state.languageData.pro_no_notes_text}</div>
              <div className={noteTimelineClass}>
              {
                this.state.userRoomData.procedure_notes !== undefined && this.state.userRoomData.procedure_notes.map((noteobj, noteidx) => {
                  return (
                    <div className="row" key={noteidx}>
                      <div className="circle" />
                      <div className="col-sm-4 col-xs-12 note-subject">
                        <h4>{noteobj.user.firstname} {noteobj.user.lastname} {this.state.languageData.pro_left_a_note_text}</h4>
                        <p>{showFormattedDate(noteobj.created , true)}</p>
                      </div>
                      <div className="col-sm-6 col-xs-12" id="note-content">
                        <div className="note-content">{noteobj.notes}<br />
                        {
                          (noteobj.hashtags) && noteobj.hashtags.split(',').map((hashObj, hashIdx) => {
                              return(
                                <span key={hashIdx} className="hashTag">{hashObj} </span>
                              )
                          })
                        }

                        </div>
                        <textarea className="no-display" defaultValue="" />
                      </div>
                      <div className="col-sm-2 col-xs-12 no-padding">
                        {
                        (checkIfPermissionAllowed('add-edit-procedure-notes') && this.getLoggedInUserData() === noteobj.user.id ) ? <a onClick={() => this.editNote(noteobj.id)} id="edit-note" className="easy-link">Edit</a> : `` }

                        {(checkIfPermissionAllowed('add-edit-procedure-notes') && this.getLoggedInUserData() === noteobj.user.id) ? <a id="delete-note" className="easy-link" name={noteobj.id} onClick={this.showDeleteModal.bind(this)}>{this.state.languageData.pro_del_btn_text}</a> : ``}
                      </div>
                    </div>
                    );
                })}
              </div>
            </div>
            <div className={ this.state.showLoader ? "new-loader text-left displayBlock proDetailLoader" : "new-loader text-left" } >
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
              </div>
            </div>
          </div>
          {/* Resotre Modal - START */}
          <div className={(this.state.isShowDeletedModal) ? 'overlay' : ''} ></div>
          {(this.props.match.params.type != undefined && this.props.match.params.type == 'recently-deleted') &&
          <div id="filterModal" role="dialog" className={(this.state.isShowDeletedModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.handleRestoreModal}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.globalLang.delete_confirmation}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.settingsLang.recently_deleted_restore_msg}</div>
                <div className="modal-footer">
                  <div className="col-md-12 text-left" id="footer-btn">
                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.handleRestoreModal}>{this.state.globalLang.label_no}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.restoreSelected}>{this.state.globalLang.label_yes}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          }
          {/* Resotre Modal - END */}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "userRoomData_LIST") {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    if(state.SettingReducer.data.status === 200){
      return {
        userRoomData: state.SettingReducer.data,
      }
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    return {};
  } else if ( state.SettingReducer.action === 'SETTING_DELETE_PROCEDURE_NOTE' ) {
    toast.dismiss();

    if ( state.SettingReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      return {
        deleteNoteData: state.SettingReducer.data,
      }
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        deleteNoteData: state.SettingReducer.data,
      }
    }
    return {}
  } else if ( state.SettingReducer.action === 'SIGN_PROCEDURE' ) {
    toast.dismiss();

    if ( state.SettingReducer.data.status !== 201 ) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        userRoomData: state.SettingReducer.data,
      }
    }
    return {}
  } else if (state.SettingReducer.action === "MARK_UNMARK_AFTER_PHOTOS") {
    toast.dismiss();

    if (state.SettingReducer.data.status === 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        userRoomData: state.SettingReducer.data
      }
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    return {};
  } else if (state.SettingReducer.action === "HIDE_MARK_AFTER_PHOTOS") {
    toast.dismiss();

    if (state.SettingReducer.data.status === 201) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        userRoomData: state.SettingReducer.data
      }
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    return {};
  } else if ( state.SettingReducer.action === 'MDS_LIST' ) {
    toast.dismiss();

    if ( state.SettingReducer.data.status !== 200 ) {
    //  toast.error(languageData.global[state.SettingReducer.data.message]);
    } else {
      return {
        mdList: state.SettingReducer.data.data
      }
    }
    return {}
  } else if (state.SettingReducer.action === "RECENTLY_DELETED_RESTORE") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      return {showLoader:false}
    } else {
      return {
        message: languageData.global[state.SettingReducer.data.message],
        redirectToDeleted: true
      }
    }
  } else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchUserRoomData: fetchUserRoomData, deleteProcedureNote: deleteProcedureNote, signProcedure: signProcedure, markUnmarkAsAfterPhotos: markUnmarkAsAfterPhotos, hidemarkAsAfter: hidemarkAsAfter, fetchSelectMD: fetchSelectMD,restoreRecentlyDeleted:restoreRecentlyDeleted }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProcedureDetail));
