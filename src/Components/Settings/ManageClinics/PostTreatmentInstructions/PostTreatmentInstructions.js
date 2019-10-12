import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import config from '../../../../config.js';
import axios from 'axios';
import Sidebar from '../../../../Containers/Settings/sidebar.js';
import { getUser,userProfile, uploadImage,fetchPosttreatmentInstructions } from '../../../../Actions/Settings/settingsActions.js';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DragAndDrop from '../Consents/DragAndDrop.js';
import { autoScrolling } from "../../../../Utils/services.js";

class PostTreatmentInstructions extends Component{
  constructor(props){
    super(props);
    window.scrollTo(0, 0)
    this.state={
      post_subject:'',
      post_body:'',
      userChanged:false,
      userData:'',
      page:1,
      pagesize:15,
      sortorder:'asc',
      term:'',
      hasMoreItems: true,
      next_page_url: '',
      instructionsList: [],
      loadMore: true,
      startFresh: true,
      showLoader: false,
      showLoadingText: false
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

  componentDidMount(){
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.setState({
      post_treatment_instructions_button:languageData.settings['post_treatment_instructions_button'],
      post_treatment_instructions_title:languageData.settings['post_treatment_instructions_title'],
      post_treatment_instructions_added:languageData.settings['post_treatment_instructions_added'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      clinic_No_Record_Found: languageData.settings['clinic_No_Record_Found'],

    })
    let formData = {'params':{
       page:this.state.page,
       pagesize:this.state.pagesize,
       sortorder: 'asc',
       term:this.state.term
      }
    }
    this.setState({'showLoader': true})
    autoScrolling(true)
    this.props.fetchPosttreatmentInstructions(formData);
  }

  componentDidUpdate(){
    if(this.state.showLoader) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

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
       sortorder: this.state.sortorder,
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
      instructionsList : []
    });
    autoScrolling(true)
    this.props.fetchPosttreatmentInstructions(formData);
  }

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem('sortOnly', false);
      this.setState({'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true})
      let formData = {'params':{
          page:this.state.page,
          pagesize:this.state.pagesize,
          sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : '',
          term:this.state.term
        }
      }
      autoScrolling(true)
      this.props.fetchPosttreatmentInstructions(formData);
    }
  }

  postEdit = id => {

    return <div>{this.props.history.push(`/settings/post-treatment-instructions/${id}/edit`)}</div>;
  };

    static getDerivedStateFromProps(nextProps, prevState) {
      if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
          return {showLoader : false};
       }
        if (nextProps.instructionsList != undefined && nextProps.instructionsList.next_page_url !== prevState.next_page_url) {
            let returnState = {};
            if(prevState.next_page_url == null) {
              localStorage.setItem('sortOnly', false);
              autoScrolling(false)
              return returnState.next_page_url = null;
            }

            if(prevState.instructionsList.length == 0 && prevState.startFresh == true) {
              if(localStorage.getItem('sortOnly') == 'false') {
                returnState.instructionsList = nextProps.instructionsList.data;
                if(nextProps.instructionsList.next_page_url != null) {
                  returnState.page = prevState.page + 1;
                  returnState.next_page_url = nextProps.instructionsList.next_page_url;
                } else {
                  returnState.next_page_url = null;
                }
                returnState.startFresh = false;
                returnState.showLoader = false;
                returnState.showLoadingText = false;

              } else {
                localStorage.setItem('sortOnly', false);
              }

            } else if(prevState.instructionsList != nextProps.instructionsList.data && prevState.instructionsList.length != 0) {
              returnState.instructionsList = [...prevState.instructionsList,...nextProps.instructionsList.data];
              returnState.page = prevState.page + 1;
              returnState.next_page_url = nextProps.instructionsList.next_page_url;
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

/*  componentWillUnmount = () => {
    window.onscroll = () => {
      return false;
    }
  }*/

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
      userSelect: 'none',

      // change background colour if dragging
      background: isDragging ? '#f7fbfd' : 'ffffff',

      // styles we need to apply on draggables
      ...draggableStyle,
  });

  render(){
    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <Sidebar />
            <div className="setting-setion">
              <div className="setting-search-outer">
                <form  onSubmit={this.handleSubmit}>
                  <div className="search-bg col-xs-5">
                    <i className="fas fa-search" />
                    <input className="setting-search-input search-key" data-url="/settings/pre_treatment_instructions" name="term" placeholder="Search" value={this.state.term} autoComplete="off" onChange={this.handleInputChange} />
                  </div>
                </form>
                <Link to="/settings/post-treatment-instructions/create" className="new-blue-btn pull-right edit_setting">{this.state.post_treatment_instructions_button}</Link>
              </div>
              <div className="table-responsive">
                <table className="table-updated setting-table">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="col-xs-8 table-updated-th sorting">{this.state.post_treatment_instructions_title}</th>
                      <th className="col-xs-4 table-updated-th sorting text-center">{this.state.post_treatment_instructions_added}</th>
                    </tr>
                  </thead>
                  <DragAndDrop sortUpdate = {this.updateSortOrder} list = {this.state.instructionsList} module = {'PostTreatmentInstruction'}  editUrl = {this.postEdit}   />
                  {
                    this.state.instructionsList.length <= 0 && (this.state.showLoader === false) &&
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
    );
  }
}

function mapStateToProps(state) {
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const returnState = {};
    if (state.SettingReducer.action === "POST_TREATMENT_INSTRUCTIONS_LIST") {
      if(state.SettingReducer.data.status != 200) {
        toast.error(languageData.global[state.SettingReducer.data.message]);
        returnState.showLoader = false
      } else {
        returnState.instructionsList = state.SettingReducer.data.data;
      }
    }
    return returnState;
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      fetchPosttreatmentInstructions:fetchPosttreatmentInstructions
    }, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(PostTreatmentInstructions);
