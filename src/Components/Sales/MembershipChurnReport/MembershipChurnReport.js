import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { fetchMembershipChurnReport} from '../../../Actions/Sales/salesActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import moment from 'moment';
import SalesHeader from '../Common/SalesHeader.js';
import SalesSidebar from '../Common/SalesSidebar.js';
import SalesFilter from '../Common/SalesFilter.js';
import { format, addDays } from 'date-fns';
import {numberFormat} from '../../../Utils/services.js';

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}
class MembershipChurnReport extends Component {

  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      report_header: {},
      page: 1,
      pagesize: 15,
      MembershipListVal: [],
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
    this.props.fetchMembershipChurnReport(formData);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.MembershipListVal !== undefined && props.MembershipListVal.status === 200 && state.MembershipListVal != props.MembershipListVal.data) {
      return {
        MembershipListVal: props.MembershipListVal.data,
        total: props.MembershipListVal.data.total,
        reportDataValues: props.MembershipListVal.data.report_data,
        reportHeader: props.MembershipListVal.data.report_header,
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
      clinic_id:childState.selectedLocationIdList,
      churn_filter: childState.churn_filter
    };
    this.setState({'showLoader': true});
    this.props.fetchMembershipChurnReport(formData);
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
            <SalesFilter handleChildSubmit={this.handleChildSubmit} clinicVal= {this.state.selectedLocationIdList} total_active_members_value={false} dateRangePick={true} location={false} ChurnedReason={true} reportType={'membership_chrun_report'} />

            <div className="table-responsive">
            <table className="table-updated setting-table no-hover">
              <thead className="table-updated-thead">
                <tr>
                  {this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {
                    return (<td className={idx == 3 ? "col-xs-2 table-updated-th text-right" : "col-xs-2 table-updated-th text-left"} key ={idx}>{Object.values(obj)}</td>)
                  })}
                </tr>
                </thead>
                <tbody className="ajax_body">
                    {
                    this.state.reportDataValues.length > 0  && this.state.reportDataValues.map((objRes, idxRes) => {
                      return (
                        <tr className="table-updated-tr">{this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {
                            return (
                              <td className={idx == 3 ? "col-xs-2 table-updated-th text-right" : "col-xs-2 table-updated-th text-left"}  >{objRes[Object.keys(obj)]}</td>
                              )
                          })}
                        </tr>
                      );
                    })}

                    <tr className="table-updated-tr">
                      <td className="col-xs-3 table-updated-td"><b>{this.state.salesLang.sales_total}</b></td>
                      {
                      totalValue.length > 0  && totalValue.slice(1).map((obj, idx) => {
                      return (
                          <td className="col-xs-2 table-updated-td text-right" key={idx}><b>{obj.value}</b></td>
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

  if (state.SalesReducer.action === "MEMBERSHIP_CHURN_REPORT") {
    if (state.SalesReducer.data.status === 200) {
      return {
  			MembershipListVal: state.SalesReducer.data
      };
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      fetchMembershipChurnReport: fetchMembershipChurnReport
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MembershipChurnReport);
