import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getCashDrawer, changeDrawerLocation, viewOpenedDrawer, updateCashDrawer, getOpenCashDrawer, openCashDrawer, closeCashDrawer, cashInDrawer, cashOutDrawer, bankDropDrawer, cashRegisterLogs, cashDrawerHistory, editClosedDrawer, addEditPopupReceipt, exportEmptyData } from '../../../Actions/Sales/salesActions.js';
import { ToastContainer, toast } from "react-toastify";
import { Link } from 'react-router-dom';
import SalesHeader from '../Common/SalesHeader.js';
import { numberFormat, isNumber, formatBytes, capitalizeFirstLetter, showFormattedDate, displayName, checkIfPermissionAllowed, getUser, isInt, autoScrolling } from '../../../Utils/services.js';
import picClose from '../../../images/close.png'
import defLogo from '../../../images/file.png'
import axios from 'axios';
import config from '../../../config';
import { format } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import DrawerFilter from '../Common/DrawerFilter.js';

const formatType = 'YYYY-MM-DD';

const dateFormat = (date) => {
  return moment(date).format(formatType);
}

class CashDrawer extends Component {

  constructor(props) {
    super(props);
    window.scrollTo(0, 0)
    const userData = JSON.parse(localStorage.getItem('userData'));
    const languageData = JSON.parse(localStorage.getItem('languageData'));

    this.state = {
      stateAction       : 'openDrawer',
      isInViewMode      : true,
      dataChanged       : false,
      hundredClass      : "setting-input-box dollar_number",
      fiftyClass        : "setting-input-box dollar_number",
      twentyClass       : "setting-input-box dollar_number",
      tenClass          : "setting-input-box dollar_number",
      fiveClass         : "setting-input-box dollar_number",
      oneClass          : "setting-input-box dollar_number",
      quarterClass      : "setting-input-box dollar_number",
      dimeClass         : "setting-input-box dollar_number",
      nickleClass       : "setting-input-box dollar_number",
      pennyClass        : "setting-input-box dollar_number",
      dollar_100        : '',
      dollar_50         : '',
      dollar_20         : '',
      dollar_10         : '',
      dollar_5          : '',
      dollar_1          : '',
      quarters          : '',
      dimes             : '',
      nickels           : '',
      pennies           : '',
      cash_in_amount    : '',
      cashInAmntClass   : 'setting-input-box cashIN',
      cash_out_amount   : '',
      cashOutAmntClass  : 'setting-input-box cashOut',
      showLoader        : false,
      bankdrop_amount   : '',
      bankdropAmntClass : 'setting-input-box bankDrop',
      bankDropNoteClass : 'setting-textarea-box',
      reason_note       : '',
      showAlreadyOpenedPopup : false,
      modalMessage           : '',
      openClicked            : false,
      showClosingPopup       : false,
      globalLang: languageData.global,
      salesLang: languageData.sales,
      showRegisterLog        : false,
      showDrawerHistory      : false,

      sectionOneClass     : "juvly-container border-top",
      sectionTwoClass     : "juvly-container no-padding-top",
      sectionThreeClass   : "juvly-container border-top",
      sectionFourClass    : "table-responsive",
      editSectionClass    : "juvly-container no-padding-top no-display",
      showDatePicker      : false,
      history_filter_date : dateFormat(new Date()),
      page                : 1,
      pagesize            : 20,
      next_page_url       : '',
      startFresh          : true,
      locationArray       : [],
      selectedLocationIdList:[],
      overrideChildState  : false,
      registerListData    : [],
      startFresh          : true,
      sel_clinic_id       : [],
      sel_action_type     : [],
      historyReasonClass  : "setting-textarea-box reason",
      hisNoDataClass      : "no-record",
      showAddReceiptModal : false,
      showViewReceiptModal: false,
      updateType          : '',
      updateAction        : '',
      popupBankDropNoteClass: 'setting-textarea-box',
      popupImgSrc         : '',
      popupNote           : ''
    }

    this.props.exportEmptyData({});
  }

  handleInputChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;

     if ( target && target.type === 'file' ) {
       const allowedTypes  = ["image/png", "image/PNG", "image/jpg", "image/JPG", "image/jpeg", "image/JPEG", "image/gif","image/GIF"];

       if ( target.files && target.files[0] && allowedTypes.indexOf(target.files[0].type) > -1 ) {
         this.handleFileChosen(target.files[0], target)
       } else {
         if ( target.files[0] ) {
           toast.error('This file type is not allowed');
         }
       }
     } else {
       this.setState({[event.target.name]: value , dataChanged : true});
     }

     if ( event.target.name === 'clinic_id' ) {
       this.fetchDrawerByClinic(value)
     }

