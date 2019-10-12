import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import Authorization from '../Utils/authorization.js';
import SettingLayout from '../Containers/Settings/SettingLayout.js'
import Settings from '../Components/Settings/settings.js'
import Users from '../Components/Settings/Teammates/Users/Users.js';
import UserRoles from '../Components/Settings/Teammates/UserRoles/UserRoles.js';
import Questionnaires from '../Components/Settings/Clinics/Questionnaires/Questionnaires.js'
import CreateQuestionnaries from '../Components/Settings/Clinics/Questionnaires/CreateQuestionnaries.js'
import SurveySettings from '../Components/Settings/Appointments/SurveySettings.js'
import PatientPortal from '../Components/Settings/Appointments/PatientPortal/PatientPortal.js'
import Surveys from '../Components/Surveys/surveys.js'
import Araccount from '../Components/Settings/Account/Araccount.js'
import TwoFactorAuthentication from '../Components/Settings/two-factor-authentication.js'
import Clinics from '../Components/Settings/ManageClinics/Clinics/clinics.js'
import CreateEditClinics from '../Components/Settings/ManageClinics/Clinics/CreateEditClinics.js'
import ViewQuestionnaries from '../Components/Settings/view-questionnaires.js'
import ProcedureTemplates from '../Components/Settings/procedure-templates.js'
import Dashboard from '../Components/Dashboard/Dashboard.js'
import createUser from '../Components/Settings/Teammates/Users/createUser.js'
import PostTreatmentInstructions from '../Components/Settings/Clinics/PostTreatmentInstructions.js'
import PreTreatmentInstructions from '../Components/Settings/Clinics/PreTreatmentInstructions.js'
import PostTreatmentEmail from '../Components/Settings/Clinics/PostTreatmentEmail.js'
import PreTreatmentEmail from '../Components/Settings/Clinics/PreTreatmentEmail.js'
import Profile from '../Components/Settings/Account/Profile.js'
import Consents from '../Components/Settings/Consents/Consents.js'
import CreateEditConsents from '../Components/Settings/Consents/CreateEditConsents.js'
import CancellationPolicy from '../Components/Settings/Appointments/CancellationPolicy/CancellationPolicy.js'
import createEditUser from '../Components/Settings/Teammates/Users/createEditUser.js'
import ProcedureList from '../Components/MDRoom/ProcedureList.js'

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={ props => (<Component {...props} />)} />
)

const router =
	<SettingLayout>
		<Switch>
			<PrivateRoute path="/settings/users" exact component={Users} />
			<PrivateRoute path="/settings/questionnaires" exact component={Questionnaires} />
			<PrivateRoute path="/settings/profile" component={Profile}/>
			<PrivateRoute exact path="/settings/createUser" component={createUser} />
			<PrivateRoute path="/settings/procedure-templates" component={ProcedureTemplates}/>
			<PrivateRoute path="/settings/view-questions" component={ViewQuestionnaries}/>
			<PrivateRoute path="/settings/consents" component={Consents}/>
			<PrivateRoute path="/settings/clinics" component={Clinics} />
			<PrivateRoute path="/settings/twoFactorAuthentication" component={TwoFactorAuthentication} />
			<PrivateRoute path="/settings/ar-account" component={Araccount} />
			<PrivateRoute path="/surveys" component={SurveySettings} />
			<PrivateRoute path="/dashboard" component={Dashboard} />
			<PrivateRoute path="/settings/users" exact component={Users} />
			<PrivateRoute path="/settings/user-roles" exact component={UserRoles} />
			<PrivateRoute path="/settings/post-treatment-instructions" exact component={PostTreatmentInstructions} />
			<PrivateRoute path="/settings/post-treatment-email" exact component={PostTreatmentEmail} />
			<PrivateRoute path="/settings/pre-treatment-instructions" exact component={PreTreatmentInstructions} />
			<PrivateRoute path="/settings/pre-treatment-email" exact component={PreTreatmentEmail} />
			<PrivateRoute path="/settings/appointments" component={AppointmentEmailsSMS} />
		    <PrivateRoute exact path="/settings/consent/:id/edit" component={CreateEditConsents} />
		    <PrivateRoute exact path="/settings/consent/create" component={CreateEditConsents} />
			<PrivateRoute path="/settings/users/create" component={createEditUser} />
			<PrivateRoute path="/mdroom/procedurelist" component={ProcedureList} />
		    <PrivateRoute path="/settings/users/:userId/edit" component={createEditUser} />
	</Switch>
	</SettingLayout>

export default router;
