import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

positionFooterCorrectly();
const invoiceInstance = axios.create();
invoiceInstance.defaults.headers.common['access-token'] = getToken();

invoiceInstance.interceptors.response.use(function (response) {
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

export function getInvoiceDetails(invoiceID, clientID) {
  return dispatch => {
      invoiceInstance.get(url + "sales/invoice_details/" + invoiceID + "/" + clientID).then(response => {
          dispatch({ "type": "GET_INVOICE_DETAILS", "payload": response.data });
      }).catch(error => {
          dispatch({ "type": "GET_INVOICE_DETAILS", "payload": error.response.data });
      });
  }
}

export function getPaymentHistory(invoiceID) {
  return dispatch => {
    invoiceInstance.get(url + "sales/invoices/payment-history/" + invoiceID).then(response => {
      dispatch({"type":"GET_PAYMENT_HISTORY","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"GET_PAYMENT_HISTORY","payload":error.response.data});
    });
  }
}

export function voidInvoice(invoiceID) {
  return dispatch => {
    invoiceInstance.get(url + "sales/void-invoice/" + invoiceID).then(response => {
      dispatch({"type":"VOID_INVOICE","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"VOID_INVOICE","payload":error.response.data});
    });
  }
}

export function sendAndDownloadInvoice(invoiceID, type) {
  return dispatch => {
    invoiceInstance.get(url + "sales/send_invoice/" + invoiceID + "/" + type).then(response => {
      dispatch({"type":"EMAIL_AND_DOWNLOAD_INVOICE","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"EMAIL_AND_DOWNLOAD_INVOICE","payload":error.response.data});
    });
  }
}

export function sendAndDownloadRefundReceipt(invoiceID, type) {
  return dispatch => {
    invoiceInstance.get(url + "sales/send_refund/" + invoiceID + "/" + type).then(response => {
      dispatch({"type":"EMAIL_AND_DOWNLOAD_REFUND_RECEIPT","payload":response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type":"EMAIL_AND_DOWNLOAD_REFUND_RECEIPT","payload":error.response.data});
    });
  }
}

export function getRefundDetails(invoiceID) {
  return dispatch => {
      invoiceInstance.get(url + "sales/issue-refund/" + invoiceID).then(response => {
          dispatch({ "type": "GET_REFUND_DETAILS", "payload": response.data });
      }).catch(error => {
          dispatch({ "type": "GET_REFUND_DETAILS", "payload": error.response.data });
      });
  }
}

export function payRefund(formData) {
  return dispatch => {
    invoiceInstance.post(url + "sales/invoices/pay-refund", ((formData) ? formData : '')).then(response => {
      dispatch({"type": "ISSUE_REFUND", "payload": response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type": "ISSUE_REFUND", "payload": error.response.data});
    });
  }
}

export function changeUserID(formData) {
  return dispatch => {
    invoiceInstance.post(url + "sales/update-invoice-item-employee", ((formData) ? formData : '')).then(response => {
      dispatch({"type": "UPDATE_USER_IN_INVOICE", "payload": response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type": "UPDATE_USER_IN_INVOICE", "payload": error.response.data});
    });
  }
}

export function exportEmptyData(formData) {
    return dispatch => {
        dispatch({ "type": "EMPTY_DATA", "payload": {data: '', status:200, message : ''} });
    }
}

export function saveAndSendEmail(formData) {
  return dispatch => {
    invoiceInstance.post(url + "sales/save-email", ((formData) ? formData : '')).then(response => {
      dispatch({"type": "SAVE_AND_SEND_EMAIL", "payload": response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type": "SAVE_AND_SEND_EMAIL", "payload": error.response.data});
    });
  }
}
export function refundIssue(id) {
  return dispatch => {
    invoiceInstance.post(url + "refund-membership-invoice/"+id).then(response => {
      dispatch({"type": "MONTHLY_MEMBERSHIP_ISSUE_REFUND", "payload": response.data});
    }).catch(error =>{
      console.log(error);
      dispatch({"type": "MONTHLY_MEMBERSHIP_ISSUE_REFUND", "payload": error.response.data});
    });
  }
}
