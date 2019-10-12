import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchPOSButtonDataId, fetchPOSButtonActiveDeactive, deletePOSButton, createTablePOSButton, createFetchPOSButton, deleteTablePOSButton, updateFetchPOSButton, deletePOSButtonID, checkButtonName, getProductPackage, emptyInventoryReducer } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import moment from 'moment';
import InventoryHeader from './InventoryHeader.js';
import {numberFormat, capitalizeFirstLetter} from '../../Utils/services.js'
import { Scrollbars } from 'react-custom-scrollbars';

class AddEditposQuickButton extends Component {
  constructor(props) {
    super(props);
    const languageData = JSON.parse(localStorage.getItem('languageData'));

    this.state = {
      searchPerformed: false,
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      backAction: "/inventory/pos-quick-button",
      posButtonGroupId: this.props.match.params.id,
      showLoader: false,
      posBtnDate: '',
      showProduct : false,
      name:'',
      availablity: '',
      delArr: false,
      addProduct: false,
      nameClassAddPck: false,
      addPackage: false,
      addProductArrVal: [],
      valType: 'product',
      valuTyyp: 'package',
      arrIdVal: [],
      delValType: '',
      typValType: '',
      tempVal: false,
      pos_quick_button_products: [],
      status: true,
      userChanged:false,
      prodId: '',
      packId: '',
      addProductValue: '',
      addPackageValue: '',
      nameClass:'setting-input-box',
      product_name:'',
      showModal:false
    }
  }

  componentDidMount() {
    window.onscroll = () => {
      return false;
    }
    if(this.state.posButtonGroupId > 0){
      this.setState({ 'showLoader': true });
      this.props.fetchPOSButtonDataId(this.state.posButtonGroupId);
    } else {
      this.props.emptyInventoryReducer();
    }
    document.addEventListener('click', this.handleClick, false);
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {};
    if(props.showLoader != undefined && props.showLoader == false && props.showLoaderTime != state.showLoaderTime) {
        returnState.showLoader = false;
        returnState.showLoaderTime = props.showLoaderTime;
     }
     else if (props.AddEditposQuickButtonId !== undefined && props.AddEditposQuickButtonId != state.AddEditposQuickButtonId && state.BtnIdTimeStamp != props.BtnIdTimeStamp ) {
       returnState.arrIdVal = []
       returnState.BtnIdTimeStamp = props.BtnIdTimeStamp;
       returnState.name = (state.userChanged) ? state.name : props.AddEditposQuickButtonId.pos_quick_button.name ;
       returnState.status = (state.userChanged) ? state.status : (props.AddEditposQuickButtonId.pos_quick_button.status == 0) ? true: false;
       if(props.AddEditposQuickButtonId.pos_quick_button.pos_quick_button_products.length) {
         props.AddEditposQuickButtonId.pos_quick_button.pos_quick_button_products.map((obj, idx) => {
           returnState.arrIdVal.push(obj.product_id);
         })
       }
       returnState.pos_quick_button_products = props.AddEditposQuickButtonId.pos_quick_button.pos_quick_button_products;
       returnState.product_id =  props.AddEditposQuickButtonId.pos_quick_button.product_id;
       returnState.showLoader = false;
     }
      else if (props.checkTableButton !== undefined && props.checkTableButton != state.checkTableButton && props.checkTableButtonTime != state.checkTableButtonTime ){
          returnState.pos_quick_button_products= props.checkTableButton.data.pos_quick_button.posQuickButtonProducts;
          returnState.addProductArrVal = props.checkTableButton.data.pos_quick_button.posQuickButtonProducts;
          returnState.checkTableButtonTime = props.checkTableButtonTime;
          returnState.showLoader = false;
      }
      else if (props.FetchProductPackage !== undefined && props.FetchProductPackage != state.FetchProductPackage && state.ProductPackgTimeStamp != props.ProductPackgTimeStamp) {
            const languageData = JSON.parse(localStorage.getItem('languageData'));
            let productPackageValArr = props.FetchProductPackage.data
            returnState.productPackageVal = []
            if(props.FetchProductPackage.data){
                productPackageValArr.map((obj, idx) => {
                if(state.arrIdVal && state.arrIdVal.length) {
                  if(state.arrIdVal.indexOf(obj.id) == -1) {
                    returnState.productPackageVal.push(obj);
                    returnState.showProduct = true;
                  }
                } else {
                  returnState.productPackageVal= props.FetchProductPackage.data;
                    returnState.showProduct = true;
                }

                if(state.typValType == 'product' && state.addProductValue == '') {
                  returnState.productPackageVal = []
                  returnState.showProduct = false;
                }

                if(state.typValType == 'package' && state.addPackageValue == '') {
                  returnState.productPackageVal = []
                  returnState.showProduct = false;
                }
              });
              if(!returnState.productPackageVal.length) {
                toast.error(languageData.global['product_match_not_found']);
              }
            } else {
              returnState.productPackageVal = []
              returnState.showProduct = false;
              returnState.prodId = null;
              returnState.packId = null;
            }
            returnState.showLoader = false;
            returnState.ProductPackgTimeStamp = props.ProductPackgTimeStamp;
      }
      else if (props.checkButton !== undefined && props.checkButton != state.checkButton && state.BtnNametimeStamp != props.BtnNametimeStamp) {
            returnState.availablity= props.checkButton.data.availablity;
            returnState.showLoader = false;
            returnState.BtnNametimeStamp = props.BtnNametimeStamp;
      }
      else if (props.tableDele !== undefined && props.tableDele != state.tableDele && state.tableDeleTime != props.tableDeleTime){
          const languageData = JSON.parse(localStorage.getItem('languageData'));
          returnState.pos_quick_button_products= props.tableDele.pos_quick_button.posQuickButtonProducts;
          returnState.tableDeleTime = props.tableDeleTime;
      }
      if (props.posTableBtnVal !== undefined && props.posTableBtnVal != state.posTableBtnVal && state.posBtnDate != props.posBtnDate && state.posBtnDateTimeStamp != props.timeStampposBtnDateTimeStamp) {
        returnState.status = (state.userChanged) ? state.status : (props.posTableBtnVal.status == 0) ? true: false ;
        returnState.posBtnDate = props.posBtnDate
        returnState.showLoader = false;
        returnState.posBtnDateTimeStamp = props.posBtnDateTimeStamp;
        return returnState;
      }
      else if(props.redirect != undefined && props.redirect == true) {
           props.history.push('/inventory/pos-quick-button');
         }


    return returnState;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  }

