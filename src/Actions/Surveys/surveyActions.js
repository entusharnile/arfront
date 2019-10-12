import axios from 'axios';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';

import config from '../../config';
let url = config.API_URL;

const surveysInstance = axios.create();
surveysInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
surveysInstance.interceptors.response.use(function (response) {
  if(response.data != undefined && response.data.global_settings != undefined){
    setConfigData(response.data.global_settings);
  }
  positionFooterCorrectly();
  return response;
}, function (error) {
   if(!error.response) {
      console.log('>>>>>>>>>')
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

export function fetchSurveys (formData) {
	return dispatch => {
		surveysInstance.get(url + "marketing/dashboard", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "All_SURVEYS", "payload": response.data });
		}).catch(error => {
			console.log(error);
			dispatch({ "type": "All_SURVEYS", "payload": error.response.data });
		});
	}
}

export function surveysList (formData) {
	return dispatch => {
		surveysInstance.post(url + "marketing/survey_list", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "SURVEYS_LIST", "payload": response.data });
		}).catch(error => {
			console.log(error);
			dispatch({ "type": "SURVEYS_LIST", "payload": error.response.data });
		});
	}
}
export function surveysListQuestions (questionId,formData) {
	return dispatch => {
		surveysInstance.get(url + "marketing/survey_details/"+questionId , ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "SURVEYS_LIST_QUESTIONS", "payload": response.data });
		}).catch(error => {
			console.log(error);
			dispatch({ "type": "SURVEYS_LIST_QUESTIONS", "payload": error.response.data });
		});
	}
}
export function surveysListing(formData){
  return dispatch => {
		surveysInstance.get(url + "survey", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "SURVEYS_LISTING", "payload": response.data });
		}).catch(error => {
			console.log(error);
			dispatch({ "type": "SURVEYS_LISTING", "payload": error.response.data });
		});
	}
}
export function updateSortOrder(formData, type) {
    return dispatch => {
        surveysInstance.put(url + "update/row/order/" + type, (formData)).then(response => {
            dispatch({ "type": "SORT_ORDER_UPDATE_SURVEY", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SORT_ORDER_UPDATE_SURVEY", "payload": error.response.data });
        });
    }
}
export const getTemplateData=(templateId)=>{
  return dispatch => {
    surveysInstance.get(url + "get-survey-by-id/"+templateId).then(response => {
      dispatch({ "type": "SURVEY_TEMPLATE_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SURVEY_TEMPLATE_DATA", "payload": error.response.data });
    });
  }
}

export const saveTemplateData = (formData)=>{
  return dispatch => {
    surveysInstance.post(url + "add-edit-survey", formData).then(response => {
      dispatch({ "type": "SAVE_SURVEY_TEMPLATE_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SAVE_SURVEY_TEMPLATE_DATA", "payload": error.response.data });
    });
  }
}

export const deleteTemplate = (id)=>{
  return dispatch => {
    surveysInstance.delete(url + "survey/"+id).then(response => {
      dispatch({ "type": "DELETE_SURVEY_TEMPLATE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "DELETE_SURVEY_TEMPLATE", "payload": error.response.data });
    });
  }
}
export const togglePublish = (id)=>{
  return dispatch => {
    surveysInstance.get(url + "survey-published/"+id).then(response => {
      dispatch({ "type": "SURVEY_PUBLISH_STATUS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SURVEY_PUBLISH_STATUS", "payload": error.response.data });
    });
  }
}
