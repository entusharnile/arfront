import React, { Component } from 'react';
import Header from '../../Containers/Guest/Header.js';
import Footer from '../../Containers/Guest/Footer.js';
import axios from 'axios';
import config from '../../config';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import { UserResetPasswordForm } from '../../Actions/ForgotPasswordAction.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";

import { Link } from 'react-router-dom'


class ForgotPassword extends React.Component {
  constructor(props) {
		super(props);
		this.state = {
			email: '',
			emailError: '',
      showProcess: '',
      pwdchangeMessage:'',
      status:''
		};

    this.handleInputChange = this.handleInputChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));

    if ( !languageData || languageData.global === undefined || !languageData.global ) {
      axios.get(config.API_URL + `getLanguageText/1/guest`)
      .then(res => {

        const languageData = res.data.data;
        localStorage.setItem('languageData', JSON.stringify(languageData))

        this.setState({
          resetPasswordLabel : languageData['global']['resetPasswordLabel'],
          enterYourEmail: languageData['global']['enterYourEmail'],
          emailAddress: languageData['global']['emailAddress'],
          backToLoginBtn : languageData['global']['backToLoginBtn'],
          resetPasswordBtnn : languageData['global']['resetPasswordBtnn']
        })
      })
      .catch(function (error) {
      });
    } else {

      this.setState({
        resetPasswordLabel : languageData['global']['resetPasswordLabel'],
        enterYourEmail: languageData['global']['enterYourEmail'],
        emailAddress: languageData['global']['emailAddress'],
        backToLoginBtn : languageData['global']['backToLoginBtn'],
        resetPasswordBtnn : languageData['global']['resetPasswordBtnn']
      })
    }
  }

  handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		this.setState({ [event.target.name]: value });
	}

  handleSubmit(event) {

		event.preventDefault();

		//====Frontend validation=================
		let error = false;
		this.setState({ emailError: "" });
		if (typeof this.state.email === undefined || this.state.email === null || this.state.email === '') {
			toast.error("Email can not be blank!");
			error = true;
		} else if (!validator.isEmail(this.state.email)) {
			toast.error("Incorrect email address");
			error = true;
		}

	  if (error === true) {
			return;
		}

		// //======End frontend validation=========

		this.setState({ showProcess: 1 });
		let formData = {
      email: this.state.email,
      language_id: 1
		}
    // alert('Please check you email for the link')

    this.props.UserResetPasswordForm(formData);
    this.setState({ email: '' }
    )
	}
  render() {
    return (
      <div className="guest">
        <Header />
          <div className="login-container">
            <div className="login-main">
              <h1>{this.state.resetPasswordLabel}</h1>
                <form  onSubmit={this.handleSubmit} >
                <div className="form-group">
              <label htmlFor="usr">{this.state.enterYourEmail}</label>
            <input name="email" className="form-control" placeholder={this.state.emailAddress} maxLength="500" type="text" id="UserEmailId" value={this.state.email} onChange={this.handleInputChange} />
          </div>

          <div className="form-group">
            <div className="backtologin pull-left">
              <Link to="/login" className="back-btn"><i className="fa fa-arrow-left" ></i> &nbsp;{this.state.backToLoginBtn}</Link>
            </div>
            <div className="resetpswd pull-right">
              <div className="submit"><input className="full-width" type="submit" value={this.state.resetPasswordBtnn} /></div>
            </div>
          </div>
          </form>
        </div>
        </div>
        <Footer />
      </div>
    );
  }
}

const mapStateToProps = state => {
  if (state.UserReducer.action === "FORGOT_PASSWORD") {
      const returnState = {};
      toast.dismiss();
      const languageData = JSON.parse(localStorage.getItem('languageData'));

      if (state.UserReducer.data.status != 200) {
        toast.error(languageData.global[state.UserReducer.data.message]);

        returnState.pwdchangeMessage = state.UserReducer.data.message;
        returnState.status = state.UserReducer.data.status;

      } else {
        returnState.status = 200;
        returnState.email= '';
        toast.success(languageData.global[state.UserReducer.data.message]);
      }

      return returnState;
  } else {
      return {
        pwdchangeMessage: ''
      }
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    UserResetPasswordForm : bindActionCreators(UserResetPasswordForm, dispatch)
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ForgotPassword));
