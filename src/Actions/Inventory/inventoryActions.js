import axios from 'axios';
import config from '../../config';
import { getToken, handleInvalidToken,setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
let url = config.API_URL;

const inventoryInstance = axios.create();
inventoryInstance.defaults.headers.common['access-token'] = getToken();

let source = axios.CancelToken.source();

positionFooterCorrectly();
inventoryInstance.interceptors.response.use(function (response) {
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


export const fetchInventoryData = (status, formData) => {
    const reducerActionType = (status == 'active') ? 'INVENTORY_PRODUCT_LIST_ACTIVE' : (status == 'all') ? 'INVENTORY_PRODUCT_LIST_CATEGORY'  : 'INVENTORY_PRODUCT_LIST_INACTIVE';
    return dispatch => {
        inventoryInstance.get(url + "inventory/products/" +status + "?scopes=category" , (formData)).then(response => {
            dispatch({ "type": reducerActionType, "payload": response.data });
        }).catch(error => {
            dispatch({ "type": reducerActionType, "payload": error.response.data });
        });
    }
}

export const fetchCategoriesData = (formData) => {
    return dispatch => {
        inventoryInstance.get(url + "inventory/product_categories", (formData)).then(response => {
            dispatch({ "type": "CATEGORY_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CATEGORY_LIST", "payload": error.response.data });
        });
    }
}

export const fetchDiscountPackagesData = (formData) => {
    return dispatch => {
        inventoryInstance.get(url + "discount_packages", (formData)).then(response => {
            dispatch({ "type": "PACKAGES_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PACKAGES_LIST", "payload": error.response.data });
        });
    }
}

export const fetchDiscountGroupData = (formData) => {
    return dispatch => {
        inventoryInstance.get(url + "discount_groups", (formData)).then(response => {
            dispatch({ "type": "DISCOUNT_GROUP_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DISCOUNT_GROUP_LIST", "payload": error.response.data });
        });
    }
}

export const fetchEGiftCardData = (formData) => {
    return dispatch => {
        inventoryInstance.get(url + "egift_cards", (formData)).then(response => {
            dispatch({ "type": "EGIFT_CARD_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EGIFT_CARD_LIST", "payload": error.response.data });
        });
    }
}

export const updateEGiftCard = (formData, egiftId) => {
    return dispatch => {
        inventoryInstance.put(url + "egift_cards/"+egiftId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_EGIFTCARD", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_EGIFTCARD", "payload": error.response.data });
        });
    }
}

export const createEGiftCard = (formData) => {
    return dispatch => {
        inventoryInstance.post(url + "egift_cards", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_EGIFTCARD", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_EGIFTCARD", "payload": error.response.data });
        });
    }
}

export const deleteEGiftCard = (egiftId) => {
    return dispatch => {
        inventoryInstance.delete(url + "egift_cards/"+egiftId).then(response => {
            dispatch({ "type": "DELETE_EGIFTCARD", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_EGIFTCARD", "payload": error.response.data });
        });
    }
}

export const fetchEGiftCardDataID = (eGiftId) => {
    return dispatch => {
        inventoryInstance.get(url + "egift_cards/"+eGiftId ).then(response => {
            dispatch({ "type": "FETCH_SELECTED_EGIFTCARD", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_SELECTED_EGIFTCARD", "payload": error.response.data });
        });
    }
}

export const createDiscountGroup = (formData) => {
	return dispatch => {
		inventoryInstance.post(url + "discount_groups/0", ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "CREATE_DISCOUNT_GROUP", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "CREATE_DISCOUNT_GROUP", "payload": error.response.data });
		});
	}
}

export const fetchDiscountGroupDataId = (eGiftId) => {
    return dispatch => {
        inventoryInstance.get(url + "discount_groups/"+eGiftId ).then(response => {
            dispatch({ "type": "FETCH_SELECTED_DISCOUNT_GROUP", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_SELECTED_DISCOUNT_GROUP", "payload": error.response.data });
        });
    }
}

export const updateDiscountGroup = (formData, discountGroupId) => {
	return dispatch => {
		inventoryInstance.put(url + "discount_groups/"+discountGroupId, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "UPDATE_DISCOUNT_GROUP", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "UPDATE_DISCOUNT_GROUP", "payload": error.response.data });
		});
	}
}

