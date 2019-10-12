import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import validator from 'validator';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import axios from 'axios';
//import config from '../../../../config.js';
import {addOfficeSalesGoals, fetrchOfficeSalesGoals, fetrchOfficeSalesGoalsNm, fetchAvailableMonths} from '../../../Actions/Sales/salesActions.js';
import SalesHeader from '../Common/SalesHeader.js';

class AddOfficeSalesGoals extends React.Component {
  constructor(props) {
		super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
  	this.state = {
      userChanged:false,
      showLoader: false,
      id: '',
      clinic_id: '',
      goal_month: '',
      goal_year: '',
      goal: '',
      goal_id: '',
      clinic_name:'',
      year: '',
      month: 0,
      eid:'',
      globalLang: languageData.global,
      salesLang: languageData.sales,
      select_MonthClass: "setting-select-box",
      monthData: []
		}
    localStorage.setItem("showLoader", true);
	}

  showLoaderFunc = ()  => {
    this.setState({showLoader: true});
    localStorage.setItem("showLoader", true);
  }

  componentDidMount(){
    const goadId =this.props.match.params.id;
    var urlR = window.location.href;
    var res = urlR.split("/");
    let navLink = res[res.length-1];
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    const idVal =localStorage.getItem('selectId');
    const valID = idVal ? JSON.parse(idVal) : '';
    let formData = {
      clinic_id : valID,
      goal_id: navLink == 'edit' ? goadId : ''
    }
    this.setState({
      id: JSON.parse(idVal),
      eid: goadId
    })
    if(navLink == 'edit')
    {
      this.showLoaderFunc();
      this.props.fetrchOfficeSalesGoals(formData);
    }
    else
    {
      this.showLoaderFunc();
      this.props.fetrchOfficeSalesGoalsNm(formData);
    }
  }



  static getDerivedStateFromProps(props, state) {
    const editId = state.eid;
    if(props.showLoader != undefined && props.showLoader == false) {
      if(localStorage.getItem("showLoader") == "false") {
        localStorage.setItem("showLoader", true);
        return {showLoader : false};
     }
   }
      if (props.fetchofficeSalesGoalsData !== undefined && props.fetchofficeSalesGoalsData.status === 200 && props.fetchofficeSalesGoalsData != state.fetchofficeSalesGoalsData) {
        if(localStorage.getItem("showLoader") == "false") {
          localStorage.setItem("showLoader", true);
          var monthT = props.fetchofficeSalesGoalsData.data.ClinicSaleGoals.month
          var monthValt = monthT.substr(1)
        return {
          clinic_name: (state.userChanged) ? state.clinic_name : props.fetchofficeSalesGoalsData.data.clinics.clinic_name,
          month: (state.userChanged) ? state.month : (monthT)  ,
          year: (state.userChanged) ? state.year : props.fetchofficeSalesGoalsData.data.ClinicSaleGoals.year,
          goal: (state.userChanged) ? state.goal : props.fetchofficeSalesGoalsData.data.ClinicSaleGoals.goal,
          monthData: editId ? props.fetchofficeSalesGoalsData.data.available_months : props.fetchofficeSalesGoalsData.data.available_months.original.data ,
          showLoader: false
        };
      }
    }
      if (props.officeSalesGoalsData != undefined && props.officeSalesGoalsData.status == 200){
        if(localStorage.getItem("showLoader") == "false") {
          localStorage.setItem("showLoader", true);
        return {
          clinic_name: (state.userChanged) ? state.clinic_name : props.officeSalesGoalsData.data.clinics.clinic_name,
          showLoader: false
        }
      }
    }
      if (props.fetchOfficeGoalsData != undefined && props.fetchOfficeGoalsData.status == 200){
        if(localStorage.getItem("showLoader") == "false") {
          localStorage.setItem("showLoader", true);
        return {
          monthData:  props.fetchOfficeGoalsData.data,
          showLoader: false
        }
      }
    }
       else if(props.redirect != undefined && props.redirect == true) {
         if(localStorage.getItem("showLoader") == "false") {
           localStorage.setItem("showLoader", true);
        toast.success(props.message)
            props.history.push('/sales/office-sales-goals/' + state.id);
     }
   }
      else
        return null;
  }

  handleInputChange = event => {
    const targetVal = event.target;
    const valueDat = targetVal.type === "checkbox" ? targetVal.checked : targetVal.value;
    this.setState({
      [event.target.name]: valueDat
    });
  };

  handleMonthSelect = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    this.setState({ [event.target.name]: value ,userChanged : true});
    var urlR = window.location.href;
    var res = urlR.split("/");
    let navLink = res[res.length-1];
    const goadId =this.props.match.params.id;
    const idVal =localStorage.getItem('selectId');
    const valID = idVal ? JSON.parse(idVal) : '';

