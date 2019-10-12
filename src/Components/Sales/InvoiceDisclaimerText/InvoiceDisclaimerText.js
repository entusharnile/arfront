import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createEditInvoiceText, fetchInvoiceText} from '../../../Actions/Sales/salesActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import SalesHeader from '../Common/SalesHeader.js';

class InvoiceDisclaimerText extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      report_data: '',
      invoice_text: '',
      createEditInvoicesList: [],
      globalLang: languageData.global,
      salesLang: languageData.sales,
      showLoader: false
    };
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
  }

  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({'showLoader': true});
    this.props.fetchInvoiceText();
  }

  static getDerivedStateFromProps(props, state) {
    if (props.fetchInvoicesList !== undefined && props.fetchInvoicesList.status === 200 && state.fetchInvoicesList != props.fetchInvoicesList.data) {
      return {
        fetchInvoicesList: props.fetchInvoicesList.data,
        invoice_text : (state.userChanged) ? state.invoice_text : props.fetchInvoicesList.data.report_data,
        showLoader : false,
        };
      }
      else if (props.createEditInvoicesList !== undefined && props.createEditInvoicesList.status === 200 && state.createEditInvoicesList != props.createEditInvoicesList.data && props.showLoaderTime != state.showLoaderTime) {
        return {
          showLoader : false,
          showLoaderTime : props.showLoaderTime
          };
        }
      else
        return null;
  }

  handleSubmit = (event) => {
    event.preventDefault();
      let formData = {
        invoice_text : this.state.invoice_text
      }
      this.setState({showLoader : true})
      this.props.createEditInvoiceText(formData);
   }

    handleInputChange = (event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      this.setState({
        [event.target.name]: value, userChanged : true
      });
    }

  render(){
    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <SalesHeader/>
          <div className="juvly-section full-width">
          <form id="invoices-text-form" name="invoices-text" className="nobottommargin" action="#" method="post" onSubmit={this.handleSubmit}>
            <div className="juvly-container">
              <div className="juvly-title m-b-40">{this.state.salesLang.sales_invoice_disclaimer}</div>
              <div className="row">
                <div className="col-md-8 col-sm-12 invoice-discraimer">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.salesLang.sales_invoice_disclaimer}</div>
                    <textarea id="invoice_text" name="invoice_text" rows={10} className="setting-textarea-box invoice-textarea" value={this.state.invoice_text} onChange={this.handleInputChange} />
                  </div>
                </div>
                <div className="col-md-4 col-sm-12">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.salesLang.sales_Invoice_preview}</div>
                    <img src="/images/invoice45.png" className="invoice-img m-t-20" />
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-static">
              <input className="new-blue-btn pull-right" type="submit" id="save-profile" autoComplete="off" value={this.state.salesLang.sales_save} />
            </div>
            </form>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
              <div id="modal-confirm-text" className="popup-subtitle" >{this.state.salesLang.sales_please_wait}</div>
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  toast.dismiss();
  if (state.SalesReducer.action === "FETCH_INVOICES") {
    if(state.SalesReducer.data.status === 200){
      return {fetchInvoicesList: state.SalesReducer.data }
  }
  else {
      toast.error(languageData.global[state.SalesReducer.data.message]);
    }
  }
  if (state.SalesReducer.action === "CREATE_EDIT_INVOICES") {
    if(state.SalesReducer.data.status === 200){
      return {
        createEditInvoicesList: state.SalesReducer.data ,
        message : toast.success(languageData.global[state.SalesReducer.data.message]) ,
        showLoaderTime : new Date()
      }
  }
  else {
      toast.error(languageData.global[state.SalesReducer.data.message]);
    }
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      createEditInvoiceText: createEditInvoiceText,
      fetchInvoiceText: fetchInvoiceText
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(InvoiceDisclaimerText);
