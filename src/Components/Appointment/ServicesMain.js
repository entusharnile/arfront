import React, { Component, createRef } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import AppointmentConfigSidebar from './AppointmentConfigSidebar.js';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  getServiceCategories,
  fetchServiceCategory,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  updateSortOrder,
  exportEmptyData
 } from '../../Actions/Appointment/appointmentAction.js';
import AppointmentHeader from './AppointmentHeader.js';
import Services from './Services/Services.js';


class ServicesMain extends Component {
  constructor(props) {
    super(props);

    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      providerId: undefined,
      mode: 'Services',
      showListCatPop: false,
      showModal: false,
      nameError: false,
      catTerm: "",
      name: "",
      is_active: true,
      langData: languageData
    };
  }

  componentDidMount() {

  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    let returnState = {};
    returnState[event.target.name] = value;
    if(target.name == 'name' && value != "") {
      returnState.nameError = false;
    }
    this.setState(returnState);
  }
  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.serviceCatList != undefined && nextProps.serviceCatList !== prevState.serviceCatList && nextProps.catListTimeStamp != prevState.catListTimeStamp) {
        
        returnState.catListTimeStamp = nextProps.catListTimeStamp;
        returnState.startFresh = false;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
        returnState.showListCatPop = true;
        returnState.serviceCatList = nextProps.serviceCatList;
        returnState.name = "";
        returnState.serviceCategoryId = "";
        returnState.is_active = true
        return returnState;
    }
    if (nextProps.serviceCategoryData !== undefined && nextProps.serviceCategoryData.status === 200 && nextProps.serviceCategoryData !== prevState.serviceCategoryData) {
      returnState.serviceCategoryData = nextProps.serviceCategoryData;
      returnState.name = nextProps.serviceCategoryData.data.name;
      returnState.is_active = (nextProps.serviceCategoryData.data.is_active == 1) ? true : false;
      returnState.showLoader = false;
      returnState.createdCatTimeStamp = nextProps.createdCatTimeStamp;
      nextProps.exportEmptyData();
    }
    if(nextProps.updateOrderTimestamp != undefined && nextProps.updateOrderTimestamp != prevState.updateOrderTimestamp) {
      returnState.showLoader = false;
      returnState.updateOrderTimestamp = nextProps.updateOrderTimestamp;
    }
    return returnState;
  }

  openServicePackages = () => {
    import('./ServicesPackages/ServicesPackages.js').then(component => {
      let returnState = {};
      returnState.ServicesPackages = component.default;
      returnState.mode = 'ServicesPackages';
      this.setState(returnState);      
    });
  }

  openCreatePackage = (mode, id) => {
    import('./ServicesPackages/CreateEditServicesPackages.js').then(component => {
      let returnState = {};
      returnState.CreateEditServicesPackages = component.default;
      returnState.mode = 'CreateEditServicesPackages';
      returnState.servicePackageId = (id) ? id : undefined;
      returnState.servicePackageMode = (mode) ? mode : undefined;
      this.setState(returnState);      
    });
  }

  openCreateService = (mode, id) => {
    import('./Services/CreateEditServices.js').then(component => {
      let returnState = {};
      returnState.CreateEditServices = component.default;
      returnState.mode = 'CreateEditServices';
      returnState.serviceId = (id) ? id : undefined;
      returnState.serviceMode = (mode) ? mode : undefined;
      this.setState(returnState);      
    });
  }

  openDeleteSchedule = (id) => {
    import('./ProviderSchedule/ProviderScheduleDelete.js').then(component => {
      this.setState({
        ProviderScheduleDelete: component.default,
        showSchedulePop: true,
        showSchedule: false,
        showScheduleDelete: true,
        providerId: id,
      });
    });
  }

  backToProviderSchedule = () => {
    this.setState({
        showSchedulePop: true,
        showSchedule: true,
        showScheduleDelete: false,
        providerId: this.state.providerId,
        providerName : this.state.providerName
    });
  }

  openServices = () => {
    this.setState({mode: "Services"})
  }
  openServicesCat = () => {
    this.setState({showLoader: true})
    this.props.getServiceCategories({})
  }
  hideServicesCat = () => {
    this.setState({showListCatPop: false})
  }

  handleCategorySearch = event => {
      localStorage.setItem("sortOnly", false);
      event.preventDefault();
      //localStorage.setItem("sortOnly", true);
      let formData = {
          params: {
              term: this.state.catTerm,
          }
      };
      this.setState({
          showLoader: true,
          serviceCatList: [],
      });
      this.props.getServiceCategories(formData);
  };
  componentDidUpdate = (props, state) => {
    if(this.state.showListCatPop || this.state.showLoader) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
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
      const serviceCategoryId = this.state.serviceCategoryId;

      this.setState({
        showLoader: true
      });

      if (serviceCategoryId) {
        this.props.updateServiceCategory(formData, serviceCategoryId);
      } else {
        this.props.createServiceCategory(formData);
      }
  };
  editCat = (id) => {
    var element = document.getElementById("categoriesTable");
    element.scrollIntoView({ behavior: 'smooth'});
    let category = this.state.serviceCatList.find(y => y.id == id);
    if(category) {
      this.setState({name: category.name, is_active: category.is_active, serviceCategoryId: id})
    }
  }
  showDeleteModal = (id) => {
    this.setState({ showModal: true, deleteCatId: id })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deleteServiceCategory = () => {
    if (this.state.deleteCatId) {
      this.setState({ showLoader: true, hideBtns: true })
      this.dismissModal();
      this.props.deleteServiceCategory(this.state.deleteCatId);
    }
  }

  reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result;
  };

  getItemStyle = (isDragging, draggableStyle) => ({
      // some basic styles to make the items look a bit nicer
      userSelect: "none",

      // change background colour if dragging
      background: isDragging ? "#f7fbfd" : "ffffff",

      // styles we need to apply on draggables
      ...draggableStyle
  });

  reOrderList = list => {
      let formData = {
          object_ids: list
      };
      let serviceCatList = list.map((obj, idx) => {
          const serviceCat = this.state.serviceCatList.filter(x => x.id === obj)
          if (serviceCat.length === 1) {
              return serviceCat[0];
          }
      });
      this.setState({ serviceCatList: serviceCatList, showLoader: true })
      this.props.updateSortOrder(formData, "ServiceCategory");
  };
  render() {
    var list = [];
    if (this.state.serviceCatList !== undefined) {
        list = this.state.serviceCatList.map((obj, idx) => {
          const ref = createRef();

          const handleClick = () =>
            ref.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
            return {
                content: (
                    <React.Fragment key={'fragment_' + obj.id} >
                        <td className="col-xs-3 table-updated-td no-border-left Questionnaire-name"><a href="javascript:void(0);" className="drag-dots"></a>{obj.name}</td>
                        <td className="col-xs-3 table-updated-td">{(obj.is_active) ? this.state.langData.global.label_yes : this.state.langData.global.label_no}</td>
                        <td className="col-xs-3 table-updated-td">{obj.service_category_assoc_count}</td>
                        <td className="col-xs-3 table-updated-td p-l-5" ><a className="easy-link" onClick={this.editCat.bind(this, obj.id)}>{this.state.langData.global.label_edit}</a><a className={(obj.service_category_assoc_count == 0) ? "easy-link" : "no-display"} onClick={this.showDeleteModal.bind(this, obj.id)}>{this.state.langData.global.label_delete}</a></td>
                    </React.Fragment>
                ),
                id: obj.id
            };
        });
    }

    var onDragEnd = result => {
        // dropped outside the list
        let finalArr = [];
        if (!result.destination) {
            return;
        }

        const items = this.reorder(
            list,
            result.source.index,
            result.destination.index
        );

        list = items;
        finalArr = items.map((obj, idx) => {
            return obj.id;
        });
        this.reOrderList(finalArr);
    };
    const { CreateEditServices, serviceId, ServicesPackages, CreateEditServicesPackages, servicePackageId, servicePackageMode, serviceMode} = this.state;
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <AppointmentHeader activeMenuTag={'config'}/>
          <AppointmentConfigSidebar />
          {this.state.mode == 'Services' && <Services createService={this.openCreateService} openServicePackages={this.openServicePackages} openServicesCat={this.openServicesCat} />}
          {this.state.mode == 'CreateEditServices' && <CreateEditServices serviceId={serviceId} serviceMode={serviceMode} listServices={() => {this.setState({mode: 'Services'})}}/>}
          {this.state.mode == 'ServicesPackages' && <ServicesPackages openServices={this.openServices} openCreatePackage={this.openCreatePackage}/>}
          {this.state.mode == 'CreateEditServicesPackages' && <CreateEditServicesPackages servicePackageId = {servicePackageId} openServicePackages={this.openServicePackages} mode={servicePackageMode}/>}
        </div>

        <div className={(this.state.showSchedulePop) ? "modalOverlay allFilters" : "modalOverlay allFilters no-display"}>
            <div className="small-popup-outer privider-calender-popup">
                <div className="small-popup-header"><div className="popup-name">Provider Schedule - {this.state.providerName}</div><a onClick={() => {this.setState({showSchedulePop: false, ProviderScheduleView: undefined, ProviderScheduleDelete: undefined})}} className="small-cross">×</a></div>
                <div className="privider-calender-content">
                 
                </div>
            </div>
        </div>

        <div className={(this.state.showListCatPop) ? "modalOverlay" : "no-display"}>
          <div className="small-popup-outer appointment-detail-main displayBlock" >
             <div className="small-popup-header">
                <div className="popup-name">Manage Categories </div>
                <a className="small-cross" onClick={this.hideServicesCat}>×</a>
             </div>
             <div className="small-popup-content" >
                <div className="juvly-container no-padding-bottom" id="categoriesTable">
                   <div className="prescription-content">
                      <div className="doc-section edit-list-category" >
                 
                            <div className="row">
                               <div className="col-sm-6 col-xs-12">
                                  <div className="setting-field-outer m-b-10">
                                     <div className="new-field-label">Category Name<span className="setting-require">*</span></div>
                                     <div className="setting-input-outer"><input name="name" placeholder="Enter Category Name" className={(this.state.nameError) ? "setting-input-box field-error" : "setting-input-box"} type="text" value={this.state.name} autoComplete="off" onChange={this.handleInputChange} /></div>
                                  </div>
                               </div>
                               <div className="col-sm-6 col-xs-12">
                                  <div className="setting-field-outer m-b-10">
                                     <div className="new-field-label">Category Status<span className="setting-require">*</span></div>
                                     <div className={(this.state.is_active==true) ? 'switch-accordian-row': 'switch-accordian-row closed'} id="book">
                                      {this.state.AppointmentEmailSMS_Appointment_Booking_Confirmation}
                                      <label className="setting-switch">
                                        <input type="checkbox" name="is_active" className="setting-custom-switch-input" checked= {(this.state.is_active) ? 'checked': false} value={this.state.is_active || ''} onChange={this.handleInputChange} />
                                        <span className="setting-slider" />

                                      </label>
                                    </div>
                                  </div>
                               </div>
                               <div className="col-xs-12">

                                    <a className="new-blue-btn no-margin" data-dismiss="modal" onClick={this.handleSubmit}>Save</a>
                                    <a className={(this.state.name != "") ? "new-white-btn m-l-10" : "new-white-btn m-l-10 no-display"} data-dismiss="modal" onClick={() => {this.setState({name: "", is_active: true, serviceCategoryId: ""})}}>Cancel</a>
                               </div>
                            </div>
                       
                      </div>
                   </div>
                   
                   <div className="setting-search-outer no-padding">
                      <form onSubmit={this.handleCategorySearch}>
                        <div className="search-bg col-xs-4">
                          <i className="fas fa-search" />
                          <input className="setting-search-input search-key" autoComplete="off" name="catTerm" placeholder={"Search by name"} value={this.state.catTerm} onChange={this.handleInputChange} />
                        </div>
                      </form>
                    </div>
                    <div className="table-responsive m-b-20">
                        <table className="table-updated setting-table table-min-width" >
                          <thead className="table-updated-thead">
                            <tr>
                              <th className="col-xs-3 table-updated-th sorting" >{"Name"}</th>
                              <th className="col-xs-3 table-updated-th sorting">{"Active"}</th>
                              <th className="col-xs-3 table-updated-th sorting">{"No. of Services"}</th>
                              <th className="col-xs-3 table-updated-th sorting">{"Actions"}</th>
                            </tr>
                          </thead>
                          {list.length > 0 ?
                              <DragDropContext onDragEnd={onDragEnd}>
                                  <Droppable droppableId="droppable">
                                      {(provided, snapshot) => (<tbody ref={provided.innerRef}>
                                          {list.map((item, index) => (<Draggable key={item.id} draggableId={item.id} index={index}>
                                              {
                                                  (provided, snapshot) => (
                                                      <tr className="table-updated-tr" data-order_by={item.id} ref={provided.innerRef}{...provided.draggableProps}{...provided.dragHandleProps}
                                                          style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                                                          {item.content}
                                                      </tr>)
                                              }
                                          </Draggable>))}{null}{provided.placeholder}</tbody>)}
                                  </Droppable>
                              </DragDropContext>
                              :
                              <tbody>
                                  <tr className="table-updated-tr">
                                      <td className="col-xs-12 table-updated-td text-center" colSpan="7">{this.state.langData.global.sorry_no_record_found}</td>
                                  </tr>
                              </tbody>
                          }
                      </table>                  
                    </div>
                  </div>
               </div>
            </div>
        </div>
        <div className={(this.state.showModal) ? 'overlay' : ''} ></div>
          <div id="filterModal" role="dialog" className={(this.state.showModal) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                  <h4 className="modal-title" id="model_title">{this.state.langData.global.delete_confirmation}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">{this.state.langData.appointments.services_category_delete_msg}</div>
                <div className="modal-footer">
                  <div className="col-md-12 text-left" id="footer-btn">
                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.langData.global.label_no}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteServiceCategory}>{this.state.langData.global.label_yes}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock positionFixed' : 'new-loader text-left'}>
          <div className="loader-outer">
            <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
            <div id="modal-confirm-text" className="popup-subtitle" >{this.state.langData.global.Please_Wait}</div>
          </div>
        </div>
      </div>

    );
  }
}

