import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  fetchReports,
  getReportTypes,
  deleteReports,
  exportReports
} from "../../Actions/reportsActions.js";
import { withRouter } from "react-router";
import config from "../../config";
import axios from "axios";
import { showFormattedDate, numberFormat } from "../../Utils/services.js";
const headerInstance = axios.create();
class Reports extends Component {
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
      patientsData: [],
      globalLang: languageData.global,
      reportsLang: languageData.reports,
      showLoadingText: false,
      ReportsDataList: [],
      reportIdData: null,
      deleteId: null,
      ExportReportsData: [],
      ReportsDataAll: [],
      report_type: null,
      editId: null
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
        page: 1,
        pagesize: this.state.pagesize
      }
    };
    this.setState({
      showLoader: true,
      page: 1,
      pagesize: this.state.pagesize,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      ReportsData: [],
      ReportsDataList: []
    });
    let id = this.state.reportIdData;
    this.props.fetchReports(formData, 0);
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
    this.setState({ showLoader: true });
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.ExportReportsData) {
      window.open(nextProps.ExportReportsData.data.file);
    }
    let returnState = {};
    if (
      nextProps.ReportsData != undefined &&
      nextProps.ReportsData.data != prevState.ReportsData
    ) {

      let rData = nextProps.ReportsData.data.report_data.report_detail.patients;
      if (rData.next_page_url !== prevState.next_page_url) {
        if (prevState.next_page_url == null) {
          localStorage.setItem("sortOnly", false);
          return (returnState.next_page_url = null);
        }

        if (prevState.patientsData.length == 0 && prevState.startFresh == true || prevState.reportId != nextProps.ReportsData.data.report_data.id) {
          if (localStorage.getItem("sortOnly") == "false") {
            returnState.ReportsData = nextProps.ReportsData.report_data;
            if (rData.next_page_url != null) {
              returnState.page = prevState.page + 1;
            } else {
              returnState.next_page_url = rData.next_page_url;
            }
            returnState.startFresh = false;
            returnState.showLoader = false;
            returnState.showLoadingText = false;
            returnState.patientsData = rData.data;
            returnState.ReportsDataAll = nextProps.ReportsData.data;
            returnState.ReportsData = nextProps.ReportsData.data.report_data;
            returnState.reportId = nextProps.ReportsData.data.report_data.id;
            returnState.report_type = nextProps.ReportsData.data.report_data.report_type;
            returnState.ReportsDataList = nextProps.ReportsData.data.reports;

            if(nextProps.ReportsData.data && nextProps.ReportsData.data.reports ){
              returnState.reportIdData = nextProps.ReportsData.data.reports
              ? (nextProps.ReportsData && nextProps.ReportsData.data && nextProps.ReportsData.data.reports && nextProps.ReportsData.data.reports[0] ) ? nextProps.ReportsData.data.reports[0].id : 0
              : 0;
            }

          } else {
            localStorage.setItem("sortOnly", false);
          }
        } else if (
          prevState.patientsData != rData.data &&
          prevState.patientsData.length != 0
        ) {
          returnState.patientsData = [
            ...prevState.patientsData,
            ...rData.data
          ];
          returnState.page = prevState.page + 1;
          returnState.next_page_url = rData.next_page_url;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        }
        returnState.showLoader = false;
      }
      return returnState;
    }
    return null;
  }

  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem("sortOnly", true);
    let formData = {
      params: {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
        term: this.state.term
      }
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
  };
  showDeleteModal = event => {
    let reportId = event.currentTarget.dataset.href;
    this.setState({
      deleteId: reportId,
      showModal: true
    });
  };

  dismissModal = () => {
    this.setState({ showModal: false });
  };

  deleteClinic = () => {
    this.setState({ showLoader: true, hideBtns: true });
    this.props.deleteReports({}, this.state.deleteId);
    this.setState({
      showModal: false,
      showLoader: false
    });
    this.dismissModal();
  };
  reportDataOne = event => {
    localStorage.setItem("sortOnly", true);
    let reportId = event.currentTarget.dataset.href;
    let formData = {
      params: {
        page: 1,
        pagesize: this.state.pagesize
      }
    };
    this.props.fetchReports(formData, reportId);
    this.setState({
      reportIdData: reportId,
      showLoader: true,
      page: 1,
      pagesize: this.state.pagesize,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      ReportsData: []
    });
  };

  reportData = event => {
    let reportId = event.currentTarget.dataset.reportid;

    this.props.getReportTypes({}, reportId);
    this.setState({ editId: reportId });
    let reportType = event.currentTarget.dataset.type;
    return <div>{this.props.history.push(`/reports/${reportId}/edit`)}</div>;

    this.setState({
      showLoader: true,
      page: 1,
      pagesize: this.state.pagesize,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      ReportsData: []
    });
  };
  reportDataEditUp = event => {
    let reportId = event.currentTarget.dataset.reportid;
    this.props.getReportTypes({}, reportId);
    this.setState({ editId: reportId });
    let reportType = event.currentTarget.dataset.type;
    return <div>{this.props.history.push(`/reports/${reportId}/edit`)}</div>;

    this.setState({
      showLoader: true,
      page: 1,
      pagesize: this.state.pagesize,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      ReportsData: []
    });
  };
  exportReportType = event => {
    let reportIdExport = event.currentTarget.dataset.id;
    let reportType = event.currentTarget.dataset.type;
    this.props.exportReports({}, reportIdExport, reportType);
  };

  render() {
    let smEightDivOneClass = "col-sm-8";
    let smEightDivTwoClass = "col-sm-8 no-display";

    if ( this.state.reportIdData && this.state.reportIdData > 0 ) {
      smEightDivOneClass = "col-sm-8";
      smEightDivTwoClass = "col-sm-8 no-display";
    } else {
      smEightDivOneClass = "col-sm-8 no-display";
      smEightDivTwoClass = "col-sm-8";
    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <div className="juvly-title">
            <span className="no-margin">
              {this.state.reportsLang.reports_heading}
            </span>
            {this.state.showLoader ? (
              ""
            ) : (
              <Link to="/reports/create" className="new-blue-btn pull-right">
                {this.state.reportsLang.create_report_button}
              </Link>
            )}
          </div>
          <div className="row">
            <div className="col-sm-4 col-xs-12">
              <div className="merge-setion report-menu-section">
                <div className="section-title header-blue">
                  <span className="section-title-name">
                    {this.state.reportsLang.reports_sub_heading}
                  </span>
                </div>
                <div className="report-content">
                  <ul className="reports-menus">
                    {this.state.ReportsDataList != undefined &&
                      this.state.ReportsData != undefined &&
                      this.state.ReportsDataList.map((obj, idx) => {
                        return (
                          <li className="reports-li deleteable" key={idx}>
                            <a
                              data-href={obj.id}
                              onClick={this.reportDataOne}
                              className="reports-li-a"
                            >
                              {obj.report_name}
                            </a>
                            <a
                              data-href={obj.id}
                              title="Delete"
                              onClick={this.showDeleteModal}
                              className="sale-trash delete-custom-segment-link confirm-model"
                            >
                              <i className="fas fa-trash-alt" />
                            </a>

                            <a
                              href="javascript:void(0)"
                              onClick={this.reportData}
                              data-reportid={obj.id}
                              title="Edit"
                              className="sale-trash edit-custom-segment-link modal-link"
                            >
                              <i className="fas fa-pencil-alt" />
                            </a>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            </div>
            <div className={smEightDivOneClass}>
              <div className="merge-setion">
                <div className="section-title no-border">
                  <div className="section-title-name">
                    {this.state.ReportsData.report_name}

                    {this.state.showLoader ? (
                      ""
                    ) : this.state.ReportsDataList != undefined ? (
                      <a
                        onClick={this.reportDataEditUp}
                        //key={idx1}
                        title="Edit Here"
                        data-reportid={this.state.reportIdData}
                        className="sale-trash edit-custom-segment-link modal-link edit-report-icon"
                      >
                        <i className="fas fa-pencil-alt" />
                      </a>
                    ) : (
                      ""
                    )}
                  </div>
                  <div className="report-title-discription">
                    {this.state.ReportsData != undefined &&
                    this.state.ReportsData.report_detail != undefined ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: this.state.ReportsData.report_detail
                            .description
                        }}
                      />
                    ) : (
                      ""
                    )}
                  </div>
                  {this.state.showLoader ? (
                    ""
                  ) : (
                    <div className="dropdown pull-right report-export">
                      <button
                        className="line-btn no-margin"
                        type="button"
                        id="dropdownMenu1"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        Export
                        <i className="fas fa-angle-down" />
                      </button>
                      {this.state.ReportsDataList != undefined &&
                        this.state.ReportsDataList.map((obj, idx) => {
                          return (
                            <ul
                              key={idx}
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenu1"
                            >
                              <li>
                                <a
                                  href="javascript:void(0);"
                                  data-id={obj.id}
                                  data-type="csv"
                                  onClick={this.exportReportType}
                                >
                                  Export as CSV
                                </a>
                              </li>
                              <li>
                                <a
                                  href="javascript:void(0);"
                                  data-id={obj.id}
                                  data-type="xls"
                                  onClick={this.exportReportType}
                                >
                                  Export as Excel
                                </a>
                              </li>
                            </ul>
                          );
                        })}
                    </div>
                  )}
                </div>
                <div className="table-responsive">
                  <table className="table-updated juvly-table no-hover">
                    <thead className="table-updated-thead">
                      <tr>
                        {this.state.ReportsData !== undefined &&
                          this.state.ReportsData.report_detail !== undefined &&
                          this.state.ReportsData.report_detail.headers !==
                            undefined &&
                          this.state.ReportsData.report_detail.headers.length >
                            0 &&
                          this.state.ReportsData.report_detail.headers.map(
                            (obj, idx) => {
                              return this.state.ReportsData.report_type == 1 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 2 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 3 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 4 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 5 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 6 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 7 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 8 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 9 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 10 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 12 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 13 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 14 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 16 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 15 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 17 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 18 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : this.state.ReportsData.report_type == 19 ? (
                                <th
                                  key={idx}
                                  className="col-xs-2 table-updated-th"
                                >
                                  {obj}
                                </th>
                              ) : (
                                ""
                              );
                            }
                          )}
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.ReportsData.report_type == 11 ? (
                        <tr className="table-updated-tr">
                          <td className="table-updated-td">{(this.state.ReportsData.report_detail.patients.days) ? this.state.ReportsData.report_detail.patients.days : "&nbsp;"}</td>
                        </tr>
                      ) : (
                        ""
                      )}
                      { this.state.patientsData !== undefined &&
                        this.state.patientsData.length >
                          0 &&
                        this.state.patientsData.map(
                          (obj, idx) => {
                            return this.state.ReportsData.report_type == 1 ? (
                              <tr className="table-updated-tr" key={idx+"-1-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {numberFormat(obj.total_units)}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 2 ? (
                              <tr className="table-updated-tr" key={idx+"-2-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {numberFormat(obj.total_units)}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 3 ? (
                              <tr className="table-updated-tr" key={idx+"-3-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                {obj.appointment !== undefined ? (
                                  <td className="table-updated-td">
                                    {obj.appointment.appointment_datetime}
                                  </td>
                                ) : (
                                  <td className="table-updated-td">never</td>
                                )}
                              </tr>
                            ) : this.state.ReportsData.report_type == 4 ? (
                              <tr className="table-updated-tr" key={idx+"-4-report"}>
                                <td className="table-updated-td">
                                  {obj.product_name}
                                </td>
                                <td className="table-updated-td">
                                  {obj.total_sale}
                                </td>
                                <td className="table-updated-td">
                                  {obj.clinic_name}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 5 ? (
                              <tr className="table-updated-tr" key={idx+"-5-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.phoneNumber}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 6 ? (
                              <tr className="table-updated-tr" key={idx+"-6-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                {obj.appointment == null ? (
                                  <td className="table-updated-td">never</td>
                                ) : (
                                  <td className="table-updated-td">
                                    {obj.appointment.appointment_datetime !=
                                    undefined
                                      ? obj.appointment.appointment_datetime
                                      : null}
                                  </td>
                                )}
                              </tr>
                            ) : this.state.ReportsData.report_type == 7 ? (
                              <tr className="table-updated-tr" key={idx+"-7-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.total_visit}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 8 ? (
                              <tr className="table-updated-tr" key={idx+"-8-report"}>
                                <td className="table-updated-td">
                                  {obj.patient.firstname + obj.patient.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.patient.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.patient.dob) ==
                                  "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.patient.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.patient.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.app_count}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 9 ? (
                              <tr className="table-updated-tr" key={idx+"-9-report"}>
                                <td className="table-updated-td">
                                  {obj.patient.firstname + obj.patient.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.patient.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.patient.dob) ==
                                  "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.patient.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.patient.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.app_count}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 10 ? (
                              <tr className="table-updated-tr" key={idx+"-10-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.appointment.appointment_datetime}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 12 ? (
                              <tr className="table-updated-tr" key={idx+"-12-report"}>
                                <td className="table-updated-td">
                                  {obj.day_name}
                                </td>
                                <td className="table-updated-td">
                                  {obj.app_count}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 13 ? (
                              <tr className="table-updated-tr" key={idx+"-13-report"}>
                                <td className="table-updated-td">
                                  {obj.data.firstname + obj.data.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {numberFormat(obj.amount_sum, "currency")}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 14 ? (
                              <tr className="table-updated-tr" key={idx+"-14-report"}>
                                <td className="table-updated-td">
                                  {obj.patient.firstname + obj.patient.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.patient.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.patient.dob) ==
                                  "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.patient.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.patient.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.total_count}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 15 ? (
                              <tr className="table-updated-tr" key={idx+"-15-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.phoneNumber}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 16 ? (
                              <tr className="table-updated-tr" key={idx+"-16-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.phoneNumber}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 17 ? (
                              <tr className="table-updated-tr" key={idx+"-17-report"}>
                                <td className="table-updated-td">
                                  {obj.firstname + obj.lastname}
                                </td>
                                <td className="table-updated-td">
                                  {obj.email}
                                </td>
                                <td className="table-updated-td">
                                  {showFormattedDate(obj.dob) == "Invalid date"
                                    ? "N/A"
                                    : showFormattedDate(obj.dob)}
                                </td>
                                <td className="table-updated-td">
                                  {obj.gender_text}
                                </td>
                                <td className="table-updated-td">
                                  {obj.referral_source}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 18 ? (
                              <tr className="table-updated-tr" key={idx+"-18-report"}>
                                <td className="table-updated-td">
                                  {obj.provider}
                                </td>
                                <td className="table-updated-td">
                                  {obj.month}
                                </td>
                                <td className="table-updated-td">
                                  {obj.total}
                                </td>
                              </tr>
                            ) : this.state.ReportsData.report_type == 19 ? (
                              <tr className="table-updated-tr" key={idx+"-19-report"}>
                                <td className="table-updated-td">
                                  {obj.provider}
                                </td>
                                <td className="table-updated-td">
                                  {obj.month_name + "," + obj.year}
                                </td>
                                <td className="table-updated-td">
                                  {obj.total_time + " minutes"}
                                </td>
                              </tr>
                            ) : (
                              ""
                            );
                          }
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className={smEightDivTwoClass}>

                    <div className="merge-setion">

                    <div className="section-title">
                      <span className="section-title-name"></span>
                      <div className="dropdown pull-right">


                      </div>
                    </div>

                    <div className="ajax-view merge-content">
                      <div className="form-group pull-right right-dropdown">

                      </div>


                      <div className="table-responsive">
                        <div className="no-record">No Report selected</div>
                      </div>
                    </div>

                    </div>

            </div>
          </div>
        </div>
        <div className={this.state.showModal ? "overlay" : ""} />
        <div
          id="filterModal"
          role="dialog"
          className={
            this.state.showModal ? "modal fade in displayBlock" : "modal fade"
          }
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  onClick={this.dismissModal}
                >
                  ×
                </button>
                <h4 className="modal-title" id="model_title">
                  {this.state.reportsLang.reports_confim_required}
                  {this.state.showModal}
                </h4>
              </div>
              <div
                id="errorwindow"
                className="modal-body add-patient-form filter-patient"
              >
                {this.state.reportsLang.reports_delete_text}
              </div>
              <div className="modal-footer">
                <div className="col-md-12 text-left" id="footer-btn">
                  <button
                    type="button"
                    className="btn  logout pull-right"
                    data-dismiss="modal"
                    onClick={this.dismissModal}
                  >
                    {this.state.reportsLang.report_delete_no}
                  </button>
                  <button
                    type="button"
                    className="btn btn-success pull-right m-r-10"
                    data-dismiss="modal"
                    onClick={this.deleteClinic}
                  >
                    {this.state.reportsLang.report_delete_yes}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            this.state.showLoader
              ? "new-loader text-left displayBlock fixLoader"
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
  if (state.ReportsReducer.action === "REPORTS_LIST") {
    if (state.ReportsReducer.data.status === 200) {
      return {
        ReportsData: state.ReportsReducer.data
      };
    }
  }
  if (state.ReportsReducer.action === "EXPORT_REPORTS") {
    if (state.ReportsReducer.data.status === 200) {
      return {
        ExportReportsData: state.ReportsReducer.data
      };
    }
  }
  if (state.ReportsReducer.action === "DELETE_REPORTS") {
    if (state.ReportsReducer.data.status == 200) {
      toast.success(languageData.global[state.ReportsReducer.data.message]);
    } else {
      toast.error(languageData.global[state.ReportsReducer.data.message]);
    }
    return {};
  } else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      fetchReports: fetchReports,
      getReportTypes: getReportTypes,
      deleteReports: deleteReports,
      exportReports: exportReports
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(Reports));
