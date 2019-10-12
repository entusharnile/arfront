import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Select from 'react-select';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import PosDashboardGraph from './PosDashboardGraph';
import calenLogo from '../../../../images/calender.svg';
import { format, addDays } from 'date-fns';
import { getPosDashboard,getPosDashboardFilter} from '../../../../Actions/Settings/settingsActions.js';
import { numberFormat,getCurrencyLabel, showFormattedDate } from "../../../../Utils/services.js";
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'

class PosDashboard extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      dashboardLang: languageData.dashboard,
      showLoader: false,
      activityTabName: 'payments',
      dateRangePicker: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
      to_date: format(new Date(), 'YYYY-MM-DD'),
      from_date: format(new Date(), 'YYYY-MM-DD'),
      rangeSelected:'Today',
      showCalendar: false,
      posDashboardData:{},
      posPaymentList:[],
      posPayoutList:[],
      paymentGraphData:{
        payments:[],
        time:[],
        total:0
      },
      stripe_account_balance:0,
      total_today:0,
      verification_fields:0,
      payout_last_updated:'',
      clicked:0

    }
  }
  //dash_customers_text

  componentDidMount() {
    document.addEventListener('click', this.handleClick, false);
    this.setState({showLoader:true})
    this.props.getPosDashboard();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.posDashboardData != undefined && nextProps.posDashboardData != prevState.posDashboardData){
      returnState.showLoader = false;
      returnState.posDashboardData = nextProps.posDashboardData;
      returnState.posPaymentList = returnState.posDashboardData.payments;
      returnState.posPayoutList = returnState.posDashboardData.payouts;
      returnState.paymentGraphData = returnState.posDashboardData.payments_graph_data;
      returnState.stripe_account_balance = returnState.posDashboardData.stripe_account_balance;
      returnState.verification_fields = returnState.posDashboardData.verification_fields;
      returnState.payout_last_updated = returnState.posDashboardData.payout_last_updated;
    } else if(nextProps.paymentGraphData != undefined && nextProps.paymentGraphData != prevState.paymentGraphData){
      returnState.showLoader = false;
      returnState.paymentGraphData = nextProps.paymentGraphData;
    } else if(nextProps.showLoader != undefined && nextProps.showLoader != prevState.showLoader && nextProps.showLoader == false){
      returnState.showLoader = false;
    }
    return returnState;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleClick = (e) =>  {
    if (e.target && e.target.className !== undefined && typeof e.target.className === 'string' && (e.target.className.indexOf('rdrStaticRangeLabel') > -1)) {
        if ( e.target.childNodes ) {
          this.setState({rangeSelected:e.target.innerHTML})
        }
    }
    if (this.node.contains(e.target) && this.state.showCalendar === true ) {
      return
    }
    this.toggleCalendar(e.target);
  }

  handleRangeChange = (which, payload) => {
    let startDate = payload.selection.startDate
    let endDate   = payload.selection.endDate
    startDate     = format(startDate, 'YYYY-MM-DD')
    endDate       = format(endDate, 'YYYY-MM-DD')

    let clicked   = this.state.clicked + 1;

    let localPref = localStorage.getItem('focusedRange');
    let canBypass = (localPref && localPref === 'oneClick') ? true : false;

    if (canBypass) {
      clicked = 2;
    }

    let showCalendar = true;

    if ( clicked % 2 === 0 ) {
      showCalendar = false;
    }

    this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
      showCalendar : showCalendar,
      from_date    : startDate,
      to_date      : endDate,
      clicked      : clicked
    });

    if ( clicked && clicked % 2 === 0 ) {
      this.handleSubmit(which, {"from_date" : startDate, "to_date" : endDate})
    }
  }

  toggleCalendar = (elem) => {
    if ( elem.name !== 'calendar-input' && this.state.showCalendar === false ) {
      return
    }

    let showCalendar = false

    if (this.state.showCalendar === false && elem.name !== undefined && elem.name === 'calendar-input' ) {
      showCalendar = true
    } else {
      showCalendar = false
    }

    this.setState({showCalendar : showCalendar})
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value = target.value;
    const name = target.name;
    let returnState = {}
    returnState.dataChanged = true;
    switch (target.type) {
      case 'checkbox':
        value = target.checked;
        break;
      case 'radio':
        //value = target.checked;
        break;
    }
    returnState[name] = value;
    this.setState(returnState);
  }

  handleSubmit = (event, value) => {
    if (typeof event === 'object' ) {
      event.preventDefault();
    }
    let formData = {
      params: {
        from_date: (value != undefined && value.from_date != undefined) ? value.from_date : this.state.from_date,
        to_date: (value != undefined && value.to_date != undefined) ? value.to_date : this.state.to_date,
      }
    };
    this.setState({showLoader: true});
    this.props.getPosDashboardFilter(formData);
  }

  handleActivityTab = (activityTabName) => {
    if(this.state.activityTabName != activityTabName){
      this.setState({activityTabName:activityTabName});
    }
  }

  labelAndAmount = (amount,status) => {
		let statusClass = 'payment-Succeeded';
		if(status == 'in_transit') {
      status = this.state.settingsLang.setting_in_transit;
			statusClass = 'payment-transit';
		} else {
      amount = String(amount);
			if(amount.indexOf("-") != -1){
        status = this.state.settingsLang.setting_withdrawn;
        amount = amount.substr(1, (amount.length - 1));
			} else {
				status = this.state.settingsLang.setting_paid;
			}
		}
    return {
      amount : parseInt(amount),
      status : status,
      statusClass : statusClass,
    }
  }

  render() {
  let  defaultOptions = [];
  let options = [];

    return (
      <div className="main protected">
        <Header />
        <div id="content" className="content-pos-dashboard">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              {(this.state.verification_fields > 0) &&
                <div className="verification-field-warning">
                  <div className="alert">
                    <i className="fas fa-exclamation-triangle field-warning-color" />&nbsp;&nbsp;&nbsp;&nbsp;{this.state.settingsLang.pos_please_provide_the}&nbsp;
                    <Link to="/settings/pos-dashboard/verification" className="modal-link field-warning-color">&nbsp;verification fields</Link> {this.state.settingsLang.pos_to_keep_the_account_in_good_standing}
                  </div>
                </div>
              }
              <div className="setting-search-outer">
                <form onSubmit={this.handleSubmit}>
                  <div className="search-bg new-calender pull-left" ref={node => {this.node = node}}>
                  <img src={calenLogo} />
                    {this.state.showCalendar && <DateRangePicker
                      ranges={[this.state.dateRangePicker.selection]}
                      onChange={this.handleRangeChange.bind(this, 'dateRangePicker')}
                      moveRangeOnFirstSelection={false}
                      className={'CalendarPreviewArea'}
                      months={1}
                      scroll={{ enabled: true }}
                      maxDate={addDays(new Date(), 900)}
                      minDate={addDays(new Date(), -365)}
                      dragSelectionEnabled={false}
                      /> }
                    <input type="text" className="input-cal setting-search-input" name="calendar-input" value={(this.state.from_date) ? showFormattedDate(this.state.from_date, false) + `-` + showFormattedDate(this.state.to_date, false) : ""} autoComplete="off" onChange={this.handleInputChange} />
                  </div>
                </form>
                {(this.state.payout_last_updated != undefined && this.state.payout_last_updated != null && this.state.payout_last_updated != '') &&
                  <span className="pull-right search-text">{this.state.settingsLang.pos_payments_and_payouts_data_last_updated}: {this.state.payout_last_updated}  (UTC)</span>
                }
              </div>
              <div className="setting-container border-top">
                <div className="setting-title">
                  <span id="chosenlabel">{this.state.rangeSelected}</span> <span id="stripe_total_charges">{numberFormat(this.state.paymentGraphData.total, 'currency',2)}</span>
                  <PosDashboardGraph storageData={this.state.paymentGraphData} />
                </div>
              </div>
              <div className="setting-container border-top">
                <div className="setting-title m-b-40">{this.state.globalLang.label_balance}</div>
                <div className="row">
                  <div className="col-lg-2 col-sm-4">
                    <div className="setting-field-outer">
                      <div className="new-field-label balance-label">{this.state.globalLang.label_total_balance} </div>
                      <div className="dashboard-bal" id="tooltip-content" data-toggle="tooltip" data-html="true">{numberFormat(this.state.stripe_account_balance, 'currency',2)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="setting-container border-top no-padding-bottom">
                <div className="setting-title">{this.state.globalLang.label_activity}</div>
              </div>
              <div className="setting-container no-padding">
                <ul className="sub-menus activity-menu">
                  <li className={(this.state.activityTabName == 'payments') ? "sub-menus-li active" : "sub-menus-li" }>
                    <a href="#payments" aria-controls="payments" role="tab" data-toggle="tab" className="sub-menus-a activity-tabs active" aria-expanded="true" onClick={this.handleActivityTab.bind(this,'payments')}>{this.state.settingsLang.sidebar_POS_payments_menu}</a>
                  </li>
                  <li className={(this.state.activityTabName == 'payouts') ? "sub-menus-li active" : "sub-menus-li" }>
                    <a href="#payouts" aria-controls="payouts" role="tab" data-toggle="tab" className="sub-menus-a activity-tabs active" aria-expanded="false"onClick={this.handleActivityTab.bind(this,'payouts')}>{this.state.settingsLang.sidebar_POS_payouts_menu}</a>
                  </li>
                </ul>
                {/* Tab panes */}
                <div className="tab-content">
                  <div role="tabpanel" className={(this.state.activityTabName == 'payments') ? "tab-pane active" : "tab-pane"} id="payments">
                    <div className="table-responsive fixed-height-302">
                      <table className="table-updated no-hover setting-table table-min-width">
                        <thead className="table-updated-thead">
                          <tr>
                            <th className="col-lg-2 col-xs-3 table-updated-th text-right">{this.state.globalLang.label_amount}</th>
                            <th className="col-lg-2 col-xs-3 table-updated-th no-border-left" />
                            <th className="col-lg-5 col-xs-3 table-updated-th">{this.state.dashboardLang.dash_customers_text}</th>
                            <th className="col-lg-3 col-xs-3 table-updated-th text-right">{this.state.globalLang.label_date}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(this.state.posPaymentList.length)
                            ?
                            this.state.posPaymentList.map((obj,idx) => {
                                return (
                                  <tr className="table-updated-tr" key={'posPayment-'+idx}>
                                    <td className="table-updated-td text-right">
                                      <label className="payment-amount">{numberFormat(((obj.amount > 0) ? (obj.amount / 100) : 0), 'currency',2)}</label>
                                    </td>
                                    <td className="table-updated-td no-padding no-border-left">
                                      <span className="payment-currancy">{getCurrencyLabel().toUpperCase()}</span>
                                      <div className="payment-Succeeded">{this.state.settingsLang.setting_succeeded}</div>
                                    </td>
                                    <td className="table-updated-td">{(obj.account != undefined && obj.account.admin != undefined && obj.account.admin.customer_name != undefined) ? obj.account.admin.customer_name : ''}</td>
                                    <td className="table-updated-td text-right">{showFormattedDate(obj.created,true)}</td>
                                  </tr>
                                )
                            })
                            :
                            <tr className="table-updated-tr">
                              <td className="table-updated-td text-center" colSpan={4}>
                                {(this.state.showLoader === false) && <div className="no-record">{this.state.globalLang.sorry_no_record_found}</div>}
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                    {(this.state.posPaymentList.length > 0) &&
                      <div className="footer-static no-border">
                        <Link to="/settings/pos-payments" className="new-blue-btn pull-right">{this.state.settingsLang.pos_view_all_payments}</Link>
                      </div>
                    }
                  </div>
                  <div role="tabpanel" className={(this.state.activityTabName == 'payouts') ? "tab-pane active" : "tab-pane"} id="payouts">
                    <div className="table-responsive fixed-height-302">
                      <table className="table-updated no-hover setting-table table-min-width">
                        <thead className="table-updated-thead">
                          <tr>
                            <th className="col-lg-2 col-xs-2 table-updated-th text-right">{this.state.globalLang.label_amount}</th>
                            <th className="col-lg-2 col-xs-3 table-updated-th no-border-left" />
                            <th className="col-lg-5 col-xs-5 table-updated-th">{this.state.settingsLang.pos_bank_card}</th>
                            <th className="col-lg-3 col-xs-3 table-updated-th text-right">{this.state.globalLang.label_date}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(this.state.posPayoutList.length)
                            ?
                            this.state.posPayoutList.map((obj,idx) => {
                              const labelAndAmount = this.labelAndAmount(obj.amount, obj.status);
                                return (
                                  <tr className="table-updated-tr" key={'posPayout-'+idx}>
                                    <td className="table-updated-td text-right">
                                      <label className="payment-amount">{numberFormat(((labelAndAmount.amount > 0) ? (labelAndAmount.amount / 100) : 0), 'currency',2)}</label>
                                    </td>
                                    <td className="table-updated-td no-padding no-border-left">
                                      <div className={labelAndAmount.statusClass}>{labelAndAmount.status}</div>
                                    </td>
                                    <td className="table-updated-td">{((obj.bank_account != undefined && obj.bank_account.bank_name != undefined) ? obj.bank_account.bank_name : '')} **** {((obj.bank_account != undefined && obj.bank_account.last4 != undefined) ? obj.bank_account.last4 : '')}</td>
                                    <td className="table-updated-td text-right no-padding-left">{showFormattedDate(obj.arrival_date,true)}</td>
                                  </tr>
                                )
                            })
                            :
                            <tr className="table-updated-tr">
                              <td className="table-updated-td text-center" colSpan={5}>
                                {(this.state.showLoader === false) && <div className="no-record">{this.state.globalLang.sorry_no_record_found}</div>}
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                    {(this.state.posPayoutList.length > 0) &&
                      <div className="footer-static no-border">
                        <Link to="/settings/pos-payments" className="new-blue-btn pull-right">{this.state.settingsLang.pos_view_all_payments}</Link>
                      </div>
                    }
                  </div>
                </div>
              </div>
              <Loader showLoader={this.state.showLoader} />
            </div>

          </div>
          {/* Setting Modal - START */}
          <div className={this.state.isShowSettingModal ? "modalOverlay" : 'no-display' }>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.settingsLang.pos_dispute_emails_setting}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handleSettingModal} >×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-sm-12 col-xs-12">
                      <div className="setting-field-outer m-b-65">
                        <div className="new-field-label alert-modal-title">{this.state.settingsLang.pos_disputes_setting_alert_msg}</div>
                        <div className="setting-input-outer">
                        <div className="tag-auto-select">
                          {
                            options && <Select
                            onChange={this.handleChange}

                            value={defaultOptions}
                            isClearable
                            isSearchable
                            options={options}
                            isMulti={true}
                          />
                          }
                          </div>
            						</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-blue-btn pull-right">{this.state.globalLang.label_save}</a>
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handleSettingModal}>{this.state.globalLang.label_cancel}</a>
              </div>
            </div>
          </div>
          {/* Setting Modal - END */}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "POS_DASHBOARD_DATA") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posDashboardData = state.SettingReducer.data.data;
    }
  }
  if (state.SettingReducer.action === "POS_DASHBOARD_FILTER_DATA") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.paymentGraphData = state.SettingReducer.data.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getPosDashboard: getPosDashboard, getPosDashboardFilter:getPosDashboardFilter}, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosDashboard);
