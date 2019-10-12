import React, { Component } from "react";
import { numberFormat } from "../../../../Utils/services.js";

class SubscriptionMonthlyEstimate extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      isShowEstimatedUser: false,
      isShowEstimatedSms: false,
      isShowEstimatedEmail: false,
      isShowEstimatedData: false,
      estimatedData: {},
      userChanged:false
    };
  }

  componentDidMount() {

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.estimatedData != undefined && nextProps.estimatedData !== prevState.estimatedData) {
        returnState.estimatedData = nextProps.estimatedData;
        returnState.isShowEstimatedUser =  false;
        returnState.isShowEstimatedSms =  false;
        returnState.isShowEstimatedEmail =  false;
        returnState.isShowEstimatedData =  false;
    }
    return returnState;
  }


  toggleState = (type) => {
    this.setState({ [type]: !this.state[type],userChanged:true});
  }


  render() {
    return (
      <div className="plan-estimate-block">
        <div className="profile accordion-row">
          <div className="accordian-section col-xs-6 text-left inner-box" onClick={this.toggleState.bind(this, 'isShowEstimatedUser')}>
            <a className={(this.state.estimatedData.user_array.length > 0 && this.state.isShowEstimatedUser) ? 'toggle-angle' : 'toggle-angle no-display'}><i id="icon-1" className="fa dasdasd fa-angle-up" /></a>
            <a className={(this.state.estimatedData.user_array.length > 0 && !this.state.isShowEstimatedUser) ? 'toggle-angle' : 'toggle-angle no-display'}><i id="icon-1" className="fa dasdasd fa-angle-down" /></a>
            {this.state.settingsLang.subscription_your_monthly_subscription_for} {this.state.estimatedData.user_array.length} {this.state.settingsLang.subscription_users}
          </div>
          <div className="accordian-section col-xs-6 text-right">{(this.state.estimatedData.user_sum <= 0) ? '$0.00' : numberFormat(this.state.estimatedData.user_sum, 'currency', 2)}</div>
        </div>

          {this.state.isShowEstimatedUser && this.state.estimatedData.user_array.map((userObj, userIndx) => {
            return (
              <div key={'monthly-users-' + userIndx} className="accordion-row profile" style={{ display: 'table-row' }}>
                <div className="accordian-section col-xs-6 text-left dash-icon">{userObj.name}</div>
                <div className="accordian-section col-xs-6 text-right">{(userObj.amount <= 0) ? '$0.00' : numberFormat(userObj.amount, 'currency', 2)}</div>
              </div>
            )
          })
          }

        <div className="accordion-row profile">
          <div className="accordian-section col-xs-6 text-left inner-box" onClick={this.toggleState.bind(this, 'isShowEstimatedEmailModal')}>
            <a className={(this.state.estimatedData.addon_array.email.total_additional_units > 0 && this.state.isShowEstimatedEmailModal) ? 'toggle-angle' : 'toggle-angle no-display'}><i id="icon-1" className="fa dasdasd fa-angle-up" /></a>
            <a className={(this.state.estimatedData.addon_array.email.total_additional_units > 0 && !this.state.isShowEstimatedEmailModal) ? 'toggle-angle' : 'toggle-angle no-display'}><i id="icon-1" className="fa dasdasd fa-angle-down" /></a>
            {this.state.settingsLang.subscription_email_charges_for_additional_purchase} {this.state.estimatedData.addon_array.email.total_additional_units > 0 && this.state.estimatedData.addon_array.email.total_additional_units+' '+this.state.settingsLang.subscription_email}</div>
          <div className="accordian-section col-xs-6 text-right">{(this.state.estimatedData.addon_array.email.total_additional_cost <= 0) ? '$0.00' : numberFormat(this.state.estimatedData.addon_array.email.total_additional_cost, 'currency', 2)}</div>
        </div>
        {this.state.isShowEstimatedEmailModal && this.state.estimatedData.addon_array.email.additional_units_detail.map((emailObj, emailIndx) => {
          return (
            <div key={'monthly-email-' + emailIndx} className="accordion-row profile" style={{ display: 'table-row' }}>
              <div className="accordian-section col-xs-6 text-left dash-icon">{emailObj.detail}</div>
              <div className="accordian-section col-xs-6 text-right">{(emailObj.amount <= 0) ? '$0.00' : numberFormat(emailObj.amount, 'currency', 2)}</div>
            </div>
          )
        })
        }

        <div className="accordion-row profile">
          <div className="accordian-section col-xs-6 text-left inner-box" onClick={this.toggleState.bind(this, 'isShowEstimatedSmsModal')}>
            <a className={(this.state.estimatedData.addon_array.sms.total_additional_units > 0 && this.state.isShowEstimatedSmsModal) ? 'toggle-angle' : 'toggle-angle no-display'}><i id="icon-1" className="fa dasdasd fa-angle-up" /></a>
            <a className={(this.state.estimatedData.addon_array.sms.total_additional_units > 0 && !this.state.isShowEstimatedSmsModal) ? 'toggle-angle' : 'toggle-angle no-display'}><i id="icon-1" className="fa dasdasd fa-angle-down" /></a>
            {this.state.settingsLang.subscription_sms_charges_for_additional_purchase} {this.state.estimatedData.addon_array.sms.total_additional_units > 0 && this.state.estimatedData.addon_array.sms.total_additional_units +' '+this.state.settingsLang.subscription_sms}</div>
          <div className="accordian-section col-xs-6 text-right">{(this.state.estimatedData.addon_array.sms.total_additional_cost <= 0) ? '$0.00' : numberFormat(this.state.estimatedData.addon_array.sms.total_additional_cost, 'currency', 2)}</div>
        </div>
        {this.state.isShowEstimatedSmsModal && this.state.estimatedData.addon_array.sms.additional_units_detail.map((smsObj, smsIndx) => {
          return (
            <div key={'monthly-sms-' + smsIndx} className="accordion-row profile" style={{ display: 'table-row' }}>
              <div className="accordian-section col-xs-6 text-left dash-icon">{smsObj.detail}</div>
              <div className="accordian-section col-xs-6 text-right">{(smsObj.amount <= 0) ? '$0.00' : numberFormat(smsObj.amount, 'currency', 2)}</div>
            </div>
          )
        })
        }

        <div className="accordion-row profile">
          <div className="accordian-section col-xs-6 text-left inner-box" onClick={this.toggleState.bind(this, 'isShowEstimatedDataModal')}>
            <a className={(this.state.estimatedData.addon_array.storage.total_additional_units > 0 && this.state.isShowEstimatedDataModal) ? 'toggle-angle' : 'toggle-angle no-display'}><i id="icon-1" className="fa dasdasd fa-angle-up" /></a>
            <a className={(this.state.estimatedData.addon_array.storage.total_additional_units > 0 && !this.state.isShowEstimatedDataModal) ? 'toggle-angle' : 'toggle-angle no-display'}><i id="icon-1" className="fa dasdasd fa-angle-down" /></a>
            {this.state.settingsLang.subscription_storage_charges_for_additional_purchase} {this.state.estimatedData.addon_array.storage.total_additional_units > 0 && this.state.estimatedData.addon_array.storage.total_additional_units +' '+this.state.settingsLang.subscription_gb} </div>
          <div className="accordian-section col-xs-6 text-right">{(this.state.estimatedData.addon_array.storage.total_additional_cost <= 0) ? '$0.00' : numberFormat(this.state.estimatedData.addon_array.storage.total_additional_cost, 'currency', 2)}</div>
        </div>
        {this.state.isShowEstimatedDataModal && this.state.estimatedData.addon_array.storage.additional_units_detail.map((dataObj, dataIndx) => {
          return (
            <div key={'monthly-data-' + dataIndx} className="accordion-row profile" style={{ display: 'table-row' }}>
              <div className="accordian-section col-xs-6 text-left dash-icon">{dataObj.detail}</div>
              <div className="accordian-section col-xs-6 text-right">{(dataObj.amount <= 0) ? '$0.00' : numberFormat(dataObj.amount, 'currency', 2)}</div>
            </div>
          )
        })
        }
      </div>);
  }
}


export default (SubscriptionMonthlyEstimate)
