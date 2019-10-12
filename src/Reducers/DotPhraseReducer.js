const nameInitialState = {
    action: ''
}
const dotPharaseData = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
      case "GET_PHRASE_DATA":
      {
          return { ...state, data: action.payload, action: 'GET_PHRASE_DATA' }
      }
      case "EMPTY_DATA":
      {
          return { ...state, data: action.payload, action: 'EMPTY_DATA' }
      }
      case "DELETE_PHRASE_DATA":
      {
          return { ...state, data: action.payload, action: 'DELETE_PHRASE_DATA' }
      }
      case "SAVE_PHRASE_DATA":
      {
          return { ...state, data: action.payload, action: 'SAVE_PHRASE_DATA' }
      }
      case "GET_A_PHRASE_DATA":
      {
          return { ...state, data: action.payload, action: 'GET_A_PHRASE_DATA' }
      }
      case "UPDATE_PHRASE_DATA":
      {
          return { ...state, data: action.payload, action: 'UPDATE_PHRASE_DATA' }
      }
      default:
        return state
    }
}
export default dotPharaseData;
