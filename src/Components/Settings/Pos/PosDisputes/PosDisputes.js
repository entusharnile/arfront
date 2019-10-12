import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import Select from 'react-select';
import { getPosDispute, getPosDisputeSetting, savePosDisputeSetting,exportEmptyData } from '../../../../Actions/Settings/settingsActions.js';
import Header from '../../../../Containers/Protected/Header.js';
import Footer from '../../../../Containers/Protected/Footer.js';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import Loader from '../../../Common/Loader.js'
import { numberFormat,getCurrencyLabel,toggleBodyScroll,showFormattedDate, autoScrolling } from "../../../../Utils/services.js";

const CurrencyLabel =  getCurrencyLabel().toUpperCase();

class PosDisputes extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      dashboardLang: languageData.dashboard,
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
      isShowSettingModal:false,
      posDisputeList:[],
      selectedUserEmailOptions:[],
      userEmailOptions:[],
      activeUsersList:[],
      message:'',
      posNotificationData:{},
      showLoaderSettingModal:false
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
    const userData = JSON.parse(localStorage.getItem('userData'));
  }

  componentDidMount() {
    this.setState({
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      posDisputeList: [],
      showLoader:true,
      next_page_url:'',
      showLoader:true
    });
    autoScrolling(true);
    this.props.getPosDispute({
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize
      }
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false && nextProps.showLoader != prevState.showLoader){
      if (nextProps.message != undefined && nextProps.message != prevState.message){
        toast.success(nextProps.message);
      }
      nextProps.exportEmptyData()
      return {showLoader:false,message:nextProps.message,showLoaderSettingModal:false}
    } else if (nextProps.posNotificationData != undefined && nextProps.posNotificationData != prevState.posNotificationData){
      returnState.showLoader = false;
      returnState.showLoaderSettingModal = false;
      returnState.isShowSettingModal = true;
      returnState.posNotificationData = nextProps.posNotificationData;
      if(!prevState.userChanged){
        let userEmailOptions = [];
        if(nextProps.posNotificationData.all_admin_emails != undefined && nextProps.posNotificationData.all_admin_emails.length) {
          userEmailOptions = nextProps.posNotificationData.all_admin_emails.map((lobj, lidx) => {
            return {value: lidx,  label: lobj}
          })
        }
        returnState.userEmailOptions = userEmailOptions;
        const savedAdminEmails= nextProps.posNotificationData.saved_admin_emails.split(',');
        let selectedUserEmailOptions = [];
        nextProps.posNotificationData.all_admin_emails.map((obj, idx) => {
          if(savedAdminEmails.indexOf(obj) > -1) {
            selectedUserEmailOptions.push({value: idx,  label: obj})
          }
        })
        returnState.selectedUserEmailOptions = selectedUserEmailOptions
      }
      nextProps.exportEmptyData()
      toggleBodyScroll(true);
      return returnState;
    } if (nextProps.posDisputeList != undefined && nextProps.posDisputeList != undefined &&
      nextProps.posDisputeList.next_page_url !== prevState.next_page_url) {
        toggleBodyScroll(false);
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        autoScrolling(false);
        return returnState;
      }
      if (prevState.posDisputeList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.posDisputeList = nextProps.posDisputeList.data;
          returnState.payout_last_updated = nextProps.posDisputeList.payout_last_updated;
          if (nextProps.posDisputeList.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.posDisputeList.next_page_url;
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
      } else if (prevState.posDisputeList != nextProps.posDisputeList.data &&
        prevState.posDisputeList.length != 0) {
        returnState.posDisputeList = [
          ...prevState.posDisputeList,
          ...nextProps.posDisputeList.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.posDisputeList.next_page_url;
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
      this.props.getPosDispute({
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize
        }
      });
    }
  }

  handleSelectChange = (selectedUserEmailOptions) => {
    this.setState({
      selectedUserEmailOptions: selectedUserEmailOptions,
      userChanged:true
    });
  }

  handleSubmit = (event) => {
    let selectedUserEmailOptions = [];
    this.state.selectedUserEmailOptions.map((obj,idx)=>{
      selectedUserEmailOptions.push(obj.label);
    })
    if(selectedUserEmailOptions.length){
      let formData = {
        admin_emails: selectedUserEmailOptions.join(',')
      }

      this.setState({ showLoader: true,isShowSettingModal: !this.state.isShowSettingModal })
      this.props.savePosDisputeSetting(formData);
      toggleBodyScroll(false);
    } else {
      return
    }
  }


  dismiSettingModal = () => {
    toggleBodyScroll(false);
    this.setState({isShowSettingModal: false, showLoaderSettingModal:false})
  }

  getPosDisputeSetting = () => {
    this.setState({showLoader: true})
    this.props.getPosDisputeSetting();
  }

  DisputeView = (id) => {
    return (
      <div>
        {this.props.history.push(`/settings/pos-disputes/${id}/view`)}
      </div>
    );
  }

  labelAndAmount = (amount,status,reason) => {
    //Dispute status : warning_needs_response, warning_under_review, warning_closed, needs_response, under_review, charge_refunded, won, or lost
    //Dispute reasons : general_fields, credit_not_processed, duplicate, fraudulent, general, product_not_received, product_unacceptable, subscription_canceled, unrecognized

		let statusClass = 'payment-transit';
		if(status == 'needs_response') {
			statusClass = 'payment-response';
		} else if(status == 'won') {
			statusClass = 'payment-Succeeded';
    }
    return {
      amount : parseInt(amount),
      status : this.state.globalLang['stripe_'+status],
      statusClass : statusClass,
      reason:this.state.globalLang['stripe_'+reason]
    }
  }

  render() {
    let options = {}
    let defaultOptions = {}
    return (
      <div className="main protected">
        <div id="content" className="pos-content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-search-outer">
                <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.getPosDisputeSetting} >{this.state.settingsLang.settings}</a>
              </div>
              <div className="table-responsive">
                <table className="table-updated juvly-table table-min-width">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="col-xs-4 table-updated-th">{this.state.globalLang.label_amount}</th>
                      <th className="col-xs-2 table-updated-th">{this.state.settingsLang.setting_reason}</th>
                      <th className="col-xs-2 table-updated-th" >{this.state.settingsLang.setting_payment_date}</th>
                      <th className="col-xs-2 table-updated-th" >{this.state.settingsLang.setting_disputed_on}</th>
                      <th className="col-xs-2 table-updated-th" >{this.state.settingsLang.setting_respond_by}</th>
                    </tr>
                  </thead>
                  <tbody className="ajax_body" >
                    {(this.state.posDisputeList.length)
                      ?
                      this.state.posDisputeList.map((obj,idx) => {
                        const labelAndAmount = this.labelAndAmount(obj.disputed_amount, obj.dispute_status,obj.dispute_reason);
                          return (
                            <tr className="table-updated-tr show-dispute-details" key={'posPayment-'+idx} onClick={this.DisputeView.bind(this, obj.id)}>
                              <td className="table-updated-td">
                                <label className="payment-amount response">{numberFormat(((labelAndAmount.amount > 0) ? labelAndAmount.amount : 0), 'currency',2)}</label>
                                <div className={labelAndAmount.statusClass+ " pull-right"}>{labelAndAmount.status}</div>
                              </td>
                              <td className="table-updated-td">{labelAndAmount.reason}</td>
                              <td className="table-updated-td text-right no-padding-left">{showFormattedDate(obj.payment_datetime,true)}</td>
                              <td className="table-updated-td text-right no-padding-left">{showFormattedDate(obj.created_on,true)}</td>
                              <td className="table-updated-td text-right no-padding-left">{showFormattedDate(obj.evidence_due_date,true)}</td>
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
              <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display"}>{this.state.globalLang.loading_please_wait_text}</div>
            </div>

          </div>
          {/* Setting Modal - START */}
          <div className={this.state.isShowSettingModal ? "modalOverlay" : 'no-display' }>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.settingsLang.pos_dispute_emails_setting}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.dismiSettingModal} >×</a>
              </div>
              <div className="small-popup-content small-popup-content-pos-disputes-settings">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-sm-12 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label alert-modal-title">{this.state.settingsLang.pos_disputes_setting_alert_msg}</div>
                        <div className="setting-input-outer">
                        <div className="tag-auto-select">
                          {
                            this.state.userEmailOptions && <Select
                            onChange={this.handleSelectChange}
                            value={this.state.selectedUserEmailOptions}
                            isClearable
                            isSearchable
                            options={this.state.userEmailOptions}
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
                <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.globalLang.label_save}</a>
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.dismiSettingModal}>{this.state.globalLang.label_cancel}</a>
              </div>
              <Loader showLoader={this.state.showLoaderSettingModal} />
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
  if (state.SettingReducer.action === "POS_DISPUTE_LIST") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posDisputeList = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "POS_DISPUTE_SETTING_GET") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.posNotificationData = state.SettingReducer.data.data;
    }
  } else if (state.SettingReducer.action === "POS_DISPUTE_SETTING_POST") {
    if (state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false;
    } else {
      returnState.showLoader = false;
      returnState.message = languageData.global[state.SettingReducer.data.message];
    }
  } else if (state.SettingReducer.action === "EMPTY_DATA") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getPosDispute: getPosDispute,
    getPosDisputeSetting:getPosDisputeSetting,
    savePosDisputeSetting:savePosDisputeSetting,
    exportEmptyData:exportEmptyData
  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(PosDisputes);
