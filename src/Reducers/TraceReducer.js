const nameInitialState = {
    action: ''
}
const traceData = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
      case "GET_TRACE_DATA":
      {
          return { ...state, data: action.payload, action: 'GET_TRACE_DATA' }
      }
      case "GET_BATCH_BY_PROCEDURE":
      {
          return { ...state, data: action.payload, action: 'GET_BATCH_BY_PROCEDURE' }
      }
      case "GET_UNITS_BY_INVENTORY":
      {
          return { ...state, data: action.payload, action: 'GET_UNITS_BY_INVENTORY' }
      }
      case "SAVE_TRACE":
      {
          return { ...state, data: action.payload, action: 'SAVE_TRACE' }
      }
      case "UPDATE_TRACE":
      {
          return { ...state, data: action.payload, action: 'UPDATE_TRACE' }
      }
      case "DELETE_TRACE":
      {
          return { ...state, data: action.payload, action: 'DELETE_TRACE' }
      }

      default:
        return state
    }
}
export default traceData;
