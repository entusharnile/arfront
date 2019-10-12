import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Select from 'react-select';
import { getPosPayment,getPosExport,exportEmptyData} from '../../../../Actions/Settings/settingsActions.js';
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'
import { numberFormat,getCurrencyLabel,showFormattedDate, autoScrolling } from "../../../../Utils/services.js";
import config from '../../../../config';

class PosPayments extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      hasMoreItems: true,
      next_page_url: '',
      userList: [],
      loadMore: true,
      startFresh: true,
      showLoader: false,
      showLoadingText: false,
      userData: '',
      page: 1,
      pagesize: 15,
      posPaymentList:[],
      payout_last_updated:'',
      posPaymentExport:{}
    }
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop))
      if (
        window.innerHeight + scrollTop
        === document.documentElement.offsetHeight
        && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  componentDidMount() {
    this.setState({
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      posPaymentList: [],
      showLoader:true,
      next_page_url:'',
      showLoader:true
    });
    autoScrolling(true);
    this.props.getPosPayment({
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize
      }
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false && nextProps.showLoader != prevState.showLoader){
      nextProps.exportEmptyData();
      return {showLoader:false}
    } else if (nextProps.posPaymentExport != undefined && nextProps.posPaymentExport != prevState.posPaymentExport){
      nextProps.exportEmptyData();
      returnState.showLoader = false;
      returnState.posPaymentExport = nextProps.posPaymentExport;
      window.open(config.API_URL+"download-data/"+nextProps.posPaymentExport.file, "_blank");
      return returnState;
    } if (nextProps.posPaymentList != undefined && nextProps.posPaymentList.payments != undefined &&
      nextProps.posPaymentList.payments.next_page_url !== prevState.next_page_url) {
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        autoScrolling(false);
        return returnState;
      }
      if (prevState.posPaymentList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.posPaymentList = nextProps.posPaymentList.payments.data;
          returnState.payout_last_updated = nextProps.posPaymentList.payout_last_updated;
          if (nextProps.posPaymentList.payments.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.posPaymentList.payments.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          localStorage.setItem('showLoader', false);
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (prevState.posPaymentList != nextProps.posPaymentList.payments.data &&
        prevState.posPaymentList.length != 0) {
        returnState.posPaymentList = [
          ...prevState.posPaymentList,
          ...nextProps.posPaymentList.payments.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.posPaymentList.payments.next_page_url;
        localStorage.setItem('showLoader', false);
        returnState.showLoader = false;
        returnState.showLoadingText = false;
      }
      autoScrolling(false);
      return returnState;
    }
    return returnState;

  }

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem('sortOnly', false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true })
      autoScrolling(true);
      this.props.getPosPayment({
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize
        }
      });
    }
  }

  getPosExport = (type) => {
    this.setState({showLoader:true})
    this.props.getPosExport({
      export_type : type, //required, string values[xls,csv]
      export_name : 'payments' //required, string values[payments,payouts]
    });
  }

  render() {
    return (
      <div className="main protected">
        <Header />
        <div id="content" className="pos-content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-search-outer">
                {(this.state.payout_last_updated != undefined && this.state.payout_last_updated != null && this.state.payout_last_updated != '') &&
                  <span className="pull-left search-text">{this.state.settingsLang.pos_payments_and_payouts_data_last_updated}: {this.state.payout_last_updated} (UTC)</span>
                }
                <div className="dropdown pull-right no-width">
                  <button className="line-btn no-margin no-width" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{this.state.globalLang.label_export_text}<i className="fas fa-angle-down" /></button>
                  <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a href="javascript:void(0);" onClick={this.getPosExport.bind(this,'csv')}>{this.state.globalLang.label_export_as_csv_text}</a></li>
                    <li><a href="javascript:void(0);" onClick={this.getPosExport.bind(this,'xls')}>{this.state.globalLang.label_export_as_excel_text}</a></li>
                  </ul>
                </div>
              </div>
              <div className="setting-container no-padding">
                <div className="table-responsive">
                  <table className="table-updated no-hover setting-table table-min-width">
                    <thead className="table-updated-thead">
                      <tr>
                        <th className="col-lg-2 col-xs-3 table-updated-th text-right">{this.state.globalLang.label_amount}</th>
                        <th className="col-lg-2 col-xs-3 table-updated-th no-border-left" />
                        <th className="col-lg-5 col-xs-3 table-updated-th">{this.state.globalLang.label_customers}</th>
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
                <Loader showLoader={this.state.showLoader} />
                <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "POS_PAYMENT_LIST") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posPaymentList = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "POS_PAYMENT_PAYOUT_EXPORT") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posPaymentExport = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "EMPTY_DATA") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getPosPayment: getPosPayment,getPosExport:getPosExport,exportEmptyData:exportEmptyData}, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosPayments);
