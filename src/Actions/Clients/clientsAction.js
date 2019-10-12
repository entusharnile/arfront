import axios from 'axios';
import config from '../../config';
import {getToken, handleInvalidToken,setConfigData, positionFooterCorrectly} from '../../Utils/services.js'
let url = config.API_URL;

const clientInstance = axios.create();
clientInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();



clientInstance.interceptors.response.use(function (response) {
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

export function getAllClients(formData){
  return dispatch => {
    clientInstance.get(url + "clients", ((formData) ? formData : '')).then(response => {
      dispatch({"type":"CLIENTS_LIST","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"CLIENTS_LIST","payload":error.response.data});
    });
  }
}

export function getClinicsProvidersProducts(){
  return dispatch => {
    clientInstance.get(url + "patient-filters/create").then(response => {
      dispatch({"type":"GET_CPP_DATA","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_CPP_DATA","payload":error.response.data});
    });
  }
}

export function createFilter(formData){
  return dispatch => {
    clientInstance.post(url + "patient-filters", ((formData) ? formData : '')).then(response => {
      dispatch({"type":"CREATE_FILTER","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"CREATE_FILTER","payload":error.response.data});
    });
  }
}

export function getAllFilters(){
  return dispatch => {
    clientInstance.get(url + "patient-filters").then(response => {
      dispatch({"type":"GET_ALL_FILTERS","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_ALL_FILTERS","payload":error.response.data});
    });
  }
}

export function getOneFilter(filterId){
  return dispatch => {
    clientInstance.get(url + "patient-filters/"+filterId).then(response => {
      dispatch({"type":"GET_ONE_FILTER","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_ONE_FILTER","payload":error.response.data});
    });
  }
}

export function updateFilter(formData,filterId){
  return dispatch => {
    clientInstance.put(url + "patient-filters/"+filterId, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"UPDATE_FILTER","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"UPDATE_FILTER","payload":error.response.data});
    });
  }
}

export function deleteFilter(filterId){
  return dispatch => {
    clientInstance.delete(url + "patient-filters/"+filterId).then(response => {

      // let previousMessage = response.data.message
      // let previousStatus  = response.data.status
      //
      // clientInstance.get(url + "patient-filters").then(responseNew => {
      //   responseNew.data.message = previousMessage
      //   responseNew.data.status  = previousStatus
      //
      //   dispatch({"type":"DELETE_FILTER","payload":responseNew.data});
      // }).catch(error =>{
      //   console.log(error);
      //   dispatch({"type":"DELETE_FILTER","payload":error.response.data});
      // });
      dispatch({"type":"DELETE_FILTER","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"DELETE_FILTER","payload":error.response.data});
    });
  }
}

export function saveClientFields(formData) {
  return dispatch => {
    clientInstance.post(url + "clients/save_fields", ((formData) ? formData : '')).then(response => {
      dispatch({"type":"SAVE_CLIENT_FIELD","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"SAVE_CLIENT_FIELD","payload":error.response.data});
    });
  }
}

export function getClientDetail(clientID, scopes) {
  return dispatch => {
    clientInstance.get(url + "clients/" + clientID + "?scopes=" + scopes).then(response => {
      dispatch({"type":"GET_CLIENT_DETAIL","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_CLIENT_DETAIL","payload":error.response.data});
    });
  }
}

export function fireClient(clientID) {
    return dispatch => {
        clientInstance.put(url + "clients/fire/" + clientID).then(response => {
            dispatch({ "type": "FIRE_CLIENT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FIRE_CLIENT", "payload": error.response.data });
        })
    }
}

export function doNotCall(clientID) {
    return dispatch => {
        clientInstance.put(url + "clients/do_not_call/" + clientID).then(response => {
            dispatch({ "type": "DNC_CLIENT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DNC_CLIENT", "payload": error.response.data });
        })
    }
}

export function changePortaAccess(clientID) {
    return dispatch => {
        clientInstance.put(url + "clients/change_patient_portal_access/" + clientID).then(response => {
            dispatch({ "type": "CHANGE_PORTAL_CLIENT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CHANGE_PORTAL_CLIENT", "payload": error.response.data });
        })
    }
}

export function getClientCardData(clientID) {
  return dispatch => {
    clientInstance.get(url + "clients/get_cards/" + clientID).then(response => {
      dispatch({"type":"GET_CLIENT_CARDS","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_CLIENT_CARDS","payload":error.response.data});
    });
  }
}

export function saveClientCard(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "clients/save_credit_card/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"SAVE_CLIENT_CARD","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"SAVE_CLIENT_CARD","payload":error.response.data});
    });
  }
}

export function updateMedicalHistory(formData){
  return dispatch => {
    clientInstance.post(url + "clients/medical_history", ((formData) ? formData : '')).then(response => {
      dispatch({"type":"UPDATE_MEDICAL_HISTORY","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"UPDATE_MEDICAL_HISTORY","payload":error.response.data});
    });
  }
}

export function resendWelcomeEmail(clientID) {
  return dispatch => {
    clientInstance.get(url + "clients/resend_portal_email/" + clientID).then(response => {
      dispatch({"type":"RESEND_WELCOME_EMAIL","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"RESEND_WELCOME_EMAIL","payload":error.response.data});
    });
  }
}

export function resetPortalPassword(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "clients/reset_portal_password/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"RESET_CLIENT_PORTAL_PASSWORD","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"RESET_CLIENT_PORTAL_PASSWORD","payload":error.response.data});
    });
  }
}

export function createClient(formData) {
  return dispatch => {
    clientInstance.post(url + "clients",((formData) ? formData : '')).then(response => {
      dispatch({"type":"CREATE_CLIENT","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"CREATE_CLIENT","payload":error.response.data});
    });
  }
}

export function updateClient(clientID, formData) {
  return dispatch => {
    clientInstance.patch(url + "clients/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"UPDATE_CLIENT","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"UPDATE_CLIENT","payload":error.response.data});
    });
  }
}

export function deleteClient(clientID) {
  return dispatch => {
    clientInstance.delete(url + "clients/" + clientID).then(response => {
      dispatch({"type":"DELETE_CLIENT","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"DELETE_CLIENT","payload":error.response.data});
    });
  }
}

export function getClientWallet(clientID) {
  return dispatch => {
    clientInstance.get(url + "client-wallet/" + clientID).then(response => {
      dispatch({"type":"GET_CLIENT_WALLET","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_CLIENT_WALLET","payload":error.response.data});
    });
  }
}

export function addCreditToWallet(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "add-credit/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"ADD_CREDIT_TO_WALLET","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"ADD_CREDIT_TO_WALLET","payload":error.response.data});
    });
  }
}

