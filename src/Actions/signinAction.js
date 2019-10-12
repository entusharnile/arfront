import axios from 'axios';
import config from '../config';
import {setToken,setConfigData} from '../Utils/services.js';
let url = config.API_URL;
const signinInstance = axios.create();
signinInstance.interceptors.response.use(function (response) {
	if(response.headers.access_token) {
		setToken(response.headers.access_token);
	}
  if(response.data != undefined && response.data.global_settings != undefined){
    setConfigData(response.data.global_settings);
  }
	return response;
}, function (error) {
	if (error.response.data.status === 602) {
		localStorage.setItem('blockIP', 1);
		localStorage.removeItem('showRecaptcha');
		window.location.href = '/block-ip';
	}
	return Promise.reject(error);
});

//=======Login action==========

export function userSignInRequest(userData) {
	return dispatch => {
		signinInstance.post(url + "login", userData).then(response => {
			dispatch({ "type": "LOGIN_SUCCESSFULL", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "LOGIN_ERROR", "payload": error.response.data });
			}
		});
	}
}
export function signTosAgreement(formData) {
	return false;
	return dispatch => {
		signinInstance.post(url + "sign-tos-agreement", formData).then(response => {
			dispatch({ "type": "SIGN_TOS_AGREEMENT", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "SIGN_TOS_AGREEMENT", "payload": error.response.data });
			}
		});
	}
}


export function doAutoLogin(cipeher) {
	return dispatch => {
		signinInstance.get(url + "switch-to-new/" + cipeher).then(response => {
			dispatch({ "type": "DO_AUTO_LOGIN", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "DO_AUTO_LOGIN", "payload": error.response.data });
			}
		});
	}
}

export function verifyOTP(formData, mode) {
	return dispatch => {
		let apiVerificationUrl = (mode == 'sms_otp') ? 'verify-sms-otp' : 'google-autenticator';

		signinInstance.post(url + apiVerificationUrl, formData).then(response => {
			dispatch({ "type": "VERIFY_OTP", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "VERIFY_OTP", "payload": error.response.data });
			}
		});
	}
}
