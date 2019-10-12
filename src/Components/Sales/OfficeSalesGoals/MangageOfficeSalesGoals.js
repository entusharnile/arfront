
import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchManageOfficeSalesGoals } from '../../../Actions/Sales/salesActions.js';
import { withRouter } from 'react-router';
import SalesHeader from '../Common/SalesHeader.js';
import {numberFormat} from '../../../Utils/services.js';
import AddOfficeSalesGoals from './AddOfficeSalesGoals.js';

class ManageOfficeSalesGoals extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.state = {
      startFresh: true,
      showLoader: false,
      id: userData.user.id,
      tax: '',
			scopes: 'business_hours',
      globalLang: languageData.global,
      salesLang: languageData.sales,
      showLoadingText : false,
      clinic_name: ''
    };

    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop ===
          document.documentElement.offsetHeight &&
        this.state.next_page_url != null
      ) {
        this.loadMore();
      }
    };
  }

  componentDidMount() {
    const clinicId =this.props.match.params.id;
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    localStorage.setItem("selectId", JSON.stringify(clinicId));
    this.setState({ 'showLoader': true });
    if(clinicId){
      this.props.fetchManageOfficeSalesGoals(clinicId);
     }
  }

  userEdit=( id )=> {
       return (
         <div>
           {this.props.history.push(`/sales/office-salesgoals/${id}/edit`)}
         </div>
       );
     }

  static getDerivedStateFromProps(props, state) {
    if(props.showLoader != undefined && props.showLoader == false) {
        return {showLoader : false};
     }
    if (props.ManageOfficeSalesGoals !== undefined && props.ManageOfficeSalesGoals.status === 200 && state.ManageOfficeSalesGoals != props.ManageOfficeSalesGoals.data) {
      return {
        clinicSaleGoals: props.ManageOfficeSalesGoals.data.clinic_sale_goals,
        clinic_name: props.ManageOfficeSalesGoals.data.clinics.clinic_name,
        showLoader : false,
        };
      }
      else
        return null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.startFresh) {
      return true;
    }

    if (this.state.loadMore) {
      return true;
    }

    if (this.state.showLoader) {
      return true;
    }
    return false;
  }

  render() {
    const monthNames = ["Select","January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <SalesHeader/>
          <div className="juvly-section full-width">
            <div className="juvly-container border-top">
              <div className="juvly-title no-margin">{this.state.salesLang.sales_manage_office_sal} - {this.state.clinic_name}
                <Link to="/sales/office-sales-goals" className="pull-right crossIcon"><img src="/images/close.png" /></Link>
                <Link to ="/sales/office-sales-goals/add" className="new-blue-btn pull-right">{this.state.salesLang.sales_add_goal}</Link>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table-updated setting-table survey-table no-hover">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-3 table-updated-th">{this.state.salesLang.sales_month}</th>
                    <th className="col-xs-3 table-updated-th">{this.state.salesLang.sales_year}</th>
                    <th className="col-xs-3 table-updated-th">{this.state.salesLang.sales_sale_goal}</th>
                    <th className="col-xs-3 table-updated-th">{this.state.salesLang.sales_actions}</th>
                  </tr>
                </thead>
                <tbody className="ajax_body">
                {
                  this.state.clinicSaleGoals !== undefined &&
                  this.state.clinicSaleGoals.map((obj, idx) => {
                    var month = obj.month
                  return (
                    <tr className="table-updated-tr" key={obj.id}>
                      <td className="col-xs-3 table-updated-td">{monthNames[month]}</td>
                      <td className="col-xs-3 table-updated-td">{obj.year}</td>
                      <td className="col-xs-3 table-updated-td">{numberFormat(obj.goal, 'currency', 2) }</td>
                      <td className="col-xs-3 table-updated-td actions_parent"><a className="easy-link no-padding col-xs-6 goal_edit" onClick = {this.userEdit.bind(this, obj.id)}>{this.state.salesLang.sales_edit}</a></td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.clinicSaleGoals != undefined && this.state.clinicSaleGoals.length == 0) ? 'no-record' : 'no-record no-display'} >
                <div className="" style={{float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px" }} >
                  {this.state.salesLang.sales_no_record_found}
                </div>
              </div>}
              <div className={ this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left" } >
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                    <div id="modal-confirm-text" className="popup-subtitle">
                      {this.state.salesLang.sales_please_wait}
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.SalesReducer.action === "FETCH_MANAGE_OFFICE") {
    if(state.SalesReducer.data.status === 200){
      return {
        ManageOfficeSalesGoals: state.SalesReducer.data
      }
    }
   }  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchManageOfficeSalesGoals: fetchManageOfficeSalesGoals
  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ManageOfficeSalesGoals));
