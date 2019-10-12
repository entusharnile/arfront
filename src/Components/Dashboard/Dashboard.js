import React, { Component } from 'react';
import Header from '../../Containers/Protected/Header.js';
import Footer from '../../Containers/Protected/Footer.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { Calendar } from 'react-date-range';
import {Button} from 'react-dom';
import DashboardTopProviders from './DashboardTopProviders.js'
import DashboardSalesGoals from './DashboardSalesGoals.js';
import DashboardReturningCustomers from './DashboardReturningCustomers.js';
import DasboardDirectorConsents from './DasboardDirectorConsents.js';
import DasboardProcedureAudits from './DasboardProcedureAudits.js';
import DasboardGrossSales from './DasboardGrossSales.js';
import DasboardYourProcedures from './DasboardYourProcedures.js';
import DasboardProcedureGoals from './DasboardProcedureGoals.js';
import DasboardYourSalesGoals from './DasboardYourSalesGoals.js';
import DasboardSurveyScore from './DasboardSurveyScore.js';
import DashboardTopTen from './DashboardTopTen.js';
import config from '../../config';
import axios from 'axios';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../images/calender.svg';
import { format, addDays } from 'date-fns';
import { fetchClinicsDashboard } from "../../Actions/Dashboard/dashboardActions.js";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Scrollbars } from 'react-custom-scrollbars';
import {showFormattedDate} from '../../Utils/services.js';
import * as moment from 'moment';
import * as _ from "lodash";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
class Dashboard extends React.Component {

  constructor(props) {
		super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    let dateFormat = localStorage.getItem('dateFormat');
    localStorage.setItem('loadAgain', false);

    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
		this.state = {
      counter: 1,
      update_val: 0,
      defaultDateFormat: 'YYYY-MM-DD',
      dateFormat: dateFormat,
      dateRangePicker: {
        selection: {
          startDate: moment().startOf('month'),//new Date(),
          endDate: moment().endOf('month'), //new Date(),
          key: 'selection',
        },
      },
      to_date         : moment().endOf('month').format(dateFormat), //'YYYY-MM-DD' format(firstDay, dateFormat)
      from_date       : moment().startOf('month').format(dateFormat), //'YYYY-MM-DD'
			email: '',
      showLoader    : false,
			emailError: '',
			showProcess: '',
      dataFiltered    : false,
      showCalendar    : false,
      dashClinicList:[{}],
      dashList:[{}],
      object_name     : '',
      clinic_id:null,
      sel_clini: '',
      is_juvly_account: '',
      total_clinic_goals: '',
      userRoleId:userData.user.user_role_id,
      isProvider: userData.user.is_provider,
      accId : userData.user.account_id,
      accUserId: userData.account.id,
      dash_filter_btn_text                : languageData.dashboard['dash_filter_btn_text'],
      dash_filter_custom_text             : languageData.dashboard['dash_filter_custom_text'],
      dash_filter_last_30_days_text       : languageData.dashboard['dash_filter_last_30_days_text'],
      dash_filter_last_month_text         : languageData.dashboard['dash_filter_last_month_text'],
      dash_filter_last_week_text          : languageData.dashboard['dash_filter_last_week_text'],
      dash_filter_last_year_text          : languageData.dashboard['dash_filter_last_year_text'],
      dash_filter_this_month_text         : languageData.dashboard['dash_filter_this_month_text'],
      dash_filter_this_week_text          : languageData.dashboard['dash_filter_this_week_text'],
      dash_filter_this_year_text          : languageData.dashboard['dash_filter_this_year_text'],
      dash_filter_yesterday_text          : languageData.dashboard['dash_filter_yesterday_text'],
      dash_greet_by_text                  : languageData.dashboard['dash_greet_by_text'],
      dash_in_office_sales_goals_text     : languageData.dashboard['dash_in_office_sales_goals_text'],
      dash_matics_text                    : languageData.dashboard['dash_matics_text'],
      dash_net_promoter_score_text        : languageData.dashboard['dash_net_promoter_score_text'],
      dash_pending_director_consents_text : languageData.dashboard['dash_pending_director_consents_text'],
      dash_procedure_audit_text           : languageData.dashboard['dash_procedure_audit_text'],
      dash_returning_customers_text       : languageData.dashboard['dash_returning_customers_text'],
      dash_total_text                     : languageData.dashboard['dash_total_text'],
      dash_view_and_sign_text             : languageData.dashboard['dash_view_and_sign_text'],
      dash_your_gross_sales_text          : languageData.dashboard['dash_your_gross_sales_text'],
      dash_your_procedure_goal_text       : languageData.dashboard['dash_your_procedure_goal_text'],
      dash_your_procedures_text           : languageData.dashboard['dash_your_procedures_text'],
      dash_your_sales_goal_text           : languageData.dashboard['dash_your_sales_goal_text'],
      dash_your_survey_scores_text        : languageData.dashboard['dash_your_survey_scores_text'],
      dash_your_top_10_items_by_sales     : languageData.dashboard['dash_your_top_10_items_by_sales'],
      dash_customers_text                 : languageData.dashboard['dash_customers_text'],
      dash_lbl_month_text                 : languageData.dashboard['dash_lbl_month_text'],
      dash_lbl_week_text                  : languageData.dashboard['dash_lbl_week_text'],
      dash_no_score_yet_text              : languageData.dashboard['dash_no_score_yet_text'],
      dash_tbl_units_text                 : languageData.dashboard['dash_tbl_units_text'],
      dash_tbl_sales_text                 : languageData.dashboard['dash_tbl_sales_text'],
      dash_tbl_name_text                  : languageData.dashboard['dash_tbl_name_text'],
      dashboard_all_clinics               : languageData.dashboard['dashboard_all_clinics'],
      langData                            : languageData.dashboard,
      Please_Wait                         : languageData.global['Please_Wait'],
      rangeSelected:'This Month',
      clicked:0,
      dash_pending_text                   : languageData.dashboard['dash_pending'],
		};
	}

