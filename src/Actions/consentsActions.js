import axios from 'axios';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../Utils/services.js';

import config from '../config';
let url = config.API_URL;

const consentsInstance = axios.create();
consentsInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
consentsInstance.interceptors.response.use(function (response) {
  if(response.data != undefined && response.data.global_settings != undefined){
    setConfigData(response.data.global_settings);
  }
  positionFooterCorrectly();
  return response;
}, function (error) {
   if(!error.response) {
      return {data : {data : "", message : "server_error", status : 500}}
   } else {
      if(error.response.status == 500) {
        return {data : {data : "", message : "server_error", status : 500}}
      }  
      let msg = error.response.data.message;
      if(msg == 'invalid_token' || msg == 'session_timeout' || msg == 'server_error' || msg == 'token_not_found') {
          handleInvalidToken();
      }

      return Promise.reject(error);
   }
});

export const fetchConsents = (formData) => {
	return dispatch => {
		consentsInstance.get(url + "consents", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "CONSENTS_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "CONSENTS_LIST", "payload": error.response.data });
		});
	}
}
export const fetchSelectedConsent = (formData,consentId) => {
	return dispatch => {
		consentsInstance.get(url + "consents/"+consentId, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "SELECTED_CONSENTS_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "SELECTED_CONSENTS_LIST", "payload": error.response.data });
		});
	}
}
export const createConsent = (formData) => {
	return dispatch => {
		consentsInstance.post(url + "consents", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "CREATE_CONSENTS", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "CREATE_CONSENTS", "payload": error.response.data });
		});
	}
}
export const updateSelectedConsent = (formData,consentId) => {
	return dispatch => {
		consentsInstance.patch(url + "consents/"+consentId, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "UPDATE_SELECTED_CONSENTS", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "UPDATE_SELECTED_CONSENTS", "payload": error.response.data });
		});
	}
}
