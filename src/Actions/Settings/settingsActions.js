import axios from 'axios';
import config from '../../config';
import { getToken,setConfigData, handleInvalidToken, positionFooterCorrectly, setToken } from '../../Utils/services.js';
import { id } from 'postcss-selector-parser';
let url = config.API_URL;
const settingInstance = axios.create();
settingInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
settingInstance.interceptors.response.use(function (response) {
  // update access-token if logged-user update user-data (in case of self) - START
  if(response.headers.access_token) {
    if(getToken() !== response.headers.access_token){
		  setToken(response.headers.access_token);
    }
	}
  // update access-token if logged-user update user-data (in case of self) - END
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


export function fetchUsers(formData) {
    return dispatch => {
        settingInstance.get(url + "users", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "USERS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "USERS_LIST", "payload": error.response.data });
        });
    }
}

export function getUser(userId, mode) {
    return dispatch => {
        settingInstance.get(url + "users/" + userId + "?scopes=clinics,privileges").then(response => {
            if(mode == 'profile') {
                dispatch({ "type": "PROFILE_GET", "payload": response.data });
            } else {
                dispatch({ "type": "USER_GET", "payload": response.data });
            }

        }).catch(error => {
            if(mode == 'profile') {
                dispatch({ "type": "PROFILE_GET", "payload": error.response.data });
            } else {
                dispatch({ "type": "USER_GET", "payload": error.response.data });
            }
        });
    }
}

export function deleteUser(delUserId) {
    return dispatch => {
        settingInstance.delete(url + "users/" + delUserId ).then(response => {
            dispatch({ "type": "USER_DELETE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "USER_DELETE", "payload": error.response.data });
        });
    }
}

export function userProfile(formData, userId, mode) {
    return dispatch => {
        settingInstance.patch(url + "users/" + userId, (formData)).then(response => {
            if(mode == 'profile') {
                dispatch({ "type": "PROFILE_UPDATE", "payload": response.data });
            } else {
                dispatch({ "type": "USER_UPDATE", "payload": response.data });
            }
        }).catch(error => {
             if(mode == 'profile') {
                dispatch({ "type": "PROFILE_UPDATE", "payload": error.response.data });
            } else {
                dispatch({ "type": "USER_UPDATE", "payload": error.response.data });
            }

        })
    }
}
export function postEmailUpdate(formData) {
    return dispatch => {
        settingInstance.put(url + "post-treatment-email", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "POST_TREATMENT_EMAIL_UPDATE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "POST_TREATMENT_EMAIL_UPDATE", "payload": error.response.data });
        })
    }
}
export function preEmailUpdate(formData) {
    return dispatch => {
        settingInstance.put(url + "pre-treatment-email", ((formData) ? formData : '')).then(response => {

            dispatch({ "type": "PRE_TREATMENT_EMAIL_UPDATE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRE_TREATMENT_EMAIL_UPDATE", "payload": error.response.data });
        })
    }
}

export function fetchQuestionnaire(formData) {
    return dispatch => {
        settingInstance.get(url + "questionnaires", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "QUESTIONNAIRES_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "QUESTIONNAIRES_LIST", "payload": error.response.data });
        });
    }
}

export function updateSortOrder(formData, type) {
    return dispatch => {
        settingInstance.put(url + "update/row/order/" + type, (formData)).then(response => {
            dispatch({ "type": "SORT_ORDER_UPDATE", "payload": response.data });
            dispatch(exportEmptyData({}));
        }).catch(error => {
            dispatch({ "type": "SORT_ORDER_UPDATE", "payload": error.response.data });
            dispatch(exportEmptyData({}));
        });
    }
}
export function fetchPosttreatmentInstructions(formData) {

    return dispatch => {
        settingInstance.get(url + "post-treatment-instructions", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "POST_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "POST_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        });
    }
}
export function fetchPretreatmentInstructions(formData) {
    return dispatch => {
        settingInstance.get(url + "pre-treatment-instructions", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        });
    }
}

