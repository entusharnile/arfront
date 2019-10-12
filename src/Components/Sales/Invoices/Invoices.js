import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchInvoices} from '../../../Actions/Sales/salesActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import moment from 'moment';
import SalesHeader from '../Common/SalesHeader.js';
import SalesFilter from '../Common/SalesFilter.js';
import { format, addDays } from 'date-fns';
import {numberFormat, autoScrolling} from '../../../Utils/services.js';

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}

class Invoices extends Component {

  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      sales_header: {},
      upDown: false,
      report_header: {},
      monthlyNetValues:[],
      total_invoices: '',
      grouping: '',
      avg_gross_sales: '',
      avg_net_sales: '',
      gross_sales: '',
      net_sales: '',
      show_invoice: false,
      page: 1,
      loadMore: true,
      pagesize: 15,
      page_number: 1,
      hasMoreItems: true,
      reminder_before: '',
      reminder_type: '',
      locationArray: [],
      invoicesArray: [],
      employeeArray: [],
      InvoicesList: [],
      clinic_id: [],
      user_id: [],
      invoice_status: [],
      userChanged: false,
      hasMoreItems: true,
      startFresh: true,
      showLoader: false,
      showModal: false,
      search_key: '',
      noRecordDisplayEnable: 'no-record',
      noRecordDisplayDisable: 'no-record no-display',
      globalLang: languageData.global,
      salesLang: languageData.sales,
      showLoadingText : false,
      selectedLocationIdList: [],
      selectedEmployeeIdList: [],
      selectedInvoicesIdList: [],
      clinicObjList:{},
      to_date         : format(new Date(), 'YYYY-MM-DD'),
      from_date       : format(new Date(), 'YYYY-MM-DD'),
      graphData:[],
      reportHeader : [],
      reportDataValues : [],
    };
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.show_invoice) {
        this.loadMore();
      }
    };
  }

  showDeleteModal = (e) => {
    this.setState({showModal: true, reminderId: e.currentTarget.dataset.userid});
  }

  showEditModal = (e)=> {
    this.setState({ userId: e.currentTarget.dataset.userid})
  }

  dismissModal = () => {
    this.setState({showModal: false})
  }

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true });
      const languageData = JSON.parse(localStorage.getItem('languageData'))
      const dateData = localStorage.getItem('selectionRange-invoices');
      const valR = dateData ? JSON.parse(dateData) : '';
      const startD = valR.startDate
      const endD = valR.endDate
      let formData = {
          fromDate: apiDateFormat(startD),
          toDate: apiDateFormat(endD),
          search_key: this.state.search_key,
          page_number: this.state.page_number,
          clinic_id: this.state.clinic_id,
          user_id: this.state.user_id,
          invoice_status: this.state.invoice_status,
      };
      autoScrolling(true)
      this.props.fetchInvoices(formData);
    }
  };

  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    localStorage.setItem("sortOnly", false);
    const dateData = localStorage.getItem('selectionRange-invoices');
    const valR = dateData ? JSON.parse(dateData) : '';
    const localInvoicesArray= localStorage.getItem('localInvoicesArray');
    const localInvoicesArrays = localInvoicesArray ? JSON.parse(localInvoicesArray) : '' ;
    const localSelectedEmployeeIdList= localStorage.getItem('localSelectedEmployeeIdList') ;
    const localSelectedEmployeeIdLists = localSelectedEmployeeIdList ? JSON.parse(localSelectedEmployeeIdList) : '' ;
    const localSelectedLocationIdList= localStorage.getItem('localSelectedLocationIdList') ;
    const localSelectedLocationIdLists = localSelectedLocationIdList ? JSON.parse(localSelectedLocationIdList) : '' ;
    const startD = valR.startDate
    const endD = valR.endDate
    let formData = {
        fromDate: apiDateFormat(startD),
        toDate: apiDateFormat(endD),
        search_key: this.state.search_key,
        page_number: 1,
        clinic_id: localSelectedLocationIdLists ? localSelectedLocationIdLists : '' ,
        user_id: localSelectedEmployeeIdLists ? localSelectedEmployeeIdLists : '',
        invoice_status: localInvoicesArrays ? localInvoicesArrays : ''
    };
    this.setState({'showLoader': true});
    autoScrolling(true)
    this.props.fetchInvoices(formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        return {showLoader : false};
     }
      if (nextProps.InvoicesList != undefined && nextProps.InvoicesList.data.invoices_data != prevState.reportDataValues && nextProps.invoicesTime != prevState.invoicesTime) {
        returnState.invoicesTime = nextProps.invoicesTime;
          if(prevState.reportDataValues.length == 0) {
              //returnState.reportDataValues = nextProps.InvoicesList.data.invoices_data;
              returnState.page_number = (nextProps.InvoicesList.data) ?  (prevState.page_number + 1) : 1;

              returnState.InvoicesList= nextProps.InvoicesList.data.invoices_data;
              returnState.sales_header= nextProps.InvoicesList.data.sales_header;
              returnState.total= nextProps.InvoicesList.data.total;
              returnState.reportDataValues= nextProps.InvoicesList.data.invoices_data;
              returnState.locationArray= nextProps.InvoicesList.data.clinics;
              returnState.employeeArray= nextProps.InvoicesList.data.employees;
              returnState.invoicesArray= nextProps.InvoicesList.data.payment_status;
              returnState.reportHeader= nextProps.InvoicesList.data.report_header;
              returnState.grouping= nextProps.InvoicesList.data.grouping;
              returnState.startFresh = false;
              returnState.showLoader = false;
              returnState.showLoadingText = false;
              returnState.show_invoice = nextProps.InvoicesList.data.show_invoice;

          } else  {
            returnState.reportDataValues = [...prevState.reportDataValues,...nextProps.InvoicesList.data.invoices_data];
            returnState.page_number = prevState.page_number + 1;
            returnState.sales_header= nextProps.InvoicesList.data.sales_header;
            returnState.total= nextProps.InvoicesList.data.total;
            //returnState.reportDataValues= nextProps.InvoicesList.data.invoices_data;
            returnState.locationArray= nextProps.InvoicesList.data.clinics;
            returnState.employeeArray= nextProps.InvoicesList.data.employees;
            returnState.invoicesArray= nextProps.InvoicesList.data.payment_status;
            returnState.reportHeader= nextProps.InvoicesList.data.report_header;
            returnState.grouping= nextProps.InvoicesList.data.grouping;
            returnState.startFresh = false;
            returnState.showLoader = false;
            returnState.showLoadingText = false;
            returnState.show_invoice = nextProps.InvoicesList.data.show_invoice;
          }
          autoScrolling(false)
          return returnState;
      }
      return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.startFresh) {
      return true;
    }

    if (this.state.loadMore) {
      return true;
    }

    if (this.state.showLoader) {
      return true;
    }
    return false;
	}

  componentDidUpdate = (props, state) => {
    if(this.state.showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  deleteReminder = () => {
    localStorage.setItem('isDelete', true);
    this.dismissModal();
    let reminders = this.state.InvoicesList;
      if(reminders.length) {
        reminders.map((obj, idx) => {
          if(obj.id == this.state.reminderId){
            delete reminders[idx];
          }
        })
        this.setState({InvoicesList : reminders});
    }
    this.props.deleteInvoicesList(this.state.reminderId);
    this.dismissModal();
  }

  handleChildSubmit = (childState) => {
    this.setState(childState);
    if ( childState.canSubmit ) {
      localStorage.setItem("sortOnly", false);
      let formData = {
        fromDate: apiDateFormat(childState.fromDate), //'2018-04-01', // ,
        toDate: apiDateFormat(childState.toDate), //'2019-05-31', //,
        clinic_id:childState.selectedLocationIdList,
        user_id:childState.selectedEmployeeIdList,
        invoice_status: childState.selectedInvoicesIdList,
        search_key: childState.search_key,
        page_number: 1
      };
      this.setState({
        reportDataValues: [],
        loadMore: true,
        clinic_id:childState.selectedLocationIdList,
        user_id:childState.selectedEmployeeIdList,
        invoice_status: childState.selectedInvoicesIdList,
        'showLoader': true,
        page_number: 1
        });
        autoScrolling(true)
      this.props.fetchInvoices(formData);
    }
  }

  handleSearchSubmit = (event) => {
    let formData ={
      search_key: this.state.search_key
    }
  }

  userEdit = ( id, patient_id ) => {
       return (
         <div>
           {this.props.history.push(`/sales/invoice/${id}/${patient_id}/invoices`)}
         </div>
       );
     }

  render(){
    var totalValue = [];
     if (this.state.total != null) {
       totalValue = Object.entries(this.state.total).map(([key, value]) => ({key, value}));
    }

    let reportHeaders = [];
    this.state.reportHeader.map((objInner, idxInner) => {
      reportHeaders.push()
    })

    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <SalesHeader/>
          <div className="juvly-section full-width">
            <SalesFilter locationArray={this.state.locationArray} clinic_id={this.state.clinic_id} user_id={this.state.user_id} invoice_status={this.state.invoice_status} invoicesArray={this.state.invoicesArray} employeeArray={this.state.employeeArray} handleChildSubmit={this.handleChildSubmit} searchVal={this.state.search_key} clinicVal= {this.state.selectedLocationIdList} dateRangePick={true} reportType={'invoices'} search={true} location={true} searchShow={true} invoices={true} employee={true} />
            <div className="table-responsive">
              <table className="table-updated setting-table sale-invoice-table min-w-1000">
                <thead className="table-updated-thead">
                  <tr>
                  {this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {
                    return (
                    <React.Fragment key={`firstfrag_`+idx}>
                      <th className="col-xs-1 table-updated-th" data-url="/${actionType}/payment-history/${clientID}/${type}/${tabType}" >{Object.values(obj)}</th>
                    </React.Fragment>
                    )
                  })}
                  </tr>
                </thead>
                <tbody className="ajax_body">

                    {
                    this.state.reportDataValues.length > 0 && this.state.reportDataValues.map((objRes, idxRes) => {
                      return (
                        <React.Fragment key={`secondfrag_`+idxRes}>
                        <tr className="table-updated-tr">
                          {
                            this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {

                            return (
                              <React.Fragment key={`thirdfrag_`+idx}>
                                <td className="col-xs-1 table-updated-td" onClick = {this.userEdit.bind(this, objRes.id, objRes.patient_id)}>{objRes[Object.keys(obj)]}</td>
                              </React.Fragment>
                            )
                          })}
                          </tr>
                        </React.Fragment>
                      );
                    })}
                </tbody>
                {this.state.showLoader !== true && this.state.reportDataValues !== undefined && this.state.reportDataValues.length == 0 && <tbody className="ajax_body"><tr className="table-updated-tr"><td className="no-record no-float" colSpan={11}>{this.state.salesLang.sales_no_record_found}</td></tr></tbody>}
              </table>
              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.salesLang.sales_please_wait}</div>
              </div>
              </div>
            </div>
          </div>
        </div>
        <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
localStorage.setItem("sortOnly", true);
  if (state.SalesReducer.action === "INVOICES_LIST") {
    if (state.SalesReducer.data.status === 200) {
      return {
  			InvoicesList: state.SalesReducer.data,
        invoicesTime: new Date()
      };
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      fetchInvoices: fetchInvoices
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Invoices);
