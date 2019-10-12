const nameInitialState = {
    action: ''
}
const MembershipWalletReducer = (state = nameInitialState, action) => {
    switch (action.type) {
        case "MEMBRTSHIP_WALLET_EMPTY_DATA": {
            return { ...state, data: {}, action: 'EMPTY_DATA' }
        }
        case "GET_MEMBERSHIP_WALLET_DATA":{
            return { ...state, data: action.payload, action: 'GET_MEMBERSHIP_WALLET_DATA' }
        }
        case "UPDATE_MEMBERSHIP_WALLET_DATA":{
            return { ...state, data: action.payload, action: 'UPDATE_MEMBERSHIP_WALLET_DATA' }
        }
        case "UPDATE_SETTING_WALLET_DATA":{
            return { ...state, data: action.payload, action: 'UPDATE_SETTING_WALLET_DATA' }
        }
        case "UPDATE_SETTING_MEMBERSHIP_DATA":{
            return { ...state, data: action.payload, action: 'UPDATE_SETTING_MEMBERSHIP_DATA' }
        }
        case "MEMBERSHIP_PRODUCT_SEARCH_LIST":{
            return { ...state, data: action.payload, action: 'MEMBERSHIP_PRODUCT_SEARCH_LIST' }
        }
        case "GET_MEMBERSHIP_MULTI_TIER":{
            return { ...state, data: action.payload, action: 'GET_MEMBERSHIP_MULTI_TIER' }
        }
        case "SAVE_MEMBERSHIP_MULTI_TIER":{
            return { ...state, data: action.payload, action: 'SAVE_MEMBERSHIP_MULTI_TIER' }
        }
        case "CHANGE_MEMBERSHIP_MULTI_TIER_STATUS":{
            return { ...state, data: action.payload, action: 'CHANGE_MEMBERSHIP_MULTI_TIER_STATUS' }
        }
        case "DELETE_MEMBERSHIP_MULTI_TIER":{
            return { ...state, data: action.payload, action: 'DELETE_MEMBERSHIP_MULTI_TIER' }
        }
        default:
            return state
    }
}
export default MembershipWalletReducer;
