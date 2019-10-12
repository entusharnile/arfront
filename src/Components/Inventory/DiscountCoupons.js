import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchDiscountCoupons, emptyInventoryReducer, exportEmptyData } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import moment from 'moment';
import InventoryHeader from './InventoryHeader.js';
import {showFormattedDate, numberFormat, autoScrolling} from '../../Utils/services.js';

class DiscountCoupons extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      loadMore: true,
      startFresh: true,
      showLoader: false,
      page: 1,
      pagesize: 15,
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      searchFunction: '',
      user_changed: false,
      tabClicked: false,
      DiscountCoupons: [],
      data: [],
      childCheck: false,
      sortorder: 'asc',
      sortby: 'coupon_code',
			scopes: 'category',
      selected: [],
      selectAll: 0,
      categoryName: '',
      show_below_stock: 0,

      globalLang: languageData.global,
      //dashboardLang: languageData.dashboard,
      settingsLang: languageData.settings,
      inventoryLang: languageData.inventory,
      showLoadingText : false,
      discountCouponsTimeStamp: new Date()
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

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
  };

  componentDidMount() {
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'coupon_code',
        term: this.state.term
      }
    };
    this.props.exportEmptyData({})
    this.setState({ 'showLoader': true });
    autoScrolling(true);
    this.props.fetchDiscountCoupons(formData);
  }

  onSort = (sortby) => {
    let sortorder = (this.state.sortorder === 'asc') ? 'desc' : 'asc';
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
      DiscountCoupons : []
    });
    localStorage.setItem('sortOnly', false);
    autoScrolling(true);
    this.props.fetchDiscountCoupons(formData);
  }

  loadMore = () => {
    if(!autoScrolling()){
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true });
      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : 'asc',
          sortby: 'coupon_code',
  				term: this.state.term
        }
      };
      this.setState({ 'showLoader': true });
      autoScrolling(true);
      this.props.fetchDiscountCoupons(formData);
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
        returnState.showLoader = false;
        nextProps.exportEmptyData();
        return returnState;
    }
    if (
      nextProps.DiscountCoupons != undefined &&
      nextProps.DiscountCoupons.next_page_url !== prevState.next_page_url && nextProps.discountCouponsTimeStamp != prevState.discountCouponsTimeStamp
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        returnState.showLoader = false;
        autoScrolling(false);
        return returnState;
      }

      if (prevState.DiscountCoupons.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.DiscountCoupons = nextProps.DiscountCoupons.data;
          if(nextProps.DiscountCoupons.next_page_url != null){
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.DiscountCoupons.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          returnState.discountCouponsTimeStamp  = nextProps.discountCouponsTimeStamp;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.DiscountCoupons != nextProps.DiscountCoupons.data &&
        prevState.DiscountCoupons.length != 0
      ) {
        returnState.DiscountCoupons = [
          ...prevState.DiscountCoupons,
          ...nextProps.DiscountCoupons.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.DiscountCoupons.next_page_url;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
        returnState.discountCouponsTimeStamp  = nextProps.discountCouponsTimeStamp;
      }
      autoScrolling(false);
      return returnState;
    }
    return null;
  }
  componentWillUnmount() {
    this.props.exportEmptyData({});
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

  inventoryEdit = (id)=> {
       return (
         <div className = "no-display" >
           {this.props.history.push(`/inventory/discount-coupons/${id}/edit`)}
         </div>
       );
     }

     handleSubmit = event => {
       event.preventDefault();
   		 localStorage.setItem('sortOnly', false);
       let formData = {
         'params': {
           page: 1,
           pagesize: this.state.pagesize,
           sortorder: 'asc',
           sortby: 'coupon_code',
   				term: this.state.term,
         }
       };
       this.setState({
         page: 1,
         pagesize: this.state.pagesize,
         sortorder: 'asc',
         sortby: 'coupon_code',
         startFresh: true,
         loadMore: true,
         next_page_url: "",
         DiscountCoupons: []
       });

       this.setState({ 'showLoader': true, filterValue: 'false' });
       autoScrolling(true);
       this.props.fetchDiscountCoupons(formData);
     };

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'discount-coupons'} />
          <div className="juvly-section full-width">
            <div className="setting-search-outer">
            <form onSubmit={this.handleSubmit}>
              <div className="search-bg new-search">
                <i className="fas fa-search" />
                <input className="setting-search-input search-key" placeholder="Search" name="term" autoComplete="off"
                value={this.state.term} onChange={this.handleInputChange} />
              </div>
            </form>
              <div className="dropdown pull-right page-export">
                <div className="dropdown pull-right page-export">
                  <Link to="/inventory/discount-coupons/create" className="new-blue-btn pull-right m-l-10">{this.state.inventoryLang.inventory_add_discount_coupons}</Link>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table-updated juvly-table">
                <thead className="table-updated-thead">
                  <tr >
                    <th className="col-xs-2 table-updated-th sorting" onClick={() => this.onSort("coupon_code")}
                    data-sort="name" data-order="DESC" >{this.state.inventoryLang.Inventory_coupon_code}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'coupon_code') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'coupon_code') ? "gray-blue" : "gray-gray" } /></th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_discount_type_lbl}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.invenoty_discount_value_lbl}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_expiry_date}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                  this.state.DiscountCoupons !== undefined  && this.state.DiscountCoupons.map((obj, idx) => {
                  return (
                      <tr className="table-updated-tr" onClick = {this.inventoryEdit.bind(this, obj.id)} key= {idx} >
                        <td className="table-updated-td">{(obj.coupon_code) ? obj.coupon_code : ''}</td>
                        <td className="table-updated-td">{(obj.discount_type) ? obj.discount_type : ''}</td>
                        <td className="table-updated-td">{obj.discount_type == 'dollar' ? numberFormat(obj.discount_value, 'currency', 2) : (obj.discount_value + '%')  } </td>
                        <td className="table-updated-td">{showFormattedDate(obj.expiry_date, false)}</td>
                      </tr>
                      );
                    })}
                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.DiscountCoupons != undefined && this.state.DiscountCoupons.length == 0) ? 'no-record' : 'no-record no-display'} >
                <div className="" style={{float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px" }} >
                  {this.state.inventoryLang.dashboard_No_record_found}
                </div>
              </div>}
              <div className={ this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left" } >
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                    <div id="modal-confirm-text" className="popup-subtitle">
                      {this.state.globalLang.Please_Wait}
                    </div>
                  </div>
                </div>
            </div>
          </div>
          <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display "}>{this.state.globalLang.loading_please_wait_text}</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  let returnState = {}
  localStorage.setItem("showLoader", false);
  localStorage.setItem("sortOnly", false);
  if (state.InventoryReducer.action === "DISCOUNT_COUPONS_LIST") {
    if(state.InventoryReducer.data.status === 200){
      returnState.DiscountCoupons = state.InventoryReducer.data.data;
      returnState.discountCouponsTimeStamp = new Date();
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }
  if (state.InventoryReducer.action === "EMPTY_DATA") {
    if(state.InventoryReducer.data.status === 200){
      return {
        DiscountCoupons: undefined
      }
    }
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDiscountCoupons: fetchDiscountCoupons, exportEmptyData: exportEmptyData, emptyInventoryReducer:emptyInventoryReducer}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DiscountCoupons));
