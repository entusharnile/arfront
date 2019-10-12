import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import DatePicker from "react-datepicker";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import { fetchInventoryData, getProductDefaultData, isProductNameAvailable, addProduct, createCategory, deleteProduct,emptyInventoryReducer } from '../../Actions/Inventory/inventoryActions.js';
import { withRouter } from 'react-router';
import InventoryHeader from './InventoryHeader.js';
import TagsInput from 'react-tagsinput'
import { checkIfPermissionAllowed, numberFormat, formatBytes, isNumber, showFormattedDate, isFormSubmit, isPositiveNumber, isInteger, toggleBodyScroll,getMembershipTier } from '../../Utils/services.js';
import 'react-tagsinput/react-tagsinput.css'
import validator from 'validator';
import axios from 'axios';
import moment from 'moment';
import config from '../../config';

const viewDateFormat = (date) => {
  return moment(date).format('MMMM DD, YYYY');
}
const defaultInventoryPackage = () => {
  return { inventoryClinic: 0, inventoryDate: new Date(), inventoryBatch: "", inventoryStock: "", inventoryAlert: "" }
};
const defaultInventoryErrorPackage = () => {
  return { inventoryClinic: false, inventoryDate: false, inventoryBatch: false, inventoryStock: false, inventoryAlert: false}
};
const isFloatOption = () => { return { min: 0, max: 9999999999 } }
class EditInventory extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    let languageData = JSON.parse(localStorage.getItem('languageData'));
    this.state = {
      backAction: 'active',
      productId: 0,
      categoryId:0,
      is_product_active: true,
      addCategoryPop: false,
      is_custom_tax_rule_enabled: false,
      is_supplier_info_enabled: false,
      add_category_status: true,
      is_inventory_enabled: false,
      is_stock_inventory_enabled: false,
      is_custom_tax_rule_enabled_category: false,
      clinics: [],
      categories: [],
      startsAtUnitArr: [],
      inventoryArr: [defaultInventoryPackage()],
      inventoryArrError: [defaultInventoryErrorPackage()],
      keywords: [],
      productDefaultData: {},
      stock_alert: '0',
      available_stock: '0',
      product_sku: '',
      supplier_name: '',
      supplier_name_error: false,
      reference_number: '',
      reference_number_error: false,
      supplier_email_id: '',
      supplier_email_id_error: false,
      supplier_phone_number: '',
      supplier_phone_number_eror: false,
      productNameAvailable: false,
      product_name: '',
      cost_to_company: '',
      product_ratio: '',
      showLoader: false,
      product_ratio_enabled: false,
      productRatioError: false,
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      product_type: 0,
      product_category: 0,
      injectable_type: 0,
      product_service: 0,
      injectableTypeArr: ['Botulinum Toxin', 'Filler', 'Fat'],
      productTypeArr: [{ id: 'injectable', value: 'Injectable' }, { id: 'coolsculpting', value: 'CoolSculpting' }, { id: 'chemicalpeels', value: 'Chemical Peels' }, { id: 'microneedling', value: 'Microneedling' }, { id: 'threads', value: 'Threads' }, { id: 'microblading', value: 'Microblading' }, { id: 'cellfina', value: 'Cellfina' }, { id: 'laser', value: 'Laser' }, { id: 'others', value: 'Others' }],
      productService: [{ id: 'Aesthetic Service', value: 'Aesthetic Service' }, { id: 'Product Sale', value: 'Product Sale' }, { id: 'Other', value: 'Other' }],
      injectableUnitType: [
        { id: 1, value: 'Units' },
        { id: 2, value: 'Speywood' },
        { id: 3, value: 'Vial' },
        { id: 4, value: 'Syringe' },
        { id: 10, value: 'ML' },
      ],
      coolsculptingUnitType: [
        { id: 5, value: 'Cycles' },
        { id: 10, value: 'ML' },
      ],
      chemicalpeelsUnitType: [
        { id: 3, value: 'Vial' },
        { id: 4, value: 'Syringe' },
        { id: 6, value: 'Packets' },
        { id: 10, value: 'ML' },
      ],
      microneedlingUnitType: [
        { id: 1, value: 'Units' },
        { id: 7, value: 'Tip' },
        { id: 10, value: 'ML' },
      ],
      threadsUnitType: [
        { id: 8, value: 'Thread' },
        { id: 10, value: 'ML' },
      ],
      microbladingUnitType: [
        { id: 3, value: 'Vial' },
        { id: 10, value: 'ML' },
      ],
      cellfinaUnitType: [
        { id: 9, value: 'Kit' },
        { id: 10, value: 'ML' },
      ],
      laserUnitType: [
        { id: 11, value: 'Treatment' },
      ],
      unitsByArr: ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1'],
      defaultUnitType: [],
      firstClinicName: '',
      is_system_product: 1,

      addCatCategoryName:''
    };

    window.onscroll = () => {
      return false;
    }
  }

  showLoaderFunc = () => {
    this.setState({ showLoader: true });
    localStorage.setItem("showLoader", false);
  }

  handleClick = (e) => {
    if (this.refDatePickerContainer && !this.refDatePickerContainer.contains(e.target)) {
      this.refDatePicker.setOpen(false);
      this.setState({ showDatePicker: false })
    }
  }
  componentDidMount() {
    toggleBodyScroll(false)
    window.onscroll = () => {
      return false;
    }
    const productId = (this.props.match.params.id) ? (this.props.match.params.id) : 0;
    const categoryId = (this.props.match.params.categoryId) ? (this.props.match.params.categoryId) : 0;
    const statusId = (this.props.match.params.statusId) ? (this.props.match.params.statusId) : 0;
    let backAction = 'active'
    if(categoryId){
      backAction = categoryId+'/category'
    }
    let formData = { 'params': {} }
    this.setState({ productId: productId,categoryId:categoryId, backAction:backAction, statusId:statusId })
    this.showLoaderFunc();
    this.props.getProductDefaultData(productId);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {};
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      nextProps.emptyInventoryReducer()
      if (localStorage.getItem("showLoader") == "false") {
        returnState.showLoader = false;
        return returnState;
      }
    }

    if (nextProps.productDefaultData != undefined && nextProps.productDefaultData != prevState.productDefaultData) {
      if (localStorage.getItem("showLoader") == "false") {
        let allClinics = nextProps.productDefaultData.clinics;
        let productData = (nextProps.productDefaultData.product) ? nextProps.productDefaultData.product : undefined;
        if (allClinics.length) {
          allClinics.map((obj, idx) => {
            if (idx === 0) {
              returnState.firstClinicName = obj.clinic_name
            }
            returnState['pricePerUnit-' + obj.id] = "";
            returnState['pricePerUnitMembers-' + obj.id] = "";
            returnState['customTax-' + obj.id] = ((obj.product_clinic_tax) && obj.product_clinic_tax.tax_percentage) ? obj.product_clinic_tax.tax_percentage : 0;
          })
        }


        let prevInventoryArr = prevState.inventoryArr;

        prevInventoryArr[0]['inventoryClinic'] = 0;//allClinics[0].id;
        returnState.inventoryArr = prevInventoryArr;
        returnState.productDefaultData = nextProps.productDefaultData;
        returnState.clinics = nextProps.productDefaultData.clinics;
        returnState.categories = nextProps.productDefaultData.categories;

        if (productData) {
          returnState.is_system_product = productData.is_system_product
          returnState.product_service = (productData.product_service) ? productData.product_service : '';
          returnState.backAction = (prevState.categoryId) ? prevState.categoryId+'/category' : (productData.is_product_active) ? 'active' : 'inactive';
          returnState.is_product_active = (productData.is_product_active) ? true : false;
          returnState.product_category = productData.category_id;
          returnState.cost_to_company = productData.cost_to_company;
          returnState.product_sku = (productData.product_sku) ? productData.product_sku : '';
          returnState.count_units_by = productData.count_units_by;
          returnState.product_image = productData.product_image;
          returnState.product_image_src = productData.product_image_url;
          returnState.product_description = (productData.product_description) ? productData.product_description : '';
          returnState.start_at_unit = productData.start_at_unit;
          returnState.product_type = (productData.product_type_label) ? productData.product_type_label : productData.product_type;
          returnState.is_custom_tax_rule_enabled = (productData.is_tax_enabled) ? true : false;
          returnState.is_supplier_info_enabled = productData.is_supplier_enabled;
          returnState.keywords = (productData.keywords) ? productData.keywords.split(',') : [];
          returnState.product_name = productData.product_name;
          returnState.unit_type = productData.toxin_type;
          returnState.injectable_type = (productData.type) ? productData.type : "";
          returnState.product_ratio_enabled = productData.product_ratio_enabled;
          if (productData.product_price_per_clinic.length) {
            productData.product_price_per_clinic.map((obj, idx) => {
              returnState["pricePerUnit-" + obj.clinic_id] = obj.price_per_unit;
              returnState["pricePerUnitMembers-" + obj.clinic_id] = obj.price_per_unit_members;
            })
          }

          if (productData.product_ratio_enabled) {
            returnState.product_ratio = productData.ratio;
          }

          if (productData.product_supplier) {
            returnState.supplier_name = productData.product_supplier.supplier_name;
            returnState.supplier_email_id = productData.product_supplier.supplier_email;
            returnState.supplier_phone_number = productData.product_supplier.supplier_phone;
            returnState.reference_number = productData.product_supplier.refrence_number;
          }

          returnState.is_stock_inventory_enabled = (productData.is_stock_inventory_enabled) ? true : false;
          returnState.available_stock = (productData.available_stock) ? productData.available_stock : '0';
          returnState.stock_alert = (productData.stock_alert) ? productData.stock_alert : '0';

          returnState.is_inventory_enabled = (productData.is_inventory_enabled) ? true : false;
          let inventoryArr = [];
          let inventoryArrError = [];
          if ((typeof productData.product_inventory === 'object' || typeof productData.product_inventory === 'array') && productData.product_inventory.length > 0) {
            productData.product_inventory.map((obj, idx) => {
              inventoryArr.push({ inventoryClinic: obj.clinic_id, inventoryDate: moment(showFormattedDate(obj.expiry_date, false, 'YYYY-MM-DD')).toDate(), inventoryBatch: obj.batch_id, id: obj.id,inventoryStock: obj.units,inventoryAlert: obj.alert_units })
              inventoryArrError.push(defaultInventoryErrorPackage());
            })
            returnState.inventoryArr = inventoryArr;
            returnState.inventoryArrError = inventoryArrError;
          } else {
            returnState.inventoryArr = [defaultInventoryPackage()];
            returnState.inventoryArrError = [defaultInventoryErrorPackage()];
          }

          if (productData.count_units_by) {
            let startsAtUnitArr = []
            let tmpVal = productData.count_units_by * 10;
            for (var i = tmpVal; i <= 20; i += tmpVal) {
              var result = i / 10;
              startsAtUnitArr.push(result);
            }
            returnState.startsAtUnitArr = startsAtUnitArr;
          }
        }
        returnState.showLoader = false;
      }
    }

    if (nextProps.productNameAvailability != undefined && (nextProps.productNameAvailability.message == 'product_not_found' || nextProps.productNameAvailability.message == 'product_found')) {
      if (localStorage.getItem("showLoader") == "false") {
        nextProps.emptyInventoryReducer()
        returnState.productNameError = (nextProps.productNameAvailability.data.data == "true") ? true : false;
        returnState.productNameAvailable = (nextProps.productNameAvailability.data.data == "true") ? true : false;
        returnState.showLoader = false;
      }
    }
    if (nextProps.productAddedStatus != undefined && (nextProps.productAddedStatus == 201 || nextProps.productAddedStatus == 200)) {
      if (localStorage.getItem("showLoader") == "false") {
        //this.props.emptyInventoryReducer()
        //const backAction = (prevState.categoryId) ? prevState.categoryId+'/category' : (prevState.is_product_active) ? 'active' : 'inactive';
        toast.dismiss();
        toast.success(nextProps.message)
        nextProps.history.goBack();

      }
    }
    if (nextProps.categoryData != undefined && nextProps.categoryData.status == 201) {
      if (localStorage.getItem("showLoader") == "false") {
        nextProps.emptyInventoryReducer()
        returnState.showLoader = false;
        returnState.addCategoryPop = false;
        returnState.categories = nextProps.categoryData.data;
        let categoryObj = nextProps.categoryData.data.find(x => x.category_name == prevState.addCatCategoryName);
        returnState.product_category = (categoryObj !== undefined && categoryObj.id !== undefined) ? categoryObj.id : 0
        toggleBodyScroll(false)
      }
    }
    return returnState;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    let arr = [];
    let changedVal = {},
      startsAtUnitArr = [];
    const inventoryArrIndex = event.target.dataset.inventoryindex;
    if (inventoryArrIndex) {
      const inventoryArr = this.state.inventoryArr;
      inventoryArr[inventoryArrIndex][target.name] = value;
      this.setState({ inventoryArr: inventoryArr });
    } else {
      if (target.name == 'count_units_by') {
        if (value > 0) {
          let tmpVal = value * 10
          for (var i = tmpVal; i <= 20; i += tmpVal) {
            var result = i / 10;
            startsAtUnitArr.push(result);
          }
        }
        changedVal.startsAtUnitArr = startsAtUnitArr;
        changedVal.start_at_unit = (startsAtUnitArr.length > 0) ? startsAtUnitArr[0] : 0
      }

      if (target && target.type === 'file') {
        const allowedTypes = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/gif", "image/GIF"];

        if (target.files && allowedTypes.indexOf(target.files[0].type) > -1) {
          this.handleFileChosen(target.files[0], target)
        } else {
          toast.error(this.state.globalLang.vaidation_this_file_type_is_not_allowed);
        }
      }

      const membershipTier = getMembershipTier();
      if (target.name.startsWith('pricePerUnitMembers')) {
        let clinicId = target.name.split('-')[1];
        if (this.state.priceRepeat && clinicId == this.state.clinics[0].id && isNumber(value)) {
          this.state.clinics.map((obj, idx) => {
            changedVal['pricePerUnitMembers-' + obj.id] = value;
          })
        }
        let returnState = {}
        const tempValue = value.trim();
        if (tempValue !== '') {
          if (isNumber(value)) {
            if (!isPositiveNumber(value)) {
              returnState["pricePerUnitMembersError-" + clinicId] = true;
            } else {
              returnState["pricePerUnitMembersError-" + clinicId] = false;
            }
          } else {
            returnState["pricePerUnitMembersError-" + clinicId] = true;
          }
        } else {
          returnState["pricePerUnitMembersError-" + clinicId] = false;
        }
        this.setState(returnState);

      } else if (target.name.startsWith('pricePerUnit')) {
        let clinicId = target.name.split('-')[1];
        if (this.state.priceRepeat && clinicId == this.state.clinics[0].id && isNumber(value)) {
          this.state.clinics.map((obj, idx) => {
            changedVal['pricePerUnit-' + obj.id] = value;
          })
        }
        let returnState = {}
        if (!isPositiveNumber(value)) {
          returnState["pricePerUnitError-" + clinicId] = true;
        } else {
          returnState["pricePerUnitError-" + clinicId] = false;
        }
        this.setState(returnState);
      }



      if (target.name == 'priceRepeat') {
        let clinicId = this.state.clinics[0].id;
        if(this.state['pricePerUnit-' + clinicId]){
          if (value) {
            this.state.clinics.map((obj, idx) => {
              changedVal['pricePerUnit-' + obj.id] = this.state['pricePerUnit-' + clinicId];
              changedVal['pricePerUnitMembers-' + obj.id] = this.state['pricePerUnitMembers-' + clinicId];
              changedVal["pricePerUnitError-" + obj.id] = false;
            })
          } else {
            this.state.clinics.map((obj, idx) => {
              if(clinicId !== obj.id){
                changedVal['pricePerUnit-' + obj.id] = '';
                changedVal['pricePerUnitMembers-' + obj.id] = '';
                changedVal["pricePerUnitError-" + obj.id] = true;
              }
            })
          }
      }
    }

      if (target.name == 'product_category') {
        if (value == 'addCategory') {
          changedVal['addCategoryPop'] = true;
          toggleBodyScroll(true)
        } else {
          changedVal[event.target.name] = value;
        }
      } else {
        changedVal[event.target.name] = value;
      }
      changedVal.userChanged = true;
      this.setState(changedVal);
    }

  }

  handleNameChange = (event) => {
    let target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    if (value.trim() !== '') {
      this.showLoaderFunc();
      this.setState({ 'product_name': value });
      let formData = {}
      formData.product_name = value;
      formData.product_id = this.state.productId;
      this.props.isProductNameAvailable(formData);
    }
  }

  addCategory = (event) => {
    this.setState({ catNameError: false });
    if (this.state.addCatCategoryName == undefined || this.state.addCatCategoryName.trim() == '') {
      this.setState({ addCatCategoryNameError: true });
      return false;
    }
    if (this.state.is_custom_tax_rule_enabled_category) {
      var taxError = false;
      let returnState = {};
      for (let x in this.state) {
        if (x.startsWith('addCatClinic-')) {
          let id = x.split('-')[1]
          //if (this.state[x] == '' && this.state[x] != 0) {
            if (this.state[x] === '' || this.state[x] === undefined || this.state[x] === null || !isPositiveNumber(this.state[x])) {
              returnState["addCatClinicError-" + id] = true;
              taxError = true;
            } else {
              returnState["addCatClinicError-" + id] = false;
            }
          //}
        }
      }
      this.setState(returnState);
      if (taxError) {
        return false;
      }
    }
    let formData = {};
    formData.category_name = this.state.addCatCategoryName;
    formData.cat_status = (this.state.add_category_status) ? 1 : 0;
    formData.is_custom_rule_tax = (this.state.is_custom_tax_rule_enabled_category) ? 1 : 0;
    let clinic_tax = []
    for (let x in this.state) {
      if (x.startsWith('addCatClinic-') && this.state[x] !== '') {
        let id = x.split('-')[1]
        clinic_tax.push({ clinic_id: id, tax_percentage: this.state[x] })
      }
    }
    formData.tax_rules = clinic_tax;
    this.showLoaderFunc();
    this.props.createCategory(formData);

  }
  handleSubmit = (event) => {
    this.props.emptyInventoryReducer()
    if (isFormSubmit()) {
      const membershipTier = getMembershipTier();
      var regexp = /^\d+\.\d{0,2}$/;
      //====Frontend validation=================
      this.setState({ productNameError: false, productTypeError: false, productCategoryError: false, costToCompanyError: false, unitTypeError: false, injectableTypeError: false, unitsCountError: false, startsAtError: false, productRatioError: false, available_stock_error: false, stock_alert_error: false });

      if (this.state.product_type == 0) {
        this.setState({ productTypeError: true });
        return false;
      }

      if (this.state.product_category == 0) {
        this.setState({ productCategoryError: true });
        return false;
      }

      if (this.state.product_name == undefined || this.state.product_name.trim() == '' || this.state.productNameAvailable) {
        this.setState({ productNameError: true });
        return false;
      }

      if (this.state.cost_to_company == undefined || this.state.cost_to_company === '' || this.state.cost_to_company < 0 || (this.state.cost_to_company > 0 && this.state.cost_to_company < 1) || !isNumber(this.state.cost_to_company)) {
        this.setState({ costToCompanyError: true });
        return false;
      }

      if (this.state.product_type == 0 || this.state.product_type == 'others') {

      } else {
        if (this.state.unit_type == undefined || this.state.unit_type == 0) {
          this.setState({ unitTypeError: true });
          return false;
        }
        if (this.state.count_units_by == undefined || this.state.count_units_by == 0) {
          this.setState({ unitsCountError: true });
          return false;
        }
        if (this.state.start_at_unit == undefined || this.state.start_at_unit == 0) {
          this.setState({ startsAtError: true });
          return false;
        }
        if (this.state.product_type == 'injectable' || this.state.product_type == 'threads' || this.state.product_type == 'microblading' || this.state.product_type == 'cellfina') {
          if (this.state.injectable_type == 0) {
            this.setState({ injectableTypeError: true });
            return false;
          }
        }
      }


      if (this.state.product_ratio_enabled) {
        if (!isNumber(this.state.product_ratio)) {
          this.setState({ productRatioError: true });
          return false;
        }
      }

      let changedVal = {},
        error = false;
      this.state.clinics.map((obj, idx) => {
        if (!isNumber(this.state['pricePerUnit-' + obj.id]) && !isPositiveNumber(this.state['pricePerUnit-' + obj.id])) {
          changedVal['pricePerUnitError-' + obj.id] = true;
          error = true;
        } else {
          changedVal['pricePerUnitError-' + obj.id] = false;
        }

          if (this.state['pricePerUnitMembers-' + obj.id] != '') {
            if (isNumber(this.state['pricePerUnitMembers-' + obj.id])) {
              if (!isPositiveNumber(this.state['pricePerUnitMembers-' + obj.id])) {
                changedVal["pricePerUnitMembersError-" + obj.id] = true;
                error = true;
              } else {
                changedVal["pricePerUnitMembersError-" + obj.id] = false;
              }
            } else {
              changedVal["pricePerUnitMembersError-" + obj.id] = true;
              error = true;
            }
          } else {
            changedVal["pricePerUnitMembersError-" + obj.id] = false;
          }
      })
      this.setState(changedVal);
      if (error) {
        //this.setState(changedVal);
        return false;
      }


      if (this.state.is_inventory_enabled) {
        const inventoryArr = this.state.inventoryArr;
        const inventoryArrError = this.state.inventoryArrError;
        let inventoryError = false;
        inventoryArr.map((obj, idx) => {
          if (obj.inventoryClinic === undefined || obj.inventoryClinic === null || obj.inventoryClinic <= 0) {
            inventoryArrError[idx].inventoryClinic = true;
            inventoryError = true;
          } else {
            inventoryArrError[idx].inventoryClinic = false;
          }
          if (obj.inventoryDate === undefined || obj.inventoryDate === '' || obj.inventoryDate === null) {
            inventoryArrError[idx].inventoryDate = true;
            inventoryError = true;
          } else if (this.state.productId < 0 && obj.inventoryDate <= new Date()) {
            inventoryArrError[idx].inventoryDate = true;
            inventoryError = true;
          } else {
            inventoryArrError[idx].inventoryDate = false;
          }
          if (obj.inventoryBatch.trim() == '') {
            inventoryArrError[idx].inventoryBatch = true;
            inventoryError = true;
          } else {
            inventoryArrError[idx].inventoryBatch = false;
          }
          if (obj.inventoryStock === undefined || obj.inventoryStock === '' || !isPositiveNumber(obj.inventoryStock,1)) {
            inventoryArrError[idx].inventoryStock = true;
            inventoryError = true;
          } else {
            inventoryArrError[idx].inventoryStock = false;
          }
          if (obj.inventoryAlert === undefined || obj.inventoryAlert === '' || !isPositiveNumber(obj.inventoryAlert)) {
            inventoryArrError[idx].inventoryAlert = true;
            inventoryError = true;
          } else {
            inventoryArrError[idx].inventoryAlert = false;
          }

        })
        if (inventoryError) {
          this.setState({ inventoryArrError: inventoryArrError })
          return false;
        }
      }

      if (this.state.is_stock_inventory_enabled) {
        if (this.state.available_stock === undefined || this.state.available_stock === '' || !isPositiveNumber(this.state.available_stock,1)) {
          this.setState({ available_stock_error: true });
          return false;
        }
        if (this.state.stock_alert === undefined || this.state.stock_alert === '' || !isPositiveNumber(this.state.stock_alert)) {
          this.setState({ stock_alert_error: true });
          return false;
        }
      }

      if (this.state.is_supplier_info_enabled) {
        if (this.state.supplier_name == undefined || this.state.supplier_name.trim() == '') {
          this.setState({ supplier_name_error: true });
          return false;
        }
        if (this.state.reference_number == undefined || this.state.reference_number.trim() == '') {
          this.setState({ reference_number_error: true });
          return false;
        }
        if (this.state.supplier_email_id == undefined || this.state.supplier_email_id.trim() == '' || !validator.isEmail(this.state.supplier_email_id)) {
          this.setState({ supplier_email_id_error: true });
          return false;
        }
        if (this.state.supplier_phone_number == undefined || this.state.supplier_phone_number.trim() == '') {
          this.setState({ supplier_phone_number_error: true });
          return false;
        }
      }
      if (this.state.is_custom_tax_rule_enabled) {
        var taxError = false;
        let returnState = {};
        for (let x in this.state) {
          if (x.startsWith('customTax-')) {
            let id = x.split('-')[1]
            if (this.state[x] === '' || this.state[x] === undefined || this.state[x] === null || !isPositiveNumber(this.state[x])) {
              returnState["customTaxError-" + id] = true;
              taxError = true;
            } else {
              returnState["customTaxError-" + id] = false;
            }
          }
        }
        this.setState(returnState);
        if (taxError) {
          return false;
        }
      }
      let formData = {};
      formData.product_type = this.state.product_type;
      formData.productId = this.state.productId;
      formData.product_image = this.state.product_image;
      formData.is_product_active = (this.state.is_product_active) ? 1 : 0;
      formData.product_name = this.state.product_name;
      formData.product_category = this.state.product_category;
      formData.cost_to_company = this.state.cost_to_company;
      formData.product_sku = this.state.product_sku;
      formData.product_description = this.state.product_description;
      formData.product_ratio_enabled = (this.state.product_ratio_enabled) ? 1 : 0;
      formData.keywords = (this.state.keywords.length) ? this.state.keywords.join(', ') : "";
      if (this.state.product_ratio_enabled) {
        formData.given_product_ratio = 1;
        formData.product_ratio = this.state.product_ratio;
      }

      if (this.state.product_type !== 'others') {
        formData.unit_type = this.state.unit_type;
        formData.count_units_by = this.state.count_units_by;
        formData.start_at_unit = this.state.start_at_unit;
        formData.injectable_type = this.state.injectable_type;
      }


      let price_list = [];
      this.state.clinics.map((obj, idx) => {
        if (isNumber(this.state['pricePerUnit-' + obj.id])) {
          let price = {};
          price.clinic_id = obj.id
          price.location_price_per_unit = this.state['pricePerUnit-' + obj.id]

            price.location_price_per_member = (this.state['pricePerUnitMembers-' + obj.id] === '' || this.state['pricePerUnitMembers-' + obj.id] === null || this.state['pricePerUnitMembers-' + obj.id] === undefined) ? this.state['pricePerUnit-' + obj.id] : this.state['pricePerUnitMembers-' + obj.id]

          price_list.push(price)
        }
      })


      if (this.state.product_type !== 'others' && this.state.is_inventory_enabled) {
        let stock_inventory = [];
        this.state.inventoryArr.map((obj, idx) => {
          stock_inventory.push({ clinic_id: obj.inventoryClinic, expiry_date: moment(obj.inventoryDate).format("YYYY-MM-DD"), batch_id: obj.inventoryBatch, available_stock: obj.inventoryStock, stock_alert: obj.inventoryAlert })
        })
        formData.stock_inventory = stock_inventory;
      }

      if(this.state.product_type === 'others' && this.state.is_stock_inventory_enabled){
          formData.available_stock = this.state.available_stock;
          formData.stock_alert = this.state.stock_alert;
      }


      if (this.state.is_supplier_info_enabled) {
        formData.supplier_name = this.state.supplier_name;
        formData.reference_number = this.state.reference_number;
        formData.supplier_email_id = this.state.supplier_email_id;
        formData.supplier_phone_number = this.state.supplier_phone_number;
      }

      if (this.state.is_custom_tax_rule_enabled) {
        let clinic_tax = []
        for (let x in this.state) {
          if (x.startsWith('customTax-')) {
          //if (x.startsWith('customTax-')) {
            let id = x.split('-')[1]
            clinic_tax.push({ clinic_id: id, tax: this.state[x] })
          }
        }
        formData.clinic_tax = clinic_tax;
      }

      formData.price_list = price_list;
      formData.is_inventory_enabled = (this.state.product_type !== 'others') ? ((this.state.is_inventory_enabled) ? 1 : 0) : 0;
      formData.is_stock_inventory_enabled = (this.state.product_type === 'others') ? ((this.state.is_stock_inventory_enabled) ? 1 : 0) : 0;
      formData.is_supplier_info_enabled = (this.state.is_supplier_info_enabled) ? 1 : 0;
      formData.is_custom_tax_rule_enabled = (this.state.is_custom_tax_rule_enabled) ? 1 : 0;
      if (this.state.product_service !== undefined && this.state.product_service !== '' && this.state.product_service != 0) {
        formData.product_service = this.state.product_service
      }
      //this.showLoaderFunc();
      this.setState({showLoader:true})
      this.props.addProduct(formData);
    }
  }

  handleTagChange = (value) => {
    this.setState({ keywords: value, userChanged: true });
  }
  handleUpload = (targetName) => {
    let uploadtype = '';

    uploadtype = 'product_image'
    const data = new FormData()
    data.append('file', this.state.file, this.state.file.name)
    let endpoint = config.API_URL + `media/upload?upload_type=${uploadtype}`;

    axios.post(endpoint, data).then(res => {

      let name = this.state.target.name
      this.setState({ [name]: res.data.data.file_name, showLoader: false });
    }).catch(error => {
      toast.error(this.state.globalLang[error.response.data.message]);
    })
  }

  handleFileRead = (e) => {
    const content = this.state.fileReader.result;
    let name = this.state.target.name + '_thumbnail'
    let src = this.state.target.name + '_src'
    let size = this.state.target.name + '_size'
    let fileSize = formatBytes(this.state.file.size, 1)
    this.setState({ [name]: this.state.file.name, [size]: fileSize, [src]: this.state.fileReader.result, showLoader: true });

    this.handleUpload(this.state.target.name)
  }

  handleFileChosen = (file, target) => {
    this.state.fileReader = new FileReader();
    this.state.fileReader.onloadend = this.handleFileRead;
    this.state.fileReader.readAsDataURL(file);
    this.state.file = file
    this.state.target = target
  }

  handleSearchDatePicker = (name, date) => {
    let returnState = {}
    const inventoryArr = this.state.inventoryArr;
    inventoryArr[name]['inventoryDate'] = date;
    this.setState({ inventoryArr: inventoryArr });
  }
  addMoreInventory = () => {
    const inventoryArr = this.state.inventoryArr;
    const inventoryArrError = this.state.inventoryArrError;
    let returnState = {};
    let tmpInventoryPackage = defaultInventoryPackage();
    tmpInventoryPackage.inventoryClinic = 0;//this.state.clinics[0].id
    inventoryArr.unshift(tmpInventoryPackage);
    inventoryArrError.unshift(defaultInventoryErrorPackage());
    this.setState({ inventoryArr: inventoryArr, inventoryArrError: inventoryArrError });
  }
  removeCurrentInventory = (id) => {
    const inventoryArr = this.state.inventoryArr;
    const inventoryArrError = this.state.inventoryArrError;
    if (inventoryArr.length == 1) { return false }
    const servicepackageindex = id;
    inventoryArr.splice(servicepackageindex, 1);
    inventoryArrError.splice(servicepackageindex, 1);

    this.setState({ inventoryArr: inventoryArr, inventoryArrError: inventoryArrError });
  }
  showDeleteModal = () => {
    this.setState({ showModal: true })
    toggleBodyScroll(true)
  }

  dismissModal = () => {
    this.setState({ showModal: false })
    toggleBodyScroll(false)
  }

  deleteProduct = () => {
    localStorage.setItem("showLoader", false);
    this.setState({ showLoader: true, showModal: false })
    let cId = this.state.productId;
    this.props.deleteProduct(cId);
    toggleBodyScroll(false)
  }

  removeUploadedFile = (event) => {
    this.setState({
      product_image_thumbnail:'',
      product_image_src:'',
      product_image_size:"",
      product_image:''
    });
  }

  render() {
    let unitTypeArr = []
    switch (this.state.product_type) {
      case "injectable":
        {
          unitTypeArr = this.state['injectableUnitType'];
          break;
        }
      case "coolsculpting":
        {
          unitTypeArr = this.state['coolsculptingUnitType'];
          break;
        }
      case "chemicalpeels":
        {
          unitTypeArr = this.state['chemicalpeelsUnitType']
          break;
        }
      case "microneedling":
        {
          unitTypeArr = this.state['microneedlingUnitType']
          break;
        }
      case "threads":
        {
          unitTypeArr = this.state['threadsUnitType']
          break;
        }
      case "microblading":
        {
          unitTypeArr = this.state['microbladingUnitType']
          break;
        }
      case "cellfina":
        {
          unitTypeArr = this.state['cellfinaUnitType'];
          break;
        }
      case "laser":
        {
          unitTypeArr = this.state['laserUnitType']
          break;
        }
      default:
        unitTypeArr = this.state['defaultUnitType']
    }

    let stockUnitType = '';
    if(this.state.unit_type != 0){
      let unitTypeObj = unitTypeArr.find(x => x.id == this.state.unit_type);
      if(unitTypeObj !== undefined && unitTypeObj.value !== undefined){
        stockUnitType = unitTypeObj.value
      }
    }

    let clinicName = (this.state.clinics.length > 0) ? this.state.clinics[0].clinic_name : "";
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <InventoryHeader handleAnchor={this.handleAnchor} activeMenuTag={'products-active'} />
          <div className="juvly-section full-width">
            <div className="juvly-container">
              <div className="juvly-title">{(this.state.productId > 0) ? (this.state.inventoryLang.inventory_edit_product) : (this.state.inventoryLang.inventory_create_product)}
                <a onClick={() => {this.props.history.goBack()}} className="pull-right crossIcon"><img src="/images/close.png" /></a>
                <div className="setting-custom-switch product-active pull-right">
                  <span id="membership_lable">{(this.state.is_product_active) ? (this.state.inventoryLang.inventory_product_active) : (this.state.inventoryLang.inventory_product_inactive)}</span>
                  <label className="setting-switch pull-right no-margin">
                    <input type="checkbox" className="setting-custom-switch-input" name="is_product_active" checked={(this.state.is_product_active) ? "checked" : false} autoComplete="off" onChange={this.handleInputChange} />
                    <span className="setting-slider" />
                  </label>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12 profile-detail-left">
                  <div className="main-profile-picture">
                    <div className="col-xs-6 no-padding">
                      <div className="file-container">
                        {(this.state['product_image_src']) && <a className="delete-file" onClick={this.removeUploadedFile} ></a>}
                        <img src={(this.state['product_image_src']) ? this.state['product_image_src'] : ''} />
                        <span className={(this.state['product_image_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['product_image_thumbnail']}</span>
                        <span className={(this.state['product_image_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['product_image_size']}</span>
                        <div className="upload">{this.state.inventoryLang.inventory_upload}
                          <input
                            type="file"
                            name={'product_image'}
                            onChange={this.handleInputChange}
                            autoComplete="off"
                            className="image_questionnaire"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="juvly-subtitle">{this.state.inventoryLang.inventory_product_information}</div>
                  <div className="row">
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_product_type}<span className="setting-require">*</span></div>
                        <select className={(this.state.productTypeError) ? "setting-select-box field-error" : "setting-select-box"} name="product_type" onChange={this.handleInputChange} value={this.state.product_type} >
                          <option value={0}>{this.state.inventoryLang.inventory_select}</option>
                          {this.state.productTypeArr.length && this.state.productTypeArr.map((obj, idx) => {
                            return (
                              <option value={obj.id} key={"type-" + idx}>{obj.value}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_product_category}<span className="setting-require">*</span></div>
                        <select className={(this.state.productCategoryError) ? "setting-select-box field-error" : "setting-select-box"} name="product_category" onChange={this.handleInputChange} value={this.state.product_category}>
                          <option value={0}>{this.state.inventoryLang.inventory_none}</option>
                          {this.state.categories.length && this.state.categories.map((obj, idx) => {
                            return (
                              <option value={obj.id} key={"cat-" + idx}>{obj.category_name}</option>
                            )
                          })}
                          <option value="addCategory">{this.state.inventoryLang.inventory_create_new_category}</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_product_name_label}<span className="setting-require">*</span></div>
                        <input className={(this.state.productNameError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="product_name" placeholder={this.state.inventoryLang.inventory_product_name_label} onBlur={this.handleNameChange} onChange={this.handleInputChange} autoComplete="off" value={this.state.product_name} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.invenoty_product_sku}</div>
                        <input className="setting-input-box" type="text" name="product_sku" onChange={this.handleInputChange} placeholder={this.state.inventoryLang.invenoty_product_sku} autoComplete="off" value={this.state.product_sku} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_cost_to_company}<span className="setting-require">*</span></div>
                        <input className={(this.state.costToCompanyError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="cost_to_company" placeholder={this.state.inventoryLang.inventory_cost_to_company} onChange={this.handleInputChange} autoComplete="off" value={this.state.cost_to_company} />
                      </div>
                    </div>
                    <div className="col-md-4 col-sm-6 col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_product_service}</div>
                        <select className="setting-select-box" name="product_service" onChange={this.handleInputChange} value={this.state.product_service} >
                          <option value={0}>{this.state.inventoryLang.inventory_select}</option>
                          {this.state.productService.length && this.state.productService.map((obj, idx) => {
                            return (
                              <option value={obj.id} key={"service-" + idx}>{obj.value}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.invenoty_description}</div>
                        <textarea className="setting-textarea-box textarea-height-50" name="product_description" placeholder={this.state.inventoryLang.invenoty_description} value={this.state.product_description} onChange={this.handleInputChange} />
                      </div>
                    </div>

                    <div className={(this.state.product_type != "others") ? "col-md-4 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12 no-display"}>
                      <div className="setting-field-outer">
                        <div className="switch-accordian-row " id="book">
                          {this.state.inventoryLang.inventory_product_ratio}
                          <label className="setting-switch pull-right">
                            <input type="checkbox" id="app_booking" onChange={this.handleInputChange} name="product_ratio_enabled" checked={(this.state.product_ratio_enabled) ? "checked" : false} className="setting-custom-switch-input" />
                            <span className="setting-slider" />
                          </label>
                        </div>

                      </div>
                    </div>
                    <div className={(this.state.product_ratio_enabled && this.state.product_type != 'others') ? "col-md-4 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12 no-display"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_ratio_for_this_product}</div>
                        <div className={(this.state.productRatioError) ? "setting-input-box field-error" : "setting-input-box"}>
                          1 :&nbsp;
                          <input className="" type="text" name="product_ratio" autoComplete="off" value={this.state.product_ratio} onChange={this.handleInputChange} />
                        </div>
                      </div>
                    </div>

                    <div className={(this.state.product_type != 0 && this.state.product_type != 'others') ? "col-md-4 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12 no-display"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_unit_type}<span className="setting-require">*</span></div>
                        <select className={(this.state.unitTypeError) ? "setting-select-box field-error" : "setting-select-box"} name="unit_type" onChange={this.handleInputChange} value={this.state.unit_type}>
                          <option value={0}>{this.state.inventoryLang.inventory_N_A}</option>
                          {this.state.product_type != 0 && unitTypeArr.length && unitTypeArr.map((obj, idx) => {
                            return (
                              <option value={obj.id} key={"unit_type-" + idx}>{obj.value}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className={(this.state.product_type != 0 && this.state.product_type != 'others' && (this.state.product_type == "injectable" || this.state.product_type == "threads" || this.state.product_type == "microblading" || this.state.product_type == "cellfina")) ? "col-md-4 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12 no-display"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_injectable_type}<span className="setting-require">*</span></div>
                        <select className={(this.state.injectableTypeError) ? "setting-select-box field-error" : "setting-select-box"} name="injectable_type" onChange={this.handleInputChange} value={this.state.injectable_type}>
                          <option value={0}>{this.state.inventoryLang.inventory_select}</option>
                          {this.state.injectableTypeArr.length && this.state.injectableTypeArr.map((obj, idx) => {
                            return (
                              <option value={idx + 1} key={"injectableType-" + idx}>{obj}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className={(this.state.product_type != 0 && this.state.product_type != 'others') ? "col-md-4 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12 no-display"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_count_units_by}<span className="setting-require">*</span></div>
                        <select className={(this.state.unitsCountError) ? "setting-select-box field-error" : "setting-select-box"} name="count_units_by" onChange={this.handleInputChange} value={this.state.count_units_by}>
                          <option value={0}>{this.state.inventoryLang.inventory_N_A}</option>
                          {this.state.unitsByArr.length && this.state.unitsByArr.map((obj, idx) => {
                            return (
                              <option value={obj} key={"unitsBy-" + idx}>{obj}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className={(this.state.product_type != 0 && this.state.product_type != 'others') ? "col-md-4 col-sm-6 col-xs-12" : "col-md-4 col-sm-6 col-xs-12 no-display"}>
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_start_at_unit}<span className="setting-require">*</span></div>
                        <select className={(this.state.startsAtError) ? "setting-select-box field-error" : "setting-select-box"} name="start_at_unit" onChange={this.handleInputChange} value={this.state.start_at_unit}>
                          {<option value={0}>{this.state.inventoryLang.inventory_select}</option>}
                          {this.state.startsAtUnitArr.length && this.state.startsAtUnitArr.map((obj, idx) => {
                            return (
                              <option value={obj} key={"starts-" + idx}>{obj}</option>
                            )
                          })}
                        </select>
                      </div>
                    </div>
                    <div className="col-xs-12">
                      <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.inventoryLang.inventory_product_keywords}</div>
                        <div className="setting-input-box">
                          <TagsInput addOnBlur={true} addKeys={[9, 13, 32]} onlyUnique={true} value={(this.state.keywords) ? this.state.keywords : []} onChange={this.handleTagChange} inputProps={{ placeholder: "Keywords" }} />
                        </div>
                      </div>
                    </div>

                  </div>
                  <div className="row">
                    <div className="col-xs-12">
                      <div className="juvly-subtitle m-b-20 m-t-20">{this.state.inventoryLang.inventory_product_price}
                        <div className="right-sign-btn repeat-price">
                          <input className="pull-left sel-all-visible" type="checkbox" id="save-sign" name="priceRepeat" autoComplete="off" onChange={this.handleInputChange} checked={(this.state.priceRepeat) ? "checked" : false} />
                          <label className="search-text" htmlFor="save-sign"> {(this.state.inventoryLang.inventory_select_to_repeat_price) ? this.state.inventoryLang.inventory_select_to_repeat_price.replace(/{clinicName}/, this.state.firstClinicName) : ''}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  {this.state.clinics.length && this.state.clinics.map((obj, idx) => {
                    return (
                      <div className="row" key={"clinicPrice-" + idx}>
                        <div className="col-md-4 col-sm-3 col-xs-12">
                          <div className="prod-price-clinic-name">{obj.clinic_name}</div>
                        </div>
                        <div className="col-sm-4 col-xs-12">
                          <div className="setting-field-outer">
                            <div className="new-field-label">{this.state.inventoryLang.inventory_product_price_unit}<span className="setting-require">*</span></div>
                            <input className={(this.state["pricePerUnitError-" + obj.id]) ? "setting-input-box field-error" : "setting-input-box"} placeholder={this.state.inventoryLang.inventory_price_per_unit} type="text" name={"pricePerUnit-" + obj.id} value={this.state["pricePerUnit-" + obj.id]} autoComplete="off" onChange={this.handleInputChange} />
                          </div>
                        </div>

                          <div className="col-md-4 col-sm-5 col-xs-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{'Member Price for Single Tier Membership'}</div>
                              <input className={(this.state["pricePerUnitMembersError-" + obj.id]) ? "setting-input-box field-error" : "setting-input-box"}
                                type="text" name={"pricePerUnitMembers-" + obj.id} value={this.state["pricePerUnitMembers-" + obj.id]} placeholder={this.state.inventoryLang.inventory_price_for_members} autoComplete="off" onChange={this.handleInputChange} />
                            </div>
                          </div>

                      </div>
                    )
                  })
                  }
                </div>
              </div>
            </div>
            {/* SLot number and Expiration -  Switcher Block - START */ }
            <div className={(this.state.product_type != "others") ? "switch-accordian-outer" : "switch-accordian-outer no-display"}>
              <div className="switch-accordian-row " id="switch-accordian-product-type-except-other">
                {this.state.inventoryLang.inventory_lot_no_expiration}
                <label className="setting-switch pull-right">
                  <input type="checkbox" id="is_inventory_enabled" onChange={this.handleInputChange} name="is_inventory_enabled" checked={(this.state.is_inventory_enabled) ? "checked" : false} className="setting-custom-switch-input" />
                  <span className="setting-slider" />
                </label>
              </div>
              <div className={(!this.state.is_inventory_enabled) ? "setting-container no-display" : "setting-container"} id="Appointment_Booking-form-title">
                {this.state.inventoryArr.map((obj, idx) => {
                  return (
                    <div className="row relative" key={"inventory-" + idx}>
                      <div className="col-md-4 col-sm-4 col-xs-11">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.inventoryLang.inventory_clinic}<span className="setting-require">*</span></div>
                          <select className={(this.state.inventoryArrError[idx] && this.state.inventoryArrError[idx].inventoryClinic) ? "setting-select-box field-error" : "setting-select-box"} onChange={this.handleInputChange} name={"inventoryClinic"} value={obj.inventoryClinic} data-inventoryindex={idx}>
                            {<option value={0}>{this.state.inventoryLang.inventory_select}</option>}
                            {this.state.clinics.length && this.state.clinics.map((obj, idx) => {
                              return (
                                <option value={obj.id} key={"inventoryClinicArr-" + idx}>{obj.clinic_name} </option>
                              )
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="col-sm-2 col-xs-11">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.inventoryLang.inventory_expiration_date}<span className="setting-require">*</span></div>
                          <DatePicker
                            value={(obj.inventoryDate) ? viewDateFormat(obj.inventoryDate) : null}
                            onChange={this.handleSearchDatePicker.bind(this, idx)}
                            className={(this.state.inventoryArrError[idx] && this.state.inventoryArrError[idx].inventoryDate) ? "setting-input-box field-error" : "setting-input-box"}
                            dateFormat="YYYY-MM-dd"
                            name={"inventoryDate"}
                            selected={(obj.inventoryDate) ? obj.inventoryDate : null}
                            autoComplete="off"
                            minDate={moment().toDate()}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                          />
                        </div>
                      </div>
                      <div className="col-sm-2 col-xs-11">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.inventoryLang.inventory_batch_id}<span className="setting-require">*</span></div>
                          <input className={(this.state.inventoryArrError[idx] && this.state.inventoryArrError[idx].inventoryBatch) ? "setting-input-box field-error" : "setting-input-box"} type="text" name={"inventoryBatch"} autoComplete="off" value={obj.inventoryBatch} onChange={this.handleInputChange} data-inventoryindex={idx} />
                        </div>
                      </div>
                      <div className="col-sm-2 col-xs-11">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.globalLang.label_stock} {(stockUnitType) ? this.state.globalLang.label_in_small + ' '+stockUnitType : ''}<span className="setting-require">*</span></div>
                          <input className={(this.state.inventoryArrError[idx] && this.state.inventoryArrError[idx].inventoryStock) ? "setting-input-box field-error" : "setting-input-box"} type="text" name={"inventoryStock"} autoComplete="off" value={obj.inventoryStock} onChange={this.handleInputChange} data-inventoryindex={idx} />
                        </div>
                      </div>
                      <div className="col-sm-2 col-xs-11">
                        <div className="setting-field-outer">
                          <div className="new-field-label">{this.state.inventoryLang.inventory_stock_alert}<span className="setting-require">*</span></div>
                          <input className={(this.state.inventoryArrError[idx] && this.state.inventoryArrError[idx].inventoryAlert) ? "setting-input-box field-error" : "setting-input-box"} type="text" name={"inventoryAlert"} autoComplete="off" value={obj.inventoryAlert} onChange={this.handleInputChange} data-inventoryindex={idx} />
                        </div>
                      </div>
                      <a href="javascript:void(0);" className={(idx > 0) ? "add-round-btn " : "add-round-btn no-display"} onClick={this.removeCurrentInventory.bind(this, idx)} ><span>-</span></a>
                      <a href="javascript:void(0);" className={(idx == 0) ? "add-round-btn" : "add-round-btn  no-display"} onClick={this.addMoreInventory} ><span>+</span></a>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* SLot number and Expiration -  Switcher Block - END */ }
            {/* Stock and Inventory - Switcher Block - START */ }
            <div className={(this.state.product_type == "others") ? "switch-accordian-outer" : "switch-accordian-outer no-display"}>
              <div className="switch-accordian-row " id="switch-accordian-product-type-other">
                {this.state.inventoryLang.inventory_stock_and_inventory}
                <label className="setting-switch pull-right">
                  <input type="checkbox" id="is_stock_inventory_enabled" onChange={this.handleInputChange} name="is_stock_inventory_enabled" checked={(this.state.is_stock_inventory_enabled) ? "checked" : false} className="setting-custom-switch-input" />
                  <span className="setting-slider" />
                </label>
              </div>
              <div className={(!this.state.is_stock_inventory_enabled) ? "setting-container no-display" : "setting-container"} id="Appointment_Booking-form-title">
                <div className="row relative" >
                  <div className="col-md-4 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.inventoryLang.inventory_available_stock}<span className="setting-require">*</span></div>
                      <input className={(this.state.available_stock_error) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="available_stock" placeholder={this.state.inventoryLang.inventory_available_stock} autoComplete="off" onChange={this.handleInputChange} value={this.state.available_stock} />
                    </div>
                  </div>
                  <div className="col-md-4 col-sm-6 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.inventoryLang.inventory_stock_alert}<span className="setting-require">*</span></div>
                      <input className={(this.state.stock_alert_error) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="stock_alert" placeholder={this.state.inventoryLang.inventory_stock_alert} autoComplete="off" onChange={this.handleInputChange} value={this.state.stock_alert} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Stock and Inventory - Switcher Block - END */ }
            <div className="switch-accordian-outer">
              <div className="switch-accordian-row " id="book">
                {this.state.inventoryLang.inventory_supplier_info}
                <label className="setting-switch pull-right">
                  <input type="checkbox" id="app_booking" name="is_supplier_info_enabled" onChange={this.handleInputChange} checked={(this.state.is_supplier_info_enabled) ? "checked" : false} className="setting-custom-switch-input" />
                  <span className="setting-slider" />
                </label>
              </div>
              <div className={(!this.state.is_supplier_info_enabled) ? "setting-container no-display" : "setting-container"} id="Appointment_Booking-form-title">
                <div className="row">
                  <div className="col-sm-3 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.inventoryLang.inventory_supplier_name}<span className="setting-require">*</span></div>
                      <input className={(this.state.supplier_name_error) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="supplier_name" placeholder={this.state.inventoryLang.inventory_supplier_name} autoComplete="off" onChange={this.handleInputChange} value={this.state.supplier_name} />
                    </div>
                  </div>
                  <div className="col-sm-3 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.inventoryLang.inventory_reference_number}<span className="setting-require">*</span></div>
                      <input className={(this.state.reference_number_error) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="reference_number" placeholder={this.state.inventoryLang.inventory_reference_number} autoComplete="off" onChange={this.handleInputChange} value={this.state.reference_number} />
                    </div>
                  </div>
                  <div className="col-sm-3 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.inventoryLang.inventory_supplier_emailID}<span className="setting-require">*</span></div>
                      <input className={(this.state.supplier_email_id_error) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="supplier_email_id" placeholder={this.state.inventoryLang.inventory_supplier_emailID} autoComplete="off" onChange={this.handleInputChange} value={this.state.supplier_email_id} />
                    </div>
                  </div>
                  <div className="col-sm-3 col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.inventoryLang.inventory_supplier_ph_no}<span className="setting-require">*</span></div>
                      <input className={(this.state.supplier_phone_number_error) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="supplier_phone_number" placeholder={this.state.inventoryLang.inventory_supplier_phone_number} autoComplete="off" onChange={this.handleInputChange} value={this.state.supplier_phone_number} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="switch-accordian-outer">
              <div className="switch-accordian-row " id="book">
                {this.state.inventoryLang.inventory_custom_tax}
                <label className="setting-switch pull-right">
                  <input type="checkbox" id="app_booking" name="is_custom_tax_rule_enabled" onChange={this.handleInputChange} checked={(this.state.is_custom_tax_rule_enabled) ? "checked" : false} className="setting-custom-switch-input" />
                  <span className="setting-slider" />
                </label>
              </div>
              <div className={(!this.state.is_custom_tax_rule_enabled) ? "setting-container no-display" : "setting-container"} id="Appointment_Booking-form-title">
                <div className="row">
                  {this.state.clinics.length && this.state.clinics.map((obj, idx) => {
                    return (
                      <div className="col-sm-3 col-xs-12" key={"clinicTax-" + idx}>
                        <div className="setting-field-outer">
                          <div className="new-field-label">{obj.clinic_name}<span className="setting-require">*</span></div>{this.state["customTaxError-" + obj.id]}
                          <input
                            className={(this.state["customTaxError-" + obj.id]) ? "setting-input-box field-error" : "setting-input-box"}
                            type="text"
                            name={"customTax-" + obj.id}
                            placeholder='0.00'
                            autoComplete="off"
                            onChange={this.handleInputChange}
                            value={(this.state["customTax-" + obj.id] === undefined) ? '0' : this.state["customTax-" + obj.id]} />
                        </div>
                      </div>
                    )
                  })
                  }
                </div>
              </div>
            </div>
            <div className="footer-static">
              <button className="new-blue-btn pull-right" id="saveform" onClick={this.handleSubmit}>{this.state.inventoryLang.inventory_save}</button>
              <a onClick={() => {this.props.history.goBack()}} className="new-white-btn pull-right" id="resetform" >{this.state.inventoryLang.inventory_Cancel}</a>
              {(this.state.productId > 0 && checkIfPermissionAllowed('delete-product') === true && this.state.is_system_product == 0) &&
                <button className="new-red-btn pull-left" id="resetformasd" onClick={this.showDeleteModal} >{this.state.inventoryLang.inventory_delete}</button>
              }
            </div>
          </div>
        </div>
        <div className={(this.state.addCategoryPop) ? "modalOverlay" : "modalOverlay no-display"}>
          <div className="small-popup-outer appointment-detail-main">
            <div className="small-popup-header">
              <div className="popup-name">{this.state.inventoryLang.inventory_ADD_CATEGORY}</div>
              <a onClick={() => { this.setState({ addCategoryPop: !this.state.addCategoryPop }, () => {toggleBodyScroll(false)})  }} className="small-cross">×</a>
            </div>
            <div className="small-popup-content">
              <div className="juvly-container no-padding-bottom">


                <div className="row">
                  <div className="col-xs-12">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.inventoryLang.inventory_category_name} <span className="setting-require">*</span></div>
                      <input className={(this.state.addCatCategoryNameError) ? "setting-input-box field-error" : "setting-input-box"} type="text" name="addCatCategoryName" placeholder={this.state.inventoryLang.inventory_category_name} autoComplete="off" onChange={this.handleInputChange} value={this.state.addCatCategoryName} />
                    </div>
                    <div className="setting-field-outer">
                      <div className="setting-custom-switch product-active pull-right" id="book">

                        <span id="membership_lable">{(this.state.add_category_status) ? "Status Active" : "Status In-Active"}</span>
                        <label className="setting-switch pull-right">
                          <input type="checkbox" id="app_booking" name="add_category_status" onChange={this.handleInputChange} checked={(this.state.add_category_status) ? "checked" : false} className="setting-custom-switch-input" />
                          <span className="setting-slider" />
                        </label>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
              <div className={"switch-accordian-outer"}>
                <div className="switch-accordian-row " id="book">
                  {this.state.inventoryLang.inventory_custom_tax_rule}
                  <label className="setting-switch pull-right">
                    <input type="checkbox" id="app_booking" name="is_custom_tax_rule_enabled_category" onChange={this.handleInputChange} checked={(this.state.is_custom_tax_rule_enabled_category) ? "checked" : false} className="setting-custom-switch-input" />
                    <span className="setting-slider" />
                  </label>
                </div>
                <div className={(!this.state.is_custom_tax_rule_enabled_category) ? "setting-container no-display" : "setting-container"} id="Appointment_Booking-form-title">
                  <div className="row">
                    {this.state.clinics.length && this.state.clinics.map((obj, idx) => {
                      return (
                        <div className="col-sm-6 col-xs-12" key={"addCatClinic-" + idx}>
                          <div className="setting-field-outer">
                            <div className="new-field-label">{obj.clinic_name}<span className="setting-require">*</span></div>
                            <input
                            className={(this.state["addCatClinicError-" + obj.id]) ? "setting-input-box field-error" : "setting-input-box"}
                            type="text" name={"addCatClinic-" + obj.id}
                            autoComplete="off"
                            placeholder='0.00'
                            onChange={this.handleInputChange}
                            value={(this.state["addCatClinic-" + obj.id] === undefined) ? '0' : this.state["addCatClinic-" + obj.id]} />
                          </div>
                        </div>
                      )
                    })
                    }

                  </div>
                </div>
              </div>
            </div>
            <div className="footer-static">
              <a className="new-blue-btn pull-right" onClick={this.addCategory}>{this.state.inventoryLang.inventory_save}</a>
            </div>
          </div>
        </div>
        <div className={(this.state.showModal ? 'overlay' : '')}></div>
        <div id="filterModal" role="dialog" className={(this.state.showModal ? 'modal fade in displayBlock' : 'modal fade')}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" onClick={this.dismissModal}>×</button>
                <h4 className="modal-title" id="model_title">{this.state.inventoryLang.inventory_delete_product}</h4>
              </div>
              <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                {this.state.inventoryLang.inventory_r_u_sure_want_del}
              </div>
              <div className="modal-footer" >
                <div className="col-md-12 text-left" id="footer-btn">
                  <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissModal}>{this.state.inventoryLang.inventory_Cancel}</button>
                  <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.deleteProduct}>{this.state.inventoryLang.inventory_Yes}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock positionFixed' : 'new-loader text-left'}>
          <div className="loader-outer">
            <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
            <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  let returnState = {};
  const languageData = JSON.parse(localStorage.getItem("languageData"));
  localStorage.setItem("showLoader", false);

  if (state.InventoryReducer.action === "PRODUCT_DEFAULT_DATA") {
    if (state.InventoryReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.productDefaultData = state.InventoryReducer.data.data;
    }
  }
  if (state.InventoryReducer.action === "IS_PRODUCT_AVAILABLE") {
    if (state.InventoryReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.productNameAvailability = state.InventoryReducer.data;
    }
  }
  if (state.InventoryReducer.action === "PRODUCT_ADDED") {
    if (state.InventoryReducer.data.status != 201 && state.InventoryReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.productAddedStatus = state.InventoryReducer.data.status;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
    }
  }
  if (state.InventoryReducer.action === "CREATE_CATEGORY") {
    if (state.InventoryReducer.data.status != 201) {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.categoryData = state.InventoryReducer.data;
    }
  }
  if (state.InventoryReducer.action === "PRODUCT_DELETED") {
    if (state.InventoryReducer.data.status != 200) {
      toast.dismiss();
      toast.error(languageData.global[state.InventoryReducer.data.message]);
      returnState.showLoader = false
    } else {
      returnState.productAddedStatus = state.InventoryReducer.data.status;
      returnState.message = languageData.global[state.InventoryReducer.data.message];
    }
  }
  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchInventoryData: fetchInventoryData, getProductDefaultData: getProductDefaultData, isProductNameAvailable: isProductNameAvailable, addProduct: addProduct, createCategory: createCategory, deleteProduct: deleteProduct, emptyInventoryReducer: emptyInventoryReducer }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(EditInventory));