export function removeCreditFromWallet(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "remove-credit/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"REMOVE_CREDIT_FROM_WALLET","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"REMOVE_CREDIT_FROM_WALLET","payload":error.response.data});
    });
  }
}

export function updateWalletPackage(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "edit-package/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"UPDATE_WALLET_PACKAGE","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"UPDATE_WALLET_PACKAGE","payload":error.response.data});
    });
  }
}

export function removeWalletPackage(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "edit-package/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"REMOVE_WALLET_PACKAGE","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"REMOVE_WALLET_PACKAGE","payload":error.response.data});
    });
  }
}

export function updateMembershipCC(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "update-membership-card-details/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"UPDATE_MEMBERSHIP_CC","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"UPDATE_MEMBERSHIP_CC","payload":error.response.data});
    });
  }
}

export function cancelMembership(clientID) {
  return dispatch => {
    clientInstance.post(url + "cancel-membership-subscription/" + clientID).then(response => {
      dispatch({"type":"CANCEL_MEMBERSHIP","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"CANCEL_MEMBERSHIP","payload":error.response.data});
    });
  }
}

export function addMonthyMembership(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "add-membership-subscription/" + clientID, ((formData) ? formData : '')).then(response => {
      dispatch({"type":"ADD_MONTHLY_MEMBERSHIP","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"ADD_MONTHLY_MEMBERSHIP","payload":error.response.data});
    });
  }
}

export function searchProduct(formData) {
  return dispatch => {
    clientInstance.post(url + "search-product", ((formData) ? formData : '')).then(response => {
      dispatch({"type":"SEARCH_WALLET_PRODUCT","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"SEARCH_WALLET_PRODUCT","payload":error.response.data});
    });
  }
}

export function addPackageProduct(formData) {
  return dispatch => {
    clientInstance.post(url + "add-package-product", ((formData) ? formData : '')).then(response => {
      dispatch({"type":"ADD_PACKAGE_PRODUCT","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"ADD_PACKAGE_PRODUCT","payload":error.response.data});
    });
  }
}

export function getBogoPackageDetails(formData) {
  return dispatch => {
    clientInstance.post(url + "get-bogo-package-details", ((formData) ? formData : '')).then(response => {
      dispatch({"type":"GET_BOGO_PACKAGE_DETAILS","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_BOGO_PACKAGE_DETAILS","payload":error.response.data});
    });
  }
}

export function getProductPriceByClinic(formData) {
  return dispatch => {
    clientInstance.post(url + "get-product-price", ((formData) ? formData : '')).then(response => {
      dispatch({"type":"GET_PRODUCT_PRICE_BY_CLINIC","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_PRODUCT_PRICE_BY_CLINIC","payload":error.response.data});
    });
  }
}

export function exportClients(formData) {
    return dispatch => {
        clientInstance.get(url + "clients_export", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EXPORT_FILE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EXPORT_FILE", "payload": error.response.data });
        });
    }
}

export function exportClientPDF(formData) {
    return dispatch => {
        clientInstance.post(url + "clients/export_patient", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EXPORT_CLIENT_PDF", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EXPORT_CLIENT_PDF", "payload": error.response.data });
        });
    }
}

export function refundFees(formData) {
    return dispatch => {
        clientInstance.post(url + "refundFees", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "REFUND_FEES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "REFUND_FEES", "payload": error.response.data });
        });
    }
}

export function exportEmptyData(formData) {
    return dispatch => {
        dispatch({ "type": "EMPTY_DATA", "payload": {data: '', status:200, message : ''} });
    }
}


export function exportClientProcedures(formData) {
  return dispatch => {
    clientInstance.post(url + "clients/export_procedures", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "EXPORT_CLIENT_PROCEDURES", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "EXPORT_CLIENT_PROCEDURES", "payload": error.response.data });
    });
  }
}

