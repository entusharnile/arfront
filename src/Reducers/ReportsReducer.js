const reportsInitialState={
  action:''
}
const reports =(state = reportsInitialState,action) => {
  switch(action.type){
    case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
    case "REPORTS_LIST":
    return{
      ...state,
      data:action.payload,
      action:'REPORTS_LIST'
    }
    case "CREATE_REPORTS":
    return{
      ...state,
      data:action.payload,
      action:'CREATE_REPORTS'
    }
    case "GET_REPORT_TYPES":
    return{
      ...state,
      data:action.payload,
      action:'GET_REPORT_TYPES'
    }
    case "DELETE_REPORTS":
    return{
      ...state,
      data:action.payload,
      action:'DELETE_REPORTS'
    }
    case "EXPORT_REPORTS":
    return{
      ...state,
      data:action.payload,
      action:'EXPORT_REPORTS'
    }
    case "UPDATE_REPORTS":
    return{
      ...state,
      data:action.payload,
      action:'UPDATE_REPORTS'
    }
    default:
    return state
  }
}
export default reports;
