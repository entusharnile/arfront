import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

const salesInstance = axios.create();
salesInstance.defaults.headers.common['access-token'] = getToken();
positionFooterCorrectly();
salesInstance.interceptors.response.use(function (response) {
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

export function fetchSalesCategory(formData) {
    return dispatch => {
        salesInstance.post(url + "sales", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SALES_CATEGORY_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SALES_CATEGORY_LIST", "payload": error.response.data });
        });
    }
}

export function fetchMonthlyNetSales(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/monthly_net_sales", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "MONTHLY_NET_SALES_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "MONTHLY_NET_SALES_LIST", "payload": error.response.data });
        });
    }
}

export function fetchPaymentMethods(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/payment_methods", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "PAYMENT_METHOD_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PAYMENT_METHOD_LIST", "payload": error.response.data });
        });
    }
}

export function fetchEmployeeSales(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/employee_sales_report", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EMPLOYEE_SALES_REPORT_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EMPLOYEE_SALES_REPORT_LIST", "payload": error.response.data });
        });
    }
}

export function fetchItemSales(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/item_sales", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "ITEM_SALES_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "ITEM_SALES_LIST", "payload": error.response.data });
        });
    }
}

export function fetchCategorySales(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/category_sales", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CATEGORY_SALES_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CATEGORY_SALES_LIST", "payload": error.response.data });
        });
    }
}

export function exportSalesSummary(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/export", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EXPORT_FILE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EXPORT_FILE", "payload": error.response.data });
        });
    }
}

export function fetchInvoices(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/invoices", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "INVOICES_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "INVOICES_LIST", "payload": error.response.data });
        });
    }
}

export function createEditInvoiceText(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/invoice_text", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_EDIT_INVOICES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_EDIT_INVOICES", "payload": error.response.data });
        });
    }
}

export function fetchInvoiceText(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/invoice_text", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "FETCH_INVOICES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_INVOICES", "payload": error.response.data });
        });
    }
}

export function fetchDiscounts(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/discounts", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "DISCOUNTS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DISCOUNTS_LIST", "payload": error.response.data });
        });
    }
}

export function fetchStafTratment(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/staff_treatments", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "STAF_TREATMENT_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "STAF_TREATMENT_LIST", "payload": error.response.data });
        });
    }
}

export function fetchMembership(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/memberships", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "MEMBERSHIP_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "MEMBERSHIP_LIST", "payload": error.response.data });
        });
    }
}

export function fetchMembershipChurnReport(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/membership-chrun-report", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "MEMBERSHIP_CHURN_REPORT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "MEMBERSHIP_CHURN_REPORT", "payload": error.response.data });
        });
    }
}

export function fetchShortTermLiability(formData) {
    return dispatch => {
        salesInstance.get(url + "sales/short_term_liability", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SHORT_TERM_LIABILITY_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SHORT_TERM_LIABILITY_LIST", "payload": error.response.data });
        });
    }
}

export function fetchTreatmentPlans(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/treatment_plans", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "TREATMENT_PLANS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "TREATMENT_PLANS_LIST", "payload": error.response.data });
        });
    }
}

export function fetchTaxes(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/taxes", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "TAXES_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "TAXES_LIST", "payload": error.response.data });
        });
    }
}

export function fetchCommissionReports(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/commission_report", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "COMMISSION_REPORTS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "COMMISSION_REPORTS_LIST", "payload": error.response.data });
        });
    }
}

export function fetchCostToCompany(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/cost_to_company", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "COST_TO_COMPANY_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "COST_TO_COMPANY_LIST", "payload": error.response.data });
        });
    }
}

export function fetcheGiftCards(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/egift_cards", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EGIFT_CARDS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EGIFT_CARDS_LIST", "payload": error.response.data });
        });
    }
}

export function getCashDrawer() {
    return dispatch => {
        salesInstance.post(url + "cash-drawer").then(response => {
            dispatch({ "type": "GET_CASH_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_CASH_DRAWER", "payload": error.response.data });
        });
    }
}

