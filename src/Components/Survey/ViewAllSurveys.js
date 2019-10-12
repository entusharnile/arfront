import React, { Component } from 'react';
import Header from '../../Containers/Protected/Header.js';
import Footer from '../../Containers/Protected/Footer.js';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import { Calendar } from 'react-date-range';
import {Button} from 'react-dom';
import config from '../../config';
import axios from 'axios';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import calenLogo from '../../images/calender.svg';
import { format, addDays } from 'date-fns';
import { surveysList } from "../../Actions/Surveys/surveyActions.js";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { showFormattedDate} from '../../Utils/services.js';

const headerInstance = axios.create();

class ViewAllSurveys extends React.Component {
  constructor(props) {
		super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const userData = JSON.parse(localStorage.getItem('userData'));
    this.state={
    dateRangePicker: {
      selection: {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
      },
    },
    to_date         : format(new Date(), 'YYYY-MM-DD'),
    from_date       : format(new Date(), 'YYYY-MM-DD'),
    viewAllSurveysList:[],
    viewSurveyData:[],
    ProviderClass:"new-dropdown-menu Providers no-display",
    ClinicsClass:"new-dropdown-menu Clinics no-display",
    ServicesClass:"new-dropdown-menu Services no-display",
    NPSClass:"new-dropdown-menu NPS no-display",
    selectedSureyIdList :{
      provider:[],
      services:[],
      clinics:[],
      nps:[1,2,3],
    },
    isSurveyListApi: false,
    isSurveyListUpdated:false,
    totalSureyIdList :{
      provider:0,
      services:0,
      clinics:0,
      nps:3,
    },
    eventSureveyTab : {
      provider:'unselect',
      services:'unselect',
      clinics:'unselect',
      nps:'unselect',
    },
    page:1,
    pagesize:15,
    next_page_url: '',
    startFresh: true,
    showLoadingText : false,
    showLoader : false,
    showCalendar:false,
    globalLang:languageData.global,
    surveyLang: languageData.global,
    clicked:0,
    timeStamp: new Date()
  }
  localStorage.setItem('loadFresh', false);
  localStorage.setItem('sortOnly', false);
}
componentDidMount(){
  document.addEventListener('click', this.handleClick, false);
  document.addEventListener('click', this.handleClickSurvey, false);
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  this.setState({
    surveys_survey: languageData.surveys['surveys_survey'],
    surveys_insights: languageData.surveys['surveys_insights'],
    survey_selected_clinics: languageData.surveys['survey_selected_clinics'],
    survey_selected_nps_score: languageData.surveys['survey_selected_nps_score'],
    survey_selected_providers: languageData.surveys['survey_selected_providers'],
    survey_selected_services: languageData.surveys['survey_selected_services'],
    survey_export: languageData.surveys['survey_export'],
    survey_export_csv: languageData.surveys['survey_export_csv'],
    survey_export_excel: languageData.surveys['survey_export_excel'],
    survey_select_all: languageData.surveys['survey_select_all'],
    survey_unselect_all: languageData.surveys['survey_unselect_all'],
    survey_all_surveys: languageData.surveys['survey_all_surveys'],
    survey_client: languageData.surveys['survey_client'],
    survey_appointment: languageData.surveys['survey_appointment'],
    survey_provider: languageData.surveys['survey_provider'],
    survey_service: languageData.surveys['survey_service'],
    survey_survey_title: languageData.surveys['survey_survey_title'],
    survey_submitted_on: languageData.surveys['survey_submitted_on'],
    survey_satisfaction_score: languageData.surveys['survey_satisfaction_score'],
    survey_sorry_no_record_found: languageData.surveys['survey_sorry_no_record_found'],
    survey_processing_please_wait: languageData.surveys['survey_processing_please_wait'],
  })

  let formData ={
      to_date     : this.state.to_date,
      from_date   : this.state.from_date,
  }
  this.setState({
    showLoader    : true,
    viewSurveyData : []
  })
    this.props.surveysList(formData);
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
  startDate     = format(startDate,'YYYY-MM-DD')
  endDate       = format(endDate,'YYYY-MM-DD')

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
    this.handleSubmit(which, {"from_date" : startDate, "to_date" : endDate})
  }
}
handleSubmit = (event, value) => {
  let from_date   = ''
  let to_date     = ''

  if (typeof event === 'object' ) {
    event.preventDefault();
    //object_name = value
  } else {
    from_date = value.from_date
    to_date   = value.to_date
  }

  let formData = {
      to_date     : (to_date) ? to_date : this.state.to_date,
      from_date   : (from_date) ? from_date : this.state.from_date,
      user_id : (this.state.selectedSureyIdList.provider) ? this.state.selectedSureyIdList.provider.join() : 0,
      clinic_id : (this.state.selectedSureyIdList.clinics) ? this.state.selectedSureyIdList.clinics.join() : 0,
      service_id : (this.state.selectedSureyIdList.services) ? this.state.selectedSureyIdList.services.join() : 0,
      nps_id : (this.state.selectedSureyIdList.nps) ? this.state.selectedSureyIdList.nps.join() : 0,
    }

  this.setState({
    showLoader    : true,
    objectNames   : [],
    userLogList   : [],
    dataFiltered  : true,
    to_date     : (to_date) ? to_date : this.state.to_date,
    from_date   : (from_date) ? from_date : this.state.from_date,
    viewSurveyData : []
  });
this.props.surveysList(formData)
}

