import React, { Component } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import { getSignUpAccountStatus } from '../../Actions/SignUp/signUpAction.js';
import { ToastContainer, toast } from "react-toastify";

import config from '../../config';

const redirectToLogin = () => {
  localStorage.removeItem('accountSetupFile');
  localStorage.removeItem('accountSetupStatus');
  window.location.href = '/login';
}

class AccountSetup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      accountSetupFile: '',
      accountSetupStatus: 0,
      accountSetupData: {},
      accountType: '',
      currentStatus: '',
      checkingStatus: true,
      globalLang: {},
      isAccountSetupDone: false,
      interval: '',
    };
  }

  componentDidMount() {
    if (!localStorage.getItem('languageData') || localStorage.getItem('languageData').global === undefined || !localStorage.getItem('languageData').global) {
      axios.get(config.API_URL + `getLanguageText/1/global`)
        .then(res => {
          const languageData = res.data.data;
          localStorage.setItem('languageData', JSON.stringify(languageData))
          this.setState({ globalLang: languageData.global, currentStatus: languageData.global.autobots_setting_up_your_account })
        })
        .catch(function (error) {
        });
    } else {
      const languageData = JSON.parse(localStorage.getItem('languageData'))
      this.setState({ globalLang: languageData.global, currentStatus: languageData.global.autobots_setting_up_your_account })
    }

    const accountType = this.props.match.params.type;
    if (accountType == 'basic' || accountType == 'premium') {
      this.setState({ accountType: accountType })
    } else {
      redirectToLogin();
    }
    const accountSetupFile = localStorage.getItem('accountSetupFile');
    if (accountSetupFile != undefined && accountSetupFile != null && accountSetupFile != '') {
      let accountSetupStatus = localStorage.getItem('accountSetupStatus');
      if (accountSetupStatus == undefined || accountSetupStatus == null || accountSetupStatus == 'null' || accountSetupStatus <= 0) {
        accountSetupStatus = 0;
        localStorage.setItem('accountSetupStatus', accountSetupStatus);
      } else {
        accountSetupStatus = accountSetupStatus - 1;
        accountSetupStatus = parseInt(accountSetupStatus);
      }
      this.setState({ accountSetupFile: accountSetupFile, accountSetupStatus: accountSetupStatus, checkingStatus: false });
      this.getSignUpAccountStatus(accountSetupFile, accountSetupStatus);
      const _self = this;
      let interval = setInterval(function () {
        _self.getSignUpAccountStatus(accountSetupFile);
      }, 2000);
      this.setState({ interval: interval })
    } else {
      redirectToLogin();
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
    } else if (nextProps.accountSetupData !== undefined && nextProps.accountSetupData !== prevState.accountSetupData) {
      returnState.accountSetupData = nextProps.accountSetupData;
      if (nextProps.accountSetupData.return_text != undefined && nextProps.accountSetupData.return_text !== '' && nextProps.accountSetupData.return_text !== prevState.currentStatus) {
        returnState.currentStatus = prevState.globalLang[nextProps.accountSetupData.return_text];
        if (nextProps.accountSetupData.return_text.toLowerCase().trim() == 'autobots_setup_completed') {
          returnState.isAccountSetupDone = true;
        } else {
          returnState.accountSetupStatus = prevState.accountSetupStatus + 1;
          localStorage.setItem('accountSetupStatus', parseInt(returnState.accountSetupStatus));
        }
      }
    }
    return returnState;
  }

  getSignUpAccountStatus = (accountSetupFile, accountSetupStatus) => {
    accountSetupStatus = accountSetupStatus || this.state.accountSetupStatus;
    if (this.state.isAccountSetupDone) {
      clearInterval(this.state.interval);
      const _self = this;
      _self.setState({ currentStatus: _self.state.globalLang.autobots_setup_redirect_login_page });
      setTimeout(function () {
        redirectToLogin();
      }, 2000);
    } else {
      this.props.getSignUpAccountStatus({ file_name: accountSetupFile, line_number: accountSetupStatus });
    }
  }



  render() {
    return (
      <div className="guest">
        <Header />
        <div className='sign-up-account-setup'>
          <div className="container">
            <div className="thanku">
              <h2 className="current-status">{(!this.state.checkingStatus) ? this.state.currentStatus : null}</h2>
              <h3 className="static-line">{(!this.state.checkingStatus) ? this.state.globalLang.autobots_are_working_background : null}</h3>
              <img src="/images/account-loader.gif" className="account-loader" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => {
  let returnState = {};
  if (state.SignUpReducer.action === "GET_SIGNUP_ACCOUNT_STATUS") {
    if (state.SignUpReducer.data.status != 200) {
      returnState.showLoader = false
    }
    else if (state.SignUpReducer.data.status == 400) {
      redirectToLogin();
    }
    else {
        returnState.accountSetupData = state.SignUpReducer.data.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getSignUpAccountStatus: getSignUpAccountStatus
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AccountSetup));
