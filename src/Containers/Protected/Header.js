import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom'
import config from '../../config';
import axios from 'axios';
import NotificationMenu from './NotificationMenu';
import { withRouter } from 'react-router';
import { capitalizeFirstLetter,getIsPosEnabled,getIsDashboardEnabled, logout, getRedirectTo } from '../../Utils/services.js';
import { connect } from 'react-redux';
import arLogo from '../../images/logo.png'
const headerInstance = axios.create();

const checkPermission = (globalPermission, specificPermission) => {
    return (globalPermission) && globalPermission.find((str) => str === specificPermission);
}

const renderHeaderMenu = () => {
  let headerMenuContent = []

  let languageData        = JSON.parse(localStorage.getItem('languageData'))
  const userPermissions   = (JSON.parse(localStorage.getItem('userData'))) ? JSON.parse(localStorage.getItem('userData')).permissions : null;
  let headerPermissions   = (userPermissions) ? [...userPermissions] : null;
  let userData            = (JSON.parse(localStorage.getItem('userData'))) ? JSON.parse(localStorage.getItem('userData')) : null;

  let isPOSEnabled        = (getIsPosEnabled()) ? 1: 0; //(userData && userData.account) ? userData.account.pos_enabled : 0;
  let isDashEnabled       = getIsDashboardEnabled(); //(userData && userData.user) ? userData.user.is_dashboard_enabled : false;
  let userRoleID          = (userData && userData.user) ? userData.user.user_role_id : 0;
  let isProvider          = (userData && userData.user) ? userData.user.is_provider : false;

  if ( userData && isPOSEnabled === 1 && isDashEnabled ===  true ) {
      headerMenuContent.push({
        label   : (languageData) && languageData.global['headerDashboard'],
        to      : '/dashboard',
        match   : '/dashboard',
      });
  }

  if ( checkPermission(headerPermissions, 'view-patients') ) {
      headerMenuContent.push({
        label   : (languageData) && languageData.global['header_clients'],
        to      : '/clients',
        match   : '/clients',
      });
  }

  if ( checkPermission(headerPermissions, 'view-appointments') ) {
      headerMenuContent.push({
        label   : (languageData) && languageData.global['header_appointments'],
        to      : '/appointment/index',
        match   : '/appointment',
      });
  }

  if ( isPOSEnabled === 1 && checkPermission(headerPermissions, 'view-sales') ) {
      let toURL = '';

      if ( checkPermission(headerPermissions, 'view-sales-report') ) {
        toURL = '/sales'
      } else if ( checkPermission(headerPermissions, 'view-sales-invoices') ) {
        toURL = '/sales/invoices'
      } else if ( checkPermission(headerPermissions, 'view-sales-invoice-text') ) {
        toURL = '/sales/invoice-text'
      } else if ( checkPermission(headerPermissions, 'view-cash-drawer') ) {
        toURL = '/sales/cash-drawer'
      } else if ( checkPermission(headerPermissions, 'view-sales-goals') ) {
        toURL = '/sales/office-sales-goals'
      }

     /* textInnerInfo.push({
        label   : (languageData) && languageData.global['header_reports'],
        to      : '/reports',
        match   : '/reports',
      });*/
      headerMenuContent.push({
        label   : (languageData) && languageData.global['header_sales'],
        to      : toURL,
        match   : '/sales',
      });
  }

  if ( checkPermission(headerPermissions, 'view-products-inventory') ) {
      headerMenuContent.push({
        label   : (languageData) && languageData.global['header_inventory'],
        to      : '/inventory/products/active',
        match   : '/inventory',
      });
  }

  /*headerMenuContent.push({
    label   : (languageData) && languageData.global['header_reports'],
    to      : '/reports',
    match   : '/reports',
  });*/

  headerMenuContent.push({
    label   : (languageData) && languageData.global['header_surveys'],
    to      : '/surveys/dashboard',
    match   : '/surveys',
  });

  if ( userRoleID === 4 ) {
    headerMenuContent.push({
      label   : (languageData) && languageData.global['header_md_room'],
      to      : '/md-room/pending',
      match   : '/md-room',
    });
  }

  if ( userRoleID === 2 || isProvider === true ) {
    headerMenuContent.push({
      label   : (languageData) && languageData.global['header_provider_room'],
      to      : '/provider-room/pending',
      match   : '/provider-room',
    });
  }

  return [headerMenuContent];
}