handleClick = (e) =>  {
  if (this.node.contains(e.target) && this.state.showCalendar === true ) {
    return
  }
  this.toggleCalendar(e.target);
}

handleClickSurvey = (event) =>  {
  let tabClass = {
    ProviderClass:"new-dropdown-menu Providers no-display",
    ClinicsClass:"new-dropdown-menu Clinics no-display",
    ServicesClass:"new-dropdown-menu Services no-display",
    NPSClass:"new-dropdown-menu NPS no-display"
  }
  if ((this.muli_sel_btn_provider.contains(event.target)) || this.muli_sel_btn_clinics.contains(event.target) || this.muli_sel_btn_services.contains(event.target) || this.muli_sel_btn_nps.contains(event.target)){
    let tabName = '';
    if(this.muli_sel_btn_provider.contains(event.target)){
      tabClass.ProviderClass = "new-dropdown-menu Providers";
      tabName = 'provider';
    } else if(this.muli_sel_btn_clinics.contains(event.target)){
      tabClass.ClinicsClass = "new-dropdown-menu muli_sel_btn_clinics";
      tabName = 'clinics';
    } else if(this.muli_sel_btn_services.contains(event.target)){
      tabClass.ServicesClass = "new-dropdown-menu Services";
      tabName = 'services';
    } else if(this.muli_sel_btn_nps.contains(event.target)){
      tabClass.NPSClass = "new-dropdown-menu NPS";
      tabName = 'nps';
    }
    if(event.target.type == 'checkbox'){
      //this.selectedSureyIdList(event.target.name,tabName,event.target.checked);
    }
  } else {
    if(this.state.isSurveyListApi){
        let formData = {
          to_date     : this.state.to_date,
          from_date   : this.state.from_date,
          user_id : (this.state.selectedSureyIdList.provider) ? this.state.selectedSureyIdList.provider.join() : 0,
          clinic_id : (this.state.selectedSureyIdList.clinics) ? this.state.selectedSureyIdList.clinics.join() : 0,
          service_id : (this.state.selectedSureyIdList.services) ? this.state.selectedSureyIdList.services.join() : 0,
          nps_id : (this.state.selectedSureyIdList.nps) ? this.state.selectedSureyIdList.nps.join() : 0,
        }
      this.setState({
        isSurveyListApi:false,
        showLoader:true,
        viewSurveyData : []
      });
      this.props.surveysList(formData);
    }

  }
  this.setState(tabClass);
}

selectedSureyIdList = (event) => {
  let checkboxName = event.target.name.split('-');
  let id = parseInt(checkboxName[1]);
  let tabName = checkboxName[0];
  let checkboxValue = event.target.value;
  let existOrNot = this.state.selectedSureyIdList[tabName].indexOf(id);
  let selectedSureyIdList = this.state.selectedSureyIdList;
  if(checkboxValue == 'true'){
    selectedSureyIdList[tabName].splice(existOrNot, 1);
  } else{
    selectedSureyIdList[tabName].push(id);
  }
  this.setState({
    selectedSureyIdList :selectedSureyIdList,
    isSurveyListApi: true,
    isSurveyListUpdated : true
  });
}

