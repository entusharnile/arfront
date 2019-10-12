import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import {getClientDetail, refundFees} from '../../Actions/Clients/clientsAction.js';
import { capitalizeFirstLetter, numberFormat, displayName, showFormattedDate } from '../../Utils/services.js';


class PaymentHistory extends Component {
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
      tabType           : (this.props.match.params.tabType) ? this.props.match.params.tabType : 'invoices',
      apptTransactionID : 0,
      showModal         : false,
      languageData      : languageData.clients,
    }
  }

  componentDidMount() {
    this.setState({
      showLoader: true
    });

    this.state.clientScopes = (this.props.match.params.tabType === 'invoices') ? 'posInvoice' : 'cancelationChargeHistory';
    this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.clientData !== undefined && props.clientData.status === 200 && props.clientData.data !== state.clientData ) {
      return {
        clientData  : props.clientData.data,
        showLoader  : false,
        showModal   : false
      }
    }

    if ( props.refundFeeData !== undefined && props.refundFeeData.status === 200 && props.refundFeeData.data !== state.refundFeeData ) {
       return {
         refundFeeData      : props.refundFeeData.data,
         showLoader         : false,
         refundFeeStatus    : props.refundFeeData.data,
         apptTransactionID  : 0
       }

     } else if ( props.refundFeeData !== undefined && props.refundFeeData.status !== 200 && props.refundFeeData.data !== state.refundFeeData ) {
       return {
         refundFeeData      : props.refundFeeData.data,
         showLoader         : false,
         refundFeeStatus    : '',
         apptTransactionID  : 0
       }
     }


    return null
  }

  changeTab = (tabType) => {
    let scope = '';

    if ( tabType && tabType === 'invoices' ) {
      scope = 'posInvoice';
    } else {
      scope = 'cancelationChargeHistory';
    }

    this.props.history.push(`/${this.state.backURLType}/payment-history/${this.props.match.params.clientID}/${this.props.match.params.type}/${tabType}`);

    this.setState({
      showLoader  : true,
      tabType     : tabType,
      clientScopes: scope
    });

    this.props.getClientDetail(this.state.clientID, scope);
  }

  getInvoiceDetails = (invoiceID) => {
    return (
      <div>
        {this.props.history.push(`/clients/invoice/${invoiceID}/${this.state.clientID}/payment-history`)}
      </div>
    )
  }

  issueRefund = (apptTransactionID) => {
    if ( apptTransactionID ) {
      this.setState({apptTransactionID: apptTransactionID, showModal: true})
    }
  }

  dismissModal = () => {
    this.setState({apptTransactionID: 0, showModal: false})
  }

  handleModalAction = () => {
    if ( this.state.apptTransactionID && this.state.clientID ) {
      let formData = {
        trans_id: this.state.apptTransactionID,
        patient_id: this.state.clientID
      }

      this.setState({showLoader: true, showModal: false})
      this.props.refundFees(formData);
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if ( this.state.refundFeeData !== null && this.state.refundFeeData !== '' && this.state.refundFeeData !== prevState.refundFeeData && this.state.refundFeeStatus !== null && this.state.refundFeeStatus !== '' ) {
      this.setState({
        showLoader: true
      });

      this.state.clientScopes = (this.props.match.params.tabType === 'invoices') ? 'posInvoice' : 'cancelationChargeHistory';
      this.props.getClientDetail(this.state.clientID, this.state.clientScopes);
    }
  }


  render() {
    let returnTo = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {

    }
    let patientName   = (this.state.clientData) ? displayName(this.state.clientData) : ''
    return (
      <div id="content">
         <div className="container-fluid content setting-wrapper">
            <div className="juvly-section full-width m-t-15">
               <div className="juvly-container">
                  {(this.state.showLoader === false) && <div className="juvly-title no-margin">{patientName} - {this.state.languageData.clientprofile_payment_history}
                     <Link to={returnTo} className="pull-right"><img src="../../../../images/close.png"/></Link>
                  </div>}
                </div>
                <ul className="sub-menus activity-menu">
              		{(this.state.clientData !== undefined) && <div className="sales-relation">
              			<label>{this.state.languageData.client_total_sales_relation} </label> {numberFormat(this.state.clientData.total_sale_relationship, 'currency')}
              		</div>}
              		<li className={(this.state.tabType === 'invoices') ? 'active' : ''}><a onClick={() => this.changeTab('invoices')}>{this.state.languageData.client_invoices}</a></li>
              		<li className={(this.state.tabType === 'cancellation_charges') ? 'active' : ''}><a onClick={() => this.changeTab('cancellation_charges')}>{this.state.languageData.client_cancelation_charges}</a></li>
              	</ul>

                <div className={(this.state.showModal === true ) ? 'overlay' : ''}></div>
                <div id="filterModal" role="dialog" className={(this.state.showModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                        <h4 className="modal-title">{this.state.languageData.client_conf_requierd}</h4>
                      </div>
                      <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                        {this.state.languageData.client_refund_fee_message}
                      </div>
                      <div className="modal-footer" >
                        <div className="col-md-12 text-left">
                          <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.languageData.client_no}</button>
                          <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.handleModalAction}>{this.state.languageData.client_yes}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
              		<table className={(this.state.tabType && this.state.tabType === 'invoices') ? "table-updated juvly-table table-min-width" : "table-updated juvly-table table-min-width no-display"}>
              			<thead className="table-updated-thead">
              				<tr>
                      <th className="col-xs-1 table-updated-th">{this.state.languageData.client_invoice_number}</th>
                      <th className="col-xs-2 table-updated-th">{this.state.languageData.pro_pro_name}</th>
                      <th className="col-xs-2 table-updated-th">{this.state.languageData.pro_pro_date}</th>
                      <th className="col-xs-1 table-updated-th">{this.state.languageData.client_total_amount}</th>
                      <th className="col-xs-1 table-updated-th">{this.state.languageData.client_payment_mode}</th>
                      <th className="col-xs-1 table-updated-th">{this.state.languageData.client_payment_status}</th>
                      <th className="col-xs-2 table-updated-th">{this.state.languageData.client_charged_on}</th>
              				</tr>
              			</thead>
              			<tbody className="ajax_body">
                      {(this.state.clientData !== undefined && this.state.clientData.pos_invoice !== undefined && this.state.clientData.pos_invoice !== null && this.state.clientData.pos_invoice.length > 0 ) && this.state.clientData.pos_invoice.map((obj, idx) => {
                        let paymentMode   = '';
                        let invoiceStatus = '';

                        if ( obj.pos_transaction && obj.pos_transaction !== null && obj.pos_transaction !== undefined ) {
                          if ( obj.pos_transaction.payment_mode === 'cc' ) {
                            paymentMode = 'Credit card';
                          } else if ( obj.pos_transaction.payment_mode === 'care_credit' ) {
                            paymentMode = 'Care Credit';
                          } else {
                            paymentMode = capitalizeFirstLetter(obj.pos_transaction.payment_mode)
                          }
                        }

                        if ( obj.invoice_status && obj.invoice_status !== undefined ) {
                          if ( obj.invoice_status === 'refunded' ) {
                            invoiceStatus = 'Void';
                          } else {
                            invoiceStatus = capitalizeFirstLetter(obj.invoice_status)
                          }
                        }
                         return (
                          <tr key={idx} className="table-updated-tr" onClick={this.getInvoiceDetails.bind(this, obj.id)}>
                            <td className="table-updated-td">{obj.invoice_number}</td>
                            <td className="table-updated-td">{(obj.procedure && obj.procedure !== null) ? obj.procedure.procedure_name : ''}</td>
                            <td className="table-updated-td">{(obj.procedure && obj.procedure !== null) ? showFormattedDate(obj.procedure.procedure_date, true) : ''}</td>
                            <td className="table-updated-td">{(obj.total_amount) ? numberFormat(obj.total_amount, 'currency') : numberFormat(0.00, 'currency')}</td>
                            <td className="table-updated-td">{paymentMode}</td>
                            <td className="table-updated-td">{invoiceStatus}</td>
                            <td className="table-updated-td">{(obj.system_payment_datetime) ? showFormattedDate(obj.system_payment_datetime, true) : ''}</td>
                          </tr>
                          )
                        })}
                      {(this.state.showLoader === false) && <tr className={(this.state.clientData.pos_invoice === undefined || this.state.clientData.pos_invoice.length === 0  && this.state.tabType) ? "table-updated-tr" : "table-updated-tr no-display"}>
                         <td colSpan="7" className="text-center">{this.state.languageData.client_no_record_found}</td>
                      </tr>}
              			</tbody>
              		</table>

                  <table className={(this.state.tabType && this.state.tabType === 'cancellation_charges') ? "table-updated juvly-table table-min-width" : "table-updated juvly-table table-min-width no-display"}>
              			<thead className="table-updated-thead">
              				<tr>
                      <th className="col-xs-2 table-updated-th">{this.state.languageData.client_appointment_date}</th>
                      <th className="col-xs-2 table-updated-th">{this.state.languageData.pro_clinic}</th>
                      <th className="col-xs-2 table-updated-th">{this.state.languageData.clientprofile_provider}</th>
                      <th className="col-xs-2 table-updated-th">{this.state.languageData.client_services}</th>
                      <th className="col-xs-1 table-updated-th">{this.state.languageData.client_status}</th>
                      <th className="col-xs-1 table-updated-th">{this.state.languageData.client_charges}</th>
                      <th className="col-xs-2 table-updated-th">{this.state.languageData.client_charged_on}</th>
                      <th className="col-xs-2 table-updated-th"></th>
              				</tr>
              			</thead>
              			<tbody className="ajax_body">
                      {
                        (this.state.clientData !== undefined && this.state.clientData.cancelation_charge_history !== undefined && this.state.clientData.cancelation_charge_history !== null && this.state.clientData.cancelation_charge_history.length > 0 ) && this.state.clientData.cancelation_charge_history.map((cobj, cidx) => {
                          let serviceName = [];

                          (cobj.appointment_services && cobj.appointment_services.length > 0) && cobj.appointment_services.map((sobj, sidx) => {
                            (sobj.service) && serviceName.push(capitalizeFirstLetter(sobj.service.name))
                          })

                          return (
                            <tr key={cidx} className="table-updated-tr">
                              <td className="table-updated-td">{(cobj.appointment_datetime && cobj.appointment_datetime !== null) ? showFormattedDate(cobj.appointment_datetime) : ''}</td>
                              <td className="table-updated-td">{(cobj.clinic_name && cobj.clinic_name !== null) ? capitalizeFirstLetter(cobj.clinic_name) : ''}</td>
                              <td className="table-updated-td">{(cobj.provider_name && cobj.provider_name !== null) ? capitalizeFirstLetter(cobj.provider_name) : ''}</td>
                              <td className="table-updated-td">{serviceName.join(', ')}</td>
                              <td className="table-updated-td">{(cobj.appointment_status && cobj.appointment_status !== null) ? capitalizeFirstLetter(cobj.appointment_status) : ''}</td>
                              <td className="table-updated-td">{(cobj.cancellation_fee && cobj.cancellation_fee !== null) ? numberFormat(cobj.cancellation_fee, 'currency') : ''}</td>
                              <td className="table-updated-td">{(cobj.charged_on && cobj.charged_on !== null) ? cobj.charged_on : ''}</td>
                              <td className="table-updated-td">{(cobj.appointment_status && cobj.appointment_status === "charged") && <a className={(this.state.apptTransactionID !== cobj.appointment_transaction_id) ? "line-btn" : "line-btn no-display"} onClick={() => this.issueRefund(cobj.appointment_transaction_id)}>{this.state.languageData.client_refund}</a>}</td>
                            </tr>
                          )
                        })
                      }
                      {(this.state.showLoader === false) && <tr className={(this.state.clientData.cancelation_charge_history === undefined || this.state.clientData.cancelation_charge_history.length === 0 ) ? "table-updated-tr" : "table-updated-tr no-display"}>
                         <td colSpan="8" className="text-center">{this.state.languageData.client_no_record_found}</td>
                      </tr>}
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
    } else {
      returnState.clientData = state.ClientsReducer.data;
    }
  }

  if ( state.ClientsReducer.action === "REFUND_FEES" ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.refundFeeData = state.ClientsReducer.data;
    } else {
      toast.success(languageData.global[state.ClientsReducer.data.message]);
      returnState.refundFeeData = state.ClientsReducer.data;
    }
  }

  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getClientDetail: getClientDetail, refundFees: refundFees}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps) (PaymentHistory);