  componentDidMount(){
    localStorage.removeItem('tempLoggedUserData');
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    let langData        = JSON.parse(localStorage.getItem('languageData'))
    let isDashKeyExists = (langData !== null && langData !== undefined && langData.dashboard !== null && langData.dashboard !== undefined) ? true: false

  	let userData         = JSON.parse(localStorage.getItem('userData'));

    let formData = {'params':{
        to_date     : this.convertDate(this.state.to_date,true),
        from_date   : this.convertDate(this.state.from_date,true)
//        clinic_id : 48
      }
    }
   // console.log('componentDidMount', formData);
    document.addEventListener('click', this.handleClick, false);

    this.setState({
      showLoader    : true,
      firstname: (userData !== null && userData !== undefined) ? userData.user['firstname'] : '',
      lastname: (userData !== null && userData !== undefined) ? userData.user['lastname'] : '',
      dash_filter_this_month_text: languageData.dashboard['dash_filter_this_month_text'],
    })
    this.props.fetchClinicsDashboard(formData);
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
    if ( event.target.name === 'sel_clini' ) {
      this.handleCheck(event)
    }
  }

  handleSubmit = (event, value,type) => {
    let from_date   = '';
    let to_date     = '';
    let object_name = 'undefined';
    let formData;
    if(this.state.dashList.clinics.length >0){
      let cl=this.state.dashList.clinics
    }

    let clinic_id  =  this.state.dashList.clinics
    if (typeof event === 'object' ) {
      event.preventDefault();
      object_name = value
    } else {
      if(this.state.update_val == 1){
        this.setState({rangeSelected: ( moment(value.from_date, this.state.defaultDateFormat).format(this.state.dateFormat) +'-'+  moment(value.to_date, this.state.defaultDateFormat).format(this.state.dateFormat)), update_val: 0})
      }

     // console.log('handleSubmit->>>', value);
      from_date = value.from_date
      to_date   = value.to_date
      clinic_id = value.clinic_id
    }

    if(type && type == 'onchange'){
       formData = {'params':{
        to_date : moment(this.state.to_date).format(this.state.defaultDateFormat),
        from_date :  moment(this.state.from_date).format(this.state.defaultDateFormat),
        clinic_id : '',
      }
    }
  }else{
     formData = {'params':{
      to_date     : (to_date) ? to_date : this.state.to_date,
      from_date   : (from_date) ? from_date : this.state.from_date,
      clinic_id : (clinic_id) ? clinic_id  : this.state.clinic_id,
    }
  }
  }

    localStorage.setItem('loadAgain', true);
    this.setState({
      showLoader    : true,
      dashClinicList : [],
      objectNames   : [],
      dataFiltered  : true,
    });
    this.props.fetchClinicsDashboard(formData);

   // this.handleSelected(formData.params.from_date,formData.params.to_date);
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

    let startDate = payload.selection.startDate;
    let endDate   = payload.selection.endDate;
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


    /*let element = document.getElementById("1");
    element.setAttribute('class','rdrStaticRange rdrStaticRangeSelected');*/

    if ( clicked && clicked % 2 === 0 ) {
     // console.log('handleRangeChange',payload.selection.startDate,payload.selection.endDate);
      this.handleSubmit(which, {"from_date" : this.convertDate(payload.selection.startDate), "to_date" : this.convertDate(payload.selection.endDate)});
    }
  }

