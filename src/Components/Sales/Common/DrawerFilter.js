import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DefinedRange, DateRangePicker } from 'react-date-range';
import { exportCashRegisterLogs } from '../../../Actions/Sales/salesActions.js';
import calenLogo from '../../../images/calender.svg';
import { format, addDays } from 'date-fns';
import moment from 'moment';
import { ToastContainer, toast } from "react-toastify";
import config from '../../../config';

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
    (obj && obj !== 'current') && employeeIdList.push(obj);
  })
  return employeeIdList;
}

class DrawerFilter extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const dateFormat = localStorage.getItem('dateFormat');
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
      // toDate: '2020-05-31',
      // fromDate: '2018-03-01',
      showCalendar    : false,
      search_key: '',
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
      selectedInvoices: 5,
      focusSearch: false,
      startDate: new Date(),
      endDate: new Date(),
      showLoader: false,
      clicked: 0
    };
    localStorage.setItem("showLoader", true);
  }

  componentDidMount(){
    localStorage.setItem("showLoader", true);
    document.addEventListener('click', this.handleClick, false);
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {};
    if (props.locationArray !== undefined && state.locationArray != props.locationArray) {
      returnState.locationArray= props.locationArray;
      returnState.totalLocationIdList=(state.userChanged) ? state.totalLocationIdList :  getIdOfLocations(returnState.locationArray);
      returnState.selectedLocationIdList =(state.userChanged) ? state.selectedLocationIdList :  getIdOfLocations(returnState.locationArray);
    }
    if (props.employeeArray !== undefined && state.employeeArray != props.employeeArray) {
      returnState.employeeArray= props.employeeArray;
      returnState.totalEmployeeIdList= (state.userChanged) ? state.totalEmployeeIdList : getIdOfEmployees(returnState.employeeArray);
      returnState.selectedEmployeeIdList = (state.userChanged) ? state.selectedEmployeeIdList : getIdOfEmployees(returnState.employeeArray);
    }
    if (props.invoicesArray !== undefined && state.invoicesArray.length != props.invoicesArray.length) {
      props.invoicesArray.map((obj, idx) => {
        returnState[Object.keys(obj)] = (state.userChanged) ? state[Object.keys(obj)] : true;
      })
      returnState.selectedInvoices= 5;
      returnState.invoicesArray= props.invoicesArray;
    }
    if (props.exportFunctionCall !== undefined && props.exportFunctionCall.status === 200 && state.exportFunctionCall != props.exportFunctionCall){

      if(localStorage.getItem("showLoader") == "false") {
        returnState.exportFunctionCall= props.exportFunctionCall;
        returnState.showLoader= false;
        //window.location.href=props.exportFunctionCall.data.file;
        window.open(config.API_URL+"download-data/"+props.exportFunctionCall.data.file, "_blank");
      }
    } else if (props.exportFunctionCall !== undefined && props.exportFunctionCall.status !== 200 && state.exportFunctionCall != props.exportFunctionCall){
      returnState.exportFunctionCall= props.exportFunctionCall;
      returnState.showLoader= false;
    }

    if(props.fromDate !== undefined && props.fromDate != state.fromDate) {
      returnState.fromDate = props.fromDate;
      returnState.toDate = props.toDate;
      returnState.startDate = moment(props.fromDate).toDate();
      returnState.endDate = moment(props.toDate).toDate();
    }
    return returnState;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleClick = (event) =>  {
    let flag = false;
    if (this.node.contains(event.target) && this.state.showCalendar === true ) {
      return
    }
    this.toggleCalendar(event.target);

    let selctedLocationClass = "new-dropdown-menu no-display";
    let selctedEmployeeClass = "new-dropdown-menu no-display";
    let selctedInvoicesClass = "new-dropdown-menu no-display";


    if (this.muli_sel_btn_nps.contains(event.target)){
      selctedLocationClass = "new-dropdown-menu";
    }
    else if( this.state.islocationArrayListApi){
        this.setState({islocationArrayListApi:false});
        flag = true;
      }
    if (this.muli_sel_btn_eps.contains(event.target)){
      selctedEmployeeClass = "new-dropdown-menu";
    }
    else if(this.state.isemployeeArrayListApi){
        this.setState({isemployeeArrayListApi:false});
        flag = true;
    }

    if (this.muli_sel_btn_ips.contains(event.target)){
      selctedInvoicesClass = "new-dropdown-menu";
    }
    else if(this.state.isinvoicesArrayListApi){
        this.setState({isinvoicesArrayListApi:false});
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
      this.props.handleChildSubmit({selectedEmployeeIdList:this.state.selectedEmployeeIdList, selectedLocationIdList:this.state.selectedLocationIdList, selectedInvoicesIdList: arr, fromDate:this.state.startDate, toDate:this.state.endDate,canSubmit: true})
    }
    this.setState({selctedInvoicesClass:selctedInvoicesClass, selctedLocationClass:selctedLocationClass,  selctedEmployeeClass:selctedEmployeeClass});
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
    if(flag){
      if(this.state.invoicesArray) {
        this.state.invoicesArray.map((obj, idx) => {
          if(this.state[Object.keys(obj)]) {
            arr.push(Object.keys(obj)[0]);
          }
        })
      }
    }
    this.props.handleChildSubmit({selectedEmployeeIdList:this.state.selectedEmployeeIdList, selectedLocationIdList:this.state.selectedLocationIdList, selectedInvoicesIdList: arr, fromDate:this.state.startDate, toDate:this.state.endDate, search_key:this.state.search_key})
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

    this.setState({showCalendar : showCalendar, clicked: 0})
  }

  dateRangeOnChange = (payload) => {
    /*this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
    });*/

    let startDate = payload.selection.startDate
    let endDate   = payload.selection.endDate
    //startDate     = format(startDate,'YYYY-MM-DD')
    //endDate       = format(endDate,'YYYY-MM-DD')
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
      clicked     : clicked
    });

    //this.handleSubmit(which, {"fromDate" : startDate, "toDate" : endDate})
    if ( clicked && clicked % 2 === 0 ) {
      this.props.handleChildSubmit({selectedInvoicesIdList:this.state.selectedInvoicesIdList, selectedLocationIdList:this.state.selectedLocationIdList, selectedEmployeeIdList:this.state.selectedEmployeeIdList, fromDate:startDate, toDate:endDate, canSubmit: true})
    } else {
      this.props.handleChildSubmit({fromDate:startDate, toDate:endDate, canSubmit: false})
    }
  }

  dateRangeOnShownDateChange = (which, payload) => {
    /*this.setState({
      [which]: {
        ...this.state[which],
        ...payload,
      },
    });*/

    //this.handleSubmit(which, {"fromDate" : startDate, "toDate" : endDate})
    //this.props.handleChildSubmit({selectedLocationIdList:this.state.selectedLocationIdList,fromDate:startDate, toDate:endDate})
  }

  selectedInvoicesIdList = (event) => {
    const target = event.target;
    const name = event.target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    let count = 0;
    this.state.invoicesArray.map((obj, idx) => {
      if(this.state[Object.keys(obj)]) {
        count += 1;
      }
      if(name == Object.keys(obj) && value) {
        count = count + 1;
      } else if (name == Object.keys(obj) && !value) {
        count = count-1;
      }
    });
    this.setState({
        [event.target.name]: value,
        isinvoicesArrayListApi: true,
        userChanged : true,
        selectedInvoices : count
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
    let id = checkboxName[1];
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
    if(eventSelectedInvoices == 'unselect'){
      eventSelectedInvoices = 'select';
      this.state.invoicesArray.map((obj, idx) => {
        returnState[Object.keys(obj)] = false;
        returnState.selectedInvoices = 0;
      })
    }
       else {
    if(eventSelectedInvoices == 'select'){
      eventSelectedInvoices = 'unselect';
      this.state.invoicesArray.map((obj, idx) => {
        returnState[Object.keys(obj)] = true;
        returnState.selectedInvoices = 5;
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

  handleExport = (value) => {
    //this.setState(value);
    let formData = {
      'params'   : {
        from    : this.state.fromDate,
        to      : this.state.toDate,
        type    : value,
      }
    }

    if(this.state.selectedLocationIdList && this.state.selectedLocationIdList.length> 0) {
      formData.params.clinic_id = this.state.selectedLocationIdList
    }

    this.showLoaderFunc();
    this.setState({showLoader: true});
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

    //this.handleSubmit(which, {"fromDate" : startDate, "toDate" : endDate})
    //this.props.handleChildSubmit({selectedLocationIdList:this.state.selectedLocationIdList,fromDate:startDate, toDate:endDate})
  }

  handleSelect = (ranges) => {
    this.setState({startDate: ranges.selection.startDate, endDate: ranges.selection.endDate})
    // {
    //  selection: {
    //    startDate: [native Date Object],
    //    endDate: [native Date Object],
    //  }
    // }
  }

  showActionName = (action) => {
    let returnText = ''

    if ( action === 'cash_in' ) {
      returnText = this.state.salesLang.sales_cash_in
    } else if ( action === 'cash_out' ) {
      returnText = this.state.salesLang.sales_cash_out
    } else if ( action === 'bank_drop' ) {
      returnText = this.state.salesLang.sales_bank_drop
    } else if ( action === 'open' ) {
      returnText = this.state.globalLang.label_open
    } else if ( action === 'close' ) {
      returnText = this.state.globalLang.label_close
    } else if ( action === 'close_edit' ) {
      returnText = this.state.salesLang.sales_close_edit
    }

    return returnText
  }
  render() {
    let selectionRange = {
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      key: 'selection',
    }
    return (
      <div className="setting-search-outer">
        <form onSubmit={this.handleSubmit}>
          <div className={this.props.searchShow ? "search-bg new-search" : "search-bg new-search no-display"}>
            <i className="fas fa-search" />
            <input className="setting-search-input chart_search" name="search_key" placeholder="Search" value={this.state.search_key}
             onFocus={() => this.setState({ focusSearch: true })} autoComplete="off" onChange={this.handleInputChange} ref={searchFocus => {this.searchFocus = searchFocus}}
             />
             <div className={(this.state.focusSearch && this.props.searchFocus && this.state.search_key == '') ? "giftcard-suggestion" : "giftcard-suggestion  no-display"} style={{}}>
                <ul>
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
              className={'CalendarPreviewArea'}
              ranges={[selectionRange]}
              onChange={this.dateRangeOnChange}
              maxDate = {new Date()}
              dragSelectionEnabled={false}
            /> }
            <input onChange={this.handleInputChange} type="text" className="input-cal setting-search-input" name="calendar-input" value={moment(this.state.startDate).format(this.state.dateFormat) + `-` + moment(this.state.endDate).format(this.state.dateFormat)} />
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

          <div className={this.props.location ? "multi-sel-btn" : "multi-sel-btn no-display"} ref={muli_sel_btn_nps => {this.muli_sel_btn_nps = muli_sel_btn_nps}}>{this.state.salesLang.sales_selected_locations} ({(this.state.selectedLocationIdList) ? this.state.selectedLocationIdList.length : 0})
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
          <div className={this.props.employee ? "multi-sel-btn" : "multi-sel-btn no-display"} ref={muli_sel_btn_eps => {this.muli_sel_btn_eps = muli_sel_btn_eps}}>{this.state.salesLang.sales_selected_actions} ({(this.state.selectedEmployeeIdList) ? this.state.selectedEmployeeIdList.length : 0})
            <ul className={this.state.selctedEmployeeClass}>
              <li id="select_btn_li">
                <a href="javascript:void(0);" className="line-btn text-center" name='eps' onClick={this.toggleEmployeeFilter}>{(this.state.eventSelectedEmployee == 'unselect') ? this.state.salesLang.sales_unselect_all : this.state.salesLang.sales_select_all }</a>
              </li>
              {(this.state.employeeArray.length > 0)
                &&
                this.state.employeeArray.map((obj, idx) => {
                  return(
                    (obj && obj !== 'current') && <li key={'selected-actions-'+obj}>
                      <label>
                        <input type="checkbox" checked={(this.state.selectedEmployeeIdList.indexOf(obj) > -1) ? 'checked' : false} value={(this.state.selectedEmployeeIdList.indexOf(obj) > -1) ? true : false} name={'actions-'+obj} onChange={this.selectedEmployeeIdList} /> {this.showActionName(obj)}
                      </label>
                    </li>
                    )
                  })
                }
            </ul>
          </div>
          <div className="export pull-right">
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
          <div className={this.props.total_active_members_value == true ? "search-text pull-right m-r-5" : "no-display"}><b>{this.state.salesLang.sales_total_active_members} :  {this.props.total_active_members}</b></div>
          <div className={this.props.total_liability_value == true ? "search-text pull-right m-r-5" : "no-display"}><b>{this.state.salesLang.sales_total_liability} :  {this.props.total_liability}</b></div>
          <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader clientProfileLoader' : 'new-loader text-left'}>
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
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  localStorage.setItem("showLoader", false);
  if (state.SalesReducer.action === "EXPORT_CASH_DRAWER_LOG") {
    if (state.SalesReducer.data.status === 200) {
      return {
  			exportFunctionCall: state.SalesReducer.data
      };
    } else {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      return {
  			exportFunctionCall: state.SalesReducer.data
      }
    }
  }
  else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
      exportFunction: exportCashRegisterLogs
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(DrawerFilter);
