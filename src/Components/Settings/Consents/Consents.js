import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../../Containers/Settings/sidebar.js";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { findDOMNode } from "react-dom";
import {
  fetchConsents,
  updateSortOrder
} from "../../../Actions/Settings/settingsActions.js";
import { autoScrolling } from "../../../Utils/services.js";

class Consents extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem("userData"));

    this.state = {
      consentsList: [],
      page: 1,
      pagesize: 15,
      sortorder: "asc",
      term: "",
      hasMoreItems: true,
      next_page_url: "",
      showLoadingText : false,
      loadMore: true,
      startFresh: true,
      showLoader: false
    };
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

  componentDidMount() {
    let formData = {
      params: {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: "asc",
        term: this.state.term,
        scopes: this.state.scopes
      }
    };
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    this.setState({
      consents_header: languageData.settings["consents_header"],
      consents_added_by: languageData.settings["consents_added_by"],
      create_consent_button: languageData.settings["create_consent_button"],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
      clinic_No_Record_Found: languageData.settings['clinic_No_Record_Found'],
    });
    this.setState({'showLoader': true});
    autoScrolling(true)
    this.props.fetchConsents(formData);
  }

  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let formData = {
      params: {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
        term: this.state.term,
        scopes: this.state.scopes
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: this.state.sortorder == "asc" ? "desc" : "asc",
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      consentsList: []
    });
    this.setState({'showLoader': true});
    autoScrolling(true)
    this.props.fetchConsents(formData);
  };

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ loadMore: true, startFresh: true, showLoader: true, showLoadingText: true });
      let formData = {
        params: {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : '',
          term: this.state.term
        }
      };
      this.setState({'showLoader': true});
      autoScrolling(true)
      this.props.fetchConsents(formData);
    }
  };

  consentEdit = id => {
    return <div>{this.props.history.push(`/settings/consent/${id}/edit`)}</div>;
  };

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",

    background: isDragging ? "#f7fbfd" : "ffffff",

    ...draggableStyle
  });

  reOrderList = list => {
    let formData = {
      object_ids: list
    };
    this.setState({'showLoader': true});
    this.props.updateSortOrder(formData, "Consent");
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (
      nextProps.consentsList != undefined &&
      nextProps.consentsList.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        autoScrolling(false)
        return returnState;
      }
      if (prevState.consentsList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.consentsList = nextProps.consentsList.data.data;
          if (nextProps.consentsList.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.consentsList.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          localStorage.setItem('showLoader', false);
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.consentsList != nextProps.consentsList.data &&
        prevState.consentsList.length != 0
      ) {
        returnState.consentsList = [
          ...prevState.consentsList,
          ...nextProps.consentsList.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.questionnaireList.next_page_url;
        localStorage.setItem('showLoader', false);
        returnState.showLoader = false;
        returnState.showLoadingText = false;
      }
      autoScrolling(false)
      return returnState;
    }
    return null;
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  render() {
    var list = [];
    if (this.state.consentsList !== undefined) {
      list = this.state.consentsList.map((obj, idx) => {
        return {
          content: (
            <tr
              className="table-updated-tr edit_setting"
              id="liConsltDivId_2"
              data-order_by={obj.order_by}
              onClick={this.consentEdit.bind(this, obj.id)}
            >
              <td className="col-xs-8 table-updated-td Questionnaire-name">
                <a href="#" className="drag-dots" />
                {obj.consent_name}
              </td>
              <td className="col-xs-4 table-updated-td text-center">
                {obj.consent_small_description}
              </td>
            </tr>
          ),
          id: obj.id
        };
      });
    }

    var onDragEnd = result => {
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
                <Sidebar />
                    <div className="setting-setion">
                        <div className="setting-search-outer">
                            <form onSubmit={this.handleSubmit}>
                                <div className="search-bg col-xs-5">
                                    <i className="fas fa-search" />
                                    <input className="setting-search-input search-key" data-url="/settings/questionnaires" name="term"  placeholder={this.state.clinics_Search} autoComplete="off" value={this.state.term} onChange={this.handleInputChange}/>
                                </div>
                            </form>
                                <Link to="/settings/consent/create" className="new-blue-btn pull-right">
                                    {this.state.create_consent_button}
                                </Link>
                        </div>

                        <div className="table-responsive">
                            <table className="table-updated setting-table">
                                <thead className="table-updated-thead">
                                    <tr>
                                      <th className="col-xs-8 table-updated-th sorting">{this.state.consents_header}</th>
                                      <th className="col-xs-4 table-updated-th sorting text-center">{this.state.consents_added_by}</th>
                                    </tr>
                                </thead>
                            </table>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="droppable">
                {(provided, snapshot) => (<table className="table-updated setting-table" ref={provided.innerRef}>
                {list.map((item, index)=>(<Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot)=>(<tbody className="ajax_body ui-sortable" ref={provided.innerRef}{...provided.draggableProps}{...provided.dragHandleProps}
                style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>{item.content}</tbody>)}
                </Draggable>))}{null}{provided.placeholder}</table>)}
                </Droppable>
                </DragDropContext>
                <div className={(list.length) ? "no-record no-display" : "no-record"}>
                  {this.state.clinic_No_Record_Found}
                </div>
              </div>
               <div className={this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left" } >
                  <div className="loader-outer">
                    <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                      <div id="modal-confirm-text" className="popup-subtitle">
                        {this.state.clinic_Please_Wait}
                      </div>
                    </div>
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
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  if (state.SettingReducer.action === "CONSENTS_LIST") {
    const returnState = {};
    localStorage.setItem('showLoader', false);
    return {
      consentsList: state.SettingReducer.data
    };
    if (state.SettingReducer.action === "CLINIC_SEARCH") {
      return {
        clinicSearch: state.SettingReducer.data.data
      };
    }
    if (state.SettingReducer.action === "SELECTED_CLINIC_LIST") {
      return {
        clinicSearch: state.SettingReducer
      };
    } else {
      return {};
    }
  } else if (state.SettingReducer.action === "SORT_ORDER_UPDATE") {
    if (state.SettingReducer.data.status == 200) {
      toast.dismiss()
      toast.success(languageData.global[state.SettingReducer.data.message]);
    } else {
      toast.dismiss()
      toast.error(languageData.global[state.SettingReducer.data.message]);
    }
    return {};
  } else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { fetchConsents: fetchConsents, updateSortOrder: updateSortOrder },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Consents);
