import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import AppointmentConfigSidebar from './AppointmentConfigSidebar.js';
import AppointmentHeader from './AppointmentHeader.js';
import EquipmentSchedule from './EquipmentSchedule/EquipmentSchedule.js';
import ResourceSchedule from './ResourceSchedule/ResourceSchedule.js';

class OtherResources extends Component {
  constructor(props) {
    super(props);

    const langData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      mode: 'equipment',
      langData: langData
    };
  }

  componentDidMount() {

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    return null;
  }

  openListSchedule = (mode) => {
    this.setState({mode: mode})
  }

  addEquipment = (id) => {
    console.log(id);
    import('./EquipmentSchedule/CreateEditEquipmentSchedule.js').then(component => {
      let returnState = {};
      returnState.CreateEditEquipmentSchedule = component.default;
      returnState.showCreateEditEquipment = true;
      returnState.showCreateEditResource = false;
      returnState.mode = 'CreateEditEquipmentSchedule';
      returnState.equipmentScheduleId = (id) ? id : undefined;

      this.setState(returnState);
    });
  }

  addResource = (mode, id) => {
    import('./ResourceSchedule/CreateEditResourceSchedule.js').then(component => {
      let returnState = {};
      returnState.CreateEditResourceSchedule = component.default;
      returnState.showCreateEditEquipment = false;
      returnState.showCreateEditResource = true;
      returnState.mode = 'CreateEditResourceSchedule';
      returnState.resourceScheduleId = (id) ? id : undefined;
      
      this.setState(returnState);
    });
  }

  render() {
    const {CreateEditEquipmentSchedule, CreateEditResourceSchedule, resourceScheduleId, equipmentScheduleId} = this.state;
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <AppointmentHeader activeMenuTag={'config'}/>
          <AppointmentConfigSidebar />
            <div className="setting-setion">
              <div className="appointment-container">
                <ul className={(this.state.mode == 'equipment' || this.state.mode == 'resource') ? "appointment-tabs" : "appointment-tabs no-display"}>
                  <li><a className={(this.state.mode == 'equipment') ? "active" : ""} onClick={() => {this.setState({mode: 'equipment'})}}>{this.state.langData['appointments']['app-equipment']}</a></li>
                  <li><a className={(this.state.mode == 'resource') ? "active" : ""} onClick={() => {this.setState({mode: 'resource'})}}>{this.state.langData['appointments']['app-resources']}</a></li>
                </ul>
                { this.state.mode == 'equipment' && <EquipmentSchedule addEquipment={this.addEquipment} /> }
                { this.state.mode == 'resource' && <ResourceSchedule addResource={this.addResource} /> }
                { this.state.mode == 'CreateEditEquipmentSchedule' && CreateEditEquipmentSchedule && <CreateEditEquipmentSchedule  openListSchedule={this.openListSchedule}equipmentScheduleId={equipmentScheduleId} /> }
                { this.state.mode == 'CreateEditResourceSchedule' && CreateEditResourceSchedule && <CreateEditResourceSchedule  openListSchedule={this.openListSchedule} resourceScheduleId={resourceScheduleId} /> }
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
)(withRouter(OtherResources));
