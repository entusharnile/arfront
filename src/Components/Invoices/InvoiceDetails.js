import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from 'react-router';
import { ToastContainer, toast } from "react-toastify";
import {getInvoiceDetails, getPaymentHistory, voidInvoice, sendAndDownloadInvoice, sendAndDownloadRefundReceipt, getRefundDetails, payRefund, changeUserID, exportEmptyData, saveAndSendEmail, refundIssue} from '../../Actions/Invoices/invoiceActions.js';
import { capitalizeFirstLetter, numberFormat, displayName, showFormattedDate, isNumber, checkIfPermissionAllowed } from '../../Utils/services.js';import { format } from 'date-fns';
import defLogo from '../../images/logo.png';
import Select from 'react-select';
import validator from 'validator';

class InvoiceDetails extends Component {
  constructor(props) {
    super(props);

    const languageData  = JSON.parse(localStorage.getItem('languageData'))

    this.state = {
      backURLType           : (this.props.match.params.actionType) ? this.props.match.params.actionType : 'clients',
      clientID              : this.props.match.params.clientID,
      invoiceID             : this.props.match.params.invoiceID,
      showLoader            : false,
      globalLang            : languageData.global,
      invoiceData           : [],
      showConfirmationModal : false,
      showPaymentHistory    : false,
      showRefund            : false,
      text_reason_for_refund: '',
      refundReasonClass     : "row no-display",
      refund_type           : "",
      invoiceActionType     : "",
      receiptActionType     : "",
      selectedPayments      : [],
      cash_amount           : "",
      cc_amount             : "",
      wallet_amount         : "",
      reasonAreaClass       : "setting-textarea-box",
      cashAmountClass       : "setting-input-box",
      ccAmountClass         : "setting-input-box",
      walletAmountClass     : "setting-input-box",
      selectAReasonClass    : "setting-select-box",
      selectPaymentClass    : "",
      selectedProvider      : [],
      showNoEmailError      : false,
      emailInputClass       : "setting-input-box",
      pat_email_id          : ""
    }

    window.onscroll = () => {
      return false;
    }

    this.props.exportEmptyData({});
  }

  componentDidMount() {
    this.setState({
      showLoader: true,
    });

    this.props.getInvoiceDetails(this.state.invoiceID, this.state.clientID);
  }

  static getDerivedStateFromProps(props, state) {
    if ( props.invoiceData !== undefined && props.invoiceData.status === 200 && props.invoiceData.data !== state.invoiceData ) {

      let selProviderArr    = []
      let selectedProvider  = {};


      if ( props.invoiceData.data && props.invoiceData.data.invoice_data && props.invoiceData.data.invoice_data && props.invoiceData.data.invoice_data.pos_invoice_items && props.invoiceData.data.invoice_data.pos_invoice_items.length > 0 ) {
        props.invoiceData.data.invoice_data.pos_invoice_items.map((obj, idx) => {

          if ( props.invoiceData.data && props.invoiceData.data.all_employees && props.invoiceData.data.all_employees.length > 0 ) {
            props.invoiceData.data.all_employees.map((iobj, iidx) => {
              if ( obj.user_id.toString() === iobj.id.toString() ) {
                selectedProvider[obj.id] = {value: iobj.id,  label: displayName(iobj)}
              }
            })
          }
        })
      }
      document.body.style.overflow = "";
      return {
        invoiceData         : props.invoiceData.data,
        showLoader          : false,
        showPaymentHistory  : false,
        selectedProvider    : selectedProvider,
        showRefund          : false
      }
    }

    if ( props.historyData !== undefined && props.historyData.status === 200 && props.historyData.data !== state.historyData ) {
      document.body.style.overflow = "hidden";
       return {
         historyData        : props.historyData.data,
         showLoader         : false,
         showPaymentHistory : true
       }

     } else if ( props.historyData !== undefined && props.historyData.status !== 200 && props.historyData.data !== state.historyData ) {
       document.body.style.overflow = "";
       return {
         showLoader         : false,
         historyData        : props.historyData.data,
       }
     }

     if ( props.voidData !== undefined && props.voidData.status === 200 && props.voidData.data !== state.voidData ) {
        return {
          voidData           : props.voidData.data,
          showLoader         : false,
          saveMessage        : props.voidData.message
        }

      } else if ( props.voidData !== undefined && props.voidData.status !== 200 && props.voidData.data !== state.voidData ) {
        return {
          showLoader         : false,
          voidData           : (props.historyData) ? props.historyData.data : null,
          saveMessage        : props.voidData.message
        }
      }

      if ( props.sendAndDownloadInvoiceData !== undefined && props.sendAndDownloadInvoiceData.status === 200 && props.sendAndDownloadInvoiceData.data.timestamp !== state.sendAndDownloadInvoiceData ) {

        if ( state.invoiceActionType === 0 ) {
          let returnState                         = {};
          returnState.sendAndDownloadInvoiceData  = props.sendAndDownloadInvoiceData.data.timestamp;
          returnState.showLoader                  = false;
          returnState.invoiceActionType           = '';
          if ( props.sendAndDownloadInvoiceData.data ) {
            //window.location.href           = props.sendAndDownloadInvoiceData.data.file;
            window.open(props.sendAndDownloadInvoiceData.data.file);
          }
          return returnState;
        } else {
          return {
            sendAndDownloadInvoiceData   : props.sendAndDownloadInvoiceData.data.timestamp,
            showLoader                   : false,
            invoiceActionType            : ''
          }
        }
      } else if ( props.sendAndDownloadInvoiceData !== undefined && props.sendAndDownloadInvoiceData.status !== 200 && props.sendAndDownloadInvoiceData.data.timestamp !== state.sendAndDownloadInvoiceData ) {
         return {
           showLoader                   : false,
           sendAndDownloadInvoiceData   : props.sendAndDownloadInvoiceData.data.timestamp,
           invoiceActionType            : ''
         }
       }

       if ( props.sendAndDownloadReceiptData !== undefined && props.sendAndDownloadReceiptData.status === 200 && props.sendAndDownloadReceiptData.data !== state.sendAndDownloadReceiptData ) {

         if ( state.receiptActionType === 0 ) {
           let returnState                         = {};
           returnState.sendAndDownloadReceiptData  = props.sendAndDownloadReceiptData.data;
           returnState.showLoader                  = false;
           returnState.receiptActionType           = '';
           if ( props.sendAndDownloadReceiptData.data ) {
             window.location.href           = props.sendAndDownloadReceiptData.data;
           }
           return returnState;
         } else {
           return {
             sendAndDownloadReceiptData   : props.sendAndDownloadReceiptData.data,
             showLoader                   : false,
             receiptActionType            : ''
           }
         }
        } else if ( props.sendAndDownloadReceiptData !== undefined && props.sendAndDownloadReceiptData.status !== 200 && props.sendAndDownloadReceiptData.data !== state.sendAndDownloadReceiptData ) {
          return {
            showLoader                   : false,
            sendAndDownloadReceiptData   : props.sendAndDownloadReceiptData.data,
            receiptActionType            : ''
          }
        }

        if ( props.getRefundData !== undefined && props.getRefundData.status === 200 && props.getRefundData.data !== state.getRefundData ) {
          document.body.style.overflow = "hidden";
           return {
             getRefundData      : props.getRefundData.data,
             showLoader         : false,
             showRefund         : true,
             refund_type        : (props.getRefundData.data && props.getRefundData.data.available_options && props.getRefundData.data.available_options.indexOf('full-refund') > -1) ? 'full' : 'partial',
             refund_reason            : '',
             text_reason_for_refund   : '',
             refundReasonClass        : "row no-display",
             selectedPayments         : [],
             cash_amount              : "",
             cc_amount                : "",
             wallet_amount            : "",
             reasonAreaClass          : "setting-textarea-box",
             cashAmountClass          : "setting-input-box",
             ccAmountClass            : "setting-input-box",
             walletAmountClass        : "setting-input-box",
             selectAReasonClass       : "setting-select-box",
             selectPaymentClass       : ""
           }

         } else if ( props.getRefundData !== undefined && props.getRefundData.status !== 200 && props.getRefundData.data !== state.getRefundData ) {
           document.body.style.overflow = "";
           return {
             showLoader         : false,
             getRefundData      : props.getRefundData.data,
           }
         }

         if ( props.payRefundData !== undefined && props.payRefundData.status === 200 && props.payRefundData.data !== state.payRefundData ) {
           document.body.style.overflow = "";
            return {
              payRefundData      : props.payRefundData.data,
              showLoader         : false,
              payRefundStatus    : props.payRefundData.data,
            }

          } else if ( props.payRefundData !== undefined && props.payRefundData.status !== 200 && props.payRefundData.data !== state.payRefundData ) {
            document.body.style.overflow = "";
            return {
              payRefundData      : props.payRefundData.data,
              showLoader         : false,
              payRefundStatus    : ''
            }
          }

          if ( props.updateInvoiceUserData !== undefined && props.updateInvoiceUserData.status === 200 && props.updateInvoiceUserData.data !== state.updateInvoiceUserData ) {
             return {
               updateInvoiceUserData      : props.updateInvoiceUserData.data,
               showLoader                 : false,
               updateInvoiceUserStatus    : props.updateInvoiceUserData.data,
             }

           } else if ( props.updateInvoiceUserData !== undefined && props.updateInvoiceUserData.status !== 200 && props.updateInvoiceUserData.data !== state.updateInvoiceUserData ) {
             return {
               updateInvoiceUserData      : props.updateInvoiceUserData.data,
               showLoader                 : false,
               updateInvoiceUserStatus    : ''
             }
           }

           if ( props.saveAndSendData !== undefined && props.saveAndSendData.status === 200 && props.saveAndSendData.data !== state.saveAndSendData ) {
              return {
                saveAndSendData            : props.saveAndSendData.data,
                showLoader                 : false,
                saveAndSendDataStatus      : props.saveAndSendData.data,
                showNoEmailError           : false
              }

            } else if ( props.saveAndSendData !== undefined && props.saveAndSendData.status !== 200 && props.saveAndSendData.data !== state.saveAndSendData ) {
              return {
                saveAndSendData            : props.saveAndSendData.data,
                showLoader                 : false,
                saveAndSendDataStatus      : '',
                showNoEmailError           : false
              }
            }

          if( props.memberShipRefundTimestamp != undefined && props.memberShipRefundTimestamp != state.memberShipRefundTimestamp ) {
            document.body.style.overflow = "";
            return {
              showLoader: false,
              showIssueConfirmationModal: false,
              memberShipRefundTimestamp: props.memberShipRefundTimestamp,
              payRefundData      : props.memberShipRefundTimestamp,
              payRefundStatus    : props.memberShipRefundTimestamp,
            }
          }
    return null
  }

