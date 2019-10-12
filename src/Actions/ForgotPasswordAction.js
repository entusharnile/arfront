import axios from 'axios';

import config from '../config';
let url = config.API_URL;

//=======ResetPassword action==========
export function UserResetPasswordForm(userData) {
	return dispatch => {
		axios.post(url + "password/email", userData).then(response => {
			dispatch({ "type": "FORGOT_PASSWORD_SUCCESSFULL", "payload": response.data });
		}).catch(error => {
			dispatch({ "type": "FORGOT_PASSWORD_ERROR", "payload": error.response.data });
		});
	}
}