  handleSelected = (from,to) => {
    let today, yesterday, result = 0;
    today = moment().format('YYYY-MM-DD');
    yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
    let newSplitFrom = from.split('-');
    let newSplitTo = to.split('-');

   if(from == today){
    result = 0;
   }
   else if(from == yesterday){
    result = 1;
   }
   if(from != today && from != yesterday){
    var a = moment([newSplitFrom[0],newSplitFrom[1],newSplitFrom[2]]);
    var b = moment([newSplitTo[0],newSplitTo[1],newSplitTo[2]]);
    let diff = b.diff(a, 'days');

    // If diff is <= 6 means only look for weekly slot
    if(diff <=6 ){
      this.handleThisweek(from,to);
    }
    // If diff > 6 look for month
    if(diff > 6){
      console.log('check ', diff)
    }
   }




  }
  handleThisweek = (from,to) => {

    // Check date lies in current  week or not
    const current_week_start = moment().startOf('week').format('YYYY-MM-DD');
    const current_week_end = moment().endOf('week').format('YYYY-MM-DD');
    var days = [];
    for (let i = 0; i <= 6; i++) {
        days.push(moment(current_week_start).add(i, 'days').format("YYYY-MM-DD"));
    };
    var found=0;
    _.forOwn(days, (value,key) => {
      if(value == from || value == to){
        found=2;
      }
    });

    this.setState({'active_class_calendar': ''});
    if(found == 2){
      this.setState({'active_class_calendar': found});
    }

    // Check date lies in last week or not
    if(found == 0){
      const last_week_start = moment(current_week_start).weekday(-7).format('YYYY-MM-DD');
      const last_week_end =moment(current_week_start).weekday(-1).format('YYYY-MM-DD');

      var days_last = [];
        for (let i = 0; i <= 6; i++) {
          days_last.push(moment(last_week_start).add(i, 'days').format("YYYY-MM-DD"));
        };
        var found=0;
        _.forOwn(days_last, (value,key) => {
          if(value == from || value == to){
            found=3;
          }
        });
        if(found == 3){
          this.setState({'active_class_calendar': found});
        }

    }

  }
  convertDate = (date,type) => {
    if(type !== undefined){
      return moment(date, this.state.dateFormat).format(this.state.defaultDateFormat);
    }else{
      return moment(date).format(this.state.defaultDateFormat);
    }

  }
  handleClick = (e) =>  {
   // this.setState({'active_class_calendar': ''});
   // console.log('Class is ', e.target.className,e.target.nodeName);
    if(e.target && e.target.className !== undefined &&  (e.target.className == '' || e.target.className === 'rdrDayNumber' ) && e.target.nodeName == "SPAN"){
      this.setState({update_val: 1})
    }
   else  if (e.target && e.target.className !== undefined && typeof e.target.className === 'string' && (e.target.className.indexOf('rdrStaticRangeLabel') > -1 )) {
      if ( e.target.childNodes ) {
       // console.log('e.target.childNodes',e.target.nodeName );
        this.setState({rangeSelected:e.target.innerHTML})
      }
    }
    if (this.node.contains(e.target) && this.state.showCalendar === true ) {
      return
    }
    this.toggleCalendar(e.target);

    var elms = document.getElementsByClassName('rdrStaticRange');
    for (var i = 0; i < elms.length; i++) {
     // elms[i].removeAttribute("class");
      elms[i].setAttribute("id", i);
      if(i == this.state.active_class_calendar && this.state.active_class_calendar > 1){
        elms[i].setAttribute("class", 'rdrStaticRange rdrStaticRangeSelected');
      }else{
        // elms[i].setAttribute("class", 'rdrStaticRange');
      }

    }

  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};

    if(nextProps.dashClinicList != undefined && nextProps.dashClinicList.data != prevState.dashClinicList && nextProps.dashClinicList.status == 200 ){
      if(localStorage.getItem('loadAgain') == 'false'){
        localStorage.setItem('loadAgain', false);
        return {
          dashClinicList : nextProps.dashClinicList.data.clinics,
          officeSalesGoalsList: nextProps.dashClinicList.data.office_sales_goals.clinic_goals_array,
          total_clinic_goals: nextProps.dashClinicList.data.office_sales_goals.total_clinic_goals,
          to_be_achieve_percentage: nextProps.dashClinicList.data.office_sales_goals.to_be_achieve_percentage,
          remaining_percentage: nextProps.dashClinicList.data.office_sales_goals.remaining_percentage,
          dashList : nextProps.dashClinicList.data,
          is_juvly_account: nextProps.dashClinicList.data.is_juvly_account,
          showLoader: false
        }
      }
    }
    return null;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleCheck = (event) =>{
    this.setState({showLoader : true, clinic_id : event.target.value, sel_clini: event.target.value})
    localStorage.setItem('loadAgain', true);
    let formData = {'params':{
        to_date     : this.convertDate(this.state.to_date, true),
        from_date   : this.convertDate(this.state.from_date,true),
        clinic_id : event.target.value
      }
    }
    //if(event.target.value > 0){
    this.props.fetchClinicsDashboard(formData)
  //}
  //else {
    //this.setState({showLoader : false})
//  }
  }

