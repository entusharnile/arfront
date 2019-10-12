import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { fetchNotificationsPopupsMenu } from '../../Actions/Dashboard/dashboardActions';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import axios from 'axios';
import { getToken, handleInvalidToken } from '../../Utils/services.js';
import config from '../../config';

const url = config.API_URL;

const notiMenuInstance = axios.create();
notiMenuInstance.defaults.headers.common['access-token'] = getToken();

class NotificationMenu extends React.Component {
  constructor(props) {
      super(props);

      let userData    = JSON.parse(localStorage.getItem('userData'));

      this.state = {
        notification_message  : [],
        notificationCount     : 0,
        userData              : userData
      };
  }

  static getDerivedStateFromProps(props, state) {
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
    if (props.getNotificationPopupData !== undefined && props.getNotificationPopupData.status === 200 ) {
      let returnState = {}
      returnState.notificationCount = props.getNotificationPopupData.data.unread_notification_count
      returnState.getNotificationPopupData = props.getNotificationPopupData.data.notifications
      returnState.is_juvly_account = props.getNotificationPopupData.data.is_juvly_account
      return returnState;
    }
    else
      return null;
  }

  componentDidMount() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));

    if ( languageData && languageData.global !== undefined && languageData.global !== null ) {
      this.setState({
        Notifications: languageData.global['Notifications'],
        dashboard_See_All: languageData.global['dashboard_See_All']
      })
    }
    let tmpProps = this.props ;
      setInterval(function(){
          notiMenuInstance.get(url + "dashboard/header-notifications" ).then(response => {
            let resData = response.data;
            let returnState = {}

            if(resData && resData.notifications !== undefined && resData.notifications.length > 0) {
              let count = resData.notifications;
              let x = 0;
              count.map((obj, idx) => {
                if (obj.read === 0){
                  x++;
                }
              })
              returnState.notificationCount = x;
              returnState.getNotificationPopupData = resData.notifications
              returnState.is_juvly_account = resData.is_juvly_account
              this.setState(returnState);
            }
          }).catch(error => {
              let msg = error.response.data.message;
              if(msg == 'invalid_token' || msg == 'session_timeout' || msg == 'server_error' || msg == 'token_not_found') {
                  handleInvalidToken();
              }
          });
}, 600000);
    this.props.fetchNotificationsPopupsMenu();
  }

  render() {
    return (
      <div>
      <a id="noti-icon" className="noti-icon notification show-desktop right-menus-a" href = "javascript:void(0)" title="Notifications"><span id='unread-notification-count' className={(this.state.notificationCount) ? 'unread-notification-count' : 'no-display unread-notification-count'}>{this.state.notificationCount}</span> </a>

      <a className="noti-icon notification show-mobile" href={(this.state.userData) && (this.state.userData.user.account_id === config.JUVLY_ACC_ID || this.state.userData.user.account_id === config.CC_ACC_ID) ? "/dashboard/sms-notifications" : "/dashboard/notifications" } title="Notifications">Notification<span className={(this.state.notificationCount) ? '' : 'no-display'}>{this.state.notificationCount}</span> </a>

        <div id="popup" className={this.props.isClicked === true ? "noti-popup" : "no-display" } >
          <div id="notty-title" className="noti-title">{this.state.Notifications}</div>
            <div id="notty-content" className="noti-content">
            {
              this.state.getNotificationPopupData != undefined && this.state.getNotificationPopupData.length > 0 &&
                this.state.getNotificationPopupData.map((obj, idx) => {
                  if (obj.notification_message != '') {
                    return (
                    <div dangerouslySetInnerHTML={{ __html: obj.notification_message }} className={obj.read === 1 ? "read" : "unread-notty" } key={idx} >
                    </div>
                    );
                  }
            })}
            { this.state.getNotificationPopupData == undefined || this.state.getNotificationPopupData.length === 0 && <div>You don’t have any notifications</div> }
            </div>
          <div id="notty-footer" className="noti-footer">
            <Link to={this.state.is_juvly_account === 0 ? "/dashboard/notifications" : "/dashboard/sms-notifications" }>{this.state.dashboard_See_All}</Link>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.DashboardReducer.action === "FETCH_POPUPS_MENU") {
    if(state.DashboardReducer.data.status != 200){
      returnState.showLoader = false
    }
    else {
      returnState.getNotificationPopupData= state.DashboardReducer.data
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchNotificationsPopupsMenu: fetchNotificationsPopupsMenu }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationMenu);
