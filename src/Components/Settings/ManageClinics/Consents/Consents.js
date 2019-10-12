import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../../../Containers/Settings/sidebar.js";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { findDOMNode } from "react-dom";
import {
  fetchConsents, exportEmptyData
} from "../../../../Actions/Settings/settingsActions.js";
import DragAndDrop from "./DragAndDrop.js";
import { autoScrolling } from "../../../../Utils/services.js";

class Consents extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem("userData"));

    this.state = {
      consentsList: [],
      page: 1,
      pagesize: 15,
      sortorder: "asc",
      term: "",
      hasMoreItems: true,
      next_page_url: "",
      showLoadingText : false,
      loadMore: true,
      startFresh: true,
      showLoader: false
    };
    this.props.exportEmptyData({});
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop))
      if (
        window.innerHeight + scrollTop ===
          document.documentElement.offsetHeight &&
        this.state.next_page_url != null
      ) {
        this.loadMore();
      }
    };
  }

  componentDidMount() {
    let formData = {
      params: {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: "asc",
        term: this.state.term,
        scopes: this.state.scopes
      }
    };
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    this.setState({
      consents_header: languageData.settings["consents_header"],
      consents_added_by: languageData.settings["consents_added_by"],
      create_consent_button: languageData.settings["create_consent_button"],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      clinic_No_Record_Found: languageData.settings['clinic_No_Record_Found'],
      clinics_Search: languageData.settings['clinics_Search'],
    });
    this.setState({'showLoader': true});
    autoScrolling(true)
    this.props.fetchConsents(formData);
  }

  handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let formData = {
      params: {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
        term: this.state.term,
        scopes: this.state.scopes
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: this.state.sortorder == "asc" ? 'asc': 'desc',
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      consentsList: []
    });
    this.setState({'showLoader': true});
    autoScrolling(true)
    this.props.fetchConsents(formData);
  };

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ loadMore: true, startFresh: true, showLoader: true, showLoadingText: true });
      let formData = {
        params: {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : '',
          term: this.state.term
        }
      };
      this.setState({'showLoader': true});
      autoScrolling(true)
      this.props.fetchConsents(formData);
    }
  };

  componentWillUnmount() {
    /*window.onscroll = () => {
      return false;
    }*/
    this.props.exportEmptyData({});
  }

  componentDidUpdate(){
    if(this.state.showLoader) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  consentEdit = id => {
    this.props.history.push(`/settings/consent/${id}/edit`)
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        return {showLoader : false};
     }
    let returnState = {};
    if (
      nextProps.consentsList != undefined &&
      nextProps.consentsList.data.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        autoScrolling(false)
        return returnState;
      }
      if (prevState.consentsList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.consentsList = nextProps.consentsList.data.data;
          if (nextProps.consentsList.data.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.consentsList.data.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          localStorage.setItem('showLoader', false);
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.consentsList != nextProps.consentsList.data.data &&
        prevState.consentsList.length != 0
      ) {
        returnState.consentsList = [
          ...prevState.consentsList,
          ...nextProps.consentsList.data.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.consentsList.data.next_page_url;
        localStorage.setItem('showLoader', false);
        returnState.showLoader = false;
        returnState.showLoadingText = false;
      }
      autoScrolling(false)
      return returnState;
    }
    return null;
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  render() {
    return (
    <div className="main protected">
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <Sidebar />
            <div className="setting-setion">
              <div className="setting-search-outer">
                <form onSubmit={this.handleSubmit}>
                  <div className="search-bg col-xs-5">
                    <i className="fas fa-search" />
                    <input className="setting-search-input search-key" data-url="/settings/questionnaires" name="term"  placeholder={this.state.clinics_Search} autoComplete="off" value={this.state.term} onChange={this.handleInputChange}/>
                  </div>
                </form>
                <Link to="/settings/consent/create" className="new-blue-btn pull-right">
                  {this.state.create_consent_button}
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table-updated setting-table">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="col-xs-8 table-updated-th sorting">{this.state.consents_header}</th>
                      <th className="col-xs-4 table-updated-th sorting text-center">{this.state.consents_added_by}</th>
                    </tr>
                  </thead>

                <DragAndDrop sortUpdate = {this.updateSortOrder} list = {this.state.consentsList} module = {'Consent'}  editUrl = {this.consentEdit} />
                  <div className={(this.state.consentsList) ? "no-record no-display" : "no-record" }>
                    </div> {this.state.consentsList.length <= 0 && (this.state.showLoader === false) &&
                      <tbody>
                        <tr>
                          <td colspan="2" className="table-updated-td"><div className="no-record no-float text-center">  {this.state.clinic_No_Record_Found}</div></td>
                        </tr>
                      </tbody>}
                    </table>
                  </div>
                 <div className={this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left" } >
                    <div className="loader-outer">
                      <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                        <div id="modal-confirm-text" className="popup-subtitle">
                          {this.state.clinic_Please_Wait}
                        </div>
                      </div>
                   </div>
                   <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.loading_please_wait_text}</div>
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
  if (state.SettingReducer.action === "CONSENTS_LIST") {
    if(state.SettingReducer.data.status != 200){
      returnState.showLoader = false
    }
    else {
      returnState.consentsList = state.SettingReducer.data
    }
  }
    if (state.SettingReducer.action === "CLINIC_SEARCH") {
      if(state.SettingReducer.data.status != 200) {
        returnState.showLoader = false
      }
      else {
        returnState.clinicSearch = state.SettingReducer.data.data
      }
    }
    if (state.SettingReducer.action === "SELECTED_CLINIC_LIST") {
      if(state.SettingReducer.data.status != 200){
        returnState.showLoader = false
      }
      else {
        returnState.clinicSearch = state.SettingReducer
      }
    }
    return returnState;
  }

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { fetchConsents: fetchConsents, exportEmptyData: exportEmptyData },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Consents);
