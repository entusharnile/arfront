import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import { getAppointmentReminder, deleteAppointmentReminder, exportEmptyData} from '../../../../Actions/Settings/settingsActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import { autoScrolling } from "../../../../Utils/services.js";

class AppointmentReminder extends Component {

  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    this.state = {
      reminder_before: '',
      reminder_type: '',
      appointmentReminder: [],
      userChanged: false,
      userId:'',
      page: 1,
      pagesize: 15,
      sortby: '',
      sortorder: 'asc',
      showLoadingText : false,
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      loadMore: true,
      startFresh: true,
      showLoader: false,
      showModal: false,
      noRecordDisplayEnable: 'no-record',
      noRecordDisplayDisable: 'no-record no-display',
      timeStamp: new Date()
    };
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop))
      if (
        window.innerHeight + scrollTop ===
          document.documentElement.offsetHeight &&
        this.state.next_page_url != null
      ) {
        this.loadMore();
      }
    };
  }

  showDeleteModal = (e) => {
    this.setState({showModal: true, reminderId: e.currentTarget.dataset.userid})
  }

  showEditModal = (e)=> {
    this.setState({ userId: e.currentTarget.dataset.userid})
  }

  dismissModal = () => {
    this.setState({showModal: false})
  }

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true });
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortby: this.state.sortby,
          sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : '',
  				term: this.state.term,
  				scopes : this.state.scopes
        }
      };
      autoScrolling(true)
      this.props.getAppointmentReminder(formData);
    }
  };

  componentDidMount(){
    this.props.exportEmptyData()
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      Appointment_Reminders: languageData.settings['Appointment_Reminders'],
      Appointment_Reminder_Actions: languageData.settings['Appointment_Reminder_Actions'],
      Appointment_Reminder_Send_Reminder_Before: languageData.settings['Appointment_Reminder_Send_Reminder_Before'],
      Appointment_Reminder_Edit: languageData.settings['Appointment_Reminder_Edit'],
      Appointment_Reminder_Delete: languageData.settings['Appointment_Reminder_Delete'],
      clinic_No_Record_Found: languageData.settings['clinic_No_Record_Found'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      Appointment_Reminder_Create_Reminder: languageData.settings['Appointment_Reminder_Create_Reminder'],
      Appointmnet_Reminder_delete_warning: languageData.settings['Appointmnet_Reminder_delete_warning'],
      Appointmnet_Reminder_Confirmation_Required:  languageData.settings['Appointmnet_Reminder_Confirmation_Required'],
      no_option:  languageData.settings['no_option'],
      yes_option:  languageData.settings['yes_option'],
  })
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortby: this.state.sortby,
        sortorder: "asc",
				term: this.state.term,
				scopes : this.state.scopes
      }
    };
    this.setState({'showLoader': true});
    autoScrolling(true)
    this.props.getAppointmentReminder(formData);
  }

  onSort = sortby => {
    let sortorder = this.state.sortorder === "asc" ? "desc" : "asc";
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortby: sortby,
        sortorder: sortorder,
				term: this.state.term,
				scopes : this.state.scopes
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url: "",
      appointmentReminder: []
    });
    localStorage.setItem('sortOnly', true);
    autoScrolling(true)
    this.props.getAppointmentReminder(formData);
  };


  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.appointmentReminder != undefined &&
      nextProps.appointmentReminder.next_page_url !== prevState.next_page_url
      && nextProps.timeStamp != prevState.timeStamp
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem('sortOnly', false)
        autoScrolling(false)
        return (returnState.next_page_url = null);
      }

      if (prevState.appointmentReminder.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem('sortOnly') == "false") {
					returnState.appointmentReminder = nextProps.appointmentReminder.data;
					if(nextProps.appointmentReminder.next_page_url != null){
						returnState.page = prevState.page + 1;
					} else {
						returnState.next_page_url = nextProps.appointmentReminder.next_page_url;
					}
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          returnState.timeStamp = nextProps.timeStamp
        } else {
          localStorage.setItem('sortOnly', false)
        }
      } else if (
        prevState.appointmentReminder != nextProps.appointmentReminder.data &&
        prevState.appointmentReminder.length != 0
      ) {
        returnState.appointmentReminder = [
          ...prevState.appointmentReminder,
          ...nextProps.appointmentReminder.data
        ];
        returnState.next_page_url = nextProps.appointmentReminder.next_page_url;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
        returnState.timeStamp = nextProps.timeStamp
			}
      autoScrolling(false)
			return returnState;
    }

    return null;
  }


  deleteReminder = () => {
    localStorage.setItem('isDelete', true);
    this.dismissModal();
    let reminders = this.state.appointmentReminder;
      if(reminders.length) {
        reminders.map((obj, idx) => {
          if(obj.id == this.state.reminderId){
            delete reminders[idx];
          }
        })
        this.setState({appointmentReminder : reminders});
    }
    this.props.deleteAppointmentReminder(this.state.reminderId);
    this.dismissModal();
  }

 /* componentWillUnmount = () => {
    window.onscroll = () => {
      return false;
    }
  }*/

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.startFresh) {
      return true;
    }

    if (this.state.loadMore) {
      return true;
    }

    if (this.state.showLoader) {
      return true;
    }
    return false;
	}

  render(){
    return(
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
            <div className="setting-setion">
              <div className="setting-search-outer">
                <Link to="/settings/appointment-reminder/create" className="new-blue-btn pull-right edit_setting">{this.state.Appointment_Reminder_Create_Reminder}</Link>
              </div>
              <div className="table-responsive">
                <table className="table-updated setting-table no-hover">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="col-xs-8 table-updated-th sorting">{this.state.Appointment_Reminders}</th>
                      <th className="col-xs-4 table-updated-th sorting text-center">{this.state.Appointment_Reminder_Actions}</th>
                    </tr>
                  </thead>
                  <tbody className="ajax_body">
                  {
                    this.state.appointmentReminder !== undefined && this.state.appointmentReminder.map((obj, idx) => {
                      return (
                    <tr className="table-updated-tr" key={idx}>
                      <td className="col-xs-8 table-updated-td ">{this.state.Appointment_Reminder_Send_Reminder_Before} : <b>{obj.reminder_before} {obj.reminder_type}</b></td>
                      <td className="col-xs-4 table-updated-td text-center">
                        <Link className="easy-link" data-userid= {obj.id} to={'/settings/appointment-reminder/'+obj.id+'/edit'}> {this.state.Appointment_Reminder_Edit}</Link>&nbsp;&nbsp;&nbsp;&nbsp;
                        <a className="easy-link"  data-userid= {obj.id} onClick = {this.showDeleteModal.bind(this)}> {this.state.Appointment_Reminder_Delete}</a></td>
                    </tr>
                    );
                  })}
                  </tbody>
                </table>
                {(this.state.showLoader === false) && <div className= {(this.state.appointmentReminder.length==0) ? this.state.noRecordDisplayEnable: this.state.noRecordDisplayDisable} >
                  {this.state.clinic_No_Record_Found}
                </div>}
              </div>
              <div className={(this.state.showModal ? 'overlay' : '')}></div>
                <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                        <h4 className="modal-title" id="popup_title">{this.state.Appointmnet_Reminder_Confirmation_Required}{this.state.showModal}</h4>
                      </div>
                      <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                        {this.state.Appointmnet_Reminder_delete_warning}
                      </div>
                      <div className="modal-footer" >
                        <div className="col-md-12 text-left" id="footer-btn">
                          <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.no_option}</button>
                          <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteReminder}>{this.state.yes_option}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
                </div>
              </div>
              <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.loading_please_wait_text}</div>
            </div>
          </div>
        </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "APPOINTMENT_REMINDER") {
    if (state.SettingReducer.data.status === 200) {
      return {
  			appointmentReminder: state.SettingReducer.data.data,
        timeStamp: new Date()
      };
    } else {
      toast.error(languageData.global[state.SalesReducer.data.message]);
    }
  }
  else if (state.SettingReducer.action === "DELETE_APPOINTMENT_REMINDER") {
    localStorage.setItem('isDelete', false);
    if (state.SettingReducer.data.status === 200) {
      toast.success(languageData.global[state.SettingReducer.data.message]);
      return {
        appointmentReminderDEL: true
      };
    }
    else {
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
}
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      getAppointmentReminder: getAppointmentReminder,
      deleteAppointmentReminder: deleteAppointmentReminder,
      exportEmptyData:exportEmptyData
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AppointmentReminder);
