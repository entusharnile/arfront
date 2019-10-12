import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchDiscountGroupData,emptyInventoryReducer } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';
import {exportEmptyData} from '../../Actions/Inventory/inventoryActions.js';
import {autoScrolling} from '../../Utils/services.js';

class DiscountGroups extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
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
      DiscountGroupData: [],
      data: [],
      childCheck: false,
      action: props.match.params.statusId,
      sortorder: 'asc',
      sortby: 'name',
			scopes: 'category',
      selected: [],
      selectAll: 0,
      categoryName: '',
      show_below_stock: 0,

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
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'name',
        term: this.state.term,
        action: this.state.action
      }
    };
    this.setState({ 'showLoader': true });
    autoScrolling(true);
    this.props.fetchDiscountGroupData(formData);
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
      DiscountGroupData : []
    });
    localStorage.setItem('sortOnly', true);
    autoScrolling(true);
    this.props.fetchDiscountGroupData(formData);
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
          sortby: 'name',
  				term: this.state.term,
          action: this.state.action
  			//	scopes : this.state.scopes
        }
      };
      this.setState({ 'showLoader': true });
      autoScrolling(true);
      this.props.fetchDiscountGroupData(formData);
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.showLoader != undefined && nextProps.showLoader == false){
      nextProps.emptyInventoryReducer();
      return {showLoader:false}
    }
    if (
      nextProps.DiscountGroupData != undefined &&
      nextProps.DiscountGroupData.next_page_url !== prevState.next_page_url
    ) {
      let returnState = {};
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        autoScrolling(false);
        return (returnState.next_page_url = null);
      }

      if (prevState.DiscountGroupData.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.DiscountGroupData = nextProps.DiscountGroupData.data;
          if(nextProps.DiscountGroupData.next_page_url != null){
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.DiscountGroupData.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.DiscountGroupData != nextProps.DiscountGroupData.data &&
        prevState.DiscountGroupData.length != 0
      ) {
        returnState.DiscountGroupData = [
          ...prevState.DiscountGroupData,
          ...nextProps.DiscountGroupData.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.DiscountGroupData.next_page_url;
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

  componentWillUnmount = () => {
    this.props.exportEmptyData({});
    this.setState({
      showLoader: false
    });
  }

     handleSubmit = event => {
       event.preventDefault();
   		localStorage.setItem('sortOnly', true);
       let formData = {
         'params': {
           page: 1,
           sortorder: 'asc',
           sortby:null,
   				term: this.state.term,
         }
       };
       this.setState({
         page: 1,
         pagesize: this.state.pagesize,
         sortorder: "asc",
         sortby:null,
         startFresh: true,
         loadMore: true,
         next_page_url: "",
         DiscountGroupData: []
       });
       this.setState({ 'showLoader': true, filterValue: 'false' });
       autoScrolling(true);
       this.props.fetchDiscountGroupData(formData);
     };


   InventoryEdit = (id) => {
        return (
          <div className = "no-display">
            {this.props.history.push(`/inventory/discount-groups/${id}/edit`)}
          </div>
        );
      }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'discount-groups'} />
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
                  <Link to="/inventory/discount-groups/add" className="new-blue-btn pull-right m-l-10">{this.state.inventoryLang.inventory_Add_Discount_Groups}</Link>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table-updated juvly-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-2 table-updated-th cursor-pointer sorting" onClick={() => this.onSort("name")}
                    data-sort="name" data-order="DESC" >{this.state.inventoryLang.inventory_name}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'name') ? "gray-blue" : "gray-gray" } /></th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_Product}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_Status}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                  this.state.DiscountGroupData !== undefined  && this.state.DiscountGroupData.map((obj, idx) => {
                  return (
                      <tr className="table-updated-tr" onClick = {this.InventoryEdit.bind(this, obj.id)} key= {idx} >
                        <td className="table-updated-td">{(obj.name) ? obj.name : ''}</td>
                        <td className="table-updated-td">{(obj.product_names) ? obj.product_names : ''}</td>
                        <td className="table-updated-td">{(obj.status == 0) ? this.state.inventoryLang.inventory_active : this.state.inventoryLang.inventory_inactive}</td>
                      </tr>
                      );
                    })}
                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.DiscountGroupData != undefined && this.state.DiscountGroupData.length == 0) ? 'no-record' : 'no-record no-display'} >
                <div className="" style={{float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px" }} >
                  {this.state.inventoryLang.inventory_No_record_found}
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
  if (state.InventoryReducer.action === "DISCOUNT_GROUP_LIST") {
    if(state.InventoryReducer.data.status === 200){
      returnState.DiscountGroupData = state.InventoryReducer.data.data;
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }
  else if(state.InventoryReducer.action === "EMPTY_INVENTROY1") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDiscountGroupData: fetchDiscountGroupData, emptyInventoryReducer: emptyInventoryReducer, exportEmptyData: exportEmptyData}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(DiscountGroups));
