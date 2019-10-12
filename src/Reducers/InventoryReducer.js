    const nameInitialState = {
        action: ''
        }
        const inventory = (state = nameInitialState, action) => {
        switch (action.type) {
          case "RESET_ALL" :{
      			return {
      				action:"RESET_ALL"
      			}
      		}
        case "POS_BUTTON_LIST":
        {
        return { ...state, data: action.payload, action: 'POS_BUTTON_LIST' }
        }
        case "FETCH_POS_BUTTON_ID":
        {
        return { ...state, data: action.payload, action: 'FETCH_POS_BUTTON_ID' }
        }
        case "CREATE_POS_TABLE_BUTTON":
        {
        return { ...state, data: action.payload, action: 'CREATE_POS_TABLE_BUTTON' }
        }
        case "CREATE_POS_BUTTON":
        {
        return { ...state, data: action.payload, action: 'CREATE_POS_BUTTON' }
        }
        case "FETCH_PRODUCT_PACKAGE":
        {
        return { ...state, data: action.payload, action: 'FETCH_PRODUCT_PACKAGE' }
        }
        case "DELETE_POS_BUTTON_TABLE":
        {
        return { ...state, data: action.payload, action: 'DELETE_POS_BUTTON_TABLE' }
        }
        case "CHECK_BUTTON_NAME":
        {
        return { ...state, data: action.payload, action: 'CHECK_BUTTON_NAME' }
        }
        case "UPDATE_POS_BUTTON":
        {
        return { ...state, data: action.payload, action: 'UPDATE_POS_BUTTON' }
        }
        case "DELETE_POS_BUTTON_ID":
        {
        return { ...state, data: action.payload, action: 'DELETE_POS_BUTTON_ID' }
        }
        case "DELETE_POS_BUTTON":
        {
        return { ...state, data: action.payload, action: 'DELETE_POS_BUTTON' }
        }
        case "POS_ACTIVATE_DEACTIVATE":
        {
        return { ...state, data: action.payload, action: 'POS_ACTIVATE_DEACTIVATE' }
        }
        case "PRODUCT_LIST":
        {
        return { ...state, data: action.payload, action: 'PRODUCT_LIST' }
        }
        case "DELETE_DISCOUNT_COUPONS_ID":
        {
        return { ...state, data: action.payload, action: 'DELETE_DISCOUNT_COUPONS_ID' }
        }
        case "DISCOUNT_COUPONS_LIST":
        {
        return { ...state, data: action.payload, action: 'DISCOUNT_COUPONS_LIST' }
        }
        case "UPDATE_DISCOUNT_COUPONS_ID":
        {
        return { ...state, data: action.payload, action: 'UPDATE_DISCOUNT_COUPONS_ID' }
        }
        case "CREATE_DISCOUNT_COUPONS_ID":
        {
        return { ...state, data: action.payload, action: 'CREATE_DISCOUNT_COUPONS_ID' }
        }
        case "FETCH_DISCOUNT_COUPONS_ID":
        {
        return { ...state, data: action.payload, action: 'FETCH_DISCOUNT_COUPONS_ID' }
        }
        case "INVENTORY_PRODUCT_LIST_ACTIVE":
        {
        return { ...state, data: action.payload, action: 'INVENTORY_PRODUCT_LIST_ACTIVE' }
        }
        case "INVENTORY_PRODUCT_LIST_INACTIVE":
        {
        return { ...state, data: action.payload, action: 'INVENTORY_PRODUCT_LIST_INACTIVE' }
        }
        case "INVENTORY_PRODUCT_LIST_CATEGORY":
        {
        return { ...state, data: action.payload, action: 'INVENTORY_PRODUCT_LIST_CATEGORY' }
        }
        case "CATEGORY_LIST":
        {
        return { ...state, data: action.payload, action: 'CATEGORY_LIST' }
        }

        case "PACKAGES_LIST":
        {
        return { ...state, data: action.payload, action: 'PACKAGES_LIST' }
        }

        case "DISCOUNT_GROUP_LIST":
        {
        return { ...state, data: action.payload, action: 'DISCOUNT_GROUP_LIST' }
        }

        case "EGIFT_CARD_LIST":
        {
        return { ...state, data: action.payload, action: 'EGIFT_CARD_LIST' }
        }

        case "UPDATE_EGIFTCARD":
        {
        return { ...state, data: action.payload, action: 'UPDATE_EGIFTCARD' }
        }

        case "CREATE_EGIFTCARD":
        {
        return { ...state, data: action.payload, action: 'CREATE_EGIFTCARD' }
        }

        case "DELETE_EGIFTCARD":
        {
        return { ...state, data: action.payload, action: 'DELETE_EGIFTCARD' }
        }

        case "FETCH_SELECTED_EGIFTCARD":
        {
        return { ...state, data: action.payload, action: 'FETCH_SELECTED_EGIFTCARD' }
        }
        case "CREATE_DISCOUNT_GROUP":
        {
          return { ...state, data: action.payload, action: 'CREATE_DISCOUNT_GROUP' }
        }
        case "FETCH_SELECTED_DISCOUNT_GROUP":
        {
          return { ...state, data: action.payload, action: 'FETCH_SELECTED_DISCOUNT_GROUP' }
        }
        case "UPDATE_DISCOUNT_GROUP":
        {
          return { ...state, data: action.payload, action: 'UPDATE_DISCOUNT_GROUP' }
        }
        case "DELETE_DISCOUNT_GROUP":
        {
          return { ...state, data: action.payload, action: 'DELETE_DISCOUNT_GROUP' }
        }
        case "ADD_DISCOUNT_GROUP_PRODUCT":
        {
          return { ...state, data: action.payload, action: 'ADD_DISCOUNT_GROUP_PRODUCT' }
        }
        case "DELETE_DISCOUNT_GROUP_PRODUCT":
        {
          return { ...state, data: action.payload, action: 'DELETE_DISCOUNT_GROUP_PRODUCT' }
        }

        case "CREATE_CATEGORY":
        {
        return { ...state, data: action.payload, action: 'CREATE_CATEGORY' }
        }

        case "FETCH_CLINICS":
        {
        return { ...state, data: action.payload, action: 'FETCH_CLINICS' }
        }

        case "FETCH_SELECTED_CATEGORY":
        {
        return { ...state, data: action.payload, action: 'FETCH_SELECTED_CATEGORY' }
        }

        case "UPDATE_CATEGORIES":
        {
        return { ...state, data: action.payload, action: 'UPDATE_CATEGORIES' }
        }

        case "DELETE_CATEGORIES":
        {
        return { ...state, data: action.payload, action: 'DELETE_CATEGORIES' }
        }
        case "DEACTIVATE_ALL_CATEGORIES":
        {
        return { ...state, data: action.payload, action: 'DEACTIVATE_ALL_CATEGORIES' }
        }
        case "PRODUCT_DEFAULT_DATA":
        {
        return { ...state, data: action.payload, action: 'PRODUCT_DEFAULT_DATA' }
        }
        case "IS_PRODUCT_AVAILABLE":
        {
        return { ...state, data: action.payload, action: 'IS_PRODUCT_AVAILABLE' }
        }
        case "PRODUCT_ADDED":
        {
        return { ...state, data: action.payload, action: 'PRODUCT_ADDED' }
        }
        case "PRODUCT_DELETED":
        {
        return { ...state, data: action.payload, action: 'PRODUCT_DELETED' }
        }
        case "RESET_ACTION":
        {
          return { ...state,  action: '' }
        }
        case "EXPORT_DATA":
        {
        return { ...state, data: action.payload, action: 'EXPORT_DATA' }
        }
        case "EXPORT_PRODUCT_DATA":
        {
        return { ...state, data: action.payload, action: 'EXPORT_PRODUCT_DATA' }
        }
        case "DEFAULT_PACKAGE_DATA":
        {
        return { ...state, data: action.payload, action: 'DEFAULT_PACKAGE_DATA' }
        }
        case "BOGO_PRODUCT_LIST":
        {
        return { ...state, data: action.payload, action: 'BOGO_PRODUCT_LIST' }
        }
        case "BOGO_FREE_PRODUCT_LIST":
        {
        return { ...state, data: action.payload, action: 'BOGO_FREE_PRODUCT_LIST' }
        }
        case "PACKAGE_PRODUCT_LIST":
        {
        return { ...state, data: action.payload, action: 'PACKAGE_PRODUCT_LIST' }
        }
        case "SAVE_PACKAGE_DATA":
        {
        return { ...state, data: action.payload, action: 'SAVE_PACKAGE_DATA' }
        }
        case "EMPTY_INVENTROY":
        {
        return { ...state, data: {}, action: 'EMPTY_INVENTROY' }
        }
        case "DELETE_DISCOUNT_PACKAGE":
        {
        return { ...state, data: action.payload, action: 'DELETE_DISCOUNT_PACKAGE' }
        }
        case "ACTIVATE_DISCOUNT_PACKAGE":
        {
        return { ...state, data: action.payload, action: 'ACTIVATE_DISCOUNT_PACKAGE' }
        }
        case "ACTIVATE_PRODUCT":
        {
        return { ...state, data: action.payload, action: 'ACTIVATE_PRODUCT' }
        }
        case "EMPTY_DATA":
        {
          return { ...state, data: action.payload, action: 'EMPTY_DATA' }
        }
        default:
            return state
    }
}
export default inventory;
