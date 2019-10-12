const nameInitialState = {
    action: ''
}
const commonValues = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
      case "GET_TRACK_HEAP_EVENT":
      {
          return { ...state, data: action.payload, action: 'GET_TRACK_HEAP_EVENT' }
      }

      default:
        return state
    }
}
export default commonValues;
