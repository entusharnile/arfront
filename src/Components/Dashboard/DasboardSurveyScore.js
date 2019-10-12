import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import {numberFormat} from '../../Utils/services.js';


class DasboardSurveyScore extends React.Component {
  constructor(props) {
    super (props);
  }
  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'));


  }

  render() {
    const surveyScore = (this.props.data && this.props.data.survey_scores > 0) ? numberFormat(this.props.data.survey_scores, 'decimal', 2) : 0.00;
    return (
      <div className="dash-box">
        <div className="dash-box-title">{this.props.langData.dash_your_survey_scores_text}</div>
          <div className="dash-box-content">
            <div className="survey-scrore">
              <h2>{numberFormat(surveyScore, 'decimal', 2)}</h2>
              <p id="promoter-score-label" className={(this.props.data.survey_scores == 0) ? "" : "no-display"}>{this.props.langData.dash_no_score_yet_text}</p>
            </div>
            <div className="score-map">
              <div className="score-map-fill" id="net-promoter-score" style={{width:this.props.data.survey_scores}}>
							<div className="map-overly"></div>
						</div>
          </div>
        </div>
      </div>
    );
  }
}

export default DasboardSurveyScore;
