import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { ToastContainer, toast } from "react-toastify";
import Sidebar from '../../../Containers/Settings/sidebar.js';
import { getMembershipWallet, updateWallet, updateMembership, emptyMembershipWallet, searchProductByName, getMembershipMultiTier, saveMembershipMultiTier, changeMembershipMultiTierStatus, deleteMembershipMultiTier } from '../../../Actions/Settings/membershipWalletActions.js';
import { isPositiveNumber, isInteger, numberFormat, checkIfPermissionAllowed, isFormSubmit, getCurrencySymbol, toggleBodyScroll,positionFooterCorrectly } from '../../../Utils/services.js'
import ConfirmationModal from '../../../Components/Common/ConfirmationModal.js'
import Loader from '../../../Components/Common/Loader.js'
import MembershipTypeModal from './MembershipTypeModal.js'

class MembershipWallet extends Component {
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

      wallet_item_expiry: '',
      wallet_dollar_expiry: '',
      wallet_send_expiry_email: true,
      wallet_send_expiry_reminder: true,
      wallet_reminder_days_before: '1',
      walletData: {
        wallet_item_expiry: '',
        wallet_dollar_expiry: '',
        wallet_send_expiry_email: true,
        wallet_send_expiry_reminder: true,
        wallet_reminder_days_before: '1',
      },
      wallet_item_expiryClass: 'simpleInput',
      wallet_dollar_expiryClass: 'simpleInput',
      wallet_reminder_days_beforeClass: 'input-fill-box filled-border',

      is_membership_enable: true, is_membership_enable: true,
      recurly_program_name: '',
      membership_tier: 'single',
      mothly_membership_type: 'free',
      thankyou_message: '',
      mothly_membership_fees: '0.00',
      one_time_membership_setup: '0.00',
      add_fees_to_client_wallet: false,
      membershipData: {
        is_membership_enable: true,
        recurly_program_name: '',
        membership_tier: 'single',
        mothly_membership_type: 'free',
        mothly_membership_fees: '0.00',
        one_time_membership_setup: '0.00',
        thankyou_message: '',
        add_fees_to_client_wallet: false,
      },
      recurly_program_nameClass: 'simpleInput',
      mothly_membership_feesClass: 'simpleInput',
      one_time_membership_setupClass: 'simpleInput',
      thankyou_messageClass: 'simpleTextarea',


      membershipTypeList: [],
      membershipTypeData: {},
      showMembershipTypeModal: false,
      membershipTierId: 0,
      isActive: null,

      autoProductData: {},


