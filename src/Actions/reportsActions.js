import axios from 'axios';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../Utils/services.js';

import config from '../config';
let url = config.API_URL;

const reportsInstance = axios.create();
reportsInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
reportsInstance.interceptors.response.use(function (response) {
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

export const fetchReports = (formData,id) => {
	return dispatch => {
		reportsInstance.get(url + "reports/"+id, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "REPORTS_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "REPORTS_LIST", "payload": error.response.data });
		});
	}
}

export const getReportTypes = (formData,id) => {
	return dispatch => {
		reportsInstance.get(url + "reports/edit/"+id, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "GET_REPORT_TYPES", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "GET_REPORT_TYPES", "payload": error.response.data });
		});
	}
}
export const createReports = (formData,id) => {
	return dispatch => {
		reportsInstance.post(url + "reports/"+0, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "CREATE_REPORTS", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "CREATE_REPORTS", "payload": error.response.data });
		});
	}
}
export const updateReports = (formData,id) => {
	return dispatch => {
		reportsInstance.put(url + "reports/"+id, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "UPDATE_REPORTS", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "UPDATE_REPORTS", "payload": error.response.data });
		});
	}
}
export const deleteReports = (formData,id) => {
	return dispatch => {
		reportsInstance.delete(url + "reports/"+id, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "DELETE_REPORTS", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "DELETE_REPORTS", "payload": error.response.data });
		});
	}
}
export const exportReports = (formData,report_id,type) => {
	return dispatch => {
		reportsInstance.get(url + "reports/export/"+report_id+"/"+type, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "EXPORT_REPORTS", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "EXPORT_REPORTS", "payload": error.response.data });
		});
	}
}
