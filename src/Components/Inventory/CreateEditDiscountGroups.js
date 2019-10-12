import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { createDiscountGroup,fetchDiscountGroupDataId,updateDiscountGroup,deleteDiscountGroup,addDiscountGroupProduct,deleteDiscountGroupProduct,resetAction } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import moment from 'moment';
import InventoryHeader from './InventoryHeader.js';
import {numberFormat,capitalizeFirstLetter} from '../../Utils/services.js'

class CreateEditDiscountGroups extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      backAction: "/inventory/discount-groups",
      discountGroupId: this.props.match.params.id,
      showLoader: false,
      name:'',
      status:true,
      userChanged:false,
      discountGroupData :{},
      discountGroupProducts:[],
      productList:[],
      autoSuggestionProducts:[],
      selectedIds:[],
      selectedItem:{},
      nameClass:'setting-input-box',
      product_name:'',
      productNameClass:'setting-input-box',
      showModal:false,
      deleteType:'',
      deleteMsg:'',
      deleteProductId:0,
      showAddProduct:false,
      showAutoSuggestion:false
    }
  }

  componentDidMount() {
    window.onscroll = () => {
      return false;
    }
    if(this.state.discountGroupId > 0){
      this.setState({ 'showLoader': true });
      this.props.fetchDiscountGroupDataId(this.state.discountGroupId);
    }
    document.addEventListener('click', this.handleOnClick, false);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.discountGroupData != undefined &&  nextProps.discountGroupData.discount_group != undefined &&  nextProps.discountGroupData !== prevState.discountGroupData) {
      returnState.discountGroupData = nextProps.discountGroupData;
      returnState.showLoader = false;

      returnState.name = (prevState.userChanged) ? prevState.name : returnState.discountGroupData.discount_group.name;
      returnState.status = (prevState.userChanged) ? prevState.status : (returnState.discountGroupData.discount_group.status == 0) ? true: false;
      returnState.discountGroupProducts = (prevState.userChanged) ? prevState.discountGroupProducts : returnState.discountGroupData.discount_group_products;
      returnState.productList = returnState.discountGroupData.products;
      returnState.autoSuggestionProducts = [];
      if(!prevState.userChanged){
        let selectedIds = [];
        returnState.discountGroupProducts.map((obj,idx) =>  {
            selectedIds.push(obj.id);
        })
        returnState.selectedIds = selectedIds;
      }
    } else if(nextProps.redirect != undefined && nextProps.redirect == true) {
       toast.success(nextProps.message)
       nextProps.history.push(prevState.backAction);
       
    } else if(nextProps.showLoader != undefined && nextProps.showLoader == false) {
       returnState.showLoader = false;
    } else if(nextProps.isProductAdded != undefined && nextProps.isProductAdded == true) {
      toast.success(nextProps.message)
     returnState.showLoader = false;

     // add product in product list
     let discountGroupProducts = prevState.discountGroupProducts;
     discountGroupProducts.push(prevState.selectedItem);
     returnState.discountGroupProducts =  discountGroupProducts;

     // add id into selectedIds
     let selectedIds = prevState.selectedIds;
     selectedIds.push(prevState.selectedItem.id);
     returnState.selectedIds =  selectedIds;

     // reset selectedItem, product_name, autoSuggestionProducts
     returnState.selectedItem  = {};
     returnState.product_name = '';
     returnState.autoSuggestionProducts = [];
     nextProps.resetAction();
    }  else if(nextProps.isProductDeleted != undefined && nextProps.isProductDeleted == true) {
      toast.success(nextProps.message)
      returnState.showLoader = false;
      if(prevState.deleteProductId > 0){
        // remove product from product list
        let deleteProductId = prevState.deleteProductId;
        let discountGroupProducts = [];
        prevState.discountGroupProducts.map((obj,idx) => {
            if(obj.id !== deleteProductId){
              discountGroupProducts.push(obj);
            }
        })
        returnState.discountGroupProducts =  discountGroupProducts;

        // remove id from selectedIds
        let selectedIds = prevState.selectedIds;
        var idIndex = selectedIds.indexOf(deleteProductId);
        if (idIndex > -1) {
           selectedIds.splice(idIndex, 1);
        }
        returnState.selectedIds =  selectedIds;

        // reset deleteProductId
        returnState.deleteProductId =  0;
      }
      nextProps.resetAction();
    }

    return returnState;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOnClick, false);
  }


  handleOnClick = (e) => {
    if (this.ref_product_name_container !== undefined && this.ref_product_name_container && !this.ref_product_name_container.contains(e.target)) {
      this.setState({showAutoSuggestion:false});
      if(this.state.selectedItem !== undefined && (this.state.selectedItem.id === undefined || this.state.selectedItem.id <= 0 )){
        this.setState({selectedItem:{},showAutoSuggestion:false,product_name:""});
      }
    }
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value
    });
    if(target.name === 'product_name'){
      this.setState({selectedItem:{}});
    }
  };

  handleSubmit = event => {
    if(typeof event == 'object'){
        event.preventDefault();
    }
    let error = false;

    if (typeof this.state.name === undefined || this.state.name === null || this.state.name === '') {
      this.setState({nameClass: 'setting-input-box field_error'})
      error = true;
    }  else if (this.state.name) {
      this.setState({nameClass: 'setting-input-box'})
    }

    if(error){
      return
    }

    let formData = {
      name: this.state.name,
      status: (this.state.status) ? 0 : 1,
    }
    this.setState({showLoader:true})
    if(this.state.discountGroupId > 0){
        this.props.updateDiscountGroup(formData,this.state.discountGroupId);
    } else {
      this.props.createDiscountGroup(formData);
    }
  }

  handleSubmitProduct = (event) => {
    if(typeof event == 'object'){
        event.preventDefault();
    }

    if (typeof this.state.product_name === undefined || (this.state.product_name === '' && this.state.selectedItem.id === undefined)) {
      this.setState({productNameClass: 'setting-input-box field_error'})
      return
    }  else if (this.state.product_name !== '' && this.state.selectedItem.id === undefined) {
      this.setState({productNameClass: 'setting-input-box field_error'})
      toast.dismiss();
      toast.error(this.state.inventoryLang.inventory_error_please_selectvalid_product_name);
      return
    } else {
      this.setState({productNameClass: 'setting-input-box'})
    }

    const selectedItem = this.state.selectedItem;
    if(typeof selectedItem == 'object' && selectedItem.id != undefined){
      this.setState({showLoader:true});
      let formData = {
        product_id: selectedItem.id
      }
      this.props.addDiscountGroupProduct(formData,this.state.discountGroupId)
    }
  }

  handleSelectedProduct = (selectedItem) => {
    if(typeof selectedItem == 'object' && selectedItem.id != undefined){
      this.setState({selectedItem:selectedItem,showAutoSuggestion:false,product_name:selectedItem.product_name});
    }
  }

  handleAutoSuggestion = (event) => {
    let returnState = {}
    const target = event.target;
    let value= target.value;
    let name = event.target.name;
    returnState[event.target.name] = value;
    let autoSuggestionProducts = [];
    const selectedIds = this.state.selectedIds;
    let showAutoSuggestion = false;
    if(value.length > 2){
      showAutoSuggestion = true;
      this.state.productList.map((obj,idx) =>  {
          if(!selectedIds.includes(obj.id) && typeof obj.product_name == 'string'){
            let regex = new RegExp(value.toLowerCase() ,"g");
            let productName = obj.product_name.toLowerCase()
            if(productName.match(regex)){
              autoSuggestionProducts.push(obj);
            }
          }
      })
    }
    returnState.autoSuggestionProducts = autoSuggestionProducts;
    returnState.selectedItem = {};
    returnState.userChanged = true;
    returnState.showAutoSuggestion = showAutoSuggestion;
    this.setState(returnState);

  }

  toggleAddProduct = () => {
     this.setState({showAddProduct: !this.state.showAddProduct,product_name:'',autoSuggestionProducts:[]})
  }

  toggleDeleteModal = () => {
     this.setState({showModal: !this.state.showModal})
  }

  deleteDiscountGroup = () => {
    if(this.state.discountGroupId > 0){
      this.setState({showLoader:true})
      this.props.deleteDiscountGroup(this.state.discountGroupId);
    }
    this.toggleDeleteModal();
  }

  deleteDiscountGroupProduct = () => {
    this.setState({userChanged:true})
    if(this.state.discountGroupId > 0 && this.state.deleteProductId > 0){
      this.setState({showLoader:true})
      let formData = {
        params:{
          product_id: this.state.deleteProductId
        }
      }
      this.props.deleteDiscountGroupProduct(formData,this.state.discountGroupId)
    }
    this.toggleDeleteModal();
  }

  render() {
  return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'discount-groups'} />
          <div className="juvly-section full-width">
            <div className="juvly-container m-h-container">
              <div className="juvly-title m-b-40	">{(this.state.discountGroupId) ? this.state.inventoryLang.inventory_edit_discount_group : this.state.inventoryLang.inventory_create_discount_group }
                <Link to={this.state.backAction}  className="pull-right crossIcon"><img src="/images/close.png" /></Link>
                <div className="setting-custom-switch product-active pull-right">
                  <span id="membership_lable" htmlFor ="discountGroupStatus">{(this.state.status) ? this.state.inventoryLang.inventory_active : this.state.inventoryLang.inventory_inactive}</span>
                  <label className="setting-switch pull-right no-margin">
                    <input type="checkbox" className="setting-custom-switch-input" id="discountGroupStatus" name='status' checked={(this.state.status) ? 'checked' : false} onChange={this.handleInputChange} />
                    <span className="setting-slider" />
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="row">
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_discount_group_name} <span className="setting-require">*</span></div>
                        <input autoComplete="off" className={this.state.nameClass} type="text"  name='name' value={this.state.name} onChange={this.handleInputChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {(this.state.discountGroupId > 0) &&
              <div className="edit-block">

                { (this.state.showAddProduct) ?
                  <div className="row">
                    <div className="juvly-subtitle m-b-20 m-l-15">{this.state.inventoryLang.inventory_add_new_product}</div>
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer relative">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_product} <span className="setting-require">*</span></div>
                        <div className="product_name_container"  data-ref-container={'product_name_container'} ref={(ref_product_name_container) => this.ref_product_name_container = ref_product_name_container} >
                          <input autoComplete="off"  className={this.state.productNameClass} name="product_name" value={this.state.product_name} onChange={this.handleAutoSuggestion} type="text" placeholder={this.state.inventoryLang.inventory_type_to_search_products} />
                          <ul className={(this.state.showAutoSuggestion && this.state.product_name.length > 2) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"} ref={(refAutoSuggestionProducts) => this.refAutoSuggestionProducts = refAutoSuggestionProducts}>
                          {(this.state.autoSuggestionProducts.length > 0 )
                            ? this.state.autoSuggestionProducts.map((obj, idx) => {
                              return(
                                  <li key={"products-"+idx} data-id={obj.id} onClick={this.handleSelectedProduct.bind(this,obj)}>
                                    <a>
                                        {obj && capitalizeFirstLetter(obj.product_name)}
                                    </a>
                                  </li>
                                )
                              })
                              :
                              <li key={"discountProduct-norecord"} data-id={0}>
                                <a >
                                  {this.state.globalLang.product_match_not_found}
                                </a>
                              </li>
                          }
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-12 m-b-40">
                      <a href="javascript:void(0);" className="new-white-btn" onClick={this.toggleAddProduct}>{this.state.globalLang.label_cancel}</a>
                      <a href="javascript:void(0);" className="new-blue-btn" onClick={this.handleSubmitProduct}>{this.state.globalLang.label_save}</a>
                    </div>
                  </div>
                  :
                  <div className="juvly-subtitle m-b-10"><span className="m-t-5 pull-left">{(this.state.discountGroupId > 0 && this.state.discountGroupProducts.length > 0) ? this.state.inventoryLang.inventory_products : ''}</span>
                    <a href="javascript:void(0);" className="new-blue-btn pull-right" onClick={this.toggleAddProduct}>{this.state.inventoryLang.inventory_Add_Product}</a>
                  </div>
                }
                { (this.state.discountGroupProducts.length > 0) &&
                  <div className="table-responsive">
                    <table className="table-updated juvly-table no-hover product-list-outer">
                      <tbody className="ajax_body">
                        { this.state.discountGroupProducts.map((obj,idx) => {
                            return (
                              <tr key={'discount-product'+idx} className="table-updated-tr">
                                <td className="col-xs-10 table-updated-td sub-table">{obj.product_name}</td>
                                <td className="col-xs-2 table-updated-td text-center">
                                  <a href="javascript:void(0);" className="easy-link" onClick={() => {
                                    this.setState({'deleteType':'discountGroupProduct',showModal:true, deleteMsg:this.state.inventoryLang.inventory_delete_discount_group_product_msg, deleteProductId:obj.id})
                                  }}>{this.state.globalLang.label_delete}</a>
                                </td>
                              </tr>
                            )
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>
              }
            </div>
            <div className="footer-static">
              <button className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.inventoryLang.inventory_save}</button>
              <Link to={this.state.backAction} className="new-white-btn pull-right" id="resetform">{this.state.inventoryLang.inventory_Cancel}</Link>
              {(this.state.discountGroupId > 0) &&
                <button className="new-red-btn pull-left" onClick={() => {
                  this.setState({'deleteType':'discountGroup',showModal:true, deleteMsg:this.state.inventoryLang.inventory_delete_discount_group_msg})
                }}>{this.state.inventoryLang.inventory_delete}</button>
              }
              <div className={(this.state.showModal ? 'overlay' : '')}></div>
                <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal" onClick={this.toggleDeleteModal}>×</button>
                        <h4 className="modal-title" id="model_title">{this.state.inventoryLang.inventory_Confirmation_required}{this.state.showModal}</h4>
                      </div>
                      <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                        {this.state.deleteMsg}
                      </div>
                      <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.toggleDeleteModal}>{this.state.inventoryLang.inventory_No}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={ (this.state.deleteType == 'discountGroup') ? this.deleteDiscountGroup : this.deleteDiscountGroupProduct}>{this.state.inventoryLang.inventory_Yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
            </div>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
             <div className="loader-outer">
               <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
               <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.Please_Wait}</div>
             </div>
           </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {}
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  if (state.InventoryReducer.action === "CREATE_DISCOUNT_GROUP") {
    if(state.InventoryReducer.data.status == 201){
      returnState.redirect = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
    } else {
     toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "FETCH_SELECTED_DISCOUNT_GROUP") {
    if(state.InventoryReducer.data.status != 200) {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.discountGroupData = state.InventoryReducer.data.data;
      returnState.status = 200;
    }
  } else if (state.InventoryReducer.action === "UPDATE_DISCOUNT_GROUP") {
    if(state.InventoryReducer.data.status == 200){
      returnState.redirect = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
    } else {
     toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "DELETE_DISCOUNT_GROUP") {
    if(state.InventoryReducer.data.status == 200){
      returnState.redirect = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
    } else {
     toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "ADD_DISCOUNT_GROUP_PRODUCT") {
    if(state.InventoryReducer.data.status == 201){
      returnState.isProductAdded = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
    } else {
     toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "DELETE_DISCOUNT_GROUP_PRODUCT") {
    if(state.InventoryReducer.data.status == 200){
      returnState.isProductDeleted = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
    } else {
     toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  }

  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    createDiscountGroup: createDiscountGroup,
    fetchDiscountGroupDataId: fetchDiscountGroupDataId,
    updateDiscountGroup: updateDiscountGroup,
    deleteDiscountGroup: deleteDiscountGroup,
    addDiscountGroupProduct:addDiscountGroupProduct,
    deleteDiscountGroupProduct:deleteDiscountGroupProduct,
    resetAction:resetAction
  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateEditDiscountGroups));
