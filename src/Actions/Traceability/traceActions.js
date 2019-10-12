import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

const traceInstance = axios.create();
traceInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
traceInstance.interceptors.response.use(function (response) {
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


export function getTraceData(clientID, procedureID) {
    return dispatch => {
        traceInstance.get(url + "traceability_info/" + clientID + "/" + procedureID).then(response => {
            dispatch({ "type": "GET_TRACE_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_TRACE_DATA", "payload": error.response.data });
        });
    }
}

export function getBatchByProcedure(productID, procedureID, type, traceID) {
    return dispatch => {
        traceInstance.get(url + "traceability/get_batch/" + procedureID + "/" + productID + "/" + type + "/" + traceID).then(response => {
            dispatch({ "type": "GET_BATCH_BY_PROCEDURE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_BATCH_BY_PROCEDURE", "payload": error.response.data });
        });
    }
}

export function getUnits(formData) {
  return dispatch => {
      traceInstance.post(url + "traceability/get_units", ((formData) ? formData : '')).then(response => {
        dispatch({"type": "GET_UNITS_BY_INVENTORY", "payload": response.data});
      }).catch(error =>{
        dispatch({"type": "GET_UNITS_BY_INVENTORY", "payload": error.response.data});
      });
  }
}

export function saveTrace(formData) {
  return dispatch => {
      traceInstance.post(url + "traceability/save", ((formData) ? formData : '')).then(response => {
        dispatch({"type": "SAVE_TRACE", "payload": response.data});
      }).catch(error =>{
        dispatch({"type": "SAVE_TRACE", "payload": error.response.data});
      });
  }
}

export function updateTrace(formData) {
  return dispatch => {
      traceInstance.post(url + "traceability/update", ((formData) ? formData : '')).then(response => {
        dispatch({"type": "UPDATE_TRACE", "payload": response.data});
      }).catch(error =>{
        dispatch({"type": "UPDATE_TRACE", "payload": error.response.data});
      });
  }
}

export function deleteTrace(formData) {
  return dispatch => {
      traceInstance.post(url + "traceability/delete", ((formData) ? formData : '')).then(response => {
        dispatch({"type": "DELETE_TRACE", "payload": response.data});
      }).catch(error =>{
        dispatch({"type": "DELETE_TRACE", "payload": error.response.data});
      });
  }
}
