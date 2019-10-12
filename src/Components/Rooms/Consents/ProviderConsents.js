import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { fetchProcedureConsents }from '../../../Actions/Settings/settingsActions.js';
import { SketchField, Tools } from 'react-sketch';
import axios from 'axios';



class ProviderConsents extends Component {
  constructor(props){
    super(props);
    this.state={
      id:props.match.params.id,
      consentsAllData:[],
      consentSingleData:[],
      roomType          : this.props.match.url.split('/')[1],
    }
  }
  componentDidMount(){
    let formData={

    }
this.props.fetchProcedureConsents(this.state.id)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.consentsData !== undefined && nextProps.consentsData.consents.length >0) {
      return {
        consentsAllData : nextProps.consentsData.consents,

      }
    }
  }
  render() {
    return (
 <div id="content">
         <div className="container-fluid content setting-wrapper">
            <div className="row duplicate-patient-title">
               <div className="right-create-patient col-sm-9 profile-right">
               <div id="main_form_copy no-display">
               <form id="app_form_copy" action="/appointments/index" method="post" target="_blank">
               <input type="hidden" id="create_app_patient_id" name="patient_id_for_open_poupup" />
               </form>
               </div>
               </div>
            </div>
            <div className="juvly-section full-width m-t-15">
               <div className="juvly-container">
                  <div className="juvly-title m-b-30">Procedure #1 - Consents Details
                     <a data-url="/settings/user" className="pull-right"><img src="images/close.png" /></a>
                  </div>
{(this.state.consentsAllData)? this.state.consentsAllData.map((obj,idx)=>{
  return(
  <div>
                  <div className="juvly-subtitle"> {obj.consent.consent_name} </div>
                  <p className="p-text">
{obj.consent.consent_large_description}
                  </p>
                  <img src={obj.signature_image} className="consent-signature" /></div>)}) : null}

               </div>
            </div>
         </div>
      </div>

    )
  }
}
function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));

  if (state.SettingReducer.action === "PROCEDURE_CONSENTS") {
    if (state.SettingReducer.data.status === 200) {
      return {
        consentsData: state.SettingReducer.data.data
      }
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    return {};
  }  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchProcedureConsents:fetchProcedureConsents},dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProviderConsents);
