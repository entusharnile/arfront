import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchEGiftCardData,emptyInventoryReducer } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import moment from 'moment';
import InventoryHeader from './InventoryHeader.js';
import {showFormattedDate, numberFormat,autoScrolling} from '../../Utils/services.js';

class EGiftCard extends Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      loadMore: true,
      startFresh: true,
      showLoader: false,
      id: userData.user.id,
      page: 1,
      pagesize: 15,
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      searchFunction: '',
      user_changed: false,
      tabClicked: false,
      EGiftCard: [],
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
      //dashboardLang: languageData.dashboard,
      settingsLang: languageData.settings,
      inventoryLang: languageData.inventory,
      showLoadingText : false,
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    //window.scrollTo(0, 0);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5 && this.state.next_page_url != null) {
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
    this.props.emptyInventoryReducer()
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
    this.props.fetchEGiftCardData(formData);
  }

  onSort = (sortby) => {
    let sortorder = (sortby == this.state.sortby) ? (this.state.sortorder === 'asc') ? 'desc' : 'asc' : 'asc';
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
      EGiftCard : []
    });
    localStorage.setItem('sortOnly', true);
    autoScrolling(true);
    this.props.fetchEGiftCardData(formData);
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
      this.setState({ 'showLoader': true });
      autoScrolling(true);
      this.props.fetchEGiftCardData(formData);
    }
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.showLoader != undefined && nextProps.showLoader == false){
      nextProps.emptyInventoryReducer();
      return {showLoader:false}
    }
    if (
      nextProps.EGiftCard != undefined &&
      nextProps.EGiftCard.next_page_url !== prevState.next_page_url && nextProps.EGiftCardTimeStamp != prevState.EGiftCardTimeStamp
    ) {
      let returnState = {};
      returnState.EGiftCardTimeStamp = nextProps.EGiftCardTimeStamp
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        autoScrolling(false);
        return (returnState.next_page_url = null);
      }

      if (prevState.EGiftCard.length == 0 && prevState.startFresh == true) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.EGiftCard = nextProps.EGiftCard.data;
          if(nextProps.EGiftCard.next_page_url != null){
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.EGiftCard.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoader = false;
          returnState.showLoadingText = false;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.EGiftCard != nextProps.EGiftCard.data &&
        prevState.EGiftCard.length != 0
      ) {
        returnState.EGiftCard = [
          ...prevState.EGiftCard,
          ...nextProps.EGiftCard.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.EGiftCard.next_page_url;
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

/*  componentWillUnmount = () => {
    window.onscroll = () => {
      return false;
    }
  }*/

  inventoryEdit = (id)=> {
       //localStorage.setItem('userID', id)
       return (
         <div className = "no-display" >
           {this.props.history.push(`/inventory/e-giftcards/${id}/edit`)}
         </div>
       );
     }

     handleSubmit = event => {
       event.preventDefault();
   		localStorage.setItem('sortOnly', true);
       let formData = {
         'params': {
           page: 1,
           pagesize: this.state.pagesize,
           sortorder: 'asc',
           sortby: 'name',
   				term: this.state.term,
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
         EGiftCard: []
       });
       this.setState({ 'showLoader': true, filterValue: 'false' });
       autoScrolling(true);
       this.props.fetchEGiftCardData(formData);
     };

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'e-giftcards'} />
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
                  <Link to="/inventory/e-giftcards/create" className="new-blue-btn pull-right m-l-10">{this.state.inventoryLang.dashboard_Add_EGift_Cards}</Link>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table-updated juvly-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-2 table-updated-th sorting" onClick={() => this.onSort("name")}
                    data-sort="name" data-order="DESC" >{this.state.inventoryLang.survey_nps_name}<i className={(this.state.sortorder === 'asc' && this.state.sortby === 'name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'name') ? "gray-blue" : "gray-gray" } /></th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.dashboard_Amount}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.dashboard_Available_for_Purchase_on}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.dashboard_Valid_Until}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                  this.state.EGiftCard !== undefined  && this.state.EGiftCard.map((obj, idx) => {
                    let statusId = this.state.action;
                  return (
                      <tr className="table-updated-tr" onClick = {this.inventoryEdit.bind(this, obj.id)} key= {idx} >
                        <td className="table-updated-td">{(obj.name) ? obj.name : ''}</td>
                        <td className="table-updated-td">{(obj.amount) ? numberFormat(obj.amount, 'currency', 2) : ''}</td>
                        <td className="table-updated-td">{showFormattedDate(obj.active_from)}</td>
                        <td className="table-updated-td">{showFormattedDate(obj.active_till)}</td>
                      </tr>
                      );
                    })}
                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.EGiftCard != undefined && this.state.EGiftCard.length == 0) ? 'no-record' : 'no-record no-display'} >
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
  if (state.InventoryReducer.action === "EGIFT_CARD_LIST") {
    if(state.InventoryReducer.data.status === 200){
      returnState.EGiftCard = state.InventoryReducer.data.data;
      returnState.EGiftCardTimeStamp = new Date();
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }
  else if(state.InventoryReducer.action === "EMPTY_INVENTROY") {
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEGiftCardData: fetchEGiftCardData,emptyInventoryReducer:emptyInventoryReducer}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(EGiftCard));
