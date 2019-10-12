import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

const procedureInstance = axios.create();
procedureInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
procedureInstance.interceptors.response.use(function (response) {
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



export function getProcedureData(clientID, procedureID) {
  return dispatch => {
    procedureInstance.get(url + "procedure-details/" + clientID + "/" + procedureID).then(response => {
      dispatch({"type": "GET_PROCEDURE_DATA", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "GET_PROCEDURE_DATA", "payload": error.response.data});
    });
  }
}

export function getApptConsultData(formData) {
  return dispatch => {
    procedureInstance.post(url + "get-appointment-consultaion-data", ((formData) ? formData : '')).then(response => {
      dispatch({"type": "GET_APPT_CONSULT_DATA", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "GET_APPT_CONSULT_DATA", "payload": error.response.data});
    });
  }
}

export function saveProcedure(formData) {
  return dispatch => {
    procedureInstance.post(url + "create-procedure", ((formData) ? formData : '')).then(response => {
      dispatch({"type": "CREATE_PROCEDURE", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "CREATE_PROCEDURE", "payload": error.response.data});
    });
  }
}

export function updateProcedure(formData, procedureID) {
  return dispatch => {
    procedureInstance.patch(url + "update-procedure/" + procedureID, ((formData) ? formData : '')).then(response => {
      dispatch({"type": "UPDATE_PROCEDURE", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "UPDATE_PROCEDURE", "payload": error.response.data});
    });
  }
}

export function getAssociatedClinics(providerID) {
  return dispatch => {
    procedureInstance.get(url + "get-associated-clinics/" + providerID).then(response => {
      dispatch({"type": "GET_ASSOCIATED_CLINICS", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "GET_ASSOCIATED_CLINICS", "payload": error.response.data});
    });
  }
}

export function deleteProcedure(patientID, procedureID) {
  return dispatch => {
    procedureInstance.delete(url + "delete-procedure/" + patientID + "/" + procedureID).then(response => {
      dispatch({"type": "DELETE_PROCEDURE", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "DELETE_PROCEDURE", "payload": error.response.data});
    });
  }
}

export function getHealthProcedureData(clientID, procedureID) {
  return dispatch => {
    procedureInstance.get(url + "clients/procedure-health-timeline/" + clientID + "/" + procedureID).then(response => {
      dispatch({"type": "GET_HEALTH_PROCEDURE_DATA", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "GET_HEALTH_PROCEDURE_DATA", "payload": error.response.data});
    });
  }
}

export function saveHealthProcedureData(clientID,procedureId,formData) {
  return dispatch => {
    procedureInstance.post(url + "clients/procedure-health-timeline/"+clientID+'/'+procedureId, ((formData) ? formData : '') ).then(response => {
      dispatch({"type": "SAVE_HEALTH_PROCEDURE_DATA", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "SAVE_HEALTH_PROCEDURE_DATA", "payload": error.response.data});
    });
  }
}

export function deleteHealthProcedureData(formData) {
  return dispatch => {
    procedureInstance.delete(url + "clients/procedure-health-timeline", ((formData) ? formData : '') ).then(response => {
      dispatch({"type": "DELETE_HEALTH_PROCEDURE_DATA", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "DELETE_HEALTH_PROCEDURE_DATA", "payload": error.response.data});
    });
  }
}

export function vieweHealthProcedureData(formData, procedureId) {
  return dispatch => {
    procedureInstance.get(url + "clients/health-procedure-view/"+procedureId, (formData)).then(response => {
      dispatch({"type": "VIEW_HEALTH_PROCEDURE_DATA", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "VIEW_HEALTH_PROCEDURE_DATA", "payload": error.response.data});
    });
  }
}

export function getProcedureTemplateData(procedureTemplateId) {
  return dispatch => {
    procedureInstance.get(url + "clients/procedure-template-view/" + procedureTemplateId).then(response => {
      dispatch({"type": "GET_HEALTH_PROCEDURE_TEMPLATE_DATA", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "GET_HEALTH_PROCEDURE_TEMPLATE_DATA", "payload": error.response.data});
    });
  }
}

export function getProcedurePrescription(procedureId) {
  return dispatch => {
    procedureInstance.get(url + "clients/prescription/"+procedureId,).then(response => {
      dispatch({"type": "GET_HEALTH_PROCEDURE_PRESCRIPTION", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "GET_HEALTH_PROCEDURE_PRESCRIPTION", "payload": error.response.data});
    });
  }
}

export function saveProcedurePrescription(procedureId,formData) {
  return dispatch => {
    procedureInstance.post(url + "clients/prescription/"+procedureId, ((formData) ? formData : '') ).then(response => {
      dispatch({"type": "SAVE_HEALTH_PROCEDURE_PRESCRIPTION", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "SAVE_HEALTH_PROCEDURE_PRESCRIPTION", "payload": error.response.data});
    });
  }
}

export function deleteProcedurePrescription(procedureId) {
  return dispatch => {
    procedureInstance.delete(url + "clients/prescription/"+procedureId).then(response => {
      dispatch({"type": "DELETE_HEALTH_PROCEDURE_PRESCRIPTION", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "DELETE_HEALTH_PROCEDURE_PRESCRIPTION", "payload": error.response.data});
    });
  }
}

export function getProcedureConsent(procedureId) {
  return dispatch => {
    procedureInstance.get(url + "clients/health-procedure-consents/"+procedureId).then(response => {
      dispatch({"type": "GET_HEALTH_PROCEDURE_CONSENT", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "GET_HEALTH_PROCEDURE_CONSENT", "payload": error.response.data});
    });
  }
}

export function updateProcedureConsent(procedureId,formData) {
  return dispatch => {
    procedureInstance.put(url + "clients/health-procedure-consents/"+procedureId, ((formData) ? formData : '') ).then(response => {
      dispatch({"type": "UPDATE_HEALTH_PROCEDURE_CONSENT", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "UPDATE_HEALTH_PROCEDURE_CONSENT", "payload": error.response.data});
    });
  }
}

export function sendProcedurePrescription(procedureId,clientID) {
  return dispatch => {
    procedureInstance.get(url + "clients/send-prescription/"+procedureId+'/'+clientID).then(response => {
      dispatch({"type": "SEND_HEALTH_PROCEDURE_PRESCRIPTION", "payload": response.data});
    }).catch(error =>{
      dispatch({"type": "SEND_HEALTH_PROCEDURE_PRESCRIPTION", "payload": error.response.data});
    });
  }
}

export function emptyProcedureReducer() {
  return dispatch => {
    dispatch({"type": "EMPTY_PROCEDURE_REDUCER", "payload": {data: '', status:200, message : ''}});
  }
}

export function fetchSelectMD () {
    return dispatch => {
        procedureInstance.get(url + "user/get-all-mds").then(response => {
            dispatch({ "type": "PRO_MDS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRO_MDS_LIST", "payload": error.response.data });
        });
    }
}

const serialize = function(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

export function signProcedure(formData, fetchRows, listData, roomType) {
    fetchRows = fetchRows || false;
    listData  = listData || {params:{}};

    return dispatch => {
        procedureInstance.post(url + roomType + "/sign-consents?"+serialize(listData.params), (formData)).then(response => {
          console.log(response);
            response.data.status  = 201;
            dispatch({ "type": "SIGN_HEALTH_PROCEDURE", "payload": response.data });

        }).catch(error => {
            dispatch({ "type": "SIGN_HEALTH_PROCEDURE", "payload": error.response.data });
        })
    }
}
