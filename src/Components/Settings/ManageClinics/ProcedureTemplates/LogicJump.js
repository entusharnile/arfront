import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
//import { fetchProcedureQuestionnaire, updateProcedureQuestionnaire, getQuestionnaireById } from '../../../Actions/Settings/settingsActions.js';
import axios from 'axios';

const defaultItem = {
  id : '',
  displayOrder : 1,
  boxType : 'Textbox',
  name : '',
  placeholder : 'Type question here...',
  required : 0,
  description : 0,
  descriptionText : '',
  why_choose : 0,
  logicJumpsAns : '',
  logicJumpsQue : '',
  logicJumpsElse : '',
  options : '',
  currentlyActive : true
}

class LogicJump extends Component {
    constructor(props) {
        super(props);

        this.state = {}
    }

    componentDidMount = () => {

    }

    addLogicJump = (event) => {
      this.props.onChange();
    }
    deleteLogicJump = (event) => {
      let lid = event.target.dataset.logicindex;
      this.props.deleteLogicJump(lid);
    }

    handleInputChange = event => {
      const target = event.target;
      const value = target.type === "checkbox" ? target.checked : target.value;
      let name = event.target.name;
      this.setState({
        [event.target.name]: value
      });
      this.props.handleChildChange(name, value);
    }

    render () {
     return (
      <React.Fragment>
          <div className="if-else-outer">
              {this.props.questions.length > 0 && this.props.questions.map((logic, logicIndex) => {
                return (
                  <div  key={"logic-"+this.props.qid+"-"+logicIndex}>
                      <div  className="if-else-section right-field-outer logicJumpInnerBox">
                          <a onClick={this.deleteLogicJump} data-logicindex={logicIndex} className="icon-Close close-jump" />
                          <div className="table logic-row">
                              <div className="table-cell jump-label">If Selected</div>
                              <div className="table-cell">
                                <select className={(this.props["answersError"][this.props.qid][logicIndex]) ? "jump-select-box logicAnswer field-error" : "jump-select-box logicAnswer"} onChange={this.handleInputChange} name={"questions-"+this.props.qid+'-'+ logicIndex} value={this.props.questions[logicIndex]}>
                                    <option value="">Select</option>
                                      {this.props.type == 'yesno' &&
                                        <React.Fragment>
                                          <option value="Yes">Yes</option>
                                          <option value="No">No</option>
                                        </React.Fragment>
                                      }

                                      {this.props.type == 'scale' &&
                                        <React.Fragment>
                                          <option value={1}>1</option>
                                          <option value={2}>2</option>
                                          <option value={3}>3</option>
                                          <option value={4}>4</option>
                                          <option value={5}>5</option>
                                          <option value={6}>6</option>
                                          <option value={7}>7</option>
                                          <option value={8}>8</option>
                                          <option value={9}>9</option>
                                          <option value={10}>10</option>
                                        </React.Fragment>
                                      }

                                      {this.props.type == 'single' && this.props.options.length > 0 &&
                                        this.props.options.map((obj,idx) => {
                                            return (
                                                <option key = {idx} value={idx}>{obj}</option>
                                              )
                                        })
                                      }

                                  </select>
                              </div>
                              <div className="jump-label-2">Choose one Answer</div>
                          </div>
                          <div className="table logic-row">
                              <div className="table-cell jump-label">Then Jump to</div>
                              <div className="table-cell">
                                  <select className={(this.props.questionsError[this.props.qid][logicIndex]) ? "jump-select-box logicAnswerJump field-error" : "jump-select-box logicAnswerJump"} onChange={this.handleInputChange} name={"answers-"+this.props.qid+'-'+ logicIndex} value={(this.props.answers[logicIndex]) ? this.props.answers[logicIndex] : "0"}>
                                      <option value="">Select</option>
                                      {this.props.mainOptions && this.props.mainOptions.map((obj, idx) => {
                                          return (
                                            <React.Fragment key={"answers-"+this.props.qid+"-"+idx}>
                                              {obj.id != this.props.qid &&
                                                <option value={obj.id}>{obj.name}</option>
                                              }
                                            </React.Fragment>
                                            )
                                      })}
                                  </select>
                              </div>
                              <div className="jump-label-2">Choose one Answer</div>
                          </div>
                      </div>
                  </div>
                  )
                })}
                  <div className="if-else-section right-field-outer">
                      <div className="table logic-row">
                          <div className="table-cell jump-label">Else Jump to</div>
                            <div className="table-cell">
                                <select className={(this.props.elseError) ? "jump-select-box logicAnswerElse field-error" : "jump-select-box logicAnswerElse"} onChange={this.handleInputChange} name={"else-"+this.props.qid} value={(this.props.else) ? this.props.else : 0}>
                                    <option value="0">Select</option>
                                        {this.props.mainOptions && this.props.mainOptions.map((obj, idx) => {
                                            return (
                                              <React.Fragment key={"else-"+this.props.qid+"-"+idx}>
                                                {obj.id != this.props.qid &&
                                                  <option value={obj.id}>{obj.name}</option>
                                                }
                                              </React.Fragment>
                                              )
                                        })}
                                </select>
                            </div>
                          <div className="jump-label-2">Choose one Answer</div>
                      </div>
                  </div>
              </div>
      </React.Fragment>
  )}
}

export default LogicJump
