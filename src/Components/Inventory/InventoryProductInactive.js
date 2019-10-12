import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchInventoryData, exportProducts, emptyInventoryReducer, activateProduct } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';
import { autoScrolling } from '../../Utils/services.js';
var timeOut;

localStorage.removeItem('iiapfCategory');
localStorage.removeItem('iiapfStock');
//localStorage.removeItem('iiapfTerm');
localStorage.removeItem('iiapfSortBy');
localStorage.removeItem('iiapfSortOrder');

class InventoryProductsInactive extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const iiapfCategory = localStorage.getItem("iiapfCategory")
    const iiapfStock = localStorage.getItem("iiapfStock")
    //const iiapfTerm = localStorage.getItem("iiapfTerm")
    const iiapfSortBy = localStorage.getItem("iiapfSortBy")
    const iiapfSortOrder = localStorage.getItem("iiapfSortOrder")
    this.state = {
      loadMore: true,
      startFresh: true,
      showLoader: false,
      page: 1,
      pagesize: 15,
      //term: (iiapfTerm) ? iiapfTerm : '',
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
      action: 'inactive',
      sortorder: (iiapfSortOrder) ? iiapfSortOrder : 'asc',
      sortby: (iiapfSortBy) ? iiapfSortBy : 'product_name',
      scopes: 'category',
      selected: [],
      selectAll: 0,
      filterValue: false,
      categoryName: '',
      show_below_stock: (iiapfStock) ? iiapfStock : 0,
      filter_by_category_id: (iiapfCategory) ? iiapfCategory : '',
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      showLoadingText: false,
      timeStamp: new Date(),
      apiInventoryData: {},
      activeProductId:0,
      showModal:false
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5 && this.state.next_page_url != null) {
        this.loadMore();
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
    if(target.name === 'filter_by_category_id'){
      localStorage.setItem('iiapfCategory',value)
    }
    if(target.name === 'show_below_stock'){
      localStorage.setItem('iiapfStock',(value) ? 1 : 0)
    }
  };

  componentDidUpdate = (props, state) => {
    if (this.state.action != "inactive") {
      let formData = {
        'params': {
          page: 1,
          pagesize: this.state.pagesize,
          sortorder: this.state.sortorder,
          sortby: this.state.sortby,
          term: this.state.term,
          action: "inactive"
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
    this.props.emptyInventoryReducer()
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
      action: "inactive"
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
        sortorder: "asc",
        sortby: "product_name",
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
      startFresh: true,
      loadMore: true,
      next_page_url: "",
      InventoryData: [],
      showLoader: true,
      filterValue: 'false',
      sortorder: "asc",
      sortby: "product_name",
    });
    autoScrolling(true);
    this.props.fetchInventoryData(this.state.action, formData);
    localStorage.setItem('iiapfSortBy', 'product_name');
    localStorage.setItem('iiapfSortOrder', 'asc');
    //localStorage.setItem('iiapfTerm', this.state.term);
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
    localStorage.setItem('iiapfSortBy', sortby);
    localStorage.setItem('iiapfSortOrder', sortorder);
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
          //  scopes : this.state.scopes
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
        window.open(nextProps.exportCsvData.file)
      }
      nextProps.emptyInventoryReducer();
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      nextProps.emptyInventoryReducer();
      return { showLoader: false }
    } else if (nextProps.activeProduct != undefined && nextProps.activeProduct == true) {
      nextProps.emptyInventoryReducer();
      let returnState = {}
      returnState.showLoader = false;
      returnState.activeProductId = 0;
      returnState.showModal = false;
      returnState.InventoryData = prevState.InventoryData;
      let index = -1
      let acivatedProduct  = prevState.InventoryData.find((product,idx) => {
        if(product.id === prevState.activeProductId){
          index = idx;
          return true
        }
      })
      if(index !== -1){
        returnState.InventoryData.splice(index,1)
      }
      return returnState
    } else if (nextProps.InventoryData != undefined && nextProps.InventoryData !== prevState.apiInventoryData &&
      (nextProps.InventoryData.data.next_page_url !== prevState.next_page_url || nextProps.InventoryData.action != prevState.action)) {
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
          autoScrolling(false);
          return (returnState.next_page_url = null);
        }

        if (prevState.InventoryData.length == 0 && prevState.startFresh == true) {
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
        } else if (prevState.InventoryData != nextProps.InventoryData.data && prevState.InventoryData.length != 0) {
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
        autoScrolling(false);
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

  inventoryEdit = (statusId, id) => {
    //localStorage.setItem('userID', id)
    return (
      <div>
        {this.props.history.push(`/inventory/product/edit/${statusId}`)}
      </div>
    );
  }

  onFilter = () => {
    this.setState({ 'filterValue': true });
  }

  /*  componentWillUnmount = () => {
      window.onscroll = () => {
        return false;
      }
    }*/

  onReset = () => {
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
      filter_by_category_id: ''
    });
    autoScrolling(true);
    this.props.fetchInventoryData(this.state.action, formData);
    localStorage.removeItem('iiapfCategory')
    localStorage.removeItem('iiapfStock')
    //localStorage.removeItem('iiapfTerm')
    localStorage.removeItem('iiapfSortBy')
    localStorage.removeItem('iiapfSortOrder')
  }

  exportProducts = (mode) => {
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: "asc",
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

  showActiveProductodal = (activeProductId) => {
      this.setState({showModal: true,activeProductId:activeProductId})
   }

   dismissModal = () => {
      this.setState({showModal: false,activeProductId:0})
   }

   activateProduct = () => {
      this.setState({showLoader: true, showModal: false}, () => {
        this.props.activateProduct(this.state.activeProductId);
      })

   }


  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader handleAnchor={this.handleAnchor} activeMenuTag={'products-inactive'} />
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
            </div>
            <div className="table-responsive">
              <table className="table-updated juvly-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-6 table-updated-th cursor-pointer sorting" onClick={() => this.onSort("product_name")}
                      data-sort="product_name"
                      data-order="DESC" >{this.state.inventoryLang.inventory_Product_Name}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'product_name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'product_name') ? "gray-blue" : "gray-gray"} /></th>
                    <th className="col-xs-5 table-updated-th cursor-pointer sorting" onClick={() => this.onSort("category_name")} data-sort="category_name"
                      data-order="DESC" >{this.state.inventoryLang.inventory_Category}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'category_name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'category_name') ? "gray-blue" : "gray-gray"} /></th>
                    <th className="col-xs-1 table-updated-th cursor-pointer"></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.InventoryData !== undefined && this.state.InventoryData.map((obj, idx) => {
                      let statusId = this.state.action;
                      return (
                        <tr className="table-updated-tr" key={idx} >
                          <td className="table-updated-td text-ellipsis inentory-product-name" ><img className="inventory-product-img" src={(obj.product_image_url) ? (obj.product_image_url) : "/../../images/no-photo.png"} />{(obj.product_name) ? obj.product_name : ''}</td>
                          <td className="table-updated-td text-ellipsis"  >{(obj.category) ? obj.category.category_name : ''}
                          </td>
                          <td className="table-updated-td">
                            <button className="line-btn table-btn pull-right" onClick={this.showActiveProductodal.bind(this,obj.id)}>{this.state.globalLang.label_activate}</button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <div className={(this.state.showModal ? 'overlay' : '')}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.inventoryLang.inventory_Confirmation_required}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.inventoryLang.inventroy_active_product_confirmation_msg}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.inventoryLang.inventory_No}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.activateProduct}>{this.state.inventoryLang.inventory_Yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
  if (state.InventoryReducer.action === "INVENTORY_PRODUCT_LIST_INACTIVE") {
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
  if (state.InventoryReducer.action === "ACTIVATE_PRODUCT") {
    if (state.InventoryReducer.data.status != 200) {
      returnState.showLoader = false
      toast.dismiss()
      toast.error(languageData.global[state.InventoryReducer.data.message]);
    }
    else {
      toast.dismiss()
      toast.success(languageData.global[state.InventoryReducer.data.message]);
      returnState.activeProduct = true
    }
  }
  if (state.InventoryReducer.action === "EMPTY_INVENTROY") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchInventoryData: fetchInventoryData, exportProducts: exportProducts, emptyInventoryReducer: emptyInventoryReducer, activateProduct: activateProduct }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(InventoryProductsInactive));
