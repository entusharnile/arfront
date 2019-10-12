import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';

//Dashboard
import Dashboard from '../Components/Dashboard/Dashboard.js';
import SMSNotifications from '../Components/Dashboard/SMSNotifications.js';
import SMSNotificationsPopup from '../Components/Dashboard/SMSNotificationsPopup.js';
import Notifications from '../Components/Dashboard/Notifications.js';

//Clients
import Clients from '../Components/Clients/Clients.js';
import ClientProfile from '../Components/Clients/ClientProfile.js';
import CreateEditClients from '../Components/Clients/CreateEditClients.js';
import ClientWallet from '../Components/Clients/ClientWallet.js'
import CreateEditClientDocuments from '../Components/Clients/Documents/CreateEditClientDocuments.js'
import ClientDocuments from '../Components/Clients/Documents/ClientDocuments.js'

import ExportProcedures from '../Components/ExportProcedures/ExportProcedures.js'

import ViewFilledSurvey from '../Components/ViewFilledSurvey/ViewFilledSurvey.js'

import BulkImport from '../Components/Clients/BulkImport.js';

import AfterPhotos from '../Components/Clients/AfterPhotos.js';

//Appointments
import ServiceCategory from '../Components/Appointment/Services/ServiceCategory.js'
import CreateEditServiceCategory from '../Components/Appointment/Services/CreateEditServiceCategory.js'
import Services from '../Components/Appointment/Services/Services.js'
import CreateEditServices from '../Components/Appointment/Services/CreateEditServices.js'
import Calendar from '../Components/Appointment/Calendar/Calendar.js'
import EquipmentSchedule from '../Components/Appointment/EquipmentSchedule/EquipmentSchedule.js'
import CreateEditEquipmentSchedule from '../Components/Appointment/EquipmentSchedule/CreateEditEquipmentSchedule.js'
import ResourceSchedule from '../Components/Appointment/ResourceSchedule/ResourceSchedule.js'
import CreateEditResourceSchedule from '../Components/Appointment/ResourceSchedule/CreateEditResourceSchedule.js'
import ServicesPackages from '../Components/Appointment/ServicesPackages/ServicesPackages.js'
import CreateEditServicesPackages from '../Components/Appointment/ServicesPackages/CreateEditServicesPackages.js'
import ProviderSchedule from '../Components/Appointment/ProviderSchedule/ProviderSchedule.js'
import ProviderScheduleView from '../Components/Appointment/ProviderSchedule/ProviderScheduleView.js'
import ProviderScheduleDelete from '../Components/Appointment/ProviderSchedule/ProviderScheduleDelete.js'
import CreateAppointment from '../Components/Appointment/Calendar/CreateAppointment.js'
import BookingHistory from '../Components/Appointment/BookingHistory/BookingHistory.js'
import AppointmentReports from '../Components/Appointment/Reports/Reports.js';
import AppointmentConfig from '../Components/Appointment/AppointmentConfig.js';
import OtherResources from '../Components/Appointment/OtherResources.js';
import AppointmentCommunication from '../Components/Appointment/AppointmentCommunication.js';
import BookingPortal from '../Components/Appointment/BookingPortal.js';
import ServicesMain from '../Components/Appointment/ServicesMain.js';
import OtherSettings from '../Components/Appointment/OtherSettings.js';

//Sales
import SalesSummary from '../Components/Sales/SalesSummary/SalesSummary.js';
import InvoiceDisclaimerText from '../Components/Sales/InvoiceDisclaimerText/InvoiceDisclaimerText.js';
import MonthlyNetSales from '../Components/Sales/MonthlyNetSales/MonthlyNetSales.js';
import ItemSales from '../Components/Sales/ItemSales/ItemSales.js';
import CategorySales from '../Components/Sales/CategorySales/CategorySales.js';
import EmployeeSales from '../Components/Sales/EmployeeSales/EmployeeSales.js';
import PaymentMethods from '../Components/Sales/PaymentMethods/PaymentMethods.js';
import Discounts from '../Components/Sales/Discounts/Discounts.js';
import SalesInvoices from '../Components/Sales/Invoices/Invoices.js';
import SalesInvoicesPopups from '../Components/Sales/Invoices/SalesInvoicesPopups.js';
import AddOfficeSalesGoals from '../Components/Sales/OfficeSalesGoals/AddOfficeSalesGoals.js';
import CashDrawer from '../Components/Sales/CashDrawer/CashDrawer.js';
import ManageOfficeSalesGoals from '../Components/Sales/OfficeSalesGoals/MangageOfficeSalesGoals.js';
import OfficeSalesGoals from '../Components/Sales/OfficeSalesGoals/OfficeSalesGoals.js';
import StafTratment from '../Components/Sales/StafTreatment/StafTratment.js';
import Membership from '../Components/Sales/Membership/Membership.js';
import ShortTermLiability from '../Components/Sales/ShortTermLiability/ShortTermLiability.js';
import TreatmentPlans from '../Components/Sales/TreatmentPlans/TreatmentPlans.js';
import Taxes from '../Components/Sales/Taxes/Taxes.js';
import CommissionReports from '../Components/Sales/CommissionReports/CommissionReports.js';
import CostToCompany from '../Components/Sales/CostToCompany/CostToCompany.js';
import eGiftCards from '../Components/Sales/eGiftCards/eGiftCards.js';
import MembershipChurnReport from '../Components/Sales/MembershipChurnReport/MembershipChurnReport.js';
import TipsPerProvider from '../Components/Sales/TipsPerProvider/TipsPerProvider.js';

