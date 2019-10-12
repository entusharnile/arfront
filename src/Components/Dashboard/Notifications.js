import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../Containers/Settings/sidebar.js";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchNotifications, deleteNotifications } from '../../Actions/Dashboard/dashboardActions';
import ARLayout from '../../Containers/Layouts/ARLayout';
import {showFormattedDate, autoScrolling} from '../../Utils/services.js';

class Notifications extends Component {
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
      is_juvly_account: 0,
      getNotificationData: [],
      notification_message: '',
      smsNotificationname: true,
      Notificationname: false,
      showModal: false,
      userId:'',
      showLoadingText : false,
      id: userData.user.id,
      fetchNotificationData: [],
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

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true , showLoadingText: true });
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
      this.props.fetchNotifications(formData);
    }
  };

  showDeleteModal = (e) => {
    this.setState({showModal: true, reminderId: e.currentTarget.dataset.userid})
    localStorage.setItem('isDelete', true);
    this.dismissModal();
    let reminders = this.state.getNotificationData;
      if(reminders.length) {
        reminders.map((obj, idx) => {
          if(obj.id == this.state.reminderId){
            delete reminders[idx];
          }
        })
        this.setState({getNotificationData : reminders});
    }
    this.props.deleteNotifications(e.currentTarget.dataset.userid);
    this.dismissModal();
  }

  showEditModal = (e)=> {
    this.setState({ userId: e.currentTarget.dataset.userid})
  }

  dismissModal = () => {
    this.setState({showModal: false})
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
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      dashboard_No_record_found: languageData.dashboard['dashboard_No_record_found'],
  })
    this.setState({ 'showLoader': true });
    autoScrolling(true)
    this.props.fetchNotifications(formData);
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  renderColorClass = (object) => {
    switch (object) {
      case 'low_stock':
        return 'user-status status-color-a';
      case 'expired_stock':
        return 'user-status status-color-b';
      case 'appointment_sync_failed':
        return 'user-status status-color-c';
      default:
        return 'user-status status-color-i';
    }
  }

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
      getNotificationData: []
    });
    autoScrolling(true)
    this.props.fetchNotifications(formData);
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
      getNotificationData : []
    });
    localStorage.setItem('sortOnly', true);
    autoScrolling(true)
    this.props.fetchNotifications(formData);
  }

  userEdit=( id )=> {
      return (
        <div>
          {this.props.history.push(`/settings/clinic/${id}/edit`)}
        </div>
      );
    }

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.isReloadPage != undefined && nextProps.isReloadPage == true) {
      toast.success(nextProps.message);
      window.location.reload();      
    }
    if (
      nextProps.getNotificationData != undefined &&
      nextProps.getNotificationData.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        autoScrolling(false)
        return (returnState.next_page_url = null);
      }

      if (prevState.getNotificationData.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
					returnState.getNotificationData = nextProps.getNotificationData.data.data;
					if(nextProps.getNotificationData.data.next_page_url != null){
						returnState.page = prevState.page + 1;
					} else {
            returnState.next_page_url = nextProps.getNotificationData.data.next_page_url;

					}
          returnState.is_juvly_account = nextProps.getNotificationData.data.is_juvly_account;
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;

          // reset unread notification count into header
          let unreadNotificationCount = document.getElementById('unread-notification-count');
          if(unreadNotificationCount != null && unreadNotificationCount != undefined){
            unreadNotificationCount.innerHTML= ''
            unreadNotificationCount.classList.add('no-display')
          }

        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.getNotificationData != nextProps.getNotificationData.data.data &&
        prevState.getNotificationData.length != 0
      ) {
        returnState.getNotificationData = [
          ...prevState.getNotificationData,
          ...nextProps.getNotificationData.data.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.getNotificationData.data.next_page_url;
        returnState.is_juvly_account = nextProps.getNotificationData.data.is_juvly_account;
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
          <ul className={this.state.is_juvly_account === 0 ? "sub-menu no-display" : "sub-menu"}>
            <li><Link name="smsNotificationname" to="/dashboard/sms-notifications" >{this.state.SMS_Notifications}</Link></li>
            <li><Link name="Notificationname" to="/dashboard/notifications" className="active" >{this.state.Notifications}</Link></li>
          </ul>
          <div className={this.state.is_juvly_account === 0 ? "title" : "title no-display"} >
        		<span>{this.state.Notifications}</span>
        	</div>
          <div className="juvly-section full-width">
            <div className="setting-search-outer">
              {this.state.getNotificationData && this.state.getNotificationData.length > 0 && <span className="search-text pull-right">{this.state.SMS_Notifications_All_Time_displayed}</span>}
            </div>
            <div className="activity-outer delete-activity">
              {
                this.state.getNotificationData && this.state.getNotificationData.length > 0 &&
                  this.state.getNotificationData.map((obj, idx) => {
                    return (
                    <div className="activity-row cursor-pointer" key = {idx}>
                      <div className={this.renderColorClass(obj.notification_type)}>{obj.notification_type.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="activity-detail" dangerouslySetInnerHTML={{ __html: obj.notification_message }}></div>
                      <div className="activity-time">{showFormattedDate(obj.created, false)}</div>
                      <a href="#" className="trash-activity"  data-userid= {obj.id} onClick = {this.showDeleteModal.bind(this)} ><i className="fas fa-trash-alt"  data-userid= {obj.id} onClick = {this.showDeleteModal.bind(this)} /></a>
                    </div>
                  );
              })}
          {this.state.getNotificationData == undefined || this.state.getNotificationData.length == 0 && (this.state.showLoader === false) && <div className="no-record">{this.state.dashboard_No_record_found} </div>}
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
  if (state.DashboardReducer.action === "NOTIFICATION_LIST") {
    return {
      getNotificationData: state.DashboardReducer.data
    }
  }
  else if (state.DashboardReducer.action === "DELETE_NOTIFICATION_DATA") {
    localStorage.setItem('isDelete', false);
    if (state.DashboardReducer.data.status === 200) {
      return {
        isReloadPage: true,
        message: languageData.global[state.DashboardReducer.data.message]
      }
  }
  else {
    toast.error(languageData.global[state.DashboardReducer.data.message]);
  }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchNotifications: fetchNotifications, deleteNotifications: deleteNotifications }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notifications);
