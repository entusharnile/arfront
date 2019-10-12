import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

const treatInstance = axios.create();
treatInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
treatInstance.interceptors.response.use(function (response) {
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



export function viewTreatmentMarkings(procedureID) {
  return dispatch => {
    treatInstance.get(url + "view_treatment_marking_images/" + procedureID).then(response => {
      dispatch({"type":"VIEW_TREATMENT_MARKINGS","payload":response.data});
    }).catch(error =>{
      dispatch({"type":"VIEW_TREATMENT_MARKINGS","payload":error.response.data});
    });
  }
}