export const deleteDiscountGroup = (discountGroupId) => {
    return dispatch => {
        inventoryInstance.delete(url + "discount_groups/"+discountGroupId).then(response => {
            dispatch({ "type": "DELETE_DISCOUNT_GROUP", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_DISCOUNT_GROUP", "payload": error.response.data });
        });
    }
}

export const addDiscountGroupProduct = (formData,discountGroupId) => {
	return dispatch => {
		inventoryInstance.post(url + "discount_groups/add-product/"+discountGroupId, ((formData) ? formData : '')).then(response => {
			dispatch({ "type": "ADD_DISCOUNT_GROUP_PRODUCT", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "ADD_DISCOUNT_GROUP_PRODUCT", "payload": error.response.data });
		});
	}
}

export const deleteDiscountGroupProduct = (formData,discountGroupId) => {
    return dispatch => {
        inventoryInstance.delete(url + "discount_groups/delete-product/"+discountGroupId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "DELETE_DISCOUNT_GROUP_PRODUCT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_DISCOUNT_GROUP_PRODUCT", "payload": error.response.data });
        });
    }
}


export const createCategory = (formData) => {
    return dispatch => {
        inventoryInstance.post(url + "product_categories", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_CATEGORY", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_CATEGORY", "payload": error.response.data });
        });
    }
}

