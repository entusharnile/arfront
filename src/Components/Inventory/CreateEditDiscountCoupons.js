import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { updateDiscountCouponsId, createDiscountCouponsId, deleteDiscountCouponsId, fetchDiscountCouponsId, exportEmptyData } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import InventoryHeader from './InventoryHeader.js';
import { numberFormat, getCurrencySymbol, isFormSubmit, showFormattedDate, getDateFormat, dateFormatPicker } from '../../Utils/services.js'

class CreateEditDiscountCoupons extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      id: this.props.match.params.id,
      showCalendar: false,
      couponCode: '',
      discount_type: '',
      discount_value: '',
      showVal: true,
      expiry_date: new Date(moment().add(1, 'days')),
      active_till: null ,//new Date(moment().add(1, 'days')),
      active_till_min_date: new Date(moment().add(1, 'days')),
      userChanged: false,
      fetchDiscountCouponsIdVAl: [],
      createUpdateDelete: [],
      showDateVal: new Date(),
      showDateValFetch: new Date(),
      discount_duration: 'forever',
      limited_duration: '',

      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      dashboardLang: languageData.dashboard,
      onSubmitTime: null,
      account_logo:'',
    };
    window.onscroll = () => {
      return false;
    }
  }

  handleChange = (date) => {
    this.setState({
      expiry_date: date,
      userChanged: true
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
    const value = target.type === "checkbox" ? target.checked : target.value ;
    this.setState({
      [event.target.name]: value, userChanged: true
    });
  };

  componentDidMount() {
    window.onscroll = () => {
      return false;
    }
    const discountCouponsId = this.props.match.params.id ;
    document.addEventListener('click', this.handleClick, false);
    let formData = {
      'params': {
        id: this.props.match.params.id
      }
    };
    if(discountCouponsId){
      this.setState({ 'showLoader': true })
      this.props.fetchDiscountCouponsId(formData);
    }
    if(!discountCouponsId){
      this.props.exportEmptyData();
    }
    const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
    datePicker1.childNodes[0].setAttribute("readOnly",true);
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {};
    if (props.showLoader != undefined && props.showLoader == false) {
        returnState.showLoader = false;
        props.exportEmptyData();
        return returnState;
    }
    else if (props.createUpdateDelete !== undefined && props.createUpdateDelete != state.createUpdateDelete && props.showDateVal != state.showDateVal){
      if(props.redirect != undefined && props.redirect == true) {
        toast.success(props.message)
        props.history.push('/inventory/discount-coupons');
        returnState.showDateVal =  props.showDateVal;
    }
      return returnState;
    }
    else if (props.fetchDiscountCouponsIdVAl !== undefined && props.fetchDiscountCouponsIdVAl != state.fetchDiscountCouponsIdVAl && props.showDateValFetch != state.showDateValFetch) {
        returnState.couponCode = (state.userChanged) ? state.couponCode : props.fetchDiscountCouponsIdVAl.data.coupon_code
        returnState.discount_type = (state.userChanged) ? state.discount_type  : props.fetchDiscountCouponsIdVAl.data.discount_type;
        returnState.discount_value = (state.userChanged) ? state.discount_value : props.fetchDiscountCouponsIdVAl.data.discount_value;
        returnState.expiry_date = (state.userChanged) ? state.expiry_date : moment(props.fetchDiscountCouponsIdVAl.data.expiry_date).toDate();
        returnState.limited_duration = (state.userChanged) ? state.limited_duration : props.fetchDiscountCouponsIdVAl.data.limited_duration;
        returnState.discount_duration = (state.userChanged) ? state.discount_duration : props.fetchDiscountCouponsIdVAl.data.discount_duration;
        returnState.showDateValFetch = props.showDateValFetch;
        returnState.showLoader = false;
        return returnState;
    } else if(props.redirect != undefined && props.redirect == true) {
     toast.success(props.message)
         props.history.push('/inventory/discount-coupons');
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
  }

  handleSubmit = (event, value) => {
      const id = this.props.match.params.id;
      let error = false;
      event.preventDefault();
      var returnState = {};

      this.setState({
        couponCode_Error: false,
        discount_type_Error: false,
        discount_value_Error: false,
        expiry_date_Error: false,
        discount_duration_Error: false,
        limited_duration_Error: false
      });

      if (typeof this.state.discount_value === undefined || this.state.discount_value === null || this.state.discount_value === '' || this.state.discount_value <= 0 || (this.state.discount_type =='percentage' && this.state.discount_value > 100)) {
        this.setState({
          discount_value_Error: true
        })
        error = true;
      }

      if (typeof this.state.couponCode === undefined || this.state.couponCode === null || this.state.couponCode === '') {
        this.setState({
          couponCode_Error: true
        })
        error = true;
      }
      if (typeof this.state.discount_type === undefined || this.state.discount_type === null || this.state.discount_type === '') {
        this.setState({
          discount_type_Error: true
        })
        error = true;
      }
      if (typeof this.state.expiry_date === undefined || this.state.expiry_date === null || this.state.expiry_date === '') {
        this.setState({
          expiry_date_Error: true
        })
        error = true;
      }
      if (typeof this.state.discount_duration === undefined || this.state.discount_duration === null || this.state.discount_duration === '') {
        this.setState({
          discount_duration_Error: true
        })
        error = true;
      }

      if ((this.state.discount_duration==="limited") && (this.state.limited_duration === 0 || this.state.limited_duration === '')){
        this.setState({
          limited_duration_Error: true
        })
        error = true;
      }

      if (error === true) {
        return;
      }
      let formData = {
        coupon_code: this.state.couponCode,
        discount_type: this.state.discount_type,
        discount_value: this.state.discount_value,
        expiry_date: moment(this.state.expiry_date).format("YYYY-MM-DD"),
        id: this.props.match.params.id,
        //limited_duration: (this.state.discount_duration == "limited" ? this.state.limited_duration : ''),
        discount_duration: this.state.discount_duration
      };
      if(this.state.discount_duration == "limited"){
        formData.limited_duration = this.state.limited_duration
      }
      this.setState({ showLoader: true })
      if (id) {
        this.props.updateDiscountCouponsId(formData);
      }
      else {
        this.props.createDiscountCouponsId(formData);
      }
  };

  showDeleteModal = () => {
    this.setState({ showModal: true })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteDiscountCouponsIdFunct = () => {
    this.dismissModal();
    let formData = {
      'params': {
        id: this.props.match.params.id
      }
    };
    this.setState({ showLoader: true })
    this.props.deleteDiscountCouponsId(formData);
  }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'discount-coupons'} />
          <div className="juvly-section full-width">
            <div className="juvly-container m-h-container">
              <div className="juvly-title m-b-40	">{(this.state.id) ? 'Edit Discount Coupons' : 'Create Discount Coupons'}
                <a href="/inventory/discount-coupons" className="pull-right"><img src="/images/close.png" /></a>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="juvly-subtitle">{this.state.inventoryLang.inventory_discount_coupons_information}</div>

                      <div className="row m-b-20">
                        <div className="col-sm-3 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.Inventory_coupon_code} <span className="setting-require">*</span></div>
                              <input className={this.state.couponCode_Error === true ? "setting-input-box field_error" : "setting-input-box"} type="text" name="couponCode" value={this.state.couponCode} placeholder="Coupon Code" autoComplete="off" onChange={this.handleInputChange} />
                          </div>
                        </div>
                        <div className="col-sm-3 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_discount_type_lbl}<span className="setting-require">*</span></div>
                            <select onChange={this.handleInputChange} name="discount_type" id="discount_type" className={(this.state.discount_type_Error)? "setting-select-box field_error" : "setting-select-box"} value={this.state.discount_type}>
                               <option value=" ">{this.state.inventoryLang.inventory_select_discount_type}</option>
                               <option value="dollar">{this.state.inventoryLang.inventory_doller}</option>
                               <option value="percentage">{this.state.inventoryLang.inventory_percentageLBL}</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-sm-3 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.invenoty_discount_value_lbl}<span className="setting-require">*</span></div>
                            <input className={this.state.discount_value_Error === true ? "setting-input-box field_error" : "setting-input-box"} type="text" name="discount_value" value={this.state.discount_value} placeholder= {this.state.discount_type =='percentage' ? this.state.inventoryLang.inventory_discount_value_in_percentage_symbol : this.state.discount_type =='dollar' ? this.state.inventoryLang.invenoty_discount_value_lbl : this.state.inventoryLang.invenoty_discount_value_lbl }  autoComplete="off" onChange={this.handleInputChange} />
                          </div>
                        </div>
                        <div className="col-sm-3 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_expiry_date} <span className="setting-require">*</span></div>
                            <div className="setting-input-outer" ref={(refDatePickerContainer) => this.refDatePickerContainer = refDatePickerContainer} >
                            <a href="javascript:void(0);" className="client-treat-cal" onClick={this.toggleDatePicker}>
                              <i className="fas fa-calendar-alt" />
                            </a>
                              <DatePicker
                                className={this.state.expiry_date_Error === true ? "setting-input-box field_error" : "setting-input-box"}
                                selected={(this.state.expiry_date) ? this.state.expiry_date : null}
                                dateFormat={dateFormatPicker()}
                                placeholderText={dateFormatPicker().toLowerCase()}
                                onChange={this.handleChange}
                                onBlur={this.blurDatePicker}
                                onFocus={this.focusDatePicker}
                                minDate={new Date(moment().add(1, 'days'))}
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
                      </div>

                      <div className="juvly-subtitle m-b-10">{this.state.inventoryLang.inventory_duration_msg}</div>
                      <div className="setting-field-outer m-b-10">
                        <div className="setting-input-outer">
                          <div className="basic-checkbox-outer">
                            <input id="radiobutton3" className="basic-form-checkbox" name="discount_duration" type="radio" value="forever" onChange={this.handleInputChange} checked={this.state.discount_duration==="forever" ? 'checked' : false} />
                            <label className="basic-form-text" for="radiobutton3">{this.state.inventoryLang.inventory_forever}</label>
                          </div>
                          <div className="basic-checkbox-outer">
                            <input id="radiobutton4" className="basic-form-checkbox" name="discount_duration" type="radio" value="single" onChange={this.handleInputChange} checked={this.state.discount_duration==="single" ? 'checked' : false} />
                            <label className="basic-form-text" for="radiobutton4">{this.state.inventoryLang.inventory_single_use}</label>
                          </div>
                          <div className="basic-checkbox-outer">
                            <input id="radiobutton5" className="basic-form-checkbox" name="discount_duration" type="radio" value="limited" onChange={this.handleInputChange} checked={this.state.discount_duration==="limited" ? 'checked' : false} />
                            <label className="basic-form-text" for="radiobutton5">{this.state.inventoryLang.inventory_limited_time}</label>
                          </div>
                          <div className= {this.state.discount_duration==="limited" ? "limited-time-in-month" : 'no-display'}>
                              <select className={this.state.limited_duration_Error === true ? "setting-select-box field_error p-r-5" : "setting-select-box p-r-5"} name="limited_duration" value={this.state.limited_duration} onChange={this.handleInputChange} >
                                <option value="">{this.state.inventoryLang.inventory_select}</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
                              </select>
                              <span>{this.state.inventoryLang.inventory_months}</span>
                          </div>

                        </div>
                      </div>

                      <p className="p-text"><i>{this.state.inventoryLang.inventory_coupon_msg}</i></p>

                </div>
              </div>
            </div>

            <div className="footer-static">
              <button className="new-blue-btn pull-right" id="saveform" onClick={this.handleSubmit}>{this.state.inventoryLang.inventory_save}</button>
              <Link to="/inventory/discount-coupons" className="new-white-btn pull-right" >{this.state.inventoryLang.inventory_Cancel}</Link>
              {this.state.id ? <button className={(this.state.id) ? "new-red-btn pull-left" : "new-red-btn pull-left no-display"} onClick={this.showDeleteModal} data-message={this.state.inventoryLang.inventory_are_you_sure_del_PTI} >{this.state.inventoryLang.inventory_delete}</button> : ''}
              <div className={(this.state.showModal ? 'overlay' : '')}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.inventoryLang.inventory_Confirmation_required}{this.state.showModal}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.inventoryLang.inventory_discount_coupons_lbl}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.inventoryLang.inventory_No}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteDiscountCouponsIdFunct}>{this.state.inventoryLang.inventory_Yes}</button>
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
  if (state.InventoryReducer.action === "CREATE_DISCOUNT_COUPONS_ID") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.message = languageData.global[state.InventoryReducer.data.message];
      returnState.redirect = true;
      returnState.createUpdateDelete = state.InventoryReducer.data;
      returnState.showDateVal = new Date();
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  }
  else if (state.InventoryReducer.action === "FETCH_DISCOUNT_COUPONS_ID") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.fetchDiscountCouponsIdVAl = state.InventoryReducer.data;
      returnState.showDateValFetch = new Date();
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  } else if (state.InventoryReducer.action === "UPDATE_DISCOUNT_COUPONS_ID") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.message = languageData.global[state.InventoryReducer.data.message]
      returnState.createUpdateDelete = state.InventoryReducer.data
      returnState.redirect = true;
      returnState.showDateVal = new Date()
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  } else if (state.InventoryReducer.action === "DELETE_DISCOUNT_COUPONS_ID") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.message = languageData.global[state.InventoryReducer.data.message]
      returnState.createUpdateDelete = state.InventoryReducer.data
      returnState.showDateVal = new Date()
      returnState.redirect = true;
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ updateDiscountCouponsId: updateDiscountCouponsId, exportEmptyData: exportEmptyData, createDiscountCouponsId: createDiscountCouponsId, deleteDiscountCouponsId: deleteDiscountCouponsId, fetchDiscountCouponsId: fetchDiscountCouponsId }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateEditDiscountCoupons));