export function uploadImage(formData) {
    return dispatch => {
        settingInstance.post(url + "media/upload", (formData)).then(response => {
            dispatch({ "type": "FILE_UPLOADED", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FILE_UPLOADED", "payload": error.response.data });
        })
    }
}

export function getPostTreatmentEmail(formData) {
    return dispatch => {
        settingInstance.get(url + "post-treatment-email", (formData)).then(response => {
            dispatch({ "type": "POST_TREATMENT_EMAIL_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "POST_TREATMENT_EMAIL_LIST", "payload": error.response.data });
        })
    }
}

export function getAccountDetails(accountID,scopes) {
    return dispatch => {
        settingInstance.get(url + "accounts/" + accountID + "?scopes="+scopes).then(response => {
            dispatch({ "type": "ACCOUNT_GET", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "ACCOUNT_GET", "payload": error.response.data })
        })
    }
}

export function updateAccountDetails(formData, accountID) {
    return dispatch => {
        settingInstance.put(url + "accounts/" + accountID, (formData)).then(response => {
            dispatch({ "type": "ACCOUNT_PUT", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "ACCOUNT_PUT", "payload": error.response.data })
        })
    }
}
export function fetchRolePermissions(roleId) {
    return dispatch => {
        settingInstance.get(url + "user-role/" + roleId, ).then(response => {
            dispatch({ "type": "PRIVILEGE_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRIVILEGE_LIST", "payload": error.response.data });
        })
    }
}

export function saveRolePrivileges(formData) {
    return dispatch => {
        settingInstance.put(url + "user-role", (formData)).then(response => {
            dispatch({ "type": "PRIVILEGE_UPDATE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRIVILEGE_UPDATE", "payload": error.response.data });
        })
    }
}

export function getAppointment() {
    return dispatch => {
        settingInstance.get(url + "appointments/setting/email_sms").then(response => {
            dispatch({ "type": "APPOINTMENT_GET", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "APPOINTMENT_GET", "payload": error.response.data });
        });
    }
}

export function getSidebarText(languageEndpoint) {
    return dispatch => {
        settingInstance.get(url + "getLanguageText/1/" + languageEndpoint).then(response => {
            dispatch({ "type": "SETTING_SIDEBAR_TEXT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SETTING_SIDEBAR_TEXT", "payload": error.response.data });
        })
    }
}
export function getPreTreatmentEmail(formData) {
    return dispatch => {
        settingInstance.get(url + "pre-treatment-email", (formData)).then(response => {
            dispatch({ "type": "PRE_TREATMENT_EMAIL_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRE_TREATMENT_EMAIL_LIST", "payload": error.response.data });
        })
    }
}
export function getAppointmentReminder(formData) {
    return dispatch => {
        settingInstance.get(url + "appointments/setting/appointment-reminders", (formData)).then(response => {
            dispatch({ "type": "APPOINTMENT_REMINDER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "APPOINTMENT_REMINDER", "payload": error.response.data });
        })
    }
}
export function deleteAppointmentReminder(userId) {
    return dispatch => {
        settingInstance.delete(url + "appointments/setting/appointment-reminders/" + userId).then(response => {
            dispatch({ "type": "DELETE_APPOINTMENT_REMINDER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_APPOINTMENT_REMINDER", "payload": error.response.data });
        });
    }
}
export function updateAppointmentReminder(formData, reminderId) {
    return dispatch => {
        settingInstance.put(url + "appointments/setting/appointment-reminders/" + reminderId, (formData)).then(response => {
            dispatch({ "type": "UPDATE_APPOINTMENT_REMINDER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_APPOINTMENT_REMINDER", "payload": error.response.data });
        })
    }
}
export function createAppointmentReminder(formData) {
    return dispatch => {
        settingInstance.post(url + "appointments/setting/appointment-reminders", (formData)).then(response => {
            dispatch({ "type": "CREATE_APPOINTMENT_REMINDER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_APPOINTMENT_REMINDER", "payload": error.response.data });
        })
    }
}
export function getEditAppointmentReminder(reminderId) {
    return dispatch => {
        settingInstance.get(url + "appointments/setting/appointment-reminders/" + reminderId).then(response => {
            dispatch({ "type": "GET_EDIT_APPOINTMENT_REMINDER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_EDIT_APPOINTMENT_REMINDER", "payload": error.response.data });
        });
    }
}

export function uploadBase64Image(formData) {
    return dispatch => {
        settingInstance.post(url + "upload/signature", (formData)).then(response => {
            dispatch({ "type": "BASE64_UPLOAD", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "BASE64_UPLOAD", "payload": error.response.data });
        })
    }
}
export const fetchConsents = (formData) => {
    return dispatch => {
        settingInstance.get(url + "consents", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CONSENTS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CONSENTS_LIST", "payload": error.response.data });
        });
    }
}
export const fetchSelectedConsent = (formData, consentId) => {
    return dispatch => {
        settingInstance.get(url + "consents/" + consentId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SELECTED_CONSENTS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SELECTED_CONSENTS_LIST", "payload": error.response.data });
        });
    }
}
export const createConsent = (formData) => {
    return dispatch => {
        settingInstance.post(url + "consents", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_CONSENTS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_CONSENTS", "payload": error.response.data });
        });
    }
}
export const updateSelectedConsent = (formData, consentId) => {
    return dispatch => {
        settingInstance.patch(url + "consents/" + consentId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_SELECTED_CONSENTS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_SELECTED_CONSENTS", "payload": error.response.data });
        });
    }
}
export const deleteConsent = (consentId) => {
    return dispatch => {
        settingInstance.delete(url + "consents/" + consentId).then(response => {
            dispatch({ "type": "CONSENT_DELETED", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CONSENT_DELETED", "payload": error.response.data });
        });
    }
}
export function getBookingURL() {
    return dispatch => {
        settingInstance.get(url + "appointments/setting/booking-urls").then(response => {
            dispatch({ "type": "GET_BOOKING_URL_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_BOOKING_URL_LIST", "payload": error.response.data });
        })
    }
}
export function updateBookingURL(formData) {
    return dispatch => {
        settingInstance.put(url + "appointments/setting/booking-urls", (formData)).then(response => {
            dispatch({ "type": "UPDATE_BOOKING_URL_LIST", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "UPDATE_BOOKING_URL_LIST", "payload": error.response.data })
        })
    }
}
/*
export function getMembershipWallet() {
    return dispatch => {
        settingInstance.get(url + "account/wallet-membership-setting").then(response => {
            dispatch({ "type": "GET_MEMBERSHIP_WALLET_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_MEMBERSHIP_WALLET_LIST", "payload": error.response.data });
        })
    }
}
export function updateMembershipWallet(formData) {
    return dispatch => {
        settingInstance.put(url + "account/wallet-membership-setting", (formData)).then(response => {
            dispatch({ "type": "UPDATE_MEMBERSHIP_WALLET_LIST", "payload": response.data })
        }).catch(error => {
            dispatch({ "type": "UPDATE_MEMBERSHIP_WALLET_LIST", "payload": error.response.data })
        })
    }
}
*/

export function getPatientPortal(formData) {
    return dispatch => {
        settingInstance.get(url + "appointments/setting/patient-portal", (formData)).then(response => {
            dispatch({ "type": "GET_PATIENT_PORTAL", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_PATIENT_PORTAL", "payload": error.response.data });
        });
    }

}
export function updatePatientPortal(formData) {
    return dispatch => {
        settingInstance.put(url + "appointments/setting/patient-portal", (formData)).then(response => {
            dispatch({ "type": "UPDATE_PATIENT_PORTAL", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_PATIENT_PORTAL", "payload": error.response.data });
        });
    }
}

export function getCancellationPolicy(formData) {
    return dispatch => {
        settingInstance.get(url + "appointments/setting/cancellation-policy", (formData)).then(response => {
            dispatch({ "type": "GET_CANCELLATION_POLICY", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_CANCELLATION_POLICY", "payload": error.response.data });
        });
    }
}

export function cancellationPolicyStatus(formData) {
    return dispatch => {
        settingInstance.put(url + "enable-disable-settings", (formData)).then(response => {
            let payload
            dispatch({ "type": "CANCELLATION_POLICY_STATUS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CANCELLATION_POLICY_STATUS", "payload": error.response.data });
        });
    }
}

export function activatePatientPortal(formData) {
    return dispatch => {
        settingInstance.post(url + "appointments/setting/patient-portal/activate-all", (formData)).then(response => {
            dispatch({ "type": "ACTIVATE_PATIENT_PORTAL", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "ACTIVATE_PATIENT_PORTAL", "payload": error.response.data });
        });
    }
}

export function updateCancellationPolicy(formData) {
    return dispatch => {
        settingInstance.put(url + "appointments/setting/cancellation-policy", (formData)).then(response => {
            dispatch({ "type": "UPDATE_CANCELLATION_POLICY", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_CANCELLATION_POLICY", "payload": error.response.data });
        });
    }
}

export function updateAppointment(formData) {
    return dispatch => {
        settingInstance.put(url + "appointments/setting/email_sms", (formData)).then(response => {
            dispatch({ "type": "APPOINTMENT_UPDATE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "APPOINTMENT_UPDATE", "payload": error.response.data });
        });
    }
}
export function createUser(formData) {
    return dispatch => {
        settingInstance.post(url + "users", (formData)).then(response => {
            dispatch({ "type": "USER_CREATE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "USER_CREATE", "payload": error.response.data });
        })
    }
}
export function fetchSelectMD () {
    return dispatch => {
        settingInstance.get(url + "user/get-all-mds").then(response => {
            dispatch({ "type": "MDS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "MDS_LIST", "payload": error.response.data });
        });
    }
}


export const fetchMDRoomData = (formData) => {
    return dispatch => {
        settingInstance.get(url + "md-room/get-procedures" , (formData)).then(response => {
            dispatch({ "type": "MDRoom_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "MDRoom_LIST", "payload": error.response.data });
        });
    }
}
export const fetchProviderRoomData = (formData) => {
    return dispatch => {
        settingInstance.get(url + "provider-room/get-procedures" , (formData)).then(response => {
            dispatch({ "type": "ProviderRoom_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "ProviderRoom_LIST", "payload": error.response.data });
        });
    }
}
export const fetchUserRoomData = (id, formData, roomType) => {
    return dispatch => {
        settingInstance.get(url + roomType + "/get-procedures/"+id , (formData)).then(response => {
            dispatch({ "type": "userRoomData_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "userRoomData_LIST", "payload": error.response.data });
        });
    }
}

export function createPosttreatmentInstructions(formData) {

    return dispatch => {
        settingInstance.post(url + "post-treatment-instructions", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_POST_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_POST_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        });
    }
}
export function fetchSelectedPosttreatmentInstructions(formData,postId) {

    return dispatch => {
        settingInstance.get(url + "post-treatment-instructions/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SELECTED_POST_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SELECTED_POST_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        });
    }
}
export function updateSelectedPosttreatmentInstructions(formData,postId) {
    return dispatch => {
        settingInstance.patch(url + "post-treatment-instructions/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_POST_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_POST_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        })
    }
}
export function createPretreatmentInstructions(formData) {
    return dispatch => {
        settingInstance.post(url + "pre-treatment-instructions", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        });
    }
}
export function fetchSelectedPretreatmentInstructions(formData,preId) {
    return dispatch => {
        settingInstance.get(url + "pre-treatment-instructions/"+preId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SELECTED_PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SELECTED_PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        });
    }
}
export function updateSelectedPretreatmentInstructions(formData,preId) {
    return dispatch => {
        settingInstance.patch(url + "pre-treatment-instructions/"+preId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        });
    }
}
export function deleteSelectedPretreatmentInstructions(preId) {
    return dispatch => {
        settingInstance.delete(url + "pre-treatment-instructions/"+preId).then(response => {
            dispatch({ "type": "DELETE_PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_PRE_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        });
    }
}
export function deleteSelectedPosttreatmentInstructions(postId) {
    return dispatch => {
        settingInstance.delete(url + "post-treatment-instructions/"+postId).then(response => {
            dispatch({ "type": "DELETE_POST_TREATMENT_INSTRUCTIONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_POST_TREATMENT_INSTRUCTIONS_LIST", "payload": error.response.data });
        })
    }
}
export const createQuestionnaire = (formData1) => {
    return dispatch => {
        settingInstance.post(url + "questionnaires", ((formData1) ? formData1 : '')).then(response => {
            dispatch({ "type": "CREATE_QUESTIONNAIRES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_QUESTIONNAIRES", "payload": error.response.data });
        });
    }
}
export const updateQuestionnaire = (formData1, qId) => {
    return dispatch => {
        settingInstance.put(url + "questionnaires/"+qId, ((formData1) ? formData1 : '')).then(response => {
            dispatch({ "type": "UPDATE_QUESTIONNAIRES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_QUESTIONNAIRES", "payload": error.response.data });
        });
    }
}

export const updateQuestion = (formData, qId, question_id) => {
    return dispatch => {
        settingInstance.put(url + "questionnaires/"+qId+"/question/"+question_id, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_QUESTION", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_QUESTION", "payload": error.response.data });
        });
    }
}
export const createQuestion = (formData, id) => {
    return dispatch => {
        settingInstance.post(url + "questionnaires/" + id + "/question", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_QUESTION", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_QUESTION", "payload": error.response.data });
        });
    }
}

export const getQuestionnaireById = (id) => {
    return dispatch => {
        settingInstance.get(url + "questionnaires/" + id + '?scopes=questions' ).then(response => {
            dispatch({ "type": "GET_QUESTIONNAIRE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_QUESTIONNAIRE", "payload": error.response.data });
        });
    }
}

export const getQuestionById = (id, question_id) => {
    return dispatch => {
        settingInstance.get(url + `questionnaires/${id}/question/${question_id}` ).then(response => {
            dispatch({ "type": "GET_QUESTION", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_QUESTION", "payload": error.response.data });
        });
    }
}
export const deleteQuestion = (qId, question_id) => {
    return dispatch => {
        settingInstance.delete(url + "questionnaires/" + qId + '/question/'+question_id).then(response => {
            dispatch({ "type": "QUESTION_DELETED", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "QUESTION_DELETED", "payload": error.response.data });
        });
    }
}
export const deleteQuestionnaire = (qId) => {
    return dispatch => {
        settingInstance.delete(url + "questionnaires/" + qId).then(response => {
            dispatch({ "type": "QUESTIONNAIRE_DELETED", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "QUESTIONNAIRE_DELETED", "payload": error.response.data });
        });
    }
}
export function saveUserPrivileges(formData) {
    return dispatch => {
        settingInstance.post(url + "user/edit-privilege", (formData)).then(response => {
            dispatch({ "type": "USER_PRIVILEGE_UPDATE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "USER_PRIVILEGE_UPDATE", "payload": error.response.data });
        })
    }
}

export function deleteProcedureNote(noteID) {
    return dispatch => {
        settingInstance.delete(url + "procedure-notes/" + noteID).then(response => {
          dispatch({ "type": "SETTING_DELETE_PROCEDURE_NOTE", "payload": response.data });
        }).catch(error => {
          dispatch({ "type": "SETTING_DELETE_PROCEDURE_NOTE", "payload": error.response.data });
        });
    }
}

export function get2FA(formData) {
    return dispatch => {
        settingInstance.get(url + "user/2fa", (formData)).then(response => {
            dispatch({ "type": "USER_2FA_GET", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "USER_2FA_GET", "payload": error.response.data });
        })
    }
}

export function disable2FA(formData) {
    return dispatch => {
        settingInstance.patch(url + "user/2fa", (formData)).then(response => {
            dispatch({ "type": "USER_2FA_DISABLED", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "USER_2FA_DISABLED", "payload": error.response.data });
        })
    }
}

export function getGoogle2FA(formData) {
    return dispatch => {
        settingInstance.get(url + "user/2fa/google", (formData)).then(response => {
            dispatch({ "type": "GOOGLE_2FA_GET", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GOOGLE_2FA_GET", "payload": error.response.data });
        })
    }
}

export function verifyGoogleToken(formData) {
    return dispatch => {
        settingInstance.put(url + "user/2fa/google", (formData)).then(response => {
            dispatch({ "type": "GOOGLE_2FA_VERIFY", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GOOGLE_2FA_VERIFY", "payload": error.response.data });
        })
    }
}
export function sendOTP(formData) {
    return dispatch => {
        settingInstance.post(url + "user/2fa/sms", (formData)).then(response => {
            dispatch({ "type": "SEND_OTP", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SEND_OTP", "payload": error.response.data });
        })
    }
}
export function verifyMobileOTP(formData) {
    return dispatch => {
        settingInstance.put(url + "user/2fa/sms", (formData)).then(response => {
            dispatch({ "type": "VERIFY_OTP", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "VERIFY_OTP", "payload": error.response.data });
        })
    }
}

export function exportEmptyData(formData) {
    return dispatch => {
        dispatch({ "type": "EMPTY_DATA", "payload": {data: '', status:200, message : ''} });
    }
}

export function signProcedure(formData, fetchRows, listData, roomType, pageType) {
    fetchRows = fetchRows || false;
    listData  = listData || {};
    pageType  = pageType || 'list'

    return dispatch => {
        settingInstance.post(url + roomType + "/sign-consents", (formData)).then(response => {

          if (fetchRows === true) {
            let previousMessage = response.data.message
            let previousStatus  = response.data.status

            settingInstance.get(url + roomType + "/get-procedures" , (listData)).then(responseNew => {
                responseNew.data.message = previousMessage
                responseNew.data.status  = previousStatus
                dispatch({ "type": "SIGN_PROCEDURE", "payload": responseNew.data });
            }).catch(error => {
                dispatch({ "type": "SIGN_PROCEDURE", "payload": error.response.data });
            });
          } else {
            if ( roomType && roomType === 'provider-room' && pageType === 'detail' ) {
              response.data.status  = 201
            }
            dispatch({ "type": "SIGN_PROCEDURE", "payload": response.data });
          }
        }).catch(error => {
            dispatch({ "type": "SIGN_PROCEDURE", "payload": error.response.data });
        })
    }
}

export function markUnmarkAsAfterPhotos(formData, prodeureID, listData, roomType, pageType) {
    return dispatch => {
        settingInstance.patch(url + "provider-room/mark-unmark-as-after-photos/" + prodeureID, (formData)).then(response => {

          let previousMessage = response.data.message
          let previousStatus  = response.data.status

          let finalUrl        = (pageType && pageType === 'list') ? `/get-procedures` : `/get-procedures/${prodeureID}`

          settingInstance.get(url + roomType + finalUrl , (listData)).then(responseNew => {
              responseNew.data.message = previousMessage
              responseNew.data.status  = previousStatus
              dispatch({ "type": "MARK_UNMARK_AFTER_PHOTOS", "payload": responseNew.data });
          }).catch(error => {
              dispatch({ "type": "MARK_UNMARK_AFTER_PHOTOS", "payload": error.response.data });
          });
        }).catch(error => {
            dispatch({ "type": "MARK_UNMARK_AFTER_PHOTOS", "payload": error.response.data });
        })
    }
}

export function hidemarkAsAfter(prodeureID, listData, roomType, pageType, nextProcedureID) {
    return dispatch => {
        settingInstance.patch(url + "provider-room/hide-procedure/" + prodeureID).then(response => {

          let previousMessage = response.data.message
          let previousStatus  = response.data.status

          let finalUrl        = (pageType && pageType === 'list') ? `/get-procedures` : `/get-procedures/${nextProcedureID}`

          settingInstance.get(url + roomType + finalUrl , (listData)).then(responseNew => {
              responseNew.data.message = previousMessage
              responseNew.data.status  = (pageType && pageType === 'list') ? previousStatus : 201
              dispatch({ "type": "HIDE_MARK_AFTER_PHOTOS", "payload": responseNew.data });
          }).catch(error => {
              dispatch({ "type": "HIDE_MARK_AFTER_PHOTOS", "payload": error.response.data });
          });
        }).catch(error => {
            dispatch({ "type": "HIDE_MARK_AFTER_PHOTOS", "payload": error.response.data });
        })
    }
}

export const fetchClinics = (formData) => {
	return dispatch => {
		settingInstance.get(url + "clinics", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "CLINIC_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "CLINIC_LIST", "payload": error.response.data });
		});
	}
}
export const fetchProcedureQuestionnaire =(procedureId,formData)=>{
  return dispatch => {
      let apiUrl = '';
      if(procedureId) {
          apiUrl = url + "procedure-questionnarie-details/"+procedureId;
      } else {
          apiUrl = url + "procedure-questionnarie-details/";
      }
    settingInstance.get(apiUrl, ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "PROCEDURE_QUESTIONNAIRE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "PROCEDURE_QUESTIONNAIRE", "payload": error.response.data });
    });
  }
}
export const fetchProcedureConsents =(consentsId,formData)=>{
  return dispatch => {
    settingInstance.get(url + "procedure-consent-details/"+consentsId, ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "PROCEDURE_CONSENTS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "PROCEDURE_CONSENTS", "payload": error.response.data });
    });
  }
}
export const updateProcedureQuestionnaire=(questionId,formData)=>{
  return dispatch => {
    settingInstance.put(url + "procedure-questionnarie-details/"+questionId, ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "UPDATE_PROCEDURE_QUESTIONNAIRE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "UPDATE_PROCEDURE_QUESTIONNAIRE", "payload": error.response.data });
    });
  }
}
export const getSubscriptionInvoices=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "subscription-invoices", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_INVOICE_LIST", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_INVOICE_LIST", "payload": error.response.data });
    });
  }
}
export const getSubscriptionInvoiceById=(invoiceId,formData)=>{
  return dispatch => {
    settingInstance.get(url + "subscription-invoice-details/"+invoiceId, ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_INVOICE_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_INVOICE_DATA", "payload": error.response.data });
    });
  }
}
export const payInvoiceById=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pay-invoice", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "PAY_LAST_DUE_INVOICE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "PAY_LAST_DUE_INVOICE", "payload": error.response.data });
    });
  }
}
export const getSubscriptionDetails=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "subscription-details", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_DETAILS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_DETAILS", "payload": error.response.data });
    });
  }
}
export const subscriptionAddOn=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "add-subscription-addon", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_ADD_ON", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_ADD_ON", "payload": error.response.data });
    });
  }
}
export const subscriptionCancelReactivate=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "cancel-resume-plan", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_CANCEL_REACTIVATE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_CANCEL_REACTIVATE", "payload": error.response.data });
    });
  }
}
export const subscriptionUpgradeAccount=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "upgrade-plan", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_UPGRADE_ACCOUNT", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_UPGRADE_ACCOUNT", "payload": error.response.data });
    });
  }
}
export const subscriptionUpdateCard=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "change-suscription-card", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_UPDATE_CARD", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_UPDATE_CARD", "payload": error.response.data });
    });
  }
}
export const subscriptionAutoRefill=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "save-autorefill-settings", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_AUTO_REFILL", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_AUTO_REFILL", "payload": error.response.data });
    });
  }
}
export const getSubscriptionMonthlyEstimate=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "monthly-to-yearly", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_MONTHLY_TO_YEARLY_ESTIMATE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_MONTHLY_TO_YEARLY_ESTIMATE", "payload": error.response.data });
    });
  }
}
export const subscriptionUpgradeToYearly=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "monthly-to-yearly", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBSCRIPTION_MONTHLY_TO_YEARLY_UPGRADE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBSCRIPTION_MONTHLY_TO_YEARLY_UPGRADE", "payload": error.response.data });
    });
  }
}
export const getRecentlyDeleted=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "recently-deleted", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "RECENTLY_DELETED_LIST", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "RECENTLY_DELETED_LIST", "payload": error.response.data });
    });
  }
}
export const restoreRecentlyDeleted=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "restore-procedure", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "RECENTLY_DELETED_RESTORE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "RECENTLY_DELETED_RESTORE", "payload": error.response.data });
    });
  }
}
export const getPosDashboard=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "pos-dashboard", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_DASHBOARD_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_DASHBOARD_DATA", "payload": error.response.data });
    });
  }
}
export const getPosDashboardFilter=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "pos-dashboard-charges", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_DASHBOARD_FILTER_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_DASHBOARD_FILTER_DATA", "payload": error.response.data });
    });
  }
}
export const getPosDashboardVerification=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "pos-verification-fields", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "GET_POS_DASHBOARD_VERIFICATION", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_DASHBOARD_VERIFICATION", "payload": error.response.data });
    });
  }
}
export const savePosDashboardVerification=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-save-verification-fields", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SAVE_POS_DASHBOARD_VERIFICATION", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SAVE_POS_DASHBOARD_VERIFICATION", "payload": error.response.data });
    });
  }
}
export const getPosPayment=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "pos-payments", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_PAYMENT_LIST", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_PAYMENT_LIST", "payload": error.response.data });
    });
  }
}
export const getPosExport=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-export", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_PAYMENT_PAYOUT_EXPORT", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_PAYMENT_PAYOUT_EXPORT", "payload": error.response.data });
    });
  }
}
export const getPosPayout=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "pos-payouts", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_PAYOUT_LIST", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_PAYOUT_LIST", "payload": error.response.data });
    });
  }
}
export const getPosPayoutBank=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "pos-add-payout", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_PAYOUT_BANK_LIST", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_PAYOUT_BANK_LIST", "payload": error.response.data });
    });
  }
}
export const saveNewPosPayout=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-add-payout", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_PAYOUT_NEW", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_PAYOUT_NEW", "payload": error.response.data });
    });
  }
}
export const getPosPayoutDetail=(payoutId)=>{
  return dispatch => {
    settingInstance.get(url + "pos-payout-details/"+payoutId).then(response => {
      dispatch({ "type": "POS_PAYOUT_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_PAYOUT_DATA", "payload": error.response.data });
    });
  }
}

