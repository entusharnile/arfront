import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import UserReducer from './UserReducer.js';
import SettingReducer from './SettingReducer.js';
import ClinicReducer from './ClinicReducer.js';
import AppointmentReducer from './AppointmentReducer.js';
import consentsReducer from './consentsReducer.js';
import DashboardReducer from './DashboardReducer.js';
import ProcedureNotesReducer from './ProcedureNotesReducer.js';
import surveyReducer from './surveyReducer.js';

import InventoryReducer from './InventoryReducer.js';

import ReportsReducer from './ReportsReducer.js';
import ClientsReducer from './ClientsReducer.js';
import ServiceReducer from './ServiceReducer.js';
import TraceReducer from './TraceReducer.js';
import SalesReducer from './SalesReducer.js';
import ClientNotesReducer from './ClientNotesReducer.js';
import InvoiceReducer from './InvoiceReducer.js';
import TreatmentMarkingReducer from './TreatmentMarkingReducer.js';
import ProcedureReducer from './ProcedureReducer.js';
//import ServiceReducer from './ServiceReducer.js';
import SignUpReducer from './SignUpReducer.js';
import AccountReducer from './AccountReducer.js';
import DotPhraseReducer from './DotPhraseReducer.js';
import CommonReducer from './commonReducer.js';
import MembershipWalletReducer from './MembershipWalletReducer.js';

export default combineReducers({
    ClinicReducer,
    UserReducer,
    SettingReducer,
    AppointmentReducer,
    consentsReducer,
    DashboardReducer,
    ProcedureNotesReducer,
    surveyReducer,
    InventoryReducer,
    ReportsReducer,
    ClientsReducer,
    ServiceReducer,
    TraceReducer,
    SalesReducer,
    ClientNotesReducer,
    InvoiceReducer,
    TreatmentMarkingReducer,
    ProcedureReducer,
    //ServiceReducer,
    SignUpReducer,
    AccountReducer,
    DotPhraseReducer,
    CommonReducer,
    MembershipWalletReducer,
    routing: routerReducer
});
