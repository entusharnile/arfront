import React, { Component } from 'react';
import './Routes/App.css';
import {Redirect, BrowserHistory, Switch} from 'react-router';
import { BrowserRouter as Router, Route, Link, withRouter } from "react-router-dom";
import Login from './Components/Login/Login.js';
import Authorization from './Utils/authorization.js';
import 'react-toastify/dist/ReactToastify.css';
import Sales from './Components/sales';
import ForgotPassword from './Components/ForgotPassword/ForgotPassword.js';
import Dashboard from './Components/Dashboard/Dashboard.js'
import Settings from './Components/Settings/settings.js'
import Surveys from './Components/Surveys/surveys.js'
import ArAccount from './Components/Settings/ArAccount.js'
import TwoFactorAuthentication from './Components/Settings/two-factor-authentication.js'
import Clinics from './Components/Settings/clinics.js'
import ViewQuestionnaries from './Components/Settings/view-questionnaires.js'
import Consents from './Components/Settings/consents.js'
import ProcedureTemplates from './Components/Settings/procedure-templates.js'
import EditClinics from './Components/Settings/edit-clinics.js'
import BlockIP from './Components/BlockIP/BlockIP.js';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      "isLoggedIn" : false,
      "roles": ["admin", "md", "provider", "frontDesk"],
      "permissions" : {
        "admin" : {"sales" : ["view-sales", "view-sales-report"], "pm" : [], "appointments" : [], "settings" : []},
        "md" : {"sales" : ["view-sales", "view-sales-report"], "pm" : [], "appointments" : [], "settings" : []},
        "provider" : {"sales" : ["view-sales", "view-sales-report"], "pm" : [], "appointments" : [], "settings" : []},
        "frontDesk" : {"sales" : [], "pm" : [], "appointments" : [], "settings" : []}
      },
      "user" : {"role":"admin"}
    }
    if(localStorage.getItem('isLoggedIn') == 1) {
    }
  }

  componentDidMount() {

  }

  render() {
    const currentUserRole = this.state.user.role;
    return(

      <Router>
        <Switch>
          <Route path="/edit-clinics" component={EditClinics}/>
          <Route path="/procedure-templates" component={ProcedureTemplates}/>
          <Route path="/view-questions" component={ViewQuestionnaries}/>
          <Route path="/consents" component={Consents}/>
          <Route path="/clinics" component={Clinics} />
          <Route path="/TwoFactorAuthentication" component={TwoFactorAuthentication} />
          <Route path="/ar-account" component={ArAccount} />
          <Route path="/surveys" component={Surveys} />
          <Route path="/settings" component={Settings} />
          <Route path="/dashboard" component={DashBoard} />
          <Route path="/login" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={Login} />
          <Route path="/block-ip" component={BlockIP} />
          {/*<Route path="/sales" component={Authorization(['view-sales',"sales", currentUserRole])(Sales)} />*/}

          <Redirect from="/*" to="/login" />
        </Switch>
      </Router>
    )

  }
}

export default App;
