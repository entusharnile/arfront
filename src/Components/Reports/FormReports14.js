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

class FormReports14 extends Component {
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
      refund:null,
      daysClass:"custom-select col-sm-6 select2 Days",
      monthsClass:"custom-select col-sm-6 select2 Months no-display",
      yearsClass:"custom-select col-sm-6 select2 Years no-display",
      editType:props.type,
      id:props.match.params.id,
      months:null,
      years:null,
      days:null,
      date_selecter:'',
      wholeOptions:[],
      selectedAllOptions:[],
      selectedDaysOptions:[],
      selectedMonthsOptions:[],
      selectedYearsOptions:[],
      daysOptions:[],
      monthsOptions:[],
      yearsOptions:[],
      userChanged:false,
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
    if (value == "days"){
      this.setState({
        daysClass:"custom-select col-sm-6 select2 Days",
        monthsClass:"custom-select col-sm-6 select2 Months no-display",
        yearsClass:"custom-select col-sm-6 select2 Years no-display"
      })
    }
    else if (value == "months"){
      this.setState({
        monthsClass:"custom-select col-sm-6 select2 Months",
        daysClass:"custom-select col-sm-6 select2 Days no-display",
        yearsClass:"custom-select col-sm-6 select2 Years no-display"
      })
    }
    else if (value == "years"){
      this.setState({
        yearsClass:"custom-select col-sm-6 select2 Years",
        monthsClass:"custom-select col-sm-6 select2 Months no-display",
        daysClass:"custom-select col-sm-6 select2 Days no-display",
      })
    }
    this.setState({
      [event.target.name]: value
    });
  };
  handleSelectChange=(selectedAllOptions) =>{
    this.setState({
      selectedAllOptions:selectedAllOptions,
      userChanged:true
        })
        if (selectedAllOptions.value == "days"){
          this.setState({
            daysClass:"custom-select col-sm-6 select2 Days",
            monthsClass:"custom-select col-sm-6 select2 Months no-display",
            yearsClass:"custom-select col-sm-6 select2 Years no-display"
          })
        }
        else if (selectedAllOptions.value == "months"){
          this.setState({
            monthsClass:"custom-select col-sm-6 select2 Months",
            daysClass:"custom-select col-sm-6 select2 Days no-display",
            yearsClass:"custom-select col-sm-6 select2 Years no-display"
          })
        }
        else if (selectedAllOptions.value == "years"){
          this.setState({
            yearsClass:"custom-select col-sm-6 select2 Years",
            monthsClass:"custom-select col-sm-6 select2 Months no-display",
            daysClass:"custom-select col-sm-6 select2 Days no-display",
          })
      }
      }
    handleDaysChange=(selectedDaysOptions) =>{
      this.setState({
        selectedDaysOptions:selectedDaysOptions,
        userChanged:true
      })
    }
    handleMonthsChange=(selectedMonthsOptions) =>{
      this.setState({
        selectedMonthsOptions:selectedMonthsOptions,
        userChanged:true
      })
    }
    handleYearsChange=(selectedYearsOptions) =>{
      this.setState({
        selectedYearsOptions:selectedYearsOptions,
        userChanged:true
      })
    }
  componentDidMount() {
    let  wholeArr=[];

    wholeArr.push({value:"days",label:"Days"});
    wholeArr.push({value:"months",label:"Months"});
    wholeArr.push({value:"years",label:"Years"});

    var daysArr = [];

    for (let i = 1; i <= 30; i++) {
        daysArr.push({value:i, label:i})
    }

    var monthsArr = [];

    for (let i = 1; i <= 12; i++) {
        monthsArr.push({value:i, label:i})
    }

    var yearsArr = [];

    for (let i = 1; i <= 5; i++) {
        yearsArr.push({value:i, label:i})
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
      wholeOptions:wholeArr,
      daysOptions:daysArr,
      monthsOptions:monthsArr,
      yearsOptions:yearsArr,
    });
    if(this.state.id){
      this.setState({showLoader:true})

      this.props.getReportTypes({},this.state.id);
    }
      else{
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
        returnState.report_array=nextProps.ReportTypes.data;

        returnState.showLoader=false;
       return returnState;
    }
    // if(prevState.id){
    //   returnState.refund=(prevState.userChanged)? prevState.selectedUnitsOptions : returnState.AllReportTypes.data.report_details.variable1;
    //
    //    returnState.date_selecter=(prevState.userChanged)? prevState.selectedUnitsOptions : returnState.AllReportTypes.report_details.variable2;
    //
    //    return returnState;
    // }

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
var daysVal=0;
if(this.state.selectedDaysOptions!= undefined){

daysVal=this.state.selectedDaysOptions.value
}

var monthsVal=0;
if(this.state.selectedMonthsOptions!= undefined){

monthsVal=this.state.selectedMonthsOptions.value
}

