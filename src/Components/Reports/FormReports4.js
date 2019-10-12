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

class FormReports4 extends Component {
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
      type :null,
      report_name:'',
      defaultOptions: [],
      options:null,
      ReportProducts:[],
      selectedOption: [],
      select_Default_Report: [],
      ReportsDataChild:[],
      clinics_array: [],
      AllReportTypes:[],
      report_array:[],
      editType:props.type,
      id:props.match.params.id

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
      returnState.showLoader = false;

      if(prevState.id){
        returnState.AllReportTypes = nextProps.ReportTypes.data;
      }
      else{
        returnState.AllReportTypes = nextProps.ReportTypes.data;
      }        returnState.report_array=nextProps.ReportTypes.data;
      if (prevState.id) {
        let selectedOption = [];

        if (returnState.AllReportTypes.report_details != undefined) {
          returnState.AllReportTypes.categories.map((obj, idx) => {
            if (
              returnState.AllReportTypes.report_details.variable1.indexOf(",") >
              -1
            ) {
              let productOptions = returnState.AllReportTypes.report_details.variable1.split(
                ","
              );
              productOptions.map((obj1, idx1) => {
                if (obj1 == obj.id) {
                  selectedOption.push(obj);
                }
              });
            } else {
              if (
                returnState.AllReportTypes.report_details.variable1 == obj.id
              ) {
                selectedOption.push(obj);
              }
            }
          });
        }
        returnState.selectedOption = selectedOption;
      }


       return returnState;
    }
    return null;
  }


  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let report_id='';
    var reportVal = [];
    if(this.state.selectedOption != undefined  && this.state.selectedOption.length > 0){
      reportVal = this.state.selectedOption.map((obj, idx) => {
        return  obj.id
      })}

    if(!reportVal.length) {
      if(this.state.report_array.length && this.state.selectedOption != undefined  && this.state.selectedOption.length){
        this.state.selectedOption.map((obj, idx) => {
          if(this.state.report_array.indexOf(obj.id) > -1) {
            reportVal.push(obj.id)
          }
        })
      }
    }
    let formData = {
        report_type: this.props.type,
        report_name: this.props.name,
        report_category: this.props.category,
        product_category:reportVal.join(','),
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
          this.setState({ showLoader: false})
        } else {
          this.props.createReports(formData);
          this.setState({ showLoader: false});
        }

  };

   showDeleteModal = () => {
    this.setState({ showModal: true });
  };returnState

  dismissModal = () => {
    this.setState({ showModal: false });
  };

  deleteClinic = () => {
    this.setState({ showLoader: true, hideBtns: true });
    this.dismissModal();
  };

  handleChange1 = (selectedOption, x) => {
    if(x.action == 'select-option'){
      let selectedProduct =  this.state.selectedOption;
      const allProduct = this.state.AllReportTypes.categories;
      this.state.AllReportTypes.categories.map((obj,idx) => {
        if(obj.id == x.option.value){
          selectedProduct.push(obj);
          this.setState({
            selectedOption: selectedProduct
          });
          return
        }
      });
    } else if(x.action == 'remove-value'){
      let selectedProduct =  this.state.selectedOption;
      let index = selectedProduct.findIndex(y => y.id === x.removedValue.value);
      selectedProduct.splice(index,1);
      this.setState({
        selectedOption: selectedProduct
      });
    }
    }
  render() {
    //ReportType4
    var defaultOptions = [];
    var options = [];
    var categoryOptions=[];
    defaultOptions = [];
    this.state.selectedOption.map((obj, idx) => {

      defaultOptions.push({value: obj.id,  label: obj.category_name})
      categoryOptions.push(obj.category_name);


    })
    if (this.state.AllReportTypes != undefined && this.state.AllReportTypes.categories.length > 0) {

        options = this.state.AllReportTypes.categories.map((obj, idx) => {
            return { value: obj.id, label: obj.category_name }
        })
    }
      return (



                    <div style={{ opacity: "1" }} className="report-question-outer report-filling fill-report no-padding" data-id={4}>
                      <div className="report-question">Top 10 products of  <span className="empty-place fill1">{categoryOptions.join(',')}</span>  category Clinic wise</div>
                      <div className="report-instruction">{this.state.reportsLang.report_type_select}</div>
                      <div className="row">
                        <div className="custom-select col-sm-12 select1">
                          <input type="text" className="search-selectbox firstText" autoComplete="off" />
                          {
                               options && <Select
                               placeholder="Type to search"
                                  onChange={this.handleChange1}
                                  value={defaultOptions}
                                  isClearable
                                  isSearchable
                                  options={options}
                                  isMulti={true}
                                  />
                               }
                        </div>
                      </div>
                      <input type="hiupdateReportsdden" name="report_category" defaultValue="" autoComplete="off" />
                      <input type="hidden" name="product_category" defaultValue="" className="sel_in" />
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
)(withRouter(FormReports4));
