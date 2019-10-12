import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;
positionFooterCorrectly();
const clientNoteInstance = axios.create();
clientNoteInstance.defaults.headers.common['access-token'] = getToken();

clientNoteInstance.interceptors.response.use(function (response) {
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


export function geClientNotes(formData) {
    return dispatch => {
        clientNoteInstance.get(url + "client-notes", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "GET_CLIENT_NOTES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_CLIENT_NOTES", "payload": error.response.data });
        });
    }
}

export function saveClientNote(formData, noteID) {
      noteID = noteID || 0;

      if ( noteID && noteID > 0 ) {
        return dispatch => {
          clientNoteInstance.patch(url + "client-notes/" + noteID, (formData)).then(response => {
              dispatch({ "type": "UPDATE_CLIENT_NOTE", "payload": response.data })
          }).catch(error => {
              dispatch({ "type": "UPDATE_CLIENT_NOTE", "payload": error.response.data })
          })
        }
      } else {
        return dispatch => {
          clientNoteInstance.post(url + "client-notes", (formData)).then(response => {
              dispatch({ "type": "SAVE_CLIENT_NOTES", "payload": response.data })
          }).catch(error => {
              dispatch({ "type": "SAVE_CLIENT_NOTES", "payload": error.response.data })
          })
        }
      }
}

export function deleteClientNote(noteID, patientID) {
    return dispatch => {
        clientNoteInstance.delete(url + "client-notes/" + noteID).then(response => {
          dispatch({ "type": "DELETE_CLIENT_NOTE", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "DELETE_CLIENT_NOTE", "payload": error.response.data });
        });
    }
}

export function getAClientNote(noteID) {
    return dispatch => {
        clientNoteInstance.get(url + "client-notes/" + noteID).then(response => {
            dispatch({ "type": "GET_CLIENT_NOTE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_CLIENT_NOTE", "payload": error.response.data });
        });
    }
}