  handleClick = (event) => {
    if(!(event.target.className == "new-blue-btn pull-right")){
      if (this.node && this.node.contains(event.target)) {
        let returnState = {}
        returnState.showProduct = false;
        this.setState(returnState);
        return
      }
      if(this.state.showLoader){
        return false
      }
      this.toggleCalendar(event.target);
    }
  }

  toggleCalendar = (elem) => {
    let showProduct = false

    if (this.state.showProduct === false && elem.addPackageValue !== undefined ) {
      showProduct = true
    } else {
      showProduct = false
    }

    this.setState({showProduct : showProduct})
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    this.setState({
      [event.target.name]: value,
      userChanged: true,
    });
  };

  handleInputChangeProd = (event, getValu) => {
    this.setState({searchPerformed: false});
    const proVal = this.props.match.params.id ? this.props.match.params.id : '';
    const target = event.target;
    const thisValu = getValu;
    const value = target.type === "checkbox" ? target.checked : target.value;
    var productVal = event.target.value
    var refSpac = /\s/g;
    let returnState = {}

        this.setState({
          showLoader: true,
          typValType: thisValu
        });
        let formData = {
          'params': {
            "type" : thisValu,
            "term": this.trimValues(value),
          }
        }
        returnState[event.target.name] = this.trimValues(value);
        returnState.showLoader = '';
        returnState.searchPerformed = true;
        if(value == '') {
          returnState.showProduct = false;
          returnState.productPackageVal = [];
        }
        this.setState(returnState, () => {
          if(formData.params.term != ''){
              this.props.getProductPackage(formData);
          }
        })
    if(thisValu == 'product'){
      if(this.state.addProductValue == '' || (this.state.addProductValue.length -1) == 0){
        this.setState({
          showProduct: false
        })
      }
    }

    if(thisValu == 'package'){
      if((this.state.addPackageValue.length -1) == 0 || this.state.addPackageValue == ''){
        this.setState({
          showProduct: false
        })
      }
    }
  };

