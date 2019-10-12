import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from "react-toastify";
import { fetchBookingHistory} from '../../../Actions/Appointment/appointmentAction.js';
import AppointmentHeader from '../AppointmentHeader.js'
import DateRange from '../Common/DateRange.js'
import Loader from '../../Common/Loader.js'
import moment from 'moment';
import { capitalizeFirstLetter, autoScrolling, showFormattedDate } from '../../../Utils/services.js';

const dateFormatMoment = 'YYYY-MM-DD';

class BookingHistory extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.state = {
      globalLang : languageData.global,
      appointmentLang : languageData.appointments,
      page:1,
      pagesize:25,
      next_page_url: '',
      startFresh: true,
      showLoadingText : false,
      loadMore: true,
      showLoader : false,
      bookingHistoryList:[],
      next_page_url:'',
      startDate: moment(new Date()).format(dateFormatMoment),
      endDate: moment(new Date()).format(dateFormatMoment),
      search_key:'',
      search_by:'all',
      booking_status:'all'
    }
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClick, false);
    let formData = {
      search_by: this.state.search_by,
      booking_status: this.state.booking_status,
      start:this.state.startDate,
      end:this.state.endDate
    }
    if(this.state.search_key != ''){
      formData.search_key = this.state.search_key;
    }
    this.setState({'showLoader': true})
    autoScrolling(true)
    this.props.fetchBookingHistory(1,this.state.pagesize,formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      returnState.showLoader = false;
      return returnState;
   }
    if (nextProps.bookingHistoryList != undefined &&
      nextProps.bookingHistoryList.next_page_url !== prevState.next_page_url) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        autoScrolling(false)
        return returnState;
      }
      if (prevState.bookingHistoryList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.bookingHistoryList = nextProps.bookingHistoryList.data;
          if (nextProps.bookingHistoryList.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.bookingHistoryList.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          localStorage.setItem('showLoader', false);
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.bookingHistoryList != nextProps.bookingHistoryList.data &&
        prevState.bookingHistoryList.length != 0
      ) {
        returnState.bookingHistoryList = [
          ...prevState.bookingHistoryList,
          ...nextProps.bookingHistoryList.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.bookingHistoryList.next_page_url;
        localStorage.setItem('showLoader', false);
        returnState.showLoader = false;
        returnState.showLoadingText = false;
      }
      autoScrolling(false)
      return returnState;
    }
    return null;
  }

  handleInputChange = (event) => {
    const name = event.target.name;
    this.setState({[event.target.name]: event.target.value})
  }

  handleChildDateRange = (childState) => {
    this.setState({startDate:childState.startDate,endDate:childState.endDate}, () => {
      if ( childState.canSubmit ) {
        this.handleSubmit();
      }
    });
  }

  handleSubmit = event => {
    var y = ''
    var name = ''
    if(event != undefined && typeof event == 'object'){
      event.preventDefault();
      y = event.target.value;
      name = event.target.name
    }
    localStorage.setItem("sortOnly", true);
    const searchKey = this.state.search_key;

    this.setState({
      search_by : (name === "search_by") ?  y : this.state.search_by,
      search_key : (name === "search_key") ?  y : this.state.search_key,
      booking_status : (name === "booking_status") ?  y : this.state.booking_status
    });

    let error = false;
    if(name === "search_by"){
      if(searchKey === null ||  searchKey === undefined || searchKey === ''){
        error = true
      }
    }

    if(error){
      return
    }

    this.setState({
      page: 1,
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      bookingHistoryList: [],
      showLoader:true,
      next_page_url:'',
    });
    let formData = {
      start:this.state.startDate,
      end:this.state.endDate,
      search_by : (name === "search_by") ?  y : this.state.search_by,
      search_key : (name === "search_key") ?  y : this.state.search_key,
      booking_status : (name === "booking_status") ?  y : this.state.booking_status
    }
    this.setState({'showLoader': true});
    autoScrolling(true)
    this.props.fetchBookingHistory(1,this.state.pagesize,formData);
  };

  loadMore = () => {
    if(!autoScrolling()){
      this.setState({'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true})
      let formData = {
        search_by: this.state.search_by,
        booking_status: this.state.booking_status,
        start:this.state.startDate,
        end:this.state.endDate
      }
      if(this.state.search_key != ''){
        formData.search_key = this.state.search_key;
      }
      autoScrolling(true)
      this.props.fetchBookingHistory(this.state.page,this.state.pagesize,formData);
    }
  }


  render() {

    return (<div id="content">
  <div className="container-fluid content setting-wrapper">
    <AppointmentHeader activeMenuTag={'booking-history'} />
    <div className="juvly-section full-width">
      <div className="setting-search-outer">
          <div className="search-bg new-search filter-by-search">
            <form onSubmit={this.handleSubmit}>
  					<i className="fas fa-search"></i>
            <input className="setting-search-input search-key"  name="search_key"  placeholder={this.state.globalLang.label_search} value={this.state.search_key} onChange={this.handleInputChange} autoComplete="off" />
          </form>
  					<div className="header-select">
              <form onChange={this.handleSubmit}>
  						<select name="search_by"  value={this.state.search_by} onChange={this.handleInputChange}>
                <option value="all">{this.state.appointmentLang.appointment_all}</option>
						    <option value="customer">{this.state.appointmentLang.appointment_customer}</option>
						    <option value="provider">{this.state.appointmentLang.appointment_provider}</option>
						    <option value="booked_by">{this.state.appointmentLang.appointment_booded_by}</option>
              </select>
            </form>
  						<i className="fas fa-angle-down"></i>
  					</div>
  				</div>

        <DateRange
          handleChildDateRange={this.handleChildDateRange}
          containerClass={"search-bg new-calender"}
          class={'CalendarPreviewArea'}
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          //maxDate={new Date()}
        />
        <div className="filter-type">
					<span className="search-text">Filter by:</span>
					<div className="header-select">
            <form onChange={this.handleSubmit}>
  						<select name="booking_status"  value={this.state.booking_status} onChange={this.handleInputChange}>
                <option value="all">{this.state.appointmentLang.appointment_all}</option>
  				      <option value="booked">{this.state.appointmentLang.appointment_booked}</option>
  				      <option value="checkedin">{this.state.appointmentLang.appointment_checked_in}</option>
  				      <option value="cancel">{this.state.appointmentLang.appointment_canceled}</option>
  				      <option value="reschedule">{this.state.appointmentLang.appointment_rescheduled}</option>
  				      <option value="marknoshow">{this.state.appointmentLang.appointment_no_show}</option>
  						</select>
            </form>
						<i className="fas fa-angle-down"></i>
					</div>
				</div>
      </div>
      <div className="table-responsive">
        <table className="table-updated juvly-table table-min-width no-hover">
          <thead className="table-updated-thead">
            <tr>
							<th className="col-xs-2 table-updated-th">{this.state.appointmentLang.appointment_customer}</th>
							<th className="col-xs-1 table-updated-th">{this.state.appointmentLang.appointment_service}</th>
							<th className="col-xs-2 table-updated-th">{this.state.appointmentLang.appointment_clinic}</th>
							<th className="col-xs-2 table-updated-th">{this.state.appointmentLang.appointment_provider}</th>
							<th className="col-xs-1 table-updated-th no-padding-right">{this.state.appointmentLang.appointment_date_time_camelcase}</th>
							<th className="col-xs-1 table-updated-th">{this.state.appointmentLang.appointment_booded_by}</th>
							<th className="col-xs-1 table-updated-th">{this.state.globalLang.label_action}</th>
							<th className="col-xs-1 table-updated-th">{this.state.appointmentLang.appointment_done_by}</th>
							<th className="col-xs-1 table-updated-th">{this.state.appointmentLang.appointment_done_on}</th>
						</tr>
          </thead>
          <tbody>
            {this.state.bookingHistoryList.length > 0 ?
                this.state.bookingHistoryList.map((obj, idx) => {
                  let status = '';
                  switch (obj.status) {
                    case "checkedin":
                      status = "Checked In";
                      break;
                    case "marknoshow":
                      status = "No Show";
                      break;
                    case "booked":
                      status = "Booked";
                      break;
                    case "cancel":
                      status = "Canceled";
                      break;
                    default:
                      status = "Rescheduled";
                  }

                  return (
                    <tr key={'fragment_'+idx} className="table-updated-tr">
                      <td className="table-updated-td">{(obj.patient != null) ? capitalizeFirstLetter(obj.patient) : null}</td>
        							<td className="table-updated-td">{(obj.service != null) ? capitalizeFirstLetter(obj.service) : null}</td>
        							<td className="table-updated-td">{(obj.clinic != null) ? capitalizeFirstLetter(obj.clinic) : null}</td>
        							<td className="table-updated-td">{(obj.provider != null) ? capitalizeFirstLetter(obj.provider) : null}</td>
        							<td className="table-updated-td">{showFormattedDate(obj.appointment_datetime, true)}</td>

        							<td className="table-updated-td">{(obj.booked_by != null) ? capitalizeFirstLetter(obj.booked_by) : null}</td>
        							<td className="table-updated-td">{(obj.status != null) ? capitalizeFirstLetter(status) : null}</td>
        							<td className="table-updated-td">{obj.done_by}</td>
        							<td className="table-updated-td">{showFormattedDate(obj.created, true)}</td>
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
              <Loader showLoader={this.state.showLoader} />
            </div>
          <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display"}>{this.state.globalLang.loading_please_wait_text}</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  if (state.AppointmentReducer.action === 'BOOKING_HISTORY_LIST' ) {
    if(state.AppointmentReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.AppointmentReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.bookingHistoryList = state.AppointmentReducer.data.data;
    }
  }
  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchBookingHistory: fetchBookingHistory
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (BookingHistory);
