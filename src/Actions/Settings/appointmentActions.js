import axios from 'axios';

import config from '../../config';
import { getToken, handleInvalidToken, setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

const apptInstance = axios.create();
apptInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
apptInstance.interceptors.response.use(function (response) {
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

export function getAppointmentSurveys(formData) {
   return dispatch => {
       apptInstance.get(url + "appointments/setting/survey_email_sms", (formData)).then(response => {
           dispatch({ "type": "APPOINTMENT_SURVEY_LIST", "payload": response.data });
       }).catch(error => {
           dispatch({ "type": "APPOINTMENT_SURVEY_LIST", "payload": error.response.data });
       })
   }
}
export function postAppointmentSurveys(formData) {
   return dispatch => {
       apptInstance.put(url + "appointments/setting/survey_email_sms", ((formData) ? formData : '')).then(response => {

                     dispatch({ "type": "APPOINTMENT_SURVEY_UPDATE", "payload": response.data });
                 }).catch(error => {
                     dispatch({ "type": "APPOINTMENT_SURVEY_UPDATE", "payload": error.response.data });
                 })
             }
           }
