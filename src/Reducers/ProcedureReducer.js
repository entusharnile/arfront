const nameInitialState = {
  action: ''
}
const procedureData = (state = nameInitialState, action) => {
  switch (action.type) {
    case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
    case "GET_PROCEDURE_DATA":
      return {
        ...state,
        data: action.payload,
        action: 'GET_PROCEDURE_DATA'
      }
    case "GET_APPT_CONSULT_DATA":
      return {
        ...state,
        data: action.payload,
        action: 'GET_APPT_CONSULT_DATA'
      }
    case "CREATE_PROCEDURE":
      return {
        ...state,
        data: action.payload,
        action: 'CREATE_PROCEDURE'
      }
    case "UPDATE_PROCEDURE":
      return {
        ...state,
        data: action.payload,
        action: 'UPDATE_PROCEDURE'
      }
    case "GET_ASSOCIATED_CLINICS":
      return {
        ...state,
        data: action.payload,
        action: 'GET_ASSOCIATED_CLINICS'
      }
    case "DELETE_PROCEDURE":
      return {
        ...state,
        data: action.payload,
        action: 'DELETE_PROCEDURE'
      }
    case "GET_HEALTH_PROCEDURE_DATA":
      return {
        ...state,
        data: action.payload,
        action: 'GET_HEALTH_PROCEDURE_DATA'
      }
    case "SAVE_HEALTH_PROCEDURE_DATA":
      return {
        ...state,
        data: action.payload,
        action: 'SAVE_HEALTH_PROCEDURE_DATA'
      }
    case "DELETE_HEALTH_PROCEDURE_DATA":
      return {
        ...state,
        data: action.payload,
        action: 'DELETE_HEALTH_PROCEDURE_DATA'
      }
    case "GET_HEALTH_PROCEDURE_TEMPLATE_DATA":
      return {
        ...state,
        data: action.payload,
        action: 'GET_HEALTH_PROCEDURE_TEMPLATE_DATA'
      }
    case "GET_HEALTH_PROCEDURE_PRESCRIPTION":
      return {
        ...state,
        data: action.payload,
        action: 'GET_HEALTH_PROCEDURE_PRESCRIPTION'
      }
    case "SAVE_HEALTH_PROCEDURE_PRESCRIPTION":
      return {
        ...state,
        data: action.payload,
        action: 'SAVE_HEALTH_PROCEDURE_PRESCRIPTION'
      }
    case "DELETE_HEALTH_PROCEDURE_PRESCRIPTION":
      return {
        ...state,
        data: action.payload,
        action: 'DELETE_HEALTH_PROCEDURE_PRESCRIPTION'
      }
    case "VIEW_HEALTH_PROCEDURE_DATA":
      return {
        ...state,
        data: action.payload,
        action: 'VIEW_HEALTH_PROCEDURE_DATA'
      }
    case "SEND_HEALTH_PROCEDURE_PRESCRIPTION":
      return {
        ...state,
        data: action.payload,
        action: 'SEND_HEALTH_PROCEDURE_PRESCRIPTION'
      }
    case "GET_HEALTH_PROCEDURE_CONSENT":
      return {
        ...state,
        data: action.payload,
        action: 'GET_HEALTH_PROCEDURE_CONSENT'
      }
      case "UPDATE_HEALTH_PROCEDURE_CONSENT":
        return {
          ...state,
          data: action.payload,
          action: 'UPDATE_HEALTH_PROCEDURE_CONSENT'
        }
    case "EMPTY_PROCEDURE_REDUCER":
        {
          return {
            ...state,
            data: action.payload,
            action: 'EMPTY_PROCEDURE_REDUCER'
          }
        }
    case "PRO_MDS_LIST":
    return {
      ...state,
      data: action.payload,
      action: 'PRO_MDS_LIST'
    }
    case "SIGN_HEALTH_PROCEDURE":
    return {
      ...state,
      data: action.payload,
      action: 'SIGN_HEALTH_PROCEDURE'
    }
    default:
      return state
  }
}
export default procedureData;