     if (event.target.name === 'history_filter_clinic' ) {
       this.handleClinicChange(value)
     }
  }

  selectAction = (action, classText) => {
    classText = classText || '';

    if ( classText && classText.indexOf('disable-submenu') > -1 ) {
      return false;
    }
    this.setState({
      stateAction       : action,
      openClicked       : (action && action === 'openDrawer' && classText.length > 1) ? true: false,
      dataChanged       : false,
      hundredClass      : "setting-input-box dollar_number",
      fiftyClass        : "setting-input-box dollar_number",
      twentyClass       : "setting-input-box dollar_number",
      tenClass          : "setting-input-box dollar_number",
      fiveClass         : "setting-input-box dollar_number",
      oneClass          : "setting-input-box dollar_number",
      quarterClass      : "setting-input-box dollar_number",
      dimeClass         : "setting-input-box dollar_number",
      nickleClass       : "setting-input-box dollar_number",
      pennyClass        : "setting-input-box dollar_number",
      dollar_100        : '',
      dollar_50         : '',
      dollar_20         : '',
      dollar_10         : '',
      dollar_5          : '',
      dollar_1          : '',
      quarters          : '',
      dimes             : '',
      nickels           : '',
      pennies           : '',
      cash_in_amount    : '',
      cashInAmntClass   : 'setting-input-box cashIN',
      cash_out_amount   : '',
      cashOutAmntClass  : 'setting-input-box cashOut',
      showLoader        : (action && action === 'openDrawer' && classText.length > 1) ? true: false,
      bankdrop_amount   : '',
      bankdropAmntClass : 'setting-input-box bankDrop',
      bankDropNoteClass : 'setting-textarea-box',
      reason_note       : '',
      cashout_receipt_document              : '',
      cashout_receipt_document_src          : '',
      cashout_receipt_document_size         : '',
      cashout_receipt_document_thumbnail    : '',
      bankdrop_receipt_document             : '',
      bankdrop_receipt_document_src         : '',
      bankdrop_receipt_document_size        : '',
      bankdrop_receipt_document_thumbnail   : '',
      historyReasonClass                    : "setting-textarea-box reason"
    })

    if ( action && action === 'openDrawer' && classText.length > 1 ) {
      this.props.getOpenCashDrawer(this.state.clinic_id);
    }
  }

  handleDrawerClose = (e) => {
    e.preventDefault();

    let totalFilled   = 0;
    let totalErrors   = 0;
    let hundredError  = false;
    let fiftyError    = false;
    let twentyError   = false;
    let tenError      = false;
    let fiveError     = false;
    let oneError      = false;
    let quarterError  = false;
    let dimeError     = false;
    let nickleError   = false;
    let pennyError    = false;

    if ( !isNumber(this.state.dollar_100) ) {
      hundredError = true;
      this.setState({hundredClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      hundredError = false;
      this.setState({hundredClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_50) ) {
      fiftyError = true
      this.setState({fiftyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      fiftyError = false
      this.setState({fiftyClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_20) ) {
      twentyError = true;
      this.setState({twentyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      twentyError = false;
      this.setState({twentyClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_10) ) {
      tenError = true;
      this.setState({tenClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      tenError = false;
      this.setState({tenClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_5) ) {
      fiveError = true;
      this.setState({fiveClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      fiveError = false;
      this.setState({fiveClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_1) ) {
      oneError = true;
      this.setState({oneClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      oneError = false;
      this.setState({oneClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.quarters) ) {
      quarterError = true;
      this.setState({quarterClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      quarterError = false;
      this.setState({quarterClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dimes) ) {
      dimeError = true;
      this.setState({dimeClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      dimeError = false;
      this.setState({dimeClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.nickels) ) {
      nickleError = true;
      this.setState({nickleClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      nickleError = false;
      this.setState({nickleClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.pennies) ) {
      pennyError = true;
      this.setState({pennyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      pennyError = false;
      this.setState({pennyClass: 'setting-input-box dollar_number'})
    }


    if ( !isInt(this.state.dollar_100) ) {
      hundredError = true;
      this.setState({hundredClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      hundredError = false;
      this.setState({hundredClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_50) ) {
      fiftyError = true
      this.setState({fiftyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      fiftyError = false
      this.setState({fiftyClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_20) ) {
      twentyError = true;
      this.setState({twentyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      twentyError = false;
      this.setState({twentyClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_10) ) {
      tenError = true;
      this.setState({tenClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      tenError = false;
      this.setState({tenClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_5) ) {
      fiveError = true;
      this.setState({fiveClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      fiveError = false;
      this.setState({fiveClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_1) ) {
      oneError = true;
      this.setState({oneClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      oneError = false;
      this.setState({oneClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.quarters) ) {
      quarterError = true;
      this.setState({quarterClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      quarterError = false;
      this.setState({quarterClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dimes) ) {
      dimeError = true;
      this.setState({dimeClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      dimeError = false;
      this.setState({dimeClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.nickels) ) {
      nickleError = true;
      this.setState({nickleClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      nickleError = false;
      this.setState({nickleClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.pennies) ) {
      pennyError = true;
      this.setState({pennyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      pennyError = false;
      this.setState({pennyClass: 'setting-input-box dollar_number'})
    }

    toast.dismiss();

    if ( totalFilled === 0 ) {
      toast.error("You must enter atleast one field");
    }

    if ( totalFilled > 0 ) {
      let isErrorFree = true;

      if ( this.state.dollar_100 === '' || !hundredError ) {
        this.setState({hundredClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_50 === '' || !fiftyError ) {
        this.setState({fiftyClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_20 === '' || !twentyError ) {
        this.setState({twentyClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_10 === '' || !tenError ) {
        this.setState({tenClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_5 === '' || !fiveError ) {
        this.setState({fiveClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_1 === '' || !oneError ) {
        this.setState({oneClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.quarters === '' || !quarterError ) {
        this.setState({quarterClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dimes === '' || !dimeError ) {
        this.setState({dimeClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.nickels === '' || !nickleError ) {
        this.setState({nickleClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.pennies === '' || !pennyError ) {
        this.setState({pennyClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if (isErrorFree) {
        this.setState({showClosingPopup: true})
      }
    }
  }

  handleCashIn = (e) => {
    e.preventDefault();

    if ( !isNumber(this.state.cash_in_amount) || !this.state.cash_in_amount ) {
      this.setState({cashInAmntClass: 'setting-input-box cashIN setting-input-box-invalid'})
    } else {
      this.setState({cashInAmntClass: 'setting-input-box cashIN'})
    }

    if ( this.state.cash_in_amount && isNumber(this.state.cash_in_amount) ) {
      let formData = {
        drawer_id       : this.state.cashDrawerData.cash_drawer_data.id,
        total_amount    : this.state.cash_in_amount
      }

      this.setState({showLoader: true})
      this.props.cashInDrawer(formData);
    }
  }

  handleCashOut = (e) => {
    e.preventDefault();

    let maxValue = (this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_data && this.state.cashDrawerData.cash_drawer_data.current_balance) ? this.state.cashDrawerData.cash_drawer_data.current_balance : 0

    if ( !isNumber(this.state.cash_out_amount) || !this.state.cash_out_amount ) {
      this.setState({cashOutAmntClass: 'setting-input-box cashOut setting-input-box-invalid'})
    } else {
      toast.dismiss();

      if ( parseFloat(this.state.cash_out_amount) > parseFloat(maxValue) ) {
        toast.error("Value can not be more than max value");
        this.setState({cashOutAmntClass: 'setting-input-box cashOut setting-input-box-invalid'})
      } else {
        this.setState({cashOutAmntClass: 'setting-input-box cashOut'})
      }
    }

    if ( this.state.cash_out_amount && isNumber(this.state.cash_out_amount) && (parseFloat(this.state.cash_out_amount) <= parseFloat(maxValue)) ) {
      let formData = {
        drawer_id       : this.state.cashDrawerData.cash_drawer_data.id,
        total_amount    : this.state.cash_out_amount,
        receipt_document: this.state.cashout_receipt_document
      }

      if ( !this.state.cashout_receipt_document ) {
        delete formData.receipt_document
      }

      this.setState({showLoader: true})
      this.props.cashOutDrawer(formData);
    }
  }

  handleUpload = (targetName) => {
    let uploadtype = '';

    uploadtype = 'drawer_receipts'
    const data = new FormData()
    data.append('file', this.state.file, this.state.file.name)
    let endpoint = config.API_URL + `media/upload?upload_type=${uploadtype}`;

    axios.post(endpoint, data).then(res => {

      let name      = this.state.target.name
      this.setState({[name]: res.data.data.file_name, showLoader: false});
    }).catch(error => {
      this.setState({showLoader: false});
      toast.error(error.response.data.message);
    })
  }

  handleFileRead = (e) => {
    const content     = this.state.fileReader.result;
    let name      = this.state.target.name + '_thumbnail'
    let src       = this.state.target.name + '_src'
    let size      = this.state.target.name + '_size'

    let fileSize  = formatBytes(this.state.file.size, 1)
    this.setState({[name]: this.state.file.name, [size]: fileSize, [src] : this.state.fileReader.result, showLoader: true});

    this.handleUpload(this.state.target.name)
  }

  handleFileChosen = (file, target) => {
    this.state.fileReader           = new FileReader();
    this.state.fileReader.onloadend = this.handleFileRead;
    this.state.fileReader.readAsDataURL(file);
    this.state.file = file
    this.state.target = target
  }

  handleBankDrop = (e) => {
    e.preventDefault();

    let maxValue = (this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_data && this.state.cashDrawerData.cash_drawer_data.current_balance) ? this.state.cashDrawerData.cash_drawer_data.current_balance : 0

    if ( !isNumber(this.state.bankdrop_amount) || !this.state.bankdrop_amount ) {
      this.setState({bankdropAmntClass: 'setting-input-box cashOut setting-input-box-invalid'})
    } else {
      toast.dismiss();

      if ( parseFloat(this.state.bankdrop_amount) > parseFloat(maxValue) ) {
        toast.error("Value can not be more than max value");
        this.setState({bankdropAmntClass: 'setting-input-box cashOut setting-input-box-invalid'})
      } else {
        this.setState({bankdropAmntClass: 'setting-input-box cashOut'})
      }
    }

    // if ( this.state.reason_note.trim() === '' ) {
    //   this.setState({bankDropNoteClass: 'setting-textarea-box setting-input-box-invalid'})
    // } else {
    //   this.setState({bankDropNoteClass: 'setting-textarea-box'})
    // }

    if ( this.state.bankdrop_amount && isNumber(this.state.bankdrop_amount) && (parseFloat(this.state.bankdrop_amount) <= parseFloat(maxValue)) ) {

      let formData = {
        drawer_id       : this.state.cashDrawerData.cash_drawer_data.id,
        total_amount    : this.state.bankdrop_amount,
        receipt_document: this.state.bankdrop_receipt_document,
        reason_note     : this.state.reason_note
      }

      if ( !this.state.bankdrop_receipt_document ) {
        delete formData.receipt_document
      }

      if ( !this.state.reason_note ) {
        delete formData.reason_note
      }

      this.setState({showLoader: true})
      this.props.bankDropDrawer(formData);
    }
  }

  componentDidMount = () => {
    document.addEventListener('click', this.handleDatePickerClick, false);
    this.setState({showLoader: true})
    this.props.getCashDrawer();
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleDatePickerClick, false);
    this.props.exportEmptyData({});
  }

  static getDerivedStateFromProps = (props, state) => {
    if ( props.cashDrawerData !== undefined && props.cashDrawerData.status === 200 && props.cashDrawerData.data !== state.cashDrawerData ) {
       return {
         cashDrawerData     : props.cashDrawerData.data,
         showLoader         : false,
         clinic_id          : 0
       }

     } else if ( props.cashDrawerData !== undefined && props.cashDrawerData.status !== 200 && props.cashDrawerData.data !== state.cashDrawerData ) {
       return {
         cashDrawerData     : props.cashDrawerData.data,
         showLoader         : false,
         clinic_id          : 0
       }
     }

     if ( props.changeLocationData !== undefined && props.changeLocationData.status === 200 && props.changeLocationData.data !== state.changeLocationData ) {
        return {
          changeLocationData     : props.changeLocationData.data,
          showLoader             : false,
          cashDrawerData         : props.changeLocationData.data,
        }

      } else if ( props.changeLocationData !== undefined && props.changeLocationData.status !== 200 && props.changeLocationData.data !== state.changeLocationData ) {
        if ( props.changeLocationData.status === 101 ) {
          return {
            changeLocationData     : props.changeLocationData.data,
            showLoader             : false,
            showAlreadyOpenedPopup : true,
            modalMessage           : props.changeLocationData.message,
            cashDrawerData         : props.changeLocationData.data,
          }
        } else {
          return {
            changeLocationData     : props.changeLocationData.data,
            showLoader             : false,
            showAlreadyOpenedPopup : false,
            modalMessage           : '',
            cashDrawerData         : props.changeLocationData.data,
          }
        }
      }

      if ( props.viewOpenedData !== undefined && props.viewOpenedData.status === 200 && props.viewOpenedData.data !== state.viewOpenedData ) {
         return {
           cashDrawerData     : props.viewOpenedData.data,
           showLoader         : false,
         }

       } else if ( props.viewOpenedData !== undefined && props.viewOpenedData.status !== 200 && props.viewOpenedData.data !== state.viewOpenedData ) {
         return {
           cashDrawerData     : props.cashDrawerData.data,
           showLoader         : false,
         }
       }

      if ( props.updateDrawerData !== undefined && props.updateDrawerData.status === 200 && props.updateDrawerData.data !== state.updateDrawerData ) {
         return {
           updateDrawerData   : props.updateDrawerData.data,
           showLoader         : false,
           updateDrawerStaus  : props.updateDrawerData.data,
         }

       } else if ( props.updateDrawerData !== undefined && props.updateDrawerData.status !== 200 && props.updateDrawerData.data !== state.updateDrawerData ) {
         return {
           updateDrawerData   : props.updateDrawerData.data,
           showLoader         : false,
           updateDrawerStaus  : ''
         }
       }

       if ( props.getOpenCashDrawerData !== undefined && props.getOpenCashDrawerData.status === 200 && props.getOpenCashDrawerData.data !== state.getOpenData ) {
          return {
            getOpenData        : props.getOpenCashDrawerData.data,
            showLoader         : false
          }

        } else if ( props.getOpenCashDrawerData !== undefined && props.getOpenCashDrawerData.status !== 200 && props.getOpenCashDrawerData.data !== state.getOpenData ) {
          return {
            getOpenData        : props.getOpenCashDrawerData.data,
            showLoader         : false,
            openClicked        : false
          }
        }

        if ( props.postOpenCashDrawerData !== undefined && props.postOpenCashDrawerData.status === 200 && props.postOpenCashDrawerData.data !== state.postOpenData ) {
           return {
             postOpenData       : props.postOpenCashDrawerData.data,
             showLoader         : false,
             postOpenStatus     : props.postOpenCashDrawerData.data,
           }

         } else if ( props.postOpenCashDrawerData !== undefined && props.postOpenCashDrawerData.status !== 200 && props.postOpenCashDrawerData.data !== state.postOpenData ) {
           return {
             postOpenData       : props.postOpenCashDrawerData.data,
             showLoader         : false,
             postOpenStatus     : ''
           }
         }

         if ( props.closeDrawerData !== undefined && props.closeDrawerData.status === 200 && props.closeDrawerData.data !== state.closeDrawerData ) {
            return {
              closeDrawerData    : props.closeDrawerData.data,
              showLoader         : false,
              closeStatus        : props.closeDrawerData.data,
            }

          } else if ( props.closeDrawerData !== undefined && props.closeDrawerData.status !== 200 && props.closeDrawerData.data !== state.closeDrawerData ) {
            return {
              closeDrawerData    : props.closeDrawerData.data,
              showLoader         : false,
              closeStatus        : ''
            }
          }

        if ( props.cashInDrawerData !== undefined && props.cashInDrawerData.status === 200 && props.cashInDrawerData.data !== state.cashInDrawerData ) {
           return {
             cashInDrawerData   : props.cashInDrawerData.data,
             showLoader         : false,
             stateAction        : 'openDrawer',
             cashInStatus       : props.cashInDrawerData.data
           }

         } else if ( props.cashInDrawerData !== undefined && props.cashInDrawerData.status !== 200 && props.cashInDrawerData.data !== state.cashInDrawerData ) {
           return {
             cashInDrawerData   : props.cashInDrawerData.data,
             showLoader         : false,
             cashInStatus       : ''
           }
         }

         if ( props.cashOutDrawerData !== undefined && props.cashOutDrawerData.status === 200 && props.cashOutDrawerData.data !== state.cashOutDrawerData ) {
            return {
              cashOutDrawerData  : props.cashOutDrawerData.data,
              showLoader         : false,
              stateAction        : 'openDrawer',
              cashOutStatus      : props.cashOutDrawerData.data
            }

          } else if ( props.cashOutDrawerData !== undefined && props.cashOutDrawerData.status !== 200 && props.cashOutDrawerData.data !== state.cashOutDrawerData ) {
            return {
              cashOutDrawerData  : props.cashOutDrawerData.data,
              showLoader         : false,
              cashOutStatus      : ''
            }
          }

          if ( props.bankDropDrawerData !== undefined && props.bankDropDrawerData.status === 200 && props.bankDropDrawerData.data !== state.bankDropDrawerData ) {
             return {
               bankDropDrawerData : props.bankDropDrawerData.data,
               showLoader         : false,
               stateAction        : 'openDrawer',
               bankDropStatus     : props.bankDropDrawerData.data
             }

           } else if ( props.bankDropDrawerData !== undefined && props.bankDropDrawerData.status !== 200 && props.bankDropDrawerData.data !== state.bankDropDrawerData ) {
             return {
               bankDropDrawerData : props.bankDropDrawerData.data,
               showLoader         : false,
               bankDropStatus     : ''
             }
           }

       if ( props.registerLogData !== undefined && props.registerLogData.status === 200 && props.registerLogData.data !== state.registerLogData && props.registerLogData.data.register_log.next_page_url !== state.next_page_url ) {
         let returnState = {};

         if ( state.next_page_url === null ) {
           autoScrolling(false)
           return (returnState.next_page_url = null);
         }
         if ( state.registerListData.length === 0 && state.startFresh === true ) {
           returnState.registerLogData = props.registerLogData.data;

           if ( props.registerLogData.data.register_log.next_page_url !== null ) {
             returnState.page          = state.page + 1;
           } else {
             returnState.next_page_url = props.registerLogData.data.register_log.next_page_url;
           }
           returnState.startFresh       = false;
           returnState.showLoader       = false;
           returnState.showRegisterLog  = true;
           returnState.showLoadingText  = false;
           returnState.registerListData = props.registerLogData.data.register_log.data;
         } else if ( state.registerLogData !== props.registerLogData.data && state.registerListData.length !== 0 ) {
           returnState.registerListData = [...state.registerListData , ...props.registerLogData.data.register_log.data];
           returnState.registerLogData  = props.registerLogData.data;
           returnState.next_page_url    = props.registerLogData.data.register_log.next_page_url;
           returnState.showLoader       = false;
           returnState.page             = state.page + 1;
           returnState.showLoadingText  = false;
         }
         autoScrolling(false)
         return returnState;
        } else if ( props.registerLogData !== undefined && props.registerLogData.status !== 200 && props.registerLogData.data !== state.registerLogData ) {
          autoScrolling(false)
          return {
            registerLogData    : props.registerLogData.data,
            showLoader         : false,
            next_page_url      : null
          }
        }
      if ( props.drawerHistoryData !== undefined && props.drawerHistoryData.status === 200 && props.drawerHistoryData.data !== state.drawerHistoryData ) {
         return {
           drawerHistoryData   : props.drawerHistoryData.data,
           drawerHistorysData  : props.drawerHistoryData.data,
           showLoader          : false,
           showDrawerHistory   : true,
           //history_filter_date : dateFormat(new Date()),
           //selected_date       : dateFormat(new Date()),

           sectionTwoClass     : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.today_transactions && props.drawerHistoryData.data.today_transactions.length > 0) ? "juvly-container no-padding-top" : "juvly-container no-padding-top no-display",

           sectionThreeClass   : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.today_transactions && props.drawerHistoryData.data.today_transactions.length > 0) ? "juvly-container border-top" : "juvly-container border-top no-display",

           sectionFourClass    : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.today_transactions && props.drawerHistoryData.data.today_transactions.length > 0) ? "table-responsive" : "table-responsive no-display",

           editSectionClass    : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.today_transactions && props.drawerHistoryData.data.today_transactions.length > 0) ? "juvly-container no-padding-top no-display" : "juvly-container no-padding-top no-display",

           hisNoDataClass      : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.today_transactions && props.drawerHistoryData.data.today_transactions.length > 0) ? "no-display" : "no-record",

           history_filter_clinic : (state.dataChanged && state.history_filter_clinic) ? state.history_filter_clinic : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.cash_drawer) && props.drawerHistoryData.data.drawer.cash_drawer.clinic_id,

           history_filter_date  : (state.dataChanged && state.history_filter_date) ? state.history_filter_date : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.cash_drawer) && dateFormat(props.drawerHistoryData.data.drawer.cash_drawer.opened_at),

           dollar_100          : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.dollar_100 > 0) ? props.drawerHistoryData.data.drawer.dollar_100 : 0,
           dollar_50           : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.dollar_50 > 0) ? props.drawerHistoryData.data.drawer.dollar_50 : 0,
           dollar_20           : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.dollar_20 > 0) ? props.drawerHistoryData.data.drawer.dollar_20 : 0,
           dollar_10           : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.dollar_10 > 0) ? props.drawerHistoryData.data.drawer.dollar_10 : 0,
           dollar_5            : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.dollar_5 > 0) ? props.drawerHistoryData.data.drawer.dollar_5 : 0,
           dollar_1            : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.dollar_1 > 0) ? props.drawerHistoryData.data.drawer.dollar_1 : 0,
           quarters            : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.quarters > 0) ? props.drawerHistoryData.data.drawer.quarters : 0,
           dimes               : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.dimes > 0) ? props.drawerHistoryData.data.drawer.dimes : 0,
           nickels             : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.nickels > 0) ? props.drawerHistoryData.data.drawer.nickels : 0,
           pennies             : (props.drawerHistoryData.data && props.drawerHistoryData.data.drawer && props.drawerHistoryData.data.drawer.pennies > 0) ? props.drawerHistoryData.data.drawer.pennies : 0,
         }

       } else if ( props.drawerHistoryData !== undefined && props.drawerHistoryData.status !== 200 && props.drawerHistoryData.data !== state.drawerHistoryData ) {
         return {
           drawerHistoryData  : props.drawerHistoryData.data,
           drawerHistorysData : props.drawerHistoryData.data,
           showLoader         : false,
         }
       }

       if ( props.editClosedData !== undefined && props.editClosedData.status === 200 && props.editClosedData.data !== state.editClosedData ) {
          return {
            editClosedData     : props.editClosedData.data,
            showLoader         : false,
            editClosedStatus   : props.editClosedData.data,
            showDrawerHistory  : false
          }

        } else if ( props.editClosedData !== undefined && props.editClosedData.status !== 200 && props.editClosedData.data !== state.editClosedData ) {
          return {
            editClosedData     : props.editClosedData.data,
            showLoader         : false,
            editClosedStatus   : ''
          }
        }

        if ( props.popupReceiptData !== undefined && props.popupReceiptData.status === 200 && props.popupReceiptData.data !== state.popupReceiptData ) {
           return {
             popupReceiptData                      : props.popupReceiptData.data,
             popupReceiptStatus                    : props.popupReceiptData.data,
             showAddReceiptModal                   : false,
             showViewReceiptModal                  : false,
             showViewEditReceiptModal              : false,
             cashout_receipt_document              : '',
             cashout_receipt_document_src          : '',
             cashout_receipt_document_size         : '',
             cashout_receipt_document_thumbnail    : '',
             bankdrop_receipt_document             : '',
             bankdrop_receipt_document_src         : '',
             bankdrop_receipt_document_size        : '',
             bankdrop_receipt_document_thumbnail   : '',
             popupBankDropNoteClass                : 'setting-textarea-box',
             transID                               : null,
             popup_reason_note                     : '',
             page                                  : 1,
             popupImgSrc                           : '',
             popupNote                             : '',
             transUserID                           : ''
           }
         } else if ( props.popupReceiptData !== undefined && props.popupReceiptData.status !== 200 && props.popupReceiptData.data !== state.popupReceiptData ) {
           return {
             popupReceiptData   : props.popupReceiptData.data,
             showLoader         : false,
             popupReceiptStatus : ''
           }
         }

     return null
  }

  fetchDrawerByClinic = (value) => {
    if ( value && value > 0 ) {
      this.setState({showLoader: true})
      this.props.changeDrawerLocation(value)
    }
  }

  handleModalAction = () => {
    this.setState({showAlreadyOpenedPopup: false, modalMessage: "", showLoader: true})
    this.props.updateCashDrawer(this.state.clinic_id);
  }

  dismissAlreadyOpenedPopup = () => {
    if ( this.state.clinic_id && this.state.clinic_id > 0 ) {
      this.setState({showLoader: true})
      this.props.viewOpenedDrawer(this.state.clinic_id)
    }
    this.setState({showAlreadyOpenedPopup: false, modalMessage: ""})
  }

  showAction = (action) => {
    let returnText = ''

    if ( action === 'cash_in' ) {
      returnText = this.state.salesLang.sales_cash_in
    } else if ( action === 'cash_out' ) {
      returnText = this.state.salesLang.sales_cash_out
    } else if ( action === 'bank_drop' ) {
      returnText = this.state.salesLang.sales_bank_drop
    } else if ( action === 'open' ) {
      returnText = this.state.globalLang.label_open
    } else if ( action === 'close' ) {
      returnText = this.state.globalLang.label_close
    } else if ( action === 'close_edit' ) {
      returnText = this.state.salesLang.sales_close_edit
    }

    return returnText
  }

  returnAction = (obj) => {
    let reasonNote = '';

    if ( obj.action === 'close_edit' ) {
      reasonNote = obj.reason_note
    }

    if ( obj && (obj.action === 'bank_drop' || obj.action === 'cash_out')) {
      if ((obj.receipt_document !== '' && obj.receipt_document !== null) || (obj.reason_note !== '' && obj.reason_note !== null)) {
        return (
          <a onClick={() => this.viewReceipt(obj)} className="easy-link">{this.state.salesLang.sales_view_receipt}</a>
        )
      } else if (obj.user_id === this.getLoggedInUserData()) {
        return (
          <a onClick={() => this.addReceipt(obj)} className="easy-link">{this.state.salesLang.sales_add_receipt}</a>
        )
      }
    }
    return reasonNote
  }

  viewReceipt = (obj) => {
    let updateType    = 'today';
    let updateAction  = (obj.action && obj.action === 'cash_out') ? 'cashout' : 'bankdrop';

    if ( this.state.showRegisterLog ) {
      updateType = 'logs'
    }

    if ( this.state.showDrawerHistory ) {
      updateType = 'history'
    }

    this.setState({showViewReceiptModal: true, updateType: updateType, updateAction: updateAction, transID: obj.id, popupImgSrc: obj.receipt_document, popupNote: obj.reason_note, transUserID: obj.user_id})
  }

  addReceipt = (obj) => {
    let updateType    = 'today';
    let updateAction  = (obj.action && obj.action === 'cash_out') ? 'cashout' : 'bankdrop';

    if ( this.state.showRegisterLog ) {
      updateType = 'logs'
    }

    if ( this.state.showDrawerHistory ) {
      updateType = 'history'
    }

    this.setState({showAddReceiptModal: true, updateType: updateType, updateAction: updateAction, popupBankDropNoteClass: 'setting-textarea-box', transID: obj.id, popup_reason_note: ''})
  }

  editPopupData = () => {
    let imageName = (this.state.updateAction && this.state.updateAction === "bankdrop") ? "bankdrop_receipt_document_src" : "cashout_receipt_document_src"

    this.setState({showViewReceiptModal: false, showAddReceiptModal: true, [imageName]: this.state.popupImgSrc, "popup_reason_note" : this.state.popupNote})
  }

  closeReceiptPopup = () => {
    this.setState({
      showAddReceiptModal                   : false,
      showViewReceiptModal                  : false,
      showViewEditReceiptModal              : false,
      cashout_receipt_document              : '',
      cashout_receipt_document_src          : '',
      cashout_receipt_document_size         : '',
      cashout_receipt_document_thumbnail    : '',
      bankdrop_receipt_document             : '',
      bankdrop_receipt_document_src         : '',
      bankdrop_receipt_document_size        : '',
      bankdrop_receipt_document_thumbnail   : '',
      updateType                            : '',
      updateAction                          : '',
      popupBankDropNoteClass                : 'setting-textarea-box',
      transID                               : null,
      popup_reason_note                     : '',
      popupImgSrc                           : '',
      popupNote                             : '',
      transUserID                           : ''
    })
  }

  componentDidUpdate = (prevProps, prevState) => {
    if ( this.state.updateDrawerData !== null && this.state.updateDrawerData !== '' && this.state.updateDrawerData !== prevState.updateDrawerData && this.state.updateDrawerStaus !== null && this.state.updateDrawerStaus !== '' ) {
      this.setState({showLoader: true})
      this.props.getCashDrawer();
    }

    if ( this.state.postOpenData !== null && this.state.postOpenData !== '' && this.state.postOpenData !== prevState.postOpenData && this.state.postOpenStatus !== null && this.state.postOpenStatus !== '' ) {
      this.setState({showLoader: true})
      this.props.getCashDrawer();
    }

    if ( this.state.closeDrawerData !== null && this.state.closeDrawerData !== '' && this.state.closeDrawerData !== prevState.closeDrawerData && this.state.closeStatus !== null && this.state.closeStatus !== '' ) {
      this.setState({showLoader: true})
      this.props.getCashDrawer();
    }

    if ( this.state.cashInDrawerData !== null && this.state.cashInDrawerData !== '' && this.state.cashInDrawerData !== prevState.cashInDrawerData && this.state.cashInStatus !== null && this.state.cashInStatus !== '' ) {
      this.setState({showLoader: true})
      this.props.getCashDrawer();
    }

    if ( this.state.cashOutDrawerData !== null && this.state.cashOutDrawerData !== '' && this.state.cashOutDrawerData !== prevState.cashOutDrawerData && this.state.cashOutStatus !== null && this.state.cashOutStatus !== '' ) {
      this.setState({showLoader: true})
      this.props.getCashDrawer();
    }

    if ( this.state.bankDropDrawerData !== null && this.state.bankDropDrawerData !== '' && this.state.bankDropDrawerData !== prevState.bankDropDrawerData && this.state.bankDropStatus !== null && this.state.bankDropStatus !== '' ) {
      this.setState({showLoader: true})
      this.props.getCashDrawer();
    }

    if ( this.state.editClosedData !== null && this.state.editClosedData !== '' && this.state.editClosedData !== prevState.editClosedData && this.state.editClosedStatus !== null && this.state.editClosedStatus !== '' ) {
      this.setState({showLoader: true})
      this.props.getCashDrawer();
    }

    if ( this.state.popupReceiptData !== null && this.state.popupReceiptData !== '' && this.state.popupReceiptData !== prevState.popupReceiptData && this.state.popupReceiptStatus !== null && this.state.popupReceiptStatus !== '' ) {
      if ( this.state.updateType ) {
        if ( this.state.updateType === 'today' ) {
          this.setState({showLoader: true})
          this.props.getCashDrawer();
        } else if ( this.state.updateType === 'logs' ) {
          this.props.exportEmptyData({});
          this.showRegisterLog();
        } else if ( this.state.updateType === 'history' ) {
          this.props.exportEmptyData({});
          this.showDrawerHistory();
        }
      }
    }
  }

  handleDrawerOpen = (e) => {
    e.preventDefault();

    let formData = {
      clinic_id : this.state.clinic_id
    }

    this.setState({showLoader: true, openClicked: false})
    this.props.openCashDrawer(formData)
  }

  hideClosingPopup = () => {
    this.setState({showClosingPopup: false})
  }

  closeDrawer = () => {
    if ( this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_data ) {

      let formData = {
        drawer_id   : this.state.cashDrawerData.cash_drawer_data.id,
        cash_drawer_transaction:{
            dollar_100  : this.state.dollar_100,
            dollar_50   : this.state.dollar_50,
            dollar_20   : this.state.dollar_20,
            dollar_10   : this.state.dollar_10,
            dollar_5    : this.state.dollar_5,
            dollar_1    : this.state.dollar_1,
            quarters    : this.state.quarters,
            dimes       : this.state.dimes,
            nickels     : this.state.nickels,
            pennies     : this.state.pennies
        }
      }
      if ( !this.state.dollar_100 ) {
        delete formData.cash_drawer_transaction.dollar_100
      }
      if ( !this.state.dollar_50 ) {
        delete formData.cash_drawer_transaction.dollar_50
      }
      if ( !this.state.dollar_20 ) {
        delete formData.cash_drawer_transaction.dollar_20
      }
      if ( !this.state.dollar_10 ) {
        delete formData.cash_drawer_transaction.dollar_10
      }
      if ( !this.state.dollar_5 ) {
        delete formData.cash_drawer_transaction.dollar_5
      }
      if ( !this.state.dollar_1 ) {
        delete formData.cash_drawer_transaction.dollar_1
      }
      if ( !this.state.quarters ) {
        delete formData.cash_drawer_transaction.quarters
      }
      if ( !this.state.dimes ) {
        delete formData.cash_drawer_transaction.dimes
      }
      if ( !this.state.nickels ) {
        delete formData.cash_drawer_transaction.nickels
      }
      if ( !this.state.pennies ) {
        delete formData.cash_drawer_transaction.pennies
      }

      this.setState({showLoader: true, showClosingPopup: false, stateAction: 'openDrawer'})
      this.props.closeCashDrawer(formData);
    }
  }

  backToDrawer = () => {
    window.onscroll = () => {
      return false;
    }
    this.setState({showLoader: true, showRegisterLog: false, showDrawerHistory: false, page: 1, next_page_url: '', registerListData: [], startFresh: true, history_filter_date: null})
    this.hideEditSection();
    this.props.getCashDrawer();
  }

  showRegisterLog = () => {
    toast.dismiss();

    window.onscroll = () => {
      var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
      var scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
      var clientHeight = document.documentElement.clientHeight || window.innerHeight;
      var scrolledToBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if ( scrolledToBottom && this.state.next_page_url != null ) {
        this.loadMore();
      }
    };

    let todayFrom = showFormattedDate("", false, "YYYY-MM-DD");
    let todayTo   = showFormattedDate("", false, "YYYY-MM-DD");

    let formData = {
      'params'   : {
        page     : this.state.page,
        pagesize : this.state.pagesize,
        from     : todayFrom,
        to       : todayTo,
      }
    }

    this.setState({showLoader: true, overrideChildState: true, sel_clinic_id: [], sel_action_type: [], fromDate: todayFrom, toDate: todayTo, registerListData: [], startFresh: true, next_page_url: '', page: 1});
    autoScrolling(true)
    this.props.cashRegisterLogs(formData);
  }

  showDrawerHistory = () => {
    toast.dismiss();
    this.setState({showLoader: true, history_filter_date: null, selected_date: undefined, history_filter_clinic: undefined});

    this.props.cashDrawerHistory();
  }

  showEditSection = () => {
    this.setState({
      sectionOneClass     : "juvly-container border-top",
      sectionTwoClass     : "juvly-container no-padding-top no-display",
      sectionThreeClass   : "juvly-container border-top no-display",
      sectionFourClass    : "table-responsive no-display",
      editSectionClass    : "juvly-container no-padding-top",

      dataChanged         : false,
      hundredClass        : "setting-input-box dollar_number",
      fiftyClass          : "setting-input-box dollar_number",
      twentyClass         : "setting-input-box dollar_number",
      tenClass            : "setting-input-box dollar_number",
      fiveClass           : "setting-input-box dollar_number",
      oneClass            : "setting-input-box dollar_number",
      quarterClass        : "setting-input-box dollar_number",
      dimeClass           : "setting-input-box dollar_number",
      nickleClass         : "setting-input-box dollar_number",
      pennyClass          : "setting-input-box dollar_number",
      historyReasonNote   : '',
      // dollar_100          : '',
      // dollar_50           : '',
      // dollar_20           : '',
      // dollar_10           : '',
      // dollar_5            : '',
      // dollar_1            : '',
      // quarters            : '',
      // dimes               : '',
      // nickels             : '',
      // pennies             : '',
      //history_filter_date         : dateFormat(new Date()),
      historyReasonClass  : "setting-textarea-box reason"
    })
  }

  hideEditSection = () => {
    this.setState({
      sectionOneClass     : "juvly-container border-top",
      sectionTwoClass     : "juvly-container no-padding-top",
      sectionThreeClass   : "juvly-container border-top",
      sectionFourClass    : "table-responsive",
      editSectionClass    : "juvly-container no-padding-top no-display",
    //  history_filter_date         : dateFormat(new Date())
    })
  }

  handleHistoryDrawerClose = (e) => {
    e.preventDefault();

    let totalFilled   = 0;
    let totalErrors   = 0;
    let hundredError  = false;
    let fiftyError    = false;
    let twentyError   = false;
    let tenError      = false;
    let fiveError     = false;
    let oneError      = false;
    let quarterError  = false;
    let dimeError     = false;
    let nickleError   = false;
    let pennyError    = false;
    let reasonError   = false;

    if ( !isNumber(this.state.dollar_100) ) {
      hundredError = true;
      this.setState({hundredClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      hundredError = false;
      this.setState({hundredClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_50) ) {
      fiftyError = true
      this.setState({fiftyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      fiftyError = false
      this.setState({fiftyClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_20) ) {
      twentyError = true;
      this.setState({twentyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      twentyError = false;
      this.setState({twentyClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_10) ) {
      tenError = true;
      this.setState({tenClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      tenError = false;
      this.setState({tenClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_5) ) {
      fiveError = true;
      this.setState({fiveClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      fiveError = false;
      this.setState({fiveClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dollar_1) ) {
      oneError = true;
      this.setState({oneClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      oneError = false;
      this.setState({oneClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.quarters) ) {
      quarterError = true;
      this.setState({quarterClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      quarterError = false;
      this.setState({quarterClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.dimes) ) {
      dimeError = true;
      this.setState({dimeClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      dimeError = false;
      this.setState({dimeClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.nickels) ) {
      nickleError = true;
      this.setState({nickleClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      nickleError = false;
      this.setState({nickleClass: 'setting-input-box dollar_number'})
    }

    if ( !isNumber(this.state.pennies) ) {
      pennyError = true;
      this.setState({pennyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      pennyError = false;
      this.setState({pennyClass: 'setting-input-box dollar_number'})
    }


    if ( !isInt(this.state.dollar_100) ) {
      hundredError = true;
      this.setState({hundredClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      hundredError = false;
      this.setState({hundredClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_50) ) {
      fiftyError = true
      this.setState({fiftyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      fiftyError = false
      this.setState({fiftyClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_20) ) {
      twentyError = true;
      this.setState({twentyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      twentyError = false;
      this.setState({twentyClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_10) ) {
      tenError = true;
      this.setState({tenClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      tenError = false;
      this.setState({tenClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_5) ) {
      fiveError = true;
      this.setState({fiveClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      fiveError = false;
      this.setState({fiveClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dollar_1) ) {
      oneError = true;
      this.setState({oneClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      oneError = false;
      this.setState({oneClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.quarters) ) {
      quarterError = true;
      this.setState({quarterClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      quarterError = false;
      this.setState({quarterClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.dimes) ) {
      dimeError = true;
      this.setState({dimeClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      dimeError = false;
      this.setState({dimeClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.nickels) ) {
      nickleError = true;
      this.setState({nickleClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      nickleError = false;
      this.setState({nickleClass: 'setting-input-box dollar_number'})
    }

    if ( !isInt(this.state.pennies) ) {
      pennyError = true;
      this.setState({pennyClass: 'setting-input-box dollar_number setting-input-box-invalid'})
    } else {
      totalFilled ++;
      pennyError = false;
      this.setState({pennyClass: 'setting-input-box dollar_number'})
    }

    if ( !this.state.historyReasonNote ) {
      this.setState({historyReasonClass: 'setting-textarea-box reason setting-input-box-invalid'})
      reasonError = true;
    } else {
      this.setState({historyReasonClass: 'setting-textarea-box reason'})
      reasonError = false;
    }

    toast.dismiss();

    if ( totalFilled === 0 ) {
      toast.error("You must enter atleast one field");
    }

    if ( totalFilled > 0 ) {
      let isErrorFree = true;

      if ( this.state.dollar_100 === '' || !hundredError ) {
        this.setState({hundredClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_50 === '' || !fiftyError ) {
        this.setState({fiftyClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_20 === '' || !twentyError ) {
        this.setState({twentyClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_10 === '' || !tenError ) {
        this.setState({tenClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_5 === '' || !fiveError ) {
        this.setState({fiveClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dollar_1 === '' || !oneError ) {
        this.setState({oneClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.quarters === '' || !quarterError ) {
        this.setState({quarterClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.dimes === '' || !dimeError ) {
        this.setState({dimeClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.nickels === '' || !nickleError ) {
        this.setState({nickleClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( this.state.pennies === '' || !pennyError ) {
        this.setState({pennyClass: 'setting-input-box dollar_number'})
      } else {
        isErrorFree = false;
      }

      if ( reasonError ) {
        isErrorFree = false
      } else {
        this.setState({historyReasonClass: 'setting-textarea-box reason'})
      }

      if (isErrorFree) {
        let formData = {
          drawer_id         : this.state.drawerHistorysData.drawer.cash_drawer.id,
          drawer_clinic_id  : this.state.history_filter_clinic,
          reason_note       : this.state.historyReasonNote,
          cash_drawer_transaction:{
              dollar_100  : this.state.dollar_100,
              dollar_50   : this.state.dollar_50,
              dollar_20   : this.state.dollar_20,
              dollar_10   : this.state.dollar_10,
              dollar_5    : this.state.dollar_5,
              dollar_1    : this.state.dollar_1,
              quarters    : this.state.quarters,
              dimes       : this.state.dimes,
              nickels     : this.state.nickels,
              pennies     : this.state.pennies
          }
        }
        if ( !this.state.dollar_100 ) {
          delete formData.cash_drawer_transaction.dollar_100
        }
        if ( !this.state.dollar_50 ) {
          delete formData.cash_drawer_transaction.dollar_50
        }
        if ( !this.state.dollar_20 ) {
          delete formData.cash_drawer_transaction.dollar_20
        }
        if ( !this.state.dollar_10 ) {
          delete formData.cash_drawer_transaction.dollar_10
        }
        if ( !this.state.dollar_5 ) {
          delete formData.cash_drawer_transaction.dollar_5
        }
        if ( !this.state.dollar_1 ) {
          delete formData.cash_drawer_transaction.dollar_1
        }
        if ( !this.state.quarters ) {
          delete formData.cash_drawer_transaction.quarters
        }
        if ( !this.state.dimes ) {
          delete formData.cash_drawer_transaction.dimes
        }
        if ( !this.state.nickels ) {
          delete formData.cash_drawer_transaction.nickels
        }
        if ( !this.state.pennies ) {
          delete formData.cash_drawer_transaction.pennies
        }

        this.setState({showLoader: true, stateAction: 'openDrawer'})
        this.props.editClosedDrawer(formData);
      }
    }
  }

  handleDatePickerClick = (e) =>  {
    if (!this.refDatePickerContainer.contains(e.target)) {
      this.refDatePicker.setOpen(false);
      this.setState({showDatePicker:false})
    }
  }

  handleDatePicker = (date) => {
    this.refDatePicker.setOpen(false);

    let filterDate = format(date,'YYYY-MM-DD');

    let formData = {
      'params'   : {
        date     : filterDate,
        clinic_id: this.state.history_filter_clinic
      }
    }

    if ( !this.state.history_filter_clinic ) {
      delete formData.params.clinic_id
    }

    this.props.cashDrawerHistory(formData);

    this.setState({history_filter_date: dateFormat(date), selected_date: date, showDatePicker:false, dataChanged: true, showLoader: true, historyDate: filterDate});
  }

  blurDatePicker = (date) => {
    this.refDatePicker.setOpen(true);
    this.setState({showDatePicker:true, dataChanged: true});
  }

  toggleDatePicker = () => {
    this.setState({showDatePicker: true});
    this.refDatePicker.setFocus(true);
    this.refDatePicker.setOpen(true);
  }

  loadMore = () => {
    if(!autoScrolling()){
      let formData = {
        'params'   : {
          page     : this.state.page,
          pagesize : this.state.pagesize,
          from     : this.state.fromDate,
          to       : this.state.toDate,
          clinic_id: this.state.sel_clinic_id,
          action   : this.state.sel_action_type
        }
      }

      this.setState({showLoadingText: true});
      autoScrolling(true)
      this.props.cashRegisterLogs(formData);
    }
  }

  handleChildSubmit = (childState) => {
    let formData = {};

    if ( childState.canSubmit ) {
      this.setState({
        fromDate          : format(childState.fromDate,'YYYY-MM-DD'),
        toDate            : format(childState.toDate,'YYYY-MM-DD'),
        sel_clinic_id     : childState.selectedLocationIdList,
        showLoader        : true,
        //showLoadingText   : true,
        startFresh        : true,
        registerListData  : [],
        page              : 1,
        next_page_url     : '',
        sel_action_type   : childState.selectedEmployeeIdList,
      });

      formData = {
        'params'   : {
          page     : 1,
          pagesize : this.state.pagesize,
          from     : format(childState.fromDate,'YYYY-MM-DD'),
          to       : format(childState.toDate,'YYYY-MM-DD'),
          clinic_id: childState.selectedLocationIdList,
          action   : childState.selectedEmployeeIdList,
        }
      }
    } else {
      this.setState({
        fromDate          : format(childState.fromDate,'YYYY-MM-DD'),
        toDate            : format(childState.toDate,'YYYY-MM-DD'),

      });
    }

    if ( childState.canSubmit ) {
      autoScrolling(true)
      this.props.cashRegisterLogs(formData);
    }

  }

  handleClinicChange = (clinicID) => {
    let formData = {
      'params'   : {
        date     : this.state.history_filter_date,
        clinic_id: clinicID
      }
    }

    this.props.cashDrawerHistory(formData);

    this.setState({dataChanged: true, showLoader: true, history_filter_clinic: clinicID});
  }

  handleSubmitReceiptPopup = (e) => {
    e.preventDefault();
    let isErrorFree = true;

    if ( this.state.updateAction && this.state.updateAction === 'cashout' ) {
      if ( !this.state.cashout_receipt_document ) {
        isErrorFree = false;
        toast.dismiss();
        toast.error(this.state.globalLang.validation_please_upload_a_file)
      } else {
        isErrorFree = true;
      }
    } else if ( this.state.updateAction === 'bankdrop' ) {
      let ifEitherFieldFilled = false;

      if ( this.state.bankdrop_receipt_document ) {
        ifEitherFieldFilled = true;
      }

      if ( this.state.popup_reason_note ) {
        ifEitherFieldFilled = true;
      }

      if ( ifEitherFieldFilled || this.state.bankdrop_receipt_document_src ) {
        isErrorFree = true;
      } else {
        isErrorFree = false;
        toast.dismiss();
        toast.error(this.state.globalLang.validation_you_must_enter_at_least_one_field);
      }
    }

    if ( isErrorFree && this.state.transID ) {
      let formData = {
        transaction_id    : this.state.transID,
        receipt_document  : (this.state.updateAction && this.state.updateAction === 'cashout') ? this.state.cashout_receipt_document : this.state.bankdrop_receipt_document,
        reason_note       : this.state.popup_reason_note
      }

      if ( this.state.updateAction && this.state.updateAction === 'cashout' && !this.state.cashout_receipt_document ) {
        delete formData.receipt_document
      }

      if ( this.state.updateAction && this.state.updateAction === 'bankdrop' && !this.state.bankdrop_receipt_document ) {
        delete formData.receipt_document
      }

      if ( !formData.reason_note ) {
        delete formData.reason_note
      }

      this.setState({showLoader: true})
      this.props.addEditPopupReceipt(formData);
    }
  }

  getLoggedInUserData = () => {
    let userData = JSON.parse(getUser())
    if ( userData ) {
      return userData.user.id
    }
    return 0
  }

  removeThisImage = (image) =>{
    if (image) {
      let imageSrc  = image + '_src';
      let imageSize = image + '_size';
      let thumbnail = image + '_thumbnail';

      this.setState({[image]: null, [imageSrc]: null, [imageSize]: null, [thumbnail]: null});

      // reset input-field value (it's required for upload same file after removing)
      var inputFiled = document.getElementById(image);
      if (inputFiled) {
        inputFiled.value = ''
      }
    }
  }

  render() {
    let openedClass   = (this.state.stateAction && this.state.stateAction === 'openDrawer' && this.state.openClicked === false) ? '' : 'no-display';
    let openClass     = (this.state.openClicked) ? '' : 'no-display';
    let closeClass    = (this.state.stateAction && this.state.stateAction === 'closeDrawer') ? '' : 'no-display';
    let cashInClass   = (this.state.stateAction && this.state.stateAction === 'cashIn') ? '' : 'no-display';
    let cashOutClass  = (this.state.stateAction && this.state.stateAction === 'cashOut') ? '' : 'no-display';
    let bankDropClass = (this.state.stateAction && this.state.stateAction === 'bankDrop') ? '' : 'no-display';
    let drawerDate    = showFormattedDate();

    let openLinkClass     = 'cashdrawer-subtabs-a';
    let closeLinkClass    = 'cashdrawer-subtabs-a disable-submenu';
    let cashInLinkClass   = 'cashdrawer-subtabs-a disable-submenu';
    let cashOutLinkClass  = 'cashdrawer-subtabs-a disable-submenu';
    let bankDropLinkClass = 'cashdrawer-subtabs-a disable-submenu';
    let openText          = this.state.salesLang.sales_open_drawer
    let closeText         = this.state.salesLang.sales_close_drawer
    let hisClinicOptData  = ''

    if ( this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_session && this.state.cashDrawerData.cash_drawer_session.status === 'open' ) {
      openLinkClass     = 'cashdrawer-subtabs-a disable-submenu';
      closeLinkClass    = 'cashdrawer-subtabs-a';
      cashInLinkClass   = 'cashdrawer-subtabs-a';
      cashOutLinkClass  = 'cashdrawer-subtabs-a';
      bankDropLinkClass = 'cashdrawer-subtabs-a';
      openText          = this.state.salesLang.sales_opened_drawer
    }

    if ( this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_data && this.state.cashDrawerData.cash_drawer_data.drawer_status === 1 ) {
      openLinkClass     = 'cashdrawer-subtabs-a disable-submenu';
      closeLinkClass    = 'cashdrawer-subtabs-a disable-submenu';
      closeText         = this.state.salesLang.sales_closed_drawer

    }

    if ( this.state.cashDrawerData && this.state.cashDrawerData.drawer_opened && this.state.cashDrawerData.drawer_opened === 1 ) {
      openLinkClass     = 'cashdrawer-subtabs-a disable-submenu';
      openText          = this.state.salesLang.sales_opened_drawer
    }

    if ( this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_data && this.state.cashDrawerData.cash_drawer_data.opened_at ) {
      drawerDate     = showFormattedDate(this.state.cashDrawerData.cash_drawer_data.opened_at)
    }

    openLinkClass     = (this.state.stateAction && this.state.stateAction === 'openDrawer' && openLinkClass.indexOf('disable-submenu') === -1 && this.state.openClicked) ? openLinkClass + ' sel-submenu' : openLinkClass;
    closeLinkClass    = (this.state.stateAction && this.state.stateAction === 'closeDrawer' && closeLinkClass.indexOf('disable-submenu') === -1) ? closeLinkClass + ' sel-submenu' : closeLinkClass;
    cashInLinkClass   = (this.state.stateAction && this.state.stateAction === 'cashIn' && cashInLinkClass.indexOf('disable-submenu') === -1) ? cashInLinkClass + ' sel-submenu' : cashInLinkClass;
    cashOutLinkClass  = (this.state.stateAction && this.state.stateAction === 'cashOut' && cashOutLinkClass.indexOf('disable-submenu') === -1) ? cashOutLinkClass + ' sel-submenu' : cashOutLinkClass;
    bankDropLinkClass = (this.state.stateAction && this.state.stateAction === 'bankDrop' && bankDropLinkClass.indexOf('disable-submenu') === -1) ? bankDropLinkClass + ' sel-submenu' : bankDropLinkClass;

    let upperDivClass         = 'juvly-section full-width no-display';
    let lowerDivClass         = 'juvly-section full-width no-display';
    let registerLogDivClass   = 'juvly-section full-width no-display';
    let drawerHistoryDivClass = 'juvly-section full-width no-display';
    let clinicOptData         = '';

    if ( this.state.cashDrawerData && this.state.cashDrawerData.show_drawer && this.state.cashDrawerData.show_drawer > 0 ) {
      lowerDivClass     = 'juvly-section full-width';
    } else {
      upperDivClass     = 'juvly-section full-width';

      if ( this.state.cashDrawerData && this.state.cashDrawerData.clinics ) {
        if ( this.state.cashDrawerData.clinics.length > 0 )  {
          clinicOptData = this.state.cashDrawerData.clinics.map((obj, idx) => {
            return <option key={idx} value={obj.id}>{obj.clinic_name}</option>
          })
        }
      }
    }

    if ( this.state.showRegisterLog ) {
      upperDivClass         = 'juvly-section full-width no-display';
      lowerDivClass         = 'juvly-section full-width no-display';
      drawerHistoryDivClass = 'juvly-section full-width no-display';
      registerLogDivClass   = 'juvly-section full-width';
    }

    if ( this.state.showDrawerHistory ) {
      upperDivClass         = 'juvly-section full-width no-display';
      lowerDivClass         = 'juvly-section full-width no-display';
      registerLogDivClass   = 'juvly-section full-width no-display';
      drawerHistoryDivClass = 'juvly-section full-width';
    }

    let zeroValue       = numberFormat(0, 'currency', 2);
    let openedAt        = zeroValue;
    let currentBalance  = zeroValue;
    let cashIn          = zeroValue;
    let cashOut         = zeroValue;
    let bankDrop        = zeroValue;
    let clinicName      = '';

    if ( this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_data && this.state.cashDrawerData.cash_drawer_data !== null ) {
      openedAt        = (this.state.cashDrawerData.cash_drawer_data.opening_balance) ?  numberFormat(this.state.cashDrawerData.cash_drawer_data.opening_balance, 'currency', 2) : zeroValue;
      currentBalance  = (this.state.cashDrawerData.cash_drawer_data.current_balance) ?  numberFormat(this.state.cashDrawerData.cash_drawer_data.current_balance, 'currency', 2) : zeroValue;
      cashIn          = (this.state.cashDrawerData.cash_drawer_data.cash_in) ?  numberFormat(this.state.cashDrawerData.cash_drawer_data.cash_in, 'currency', 2) : zeroValue;
      cashOut         = (this.state.cashDrawerData.cash_drawer_data.cash_out) ?  numberFormat(this.state.cashDrawerData.cash_drawer_data.cash_out, 'currency', 2) : zeroValue;
      bankDrop        = (this.state.cashDrawerData.cash_drawer_data.bank_drop) ?  numberFormat(this.state.cashDrawerData.cash_drawer_data.bank_drop, 'currency', 2) : zeroValue;
    }

    if ( this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_data && this.state.cashDrawerData.cash_drawer_data.clinic && this.state.cashDrawerData.cash_drawer_data.clinic !== null ) {
      clinicName = this.state.cashDrawerData.cash_drawer_data.clinic.clinic_name
    }

    let maxPlaceValue = (this.state.cashDrawerData && this.state.cashDrawerData.cash_drawer_data && this.state.cashDrawerData.cash_drawer_data.current_balance) ? this.state.cashDrawerData.cash_drawer_data.current_balance : 0

    if ( this.state.drawerHistorysData && this.state.drawerHistorysData.clinics ) {
      if ( this.state.drawerHistorysData.clinics.length > 0 )  {
        hisClinicOptData = this.state.drawerHistorysData.clinics.map((obj, idx) => {
          return <option key={idx} value={obj.id}>{obj.clinic_name}</option>
        })
      }
    }

    return(
      <div id="content">
        <div className="container-fluid content setting-wrapper">
          <SalesHeader/>

          <div className={(this.state.showViewReceiptModal === true ) ? 'modalOverlay' : ''}>
            <div className={(this.state.showViewReceiptModal === true) ? 'small-popup-outer xs-popup displayBlock' : 'small-popup-outer xs-popup no-display'}>
              <div className="small-popup-header">
                <div className="popup-name">{this.state.salesLang.sales_view_receipt}</div>
                <a onClick={() => this.closeReceiptPopup()} className="small-cross">×</a>
              </div>
              <div className="small-popup-content">
              <div className="juvly-container no-padding-bottom">
                 {(this.state.popupImgSrc) && <div className="setting-field-outer">
                    <div className="main-profile-picture relative-pic">
                       <div className="col-xs-6 no-padding">
                         <div className="file-container">
                            <img src={(this.state.popupImgSrc) ? this.state.popupImgSrc : ''}/>
                         </div>
                       </div>
                    </div>
                 </div>}
                 {(this.state.updateAction && this.state.updateAction === 'bankdrop') && <div className="setting-field-outer"><div className="new-field-label">{this.state.salesLang.sales_notes_reason}</div><div className="setting-input-outer">
                 <pre className="Receipt-reason receipt-textarea">{(this.state.popupNote) ? this.state.popupNote : ''}</pre>
                 </div></div>}
                </div>
              </div>
              {(this.state.transUserID && (this.getLoggedInUserData() === this.state.transUserID)) && <div className="footer-static"><a className="new-blue-btn pull-right" onClick={() =>  this.editPopupData()}>{this.state.globalLang.label_edit}</a></div>}
            </div>
          </div>


          <div className={(this.state.showAddReceiptModal === true ) ? 'modalOverlay' : ''}>
            <div className={(this.state.showAddReceiptModal === true) ? 'small-popup-outer xs-popup displayBlock' : 'small-popup-outer xs-popup no-display'}>
            <form onSubmit={this.handleSubmitReceiptPopup}>
              <div className="small-popup-header">
                <div className="popup-name">{this.state.salesLang.sales_update_receipt}</div>
                <a onClick={() => this.closeReceiptPopup()} className="small-cross">×</a>
              </div>
              <div className="small-popup-content">
              <div className="juvly-container no-padding-bottom">
                 <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.salesLang.sales_upload_receipt}</div>
                    <div className="main-profile-picture relative-pic">
                       <div className="col-xs-12 no-padding">
                         <div className="file-container">
                            <img src={(this.state[this.state.updateAction + '_receipt_document_src']) ? this.state[this.state.updateAction + '_receipt_document_src'] : defLogo}/>
                            <span className={(this.state[this.state.updateAction + '_receipt_document_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state[this.state.updateAction + '_receipt_document_thumbnail']}</span>
                            <span className={(this.state[this.state.updateAction + '_receipt_document_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state[this.state.updateAction + '_receipt_document_size']}</span>

                            {(this.state[this.state.updateAction + '_receipt_document_src']) && <span onClick={() => this.removeThisImage(this.state.updateAction + '_receipt_document')} className="upload-img-cross"></span>}
                            <div className="upload">{this.state.globalLang.global_upload}
                               <input
                                  type="file"
                                  name={this.state.updateAction + '_receipt_document'}
                                  autoComplete="off"
                                  onChange={this.handleInputChange}
                                  className="image_questionnaire"
                                  id={this.state.updateAction + '_receipt_document'}
                                  />
                            </div>
                         </div>
                         <p className="update-reciept">{this.state.salesLang.hint_only_images_are_allowed}</p>
                       </div>
                    </div>
                 </div>
                 {(this.state.updateAction && this.state.updateAction === 'bankdrop') && <div className="setting-field-outer"><div className="new-field-label">{this.state.salesLang.sales_notes_reason}</div><div className="setting-input-outer"><textarea onChange={this.handleInputChange} name="popup_reason_note" value={this.state.popup_reason_note} className={this.state.popupBankDropNoteClass}></textarea></div></div>}
                </div>
              </div>
              <div className="footer-static"><input className="new-blue-btn pull-right" type="submit" value="Save"/></div>
              </form>
            </div>
          </div>


          <div className={(this.state.showAlreadyOpenedPopup === true ) ? 'overlay' : ''}></div>
          <div role="dialog" className={(this.state.showAlreadyOpenedPopup === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.dismissAlreadyOpenedPopup}>×</button>
                  <h4 className="modal-title">{this.state.salesLang.sales_Confirmation_required}</h4>
                </div>
                <div id="errorwindow" className="modal-body add-patient-form filter-patient">
                  {this.state.modalMessage !== undefined ? this.state.modalMessage : ''}
                </div>
                <div className="modal-footer" >
                  <div className="col-md-12 text-left">
                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissAlreadyOpenedPopup}>{this.state.salesLang.sales_no}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.handleModalAction}>{this.state.salesLang.sales_yes}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={(this.state.showClosingPopup === true ) ? 'overlay' : ''}></div>
          <div role="dialog" className={(this.state.showClosingPopup === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <button type="button" className="close" data-dismiss="modal" onClick={this.hideClosingPopup}>×</button>
                  <h4 className="modal-title">{this.state.salesLang.sales_Confirmation_required}</h4>
                </div>
                <div className="modal-body add-patient-form filter-patient">{this.state.salesLang.sales_are_u_sure_msg}</div>
                <div className="modal-footer" >
                  <div className="col-md-12 text-left">
                    <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.hideClosingPopup}>{this.state.salesLang.sales_no}</button>
                    <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.closeDrawer}>{this.state.salesLang.sales_yes_close_drawer}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={upperDivClass}>
            <div className="juvly-container">
              <div className="juvly-title m-b-40">{this.state.salesLang.sales_cash_drawer}</div>
              <div className="row">
                <div className="col-md-5 col-sm-12">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.salesLang.sales_please_select_location}</div>
                      <select name="clinic_id" className="setting-select-box" onChange={this.handleInputChange} value={this.state.clinic_id}>
                        <option value="0">{this.state.salesLang.sales_select_clinic}</option>
                        {clinicOptData}
                      </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={lowerDivClass}>
            <div className="bg-light-blue juvly-container border-radius-top">
              <div className="row">
                <div className="col-md-3 col-xs-12">
                  <div className="settings-subtitle m-b-30">{this.state.salesLang.sales_cash_drawer_actions}</div>
                  <ul className="cashdrawer-submenu">
                    <li className="cashdrawer-subtabs-li" onClick={() => this.selectAction('openDrawer', openLinkClass)}>
                      <a className={openLinkClass}>{openText}</a>
                    </li>
                    <li className="cashdrawer-subtabs-li" onClick={() => this.selectAction('closeDrawer', closeLinkClass)}>
                      <a className={closeLinkClass}>{closeText}</a>
                    </li>
                    <li className="cashdrawer-subtabs-li" onClick={() => this.selectAction('cashIn', cashInLinkClass)}>
                      <a className={cashInLinkClass}>{this.state.salesLang.sales_cash_in}</a>
                    </li>
                    <li className="cashdrawer-subtabs-li" onClick={() => this.selectAction('cashOut', cashOutLinkClass)}>
                      <a className={cashOutLinkClass}>{this.state.salesLang.sales_cash_out}</a>
                    </li>
                    <li className="cashdrawer-subtabs-li" onClick={() => this.selectAction('bankDrop', bankDropLinkClass)}>
                      <a className={bankDropLinkClass}>{this.state.salesLang.sales_bank_drop}</a>
                    </li>
                  </ul>
                </div>

                <div className="col-md-9 col-xs-12 currentDrawerStatus">
                    <div className={openedClass}>
                      <div className="settings-subtitle m-b-30">
                        <span className="cash-drawer-title">{(clinicName) && capitalizeFirstLetter(clinicName) + ' |' }  {(drawerDate) && drawerDate}</span>
                        <a className="new-blue-btn pull-right cash-history-btn" onClick={() => this.showDrawerHistory()}>{this.state.salesLang.sales_cash_drawer_history}</a>
                      </div>
                      <div className="row">
                        <div className="col-xs-12 col-md-6 col-lg-4">
                          <div className="cash-drawer-stats">
                            <div className="cash-drawer-stats-title">{this.state.salesLang.sales_opened_at}</div>
                            <div className="cash-drawer-content">{openedAt}</div>
                          </div>
                        </div>
                        <div className="col-xs-12 col-md-6 col-lg-4">
                          <div className="cash-drawer-stats">
                            <div className="cash-drawer-stats-title">{this.state.salesLang.sales_current_balance}</div>
                            <div className="cash-drawer-content">{currentBalance}</div>
                          </div>
                        </div>
                        <div className="col-xs-12 col-md-6 col-lg-4">
                          <div className="cash-drawer-stats">
                            <div className="cash-drawer-stats-title">{this.state.salesLang.sales_cash_in}</div>
                            <div className="cash-drawer-content">{cashIn}</div>
                          </div>
                        </div>
                        <div className="col-xs-12 col-md-6 col-lg-4">
                          <div className="cash-drawer-stats">
                            <div className="cash-drawer-stats-title">{this.state.salesLang.sales_cash_out}</div>
                            <div className="cash-drawer-content">{cashOut}</div>
                          </div>
                        </div>
                        <div className="col-xs-12 col-md-6 col-lg-4">
                          <div className="cash-drawer-stats">
                            <div className="cash-drawer-stats-title">{this.state.salesLang.sales_bank_drop}</div>
                            <div className="cash-drawer-content">{bankDrop}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={openClass}>
                      <div className="settings-subtitle m-b-30"><span className="cash-drawer-title">{this.state.salesLang.sales_open_drawer}</span>
                        <a onClick={() => this.selectAction('openDrawer')} className="pull-right closeActioncross"><img src={picClose} /></a>
                      </div>
                      <div className="row">
                        <form onSubmit={this.handleDrawerOpen}>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$100.00</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.dollar_100 : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$50.00</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.dollar_50 : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$20.00</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.dollar_20 : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$10.00</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.dollar_10 : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$5.00</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.dollar_5 : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$1.00</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.dollar_1 : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.salesLang.sales_quarters}</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.quarters : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.salesLang.sales_dimes}</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.dimes : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.salesLang.sales_nickels}</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.nickels : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.salesLang.sales_pennies}</div>
                                <label className="setting-input-box dollar_number">{(this.state.getOpenData && this.state.getOpenData.close_transaction && this.state.getOpenData.close_transaction) ? this.state.getOpenData.close_transaction.pennies : 0}</label>
                              </div>
                            </div>
                            <div className="col-xs-12">
                              <input type="submit" className="new-blue-btn no-margin" value="Open" />
                            </div>
                        </form>
                      </div>
                    </div>

                    <div className={closeClass}>
                      <div className="settings-subtitle m-b-30"><span className="cash-drawer-title">{this.state.salesLang.sales_close_drawer}</span>
                        <a onClick={() => this.selectAction('openDrawer')} className="pull-right closeActioncross"><img src={picClose} /></a>
                      </div>
                      <div className="row">
                        <form onSubmit={this.handleDrawerClose}>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$100.00</div>
                                <input className={this.state.hundredClass} type="text" autoComplete="off" name="dollar_100" onChange={this.handleInputChange} value={this.state.dollar_100}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$50.00</div>
                                <input className={this.state.fiftyClass} type="text" autoComplete="off" name="dollar_50" onChange={this.handleInputChange} value={this.state.dollar_50}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$20.00</div>
                                <input className={this.state.twentyClass} type="text" autoComplete="off" name="dollar_20" onChange={this.handleInputChange} value={this.state.dollar_20}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$10.00</div>
                                <input className={this.state.tenClass} type="text" autoComplete="off" name="dollar_10" onChange={this.handleInputChange} value={this.state.dollar_10}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$5.00</div>
                                <input className={this.state.fiveClass} type="text" autoComplete="off" name="dollar_5" onChange={this.handleInputChange} value={this.state.dollar_5}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">$1.00</div>
                                <input className={this.state.oneClass} type="text" autoComplete="off" name="dollar_1" onChange={this.handleInputChange} value={this.state.dollar_1}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.salesLang.sales_quarters}</div>
                                <input className={this.state.quarterClass} type="text" autoComplete="off" name="quarters" onChange={this.handleInputChange} value={this.state.quarters}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.salesLang.sales_dimes}</div>
                                <input className={this.state.dimeClass} type="text" autoComplete="off" name="dimes" onChange={this.handleInputChange} value={this.state.dimes}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.salesLang.sales_nickels}</div>
                                <input className={this.state.nickleClass} type="text" autoComplete="off" name="nickels" onChange={this.handleInputChange} value={this.state.nickels}/>
                              </div>
                            </div>
                            <div className="col-xs-6 col-sm-3">
                              <div className="setting-field-outer">
                                <div className="new-field-label">{this.state.salesLang.sales_pennies}</div>
                                <input className={this.state.pennyClass} type="text" autoComplete="off" name="pennies" onChange={this.handleInputChange} value={this.state.pennies}/>
                              </div>
                            </div>
                            <div className="col-xs-12">
                              <input type="submit" className="new-blue-btn no-margin" value="Save" />
                            </div>
                        </form>
                      </div>
                    </div>

                    <div className={cashInClass}>
                      <div className="settings-subtitle m-b-30"><span className="cash-drawer-title">{this.state.salesLang.sales_cash_in}</span>
                        <a onClick={() => this.selectAction('openDrawer')} className="pull-right closeActioncross" data-id="inBtn"><img src={picClose} /></a>
                      </div>
                      <div className="row">
                        <form onSubmit={this.handleCashIn}>
                          <div className="col-xs-6 col-sm-3">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.salesLang.sales_Amount}</div>
                              <input className={this.state.cashInAmntClass} type="text" autoComplete="off" name="cash_in_amount" onChange={this.handleInputChange} value={this.state.cash_in_amount} />
                            </div>
                          </div>
                          <div className="col-xs-12">
                            <input type="submit" className="new-blue-btn no-margin" value="Save" />
                          </div>
                        </form>
                      </div>
                    </div>

                    <div className={cashOutClass}>
                      <div className="settings-subtitle m-b-30"><span className="cash-drawer-title">{this.state.salesLang.sales_cash_out}</span>
                        <a onClick={() => this.selectAction('openDrawer')} className="pull-right closeActioncross"><img src={picClose} /></a>
                      </div>
                      <div className="row">
                        <form onSubmit={this.handleCashOut}>
                          <div className="col-xs-12 profile-detail-left m-b-20">
                            <div className="main-profile-picture">
                                <div className="file-container">
                                   <img src={(this.state['cashout_receipt_document_src']) ? this.state['cashout_receipt_document_src'] : defLogo}/>
                                   <span className={(this.state['cashout_receipt_document_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['cashout_receipt_document_thumbnail']}</span>
                                   <span className={(this.state['cashout_receipt_document_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['cashout_receipt_document_size']}</span>

                                   {(this.state['cashout_receipt_document']) && <span onClick={() => this.removeThisImage('cashout_receipt_document')} className="upload-img-cross"></span>}
                                   <div className="upload">{this.state.salesLang.sales_upload}
                                      <input
                                         type="file"
                                         name={'cashout_receipt_document'}
                                         onChange={this.handleInputChange}
                                         className="image_questionnaire"
                                         id={'cashout_receipt_document'}
                                         />
                                   </div>
                                 </div>
                            </div>
                            <div className="row">
                              <div className="col-xs-12 col-sm-6">
                                <div className="setting-field-outer">
                                  <div className="new-field-label">{this.state.salesLang.sales_Amount}</div>
                                  <input className={this.state.cashOutAmntClass} type="text" autoComplete="off" name="cash_out_amount" onChange={this.handleInputChange} value={this.state.cash_out_amount} placeholder={this.state.salesLang.sales_max+" " + maxPlaceValue} />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-xs-12">
                            <input type="submit" className="new-blue-btn cash-out-save" value="Save" />
                          </div>
                      </form>
                      </div>
                    </div>

                    <div className={bankDropClass}>
                      <div className="settings-subtitle m-b-30"><span className="cash-drawer-title">{this.state.salesLang.sales_bank_drop}</span>
                        <a onClick={() => this.selectAction('openDrawer')} className="pull-right closeActioncross"><img src={picClose} /></a>
                      </div>
                      <div className="row">
                        <form onSubmit={this.handleBankDrop}>
                          <div className="col-xs-12 profile-detail-left no-margin">
                            <div className="main-profile-picture">
                                <div className="file-container">
                                   <img src={(this.state['bankdrop_receipt_document_src']) ? this.state['bankdrop_receipt_document_src'] : defLogo}/>
                                   <span className={(this.state['bankdrop_receipt_document_src']) ? "file-name file-info" : "file-name-hide no-display"}>{this.state['bankdrop_receipt_document_thumbnail']}</span>
                                   <span className={(this.state['bankdrop_receipt_document_size']) ? "file-size file-info" : "file-size-hide no-display"}>{this.state['bankdrop_receipt_document_size']}</span>

                                   {(this.state['bankdrop_receipt_document']) && <span onClick={() => this.removeThisImage('bankdrop_receipt_document')} className="upload-img-cross"></span>}
                                   <div className="upload">{this.state.salesLang.sales_upload}
                                      <input
                                         type="file"
                                         name={'bankdrop_receipt_document'}
                                         onChange={this.handleInputChange}
                                         className="image_questionnaire"
                                         id={'bankdrop_receipt_document'}
                                         />
                                   </div>
                                 </div>
                            </div>
                            <div className="row">
                              <div className="col-xs-12 col-sm-6">
                                <div className="setting-field-outer">
                                  <div className="new-field-label">{this.state.salesLang.sales_Amount}</div>
                                  <input className={this.state.bankdropAmntClass} type="text" autoComplete="off" name="bankdrop_amount" onChange={this.handleInputChange} value={this.state.bankdrop_amount} placeholder={this.state.salesLang.sales_max+" " + maxPlaceValue} />
                                </div>
                              </div>
                            </div>
                            <div className="row">
                              <div className="col-xs-12 col-sm-12">
                                <div className="setting-field-outer">
                                  <div className="new-field-label">{this.state.salesLang.sales_notes_reason}</div>
                                  <textarea onChange={this.handleInputChange} name="reason_note" value={this.state.reason_note} className={this.state.bankDropNoteClass}></textarea>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-xs-12">
                            <input type="submit" className="new-blue-btn bankdrop-save" value="Save" />
                          </div>
                        </form>
                      </div>
                    </div>

                </div>
              </div>
            </div>
            <div className="juvly-container">
              <div className="juvly-title m-b-0">

                <span className="juvly-title-span">{this.state.salesLang.sales_cash_transactions_today}</span>
                <a className="new-blue-btn pull-right edit_setting" onClick={() => this.showRegisterLog()}>{this.state.salesLang.sales_view_register_logs}</a>

              </div>
            </div>
            <div className="table-responsive update_transaction ">
              <table className="table-updated setting-table no-hover min-w-1000">
                <thead className="table-updated-thead">
                  <tr className="table-updated-tr">
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_date_time}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_location}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_type}</th>
                    <th className="col-xs-2 table-updated-th text-right">{this.state.salesLang.sales_Amount}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_employee}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_action_reason}</th>
                  </tr>
                </thead>
                <tbody className="table-updated-tbody">
                  {this.state.cashDrawerData && this.state.cashDrawerData.today_transactions && this.state.cashDrawerData.today_transactions.length > 0 && this.state.cashDrawerData.today_transactions.map((obj, idx) => {

                      return(
                        <tr key={idx} className="table-updated-tr">
                          <td className="table-updated-td">{(obj.created) ? showFormattedDate(obj.created, true) : ""}</td>
                          <td className="table-updated-td">{(obj.cash_drawer && obj.cash_drawer.clinic) ? capitalizeFirstLetter(obj.cash_drawer.clinic.clinic_name) : '' }</td>
                          <td className="table-updated-td">{(obj.action) ? this.showAction(obj.action) : ''}</td>
                          <td className="table-updated-td text-right">{(obj.total_amount) ? numberFormat(obj.total_amount, 'currency', 2) : ''}</td>
                          <td className="table-updated-td">{(obj.user) ? displayName(obj.user) : ''}</td>
                          <td className="table-updated-td">{(obj.action) ? this.returnAction(obj) : ''}</td>
                        </tr>
                      )
                    })
                  }
                  <tr className={this.state.cashDrawerData && this.state.cashDrawerData.today_transactions && this.state.cashDrawerData.today_transactions.length > 0 ? "no-display" : ""}>
                    <td className="table-updated-td no-record no-float" colSpan={6}>{this.state.salesLang.sales_no_record_found}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


          <div className={registerLogDivClass}>
            <div className="setting-search-outer">
              <DrawerFilter locationArray={(this.state.registerLogData && this.state.registerLogData.clinics && this.state.registerLogData.clinics.length > 0 ) ? this.state.registerLogData.clinics : this.state.locationArray} handleChildSubmit={this.handleChildSubmit} clinicVal= {this.state.selectedLocationIdList} location={true} dateRangePick={true} reportType={'cash_transaction_history'} overrideChildState={this.state.overrideChildState} fromDate={this.state.fromDate}
              toDate={this.state.toDate}
              employee={true}
              employeeArray={(this.state.registerLogData && this.state.registerLogData.action && this.state.registerLogData.action.length > 0 ) ? this.state.registerLogData.action : []}
              />
            </div>
            <div className="juvly-container border-top">
              <div className="juvly-title no-margin">{this.state.salesLang.sales_cash_transaction_history}
                <a onClick={() => this.backToDrawer()} className="pull-right cancelAction"><img src={picClose} /></a>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table-updated setting-table survey-table no-hover cash-trans-outer">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-3 table-updated-th">{this.state.salesLang.sales_date_time}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_location}</th>
                    <th className="col-xs-1 table-updated-th">{this.state.salesLang.sales_type}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_Amount}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_employee}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_action_reason}</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.registerLogData && this.state.registerListData && this.state.registerListData.length > 0 && this.state.registerListData.map((obj, idx) => {

                      return(
                        <tr key={idx} className="table-updated-tr">
                          <td className="table-updated-td">{(obj.created) ? showFormattedDate(obj.created, true) : ""}</td>
                          <td className="table-updated-td">{(obj.cash_drawer && obj.cash_drawer.clinic) ? capitalizeFirstLetter(obj.cash_drawer.clinic.clinic_name) : '' }</td>
                          <td className="table-updated-td">{(obj.action) ? this.showAction(obj.action) : ''}</td>
                          <td className="table-updated-td text-right">{(obj.total_amount || obj.total_amount <= 0) ? numberFormat(obj.total_amount, 'currency', 2) : ''}</td>
                          <td className="table-updated-td">{(obj.user) ? displayName(obj.user) : ''}</td>
                          <td className="table-updated-td">{(obj.action) ? this.returnAction(obj) : ''}</td>
                        </tr>
                      )
                    })
                  }
                  <tr className={this.state.registerLogData && this.state.registerListData && this.state.registerListData.length > 0 ? "no-display" : ""}>
                    <td className="table-updated-td no-record no-float" colSpan={6}>{this.state.salesLang.sales_no_record_found}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={drawerHistoryDivClass}>
            <div className="setting-search-outer">
              <div className="search-bg new-calender pull-left" ref={(refDatePickerContainer) => this.refDatePickerContainer = refDatePickerContainer}>
                <img src="/images/calender.svg" onClick={this.toggleDatePicker}/>
                {<DatePicker
                  value={this.state.history_filter_date}
                  onChange={this.handleDatePicker}
                  className={'cashDrawerHistory p-r-40'}
                  name='history_filter_date'
                  autoComplete="off"
                  ref={(refDatePicker) => this.refDatePicker = refDatePicker}
                  onBlur={this.blurDatePicker}
                  dateFormat={formatType}
                  selected={(this.state.selected_date) ? this.state.selected_date : (this.state.history_filter_date) ? moment(this.state.history_filter_date).toDate() : this.state.selected_date}
                />}
              </div>
              <div className="filter-type cashdrw-filter">
                <span className="search-text">{this.state.salesLang.sales_filter_by_clinic}:</span>
                <div className="header-select">
                  <select className="m-r-0 cashdrw-filter-clinic" name="history_filter_clinic" onChange={this.handleInputChange} value={this.state.history_filter_clinic}>
                    {hisClinicOptData}
                  </select>
                  <i className="fas fa-angle-down" />
                </div>
              </div>
            </div>
            <div className={this.state.sectionOneClass}>
              <div className="juvly-title m-b-00">{this.state.salesLang.sales_cash_drawer_history}
                <a onClick={() => this.backToDrawer()} className="pull-right cancelAction"><img src={picClose} /></a>
              </div>
            </div>
            <div className={this.state.hisNoDataClass}>{this.state.salesLang.sales_no_record_found}</div>
            <div className={this.state.sectionTwoClass}>
              <p className="setting-text m-b-60">
                {(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.location : this.state.salesLang.sales_no_location} &nbsp;|&nbsp; <b>{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer && this.state.drawerHistorysData.drawer.cash_drawer) && showFormattedDate(this.state.drawerHistorysData.drawer.cash_drawer.opened_at)} </b>
                &nbsp;|&nbsp; {this.state.salesLang.sales_opened_at}  <span className="easy-link no-padding">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer && this.state.drawerHistorysData.drawer.cash_drawer) && numberFormat(this.state.drawerHistorysData.drawer.cash_drawer.opening_balance, 'currency', 2)}</span>
                &nbsp; |&nbsp; {this.state.salesLang.saals_closed_at}  <span className="easy-link no-padding">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer && this.state.drawerHistorysData.drawer.cash_drawer) && numberFormat(this.state.drawerHistorysData.drawer.cash_drawer.closing_balance, 'currency', 2)}</span>
                &nbsp; |&nbsp; {this.state.salesLang.sales_opening_difference}  <span className={(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer && this.state.drawerHistorysData.drawer.cash_drawer) && this.state.drawerHistorysData.drawer.cash_drawer.opening_difference_type}>{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer && this.state.drawerHistorysData.drawer.cash_drawer) && numberFormat(this.state.drawerHistorysData.drawer.cash_drawer.opening_difference, 'currency', 2)}</span>
                &nbsp; |&nbsp; {this.state.salesLang.sales_closing_difference} <span className={(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer && this.state.drawerHistorysData.drawer.cash_drawer) && this.state.drawerHistorysData.drawer.cash_drawer.closing_difference_type}>{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer && this.state.drawerHistorysData.drawer.cash_drawer) && numberFormat(this.state.drawerHistorysData.drawer.cash_drawer.closing_difference, 'currency', 2)}</span>
              </p>
              <div className="row">
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">$100.00</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.dollar_100 : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">$50.00</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.dollar_50 : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">$20.00</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.dollar_20 : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">$10.00</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.dollar_10 : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">$5.00</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.dollar_5 : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">$1.00</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.dollar_1 : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.salesLang.sales_quarters}</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.quarters : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.salesLang.sales_dimes}</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.dimes : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.salesLang.sales_nickels}</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.nickels : "0"}</div>
                  </div>
                </div>
                <div className="drawer-history-field">
                  <div className="setting-field-outer">
                    <div className="new-field-label">{this.state.salesLang.sales_pennies}</div>
                    <div className="setting-input-box">{(this.state.drawerHistorysData && this.state.drawerHistorysData.drawer) ? this.state.drawerHistorysData.drawer.pennies : "0"}</div>
                  </div>
                </div>
                {(this.state.drawerHistorysData && this.state.drawerHistorysData.editClose && checkIfPermissionAllowed('update-drawer-after-close')) && <div className="col-xs-12">
                  <a onClick={() => this.showEditSection()} className="new-blue-btn no-margin">{this.state.globalLang.label_edit}</a>
                </div>}
              </div>
            </div>
            <div className={this.state.sectionThreeClass}>
              <div className="juvly-title no-margin">{this.state.salesLang.sales_cash_transactions}</div>
            </div>
            <div className={this.state.sectionFourClass}>
              <table className="table-updated setting-table survey-table no-hover min-w-1000">
                <thead className="table-updated-thead">
                  <tr>
                    <th className="col-xs-3 table-updated-th">{this.state.salesLang.sales_date_time}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_location}</th>
                    <th className="col-xs-1 table-updated-th">{this.state.salesLang.sales_type}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_Amount}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_employee}</th>
                    <th className="col-xs-2 table-updated-th">{this.state.salesLang.sales_action_reason}</th>
                  </tr>
                </thead>
                <tbody className="table-updated-tbody">
                  {this.state.drawerHistorysData && this.state.drawerHistorysData.today_transactions && this.state.drawerHistorysData.today_transactions.length > 0 && this.state.drawerHistorysData.today_transactions.map((obj, idx) => {

                      return(
                        <tr key={idx} className={(obj.action && obj.action !== 'current') ? "table-updated-tr" : "table-updated-tr no-display" }>
                          <td className="table-updated-td">{(obj.created) ? showFormattedDate(obj.created, true) : ""}</td>
                          <td className="table-updated-td">{(obj.cash_drawer && obj.cash_drawer.clinic) ? capitalizeFirstLetter(obj.cash_drawer.clinic.clinic_name) : '' }</td>
                          <td className="table-updated-td">{(obj.action) ? this.showAction(obj.action) : ''}</td>
                          <td className="table-updated-td text-right">{(obj.total_amount) ? numberFormat(obj.total_amount, 'currency', 2) : numberFormat(0, 'currency', 2)}</td>
                          <td className="table-updated-td">{(obj.user) ? displayName(obj.user) : ''}</td>
                          <td className="table-updated-td">{(obj.action) ? this.returnAction(obj) : ''}</td>
                        </tr>
                      )
                    })
                  }
                  <tr className={this.state.drawerHistorysData && this.state.drawerHistorysData.today_transactions && this.state.drawerHistorysData.today_transactions.length > 0 ? "no-display" : ""}>
                    <td className="table-updated-td no-record no-float" colSpan={6}>{this.state.salesLang.sales_no_record_found}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={this.state.editSectionClass}>
              <div className="row">
              <form onSubmit={this.handleHistoryDrawerClose}>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">$100.00</div>
                        <input className={this.state.hundredClass} type="text" autoComplete="off" name="dollar_100" onChange={this.handleInputChange} value={this.state.dollar_100}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">$50.00</div>
                      <input className={this.state.fiftyClass} type="text" autoComplete="off" name="dollar_50" onChange={this.handleInputChange} value={this.state.dollar_50}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">$20.00</div>
                      <input className={this.state.twentyClass} type="text" autoComplete="off" name="dollar_20" onChange={this.handleInputChange} value={this.state.dollar_20}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">$10.00</div>
                      <input className={this.state.tenClass} type="text" autoComplete="off" name="dollar_10" onChange={this.handleInputChange} value={this.state.dollar_10}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">$5.00</div>
                      <input className={this.state.fiveClass} type="text" autoComplete="off" name="dollar_5" onChange={this.handleInputChange} value={this.state.dollar_5}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">$1.00</div>
                      <input className={this.state.oneClass} type="text" autoComplete="off" name="dollar_1" onChange={this.handleInputChange} value={this.state.dollar_1}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.salesLang.sales_quarters}</div>
                      <input className={this.state.quarterClass} type="text" autoComplete="off" name="quarters" onChange={this.handleInputChange} value={this.state.quarters}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.salesLang.sales_dimes}</div>
                      <input className={this.state.dimeClass} type="text" autoComplete="off" name="dimes" onChange={this.handleInputChange} value={this.state.dimes}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.salesLang.sales_nickels}</div>
                      <input className={this.state.nickleClass} type="text" autoComplete="off" name="nickels" onChange={this.handleInputChange} value={this.state.nickels}/>
                    </div>
                  </div>
                  <div className="drawer-history-field">
                    <div className="setting-field-outer">
                      <div className="new-field-label">{this.state.salesLang.sales_pennies}</div>
                      <input className={this.state.pennyClass} type="text" autoComplete="off" name="pennies" onChange={this.handleInputChange} value={this.state.pennies}/>
                    </div>
                  </div>
                  <div className="col-xs-12 col-sm-12">
                     <div className="setting-field-outer">
                        <div className="new-field-label">{this.state.salesLang.sales_reason} <span className="required"> *</span></div>
                        <textarea name="historyReasonNote" className={this.state.historyReasonClass} onChange={this.handleInputChange} value={this.state.historyReasonNote}></textarea>
                     </div>
                  </div>
                  <div className="col-xs-12">
                    <input type="submit" className="new-blue-btn no-margin" value="Save" />
                    <a onClick={() => this.hideEditSection()} className="new-white-btn no-margin m-l-5">{this.state.globalLang.label_cancel}</a>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
        <div className={(this.state.showLoader) ? 'new-loader text-left displayBlock clientLoader clientProfileLoader' : 'new-loader text-left'}>
          <div className="loader-outer">
            <img id="loader-outer" src="/images/Eclipse.gif" className="loader-img" />
            <div id="modal-confirm-text" className="popup-subtitle" >{this.state.globalLang.loading_please_wait_text}</div>
          </div>
        </div>
        <div className={(this.state.showLoadingText) ? "loading-please-wait cash-drawer-text-oader" : "loading-please-wait no-display cash-drawer-text-oader"}>{this.state.globalLang.loading_please_wait_text}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const languageData  = JSON.parse(localStorage.getItem("languageData"))
  const returnState   = {}

  if ( state.SalesReducer.action === "GET_CASH_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.cashDrawerData = state.SalesReducer.data;
    } else {
      returnState.cashDrawerData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "CHANGE_DRAWER_LOCATION" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      if ( state.SalesReducer.data.status !== 101 ) {
        toast.error(languageData.global[state.SalesReducer.data.message]);
      }
      returnState.changeLocationData = state.SalesReducer.data;
    } else {
      returnState.changeLocationData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "VIEW_OPENED_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.viewOpenedData = state.SalesReducer.data;
    } else {
      returnState.viewOpenedData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "TAKE_DRAWER_CONTROL" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.updateDrawerData = state.SalesReducer.data;
    } else {
      returnState.updateDrawerData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "GET_OPEN_CASH_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.getOpenCashDrawerData = state.SalesReducer.data;
    } else {
      returnState.getOpenCashDrawerData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "POST_OPEN_CASH_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.postOpenCashDrawerData = state.SalesReducer.data;
    } else {
      toast.success(languageData.global[state.SalesReducer.data.message]);
      returnState.postOpenCashDrawerData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "CLOSE_CASH_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.closeDrawerData = state.SalesReducer.data;
    } else {
      toast.success(languageData.global[state.SalesReducer.data.message]);
      returnState.closeDrawerData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "CASH_IN_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.cashInDrawerData = state.SalesReducer.data;
    } else {
      toast.success(languageData.global[state.SalesReducer.data.message]);
      returnState.cashInDrawerData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "CASH_OUT_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.cashOutDrawerData = state.SalesReducer.data;
    } else {
      toast.success(languageData.global[state.SalesReducer.data.message]);
      returnState.cashOutDrawerData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "BANK_DROP_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.bankDropDrawerData = state.SalesReducer.data;
    } else {
      toast.success(languageData.global[state.SalesReducer.data.message]);
      returnState.bankDropDrawerData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "CASH_REGISTER_LOGS" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.registerLogData = state.SalesReducer.data;
    } else {
      returnState.registerLogData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "GET_CASH_DRAWER_HISTORY" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.drawerHistoryData = state.SalesReducer.data;
    } else {
      returnState.drawerHistoryData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "EDIT_CLOSED_DRAWER" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.editClosedData = state.SalesReducer.data;
    } else {
      toast.success(languageData.global[state.SalesReducer.data.message]);
      returnState.editClosedData = state.SalesReducer.data;
    }
  }

  if ( state.SalesReducer.action === "ADD_EDIT_POPUP_RECEIPT" ) {
    if ( state.SalesReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      returnState.popupReceiptData = state.SalesReducer.data;
    } else {
      toast.success(languageData.global[state.SalesReducer.data.message]);
      returnState.popupReceiptData = state.SalesReducer.data;
    }
  }

  if (state.SalesReducer.action === 'EMPTY_DATA' ) {
    if ( state.SalesReducer.data.status != 200 ) {
      toast.error(languageData.global[state.SalesReducer.data.message]);
      return {}
    } else {
      return {}
    }
  }

  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getCashDrawer: getCashDrawer, changeDrawerLocation: changeDrawerLocation, viewOpenedDrawer: viewOpenedDrawer, updateCashDrawer: updateCashDrawer, getOpenCashDrawer: getOpenCashDrawer, openCashDrawer: openCashDrawer, closeCashDrawer: closeCashDrawer, cashInDrawer: cashInDrawer, cashOutDrawer: cashOutDrawer, bankDropDrawer: bankDropDrawer, cashRegisterLogs: cashRegisterLogs, cashDrawerHistory: cashDrawerHistory, editClosedDrawer: editClosedDrawer, addEditPopupReceipt: addEditPopupReceipt, exportEmptyData: exportEmptyData}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps) (CashDrawer);