   trimValues = (str) =>  {
  let stringStarted = false;
  let newString = "";

  for (let i in str) {
    if (!stringStarted && str[i] == " ") {
      continue;
    }
    else if (!stringStarted) {
      stringStarted = true;
    }
    newString += str[i];
  }

  return newString;
}

  dismissModal = () => {
    this.setState({showModal: false})
  }

  deletePOSButtonFunct = () => {
    this.setState({showLoader: true, showModal: false})
    let cId = this.state.posButtonGroupId;
    this.props.deletePOSButton(cId);
  }

  handleSubmit = event => {
    const posVal = this.props.match.params.id ;
    if(typeof event == 'object'){
      event.preventDefault();
    }
    let error = false;

    if (typeof this.state.name === undefined || this.state.name === null || this.state.name === '') {
      this.setState({nameClass: 'setting-input-box field_error'})
      error = true;
    } else if (this.state.name) {
      this.setState({nameClass: 'setting-input-box'})
    }

    if(error){
      return
    }

    let formData = {
      name: this.state.name,
      status: (this.state.status) ? 0 : 1
    }
    if (!this.props.match.params.id) {
      formData.package_products = this.state.addProductArrVal;
    }
    this.setState({showLoader:true})
    if(posVal){
        this.props.updateFetchPOSButton(formData, posVal);
    } else {
      this.props.createFetchPOSButton(formData);
    }
  }

  deletePOS = () =>
  {
    const posButtonGroupId = this.props.match.params.id ;
    let formData = {
      "id": this.state.delValType,
      "type": this.state.typValType
    }
    this.setState({showLoader: true});
    if(this.state.delArr){
      let id = this.state.delValType;
      let data = this.state.addProductArrVal;
      for(var i = 0; i < data.length; i++) {
          if(data[i].id == id) {
              data.splice(i, 1);
              break;
          }
        }
    }
    else {
      this.props.deleteTablePOSButton(posButtonGroupId, formData);
    }
    this.setState({showModal: false, delValType: '', typValType: '', showLoader: false, tempVal: false})
  }

  deletePOSType = (deleteIdType, typeValType, getVal) =>
  {
    var arr = this.state.arrIdVal;
    this.setState({
      delValType: deleteIdType,
      typValType: typeValType,
      showModal: true,
      tempVal: true,
      delArr: getVal ? true : false,
      showLoader: false
    })
    for( var i = 0; i < arr.length; i++){
       if ( arr[i] === deleteIdType) {
         arr.splice(i, 1);
       }
    }
  }

  handleAddProduct = (getValue) =>
  {
    const typeVAl= getValue;
    const handleId = this.props.match.params.id;

    this.setState
    ({
      addProduct: (getValue == 'product') ? true : '',
      addPackage: (getValue == 'package') ? true : ''
    })

    let formData = {
      id: handleId,
      name: (this.state.name),
    }
    if(this.state.name){
      this.props.checkButtonName(formData);
    }
    else {
      this.setState({availablity: 'false'})
    }
  }

  selectProduct = (valPro, prId) => {
    let returnState = {}
    returnState.addProductValue = valPro;
    returnState.showProduct = false;
    returnState.prodId = prId;
    this.setState(returnState);
  }

  selectPackage = (valPro, paId) => {
    let returnState = {}
    returnState.addPackageValue = valPro;
    returnState.showProduct = false;
    returnState.packId = paId;
    this.setState(returnState);
  }

