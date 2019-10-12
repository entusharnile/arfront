import axios from 'axios';
import { getToken, handleInvalidToken, setConfigData, positionFooterCorrectly } from '../../Utils/services.js';

import config from '../../config';
let url = config.API_URL;

positionFooterCorrectly();
const appointmentInstance = axios.create();
appointmentInstance.defaults.headers.common['access-token'] = getToken();

let source = axios.CancelToken.source();

appointmentInstance.interceptors.response.use(function (response) {
  if(response.data != undefined && response.data.global_settings != undefined){
    setConfigData(response.data.global_settings);
  }
  positionFooterCorrectly();
  return response;
}, function (error) {
   if(!error.response) {
      return {data : {data : "", message : "server_error", status : 500}}
   } else {
      if(error.response.status == 500) {
        return {data : {data : "", message : "server_error", status : 500}}
      }
      let msg = error.response.data.message;
      if(msg == 'invalid_token' || msg == 'session_timeout' || msg == 'server_error' || msg == 'token_not_found') {
          handleInvalidToken();
      }

      return Promise.reject(error);
   }
});

export const getServiceCategories = (formData) => {
	return dispatch => {
		appointmentInstance.get(url + "services-categories", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "SERVICE_CAT_LIST", "payload": response.data });
		}).catch(error => {
			console.log(error);
			dispatch({ "type": "SERVICE_CAT_LIST", "payload": error.response.data });
		});
	}
}
export const fetchSelectedClinic = (formData,clinicId) => {
	return dispatch => {
		appointmentInstance.get(url + "clinics/"+clinicId + "?scopes=business_hours", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "SELECTED_CLINIC_LIST", "payload": response.data });
		}).catch(error => {
			console.log(error);
			dispatch({ "type": "SELECTED_CLINIC_LIST", "payload": error.response.data });
		});
	}
}

export function fetchServiceCategory(formData,postId) {
    return dispatch => {
        appointmentInstance.get(url + "services-categories/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SERVICE_CATEGORY_DATA", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SERVICE_CATEGORY_DATA", "payload": error.response.data });
        });
    }
}

export function createServiceCategory(formData) {
    return dispatch => {
        appointmentInstance.post(url + "services-categories", ((formData) ? formData : '')).then(response => {
            if(formData.from && formData.from == 'services') {
                dispatch({ "type": "CREATE_SERVICE_CATEGORY_FROM_SERVICE", "payload": response.data });
            } else {
                dispatch({ "type": "CREATE_SERVICE_CATEGORY", "payload": response.data });
            }
        }).catch(error => {
            if(formData.from && formData.from == 'services') {
                dispatch({ "type": "CREATE_SERVICE_CATEGORY_FROM_SERVICE", "payload": error.response.data });
            } else {
                dispatch({ "type": "CREATE_SERVICE_CATEGORY", "payload": error.response.data });
            }
        });
    }
}

export function updateServiceCategory(formData,postId) {
    return dispatch => {
        appointmentInstance.patch(url + "services-categories/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_SERVICE_CATEGORY", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "UPDATE_SERVICE_CATEGORY", "payload": error.response.data });
        })
    }
}

export function deleteServiceCategory(postId) {
    return dispatch => {
        appointmentInstance.delete(url + "services-categories/"+postId).then(response => {
            dispatch({ "type": "DELETE_SERVICE_CATEGORY", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "DELETE_SERVICE_CATEGORY", "payload": error.response.data });
        })
    }
}

export function getServiceListByCategoryId(formData,postId) {
    return dispatch => {
        appointmentInstance.get(url + "services/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SERVICE_CATEGORY_SERVICES_LIST", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SERVICE_CATEGORY_SERVICES_LIST", "payload": error.response.data });
        })
    }
}
export function getServiceList(formData) {
    return dispatch => {
        appointmentInstance.get(url + "services", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SERVICE_SERVICES_LIST", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SERVICE_SERVICES_LIST", "payload": error.response.data });
        })
    }
}

export function updateServiceSortOrder(formData, postId) {
    return dispatch => {
        appointmentInstance.post(url + "services/"+postId + "/service-orders", (formData)).then(response => {
            dispatch({ "type": "SERVICE_SORT_ORDER_UPDATE", "payload": response.data });
            dispatch(exportEmptyData({}));
        }).catch(error => {
            dispatch({ "type": "SERVICE_SORT_ORDER_UPDATE", "payload": error.response.data });
            dispatch(exportEmptyData({}));
        });
    }
}

