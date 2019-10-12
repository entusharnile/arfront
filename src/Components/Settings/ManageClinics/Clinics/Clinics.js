import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../../../Containers/Settings/sidebar.js";
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchClinics, exportEmptyData } from "../../../../Actions/clinicsActions.js";
import { autoScrolling } from "../../../../Utils/services.js";

class Clinics extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));

    this.state = {
      clinic_name: '',
      contact_no: '',
      address: '',
      clinic_business_hours: [],
      id: userData.user.id,
      tax: '',
      clinicList: [],
      showLoadingText : false,
      page: 1,
      pagesize: 15,
      sortorder: 'asc',
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      loadMore: true,
      startFresh: true,
			showLoader: false,
			scopes: 'business_hours'
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    /*window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        this.loadMore();
      }
    };*/
    window.onscroll = () => {
     const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
     if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
       this.loadMore();
     }
   };
  }

  componentDidMount() {
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: "asc",
				term: this.state.term,
				scopes : this.state.scopes
      }
    };
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.setState({
      clinic_Create_ClinicBtn: languageData.settings['clinic_Create_ClinicBtn'],
      clinics_Address: languageData.settings['clinics_Address'],
      clinics_Business_Hours: languageData.settings['clinics_Business_Hours'],
      clinics_Clinic_Name: languageData.settings['clinics_Clinic_Name'],
      clinics_Contact_Number: languageData.settings['clinics_Contact_Number'],
      clinics_Search: languageData.settings['clinics_Search'],
      clinics_Clinic_Name: languageData.settings['clinics_Clinic_Name'],
      clinics_Tax:languageData.settings['clinics_Tax'],
      clinic_No_Record_Found: languageData.settings['clinic_No_Record_Found'],
      clinic_Please_Wait: languageData.settings['clinic_Please_Wait'],
      loading_please_wait_text: languageData.global['loading_please_wait_text'],
  })
    this.setState({ 'showLoader': true });
    autoScrolling(true)
    this.props.fetchClinics(formData);
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
		localStorage.setItem('sortOnly', true);
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
				term: this.state.term,
				scopes : this.state.scopes
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: this.state.sortorder == "asc" ? 'asc': 'desc',
      startFresh: true,
      loadMore: true,
      startFresh: true,
      next_page_url: "",
      clinicList: [],
      showLoader: true
    });
    autoScrolling(true)
    this.props.fetchClinics(formData);
  };

  onSort = (sortby) => {
    let sortorder = (this.state.sortorder === 'asc') ? 'desc': 'asc';
    let formData = {'params':{
      page:1,
      pagesize:this.state.pagesize,
      sortby:sortby,
      sortorder: sortorder,
      term:this.state.term
      }
    }
    this.setState({
      page:1,
      pagesize:this.state.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url:'',
      clinicList : []
    });
    localStorage.setItem('sortOnly', false);
    autoScrolling(true)
    this.props.fetchClinics(formData);
  }
  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: true, showLoadingText: true });
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : '',
  				term: this.state.term,
  				scopes : this.state.scopes
        }
      };
      autoScrolling(true)
      this.props.fetchClinics(formData);
    }
  };
  userEdit=( id )=> {
       return (
         <div>
           {this.props.history.push(`/settings/clinic/${id}/edit`)}
         </div>
       );
     }
  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
        return {showLoader : false};
     }
    if (
      nextProps.clinicList != undefined &&
      nextProps.clinicList.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        autoScrolling(false)
        return (returnState.next_page_url = null);
      }


      if (prevState.clinicList.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
					returnState.clinicList = nextProps.clinicList.data;
					if(nextProps.clinicList.next_page_url != null){
						returnState.page = prevState.page + 1;
					} else {
						returnState.next_page_url = nextProps.clinicList.next_page_url;
					}
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.clinicList != nextProps.clinicList.data &&
        prevState.clinicList.length != 0
      ) {
        returnState.clinicList = [
          ...prevState.clinicList,
          ...nextProps.clinicList.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.clinicList.next_page_url;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
			}
      autoScrolling(false)
			return returnState;
    }
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

	tConv24 = (time24) => {
		var ts = time24;
		var H = +ts.substr(0, 2);
		var h = (H % 12) || 12;
		h = (h < 10)?("0"+h):h;
		var ampm = H < 12 ? " AM" : " PM";
		ts = h + ts.substr(2, 3) + ampm;
		return ts;
	}

	dayOfWeekAsInteger = (day) => {
		var weekday=new Array(7);
		weekday[2]="Mon";
		weekday[3]="Tue";
		weekday[4]="Wed";
		weekday[5]="Thu";
		weekday[6]="Fri";
		weekday[7]="Sat";
		weekday[1]="Sun";
		return weekday[day];
	}

  componentDidUpdate(){
    if(this.state.showLoader) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /*componentWillUnmount() {
    window.onscroll = () => {
      return false;
    }
    toast.dismiss();
    this.props.exportEmptyData({});
  }*/

  render() {
    return (
      <div className="main protected">
        <div id="content">
          <div className="container-fluid content setting-wrapper">
          <Sidebar/>

            <div className="setting-setion">
              <div className="setting-search-outer">
                <form onSubmit={this.handleSubmit}>
                  <div className="search-bg col-xs-5">
                    <i className="fas fa-search" />
                    <input
                      className="setting-search-input search-key"
											data-url="/settings/clinics"
											name="term"
                      placeholder={this.state.clinics_Search}
                      autoComplete="off"
                      value={this.state.term}
                      onChange={this.handleInputChange}
                    />
                  </div>
                </form>
                <Link to="/settings/clinic/create" className="new-blue-btn pull-right">
                  {this.state.clinic_Create_ClinicBtn}
                </Link>
              </div>
              <div className="table-responsive">

                <table className="table-updated setting-table table-min-width">
                  <thead className="table-updated-thead">

                    <tr>
                      <th
                        className="col-xs-3 table-updated-th sorting sortData"
                        onClick={() => this.onSort("clinic_name")}
                        data-url="/settings/clinic/${id}/edit"
                        data-sort="clinic_name"
                        data-order="DESC"
                      >
                        {this.state.clinics_Clinic_Name}<i className="gray-gray" />
                      </th>
                      <th className="col-xs-2 table-updated-th sorting">
                        {this.state.clinics_Contact_Number}{" "}
                      </th>
                      <th className="col-xs-3 table-updated-th sorting">
                        {this.state.clinics_Address}{" "}
                      </th>
                      <th className="col-xs-3 table-updated-th sorting">
                        {this.state.clinics_Business_Hours}{" "}
                      </th>
                      <th className="col-xs-1 table-updated-th sorting">
                        {this.state.clinics_Tax}{" "}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="ajax_body td-break-content">
                    {this.state.clinicList !== undefined &&
                      this.state.clinicList.map((obj, idx) => {
                        return (

                          <tr
                            className="table-updated-tr edit_setting profile"
                            key={idx}
                            onClick = {this.userEdit.bind(this, obj.id)}
                            data-title="Edit Clinic"
                          >
                            <td className="col-xs-3 table-updated-td">
                              <span className="td-clinic-name">
                                {obj.clinic_name}
                              </span>
                            </td>
                            <td className="col-xs-2 table-updated-td">
                              {obj.contact_no}
                            </td>
                            <td className="col-xs-3 table-updated-td">
                              {obj.address+','+obj.city+','+obj.country}
                            </td>
                            <td className="col-xs-3 table-updated-td">
															{obj.clinic_business_hours != undefined &&
																obj.clinic_business_hours.map((innobj, innidx) =>
																{
																	var time1 = this.tConv24(`${innobj.to_time}`);
																	var time = this.tConv24(`${innobj.from_time}`);
																	var dayCon = this.dayOfWeekAsInteger(`${innobj.day}`);
																	return(
																		<div key ={innidx}>
																			<div>{time} - {time1} {dayCon}</div>
																		</div>
																	)
																})
															}
                            </td>
                            <td className="col-xs-1 table-updated-td">
                              {obj.tax} %
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {(this.state.showLoader === false) && <div className={(this.state.clinicList != undefined && this.state.clinicList.length == 0) ? 'no-record' : 'no-record no-display'} >
                  <div className="" style={{float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px"
                    }}
                  >
                    {this.state.clinic_No_Record_Found}
                  </div>
                </div>}
                <div className={ this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left" } >
                  <div className="loader-outer">
                    <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                      <div id="modal-confirm-text" className="popup-subtitle">
                        {this.state.clinic_Please_Wait}
                      </div>
                    </div>
                  </div>
                </div>
              <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.loading_please_wait_text}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.ClinicReducer.action === "CLINIC_LIST") {
    if(state.ClinicReducer.data.status != 200) {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.clinicList = state.ClinicReducer.data.data
    }
  }
  if (state.ClinicReducer.action === "CLINIC_SEARCH") {
    if(state.ClinicReducer.data.status != 200) {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.clinicSearch = state.ClinicReducer.data.data
    }
  }
  if (state.ClinicReducer.action === "SELECTED_CLINIC_LIST") {
    if(state.ClinicReducer.data.status != 200) {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.clinicSearch = state.ClinicReducer.data.data
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchClinics: fetchClinics, exportEmptyData:exportEmptyData }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Clinics);
