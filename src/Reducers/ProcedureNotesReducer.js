const nameInitialState = {
    action: ''
}
const procedureNotes = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
      case "GET_PROCEDURE_NOTES":
      {
          return { ...state, data: action.payload, action: 'GET_PROCEDURE_NOTES' }
      }
      case "SAVE_PROCEDURE_NOTES":
      {
          return { ...state, data: action.payload, action: 'SAVE_PROCEDURE_NOTES' }
      }
      case "DELETE_PROCEDURE_NOTE":
      {
          return { ...state, data: action.payload, action: 'DELETE_PROCEDURE_NOTE' }
      }
      case "GET_PROCEDURE_NOTE":
      {
          return { ...state, data: action.payload, action: 'GET_PROCEDURE_NOTE' }
      }
      case "UPDATE_PROCEDURE_NOTE":
      {
          return { ...state, data: action.payload, action: 'UPDATE_PROCEDURE_NOTE' }
      }
      default:
        return state
    }
}
export default procedureNotes;
