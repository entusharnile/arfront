const nameInitialState = {
    action: ''
}
const invoiceData = (state = nameInitialState, action) => {
    switch (action.type) {
      case "RESET_ALL" :{
  			return {
  				action:"RESET_ALL"
  			}
  		}
      case "GET_INVOICE_DETAILS":
      {
          return { ...state, data: action.payload, action: 'GET_INVOICE_DETAILS' }
      }
      case "GET_PAYMENT_HISTORY":
      return{
        ...state,
        data:action.payload,
        action:'GET_PAYMENT_HISTORY'
      }
      case "VOID_INVOICE":
      return{
        ...state,
        data:action.payload,
        action:'VOID_INVOICE'
      }
      case "EMAIL_AND_DOWNLOAD_INVOICE":
      return{
        ...state,
        data:action.payload,
        action:'EMAIL_AND_DOWNLOAD_INVOICE'
      }
      case "EMAIL_AND_DOWNLOAD_REFUND_RECEIPT":
      return{
        ...state,
        data:action.payload,
        action:'EMAIL_AND_DOWNLOAD_REFUND_RECEIPT'
      }
      case "GET_REFUND_DETAILS":
      return{
        ...state,
        data:action.payload,
        action:'GET_REFUND_DETAILS'
      }
      case "ISSUE_REFUND":
      return{
        ...state,
        data:action.payload,
        action:'ISSUE_REFUND'
      }
      case "UPDATE_USER_IN_INVOICE":
      return{
        ...state,
        data:action.payload,
        action:'UPDATE_USER_IN_INVOICE'
      }
      case "EMPTY_DATA":
      {
        return { ...state, data: action.payload, action: 'EMPTY_DATA' }
      }
      case "SAVE_AND_SEND_EMAIL":
      return{
        ...state,
        data:action.payload,
        action:'SAVE_AND_SEND_EMAIL'
      }
      case "MONTHLY_MEMBERSHIP_ISSUE_REFUND":
      return{
        ...state,
        data:action.payload,
        action:'MONTHLY_MEMBERSHIP_ISSUE_REFUND'
      }
      default:
        return state
    }
}
export default invoiceData;
