const clientsInitialState={
  action:''
}
const ClientsReducer =(state = clientsInitialState,action) =>{
  switch(action.type){
    case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
    case "CLIENTS_LIST":
    return{
      ...state,
      data:action.payload,
      action:'CLIENTS_LIST'
    }
    case "CREATE_FILTER":
    return{
      ...state,
      data:action.payload,
      action:'CREATE_FILTER'
    }
    case "GET_CPP_DATA":
    return{
      ...state,
      data:action.payload,
      action:'GET_CPP_DATA'
    }
    case "UPDATE_FILTER":
    return{
      ...state,
      data:action.payload,
      action:'UPDATE_FILTER'
    }
    case "GET_ALL_FILTERS":
    return{
      ...state,
      data:action.payload,
      action:'GET_ALL_FILTERS'
    }
    case "DELETE_FILTER":
    return{
      ...state,
      data:action.payload,
      action:'DELETE_FILTER'
    }
    case "GET_ONE_FILTER":
    return{
      ...state,
      data:action.payload,
      action:'GET_ONE_FILTER'
    }
    case "SAVE_CLIENT_FIELD":
    return{
      ...state,
      data:action.payload,
      action:'SAVE_CLIENT_FIELD'
    }
    case "GET_CLIENT_DETAIL":
    return{
      ...state,
      data:action.payload,
      action:'GET_CLIENT_DETAIL'
    }
    case "FIRE_CLIENT":
    return{
      ...state,
      data:action.payload,
      action:'FIRE_CLIENT'
    }
    case "DNC_CLIENT":
    return{
      ...state,
      data:action.payload,
      action:'DNC_CLIENT'
    }
    case "CHANGE_PORTAL_CLIENT":
    return{
      ...state,
      data:action.payload,
      action:'CHANGE_PORTAL_CLIENT'
    }
    case "GET_CLIENT_CARDS":
    return{
      ...state,
      data:action.payload,
      action:'GET_CLIENT_CARDS'
    }
    case "SAVE_CLIENT_CARD":
    return{
      ...state,
      data:action.payload,
      action:'SAVE_CLIENT_CARD'
    }
    case "UPDATE_MEDICAL_HISTORY":
    return{
      ...state,
      data:action.payload,
      action:'UPDATE_MEDICAL_HISTORY'
    }
    case "RESEND_WELCOME_EMAIL":
    return{
      ...state,
      data:action.payload,
      action:'RESEND_WELCOME_EMAIL'
    }
    case "RESET_CLIENT_PORTAL_PASSWORD":
    return{
      ...state,
      data:action.payload,
      action:'RESET_CLIENT_PORTAL_PASSWORD'
    }
    case "CREATE_CLIENT":
    return{
      ...state,
      data:action.payload,
      action:'CREATE_CLIENT'
    }
    case "UPDATE_CLIENT":
    return{
      ...state,
      data:action.payload,
      action:'UPDATE_CLIENT'
    }
    case "DELETE_CLIENT":
    return{
      ...state,
      data:action.payload,
      action:'DELETE_CLIENT'
    }
    case "GET_CLIENT_WALLET":
    return{
      ...state,
      data:action.payload,
      action:'GET_CLIENT_WALLET'
    }
    case "ADD_CREDIT_TO_WALLET":
    return{
      ...state,
      data:action.payload,
      action:'ADD_CREDIT_TO_WALLET'
    }
    case "REMOVE_CREDIT_FROM_WALLET":
    return{
      ...state,
      data:action.payload,
      action:'REMOVE_CREDIT_FROM_WALLET'
    }
    case "UPDATE_WALLET_PACKAGE":
    return{
      ...state,
      data:action.payload,
      action:'UPDATE_WALLET_PACKAGE'
    }
    case "REMOVE_WALLET_PACKAGE":
    return{
      ...state,
      data:action.payload,
      action:'REMOVE_WALLET_PACKAGE'
    }
    case "UPDATE_MEMBERSHIP_CC":
    return{
      ...state,
      data:action.payload,
      action:'UPDATE_MEMBERSHIP_CC'
    }
    case "CANCEL_MEMBERSHIP":
    return{
      ...state,
      data:action.payload,
      action:'CANCEL_MEMBERSHIP'
    }
    case "ADD_MONTHLY_MEMBERSHIP":
    return{
      ...state,
      data:action.payload,
      action:'ADD_MONTHLY_MEMBERSHIP'
    }
    case "SEARCH_WALLET_PRODUCT":
    return{
      ...state,
      data:action.payload,
      action:'SEARCH_WALLET_PRODUCT'
    }
    case "ADD_PACKAGE_PRODUCT":
    return{
      ...state,
      data:action.payload,
      action:'ADD_PACKAGE_PRODUCT'
    }
    case "GET_BOGO_PACKAGE_DETAILS":
    return{
      ...state,
      data:action.payload,
      action:'GET_BOGO_PACKAGE_DETAILS'
    }
    case "GET_PRODUCT_PRICE_BY_CLINIC":
    return{
      ...state,
      data:action.payload,
      action:'GET_PRODUCT_PRICE_BY_CLINIC'
    }
    case "EXPORT_FILE":
    {
        return { ...state, data: action.payload, action: 'EXPORT_FILE' }
    }
    case "EXPORT_CLIENT_PDF":
    {
        return { ...state, data: action.payload, action: 'EXPORT_CLIENT_PDF' }
    }
    case "REFUND_FEES":
    {
        return { ...state, data: action.payload, action: 'REFUND_FEES' }
    }
    case "EMPTY_DATA":
    {
        return { ...state, data: action.payload, action: 'EMPTY_DATA' }
    }
    case "EXPORT_CLIENT_PROCEDURES":
    {
        return { ...state, data: action.payload, action: 'EXPORT_CLIENT_PROCEDURES' }
    }
    case "CLIENT_BULK_UPLOAD":
    {
        return { ...state, data: action.payload, action: 'CLIENT_BULK_UPLOAD' }
    }
    case "VIEW_FILLED_SURVEYS":
    {
        return { ...state, data: action.payload, action: 'VIEW_FILLED_SURVEYS' }
    }
    case "SEND_POST_INSTRUCTION":
    {
        return { ...state, data: action.payload, action: 'SEND_POST_INSTRUCTION' }
    }
    case "CLIENT_DOCUMENT_LIST":
    {
        return { ...state, data: action.payload, action: 'CLIENT_DOCUMENT_LIST' }
    }
    case "CLIENT_DOCUMENT_DATA":
    {
        return { ...state, data: action.payload, action: 'CLIENT_DOCUMENT_DATA' }
    }
    case "CLIENT_DOCUMENT_SAVE":
    {
        return { ...state, data: action.payload, action: 'CLIENT_DOCUMENT_SAVE' }
    }
    case "CLIENT_DOCUMENT_UPDATE":
    {
        return { ...state, data: action.payload, action: 'CLIENT_DOCUMENT_UPDATE' }
    }
    case "CLIENT_DOCUMENT_DELETE":
    {
        return { ...state, data: action.payload, action: 'CLIENT_DOCUMENT_DELETE' }
    }
    case "VIEW_AFTER_PHOTOS":
    {
        return { ...state, data: action.payload, action: 'VIEW_AFTER_PHOTOS' }
    }
    case "GET_MEMBERSHIP_DETAILS":
    {
        return { ...state, data: action.payload, action: 'GET_MEMBERSHIP_DETAILS' }
    }
    case "APPLY_DISCOUNT_COUPON":
    {
        return { ...state, data: action.payload, action: 'APPLY_DISCOUNT_COUPON' }
    }
    case "GET_TREAT_TEMPLATES":
    {
        return { ...state, data: action.payload, action: 'GET_TREAT_TEMPLATES' }
    }
    case "GET_PLAN_TEMPLATE_DATA":
    {
        return { ...state, data: action.payload, action: 'GET_PLAN_TEMPLATE_DATA' }
    }
    case "SAVE_PAYG_TREATMENT_PLAN":
    {
        return { ...state, data: action.payload, action: 'SAVE_PAYG_TREATMENT_PLAN' }
    }
    case "GET_PLAN_DATA_BY_ID":
    {
        return { ...state, data: action.payload, action: 'GET_PLAN_DATA_BY_ID' }
    }
    case "SAVE_MONTHLY_TREATMENT_PLAN":
    {
        return { ...state, data: action.payload, action: 'SAVE_MONTHLY_TREATMENT_PLAN' }
    }
    case "GET_START_PROGRAM_DATA":
    {
        return { ...state, data: action.payload, action: 'GET_START_PROGRAM_DATA' }
    }
    case "START_PROGRAM_APPLY_DISCOUNT":
    {
        return { ...state, data: action.payload, action: 'START_PROGRAM_APPLY_DISCOUNT' }
    }
    case "CHANGE_PLAN_CLINIC":
    {
        return { ...state, data: action.payload, action: 'CHANGE_PLAN_CLINIC' }
    }
    case "VIEW_PRICE_BREAK_UP":
    {
        return { ...state, data: action.payload, action: 'VIEW_PRICE_BREAK_UP' }
    }
    case "START_TREATMENT_PROGRAM":
    {
        return { ...state, data: action.payload, action: 'START_TREATMENT_PROGRAM' }
    }
    case "CANCEL_TREATMENT_PLAN":
    {
        return { ...state, data: action.payload, action: 'CANCEL_TREATMENT_PLAN' }
    }
    case "SAVE_PLAN_AS_TEMPLATE":
    {
        return { ...state, data: action.payload, action: 'SAVE_PLAN_AS_TEMPLATE' }
    }
    case "UPDATE_PLAN_CARD":
    {
        return { ...state, data: action.payload, action: 'UPDATE_PLAN_CARD' }
    }
    case "GET_PRESCRIBE_ONLY_DETAILS":
    {
        return { ...state, data: action.payload, action: 'GET_PRESCRIBE_ONLY_DETAILS' }
    }
    case "UPDATE_PRESCRIBE_ONLY":
    {
        return { ...state, data: action.payload, action: 'UPDATE_PRESCRIBE_ONLY' }
    }
    case "PERFORM_TREATMENT_ACTIONS":
    {
        return { ...state, data: action.payload, action: 'PERFORM_TREATMENT_ACTIONS' }
    }
  default:
    return state;
}
}
export default ClientsReducer;
