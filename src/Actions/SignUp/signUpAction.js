import axios from 'axios';
import config from '../../config';
import {setToken, setConfigData, positionFooterCorrectly} from '../../Utils/services.js';
let url = config.API_URL;
const signUpInstance = axios.create();
positionFooterCorrectly();
signUpInstance.interceptors.response.use(function (response) {
	if(response.headers.access_token) {
		setToken(response.headers.access_token);
	}

	if(response.data != undefined && response.data.global_settings != undefined){
    setConfigData(response.data.global_settings);
  }
  positionFooterCorrectly();
	return response;
}, function (error) {
	if (error.response.data.status === 602) {
		localStorage.setItem('blockIP', 1);
		localStorage.removeItem('showRecaptcha')
		window.location.href = '/block-ip';
	}
	return Promise.reject(error);
});

export function signUp() {
	return dispatch => {
		dispatch({ "type": "SIGN_UP"});
	}
}

export function getSignUpAccountStatus(formData) {
	return dispatch => {
		//dispatch({ "type": "SIGN_UP"});
		signUpInstance.post(url + "signup-account-status", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "GET_SIGNUP_ACCOUNT_STATUS", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "GET_SIGNUP_ACCOUNT_STATUS", "payload": error.response.data });
			}
		});
	}
}

export function checkUniqueEmail(emailData) {
	return dispatch => {
		dispatch({ "type": "SIGN_UP"});
		signUpInstance.post(url + "check-email-id", emailData).then(response => {
			dispatch({ "type": "UNIQUE_EMAIL", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "UNIQUE_EMAIL", "payload": error.response.data });
			}
		});
	}
}

export function getSignUpPlans() {
	return dispatch => {
		dispatch({ "type": "SIGN_UP"});
		signUpInstance.get(url + "signup-plans").then(response => {
			dispatch({ "type": "SIGN_UP_PLANS", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "SIGN_UP_PLANS", "payload": error.response.data });
			}
		});
	}
}

export function signUpBasic(signUpData) {
	return dispatch => {
		dispatch({ "type": "SIGN_UP"});
		signUpInstance.post(url + "signup-basic", signUpData).then(response => {
			dispatch({ "type": "SIGN_UP_BASIC", "payload": response.data});
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "SIGN_UP_BASIC", "payload": error.response.data});
			}
		});
	}
}

export function signUpPremium(signUpData) {
	return dispatch => {
		dispatch({ "type": "SIGN_UP"});
		signUpInstance.post(url + "signup-premium", signUpData).then(response => {
			dispatch({ "type": "SIGN_UP_PREMIUM", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "SIGN_UP_PREMIUM", "payload": error.response.data });
			}
		});
	}
}