//Inventory
import InventoryProductsActive from '../Components/Inventory/InventoryProductActive.js';
import InventoryProductsInactive from '../Components/Inventory/InventoryProductInactive.js';
import EditInventory from '../Components/Inventory/EditInventory.js';
import ProductCategories from '../Components/Inventory/ProductCategories.js';
import DiscountPackages from '../Components/Inventory/DiscountPackages.js';
import DiscountGroups from '../Components/Inventory/DiscountGroups.js';
import EGiftCards from '../Components/Inventory/EGiftCard.js';
import CreateEditEGiftCards from '../Components/Inventory/CreateEditEGiftCard.js';
import TreatmentPlanTemplate from '../Components/Inventory/TreatmentPlanTemplate.js';
import AddDiscountPackage from '../Components/Inventory/AddDiscountPackage.js';
import CreateEditDiscountGroups from '../Components/Inventory/CreateEditDiscountGroups.js';
import CreateTreatmentPlanTemplate from '../Components/Inventory/CreateTreatmentPlanTemplate.js';
import CreateEditCategories from '../Components/Inventory/CreateEditCategories.js';
import CreateEditDiscountPackage from '../Components/Inventory/CreateEditDiscountPackage.js';
import CreateEditDiscountCoupons from '../Components/Inventory/CreateEditDiscountCoupons.js';

import posQuickButton from '../Components/Inventory/PosQuickButton.js' ;
import AddEditposQuickButton from '../Components/Inventory/AddEditposQuickButton.js';

import InventoryProductsCategory from '../Components/Inventory/InventoryProductCategory.js';
import DiscountCoupons from '../Components/Inventory/DiscountCoupons.js';

//Reports
import Reports from '../Components/Reports/Reports.js'
import CreateReports from '../Components/Reports/CreateReports.js'
import ReportEdit from '../Components/Reports/ReportEdit.js'

//Surveys
import AllSurveys from '../Components/Survey/AllSurveys.js'
import SurveyList from '../Components/Survey/SurveyList.js'
import CreateEditSurveyTemplate from '../Components/Survey/CreateEditSurveyTemplate.js'
import ViewAllSurveys from '../Components/Survey/ViewAllSurveys.js'
import SurveyData from '../Components/Survey/SurveyData.js'

//UserActivity
import UserActivity from '../Components/UserActivity/UserActivity.js'
import ViewComparison from '../Components/UserActivity/ViewComparison.js'

//Settings/Account-Information
import Araccount from '../Components/Settings/Account/Araccount.js'
import ArTermsOfUse from '../Components/Settings/Account/ArTermsOfUse.js'
import HipaaTermsOfUse from '../Components/Settings/Account/HipaaTermsOfUse.js'
import TwoFactorAuthentication from '../Components/Settings/Account/Two-factor-authentication.js'
import Profile from '../Components/Settings/Account/Profile.js'
import GoogleCalendarReturnUrl from '../Components/Settings/Account/GoogleCalendarReturnUrl.js'

//Settings/Manage-Your-Clinics
import Questionnaires from '../Components/Settings/ManageClinics/Questionnaires/Questionnaires.js'
import CreateEditQuestionnaire from '../Components/Settings/ManageClinics/Questionnaires/CreateQuestionnaries.js'
import Clinics from '../Components/Settings/ManageClinics/Clinics/Clinics.js'
import CreateEditClinics from '../Components/Settings/ManageClinics/Clinics/CreateEditClinics.js'
import ProcedureTemplates from '../Components/Settings/ManageClinics/ProcedureTemplates/Procedure-templates.js'
import PostTreatmentEmail from '../Components/Settings/ManageClinics/PostTreatmentEmail/PostTreatmentEmail.js'
import PostTreatmentInstructions from '../Components/Settings/ManageClinics/PostTreatmentInstructions/PostTreatmentInstructions.js'
import PreTreatmentInstructions from '../Components/Settings/ManageClinics/PreTreatmentInstructions/PreTreatmentInstructions.js'
import PreTreatmentEmail from '../Components/Settings/ManageClinics/PreTreatmentEmail/PreTreatmentEmail.js'
import Consents from '../Components/Settings/ManageClinics/Consents/Consents.js'
import CreateEditConsents from '../Components/Settings/ManageClinics/Consents/CreateEditConsents.js'
import CreateEditPostInstructions from '../Components/Settings/ManageClinics/PostTreatmentInstructions/CreateEditPostInstructions.js'
import CreateEditPreInstructions from '../Components/Settings/ManageClinics/PreTreatmentInstructions/CreateEditPreInstructions.js'
import CreateEditTemplate from '../Components/Settings/ManageClinics/ProcedureTemplates/CreateEditTemplate.js'

//Settings/Appointments
import AppointmentEmailsSMS from '../Components/Settings/Appointments/AppointmentsEmailAndSMS/AppointmentEmailsSMS.js'
import AppointmentReminder from '../Components/Settings/Appointments/PatientAppointmentReminders/AppointmentReminder.js'
import CreateEditReminder from '../Components/Settings/Appointments/PatientAppointmentReminders/CreateEditReminder.js'
import ConfigureURL from '../Components/Settings/Appointments/ConfigureURL/ConfigureURL.js'
import CancellationPolicy from '../Components/Settings/Appointments/CancellationPolicy/CancellationPolicy.js'
import PatientPortal from '../Components/Settings/Appointments/PatientPortal/PatientPortal.js'
import SurveySettings from '../Components/Settings/Appointments/SurveySettings/SurveySettings.js';

//Settings/Membership & Wallet
import MembershipWallet from '../Components/Settings/MembershipWallet/MembershipWallet.js'

//settings/Teammates
import Users from '../Components/Settings/Teammates/Users/Users.js';
import UserRoles from '../Components/Settings/Teammates/UserRoles/UserRoles.js';
import UserPrivilege from '../Components/Settings/Teammates/UserRoles/UserPrivilege.js';
import CreateUser from '../Components/Settings/Teammates/Users/CreateUser.js'
import CreateEditUser from '../Components/Settings/Teammates/Users/CreateEditUser.js'

//Settings/RecentlyDeleted
import RecentlyDeleted from '../Components/Settings/RecentlyDeleted/RecentlyDeleted.js'

//Settings/YourBilling
import Invoices from '../Components/Settings/YourBilling/Invoices/Invoices.js'
import Subscription from '../Components/Settings/YourBilling/Subscription/Subscription.js'