    let formData = {
      year: value,
      month: this.state.month,
      clinic_goal_id: navLink == 'edit' ? goadId : '',
      clinic_id: valID
    }
    this.showLoaderFunc();
    this.props.fetchAvailableMonths(formData)
    this.setState({month: 0})
  }

  handleSubmit=(event) =>{
		event.preventDefault();
    var goalCheck = /^[1-9]\d*$/
    this.setState({
      yearError: false,
      monthError:false,
      goalError:false
    });
		// //====Frontend validation=================
	  let error = false;
    if (typeof this.state.year == undefined || this.state.year == null || this.state.year == '') {
      this.setState({
        yearError:true,
      })
      error = true;
    }

    if (typeof this.state.month == undefined || this.state.month == null || this.state.month == '') {
      this.setState({
        monthError:true,
      })
      error = true;
    }

    if (typeof this.state.goal === undefined || this.state.goal === null || this.state.goal === '' || this.state.goal < 0 || (!(goalCheck.test(this.state.goal)))) {
      this.setState({
        goalError:true,
      })
      error = true;
    }

    if (error === true) {
      return;
    }

		// //======End frontend validation=========

    var urlR = window.location.href;
    var res = urlR.split("/");
    let navLink = res[res.length-1];
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    const idVal =localStorage.getItem('selectId');
    const valID = idVal ? JSON.parse(idVal) : '';
    const goadId =this.props.match.params.id;

    let formData = {
        clinic_id : valID,
        goal_year: this.state.year,
        goal_month: this.state.month,
        goal: this.state.goal,
        goal_id: navLink == 'edit' ? goadId : ''
      }

    this.showLoaderFunc();
    this.props.addOfficeSalesGoals(formData)
	}

  renderYear = () => {
    const currentYear = (new Date()).getFullYear()
    var counter;
    let htmlList = []
      for(counter=currentYear; counter < (currentYear + 12); counter++){
        htmlList.push(<option key={counter} value={counter}>{counter}</option>);
      }
    return htmlList;
  }

  render() {
    var urlR = window.location.href;
    var res = urlR.split("/");
    let navLink = res[res.length-1];
    const monthNames = ["Select", "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <SalesHeader/>
          <div className="juvly-section full-width">
          <form id="office-text-form" name="OfficeSalesGoals" className="nobottommargin" action="#" method="post" onSubmit={this.handleSubmit}>
            <div className="juvly-container border-top m-h-container">
              <div className="juvly-title m-b-50">{navLink == 'add' ? this.state.salesLang.sales_add_sales_goals : this.state.salesLang.sales_edit_sales_goals} - {this.state.clinic_name} </div>
              <div className="row">
                <div className="col-xs-12 col-sm-7 col-lg-5">
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.salesLang.sales_clinic_name}</div>
                        <input type="text" name="clinic_name" value={this.state.clinic_name} className="setting-input-box" readOnly />
                      </div>
                    </div>
                    <div className="col-xs-12 col-sm-4">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.salesLang.sales_year}<span className="setting-require">*</span></div>
                        <select className={this.state.yearError == true ? "setting-select-box field_error" :"setting-select-box"} name="year" value={this.state.year} onChange={this.handleMonthSelect}>
                          <option value=''>{this.state.salesLang.sales_select}</option>
                          {this.renderYear()}
                        </select>
                      </div>
                    </div>
                    <div className="col-xs-12 col-sm-4">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.salesLang.sales_month}<span className="setting-require">*</span></div>
                        <select className={this.state.monthError === true ? "setting-select-box field_error" :"setting-select-box"} name="month" value={navLink == 'add' ? this.state.month : (this.state.month)} onChange={this.handleInputChange}>
                        <option value=''>{this.state.salesLang.sales_select}</option>
                        {
                          this.state.monthData && this.state.monthData !== undefined &&
                          this.state.monthData.map((obj, idx) => {
                            var monthVald = obj.id
                            var month= (monthVald <= 9) ? monthVald.substr(1) : monthVald
                            var idVal = parseInt(obj.id)
                            return(<option value={obj.id} disabled={obj.show && obj.show == 1 ? "disabled" : ''} key={obj.id}>{monthNames[month]}</option>
                          );
                        })}
                        </select>
                      </div>
                    </div>
                    <div className="col-xs-12 col-sm-4">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.salesLang.sales_goal}<span className="setting-require">*</span></div>
                          <input className={this.state.goalError === true ? "setting-input-box setting-input-box-invalid" :"setting-input-box"} name="goal" type="text"  value={this.state.goal} onChange={this.handleInputChange} placeholder="Goal" autoComplete="off" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-static">
              <input className="new-blue-btn pull-right" type="submit" id="save-profile" autoComplete="off" value={this.state.salesLang.sales_save} />
              <a href={'/sales/office-sales-goals/' + this.state.id} className="new-white-btn pull-right cancel">{this.state.salesLang.sales_cancel}</a>
            </div>
            </form>
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
    );
  }
}

function mapStateToProps(state){
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  localStorage.setItem("showLoader", false);
  const returnState = {};
  if (state.SalesReducer.action === "FETCH_OFFICE_GOALS") {
    if(state.SalesReducer.data.status === 200){
      return {fetchofficeSalesGoalsData: state.SalesReducer.data }
  }
  else {
      toast.error(languageData.global[state.SalesReducer.data.message]);
    }
  }
  if (state.SalesReducer.action === "ADD_OFFICE_GOALS") {
    if(state.SalesReducer.data.status === 200){
      return {redirect: true, message : languageData.global[state.SalesReducer.data.message] }
    }
  else {
      toast.error(languageData.global[state.SalesReducer.data.message]);
    }
  }
  if (state.SalesReducer.action === "FETCH_OFFICE_GOALS_NM") {
    if(state.SalesReducer.data.status === 200){
      return {officeSalesGoalsData: state.SalesReducer.data }
    }
  else {
      toast.error(languageData.global[state.SalesReducer.data.message]);
    }
  }
  if (state.SalesReducer.action === "FETCH_AVAILABLE_MONTHS") {
    if(state.SalesReducer.data.status === 200){
      return {fetchOfficeGoalsData: state.SalesReducer.data }
    }
  else {
      toast.error(languageData.global[state.SalesReducer.data.message]);
    }
  }
  return {}
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    addOfficeSalesGoals:addOfficeSalesGoals,
    fetrchOfficeSalesGoals: fetrchOfficeSalesGoals,
    fetrchOfficeSalesGoalsNm: fetrchOfficeSalesGoalsNm,
    fetchAvailableMonths: fetchAvailableMonths
  },dispatch)
}

export default connect(mapStateToProps,mapDispatchToProps)(AddOfficeSalesGoals);
