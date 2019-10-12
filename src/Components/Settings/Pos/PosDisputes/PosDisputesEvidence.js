import React, { Component } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { getAccountDetails, updateAccountDetails } from '../../../../Actions/Settings/settingsActions.js';
import Header from '../../../../Containers/Protected/Header.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'

class PosDisputesEvidence extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      disputeReason:'',
      disputeReasonContent:''
    }
  }

  componentDidMount() {

  }

  static getDerivedStateFromProps(props, state) {
    return null
  }
  PosDisputesEvidenceType = (type) => {
    this.props.PosDisputesEvidenceType(type)
  }

  render() {
    return (
      <div className="setting-setion">
        <div className="setting-container no-padding-bottom">
          <div className="setting-title">
            <a className="pull-right back-dispute-details" onClick={this.props.PosDisputesEvidence}><img src="/images/close.png" /></a>
          </div>
          <div className="row">
            <div className="col-md-5 m-b-40">
              <div className="wht-todo-title">{this.state.settingsLang.pos_dispute_reason}: {this.props.disputeReason}</div>
              <p className="l-h-auto p-text text-justify no-margin">{this.props.disputeReasonContent}</p>
            </div>
            <div className="col-md-7 m-b-40">
              <div className="wht-todo-title">{this.state.settingsLang.pos_what_to_do}:</div>
              <p className="l-h-auto p-text text-justify no-margin">{this.state.settingsLang.pos_dispute_what_to_do_notes}</p>
            </div>
          </div>
        </div>
        <div className="setting-container border-top">
          <div className="setting-title m-b-40">{this.state.settingsLang.pos_i_provided_the_customer_with}</div>
          <div className="provide-customer-with show-evidence-fields" onClick={this.PosDisputesEvidenceType.bind(this,'physical')}>
            <span>{this.state.settingsLang.pos_physical_products}</span>
            <p className="p-text service-desc no-margin">{this.state.settingsLang.pos_physical_products_notes}</p>
            <i className="fas fa-angle-right" />
          </div>
          <div className="provide-customer-with show-evidence-fields" onClick={this.PosDisputesEvidenceType.bind(this,'digital')}>
            <span>{this.state.settingsLang.pos_digital_products}</span>
            <p className="p-text service-desc no-margin">{this.state.settingsLang.pos_digital_products_notes}</p>
            <i className="fas fa-angle-right" />
          </div>
          <div className="provide-customer-with show-evidence-fields" onClick={this.PosDisputesEvidenceType.bind(this,'offline')}>
            <span>{this.state.settingsLang.pos_offline_services}</span>
            <p className="p-text service-desc no-margin">{this.state.settingsLang.pos_offline_services_notes}</p>
            <i className="fas fa-angle-right" />
          </div>
          <p className="m-t-40 p-text">{this.state.settingsLang.pos_dispute_avidence_boottom_notes} <strong>{this.state.settingsLang.pos_dispute_avidence_boottom_notes_strong}</strong></p>
        </div>
      </div>
    );
  }
}

export default PosDisputesEvidence;
