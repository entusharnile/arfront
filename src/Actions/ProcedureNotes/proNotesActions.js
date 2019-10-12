import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

const proNoteInstance = axios.create();
proNoteInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
proNoteInstance.interceptors.response.use(function (response) {
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


export function getProcedureNotes(formData) {
    return dispatch => {
        proNoteInstance.get(url + "procedure-notes", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "GET_PROCEDURE_NOTES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_PROCEDURE_NOTES", "payload": error.response.data });
        });
    }
}

export function saveProcedureNote(formData, noteID) {
      noteID = noteID || 0;

      if ( noteID && noteID > 0 ) {
        return dispatch => {
          proNoteInstance.patch(url + "procedure-notes/" + noteID, (formData)).then(response => {
              dispatch({ "type": "UPDATE_PROCEDURE_NOTE", "payload": response.data });
          }).catch(error => {
              dispatch({ "type": "UPDATE_PROCEDURE_NOTE", "payload": error.response.data })
          })
        }
      } else {
        return dispatch => {
          proNoteInstance.post(url + "procedure-notes", (formData)).then(response => {
              dispatch({ "type": "SAVE_PROCEDURE_NOTES", "payload": response.data });
          }).catch(error => {
              dispatch({ "type": "SAVE_PROCEDURE_NOTES", "payload": error.response.data })
          })
        }
      }
}

export function deleteProcedureNote(noteID) {
    return dispatch => {
        proNoteInstance.delete(url + "procedure-notes/" + noteID).then(response => {
          dispatch({ "type": "DELETE_PROCEDURE_NOTE", "payload": response.data });
        }).catch(error => {
          dispatch({ "type": "DELETE_PROCEDURE_NOTE", "payload": error.response.data });
        });
    }
}

export function getAProcedureNote(noteID) {
    return dispatch => {
        proNoteInstance.get(url + "procedure-notes/" + noteID).then(response => {
            dispatch({ "type": "GET_PROCEDURE_NOTE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_PROCEDURE_NOTE", "payload": error.response.data });
        });
    }
}