  printInvoice = () => {
    let htmlData          = document.getElementById('print_area').innerHTML
    let winPrint          = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    let inoiceTitle       = '';
    let totalToBeRemoved  = document.getElementsByClassName('proName').length

    if ( this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.invoice_number ) {
      inoiceTitle   = ' - ' + this.state.invoiceData.invoice_data.invoice_number
    }

    winPrint.document.write(`<html><head><title>Invoice ${inoiceTitle}</title>`);
    winPrint.document.write(htmlData);

    winPrint.document.getElementById('proNameHead').remove();

    for ( let i = 0; i < totalToBeRemoved; i++ ) {
     let idName = `proName_`+i;
     winPrint.document.getElementById(idName).remove();
    }

    winPrint.document.close();

		winPrint.focus();
		winPrint.print();
		setTimeout(function(){winPrint.close();}, 1000);
  }

  showConfirmationModal = () => {
    this.setState({showConfirmationModal: true})
  }

  dismissConfirmationModal = () => {
    this.setState({showConfirmationModal: false})
  }

  voidInvoice = () => {
    this.setState({showConfirmationModal: false, showLoader: true})

    this.props.voidInvoice(this.state.invoiceID);
  }

  showPaymentHistory = () => {
    this.setState({
      showLoader: true
    });

    this.props.getPaymentHistory(this.state.invoiceID);
  }

  hidePaymentHistory = () => {
    document.body.style.overflow = "";
    this.setState({showPaymentHistory: false})
  }

  componentDidUpdate = (prevProps, prevState) => {
    let returnTo = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      if ( this.props.match.params.type && this.props.match.params.type === 'profile' ) {
        returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.props.match.params.type +"/" + this.props.match.params.clientID : "/clients"
      } else {
        returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID + "/profile/invoices"  : "/clients"
      }
    } else {
      if ( this.props.match.params.type && this.props.match.params.type === 'invoices' ) {
        returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.props.match.params.type  : "/sales"
      } else {
        returnTo = (this.state.backURLType) ? "/sales/invoices"  : "/sales"
      }
    }

    if ( this.state.voidData !== null && this.state.voidData !== '' && this.state.voidData !== prevState.voidData && this.state.saveMessage !== null && this.state.saveMessage !== '' ) {
      let curObj          = ''

      toast.success(this.state.globalLang[this.state.saveMessage])
      curObj = this
      setTimeout(function(){
        curObj.props.history.push(returnTo);
      }, 1000)
    }

    if ( this.state.payRefundData !== null && this.state.payRefundData !== '' && this.state.payRefundData !== prevState.payRefundData && this.state.payRefundStatus !== null && this.state.payRefundStatus !== '' ) {
      this.setState({showLoader: true})
      this.props.getInvoiceDetails(this.state.invoiceID, this.state.clientID);
    }

    if ( this.state.updateInvoiceUserData !== null && this.state.updateInvoiceUserData !== '' && this.state.updateInvoiceUserData !== prevState.updateInvoiceUserData && this.state.updateInvoiceUserStatus !== null && this.state.updateInvoiceUserStatus !== '' ) {
     this.setState({showLoader: true})
     this.props.getInvoiceDetails(this.state.invoiceID, this.state.clientID);
    }