toggleSurveyFilter = (event) => {
  let tabName = event.target.name;
  let selectedSureyIdList = this.state.selectedSureyIdList;
  let eventSureveyTab = this.state.eventSureveyTab;
  if(eventSureveyTab[tabName] == 'unselect'){
    selectedSureyIdList[tabName] = [];
    eventSureveyTab[tabName] = 'select'
  } else if(eventSureveyTab[tabName] == 'select'){
    selectedSureyIdList[tabName] = this.state.totalSureyIdList[tabName];
    eventSureveyTab[tabName] = 'unselect'
  }
  this.setState({
    selectedSureyIdList:selectedSureyIdList,
    eventSureveyTab:eventSureveyTab,
    isSurveyListApi: true,
    isSurveyListUpdated : true
  })
}



componentWillUnmount() {
   /* window.onscroll = () => {
      return false;
    }*/
  document.removeEventListener('click', this.handleClick, false);
  document.removeEventListener('click', this.handleClickSurvey, false);
}

static getDerivedStateFromProps(nextProps, prevState) {
  let returnState = {};
  if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      return {showLoader : false};
   }
  if(nextProps.viewAllSurveysList != undefined && nextProps.viewAllSurveysList.data != prevState.viewAllSurveysList && nextProps.viewAllSurveysList.status == 200 &&  nextProps.timeStamp != prevState.timeStamp ){

          returnState.viewAllSurveysList = nextProps.viewAllSurveysList.data;
          returnState.viewSurveyData = nextProps.viewAllSurveysList.data.data;
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          returnState.selectedSureyIdList = {
            provider: (prevState.isSurveyListUpdated) ? prevState.selectedSureyIdList.provider : nextProps.viewAllSurveysList.data.user_ids,
            services: (prevState.isSurveyListUpdated) ? prevState.selectedSureyIdList.services : nextProps.viewAllSurveysList.data.service_ids ,
            clinics: (prevState.isSurveyListUpdated) ? prevState.selectedSureyIdList.clinics : nextProps.viewAllSurveysList.data.clinic_ids,
            nps: (prevState.isSurveyListUpdated) ? prevState.selectedSureyIdList.nps : [1,2,3],
          };
          returnState.totalSureyIdList  = {
            provider: nextProps.viewAllSurveysList.data.user_ids,
            services:nextProps.viewAllSurveysList.data.service_ids,
            clinics:nextProps.viewAllSurveysList.data.clinic_ids,
            nps: [1,2,3],
          };
          returnState.timeStamp = nextProps.timeStamp;

    return returnState;
  }
  return null;
}


