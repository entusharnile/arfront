import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';

class AppointmentConfigSidebar extends Component {
  constructor(props) {
    super(props);
    const langData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      langData: langData
    };
  }

  componentDidMount() {

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }


  render() {
    var url = window.location.href;
    var urlLastPartArr = url.split('/');
    var x = urlLastPartArr[urlLastPartArr.length-1];
    var urlLastPart = (x != '') ? x : urlLastPartArr[urlLastPartArr.length-2];
    return (
          <div className="setting-left-menu">
            <div className="setting-title smart-configuration-title">Smart Configuration</div>
            <ul className="new-setting-tabs appointment-config-link">
              <li className="new-setting-tabs-li"><Link to="/appointment/config"  className={(urlLastPart == "config") ? "new-setting-tabs-a select" : "new-setting-tabs-a unselect"}>{this.state.langData['appointments']['app-provider']}</Link></li>
              <li className="new-setting-tabs-li"><Link to="/appointment/services-main" className={(urlLastPart == "services-main") ? "new-setting-tabs-a select" : "new-setting-tabs-a unselect"}>{this.state.langData['appointments']['app-services']}</Link></li>
              <li className="new-setting-tabs-li"><Link to="/appointment/equipment-schedule" className={(urlLastPart == "equipment-schedule") ? "new-setting-tabs-a select" : "new-setting-tabs-a unselect"}>{this.state.langData['appointments']['app-other-resources']}</Link></li>
              <li className="new-setting-tabs-li"><Link to="/appointment/communication" className={(urlLastPart == "communication") ? "new-setting-tabs-a select" : "new-setting-tabs-a unselect"}>{this.state.langData['appointments']['app-communications']}</Link></li>
              <li className="new-setting-tabs-li"><Link to="/appointment/booking-portal" className={(urlLastPart == "booking-portal") ? "new-setting-tabs-a select" : "new-setting-tabs-a unselect"}>{this.state.langData['appointments']['app-booking-portal']}</Link></li>
              <li className="new-setting-tabs-li"><Link to="/appointment/other-settings" className={(urlLastPart == "other-settings") ? "new-setting-tabs-a select" : "new-setting-tabs-a unselect"}>{this.state.langData['appointments']['app-other-settings']}</Link></li>
            </ul>
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
)(withRouter(AppointmentConfigSidebar));
