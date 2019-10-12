import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import { capitalizeFirstLetter } from '../../Utils/services.js';
import picClose from '../../images/close.png';
import defVImage from '../../images/no-image-vertical.png';
import {viewFilledSurveys} from '../../Actions/Clients/clientsAction.js';


class ViewFilledSurvey extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType           : (props.match.params.actionType) ? props.match.params.actionType : 'clients',
      action                : (props.match.params.type) ? props.match.params.type : 'profile',
      showLoader            : false,
      globalLang            : languageData.global,
      clientID              : this.props.match.params.clientID,
      procedureID           : this.props.match.params.procedureID,
      appointmentID         : this.props.match.params.appointmentID
    }
  }

  componentDidMount() {
    toast.dismiss();

    if ( this.state.appointmentID && this.state.clientID && this.state.procedureID ) {
      this.setState({showLoader: true});
      this.props.viewFilledSurveys(this.state.appointmentID, this.state.clientID, this.state.procedureID)
    }
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.surveyData !== undefined && props.surveyData.status === 200 && props.surveyData.data !== state.surveyData ) {
      return {
        surveyData  : props.surveyData.data,
        showLoader  : false
      }
    } else if ( props.surveyData !== undefined && props.surveyData.status !== 200 && props.surveyData.data !== state.surveyData ) {
      return {
        surveyData  : props.surveyData.data,
        showLoader  : false
      }
    }

    return null
  }


  render() {
    let returnTo = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.backURLType
    } else {

    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
        <div className="juvly-section full-width">
            <div className="juvly-container">
              <div className="juvly-title">{(this.state.surveyData && this.state.surveyData.procedure_name) && capitalizeFirstLetter(this.state.surveyData.procedure_name)}<Link className="pull-right close_survey" to={returnTo}><img src={picClose} /></Link></div>

              {
                (this.state.surveyData && this.state.surveyData.survey_data && this.state.surveyData.survey_data.length > 0) && this.state.surveyData.survey_data.map((obj, idx) => {
                  return (
                    <div key={`sur_` + idx} className="each-survey">
                      <div className="pre-qualification-survey">{(obj.survey_title) ? capitalizeFirstLetter(obj.survey_title) : ''}</div>

                      {
                        (obj && obj.survey_question_data && obj.survey_question_data.length > 0) && obj.survey_question_data.map((qobj, qidx) => {

                            let comment = '';

                            if ( qobj.survey_comment ) {
                              comment = '(Comment : ' + qobj.survey_comment + ')'
                            }

                            return (
                              <div key={`ques` + qidx} className="survey-qus-ans">
                                <div className="survey-ques"><span className="que-label"><b>Ques:</b></span>{(qobj && qobj.question) ? qobj.question : ''}</div>

                                {
                                  (qobj.question_type === 'Multiple Choice' || qobj.question_type === 'Single Choice') ?

                                  ((qobj.multi_choice_answers && qobj.multi_choice_answers.length > 0) ?
                                  <div className="survey-ans"><span className="ans-label"><b>Ans:</b></span>{qobj.multi_choice_answers.join(', ')}</div>

                                  : <span className="survy-ans">____</span>)

                                  : (qobj.question_type === 'Opinion Scale' || qobj.question_type === 'scale') ?

                                  ((qobj.score) ?
                                  <div className="survey-ans"><span className="ans-label"><b>Ans:</b></span>{qobj.score} <br/> {comment}</div>

                                  : <div className="survey-ans"><span className="ans-label"><b>Ans:</b></span>____<br/> {comment}</div>)

                                  : (qobj.answer) ? <div className="survey-ans"><span className="ans-label"><b>Ans:</b></span>{qobj.answer}</div> : <span className="survy-ans">____</span>
                                }

                              </div>
                            )
                        })
                      }
                    </div>
                  )
                })
              }

            </div>
        </div>
        </div>
          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader clientProfileLoader' : 'new-loader text-left'}>
            <div className="loader-outer">
              <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
              <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
            </div>
          </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  const languageData  = JSON.parse(localStorage.getItem('languageData'))
  let returnState     = {}

  if ( state.ClientsReducer.action === 'VIEW_FILLED_SURVEYS' ) {
    if ( state.ClientsReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.ClientsReducer.data.message]);
      returnState.surveyData = state.ClientsReducer.data;
    } else {
      returnState.surveyData = state.ClientsReducer.data;
    }
  }

  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({viewFilledSurveys: viewFilledSurveys}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (ViewFilledSurvey);
