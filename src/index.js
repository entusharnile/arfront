import React from 'react';
import 'bootstrap';
import ReactDOM from 'react-dom';
import "./index.scss";
import thunk from 'redux-thunk';
import reducer from './Reducers/IndexReducer';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import {Redirect, BrowserHistory, Switch} from 'react-router';
import { Router, Route, Link, withRouter } from "react-router-dom";
import Login from './Components/Login/Login.js';
import TwoFactorLogin from './Components/Login/TwoFactorLogin.js';
import LoginPolicy from './Components/Login/LoginPolicy.js';
import RecurlyToStripe from './Components/Login/RecurlyToStripe.js';
import TrailToPaid from './Components/Login/TrailToPaid.js';
import Logout from './Components/Login/Logout.js';
import SignUpBasic from './Components/SignUp/SignUpBasic.js';
import SignUpPremium from './Components/SignUp/SignUpPremium.js';
import AccountSetup from './Components/SignUp/AccountSetup.js';
import 'react-toastify/dist/ReactToastify.css';
import Routes from './Routes/Routes.js';
import ForgotPassword from './Components/ForgotPassword/ForgotPassword.js';
import BlockIP from './Components/BlockIP/BlockIP.js';
import AutoLogin from './Components/Login/AutoLogin.js';
import { isLoggedIn, getUser } from './Utils/services';
import '../node_modules/react-intl-tel-input/dist/libphonenumber.js';
import '../node_modules/react-intl-tel-input/dist/main.css';
import { createBrowserHistory } from 'history';
import { push } from 'react-router-redux'

import * as serviceWorker from './serviceWorker';

const store = createStore(
	reducer,
	applyMiddleware(thunk)
);

function auth() {
	let user = JSON.parse(getUser());
	return isLoggedIn();
}
function userRole() {
	let user = JSON.parse(getUser());
	return user.user_role_id
}
const PublicRoute = ({ component: Component, ...rest }) => (
	<Route {...rest} render={props => (
		!auth() ? (
			<Component {...props} />
		) :
			<Redirect to={{
				pathname: '/settings/profile',
				state: { from: props.location }
			}} />

	)} />
)

const history = createBrowserHistory();
// Get the current location.
const location = history.location;
// create listener
history.listen((location, action) => {
	store.dispatch({ "type": "RESET_ALL"})
	let interval = (location.pathname == "/appointment/calendar") ? 500 : 100
	// let footer = document.getElementById('protected-footer-fixed');
	// if(footer != null && footer != undefined){
	// 	setTimeout(function(){
	// 		let rootHeight = document.getElementById('root').clientHeight;
	// 		let footerHeight = document.getElementById('protected-footer-fixed').clientHeight;
	//
	// 		if((rootHeight + footerHeight) > window.innerHeight){
	// 			footer.classList.remove('footer-fixed')
	// 		} else {
	// 			footer.classList.add('footer-fixed')
	// 		}
	// 	}, interval)
	// }

})

ReactDOM.render((
  <Provider store={store}>
    <Router history={history} >
        <Switch>
	        <PublicRoute path="/login" component={Login} />
			<Route exact path="/auto-login/:cipherKey?" component={AutoLogin} />
	        <PublicRoute path="/forgot-password" component={ForgotPassword} />
	        <PublicRoute path="/reset-password" component={Login} />
	        <PublicRoute path="/block-ip" component={BlockIP} />
	        <Route exact path="/logout" component={Logout} />
			<PublicRoute path="/sign-up/basic" component={SignUpBasic} />
			<PublicRoute path="/sign-up/premium" component={SignUpPremium} />
			<PublicRoute path="/account-setup/:type" component={AccountSetup} />
			<PublicRoute exact path="/accept-agreement" component={LoginPolicy} />
			<PublicRoute exact path="/upgrade-account-to-stripe" component={RecurlyToStripe} />
			<PublicRoute exact path="/upgrade-subscription-plan" component={TrailToPaid} />
			<PublicRoute exact path="/two-factor-login" component={TwoFactorLogin} />
	        {Routes}
          {/*<Route path="/sales" component={Authorization(['view-sales',"sales", currentUserRole])(Sales)} />*/}
    			<Redirect from="/*" to="/login" />
        </Switch>
      </Router>
  </Provider>),
     document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
