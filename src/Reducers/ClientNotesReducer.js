const nameInitialState = {
    action: ''
}
const clientNotes = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
      case "GET_CLIENT_NOTES":
      {
          return { ...state, data: action.payload, action: 'GET_CLIENT_NOTES' }
      }
      case "SAVE_CLIENT_NOTES":
      {
          return { ...state, data: action.payload, action: 'SAVE_CLIENT_NOTES' }
      }
      case "DELETE_CLIENT_NOTE":
      {
          return { ...state, data: action.payload, action: 'DELETE_CLIENT_NOTE' }
      }
      case "GET_CLIENT_NOTE":
      {
          return { ...state, data: action.payload, action: 'GET_CLIENT_NOTE' }
      }
      case "UPDATE_CLIENT_NOTE":
      {
          return { ...state, data: action.payload, action: 'UPDATE_CLIENT_NOTE' }
      }
      default:
        return state
    }
}
export default clientNotes;