export function fetchServiceAndListData(formData,postId) {
    return dispatch => {
        appointmentInstance.get(url + "services/clone/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SERVICE_DATA_AND_LIST_DATA", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SERVICE_DATA_AND_LIST_DATA", "payload": error.response.data });
        });
    }
}

export function createService(formData,serviceCategoryId) {
    return dispatch => {
        appointmentInstance.post(url + "service/add/"+serviceCategoryId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_SERVICE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CREATE_SERVICE", "payload": error.response.data });
        });
    }
}

export function updateService(formData,serviceCategoryId,postId) {
    return dispatch => {
        appointmentInstance.put(url + "service/edit/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_SERVICE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "UPDATE_SERVICE", "payload": error.response.data });
        })
    }
}

export function deleteService(postId) {
    return dispatch => {
        appointmentInstance.delete(url + "services/"+postId).then(response => {
            dispatch({ "type": "DELETE_SERVICE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "DELETE_SERVICE", "payload": error.response.data });
        })
    }
}

export function fetchServicesPackages(formData) {
    return dispatch => {
        appointmentInstance.get(url + "packages", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SERVICES_PACKAGES_LIST", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SERVICES_PACKAGES_LIST", "payload": error.response.data });
        });
    }
}

export function getServicesPackagesById(formData,postId) {
    return dispatch => {
        appointmentInstance.get(url + "packages/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SERVICES_PACKAGES_DATA", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SERVICES_PACKAGES_DATA", "payload": error.response.data });
        });
    }
}

export function createServicesPackages(formData) {
    return dispatch => {
        appointmentInstance.post(url + "packages/0", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_SERVICES_PACKAGES", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CREATE_SERVICES_PACKAGES", "payload": error.response.data });
        });
    }
}

export function updateServicesPackages(formData,postId) {
    return dispatch => {
        appointmentInstance.put(url + "packages/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_SERVICES_PACKAGES", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "UPDATE_SERVICES_PACKAGES", "payload": error.response.data });
        })
    }
}

export function deleteServicesPackages(postId) {
    return dispatch => {
        appointmentInstance.delete(url + "packages/"+postId).then(response => {
            dispatch({ "type": "DELETE_SERVICES_PACKAGES", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "DELETE_SERVICES_PACKAGES", "payload": error.response.data });
        })
    }
}

export function fetchProviderSchedule(formData) {
    return dispatch => {
        appointmentInstance.get(url + "provider-schedules", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "PROVIDER_SCHEDULE_LIST", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "PROVIDER_SCHEDULE_LIST", "payload": error.response.data });
        });
    }
}

export function dynamicOrderingProviderSchedule(formData) {
    return dispatch => {
        appointmentInstance.post(url + "provider-schedules/dynamic-ordering", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "PROVIDER_SCHEDULE_DYNAMIC_ORDERING", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "PROVIDER_SCHEDULE_DYNAMIC_ORDERING", "payload": error.response.data });
        });
    }
}

export function updateProviderScheduleSortOrder(formData) {
    return dispatch => {
        //appointmentInstance.put(url + "update/row/order/ProvidersAdvanceSchedule", (formData)).then(response => {
        appointmentInstance.post(url + "update/provider/order", (formData)).then(response => {
            dispatch({ "type": "PROVIDER_SCHEDULE_SORT_ORDER_UPDATE", "payload": response.data });
            dispatch(exportEmptyData({}));
        }).catch(error => {
            dispatch({ "type": "PROVIDER_SCHEDULE_SORT_ORDER_UPDATE", "payload": error.response.data });
            dispatch(exportEmptyData({}));
        });
    }
}


export function getProviderScheduleById(formData,postId) {
    return dispatch => {
        appointmentInstance.get(url + "provider-schedules/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "PROVIDER_SCHEDULE_DATA", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "PROVIDER_SCHEDULE_DATA", "payload": error.response.data });
        });
    }
}

export function createProviderSchedule(formData) {
    return dispatch => {
        appointmentInstance.post(url + "provider-schedules", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_PROVIDER_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CREATE_PROVIDER_SCHEDULE", "payload": error.response.data });
        });
    }
}

export function updateProviderSchedule(formData,postId) {
    return dispatch => {
        appointmentInstance.put(url + "provider-schedules/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_PROVIDER_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "UPDATE_PROVIDER_SCHEDULE", "payload": error.response.data });
        })
    }
}

