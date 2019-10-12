import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import AppointmentConfigSidebar from './AppointmentConfigSidebar.js';
import AppointmentHeader from './AppointmentHeader.js';
import CancellationPolicy from './CancellationPolicy/CancellationPolicy.js';
import PatientPortal from './PatientPortal/PatientPortal.js';
import AppointmentReminder from './PatientAppointmentReminders/AppointmentReminder.js';

class OtherSettings extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const langData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      mode: 'CancellationPolicy',
      CancellationPolicy: CancellationPolicy,
      PatientPortal: PatientPortal,
      AppointmentReminder: AppointmentReminder,
      userData: userData,
      langData: langData
    };
  }

  componentDidMount() {

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }

  openReminderList = () => {
    
      let returnState = {};
      returnState.mode = 'AppointmentReminder';
      returnState.reminderId = undefined;
      this.setState(returnState);
   
  }

  openCreateAppointmentReminder = (id) => {
    import('./PatientAppointmentReminders/CreateEditReminder.js').then(component => {
      let returnState = {};
      returnState.CreateEditReminder = component.default;
      returnState.mode = 'CreateEditReminder';
      returnState.reminderId = (id) ? id: undefined;
      this.setState(returnState);
    });
  }

  render() {
    const {CancellationPolicy, PatientPortal, AppointmentReminder, CreateEditReminder, reminderId} = this.state;
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <AppointmentHeader activeMenuTag={'config'}/>
          <AppointmentConfigSidebar />
            <div className="setting-setion no-margin">
              <div className="appointment-container">
                <ul className="appointment-tabs">
                  <li><a className={(this.state.mode == 'CancellationPolicy') ? "active" : ""} onClick={() => {this.setState({mode: 'CancellationPolicy'})}}>{this.state.langData['appointments']['app-cancellation-policy']}</a></li>
                  <li><a className={(this.state.mode == 'PatientPortal') ? "active" : ""} onClick={() => {this.setState({mode: 'PatientPortal'})}}>{this.state.langData['appointments']['app-client-portal']}</a></li>
                  <li><a className={(this.state.mode == 'AppointmentReminder' || this.state.mode == 'CreateEditReminder') ? "active" : ""} onClick={() => {this.setState({mode: 'AppointmentReminder'})}}>{this.state.langData['appointments']['app-appointment-reminder']}</a></li>
                </ul>
                { this.state.mode == 'CancellationPolicy' && <CancellationPolicy  /> }
                { this.state.mode == 'PatientPortal'  && <PatientPortal  /> }
                { this.state.mode == 'AppointmentReminder' && <AppointmentReminder  openCreateAppointmentReminder={this.openCreateAppointmentReminder}/> }
                { this.state.mode == 'CreateEditReminder' && <CreateEditReminder  reminderId={reminderId} openReminderList={this.openReminderList}/> }
              </div>
            </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(OtherSettings));
