const nameInitialState = {
    action: ''
}
const treatmentMarkingData = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
      case "VIEW_TREATMENT_MARKINGS":
      return {
        ...state,
        data:action.payload,
        action:'VIEW_TREATMENT_MARKINGS'
      }

      default:
        return state
    }
}
export default treatmentMarkingData;