export function deleteProviderSchedule(formData) {
    return dispatch => {
        appointmentInstance.post(url + "delete-provider-scheduled", formData).then(response => {
            dispatch({ "type": "DELETE_PROVIDER_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "DELETE_PROVIDER_SCHEDULE", "payload": error.response.data });
        })
    }
}

export function fetchEquipmentSchedule(formData) {
    return dispatch => {
        appointmentInstance.get(url + "devices", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EQUIPMENT_SCHEDULE_LIST", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "EQUIPMENT_SCHEDULE_LIST", "payload": error.response.data });
        });
    }
}

export function getEquipmentScheduleById(formData,postId) {
    return dispatch => {
        appointmentInstance.get(url + "devices/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "EQUIPMENT_SCHEDULE_DATA", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "EQUIPMENT_SCHEDULE_DATA", "payload": error.response.data });
        });
    }
}

export function createEquipmentSchedule(formData) {
    return dispatch => {
        appointmentInstance.post(url + "devices/0", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_EQUIPMENT_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CREATE_EQUIPMENT_SCHEDULE", "payload": error.response.data });
        });
    }
}

export function updateEquipmentSchedule(formData,postId) {
    return dispatch => {
        appointmentInstance.put(url + "devices/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_EQUIPMENT_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "UPDATE_EQUIPMENT_SCHEDULE", "payload": error.response.data });
        })
    }
}

export function deleteEquipmentSchedule(postId) {
    return dispatch => {
        appointmentInstance.delete(url + "devices/"+postId).then(response => {
            dispatch({ "type": "DELETE_EQUIPMENT_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "DELETE_EQUIPMENT_SCHEDULE", "payload": error.response.data });
        })
    }
}

export function fetchResourceSchedule(formData) {
    return dispatch => {
        appointmentInstance.get(url + "resources", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "RESOURCE_SCHEDULE_LIST", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "RESOURCE_SCHEDULE_LIST", "payload": error.response.data });
        });
    }
}

export function getResourceScheduleById(formData,postId) {
    return dispatch => {
        appointmentInstance.get(url + "resources/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "RESOURCE_SCHEDULE_DATA", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "RESOURCE_SCHEDULE_DATA", "payload": error.response.data });
        });
    }
}

export function createResourceSchedule(formData) {
    return dispatch => {
        appointmentInstance.post(url + "resources/0", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_RESOURCE_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CREATE_RESOURCE_SCHEDULE", "payload": error.response.data });
        });
    }
}

export function updateResourceSchedule(formData,postId) {
    return dispatch => {
        appointmentInstance.put(url + "resources/"+postId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_RESOURCE_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "UPDATE_RESOURCE_SCHEDULE", "payload": error.response.data });
        })
    }
}

export function deleteResourceSchedule(postId) {
    return dispatch => {
        appointmentInstance.delete(url + "resources/"+postId).then(response => {
            dispatch({ "type": "DELETE_RESOURCE_SCHEDULE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "DELETE_RESOURCE_SCHEDULE", "payload": error.response.data });
        })
    }
}

export function createResourceType(formData) {
    return dispatch => {
        appointmentInstance.post(url + "resource-types", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_RESOURCE_TYPE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CREATE_RESOURCE_TYPE", "payload": error.response.data });
        });
    }
}

export function createDevice(formData) {
    return dispatch => {
        appointmentInstance.post(url + "devices/0", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_DEVICE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CREATE_DEVICE", "payload": error.response.data });
        });
    }
}