  handleArraySave = () => {
    var arrSave = this.state.addProductValue ?  this.state.addProductValue : this.state.addPackageValue ;
    var arrType = this.state.addProductValue ?  'product' : 'package' ;
    var arrProdArr = this.state.addProductArrVal;
    var arrId = this.state.addProductValue ? this.state.prodId : this.state.packId;
    var tablId = this.props.match.params.id;
    let error = false;
    var arrIdValArray = this.state.arrIdVal;

    if(!arrId) {
      this.setState({addProductValue: '', addPackageValue: ''})
    if(this.state.addProduct){
      if (typeof this.state.addProductValue === undefined || this.state.addProductValue === null || this.state.addProductValue === '' ) {
        this.setState({nameClassAddPck: true})
        // toast.dismiss();
        // toast.error('Select Product');
        error = true;
      }
    }
    if(this.state.addPackage){
      if (typeof this.state.addPackageValue === undefined || this.state.addPackageValue === null || this.state.addPackageValue === '') {
        this.setState({nameClassAddPck: true})
        // toast.dismiss();
        // toast.error('Select Package');
        error = true;
      }
    }
    return false;
  }

    if(arrType=='product'){
      var saveVal = this.state.productPackageVal.find(y => y.product_name == (this.state.addProductValue ? this.state.addProductValue : ''));
    }

    if(arrType=='package'){
      var saveValPckg = this.state.productPackageVal.find(y => y.name == (this.state.addPackageValue ? this.state.addPackageValue : ''));
    }

    if(error){
      return
    }

    let formData = {
      "id": arrId ? arrId : this.state.prodId,
	    "type": arrType
    }

    if(this.state.addPackageValue==''){
      this.setState({nameClassAddPck: 'false'})
    }
    else if(this.state.addProductValue==''){
      this.setState({nameClassAddPck: 'false'})
    }

    if(tablId){
      if(saveVal || saveValPckg){
        this.setState({showLoader:true})
        this.props.createTablePOSButton(formData, tablId);
        arrIdValArray.push(arrId);
        this.setState({nameClassAddPck:false, nameClass: 'setting-input-box' })
      }
    }
    else {
      var arrVal = this.state.addProductArrVal;
      if(arrId){
        if(saveVal || saveValPckg){
          arrProdArr.push({"id": arrId, "name" : arrSave, "type" : arrType });
          arrIdValArray.push( arrId);
          this.setState({nameClassAddPck:false, nameClass: 'setting-input-box'})
        }
      }
      else{
        if(arrType=='package'){
          toast.dismiss();
          toast.error('Select Package');
          this.setState({nameClass: 'setting-input-box field_error'})
        }
        else{
          toast.dismiss();
          toast.error('Select Product');
          this.setState({nameClass: 'setting-input-box field_error'})
        }
      }
    }
    this.setState({ arrProdArr: arrProdArr , addProductValue: '', addPackageValue: '', arrIdValArray: arrIdValArray })
  }

