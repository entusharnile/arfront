import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Select from 'react-select';
import { getPosPayoutDetail} from '../../../../Actions/Settings/settingsActions.js';
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'
import { numberFormat,getCurrencyLabel,showFormattedDate } from "../../../../Utils/services.js";

const CurrencyLabel =  getCurrencyLabel().toUpperCase();

class PosPayoutsView extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      dashboardLang: languageData.dashboard,
      showLoader: false,
      posPayoutData:{},
      payoutDetails:{},
      payoutTransactions:{},
      payout_last_updated:'',
      payoutId:0,
      isShowSettingModal:false,
      amount : 0.00,
      status : '',
      statusClass : 'payment-Succeeded',
      summary:{
        payments:{
          count:0,
          gross:0,
          fees:0,
          total:0
        },
        refunds:{
          count:0,
          gross:0,
          fees:0,
          total:0
        }
      }
    }

  }

  componentDidMount() {
    const payoutId = this.props.match.params.id;
    if(payoutId) {
      this.setState({showLoader: true})
      this.setState({payoutId : payoutId,showLoader: true});
      this.props.getPosPayoutDetail(payoutId);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false && nextProps.showLoader != prevState.showLoader){
      return {showLoader:false}
    } else if (nextProps.posPayoutData != undefined && nextProps.posPayoutData != prevState.posPayoutData){
      returnState.showLoader = false;
      returnState.posPayoutData = nextProps.posPayoutData;
      returnState.payoutDetails = nextProps.posPayoutData.payout_details
      returnState.payoutTransactions =nextProps.posPayoutData.payout_transactions

      // get status label and amount
      let statusClass = 'payment-Succeeded';
      let status = returnState.payoutDetails.status;
      let amount = returnState.payoutDetails.amount;
  		if(status == 'in_transit') {
        status = prevState.settingsLang.setting_in_transit;
  			statusClass = 'payment-transit';
  		} else {
        amount = String(amount);
  			if(amount.indexOf("-") != -1){
          status = prevState.settingsLang.setting_withdrawn;
          amount = amount.substr(1, (amount.length - 1));
  			} else {
  				status = prevState.settingsLang.setting_paid;
  			}
  		}
      returnState.status = status;
      returnState.amount = amount;
      returnState.statusClass = statusClass;

      // get summary
      let summary = prevState.summary;
      returnState.payoutTransactions.map((obj,idx)=>{
        if(obj.type == 'application_fee') {
          //summary['payments']['fees'] += obj.amount;
        }
        if(obj.type == 'charge' || obj.type == 'payment') {
          summary['payments']['gross'] += obj.amount;
          summary['payments']['count'] += 1;

          if(obj.fee_details !== undefined && obj.fee_details !== null){
            obj.fee_details.map((obj1, idx1) => {
              if(obj1.type == 'application_fee') {
                summary['payments']['fees'] += obj.amount;
              }
            })
          }

        }
        if(obj.type == 'refund') {
          summary['refunds']['gross'] += obj.amount;
          summary['refunds']['count'] += 1;
        }
      });
      summary['payments']['total'] = summary['payments']['gross'] - summary['payments']['fees'];
      summary['refunds']['total'] = summary['refunds']['gross'] - summary['refunds']['fees'];
      returnState.summary = summary;
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false && nextProps.showLoader != prevState.showLoader){
      returnState.showModal = false
    }
    return returnState;
  }

  handleSettingModal = () => {
    this.setState({isShowSettingModal: !this.state.isShowSettingModal})
  }



  render() {
    return (
      <div className="main protected">
        <Header />
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-container">
                <div className="setting-title m-b-40">{this.state.settingsLang.pos_payout_details}</div>
                <div className="row">
                  <div className="col-md-5"><div className="payment-Succeeded payout-payment-suceed">{this.state.settingsLang.setting_paid}</div><b>{numberFormat((this.state.amount / 100), 'currency',2)} {CurrencyLabel}</b></div>
                  <div className="col-md-7">
                    <div className="bank-account payout-bank-account pull-right"><img src="/images/bank-logo.png" className="transit-usd" />
                    {((this.state.payoutDetails.bank_account != undefined && this.state.payoutDetails.bank_account.bank_name != undefined) ? this.state.payoutDetails.bank_account.bank_name : null)} **** {((this.state.payoutDetails.bank_account != undefined && this.state.payoutDetails.bank_account.last4 != undefined) ? this.state.payoutDetails.bank_account.last4 : null )}
                    &nbsp;&nbsp;&nbsp; <div className="payment-transit transit-usd">{CurrencyLabel}</div></div>
                  </div>
                </div>
              </div>
              <div className="setting-container border-top">
                <div className="setting-title m-b-0">{this.state.settingsLang.pos_summary}</div>
              </div>
              <div className="table-responsive">
                <table className="table-updated no-hover setting-table table-min-width">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="col-xs-4 table-updated-th sorting">&nbsp;</th>
                      <th className="col-xs-2 table-updated-th sorting text-right">{this.state.settingsLang.pos_count}</th>
                      <th className="col-xs-2 table-updated-th sorting text-right">{this.state.settingsLang.pos_gross}</th>
                      <th className="col-xs-2 table-updated-th sorting text-right">{this.state.settingsLang.pos_fees}</th>
                      <th className="col-xs-2 table-updated-th sorting text-right">{this.state.settingsLang.pos_total}</th>
                    </tr>
                  </thead>
                  <tbody>

                    <tr className="table-updated-tr">
                      <td className="table-updated-td">{this.state.settingsLang.sidebar_POS_payments_menu}</td>
                      <td className="table-updated-td text-right">{this.state.summary.payments.count}</td>
                      <td className="table-updated-td text-right">{(this.state.summary.payments.gross >0) ? numberFormat((this.state.summary.payments.gross/100),'currency',2) : numberFormat(0.00,'currency',2)}</td>
                      <td className="table-updated-td text-right">({(this.state.summary.payments.fees >0) ? numberFormat((this.state.summary.payments.fees/100),'currency',2) : numberFormat(0.00,'currency',2)})</td>
                      <td className="table-updated-td text-right">{(this.state.summary.payments.total >0) ? numberFormat((this.state.summary.payments.total/100),'currency',2) : numberFormat(0.00,'currency',2)}</td>
                    </tr>
                    <tr className="table-updated-tr">
                      <td className="table-updated-td">{this.state.settingsLang.pos_refunds}</td>
                      <td className="table-updated-td text-right">{this.state.summary.refunds.count}</td>
                      <td className="table-updated-td text-right">{(this.state.summary.refunds.gross >0) ? numberFormat((this.state.summary.refunds.gross/100),'currency',2) : numberFormat(0.00,'currency',2)}</td>
                      <td className="table-updated-td text-right">({(this.state.summary.refunds.fees >0) ? numberFormat((this.state.summary.refunds.fees/100),'currency',2) : numberFormat(0.00,'currency',2)})</td>
                      <td className="table-updated-td text-right">{(this.state.summary.refunds.total >0) ? numberFormat((this.state.summary.refunds.total/100),'currency',2) : numberFormat(0.00,'currency',2)}</td>
                    </tr>
                    <tr className="table-updated-tr">
                      <td className="table-updated-td" colSpan={3}><b>{this.state.settingsLang.sidebar_POS_payouts_menu}</b></td>
                      <td className="table-updated-td text-right no-border-left" colSpan={2}><b>{numberFormat((this.state.amount / 100), 'currency',2)}</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="setting-container">
                <div className="setting-title m-b-0">{this.state.settingsLang.pos_transactions}
                </div>
              </div>
              <div className="table-responsive">
                <table className="table-updated no-hover setting-table table-min-width">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="col-xs-2 table-updated-th sorting">{this.state.settingsLang.pos_type}</th>
                      <th className="col-xs-2 table-updated-th sorting text-right">{this.state.settingsLang.pos_gross}</th>
                      <th className="col-xs-2 table-updated-th sorting text-right">{this.state.settingsLang.pos_fees}</th>
                      <th className="col-xs-2 table-updated-th sorting text-right">{this.state.settingsLang.pos_total}</th>
                      <th className="col-xs-2 table-updated-th sorting">{this.state.settingsLang.pos_details}</th>
                      <th className="col-xs-2 table-updated-th sorting text-right">{this.state.globalLang.label_date}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.payoutTransactions.length > 0 ?
                      this.state.payoutTransactions.map((obj,idx)=>{
                          return (
                            (obj.type == 'charge' || obj.type == 'payment') &&
                            <tr className="table-updated-tr" key={'payoutTransactions-'+idx}>
                    					<td className="table-updated-td">Payment</td>
                    					<td className="table-updated-td text-right">{numberFormat((obj.amount/100),'currency',2)} {CurrencyLabel}</td>
                    					<td className="table-updated-td text-right">{numberFormat(((obj.amount - obj.net)/100),'currency',2)} {CurrencyLabel}</td>
                    					<td className="table-updated-td text-right">{numberFormat((obj.net/100),'currency',2)} {CurrencyLabel}</td>
                    					<td className="table-updated-td">{obj.description}</td>
                    					<td className="table-updated-td text-right">{showFormattedDate(String(obj.created))}</td>
                    				</tr>
                          )
                      })
                      :
                      <tr className="table-updated-tr">
                        <td colSpan={6} className="table-updated-td text-center">{this.state.globalLang.sorry_no_record_found}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <Loader showLoader={this.state.showLoader} />
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
  if (state.SettingReducer.action === "POS_PAYOUT_DATA") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posPayoutData = state.SettingReducer.data.data;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getPosPayoutDetail: getPosPayoutDetail}, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosPayoutsView);
