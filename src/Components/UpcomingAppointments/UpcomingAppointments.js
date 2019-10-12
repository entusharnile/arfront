import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import {getClientDetail} from '../../Actions/Clients/clientsAction.js';
import { capitalizeFirstLetter, showFormattedDate } from '../../Utils/services.js';


class UpcomingAppointments extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType       : (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      action            : (this.props.match.params.type) ? this.props.match.params.type : 'profile',
      showLoader        : false,
      globalLang        : languageData.global,
      clientID          : this.props.match.params.clientID,
      clientData        : [],
      dataChanged       : false,
      languageData      : languageData.clients,
    }
  }

  componentDidMount() {
    this.setState({
      showLoader: true
    });

    this.state.clientScopes = 'upcomingAppointments';
    this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
  }

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
    if ( props.clientData !== undefined && props.clientData.status === 200 && props.clientData.data !== state.clientData ) {
      return {
        clientData  : props.clientData.data,
        showLoader  : false
      }
    }

    return null
  }

  openAppointment = (obj) => {
    let status  = (obj.status) ? obj.status : ''

    if ( status ) {
      if ( status !== "noshow" && status !== "canceled" ) {
        if ( obj.id ) {
          window.open(`/appointment/view/` + obj.id)
        }
      }
    }
  }

  render() {
    let returnTo = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {

    }
    return (
      <div id="content">
         <div className="container-fluid content setting-wrapper">
            <div className="juvly-section full-width m-t-15">
               <div className="juvly-container">
                  <div className="juvly-title no-margin">{this.state.languageData.clientprofile_upcoming_appointments}
                     <Link to={returnTo} className="pull-right"><img src="../../../../images/close.png"/></Link>
                  </div>
                </div>
                <div className="table-responsive">
              		<table className="table-updated juvly-table table-min-width no-hover">
              			<thead className="table-updated-thead">
              				<tr>
              					<th className="col-xs-1 table-updated-th">{this.state.languageData.client_status}</th>
              					<th className="col-xs-2 table-updated-th">{this.state.languageData.client_service_name}</th>
              					<th className="col-xs-2 table-updated-th">{this.state.languageData.client_provider_name}</th>
              					<th className="col-xs-2 table-updated-th">{this.state.languageData.pro_clinic}</th>
                        <th className="col-xs-2 table-updated-th">{this.state.languageData.clientprofile_notes}</th>
              					<th className="col-xs-3 table-updated-th">{this.state.languageData.wallet_date}</th>
              				</tr>
              			</thead>
              			<tbody className="ajax_body">
              				{(this.state.clientData !== undefined && this.state.clientData.upcoming_appointments !== undefined && this.state.clientData.upcoming_appointments !== null && this.state.clientData.upcoming_appointments.length > 0 ) && this.state.clientData.upcoming_appointments.map((obj, idx) => {
                        let statusclassName = '';

                        if ( obj.display_status === 'Upcoming' ) {
                          statusclassName = "payment-Succeeded";
                        } else if ( obj.display_status === 'Cancelled' ) {
                          statusclassName = "payment-transit";
                        } else if ( obj.display_status === 'No Show' ) {
                          statusclassName = "payment-failed"
                        }

                        let serviceName = [];

                        (obj.appointment_services !== undefined && obj.appointment_services !== null && obj.appointment_services.length > 0) && obj.appointment_services.map((sobj, sidx) => {
                            serviceName.push(sobj.service.name)
                        })

                        return (
                          <tr key={idx} className={(obj.status !== "noshow" && obj.status !== "canceled" ) ? "table-updated-tr cursor-pointer" : "table-updated-tr" }  onClick={() => this.openAppointment(obj)}>
                					<td className="table-updated-td"><div className={statusclassName}>{capitalizeFirstLetter(obj.display_status)}</div></td>
                  					<td className="table-updated-td">{serviceName.join(', ')}</td>
                  					<td className="table-updated-td">{(obj.provider !== undefined && obj.provider !== null) ? capitalizeFirstLetter(obj.provider.firstname) + " " + capitalizeFirstLetter(obj.provider.lastname) : ''}</td>
                  					<td className="table-updated-td">{(obj.clinic !== undefined && obj.clinic !== null) ? obj.clinic.clinic_name : ''}</td>
                            <td className="table-updated-td">{(obj.appointment_note) ? obj.appointment_note.appointment_notes : ''}</td>
                  					<td className="table-updated-td">{(obj.appointment_datetime) ? showFormattedDate(obj.appointment_datetime, true) : ""}  to {(obj.appointment_endtime) ? obj.appointment_endtime : ''}</td>
                  				</tr>
                        )
                      })}

                      <tr className={(this.state.clientData.upcoming_appointments === undefined || this.state.clientData.upcoming_appointments.length === 0 ) ? "table-updated-tr" : "table-updated-tr no-display"}>
                         <td colSpan="6" className="text-center">{this.state.languageData.client_no_record_found}</td>
                      </tr>
              			</tbody>
              		</table>
               </div>
            </div>
         </div>
         <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader clientProfileLoader' : 'new-loader text-left'}>
           <div className="loader-outer">
             <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
             <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
           </div>
         </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState  = {};
  if ( state.ClientsReducer.action === "GET_CLIENT_DETAIL" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.clientData = state.ClientsReducer.data;
    }
  }
  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getClientDetail: getClientDetail}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (UpcomingAppointments);
