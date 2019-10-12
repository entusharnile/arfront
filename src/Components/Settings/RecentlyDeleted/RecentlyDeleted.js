import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../../../Containers/Protected/Header.js';
import Footer from '../../../Containers/Protected/Footer.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Sidebar from '../../../Containers/Settings/sidebar.js';
import { getRecentlyDeleted, restoreRecentlyDeleted,exportEmptyData } from '../../../Actions/Settings/settingsActions.js';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../../images/calender.svg';
import { format, addDays } from 'date-fns';
import {showFormattedDate} from '../../../Utils/services.js';
import moment from 'moment';
import { autoScrolling } from "../../../Utils/services.js";

localStorage.removeItem('rdfDateRange');


class RecentlyDeleted extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));

    const rdfDateRange = localStorage.getItem('rdfDateRange');
    const valR = rdfDateRange ? JSON.parse(rdfDateRange) : '';
    const startDate = valR.startDate
    const endDate = valR.endDate

    this.state = {
      globalLang: languageData.global,
      settingsLang: languageData.settings,
      recentlyDeletedList: [],
      selected: [],
      hasMoreItems: true,
      next_page_url: '',
      userList: [],
      loadMore: true,
      startFresh: true,
      showLoader: false,
      showLoadingText: false,
      userData: '',
      page: 1,
      pagesize: 15,
      isShowDeletedModal: false,
      dateRangePicker: {
        selection: {
          startDate: (startDate) ? new Date(startDate) : new Date(),
          endDate: (endDate) ? new Date(endDate) :new Date(),
          key: 'selection',
        },
      },
      to_date         : (endDate) ? moment(endDate).format('YYYY-MM-DD') : moment().endOf('day').format('YYYY-MM-DD'),
      from_date       : (startDate) ? moment(startDate).format('YYYY-MM-DD') : moment().startOf('day').format('YYYY-MM-DD'),
      showCalendar: false,
      term:'',
      clicked:0
    }
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
    const userData = JSON.parse(localStorage.getItem('userData'));
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick, false);
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    let formData = {
      'params': {
        term: this.state.term,
        page: this.state.page,
        pagesize: this.state.pagesize,
        from_date: this.state.from_date,
        to_date: this.state.to_date,
      }
    }
    this.setState({'showLoader': true})
    autoScrolling(true)
    this.props.getRecentlyDeleted(formData)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      nextProps.exportEmptyData()
      return returnState;
    } else if (nextProps.reload != undefined && nextProps.reload == true) {

      toast.success(nextProps.message)
      let formData = {
        params: {
          page: 1,
          pagesize: prevState.pagesize,
          term: prevState.term,
          from_date: prevState.from_date,
          to_date: prevState.to_date,
        }
      };
      autoScrolling(true)
      nextProps.getRecentlyDeleted(formData);

      return {
        page: 1,
        startFresh: true,
        loadMore: true,
        startFresh: true,
        next_page_url: "",
        recentlyDeletedList: [],
        showLoader: true,
        next_page_url: '',
        showLoader: true
      }
    } else if (nextProps.recentlyDeletedList != undefined &&
      nextProps.recentlyDeletedList.next_page_url !== prevState.next_page_url) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        autoScrolling(false)
        return returnState;
      }
      if (prevState.recentlyDeletedList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.recentlyDeletedList = nextProps.recentlyDeletedList.data;
          if (nextProps.recentlyDeletedList.account_prefrence !== undefined) {
            returnState.dynamic_providers_ordering = (prevState.userChanged) ? prevState.recentlyDeletedList : ((nextProps.recentlyDeletedList.account_prefrence.dynamic_providers_ordering) ? true : false);
          }
          if (nextProps.recentlyDeletedList.is_superadmin !== undefined) {
            returnState.is_superadmin = nextProps.recentlyDeletedList.is_superadmin;
          }
          if (nextProps.recentlyDeletedList.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.recentlyDeletedList.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          localStorage.setItem('showLoader', false);
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.recentlyDeletedList != nextProps.recentlyDeletedList.data &&
        prevState.recentlyDeletedList.length != 0
      ) {
        returnState.recentlyDeletedList = [
          ...prevState.recentlyDeletedList,
          ...nextProps.recentlyDeletedList.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.recentlyDeletedList.next_page_url;
        localStorage.setItem('showLoader', false);
        returnState.showLoader = false;
        returnState.showLoadingText = false;
      }
      autoScrolling(false)
      return returnState;
    }
    return null;
  }

  componentWillUnmount() {
    this.props.exportEmptyData()
    document.removeEventListener('click', this.handleClick, false);
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value = target.value;
    const name = target.name;
    let returnState = {}
    returnState.dataChanged = true;
    switch (target.type) {
      case 'checkbox':
        value = (target.checked) ? true : false;
        break;
      case 'radio':
        //value = target.checked;
        break;
    }
    returnState[name] = value;
    this.setState(returnState);
    if (target.type === "checkbox") {
      let val = target.value
      let id = parseInt(name.split('-')[1]);
      let selected = this.state.selected;
      let existOrNot = this.state.selected.indexOf(id);
      if (existOrNot > -1) {
        if (value != true) {
          selected.splice(existOrNot, 1);
        } else {
          selected.push(id);
        }
      } else {
        selected.push(id);
      }
      this.setState({ selected: selected });
    }
  }

  handleClick = (e) => {
    if (this.node.contains(e.target) && this.state.showCalendar === true) {
      return
    }
    this.toggleCalendar(e.target);
  }

  toggleCalendar = (elem) => {
    if (elem.name !== 'calendar-input' && this.state.showCalendar === false) {
      return
    }

    let showCalendar = false

    if (this.state.showCalendar === false && elem.name !== undefined && elem.name === 'calendar-input') {
      showCalendar = true
    } else {
      showCalendar = false
    }

    this.setState({ showCalendar: showCalendar })
  }

  handleSubmit = (event, value) => {
    if (typeof event === 'object' ) {
      event.preventDefault();
    }
    localStorage.setItem("sortOnly", true);
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    let formData = {
      params: {
        page: 1,
        pagesize: this.state.pagesize,
        term: this.state.term,
        from_date: (value != undefined && value.from_date != undefined) ? value.from_date : this.state.from_date,
        to_date: (value != undefined && value.to_date != undefined) ? value.to_date : this.state.to_date,
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      recentlyDeletedList: [],
      showLoader: true,
      next_page_url: '',
      showLoader: true
    });
    autoScrolling(true)
    this.props.getRecentlyDeleted(formData);
  }

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem('sortOnly', false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true })
      const languageData = JSON.parse(localStorage.getItem('languageData'))
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
          term: this.state.term,
          from_date: this.state.from_date,
          to_date: this.state.to_date,
        }
      }
      autoScrolling(true)
      this.props.getRecentlyDeleted(formData)
    }
  }
  handleRestoreModal = () => {
    this.setState({ isShowDeletedModal: !this.state.isShowDeletedModal })
  }

  restoreSelected = () => {
    this.props.restoreRecentlyDeleted({ 'procedure_ids': this.state.selected })
    this.setState({ isShowDeletedModal: !this.state.isShowDeletedModal, showLoader: true })
  }

  ProcedureDetail = (id,procedureType, event) => {
    if (event.target.className != 'checkbox-recently-deleted' && event.target.className != 'table-checkbox table-updated-td checkbox-recently-deleted') {
      if(procedureType === 'health'){
        return <div>{this.props.history.push(`/settings/procedure-health-detail/${id}/recently-deleted`)}</div>;
      } else {
        return <div>{this.props.history.push(`/settings/procedure-detail/${id}/recently-deleted`)}</div>;
      }
    }
  }

  handleRangeChange = (which, payload) => {
    if(payload){
      let payloadValue = {
        startDate: payload.selection.startDate,
        endDate: payload.selection.endDate,
        key: 'selection',
      }
      localStorage.setItem("rdfDateRange", JSON.stringify(payloadValue));
    }
    let startDate = payload.selection.startDate;
    let endDate   = payload.selection.endDate;
    startDate     = format(startDate, 'YYYY-MM-DD');
    endDate       = format(endDate, 'YYYY-MM-DD');

    let clicked   = this.state.clicked + 1;

    let localPref = localStorage.getItem('focusedRange');
    let canBypass = (localPref && localPref === 'oneClick') ? true : false;

    if (canBypass) {
      clicked = 2;
    }

    let showCalendar = true;

    if ( clicked % 2 === 0 ) {
      showCalendar = false;
    }

    this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
      showCalendar : showCalendar,
      from_date    : startDate,
      to_date      : endDate,
      clicked      : clicked
    });

    if ( clicked && clicked % 2 === 0 ) {
      this.handleSubmit(which, {"from_date" : startDate, "to_date" : endDate});
    }
  }

  render() {
    return (
      <div className="main protected">
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-search-outer">
                <form onSubmit={this.handleSubmit}>
                  <div className="search-bg new-search">
                    <i className="fas fa-search" />
                    <input className="setting-search-input search-key" name="term" placeholder={this.state.globalLang.label_search} value={this.state.term} onChange={this.handleInputChange} autoComplete="off" />
                  </div>
                </form>
                <div className="search-bg new-calender pull-left" ref={node => { this.node = node }}>
                  <img src={calenLogo} />
                   {this.state.showCalendar && <DateRangePicker
                     ranges={[this.state.dateRangePicker.selection]}
                     onChange={this.handleRangeChange.bind(this, 'dateRangePicker')}
                     className={'CalendarPreviewArea'}
                     maxDate={new Date()}
                     dragSelectionEnabled={false}
                     /> }
                  <input type="text" className="input-cal setting-search-input" name="calendar-input" value={(this.state.from_date) ? showFormattedDate(this.state.from_date, false) + `-` + showFormattedDate(this.state.to_date, false) : ""} autoComplete="off" onChange={this.handleInputChange} />
                </div>
                <a href="javascript:void(0);" className={(this.state.selected.length > 0) ? "new-blue-btn pull-right" : "new-blue-btn pull-right disable"} onClick={(this.state.selected.length > 0) ? this.handleRestoreModal : null} >{this.state.settingsLang.recently_deleted_restore}</a>
              </div>
              <div className="table-responsive">
                <table className="table-updated juvly-table table-min-width">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="table-checkbox table-updated-th" />
                      <th className="col-xs-2 table-updated-th">{this.state.settingsLang.procedure_name}</th>
                      <th className="col-xs-3 table-updated-th">{this.state.settingsLang.procedure_date}</th>
                      <th className="col-xs-2 table-updated-th" >{this.state.globalLang.label_client}</th>
                      <th className="col-xs-2 table-updated-th" >{this.state.globalLang.label_provider}</th>
                      <th className="col-xs-2 table-updated-th" >{this.state.globalLang.label_clinic}</th>
                    </tr>
                  </thead>
                  <tbody className="ajax_body" >
                    {this.state.recentlyDeletedList !== undefined && this.state.recentlyDeletedList.map((obj, idx) => {
                      return (
                        <tr className="table-updated-tr" key={'recently-deleted' + idx} onClick={this.ProcedureDetail.bind(this, obj.id,obj.procedure_type)}>
                          <td className="table-checkbox table-updated-td checkbox-recently-deleted">
                            <input type="checkbox" className="checkbox-recently-deleted" checked={(this.state.selected.indexOf(obj.id) > -1) ? 'checked' : false} value={(this.state.selected.indexOf(obj.id) > -1) ? true : false} name={'deleted-' + obj.id} onChange={this.handleInputChange} />
                          </td>
                          <td className="col-xs-2 table-updated-td">{(obj.procedure_name!= undefined && obj.procedure_name != null) ? obj.procedure_name : ''}</td>
                          <td className="col-xs-3 table-updated-td">{showFormattedDate(obj.procedure_date,true)}</td>
                          <td className="col-xs-2 table-updated-td">{(obj.patient != undefined && obj.patient != null && obj.patient.patient_name != undefined) ? obj.patient.patient_name : ''}</td>
                          <td className="col-xs-2 table-updated-td">{(obj.user != undefined && obj.user != null && obj.user.provider_name != undefined) ? obj.user.provider_name : ''}</td>
                          <td className="col-xs-2 table-updated-td">{(obj.clinic.clinic_name != undefined && obj.clinic.clinic_name != null) ? obj.clinic.clinic_name : ''}</td>
                        </tr>)
                    })}
                  </tbody>
                </table>
                {(this.state.showLoader === false) && <div className={(this.state.recentlyDeletedList.length) ? "no-record no-display" : "no-record"}>
                  {this.state.globalLang.sorry_no_record_found}
                </div>}
              </div>
              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
                </div>
              </div>
              <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
            </div>

          </div>
          {/* Resotre Modal - START */}
          <div className={(this.state.isShowDeletedModal) ? 'overlay' : ''} ></div>
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
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  let returnState = {}
  if (state.SettingReducer.action === "RECENTLY_DELETED_LIST") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true;
    } else {
      returnState.recentlyDeletedList = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "RECENTLY_DELETED_RESTORE") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = true;
    } else {
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.reload = true;
      //returnState.recentlyDeletedList = state.SettingReducer.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getRecentlyDeleted: getRecentlyDeleted,
    restoreRecentlyDeleted: restoreRecentlyDeleted,
    exportEmptyData:exportEmptyData
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(RecentlyDeleted);
