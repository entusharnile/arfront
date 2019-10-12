import axios from 'axios';
import { getToken, handleInvalidToken, setConfigData, positionFooterCorrectly } from '../Utils/services.js';

import config from '../config';
let url = config.API_URL;

const clinicsInstance = axios.create();
clinicsInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
clinicsInstance.interceptors.response.use(function (response) {
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

export const fetchClinics = (formData) => {
	return dispatch => {
		clinicsInstance.get(url + "clinics", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "CLINIC_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "CLINIC_LIST", "payload": error.response.data });
		});
	}
}
export const fetchSelectedClinic = (formData,clinicId) => {

	return dispatch => {
		clinicsInstance.get(url + "clinics/"+clinicId + "?scopes=business_hours", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "SELECTED_CLINIC_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "SELECTED_CLINIC_LIST", "payload": error.response.data });
		});
	}
}

export const fetchDefaultClinicData = () => {

	return dispatch => {
		clinicsInstance.get(url + "get_clinic_default_data").then(response => {
			dispatch({ "type": "DEFAULT_CLINIC_DATA", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "DEFAULT_CLINIC_DATA", "payload": error.response.data });
		});
	}
}
export const createClinic = (formData) => {
	return dispatch => {
		clinicsInstance.post(url + "clinics", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "CREATE_CLINIC", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "CREATE_CLINIC", "payload": error.response.data });
		});
	}
}
export const updateSelectedClinic = (formData,clinicId) => {
	return dispatch => {
		clinicsInstance.patch(url + "clinics/"+clinicId, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "UPDATE_SELECTED_CLINIC", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "UPDATE_SELECTED_CLINIC", "payload": error.response.data });
		});
	}
}
export const fetchAllTimezone= () => {

	return dispatch => {
		clinicsInstance.get(url + "timezone-list").then(response => {
			dispatch({ "type": "TIMEZONE_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "TIMEZONE_LIST", "payload": error.response.data });
		});
	}
}
export const fetchAllCountries= () => {
	return dispatch => {
		clinicsInstance.get(url + "country-list").then(response => {
			dispatch({ "type": "COUNTRIES_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "COUNTRIES_LIST", "payload": error.response.data });
		});
	}
}

export function getUser(userId) {
    return dispatch => {
        clinicsInstance.get(url + "users/" + userId + "?scopes=clinics,privileges").then(response => {
            dispatch({ "type": "USER_GET", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "USER_GET", "payload": error.response.data });
        })
    }
}
export const deleteClinic = (clinicId) => {
    return dispatch => {
        clinicsInstance.delete(url + "clinics/"+clinicId).then(response => {
            dispatch({ "type": "DELETE_CLINIC", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_CLINIC", "payload": error.response.data });
        });
    }
}
export function exportEmptyData(formData) {
    return dispatch => {
        dispatch({ "type": "EMPTY_DATA", "payload": {data: '', status:200, message : ''} });
    }
}