export function clientBulkUpload(formData) {
    return dispatch => {
        clientInstance.post(url + "patient-bulk-upload", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CLIENT_BULK_UPLOAD", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CLIENT_BULK_UPLOAD", "payload": error.response.data });
        });
    }

}

export function viewFilledSurveys(appointmentID, clientID, procedureID) {
  return dispatch => {
    clientInstance.get(url + "get_survey_details/" + appointmentID + "/" + clientID + "/" + procedureID).then(response => {
      dispatch({"type": "VIEW_FILLED_SURVEYS", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "VIEW_FILLED_SURVEYS", "payload":error.response.data});
    });
  }
}

export function sendPostInstructions(appointmentID,procedureID) {
  return dispatch => {
    clientInstance.get(`${url}send_post_treatment_instructions/${ appointmentID}/${ procedureID}`).then(response => {
      dispatch({"type": "SEND_POST_INSTRUCTION", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "SEND_POST_INSTRUCTION", "payload":error.response.data});
    });
  }
}

export function getClientDocuments(formData) {
  return dispatch => {
    clientInstance.get(url + "client-documents", ((formData) ? formData : '')).then(response => {
      dispatch({"type": "CLIENT_DOCUMENT_LIST", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "CLIENT_DOCUMENT_LIST", "payload":error.response.data});
    });
  }
}

export function getClientDocumentData(documentId,formData) {
  return dispatch => {
    clientInstance.get(url + "client-documents/"+documentId, ((formData) ? formData : '')).then(response => {
      dispatch({"type": "CLIENT_DOCUMENT_DATA", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "CLIENT_DOCUMENT_DATA", "payload":error.response.data});
    });
  }
}

export function saveClientDocument(formData) {
  return dispatch => {
    clientInstance.post(url + "client-documents", ((formData) ? formData : '')).then(response => {
      dispatch({"type": "CLIENT_DOCUMENT_SAVE", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "CLIENT_DOCUMENT_SAVE", "payload":error.response.data});
    });
  }
}

export function updateClientDocument(documentId,formData) {
  return dispatch => {
    clientInstance.put(url + "client-documents/"+documentId, ((formData) ? formData : '')).then(response => {
      dispatch({"type": "CLIENT_DOCUMENT_UPDATE", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "CLIENT_DOCUMENT_UPDATE", "payload":error.response.data});
    });
  }
}

export function deleteClientDocument(documentId) {
  return dispatch => {
    clientInstance.delete(url + "client-documents/"+documentId).then(response => {
      dispatch({"type": "CLIENT_DOCUMENT_DELETE", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "CLIENT_DOCUMENT_DELETE", "payload":error.response.data});
    });
  }
}

export function getAfterPhotos(procedureID) {
  return dispatch => {
    clientInstance.get(url + "view_after_images/" + procedureID).then(response => {
      dispatch({"type": "VIEW_AFTER_PHOTOS", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "VIEW_AFTER_PHOTOS", "payload":error.response.data});
    });
  }
}

export function getMembershipData(clientID) {
  return dispatch => {
    clientInstance.get(url + "get-membership-type/" + clientID).then(response => {
      dispatch({"type": "GET_MEMBERSHIP_DETAILS", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "GET_MEMBERSHIP_DETAILS", "payload":error.response.data});
    });
  }
}

export function applyCouponCode(clientID, formData) {
  return dispatch => {
    clientInstance.post(url + "validate-coupon-code/" + clientID, ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "APPLY_DISCOUNT_COUPON", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "APPLY_DISCOUNT_COUPON", "payload": error.response.data });
    });
  }
}

export function getTreatmentTemplates(clientID) {
  return dispatch => {
    clientInstance.get(url + "get-treatment-plan-templates").then(response => {
      dispatch({"type": "GET_TREAT_TEMPLATES", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "GET_TREAT_TEMPLATES", "payload":error.response.data});
    });
  }
}