export const fetchClinics = () => {
    return dispatch => {
        inventoryInstance.get(url + "list_clinics" ).then(response => {
            dispatch({ "type": "FETCH_CLINICS", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_CLINICS", "payload": error.response.data });
        });
    }
}

export const fetchCategoriesDataID = (categoriesId) => {
    return dispatch => {
        inventoryInstance.get(url + "product_categories/"+categoriesId ).then(response => {
            dispatch({ "type": "FETCH_SELECTED_CATEGORY", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_SELECTED_CATEGORY", "payload": error.response.data });
        });
    }
}

export const updateCategories = (formData, categoriesId) => {
    return dispatch => {
        inventoryInstance.put(url + "product_categories/"+categoriesId, ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_CATEGORIES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_CATEGORIES", "payload": error.response.data });
        });
    }
}

export const deleteCategories = (categoriesId) => {
    return dispatch => {
        inventoryInstance.delete(url + "product_categories/"+categoriesId).then(response => {
            dispatch({ "type": "DELETE_CATEGORIES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_CATEGORIES", "payload": error.response.data });
        });
    }
}

export const deactivateAllCat = () => {
    return dispatch => {
        inventoryInstance.post(url + "product_categories/deactivate-all", {}).then(response => {
            dispatch({ "type": "DEACTIVATE_ALL_CATEGORIES", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DEACTIVATE_ALL_CATEGORIES", "payload": error.response.data });
        });
    }
}

export const getProductDefaultData = (productId) => {
    return dispatch => {
        inventoryInstance.get(url + "products/"+productId).then(response => {
            dispatch({ "type": "PRODUCT_DEFAULT_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRODUCT_DEFAULT_DATA", "payload": error.response.data });
        });
    }
}

export const isProductNameAvailable = (formData) => {
    return dispatch => {
        inventoryInstance.post(url + "product/is-product-available", formData).then(response => {
            dispatch({ "type": "IS_PRODUCT_AVAILABLE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "IS_PRODUCT_AVAILABLE", "payload": error.response.data });
        });
    }
}

export const addProduct = (formData) => {
    return dispatch => {
        inventoryInstance.post(url + "products/"+formData.productId, formData).then(response => {
            dispatch({ "type": "PRODUCT_ADDED", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRODUCT_ADDED", "payload": error.response.data });
        });
    }
}

export const deleteProduct = (id) => {
    return dispatch => {
        inventoryInstance.delete(url + "products/"+id).then(response => {
            dispatch({ "type": "PRODUCT_DELETED", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "PRODUCT_DELETED", "payload": error.response.data });
        });
    }
}

export const resetAction = () => {
  return dispatch => {
    dispatch({ "type": "RESET_ACTION"});
  }
}

export const exportData = (formData, mode) => {
    return dispatch => {
        inventoryInstance.get(url + "product_categories/export/"+mode, formData).then(response => {
            dispatch({ "type": "EXPORT_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EXPORT_DATA", "payload": error.response.data });
        });
    }
}

export const exportProducts = (formData, mode) => {
    return dispatch => {
        inventoryInstance.get(url + "inventory/export-products/"+mode+'?scopes=category,productPricePerClinic', formData).then(response => {
            dispatch({ "type": "EXPORT_PRODUCT_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "EXPORT_PRODUCT_DATA", "payload": error.response.data });
        });
    }
}

export const getDefaultPackageData = (packageId) => {
    return dispatch => {
        inventoryInstance.get(url + "discount_packages/"+packageId).then(response => {
            dispatch({ "type": "DEFAULT_PACKAGE_DATA", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DEFAULT_PACKAGE_DATA", "payload": error.response.data });
        });
    }
}

export const saveDiscountPackage = (formData) => {
    return dispatch => {
        if(!formData.packageId) {
            inventoryInstance.post(url + "discount_packages/"+formData.packageId, formData).then(response => {
                dispatch({ "type": "SAVE_PACKAGE_DATA", "payload": response.data });
            }).catch(error => {
                dispatch({ "type": "SAVE_PACKAGE_DATA", "payload": error.response.data });
            });
        } else {
            inventoryInstance.put(url + "discount_packages/"+formData.packageId, formData).then(response => {
                dispatch({ "type": "SAVE_PACKAGE_DATA", "payload": response.data });
            }).catch(error => {
                dispatch({ "type": "SAVE_PACKAGE_DATA", "payload": error.response.data });
            });
        }
    }
}

const serialize = function(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

export const searchProductByName = (formData, mode) => {
  return dispatch => {
      if (typeof source != typeof undefined) {
        source.cancel('Operation canceled due to new request.')
      }
      source = axios.CancelToken.source();
      axios.get(url + "discount-packages/search-product?"+serialize(formData.params), { cancelToken: source.token }).then(response => {
        let action = '';
        if(mode == 'bogo_product') {
            action = "BOGO_PRODUCT_LIST";
        } else if(mode == "bogo_free_product") {
            action = "BOGO_FREE_PRODUCT_LIST";
        } else if(mode == "package") {
            action = "PACKAGE_PRODUCT_LIST";
        }
        dispatch({ "type": action, "payload": response.data });
      }).catch(error => {
          if (axios.isCancel(error)) {
          } else {
              let action = '';
              if(mode == 'bogo_product') {
                  action = "BOGO_PRODUCT_LIST";
              } else if(mode == "bogo_free_product") {
                  action = "BOGO_FREE_PRODUCT_LIST";
              } else if(mode == "package") {
                  action = "PACKAGE_PRODUCT_LIST";
              }
              dispatch({ "type": action, "payload": error.response.data });
          }
      });
  }
}

export const emptyInventoryReducer = (status, formData) => {
    return dispatch => {
        dispatch({ "type": 'EMPTY_INVENTROY'});
    }
}

export const deleteDiscountPackage = (diiscountPackageId) => {
    return dispatch => {
        inventoryInstance.delete(url + "discount_packages/"+diiscountPackageId).then(response => {
            dispatch({ "type": "DELETE_DISCOUNT_PACKAGE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_DISCOUNT_PACKAGE", "payload": error.response.data });
        });
    }
}

export const activateDiscountPackage = (diiscountPackageId) => {
    return dispatch => {
        inventoryInstance.get(url + "discount-packages/activate/"+diiscountPackageId).then(response => {
            dispatch({ "type": "ACTIVATE_DISCOUNT_PACKAGE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "ACTIVATE_DISCOUNT_PACKAGE", "payload": error.response.data });
        });
    }
}

export const activateProduct = (activateId) => {
    return dispatch => {
        inventoryInstance.post(url + "product/activate/"+activateId ).then(response => {
            dispatch({ "type": "ACTIVATE_PRODUCT", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "ACTIVATE_PRODUCT", "payload": error.response.data });
        });
    }
}

export const fetchPOSButtonData = (formData) => {
    return dispatch => {
        inventoryInstance.get(url + "pos-quick-button", (formData)).then(response => {
            dispatch({ "type": "POS_BUTTON_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "POS_BUTTON_LIST", "payload": error.response.data });
        });
    }
}

export const getProductPackage = (formData) => {
  /*var typeVAl = formData.params.type;
  var termVal = formData.params.term;
    let searchString = 'type='+typeVAl+ '&' + 'term=' +termVal ;*/
    if (typeof source != typeof undefined) {
      source.cancel('No Match Found. Please enter relevant keywords.') ;
    }
    source = axios.CancelToken.source();
    return dispatch => {
        axios.get(url + "pos-quick-buttons/search?"+serialize(formData.params), { cancelToken: source.token } ).then(response => {
            dispatch({ "type": "FETCH_PRODUCT_PACKAGE", "payload": response.data });
        }).catch(error => {
        if (axios.isCancel(error)) {
            //console.log('Request canceled', error);
        } else {
            //console.log(error);
            dispatch({ "type": "FETCH_PRODUCT_PACKAGE", "payload": error.response.data });
        }
    });
  }
}

export const fetchPOSButtonDataId = (posButtonId) => {
    return dispatch => {
        inventoryInstance.get(url + "pos-quick-button/"+posButtonId ).then(response => {
            dispatch({ "type": "FETCH_POS_BUTTON_ID", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_POS_BUTTON_ID", "payload": error.response.data });
        });
    }
}


export const checkButtonName = (formData) => {
    return dispatch => {
        inventoryInstance.post(url + "pos-quick-buttons/is-pos-quick-button-available", (formData) ).then(response => {
            dispatch({ "type": "CHECK_BUTTON_NAME", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CHECK_BUTTON_NAME", "payload": error.response.data });
        });
    }
}

export const deletePOSButton = (posButtonId) => {
    return dispatch => {
        inventoryInstance.delete(url + "pos-quick-button/"+posButtonId ).then(response => {
            dispatch({ "type": "DELETE_POS_BUTTON", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_POS_BUTTON", "payload": error.response.data });
        });
    }
}

export const deleteTablePOSButton = (posButtonId, formData) => {
    return dispatch => {
        inventoryInstance.post(url + "pos-quick-button/delete-product/"+posButtonId, (formData) ).then(response => {
            dispatch({ "type": "DELETE_POS_BUTTON_TABLE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_POS_BUTTON_TABLE", "payload": error.response.data });
        });
      }
}

export const fetchDiscountCoupons = (formData) => {
    return dispatch => {
        inventoryInstance.get(url + "get-discounted-coupons", (formData)).then(response => {
            dispatch({ "type": "DISCOUNT_COUPONS_LIST", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DISCOUNT_COUPONS_LIST", "payload": error.response.data });
        });
    }
}

export const fetchDiscountCouponsId = (formData) => {
    return dispatch => {
        inventoryInstance.get(url + "view-discounted-coupon", (formData)).then(response => {
            dispatch({ "type": "FETCH_DISCOUNT_COUPONS_ID", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "FETCH_DISCOUNT_COUPONS_ID", "payload": error.response.data });
        });
    }
}


export const fetchPOSButtonActiveDeactive = (formData) => {
    return dispatch => {
        inventoryInstance.post(url + "pos-quick-buttons/activate-deactivate-button", (formData)).then(response => {
            dispatch({ "type": "POS_ACTIVATE_DEACTIVATE", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "POS_ACTIVATE_DEACTIVATE", "payload": error.response.data });
        });
    }
}

export const createTablePOSButton = (formData, tabId) => {
    return dispatch => {
        inventoryInstance.post(url + "pos-quick-button/add-product/"+ tabId, (formData)).then(response => {
            dispatch({ "type": "CREATE_POS_TABLE_BUTTON", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_POS_TABLE_BUTTON", "payload": error.response.data });
          });
      }
  }


export const updateDiscountCouponsId = (formData) => {
    return dispatch => {
        inventoryInstance.put(url + "edit-discounted-coupon", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "UPDATE_DISCOUNT_COUPONS_ID", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_DISCOUNT_COUPONS_ID", "payload": error.response.data });
        });
    }
}


export const createFetchPOSButton = (formData) => {
    return dispatch => {
        inventoryInstance.post(url + "pos-quick-button/0", formData).then(response => {
            dispatch({ "type": "CREATE_POS_BUTTON", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_POS_BUTTON", "payload": error.response.data });
          });
      }
  }


export const createDiscountCouponsId = (formData) => {
    return dispatch => {
        inventoryInstance.post(url + "create-discounted-coupon", ((formData) ? formData : '')).then(response => {
            dispatch({ "type": "CREATE_DISCOUNT_COUPONS_ID", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "CREATE_DISCOUNT_COUPONS_ID", "payload": error.response.data });
        });
    }
}

export const updateFetchPOSButton = (formData, posButId) => {
    return dispatch => {
        inventoryInstance.put(url + "pos-quick-button/" +posButId , (formData)).then(response => {
            dispatch({ "type": "UPDATE_POS_BUTTON", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "UPDATE_POS_BUTTON", "payload": error.response.data });
          });
      }
  }

export const deleteDiscountCouponsId = (formData) => {
    return dispatch => {
        inventoryInstance.delete(url + "delete-discounted-coupon", (formData)).then(response => {
            dispatch({ "type": "DELETE_DISCOUNT_COUPONS_ID", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_DISCOUNT_COUPONS_ID", "payload": error.response.data });

        });
    }
}

export const deletePOSButtonID = (posButtonId) => {
    return dispatch => {
        inventoryInstance.delete(url + "pos-quick-button/"+posButtonId ).then(response => {
            dispatch({ "type": "DELETE_POS_BUTTON_ID", "payload": response.data });
        }).catch(error => {
            dispatch({ "type": "DELETE_POS_BUTTON_ID", "payload": error.response.data });
        });
    }
}

export function exportEmptyData(formData) {
    return dispatch => {
        dispatch({ "type": "EMPTY_DATA", "payload": {data: '', status:200, message : ''} });
    }
}
