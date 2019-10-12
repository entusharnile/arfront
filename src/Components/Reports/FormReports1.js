import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  createReports,
  getReportTypes,
  updateReports
} from "../../Actions/reportsActions.js";
import { withRouter } from "react-router";
import config from "../../config";
import axios from "axios";
import Select from "react-select";

const headerInstance = axios.create();

class FormReports1 extends Component {
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
      ReportsTypes: [],
      globalLang: languageData.global,
      reportsLang: languageData.reports,
      showLoadingText: false,
      ReportsDataList: [],
      reportIdData: null,
      firstAccordionClass: "juvly-accordion 1",
      secondAccordionClass: "juvly-accordion 2",
      thirdAccordionClass: "juvly-accordion 3",
      fourthAccordionClass: "juvly-accordion 4",
      accordion: {},
      type: null,
      report_name: "",
      defaultOptions1: [],
      options1: null,
      ReportProducts: [],
      selectedOption: [],
      select_Default_Report: [],
      ReportsDataChild: [],
      clinics_array: [],
      AllReportTypes: [],
      report_array: [],
      product_id: null,
      product_id_not: null,
      defaultOptions11: [],
      defaultOptions12: [],
      options11: null,
      options12: null,
      defaultEditOptions11: [],
      defaultEditOptions12: [],
      optionsEdit11: null,
      optionsEdit12: null,
      userChanged: false,
      days: null,
      reportTypesAll: [],
      editType: props.type,
      id: props.match.params.id,
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

