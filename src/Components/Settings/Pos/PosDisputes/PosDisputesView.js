import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Select from 'react-select';
import { getPosDisputeDetails, exportEmptyData, addPosDisputeNote, acceptPosDispute } from '../../../../Actions/Settings/settingsActions.js';
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'
import PosDisputesEvidence from './PosDisputesEvidence.js'
import { numberFormat,getCurrencyLabel,toggleBodyScroll,showFormattedDate } from "../../../../Utils/services.js";

class PosDisputesView extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      backAction: '/settings/pos-disputes',
      disputeId:0,
      posDisputeData:{},
      disputeData:{},
      timeLineData:{},
      clientData:{},
      disputedAmount:0,
      disputeStatus:'',
      disputeSatusClass:'payment-transit',
      disputeReason:'',
      disputeReasonContent:'',
      isAdddDisputeNote:false,
      dispute_note:'',
      disputeNoteClass: 'setting-textarea-box',
      isShowAcceptdModal:false,
      showLoader:false,
      isShowEvidence:false
    }
  }

  componentDidMount() {
    this.setState({showLoader:true})
    const disputeId = this.props.match.params.disputeId;
    if(disputeId > 0){
      this.setState({disputeId:disputeId})
        this.props.getPosDisputeDetails(disputeId)
    } else {
      return (
        <div>
          {this.props.history.push(this.state.backAction)}
        </div>
      );
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.posDisputeData !== undefined && nextProps.posDisputeData !== prevState.posDisputeData) {
      returnState.posDisputeData = nextProps.posDisputeData;
      returnState.disputeData = returnState.posDisputeData.dispute_details;
      returnState.disputedAmount = (returnState.disputeData.disputed_amount !== undefined && returnState.disputeData.disputed_amount > 0) ? returnState.disputeData.disputed_amount : 0;
      returnState.disputeReason = prevState.globalLang['stripe_'+returnState.disputeData.dispute_reason];
      returnState.disputeReasonContent = returnState.posDisputeData.dispute_evidence_fields[returnState.disputeData.dispute_reason]['reason_info'];
      returnState.disputeStatus = prevState.globalLang['stripe_'+returnState.disputeData.dispute_status];
      returnState.disputeSatusClass = (returnState.disputeData.dispute_status === 'needs_response') ? 'payment-response' : (returnState.disputeData.dispute_status === 'won') ? 'payment-Succeeded' : 'payment-transit';
      returnState.timeLineData = returnState.posDisputeData.time_line_data;
      returnState.clientData = (returnState.posDisputeData.dispute_details.patient_data !== undefined) ? returnState.posDisputeData.dispute_details.patient_data : {}
      returnState.showLoader = false;
      returnState.dispute_note = '';
      returnState.disputeNoteClass = 'setting-textarea-box';
      returnState.isAdddDisputeNote = false;
      returnState.isShowAcceptdModal = false;
      toggleBodyScroll(false)
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      returnState.showLoaderStripeUpdate = false;
      nextProps.exportEmptyData();
    }
    return returnState
  }
  handleInputChange = (event) => {
    const target = event.target;
    this.setState({[target.name]:target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let error = false;
    if (typeof this.state.dispute_note === undefined || this.state.dispute_note === null || this.state.dispute_note === '') {
        this.setState({
            disputeNoteClass: 'setting-textarea-box field_error'
        })
        error = true;
    } else if (this.state.dispute_note) {
        this.setState({
            disputeNoteClass: 'setting-textarea-box'
        })
    }
    if(error){
      return;
    }
    this.setState({showLoader:true})
    this.props.addPosDisputeNote({
       dispute_note :  this.state.dispute_note,
       dispute_id:  this.state.disputeData.dispute_id
    })
  }

  handleAddDisputeNote = () => {
    this.setState({isAdddDisputeNote: !this.state.isAdddDisputeNote})
  }

  handleAcceptModal = () => {
    toggleBodyScroll(!this.state.isShowAcceptdModal)
    this.setState({isShowAcceptdModal: !this.state.isShowAcceptdModal})
  }

  handleAcceptDispute = () => {
    this.setState({showLoader:true})
    this.props.acceptPosDispute({
       stripe_user_id :  this.state.disputeData.stripe_user_id,
       dispute_id:  this.state.disputeData.dispute_id
    })
    this.handleAcceptModal();
  }

  PosDisputesEvidence = () => {
    this.setState({isShowEvidence:!this.state.isShowEvidence})
  }
  PosDisputesEvidenceType = (type) => {
    return (
      <div>
        {this.props.history.push(`/settings/pos-disputes/${this.state.disputeId}/evidence/${type}`)}
      </div>
    );
  }


  render() {
    return (
      <div className="main protected">
        <Header />
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            {(this.state.isShowEvidence === false) &&
              <div className="setting-setion">
                <div className="dispute-details-section">
                  <div className="setting-container">
                    <div className="setting-title m-b-20">{numberFormat(this.state.disputedAmount,'currency',2)}	<span className="dispute-usd">{getCurrencyLabel().toUpperCase()}</span>
                      <div className={this.state.disputeSatusClass +" dash-dispute"}>{this.state.disputeStatus} <i className="fa fa-exclamation-circle" /></div>
                    </div>
                    <div className="dispute-btns">
                      {(this.state.clientData.email !== undefined) &&
                        <a href={"mailto:" + this.state.clientData.email} className="new-white-btn">{this.state.settingsLang.pos_email_customer}</a>
                      }
                      {(this.state.posDisputeData.is_submit_accept === true) &&
                        <a href="javascript:void(0);" className="new-white-btn" onClick={this.PosDisputesEvidence} >{this.state.settingsLang.pos_submit_avidence}</a>
                      }
                      {(this.state.posDisputeData.is_submit_accept === true) &&
                        <a href="javascript:void(0);" className="new-white-btn" onClick={this.handleAcceptModal}>{this.state.settingsLang.pos_accept_dispute}</a>
                      }
                      <a href="javascript:void(0);" className="new-white-btn add-note-btn" onClick={this.handleAddDisputeNote}>{this.state.settingsLang.pos_add_note}</a>
                    </div>
                  </div>
                  {this.state.isAdddDisputeNote &&
                    <div className="setting-container add-note-section no-padding-top">
                      <div className="setting-title">
                        <a className="pull-right cancel-add-note" onClick={this.handleAddDisputeNote}><img src="/images/close.png" /></a>
                      </div>
                      <div className="setting-field-outer no-margin">
                        <div className="new-field-label">{this.state.globalLang.label_note}</div>
                        <textarea className={this.state.disputeNoteClass} id="dispute-note-textarea" name='dispute_note' value={this.state.dispute_note} onChange={this.handleInputChange} />
                        <button className="new-blue-btn note-btn" id="save-note-btn" onClick={this.handleSubmit}>{this.state.settingsLang.pos_save_note}</button>
                      </div>
                    </div>
                  }

                  {(this.state.timeLineData.length > 0) &&
                    <div className="dipute-status">
                      {this.state.timeLineData.map((obj,idx) => {
                        return (
                          (obj.is_system_log === true)
                          ?
                          <div key={'timeLineData-'+idx} className="dispute-row">
                            { (obj.content.toLowerCase() === 'payment disputed') ?
                              <div>
                                <i className={obj.icon_type} />
                                <p>{obj.content}</p>
                                <p>The cardholder doesn't recognize this charge and reported it as {obj.additional_data.dispute_reason}.</p>
                                <br />
                                <p><strong>Submit evidence to the cardholder's bank by {obj.additional_data.evidence_due_date} at {obj.additional_data.evidence_due_time}.</strong></p>
                              </div>
                              :
                              (obj.content.toLowerCase() === 'dispute evidence submitted') ?
                              <div>
                                <i className={obj.icon_type} />
                                <p>Dispute evidence is being reviewed by the cardholder’s bank,</p>
                                <p>We’ll email you <strong>by {showFormattedDate(obj.additional_data.dispute_submit_datetime, true)}</strong> with their decision.</p>
                              </div>
                              :
                              (obj.content.toLowerCase() === "payment received dispute inquiry") ?
                              <div>
                                <i className={obj.icon_type} />
                                <p>{obj.content}</p>
                                <p>The cardholder doesn't recognize this charge and reported it as {obj.additional_data.dispute_reason}.</p>
                                <p>No funds have been withdrawn from your account yet, but the cardholder's bank is requesting more information to decide whether to return these funds to the cardholder.</p>
                              </div>
                              :
                              (obj.content.toLowerCase() === "accepted dispute") ?
                              <div>
                                <i className={obj.icon_type} />
                                <p>{obj.content}</p>
                                <p>You chose to accept this dispute, therefore the cardholder kept the disputed amount.</p>
                              </div>
                              :
                              <div>
                                <i className={obj.icon_type} />
                                <p>{obj.content}</p>
                              </div>
                            }
                            <div className="dispute-date">{showFormattedDate(obj.show_date_time,true)}</div>
                          </div>
                          :
                          <div key={'timeLineData-'+idx} className="dispute-row">
                            <i className={obj.icon_type} />
                            <p>{obj.content}</p>
                            <div className="dispute-date">{showFormattedDate(obj.show_date_time,true)} by {obj.user_info}</div>
                          </div>
                        )
                      })
                    }
                    </div>
                  }

                  <div className="setting-container">
                    <div className="setting-title m-b-20">{this.state.settingsLang.pos_dispute_details}</div>
                    <div className="dispute-detail row">
                      <label className="col-md-3 col-sm-6 col-xs-12">{this.state.settingsLang.pos_disputed_invoice}</label>
                      <span className="col-md-9 col-sm-6 col-xs-12">{this.state.disputeData.invoice_number}</span>
                    </div>
                    <div className="dispute-detail row">
                      <label className="col-md-3 col-sm-6 col-xs-12">{this.state.settingsLang.pos_disputed_amount}</label>
                      <span className="col-md-9 col-sm-6 col-xs-12">{numberFormat(this.state.disputedAmount,'currency',2)}</span>
                    </div>
                    <div className="dispute-detail row">
                      <label className="col-md-3 col-sm-6 col-xs-12">{this.state.settingsLang.setting_payment_date}</label>
                      <span className="col-md-9 col-sm-6 col-xs-12">{showFormattedDate(this.state.disputeData.payment_datetime,true)}</span>
                    </div>
                    <div className="dispute-detail row">
                      <label className="col-md-3 col-sm-6 col-xs-12">{this.state.settingsLang.pos_dispute_date}</label>
                      <span className="col-md-9 col-sm-6 col-xs-12">{showFormattedDate(this.state.disputeData.created_on,true)}</span>
                    </div>
                    <div className="dispute-detail row">
                      <label className="col-md-3 col-sm-6 col-xs-12">{this.state.globalLang.label_client}</label>
                      <span className="col-md-9 col-sm-6 col-xs-12">{this.state.clientData.firstname+" "+this.state.clientData.lastname}</span>
                    </div>
                    <div className="dispute-detail row">
                      <label className="col-md-3 col-sm-6 col-xs-12">{this.state.settingsLang.pos_card_number}</label>
                      <span className="col-md-9 col-sm-6 col-xs-12">**** **** **** {this.state.disputeData.card_number}</span>
                    </div>
                  </div>
                </div>
                <Loader showLoader={this.state.showLoader} />
              </div>
            }
            {(this.state.isShowEvidence === true) &&
              <PosDisputesEvidence
                PosDisputesEvidenceType={this.PosDisputesEvidenceType}
                PosDisputesEvidence={this.PosDisputesEvidence}
                disputeReason={this.state.disputeReason}
                disputeReasonContent={this.state.disputeReasonContent}
               />
            }
          </div>
          {/* Resotre Modal - START */}
          <div className={(this.state.isShowAcceptdModal) ? 'overlay' : ''} ></div>
          <div id="filterModal" role="dialog" className={(this.state.isShowAcceptdModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.handleAcceptModal}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.globalLang.delete_confirmation}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.settingsLang.dispute_acceptance_msg}</div>
                <div className="modal-footer">
                  <div className="col-md-12 text-left" id="footer-btn">
                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.handleAcceptModal}>{this.state.globalLang.label_cancel}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.handleAcceptDispute}>{this.state.globalLang.label_accept}</button>
                  </div>
                </div>
              </div>
            </div>
            <Loader showLoader={this.state.showLoaderAcceptdModal} />
          </div>
          {/* Resotre Modal - END */}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "POS_DISPUTE_DETAIL") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posDisputeData = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "ADD_POS_DISPUTE_NOTE") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.showLoader = false;
      //returnState.posDisputeData = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "ACCEPT_POS_DISPUTE") {
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        toast.error(state.SettingReducer.data.data);
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
      }
      returnState.showLoader = false;
    } else {
      //returnState.posDisputeData = state.SettingReducer.data.data;
      returnState.showLoader = false;
    }
  } else if (state.SettingReducer.action === "EMPTY_DATA") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getPosDisputeDetails: getPosDisputeDetails,
    addPosDisputeNote:addPosDisputeNote,
    acceptPosDispute:acceptPosDispute,
     exportEmptyData: exportEmptyData
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosDisputesView);
