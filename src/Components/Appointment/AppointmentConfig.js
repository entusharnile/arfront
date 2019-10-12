import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import AppointmentConfigSidebar from './AppointmentConfigSidebar.js';
import AppointmentHeader from './AppointmentHeader.js';
import ProviderSchedule from './ProviderSchedule/ProviderSchedule.js';


class AppointmentConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      providerId: undefined,
      mode: 'ProviderSchedule'
    };
  }

  componentDidMount() {

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }

  openSchedule = (id, name) => {
    import('./ProviderSchedule/ProviderScheduleView.js').then(component => {
      this.setState({
        ProviderScheduleView: component.default,
        showSchedule: true,
        showSchedulePop: true,
        showScheduleDelete: false,
        providerId: id,
        providerName : name,
        mode: 'ProviderScheduleView'
      });
    });
  }

  openDeleteSchedule = (id) => {
    import('./ProviderSchedule/ProviderScheduleDelete.js').then(component => {
      this.setState({
        ProviderScheduleDelete: component.default,
        showSchedulePop: true,
        showSchedule: false,
        showScheduleDelete: true,
        providerId: id,
        mode: 'ProviderScheduleDelete'
      });
    });
  }

  backToProviderSchedule = () => {
    this.setState({
        showSchedulePop: true,
        showSchedule: true,
        showScheduleDelete: false,
        providerId: this.state.providerId,
        providerName : this.state.providerName
    });
  }

  componentDidUpdate = (props, state) => {
    if(this.state.showSchedulePop) {
      console.log("asdasd");
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
  render() {
    const {ProviderScheduleView, ProviderScheduleDelete, providerId, mode} = this.state;

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <AppointmentHeader activeMenuTag={'config'}/>
          <AppointmentConfigSidebar />
          {this.state.mode == 'ProviderSchedule' && <ProviderSchedule scheduleView={this.openSchedule} />}
        </div>

        <div className={(this.state.showSchedulePop) ? "modalOverlay allFilters providerCal scroll-y" : "modalOverlay allFilters providerCal no-display scroll-y"}>
            <div className="small-popup-outer privider-calender-popup">
                <div class="small-popup-header"><div class="popup-name">Provider Schedule - {this.state.providerName}</div><a onClick={() => {this.setState({showSchedulePop: false, ProviderScheduleView: undefined, ProviderScheduleDelete: undefined, mode: 'ProviderSchedule'})}} class="small-cross">×</a></div>
                <div className="privider-calender-content">
                 {ProviderScheduleView && this.state.showSchedule &&  <ProviderScheduleView providerId={providerId} openDeleteSchedule={this.openDeleteSchedule} />} 
                 {ProviderScheduleDelete && this.state.showScheduleDelete && <ProviderScheduleDelete providerId={this.state.providerId} backToProviderSchedule = {this.backToProviderSchedule} />} 
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
)(withRouter(AppointmentConfig));
