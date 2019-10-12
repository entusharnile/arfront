import React from 'react';
import { logout } from '../../Utils/services.js';
import { Redirect } from 'react-router-dom';
import { getToken, handleInvalidToken, setConfigData, positionFooterCorrectly } from '../../Utils/services.js';
import axios from 'axios';
import config from '../../config';
let url = config.API_URL;
class Logout extends React.Component {
	constructor(props) {
		super(props)
		logout()
	}
	render(){
		return null;
	}
}

export default Logout;
