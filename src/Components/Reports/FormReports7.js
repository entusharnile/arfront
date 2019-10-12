import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { createReports,getReportTypes,updateReports } from "../../Actions/reportsActions.js";
import { withRouter } from "react-router";
import config from "../../config";
import axios from "axios";
import Select from 'react-select';

const headerInstance = axios.create();

class FormReports7 extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem("userData"));
    const languageData = JSON.parse(localStorage.getItem("languageData"));
    this.state = {
      loadMore: true,
      startFresh: true,
      showLoader: false,
      page: 1,
      pagesize: 15,
      term: "",
      hasMoreItems: true,
      next_page_url: "",
      ReportsTypes:[],
      globalLang: languageData.global,
      reportsLang: languageData.reports,
      showLoadingText: false,
      ReportsDataList: [],
      reportIdData: null,
      firstAccordionClass:'juvly-accordion 1',
      secondAccordionClass:'juvly-accordion 2',
      thirdAccordionClass:'juvly-accordion 3',
      fourthAccordionClass:'juvly-accordion 4',
      accordion:{},
      report_category:'',
      type :null,
      report_name:'',
      defaultOptions1: [],
      options1:null,
      ReportProducts:[],
      selectedOption: null,
      select_Default_Report: [],
      ReportsDataChild:[],
      clinics_array: [],
      AllReportTypes:[],
      report_array:[],
      editType:props.type,
      id:props.match.params.id,
      days:null,
      visited:null,
      unitsOption:[],
      selectedUnitsOptions:[],
      selectedUnitsOptions1:[],
      unitsOption1:[],

    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (
        window.innerHeight + scrollTop ===
          document.documentElement.offsetHeight &&
        this.props.next_page_url != null
      ) {
        this.loadMore();
      }
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  handleSelectChange = (selectedUnitsOptions) => {
    this.setState({
      selectedUnitsOptions: selectedUnitsOptions,
      userChanged:true
    });
  }

  handleSelectChange1 = (selectedUnitsOptions1) => {
    this.setState({
      selectedUnitsOptions1: selectedUnitsOptions1,
      userChanged:true
    });
  }


  componentDidMount() {
    var arr = [];

      for (let i = 1; i <= 10; i++) {
          arr.push({value:i,label:i})
      }

    let formData = {
      params: {
        to_date: this.props.to_date,
        from_date: this.props.from_date,
        page: 1,
        pagesize: this.props.pagesize
      }
    };
    this.setState({
      showLoader: true,
      page: 1,
      pagesize: this.props.pagesize,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      ReportsData: [],
      ReportsTypes:[],
      ReportsDataList: [],
      unitsOption1:arr
    });
    if(this.state.id){
      this.setState({showLoader:true})

    this.props.getReportTypes({},this.state.id);
    }
    else {
      this.setState({showLoader:true})

      this.props.getReportTypes({},0);
    }

  }


  onSort = sortby => {
    let sortorder = this.props.sortorder === "asc" ? "desc" : "asc";
    let formData = {
      params: {
        page: 1,
        pagesize: this.props.pagesize,
        sortby: sortby,
        sortorder: sortorder,
        term: this.props.term
      }
    };
    this.setState({
      page: 1,
      pagesize: this.props.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url: "",
      ReportsData: []
    });
    localStorage.setItem("sortOnly", true);
    this.props.createReports(formData);
  };

  loadMore = () => {
    localStorage.setItem("sortOnly", false);
    this.setState({
      loadMore: true,
      startFresh: true,
      showLoader: false,
      showLoadingText: true
    });
    let formData = {
      params: {
        page: this.props.page,
        pagesize: this.props.pagesize,
        sortorder: this.props.sortorder,
        term: this.props.term,
        action: this.props.action
        //	scopes : this.props.scopes
      }
    };
    this.setState({ showLoader: true });
    //this.props.createReports(formData);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (
      nextProps.ReportTypes != undefined && nextProps.ReportTypes != prevState.ReportsDataChild
    ) {
      returnState.ReportsDataChild = nextProps.ReportTypes;
        returnState.AllReportTypes= nextProps.ReportTypes.data;
        returnState.showLoader=false;
        returnState.report_array=nextProps.ReportTypes.data;

        if (prevState.id) {
          returnState.days = returnState.AllReportTypes.report_details.variable2;
          if (returnState.AllReportTypes.report_details && prevState.selectedUnitsOptions.length === 0) {
            prevState.selectedUnitsOptions.push({value: returnState.AllReportTypes.report_details.variable2, label: returnState.AllReportTypes.report_details.variable2})
          }
          returnState.visited = returnState.AllReportTypes.report_details.variable1;
          if (returnState.AllReportTypes.report_details && prevState.selectedUnitsOptions1.length === 0) {
            prevState.selectedUnitsOptions1.push({value: returnState.AllReportTypes.report_details.variable1, label: returnState.AllReportTypes.report_details.variable1})
          }
        }
       return returnState;
    }
    return null;
  }

  inventoryEdit = (statusId, id) => {
    //localStorage.setItem('userID', id)
    return (
      <div className="no-display">
        //{this.props.history.push(`/inventory/products/categories/${id}/edit`)}
      </div>
    );
  };

  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let report_id='';

    var daysVal= 0;
    if(this.state.selectedUnitsOptions != undefined && this.state.selectedUnitsOptions.length){
      daysVal =  this.state.selectedUnitsOptions[0].value;
}


