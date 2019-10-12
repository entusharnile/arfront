import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { updateEGiftCard, createEGiftCard, deleteEGiftCard, fetchEGiftCardDataID } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import InventoryHeader from './InventoryHeader.js';
import { numberFormat, getCurrencySymbol,isFormSubmit, getDateFormat,dateFormatPicker } from '../../Utils/services.js'


//const dateFormatPicker = 'mm-dd-yyyy';
const dateFormatMoment = 'YYYY-MM-DD';

class CreateEditEGiftCard extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      id: this.props.match.params.id,
      showCalendar: false,
      name: '',
      custom_amount: 0,
      amount: '',
      active_from: new Date(),
      active_till: null ,//new Date(moment().add(1, 'days')),
      active_till_min_date: new Date(moment().add(1, 'days')),
      temp_active_from: new Date(),
      temp_active_till: null, //new Date(moment().add(1, 'days')),
      validity_period: '12',
      policy: '',
      startFresh: true,
      showLoader: false,
      showModal: false,
      user_changed: false,
      tabClicked: false,
      EGiftCard: [],
      data: [],
      childCheck: false,
      selected: [],
      selectAll: 0,
      categoryName: '',
      show_below_stock: 0,

      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      dashboardLang: languageData.dashboard,
      onSubmitTime: null,
      account_logo:'',
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      return false;
    }
  }
  handleChange = (date) => {
    this.setState({
      active_from: date,
    });

    // reset active_till greater than from active_from
    if (date) {
      let active_till = this.state.active_till
      if(active_till){
        if (!moment(active_till).isAfter(date)) {
          this.setState({
            active_till: new Date(moment(date).add(1, 'days')),
            active_till_min_date: new Date(moment(date).add(1, 'days'))
          });
        } else {
          this.setState({
            active_till_min_date: new Date(moment(date).add(1, 'days'))
          });
        }
      } else {
        this.setState({
          active_till_min_date: new Date(moment(date).add(1, 'days'))
        });
      }
    }

  }

  handleChangeTill = (date) => {
    this.setState({
      'active_till': date
    });
  }

  toggleDatePicker = () => {
    this.refDatePicker.setFocus(true);
    this.refDatePicker.setOpen(true);
  }

  blurDatePicker = (date) => {
    this.refDatePicker.setOpen(true);
    this.setState({ 'showDatePicker': true });
  }

  focusDatePicker = (date) => {
    this.setState({ 'showDatePicker': true });
  }

  blurRepeatDatePicker = (date) => {
    this.refRepeatDatePicker.setOpen(true);
  }

  focusRepeatDatePicker = (date) => {
    this.setState({ 'showDatePicker': true });
  }

  toggleRepeatDatePicker = () => {
    this.refRepeatDatePicker.setFocus(true);
    this.refRepeatDatePicker.setOpen(true);
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  componentDidMount() {
    window.onscroll = () => {
      return false;
    }
    document.addEventListener('click', this.handleClick, false);
    let eGiftCardId = 0;
    if (this.props.match.params.id) {
      eGiftCardId = this.props.match.params.id;
    }
    this.setState({ eGiftCardId: eGiftCardId });
    this.setState({ 'showLoader': true })
    this.props.fetchEGiftCardDataID(eGiftCardId);
    //disable datepicker input-field from manually enter the value
    const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
    datePicker1.childNodes[0].setAttribute("readOnly",true);
    const datePicker2=document.getElementsByClassName("react-datepicker__input-container")[1];
    datePicker2.childNodes[0].setAttribute("readOnly",true);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.fetchInventoryEGiftData !== undefined && props.fetchInventoryEGiftData.status === 200 && props.fetchInventoryEGiftData.data != state.fetchInventoryEGiftData) {
      let returnState = {}
      if(state.eGiftCardId){
        returnState.name = (state.userChanged) ? state.name : props.fetchInventoryEGiftData.data.name
        returnState.amount = (state.userChanged) ? state.amount : (props.fetchInventoryEGiftData.data.type == 'custom') ? 'custom' : props.fetchInventoryEGiftData.data.amount;
        returnState.custom_amount = (state.userChanged) ? state.amount : (props.fetchInventoryEGiftData.data.type == 'custom') ? props.fetchInventoryEGiftData.data.amount : 0;
        returnState.active_from = (state.userChanged) ? state.active_from : moment(props.fetchInventoryEGiftData.data.active_from).toDate()
        returnState.temp_active_from = returnState.active_from;
        returnState.active_till = (state.userChanged) ? state.active_till : moment(props.fetchInventoryEGiftData.data.active_till).toDate()
        returnState.temp_active_till = returnState.active_till;
        returnState.active_till_min_date = (returnState.active_from) ? new Date(moment(returnState.active_from).add(1, 'days')) : new Date()
        returnState.validity_period = (state.userChanged) ? state.validity_period : props.fetchInventoryEGiftData.data.validity_period
        returnState.policy = (state.userChanged) ? state.policy : props.fetchInventoryEGiftData.data.policy
      }
      returnState.fetchInventoryEGiftData = props.fetchInventoryEGiftData.data
      returnState.account_logo = (props.fetchInventoryEGiftData.data.account_logo) ? (props.fetchInventoryEGiftData.data.account_logo) : '';
      returnState.showLoader = false;
      return returnState;
    } else if (props.redirect != undefined && props.redirect == true) {
      toast.success(props.message);
      props.history.push('/inventory/e-giftcards');
    } else if (props.showLoader != undefined && props.showLoader == false) {
      return { showLoader: false }
    } else
      return null;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleClick = (e) => {
    if (!this.refDatePickerContainer.contains(e.target)) {
      this.refDatePicker.setOpen(false);
    }
    if (!this.refRepeatDatePickerContainer.contains(e.target)) {
      this.refRepeatDatePicker.setOpen(false);
    }
  }


  inventoryEdit = (statusId, id) => {
    //localStorage.setItem('userID', id)
    return (
      <div className="no-display" >
        {this.props.history.push(`/inventory/e-giftcards/${id}/edit`)}
      </div>
    );
  }

  handleSubmit = (event, value) => {
    if (isFormSubmit()) {
      const id = this.props.match.params.id;
      let error = false;
      event.preventDefault();
      localStorage.setItem('sortOnly', true);

      this.setState({
        name_Error: false,
        amount_Error: false,
        active_from_Error: false,
        active_till_Error: false,
        validity_period_Error: false,
        policy_Error: false,
        custom_amount_Error: false
      });

      if (typeof this.state.name === undefined || this.state.name === null || this.state.name === '') {
        this.setState({
          name_Error: true
        })
        error = true;
      }
      if (typeof this.state.amount === undefined || this.state.amount === null || this.state.amount === '') {
        this.setState({
          amount_Error: true
        })
        error = true;
      }
      if (typeof this.state.active_from === undefined || this.state.active_from === null || this.state.active_from === '') {
        this.setState({
          active_from_Error: true
        })
        error = true;
      }
      if (typeof this.state.active_till === undefined || this.state.active_till === null || this.state.active_till === '') {
        this.setState({
          active_till_Error: true
        })
        error = true;
      }
      if (typeof this.state.validity_period === undefined || this.state.validity_period === null || this.state.validity_period === '') {
        this.setState({
          validity_period_Error: true
        })
        error = true;
      }
      if (typeof this.state.policy === undefined || this.state.policy === null || this.state.policy === '') {
        this.setState({
          policy_Error: true
        })
        error = true;
      }
      if (this.state.amount === 'custom' && this.state.custom_amount < 1) {
        this.setState({
          custom_amount_Error: true
        })
        error = true;
      }
      //active_from_should_be_less_than_active_till
      if (error === true) {
        return;
      }

      let formData = {
        name: this.state.name,
        amount: this.state.amount === 'custom' ? this.state.custom_amount : this.state.amount,
        active_from: moment(this.state.active_from).format("YYYY-MM-DD"),
        active_till: moment(this.state.active_till).format("YYYY-MM-DD"),
        validity_period: this.state.validity_period,
        policy: this.state.policy,
        //type: this.state.amount === 'custom' ? 'custom' : ''
      };
      if (this.state.amount == 'custom') {
        formData.type = 'custom'
      }
      this.setState({ showLoader: true })
      if (id) {
        this.props.updateEGiftCard(formData, id);
      }
      else {
        this.props.createEGiftCard(formData);
      }
    }
  };

  showDeleteModal = () => {
    this.setState({ showModal: true })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteEGiftCard = () => {
    this.dismissModal();
    this.setState({ showLoader: true })
    let id = this.props.match.params.id;

    this.props.deleteEGiftCard(id);
  }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'e-giftcards'} />
          <div className="juvly-section full-width">
            <div className="juvly-container m-h-container">
              <div className="juvly-title m-b-40	">{(this.state.id) ? 'Edit eGift Card' : 'Create eGift Card'}
                <a href="/inventory/e-giftcards" className="pull-right"><img src="/images/close.png" /></a>
              </div>
              <div className="row">
                <div className="col-sm-6 col-xs-12">
                  <div className="juvly-subtitle">{this.state.inventoryLang.inventory_eGift_Card_Information}</div>
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="row">
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_eGift_Card_Name} <span className="setting-require">*</span></div>
                            <input className={this.state.name_Error === true ? "setting-input-box field_error" : "setting-input-box"} type="text" name="name" value={this.state.name} placeholder="eGift Card Name" autoComplete="off" onChange={this.handleInputChange} />
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_Enter_Amount} <span className="setting-require">*</span></div>
                            <div className="row">
                              <div className="col-xs-6">
                                <select className={this.state.amount_Error === true ? "setting-select-box field_error" : "setting-select-box"} name="amount" value={this.state.amount} onChange={this.handleInputChange} >
                                  <option value="" >{this.state.inventoryLang.inventory_Select_Value}</option>
                                  <option value="5">{getCurrencySymbol() + '5'}</option>
                                  <option value="25">{getCurrencySymbol() + '25'}</option>
                                  <option value="50">{getCurrencySymbol() + '50'}</option>
                                  <option value="100">{getCurrencySymbol() + '100'}</option>
                                  <option value="custom">{this.state.inventoryLang.inventory_custom}</option>
                                </select>
                              </div>
                              <div className={this.state.amount === 'custom' ? "col-xs-6" : "col-xs-6 no-display"}>
                                <input className={this.state.custom_amount_Error === true ? "setting-input-box field_error" : "setting-input-box"} type="text" name="custom_amount" value={this.state.custom_amount} min="1" autoComplete="off" onChange={this.handleInputChange} />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_Available_for_purchase_on} <span className="setting-require">*</span><a href="javascript:void(0);" className="help-icon-form" title={this.state.inventoryLang.inventory_Available_for_purchase_on_tootip} >?</a></div>
                            <div className="setting-input-outer" ref={(refDatePickerContainer) => this.refDatePickerContainer = refDatePickerContainer}>
                              <a href="javascript:void(0);" className="client-treat-cal" onClick={this.toggleDatePicker}>
                                <i className="fas fa-calendar-alt" />
                              </a>
                              <DatePicker
                                //openToDate={(moment(this.state.active_from).isAfter(new Date())) ? this.state.active_from : moment(new Date()).toDate()}
                                className={this.state.active_from_Error === true ? "setting-input-box field_error" : "setting-input-box"}
                                selected={(this.state.active_from) ? this.state.active_from : null}
                                dateFormat={dateFormatPicker()}
                                placeholderText={dateFormatPicker().toLowerCase()}
                                onChange={this.handleChange}
                                onBlur={this.blurDatePicker}
                                onFocus={this.focusDatePicker}
                                minDate={new Date()}
                                maxDate={new Date(moment().add(10, 'years'))}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                                autoComplete="off"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_Available_for_purchase_until} <span className="setting-require">*</span><a href="javascript:void(0)" className="help-icon-form" title={this.state.inventoryLang.inventory_Available_for_purchase_until_tootip}>?</a></div>
                            <div className="setting-input-outer" ref={(refRepeatDatePickerContainer) => this.refRepeatDatePickerContainer = refRepeatDatePickerContainer}>
                              <a href="javascript:void(0);" className="client-treat-cal" onClick={this.toggleRepeatDatePicker}>
                                <i className="fas fa-calendar-alt" />
                              </a>
                              <DatePicker
                                //openToDate={(moment(this.state.active_till).isAfter(new Date())) ? this.state.active_till : moment(new Date()).toDate()}
                                className={this.state.active_till_Error === true ? "setting-input-box field_error" : "setting-input-box"}
                                selected={(this.state.active_till) ? this.state.active_till : null}
                                dateFormat={dateFormatPicker()}
                                placeholderText={dateFormatPicker().toLowerCase()}
                                onChange={this.handleChangeTill}
                                onBlur={this.blurRepeatDatePicker}
                                onFocus={this.focusRepeatDatePicker}
                                minDate={(this.state.active_till_min_date) ? this.state.active_till_min_date : new Date()}
                                maxDate={new Date(moment().add(10, 'years'))}
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                ref={(refRepeatDatePicker) => this.refRepeatDatePicker = refRepeatDatePicker}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_Validity_of_eGift_after} <span className="setting-require">*</span>
                              <a href="javascript:void(0)" className="help-icon-form" title={this.state.inventoryLang.inventory_Validity_of_eGift_after_tootip}>?</a></div>
                            <select className={this.state.validity_period_Error === true ? "setting-input-box field_error" : "setting-select-box"} name="validity_period" value={this.state.validity_period} onChange={this.handleInputChange} >
                              <option value="1">{this.state.inventoryLang.inventory_one_month}</option>
                              <option value="2">{this.state.inventoryLang.inventory_two_months}</option>
                              <option value="3">{this.state.inventoryLang.inventory_three_months}</option>
                              <option value="4">{this.state.inventoryLang.inventory_four_months}</option>
                              <option value="5">{this.state.inventoryLang.inventory_five_months}</option>
                              <option value="6">{this.state.inventoryLang.inventory_six_months}</option>
                              <option value="7">{this.state.inventoryLang.inventory_seven_months}</option>
                              <option value="8">{this.state.inventoryLang.inventory_eight_months}</option>
                              <option value="9">{this.state.inventoryLang.inventory_nine_months}</option>
                              <option value="10">{this.state.inventoryLang.inventory_ten_months}</option>
                              <option value="11">{this.state.inventoryLang.inventory_eleven_months}</option>
                              <option value="12">{this.state.inventoryLang.inventory_one_year}</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_eGift_Card_Policy}<span className="setting-require">*</span></div>
                            <textarea className={this.state.policy_Error === true ? "setting-textarea-box field_error" : "setting-textarea-box"} name="policy" placeholder="eGift Card Policy " value={this.state.policy} onChange={this.handleInputChange} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-sm-6 col-xs-12 col-lg-offset-2">
                  <div className="juvly-subtitle">{this.state.inventoryLang.inventory_egift_preview}</div>
                  <div className="new-gift-card">
                    <img src="/images/card.png" className="gift-card" />
                    <div className="gift-amount"><span className="gift-amount-span">{getCurrencySymbol()}</span><label className="gift-amount-label">
                      {
                        (this.state.amount != undefined && this.state.amount != null && this.state.amount != '')
                          ?
                          (this.state.amount == 'custom')
                            ?
                            numberFormat(this.state.custom_amount)
                            :
                            numberFormat(this.state.amount)
                          :
                          numberFormat(0)
                      }
                    </label></div>
                    <div className="gift-card-logo"><img src={(this.state.account_logo) ? this.state.account_logo : "/images/logo.png"} /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer-static">
              <button className="new-blue-btn pull-right" id="saveform" onClick={this.handleSubmit}>{this.state.inventoryLang.inventory_save}</button>
              <Link to="/inventory/e-giftcards" className="new-white-btn pull-right" id="resetform">{this.state.inventoryLang.inventory_Cancel}</Link>
              {this.state.id ? <button className={(this.state.id) ? "new-red-btn pull-left" : "new-red-btn pull-left no-display"} id="resetform" onClick={this.showDeleteModal} data-message={this.state.inventoryLang.inventory_are_you_sure_del_PTI} >{this.state.inventoryLang.inventory_delete}</button> : ''}
              <div className={(this.state.showModal ? 'overlay' : '')}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.inventoryLang.inventory_Confirmation_required}{this.state.showModal}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.inventoryLang.inventory_del_egift_card}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.inventoryLang.inventory_No}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteEGiftCard}>{this.state.inventoryLang.inventory_Yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
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
  if (state.InventoryReducer.action === "CREATE_EGIFTCARD") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message]
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  } else if (state.InventoryReducer.action === "FETCH_SELECTED_EGIFTCARD") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.fetchInventoryEGiftData = state.InventoryReducer.data
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  } else if (state.InventoryReducer.action === "UPDATE_EGIFTCARD") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message]
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  } else if (state.InventoryReducer.action === "DELETE_EGIFTCARD") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message]
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateEGiftCard: updateEGiftCard, createEGiftCard: createEGiftCard, deleteEGiftCard: deleteEGiftCard, fetchEGiftCardDataID: fetchEGiftCardDataID }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateEditEGiftCard));
