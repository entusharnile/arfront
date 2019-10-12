const SignUpReducer = (state={data: '', status:''}, action) => {
	switch(action.type){
		case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
		case "SIGN_UP" :{
			return {}
		}
		case "SIGN_UP_BASIC" : {
			return {
				...state,
				data:action.payload,
				action:"SIGN_UP_BASIC",
			}
		}
		case "GET_SIGNUP_ACCOUNT_STATUS" : {
			return {
				...state,
				data:action.payload,
				action:"GET_SIGNUP_ACCOUNT_STATUS",
			}
		}
		case "SIGN_UP_PREMIUM" : {
			return {
				...state,
				data:action.payload,
				action:"SIGN_UP_PREMIUM",
			}
		}
		case "UNIQUE_EMAIL" : {
			return {
				...state,
				data:action.payload,
				action:"UNIQUE_EMAIL"
			}
		}
		case "SIGN_UP_PLANS" : {
			return {
				...state,
				data:action.payload,
				action:"SIGN_UP_PLANS"
			}
		}
		default: {
		return state
		}

	}

}

export default SignUpReducer;
