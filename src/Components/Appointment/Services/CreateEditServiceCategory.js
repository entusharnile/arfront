import React, { Component } from 'react';
import {
  fetchServiceCategory,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  exportEmptyData
} from '../../../Actions/Appointment/appointmentAction.js';
import config from '../../../config.js';
import axios from 'axios';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link, Redirect, withRouter } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppointmentHeader from '../AppointmentHeader.js'

class CreateEditServiceCategory extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.state = {
      serviceCategoryData: {},
      showLoader: false,
      userChanged: false,
      name: '',
      is_active: false,
      nameClass: 'setting-input-box',
      isDeleted: false,
      showModal: false,

    };
  }
  componentDidMount() {
    window.onscroll = () => {
      return false;
    }
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      appointment_service_category_create_category: languageData.appointments['appointment_service_category_create_category'],
      appointment_service_category_edit_category: languageData.appointments['appointment_service_category_edit_category'],
      appointment_service_category_category_name: languageData.appointments['appointment_service_category_category_name'],
      label_active: languageData.global['label_active'],
      label_yes: languageData.global['label_yes'],
      label_no: languageData.global['label_no'],
      label_save: languageData.global['label_save'],
      label_cancel: languageData.global['label_cancel'],
      Please_Wait: languageData.global['Please_Wait'],
      label_delete: languageData.global['label_delete'],
      delete_confirmation: languageData.global['delete_confirmation'],
      services_category_delete_msg: languageData.appointments['services_category_delete_msg'],
    });
    const serviceCategoryId = this.props.match.params.id;
    if (serviceCategoryId) {
      this.setState({ serviceCategoryId: serviceCategoryId });
    }
    if (serviceCategoryId) {
      this.setState({ showLoader: true })
      this.props.fetchServiceCategory({}, serviceCategoryId);
    } else {
      this.props.exportEmptyData({});
    }

  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {}
    if (props.showLoader != undefined && props.showLoader == false) {
      return { showLoader: false };
    }
    if (props.serviceCategoryData !== undefined && props.serviceCategoryData.status === 200 && props.serviceCategoryData !== state.serviceCategoryData) {
      returnState.serviceCategoryData = props.serviceCategoryData;
      returnState.name = (state.userChanged) ? state.name : props.serviceCategoryData.data.name;
      returnState.is_active = (state.userChanged) ? state.is_active : ((props.serviceCategoryData.data.is_active == 1) ? true : false);
      returnState.showLoader = false;
      returnState.isDeleted = (props.serviceCategoryData.data.service_category_assoc_count) ? false : true;
    } else if (props.redirect != undefined && props.redirect == true) {
      toast.success(props.message)
      props.history.push('/appointment/service-category');
    } else if (props.showLoader != undefined && props.showLoader == false) {
      returnState.showLoader = false;
    }
    return returnState;
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value = target.value;
    switch (target.type) {
      case 'checkbox': {
        value = target.checked;
        break;
      }

      case 'radio': {
        value = (target.value == true || target.value == "true") ? true : false;
        break;
      }
    }
    this.setState({ [event.target.name]: value, userChanged: true });
  }

  handleSubmit = (event) => {
    //====Frontend validation=================
    let error = false;
    this.setState({
      nameError: false
    });

    if (typeof this.state.name === undefined || this.state.name === null || this.state.name.trim() === '') {
      this.setState({
        nameError: true,
        nameClassError: 'setting-input-box field_error'
      })
      error = true;
    } else if (this.state.name) {
      this.setState({
        nameClassError: false,
        nameClass: 'setting-input-box'
      })
    }
    if (error === true) {
      return;
    }

    let formData = {
      name: this.state.name,
      is_active: (this.state.is_active == true || this.state.is_active == 'true') ? 1 : 0
    }
    const serviceCategoryId = this.props.match.params.id;

    this.setState({
      showLoader: true
    });

    if (serviceCategoryId) {
      this.props.updateServiceCategory(formData, serviceCategoryId);
    } else {
      this.props.createServiceCategory(formData);
    }
  };

  showDeleteModal = () => {
    this.setState({ showModal: true })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteServiceCategory = () => {
    if (this.state.serviceCategoryId) {
      this.setState({ showLoader: true, hideBtns: true })
      this.dismissModal();
      this.props.deleteServiceCategory(this.state.serviceCategoryId);
    }
  }


  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <AppointmentHeader activeMenuTag={'service-category'} />
          <div className="juvly-section full-width">
            <div className="juvly-container border-top">
              <div className="juvly-title m-b-40">{(this.state.serviceCategoryId) ? this.state.appointment_service_category_edit_category : this.state.appointment_service_category_create_category}
                <Link to="/appointment/service-category" className="pull-right cross-icon"><img src="/images/close.png" /></Link>
              </div>
              <div className="row">
                <div className="col-md-4 col-sm-6 col-xs-12">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.appointment_service_category_category_name}  <span className="required">*</span></div>
                    <div className="setting-input-outer">
                      <input name="name" id="name" className={(this.state.nameError === true) ? this.state.nameClassError : this.state.nameClass} maxLength={255} type="text" value={this.state.name} onChange={this.handleInputChange} autoComplete="off" />
                    </div>
                  </div>
                </div>
                <div className="col-xs-12">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.label_active}</div>
                    <div className="basic-checkbox-outer">
                      <input id="radiobutton1" className="basic-form-checkbox" name="is_active" type="radio" value="true" onChange={this.handleInputChange} checked={(this.state.is_active) ? 'checked' : false} />
                      <label className="basic-form-text" htmlFor="radiobutton1">{this.state.label_yes}</label>
                    </div>
                    <div className="basic-checkbox-outer">
                      <input id="radiobutton2" className="basic-form-checkbox" name="is_active" type="radio" value="false" onChange={this.handleInputChange} checked={(!this.state.is_active) ? 'checked' : false} />
                      <label className="basic-form-text" htmlFor="radiobutton2">{this.state.label_no}</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
              </div>
            </div>
            <div className="footer-static">
              {(this.state.serviceCategoryId > 0 && this.state.isDeleted) &&
                <input className="new-red-btn pull-left confirm-model" onClick={this.showDeleteModal} data-message={this.state.services_packages_delete_msg} data-confirm-url="" type="button" autoComplete="off" value={this.state.label_delete} />
              }

              <div className={(this.state.showModal) ? 'overlay' : ''} ></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.delete_confirmation}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.services_category_delete_msg}</div>
                    <div className="modal-footer">
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.label_no}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteServiceCategory}>{this.state.label_yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <input className="new-blue-btn pull-right" id="save_service_category" onClick={this.handleSubmit} type="button" autoComplete="off" defaultValue={this.state.label_save} />
              <Link to="/appointment/service-category" className="new-white-btn pull-right cancelAction">{this.state.label_cancel}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.AppointmentReducer.action === "SERVICE_CATEGORY_DATA") {
    if (state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.serviceCategoryData = state.AppointmentReducer.data;
    }
  } else if (state.AppointmentReducer.action === "CREATE_SERVICE_CATEGORY") {
    if (state.AppointmentReducer.data.status == 201) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'UPDATE_SERVICE_CATEGORY') {
    if (state.AppointmentReducer.data.status == 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'DELETE_SERVICE_CATEGORY') {
    if (state.AppointmentReducer.data.status == 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.AppointmentReducer.data.message];
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === 'EMPTY_DATA') {

  }
  return returnState;
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchServiceCategory: fetchServiceCategory,
    createServiceCategory: createServiceCategory,
    updateServiceCategory: updateServiceCategory,
    deleteServiceCategory: deleteServiceCategory,
    exportEmptyData: exportEmptyData,

  }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(CreateEditServiceCategory);
