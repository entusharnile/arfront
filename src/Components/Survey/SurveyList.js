import React, { Component } from 'react';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom'
import config from '../../config';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { surveysListing, updateSortOrder  } from "../../Actions/Surveys/surveyActions.js";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { autoScrolling} from '../../Utils/services.js';

class SurveyList extends React.Component {
  constructor(props){
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));

    this.state={
      dateRangePicker:{
        selection:{
        startDate:new Date(),
        endDate:new Date(),
        key:'selection',
      },
    },
    to_date:format(new Date(),'YYYY-MM-DD'),
    from_date:format(new Date(),'YYYY-MM-DD'),
    showCalendar :false,
    surveysListingData:[],
    page: 1,
    pagesize: 20,
    term: '',
    hover:false,
    showLoader: false,
    viewSubmissionButton:"header-select-btn line-btn view-submission survey_view no-display",
    isMouseInside: false,
    next_page_url: '',
    startFresh: true,
    loadMore: true,
    showLoadingText : false,
    globalLang: languageData.global,
    surveyLang: languageData.surveys
  };
  localStorage.setItem("loadFresh", false);
  localStorage.setItem("sortOnly", false);
  window.onscroll = () => {
    const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop))
    if (
      window.innerHeight + scrollTop ===
        document.documentElement.offsetHeight &&
      this.state.next_page_url != null
    ) {
      this.loadMore();
      }
    };
  }
  mouseEnter = () => {
    this.setState({ isMouseInside: true });
  }
  mouseLeave = () => {
    this.setState({ isMouseInside: false });
  }
componentDidMount(){
const languageData = JSON.parse(localStorage.getItem("languageData"));

this.setState({
  surveyList_survey_name: languageData.surveys["surveyList_survey_name"],
  surveyList_questions: languageData.surveys["surveyList_questions"],
  survey_status:languageData.surveys["survey_status"],
  survey_create_survey:languageData.surveys["survey_create_survey"],
  surveys_survey: languageData.surveys["surveys_survey"],
})
  let formData ={'params':{
    /*page     : this.state.page,
    pagesize : this.state.pagesize,*/
    term     : this.state.term
  }
}
this.setState({'showLoader': true});
autoScrolling(true);
this.props.surveysListing(formData);
}

submissionEdit = id => {
  return <div>{this.props.history.push(`/surveys/dashboard/${id}/view-all`)}</div>;
};