var visitedVal= 0;
if(this.state.selectedUnitsOptions1 != undefined ){
  visitedVal =  this.state.selectedUnitsOptions1.value;
}
    let formData = {
        report_type: this.props.type,
        report_name: this.props.name,
        report_category: this.props.category,
        visited:visitedVal,
        days: daysVal
    };

    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: this.state.sortorder == "asc" ? "desc" : "asc",
      startFresh: true,
      loadMore: true,
      next_page_url: "",
      ReportsData: []
    });
    this.setState({ showLoader: true, filterValue: "false" });

    if (this.state.id != null) {
          this.props.updateReports(formData, this.state.id);
          this.setState({ showLoader: false});
        } else {
          this.props.createReports(formData);
          this.setState({ showLoader: false});
        }
  };

   showDeleteModal = () => {
    this.setState({ showModal: true });
  };

  dismissModal = () => {
    this.setState({ showModal: false });
  };

  deleteClinic = () => {
    this.setState({ showLoader: true, hideBtns: true });
    this.dismissModal();
  };

  reportData = event => {
    let reportId = event.currentTarget.dataset.href;
    this.setState({ reportIdData: event.currentTarget.dataset.href });
  };
  accordion = (event) =>{
    let  accordionId=event.currentTarget.dataset.href;
    if(accordionId){
      let accordionList = this.props.accordion;
      if(accordionList[accordionId]){
        accordionList[accordionId] = !accordionList[accordionId];
        } else {
          accordionList[accordionId] = true;
        }
    this.setState({accordionList:accordionList})
  }
    this.setState({
      titleClass:'juvly-accordion-title active',
      contentClass:'juvly-accordion-content open'
    })
  }
  handleHideShow=(event)=>{
    let reportCategory=event.currentTarget.dataset.report_category;
    let reportType=event.currentTarget.dataset.id;
    this.setState({
      firstAccordionClass:'juvly-accordion 1 no-display',
      secondAccordionClass:'juvly-accordi;on 2 no-display',
      thirdAccordionClass:'juvly-accordion 3 no-display',
      fourthAccordionClass:'juvly-accordion 4 no-display',
      report_category:reportCategory,
      type :reportType});
  }

  handleChange1 = (selectedOption) => {
    this.setState({
      select_Default_Report: selectedOption,
      selectedOption
    });
  }
  render() {
    let AllReportTypesAll = [];
    let daysOptions=[];
    if (
      this.state.AllReportTypes != undefined &&
      this.state.AllReportTypes.global_days != undefined
    ) {
      for (let key in this.state.AllReportTypes.global_days) {
        let tempArray = {};
        tempArray["key"] = key;
        tempArray["value"] = this.state.AllReportTypes.global_days[key];
        AllReportTypesAll.push(tempArray);
        daysOptions.push(tempArray["value"]);
      }
    }

    let arr = [];

      for (let i = 1; i <= 10; i++) {
          arr.push({value:i,label:i})
      }

    //ReportType7
    var defaultOptions71 = [];
    var options71 = [];

    if (this.state.AllReportTypes != undefined ) {
        this.state.AllReportTypes.clinics.map((obj, idx) => {
              defaultOptions71.push({ value: 1, label: 1 })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.clinics.length > 0) {
        options71 = this.props.AllReportTypes.clinics.map((obj, idx) => {
            return { value: 1, label: 1 }
        })
    }

    let daysOpts = [];
        AllReportTypesAll != undefined &&
          AllReportTypesAll.length > 0 &&
          AllReportTypesAll.map((obj, idx) => {

            daysOpts.push({value:obj.key,label:obj.value})
          })
      return (


                    <div style={{ opacity: "1" }} className="report-question-outer report-filling  fill-report no-padding" data-id={7}>
                      <div className="report-question">Most loyal : Clients who have visited  <span className="empty-place fill1">{this.state.visited}</span> times or more in the last <span className="empty-place fill2" >{this.state.days}</span></div>
                      <div className="report-instruction">{this.state.reportsLang.report_type_select}</div>
                      <div className="row">
                        <div className="custom-select col-sm-6 select1">
                          <input type="text"  className="search-selectbox firstText" autoComplete="off" />
                          {(this.state.unitsOption1) && <Select
                            name="visited"
                            placeholder="Type to search"
                            value={this.state.selectedUnitsOptions1}
                            onChange={this.handleSelectChange1}
                             style={{display:'block'}}

                              options={this.state.unitsOption1}
                              />}

                        </div>
                        <div className="custom-select col-sm-6 select2">
                          <input type="text" className="search-selectbox secondText" autoComplete="off" />
                          {
                             (this.state.unitsOption) && <Select
                                placeholder="Type to Search"
                                name="days"
                                onChange={this.handleSelectChange}
                                style={{display:'block'}}
                                value={this.state.selectedUnitsOptions}
                                isClearable
                                isSearchable
                                options={daysOpts}
                                isMulti={true}
                                />
                             }

                        </div>
                      </div>
                      <input type="hidden" name="report_category" defaultValue="appointment" />
                      <input type="hidden" name="visited" defaultValue="" className="sel_in" />
                      <input type="hidden" name="days" defaultValue="" className="sel_in" />
                      <Link to="/reports" className="report-btn common-btn" id="back_report">
                        {this.state.reportsLang.report_back_button } <i className="fa fa-arrow-left" />
                      </Link>
                      <button className="report-btn common-btn pull-right" onClick={this.handleSubmit} id="saveReport">{this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      <div
                        className={
                          this.state.showLoader
                            ? "new-loader text-left displayBlock full-width"
                            : "new-loader text-left"
                        }
                      >
                        <div className="loader-outer">
                          <img
                            id="loader-outer"
                            src="/images/Eclipse.gif"
                            className="loader-img"
                          />
                          <div id="modal-confirm-text" className="popup-subtitle">
                            {this.state.globalLang.loading_please_wait_text}
                          </div>
                        </div>
                      </div>
                    </div>
    );
  }
}
function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  if (state.ReportsReducer.action === "GET_type S") {
    if (state.ReportsReducer.data.status === 200) {
      return {
        ReportsTypes: state.ReportsReducer.data
      };
    }
  }
else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
  createReports: createReports,
  getReportTypes:getReportTypes,
  updateReports:updateReports }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(FormReports7));