//Settings/POS
import PosDashboard from '../Components/Settings/Pos/PosDashboard/PosDashboard.js'
import PosDashboardVerification from '../Components/Settings/Pos/PosDashboard/PosDashboardVerification.js'
import PosPayments from '../Components/Settings/Pos/Payments/PosPayments.js'
import PosPayouts from '../Components/Settings/Pos/Payouts/PosPayouts.js'
import PosPayoutsView from '../Components/Settings/Pos/Payouts/PosPayoutsView.js'
import Pos from '../Components/Settings/Pos/Pos.js'
import PosSetup from '../Components/Settings/Pos/PosSetup.js'
import PosCardReader from '../Components/Settings/Pos/PosCardReader.js'
import PosPaymentSettings from '../Components/Settings/Pos/PaymentSettings/PosPaymentSettings.js'
import PosDisputes from '../Components/Settings/Pos/PosDisputes/PosDisputes.js'
import PosDisputesView from '../Components/Settings/Pos/PosDisputes/PosDisputesView.js'
import PosDisputesEvidenceType from '../Components/Settings/Pos/PosDisputes/PosDisputesEvidenceType.js'
import PosStripeReturnUrl from '../Components/Settings/Pos/PosStripeReturnUrl.js'

//Component/Rooms
import MDRoom from '../Components/Rooms/MDRoom.js'
import ProviderRoom from '../Components/Rooms/ProviderRoom.js'
import ProcedureConsentsDetail from '../Components/Rooms/Consents/ProcedureConsentsDetail.js'
import ProcedureQuestionnaireDetail from '../Components/Rooms/Questionnaire/ProcedureQuestionnaireDetail.js'
import ProviderConsents from '../Components/Rooms/Consents/ProviderConsents.js'
import ProviderQuestionnaires from '../Components/Rooms/Questionnaire/ProviderQuestionnaires.js'

//Components/Procedure
import ProcedureDetail from '../Components/Procedure/ProcedureDetail.js'
import Procedure from '../Components/Procedure/Procedure.js'
import ProcedureHealth from '../Components/Procedure/ProcedureHealth.js'
import ProcedureHealthDetail from '../Components/Procedure/ProcedureHealthDetail.js'

//Components/ProcedureNotes
import ProcedureNotes from '../Components/ProcedureNotes/ProcedureNotes.js'

//Components/ProcedureConsents
import ProcedureConsents from '../Components/ProcedureConsents/ProcedureConsents.js'

//Components/ProcedurePrescriptions
import ProcedurePrescriptionDetail from '../Components/ProcedurePrescriptions/ProcedurePrescriptionDetail.js'

//Components/ClientNotes
import ClientNotes from '../Components/ClientNotes/ClientNotes.js'

//Components/Invoices
import InvoiceDetails from '../Components/Invoices/InvoiceDetails.js';

//Components/InvoiceView
import InvoiceView from '../Components/InvoiceView/InvoiceView.js'

//Components/TreatmentMarkings
import TreatmentMarkings from '../Components/TreatmentMarkings/TreatmentMarkings.js'

//Components/TraceabilityInfo
import TraceabilityInfo from '../Components/TraceabilityInfo/TraceabilityInfo.js'

//Components/UpcomingAppointments
import UpcomingAppointments from '../Components/UpcomingAppointments/UpcomingAppointments.js'

//Components/MedicalHistory
import MedicalHistory from '../Components/MedicalHistory/MedicalHistory.js'

//Components/PaymentHistory
import PaymentHistory from '../Components/PaymentHistory/PaymentHistory.js'

//Containers/Layouts/ARLayout
import ARLayout from '../Containers/Layouts/ARLayout.js'

//Containers/Authorization
import Authorization from '../Utils/authorization.js';

//Settings/DotPhrases
import DotPhrases from '../Components/Settings/DotPhrases/DotPhrases.js';
import AddUpdateDotPhrase from '../Components/Settings/DotPhrases/AddUpdateDotPhrase.js';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest}  render={ props => (<Component {...props} />)} />
)

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  /*static getDerivedStateFromError(error) {
    console.log(process.env.NODE_ENV);
    if ( process.env.NODE_ENV && process.env.NODE_ENV === 'development' ) {
      return { hasError: false };
    } else {
      return { hasError: false };
    }
  }*/

  render() {
    if (this.state.hasError) {
      // Rendering error page
      return (
        <div className="main protected">
          <div className="something-wrong">
            <img src="/images/something-wrong.png" />
            <Link to="/logout" className="click-logout">Click to Logout</Link>
          </div>
        </div>
        );
    } else {
     return this.props.children;
    }
    //return this.props.children;
  }
}

