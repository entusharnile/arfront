import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import {getClientDetail, updateMedicalHistory} from '../../Actions/Clients/clientsAction.js';


class MedicalHistory extends Component {
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
      updateStatus      : null,
      languageData      : languageData.clients,
    }
  }

  componentDidMount() {
    this.setState({
      showLoader: true
    });

    this.state.clientScopes = 'medicalHistory';
    this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.updateStatus !== null && this.state.updateStatus !== '' && this.state.updateStatus !== prevState.updateStatus) {

      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
      this.setState({ showLoader: true });
    }
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.clientData !== undefined && props.clientData.status === 200 && props.clientData.data !== state.clientData ) {
      return {
        clientData                    : (state.dataChanged) ? state.clientData : props.clientData.data,
        showLoader                    : false,
        major_events                  : (state.dataChanged) ? state.major_events : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.major_events : '',
        smoking_status                : (state.dataChanged) ? state.smoking_status : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.smoking_status : '',
        ongoing_medical_problems      : (state.dataChanged) ? state.ongoing_medical_problems : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.ongoing_medical_problems : '',
        social_history                : (state.dataChanged) ? state.social_history : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.social_history : '',
        family_health_history         : (state.dataChanged) ? state.family_health_history : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.family_health_history : '',
        nutrition_history             : (state.dataChanged) ? state.nutrition_history : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.nutrition_history : '',
        preventive_care               : (state.dataChanged) ? state.preventive_care : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.preventive_care : '',
        development_history           : (state.dataChanged) ? state.development_history : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.development_history : '',
        drug_allergies                : (state.dataChanged) ? state.drug_allergies : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.drug_allergies : '',
        environmental_allergies       : (state.dataChanged) ? state.environmental_allergies : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.environmental_allergies : '',
        food_allergies                : (state.dataChanged) ? state.food_allergies : (props.clientData.data.medical_history) ? props.clientData.data.medical_history.food_allergies : '',
      }
    }

    if ( props.updateData !== undefined && props.updateData !== null && props.updateData.status === 200 && props.updateData.data !== state.updateData ) {
      return {
        updateData          : props.updateData.data,
        updateStatus        : props.updateData.data
      }
    }

    return null
  }

  handleInputChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;
     this.setState({[event.target.name]: value , dataChanged : true});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    let historyObject = {medical_history: []}

    historyObject['medical_history'].push({major_events: this.state.major_events, smoking_status: this.state.smoking_status, ongoing_medical_problems: this.state.ongoing_medical_problems, social_history: this.state.social_history, family_health_history: this.state.family_health_history, nutrition_history: this.state.nutrition_history, preventive_care: this.state.preventive_care, development_history: this.state.development_history, drug_allergies: this.state.drug_allergies, environmental_allergies: this.state.environmental_allergies, food_allergies: this.state.food_allergies, patient_id: this.state.clientID})

    this.setState({showLoader: true})
    this.props.updateMedicalHistory(historyObject)
  }

  render() {
    let returnTo    = '';
    let clientName  = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {

    }

    if ( this.state.clientData !== undefined ) {
      if ( this.state.clientData.firstname ) {
        clientName += this.state.clientData.firstname
      }

      if ( this.state.clientData.lastname ) {
        clientName += ' ' + this.state.clientData.lastname
      }

      clientName += ' - ' + this.state.languageData.clientprofile_medical_history;
    }

    return (
      <div id="content">
         <div className="container-fluid content setting-wrapper">
            <form onSubmit={this.handleSubmit}>
              <div className="juvly-section full-width m-t-15">
                 <div className="juvly-container">
                    {(this.state.showLoader === false) && <div className="juvly-title m-b-30">
                        {clientName}
                       <Link to={returnTo} className="pull-right"><img src="../../../../images/close.png"/></Link>
                    </div>}
                    <div className="row">
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_major_events}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.major_events !== undefined) ? this.state.major_events : '' } name="major_events"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_smoking_status}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.smoking_status !== undefined) ? this.state.smoking_status : '' } name="smoking_status"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_ongoing_problems}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.ongoing_medical_problems !== undefined) ? this.state.ongoing_medical_problems : '' } name="ongoing_medical_problems"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_social_history}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.social_history !== undefined) ? this.state.social_history : '' } name="social_history"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_family_health_history}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.family_health_history !== undefined) ? this.state.family_health_history : '' } name="family_health_history"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_nutritions_history}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.nutrition_history !== undefined) ? this.state.nutrition_history : '' } name="nutrition_history"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_preventive_care}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.preventive_care !== undefined) ? this.state.preventive_care : '' } name="preventive_care"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_development_history}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.development_history !== undefined) ? this.state.development_history : '' } name="development_history"></textarea>
                          </div>
                       </div>
                    </div>
                    <div className="juvly-subtitle">{this.state.languageData.client_allergies}</div>
                    <div className="row">
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_drug_allergy}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.drug_allergies !== undefined) ? this.state.drug_allergies : '' } name="drug_allergies"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_enviromental_allergy}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.environmental_allergies !== undefined) ? this.state.environmental_allergies : '' } name="environmental_allergies"></textarea>
                          </div>
                       </div>
                       <div className="col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                             <div className="new-field-label">{this.state.languageData.client_food_allergy}</div>
                             <textarea className="setting-textarea-box" cols="30" rows="4" onChange={this.handleInputChange} value={(this.state.clientData !== undefined && this.state.food_allergies !== undefined) ? this.state.food_allergies : '' } name="food_allergies"></textarea>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="footer-static">
                    <input className="new-blue-btn pull-right" type="submit" value={this.state.languageData.clientprofile_save}/>
                    <Link to={returnTo} className="new-white-btn pull-right cancelAction">{this.state.languageData.clientprofile_cancel}</Link>
                 </div>
              </div>
            </form>
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
    } else {
      returnState.clientData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "UPDATE_MEDICAL_HISTORY" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
    } else {
      returnState.updateData = state.ClientsReducer.data;
      toast.success(languageData.global[state.ClientsReducer.data.message]);
    }
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getClientDetail: getClientDetail, updateMedicalHistory: updateMedicalHistory}, dispatch);
}


export default connect(mapStateToProps, mapDispatchToProps) (MedicalHistory);
