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

class FormReports2 extends Component {
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
      defaultOptions2: [],
      options1: null,
      options2: null,
      ReportProducts: [],
      selectedOption: [],
      selectedOption1: [],
      select_Default_Report: [],
      ReportsDataChild: [],
      AllReportTypes: [],
      report_array: [],
      editType: props.type,
      id: props.match.params.id
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
      ReportsTypes: [],
      ReportsDataList: []
    });
    let id = this.props.reportIdData;
    if (this.state.id != null) {
      this.setState({showLoader:true})
      this.props.getReportTypes({}, this.state.id);
    } else {
      this.setState({showLoader:true})
      this.props.getReportTypes({}, 0);
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
      nextProps.ReportTypes != undefined &&
      nextProps.ReportTypes != prevState.ReportsDataChild
    ) {
      returnState.ReportsDataChild = nextProps.ReportTypes;
      returnState.showLoader = false;

      if (prevState.id) {
        returnState.AllReportTypes = nextProps.ReportTypes.data;
        returnState.showLoader = false;

      } else {

        returnState.AllReportTypes = nextProps.ReportTypes.data;
        returnState.showLoader = false;

      }
      returnState.report_array = nextProps.ReportTypes.data;
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
        let selectedOption1 = [];

        if (returnState.AllReportTypes.report_details != undefined) {
          returnState.AllReportTypes.products.map((obj, idx) => {
            if (
              returnState.AllReportTypes.report_details.variable2.indexOf(",") >
              -1
            ) {
              let productOptions = returnState.AllReportTypes.report_details.variable2.split(
                ","
              );
              productOptions.map((obj1, idx1) => {
                if (obj1 == obj.id) {
                  selectedOption1.push(obj);
                }
              });
            } else {
              if (
                returnState.AllReportTypes.report_details.variable2 == obj.id
              ) {
                selectedOption1.push(obj);
              }
            }
          });
        }
        returnState.selectedOption1 = selectedOption1;
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
          if (this.state.report_array.indexOf(obj.id) > -1) {
            reportVal.push(obj.id);
          }
        });
      }
    }
    var reportVal1 = [];
    if (
      this.state.selectedOption1 != undefined &&
      this.state.selectedOption1.length > 0
    ) {
      reportVal1 = this.state.selectedOption1.map((obj, idx) => {
        return obj.id;
      });
    }

    if (!reportVal1.length) {
      if (
        this.state.report_array.length &&
        this.state.selectedOption1 != undefined &&
        this.state.selectedOption.length
      ) {
        this.state.selectedOption1.map((obj, idx) => {
          if (this.state.report_array.indexOf(obj.id) > -1) {
            reportVal1.push(obj.id);
          }
        });
      }
    }
    let formData = {
      report_type: this.props.type,
      report_name: this.props.name,
      product_id: reportVal.join(","),
      report_category: this.props.category,
      product_id_not: reportVal1.join(",")
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
  accordion = event => {
    let accordionId = event.currentTarget.dataset.href;
    if (accordionId) {
      let accordionList = this.props.accordion;
      if (accordionList[accordionId]) {
        accordionList[accordionId] = !accordionList[accordionId];
      } else {
        accordionList[accordionId] = true;
      }
      this.setState({ accordionList: accordionList });
    }
    this.setState({
      titleClass: "juvly-accordion-title active",
      contentClass: "juvly-accordion-content open"
    });
  };
  handleHideShow = event => {
    let reportCategory = event.currentTarget.dataset.report_category;
    let reportType = event.currentTarget.dataset.id;
    this.setState({
      firstAccordionClass: "juvly-accordion 1 no-display",
      secondAccordionClass: "juvly-accordi;on 2 no-display",
      thirdAccordionClass: "juvly-accordion 3 no-display",
      fourthAccordionClass: "juvly-accordion 4 no-display",
      report_category: reportCategory,
      type: reportType
    });
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
  handleChange2 = (selectedOption1, x) => {
    if (x.action == "select-option") {
      let selectedProduct1 = this.state.selectedOption1;
      const allProduct1 = this.state.AllReportTypes.products;
      this.state.AllReportTypes.products.map((obj, idx) => {
        if (obj.id == x.option.value) {
          selectedProduct1.push(obj);
          this.setState({
            selectedOption1: selectedProduct1
          });
          return;
        }
      });
    } else if (x.action == "remove-value") {
      let selectedProduct1 = this.state.selectedOption1;
      let index = selectedProduct1.findIndex(
        y => y.id === x.removedValue.value
      );
      selectedProduct1.splice(index, 1);
      this.setState({
        selectedOption1: selectedProduct1
      });
    }
  };

  render() {
    //ReportType2
    var defaultOptions1 = [];
    var defaultOptions2 = [];
    var options1 = [];
    var options2 = [];
    var productOptions1 = [];
    var productOptions2 = [];

    defaultOptions1 = [];
    this.state.selectedOption.map((obj, idx) => {
      defaultOptions1.push({ value: obj.id, label: obj.product_name });
      productOptions1.push(obj.product_name);
    });
    if (
      this.state.AllReportTypes != undefined &&
      this.state.AllReportTypes.products != undefined &&
      this.state.AllReportTypes.products.length > 0
    ) {
      options1 = this.state.AllReportTypes.products.map((obj, idx) => {
        return { value: obj.id, label: obj.product_name };
      });
    }

    defaultOptions2 = [];
    this.state.selectedOption1.map((obj, idx) => {
      defaultOptions2.push({ value: obj.id, label: obj.product_name });
      productOptions2.push(obj.product_name);
    });
    if (
      this.state.AllReportTypes != undefined &&
      this.state.AllReportTypes.products != undefined &&
      this.state.AllReportTypes.products.length > 0
    ) {
      options2 = this.state.AllReportTypes.products.map((obj, idx) => {
        return { value: obj.id, label: obj.product_name };
      });
    }
    return (

                <div
                  className="report-question-outer report-filling fill-report no-padding"
                  data-id={2}
                  style={{ opacity: "1" }}
                >
                  <div className="report-question">
                    People who received{" "}
                    <span className="empty-place fill1">
                      {productOptions1.join(",")}{" "}
                    </span>{" "}
                    treatment but not{" "}
                    <span className="empty-place fill2">
                      {productOptions2.join(",")}
                    </span>{" "}
                    treatment
                  </div>
                  <div className="report-instruction">
                  {this.state.reportsLang.report_type_select}
                  </div>
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="choice report-choice">
                        {options1 && (
                          <Select
                            placeholder="Type to search"
                            onChange={this.handleChange1}
                            value={defaultOptions1}
                            isClearable
                            isSearchable
                            options={options1}
                            isMulti={true}
                          />
                        )}
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="choice report-choice">
                        {options2 && (
                          <Select
                            placeholder="Type to search"
                            onChange={this.handleChange2}
                            value={defaultOptions2}
                            isClearable
                            isSearchable
                            options={options2}
                            isMulti={true}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <input
                    type="hidden"
                    name="report_category"
                    defaultValue="service"
                    autoComplete="off"
                  />
                  <input
                    type="hidden"
                    id="hidden_productsIn"
                    name="product_id"
                    defaultValue=""
                    className="sel_in"
                    autoComplete="off"
                  />
                  <input
                    type="hidden"
                    id="hidden_productsNot"
                    name="product_id_not"
                    defaultValue=""
                    className="sel_in"
                    autoComplete="off"
                  />
                  <Link to="/reports" className="report-btn common-btn" id="back_report">
                    {this.state.reportsLang.report_back_button } <i className="fa fa-arrow-left" />
                  </Link>
                  <button
                    className="report-btn common-btn pull-right"
                    onClick={this.handleSubmit}
                    id="saveReport"
                  >
                    {this.state.id ? this.state.reportsLang.report_update_report_button : this.state.reportsLang.report_create_report_button}<i className="fa fa-check" />
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
  if (state.ReportsReducer.action === "GET_type S") {
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
)(withRouter(FormReports2));
