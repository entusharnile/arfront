const userReducer = (state={data: '', status:''}, action) => {
	switch(action.type){
		case "RESET_ALL" :{
			return {
				action:"RESET_ALL"
			}
		}
		case "CALL_START" :{
			return {}
		}
		case "REGISTER_SUCCESSFULL" : {
			return {...state,data:action.payload,action:"REGISTER"}
		}
		case "RECEIVE_ERROR" : {
			return {...state,data:action.payload,action:"REGISTER"}
		}
		case "RECEIVE_USER_LIST" : {
			return {...state,data:action.payload,action:""}
		}
		case "RECEIVE_ERROR_USER_LIST" : {
			return {...state,data:action.payload,action:""}
		}
		case "LOGIN_SUCCESSFULL" : {
			return {...state,Logindata:action.payload,action:"LOGIN"}
		}
		case "LOGIN_ERROR" : {
			return {...state,Logindata:action.payload,action:"LOGIN"}
		}
		case "CONTACT_SUCCESSFULL" : {
			return {...state,Contactdata:action.payload,action:"CONTACT_FORM_SUBMIT"}
		}
		case "CONTACT_ERROR" : {
			return {...state,Contactdata:action.payload,action:"CONTACT_FORM_SUBMIT"}
		}
		case "FORGOT_PASSWORD_SUCCESSFULL" : {
			return {...state,data:action.payload,action:"FORGOT_PASSWORD"}
		}
		case "FORGOT_PASSWORD_ERROR" : {
			return {...state,data:action.payload,action:"FORGOT_PASSWORD"}
		}

		case "RESET_PASSWORD_SUCCESSFULL" : {
			return {...state,data:action.payload,action:"RESET_PASSWORD"}
		}
		case "RESET_PASSWORD_ERROR" : {
			return {...state,data:action.payload,action:"RESET_PASSWORD"}
		}

		case "PLANS_SUCCESSFULL" : {
			return {...state,planData:action.payload,action:"PLAN_DATA"}
		}
		case "PLANS_ERROR" : {
			return {...state,planData:action.payload,action:"PLAN_DATA"}
		}
		case "BLOGLIST_SUCCESSFULL" : {
			return {...state,blogData:action.payload,action:"BLOG_LIST"}
		}
		case "BLOGLIST_ERROR" : {
			return {...state,blogData:action.payload,action:"BLOG_LIST"}
		}
		case "BLOGSINGLE_SUCCESSFULL" : {
			return {...state,blogData:action.payload,action:"BLOG_SINGLE"}
		}
		case "BLOGSINGLE_ERROR" : {
			return {...state,blogData:action.payload,action:"BLOG_SINGLE"}
		}
		case "BLOG_LIST_FOOTER":{
			return {...state,blogData:action.payload,action:"BLOG_LIST_FOOTER"}
		}
		case "PAYMENT_SUCCESSFULL" : {
			return {...state,data:action.payload,action:"PLAN_PAYMENT"}
		}
		case "PAYMENT_ERROR" : {
			return {...state,data:action.payload,action:"PLAN_PAYMENT"}
		}
		case "GET_PROFILE" : {
			return {...state,data:action.payload,action:"GET_PROFILE"}
		}
		case "UPDATE_PROFILE" : {
			return {...state,data:action.payload,action:"UPDATE_PROFILE"}
		}
		case "GET_PAGE" : {
			return {...state,data:action.payload,action:"GET_PAGE"}
		}
		case "APP_SETTING" : {
			return {...state,data:action.payload,action:"APP_SETTING"}
		}
		case "APP_MENUS" : {
			return {...state,data:action.payload,action:"APP_MENUS"}
		}
		case "APP_FOOTER" : {
			return {...state,footerData:action.payload,action:"APP_FOOTER"}
		}
		case "DO_AUTO_LOGIN" : {
			return {...state,footerData:action.payload,action:"DO_AUTO_LOGIN"}
		}
		case "VERIFY_OTP" : {
			return {...state,data:action.payload,action:"VERIFY_OTP"}
		}
		default: {
		return state
		}

	}

}

export default userReducer;