/*componentWillUnmount = () => {
 window.onscroll = () => {
   return false;
 }
}
*/
surveyEdit = id => {
  return <div>{this.props.history.push(`/surveys/view-all/${id}/survey-data`)}</div>;
};

  render() {
    return (
		<div className="main protected">
    <form onSubmit={this.handleSubmit}>
    <div id="content">
           <div className="container-fluid content setting-wrapper">
             <ul className="sub-menu">
              <li><Link to="/surveys/dashboard">{this.state.surveys_insights}</Link></li>
               <li><Link to="/surveys/manage" className="active">{this.state.surveys_survey}</Link></li>
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
                 <input readOnly={true} type="text" autoComplete="off" className="input-cal setting-search-input" name="calendar-input" value={(this.state.from_date) ? showFormattedDate(this.state.from_date, false) + `-` + showFormattedDate(this.state.to_date, false) : ""} onChange={this.handleInputChange} autoComplete="off" />

                </div>
                <div className="multi-sel-btn"  ref={muli_sel_btn_provider => {this.muli_sel_btn_provider = muli_sel_btn_provider}}>{this.state.survey_selected_providers} ({(this.state.selectedSureyIdList.provider) ? this.state.selectedSureyIdList.provider.length : 0})
                  <ul className={this.state.ProviderClass}>
                    <li id="select_btn_li">
                      <a href="javascript:void(0);" className="line-btn text-center" name='provider' onClick={this.toggleSurveyFilter}>{(this.state.eventSureveyTab.provider == 'unselect') ? this.state.survey_unselect_all : this.state.survey_select_all }</a>
                    </li>
                    {this.state.viewAllSurveysList['users']
                      &&
                      this.state.viewAllSurveysList.users.map((obj, idx) => {
                        return(
                          <li key={'provider-'+obj.id}>
                            <label>
                              <input type="checkbox" checked={(this.state.selectedSureyIdList.provider.indexOf(obj.id) > -1) ? 'checked' : false} value={(this.state.selectedSureyIdList.provider.indexOf(obj.id) > -1) ? true : false} name={'provider-'+obj.id} onChange={this.selectedSureyIdList} /> {obj.firstname+ " "+ obj.lastname}
                            </label>
                          </li>
                            )
                        })
                      }
                  </ul>
                </div>
                <div className="multi-sel-btn" ref={muli_sel_btn_clinics => {this.muli_sel_btn_clinics = muli_sel_btn_clinics}}>{this.state.survey_selected_clinics} ({(this.state.selectedSureyIdList.clinics) ? this.state.selectedSureyIdList.clinics.length : 0})
                <ul className={this.state.ClinicsClass}>
                  <li id="select_btn_li">
                    <a href="javascript:void(0);" className="line-btn text-center" name='clinics' onClick={this.toggleSurveyFilter}>{(this.state.eventSureveyTab.clinics == 'unselect') ? this.state.survey_unselect_all : this.state.survey_select_all }</a>
                  </li>
                  {this.state.viewAllSurveysList['clinic_list']
                    &&
                    this.state.viewAllSurveysList.clinic_list.map((obj, idx) => {
                          return(
                            <li key={'clinics-'+obj.name.id}>
                              <label>
                                <input type="checkbox" checked={(this.state.selectedSureyIdList.clinics.indexOf(obj.name.id) > -1) ? 'checked' : false} value={(this.state.selectedSureyIdList.clinics.indexOf(obj.name.id) > -1) ? true : false} name={'clinics-'+obj.name.id} onChange={this.selectedSureyIdList} /> {obj.name.clinic_name}
                              </label>
                            </li>
                              )
                          })
                  }
                </ul>
                </div>
                <div className="multi-sel-btn" ref={muli_sel_btn_services => {this.muli_sel_btn_services = muli_sel_btn_services}}>{this.state.survey_selected_services} ({(this.state.selectedSureyIdList.services) ? this.state.selectedSureyIdList.services.length : 0})
                <ul className={this.state.ServicesClass}>
                  <li id="select_btn_li">
                    <a href="javascript:void(0);" className="line-btn text-center" name='services' onClick={this.toggleSurveyFilter}>{(this.state.eventSureveyTab.services == 'unselect') ? this.state.survey_unselect_all : this.state.survey_select_all }</a>
                  </li>
                  {this.state.viewAllSurveysList['service_list']
                    &&
                    this.state.viewAllSurveysList.service_list.map((obj, idx) => {
                          return(
                            <li key={'services-'+obj.name.id}>
                              <label>
                                <input type="checkbox" checked={(this.state.selectedSureyIdList.services.indexOf(obj.name.id) > -1) ? 'checked' : false} value={(this.state.selectedSureyIdList.services.indexOf(obj.name.id) > -1) ? true : false} name={'services-'+obj.name.id} onChange={this.selectedSureyIdList} /> {obj.name.name}
                              </label>
                            </li>
                              )
                          })
                    }
                </ul>
                </div>
                <div className="multi-sel-btn" ref={muli_sel_btn_nps => {this.muli_sel_btn_nps = muli_sel_btn_nps}}>{this.state.survey_selected_nps_score} ({(this.state.selectedSureyIdList.nps) ? this.state.selectedSureyIdList.nps.length : 0})
                <ul className={this.state.NPSClass}>
                  <li id="select_btn_li">
                    <a href="javascript:void(0);" className="line-btn text-center" name='nps' onClick={this.toggleSurveyFilter}>{(this.state.eventSureveyTab.nps == 'unselect') ? this.state.survey_unselect_all : this.state.survey_select_all }</a>
                  </li>
                  <li key="np-1">
                    <label>
                      <input type="checkbox" checked={(this.state.selectedSureyIdList.nps.indexOf(1) > -1) ? 'checked' : false} value={(this.state.selectedSureyIdList.nps[1]) ? true : false} name={'nps-1'}  onChange={this.selectedSureyIdList}/> {this.state.surveyLang.survy_0_3_nps_score}
                    </label>
                  </li>
                  <li key="np-2">
                    <label>
                      <input type="checkbox" checked={(this.state.selectedSureyIdList.nps.indexOf(2) > -1) ? 'checked' : false} value={(this.state.selectedSureyIdList.nps[2]) ? true : false} name={'nps-2'}  onChange={this.selectedSureyIdList}/> {this.state.surveyLang.survy_4_6_nps_score}
                    </label>
                  </li>
                  <li key="np-3">
                    <label>
                      <input type="checkbox" checked={(this.state.selectedSureyIdList.nps.indexOf(3) > -1) ? 'checked' : false} value={(this.state.selectedSureyIdList.nps[3]) ? true : false} name={'nps-3'}  onChange={this.selectedSureyIdList}/> {this.state.surveyLang.survy_7_10_nps_score}
                    </label>
                  </li>
                </ul>
                </div>
                 <div className="export pull-right">
                   <div className="dropdown pull-left">
                     <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                       {this.state.survey_export}
                       <i className="fas fa-angle-down"></i>
                     </button>
                     <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                       <li><a href="javascript:void(0);" >{this.state.survey_export_csv}</a></li>
                       <li><a href="javascript:void(0);" >{this.state.survey_export_excel}</a></li>
                     </ul>
                   </div>
                 </div>
               </div>
               <div className="small-popup-title border-top">
                 <div className="juvly-title m-b-0">{this.state.survey_all_surveys}
                  <Link to="/surveys/dashboard" className="pull-right"><img src="/images/close.png" /></Link>
                 </div>
               </div>
               <div className="table-responsive">
                 <table className="table-updated setting-table min-w-1000">
                   <thead className="table-updated-thead">
                     <tr>
                       <th className="col-xs-2 table-updated-th">{this.state.survey_client}</th>
                       <th className="col-xs-2 table-updated-th min-w-160">{this.state.survey_appointment}</th>
                       <th className="col-xs-2 table-updated-th">{this.state.survey_provider}</th>
                       <th className="col-xs-2 table-updated-th">{this.state.survey_service}</th>
                       <th className="col-xs-2 table-updated-th">{this.state.survey_survey_title}</th>
                       <th className="col-xs-2 table-updated-th min-w-160">{this.state.survey_submitted_on}</th>
                       <th className="col-xs-2 table-updated-th text-right min-w-120">{this.state.survey_satisfaction_score}</th>
                     </tr>
                   </thead>
                   <tbody>
                   {(this.state.viewSurveyData !== undefined && this.state.viewSurveyData.length > 0 ) ? this.state.viewSurveyData.map ((obj,idx)=>{
                     return(

                     <tr key={'tr-survey-'+idx}
                     className="table-updated-tr"
                     id={"liConsltDivId_"+idx}
                     data-order_by={obj.order_by}
                     onClick={this.surveyEdit.bind(this, obj.patient_survey_id)}
                        >
                       <td className="col-xs-2 table-updated-td">{obj.client}</td>
                       <td className="col-xs-2 table-updated-td min-w-160">{obj.appointment}</td>
                       <td className="col-xs-2 table-updated-td">{obj.provider}</td>
                       <td className="col-xs-2 table-updated-td nps-name text-ellipsis">{obj.service_name}</td>
                       <td className="col-xs-2 table-updated-td">{obj.surveys}</td>
                       <td className="col-xs-2 table-updated-td min-w-160">{obj.submitted}</td>
                       <td className="col-xs-2 table-updated-td text-right min-w-120">{obj.survey_score_sum}</td>
                     </tr>

                   )
                 }): ((this.state.showLoader === false) && <tr className="table-updated-tr">
                      <td className="no-record no-float" colSpan={7}>{this.state.survey_sorry_no_record_found}</td>
                    </tr>)
                  }

                     </tbody>
                   </table>
                 </div>
                 <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
                   <div className="loader-outer">
                     <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                     <div id="modal-confirm-text" className="popup-subtitle" >{this.state.survey_processing_please_wait}</div>
                   </div>
                 </div>
               </div>
             </div>
            </div>
          </form>
          <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
		    </div>
      );
   }
}

function mapStateToProps(state){
  const languageData =JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if(state.surveyReducer.action === "SURVEYS_LIST"){
    if(state.surveyReducer.data.status != 200){
      returnState.showLoader = false
    }
    else {
      returnState.viewAllSurveysList= state.surveyReducer.data
      returnState.timeStamp = new Date();
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    surveysList:surveysList
  },dispatch)
}

export default connect(mapStateToProps,mapDispatchToProps)(ViewAllSurveys);
