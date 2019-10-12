import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../Containers/Settings/sidebar.js";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchSMSNotifications } from '../../Actions/Dashboard/dashboardActions';
import ARLayout from '../../Containers/Layouts/ARLayout';
import ReactTooltip from 'react-tooltip';
import moment from 'moment';
import {showFormattedDate, autoScrolling} from '../../Utils/services.js';

class SMSNotifications extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));

    this.state = {
      firstname: '',
      lastname: '',
      from_number: '',
      message: '',
      created: '',
      fetchNotificationData: [],
      showLoadingText : false,
      id: userData.user.id,
      page: 1,
      pagesize: 15,
      sortorder: 'asc',
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      loadMore: true,
      startFresh: true,
			showLoader: false,
			scopes: 'business_hours'
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  componentDidMount() {
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
      }
    };
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      SMS_Notifications: languageData.dashboard['SMS_Notifications'],
      Notifications: languageData.dashboard['Notifications'],
      SMS_Notifications_All_Time_displayed: languageData.dashboard['SMS_Notifications_All_Time_displayed'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      SMS_Notifications_SMS: languageData.dashboard['SMS_Notifications_SMS'],
      SMS_Notifications_New_SMS_received_from: languageData.dashboard['SMS_Notifications_New_SMS_received_from'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      dashboard_No_record_found: languageData.dashboard['dashboard_No_record_found'],
      dashboard_Last_Message: languageData.dashboard['dashboard_Last_Message'],
  })
    this.setState({ 'showLoader': true });
    autoScrolling(true)
    this.props.fetchSMSNotifications(formData);
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  handleSubmit = event => {
		event.preventDefault();
		localStorage.setItem('sortOnly', true);
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
				term: this.state.term,
				scopes : this.state.scopes
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: this.state.sortorder == "asc" ? "desc" : "asc",
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      fetchNotificationData: []
    });

    this.props.fetchNotificationData(formData);
  };

  onSort = (sortby) => {
    let sortorder = (this.state.sortorder === 'asc') ? 'desc' : 'asc';
    let formData = {'params':{
      page:1,
      pagesize:this.state.pagesize,
      sortby:sortby,
      sortorder: sortorder,
      term:this.state.term
      }
    }
    this.setState({
      page:1,
      pagesize:this.state.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url:'',
      fetchNotificationData : []
    });
    localStorage.setItem('sortOnly', true);
    this.props.fetchNotificationData(formData);
  }

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true });
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortorder: this.state.sortorder,
  				term: this.state.term,
  				scopes : this.state.scopes
        }
      };
      autoScrolling(true)
      this.props.fetchSMSNotifications(formData);
    }
  };

  userEdit=( id )=> {
      return (
        <div>
          {this.props.history.push(`/dashboard/sms-notificationspopup/${id}`)}
        </div>
      );
    }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.fetchNotificationData != undefined &&
      nextProps.fetchNotificationData.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        autoScrolling(false)
        return (returnState.next_page_url = null);
      }

      if (prevState.fetchNotificationData.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
					returnState.fetchNotificationData = nextProps.fetchNotificationData.data.data;
					if(nextProps.fetchNotificationData.data.next_page_url != null){
						returnState.page = prevState.page + 1;
					} else {
            returnState.next_page_url = nextProps.fetchNotificationData.data.next_page_url;
					}
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.fetchNotificationData != nextProps.fetchNotificationData.data.data &&
        prevState.fetchNotificationData.length != 0
      ) {
        returnState.fetchNotificationData = [
          ...prevState.fetchNotificationData,
          ...nextProps.fetchNotificationData.data.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.fetchNotificationData.data.next_page_url;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
			}
      autoScrolling(false)
			return returnState;
    }
    return null;
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

/*  componentWillUnmount = () => {
   window.onscroll = () => {
     return false;
   }
  }*/

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <ul className="sub-menu">
            <li><Link to="/dashboard/sms-notifications" className="active">{this.state.SMS_Notifications}</Link></li>
            <li><Link to="/dashboard/notifications">{this.state.Notifications}</Link></li>
          </ul>
          <div className="juvly-section full-width">
            <div className="setting-search-outer">
              {this.state.fetchNotificationData && this.state.fetchNotificationData.length > 0 && <span className="search-text pull-right">{this.state.SMS_Notifications_All_Time_displayed}</span>}
            </div>
            <div className="activity-outer">
            {
              this.state.fetchNotificationData && this.state.fetchNotificationData.length > 0 &&
                      this.state.fetchNotificationData.map((obj, idx) => {
                let label = '';
                if(obj.patient === null ){
                  label = obj.from_number
                } else {
                  label = (obj.patient !== null && obj.patient !== undefined) ? obj.patient.firstname + '' + obj.patient.lastname : '';
                }

                  return (
                    <div className="activity-row cursor-pointer" key = {idx}>
                      <div className="user-status status-color-a" >{this.state.SMS_Notifications_SMS}</div>
                      <div className="activity-detail">
                        <div className="col-md-2 col-sm-4 col-xs-12" data-tip data-for='smsToolTip' onClick = {this.userEdit.bind(this, obj.id)} >{label} </div>
                        <ReactTooltip id='smsToolTip'  effect='solid'>
                          {this.state.SMS_Notifications_New_SMS_received_from} <span> { label}</span>
                        </ReactTooltip>

                        <div className="col-sm-8 col-xs-12" onClick = {this.userEdit.bind(this, obj.id)} >{((obj.message).length > 75 ) ? (((obj.message).substring(0, 75)) + '...') : (obj.message)}</div>
                      </div>
                      <div className="activity-time" onClick = {this.userEdit.bind(this, obj.id)} >{this.state.dashboard_Last_Message}: {showFormattedDate(obj.created, true)}</div>
                    </div>
                  );
                })}
                {this.state.fetchNotificationData !== undefined && this.state.fetchNotificationData.length == 0 && (this.state.showLoader === false) &&  <div className="text-center">{this.state.dashboard_No_record_found} </div>}
            </div>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
                </div>
              </div>
          </div>
          <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display "}>{this.state.loading_please_wait_text}</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.DashboardReducer.action === "SMS_NOTIFICATION_LIST") {
    return {
      fetchNotificationData: state.DashboardReducer.data
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchSMSNotifications: fetchSMSNotifications }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SMSNotifications);
