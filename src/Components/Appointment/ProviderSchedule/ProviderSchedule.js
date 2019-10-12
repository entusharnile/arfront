import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchProviderSchedule, dynamicOrderingProviderSchedule, updateProviderScheduleSortOrder, exportEmptyData } from '../../../Actions/Appointment/appointmentAction.js';
import AppointmentHeader from '../AppointmentHeader.js'
import { numberFormat, checkIfPermissionAllowed, displayName } from '../../../Utils/services.js';


class ProviderSchedule extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      globalLang: languageData.global,
      appointmentLang: languageData.appointments,
      showLoadingText: false,
      loadMore: true,
      showLoader: false,
      providerScheduleList: [],
      next_page_url: '',
      dynamic_providers_ordering: false,
      is_superadmin: 0,
      days: '15',
      term: '',
      userChanged: false
    }
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    console.log(this.props.history);
    /*window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };*/
  }

  componentDidMount() {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      appointment_dynamic_ordering: languageData.appointments['appointment_dynamic_ordering'],
      appointment_filter: languageData.appointments['appointment_filter'],
      appointment_provider_name: languageData.appointments['appointment_provider_name'],
      appointment_occupied: languageData.appointments['appointment_occupied'],
      appointment_schedule_available_upto: languageData.appointments['appointment_schedule_available_upto'],
      appointment_appointment_booked_upto: languageData.appointments['appointment_appointment_booked_upto'],
      appointment_not_scheduled: languageData.appointments['appointment_not_scheduled'],
      appointment_not_booked: languageData.appointments['appointment_not_booked'],
      label_on: languageData.global['label_on'],
      label_off: languageData.global['label_off'],
      label_search: languageData.global['label_search'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      Please_Wait: languageData.global['Please_Wait'],
      sorry_no_record_found: languageData.global['sorry_no_record_found'],
    });

    document.addEventListener('click', this.handleClick, false);
    let formData = {
      'params': {
        term: this.state.term,
        days: this.state.days,
      }
    }
    this.setState({ 'showLoader': true })
    this.props.fetchProviderSchedule(formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      if(localStorage.getItem('showLoader') == 'false'){
        returnState.showLoader = false;
        return returnState;
      }
    } else if (nextProps.providerScheduleList != undefined && nextProps.providerScheduleList.providers !== prevState.providerScheduleList  && localStorage.getItem('showLoader') == 'false') {
      let returnState = {};

      returnState.providerScheduleList = nextProps.providerScheduleList.providers;
      if (nextProps.providerScheduleList.account_prefrence !== undefined) {
        returnState.dynamic_providers_ordering = (prevState.userChanged) ? prevState.dynamic_providers_ordering : ((nextProps.providerScheduleList.account_prefrence.dynamic_providers_ordering) ? false : true);
      }
      if (nextProps.providerScheduleList.is_superadmin !== undefined) {
        returnState.is_superadmin = nextProps.providerScheduleList.is_superadmin;
      }

      returnState.startFresh = false;
      returnState.showLoader = false;
      returnState.showLoadingText = false;
      localStorage.setItem('showLoader', true);

        //nextProps.exportEmptyData();

      returnState.providerScheduleListTimeStamp = nextProps.providerScheduleListTimeStamp;
      return returnState;
    }
    return null;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
      [event.target.name]: value,
      userChanged: true
    });

    if (event.target.name === 'days') {
      this.handleSubmit(event, value)
    } else if (event.target.name === 'dynamic_providers_ordering') {
      this.handleDynamicOrdering(value)
    }
  }

  handleDynamicOrdering = (value) => {
    localStorage.setItem('showLoader', true);
    this.setState({ 'showLoader': true });
    this.props.dynamicOrderingProviderSchedule({ is_enabled: (value) ? 0 : 1 });
  }

  handleSubmit = (event, value) => {
    event.preventDefault();
    localStorage.setItem("sortOnly", false);
    localStorage.setItem("showLoader", true);
    let formData = {
      params: {
        term: this.state.term,
        days: value ? value : this.state.days
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      providerScheduleList: [],
      showLoader: true,
      next_page_url: '',
      showLoader: true
    });
    //this.setState({ 'showLoader': true });
    this.props.fetchProviderSchedule(formData);
  };

  ProviderScheduleView = (id, event) => {
    if (event.target.className != 'easy-link' && event.target.className != 'new-blue-btn pull-right') {
      const providerSchedule = this.state.providerScheduleList.find(x => x.id === id)
      this.props.scheduleView(id, displayName(providerSchedule));
    }
    return;
  };

  loadMore = () => {
    this.setState({ 'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true })
    let formData = {
      'params': {
        term: this.state.term,
        days: this.state.days
      }
    }
    this.props.fetchProviderSchedule(formData, this.state.serviceCategoryId);
  }

  /*componentWillUnmount = () => {
   window.onscroll = () => {
     return false;
   }
  }*/

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
    let providerScheduleList = list.map((obj, idx) => {
      const providerSchedule = this.state.providerScheduleList.filter(x => x.id === obj)
      if (providerSchedule.length === 1) {
        return providerSchedule[0];
      }
    });
    this.setState({ providerScheduleList: providerScheduleList })
    this.props.updateProviderScheduleSortOrder(formData);
  };

  renderDragDropTable = () => {
    var list = [];
    list = this.state.providerScheduleList.map((obj, idx) => {
      return {
        content: (
          <React.Fragment key={'fragment_' + idx}>
            <td className="col-xs-3 table-updated-td Questionnaire-name"><a href="javascript:void(0);" className="drag-dots"></a>{obj.firstname + " " + obj.lastname}</td>
            <td className="col-xs-3 table-updated-td">{(obj.occupied_percentage) ? numberFormat(obj.occupied_percentage, 'decimal', 2) : 0} %</td>
            <td className="col-xs-3 table-updated-td">{(obj.last_schedule_date) ? obj.last_schedule_date : this.state.appointment_not_scheduled}</td>
            <td className="col-xs-3 table-updated-td">{(obj.last_appointment_date) ? obj.last_appointment_date : this.state.appointment_not_booked}</td>
          </React.Fragment>
        ),
        id: obj.id
      };
    });

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
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <tbody ref={provided.innerRef}>
              {list.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {
                    (provided, snapshot) => (
                      <tr className="table-updated-tr" data-order_by={item.id} onClick={this.ProviderScheduleView.bind(this, item.id)} ref={provided.innerRef}{...provided.draggableProps}{...provided.dragHandleProps}
                        style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                        {item.content}
                      </tr>
                    )
                  }
                </Draggable>)
              )}{null}{provided.placeholder}
            </tbody>
          )}
        </Droppable>
      </DragDropContext>
    )
  }

  renderSimpleTable = () => {
    return (
      <tbody>
        {
          this.state.providerScheduleList.map((obj, idx) => {
            return (
              <tr key={'providerSchedule' + idx} className="table-updated-tr" data-order_by={obj.id} onClick={this.ProviderScheduleView.bind(this, obj.id)}>
                <td className="col-xs-3 table-updated-td">{obj.firstname + " " + obj.lastname}</td>
                <td className="col-xs-3 table-updated-td">{(obj.occupied_percentage) ? numberFormat(obj.occupied_percentage, 'decimal', 2) : 0} %</td>
                <td className="col-xs-3 table-updated-td">{(obj.last_schedule_date) ? obj.last_schedule_date : this.state.appointment_not_scheduled}</td>
                <td className="col-xs-3 table-updated-td">{(obj.last_appointment_date) ? obj.last_appointment_date : this.state.appointment_not_booked}</td>
              </tr>
            )
          })
        }
      </tbody>
    )
  }

  render() {
    return (
        <div className="setting-setion">
          <div className="appointment-container">
          <div className="juvly-title">Click on a provider to set their availability</div>
          <div className="setting-search-outer no-padding">
            <form onSubmit={this.handleSubmit}>
              <div className="search-bg col-xs-5">
                <i className="fas fa-search" />
                <input className="setting-search-input search-key" name="term" placeholder={this.state.label_search} value={this.state.term} onChange={this.handleInputChange} autoComplete="off" />
              </div>
            </form>
            <div className="filter-type">
              <span className="search-text">{this.state.appointment_filter}:</span>
              <div className="header-select">
                <select name="days" onChange={this.handleInputChange} value={this.state.days}>
                  <option value="15">{this.state.appointmentLang.appointment_next_fifteen_days}</option>
                  <option value="30">{this.state.appointmentLang.appointment_next_thirty_days}</option>
                  <option value="45">{this.state.appointmentLang.appointment_next_forty_five_days}</option>
                  <option value="60">{this.state.appointmentLang.appointment_next_sixty_days}</option>
                  <option value="90">{this.state.appointmentLang.appointment_next_ninety_days}</option>
                </select>
                <i className="fas fa-angle-down"></i>
              </div>
            </div>
            {(this.state.is_superadmin) ?
              <div className="filter-type">
                <span className="search-text">{this.state.appointment_dynamic_ordering} : {(this.state.dynamic_providers_ordering) ? this.state.label_on : this.state.label_off} </span>
                <label className="setting-switch pull-right Dynamic-Ordering">
                  <input type="checkbox" name="dynamic_providers_ordering" value={this.state.dynamic_providers_ordering} checked={(this.state.dynamic_providers_ordering) ? 'checked' : false} onChange={this.handleInputChange} />
                  <span className="setting-slider"></span>
                </label>
              </div>
              :
              null
            }
          </div>
          <div className="table-responsive">
            <table className="table-updated appointmenTable table-min-width">
              <thead className="table-updated-thead">
                <tr>
                  <th className="col-xs-3 table-updated-th">{this.state.appointment_provider_name}</th>
                  <th className="col-xs-3 table-updated-th">% {this.state.appointment_occupied}</th>
                  <th className="col-xs-3 table-updated-th">{this.state.appointment_schedule_available_upto}</th>
                  <th className="col-xs-3 table-updated-th">{this.state.appointment_appointment_booked_upto}</th>
                </tr>
              </thead>

              {(this.state.providerScheduleList.length) > 0 &&
                (this.state.is_superadmin && !this.state.dynamic_providers_ordering) ? this.renderDragDropTable() : this.renderSimpleTable()
              }

              {(this.state.providerScheduleList.length) == 0 && (this.state.showLoader === false) &&
                <tbody>
                  <tr className="table-updated-tr">
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
        <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display"}>{this.state.loading_please_wait_text}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));

  localStorage.setItem('showLoader', 'false');

  if (state.AppointmentReducer.action === 'PROVIDER_SCHEDULE_LIST') {
    if (state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.providerScheduleList = state.AppointmentReducer.data.data;
      returnState.providerScheduleListTimeStamp = new Date();
    }
  } else if (state.AppointmentReducer.action === "PROVIDER_SCHEDULE_DYNAMIC_ORDERING") {
    if (state.AppointmentReducer.data.status == 200) {
      returnState.showLoader = false;
      returnState.timestamp = new Date();
      toast.dismiss();
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === "PROVIDER_SCHEDULE_SORT_ORDER_UPDATE") {
    if (state.AppointmentReducer.data.status == 200) {
      toast.dismiss();
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.AppointmentReducer.action === "EMPTY_APPOINTMENT_DATA") {
  }
  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchProviderSchedule: fetchProviderSchedule,
    dynamicOrderingProviderSchedule: dynamicOrderingProviderSchedule,
    updateProviderScheduleSortOrder: updateProviderScheduleSortOrder,
    exportEmptyData: exportEmptyData

  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProviderSchedule);
