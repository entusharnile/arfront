import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown,faAngleRight} from '@fortawesome/free-solid-svg-icons';
import { faFacebook} from '@fortawesome/free-brands-svg-icons/faFacebook';
import { findDOMNode } from 'react-dom';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import PropTypes from 'prop-types';
import ImageUploader from 'react-images-upload';
import config from '../../../../config';
import axios from 'axios';
import {fetchQuestionnaire,exportEmptyData} from '../../../../Actions/Settings/settingsActions.js';
import DragAndDrop from "../Consents/DragAndDrop.js";
import { autoScrolling } from "../../../../Utils/services.js";

class Questionnaire extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    this.state={
      fisrtname:'',
      lastname:'',
      user_role_id:'',
      status:'active',
      showLoadingText : false,
      userData:'',
      page:1,
      pagesize:15,
      sortorder:'asc',
      sortby: 'consultation_title',
      term:'',
      hasMoreItems: true,
      next_page_url: '',
      questionnaireList: [],
      loadMore: true,
      startFresh: true,
      showLoader: false
    }
    localStorage.setItem('loadFresh', false);
    localStorage.setItem('sortOnly', false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop))
      if (
        window.innerHeight + scrollTop
        === document.documentElement.offsetHeight
       && this.state.next_page_url != null) {
        this.loadMore();
      }
    };
  }

componentDidMount() {
    this.props.exportEmptyData()
    let formData = {'params':{
       page:this.state.page,
       pagesize:this.state.pagesize,
       //sortorder: 'asc',
       term:this.state.term,
       //sortby: this.state.sortby
      }
    }
    const languageData = JSON.parse(localStorage.getItem('languageData'))
      this.setState({
          question_Create_Questionnaire: languageData.settings['question_Create_Questionnaire'],
          question_Number_Of_Questions: languageData.settings['question_Number_Of_Questions'],
          question_Questionnaires: languageData.settings['question_Questionnaires'],
          clinics_Search: languageData.settings['clinics_Search'],
          clinic_No_Record_Found: languageData.settings['clinic_No_Record_Found'],
          clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
          loading_please_wait_text: languageData.global['loading_please_wait_text'],
      })
    this.setState({'showLoader': true})
    autoScrolling(true)
    this.props.fetchQuestionnaire(formData);
}

componentDidUpdate(){
  if(this.state.showLoader) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

questionnaireEdit = id => {
  return <div>{this.props.history.push(`/settings/questionnaires/${id}/edit`)}</div>;
};

handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({
        [event.target.name]: value
    });
}

handleSubmit = (event) => {
  event.preventDefault();
  localStorage.setItem('sortOnly', true);
  let formData = {'params':{
     page:1,
     pagesize:this.state.pagesize,
     //sortorder: this.state.sortorder,
     term:this.state.term
    }
  }
  this.setState({
    page:1,
    pagesize:this.state.pagesize,
    sortorder: (this.state.sortorder == 'asc') ? 'asc': 'desc',
    startFresh: true,
    loadMore: true,
    startFresh: true,
    next_page_url:'',
    questionnaireList : [],
    showLoader: true
  });
  autoScrolling(true)
  this.props.fetchQuestionnaire(formData);
}

loadMore = () => {
  if(!autoScrolling()){
      localStorage.setItem('sortOnly', false);
      this.setState({'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true})
      let formData = {'params':{
          page:this.state.page,
          pagesize:this.state.pagesize,
          //sortorder: this.state.sortorder,
          term:this.state.term,
          //sortby: this.state.sortby
        }
      }
      autoScrolling(true)
      this.props.fetchQuestionnaire(formData);
    }
};

  static getDerivedStateFromProps(nextProps, prevState){
      if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
          return {showLoader : false};
       }
      if (nextProps.questionnaireList != undefined && nextProps.questionnaireList.next_page_url !== prevState.next_page_url) {
          let returnState = {};
          if(prevState.next_page_url == null) {
            localStorage.setItem('sortOnly', false);
            autoScrolling(false)
            return returnState.next_page_url = null;
          }
          if(prevState.questionnaireList.length == 0 && prevState.startFresh == true) {
            if(localStorage.getItem('sortOnly') == 'false') {
              returnState.questionnaireList = nextProps.questionnaireList.data;
              if(nextProps.questionnaireList.next_page_url != null){
                 returnState.page = prevState.page + 1;
               } else {
                 returnState.next_page_url = nextProps.questionnaireList.next_page_url;
               }
              returnState.startFresh = false;
              returnState.showLoader = false;
              returnState.showLoadingText = false;
            } else {
              localStorage.setItem('sortOnly', false);
            }

          } else if(prevState.questionnaireList != nextProps.questionnaireList.data && prevState.questionnaireList.length != 0) {
            returnState.questionnaireList = [...prevState.questionnaireList,...nextProps.questionnaireList.data];
            returnState.page = prevState.page + 1;
            returnState.next_page_url = nextProps.questionnaireList.next_page_url;
            returnState.showLoader = false;
            returnState.showLoadingText = false;
          }
          autoScrolling(false)
          return returnState;
      }
      return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if(this.state.startFresh) {
      return true;
    }

    if(this.state.loadMore) {
      return true;
    }

    if(this.state.showLoader) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <div>
        <div id="content">
          <div className="container-fluid content setting-wrapper">
            <Sidebar />
              <div className="setting-setion">
                <div className="setting-search-outer">
                  <form  onSubmit={this.handleSubmit}>
                    <div className="search-bg col-xs-5">
                      <i className="fas fa-search"></i>
                        <input className="setting-search-input search-key" data-url="/settings/questionnaires" name="term" placeholder={this.state.clinics_Search} autoComplete="off" value={this.state.term} onChange={this.handleInputChange}/>

                    </div>
                  </form>
                  <Link to="/settings/questionnaires/create" className="new-blue-btn pull-right edit_setting">{this.state.question_Create_Questionnaire}</Link>
                </div>

            <div className="table-responsive">
              <table className="table-updated setting-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-8 table-updated-th sorting">{this.state.question_Questionnaires}</th>
                    <th className="col-xs-4 table-updated-th sorting text-center">{this.state.question_Number_Of_Questions}</th>
                  </tr>
                </thead>
                  <DragAndDrop sortUpdate = {this.updateSortOrder} list = {this.state.questionnaireList} module = {'ConsultationList'}  editUrl = {this.questionnaireEdit} />
                  {
                    (this.state.questionnaireList != undefined && this.state.questionnaireList.length <= 0) && (this.state.showLoader === false) &&
                    <tbody>
                      <tr>
                        <td className="col-xs-8 table-updated-th text-center" colSpan={2}>
                          <div className={"no-record"}>
                            {this.state.clinic_No_Record_Found}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  }
              </table>

            </div>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.clinic_Please_Wait}</div>
              </div>
            </div>
            <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.loading_please_wait_text}</div>
          </div>
      </div>
    </div>
    </div>

    );
  }
}

function mapStateToProps(state) {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const returnState = {};
    if (state.SettingReducer.action === "QUESTIONNAIRES_LIST") {
      localStorage.setItem('loadFresh', false);
      if(state.SettingReducer.data.status != 200){
        returnState.showLoader = false
      }
      else {
            returnState.questionnaireList = state.SettingReducer.data.data
          }
        }
    return returnState;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({fetchQuestionnaire: fetchQuestionnaire, exportEmptyData:exportEmptyData}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Questionnaire);
