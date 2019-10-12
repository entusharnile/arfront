import axios from 'axios';
import config from '../../config';
import {setToken,setConfigData, positionFooterCorrectly} from '../../Utils/services.js';
let url = config.API_URL;
const accountInstance = axios.create();
accountInstance.interceptors.response.use(function (response) {
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

export function accountReset() {
	return dispatch => {
		dispatch({ "type": "ACCOUNT_RESET"});
	}
}

export function signTosAgreement(formData) {
	return dispatch => {
		dispatch({ "type": "ACCOUNT_RESET"});
		accountInstance.post(url + "sign-tos-agreement", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "ACCEPT_TOS_AGREEMENT", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "ACCEPT_TOS_AGREEMENT", "payload": error.response.data });
			}
		});
	}
}

export function upgradeTrailToPaid(formData) {
	return dispatch => {
		dispatch({ "type": "ACCOUNT_RESET"});
		accountInstance.post(url + "upgrade-plan", formData).then(response => {
			dispatch({ "type": "UPGRADE_TRAIL_TO_PAID", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "UPGRADE_TRAIL_TO_PAID", "payload": error.response.data });
			}
		});
	}
}

export function upgradeRecurlyToStripe(formData) {
	return dispatch => {
		dispatch({ "type": "ACCOUNT_RESET"});
		accountInstance.post(url + "upgrade-account-to-stripe",formData).then(response => {
			dispatch({ "type": "UPGRADE_RECURLY_TO_STRIPE", "payload": response.data });
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "UPGRADE_RECURLY_TO_STRIPE", "payload": error.response.data });
			}
		});
	}
}

export function getAccountPrivileges(formData) {
	return dispatch => {
		dispatch({ "type": "ACCOUNT_RESET"});
		accountInstance.get(url + "privileges", formData).then(response => {
			dispatch({ "type": "GET_ACCOUNT_PRIVILEGES", "payload": response.data});
			if(response.data != undefined && response.data.data != undefined){
				const priviligeData = response.data.data;
				localStorage.setItem('globalPrivileges', JSON.stringify(priviligeData))
			}
		}).catch(error => {
			if(error.response) {
				dispatch({ "type": "GET_ACCOUNT_PRIVILEGES", "payload": error.response.data});
			}
		});
	}
}
