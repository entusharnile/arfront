import React, { Component } from 'react';
import { isPositiveNumber, isInteger, numberFormat, checkIfPermissionAllowed, isFormSubmit, getCurrencySymbol } from '../../../Utils/services.js'
import popupClose from '../../../images/popupClose.png';


const initMembershipTypeProductClass = () => {
  return {
    product_name: 'table-updated-td',
    units: 'units filled-border'
  }
}

export default class MembershipTypeModal extends Component {
  constructor(props) {
    super(props);
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'))
    this.state = {
      showLoader: false,

      settingsLang: languageData.settings,
      globalLang: languageData.global,
      inventoryLang: languageData.inventory,
      isEditWallet: false,
      isEditMemberShip: false,
      showMembershipTypeModal: false,
      membershipTypeList: [],
      membershipTypeData: {},
      membershipTierId: 0,
      isActive: null,
      membership_type_tier_name: '',
      membership_type_discount_percentage: '',
      membership_type_price_per_month: '',
      membership_type_one_time_setup_fee: '',
      membership_type_tier_nameClass: 'simpleInput',
      membership_type_discount_percentageClass: 'TP-discount-outer noShadow',
      membership_type_price_per_monthClass: 'TP-discount-outer noShadow',
      membership_type_one_time_setup_feeClass: 'TP-discount-outer noShadow',
      membership_type_product: [],
      membership_type_productClass: [],

      productList: [],
      searched_product_id: 0,
      searched_product_name: '',
      is_product_search: false,
      search_product_keyword: '',
      searched_product_units: '',
      search_product_keywordClass: 'simpleInput',
      searched_product_unitsClass: 'simpleInput',
      is_search_first_time:true,
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.handleOnClick, false);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}