      showConfirmationModal: false,
      confirmationMsg: '',
      confirmationAction: ''

    }
  }
  componentDidMount() {
    this.setState({ 'showLoader': true });
    this.props.getMembershipWallet();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    let returnState = {}
    if (nextProps.showLoader != undefined && nextProps.showLoader == false) {
      nextProps.emptyMembershipWallet()
      returnState.showLoader = false
    }
    if (nextProps.membershipWalletData !== undefined && prevState.membershipWalletData !== nextProps.membershipWalletData) {
      returnState.membershipWalletData = nextProps.membershipWalletData;
      returnState.showLoader = false;

      if (nextProps.isResetWallet) {
        returnState.wallet_item_expiry = nextProps.membershipWalletData.wallet_item_expiry;
        returnState.wallet_dollar_expiry = nextProps.membershipWalletData.wallet_dollar_expiry;
        returnState.wallet_send_expiry_email = (nextProps.membershipWalletData.wallet_send_expiry_email) ? true : false;
        returnState.wallet_send_expiry_reminder = (nextProps.membershipWalletData.wallet_send_expiry_reminder) ? true : false;
        returnState.wallet_reminder_days_before = (nextProps.membershipWalletData.wallet_reminder_days_before) ? nextProps.membershipWalletData.wallet_reminder_days_before : "1";

        returnState.walletData = {
          wallet_item_expiry: returnState.wallet_item_expiry,
          wallet_dollar_expiry: returnState.wallet_dollar_expiry,
          wallet_send_expiry_email: returnState.wallet_send_expiry_email,
          wallet_send_expiry_reminder: returnState.wallet_send_expiry_reminder,
          wallet_reminder_days_before: returnState.wallet_reminder_days_before,
        }
        returnState.isEditWallet = false
      }

      if (nextProps.isResetMembership) {
        returnState.is_membership_enable = (nextProps.membershipWalletData.is_membership_enable) ? true : false;
        returnState.recurly_program_name = nextProps.membershipWalletData.recurly_program_name;
        returnState.membership_tier = nextProps.membershipWalletData.membership_tier;
        returnState.mothly_membership_type = nextProps.membershipWalletData.mothly_membership_type;
        returnState.mothly_membership_fees = (nextProps.membershipWalletData.mothly_membership_fees) ? nextProps.membershipWalletData.mothly_membership_fees : '0.00';
        returnState.one_time_membership_setup = (nextProps.membershipWalletData.one_time_membership_setup) ? nextProps.membershipWalletData.one_time_membership_setup : '0.00';
        returnState.thankyou_message = nextProps.membershipWalletData.thankyou_message;
        returnState.add_fees_to_client_wallet = (nextProps.membershipWalletData.add_fees_to_client_wallet) ? true : false;

        returnState.membershipData = {
          is_membership_enable: returnState.is_membership_enable,
          recurly_program_name: returnState.recurly_program_name,
          membership_tier: returnState.membership_tier,
          mothly_membership_type: returnState.mothly_membership_type,
          mothly_membership_fees: returnState.mothly_membership_fees,
          one_time_membership_setup: returnState.one_time_membership_setup,
          thankyou_message: returnState.thankyou_message,
          add_fees_to_client_wallet: returnState.add_fees_to_client_wallet,
        }
        returnState.isEditMemberShip = false
        returnState.mothly_membership_fees = numberFormat(returnState.mothly_membership_fees, 'decimal', 2)
        returnState.one_time_membership_setup = numberFormat(returnState.one_time_membership_setup, 'decimal', 2)

      }
      if (nextProps.isResetMembershipType) {
        toggleBodyScroll(false)
        returnState.showMembershipTypeModal = false;
        returnState.membershipTierId = 0;
        returnState.isActive = null
        if (nextProps.membershipWalletData.membership_tier_plans !== undefined && nextProps.membershipWalletData.membership_tier_plans !== null) {
          returnState.membershipTypeList = nextProps.membershipWalletData.membership_tier_plans;
        } else {
          returnState.membershipTypeList = []
        }
      }
      nextProps.emptyMembershipWallet()
      return returnState;
    } else if (nextProps.autoProductData !== undefined && prevState.autoProductData !== nextProps.autoProductData) {

      returnState.autoProductData = nextProps.autoProductData
      returnState.showLoader = false;
    } else if (nextProps.membershipTypeData !== undefined && prevState.membershipTypeData !== nextProps.membershipTypeData) {
      returnState.membershipTypeData = nextProps.membershipTypeData
      returnState.showLoader = false;
      returnState.showMembershipTypeModal = true;
      toggleBodyScroll(true)
      nextProps.emptyMembershipWallet()
    }
    return returnState;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? (target.checked) ? true : false : target.value;
    this.setState({
      [event.target.name]: value, userChanged: true
    });
    //positionFooterCorrectly();
  }

  handleEditWallet = () => {
    this.setState({
      wallet_item_expiry: this.state.walletData.wallet_item_expiry,
      wallet_dollar_expiry: this.state.walletData.wallet_dollar_expiry,
      wallet_send_expiry_email: this.state.walletData.wallet_send_expiry_email,
      wallet_send_expiry_reminder: this.state.walletData.wallet_send_expiry_reminder,
      wallet_reminder_days_before: this.state.walletData.wallet_reminder_days_before,
      isEditWallet: !this.state.isEditWallet
    })
  }

  handleCancelWallet = () => {
    this.handleEditWallet();
  }

  handleSubmitWallet = (event) => {
    event.preventDefault();
    if (isFormSubmit()) {
      let error = false;

      if (typeof this.state.wallet_item_expiry === undefined || this.state.wallet_item_expiry === null || this.state.wallet_item_expiry === '' || !isInteger(this.state.wallet_item_expiry, 1)) {
        this.setState({
          wallet_item_expiryClass: 'simpleInput field-error'
        })
        error = true;
      } else if (this.state.wallet_item_expiry) {
        this.setState({
          wallet_item_expiryClass: 'simpleInput'
        })
      }
      if (typeof this.state.wallet_dollar_expiry === undefined || this.state.wallet_dollar_expiry === null || this.state.wallet_dollar_expiry === '' || !isInteger(this.state.wallet_dollar_expiry, 1)) {
        this.setState({
          wallet_dollar_expiryClass: 'simpleInput field-error'
        })
        error = true;
      } else if (this.state.wallet_dollar_expiry) {
        this.setState({
          wallet_dollar_expiryClass: 'simpleInput'
        })
      }
      if (this.state.wallet_reminder_days_before === undefined || this.state.wallet_reminder_days_before === null || this.state.wallet_reminder_days_before === '' || !isInteger(this.state.wallet_reminder_days_before, 1)) {
        if (this.state.wallet_send_expiry_reminder || this.state.wallet_send_expiry_reminder === 'true') {
          this.setState({
            wallet_reminder_days_beforeClass: 'input-fill-box filled-border field-error'
          })
          error = true;
        } else {
          this.setState({
            wallet_reminder_days_beforeClass: 'input-fill-box filled-border'
          })
        }
      } else if (this.state.wallet_reminder_days_before) {
        this.setState({
          wallet_reminder_days_beforeClass: 'input-fill-box filled-border'
        })
      }

      if (error) {
        return;
      }
      let formData = {
        wallet_send_expiry_email: (this.state.wallet_send_expiry_email) ? 1 : 0,
        wallet_send_expiry_reminder: (this.state.wallet_send_expiry_reminder) ? 1 : 0,
        wallet_item_expiry: this.state.wallet_item_expiry,
        wallet_dollar_expiry: this.state.wallet_dollar_expiry
      }

      if (this.state.wallet_send_expiry_reminder == 1) {
        formData.wallet_reminder_days_before = this.state.wallet_reminder_days_before;
      }
      this.setState({ showLoader: true })
      this.props.updateWallet(formData);
    }
  }

  handleEditMembership = () => {
    this.setState({
      is_membership_enable: this.state.membershipData.is_membership_enable,
      recurly_program_name: this.state.membershipData.recurly_program_name,
      membership_tier: this.state.membershipData.membership_tier,
      mothly_membership_type: this.state.membershipData.mothly_membership_type,
      mothly_membership_fees: this.state.membershipData.mothly_membership_fees,
      one_time_membership_setup: this.state.membershipData.one_time_membership_setup,
      thankyou_message: this.state.membershipData.thankyou_message,
      add_fees_to_client_wallet: this.state.membershipData.add_fees_to_client_wallet,
      isEditMemberShip: !this.state.isEditMemberShip
    })
  }

  handleCancelMembership = () => {
    this.handleEditMembership();
  }

  handleSubmitMembership = (event) => {
    event.preventDefault();
    if (isFormSubmit()) {
      let error = false;

      if (this.state.is_membership_enable) {
        if (typeof this.state.recurly_program_name === undefined || this.state.recurly_program_name === null || this.state.recurly_program_name.trim() === '') {
          this.setState({
            recurly_program_nameClass: 'simpleInput field-error'
          })
          error = true;
        } else if (this.state.recurly_program_name) {
          this.setState({
            recurly_program_nameClass: 'simpleInput'
          })
        }

        if (this.state.membership_tier === 'single') {
          //
          if (this.state.mothly_membership_type === 'paid') {
            if (typeof this.state.mothly_membership_fees === undefined || this.state.mothly_membership_fees === null || !isPositiveNumber(this.state.mothly_membership_fees, 1)) {
              this.setState({
                mothly_membership_feesClass: 'simpleInput field-error'
              })
              error = true;
            } else {
              this.setState({
                mothly_membership_feesClass: 'simpleInput'
              })
            }
          }


          if (typeof this.state.one_time_membership_setup === undefined || this.state.one_time_membership_setup === null || this.state.one_time_membership_setup === '' || !isPositiveNumber(this.state.one_time_membership_setup)) {
            this.setState({
              one_time_membership_setupClass: 'simpleInput field-error'
            })
            error = true;
          } else if (this.state.one_time_membership_setup) {
            this.setState({
              one_time_membership_setupClass: 'simpleInput'
            })
          }
        }

        if (typeof this.state.thankyou_message === undefined || this.state.thankyou_message === null || this.state.thankyou_message.trim() === '') {
          this.setState({
            thankyou_messageClass: 'simpleTextarea field-error'
          })
          error = true;
        } else if (this.state.thankyou_message) {
          this.setState({
            thankyou_messageClass: 'simpleTextarea'
          })
        }
      }
      if (error) {
        return;
      }

      let formData = {
        is_membership_enable: (this.state.is_membership_enable) ? 1 : 0
      }
      if (this.state.is_membership_enable == 1) {
        formData.recurly_program_name = this.state.recurly_program_name
        formData.membership_tier = this.state.membership_tier
        if (formData.membership_tier === 'single') {
          formData.mothly_membership_type = this.state.mothly_membership_type
          if (formData.mothly_membership_type === 'paid') {
            formData.mothly_membership_fees = this.state.mothly_membership_fees
          }
          formData.one_time_membership_setup = this.state.one_time_membership_setup
        }
        formData.thankyou_message = this.state.thankyou_message
        formData.add_fees_to_client_wallet = (this.state.add_fees_to_client_wallet) ? 1 : 0;
      }
      this.setState({ showLoader: true })
      this.props.updateMembership(formData);
    }
  }


  toggleFlag = (flag) => {
    this.setState({ [flag]: !this.state[flag] })
  }

  showMembershipTypeModal = (membershipTierId) => {
    toggleBodyScroll(true)
    this.setState({ membershipTierId: membershipTierId, showMembershipTypeModal: true })
  }


  addMembershipType = (membershipTierId) => {
    toggleBodyScroll(true)
    this.setState({
      showMembershipTypeModal: true,
      membershipTierId: 0,
      autoProductData: {},
      membershipTypeData: {},
    })
  }

  editMembershipType = (membershipTierId) => {
    if (membershipTierId > 0) {
      this.setState({
        showLoader: true,
        membershipTierId: membershipTierId,
        autoProductData: {},
        membershipTypeData: {},
      })
      this.props.getMembershipMultiTier(membershipTierId)
    }
  }

  activeMembershipType = () => {
    if (this.state.membershipTierId > 0) {
      this.setState({ showLoader: true })
      this.props.changeMembershipMultiTierStatus(this.state.membershipTierId, { active: this.state.isActive })
      //this.resetConfirmation();
    }
  }

  saveMembershipMultiTier = (formData) => {
    this.setState({ showLoader: true })
    this.props.saveMembershipMultiTier(this.state.membershipTierId, formData);
  }

  deleteMembershipType = () => {
    if (this.state.membershipTierId > 0) {
      this.setState({ showLoader: true })
      this.props.deleteMembershipMultiTier(this.state.membershipTierId)
    }
  }

  searchProductByName = (formData) => {
    this.props.searchProductByName(formData);
  }

  hideMembershipTypeModal = (resetState) => {
    toggleBodyScroll(false)
    this.setState(resetState)
  }

  confirmationAction = () => {
    if (this.state.confirmationAction === 'activeMembershipType') {
      this.activeMembershipType();
    } else if (this.state.confirmationAction === 'deleteMembershipType') {
      this.deleteMembershipType();
    } else {
      this.onResetConfirmation({ confirmationAction: '', confirmationMsg: '', showConfirmationModal: false });
    }
  }

  onResetConfirmation = (resetState) => {
    this.setState(resetState)
  }

  render() {
    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <Sidebar />

          {(this.state.showConfirmationModal === true) && <ConfirmationModal showConfirmationModal={this.state.showConfirmationModal} confirmationMsg={this.state.confirmationMsg} confirmationAction={this.confirmationAction} onResetConfirmation={this.onResetConfirmation} />
          }

          {(this.state.showMembershipTypeModal === true) && <MembershipTypeModal showMembershipTypeModal={this.state.showMembershipTypeModal} membershipTierId={this.state.membershipTierId} membershipTypeData={this.state.membershipTypeData} saveMembershipMultiTier={this.saveMembershipMultiTier} autoProductData={this.state.autoProductData} searchProductByName={this.searchProductByName} hideMembershipTypeModal={this.hideMembershipTypeModal} />
          }

          <div className="memberWalletOuter">
            <div className="setting-setion m-b-10">
              <div className="membership-title">{this.state.settingsLang.sidebar_membership_wallet_menu}</div>
            </div>
            <div className="row">
              {(checkIfPermissionAllowed('wallet-settings') === true) &&
                <div className="col-sm-6">
                  <div className="setting-setion">
                    <div className="membershipSectionTitle">{this.state.settingsLang.Patient_Wallet_Settings}
                      {(this.state.isEditWallet === false) && <a onClick={() => this.handleEditWallet()} className="easy-link pull-right no-padding"><i className="fa fa-pencil-alt m-r-5" />{this.state.globalLang.label_edit}</a>}
                    </div>
                    {(this.state.isEditWallet === false) &&
                      <div className="wallet-view-block">
                        <div className="membershipSectionContent">
                          <div><b>{this.state.settingsLang.Patient_Items_in_client_wallet_will_expire_in}</b> {this.state.walletData.wallet_item_expiry} {this.state.settingsLang.settings_days}</div>
                          <div className="m-t-15"><b>{this.state.settingsLang.settings_wallet_dollar_credits_expiry_setting}</b> {this.state.walletData.wallet_dollar_expiry} {this.state.settingsLang.settings_days}</div>
                          <div className="memberPoint m-t-15">
                            {(this.state.walletData.wallet_send_expiry_email === true) && <a><i className="fa fa-check-circle m-r-5" /></a>}
                            {(this.state.walletData.wallet_send_expiry_email === false) && <a><i className="fa fa-circle m-r-5" /></a>}
                            <b>{this.state.settingsLang.settings_send_an_email_to_the_customer_when_a_product_expires}</b> {(this.state.walletData.wallet_send_expiry_email === true) ? this.state.settingsLang.twoFA_enabled : this.state.settingsLang.twoFA_disabled}
                          </div>
                          <div className="memberPoint m-t-15">
                            {(this.state.walletData.wallet_send_expiry_reminder === true) && <a><i className="fa fa-check-circle m-r-5" /></a>}
                            {(this.state.walletData.wallet_send_expiry_reminder === false) && <a><i className="fa fa-circle m-r-5" /></a>}
                            <b>{this.state.settingsLang.settings_send_a_reminder_email_to_the_customer_when_a_product_is_about_to_expire}</b> {(this.state.walletData.wallet_send_expiry_reminder === true) ? this.state.settingsLang.twoFA_enabled : this.state.settingsLang.twoFA_disabled}
                          </div>
                          <div className="row"></div>
                          {(this.state.walletData.wallet_send_expiry_reminder === true) &&
                            <div className="m-t-15">
                              <div><b>{this.state.settingsLang.settings_send_reminder_email}</b> {this.state.walletData.wallet_reminder_days_before} <b>{this.state.settingsLang.settings_days_before_wallet_expiration}</b></div>
                            </div>
                          }
                        </div>
                      </div>
                    }
                    {(this.state.isEditWallet === true) &&
                      <div className="wallet-edit-block">
                        <div className="membershipSectionContent">
                          <div className="simpleField">
                            <div className="simpleLabel">{this.state.settingsLang.Patient_Items_in_client_wallet_will_expire_in}<span className="fieldRequired">*</span></div>
                            <input type="text" className={this.state.wallet_item_expiryClass} placeholder={this.state.settingsLang.pos_days} autoComplete="off" name="wallet_item_expiry" value={this.state.wallet_item_expiry} onChange={this.handleInputChange} />
                          </div>
                          <div className="simpleField">
                            <div className="simpleLabel">{this.state.settingsLang.settings_wallet_dollar_credits_expiry_setting}<span className="fieldRequired">*</span></div>
                            <input type="text" className={this.state.wallet_dollar_expiryClass} placeholder={this.state.settingsLang.pos_days} autoComplete="off" name="wallet_dollar_expiry" value={this.state.wallet_dollar_expiry} onChange={this.handleInputChange} />
                          </div>
                          <div className="simpleField">
                            <div className="setting-custom-switch wallet-switch no-border p-t-0 p-b-0">{this.state.settingsLang.Patient_Product_Expires_Message}
                                <label className="setting-switch pull-right">
                                <input type="checkbox" id="wallet_send_expiry_email" className="setting-custom-switch-input" name="wallet_send_expiry_email" checked={(this.state.wallet_send_expiry_email === true) ? 'checked' : false} onChange={this.handleInputChange} />
                                <span className="setting-slider" />
                              </label>
                            </div>
                          </div>
                          <div className="simpleField">
                            <div className="setting-custom-switch wallet-switch no-border p-t-0 p-b-0">{this.state.settingsLang.Patient_Product_Expire_Reminder_Message}
                              <label className="setting-switch pull-right">
                                <input type="checkbox" id="wallet_send_expiry_reminder" className="setting-custom-switch-input" name="wallet_send_expiry_reminder" checked={(this.state.wallet_send_expiry_reminder === true) ? 'checked' : false} onChange={this.handleInputChange} />
                                <span className="setting-slider" />
                              </label>
                            </div>
                          </div>
                          {(this.state.wallet_send_expiry_reminder === true) &&
                            <div className="simpleField" id="days_before">
                              <div className="new-field-label">{this.state.settingsLang.settings_send_reminder_email}
                                <input id="wallet_reminder_days_before" type="text" className={this.state.wallet_reminder_days_beforeClass} autoComplete="off" name="wallet_reminder_days_before" value={this.state.wallet_reminder_days_before} onChange={this.handleInputChange} />
                                {this.state.settingsLang.settings_days_before_wallet_expiration} <span className="setting-require blue-required">*</span>
                              </div>
                            </div>
                          }

                        </div>

                        <div className="footer-static">
                          <button className="new-blue-btn pull-right" onClick={this.handleSubmitWallet} >{this.state.globalLang.label_save}</button>
                          <button className="new-white-btn pull-right" onClick={() => this.handleCancelWallet()}>{this.state.globalLang.label_cancel}</button>
                        </div>
                      </div>
                    }

                  </div>
                </div>
              }
              <div className={(checkIfPermissionAllowed('wallet-settings') === true) ? "col-sm-6 memberProgram-right" :"col-sm-6"} >
                <div className="setting-setion m-b-15">
                  <div className="membershipSectionTitle">{this.state.settingsLang.Patient_Membership_Program}
                    {(this.state.isEditMemberShip === false) && <a onClick={() => this.handleEditMembership()} className="easy-link pull-right no-padding"><i className="fa fa-pencil-alt m-r-5" />{this.state.globalLang.label_edit}</a>}
                  </div>
                  {(this.state.isEditMemberShip === false) &&
                    <div className="membership-view-block">
                      <div className="membershipSectionContent">
                        <div className="memberPoint">
                          {(this.state.membershipData.is_membership_enable === true) && <a><i className="fa fa-check-circle m-r-5" /></a>}
                          {(this.state.membershipData.is_membership_enable === false) && <a><i className="fa fa-circle m-r-5" /></a>}
                          <b>{this.state.settingsLang.settings_membership}</b> {(this.state.membershipData.is_membership_enable === true) ? this.state.settingsLang.twoFA_enabled : this.state.settingsLang.twoFA_disabled}
                        </div>
                        <div className="row"></div>
                        {(this.state.membershipData.is_membership_enable === true) &&
                          <div className="membership-enabled-block">
                            <div className="m-t-15"><b>{this.state.settingsLang.Patient_PROGRAM_NAME}</b> {this.state.membershipData.recurly_program_name}</div>
                            <div className="m-t-15"><b>{this.state.settingsLang.settings_membership_type}</b> {(this.state.membershipData.membership_tier === 'single') ? this.state.globalLang.label_single : this.state.globalLang.label_multiple}</div>
                            {(this.state.membership_tier === 'single') &&
                              <div className="membership-type-single-block">
                                <div className="m-t-15"><b>{this.state.settingsLang.subscription_type}</b> {(this.state.membershipData.mothly_membership_type === 'paid') ? this.state.settingsLang.setting_paid : this.state.settingsLang.subscription_free}</div>
                                {(this.state.mothly_membership_type === 'paid') &&
                                  <div className="m-t-15"><b>{this.state.settingsLang.Patient_MONTHLY_MEMBERSHIP_FEES}</b> {numberFormat(this.state.membershipData.mothly_membership_fees, 'currency', 2)}</div>
                                }
                                <div className="m-t-15"><b>{this.state.settingsLang.Patient_ONE_TIME_MEMBERSHIP_SETUP_FEES}</b> {numberFormat(this.state.membershipData.one_time_membership_setup, 'currency', 2)}</div>

                              </div>
                            }
                            <div className="m-t-15"><b>{this.state.settingsLang.Patient_THANK_YOU_MESSAGE}</b> {this.state.membershipData.thankyou_message}</div>
                            <div className="memberPoint m-t-15 ">
                              {(this.state.membershipData.add_fees_to_client_wallet === true) && <a><i className="fa fa-check-circle m-r-5" /></a>}
                              {(this.state.membershipData.add_fees_to_client_wallet === false) && <a><i className="fa fa-circle m-r-5" /></a>}
                              <b>{this.state.settingsLang.settings_add_monthly_fees_in_clients_wallet}</b> {(this.state.membershipData.add_fees_to_client_wallet === true) ? this.state.settingsLang.twoFA_enabled : this.state.settingsLang.twoFA_disabled}
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                  {(this.state.isEditMemberShip === true) &&
                    <div className="membership-edit-block">
                      <div className="membershipSectionContent">
                        <div className="simpleField">
                          <div className="setting-custom-switch wallet-switch no-border p-t-0 p-b-0">{(this.state.is_membership_enable) ? this.state.settingsLang.Patient_Membership_Enabled : this.state.settingsLang.Patient_Membership_Disabled}
                            <label className="setting-switch pull-right">
                              <input type="checkbox" id="is_membership_enable" className="setting-custom-switch-input" name="is_membership_enable" checked={(this.state.is_membership_enable === true) ? 'checked' : false} onChange={this.handleInputChange} />
                              <span className="setting-slider" />
                            </label>
                          </div>
                        </div>
                        {(this.state.is_membership_enable === true) &&
                          <div className="membership-enabled-block">
                            <div className="simpleField">
                              <div className="simpleLabel">{this.state.settingsLang.Patient_PROGRAM_NAME}<span className="fieldRequired">*</span></div>
                              <input type="text" className={this.state.recurly_program_nameClass} autoComplete="off" name="recurly_program_name" value={this.state.recurly_program_name} onChange={this.handleInputChange} />
                            </div>
                            <div className="simpleField">
                              <p className="p-text m-b-0">{this.state.settingsLang.settings_membership_type}</p>
                              <div className="no-margin">
                                <div className="basic-checkbox-outer">
                                  <input id="radiobutton3" className="basic-form-checkbox" name="membership_tier" type="radio" value="single" checked={(this.state.membership_tier === 'single') ? 'checked' : false} onChange={this.handleInputChange} />
                                  <label className="basic-form-text" htmlFor="radiobutton3">{this.state.globalLang.label_single}</label>
                                </div>
                                <div className="basic-checkbox-outer">
                                  <input id="radiobutton4" className="basic-form-checkbox" name="membership_tier" type="radio" value="multiple" checked={(this.state.membership_tier === 'multiple') ? 'checked' : false} onChange={this.handleInputChange} />
                                  <label className="basic-form-text" htmlFor="radiobutton4">{this.state.globalLang.label_multiple}</label>
                                </div>
                              </div>
                            </div>


                            {(this.state.membership_tier === 'single') &&
                              <div className="membership-type-single-block">
                                <div className="simpleField">
                                  <p className="p-text m-b-0">{this.state.settingsLang.subscription_type}</p>
                                  <div className="no-margin">
                                    <div className="basic-checkbox-outer">
                                      <input id="radiobutton1" className="basic-form-checkbox" name="mothly_membership_type" type="radio" value="paid" checked={(this.state.mothly_membership_type === 'paid') ? 'checked' : false} onChange={this.handleInputChange} />
                                      <label className="basic-form-text" htmlFor="radiobutton1">{this.state.settingsLang.setting_paid}</label>
                                    </div>
                                    <div className="basic-checkbox-outer">
                                      <input id="radiobutton1" className="basic-form-checkbox" name="mothly_membership_type" type="radio" value="free" checked={(this.state.mothly_membership_type === 'free') ? 'checked' : false} onChange={this.handleInputChange} />
                                      <label className="basic-form-text" htmlFor="radiobutton1">{this.state.settingsLang.subscription_free}</label>
                                    </div>
                                  </div>
                                </div>
                                {(this.state.mothly_membership_type === 'paid') &&
                                  <div className="simpleField">
                                    <div className="simpleLabel">{this.state.settingsLang.Patient_MONTHLY_MEMBERSHIP_FEES}<span className="fieldRequired">*</span></div>
                                    <input type="text" className={this.state.mothly_membership_feesClass} autoComplete="off" name="mothly_membership_fees" value={this.state.mothly_membership_fees} onChange={this.handleInputChange} />
                                  </div>
                                }
                                <div className="simpleField">
                                  <div className="simpleLabel">{this.state.settingsLang.Patient_ONE_TIME_MEMBERSHIP_SETUP_FEES}<span className="fieldRequired">*</span></div>
                                  <input type="text" className={this.state.one_time_membership_setupClass} autoComplete="off" name="one_time_membership_setup" value={this.state.one_time_membership_setup} onChange={this.handleInputChange} />
                                </div>
                              </div>
                            }
                            <div className="simpleField">
                              <div className="simpleLabel">{this.state.settingsLang.Patient_THANK_YOU_MESSAGE}<span className="fieldRequired">*</span></div>
                              <textarea className={this.state.thankyou_messageClass} autoComplete="off" name="thankyou_message" value={this.state.thankyou_message} onChange={this.handleInputChange} />
                            </div>
                            <div className="simpleField">
                              <div className="setting-custom-switch wallet-switch no-border p-t-0 p-b-0">{this.state.settingsLang.patient_do_you_want_to_add_monthly_membership_fees_in_clients_wallet}
                                <label className="setting-switch pull-right">
                                  <input type="checkbox" id="add_fees_to_client_wallet" className="setting-custom-switch-input" name="add_fees_to_client_wallet" checked={(this.state.add_fees_to_client_wallet === true) ? 'checked' : false} onChange={this.handleInputChange} />
                                  <span className="setting-slider" />
                                </label>
                              </div>
                            </div>
                          </div>
                        }
                      </div>

                      <div className="footer-static">
                        <button className="new-blue-btn pull-right" onClick={this.handleSubmitMembership}>{this.state.globalLang.label_save}</button>
                        <button className="new-white-btn pull-right" onClick={() => this.handleCancelMembership()}>{this.state.globalLang.label_cancel}</button>
                      </div>
                    </div>
                  }
                </div>
                {(this.state.is_membership_enable === true && this.state.membership_tier === 'multiple') &&
                  <div className="membership-enabled-block membership-type-multiple-block">
                    <div className="setting-setion">
                      <div className="membershipSectionTitle">{this.state.settingsLang.settings_membership_type}
                        <a onClick={() => this.addMembershipType(0)} className="easy-link pull-right no-padding"><i className="fa fa-plus-circle m-r-5" /> Add new type</a>
                      </div>
                      <div className="membershipSectionContent p-t-10">
                      <div className="table-responsive">
                        <table className="membership-type-table table-min-width">
                          <tbody>
                            {(this.state.membershipTypeList.length > 0) ?
                              this.state.membershipTypeList.map((obj, idx) => {
                                return (
                                  <tr key={'membershipTypeList-' + idx}>
                                    <td className="col-xs-6">{obj.tier_name}</td>
                                    <td className="text-right col-xs-2">
                                      <label className="setting-switch pull-right sm-switch">
                                        <input type="checkbox" name="membership_tier_active" checked={(obj.active === false || obj.active == 0) ? 'checked' : false} className="setting-custom-switch-input" onChange={() => this.setState({ membershipTierId: obj.id, isActive: (obj.active) ? 0 : 1, showConfirmationModal: true, confirmationMsg: (obj.active) ? this.state.settingsLang.membership_type_tier_enable_message : this.state.settingsLang.membership_type_tier_disable_message, confirmationAction: 'activeMembershipType' })} />
                                        <span className="setting-slider " />
                                      </label>
                                    </td>
                                    <td className="text-right col-xs-2"><a onClick={() => this.editMembershipType(obj.id)} className="easy-link pull-right no-padding"><i className="fa fa-pencil-alt m-r-5" />{this.state.globalLang.label_edit}</a></td>
                                    <td className="text-right col-xs-2"><a onClick={() => this.setState({ membershipTierId: obj.id, showConfirmationModal: true, confirmationMsg: this.state.settingsLang.membership_type_tier_delete_message, confirmationAction: 'deleteMembershipType' })} className="easy-link pull-right no-padding"><i className="fa fa-trash-alt m-r-5" />{this.state.globalLang.label_delete}</a></td>
                                  </tr>
                                )
                              })
                              :
                              <tr>
                                <td colSpan={4} className="text-center">{this.state.globalLang.sorry_no_record_found}</td>

                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
          <Loader showLoader={this.state.showLoader} isFullWidth={true} />

        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState = {};
  if (state.MembershipWalletReducer.action === "GET_MEMBERSHIP_WALLET_DATA") {
    if (state.MembershipWalletReducer.data.status != 200) {
      returnState.showLoader = true
      toast.dismiss()
      toast.error(languageData.global[state.MembershipWalletReducer.data.message]);
    } else {
      returnState.membershipWalletData = state.MembershipWalletReducer.data.data;
      returnState.isResetWallet = true
      returnState.isResetMembership = true
      returnState.isResetMembershipType = true
    }
  } else if (state.MembershipWalletReducer.action === "UPDATE_SETTING_WALLET_DATA") {
    if (state.MembershipWalletReducer.data.status != 200) {
      returnState.showLoader = false
      toast.dismiss()
      toast.error(languageData.global[state.MembershipWalletReducer.data.message]);
    } else {
      returnState.membershipWalletData = state.MembershipWalletReducer.data.data;
      returnState.isResetWallet = true
      returnState.isResetMembership = false
      returnState.isResetMembershipType = false
      toast.dismiss()
      toast.success(languageData.global[state.MembershipWalletReducer.data.message]);
    }
  } else if (state.MembershipWalletReducer.action === "UPDATE_SETTING_MEMBERSHIP_DATA") {
    if (state.MembershipWalletReducer.data.status != 200) {
      returnState.showLoader = false
      toast.dismiss()
      toast.error(languageData.global[state.MembershipWalletReducer.data.message]);
    } else {
      returnState.membershipWalletData = state.MembershipWalletReducer.data.data;
      returnState.isResetWallet = false
      returnState.isResetMembership = true
      returnState.isResetMembershipType = false
      toast.dismiss()
      toast.success(languageData.global[state.MembershipWalletReducer.data.message]);
    }
  } else if (state.MembershipWalletReducer.action === "MEMBERSHIP_PRODUCT_SEARCH_LIST") {
    if (state.MembershipWalletReducer.data.status != 200) {
      returnState.showLoader = false
      //returnState.autoProductData = [];//state.MembershipWalletReducer.data.data;
    } else {
      returnState.autoProductData = state.MembershipWalletReducer.data.data;
    }
  } else if (state.MembershipWalletReducer.action === "GET_MEMBERSHIP_MULTI_TIER") {
    if (state.MembershipWalletReducer.data.status != 200) {
      returnState.showLoader = false
      toast.dismiss()
      toast.error(languageData.global[state.MembershipWalletReducer.data.message]);
    } else {
      returnState.membershipTypeData = state.MembershipWalletReducer.data.data;
    }
  } else if (state.MembershipWalletReducer.action === "SAVE_MEMBERSHIP_MULTI_TIER") {
    if (state.MembershipWalletReducer.data.status != 200) {
      returnState.showLoader = false
      toast.error(languageData.global[state.MembershipWalletReducer.data.message]);
    } else {
      returnState.membershipWalletData = state.MembershipWalletReducer.data.data;
      returnState.isResetWallet = false
      returnState.isResetMembership = false
      returnState.isResetMembershipType = true
      toast.dismiss()
      toast.success(languageData.global[state.MembershipWalletReducer.data.message]);
    }
  } else if (state.MembershipWalletReducer.action === "CHANGE_MEMBERSHIP_MULTI_TIER_STATUS") {
    if (state.MembershipWalletReducer.data.status != 200) {
      returnState.showLoader = false
      toast.dismiss()
      toast.error(languageData.global[state.MembershipWalletReducer.data.message]);
    } else {
      returnState.membershipWalletData = state.MembershipWalletReducer.data.data;
      returnState.isResetWallet = false
      returnState.isResetMembership = false
      returnState.isResetMembershipType = true
      toast.dismiss()
      toast.success(languageData.global[state.MembershipWalletReducer.data.message]);
    }
  } else if (state.MembershipWalletReducer.action === "DELETE_MEMBERSHIP_MULTI_TIER") {
    if (state.MembershipWalletReducer.data.status != 200) {
      returnState.showLoader = false
      toast.dismiss()
      toast.error(languageData.global[state.MembershipWalletReducer.data.message]);
    } else {
      returnState.membershipWalletData = state.MembershipWalletReducer.data.data;
      returnState.isResetWallet = false
      returnState.isResetMembership = false
      returnState.isResetMembershipType = true
      toast.dismiss()
      toast.success(languageData.global[state.MembershipWalletReducer.data.message]);
    }
  }
  return returnState;
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    getMembershipWallet: getMembershipWallet,
    updateWallet: updateWallet,
    updateMembership: updateMembership,
    emptyMembershipWallet: emptyMembershipWallet,
    searchProductByName: searchProductByName,
    getMembershipMultiTier: getMembershipMultiTier,
    saveMembershipMultiTier: saveMembershipMultiTier,
    changeMembershipMultiTierStatus: changeMembershipMultiTierStatus,
    deleteMembershipMultiTier: deleteMembershipMultiTier,

  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MembershipWallet);
