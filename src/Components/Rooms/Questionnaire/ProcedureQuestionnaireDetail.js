import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { fetchProcedureQuestionnaire }from '../../../Actions/Settings/settingsActions.js';
import { SketchField, Tools } from 'react-sketch';
import axios from 'axios';
import Select from 'react-select';
import crossImg from '../../../images/close.png';
import { displayName, capitalizeFirstLetter } from '../../../Utils/services.js';


class ProcedureQuestionnaireDetail extends Component {
  constructor(props){

    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state={
      id:props.match.params.id,
      questionsAllData:[],
      questionsMultipleData:[],
      defaultOptions: [],
      selectedOption: null,
      userChanged:false,
      select_Default_Clinic:[],
      showCommentBox:false,
      roomType  : this.props.match.url.split('/')[1],
      action    : (props.match.params.type) ? props.match.params.type : 'pending',
      showLoader            : false,
      globalLang            : languageData.global,
    }
  }

  componentDidMount(){
    this.setState({showLoader: true})
    this.props.fetchProcedureQuestionnaire(this.state.id)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if ( nextProps.questionsData !== undefined && nextProps.questionsData.status === 200 && nextProps.questionsData.data !== prevState.questionsAllData ) {
        return {
          questionsAllData      : nextProps.questionsData.data,
          showLoader            : false
        }
    } else if ( nextProps.questionsData !== undefined && nextProps.questionsData.status !== 200 && nextProps.questionsData.data !== prevState.questionsAllData ) {
      return {
        questionsAllData      : nextProps.questionsData.data,
        showLoader            : false
      }
    }
      return null
    }


  handleChange = (selectedOption) => {
  this.setState({
  select_Default_Clinic: selectedOption,
  selectedOption
  });
  }

  handleDrop =()=>{
  }
  addComment =()=>{
  this.setState({showCommentBox:true})
  }
  render() {
    let returnTo = '';

    if ( this.state.roomType && this.state.roomType === 'clients' ) {
      returnTo = (this.props.match.params.type) ? "/" + this.state.roomType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID  : "/" + this.state.roomType
    } else {
     returnTo = (this.state.action) ? "/" + this.state.roomType + "/" + this.state.action  : 'pending'
   }
  return (
      <div id="content">
         <div className="container-fluid content setting-wrapper">
            <div className="juvly-section full-width m-t-15">
               <div className="juvly-container">
                  <div className="juvly-title m-b-30">{(this.state.questionsAllData && this.state.questionsAllData.patient) && displayName(this.state.questionsAllData.patient) + ` - `} {(this.state.questionsAllData && this.state.questionsAllData.procedure_name) && capitalizeFirstLetter(this.state.questionsAllData.procedure_name) + ` - `}QUESTIONNAIRES DETAILS
                     <Link to={returnTo} className="pull-right"><img src={crossImg} /></Link>
                  </div>
                  {this.state.questionsAllData &&  this.state.questionsAllData.questionnaires && this.state.questionsAllData.questionnaires.length > 0 && this.state.questionsAllData.questionnaires.map((obj,idx)=>{
                  return(
                  <div className="accordion-discription-row" key={idx}>
                  <div className="juvly-subtitle m-b-20" >{obj.consultation_title}</div>
                     <div className="table-responsive m-b-30">
                        <div className="accordion-table">
                           {obj.questions && obj.questions.map((obj1,idx1)=>{
                           return(
                           <div key={idx1} className="accordion-discription-row">
                              <div className="accordian-section col-xs-6 no-border-left gray-bg">{obj1.question}</div>
                              {(obj1.question_type == 'yesno')?
                              <div className="accordian-section col-xs-6 border-left">
                                 {obj1.answers && obj1.answers!=undefined  && obj1.answers.map((obj2,idx2)=>{
                                 return(
                                 <div key={idx2}>
                                  {(obj2.answer) == 1 ? 'Yes' :'No' }
                                 </div>
                                 )})}
                              </div>
                              :(obj1.question_type == 'multitext') ?
                              <div className="accordian-section col-xs-6 border-left">
                                 {obj1.answers && obj1.question_choices!=undefined  && obj1.question_choices.map((obj2,idx2)=>{
                                 return(
                                 <div key={idx2}>
                                  {(obj2.is_selected) == 1 ? obj2.text :null}
                                 </div>
                                 )})}
                              </div>
                              :
                              <div className="accordian-section col-xs-6 border-left">
                              {obj1.answers && obj1.question_choices!=undefined  && obj1.question_choices.map((obj2,idx2)=>{
                              return(
                                 <div className="question-img-outer sel" key={idx2}>
                                    <div className="question-img">
                                       <img src={obj2.img} />
                                       <input type="hidden" name="735_choice[]" defaultValue id="image_735_760" className="sel-img-choice" />
                                    </div>
                                    <div className="qusst-name">{obj2.image_label}</div>
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
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SettingReducer.action === "PROCEDURE_QUESTIONNAIRE") {
    if (state.SettingReducer.data.status === 200) {
      return {
        questionsData: state.SettingReducer.data
      }
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.SettingReducer.data.message]);
      return {
        questionsData: state.SettingReducer.data
      }
    }
    return {};
  }  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchProcedureQuestionnaire:fetchProcedureQuestionnaire},dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ProcedureQuestionnaireDetail);