var yearsVal=0;
if(this.state.selectedYearsOptions!= undefined){
yearsVal=this.state.selectedYearsOptions.value
}

    let formData = {
        report_type: this.props.type,
        report_name: this.props.name,
        report_category: this.props.category,
        refund:this.state.refund
    };
    if(this.state.selectedAllOptions.value == 'days'){
    formData.days=daysVal;
  }

  else  if(this.state.selectedAllOptions.value == 'months'){
    formData.months=monthsVal;
  }
else  if(this.state.selectedAllOptions.value == 'years'){
  formData.years=yearsVal;
}
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
  DaysClassDisplay =()=>{
    this.setState({
      monthsClass:"custom-select col-sm-6 select2 Months no-display",
      yearsClass:"custom-select col-sm-6 select2 Days no-display"
    })
  }
  buildOptionsDays=()=> {

      var arr = [];

      for (let i = 1; i <= 30; i++) {
          arr.push(<option key={i} value={i}>{i}</option>)
      }

      return arr;
  }
  buildOptionsMonths=()=> {
      var arr = [];

      for (let i = 1; i <= 12; i++) {
          arr.push(<option key={i} value={i}>{i}</option>)
      }

      return arr;
  }
  buildOptionsYears=()=> {
      var arr = [];

      for (let i = 1; i <= 5; i++) {
          arr.push(<option key={i} value={i}>{i}</option>)
      }

      return arr;
  }

  render() {


    let  wholeArr=[];

    wholeArr.push({value:"days",label:"Days"});
    wholeArr.push({value:"months",label:"Months"});
    wholeArr.push({value:"years",label:"Years"});


    var daysArr = [];

    for (let i = 1; i <= 30; i++) {
        daysArr.push({value:i, label:i})
    }

    var monthsArr = [];

    for (let i = 1; i <= 1; i++) {
        monthsArr.push({value:i, label:i})
    }

    var yearsArr = [];

    for (let i = 1; i <= 5; i++) {
        yearsArr.push({value:i, label:i})
    }

    //ReportType10
    var defaultOptions101 = [];
    var options101 = [];

    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.services != undefined  && this.state.AllReportTypes.services.length >0 ) {
        this.state.AllReportTypes.services.map((obj, idx) => {
              defaultOptions101.push({ value: obj.id, label: obj.name })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.services.length > 0) {
        options101 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.name }
        })
    }
      return (
        <div style={{ opacity: "1" }} className="report-question-outer report-filling  fill-report no-padding" data-id={13}>
          <div className="report-question">Top complainers : Clients who have received more than  <span className="empty-place number_class" />  no of refunds in <span className="empty-place fill2" /> <span className="p_date">days</span></div>
            <div className="report-instruction">
                    {this.state.reportsLang.report_type_select}
                    </div>

                    <input type="text" name="refund" className="report-input input_number" onChange={this.handleInputChange} defaultValue={this.state.refund} autoComplete="off" placeholder="Refund count" />
                      <div className="row">
                        <div className="custom-select col-sm-6 select1">
                          <input type="text" className="search-selectbox firstText" autoComplete="off" />
                          {(this.state.wholeOptions) && <Select
                            placeholder="Type to search"
                            name="date_selecter"
                            onChange={this.handleSelectChange}
                            value={this.state.selectedAllOptions}
                            style={{display:'block'}}
                            options={this.state.wholeOptions}
      				/>
            }
                        </div>
                        <div className={this.state.daysClass}>
                          <input type="text" className="search-selectbox secondText Days" autoComplete="off" />
                          {(this.state.daysOptions) && <Select name="days"
                            placeholder="Type to search"
                          onChange={this.handleDaysChange}
                           value={this.state.selectedDaysOptions}
                           style={{display:'block'}}
                           options={this.state.daysOptions}
                           />}
                        </div>
                        <div className={this.state.monthsClass} >
                          <input type="text" className="search-selectbox secondText Months" autoComplete="off" />
                          {(this.state.monthsOptions) && <Select name="months"
                          onChange={this.handleMonthsChange}
                           value={this.state.selectedMonthsOptions}
                           style={{display:'block'}}
                           options={this.state.monthsOptions}
                           />}
                        </div>
                        <div className={this.state.yearsClass}  >
                          <input type="text" className="search-selectbox secondText Years" autoComplete="off" />
                          {this.state.yearsOptions && <Select name="years"
                            onChange={this.handleYearsChange}
                           value={this.state.selectedYearsOptions}
                           style={{display:'block'}}
                           options={this.state.yearsOptions}
                           />}
                        </div>
                      </div>
                      <input type="hidden" name="report_category" defaultValue="client" />
                      <input type="hidden" name="days" defaultValue="" className="sel_in" />
                      <input type="hidden" name="months" defaultValue="" className="sel_in" />
                      <input type="hidden" name="years" defaultValue="" className="sel_in" />
                      <Link to="/reports" className="report-btn common-btn" id="back_report">
                        {this.state.reportsLang.report_back_button } <i className="fa fa-arrow-left" />
                      </Link>
                      <button className="report-btn common-btn pull-right" onClick={this.handleSubmit} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
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
)(withRouter(FormReports14));
