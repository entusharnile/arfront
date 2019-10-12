import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import axios from 'axios';
import "react-datepicker/dist/react-datepicker.css";
import { emptyProcedureReducer, getProcedurePrescription } from '../../Actions/Procedures/procedureActions.js';
import crossImage from '../../images/close.png';

const procedureInstance = axios.create();
procedureInstance.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  if (!error.response) {
    return { data: { data: "", message: "file_type_error", status: 400 } }
  }
});

class ProcedurePrescriptions extends Component {
  constructor(props) {
    super(props);

    const languageData = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType: (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      action: (this.props.match.params.type) ? this.props.match.params.type : 'pending',
      clientID: this.props.match.params.clientID,
      procedureID: (this.props.match.params.procedureID) ? this.props.match.params.procedureID : 0,
      globalLang: languageData.global,
      returnTo: '',
      showModal: false,
      showLoader: false,
      prescriptionData: {},
      selectedConsentsOptions: [],
      consentsOptions: [],
      prescriptionList: [],
      patient_name: '',
      procedure_name: ''

    }
  }

  componentDidMount() {
    this.setState({ showLoader: true })
    this.props.getProcedurePrescription(this.state.procedureID)

    let returnTo = '';

    if (this.state.backURLType && this.state.backURLType === 'clients') {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID : "/" + this.state.backURLType
    } else if (this.state.backURLType && this.state.backURLType === 'provider-room') {
      returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.state.action : 'pending'
    } else if (this.state.backURLType && this.state.backURLType === 'md-room') {
      returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.state.action : 'pending'
    }
    this.setState({ returnTo: returnTo })
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}
    if (nextProps.prescriptionData !== undefined && nextProps.prescriptionData !== prevState.prescriptionData) {
      returnState.showLoader = false
      returnState.prescriptionData = nextProps.prescriptionData
      returnState.patient_name = nextProps.prescriptionData.patient_name
      returnState.procedure_name = nextProps.prescriptionData.procedure_name
      returnState.prescriptionList = nextProps.prescriptionData.prescription
      nextProps.emptyProcedureReducer()
    } else if (nextProps.showLoader !== undefined && nextProps.showLoader === false) {
      returnState.showLoader = false
      nextProps.emptyProcedureReducer()
    } else if (nextProps.redirect !== undefined && nextProps.redirect === true) {
      nextProps.emptyProcedureReducer()
      toast.success(nextProps.message)
      nextProps.history.push(prevState.returnTo);
    } else if (nextProps.procedureNotFound !== undefined && nextProps.procedureNotFound === true) {
      setTimeout(function () {
        nextProps.history.push(prevState.returnTo);
      }, 1700)
    }

    return returnState
  }


  render() {
    let patientName = (this.state.prescriptionData && this.state.prescriptionData.patient_name) ? this.state.prescriptionData.patient_name : ''
    let procedureName = (this.state.prescriptionData && this.state.prescriptionData.procedure_name) ? this.state.prescriptionData.procedure_name : ''


    return (
      <div id="content" className="content-health-timeline-procedure">
        <form action="javascript:void(0);">
          <div className="container-fluid content setting-wrapper add-edit-procedure">
            <div className="juvly-section full-width m-t-15">
              <div className="juvly-container">


                <div className="juvly-title m-b-20">
                  {(this.state.showLoader === false) ? (patientName + ' - ' + procedureName + ' - Prescription Details') : ''}
                  <Link to={this.state.returnTo} className="pull-right"><img src={crossImage} /></Link>
                </div>

              </div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="table-responsive min-h-200">
                    <table className={(this.state.prescriptionList.length > 0) ? "table-updated setting-table min-w-1000 ajax-view" : "table-updated setting-table min-w-1000 ajax-view  border-bottom-none"}>
                      <thead className="table-updated-thead">
                        <tr>
                          <th className="col-xs-5 table-updated-th">Medicine Name</th>
                          <th className="col-xs-3 table-updated-th">Dosage</th>
                          <th className="col-xs-2 table-updated-th">Frequency</th>
                          <th className="col-xs-2 table-updated-th">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="patient-list">

                        {(this.state.prescriptionList.length > 0) ? this.state.prescriptionList.map((obj, idx) => {
                          return (
                            <tr key={'prescriptionList-' + idx}>
                              <td className="col-xs-5 table-updated-td" >{obj.medicine_name}</td>
                              <td className="col-xs-3 table-updated-td" >{obj.dosage}</td>
                              <td className="col-xs-2 table-updated-td" >{obj.frequency}</td>
                              <td className="col-xs-2 table-updated-td" >{obj.duration}</td>
                            </tr>
                          )
                        }) :
                          <tr>
                            <td className="col-xs-12 table-updated-td text-center" colSpan={4}>Sorry, No record found</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>



            </div>
          </div>
        </form>
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
  const returnState = {};

  if (state.ProcedureReducer.action === 'GET_HEALTH_PROCEDURE_PRESCRIPTION') {
    if (state.ProcedureReducer.data.status !== 200) {
      toast.dismiss()
      toast.error(languageData.global[state.ProcedureReducer.data.message]);
      if (state.ProcedureReducer.data.message === 'procedure_not_found') {
        returnState.message = languageData.global[state.ProcedureReducer.data.message]
        returnState.procedureNotFound = true
      } else {
        returnState.showLoader = false
      }
    } else {
      returnState.prescriptionData = state.ProcedureReducer.data.data
    }
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getProcedurePrescription: getProcedurePrescription, emptyProcedureReducer: emptyProcedureReducer }, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps)(ProcedurePrescriptions);
