import axios from 'axios';
const AccountReducer = (state={data: '', status:''}, action) => {
	switch(action.type){
		case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
		case "ACCOUNT_RESET" :{
			return {}
		}
		case "ACCEPT_TOS_AGREEMENT" : {
			return {
				...state,
				data:action.payload,
				action:"ACCEPT_TOS_AGREEMENT",
			}
		}
		case "UPGRADE_TRAIL_TO_PAID" : {
			return {
				...state,
				data:action.payload,
				action:"UPGRADE_TRAIL_TO_PAID",
			}
		}
		case "UPGRADE_RECURLY_TO_STRIPE" : {
			return {
				...state,
				data:action.payload,
				action:"UPGRADE_RECURLY_TO_STRIPE",
			}
		}
		case "UPGRADE_RECURLY_TO_STRIPE" : {
			return {
				...state,
				data:action.payload,
				action:"UPGRADE_RECURLY_TO_STRIPE",
				redirect_to : ''
			}
		}
		case "GET_ACCOUNT_PRIVILEGES" : {
			return {
				...state,
				data:action.payload,
				action:"GET_ACCOUNT_PRIVILEGES"
			}
		}
		default: {
		return state
		}

	}
}

export default AccountReducer;
