const nameInitialState = {
    action: ''
}
const settings = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
        case "MDRoom_LIST":
		 {
			return { ...state, data: action.payload, action: 'MDRoom_LIST' }
		}
        case "UPDATE_MEMBERSHIP_WALLET_LIST":
		 {
			return { ...state, data: action.payload, action: 'UPDATE_MEMBERSHIP_WALLET_LIST' }
		}
		case "UPDATE_CANCELLATION_POLICY":{
			return{
			  ...state, data:action.payload, action:"UPDATE_CANCELLATION_POLICY"
			}
		}
		case "GET_CANCELLATION_POLICY":{
			return{
			  ...state, data:action.payload, action:"GET_CANCELLATION_POLICY"
			}
		}
        case "CANCELLATION_POLICY_STATUS":{
            return{
              ...state, data:action.payload, action:"CANCELLATION_POLICY_STATUS"
            }
        }
		case "UPDATE_PATIENT_PORTAL":
		{
			return{
			  ...state, data:action.payload, action:"UPDATE_PATIENT_PORTAL"
			}
		}
		case "GET_PATIENT_PORTAL":
		{
			return{
			  ...state, data:action.payload, action:"GET_PATIENT_PORTAL"
			}
		}
		case "CREATE_QUESTIONNAIRES":
		{
			return{
			   ...state, data: action.payload, action: 'CREATE_QUESTIONNAIRES'
			}
		}
		case "CREATE_QUESTION":
		{
			return{
			   ...state, data: action.payload, action: 'CREATE_QUESTION'
			}
		}
        case "GET_MEMBERSHIP_WALLET_LIST":
            {
                return { ...state, data: action.payload, action: 'GET_MEMBERSHIP_WALLET_LIST' }
            }
        case "UPDATE_BOOKING_URL_LIST":
            {
                return { ...state, data: action.payload, action: 'UPDATE_BOOKING_URL_LIST' }
            }
        case "GET_BOOKING_URL_LIST":
            {
                return { ...state, data: action.payload, action: 'GET_BOOKING_URL_LIST' }
            }
        case "GET_EDIT_APPOINTMENT_REMINDER":
            {
                return { ...state, data: action.payload, action: 'GET_EDIT_APPOINTMENT_REMINDER' }
            }
        case "CREATE_APPOINTMENT_REMINDER":
            {
                return { ...state, data: action.payload, action: 'CREATE_APPOINTMENT_REMINDER' }
            }
        case "UPDATE_APPOINTMENT_REMINDER":
            {
                return { ...state, data: action.payload, action: 'UPDATE_APPOINTMENT_REMINDER' }
            }
        case "DELETE_APPOINTMENT_REMINDER":
            {
                return { ...state, data: action.payload, action: 'DELETE_APPOINTMENT_REMINDER' }
            }
        case "APPOINTMENT_REMINDER":
            {
                return { ...state, data: action.payload, action: 'APPOINTMENT_REMINDER' }
            }
        case "MDS_LIST":
            {
                return { ...state, data: action.payload, action: 'MDS_LIST' }
            }
        case "APPOINTMENT_GET":
            {
                return { ...state, data: action.payload, action: 'APPOINTMENT_GET' }
            }
        case "POST_TREATMENT_INSTRUCTIONS_LIST":
            {
                return { ...state, data: action.payload, action: 'POST_TREATMENT_INSTRUCTIONS_LIST' }
            }
            case "CREATE_POST_TREATMENT_INSTRUCTIONS_LIST":
                {
                    return { ...state, data: action.payload, action: 'CREATE_POST_TREATMENT_INSTRUCTIONS_LIST' }
                }
                case "SELECTED_POST_TREATMENT_INSTRUCTIONS_LIST":
                    {
                        return { ...state, data: action.payload, action: 'SELECTED_POST_TREATMENT_INSTRUCTIONS_LIST' }
                    }
                    case "UPDATE_POST_TREATMENT_INSTRUCTIONS_LIST":
                        {
                            return { ...state, data: action.payload, action: 'UPDATE_POST_TREATMENT_INSTRUCTIONS_LIST' }
                        }
        case "PRE_TREATMENT_INSTRUCTIONS_LIST":
            {
                return { ...state, data: action.payload, action: 'PRE_TREATMENT_INSTRUCTIONS_LIST' }
            }  case "CREATE_PRE_TREATMENT_INSTRUCTIONS_LIST":
                  {
                      return { ...state, data: action.payload, action: 'CREATE_PRE_TREATMENT_INSTRUCTIONS_LIST' }
                  }
                  case "SELECTED_PRE_TREATMENT_INSTRUCTIONS_LIST":
                      {
                          return { ...state, data: action.payload, action: 'SELECTED_PRE_TREATMENT_INSTRUCTIONS_LIST' }
                      }
                      case "UPDATE_PRE_TREATMENT_INSTRUCTIONS_LIST":
                          {
                              return { ...state, data: action.payload, action: 'UPDATE_PRE_TREATMENT_INSTRUCTIONS_LIST' }
                          }
                          case "DELETE_PRE_TREATMENT_INSTRUCTIONS_LIST":
                              {
                                  return { ...state, data: action.payload, action: 'DELETE_PRE_TREATMENT_INSTRUCTIONS_LIST' }
                              }
                              case "DELETE_POST_TREATMENT_INSTRUCTIONS_LIST":
                                  {
                                      return { ...state, data: action.payload, action: 'DELETE_POST_TREATMENT_INSTRUCTIONS_LIST' }
                                  }
        case "PRE_TREATMENT_EMAIL_LIST":
            {
                return { ...state, data: action.payload, action: 'PRE_TREATMENT_EMAIL_LIST' }
            }
        case "POST_TREATMENT_EMAIL_LIST":
            {
                return { ...state, data: action.payload, action: 'POST_TREATMENT_EMAIL_LIST' }
            }
        case "POST_TREATMENT_EMAIL_UPDATE":
            {
                return { ...state, data: action.payload, action: 'POST_TREATMENT_EMAIL_UPDATE' }
            }
        case "PRE_TREATMENT_EMAIL_UPDATE":
            {
                return { ...state, data: action.payload, action: 'PRE_TREATMENT_EMAIL_UPDATE' }
            }
        case "APPOINTMENT_UPDATE":
            {
                return { ...state, data: action.payload, action: "APPOINTMENT_UPDATE" }
            }
        case "APPOINTMENT_GET":
            {
                return { ...state, data: action.payload, action: 'APPOINTMENT_GET' }
            }
        case "QUESTIONNAIRES_LIST":
            {
                return { ...state, data: action.payload, action: 'QUESTIONNAIRES_LIST' }
            }
        case "FILE_UPLOADED":
            {
                return { ...state, data: action.payload, action: 'FILE_UPLOADED' }
            }
        case "POST_TREATMENT_EMAIL":
            {
                return { ...state, data: action.payload, action: 'POST_TREATMENT_EMAIL' }
            }
        case "USERS_LIST":
            {
                return { ...state, data: action.payload, action: 'USERS_LIST' }
            }
        case "USER_CREATE":
            {
                return { ...state, data: action.payload, action: 'USER_CREATE' }
            }
        case "USER_UPDATE":
            {
                return { ...state, data: action.payload, action: 'USER_UPDATE' }
            }
        case "PROFILE_UPDATE":
            {
                return { ...state, data: action.payload, action: 'PROFILE_UPDATE' }
            }
        case "USER_PROFILE":
            {
                return { ...state, data: action.payload, action: 'USER_PROFILE' }
            }
        case "USER_GET":
            {
                return { ...state, data: action.payload, action: 'USER_GET' }
            }
        case "PROFILE_GET":
            {
                return { ...state, data: action.payload, action: 'PROFILE_GET' }
            }
        case "SORT_ORDER_UPDATE":
            {
                return { ...state, data: action.payload, action: 'SORT_ORDER_UPDATE' }
            }
        case "PRIVILEGE_LIST":
            {
                return { ...state, data: action.payload, action: 'PRIVILEGE_LIST' }
            }
        case "PRIVILEGE_UPDATE":
            {
                return { ...state, data: action.payload, action: 'PRIVILEGE_UPDATE' }
            }
        case "BASE64_UPLOAD":
            {
                return { ...state, data: action.payload, action: 'BASE64_UPLOAD' }
            }
        case "CONSENTS_LIST":
            return {
                ...state,
                data: action.payload,
                action: 'CONSENTS_LIST'
            }
        case "SELECTED_CONSENTS_LIST":
            return {
                ...state,
                data: action.payload,
                action: 'SELECTED_CONSENTS_LIST'
            }
        case "CREATE_CONSENTS":
            return {
                ...state,
                data: action.payload,
                action: 'CREATE_CONSENTS'
            }
        case "UPDATE_SELECTED_CONSENTS":
            return {
                ...state,
                data: action.payload,
                action: 'UPDATE_SELECTED_CONSENTS'
            }
        case "CONSENT_DELETED":
            return {
                ...state,
                data: action.payload,
                action: 'CONSENT_DELETED'
            }

        case "ACTIVATE_PATIENT_PORTAL":
            {
                return {
                    ...state,
                    data: action.payload,
                    action: "ACTIVATE_PATIENT_PORTAL"
                }
            }
        case "UPDATE_PATIENT_PORTAL":
            {
                return {
                    ...state,
                    data: action.payload,
                    action: "UPDATE_PATIENT_PORTAL"
                }
            }
        case "GET_PATIENT_PORTAL":
            {
                return {
                    ...state,
                    data: action.payload,
                    action: "GET_PATIENT_PORTAL"
                }
            }
        case "CREATE_QUESTIONNAIRES":
            {
                return {
                    ...state,
                    data: action.payload,
                    action: 'CREATE_QUESTIONNAIRES'
                }
            }
        case "UPDATE_QUESTIONNAIRES":
            {
                return {
                    ...state,
                    data: action.payload,
                    action: 'UPDATE_QUESTIONNAIRES'
                }
            }
        case "GET_QUESTIONNAIRE":
            {
                return {
                    ...state,
                    data: action.payload,
                    action: 'GET_QUESTIONNAIRE'
                }
            }
        case "GET_QUESTION":
            {
                return {
                    ...state,
                    data: action.payload,
                    action: 'GET_QUESTION'
                }
            }
        case "USER_PRIVILEGE_UPDATE":
            {
                return { ...state, data: action.payload, action: 'USER_PRIVILEGE_UPDATE' }
            }
        case "QUESTION_DELETED":
            {
                return { ...state, data: action.payload, action: 'QUESTION_DELETED' }
            }
        case "QUESTIONNAIRE_DELETED":
            {
                return { ...state, data: action.payload, action: 'QUESTIONNAIRE_DELETED' }
            }
        case "UPDATE_PROCEDURE_QUESTIONNAIRE":
            {
                return { ...state, data: action.payload, action: 'UPDATE_PROCEDURE_QUESTIONNAIRE' }
            }
        case "UPDATE_QUESTION":
            {
                return { ...state, data: action.payload, action: 'UPDATE_QUESTION' }
            }
        case "USER_2FA_GET":
            {
                return { ...state, data: action.payload, action: 'USER_2FA_GET' }
            }
        case "USER_2FA_DISABLED":
            {
                return { ...state, data: action.payload, action: 'USER_2FA_DISABLED' }
            }
        case "GOOGLE_2FA_GET":
            {
                return { ...state, data: action.payload, action: 'GOOGLE_2FA_GET' }
            }
        case "GOOGLE_2FA_VERIFY":
            {
                return { ...state, data: action.payload, action: 'GOOGLE_2FA_VERIFY' }
            }
        case "SEND_OTP":
            {
                return { ...state, data: action.payload, action: 'SEND_OTP' }
            }
        case "VERIFY_OTP":
            {
                return { ...state, data: action.payload, action: 'VERIFY_OTP' }
            }
        case "EMPTY_DATA":
            {
                return { ...state, data: action.payload, action: 'EMPTY_DATA' }
            }
        case "UPDATE_ERROR":
            {
                return { ...state, data: action.payload, action: 'UPDATE_PROPERTY' }
            }
        case "DELETE_SUCCESS":
            {
                return { ...state, data: action.payload, action: 'DELETE_PROPERTY' }
            }
        case "DELETE_ERROR":
            {
                return { ...state, data: action.payload, action: 'DELETE_PROPERTY' }
            }
        case "WELCOME_SUCCESS":
            {
                return { ...state, data: action.payload, action: 'WELCOME_PROPERTY' }
            }
        case "WELCOME_ERROR":
            {
                return { ...state, data: action.payload, action: 'WELCOME_PROPERTY' }
            }
        case "ADD_NOTE":
            {
                return { ...state, data: action.payload, action: 'ADD_NOTE' }
            }
        case "NOTES_LIST":
            {
                return { ...state, data: action.payload, action: 'NOTES_LIST' }
            }
        case "GET_NOTE":
            {
                return { ...state, data: action.payload, action: 'GET_NOTE' }
            }
        case "UPDATE_NOTE":
            {
                return { ...state, data: action.payload, action: 'UPDATE_NOTE' }
            }
        case "DELETE_NOTE":
            {
                return { ...state, data: action.payload, action: 'DELETE_NOTE' }
            }
        case "ADD_GETHERE":
            {
                return { ...state, data: action.payload, action: 'ADD_GETHERE' }
            }
        case "GETHERE_LIST":
            {
                return { ...state, data: action.payload, action: 'GETHERE_LIST' }
            }
        case "GET_HERE":
            {
                return { ...state, data: action.payload, action: 'GET_HERE' }
            }
        case "UPDATE_GETHERE":
            {
                return { ...state, data: action.payload, action: 'UPDATE_GETHERE' }
            }
        case "DELETE_GETHERE":
            {
                return { ...state, data: action.payload, action: 'DELETE_GETHERE' }
            }
        case "CHECKINS_LIST":
            {
                return { ...state, data: action.payload, action: 'CHECKINS_LIST' }
            }
        case "CSV_DOWNLOAD":
            {
                return { ...state, data: action.payload, action: 'CSV_DOWNLOAD' }
            }
        case "CHECKINS_DETAILS":
            {
                return { ...state, data: action.payload, action: 'CHECKINS_DETAILS' }
            }
        case "BREADCRUMB":
            {
                return { ...state, data: action.payload, action: 'BREADCRUMB' }
            }
        case "CHECKINS_CHART":
            {
                return { ...state, data: action.payload, action: 'CHECKINS_CHART' }
            }
        case "SERVICE_CHART":
            {
                return { ...state, data: action.payload, action: 'SERVICE_CHART' }
            }
        case "REMOVE_WELCOME_IMAGE":
            {
                return { ...state, data: action.payload, action: 'REMOVE_WELCOME_IMAGE' }
            }
        case "DASH_CONTENT":
            {
                return { ...state, data: action.payload, action: 'DASH_CONTENT' }
            }
        case "ACCOUNT_GET":
            {
                return { ...state, data: action.payload, action: "ACCOUNT_GET" }
            }
        case "ACCOUNT_PUT":
            {
                return { ...state, data: action.payload, action: "ACCOUNT_PUT" }
            }
        case "SETTING_SIDEBAR_TEXT":
            {
                return { ...state, data: action.payload, action: "SETTING_SIDEBAR_TEXT" }
            }
        case "ProviderRoom_LIST":
            {
                return { ...state, data: action.payload, action: 'ProviderRoom_LIST' }
            }
        case "userRoomData_LIST":
            {
                return { ...state, data: action.payload, action: 'userRoomData_LIST' }
            }
        case "SETTING_DELETE_PROCEDURE_NOTE":
        {
            return { ...state, data: action.payload, action: 'SETTING_DELETE_PROCEDURE_NOTE' }
        }
        case "SIGN_PROCEDURE":
        {
            return { ...state, data: action.payload, action: 'SIGN_PROCEDURE' }
        }
        case "MARK_UNMARK_AFTER_PHOTOS":
        {
            return { ...state, data: action.payload, action: 'MARK_UNMARK_AFTER_PHOTOS' }
        }
        case "HIDE_MARK_AFTER_PHOTOS":
        {
            return { ...state, data: action.payload, action: 'HIDE_MARK_AFTER_PHOTOS' }
        }
        case "CLINIC_LIST":
        {
          return { ...state, data: action.payload, action:'CLINIC_LIST' }
        }
        case "PROCEDURE_QUESTIONNAIRE":
        {
          return { ...state, data: action.payload, action:'PROCEDURE_QUESTIONNAIRE' }
        }
        case "PROCEDURE_CONSENTS":
        {
          return { ...state, data: action.payload, action:'PROCEDURE_CONSENTS' }
        }
        case "UPDATE_QUESTIONNAIRES":
        {
          return { ...state, data: action.payload, action:'UPDATE_QUESTIONNAIRES' }
        }

        case "USER_DELETE":
        {
          return { ...state, data: action.payload, action:'USER_DELETE' }
        }
        case "SUBSCRIPTION_INVOICE_LIST":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_INVOICE_LIST' }
        }
        case "SUBSCRIPTION_INVOICE_DATA":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_INVOICE_DATA' }
        }
        case "PAY_LAST_DUE_INVOICE":
        {
          return { ...state, data: action.payload, action:'PAY_LAST_DUE_INVOICE' }
        }
        case "SUBSCRIPTION_DETAILS":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_DETAILS' }
        }
        case "SUBSCRIPTION_ADD_ON":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_ADD_ON' }
        }
        case "SUBSCRIPTION_CANCEL_REACTIVATE":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_CANCEL_REACTIVATE' }
        }
        case "SUBSCRIPTION_UPDATE_CARD":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_UPDATE_CARD' }
        }
        case "SUBSCRIPTION_AUTO_REFILL":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_AUTO_REFILL' }
        }
        case "SUBSCRIPTION_UPGRADE_ACCOUNT":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_UPGRADE_ACCOUNT' }
        }
        case "SUBSCRIPTION_MONTHLY_TO_YEARLY_ESTIMATE":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_MONTHLY_TO_YEARLY_ESTIMATE' }
        }
        case "SUBSCRIPTION_MONTHLY_TO_YEARLY_UPGRADE":
        {
          return { ...state, data: action.payload, action:'SUBSCRIPTION_MONTHLY_TO_YEARLY_UPGRADE' }
        }
        case "RECENTLY_DELETED_LIST":
        {
          return { ...state, data: action.payload, action:'RECENTLY_DELETED_LIST' }
        }
        case "RECENTLY_DELETED_RESTORE":
        {
          return { ...state, data: action.payload, action:'RECENTLY_DELETED_RESTORE' }
        }
        case "POS_DASHBOARD_DATA":
        {
          return { ...state, data: action.payload, action:'POS_DASHBOARD_DATA' }
        }
        case "POS_DASHBOARD_FILTER_DATA":
        {
          return { ...state, data: action.payload, action:'POS_DASHBOARD_FILTER_DATA' }
        }
        case "GET_POS_DASHBOARD_VERIFICATION":
        {
          return { ...state, data: action.payload, action:'GET_POS_DASHBOARD_VERIFICATION' }
        }
        case "SAVE_POS_DASHBOARD_VERIFICATION":
        {
          return { ...state, data: action.payload, action:'SAVE_POS_DASHBOARD_VERIFICATION' }
        }
        case "POS_PAYMENT_LIST":
        {
          return { ...state, data: action.payload, action:'POS_PAYMENT_LIST' }
        }
        case "POS_PAYOUT_LIST":
        {
          return { ...state, data: action.payload, action:'POS_PAYOUT_LIST' }
        }
        case "POS_PAYMENT_PAYOUT_EXPORT":
        {
          return { ...state, data: action.payload, action:'POS_PAYMENT_PAYOUT_EXPORT' }
        }
        case "POS_DISPUTE_LIST":
        {
          return { ...state, data: action.payload, action:'POS_DISPUTE_LIST' }
        }
        case "POS_PAYOUT_DATA":
        {
          return { ...state, data: action.payload, action:'POS_PAYOUT_DATA' }
        }
        case "POS_DISPUTE_SETTING_GET":
        {
          return { ...state, data: action.payload, action:'POS_DISPUTE_SETTING_GET' }
        }
        case "POS_DISPUTE_SETTING_POST":
        {
          return { ...state, data: action.payload, action:'POS_DISPUTE_SETTING_POST' }
        }
        case "POS_PAYOUT_BANK_LIST":
        {
          return { ...state, data: action.payload, action:'POS_PAYOUT_BANK_LIST' }
        }
        case "POS_PAYOUT_NEW":
        {
          return { ...state, data: action.payload, action:'POS_PAYOUT_NEW' }
        }
        case "GET_POS_DATA":
        {
          return { ...state, data: action.payload, action:'GET_POS_DATA' }
        }
        case "CHANGE_POS_STATUS":
        {
          return { ...state, data: action.payload, action:'CHANGE_POS_STATUS' }
        }
        case "CHANGE_POS_CONNECTION_STATUS":
        {
          return { ...state, data: action.payload, action:'CHANGE_POS_CONNECTION_STATUS' }
        }

        case "GET_POS_SETUP_DATA":
        {
          return { ...state, data: action.payload, action:'GET_POS_SETUP_DATA' }
        }
        case "GET_POS_ADDITIONAL_SETUP_DATA":
        {
          return { ...state, data: action.payload, action:'GET_POS_ADDITIONAL_SETUP_DATA' }
        }
        case "SAVE_POS_SETUP_DATA":
        {
          return { ...state, data: action.payload, action:'SAVE_POS_SETUP_DATA' }
        }
        case "CHECK_POS_STRIPE_BALANCE":
        {
          return { ...state, data: action.payload, action:'CHECK_POS_STRIPE_BALANCE' }
        }
        case "DISCONNENCT_POS_STRIPE_ACCOUNT":
        {
          return { ...state, data: action.payload, action:'DISCONNENCT_POS_STRIPE_ACCOUNT' }
        }
        case "PROCEDURE_TEMPLATE_LIST":
        {
          return { ...state, data: action.payload, action:'PROCEDURE_TEMPLATE_LIST' }
        }
        case "PROCEDURE_TEMPLATE_DATA":
        {
          return { ...state, data: action.payload, action:'PROCEDURE_TEMPLATE_DATA' }
        }
        case "SAVE_PROCEDURE_TEMPLATE_DATA":
        {
          return { ...state, data: action.payload, action:'SAVE_PROCEDURE_TEMPLATE_DATA' }
        }
        case "DELETE_PROCEDURE_TEMPLATE":
        {
          return { ...state, data: action.payload, action:'DELETE_PROCEDURE_TEMPLATE' }
        }
        case "GET_POS_STRIPE_ACCOUNT_FIELDS":
        {
          return { ...state, data: action.payload, action:'GET_POS_STRIPE_ACCOUNT_FIELDS' }
        }
        case "UPDATE_POS_STRIPE_ACCOUNT":
        {
          return { ...state, data: action.payload, action:'UPDATE_POS_STRIPE_ACCOUNT' }
        }
        case "GET_POS_PAYMENT_SETTING_DATA":
        {
          return { ...state, data: action.payload, action:'GET_POS_PAYMENT_SETTING_DATA' }
        }
        case "GET_POS_BANK_ACCOUNT_FIELDS":
        {
          return { ...state, data: action.payload, action:'GET_POS_BANK_ACCOUNT_FIELDS' }
        }
        case "ADD_POS_BANK_ACCOUNT":
        {
          return { ...state, data: action.payload, action:'ADD_POS_BANK_ACCOUNT' }
        }
        case "SET_POS_DEFAULT_BANK_ACCOUNT":
        {
          return { ...state, data: action.payload, action:'SET_POS_DEFAULT_BANK_ACCOUNT' }
        }
        case "GET_POS_PAYOUT_SCHEDULE_DATA":
        {
          return { ...state, data: action.payload, action:'GET_POS_PAYOUT_SCHEDULE_DATA' }
        }
        case "UPDATE_POS_PAYOUT_SCHEDULE_DATA":
        {
          return { ...state, data: action.payload, action:'UPDATE_POS_PAYOUT_SCHEDULE_DATA' }
        }
        case "GET_POS_CARD_READER_DATA":
        {
          return { ...state, data: action.payload, action:'GET_POS_CARD_READER_DATA' }
        }
        case "CHANGE_POS_CARD_READER_STATUS":
        {
          return { ...state, data: action.payload, action:'CHANGE_POS_CARD_READER_STATUS' }
        }
        case "ADD_POS_CARD_READER_MERCHENT":
        {
          return { ...state, data: action.payload, action:'ADD_POS_CARD_READER_MERCHENT' }
        }
        case "ADD_POS_CARD_READER_DEVICE":
        {
          return { ...state, data: action.payload, action:'ADD_POS_CARD_READER_DEVICE' }
        }
        case "DELETE_POS_CARD_READER_DEVICE":
        {
          return { ...state, data: action.payload, action:'DELETE_POS_CARD_READER_DEVICE' }
        }
        case "POS_SETUP_EXPRESS_ACCOUNT":
        {
          return { ...state, data: action.payload, action:'POS_SETUP_EXPRESS_ACCOUNT' }
        }
        case "GET_POS_STRIPE_DASHBOARD_URL":
        {
          return { ...state, data: action.payload, action:'GET_POS_STRIPE_DASHBOARD_URL' }
        }
        case "DEFAULT_USERADD_DATA":
        {
          return { ...state, data: action.payload, action:'DEFAULT_USERADD_DATA' }
        }
        case "POS_DISPUTE_DETAIL":
        {
          return { ...state, data: action.payload, action:'POS_DISPUTE_DETAIL' }
        }
        case "ADD_POS_DISPUTE_NOTE":
        {
          return { ...state, data: action.payload, action:'ADD_POS_DISPUTE_NOTE' }
        }
        case "ACCEPT_POS_DISPUTE":
        {
          return { ...state, data: action.payload, action:'ACCEPT_POS_DISPUTE' }
        }
        case "GET_POS_DISPUTE_EVIDENCE":
        {
          return { ...state, data: action.payload, action:'GET_POS_DISPUTE_EVIDENCE' }
        }
        case "SUBMIT_POS_DISPUTE":
        {
          return { ...state, data: action.payload, action:'SUBMIT_POS_DISPUTE' }
        }
        case "SAVE_LATER_POS_DISPUTE":
        {
          return { ...state, data: action.payload, action:'SAVE_LATER_POS_DISPUTE' }
        }
        case "ENABLE_GOOGLE_CALENDAR_SYNC":
        {
          return { ...state, data: action.payload, action:'ENABLE_GOOGLE_CALENDAR_SYNC' }
        }
        case "DISABLE_GOOGLE_CALENDAR_SYNC":
        {
          return { ...state, data: action.payload, action:'DISABLE_GOOGLE_CALENDAR_SYNC' }
        }
        case "DOWNLOAD_TOS":
        {
          return { ...state, data: action.payload, action:'DOWNLOAD_TOS' }
        }
        case "DOWNLOAD_INVOICE":
        {
          return { ...state, data: action.payload, action:'DOWNLOAD_INVOICE' }
        }
        case "PATIENT_PORTAL":{
            return{
              ...state, data:action.payload, action:"PATIENT_PORTAL"
            }
        }
        default:
            return state
    }
}
export default settings;
