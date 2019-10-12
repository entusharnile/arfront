const nameInitialState = {
    action: ''
    }
    const sales = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
        case "SALES_CATEGORY_LIST":
        {
            return { ...state, data: action.payload, action: 'SALES_CATEGORY_LIST' }
        }
        case "SEND_SELECTED_LOCATION":
        {
            return { ...state, data: action.payload, action: 'SEND_SELECTED_LOCATION' }
        }
        case "MONTHLY_NET_SALES_LIST":
        {
            return { ...state, data: action.payload, action: 'MONTHLY_NET_SALES_LIST' }
        }
        case "PAYMENT_METHOD_LIST":
        {
            return { ...state, data: action.payload, action: 'PAYMENT_METHOD_LIST' }
        }
        case "EMPLOYEE_SALES_REPORT_LIST":
        {
            return { ...state, data: action.payload, action: 'EMPLOYEE_SALES_REPORT_LIST' }
        }
        case "ITEM_SALES_LIST":
        {
            return { ...state, data: action.payload, action: 'ITEM_SALES_LIST' }
        }
        case "CATEGORY_SALES_LIST":
        {
            return { ...state, data: action.payload, action: 'CATEGORY_SALES_LIST' }
        }
        case "EXPORT_FILE":
        {
            return { ...state, data: action.payload, action: 'EXPORT_FILE' }
        }
        case "INVOICES_LIST":
        {
            return { ...state, data: action.payload, action: 'INVOICES_LIST' }
        }
        case "CREATE_EDIT_INVOICES":
        {
            return { ...state, data: action.payload, action: 'CREATE_EDIT_INVOICES' }
        }
        case "DISCOUNTS_LIST":
        {
            return { ...state, data: action.payload, action: 'DISCOUNTS_LIST' }
        }
        case "STAF_TREATMENT_LIST":
        {
            return { ...state, data: action.payload, action: 'STAF_TREATMENT_LIST' }
        }
        case "MEMBERSHIP_LIST":
        {
            return { ...state, data: action.payload, action: 'MEMBERSHIP_LIST' }
        }
        case "MEMBERSHIP_CHURN_REPORT":
        {
            return { ...state, data: action.payload, action: 'MEMBERSHIP_CHURN_REPORT' }
        }
        case "SHORT_TERM_LIABILITY_LIST":
        {
            return { ...state, data: action.payload, action: 'SHORT_TERM_LIABILITY_LIST' }
        }
        case "TREATMENT_PLANS_LIST":
        {
            return { ...state, data: action.payload, action: 'TREATMENT_PLANS_LIST' }
        }
        case "TAXES_LIST":
        {
            return { ...state, data: action.payload, action: 'TAXES_LIST' }
        }
        case "COMMISSION_REPORTS_LIST":
        {
            return { ...state, data: action.payload, action: 'COMMISSION_REPORTS_LIST' }
        }
        case "EGIFT_CARDS_LIST":
        {
            return { ...state, data: action.payload, action: 'EGIFT_CARDS_LIST' }
        }
        case "COST_TO_COMPANY_LIST":
        {
            return { ...state, data: action.payload, action: 'COST_TO_COMPANY_LIST' }
        }
        case "GET_CASH_DRAWER":
        {
            return { ...state, data: action.payload, action: 'GET_CASH_DRAWER' }
        }
        case "CHANGE_DRAWER_LOCATION":
        {
            return { ...state, data: action.payload, action: 'CHANGE_DRAWER_LOCATION' }
        }
        case "VIEW_OPENED_DRAWER":
        {
            return { ...state, data: action.payload, action: 'VIEW_OPENED_DRAWER' }
        }
        case "TAKE_DRAWER_CONTROL":
        {
            return { ...state, data: action.payload, action: 'TAKE_DRAWER_CONTROL' }
        }
        case "GET_OPEN_CASH_DRAWER":
        {
            return { ...state, data: action.payload, action: 'GET_OPEN_CASH_DRAWER' }
        }
        case "POST_OPEN_CASH_DRAWER":
        {
            return { ...state, data: action.payload, action: 'POST_OPEN_CASH_DRAWER' }
        }
        case "CLOSE_CASH_DRAWER":
        {
            return { ...state, data: action.payload, action: 'CLOSE_CASH_DRAWER' }
        }
        case "CASH_IN_DRAWER":
        {
            return { ...state, data: action.payload, action: 'CASH_IN_DRAWER' }
        }
        case "CASH_OUT_DRAWER":
        {
            return { ...state, data: action.payload, action: 'CASH_OUT_DRAWER' }
        }
        case "BANK_DROP_DRAWER":
        {
            return { ...state, data: action.payload, action: 'BANK_DROP_DRAWER' }
        }
        case "CASH_REGISTER_LOGS":
        {
            return { ...state, data: action.payload, action: 'CASH_REGISTER_LOGS' }
        }
        case "GET_CASH_DRAWER_HISTORY":
        {
            return { ...state, data: action.payload, action: 'GET_CASH_DRAWER_HISTORY' }
        }
        case "EDIT_CLOSED_DRAWER":
        {
            return { ...state, data: action.payload, action: 'EDIT_CLOSED_DRAWER' }
        }
        case "ADD_EDIT_POPUP_RECEIPT":
        {
            return { ...state, data: action.payload, action: 'ADD_EDIT_POPUP_RECEIPT' }
        }
        case "EXPORT_CASH_DRAWER_LOG":
        {
            return { ...state, data: action.payload, action: 'EXPORT_CASH_DRAWER_LOG' }
        }
        case "FETCH_INVOICES":
        {
            return { ...state, data: action.payload, action: 'FETCH_INVOICES' }
        }
        case "EMPTY_DATA":
        {
            return { ...state, data: action.payload, action: 'EMPTY_DATA' }
        }
        case "FETCH_MANAGE_OFFICE":
        {
            return { ...state, data: action.payload, action: 'FETCH_MANAGE_OFFICE' }
        }
        case "CLINIC_LIST":
        {
          return { ...state, data: action.payload, action:'CLINIC_LIST' }
        }
        case "ADD_OFFICE_GOALS":
        {
          return { ...state, data: action.payload, action:'ADD_OFFICE_GOALS' }
        }
        case "FETCH_OFFICE_GOALS":
        {
          return { ...state, data: action.payload, action:'FETCH_OFFICE_GOALS' }
        }
        case "FETCH_OFFICE_GOALS_NM":
        {
          return { ...state, data: action.payload, action:'FETCH_OFFICE_GOALS_NM' }
        }
        case "FETCH_AVAILABLE_MONTHS":
        {
          return { ...state, data: action.payload, action:'FETCH_AVAILABLE_MONTHS' }
        }
        case "FETCH_TIPS_PER_PROVIDER":
        {
          return { ...state, data: action.payload, action:'FETCH_TIPS_PER_PROVIDER' }
        }
        default:
            return state
    }
}

export default sales;