export const getPosDispute=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "pos-disputes", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_DISPUTE_LIST", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_DISPUTE_LIST", "payload": error.response.data });
    });
  }
}
export const getPosDisputeSetting=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "pos-disputes-settings", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_DISPUTE_SETTING_GET", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_DISPUTE_SETTING_GET", "payload": error.response.data });
    });
  }
}
export const savePosDisputeSetting=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-disputes-settings", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_DISPUTE_SETTING_POST", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_DISPUTE_SETTING_POST", "payload": error.response.data });
    });
  }
}


export const getPosData=()=>{
  return dispatch => {
    settingInstance.get(url + "pos").then(response => {
      dispatch({ "type": "GET_POS_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_DATA", "payload": error.response.data });
    });
  }
}

export const changePosStatus=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-change-status", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "CHANGE_POS_STATUS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "CHANGE_POS_STATUS", "payload": error.response.data });
    });
  }
}
export const changePosConnectionStatus=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-change-connection", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "CHANGE_POS_CONNECTION_STATUS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "CHANGE_POS_CONNECTION_STATUS", "payload": error.response.data });
    });
  }
}

export const getPosSetupData=()=>{
  return dispatch => {
    settingInstance.get(url + "pos-setup-custom-account").then(response => {
      dispatch({ "type": "GET_POS_SETUP_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_SETUP_DATA", "payload": error.response.data });
    });
  }
}
export const getPosAdditionalSetupData=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-check-country-spec", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "GET_POS_ADDITIONAL_SETUP_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_ADDITIONAL_SETUP_DATA", "payload": error.response.data });
    });
  }
}
export const savePosSetupData=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-setup-custom-account", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SAVE_POS_SETUP_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SAVE_POS_SETUP_DATA", "payload": error.response.data });
    });
  }
}
export const checkPosStripeBalance=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-check-account-balance", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "CHECK_POS_STRIPE_BALANCE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "CHECK_POS_STRIPE_BALANCE", "payload": error.response.data });
    });
  }
}
export const disconnectPosStripeAcount=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-disconnect-account", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "DISCONNENCT_POS_STRIPE_ACCOUNT", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "DISCONNENCT_POS_STRIPE_ACCOUNT", "payload": error.response.data });
    })
  }
}


