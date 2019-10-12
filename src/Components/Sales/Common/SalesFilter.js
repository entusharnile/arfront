import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import { exportSalesSummary } from '../../../Actions/Sales/salesActions.js';
import calenLogo from '../../../images/calender.svg';
import { format, addDays } from 'date-fns';
import moment from 'moment';
import config from '../../../config';
const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}

const getIdOfLocations = (locationsArray) => {
  let locationIdList = [];

  locationsArray.map((obj,idx) => {
    locationIdList.push(obj.id);
  })
  return locationIdList;
}

const getIdOfEmployees = (employeeArray) => {
  let employeeIdList = [];
  employeeArray.map((obj,idx) => {
    employeeIdList.push(obj.id);
  })
  return employeeIdList;
}

class SalesFilter extends Component {
  constructor(props) {
    super(props);
    const dateFormat = localStorage.getItem('dateFormat');
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));

    let selectionRangeLocalVar = 'selectionRange';
    if(this.props.reportType == 'invoices') {
      selectionRangeLocalVar = selectionRangeLocalVar + '-invoices';
    } else {
      selectionRangeLocalVar = selectionRangeLocalVar + '-report';
    }
    const dateData = localStorage.getItem(selectionRangeLocalVar);
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate
    const endD = valR.endDate

    /*const countValu= localStorage.getItem('countVal');
    const countValue= JSON.parse(countValu);*/

    this.state = {
      dateFormat: dateFormat,
      globalLang:languageData.global,
      settingsLang:languageData.settings,
      dateRangePicker: {
        selection: {
          startDate: new Date(),
          endDate: new Date(),
          key: 'selection',
        },
      },
      toDate         : format(new Date(), 'YYYY-MM-DD'),
      fromDate       : format(new Date(), 'YYYY-MM-DD'),
      showCalendar    : false,
      search_key: '',
      dateRangeValue: '',
      churn_filter: '',
      churnActive: false,
      selctedLocationClass:"new-dropdown-menu no-display",
      selctedEmployeeClass:"new-dropdown-menu no-display",
      selctedInvoicesClass:"new-dropdown-menu no-display",
      islocationArrayListApi: false,
      isemployeeArrayListApi: false,
      isinvoicesArrayListApi: false,
      islocationArrayListUpdated:false,
      isemployeeArrayListUpdated:false,
      isinvoicesArrayListUpdated:false,
      totalLocationIdList :[],
      salesLang: languageData.sales,
      selectedLocationIdList :[],
      selectedEmployeeIdList :[],
      selectedInvoicesIdList :[],
      locationArray :[],
      employeeArray :[],
      invoicesArray :[],
      eventSelectedLocation : 'unselect',
      eventSelectedEmployee: 'unselect',
      eventSelectedInvoices: 'unselect',
      expType: 'csv',
      expoType: 'xls',
      bothVal: 'both',
      cancelClient: "manual",
      cancelPayment: "payment_failed",
      selectedInvoices: 6,
      focusSearch: false,
      startDate: dateData ? startD : new Date() ,
      endDate: dateData ? endD : new Date(),
      clicked:0,
      selectionRangeLocalVar: selectionRangeLocalVar,
      dateData: dateData
    };
    localStorage.setItem("showLoader", true);
  }

  componentDidMount(){
    var element = document.getElementById("root");
    element.scrollIntoView();
    let selectionRangeLocalVar = 'selectionRange';
    if(this.props.reportType == 'invoices') {
      selectionRangeLocalVar = selectionRangeLocalVar + '-invoices';
    } else {
      selectionRangeLocalVar = selectionRangeLocalVar + '-report';
    }
    const dateData = localStorage.getItem(selectionRangeLocalVar);
    const valR = dateData ? JSON.parse(dateData) : '';
    const localInvoicesArray= localStorage.getItem('localInvoicesArray');
    const localInvoicesArrays = localInvoicesArray ? JSON.parse(localInvoicesArray) : '' ;
    /*const localSelectedEmployeeIdList= localStorage.getItem('localSelectedEmployeeIdList') ;
    const localSelectedEmployeeIdLists = localSelectedEmployeeIdList ? JSON.parse(localSelectedEmployeeIdList) : '' ;
    const localSelectedLocationIdList= localStorage.getItem('localSelectedLocationIdList') ;
    const localSelectedLocationIdLists = localSelectedLocationIdList ? JSON.parse(localSelectedLocationIdList) : '' ;*/
    const startD = valR.startDate ;
    const endD = valR.endDate ;
    this.setState({
      startDate: startD,
      endDate: endD,
      //clinic_id: localSelectedLocationIdLists ? localSelectedLocationIdLists : '' ,
      //user_id: localSelectedEmployeeIdLists ? localSelectedEmployeeIdLists : '',
      //invoice_status: localInvoicesArrays ? localInvoicesArrays : '',
      selectionRangeLocalVar: selectionRangeLocalVar,
      dateData: dateData
    })
    localStorage.setItem("showLoader", true);
    document.addEventListener('click', this.handleClick, false);
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {};
    /*const countValu= localStorage.getItem('countVal');
    const countValue= JSON.parse(countValu);*/
    /*let localSelectedLocationIdList = localStorage.getItem('localSelectedLocationIdList');
    let localSelectedEmployeeIdList = localStorage.getItem('localSelectedEmployeeIdList');*/
    if (props.locationArray !== undefined && state.locationArray != props.locationArray) {
      returnState.locationArray= props.locationArray;
      returnState.totalLocationIdList= (state.userChanged) ? state.totalLocationIdList : getIdOfLocations(returnState.locationArray);


      returnState.selectedLocationIdList = (state.userChanged) ? state.selectedLocationIdList :  getIdOfLocations(returnState.locationArray);
    }
    if (props.employeeArray !== undefined && state.employeeArray != props.employeeArray) {
      returnState.employeeArray= props.employeeArray;
      returnState.totalEmployeeIdList= (state.userChanged) ? state.totalEmployeeIdList : getIdOfEmployees(returnState.employeeArray);

      returnState.selectedEmployeeIdList = (state.userChanged) ? state.selectedEmployeeIdList : getIdOfEmployees(returnState.employeeArray);
    }
    if (props.invoicesArray !== undefined && !state.userChanged) {
      let selectedInvoicesIdList = [];
      //const localInvoicesArray= localStorage.getItem('localInvoicesArray');
      //const localInvoicesArrays = localInvoicesArray ? JSON.parse(localInvoicesArray) : '' ;
      props.invoicesArray.map((obj, idx) => {
        returnState[Object.keys(obj)] = (state.userChanged) ? state[Object.keys(obj)] : true;
        selectedInvoicesIdList.push(Object.keys(obj)[0])
      })
      returnState.selectedInvoicesIdList = selectedInvoicesIdList;
      returnState.selectedInvoices= 6;
      returnState.invoicesArray= props.invoicesArray;
    }
    if (props.exportFunctionCall !== undefined && state.exportFunctionCall != props.exportFunctionCall){
      if(localStorage.getItem("showLoader") == "false") {
        returnState.exportFunctionCall= props.exportFunctionCall;
        window.open(config.API_URL+"download-data/"+props.exportFunctionCall.data.file, "_blank");
      }
    }

    if(props.reportType != state.reportType) {
      returnState.reportType = props.reportType;
    }
    return returnState;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleClick = (event) =>  {
    let flag = false;
    let returnState = {}
    if(event.target.className == "line-btn text-center"){
      return
    }
    if (this.node.contains(event.target) && this.state.showCalendar === true ) {
      return
    }

    this.toggleCalendar(event.target);
    if (this.searchFocus.contains(event.target)) {
      return
    }
    else {
      returnState.focusSearch = false;
    }

    let selctedLocationClass = "new-dropdown-menu no-display";
    let selctedEmployeeClass = "new-dropdown-menu no-display";
    let selctedInvoicesClass = "new-dropdown-menu no-display";

    if (this.muli_sel_btn_nps.contains(event.target)){
      selctedLocationClass = "new-dropdown-menu";
    }
    else if( this.state.islocationArrayListApi){
        returnState.islocationArrayListApi  = false;
        flag = true;
      }
    if (this.muli_sel_btn_eps.contains(event.target)){
      selctedEmployeeClass = "new-dropdown-menu";
    }
    else if(this.state.isemployeeArrayListApi){
        returnState.isemployeeArrayListApi = false;
        flag = true;
    }

    if (this.muli_sel_btn_ips.contains(event.target)){
      selctedInvoicesClass = "new-dropdown-menu";
    }
    else if(this.state.isinvoicesArrayListApi){
        returnState.isinvoicesArrayListApi = false;
        flag = true;
    }

    let arr = []
    if(flag){
      if(this.state.invoicesArray) {
        this.state.invoicesArray.map((obj, idx) => {
          if(this.state[Object.keys(obj)]) {
            arr.push(Object.keys(obj)[0]);
          }
        })
      }
      /*localStorage.setItem("countVal", this.state.selectedInvoices);
      localStorage.setItem("localInvoicesArray", JSON.stringify(this.state.selectedInvoicesIdList));
      localStorage.setItem("localSelectedEmployeeIdList", JSON.stringify(this.state.selectedEmployeeIdList));
      localStorage.setItem("localSelectedLocationIdList", JSON.stringify(this.state.selectedLocationIdList));*/
      returnState.selectedInvoicesIdList = arr
      this.setState(returnState, () => {
        this.props.handleChildSubmit({selectedEmployeeIdList:this.state.selectedEmployeeIdList, selectedLocationIdList:this.state.selectedLocationIdList, selectedInvoicesIdList: arr, fromDate:this.state.startDate, toDate:this.state.endDate, canSubmit: true })
      })
    }
    returnState.selctedInvoicesClass = selctedInvoicesClass;
    returnState.selctedLocationClass = selctedLocationClass;
    returnState.selctedEmployeeClass = selctedEmployeeClass;
    returnState.userChanged = true;
    this.setState(returnState);
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    let arr = [];
    let flag = false;
      if(this.state.invoicesArray) {
        this.state.invoicesArray.map((obj, idx) => {
          if(this.state[Object.keys(obj)]) {
            arr.push(Object.keys(obj)[0]);
          }
        })
      }
    this.props.handleChildSubmit({selectedEmployeeIdList:this.state.selectedEmployeeIdList, selectedLocationIdList:this.state.selectedLocationIdList, selectedInvoicesIdList: arr, fromDate:this.state.startDate, toDate:this.state.endDate, search_key:this.state.search_key, canSubmit: true})
  };

  toggleCalendar = (elem) => {
    if ( elem.name !== 'calendar-input' && this.state.showCalendar === false ) {
      return
    }

    let showCalendar = false

    if (this.state.showCalendar === false && elem.name !== undefined && elem.name === 'calendar-input' ) {
      showCalendar = true
    } else {
      showCalendar = false
    }

    this.setState({showCalendar : showCalendar})
  }

  dateRangeOnChange = (payload) => {
    let payloadValue = {}
    if(payload){
      payloadValue = {
        startDate: payload.selection.startDate,
        endDate: payload.selection.endDate,
        key: 'selection',
      }
      localStorage.setItem(this.state.selectionRangeLocalVar, JSON.stringify(payloadValue));
    }
    let startDate = payload.selection.startDate
    let endDate   = payload.selection.endDate
    let clicked      = this.state.clicked + 1;
    let localPref = localStorage.getItem('focusedRange');
    let canBypass = (localPref && localPref === 'oneClick') ? true : false;

    if (canBypass) {
      clicked = 2;
    }

    let showCalendar = true;

    if ( clicked % 2 === 0 ) {
      showCalendar = false;
    }

    this.setState({
      showCalendar : showCalendar,
      fromDate    : startDate,
      toDate      : endDate,
      startDate   : startDate,
      endDate     : endDate,
      clicked     : clicked,
      dateData    : JSON.stringify(payloadValue)
    });

    if ( clicked && clicked % 2 === 0 ) {
      /*localStorage.setItem("localInvoicesArray", JSON.stringify(this.state.selectedInvoicesIdList));
      localStorage.setItem("localSelectedEmployeeIdList", JSON.stringify(this.state.selectedEmployeeIdList));
      localStorage.setItem("localSelectedLocationIdList", JSON.stringify(this.state.selectedLocationIdList));*/
      this.props.handleChildSubmit({selectedInvoicesIdList:this.state.selectedInvoicesIdList, selectedLocationIdList:this.state.selectedLocationIdList, selectedEmployeeIdList:this.state.selectedEmployeeIdList, fromDate:startDate, toDate:endDate, canSubmit: true})
    } else {
      this.props.handleChildSubmit({fromDate:startDate, toDate:endDate, canSubmit: false})
    }
  }

  dateRangeOnShownDateChange = (which, payload) => {

  }

  selectedInvoicesIdList = (event) => {
    const target = event.target;
    const name = event.target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    let count = 0;
    let selectedInvoicesIdList = this.state.selectedInvoicesIdList;
    this.state.invoicesArray.map((obj, idx) => {
      if(this.state[Object.keys(obj)]) {
        count += 1;
      }
      if(name == Object.keys(obj) && value) {
        if(selectedInvoicesIdList.indexOf(Object.keys(obj)[0]) == -1) {
          selectedInvoicesIdList.push(Object.keys(obj)[0])
        }
        count = count + 1;
      } else if (name == Object.keys(obj) && !value) {
        count = count-1;
        selectedInvoicesIdList.splice(selectedInvoicesIdList.indexOf(Object.keys(obj)[0]), 1)
      }
      //localStorage.setItem("countVal", JSON.stringify(count));
    });
    /*const countValu= localStorage.getItem('countVal');
    const countValue= JSON.parse(countValu);*/
    this.setState({
        [event.target.name]: value,
        isinvoicesArrayListApi: true,
        userChanged : true,
        selectedInvoices : count,
        selectedInvoicesIdList: selectedInvoicesIdList
    });
  }

  selectedLocationIdList = (event) => {
    let checkboxName = event.target.name.split('-');
    let id = parseInt(checkboxName[1]);
    let checkboxValue = event.target.value;
    let existOrNot = this.state.selectedLocationIdList.indexOf(id);
    let selectedLocationIdList = this.state.selectedLocationIdList;
    if(checkboxValue == 'true'){
      selectedLocationIdList.splice(existOrNot, 1);
    } else{
      selectedLocationIdList.push(id);
    }
    this.setState({
      selectedLocationIdList :selectedLocationIdList,
      islocationArrayListApi: true,
      userChanged : true
    });
  }

  selectedEmployeeIdList = (event) => {
    let checkboxName = event.target.name.split('-');
    let id = parseInt(checkboxName[1]);
    let checkboxValue = event.target.value;
    let existOrNot = this.state.selectedEmployeeIdList.indexOf(id);
    let selectedEmployeeIdList = this.state.selectedEmployeeIdList;
    if(checkboxValue == 'true'){
      selectedEmployeeIdList.splice(existOrNot, 1);
    } else{
      selectedEmployeeIdList.push(id);
    }
    this.setState({
      selectedEmployeeIdList :selectedEmployeeIdList,
      isemployeeArrayListApi: true,
      userChanged : true
    });
  }

  toggleInvoicesFilter = (event) => {
    let eventSelectedInvoices = this.state.eventSelectedInvoices;
    let returnState = {};
    /*const countValu= localStorage.getItem('countVal');
    const countValue= JSON.parse(countValu);*/
    returnState.selectedInvoicesIdList = []
    if(eventSelectedInvoices == 'unselect'){
      eventSelectedInvoices = 'select';
      this.state.invoicesArray.map((obj, idx) => {
        returnState[Object.keys(obj)] = false;
        returnState.selectedInvoices = 0;

      })
    } else {
      if(eventSelectedInvoices == 'select'){
        eventSelectedInvoices = 'unselect';
        this.state.invoicesArray.map((obj, idx) => {
          returnState[Object.keys(obj)] = true;
          returnState.selectedInvoices = 6;
          returnState.selectedInvoicesIdList.push(Object.keys(obj)[0])
        })
      }
    }
    returnState.eventSelectedInvoices = eventSelectedInvoices;
    returnState.islocationArrayListApi = true;
    returnState.userChanged = true;
    this.setState(returnState)
  }

  toggleLocationFilter = (event) => {
    let selectedLocationIdList = this.state.selectedLocationIdList;
    let eventSelectedLocation = this.state.eventSelectedLocation;
    if(eventSelectedLocation == 'unselect'){
      selectedLocationIdList = [];
      eventSelectedLocation = 'select'
    } else {
    if(eventSelectedLocation == 'select'){
      selectedLocationIdList = this.state.totalLocationIdList;
      eventSelectedLocation = 'unselect'
    }
  }
    this.setState({
      selectedLocationIdList:selectedLocationIdList,
      eventSelectedLocation:eventSelectedLocation,
      islocationArrayListApi: true,
      userChanged : true
    })
  }

  toggleEmployeeFilter = (event) => {
    let selectedEmployeeIdList = this.state.selectedEmployeeIdList;
    let eventSelectedEmployee = this.state.eventSelectedEmployee;
    if(eventSelectedEmployee == 'unselect'){
      selectedEmployeeIdList = [];
      eventSelectedEmployee = 'select'
    } else {
        if(eventSelectedEmployee == 'select'){
        selectedEmployeeIdList = this.state.totalEmployeeIdList;
        eventSelectedEmployee = 'unselect'
      }
    }
    this.setState({
      selectedEmployeeIdList:selectedEmployeeIdList,
      eventSelectedEmployee:eventSelectedEmployee,
      isemployeeArrayListApi: true,
      userChanged : true
    })
  }

  showLoaderFunc = ()  => {
    localStorage.setItem("showLoader", false);
  }

  handleChurnedReason = (value) => {
    var valSetHere = value;
    const dateData = this.state.dateData;
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate ;
    const endD = valR.endDate ;
    this.setState({
      churn_filter : value,
      churnActive: true
    })
    this.props.handleChildSubmit({fromDate:startD, toDate:endD, churn_filter: value});
  }

  handleExport = (value) => {
    const dateData = this.state.dateData;
    const valR = dateData ? JSON.parse(dateData) : '';
    const startD = valR.startDate
    const endD = valR.endDate
    let formData = {
      fromDate: apiDateFormat(startD),
      toDate: apiDateFormat(endD),
      export_type: value,
      export_name: this.props.reportType,
      churn_filter: this.state.churn_filter
    }

    if (this.props.clinic_id && this.props.clinic_id.length > 0){
      formData.clinic_id =  this.props.clinic_id
    } else {
      let clinicIds = this.state.locationArray.map((obj, idx) => {
        return obj.id;
      })
      if(this.props.clinic_id){
        formData.clinic_id = clinicIds;
      }
    }
    if(this.props.user_id && this.props.user_id.length> 0) {
      formData.user_id = this.props.user_id
    } else {
      let empIds = this.state.employeeArray.map((obj, idx) => {
        return obj.id;
      })
      if(this.props.user_id){
        formData.user_id = empIds;
      }
    }
    if(this.props.invoice_status && this.props.invoice_status.length> 0) {
      formData.invoice_status = this.props.invoice_status
    } else {
      let empIds = this.state.invoicesArray.map((obj, idx) => {
        return Object.keys(obj)[0]
      })
      if(this.props.invoice_status){
        formData.invoice_status = empIds;
      }
    }

    this.showLoaderFunc();
    this.props.exportFunction(formData);
  }

  _onFocus() {
    this.setState({focusSearch : true})
  }

   handleRangeChange = (which, payload) => {
    let startDate = payload.selection.startDate
    let endDate   = payload.selection.endDate
    startDate     = format(startDate,'YYYY-MM-DD')
    endDate       = format(endDate,'YYYY-MM-DD')

    this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
      showCalendar : false,
      fromDate    : startDate,
      toDate      : endDate
    });
  }

  handleSelect = (ranges) => {
    this.setState({startDate: ranges.selection.startDate, endDate: ranges.selection.endDate})
  }

  render() {
    let selectionRange = {};
    if (this.state.dateData) {
      selectionRange = JSON.parse(this.state.dateData)
    }
    else {
      selectionRange = {
      startDate: (this.state.startDate) ? this.state.startDate : new Date(),
      endDate: (this.state.endDate) ? this.state.endDate : new Date(),
      key: 'selection',
      }
    }
    let catStatusLabel = '';
    if (this.state.churn_filter == 'both') {
      catStatusLabel = 'All';
    } else if (this.state.churn_filter == 'manual') {
      catStatusLabel = this.state.salesLang.sales_cancelled_by_client;
    } else if (this.state.churn_filter == 'payment_failed') {
      catStatusLabel = 'Cancelled by Payment Decline';
    }
    else {
      catStatusLabel = 'All'
    }
    return (
      <div className="setting-search-outer">
        <form onSubmit={this.handleSubmit}>
          <div className={this.props.searchShow ? "search-bg new-search" : "search-bg new-search no-display"}>
            <i className="fas fa-search" />
            <input className="setting-search-input chart_search" name="search_key" placeholder="Search" value={this.state.search_key}
             onFocus={() => this.setState({ focusSearch: true })} autoComplete="off" onChange={this.handleInputChange} ref={searchFocus => {this.searchFocus = searchFocus } }
             />
             <div className={(this.state.focusSearch && this.props.searchFocus && this.state.search_key == '') ? "giftcard-suggestion" : "giftcard-suggestion no-display"} style={{}} ref={node => {this.node = node}}>
                <ul ref={node => {this.node = node}}>
                  <li className="suggestion-li"><a onClick={() => {this.setState({ search_key: 'to:', focusSearch: false }); this.searchFocus.focus()}} className="suggestion-a"><span>{this.state.salesLang.sales_to}:</span>{this.state.salesLang.sales_recipient_name}</a></li>
                  <li className="suggestion-li"><a onClick={() => {this.setState({ search_key: 'from:', focusSearch: false }); this.searchFocus.focus()}} className="suggestion-a"><span>{this.state.salesLang.sales_from}:</span>{this.state.salesLang.sales_buyer_name}</a></li>
                  <li className="suggestion-li"><a onClick={() => {this.setState({ search_key: 'card number:', focusSearch: false }); this.searchFocus.focus()}} className="suggestion-a"><span>{this.state.salesLang.sales_card_number}:</span>{this.state.salesLang.sales_redemption_code}</a></li>
                </ul>
             </div>
          </div>
        </form>

        <div className={ this.props.dateRangePick ? "search-bg new-calender pull-left" : 'no-display' } ref={node => {this.node = node}}>
          <img src={calenLogo} />
           { this.state.showCalendar && <DateRangePicker
             value={selectionRange}
              className={'CalendarPreviewArea'}
              ranges={[selectionRange]}
              onChange={this.dateRangeOnChange}
              maxDate = {new Date()}
              dragSelectionEnabled={false}
            /> }
            <input onChange={this.handleInputChange} type="text" className="input-cal setting-search-input" name="calendar-input" value={moment(this.state.startDate).format(this.state.dateFormat) + `-` + moment(this.state.endDate).format(this.state.dateFormat)}  />
        </div>
          <div className={this.props.invoices ? "multi-sel-btn" : "multi-sel-btn no-display"} ref={muli_sel_btn_ips => {this.muli_sel_btn_ips = muli_sel_btn_ips}}>{this.state.salesLang.sales_selected_invoices} ({this.state.selectedInvoices})
            <ul className={this.state.selctedInvoicesClass}>
              <li id="select_btn_li">
                <a href="javascript:void(0);" className="line-btn text-center" name='ips' onClick={this.toggleInvoicesFilter}>{(this.state.eventSelectedInvoices == 'unselect') ? this.state.salesLang.sales_unselect_all : this.state.salesLang.sales_select_all }</a>
              </li>
              {(this.state.invoicesArray.length > 0)
                &&
                this.state.invoicesArray.map((obj, idx) => {
                  return(
                    <li key={'selected-invoices-'+idx}>
                      <label>
                        <input type="checkbox" checked={(this.state[Object.keys(obj)]) ? 'checked' : false} value={Object.keys(obj)} name={Object.keys(obj)} onChange={this.selectedInvoicesIdList} /> {Object.values(obj)}
                      </label>
                    </li>
                    )
                  })
                }
            </ul>
          </div>

          <div className={this.props.location ? "multi-sel-btn " : "multi-sel-btn no-display"} ref={muli_sel_btn_nps => {this.muli_sel_btn_nps = muli_sel_btn_nps}}>{this.state.salesLang.sales_selected_locations} ({(this.state.selectedLocationIdList) ? this.state.selectedLocationIdList.length : 0})
            <ul className={this.state.selctedLocationClass}>
              <li id="select_btn_li">
                <a href="javascript:void(0);" className="line-btn text-center" name='nps' onClick={this.toggleLocationFilter}>{(this.state.eventSelectedLocation == 'unselect') ? this.state.salesLang.sales_unselect_all : this.state.salesLang.sales_select_all }</a>
              </li>
              {(this.state.locationArray.length > 0)
                &&
                this.state.locationArray.map((obj, idx) => {
                  return(
                    <li key={'selected-location-'+obj.id}>
                      <label>
                        <input type="checkbox" checked={(this.state.selectedLocationIdList.indexOf(obj.id) > -1) ? 'checked' : false} value={(this.state.selectedLocationIdList.indexOf(obj.id) > -1) ? true : false} name={'locations-'+obj.id} onChange={this.selectedLocationIdList} /> {obj.clinic_name}
                      </label>
                    </li>
                    )
                  })
                }
            </ul>
          </div>
          <div className={this.props.employee ? "multi-sel-btn " : "multi-sel-btn no-display"} ref={muli_sel_btn_eps => {this.muli_sel_btn_eps = muli_sel_btn_eps}}>{this.state.salesLang.sales_selected_employees} ({(this.state.selectedEmployeeIdList) ? this.state.selectedEmployeeIdList.length : 0})
            <ul className={this.state.selctedEmployeeClass}>
              <li id="select_btn_li">
                <a href="javascript:void(0);" className="line-btn text-center" name='eps' onClick={this.toggleEmployeeFilter}>{(this.state.eventSelectedEmployee == 'unselect') ? this.state.salesLang.sales_unselect_all : this.state.salesLang.sales_select_all }</a>
              </li>
              {(this.state.employeeArray.length > 0)
                &&
                this.state.employeeArray.map((obj, idx) => {
                  return(
                    <li key={'selected-employee-'+obj.id}>
                      <label>
                        <input type="checkbox" checked={(this.state.selectedEmployeeIdList.indexOf(obj.id) > -1) ? 'checked' : false} value={(this.state.selectedEmployeeIdList.indexOf(obj.id) > -1) ? true : false} name={'employees-'+obj.id} onChange={this.selectedEmployeeIdList} /> {obj.name}
                      </label>
                    </li>
                    )
                  })
                }
            </ul>
          </div>
          <div className="export pull-right m-l-5 churnFilterExport">
            <div className="dropdown pull-left">
              <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {this.state.salesLang.sales_export}
                <i className="fas fa-angle-down"></i>
              </button>
              <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                <li><a href="javascript:void(0);" name="expType" onClick = {this.handleExport.bind(this, this.state.expType)} >{this.state.salesLang.sales_export_csv}</a></li>
                <li><a href="javascript:void(0);" name="expoType" onClick = {this.handleExport.bind(this, this.state.expoType)} >{this.state.salesLang.sales_export_excel}</a></li>
              </ul>
            </div>
          </div>
          <div className={this.props.ChurnedReason ? "export pull-right " : "no-display"}>
            <span className="search-text m-r-5">{this.state.salesLang.sales_churned_rsn}:</span>
            <div className="dropdown pull-left churnFilter">
              <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {catStatusLabel}
                <i className="fas fa-angle-down"></i>
              </button>
              <ul className="dropdown-menu " aria-labelledby="dropdownMenu1" >
                <li><a href="javascript:void(0);" name="bothVal" onClick = {this.handleChurnedReason.bind(this, this.state.bothVal)} >{this.state.salesLang.sales_all_lbl}</a></li>
                <li><a href="javascript:void(0);" name="cancelClient" onClick = {this.handleChurnedReason.bind(this, this.state.cancelClient)} >{this.state.salesLang.sales_cancelled_by_client}</a></li>
                <li><a href="javascript:void(0);" name="cancelPayment" onClick = {this.handleChurnedReason.bind(this, this.state.cancelPayment)} >{this.state.salesLang.sales_cancelled_by_payment}</a></li>
              </ul>
            </div>
          </div>
          <div className={this.props.total_active_members_value == true ? "search-text pull-right m-r-5" : "no-display"}><b>{this.state.salesLang.sales_total_active_members} :  {this.props.total_active_members}</b></div>
          <div className={this.props.total_liability_value == true ? "search-text pull-right m-r-5" : "no-display"}><b>{this.state.salesLang.sales_total_liability} :  {this.props.total_liability}</b></div>
       </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  localStorage.setItem("showLoader", false);
  if (state.SalesReducer.action === "EXPORT_FILE") {
    if (state.SalesReducer.data.status === 200) {
      return {
  			exportFunctionCall: state.SalesReducer.data
      };
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      exportFunction: exportSalesSummary
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(SalesFilter);
