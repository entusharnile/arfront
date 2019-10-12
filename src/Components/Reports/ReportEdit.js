import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  createReports,
  getReportTypes,
  updateReports,
  fetchReports
} from "../../Actions/reportsActions.js";
import { withRouter } from "react-router";
import config from "../../config";
import axios from "axios";
import Select from "react-select";
import FormReports1 from "./FormReports1.js";
import FormReports2 from "./FormReports2.js";
import FormReports3 from "./FormReports3.js";
import FormReports4 from "./FormReports4.js";
import FormReports5 from "./FormReports5.js";
import FormReports6 from "./FormReports6.js";
import FormReports7 from "./FormReports7.js";
import FormReports8 from "./FormReports8.js";
import FormReports9 from "./FormReports9.js";
import FormReports10 from "./FormReports10.js";
import FormReports11 from "./FormReports11.js";
import FormReports12 from "./FormReports12.js";
import FormReports13 from "./FormReports13.js";
import FormReports14 from "./FormReports14.js";
import FormReports15 from "./FormReports15.js";
import FormReports16 from "./FormReports16.js";
import FormReports17 from "./FormReports17.js";
import FormReports18 from "./FormReports18.js";
import FormReports19 from "./FormReports19.js";

const headerInstance = axios.create();

class ReportEdit extends Component {
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
      searchFunction: "",
      user_changed: false,
      tabClicked: false,
      action: props.match.params.statusId,
      sortorder: "asc",
      scopes: "category",
      ReportsData: [],
      ReportTypes: [],
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
      report_category: "",
      report_name: "",
      defaultOptions: [],
      options: null,
      ReportProducts: [],
      selectedOption: null,
      select_Default_Clinic: [],
      report_type: null,
      id: props.match.params.id,
      ReportName: [],
      ReportNameFetch: "",
      userChanged: false
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
      [event.target.name]: value,userChanged : true
    });
  };

  componentDidMount() {
    let formData = {
      params: {
        to_date: this.state.to_date,
        from_date: this.state.from_date,
        page: 1,
        pagesize: this.state.pagesize
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      //loadMore: true,
      startFresh: true,
      next_page_url: "",
      ReportsData: [],
      ReportTypes: [],
      ReportsDataList: [],
      //showLoader: true
    });
    if (this.state.id != null) {
      this.props.getReportTypes({}, this.state.id);

    } else {
      this.props.getReportTypes({}, 0);
    }
  }

  onSort = sortby => {
    let sortorder = this.state.sortorder === "asc" ? "desc" : "asc";
    let formData = {
      params: {
        page: 1,
        pagesize: this.state.pagesize,
        sortby: sortby,
        sortorder: sortorder,
        term: this.state.term
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
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
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
        term: this.state.term,
        action: this.state.action
        //	scopes : this.state.scopes
      }
    };
    //this.setState({ showLoader: true });
    //this.props.createReports(formData);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.ReportTypes != undefined) {
      returnState.ReportTypes = nextProps.ReportTypes;
      returnState.ReportName = nextProps.ReportTypes.data;
      returnState.ReportProducts = nextProps.ReportTypes.data.products;
      returnState.report_type = nextProps.ReportTypes.data.report_details.report_type;
      returnState.report_category = nextProps.ReportTypes.data.report_details.report_category;
      returnState.report_name = prevState.userChanged ? prevState.report_name :nextProps.ReportTypes.data.report_details.report_name;

      return returnState;
    }

    return null;
  }
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
      let accordionList = this.state.accordion;
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
      secondAccordionClass: "juvly-accordion 2 no-display",
      thirdAccordionClass: "juvly-accordion 3 no-display",
      fourthAccordionClass: "juvly-accordion 4 no-display",
      report_category: reportCategory,
      report_type: reportType
    });
  };
  handleChange = selectedOption => {
    this.setState({
      select_Default_Clinic: selectedOption,
      selectedOption
    });
  };
  render() {
    var defaultOptions = [];
    var options = [];

    if (
      this.state.ReportProducts != undefined &&
      this.state.ReportProducts.length > 0
    ) {
      this.state.ReportProducts.map((obj, idx) => {
        defaultOptions.push({ value: obj.id, label: obj.product_name });
      });
    }

    if (
      this.state.ReportProducts != undefined &&
      this.state.ReportProducts.length > 0
    ) {
      options = this.state.ReportProducts.map((obj, idx) => {
        return { value: obj.id, label: obj.product_name };
      });
    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <div className="row">
            <div className="col-sm-12">
              <div className="merge-setion">
                <div className="juvly-container bg-white-scetion">
                <Link
                  to="/reports"
                  className="pull-right cancelAction"
                >
                  <img src="/images/close.png" />
                </Link>
                  <div className="juvly-acco-main">

                    <div
                      className="report-question-outer report-name no-padding"
                      style={{ opacity: "1" }}
                    >
                      <div className="report-question">{this.state.reportsLang.report_name_report}</div>

                      <input
                        type="text"
                        id="report_name"
                        name="report_name"
                        className="report-input"
                        onChange={this.handleInputChange}
                        autoComplete="off"
                        placeholder="Type a report name..."
                        value={this.state.report_name}
                      />
                      <button className="report-btn ok-btn" data-report_btn="1">
                        OK <i className="fa fa-check" />
                      </button>
                      <span className="please-fill">{this.state.reportsLang.report_fill_report}</span>
                    </div>


                      {this.state.report_type == 1 ? (
                        <FormReports1
                          ReportTypes={this.state.ReportTypes.data}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                          id={this.state.id}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 2 ? (
                        <FormReports2
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 3 ? (
                        <FormReports3
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 4 ? (
                        <FormReports4
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 5 ? (
                        <FormReports5
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 6 ? (
                        <FormReports6
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 7 ? (
                        <FormReports7
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 8 ? (
                        <FormReports8
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 9 ? (
                        <FormReports9
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 10 ? (
                        <FormReports10
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 11 ? (
                        <FormReports11
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 12 ? (
                        <FormReports12
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 13 ? (
                        <FormReports13
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 14 ? (
                        <FormReports14
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 15 ? (
                        <FormReports15
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 16 ? (
                        <FormReports16
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 17 ? (
                        <FormReports17
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 18 ? (
                        <FormReports18
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}
                      {this.state.report_type == 19 ? (
                        <FormReports19
                          ReportTypes={this.state.ReportTypes}
                          type={this.state.report_type}
                          name={this.state.report_name}
                          category={this.state.report_category}
                        />
                      ) : (
                        ""
                      )}


                    <input
                      type="hidden"
                      name="report_category"
                      value=""
                    />
                    <input
                      type="hidden"
                      id="hidden_singleProducts"
                      name="product_id"
                      value=""
                      className="sel_in"
                    />

                    <input
                      type="hidden"
                      name="days"
                      value=""
                      className="sel_in"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
          <div className="loader-outer">
            <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
            <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
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
        ReportTypes: state.ReportsReducer.data
      };
    }
  }
  if (state.ReportsReducer.action === "UPDATE_REPORTS") {
    if (state.ReportsReducer.data.status === 200) {
      toast.success(languageData.global[state.ReportsReducer.data.message]);
    }
    else{
      toast.error(languageData.global[state.ReportsReducer.data.message]);
    }
  } else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updateReports: updateReports,
      getReportTypes: getReportTypes,
      fetchReports: fetchReports
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ReportEdit));
