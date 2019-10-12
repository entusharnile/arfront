import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { fetchPaymentMethods} from '../../../Actions/Sales/salesActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import SalesHeader from '../Common/SalesHeader.js';
import SalesSidebar from '../Common/SalesSidebar.js';
import SalesFilter from '../Common/SalesFilter.js';
import { format, addDays } from 'date-fns';
import {numberFormat} from '../../../Utils/services.js';

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}
class PaymentMethods extends Component {

  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      upDown: false,
      report_header: {},
      monthlyNetValues:[],
      total_invoices: '',
      grouping: '',
      avg_gross_sales: '',
      avg_net_sales: '',
      gross_sales: '',
      net_sales: '',
      next_page_url: '',
      page: 1,
      pagesize: 15,
      hasMoreItems: true,
      reminder_before: '',
      reminder_type: '',
      locationArray: [],
      paymentMethodsList: [],
      userChanged: false,
      showLoadingText : false,
      hasMoreItems: true,
      startFresh: true,
      showLoader: false,
      showModal: false,
      noRecordDisplayEnable: 'no-record',
      noRecordDisplayDisable: 'no-record no-display',
      globalLang: languageData.global,
      salesLang: languageData.sales,
      showLoadingText : false,
      selectedLocationIdList:[],
      clinicObjList:{},
      to_date         : format(new Date(), 'YYYY-MM-DD'),
      from_date       : format(new Date(), 'YYYY-MM-DD'),
      graphData:[],
      reportHeader : [],
      reportDataValues : [],
    };
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
  }

  showDeleteModal = (e) => {
    this.setState({showModal: true, reminderId: e.currentTarget.dataset.userid})
  }

  showEditModal = (e)=> {
    this.setState({ userId: e.currentTarget.dataset.userid})
  }

  dismissModal = () => {
    this.setState({showModal: false})
  }

  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    const dateData = localStorage.getItem('selectionRange-report');
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate
    const endD = valR.endDate
    let formData = {
      fromDate: apiDateFormat(startD),
      toDate: apiDateFormat(endD),
    };
    this.setState({'showLoader': true});
    this.props.fetchPaymentMethods(formData);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.paymentMethodsList !== undefined && props.paymentMethodsList.status === 200 && state.paymentMethodsList != props.paymentMethodsList.data) {
      return {
        paymentMethodsList: props.paymentMethodsList.data,
        total: props.paymentMethodsList.data.total,
        reportDataValues: props.paymentMethodsList.data.report_data,
        locationArray: props.paymentMethodsList.data.clinics,
        reportHeader: props.paymentMethodsList.data.report_header,
        grouping: props.paymentMethodsList.data.grouping,
        showLoader : false,
      };
      this.setState({'showLoader': false});
      }
      else
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

  handleChildSubmit = (childState) => {
    this.setState(childState);
    let formData = {
      fromDate: apiDateFormat(childState.fromDate), //'2018-04-01', // ,
      toDate: apiDateFormat(childState.toDate), //'2019-05-31', //,
      clinic_id:childState.selectedLocationIdList
    };
    this.setState({'showLoader': true});
    this.props.fetchPaymentMethods(formData);
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
          <div className="setting-left-menu">
            <SalesSidebar/>
          </div>
          <div className="juvly-section">
              <SalesFilter locationArray={this.state.locationArray} handleChildSubmit={this.handleChildSubmit} clinicVal= {this.state.selectedLocationIdList}  location={true} dateRangePick={true} reportType={'payment_methods'} />
            <div className="table-responsive">
              <table className="table-updated setting-table no-hover">
                <thead className="table-updated-thead">
                  <tr>
                    {this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {
                      return (<><th className={ idx == 0 ? "col-xs-4 table-updated-th text-left" : "col-xs-4 table-updated-th text-right" }>{Object.values(obj)}</th></>)
                    })}
                  </tr>
                </thead>
                <tbody className="ajax_body">

                  {
                  this.state.reportDataValues.length > 0  && this.state.reportDataValues.map((objRes, idxRes) => {
                  return (
                      <tr className="table-updated-tr">
                      {this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {
                        return (<td className={ idx == 0 ? "col-xs-3 table-updated-td text-left" : "col-xs-3 table-updated-td text-right" } >{objRes[Object.keys(obj)]}</td>)
                      })}
                      </tr>
                    );
                  })}

                  <tr className="table-updated-tr">
                    <td className="col-xs-3 table-updated-td"><b>{this.state.salesLang.sales_total}</b></td>
                    {
                    totalValue.length > 0  && totalValue.slice(1).map((obj, idx) => {
                    return (
                        <><td className="col-xs-3 table-updated-td text-right"><b>{obj.value}</b></td></>
                      );
                    })}
                  </tr>
                </tbody>
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
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SalesReducer.action === "PAYMENT_METHOD_LIST") {
    if (state.SalesReducer.data.status === 200) {
      return {
  			paymentMethodsList: state.SalesReducer.data
      };
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      fetchPaymentMethods: fetchPaymentMethods
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentMethods);