  handleSelectChange = (selectedUnitsOptions) => {
    this.setState({
      selectedUnitsOptions: selectedUnitsOptions,
      userChanged:true
    });
  }

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
      page: 1,
      pagesize: this.props.pagesize,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      ReportsData: [],
      ReportsTypes: [],
      ReportsDataList: [],

    });
    if (this.state.id != null) {
      this.setState({showLoader:true})

      this.props.getReportTypes({}, this.state.id);
    } else {
      this.setState({showLoader:true})

      this.props.getReportTypes({}, 0);

    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};

    if (
      nextProps.ReportTypes != undefined &&
      nextProps.ReportTypes != prevState.ReportsDataChild
    ) {
      returnState.ReportsDataChild = nextProps.ReportTypes;
      returnState.showLoader = false;
      if (prevState.id) {
        returnState.AllReportTypes = nextProps.ReportTypes;
      } else {
        returnState.AllReportTypes = nextProps.ReportTypes.data;
        returnState.showLoader = false;
      }
      returnState.report_array = prevState.userChanged
        ? prevState.report_array
        : nextProps.ReportTypes.data;
        returnState.showLoader = false;
      //returnState.report_category =returnState.AllReportTypes.report_details.report_category;

      if (prevState.id) {
        let selectedOption = [];

        if (returnState.AllReportTypes.report_details != undefined) {
          returnState.AllReportTypes.products.map((obj, idx) => {
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
      if (prevState.id) {
        let report_type = "";
        if (returnState.AllReportTypes.report_details !== undefined) {
          report_type = returnState.AllReportTypes.report_details.report_type;
        }
        returnState.report_type = report_type;

      }
      if (prevState.id) {
        let reportTypesAll = [];
        var daysVal= 0;
        if(prevState.selectedUnitsOptions != undefined && prevState.selectedUnitsOptions.length){

        daysVal =  prevState.selectedUnitsOptions[0].value;
      }
        returnState.days = (prevState.userChanged)? daysVal : returnState.AllReportTypes.report_details.variable2;
        if (returnState.AllReportTypes.report_details && prevState.selectedUnitsOptions.length === 0) {
          prevState.selectedUnitsOptions.push({value: returnState.AllReportTypes.report_details.variable2, label: returnState.AllReportTypes.report_details.variable2})
        }

        for (let key in returnState.AllReportTypes.global_days) {
          if ((key = returnState.AllReportTypes.report_details.variable2)) {
              reportTypesAll.push(returnState.AllReportTypes.global_days[key]);
          }
        }
        returnState.reportTypesAll = reportTypesAll;
      }
      else{
            let reportTypesAll = [];
            returnState.reportTypesAll != undefined &&
            returnState.reportTypesAll.length > 0 &&
            returnState.reportTypesAll.map((obj, idx) => {
            returnState.reportTypesAll.push({value:obj.key,label:obj.value})
            })

      }

      return returnState;
    }
    return null;
  }

  handleSubmit = event => {
    event.preventDefault();



    localStorage.setItem("sortOnly", true);
    let report_id = "";
    var reportVal = [];
    if (
      this.state.selectedOption != undefined &&
      this.state.selectedOption.length > 0
    ) {
      reportVal = this.state.selectedOption.map((obj, idx) => {
        return obj.id;
      });
    }

    if (!reportVal.length) {
      if (
        this.state.report_array.length &&
        this.state.selectedOption != undefined &&
        this.state.selectedOption.length
      ) {
        this.state.selectedOption.map((obj, idx) => {
          if (this.state.selectedOption.indexOf(obj.id) > -1) {
            reportVal.push(obj.id);
          }
        });
      }
    }
    var daysVal= 0;
    if(this.state.selectedUnitsOptions != undefined && this.state.selectedUnitsOptions.length){


      daysVal =  this.state.selectedUnitsOptions[0].value;


}

    let formData = {
      report_type: this.props.type,
      report_name: this.props.name,
      report_category: this.props.category,
      product_id: reportVal.join(","),
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
      this.setState({ showLoader: false})

    } else {
      this.props.createReports(formData);
      this.setState({ showLoader: false})
    }
  };

  handleChange1 = (selectedOption, x) => {
    if (x.action == "select-option") {
      let selectedProduct = this.state.selectedOption;
      const allProduct = this.state.AllReportTypes.products;
      this.state.AllReportTypes.products.map((obj, idx) => {
        if (obj.id == x.option.value) {
          selectedProduct.push(obj);
          this.setState({
            selectedOption: selectedProduct
          });
          return;
        }
      });
    } else if (x.action == "remove-value") {
      let selectedProduct = this.state.selectedOption;
      let index = selectedProduct.findIndex(y => y.id === x.removedValue.value);
      selectedProduct.splice(index, 1);
      this.setState({
        selectedOption: selectedProduct
      });
    }
  };
  handleChange2 = (selectedOption, x) => {
    if (x.action == "select-option") {
      let selectedProduct = this.state.selectedOption;
      const allProduct = this.state.AllReportTypes.report_details;
      this.state.AllReportTypes.report_details.map((obj, idx) => {
        if (obj.id == x.option.value) {
          selectedProduct.push(obj);
          this.setState({
            selectedOption: selectedProduct
          });
          return;
        }
      });
    } else if (x.action == "remove-value") {
      let selectedProduct = this.state.selectedOption;
      let index = selectedProduct.findIndex(y => y.id === x.removedValue.value);
      selectedProduct.splice(index, 1);
      this.setState({
        selectedOption: selectedProduct
      });
    }
  };

  render() {
    let reportTypesAll = [];

    //let daysOptions = [];
    if (
      this.state.AllReportTypes != undefined &&
      this.state.AllReportTypes.global_days != undefined
    ) {

      for (let key in this.state.AllReportTypes.global_days) {
        let tempArray = {};
        tempArray["key"] = key;
        tempArray["value"] = this.state.AllReportTypes.global_days[key];

        reportTypesAll.push(tempArray);
      }
    }
    //ReportType1
    var defaultOptions11 = [];
    var defaultOptions12 = [];
    var options11 = [];
    var options12 = [];

    defaultOptions11 = [];
    this.state.selectedOption.map((obj, idx) => {
      defaultOptions11.push({ value: obj.id, label: obj.product_name });
    });

    if (
      this.state.AllReportTypes != undefined &&
      this.state.AllReportTypes.products != undefined &&
      this.state.AllReportTypes.products.length > 0
    ) {
      options11 = this.state.AllReportTypes.products.map((obj, idx) => {
        return { value: obj.id, label: obj.product_name };
      });
    }

    //ReportEdit
    var defaultEditOptions11 = [];
    var defaultEditOptions12 = [];
    var optionsEdit11 = [];
    var optionsEdit12 = [];
    var productOptions = [];

    defaultEditOptions11 = [];
    this.state.selectedOption.map((obj, idx) => {
      defaultEditOptions11.push({ value: obj.id, label: obj.product_name });
      productOptions.push(obj.product_name);
    });

    if (
      this.props.ReportTypes != undefined &&
      this.props.ReportTypes.report_details != undefined &&
      this.props.ReportTypes.report_details.length > 0
    ) {
      optionsEdit11 = this.props.ReportTypes.report_details.map((obj, idx) => {
        return { value: obj.variable1, label: obj.variable1 };
      });
    }

    let daysOpts = []

    reportTypesAll != undefined &&
      reportTypesAll.length > 0 &&
      reportTypesAll.map((obj, idx) => {

        daysOpts.push({value:obj.key,label:obj.value})
      })

    return (

                <div  style={{ opacity: "1" }}
                  className="report-question-outer report-filling fill-report no-padding"
                  data-id={2}
                >
                  <div className="report-question">
                    Received{" "}
                    <span className="empty-place fill1">
                      {" "}
                      {productOptions.join(",")}
                    </span>{" "}
                    treatment in <span className="empty-place fill2">{this.state.days}</span> days
                  </div>
                  <div className="report-instruction">
                    {this.state.reportsLang.report_type_select}
                  </div>

                  <div className="row">
                    <div className="col-sm-12">
                      <div className="choice report-choice">
                        {options11 && (
                          <Select
                          placeholder="Type to search"
                            onChange={this.handleChange1}
                            value={defaultOptions11}
                            isClearable
                            isSearchable
                            options={options11}
                            isMulti={true}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="choice report-choice">
                      <div className="row">
                      <div className="custom-select col-sm-3 select2">
                      <input type="text" className="search-selectbox firstText" autoComplete="off" />
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
                      </div>
                    </div>
                  </div>
                  <input type="hidden" name="report_category" defaultValue="" />
                  <input
                    type="hidden"
                    id="hidden_productsIn"
                    name="product_id"
                    defaultValue=""
                    className="sel_in"
                  />
                  <input
                    type="hidden"
                    id="hidden_productsNot"
                    name="product_id_not"
                    defaultValue=""
                    className="sel_in"
                  />
                  <Link to="/reports/create" className="report-btn common-btn" id="back_report">
                    {this.state.reportsLang.report_back_button } <i className="fa fa-arrow-left" />
                  </Link>

                  <button
                    className="report-btn common-btn pull-right"
                    onClick={this.handleSubmit}
                    id="saveReport"
                  >
                    {" "}
                    {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}
                    <i className="fa fa-check" />
                  </button>
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
  if (state.ReportsReducer.action === "GET_REPORT_TYPES") {
    if (state.ReportsReducer.data.status === 200) {
      return {
        ReportsTypes: state.ReportsReducer.data
      };
    }
  } else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      createReports: createReports,
      getReportTypes: getReportTypes,
      updateReports: updateReports
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(FormReports1));
