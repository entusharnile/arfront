import axios from 'axios';
import config from '../../config';
import { getToken,setConfigData, handleInvalidToken, positionFooterCorrectly } from '../../Utils/services.js';
import { id } from 'postcss-selector-parser';
let url = config.API_URL;
const dotPhraseInstance = axios.create();
dotPhraseInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
dotPhraseInstance.interceptors.response.use(function (response) {
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

  export function exportEmptyData(formData) {
      return dispatch => {
          dispatch({ "type": "EMPTY_DATA", "payload": {data: '', status:200, message : ''} });
      }
  }

export function fetchDotPhrases(formData) {
    return dispatch => {
        dotPhraseInstance.get(url + "dot-phrase", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "GET_PHRASE_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_PHRASE_DATA", "payload": error.response.data });
        });
    }
}

export function deleteDotPhrase(id) {
    return dispatch => {
        dotPhraseInstance.delete(url + "dot-phrase/" + id).then(response => {
            dispatch({ "type": "DELETE_PHRASE_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_PHRASE_DATA", "payload": error.response.data });
        });
    }
}

export function saveDotPhrase(formData) {
    return dispatch => {
        dotPhraseInstance.post(url + "dot-phrase", (formData)).then(response => {
            dispatch({ "type": "SAVE_PHRASE_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SAVE_PHRASE_DATA", "payload": error.response.data });
        })
    }
}

export function getDotPhrase(id) {
    return dispatch => {
        dotPhraseInstance.get(url + "dot-phrase/" + id).then(response => {
            dispatch({ "type": "GET_A_PHRASE_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_A_PHRASE_DATA", "payload": error.response.data });
        });
    }
}

export function updateDotPhrase(formData, id) {
    return dispatch => {
        dotPhraseInstance.put(url + "dot-phrase/" + id, (formData)).then(response => {
            dispatch({ "type": "UPDATE_PHRASE_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_PHRASE_DATA", "payload": error.response.data });
        })
    }
}
