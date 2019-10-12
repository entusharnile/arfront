import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../../Containers/Protected/Header.js';
import Footer from '../../Containers/Protected/Footer.js';
import { getUserLogs, exportCsv, exportEmptyData} from '../../Actions/Dashboard/dashboardActions.js';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../images/calender.svg';
import { format, addDays } from 'date-fns';
import { Link } from 'react-router-dom';
import moment from 'moment';
import config from '../../config';
import { showFormattedDate, autoScrolling } from '../../Utils/services.js';
const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}

class UserActivity extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0);
    let dateFormat = localStorage.getItem('dateFormat');
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const dateData = localStorage.getItem('UserLogSelectionRange');
    const objVal= localStorage.getItem('objName');
    const objVals = objVal ? JSON.parse(objVal) : ''
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate
    const endD = valR.endDate
    this.state = {
      defaultDateFormat: 'YYYY-MM-DD',
      dateFormat: dateFormat,
      dateRangePicker: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
      to_date         : format(new Date(), 'YYYY-MM-DD'),
      from_date       : format(new Date(), 'YYYY-MM-DD'),
      term            : '',
      object_name     : '',
      page            : 1,
      pagesize        : 20,
      startFresh      : true,
      showLoader      : false,
      showLoadingText : false,
      next_page_url   : '',
      loadMore        : true,
      objectNames     : [],
      userLogList     : [],
      dataFiltered    : false,
      showCalendar    : false,
      file_type1      : 'csv',
      file_type2      : 'xls',
      exportCsvData   : {},
      file            : '',
      clicked         : 0
    }

    localStorage.setItem('loadFresh', false);
    localStorage.setItem('showLoader', true);
    this.props.exportEmptyData({});
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop))
      if ( window.innerHeight + scrollTop === document.documentElement.offsetHeight && this.state.next_page_url !== null ) {
        this.loadMore();
      }
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    this.setState({
        [event.target.name]: value
    });

    if ( event.target.name === 'object_name' ) {
      localStorage.setItem("objName", JSON.stringify(value));
      this.handleSubmit(event, value)
    }
  }

  handleSubmit = (event, value) => {
    let from_date   = ''
    let to_date     = ''
    let object_name = undefined

    if (typeof event === 'object' ) {
      event.preventDefault();
      object_name = value
    } else {
      from_date = value.from_date
      to_date   = value.to_date
    }

    localStorage.setItem("sortOnly", true);
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    const dateData = localStorage.getItem('UserLogSelectionRange');
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate
    const endD = valR.endDate

    let formData = {'params':{
      to_date     : (to_date) ? to_date : this.convertDate(this.state.to_date,true),
      from_date   : (from_date) ? from_date : this.convertDate(this.state.from_date,true),
        term        : this.state.term,
        object_name : (object_name && object_name !== undefined) ? object_name : this.state.object_name ,
        page        : 1,
        pagesize    : this.state.pagesize,
      }
    }

    // if (object_name != '' && object_name != undefined && object_name != 'All'){
    //     formData.params.object_name = (object_name && object_name !== undefined ) ? object_name : this.state.object_name == 'All' ? '' : this.state.object_name ;
    // }

    this.setState({
      page          : 1,
      pagesize      : this.state.pagesize,
      loadMore      : true,
      startFresh    : true,
      next_page_url : '',
      showLoader    : true,
      objectNames   : [],
      userLogList   : [],
      dataFiltered  : true
    });
    this.showLoaderFunc()
    autoScrolling(true);
    this.props.getUserLogs(formData);
  }
  showLoaderFunc = ()  => {
    this.setState({showLoader: true});
    localStorage.setItem("showLoader", true);
  }

  componentDidMount() {
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    const dateData = localStorage.getItem('UserLogSelectionRange');
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate
    const endD = valR.endDate
    const objVal= localStorage.getItem('objName')
    const objVals = objVal ? JSON.parse(objVal) : '' ;
    let formData = {'params':{
        to_date     : this.state.to_date,
        from_date   : this.state.from_date,
        term        : this.state.term,
        object_name : objVals ? objVals : 'all',
        page        : this.state.page,
        pagesize    : this.state.pagesize
      }
    }

    document.addEventListener('click', this.handleClick, false);
    this.setState({
      dash_userlog_search_text: languageData.dashboard['dash_userlog_search_text'],
      dash_userlog_obj_menu_text: languageData.dashboard['dash_userlog_obj_menu_text'],
      dash_userlog_opt_menu_all_text: languageData.dashboard['dash_userlog_opt_menu_all_text'],
      dash_userlog_opt_menu_appointment_text: languageData.dashboard['dash_userlog_opt_menu_appointment_text'],
      dash_userlog_opt_menu_egiftcard_text: languageData.dashboard['dash_userlog_opt_menu_egiftcard_text'],
      dash_userlog_opt_menu_clinic_text: languageData.dashboard['dash_userlog_opt_menu_clinic_text'],
      dash_userlog_opt_menu_inventory_text: languageData.dashboard['dash_userlog_opt_menu_inventory_text'],
      dash_userlog_opt_menu_survey_text: languageData.dashboard['dash_userlog_opt_menu_survey_text'],
      dash_userlog_opt_menu_invoice_text: languageData.dashboard['dash_userlog_opt_menu_invoice_text'],
      dash_userlog_opt_menu_coupon_text: languageData.dashboard['dash_userlog_opt_menu_coupon_text'],
      dash_userlog_opt_menu_patient_text: languageData.dashboard['dash_userlog_opt_menu_patient_text'],
      dash_userlog_opt_menu_client_text: languageData.dashboard['dash_userlog_opt_menu_client_text'],
      dash_userlog_opt_menu_procedure_text: languageData.dashboard['dash_userlog_opt_menu_procedure_text'],
      dash_userlog_opt_menu_sale_text: languageData.dashboard['dash_userlog_opt_menu_sale_text'],
      dash_userlog_opt_menu_service_text: languageData.dashboard['dash_userlog_opt_menu_service_text'],
      dash_userlog_opt_menu_user_text: languageData.dashboard['dash_userlog_opt_menu_user_text'],
      dash_userlog_export_text: languageData.dashboard['dash_userlog_export_text'],
      dash_userlog_export_as_csv_text: languageData.dashboard['dash_userlog_export_as_csv_text'],
      dash_userlog_export_as_excel_text: languageData.dashboard['dash_userlog_export_as_excel_text'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      sorry_no_user_activities_found: languageData.dashboard['sorry_no_user_activities_found'],
      dashboard_patient: languageData.dashboard['dashboard_patient'],
      dashboard_client: languageData.dashboard['dashboard_client'],
      showLoader: true
    })
    autoScrolling(true);
    this.props.getUserLogs(formData);
  }

  loadMore = () => {
    if(!autoScrolling()){
      this.setState({'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true})
      const languageData = JSON.parse(localStorage.getItem('languageData'))
      const dateData = localStorage.getItem('UserLogSelectionRange');
      const valR = dateData ? JSON.parse(dateData) : '';
      const startD = valR.startDate
      const endD = valR.endDate
      const objVal= localStorage.getItem('objName');
      const objVals = objVal ? JSON.parse(objVal) : ''
      let formData = {'params':{
          from_date: this.convertDate(this.state.from_date,true),
          to_date: this.convertDate(this.state.to_date,true),
          term        : this.state.term,
          object_name : objVals ? objVals : 'all',
          page        : this.state.page,
          pagesize    : this.state.pagesize
        }
      }
      autoScrolling(true);
      this.props.getUserLogs(formData);
    }
  }

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
     if (props.xportCsvData !== undefined && state.xportCsvData != props.xportCsvData){
       var returnState = {};
      if(localStorage.getItem("showLoader") == "false") {
        returnState.xportCsvData= props.xportCsvData;
        returnState.showLoader= false;
        //window.location.href=props.xportCsvData.file;
        window.open(config.API_URL+"download-data/"+props.xportCsvData.file, "_blank");
        return returnState;
      }
    }
    if ( props.userLogList && props.userLogList.user_logs.next_page_url !== state.next_page_url ) {
      if ( state.next_page_url == null ) {
        autoScrolling(false);
        return {
          next_page_url : null,
          objectNames   : props.userLogList.objects
        }
      }

      if ( (state.userLogList === undefined || state.userLogList.length === 0) && state.startFresh == true ) {
        //if ( state.dataFiltered === false ) {
          let page          = 1;
          let next_page_url = '';
          if ( props.userLogList.user_logs.next_page_url !== null ) {
              page = state.page + 1
          } else {
              next_page_url = props.userLogList.user_logs.next_page_url
          }
          autoScrolling(false);
          return {
            page : page,
            userLogList     : props.userLogList.user_logs.data,
            startFresh      : false,
            showLoader      : false,
            next_page_url   : next_page_url,
            objectNames     : props.userLogList.objects,
            showLoadingText : false
          }
      } else if ( state.userLogList !== props.userLogList.user_logs.data && state.userLogList.length != 0 && props.userLogList.user_logs.data ) {
          autoScrolling(false);
          return {
            userLogList     : [...state.userLogList,...props.userLogList.user_logs.data],
            page            : state.page + 1,
            showLoader      : false,
            next_page_url   : props.userLogList.user_logs.next_page_url,
            objectNames     : props.userLogList.objects,
            showLoadingText : false
          }
      } else {
        autoScrolling(false);
        return {
          showLoader      : false,
          next_page_url   : ''
        }
      }
    }
    else return null;
  }

  renderColorClass = (object) => {
    switch (object) {
      case 'patient':
        return 'user-status status-color-a';
      case 'procedure':
        return 'user-status status-color-b';
      case 'user':
        return 'user-status status-color-c';
      case 'inventory':
        return 'user-status status-color-k';
      case 'appointment':
        return 'user-status status-color-l';
      case 'service':
        return 'user-status status-color-f';
      case 'clinic':
        return 'user-status status-color-g';
      case 'invoice':
        return 'user-status status-color-h';
      case 'sale':
        return 'user-status status-color-i';
      default:
        return 'user-status status-color-z';
    }
  }

  convertDate = (date,type) => {
    if(type !== undefined){
      return moment(date, this.state.dateFormat).format(this.state.defaultDateFormat);
    }else{
      return moment(date).format(this.state.defaultDateFormat);
    }
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

  handleRangeChange = (which, payload) => {
    let startDate = payload.selection.startDate
    let endDate   = payload.selection.endDate
    startDate     = format(startDate, this.state.dateFormat);
    endDate       = format(endDate, this.state.dateFormat);

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
      this.handleSubmit(which, {"from_date" : this.convertDate(payload.selection.startDate), "to_date" : this.convertDate(payload.selection.endDate)});
    }
	}

  handleClick = (e) =>  {
    if (this.node.contains(e.target) && this.state.showCalendar === true ) {
      return
    }
    this.toggleCalendar(e.target);
  }
  handleCsv = (value) => {
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    const dateData = localStorage.getItem('UserLogSelectionRange');
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate
    const endD = valR.endDate
    const objVal= localStorage.getItem('objName');
    const objVals = objVal ? JSON.parse(objVal) : ''
    let formData = { "params" : {
        to_date     : this.convertDate(this.state.to_date, true),
        from_date   : this.convertDate(this.state.from_date,true),
        term:this.state.term,
        object_name: objVals ? objVals : 'all',
        page:this.state.page,
        file_type: value
      }
    }
    this.showLoaderFunc()
    this.props.exportCsv(formData)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
    this.props.exportEmptyData({});
  }

  render() {
    let optData    = '';

    if ( this.state.objectNames !== undefined ) {
      optData = this.state.objectNames.map((val, idx) => {
         let str = (val == 'patient') ? 'dash_userlog_opt_menu_client_text' : `dash_userlog_opt_menu_` + val + `_text`;
         return <option key={idx} value={val}>{this.state[str]}</option>;
     })
    }

  function ShowChangesAnchor(props) {
      let to = ''
      if ( (props.action === 'update' && props.type === 'service') || ( (props.action === 'update' || props.action === 'edit') && props.type === 'appointment' && props.child_id !== 0 ) ) {
        to = '/dashboard/user-logs/view-changes/' + props.type + '/' + props.child_id  + '/' + props.object_id ;
        return <Link to={to} >View Changes</Link>
      }
      return null
    }

    const languageData = JSON.parse(localStorage.getItem('languageData'))
    const dateData = localStorage.getItem('UserLogSelectionRange');
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate
    const endD = valR.endDate
    let UserLogSelectionRange = {
      startDate: (startD) ? startD : new Date(),
      endDate: (endD) ? endD : new Date(),
      key: 'selection',
    }

    return (
      <div id="content">
      	<div className="container-fluid content setting-wrapper">
      		<div className="juvly-section full-width">
      			<div className="setting-search-outer">
              <form onSubmit={this.handleSubmit}>
        				<div className="search-bg new-search">
        					<i className="fas fa-search"></i>
        					<input className="setting-search-input chart_search" placeholder={this.state.dash_userlog_search_text} name="term" value={this.state.term} onChange={this.handleInputChange} autoComplete="false"/>
        				</div>
              </form>
      				<div className="search-bg new-calender pull-left" ref={node => {this.node = node}}>
              <img src={calenLogo} />
              {this.state.showCalendar && <DateRangePicker
                ranges={[this.state.dateRangePicker.selection]}
                onChange={this.handleRangeChange.bind(this, 'dateRangePicker')}
                className={'CalendarPreviewArea'}
                maxDate={new Date()}
                dragSelectionEnabled={false}
                /> }
                <input type="text" className="input-cal setting-search-input" name="calendar-input" value={(this.state.from_date) ? this.state.from_date + `-` + this.state.to_date : ""} autoComplete="off" onChange={this.handleInputChange} />
      				</div>

      				<div className="export pull-right">
      					<div className="dropdown pull-left">
      						<button className="btn btn-default dropdown-toggle" type="" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      							{this.state.dash_userlog_export_text}
      							<i className="fas fa-angle-down"></i>
      						</button>
      						<ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
      							<li><a href="javascript:void(0);" name="csv" onClick={this.handleCsv.bind(this, this.state.file_type1)}>{this.state.dash_userlog_export_as_csv_text}</a></li>
      							<li><a href="javascript:void(0);" name="xls" onClick={this.handleCsv.bind(this, this.state.file_type2)} >{this.state.dash_userlog_export_as_excel_text}</a></li>
      						</ul>
      					</div>
      				</div>

      				<div className="filter-type">
      					<span className="search-text">{this.state.dash_userlog_obj_menu_text}:</span>
      					<div className="header-select">
      						<select value={ (this.state.object_name) ? this.state.object_name : "" } onChange={this.handleInputChange} name="object_name">
                      <option value="all">All</option>
                      {optData}
      						</select>
      						<i className="fas fa-angle-down"></i>
      					</div>
      				</div>
      			</div>

      			<div className="activity-outer">
            {this.state.userLogList ?
               this.state.userLogList !== undefined && this.state.userLogList.map((obj, idx) => {
                return (
          				<div className="activity-row" key={idx}>
          					<div className={this.renderColorClass(obj.type)}>{obj.type== this.state.dashboard_patient ? (this.state.dashboard_client).toUpperCase() : obj.type.toUpperCase()}</div>
          					<div className="activity-detail">
                      {obj.description}
                      <ShowChangesAnchor action={obj.action} type={obj.type} child_id={obj.child_id} object_id={obj.object_id} />
                    </div>
          					<div className="activity-time">{obj.date}</div>
    			        </div> )
                })
                :
                <div className="activity-row text-center">
                  <div className="activity-detail p-r-5">{this.state.sorry_no_user_activities_found}</div>
                </div>
              }

              <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle" >Processing. Please wait...</div>
                </div>
              </div>
      			</div>
      		</div>
          <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display "}>{this.state.loading_please_wait_text}</div>
      	</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  localStorage.setItem("showLoader", false);
  if ( state.DashboardReducer.action === 'USER_LOGS_LIST' ) {
    if(state.DashboardReducer.data.status != 200){
      returnState.showLoader = false
    }
    else {
      returnState.userLogList= state.DashboardReducer.data.data
      }
    }
    if (state.DashboardReducer.action === 'EXPORT_CSV' ) {
      if(state.DashboardReducer.data.status != 200 ){
      returnState.showLoader = false
    }
      else {
      returnState.xportCsvData= state.DashboardReducer.data.data
    }
  }

  if (state.DashboardReducer.action === 'EMPTY_DATA' ) {
    if ( state.DashboardReducer.data.status != 200 ) {
      return {}
    } else {
      return {}
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getUserLogs: getUserLogs,
  exportCsv:exportCsv, exportEmptyData: exportEmptyData }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (UserActivity);