export function changeDrawerLocation(clinicID) {
    return dispatch => {
        salesInstance.post(url + "change-clinic-location/" + clinicID).then(response => {
            dispatch({ "type": "CHANGE_DRAWER_LOCATION", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CHANGE_DRAWER_LOCATION", "payload": error.response.data });
        });
    }
}

export function viewOpenedDrawer(clinicID) {
    return dispatch => {
        salesInstance.get(url + "show-opened-drawer/" + clinicID).then(response => {
            dispatch({ "type": "VIEW_OPENED_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "VIEW_OPENED_DRAWER", "payload": error.response.data });
        });
    }
}

export function updateCashDrawer(clinicID) {
    return dispatch => {
        salesInstance.post(url + "update-cash-drawer/" + clinicID).then(response => {
            dispatch({ "type": "TAKE_DRAWER_CONTROL", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "TAKE_DRAWER_CONTROL", "payload": error.response.data });
        });
    }
}

export function getOpenCashDrawer(clinicID) {
    return dispatch => {
        salesInstance.get(url + "open-cash-drawer/" + clinicID).then(response => {
            dispatch({ "type": "GET_OPEN_CASH_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_OPEN_CASH_DRAWER", "payload": error.response.data });
        });
    }
}

export function openCashDrawer(formData) {
    return dispatch => {
        salesInstance.post(url + "open-cash-drawer", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "POST_OPEN_CASH_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "POST_OPEN_CASH_DRAWER", "payload": error.response.data });
        });
    }
}

export function closeCashDrawer(formData) {
    return dispatch => {
        salesInstance.post(url + "close-cash-drawer", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CLOSE_CASH_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CLOSE_CASH_DRAWER", "payload": error.response.data });
        });
    }
}

export function cashInDrawer(formData) {
    return dispatch => {
        salesInstance.post(url + "cash-in-drawer", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CASH_IN_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CASH_IN_DRAWER", "payload": error.response.data });
        });
    }
}

export function cashOutDrawer(formData) {
    return dispatch => {
        salesInstance.post(url + "cash-out-drawer", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CASH_OUT_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CASH_OUT_DRAWER", "payload": error.response.data });
        });
    }
}

export function bankDropDrawer(formData) {
    return dispatch => {
        salesInstance.post(url + "bank-drop", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "BANK_DROP_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "BANK_DROP_DRAWER", "payload": error.response.data });
        });
    }
}

export function cashRegisterLogs(formData) {
    return dispatch => {
        salesInstance.get(url + "cash-register-logs", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CASH_REGISTER_LOGS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CASH_REGISTER_LOGS", "payload": error.response.data });
        });
    }
}

export function cashDrawerHistory(formData) {
    return dispatch => {
        salesInstance.get(url + "drawer-filter", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "GET_CASH_DRAWER_HISTORY", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "GET_CASH_DRAWER_HISTORY", "payload": error.response.data });
        });
    }
}

export function editClosedDrawer(formData) {
    return dispatch => {
        salesInstance.post(url + "drawer-close-edit", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EDIT_CLOSED_DRAWER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EDIT_CLOSED_DRAWER", "payload": error.response.data });
        });
    }
}

export function addEditPopupReceipt(formData) {
    return dispatch => {
        salesInstance.post(url + "add-receipt", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "ADD_EDIT_POPUP_RECEIPT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "ADD_EDIT_POPUP_RECEIPT", "payload": error.response.data });
        });
    }
}

export function exportCashRegisterLogs(formData) {
    return dispatch => {
        salesInstance.get(url + "export-cash-register-logs", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EXPORT_CASH_DRAWER_LOG", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EXPORT_CASH_DRAWER_LOG", "payload": error.response.data });
        });
    }
}

export function exportEmptyData(formData) {
    return dispatch => {
        dispatch({ "type": "EMPTY_DATA", "payload": {data: '', status:200, message : ''} });
    }
}

export function fetchManageOfficeSalesGoals(salesID) {
    return dispatch => {
        salesInstance.get(url + "sales/office-sales-goals-details/" + salesID).then(response => {
            dispatch({ "type": "FETCH_MANAGE_OFFICE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_MANAGE_OFFICE", "payload": error.response.data });
        });
    }
}

export const fetchClinics = (formData) => {
	return dispatch => {
		salesInstance.get(url + "clinics", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "CLINIC_LIST", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "CLINIC_LIST", "payload": error.response.data });
		});
	}
}

export function addOfficeSalesGoals(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/add-office-sales-goals", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "ADD_OFFICE_GOALS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "ADD_OFFICE_GOALS", "payload": error.response.data });
        });
    }
}

export function fetrchOfficeSalesGoals(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/add-office-sales-goals", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "FETCH_OFFICE_GOALS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_OFFICE_GOALS", "payload": error.response.data });
        });
    }
}

export function fetrchOfficeSalesGoalsNm(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/add-office-sales-goals", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "FETCH_OFFICE_GOALS_NM", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_OFFICE_GOALS_NM", "payload": error.response.data });
        });
    }
}

export function fetchAvailableMonths(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/check_available_months", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "FETCH_AVAILABLE_MONTHS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_AVAILABLE_MONTHS", "payload": error.response.data });
        });
    }
}

export function fetchTipsPerProvider(formData) {
    return dispatch => {
        salesInstance.post(url + "sales/tip-report", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "FETCH_TIPS_PER_PROVIDER", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_TIPS_PER_PROVIDER", "payload": error.response.data });
        });
    }
}
