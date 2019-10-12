import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { fetchProcedureConsents }from '../../../Actions/Settings/settingsActions.js';
import { SketchField, Tools } from 'react-sketch';
import axios from 'axios';
import crossImg from '../../../images/close.png';
import { displayName, capitalizeFirstLetter } from '../../../Utils/services.js';


class ProcedureConsentsDetail extends Component {
  constructor(props){
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state={
      id:props.match.params.id,
      consentsAllData:[],
      consentSingleData:[],
      roomType  : this.props.match.url.split('/')[1],
      action    : (props.match.params.type) ? props.match.params.type : 'pending',
      showLoader            : true,
      globalLang            : languageData.global,
      returnTo: ''
    }
  }
  componentDidMount(){
    this.setState({showLoader: true})
    this.props.fetchProcedureConsents(this.state.id)
    let returnTo = ''
    if ( this.state.roomType && this.state.roomType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.roomType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.roomType
    } else {
      returnTo = (this.state.action) ? "/" + this.state.roomType + "/" + this.state.action  : 'pending'
    }
    this.setState({returnTo: returnTo})
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('nextProps',nextProps);
    if ( nextProps.consentsData !== undefined && nextProps.consentsData.status === 200 && nextProps.consentsData.data.consents !== prevState.consentsAllData ) {
      return {
        consentsAllData : nextProps.consentsData.data.consents,
        procedureData   : nextProps.consentsData.data.procedure_data,
        showLoader      : false
      }
    } else if ( nextProps.consentsData !== undefined && nextProps.consentsData.status !== 200 && nextProps.consentsData.data && nextProps.consentsData.data.consents !== prevState.consentsAllData ) {
      return {
        consentsAllData : nextProps.consentsData.data.consents,
        procedureData   : nextProps.consentsData.data.procedure_data,
        showLoader      : false
      }
    } else if( nextProps.consentsData !== undefined && nextProps.consentsData.status !== 200 && nextProps.consentsData.data === null && nextProps.isRedirect === true){
      nextProps.history.push(prevState.returnTo);
    }
    return null
  }

  editConsents = () => {
    return (
      <div>
        {this.props.history.push(`/clients/consent/edit/${this.props.match.params.id}/${this.props.match.params.clientID}/profile`)}
      </div>
    )
  }

  render() {
    let returnTo = this.state.returnTo;
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
                  <div className="juvly-title m-b-30">{(this.state.procedureData && this.state.procedureData.patient) && displayName(this.state.procedureData.patient) + ` - `} {(this.state.procedureData && this.state.procedureData.procedure_name) && capitalizeFirstLetter(this.state.procedureData.procedure_name) + ` - `}Consents Details
                     <Link to={returnTo} className="pull-right"><img src={crossImg} /></Link>
                  </div>
{(this.state.consentsAllData)? this.state.consentsAllData.map((obj,idx)=>{

  return(
  <div style={{paddingTop: '50px'}} key={idx}>
                  <div className="juvly-subtitle"> {obj.consent.consent_name} </div>
                  <p className="p-text">
{obj.consent.consent_large_description}
                  </p>
                  <img src={obj.signature_image_url} className="consent-signature" /></div>)}) : null}

               </div>
               {(this.state.action === 'profile') &&
                <div class="footer-static">
                  <button class="new-blue-btn pull-right" type="button" onClick={this.editConsents} >Edit</button>
                 </div>
                }
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

  if (state.SettingReducer.action === "PROCEDURE_CONSENTS") {
    if (state.SettingReducer.data.status === 200) {
      return {
        consentsData: state.SettingReducer.data
      }
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      let returnState = {consentsData : state.SettingReducer.data}
      if(state.SettingReducer.data.message === 'validation_procedure_id_invalid'){
        returnState.isRedirect = true
      }
      return returnState
    }
    return {};
  }  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchProcedureConsents:fetchProcedureConsents},dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProcedureConsentsDetail);
