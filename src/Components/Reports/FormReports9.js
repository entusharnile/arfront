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

class FormReports9 extends Component {
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
      noshow:null,
      editType:props.type,
      id:props.match.params.id,
      unitsOption:[],
      selectedUnitsOptions:[]

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

handleSelectChange =(selectedUnitsOptions) =>{
  this.setState({
    selectedUnitsOptions:selectedUnitsOptions
  })
}
  componentDidMount() {

    var unitsArr=[];
    for(let i=1;i<=10;i++){
      unitsArr.push({value:i,label:i})

    }
    unitsArr.push({value:"above10",label:"Above 10"})

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
      unitsOption:unitsArr
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



  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (
      nextProps.ReportTypes != undefined && nextProps.ReportTypes != prevState.ReportsDataChild
    ) {
      returnState.ReportsDataChild = nextProps.ReportTypes;
        returnState.AllReportTypes= nextProps.ReportTypes.data;
        returnState.showLoader=false;
        returnState.report_array=nextProps.ReportTypes.data;
if(prevState.id){
          returnState.noshow=returnState.AllReportTypes.report_details.variable1;
          if (returnState.AllReportTypes.report_details && prevState.selectedUnitsOptions.length === 0) {
            prevState.selectedUnitsOptions.push({value: returnState.AllReportTypes.report_details.variable1, label: returnState.AllReportTypes.report_details.variable1})
          }
        }

       return returnState;
    }
    return null;
  }


  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);

    var noshowVal=0;
    if(this.state.selectedUnitsOptions != undefined && this.state.selectedUnitsOptions.length){
      noshowVal=this.state.selectedUnitsOptions[0].value;
    }

    let report_id='';
    let formData = {
        report_type: this.props.type,
        report_name: this.props.name,
        report_category: this.props.category,
        noshow:noshowVal
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


  render() {
          return (
                    <div style={{ opacity: "1" }} className="report-question-outer report-filling  fill-report no-padding" data-id={9}>
                      <div className="report-question">Top no showers : Clients who have no showed more than <span className="empty-place fill1">{this.state.noshow}</span> times</div>
                      <div className="report-instruction">{this.state.reportsLang.report_type_select}</div>
                      <div className="row">
                        <div className="custom-select col-sm-12 select1">
                          <input type="text" className="search-selectbox firstText" autoComplete="off" />
                          {
                                (this.state.unitsOption) && <Select
                                placeholder="Type to search"
                                name="noshow"
                                onChange={this.handleSelectChange}
                                style={{display:'block'}}
                                value={this.state.selectedUnitsOptions}
                                isClearable
                                isSearchable
                                options={this.state.unitsOption}
                                isMulti={true}
                                />
                            }
                        </div>
                      </div>
                      <input type="hidden" name="report_category" defaultValue="appointment" />
                      <input type="hidden" name="noshow" defaultValue="" className="sel_in" />
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
)(withRouter(FormReports9));