function mapStateToProps(state) {
  let returnState = {}
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  toast.dismiss();
  console.log(state.AppointmentReducer.action);
  if (state.AppointmentReducer.action === 'SERVICE_CAT_LIST') {
      if (state.AppointmentReducer.data.status != 200) {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
      } else {
          returnState.serviceCatList = state.AppointmentReducer.data.data;
          returnState.catListTimeStamp = new Date();
      }
  }
  if (state.AppointmentReducer.action === "SERVICE_CATEGORY_DATA") {
    if (state.AppointmentReducer.data.status != 200) {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.serviceCategoryData = state.AppointmentReducer.data;
    }
  }
  if (state.AppointmentReducer.action === "CREATE_SERVICE_CATEGORY") {
    if (state.AppointmentReducer.data.status == 201) {
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
      returnState.serviceCatList = state.AppointmentReducer.data.data;
      returnState.catListTimeStamp = new Date();
    } else {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  }
  if (state.AppointmentReducer.action === 'UPDATE_SERVICE_CATEGORY') {
    if (state.AppointmentReducer.data.status == 200) {
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
      returnState.serviceCatList = state.AppointmentReducer.data.data;
      returnState.catListTimeStamp = new Date();
    } else {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  }
  if (state.AppointmentReducer.action === 'DELETE_SERVICE_CATEGORY') {
    if (state.AppointmentReducer.data.status == 200) {
        toast.success(languageData.global[state.AppointmentReducer.data.message]);
        returnState.serviceCatList = state.AppointmentReducer.data.data;
        returnState.catListTimeStamp = new Date();
    } else {
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  }
  if (state.AppointmentReducer.action === "SORT_ORDER_UPDATE") {
      if (state.AppointmentReducer.data.status == 200) {
          toast.success(languageData.global[state.AppointmentReducer.data.message]);
          returnState.updateOrderTimestamp = new Date();
      } else {
          toast.error(languageData.global[state.AppointmentReducer.data.message]);
          returnState.showLoader = false
      }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getServiceCategories: getServiceCategories,
    createServiceCategory: createServiceCategory,
    updateServiceCategory: updateServiceCategory,
    deleteServiceCategory: deleteServiceCategory,
    updateSortOrder: updateSortOrder,
    exportEmptyData: exportEmptyData,
  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ServicesMain));
