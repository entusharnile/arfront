const serviceInitialState = {

  action: ''

}


const ServiceReducer = (state = serviceInitialState, action) => {
  switch (action.type) {
    case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
      case "APPOINTMENT_SURVEY_UPDATE":
        return {
          ...state,
          data: action.payload,
          action:'APPOINTMENT_SURVEY_UPDATE'
        }
    default:
      return state
  }
}

export default ServiceReducer;
