import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../../../Containers/Settings/sidebar.js";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getSubscriptionInvoices,payInvoiceById,exportEmptyData } from "../../../../Actions/Settings/settingsActions.js";
import { numberFormat,showFormattedDate, autoScrolling} from "../../../../Utils/services.js";


class Invoices extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      invoiceList: [],
      page: 1,
      pagesize: 15,
      next_page_url: '',
      loadMore: true,
      startFresh: true,
      showLoader: false,
      isInvoicePastDue: false,
      pastDueAmount: 0,
      pastDueInvoiceId: 0,
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5 && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  componentDidMount() {
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
      }
    };
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({ 'showLoader': true });
    autoScrolling(true);
    this.props.getSubscriptionInvoices(formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.redirect !== undefined && nextProps.redirect === true) {
      toast.success(nextProps.message)
      window.location.reload();
    } else if (nextProps.showLoader !== undefined && nextProps.showLoader === true) {
      returnState.showLoader = false;
    } else if (
      nextProps.invoiceList != undefined &&
      nextProps.invoiceList.next_page_url !== prevState.next_page_url
    ) {
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        autoScrolling(false);
        return (returnState.next_page_url = null);
      }

      if (prevState.invoiceList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.invoiceList = nextProps.invoiceList.data;
          if((returnState.invoiceList.length > 0 && returnState.invoiceList[0].payment_status == 'past_due')){
              returnState.isInvoicePastDue = true;
              returnState.pastDueAmount = returnState.invoiceList[0].invoice_amount;
              returnState.pastDueInvoiceId = returnState.invoiceList[0].id;
          } else {
            returnState.isInvoicePastDue = false;
            returnState.pastDueAmount = 0;
          }

          if (nextProps.invoiceList.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.invoiceList.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.invoiceList != nextProps.invoiceList.data &&
        prevState.invoiceList.length != 0
      ) {
        returnState.invoiceList = [
          ...prevState.invoiceList,
          ...nextProps.invoiceList.data
        ];
        returnState.next_page_url = nextProps.invoiceList.next_page_url;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
        returnState.page = prevState.page + 1;
      }
    }
    autoScrolling(false);
    return returnState;
  }
  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true,showLoadingText:true });
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
        }
      };
      autoScrolling(true);
      this.props.getSubscriptionInvoices(formData);
    }
  };

  handleSubmit = () => {
    if(this.state.pastDueInvoiceId){
      this.setState({showLoader:true});
      this.props.payInvoiceById({invoice_id:this.state.pastDueInvoiceId});
    }
  }

  InvoiceView = (id) => {
    return (
      <div>
        {this.props.history.push(`/settings/invoices/${id}/subscription`)}
      </div>
    );
  }

  render() {

    return (
      <div className="main protected">
        <div id="content">
          <div className="container-fluid content setting-wrapper">

            <Sidebar />

            <div className="setting-setion">
              { this.state.isInvoicePastDue ?
                <div className="setting-search-outer">
            			<a className="new-blue-btn confirm-pay-now pull-right" onClick={this.handleSubmit}>{this.state.settingsLang.billing_pay_now}</a>
            			<span className="setting-total-due pull-right">{this.state.settingsLang.billing_your_total_due} : {numberFormat(this.state.pastDueAmount,'currency',2)}</span>
                </div>
                :
                <div className="setting-search-outer">&nbsp;</div>
              }
              <div className="table-responsive">
                <table className="table-updated setting-table table-min-width">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="col-xs-3 table-updated-th">{this.state.settingsLang.billing_invoice}#<i className="gray-gray" /></th>
                      <th className="col-xs-2 table-updated-th">{this.state.settingsLang.billing_invoice_date}</th>
                      <th className="col-xs-3 table-updated-th">{this.state.globalLang.label_status}</th>
                      <th className="col-xs-3 table-updated-th text-right">{this.state.globalLang.label_amount}</th>
                    </tr>
                  </thead>
                  <tbody className="ajax_body">
                    { this.state.invoiceList.length ?
                      this.state.invoiceList.map((obj,idx) => {
                          const createdDate = showFormattedDate(obj.created, false, 'MMMM DD, YYYY');
                          return (
                            <tr className="table-updated-tr" key={'invoice-'+idx} onClick={this.InvoiceView.bind(this,obj.id)}>
                              <td className="col-xs-3 table-updated-td">{obj.invoice_number}</td>
                              <td className="col-xs-3 table-updated-td">{createdDate}</td>
                              <td className="col-xs-3 table-updated-td">{(obj.payment_status == 'paid') ? this.state.settingsLang.setting_paid : (obj.payment_status == 'refunded') ?  this.state.settingsLang.setting_refunded : this.state.settingsLang.setting_past_due}</td>
                              <td className="col-xs-3 table-updated-td text-right">{numberFormat(obj.invoice_amount,'currency',2)}</td>
                            </tr>
                          )
                      })
                    :
                    ( (this.state.showLoader === false) && <tr className="table-updated-tr">
                      <td className="col-xs-3 table-updated-td text-center" colSpan={4}>
                        {this.state.globalLang.sorry_no_record_found}
                      </td>
                    </tr>)
                  }
                  </tbody>
                </table>
              </div>
              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
                </div>
              </div>
              <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
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
  if (state.SettingReducer.action === "SUBSCRIPTION_INVOICE_LIST") {
    if(state.SettingReducer.data.status != 200) {
      toast.dismiss()
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.invoiceList = state.SettingReducer.data.data
    }
  } else if (state.SettingReducer.action === "PAY_LAST_DUE_INVOICE") {
    if(state.SettingReducer.data.status != 200) {
      toast.dismiss()
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.redirect = true;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getSubscriptionInvoices: getSubscriptionInvoices,payInvoiceById:payInvoiceById,exportEmptyData:exportEmptyData }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Invoices);
