import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchDiscountPackagesData, emptyInventoryReducer } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';
import { numberFormat, getCurrencyLabel,autoScrolling } from "../../Utils/services.js";

localStorage.removeItem('idpfType');
localStorage.removeItem('idpfStatus');
//localStorage.removeItem('idpfTerm');
localStorage.removeItem('idpfSortBy');
localStorage.removeItem('idpfSortOrder');

class DiscountPackages extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const idpfType = localStorage.getItem("idpfType")
    const idpfStatus = localStorage.getItem("idpfStatus")
    //const idpfTerm = localStorage.getItem("idpfTerm")
    const idpfSortBy = localStorage.getItem("idpfSortBy")
    const idpfSortOrder = localStorage.getItem("idpfSortOrder")
    this.state = {
      loadMore: true,
      startFresh: true,
      showLoader: false,
      page: 1,
      pagesize: 15,
      //term: (idpfTerm) ? idpfTerm : '',
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      searchFunction: '',
      user_changed: false,
      tabClicked: false,
      DiscountPackageData: [],
      data: [],
      childCheck: false,
      action: props.match.params.statusId,
      sortorder: (idpfSortOrder) ? idpfSortOrder : 'asc',
      sortby: (idpfSortBy) ? idpfSortBy : 'name',
      scopes: 'category',
      selected: [],
      selectAll: 0,
      categoryName: '',
      show_below_stock: 0,
      package_types: {},
      value: '',
      status: (idpfStatus) ? idpfStatus : 'active',
      type: (idpfType) ? idpfType : 'all',

      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      showLoadingText: false,
      dataTimeStamp: new Date()
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5  && this.state.next_page_url != null) {
        if(!autoScrolling()){
          this.loadMore();
        }
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
        sortorder: this.state.sortorder,
        sortby: this.state.sortby,
        term: this.state.term,
        action: this.state.action,
        filter_by: this.state.type,
        status: this.state.status,
      }
    };
    this.setState({ 'showLoader': true });
    autoScrolling(true)
    this.props.fetchDiscountPackagesData(formData);
  }

  onSort = (sortby) => {
    let sortorder = (this.state.sortorder === 'asc') ? 'desc' : 'asc';
    let formData = {
      'params': {
        page: 1,
        sortby: sortby,
        sortorder: sortorder,
        term: this.state.term,
        filter_by: this.state.type,
        status: this.state.status,
      }
    }
    this.setState({
      page: 1,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url: '',
      DiscountPackageData: []
    });
    localStorage.setItem('sortOnly', true);
    autoScrolling(true)
    this.props.fetchDiscountPackagesData(formData);
    localStorage.setItem('idpfSortBy', sortby);
    localStorage.setItem('idpfSortOrder', sortorder);
  }

  loadMore = () => {
      localStorage.setItem("sortOnly", false);
      this.setState({ 'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true });

      let formData = {
        'params': {
          page: this.state.page,
          pagesize: this.state.pagesize,
          sortorder: this.state.sortorder && this.state.sortorder === 'asc' ? 'asc' : this.state.sortorder == 'desc' ? 'desc' : '',
          sortby: this.state.sortby,
          term: this.state.term,
          action: this.state.action,
          filter_by: this.state.type,
          status: this.state.status,
          //	scopes : this.state.scopes
        }
      };
      this.setState({ 'showLoader': true });
      autoScrolling(true)
      this.props.fetchDiscountPackagesData(formData);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      nextProps.emptyInventoryReducer();
      return { showLoader: false }
    }
    if (
      nextProps.DiscountPackageData != undefined &&
      nextProps.DiscountPackageData.data.next_page_url !== prevState.next_page_url &&
      nextProps.dataTimeStamp != prevState.dataTimeStamp
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        autoScrolling(false)
        return (returnState.next_page_url = null);
      }

      if (prevState.DiscountPackageData.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.DiscountPackageData = nextProps.DiscountPackageData.data.data;
          if (nextProps.DiscountPackageData.data.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.DiscountPackageData.data.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
          returnState.package_types = nextProps.DiscountPackageData.data.package_types;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.DiscountPackageData != nextProps.DiscountPackageData.data.data &&
        prevState.DiscountPackageData.length != 0
      ) {
        returnState.DiscountPackageData = [
          ...prevState.DiscountPackageData,
          ...nextProps.DiscountPackageData.data.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.DiscountPackageData.data.next_page_url;
        returnState.package_types = nextProps.DiscountPackageData.data.package_types;
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

  /*  componentWillUnmount = () => {
      window.onscroll = () => {
        return false;
      }
    }*/

  inventoryEdit = (statusId, id) => {
    localStorage.setItem('userID', id)
    return (
      <div>
        {this.props.history.push(`/inventory/discount-package/${statusId}/edit`)}
      </div>
    );
  }

  handleSubmit = event => {
    event.preventDefault();
    var y = event.target.value
    var name = event.target.name
    localStorage.setItem('sortOnly', true);
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'name',
        term: this.state.term,
        status: (name == "status") ? y : this.state.status,
        filter_by: (name == "type") ? y : this.state.type
      }
    };

    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: 'asc',
      sortby: 'name',
      startFresh: true,
      loadMore: true,
      next_page_url: "",
      DiscountPackageData: [],
      status: (name == "status") ? y : this.state.status,
      type: (name == "type") ? y : this.state.type
    });
    this.setState({ 'showLoader': true, filterValue: 'false' });
    autoScrolling(true)
    this.props.fetchDiscountPackagesData(formData);
    localStorage.setItem('idpfSortBy', 'name');
    localStorage.setItem('idpfSortOrder', 'asc');
    localStorage.setItem('idpfStatus', (name == "status") ? y : this.state.status);
    localStorage.setItem('idpfType', (name == "type") ? y : this.state.type);
    //localStorage.setItem('idpfTerm', this.state.term);
  };

  render() {
    var output = [];
    if (this.state.package_types != null) {
      output = Object.entries(this.state.package_types).map(([key, value]) => ({ key, value }));
    }
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'discount-packages'} />
          <div className="juvly-section full-width">
            <div className="setting-search-outer">
              <form onSubmit={this.handleSubmit}>
                <div className="search-bg new-search">
                  <i className="fas fa-search" />
                  <input className="setting-search-input search-key" placeholder="Search" name="term"
                    value={this.state.term} autoComplete="off" onChange={this.handleInputChange} />
                </div>
              </form>
              <div className="dropdown pull-right page-export">
                <div className="dropdown pull-right page-export">
                  <Link to="/inventory/discount-package/create" className="new-blue-btn pull-right m-l-10">{this.state.inventoryLang.inventory_Add_Package}</Link>
                </div>

                <div className="filter-type pull-right">
                  <span className="search-text">{this.state.inventoryLang.inventory_Type}:</span>
                  <div className="header-select">
                    <form onChange={this.handleSubmit}>
                      <select name="type" value={this.state.type} onChange={this.handleInputChange} >
                        {
                          output.length > 0 && output.map((obj, idx) => {
                            return (
                              <option value={obj.key} key={idx}>{obj.value && obj.value ? obj.value : ''}</option>
                            );
                          })
                        }
                      </select>
                    </form>
                    <i className="fas fa-angle-down"></i>
                  </div>
                </div>

                <div className="filter-type pull-right">
                  <span className="search-text"><b>{this.state.inventoryLang.inventory_Filter_by}: </b>{this.state.inventoryLang.inventory_Status}:</span>
                  <div className="header-select">
                    <form onChange={this.handleSubmit}>
                      <select name="status" value={this.state.status} onChange={this.handleInputChange} value={this.state.status}>
                        <option value="all">{this.state.inventoryLang.inventory_all}</option>
                        <option value="active">{this.state.inventoryLang.inventory_active}</option>
                        <option value="inactive">{this.state.inventoryLang.inventory_Deleted}</option>
                      </select>
                    </form>
                    <i className="fas fa-angle-down"></i>
                  </div>
                </div>

              </div>
            </div>

            <div className="table-responsive">
              <table className="table-updated juvly-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-2 table-updated-th cursor-pointer sorting" onClick={() => this.onSort("name")}
                      data-sort="name" data-order="DESC" >{this.state.inventoryLang.inventory_Discount_Name}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'name') ? "gray-blue" : "gray-gray"} /></th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_Type}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_Price}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_Discount}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.DiscountPackageData !== undefined && this.state.DiscountPackageData.map((obj, idx) => {
                      let statusId = this.state.action;
                      let price = 0;
                      let discount = 0;
                      let typeVal = obj.type;
                      var firstLetter = typeVal[0] || typeVal.charAt(0);
                      let typeValues = typeVal.replace(/^./, firstLetter.toUpperCase());
                      switch (obj.type) {
                        case 'percentage':
                          price = '';
                          discount = (obj.discount_percentage > 0) ? numberFormat(obj.discount_percentage, 'decimal', 2) + '%' : '';
                          break;
                        case 'dollars':
                          price = '';
                          discount = (obj.discount_dollars > 0) ? numberFormat(obj.discount_dollars, 'currency', 2) : '';
                          break;
                        case 'package':
                          price = (obj.package_bogo_price > 0) ? numberFormat(obj.package_bogo_price, 'currency', 2) : '';
                          discount = '';
                          break;
                        case 'bogo':
                          if (obj.bogo_buy_type !== 'group') {
                            price = (obj.package_bogo_price > 0) ? numberFormat(obj.package_bogo_price, 'currency', 2) : '';
                            discount = '';
                          } else {
                            if (!obj.bogo_discount_percentage) {
                              price = '';
                              discount = this.state.inventoryLang.inventory_Free
                            } else {
                              price = '';
                              discount = (obj.bogo_discount_percentage > 0) ? numberFormat(obj.bogo_discount_percentage, 'decimal', 0) + '% '+ this.state.inventoryLang.inventory_OFF : '';
                            }
                          }
                          break;
                        default:
                          price = "";
                          discount = "";
                      }
                      return (
                        <tr className="table-updated-tr" onClick={this.inventoryEdit.bind(this, obj.id, statusId)} key={idx} >
                          <td className="table-updated-td">{obj.name && obj.name ? obj.name : ''}</td>
                          <td className="table-updated-td">{obj.type && obj.type != 'bogo' ? typeValues : (obj.bogo_buy_type == "group" ? this.state.inventoryLang.inventory_bogo_disc_group : typeValues)}</td>
                          <td className="table-updated-td">
                            {/*
                          {this.state.type == 'package' ? (obj.package_bogo_price && obj.package_bogo_price ? obj.package_bogo_price : '') : ''}
                          {this.state.type == 'bogo' ? (obj.package_bogo_price && obj.package_bogo_price ? obj.package_bogo_price : '') : ''}
                        */}
                            {price}
                          </td>
                          <td className="table-updated-td">
                            {/*
                            {this.state.type == 'percentage' ? (obj.discount_percentage && obj.discount_percentage ? obj.discount_percentage : '') : ''}
                            {this.state.type == 'dollars' ? (obj.discount_dollars && obj.discount_dollars ? obj.discount_dollars : '') : ''}
                            {this.state.type == 'group' ? ( obj.bogo_discount_percentage && obj.bogo_discount_percentage == null ? this.state.inventoryLang.inventory_Free : (obj.bogo_discount_percentage && obj.bogo_discount_percentage ? obj.bogo_discount_percentage : '' ) + '%' + this.state.inventoryLang.inventory_OFF) : '' }
                            {this.state.type == 'all' ? ( obj.bogo_discount_percentage && obj.bogo_discount_percentage == null ? this.state.inventoryLang.inventory_Free : (obj.bogo_discount_percentage && obj.bogo_discount_percentage ? obj.bogo_discount_percentage : '' ) + '%' + this.state.inventoryLang.inventory_OFF) : '' }
                          */}
                            {discount}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.DiscountPackageData != undefined && this.state.DiscountPackageData.length == 0) ? 'no-record' : 'no-record no-display'} >
                <div className="" style={{ float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px" }} >
                  {this.state.inventoryLang.inventory_No_record_found}
                </div>
              </div>}
              <div className={this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left"} >
                <div className="loader-outer">
                  <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                  <div id="modal-confirm-text" className="popup-subtitle">
                    {this.state.inventoryLang.inventory_please_wait}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display "}>{this.state.inventoryLang.inventory_loading_please_wait}</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  let returnState = {}
  if (state.InventoryReducer.action === "PACKAGES_LIST") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.DiscountPackageData = state.InventoryReducer.data;
      returnState.dataTimeStamp = new Date();
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }
  else if (state.InventoryReducer.action === "EMPTY_INVENTROY") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDiscountPackagesData: fetchDiscountPackagesData, emptyInventoryReducer: emptyInventoryReducer }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DiscountPackages));
