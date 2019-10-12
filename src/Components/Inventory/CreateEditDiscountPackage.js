import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';
import moment from 'moment';
import DatePicker from "react-datepicker";
import TagsInput from 'react-tagsinput'
import { getDefaultPackageData, searchProductByName, saveDiscountPackage, deleteDiscountPackage,activateDiscountPackage } from '../../Actions/Inventory/inventoryActions.js';
import 'react-tagsinput/react-tagsinput.css'
import Select from 'react-select';
import { checkIfPermissionAllowed, numberFormat, formatBytes, isNumber, displayName, showFormattedDate, getCurrencySymbol, isPositiveNumber,dateFormatPicker } from '../../Utils/services.js';

const apiDateFormat = (date) => {
  return moment(date).format('YYYY-MM-DD');
}

const viewDateFormat = (date) => {
  return moment(date).format('MMMM DD, YYYY');
}

const defaultPackage = () => {
  return { product_id: "", units: "", dollar_value: "", product_name: "" }
};
const defaultErrorPackage = () => {
  return { product_id: false, units: false, dollar_value: false, product_name: false }
};

class CreateEditDiscountPackage extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    let languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      packageId: 0,
      discount_types: ['percentage', 'dollars', 'package', 'bogo', 'group'],
      type: 'percentage',
      package_buy_type: 'product',
      name: '',
      customer_type: 'all',
      keywords: [],
      clinics: [],
      providers: [],
      groups: [],
      discount_package_provider: [],
      discount_package_location: [],
      productPackageArr: [defaultPackage()],
      productPackageErrorArr: [defaultErrorPackage()],
      showLoader: false,
      is_in_current_offers: false,
      is_tax_enabled: false,
      all_locations: false,
      all_providers: false,
      active_from: moment().toDate(),
      active_untill: moment().add('years', 1).toDate(),
      active_untill_min_date: new Date(moment().add(1, 'days')),
      current_offer_days: "",
      packageDefaultData: {},
      globalLang: languageData.global,
      "bogo_product_id": 0,
      "bogo_product_quantity": 0,
      "bogo_buy_product_value": 0,
      "bogo_free_product_id": 0,
      "bogo_free_product_quantity": 0,
      "bogo_discount_percentage": '',
      "bogo_free_product_value": 0,
      bogo_product: "",
      bogo_product_error: false,
      bogoProductList: [],
      bogoFreeProductList: [],
      packageProductList: [],
      showBogoProducts: false,
      showBogoFreeProducts: false,
      showPackageProducts: false,
      package_product_price: '',
      package_price_for_members: '',
      nameError: false,
      typeError: false,
      discount_dollarsError: false,
      discount_percentageError: false,
      active_fromError: false,
      active_untillError: false,
      current_offer_daysError: false,
      all_locationsError: false,
      all_providersError: false,
      discount_type: 'free',
      discount_percentage: '',
      inventoryLang: languageData.inventory,
      discount_dollars: '',
      package_bogo_price: '',
      bogo_free_product: '',
      status:0,
    };
  }

  showLoaderFunc = () => {
    this.setState({ showLoader: true });
    localStorage.setItem("showLoader", false);
  }

  componentDidMount() {
    document.addEventListener('click', this.handleOnClick, false);
    window.onscroll = () => {
      return false;
    }
    const packageId = (this.props.match.params.id) ? (this.props.match.params.id) : 0;
    let formData = { 'params': {} }
    this.setState({ packageId: packageId })
    this.showLoaderFunc();
    this.props.getDefaultPackageData(packageId);
    //disable datepicker input-field from manually enter the value
    const datePicker1=document.getElementsByClassName("react-datepicker__input-container")[0];
    datePicker1.childNodes[0].setAttribute("readOnly",true);
    const datePicker2=document.getElementsByClassName("react-datepicker__input-container")[1];
    datePicker2.childNodes[0].setAttribute("readOnly",true);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.savedData != undefined && nextProps.savedData == true) {
      if (localStorage.getItem("showLoader") == "false") {
        toast.success(nextProps.message)
        nextProps.history.push('/inventory/discount-packages');
      }
    }
    else if (nextProps.redirect != undefined && nextProps.redirect == true) {
      toast.success();
      nextProps.history.push('/inventory/discount-packages');
    }
    else if (nextProps.packageDefaultData !== undefined && nextProps.packageDefaultData !== prevState.packageDefaultData) {
      if (localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        returnState.packageDefaultData = nextProps.packageDefaultData;
        returnState.clinics = nextProps.packageDefaultData.clinics;
        returnState.providers = nextProps.packageDefaultData.providers;
        returnState.groups = nextProps.packageDefaultData.discount_group;

        if (nextProps.packageDefaultData.clinics && !prevState.userChanged) {
          nextProps.packageDefaultData.clinics.map((obj, idx) => {
            let clinicTax = 0
            if(obj.package_clinic_tax !== undefined && obj.package_clinic_tax !== null){
              if(obj.package_clinic_tax.tax_percentage !== undefined && obj.package_clinic_tax.tax_percentage !== null){
                clinicTax = obj.package_clinic_tax.tax_percentage
              }
            }else {
              clinicTax = obj.tax
            }
            returnState['clinicTax-' + obj.id] = clinicTax;
            returnState['clinicTaxError-' + obj.id] = false;
          })
        }

        if (prevState.packageId) {
          let packageData = nextProps.packageDefaultData.discount_package;

          returnState.active_from = (prevState.userChanged) ? prevState.active_from : (packageData.active_from) ? moment(packageData.active_from).toDate() : null;
          returnState.active_untill = (prevState.userChanged) ? prevState.active_untill : (packageData.active_untill) ? moment(packageData.active_untill).toDate() : null;
          returnState.active_untill_min_date = (returnState.active_from) ? new Date(moment(returnState.active_from).add(1, 'days')) : new Date()

          //active_untill_min_date: new Date(moment().add(1, 'years')),
          returnState.all_locations = (prevState.userChanged) ? prevState.all_locations : packageData.all_locations;
          returnState.all_providers = (prevState.userChanged) ? prevState.all_providers : packageData.all_providers;
          returnState.bogo_buy_product_value = (prevState.userChanged) ? prevState.bogo_buy_product_value : packageData.bogo_buy_product_value;
          returnState.bogo_buy_type = (prevState.userChanged) ? prevState.bogo_buy_type : packageData.bogo_buy_type;
          returnState.bogo_discount_percentage = (prevState.userChanged) ? prevState.bogo_discount_percentage : (packageData.bogo_discount_percentage) ? packageData.bogo_discount_percentage : '';


          returnState.discount_type = ((packageData.bogo_discount_percentage)) ? 'percentage' : 'free';

          returnState.bogo_free_product_id = (prevState.userChanged) ? prevState.bogo_free_product_id : (packageData.bogo_free_product_id) ? packageData.bogo_free_product_id : '';
          returnState.bogo_free_product_quantity = (prevState.userChanged) ? prevState.bogo_free_product_quantity : packageData.bogo_free_product_quantity;
          returnState.bogo_free_product_value = (prevState.userChanged) ? prevState.bogo_free_product_value : packageData.bogo_free_product_value;
          returnState.bogo_free_type = (prevState.userChanged) ? prevState.bogo_free_type : packageData.bogo_free_type;
          returnState.bogo_product_id = (prevState.userChanged) ? prevState.bogo_product_id : packageData.bogo_product_id;
          returnState.bogo_product_quantity = (prevState.userChanged) ? prevState.bogo_product_quantity : packageData.bogo_product_quantity;
          returnState.current_offer_days = (prevState.userChanged) ? prevState.current_offer_days : packageData.current_offer_days;
          returnState.customer_type = (prevState.userChanged) ? prevState.customer_type : packageData.customer_type;
          returnState.discount_dollars = (prevState.userChanged) ? prevState.discount_dollars : packageData.discount_dollars;
          //returnState.discount_package_location = (prevState.userChanged) ? prevState.discount_package_location : packageData.discount_package_location;
          //returnState.discount_package_provider = (prevState.userChanged) ? prevState.discount_package_provider : packageData.discount_package_provider;
          returnState.discount_percentage = (prevState.userChanged) ? prevState.discount_percentage : packageData.discount_percentage;
          returnState.package_product_price = (prevState.userChanged) ? prevState.package_product_price : packageData.package_bogo_price;
          returnState.is_in_current_offers = (prevState.userChanged) ? prevState.is_in_current_offers : packageData.is_in_current_offers;
          returnState.is_tax_enabled = (prevState.userChanged) ? prevState.is_tax_enabled : packageData.is_tax_enabled;
          returnState.keywords = (prevState.userChanged) ? prevState.keywords : (packageData.keywords) ? packageData.keywords.split(',') : [];
          returnState.name = (prevState.userChanged) ? prevState.name : packageData.name;
          returnState.package_buy_type = (prevState.userChanged) ? prevState.package_buy_type : packageData.package_buy_type;
          returnState.package_product_id = (prevState.userChanged) ? prevState.package_product_id : packageData.package_product_id;
          returnState.package_product_quantity = (prevState.userChanged) ? prevState.package_product_quantity : packageData.package_product_quantity;
          returnState.status = (prevState.userChanged) ? prevState.status : packageData.status;
          returnState.type = (prevState.userChanged) ? prevState.type : packageData.type;
          returnState.package_bogo_price = (prevState.userChanged) ? prevState.package_bogo_price : packageData.package_bogo_price;
          returnState.package_price_for_members = (prevState.userChanged) ? prevState.package_price_for_members : (packageData.package_price_for_members) ? packageData.package_price_for_members : '0.00';

          if (packageData.type == 'bogo' && !prevState.userChanged && packageData.bogo_buy_type != 'group') {
            returnState.bogo_free_product_id = packageData.bogo_offer_free_product_id;
            returnState.bogo_product_id = packageData.bogo_offer_product_id;
            returnState.bogo_free_product_quantity = packageData.bogo_offer_free_product_quantity;
            returnState.bogo_product_quantity = packageData.bogo_offer_product_quantity;
            let bogo_product = packageData.product_names.find(y => y.id === packageData.bogo_offer_product_id);
            let bogo_free_product = packageData.product_names.find(y => y.id === packageData.bogo_offer_free_product_id);
            returnState.bogo_product = bogo_product.product_name;
            returnState.bogo_free_product = (bogo_free_product.product_name) ? bogo_free_product.product_name : '';
          }

          if (packageData.bogo_buy_type == 'group' && !prevState.userChanged) {
            returnState.type = packageData.bogo_buy_type;
          }

          if (nextProps.packageDefaultData.discount_package_products.length && !prevState.userChanged) {
            let productPackageArr = [];
            let productPackageErrorArr = [];
            nextProps.packageDefaultData.discount_package_products.map((obj, idx) => {
              productPackageArr.push({ product_id: obj.product_id, product_name: (obj.product) ? obj.product.product_name : '', dollar_value: obj.dollar_value, units: obj.units, id: obj.id })
              productPackageErrorArr.push(defaultErrorPackage());
            })
            returnState.productPackageArr = productPackageArr;
            returnState.productPackageErrorArr = productPackageErrorArr;
          }

          if (packageData.discount_package_location.length && !prevState.userChanged) {
            let discount_package_location = [];
            packageData.discount_package_location.map((obj, idx) => {
              let clinic = nextProps.packageDefaultData.clinics.find(y => y.id === obj.clinic_id);
              discount_package_location.push({ value: obj.clinic_id, label: clinic.clinic_name })
            });
            returnState.discount_package_location = discount_package_location;
          }
          if (packageData.discount_package_provider.length && !prevState.userChanged) {
            let discount_package_provider = [];
            packageData.discount_package_provider.map((obj, idx) => {
              let provider = nextProps.packageDefaultData.providers.find(y => y.id === obj.provider_id);
              discount_package_provider.push({ value: obj.provider_id, label: displayName(provider) })
            });
            returnState.discount_package_provider = discount_package_provider;
          }
          returnState.discount_group_id = (prevState.userChanged) ? prevState.discount_group_id : (packageData.discount_group_id) ? packageData.discount_group_id : 0;
        }
      }
    }
    else if (nextProps.bogoProductList != undefined && nextProps.bogoProductList.products != prevState.bogoProductList) {
      if (localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        returnState.bogoProductList = nextProps.bogoProductList.products;
        returnState.showBogoProducts = true;

      }
    }
    else if (nextProps.bogoFreeProductList != undefined && nextProps.bogoFreeProductList.products != prevState.bogoFreeProductList) {
      if (localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        returnState.bogoFreeProductList = nextProps.bogoFreeProductList.products;
        returnState.showBogoFreeProducts = true;
      }
    }
    else if (nextProps.packageProductList != undefined && nextProps.packageProductList.products != prevState.packageProductList) {
      returnState.showLoader = false;
      returnState.packageProductList = nextProps.packageProductList.products;
      returnState["showPackageProducts-" + prevState.packageindex] = true;
    } else if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      if (localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        return returnState;
      }
    }
    return returnState;
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOnClick, false);
  }

  handleOnClick = (e) => {
    if (this.ref_bogo_free_product_container !== undefined && this.ref_bogo_free_product_container !== null && !this.ref_bogo_free_product_container.contains(e.target) && (this.state.bogo_free_product_focus !== undefined && this.state.bogo_free_product_focus === true)) {
      this.setState({ bogo_free_product_focus: false, bogo_free_product_id:0, bogo_free_product: ''})
    }
    if (this.ref_bogo_product_container !== undefined && this.ref_bogo_product_container !== null && !this.ref_bogo_product_container.contains(e.target) && (this.state.bogo_product_focus !== undefined && this.state.bogo_product_focus === true)) {
      this.setState({ bogo_product_focus: false, bogo_product_id:0, bogo_product: '' })
    }
    if (this.ref_product_name_container !== undefined && this.ref_product_name_container !== null && !this.ref_product_name_container.contains(e.target)) {
      const state = this.state;
      for (var idx in state) {
        if (idx.includes("product_name_focus_")) {
          if (state[idx] === true) {
            const index = idx.split('_').pop();
            let returnState = {};
            const productPackageArr = this.state.productPackageArr;
            if(productPackageArr[index] !== undefined){
              productPackageArr[index]["product_id"] = '';
              productPackageArr[index]["product_name"] = '';
              returnState.productPackageArr = productPackageArr;
              returnState["showPackageProducts-" + index] = false;
            }
            returnState[idx] = false
            this.setState(returnState)
          }
        }
      }
    }
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const packageindex = event.target.dataset.packageindex;
    if (packageindex) {
      const productPackageArr = this.state.productPackageArr;
      productPackageArr[packageindex][target.name] = value;
      this.setState({ productPackageArr: productPackageArr });
    } else {
      this.setState({
        [event.target.name]: value,
        userChanged: true
      });
    }
  }

  handleSearchDatePicker = (name, date) => {
    let returnState = {}
    returnState[name] = date
    this.setState(returnState);

    // reset active_till greater than from active_from
    if (name === 'active_from' && date) {
      let active_untill = (this.state.active_untill) ? this.state.active_untill : new Date()
      if (!moment(active_untill).isAfter(date)) {
        this.setState({
          active_untill: new Date(moment(date).add(1, 'years')),
          active_untill_min_date: new Date(moment(date).add(1, 'days'))
        });
      } else {
        this.setState({
          active_untill_min_date: new Date(moment(date).add(1, 'days'))
        });
      }
    }
  }

  handleTagChange = (value) => {
    this.setState({ keywords: value, userChanged: true });
  }

  handleChange = (selectedOption) => {
    this.setState({
      discount_package_location: selectedOption,
      userChanged: true
    });

  }

  handleProviderChange = (selectedOption) => {
    this.setState({
      discount_package_provider: selectedOption,
      userChanged: true
    });
  }

  handleProductChange = (mode, event) => {
    const target = event.target;
    let value = target.value;
    let name = event.target.name;
    let returnState = {}
    let packageindex = -1
    if (mode == 'package') {
      packageindex = event.currentTarget.dataset.packageindex;
      const productPackageArr = this.state.productPackageArr;
      if (productPackageArr[packageindex]["product_name"] == value) {
        return false;
      }
      productPackageArr[packageindex]["product_name"] = value;
      productPackageArr[packageindex]["product_id"] = '';

      // close auto-suggestion block for other product name
      const state = this.state;
      for (var idx in state) {
        if (idx.includes("product_name_focus_")) {
          if (state[idx] === true && !idx.includes("product_name_focus_" + packageindex)) {
            this.setState({ [idx]: false })
          }
        }
      }

      this.setState({ productPackageArr: productPackageArr, packageindex: packageindex, ['product_name_focus_' + packageindex]: true });
    } else {
      returnState[event.target.name] = value;
      if(mode == 'bogo_product'){
        returnState.bogo_product_id = 0;
      } else if(mode == 'bogo_free_product'){
        returnState.bogo_free_product_id = 0
      }
    }
    this.setState(returnState);
    let formData = { params: {} }
    formData.params.term = value.trim();
    if (mode == 'bogo_product' && this.state.bogo_free_product_id) {
      //formData.params.selected_product_ids = this.state.bogo_free_product_id;
    } else if (mode == 'bogo_free_product' && this.state.bogo_product_id) {
      //formData.params.selected_product_ids = this.state.bogo_product_id;
    } else if (mode == 'package') {
      let selected_product_ids = []
      this.state.productPackageArr.map((obj, idx) => {
        if (obj.product_id && packageindex != idx)
          selected_product_ids.push(obj.product_id);
      })
      if (selected_product_ids.length) {
        let formIds = selected_product_ids.join(',')
        formData.params.selected_product_ids = formIds;
      }
    }
    if (typeof value === 'string') {
      if (value.length >= 2) {
        value = value.trim()
        this.props.searchProductByName(formData, mode);
      }
    }
  }

  handleOnBlur = (mode, event) => {
    this.setState({ [mode]: false })
  }

  handleOnFocus = (mode, index, event) => {
    index = index || 0
    if (mode === 'product_name_focus') {
      this.setState({ ['product_name_focus_' + index]: false })
    } else {
      this.setState({ [mode]: true })
    }
  }

  selectProduct = (event) => {
    const target = event.target;
    let value = target.value;
    let name = event.target.name;
    let mode = event.currentTarget.dataset.mode;
    let id = event.currentTarget.dataset.id;
    let pname = event.currentTarget.dataset.pname;

    if (mode == 'bogo_product') {
      this.setState({ bogo_product_id: id, bogo_product: pname, showBogoProducts: false, bogo_product_focus:false })
    } else if (mode == 'bogo_free_product') {
      this.setState({ bogo_free_product_id: id, bogo_free_product: pname, showBogoFreeProducts: false, bogo_free_product_focus:false })
    }
  }

  selectProductPackage = (event) => {
    const target = event.target;
    let value = target.value;
    let name = event.target.name;
    let mode = event.currentTarget.dataset.mode;
    let id = event.currentTarget.dataset.id;
    let index = event.currentTarget.dataset.index;
    let pname = event.currentTarget.dataset.pname;
    let returnState = {};
    const productPackageArr = this.state.productPackageArr;
    productPackageArr[index]["product_id"] = id;
    productPackageArr[index]["product_name"] = pname;

    returnState.productPackageArr = productPackageArr;
    returnState["showPackageProducts-" + index] = false;
    returnState['product_name_focus_'+index] = false
    this.setState(returnState);
  }

  addMoreProduct = () => {
    const productPackageArr = this.state.productPackageArr;
    const productPackageErrorArr = this.state.productPackageErrorArr;
    let returnState = {};
    let tmpInventoryPackage = defaultPackage();
    //tmpInventoryPackage.inventoryClinic = this.state.clinics[0].id
    productPackageArr.push(tmpInventoryPackage);
    productPackageErrorArr.push(defaultErrorPackage());
    this.setState({ productPackageArr: productPackageArr, productPackageErrorArr: productPackageErrorArr });
  }

  removeCurrentProduct = (id) => {
    const productPackageArr = this.state.productPackageArr;
    const productPackageErrorArr = this.state.productPackageErrorArr;
    if (productPackageArr.length == 1) { return false }
    let servicepackageindex = id;
    productPackageArr.splice(servicepackageindex, 1);
    productPackageErrorArr.splice(servicepackageindex, 1);

    const state = this.state
    for (var idx in state) {
    if (idx.includes("product_name_focus_")) {
        this.setState({[idx] : false})
      }
    }


    this.setState({ productPackageArr: productPackageArr, productPackageErrorArr: productPackageErrorArr });
  }

  handleSubmit = () => {

    this.setState({ nameError: false, typeError: false, discount_percentageError: false, discount_dollarsError: false, active_untillError: false, active_fromError: false, discount_group_idError: false, package_product_priceError: false, package_price_for_membersError: false, current_offer_daysError: false, discount_group_idError: false, package_product_quantityError: false, bogo_productError: false, bogo_product_quantityError: false, bogo_buy_product_valueError: false, bogo_free_product_quantityError: false, bogo_free_product_valueError: false, package_bogo_priceError: false, discount_package_locationError: false, discount_package_providerError: false, bogo_product_idError: false, discount_group_idError: false, bogo_discount_percentageError: false });

    if (this.state.name.trim() == '') {
      this.setState({ nameError: true });
      return false
    }
    if (this.state.type == 'percentage') {
      if (this.state.discount_percentage == '' || !isPositiveNumber(this.state.discount_percentage)) {
        this.setState({ discount_percentageError: true });
        return false
      }

    } else if (this.state.type == 'dollars') {
      if (this.state.discount_dollars == '' || !isPositiveNumber(this.state.discount_dollars)) {
        this.setState({ discount_dollarsError: true });
        return false
      }
    } else if (this.state.type == 'package') {
      let dollarSum = 0;
      if (this.state.package_buy_type == 'product') {
        let productPackageErrorArr = this.state.productPackageErrorArr;
        this.state.productPackageArr.map((obj, idx) => {
          productPackageErrorArr[idx].product_name = false;
          productPackageErrorArr[idx].units = false;
          productPackageErrorArr[idx].dollar_value = false;
        })
        let error = false;

        this.state.productPackageArr.map((obj, idx) => {
          if (obj.product_id == '') {
            productPackageErrorArr[idx].product_name = true;
            error = true;
          }
          if (obj.units == '' || !isPositiveNumber(obj.units, 1)) {
            productPackageErrorArr[idx].units = true;
            error = true;
          }
          if (obj.dollar_value == '' || !isPositiveNumber(obj.dollar_value)) {
            productPackageErrorArr[idx].dollar_value = true;
            error = true;
          } else {
            dollarSum += parseFloat(obj.dollar_value)
          }
        })
        if (error) {
          this.setState({ productPackageErrorArr: productPackageErrorArr });
          return false;
        }
      } else {
        if (this.state.discount_group_id == 0) {
          this.setState({ discount_group_idError: true });
          return false;
        }
        if (this.state.package_product_quantity == '' || !isPositiveNumber(this.state.package_product_quantity, 1)) {
          this.setState({ package_product_quantityError: true });
          return false;
        }
      }

      if (this.state.package_product_price == '' || !isPositiveNumber(this.state.package_product_price)) {
        this.setState({ package_product_priceError: true });
        return false;
      } else {
        if (this.state.package_buy_type == 'product' && parseFloat(dollarSum) !== parseFloat(this.state.package_product_price)) {
          toast.error(this.state.inventoryLang.inventory_msg)
          this.setState({ package_product_priceError: true });
          return false;
        }
      }

      if(this.state.customer_type === 'all'){
        if (this.state.package_price_for_members != undefined && this.state.package_price_for_members != null && this.state.package_price_for_members != '' && !isPositiveNumber(this.state.package_price_for_members)) {
          this.setState({ package_price_for_membersError: true });
          return false;
        }
      }
      /*if(this.state.package_price_for_members == '' || !isNumber(this.state.package_price_for_members)) {
        this.setState({package_price_for_membersError: true});
        return false;
      }*/

    } else if (this.state.type == 'bogo') {
      let dollarSum = 0;
      if (this.state.bogo_product_id == '') {
        this.setState({ bogo_productError: true });
        return false;
      }
      if (this.state.bogo_product_quantity == '' || !isPositiveNumber(this.state.bogo_product_quantity, 1)) {
        this.setState({ bogo_product_quantityError: true });
        return false;
      }
      if (this.state.bogo_buy_product_value == '' || !isPositiveNumber(this.state.bogo_buy_product_value)) {
        this.setState({ bogo_buy_product_valueError: true });
        return false;
      } else {
        dollarSum += parseFloat(this.state.bogo_buy_product_value);
      }

      if (this.state.bogo_free_product_id == '') {
        this.setState({ bogo_free_productError: true });
        return false;
      }
      if (this.state.bogo_free_product_quantity == '' || !isPositiveNumber(this.state.bogo_free_product_quantity, 1)) {
        this.setState({ bogo_free_product_quantityError: true });
        return false;
      }
      if (this.state.bogo_free_product_value == '' || !isPositiveNumber(this.state.bogo_free_product_value)) {
        this.setState({ bogo_free_product_valueError: true });
        return false;
      } else {
        dollarSum += parseFloat(this.state.bogo_free_product_value);
      }
      if (this.state.package_bogo_price == '' || !isPositiveNumber(this.state.package_bogo_price)) {
        this.setState({ package_bogo_priceError: true });
        return false;
      } else {
        if (parseFloat(dollarSum) !== parseFloat(this.state.package_bogo_price)) {
          toast.error(this.state.inventoryLang.inventory_bogo_msg)
          this.setState({ package_bogo_priceError: true });
          return false;
        }
      }


    } else if (this.state.type == 'group') {
      if (this.state.bogo_product_id == 0) {
        this.setState({ bogo_product_idError: true });
        return false;
      }
      if (this.state.bogo_product_quantity == '' || !isPositiveNumber(this.state.bogo_product_quantity, 1)) {
        this.setState({ bogo_product_quantityError: true });
        return false;
      }
      if (this.state.bogo_free_product_id == 0) {
        this.setState({ bogo_free_product_idError: true });
        return false;
      }
      if (this.state.discount_type == "percentage") {
        if (this.state.bogo_discount_percentage == '' || !isPositiveNumber(this.state.bogo_discount_percentage)) {
          this.setState({ bogo_discount_percentageError: true });
          return false;
        }
      }
      if (this.state.bogo_free_product_quantity == '' || !isPositiveNumber(this.state.bogo_free_product_quantity, 1)) {
        this.setState({ bogo_free_product_quantityError: true });
        return false;
      }
    }


    if (!moment(this.state.active_from).isBefore(this.state.active_untill)) {
      this.setState({ active_fromError: true, active_untillError: true })
      return false;
    }

    if (this.state.is_in_current_offers) {
      if ((this.state.current_offer_days == '' || !isPositiveNumber(this.state.current_offer_days, 1, 100))) {
        this.setState({ current_offer_daysError: true })
        return false;
      } else {
        if (parseInt(this.state.current_offer_days) > 100) {
          this.setState({ current_offer_daysError: true })
          return false;
        }
      }
    }

    if (this.state.all_locations) {
      if (this.state.discount_package_location.length == 0) {
        this.setState({ discount_package_locationError: true })
        return false;
      }
    }
    if (this.state.all_providers) {
      if (this.state.discount_package_provider.length == 0) {
        this.setState({ discount_package_providerError: true })
        return false;
      }
    }

    /////////////////////////////////////commented for custom tax //////////////////////////////////
    if (this.state.is_tax_enabled) {
      let errorState = {},
        errorFlag = false;
      for (let x in this.state) {
        if (x.startsWith('clinicTax-')) {
          let id = x.split('-')[1]
          if (this.state[x] === '' || this.state[x] === undefined || this.state[x] === null || !isPositiveNumber(this.state[x])) {
            errorState["clinicTaxError-" + id] = true;
            errorFlag = true;
          } else {
            errorState["clinicTaxError-" + id] = false;
          }
        }
      }
      this.setState(errorState);
      if (errorFlag) {
        return false;
      }
    }

    let formData = {};
    formData.packageId = this.state.packageId;
    formData.status = (this.state.packageId) ? this.state.status : 0;
    formData.name = this.state.name;
    formData.type = this.state.type;
    formData.customer_type = this.state.customer_type;
    formData.active_from = apiDateFormat(this.state.active_from);
    formData.active_untill = apiDateFormat(this.state.active_untill);
    formData.keywords = (this.state.keywords.length) ? this.state.keywords.join(',') : "";
    if (this.state.is_in_current_offers) {
      formData.current_offer_days = this.state.current_offer_days;
      formData.is_in_current_offers = this.state.is_in_current_offers;
      formData.current_offer_valid_till = apiDateFormat(moment().add('days', parseInt(this.state.current_offer_days)));
    }

    if (this.state.type == "percentage") {
      formData.discount_percentage = this.state.discount_percentage;
    } else if (this.state.type == "dollars") {
      formData.discount_dollars = this.state.discount_dollars;
    } else if (this.state.type == "package") {
      formData.package_buy_type = this.state.package_buy_type;
      formData.package_product_price = this.state.package_product_price;

      if (this.state.package_price_for_members === null || this.state.package_price_for_members === '' || this.state.package_price_for_members === undefined) {
        formData.package_price_for_members = this.state.package_product_price
      } else {
        formData.package_price_for_members = this.state.package_price_for_members
      }

      if (this.state.customer_type === 'member') {
        formData.package_price_for_members = this.state.package_product_price
        /*
        if (this.state.package_price_for_members === undefined || this.state.package_price_for_members === null || this.state.package_price_for_members === '') {
          formData.package_price_for_members = 0.00
        }
        */
      }

      if (this.state.package_buy_type == 'product') {
        if (this.state.productPackageArr.length) {
          formData.products = this.state.productPackageArr;
        }
      } else {
        formData.discount_group_id = this.state.discount_group_id;
        formData.package_product_quantity = this.state.package_product_quantity;
      }
    } else if (this.state.type == "bogo") {
      formData.bogo_offer_product_id = this.state.bogo_product_id;
      formData.bogo_offer_product_quantity = this.state.bogo_product_quantity;
      formData.bogo_buy_product_value = this.state.bogo_buy_product_value;
      formData.bogo_offer_free_product_id = this.state.bogo_free_product_id;
      formData.bogo_offer_free_product_quantity = this.state.bogo_free_product_quantity;
      formData.bogo_free_product_value = this.state.bogo_free_product_value;
      formData.package_bogo_price = this.state.package_bogo_price;
    } else if (this.state.type == "group") {
      formData.bogo_product_id = this.state.bogo_product_id;
      formData.bogo_product_quantity = this.state.bogo_product_quantity;
      formData.bogo_free_product_id = this.state.bogo_free_product_id;
      formData.bogo_free_product_quantity = this.state.bogo_free_product_quantity;
      formData.package_bogo_price = this.state.package_bogo_price;
      if (this.state.bogo_discount_percentage) {
        formData.bogo_discount_percentage = (this.state.bogo_discount_percentage) ? this.state.bogo_discount_percentage : "";
      }

    }

    if (this.state.all_locations) {
      let discount_package_location = []
      this.state.discount_package_location.map((obj, idx) => {
        discount_package_location.push(obj.value);
      })
      formData.clinics = discount_package_location;
    }
    if (this.state.all_providers) {
      let discount_package_provider = []
      this.state.discount_package_provider.map((obj, idx) => {
        discount_package_provider.push(obj.value);
      })
      formData.providers = discount_package_provider;
    }
    if (this.state.is_tax_enabled) {
      let clinic_tax = []
      this.state.clinics.map((obj, idx) => {
        clinic_tax.push({ clinic_id: obj.id, tax: this.state['clinicTax-' + obj.id] });
      })
      formData.clinic_tax = clinic_tax;
    }
    formData.all_providers = (this.state.all_providers) ? 1 : 0;
    formData.all_locations = (this.state.all_locations) ? 1 : 0;
    formData.is_tax_enabled = (this.state.is_tax_enabled) ? 1 : 0;
    this.showLoaderFunc();

    this.props.saveDiscountPackage(formData);
  }

  deleteDiscountPackage = () => {
    this.setState({ showModal: false })
    if (this.state.packageId > 0) {
      this.setState({ showLoader: true })
      this.props.deleteDiscountPackage(this.state.packageId);
    }
  }
  activateDiscountPackage= () => {
    if (this.state.packageId > 0) {
      this.setState({ showLoader: true })
      this.props.activateDiscountPackage(this.state.packageId);
    }
  }

  render() {
    var options = [];
    var defaultOptions = [];
    if (this.state.clinics != undefined && this.state.clinics.length > 0) {
      options = this.state.clinics.map((obj, idx) => {
        return { value: obj.id, label: obj.clinic_name }
      })
    }

    var providerOptions = [];
    if (this.state.providers != undefined && this.state.providers.length > 0) {
      providerOptions = this.state.providers.map((obj, idx) => {
        return { value: obj.id, label: displayName(obj) }
      })
    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader activeMenuTag={'discount-packages'} />
          <div className="juvly-section full-width">
            <div className="juvly-container">
              <div className="juvly-title m-b-40">{(this.state.packageId > 0) ? 'Edit Discounts' : this.state.inventoryLang.inventory_add_discounts}
                <Link className="pull-right crossIcon" to="/inventory/discount-packages"><img src="/images/close.png" /></Link>
              </div>
              <div className="row">
                <div className="col-xs-12">
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_Discount_Name}<span className="setting-require">*</span></div>
                        <input className={(this.state.nameError) ? "field-error setting-input-box" : "setting-input-box"} type="text" name="name" onChange={this.handleInputChange} autoComplete="off" value={this.state.name} />
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_discount_type}<span className="setting-require">*</span></div>
                        <div className="pull-left m-t-5">
                          <input id="package-type-percentage" type="radio" checked={(this.state.type == 'percentage') ? "checked" : false} name="type" value="percentage" className="basic-form-checkbox" onChange={this.handleInputChange} />
                          <label htmlFor="package-type-percentage" className="basic-form-text">% {this.state.inventoryLang.inventory_percentageLBL}</label>
                        </div>
                        <div className="pull-left m-t-5">
                          <input id="package-type-dollars" type="radio" checked={(this.state.type == 'dollars') ? "checked" : false} name="type" value="dollars" className="basic-form-checkbox" onChange={this.handleInputChange} />
                          <label htmlFor="package-type-dollars" className="basic-form-text">{getCurrencySymbol()} {this.state.inventoryLang.inventory_figure}</label>
                        </div>
                        <div className="pull-left m-t-5">
                          <input id="package-type-package" type="radio" checked={(this.state.type == 'package') ? "checked" : false} name="type" value="package" className="basic-form-checkbox" onChange={this.handleInputChange} />
                          <label htmlFor="package-type-package" className="basic-form-text">{this.state.inventoryLang.inventory_package_v2}</label>
                        </div>
                        <div className="pull-left m-t-5">
                          <input id="package-type-bogo" type="radio" checked={(this.state.type == 'bogo') ? "checked" : false} name="type" value="bogo" className="basic-form-checkbox" onChange={this.handleInputChange} />
                          <label htmlFor="package-type-bogo" className="basic-form-text">{this.state.inventoryLang.inventory_bogo_offers}</label>
                        </div>
                        <div className="pull-left m-t-5">
                          <input id="package-type-group" type="radio" checked={(this.state.type == 'group') ? "checked" : false} name="type" value="group" className="basic-form-checkbox" onChange={this.handleInputChange} />
                          <label htmlFor="package-type-group" className="basic-form-text">{this.state.inventoryLang.inventory_bogo_discount_group}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className={(this.state.type == "percentage") ? "col-xs-12" : "col-xs-12 no-display"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_discount_percantage}<span className="setting-require">*</span></div>
                        <input className={(this.state.discount_percentageError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="discount_percentage" onChange={this.handleInputChange} autoComplete="off" value={this.state.discount_percentage} />
                      </div>
                    </div>
                    <div className={(this.state.type == "dollars") ? "col-xs-12" : "col-xs-12 no-display"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_discount_amounts}<span className="setting-require">*</span></div>
                        <input className={(this.state.discount_dollarsError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="discount_dollars" onChange={this.handleInputChange} autoComplete="off" value={this.state.discount_dollars} />
                      </div>
                    </div>
                  </div>
                  <div className={(this.state.type == "package") ? "row m-t-20" : "row m-t-20 no-display"}>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_package_type}<span className="setting-require">*</span></div>
                        <select className="setting-select-box" name="package_buy_type" onChange={this.handleInputChange} value={this.state.package_buy_type} >
                          <option value="product">{this.state.inventoryLang.inventory_productLBL}</option>
                          <option value="group">{this.state.inventoryLang.inventory_groupLBL}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className={(this.state.type == "bogo") ? "row relative" : "row relative no-display"}>
                    <div className="col-md-6 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_buy_product}<span className="setting-require">*</span></div>
                        <div className="bogo_product_container" ref={(ref_bogo_product_container) => this.ref_bogo_product_container = ref_bogo_product_container} >
                          <input className={(this.state.bogo_productError) ? "setting-input-box field-error" : "setting-input-box"}
                            name="bogo_product" value={this.state.bogo_product}
                            autoComplete="off"
                            onChange={this.handleProductChange.bind(this, 'bogo_product')}
                            //onBlur={this.handleOnBlur.bind(this, 'bogo_product_focus')}
                            onFocus={this.handleOnFocus.bind(this, 'bogo_product_focus')}
                            type="text" />
                          <ul className={((this.state.bogo_product_focus !== undefined && this.state.bogo_product_focus === true && this.state.bogo_product.length > 2) && this.state.showBogoProducts) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"}>
                            {(this.state.bogoProductList.length > 0) ? this.state.bogoProductList.map((obj, idx) => {
                              return (
                                <li key={"bogo_product-" + idx} data-id={obj.id} data-mode={"bogo_product"} data-pname={obj.product_name} onClick={this.selectProduct}>
                                  <a >
                                    {obj && obj.product_name}
                                  </a>
                                </li>
                              )
                            })
                              :
                              <li key={"bogo_product-norecord"} data-id={0} data-mode={"bogo_product"} data-pname={'product_match_not_found'} data-index={-1}>
                                <a >
                                  {this.state.globalLang.product_match_not_found}
                                </a>
                              </li>
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_quality}<span className="setting-require">*</span></div>
                        <input className={(this.state.bogo_product_quantityError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="bogo_product_quantity" onChange={this.handleInputChange} autoComplete="off" value={this.state.bogo_product_quantity} placeholder="Unit" />
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_dollar_value}<span className="setting-require">*</span></div>
                        <input className={(this.state.bogo_buy_product_valueError) ? "setting-input-box field-error" : "setting-input-box"} type="text" placeholder="Value" name="bogo_buy_product_value" onChange={this.handleInputChange} autoComplete="off" value={this.state.bogo_buy_product_value} />
                      </div>
                    </div>
                  </div>
                  <div className={(this.state.type == "bogo") ? "row relative" : "row relative no-display"}>
                    <div className="col-md-6 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_free_product}<span className="setting-require">*</span></div>
                        <div className="bogo_free_product_container" ref={(ref_bogo_free_product_container) => this.ref_bogo_free_product_container = ref_bogo_free_product_container} >
                          <input
                            className={(this.state.bogo_free_productError) ? "setting-input-box field-error" : "setting-input-box"}
                            name="bogo_free_product"
                            value={this.state.bogo_free_product}
                            autoComplete="off"
                            onChange={this.handleProductChange.bind(this, 'bogo_free_product')}
                            //onBlur={this.handleOnBlur.bind(this, 'bogo_free_product_focus')}
                            onFocus={this.handleOnFocus.bind(this, 'bogo_free_product_focus')}
                            type="text"
                          />
                          <ul className={((this.state.bogo_free_product_focus !== undefined && this.state.bogo_free_product_focus === true && this.state.bogo_free_product.length > 2) && this.state.showBogoFreeProducts) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"}>
                            {(this.state.bogoFreeProductList.length > 0) ? this.state.bogoFreeProductList.map((obj, idx) => {
                              return (
                                <li key={"bogo_free_product-" + idx} data-id={obj.id} data-mode={"bogo_free_product"} data-pname={obj.product_name} onClick={this.selectProduct}>
                                  <a >
                                    {obj && obj.product_name}
                                  </a>
                                </li>
                              )
                            })
                              :
                              <li key={"bogo_free_product-norecord"} data-id={0} data-mode={"bogo_free_product"} data-pname={'product_match_not_found'} data-index={-1}>
                                <a >
                                  {this.state.globalLang.product_match_not_found}
                                </a>
                              </li>
                            }
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_quality}<span className="setting-require">*</span></div>
                        <input className={(this.state.bogo_free_product_quantityError) ? "setting-input-box field-error" : "setting-input-box"} type="text" placeholder="Unit" name="bogo_free_product_quantity" onChange={this.handleInputChange} autoComplete="off" value={this.state.bogo_free_product_quantity} />
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_dollar_value}<span className="setting-require">*</span></div>
                        <input className={(this.state.bogo_free_product_valueError) ? "setting-input-box field-error" : "setting-input-box"} type="text" placeholder="Value" name="bogo_free_product_value" onChange={this.handleInputChange} autoComplete="off" value={this.state.bogo_free_product_value} />
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_bogo_price}<span className="setting-require">*</span></div>
                        <input className={(this.state.package_bogo_priceError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="package_bogo_price" onChange={this.handleInputChange} autoComplete="off" value={this.state.package_bogo_price} />
                      </div>
                    </div>
                  </div>

                  {this.state.package_buy_type == 'product' && this.state.productPackageArr.map((obj, idx) => {
                    return (
                      <div key={'productPackageArr-' + idx} className={(this.state.type == "package") ? "row relative" : "row relative no-display"}>
                        <div className="col-md-6 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_type_initials_of_product}<span className="setting-require">*</span></div>
                            <div className="product_name_container" data-package-index={idx} data-ref-container={'product_name_container'} ref={(ref_product_name_container) => this.ref_product_name_container = ref_product_name_container} >
                              <input
                                className={(this.state["productPackageErrorArr"][idx] && this.state["productPackageErrorArr"][idx].product_name) ? "setting-input-box field-error" : "setting-input-box"}
                                name={"product_name"} value={obj.product_name}
                                onChange={this.handleProductChange.bind(this, 'package')}
                                //onBlur={this.handleOnBlur.bind(this, 'product_name_focus')}
                                onFocus={this.handleOnFocus.bind(this, 'product_name_focus', idx)}
                                type="text"
                                autoComplete="off"
                                data-packageindex={idx}
                              />
                              <ul className={((this.state['product_name_focus_' + idx] !== undefined && this.state['product_name_focus_' + idx] === true && obj.product_name.length > 2) && this.state["showPackageProducts-" + idx]) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"}>
                                {(this.state.packageProductList.length > 0) ?
                                  this.state.packageProductList.map((objInner, idxInner) => {
                                    return (
                                      <li key={"product_name-" + idx + "-" + idxInner} data-id={objInner.id} data-mode={"package"} data-pname={objInner.product_name} data-index={idx} onClick={this.selectProductPackage}>
                                        <a >
                                          {objInner && objInner.product_name}
                                        </a>
                                      </li>
                                    )
                                  })
                                  :
                                  <li key={"packageProduct-norecord"} data-id={0} data-mode={"package"} data-pname={'product_match_not_found'} data-index={-1}>
                                    <a >
                                      {this.state.globalLang.product_match_not_found}
                                    </a>
                                  </li>
                                }
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_select_quality}<span className="setting-require">*</span></div>
                            <input className={(this.state["productPackageErrorArr"][idx] && this.state["productPackageErrorArr"][idx].units) ? "setting-input-box field-error" : "setting-input-box"} type="text" placeholder="Unit" data-packageindex={idx} name="units" onChange={this.handleInputChange} autoComplete="off" value={obj.units} />
                          </div>
                        </div>
                        <div className="col-md-3 col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_dollar_value}<span className="setting-require">*</span></div>
                            <input className={(this.state["productPackageErrorArr"][idx] && this.state["productPackageErrorArr"][idx].dollar_value) ? "setting-input-box field-error" : "setting-input-box"} type="text" placeholder="Value" data-packageindex={idx} name="dollar_value" onChange={this.handleInputChange} autoComplete="off" value={obj.dollar_value} />
                          </div>
                        </div>
                        <a className={(idx == 0) ? "add-round-btn " : "add-round-btn no-display"} onClick={this.addMoreProduct} ><span>+</span></a>
                        <a className={(idx > 0) ? "add-round-btn " : "add-round-btn no-display"} onClick={this.removeCurrentProduct.bind(this, idx)} ><span>-</span></a>
                      </div>
                    )
                  })
                  }
                  {this.state.package_buy_type == 'group' &&
                    <div className={(this.state.type == "package") ? "row relative" : "row relative no-display"}>
                      <div className="col-md-6 col-sm-4 col-xs-12">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_group}<span className="setting-require">*</span></div>
                        <select className={(this.state.discount_group_idError) ? "setting-select-box field-error" : "setting-select-box"} name="discount_group_id" onChange={this.handleInputChange} value={this.state.discount_group_id} >
                          <option value={0}>{this.state.inventoryLang.inventory_select}</option>
                          {this.state.groups.length && this.state.groups.map((obj, idx) => {
                            return (
                              <option value={obj.id} key={"discount_group_id-" + idx}>{obj.name}</option>
                            )
                          })}
                        </select>
                      </div>
                      <div className="col-md-6 col-sm-4 col-xs-12">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.inventoryLang.inventory_select_quality}<span className="setting-require">*</span></div>
                          <input className={(this.state.package_product_quantityError) ? "setting-input-box field-error" : "setting-input-box"} type="text" placeholder="Unit" name="package_product_quantity" onChange={this.handleInputChange} autoComplete="off" value={this.state.package_product_quantity} />
                        </div>
                      </div>
                    </div>
                  }
                  <div className={(this.state.type == "group") ? "row relative" : "row relative no-display"}>
                    <div className="col-md-6 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_group_t}<span className="setting-require">*</span></div>
                        <select className={(this.state.bogo_product_idError) ? "setting-select-box field-error" : "setting-select-box"} name="bogo_product_id" onChange={this.handleInputChange} value={this.state.bogo_product_id} >
                          <option value={0}>{this.state.inventoryLang.inventory_select}</option>
                          {this.state.groups.length && this.state.groups.map((obj, idx) => {
                            return (
                              <option value={obj.id} key={"group_id-" + idx}>{obj.name}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_units}<span className="setting-require">*</span></div>
                        <input className={(this.state.bogo_product_quantityError) ? "setting-input-box field-error" : "setting-input-box"} type="text" placeholder="Unit" name="bogo_product_quantity" onChange={this.handleInputChange} autoComplete="off" value={this.state.bogo_product_quantity} />
                      </div>
                    </div>
                  </div>
                  <div className={(this.state.type == "group") ? "row relative" : "row relative no-display"}>
                    <div className="col-md-6 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_group_for}<span className="setting-require">*</span></div>
                        <select className={(this.state.bogo_free_product_idError) ? "setting-select-box field-error" : "setting-select-box"} name="bogo_free_product_id" onChange={this.handleInputChange} value={this.state.bogo_free_product_id} >
                          <option value={0}>{this.state.inventoryLang.inventory_select}</option>
                          {this.state.groups.length && this.state.groups.map((obj, idx) => {
                            return (
                              <option value={obj.id} key={"discount_group_id-" + idx}>{obj.name}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_discount_type}<span className="setting-require">*</span></div>
                        <select className="setting-select-box" name="discount_type" onChange={this.handleInputChange} value={this.state.discount_type} >
                          <option value="free">{this.state.inventoryLang.inventory_Free}</option>
                          <option value="percentage">% {this.state.inventoryLang.inventory_off_lbl}</option>
                        </select>
                      </div>
                    </div>
                    <div className={(this.state.discount_type == 'percentage') ? "col-md-2 col-sm-4 col-xs-12" : "no-display col-md-2 col-sm-4 col-xs-12"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_percentageLBL}<span className="setting-require">*</span></div>
                        <input className={(this.state.bogo_discount_percentageError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="bogo_discount_percentage" onChange={this.handleInputChange} value={this.state.bogo_discount_percentage} autoComplete="off" placeholder="Value" />
                      </div>
                    </div>
                    <div className="col-md-2 col-sm-4 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_units}<span className="setting-require">*</span></div>
                        <input className={(this.state.bogo_free_product_quantityError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="bogo_free_product_quantity" onChange={this.handleInputChange} value={this.state.bogo_free_product_quantity} autoComplete="off" placeholder="Value" />
                      </div>
                    </div>
                  </div>
                  <div className={(this.state.type == "package") ? "row m-t-30" : "row m-t-30 no-display"}>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_package_price}<span className="setting-require">*</span></div>
                        <input className={(this.state.package_product_priceError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="package_product_price" onChange={this.handleInputChange} value={this.state.package_product_price} autoComplete="off" />
                      </div>
                    </div>
                    <div className={(this.state.customer_type == 'member') ? "col-md-3 col-sm-6 col-xs-12 no-display" : "col-md-3 col-sm-6 col-xs-12"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{'Member Price for Single Tier Membership'}</div>
                        <input className={(this.state.package_price_for_membersError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="package_price_for_members" onChange={this.handleInputChange} value={this.state.package_price_for_members} autoComplete="off" />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_Available_for_purchase_on}<span className="setting-require">*</span><a href="javascript:void(0);" className="help-icon-form" title={this.state.inventoryLang.inventory_package_Available_for_purchase_on_tootip}>?</a></div>
                        <div className="setting-input-outer">
                          <DatePicker
                            //value={(this.state.active_from) ? this.state.active_from : null}
                            onChange={this.handleSearchDatePicker.bind(this, 'active_from')}
                            className={((this.state.active_fromError) ? "setting-input-box field-error" : "setting-input-box") ? "setting-input-box" : "setting-field-outer no-display"}
                            name={"active_from"}
                            selected={(this.state.active_from) ? this.state.active_from : null}
                            autoComplete="off"
                            minDate={moment().toDate()}
                            maxDate={new Date(moment().add(10, 'years'))}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            dateFormat={dateFormatPicker()}
                            placeholderText={dateFormatPicker().toLowerCase()}
                            ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_Available_for_purchase_until} <span className="setting-require">*</span><a href="javascript:void(0);" className="help-icon-form" title={this.state.inventoryLang.inventory_package_Available_for_purchase_until_tootip}>?</a></div>
                        <div className="setting-input-outer">
                          <DatePicker
                            //value={(this.state.active_untill) ? this.state.active_untill : null}
                            onChange={this.handleSearchDatePicker.bind(this, 'active_untill')}
                            className={((this.state.active_untillError) ? "setting-input-box field-error" : "setting-input-box") ? "setting-input-box" : "setting-field-outer no-display"}
                            name={"active_untill"}
                            selected={(this.state.active_untill) ? this.state.active_untill : null}
                            minDate={(this.state.active_untill_min_date) ? this.state.active_untill_min_date : new Date()}
                            maxDate={new Date(moment().add(10, 'years'))}
                            autoComplete="off"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            dateFormat={dateFormatPicker()}
                            placeholderText={dateFormatPicker().toLowerCase()}
                            ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_keywords}</div>
                        <div className="setting-input-box">
                          <TagsInput value={(this.state.keywords) ? this.state.keywords : []} onChange={this.handleTagChange} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row m-t-30">
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_available_to_customers}<span className="setting-require">*</span></div>
                        <div className="pull-left m-t-5">
                          <input type="radio" checked={(this.state.customer_type == 'all') ? "checked" : false} name="customer_type" onChange={this.handleInputChange} id="UserIsDashboardEnabled0" className="basic-form-checkbox" value="all" />
                          <label htmlFor="UserIsDashboardEnabled0" className="basic-form-text">{this.state.inventoryLang.inventory_all}</label>
                          <input type="radio" id="UserIsDashboardEnabled1" checked={(this.state.customer_type == 'member') ? "checked" : false} name="customer_type" onChange={this.handleInputChange} name="customer_type" value="member" className="basic-form-checkbox" />
                          <label htmlFor="UserIsDashboardEnabled1" className="basic-form-text">{this.state.inventoryLang.inventory_members_only}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3 col-sm-6 col-xs-12">
                      <p className="m-b-20">
                        <input type="checkbox" id="curnt-offer" className="new-check" name="is_in_current_offers" onChange={this.handleInputChange} checked={(this.state.is_in_current_offers) ? "checked" : false} />
                        <label htmlFor="curnt-offer">{this.state.inventoryLang.inventory_mark_as_cureent}:</label></p>
                      <div className={(this.state.is_in_current_offers) ? "setting-field-outer" : "setting-field-outer no-display"}>
                        <div className="new-field-label">{this.state.inventoryLang.inventory_offer_expire}<span className="setting-require">*</span></div>
                        <input className={(this.state.current_offer_daysError) ? "setting-input-box field-error" : "setting-input-box"} type="text" placeholder="Days" name="current_offer_days" onChange={this.handleInputChange} value={this.state.current_offer_days} autoComplete="off" />
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <p className="m-b-20"><input type="checkbox" className="new-check" name="all_locations" onChange={this.handleInputChange} checked={(this.state.all_locations) ? "checked" : false} /><label htmlFor="Available-location">{this.state.inventoryLang.inventory_available_at_selected}:</label></p>
                      <div className={(this.state.all_locations) ? ((this.state.discount_package_locationError) ? "setting-field-outer field-error" : "setting-field-outer") : "setting-field-outer no-display"}>
                        <div className="new-field-label">{this.state.inventoryLang.inventory_select_locations} : <span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <div className="tag-auto-select">
                            {
                              options && <Select
                                onChange={this.handleChange}

                                value={this.state.discount_package_location}
                                isClearable
                                isSearchable
                                options={options}
                                isMulti={true}
                              />
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <p className="m-b-20"><input type="checkbox" className="new-check" name="all_providers" onChange={this.handleInputChange} checked={(this.state.all_providers) ? "checked" : false} /><label htmlFor="Available-provider">{this.state.inventoryLang.inventory_available_only_with}:</label></p>
                      <div className={(this.state.all_providers) ? ((this.state.discount_package_providerError) ? "setting-field-outer field-error" : "setting-field-outer") : "setting-field-outer no-display"}>
                        <div className="new-field-label">{this.state.inventoryLang.inventory_selected_providers}<span className="setting-require">*</span></div>
                        <div className="setting-input-outer">
                          <div className="tag-auto-select">
                            {
                              providerOptions && <Select
                                onChange={this.handleProviderChange}

                                value={this.state.discount_package_provider}
                                isClearable
                                isSearchable
                                options={providerOptions}
                                isMulti={true}
                              />
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {<div className={(this.state.type == "package" || this.state.type == "group" || this.state.type == "bogo") ? "switch-accordian-outer" : "switch-accordian-outer no-display"}>
              <div className="switch-accordian-row " id="book">
                {this.state.inventoryLang.inventory_custom_tax_rule}
                 <label className="setting-switch pull-right">
                  <input type="checkbox" id="app_booking" name="is_tax_enabled" onChange={this.handleInputChange} checked={(this.state.is_tax_enabled) ? "checked" : false} className="setting-custom-switch-input" />
                  <span className="setting-slider"></span>
                </label>
              </div>
              <div className={(this.state.is_tax_enabled) ? "setting-container" : "setting-container  no-display"} id="Appointment_Booking-form-title">
                <div className="row">
                  {this.state.clinics.length && this.state.clinics.map((obj, idx) => {
                    return (
                      <div className="col-sm-3 col-xs-12" key={"clinicTax-" + idx}>
                        <div className="setting-field-outer">
                          <div className="new-field-label">{obj.clinic_name}<span className="setting-require">*</span></div>
                          <input className={(this.state["clinicTaxError-" + obj.id]) ? "setting-input-box field-error" : "setting-input-box"} type="text" name={"clinicTax-" + obj.id} onChange={this.handleInputChange} value={this.state["clinicTax-" + obj.id]} />
                        </div>
                      </div>
                    )
                  })
                  }
                </div>
              </div>
            </div>}
            <div className="footer-static">
              { (this.state.status == 0) &&
                <button className="new-blue-btn pull-right" id="saveform" onClick={this.handleSubmit}>{this.state.inventoryLang.inventory_save}</button>
              }
              {(this.state.packageId > 0 && this.state.status == 1) &&
                <button className="new-blue-btn pull-right" id="saveform" onClick={this.activateDiscountPackage}>{this.state.globalLang.label_activate}</button>
              }
              { (this.state.status == 0) &&
                <Link to="/inventory/discount-packages" className="new-white-btn pull-right" id="resetform">{this.state.inventoryLang.inventory_Cancel}</Link>
              }

              {(this.state.packageId > 0 && this.state.status == 0) &&
                <button className="new-red-btn pull-left" onClick={() => {
                  this.setState({ showModal: true })
                }}>{this.state.inventoryLang.inventory_delete}</button>
              }
              <div className={(this.state.showModal ? 'overlay' : '')}></div>
              <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" onClick={() => {
                        this.setState({ showModal: false })
                      }}>×</button>
                      <h4 className="modal-title" id="model_title">{this.state.inventoryLang.inventory_Confirmation_required}{this.state.showModal}</h4>
                    </div>
                    <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                      {this.state.inventoryLang.inventory_delete_discount_package_msg}
                    </div>
                    <div className="modal-footer" >
                      <div className="col-md-12 text-left" id="footer-btn">
                        <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={() => {
                          this.setState({ showModal: false })
                        }}>{this.state.inventoryLang.inventory_No}</button>
                        <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteDiscountPackage}>{this.state.inventoryLang.inventory_Yes}</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock' : 'new-loader text-left'}>
              <div className="loader-outer">
                <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
                <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  toast.dismiss();
  localStorage.setItem("showLoader", false);

  if (state.InventoryReducer.action === "DEFAULT_PACKAGE_DATA") {
    if (state.InventoryReducer.data.status != 200) {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.packageDefaultData = state.InventoryReducer.data.data;
    }
  }
  if (state.InventoryReducer.action === "BOGO_FREE_PRODUCT_LIST") {
    if (state.InventoryReducer.data.status != 200) {
      //toast.error(languageData.global[state.InventoryReducer.data.message]);
      //returnState.showLoader = false
      returnState.bogoFreeProductList = {
        products: []
      }
    } else {
      returnState.bogoFreeProductList = state.InventoryReducer.data.data;
    }
  }
  if (state.InventoryReducer.action === "BOGO_PRODUCT_LIST") {
    if (state.InventoryReducer.data.status != 200) {
      //toast.error(languageData.global[state.InventoryReducer.data.message]);
      //returnState.showLoader = false
      returnState.bogoProductList = {
        products: []
      }
    } else {
      returnState.bogoProductList = state.InventoryReducer.data.data;
    }
  }
  if (state.InventoryReducer.action === "PACKAGE_PRODUCT_LIST") {
    if (state.InventoryReducer.data.status != 200) {
      //toast.error(languageData.global[state.InventoryReducer.data.message]);
      //returnState.showLoader = false
      returnState.packageProductList = {
        products: []
      }
    } else {
      returnState.packageProductList = state.InventoryReducer.data.data;
    }
  }
  if (state.InventoryReducer.action === "SAVE_PACKAGE_DATA") {
    if (state.InventoryReducer.data.status == 201) {
      returnState.savedPackageData = state.InventoryReducer.data.data;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
      returnState.savedData = true;
    } else if (state.InventoryReducer.data.status == 200) {
      returnState.message = languageData.global[state.InventoryReducer.data.message];
      returnState.savedData = true;
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false;
    }
  } else if (state.InventoryReducer.action === "DELETE_DISCOUNT_PACKAGE") {
    if (state.InventoryReducer.data.status == 200) {
      returnState.redirect = true;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
    } else {
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    }
  } else if (state.InventoryReducer.action === "ACTIVATE_DISCOUNT_PACKAGE") {
   if (state.InventoryReducer.data.status == 200) {
     returnState.redirect = true;
     returnState.message = languageData.global[state.InventoryReducer.data.message];
   } else {
     toast.error(languageData.global[state.InventoryReducer.data.message]);
     returnState.showLoader = false
   }
 }
  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ getDefaultPackageData: getDefaultPackageData, searchProductByName: searchProductByName, saveDiscountPackage: saveDiscountPackage, deleteDiscountPackage: deleteDiscountPackage, activateDiscountPackage:activateDiscountPackage }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateEditDiscountPackage));
