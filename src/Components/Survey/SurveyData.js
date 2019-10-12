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
import { surveysListQuestions } from "../../Actions/Surveys/surveyActions.js";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
const headerInstance = axios.create();

class SurveyData extends React.Component {
  constructor(props) {
		super(props);
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
  viewAllsurveysListQuestions:[],
  viewSurveyData:[],
  id: this.props.match.params.id,
  }
}
componentDidMount(){
  let questionId=this.state.id
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  this.setState({
    survey_coolsculpting: languageData.dashboard["survey_coolsculpting"],
    surveys_insights: languageData.surveys["surveys_insights"],
    surveys_survey: languageData.surveys["surveys_survey"],
    survey_que: languageData.dashboard["survey_que"],
    survey_ans: languageData.dashboard["survey_ans"],
  })
  let formData ={'params':{

  }
}
  this.props.surveysListQuestions(questionId);
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
  startDate     = format(startDate, 'YYYY-MM-DD')
  endDate       = format(endDate, 'YYYY-MM-DD')

  this.setState({
    [which]: {
      ...this.state[which],
      ...payload,
    },
    showCalendar : false,
    from_date    : startDate,
    to_date      : endDate
  });
  this.handleSubmit(which, {"from_date" : startDate, "to_date" : endDate})
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

  let formData = {'params':{
      to_date     : (to_date) ? to_date : this.state.to_date,
      from_date   : (from_date) ? from_date : this.state.from_date,
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
  this.props.surveysListQuestions(formData)
}

handleClick = (e) =>  {
  if (this.node.contains(e.target) && this.state.showCalendar === true ) {
    return
  }
  this.toggleCalendar(e.target);
}

static getDerivedStateFromProps(nextProps, prevState) {
  let returnState = {};
  if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
      return {showLoader : false};
   }
  if(nextProps.viewAllsurveysListQuestions != undefined && nextProps.viewAllsurveysListQuestions.data != prevState.viewAllsurveysListQuestions && nextProps.viewAllsurveysListQuestions.status == 200 ){
    if(localStorage.getItem('loadAgain') == 'false'){
      localStorage.setItem('loadAgain', false);
      return {
        viewAllsurveysListQuestions : nextProps.viewAllsurveysListQuestions.data,
        viewSurveyData:nextProps.viewAllsurveysListQuestions.data.questions_data,
        showLoader: false
      }
    }
  }
  return null;
}

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
                <div className="juvly-container">
                  <div className="juvly-title">{this.state.survey_coolsculpting}
                    <Link to="/surveys/dashboard/view-all" className="pull-right close_survey"><img src="/images/close.png" /></Link>
                  </div>
                  {this.state.viewSurveyData !== undefined && this.state.viewSurveyData.map((obj,idx)=>{
                    return(
                      <div className="survey-qus-ans" key={'survey-qus-ans'+idx}>
                        <div className="survey-ques"><span className="que-label">{this.state.survey_que}</span> {obj.question}</div>
                        <div className="survey-ans"><span className="ans-label">{this.state.survey_ans}</span>{obj.score}</div>
                      </div>
                    )}
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
		  </div>
    );
   }
}

function mapStateToProps(state){
  const languageData =JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if(state.surveyReducer.action === "SURVEYS_LIST_QUESTIONS"){
    if(state.surveyReducer.data.status != 200){
      returnState.showLoader = false
    }
    else{
      returnState.viewAllsurveysListQuestions= state.surveyReducer.data
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    surveysListQuestions:surveysListQuestions
  },dispatch)
}
export default connect(mapStateToProps,mapDispatchToProps)(SurveyData);
