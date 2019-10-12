import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchInventoryData, exportProducts, emptyInventoryReducer} from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';
import { numberFormat, checkIfPermissionAllowed,autoScrolling} from '../../Utils/services.js';
import config from '../../config';
var timeOut;

localStorage.removeItem('iapfCategory');
localStorage.removeItem('iapfStock');
//localStorage.removeItem('iapfTerm');
localStorage.removeItem('iapfSortBy');
localStorage.removeItem('iapfSortOrder');

class InventoryProductsActive extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    //const iapfCategory = localStorage.getItem("iapfCategory")
    const iapfStock = localStorage.getItem("iapfStock")
    //const iapfTerm = localStorage.getItem("iapfTerm")
    const iapfSortBy = localStorage.getItem("iapfSortBy")
    const iapfSortOrder = localStorage.getItem("iapfSortOrder")
    this.state = {
      loadMore: true,
      startFresh: true,
      showLoader: false,
      page: 1,
      pagesize: 15,
      //term: (iapfTerm) ? iapfTerm : '',
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      searchFunction: '',
      user_changed: false,
      tabClicked: false,
      InventoryData: [],
      defaultImage: 'inventory-product-img',
      data: [],
      childCheck: false,
      action: 'active',
      sortorder: (iapfSortOrder) ? iapfSortOrder : 'asc',
      sortby:  (iapfSortBy) ? iapfSortBy : 'product_name',
      scopes: 'category',
      selected: [],
      selectAll: 0,
      filterValue: false,
      categoryName: '',
      show_below_stock: (iapfStock) ? 1 : 0,
      //filter_by_category_id:  (iapfCategory) ? iapfCategory : '',
      filter_by_category_id: '',
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      showLoadingText: false,
      timeStamp: new Date(),
      apiInventoryData: {}
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5 && this.state.next_page_url != null) {
        this.loadMore()
      }
    };
    if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
      window.scrollBy(0, -50);
      timeOut = setTimeout('scrollToTop()', 10);
    }
    else clearTimeout(timeOut);

  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
    // if(target.name === 'filter_by_category_id'){
    //   localStorage.setItem('iapfCategory',value)
    // }
    if(target.name === 'show_below_stock'){
      localStorage.setItem('iapfStock',(value) ? 1 : 0)
    }
  };

  componentDidUpdate = (props, state) => {
      if (this.state.action != "active") {;
        let formData = {
          'params': {
            page: 1,
            pagesize: this.state.pagesize,
            sortorder: this.state.sortorder,
            sortby: this.state.sortby,
            term: this.state.term,
            action: "active"
          }
        };
        if (this.state.filter_by_category_id != null && this.state.filter_by_category_id != '' && this.state.filter_by_category_id != undefined) {
          formData.params.filter_by_category_id = this.state.filter_by_category_id
        }
        this.setState({ action: this.props.match.params.statusId, InventoryData: [], showLoader: true });
        autoScrolling(true);
        this.props.fetchInventoryData(this.props.match.params.statusId, formData);
      }
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
        sortby: this.state.sortby,
        term: this.state.term,
        action: this.state.action,
      }
    };
    if (this.state.filter_by_category_id) {
      formData.filter_by_category_id = this.state.filter_by_category_id;
    }
    this.setState({
      action: "active"
    })
    if (this.state.filter_by_category_id != null && this.state.filter_by_category_id != '' && this.state.filter_by_category_id != undefined) {
      formData.params.filter_by_category_id = this.state.filter_by_category_id
    }
    this.setState({ 'showLoader': true });
    if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
      window.scrollBy(0, -50);
      timeOut = setTimeout('scrollToTop()', 10);
    }
    else clearTimeout(timeOut);
    autoScrolling(true);
    this.props.fetchInventoryData(this.state.action, formData);
  }

  handleSubmit = event => {
    event.preventDefault();
    localStorage.setItem('sortOnly', true);
    localStorage.setItem('showLoader', true);
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'product_name',
        term: this.state.term,
        show_below_stock: (this.state.show_below_stock == false) ? 0 : 1,
        // scopes : this.state.scopes
        action: this.state.action,
        //filter_by_category_id: this.state.filter_by_category_id
      }
    };
    if (this.state.filter_by_category_id != null && this.state.filter_by_category_id != '' && this.state.filter_by_category_id != undefined) {
      formData.params.filter_by_category_id = this.state.filter_by_category_id
    }
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder:  "asc",
      sortby: 'product_name',
      startFresh: true,
      loadMore: true,
      next_page_url: "",
      InventoryData: [],
      'showLoader': true,
      filterValue: 'false'
    });
    autoScrolling(true);
    this.props.fetchInventoryData(this.state.action, formData);
    localStorage.setItem('iapfSortBy', 'product_name');
    localStorage.setItem('iapfSortOrder', 'asc');
    //localStorage.setItem('iapfTerm', this.state.term);
  };

  onSort = (sortby) => {
    let sortorder = (sortby == this.state.sortby) ? (this.state.sortorder === 'asc') ? 'desc' : 'asc' : 'asc';
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortby: sortby,
        sortorder: sortorder,
        term: this.state.term,
        show_below_stock: (this.state.show_below_stock == false) ? 0 : 1,
      }
    }
    if (this.state.filter_by_category_id != null && this.state.filter_by_category_id != '' && this.state.filter_by_category_id != undefined) {
      formData.params.filter_by_category_id = this.state.filter_by_category_id
    }
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url: '',
      InventoryData: []
    });
    localStorage.setItem('sortOnly', true);
    autoScrolling(true);
    this.props.fetchInventoryData(this.state.action, formData);
    localStorage.setItem('iapfSortBy', sortby);
    localStorage.setItem('iapfSortOrder', sortorder);
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
        sortby: this.state.sortby,
        term: this.state.term,
        action: this.state.action
        //	scopes : this.state.scopes
      }
    };
    if (this.state.filter_by_category_id != null && this.state.filter_by_category_id != '' && this.state.filter_by_category_id != undefined) {
      formData.params.filter_by_category_id = this.state.filter_by_category_id
    }
    this.setState({ 'showLoader': true });
    autoScrolling(true);
    this.props.fetchInventoryData(this.state.action, formData);
  }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.exportCsvData != undefined && prevState.timeStamp != nextProps.timeStamp) {
      if (localStorage.getItem('showLoader') == "false") {
        localStorage.setItem("showLoader", true);
        //window.open(nextProps.exportCsvData.file)
        window.open(config.API_URL+"download-data/"+nextProps.exportCsvData.file, "_blank");
      }
      nextProps.emptyInventoryReducer();
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      //nextProps.emptyInventoryReducer();
      return { showLoader: false }
    } else if (
      nextProps.InventoryData != undefined && nextProps.InventoryData !== prevState.apiInventoryData &&
      (nextProps.InventoryData.data.next_page_url !== prevState.next_page_url || nextProps.InventoryData.action != prevState.action)
    ) {
      let returnState = {};
      returnState.apiInventoryData = nextProps.InventoryData;
      if (localStorage.getItem('showLoader') == "false") {
        if (prevState.tabClicked === true) {
          autoScrolling(false);
          return {
            tabClicked: false,
            InventoryData: []
          }
        }
        if (prevState.next_page_url == null && nextProps.InventoryData.action == prevState.action) {
          autoScrolling(false)
          return (returnState.next_page_url = null);
        }

        if (prevState.InventoryData.length == 0) {
          if (localStorage.getItem("sortOnly") == "false") {
            returnState.InventoryData = nextProps.InventoryData.data;
            returnState.CategoryData = nextProps.InventoryData.category_list;
            if (nextProps.InventoryData.next_page_url != null) {
              returnState.page = prevState.page + 1;
            } else {
              returnState.next_page_url = nextProps.InventoryData.next_page_url;
              returnState.showLoader = false;
            }
            returnState.startFresh = false;
            returnState.showLoader = false;
            returnState.showLoadingText = false;
          } else {
            localStorage.setItem("sortOnly", false);
            //returnState.showLoader = false;
          }
        } else if (
          prevState.InventoryData != nextProps.InventoryData.data &&
          prevState.InventoryData.length != 0
        ) {
          if (prevState.tabClicked === false) {
            returnState.InventoryData = [
              ...prevState.InventoryData,
              ...nextProps.InventoryData.data
            ];
            returnState.selectAll = 0;
            returnState.showLoader = false;
          } else {
            returnState.tabClicked = false;
            returnState.showLoader = false;
          }
          returnState.total = nextProps.InventoryData.total;
          returnState.page = prevState.page + 1;
          returnState.next_page_url = nextProps.InventoryData.next_page_url;
          returnState.CategoryData = nextProps.InventoryData.category_list;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        }
        autoScrolling(false)
        return returnState;
      }
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


  inventoryEdit = (pid, status, catId) => {
    //localStorage.setItem('userID', id)
    //var catId = event.currentTarget.dataset.catId;
    if(checkIfPermissionAllowed('edit-product') === true){
      return (
        <div>
          {this.props.history.push(`/inventory/product/edit/${pid}/${catId}/${status}`)}
        </div>
      );
    }
  }

  onFilter = (event) => {
    this.setState({ 'filterValue': true }, () => {

    });
  }

  onReset = (event) => {
    localStorage.setItem("sortOnly", true);
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'product_name',
        term: '',
        show_below_stock: 0,
        action: this.state.action,
        //filter_by_category_id: ''
      }
    };
    this.setState({
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: 'asc',
      sortby: 'product_name',
      startFresh: true,
      loadMore: true,
      next_page_url: "",
      InventoryData: [],
      showLoader: true,
      filterValue: 'false',
      term: '',
      show_below_stock: 0,
      filter_by_category_id: '',
    });
    autoScrolling(true);
    this.props.fetchInventoryData(this.state.action, formData);
    localStorage.removeItem('iapfCategory')
    localStorage.removeItem('iapfStock')
    //localStorage.removeItem('iapfTerm')
    localStorage.removeItem('iapfSortBy');
    localStorage.removeItem('iapfSortOrder');
  }

  exportProducts = (mode) => {
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'product_name',
        term: this.state.term,
        show_below_stock: (this.state.show_below_stock == false) ? 0 : 1,
        // scopes : this.state.scopes
        action: this.state.action,
        //filter_by_category_id: this.state.filter_by_category_id
      }
    };
    if (this.state.filter_by_category_id != null && this.state.filter_by_category_id != '' && this.state.filter_by_category_id != undefined) {
      formData.params.filter_by_category_id = this.state.filter_by_category_id
    }

    localStorage.setItem("showLoader", true);
    this.setState({ showExportOptions: false, showStatusOptions: false })
    formData.params.product_status = 'active';

    this.props.exportProducts(formData, mode);
  }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader handleAnchor={this.handleAnchor} activeMenuTag={'products-active'} />
          <div className="juvly-section full-width">
            <div className="setting-search-outer">
              <form onSubmit={this.handleSubmit}>
                <div className="search-bg new-search">
                  <i className="fas fa-search" />
                  <input className="setting-search-input search-key" placeholder={this.state.inventoryLang.inventory_search} name="term" autoComplete="off"
                    value={this.state.term} onChange={this.handleInputChange} />
                </div>
              </form>
              <a name="filter" className="new-line-btn no-width" onClick={this.onFilter}>{this.state.inventoryLang.inventory_filter_btn_text}</a>
              <a name="reset" className="new-line-btn no-width" onClick={this.onReset} >{this.state.inventoryLang.inventory_Reset}</a>
              <div className="export pull-right">
                {(checkIfPermissionAllowed('add-product') === true) &&
                  <div className="dropdown pull-left">
                    <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{this.state.inventoryLang.inventory_Export}
                      <i className="fas fa-angle-down" />
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
                      {/*<li><a onClick={this.export.bind(this, 'csv')} name="expType">{this.state.inventoryLang.inventory_export_as_csv}</a></li>*/}
                      <li><a onClick={this.exportProducts.bind(this, 'xls')} name="expoType">{this.state.inventoryLang.inventory_export_as_excel}</a></li>
                    </ul>
                  </div>
                }
                {(checkIfPermissionAllowed('add-product') === true) &&
                  <Link to="/inventory/product/add" className="new-blue-btn  m-l-10">{this.state.inventoryLang.inventory_Add_Product}</Link>
                }
              </div>

            </div>
            <div className="table-responsive">
              <table className="table-updated juvly-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-3 table-updated-th cursor-pointer sorting" onClick={() => this.onSort("product_name")}
                      data-sort="product_name"
                      data-order="DESC" >{this.state.inventoryLang.inventory_Product_Name}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'product_name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'product_name') ? "gray-blue" : "gray-gray"} /></th>
                    <th className="col-xs-3 table-updated-th cursor-pointer sorting">{this.state.inventoryLang.inventory_cost_to_comp}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.inventoryLang.inventory_active}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.inventoryLang.Inventory}</th>
                    <th className="col-xs-2 table-updated-th cursor-pointer sorting" onClick={() => this.onSort("category_name")} data-sort="category_name"
                      data-order="DESC" >{this.state.inventoryLang.inventory_Category}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'category_name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'category_name') ? "gray-blue" : "gray-gray"} /></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.InventoryData !== undefined && this.state.InventoryData.map((obj, idx) => {
                      let statusId = this.state.action;
                      return (
                        <tr className="table-updated-tr" onClick={this.inventoryEdit.bind(this, obj.id, statusId, obj.category.id)} key={idx} >
                          <td className="table-updated-td text-ellipsis inentory-product-name"><img className="inventory-product-img" src={(obj.product_image_url) ? (obj.product_image_url) : "/../../images/no-photo.png"} />{(obj.product_name) ? obj.product_name : ''}</td>
                          <td className="table-updated-td text-ellipsis">{obj.cost_to_company ? numberFormat(obj.cost_to_company, 'currency', 2) : numberFormat(0, 'currency', 2)}</td>
                          <td className="table-updated-td text-ellipsis">{(obj.is_product_active) && obj.is_product_active === 1 ? 'Yes' : 'No'}</td>
                          <td className="table-updated-td text-ellipsis">{(numberFormat(((obj.total_available_units) ? obj.total_available_units : '0.00'), 'decimal', 2)  + " "+ this.state.inventoryLang.inventory_in_stock) }</td>
                          <td className="table-updated-td text-ellipsis">{(obj.category) ? obj.category.category_name : ''}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.InventoryData != undefined && this.state.InventoryData.length == 0) ? 'no-record' : 'no-record no-display'} >
                <div className="" style={{ float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px" }} >
                  {this.state.inventoryLang.inventory_No_record_found}
                </div>
              </div>}
              <div className={this.state.showLoader ? "new-loader text-left displayBlock" : "new-loader text-left"} >
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
        <form onSubmit={this.handleSubmit}>
          <div className={this.state.filterValue === true ? "modalOverlay" : "modalOverlay no-display"} >
            <div className="small-popup-outer">
              <div className="small-popup-header">
                <div className="popup-name">{this.state.inventoryLang.inventory_Filter_Products}</div>
                <a name="cross" className="small-cross" onClick={() => { this.setState({ filterValue: 'false' }) }}>×</a>
              </div>
              <div className="small-popup-content">
                <div className="juvly-container no-padding-bottom">
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="setting-field-outer m-b-20">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_Category}</div>
                        <div className="setting-input-outer">
                          <select name="filter_by_category_id" className="setting-select-box" onChange={this.handleInputChange} value={this.state.filter_by_category_id} >
                            <option value="" disabled defaultValue >{this.state.inventoryLang.inventory_Please_Select_Option} </option>
                            {
                              this.state.CategoryData !== undefined && this.state.CategoryData.map((obj, idx) => {
                                return (
                                  <option value={obj.id} key={idx} >{(obj.category_name) && obj.category_name ? obj.category_name : ''}</option>
                                );
                              })}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="basic-checkbox-outer m-b-30">
                        <input id="yes" className="basic-form-checkbox no-margin-top" name="show_below_stock" type="checkbox" value='0' checked={(this.state.show_below_stock == "0") ? 0 : 1} onChange={this.handleInputChange} />
                        <label className="basic-form-text" htmlFor="yes">{this.state.inventoryLang.inventory_Products_below_stock_alert}</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-static">
                <input className="new-blue-btn pull-right" id="apply" type="Submit" defaultValue={this.state.inventoryLang.inventory_Apply} />
                <a name="cancel" className="new-white-btn pull-right" onClick={() => { this.setState({ filterValue: 'false' }) }} >{this.state.inventoryLang.inventory_Cancel}</a>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  let returnState = {}
  localStorage.setItem("showLoader", false);
  localStorage.setItem("sortOnly", false);
  if (state.InventoryReducer.action === "INVENTORY_PRODUCT_LIST_ACTIVE") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.InventoryData = state.InventoryReducer.data.data
    } else {
      toast.dismiss()
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
      returnState.timeStamp = new Date();
    }
  }
  if (state.InventoryReducer.action === "EXPORT_PRODUCT_DATA") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.exportCsvData = state.InventoryReducer.data.data;
      returnState.timeStamp = new Date();
    } else {
      toast.dismiss()
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
      returnState.timeStamp = new Date();
    }
  }
   if (state.InventoryReducer.action === "EMPTY_INVENTROY") {
      returnState.InventoryData = undefined
      //returnState.showLoader = false
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchInventoryData: fetchInventoryData, exportProducts: exportProducts, emptyInventoryReducer: emptyInventoryReducer }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(InventoryProductsActive));
