import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ToastContainer, toast } from "react-toastify";
import { getServiceList, updateServiceSortOrder, exportEmptyData, getServiceCategories } from '../../../Actions/Appointment/appointmentAction.js';
import AppointmentHeader from '../AppointmentHeader.js'
import { checkIfPermissionAllowed} from '../../../Utils/services.js';
import AppointmentConfigSidebar from '../AppointmentConfigSidebar.js';

class Services extends Component {
  constructor(props) {
    super(props);

    this.state = {
      startFresh: true,
      showLoadingText: false,
      loadMore: true,
      showLoader: false,
      serviceList: [],
      serviceCategoryData: [],
      apiServiceList: {},
      term: '',
      sortorder: "asc",
      sortby: "name"
    }
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
      [event.target.name]: value
    });

    if (event.target.name === 'object_name') {
      this.handleSubmit(event, value)
    }
  }

  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", false);
    let formData = {
      params: {
        term: this.state.term,
        sortorder: this.state.sortorder,
        sortby: this.state.sortby,
      }
    };
    this.setState({
      startFresh: true,
      loadMore: true,
      startFresh: true,
      serviceList: [],
      showLoader: true,
      apiServiceList: {}
    });
    this.setState({ 'showLoader': true });
    this.props.getServiceList(formData);
  };


  ServiceCreate = serviceCategoryId => {
    this.props.createService('create');
  };

  ServicePackages = serviceCategoryId => {
    this.props.openServicePackages();
  };

  ServiceClone = (id, event) => {
      this.props.createService('clone', id);
  };

  ServiceEdit = (id, event) => {
    this.props.createService('edit', id);
  };

  componentDidMount() {
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      appointment_service_create_service: languageData.appointments['appointment_service_create_service'],
      appointment_service_service_of_services: languageData.appointments['appointment_service_service_of_services'],
      appointment_service_can_be_booked_by_customer: languageData.appointments['appointment_service_can_be_booked_by_customer'],
      appointment_service_associated_clinics: languageData.appointments['appointment_service_associated_clinics'],
      appointment_service_appointments: languageData.appointments['appointment_service_appointments'],
      label_hrs: languageData.global['label_hrs'],
      label_mins: languageData.global['label_mins'],
      label_clone: languageData.global['label_clone'],
      label_search: languageData.global['label_search'],
      label_yes: languageData.global['label_yes'],
      label_no: languageData.global['label_no'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      Please_Wait: languageData.global['Please_Wait'],
      sorry_no_record_found: languageData.global['sorry_no_record_found'],
    });

    /*const serviceCategoryId = this.props.match.params.serviceCategoryId;
    if (serviceCategoryId) {
      this.setState({ serviceCategoryId: serviceCategoryId });
    }*/

    //document.addEventListener('click', this.handleClick, false);
    let formData = {
      'params': {
        term: this.state.term,
        sortorder: this.state.sortorder,
        sortby: this.state.sortby,
      }
    }
    this.setState({ 'showLoader': true })
    this.props.getServiceList(formData);
  }

  loadMore = () => {
    localStorage.setItem("sortOnly", true);
    this.setState({ 'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true })
    let formData = {
      'params': {
        term: this.state.term,
        sortorder: this.state.sortorder,
        sortby: this.state.sortby,
      }
    }
    this.props.getServiceList(formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      nextProps.exportEmptyData();
      return returnState;
    } else if (nextProps.serviceList !== undefined && nextProps.serviceList.services !== prevState.serviceList && nextProps.serviceListTime != prevState.serviceListTime) {
      let returnState = {};
      returnState.serviceList = nextProps.serviceList.services;
      returnState.showLoader = false;
      returnState.showLoadingText = false;
      returnState.serviceListTime = nextProps.serviceListTime;
      return returnState;
    }
    return null;
  }

  /*componentWillUnmount = () => {
   window.onscroll = () => {
     return false;
   }
  }*/

  AssociatedClinincs = list => {
    let associatedClinincs = [];
    associatedClinincs = list.map((obj, idx) => {
      return obj.clinic.clinic_name;
    });
    return associatedClinincs.join(', ');
  }

  onSort = (sortby) => {
    let sortorder = (this.state.sortorder === 'asc') ? 'desc' : 'asc';
    let formData = {'params':{
      page:1,
      pagesize:this.state.pagesize,
      sortby:sortby,
      sortorder: sortorder,
      term:this.state.term,

      }
    }

    this.setState({
      page:1,
      pagesize:this.state.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url:'',
      serviceList: [],
    }, () => {
     this.props.getServiceList(formData);
    });


  }
  showClinicName = (clinicList) => {
    if(clinicList.length) {
      let name = "";
      clinicList.map((obj, idx) => {
        if(obj.service_category) {
          name = (name == "") ? obj.service_category.name : name + " , "+ obj.service_category.name;
        }
      })
      return name;
    } else {
      return "";
    }
  }

  hideCatPop = () => {
    this.setState({showListCatPop: false});
  }

  openCategoriesPop = () => {
    this.props.openServicesCat()
  }




  render() {
    var list = [];
    if (this.state.serviceList !== undefined) {
      list = this.state.serviceList.map((obj, idx) => {
        return {
          content: (
            <React.Fragment key={'fragment_' + idx}>
              <td className="col-xs-3 table-updated-td Questionnaire-name" onClick={this.ServiceEdit.bind(this, obj.id)}>{obj.name}</td>
              <td className="col-xs-3 table-updated-td" onClick={this.ServiceEdit.bind(this, obj.id)}>{this.showClinicName(obj.service_category_assoc)}</td>
              <td className="col-xs-3 table-updated-td" onClick={this.ServiceEdit.bind(this, obj.id)}>{this.AssociatedClinincs((obj.service_clinics != undefined) ? obj.service_clinics : [])}</td>
              <td className="col-xs-3 table-updated-td" ><a href="javascript:void(0);" onClick={this.ServiceClone.bind(this, obj.id)} className="easy-link no-padding-left">{this.state.label_clone}</a></td>
            </React.Fragment>
          ),
          id: obj.id
        };
      });
    }


    return (
        <div className="setting-setion">
          <div className="appointment-container">
          <ul className="appointment-tabs">
            <li><a className="active" >Services</a></li>
            <li><a className="" onClick={this.ServicePackages}>Services Packages</a></li>
          </ul>

          <div className="setting-search-outer no-padding m-b-10">
            <form onSubmit={this.handleSubmit}>
              <div className="search-bg col-md-4 m-b-10">
                <i className="fas fa-search" />
                <input className="setting-search-input search-key" autoComplete="off" name="term" placeholder={this.state.label_search} value={this.state.term} onChange={this.handleInputChange} />
              </div>
            </form>
            <a href="javascript:void(0);" onClick={this.ServiceCreate.bind(this, this.state.serviceCategoryId)} className="new-blue-btn pull-right">{this.state.appointment_service_create_service}</a>
            <a onClick={this.openCategoriesPop}  className="new-blue-btn pull-right"><i className="fa fa-list"></i> Manage Categories</a>

          </div>
          <div className="table-responsive appointmenTable">
            <table className="table-updated setting-table table-min-width">
              <thead className="table-updated-thead">
                <tr>
                  <th
                    className="col-xs-3 table-updated-th sorting"
                    onClick={() => this.onSort('name')}
                    >{"Service Name"}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'name') ? "gray-blue" : "gray-gray" } /></th>
                  <th
                    className="col-xs-3 table-updated-th sorting"

                  >{"Category"}</th>
                  <th className="col-xs-3 table-updated-th sorting">{"Location"}</th>
                  {checkIfPermissionAllowed("manage-services") &&
                    <th className="col-xs-3 table-updated-th">Action</th>
                  }
                </tr>
              </thead>
              { list.length > 0 ?
                <tbody >
                      {
                        list.map((item, index) =>
                          <tr className="table-updated-tr" key={"services-"+index}>
                            {item.content}
                          </tr>
                      )}
                </tbody>


                :
                <tbody>
                  <tr className={(!this.state.showLoader) ? 'table-updated-tr' : 'table-updated-tr no-display'}>
                    <td className="col-xs-12 table-updated-td text-center" colSpan="7">{this.state.sorry_no_record_found}</td>
                  </tr>
                </tbody>
              }

            </table>
          </div>
          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
            <div className="loader-outer">
              <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
              <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {}
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  if (state.AppointmentReducer.action === "SERVICE_SORT_ORDER_UPDATE") {
    if (state.AppointmentReducer.data.status == 200) {
      toast.dismiss();
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
      returnState.serviceList = state.AppointmentReducer.data.data;
      returnState.serviceListTime = new Date();
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      //returnState.showLoader = false
    }
    return {};
  } else if (state.AppointmentReducer.action === 'SERVICE_SERVICES_LIST') {
    if (state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.serviceList = state.AppointmentReducer.data.data;
      returnState.serviceListTime = new Date();
    }
  }
  if (state.AppointmentReducer.action === 'SERVICE_CAT_LIST') {
      if (state.AppointmentReducer.data.status != 200) {
          toast.dismiss();
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
      } else {
          returnState.serviceCatList = state.AppointmentReducer.data.data;
          returnState.catListTimeStamp = new Date();
      }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getServiceList: getServiceList,
    updateServiceSortOrder: updateServiceSortOrder,
    exportEmptyData: exportEmptyData,
    getServiceCategories: getServiceCategories
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Services);
