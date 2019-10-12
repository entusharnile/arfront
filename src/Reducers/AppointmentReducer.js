const appointmentsInitialState = {

  action: ''

}


const AppointmentReducer = (state = appointmentsInitialState, action) => {
  switch (action.type) {
    case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
    case "EMPTY_APPOINTMENT_DATA":
    {
        return { ...state, data: action.payload, action: 'EMPTY_DATA' }
    }
    case "APPOINTMENT_SURVEY_LIST":
    {
      return { ...state,data: action.payload,action:'APPOINTMENT_SURVEY_LIST' }
    }
    case "APPOINTMENT_SURVEY_UPDATE":
    {
      return { ...state,data: action.payload,action:'APPOINTMENT_SURVEY_UPDATE' }
    }
    case "SERVICE_CAT_LIST":
    {
        return { ...state,data: action.payload,action:'SERVICE_CAT_LIST' }
    }
    case "SERVICE_CATEGORY_DATA":
    {
        return { ...state, data: action.payload, action: 'SERVICE_CATEGORY_DATA' }
    }
    case "CREATE_SERVICE_CATEGORY":
    {
        return { ...state, data: action.payload, action: 'CREATE_SERVICE_CATEGORY' }
    }
    case "CREATE_SERVICE_CATEGORY_FROM_SERVICE":
    {
        return { ...state, data: action.payload, action: 'CREATE_SERVICE_CATEGORY_FROM_SERVICE' }
    }
    case "UPDATE_SERVICE_CATEGORY":
    {
        return { ...state, data: action.payload, action: 'UPDATE_SERVICE_CATEGORY' }
    }
    case "DELETE_SERVICE_CATEGORY":
    {
        return { ...state, data: action.payload, action: 'DELETE_SERVICE_CATEGORY' }
    }
    case "SERVICE_CATEGORY_SERVICES_LIST":
    {
        return { ...state, data: action.payload, action: 'SERVICE_CATEGORY_SERVICES_LIST' }
    }
    case "SERVICE_DATA_AND_LIST_DATA":
    {
        return { ...state, data: action.payload, action: 'SERVICE_DATA_AND_LIST_DATA' }
    }
    case "SERVICE_SORT_ORDER_UPDATE":
    {
        return { ...state, data: action.payload, action: 'SERVICE_SORT_ORDER_UPDATE' }
    }
    case "CREATE_SERVICE":
    {
        return { ...state, data: action.payload, action: 'CREATE_SERVICE' }
    }
    case "UPDATE_SERVICE":
    {
        return { ...state, data: action.payload, action: 'UPDATE_SERVICE' }
    }
    case "DELETE_SERVICE":
    {
        return { ...state, data: action.payload, action: 'DELETE_SERVICE' }
    }
    case "SERVICES_PACKAGES_LIST":
    {
        return { ...state, data: action.payload, action: 'SERVICES_PACKAGES_LIST' }
    }
    case "SERVICES_PACKAGES_DATA":
    {
        return { ...state, data: action.payload, action: 'SERVICES_PACKAGES_DATA' }
    }
    case "CREATE_SERVICES_PACKAGES":
    {
        return { ...state, data: action.payload, action: 'CREATE_SERVICES_PACKAGES' }
    }
    case "UPDATE_SERVICES_PACKAGES":
    {
        return { ...state, data: action.payload, action: 'UPDATE_SERVICES_PACKAGES' }
    }
    case "DELETE_SERVICES_PACKAGES":
    {
        return { ...state, data: action.payload, action: 'DELETE_SERVICES_PACKAGES' }
    }
    case "PROVIDER_SCHEDULE_LIST":
    {
        return { ...state, data: action.payload, action: 'PROVIDER_SCHEDULE_LIST' }
    }
    case "PROVIDER_SCHEDULE_DYNAMIC_ORDERING":
    {
        return { ...state, data: action.payload, action: 'PROVIDER_SCHEDULE_DYNAMIC_ORDERING' }
    }
    case "PROVIDER_SCHEDULE_SORT_ORDER_UPDATE":
    {
        return { ...state, data: action.payload, action: 'PROVIDER_SCHEDULE_SORT_ORDER_UPDATE' }
    }
    case "PROVIDER_SCHEDULE_DATA":
    {
        return { ...state, data: action.payload, action: 'PROVIDER_SCHEDULE_DATA' }
    }
    case "CREATE_PROVIDER_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'CREATE_PROVIDER_SCHEDULE' }
    }
    case "UPDATE_PROVIDER_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'UPDATE_PROVIDER_SCHEDULE' }
    }
    case "DELETE_PROVIDER_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'DELETE_PROVIDER_SCHEDULE' }
    }
    case "EQUIPMENT_SCHEDULE_LIST":
    {
        return { ...state, data: action.payload, action: 'EQUIPMENT_SCHEDULE_LIST' }
    }
    case "EQUIPMENT_SCHEDULE_DATA":
    {
        return { ...state, data: action.payload, action: 'EQUIPMENT_SCHEDULE_DATA' }
    }
    case "CREATE_EQUIPMENT_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'CREATE_EQUIPMENT_SCHEDULE' }
    }
    case "UPDATE_EQUIPMENT_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'UPDATE_EQUIPMENT_SCHEDULE' }
    }
    case "DELETE_EQUIPMENT_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'DELETE_EQUIPMENT_SCHEDULE' }
    }
    case "RESOURCE_SCHEDULE_LIST":
    {
        return { ...state, data: action.payload, action: 'RESOURCE_SCHEDULE_LIST' }
    }
    case "RESOURCE_SCHEDULE_DATA":
    {
        return { ...state, data: action.payload, action: 'RESOURCE_SCHEDULE_DATA' }
    }
    case "CREATE_RESOURCE_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'CREATE_RESOURCE_SCHEDULE' }
    }
    case "UPDATE_RESOURCE_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'UPDATE_RESOURCE_SCHEDULE' }
    }
    case "DELETE_RESOURCE_SCHEDULE":
    {
        return { ...state, data: action.payload, action: 'DELETE_RESOURCE_SCHEDULE' }
    }
    case "CREATE_RESOURCE_TYPE":
    {
        return { ...state, data: action.payload, action: 'CREATE_RESOURCE_TYPE' }
    }
    case "CREATE_DEVICE":
    {
        return { ...state, data: action.payload, action: 'CREATE_DEVICE' }
    }
    case "GET_APPOINTMENTS":
    {
        return { ...state, data: action.payload, action: 'GET_APPOINTMENTS' }
    }
    case "SEARCH_PATIENTS":
    {
        return { ...state, data: action.payload, action: 'SEARCH_PATIENTS' }
    }
    case "GET_CLINICS":
    {
        return { ...state, data: action.payload, action: 'GET_CLINICS' }
    }
    case "GET_PROVIDERS":
    {
        return { ...state, data: action.payload, action: 'GET_PROVIDERS' }
    }
    case "GET_SERVICES":
    {
        return { ...state, data: action.payload, action: 'GET_SERVICES' }
    }
    case "GET_PROVIDER_AVAILABILITY":
    {
        return { ...state, data: action.payload, action: 'GET_PROVIDER_AVAILABILITY' }
    }
    case "GET_PROVIDER_TIME":
    {
        return { ...state, data: action.payload, action: 'GET_PROVIDER_TIME' }
    }
    case "SAVE_APPOINTMENT":
    {
        return { ...state, data: action.payload, action: 'SAVE_APPOINTMENT' }
    }
    case "APPOINTMENT_GET":
    {
        return { ...state, data: action.payload, action: 'APPOINTMENT_GET' }
    }
    case "APPOINTMENT_EDIT_GET":
    {
        return { ...state, data: action.payload, action: 'APPOINTMENT_EDIT_GET' }
    }
    case "MARKED_NO_SHOW":
    {
        return { ...state, data: action.payload, action: 'MARKED_NO_SHOW' }
    }
    case "GET_CHECKIN_DATA":
    {
        return { ...state, data: action.payload, action: 'GET_CHECKIN_DATA' }
    }
    case "POST_CHECKIN_DATA":
    {
        return { ...state, data: action.payload, action: 'POST_CHECKIN_DATA' }
    }
    case "CHECK_POS_ENABLED":
    {
        return { ...state, data: action.payload, action: 'CHECK_POS_ENABLED' }
    }
    case "GET_CARD_DETAILS":
    {
        return { ...state, data: action.payload, action: 'GET_CARD_DETAILS' }
    }
    case "SEND_NOTIFICATION":
    {
        return { ...state, data: action.payload, action: 'SEND_NOTIFICATION' }
    }
    case "SEND_NOTIFICATION_CALENDAR":
    {
        return { ...state, data: action.payload, action: 'SEND_NOTIFICATION_CALENDAR' }
    }
    case "APPOINTMENT_FEES":
    {
        return { ...state, data: action.payload, action: 'APPOINTMENT_FEES' }
    }
    case "APPOINTMENT_CANCELLED":
    {
        return { ...state, data: action.payload, action: 'APPOINTMENT_CANCELLED' }
    }
    case "CANCEL_NOTIFICATION_MESSAGE":
    {
        return { ...state, data: action.payload, action: 'CANCEL_NOTIFICATION_MESSAGE' }
    }
    case "RESCHEDULE_TIME":
    {
        return { ...state, data: action.payload, action: 'RESCHEDULE_TIME' }
    }
    case "APPOINTMENT_RESCHEDULED":
    {
        return { ...state, data: action.payload, action: 'APPOINTMENT_RESCHEDULED' }
    }
    case "UPDATE_NOTES":
    {
        return { ...state, data: action.payload, action: 'UPDATE_NOTES' }
    }
    case "BOOKING_HISTORY_LIST":
    {
        return { ...state, data: action.payload, action: 'BOOKING_HISTORY_LIST' }
    }
    case "PRINT_APPOINTMENT":
    {
        return { ...state, data: action.payload, action: 'PRINT_APPOINTMENT' }
    }
    case "CLIENT_DATA_APPOINTMENT":
    {
        return { ...state, data: action.payload, action: 'CLIENT_DATA_APPOINTMENT' }
    }
    case "SCHEDULE_OF_PROVIDER":
    {
        return { ...state, data: action.payload, action: 'SCHEDULE_OF_PROVIDER' }
    }
    case "DELETE_MASS_SCHEDULES":
    {
        return { ...state, data: action.payload, action: 'DELETE_MASS_SCHEDULES' }
    }
    case "FETCH_REPORTS":
    {
        return { ...state, data: action.payload, action: 'FETCH_REPORTS' }
    }
    case "SERVICE_SERVICES_LIST":
    {
        return { ...state, data: action.payload, action: 'SERVICE_SERVICES_LIST' }
    }
    case "SORT_ORDER_UPDATE":
    {
        return { ...state, data: action.payload, action: 'SORT_ORDER_UPDATE' }
    }
    default:
      return state
  }
}

export default AppointmentReducer;
