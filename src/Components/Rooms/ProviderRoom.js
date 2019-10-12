import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchProviderRoomData, markUnmarkAsAfterPhotos, hidemarkAsAfter, signProcedure, fetchSelectMD, exportEmptyData } from '../../Actions/Settings/settingsActions.js';
import { withRouter } from 'react-router';
import { getUser, checkIfPermissionAllowed, numberFormat, isNumber,autoScrolling } from '../../Utils/services.js';
import { SketchField, Tools } from 'react-sketch';
import config from '../../config';
import axios from 'axios';
import {showFormattedDate, displayName} from '../../Utils/services.js';

const providerRoomInstance = axios.create();

class ProcedureList extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData          = JSON.parse(localStorage.getItem('userData'));
    const languageData      = JSON.parse(localStorage.getItem('languageData'))
    let isConsentRequired   = userData.user.is_md_consent_required;
    let showSigPopup        = userData.user.show_signature_popup;
    let mdUserID            = userData.user.md_user_id;

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
      loadMore: true,
      startFresh: true,
      showLoader: false,
      page: 1,
      pagesize: 15,
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      procedure_name: '',
      procedure_date: '',
      consent_ids: '',
      patient: [],
      user: [],
      searchFunction: '',
      injection_array: [],
      user_changed: false,
      procedureData: {},
      MDRoomData: [],
      data: [],
      childCheck: false,
      action: props.match.params.type,
      total: '',
      selectVisible: 'right-sign-btn',
      selectHide: 'right-sign-btn no-display',
      spanHide: 'search-text no-display',
      spanVisible: 'search-text',
      hideHeading: 'table-checkbox table-updated-th no-display',
      showHeading: 'table-checkbox table-updated-th ',
      roomTextData: languageData.rooms,
      clinic_name: '',
      contact_no: '',
      address: '',
      clinic_business_hours: [],
      id: userData.user.id,
      tax: '',
      clinicList: [],
      sortorder: 'asc',
			scopes: 'business_hours',
      tabClicked: false,
      roomType: this.props.match.url.split('/')[1],
      globalLang: languageData.global,
      settingLang: languageData.settings,
      procedureLang      : languageData.procedure,
      showLoadingText : false,
      showDeleteModal: false,
      procedureToSign: 0,
      showSignModal: false,
      canvasClass : "signature-box sig-div",
      inputOut    : 'input-outer',
      clearClass  : 'new-white-btn no-margin clear no-display',
      resetClass  : 'new-blue-btn reset no-display',
      changeClass : 'new-blue-btn no-margin Change',
      uploadedSignature: '',
      uploadedSignature_url:'',
      save_sign: false,
      listAction: '',
      mdList: [],
      md_id: (mdUserID) ? mdUserID : 0,
      isConsentRequired: (isConsentRequired) ? isConsentRequired : 0,
      showSigPopup:(showSigPopup) ? 1 : 0,
      defTimeLine:(defTimeLine) ? defTimeLine : 'cosmetic',
      defTimeLineTabClicked:false
    };

    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    this.props.exportEmptyData({});
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  handleAnchor = (event) => {
    let action = event.target.dataset.action;
    this.props.history.push(`/${this.state.roomType}/${action}`);
    if (this.state.action != action) {
        let formData = {
          'params': {
            page: 1,
            pagesize: this.state.pagesize,
            sortorder: "asc",
            term: "",
            action: action,
            procedure_type: this.state.defTimeLine
          }
        };
        if ( action === 'pending' ) {
          this.props.fetchSelectMD();
        }
        this.setState({ tabClicked: true, MDRoomData: [], startFresh : true, 'showLoader': true, page: 1, sortorder: "asc", term: "", next_page_url: "", action: action });
        autoScrolling(true)
        this.props.fetchProviderRoomData(formData);
    }
  }


  componentDidMount() {
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: "asc",
        term: this.state.term,
        action: this.state.action,
        procedure_type: this.state.defTimeLine
      }
    };
    this.setState({ 'showLoader': true });
    autoScrolling(true)
    this.props.fetchProviderRoomData(formData);
    if ( this.state.action === 'pending' ) {
      this.props.fetchSelectMD();
    }
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  changeTimelinePref = (type,event) => {
     localStorage.setItem('sortOnly', true);
      this.setState({defTimeLine: type})
      localStorage.setItem("defTimeLine", type);
      let formData = {
        'params': {
          page: 1,
          pagesize: this.state.pagesize,
          sortorder: "asc",
          term: '',
          action: this.state.action,
          procedure_type: type
        }
      };
      this.setState({
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: "asc",
        startFresh: true,
        loadMore: true,
        next_page_url: "",
        MDRoomData: [],
        term:'',
        defTimeLineTabClicked: true
      });
      this.setState({ 'showLoader': true });
      autoScrolling(true)
      this.props.fetchProviderRoomData(formData);

  }

  handleSubmit = (event,defTimeLine) => {
    event.preventDefault();
		localStorage.setItem('sortOnly', true);
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
				term: this.state.term,
        action: this.state.action,
        procedure_type: (defTimeLine) ? defTimeLine : this.state.defTimeLine
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: this.state.sortorder == "asc" ? "desc" : "asc",
      startFresh: true,
      loadMore: true,
      next_page_url: "",
      MDRoomData: []
    });
    this.setState({ 'showLoader': true });
    autoScrolling(true)
    this.props.fetchProviderRoomData(formData);
  };

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true });
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : '',
  				term: this.state.term,
          action: this.state.action,
          procedure_type: this.state.defTimeLine
        }
      };
      autoScrolling(true)
      this.props.fetchProviderRoomData(formData);
    }
  };

    static getDerivedStateFromProps(nextProps, prevState) {
      if (prevState.tabClicked === true) {
        return {
          tabClicked: false,
          MDRoomData: [],
        }
      }

      if (prevState.defTimeLineTabClicked === true) {
        return {
          page: 1,
          sortorder: "asc",
          startFresh: true,
          loadMore: true,
          next_page_url: "",
          MDRoomData: [],
          term:'',
          defTimeLineTabClicked: false
        }
      }


      if (nextProps.MDRoomData === undefined && nextProps.mdList !== undefined && nextProps.mdList !== prevState.mdList && nextProps.mdList.length > 0) {
        let mdID = (prevState.md_id) ? prevState.md_id : nextProps.mdList[0].id;

        return {
          mdList : nextProps.mdList,
          md_id: mdID
        }
      }

      if (
        nextProps.MDRoomData != undefined  && nextProps.MDRoomData.procedures !== undefined &&
        (nextProps.MDRoomData.procedures.next_page_url !== prevState.next_page_url || nextProps.MDRoomData.action != prevState.action )
      ) {
        let returnState = {};
        if(nextProps.MDRoomData.login_user){
          if(nextProps.MDRoomData.login_user.is_md_consent_required !== undefined){
            returnState.isConsentRequired = (nextProps.MDRoomData.login_user.is_md_consent_required) ? 1 : 0
          }
          if(nextProps.MDRoomData.login_user.show_signature_popup !== undefined){
            returnState.showSigPopup = (nextProps.MDRoomData.login_user.show_signature_popup) ? 1 : 0
          }
        }
        if (prevState.next_page_url == null && nextProps.MDRoomData.action == prevState.action) {
          autoScrolling(false)
          return (returnState.next_page_url = null);
        }
        if ((prevState.MDRoomData.length == 0 && prevState.startFresh == true) ) {
          if (localStorage.getItem("sortOnly") == "false") {
            returnState.MDRoomData = nextProps.MDRoomData.procedures.data;
            if(nextProps.MDRoomData.procedures.next_page_url != null){
              returnState.page = 2;//prevState.page + 1;
            } else {
              returnState.next_page_url = nextProps.MDRoomData.procedures.next_page_url;
            }
            returnState.startFresh      = false;
            returnState.showLoader      = false;
            returnState.action          = nextProps.MDRoomData.action;
            returnState.total           = nextProps.MDRoomData.procedures.total;
            returnState.injection_array = nextProps.MDRoomData.procedures.injection_array;
            returnState.showLoadingText = false;

            returnState.showSignModal         = false;
            returnState.canvasClass           = (nextProps.MDRoomData.login_user.signature_url) ?  'signature-box sig-div no-display' : 'signature-box sig-div';
            returnState.inputOut              = (nextProps.MDRoomData.login_user.signature_url) ?  'input-outer' : 'input-outer no-display';
            returnState.clearClass            = (nextProps.MDRoomData.login_user.signature_url) ?  'new-white-btn no-margin clear no-display' : 'new-white-btn no-margin clear';
            returnState.resetClass            = (nextProps.MDRoomData.login_user.signature_url) ?  'new-blue-btn reset no-display' : 'new-blue-btn reset ';
            returnState.changeClass           = (nextProps.MDRoomData.login_user.signature_url) ?  'new-blue-btn no-margin Change' : 'new-blue-btn no-margin Change no-display';
            returnState.uploadedSignature     = '';
            returnState.uploadedSignature_url = '';
            returnState.signature_url         = nextProps.MDRoomData.login_user.signature_url;
            returnState.signature             = nextProps.MDRoomData.login_user.signature;
            returnState.save_sign             = false;
          } else {
            localStorage.setItem("sortOnly", false);
          }
        } else if (
          prevState.MDRoomData != nextProps.MDRoomData.procedures.data &&
          prevState.MDRoomData.length != 0
        ) {
          if ( prevState.tabClicked === false ) {
            returnState.MDRoomData = [
              ...prevState.MDRoomData,
              ...nextProps.MDRoomData.procedures.data
            ];
          } else {
            returnState.tabClicked = false;
          }
          returnState.total = nextProps.MDRoomData.procedures.total;
          returnState.injection_array = nextProps.MDRoomData.procedures.injection_array;
          returnState.page = prevState.page + 1;
          returnState.next_page_url = nextProps.MDRoomData.procedures.next_page_url;
          returnState.action = nextProps.MDRoomData.action;
          returnState.showLoader = false;
          returnState.showLoadingText = false;

          returnState.showSignModal         = false;
          returnState.canvasClass           = (nextProps.MDRoomData.login_user.signature_url) ?  'signature-box sig-div no-display' : 'signature-box sig-div';
          returnState.inputOut              = (nextProps.MDRoomData.login_user.signature_url) ?  'input-outer' : 'input-outer no-display';
          returnState.clearClass            = (nextProps.MDRoomData.login_user.signature_url) ?  'new-white-btn no-margin clear no-display' : 'new-white-btn no-margin clear';
          returnState.resetClass            = (nextProps.MDRoomData.login_user.signature_url) ?  'new-blue-btn reset no-display' : 'new-blue-btn reset ';
          returnState.changeClass           = (nextProps.MDRoomData.login_user.signature_url) ?  'new-blue-btn no-margin Change' : 'new-blue-btn no-margin Change no-display';
          returnState.uploadedSignature     = '';
          returnState.uploadedSignature_url = '';
          returnState.signature_url         = nextProps.MDRoomData.login_user.signature_url;
          returnState.signature             = nextProps.MDRoomData.login_user.signature;
          returnState.save_sign             = false;
          returnState.showLoadingText       = false;
        }
        autoScrolling(false)
        return returnState;
      }
      return null;
    }

    userEdit=( id )=> {
      if(this.state.defTimeLine === 'health') {
        return (
          <div>
            {this.props.history.push(`/${this.state.roomType}/procedure-health-detail/${id}/${this.state.action}`)}
          </div>
        );
      } else {
        return (
          <div>
            {this.props.history.push(`/${this.state.roomType}/procedure-detail/${id}/${this.state.action}`)}
          </div>
        );;
      }
    }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.startFresh) {
      return true;
    }

    if (this.state.loadMore) {
      return true;
    }

    if (this.state.showLoader) {
      return true;
    }
    return false;
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
            page: 1,
            pagesize: this.state.pagesize,
            sortorder: "asc",
            term: '',
            action: this.state.action,
            procedure_type: this.state.defTimeLine
          }
        };
        autoScrolling(true)
        this.props.markUnmarkAsAfterPhotos(formData, prodeureID, listData, this.state.roomType, 'list')

        this.setState({
          tabClicked: true,
          MDRoomData: [],
          startFresh : true,
          showLoader: true,
          page: 1,
          sortorder: "asc",
          term: "",
          next_page_url: ""
        })
      }

      if ( action === "hide" ) {
        let listData = {
          'params': {
            page: 1,
            pagesize: this.state.pagesize,
            sortorder: "asc",
            term: '',
            action: this.state.action,
            procedure_type: this.state.defTimeLine
          }
        };
        autoScrolling(true)
        this.props.hidemarkAsAfter(prodeureID, listData, this.state.roomType, 'list', 0)

        this.setState({
          tabClicked: true,
          MDRoomData: [],
          startFresh : true,
          showLoader: true,
          page: 1,
          sortorder: "asc",
          term: "",
          next_page_url: ""
        })
      }
      if ( action === "incompletesign" || action === "markconsult" || action === "completesign" ) {
        if ( action === "incompletesign" ) {
          this.setState({procedureToSign: prodeureID, showDeleteModal: true, listAction: action})
        } else {
          if ( !this.state.showSigPopup ) {
            if ( this.state.signature_url ) {
              this.saveWithoutSign(prodeureID, action);
            } else {
              this.setState({procedureToSign: prodeureID, showSignModal: true, listAction: action})
            }
          } else {
            this.setState({procedureToSign: prodeureID, showSignModal: true, listAction: action})
          }
        }
      }
    }
  }

  saveWithoutSign = (prodeureID, action) => {
    let procedureID = prodeureID;
    let listAction  = action;
    let listConsult = 0
    let mdID        = this.state.md_id

    if ( listAction === 'markconsult' ) {
      listConsult = 1;
    }

    if (this.state.signature_url !== "") {
      let formData = {
        current_procedure_id  : procedureID,
        procedure_ids         : [procedureID],
        signature             : this.state.signature,
        signature_saved       : (this.state.save_sign) ? 1 : 0,
        is_consult            : listConsult,
        md_user_id            : mdID
      };


      let listData = {
        'params': {
          page: 1,
          pagesize: this.state.pagesize,
          sortorder: "asc",
          term: this.state.term,
          action: this.props.match.params.type,
          procedure_type: this.state.defTimeLine
        }
      };
      autoScrolling(true);
      this.props.signProcedure(formData, true, listData, this.state.roomType, 'list');

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
        tabClicked: true,
        MDRoomData: [],
        startFresh : true,
        showLoader: true,
        page: 1,
        sortorder: "asc",
        term: "",
        next_page_url: ""
      })
    }
  }

  dismissConfirmationModal = () => {
     this.setState({showDeleteModal: false, procedureToSign: 0, listAction: ''})
  }

  dismissSignModal = () => {
     this.setState({showSignModal: false, procedureToSign: 0, listAction: ''})
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

  confirmAndOpen = () => {
    if ( !this.state.showSigPopup ) {
      if ( this.state.signature_url ) {
        this.setState({showDeleteModal: false});
        this.saveWithoutSign(this.state.procedureToSign, this.state.listAction);
      } else {
        this.setState({showDeleteModal: false, showSignModal: true})
      }
    } else {
      this.setState({showDeleteModal: false, showSignModal: true})
    }
  }

    componentWillUnmount() {
      this.props.exportEmptyData({});
    }

  signThis = () => {

    if ( (this._sketch && this._sketch.toJSON().objects.length === 0 && this.state.canvasClass.indexOf('no-display') === -1) || (this.state.canvasClass.indexOf('no-display') > 0 && this.state.signature_url === '' ) ) {
      toast.error(this.state.globalLang.validation_md_signature_required_if)
    } else {
      let procedureID = this.state.procedureToSign;
      let listAction  = this.state.listAction;
      let listConsult = 0
      let mdID        = this.state.md_id

      if ( listAction === 'markconsult' ) {
        listConsult = 1;
      }

      if (this.state.signature_url !== "" && this.state.canvasClass.indexOf('no-display') > 0) {
        let formData = {
          current_procedure_id  : procedureID,
          procedure_ids         : [procedureID],
          signature             : this.state.signature,
          signature_saved       : (this.state.save_sign) ? 1 : 0,
          is_consult            : listConsult,
          md_user_id            : mdID
        };

        if (!this.state.isConsentRequired) {
          delete formData.md_user_id;
        }

        let listData = {
          'params': {
            page: 1,
            pagesize: this.state.pagesize,
            sortorder: "asc",
            term: this.state.term,
            action: this.props.match.params.type,
            procedure_type: this.state.defTimeLine
          }
        };
        autoScrolling(true)
        this.props.signProcedure(formData, true, listData, this.state.roomType, 'list');

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
          tabClicked: true,
          MDRoomData: [],
          startFresh : true,
          showLoader: true,
          page: 1,
          sortorder: "asc",
          term: "",
          next_page_url: ""
        })
      } else {
        providerRoomInstance.post(config.API_URL + "upload/signature", ({image_data : this._sketch.toDataURL(), upload_type: 'signatures'})).then(response => {
            if ( response.data && response.data.status === 200 ) {
              let formData = {
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

              let listData = {
                'params': {
                  page: 1,
                  pagesize: this.state.pagesize,
                  sortorder: "asc",
                  term: this.state.term,
                  action: this.props.match.params.type,
                  procedure_type: this.state.defTimeLine
                }
              };
              autoScrolling(true)
              this.props.signProcedure(formData, true, listData, this.state.roomType, 'list');

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
                tabClicked: true,
                MDRoomData: [],
                startFresh : true,
                showLoader: true,
                page: 1,
                sortorder: "asc",
                term: "",
                next_page_url: ""
              })
            }
        }).catch(error => {
            toast.error(this.state.roomTextData.signature_upload_error_text)
        })
      }
    }
  }
  procedureQuestionnaireEdit=( id )=> {
    //localStorage.setItem('userID', id)

    return (
      <div>
        {this.props.history.push(`/${this.state.roomType}/questionnaire/${id}/${this.state.action}`)}
      </div>
    );
  }

  procedurePrescriptionEdit = (id) => {
    return (
      <div>
        {this.props.history.push(`/${this.state.roomType}/prescription/${id}/${this.state.action}`)}
      </div>
    );
  }
  procedureConsentsEdit=( id )=> {
    //localStorage.setItem('userID', id)
    return (
      <div>
        {this.props.history.push(`/${this.state.roomType}/consent/${id}/${this.state.action}`)}
      </div>
    );
  }
  render() {
    let optData    = '';

    if ( this.state.mdList !== undefined && this.state.mdList.length > 0 ) {

      optData = this.state.mdList.map((mdObj, mdidx) => {

         return <option key={mdidx} value={mdObj.id}>{(mdObj.firstname && mdObj.firstname != undefined) ? mdObj.firstname : ''} {(mdObj.lastname && mdObj.lastname != undefined) ? mdObj.lastname : ''}</option>;
     })
    }


    return (
      <div id="content" className="fullscreen">
  <div className="container-fluid content setting-wrapper">

  <div className={(this.state.showSignModal) ? 'modalOverlay' : 'modalOverlay no-display'}>
    <div className="small-popup-outer">
      <div className="small-popup-header">
        <div className="popup-name">{this.state.roomTextData.room_sign_and_send_text}</div>
        <a onClick={this.dismissSignModal} className="small-cross">×</a>
      </div>
      <div className="juvly-container">
      {(this.state.isConsentRequired === 1) && <div><div className="settings-subtitle signature-subtitle">{this.state.procedureLang.pro_please_select_md}</div>
      <select name="md_id" id="md_id" className="setting-select-box" onChange={this.handleInputChange} value={this.state.md_id}>
      {optData}
      </select></div>}

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
          <div className={this.state.inputOut} style={{background: '#fff none repeat scroll 0 0', minHeight: '200px'}}>
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
        <a onClick={this.signThis} className="new-blue-btn pull-right">{this.state.roomTextData.room_btn_sign_and_send_text}</a>
      </div>
    </div>
  </div>

    <ul className="sub-menu">
      <li><a name="pendingProcedures" className={(this.state.action === 'pending') ? "active" : ''} data-action='pending' onClick ={this.handleAnchor.bind(this)} >{this.state.roomTextData.chart_audit_text}</a></li>
      <li><a name="signedProcedures" className={this.state.action === 'signed' ? "active" : ''} data-action='signed' onClick ={this.handleAnchor.bind(this)}>{this.state.roomTextData.signed_pro_text}</a></li>

      <li><a name="sendTOMDProcedures" className={this.state.action === 'sent-to-md' ? "active" : ''} data-action='sent-to-md' onClick ={this.handleAnchor.bind(this)}>{this.state.roomTextData.sent_to_md_text}</a></li>
      <li><a name="signedByMDProcedures" className={this.state.action === 'signed-by-md' ? "active" : ''} data-action='signed-by-md' onClick ={this.handleAnchor.bind(this)}>{this.state.roomTextData.signed_by_md_text}</a></li>
    </ul>
    <div className="juvly-section full-width">
      {this.state.showLoader === false && <div className="setting-search-outer">
        <form onSubmit={this.handleSubmit}>
          <div className="search-bg new-search">
            <i className="fas fa-search" />
            <input name ="term" className="setting-search-input chart_search" placeholder={this.state.roomTextData.search_text} value={this.state.term} autoComplete="off" onChange={this.handleInputChange} />
          </div>
        </form>

      </div>}

      <ul className="section-tab-outer submenuWithSearch">
        <li>
          <a href="javascript:void(0);" onClick={this.changeTimelinePref.bind(this,'cosmetic')} id="cosmetic_tab" className={(this.state.defTimeLine === 'cosmetic') ?"section-title-name r section-tab sel-merge-tab" : "section-title-name r section-tab"} data-title="Cosmetic">{this.state.roomTextData.room_cosmetic_timeline}</a>
        </li>
        <li>
          <a href="javascript:void(0);" onClick={this.changeTimelinePref.bind(this,'health')} id="health_tab" className={(this.state.defTimeLine === 'health') ?"section-title-name r section-tab sel-merge-tab" : "section-title-name r section-tab"} data-title="Health">{this.state.roomTextData.room_health_timeline}</a>
        </li>
      </ul>

      <div className={(this.state.showDeleteModal) ? 'overlay' : ''}></div>
      <div id="filterModal" role="dialog" className={(this.state.showDeleteModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" onClick={this.dismissConfirmationModal}>×</button>
              <h4 className="modal-title">{this.state.globalLang.delete_confirmation}</h4>
            </div>
            <div id="errorwindow" className="modal-body add-patient-form filter-patient">
              {this.state.roomTextData.room_incomplete_sign_confirmation_text}
            </div>
            <div className="modal-footer">
              <div className="col-md-12 text-left">

                <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissConfirmationModal}>{this.state.roomTextData.no_text}</button>
                <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.confirmAndOpen}>{this.state.roomTextData.yes_text}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive min-h-200">
        <table className="table-updated setting-table min-w-1000 ajax-view">
          <thead className={(this.state.MDRoomData != '' ) ? "table-updated-thead" : 'no-display'}>
            <tr>
              {(this.state.action === 'sent-to-md' || this.state.action === 'signed-by-md') && <th className={((this.state.action === 'sent-to-md' || this.state.action === 'signed-by-md') && this.state.defTimeLine === 'health') ? "col-xs-3 table-updated-th" : "col-xs-2 table-updated-th"}>{this.state.roomTextData.th_md_name}</th>}
              <th className={((this.state.action === 'sent-to-md' || this.state.action === 'signed-by-md') && this.state.defTimeLine === 'health') ? "col-xs-3 table-updated-th" : "col-xs-2 table-updated-th"}>{this.state.roomTextData.th_pro_info_text}</th>
              <th className="col-xs-2 table-updated-th">{this.state.roomTextData.th_client_text}</th>
              {(this.state.action !== 'pending' && this.state.defTimeLine === 'cosmetic') && <th className="col-xs-2 table-updated-th">{this.state.roomTextData.th_treat_sum_text}</th>}
              {(this.state.action === 'pending' && this.state.defTimeLine === 'cosmetic') && <th className="col-xs-1 table-updated-th">{this.state.roomTextData.th_picture_text}</th>}
              {(this.state.action === 'pending' && this.state.defTimeLine === 'cosmetic') && <th className="col-xs-1 table-updated-th">{this.state.roomTextData.th_traceablity_text}</th>}
              <th className="col-xs-1 table-updated-th">{(this.state.action === 'pending') ? `${this.state.roomTextData.th_notes_text}` : `${this.state.roomTextData.th_latest_note}`}</th>
              <th className="col-xs-1 table-updated-th">{this.state.roomTextData.th_consent_text}</th>
              {(this.state.defTimeLine === 'cosmetic') && <th className="col-xs-1 table-updated-th">{this.state.roomTextData.th_question_text}</th>}
              {(this.state.defTimeLine === 'health') && <th className="col-xs-1 table-updated-th">{this.state.roomTextData.th_prescription_text}</th>}
              {(this.state.action === 'pending' && this.state.defTimeLine === 'cosmetic') && <th className="col-xs-2 table-updated-th">{this.state.roomTextData.th_payment_traxn_text}</th>}
              {(this.state.action === 'pending') && <th className="col-xs-2 table-updated-th">{this.state.roomTextData.th_actions_text}</th>}
              {(this.state.action !== 'pending') && <th className="col-xs-1 table-updated-th no-padding-right">{this.state.roomTextData.th_consult_only_text}</th>}
            </tr>
          </thead>
          <tbody className="patient-list">
          {
            this.state.MDRoomData !== undefined  && this.state.MDRoomData.map((obj, idx) => {
              let isComplete        = 0;
              let signText          = this.state.roomTextData.room_incomplete_sign_anyway;
              let isAfterPhotos     = 1;
              let markAsAfterText   = this.state.roomTextData.room_mark_as_after_photos;
              let isHealthComplete  = 1 //0;

              if ( ( ( obj.procedure_image !== null && obj.procedure_image !== '') || (obj.procedure_image_45 !== null && obj.procedure_image_45 !== '') || obj.type === 'laser' || obj.type === 'coolsculpting' ) && ( obj.trace_injections !== null && obj.trace_injections.length > 0 ) && ( obj.procedure_notes_count !== null && obj.procedure_notes_count > 0 ) && ( obj.consent_ids !== null && obj.consent_ids !== '' ) && ( obj.answers_count > 0 || obj.answer_multiples_count > 0 ) && ( obj.pos_invoices_count !== null && obj.pos_invoices_count > 0 ) ) {
                isComplete = 1;
                signText   = 'Sign';
              }

              if ( obj.is_after_photos === 1 ) {
                isAfterPhotos   = 0;
                markAsAfterText = this.state.roomTextData.room_unmark_as_after_photos;
              }

              if ( (obj.procedure_notes_count !== null && obj.procedure_notes_count > 0 ) && ( obj.consent_ids !== null && obj.consent_ids !== '' ) && (obj.procedure_prescription_count && obj.procedure_prescription_count > 0 )) {
              //  isHealthComplete = 1;
              }

            return (
            <tr className="table-updated-tr md-rooms-checkbox" key={idx}>
              {(this.state.action === 'sent-to-md' || this.state.action === 'signed-by-md') && <td className={((this.state.action === 'sent-to-md' || this.state.action === 'signed-by-md') && this.state.defTimeLine === 'health') ? "col-xs-3 table-updated-td modal-link cursor-pointer" : "col-xs-2 table-updated-td modal-link cursor-pointer"} data-url={obj.id} onClick = {this.userEdit.bind(this, obj.id)}>{(obj.md_user) ? displayName(obj.md_user) : ''}</td>}

              <td className={((this.state.action === 'sent-to-md' || this.state.action === 'signed-by-md') && this.state.defTimeLine === 'health') ? "col-xs-3 table-updated-td modal-link cursor-pointer" : "col-xs-2 table-updated-td modal-link cursor-pointer"} data-url={obj.id} onClick = {this.userEdit.bind(this, obj.id)}>
              <div className="">{(obj.procedure_name) ? obj.procedure_name : "N/A"}</div>
              <div className="pro-date">{(obj.procedure_date) ? showFormattedDate(obj.procedure_date, false) : ""}</div>
              </td>

              <td className="col-xs-2 table-updated-td" onClick = {this.userEdit.bind(this, obj.id)}>{(obj.patient && obj.patient.firstname != undefined) ? obj.patient.firstname : ''} {(obj.patient && obj.patient.lastname != undefined) ? obj.patient.lastname : ''}</td>

              {(this.state.action !== 'pending' && this.state.defTimeLine === 'cosmetic') && <td className="col-xs-1 table-updated-td modal-link" onClick = {this.userEdit.bind(this, obj.id)} >
              {
                obj.injection_array !== undefined && obj.injection_array.map((injobj, injidx) =>
                {
                  return (
                    <div key={injidx}>
                      <b>{injobj.product_name}</b> {(injobj.quantity) ? numberFormat(injobj.quantity) : ''} {injobj.unit}
                    </div>
                  )
                }
                )
              }
              {
                ((obj.type === 'laser' || obj.type === 'coolsculpting') && obj.procedure_information) && obj.procedure_information.map((pojobj, poidx) => {
                  return (
                    <div key={poidx}>
                      <b>{pojobj.field}</b> {(pojobj.value && isNumber(pojobj.value)) ? numberFormat(pojobj.value, 'decimal') : pojobj.value} {pojobj.unit}
                    </div>
                    )
                  }
                )
              }
              </td> }

              {(this.state.action === 'pending' && this.state.defTimeLine === 'cosmetic') && <td className="col-xs-1 table-updated-td" title={this.state.roomTextData.th_picture_text}>
                  {( ( obj.procedure_image !== null && obj.procedure_image !== '') || (obj.procedure_image_45 !== null && obj.procedure_image_45 !== '') || obj.type === 'laser' || obj.type === 'coolsculpting' ) ? (
                    <img src={require('../../images/green-check.png')} />
                ) : ( <img src={require('../../images/red-cross.png')} /> ) }
              </td>}

              {(this.state.action === 'pending' && this.state.defTimeLine === 'cosmetic') && <td className="col-xs-1 table-updated-td" title={this.state.roomTextData.th_traceablity_text}>
                  {( obj.trace_injections !== null && obj.trace_injections.length > 0 ) ? (
                    <img src={require('../../images/green-check.png')} />
                ) : ( <img src={require('../../images/red-cross.png')} /> ) }
              </td>}

              <td className="col-xs-1 table-updated-td" title={(this.state.action === 'pending') ? `${this.state.roomTextData.th_notes_text}` : `${this.state.roomTextData.th_latest_note}`}>{( obj.procedure_notes_count !== null && obj.procedure_notes_count > 0 )  ? (
                <img src={require('../../images/green-check.png')} />
            ) : ( <img src={require('../../images/red-cross.png')} /> ) }</td>


              <td className="col-xs-1 table-updated-td" title={this.state.roomTextData.th_consent_text}>{( obj.consent_ids !== null && obj.consent_ids !== '' ) ? (
                <img onClick = {this.procedureConsentsEdit.bind(this, obj.id)}  src={require('../../images/green-check.png')} />
            ) : ( <img src={require('../../images/red-cross.png')} /> ) }</td>


              {(this.state.defTimeLine === 'cosmetic') && <td className="col-xs-1 table-updated-td" title={this.state.roomTextData.th_question_text}>{( obj.answers_count > 0 || obj.answer_multiples_count > 0 ) ? (
                <img onClick = {this.procedureQuestionnaireEdit.bind(this, obj.id)} src={require('../../images/green-check.png')} />
            ) : (this.state.action === 'pending') ? ( <img src={require('../../images/red-cross.png')} onClick = {this.procedureQuestionnaireEdit.bind(this, obj.id)} /> ) : ( <img src={require('../../images/red-cross.png')}  /> ) }</td>}

            {(this.state.defTimeLine === 'health') && <td className="col-xs-1 table-updated-td" title={'Prescription'}>{( obj.procedure_prescription_count > 0) ? (
              <img onClick = {this.procedurePrescriptionEdit.bind(this, obj.id)} src={require('../../images/green-check.png')} />
          ) : ( <img src={require('../../images/red-cross.png')} /> ) }</td>}

            {(this.state.action === 'pending' && this.state.defTimeLine === 'cosmetic') && <td className="col-xs-1 table-updated-td" title={this.state.roomTextData.th_payment_traxn_text}>
              {( obj.pos_invoices_count !== null && obj.pos_invoices_count > 0 ) ? (
                <img src={require('../../images/green-check.png')} />
            ) : ( <img src={require('../../images/red-cross.png')} /> ) }
            </td>}
            {(this.state.action === 'pending') && <td className="col-xs-1 table-updated-td">
              <div className="dropdown show-hide-btn">

                {(this.state.defTimeLine === 'health') && <button type="button" class="new-blue-btn consent-model m-r-10" onClick={this.doThis} data-consult="0" data-procedureid={obj.id} data-iscomplete={isHealthComplete} data-action={(isHealthComplete === 0) ? "incompletesign" : "completesign" }>Sign</button>}

                {(this.state.defTimeLine === 'cosmetic') && <button className="btn btn-default dropdown-toggle btn-xs audit-btn" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                Actions <i className="fas fa-angle-down"></i>
              </button>}

                <ul className={(this.state.defTimeLine === 'health') ? "dropdown-menu ul-dropdown-menu-health" : "dropdown-menu ul-dropdown-menu-cosmetic"} aria-labelledby="dropdownMenu1">
                  {(this.state.defTimeLine === 'cosmetic') && <li><a onClick={this.doThis} className="sign-procedure sign-procedure-class" data-consult="0" data-procedureid={obj.id} data-iscomplete={isComplete} data-action={(isComplete === 0) ? "incompletesign" : "completesign" }>{signText}</a></li>}

                  {(this.state.defTimeLine === 'cosmetic') && <li><a onClick={this.doThis} className="sign-as-consult sign-procedure-class" data-consult="1" data-procedureid={obj.id} data-action="markconsult">Mark as consult</a></li>}
                  {(this.state.defTimeLine === 'cosmetic') &&
                  <li><a onClick={this.doThis} className="mark-as-after-photo sign-procedure-class" data-procedureid={obj.id} data-isafterphotos={isAfterPhotos} data-action={(isAfterPhotos === 0) ? "unmarkafterphoto" : "markafterphoto" }>{markAsAfterText}</a></li>
                  }

                  {(obj.is_after_photos === 1 && this.state.defTimeLine === 'cosmetic') && <li><a onClick={this.doThis} className="hide-procedure sign-procedure-class" data-procedureid={obj.id} data-action="hide">Hide</a></li>}
                </ul>
              </div>
            </td> }

            {(this.state.action !== 'pending') && <td className="col-xs-1 table-updated-td">{(obj.is_consult === 1 || this.state.defTimeLine === 'health') ? `${this.state.roomTextData.yes_text}` : `${this.state.roomTextData.no_text}`}</td> }
            </tr>

            );
              }
          )
          }

          </tbody>

        </table>
        {this.state.showLoader !== true && this.state.MDRoomData !== undefined && this.state.MDRoomData.length === 0 && <div className="text-center text-loading">{this.state.roomTextData.no_rec_room_text} </div>}
      </div>


      </div><div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display"}>{this.state.globalLang.loading_please_wait_text}</div></div>
      <div className={ this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left" } >
        <div className="loader-outer">
          <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
          <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
        </div>
      </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));

  localStorage.setItem("sortOnly", false);
  if (state.SettingReducer.action === "ProviderRoom_LIST") {
    if (state.SettingReducer.data.status === 200) {
      return {
        MDRoomData: state.SettingReducer.data.data
      }
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    return {};
  }

  if (state.SettingReducer.action === "MARK_UNMARK_AFTER_PHOTOS") {
    toast.dismiss();

    if (state.SettingReducer.data.status === 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        MDRoomData: state.SettingReducer.data.data
      }
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    return {};
  }

  if (state.SettingReducer.action === "HIDE_MARK_AFTER_PHOTOS") {
    toast.dismiss();

    if (state.SettingReducer.data.status === 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        MDRoomData: state.SettingReducer.data.data
      }
    } else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    return {};
  }

  if ( state.SettingReducer.action === 'SIGN_PROCEDURE' ) {
    toast.dismiss();

    if ( state.SettingReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        MDRoomData: state.SettingReducer.data.data
      }
    }
    return {}
  }

  if ( state.SettingReducer.action === 'MDS_LIST' ) {
    toast.dismiss();

    if ( state.SettingReducer.data.status !== 200 ) {
      //toast.error(languageData.global[state.SettingReducer.data.message]);
      return {
        mdList: state.SettingReducer.data.data
      }
    } else {
      return {
        mdList: state.SettingReducer.data.data
      }
    }
    return {}
  }

  if (state.SettingReducer.action === 'EMPTY_DATA' ) {

    if(state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      return {}
    } else {
      return {}
    }
  }
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchProviderRoomData: fetchProviderRoomData, markUnmarkAsAfterPhotos: markUnmarkAsAfterPhotos, hidemarkAsAfter: hidemarkAsAfter, signProcedure: signProcedure, fetchSelectMD: fetchSelectMD,exportEmptyData:exportEmptyData}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ProcedureList));
