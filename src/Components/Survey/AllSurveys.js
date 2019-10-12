import React, { Component } from 'react';
import Header from '../../Containers/Protected/Header.js';
import Footer from '../../Containers/Protected/Footer.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../images/calender.svg';
import { format, addDays } from 'date-fns';
import { fetchSurveys } from "../../Actions/Surveys/surveyActions.js";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import {Button} from 'react-dom';
import config from '../../config';
import axios from 'axios';
import {numberFormat, showFormattedDate} from '../../Utils/services.js';
import { exportEmptyData } from '../../Actions/Settings/settingsActions.js';
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';

class AllSurveys extends React.Component {
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
      surveysList:[],
      satisfactionList:{},
      clinicScore:[],
      providerScore:[],
      serviceScore:[],
      focusedInput: null,
      showLoader: false,
      globalLang: languageData.global,
      clicked:0
    }
  }
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    this.setState({
      surveys_insights: languageData.surveys["surveys_insights"],
      surveys_survey: languageData.surveys["surveys_survey"],
      survey_stats: languageData.surveys["survey_stats"],
      survey_sent: languageData.surveys["survey_sent"],
      survey_submitted: languageData.surveys["survey_submitted"],
      survey_high_satisfaction: languageData.surveys["survey_high_satisfaction"],
      survey_average_satisfaction: languageData.surveys["survey_average_satisfaction"],
      survey_score: languageData.surveys["survey_score"],
      survey_nps_provider: languageData.surveys["survey_nps_provider"],
      survey_nps_clinic: languageData.surveys["survey_nps_clinic"],
      survey_nps_no: languageData.surveys["survey_nps_no"],
      survey_nps_name: languageData.surveys["survey_nps_name"],
      survey_view_all_survey_button:languageData.surveys["survey_view_all_survey_button"],
      survey_nps_service:languageData.surveys["survey_nps_service"],
      survey_low_satisfaction:languageData.surveys["survey_low_satisfaction"],
      showLoader:true


    });

    document.addEventListener('click', this.handleClick, false);

    let formData = {'params':{
      to     : this.state.to_date,
      from   : this.state.from_date,

      }
    }


    this.props.fetchSurveys(formData)
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
        // Force the focusedInput to always be truthy so that dates are always selectable
        focusedInput,
      });
    }
  handleRangeChange = (which, payload) => {
    let startDate = payload.selection.startDate
    let endDate   = payload.selection.endDate
    startDate     = format(startDate, 'YYYY-MM-DD')
    endDate       = format(endDate, 'YYYY-MM-DD')

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
        to     : (to_date) ? to_date : this.state.to_date,
        from   : (from_date) ? from_date : this.state.from_date,
      }
    }

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
    this.props.fetchSurveys(formData)
  }

  componentWillUnmount() {
      /*window.onscroll = () => {
        return false;
      }*/
    document.removeEventListener('click', this.handleClick, false);
    this.props.exportEmptyData({});
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        return {showLoader : false};
     }
    if(nextProps.surveysList != undefined && nextProps.surveysList.data != prevState.surveysList && nextProps.surveysList.status == 200 ){
      if(localStorage.getItem('loadAgain') == 'false'){
        localStorage.setItem('loadAgain', false);
        return {
          surveysList : nextProps.surveysList.data,
          satisfactionList : nextProps.surveysList.data.satisfaction,
          clinicScore:nextProps.surveysList.data.clinic_score,
          providerScore:nextProps.surveysList.data.provider_score,
          serviceScore:nextProps.surveysList.data.service_score,

          showLoader: false
        }
      }

    }

    return null;
  }

  render() {
    let clinicScoreArray = [];
    if (this.state.clinicScore !== undefined ) {
      for(let key in this.state.clinicScore )
      {
        let tempArray = {}
        tempArray['key'] = key;
        tempArray['value'] = this.state.clinicScore[key];
        clinicScoreArray.push(tempArray)
      }
    }

    let providerScoreArray = [];

    if (this.state.providerScore !== undefined ) {
      for(let key in this.state.providerScore )
      {
        let tempArray = {}
        tempArray['key'] = key;
        tempArray['value'] = this.state.providerScore[key];
        providerScoreArray.push(tempArray)
      }
    }
    let serviceScoreArray = [];

    if (this.state.serviceScore !== undefined ) {
      for(let key in this.state.serviceScore )
      {
        let tempArray = {}
        tempArray['key'] = key;
        tempArray['value'] = this.state.serviceScore[key];
        serviceScoreArray.push(tempArray)
      }
    }

    return (
		    <div className="main protected">
          <div id="content">
            <form onSubmit={this.handleSubmit}>
              <div className="container-fluid content setting-wrapper">
               <ul className="sub-menu">
               <li><Link to="/surveys/dashboard" className="active">{this.state.surveys_insights}</Link></li>
                 <li><Link to="/surveys/manage">{this.state.surveys_survey}</Link></li>
               </ul>
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
<div>
      </div>
                 <Link to="/surveys/dashboard/view-all" className="new-blue-btn pull-right">{this.state.survey_view_all_survey_button}</Link>
               </div>
               <div className="bg-light-blue stats-outer">
                 <div className="juvly-title">{this.state.survey_stats}</div>
                 <div className="new-all-stats">
                   <div className="stats-section">
                     <div className="dash-box-title">{this.state.survey_sent}</div>
                     <div className="new-all-stats-content">{parseInt(this.state.surveysList.total_survey_count) > 0 ?
                       numberFormat(this.state.surveysList.total_survey_count) : 0}</div>
                   </div>
                   <div className="stats-section">
                     <div className="dash-box-title">{this.state.survey_submitted}</div>
                     <div className="new-all-stats-content">{this.state.surveysList.submitted_percentage}
                       <span className="stats-sub">({this.state.surveysList.submitted_survey_count})</span></div>
                   </div>
                   <div className="stats-section">
                     <div className="dash-box-title">{this.state.survey_high_satisfaction}</div>
                     <div className="new-all-stats-content">{this.state.satisfactionList.high_satisfaction}
                       <span className="stats-sub">({this.state.satisfactionList.high_satisfaction_count})</span></div>
                   </div>
                   <div className="stats-section">
                     <div className="dash-box-title">{this.state.survey_average_satisfaction} </div>
                     <div className="new-all-stats-content">{this.state.satisfactionList.average_satisfaction}
                       <span className="stats-sub">({this.state.satisfactionList.average_satisfaction_count})</span></div>
                   </div>
                   <div className="stats-section">
                     <div className="dash-box-title">{this.state.survey_low_satisfaction}</div>
                     <div className="new-all-stats-content">{this.state.satisfactionList.low_satisfaction}
                       <span className="stats-sub">({this.state.satisfactionList.low_satisfaction_count})</span></div>
                   </div>
                 </div>
               </div>
               <div class="setting-container no-padding-top">
               <div className="row">
                 <div className="col-lg-4 col-xs-12">
                   <div className="NPS-title">{this.state.survey_nps_service}</div>

                   <div className="table-responsive fixed-header-table">
                     <table className="table-updated setting-table survey-table no-hover table-min-width table-fixed">
                       <thead className="table-updated-thead">
                         <tr>
                           <th className="col-xs-2 table-updated-th">{this.state.survey_nps_no}</th>
                           <th className="table-updated-th col-xs-7">{this.state.survey_nps_name}</th>
                           <th className="col-xs-3 table-updated-th">{this.state.survey_score}</th>
                         </tr>
                       </thead>
                       <Scrollbars style={{ height:217}} className="custome-scroll">
                       <tbody>
                       {(this.state.serviceScore != undefined && this.state.serviceScore.length>0 ) &&
                      this.state.serviceScore.map((obj, idx) => {
                        return (
                          <tr key={idx} className="table-updated-tr">
                            <td className="col-xs-2 table-updated-td">{++idx}</td>
                            <td className="table-updated-td text-ellipsis col-xs-7">{obj.name}</td>
                            <td className="col-xs-3 table-updated-td">{obj.score}</td>
                          </tr>
                        )
                      }) }

                      {this.state.serviceScore != undefined && this.state.serviceScore.length == 0 &&
                       <tr className="table-updated-tr">
                           <td className="no-record no-float" colSpan={3}>{this.state.globalLang.sorry_no_record_found}</td>
                         </tr>
                     }
                       </tbody>
                       </Scrollbars>
                     </table>
                   </div>
                 </div>
                 <div className="col-lg-4 col-xs-12">
                   <div className="NPS-title">{this.state.survey_nps_provider}</div>
                   <div className="table-responsive fixed-header-table">
                     <table className="table-updated setting-table survey-table no-hover table-min-width table-fixed">
                       <thead className="table-updated-thead">
                         <tr>
                           <th className="col-xs-2 table-updated-th">{this.state.survey_nps_no}</th>
                           <th className="table-updated-th col-xs-7">{this.state.survey_nps_name}</th>
                           <th className="col-xs-3 table-updated-th">{this.state.survey_score}</th>
                         </tr>
                       </thead>
                       <Scrollbars style={{ height:217}} className="custome-scroll">
                       <tbody>
                       { this.state.providerScore != undefined && this.state.providerScore.length > 0 &&
                          this.state.providerScore.map((obj, idx) => {
                          return (
                            <tr key={idx} className="table-updated-tr">
                              <td className="col-xs-2 table-updated-td">{++idx}</td>
                              <td className="table-updated-td text-ellipsis col-xs-7">{obj.name}</td>
                              <td className="col-xs-3 table-updated-td">{obj.score}</td>
                            </tr>
                          )
                        })
                      }
                      { this.state.serviceScore != undefined && this.state.serviceScore.length == 0  &&
                        <tr className="table-updated-tr">
                           <td className="no-record no-float" colSpan={3}>{this.state.globalLang.sorry_no_record_found}</td>
                         </tr>
                      }

                       </tbody>
                       </Scrollbars>
                     </table>
                   </div>
                 </div>
                 <div className="col-lg-4 col-xs-12">
                   <div className="NPS-title">{this.state.survey_nps_clinic}</div>

                   <div className="table-responsive fixed-header-table">
                     <table className="table-updated setting-table survey-table no-hover table-min-width table-fixed">
                       <thead className="table-updated-thead">
                         <tr>
                           <th className="col-xs-2 table-updated-th">{this.state.survey_nps_no}</th>
                           <th className="table-updated-th col-xs-7">{this.state.survey_nps_name}</th>
                           <th className="col-xs-3 table-updated-th">{this.state.survey_score}</th>
                         </tr>
                       </thead>
                       <Scrollbars style={{ height:217}} className="custome-scroll">
                       <tbody>
                         {((this.state.clinicScore != undefined) && this.state.clinicScore.length > 0) &&
                        this.state.clinicScore.map((obj, idx) => {

                          return (
                            <tr key={idx} className="table-updated-tr">
                              <td className="col-xs-2 table-updated-td">{++idx}</td>
                              <td className="table-updated-td text-ellipsis nps-name col-xs-7">{obj.name}</td>
                              <td className="col-xs-3 table-updated-td">{obj.score}</td>
                            </tr>
                          )
                        })}
                        { this.state.clinicScore.length == 0  &&
                          <tr>
                             <td className="no-record no-float" colSpan={3}>{this.state.globalLang.sorry_no_record_found}</td>
                           </tr>
                       }
                       </tbody>
                      </Scrollbars>
                     </table>
                   </div>
                 </div>
                 <div className={ this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left" } >
                   <div className="loader-outer">
                     <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                       <div id="modal-confirm-text" className="popup-subtitle">
                         {this.state.globalLang.Please_Wait}
                       </div>
                     </div>
                   </div>
               </div>
               </div>
             </div>
           </div>
           </form>
         </div>
		</div>
    );
   }
}
function mapStateToProps(state){
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  localStorage.setItem('loadAgain', false);
  if (state.surveyReducer.action === "All_SURVEYS") {
    if(state.surveyReducer.data.status != 200){
      returnState.showLoader = false
    }
    else {
      returnState.surveysList= state.surveyReducer.data
    };

  }
  if (state.SettingReducer.action === 'EMPTY_DATA' ) {
    if(state.SettingReducer.data.status != 200) {
      toast.error(languageData.global[state.SettingReducer.data.message]);
      returnState.showLoader = false
    }
  }
  return returnState
}
function mapDispatchToProps(dispatch){
  return bindActionCreators({
    fetchSurveys:fetchSurveys,
    exportEmptyData:exportEmptyData,
},dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(AllSurveys);