  render() {
  return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'pos-quick-button'} />
          <div className="juvly-section full-width">
            <div className="juvly-container">
              <div className="juvly-title m-b-40">{(this.state.posButtonGroupId) ? 'Edit POS Quick Button' : 'Add POS Quick Button' }
                <a href={this.state.backAction} className="pull-right crossIcon"><img src="/images/close.png" /></a>
                <div className="setting-custom-switch product-active pull-right">
                  <span id="membership_lable" className="p-r-10" htmlFor ="discountGroupStatus">{this.state.status ? this.state.inventoryLang.inventory_active : this.state.inventoryLang.inventory_inactive}</span>
                  <label className="setting-switch pull-right no-margin">
                    <input type="checkbox" className="setting-custom-switch-input" id="discountGroupStatus" name='status' value={this.state.status} checked={(this.state.status) ? 'checked' : false} onChange={this.handleInputChange} />
                    <span className="setting-slider" />
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="row">
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_pos_quick_btn_name}<span className="setting-require">*</span></div>
                        <input autoComplete="off" className={(this.state.availablity == 'false' || this.state.availablity == null)  ? 'setting-input-box setting-input-box-invalid' : this.state.nameClass } type="text" name='name' value={this.state.name} onChange={this.handleInputChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={this.state.addProduct ? "juvly-container" : 'no-display'} >
              <div className="juvly-title m-b-40">{this.state.inventoryLang.inventory_add_new_product}</div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="row">
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_product}<span className="setting-require">*</span></div>
                        <input autoComplete="off" className={this.state.nameClassAddPck ? "setting-input-box field_error" : "setting-input-box "} type="text"  name='addProductValue' value={this.state.addProductValue} onChange={ (e) => this.handleInputChangeProd(e, this.state.valType)} />
                        <ul className={(this.state.productPackageVal && this.state.productPackageVal.length > 0 && this.state.showProduct) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"}  ref={node => {this.node = node}}>
                        {this.state.productPackageVal && this.state.productPackageVal.map((obj, idx) => {
                          return(
                            <li key={obj.id} onClick={() => this.selectProduct(obj.product_name, obj.id)} ref={node => {this.node = node}}>
                              <a>
                                {obj.product_name}
                              </a>
                            </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xs-12">
                    <button className="new-blue-btn pull-right" onClick ={this.handleArraySave} >{this.state.inventoryLang.inventory_save}</button>
                    <button className="new-white-btn pull-right" onClick ={() => this.setState({nameClass: 'setting-input-box', addProduct: false, showProduct: false, addProductValue: '', addPackageValue: '', availablity: '', nameClassAddPck: false, productPackageVal: []})}>{this.state.inventoryLang.inventory_Cancel}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={this.state.addPackage ? "juvly-container" : 'no-display'} >
              <div className="juvly-title m-b-40">{this.state.inventoryLang.invenotory_add_new_packg}</div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="row">
                    <div className="col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_packge}<span className="setting-require">*</span></div>
                        <input autoComplete="off" className={this.state.nameClassAddPck ? "setting-input-box field_error" : "setting-input-box "} type="text"  name='addPackageValue' value={this.state.addPackageValue} onChange={(e) => this.handleInputChangeProd(e, this.state.valuTyyp)} />
                        <ul className={(this.state.productPackageVal && this.state.productPackageVal.length > 0 && this.state.showProduct) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"} ref={node => {this.node = node}}>
                        {this.state.productPackageVal && this.state.productPackageVal.map((obj, idx) => {
                          return(
                            <li key={obj.id} onClick={() => this.selectPackage(obj.name, obj.id)} ref={node => {this.node = node}}>
                              <a>
                                {obj.name}
                              </a>
                            </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                    <div className="col-sm-6 col-xs-12">
                      <button className="new-blue-btn pull-right" onClick ={this.handleArraySave}>{this.state.inventoryLang.inventory_save}</button>
                      <button className="new-white-btn pull-right" onClick ={() => this.setState({nameClass: 'setting-input-box', addPackage: false, showProduct: false ,addProductValue: '', addPackageValue: '', availablity: '', nameClassAddPck: false, productPackageVal: [] })}>{this.state.inventoryLang.inventory_Cancel}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="juvly-container border-top">
              <div className="juvly-title m-b-0">{this.state.inventoryLang.inventory_prod_pack}
                <a className={(this.state.addProduct || this.state.addPackage) ? 'no-display' : "pull-right new-blue-btn"} onClick ={() => this.handleAddProduct(this.state.valType)}>{this.state.inventoryLang.inventory_Add_Product}</a>
                <a className={(this.state.addProduct || this.state.addPackage) ? 'no-display' : "pull-right new-blue-btn"} onClick={() => this.handleAddProduct(this.state.valuTyyp)}>{this.state.inventoryLang.inventory_Add_Package}</a>
              </div>
            </div>
            <div className="table-responsive fixed-header-table">
              <table className="table-updated juvly-table no-hover table-min-width table-fixed">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-6 table-updated-th">{this.state.inventoryLang.survey_nps_name}</th>
                    <th className="col-xs-3 table-updated-th text-left">{this.state.inventoryLang.inventory_Type}</th>
                    <th className="col-xs-3 table-updated-th text-left">{this.state.inventoryLang.inventory_action}</th>
                  </tr>
                </thead>
                <Scrollbars style={{height:195}} className="custome-scroll">
                  <tbody className="ajax_body border-bottom">
                  {
                  this.state.pos_quick_button_products !== undefined && this.state.pos_quick_button_products.map((obj, idx) => {
                    return (
                    <tr key ={obj.id}>
                      <td className="col-xs-6 table-updated-td">{obj.name}</td>
                      <td className="col-xs-3 table-updated-td text-left">{obj.type}</td>
                      <td className="col-xs-3 table-updated-td text-left"><a className="easy-link" onClick={() => this.deletePOSType(obj.product_id, obj.type)}>{this.state.inventoryLang.inventory_delete}</a></td>
                    </tr>
                    );
                  })}
                  {
                  (!this.props.match.params.id) && this.state.addProductArrVal !== undefined  && this.state.addProductArrVal.map((obj, idx) => {
                    return (
                    <tr key ={obj.id}>
                      <td className="col-xs-6 table-updated-td">{obj.name}</td>
                      <td className="col-xs-3 table-updated-td text-left">{obj.type}</td>
                      <td className="col-xs-3 table-updated-td text-left"><a className="easy-link" onClick={() => this.deletePOSType(obj.id, obj.type, true)}>{this.state.inventoryLang.inventory_delete}</a></td>
                    </tr>
                    );
                  })}
                  {(this.state.showLoader === false)  && <tr className={(((this.state.pos_quick_button_products != undefined && this.state.addProductArrVal != undefined ) && (this.state.pos_quick_button_products.length == 0 && this.state.addProductArrVal.length == 0 ) )) ? 'no-record' : 'no-record no-display'} >
                    <td className="" style={{float: "left", width: "100%", fontSize: "13px", textAlign: "center", marginTop: "0px", padding: "0px" }} >
                      {this.state.inventoryLang.inventory_No_record_found}
                    </td>
                  </tr>}
                  </tbody>
                </Scrollbars>
              </table>
            </div>

            <div className="footer-static">
              <button className="new-blue-btn pull-right" onClick={this.handleSubmit}>{this.state.inventoryLang.inventory_save}</button>
              <a href={this.state.backAction} className="new-white-btn pull-right" id="resetform">{this.state.inventoryLang.inventory_Cancel}</a>
              {(this.state.posButtonGroupId > 0) &&
                <button className="new-red-btn pull-left" onClick={() => {
                  this.setState({showModal:true})
                }}>{this.state.inventoryLang.inventory_delete}</button>
              }
            </div>


            <div className={(this.state.showModal ? 'overlay' : '')}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.inventoryLang.inventory_Confirmation_required}{this.state.showModal}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {!this.state.tempVal ? 'Are you sure you want to delete this Pos Quick Button?' : this.state.typValType == 'package' ? 'Are you sure you want to delete this package from Pos Quick Button?' : 'Are you sure you want to delete this product from Pos Quick Button?' }
                    </div>
                    <div className="modal-footer" >
                    <div className="col-md-12 text-left" id="footer-btn">
                      <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.inventoryLang.inventory_No}</button>
                      <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.state.tempVal ? this.deletePOS : this.deletePOSButtonFunct}>{this.state.inventoryLang.inventory_Yes}</button>
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
  if (state.InventoryReducer.action === "POS_ACTIVATE_DEACTIVATE") {
    if(state.InventoryReducer.data.status == 200){
      returnState.message = languageData.global[state.InventoryReducer.data.message];
      returnState.posTableBtnVal = state.InventoryReducer.data.data;
      returnState.posBtnDateTimeStamp = new Date();
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
      returnState.showLoaderTime = new Date();
    }
  }
    if (state.InventoryReducer.action === "FETCH_PRODUCT_PACKAGE") {
    if(state.InventoryReducer.data.status != 200) {
     toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.ProductPackgTimeStamp = new Date();
      returnState.apiStatus = state.InventoryReducer.data.status;
      returnState.apiError = languageData.global[state.InventoryReducer.data.message];
      returnState.FetchProductPackage = state.InventoryReducer.data
    } else {
      returnState.ProductPackgTimeStamp = new Date();
      returnState.FetchProductPackage = state.InventoryReducer.data.data;
      returnState.status = 200;
    }
  }
   if (state.InventoryReducer.action === "CHECK_BUTTON_NAME") {
    if(state.InventoryReducer.data.status != 200){
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
      returnState.showLoaderTime = new Date();
     }
     else {
      returnState.BtnNametimeStamp = new Date();
      returnState.checkButton = state.InventoryReducer.data;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
     }
    }
   if (state.InventoryReducer.action === "CREATE_POS_TABLE_BUTTON") {
      if(state.InventoryReducer.data.status != 200){
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
      returnState.showLoaderTime = new Date();
    }
       else {
         returnState.checkTableButtonTime = new Date()
         returnState.checkTableButton = state.InventoryReducer.data;
         toast.success(languageData.global[state.InventoryReducer.data.message]);
       }
      }
 if (state.InventoryReducer.action === "CREATE_POS_BUTTON") {
    if(state.InventoryReducer.data.status != 201){
       returnState.user = state.InventoryReducer.data;
       toast.error(languageData.global[state.InventoryReducer.data.message]);
       returnState.showLoader = false
       returnState.showLoaderTime = new Date();
     }
     else {
       returnState.redirect = true;
       toast.success(languageData.global[state.InventoryReducer.data.message])
       returnState.message = languageData.global[state.InventoryReducer.data.message];
     }
    }
   if(state.InventoryReducer.action === 'UPDATE_POS_BUTTON') {
      if (state.InventoryReducer.data.status != 200) {
         toast.error(languageData.global[state.InventoryReducer.data.message]);
         returnState.showLoader = false
         returnState.showLoaderTime = new Date();
       }
       else {
         returnState.posBtnDateTimeStamp = new Date();
         returnState.timeStamp = new Date();
         returnState.redirect = true;
         toast.success(languageData.global[state.InventoryReducer.data.message])
         returnState.message = languageData.global[state.InventoryReducer.data.message];
       }
      return returnState;
    }
 if (state.InventoryReducer.action === "FETCH_POS_BUTTON_ID") {
    if(state.InventoryReducer.data.status != 200) {
      returnState.showLoader = false
      returnState.showLoaderTime = new Date();
    } else {
      returnState.BtnIdTimeStamp = new Date();
      returnState.AddEditposQuickButtonId = state.InventoryReducer.data.data;
      returnState.status = 200;
    }
  }

   if(state.InventoryReducer.action === 'DELETE_POS_BUTTON') {
      if(state.InventoryReducer.data.status != 200){
        returnState.showLoader = false
        returnState.showLoaderTime = new Date();
        toast.error(languageData.global[state.InventoryReducer.data.message]);
      }
      else {
        returnState.redirect = true;
        returnState.message = languageData.global[state.InventoryReducer.data.message];
        toast.success(languageData.global[state.InventoryReducer.data.message]);
      }
    }

   if(state.InventoryReducer.action === 'DELETE_POS_BUTTON_TABLE') {
      if(state.InventoryReducer.data.status != 200){
        returnState.showLoader = false;
        returnState.showLoaderTime = new Date();
        toast.error(languageData.global[state.InventoryReducer.data.message]);
      }
      else {
        returnState.tableDele = state.InventoryReducer.data.data
        returnState.tableDeleTime = new Date();
        toast.success(languageData.global[state.InventoryReducer.data.message]);
      }
    }
    if (state.InventoryReducer.action === "EMPTY_INVENTROY") {
      returnState.POSQuickButtonData = undefined;
    }
  return returnState;
} 

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    fetchPOSButtonDataId: fetchPOSButtonDataId,
    fetchPOSButtonActiveDeactive: fetchPOSButtonActiveDeactive,
    deletePOSButton: deletePOSButton,
    createFetchPOSButton: createFetchPOSButton,
    updateFetchPOSButton: updateFetchPOSButton,
    checkButtonName: checkButtonName,
    getProductPackage: getProductPackage,
    deletePOSButtonID: deletePOSButtonID,
    deleteTablePOSButton: deleteTablePOSButton,
    createTablePOSButton: createTablePOSButton,
    emptyInventoryReducer: emptyInventoryReducer,
  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(AddEditposQuickButton));
