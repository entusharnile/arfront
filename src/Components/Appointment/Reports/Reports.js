import React, { Component } from 'react';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../../images/calender.svg';
import { format, addDays } from 'date-fns';
import { fetchAppointmentReports, exportEmptyData } from "../../../Actions/Appointment/appointmentAction.js";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import moment from 'moment';
import AppointmentHeader from '../AppointmentHeader.js'
import { Scrollbars } from 'react-custom-scrollbars';
import {showFormattedDate} from '../../../Utils/services.js';

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}

class AppointmentReports extends React.Component {
  constructor(props) {
		super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    this.state={
      dateRangePicker: {
        selection: {
          startDate: firstDay,
          endDate: lastDay,
          key: 'selection',
        },
      },
      to_date         : moment().endOf('month').format('YYYY-MM-DD'),
      from_date       : moment().startOf('month').format('YYYY-MM-DD'),
      showCalendar    : false,
      object_name:'',
      AppointmentReportList:[],
      focusedInput: null,
      showLoader: false,
      appointmentLang: languageData.appointments,
      globalLang: languageData.global,
      clicked: 0
    }
  }

  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    document.addEventListener('click', this.handleClick, false);
    let formData = {'params':{
      to_date     : apiDateFormat(this.state.to_date),
      from_date   : apiDateFormat(this.state.from_date),
      }
    }
    this.setState({'showLoader': true})
    document.addEventListener('click', this.handleClick, false);
    this.props.fetchAppointmentReports(formData)
  }

  toggleCalendar = (elem) => {
    if ( elem.name !== 'calendar-input' && this.state.showCalendar === false ) {
      return
    }

    let showCalendar = false
    if (this.state.showCalendar === false && elem.name !== undefined && elem.name === 'calendar-input' ) {
      showCalendar = true
    } else {
      showCalendar = false
    }
    this.setState({showCalendar : showCalendar})
  }

  _handleFocusChange = (focusedInput) => {
      this.setState({
        focusedInput,
      });
    }

    handleRangeChange = (which, payload) => {
      let startDate = payload.selection.startDate
      let endDate   = payload.selection.endDate
      startDate     = apiDateFormat(startDate)
      endDate       = apiDateFormat(endDate)

      let clicked   = this.state.clicked + 1;

      let localPref = localStorage.getItem('focusedRange');
      let canBypass = (localPref && localPref === 'oneClick') ? true : false;

      if (canBypass) {
        clicked = 2;
      }

      let showCalendar = true;

      if ( clicked % 2 === 0 ) {
        showCalendar = false;
      }

      this.setState({
        [which]: {
          ...this.state[which],
          ...payload,
        },
        showCalendar : showCalendar,
        from_date    : startDate,
        to_date      : endDate,
        clicked      : clicked
      });

      if ( clicked && clicked % 2 === 0 ) {
        this.handleSubmit(which, {"from" : startDate, "to" : endDate})
      }
    }


  handleClick = (e) =>  {
    if (this.node.contains(e.target) && this.state.showCalendar === true ) {
      return
    }
    this.toggleCalendar(e.target);
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

  handleSubmit = (event, value) => {
    let from_date   = ''
    let to_date     = ''

    if (typeof event === 'object' ) {
      event.preventDefault();
      //object_name = value
    } else {
      from_date = value.from
      to_date   = value.to
    }

    let formData = {'params':{
      from_date: (from_date) ? apiDateFormat(from_date) : apiDateFormat(this.state.from_date) ,
      to_date: (to_date) ? apiDateFormat(to_date) : apiDateFormat(this.state.to_date),
      }
    }

    this.setState({
      showLoader    : true,
    });
    this.setState({'showLoader': true})
    this.props.fetchAppointmentReports(formData)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
    this.props.exportEmptyData({});
  }

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
    if (props.AppointmentReportList !== undefined && props.AppointmentReportList.status === 200 && state.AppointmentReportList != props.AppointmentReportList.data) {
      return {
        AppointmentReportList: props.AppointmentReportList.data,
        showLoader : false,
        };
      }
      else
        return null;
  }

  render() {

    return (
		    <div className="main protected">
          <div id="content">
            <div className="container-fluid content setting-wrapper">
            <AppointmentHeader activeMenuTag={'reports'} />
              <div className="juvly-section full-width">
                  <div className="setting-search-outer">
                 
                    <div className="search-bg new-calender pull-left" ref={node => {this.node = node}}>
                     <img src={calenLogo} />
                  
                     {this.state.showCalendar && <DateRangePicker
                       ranges={[this.state.dateRangePicker.selection]}
                       onChange={this.handleRangeChange.bind(this, 'dateRangePicker')}
                       className={'CalendarPreviewArea'}
                       maxDate={new Date()}
                       dragSelectionEnabled={false}
                       /> }
                      
                       <input type="text" className="input-cal setting-search-input" name="calendar-input" value={(this.state.from_date) ? showFormattedDate(this.state.from_date, false) + `-` + showFormattedDate(this.state.to_date, false) : ""} onChange={this.handleInputChange} autoComplete="off" />
                      </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table-updated juvly-table table-min-width no-hover">
                      <thead className="table-updated-thead">
                        <tr>
                          <th className="col-xs-2 table-updated-th">{this.state.appointmentLang.appointment_service}</th>
                          <th className="col-xs-1 table-updated-th">{this.state.appointmentLang.appointment_category}</th>
                          <th className="col-xs-2 table-updated-th">{this.state.appointmentLang.appointment_no_of_times_booked}</th>
                        </tr>
                      </thead>
                      <tbody>
                      {this.state.AppointmentReportList.length > 0 ?
                          this.state.AppointmentReportList.map((obj, idx) => {
                            return (
                            <tr className="table-updated-tr" key={idx}>
                              <td className="table-updated-td">{obj.service_name}</td>
                              <td className="table-updated-td">{obj.category_name}</td>
                              <td className="table-updated-td">{obj.service_count}</td>
                            </tr>
                          )
                        })
                      :
                        <tr className="table-updated-tr">
                          <td className="col-xs-12 table-updated-td text-center" colSpan="9">{this.state.globalLang.sorry_no_record_found}</td>
                        </tr>
                        }
                      </tbody>
                    </table>
                  </div>
              </div>
            </div>
            <div className={ this.state.showLoader ? "new-loader text-left displayBlock full-fixed-loader" : "new-loader text-left full-fixed-loader" } >
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle">
                    {this.state.globalLang.loading_please_wait_text}
                  </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

function mapStateToProps(state){
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  localStorage.setItem('loadAgain', false);
  if (state.AppointmentReducer.action === "FETCH_REPORTS") {
    if(state.AppointmentReducer.data.status != 200){
      returnState.showLoader = false
    }
    else {
      returnState.AppointmentReportList= state.AppointmentReducer.data
    };

  }
  return returnState
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    fetchAppointmentReports:fetchAppointmentReports,
    exportEmptyData:exportEmptyData,
},dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(AppointmentReports);
