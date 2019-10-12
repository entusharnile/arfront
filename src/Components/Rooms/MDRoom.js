import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchMDRoomData, signProcedure, exportEmptyData } from '../../Actions/Settings/settingsActions.js';
import { withRouter } from 'react-router';
import { getUser, checkIfPermissionAllowed, numberFormat, showFormattedDate, isNumber, autoScrolling } from '../../Utils/services.js';
import { SketchField, Tools } from 'react-sketch';
import config from '../../config';
import axios from 'axios';

const mdRoomInstance = axios.create();

mdRoomInstance.interceptors.response.use(function (response) {
    // Do something with response data
    return response;
}, function (error) {
   if(!error.response) {
      return {data : {data : "", message : "file_type_error", status : 400}}
   }
});

class ProcedureList extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'))
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
      select_all_pending_procedures: false,
      childCheck: false,
      action: props.match.params.type,
      pendingProcedures: (props.match.params.type === 'pending' ) ?  true : false,
      signedProcedures: (props.match.params.type === 'siged' ) ?  true : false,
      total: '',
      selectVisible: 'right-sign-btn',
      selectHide: 'right-sign-btn no-display',
      spanHide: 'search-text no-display',
      spanVisible: 'search-text',
      hideCheckbox: 'table-checkbox table-updated-td no-display ',
      showCheckbox: 'table-checkbox table-updated-td ',
      hideHeading: 'table-checkbox table-updated-th no-display ',
      showHeading: 'table-checkbox table-updated-th  ',
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
      totalChecked: 0,
      selected: [],
      selectAll: 0,

      showSignModal: false,
      canvasClass : "signature-box sig-div",
      inputOut    : 'input-outer',
      clearClass  : 'new-white-btn no-margin clear no-display',
      resetClass  : 'new-blue-btn reset no-display',
      changeClass : 'new-blue-btn no-margin Change',
      uploadedSignature: '',
      uploadedSignature_url:'',

      save_sign: false,
      roomType: this.props.match.url.split('/')[1],
      globalLang: languageData.global,
      showLoadingText : false,
      falseCount      : 0,
      showSigPopup:(showSigPopup)? 1 : 0,
      defTimeLine:(defTimeLine) ? defTimeLine : 'cosmetic',
      defTimeLineTabClicked:false
    };

    this.props.exportEmptyData({});
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  click = () => {
    //this.props.parentMethod();
}
  componentWillUnmount() {
    this.props.exportEmptyData({});
  }
  handleAnchor = (event) => {
    let action = event.target.dataset.action;
    this.props.history.push(`/${this.state.roomType}/${action}`);

    if(this.state.action != action) {
      if(action === 'pending'){
        let formData = {
          'params': {
            page: 1,
            pagesize: this.state.pagesize,
            sortorder: "asc",
            term: "",
            action: 'pending',
            procedure_type: this.state.defTimeLine
          }
        };
        this.setState({ tabClicked: true, pendingProcedures: true, signedProcedures: false, MDRoomData: [], startFresh : true, 'showLoader': true, page: 1, sortorder: "asc", term: "", next_page_url: "",action: 'pending' });
        autoScrolling(true)
        this.props.fetchMDRoomData(formData);

      }
      else {
        let formData = {
          'params': {
            page: 1,
            pagesize: this.state.pagesize,
            sortorder: "asc",
            term: "",
            action: 'signed',
            procedure_type: this.state.defTimeLine
          }
        };
        this.setState({ tabClicked: true, pendingProcedures: false, signedProcedures: true,  MDRoomData: [], startFresh : true, 'showLoader': true, page: 1, sortorder: "asc", term: "", next_page_url: "", action: 'signed'});
        autoScrolling(true)
        this.props.fetchMDRoomData(formData);
      }
    }
  }

  componentDidMount() {
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: "asc",
        term: this.state.term,
        action: this.state.action,
        procedure_type: this.state.defTimeLine
				// scopes : this.state.scopes signed
      }
    };

    autoScrolling(true)
    this.props.fetchMDRoomData(formData);


    this.setState({ 'showLoader': true });
  }


  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;

    this.setState({
      [event.target.name]: value
    });

    if ( target.type === "checkbox" ) {
      let val = event.target.value
      let idx = event.target.name.split('_')[1]

      if ( this.state.selected.length > 0 && this.state.selected[idx] !== undefined) {
        let newSelected = this.state.selected;
        let falseCount  = this.state.falseCount;

    		newSelected[[idx]][val] = !this.state.selected[[idx]][val];

        if ( !newSelected[[idx]][val] ) {
          falseCount      = falseCount + 1;
        }

        if ( falseCount === this.state.selected.length ) {
          falseCount = 0
        }

    		this.setState({
    			selected: newSelected,
    			selectAll: 0,
          falseCount: falseCount
    		});
      } else {
        let newSelected = this.state.selected;
        let falseCount  = this.state.falseCount;

        if ( falseCount > 0 ) {
          falseCount      = falseCount - 1;
        }

        let a     = {};
        a[val]    = true;

        newSelected[idx] = a;

    		this.setState({
    			selected: newSelected,
    			selectAll: 0,
          falseCount: falseCount
    		});
      }
    }
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
          defTimeLineTabClicked:true
        });
        this.setState({ 'showLoader': true });
        autoScrolling(true)
        this.props.fetchMDRoomData(formData);
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
        // scopes : this.state.scopes
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
    this.props.fetchMDRoomData(formData);
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
  			//	scopes : this.state.scopes
        }
      };
      autoScrolling(true)
      this.props.fetchMDRoomData(formData);
    }
  };
  // userEdit=( id )=> {
  //     //localStorage.setItem('userID', id)
  //     return (
  //       <div>
  //         {this.props.history.push(`/settings/clinic/${id}/edit`)}
  //       </div>
  //     );
  //   }

    static getDerivedStateFromProps(nextProps, prevState) {
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
      if (
        nextProps.MDRoomData !== undefined  && nextProps.MDRoomData.procedures !== undefined &&
        (nextProps.MDRoomData.procedures.next_page_url !== prevState.next_page_url || nextProps.MDRoomData.action !== prevState.action )
      ) {
        if (prevState.tabClicked === true) {
          return {
            tabClicked: false,
            MDRoomData: []
          }
        }
        let returnState = {};
        if(nextProps.MDRoomData.login_user){
          if(nextProps.MDRoomData.login_user.show_signature_popup !== undefined){
            returnState.showSigPopup = (nextProps.MDRoomData.login_user.show_signature_popup) ? 1 : 0
          }
        }
        if (prevState.next_page_url === null && nextProps.MDRoomData.action === prevState.action) {
          autoScrolling(false)
          return (returnState.next_page_url = null);
        }

        if ((prevState.MDRoomData.length === 0 && prevState.startFresh === true)) {
          if (localStorage.getItem("sortOnly") == "false") {
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

            returnState.MDRoomData = nextProps.MDRoomData.procedures.data;
            if(nextProps.MDRoomData.procedures.next_page_url != null){
              returnState.page = 2;//prevState.page + 1;
            } else {
              returnState.next_page_url = nextProps.MDRoomData.procedures.next_page_url;
            }
            returnState.startFresh = false;
            returnState.showLoader = false;
            returnState.action = nextProps.MDRoomData.action;
            returnState.total = nextProps.MDRoomData.procedures.total;
            returnState.injection_array = nextProps.MDRoomData.procedures.injection_array;
            returnState.showLoadingText = false;
          } else {
            localStorage.setItem("sortOnly", false);
          }
        } else if (
          prevState.MDRoomData !== nextProps.MDRoomData.procedures.data &&
          prevState.MDRoomData.length !== 0
        ) {
          if ( prevState.tabClicked === false ) {
            returnState.MDRoomData = [
              ...prevState.MDRoomData,
              ...nextProps.MDRoomData.procedures.data
            ];
            returnState.selectAll = 0;
          } else {
            returnState.tabClicked = false;
          }
          returnState.total = nextProps.MDRoomData.procedures.total;
          returnState.injection_array = nextProps.MDRoomData.procedures.injection_array;
          returnState.page = prevState.page + 1;
          returnState.next_page_url = nextProps.MDRoomData.procedures.next_page_url;
          returnState.action = nextProps.MDRoomData.action;
          returnState.showLoader = false;
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
          returnState.showLoadingText     = false;
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

  openSignModal = () => {
    let openModal = false

    if ( this.state.selected.length > 0 ) {
      this.state.selected.map((ob, id) => {
        for ( let proID in ob ) {
          if ( ob[proID] === true ) {
            openModal = true
          }
        }
      })
    }

    if ( openModal === true ) {
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

  saveWithoutSign = () => {
    let proIDArr = []

    if ( this.state.selected.length > 0 ) {
      this.state.selected.map((ob, id) => {
        for ( let proID in ob ) {
          if ( ob[proID] === true ) {
            proIDArr.push(proID)
          }
        }
      })
    }

    if (this.state.signature_url !== "") {
      let formData = {
        procedure_ids         : proIDArr,
        signature_saved       : (this.state.save_sign) ? 1 : 0,
        md_signature          : this.state.signature
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
        pendingProcedures: true,
        signedProcedures: false,
        MDRoomData: [],
        startFresh : true,
        showLoader: true,
        page: 1,
        sortorder: "asc",
        term: "",
        next_page_url: "",
        selected: []
      })
    }
  }

  toggleSelectAll = () => {
		let newSelected = [];

		if (this.state.selectAll === 0) {
			this.state.MDRoomData !== undefined  && this.state.MDRoomData.map((obj, idx) => {
        let a = {};
        a[obj.id] = true;
				newSelected.push(a);
			});
		}

		this.setState({
			selected: newSelected,
			selectAll: this.state.selectAll === 0 ? 1 : 0
		});

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

  signThis = () => {
    if ( (this._sketch && this._sketch.toJSON().objects.length === 0 && this.state.canvasClass.indexOf('no-display') === -1) || (this.state.canvasClass.indexOf('no-display') > 0 && this.state.signature_url === '' ) ) {

      toast.error(this.state.globalLang.validation_md_signature_required_if)
    } else {
      let proIDArr = []

      if ( this.state.selected.length > 0 ) {
        this.state.selected.map((ob, id) => {
          for ( let proID in ob ) {
            if ( ob[proID] === true ) {
              proIDArr.push(proID)
            }
          }
        })
      }

      if (this.state.signature_url !== "" && this.state.canvasClass.indexOf('no-display') > 0) {
        let formData = {
          procedure_ids         : proIDArr,
          signature_saved       : (this.state.save_sign) ? 1 : 0,
          md_signature          : this.state.signature
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
          pendingProcedures: true,
          signedProcedures: false,
          MDRoomData: [],
          startFresh : true,
          showLoader: true,
          page: 1,
          sortorder: "asc",
          term: "",
          next_page_url: "",
          selected: []
        })

      } else {
        mdRoomInstance.post(config.API_URL + "upload/signature", ({image_data : this._sketch.toDataURL(), upload_type: 'signatures'})).then(response => {
            if ( response.data && response.data.status === 200 ) {
              let formData = {
                procedure_ids         : proIDArr,
                signature_saved       : (this.state.save_sign) ? 1 : 0,
                md_signature          : response.data.data.file_name
              };

              let listData = {
                'params': {
                  page: 1,
                  pagesize: this.state.pagesize,
                  sortorder: "asc",
                  term: this.state.term,
                  action: this.props.match.params.type,
                  procedure_type: this.state.defTimeLine
          				// scopes : this.state.scopes signed
                }
              };
              autoScrolling(true)
              this.props.signProcedure(formData, true, listData, this.state.roomType, 'list');

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
                tabClicked: true,
                pendingProcedures: true,
                signedProcedures: false,
                MDRoomData: [],
                startFresh : true,
                showLoader: true,
                page: 1,
                sortorder: "asc",
                term: "",
                next_page_url: "",
                selected: []
              })
            }
        }).catch(error => {
            toast.error(this.state.roomTextData.signature_upload_error_text)
        })
      }
    }
  }

  render() {
    let totalChecked = 0;

    if ( this.state.selected.length > 0 ) {
      this.state.selected.map((ob, id) => {
        for ( let proID in ob ) {
          if ( ob[proID] === true ) {
            totalChecked = 1;
          }
        }
      })
    }

    return (
      <div id="content" className="fullscreen">
  <div className="container-fluid content setting-wrapper">
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


    <ul className="sub-menu">
      <li><a name="pendingProcedures" className={(this.state.action === 'pending') ? "active" : ''} data-action='pending' onClick ={this.handleAnchor.bind(this)} >{this.state.roomTextData.pending_pro_text}</a></li>
      <li><a name="signedProcedures" className={this.state.action === 'signed' ? "active" : ''} data-action='signed' onClick ={this.handleAnchor.bind(this)}>{this.state.roomTextData.signed_pro_text}</a></li>
    </ul>
    <div className="juvly-section full-width">
      {this.state.showLoader === false && <div className="setting-search-outer">
      <form onSubmit={this.handleSubmit}>
        <div className="search-bg new-search">
          <i className="fas fa-search" />
          <input name ="term" className="setting-search-input chart_search" placeholder={this.state.roomTextData.search_text} autoComplete="off" value={this.state.term} onChange={this.handleInputChange} />
        </div>
        </form>


        <span className={this.state.action === 'signed' ? this.state.spanHide : this.state.spanVisible}>{this.state.roomTextData.signature_pending_count_text} ({this.state.total})</span>
        <div className={this.state.action === 'signed' ? this.state.selectHide : ((this.state.total !== '' && this.state.total > 0) ? this.state.selectVisible : this.state.selectHide)}>

          <input
            type="checkbox"
            className="checkbox pull-left sel-all-visible"
            checked={this.state.selectAll === 1}
            ref={input => {
              if (input) {
                input.indeterminate = this.state.selectAll === 0;
              }
            }}
            onChange={() => this.toggleSelectAll()}
          />
          <label className="search-text" html="select_all_pending_procedures">{this.state.roomTextData.select_all_text}</label>
          <button type="submit" onClick={this.openSignModal} className={(totalChecked > 0) ? "new-blue-btn pull-right consent-model m-r-10" : "new-blue-btn pull-right consent-model disable m-r-10"} id="sign">{this.state.roomTextData.sign_text}</button>
        </div>
      </div>}
      <ul className="section-tab-outer submenuWithSearch">
        <li>
          <a href="javascript:void(0);" onClick={this.changeTimelinePref.bind(this,'cosmetic')} id="cosmetic_tab" className={(this.state.defTimeLine === 'cosmetic') ?"section-title-name r section-tab sel-merge-tab" : "section-title-name r section-tab"} data-title="Cosmetic">{this.state.roomTextData.room_cosmetic_timeline}</a>
        </li>
        <li>
          <a href="javascript:void(0);" onClick={this.changeTimelinePref.bind(this,'health')} id="health_tab" className={(this.state.defTimeLine === 'health') ?"section-title-name r section-tab sel-merge-tab" : "section-title-name r section-tab"} data-title="Health">{this.state.roomTextData.room_health_timeline}</a>
        </li>
      </ul>
      <div className="table-responsive min-h-200">
        <table className="table-updated setting-table min-w-1000 ajax-view">
          <thead className={(this.state.MDRoomData != '') ? "table-updated-thead" : 'no-display'}>
            <tr>
              <th className={this.state.action === 'signed' ? this.state.hideHeading : this.state.showHeading} />
              <th className={(this.state.defTimeLine === 'health') ? "col-xs-3 table-updated-th" : "col-xs-2 table-updated-th"}>{this.state.roomTextData.th_pro_info_text}</th>
              <th className={(this.state.defTimeLine === 'health') ? "col-xs-3 table-updated-th": "col-xs-2 table-updated-th"}>{this.state.roomTextData.th_client_text}</th>
              <th className="col-xs-2 table-updated-th">{this.state.roomTextData.th_provider_text}</th>
              {(this.state.defTimeLine === 'cosmetic') && <th className="col-xs-2 table-updated-th">{this.state.roomTextData.th_treat_sum_text}</th>}
              <th className="col-xs-1 table-updated-th">{this.state.roomTextData.th_latest_note}</th>
              <th className="col-xs-1 table-updated-th">{this.state.roomTextData.th_consent_text}</th>
              {(this.state.defTimeLine === 'cosmetic') && <th className="col-xs-1 table-updated-th">{this.state.roomTextData.th_question_text}</th>}
              {(this.state.defTimeLine === 'health') && <th className="col-xs-1 table-updated-th">{'Prescription'}</th>}
              <th className="col-xs-1 table-updated-th no-padding-right">{this.state.roomTextData.th_consult_only_text}</th>
            </tr>
          </thead>
          <tbody className="patient-list">
          {
            this.state.MDRoomData !== undefined  && this.state.MDRoomData.map((obj, idx) => {
            return (
            <tr className="table-updated-tr md-rooms-checkbox" key={idx}>
              <td className={this.state.action === 'signed' ? this.state.hideCheckbox : this.state.showCheckbox} >
                <input type="checkbox" name={'childCheck_'+idx}  className="select-pending-procedure" checked={(this.state.selected.length > 0 && this.state.selected[idx] !== undefined) && this.state.selected[[idx]][obj.id] === true} onChange={this.handleInputChange} value={obj.id}/>
              </td>

              <td className={(this.state.defTimeLine === 'health') ? "col-xs-3 table-updated-td modal-link cursor-pointer" : "col-xs-2 table-updated-td modal-link cursor-pointer"} data-url={obj.id} onClick = {this.userEdit.bind(this, obj.id)}>
              <div>{(obj.procedure_name) ? obj.procedure_name : "N/A"}</div>
              <div className="pro-date">{(obj.procedure_date) ? showFormattedDate(obj.procedure_date.split(" ")[0]) : ""}</div>
              </td>
              <td className={(this.state.defTimeLine === 'health') ? "col-xs-3 table-updated-td" : "col-xs-2 table-updated-td"} onClick = {this.userEdit.bind(this, obj.id)}>{(obj.patient && obj.patient.firstname != undefined) ? obj.patient.firstname : ''} {(obj.patient && obj.patient.lastname != undefined) ? obj.patient.lastname : ''}</td>
              <td className="col-xs-2 table-updated-td" onClick = {this.userEdit.bind(this, obj.id)}>
              {obj.user.firstname} {obj.user.lastname}
              </td>
              {(this.state.defTimeLine === 'cosmetic') && <td className="col-xs-1 table-updated-td modal-link" onClick = {this.userEdit.bind(this, obj.id)} >
              {/* {obj.product_name} {obj.quantity} {obj.unit} */}
              {
                obj.injection_array.map((injobj, injidx) =>
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
              </td>}
              <td className="col-xs-1 table-updated-td" title={this.state.roomTextData.th_latest_note}>{( obj.procedure_notes_count !== null && obj.procedure_notes_count > 0 )  ? (
                <img src={require('../../images/green-check.png')} />
            ) : ( <img src={require('../../images/red-cross.png')} /> ) }</td>
              <td className="col-xs-1 table-updated-td" title={this.state.roomTextData.th_consent_text}>{( obj.consent_ids !== null && obj.consent_ids !== '' ) ? (
              <img onClick = {this.procedureConsentsEdit.bind(this, obj.id)} src={require('../../images/green-check.png')} />
            ) : ( <img src={require('../../images/red-cross.png')} /> ) }</td>
              {(this.state.defTimeLine === 'cosmetic') && <td className="col-xs-1 table-updated-td" title={this.state.roomTextData.th_question_text}>{( obj.answers_count > 0 || obj.answer_multiples_count > 0 ) ? (
            <img onClick = {this.procedureQuestionnaireEdit.bind(this, obj.id)} src={require('../../images/green-check.png')} />
          ) : ( <img src={require('../../images/red-cross.png')} /> ) }</td>}
          {(this.state.defTimeLine === 'health') && <td className="col-xs-1 table-updated-td" title={'Prescription'}>{( obj.procedure_prescription_count > 0 ) ? (
        <img onClick = {this.procedurePrescriptionEdit.bind(this, obj.id)} src={require('../../images/green-check.png')} />
      ) : ( <img src={require('../../images/red-cross.png')} /> ) }</td>}
              <td className="col-xs-1 table-updated-td">{(obj.is_consult === 1 || this.state.defTimeLine === 'health') ? `${this.state.roomTextData.yes_text}` : `${this.state.roomTextData.no_text}`}</td>
            </tr>

            );
              }
          )
          }

          </tbody>
        </table>
        {this.state.showLoader !== true && this.state.MDRoomData !== undefined && this.state.MDRoomData.length === 0 && <div className="text-center text-loading">{this.state.roomTextData.no_rec_room_text} </div>}
      </div>

          {/* <ProviderRoom ProviderRoomData = {this.state.ProviderRoomData[pending]} langData={this.state.settingsLangData} /> */}


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
  if (state.SettingReducer.action === "MDRoom_LIST") {
    if(state.SettingReducer.data.status === 200){
    return {
      MDRoomData: state.SettingReducer.data.data
    }
  }
  } else if ( state.SettingReducer.action === 'SIGN_PROCEDURE' ) {
    toast.dismiss();

    if ( state.SettingReducer.data.status !== 201 ) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    } else {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        MDRoomData: state.SettingReducer.data.data
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
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchMDRoomData: fetchMDRoomData, signProcedure: signProcedure, exportEmptyData: exportEmptyData }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProcedureList));