export const getProcedureTemplates=(formData)=>{
  return dispatch => {
    settingInstance.get(url + "procedure-templates", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "PROCEDURE_TEMPLATE_LIST", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "PROCEDURE_TEMPLATE_LIST", "payload": error.response.data });
    });
  }
}
export const getTemplateData=(templateId)=>{
  return dispatch => {
    settingInstance.get(url + "get-template-details/"+templateId).then(response => {
      dispatch({ "type": "PROCEDURE_TEMPLATE_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "PROCEDURE_TEMPLATE_DATA", "payload": error.response.data });
    });
  }
}
export const saveTemplateData = (formData)=>{
  return dispatch => {
    settingInstance.post(url + "add-edit-template", formData).then(response => {
      dispatch({ "type": "SAVE_PROCEDURE_TEMPLATE_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SAVE_PROCEDURE_TEMPLATE_DATA", "payload": error.response.data });
    });
  }
}
export const deleteTemplate = (id)=>{
  return dispatch => {
    settingInstance.get(url + "delete-procedure-template/"+id).then(response => {
      dispatch({ "type": "DELETE_PROCEDURE_TEMPLATE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "DELETE_PROCEDURE_TEMPLATE", "payload": error.response.data });
    });
  }
}

export const getPosStripeUpdateFields=(stripeUserId)=>{
  return dispatch => {
    settingInstance.get(url + "pos-update-custom-account/"+stripeUserId).then(response => {
      dispatch({ "type": "GET_POS_STRIPE_ACCOUNT_FIELDS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_STRIPE_ACCOUNT_FIELDS", "payload": error.response.data });
    });
  }
}
export const updatePosStripeAccountFields=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-update-custom-account", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "UPDATE_POS_STRIPE_ACCOUNT", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "UPDATE_POS_STRIPE_ACCOUNT", "payload": error.response.data });
    })
  }
}
export const getPosPaymentSettingData=()=>{
  return dispatch => {
    settingInstance.get(url + "pos-payment-settings").then(response => {
      dispatch({ "type": "GET_POS_PAYMENT_SETTING_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_PAYMENT_SETTING_DATA", "payload": error.response.data });
    })
  }
}
export const getPosBankAccountFields=(clinicId)=>{
  return dispatch => {
    settingInstance.get(url + "pos-add-bank-account/"+clinicId).then(response => {
      dispatch({ "type": "GET_POS_BANK_ACCOUNT_FIELDS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_BANK_ACCOUNT_FIELDS", "payload": error.response.data });
    });
  }
}
export const addPosBankAccount=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-add-bank-account", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "ADD_POS_BANK_ACCOUNT", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "ADD_POS_BANK_ACCOUNT", "payload": error.response.data });
    })
  }
}
export const setPosDefaultBnkAccount=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-set-default-bank", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SET_POS_DEFAULT_BANK_ACCOUNT", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SET_POS_DEFAULT_BANK_ACCOUNT", "payload": error.response.data });
    })
  }
}
export const getPosPayoutScheduleData=(clinicId)=>{
  return dispatch => {
    settingInstance.get(url + "pos-add-payout-schedule/"+clinicId).then(response => {
      dispatch({ "type": "GET_POS_PAYOUT_SCHEDULE_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_PAYOUT_SCHEDULE_DATA", "payload": error.response.data });
    })
  }
}
export const updatePosPayoutScheduleData=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-add-payout-schedule", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "UPDATE_POS_PAYOUT_SCHEDULE_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "UPDATE_POS_PAYOUT_SCHEDULE_DATA", "payload": error.response.data });
    })
  }
}
export const getPosCardReaderData=(clinicId)=>{
  return dispatch => {
    settingInstance.get(url + "pos-clinic-card-devices/"+clinicId).then(response => {
      dispatch({ "type": "GET_POS_CARD_READER_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_CARD_READER_DATA", "payload": error.response.data });
    })
  }
}
export const addPosCardReaderMarchent=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-add-merchant", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "ADD_POS_CARD_READER_MERCHENT", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "ADD_POS_CARD_READER_MERCHENT", "payload": error.response.data });
    })
  }
}
export const changePosCardReaderStatus=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-disable-stripe-is-swipe", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "CHANGE_POS_CARD_READER_STATUS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "CHANGE_POS_CARD_READER_STATUS", "payload": error.response.data });
    })
  }
}
export const addPosCardReaderDevice=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-attach-card-reader", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "ADD_POS_CARD_READER_DEVICE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "ADD_POS_CARD_READER_DEVICE", "payload": error.response.data });
    })
  }
}
export const deletePosCardReaderDevice=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-detach-card-reader", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "DELETE_POS_CARD_READER_DEVICE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "DELETE_POS_CARD_READER_DEVICE", "payload": error.response.data });
    })
  }
}
export const setupPosExpressAccount=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-create-express-account", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "POS_SETUP_EXPRESS_ACCOUNT", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "POS_SETUP_EXPRESS_ACCOUNT", "payload": error.response.data });
    })
  }
}
export const getPosStripeDashboardUrl=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-account-dashboard-url", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "GET_POS_STRIPE_DASHBOARD_URL", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "GET_POS_STRIPE_DASHBOARD_URL", "payload": error.response.data });
    })
  }
}

