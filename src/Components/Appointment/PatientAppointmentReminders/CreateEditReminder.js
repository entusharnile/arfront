import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import { createAppointmentReminder, updateAppointmentReminder, getEditAppointmentReminder, exportEmptyData } from '../../../Actions/Settings/settingsActions.js';
import { Link } from 'react-router-dom';

class CreateEditReminder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      remind_before: '1-months',
      reminder_type: '',
      userChanged : false,
      reminderBeforeEnable: 'col-sm-3 col-xs-12',
      reminderBeforeDisable: 'col-sm-3 col-xs-12 no-display',
      reminderHoursEnable: 'col-sm-4 col-xs-12',
      reminderHoursDisable: 'col-sm-4 col-xs-12 no-display',
      custom: 0,
      reminderId: '',
      custom_time: '',
      custom_type: '',
      showLoader: false,
      getEditReminder: [],
      timestamp: new Date()
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value= target.value;
    switch(target.type) {
        case 'checkbox': {
            value = target.checked;
            break;
        }

        case 'radio' :{
          value = target.value;
          break;
      }
    }
    this.setState({[event.target.name]: value , userChanged : true});
  }

  componentDidMount()  {
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      Edit_Appointment_Reminder: languageData.settings['Edit_Appointment_Reminder'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      Edit_Appointment_Reminder_SEND_REMINDER_BEFORE: languageData.settings['Edit_Appointment_Reminder_SEND_REMINDER_BEFORE'],
      AppointmentEmailSMS_Submitbtn: languageData.settings['AppointmentEmailSMS_Submitbtn'],
      editUsers_CancelBtn: languageData.settings['editUsers_CancelBtn'],
      Create_Appointment_Reminder: languageData.settings['Create_Appointment_Reminder'],
      Appointment_Reminder_Send_Reminder_Before: languageData.settings['Appointment_Reminder_Send_Reminder_Before'],
      Edit_Appointment_Hours: languageData.settings['Edit_Appointment_Hours'],
      Edit_Appointment_Reminder_Day:  languageData.settings['Edit_Appointment_Reminder_Day'],
      Edit_Appointment_Reminder_Week:  languageData.settings['Edit_Appointment_Reminder_Week'],
      Edit_Appointment_Reminder_Month:  languageData.settings['Edit_Appointment_Reminder_Month'],
      Edit_Appointment_Reminder_Custom_Time:  languageData.settings['Edit_Appointment_Reminder_Custom_Time'],
      Edit_Appointment_Reminder_Select:  languageData.settings['Edit_Appointment_Reminder_Select'],
      editUsers_CancelBtn:  languageData.settings['editUsers_CancelBtn'],
      Edit_Appointment_Two_Hours: languageData.settings['Edit_Appointment_Two_Hours'],
      Edit_Appointment_Four_Hours:  languageData.settings['Edit_Appointment_Four_Hours'],
      Edit_Appointment_Six_Hours: languageData.settings['Edit_Appointment_Six_Hours'],
      Edit_Appointment_Twelve_Hours: languageData.settings['Edit_Appointment_Twelve_Hours'],
      Edit_Appointment_One_Day: languageData.settings['Edit_Appointment_One_Day'],
      Edit_Appointment_Two_Day: languageData.settings['Edit_Appointment_Two_Day'],
      Edit_Appointment_Three_Day: languageData.settings['Edit_Appointment_Three_Day'],
      Edit_Appointment_Four_Day: languageData.settings['Edit_Appointment_Four_Day'],
      Edit_Appointment_Five_Day: languageData.settings['Edit_Appointment_Five_Day'],
      Edit_Appointment_Six_Day: languageData.settings['Edit_Appointment_Six_Day'],
      Edit_Appointment_One_Week: languageData.settings['Edit_Appointment_One_Week'],
      Edit_Appointment_Two_Weeks: languageData.settings['Edit_Appointment_Two_Weeks'],
      Edit_Appointment_Three_Weeks: languageData.settings['Edit_Appointment_Three_Weeks'],
      Edit_Appointment_One_Month: languageData.settings['Edit_Appointment_One_Month'],
      showLoader: false
  })
    if(this.props.reminderId){
      this.setState({'showLoader': true});
      this.props.getEditAppointmentReminder(this.props.reminderId );
    } else {
      this.props.exportEmptyData({})
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let formData = {}
    let remindVal = this.state.remind_before;

    if(remindVal !== 'custom') {
      let remindArr = remindVal.split('-');
      formData.reminder_before = remindArr[0];
      formData.reminder_type = remindArr[1];
      formData.is_custom = 0;
    } else {
      formData.reminder_before = this.state.custom_time;
      formData.reminder_type = this.state.custom_type;
      formData.is_custom = 1;
    }

    if(this.props.reminderId != undefined){
      this.props.updateAppointmentReminder(formData, this.props.reminderId );
    }
    else{
      this.props.createAppointmentReminder(formData);
    }
  }
  openReminderList = () => {
    this.props.openReminderList()
  }
  static getDerivedStateFromProps(props, state) {
    if (props.redirect !== undefined && props.redirect == true) {
      toast.success(props.message)
      props.openReminderList()
    }
    else  if (props.getEditReminder !== undefined && props.getEditReminder.data !== state.getEditReminder && props.timestamp != state.timestamp) {
      let reminderBefore = 'custom';
      if(props.getEditReminder.data.is_custom) {
        reminderBefore = 'custom';
      } else {
        reminderBefore = props.getEditReminder.data.reminder_before +'-'+props.getEditReminder.data.reminder_type;
      }

    return {
      getEditReminder: (state.userChanged) ? state.getEditReminder : props.getEditReminder.data,
      remind_before: (state.userChanged) ? state.reminder_before :  reminderBefore,
      reminder_type: (state.userChanged) ? state.reminder_type : props.getEditReminder.data.reminder_type,
      custom_time: (state.userChanged) ? state.custom_time : props.getEditReminder.data.reminder_before,
      custom_type: (state.userChanged) ? state.custom_type : props.getEditReminder.data.reminder_type,
      custom: (state.userChanged) ? state.custom : props.getEditReminder.data.isCustom,
      showLoader: false,
      timestamp: props.timestamp
    };
  }
  return null;
}

  render(){
    return(
      <div>
            <form id="edit-user-form" name="create-edit-reminder-form" className="nobottommargin" action="#" method="post" onSubmit={this.handleSubmit}>
                <div className="setting-title m-b-40">
                  {(this.props.reminderId)  ? (this.state.Edit_Appointment_Reminder) : (this.state.Create_Appointment_Reminder)}
                  	<a  className="pull-right cancelAction" onClick={this.openReminderList}><img src="/images/close.png" /></a>
                </div>
                <div className="row">
                  <div className="col-sm-5 col-xs-12">
                    <div className="newInputFileldOuter no-ques-margin">
                      <div className="newInputLabel">{this.state.Appointment_Reminder_Send_Reminder_Before}<span className="setting-require">*</span></div>
                        <select name="remind_before" className="newSelectField reminder-hrs" value={this.state.remind_before} onChange={this.handleInputChange}>
                          <option value="2-hours" >{this.state.Edit_Appointment_Two_Hours}</option>
                          <option value="4-hours" >{this.state.Edit_Appointment_Four_Hours}</option>
                          <option value="6-hours" >{this.state.Edit_Appointment_Six_Hours}</option>
                          <option value="12-hours">{this.state.Edit_Appointment_Twelve_Hours}</option>
                          <option value="1-days" >{this.state.Edit_Appointment_One_Day}</option>
                          <option value="2-days" >{this.state.Edit_Appointment_Two_Day}</option>
                          <option value="3-days" >{this.state.Edit_Appointment_Three_Day}</option>
                          <option value="4-days" >{this.state.Edit_Appointment_Four_Day}</option>
                          <option value="5-days" >{this.state.Edit_Appointment_Five_Day}</option>
                          <option value="6-days" >{this.state.Edit_Appointment_Six_Day}</option>
                          <option value="1-weeks" >{this.state.Edit_Appointment_One_Week}</option>
                          <option value="2-weeks" >{this.state.Edit_Appointment_Two_Weeks}</option>
                          <option value="3-weeks" >{this.state.Edit_Appointment_Three_Weeks}</option>
                          <option value="1-months" defaultChecked >{this.state.Edit_Appointment_One_Month}</option>
                          <option value="custom">{this.state.Edit_Appointment_Reminder_Custom_Time}</option>
                      </select>
                    </div>
                  </div>
                  <div className={(this.state.remind_before === 'custom') ? this.state.reminderBeforeEnable : this.state.reminderBeforeDisable}>
                    <div className="newInputFileldOuter no-ques-margin">
                      <div className="newInputLabel"> Custom Time <span className="setting-require" /></div>
                        <input name="custom_time" id="custom_time" maxLength={5} className="newInputField reminder-hrs" type="text" value={this.state.custom_time} autoComplete="off" onChange={this.handleInputChange} />
                    </div>
                  </div>
                  <div className={(this.state.remind_before === 'custom') ? this.state.reminderHoursEnable : this.state.reminderHoursDisable}>
                    <div className="newInputFileldOuter no-ques-margin">
                      <div className="newInputLabel"> Time Mode <span className="setting-require" /></div>
                        <select name="custom_type" id="custom_type" value={this.state.custom_type} className="newSelectField reminder-hrs" onChange={this.handleInputChange}>
                          <option value>{this.state.Edit_Appointment_Reminder_Select}</option>
                          <option value="hours">{this.state.Edit_Appointment_Hours}</option>
                          <option value="days">{this.state.Edit_Appointment_Reminder_Day}</option>
                          <option value="weeks">{this.state.Edit_Appointment_Reminder_Week}</option>
                          <option value="months">{this.state.Edit_Appointment_Reminder_Month}</option>
                        </select>
                      </div>
                  </div>
                </div>
              <div className="footer-static">
                <a className="new-blue-btn pull-right" onClick={this.handleSubmit} id="c_policy">Save</a>
              </div>
              </form>

            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                  <div className="loader-outer">
                    <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                    <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
                  </div>
                </div>
            <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.loading_please_wait_text}</div>
            </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  toast.dismiss();
    if (state.SettingReducer.action === "CREATE_APPOINTMENT_REMINDER") {
      if(state.SettingReducer.data.status == 201){
        return {redirect: true, message : languageData.global[state.SettingReducer.data.message]}
      } else {
        toast.error(languageData.global[state.SettingReducer.data.message]);
        return{}
      }
    }
    else if (state.SettingReducer.action === "UPDATE_APPOINTMENT_REMINDER") {
        if(state.SettingReducer.data.status == 200){
          return {redirect: true, message : languageData.global[state.SettingReducer.data.message]}
        } else {
          toast.error(languageData.global[state.SettingReducer.data.message]);
          return{}
        }
      }
      else if (state.SettingReducer.action === "GET_EDIT_APPOINTMENT_REMINDER") {
        return {
          getEditReminder: state.SettingReducer.data,
          timestamp: new Date()
        }
      }
      if(state.SettingReducer.action === 'EMPTY_DATA') {
        return {}
     }
     return  {}
  }


  function mapDispatchToProps(dispatch) {
    return bindActionCreators({createAppointmentReminder: createAppointmentReminder,
      updateAppointmentReminder: updateAppointmentReminder,
      getEditAppointmentReminder: getEditAppointmentReminder,
      exportEmptyData: exportEmptyData,
    }, dispatch)
  }

  export default connect(mapStateToProps, mapDispatchToProps)(CreateEditReminder);