static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        return {showLoader : false};
     }
    if (
      nextProps.surveysListingData != undefined &&
      nextProps.surveysListingData.data.data != prevState.surveysListingData
    ) {
      let returnState = {};
      if (localStorage.getItem("sortOnly") == "false") {
          returnState.surveysListingData = nextProps.surveysListingData.data.data;
          localStorage.setItem('showLoader', false);
          returnState.showLoader = false;
          returnState.showLoadingText = false;

      }
      autoScrolling(false);
      return returnState;
    }
    return null;
  }
      reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
      };

      getItemStyle = (isDragging, draggableStyle) => ({
        // some basic styles to make the items look a bit nicer
        userSelect: this.state.surveyLang.survey_none,
        // change background colour if dragging
        background: isDragging ? "#f7fbfd" : "ffffff",
        // styles we need to apply on draggables
        ...draggableStyle
      });

      reOrderList = list => {
          let formData = {
            object_ids: list
          };
          //this.setState({'showLoader': false});
          this.props.updateSortOrder(formData, "Survey");

        };

    loadMore = () => {
      if(!autoScrolling()){
        localStorage.setItem("sortOnly", false);
        this.setState({ loadMore: true, startFresh: true, showLoader: true, showLoadingText: true });
        let formData = {
          params: {
            /*page: this.state.page,
            pagesize: this.state.pagesize,*/
            term: this.state.term
          }
        };
        autoScrolling(true);
        this.props.surveysListing(formData);
      }
    };

  handleSubmit = event =>{
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let formData ={'params':{
      /*page     : this.state.page,
      pagesize   : this.state.pagesize,*/
      term: this.state.term
    }
  };
    this.setState({
      /*page: 1,
      pagesize: this.state.pagesize,
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",*/
      surveysListingData:[]
    });
    this.setState({'showLoader': true});
    autoScrolling(true);
    this.props.surveysListing(formData);
  }


  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  surveyEdit = id => {
    return <div>{this.props.history.push(`/surveys/template/${id}/edit`)}</div>;
  };

  shouldComponentUpdate(nextProps, nextState) {
    console.log(nextProps.timeStamp == this.props.timeStamp);
    if(nextProps.timeStamp == undefined && this.props.timeStamp == undefined) {
      return true
    } else if(nextProps.timeStamp == this.props.timeStamp && nextProps.timeStamp != undefined) {
      return true
    } else {
      return false;
    }

  }

  render() {
    var list = [];
    if (this.state.surveysListingData !== undefined) {
      list = this.state.surveysListingData.map((obj, idx) => {
        return {
          content: (
            <React.Fragment key={'fragment_'+idx}>

              <td className="col-xs-8 table-updated-td Questionnaire-name">
                <a href="#" className="drag-dots" />
                {obj.title }
              </td>

              <td className="col-xs-4 table-updated-td text-center">
                  {obj.survey_questions_count}
                </td>

              <td className="col-xs-4 table-updated-td text-center">
                {obj.is_published}
              </td>

              <td className="ccol-xs-4 table-updated-td text-center">
             <button  onClick={this.submissionEdit.bind(this, obj.id)}
                  className="header-select-btn line-btn view-submission survey_view show-hide-btn" >{this.state.surveyLang.survey_view_submission}
                  </button>
              </td>

            </React.Fragment>
          ),
          id: obj.id
        };
      });
    }
    var onDragEnd = result => {
      // dropped outside the list
      let finalArr = [];
      if (!result.destination) {
        return;
      }
      const items = this.reorder(
        list,
        result.source.index,
        result.destination.index
      );
      list = items;
      finalArr = items.map((obj, idx) => {
        return obj.id;
      });
      this.reOrderList(finalArr);
    };
    return (
		<div className="main protected">
      <div id="content">
           <div className="container-fluid content setting-wrapper">

             <ul className="sub-menu">
               <li><Link to="/surveys/dashboard">{this.state.surveyLang.survey_insights}</Link></li>
               <li><Link to="/surveys/manage" className="active">{this.state.surveys_survey}</Link></li>
             </ul>
             <div className="juvly-section full-width">
               <div className="setting-search-outer">
               <form onSubmit={this.handleSubmit}>

                 <div className="search-bg new-search pull-left">
                   <i className="fas fa-search" />
                   <input className="setting-search-input search-key" name="term" placeholder="Search" onChange={this.handleInputChange} value={this.state.term} />
                 </div>
                 </form>
                 <Link to="/surveys/template/create" className="new-blue-btn pull-right modal-link">{this.state.survey_create_survey}</Link>
               </div>
               <div className="table-responsive min-h-200">
                 <table className="table-updated setting-table min-w-1000">
                   <thead className="table-updated-thead">
                     <tr>
                       <th className="col-xs-3 table-updated-th">{this.state.surveyList_survey_name}</th>
                       <th className="col-xs-3 table-updated-th">{this.state.surveyList_questions}</th>
                       <th className="col-xs-3 table-updated-th">{this.state.survey_status}</th>
                       <th className="col-xs-3 table-updated-th">&nbsp;</th>
                     </tr>
                   </thead>
                 <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                      {(provided, snapshot) => (
                        <tbody className="table-updated setting-table" ref={provided.innerRef}>
                          {list.map((item, index)=>(
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot)=>(
                                <tr className="table-updated-tr"  data-order_by={item.id}  onClick={this.surveyEdit.bind(this, item.id)} ref={provided.innerRef}{...provided.draggableProps}{...provided.dragHandleProps} style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
                                {item.content}
                                </tr>)}
                            </Draggable>))
                          }
                          {null}{provided.placeholder}
                        </tbody>)}
                    </Droppable>
                  </DragDropContext>
                     </table>
                  {(this.state.showLoader === false) && <div className={(list.length) ? "no-record no-display" : "no-record"} >
                     {this.state.surveyLang.survey_sorry_no_record_found}
                   </div>}
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
                   <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
                 </div>
              </div>
    		</div>
      );
   }
}

function mapStateToProps(state, ownProps){
  const languageData =JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if(state.surveyReducer.action === "SURVEYS_LISTING"){
    if(state.surveyReducer.data.status != 200){
      returnState.showLoader = false
    }
    else{
      returnState.surveysListingData= state.surveyReducer.data
    };
  }
  if (state.surveyReducer.action === "SORT_ORDER_UPDATE_SURVEY") {
   if (state.surveyReducer.data.status != 200) {
     toast.error(languageData.global[state.surveyReducer.data.message]);
   }
   else
    {
      returnState.timeStamp = new Date();
      toast.success(languageData.global[state.surveyReducer.data.message]);
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    surveysListing:surveysListing,
    'updateSortOrder':updateSortOrder
  },dispatch)
}

export default connect(mapStateToProps,mapDispatchToProps)(SurveyList);