    if (nextProps.autoProductData !== undefined && nextProps.autoProductData.products !== undefined && prevState.autoProductData !== nextProps.autoProductData) {
      returnState.autoProductData = nextProps.autoProductData
      returnState.productList = nextProps.autoProductData.products;
      returnState.showLoader = false;
      returnState.is_search_first_time = (prevState.is_search_first_time) ? false : prevState.is_search_first_time
    } else if (nextProps.membershipTypeData !== undefined && nextProps.membershipTypeData.tier_name !== undefined && prevState.membershipTypeData !== nextProps.membershipTypeData) {
      returnState.membershipTypeData = nextProps.membershipTypeData
      returnState.showMembershipTypeModal = true;
      returnState.membership_type_tier_name = nextProps.membershipTypeData.tier_name;
      returnState.membership_type_discount_percentage = nextProps.membershipTypeData.discount_percentage;
      returnState.membership_type_price_per_month = nextProps.membershipTypeData.price_per_month;
      returnState.membership_type_one_time_setup_fee = nextProps.membershipTypeData.one_time_setup_fee;

      if (nextProps.membershipTypeData.tier_products !== undefined && nextProps.membershipTypeData.tier_products !== null) {
        let membership_type_product = [];
        let membership_type_productClass = [];
        nextProps.membershipTypeData.tier_products.map((obj, idx) => {
          let product = {}
          product.product_id = obj.product_id;
          product.product_name = ((obj.product) && (obj.product.product_name)) ? obj.product.product_name : '';
          product.units = obj.units;
          membership_type_product.push(product)
          membership_type_productClass.push(initMembershipTypeProductClass());
        })
        returnState.membership_type_product = membership_type_product
        returnState.membership_type_productClass = membership_type_productClass
      }
    } else if (nextProps.showMembershipTypeModal !== undefined && nextProps.showMembershipTypeModal !== prevState.showMembershipTypeModal) {
      returnState.showMembershipTypeModal = nextProps.showMembershipTypeModal
    } else if (nextProps.membershipTierId !== undefined && nextProps.membershipTierId !== prevState.membershipTierId) {
      returnState.membershipTierId = nextProps.membershipTierId
    }
    return returnState;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? (target.checked) ? true : false : target.value;
    this.setState({
      [event.target.name]: value, userChanged: true
    });
  }



  showMembershipTypeModal = (membershipTierId) => {
    this.setState({ membershipTierId: membershipTierId, showMembershipTypeModal: true })
  }

  hideMembershipTypeModal = (membershipTierId) => {
    this.props.hideMembershipTypeModal({ showMembershipTypeModal: false, membershipTierId: 0 })
    //this.setState({ showMembershipTypeModal: false, membershipTierId: 0 })
  }


  handleSubmitMembershipType = (event) => {
    event.preventDefault();
    if (isFormSubmit()) {
      let error = false;

      if (typeof this.state.membership_type_tier_name === undefined || this.state.membership_type_tier_name === null || this.state.membership_type_tier_name === '' || (typeof this.state.membership_type_tier_name == 'string' && this.state.membership_type_tier_name.trim() === '')) {
        this.setState({
          membership_type_tier_nameClass: 'simpleInput field-error'
        })
        error = true;
      } else if (this.state.membership_type_tier_name) {
        this.setState({
          membership_type_tier_nameClass: 'simpleInput'
        })
      }
      if (typeof this.state.membership_type_discount_percentage === undefined || this.state.membership_type_discount_percentage === null || this.state.membership_type_discount_percentage === '' || !isPositiveNumber(this.state.membership_type_discount_percentage, 0, 100)) {
        this.setState({
          membership_type_discount_percentageClass: 'TP-discount-outer noShadow group-error'
        })
        error = true;
      } else if (this.state.membership_type_discount_percentage) {
        this.setState({
          membership_type_discount_percentageClass: 'TP-discount-outer noShadow'
        })
      }
      if (typeof this.state.membership_type_price_per_month === undefined || this.state.membership_type_price_per_month === null || this.state.membership_type_price_per_month === '' || !isPositiveNumber(this.state.membership_type_price_per_month, 1)) {
        this.setState({
          membership_type_price_per_monthClass: 'TP-discount-outer noShadow group-error'
        })
        error = true;
      } else if (this.state.membership_type_price_per_month) {
        this.setState({
          membership_type_price_per_monthClass: 'TP-discount-outer noShadow'
        })
      }
      if (typeof this.state.membership_type_one_time_setup_fee === undefined || this.state.membership_type_one_time_setup_fee === null || this.state.membership_type_one_time_setup_fee === '' || !isPositiveNumber(this.state.membership_type_one_time_setup_fee)) {
        this.setState({
          membership_type_one_time_setup_feeClass: 'TP-discount-outer noShadow group-error'
        })
        error = true;
      } else if (this.state.membership_type_one_time_setup_fee) {
        this.setState({
          membership_type_one_time_setup_feeClass: 'TP-discount-outer noShadow'
        })
      }
      let membership_type_product = this.state.membership_type_product;
      let membership_type_productClass = this.state.membership_type_productClass;
      this.state.membership_type_product.map((obj, idx) => {
        if (typeof obj.units === undefined || obj.units === null || obj.units === '' || !isPositiveNumber(obj.units,0.01)) {
          membership_type_productClass[idx]['units'] = 'units filled-border field-error';

          error = true;
        } else if (obj.units) {
          membership_type_productClass[idx]['units'] = 'units';
        }
      })
      this.setState({
        membership_type_product: membership_type_product,
        membership_type_productClass: membership_type_productClass
      })
      if (error) {
        return;
      }

      let formData = {
        tier_name: this.state.membership_type_tier_name,
        discount_percentage: this.state.membership_type_discount_percentage,
        price_per_month: this.state.membership_type_price_per_month,
        one_time_setup_fee: this.state.membership_type_one_time_setup_fee,
        products: (membership_type_product.length > 0) ? membership_type_product : []
      }
      this.props.saveMembershipMultiTier(formData);
    }
  }


  componentWillUnmount() {
    document.removeEventListener('click', this.handleOnClick, false);
  }

  handleOnClick = (e) => {
    if (this.ref_search_product !== undefined && this.ref_search_product !== null && !this.ref_search_product.contains(e.target) && (this.state.is_product_search !== undefined && this.state.is_product_search === true)) {
      this.setState({ is_product_search: false })
    }
  }

  searchProductByName = (value) => {
    let formData = { params: { limit: 20 } }
    let selected_product_ids = []
    this.state.membership_type_product.map((obj, idx) => {
      if (obj.product_id)
        selected_product_ids.push(obj.product_id);
    })
    if (selected_product_ids.length) {
      let formIds = selected_product_ids.join(',')
      formData.params.selected_product_ids = formIds;
    }
    if (typeof value === 'string') {
      value = value.trim()
      if (value.length >= 3) {
        formData.params.term = value.trim();
        value = value.trim()
        this.props.searchProductByName(formData);
      }else {
        this.setState({is_search_first_time:true})
      }
    }
  }

  handleProductChange = (event) => {
    const target = event.target;
    let value = target.value;
    let name = event.target.name;
    let returnState = {}

    returnState[event.target.name] = value;
    returnState.is_product_search = true
    returnState.searched_product_id = 0
    returnState.searched_product_name = ''
    this.setState(returnState);
    this.searchProductByName(value)
  }

  handleOnFocus = (mode, index, event) => {
    this.searchProductByName(this.state.search_product_keyword)
    this.setState({ is_product_search: true,is_search_first_time:true })
  }

  handleOnBlur = (event) => {
    this.setState({ is_product_search: false,is_search_first_time:true })
  }

  selectProduct = (event) => {
    const target = event.target;
    let name = event.currentTarget.dataset.name;
    let id = event.currentTarget.dataset.id;
    this.setState({ searched_product_id: id, searched_product_name: name, search_product_keyword: name, is_product_search: false })

  }

  handleAddMembershipProduct = (event) => {
    event.preventDefault();
    let error = false;

    if (this.state.searched_product_id <= 0) {
      this.setState({
        search_product_keywordClass: 'simpleInput field-error'
      })
      if (this.state.search_product_keyword != '') {
        //toast.dismiss();
        //toast.error(this.state.inventoryLang.inventory_error_please_selectvalid_product_name);
      }
      error = true;
    } else if (this.state.searched_product_id) {
      this.setState({
        search_product_keywordClass: 'simpleInput'
      })
    }
    if (typeof this.state.searched_product_units === undefined || this.state.searched_product_units === null || this.state.searched_product_units === '' || !isPositiveNumber(this.state.searched_product_units, 0.01)) {
      this.setState({
        searched_product_unitsClass: 'simpleInput field-error'
      })
      error = true;
    } else if (this.state.searched_product_units) {
      this.setState({
        searched_product_unitsClass: 'simpleInput'
      })
    }
    if (error) {
      return;
    }

    let membership_type_product = this.state.membership_type_product;
    membership_type_product.push({
      product_id: this.state.searched_product_id,
      product_name: this.state.searched_product_name,
      units: this.state.searched_product_units,
    });

    let membership_type_productClass = this.state.membership_type_productClass;
    membership_type_productClass.push(initMembershipTypeProductClass())
    this.setState({
      membership_type_product: membership_type_product,
      membership_type_productClass: membership_type_productClass,
      searched_product_id: 0,
      searched_product_name: '',
      search_product_keyword: '',
      is_product_search: false,
      searched_product_units: '',
      productList: [],
      is_search_first_time:true,
    })
  }

  handleDeleteMembershipProduct = (index) => {
    let membership_type_product = this.state.membership_type_product;
    let membership_type_productClass = this.state.membership_type_productClass;
    membership_type_product.splice(index, 1);
    membership_type_productClass.splice(index, 1);
    this.setState({ membership_type_product: membership_type_product, membership_type_productClass: membership_type_productClass });
  }

  handleChangeMembershipUnit = (event) => {
    const target = event.target;
    let value = target.value;
    let name = event.target.name;
    let index = event.currentTarget.dataset.index;
    if (index != undefined) {
      let membership_type_product = this.state.membership_type_product;
      membership_type_product[index]['units'] = value;
      let membership_type_productClass = this.state.membership_type_productClass;
      if (value) {
        membership_type_productClass[index]['units'] = 'units';
      } else {
        membership_type_productClass[index]['units'] = 'units filled-border field-error';
      }
      this.setState({ membership_type_product: membership_type_product, membership_type_productClass: membership_type_productClass });
    }
  }



  render() {
    return (
      <div className={(this.state.showMembershipTypeModal === true) ? "blackOverlay" : "blackOverlay no-display"}>
        <div className="vert-middle">
          <div className="white-popup">
            <div className="white-popup-wrapper">
              <div className="membershipTypeTitle">{(this.state.membershipTierId) ? this.state.settingsLang.settings_edit_membership_type : this.state.settingsLang.settings_create_membership_type}<a onClick={() => this.hideMembershipTypeModal()} className="popupClose"><img src={popupClose} /></a></div>
              <div className="row">
                <div className="col-xs-12 m-b-20">
                  <div className="simpleField">
                    <div className="simpleLabel">{this.state.settingsLang.settings_membership_type_name}<span className="fieldRequired">*</span></div>
                    <input type="text" className={this.state.membership_type_tier_nameClass} autoComplete="off" name="membership_type_tier_name" value={this.state.membership_type_tier_name} onChange={this.handleInputChange} />
                  </div>
                </div>
                <div className="col-sm-6 col-xs-12">
                  <div className="simpleField memberDiscount">
                    <div className="simpleLabel">{this.state.inventoryLang.inventory_Discount}</div>
                    <div className={this.state.membership_type_discount_percentageClass}>
                      <input type="text" className={''} placeholder={'0.00'} autoComplete="off" name="membership_type_discount_percentage" value={this.state.membership_type_discount_percentage} onChange={this.handleInputChange} />
                      <span className="TP-discount-type pull-right">%</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xs-12">
                  <div className="simpleField memberprice">
                    <div className="simpleLabel">{this.state.settingsLang.Patient_MONTHLY_MEMBERSHIP_FEES}</div>
                    <div className={this.state.membership_type_price_per_monthClass}>
                      <input type="text" placeholder={'0.00'} autoComplete="off" name="membership_type_price_per_month" value={this.state.membership_type_price_per_month} onChange={this.handleInputChange} />
                      <span className="TP-discount-type pull-right">{getCurrencySymbol()}</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xs-12">
                  <div className="simpleField memberprice">
                    <div className="simpleLabel">{this.state.settingsLang.Patient_ONE_TIME_MEMBERSHIP_SETUP_FEES}</div>
                    <div className={this.state.membership_type_one_time_setup_feeClass}>
                      <input type="text" placeholder={'0.00'} autoComplete="off" name="membership_type_one_time_setup_fee" value={this.state.membership_type_one_time_setup_fee} onChange={this.handleInputChange} />
                      <span className="TP-discount-type pull-right">{getCurrencySymbol()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="membershipTypeTitle">{this.state.settingsLang.settings_free_monthly_products}</div>
              <div className="row">
                <div className="col-xs-6">
                  <div className="search_product_container" ref={(ref_search_product) => this.ref_search_product = ref_search_product} >
                    <div className="simpleField">
                      <div className="simpleLabel">{this.state.inventoryLang.inventory_product_name_label}</div>
                      <input type="text"
                        className={this.state.search_product_keywordClass}
                        autoComplete="off"
                        name="search_product_keyword"
                        value={this.state.search_product_keyword}
                        onChange={this.handleProductChange.bind(this)}
                        onFocus={this.handleOnFocus.bind(this)}
                      />
                    </div>
                    <ul className={(typeof this.state.search_product_keyword === 'string' && this.state.search_product_keyword.trim() !== '') && (this.state.is_product_search !== undefined && this.state.is_product_search === true && this.state.search_product_keyword.length > 2) ? " search-dropdown" : "cal-dropdown clinicname-dropdown no-display"}>
                      {(this.state.productList.length > 0) ? this.state.productList.map((obj, idx) => {
                        return (
                          <li key={"search_product-" + idx} data-id={obj.id} data-name={obj.product_name} onClick={this.selectProduct}>
                            <a >
                              {obj && obj.product_name}
                            </a>
                          </li>
                        )
                      })
                        :
                        <li key={"search_product-norecord"} data-id={0} data-name={'product_match_not_found'} data-index={-1}>
                          <a >
                            {(this.state.is_search_first_time) ? this.state.globalLang.label_searching_with_dot : this.state.globalLang.product_match_not_found}
                          </a>
                        </li>
                      }
                    </ul>
                  </div>
                </div>
                <div className="col-xs-3">
                  <div className="simpleField">
                    <div className="simpleLabel">{this.state.inventoryLang.inventory_units}</div>
                    <input type="text" className={this.state.searched_product_unitsClass} autoComplete="off" name="searched_product_units" value={this.state.searched_product_units} onChange={this.handleInputChange} />
                  </div>
                </div>
                <div className="col-xs-3">
                  <div className="simpleField">
                    <a className="new-blue-btn m-l-0" onClick={this.handleAddMembershipProduct}>{this.state.globalLang.label_add}</a>
                  </div>
                </div>
              </div>
            </div>
            {(this.state.membership_type_product.length > 0) &&
              <div className="table-responsive appointmenTable">
                <table className="table-updated juvly-table">
                  <thead className="table-updated-thead">
                    <tr>
                      <th className="col-xs-6 table-updated-th cursor-pointer sorting p-l-25">{this.state.globalLang.label_name}</th>
                      <th className="col-xs-3 table-updated-th">{this.state.inventoryLang.inventory_units}</th>
                      <th className="col-xs-3 table-updated-th">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.membership_type_product.map((obj, idx) => {
                      return (
                        <tr key={'membership_type_product' + idx} className="table-updated-tr">
                          <td className="table-updated-td p-l-25">{obj.product_name}</td>
                          <td className="table-updated-td count-link">
                            <input type="text" className={this.state.membership_type_productClass[idx]['units']} autoComplete="off" name="units" value={obj.units} onChange={this.handleChangeMembershipUnit} data-index={idx} />
                          </td>
                          <td className="table-updated-td td-membership-product-delete">
                            <a onClick={() => this.handleDeleteMembershipProduct(idx)} className="easy-link">{this.state.globalLang.label_delete}</a>
                          </td>
                        </tr>
                      )
                    })
                    }
                  </tbody>
                </table>
              </div>
            }
            <div className="footer-static p-r-24">
              <a className="new-blue-btn pull-right" onClick={this.handleSubmitMembershipType}>{this.state.globalLang.label_save}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
