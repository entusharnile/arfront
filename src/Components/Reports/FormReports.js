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

class FormReports extends Component {
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
      defaultOptions11: [],
      defaultOptions12:[],
      defaultOptions21: [],
      defaultOptions22:[],
      defaultOptions31: [],
      defaultOptions41:[],
      defaultOptions51:[],
      defaultOptions52:[],
      defaultOptions61:[],
      defaultOptions71:[],
      defaultOptions72:[],
      defaultOptions81:[],
      defaultOptions91:[],
      defaultOptions101:[],
      defaultOptions102:[],
      options11:null,
      options12:null,
      options21:null,
      options22:null,
      options31:null,
      options41:null,
      options51:null,
      options52:null,
      options61:null,
      options71:null,
      options72:null,
      options81:null,
      options91:null,
      options101:null,
      options102:null,
      ReportProducts:[],
      selectedOption: null,
      select_Default_Report: [],
      ReportsDataChild:[],
      clinics_array: [],
      AllReportTypes:[],
      report_array:[]

    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
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

  componentDidMount() {
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
      ReportsDataList: []
    });
    let id = this.props.reportIdData;
      this.props.getReportTypes({},0);
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

  handleSubmit1 = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let report_id='';
    let formData = {
        report_type: this.state.report_type,
        report_name: this.state.report_name,
        report_category: this.state.report_category
    };
    if(this.props.type == 1){
    formData.product_id=3296;
    formData.days=7}

    if(this.props.type == 2){
    formData.product_id=3896;
    formData.product_id_not=4567
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

    this.props.createReports(formData);

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

    //ReportType1
    var defaultOptions11 = [];
    var defaultOptions12 = [];
    var options11 = [];
    var options12 = [];

    if (this.state.report_array != undefined && this.state.report_array.length != undefined  &&
      this.state.AllReportTypes != undefined && this.state.AllReportTypes.products.length >0 ) {
        this.state.AllReportTypes.products.map((obj, idx) => {

          if(this.state.report_array.indexOf(obj.id) > -1) {
            defaultOptions11.push({value: obj.id,  label: obj.product_name})
          }

        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.length > 0) {
        options11 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.product_name }
        })
    }

    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.global_days != undefined  && this.state.AllReportTypes.products.length >0 ) {
        this.state.AllReportTypes.products.map((obj, idx) => {
              defaultOptions12.push({ value: obj.id, label: obj.product_name })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.length > 0) {
        options12 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.product_name }
        })
    }

    //ReportType2
    var defaultOptions21 = [];
    var defaultOptions22 = [];
    var options21 = [];
    var options22 = [];

    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.products != undefined  && this.state.AllReportTypes.products.length >0 ) {
        this.state.AllReportTypes.products.map((obj, idx) => {
              defaultOptions21.push({ value: obj.id, label: obj.product_name })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.length > 0) {
        options21 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.product_name }
        })
    }
    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.global_days != undefined  && this.state.AllReportTypes.products.length >0 ) {
        this.state.AllReportTypes.products.map((obj, idx) => {
              defaultOptions22.push({ value: obj.id, label: obj.product_name })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.length > 0) {
        options22 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.product_name }
        })
    }
    //ReportType3
    var defaultOptions31 = [];
    var options31 = [];

    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.free_services != undefined  && this.state.AllReportTypes.free_services.length >0 ) {
        this.state.AllReportTypes.free_services.map((obj, idx) => {
              defaultOptions31.push({ value: obj.id, label: obj.name })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.free_services.length > 0) {
        options31 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.name }
        })
    }
    //ReportType4
    var defaultOptions41 = [];
    var options41 = [];

    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.clinics != undefined  && this.state.AllReportTypes.clinics.length >0 ) {
        this.state.AllReportTypes.clinics.map((obj, idx) => {
              defaultOptions41.push({ value: obj.id, label: obj.clinic_name })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.clinics.length > 0) {
        options41 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.clinic_name }
        })
    }
    //ReportType5
    var defaultOptions51 = [];
    var options51 = [];
    var defaultOptions52 =[];
    var options52 =[];

    if (this.state.AllReportTypes != undefined ) {
        this.state.AllReportTypes.clinics.map((obj, idx) => {
              defaultOptions51.push({ value: 1, label: 1 })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.clinics.length > 0) {
        options51 = this.props.AllReportTypes.clinics.map((obj, idx) => {
            return { value: 1, label: 1 }
        })
    }
    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.clinics != undefined  && this.state.AllReportTypes.clinics.length >0 ) {
        this.state.AllReportTypes.clinics.map((obj, idx) => {
              defaultOptions52.push({ value: obj.id, label: obj.clinic_name })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.clinics.length > 0) {
        options52 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.clinic_name }
        })
    }
    //ReportType6
    var defaultOptions61 = [];
    var options61 = [];

    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.global_days != undefined  && this.state.AllReportTypes.global_days.length >0 ) {
        this.state.AllReportTypes.global_days.map((obj, idx) => {
              defaultOptions61.push({ value: obj.id, label: '1' })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.global_days.length > 0) {
        options61 = this.props.AllReportTypes.map((obj, idx) => {
            return { value: obj.id, label: obj.clinic_name }
        })
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
    //ReportType8
    var defaultOptions81 = [];
    var options81 = [];

    if (this.state.AllReportTypes != undefined ) {
        this.state.AllReportTypes.clinics.map((obj, idx) => {
              defaultOptions81.push({ value: 1, label: 1 })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.clinics.length > 0) {
        options81 = this.props.AllReportTypes.clinics.map((obj, idx) => {
            return { value: 1, label: 1 }
        })
    }
    //ReportType9
    var defaultOptions91 = [];
    var options91 = [];

    if (this.state.AllReportTypes != undefined ) {
        this.state.AllReportTypes.clinics.map((obj, idx) => {
              defaultOptions91.push({ value: 1, label: 1 })
        })
    }

    if (this.props.AllReportTypes != undefined && this.props.AllReportTypes.clinics.length > 0) {
        options91 = this.props.AllReportTypes.clinics.map((obj, idx) => {
            return { value: 1, label: 1 }
        })
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


            <div id="content">
              <div className="container-fluid content setting-wrapper">
                <div className="row">
                  <div className="col-sm-12">
                    <div className="merge-setion">

                    {this.props.type  == 1 ?
                      <div className="report-question-outer report-filling fill-report" data-id={2}>
                      <div className="report-question">{this.state.reportsLang.report_received}  <span className="empty-place fill1" />  {this.state.reportsLang.report_treatment_in}  <span className="empty-place fill2" /> {this.state.reportsLang.report_days}</div>
                      <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                      <div className="row">
                        <div className="col-sm-12">
                          <div className="choice report-choice">
                          {
                               options11 && <Select
                                  onChange={this.handleChange1}
                                  value={defaultOptions11}
                                  isClearable
                                  isSearchable
                                  options={options11}
                                  isMulti={true}
                                  />
                               }
                          </div>
                        </div>
                        <div className="col-sm-12">
                          <div className="choice report-choice">
                          {
                               options12 && <Select
                                  onChange={this.handleChange1}
                                  value={defaultOptions12}
                                  isClearable
                                  isSearchable
                                  options={options12}
                                  isMulti={true}
                                  />
                               }
                          </div>
                        </div>
                      </div>
                      <input type="hidden" name="report_category" defaultValue="service" />
                      <input type="hidden" id="hidden_productsIn" name="product_id" defaultValue="" className="sel_in" />
                      <input type="hidden" id="hidden_productsNot" name="product_id_not" defaultValue="" className="sel_in" />
                      <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                      <button className="report-btn common-btn pull-right" onClick={this.handleSubmit1} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                    </div>

                      : ''}
                      {this.props.type  == 2 ?
                        <div className="report-question-outer report-filling fill-report" data-id={2}>
                        <div className="report-question">{this.state.reportsLang.report_people_who_received}  <span className="empty-place fill1" />  {this.state.reportsLang.report_treatment_but_not}  <span className="empty-place fill2" /> {this.state.reportsLang.report_treatment}</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="col-sm-12">
                            <div className="choice report-choice">
                            {
                                 options21 && <Select
                                    onChange={this.handleChange1}
                                    value={defaultOptions21}
                                    isClearable
                                    isSearchable
                                    options={options21}
                                    isMulti={true}
                                    />
                                 }
                            </div>
                          </div>
                          <div className="col-sm-12">
                            <div className="choice report-choice">


                            </div>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="service" />
                        <input type="hidden" id="hidden_productsIn" name="product_id" defaultValue="" className="sel_in" />
                        <input type="hidden" id="hidden_productsNot" name="product_id_not" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit2} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>

                      :''}
                      {this.props.type   == 3 ?
                        <div className="report-question-outer report-filling fill-report fill-report" data-id={3}>
                        <div className="report-question">People who booked free consultation but never purchased anything <span className="empty-place fill1" /></div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            {
                                 options31 && <Select
                                    onChange={this.handleChange1}
                                    value={defaultOptions31}
                                    isClearable
                                    isSearchable
                                    options={options31}
                                    isMulti={true}
                                    />
                                 }
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="service" />
                        <input type="hidden" name="free_service" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit3} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>
                      :''}
                      {this.props.type   == 4 ?
                      <div className="report-question-outer report-filling fill-report" data-id={4}>
                        <div className="report-question">Top 10 products of  <span className="empty-place fill1" />  category Clinic wise</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            {
                                 options41 && <Select
                                    onChange={this.handleChange1}
                                    value={defaultOptions41}
                                    isClearable
                                    isSearchable
                                    options={options41}
                                    isMulti={true}
                                    />
                                 }
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="service" />
                        <input type="hidden" name="product_category" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit4} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type ==  5 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={5}>
                        <div className="report-question">People who used at least <span className="empty-place fill1" />  units of <span className="empty-place fill2" /> product in any procedure</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-6 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            {
                                 options51 && <Select
                                    onChange={this.handleChange1}
                                    value={defaultOptions51}
                                    isClearable
                                    isSearchable
                                    options={options51}
                                    isMulti={true}
                                    />
                                 }
                          </div>
                          <div className="custom-select col-sm-6 select2">
                            <input type="text" className="search-selectbox secondText" autoComplete="off" placeholder="Type to search" />
                            {
                                 options52 && <Select
                                    onChange={this.handleChange1}
                                    value={defaultOptions52}
                                    isClearable
                                    isSearchable
                                    options={options52}
                                    isMulti={true}
                                    />
                                 }
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="service" />
                        <input type="hidden" name="units" defaultValue="" className="sel_in" />
                        <input type="hidden" name="product_id" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit5} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 6 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={6}>
                        <div className="report-question">Clients who have not visited in  <span className="empty-place fill1" /> days</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          &lt;
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            <select name="days" className="report-fill-box">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="appointment" />
                        <input type="hidden" name="days" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit6} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 7 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={7}>
                        <div className="report-question">Most loyal : Clients who have visited  <span className="empty-place fill1" />  times or more in the last <span className="empty-place fill2" /></div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-6 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            <select name="visited" className="report-fill-box">
                            </select>
                          </div>
                          <div className="custom-select col-sm-6 select2">
                            <input type="text" className="search-selectbox secondText" autoComplete="off" placeholder="Type to search" />
                            <select name="days" className="report-fill-box">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="appointment" />
                        <input type="hidden" name="visited" defaultValue="" className="sel_in" />
                        <input type="hidden" name="days" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit7} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 8 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={8}>
                        <div className="report-question">Top cancelers : Clients who have canceled booked appointments more than  <span className="empty-place fill1" /> times</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            <select name="canceled" className="report-fill-box">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="appointment" />
                        <input type="hidden" name="canceled" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit8} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 9 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={9}>
                        <div className="report-question">Top no showers : Clients who have no showed more than <span className="empty-place fill1" /> times</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            <select name="noshow" className="report-fill-box">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="appointment" />
                        <input type="hidden" name="noshow" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit9} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 10 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={10}>
                        <div className="report-question">Clients have booked <span className="empty-place fill1" />  service in the last  <span className="empty-place fill2" /></div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            <select name="service_id" className="report-fill-selectbox">
                            </select>
                          </div>
                          <div className="custom-select col-sm-3 select2">
                            <input type="text" className="search-selectbox secondText" autoComplete="off" placeholder="Type to search" />
                            <select name="days" className="report-fill-box">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="appointment" />
                        <input type="hidden" name="service_id" defaultValue="" className="sel_in" />
                        <input type="hidden" name="days" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit10} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 11 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={11}>
                        <div className="report-question">Average days between booking  <span className="empty-place fill1" /> service and the actual appointment date</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            <select name="service_id" className="report-fill-selectbox">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="appointment" />
                        <input type="hidden" name="service_id" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit11} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 12 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={12}>
                        <div className="report-question">What days of the week is the following  <span className="empty-place fill1" /> service booked more times (Mon - Sunday scale) </div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            <select name="service_id" className="report-fill-selectbox">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="appointment" />
                        <input type="hidden" name="service_id" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit12} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 13 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={13}>
                        <div className="report-question">High spenders : Clients who have spent more than  <span className="empty-place number_class" /> Dollars in  the last <span className="empty-place fill2" /><span className="p_date"> days</span></div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <input type="text" name="dollar" className="report-input input_number" defaultValue="" autoComplete="off" placeholder="Dollar" />
                          <div className="custom-select col-sm-6 select1">
                            <input type="text" className="search-selectbox firstText" autoComplete="off" placeholder="Type to search" />
                            <select name="date_selecter" className="report-fill-box date_selecter">
                              <option>Select</option>

                            </select>
                          </div>
                          <div className="custom-select col-sm-6 select2 Days">
                            <input type="text" className="search-selectbox secondText Days" autoComplete="off" placeholder="Type to search" />
                            <select name="days" className="report-fill-box">
                            </select>
                          </div>
                          <div className="custom-select col-sm-6 select2 Months">
                            <input type="text" className="search-selectbox secondText Months" autoComplete="off" placeholder="Type to search" />
                            <select name="months" className="report-fill-box ">
                            </select>
                          </div>
                          <div className="custom-select col-sm-6 select2 Years">
                            <input type="text" className="search-selectbox secondText Years" autoComplete="off" placeholder="Type to search" />
                            <select name="years" className="report-fill-box ">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="client" />
                        <input type="hidden" name="days" defaultValue="" className="sel_in" />
                        <input type="hidden" name="months" defaultValue="" className="sel_in" />
                        <input type="hidden" name="years" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit13} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 14 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={14}>
                        <div className="report-question">Top complainers : Clients who have received more than  <span className="empty-place number_class" />  no of refunds in <span className="empty-place fill2" /> <span className="p_date">days</span></div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <input type="text" name="refund" className="report-input input_number" defaultValue="" autoComplete="off" placeholder="Refund count" />
                          <div className="custom-select col-sm-6 select1">
                            <input type="text" className="search-selectbox firstText" placeholder="Type to search" autoComplete="off" />
                            <select name="date_selecter" className="report-fill-box date_selecter">
                              <option>Select</option>
                            </select>
                          </div>
                          <div className="custom-select col-sm-6 select2 Days">
                            <input type="text" className="search-selectbox secondText Days" placeholder="Type to search" autoComplete="off" />
                            <select name="days" className="report-fill-box ">
                            </select>
                          </div>
                          <div className="custom-select col-sm-6 select2 Months">
                            <input type="text" className="search-selectbox secondText Months" placeholder="Type to search" autoComplete="off" />
                            <select name="months" className="report-fill-box ">
                            </select>
                          </div>
                          <div className="custom-select col-sm-6 select2 Years">
                            <input type="text" className="search-selectbox secondText Years" placeholder="Type to search" autoComplete="off" />
                            <select name="years" className="report-fill-box ">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="client" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit14} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 15 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={15}>
                        <input type="hidden" name="report_category" defaultValue="client" />
                        <div className="report-question">All men over  <span className="empty-place number_class" /> years of age</div>
                        <div className="report-instruction">(Please fill report input option below)</div>
                        <div className="row">
                          <input type="text" name="age" className="report-input input_number" placeholder="age" defaultValue="" autoComplete="off" />
                        </div>
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit15} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 16 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={16}>
                        <input type="hidden" name="report_category" defaultValue="client" />
                        <div className="report-question">All women over  <span className="empty-place number_class" /> years of age</div>
                        <div className="report-instruction">(Please fill report input option below)</div>
                        <div className="row">
                          <input type="text" name="age" className="report-input input_number" placeholder="age" defaultValue="" autoComplete="off" />
                        </div>
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit16} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 17 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={17}>
                        <div className="report-question">Clients who have referral source <span className="empty-place fill1" /></div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" placeholder="Type to search" autoComplete="off" />
                            <select name="referral_source" className="report-fill-selectbox">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="client" />
                        <input type="hidden" name="referral_source" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit17} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 18 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={18}>
                        <div className="report-question">Average sale per <span className="empty-place fill1" /> provider</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" placeholder="Type to search" autoComplete="off" />
                            <select name="provider_id" className="report-fill-selectbox">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="provider" />
                        <input type="hidden" name="provider_id" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit18} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                      {this.props.type   == 19 ?
                      <div className="report-question-outer report-filling  fill-report" data-id={19}>
                        <div className="report-question">Total no of appointment hours worked  <span className="empty-place fill1" />  provider per month</div>
                        <div className="report-instruction">({this.state.reportsLang.report_please_select_report_input_options_below})</div>
                        <div className="row">
                          <div className="custom-select col-sm-12 select1">
                            <input type="text" className="search-selectbox firstText" placeholder="Type to search" autoComplete="off" />
                            <select name="provider_id" className="report-fill-selectbox">
                            </select>
                          </div>
                        </div>
                        <input type="hidden" name="report_category" defaultValue="provider" />
                        <input type="hidden" name="provider_id" defaultValue="" className="sel_in" />
                        <button className="report-btn common-btn" id="back_report">{this.state.reportsLang.report_back_button} <i className="fa fa-arrow-left"></i></button>
                        <button className="report-btn common-btn pull-right" onClick={this.handleSubmit19} id="saveReport">  {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check"></i></button>
                      </div>:''}
                    </div>
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
  getReportTypes:getReportTypes }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(FormReports));
