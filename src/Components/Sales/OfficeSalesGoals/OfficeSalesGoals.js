import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Sidebar from "../../../Containers/Settings/sidebar.js";
import SalesHeader from '../Common/SalesHeader.js';
import validator from "validator";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchClinics, exportEmptyData } from "../../../Actions/Sales/salesActions.js";
import { autoScrolling } from '../../../Utils/services.js';

class OfficeSalesGoals extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
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
      pagesize: 25,
      hasMoreItems: true,
      next_page_url: '',
      loadMore: true,
      startFresh: true,
			showLoader: false,
      globalLang: languageData.global,
      salesLang: languageData.sales,
			scopes: 'business_hours'
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
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
        page: this.state.page,
        pagesize: this.state.pagesize,
				scopes : this.state.scopes
      }
    };
    this.setState({ 'showLoader': true });
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
           {this.props.history.push(`/sales/office-sales-goals/${id}`)}
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

  componentDidUpdate(){
    var objDiv = document.getElementById("content");
    objDiv.scrollBottom = objDiv.scrollHeight;
  }

  componentWillUnmount() {
    toast.dismiss();
    this.props.exportEmptyData({});
  }


  render(){
    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <SalesHeader/>
          <div className="juvly-section full-width">
            <div className="table-responsive">
              <table className="table-updated setting-table survey-table ">
                <thead className="table-updated-thead">

                  <tr>
                    <th className="col-xs-3 table-updated-th">{this.state.salesLang.sales_clinic_name}</th>
                  </tr>

                </thead>
                <tbody className="ajax_body">
                {this.state.clinicList !== undefined &&
                     this.state.clinicList.map((obj, idx) => {
                       return (
                  <tr className="table-updated-tr" key={obj.id}>
                    <td className="col-xs-3 table-updated-td" onClick = {this.userEdit.bind(this, obj.id)}>{obj.clinic_name}</td>
                  </tr>
                );
                   })}

                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.clinicList != undefined && this.state.clinicList.length == 0) ? 'no-record' : 'no-record no-display'} >
                <div className="" style={{float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px"
                  }}
                >
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
            <div className={(this.state.showLoadingText) ? "loading-please-wait no-margin-top" : "loading-please-wait no-margin-top no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.SalesReducer.action === "CLINIC_LIST") {
    if(state.SalesReducer.data.status != 200) {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.clinicList = state.SalesReducer.data.data
    }
  }
  if (state.SalesReducer.action === "CLINIC_SEARCH") {
    if(state.SalesReducer.data.status != 200) {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.clinicSearch = state.SalesReducer.data.data
    }
  }
  if (state.SalesReducer.action === "SELECTED_CLINIC_LIST") {
    if(state.SalesReducer.data.status != 200) {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.clinicSearch = state.SalesReducer.data.data
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
)(OfficeSalesGoals);