    if ( this.state.saveAndSendData !== null && this.state.saveAndSendData !== '' && this.state.saveAndSendData !== prevState.saveAndSendData && this.state.saveAndSendDataStatus !== null && this.state.saveAndSendDataStatus !== '' ) {
     this.setState({showLoader: true})
     this.props.getInvoiceDetails(this.state.invoiceID, this.state.clientID);
    }
  }

  showRefundModal = () => {
    this.setState({
      showLoader: true
    })

    this.props.getRefundDetails(this.state.invoiceID);
  }

  hideRefundModal = () => {
    document.body.style.overflow = "";
    this.setState({
      showRefund: false
    })
  }

  handleRefundSubmit = (e) => {
    e.preventDefault();

    let isValid = true;

    if ( this.state.refund_type === 'partial' ) {
      if ( this.state.selectedPayments && this.state.selectedPayments.length === 0 ) {
        this.setState({selectPaymentClass: 'setting-input-box-invalid'})
        isValid = false;
      } else {
        if ( !this.state.selectedPayments ) {
          this.setState({selectPaymentClass: 'setting-input-box-invalid'})
          isValid = false;
        } else {
          this.setState({selectPaymentClass: ''});
        }
      }

      if ( this.state.refund_reason === '' ) {
        this.setState({selectAReasonClass: 'setting-select-box setting-input-box-invalid'})
        isValid = false;
      } else {
        this.setState({selectAReasonClass: 'setting-select-box'});
      }

      if ( this.state.refund_reason === 'custom' ) {
        if ( this.state.text_reason_for_refund === '' ) {
          this.setState({reasonAreaClass: 'setting-textarea-box setting-input-box-invalid'})
          isValid = false;
        } else {
          this.setState({reasonAreaClass: 'setting-textarea-box'})
        }
      } else {
        this.setState({reasonAreaClass: 'setting-textarea-box', text_reason_for_refund: ''});
      }

      if ( this.state.selectedPayments && this.state.selectedPayments.obj ) {
        let modeType          = this.state.selectedPayments.obj.payment_mode
        let maxRefundableAmnt = this.state.selectedPayments.obj.max_refund

        if ( modeType === 'cash' ) {
          if ( !isNumber(this.state.cash_amount) ) {
            this.setState({cashAmountClass: "setting-input-box setting-input-box-invalid"})
            isValid = false;
          } else {
            if ( this.state.cash_amount > maxRefundableAmnt ) {
              this.setState({cashAmountClass: "setting-input-box setting-input-box-invalid"})
              isValid = false;
            } else {
              this.setState({cashAmountClass: "setting-input-box"})
            }
          }
        }

        if ( modeType === 'cc' ) {
          if ( !isNumber(this.state.cc_amount) ) {
            this.setState({ccAmountClass: "setting-input-box setting-input-box-invalid"})
            isValid = false;
          } else {
            if ( this.state.cc_amount > maxRefundableAmnt ) {
              this.setState({ccAmountClass: "setting-input-box setting-input-box-invalid"})
              isValid = false;
            } else {
              this.setState({ccAmountClass: "setting-input-box"})
            }
          }
        }

        if ( modeType === 'wallet' ) {
          if ( !isNumber(this.state.wallet_amount) ) {
            this.setState({walletAmountClass: "setting-input-box setting-input-box-invalid"})
            isValid = false;
          } else {
            if ( this.state.wallet_amount > maxRefundableAmnt ) {
              this.setState({walletAmountClass: "setting-input-box setting-input-box-invalid"})
              isValid = false;
            } else {
              this.setState({walletAmountClass: "setting-input-box"})
            }
          }
        }
      }

    } else {
      if ( this.state.refund_reason === '' ) {
        this.setState({selectAReasonClass: 'setting-select-box setting-input-box-invalid'})
        isValid = false;
      } else {
        this.setState({selectAReasonClass: 'setting-select-box'});
      }

      if ( this.state.refund_reason === 'custom' ) {
        if ( this.state.text_reason_for_refund === '' ) {
          this.setState({reasonAreaClass: 'setting-textarea-box setting-input-box-invalid'})
          isValid = false;
        } else {
          this.setState({reasonAreaClass: 'setting-textarea-box'})
        }
      } else {
        this.setState({reasonAreaClass: 'setting-textarea-box', text_reason_for_refund: ''});
      }
    }

    if ( isValid ) {
      if ( this.state.refund_type === 'partial' ) {
        let formData = {
          invoice_id            : this.state.invoiceID,
          transaction_id        : (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_transaction && this.state.invoiceData.invoice_data.pos_transaction.id) && this.state.invoiceData.invoice_data.pos_transaction.id,
          refund_type           : this.state.refund_type,
          cash_amount           : this.state.cash_amount,
          cc_amount             : this.state.cc_amount,
          wallet_amount         : this.state.wallet_amount,
          refund_reason         : this.state.refund_reason,
          text_reason_for_refund: this.state.text_reason_for_refund,
          partial_refund_ids    : [{
            payment_id          : (this.state.selectedPayments && this.state.selectedPayments.obj) ? this.state.selectedPayments.obj.pos_transaction_payment_id : 0,
            payment_via         : this.state.selectedPayments && this.state.selectedPayments.obj.payment_mode,
            payment_amount      : (this.state.selectedPayments.obj.payment_mode === 'cash') ? this.state.cash_amount : (this.state.selectedPayments.obj.payment_mode === 'cc') ? this.state.cc_amount : this.state.wallet_amount
          }]
        }

        if ( this.state.selectedPayments.obj.payment_mode === 'cash' ) {
          delete formData.cc_amount
          delete formData.wallet_amount
        }

        if ( this.state.selectedPayments.obj.payment_mode === 'cc' ) {
          delete formData.cash_amount
          delete formData.wallet_amount
        }

        if ( this.state.selectedPayments.obj.payment_mode === 'wallet' ) {
          delete formData.cash_amount
          delete formData.cc_amount
        }

        if ( this.state.refund_reason !== 'custom' ) {
          delete formData.text_reason_for_refund
        }

        this.setState({showLoader: true});
        document.body.style.overflow = "";
        this.props.payRefund(formData);
      } else {
        let formData = {
          invoice_id            : this.state.invoiceID,
          transaction_id        : (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_transaction && this.state.invoiceData.invoice_data.pos_transaction.id) && this.state.invoiceData.invoice_data.pos_transaction.id,
          refund_type           : this.state.refund_type,
          refund_reason         : this.state.refund_reason,
          text_reason_for_refund: this.state.text_reason_for_refund,
        }

        if ( this.state.refund_reason !== 'custom' ) {
          delete formData.text_reason_for_refund
        }

        this.setState({showLoader: true});
        document.body.style.overflow = "";
        this.props.payRefund(formData);
      }
    }
  }

  handleInputChange = (event) => {
     const target = event.target;
     const value = target.type === 'checkbox' ? target.checked : target.value;
     this.setState({[event.target.name]: value , dataChanged : true});

     if ( event.target.name === 'refund_reason' ) {
       if ( value !== '' ) {
         if ( value === 'custom' ) {
           this.setState({refundReasonClass: 'row row m-t-10'})
         } else {
           this.setState({refundReasonClass: 'row no-display'})
         }
       } else {
         this.setState({refundReasonClass: 'row no-display'})
       }
     }
  }

  printOrDownloadInvoice = (type) => {
    let error = false;

    if ( type && type === 1 ) {
      let patEmail = '';

      patEmail     = (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.patient) ? (this.state.invoiceData.invoice_data.patient.email) : (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.from_email) ? this.state.invoiceData.invoice_data.from_email : '';

      if ( !patEmail ) {
        error = true
      }
    }

    if ( !error ) {
      this.setState({
        showLoader: true,
        invoiceActionType : type
      });

      this.props.sendAndDownloadInvoice(this.state.invoiceID, type);
    } else {
      this.setState({showNoEmailError: true, emailInputClass: 'setting-input-box', pat_email_id: ''})
    }
  }

  printOrDownloadReceipt = (type) => {
    this.setState({
      showLoader: true,
      receiptActionType : type
    });

    this.props.sendAndDownloadRefundReceipt(this.state.invoiceID, type);
  }

  handlePaymentChange = (selectedOption) => {
    this.setState({selectedPayments: selectedOption})
  }

  handleProviderChange = (selectedOption, invoiveItemID) => {
    let x            = this.state.selectedProvider
    x[invoiveItemID] = selectedOption
    this.setState({selectedProvider: x, showLoader: true});

    let formData = {
      user_id              : selectedOption.value,
      pos_invoice_item_id  :invoiveItemID
    }

    this.props.changeUserID(formData);
  }

  componentWillUnmount = () => {
    this.props.exportEmptyData({});
  }

  closeEmailPopup = () => {
    this.setState({showNoEmailError: false, emailInputClass: 'setting-input-box', pat_email_id: ''})
  }

  handleEmailSubmit = (e) => {
    e.preventDefault();

    let error = false;

    if ( !this.state.pat_email_id ) {
      error = true;
      this.setState({
        emailInputClass: 'setting-input-box setting-input-box-invalid'
      })
    }

    if ( this.state.pat_email_id && !validator.isEmail(this.state.pat_email_id) ) {
      error = true;
      this.setState({
        emailInputClass: 'setting-input-box setting-input-box-invalid'
      })
    }

    if ( !error ) {
      this.setState({
        emailInputClass: 'setting-input-box',
        showLoader     : true
      })

      let formData = {
        patient_id : this.state.clientID,
        email      : this.state.pat_email_id,
        invoice_id : this.state.invoiceID
      }

      this.props.saveAndSendEmail(formData)
    }
  }

  refundIssue = () => {
    this.setState({showLoader: true, showIssueConfirmationModal: false})
    this.props.refundIssue(this.state.invoiceID);
  }

  render() {
    let returnTo = '';

    if ( this.state.backURLType && this.state.backURLType === 'clients' ) {
      if ( this.props.match.params.type && this.props.match.params.type === 'profile' ) {
        returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.props.match.params.type +"/" + this.props.match.params.clientID : "/clients"
      } else {
        returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.props.match.params.type + "/" + this.props.match.params.clientID + "/profile/invoices"  : "/clients"
      }
    } else {
      if ( this.props.match.params.type && this.props.match.params.type === 'invoices' ) {
        returnTo = (this.state.backURLType) ? "/" + this.state.backURLType + "/" + this.props.match.params.type  : "/sales"
      } else {
        returnTo = (this.state.backURLType) ? "/sales/invoices"  : "/sales"
      }
    }

    let logoSrc           = (this.state.invoiceData && this.state.invoiceData.logo_img_src) ? this.state.invoiceData.logo_img_src : defLogo

    let inoiceTitle       = (this.state.invoiceData && this.state.invoiceData.invoice_data) ? this.state.invoiceData.invoice_data.title : ''

    let address           = ''
    address               += (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.patient && this.state.invoiceData.invoice_data.patient.address_line_1 && this.state.invoiceData.invoice_data.patient.address_line_1 !== "") ? this.state.invoiceData.invoice_data.patient.address_line_1 : ''

    if ( address !== '' ) {
      address += ', '
    }

    address               += (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.patient && this.state.invoiceData.invoice_data.patient.address_line_2 && this.state.invoiceData.invoice_data.patient.address_line_2 !== "") ? this.state.invoiceData.invoice_data.patient.address_line_2 : ''

    let isMonthlyMember   = (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.patient) ? this.state.invoiceData.invoice_data.patient.is_monthly_membership : 0;

    let showVoid          = (this.state.invoiceData && this.state.invoiceData.invoice_data &&  (this.state.invoiceData.invoice_data.invoice_status === 'canceled' || this.state.invoiceData.invoice_data.invoice_status === 'refunded' || this.state.invoiceData.invoice_data.invoice_status === 'draft' || this.state.invoiceData.invoice_data.title === 'Treatment Plan')) ? false : true;
    let showPaymentHistory= (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.invoice_status !== 'draft') ? true : false;

    let refundOptions     = 'refunded';
    let refundedAmnt      = 0;
    let totalPaidAmnt     = 0;

    (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_transaction && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments.length > 0) && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments.map((obj, idx) => {
      refundedAmnt  += obj.refund_amount;
      totalPaidAmnt += obj.total_amount;
    })

    if (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_transaction && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments.length > 0) {
      if ( refundedAmnt === totalPaidAmnt ) {
        refundOptions = 'refunded';
      } else {
        refundOptions = 'paid';
      }
    }

    if (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.title && this.state.invoiceData.invoice_data.title === "Treatment Plan") {
      refundOptions = 'refunded';
    }

    if ( this.state.invoiceData && this.state.invoiceData.invoice_data &&  (this.state.invoiceData.invoice_data.invoice_status === 'canceled') ) {
      refundOptions = 'refunded';
    }

    let showRefund    = true;
    let refundOption  = 'paid';

    let invoiceStatus = (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.invoice_status) ? this.state.invoiceData.invoice_data.invoice_status : ''

    if ( invoiceStatus && invoiceStatus === 'partial paid' ) {
      refundOption  = 'refunded'
    }

    let showHideRefundBtn = false;

    (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_invoice_items && this.state.invoiceData.invoice_data.pos_invoice_items.length > 0) && this.state.invoiceData.invoice_data.pos_invoice_items.map((obj, idx) => {
      let productType = obj.product_type;

      if ( productType === 'monthly_membership' ) {
        showHideRefundBtn = true
        return
      }
    })

    if ( showHideRefundBtn ) {
      showVoid = false
    }

    let totalAmount     = 0;
    let creditMode      = 'care_credit';
    var availPayments   = [];

    this.state.getRefundData && this.state.getRefundData.refund_options && this.state.getRefundData.refund_options.length > 0 && this.state.getRefundData.refund_options.map((obj, idx) => {
      totalAmount   = obj.max_refund;
      creditMode    = obj.payment_mode;
      let labelStr  = numberFormat( obj.max_refund, 'currency') + ` paid via ` + obj.payment_mode
      availPayments.push({value: obj.pos_transaction_payment_id,  label: labelStr, obj: obj})
    })

    let showNameOnly      = (this.state.invoiceData && this.state.invoiceData.can_edit === 0) ? 'true' : 'false';

    var defaultProviders  = [];

    if ( this.state.invoiceData && this.state.invoiceData.all_employees && this.state.invoiceData.all_employees.length > 0 ) {
     this.state.invoiceData.all_employees.map((obj, idx) => {
         defaultProviders.push({value: obj.id,  label: displayName(obj)})
     })
    }

    return (
      <div id="content">
        <div className="container-fluid content setting-wrapper">
         <div className={(this.state.showNoEmailError === true ) ? 'modalOverlay' : ''}>
           <form onSubmit={this.handleEmailSubmit}>
             <div className={(this.state.showNoEmailError === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
               <div className="small-popup-header">
                 <div className="popup-name">{this.state.globalLang.inv_email_not_configure}</div>
                 <a onClick={() => this.closeEmailPopup()} className="small-cross">×</a>
               </div>
               <div className="small-popup-content">
                 <div className="juvly-container no-padding-bottom">
                     <div className="row">
                       <div className="col-xs-12">
                         <div className="setting-field-outer">
                           <div className="new-field-label">{this.state.globalLang.inv_please_enter_email_address}<span className="setting-require">*</span></div>
                           <input className={this.state.emailInputClass} type="text" name="pat_email_id" value={this.state.pat_email_id} onChange={this.handleInputChange} placeholder={this.state.globalLang.emailAddress}/>
                         </div>
                       </div>
                     </div>
                 </div>
               </div>
               <div className="footer-static">
                 <input type="submit" className="new-blue-btn pull-right" value={this.state.globalLang.inv_save_and_send} />
               </div>
             </div>
            </form>
         </div>


         <div className={(this.state.showLoader === false && this.state.showRefund === true ) ? 'modalOverlay' : ''}>
           <form onSubmit={this.handleRefundSubmit}>
             <div className={(this.state.showLoader === false && this.state.showRefund === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
               <div className="small-popup-header">
                 <div className="popup-name">{this.state.globalLang.inv_issue_refund}</div>
                 <a onClick={() => this.hideRefundModal()} className="small-cross">×</a>
               </div>
               <div className="small-popup-content">

                 {(this.state.getRefundData && this.state.getRefundData.refund_options && this.state.getRefundData.refund_options.length > 0) && <div className="juvly-container">

                    <div className="row">
                        <div className="col-xs-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.globalLang.inv_refund_type}</div>
                              <div className="setting-input-outer">
                                <div className="basic-checkbox-outer">
                                  <input id="full" className="basic-form-checkbox" name="refund_type" type="radio" value="full" checked={(this.state.refund_type === 'full') ? true : false} onChange={this.handleInputChange} disabled={(this.state.getRefundData && this.state.getRefundData.available_options && this.state.getRefundData.available_options.indexOf('full-refund') === -1) ? true : false}/>
                                  <label className="basic-form-text" htmlFor="full">{this.state.globalLang.inv_full_refund}</label></div><div className="basic-checkbox-outer">
                                  <input id="partial" className="basic-form-checkbox" name="refund_type" type="radio" value="partial" checked={(this.state.refund_type === 'partial') ? true : false} onChange={this.handleInputChange}/>
                                  <label className="basic-form-text" htmlFor="partial">{this.state.globalLang.inv_partial_refund}</label>
                                </div>
                              </div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.globalLang.inv_select_payment} <span className="required">*</span></div>

                              {(this.state.getRefundData && this.state.refund_type === 'full') && <div className="setting-input-outer">
                                <input className="setting-input-box" type="text" name="full_refund_amount" readOnly={true} value={(this.state.getRefundData && this.state.getRefundData.total_amount) ? numberFormat(this.state.getRefundData.total_amount, 'decimal') : numberFormat(0, 'decimal')} onChange={this.handleInputChange}/>
                              </div>}
                              {(this.state.getRefundData && this.state.refund_type === 'partial') && <div className="setting-input-outer">
                                {
                                   availPayments && <Select
                                    onChange={this.handlePaymentChange}
                                    name="partial_refund_ids"
                                    value={this.state.selectedPayments}
                                    isClearable
                                    isSearchable
                                    options={availPayments}
                                    isMulti={false}
                                    className={this.state.selectPaymentClass}
                                  />
                                }
                              </div>}
                            </div>
                        </div>
                        <div className="col-sm-6 col-xs-12">
                            <div className="setting-field-outer">
                              <div className="new-field-label">{this.state.globalLang.inv_select_a_reason} <span className="required">*</span></div>
                              <div className="setting-input-outer">
                                <select className={this.state.selectAReasonClass} name="refund_reason" onChange={this.handleInputChange} value={this.state.refund_reason}>
                                  <option value="">{this.state.globalLang.label_select}</option>
                                  <option value="returned_goods">{this.state.globalLang.inv_returned_goods}</option>
                                  <option value="accidental_charge">{this.state.globalLang.inv_accidental_charge}</option>
                                  <option value="canceled_order">{this.state.globalLang.inv_canceled_order}</option>
                                  <option value="custom">{this.state.globalLang.inv_custom}</option>
                                </select>
                              </div>
                            </div>
                        </div>
                    </div>

                    {(this.state.selectedPayments && this.state.selectedPayments.obj && this.state.selectedPayments.obj.payment_mode === "cash") && <div className="row m-t-5">
                        <div className="col-xs-12">
                          <div className="new-field-label">{this.state.globalLang.inv_refund_cash} <span className="required">*</span></div>
                          <input className={this.state.cashAmountClass} type="text" name="cash_amount" value={this.state.cash_amount} onChange={this.handleInputChange}/>
                        </div>
                    </div>}
                    {(this.state.selectedPayments && this.state.selectedPayments.obj && this.state.selectedPayments.obj.payment_mode === "cc") && <div className="row m-t-5">
                        <div className="col-xs-12">
                          <div className="new-field-label">{this.state.globalLang.inv_refund_cc} <span className="required">*</span></div>
                          <input className={this.state.ccAmountClass} type="text" name="cc_amount" value={this.state.cc_amount} onChange={this.handleInputChange}/>
                        </div>
                    </div>}
                    {(this.state.selectedPayments && this.state.selectedPayments.obj && this.state.selectedPayments.obj.payment_mode === "wallet") && <div className="row m-t-5">
                        <div className="col-xs-12">
                          <div className="new-field-label">{this.state.globalLang.inv_refund_wallet} <span className="required">*</span></div>
                          <input className={this.state.walletAmountClass} type="text" name="wallet_amount" value={this.state.wallet_amount} onChange={this.handleInputChange}/>
                        </div>
                    </div>}

                    <div className={this.state.refundReasonClass}>
                        <div className="col-xs-12">
                          <div className="new-field-label">{this.state.globalLang.inv_reason_for_refund} <span className="required">*</span></div>
                          <textarea className={this.state.reasonAreaClass} name="text_reason_for_refund" onChange={this.handleInputChange} value={this.state.text_reason_for_refund}></textarea>
                        </div>
                    </div>

                 </div>}

                 {(this.state.getRefundData && this.state.getRefundData.refund_options && this.state.getRefundData.refund_options.length === 0) && <div className="juvly-container">
                    <div className="row">
                      <div className="col-xs-12">
                        <p style={{fontSize: '18px', textAlign: 'center'}}>{this.state.globalLang.inv_unable_to_refund} {this.state.globalLang.inv_payment_done_via_care_credit}</p>
                      </div>
                    </div>
                 </div>}
               </div>
               {(this.state.getRefundData && this.state.getRefundData.refund_options && this.state.getRefundData.refund_options.length > 0) && <div className="footer-static">
                 <input type="submit" className="new-blue-btn pull-right" value="Issue Refund" />
               </div>}
               </div>
             </form>
         </div>

         {(this.state.showLoader === false) && <div className={(this.state.showPaymentHistory === true ) ? 'modalOverlay' : ''}>

             <div className={(this.state.showPaymentHistory === true) ? 'small-popup-outer appointment-detail-main displayBlock' : 'small-popup-outer appointment-detail-main no-display'}>
               <div className="small-popup-header">
                 <div className="popup-name">{this.state.globalLang.inv_invoice_no_uppercase} : {(this.state.historyData && this.state.historyData.invoice_number) && this.state.historyData.invoice_number}</div>
                 <a onClick={() => this.hidePaymentHistory()} className="small-cross">×</a>
               </div>
               <div className="small-popup-content">
                 <div className="juvly-container no-padding-bottom">

               <div className="prescription-content">
                  <div className="doc-section">


                    <span className="juvly-subtitle m-b-10">{this.state.globalLang.inv_payments}</span>

                    <div className="table-responsive m-b-30">
                      <table className="table-updated juvly-table no-hover">
                        <thead className="table-updated-thead">
                          <tr>
                            <th className="col-xs-3 table-updated-th">{this.state.globalLang.inv_payments_mode}</th>
                            <th className="col-xs-3 table-updated-th text-right">{this.state.globalLang.label_date}</th>
                            <th className="col-xs-3 table-updated-th text-right">{this.state.globalLang.label_amount}</th>
                          </tr>
                        </thead>
                        <tbody className="ajax_body">
                          {(this.state.showLoader === false && this.state.historyData && this.state.historyData.pos_transaction && this.state.historyData.pos_transaction.pos_transactions_payments && this.state.historyData.pos_transaction.pos_transactions_payments.length > 0) && this.state.historyData.pos_transaction.pos_transactions_payments.map((obj, idx) => {
                            let paymentMode = '';
                            let paymentDate = '';
                            let totalAmount = '';

                            if ( obj.payment_mode === 'cc' ) {
                              paymentMode = this.state.globalLang.inv_credit_card_ending+' ' + obj.cc_number;
                            } else if ( obj.payment_mode === 'wallet' ) {
                              paymentMode = this.state.globalLang.inv_wallet;
                            } else if ( obj.payment_mode === 'care_credit' ) {
                              paymentMode = this.state.globalLang.inv_care_credit;
                            } else {
                              paymentMode = this.state.globalLang.inv_cash;
                            }

                            totalAmount = numberFormat(obj.total_amount, 'currency', 2)

                            if ( obj.created ) {
                              paymentDate = showFormattedDate(obj.created, false, 'MMMM DD, Y');
                            } else {
                              paymentDate = showFormattedDate(this.state.historyData.pos_transaction.transaction_datetime, false, 'MMMM DD, Y');
                            }

                            return (
                              <tr key={idx} className="table-updated-tr">
                                <td className="table-updated-td">{paymentMode}</td>
                                <td className="table-updated-td text-right">{paymentDate}</td>
                                <td className="table-updated-td text-right">{totalAmount}</td>
                              </tr>
                            )
                          })
                          }
                        </tbody>
                      </table>
                      <div className={(this.state.showLoader === false && this.state.historyData && this.state.historyData.pos_transaction && this.state.historyData.pos_transaction.pos_transactions_payments && this.state.historyData.pos_transaction.pos_transactions_payments.length > 0) ? "no-record no-display" : "no-record"}>
                        {this.state.globalLang.sorry_no_record_found}
                      </div>
                    </div>


                     <span className="juvly-subtitle juvly-subtitle m-b-10">{this.state.globalLang.inv_refunds}</span>

                     <div className="table-responsive">
                       <table className="table-updated juvly-table no-hover">
                         <thead className="table-updated-thead">
                           <tr>
                             <th className="col-xs-3 table-updated-th">{this.state.globalLang.inv_payments_mode}</th>
                             <th className="col-xs-3 table-updated-th text-right">{this.state.globalLang.label_date}</th>
                             <th className="col-xs-3 table-updated-th text-right">{this.state.globalLang.label_amount}</th>
                           </tr>
                         </thead>
                         {<tbody className="ajax_body">
                             {(this.state.showLoader === false && this.state.historyData && this.state.historyData.pos_transaction && this.state.historyData.pos_transaction.pos_transactions_payments && this.state.historyData.pos_transaction.pos_transactions_payments.length > 0) && this.state.historyData.pos_transaction.pos_transactions_payments.map((obj, idx) => {
                               if ( obj.payment_status === 'refunded' ) {
                                 showRefund      = false;

                                 let paymentMode = '';
                                 let paymentDate = '';
                                 let totalAmount = '';

                                 if ( obj.payment_mode === 'cc' ) {
                                   paymentMode = this.state.globalLang.inv_credit_card;
                                 } else if ( obj.payment_mode === 'wallet' ) {
                                   paymentMode = this.state.globalLang.inv_wallet;
                                 } else {
                                   paymentMode = this.state.globalLang.inv_cash;
                                 }

                                 totalAmount = numberFormat(obj.refund_amount, 'currency', 2)

                                 if ( obj.refund_datetime ) {
                                   paymentDate = showFormattedDate(obj.refund_datetime, false, 'MMMM DD, Y');
                                 } else {
                                   paymentDate = showFormattedDate(this.state.historyData.pos_transaction.transaction_datetime, false, 'MMMM DD, Y');
                                 }

                                 return (
                                   <tr key={idx} className="table-updated-tr">
                                     <td className="table-updated-td">{paymentMode}
                                      <br/> Refund Reason : {(obj.refund_reason) ? obj.refund_reason.replace("_", " ") : ""}
                                     </td>
                                     <td className="table-updated-td text-right">{paymentDate}</td>
                                     <td className="table-updated-td text-right">{totalAmount}</td>
                                   </tr>
                                 )
                               }
                             })
                             }
                         </tbody>}
                       </table>
                       <div className={(this.state.showLoader === false && this.state.historyData && this.state.historyData.pos_transaction && this.state.historyData.pos_transaction.pos_transactions_payments && this.state.historyData.pos_transaction.pos_transactions_payments.length > 0 && showRefund !== true) ? "no-record no-display" : "no-record"}>
                         {this.state.globalLang.sorry_no_record_found}
                       </div>
                     </div>

                   </div>
                 </div>
                 </div>
               </div>
               </div>

         </div>}


         <div className="juvly-section full-width m-t-15">
             <div className="juvly-container">
               <div className="juvly-title m-b-40">{this.state.globalLang.inv_invoice_preview}
                 <Link to={returnTo} className="pull-right"><img src="../../../../images/close.png" /></Link>
               </div>

               <div className={(this.state.showConfirmationModal === true ) ? 'overlay' : ''}></div>
               <div id="filterModal" role="dialog" className={(this.state.showConfirmationModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
                 <div className="modal-dialog">
                   <div className="modal-content">
                     <div className="modal-header">
                       <button type="button" className="close" data-dismiss="modal" onClick={this.dismissConfirmationModal}>×</button>
                       <h4 className="modal-title">{this.state.globalLang.delete_confirmation}</h4>
                     </div>
                     <div className="modal-body add-patient-form filter-patient">
                       {this.state.globalLang.inv_are_you_sure_you_want_to_void_this_invoice}
                     </div>
                     <div className="modal-footer" >
                       <div className="col-md-12 text-left">
                         <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={this.dismissConfirmationModal}>{this.state.globalLang.label_no}</button>
                         <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.voidInvoice}>{this.state.globalLang.label_yes}</button>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

              <div className="invoice-preview-outer">
               <center>
                 <table id="print_area" border={0} cellPadding={0} cellSpacing={0} height="100%" width={700}>
                   <tbody>
                     <tr>
                       <td align="center" valign="top">
                         <table border={0} cellPadding={0} cellSpacing={0} width={700}>
                           <tbody>
                             <tr>
                               <td valign="top">
                                 <table border={0} cellPadding={5} cellSpacing={0} width={700}>
                                   <tbody>
                                     <tr>
                                       <td valign="top" width={400}>
                                         <div style={{padding: '5px 0px'}}>
                                           {(this.state.showLoader === false) && <img src={logoSrc} style={{height: '70px'}} />}
                                         </div>
                                       </td>
                                       <td valign="top" width={400} align="right">
                                         <div style={{fontSize: '24px', textAlign: 'right', paddingTop: '22px', padding: '10px 0px'}}>
                                            {inoiceTitle}
                                         </div>
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>
                               </td>
                             </tr>
                           </tbody>
                         </table>
                         <table border={0} cellPadding={0} cellSpacing={0} width={700}>
                           <tbody>
                             <tr>
                               <td align="center" valign="top">
                                 <table border={0} cellPadding={0} cellSpacing={0} width={700}>
                                   <tbody>
                                     <tr>
                                       <td colSpan={3} valign="top">
                                         <table border={0} cellPadding={10} cellSpacing={0} width={700}>
                                           <tbody>
                                             <tr>
                                               <td valign="top">
                                                 <div style={{fontSize: '14px', color: '#777777', lineHeight: '22px', padding: '10px 0px'}}>
                                                   {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.clinic) ? capitalizeFirstLetter(this.state.invoiceData.invoice_data.clinic.clinic_name) : ''}<br />
                                                   {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.clinic) ? this.state.invoiceData.invoice_data.clinic.contact_no : ''}
                                                 </div>
                                               </td>
                                             </tr>
                                             <tr>
                                               <td valign="top">
                                                 <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                   {this.state.globalLang.inv_invoice_to}
                                                 </div>
                                                 <div style={{fontSize: '20px', color: '#777777', fontWeight: 400}}>
                                                   {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.patient) && displayName(this.state.invoiceData.invoice_data.patient)}
                                                 </div>
                                               </td>
                                             </tr>
                                             {(address) ? <tr>
                                               <td valign="top">
                                                 <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                   {this.state.globalLang.label_address}
                                                 </div>
                                                 <div style={{fontSize: '14px', color: '#777777', fontWeight: 400}}>
                                                   {address}
                                                 </div>
                                               </td>
                                             </tr> : <tr></tr>}
                                             <tr>
                                               <td valign="top" width={400}>
                                                 <div style={{fontSize: '14px', color: '#000000', padding: '10px 0px 3px'}}>
                                                   {this.state.globalLang.label_email}
                                                 </div>
                                                 <div style={{fontSize: '14px', color: '#777777', fontWeight: 400}}>
                                                   {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.patient) ? (this.state.invoiceData.invoice_data.patient.email) : (this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.from_email) ? this.state.invoiceData.invoice_data.from_email : ''}
                                                 </div>
                                               </td>
                                               <td valign="top" width={400} align="right">
                                                 <table width={260} style={{float: 'right', fontSize: '14px', padding: '10px 0px'}}>
                                                   <tbody>
                                                     <tr>
                                                       <td align="left" className="text-capitalize">{this.state.globalLang.inv_invoice_no}:</td>
                                                       <td style={{color: '#777777', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.invoice_number) ? this.state.invoiceData.invoice_data.invoice_number : ''}</td>
                                                     </tr>
                                                     <tr>
                                                       <td align="left">{this.state.globalLang.inv_invoice_date}:</td>
                                                       <td style={{color: '#777777', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.created) ? (this.state.invoiceData.invoice_data.created) : ''}</td>
                                                     </tr>
                                                     {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.payment_datetime) && <tr> 
                                                       <td align="left">{this.state.globalLang.inv_payment_on}:</td>
                                                       <td style={{color: '#777777', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.payment_datetime) ? (this.state.invoiceData.invoice_data.payment_datetime) : ''}</td>
                                                     </tr>}
                                                   </tbody>
                                                 </table>
                                               </td>
                                             </tr>
                                           </tbody>
                                         </table>
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>
                               </td>
                             </tr>
                             <tr>
                               <td colSpan={3} valign="top">
                                 <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px'}}>
                                   <tbody>
                                     <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}} width="230">
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>Item description</div>
                                       </td>
                                       <td style={{borderBottom: '1px solid #dddddd'}} align="right" width="100">
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>Price</div>
                                       </td>
                                       <td id="proNameHead" style={{borderBottom: '1px solid #dddddd'}} align="right" width="330">
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>Employee</div>
                                       </td>
                                     </tr>

                                     {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_invoice_items && this.state.invoiceData.invoice_data.pos_invoice_items.length > 0) && this.state.invoiceData.invoice_data.pos_invoice_items.map((obj, idx) => {

                                       let productType    = obj.product_type;
                                       let productName    = '';
                                       let usedProduct    = '';
                                       let invoiceItemID  = obj.id;
                                       let userID         = obj.user_id;
                                       let cusProName     = obj.custom_product_name;

                                       if ( productType === 'custom' ) {
                                         productName = obj.custom_product_name;
                                       } else if ( productType === 'others' || productType === 'injectable' ) {
                                         let oldPrice = obj.total_product_price / obj.product_units;
                                         oldPrice     = numberFormat(oldPrice, 'currency');
                                         let proName  = (obj.product && obj.product.product_name) ? obj.product.product_name : ''
                                         productName  = obj.product_units + ' '+this.state.globalLang.inv_units_of+' ' + proName + ' '+this.state.globalLang.inv_priced+' ' + oldPrice;
                                       } else if ( productType === 'package' ) {
                                         productName = (obj.discount_package && obj.discount_package.name) ? obj.discount_package.name : '';

                                         if ( this.state.invoiceData && this.state.invoiceData.package_products_data && this.state.invoiceData.package_products_data[obj.id] ) {
                                           this.state.invoiceData.package_products_data[obj.id].map((pobj, pidx) => {
                                             if ( pidx === 1 ) {
                                               usedProduct = (pobj.product) ? pobj.product.product_name : ''
                                             } else {
                                               usedProduct += ', ' + (pobj.product) ? pobj.product.product_name : ''
                                             }
                                           })
                                         }
                                       } else if ( productType === 'egiftcard' ) {
                                         productName = this.state.globalLang.inv_eGift_card_worth_amount+' ' + numberFormat(obj.total_product_price, 'currency')
                                       } else if ( productType === 'consultation_fee' ) {
                                         productName = this.state.globalLang.inv_consultation_fee
                                       } else if ( productType === 'treatment_plan' ) {
                                         productName = this.state.globalLang.inv_treatment_plan
                                       } else if ( productType === 'monthly_membership' && cusProName === 'monthly_membership' ) {
                                         productName = this.state.globalLang.inv_monthly_membership_fee
                                       } else if ( productType === 'monthly_membership' && cusProName === 'one_time_setup_fee' ) {
                                         productName = this.state.globalLang.inv_one_time_setup_fee
                                       }

                                       return (
                                         <tr className={(productType === 'monthly_membership' && cusProName === 'one_time_setup_fee' && obj.total_product_price == 0) ? 'no-display' : '' } key={idx}>
                                           <td style={{borderBottom: '1px solid #dddddd'}}>
                                             <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>{productName} <br/> {(usedProduct !== '') ? '(' + usedProduct + ')' : ''}</div>
                                           </td>
                                           <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                             <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{(obj.total_product_price) ? numberFormat(obj.total_product_price, 'currency') : numberFormat(0, 'currency')}</div>
                                           </td>
                                           <td className="proName" id={`proName_`+idx} align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                              {
                                                (showNameOnly && showNameOnly === 'true') &&
                                                <div>
                                                    {(this.state.invoiceData && this.state.invoiceData.all_employees && this.state.invoiceData.all_employees.length > 0) && this.state.invoiceData.all_employees.map((iobj, iidx) => {
                                                      if ( iobj.id === userID ) {
                                                        return displayName(iobj);
                                                      }
                                                    })}
                                                </div>
                                              }

                                              {
                                                (showNameOnly && showNameOnly === 'false') &&
                                                <div style={{width: '210px'}}>
                                                {
                                                  (checkIfPermissionAllowed('invoice-provider-change')) ?
                                                  defaultProviders && <Select
                                                  onChange={(value) => this.handleProviderChange(value, invoiceItemID)}
                                                  name={"providers_" + obj.id}
                                                  value={this.state.selectedProvider[invoiceItemID]}
                                                  isClearable={false}
                                                  isSearchable
                                                  options={defaultProviders}
                                                  isMulti={false}
                                                />
                                                :
                                                <div>
                                                    {(this.state.invoiceData && this.state.invoiceData.all_employees && this.state.invoiceData.all_employees.length > 0) && this.state.invoiceData.all_employees.map((iobj, iidx) => {
                                                      if ( iobj.id === userID ) {
                                                        return displayName(iobj);
                                                      }
                                                    })}
                                                </div>
                                                }
                                                </div>
                                              }
                                           </td>
                                         </tr>
                                       )
                                     }) }

                                   </tbody>
                                 </table>
                                 {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  (this.state.invoiceData.invoice_data.aspire_discount > 0 || this.state.invoiceData.invoice_data.bd_discount > 0 || this.state.invoiceData.invoice_data.prepayment_adjustment > 0 || this.state.invoiceData.invoice_data.package_discount > 0 || this.state.invoiceData.invoice_data.egift_Card_amount > 0) && <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px'}}>
                                   <tbody>
                                     <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>{this.state.globalLang.inv_redemptions}</div>
                                       </td>
                                       <td style={{borderBottom: '1px solid #dddddd'}} align="right">
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>{this.state.globalLang.label_amount}</div>
                                       </td>
                                     </tr>
                                     {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  this.state.invoiceData.invoice_data.aspire_discount > 0 && <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>{this.state.globalLang.inv_aspire_discount}</div>
                                       </td>
                                       <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                         <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.aspire_discount) ? numberFormat(this.state.invoiceData.invoice_data.aspire_discount, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                     </tr>}
                                     {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  this.state.invoiceData.invoice_data.bd_discount > 0 && <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>{this.state.globalLang.inv_bd_discount}</div>
                                       </td>
                                       <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                         <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.bd_discount) ? numberFormat(this.state.invoiceData.invoice_data.bd_discount, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                     </tr>}
                                     {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  this.state.invoiceData.invoice_data.prepayment_adjustment > 0 && <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>{this.state.globalLang.inv_wallet_debits}</div>
                                       </td>
                                       <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                         <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.prepayment_adjustment) ? numberFormat(this.state.invoiceData.invoice_data.prepayment_adjustment, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                     </tr>}
                                     {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  this.state.invoiceData.invoice_data.package_discount > 0 && <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>{this.state.globalLang.inv_packages_discount}</div>
                                       </td>
                                       <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                         <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.package_discount) ? numberFormat(this.state.invoiceData.invoice_data.package_discount, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                     </tr>}
                                     {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  this.state.invoiceData.invoice_data.egift_Card_amount > 0 && <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>{this.state.globalLang.inv_eGiftcard_amount}</div>
                                       </td>
                                       <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                         <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.egift_Card_amount) ? numberFormat(this.state.invoiceData.invoice_data.egift_Card_amount, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                     </tr>}
                                   </tbody>
                                 </table>}
                                 <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px', border: '1px solid #000', marginBottom: '25px'}}>
                                   <tbody>
                                     <tr>
                                       <td width={(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  (this.state.invoiceData.invoice_data.aspire_discount > 0 || this.state.invoiceData.invoice_data.bd_discount > 0 || this.state.invoiceData.invoice_data.prepayment_adjustment > 0 || this.state.invoiceData.invoice_data.package_discount > 0 || this.state.invoiceData.invoice_data.egift_Card_amount > 0) ? 120 : 0} style={{padding: '10px'}}>
                                         <div style={{fontSize: '13px', color: '#777777'}}>{this.state.globalLang.inv_tax_uppercase}</div>
                                         <div style={{fontSize: '17px', color: '#000000', fontWeight: 400}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.total_tax) ? numberFormat(this.state.invoiceData.invoice_data.total_tax, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                       {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  this.state.invoiceData.invoice_data.total_discount > 0 && <td width={160}>
                                         <div style={{fontSize: '13px', color: '#777777'}}>{this.state.globalLang.inv_item_discount_uppercase}</div>
                                         <div style={{fontSize: '17px', color: '#000000', fontWeight: 400}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.total_discount) ? numberFormat(this.state.invoiceData.invoice_data.total_discount, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>}
                                       {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  this.state.invoiceData.invoice_data.custom_discount > 0 && <td width={180}>
                                         <div style={{fontSize: '13px', color: '#777777'}}>{this.state.globalLang.inv_custom_discount_uppercase}</div>
                                         <div style={{fontSize: '17px', color: '#000000', fontWeight: 400}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.custom_discount) ? numberFormat(this.state.invoiceData.invoice_data.custom_discount, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>}
                                       {(this.state.invoiceData && this.state.invoiceData.invoice_data) &&  this.state.invoiceData.invoice_data.tip_amount > 0 && <td width={120}>
                                         <div style={{fontSize: '13px', color: '#777777'}}>{this.state.globalLang.inv_tip_uppercase}</div>
                                         <div style={{fontSize: '17px', color: '#000000', fontWeight: 400}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.tip_amount) ? numberFormat(this.state.invoiceData.invoice_data.tip_amount, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>}
                                       <td width={220} style={{background: '#000000', padding: '10px'}} align="right">
                                         <div style={{fontSize: '13px', color: '#ffffff', textAlign: 'right'}}>{this.state.globalLang.inv_total_uppercase}</div>
                                         <div style={{fontSize: '17px', color: '#ffffff', fontWeight: 400, textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.total_amount) ? numberFormat(this.state.invoiceData.invoice_data.total_amount, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>


                                 {(isMonthlyMember === 1) ? <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px'}}>
                                   <tbody>
                                     <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>{this.state.globalLang.inv_membership_benefits_uppercase}</div>
                                       </td>
                                       <td style={{borderBottom: '1px solid #dddddd'}} align="right">
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>{this.state.globalLang.label_amount}</div>
                                       </td>
                                     </tr>
                                     <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                           {this.state.globalLang.inv_membership_savings_on_todays_visit}
                                         </div>
                                       </td>
                                       <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                         <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data) ? numberFormat(this.state.invoiceData.invoice_data.membership_benefit, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                     </tr>
                                     <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                           {this.state.globalLang.inv_your_membership_savings_this_year}
                                         </div>
                                       </td>
                                       <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                         <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.patient) ? numberFormat(this.state.invoiceData.invoice_data.patient.membership_benefits_this_year, 'currency') : numberFormat(0, 'currency')}</div>
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table> : ''}


                                 {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_transaction && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments) ? <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px'}}>
                                   <tbody>
                                     <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>{this.state.globalLang.inv_payments}</div>
                                       </td>
                                       <td style={{borderBottom: '1px solid #dddddd'}} align="right">
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}>{this.state.globalLang.label_amount}</div>
                                       </td>
                                     </tr>

                                     {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_transaction && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments.length > 0) && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments.map((obj, idx) => {
                                         let paymentMode = ''

                                         if ( obj.payment_mode === 'cc' ) {
                                           paymentMode = this.state.globalLang.inv_credit_card_ending+' ' + obj.cc_number
                                         } else if ( obj.payment_mode === 'care_credit' ) {
                                           paymentMode = this.state.globalLang.inv_care_credit

                                           if ( obj.care_credit_note !== '' ) {
                                             paymentMode += ' '+this.state.globalLang.label_note+' - ' + obj.care_credit_note
                                           }
                                         } else {
                                           paymentMode = capitalizeFirstLetter(obj.payment_mode)
                                         }

                                         return (
                                           <tr key={idx}>
                                             <td style={{borderBottom: '1px solid #dddddd'}}>
                                               <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                                 {paymentMode}
                                               </div>
                                             </td>
                                             <td align="right" style={{borderBottom: '1px solid #dddddd', padding: '10px 0px'}}>
                                               <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{numberFormat(obj.total_amount, 'currency')}</div>
                                             </td>
                                           </tr>
                                         )
                                       })
                                     }

                                   </tbody>
                                 </table> : ''}

                                 {(this.state.invoiceData && this.state.invoiceData.invoice_data && (this.state.invoiceData.invoice_data.invoice_status === 'refunded' || this.state.invoiceData.invoice_data.invoice_status === 'partial_refunded') && this.state.invoiceData.invoice_data.pos_transaction && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments.length > 0) ? <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '25px', marginBottom: '15px'}}>

                                   <tbody>
                                     <tr>
                                       <td style={{borderBottom: '1px solid #dddddd'}}>
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', padding: '10px 0px'}}>{this.state.globalLang.inv_refund}</div>
                                       </td>
                                       <td style={{borderBottom: '1px solid #dddddd'}} align="right">
                                         <div style={{fontSize: '13px', color: '#000000', textTransform: 'uppercase', textAlign: 'right', padding: '10px 0px'}}></div>
                                       </td>
                                     </tr>

                                     {(this.state.showLoader === false && this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.pos_transaction && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments.length > 0) && this.state.invoiceData.invoice_data.pos_transaction.pos_transactions_payments.map((obj, idx) => {

                                         if ( obj.payment_status === 'refunded' ) {
                                           showRefund      = false;

                                           let paymentMode = '';
                                           let paymentDate = '';
                                           let totalAmount = '';

                                           if ( obj.payment_mode === 'cc' ) {
                                             paymentMode = this.state.globalLang.inv_credit_card;
                                           } else if ( obj.payment_mode === 'wallet' ) {
                                             paymentMode = this.state.globalLang.inv_wallet;
                                           } else {
                                             paymentMode = this.state.globalLang.inv_cash;
                                           }

                                           totalAmount = numberFormat(obj.refund_amount, 'currency', 2)

                                           if ( obj.refund_datetime ) {
                                             paymentDate = showFormattedDate(obj.refund_datetime, false, 'MMMM DD, Y');
                                           } else {
                                             paymentDate = (this.state.historyData && this.state.historyData.pos_transaction) && showFormattedDate(this.state.historyData.pos_transaction.transaction_datetime, false, 'MMMM DD, Y');
                                           }

                                           return (
                                             <tr key={`ref_`+idx}>
                                               <td>
                                                 <div style={{fontSize: '14px', color: '#777777', padding: '10px 0px'}}>
                                                   {paymentMode}
                                                   <br/> {this.state.globalLang.inv_refund_reason} : {(obj.refund_reason) ? obj.refund_reason.replace("_", " ") : ""}
                                                 </div>
                                               </td>
                                               <td align="right" style={{padding: '10px 0px'}}>
                                                 <div style={{fontSize: '13px', color: '#777777', textTransform: 'uppercase', textAlign: 'right'}}>{totalAmount}</div>
                                               </td>
                                             </tr>
                                           )
                                         }
                                       })
                                     }

                                   </tbody>
                                 </table> : ''}

                                 {(this.state.invoiceData && this.state.invoiceData.patientSignature) && <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '0px', borderTop: '1px solid #dddddd'}}>
                                   <tbody>
                                     <tr>
                                       <td style={{padding: '20px 10px'}} width="400">
                                         <div style={{fontSize: '13px', color: '#777777', width: '400px'}}>
                                            <img src={this.state.invoiceData.patientSignature} style={{width: '300px', display: 'inline-block'}} /><br/>
                                            <b>({(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.patient) && displayName(this.state.invoiceData.invoice_data.patient)})</b>
                                         </div>
                                       </td>
                                       <td width="400">
                  											   &nbsp;
                  										 </td>
                                     </tr>
                                   </tbody>
                                 </table>}

                                 <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '0px', marginBottom: '20px', borderTop: '1px solid #dddddd', borderBottom: '1px solid #dddddd'}}>
                                   <tbody>
                                     <tr>
                                       <td style={{padding: '20px 10px'}}>
                                         <div style={{fontSize: '13px', color: '#777777'}}>
                                           {(this.state.invoiceData && this.state.invoiceData.invoice_text) && this.state.invoiceData.invoice_text}
                                         </div>
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>

                                 <table border={0} cellPadding={10} cellSpacing={0} width={700} style={{marginTop: '-10px'}}>
                                   <tbody>
                                     <tr>
                                       <td width={400}>
                                         <div style={{fontSize: '18px', fontWeight: 600, color: '#000000'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.clinic) ? capitalizeFirstLetter(this.state.invoiceData.invoice_data.clinic.clinic_name) : ''}</div>
                                       </td>
                                       <td width={400} align="right">
                                         <div style={{fontSize: '14px', fontWeight: 600, color: '#777777', textAlign: 'right'}}>{(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.clinic) ? capitalizeFirstLetter(this.state.invoiceData.invoice_data.clinic.contact_no) : ''}</div>
                                       </td>
                                     </tr>
                                   </tbody>
                                 </table>
                               </td>
                             </tr>
                           </tbody>
                         </table>
                         <br />
                       </td>
                     </tr>
                   </tbody>
                 </table>
               </center>
              </div>
             </div>
             <div className="footer-static invoice-footer">

               {(this.state.invoiceData && this.state.invoiceData.invoice_data && this.state.invoiceData.invoice_data.invoice_status !== 'draft') && <div className="dropdown pull-right m-l-5">
                 <button className="line-btn no-margin" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{this.state.globalLang.inv_more_info}
                   <i className="fas fa-angle-down" />
                 </button>
                 <ul className="dropdown-menu">
                   <li onClick={() => this.printOrDownloadInvoice(0)}><a>{this.state.globalLang.label_download}</a></li>

                   {/*(this.state.invoiceData && this.state.invoiceData.invoice_data && (this.state.invoiceData.invoice_data.invoice_status === 'refunded'  || this.state.invoiceData.invoice_data.invoice_status === 'partial_refunded')) && <li onClick={() => this.printOrDownloadReceipt(0)}><a>Download Refund Receipt</a></li>*/}

                   <li onClick={() => this.printOrDownloadInvoice(1)}><a>{this.state.globalLang.inv_email_to_client}</a></li>

                   {/*(this.state.invoiceData && this.state.invoiceData.invoice_data && (this.state.invoiceData.invoice_data.invoice_status === 'refunded' || this.state.invoiceData.invoice_data.invoice_status === 'partial_refunded')) && <li onClick={() => this.printOrDownloadReceipt(1)}><a>Email Refund Receipt</a></li>*/}

                   <li onClick={() => this.printInvoice()}><a>{this.state.globalLang.inv_print}</a></li>

                   {/*(this.state.invoiceData && this.state.invoiceData.invoice_data && (this.state.invoiceData.invoice_data.invoice_status === 'refunded' || this.state.invoiceData.invoice_data.invoice_status === 'partial_refunded')) && <li onClick={() => this.printInvoice()}><a>Print Refund Receipt</a></li>*/}
                 </ul>
               </div>}
               {(refundOptions === 'paid' && showHideRefundBtn === false) && <a onClick={() => this.showRefundModal()} className="blue-btn pull-right">{this.state.globalLang.inv_issue_refund}</a>}
               {(refundOptions === 'paid' && showHideRefundBtn) && <a onClick={() => {this.setState({showIssueConfirmationModal: true})}} className="blue-btn pull-right">{this.state.globalLang.inv_issue_refund}</a>}
               {(showPaymentHistory) && <a onClick={() => this.showPaymentHistory()} className="blue-btn pull-right">{this.state.globalLang.inv_payment_history}</a>}
               {(showVoid && this.state.showLoader === false) && <a className="blue-btn pull-right" onClick={() => this.showConfirmationModal()}>{this.state.globalLang.inv_void}</a>}
             </div>
           </div>
         </div>
         <div className={(this.state.showIssueConfirmationModal === true ) ? 'overlay' : ''}></div>
         <div id="filterModal" role="dialog" className={(this.state.showIssueConfirmationModal === true) ? 'modal fade in displayBlock' : 'modal fade no-display'}>
           <div className="modal-dialog">
             <div className="modal-content">
               <div className="modal-header">
                 <button type="button" className="close" data-dismiss="modal" onClick={() => {this.setState({showIssueConfirmationModal: false})}}>×</button>
                 <h4 className="modal-title">{this.state.globalLang.delete_confirmation}</h4>
               </div>
               <div className="modal-body add-patient-form filter-patient">
                 {this.state.globalLang.inv_are_you_sure_you_want_to_refund}
               </div>
               <div className="modal-footer" >
                 <div className="col-md-12 text-left">
                   <button type="button" className="btn  logout pull-right" data-dismiss="modal" onClick={() => {this.setState({showIssueConfirmationModal: false})}}>{this.state.globalLang.label_no}</button>
                   <button type="button" className="btn btn-success pull-right m-r-10" data-dismiss="modal" onClick={this.refundIssue}>{this.state.globalLang.label_yes}</button>
                 </div>
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
      </div>
    )
  }
}