const router =
<ErrorBoundary>
	<ARLayout>
		<Switch>
      //Dashboard
        <Redirect exact path="/" to="dashboard" />
      	<PrivateRoute exact path="/dashboard" component={(Authorization(['dashboard',"appointments", "admin" , "dashboard", "dashboard" ]))(Dashboard)} />
  			<PrivateRoute exact path="/dashboard/sms-notifications" component={(Authorization(['access-all',"appointments", "admin" , "settings" ]))(SMSNotifications)} />
  			<PrivateRoute exact path="/dashboard/sms-notificationspopup/:id" component={(Authorization(['access-all',"appointments", "admin" , "settings" ]))(SMSNotificationsPopup)} />
  			<PrivateRoute exact path="/dashboard/notifications" component={(Authorization(['access-all',"appointments", "admin" , "settings" ]))(Notifications)} />

      //Clients
        <PrivateRoute exact path="/clients" component={(Authorization(['view-patients',"patients-management", "admin", "clients"]))(Clients)} />
        <PrivateRoute exact path="/clients/profile/:id" component={(Authorization(['view-patients',"patients-management", "admin", "clients"]))(ClientProfile)} />
        <PrivateRoute exact path="/clients/create" component={(Authorization(['add-update-patients',"patients-management", "admin", "clients"]))(CreateEditClients)} />
        <PrivateRoute exact path="/clients/:id/:type" component={(Authorization(['add-update-patients',"patients-management", "admin", "clients"]))(CreateEditClients)} />
        <PrivateRoute exact path="/:actionType/wallet/:clientID/:type" component={(Authorization(['view-patients',"patients-management", "admin" , "clients" ]))(ClientWallet)} />
        <PrivateRoute exact path="/:actionType/documents/:resourceType/:documentID?/:clientID/:type" component={(Authorization(['add-update-documents',"patients-management", "admin" , "procedure" ]))(CreateEditClientDocuments)} />
        <PrivateRoute exact path="/:actionType/documents/:clientID/:type" component={(Authorization(['add-update-documents',"patients-management", "admin" , "procedure" ]))(ClientDocuments)} />

        <PrivateRoute exact path="/:actionType/export-procedures/:clientID/:type" component={(Authorization(['export-procedures',"patients-management", "admin" , "clients" ]))(ExportProcedures)} />

        <PrivateRoute exact path="/clients/bulk-import" component={(Authorization(['add-update-patients',"patients-management", "admin" , "procedure" ]))(BulkImport)} />
        <PrivateRoute exact path="/:actionType/export-procedures/:clientID/:type/:procedureID/:appointmentID" component={(Authorization(['view-patients',"patients-management", "admin" , "clients" ]))(ViewFilledSurvey)} />

      //Appointments
        <PrivateRoute exact path="/appointment/service-category" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(ServiceCategory)} />
        <PrivateRoute exact path="/appointment/service-category/create" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditServiceCategory)} />
        <PrivateRoute exact path="/appointment/service-category/:id/edit" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditServiceCategory)} />
        <PrivateRoute exact path="/appointment/services" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(Services)} />
        <PrivateRoute exact path="/appointment/services-main" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(ServicesMain)} />
        <PrivateRoute exact path="/appointment/other-settings" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(OtherSettings)} />
        <PrivateRoute exact path="/appointment/services/create" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditServices)} />
        <PrivateRoute exact path="/appointment/services/:serviceCategoryId/:id/edit" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditServices)} />
        <PrivateRoute exact path="/appointment/services/:serviceCategoryId/:cloneId/clone" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditServices)} />
        <PrivateRoute exact path="/appointment/services-packages" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(ServicesPackages)} />
        <PrivateRoute exact path="/appointment/services-packages/create" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditServicesPackages)} />
        <PrivateRoute exact path="/appointment/services-packages/:id/edit" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditServicesPackages)} />
        <PrivateRoute exact path="/appointment/services-packages/:cloneId/clone" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditServicesPackages)} />
        <PrivateRoute exact path="/appointment/index" component={(Authorization(['view-appointments',"appointments", "admin" , "appointments" ]))(Calendar)} />
        <PrivateRoute exact path="/appointment/view/:appointmentId" component={(Authorization(['view-appointments',"appointments", "admin" , "appointments" ]))(Calendar)} />
        <PrivateRoute exact path="/appointment/equipment-schedule" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(OtherResources)} />
        <PrivateRoute exact path="/appointment/equipment-schedule/create" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditEquipmentSchedule)} />
        <PrivateRoute exact path="/appointment/equipment-schedule/:id/edit" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditEquipmentSchedule)} />
        <PrivateRoute exact path="/appointment/resource-schedule" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(ResourceSchedule)} />
        <PrivateRoute exact path="/appointment/resource-schedule/create" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditResourceSchedule)} />
        <PrivateRoute exact path="/appointment/resource-schedule/:id/edit" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(CreateEditResourceSchedule)} />
        <PrivateRoute exact path="/appointment/provider-schedule" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(ProviderSchedule)} />
        <PrivateRoute exact path="/appointment/provider-schedule/:id/view" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(ProviderScheduleView)} />
        <PrivateRoute exact path="/appointment/provider-schedule-delete/:id" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(ProviderScheduleDelete)} />
        <PrivateRoute exact path="/appointment/create" component={(Authorization(['create-appointment',"appointments", "admin" , "appointments" ]))(CreateAppointment)} />
        <PrivateRoute exact path="/appointment/config" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(AppointmentConfig)} />
        <PrivateRoute exact path="/appointment/communication" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(AppointmentCommunication)} />
        <PrivateRoute exact path="/appointment/booking-portal" component={(Authorization(['manage-appointment-settings',"appointments", "admin" , "appointments" ]))(BookingPortal)} />
        <PrivateRoute exact path="/appointment/create/:clientId" component={(Authorization(['create-appointment',"appointments", "admin" , "appointments" ]))(CreateAppointment)} />
        <PrivateRoute exact path="/appointment/booking-history"  component={(Authorization(['view-appointments',"appointments", "admin" , "appointments" ]))(BookingHistory)} />
        <PrivateRoute exact path="/appointment/edit/:id" component={(Authorization(['create-appointment',"appointments", "admin" , "appointments" ]))(CreateAppointment)} />
        <PrivateRoute exact path="/appointment/edit/:id/:mode" component={(Authorization(['create-appointment',"appointments", "admin" , "appointments" ]))(CreateAppointment)} />
        <PrivateRoute exact path="/appointment/reports" component={(Authorization(['view-appointments',"appointments", "admin" , "appointments" ]))(AppointmentReports)} />

        //Sales
        <PrivateRoute exact path="/sales" component={(Authorization(['view-sales',"sales", "admin" , "sales" ]))(SalesSummary)} />
        <PrivateRoute exact path="/sales/invoice-text" component={(Authorization(['view-sales-invoice-text',"sales", "admin" , "sales" ]))(InvoiceDisclaimerText)} />
        <PrivateRoute exact path="/sales/monthly-net-sales" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(MonthlyNetSales)} />
        <PrivateRoute exact path="/sales/item-sales" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(ItemSales)} />
        <PrivateRoute exact path="/sales/category-sales" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(CategorySales)} />
        <PrivateRoute exact path="/sales/employee-sales-report" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(EmployeeSales)} />
        <PrivateRoute exact path="/sales/payment-methods" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(PaymentMethods)} />
        <PrivateRoute exact path="/sales/discounts" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(Discounts)} />
        <PrivateRoute exact path="/sales/staff-treatments" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(StafTratment)} />
        <PrivateRoute exact path="/sales/memberships" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(Membership)} />
        <PrivateRoute exact path="/sales/short-term-liability" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(ShortTermLiability)} />
        <PrivateRoute exact path="/sales/treatment-plans" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(TreatmentPlans)} />
        <PrivateRoute exact path="/sales/taxes" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(Taxes)} />
        <PrivateRoute exact path="/sales/commission-report" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(CommissionReports)} />
        <PrivateRoute exact path="/sales/cost-to-company" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(CostToCompany)} />
        <PrivateRoute exact path="/sales/egift-cards" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(eGiftCards)} />

        <PrivateRoute exact path="/sales/invoices" component={(Authorization(['view-sales-invoices',"sales", "admin" , "sales" ]))(SalesInvoices)} />
        <PrivateRoute exact path="/sales/invoices-popups" component={(Authorization(['view-sales-invoices',"sales", "admin" , "sales" ]))(SalesInvoicesPopups)} />

        <PrivateRoute exact path="/sales/office-sales-goals/add" component={(Authorization(['view-sales-goals',"sales", "admin" , "sales" ]))(AddOfficeSalesGoals)} />
        <PrivateRoute exact path="/sales/office-sales-goals/:id" component={(Authorization(['view-sales-goals',"sales", "admin" , "sales" ]))(ManageOfficeSalesGoals)} />
        <PrivateRoute exact path="/sales/office-sales-goals" component={(Authorization(['view-sales-goals',"sales", "admin" , "sales" ]))(OfficeSalesGoals)} />
        <PrivateRoute exact path="/sales/office-salesgoals/:id/edit" component={(Authorization(['view-sales-goals',"sales", "admin" , "sales" ]))(AddOfficeSalesGoals)} />
        <PrivateRoute exact path="/sales/cash-drawer" component={(Authorization(['view-cash-drawer',"sales", "admin" , "sales" ]))(CashDrawer)} />
        <PrivateRoute exact path="/sales/membership-churn-report" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(MembershipChurnReport)} />
        <PrivateRoute exact path="/sales/tips-per-provider" component={(Authorization(['view-sales-report',"sales", "admin" , "sales" ]))(TipsPerProvider)} />

        //Inventory
        <PrivateRoute exact path="/inventory/products/active" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(InventoryProductsActive)} />
        <PrivateRoute exact path="/inventory/products/inactive" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(InventoryProductsInactive)} />
        <PrivateRoute exact path="/inventory/products/:statusId/:id/edit" component={(Authorization(['edit-product',"inventory-management", "admin" , "dashboard" ]))(EditInventory)} />
        <PrivateRoute exact path="/inventory/products/:statusId/:id/edit" component={(Authorization(['edit-product',"inventory-management", "admin" , "dashboard", "inventory" ]))(EditInventory)} />
        <PrivateRoute exact path="/inventory/product/edit/:id/:categoryId/:statusId" component={(Authorization(['edit-product',"inventory-management", "admin" , "dashboard", "inventory" ]))(EditInventory)} />
        <PrivateRoute exact path="/inventory/product/add" component={(Authorization(['add-product',"inventory-management", "admin" , "dashboard", "inventory" ]))(EditInventory)} />
        <PrivateRoute exact path="/inventory/products-categories" component={(Authorization(['view-product-categories',"inventory-management", "admin" , "dashboard", "inventory" ]))(ProductCategories)} />
        <PrivateRoute exact path="/inventory/products-categories/create" component={(Authorization(['manage-product-categories',"inventory-management", "admin" , "dashboard" ]))(CreateEditCategories)} />
        <PrivateRoute exact path="/inventory/products-categories/:id/edit" component={(Authorization(['manage-product-categories',"inventory-management", "admin" , "dashboard" ]))(CreateEditCategories)} />
        <PrivateRoute exact path="/inventory/discount-packages" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(DiscountPackages)} />
        <PrivateRoute exact path="/inventory/discount-groups" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(DiscountGroups)} />
        <PrivateRoute exact path="/inventory/e-giftcards" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(EGiftCards)} />
        <PrivateRoute exact path="/inventory/pos-quick-button" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(posQuickButton)} />
        <PrivateRoute exact path="/inventory/e-giftcards/create" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateEditEGiftCards)} />
        <PrivateRoute exact path="/inventory/e-giftcards/:id/edit" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateEditEGiftCards)} />
        <PrivateRoute exact path="/inventory/treatmentPlanTemplates" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(TreatmentPlanTemplate)} />
        <PrivateRoute exact path="/inventory/discount-packages/add" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(AddDiscountPackage)} />
        <PrivateRoute exact path="/inventory/discount-groups/add" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateEditDiscountGroups)} />
        <PrivateRoute exact path="/inventory/discount-groups/:id/edit" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateEditDiscountGroups)} />
        <PrivateRoute exact path="/inventory/pos-quick-button/add" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(AddEditposQuickButton)} />
        <PrivateRoute exact path="/inventory/pos-quick-button/:id/edit" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(AddEditposQuickButton)} />

        <PrivateRoute exact path="/inventory/treatmentPlanTemplates/create" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateTreatmentPlanTemplate)} />
        <PrivateRoute exact path="/inventory/discount-package/create" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateEditDiscountPackage)} />
        <PrivateRoute exact path="/inventory/discount-package/:id/edit" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateEditDiscountPackage)} />
        <PrivateRoute exact path="/inventory/discount-groups" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard" ]))(DiscountGroups)} />
        <PrivateRoute exact path="/inventory/e-giftcards" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard" ]))(EGiftCards)} />
        <PrivateRoute exact path="/inventory/products/:categoryId/category" component={(Authorization(['view-product-categories',"inventory-management", "admin" , "dashboard", "inventory" ]))(InventoryProductsCategory)} />
        <PrivateRoute exact path="/inventory/discount-coupons" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(DiscountCoupons)} />
        <PrivateRoute exact path="/inventory/discount-coupons/:id/edit" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateEditDiscountCoupons)} />
        <PrivateRoute exact path="/inventory/discount-coupons/create" component={(Authorization(['view-products-inventory',"inventory-management", "admin" , "dashboard", "inventory" ]))(CreateEditDiscountCoupons)} />

        //Reports
        <PrivateRoute exact path="/reports" component={(Authorization(['view-patients',"patients-management", "admin" , "settings", "reports" ]))(Reports)} />
        <PrivateRoute exact path="/reports/create" component={(Authorization(['view-patients',"patients-management", "admin" , "settings", "reports" ]))(CreateReports)} />
        <PrivateRoute exact path="/reports/:id/edit" component={(Authorization(['view-patients',"patients-management", "admin" , "settings", "reports" ]))(ReportEdit)} />

        //Surveys
        <PrivateRoute exact path="/surveys/dashboard/view-all" component={(Authorization(['view-patients',"patients-management", "admin" , "surveys" ]))(ViewAllSurveys)} />
        <PrivateRoute exact path="/surveys/view-all/:id/survey-data" component={(Authorization(['view-patients',"patients-management", "admin" , "surveys" ]))(SurveyData)} />
        <PrivateRoute exact path="/surveys/dashboard/:id/view-all" component={(Authorization(['view-patients',"patients-management", "admin" , "surveys" ]))(ViewAllSurveys)} />
        <PrivateRoute exact path="/surveys/dashboard" component={(Authorization(['view-patients',"patients-management", "admin" , "surveys" ]))(AllSurveys)} />
        <PrivateRoute exact path="/surveys/manage" component={(Authorization(['view-patients',"patients-management", "admin" , "surveys" ]))(SurveyList)} />
        <PrivateRoute exact path="/surveys/template/create" component={(Authorization(['view-patients',"patients-management", "admin" , "surveys" ]))(CreateEditSurveyTemplate)} />
        <PrivateRoute exact path="/surveys/template/:id/edit" component={(Authorization(['view-patients',"patients-management", "admin" , "surveys" ]))(CreateEditSurveyTemplate)} />

        //UserActivity
  			<PrivateRoute exact path="/dashboard/user-logs" component={(Authorization(['view-patients',"patients-management", "admin" , "dashboard" ]))(UserActivity)} />
  			<PrivateRoute exact path="/dashboard/user-logs/view-changes/:object_type/:child_id/:object_id" component={(Authorization(['view-patients',"patients-management", "admin" , "dashboard" ]))(ViewComparison)} />

        //Settings/Account-Information
        <PrivateRoute exact path="/settings/profile" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(Profile)} />
  			<PrivateRoute exact path="/settings/ar-account" component={(Authorization(['manage-account-information',"settings", "admin" , "settings" ]))(Araccount)} />
        <PrivateRoute exact path="/settings/ar-terms-of-use" component={(Authorization(['manage-account-information',"settings", "admin" , "settings" ]))(ArTermsOfUse)} />
        <PrivateRoute exact path="/settings/hipaa-terms-of-use" component={(Authorization(['manage-account-information',"settings", "admin" , "settings" ]))(HipaaTermsOfUse)} />
  			<PrivateRoute path="/settings/two-factor-auth" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(TwoFactorAuthentication)} />
        <PrivateRoute exact path="/settings/profile/calendar/sync" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(GoogleCalendarReturnUrl)} />

        //Settings/Manage-Your-Clinics
        <PrivateRoute path="/settings/questionnaires" exact component={(Authorization(['manage-questionnaires',"settings", "admin" , "settings" ]))(Questionnaires)} />
  			<PrivateRoute path="/settings/questionnaires/create" exact component={(Authorization(['manage-questionnaires',"settings", "admin" , "settings" ]))(CreateEditQuestionnaire)} />
  			<PrivateRoute path="/settings/questionnaires/:id/edit" exact component={(Authorization(['manage-questionnaires',"settings", "admin" , "settings" ]))(CreateEditQuestionnaire)} />
  			<PrivateRoute path="/settings/consents" component={(Authorization(['manage-consents',"settings", "admin" , "settings" ]))(Consents)} />
  			<PrivateRoute exact path="/settings/consent/:id/edit" component={(Authorization(['manage-consents',"settings", "admin" , "settings" ]))(CreateEditConsents)} />
  			<PrivateRoute exact path="/settings/consent/create" component={(Authorization(['manage-consents',"settings", "admin" , "settings" ]))(CreateEditConsents)} />
  			<PrivateRoute path="/settings/clinics" component={(Authorization(['manage-clinics',"settings", "admin" , "settings" ]))(Clinics)} />
  			<PrivateRoute exact path="/settings/clinic/:id/edit" component={(Authorization(['manage-clinics',"settings", "admin" , "settings" ]))(CreateEditClinics)} />
  			<PrivateRoute exact path="/settings/clinic/create" component={(Authorization(['manage-clinics',"settings", "admin" , "settings" ]))(CreateEditClinics)} component={CreateEditClinics} />
        <PrivateRoute exact path="/settings/procedure-template/create" component={(Authorization(['manage-clinics',"settings", "admin" , "settings" ]))(CreateEditTemplate)} />
        <PrivateRoute exact path="/settings/procedure-template/:id/edit" component={(Authorization(['manage-clinics',"settings", "admin" , "settings" ]))(CreateEditTemplate)} />
  			<PrivateRoute path="/settings/procedure-templates" component={(Authorization(['manage-clinics',"settings", "admin" , "settings" ]))(ProcedureTemplates)} />
  			<PrivateRoute path="/settings/post-treatment-instructions/create" component={(Authorization(['manage-post-treatment-instructions',"settings", "admin" , "dashboard" ]))(CreateEditPostInstructions)}  />
  			<PrivateRoute path="/settings/post-treatment-instructions/:id/edit" component={(Authorization(['manage-post-treatment-instructions',"settings", "admin" , "dashboard" ]))(CreateEditPostInstructions)} />
  			<PrivateRoute path="/settings/post-treatment-instructions" exact component={(Authorization(['manage-post-treatment-instructions',"settings", "admin" , "settings" ]))(PostTreatmentInstructions)} />
  			<PrivateRoute path="/settings/post-treatment-email" exact component={(Authorization(['manage-post-treatment-instructions',"settings", "admin" , "settings" ]))(PostTreatmentEmail)} />
  			<PrivateRoute path="/settings/pre-treatment-instructions" exact component={(Authorization(['manage-pre-treatment-instructions',"settings", "admin" , "settings" ]))(PreTreatmentInstructions)} />
  			<PrivateRoute path="/settings/pre-treatment-email" exact component={(Authorization(['manage-pre-treatment-instructions',"settings", "admin" , "settings" ]))(PreTreatmentEmail)} />
  			<PrivateRoute path="/settings/pre-treatment-instructions/create" component={(Authorization(['manage-pre-treatment-instructions',"settings", "admin" , "dashboard" ]))(CreateEditPreInstructions)} />
  			<PrivateRoute path="/settings/pre-treatment-instructions/:id/edit" component={(Authorization(['manage-pre-treatment-instructions',"settings", "admin" , "dashboard" ]))(CreateEditPreInstructions)} />

        //Settings/Appointments
  			<PrivateRoute path="/settings/appointment-email-sms" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(AppointmentEmailsSMS)} />
        <PrivateRoute path="/settings/appointments" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(AppointmentEmailsSMS)} />
  			<PrivateRoute exact path="/settings/appointment-reminder" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(AppointmentReminder)} />
  			<PrivateRoute exact path="/settings/appointment-reminder/create" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(CreateEditReminder)} />
  			<PrivateRoute exact path="/settings/appointment-reminder/:reminderId/edit" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(CreateEditReminder)} />
        <PrivateRoute exact path="/settings/configure-uri" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(ConfigureURL)} />
  			<Route exact path="/settings/cancellation-policy" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(CancellationPolicy)} />
  			<PrivateRoute exact path="/settings/patient-portal" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(PatientPortal)} />
        <PrivateRoute path="/settings/survey-email-sms" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(SurveySettings)} />

        //Settings/Membership & Wallet
        <PrivateRoute exact path="/settings/membership-wallet" component={(Authorization(['wallet-settings',"settings", "admin" , "settings" ]))(MembershipWallet)} />

        //settings/Teammates
        <PrivateRoute path="/settings/users" exact component={(Authorization(['manage-users',"settings", "admin" , "settings" ]))(Users)} />
        <PrivateRoute path="/settings/users/create" component={(Authorization(['manage-users',"settings", "admin" , "settings" ]))(CreateEditUser)} />
        <PrivateRoute path="/settings/users/:userId/edit" component={(Authorization(['manage-users',"settings", "admin" , "settings" ]))(CreateEditUser)} />
        <PrivateRoute exact path="/settings/createUser" component={(Authorization(['manage-users',"settings", "admin" , "settings" ]))(CreateUser)} />
        <PrivateRoute path="/settings/user-roles" exact component={(Authorization(['manage-user-roles',"settings", "admin" , "settings" ]))(UserRoles)} />
        <PrivateRoute exact path="/settings/user-privileges/:id/role/:roleId" component={(Authorization(['manage-user-roles',"settings", "admin" , "settings" ]))(UserPrivilege)} />

        //Settings/RecentlyDeleted
        <PrivateRoute path="/settings/recently-deleted" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(RecentlyDeleted)} />

        //Settings/YourBilling
        <PrivateRoute path="/settings/manage-invoices" component={(Authorization(['superadmin',"settings", "admin" , "settings" ,'manage-invoices' ]))(Invoices)} />
        <PrivateRoute exact path="/settings/manage-subscription" component={(Authorization(['superadmin',"settings", "admin" , "settings" ,'manage-subscription' ]))(Subscription)} />

        //Settings/POS
        <PrivateRoute exact path="/settings/pos-dashboard" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosDashboard)} />
        <PrivateRoute exact path="/settings/pos-dashboard/verification" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosDashboardVerification)} />
        <PrivateRoute exact path="/settings/pos-payments" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosPayments)} />
        <PrivateRoute exact path="/settings/pos-payouts" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosPayouts)} />
        <PrivateRoute exact path="/settings/pos-payouts/:id/view" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosPayoutsView)} />
        <PrivateRoute exact path="/settings/pos" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(Pos)} />
        <PrivateRoute exact path="/settings/pos/setup/:type/:clinicId?" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosSetup)} />
        <PrivateRoute exact path="/settings/pos/card-reader/:type/:clinicId?" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosCardReader)} />
        <PrivateRoute exact path="/settings/pos-payment-settings" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosPaymentSettings)} />
        <PrivateRoute exact path="/settings/pos-disputes/:disputeId/view" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosDisputesView)} />
        <PrivateRoute exact path="/settings/pos/express/setup" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosStripeReturnUrl)} />
        <PrivateRoute exact path="/settings/pos-disputes/:disputeId/evidence/:type" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosDisputesEvidenceType)} />
        <PrivateRoute exact path="/settings/pos-disputes" component={(Authorization(['superadmin',"settings", "admin" , "settings" ]))(PosDisputes)} />

        //Component/Rooms
        <PrivateRoute exact path="/md-room/:type" component={(Authorization(['md',"settings", "admin" , "rooms" ]))(MDRoom)} />
        <PrivateRoute exact path="/provider-room/:type" component={(Authorization(['provider',"settings", "admin" , "rooms" ]))(ProviderRoom)} />
        <PrivateRoute exact path="/md-room/consent/:id/:type" component={(Authorization(['md',"settings", "admin" , "consent" ]))(ProcedureConsentsDetail)} />
        <PrivateRoute exact path="/clients/:clientID/consent/:id/:type" component={(Authorization(['manage-procedures',"patients-management", "admin" , "consent" ]))(ProcedureConsentsDetail)} />
        <PrivateRoute exact path="/clients/:clientID/questionnaire/:id/:type" component={(Authorization(['manage-procedures',"patients-management", "admin" , "questionnaire" ]))(ProcedureQuestionnaireDetail)} />
        <PrivateRoute exact path="/clients/profile/consent/:id" component={(Authorization(['manage-procedures',"patients-management", "admin" , "clients" ]))(ProviderConsents)} />
        <PrivateRoute exact path="/md-room/procedure-detail/:id/:type" component={(Authorization(['md',"settings", "admin" , "procedure" ]))(ProcedureDetail)} />
        <PrivateRoute exact path="/md-room/questionnaire/:id/:type" component={(Authorization(['md',"settings", "admin" , "questionnaire" ]))(ProcedureQuestionnaireDetail)} />
        <PrivateRoute exact path="/provider-room/consent/:id/:type" component={(Authorization(['provider',"settings", "admin" , "consent" ]))(ProcedureConsentsDetail)} />
        <PrivateRoute exact path="/provider-room/questionnaire/:id/:type" component={(Authorization(['provider',"settings", "admin" , "questionnaire" ]))(ProviderQuestionnaires)} />
  			<PrivateRoute exact path="/provider-room/procedure-detail/:id/:type" component={(Authorization(['provider',"settings", "admin" , "procedure" ]))(ProcedureDetail)} />

        //Components/Procedure
        <PrivateRoute exact path="/settings/procedure-detail/:id/:type" component={(Authorization(['manage-procedures',"patients-management", "admin" , "procedure" ]))(ProcedureDetail)} />
        <PrivateRoute exact path="/:actionType/procedure/:resourceType/:procedureID?/:clientID/:type" component={(Authorization(['manage-procedures',"patients-management", "admin" , "procedure" ]))(Procedure)} />
        <PrivateRoute exact path="/:actionType/procedure-health-detail/:procedureID/:clientID?/:type" component={(Authorization(['manage-procedures',"patients-management", "admin" , "procedure" ]))(ProcedureHealthDetail)} />
        <PrivateRoute exact path="/:actionType/procedure-health/:resourceType/:procedureID?/:clientID/:type" component={(Authorization(['manage-procedures',"patients-management", "admin" , "procedure" ]))(ProcedureHealth)} />


        //Components/ProcedureNotes
  			<PrivateRoute exact path="/md-room/notes/:procedureID/:patientID/:type/:noteID?" component={(Authorization(['md',"settings", "admin" , "procedure" ]))(ProcedureNotes)} />
        <PrivateRoute exact path="/provider-room/notes/:procedureID/:patientID/:type/:noteID?" component={(Authorization(['provider',"settings", "admin" , "procedure" ]))(ProcedureNotes)} />
        <PrivateRoute exact path="/clients/notes/:procedureID/:patientID/:type" component={(Authorization(['view-procedure-notes',"patients-management", "admin" , "procedure" ]))(ProcedureNotes)} />

        //Components/ProcedureConsents
  			<PrivateRoute exact path="/:actionType/consent/:resourceType/:procedureID?/:clientID/:type" component={(Authorization(['access-all',"patients-management", "admin" , "procedure" ]))(ProcedureConsents)} />

        //Components/ProcedurePrescriptionDetail
  			<PrivateRoute exact path="/:actionType/prescription/:procedureID/:clientID?/:type" component={(Authorization(['access-all',"patients-management", "admin" , "procedure" ]))(ProcedurePrescriptionDetail)} />

        //Components/ClientNotes
        <PrivateRoute exact path="/:actionType/customer-notes/:patientID/:type" component={(Authorization(['view-customer-notes',"patients-management", "admin" , "procedure" ]))(ClientNotes)} />

        //Components/Invoices
        <PrivateRoute exact path="/:actionType/invoice/:invoiceID/:clientID" component={(Authorization(['view-patients',"patients-management", "admin" , "invoices" ]))(InvoiceDetails)} />
        <PrivateRoute exact path="/:actionType/invoice/:invoiceID/:clientID/:type" component={(Authorization(['view-patients',"patients-management", "admin" , "invoices" ]))(InvoiceDetails)} />

        //Components/InvoiceView
        <PrivateRoute exact path="/settings/invoices/:invoiceId/:type" component={(Authorization(['view-sales-invoices',"sales", "admin" , "procedure" ,'manage-invoices' ]))(InvoiceView)} />

        //Components/TreatmentMarkings
        <PrivateRoute exact path="/clients/treatment-markings/:procedureID/:clientID/:type" component={(Authorization(['view-patients',"patients-management", "admin" , "clients" ]))(TreatmentMarkings)} />

        //Components/TraceabilityInfo
        <PrivateRoute exact path="/:actionType/traceability-info/:procedureID/:clientID/:type/:subType?" component={(Authorization(['view-patients',"patients-management", "admin" , "traceinfo" ]))(TraceabilityInfo)} />

        //Components/UpcomingAppointments
        <PrivateRoute exact path="/:actionType/upcoming-appointments/:clientID/:type" component={(Authorization(['view-patients',"patients-management", "admin" , "clients" ]))(UpcomingAppointments)} />

        //Components/MedicalHistory
        <PrivateRoute exact path="/:actionType/medical-history/:clientID/:type" component={(Authorization(['manage-medical-history',"patients-management", "admin" , "clients" ]))(MedicalHistory)} />

        //Components/PaymentHistory
        <PrivateRoute exact path="/:actionType/payment-history/:clientID/:type/:tabType" component={(Authorization(['view-patients',"patients-management", "admin" , "clients" ]))(PaymentHistory)} />

        //Settings/DotPhrases
        <PrivateRoute path="/settings/dot-phrases" exact component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(DotPhrases)} />
        <PrivateRoute path="/settings/dot-phrases/:actionType/:id?" component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(AddUpdateDotPhrase)} />

        // View after photos
        <PrivateRoute path="/:actionType/after-photos/:procedureID/:clientID/:action" exact component={(Authorization(['view-patients',"patients-management", "admin" , "settings" ]))(AfterPhotos)} />
		</Switch>
  </ARLayout>
  </ErrorBoundary>


export default router;