class Header extends React.Component {
  constructor(props) {
      super(props);

      let languageData        = JSON.parse(localStorage.getItem('languageData'))
      let userData            = (JSON.parse(localStorage.getItem('userData'))) ? JSON.parse(localStorage.getItem('userData')) : null;
      this.state = {
          email                  : '',
					password               : '',
					isClicked              : false,
          inventoryActive        : 'active',
          headerTextContent      : renderHeaderMenu(),
          globalLang             : (languageData) && languageData.global,
          userData               : userData,
          navTo                  : '',
          isPosEnabled           : getIsPosEnabled(),
          isDashboardEnabled     : getIsDashboardEnabled(),
          currentURL             : '',
      };
	}

	handleClick = (e) =>  {
    this.toggleMenu(e.target);
	}

	toggleMenu = (elem) => {
		if ( elem.id !== 'noti-icon' && this.state.isClicked === false ) {
      return
    }

    let isClicked = false

		if (this.state.isClicked === false && elem.id === 'noti-icon' ) {
      isClicked = true
    } else {
      isClicked = false
    }
    this.setState({isClicked : isClicked})
	}

	componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
	}

  componentDidMount() {
		document.addEventListener('click', this.handleClick, false);
  }

  getActiveClass = (obj) => {
    let returnClass = ""
    if ( obj !== undefined ) {
      obj.map((io, ix) => {
         if ( io.match !== undefined ) {
           if ( window.location.pathname.startsWith(io.match) && !this.manageHeaderClass()) {
             returnClass = "active"
           }
         }
      })
    }
    return {returnClass}
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {}
    if(getIsPosEnabled() !== state.isPosEnabled){
      returnState.isPosEnabled = getIsPosEnabled();
      returnState.headerTextContent =  renderHeaderMenu();
    }
    if(getIsDashboardEnabled() !== state.isDashboardEnabled){
      returnState.isDashboardEnabled = getIsDashboardEnabled();
      returnState.headerTextContent =  renderHeaderMenu();
    }
    if(props.currentURL !== state.currentURL){
      returnState.currentURL = state.currentURL;
      returnState.headerTextContent =  renderHeaderMenu();
    }
    if(props.showLoader != undefined && props.showLoader == false) {
        returnState.showLoader = false
     }
    if ( props.user !== undefined && props.user.status === 200 && props.user.data !== state.user ) {
      returnState.user  = props.user.data
    }

    return returnState
  }


  navClicked = (to) => {
    this.setState({
      navTo : to
    })
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.user !== null && this.state.user !== prevState.user) {
      let userData                      = JSON.parse(localStorage.getItem('userData'));
      userData.user['firstname']        = this.state.user.firstname;
      userData.user['lastname']         = this.state.user.lastname;
      userData.user['user_image_url']   = this.state.user.user_image_url;
      userData                          = JSON.stringify(userData)
      localStorage.setItem('userData', userData);
      this.setState({userUpdated: true})
    }
  }

  logUserOut = () => {
    logout();
  }
  manageHeaderClass = () => {
    let headerActiveClass = '';
    let current_url = (window.location.pathname) ? window.location.pathname.split('/')[2] || '' : '';
    let current_url_segment = (window.location.pathname) ? window.location.pathname.split('/')[1] || '' : '';

      if(current_url_segment === "settings"){
        headerActiveClass = current_url_segment;
      }
      else if(current_url === "notifications" || current_url === "sms-notifications" || current_url === "user-logs"){
        headerActiveClass = (current_url === "sms-notifications") ? "notifications" : current_url;
      }else{
        headerActiveClass = '';
      }
     return headerActiveClass;
  }
  render() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    let oldUrl = (userData) ? userData.old_system_url : "" ;
    let nav = [];
    nav     = this.state.headerTextContent[0].map((obj, idx) => {
                  let activeClass  = '';
                  activeClass      = this.getActiveClass([obj]).returnClass

                  return (
                    <li data-toggle="collapse" data-target="#navbar" onClick={() => this.navClicked(obj.to)} className={activeClass} key={idx} ref={'parents'} >
                      <Link to={obj.to}>
                      <label htmlFor={obj.label}>{obj.label}</label></Link>
                    </li>
                  )
              })

    let firstName = (userData && userData.user && userData.user['firstname']) ? capitalizeFirstLetter(userData.user['firstname']) : '';
    let lastName  = (userData && userData.user && userData.user['lastname']) ? capitalizeFirstLetter(userData.user['lastname']) : ''

    let userName  = firstName + ' ' + lastName;
    let userImage = (userData && userData.user && userData.user['user_image_url']) ? userData.user['user_image_url'] : '../../../images/user.png'

    let url = window.location.pathname;
    let settingsClass = "setting show-desktop right-menus-a";

    if((window.location.pathname) && window.location.pathname.startsWith("/settings")) {
      settingsClass = "setting show-desktop right-menus-a select";
    }

    return (
      <>
        <div className="switch-to-version">
           <img src="/images/left-arrow.png" className="switch-version-arrow"/> <a href={oldUrl}>{"Return to old dashboard"} </a> <img src = "/images/logo-white.png" className="switch-version-logo"/>
        </div>
      	<header>
      		<div className="container-fluid">
      			<div className="navbar-header">
      				<button aria-controls="navbar" aria-expanded="false" className="navbar-toggle collapsed" data-target="#navbar" data-toggle="collapse" type="button">
      					<span className="sr-only">{(this.state.globalLang) && this.state.globalLang.global_toggle_navigation}</span>
      					<span className="icon-bar"></span>
      					<span className="icon-bar"></span><span className="icon-bar"></span>
      				</button>
      				<Link className="navbar-brand" to={getRedirectTo()} onClick={() => this.navClicked(getRedirectTo())}>
      					<img src={arLogo}/>
      				</Link>
      			</div>
      			<div id="navbar" className="navbar-collapse collapse">
      				<div className="nav-outer">

              	<ul className="nav navbar-nav right-menus">
      						<li className={ this.manageHeaderClass() == 'user-logs' ? 'active' : ''} data-toggle="collapse" data-target="#navbar">
      							<Link id="users-logs" className="users-logs show-desktop right-menus-a" onClick={() => this.navClicked('/dashboard/user-logs')} to="/dashboard/user-logs" title="User Activities"></Link>
      							<Link id="users-logs" className="users-logs show-mobile" to="/dashboard/user-logs">{(this.state.globalLang) && this.state.globalLang.global_view_users_activities}</Link>
      						</li>
      						<li className={this.manageHeaderClass() == 'notifications' ? 'active' : ''}  ref={node => {this.node = node}}>
									{<NotificationMenu isClicked = {this.state.isClicked} />}
      						</li>

      						<li className="arow-link-outer">
      							<div className="arow-link">


                      <div className="user-picture" id="headerUserImage" style={{backgroundImage: `url(${userImage})`}}></div>

      								<span className="name-txt">
                        {
                          (userName.length >= 15) ? firstName : userName
                        }
                      </span>
      							</div>
      						</li>

      						<li className={ this.manageHeaderClass() == 'settings' ? 'active' : ''} data-toggle="collapse" data-target="#navbar">
      							<Link className={settingsClass} to="/settings/profile" onClick={this.navClicked.bind(this, "settings")} title="Settings"></Link>
      							<Link className="setting show-mobile" to="/settings/profile">{(this.state.globalLang) && this.state.globalLang.header_settings}</Link>
      						</li>
      						<li data-toggle="collapse" data-target="#navbar">
      							<a className="logout show-desktop right-menus-a" onClick={this.logUserOut} title="Logout"></a>
      							<a className="logout show-mobile" onClick={this.logUserOut}><i className="icon-Power-2"></i>{(this.state.globalLang) && this.state.globalLang.global_log_out}</a>
      						</li>
      					</ul>

                <ul className="nav navbar-nav main-navbar">
                  {nav}
                </ul>
      				</div>
      			</div>
      		</div>
      	</header>
      </>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {
    isPosEnabled : getIsPosEnabled(),
    isDashboardEnabled : getIsDashboardEnabled(),
    currentURL : window.location.pathname
  };
  if (state.SettingReducer.action === "PROFILE_UPDATE") {
    if (state.SettingReducer.data.status != 200) {
      returnState.showLoader = false
    }
    else {
      returnState.user= state.SettingReducer.data
    }
  }
  return returnState;
}

export default connect(mapStateToProps) (withRouter(Header));
