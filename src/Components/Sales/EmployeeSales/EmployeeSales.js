import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import moment from 'moment';
import { fetchEmployeeSales} from '../../../Actions/Sales/salesActions.js';
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
class EmployeeSales extends Component {

  constructor(props) {
    super(props);
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
      page: 1,
      pagesize: 15,
      hasMoreItems: true,
      reminder_before: '',
      reminder_type: '',
      locationArray: [],
      EmployeeSalesList: [],
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
      employeeObjList:{},
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
    this.setState({showModal: true, reminderId: e.currentTarget.dataset.userid});
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
    this.props.fetchEmployeeSales(formData);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.EmployeeSalesList !== undefined && props.EmployeeSalesList.status === 200 && state.EmployeeSalesList != props.EmployeeSalesList.data) {
      let returnState = {};
      let reportData = props.EmployeeSalesList.data.report_data;
      if(reportData.length) {
        reportData.map((obj, idx) => {
          returnState['upDown-'+idx] = false;
        })
      }

        returnState.EmployeeSalesList= props.EmployeeSalesList.data;
        returnState.sales_header= props.EmployeeSalesList.data.sales_header;
        returnState.total= props.EmployeeSalesList.data.total;
        returnState.reportDataValues= props.EmployeeSalesList.data.report_data;
        returnState.locationArray= props.EmployeeSalesList.data.clinics;
        returnState.reportHeader= props.EmployeeSalesList.data.report_header;
        returnState.grouping= props.EmployeeSalesList.data.grouping;
        returnState.showLoader = false;
        return returnState;
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
    let reminders = this.state.EmployeeSalesList;
      if(reminders.length) {
        reminders.map((obj, idx) => {
          if(obj.id == this.state.reminderId){
            delete reminders[idx];
          }
        })
        this.setState({EmployeeSalesList : reminders});
    }
    this.props.deleteEmployeeSalesList(this.state.reminderId);
    this.dismissModal();
  }

  handleChildSubmit = (childState) => {
    this.setState(childState);
    let formData = {
      fromDate: apiDateFormat(childState.fromDate), //'2018-04-01', // ,
      toDate: apiDateFormat(childState.toDate), //'2019-05-31', //,
      clinic_id:childState.selectedLocationIdList
    };
    this.setState({'showLoader': true});
    this.props.fetchEmployeeSales(formData);
  }

  toggleAnchor = (idx) => {
    let returnState = {};
    returnState['upDown-'+idx] = !this.state["upDown-"+idx];
    this.setState(returnState);
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
            <SalesFilter locationArray={this.state.locationArray} handleChildSubmit={this.handleChildSubmit} clinicVal= {this.state.selectedLocationIdList} location={true} dateRangePick={true} reportType={'employee_sales_report'} />
            <div className="bg-light-blue juvly-container">
              <div className="juvly-title">{this.state.salesLang.sales_employee_sales}</div>
                <div className="new-all-stats">
                {
                salesHeaderValue.length > 0  && salesHeaderValue.map((obj, idx) => {
                  var str = obj.key;
                  var newStr = str.replace("total_invoices", this.state.salesLang.label_sales);
                  var st = newStr.replace(/_/g, " ");
                return (
                    <div className="stats-section" key ={idx}>
                      <div className="dash-box-title" >{st}</div>
                      <div className="new-all-stats-content" id="monthly_sales">{obj.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="table-responsive">
              <div className="accordion-table sales-accordian accord-min-width employee-sale-table">
                <div className="accordion-row accordion-head">
                  {this.state.reportHeader.length > 0 && this.state.reportHeader.map((obj, idx) => {
                    return (<div className={idx == 0 ? "accordian-section text-left" : "accordian-section text-right"} key ={idx}>{Object.values(obj)}</div>)
                  })}
                </div>

                  {(this.state.reportDataValues.length > 0) && this.state.reportDataValues.map((obj, idx) => {
                    return (<>
                      <div className="accordion-row">
                        <div className="accordion-title profile">
                      {
                        (this.state.reportHeader.length > 0) && this.state.reportHeader.map((objInner, idxInner) => {
                          return (
                            <div className={idxInner == 0 ? "accordian-section text-left inner-box no-wrap" : "accordian-section text-right inner-box no-wrap"} key ={idxInner}>
                              {(idxInner === 0 && obj.data.length > 0) &&  (<><a className={(this.state.grouping == "yes") && (this.state["upDown-"+idx] == false) ? "" : "no-display"} name="upDown" value = {this.state.upDown} onClick={this.toggleAnchor.bind(this, idx)} >
                                <i className="fas fa-angle-down toggle-arrow"/>
                                  </a>
                                   <a className={(this.state.grouping == "yes") && (this.state["upDown-"+idx] == true) ? "" : "no-display"} name="upDown" value = {this.state.upDown} onClick={this.toggleAnchor.bind(this, idx)}  >
                                     <i className="fas fa-angle-up toggle-arrow"/>
                                   </a></>)} {obj.employee && obj.employee[Object.keys(objInner)]}
                            </div>
                          )
                        })
                      }
                      </div>
                        {(obj.data.length > 0) && this.state.reportHeader.length > 0 && obj.data.map((dataSet, dataIdx)=> {
                          return (<div className={(this.state.grouping == "yes") && (this.state["upDown-"+idx] == true) ? "accordion-discription-row" : "accordion-discription-row no-display" } key ={dataIdx}>
                            {this.state.reportHeader.map((objInner, idxInner) => {
                              return (<div className={idxInner == 0 ? "accordian-section text-left" : "accordian-section text-right"} key = {idxInner}>{dataSet[Object.keys(objInner)]}</div>)
                            })}</div>
                          )
                        })}
                        </div>
                      </>
                    )
                  })
                }

                <div className="accordion-discription-row">
                  <div className="accordian-section  text-left" ><b>{this.state.salesLang.sales_total}</b></div>
                  {
                  totalValue.length > 0  && totalValue.slice(1).map((obj, idx) => {
                  return (
                      <div className="accordian-section text-right" key={idx}><b>{obj.value}</b></div>
                    );
                  })}
                </div>
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
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));

  if (state.SalesReducer.action === "EMPLOYEE_SALES_REPORT_LIST") {
    if (state.SalesReducer.data.status === 200) {
      return {
  			EmployeeSalesList: state.SalesReducer.data
      };
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      fetchEmployeeSales: fetchEmployeeSales
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeSales);
