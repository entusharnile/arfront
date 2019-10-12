import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { fetchProcedureQuestionnaire, updateProcedureQuestionnaire, getQuestionnaireById } from '../../../Actions/Settings/settingsActions.js';
import axios from 'axios';
import Select from 'react-select';
import crossImg from '../../../images/close.png';

class ProviderQuestionnaires extends Component {
    constructor(props) {
        super(props);
        const languageData = JSON.parse(localStorage.getItem('languageData'));
        this.state = {
            id: props.match.params.id,
            questionsAllData: [],
            questionsMultipleData: [],
            questionspatientData: {},
            defaultOptions: [],
            selectedOption: null,
            userChanged: false,
            select_Default_Clinic: [],
            showCommentBox: false,
            showLoader : false,
            value: null,
            options: null,
            clinics_array: [],
            yes: null,
            no: null,
            consultation_title: "accordion-discription-row consultTitle no-display",
            checkBox: '',
            roomsLang: languageData.rooms,
            dataList: [{
                "questionnaires": [{
                    id: null,
                    "questions": [{
                        id: null,
                        question_type: "yesno",
                        "answers": [{
                            answer: null,
                            comment: "string"
                        }]
                    }]
                }, ]
            }],
            roomType  : this.props.match.url.split('/')[1],
            action    : (props.match.params.type) ? props.match.params.type : 'pending',

        }
    }
    componentDidMount() {
        let formData = {}
        if(this.state.id) {
          this.setState({showLoader : true})
          this.props.fetchProcedureQuestionnaire(this.state.id)
        } else {
          this.props.fetchAllQuestionnaires();
        }
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.questionsData !== undefined && nextProps.questionsData != prevState.questionsData) {
          let selectedQ = [],
              returnState = {}
          if(nextProps.questionsData.questionnaires && nextProps.questionsData.questionnaires && prevState.userChanged == false) {

            selectedQ = nextProps.questionsData.questionnaires;
            selectedQ.map((obj, idx) => {
              returnState["q-class-"+obj.id] = "accordion-title";
              if(obj.questions) {
                obj.questions.map((a, b) => {
                  if(a.question_type == 'yesno') {
                    if(a.answers.length){
                      returnState['q-'+obj.id+'-'+a.id+'-yesno'] = a.answers[0].answer;
                      if(a.answers[0].answer) {
                        returnState['q-'+obj.id+'-'+a.id+'-comment'] = a.answers[0].comment;
                      }
                    }
                    else{
                      returnState['q-'+obj.id+'-'+a.id+'-yesno'] = 0;

                    }

                  } else {
                    a.question_choices.map((x, y) => {
                      let index = a.answers.findIndex(y => y.question_choice_id === x.id);
                      if(a.multiple_selection) {
                        returnState['q-'+obj.id+'-'+a.id+'-'+x.id] = (index > -1) ? 1 : 0;
                      } else {
                      let selection = a.answers.find(y => y.question_choice_id === x.id);
                        if(selection) {
                          returnState['q-'+obj.id+'-'+a.id] = x.id
                        }
                      }
                    })
                  }
                })
              }

            })
          }

          returnState.questionsData = nextProps.questionsData;
          returnState.selectedQuestionnaire = (nextProps.questionsData.questionnaires) ? nextProps.questionsData.questionnaires : [];
          returnState.questionsAllData = nextProps.questionsData.all_questionnaries;
          returnState.questionspatientData = (nextProps.questionsData.patient) ? nextProps.questionsData.patient : {};
          returnState.showLoader = false;

          return returnState;
        }