export const getDefaultUserData=()=>{
  return dispatch => {
    settingInstance.get(url + "user/add-user").then(response => {
      dispatch({ "type": "DEFAULT_USERADD_DATA", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "DEFAULT_USERADD_DATA", "payload": error.response.data });
    })
  }
}

export const getPosDisputeDetails=(disputeId,isEveidence)=>{
  isEveidence = isEveidence | false
  console.log('isEveidence',isEveidence);
  return dispatch => {
    settingInstance.get(url + "pos-disputes-details/"+disputeId).then(response => {
      if(isEveidence){
        dispatch({ "type": "GET_POS_DISPUTE_EVIDENCE", "payload": response.data });
      } else {
        dispatch({ "type": "POS_DISPUTE_DETAIL", "payload": response.data });
      }
    }).catch(error => {
      if(isEveidence){
        dispatch({ "type": "GET_POS_DISPUTE_EVIDENCE", "payload": error.response.data });
      } else {
        dispatch({ "type": "POS_DISPUTE_DETAIL", "payload": error.response.data });
      }
    });
  }
}
export const addPosDisputeNote=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-add-dispute-note", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "ADD_POS_DISPUTE_NOTE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "ADD_POS_DISPUTE_NOTE", "payload": error.response.data });
    });
  }
}
export const acceptPosDispute=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-accept-dispute", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "ACCEPT_POS_DISPUTE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "ACCEPT_POS_DISPUTE", "payload": error.response.data });
    });
  }
}
export const submitPosDispute=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-submit-dispute-evidence", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SUBMIT_POS_DISPUTE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SUBMIT_POS_DISPUTE", "payload": error.response.data });
    });
  }
}
export const saveLaterPosDispute=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "pos-save-evidence-for-later", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "SAVE_LATER_POS_DISPUTE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "SAVE_LATER_POS_DISPUTE", "payload": error.response.data });
    });
  }
}