function mapStateToProps(state) {
  const languageData = JSON.parse(localStorage.getItem('languageData'));
  const returnState  = {};

  if ( state.InvoiceReducer.action === "GET_INVOICE_DETAILS" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
    } else {
      returnState.invoiceData = state.InvoiceReducer.data;
    }
  }

  if ( state.InvoiceReducer.action === "GET_PAYMENT_HISTORY" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      returnState.historyData = state.InvoiceReducer.data;
    } else {
      returnState.historyData = state.InvoiceReducer.data;
    }
  }

  if ( state.InvoiceReducer.action === "VOID_INVOICE" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      returnState.voidData = state.InvoiceReducer.data;
    } else {
      returnState.voidData = state.InvoiceReducer.data;
    }
  }

  if ( state.InvoiceReducer.action === "EMAIL_AND_DOWNLOAD_INVOICE" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      returnState.sendAndDownloadInvoiceData = state.InvoiceReducer.data;
    } else {
      if ( state.InvoiceReducer.data.data.action_type === '1' ) {
        toast.success(languageData.global[state.InvoiceReducer.data.message]);
      }
      returnState.sendAndDownloadInvoiceData = state.InvoiceReducer.data;
    }
  }

  // if ( state.InvoiceReducer.action === "EMAIL_AND_DOWNLOAD_REFUND_RECEIPT" ) {
  //   if ( state.InvoiceReducer.data.status !== 200 ) {
  //     toast.error(languageData.global[state.InvoiceReducer.data.message]);
  //     returnState.sendAndDownloadReceiptData = state.InvoiceReducer.data;
  //   } else {
  //     returnState.sendAndDownloadReceiptData = state.InvoiceReducer.data;
  //   }
  // }

  if ( state.InvoiceReducer.action === "GET_REFUND_DETAILS" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      returnState.getRefundData = state.InvoiceReducer.data;
    } else {
      returnState.getRefundData = state.InvoiceReducer.data;
    }
  }

  if ( state.InvoiceReducer.action === "ISSUE_REFUND" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      returnState.payRefundData = state.InvoiceReducer.data;
    } else {
      toast.success(languageData.global[state.InvoiceReducer.data.message]);
      returnState.payRefundData = state.InvoiceReducer.data;
    }
  }

  if ( state.InvoiceReducer.action === "UPDATE_USER_IN_INVOICE" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      returnState.updateInvoiceUserData = state.InvoiceReducer.data;
    } else {
      toast.success(languageData.global[state.InvoiceReducer.data.message]);
      returnState.updateInvoiceUserData = state.InvoiceReducer.data;
    }
  }

  if ( state.InvoiceReducer.action === "SAVE_AND_SEND_EMAIL" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      returnState.saveAndSendData = state.InvoiceReducer.data;
    } else {
      toast.success(<div>{`Email saved successfully`}<br />Invoice is sent to customer email</div>);
      returnState.saveAndSendData = state.InvoiceReducer.data;
    }
  }

  if ( state.InvoiceReducer.action === "MONTHLY_MEMBERSHIP_ISSUE_REFUND" ) {
    if ( state.InvoiceReducer.data.status !== 200 ) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      returnState.memberShipRefundTimestamp = new Date()
    } else {
      toast.success(languageData.global[state.InvoiceReducer.data.message]);
      returnState.memberShipRefundTimestamp = new Date()
    }
  }

  if ( state.InvoiceReducer.action === 'EMPTY_DATA' ) {
    if ( state.InvoiceReducer.data.status !== 200) {
      toast.error(languageData.global[state.InvoiceReducer.data.message]);
      return {}
    } else {
      return {}
    }
  }

  return returnState
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({getInvoiceDetails: getInvoiceDetails, getPaymentHistory: getPaymentHistory, voidInvoice: voidInvoice, sendAndDownloadInvoice: sendAndDownloadInvoice, sendAndDownloadRefundReceipt: sendAndDownloadRefundReceipt, getRefundDetails: getRefundDetails, payRefund: payRefund, changeUserID: changeUserID, exportEmptyData: exportEmptyData, saveAndSendEmail: saveAndSendEmail, refundIssue:refundIssue}, dispatch)
}


export default connect(mapStateToProps, mapDispatchToProps) (InvoiceDetails);
