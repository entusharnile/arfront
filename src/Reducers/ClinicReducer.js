const clinicInitialState = {
  action: ''
}

const settings = (state = clinicInitialState, action) => {
  switch (action.type) {
    case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
    case "CLINIC_LIST":
      return {
        ...state,
        data: action.payload,
        action:'CLINIC_LIST'
      }
      case "SELECTED_CLINIC_LIST":
        return {
          ...state,
          data: action.payload,
          action:'SELECTED_CLINIC_LIST'
        }
        case "CREATE_CLINIC":
        return {
          ...state,
          data: action.payload,
          action:'CREATE_CLINIC'
        }
        case "UPDATE_SELECTED_CLINIC":
        return{
          ...state,
          data:action.payload,
          action:'UPDATE_SELECTED_CLINIC'
        }
        case "TIMEZONE_LIST":
        return{
          ...state,
          data:action.payload,
          action:'TIMEZONE_LIST'
        }
        case "COUNTRIES_LIST":
        return{
          ...state,
          data:action.payload,
          action:'COUNTRIES_LIST'
        }
      case "USER_GET":
      {
        return {
          ...state,
          data: action.payload,
          action: 'USER_GET'
        }
      }
      case "USER_UPDATE":
      {
        return {
          ...state,
          data: action.payload,
          action: 'USER_UPDATE'
        }
      }
      case "DELETE_CLINIC":
      return{
        ...state,
        data:action.payload,
        action:'DELETE_CLINIC'
      }

      case "EMPTY_DATA":
      {
        return { ...state, data: action.payload, action: 'EMPTY_DATA' }
      }
      case "DEFAULT_CLINIC_DATA":
      {
        return { ...state, data: action.payload, action: 'DEFAULT_CLINIC_DATA' }
      }

    default:
      return state
  }
}

export default settings;
