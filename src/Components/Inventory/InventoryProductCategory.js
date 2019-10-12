import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchInventoryData, exportProducts, emptyInventoryReducer } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';
import { numberFormat, checkIfPermissionAllowed } from '../../Utils/services.js';
import config from '../../config';
var timeOut;

localStorage.removeItem('cpfCategory');
localStorage.removeItem('cpfStock');
localStorage.removeItem('cpfTerm');

class InventoryProductsCategory extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    const cpfCategory = localStorage.getItem("cpfCategory")
    const cpfTerm = localStorage.getItem("cpfTerm")
    const cpfStock = localStorage.getItem("cpfStock")

    this.state = {
      categoryId: 0,
      loadMore: true,
      startFresh: true,
      showLoader: false,
      term: (cpfTerm) ? cpfTerm : '',
      searchFunction: '',
      user_changed: false,
      tabClicked: false,
      InventoryData: [],
      defaultImage: 'inventory-product-img',
      data: [],
      childCheck: false,
      action: 'all',
      scopes: 'category',
      selected: [],
      selectAll: 0,
      filterValue: false,
      categoryName: '',
      show_below_stock: (cpfStock) ? 1 : 0,
      filter_by_category_id: (cpfCategory) ? cpfCategory : '',
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      showLoadingText: false,
      timeStamp: new Date(),
      apiInventoryData: {}
    };
    window.onscroll = () => {
      return false
    };
    if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
      window.scrollBy(0, -50);
      timeOut = setTimeout('scrollToTop()', 10);
    }
    else clearTimeout(timeOut);

  }

  componentDidMount() {
    window.scrollTo(0, 0)
    const categoryId = (this.props.match.params.categoryId) ? (this.props.match.params.categoryId) : 0;
    this.setState({ categoryId: categoryId })
    this.props.emptyInventoryReducer()
    let formData = {
      'params': {
        term: this.state.term,
        action: this.state.action,
        show_below_stock: (this.state.show_below_stock == false) ? 0 : 1
      }
    };
    if (this.state.filter_by_category_id != null && this.state.filter_by_category_id != '' && this.state.filter_by_category_id != undefined) {
      formData.params.filter_by_category_id = this.state.filter_by_category_id
    } else if (categoryId) {
      formData.params.filter_by_category_id = categoryId
    }
    this.setState({ 'showLoader': true });
    if (document.body.scrollTop != 0 || document.documentElement.scrollTop != 0) {
      window.scrollBy(0, -50);
      timeOut = setTimeout('scrollToTop()', 10);
    }
    else clearTimeout(timeOut);

    this.props.fetchInventoryData(this.state.action, formData);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      nextProps.emptyInventoryReducer();
      returnState.showLoader = false;
    } else if (nextProps.InventoryData != undefined && nextProps.InventoryData !== prevState.apiInventoryData) {
      returnState.apiInventoryData = nextProps.InventoryData;
      returnState.InventoryData = (nextProps.InventoryData.products) ? nextProps.InventoryData.products : [];
      returnState.CategoryData = nextProps.InventoryData.category_list;
      returnState.showLoader = false;
    }    
    return returnState
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

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
    if (target.name === 'filter_by_category_id') {
      localStorage.setItem('cpfCategory', value)
    }
    if (target.name === 'show_below_stock') {
      localStorage.setItem('cpfStock', (value) ? 1 : 0)
    }
  };

  handleSubmit = event => {
    event.preventDefault();
    let formData = {
      'params': {
        term: this.state.term,
        show_below_stock: (this.state.show_below_stock == false) ? 0 : 1,
        action: this.state.action
      }
    };
    if (this.state.filter_by_category_id != null && this.state.filter_by_category_id != '' && this.state.filter_by_category_id != undefined) {
      formData.params.filter_by_category_id = this.state.filter_by_category_id
    } else if (this.state.categoryId) {
      formData.params.filter_by_category_id = this.state.categoryId
    }
    this.setState({
      InventoryData: [],
      showLoader: true,
      filterValue: 'false'
    });
    this.props.fetchInventoryData(this.state.action, formData);
    localStorage.setItem('cpfTerm', this.state.term);
  };


  inventoryEdit = (productId,categoryId, status) => {
    if (checkIfPermissionAllowed('edit-product') === true) {
      return (
        <div>
          {this.props.history.push(`/inventory/product/edit/${productId}/${categoryId}/${status}`)}
        </div>
      );
    }
  }

  onFilter = (event) => {
    this.setState({ 'filterValue': true }, () => {

    });
  }

  onReset = (event) => {
    let formData = {
      'params': {
        term: '',
        show_below_stock: 0,
        action: this.state.action,
      }
    };
    if (this.state.categoryId) {
      formData.params.filter_by_category_id = this.state.categoryId
    }
    this.setState({
      InventoryData: [],
      showLoader: true,
      filterValue: 'false',
      term: '',
      show_below_stock: 0,
      filter_by_category_id: '',
    });
    this.props.fetchInventoryData(this.state.action, formData);
    localStorage.removeItem('cpfCategory')
    localStorage.removeItem('cpfStock')
    localStorage.removeItem('cpfTerm')
  }


  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader  activeMenuTag={'products-categories'} />
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
                    <th className="col-xs-3 table-updated-th">{this.state.inventoryLang.inventory_Product_Name}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.inventoryLang.inventory_Category}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.InventoryData !== undefined && this.state.InventoryData.map((obj, idx) => {
                      let statusId = this.state.action;
                      return (
                        <tr className="table-updated-tr" onClick={this.inventoryEdit.bind(this, obj.id, obj.category_id, ((obj.is_product_active) ? 'active' : 'inactive'))} key={idx} >
                          <td className="table-updated-td text-ellipsis inentory-product-name"><img className="inventory-product-img" src={(obj.product_image_url) ? (obj.product_image_url) : "/../../images/no-photo.png"} />{(obj.product_name) ? obj.product_name : ''}</td>
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
  if (state.InventoryReducer.action === "INVENTORY_PRODUCT_LIST_CATEGORY") {
    if (state.InventoryReducer.data.status === 200) {
      returnState.InventoryData = state.InventoryReducer.data.data
    } else {
      toast.dismiss()
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
      returnState.timeStamp = new Date();
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchInventoryData: fetchInventoryData,  emptyInventoryReducer: emptyInventoryReducer }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(InventoryProductsCategory));
