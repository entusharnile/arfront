import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { createCategory, fetchClinics, fetchCategoriesDataID, updateCategories, deleteCategories } from '../../Actions/Inventory/inventoryActions.js';
import { geCommonTrackEvent } from '../../Actions/Common/commonAction.js';
import { withRouter } from 'react-router';
import validator from 'validator';
import InventoryHeader from './InventoryHeader.js';
import { numberFormat, isNumber, isFormSubmit, isPositiveNumber, isInteger } from '../../Utils/services.js';

class CreateEditCategories extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      id: this.props.match.params.id,
      category_name: '',
      cat_status: true,
      is_custom_rule_tax_yes: 'row',
      is_custom_rule_tax_no: 'row no-display',
      is_custom_rule_tax: false,
      tax_rules: [],
      clinic_id: '',
      tax_percentage: '',
      clinicsList: [],

      startFresh: true,
      showLoader: false,
      showModal: false,
      user_changed: false,
      tabClicked: false,
      Categories: [],
      data: [],
      childCheck: false,
      selected: [],

      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      dashboardLang: languageData.dashboard
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      return false;
    }
  }

  showLoaderFunc = () => {
    localStorage.setItem("showLoader", false);
    this.setState({ showLoader: true })
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
    this.props.fetchClinics();
    const categoriesId = this.props.match.params.id;
    const valTrack = "Product Category Setup";
    if (!categoriesId) {
      this.props.geCommonTrackEvent(valTrack);
    }
    if (categoriesId) {
      this.showLoaderFunc();
      this.props.fetchCategoriesDataID(categoriesId);
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.fetchInventoryCategoriesData !== undefined && props.fetchInventoryCategoriesData.status === 200 && props.fetchInventoryCategoriesData.data != state.fetchInventoryCategoriesData) {
      if (localStorage.getItem("showLoader") == "true") {
        let returnState = {}
        let categoryData = props.fetchInventoryCategoriesData.data.product_category;
        returnState.category_name = (state.userChanged) ? state.category_name : categoryData.category_name
        returnState.cat_status = (state.userChanged) ? state.cat_status : categoryData.cat_status ? true : false
        returnState.is_custom_rule_tax = (state.userChanged) ? state.is_custom_rule_tax : categoryData.tax ? true : false

        let clinicTax = categoryData.category_clinic_tax
        clinicTax.length != undefined && clinicTax.map((obj, idx) => {
          returnState["tax_percentage-" + obj.clinic_id] = String(obj.tax_percentage)
        });

        returnState.category_clinic_tax = {
          clinic_id: (state.userChanged) ? state.fetchInventoryCategoriesData.clinic_id : categoryData.id,
          tax_percentage: (state.userChanged) ? state.fetchInventoryCategoriesData.tax_percentage : categoryData.tax
        }
        returnState.fetchInventoryCategoriesData = props.fetchInventoryCategoriesData.data
        returnState.showLoader = false;
        return returnState;
      }
    } else if (
      props.clinicsList != undefined &&
      props.clinicsList.data != state.clinicsList && props.clinicsList.status == 200
    ) {
      let returnState = {};
      let clinicTax = props.clinicsList.data
      clinicTax.length != undefined && clinicTax.map((obj, idx) => {
        returnState["tax_percentage-" + obj.id] = 0
      });
      returnState.clinicsList = (state.clinicsList.length) ? state.clinicsList : props.clinicsList.data
      returnState.userChanged = false
      returnState.showLoader = false
      return returnState;
    } else if (props.redirect != undefined && props.redirect == true) {
      toast.success(props.message)
      props.history.push('/inventory/products-categories');
    }
    else if (props.showLoader != undefined && props.showLoader == false) {
      return { showLoader: false }
    } else
      return null;
  }

  categoriesEdit = (statusId, id) => {
    return (
      <div className="no-display" >
        {this.props.history.push(`/inventory/e-giftcards/${id}/edit`)}
      </div>
    );
  }

  handleSubmit = (event, value) => {
    const id = this.props.match.params.id;
    let error = false;
    let flag = false;
    let checkVal = false;
    let errorState = {};
    event.preventDefault();
    localStorage.setItem('sortOnly', true);
    let tax_rules = [];

    this.setState({
      category_name_Error: false
    });

    if (this.state.is_custom_rule_tax) {
      for (let x in this.state) {
        let taxNew = x.split('tax_percentage-')[1];
        if (x.startsWith('tax_percentage-')) {
          if (this.state[x] === '' || this.state[x] === undefined || this.state[x] === null || !isPositiveNumber(this.state[x])) {
            errorState['q-class-' + taxNew] = false;
            flag = true;
            checkVal = true;
          }
          else {
            tax_rules.push({ clinic_id: taxNew, tax_percentage: this.state[x] })
            errorState['q-class-' + taxNew] = true;
            checkVal = true;

          }
        }
      }
    }

    this.setState(errorState)
    if (this.state.is_custom_rule_tax && !checkVal) {
      toast.error(this.state.globalLang["tax_rules_is_required"]);
      return false;
    }
    if (flag) {
      return false;
    }

    if (typeof this.state.category_name === undefined || this.state.category_name === null || this.state.category_name === '') {
      this.setState({
        category_name_Error: true
      })
      error = true;
    }

    if (error === true) {
      return;
    }

    this.showLoaderFunc();
    let formData = {
      category_name: this.state.category_name,
      is_custom_rule_tax: this.state.is_custom_rule_tax == true ? 1 : 0,
      tax: this.state.is_custom_rule_tax == true ? 1 : 0,
      cat_status: this.state.cat_status == true ? 1 : 0,
      tax_percentage: this.state.tax_percentage,
      tax_rules: tax_rules
    };

    if (id) {
      this.props.updateCategories(formData, id);
    }
    else {
      this.props.createCategory(formData);
    }
  };

  showDeleteModal = () => {
    this.setState({ showModal: true })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteCategories = () => {
    this.dismissModal();
    let id = this.props.match.params.id;
    this.setState({ showLoader: true })
    this.props.deleteCategories(id);
  }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'products-categories'} />
          <div className="juvly-section full-width">
            <div className="juvly-container">
              <div className="juvly-title">{this.state.inventoryLang.inventory_product_category}
                <a className="pull-right crossIcon" href="/inventory/products-categories"><img src="/images/close.png" /></a>
                <div className="setting-custom-switch product-active pull-right">
                  <span id="membership_lable">{this.state.inventoryLang.inventory_product_category_active}</span>
                  <label className="setting-switch pull-right no-margin">
                    <input type="checkbox" name="cat_status" className="setting-custom-switch-input" checked={(this.state.cat_status) ? 'checked' : false} value={this.state.cat_status} autoComplete="off" onChange={this.handleInputChange} />
                    <span className="setting-slider" />
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="juvly-subtitle">{(this.state.id) ? this.state.inventoryLang.inventory_edit_category : this.state.inventoryLang.inventory_create_category}</div>
                  <div className="row">
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_category_name}<span className="setting-require">*</span></div>
                        <input className={this.state.category_name_Error === true ? "setting-input-box field_error" : "setting-input-box"} type="text" name="category_name" value={this.state.category_name} autoComplete="off" onChange={this.handleInputChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="switch-accordian-outer">
              <div className="switch-accordian-row custom-txt-rule-left-padding" id="book">
                {this.state.inventoryLang.inventory_custom_tax_rule}
                <label className="setting-switch pull-right">
                  <input type="checkbox" name="is_custom_rule_tax" className="setting-custom-switch-input" checked={(this.state.is_custom_rule_tax) ? 'checked' : false} value={this.state.is_custom_rule_tax} autoComplete="off" onChange={this.handleInputChange} />
                  <span className="setting-slider" />
                </label>
              </div>
              <div className="setting-container" id="Appointment_Booking-form-title">
                <div className={(this.state.is_custom_rule_tax == true || this.state.is_custom_rule_tax == 1) ? this.state.is_custom_rule_tax_yes : this.state.is_custom_rule_tax_no}>

                  {this.state.clinicsList !== undefined &&
                    this.state.clinicsList.map((obj, idx) => {
                      return (
                        <div className="col-xs-12 col-sm-6 col-md-4 col-lg-3" key={idx} >
                          <div className="setting-field-outer">
                            <div className="new-field-label" >{(obj.clinic_name) ? obj.clinic_name : ''}</div>
                            <input className={(this.state["q-class-" + obj.id] || this.state["q-class-" + obj.id] == undefined) ? "setting-input-box" : "setting-input-box  field-error"} name={"tax_percentage-" + obj.id} type="text" value={this.state["tax_percentage-" + obj.id]} placeholder='0' autoComplete="off" onChange={this.handleInputChange} />
                          </div>
                        </div>
                      );
                    })}

                </div>
              </div>
            </div>

            <div className="footer-static">
              <button className="new-blue-btn pull-right" id="saveform" onClick={this.handleSubmit}>{this.state.inventoryLang.inventory_save}</button>
              <Link to="/inventory/products-categories" className="new-white-btn pull-right" id="resetform">{this.state.inventoryLang.inventory_Cancel}</Link>
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
                      {this.state.inventoryLang.inventory_del_product_category_delete_msg}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.inventoryLang.inventory_No}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteCategories}>{this.state.inventoryLang.inventory_Yes}</button>
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
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  localStorage.setItem("showLoader", true);
  let returnState = {};
  if (state.InventoryReducer.action === "CREATE_CATEGORY") {
    if (state.InventoryReducer.data.status === 201) {
      returnState.message = languageData.global[state.InventoryReducer.data.message];
      returnState.redirect = true;
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "FETCH_CLINICS") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.clinicsList = state.InventoryReducer.data;
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "FETCH_SELECTED_CATEGORY") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.fetchInventoryCategoriesData = state.InventoryReducer.data;
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "UPDATE_CATEGORIES") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.message = languageData.global[state.InventoryReducer.data.message];
      returnState.redirect = true;
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "DELETE_CATEGORIES") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.message = languageData.global[state.InventoryReducer.data.message];
      returnState.redirect = true;
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }
  else if (state.CommonReducer.action === "GET_TRACK_HEAP_EVENT") {
    if (state.CommonReducer.data.status != 201) {
      returnState.message = languageData.global[state.CommonReducer.data.message];
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ createCategory: createCategory, fetchClinics: fetchClinics, fetchCategoriesDataID: fetchCategoriesDataID, updateCategories: updateCategories, deleteCategories: deleteCategories, geCommonTrackEvent: geCommonTrackEvent }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateEditCategories));
