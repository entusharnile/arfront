import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify";
import { fetchResourceSchedule} from '../../../Actions/Appointment/appointmentAction.js';
import AppointmentHeader from '../AppointmentHeader.js'
import { checkIfPermissionAllowed} from '../../../Utils/services.js';

class ResourceSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page:1,
      pagesize:25,
      next_page_url: '',
      startFresh: true,
      showLoadingText : false,
      loadMore: true,
      showLoader : false,
      resourceScheduleList:[],
      next_page_url:''
    }
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      appointment_resource_schedule: languageData.appointments['appointment_resource_schedule'],
      appointment_add_resource: languageData.appointments['appointment_add_resource'],
      appointment_resource_name: languageData.appointments['appointment_resource_name'],
      appointment_resource_type: languageData.appointments['appointment_resource_type'],
      appointment_clinic: languageData.appointments['appointment_clinic'],
      label_search: languageData.global['label_search'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      Please_Wait: languageData.global['Please_Wait'],
      sorry_no_record_found: languageData.global['sorry_no_record_found'],
    });

    document.addEventListener('click', this.handleClick, false);
    let formData = {'params':{
        term        : this.state.term,
        sortby      : "name",
        sortorder      : "asc",
      }
    }
    this.setState({'showLoader': true})
    this.props.fetchResourceSchedule(formData);
  }

/*  componentWillUnmount = () => {
   window.onscroll = () => {
     return false;
   }
  }*/

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      return returnState;
   }
    if (
      nextProps.resourceScheduleList != undefined &&
      nextProps.resourceScheduleList.resources !== prevState.resourceScheduleList
    ) {
        let returnState = {};
          returnState.resourceScheduleList = nextProps.resourceScheduleList.resources;
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
      return returnState;
      }


    return null;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
        [event.target.name]: value
    });

    if ( event.target.name === 'object_name' ) {
      this.handleSubmit(event, value)
    }
  }

  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let formData = {
      params: {
        term: this.state.term,
        sortby      : "name",
        sortorder      : "asc",
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      resourceScheduleList: [],
      showLoader:true,
      next_page_url:''
    });
    this.setState({'showLoader': true});
    this.props.fetchResourceSchedule(formData);
  };

  ResourceScheduleCreate = serviceCategoryId => {
    this.props.addResource('create');
  };

  ResourceScheduleEdit = (id,event) => {
    if(event.target.className != 'easy-link' && event.target.className != 'new-blue-btn pull-right'){
      this.props.addResource('edit', id);
    }
  };

  render() {
    return (<div>
      <div className="setting-search-outer no-padding">
        <form onSubmit={this.handleSubmit}>
          <div className="search-bg new-search">
              <i className="fas fa-search" />
              <input className="setting-search-input search-key"  name="term"  placeholder={this.state.label_search} value={this.state.term} onChange={this.handleInputChange} autoComplete="off" />
          </div>
        </form>
        {checkIfPermissionAllowed("manage-resource-schedule") &&
          <a href="javascript:void(0);" onClick={this.ResourceScheduleCreate.bind()} className="new-blue-btn pull-right">{this.state.appointment_add_resource}</a>
        }
      </div>
      <div className="table-responsive">
        <table className="table-updated juvly-table table-min-width">
          <thead className="table-updated-thead">
            <tr>
              <th className="col-xs-3 table-updated-th">{this.state.appointment_resource_name}</th>
              <th className="col-xs-3 table-updated-th">{this.state.appointment_resource_type}</th>
              <th className="col-xs-1 table-updated-th">{this.state.appointment_clinic}</th>
            </tr>
          </thead>
          <tbody>
          {this.state.resourceScheduleList.length > 0 ?
              this.state.resourceScheduleList.map((obj, idx) => {
                return (
                  <tr key={'fragment_'+idx} className="table-updated-tr"  data-order_by={obj.id}  onClick={this.ResourceScheduleEdit.bind(this, obj.id)} >
                    <td className="col-xs-3 table-updated-td">{obj.name}</td>
                    <td className="col-xs-3 table-updated-td">{(obj.resource_type) ? obj.resource_type.name : ''}</td>
                    <td className="col-xs-1 table-updated-td">{(obj.clinic) ? obj.clinic.clinic_name : ''}</td>
                  </tr>
                )
              })
            :
              <tr className={(!this.state.showLoader) ? 'table-updated-tr' : 'table-updated-tr no-display'}>
                <td className="col-xs-12 table-updated-td text-center" colSpan="7">{this.state.sorry_no_record_found}</td>
              </tr>
          }
          </tbody>

        </table>
      </div>
      <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
        <div className="loader-outer">
          <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
          <div id="modal-confirm-text" className="popup-subtitle" >{this.state.Please_Wait}</div>
        </div>
      </div>
    </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  if (state.AppointmentReducer.action === 'RESOURCE_SCHEDULE_LIST' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.resourceScheduleList = state.AppointmentReducer.data.data;
    }
  } else if (state.AppointmentReducer.action === "SERVICE_SORT_ORDER_UPDATE") {
    if (state.AppointmentReducer.data.status == 200) {
      toast.success(languageData.global[state.AppointmentReducer.data.message]);
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    }
  }
  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchResourceSchedule: fetchResourceSchedule
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (ResourceSchedule);
