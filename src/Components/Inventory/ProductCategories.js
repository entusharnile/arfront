import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchCategoriesData, deactivateAllCat, exportData, emptyInventoryReducer } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';
import { checkIfPermissionAllowed, autoScrolling } from '../../Utils/services.js';
import config from '../../config';

class ProductCategories extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      loadMore: true,
      startFresh: true,
      showLoader: false,
      showStatusOptions: false,
      showExportOptions: false,
      page: 1,
      pagesize: 15,
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      searchFunction: '',
      user_changed: false,
      tabClicked: false,
      CategoryData: [],
      data: [],
      childCheck: false,
      action: props.match.params.statusId,
      sortorder: 'asc',
      sortby: 'category_name',
      scopes: 'category',
      selected: [],
      selectAll: 0,
      categoryName: '',
      show_below_stock: 0,
      category_status: 1,

      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      showLoadingText: false,
      showModal: false,
      isCategoryStatusChanged:false
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

  showLoaderFunc = () => {
    localStorage.setItem("showLoader", true);
    this.setState({ showLoader: true })
  }

  componentDidMount() {
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'category_name',
        term: this.state.term,
        action: this.state.action,
      }
    };
    if (this.state.category_status !== 'all') {
      formData.params.category_status = this.state.category_status;
    }
    this.setState({ 'showLoader': true });
    autoScrolling(true);
    this.props.fetchCategoriesData(formData);
  }

  onSort = (sortby) => {
    let sortorder = (sortby == this.state.sortby) ? (this.state.sortorder === 'asc') ? 'desc' : 'asc' : 'asc';
    let formData = {
      'params': {
        page: 1,
        sortby: sortby,
        sortorder: sortorder,
        term: this.state.term
      }
    }
    if (this.state.category_status !== 'all') {
      formData.params.category_status = this.state.category_status;
    }
    this.setState({
      page: 1,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url: '',
      CategoryData: []
    });
    localStorage.setItem('sortOnly', true);
    this.setState({ 'showLoader': true });
    autoScrolling(true);
    this.props.fetchCategoriesData(formData);
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
      }
    };
    if (this.state.category_status !== 'all') {
      formData.params.category_status = this.state.category_status;
    }
    this.setState({ 'showLoader': true });
    autoScrolling(true);
    this.props.fetchCategoriesData(formData);
  }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if(prevState.isCategoryStatusChanged){
      return {
        page: 1,
        startFresh: true,
        loadMore: true,
        next_page_url: "",
        CategoryData: [],
        sortorder: 'asc',
        sortby: 'category_name',
        isCategoryStatusChanged:false
      }
    }
    if (nextProps.exportCsvData != undefined) {

      if (localStorage.getItem('showLoader') == "false") {
        localStorage.setItem("showLoader", true);
        window.open(config.API_URL+"download-data/"+nextProps.exportCsvData.file, "_blank");
      }
      nextProps.emptyInventoryReducer();
    }
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      nextProps.emptyInventoryReducer();
      return { showLoader: false }
    }
    if (
      nextProps.CategoryData != undefined && nextProps.CategoryData !== prevState.apiCategoryData &&
      nextProps.CategoryData.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        returnState.showLoader = false
        autoScrolling(false);
        return returnState;
      }

      if (prevState.CategoryData.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.CategoryData = nextProps.CategoryData.data;
          if (nextProps.CategoryData.next_page_url != null) {
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.CategoryData.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.CategoryData != nextProps.CategoryData.data &&
        prevState.CategoryData.length != 0
      ) {
        returnState.CategoryData = [
          ...prevState.CategoryData,
          ...nextProps.CategoryData.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.CategoryData.next_page_url;
        returnState.showLoader = false;
        returnState.showLoadingText = false;
      }
      autoScrolling(false);
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

  inventoryEdit = (id,statusId, event) => {
    if (event.target.className != 'easy-link') {
      if(checkIfPermissionAllowed('manage-product-categories')) {
        return (
          <div className="no-display" >
            {this.props.history.push(`/inventory/products-categories/${id}/edit`)}
          </div>
        );
      }
    }
  }

  categoryProduct = (categoryId,productCount) => {
    if(productCount){
      if(checkIfPermissionAllowed('view-product-categories')) {
        return (
          <div className="no-display" >
            {this.props.history.push(`/inventory/products/${categoryId}/category`)}
          </div>
        );
      }
    }
  }

  submitData = (status) => {
    localStorage.setItem('sortOnly', false);
    let formData = {
      'params': {
        page: 1,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'category_name',
        term: this.state.term,
      }
    };
    this.setState({
      page: 1,
      startFresh: true,
      loadMore: true,
      next_page_url: "",
      CategoryData: [],
      sortorder: 'asc',
      sortby: 'category_name',
      isCategoryStatusChanged: (status !== null) ? true : false
    });

    if (status != 'all' && status != null) {
      formData.params.category_status = status;
    } else {
      if (status == null && this.state.category_status != 'all') {
        formData.params.category_status = this.state.category_status;
      }
    }
    this.setState({ 'showLoader': true, filterValue: 'false' });
    autoScrolling(true);
    this.props.fetchCategoriesData(formData);
  }

  handleSubmit = (event) => {
    event.preventDefault()
    this.submitData(null)
  };

  showDeactivateModal = () => {
    this.setState({ showModal: true })
  }

  dismissModal = () => {
    this.setState({ showModal: false })
  }

  deactivateAll = () => {
    this.setState({ showLoader: true, showModal: false })
    this.showLoaderFunc();
    this.props.deactivateAllCat();
  }

  changeStatus = (status) => {
    this.setState({ category_status: status, showStatusOptions: false, showLoader: true }, () => {
      this.submitData(status)
    })
  }

  export = (mode) => {
    let formData = {
      'params': {
        sortorder: 'asc',
        sortby: 'category_name',
        term: this.state.term,
      }
    };
    localStorage.setItem('showLoader', true);
    this.setState({ showExportOptions: false, showStatusOptions: false })
    if (this.state.category_status != 'all') {
      formData.params.category_status = this.state.category_status;
    }

    this.props.exportData(formData, mode);
  }

  render() {
    let catStatusLabel = '';
    if (this.state.category_status == 1) {
      catStatusLabel = 'Active';
    } else if (this.state.category_status == 0) {
      catStatusLabel = 'Inactive';
    } else {
      catStatusLabel = 'All';
    }
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'products-categories'} />
          <div className="juvly-section full-width">
            <div className="setting-search-outer">
              <form onSubmit={this.handleSubmit}>
                <div className="search-bg new-search">
                  <i className="fas fa-search" />
                  <input className="setting-search-input search-key" placeholder="Search" name="term" autoComplete="off"
                    value={this.state.term} onChange={this.handleInputChange} />
                </div>
              </form>

              <div className="pull-right inventory-category-export-outer">
                {(checkIfPermissionAllowed('manage-product-categories') === true) &&
                  <Link to="/inventory/products-categories/create" className="new-blue-btn pull-right m-l-10">{this.state.inventoryLang.inventory_ADD_CATEGORY}</Link>
                }
                {(checkIfPermissionAllowed('manage-product-categories') === true) &&
                  <a onClick={this.showDeactivateModal} className="new-blue-btn pull-right m-l-10">{this.state.inventoryLang.inventory_INACTIVE_ALL}</a>
                }
                <div className="export pull-right">
                  <div className="dropdown pull-left">
                    <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{catStatusLabel}
                      <i className="fas fa-angle-down" />
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                      <li><a onClick={this.changeStatus.bind(this, 'all')} name="expType">{this.state.inventoryLang.inventory_all}</a></li>
                      <li><a onClick={this.changeStatus.bind(this, 1)} name="expType">{this.state.inventoryLang.inventory_active}</a></li>
                      <li><a onClick={this.changeStatus.bind(this, 0)} name="expoType">{this.state.inventoryLang.inventory_inactive}</a></li>
                    </ul>
                  </div>

                  {(checkIfPermissionAllowed('manage-product-categories') === true) &&
                    <div className="dropdown pull-left m-l-10">
                      <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{this.state.inventoryLang.inventory_Export}
                        <i className="fas fa-angle-down" />
                      </button>
                      <ul className="dropdown-menu" aria-labelledby="dropdownMenu2">
                        <li><a onClick={this.export.bind(this, 'csv')} name="expType">{this.state.inventoryLang.inventory_export_as_csv}</a></li>
                        <li><a onClick={this.export.bind(this, 'xls')} name="expoType">{this.state.inventoryLang.inventory_export_as_excel}</a></li>
                      </ul>
                    </div>
                  }
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table-updated juvly-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-2 table-updated-th cursor-pointer sorting" onClick={() => this.onSort("category_name")}
                      data-sort="product_name"
                      data-order="DESC" >{this.state.inventoryLang.inventory_Categories}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'category_name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'category_name') ? "gray-blue" : "gray-gray"} /></th>
                    <th className="col-xs-2 table-updated-th">{this.state.inventoryLang.inventory_Products_Count}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_Products_Stock}</th>
                    <th className="col-xs-2 table-updated-th" data-sort="active"
                      data-order="DESC" >{this.state.inventoryLang.inventory_active}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.CategoryData !== undefined && this.state.CategoryData.map((obj, idx) => {
                      let statusId = this.state.action;
                      return (
                        <tr className="table-updated-tr" key={idx} onClick={this.inventoryEdit.bind(this, obj.id, statusId)}>
                          <td className="table-updated-td" >{(obj.category_name) && obj.category_name ? obj.category_name : ''}</td>
                          <td className="table-updated-td count-link">
                            <a href="javascript:void(0);" onClick={this.categoryProduct.bind(this, obj.id,obj.products_count) } className="easy-link">
                              {(obj.products_count) && obj.products_count == 0 ? this.state.inventoryLang.inventory_N_A : obj.products_count}
                            </a>
                          </td>
                          <td className="table-updated-td">{(obj.total_products_stock) && obj.total_products_stock == 0 ? this.state.inventoryLang.inventory_N_A : obj.total_products_stock} {obj.total_products_stock && obj.total_products_stock == 0 ? '' : this.state.inventoryLang.dashboard_in_stock}</td>
                          <td className="table-updated-td" >{(obj.cat_status) && obj.cat_status === 1 ? this.state.inventoryLang.inventory_Yes : this.state.inventoryLang.inventory_No}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.CategoryData != undefined && this.state.CategoryData.length == 0) ? 'no-record' : 'no-record no-display'} >
                <div className="" style={{ float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px" }} >
                  {this.state.inventoryLang.inventory_No_record_found}
                </div>
              </div>}
              <div className={(this.state.showModal ? 'overlay' : '')}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.inventoryLang.inventory_Confirmation_required}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.inventoryLang.inventroy_inactive_all_confirmation_msg}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.inventoryLang.inventory_No}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deactivateAll}>{this.state.inventoryLang.inventory_Yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  let returnState = {}
  localStorage.setItem("showLoader", false);
  if (state.InventoryReducer.action === "CATEGORY_LIST") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.CategoryData = state.InventoryReducer.data.data
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }

  if (state.InventoryReducer.action === "DEACTIVATE_ALL_CATEGORIES") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.categoriesDeactivated = true;
      toast.dismiss();
      toast.success(languageData.global[state.InventoryReducer.data.message]);
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
      returnState.timeStamp = new Date();
    }
  }
  if (state.InventoryReducer.action === "EXPORT_DATA") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.exportCsvData = state.InventoryReducer.data.data;
    } else {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
      returnState.timeStamp = new Date();
    }
  }
  if (state.InventoryReducer.action === "EMPTY_INVENTROY") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchCategoriesData: fetchCategoriesData, deactivateAllCat: deactivateAllCat, exportData: exportData, emptyInventoryReducer: emptyInventoryReducer }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ProductCategories));
