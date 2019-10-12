const consentsInitialState = {
  action: ''
}

const consents = (state = consentsInitialState, action) => {
  switch (action.type) {
    case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
    case "CONSENTS_LIST":
      return {
        ...state,
        data: action.payload,
        action:'CONSENTS_LIST'
      }
      case "SELECTED_CONSENTS_LIST":
        return {
          ...state,
          data: action.payload,
          action:'SELECTED_CONSENTS_LIST'
        }
        case "CREATE_CONSENTS":
        return {
          ...state,
          data: action.payload,
          action:'CREATE_CONSENTS'
        }
        case "UPDATE_SELECTED_CONSENTS":
        return{
          ...state,
          data:action.payload,
          action:'UPDATE_SELECTED_CONSENTS'
        }
    default:
      return state
  }
}

export default consents;