export function getTemplateDetails(templateID) {
  return dispatch => {
    clientInstance.get(url + "get-treatment-plan-template/" + templateID).then(response => {
      dispatch({"type": "GET_PLAN_TEMPLATE_DATA", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "GET_PLAN_TEMPLATE_DATA", "payload":error.response.data});
    });
  }
}

export function savePAYGTreatmentPlan(formData) {
  return dispatch => {
    clientInstance.post(url + "save-pay-as-u-go-treatment-plan", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "SAVE_PAYG_TREATMENT_PLAN", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "SAVE_PAYG_TREATMENT_PLAN", "payload": error.response.data });
    });
  }
}

export function getPlanDataByID(planID) {
  return dispatch => {
    clientInstance.get(url + "get-treatment-plan-by-id/" + planID).then(response => {
      dispatch({"type": "GET_PLAN_DATA_BY_ID", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "GET_PLAN_DATA_BY_ID", "payload":error.response.data});
    });
  }
}

export function saveMonthlyTreatmentPlan(formData) {
  return dispatch => {
    clientInstance.post(url + "save-monthly-treatment-plan", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "SAVE_MONTHLY_TREATMENT_PLAN", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "SAVE_MONTHLY_TREATMENT_PLAN", "payload": error.response.data });
    });
  }
}

export function getProgramData(clientID, planID) {
  return dispatch => {
    clientInstance.get(url + "get-data-for-program/" + clientID + "/" + planID).then(response => {
      dispatch({"type": "GET_START_PROGRAM_DATA", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "GET_START_PROGRAM_DATA", "payload":error.response.data});
    });
  }
}

export function applyStartProgramDiscount(formData) {
  return dispatch => {
    clientInstance.post(url + "apply-discount-amount", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "START_PROGRAM_APPLY_DISCOUNT", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "START_PROGRAM_APPLY_DISCOUNT", "payload": error.response.data });
    });
  }
}

export function changeTreatmentPlanClinic(formData) {
  return dispatch => {
    clientInstance.post(url + "change-treatment-plan-clinic", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "CHANGE_PLAN_CLINIC", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "CHANGE_PLAN_CLINIC", "payload": error.response.data });
    });
  }
}

export function viewPriceBreakUp(planID) {
  return dispatch => {
    clientInstance.get(url + "view-break-down/" + planID).then(response => {
      dispatch({"type": "VIEW_PRICE_BREAK_UP", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "VIEW_PRICE_BREAK_UP", "payload":error.response.data});
    });
  }
}

export function startTreatmentProgram(formData) {
  return dispatch => {
    clientInstance.post(url + "start-treatment-plan", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "START_TREATMENT_PROGRAM", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "START_TREATMENT_PROGRAM", "payload": error.response.data });
    });
  }
}

export function cancelTreatmentPlan(formData) {
  return dispatch => {
    clientInstance.post(url + "cancel-treatment-plan", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "CANCEL_TREATMENT_PLAN", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "CANCEL_TREATMENT_PLAN", "payload": error.response.data });
    });
  }
}

export function savePlanAsTemplate(formData) {
  return dispatch => {
    clientInstance.post(url + "save-treatment-plan-template", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "SAVE_PLAN_AS_TEMPLATE", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "SAVE_PLAN_AS_TEMPLATE", "payload": error.response.data });
    });
  }
}

export function updatePlanCard(formData) {
  return dispatch => {
    clientInstance.post(url + "update-treatment-plan-card", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "UPDATE_PLAN_CARD", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "UPDATE_PLAN_CARD", "payload": error.response.data });
    });
  }
}

export function getPrescribeOnlyDetails(planID) {
  return dispatch => {
    clientInstance.get(url + "get-prescribed-plan?plan_id=" + planID).then(response => {
      dispatch({"type": "GET_PRESCRIBE_ONLY_DETAILS", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "GET_PRESCRIBE_ONLY_DETAILS", "payload":error.response.data});
    });
  }
}

export function updatePrescribeOnly(formData) {
  return dispatch => {
    clientInstance.post(url + "update-prescribe-only", ((formData) ? formData : '')).then(response => {
        dispatch({ "type": "UPDATE_PRESCRIBE_ONLY", "payload": response.data });
    }).catch(error => {
        dispatch({ "type": "UPDATE_PRESCRIBE_ONLY", "payload": error.response.data });
    });
  }
}

export function doThisAction(planID, actionType) {
  return dispatch => {
    clientInstance.get(url + "treatment-plan-action/" + planID + "/" + actionType).then(response => {
      dispatch({"type": "PERFORM_TREATMENT_ACTIONS", "payload":response.data});
    }).catch(error =>{
      dispatch({"type": "PERFORM_TREATMENT_ACTIONS", "payload":error.response.data});
    });
  }
}