  render() {

    let colClassName = (((this.state.userRoleId == 1 || this.state.userRoleId == 3) && this.state.isProvider) || ( this.state.userRoleId == 4 && !this.state.isProvider )) ? " col-md-4 new-stats-outer" : ( this.state.userRoleId == 1 && !this.state.isProvider ) ? "col-md-6 new-stats-outer" : this.state.userRoleId == 2 ? "col-md-4 new-stats-outer" : (this.state.userRoleId == 4 && this.state.isProvider) ? 'col-md-3 new-stats-outer' :'col-md-6 new-stats-outer';
    return (
		<div className="main protected">
			<div id="content">
				<div className="container-fluid content dashboard-wrapper">
					<div className="title dashboard-title">
						<div className="col-sm-12 col-md-4">
							<label className="patient-count patient-name">{this.state.dash_greet_by_text} <b id="customers_count">{this.state.firstname} {this.state.lastname} </b></label>
					</div>
					<div className="dash-filter-outer" >
						<input type="hidden" id="daterangedata" name="date-range" />
						<input type="hidden" id="chosenlabel" name="chosenlabel" />
            <div className="search-bg new-calender pull-right" ref={node => {this.node = node}}>
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
          </div>

            <form className="navbar-form navbar-left search pull-right">
  						<div className="form-group all-clinic-form">
  							<div className="field-outer dash-clinic-outer">
  								<select className="sel-clini new-dash-sel" name="sel_clini" value ={this.state.sel_clini} onChange={this.handleInputChange}>
                  <option value="" > {this.state.dashboard_all_clinics} </option>
                  {
                    this.state.dashClinicList !== undefined && this.state.dashClinicList.map((obj,idx)=>{

                    return(
  									  <option key={idx} value={obj.id}>{obj.clinic_name}</option>
                    )})
                  }
  								</select>
  							</div>
  						</div>
            </form>
					<span className="date this-month">{this.state.dash_matics_text} - <label id="dateLabel">{this.state.rangeSelected}</label></span>
					</div>
					<div className="main-content" id="mainContent">
						<div className="row">
							<div className="col-lg-4 col-md-5 col-sm-6 col-xs-12 goals-outer">
              <div className="dash-box">

              <div className="dash-box-title">{this.state.langData.dash_in_office_sales_goals_text}:</div>

              <div className={(this.state.officeSalesGoalsList == undefined  || this.state.officeSalesGoalsList == '' || this.state.officeSalesGoalsList == null) ? "no-sales-goal" : 'no-display'}>
                <h6>{this.state.langData.dash_goals_not_defined_for_this_month}</h6>
                <a href="/sales/office-sales-goals" className="blue-btn add-goal">{this.state.langData.dash_add_goals}</a>
              </div>

                <Scrollbars style={{ height: 596 }} className= {(this.state.officeSalesGoalsList == undefined  || this.state.officeSalesGoalsList == '' || this.state.officeSalesGoalsList == null) ? "no-display" : "custome-scroll" }>
                    <div className= "dash-box-content office-goal" id="office-sales-goals-ccjuvly">
                      <div className="sales-goal-juvlycc mCustomScrollbar _mCS_1">
                      <div id="mCSB_1" className="mCustomScrollBox mCS-dark mCSB_vertical mCSB_inside" style={{maxHeight: 'none'}} tabIndex={0}><div id="mCSB_1_container" className="mCSB_container" style={{position: 'relative', top: '0px', left: '0px'}} dir="ltr">
                      {
                        this.state.officeSalesGoalsList !== undefined && this.state.officeSalesGoalsList.map((obj,idx)=>{
                        return(
                        <div className="custom-progress-outer" key={idx}>
                          <span className="progress-label-clinic">{obj.clinic_name_juvcc}</span>
                          <span className="pull-right total-prog-bar"><b>{this.state.langData.dash_sales_goal}:</b> {obj.clinic_goal_formatted}</span>
                          <div className="custom-progress">
                            <div href="#" className="custom-progress-growth" style={{width: obj.to_be_achieve_percentage > 100 ? '100%' : obj.to_be_achieve_percentage +'%' }}>
                            </div>
                            <div href="#" className="gray-progress-bar" style={{width: obj.remaining_percentage + '%'}}>
                            </div>
                          </div>
                          <div className={obj.to_be_achieve_percentage < 100 ? "sale-pending" : "sale-pending"}>
                            <div className="pull-left"><span><b>Sales:</b></span> {obj.net_sale_formatted}/{obj.to_be_achieve_percentage}%</div>
                            <div className={obj.to_be_achieve_percentage < 100 ? "pull-right" : "no-display"} ><span><b>{this.state.dash_pending_text}:</b></span> {obj.remaining_goal_formatted}/{obj.remaining_percentage}%</div>
                          </div>
                          <div className={obj.to_be_achieve_percentage < 100 ? "sales-need" : "no-display"}>
                            {this.state.langData.dash_sales_needed_per_business_day}: {obj.remaining_per_day_goal}</div>
                        </div>
                          )})
                        }
                      </div>
                      <div id="mCSB_1_scrollbar_vertical" className="mCSB_scrollTools mCSB_1_scrollbar mCS-dark mCSB_scrollTools_vertical" style={{display: 'block'}}>
                      <a href="#" className="mCSB_buttonUp"  style={{display: 'block'}} />
                      <div className="mCSB_draggerContainer"><div id="mCSB_1_dragger_vertical" className="mCSB_dragger" style={{position: 'absolute', minHeight: '30px', display: 'block', height: '224px', maxHeight: '544px', top: '0px'}} ><div className="mCSB_dragger_bar" style={{lineHeight: '30px'}} />
                      </div>
                      <div className="mCSB_draggerRail" /></div>
                      <a href="#" className="mCSB_buttonDown" style={{display: 'block'}} />
                      </div>
                      </div>
                      </div>
                      </div>
                    </Scrollbars>
                  </div>
						  </div>

						<div className="col-lg-8 col-md-7 col-sm-6 col-xs-12">
							<div className="row">
								<div className={(this.state.userRoleId == 4) ? colClassName : ''}>
                  {this.state.userRoleId == 4 ?
									<DasboardDirectorConsents data={this.state.dashList} langData={this.state.langData} /> :''}
								</div>
                {this.state.userRoleId == 2 || this.state.isProvider == true ?
								<div className= {colClassName}>
									<DasboardProcedureAudits data={this.state.dashList} langData={this.state.langData} />
								</div> : ''}
								<div className={colClassName}>
									<DasboardGrossSales data={this.state.dashList} langData={this.state.langData} />
								</div>
								<div className={colClassName}>
									<DasboardYourProcedures data={this.state.dashList} langData={this.state.langData} />
                </div>

							</div>
              <div className="row">
                <div className={this.state.userRoleId == 2 || this.state.isProvider == true ?"col-lg-6 col-md-12 new-stats-outer" : 'no-display'}>

                  <DasboardProcedureGoals data={this.state.dashList} langData={this.state.langData} />

                  <DasboardYourSalesGoals data={this.state.dashList} langData={this.state.langData} />

                  <DasboardSurveyScore data={this.state.dashList} langData={this.state.langData} />

                </div>
								<div className="col-lg-6 col-md-12 new-stats-outer">
									<DashboardTopTen data={this.state.dashList} langData={this.state.langData} />
								</div>
                {this.state.userRoleId == 2 || this.state.isProvider == true ? <div className={(this.state.showLoader) ? "col-lg-6 col-md-12 new-stats-outer no-display" : "col-lg-6 col-md-12 new-stats-outer" }><DashboardReturningCustomers data={this.state.dashList} langData={this.state.langData} /> </div>:<div className="col-lg-6 col-md-12 new-stats-outer">
									<DashboardTopProviders data={this.state.dashList} langData={this.state.langData} />
                  <DashboardReturningCustomers data={this.state.dashList} langData={this.state.langData} />
								</div>}
							</div>
							</div>
						</div>
					</div>
				</div>
        <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader' : 'new-loader text-left'}>
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

function mapStateToProps(state){
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  localStorage.setItem('loadAgain', false);
  if (state.DashboardReducer.action === "FETCH_DASH_CLINICS") {
    return {
      dashClinicList: state.DashboardReducer.data
    };

  } else {
    return {};
  }
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    fetchClinicsDashboard:fetchClinicsDashboard
  },dispatch)
}

export default connect(mapStateToProps,mapDispatchToProps)(Dashboard);
