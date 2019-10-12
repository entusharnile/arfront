import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

positionFooterCorrectly();
const dashInstance = axios.create();
dashInstance.defaults.headers.common['access-token'] = getToken();

dashInstance.interceptors.response.use(function (response) {
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

export function getUserLogs(formData) {
    return dispatch => {
        dashInstance.get(url + "user-logs", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "USER_LOGS_LIST", "payload": response.data });
            dispatch(exportEmptyData({}));
        }).catch(error => {
            dispatch({ "type": "USER_LOGS_LIST", "payload": error.response.data });
        });
    }
}

export function fetchSMSNotifications(formData) {
    return dispatch => {
        dashInstance.get(url + "dashboard/sms-notifications" , ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SMS_NOTIFICATION_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SMS_NOTIFICATION_LIST", "payload": error.response.data });
        });
    }
}

export function fetchNotifications(formData) {
    return dispatch => {
        dashInstance.get(url + "dashboard/notifications" , ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "NOTIFICATION_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "NOTIFICATION_LIST", "payload": error.response.data });
        });
    }
}

export function deleteNotifications(userId) {
    return dispatch => {
        dashInstance.delete(url + "dashboard/notifications/" + userId).then(response => {
            dispatch({ "type": "DELETE_NOTIFICATION_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_NOTIFICATION_DATA", "payload": error.response.data });
        });
    }
}

export function exportCsv(formData) {
    return dispatch => {
        dashInstance.get(url + "user-logs/export", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EXPORT_CSV", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EXPORT_CSV", "payload": error.response.data });
        });
    }
}
export function viewChanges(objectType,childId,objectId) {
    return dispatch => {
        dashInstance.get(url + "user-logs/view-changes/"+objectType+'/'+childId+'/'+objectId).then(response => {
            dispatch({ "type": "VIEW_CHANGES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "VIEW_CHANGES", "payload": error.response.data });
        });
    }
}


export function fetchClinicsDashboard(formData) {
    return dispatch => {
        dashInstance.get(url + "dashboard/index", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "FETCH_DASH_CLINICS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_DASH_CLINICS", "payload": error.response.data });
        });
    }
  }

export const fetchSMSNotificationsPopups = (smsId) => {
    return dispatch => {
        dashInstance.get(url + "dashboard/sms-notifications/"+smsId ).then(response => {
            dispatch({ "type": "SELECTED_SMS_POPUPS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SELECTED_SMS_POPUPS", "payload": error.response.data });
        });
    }
}

export const fetchNotificationsPopupsMenu = () => {
    return dispatch => {
        dashInstance.get(url + "dashboard/header-notifications" ).then(response => {
            dispatch({ "type": "FETCH_POPUPS_MENU", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_POPUPS_MENU", "payload": error.response.data });
        });
    }
}


export const createReply = (formData, smsId) => {
    return dispatch => {
        dashInstance.post(url + "dashboard/sms-reply", ((formData) ? formData : '')).then(response => {
            let previousMessage = response.data.message ;
            let previousStatus = response.data.status ;

            dashInstance.get(url + "dashboard/sms-notifications/"+smsId ).then(responseNew => {
                responseNew.data.message = previousMessage
                responseNew.data.status = previousStatus
                dispatch({ "type": "CREATE_REPLY", "payload": responseNew.data });
            }).catch(error => {
                dispatch({ "type": "CREATE_REPLY", "payload": error.response.data });
            });

        }).catch(error => {
            dispatch({ "type": "CREATE_REPLY", "payload": error.response.data });
        });
    }
}


export const fetchInventoryData = (status, formData) => {
    return dispatch => {
        dashInstance.get(url + "inventory/products/" +status + "?scopes=category" , (formData)).then(response => {
            dispatch({ "type": "PRODUCT_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRODUCT_LIST", "payload": error.response.data });
        });
    }
}

export const fetchCategoriesData = (formData) => {
    return dispatch => {
        dashInstance.get(url + "inventory/product_categories", (formData)).then(response => {
            dispatch({ "type": "CATEGORY_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CATEGORY_LIST", "payload": error.response.data });
        });
    }
}

export const fetchDiscountPackagesData = (formData) => {
    return dispatch => {
        dashInstance.get(url + "discount_packages", (formData)).then(response => {
            dispatch({ "type": "PACKAGES_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PACKAGES_LIST", "payload": error.response.data });
        });
    }
}

export const fetchDiscountGroupData = (formData) => {
    return dispatch => {
        dashInstance.get(url + "discount_groups", (formData)).then(response => {
            dispatch({ "type": "DISCOUNT_GROUP_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DISCOUNT_GROUP_LIST", "payload": error.response.data });
        });
    }
}

export const fetchEGiftCardData = (formData) => {
    return dispatch => {
        dashInstance.get(url + "egift_cards", (formData)).then(response => {
            dispatch({ "type": "EGIFT_CARD_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EGIFT_CARD_LIST", "payload": error.response.data });
        });
    }
}

export function exportEmptyData(formData) {
    return dispatch => {
        dispatch({ "type": "EMPTY_DATA", "payload": {data: '', status:200, message : ''} });
    }
}
