import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Select from 'react-select';
import { getPosPayout,getPosExport,getPosPayoutBank,saveNewPosPayout,exportEmptyData} from '../../../../Actions/Settings/settingsActions.js';
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'
import { numberFormat,getCurrencyLabel,toggleBodyScroll, showFormattedDate, autoScrolling } from "../../../../Utils/services.js";
import config from '../../../../config';

class PosPayouts extends Component {
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
      posPayoutList:[],
      payout_last_updated:'',
      posPaymentExport:{},
      isShowSettingModal:false,
      posPayoutBankList:[],
      available_balance:0.00,
      destination:'',
      amount:0.00,
      description:'',
      statement_descriptor:'',
      availableBalanceClass:'setting-input-box',
      destinationClass:'setting-select-box',
      amountClass:'setting-input-box',
      descriptionClass:'setting-input-box',
      statementDescriptorClass:'setting-input-box',
      dataChanged:false,
      message:'',
      showLoaderSettingModal:false,
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
      posPayoutList: [],
      showLoader:true,
      next_page_url:'',
      showLoader:true,
      page:1
    });
    autoScrolling(true);
    this.props.getPosPayout({
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize
      }
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false){
      nextProps.exportEmptyData();
      return {showLoader:false,showLoaderSettingModal:false}
    } else if (nextProps.reload != undefined && nextProps.reload == true){
      localStorage.setItem("fourceRefresh", 1);

      toast.success(nextProps.message)
      nextProps.getPosPayout({
        'params': {
          page: 1,
          pagesize: prevState.pagesize
        }
      });
      return {
        startFresh: true,
        loadMore: true,
        startFresh: true,
        next_page_url: "",
        //posPayoutList: [],
        showLoader:true,
        next_page_url:'',
        showLoader:true,
        page:1,
        showLoaderSettingModal:false,
        isShowSettingModal:false
      }
    } else if (nextProps.posPaymentExport != undefined && nextProps.posPaymentExport != prevState.posPaymentExport){
      nextProps.exportEmptyData();
      returnState.showLoader = false;
      window.open(config.API_URL+"download-data/"+nextProps.posPaymentExport.file, "_blank");
      return returnState;
    } else if (nextProps.posPayoutBankList != undefined && nextProps.posPayoutBankList != prevState.posPayoutBankList){
      nextProps.exportEmptyData();
      returnState.showLoader = false;
      returnState.showLoaderSettingModal = false;
      returnState.isShowSettingModal = true;
      returnState.posPayoutBankList = nextProps.posPayoutBankList;
      if(!prevState.dataChanged){
        returnState.available_balance=0.00;
        returnState.destination='';
        returnState.amount=0.00;
        returnState.description='';
        returnState.statement_descriptor='';
        returnState.destinationClass='setting-select-box';
        returnState.amountClass='setting-input-box';
        returnState.descriptionClass='setting-input-box';
        returnState.statementDescriptorClass='setting-input-box';
      }
      toggleBodyScroll(true)
      return returnState;
    } if (nextProps.posPayoutList != undefined && nextProps.posPayoutList.payouts != undefined &&
      nextProps.posPayoutList.payouts.next_page_url !== prevState.next_page_url) {
        toggleBodyScroll(false)
      if (localStorage.getItem("fourceRefresh") == 1) {
        prevState.posPayoutList = []
        localStorage.removeItem("fourceRefresh")
      }

      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        autoScrolling(false);
        return returnState;
      }
      if (prevState.posPayoutList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.posPayoutList = nextProps.posPayoutList.payouts.data;
          returnState.payout_last_updated = nextProps.posPayoutList.payout_last_updated;
          if (nextProps.posPayoutList.payouts.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.posPayoutList.payouts.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoaderSettingModal = false;
          returnState.isShowSettingModal = false;
          returnState.showLoadingText = false;
          localStorage.setItem('showLoader', false);
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (prevState.posPayoutList != nextProps.posPayoutList.payouts.data &&
        prevState.posPayoutList.length != 0) {
        returnState.posPayoutList = [
          ...prevState.posPayoutList,
          ...nextProps.posPayoutList.payouts.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.posPayoutList.payouts.next_page_url;
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
      this.props.getPosPayout({
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
      export_name : 'payouts' //required, string values[payments,payouts]
    });
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
    //s = s.replace(/^0+/, '');
    if(name == 'amount'){
      if(value.length > 1 && value.indexOf('0') != -1){
        value = value.replace(/^0+/, '')
        if(value.indexOf('.') != -1){
          value = numberFormat(value,'decimal',2)
        }
      }
    }
    returnState[name] = value;
    this.setState(returnState);
    if(name == 'destination'){
      let available_balance = 0.00;
      if(value != ''){
        this.state.posPayoutBankList.map((obj,idx)=>{
          if(obj.bank_identifier === value){
            available_balance = obj.balance;
          }
        })
      }
      this.setState({available_balance: available_balance});
    }
  }

  handleSubmit = (event, value) => {
    if (typeof event === 'object' ) {
      event.preventDefault();
    }
    let error = false;
    if (typeof this.state.destination === undefined || this.state.destination === null || this.state.destination.trim() === '') {
      this.setState({destinationClass:'setting-select-box field_error'})
      error = true;
    } else if(this.state.destination) {
      this.setState({destinationClass:'setting-select-box'})
    }
    if (typeof this.state.amount === undefined || this.state.amount === null || this.state.amount <= 0) {
      this.setState({amountClass:'setting-input-box field_error'})
      error = true;
    } else if(this.state.amount) {
      this.setState({amountClass:'setting-input-box'})
    }

    if (this.state.destination.trim() != '') {
      let errorMsg = '';
      if(this.state.available_balance <= 0) {
        error = true;
        errorMsg = this.state.globalLang.low_available_balance;
      } else {
        if(this.state.amount > 0 && this.state.amount > this.state.available_balance) {
          errorMsg = this.state.globalLang.amount_should_be_less_than_or_equal_to_available_balance;
          this.setState({amountClass:'setting-input-box field_error'})
        }
      }
      if(errorMsg != ''){
        toast.error(errorMsg);
      }
    }

    if(error){
      return;
    }
    let formData = {
        destination: this.state.destination,
        amount: this.state.amount,
        description: this.state.description,
        statement_descriptor: this.state.statement_descriptor
    };
    this.setState({showLoaderSettingModal: true});
    this.props.saveNewPosPayout(formData);
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

  handleSettingModal = () => {
    toggleBodyScroll(!this.state.isShowSettingModal)
    this.setState({isShowSettingModal: !this.state.isShowSettingModal})
  }

  getPosPayoutBank = () => {
    this.setState({showLoader:true,dataChanged:false});
    this.props.getPosPayoutBank();
  }

  PosPayoutsDetails = (id) =>{
    return (
      <div>
        {this.props.history.push(`/settings/pos-payouts/${id}/view`)}
      </div>
    );
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
                  <span className="pull-left search-text">{this.state.settingsLang.pos_payments_and_payouts_data_last_updated}: {this.state.payout_last_updated}
                  (UTC)</span>
                }
                <div className="dropdown pull-right no-width m-l-10">
                  <button className="line-btn no-margin no-width" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{this.state.globalLang.label_export_text}<i className="fas fa-angle-down" /></button>
                  <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a href="javascript:void(0);" onClick={this.getPosExport.bind(this,'csv')}>{this.state.globalLang.label_export_as_csv_text}</a></li>
                    <li><a href="javascript:void(0);" onClick={this.getPosExport.bind(this,'xls')}>{this.state.globalLang.label_export_as_excel_text}</a></li>
                  </ul>
                </div>
                <div className="blue-btn pull-right no-width cursor-pointer" onClick={this.getPosPayoutBank}>{this.state.globalLang.label_new}</div>
              </div>
              <div className="setting-container no-padding">
                <div className="table-responsive">
                  <table className="table-updated no-hover setting-table table-min-width">
                    <thead className="table-updated-thead">
                      <tr>
                        <th className="col-lg-2 col-xs-2 table-updated-th text-right">{this.state.globalLang.label_amount}</th>
                        <th className="col-lg-2 col-xs-2 table-updated-th no-border-left" />
                        <th className="col-lg-4 col-xs-4 table-updated-th">{this.state.settingsLang.pos_bank_card}</th>
                        <th className="col-lg-2 col-xs-2 table-updated-th text-right">{this.state.globalLang.label_date}</th>
                        <th className="col-lg-2 col-xs-2 table-updated-th text-right">{this.state.settingsLang.pos_payout_mode}</th>
                      </tr>
                    </thead>
                    <tbody className="ajax_body">
                      {(this.state.posPayoutList.length)
                        ?
                        this.state.posPayoutList.map((obj,idx) => {
                          const labelAndAmount = this.labelAndAmount(obj.amount, obj.status);
                            return (
                              <tr className={(obj.automatic) ? "table-updated-tr show-payout-details" : "table-updated-tr"} key={'posPayout-'+idx} onClick={(obj.automatic) ? this.PosPayoutsDetails.bind(this,obj.payout_id) : null}>
                                <td className="table-updated-td text-right">
                                  <label className="payment-amount">{numberFormat(((labelAndAmount.amount > 0) ? (labelAndAmount.amount / 100) : 0), 'currency',2)}</label>
                                </td>
                                <td className="table-updated-td no-padding no-border-left">
                                  <div className={labelAndAmount.statusClass}>{labelAndAmount.status}</div>
                                </td>
                                <td className="table-updated-td">{((obj.bank_account != undefined && obj.bank_account.bank_name != undefined) ? obj.bank_account.bank_name : '')} **** {((obj.bank_account != undefined && obj.bank_account.last4 != undefined) ? obj.bank_account.last4 : '')}</td>
                                <td className="table-updated-td text-right no-padding-left">{showFormattedDate(obj.arrival_date)}</td>
                                <td className="table-updated-td text-right">{(obj.automatic) ? this.state.settingsLang.pos_payout_automatic : this.state.settingsLang.pos_payout_manual}</td>
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
                <Loader showLoader={this.state.showLoader} />
                <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
              </div>
            </div>

          </div>
          {/* Setting Modal - START */}
          <div className={this.state.isShowSettingModal ? "modalOverlay" : 'no-display'}>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.settingsLang.pos_payout_out_funds_to_your_bank_account}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handleSettingModal} >×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.pos_available_balance}</div>
                        <div className="setting-input-outer"><input name="available_balance" value={numberFormat(this.state.available_balance,'currency',2)+' '+getCurrencyLabel().toUpperCase()} onChange={this.handleInputChange} className={this.state.availableBalanceClass} readOnly="readonly" type="text" /></div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.pos_amount_to_pay_out}<span className="setting-require">*</span></div>
                        <div className="setting-input-outer"><input name="amount" value={this.state.amount} onChange={this.handleInputChange} className={this.state.amountClass} placeholder="Amount to pay out" type="text" autoComplete="off" /></div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.globalLang.label_description}</div>
                        <div className="setting-input-outer"><input name="description" value={this.state.description} onChange={this.handleInputChange} className={this.state.descriptionClass} placeholder="Description" type="text" autoComplete="off" /></div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.pos_statement_desc}</div>
                        <div className="setting-input-outer"><input name="statement_descriptor" value={this.state.statement_descriptor} onChange={this.handleInputChange} className={this.state.statementDescriptorClass} placeholder="Statement desc" type="text" autoComplete="off" /></div>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.settingsLang.pos_send_payout_to}<span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <select name="destination" value={this.state.destination} onChange={this.handleInputChange}  className={this.state.destinationClass}>
                            <option value="">{this.state.settingsLang.pos_Select_bank}</option>
                            {this.state.posPayoutBankList.map((obj,idx)=>{
                              return (
                                  <option key={'posPayoutBankList-'+idx} value={obj.bank_identifier}>{obj.bank_name}</option>
                                )
                              })
                            }
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
                <div className="footer-static">
                  <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.globalLang.label_save}</a>
                  <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handleSettingModal}>{this.state.globalLang.label_cancel}</a>
                </div>
                <Loader showLoader={this.state.showLoaderSettingModal} />
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
  if (state.SettingReducer.action === "POS_PAYOUT_LIST") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posPayoutList = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "POS_PAYMENT_PAYOUT_EXPORT") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posPaymentExport = state.SettingReducer.data.data;
    }
  }
  else if (state.SettingReducer.action === "POS_PAYOUT_BANK_LIST") {
   if (state.SettingReducer.data.status != 200) {
     toast.error(languageData.global[state.SettingReducer.data.message]);
     returnState.showLoader = false;
   } else {
     returnState.posPayoutBankList = state.SettingReducer.data.data;
   }
 }
 else if (state.SettingReducer.action === "POS_PAYOUT_NEW") {
  if (state.SettingReducer.data.status != 200) {
    if(state.SettingReducer.data.message == 'third_party_error'){
      toast.error(state.SettingReducer.data.data);
    } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    returnState.showLoader = false;
  } else {
    returnState.reload = true;
    returnState.message = languageData.global[state.SettingReducer.data.message];
  }
} else if (state.SettingReducer.action === "EMPTY_DATA") {
}
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getPosPayout: getPosPayout,getPosExport:getPosExport,getPosPayoutBank:getPosPayoutBank,saveNewPosPayout:saveNewPosPayout,exportEmptyData:exportEmptyData}, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosPayouts);
