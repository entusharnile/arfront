import React, { Component } from 'react';
import { Link } from "react-router-dom";
import {checkIfPermissionAllowed, numberFormat } from '../../Utils/services.js';
import InventoryProductsActive from './InventoryProductActive.js';
import InventoryProductsInactive from './InventoryProductInactive.js';

class InventoryHeader extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      showLoadingText : false,
      activeMenuTag : ''
    };
  }

  static getDerivedStateFromProps(props, state) {
    let returnState = {}
    if(props.activeMenuTag != undefined){
      returnState.activeMenuTag = props.activeMenuTag;
    }
    return returnState;
  }

  render() {
    var urlR = window.location.href;
    var res = urlR.split("/");
    return (
      <div>
        <ul className="sub-menu">
        {checkIfPermissionAllowed('view-products-inventory') && <li><Link to = "/inventory/products/active" className={(this.state.activeMenuTag == 'products-active') ? 'active' : ''} name = "ProductsActive" >{this.state.inventoryLang.inventory_Products_Active}</Link></li>}

        {checkIfPermissionAllowed('view-products-inventory') && <li><Link to = "/inventory/products/inactive" className={(this.state.activeMenuTag == 'products-inactive') ? 'active' : ''} name = "ProductsInactive" >{this.state.inventoryLang.ar_products_directory}</Link></li>}

        {checkIfPermissionAllowed('view-product-categories') && <li><Link to = "/inventory/products-categories" className={(this.state.activeMenuTag == 'products-categories') ? 'active' : ''} name = "categories"  >{this.state.inventoryLang.inventory_Categories}</Link></li>}

        <li><Link to = "/inventory/discount-packages" className={(this.state.activeMenuTag == 'discount-packages') ? 'active' : ''} name = "DiscountPackages"  >{this.state.inventoryLang.inventory_Discount_Packages}</Link></li>

        <li><Link to = "/inventory/discount-groups" className={(this.state.activeMenuTag == 'discount-groups') ? 'active' : ''} name = "DiscountGroups" >{this.state.inventoryLang.inventory_Discount_Groups}</Link></li>

        <li><Link to = "/inventory/e-giftcards" className={(this.state.activeMenuTag == 'e-giftcards') ? 'active' : ''} name = "eGiftCards" >{this.state.inventoryLang.inventory_eGift_Cards}</Link></li>

        <li><Link to = "/inventory/discount-coupons" className={(this.state.activeMenuTag == 'discount-coupons') ? 'active' : ''} name = "DiscountCoupons" >{this.state.inventoryLang.inventory_discount_coupons}</Link></li>

        <li><Link to = "/inventory/pos-quick-button" className={(this.state.activeMenuTag == 'pos-quick-button') ? 'active' : ''} name = "posQuickButton" >{this.state.inventoryLang.inventory_pos_quick_btn}</Link></li>

        {/*<li><Link to = "/inventory/treatmentPlanTemplates" className = {(res[res.length-1] == "treatmentPlanTemplates") ? "active" : ''} name = "TreatmentPlanTemplates"  >{this.state.inventoryLang.inventory_Treatment_Plan_Templates}</Link></li>*/}

        </ul>
      </div>
    );
  }
}

export default InventoryHeader;