export function exportEmptyData(formData) {
    return dispatch => {
        dispatch({ "type": "EMPTY_APPOINTMENT_DATA", "payload": {data: '', status:200, message : ''} });
    }
}
export function getAppointments(formData) {
    return dispatch => {
        appointmentInstance.post(url + "appointment", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "GET_APPOINTMENTS", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "GET_APPOINTMENTS", "payload": error.response.data });
        });
    }
}
export function searchPatientByName(formData) {
    // check how we can cancel last requests

    
    return dispatch => {
        console.log(source);
        if (typeof source != typeof undefined) {
          source.cancel('Operation canceled due to new request.')
        }

        source = axios.CancelToken.source();
        axios.get(url + "find-patient/"+formData.client, { cancelToken: source.token }).then(response => {
            dispatch({ "type": "SEARCH_PATIENTS", "payload": response.data });
        }).catch(error => {
            if (axios.isCancel(error)) {
                console.log('Request canceled', error);
            } else {
                console.log(error);
                dispatch({ "type": "SEARCH_PATIENTS", "payload": error.response.data });
            }
        });
    }
}
export function getClinics(formData) {
    return dispatch => {
        appointmentInstance.get(url + "list_clinics").then(response => {
            dispatch({ "type": "GET_CLINICS", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "GET_CLINICS", "payload": error.response.data });
        });
    }
}
export function getProviders(formData) {
    return dispatch => {
        appointmentInstance.post(url + "all-available-providers", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "GET_PROVIDERS", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "GET_PROVIDERS", "payload": error.response.data });
        });
    }
}
export function getProviderAvailability(formData) {
    return dispatch => {
        appointmentInstance.post(url + "get-provider-availability", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "GET_PROVIDER_AVAILABILITY", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "GET_PROVIDER_AVAILABILITY", "payload": error.response.data });
        });
    }
}
export function getProviderTime(formData) {
    return dispatch => {
        appointmentInstance.post(url + "get-provider-time", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "GET_PROVIDER_TIME", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "GET_PROVIDER_TIME", "payload": error.response.data });
        });
    }
}
export function getServices(formData) {
    return dispatch => {
        appointmentInstance.get(url + "clinic-services-and-packages/"+formData.clinicId).then(response => {
            dispatch({ "type": "GET_SERVICES", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "GET_SERVICES", "payload": error.response.data });
        });
    }
}
export function getAppointment(id, mode) {
    return dispatch => {
        appointmentInstance.get(url + "edit-appointment/"+id).then(response => {
            if(mode == 'view') {
                dispatch({ "type": "APPOINTMENT_GET", "payload": response.data });
            } else {
                dispatch({ "type": "APPOINTMENT_EDIT_GET", "payload": response.data });
            }
        }).catch(error => {
            if(mode == 'edit') {
                dispatch({ "type": "APPOINTMENT_GET", "payload": error.response.data });
            } else {
                dispatch({ "type": "APPOINTMENT_EDIT_GET", "payload": error.response.data });
            }

        });
    }
}
export function saveAppointment(formData) {
    return dispatch => {
        appointmentInstance.post(url + "create-appointment", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "SAVE_APPOINTMENT", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SAVE_APPOINTMENT", "payload": error.response.data });
        });
    }
}
export function markNoShow(formData) {
    return dispatch => {
        appointmentInstance.get(url + "mark-as-noshow/"+formData.appointment_id+"/"+formData.charge ).then(response => {
            dispatch({ "type": "MARKED_NO_SHOW", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "MARKED_NO_SHOW", "payload": error.response.data });
        });
    }
}
export function updateNotes(formData) {
    return dispatch => {
        appointmentInstance.post(url + "add-appointment-note",(formData) ).then(response => {
            dispatch({ "type": "UPDATE_NOTES", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "UPDATE_NOTES", "payload": error.response.data });
        });
    }
}
export function checkin(id) {
    return dispatch => {
        appointmentInstance.get(url + "appointment-check-in/"+id ).then(response => {
            dispatch({ "type": "GET_CHECKIN_DATA", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "GET_CHECKIN_DATA", "payload": error.response.data });
        });
    }
}
export function makePatientCheckin(formData) {
    return dispatch => {
        appointmentInstance.post(url + "appointment-check-in/"+formData.id, formData ).then(response => {
            dispatch({ "type": "POST_CHECKIN_DATA", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "POST_CHECKIN_DATA", "payload": error.response.data });
        });
    }
}
export function getCardDetails(formData) {
    return dispatch => {
        console.log(formData);
        appointmentInstance.post(url + "get-patient-card-on-file", formData ).then(response => {
            dispatch({ "type": "GET_CARD_DETAILS", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "GET_CARD_DETAILS", "payload": error.response.data });
        });
    }
}