export const enableGoogleCalendarSync=(formData)=>{
  return dispatch => {
    settingInstance.post(url + "user/sync-with-google-calendar", ((formData) ? formData : '')).then(response => {
      dispatch({ "type": "ENABLE_GOOGLE_CALENDAR_SYNC", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "ENABLE_GOOGLE_CALENDAR_SYNC", "payload": error.response.data });
    });
  }
}
export const disableGoogleCalendarSync=()=>{
  return dispatch => {
    settingInstance.put(url + "user/disable-google-sync").then(response => {
      dispatch({ "type": "DISABLE_GOOGLE_CALENDAR_SYNC", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "DISABLE_GOOGLE_CALENDAR_SYNC", "payload": error.response.data });
    });
  }
}
export const updateToggleAPI=(formData)=>{
  return dispatch => {
    settingInstance.put(url + "appointments/setting/patient-portal-link-status", ((formData)? formData : '')).then(response => {
      dispatch({ "type": "PATIENT_PORTAL", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "PATIENT_PORTAL", "payload": error.response.data });
    });
  }
}
export const downloadTos=(tosType)=>{
  return dispatch => {
    settingInstance.get(url + "download-tos/"+tosType).then(response => {
      dispatch({ "type": "DOWNLOAD_TOS", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "DOWNLOAD_TOS", "payload": error.response.data });
    });
  }
}
export const downloadInvoice=(invoiceId)=>{
  return dispatch => {
    settingInstance.get(url + "download-invoice/"+invoiceId).then(response => {
      dispatch({ "type": "DOWNLOAD_INVOICE", "payload": response.data });
    }).catch(error => {
      dispatch({ "type": "DOWNLOAD_INVOICE", "payload": error.response.data });
    });
  }
}