        if (nextProps.questionnaireData !== undefined && nextProps.questionnaireData.status === 200 && nextProps.questionnaireData.data != prevState.questionnaireData) {
            let tempQuestionnaire = prevState.selectedQuestionnaire;
            tempQuestionnaire.push(nextProps.questionnaireData.data)
            return {
                selectedQuestionnaire: tempQuestionnaire,
                questionnaireData : nextProps.questionnaireData.data,
                showLoader: false
              }
        }
        if(nextProps.showLoader == false) {
          return {showLoader : false}
        }
            return null;
        }

    handleImageChange = (event) => {
      let val = event.currentTarget.dataset.id;
      let noMultiVal = event.currentTarget.dataset.val;

      this.setState({[val] : (noMultiVal) ? noMultiVal : !this.state[val], userChanged: true})
    }

    handleChange = (selectedOption, x) => {
        if(x.action != 'remove-value'){
          let obj = this.state.questionsAllData.find(y => y.id === x.option.value);
          this.setState({showLoader:  true})
          this.props.getQuestionnaireById(obj.id);
        } else {
          let tempQuestionnaire = this.state.selectedQuestionnaire
          let index = tempQuestionnaire.findIndex(y => y.id === x.removedValue.value);
          tempQuestionnaire.splice(index,1);
          this.setState({
            selectedQuestionnaire: tempQuestionnaire
          });
        }
        /*let tempQuestionnaire = this.state.selectedQuestionnaire
        this.setState({
            selectedQuestionnaire: tempQuestionnaire.push(obj)
          });*/
    }
    handleSubmit = () => {
      let formData = {},
      flag = false,
      errorState = {};
      formData.questionnaires = [];

        if(this.state.selectedQuestionnaire) {
          this.state.selectedQuestionnaire.map((obj,idx)=>{
            let questions = [];
              if(obj.questions) {
                obj.questions.map((a, b) => {
                  let answers = [];
                  if(a.question_type == 'yesno') {
                    if(!this.state['q-'+obj.id+'-'+a.id+'-yesno'] != undefined) {
                      answers.push( {"answer": this.state['q-'+obj.id+'-'+a.id+'-yesno'], "comment": (this.state['q-'+obj.id+'-'+a.id+'-comment']) ? this.state['q-'+obj.id+'-'+a.id+'-comment'] : ''})
                    }
                  } else {
                    if(a.question_choices.length >0 && a.question_choices[0].multiple_selection == 1) {
                      a.question_choices.map((x, y) => {
                        if(this.state['q-'+obj.id+'-'+a.id+'-'+x.id]) {
                          answers.push( {"question_choice_id": x.id})
                        }
                      })
                    } else {
                      answers.push({question_choice_id : this.state["q-"+obj.id+"-"+a.id]})
                    }
                  }
                  if(answers.length) {
                      questions.push({id: a.id, question_type : a.question_type, answers: answers})
                    }
                })
              }
            if(!questions.length) {
              errorState['q-class-'+obj.id] = "accordion-title field-error";
              flag = true;
            } else {
              errorState['q-class-'+obj.id] = "accordion-title";
            }
            formData.questionnaires.push({id : obj.id, questions: questions})
           })
        }
        // if(formData.questionnaires.length == 0) {
        //   this.setState(errorState)
        //   toast.error(this.state.roomsLang.rooms_please_select_one_ques);
        //   return false;
        // }
        if(flag ) {
          this.setState(errorState)
          toast.error(this.state.roomsLang.rooms_please_answer_one_question);
          return false;
        }
        errorState.showLoader = true;
        this.setState(errorState);
        this.props.updateProcedureQuestionnaire(this.state.id, formData)

    }

    handleDrop = (event) => {
        this.setState({
            active_consultation : event.currentTarget.dataset.id,
            consultation_title: "accordion-discription-row consultTitle display",
        })
    }

    addComment = () => {
        this.setState({ showCommentBox: true })
    }

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        this.setState({
            [event.target.name]: value,
            userChanged: true
        });
    }

    render() {
        var defaultOptions = [];
        var options = [];
        if (this.state.selectedQuestionnaire != undefined && this.state.selectedQuestionnaire.length) {
            this.state.selectedQuestionnaire.map((obj, idx) => {
                  defaultOptions.push({ value: obj.id, label: obj.consultation_title })
            })
        }

        if (this.state.questionsAllData != undefined && this.state.questionsAllData.length > 0) {
            options = this.state.questionsAllData.map((obj, idx) => {
                return { value: obj.id, label: obj.consultation_title }
            })
        }

        let returnTo = (this.state.action) ? "/" + this.state.roomType + "/" + this.state.action  : 'pending'

        return (
            <div id="content">
   <div className="container-fluid content setting-wrapper">
      <div className="juvly-section full-width m-t-15">
         <div className="juvly-container">
            <div className="juvly-title m-b-30">{this.state.questionspatientData.firstname} {this.state.questionsAllData.procedure_name} - {this.state.roomsLang.rooms_questionnnaires_details}
              <Link to={returnTo} className="pull-right"><img src={crossImg} /></Link>
            </div>
            <div className="new-field-label">{this.state.roomsLang.rooms_select_questionnaire}
               <span className="setting-require">*</span>
            </div>
            <div className="row">
              <div className="col-xs-12">
                <div className="setting-field-outer">
                <div className="tag-auto-select">
                {
                options && <Select
                   onChange={this.handleChange}
                   value = {defaultOptions}
                   isClearable
                   isSearchable
                   options={options}
                   isMulti={true}
                   />
                }
                </div>
                </div>
              </div>
            </div>
            {this.state.selectedQuestionnaire && this.state.selectedQuestionnaire.map((obj,idx)=>{
            return(
               <div className="table-responsive acc-table-responsive" key={'selectedQuestionnaire-'+ idx}>
                  <div className="accordion-table table-min-width">
                    <div className="accordion-row">
                    <div className={this.state["q-class-"+obj.id]} data-id={obj.id} onClick={this.handleDrop}>
                        <div className="accordian-section no-border" ><i className={(this.state.active_consultation == obj.id) ? "fas toggle-arrow fa-angle-up" : "fas toggle-arrow fa-angle-down"}></i> {obj.consultation_title}</div>
                    </div>
                     {obj.questions && obj.questions.map((obj1,idx1)=>{
                     return(
                     <div className={(this.state.active_consultation == obj.id) ? this.state.consultation_title : 'accordion-discription-row no-display'} key={'question-'+ idx1}>
                        <div className="accordian-section col-xs-6" name="questionId" value={obj1.id}>{obj1.question}
                        </div>
                        {(obj1.question_type == 'yesno') &&
                        <div className="accordian-section col-xs-6 border-left">
                           <div >
                              <div className="basic-checkbox-outer">
                                 <input id="yes" type="radio" checked={(this.state["q-"+obj.id+"-"+obj1.id+"-yesno"] == 1) ? 'checked' : false}
                                 onChange={this.handleInputChange} className="basic-form-checkbox"  name={"q-"+obj.id+"-"+obj1.id+"-yesno"} value="1" />
                                 <label className="basic-form-text"  htmlFor="yes">{this.state.roomsLang.yes_text}</label>
                              </div>
                              <div className="basic-checkbox-outer">
                                 <input id="no" type="radio" checked={(this.state["q-"+obj.id+"-"+obj1.id+"-yesno"] == 0) ? 'checked' : false}
                                 onChange={this.handleInputChange} className="basic-form-checkbox" name={"q-"+obj.id+"-"+obj1.id+"-yesno"} value="0" />
                                 <label className="basic-form-text"   htmlFor="no">{this.state.roomsLang.rooms_no_text}</label>
                              </div>
                              { (this.state["q-"+obj.id+"-"+obj1.id+"-yesno"] == 1) &&
                                <div className="setting-field-outer m-t-20 m-b-0">
                                    <div className="new-field-label">{this.state.roomsLang.rooms_type_your_answer}</div>
                                    <textarea  className="setting-textarea-box" cols="30" rows="2" name={"q-"+obj.id+"-"+obj1.id+"-comment"} onChange={this.handleInputChange} value={this.state["q-"+obj.id+"-"+obj1.id+"-comment"]}></textarea>
                                  </div>
                                }
                           </div>
                        </div>
                      }
                        {(obj1.question_type == 'multitext') &&
                        <div className="accordian-section col-xs-6 border-left">
                           {obj1.question_choices!=undefined  && obj1.question_choices.map((obj2,idx2)=>{
                           return(
                           <div key={"multitext-"+idx2}>
                           {(obj2.multiple_selection == 1) &&
                             <div key={'choices-'+ idx2}>
                                <div className="basic-checkbox-outer">
                                   <input id="option1" type="checkbox" defaultChecked={(obj2.is_selected) == 1 ? 'checked' :null} name={"q-"+obj.id+"-"+obj1.id+"-"+obj2.id} className="basic-form-checkbox" onChange={this.handleInputChange} />
                                   <label className="basic-form-text" htmlFor="option1">{obj2.text}</label>
                                </div>
                             </div>
                           }
                           {obj2.multiple_selection == 0 &&
                             <div className="basic-checkbox-outer">
                                 <input id="yes" type="radio" checked={(this.state["q-"+obj.id+"-"+obj1.id] == obj2.id) ? 'checked' : false}
                                 onChange={this.handleInputChange} className="basic-form-checkbox"  name={"q-"+obj.id+"-"+obj1.id} value={obj2.id} />
                                 <label className="basic-form-text"  htmlFor="yes">{obj2.text}</label>
                              </div>
                           }
                           </div>
                           )})}
                        </div>
                        }
                        {(obj1.question_type == 'multiimage') &&
                        <div className="accordian-section col-xs-6 border-left">
                        {obj1.question_choices!=undefined  && obj1.question_choices.map((obj2,idx2)=>{
                        return(
                          <div className="question-img-outer" key={"multiimage-"+idx2}>
                          {(obj2.multiple_selection == 1) &&
                           <div className={(this.state["q-"+obj.id+"-"+obj1.id+"-"+obj2.id]) ? "question-img-outer sel" : "question-img-outer"} key={'multiquestion-'+ idx2}>
                              <div className="question-img" data-id={"q-"+obj.id+"-"+obj1.id+"-"+obj2.id} onClick={this.handleImageChange}>
                                 <img src={obj2.image_url}   />
                              </div>
                              <div className="qusst-name">{obj2.image_label}</div>
                              <div className="check-quest"></div>
                           </div>
                         }
                         {(obj2.multiple_selection == 0) &&
                           <div className={(this.state["q-"+obj.id+"-"+obj1.id] == obj2.id) ? "question-img-outer sel" : "question-img-outer"} key={'multiquestion-'+ idx2}>
                              <div className="question-img" data-id={"q-"+obj.id+"-"+obj1.id} data-val={obj2.id} onClick={this.handleImageChange}>
                                 <img src={obj2.image_url}   />
                              </div>
                              <div className="qusst-name">{obj2.image_label}</div>
                              <div className="check-quest"></div>
                           </div>
                         }
                         </div>
                         )})}
                        </div>
                        }
                     </div>
                     )})}
                    </div>
                  </div>
            </div>
            )})}
         </div>
         <div className="footer-static">
            <button onClick={this.handleSubmit} className="new-blue-btn pull-right"  value="Save">{this.state.roomsLang.rooms_save}</button>
            <Link to="/provider-room/pending" className="new-white-btn pull-right">{this.state.roomsLang.rooms_cancel}</Link>
          </div>
         <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
            <div className="loader-outer">
              <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
              <div id="modal-confirm-text" className="popup-subtitle" >{this.state.roomsLang.room_please_wait}</div>
            </div>
          </div>
      </div>
   </div>

          </div>
        )
    }
}

