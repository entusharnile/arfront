    const nameInitialState = {
        action: ''
        }
        const dashboard = (state = nameInitialState, action) => {
        switch (action.type) {
          case "RESET_ALL" :{
      			return {
      				action:"RESET_ALL"
      			}
      		}
        case "USER_LOGS_LIST":
        {
            return { ...state, data: action.payload, action: 'USER_LOGS_LIST' }
        }

        case "SMS_NOTIFICATION_LIST":
        {
            return { ...state, data: action.payload, action: 'SMS_NOTIFICATION_LIST' }
        }

        case "NOTIFICATION_LIST":
        {
            return { ...state, data: action.payload, action: 'NOTIFICATION_LIST' }
        }

        case "DELETE_NOTIFICATION_DATA":
        {
            return { ...state, data: action.payload, action: 'DELETE_NOTIFICATION_DATA' }
        }
        case "EXPORT_CSV":
        {
            return { ...state, data: action.payload, action: 'EXPORT_CSV' }
        }
        case "VIEW_CHANGES":
        {
            return { ...state, data: action.payload, action: 'VIEW_CHANGES' }
        }

        case "FETCH_DASH_CLINICS":
        {
            return { ...state, data: action.payload, action: 'FETCH_DASH_CLINICS' }
        }


        case "SELECTED_SMS_POPUPS":
        {
            return { ...state, data: action.payload, action: 'SELECTED_SMS_POPUPS' }
        }

        case "FETCH_POPUPS_MENU":
        {
        return { ...state, data: action.payload, action: 'FETCH_POPUPS_MENU' }
        }

        case "CREATE_REPLY":
        {
        return { ...state, data: action.payload, action: 'CREATE_REPLY' }
        }

        case "EMPTY_DATA":
        {
            return { ...state, data: action.payload, action: 'EMPTY_DATA' }
        }
        default:
          return state
      }
    }
export default dashboard;