export function checkePosEnabled(id) {
    return dispatch => {
        appointmentInstance.get(url + "check-if-can-take-payment/"+id).then(response => {
            dispatch({ "type": "CHECK_POS_ENABLED", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CHECK_POS_ENABLED", "payload": error.response.data });
        });
    }
}
export function sendNotification(formData) {
    return dispatch => {
        appointmentInstance.post(url + "send-appointment-notification/"+formData.appointment_id, formData).then(response => {
            if(formData.notifyFrom && formData.notifyFrom == 'create') {
                dispatch({ "type": "SEND_NOTIFICATION", "payload": response.data });
            } else {
                dispatch({ "type": "SEND_NOTIFICATION_CALENDAR", "payload": response.data });
            }
        }).catch(error => {
            if(formData.notifyFrom && formData.notifyFrom == 'create') {
                dispatch({ "type": "SEND_NOTIFICATION", "payload": error.response.data });
            } else {
                dispatch({ "type": "SEND_NOTIFICATION_CALENDAR", "payload": error.response.data });
            }
            
        });
    }
}
export function checkReschedule(formData) {
    return dispatch => {
        appointmentInstance.post(url + "check-if-reschedule-available/"+formData.appointment_id, formData).then(response => {
            dispatch({ "type": "SEND_NOTIFICATION", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SEND_NOTIFICATION", "payload": error.response.data });
        });
    }
}
export function getAppointmentFees(appointment_id) {
    return dispatch => {
        appointmentInstance.get(url + "get-appointment-fees/"+appointment_id).then(response => {
            dispatch({ "type": "APPOINTMENT_FEES", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "APPOINTMENT_FEES", "payload": error.response.data });
        });
    }
}

export function getCancelNotification(appointment_id) {
    return dispatch => {
        appointmentInstance.get(url + "get-notification-popup/"+appointment_id+"/cancel/true").then(response => {
            dispatch({ "type": "CANCEL_NOTIFICATION_MESSAGE", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CANCEL_NOTIFICATION_MESSAGE", "payload": error.response.data });
        });
    }
}
export function cancelAppointment(formData) {
    return dispatch => {
        appointmentInstance.post(url + "cancel-appointment/"+formData.appointment_id, formData).then(response => {
            dispatch({ "type": "APPOINTMENT_CANCELLED", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "APPOINTMENT_CANCELLED", "payload": error.response.data });
        });
    }
}
export function checkRescheduleTime(formData) {
    return dispatch => {
        appointmentInstance.post(url + "check-if-reschedule-available/"+formData.appointment_id, formData).then(response => {
            dispatch({ "type": "RESCHEDULE_TIME", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "RESCHEDULE_TIME", "payload": error.response.data });
        });
    }
}
export function rescheduleAppointment(formData) {
    return dispatch => {
        appointmentInstance.post(url + "reschedule-appointment/"+((formData.patient_to_be_charged) ? "true" : "false"), formData).then(response => {
            dispatch({ "type": "APPOINTMENT_RESCHEDULED", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "APPOINTMENT_RESCHEDULED", "payload": error.response.data });
        });
    }
}

export function fetchBookingHistory(page,pagesize,formData) {
    return dispatch => {
        appointmentInstance.post(url + "appointment-history?page="+page+'&pagesize='+pagesize, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "BOOKING_HISTORY_LIST", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "BOOKING_HISTORY_LIST", "payload": error.response.data });
        });
    }
}
export function printAppointment(formData) {
    return dispatch => {
        appointmentInstance.post(url + "appointment-print", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "PRINT_APPOINTMENT", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "PRINT_APPOINTMENT", "payload": error.response.data });
        });
    }
}
export function getClientData(clientId) {
    return dispatch => {
        appointmentInstance.get(url + "client/"+clientId).then(response => {
            dispatch({ "type": "CLIENT_DATA_APPOINTMENT", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "CLIENT_DATA_APPOINTMENT", "payload": error.response.data });
        });
    }
}

export function getScheduleOfProvider(formData, pid) {
    return dispatch => {
        appointmentInstance.post(url + "get-provider-schedule-for-delete-view/"+pid, (formData)).then(response => {
            dispatch({ "type": "SCHEDULE_OF_PROVIDER", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "SCHEDULE_OF_PROVIDER", "payload": error.response.data });
        });
    }
}

export function deleteMassSchedule(formData) {
    return dispatch => {
        appointmentInstance.post(url + "delete-selected-provider-scheduled", (formData)).then(response => {
            dispatch({ "type": "DELETE_MASS_SCHEDULES", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "DELETE_MASS_SCHEDULES", "payload": error.response.data });
        });
    }
}

export function fetchAppointmentReports(formData) {
    return dispatch => {
        appointmentInstance.get(url + "appointment-reports", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "FETCH_REPORTS", "payload": response.data });
        }).catch(error => {
            console.log(error);
            dispatch({ "type": "FETCH_REPORTS", "payload": error.response.data });
        });
    }
}
export function updateSortOrder(formData, type) {
    return dispatch => {
        appointmentInstance.put(url + "update/row/order/" + type, (formData)).then(response => {
            dispatch({ "type": "SORT_ORDER_UPDATE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "SORT_ORDER_UPDATE", "payload": error.response.data });
        });
    }
}