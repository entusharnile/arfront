import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
//import Sidebar from '../../../../Containers/Settings/sidebar.js';
//import { getAppointmentReminder, deleteAppointmentReminder} from '../../../../Actions/Settings/settingsActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import SalesHeader from '../Common/SalesHeader.js';
import SalesSidebar from '../Common/SalesSidebar.js';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../../images/calender.svg';
import { format, addDays } from 'date-fns';
import Highcharts from 'highcharts';

class SalesInvoicesPopups extends Component {

  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
      var date = new Date();
      var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      globalLang: languageData.global,
      salesLang: languageData.sales,
      dateRangePicker: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
      to_date         : format(firstDay, 'YYYY-MM-DD'),
      from_date       : format(new Date(), 'YYYY-MM-DD'),
      reminder_before: '',
      reminder_type: '',
      appointmentReminder: [],
      userChanged: false,
      userId:'',
      page: 1,
      pagesize: 15,
      sortby: '',
      sortorder: 'asc',
      showLoadingText : false,
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      loadMore: true,
      startFresh: true,
      showLoader: false,
      showModal: false,
      noRecordDisplayEnable: 'no-record',
      noRecordDisplayDisable: 'no-record no-display'
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

  loadMore = () => {
    localStorage.setItem("sortOnly", false);
    this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true });
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortby: this.state.sortby,
        sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : '',
				term: this.state.term,
				scopes : this.state.scopes
      }
    };
    // this.props.getAppointmentReminder(formData);

  };

  componentDidMount(){

    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortby: this.state.sortby,
        sortorder: "asc",
				term: this.state.term,
				scopes : this.state.scopes
      }
    };
    document.addEventListener('click', this.handleClick, false);
    this.setState({'showLoader': true});
    // this.props.getAppointmentReminder(formData);
  }

  onSort = sortby => {
    let sortorder = this.state.sortorder === "asc" ? "desc" : "asc";
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortby: sortby,
        sortorder: sortorder,
				term: this.state.term,
				scopes : this.state.scopes
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url: "",
      appointmentReminder: []
    });
    localStorage.setItem('sortOnly', true);
    this.props.getAppointmentReminder(formData);
  };

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

  handleRangeChange = (which, payload) => {
    let startDate = payload.selection.startDate
    let endDate   = payload.selection.endDate
    startDate     = format(startDate, 'YYYY-MM-DD')
    endDate       = format(endDate, 'YYYY-MM-DD')

    this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
      showCalendar : false,
      from_date    : startDate,
      to_date      : endDate
    });

    this.handleSubmit(which, {"from_date" : startDate, "to_date" : endDate})
  }

  handleClick = (e) =>  {
    if (this.node.contains(e.target) && this.state.showCalendar === true ) {
      return
    }
    this.toggleCalendar(e.target);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.appointmentReminder != undefined &&
      nextProps.appointmentReminder.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem('sortOnly', false)
        return (returnState.next_page_url = null);
      }

      if (prevState.appointmentReminder.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem('sortOnly') == "false") {
					returnState.appointmentReminder = nextProps.appointmentReminder.data;
					if(nextProps.appointmentReminder.next_page_url != null){
						returnState.page = prevState.page + 1;
					} else {
						returnState.next_page_url = nextProps.appointmentReminder.next_page_url;
					}
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        } else {
          localStorage.setItem('sortOnly', false)
        }
      } else if (
        prevState.appointmentReminder != nextProps.appointmentReminder.data &&
        prevState.appointmentReminder.length != 0
      ) {
        returnState.appointmentReminder = [
          ...prevState.appointmentReminder,
          ...nextProps.appointmentReminder.data
        ];
        returnState.next_page_url = nextProps.appointmentReminder.next_page_url;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
			}
			return returnState;
    }

    return null;
  }


  deleteReminder = () => {
    localStorage.setItem('isDelete', true);
    this.dismissModal();
    let reminders = this.state.appointmentReminder;
      if(reminders.length) {
        reminders.map((obj, idx) => {
          if(obj.id == this.state.reminderId){
            delete reminders[idx];
          }
        })
        this.setState({appointmentReminder : reminders});
    }
    this.props.deleteAppointmentReminder(this.state.reminderId);
    this.dismissModal();
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

  render(){
    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <div className="wide-popup">
            <div className="modal-blue-header provider-schedule-popup-title">
              <a href="javascript:void(0);" className="popup-cross">×</a>
              <span className="popup-blue-name">{this.state.salesLang.sales_Invoice_preview}</span>
              <div className="popup-btns">
                <div className="dropdown pull-right m-l-5">
                  <button className="line-btn no-margin" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">{this.state.salesLang.sales_more_info}
                    <i className="fas fa-angle-down" />
                  </button>
                  <ul className="dropdown-menu">
                    <li><a href="javascript:void(0);">{this.state.salesLang.sales_download_invoice}</a></li>
                    <li><a href="javascript:void(0);">{this.state.salesLang.sales_email_invoice}</a></li>
                    <li><a href="javascript:void(0);">{this.state.salesLang.sales_print_invoice}</a></li>
                  </ul>
                </div>
                <a href="javascript:void(0);" className="line-btn pull-right no-width">{this.state.salesLang.sales_payment_history}</a>
                <a href="javascript:void(0);" className="line-btn pull-right no-width">{this.state.salesLang.sales_void}</a>
              </div>
            </div>
            <div className="wide-popup-wrapper time-line m-t-50">
              <center>
                <table id="print_area" border={0} cellPadding={0} cellSpacing={0} height="100%" width={700}>
                  <tbody><tr>
                      <td align="center" valign="top">
                        <table border={0} cellPadding={0} cellSpacing={0} width={700}>
                          <tbody><tr>
                              <td valign="top">
                                <table border={0} cellPadding={5} cellSpacing={0} width={700}>
                                  <tbody><tr>
                                      <td valign="top" width={400}>
                                        <div style={{padding: '5px 0px'}}>
                                          <img src="/images/juvlyL.png" style={{height: '70px'}} />
                                        </div>
                                      </td>
                                      <td valign="top" width={400} align="right">
                                        <div style={{fontSize: '24px', textAlign: 'right', paddingTop: '22px', padding: '10px 0px'}}>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody></table>
                              </td>
                            </tr>
                          </tbody></table>
                        <table border={0} cellPadding={0} cellSpacing={0} width={700}>
                          <tbody><tr>
                              <td align="center" valign="top">
                                <table border={0} cellPadding={0} cellSpacing={0} width={700}>
                                  <tbody><tr>
                                      <td colSpan={3} valign="top">
                                        <table border={0} cellPadding={10} cellSpacing={0} width={700}>
                                          <tbody><tr>
                                              <td valign="top">
                                                <div style={{fontSize: '14px', color: '#777777', lineHeight: '22px', padding: '10px 0px'}}>
                                                  New York Clinic<br />
                                                  +918437815735                                                          </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td valign="top">
                                                <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                  Invoice to
                                                </div>
                                                <div style={{fontSize: '20px', color: '#777777', fontWeight: 300}}>
                                                  dinesh shimar                                                          </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td valign="top" width={400}>
                                                <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                  Address
                                                </div>
                                                <div style={{fontSize: '14px', color: '#777777', fontWeight: 400}}>
                                                  6649 Chaparal Court                                                       </div>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td valign="top" width={400}>
                                                <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                  Email
                                                </div>
                                                <div style={{fontSize: '14px', color: '#777777', fontWeight: 400}}>
                                                  shimardinesh@gmail.com                                                          </div>
                                              </td>
                                              <td valign="top" width={400} align="right">
                                                <table width={230} style={{float: 'right', fontSize: '14px', padding: '10px 0px'}}>
                                                  <tbody><tr>
                                                      <td align="left">Invoice No:</td>
                                                      <td style={{color: '#777777', textAlign: 'right'}}>AR01500010207</td>
                                                    </tr>
                                                    <tr>
                                                      <td align="left">Invoice Date:</td>
                                                      <td style={{color: '#777777', textAlign: 'right'}}>November 15, 2018</td>
                                                    </tr>
                                                    <tr>
                                                      <td align="left">Payment on:</td>
                                                      <td style={{color: '#777777', textAlign: 'right'}}>November 15, 2018</td>
                                                    </tr>
                                                  </tbody></table>
                                              </td>
                                            </tr>
                                          </tbody></table>
                                      </td>
                                    </tr>
                                  </tbody></table>
                              </td>
                            </tr>
                            <tr>
                              <td colSpan={3} valign="top">
                                <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px'}}>
                                  <tbody><tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}><div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>Item description</div></td>
                                      <td style={{borderBottom: '1px solid #dddddd'}} width={100} align="right"><div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>&nbsp;</div></td>
                                      <td style={{borderBottom: '1px solid #dddddd'}} width={100} align="right"><div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>Price</div></td>
                                    </tr>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>70 bogo offer</div>
                                      </td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}><div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>$20.00</div></td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                        A Provider
                                      </td>
                                    </tr>
                                  </tbody></table>
                                <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px'}}>
                                  <tbody><tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}><div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>Redemptions</div></td>
                                      <td style={{borderBottom: '1px solid #dddddd'}} align="right"><div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>Amount</div></td>
                                    </tr>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>Aspire Discount</div>
                                      </td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}><div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>$0.00</div></td>
                                    </tr>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>BD Discount</div>
                                      </td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}><div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>$0.00</div></td>
                                    </tr>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>Wallet Debits</div>
                                      </td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}><div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>$0.00</div></td>
                                    </tr>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>Packages Discount</div>
                                      </td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}><div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>$0.00</div></td>
                                    </tr>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>eGiftcard Amount</div>
                                      </td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}><div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>$0.00</div></td>
                                    </tr>
                                  </tbody></table>
                                <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px', border: '1px solid #000', marginBottom: '25px'}}>
                                  <tbody><tr>
                                      <td width={120} style={{padding: '10px'}}>
                                        <div style={{fontSize: '13px', color: '#777777'}}>TAX</div>
                                        <div style={{fontSize: '17px', color: '#000000', fontWeight: 400}}>$2.00</div>
                                      </td>
                                      <td width={160}>
                                        <div style={{fontSize: '13px', color: '#777777'}}>ITEM DISCOUNT</div>
                                        <div style={{fontSize: '17px', color: '#000000', fontWeight: 400}}>$0.00</div>
                                      </td>
                                      <td width={180}>
                                        <div style={{fontSize: '13px', color: '#777777'}}>CUSTOM DISCOUNT</div>
                                        <div style={{fontSize: '17px', color: '#000000', fontWeight: 400}}>$0.00</div>
                                      </td>
                                      <td width={120}>
                                        <div style={{fontSize: '13px', color: '#777777'}}>TIP</div>
                                        <div style={{fontSize: '17px', color: '#000000', fontWeight: 400}}>$0.00</div>
                                      </td>
                                      <td width={220} style={{background: '#000000', padding: '10px'}} align="right">
                                        <div style={{fontSize: '13px', color: '#ffffff', textAlign: 'right'}}>TOTAL</div>
                                        <div style={{fontSize: '17px', color: '#ffffff', fontWeight: 400, textAlign: 'right'}}>$22.00</div>
                                      </td>
                                    </tr>
                                  </tbody></table>
                                <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px'}}>
                                  <tbody><tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}><div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>Payments</div></td>
                                      <td style={{borderBottom: '1px solid #dddddd'}} align="right"><div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>Amount</div></td>
                                    </tr>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                          Wallet</div>
                                      </td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}><div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>$9.15</div></td>
                                    </tr>
                                    <tr>
                                      <td style={{borderBottom: '1px solid #dddddd'}}>
                                        <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                          Cash</div>
                                      </td>
                                      <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}><div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>$12.85</div></td>
                                    </tr>
                                  </tbody></table>
                                <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '0px', marginBottom: '20px', borderTop: '1px solid #dddddd', borderBottom: '1px solid #dddddd'}}>
                                  <tbody><tr>
                                      <td style={{padding: '20px 10px'}}>
                                        <div style={{fontSize: '13px', color: '#777777'}}>
                                          Services will be invoiced in accordance with the Service Description. You must pay all undisputed invoices in full within 30 days of the invoice date, unless otherwise specified under the Special Terms and Conditions. All payments must reference the invoice number. Unless otherwise specified, all invoices shall be paid in the currency of the invoice Insight retains the right to decline to extend credit and to require that the applicable purchase price be paid prior to performance of Services based on changes in insight's credit policies or your financial condition and/or payment record. Insight reserves the right to charge interest of 1.5% per month or the maximum allowable by applicable law, whichever is less, for any undisputed past due invoices. You are responsible for all costs of collection, including reasonable attorneys' fees, for any payment default on undisputed invoices. In addition, Insight may terminate all further work if payment is not received in a timely manner.
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody></table>
                                <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '-10px'}}>
                                  <tbody><tr>
                                      <td width={400}>
                                        <div style={{fontSize: '18px', fontWeight: 600, color: '#000000'}}>New York Clinic</div>
                                      </td>
                                      <td width={400} align="right">
                                        <div style={{fontSize: '14px', fontWeight: 600, color: '#777777', textAlign: 'right'}}>+918437815735</div>
                                      </td>
                                    </tr>
                                  </tbody></table>
                              </td>
                            </tr>
                          </tbody></table>
                        <br />
                      </td>
                    </tr>
                  </tbody></table>
                  <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                    <div className="loader-outer">
                      <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                    <div id="modal-confirm-text" className="popup-subtitle" >{this.state.salesLang.sales_please_wait}</div>
                  </div>
                  </div>
              </center>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "APPOINTMENT_REMINDER") {
    if (state.SettingReducer.data.status === 200) {
    return {
			appointmentReminder: state.SettingReducer.data.data
    };
  }
  }
  else if (state.SettingReducer.action === "DELETE_APPOINTMENT_REMINDER") {
    localStorage.setItem('isDelete', false);
    if (state.SettingReducer.data.status === 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        appointmentReminderDEL: true
      };
  }
  else {
    toast.error(languageData.global[state.SettingReducer.data.message]);
  }
}

  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      // getAppointmentReminder: getAppointmentReminder,
      // deleteAppointmentReminder: deleteAppointmentReminder
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SalesInvoicesPopups);
