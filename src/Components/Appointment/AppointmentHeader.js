import React, { Component } from 'react';
import { Link} from 'react-router-dom';
import { checkIfPermissionAllowed} from '../../Utils/services.js';

 class AppointmentHeader extends Component{
   constructor(props) {
     super(props);
     const userData = JSON.parse(localStorage.getItem('userData'));
     this.state = {
       activeMenuTag : ''
     };
   }

   componentDidMount(){
     const languageData = JSON.parse(localStorage.getItem('languageData'));
     this.setState({
       appointment_calendar: languageData.appointments['appointment_calendar'],
       appointment_services: languageData.appointments['appointment_services'],
       appointment_services_packages: languageData.appointments['appointment_services_packages'],
       appointment_provider_schedule: languageData.appointments['appointment_provider_schedule'],
       appointment_equipment_schedule: languageData.appointments['appointment_equipment_schedule'],
       appointment_resource_schedule: languageData.appointments['appointment_resource_schedule'],
       appointment_booking_history: languageData.appointments['appointment_booking_history'],
       appointment_reports: languageData.appointments['appointment_reports']
     });
   }

   static getDerivedStateFromProps(props, state) {
     let returnState = {}
     if(props.activeMenuTag != undefined){
       returnState.activeMenuTag = props.activeMenuTag;
     }
     return returnState;
   }

   render(){
     return(
       <ul className="sub-menu text-right">
         {checkIfPermissionAllowed("view-appointments") && <li><Link to="/appointment/index" className={(this.state.activeMenuTag == 'calendar') ? 'active' : ''}>{this.state.appointment_calendar}</Link></li>}
         {checkIfPermissionAllowed("view-appointments") && <li><Link to="/appointment/booking-history" className={(this.state.activeMenuTag == 'booking-history') ? 'active' : ''}>{this.state.appointment_booking_history}</Link></li>}
         {checkIfPermissionAllowed("view-appointments") && <li><Link to="/appointment/reports" className={(this.state.activeMenuTag == 'reports') ? 'active' : ''}>{this.state.appointment_reports}</Link></li>}
         {checkIfPermissionAllowed("manage-appointment-settings") && <li><Link to="/appointment/config" className={(this.state.activeMenuTag == 'config') ? 'active' : ''}>{"Smart Configuration"}</Link></li>}
       </ul>
     );
   }
 }


 export default AppointmentHeader;
