import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { setupPosExpressAccount } from '../../../Actions/Settings/settingsActions.js';
import { numberFormat } from '../../../Utils/services.js';
import { ToastContainer, toast } from "react-toastify";
import { showMonthFormattedDate,capitalizeFirstLetter } from '../../../Utils/services.js';
import moment from 'moment';
import queryString from 'query-string';
import Header from '../../../Containers/Protected/Header.js';
import Footer from '../../../Containers/Protected/Footer.js';
import Sidebar from '../../../Containers/Settings/sidebar.js';
import Loader from '../../Common/Loader.js'

const redirectToPos = () => {
  window.location = '/settings/pos';
}

class PosStripeReturnUrl extends Component {
  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  get initialState() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    return {
      settingsLang: languageData.settings,
      globalLang: languageData.global,
      showLoader: false,
      backAction: '/settings/pos',
      posStripeSetupData: {},
      code:'',
      clinicId:0,
      showLoader:true,

      posData:{},
      stripeConfigClinic: [],
      stripeConfigGlobal: [],
      stripeConnectionMode :'clinic',
      stripeCountry: "US",
      stripeCurrency: "usd",
      stripeMode: "",
      pos_enabled: false,
      isShowAlertModal : false,
      alertModalContent : '',
      alertModalType : 'pos_enabled',
      disconnectStripeId:'',
      disconnectClinicId:0,
      updateStripeId:'',
      updateClinicId:0,
      isShowUpdateModal:false,

    }
  }

  componentDidMount() {
    this.setState({ 'showLoader': true })
    const clinicId = localStorage.getItem('stripeSetupClinicId')
    if(clinicId !== null && clinicId >= 0){
      this.setState({clinicId : clinicId});
      localStorage.removeItem('stripeSetupClinicId')
      const query = queryString.parse(this.props.location.search)
      if(Object.keys(query).length){
        if(query.code !== undefined && query.code !== '' && query.code !== null){
          const formData ={
            clinic_id :  clinicId,
            code : query.code
          }
          this.props.setupPosExpressAccount(formData);
        } else {
            if(query.error_description !== undefined && query.error_description !== '' && query.error_description !== null){
              this.displayToastMessage(query.error_description);
            } else {
              this.displayToastMessage('Unknow Error!');
            }
        }
      } else {
        this.displayToastMessage('Stripe response data is empty');
      }
    } else {
      this.displayToastMessage('Clinic data is empty');
    }
  }

  displayToastMessage = (msg) => {
    toast.error(msg)
    redirectToPos();
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.redirect != undefined && nextProps.redirect == true) {
      if(nextProps.status){
        toast.success(nextProps.message)
        redirectToPos();
      } else {
        toast.error(nextProps.message)
        redirectToPos();
      }
    }
    return returnState
  }

  handleInputChange = () => {

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
                <div className="setting-title">{this.state.settingsLang.sidebar_POS_menu}
                <span className="setting-custom-switch pull-right no-margin">
                    <span id="enabled-text">
                      {this.state.pos_enabled ? this.state.settingsLang.pos_enabled_label : this.state.settingsLang.pos_disabled_label }
                      </span>
                    <label className="setting-switch pull-right">
                      <input type="checkbox" id="pos_enabled" name="pos_enabled" className=" setting-custom-switch-input" checked={this.state.pos_enabled ? "checked" : false} value={this.state.pos_enabled} onChange={this.handleInputChange} />
                      <span className="setting-slider" />
                    </label><br /><br />
                  </span>
                </div>
                <div className={this.state.pos_enabled ? 'is-pos_enabled-form-title' : 'is-pos_enabled-form-title no-display'}>
                  <p className="p-text no-margin">{this.state.settingsLang.pos_please_select_label}:</p>
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="pos-stripe-outer">
                        <input type="radio" onChange={this.handleInputChange} className="pos-stripe-input pos-stripe-option stripe-option" id="single-stripe" name="stripeConnectionMode" value="global" checked={this.state.stripeConnectionMode == 'global' ? 'checked' : false} />
                        <label className="pos-stripe-discrip" htmlFor="single-stripe">
                          <span className="pos-stripe-title">{this.state.settingsLang.pos_single_stripe_account}</span>
                          {this.state.settingsLang.pos_single_stripe_account_label}</label>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="pos-stripe-outer">
                        <input type="radio" onChange={this.handleInputChange} className="pos-stripe-input pos-stripe-option stripe-option" id="stripe-account" name="stripeConnectionMode" value="clinic" checked={this.state.stripeConnectionMode == 'clinic' ? 'checked' : false} />
                        <label className="pos-stripe-discrip" htmlFor="stripe-account">
                          <span className="pos-stripe-title">{this.state.settingsLang.pos_stripe_account_per_clinic}</span>
                          {this.state.settingsLang.pos_stripe_account_per_clinic_label}</label>
                      </div>
                    </div>
                  </div>
                  <div className={this.state.stripeConnectionMode == 'global' ? "row single" : "row single no-display"} id="global-settings">
                    <div className="col-lg-12 col-xs-12 m-t-10">
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.pos_your_account_is_connected_on}</div>
                            <div className="setting-input-box">30/07/2018</div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.pos_your_stripe_id}</div>
                            <div className="setting-input-box">acct_1CYDTRIHMD6wYJpx</div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.pos_application_fee}</div>
                            <div className="setting-input-box">3.50%</div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.pos_application_fee_for_swipe}:</div>
                            <div className="setting-input-box">2.75%</div>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.settingsLang.pos_stripe_dashboard}</div>
                            <a href="javascript:void(0)" data-message="An internal error occured: The provided key 'sk_test_********************DgAU' does not have access to account 'acct_1CYDTRIHMD6wYJpx' (or that account does not exist). Application access may have been revoked." target="_blank" className="new-white-btn small-stripe-btn dashboard-link" dta-uri={0}>{this.state.settingsLang.pos_visit_stripe_dashboard}</a>
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <a href="javascript:void(0)" dta-uri={0} className="new-blue-btn small-stripe-btn stripe-disconnect">{this.state.settingsLang.pos_disconnect_with_stripe}</a>
                          <a href="javascript:void(0)" data-url="/settings/clinic_card_devices/0" data-title className="new-blue-btn small-stripe-btn modal-link">{this.state.settingsLang.pos_card_readers}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="per-clinic-settings" className={this.state.pos_enabled ? '' : 'no-display'}>
                <div className={this.state.stripeConnectionMode == 'clinic' ? "table-responsive" : "table-responsive no-display"}>
                  <table className="table-updated no-hover setting-table table-min-width">
                    <thead className="table-updated-thead">
                      <tr>
                        <th className="col-xs-3 table-updated-th sorting">{this.state.globalLang.label_clinic}</th>
                        <th className="col-xs-2 table-updated-th sorting">{this.state.globalLang.label_status} </th>
                        <th className="col-xs-2 table-updated-th sorting">{this.state.globalLang.label_fee} </th>
                        <th className="col-xs-2 table-updated-th sorting">{this.state.settingsLang.pos_swipe_fee}</th>
                        <th className="col-xs-3 table-updated-th sorting">{this.state.label_action} </th>
                      </tr>
                    </thead>
                    <tbody className="ajax_body">
                      {(this.state.stripeConfigClinic.length > 0) &&
                        this.state.stripeConfigClinic.map((obj,idx) => {
                            return (
                              <tr className="table-updated-tr" key={'stripeConfigClinic-'+idx}>
                                <td className="table-updated-td">{obj.clinic_name}</td>
                                <td className="table-updated-td">
                                  Connected<br />
                                  {obj.created}
                               </td>
                                <td className="table-updated-td">{obj.platform_fee} %</td>
                                <td className="table-updated-td">{obj.platform_fee_swipe} %</td>
                                <td className="table-updated-td">
                                  <a href="https://connect.stripe.com/express/qHRUbC3PG9wh" data-message target="_blank" dta-uri={1} className="stripe-link">Visit Stripe Dashboard</a> |
                                 <a href="javascript:void(0)" dta-uri={1} className="stripe-link stripe-disconnect">Disconnect Stripe</a> |
                                 <a href="javascript:void(0)" data-url="/settings/clinic_card_devices/1" data-title="New York Clinic - Cards" className="stripe-link modal-link">Card Readers</a>
                                </td>
                              </tr>
                            )
                        })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
          {/* Alert Modal - START */}
          <div className={this.state.isShowAlertModal ? "modalOverlay" : 'no-display' }>
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.globalLang.label_alert}</div>
                <a href="javascript:void(0);" className="small-cross" onClick={this.handleAlertModal} >×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-sm-12 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label alert-modal-title">{this.state.globalLang.are_you_sure}</div>
                        <div className="new-field-label alert-modal-content">{this.state.alertModalContent}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-static">
                <a href="javascript:void(0);" className="new-white-btn pull-right" onClick={this.handleAlertModal}>{this.state.globalLang.label_cancel}</a>
                {(this.state.alertModalType == 'pos_enabled')
                ?
                <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.handlePosDisable} >{this.state.yes_disable_it}</a>
                :
                (this.state.alertModalType == 'stripe')
                ?
                <a href="javascript:void(0);" className="new-red-btn pull-left" onClick={this.handleStripeType}>{this.state.globalLang.global_yes_change_it}</a>
                :
                null
                }

              </div>
            </div>
          </div>
          {/* Alert Modal - END */}
          <Loader showLoader={this.state.showLoader} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SettingReducer.action === "POS_SETUP_EXPRESS_ACCOUNT") {
    if (state.SettingReducer.data.status != 200) {
      if(state.SettingReducer.data.message == 'third_party_error'){
        returnState.message = state.SettingReducer.data.data;
      } else {
        returnState.message = languageData.global[state.SettingReducer.data.message];
      }
      returnState.redirect = true;
      returnState.status = false;
    } else {
      returnState.status = true;
      returnState.message = languageData.global[state.SettingReducer.data.message];
      returnState.redirect = true;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    setupPosExpressAccount:setupPosExpressAccount
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(PosStripeReturnUrl));
