import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchPOSButtonData, fetchPOSButtonActiveDeactive, emptyInventoryReducer } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';

class POSQuckButton extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      loadMore: true,
      startFresh: true,
      showLoader: false,
      posBtnDate: '',
      page: 1,
      pagesize: 15,
      term: '',
      hasMoreItems: true,
      next_page_url: '',
      searchFunction: '',
      user_changed: false,
      POSQuickButtonData: [],
      data: [],
      childCheck: false,
      userChanged: false,
      posTableId: '',
      sortorder: 'asc',
      sortby: 'name',
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      showLoadingText : false,
    };
    localStorage.setItem("loadFresh", false);
    localStorage.setItem("sortOnly", false);
    window.onscroll = () => {
      const scrollTop = parseInt(Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop));
      if (document.documentElement.offsetHeight - (window.innerHeight + scrollTop) <=5 && this.state.next_page_url != null && !this.state.showLoadingText) {
        this.loadMore();
      }
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    let value= target.value;
    switch(target.type) {
        case 'checkbox': {
            value = target.checked;
            break;
        }
    }
    this.setState({[event.target.name]: value });
  }

  handleActivateDeavtivate = (objIDVal, event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const activeId = objIDVal;
    this.setState({
      ['status-'+objIDVal]: !value, userChanged: true,
      posTableId: objIDVal,
    });
    let formData = {
      id : activeId,
      status: (!value) ? 1 : 0
    }
    this.setState({ 'showLoader': true });
    this.props.fetchPOSButtonActiveDeactive(formData)
  }

  componentDidMount() {
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: 'asc',
        sortby: 'name',
        term: this.state.term
      }
    };
    this.setState({ 'showLoader': true });
    this.props.fetchPOSButtonData(formData);
  }

  onSort = (sortby) => {
    let sortorder = (this.state.sortorder === 'asc') ? 'desc' : 'asc';
    let formData = {'params':{
      page: 1,
      pagesize: this.state.pagesize,
      sortorder: sortorder,
      sortby: 'name',
      term: this.state.term
      }
    }
    localStorage.setItem('sortOnly', true);
    this.setState({
      page:1,
      pagesize:this.state.pagesize,
      sortby: sortby,
      sortorder: sortorder,
      loadMore: true,
      startFresh: true,
      showLoader: true,
      next_page_url:'',
      POSQuickButtonData : []
    }, () => {
      this.props.fetchPOSButtonData(formData);
    });
  }

  loadMore = () => {
    localStorage.setItem("sortOnly", true);
    this.setState({ 'loadMore': true, startFresh: true, showLoadingText: true });
    let formData = {
      'params': {
        page: this.state.page,
        pagesize: this.state.pagesize,
        sortorder: this.state.sortorder,
        sortby: this.state.sortby,
        term: this.state.term
      }
    };
    this.props.fetchPOSButtonData(formData);
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if(nextProps.showLoader != undefined && nextProps.showLoader == false){
      nextProps.emptyInventoryReducer();
      return {showLoader:false}
    }else if (
      nextProps.POSQuickButtonData != undefined &&
      nextProps.POSQuickButtonData.pos_quick_buttons.next_page_url !== prevState.next_page_url
      && nextProps.POSQuickButtonTime != prevState.POSQuickButtonTime
    ) {
      let returnState = {};
      returnState.POSQuickButtonTime = nextProps.POSQuickButtonTime;
      returnState.showLoader = false;
      if (prevState.next_page_url == null) {
        localStorage.setItem("sortOnly", false);
        returnState.next_page_url = null;
        return returnState;
      }
      if (prevState.POSQuickButtonData.length == 0) {
        if (localStorage.getItem("sortOnly") == "false") {
          returnState.POSQuickButtonData = nextProps.POSQuickButtonData.pos_quick_buttons.data;
          if(nextProps.POSQuickButtonData.pos_quick_buttons.next_page_url != null){
            returnState.page = prevState.page + 1;
          } else {
            returnState.next_page_url = nextProps.POSQuickButtonData.next_page_url;
          }
          returnState.startFresh = false;
          returnState.showLoadingText = false;
          returnState.next_page_url = nextProps.POSQuickButtonData.pos_quick_buttons.next_page_url;
        } else {
          localStorage.setItem("sortOnly", false);
        }
      } else if (
        prevState.POSQuickButtonData != nextProps.POSQuickButtonData.pos_quick_buttons.data &&
        prevState.POSQuickButtonData.length != 0
      ) {
        returnState.POSQuickButtonData = [
          ...prevState.POSQuickButtonData,
          ...nextProps.POSQuickButtonData.pos_quick_buttons.data
        ];
        returnState.page = prevState.page + 1;
        returnState.next_page_url = nextProps.POSQuickButtonData.pos_quick_buttons.next_page_url;
        //returnState.showLoader = false;
        returnState.showLoadingText = false;
      }
      nextProps.POSQuickButtonData.pos_quick_buttons.data.map((obj, idx) => {
        returnState['status-'+obj.id] = obj.status
      })
      return returnState;
    }
    let returnState = {};
    if (nextProps.posTableBtn !== undefined && nextProps.posTableBtn != prevState.posTableBtn && prevState.posBtnDate != nextProps.posBtnDate) {
      returnState['status-'+prevState.posTableId] = (prevState.userChanged) ? prevState['status-'+prevState.posTableId] : nextProps.posTableBtn.status ;
      returnState.posBtnDate = nextProps.posBtnDate
      returnState.showLoader = false;

      return returnState;
    }
    return null;
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
         sortorder: "asc",
         sortby: this.state.name,
         startFresh: true,
         loadMore: true,
         next_page_url: "",
         POSQuickButtonData: []
       });
       this.setState({ 'showLoader': true });
       this.props.fetchPOSButtonData(formData);
     };

   InventoryEdit = (id) => {
      return (
        <div className = "no-display">
          {this.props.history.push(`/inventory/pos-quick-button/${id}/edit`)}
        </div>
      );
    }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'pos-quick-button'} />
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
                  <Link to="/inventory/pos-quick-button/add" className="new-blue-btn pull-right m-l-10">{this.state.inventoryLang.inventory_add_pos_quick_btn}</Link>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table-updated juvly-table">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-2 table-updated-th cursor-pointer sorting" onClick={() => this.onSort("name")}
                    data-sort="name" data-order="DESC" >{this.state.inventoryLang.inventory_name}
                    <i className={(this.state.sortorder === 'asc' && this.state.sortby === 'name') ? "blue-gray" : (this.state.sortorder === 'desc' && this.state.sortby === 'name') ? "gray-blue" : "gray-gray" } /></th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_prod_packgs}</th>
                    <th className="col-xs-2 table-updated-th" >{this.state.inventoryLang.inventory_action}</th>
                  </tr>
                </thead>
                <tbody>
                  {
                  this.state.POSQuickButtonData !== undefined  && this.state.POSQuickButtonData.map((obj, idx) => {
                  return (
                  <tr className="table-updated-tr"  key= {idx} >
                    <td className="table-updated-td" onClick = {this.InventoryEdit.bind(this, obj.id)} >{(obj.name) ? obj.name : ''}</td>
                      <td className="table-updated-td" onClick = {this.InventoryEdit.bind(this, obj.id)} >{(obj.product_names) ? obj.product_names : ''}</td>
                        <td className="table-updated-td">
                          <div className="setting-custom-switch product-active pull-left">
                            <label className="setting-switch pull-right">
                              <input type="checkbox" name={"status-"+obj.id} className="setting-custom-switch-input" checked= {(!this.state['status-'+obj.id]) ? 'checked': false} value= {this.state['status-'+obj.id]} onChange={(e)=>this.handleActivateDeavtivate(obj.id, e)} />
                              <span className="setting-slider" />
                            </label>
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                </tbody>
              </table>
              {(this.state.showLoader === false) && <div className={(this.state.POSQuickButtonData != undefined && this.state.POSQuickButtonData.length == 0) ? 'no-record' : 'no-record no-display'} >
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
          <div className={(this.state.showLoadingText) ? "loading-please-wait" : "loading-please-wait no-display"}>{this.state.globalLang.loading_please_wait_text}</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  let returnState = {}
  localStorage.setItem('sortOnly', false);
  if(state.InventoryReducer.action === "POS_BUTTON_LIST") {
    if(state.InventoryReducer.data.status === 200){
      returnState.POSQuickButtonData = state.InventoryReducer.data.data;
      let x = new Date()
      returnState.POSQuickButtonTime = x.getTime();
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }
  else if (state.InventoryReducer.action === "POS_ACTIVATE_DEACTIVATE") {
    if(state.InventoryReducer.data.status == 200){
      returnState.redirect = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
      returnState.posTableBtn = state.InventoryReducer.data.data;
      toast.success(languageData.global[state.InventoryReducer.data.message]);
      returnState.posBtnDate = new Date();
    } else {
     toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }

  if (state.InventoryReducer.action === "EMPTY_INVENTROY") {
    returnState.POSQuickButtonData = undefined;
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({fetchPOSButtonData: fetchPOSButtonData,
  fetchPOSButtonActiveDeactive: fetchPOSButtonActiveDeactive, emptyInventoryReducer: emptyInventoryReducer}, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(POSQuckButton));