function mapStateToProps(state) {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    toast.dismiss();
    if (state.SettingReducer.action === "PROCEDURE_QUESTIONNAIRE") {
        if (state.SettingReducer.data.status === 200) {
            return {
                questionsData: state.SettingReducer.data.data
            }
        } else {
            toast.dismiss();
            toast.error(languageData.global[state.SettingReducer.data.message]);
        }
        return {};
    }

    if (state.SettingReducer.action === "UPDATE_PROCEDURE_QUESTIONNAIRE") {
        if (state.SettingReducer.data.status === 200) {
          toast.success(languageData.global[state.SettingReducer.data.message]);
            return {
                questionsData: state.SettingReducer.data.data
            }
        } else {
            toast.dismiss();
            toast.error(languageData.global[state.SettingReducer.data.message]);
            return {showLoader : false}
        }
        return {};
    }

    if (state.SettingReducer.action === "GET_QUESTIONNAIRE") {
      let returnState = {}
      if (state.SettingReducer.data.status == 200) {
        returnState.questionnaireData = state.SettingReducer.data;
      } else {
        returnState.redirect = true;
        returnState.message = languageData.global[state.SettingReducer.data.message];
      }
      return returnState;
    }
    return {}
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        fetchProcedureQuestionnaire: fetchProcedureQuestionnaire,
        updateProcedureQuestionnaire: updateProcedureQuestionnaire,
        getQuestionnaireById: getQuestionnaireById,
    }, dispatch)
}
export default connect(mapStateToProps, mapDispatchToProps)(ProviderQuestionnaires);
