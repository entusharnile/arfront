import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import Header from '../Containers/Protected/Header.js';
// import Footer from '../Containers/Protected/Footer.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { findDOMNode } from 'react-dom'
import PropTypes from 'prop-types';
import ImageUploader from 'react-images-upload';
import config from '../../../../config';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import axios from 'axios';
import { fetchUsers } from '../../../../Actions/Settings/settingsActions.js';
import { autoScrolling } from "../../../../Utils/services.js";


class Users extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'))
    this.state = {
      accountType : (userData.account != undefined && userData.account.account_type != undefined) ? userData.account.account_type : 'trial',
      fisrtname: '',
      lastname: '',
      user_role_id: '',
      status: 'active',
      showLoadingText: false,
      userData: '',
      page: 1,
      pagesize: 15,
      sortby: 'firstname',
      sortorder: 'asc',
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      userList: [],
      loadMore: true,
      startFresh: true,
      showLoader: false,
      add_user_limit_reached: 0
    }
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5 && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  componentDidMount() {
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortby: this.state.sortby,
        sortorder: 'asc',
        term: this.state.term
      }
    }
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      user_Create_UserBtn: languageData.settings['user_Create_UserBtn'],
      user_First_Name: languageData.settings['user_First_Name'],
      user_Role: languageData.settings['user_Role'],
      user_Last_Name: languageData.settings['user_Last_Name'],
      clinics_Search: languageData.settings['clinics_Search'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      user_Status: languageData.settings['user_Status'],
      clinic_No_Record_Found: languageData.settings['clinic_No_Record_Found'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      clinic_No_Record_Found: languageData.settings['clinic_No_Record_Found'],
      setting_create_user_button_error__trail_account_type: languageData.settings['setting_create_user_button_error__trail_account_type'],
    })
    this.setState({ 'showLoader': true })
    autoScrolling(true);
    this.props.fetchUsers(formData);
  }

  componentDidUpdate(){

  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem('sortOnly', true);
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortby: this.state.sortby,
        sortorder: this.state.sortorder,
        term: this.state.term
      }
    }
    this.setState({
      page: 1,
      sortby: this.state.sortby,
      pagesize: this.state.pagesize,
      sortorder: (this.state.sortorder == 'asc') ? 'asc': 'desc',
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: '',
      userList: [],
      showLoader: true
    });
    autoScrolling(true);
    this.props.fetchUsers(formData);
  }

  onSort = (sortby) => {
    let sortorder = (this.state.sortorder === 'asc') ? 'desc': 'asc';
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortby: sortby,
        sortorder: sortorder,
        term: this.state.term
      }
    }
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url: '',
      userList: []
    });
    localStorage.setItem('sortOnly', true);
    autoScrolling(true);
    this.props.fetchUsers(formData);
  }

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem('sortOnly', false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true })
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortby: this.state.sortby,
          sortorder: this.state.sortorder,
          term: this.state.term
        }
      }
      autoScrolling(true);
      this.props.fetchUsers(formData);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        return {showLoader : false};
     }
    if (nextProps.userList != undefined && nextProps.userList.next_page_url !== prevState.next_page_url) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem('sortOnly', false);
        autoScrolling(false);
        return returnState.next_page_url = null;
      }

      if (prevState.userList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem('sortOnly') == 'false') {
          if (nextProps.userList.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.userList.next_page_url;
          }
          returnState.userList = nextProps.userList.data;
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          returnState.add_user_limit_reached = nextProps.userList.add_user_limit_reached;
        } else {
          localStorage.setItem('sortOnly', false);
        }

      } else if (prevState.userList != nextProps.userList.data && prevState.userList.length != 0) {
        returnState.userList = [...prevState.userList, ...nextProps.userList.data];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.userList.next_page_url;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
        returnState.add_user_limit_reached = nextProps.userList.add_user_limit_reached;
      }
      autoScrolling(false);
      return returnState;
    }
    return null;
  }

 /* componentWillUnmount = () => {
    window.onscroll = () => {
      return false;
    }
  }*/

  userEdit = (id) => {
    //localStorage.setItem('userID', id)
    return (
      <div>
        {this.props.history.push(`/settings/users/${id}/edit`)}
      </div>
    );
  }

  userAdd = (id) => {
    if(this.state.add_user_limit_reached){
      toast.dismiss();
      toast.error(this.state.setting_create_user_button_error__trail_account_type);
      return false;
    } else {
      return (
        <div>
          {this.props.history.push(`/settings/users/create`)}
        </div>
      );
    }
  }

  /* ,
        {this.props.passID(id)}*/

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

  render() {
    let roles = ['Admin', 'Provider', 'Front Desk', 'Medical Director']
    return (
      <div>
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-search-outer">
                <form onSubmit={this.handleSubmit}>
                  <div className="search-bg col-xs-5">
                    <i className="fas fa-search" />
                    <input className="setting-search-input search-key" data-url="/settings/user" name="term" placeholder={this.state.clinics_Search} value={this.state.term} autoComplete="off" onChange={this.handleInputChange} />
                  </div>
                </form>
              <a href="javascript:void(0);" onClick={this.userAdd} className="new-blue-btn pull-right edit_setting" >{this.state.user_Create_UserBtn}</a>
            </div>
            <div className="table-responsive">
              <table className="table-updated setting-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-1 table-updated-th no-padding-right" />
                    <th className="col-xs-3 table-updated-th sorting sortData user-first-name" onClick={() => this.onSort('firstname')} data-sort="firstname" data-url="/settings/user" data-order="DESC">{this.state.user_First_Name}<i className="gray-gray" /></th>
                    <th className="col-xs-3 table-updated-th sorting sortData" onClick={() => this.onSort('lastname')} data-sort="lastname" data-url="/settings/user" data-order="DESC">{this.state.user_Last_Name}<i className="gray-gray" /></th>
                    <th className="col-xs-3 table-updated-th sorting" >{this.state.user_Role}</th>
                    <th className="col-xs-2 table-updated-th sorting" >{this.state.user_Status}</th>
                  </tr>
                </thead>
                <tbody className="ajax_body" >
                {
                  this.state.userList !== undefined && this.state.userList.map((obj, idx) => {
                    let userImage = obj.user_image_url ? obj.user_image_url : '/images/user.png';
                  return (
                    <tr className="table-updated-tr edit_setting" key={idx} data-url="/user/add/8968" data-title="Edit User" onClick={this.userEdit.bind(this, obj.id)} >
                      <td className="col-xs-1 table-updated-td no-padding-right">
                        <div className="user-profile-img" style={{backgroundImage: `url(${userImage})`}}></div>
                      </td>
                      <td className="col-xs-3 table-updated-td user-first-name" data-id={obj.id} >{obj.firstname}</td>
                      <td className="col-xs-3 table-updated-td" data-id={obj.id} >{obj.lastname}</td>
                      <td className="col-xs-3 table-updated-td text-left" data-id={obj.id} >{roles[obj.user_role_id - 1]}</td>
                      <td className="col-xs-2 table-updated-td text-left" data-id={obj.id} >{obj.status}</td>
                    </tr>)
                  })
                }
              </tbody>
            </table>
            {(this.state.showLoader === false) && <div className={(this.state.userList.length) ? "no-record no-display" : "no-record"}>
              {this.state.clinic_No_Record_Found}
            </div>}
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
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
  if (state.SettingReducer.action === "USERS_LIST") {
    localStorage.setItem('loadFresh', false);
    if(state.SettingReducer.data.status != 200){
      returnState.showLoader = false
    }
    else {
        returnState.userList= state.SettingReducer.data.data
      }
    }
    if (state.SettingReducer.action === "USERS_SEARCH") {
      if(state.SettingReducer.data.status != 200) {
        returnState.showLoader = false
      }
      else
      {
        returnState.userSearch= state.SettingReducer.data.data
      }
    }
    return returnState;
  }

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchUsers: fetchUsers }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Users);
