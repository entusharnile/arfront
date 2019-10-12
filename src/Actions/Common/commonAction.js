import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;
positionFooterCorrectly();
const commonActionInstance = axios.create();
commonActionInstance.defaults.headers.common['access-token'] = getToken();

commonActionInstance.interceptors.response.use(function (response) {
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

export function geCommonTrackEvent(trackValue) {
    return dispatch => {
        commonActionInstance.get(url + "track-heap-event/"+trackValue).then(response => {
            dispatch({ "type": "GET_TRACK_HEAP_EVENT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_TRACK_HEAP_EVENT", "payload": error.response.data });
        });
    }
}
