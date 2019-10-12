import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { fetchSalesCategory} from '../../../Actions/Sales/salesActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import SalesHeader from '../Common/SalesHeader.js';
import SalesSidebar from '../Common/SalesSidebar.js';
import SalesFilter from '../Common/SalesFilter.js';
import SalesGraph from './SalesGraph.js';
import { format, addDays } from 'date-fns';
import {numberFormat} from '../../../Utils/services.js';

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}
class SalesSummary extends Component {

  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      reminder_before: '',
      reminder_type: '',
      salesCategoryList: [],
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
      locationArray:[],
      to_date         : format(new Date(), 'YYYY-MM-DD'),
      from_date       : format(new Date(), 'YYYY-MM-DD'),
      graphData:[]
    };
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
          document.documentElement.offsetHeight &&
        this.state.next_page_url != null
      ) {
        this.loadMore();
      }
    };
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
    this.props.fetchSalesCategory(formData);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.salesCategoryList !== undefined && props.salesCategoryList.status === 200 && state.salesCategoryList != props.salesCategoryList.data) {
      return {
        salesCategoryList: props.salesCategoryList.data,
        total_gross_Sales: (state.userChanged) ? state.total_gross_Sales : props.salesCategoryList.data.total_gross_Sales,
        total_net_discount: (state.userChanged) ? state.total_net_discount : props.salesCategoryList.data.total_net_discount,
        prepayment_adjustment: (state.userChanged) ? state.prepayment_adjustment : props.salesCategoryList.data.prepayment_adjustment,
        total_net_Sales: (state.userChanged) ? state.total_net_Sales : props.salesCategoryList.data.total_net_Sales,
        refunded_payments: (state.userChanged) ? state.refunded_payments : props.salesCategoryList.data.refunded_payments,
        total_tax: (state.userChanged) ? state.total_tax : props.salesCategoryList.data.total_tax,
        tip_amount: (state.userChanged) ? state.tip_amount : props.salesCategoryList.data.tip_amount,
        cancellation_feecollected: (state.userChanged) ? state.cancellation_feecollected : props.salesCategoryList.data.cancellation_feecollected,
        wallet_total: (state.userChanged) ? state.wallet_total : props.salesCategoryList.data.wallet_total,
        cancellation_feerefunded: (state.userChanged) ? state.cancellation_feerefunded : props.salesCategoryList.data.cancellation_feerefunded,
        pending_partial_amount: (state.userChanged) ? state.pending_partial_amount : props.salesCategoryList.data.pending_partial_amount,
        total_collected: (state.userChanged) ? state.total_collected : props.salesCategoryList.data.total_collected,
        NetValueServicesPerformed: (state.userChanged) ? state.NetValueServicesPerformed : props.salesCategoryList.data.net_value_services_performed,
        total_processing_fees: (state.userChanged) ? state.total_processing_fees : props.salesCategoryList.data.total_processing_fees,
        inventory_expense: (state.userChanged) ? state.inventory_expense : props.salesCategoryList.data.inventory_expense,
        cash_total: (state.userChanged) ? state.cash_total : props.salesCategoryList.data.cash_total,
        cc_total: (state.userChanged) ? state.cc_total : props.salesCategoryList.data.cc_total,
        your_profit: (state.userChanged) ? state.your_profit : props.salesCategoryList.data.your_profit,
        care_credit_total: (state.userChanged) ? state.care_credit_total : props.salesCategoryList.data.care_credit_total,
        locationArray: props.salesCategoryList.data.clinics,
        graphData: props.salesCategoryList.data.per_day_totals,
        showLoader : false,
      };
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

  deleteReminder = () => {
    localStorage.setItem('isDelete', true);
    this.dismissModal();
    let reminders = this.state.salesCategoryList;
      if(reminders.length) {
        reminders.map((obj, idx) => {
          if(obj.id == this.state.reminderId){
            delete reminders[idx];
          }
        })
        this.setState({salesCategoryList : reminders});
    }
    this.props.deletesalesCategoryList(this.state.reminderId);
    this.dismissModal();
  }

  handleChildSubmit = (childState) => {
    this.setState(childState);

    if ( childState.canSubmit ) {
      let formData = {
        fromDate: apiDateFormat(childState.fromDate), //'2018-04-01', // ,
        toDate: apiDateFormat(childState.toDate), //'2019-05-31', //,
        clinic_id:childState.selectedLocationIdList,
      };
      this.setState({'showLoader': true});
      this.props.fetchSalesCategory(formData);
    }
  }

  render(){
    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <SalesHeader/>
          <div className="setting-left-menu">
            <SalesSidebar/>
          </div>
          <div className="juvly-section">
            <SalesFilter locationArray={this.state.locationArray} handleChildSubmit={this.handleChildSubmit} clinicVal= {this.state.selectedLocationIdList} location={true} dateRangePick={true} reportType={'sales_summary'}  />
            {this.state.graphData.length > 0 &&
              <div className="data-usage">
                <SalesGraph graphData={this.state.graphData}  />
              </div>
            }
            <div className="table-responsive">
              <table className="table-updated setting-table no-hover">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-9 table-updated-th">{this.state.salesLang.sales_category}</th>
                    <th className="col-xs-3 table-updated-th text-right">{this.state.salesLang.sales_Amount}</th>
                  </tr>
                </thead>
                <tbody className="ajax_body">
                  <tr className="table-updated-tr gray-row">
                    <td className="col-xs-9 table-updated-td">{this.state.salesLang.sales_gross_sales}</td>
                    <td className="col-xs-3 table-updated-td text-right">
                    {this.state.total_gross_Sales}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_discounts_comps}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.total_net_discount}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_prepaid_products}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.prepayment_adjustment}</td>
                  </tr>
                  <tr className="table-updated-tr gray-row">
                    <td className="col-xs-9 table-updated-td">{this.state.salesLang.sales_net_sales}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.total_net_Sales}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_refunds}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.refunded_payments}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_tax}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.total_tax}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_tip}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.tip_amount}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_cancelation_fee}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.cancellation_feecollected}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_cancelation_fee_refunded}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.cancellation_feerefunded}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_wallet_debits}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.wallet_total}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_pending_partial_payments}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.pending_partial_amount}</td>
                  </tr>
                  <tr className="table-updated-tr gray-row">
                    <td className="col-xs-9 table-updated-td">{this.state.salesLang.sales_total_collected}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.total_collected}</td>
                  </tr>
                  <tr className="table-updated-tr gray-row">
                    <td className="col-xs-9 table-updated-td">{this.state.salesLang.sales_net_value_services}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.NetValueServicesPerformed}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_cost_to_company}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.inventory_expense}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_payment_processing_fee}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.total_processing_fees}</td>
                  </tr>
                  <tr className="table-updated-tr gray-row">
                    <td className="col-xs-9 table-updated-td">{this.state.salesLang.sales_gross_margin}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.your_profit}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_cash}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.cash_total}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_credit_card}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.cc_total}</td>
                  </tr>
                  <tr className="table-updated-tr">
                    <td className="col-xs-9 table-updated-td sub-table">{this.state.salesLang.sales_care_credit}</td>
                    <td className="col-xs-3 table-updated-td text-right">{this.state.care_credit_total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
  if (state.SalesReducer.action === "SALES_CATEGORY_LIST") {
    if (state.SalesReducer.data.status === 200) {
      return {
  			salesCategoryList: state.SalesReducer.data
      };
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      fetchSalesCategory: fetchSalesCategory
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SalesSummary);
