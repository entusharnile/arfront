import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchDiscountPackagesData } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';

class AddDiscountPackage extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
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
      DiscountPackageData: [],
      data: [],
      childCheck: false,
      action: props.match.params.statusId,
      sortorder: 'asc',
			scopes: 'category',
      selected: [],
      selectAll: 0,
      categoryName: '',
      show_below_stock: 0,
      package_types: {},
      value: '',
      status: '0',
      type: 'all',

      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      showLoadingText : false,
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
    window.onscroll = () => {
      return false;
    }
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: "asc",
        term: this.state.term,
        action: this.state.action
      }
    };
    this.setState({ 'showLoader': true });
    //this.props.fetchDiscountPackagesData(formData);
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
      DiscountPackageData : []
    });
    localStorage.setItem('sortOnly', true);
    //this.props.fetchDiscountPackagesData(formData);
  }

  loadMore = () => {
    localStorage.setItem("sortOnly", false);
    this.setState({ 'loadMore': true, startFresh: true, showLoader: false, showLoadingText: true });
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
				term: this.state.term,
        action: this.state.action
			//	scopes : this.state.scopes
      }
    };
    this.setState({ 'showLoader': true });
    //this.props.fetchDiscountPackagesData(formData);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.DiscountPackageData != undefined &&
      nextProps.DiscountPackageData.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        return (returnState.next_page_url = null);
      }

      if (prevState.DiscountPackageData.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.DiscountPackageData = nextProps.DiscountPackageData.data.data;
          if(nextProps.DiscountPackageData.next_page_url != null){
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

  inventoryEdit=(statusId, id )=> {
       //localStorage.setItem('userID', id)
       return (
         <div>
           //{this.props.history.push(`/inventory/products/categories/${id}/edit`)}
         </div>
       );
     }

     handleSubmit = event => {
       event.preventDefault();
       var x = '';
       var y = event.target.value
       if (y == '0'){
         x = 'active';
       }
       else if (y == '1'){
         x = 'inactive';
       }
       else {
         x= 'all';
       }
   		localStorage.setItem('sortOnly', true);
       let formData = {
         'params': {
           page: 1,
           pagesize: this.state.pagesize,
           sortorder: this.state.sortorder,
   				term: this.state.term,
          status: x
         }
       };
       this.setState({
         page: 1,
         pagesize: this.state.pagesize,
         sortorder: this.state.sortorder == "asc" ? "desc" : "asc",
         startFresh: true,
         loadMore: true,
         next_page_url: "",
         DiscountPackageData: [],
         status: y
       });
       this.setState({ 'showLoader': true, filterValue: 'false' });
       //this.props.fetchDiscountPackagesData(formData);
     };

     render() {
      var output = [];
       if (this.state.package_types != null) {
         output = Object.entries(this.state.package_types).map(([key, value]) => ({key,value}));
      }
      return (

          <div id="content">
            <div className="container-fluid content setting-wrapper">

              <div className="juvly-section full-width">
                <div className="juvly-container">
                  <div className="juvly-title m-b-40">{this.state.inventoryLang.inventory_edit_discounts}
                    <a className="pull-right crossIcon"><img src="images/close.png" /></a>
                  </div>
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="row">
                        <div className="col-md-3 col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_Discount_Name}<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" autoComplete="off" />
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Discount Type<span className="setting-require">*</span></div>
                            <div className="pull-left m-t-5">
                              <input type="radio" defaultChecked="checked" name="discounttype" id="Percentage" className="basic-form-checkbox" />
                              <label htmlFor="Percentage" className="basic-form-text">% Percentage</label>
                            </div>
                            <div className="pull-left m-t-5">
                              <input type="radio" id="Figure" name="discounttype" className="basic-form-checkbox" />
                              <label htmlFor="Figure" className="basic-form-text">$ Figure</label>
                            </div>
                            <div className="pull-left m-t-5">
                              <input type="radio" id="Package" name="discounttype" className="basic-form-checkbox" />
                              <label htmlFor="Package" className="basic-form-text">Package</label>
                            </div>
                            <div className="pull-left m-t-5">
                              <input type="radio" id="BOGOoffer" name="discounttype" className="basic-form-checkbox" />
                              <label htmlFor="BOGOoffer" className="basic-form-text">BOGO offers</label>
                            </div>
                            <div className="pull-left m-t-5">
                              <input type="radio" id="BOGOdiscount" name="discounttype" className="basic-form-checkbox" />
                              <label htmlFor="BOGOdiscount" className="basic-form-text">BOGO Discount Group</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row m-t-20">
                        <div className="col-md-3 col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Select Package Type<span className="setting-require">*</span></div>
                            <select className="setting-select-box">
                              <option>Product</option>
                              <option>Group</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="row relative">
                        <div className="col-md-6 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Type initials of product to select<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" autoComplete="off" />
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Select Quantity<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" placeholder="Unit" autoComplete="off" />
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Dollar value<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" placeholder="Value" autoComplete="off" />
                          </div>
                        </div>
                        <a href="#" className="add-round-btn"><span>+</span></a>
                      </div>
                      <div className="row relative">
                        <div className="col-md-6 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Type initials of product to select<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" autoComplete="off" />
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Select Quantity<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" placeholder="Unit" autoComplete="off" />
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Dollar value<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" placeholder="Value" autoComplete="off" />
                          </div>
                        </div>
                        <a href="#" className="add-round-btn"><span>-</span></a>
                      </div>
                      <div className="row m-t-30">
                        <div className="col-md-3 col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Package Price<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" autoComplete="off" />
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Package Price For Members<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" autoComplete="off" />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-3 col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Available for purchase on<span className="setting-require">*</span><a href="#" className="help-icon-form">?</a></div>
                            <div className="setting-input-outer">
                              <input className="setting-input-box" type="text" autoComplete="off" />
                              <i className="fas fa-calendar-alt client-treat-cal" />
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-6 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Available for purchase until <span className="setting-require">*</span><a href="#" className="help-icon-form">?</a></div>
                            <div className="setting-input-outer">
                              <input className="setting-input-box" type="text" autoComplete="off" />
                              <i className="fas fa-calendar-alt client-treat-cal" />
                            </div>
                          </div>
                        </div>
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Keywords</div>
                            <input className="setting-input-box" type="text" placeholder="Keywords..." autoComplete="off" />
                          </div>
                        </div>
                      </div>
                      <div className="row m-t-30">
                        <div className="col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">Available to Customers<span className="setting-require">*</span></div>
                            <div className="pull-left m-t-5">
                              <input type="radio" defaultChecked="checked" name="product-ratio" id="UserIsDashboardEnabled0" className="basic-form-checkbox" />
                              <label htmlFor="UserIsDashboardEnabled0" className="basic-form-text">All</label>
                              <input type="radio" id="UserIsDashboardEnabled1" defaultChecked="checked" name="product-ratio" className="basic-form-checkbox" />
                              <label htmlFor="UserIsDashboardEnabled1" className="basic-form-text">Members Only</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-3 col-sm-6 col-xs-12 m-t-30">
                          <p className="m-b-20"><input type="checkbox" value={this.state.curntOffer} id="curnt-offer" className="new-check" /><label htmlFor="curnt-offer">Mark as Current Offer:</label></p>
                          <div className="setting-field-outer">
                            <div className="new-field-label">Offer Expire After (Max 100 days)<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" placeholder="Days" autoComplete="off" />
                          </div>
                        </div>
                        <div className="col-xs-12 m-t-30">
                          <p className="m-b-20"><input type="checkbox" value={this.state.newCheck} className="new-check" id="Available-location" /><label htmlFor="Available-location">Available at Selected locations:</label></p>
                          <div className="setting-field-outer">
                            <div className="new-field-label">Select Locations : <span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" placeholder="Choose Clinic" autoComplete="off" />
                          </div>
                        </div>
                        <div className="col-xs-12 m-t-30">
                          <p className="m-b-20"><input type="checkbox" value={this.state.newCheck} className="new-check" id="Available-provider" /><label htmlFor="Available-provider">Available only with these providers:</label></p>
                          <div className="setting-field-outer">
                            <div className="new-field-label">Select Providers<span className="setting-require">*</span></div>
                            <input className="setting-input-box" type="text" placeholder="Choose Provider" autoComplete="off" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="footer-static">
                  <button className="new-blue-btn pull-right" id="saveform">Save</button>
                  <button className="new-white-btn pull-right" id="resetform">Cancel</button>
                  <button className="new-red-btn pull-left" id="resetform">Delete</button>
                </div>
              </div>
            </div>
          </div>
        );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.InventoryReducer.action === "PACKAGES_LIST") {
    if(state.InventoryReducer.data.status === 200){
    return {
      DiscountPackageData: state.InventoryReducer.data
    }
  }
  }
    else {
    return {};
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDiscountPackagesData: fetchDiscountPackagesData}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(AddDiscountPackage));
