import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { fetchShortTermLiability} from '../../../Actions/Sales/salesActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import SalesHeader from '../Common/SalesHeader.js';
import SalesSidebar from '../Common/SalesSidebar.js';
import SalesFilter from '../Common/SalesFilter.js';
import { format, addDays } from 'date-fns';
import {numberFormat, autoScrolling} from '../../../Utils/services.js';

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}
class ShortTermLiability extends Component {

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
      next_page_url: '',
      total_active_members: '',
      page: 1,
      loadMore: true,
      pagesize: 15,
      hasMoreItems: true,
      reminder_before: '',
      reminder_type: '',
      locationArray: [],
      ShortTermLiabilityList: [],
      userChanged: false,
      showLoadingText : false,
      hasMoreItems: true,
      startFresh: true,
      showLoader: false,
      showModal: false,
      loadMore: true,
      noRecordDisplayEnable: 'no-record',
      noRecordDisplayDisable: 'no-record no-display',
      globalLang: languageData.global,
      salesLang: languageData.sales,
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
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
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
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
        }
      };
      autoScrolling(true)
      this.props.fetchShortTermLiability(formData);
    }
  };

  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    let formData = {
      page: this.state.page,
      pagesize: this.state.pagesize,
      fromDate: this.state.fromDate,
      toDate: this.state.toDate,
    };
    this.setState({'showLoader': true});
    autoScrolling(true)
    this.props.fetchShortTermLiability(formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        return {showLoader : false};
     }
      if (nextProps.ShortTermLiabilityList != undefined && nextProps.ShortTermLiabilityList.data.next_page_url !== prevState.next_page_url) {
          let returnState = {};
          if(prevState.next_page_url == null) {
            localStorage.setItem('sortOnly', false);
            autoScrolling(false)
            return returnState.next_page_url = null;
          }

          if(prevState.ShortTermLiabilityList.length == 0 && prevState.startFresh == true) {
            if(localStorage.getItem('sortOnly') == 'false') {
              returnState.ShortTermLiabilityList = nextProps.ShortTermLiabilityList.data;
              if(nextProps.ShortTermLiabilityList.data.next_page_url != null) {
                returnState.page = prevState.page + 1;
                returnState.next_page_url = nextProps.ShortTermLiabilityList.data.next_page_url;
              } else {
                returnState.next_page_url = null;
              }
              returnState.ShortTermLiabilityList= nextProps.ShortTermLiabilityList.data.report_data;
              returnState.sales_header= nextProps.ShortTermLiabilityList.data.sales_header;
              returnState.total_liability= nextProps.ShortTermLiabilityList.data.total_liability;
              returnState.total= nextProps.ShortTermLiabilityList.data.total;
              returnState.reportDataValues= nextProps.ShortTermLiabilityList.data.report_data;
              returnState.locationArray= nextProps.ShortTermLiabilityList.data.clinics;
              returnState.reportHeader= nextProps.ShortTermLiabilityList.data.report_header;
              returnState.grouping= nextProps.ShortTermLiabilityList.data.grouping;
              returnState.startFresh = false;
              returnState.showLoader = false;
              returnState.showLoadingText = false;
            } else {
              localStorage.setItem('sortOnly', false);
            }
          } else if(nextProps.ShortTermLiabilityList != undefined && prevState.ShortTermLiabilityList != nextProps.ShortTermLiabilityList.data.report_data ) {
            returnState.ShortTermLiabilityList = [...prevState.ShortTermLiabilityList,...nextProps.ShortTermLiabilityList.data.report_data];
            returnState.reportDataValues =[...prevState.reportDataValues,...nextProps.ShortTermLiabilityList.data.report_data];
            returnState.page = prevState.page + 1;
            returnState.next_page_url = nextProps.ShortTermLiabilityList.data.next_page_url;
            returnState.ShortTermLiabilityList= nextProps.ShortTermLiabilityList.data.report_data;
            returnState.sales_header= nextProps.ShortTermLiabilityList.data.sales_header;
            returnState.total_liability= nextProps.ShortTermLiabilityList.data.total_liability;
            returnState.total= nextProps.ShortTermLiabilityList.data.total;
            //returnState.reportDataValues= nextProps.ShortTermLiabilityList.data.report_data;
            returnState.locationArray= nextProps.ShortTermLiabilityList.data.clinics;
            returnState.reportHeader= nextProps.ShortTermLiabilityList.data.report_header;
            returnState.grouping= nextProps.ShortTermLiabilityList.data.grouping;
            returnState.showLoader = false;
            returnState.showLoadingText = false;
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
/*
  loadMore = () => {
    localStorage.setItem("sortOnly", false);
    this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true });
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
      }
    };
    this.props.fetchShortTermLiability(formData);
  };
  */

  deleteReminder = () => {
    localStorage.setItem('isDelete', true);
    this.dismissModal();
    let reminders = this.state.ShortTermLiabilityList;
      if(reminders.length) {
        reminders.map((obj, idx) => {
          if(obj.id == this.state.reminderId){
            delete reminders[idx];
          }
        })
      this.setState({ShortTermLiabilityList : reminders});
    }
    this.props.deleteShortTermLiabilityList(this.state.reminderId);
    this.dismissModal();
  }

  handleChildSubmit = (childState) => {
    this.setState(childState);
    let formData = {
      page: 1,
      pagesize: this.state.pagesize,
      fromDate: apiDateFormat(childState.fromDate), //'2018-04-01', // ,
      toDate: apiDateFormat(childState.toDate), //'2019-05-31', //,
      clinic_id:childState.selectedLocationIdList
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      loadMore: true,
      'showLoader': true,
      startFresh: true,
    });
    autoScrolling(true)
    this.props.fetchShortTermLiability(formData);
  }

  render(){
    var totalValue = [];
     if (this.state.total != null) {
       totalValue = Object.entries(this.state.total).map(([key, value]) => ({key, value}));
    }

    var salesHeaderValue = [];
     if (this.state.total != null) {
       salesHeaderValue = Object.entries(this.state.sales_header).map(([key, value]) => ({key, value}));
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
            <SalesFilter locationArray={this.state.locationArray} handleChildSubmit={this.handleChildSubmit} dateRangePick={false} total_liability={this.state.total_liability} total_liability_value={true} location={false} reportType={'short_term_liability'} />

            <div className="table-responsive">
            <table className="table-updated setting-table short-term-table no-hover">
              <thead className="table-updated-thead">
                <tr>
                  {this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {
                    return (<td className={idx == 0 ? "col-xs-2 table-updated-th text-left" : "col-xs-2 table-updated-th text-right"} key ={idx}>{Object.values(obj)}</td>)
                  })}
                </tr>
                </thead>
                <tbody className="ajax_body">
                {
                this.state.reportDataValues.length > 0 && this.state.reportDataValues.map((objRes, idxRes) => {
                  return (
                    <tr className="table-updated-tr">{this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {
                        return (
                          <td className={idx == 0  ? "col-xs-2 table-updated-th text-left" : "col-xs-2 table-updated-th text-right"}  >{objRes[Object.keys(obj)]}</td>
                          )
                      })}
                    </tr>
                  );
                })}
                </tbody>
                {this.state.showLoader !== true && this.state.reportDataValues !== undefined && this.state.reportDataValues.length == 0 && <tr className="table-updated-tr"><td className="no-record no-float" colSpan={11}>{this.state.salesLang.sales_no_record_found}</td></tr>}
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

  if (state.SalesReducer.action === "SHORT_TERM_LIABILITY_LIST") {
    if (state.SalesReducer.data.status === 200) {
      return {
  			ShortTermLiabilityList: state.SalesReducer.data
      };
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      fetchShortTermLiability: fetchShortTermLiability
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ShortTermLiability);
